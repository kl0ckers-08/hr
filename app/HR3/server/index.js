const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS - Allow all origins for development (no credentials needed, using JWT in headers)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'HR3 API is running' });
});

// Global error handler - catches any unhandled errors
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        message: 'Internal server error', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
