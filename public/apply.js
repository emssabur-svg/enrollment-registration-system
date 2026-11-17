
const enrollmentForm = document.getElementById('enrollmentForm');
const submitBtn = document.getElementById('submitBtn');
const message = document.getElementById('message');

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
}

enrollmentForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Application...';

    message.style.display = 'none';

    const formData = new FormData(enrollmentForm);

    const enrollmentData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/enrollments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(enrollmentData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Unable to submit application.');
        }

        showMessage(
            result.message + ' Your Application Number is: ' +
            result.applicationNumber,
            'success'
        );

        enrollmentForm.reset();

    } catch (error) {
        console.error('Enrollment error:', error);

        showMessage(
            error.message || 'Something went wrong. Please try again.',
            'error'
        );

    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Enrollment Application';
    }
});
