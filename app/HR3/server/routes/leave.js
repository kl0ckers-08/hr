const express = require('express');
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// @desc    Get all leave requests
// @route   GET /api/leave
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { status, userId, type } = req.query;
        let query = {};

        // Non-admins can only see their own
        if (!['superadmin', 'hradmin', 'dean'].includes(req.user.role)) {
            query.userId = req.user._id;
        } else if (userId) {
            query.userId = userId;
        }

        if (status) query.status = status;
        if (type) query.type = type;

        const leaves = await Leave.find(query)
            .populate('userId', 'name email role department')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get my leave requests
// @route   GET /api/leave/me
// @access  Private
router.get('/me', async (req, res) => {
    try {
        const leaves = await Leave.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create leave request
// @route   POST /api/leave
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;

        // Calculate total days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const leave = await Leave.create({
            userId: req.user._id,
            type,
            startDate,
            endDate,
            totalDays,
            reason
        });

        res.status(201).json(leave);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Approve/Reject leave request
// @route   PUT /api/leave/:id/status
// @access  Private/Admin
router.put('/:id/status', authorize('superadmin', 'hradmin', 'dean'), async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (leave.status !== 'pending') {
            return res.status(400).json({ message: 'Leave request already processed' });
        }

        leave.status = status;
        leave.remarks = remarks || '';
        leave.approvedBy = req.user._id;
        leave.approvedAt = new Date();

        await leave.save();
        res.json(leave);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Cancel leave request
// @route   DELETE /api/leave/:id
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Only owner or admin can cancel
        if (leave.userId.toString() !== req.user._id.toString() && !['superadmin', 'hradmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (leave.status === 'approved') {
            return res.status(400).json({ message: 'Cannot cancel approved leave' });
        }

        await Leave.findByIdAndDelete(req.params.id);
        res.json({ message: 'Leave request cancelled' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
