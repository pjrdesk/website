// emergency-fix.js - Natychmiastowe naprawienie dark mode + WCAG
// INSTRUKCJA: Dodaj ten skrypt do index.html jako ostatni przed </body>

(function() {
    'use strict';
    
    console.log('🆘 Emergency Fix Script loaded');
    
    // ================================
    // EMERGENCY THEME CONTROLLER
    // ================================
    
    class EmergencyThemeController {
        constructor() {
            this.currentTheme = 'light';
            this.init();
        }
        
        init() {
            // Detect system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.currentTheme = 'dark';
            }
            
            // Load saved theme
            try {
                const saved = localStorage.getItem('saasable-theme');
                if (saved) this.currentTheme = saved;
            } catch (e) {}
            
            // Apply initial theme
            this.applyTheme(this.currentTheme, false);
            
            // Find and setup buttons
            this.setupButtons();
            
            // Setup keyboard shortcut
            this.setupKeyboard();
            
            console.log('🌙 Emergency Theme Controller ready');
        }
        
        applyTheme(theme, save = true) {
            document.documentElement.setAttribute('data-theme', theme);
            this.currentTheme = theme;
            
            if (save) {
                try {
                    localStorage.setItem('saasable-theme', theme);
                } catch (e) {}
            }
            
            this.updateButtons();
            console.log(`🎨 Theme set to: ${theme}`);
        }
        
        toggleTheme() {
            const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(newTheme);
        }
        
        setupButtons() {
            // Find all possible theme toggle buttons
            const selectors = [
                '.theme-toggle',
                '#theme-toggle',
                '#mobile-theme-toggle',
                'button[aria-label*="motyw"]',
                'button[aria-label*="theme"]'
            ];
            
            selectors.forEach(selector => {
                const buttons = document.querySelectorAll(selector);
                buttons.forEach(button => {
                    if (button._themeSetup) return; // Avoid duplicate setup
                    
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.toggleTheme();
                    });
                    
                    button._themeSetup = true;
                    console.log('🔘 Theme button configured:', button);
                });
            });
        }
        
        updateButtons() {
            const isDark = this.currentTheme === 'dark';
            
            document.querySelectorAll('.theme-toggle').forEach(button => {
                button.setAttribute('aria-pressed', isDark.toString());
                
                // Update icons
                const sunIcon = button.querySelector('.sun-icon');
                const moonIcon = button.querySelector('.moon-icon');
                
                if (sunIcon && moonIcon) {
                    if (isDark) {
                        sunIcon.style.opacity = '0';
                        moonIcon.style.opacity = '1';
                    } else {
                        sunIcon.style.opacity = '1';
                        moonIcon.style.opacity = '0';
                    }
                }
            });
        }
        
        setupKeyboard() {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }
        
        getCurrentTheme() {
            return this.currentTheme;
        }
        
        setTheme(theme) {
            if (theme === 'light' || theme === 'dark') {
                this.applyTheme(theme);
            }
        }
    }
    
    // ================================
    // EMERGENCY ACCESSIBILITY
    // ================================
    
    class EmergencyAccessibility {
        constructor() {
            this.init();
        }
        
        init() {
            this.setupKeyboardNavigation();
            this.setupFocusRings();
            this.setupAnnouncer();
            console.log('♿ Emergency Accessibility ready');
        }
        
        setupKeyboardNavigation() {
            document.addEventListener('keydown', (e) => {
                if (e.target.matches('input, textarea, [contenteditable]')) return;
                
                switch (e.key) {
                    case 'F6':
                        e.preventDefault();
                        this.navigateLandmarks();
                        break;
                    case 'Escape':
                        this.handleEscape();
                        break;
                }
                
                if (e.altKey) {
                    switch (e.key.toLowerCase()) {
                        case 'h':
                            e.preventDefault();
                            this.navigateHeadings();
                            break;
                    }
                }
                
                if (e.ctrlKey && e.shiftKey) {
                    switch (e.key.toLowerCase()) {
                        case 'a':
                            e.preventDefault();
                            this.runQuickAudit();
                            break;
                    }
                }
            });
        }
        
        setupFocusRings() {
            // Add focus styles if missing
            if (!document.getElementById('emergency-focus-styles')) {
                const style = document.createElement('style');
                style.id = 'emergency-focus-styles';
                style.textContent = `
                    *:focus {
                        outline: 2px solid #4f46e5 !important;
                        outline-offset: 2px !important;
                    }
                    .theme-toggle:focus {
                        outline: 2px solid #4f46e5 !important;
                        outline-offset: 2px !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        setupAnnouncer() {
            if (!this.announcer) {
                this.announcer = document.createElement('div');
                this.announcer.setAttribute('aria-live', 'polite');
                this.announcer.setAttribute('aria-atomic', 'true');
                this.announcer.className = 'sr-only';
                this.announcer.style.cssText = `
                    position: absolute !important;
                    width: 1px !important;
                    height: 1px !important;
                    padding: 0 !important;
                    margin: -1px !important;
                    overflow: hidden !important;
                    clip: rect(0, 0, 0, 0) !important;
                    white-space: nowrap !important;
                    border: 0 !important;
                `;
                document.body.appendChild(this.announcer);
            }
        }
        
        announce(message) {
            if (this.announcer) {
                this.announcer.textContent = message;
                setTimeout(() => {
                    this.announcer.textContent = '';
                }, 3000);
            }
        }
        
        navigateLandmarks() {
            const landmarks = document.querySelectorAll('nav, main, header, footer, aside, [role="navigation"], [role="main"], [role="banner"], [role="contentinfo"]');
            this.navigateElements(landmarks, 'landmark');
        }
        
        navigateHeadings() {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            this.navigateElements(headings, 'heading');
        }
        
        navigateElements(elements, type) {
            if (elements.length === 0) {
                this.announce(`Nie znaleziono elementów typu: ${type}`);
                return;
            }
            
            const current = document.activeElement;
            let currentIndex = -1;
            
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].contains(current) || elements[i] === current) {
                    currentIndex = i;
                    break;
                }
            }
            
            const nextIndex = (currentIndex + 1) % elements.length;
            const nextElement = elements[nextIndex];
            
            if (nextElement) {
                nextElement.setAttribute('tabindex', '-1');
                nextElement.focus();
                nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                const text = nextElement.textContent?.trim().substring(0, 30) || type;
                this.announce(`Przejście do: ${text}`);
            }
        }
        
        handleEscape() {
            // Close mobile menu
            const mobileMenu = document.querySelector('.mobile-menu.open');
            if (mobileMenu) {
                const closeBtn = mobileMenu.querySelector('#mobile-menu-close');
                if (closeBtn) closeBtn.click();
                return;
            }
            
            // Close dropdowns
            const openDropdown = document.querySelector('[aria-expanded="true"]');
            if (openDropdown) {
                openDropdown.setAttribute('aria-expanded', 'false');
                openDropdown.focus();
            }
        }
        
        runQuickAudit() {
            console.log('🔍 Quick Accessibility Audit:');
            
            // Check images without alt
            const imagesNoAlt = document.querySelectorAll('img:not([alt])');
            if (imagesNoAlt.length > 0) {
                console.warn(`⚠️ ${imagesNoAlt.length} images missing alt text`);
            }
            
            // Check buttons without labels
            const buttonsNoLabel = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
            const unlabeledButtons = Array.from(buttonsNoLabel).filter(btn => !btn.textContent.trim());
            if (unlabeledButtons.length > 0) {
                console.warn(`⚠️ ${unlabeledButtons.length} buttons missing labels`);
            }
            
            // Check headings
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            console.log(`✅ Found ${headings.length} headings`);
            
            this.announce('Audyt dostępności ukończony - sprawdź konsolę');
        }
    }
    
    // ================================
    // EMERGENCY CSS INJECTION
    // ================================
    
    function injectEmergencyCSS() {
        if (document.getElementById('emergency-css')) return;
        
        const style = document.createElement('style');
        style.id = 'emergency-css';
        style.textContent = `
            /* Emergency CSS Variables */
            :root {
                --primary: #4f46e5;
                --text-primary: #1f2937;
                --text-secondary: #6b7280;
                --background: #ffffff;
                --surface: #ffffff;
                --border: #e5e7eb;
                --hover-overlay: rgba(0, 0, 0, 0.05);
            }
            
            :root[data-theme="dark"] {
                --text-primary: #f8fafc;
                --text-secondary: #cbd5e1;
                --background: #0f172a;
                --surface: #1e293b;
                --border: #475569;
                --hover-overlay: rgba(255, 255, 255, 0.1);
            }
            
            /* Emergency Theme Toggle Styles */
            .theme-toggle {
                position: relative !important;
                width: 44px !important;
                height: 44px !important;
                border-radius: 12px !important;
                border: 1px solid var(--border) !important;
                background: var(--surface) !important;
                color: var(--text-secondary) !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: all 0.3s ease !important;
            }
            
            .theme-toggle:hover {
                background: var(--hover-overlay) !important;
                border-color: var(--primary) !important;
                color: var(--primary) !important;
            }
            
            .theme-toggle:focus {
                outline: 2px solid var(--primary) !important;
                outline-offset: 2px !important;
            }
            
            .theme-toggle .sun-icon,
            .theme-toggle .moon-icon {
                position: absolute !important;
                transition: all 0.3s ease !important;
                width: 20px !important;
                height: 20px !important;
            }
            
            /* Body transitions */
            body {
                background-color: var(--background) !important;
                color: var(--text-primary) !important;
                transition: background-color 0.3s ease, color 0.3s ease !important;
            }
            
            /* Navigation background */
            nav {
                background: rgba(255, 255, 255, 0.95) !important;
                transition: background 0.3s ease !important;
            }
            
            :root[data-theme="dark"] nav {
                background: rgba(30, 41, 59, 0.95) !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 Emergency CSS injected');
    }
    
    // ================================
    // EMERGENCY INITIALIZATION
    // ================================
    
    function initializeEmergencyFix() {
        console.log('🆘 Initializing Emergency Fix...');
        
        // Inject CSS first
        injectEmergencyCSS();
        
        // Wait a moment for DOM
        setTimeout(() => {
            // Initialize theme controller
            const themeController = new EmergencyThemeController();
            window.EmergencyTheme = themeController;
            
            // Initialize accessibility
            const accessibility = new EmergencyAccessibility();
            window.EmergencyA11y = accessibility;
            
            // Setup global API
            window.SaasAbleEmergency = {
                setTheme: (theme) => themeController.setTheme(theme),
                getCurrentTheme: () => themeController.getCurrentTheme(),
                toggleTheme: () => themeController.toggleTheme(),
                announce: (msg) => accessibility.announce(msg),
                audit: () => accessibility.runQuickAudit()
            };
            
            // Monitor for new buttons (if navigation loads later)
            const observer = new MutationObserver(() => {
                themeController.setupButtons();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            console.log('🎉 Emergency Fix ready!');
            console.log('💡 Available commands:');
            console.log('   • SaasAbleEmergency.toggleTheme()');
            console.log('   • SaasAbleEmergency.setTheme("dark")');
            console.log('   • SaasAbleEmergency.audit()');
            console.log('   • Ctrl+Shift+L (toggle theme)');
            console.log('   • F6 (navigate landmarks)');
            console.log('   • Alt+H (navigate headings)');
            
        }, 500);
    }
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEmergencyFix);
    } else {
        initializeEmergencyFix();
    }
    
})();