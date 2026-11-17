
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const bcrypt = require('bcryptjs');
const path = require('path');

const Admin = require('./models/admin');
const requireAuth = require('./middleware/authMiddleware');

const app = express();

if (
    !process.env.MONGODB_URI ||
    !process.env.SESSION_SECRET ||
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD
) {
    throw new Error('Please check your .env file. Required settings are missing.');
}

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow frontend CSS and JavaScript files
app.get('/assets/:filename', (req, res) => {
    const allowedFiles = [
        'style.css',
        'script.js',
        'login.css',
        'login.js',
        'apply.css',
        'apply.js'
    ];

    if (!allowedFiles.includes(req.params.filename)) {
        return res.sendStatus(404);
    }

    res.sendFile(
        path.join(__dirname, 'public', req.params.filename)
    );
});

// Session configuration
app.use(session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 60 * 60 * 8
    }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000
    }
}));

// Authentication routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Enrollment System API is running!'
    });
});

// Existing student routes
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', requireAuth, studentRoutes);

// NEW: Enrollment routes
const enrollmentRoutes = require('./routes/enrollmentRoutes');
app.use('/api/enrollments', enrollmentRoutes);

// Admin dashboard
app.get('/', (req, res) => {
    if (req.session.adminId) {
        return res.sendFile(
            path.join(__dirname, 'public', 'index.html')
        );
    }

    res.sendFile(
        path.join(__dirname, 'public', 'login.html')
    );
});

// NEW: Student enrollment page
app.get('/apply', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'apply.html')
    );
});

// Start server
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB connected successfully!');

        const passwordHash = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            12
        );

        await Admin.updateOne(
            { username: process.env.ADMIN_USERNAME },
            {
                $setOnInsert: {
                    username: process.env.ADMIN_USERNAME,
                    passwordHash: passwordHash
                }
            },
            { upsert: true }
        );

        console.log('Admin account is ready!');

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Server startup error:', error.message);
        process.exit(1);
    }
}

startServer();