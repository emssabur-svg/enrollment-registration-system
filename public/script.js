
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
                    <span class="status-badge ${escapeHTML(status.toLowerCase())}">
                        ${escapeHTML(status)}
                    </span>
 
                    </td>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" data-id="${escapeHTML(student._id)}" type="button">
                            View
                        </button>
                        <button class="edit-btn" data-id="${escapeHTML(student._id)}" type="button">
                            Edit
                        </button>
                        <button class="delete-btn" data-id="${escapeHTML(student._id)}" type="button">
                            Delete
 
                            </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openStudentDetails(id) {
    const student = students.find(item => item._id === id);

    if (!student) {
        alert('Student record not found.');
        return;
    }

    const details = {
        detailStudentId: student.studentId,
        detailFullName: student.fullName,
        detailBirthDate: student.birthDate
            ? new Date(student.birthDate).toLocaleDateString()
            : '',
        detailGender: student.gender,
        detailEmail: student.email,
        detailContactNumber: student.contactNumber,
        detailAddress: student.address,
        detailCourse: student.course,
        detailYearLevel: student.yearLevel,
        detailSchoolYear: student.schoolYear,
        detailEnrollmentStatus: student.enrollmentStatus
    };

    Object.entries(details).forEach(([elementId, value]) => {
        const element = document.getElementById(elementId);

        if (element) {
            element.textContent = value || 'Not provided';
        }
    });

    document.getElementById('studentDetailsModal').style.display = 'flex';
}

function closeStudentDetails() {
    document.getElementById('studentDetailsModal').style.display = 'none';
}

document.getElementById('closeStudentDetails').addEventListener(
    'click',
    closeStudentDetails
);

document.getElementById('closeStudentDetailsBtn').addEventListener(
    'click',
    closeStudentDetails
);

document.getElementById('studentDetailsModal').addEventListener(
    'click',
    function(event) {
        if (event.target === this) {
            closeStudentDetails();
        }
    }
);

function getStudentFormData() {
    return {
        studentId: document.getElementById('studentId').value.trim(),
        fullName: document.getElementById('fullName').value.trim(),
        birthDate: document.getElementById('birthDate').value || null,
        gender: document.getElementById('gender').value,
        email: document.getElementById('email').value.trim(),
        contactNumber: document.getElementById('contactNumber').value.trim(),
        address: document.getElementById('address').value.trim(),
        course: document.getElementById('course').value,
        yearLevel: document.getElementById('yearLevel').value,
        schoolYear: document.getElementById('schoolYear').value.trim(),
        enrollmentStatus: document.getElementById('enrollmentStatus').value
    };
}

studentForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const studentData = getStudentFormData();

    if (
        !studentData.studentId ||
        !studentData.fullName ||
        !studentData.email ||
        !studentData.course ||
        !studentData.yearLevel ||
        !studentData.schoolYear ||
        !studentData.enrollmentStatus
    ) {
        alert('Please complete all required fields.');
        return;
    }

    try {
        
        submitBtn.disabled = true;

        const response = await fetch(
            editingStudentId
                ? `${API_URL}/${encodeURIComponent(editingStudentId)}`
                : API_URL,
            {
                method: editingStudentId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            }
        );



        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Something went wrong.');
        }

        alert(
            editingStudentId
                ? 'Student information successfully updated!'
                : 'Student successfully registered!'
        );

        studentForm.reset();
        editingStudentId = null;
        submitBtn.textContent = '+ Register Student';

        await loadStudents();

    } catch (error) {

        alert(error.message);
        console.error('Student form error:', error);

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

        document.getElementById('studentId').value = student.studentId || '';
        document.getElementById('fullName').value = student.fullName || '';

        document.getElementById('birthDate').value = student.birthDate
            ? new Date(student.birthDate).toISOString().split('T')[0]
            : '';

        document.getElementById('gender').value = student.gender || '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('contactNumber').value = student.contactNumber || '';
        document.getElementById('address').value = student.address || '';
        document.getElementById('course').value = student.course || '';
        document.getElementById('yearLevel').value = student.yearLevel || '';
        document.getElementById('schoolYear').value = student.schoolYear || '';
        document.getElementById('enrollmentStatus').value =
            student.enrollmentStatus || 'Pending';

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

    if (!confirmDelete) return;

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
            String(student.studentId || '').toLowerCase().includes(searchValue) ||
            String(student.fullName || '').toLowerCase().includes(searchValue) ||
            String(student.email || '').toLowerCase().includes(searchValue) ||
            String(student.course || '').toLowerCase().includes(searchValue) ||
            String(student.yearLevel || '').toLowerCase().includes(searchValue)
        );

    });

    displayStudents(filteredStudents);

});

function updateDashboard() {
    totalStudents.textContent = students.length;

    pendingStudents.textContent = students.filter(student =>
        student.enrollmentStatus === 'Pending'
    ).length;

    enrolledStudents.textContent = students.filter(student =>
        student.enrollmentStatus === 'Enrolled'
    ).length;

    rejectedStudents.textContent = students.filter(student =>
        student.enrollmentStatus === 'Rejected'
    ).length;


}

studentTableBody.addEventListener('click', function(event) {
    const viewButton = event.target.closest('.view-btn');
    const editButton = event.target.closest('.edit-btn');
    const deleteButton = event.target.closest('.delete-btn');

    if (viewButton) {
        openStudentDetails(viewButton.dataset.id);
    }

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

(() => {
    const applicationTableBody =
        document.getElementById('applicationTableBody');

    const refreshApplications =
        document.getElementById('refreshApplications');

    const applicationSearch =
        document.getElementById('applicationSearch');

    const courseFilter =
        document.getElementById('courseFilter');

    const statusFilter =
        document.getElementById('statusFilter');

    const resetApplicationFilters =
        document.getElementById('resetApplicationFilters');

    if (!applicationTableBody) return;

    let allApplications = [];

    function updateEnrollmentStatistics(applications) {
        document.getElementById('totalApplications').textContent =
            applications.length;

        document.getElementById('pendingApplications').textContent =
            applications.filter(app => app.enrollmentStatus === 'Pending').length;

        document.getElementById('enrolledApplications').textContent =
            applications.filter(app => app.enrollmentStatus === 'Enrolled').length;

        document.getElementById('rejectedApplications').textContent =
            applications.filter(app => app.enrollmentStatus === 'Rejected').length;
    }

    async function loadApplications() {
        applicationTableBody.innerHTML = `
            <tr>
                <td colspan="8">Loading applications...</td>
            </tr>
        `;

        try {
            const response = await fetch('/api/enrollments');

            if (response.status === 401 || response.status === 403) {
                window.location.href = '/';
                return;
            }

            if (!response.ok) {
                throw new Error('Unable to retrieve applications.');
            }

            allApplications = await response.json();

            updateEnrollmentStatistics(allApplications);
            filterApplications();

        } catch (error) {
            console.error('Application loading error:', error);

            applicationTableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Failed to load applications. Please refresh.
                    </td>
                </tr>
            `;
        }
    }

    function filterApplications() {
        const searchValue = applicationSearch.value.toLowerCase().trim();
        const selectedCourse = courseFilter.value;
        const selectedStatus = statusFilter.value;

        const courseNames = {
            BSIT: 'BS Information Technology',
            BSCS: 'BS Computer Science',
            BSBA: 'BS Business Administration',
            BSED: 'BS Secondary Education',
            BEED: 'BS Elementary Education'
        };

        const filteredApplications = allApplications.filter(application => {
            const fullName = [
                application.firstName,
                application.middleName,
                application.lastName
            ].filter(Boolean).join(' ');

            const applicationNumber =
                String(application.applicationNumber || '').toLowerCase();

            const applicantName = fullName.toLowerCase();

            const applicantEmail =
                String(application.email || '').toLowerCase();

            const course =
                String(application.course || '').toLowerCase();

            const yearLevel =
                String(application.yearLevel || '').toLowerCase();

            const matchesSearch =
                applicationNumber.includes(searchValue) ||
                applicantName.includes(searchValue) ||
                applicantEmail.includes(searchValue) ||
                yearLevel.includes(searchValue);

            const selectedCourseName =
                String(courseNames[selectedCourse] || '').toLowerCase();

            const matchesCourse =
                !selectedCourse ||
                course === selectedCourse.toLowerCase() ||
                course === selectedCourseName;

            const matchesStatus =
                !selectedStatus ||
                application.enrollmentStatus === selectedStatus;

            return matchesSearch && matchesCourse && matchesStatus;
        });

        displayApplications(filteredApplications);
    }

    function displayApplications(applications) {
        applicationTableBody.replaceChildren();

        if (!applications || applications.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');

            cell.colSpan = 8;
            cell.className = 'empty-message';
            cell.textContent = 'No enrollment applications found.';

            row.appendChild(cell);
            applicationTableBody.appendChild(row);

            return;
        }

        applications.forEach(application => {
            const row = document.createElement('tr');

            const fullName = [
                application.firstName,
                application.middleName,
                application.lastName
            ].filter(Boolean).join(' ');

            const values = [
                application.applicationNumber,
                fullName,
                application.email,
                application.course,
                application.yearLevel,
                application.schoolYear
            ];

            values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value || '-';
                row.appendChild(cell);
            });

            const statusCell = document.createElement('td');
            const status = document.createElement('span');

            status.textContent = application.enrollmentStatus || 'Pending';

            status.className = 'status-badge ' +
                String(application.enrollmentStatus || 'Pending').toLowerCase();

            statusCell.appendChild(status);
            row.appendChild(statusCell);

            const actionCell = document.createElement('td');
            const statusSelect = document.createElement('select');

            statusSelect.className = 'application-status-select';

            ['Pending', 'Enrolled', 'Rejected'].forEach(optionValue => {
                const option = document.createElement('option');

                option.value = optionValue;
                option.textContent = optionValue;
                option.selected = optionValue === application.enrollmentStatus;

                statusSelect.appendChild(option);
            });

            const updateButton = document.createElement('button');

            updateButton.type = 'button';
            updateButton.textContent = 'Update';
            updateButton.className = 'edit-btn';

            updateButton.addEventListener('click', () => {
                updateApplicationStatus(
                    application._id,
                    statusSelect.value,
                    updateButton
                );
            });

            actionCell.appendChild(statusSelect);
            actionCell.appendChild(updateButton);
            row.appendChild(actionCell);

            applicationTableBody.appendChild(row);
        });
    }

    async function updateApplicationStatus(id, status, button) {
        if (!confirm(`Change this application's status to ${status}?`)) {
            return;
        }

        button.disabled = true;
        button.textContent = 'Updating...';

        try {
            const response = await fetch(
                `/api/enrollments/${encodeURIComponent(id)}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        enrollmentStatus: status
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Unable to update application.'
                );
            }

            alert(result.message || 'Enrollment status updated successfully!');

            await loadStudents();
            await loadApplications();

        } catch (error) {
            console.error('Status update error:', error);
            alert(error.message);

        } finally {
            button.disabled = false;
            button.textContent = 'Update';
        }
    }

    if (refreshApplications) {
        refreshApplications.addEventListener('click', loadApplications);
    }

    if (applicationSearch) {
        applicationSearch.addEventListener('input', filterApplications);
    }

    if (courseFilter) {
        courseFilter.addEventListener('change', filterApplications);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterApplications);
    }

    if (resetApplicationFilters) {
        resetApplicationFilters.addEventListener('click', () => {
            applicationSearch.value = '';
            courseFilter.value = '';
            statusFilter.value = '';

            filterApplications();
        });
    }

    loadApplications();

})();