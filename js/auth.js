import { auth, db } from './firebase-config.js';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.onAuthStateChangedCallbacks = [];
    this.init();
  }

  init() {
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.updateUI();
      this.onAuthStateChangedCallbacks.forEach(callback => callback(user));
    });
  }

  // Subscribe to auth state changes
  onAuthStateChanged(callback) {
    this.onAuthStateChangedCallbacks.push(callback);
    // Immediately call with current user
    callback(this.currentUser);
  }

  // Update UI based on auth state
  updateUI() {
    const userInfo = document.getElementById('userInfo');
    const displayUsername = document.getElementById('displayUsername');
    
    if (this.currentUser) {
      if (userInfo) {
        userInfo.style.display = 'flex';
      }
      if (displayUsername) {
        displayUsername.textContent = this.currentUser.displayName || this.currentUser.email;
      }
    } else {
      if (userInfo) {
        userInfo.style.display = 'none';
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Login with email and password
  async login(email, password) {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register with email and password
  async register(email, password, username) {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      
      // Save additional user data
      if (result.user) {
        await db.collection('users').doc(result.user.uid).set({
          username,
          email,
          createdAt: new Date().toISOString(),
          role: 'user'
        });
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Check if user is admin
  async isAdmin() {
    if (!this.currentUser) return false;
    
    try {
      const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
      const userData = userDoc.data();
      return userData && userData.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Require authentication
  requireAuth() {
    if (!this.isAuthenticated()) {
      this.showLoginModal();
      return false;
    }
    return true;
  }

  // Show login modal
  showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  // Hide login modal
  hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password) {
    return {
      isValid: password.length >= 6,
      errors: password.length < 6 ? ['Password must be at least 6 characters long'] : []
    };
  }

  // Show error message
  showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
    }
  }

  // Clear error message
  clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = '';
    }
  }

  // Show loading state
  showLoading(show = true) {
    const spinner = document.getElementById('loadingSpinner');
    const form = document.querySelector('.auth-form');
    
    if (spinner) {
      spinner.style.display = show ? 'flex' : 'none';
    }
    
    if (form) {
      if (show) {
        form.classList.add('loading');
      } else {
        form.classList.remove('loading');
      }
    }
  }
}

// Create global instance
const authManager = new AuthManager();

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await authManager.logout();
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  }

  // Login modal events
  const closeModal = document.getElementById('closeModal');
  const goToLogin = document.getElementById('goToLogin');
  const goToRegister = document.getElementById('goToRegister');

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      authManager.hideLoginModal();
    });
  }

  if (goToLogin) {
    goToLogin.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  if (goToRegister) {
    goToRegister.addEventListener('click', () => {
      window.location.href = 'register.html';
    });
  }

  // Close modal when clicking outside
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        authManager.hideLoginModal();
      }
    });
  }
});

// Export for use in other modules
export default authManager;
export { authManager };