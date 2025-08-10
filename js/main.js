import authManager from './auth.js';
import { languageManager } from './language.js';

class MainApp {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSettings();
  }

  bindEvents() {
    // Service buttons
    const rgtBtn = document.getElementById('rgtBtn');
    const rpsBtn = document.getElementById('rpsBtn');
    const csBtn = document.getElementById('csBtn');
    const historyBtn = document.getElementById('historyBtn');

    if (rgtBtn) {
      rgtBtn.addEventListener('click', () => {
        this.handleServiceClick('rgt');
      });
    }

    if (rpsBtn) {
      rpsBtn.addEventListener('click', () => {
        this.handleServiceClick('rps');
      });
    }

    if (csBtn) {
      csBtn.addEventListener('click', () => {
        window.location.href = 'cs.html';
      });
    }

    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        if (authManager.requireAuth()) {
          window.location.href = 'history.html';
        }
      });
    }

    // Admin panel access (hidden feature - click website name 5 times)
    let clickCount = 0;
    let clickTimeout;
    const websiteName = document.getElementById('websiteName');
    if (websiteName) {
      websiteName.addEventListener('click', () => {
        clickCount++;
        
        // Clear timeout if exists
        if (clickTimeout) {
          clearTimeout(clickTimeout);
        }
        
        if (clickCount === 5) {
          this.showAdminLogin();
          clickCount = 0;
        } else {
          // Reset count after 2 seconds of no clicks
          clickTimeout = setTimeout(() => {
            clickCount = 0;
          }, 2000);
        }
      });
    }
  }

  handleServiceClick(service) {
    if (!authManager.requireAuth()) {
      return;
    }

    // Redirect to service-specific order page
    if (service === 'rgt') {
      this.showRGTService();
    } else if (service === 'rps') {
      this.showRPSService();
    }
  }

  showRGTService() {
    this.createServiceModal('rgt');
  }

  showRPSService() {
    this.createServiceModal('rps');
  }

  createServiceModal(serviceType) {
    // Remove existing modal if any
    const existingModal = document.getElementById('serviceModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'serviceModal';
    modal.className = 'modal';
    modal.style.display = 'flex';

    const settings = JSON.parse(localStorage.getItem('growtopia_settings') || '{}');
    
    if (serviceType === 'rgt') {
      modal.innerHTML = this.createRGTModalContent(settings);
    } else if (serviceType === 'rps') {
      modal.innerHTML = this.createRPSModalContent(settings);
    }

    document.body.appendChild(modal);
    this.bindServiceModalEvents(modal, serviceType);
  }

  createRGTModalContent(settings) {
    const dlPrice = settings?.dlPrice || 5000;
    const bglPrice = settings?.bglPrice || 50000;
    
    return `
      <div class="modal-content large">
        <div class="modal-header">
          <h3 data-en="RGT Service Order" data-id="Pesanan Layanan RGT">RGT Service Order</h3>
          <button class="modal-close" id="closeServiceModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="service-form">
            <div class="form-group">
              <label data-en="Service Type" data-id="Jenis Layanan">Service Type</label>
              <select id="rgtServiceType">
                <option value="dl" data-en="Diamond Lock (DL)" data-id="Diamond Lock (DL)">Diamond Lock (DL)</option>
                <option value="bgl" data-en="Blue Gem Lock (BGL)" data-id="Blue Gem Lock (BGL)">Blue Gem Lock (BGL)</option>
              </select>
            </div>
            <div class="form-group">
              <label data-en="Quantity" data-id="Jumlah">Quantity</label>
              <input type="number" id="rgtQuantity" min="1" value="1">
            </div>
            <div class="form-group">
              <label data-en="Growtopia Username" data-id="Username Growtopia">Growtopia Username</label>
              <input type="text" id="gtUsername" placeholder="Enter your GT username" required>
            </div>
            <div class="form-group">
              <label data-en="World Name" data-id="Nama World">World Name</label>
              <input type="text" id="worldName" placeholder="Enter world name for delivery" required>
            </div>
            <div class="pricing-info" style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h4 style="margin-bottom: 12px; color: var(--text-primary);">Current Prices:</h4>
              <div class="price-item" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Diamond Lock (DL):</span>
                <span style="font-weight: 600;">${languageManager.formatCurrency(dlPrice)}</span>
              </div>
              <div class="price-item" style="display: flex; justify-content: space-between;">
                <span>Blue Gem Lock (BGL):</span>
                <span style="font-weight: 600;">${languageManager.formatCurrency(bglPrice)}</span>
              </div>
            </div>
            <div class="order-total" style="background: var(--primary); color: white; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
              <strong>Total: <span id="rgtTotal">${languageManager.formatCurrency(dlPrice)}</span></strong>
            </div>
            <button class="btn btn-primary btn-full" id="submitRGTOrder">
              <span data-en="Place Order" data-id="Buat Pesanan">Place Order</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  createRPSModalContent(settings) {
    const items = JSON.parse(localStorage.getItem('growtopia_rps_items') || '[]');
    const rpsBglPrice = settings?.rpsBglPrice || 1;
    const rpsClockPrice = settings?.rpsClockPrice || 10;
    
    const itemOptions = items.map(item => 
      `<option value="${item.name}" data-price="${item.price}">${item.name} - ${item.price} BGL</option>`
    ).join('');

    return `
      <div class="modal-content large">
        <div class="modal-header">
          <h3 data-en="RPS Service Order" data-id="Pesanan Layanan RPS">RPS Service Order</h3>
          <button class="modal-close" id="closeServiceModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="service-form">
            <div class="form-group">
              <label data-en="Select Item" data-id="Pilih Item">Select Item</label>
              <select id="rpsItem" required>
                <option value="" data-en="Choose an item..." data-id="Pilih item...">Choose an item...</option>
                ${itemOptions}
              </select>
            </div>
            <div class="form-group">
              <label data-en="Quantity" data-id="Jumlah">Quantity</label>
              <input type="number" id="rpsQuantity" min="1" value="1">
            </div>
            <div class="form-group">
              <label data-en="Payment Method" data-id="Metode Pembayaran">Payment Method</label>
              <select id="rpsPaymentMethod">
                <option value="bgl" data-en="BGL Payment" data-id="Pembayaran BGL">BGL Payment</option>
                <option value="clock" data-en="Clock Payment" data-id="Pembayaran Clock">Clock Payment</option>
              </select>
            </div>
            <div class="form-group">
              <label data-en="Growtopia Username" data-id="Username Growtopia">Growtopia Username</label>
              <input type="text" id="rpsGtUsername" placeholder="Enter your GT username" required>
            </div>
            <div class="form-group">
              <label data-en="World Name" data-id="Nama World">World Name</label>
              <input type="text" id="rpsWorldName" placeholder="Enter world name for delivery" required>
            </div>
            <div class="pricing-info" style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h4 style="margin-bottom: 12px; color: var(--text-primary);">Payment Rates:</h4>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>BGL Payment:</span>
                <span>1:${rpsBglPrice} BGL</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Clock Payment:</span>
                <span>1:${rpsClockPrice} Clock</span>
              </div>
            </div>
            <div class="order-total" style="background: var(--secondary); color: white; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
              <strong>Total: <span id="rpsTotal">Select an item</span></strong>
            </div>
            <button class="btn btn-primary btn-full" id="submitRPSOrder">
              <span data-en="Place Order" data-id="Buat Pesanan">Place Order</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindServiceModalEvents(modal, serviceType) {
    // Close modal events
    const closeBtn = modal.querySelector('#closeServiceModal');
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    if (serviceType === 'rgt') {
      this.bindRGTModalEvents(modal);
    } else if (serviceType === 'rps') {
      this.bindRPSModalEvents(modal);
    }

    // Re-translate the modal
    setTimeout(() => {
      languageManager.translatePage();
    }, 100);
  }

  bindRGTModalEvents(modal) {
    const serviceType = modal.querySelector('#rgtServiceType');
    const quantity = modal.querySelector('#rgtQuantity');
    const total = modal.querySelector('#rgtTotal');
    const submitBtn = modal.querySelector('#submitRGTOrder');
    
    const settings = JSON.parse(localStorage.getItem('growtopia_settings') || '{}');
    const prices = { 
      dl: settings?.dlPrice || 5000, 
      bgl: settings?.bglPrice || 50000 
    };

    const updateTotal = () => {
      const type = serviceType.value;
      const qty = parseInt(quantity.value) || 1;
      const price = prices[type] * qty;
      total.textContent = languageManager.formatCurrency(price);
    };

    serviceType.addEventListener('change', updateTotal);
    quantity.addEventListener('input', updateTotal);

    submitBtn.addEventListener('click', () => {
      this.submitRGTOrder(modal);
    });
  }

  bindRPSModalEvents(modal) {
    const item = modal.querySelector('#rpsItem');
    const quantity = modal.querySelector('#rpsQuantity');
    const paymentMethod = modal.querySelector('#rpsPaymentMethod');
    const total = modal.querySelector('#rpsTotal');
    const submitBtn = modal.querySelector('#submitRPSOrder');
    
    const settings = JSON.parse(localStorage.getItem('growtopia_settings') || '{}');
    const conversionRates = {
      bgl: settings?.rpsBglPrice || 1,
      clock: settings?.rpsClockPrice || 10
    };

    const updateTotal = () => {
      const selectedOption = item.selectedOptions[0];
      if (!selectedOption || !selectedOption.dataset.price) {
        total.textContent = 'Select an item';
        return;
      }

      const itemPrice = parseInt(selectedOption.dataset.price);
      const qty = parseInt(quantity.value) || 1;
      const method = paymentMethod.value;
      
      let totalPrice = itemPrice * qty;
      let currency = 'BGL';
      
      if (method === 'clock') {
        totalPrice = totalPrice * conversionRates.clock;
        currency = 'Clock';
      }
      
      total.textContent = `${totalPrice} ${currency}`;
    };

    item.addEventListener('change', updateTotal);
    quantity.addEventListener('input', updateTotal);
    paymentMethod.addEventListener('change', updateTotal);

    submitBtn.addEventListener('click', () => {
      this.submitRPSOrder(modal);
    });
  }

  async submitRGTOrder(modal) {
    const formData = {
      serviceType: 'RGT',
      itemType: modal.querySelector('#rgtServiceType').value,
      quantity: parseInt(modal.querySelector('#rgtQuantity').value),
      gtUsername: modal.querySelector('#gtUsername').value.trim(),
      worldName: modal.querySelector('#worldName').value.trim(),
      userId: authManager.getCurrentUser().uid,
      userEmail: authManager.getCurrentUser().email,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Validate form
    if (!formData.gtUsername || !formData.worldName) {
      alert('Please fill all required fields');
      return;
    }

    if (formData.quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }

    try {
      // Calculate total
      const settings = JSON.parse(localStorage.getItem('growtopia_settings') || '{}');
      const prices = { 
        dl: settings?.dlPrice || 5000, 
        bgl: settings?.bglPrice || 50000 
      };
      formData.totalPrice = prices[formData.itemType] * formData.quantity;
      formData.currency = 'IDR';

      // Save order
      await this.saveOrder(formData);
      
      modal.remove();
      this.showOrderSuccess();
      
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error placing order. Please try again.');
    }
  }

  async submitRPSOrder(modal) {
    const selectedItem = modal.querySelector('#rpsItem');
    const selectedOption = selectedItem.selectedOptions[0];
    
    if (!selectedOption || !selectedOption.dataset.price) {
      alert('Please select an item');
      return;
    }

    const formData = {
      serviceType: 'RPS',
      itemName: selectedItem.value,
      itemPrice: parseInt(selectedOption.dataset.price),
      quantity: parseInt(modal.querySelector('#rpsQuantity').value),
      paymentMethod: modal.querySelector('#rpsPaymentMethod').value,
      gtUsername: modal.querySelector('#rpsGtUsername').value.trim(),
      worldName: modal.querySelector('#rpsWorldName').value.trim(),
      userId: authManager.getCurrentUser().uid,
      userEmail: authManager.getCurrentUser().email,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Validate form
    if (!formData.gtUsername || !formData.worldName) {
      alert('Please fill all required fields');
      return;
    }

    if (formData.quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }

    try {
      // Calculate total
      const settings = JSON.parse(localStorage.getItem('growtopia_settings') || '{}');
      const conversionRates = {
        bgl: settings?.rpsBglPrice || 1,
        clock: settings?.rpsClockPrice || 10
      };

      formData.totalPrice = formData.itemPrice * formData.quantity;
      if (formData.paymentMethod === 'clock') {
        formData.totalPrice *= conversionRates.clock;
        formData.currency = 'Clock';
      } else {
        formData.currency = 'BGL';
      }

      // Save order
      await this.saveOrder(formData);
      
      modal.remove();
      this.showOrderSuccess();
      
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error placing order. Please try again.');
    }
  }

  async saveOrder(orderData) {
    // Generate order ID
    orderData.orderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('growtopia_orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('growtopia_orders', JSON.stringify(orders));

    // Send notification (mock implementation)
    this.sendOrderNotification(orderData);
  }

  async sendOrderNotification(orderData) {
    console.log('📧 Order notification sent:', orderData.orderId);
    
    // In production, this would send to actual Telegram bot
    const settings = JSON.parse(localStorage.getItem('growtopia_settings') || '{}');
    if (settings?.telegram?.botToken && settings?.telegram?.chatId) {
      const message = this.formatTelegramMessage(orderData);
      console.log('📱 Telegram message:', message);
    }
  }

  formatTelegramMessage(orderData) {
    return `
🔔 *New Order Received!*

📋 Order ID: \`${orderData.orderId}\`
👤 Customer: ${orderData.userEmail}
🎮 GT Username: ${orderData.gtUsername}
🌍 World: ${orderData.worldName}
📦 Service: ${orderData.serviceType}
${orderData.itemType ? `💎 Item: ${orderData.itemType.toUpperCase()}` : `🎁 Item: ${orderData.itemName}`}
📊 Quantity: ${orderData.quantity}
${orderData.paymentMethod ? `💳 Payment: ${orderData.paymentMethod.toUpperCase()}` : ''}
💰 Total: ${orderData.totalPrice} ${orderData.currency}
⏰ Time: ${new Date().toLocaleString()}

⚡ Please process this order as soon as possible.
    `.trim();
  }

  showOrderSuccess() {
    // Create success modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-body" style="text-align: center; padding: 40px 24px;">
          <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
          <h3 style="color: var(--success); margin-bottom: 16px;">Order Placed Successfully!</h3>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">
            Your order has been received and will be processed within 1-24 hours.
            You can track your order status in Purchase History.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn btn-primary" onclick="window.location.href='history.html'">
              View History
            </button>
            <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(modal)) {
        modal.remove();
      }
    }, 10000);
  }

  showAdminLogin() {
    const password = prompt('🔒 Enter admin password:');
    if (password === 'admin123') {
      localStorage.setItem('growtopia_admin_session', 'true');
      window.location.href = 'admin.html';
    } else if (password !== null) {
      alert('❌ Invalid password');
    }
  }

  loadSettings() {
    const settings = JSON.parse(localStorage.getItem('growtopia_settings') || '{}');
    if (settings?.websiteName) {
      const websiteName = document.getElementById('websiteName');
      if (websiteName) {
        websiteName.textContent = settings.websiteName;
      }
      
      // Update page title
      document.title = settings.websiteName;
    }
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  new MainApp();
});