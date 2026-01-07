/**
 * Auth Page JavaScript
 * Handles login, register, and validation
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initAuthPage();
});

/**
 * Initialize auth page
 */
function initAuthPage() {
    // Setup form listeners
    setupLoginForm();
    setupRegisterForm();
    setupPasswordStrength();

    // Check if user is already logged in
    checkAuthStatus();

    console.log('Auth page initialized');
}

/**
 * Check if user is logged in
 */
function checkAuthStatus() {
    const user = localStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        console.log('User is logged in:', userData);
        // Could redirect to profile or show logged in state
    }
}

/**
 * Setup login form
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
}

/**
 * Setup register form
 */
function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });
}

/**
 * Setup password strength indicator
 */
function setupPasswordStrength() {
    const passwordInput = document.getElementById('register-password');
    if (!passwordInput) return;

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        updatePasswordStrength(password);
    });
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strength-bar');
    if (!strengthBar) return;

    let strength = 0;
    
    // Check length
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    
    // Check for numbers
    if (/\d/.test(password)) strength++;
    
    // Check for lowercase and uppercase
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    
    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    // Update bar
    strengthBar.className = 'strength-bar';
    
    if (strength <= 2) {
        strengthBar.classList.add('weak');
    } else if (strength <= 3) {
        strengthBar.classList.add('medium');
    } else {
        strengthBar.classList.add('strong');
    }
}

/**
 * Handle login
 */
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Validation
    if (!validateEmail(email)) {
        showNotification('Email không hợp lệ!', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Login successful
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone
        };

        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }

        showNotification('Đăng nhập thành công! Đang chuyển hướng...', 'success');

        // Redirect after 1.5s
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showNotification('Email hoặc mật khẩu không đúng!', 'error');
    }
}

/**
 * Handle register
 */
function handleRegister() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const agreeTerms = document.getElementById('agree-terms').checked;

    // Validation
    if (!name) {
        showNotification('Vui lòng nhập họ tên!', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showNotification('Email không hợp lệ!', 'error');
        return;
    }

    if (!validatePhone(phone)) {
        showNotification('Số điện thoại không hợp lệ!', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    if (!agreeTerms) {
        showNotification('Vui lòng đồng ý với điều khoản dịch vụ!', 'error');
        return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if email already exists
    if (users.find(u => u.email === email)) {
        showNotification('Email đã được đăng ký!', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password, // In production, this should be hashed
        createdAt: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    showNotification('Đăng ký thành công! Đang chuyển sang đăng nhập...', 'success');

    // Switch to login form after 1.5s
    setTimeout(() => {
        switchToLogin();
        // Pre-fill email
        document.getElementById('login-email').value = email;
    }, 1500);
}

/**
 * Validate email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate phone number (Vietnam format)
 */
function validatePhone(phone) {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone.replace(/\s/g, ''));
}

/**
 * Toggle password visibility
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * Switch to register form
 */
function switchToRegister(event) {
    if (event) event.preventDefault();
    
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');

    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
    
    // Animate
    registerCard.style.animation = 'slideUp 0.5s ease';
}

/**
 * Switch to login form
 */
function switchToLogin(event) {
    if (event) event.preventDefault();
    
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');

    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
    
    // Animate
    loginCard.style.animation = 'slideUp 0.5s ease';
}

/**
 * Login with Google (Demo)
 */
function loginWithGoogle() {
    showNotification('Tính năng đăng nhập Google đang phát triển!', 'error');
    console.log('Google login clicked');
    
    // In production, implement Google OAuth
    // Example: Use Google Sign-In API
}

/**
 * Login with Facebook (Demo)
 */
function loginWithFacebook() {
    showNotification('Tính năng đăng nhập Facebook đang phát triển!', 'error');
    console.log('Facebook login clicked');
    
    // In production, implement Facebook Login
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('auth-notification');
    
    if (!notification) return;

    notification.textContent = message;
    notification.className = type === 'error' ? 'error' : '';
    notification.classList.add('show');

    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Logout function (can be called from other pages)
 */
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    showNotification('Đã đăng xuất!', 'success');
    
    setTimeout(() => {
        window.location.href = 'auth.html';
    }, 1000);
}