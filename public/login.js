
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');

// Check if admin is already logged in
async function checkLogin() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (data.authenticated) {
            window.location.replace('/');
        }
    } catch (error) {
        console.error('Unable to check login status:', error);
    }
}

checkLogin();

// Handle login
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    errorMessage.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed.');
        }

        window.location.replace('/');

    } catch (error) {
        errorMessage.textContent = error.message;
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login to Dashboard';
    }
});
