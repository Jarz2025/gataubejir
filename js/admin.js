import { db } from './firebase-config.js';
import { languageManager } from './language.js';

class AdminPanel {
  constructor() {
    this.currentSection = 'settings';
    this.orders = [];
    this.settings = {};
    this.rpsItems = [];
    this.init();
  }

  init() {
    this.checkAdminAuth();
    this.bindEvents();
    this.loadSettings();
    this.loadOrders();
    this.loadRPSItems();
    this.setupNavigation();
  }

  checkAdminAuth() {
    // Simple admin check - in production this would be more secure
    const isAdmin = localStorage.getItem('growtopia_admin_session');
    if (!isAdmin) {
      window.location.href = 'index.html';
      return;
    }
  }

  bindEvents() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        this.switchSection(section);
      });
    });

    // Settings
    const saveSettings = document.getElementById('saveSettings');
    if (saveSettings) {
      saveSettings.addEventListener('click', () => {
        this.saveSettings();
      });
    }

    // Pricing
    const savePrices = document.getElementById('savePrices');
    if (savePrices) {
      savePrices.addEventListener('click', () => {
        this.savePricing();
      });
    }

    // Payment Methods
    const savePayments = document.getElementById('savePayments');
    if (savePayments) {
      savePayments.addEventListener('click', () => {
        this.savePaymentMethods();
      });
    }

    // RPS Items
    const addItem = document.getElementById('addItem');
    const saveItems = document.getElementById('saveItems');
    
    if (addItem) {
      addItem.addEventListener('click', () => {
        this.addRPSItem();
      });
    }

    if (saveItems) {
      saveItems.addEventListener('click', () => {
        this.saveRPSItems();
      });
    }

    // Orders
    const refreshOrders = document.getElementById('refreshOrders');
    const orderFilter = document.getElementById('orderFilter');

    if (refreshOrders) {
      refreshOrders.addEventListener('click', () => {
        this.loadOrders();
      });
    }

    if (orderFilter) {
      orderFilter.addEventListener('change', () => {
        this.filterOrders();
      });
    }

    // Modal
    const closeOrderModal = document.getElementById('closeOrderModal');
    if (closeOrderModal) {
      closeOrderModal.addEventListener('click', () => {
        this.hideOrderModal();
      });
    }
  }

  setupNavigation() {
    // Set initial active section
    this.switchSection('settings');
  }

  switchSection(section) {
    // Remove active class from all nav items and sections
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    document.querySelectorAll('.admin-section').forEach(section => {
      section.classList.remove('active');
    });

    // Add active class to selected nav item and section
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    document.getElementById(section).classList.add('active');

    this.currentSection = section;

    // Load section-specific data
    if (section === 'orders') {
      this.loadOrders();
    }
  }

  async loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('growtopia_settings') || '{}');
      this.settings = settings;

      // Populate form fields
      if (settings.websiteName) {
        document.getElementById('websiteName').value = settings.websiteName;
      }
      if (settings.telegram?.botToken) {
        document.getElementById('telegramBotToken').value = settings.telegram.botToken;
      }
      if (settings.telegram?.chatId) {
        document.getElementById('telegramChatId').value = settings.telegram.chatId;
      }

      // Load pricing
      if (settings.dlPrice) {
        document.getElementById('dlPrice').value = settings.dlPrice;
      }
      if (settings.bglPrice) {
        document.getElementById('bglPrice').value = settings.bglPrice;
      }
      if (settings.rpsBglPrice) {
        document.getElementById('rpsBglPrice').value = settings.rpsBglPrice;
      }
      if (settings.rpsClockPrice) {
        document.getElementById('rpsClockPrice').value = settings.rpsClockPrice;
      }

      // Load payment methods
      if (settings.paymentMethods) {
        const pm = settings.paymentMethods;
        if (pm.dana) {
          document.getElementById('danaNumber').value = pm.dana.number || '';
          document.getElementById('danaName').value = pm.dana.name || '';
        }
        if (pm.gopay) {
          document.getElementById('gopayNumber').value = pm.gopay.number || '';
          document.getElementById('gopayName').value = pm.gopay.name || '';
        }
        if (pm.ovo) {
          document.getElementById('ovoNumber').value = pm.ovo.number || '';
          document.getElementById('ovoName').value = pm.ovo.name || '';
        }
        if (pm.shopee) {
          document.getElementById('shopeeNumber').value = pm.shopee.number || '';
          document.getElementById('shopeeName').value = pm.shopee.name || '';
        }
        if (pm.bank) {
          document.getElementById('bankNumber').value = pm.bank.number || '';
          document.getElementById('bankName').value = pm.bank.name || '';
          document.getElementById('bankType').value = pm.bank.type || '';
        }
      }

    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      const settings = {
        ...this.settings,
        websiteName: document.getElementById('websiteName').value,
        telegram: {
          botToken: document.getElementById('telegramBotToken').value,
          chatId: document.getElementById('telegramChatId').value
        }
      };

      localStorage.setItem('growtopia_settings', JSON.stringify(settings));
      this.settings = settings;
      
      this.showNotification('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showNotification('Error saving settings', 'error');
    }
  }

  async savePricing() {
    try {
      const settings = {
        ...this.settings,
        dlPrice: parseInt(document.getElementById('dlPrice').value) || 0,
        bglPrice: parseInt(document.getElementById('bglPrice').value) || 0,
        rpsBglPrice: parseInt(document.getElementById('rpsBglPrice').value) || 0,
        rpsClockPrice: parseInt(document.getElementById('rpsClockPrice').value) || 0
      };

      localStorage.setItem('growtopia_settings', JSON.stringify(settings));
      this.settings = settings;
      
      this.showNotification('Pricing saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving pricing:', error);
      this.showNotification('Error saving pricing', 'error');
    }
  }

  async savePaymentMethods() {
    try {
      const settings = {
        ...this.settings,
        paymentMethods: {
          dana: {
            number: document.getElementById('danaNumber').value,
            name: document.getElementById('danaName').value
          },
          gopay: {
            number: document.getElementById('gopayNumber').value,
            name: document.getElementById('gopayName').value
          },
          ovo: {
            number: document.getElementById('ovoNumber').value,
            name: document.getElementById('ovoName').value
          },
          shopee: {
            number: document.getElementById('shopeeNumber').value,
            name: document.getElementById('shopeeName').value
          },
          bank: {
            number: document.getElementById('bankNumber').value,
            name: document.getElementById('bankName').value,
            type: document.getElementById('bankType').value
          }
        }
      };

      localStorage.setItem('growtopia_settings', JSON.stringify(settings));
      this.settings = settings;
      
      this.showNotification('Payment methods saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving payment methods:', error);
      this.showNotification('Error saving payment methods', 'error');
    }
  }

  async loadOrders() {
    try {
      const orders = JSON.parse(localStorage.getItem('growtopia_orders') || '[]');
      this.orders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      this.updatePendingOrdersBadge();
      this.renderOrders();
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  updatePendingOrdersBadge() {
    const pendingCount = this.orders.filter(order => order.status === 'pending').length;
    const badge = document.getElementById('pendingOrdersBadge');
    if (badge) {
      badge.textContent = pendingCount;
      badge.style.display = pendingCount > 0 ? 'block' : 'none';
    }
  }

  filterOrders() {
    const filter = document.getElementById('orderFilter').value;
    let filteredOrders = this.orders;

    if (filter !== 'all') {
      filteredOrders = this.orders.filter(order => order.status === filter);
    }

    this.renderOrders(filteredOrders);
  }

  renderOrders(orders = this.orders) {
    const container = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No Orders Found</h3>
          <p>No orders match the current filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => this.createOrderHTML(order)).join('');

    // Bind click events
    container.querySelectorAll('.order-item').forEach(item => {
      item.addEventListener('click', () => {
        const orderId = item.dataset.orderId;
        const order = this.orders.find(o => o.orderId === orderId);
        if (order) {
          this.showOrderDetails(order);
        }
      });
    });

    // Bind action buttons
    container.querySelectorAll('.btn-success').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const orderId = btn.closest('.order-item').dataset.orderId;
        this.updateOrderStatus(orderId, 'processed');
      });
    });

    container.querySelectorAll('.btn-danger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const orderId = btn.closest('.order-item').dataset.orderId;
        this.updateOrderStatus(orderId, 'rejected');
      });
    });
  }

  createOrderHTML(order) {
    const statusClass = order.status.toLowerCase();
    
    return `
      <div class="order-item" data-order-id="${order.orderId}">
        <div class="order-header">
          <span class="order-id">${order.orderId}</span>
          <span class="order-status ${statusClass}">${order.status.toUpperCase()}</span>
        </div>
        
        <div class="order-details">
          <div class="order-detail">
            <div class="order-detail-label">Customer</div>
            <div class="order-detail-value">${order.userEmail}</div>
          </div>
          <div class="order-detail">
            <div class="order-detail-label">Service</div>
            <div class="order-detail-value">${order.serviceType}</div>
          </div>
          <div class="order-detail">
            <div class="order-detail-label">Item</div>
            <div class="order-detail-value">${order.itemType ? order.itemType.toUpperCase() : order.itemName}</div>
          </div>
          <div class="order-detail">
            <div class="order-detail-label">Quantity</div>
            <div class="order-detail-value">${order.quantity}</div>
          </div>
          <div class="order-detail">
            <div class="order-detail-label">Total</div>
            <div class="order-detail-value">${order.totalPrice} ${order.currency}</div>
          </div>
          <div class="order-detail">
            <div class="order-detail-label">Date</div>
            <div class="order-detail-value">${languageManager.formatDate(order.createdAt)}</div>
          </div>
        </div>
        
        ${order.status === 'pending' ? `
          <div class="order-actions">
            <button class="btn btn-success btn-sm">Accept</button>
            <button class="btn btn-danger btn-sm">Reject</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  async updateOrderStatus(orderId, status) {
    try {
      const orderIndex = this.orders.findIndex(o => o.orderId === orderId);
      if (orderIndex !== -1) {
        this.orders[orderIndex].status = status;
        this.orders[orderIndex].updatedAt = new Date().toISOString();
        
        localStorage.setItem('growtopia_orders', JSON.stringify(this.orders));
        
        this.updatePendingOrdersBadge();
        this.renderOrders();
        
        this.showNotification(`Order ${status} successfully!`, 'success');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      this.showNotification('Error updating order status', 'error');
    }
  }

  showOrderDetails(order) {
    const modal = document.getElementById('orderModal');
    const orderDetails = document.getElementById('orderDetails');
    
    orderDetails.innerHTML = `
      <div class="order-detail-grid">
        <div class="order-detail-item">
          <h4>Order ID</h4>
          <p>${order.orderId}</p>
        </div>
        <div class="order-detail-item">
          <h4>Status</h4>
          <p class="order-status ${order.status}">${order.status.toUpperCase()}</p>
        </div>
        <div class="order-detail-item">
          <h4>Customer Email</h4>
          <p>${order.userEmail}</p>
        </div>
        <div class="order-detail-item">
          <h4>GT Username</h4>
          <p>${order.gtUsername}</p>
        </div>
        <div class="order-detail-item">
          <h4>World Name</h4>
          <p>${order.worldName}</p>
        </div>
        <div class="order-detail-item">
          <h4>Service Type</h4>
          <p>${order.serviceType}</p>
        </div>
        <div class="order-detail-item">
          <h4>Item</h4>
          <p>${order.itemType ? order.itemType.toUpperCase() : order.itemName}</p>
        </div>
        <div class="order-detail-item">
          <h4>Quantity</h4>
          <p>${order.quantity}</p>
        </div>
        <div class="order-detail-item">
          <h4>Total Amount</h4>
          <p><strong>${order.totalPrice} ${order.currency}</strong></p>
        </div>
        <div class="order-detail-item">
          <h4>Order Date</h4>
          <p>${languageManager.formatDate(order.createdAt)}</p>
        </div>
        ${order.paymentMethod ? `
          <div class="order-detail-item">
            <h4>Payment Method</h4>
            <p>${order.paymentMethod.toUpperCase()}</p>
          </div>
        ` : ''}
      </div>
    `;
    
    modal.style.display = 'flex';
  }

  hideOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
  }

  async loadRPSItems() {
    try {
      this.rpsItems = JSON.parse(localStorage.getItem('growtopia_rps_items') || '[]');
      this.renderRPSItems();
    } catch (error) {
      console.error('Error loading RPS items:', error);
    }
  }

  renderRPSItems() {
    const container = document.getElementById('itemsContainer');
    
    container.innerHTML = this.rpsItems.map((item, index) => `
      <div class="item-card">
        <button class="item-remove" data-index="${index}">&times;</button>
        <div class="item-inputs">
          <div class="item-input">
            <label>Item Name</label>
            <input type="text" class="item-name" value="${item.name}">
          </div>
          <div class="item-input">
            <label>Price (BGL)</label>
            <input type="number" class="item-price" value="${item.price}">
          </div>
        </div>
      </div>
    `).join('');

    // Bind remove buttons
    container.querySelectorAll('.item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.removeRPSItem(index);
      });
    });
  }

  addRPSItem() {
    this.rpsItems.push({ name: '', price: 0 });
    this.renderRPSItems();
  }

  removeRPSItem(index) {
    this.rpsItems.splice(index, 1);
    this.renderRPSItems();
  }

  async saveRPSItems() {
    try {
      const container = document.getElementById('itemsContainer');
      const items = [];
      
      container.querySelectorAll('.item-card').forEach(card => {
        const name = card.querySelector('.item-name').value.trim();
        const price = parseInt(card.querySelector('.item-price').value) || 0;
        
        if (name && price > 0) {
          items.push({ name, price });
        }
      });
      
      localStorage.setItem('growtopia_rps_items', JSON.stringify(items));
      this.rpsItems = items;
      
      this.showNotification('RPS items saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving RPS items:', error);
      this.showNotification('Error saving RPS items', 'error');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      animation: 'slideIn 0.3s ease'
    });
    
    // Set background color based on type
    const colors = {
      success: '#10B981',
      error: '#EF4444',
      info: '#3B82F6',
      warning: '#F59E0B'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
    
    // Add CSS animations if not already present
    if (!document.querySelector('#notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(styles);
    }
  }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AdminPanel();
});