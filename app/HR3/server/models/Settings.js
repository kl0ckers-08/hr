const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'payroll', 'attendance', 'leave', 'notifications', 'security'],
        default: 'general'
    },
    description: {
        type: String,
        default: ''
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', settingsSchema);
