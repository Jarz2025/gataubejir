// AI Customer Service System
class AICustomerService {
  constructor() {
    this.responses = {
      en: {
        greeting: "Hello! I'm your AI assistant. How can I help you with your Growtopia Shop needs today?",
        pricing: this.getPricingResponse('en'),
        payment: this.getPaymentResponse('en'),
        orderStatus: "To check your order status, please go to the Purchase History page. You can find it on the main menu. If you need specific help with an order, please provide your order ID.",
        paymentMethods: this.getPaymentMethodsResponse('en'),
        howToPay: "After placing an order, you'll receive payment instructions with our available payment methods including DANA, GoPay, OVO, ShopeePay, and Bank Transfer. Please follow the instructions provided.",
        services: "We offer two main services:\n\n💎 RGT Service - Diamond Lock & Blue Gem Lock delivery\n🎁 RPS Service - Custom item purchases\n\nWhich service are you interested in?",
        contact: "You can reach us through:\n📱 This AI chat system\n📞 Our admin will respond to orders within 24 hours\n📧 Check your email for order confirmations",
        delivery: "Items are delivered directly to your Growtopia world. Please make sure:\n✅ Your GT username is correct\n✅ Your world is accessible\n✅ You're online during delivery time",
        default: "I understand you're asking about our Growtopia Shop services. Could you please be more specific? I can help you with:\n\n• Pricing information\n• Payment methods\n• Order status\n• Service details\n• Delivery process"
      },
      id: {
        greeting: "Halo! Saya asisten AI Anda. Bagaimana saya bisa membantu Anda dengan kebutuhan Growtopia Shop hari ini?",
        pricing: this.getPricingResponse('id'),
        payment: this.getPaymentResponse('id'),
        orderStatus: "Untuk mengecek status pesanan, silakan buka halaman Riwayat Pembelian. Anda bisa menemukannya di menu utama. Jika butuh bantuan spesifik dengan pesanan, berikan ID pesanan Anda.",
        paymentMethods: this.getPaymentMethodsResponse('id'),
        howToPay: "Setelah membuat pesanan, Anda akan menerima instruksi pembayaran dengan metode yang tersedia termasuk DANA, GoPay, OVO, ShopeePay, dan Transfer Bank. Silakan ikuti instruksi yang diberikan.",
        services: "Kami menawarkan dua layanan utama:\n\n💎 Layanan RGT - Pengiriman Diamond Lock & Blue Gem Lock\n🎁 Layanan RPS - Pembelian item khusus\n\nLayanan mana yang Anda minati?",
        contact: "Anda bisa menghubungi kami melalui:\n📱 Sistem chat AI ini\n📞 Admin kami akan merespon pesanan dalam 24 jam\n📧 Cek email Anda untuk konfirmasi pesanan",
        delivery: "Item dikirim langsung ke world Growtopia Anda. Pastikan:\n✅ Username GT Anda benar\n✅ World Anda bisa diakses\n✅ Anda online saat waktu pengiriman",
        default: "Saya paham Anda bertanya tentang layanan Growtopia Shop kami. Bisakah Anda lebih spesifik? Saya bisa membantu dengan:\n\n• Informasi harga\n• Metode pembayaran\n• Status pesanan\n• Detail layanan\n• Proses pengiriman"
      }
    };
  }

  getPricingResponse(language) {
    const settings = JSON.parse(localStorage.getItem('growtopia_settings') || '{}');
    
    if (language === 'id') {
      return `Berikut adalah harga layanan kami:\n\n💎 LAYANAN RGT:\n• Diamond Lock (DL): ${this.formatCurrency(settings.dlPrice || 5000)}\n• Blue Gem Lock (BGL): ${this.formatCurrency(settings.bglPrice || 50000)}\n\n🎁 LAYANAN RPS:\n• Pembayaran BGL: ${settings.rpsBglPrice || 1} BGL per item\n• Pembayaran Clock: ${settings.rpsClockPrice || 10} Clock per item\n\nHarga dapat berubah sewaktu-waktu.`;
    }
    
    return `Here are our current prices:\n\n💎 RGT SERVICE:\n• Diamond Lock (DL): ${this.formatCurrency(settings.dlPrice || 5000)}\n• Blue Gem Lock (BGL): ${this.formatCurrency(settings.bglPrice || 50000)}\n\n🎁 RPS SERVICE:\n• BGL Payment: ${settings.rpsBglPrice || 1} BGL per item\n• Clock Payment: ${settings.rpsClockPrice || 10} Clock per item\n\nPrices may change at any time.`;
  }

  getPaymentResponse(language) {
    if (language === 'id') {
      return "Untuk melakukan pembayaran:\n\n1️⃣ Buat pesanan di website\n2️⃣ Pilih metode pembayaran\n3️⃣ Transfer sesuai nominal yang diminta\n4️⃣ Upload bukti pembayaran jika diminta\n5️⃣ Tunggu konfirmasi dari admin\n\nPesanan akan diproses dalam 1-24 jam.";
    }
    
    return "To make a payment:\n\n1️⃣ Create an order on the website\n2️⃣ Choose your payment method\n3️⃣ Transfer the exact amount requested\n4️⃣ Upload payment proof if required\n5️⃣ Wait for admin confirmation\n\nOrders will be processed within 1-24 hours.";
  }

  getPaymentMethodsResponse(language) {
    const settings = JSON.parse(localStorage.getItem('growtopia_settings') || '{}');
    const methods = settings.paymentMethods || {};
    
    if (language === 'id') {
      let response = "Metode pembayaran yang tersedia:\n\n";
      
      if (methods.dana?.number) response += `💳 DANA: ${methods.dana.number}\n`;
      if (methods.gopay?.number) response += `💚 GoPay: ${methods.gopay.number}\n`;
      if (methods.ovo?.number) response += `🟣 OVO: ${methods.ovo.number}\n`;
      if (methods.shopee?.number) response += `🛒 ShopeePay: ${methods.shopee.number}\n`;
      if (methods.bank?.number) response += `🏦 Transfer Bank: ${methods.bank.number} (${methods.bank.type})\n`;
      
      response += "\nPilih metode yang paling mudah untuk Anda!";
      return response;
    }
    
    let response = "Available payment methods:\n\n";
    
    if (methods.dana?.number) response += `💳 DANA: ${methods.dana.number}\n`;
    if (methods.gopay?.number) response += `💚 GoPay: ${methods.gopay.number}\n`;
    if (methods.ovo?.number) response += `🟣 OVO: ${methods.ovo.number}\n`;
    if (methods.shopee?.number) response += `🛒 ShopeePay: ${methods.shopee.number}\n`;
    if (methods.bank?.number) response += `🏦 Bank Transfer: ${methods.bank.number} (${methods.bank.type})\n`;
    
    response += "\nChoose the method that's most convenient for you!";
    return response;
  }

  formatCurrency(amount) {
    if (!amount) return "Contact admin for pricing";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  generateResponse(userMessage, language = 'en') {
    const message = userMessage.toLowerCase();
    
    // Keywords for different topics
    const keywords = {
      pricing: ['price', 'cost', 'harga', 'berapa', 'biaya', 'tarif'],
      payment: ['pay', 'payment', 'bayar', 'pembayaran', 'transfer'],
      paymentMethods: ['method', 'cara bayar', 'metode', 'dana', 'gopay', 'ovo', 'shopee', 'bank'],
      orderStatus: ['order', 'status', 'pesanan', 'tracking', 'where', 'dimana'],
      services: ['service', 'layanan', 'rgt', 'rps', 'what', 'apa'],
      delivery: ['deliver', 'kirim', 'pengiriman', 'world', 'username'],
      contact: ['contact', 'hubungi', 'admin', 'help', 'bantuan']
    };

    // Check which category the message belongs to
    for (const [category, keywordList] of Object.entries(keywords)) {
      if (keywordList.some(keyword => message.includes(keyword))) {
        if (category === 'paymentMethods' && (message.includes('cara') || message.includes('how'))) {
          return this.responses[language].howToPay;
        }
        return this.responses[language][category] || this.responses[language].default;
      }
    }

    // Greeting responses
    const greetings = ['hello', 'hi', 'halo', 'hai', 'good morning', 'good afternoon', 'selamat'];
    if (greetings.some(greeting => message.includes(greeting))) {
      return this.responses[language].greeting;
    }

    // Thank you responses
    const thanks = ['thank', 'thanks', 'terima kasih', 'makasih'];
    if (thanks.some(thank => message.includes(thank))) {
      return language === 'id' 
        ? "Sama-sama! Jika ada pertanyaan lain, jangan ragu untuk bertanya. Senang bisa membantu!" 
        : "You're welcome! If you have any other questions, feel free to ask. Happy to help!";
    }

    // Default response
    return this.responses[language].default;
  }

  // Get contextual follow-up questions
  getFollowUpQuestions(language = 'en') {
    if (language === 'id') {
      return [
        "Berapa harga Anda?",
        "Bagaimana cara melakukan pembayaran?",
        "Di mana pesanan saya?",
        "Metode pembayaran apa yang Anda terima?"
      ];
    }
    
    return [
      "What are your prices?",
      "How do I make a payment?",
      "Where is my order?",
      "What payment methods do you accept?"
    ];
  }
}

// Export for use in other modules
export default AICustomerService;