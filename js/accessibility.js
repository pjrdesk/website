// js/accessibility.js - FIXED WCAG Compliance System

(function() {
    'use strict';

    // Accessibility Manager Class - FIXED
    class AccessibilityManager {
        constructor() {
            this.focusManager = null;
            this.announcer = null;
            this.keyboardTrapStack = [];
            this.reducedMotion = false;
            this.highContrast = false;
            this.initialized = false;
            this.keyboardHandler = null;
            
            // Bind methods to maintain context
            this.handleKeyboard = this.handleKeyboard.bind(this);
            this.announcePreferenceChange = this.announcePreferenceChange.bind(this);
        }

        async init() {
            if (this.initialized) return;
            
            try {
                this.detectUserPreferences();
                this.createAnnouncer();
                this.setupFocusManagement();
                this.setupKeyboardNavigation();
                this.setupSkipLinks();
                this.enhanceFormAccessibility();
                
                // Wait a bit before running validations to let content load
                setTimeout(() => {
                    this.setupHeadingNavigation();
                    this.validateAccessibility();
                }, 1000);
                
                this.initialized = true;
                console.log('♿ Accessibility Manager initialized');
                
            } catch (error) {
                console.error('❌ Accessibility Manager initialization failed:', error);
            }
        }

        // ================================
        // USER PREFERENCE DETECTION - FIXED
        // ================================

        detectUserPreferences() {
            if (window.matchMedia) {
                // Detect reduced motion preference
                const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                this.reducedMotion = motionQuery.matches;
                
                const handleMotionChange = (e) => {
                    this.reducedMotion = e.matches;
                    this.announcePreferenceChange('motion', e.matches);
                    document.body.classList.toggle('reduced-motion', e.matches);
                };
                
                motionQuery.addEventListener('change', handleMotionChange);
                
                // Apply initial state
                document.body.classList.toggle('reduced-motion', this.reducedMotion);

                // Detect high contrast preference
                const contrastQuery = window.matchMedia('(prefers-contrast: high)');
                this.highContrast = contrastQuery.matches;
                
                const handleContrastChange = (e) => {
                    this.highContrast = e.matches;
                    this.announcePreferenceChange('contrast', e.matches);
                    document.body.classList.toggle('high-contrast', e.matches);
                };
                
                contrastQuery.addEventListener('change', handleContrastChange);
                
                // Apply initial state
                document.body.classList.toggle('high-contrast', this.highContrast);
            }

            console.log('🔍 User preferences detected:', {
                reducedMotion: this.reducedMotion,
                highContrast: this.highContrast
            });
        }

        announcePreferenceChange(type, enabled) {
            const messages = {
                motion: enabled ? 'Animacje zostały wyłączone' : 'Animacje zostały włączone',
                contrast: enabled ? 'Tryb wysokiego kontrastu włączony' : 'Tryb wysokiego kontrastu wyłączony'
            };
            
            this.announce(messages[type]);
        }

        // ================================
        // LIVE ANNOUNCEMENTS - FIXED
        // ================================

        createAnnouncer() {
            this.announcer = document.getElementById('a11y-announcer');
            
            if (!this.announcer) {
                this.announcer = document.createElement('div');
                this.announcer.id = 'a11y-announcer';
                this.announcer.setAttribute('aria-live', 'polite');
                this.announcer.setAttribute('aria-atomic', 'true');
                this.announcer.className = 'sr-only';
                
                if (document.body) {
                    document.body.appendChild(this.announcer);
                } else {
                    document.addEventListener('DOMContentLoaded', () => {
                        document.body.appendChild(this.announcer);
                    });
                }
            }
        }

        announce(message, priority = 'polite') {
            if (!this.announcer || !message) return;
            
            this.announcer.setAttribute('aria-live', priority);
            this.announcer.textContent = message;
            
            // Clear announcement after 3 seconds
            setTimeout(() => {
                if (this.announcer) {
                    this.announcer.textContent = '';
                }
            }, 3000);
        }

        announceAssertive(message) {
            this.announce(message, 'assertive');
        }

        // ================================
        // FOCUS MANAGEMENT - ENHANCED
        // ================================

        setupFocusManagement() {
            this.focusManager = {
                lastFocused: null,
                
                storeFocus: () => {
                    this.focusManager.lastFocused = document.activeElement;
                },
                
                restoreFocus: () => {
                    if (this.focusManager.lastFocused && this.focusManager.lastFocused !== document.body) {
                        try {
                            this.focusManager.lastFocused.focus();
                            this.focusManager.lastFocused = null;
                        } catch (error) {
                            console.warn('⚠️ Could not restore focus:', error);
                        }
                    }
                },
                
                focusFirst: (container) => {
                    const focusable = this.getFocusableElements(container);
                    if (focusable.length > 0) {
                        focusable[0].focus();
                        return true;
                    }
                    return false;
                },
                
                focusLast: (container) => {
                    const focusable = this.getFocusableElements(container);
                    if (focusable.length > 0) {
                        focusable[focusable.length - 1].focus();
                        return true;
                    }
                    return false;
                }
            };
        }

        getFocusableElements(container = document) {
            const selector = [
                'a[href]',
                'area[href]',
                'input:not([disabled]):not([type="hidden"])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                'button:not([disabled])',
                'iframe',
                'object',
                'embed',
                '[contenteditable]',
                '[tabindex]:not([tabindex^="-"])'
            ].join(',');

            const elements = Array.from(container.querySelectorAll(selector));
            
            return elements.filter(element => {
                return this.isVisible(element) && !this.isInert(element);
            });
        }

        isVisible(element) {
            if (!element) return false;
            
            const style = window.getComputedStyle(element);
            return (
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0' &&
                element.offsetParent !== null
            );
        }

        isInert(element) {
            return element.hasAttribute('inert') || 
                   element.closest('[inert]') !== null;
        }

        // ================================
        // KEYBOARD TRAP MANAGEMENT
        // ================================

        trapFocus(container) {
            const focusable = this.getFocusableElements(container);
            if (focusable.length === 0) return null;

            const firstElement = focusable[0];
            const lastElement = focusable[focusable.length - 1];

            const trapHandler = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
                
                if (e.key === 'Escape') {
                    this.releaseFocusTrap();
                }
            };

            container.addEventListener('keydown', trapHandler);
            
            const trap = {
                container,
                handler: trapHandler,
                release: () => {
                    container.removeEventListener('keydown', trapHandler);
                    this.keyboardTrapStack = this.keyboardTrapStack.filter(t => t !== trap);
                }
            };

            this.keyboardTrapStack.push(trap);
            firstElement.focus();
            
            return trap;
        }

        releaseFocusTrap() {
            const trap = this.keyboardTrapStack.pop();
            if (trap) {
                trap.release();
                this.focusManager.restoreFocus();
            }
        }

        // ================================
        // KEYBOARD NAVIGATION - FIXED
        // ================================

        setupKeyboardNavigation() {
            // Remove existing listener
            if (this.keyboardHandler) {
                document.removeEventListener('keydown', this.keyboardHandler);
            }
            
            this.keyboardHandler = this.handleKeyboard;
            
            document.addEventListener('keydown', this.keyboardHandler);
            console.log('⌨️ Keyboard navigation enabled');
        }

        handleKeyboard(e) {
            // Skip if user is typing in an input
            if (e.target.matches('input, textarea, [contenteditable]')) {
                return;
            }
            
            switch (e.key) {
                case 'F6':
                    if (!e.ctrlKey && !e.altKey) {
                        this.navigateToNextLandmark(e);
                    }
                    break;
                case 'h':
                case 'H':
                    if (e.altKey && !e.ctrlKey) {
                        this.navigateToNextHeading(e);
                    }
                    break;
                case 'l':
                case 'L':
                    if (e.altKey && !e.ctrlKey) {
                        this.navigateToNextList(e);
                    }
                    break;
                case 'Escape':
                    this.handleEscapeKey(e);
                    break;
                case 'a':
                case 'A':
                    if (e.ctrlKey && e.shiftKey) {
                        e.preventDefault();
                        this.runAccessibilityAudit();
                    }
                    break;
                case 'h':
                case 'H':
                    if (e.ctrlKey && e.shiftKey) {
                        e.preventDefault();
                        this.showKeyboardHelp();
                    }
                    break;
            }
        }

        navigateToNextLandmark(e) {
            e.preventDefault();
            const landmarks = document.querySelectorAll([
                '[role="main"]', '[role="navigation"]', '[role="banner"]', 
                '[role="contentinfo"]', '[role="complementary"]', 
                'main', 'nav', 'header', 'footer', 'aside'
            ].join(', '));
            this.navigateToNext(landmarks, 'landmark');
        }

        navigateToNextHeading(e) {
            e.preventDefault();
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            this.navigateToNext(headings, 'heading');
        }

        navigateToNextList(e) {
            e.preventDefault();
            const lists = document.querySelectorAll('ul, ol, dl');
            this.navigateToNext(lists, 'list');
        }

        navigateToNext(elements, type) {
            if (elements.length === 0) {
                this.announce(`Nie znaleziono elementów typu: ${type}`);
                return;
            }
            
            const currentIndex = Array.from(elements).findIndex(el => 
                el.contains(document.activeElement) || el === document.activeElement
            );
            
            const nextIndex = (currentIndex + 1) % elements.length;
            const nextElement = elements[nextIndex];
            
            if (nextElement) {
                this.makeFocusable(nextElement);
                nextElement.focus();
                nextElement.scrollIntoView({ 
                    behavior: this.reducedMotion ? 'auto' : 'smooth', 
                    block: 'center' 
                });
                
                const elementText = nextElement.textContent?.trim().substring(0, 50) || type;
                this.announce(`Przejście do: ${elementText}`);
            }
        }

        handleEscapeKey(e) {
            // Close modals, dropdowns, etc.
            const openModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
            const openDropdown = document.querySelector('[aria-expanded="true"]');
            const openMobileMenu = document.querySelector('.mobile-menu.open');
            
            if (openModal) {
                const closeButton = openModal.querySelector('[aria-label*="zamknij" i], [aria-label*="close" i]');
                if (closeButton) {
                    closeButton.click();
                }
            } else if (openMobileMenu) {
                const closeButton = openMobileMenu.querySelector('#mobile-menu-close');
                if (closeButton) {
                    closeButton.click();
                }
            } else if (openDropdown) {
                openDropdown.setAttribute('aria-expanded', 'false');
                openDropdown.focus();
            }
        }

        showKeyboardHelp() {
            const helpText = `
Dostępne skróty klawiszowe:
• F6 - Nawigacja między sekcjami
• Alt+H - Nawigacja nagłówkami  
• Alt+L - Nawigacja listami
• Ctrl+Shift+A - Audyt dostępności
• Ctrl+Shift+H - Ta pomoc
• Ctrl+Shift+L - Przełącz motyw
• Tab - Nawigacja elementami
• Escape - Zamknij modalne
            `.trim();
            
            this.announceAssertive(helpText);
        }

        runAccessibilityAudit() {
            console.log('🔍 Running accessibility audit...');
            this.validateAccessibility();
            this.announceAssertive('Audyt dostępności wykonany - sprawdź konsolę przeglądarki');
        }

        // ================================
        // SKIP LINKS
        // ================================

        setupSkipLinks() {
            const skipLinks = document.querySelectorAll('.skip-link');
            
            skipLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const target = document.getElementById(targetId);
                    
                    if (target) {
                        this.makeFocusable(target);
                        target.focus();
                        target.scrollIntoView({ 
                            behavior: this.reducedMotion ? 'auto' : 'smooth' 
                        });
                        
                        const targetText = target.textContent?.trim().substring(0, 30) || targetId;
                        this.announce(`Przeskoczono do: ${targetText}`);
                    }
                });
            });
        }

        // ================================
        // FORM ACCESSIBILITY - ENHANCED
        // ================================

        enhanceFormAccessibility() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => this.enhanceForm(form));
        }

        enhanceForm(form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                const label = form.querySelector(`label[for="${input.id}"]`);
                
                if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                    console.warn('⚠️ Input missing label:', input);
                }
                
                if (input.hasAttribute('required')) {
                    this.markRequiredField(input, label);
                }
                
                this.setupInputErrorHandling(input);
            });
            
            form.addEventListener('submit', (e) => {
                this.validateFormSubmission(form, e);
            });
        }

        markRequiredField(input, label) {
            if (label && !label.textContent.includes('*')) {
                const indicator = document.createElement('span');
                indicator.textContent = ' *';
                indicator.className = 'required-indicator';
                indicator.setAttribute('aria-label', '(wymagane)');
                label.appendChild(indicator);
            }
            
            input.setAttribute('aria-required', 'true');
        }

        setupInputErrorHandling(input) {
            const showError = (message) => {
                const errorId = `${input.id || 'input'}-error`;
                let errorElement = document.getElementById(errorId);
                
                if (!errorElement) {
                    errorElement = document.createElement('div');
                    errorElement.id = errorId;
                    errorElement.className = 'error-message';
                    errorElement.setAttribute('role', 'alert');
                    errorElement.style.color = 'var(--error, #ef4444)';
                    errorElement.style.fontSize = '14px';
                    errorElement.style.marginTop = '4px';
                    
                    input.parentNode.insertBefore(errorElement, input.nextSibling);
                }
                
                errorElement.textContent = message;
                input.setAttribute('aria-describedby', errorId);
                input.setAttribute('aria-invalid', 'true');
                
                this.announceAssertive(`Błąd walidacji: ${message}`);
            };

            const clearError = () => {
                const errorId = `${input.id || 'input'}-error`;
                const errorElement = document.getElementById(errorId);
                
                if (errorElement) {
                    errorElement.remove();
                }
                
                input.removeAttribute('aria-describedby');
                input.removeAttribute('aria-invalid');
            };

            input.addEventListener('invalid', (e) => {
                e.preventDefault();
                showError(input.validationMessage);
            });

            input.addEventListener('input', clearError);
        }

        validateFormSubmission(form, e) {
            const invalidInputs = form.querySelectorAll(':invalid');
            
            if (invalidInputs.length > 0) {
                e.preventDefault();
                invalidInputs[0].focus();
                this.announceAssertive(`Formularz zawiera ${invalidInputs.length} błędów. Pierwsza nieprawidłowa wartość została podświetlona.`);
            }
        }

        // ================================
        // HEADING NAVIGATION - FIXED
        // ================================

        setupHeadingNavigation() {
            this.validateHeadingStructure();
            console.log('📝 Heading navigation available via Alt+H');
        }

        validateHeadingStructure() {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            let currentLevel = 0;
            let errors = [];

            headings.forEach((heading, index) => {
                const level = parseInt(heading.tagName.charAt(1));
                const headingText = heading.textContent.trim().substring(0, 50);
                
                if (index === 0 && level !== 1) {
                    errors.push(`First heading should be h1, found ${heading.tagName} ("${headingText}")`);
                }
                
                if (level > currentLevel + 1) {
                    errors.push(`Heading level jump: ${heading.tagName} after h${currentLevel} ("${headingText}")`);
                }
                
                currentLevel = level;
            });

            if (errors.length > 0) {
                console.warn('⚠️ Heading structure issues:', errors);
                // Don't announce these as they're developer issues, not user issues
            } else {
                console.log('✅ Heading structure is valid');
            }
        }

        // ================================
        // ACCESSIBILITY VALIDATION - FIXED
        // ================================

        validateAccessibility() {
            const issues = [];
            
            // Check for images without alt text
            const images = document.querySelectorAll('img:not([alt])');
            if (images.length > 0) {
                issues.push(`${images.length} images missing alt attributes`);
            }
            
            // Check for buttons without accessible names
            const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
            const buttonIssues = Array.from(buttons).filter(btn => 
                !btn.textContent.trim() && !btn.querySelector('img[alt], svg[aria-label]')
            );
            if (buttonIssues.length > 0) {
                issues.push(`${buttonIssues.length} buttons without accessible names`);
            }
            
            // Check for links without accessible names
            const links = document.querySelectorAll('a:not([aria-label]):not([aria-labelledby])');
            const linkIssues = Array.from(links).filter(link => 
                !link.textContent.trim() && !link.querySelector('img[alt], svg[aria-label]')
            );
            if (linkIssues.length > 0) {
                issues.push(`${linkIssues.length} links without accessible names`);
            }
            
            // Check color contrast (basic check)
            this.checkColorContrast();
            
            if (issues.length > 0) {
                console.warn('⚠️ Accessibility issues found:', issues);
            } else {
                console.log('✅ Basic accessibility validation passed');
            }
            
            return issues;
        }

        checkColorContrast() {
            // Basic contrast check - in production, use a proper contrast library
            const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span');
            let contrastIssues = 0;
            
            textElements.forEach(element => {
                const style = window.getComputedStyle(element);
                const color = style.color;
                const backgroundColor = style.backgroundColor;
                
                // Very basic check - would need proper contrast ratio calculation
                if (color === backgroundColor) {
                    contrastIssues++;
                    if (contrastIssues <= 3) { // Limit console spam
                        console.warn('⚠️ Potential contrast issue:', element);
                    }
                }
            });
            
            if (contrastIssues > 3) {
                console.warn(`⚠️ Found ${contrastIssues} potential contrast issues (showing first 3)`);
            }
        }

        // ================================
        // UTILITY METHODS
        // ================================

        makeFocusable(element) {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '-1');
            }
        }

        removeFromTabOrder(element) {
            element.setAttribute('tabindex', '-1');
        }

        addToTabOrder(element, index = 0) {
            element.setAttribute('tabindex', index.toString());
        }

        makeKeyboardClickable(element, callback) {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    callback(e);
                }
            });
        }

        // ================================
        // PUBLIC API
        // ================================

        getAccessibilityState() {
            return {
                reducedMotion: this.reducedMotion,
                highContrast: this.highContrast,
                focusTrapsActive: this.keyboardTrapStack.length,
                currentFocus: document.activeElement?.tagName || 'none',
                initialized: this.initialized
            };
        }

        audit() {
            console.log('🔍 Running comprehensive accessibility audit...');
            const issues = this.validateAccessibility();
            this.validateHeadingStructure();
            
            const state = this.getAccessibilityState();
            console.log('♿ Accessibility state:', state);
            
            return { issues, state };
        }

        destroy() {
            if (this.keyboardHandler) {
                document.removeEventListener('keydown', this.keyboardHandler);
            }
            
            while (this.keyboardTrapStack.length > 0) {
                this.releaseFocusTrap();
            }
            
            if (this.announcer && this.announcer.parentNode) {
                this.announcer.parentNode.removeChild(this.announcer);
            }
            
            this.initialized = false;
            console.log('🧹 Accessibility Manager destroyed');
        }
    }

    // ================================
    // GLOBAL UTILITIES
    // ================================

    function addFocusStyles() {
        if (!document.getElementById('a11y-focus-styles')) {
            const style = document.createElement('style');
            style.id = 'a11y-focus-styles';
            style.textContent = `
                /* Enhanced focus styles */
                *:focus {
                    outline: 2px solid var(--focus-ring, #4f46e5);
                    outline-offset: 2px;
                }
                
                @media (prefers-contrast: high) {
                    *:focus {
                        outline-width: 3px;
                    }
                }
                
                .mouse-user *:focus:not(:focus-visible) {
                    outline: none;
                }
                
                .mouse-user *:focus-visible {
                    outline: 2px solid var(--focus-ring, #4f46e5);
                    outline-offset: 2px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    function setupInputDetection() {
        let isMouseUser = false;
        
        document.addEventListener('mousedown', () => {
            if (!isMouseUser) {
                isMouseUser = true;
                document.body.classList.add('mouse-user');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && isMouseUser) {
                isMouseUser = false;
                document.body.classList.remove('mouse-user');
            }
        });
    }

    // Initialize accessibility system
    async function initializeAccessibility() {
        console.log('♿ Initializing Accessibility Manager...');
        
        try {
            addFocusStyles();
            setupInputDetection();
            
            const manager = new AccessibilityManager();
            await manager.init();
            
            // Export to global scope
            window.AccessibilityManager = manager;
            
            // Listen for theme changes
            document.addEventListener('themechange', (e) => {
                const themeText = e.detail.theme === 'dark' ? 'ciemny' : 'jasny';
                manager.announce(`Motyw zmieniony na: ${themeText}`);
            });
            
            console.log('♿ Accessibility system ready');
            return manager;
            
        } catch (error) {
            console.error('❌ Accessibility system initialization failed:', error);
            throw error;
        }
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAccessibility);
    } else {
        initializeAccessibility();
    }

    // Export for manual initialization
    window.initializeAccessibility = initializeAccessibility;

})();