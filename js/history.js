import authManager from './auth.js';
import { languageManager } from './language.js';

class HistoryPage {
  constructor() {
    this.orders = [];
    this.filteredOrders = [];
    this.init();
  }

  init() {
    this.checkAuth();
    this.bindEvents();
    this.loadOrders();
  }

  checkAuth() {
    if (!authManager.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }
  }

  bindEvents() {
    const statusFilter = document.getElementById('statusFilter');
    const serviceFilter = document.getElementById('serviceFilter');

    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        this.applyFilters();
      });
    }

    if (serviceFilter) {
      serviceFilter.addEventListener('change', () => {
        this.applyFilters();
      });
    }

    // Modal events
    const closeOrderModal = document.getElementById('closeOrderModal');
    const orderModal = document.getElementById('orderModal');

    if (closeOrderModal) {
      closeOrderModal.addEventListener('click', () => {
        this.hideOrderModal();
      });
    }

    if (orderModal) {
      orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) {
          this.hideOrderModal();
        }
      });
    }
  }

  async loadOrders() {
    try {
      this.showLoading(true);
      
      // Get orders from localStorage (in production, this would be from Firebase)
      const allOrders = JSON.parse(localStorage.getItem('growtopia_orders') || '[]');
      
      // Filter orders for current user
      const currentUser = authManager.getCurrentUser();
      this.orders = allOrders.filter(order => order.userId === currentUser.uid);
      
      // Sort by creation date (newest first)
      this.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      this.filteredOrders = [...this.orders];
      this.renderOrders();
      
    } catch (error) {
      console.error('Error loading orders:', error);
      this.showError('Failed to load orders');
    } finally {
      this.showLoading(false);
    }
  }

  applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const serviceFilter = document.getElementById('serviceFilter').value;

    this.filteredOrders = this.orders.filter(order => {
      const statusMatch = statusFilter === 'all' || order.status === statusFilter;
      const serviceMatch = serviceFilter === 'all' || order.serviceType === serviceFilter;
      return statusMatch && serviceMatch;
    });

    this.renderOrders();
  }

  renderOrders() {
    const ordersList = document.getElementById('ordersList');
    const emptyState = document.getElementById('emptyState');

    if (this.filteredOrders.length === 0) {
      ordersList.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    
    ordersList.innerHTML = this.filteredOrders.map(order => {
      return this.createOrderHTML(order);
    }).join('');

    // Bind click events for order items
    const orderItems = ordersList.querySelectorAll('.history-order-item');
    orderItems.forEach(item => {
      item.addEventListener('click', () => {
        const orderId = item.dataset.orderId;
        const order = this.orders.find(o => o.orderId === orderId);
        if (order) {
          this.showOrderDetails(order);
        }
      });
    });

    // Re-translate the page
    setTimeout(() => {
      languageManager.translatePage();
    }, 100);
  }

  createOrderHTML(order) {
    const statusClass = order.status.toLowerCase();
    const serviceClass = order.serviceType.toLowerCase();
    
    return `
      <div class="history-order-item fade-in" data-order-id="${order.orderId}">
        <div class="history-order-header">
          <div class="history-order-title">
            <div class="history-order-id">${order.orderId}</div>
            <div class="history-order-date">${languageManager.formatDate(order.createdAt)}</div>
          </div>
          <div class="history-order-status ${statusClass}" data-en="${this.getStatusText(order.status, 'en')}" data-id="${this.getStatusText(order.status, 'id')}">
            ${this.getStatusText(order.status, languageManager.getCurrentLanguage())}
          </div>
        </div>
        
        <div class="history-order-details">
          <div class="history-order-detail">
            <div class="history-order-detail-label" data-en="Service" data-id="Layanan">Service</div>
            <div class="history-order-detail-value">
              <span class="service-type ${serviceClass}">${order.serviceType}</span>
            </div>
          </div>
          
          <div class="history-order-detail">
            <div class="history-order-detail-label" data-en="Item" data-id="Item">Item</div>
            <div class="history-order-detail-value">
              ${order.itemType ? order.itemType.toUpperCase() : order.itemName}
            </div>
          </div>
          
          <div class="history-order-detail">
            <div class="history-order-detail-label" data-en="Quantity" data-id="Jumlah">Quantity</div>
            <div class="history-order-detail-value">${order.quantity}</div>
          </div>
          
          <div class="history-order-detail">
            <div class="history-order-detail-label" data-en="GT Username" data-id="Username GT">GT Username</div>
            <div class="history-order-detail-value">${order.gtUsername}</div>
          </div>
        </div>
        
        <div class="history-order-summary">
          <div class="history-order-total">
            ${this.formatPrice(order.totalPrice, order.currency)}
            <span class="currency">${order.currency}</span>
          </div>
          <button class="view-details-btn" data-en="View Details" data-id="Lihat Detail">View Details</button>
        </div>
      </div>
    `;
  }

  getStatusText(status, language) {
    const statusTexts = {
      en: {
        pending: 'Pending',
        processed: 'Processed',
        rejected: 'Rejected'
      },
      id: {
        pending: 'Menunggu',
        processed: 'Diproses',
        rejected: 'Ditolak'
      }
    };
    
    return statusTexts[language][status] || status;
  }

  formatPrice(price, currency) {
    if (currency === 'IDR') {
      return languageManager.formatCurrency(price);
    }
    return price.toLocaleString();
  }

  showOrderDetails(order) {
    const modal = document.getElementById('orderModal');
    const orderDetails = document.getElementById('orderDetails');
    
    orderDetails.innerHTML = this.createOrderDetailsHTML(order);
    modal.style.display = 'flex';
    
    // Re-translate the modal content
    setTimeout(() => {
      languageManager.translatePage();
    }, 100);
  }

  createOrderDetailsHTML(order) {
    return `
      <div class="order-detail-grid">
        <div class="order-detail-item">
          <h4 data-en="Order ID" data-id="ID Pesanan">Order ID</h4>
          <p>${order.orderId}</p>
        </div>
        
        <div class="order-detail-item">
          <h4 data-en="Status" data-id="Status">Status</h4>
          <p class="order-status ${order.status}">
            <span data-en="${this.getStatusText(order.status, 'en')}" data-id="${this.getStatusText(order.status, 'id')}">
              ${this.getStatusText(order.status, languageManager.getCurrentLanguage())}
            </span>
          </p>
        </div>
        
        <div class="order-detail-item">
          <h4 data-en="Service Type" data-id="Jenis Layanan">Service Type</h4>
          <p>${order.serviceType}</p>
        </div>
        
        <div class="order-detail-item">
          <h4 data-en="Order Date" data-id="Tanggal Pesanan">Order Date</h4>
          <p>${languageManager.formatDate(order.createdAt)}</p>
        </div>
        
        <div class="order-detail-item">
          <h4 data-en="GT Username" data-id="Username GT">GT Username</h4>
          <p>${order.gtUsername}</p>
        </div>
        
        <div class="order-detail-item">
          <h4 data-en="World Name" data-id="Nama World">World Name</h4>
          <p>${order.worldName}</p>
        </div>
        
        <div class="order-detail-item">
          <h4 data-en="Customer Email" data-id="Email Pelanggan">Customer Email</h4>
          <p>${order.userEmail}</p>
        </div>
        
        <div class="order-detail-item">
          <h4 data-en="Total Amount" data-id="Total Jumlah">Total Amount</h4>
          <p><strong>${this.formatPrice(order.totalPrice, order.currency)} ${order.currency}</strong></p>
        </div>
      </div>
      
      <div class="order-items-section">
        <h4 data-en="Order Items" data-id="Item Pesanan">Order Items</h4>
        <div class="order-items-list">
          <div class="order-item-detail">
            <span class="order-item-name">
              ${order.itemType ? order.itemType.toUpperCase() : order.itemName}
              ${order.paymentMethod ? ` (${order.paymentMethod.toUpperCase()} Payment)` : ''}
            </span>
            <span class="order-item-quantity">x${order.quantity}</span>
          </div>
        </div>
      </div>
      
      ${order.notes ? `
        <div class="order-notes-section">
          <h4 data-en="Order Notes" data-id="Catatan Pesanan">Order Notes</h4>
          <p>${order.notes}</p>
        </div>
      ` : ''}
    `;
  }

  hideOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
  }

  showLoading(show) {
    const ordersList = document.getElementById('ordersList');
    
    if (show) {
      ordersList.innerHTML = `
        <div class="orders-loading">
          <div class="spinner"></div>
        </div>
      `;
    }
  }

  showError(message) {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Error</h3>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="window.location.reload()">
          <span data-en="Retry" data-id="Coba Lagi">Retry</span>
        </button>
      </div>
    `;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new HistoryPage();
});