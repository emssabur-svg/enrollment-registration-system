
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

    enrollmentStatus: {
        type: String,
        enum: ['Pending', 'Enrolled', 'Rejected'],
        default: 'Pending'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);