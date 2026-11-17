
const enrollmentForm = document.getElementById('enrollmentForm');
const submitBtn = document.getElementById('submitBtn');
const message = document.getElementById('message');
const gwaInput = document.getElementById('gwa');

function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
    message.style.display = 'block';
}

gwaInput.addEventListener('input', function () {
    const gwa = Number(gwaInput.value);

    if (gwaInput.value === '') {
        gwaInput.setCustomValidity('');
    } else if (!Number.isFinite(gwa) || gwa < 0 || gwa > 100) {
        gwaInput.setCustomValidity('GWA must be between 0 and 100.');
    } else {
        gwaInput.setCustomValidity('');
    }
});

enrollmentForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const gwa = Number(gwaInput.value);

    if (
        gwaInput.value === '' ||
        !Number.isFinite(gwa) ||
        gwa < 0 ||
        gwa > 100
    ) {
        gwaInput.setCustomValidity('Please enter a GWA between 0 and 100.');
        gwaInput.reportValidity();
        return;
    }

    gwaInput.setCustomValidity('');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting Application...';

    message.style.display = 'none';

    const formData = new FormData(enrollmentForm);
 
    const enrollmentData = Object.fromEntries(formData.entries());

    enrollmentData.gwa = gwa;

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
