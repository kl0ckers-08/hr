const express = require('express');
const User = require('../models/User');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
router.get('/stats', authorize('superadmin', 'hradmin'), async (req, res) => {
    try {
        // Get counts
        const totalUsers = await User.countDocuments();
        const totalDepartments = await Department.countDocuments({ status: 'active' });

        // Today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const presentToday = await Attendance.countDocuments({
            date: { $gte: today, $lte: todayEnd },
            status: { $in: ['present', 'late'] }
        });

        // Pending leave requests
        const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

        // Current month payroll
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        const payrollData = await Payroll.aggregate([
            { $group: { _id: null, total: { $sum: '$netPay' } } }
        ]);
        const totalPayroll = payrollData.length > 0 ? payrollData[0].total : 0;

        // User by role
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // Recent activity
        const recentUsers = await User.find()
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalUsers,
            totalDepartments,
            presentToday,
            pendingLeaves,
            totalPayroll,
            usersByRole,
            recentUsers,
            systemUptime: '99.9%',
            databaseStatus: 'healthy'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get attendance summary
// @route   GET /api/dashboard/attendance-summary
// @access  Private/Admin
router.get('/attendance-summary', authorize('superadmin', 'hradmin', 'dean'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const summary = await Attendance.aggregate([
            { $match: { date: { $gte: weekAgo } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json(summary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get leave summary
// @route   GET /api/dashboard/leave-summary
// @access  Private/Admin
router.get('/leave-summary', authorize('superadmin', 'hradmin', 'dean'), async (req, res) => {
    try {
        const summary = await Leave.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const pendingDetails = await Leave.find({ status: 'pending' })
            .populate('userId', 'name department')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({ summary, pendingDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
