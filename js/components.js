// js/components.js - Logika specyficzna dla komponentów

(function() {
    'use strict';

    // Komponent Hero
    const HeroComponent = {
        init() {
            const heroSection = document.querySelector('#hero-section');
            if (!heroSection) return;

            // Inicjalizuj CTA buttons
            const primaryCTA = heroSection.querySelector('#primary-cta');
            const secondaryCTA = heroSection.querySelector('#secondary-cta');

            if (primaryCTA) {
                primaryCTA.addEventListener('click', this.handlePrimaryCTA);
            }

            if (secondaryCTA) {
                secondaryCTA.addEventListener('click', this.handleSecondaryCTA);
            }

            // Dodaj animację do beta badge
            this.animateBetaBadge();
        },

        handlePrimaryCTA(e) {
            e.preventDefault();
            console.log('Primary CTA clicked');
            // Tutaj można dodać tracking lub przekierowanie
        },

        handleSecondaryCTA(e) {
            e.preventDefault();
            console.log('Secondary CTA clicked');
            // Tutaj można dodać modal lub scroll do sekcji
        },

        animateBetaBadge() {
            const badge = document.querySelector('.fade-in');
            if (badge) {
                badge.style.animationDelay = '0.2s';
            }
        }
    };

    // Komponent Features
    const FeaturesComponent = {
        init() {
            const featuresSection = document.querySelector('#features-section');
            if (!featuresSection) return;

            // Inicjalizuj tooltips dla ikon
            this.initializeTooltips();
            
            // Obsługa kliknięć w linki "Learn more"
            this.initializeLearnMoreLinks();
        },

        initializeTooltips() {
            const icons = document.querySelectorAll('.icon-wrapper');
            icons.forEach(icon => {
                icon.addEventListener('mouseenter', function() {
                    const tooltip = this.dataset.tooltip;
                    if (tooltip) {
                        this.setAttribute('title', tooltip);
                    }
                });
            });
        },

        initializeLearnMoreLinks() {
            const learnMoreLinks = document.querySelectorAll('a[href="#"]');
            learnMoreLinks.forEach(link => {
                if (link.textContent.includes('Learn more')) {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        const cardTitle = this.closest('.card').querySelector('h3').textContent;
                        console.log(`Learn more clicked for: ${cardTitle}`);
                        // Tutaj można dodać modal lub przekierowanie
                    });
                }
            });
        }
    };

    // Komponent Workflow
    const WorkflowComponent = {
        init() {
            const workflowSection = document.querySelector('#workflow-section');
            if (!workflowSection) return;

            // Inicjalizuj animowane wykresy
            this.initializeCharts();
            
            // Obsługa przycisków workflow
            this.initializeWorkflowButtons();
        },

        initializeCharts() {
            const charts = document.querySelectorAll('.img-placeholder');
            charts.forEach(chart => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateChart(entry.target);
                        }
                    });
                }, { threshold: 0.5 });

                observer.observe(chart);
            });
        },

        animateChart(chartElement) {
            const bars = chartElement.querySelectorAll('[style*="height"]');
            bars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.transform = 'scaleY(1)';
                    bar.style.transformOrigin = 'bottom';
                }, index * 200);
            });
        },

        initializeWorkflowButtons() {
            const workflowButtons = document.querySelectorAll('.btn-secondary');
            workflowButtons.forEach(button => {
                if (button.textContent.includes('Automation') || 
                    button.textContent.includes('Analytics')) {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        const action = this.textContent.trim();
                        console.log(`Workflow action: ${action}`);
                        // Tutaj można dodać specyficzną logikę
                    });
                }
            });
        }
    };

    // Komponent Blog
    const BlogComponent = {
        init() {
            const blogSection = document.querySelector('#blog-section');
            if (!blogSection) return;

            // Inicjalizuj tracking dla artykułów
            this.initializeArticleTracking();
            
            // Lazy loading dla obrazów
            this.initializeLazyLoading();
        },

        initializeArticleTracking() {
            const articles = document.querySelectorAll('article');
            articles.forEach(article => {
                const readMoreLink = article.querySelector('a[href="#"]');
                if (readMoreLink && readMoreLink.textContent.includes('Read More')) {
                    readMoreLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        const title = article.querySelector('h3').textContent;
                        console.log(`Blog article clicked: ${title}`);
                        // Tutaj można dodać analytics tracking
                    });
                }
            });
        },

        initializeLazyLoading() {
            const images = document.querySelectorAll('.img-placeholder');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            imageObserver.unobserve(entry.target);
                        }
                    });
                });

                images.forEach(img => imageObserver.observe(img));
            }
        },

        loadImage(element) {
            // Symulacja ładowania obrazu
            element.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
            element.classList.add('loaded');
        }
    };

    // Komponent Navigation
    const NavigationComponent = {
        init() {
            const nav = document.querySelector('nav');
            if (!nav) return;

            // Obsługa dropdown menu
            this.initializeDropdowns();
            
            // Highlight aktywnej sekcji
            this.initializeActiveSection();
        },

        initializeDropdowns() {
            const dropdowns = document.querySelectorAll('.dropdown');
            dropdowns.forEach(dropdown => {
                const button = dropdown.querySelector('button');
                const menu = dropdown.querySelector('.dropdown-menu');
                
                if (button && menu) {
                    let timeout;
                    
                    dropdown.addEventListener('mouseenter', () => {
                        clearTimeout(timeout);
                        menu.style.display = 'block';
                    });
                    
                    dropdown.addEventListener('mouseleave', () => {
                        timeout = setTimeout(() => {
                            menu.style.display = 'none';
                        }, 300);
                    });
                }
            });
        },

        initializeActiveSection() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('nav a[href^="#"]');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            }, { threshold: 0.5 });

            sections.forEach(section => observer.observe(section));
        }
    };

    // Utilities
    const Utils = {
        // Debounce function
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Animate number counter
        animateCounter(element, start, end, duration) {
            let startTime = null;
            
            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const current = Math.floor(progress * (end - start) + start);
                element.textContent = current;
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }
            
            requestAnimationFrame(step);
        },

        // Format number with commas
        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    };

    // Inicjalizacja wszystkich komponentów
    function initializeAllComponents() {
        try {
            HeroComponent.init();
            FeaturesComponent.init();
            WorkflowComponent.init();
            BlogComponent.init();
            NavigationComponent.init();
            
            console.log('✅ All component-specific functionality initialized');
        } catch (error) {
            console.error('❌ Error initializing components:', error);
        }
    }

    // Eksportuj dla głównego skryptu
    window.initializeComponents = initializeAllComponents;

    // Eksportuj komponenty dla dostępu zewnętrznego
    window.Components = {
        Hero: HeroComponent,
        Features: FeaturesComponent,
        Workflow: WorkflowComponent,
        Blog: BlogComponent,
        Navigation: NavigationComponent,
        Utils: Utils
    };

})();