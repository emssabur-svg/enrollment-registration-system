
const API_URL = '/api/students';

const studentForm = document.getElementById('studentForm');
const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');

const totalStudents = document.getElementById('totalStudents');
const pendingStudents = document.getElementById('pendingStudents');
const enrolledStudents = document.getElementById('enrolledStudents');
const rejectedStudents = document.getElementById('rejectedStudents');

const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');

let students = [];

let editingStudentId = null;

async function loadStudents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Failed to load student records.');
        }

        students = await response.json();

        displayStudents(students);
        updateDashboard();

    } catch (error) {
        console.error('Error loading students:', error);

        studentTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    Unable to load student records.
                    Please check your server connection.
                </td>
            </tr>
        `;
    }
}

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function displayStudents(studentList) {

    if (studentList.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    No student records found.
                </td>
            </tr>
        `;
        return;
    }

    studentTableBody.innerHTML = studentList.map(student => {

        const status = student.enrollmentStatus || 'Pending';

        return `
            <tr>
                <td>${escapeHTML(student.studentId)}</td>
                <td>${escapeHTML(student.fullName)}</td>
                <td>${escapeHTML(student.email)}</td>
                <td>${escapeHTML(student.course)}</td>
                <td>${escapeHTML(student.yearLevel)}</td>
                <td>${escapeHTML(student.schoolYear)}</td>

                <td>
                    <span class="status-badge ${status.toLowerCase()}">
                        ${escapeHTML(status)}
                    </span>
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="edit-btn"
                            data-id="${escapeHTML(student._id)}"
                            type="button">
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            data-id="${escapeHTML(student._id)}"
                            type="button">
                            Delete
                        </button>

                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

studentForm.addEventListener('submit', async function(event) {

    event.preventDefault();

    const studentData = {
        studentId: document.getElementById('studentId').value.trim(),
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        course: document.getElementById('course').value,
        yearLevel: document.getElementById('yearLevel').value,
        schoolYear: document.getElementById('schoolYear').value.trim(),
        enrollmentStatus: document.getElementById('enrollmentStatus').value
    };

    if (Object.values(studentData).some(value => !value)) {
        alert('Please complete all required fields.');
        return;
    }

    try {

        submitBtn.disabled = true;

        let response;

        if (editingStudentId) {

            response = await fetch(
                `${API_URL}/${encodeURIComponent(editingStudentId)}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(studentData)
                }
            );

        } else {

            response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });

        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Something went wrong.');
        }

        if (editingStudentId) {
            alert('Student information successfully updated!');
        } else {
            alert('Student successfully registered!');
        }

        studentForm.reset();
        editingStudentId = null;
        submitBtn.textContent = '+ Register Student';

        await loadStudents();

    } catch (error) {

        alert(error.message);
        console.error('Error:', error);

    } finally {

        submitBtn.disabled = false;

    }

});

async function editStudent(id) {

    try {

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`
        );

        const student = await response.json();

        if (!response.ok) {
            throw new Error(student.message || 'Student not found.');
        }

        document.getElementById('studentId').value = student.studentId;
        document.getElementById('fullName').value = student.fullName;
        document.getElementById('email').value = student.email;
        document.getElementById('course').value = student.course;
        document.getElementById('yearLevel').value = student.yearLevel;
        document.getElementById('schoolYear').value = student.schoolYear;
        document.getElementById('enrollmentStatus').value =
            student.enrollmentStatus;

        editingStudentId = student._id;

        submitBtn.textContent = 'Update Student';

        document.getElementById('registration').scrollIntoView({
            behavior: 'smooth'
        });

    } catch (error) {

        alert(error.message);
        console.error('Edit error:', error);

    }
}

async function deleteStudent(id) {

    const confirmDelete = confirm(
        'Are you sure you want to delete this student record?'
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`,
            {
                method: 'DELETE'
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Unable to delete student.');
        }

        alert('Student record successfully deleted!');

        if (editingStudentId === id) {
            studentForm.reset();
            editingStudentId = null;
            submitBtn.textContent = '+ Register Student';
        }

        await loadStudents();

    } catch (error) {

        alert(error.message);
        console.error('Delete error:', error);

    }
}

searchInput.addEventListener('input', function() {

    const searchValue = this.value.toLowerCase().trim();

    const filteredStudents = students.filter(student => {

        return (
            student.studentId.toLowerCase().includes(searchValue) ||
            student.fullName.toLowerCase().includes(searchValue) ||
            student.email.toLowerCase().includes(searchValue) ||
            student.course.toLowerCase().includes(searchValue) ||
            student.yearLevel.toLowerCase().includes(searchValue)
        );

    });

    displayStudents(filteredStudents);

});

function updateDashboard() {

    const total = students.length;

    const pending = students.filter(student =>
        student.enrollmentStatus === 'Pending'
    ).length;

    const enrolled = students.filter(student =>
        student.enrollmentStatus === 'Enrolled'
    ).length;

    const rejected = students.filter(student =>
        student.enrollmentStatus === 'Rejected'
    ).length;

    totalStudents.textContent = total;
    pendingStudents.textContent = pending;
    enrolledStudents.textContent = enrolled;
    rejectedStudents.textContent = rejected;

}

studentTableBody.addEventListener('click', function(event) {

    const editButton = event.target.closest('.edit-btn');
    const deleteButton = event.target.closest('.delete-btn');

    if (editButton) {
        editStudent(editButton.dataset.id);
    }

    if (deleteButton) {
        deleteStudent(deleteButton.dataset.id);
    }

});

studentForm.addEventListener('reset', function() {

    editingStudentId = null;

    submitBtn.textContent = '+ Register Student';

});


document.addEventListener('DOMContentLoaded', function() {

    loadStudents();

    console.log('Enrollment Registration System initialized!');

});

const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        const confirmed = confirm('Are you sure you want to logout?');

        if (!confirmed) return;

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Unable to logout.');
            }

            window.location.replace('/');

        } catch (error) {
            alert(error.message);
        }
    });
}
