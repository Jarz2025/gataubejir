// Firebase configuration (demo/local storage fallback)
const firebaseConfig = {
  // This is a placeholder configuration
  // In production, you would use actual Firebase credentials
  apiKey: "AIzaSyANC8o5r8P_I2f3ZCR6jsHRQw_xBzWQDCI",
  authDomain: "web2-e7eee.firebaseapp.com",
  databaseURL: "https://web2-e7eee-default-rtdb.firebaseio.com",
  projectId: "web2-e7eee",
  storageBucket: "web2-e7eee.firebasestorage.app",
  messagingSenderId: "414850621933",
  appId: "1:414850621933:web:e923cc1554898e9d9687e4"
};

// Local storage fallback for demo purposes
class FirebaseAuth {
  constructor() {
    this.currentUser = null;
    this.onAuthStateChangedCallbacks = [];
    
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('growtopia_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  onAuthStateChanged(callback) {
    this.onAuthStateChangedCallbacks.push(callback);
    // Immediately call with current user
    callback(this.currentUser);
  }

  async signInWithEmailAndPassword(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation for demo
    const users = JSON.parse(localStorage.getItem('growtopia_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    this.currentUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.username || user.email.split('@')[0]
    };

    localStorage.setItem('growtopia_user', JSON.stringify(this.currentUser));
    this._notifyAuthStateChanged();
    
    return { user: this.currentUser };
  }

  async createUserWithEmailAndPassword(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = JSON.parse(localStorage.getItem('growtopia_users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      throw new Error('Email already in use');
    }

    const newUser = {
      uid: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      email,
      password,
      username: email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('growtopia_users', JSON.stringify(users));

    this.currentUser = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.username
    };

    localStorage.setItem('growtopia_user', JSON.stringify(this.currentUser));
    this._notifyAuthStateChanged();
    
    return { user: this.currentUser };
  }

  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('growtopia_user');
    localStorage.removeItem('growtopia_admin_session');
    this._notifyAuthStateChanged();
  }

  _notifyAuthStateChanged() {
    this.onAuthStateChangedCallbacks.forEach(callback => {
      callback(this.currentUser);
    });
  }
}

class FirebaseFirestore {
  constructor() {
    this.collections = {};
  }

  collection(name) {
    return {
      doc: (id) => ({
        get: async () => {
          const data = localStorage.getItem(`${name}_${id}`);
          return {
            exists: !!data,
            data: () => data ? JSON.parse(data) : null,
            id
          };
        },
        set: async (data) => {
          localStorage.setItem(`${name}_${id}`, JSON.stringify(data));
        },
        update: async (data) => {
          const existing = localStorage.getItem(`${name}_${id}`);
          const updated = existing ? { ...JSON.parse(existing), ...data } : data;
          localStorage.setItem(`${name}_${id}`, JSON.stringify(updated));
        },
        delete: async () => {
          localStorage.removeItem(`${name}_${id}`);
        }
      }),
      add: async (data) => {
        const id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const docData = { ...data, id, createdAt: new Date().toISOString() };
        localStorage.setItem(`${name}_${id}`, JSON.stringify(docData));
        return { id };
      },
      where: (field, operator, value) => ({
        get: async () => {
          const allKeys = Object.keys(localStorage);
          const docs = [];
          
          allKeys.forEach(key => {
            if (key.startsWith(`${name}_`)) {
              const data = JSON.parse(localStorage.getItem(key));
              let matches = false;
              
              switch (operator) {
                case '==':
                  matches = data[field] === value;
                  break;
                case '!=':
                  matches = data[field] !== value;
                  break;
                case '>':
                  matches = data[field] > value;
                  break;
                case '>=':
                  matches = data[field] >= value;
                  break;
                case '<':
                  matches = data[field] < value;
                  break;
                case '<=':
                  matches = data[field] <= value;
                  break;
              }
              
              if (matches) {
                docs.push({
                  id: data.id,
                  data: () => data
                });
              }
            }
          });
          
          return { docs };
        }
      }),
      get: async () => {
        const allKeys = Object.keys(localStorage);
        const docs = [];
        
        allKeys.forEach(key => {
          if (key.startsWith(`${name}_`)) {
            const data = JSON.parse(localStorage.getItem(key));
            docs.push({
              id: data.id,
              data: () => data
            });
          }
        });
        
        return { docs };
      }
    };
  }
}

// Export mock Firebase services
export const auth = new FirebaseAuth();
export const db = new FirebaseFirestore();

// Utility functions
export const getCurrentUser = () => auth.currentUser;
export const isAuthenticated = () => !!auth.currentUser;

// Initialize admin user if not exists
const initializeAdmin = () => {
  const users = JSON.parse(localStorage.getItem('growtopia_users') || '[]');
  const adminExists = users.find(u => u.email === 'admin@growtopia.com');
  
  if (!adminExists) {
    const admin = {
      uid: 'admin_' + Date.now(),
      email: 'admin@growtopia.com',
      password: 'admin123',
      username: 'Admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    
    users.push(admin);
    localStorage.setItem('growtopia_users', JSON.stringify(users));
  }
};

// Initialize default settings if not exists
const initializeSettings = () => {
  const settings = localStorage.getItem('growtopia_settings');
  if (!settings) {
    const defaultSettings = {
      websiteName: 'Growtopia Shop',
      dlPrice: 5000,
      bglPrice: 50000,
      rpsBglPrice: 1,
      rpsClockPrice: 10,
      paymentMethods: {
        dana: { number: '081234567890', name: 'Growtopia Shop' },
        gopay: { number: '081234567890', name: 'Growtopia Shop' },
        ovo: { number: '081234567890', name: 'Growtopia Shop' },
        shopee: { number: '081234567890', name: 'Growtopia Shop' },
        bank: { number: '1234567890', name: 'Growtopia Shop', type: 'BCA' }
      },
      telegram: {
        botToken: '',
        chatId: ''
      }
    };
    localStorage.setItem('growtopia_settings', JSON.stringify(defaultSettings));
  }
};

// Initialize default RPS items if not exists
const initializeRPSItems = () => {
  const items = localStorage.getItem('growtopia_rps_items');
  if (!items) {
    const defaultItems = [
      { name: 'Legendary Orb', price: 5 },
      { name: 'Golden Booster', price: 3 },
      { name: 'Mystic Seed', price: 2 },
      { name: 'Phoenix Wings', price: 10 },
      { name: 'Dragon Mask', price: 8 },
      { name: 'Crystal Block', price: 1 },
      { name: 'Neon Nerves', price: 15 },
      { name: 'Astro Top', price: 12 }
    ];
    localStorage.setItem('growtopia_rps_items', JSON.stringify(defaultItems));
  }
};

// Admin login function
window.adminLogin = (password) => {
  if (password === 'admin123') {
    localStorage.setItem('growtopia_admin_session', 'true');
    return true;
  }
  return false;
};

// Initialize everything on load
document.addEventListener('DOMContentLoaded', () => {
  initializeAdmin();
  initializeSettings();
  initializeRPSItems();
});