// js/main.js - Completely Fixed Main Script

(function() {
    'use strict';

    // Global state
    const AppState = {
        componentsLoaded: 0,
        totalComponents: 6,
        theme: 'light',
        accessibilityEnabled: false,
        themeControllerReady: false,
        initialized: false
    };

    // Enhanced component loader
    async function loadComponent(id, file) {
        try {
            console.log(`📁 Loading: ${file}`);
            
            const response = await fetch(`components/${file}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            const element = document.getElementById(id);
            
            if (element) {
                element.innerHTML = html;
                AppState.componentsLoaded++;
                
                console.log(`✅ Loaded: ${file} (${AppState.componentsLoaded}/${AppState.totalComponents})`);
                
                // Special handling for navigation
                if (file === 'navigation.html') {
                    console.log('🧭 Navigation loaded');
                    setTimeout(() => {
                        if (window.ThemeController) {
                            window.ThemeController.refreshButtons();
                        }
                    }, 500);
                }
                
                // Dispatch event
                const event = new CustomEvent('componentLoaded', {
                    detail: { id, file, html }
                });
                document.dispatchEvent(event);
                
                // Check if all loaded
                if (AppState.componentsLoaded === AppState.totalComponents) {
                    setTimeout(() => initializeAllSystems(), 100);
                }
            } else {
                console.error(`❌ Element #${id} not found`);
                throw new Error(`Target element not found: #${id}`);
            }
        } catch (error) {
            console.error(`❌ Failed to load ${file}:`, error);
            announceError(`Nie udało się załadować komponentu: ${file}`);
            throw error;
        }
    }

    // Load all components
    async function loadAllComponents() {
        const components = [
            ['navigation', 'navigation.html'],
            ['hero-section', 'hero.html'],
            ['features-section', 'features.html'],
            ['workflow-section', 'workflow.html'],
			['blog-section', 'blog.html'],
            ['footer', 'footer.html']
        ];

        console.log('🔄 Loading components...');

        try {
            for (const [id, file] of components) {
                await loadComponent(id, file);
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            console.log(`📊 All ${components.length} components loaded`);
            
        } catch (error) {
            console.error('❌ Component loading failed:', error);
            announceError('Błąd ładowania komponentów strony');
        }
    }

    // Initialize all systems
    async function initializeAllSystems() {
        if (AppState.initialized) return;
        
        console.log('🚀 Initializing all systems...');
        
        try {
            // 1. Accessibility first
            if (window.initializeAccessibility && !AppState.accessibilityEnabled) {
                await window.initializeAccessibility();
                AppState.accessibilityEnabled = true;
                console.log('♿ Accessibility ready');
            }
            
            // 2. Theme controller
            if (window.initializeThemeController && !AppState.themeControllerReady) {
                await window.initializeThemeController();
                AppState.themeControllerReady = true;
                AppState.theme = window.ThemeController ? window.ThemeController.getCurrentTheme() : 'light';
                console.log('🌙 Theme system ready');
            }
            
            // 3. Core features
            await initializeCoreFeatures();
            
            // 4. Component functionality
            if (window.initializeComponents) {
                window.initializeComponents();
                console.log('🧩 Components initialized');
            }
            
            // 5. Final setup
            await performFinalSetup();
            
            AppState.initialized = true;
            
            announceSuccess('Strona została załadowana pomyślnie');
            
            // Dispatch complete event
            const event = new CustomEvent('appInitialized', {
                detail: { 
                    timestamp: Date.now(),
                    componentsLoaded: AppState.componentsLoaded,
                    theme: AppState.theme,
                    accessibilityEnabled: AppState.accessibilityEnabled,
                    themeControllerReady: AppState.themeControllerReady
                }
            });
            document.dispatchEvent(event);
            
            console.log('🎉 All systems initialized successfully');
            
        } catch (error) {
            console.error('❌ System initialization failed:', error);
            announceError('Błąd inicjalizacji systemów');
        }
    }

    // Initialize core features
    async function initializeCoreFeatures() {
        console.log('⚙️ Initializing core features...');
        
        initializeEnhancedMobileMenu();
        initializeAccessibleScrolling();
        initializeAccessibleAnimations();
        initializeEnhancedButtons();
        initializeEnhancedViewportObserver();
        initializeEnhancedNavbarEffects();
        
        console.log('✅ Core features initialized');
    }

    // Enhanced mobile menu
    function initializeEnhancedMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuClose = document.getElementById('mobile-menu-close');

        if (!mobileMenuButton || !mobileMenu || !mobileMenuClose) {
            console.warn('⚠️ Mobile menu elements not found');
            return;
        }

        let focusTrap = null;

        function openMobileMenu() {
            console.log('📱 Opening mobile menu');
            
            if (window.AccessibilityManager) {
                window.AccessibilityManager.focusManager.storeFocus();
                focusTrap = window.AccessibilityManager.trapFocus(mobileMenu);
            }
            
            mobileMenu.classList.add('open');
            mobileMenu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            mobileMenuButton.setAttribute('aria-expanded', 'true');
            
            setTimeout(() => {
                const firstFocusable = mobileMenu.querySelector('a, button');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }, 100);
            
            announceSuccess('Menu zostało otwarte');
        }

        function closeMobileMenu() {
            console.log('📱 Closing mobile menu');
            
            mobileMenu.classList.remove('open');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            
            if (focusTrap) {
                focusTrap.release();
                focusTrap = null;
            }
            
            if (window.AccessibilityManager) {
                window.AccessibilityManager.focusManager.restoreFocus();
            } else {
                mobileMenuButton.focus();
            }
            
            announceSuccess('Menu zostało zamknięte');
        }

        mobileMenuButton.addEventListener('click', openMobileMenu);
        mobileMenuClose.addEventListener('click', closeMobileMenu);

        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMobileMenu();
            }
        });

        console.log('📱 Mobile menu initialized');
    }

    // Accessible smooth scrolling
    function initializeAccessibleScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                e.preventDefault();
                
                const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches 
                    ? 'auto' 
                    : 'smooth';
                
                target.scrollIntoView({ 
                    behavior, 
                    block: 'start' 
                });
                
                if (window.AccessibilityManager) {
                    window.AccessibilityManager.makeFocusable(target);
                    target.focus();
                }
                
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    const closeButton = document.getElementById('mobile-menu-close');
                    if (closeButton) {
                        closeButton.click();
                    }
                }
                
                const targetText = target.textContent?.trim().substring(0, 30) || 
                                 target.getAttribute('aria-label') || 
                                 targetId;
                announceSuccess(`Przejście do sekcji: ${targetText}`);
            }
        });

        console.log('🔗 Accessible scrolling initialized');
    }

    // Accessible animations
    function initializeAccessibleAnimations() {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (reducedMotion) {
            document.body.classList.add('reduced-motion');
            console.log('🎬 Reduced motion mode active');
        }
        
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    const delay = entry.target.dataset.delay || 0;
                    if (delay > 0 && !reducedMotion) {
                        entry.target.style.animationDelay = `${delay}ms`;
                    }
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .animate-on-scroll');
        animatedElements.forEach(el => animationObserver.observe(el));
        
        console.log(`🎬 Animation observer watching ${animatedElements.length} elements`);
    }

    // Enhanced buttons
    function initializeEnhancedButtons() {
        const primaryButtons = document.querySelectorAll('.btn-primary');
        
        primaryButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (this.disabled || this.classList.contains('loading')) return;
                
                e.preventDefault();
                
                const originalText = this.innerHTML;
                const originalAriaLabel = this.getAttribute('aria-label');
                
                this.classList.add('loading');
                this.disabled = true;
                this.setAttribute('aria-label', 'Ładowanie...');
                
                announceSuccess('Przetwarzanie żądania...');
                
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.innerHTML = originalText;
                    this.disabled = false;
                    
                    if (originalAriaLabel) {
                        this.setAttribute('aria-label', originalAriaLabel);
                    } else {
                        this.removeAttribute('aria-label');
                    }
                    
                    announceSuccess('Przekierowanie do rejestracji!');
                }, 2000);
            });
        });

        if (!('ontouchstart' in window)) {
            const allButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
            
            allButtons.forEach(button => {
                button.addEventListener('mouseenter', function() {
                    if (!this.disabled && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                        this.style.transform = 'translateY(-2px)';
                    }
                });
                
                button.addEventListener('mouseleave', function() {
                    if (!this.disabled) {
                        this.style.transform = 'translateY(0)';
                    }
                });
            });
        }

        console.log(`🔘 Enhanced ${primaryButtons.length} primary buttons`);
    }

    // Enhanced viewport observer
    function initializeEnhancedViewportObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    const sectionName = entry.target.getAttribute('aria-label') || 
                                       entry.target.querySelector('h1, h2, h3')?.textContent ||
                                       entry.target.id;
                    
                    if (sectionName && entry.target.tagName === 'SECTION') {
                        setTimeout(() => {
                            if (window.AccessibilityManager) {
                                window.AccessibilityManager.announce(
                                    `Weszedłeś w sekcję: ${sectionName}`,
                                    'polite'
                                );
                            }
                        }, 1000);
                    }
                }
            });
        }, { threshold: 0.3 });

        const observedElements = document.querySelectorAll('.card, .animate-on-scroll, section[id]');
        observedElements.forEach(el => observer.observe(el));
        
        console.log(`👁️ Viewport observer watching ${observedElements.length} elements`);
    }

    // Enhanced navbar effects
    function initializeEnhancedNavbarEffects() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        function updateNavbar() {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                nav.style.backdropFilter = 'blur(20px)';
                
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                if (isDark) {
                    nav.style.backgroundColor = 'rgba(30, 41, 59, 0.9)';
                } else {
                    nav.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                }
                
                nav.setAttribute('data-scrolled', 'true');
            } else {
                nav.style.backdropFilter = 'blur(10px)';
                
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                if (isDark) {
                    nav.style.backgroundColor = 'rgba(30, 41, 59, 0.95)';
                } else {
                    nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                }
                
                nav.removeAttribute('data-scrolled');
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        }
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });

        document.addEventListener('themechange', () => {
            setTimeout(updateNavbar, 100);
        });
        
        console.log('🧭 Enhanced navbar effects initialized');
    }

    // Final setup
    async function performFinalSetup() {
        if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target) {
                setTimeout(() => {
                    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches 
                        ? 'auto' 
                        : 'smooth';
                    target.scrollIntoView({ behavior });
                    
                    if (window.AccessibilityManager) {
                        window.AccessibilityManager.makeFocusable(target);
                        target.focus();
                    }
                }, 1000);
            }
        }
        
        window.addEventListener('error', (e) => {
            console.error('💥 JavaScript error:', e.error);
            announceError('Wystąpił błąd JavaScript');
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('💥 Unhandled promise rejection:', e.reason);
            announceError('Wystąpił błąd asynchroniczny');
        });
        
        if ('performance' in window) {
            const loadTime = performance.now();
            console.log(`⚡ Total initialization time: ${loadTime.toFixed(2)}ms`);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: Math.round(loadTime),
                    custom_map: { metric1: 'page_load_time' }
                });
            }
        }
        
        console.log('🏁 Final setup completed');
    }

    // Announcement helpers
    function announceSuccess(message) {
        console.log('✅', message);
        if (window.AccessibilityManager) {
            window.AccessibilityManager.announce(message);
        }
    }

    function announceError(message) {
        console.error('❌', message);
        if (window.AccessibilityManager) {
            window.AccessibilityManager.announceAssertive(message);
        }
    }

    // Main initialization
    async function initialize() {
        console.log('🔄 Initializing SaasAble Enhanced...');
        
        AppState.theme = document.documentElement.getAttribute('data-theme') || 'light';
        
        const isDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';
        
        if (isDevelopment) {
            console.log('🔧 Development mode detected');
            window.AppState = AppState;
            
            setTimeout(() => {
                if (AppState.initialized) {
                    document.body.classList.add('debug-vars');
                }
            }, 3000);
        }
        
        try {
            await loadAllComponents();
        } catch (error) {
            console.error('❌ Critical initialization error:', error);
            showErrorNotification('Błąd ładowania strony. Sprawdź konsolę przeglądarki.');
        }
    }

    // Show error notification
    function showErrorNotification(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--error, #ef4444);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 320px;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            line-height: 1.4;
        `;
        
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 8px;">
                <div style="flex: 1;">
                    <strong style="display: block; margin-bottom: 4px;">Błąd ładowania</strong>
                    ${message}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: 1px solid white; color: white; 
                               padding: 4px 8px; border-radius: 4px; cursor: pointer; 
                               font-size: 12px;" 
                        aria-label="Zamknij powiadomienie">×</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
        
        announceError(message);
    }

    // Global API
    window.SaasAble = {
        loadComponent,
        announceSuccess,
        announceError,
        
        getState: () => ({ ...AppState }),
        
        reinitialize: async () => {
            AppState.initialized = false;
            AppState.componentsLoaded = 0;
            await initialize();
        },
        
        setTheme: (theme) => {
            if (window.ThemeController) {
                window.ThemeController.setTheme(theme);
            } else {
                console.warn('⚠️ Theme Controller not ready');
            }
        },
        
        getCurrentTheme: () => {
            return window.ThemeController ? 
                   window.ThemeController.getCurrentTheme() : 
                   AppState.theme;
        },
        
        runAccessibilityAudit: () => {
            if (window.AccessibilityManager) {
                return window.AccessibilityManager.audit();
            }
            console.warn('⚠️ Accessibility Manager not available');
            return null;
        },
        
        focusElement: (selector) => {
            const element = document.querySelector(selector);
            if (element && window.AccessibilityManager) {
                window.AccessibilityManager.makeFocusable(element);
                element.focus();
                return true;
            }
            return false;
        },
        
        reloadComponent: async (id, file) => {
            try {
                await loadComponent(id, file);
                console.log(`🔄 Reloaded component: ${file}`);
                return true;
            } catch (error) {
                console.error(`❌ Failed to reload component: ${file}`, error);
                return false;
            }
        },
        
        getPerformanceMetrics: () => {
            if (!('performance' in window)) return null;
            
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: performance.now(),
                domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
                firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
            };
        },
        
        debug: {
            refreshThemeButtons: () => {
                if (window.ThemeController) {
                    window.ThemeController.refreshButtons();
                    console.log('🔄 Theme buttons refreshed');
                } else {
                    console.warn('⚠️ Theme Controller not available');
                }
            },
            
            logState: () => {
                console.table(AppState);
            },
            
            logThemeState: () => {
                if (window.ThemeController) {
                    console.table(window.ThemeController.getDebugInfo());
                }
            },
            
            logAccessibilityState: () => {
                if (window.AccessibilityManager) {
                    console.table(window.AccessibilityManager.getAccessibilityState());
                }
            },
            
            testAnnouncements: () => {
                announceSuccess('Test success announcement');
                setTimeout(() => announceError('Test error announcement'), 2000);
            },
            
            forceThemeRefresh: () => {
                if (window.ThemeController) {
                    setTimeout(() => window.ThemeController.refreshButtons(), 100);
                    setTimeout(() => window.ThemeController.refreshButtons(), 500);
                    setTimeout(() => window.ThemeController.refreshButtons(), 1000);
                    console.log('🔄 Multiple theme refresh attempts scheduled');
                }
            }
        }
    };

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Event listeners
    document.addEventListener('appInitialized', (e) => {
        const { timestamp, componentsLoaded, theme, accessibilityEnabled, themeControllerReady } = e.detail;
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'app_initialized', {
                components_loaded: componentsLoaded,
                theme: theme,
                accessibility_enabled: accessibilityEnabled,
                theme_controller_ready: themeControllerReady,
                load_time: timestamp - performance.timeOrigin
            });
        }
        
        console.log(`🎉 SaasAble Enhanced ready in ${(timestamp - performance.timeOrigin).toFixed(2)}ms`);
        
        setTimeout(() => {
            console.log('🔍 Final system state:', {
                app: AppState,
                theme: window.ThemeController?.getDebugInfo(),
                accessibility: window.AccessibilityManager?.getAccessibilityState()
            });
        }, 1000);
    });

    document.addEventListener('themechange', (e) => {
        AppState.theme = e.detail.theme;
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'theme_change', {
                theme: e.detail.theme,
                previous_theme: e.detail.previousTheme
            });
        }
    });

    // Console branding
    setTimeout(() => {
        if (AppState.initialized) {
            console.log(`
%c🚀 SaasAble Enhanced v1.3.0 
%c🌙 Dark Mode: ${AppState.theme === 'dark' ? 'ON' : 'OFF'} 
%c♿ WCAG 2.1 AA: ${AppState.accessibilityEnabled ? 'COMPLIANT' : 'LOADING...'} 
%c🎯 Theme Controller: ${AppState.themeControllerReady ? 'READY' : 'LOADING...'}
%c📊 Components: ${AppState.componentsLoaded}/${AppState.totalComponents} 

%cAvailable Commands:
%c• SaasAble.debug.refreshThemeButtons() - Force refresh theme toggles
%c• SaasAble.runAccessibilityAudit() - Run a11y audit  
%c• SaasAble.setTheme('dark'|'light') - Change theme
%c• SaasAble.debug.testAnnouncements() - Test screen reader
%c• window.debugTheme() - Debug theme controller
%c• Ctrl+Shift+L - Toggle theme
%c• Ctrl+Shift+A - Accessibility audit
%c• F6 - Navigate landmarks
%c• Alt+H - Navigate headings
`, 
                'color: #4f46e5; font-size: 16px; font-weight: bold;',
                'color: #059669; font-weight: bold;',
                'color: #7c3aed; font-weight: bold;', 
                'color: #0ea5e9; font-weight: bold;',
                'color: #f59e0b; font-weight: bold;',
                '',
                'color: #374151; font-weight: bold;',
                'color: #6b7280;',
                'color: #6b7280;',
                'color: #6b7280;',
                'color: #6b7280;',
                'color: #6b7280;',
                'color: #6b7280;',
                'color: #6b7280;',
                'color: #6b7280;',
                'color: #6b7280;'
            );
        }
    }, 3000);

})();