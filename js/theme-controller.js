// js/simple-theme-controller.js - Super Simple, No Bind Issues

(function() {
    'use strict';

    console.log('🌙 Simple Theme Controller loading...');

    // Simple Theme Controller - No complex binding
    function SimpleThemeController() {
        // Properties
        this.currentTheme = 'light';
        this.prefersDark = false;
        this.systemPreference = 'light';
        this.toggleButtons = [];
        this.announcer = null;
        this.initialized = false;
        
        // Self reference for event handlers
        var self = this;
        
        // Initialize
        this.init = function() {
            console.log('🌙 Initializing Simple Theme Controller...');
            
            try {
                // 1. Detect system preference
                self.detectSystemPreference();
                
                // 2. Load saved theme
                self.loadTheme();
                
                // 3. Apply initial theme
                self.applyTheme(self.currentTheme, false);
                
                // 4. Create announcer
                self.createAnnouncer();
                
                // 5. Find and setup buttons
                self.findAndSetupButtons();
                
                // 6. Setup keyboard shortcut
                self.setupKeyboardShortcut();
                
                // 7. Setup system preference listener
                self.setupSystemPreferenceListener();
                
                self.initialized = true;
                console.log('✅ Simple Theme Controller ready!');
                
                return true;
            } catch (error) {
                console.error('❌ Simple Theme Controller init failed:', error);
                return false;
            }
        };
        
        // Detect system preference
        this.detectSystemPreference = function() {
            if (window.matchMedia) {
                self.prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                self.systemPreference = self.prefersDark ? 'dark' : 'light';
                console.log('🔍 System preference:', self.systemPreference);
            }
        };
        
        // Load saved theme
        this.loadTheme = function() {
            try {
                var saved = localStorage.getItem('saasable-theme');
                if (saved && (saved === 'light' || saved === 'dark')) {
                    self.currentTheme = saved;
                    console.log('💾 Loaded saved theme:', saved);
                } else {
                    self.currentTheme = self.systemPreference;
                    console.log('🖥️ Using system preference:', self.systemPreference);
                }
            } catch (error) {
                console.warn('⚠️ Could not access localStorage');
                self.currentTheme = self.systemPreference;
            }
        };
        
        // Apply theme
        this.applyTheme = function(theme, save) {
            if (save === undefined) save = true;
            
            console.log('🎨 Applying theme:', theme);
            
            // Apply to document
            document.documentElement.setAttribute('data-theme', theme);
            self.currentTheme = theme;
            
            // Save to localStorage
            if (save) {
                try {
                    localStorage.setItem('saasable-theme', theme);
                    console.log('💾 Theme saved:', theme);
                } catch (error) {
                    console.warn('⚠️ Could not save theme');
                }
            }
            
            // Update buttons
            self.updateButtons();
            
            // Announce change
            self.announceThemeChange(theme);
            
            // Dispatch event
            self.dispatchThemeChangeEvent(theme);
            
            console.log('✅ Theme applied:', theme);
        };
        
        // Toggle theme
        this.toggleTheme = function() {
            var newTheme = self.currentTheme === 'light' ? 'dark' : 'light';
            console.log('🔄 Toggling theme:', self.currentTheme, '→', newTheme);
            self.applyTheme(newTheme);
        };
        
        // Create announcer for screen readers
        this.createAnnouncer = function() {
            self.announcer = document.getElementById('theme-announcer');
            
            if (!self.announcer) {
                self.announcer = document.createElement('div');
                self.announcer.id = 'theme-announcer';
                self.announcer.setAttribute('aria-live', 'polite');
                self.announcer.setAttribute('aria-atomic', 'true');
                self.announcer.style.cssText = `
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
                
                if (document.body) {
                    document.body.appendChild(self.announcer);
                } else {
                    document.addEventListener('DOMContentLoaded', function() {
                        document.body.appendChild(self.announcer);
                    });
                }
            }
        };
        
        // Find and setup all theme toggle buttons
        this.findAndSetupButtons = function() {
            console.log('🔘 Looking for theme toggle buttons...');
            
            // Clear existing
            self.toggleButtons = [];
            
            // Find all possible selectors
            var selectors = [
                '.theme-toggle',
                '#theme-toggle',
                '#mobile-theme-toggle',
                'button[aria-label*="motyw"]',
                'button[aria-label*="theme"]',
                'button[class*="theme"]'
            ];
            
            var foundCount = 0;
            
            selectors.forEach(function(selector) {
                try {
                    var buttons = document.querySelectorAll(selector);
                    console.log('🔍 Selector "' + selector + '" found ' + buttons.length + ' buttons');
                    
                    buttons.forEach(function(button) {
                        if (button && self.toggleButtons.indexOf(button) === -1) {
                            self.setupButton(button);
                            self.toggleButtons.push(button);
                            foundCount++;
                            console.log('✅ Button configured:', button);
                        }
                    });
                } catch (error) {
                    console.warn('⚠️ Error with selector "' + selector + '":', error);
                }
            });
            
            console.log('🔘 Total buttons configured:', foundCount);
            
            // If no buttons found, try again later
            if (foundCount === 0) {
                console.log('⏳ No buttons found, retrying in 1 second...');
                setTimeout(function() {
                    self.findAndSetupButtons();
                }, 1000);
            } else {
                // Update all buttons to current state
                self.updateButtons();
            }
        };
        
        // Setup individual button
        this.setupButton = function(button) {
            console.log('⚙️ Setting up button:', button);
            
            // Remove existing listeners (avoid duplicates)
            if (button._themeClickHandler) {
                button.removeEventListener('click', button._themeClickHandler);
            }
            if (button._themeKeyHandler) {
                button.removeEventListener('keydown', button._themeKeyHandler);
            }
            
            // Add click listener
            button._themeClickHandler = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Theme button clicked');
                self.toggleTheme();
            };
            button.addEventListener('click', button._themeClickHandler);
            
            // Add keyboard listener
            button._themeKeyHandler = function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('⌨️ Theme button activated via keyboard');
                    self.toggleTheme();
                }
            };
            button.addEventListener('keydown', button._themeKeyHandler);
            
            // Enhance accessibility
            self.enhanceButtonAccessibility(button);
        };
        
        // Enhance button accessibility
        this.enhanceButtonAccessibility = function(button) {
            if (!button.hasAttribute('aria-label')) {
                button.setAttribute('aria-label', 'Przełącz między trybem jasnym i ciemnym');
            }
            
            if (!button.hasAttribute('aria-pressed')) {
                button.setAttribute('aria-pressed', 'false');
            }
            
            if (!button.hasAttribute('title')) {
                button.setAttribute('title', 'Przełącz motyw (Ctrl+Shift+L)');
            }
            
            if (!button.hasAttribute('role') && button.tagName !== 'BUTTON') {
                button.setAttribute('role', 'button');
                button.setAttribute('tabindex', '0');
            }
        };
        
        // Update all buttons
        this.updateButtons = function() {
            var isDark = self.currentTheme === 'dark';
            console.log('🔄 Updating ' + self.toggleButtons.length + ' buttons for theme:', self.currentTheme);
            
            self.toggleButtons.forEach(function(button, index) {
                try {
                    // Update aria-pressed
                    button.setAttribute('aria-pressed', isDark.toString());
                    
                    // Update screen reader text
                    var srText = button.querySelector('.sr-only, .theme-toggle-text');
                    if (srText) {
                        srText.textContent = isDark ? 'Tryb ciemny aktywny' : 'Tryb jasny aktywny';
                    }
                    
                    // Update aria-label
                    button.setAttribute('aria-label', 
                        isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'
                    );
                    
                    // Update tooltip
                    button.setAttribute('title', 
                        isDark ? 'Przełącz na tryb jasny (Ctrl+Shift+L)' : 'Przełącz na tryb ciemny (Ctrl+Shift+L)'
                    );
                    
                    // Update icons if present
                    var sunIcon = button.querySelector('.sun-icon');
                    var moonIcon = button.querySelector('.moon-icon');
                    
                    if (sunIcon && moonIcon) {
                        if (isDark) {
                            sunIcon.style.opacity = '0';
                            moonIcon.style.opacity = '1';
                        } else {
                            sunIcon.style.opacity = '1';
                            moonIcon.style.opacity = '0';
                        }
                    }
                    
                    console.log('✅ Updated button ' + (index + 1) + ':', {
                        pressed: isDark,
                        label: button.getAttribute('aria-label')
                    });
                    
                } catch (error) {
                    console.error('❌ Error updating button ' + (index + 1) + ':', error);
                }
            });
        };
        
        // Setup keyboard shortcut
        this.setupKeyboardShortcut = function() {
            // Remove existing listener
            if (self.keyboardHandler) {
                document.removeEventListener('keydown', self.keyboardHandler);
            }
            
            self.keyboardHandler = function(e) {
                if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                    e.preventDefault();
                    console.log('⌨️ Keyboard shortcut Ctrl+Shift+L triggered');
                    self.toggleTheme();
                }
            };
            
            document.addEventListener('keydown', self.keyboardHandler);
            console.log('⌨️ Keyboard shortcut enabled: Ctrl+Shift+L');
        };
        
        // Setup system preference listener
        this.setupSystemPreferenceListener = function() {
            if (window.matchMedia) {
                var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                
                var handleChange = function(e) {
                    self.prefersDark = e.matches;
                    self.systemPreference = e.matches ? 'dark' : 'light';
                    
                    console.log('🖥️ System preference changed:', self.systemPreference);
                    
                    // Only auto-switch if user hasn't manually set a preference
                    var hasManualPreference = false;
                    try {
                        hasManualPreference = localStorage.getItem('saasable-theme') !== null;
                    } catch (error) {}
                    
                    if (!hasManualPreference) {
                        self.applyTheme(self.systemPreference);
                        self.announceSystemThemeChange(self.systemPreference);
                    }
                };
                
                mediaQuery.addEventListener('change', handleChange);
                
                // Support older browsers
                if (mediaQuery.addListener) {
                    mediaQuery.addListener(handleChange);
                }
            }
        };
        
        // Announce theme change
        this.announceThemeChange = function(theme) {
            if (self.announcer) {
                var message = theme === 'dark' 
                    ? 'Przełączono na tryb ciemny' 
                    : 'Przełączono na tryb jasny';
                
                self.announcer.textContent = message;
                console.log('📢 Announced:', message);
                
                setTimeout(function() {
                    if (self.announcer) {
                        self.announcer.textContent = '';
                    }
                }, 3000);
            }
        };
        
        // Announce system theme change
        this.announceSystemThemeChange = function(theme) {
            if (self.announcer) {
                var message = theme === 'dark'
                    ? 'System przełączył się na tryb ciemny'
                    : 'System przełączył się na tryb jasny';
                
                self.announcer.textContent = message;
                
                setTimeout(function() {
                    if (self.announcer) {
                        self.announcer.textContent = '';
                    }
                }, 3000);
            }
        };
        
        // Dispatch theme change event
        this.dispatchThemeChangeEvent = function(theme) {
            var event = new CustomEvent('themechange', {
                detail: {
                    theme: theme,
                    previousTheme: theme === 'dark' ? 'light' : 'dark',
                    timestamp: Date.now()
                }
            });
            
            document.dispatchEvent(event);
            console.log('📤 Theme change event dispatched:', event.detail);
        };
        
        // Public API methods
        this.getCurrentTheme = function() {
            return self.currentTheme;
        };
        
        this.setTheme = function(theme) {
            if (theme === 'light' || theme === 'dark') {
                console.log('🎯 Setting theme programmatically:', theme);
                self.applyTheme(theme);
            } else {
                console.warn('⚠️ Invalid theme:', theme, '(must be "light" or "dark")');
            }
        };
        
        this.resetToSystemPreference = function() {
            self.detectSystemPreference();
            self.applyTheme(self.systemPreference);
            
            try {
                localStorage.removeItem('saasable-theme');
                console.log('🔄 Reset to system preference:', self.systemPreference);
            } catch (error) {
                console.warn('⚠️ Could not remove theme preference');
            }
        };
        
        this.refreshButtons = function() {
            console.log('🔄 Refreshing theme buttons...');
            self.findAndSetupButtons();
        };
        
        this.getDebugInfo = function() {
            return {
                currentTheme: self.currentTheme,
                systemPreference: self.systemPreference,
                prefersDark: self.prefersDark,
                initialized: self.initialized,
                toggleButtonsCount: self.toggleButtons.length,
                toggleButtons: self.toggleButtons,
                announcerExists: !!self.announcer
            };
        };
        
        this.destroy = function() {
            // Remove keyboard listener
            if (self.keyboardHandler) {
                document.removeEventListener('keydown', self.keyboardHandler);
            }
            
            // Remove button listeners
            self.toggleButtons.forEach(function(button) {
                if (button._themeClickHandler) {
                    button.removeEventListener('click', button._themeClickHandler);
                }
                if (button._themeKeyHandler) {
                    button.removeEventListener('keydown', button._themeKeyHandler);
                }
            });
            
            // Remove announcer
            if (self.announcer && self.announcer.parentNode) {
                self.announcer.parentNode.removeChild(self.announcer);
            }
            
            self.toggleButtons = [];
            self.initialized = false;
            
            console.log('🧹 Simple Theme Controller destroyed');
        };
    }

    // Initialize function
    function initializeSimpleThemeController() {
        console.log('🚀 Initializing Simple Theme Controller...');
        
        try {
            // Create instance
            var themeController = new SimpleThemeController();
            
            // Initialize
            var success = themeController.init();
            
            if (success) {
                // Export to global scope
                window.ThemeController = themeController;
                
                // Listen for component reloads
                document.addEventListener('componentsLoaded', function() {
                    console.log('🔄 Components reloaded, refreshing theme buttons...');
                    setTimeout(function() {
                        themeController.refreshButtons();
                    }, 500);
                });
                
                // Monitor for new buttons
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList') {
                            var addedNodes = Array.prototype.slice.call(mutation.addedNodes);
                            var hasNav = addedNodes.some(function(node) {
                                return node.nodeType === Node.ELEMENT_NODE && 
                                       (node.tagName === 'NAV' || node.querySelector && node.querySelector('nav'));
                            });
                            
                            if (hasNav) {
                                console.log('🔄 Navigation detected, refreshing theme buttons...');
                                setTimeout(function() {
                                    themeController.refreshButtons();
                                }, 100);
                            }
                        }
                    });
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                
                console.log('🎉 Simple Theme Controller ready!');
                
                // Debug info after a moment
                setTimeout(function() {
                    var debugInfo = themeController.getDebugInfo();
                    console.log('🔍 Theme Controller Debug Info:', debugInfo);
                    
                    if (debugInfo.toggleButtonsCount === 0) {
                        console.warn('⚠️ No theme toggle buttons found! Check navigation component.');
                        console.log('💡 Try: window.ThemeController.refreshButtons()');
                    }
                }, 2000);
                
                return themeController;
            } else {
                throw new Error('Initialization failed');
            }
            
        } catch (error) {
            console.error('❌ Simple Theme Controller initialization failed:', error);
            return null;
        }
    }

    // Auto-initialize
    function autoInitialize() {
        var attempts = 0;
        var maxAttempts = 3;
        
        function tryInitialize() {
            attempts++;
            console.log('🔄 Simple Theme Controller attempt ' + attempts + '/' + maxAttempts);
            
            var result = initializeSimpleThemeController();
            
            if (!result && attempts < maxAttempts) {
                console.log('⏳ Retrying in ' + attempts + ' seconds...');
                setTimeout(tryInitialize, attempts * 1000);
            } else if (!result) {
                console.error('❌ Simple Theme Controller failed after all attempts');
            }
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryInitialize);
        } else {
            tryInitialize();
        }
    }

    // Start auto-initialization
    autoInitialize();

    // Export for manual use
    window.initializeThemeController = initializeSimpleThemeController;

    // Quick debug function
    window.debugTheme = function() {
        if (window.ThemeController) {
            console.table(window.ThemeController.getDebugInfo());
        } else {
            console.error('❌ Theme Controller not initialized');
        }
    };

})();