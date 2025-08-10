// Language management
class LanguageManager {
  constructor() {
    this.currentLanguage = localStorage.getItem('growtopia_language') || 'en';
    this.translations = {
      en: {
        // Common
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        'cancel': 'Cancel',
        'save': 'Save',
        'delete': 'Delete',
        'edit': 'Edit',
        'confirm': 'Confirm',
        'yes': 'Yes',
        'no': 'No',
        
        // Navigation
        'home': 'Home',
        'login': 'Login',
        'register': 'Register',
        'logout': 'Logout',
        'admin': 'Admin Panel',
        'customer_service': 'Customer Service',
        'purchase_history': 'Purchase History',
        
        // Authentication
        'email': 'Email',
        'password': 'Password',
        'confirm_password': 'Confirm Password',
        'username': 'Username',
        'login_required': 'Login Required',
        'invalid_credentials': 'Invalid credentials',
        'registration_successful': 'Registration successful',
        'passwords_dont_match': 'Passwords don\'t match',
        
        // Services
        'rgt_service': 'RGT Service',
        'rps_service': 'RPS Service',
        'diamond_lock': 'Diamond Lock',
        'blue_gem_lock': 'Blue Gem Lock',
        
        // Status
        'pending': 'Pending',
        'processed': 'Processed',
        'rejected': 'Rejected',
        'online': 'Online',
        'offline': 'Offline',
        
        // Orders
        'order_id': 'Order ID',
        'order_date': 'Order Date',
        'order_status': 'Order Status',
        'order_total': 'Total',
        'no_orders': 'No orders found',
        'order_details': 'Order Details',
        
        // Settings
        'settings': 'Settings',
        'website_name': 'Website Name',
        'save_changes': 'Save Changes',
        'settings_saved': 'Settings saved successfully',
        
        // Payment
        'payment_method': 'Payment Method',
        'payment_methods': 'Payment Methods',
        'account_number': 'Account Number',
        'account_name': 'Account Name',
        
        // Time
        'just_now': 'Just now',
        'minutes_ago': '{0} minutes ago',
        'hours_ago': '{0} hours ago',
        'days_ago': '{0} days ago',
        
        // AI Chat
        'ai_assistant': 'AI Assistant',
        'type_message': 'Type your message...',
        'ai_typing': 'AI is typing...',
        'clear_chat': 'Clear Chat',
        'quick_questions': 'Quick Questions:',
        
        // Common phrases
        'welcome_message': 'Welcome to Growtopia Shop',
        'choose_service': 'Choose your service below',
        'back': '← Back',
        'theme': 'Theme',
        'start_shopping': 'Start Shopping'
      },
      id: {
        // Common
        'loading': 'Memuat...',
        'error': 'Kesalahan',
        'success': 'Berhasil',
        'cancel': 'Batal',
        'save': 'Simpan',
        'delete': 'Hapus',
        'edit': 'Edit',
        'confirm': 'Konfirmasi',
        'yes': 'Ya',
        'no': 'Tidak',
        
        // Navigation
        'home': 'Beranda',
        'login': 'Masuk',
        'register': 'Daftar',
        'logout': 'Keluar',
        'admin': 'Panel Admin',
        'customer_service': 'Layanan Pelanggan',
        'purchase_history': 'Riwayat Pembelian',
        
        // Authentication
        'email': 'Email',
        'password': 'Kata Sandi',
        'confirm_password': 'Konfirmasi Kata Sandi',
        'username': 'Nama Pengguna',
        'login_required': 'Login Diperlukan',
        'invalid_credentials': 'Kredensial tidak valid',
        'registration_successful': 'Registrasi berhasil',
        'passwords_dont_match': 'Kata sandi tidak cocok',
        
        // Services
        'rgt_service': 'Layanan RGT',
        'rps_service': 'Layanan RPS',
        'diamond_lock': 'Diamond Lock',
        'blue_gem_lock': 'Blue Gem Lock',
        
        // Status
        'pending': 'Menunggu',
        'processed': 'Diproses',
        'rejected': 'Ditolak',
        'online': 'Online',
        'offline': 'Offline',
        
        // Orders
        'order_id': 'ID Pesanan',
        'order_date': 'Tanggal Pesanan',
        'order_status': 'Status Pesanan',
        'order_total': 'Total',
        'no_orders': 'Tidak ada pesanan ditemukan',
        'order_details': 'Detail Pesanan',
        
        // Settings
        'settings': 'Pengaturan',
        'website_name': 'Nama Website',
        'save_changes': 'Simpan Perubahan',
        'settings_saved': 'Pengaturan berhasil disimpan',
        
        // Payment
        'payment_method': 'Metode Pembayaran',
        'payment_methods': 'Metode Pembayaran',
        'account_number': 'Nomor Rekening',
        'account_name': 'Nama Rekening',
        
        // Time
        'just_now': 'Baru saja',
        'minutes_ago': '{0} menit yang lalu',
        'hours_ago': '{0} jam yang lalu',
        'days_ago': '{0} hari yang lalu',
        
        // AI Chat
        'ai_assistant': 'Asisten AI',
        'type_message': 'Ketik pesan Anda...',
        'ai_typing': 'AI sedang mengetik...',
        'clear_chat': 'Hapus Chat',
        'quick_questions': 'Pertanyaan Cepat:',
        
        // Common phrases
        'welcome_message': 'Selamat Datang di Growtopia Shop',
        'choose_service': 'Pilih layanan Anda di bawah',
        'back': '← Kembali',
        'theme': 'Tema',
        'start_shopping': 'Mulai Belanja'
      }
    };
  }

  init() {
    this.updateLanguageToggle();
    this.translatePage();
    this.bindEvents();
  }

  bindEvents() {
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
      languageToggle.addEventListener('click', () => {
        this.toggleLanguage();
      });
    }
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'id' : 'en';
    localStorage.setItem('growtopia_language', this.currentLanguage);
    this.updateLanguageToggle();
    this.translatePage();
    
    // Dispatch event for other modules to listen
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: this.currentLanguage }
    }));
  }

  updateLanguageToggle() {
    const languageText = document.querySelector('.language-text');
    if (languageText) {
      languageText.textContent = this.currentLanguage.toUpperCase();
    }
  }

  translatePage() {
    // Translate elements with data attributes
    const elementsWithDataLang = document.querySelectorAll('[data-en], [data-id]');
    elementsWithDataLang.forEach(element => {
      const key = this.currentLanguage === 'en' ? 'data-en' : 'data-id';
      const translation = element.getAttribute(key);
      if (translation) {
        if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email' || element.type === 'password')) {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // Handle placeholders specifically
    const elementsWithPlaceholder = document.querySelectorAll('[data-en-placeholder], [data-id-placeholder]');
    elementsWithPlaceholder.forEach(element => {
      const key = this.currentLanguage === 'en' ? 'data-en-placeholder' : 'data-id-placeholder';
      const translation = element.getAttribute(key);
      if (translation) {
        element.placeholder = translation;
      }
    });

    // Handle select options
    const selectElements = document.querySelectorAll('select option[data-en], select option[data-id]');
    selectElements.forEach(option => {
      const key = this.currentLanguage === 'en' ? 'data-en' : 'data-id';
      const translation = option.getAttribute(key);
      if (translation) {
        option.textContent = translation;
      }
    });
  }

  translate(key, ...args) {
    let translation = this.translations[this.currentLanguage][key] || this.translations['en'][key] || key;
    
    // Handle placeholders in translations
    args.forEach((arg, index) => {
      translation = translation.replace(`{${index}}`, arg);
    });
    
    return translation;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return this.translate('just_now');
    } else if (minutes < 60) {
      return this.translate('minutes_ago', minutes);
    } else if (hours < 24) {
      return this.translate('hours_ago', hours);
    } else {
      return this.translate('days_ago', days);
    }
  }

  formatDate(date) {
    const dateObj = new Date(date);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return dateObj.toLocaleDateString(this.currentLanguage === 'id' ? 'id-ID' : 'en-US', options);
  }

  formatCurrency(amount, currency = 'IDR') {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    }
    return amount.toLocaleString();
  }
}

// Create global instance
const languageManager = new LanguageManager();

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    languageManager.init();
  });
} else {
  languageManager.init();
}

// Export for use in other modules
export default languageManager;
export { languageManager };