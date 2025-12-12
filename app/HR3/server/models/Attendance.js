const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeIn: {
        type: Date,
        default: null
    },
    timeOut: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
        default: 'present'
    },
    hoursWorked: {
        type: Number,
        default: 0
    },
    overtime: {
        type: Number,
        default: 0
    },
    lateMinutes: {
        type: Number,
        default: 0
    },
    undertimeMinutes: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for user and date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
