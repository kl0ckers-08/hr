const express = require('express');
const Schedule = require('../models/Schedule');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};

        if (userId) query.userId = userId;

        const schedules = await Schedule.find(query)
            .populate('userId', 'name email role department')
            .sort({ dayOfWeek: 1 });
        res.json(schedules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get my schedule
// @route   GET /api/schedules/me
// @access  Private
router.get('/me', async (req, res) => {
    try {
        const schedules = await Schedule.find({ userId: req.user._id, isActive: true })
            .sort({ dayOfWeek: 1 });
        res.json(schedules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create schedule
// @route   POST /api/schedules
// @access  Private/Admin
router.post('/', authorize('superadmin', 'hradmin'), async (req, res) => {
    try {
        const { userId, shiftName, dayOfWeek, startTime, endTime } = req.body;

        const schedule = await Schedule.create({
            userId,
            shiftName,
            dayOfWeek,
            startTime,
            endTime
        });

        res.status(201).json(schedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private/Admin
router.put('/:id', authorize('superadmin', 'hradmin'), async (req, res) => {
    try {
        const { shiftName, dayOfWeek, startTime, endTime, isActive } = req.body;

        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        schedule.shiftName = shiftName || schedule.shiftName;
        schedule.dayOfWeek = dayOfWeek || schedule.dayOfWeek;
        schedule.startTime = startTime || schedule.startTime;
        schedule.endTime = endTime || schedule.endTime;
        schedule.isActive = isActive !== undefined ? isActive : schedule.isActive;

        await schedule.save();
        res.json(schedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private/Admin
router.delete('/:id', authorize('superadmin', 'hradmin'), async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Schedule deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Bulk create schedules for a user
// @route   POST /api/schedules/bulk
// @access  Private/Admin
router.post('/bulk', authorize('superadmin', 'hradmin'), async (req, res) => {
    try {
        const { userId, schedules } = req.body;

        // Delete existing schedules for user
        await Schedule.deleteMany({ userId });

        // Create new schedules
        const newSchedules = schedules.map(s => ({
            userId,
            shiftName: s.shiftName,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            isActive: true
        }));

        const created = await Schedule.insertMany(newSchedules);
        res.status(201).json(created);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
