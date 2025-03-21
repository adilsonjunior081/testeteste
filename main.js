/**
 * Agricultura de Gravatá - JavaScript Principal
 * Versão: 1.1.1
 * Última atualização: 2024-03-21
 */

// IIFE para isolar o escopo e evitar poluição do escopo global
(function() {
    'use strict';
    
    // Configuração de ambiente - pode ser modificada para testes em outros ambientes
    const isDev = isDevEnvironment();
    
    // Verificar se o documento está pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
    
    // Inicialização da aplicação
    function initApp() {
        // Inicializar todos os componentes
        initMobileMenu();
        initScrollEffects();
        initContactForm();
        initAnimations();
        applySecurityMeasures();
        
        // Registrar o Service Worker para PWA (Progressive Web App)
        registerServiceWorker();
        
        // Adicionar logs apenas em ambiente de desenvolvimento
        if (isDev) {
            console.log('App inicializado no ambiente de desenvolvimento');
        }
    }
    
    // Menu Mobile
    function initMobileMenu() {
        const navToggle = document.querySelector('.mobile-toggle');
        const mobileNav = document.querySelector('.navigation-links');
        const overlay = document.querySelector('.nav-overlay');
        const mobileLinks = document.querySelectorAll('.navigation-links li a');
        
        if (navToggle) {
            navToggle.addEventListener('click', function(e) {
                e.preventDefault();
                toggleMenu();
            });
        }
        
        if (overlay) {
            overlay.addEventListener('click', function() {
                closeMenu();
            });
        }
        
        // Fechar menu ao clicar em links do menu
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    closeMenu();
                }
            });
        });
        
        // Função para alternar o menu
        function toggleMenu() {
            document.body.classList.toggle('menu-open');
            if (mobileNav) mobileNav.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
        }
        
        // Função para fechar o menu
        function closeMenu() {
            document.body.classList.remove('menu-open');
            if (mobileNav) mobileNav.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }
        
        // Detectar ESC para fechar o menu
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
                closeMenu();
            }
        });
    }
    
    // Efeitos de scroll
    function initScrollEffects() {
        // Adicionar classe ao header quando rolar a página
        const header = document.querySelector('header');
        
        if (header) {
            // Implementação otimizada usando throttle para scroll
            const throttleTime = 100; // ms
            let lastScrollTime = 0;
            let ticking = false;
            
            window.addEventListener('scroll', function() {
                const now = Date.now();
                
                if (!ticking && now - lastScrollTime > throttleTime) {
                    window.requestAnimationFrame(function() {
                        const scrollTop = window.scrollY;
                        if (scrollTop > 50) {
                            header.classList.add('scrolled');
                        } else {
                            header.classList.remove('scrolled');
                        }
                        lastScrollTime = now;
                        ticking = false;
                    });
                    
                    ticking = true;
                }
            });
        }
        
        // Scroll suave para links âncora
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetOffset = targetElement.getBoundingClientRect().top + window.scrollY;
                    
                    window.scrollTo({
                        top: targetOffset - headerHeight - 20,
                        behavior: 'smooth'
                    });
                    
                    // Adicionar o hash à URL sem reload da página
                    history.pushState(null, null, targetId);
                }
            });
        });
    }
    
    // Inicializar formulário de contato
    function initContactForm() {
        // Nota: A configuração do EmailJS foi movida para index.html para evitar conflitos
        
        // Máscaras para o campo de telefone (implementação básica)
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, '');
                
                // Limitar a 11 dígitos (DDD + 9 + número)
                if (value.length > 11) {
                    value = value.slice(0, 11);
                }
                
                // Formatar conforme digitação
                if (value.length > 2) {
                    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                }
                
                if (value.length > 10) {
                    value = `${value.slice(0, 9)}-${value.slice(9)}`;
                }
                
                e.target.value = value;
            });
        }
        
        // Limpar os campos do formulário ao recarregar a página
        window.addEventListener('pageshow', function() {
            const form = document.getElementById('contactForm');
            if (form) {
                form.reset();
            }
        });
    }
    
    // Inicializar animações
    function initAnimations() {
        // Animações baseadas em scroll
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        // Função para verificar se elemento está visível na viewport
        const isElementInViewport = (el) => {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 &&
                rect.bottom >= 0
            );
        };
        
        // Função para animar elementos visíveis com throttle
        const throttleTime = 100; // ms
        let lastAnimationTime = 0;
        
        const handleScrollAnimation = () => {
            const now = Date.now();
            
            if (now - lastAnimationTime > throttleTime) {
                animatedElements.forEach(el => {
                    if (isElementInViewport(el) && !el.classList.contains('animated')) {
                        el.classList.add('animated');
                    }
                });
                
                lastAnimationTime = now;
            }
        };
        
        // Usar Intersection Observer quando disponível
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            animatedElements.forEach(el => {
                observer.observe(el);
            });
        } else {
            // Fallback para navegadores mais antigos com throttling
            window.addEventListener('scroll', handleScrollAnimation);
            // Verificar elementos visíveis no carregamento inicial
            handleScrollAnimation();
        }
        
        // Aplicar delay em elementos com animação sequencial
        document.querySelectorAll('.culture-card').forEach((card, index) => {
            if (card.classList.contains('animate-on-scroll')) {
                card.style.transitionDelay = `${index * 0.1}s`;
            }
        });
        
        document.querySelectorAll('.chart-box').forEach((box, index) => {
            if (box.classList.contains('animate-on-scroll')) {
                box.style.transitionDelay = `${index * 0.2}s`;
            }
        });
    }
    
    // Registro do Service Worker
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(function(registration) {
                        // Registro com sucesso
                        if (isDev) {
                            console.log('Service Worker registrado com sucesso:', registration.scope);
                        }
                    })
                    .catch(function(error) {
                        if (isDev) {
                            console.log('Falha ao registrar Service Worker:', error);
                        }
                    });
            });
        }
    }
    
    // Implementar medidas de segurança adicionais
    function applySecurityMeasures() {
        // Adicionar cabeçalho CSP via meta tag (caso o servidor não o faça)
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Security-Policy';
            meta.content = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline'; img-src 'self' https://i.ytimg.com https://agricultura.gravata.pe.gov.br https://cdn-icons-png.flaticon.com https://png.pngtree.com data:; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; connect-src 'self'; frame-src 'none'; object-src 'none';";
            document.head.appendChild(meta);
        }
        
        // Sanitizar URLs em todos os links
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.startsWith('javascript:') || href.startsWith('data:'))) {
                link.setAttribute('href', '#');
                link.addEventListener('click', e => e.preventDefault());
            }
        });
        
        // Adicionar atributos de segurança aos links externos
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            if (!link.getAttribute('rel')) {
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
        
        // Aplicar Referrer-Policy via meta tag
        if (!document.querySelector('meta[name="referrer"]')) {
            const meta = document.createElement('meta');
            meta.setAttribute('name', 'referrer');
            meta.setAttribute('content', 'strict-origin-when-cross-origin');
            document.head.appendChild(meta);
        }
    }
    
    // Função melhorada para detectar ambiente de desenvolvimento
    function isDevEnvironment() {
        const hostname = window.location.hostname;
        return hostname === 'localhost' || 
               hostname === '127.0.0.1' ||
               hostname.startsWith('192.168.') ||
               hostname.includes('.local') ||
               hostname.includes('.test') ||
               hostname.includes('-dev.') ||
               hostname.includes('.dev.') ||
               hostname.includes('-staging.') ||
               hostname.endsWith('.ngrok.io');
    }
})(); 