const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    period: {
        type: String,
        required: true // e.g., "November 1-15, 2025"
    },
    basicSalary: {
        type: Number,
        required: true
    },
    overtimePay: {
        type: Number,
        default: 0
    },
    allowances: {
        type: Number,
        default: 0
    },
    grossPay: {
        type: Number,
        required: true
    },
    deductions: {
        sss: { type: Number, default: 0 },
        philhealth: { type: Number, default: 0 },
        pagibig: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        tardiness: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    totalDeductions: {
        type: Number,
        default: 0
    },
    netPay: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'paid'],
        default: 'pending'
    },
    paidAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payroll', payrollSchema);
