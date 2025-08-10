import authManager from './auth.js';
import { languageManager } from './language.js';

class RegisterPage {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkAuthState();
  }

  bindEvents() {
    const registerForm = document.getElementById('registerForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        this.handleRegister(e);
      });
    }

    if (passwordToggle) {
      passwordToggle.addEventListener('click', () => {
        this.togglePassword('password');
      });
    }

    if (confirmPasswordToggle) {
      confirmPasswordToggle.addEventListener('click', () => {
        this.togglePassword('confirmPassword');
      });
    }
  }

  checkAuthState() {
    // Redirect if already logged in
    authManager.onAuthStateChanged((user) => {
      if (user) {
        window.location.href = 'index.html';
      }
    });
  }

  togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const toggle = document.getElementById(fieldId + 'Toggle');
    
    if (field.type === 'password') {
      field.type = 'text';
      toggle.innerHTML = '<span class="eye-icon">🙈</span>';
    } else {
      field.type = 'password';
      toggle.innerHTML = '<span class="eye-icon">👁️</span>';
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Clear previous errors
    this.clearErrors();

    // Validate form
    if (!this.validateForm(username, email, password, confirmPassword)) {
      return;
    }

    try {
      authManager.showLoading(true);
      
      await authManager.register(email, password, username);
      
      // Success - redirect will happen automatically via auth state change
      alert(languageManager.translate('registration_successful'));
      
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'An error occurred during registration.';
      
      if (error.message.includes('Email already in use')) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        authManager.showError('emailError', errorMessage);
      } else if (error.message.includes('weak-password')) {
        errorMessage = 'Password is too weak. Please use a stronger password.';
        authManager.showError('passwordError', errorMessage);
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
        authManager.showError('emailError', errorMessage);
      } else {
        authManager.showError('emailError', error.message || errorMessage);
      }
      
    } finally {
      authManager.showLoading(false);
    }
  }

  validateForm(username, email, password, confirmPassword) {
    let isValid = true;

    // Username validation
    if (!username) {
      authManager.showError('usernameError', 'Username is required');
      isValid = false;
    } else if (username.length < 2) {
      authManager.showError('usernameError', 'Username must be at least 2 characters long');
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      authManager.showError('usernameError', 'Username can only contain letters, numbers, and underscores');
      isValid = false;
    }

    // Email validation
    if (!email) {
      authManager.showError('emailError', 'Email is required');
      isValid = false;
    } else if (!authManager.validateEmail(email)) {
      authManager.showError('emailError', 'Please enter a valid email address');
      isValid = false;
    }

    // Password validation
    const passwordValidation = authManager.validatePassword(password);
    if (!password) {
      authManager.showError('passwordError', 'Password is required');
      isValid = false;
    } else if (!passwordValidation.isValid) {
      authManager.showError('passwordError', passwordValidation.errors.join('. '));
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      authManager.showError('confirmPasswordError', 'Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      authManager.showError('confirmPasswordError', languageManager.translate('passwords_dont_match'));
      isValid = false;
    }

    return isValid;
  }

  clearErrors() {
    authManager.clearError('usernameError');
    authManager.clearError('emailError');
    authManager.clearError('passwordError');
    authManager.clearError('confirmPasswordError');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new RegisterPage();
});