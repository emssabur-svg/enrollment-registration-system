
const express = require('express');
const crypto = require('crypto');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        console.log('ENROLLMENT SUBMISSION RECEIVED:');
        const {
            firstName,
            lastName,
            middleName,
            birthDate,
            gender,
            address,
            contactNumber,
            email,
            course,
            yearLevel,
            schoolYear
        } = req.body;

        if (
            !firstName || !lastName || !birthDate ||
            !gender || !address || !contactNumber ||
            !email || !course || !yearLevel || !schoolYear
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all required fields.'
            });
        }

        const applicationNumber =
            'ENR-' + Date.now() + '-' +
            crypto.randomBytes(3).toString('hex').toUpperCase();

        const application = await Enrollment.create({
            applicationNumber,
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            middleName: String(middleName || '').trim(),
            birthDate,
            gender,
            address: String(address).trim(),
            contactNumber: String(contactNumber).trim(),
            email: String(email).trim().toLowerCase(),
            course,
            yearLevel,
            schoolYear,
            enrollmentStatus: 'Pending'
        });

        res.status(201).json({
            success: true,
            message: 'Enrollment application submitted successfully!',
            applicationNumber: application.applicationNumber
        });

    } catch (error) {
        console.error('Enrollment submission error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to submit application.'
        });
    }
});

router.get('/', requireAuth, async (req, res) => {
    try {
        const applications = await Enrollment.find()
            .sort({ createdAt: -1 });

        res.json(applications);

    } catch (error) {
        console.error('Load applications error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to load enrollment applications.'
        });
    }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
    try {
        const { enrollmentStatus } = req.body;

        if (!['Pending', 'Enrolled', 'Rejected'].includes(enrollmentStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid enrollment status.'
            });
        }

        const application = await Enrollment.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found.'
            });
        }

        if (enrollmentStatus === 'Enrolled') {
            const fullName = [
                application.firstName,
                application.middleName,
                application.lastName
            ].filter(Boolean).join(' ');

            const student = await Student.findOneAndUpdate(
                {
                    enrollmentApplication: application._id
                },
                {
                    $set: {
                        studentId: `STU-${application.applicationNumber}`,
                        fullName,
                        birthDate: application.birthDate,
                        gender: application.gender,
                        address: application.address,
                        contactNumber: application.contactNumber,
                        email: application.email,
                        course: application.course,
                        yearLevel: application.yearLevel,
                        schoolYear: application.schoolYear,
                        enrollmentStatus: 'Enrolled'
                    }
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );

            await Enrollment.findByIdAndDelete(application._id);

            return res.json({
                success: true,
                message: 'Student successfully enrolled! The student record, including personal information, has been saved and the enrollment application has been permanently deleted.',
                student
            });
        }

        application.enrollmentStatus = enrollmentStatus;
        await application.save();

        const existingStudent = await Student.findOne({
            enrollmentApplication: application._id
        });

        if (existingStudent) {
            existingStudent.enrollmentStatus = enrollmentStatus;
            await existingStudent.save();
        }

        res.json({
            success: true,
            message: 'Enrollment status updated successfully!',
            application
        });

    } catch (error) {
        console.error('Update status error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to update enrollment status.'
        });
    }
});

module.exports = router;