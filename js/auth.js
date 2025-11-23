// auth.js
$(document).ready(function() {
    // Check if already logged in, redirect to index if so
    checkAuth();

    $('#loginForm').on('submit', function(e) {
        e.preventDefault();

        const username = $('#username').val();
        const password = $('#password').val();

        $.ajax({
            url: `${API_BASE_URL}/Auth/login`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: username, password: password }),
            success: function(response) {
                // On success -> Store JWT and redirect to Index.
                setAuthToken(response.token);
                window.location.href = 'index.html';
            },
            error: function(xhr) {
                // On fail -> SweetAlert: "Invalid Username or Password."
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: 'Invalid Username or Password.',
                    confirmButtonText: 'OK'
                });
            }
        });
    });
});
