import authManager from './auth.js';
import { languageManager } from './language.js';

class LoginPage {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkAuthState();
  }

  bindEvents() {
    const loginForm = document.getElementById('loginForm');
    const passwordToggle = document.getElementById('passwordToggle');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        this.handleLogin(e);
      });
    }

    if (passwordToggle) {
      passwordToggle.addEventListener('click', () => {
        this.togglePassword('password');
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

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Clear previous errors
    this.clearErrors();

    // Validate form
    if (!this.validateForm(email, password)) {
      return;
    }

    try {
      authManager.showLoading(true);
      
      await authManager.login(email, password);
      
      // Success - redirect will happen automatically via auth state change
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = languageManager.translate('invalid_credentials');
      
      if (error.message.includes('Invalid credentials')) {
        errorMessage = languageManager.translate('invalid_credentials');
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || 'An error occurred during login.';
      }
      
      authManager.showError('emailError', errorMessage);
      
    } finally {
      authManager.showLoading(false);
    }
  }

  validateForm(email, password) {
    let isValid = true;

    // Email validation
    if (!email) {
      authManager.showError('emailError', 'Email is required');
      isValid = false;
    } else if (!authManager.validateEmail(email)) {
      authManager.showError('emailError', 'Please enter a valid email address');
      isValid = false;
    }

    // Password validation
    if (!password) {
      authManager.showError('passwordError', 'Password is required');
      isValid = false;
    }

    return isValid;
  }

  clearErrors() {
    authManager.clearError('emailError');
    authManager.clearError('passwordError');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LoginPage();
});