
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    applicationNumber: {
        type: String,
        unique: true,
        required: true
    },

    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    middleName: {
        type: String,
        trim: true,
        default: ''
    },

    birthDate: {
        type: Date,
        required: true
    },

    gender: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    contactNumber: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
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

    enrollmentStatus: {
        type: String,
        enum: ['Pending', 'Enrolled', 'Rejected'],
        default: 'Pending'
    },

    studentRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);