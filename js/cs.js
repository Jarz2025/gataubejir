import AICustomerService from './ai-cs.js';
import { languageManager } from './language.js';

class CustomerServiceChat {
  constructor() {
    this.aiService = new AICustomerService();
    this.messages = [];
    this.currentLanguage = 'en';
    this.init();
  }

  init() {
    this.loadMessages();
    this.bindEvents();
    this.setupInitialMessage();
    this.updateQuickQuestions();
    
    // Listen for language changes
    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
      this.updateQuickQuestions();
      this.updatePlaceholders();
    });
  }

  bindEvents() {
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const quickQuestionBtns = document.querySelectorAll('.quick-question-btn');

    // Send message
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        this.sendMessage();
      });
    }

    // Enter key to send
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Clear chat
    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', () => {
        this.clearChat();
      });
    }

    // Quick questions
    quickQuestionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const question = this.currentLanguage === 'en' 
          ? btn.dataset.question 
          : btn.dataset.questionId;
        this.sendQuickQuestion(question);
      });
    });
  }

  setupInitialMessage() {
    const initialTime = document.getElementById('initialMessageTime');
    if (initialTime) {
      initialTime.textContent = this.formatTime(new Date());
    }
  }

  updateQuickQuestions() {
    const questions = this.aiService.getFollowUpQuestions(this.currentLanguage);
    const buttons = document.querySelectorAll('.quick-question-btn');
    
    buttons.forEach((btn, index) => {
      if (questions[index]) {
        const span = btn.querySelector('span');
        if (span) {
          span.textContent = questions[index];
        }
        if (this.currentLanguage === 'en') {
          btn.dataset.question = questions[index];
        } else {
          btn.dataset.questionId = questions[index];
        }
      }
    });
  }

  updatePlaceholders() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      const placeholder = this.currentLanguage === 'en' 
        ? 'Type your message...' 
        : 'Ketik pesan Anda...';
      chatInput.placeholder = placeholder;
    }
  }

  loadMessages() {
    // Load messages from localStorage
    const savedMessages = localStorage.getItem('growtopia_chat_messages');
    if (savedMessages) {
      try {
        this.messages = JSON.parse(savedMessages);
        this.renderMessages();
      } catch (error) {
        console.error('Error loading chat messages:', error);
        this.messages = [];
      }
    }
  }

  saveMessages() {
    localStorage.setItem('growtopia_chat_messages', JSON.stringify(this.messages));
  }

  async sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Clear input
    chatInput.value = '';
    
    // Add user message
    this.addMessage('user', message);
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Generate AI response
    setTimeout(() => {
      const aiResponse = this.aiService.generateResponse(message, this.currentLanguage);
      this.hideTypingIndicator();
      this.addMessage('ai', aiResponse);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }

  sendQuickQuestion(question) {
    const chatInput = document.getElementById('chatInput');
    chatInput.value = question;
    this.sendMessage();
  }

  addMessage(sender, text) {
    const messageObj = {
      id: Date.now() + Math.random(),
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(messageObj);
    this.saveMessages();
    this.renderMessage(messageObj);
    this.scrollToBottom();
  }

  renderMessages() {
    const chatMessages = document.getElementById('chatMessages');
    // Keep the initial AI message, remove others
    const initialMessage = chatMessages.querySelector('.ai-message');
    chatMessages.innerHTML = '';
    if (initialMessage) {
      chatMessages.appendChild(initialMessage);
    }
    
    this.messages.forEach(message => {
      this.renderMessage(message);
    });
    
    this.scrollToBottom();
  }

  renderMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.sender}-message`;
    
    const avatar = message.sender === 'ai' ? '🤖' : '👤';
    const messageClass = message.sender === 'ai' ? 'ai-message' : 'user-message';
    
    messageElement.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <div class="message-text">${this.formatMessageText(message.text)}</div>
        <div class="message-time">${this.formatTime(message.timestamp)}</div>
      </div>
    `;
    
    chatMessages.appendChild(messageElement);
  }

  formatMessageText(text) {
    // Convert line breaks to HTML
    return text.replace(/\n/g, '<br>');
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  showTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.style.display = 'flex';
    }
    
    // Disable send button
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
      sendBtn.disabled = true;
    }
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.style.display = 'none';
    }
    
    // Enable send button
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
      sendBtn.disabled = false;
    }
  }

  scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  clearChat() {
    if (confirm(this.currentLanguage === 'en' 
      ? 'Are you sure you want to clear the chat?' 
      : 'Apakah Anda yakin ingin menghapus chat?'
    )) {
      this.messages = [];
      this.saveMessages();
      
      const chatMessages = document.getElementById('chatMessages');
      // Keep only the initial AI message
      const initialMessage = chatMessages.querySelector('.ai-message');
      chatMessages.innerHTML = '';
      if (initialMessage) {
        chatMessages.appendChild(initialMessage);
      }
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CustomerServiceChat();
});