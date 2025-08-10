// Theme management
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('growtopia_theme') || 'light';
    this.themes = {
      light: {
        name: 'Light',
        icon: '☀️'
      },
      dark: {
        name: 'Dark',
        icon: '🌙'
      }
    };
  }

  init() {
    this.applyTheme();
    this.updateThemeToggle();
    this.bindEvents();
    
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addListener(() => {
        if (this.currentTheme === 'auto') {
          this.applyTheme();
        }
      });
    }
  }

  bindEvents() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('growtopia_theme', this.currentTheme);
    this.applyTheme();
    this.updateThemeToggle();
    
    // Dispatch event for other modules to listen
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: this.currentTheme }
    }));
  }

  applyTheme() {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    let themeToApply = this.currentTheme;
    
    // Handle auto theme
    if (themeToApply === 'auto') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        themeToApply = 'dark';
      } else {
        themeToApply = 'light';
      }
    }
    
    // Apply theme
    root.setAttribute('data-theme', themeToApply);
    root.classList.add(themeToApply);
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(themeToApply);
  }

  updateMetaThemeColor(theme) {
    let themeColor = '#FFFFFF';
    
    if (theme === 'dark') {
      themeColor = '#0F172A';
    }
    
    // Update existing meta tag or create new one
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = themeColor;
  }

  updateThemeToggle() {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      if (this.currentTheme === 'dark') {
        themeIcon.textContent = this.themes.dark.icon;
      } else {
        themeIcon.textContent = this.themes.light.icon;
      }
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getEffectiveTheme() {
    if (this.currentTheme === 'auto') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    }
    return this.currentTheme;
  }

  // Utility methods for theme-aware styling
  isDark() {
    return this.getEffectiveTheme() === 'dark';
  }

  isLight() {
    return this.getEffectiveTheme() === 'light';
  }

  // Get theme-appropriate colors
  getColor(colorName) {
    const colors = {
      light: {
        primary: '#3B82F6',
        secondary: '#14B8A6',
        accent: '#F97316',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#0F172A',
        textSecondary: '#475569'
      },
      dark: {
        primary: '#3B82F6',
        secondary: '#14B8A6',
        accent: '#F97316',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F8FAFC',
        textSecondary: '#CBD5E1'
      }
    };
    
    const theme = this.getEffectiveTheme();
    return colors[theme][colorName] || colors.light[colorName];
  }

  // Animate theme transition
  enableTransitions() {
    document.documentElement.style.setProperty('--transition-duration', '0.3s');
    
    setTimeout(() => {
      document.documentElement.style.removeProperty('--transition-duration');
    }, 300);
  }
}

// Create global instance
const themeManager = new ThemeManager();

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
  });
} else {
  themeManager.init();
}

// Export for use in other modules
export default themeManager;
export { themeManager };