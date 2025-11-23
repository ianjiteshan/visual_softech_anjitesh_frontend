// config.js
const API_BASE_URL = "http://localhost:5000/api"; // IMPORTANT: User must change this to the actual backend URL

function getAuthToken() {
    return localStorage.getItem('jwtToken');
}

function setAuthToken(token) {
    localStorage.setItem('jwtToken', token);
}

function removeAuthToken() {
    localStorage.removeItem('jwtToken');
}

function checkAuth() {
    if (!getAuthToken() && window.location.pathname.indexOf('login.html') === -1) {
        window.location.href = 'login.html';
    } else if (getAuthToken() && window.location.pathname.indexOf('login.html') !== -1) {
        window.location.href = 'index.html';
    }
}

// Attach logout functionality to the button on all pages except login
$(document).ready(function() {
    if (window.location.pathname.indexOf('login.html') === -1) {
        checkAuth();
        $('#logoutBtn').on('click', function() {
            removeAuthToken();
            window.location.href = 'login.html';
        });
    }
});
