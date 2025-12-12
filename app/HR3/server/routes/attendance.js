const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { date, userId, status, startDate, endDate } = req.query;
        let query = {};

        if (userId) query.userId = userId;
        if (status) query.status = status;
        if (date) {
            const d = new Date(date);
            query.date = {
                $gte: new Date(d.setHours(0, 0, 0, 0)),
                $lt: new Date(d.setHours(23, 59, 59, 999))
            };
        }
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate('userId', 'name email role department')
            .sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get my attendance
// @route   GET /api/attendance/me
// @access  Private
router.get('/me', async (req, res) => {
    try {
        const attendance = await Attendance.find({ userId: req.user._id })
            .sort({ date: -1 })
            .limit(30);
        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Clock in
// @route   POST /api/attendance/clock-in
// @access  Private
router.post('/clock-in', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            userId: req.user._id,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (attendance && attendance.timeIn) {
            return res.status(400).json({ message: 'Already clocked in today' });
        }

        if (!attendance) {
            attendance = new Attendance({
                userId: req.user._id,
                date: today,
                timeIn: new Date(),
                status: 'present'
            });
        } else {
            attendance.timeIn = new Date();
        }

        // Check if late (after 9:00 AM) and calculate late minutes
        const now = new Date();
        const nineAM = new Date(today);
        nineAM.setHours(9, 0, 0, 0);

        if (now > nineAM) {
            attendance.status = 'late';
            // Calculate minutes late
            const lateMs = now.getTime() - nineAM.getTime();
            attendance.lateMinutes = Math.floor(lateMs / (1000 * 60));
        }

        await attendance.save();
        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Clock out
// @route   POST /api/attendance/clock-out
// @access  Private
router.post('/clock-out', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            userId: req.user._id,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (!attendance || !attendance.timeIn) {
            return res.status(400).json({ message: 'Must clock in first' });
        }

        if (attendance.timeOut) {
            return res.status(400).json({ message: 'Already clocked out today' });
        }

        attendance.timeOut = new Date();

        // Calculate hours worked
        const hoursWorked = (attendance.timeOut - attendance.timeIn) / (1000 * 60 * 60);
        attendance.hoursWorked = Math.round(hoursWorked * 100) / 100;

        // Calculate overtime (over 8 hours) or undertime (under 8 hours)
        if (hoursWorked > 8) {
            attendance.overtime = Math.round((hoursWorked - 8) * 100) / 100;
        } else if (hoursWorked < 8) {
            // Calculate undertime in minutes
            const undertimeHours = 8 - hoursWorked;
            attendance.undertimeMinutes = Math.round(undertimeHours * 60);
        }

        await attendance.save();
        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create/Update attendance (admin)
// @route   POST /api/attendance
// @access  Private/Admin
router.post('/', authorize('superadmin', 'hradmin'), async (req, res) => {
    try {
        const { userId, date, timeIn, timeOut, status, notes } = req.body;

        const d = new Date(date);
        d.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            userId,
            date: { $gte: d, $lt: new Date(d.getTime() + 24 * 60 * 60 * 1000) }
        });

        if (attendance) {
            attendance.timeIn = timeIn || attendance.timeIn;
            attendance.timeOut = timeOut || attendance.timeOut;
            attendance.status = status || attendance.status;
            attendance.notes = notes || attendance.notes;
        } else {
            attendance = new Attendance({
                userId,
                date: d,
                timeIn,
                timeOut,
                status,
                notes
            });
        }

        if (attendance.timeIn && attendance.timeOut) {
            const hoursWorked = (new Date(attendance.timeOut) - new Date(attendance.timeIn)) / (1000 * 60 * 60);
            attendance.hoursWorked = Math.round(hoursWorked * 100) / 100;
        }

        await attendance.save();
        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
