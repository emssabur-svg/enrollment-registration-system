
const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please enter your username and password.'
            });
        }

        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            admin.passwordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        req.session.adminId = admin._id.toString();
        req.session.adminUsername = admin.username;

        req.session.save((error) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Unable to create login session.'
                });
            }

            res.json({
                success: true,
                message: 'Login successful!',
                username: admin.username
            });
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login error.'
        });
    }
});

router.get('/me', (req, res) => {
    if (req.session && req.session.adminId) {
        return res.json({
            authenticated: true,
            username: req.session.adminUsername
        });
    }

    res.json({
        authenticated: false
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Logout failed.'
            });
        }

        res.clearCookie('connect.sid');

        res.json({
            success: true,
            message: 'Logged out successfully!'
        });
    });
});

module.exports = router;
