const express = require('express');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// @desc    Get all payroll records
// @route   GET /api/payroll
// @access  Private/Admin
router.get('/', authorize('superadmin', 'hradmin'), async (req, res) => {
    try {
        const { period, status, userId } = req.query;
        let query = {};

        if (period) query.period = period;
        if (status) query.status = status;
        if (userId) query.userId = userId;

        const payrolls = await Payroll.find(query)
            .populate('userId', 'name email role department')
            .sort({ createdAt: -1 });
        res.json(payrolls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get my payslips
// @route   GET /api/payroll/me
// @access  Private
router.get('/me', async (req, res) => {
    try {
        const payrolls = await Payroll.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(payrolls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get single payroll record
// @route   GET /api/payroll/:id
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id)
            .populate('userId', 'name email role department');

        if (!payroll) {
            return res.status(404).json({ message: 'Payroll record not found' });
        }

        // Only owner or admin can view
        if (payroll.userId._id.toString() !== req.user._id.toString() &&
            !['superadmin', 'hradmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(payroll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create payroll record
// @route   POST /api/payroll
// @access  Private/Admin
router.post('/', authorize('superadmin', 'hradmin'), async (req, res) => {
    try {
        const {
            userId, period, basicSalary, overtimePay, allowances,
            deductions
        } = req.body;

        // Calculate totals
        const grossPay = basicSalary + (overtimePay || 0) + (allowances || 0);
        const totalDeductions = deductions ?
            (deductions.sss || 0) + (deductions.philhealth || 0) +
            (deductions.pagibig || 0) + (deductions.tax || 0) +
            (deductions.tardiness || 0) + (deductions.other || 0) : 0;
        const netPay = grossPay - totalDeductions;

        const payroll = await Payroll.create({
            userId,
            period,
            basicSalary,
            overtimePay,
            allowances,
            grossPay,
            deductions,
            totalDeductions,
            netPay
        });

        res.status(201).json(payroll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update payroll status
// @route   PUT /api/payroll/:id
// @access  Private/Admin
router.put('/:id', authorize('superadmin', 'hradmin'), async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) {
            return res.status(404).json({ message: 'Payroll record not found' });
        }

        const { status, ...updates } = req.body;

        Object.keys(updates).forEach(key => {
            payroll[key] = updates[key];
        });

        if (status) {
            payroll.status = status;
            if (status === 'paid') {
                payroll.paidAt = new Date();
            }
        }

        // Recalculate if salary fields changed
        if (updates.basicSalary || updates.overtimePay || updates.allowances) {
            payroll.grossPay = payroll.basicSalary + (payroll.overtimePay || 0) + (payroll.allowances || 0);
        }
        if (updates.deductions) {
            payroll.totalDeductions =
                (payroll.deductions.sss || 0) + (payroll.deductions.philhealth || 0) +
                (payroll.deductions.pagibig || 0) + (payroll.deductions.tax || 0) +
                (payroll.deductions.tardiness || 0) + (payroll.deductions.other || 0);
        }
        payroll.netPay = payroll.grossPay - payroll.totalDeductions;

        await payroll.save();
        res.json(payroll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete payroll record
// @route   DELETE /api/payroll/:id
// @access  Private/SuperAdmin
router.delete('/:id', authorize('superadmin'), async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) {
            return res.status(404).json({ message: 'Payroll record not found' });
        }

        await Payroll.findByIdAndDelete(req.params.id);
        res.json({ message: 'Payroll record deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Generate payroll for all employees
// @route   POST /api/payroll/generate
// @access  Private/Admin
router.post('/generate', authorize('superadmin', 'hradmin'), async (req, res) => {
    try {
        const { period, basicSalary = 25000 } = req.body;

        const users = await User.find({ role: { $in: ['lecturer', 'adminstaff'] } });

        const payrolls = [];

        // Tardiness rate: ₱50 per 30 minutes of late/undertime
        const TARDINESS_RATE_PER_30_MIN = 50;

        for (const user of users) {
            // Check if payroll already exists for this period
            const exists = await Payroll.findOne({ userId: user._id, period });
            if (!exists) {
                // Fetch attendance records for this user (last 30 days as default period)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const attendanceRecords = await Attendance.find({
                    userId: user._id,
                    date: { $gte: thirtyDaysAgo }
                });

                // Calculate total tardiness (late + undertime) in minutes
                let totalLateMinutes = 0;
                let totalUndertimeMinutes = 0;

                for (const record of attendanceRecords) {
                    totalLateMinutes += record.lateMinutes || 0;
                    totalUndertimeMinutes += record.undertimeMinutes || 0;
                }

                const totalTardinessMinutes = totalLateMinutes + totalUndertimeMinutes;
                // Calculate deduction: ₱50 per 30 minutes
                const tardinessDeduction = Math.floor(totalTardinessMinutes / 30) * TARDINESS_RATE_PER_30_MIN;

                const grossPay = basicSalary;
                const deductions = {
                    sss: basicSalary * 0.045,
                    philhealth: basicSalary * 0.02,
                    pagibig: 100,
                    tax: basicSalary * 0.1,
                    tardiness: tardinessDeduction,
                    other: 0
                };
                const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

                const payroll = await Payroll.create({
                    userId: user._id,
                    period,
                    basicSalary,
                    grossPay,
                    deductions,
                    totalDeductions,
                    netPay: grossPay - totalDeductions
                });
                payrolls.push(payroll);
            }
        }

        res.status(201).json({ message: `Generated ${payrolls.length} payroll records`, payrolls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
