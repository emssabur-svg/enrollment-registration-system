
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

// Check required environment variables
if (!process.env.MONGODB_URI ||
    !process.env.SESSION_SECRET ||
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD) {
    throw new Error('Please check your .env file. Required settings are missing.');
}

// Trust Render's proxy when deployed
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files from the assets folder
app.get('/assets/:filename', (req, res) => {
    const allowedFiles = [
        'style.css',
        'script.js',
        'login.css',
        'login.js'
    ];

    if (!allowedFiles.includes(req.params.filename)) {
        return res.sendStatus(404);
    }

    res.sendFile(
        path.join(__dirname, 'public', req.params.filename)
    );
});

// Login sessions stored in MongoDB
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

// Login and logout routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Check server status
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Enrollment System API is running!'
    });
});

// Protect student records
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', requireAuth, studentRoutes);

// Show login page or dashboard
app.get('/', (req, res) => {
    if (req.session.adminId) {
        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }

    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start server and create admin account
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
