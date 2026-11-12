
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

router.post('/', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();

        res.status(201).json({
            message: 'Student successfully registered!',
            student
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Student ID already exists.'
            });
        }

        res.status(400).json({
            message: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const students = await Student.find().sort({
            createdAt: -1
        });

        res.json(students);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: 'Student not found.'
            });
        }

        res.json(student);
    } catch (error) {
        res.status(400).json({
            message: 'Invalid student ID.'
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: 'Student not found.'
            });
        }

        res.json({
            message: 'Student information updated!',
            student
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Student ID already exists.'
            });
        }

        res.status(400).json({
            message: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                message: 'Student not found.'
            });
        }

        res.json({
            message: 'Student successfully deleted!'
        });
    } catch (error) {
        res.status(400).json({
            message: 'Invalid student ID.'
        });
    }
});

module.exports = router;