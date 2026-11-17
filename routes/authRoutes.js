
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

        const admin = await Admin.findOne({
            username: username.trim()
        });

        if (!admin) {
            console.log('LOGIN CHECK: Admin account not found.');

            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        console.log('LOGIN CHECK: Admin account found.');

        const passwordMatch = await bcrypt.compare(
            password,
            admin.passwordHash
        );

        console.log('LOGIN CHECK: Password match:', passwordMatch);

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

            return res.status(200).json({
                success: true,
                message: 'Login successful!',
                username: admin.username
            });
        });

    } catch (error) {
        console.error('LOGIN ERROR:', error.message);

        return res.status(500).json({
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

    return res.json({
        authenticated: false
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('LOGOUT ERROR:', error);

            return res.status(500).json({
                success: false,
                message: 'Logout failed.'
            });
        }

        res.clearCookie('connect.sid', {
            path: '/'
        });

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully!'
        });
    });
});

module.exports = router;
