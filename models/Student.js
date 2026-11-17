
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    birthDate: {
        type: Date,
        default: null
    },

    gender: {
        type: String,
        default: ''
    },

    address: {
        type: String,
        default: '',
        trim: true
    },

    contactNumber: {
        type: String,
        default: '',
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    course: {
        type: String,
        required: true
    },

    yearLevel: {
        type: String,
        required: true
    },

    schoolYear: {
        type: String,
        required: true
    },

    gwa: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },

    enrollmentStatus: {
        type: String,
        enum: ['Pending', 'Enrolled', 'Rejected'],
        default: 'Pending'
    },

    enrollmentApplication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment',
        unique: true,
        sparse: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);