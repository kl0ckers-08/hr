const express = require('express');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
router.get('/', authorize('superadmin'), async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category) query.category = category;

        const settings = await Settings.find(query).sort({ category: 1, key: 1 });

        // Convert to object for easier frontend use
        const settingsObj = {};
        settings.forEach(s => {
            if (!settingsObj[s.category]) settingsObj[s.category] = {};
            settingsObj[s.category][s.key] = s.value;
        });

        res.json({ settings, settingsObj });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get single setting by key
// @route   GET /api/settings/:key
// @access  Private
router.get('/:key', async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: req.params.key });
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        res.json(setting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create or update setting
// @route   POST /api/settings
// @access  Private/SuperAdmin
router.post('/', authorize('superadmin'), async (req, res) => {
    try {
        const { key, value, category, description } = req.body;

        let setting = await Settings.findOne({ key });

        if (setting) {
            setting.value = value;
            setting.category = category || setting.category;
            setting.description = description || setting.description;
            setting.updatedAt = new Date();
        } else {
            setting = new Settings({
                key,
                value,
                category,
                description
            });
        }

        await setting.save();
        res.json(setting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Bulk update settings
// @route   PUT /api/settings/bulk
// @access  Private/SuperAdmin
router.put('/bulk', authorize('superadmin'), async (req, res) => {
    try {
        const { settings } = req.body;

        const updated = [];
        for (const s of settings) {
            let setting = await Settings.findOne({ key: s.key });
            if (setting) {
                setting.value = s.value;
                setting.updatedAt = new Date();
            } else {
                setting = new Settings({
                    key: s.key,
                    value: s.value,
                    category: s.category || 'general',
                    description: s.description || ''
                });
            }
            await setting.save();
            updated.push(setting);
        }

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete setting
// @route   DELETE /api/settings/:key
// @access  Private/SuperAdmin
router.delete('/:key', authorize('superadmin'), async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: req.params.key });
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        await Settings.findByIdAndDelete(setting._id);
        res.json({ message: 'Setting deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
