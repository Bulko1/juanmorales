// ============================================
// Menú Móvil con Overlay
// ============================================
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const mobileOverlay = document.getElementById('mobile-overlay');
const openIcon = document.getElementById('menu-open-icon');
const closeIcon = document.getElementById('menu-close-icon');

function openMobileMenu() {
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('active');
    openIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('active');
    openIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
    document.body.style.overflow = '';
}

mobileMenuButton.addEventListener('click', () => {
    if (mobileMenu.classList.contains('hidden')) {
        openMobileMenu();
    } else {
        closeMobileMenu();
    }
});

mobileOverlay.addEventListener('click', closeMobileMenu);

document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// ============================================
// Header con efecto scroll
// ============================================
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ============================================
// Sistema de Temas
// ============================================
const themeToggleButton = document.getElementById('theme-toggle');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const lightIcon = document.getElementById('theme-toggle-light-icon');
const mobileThemeToggleButton = document.getElementById('mobile-theme-toggle');
const mobileThemeToggleText = mobileThemeToggleButton ? mobileThemeToggleButton.querySelector('span') : null;

function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (darkIcon) darkIcon.classList.add('hidden');
        if (lightIcon) lightIcon.classList.remove('hidden');
        if (mobileThemeToggleText) mobileThemeToggleText.textContent = 'Cambiar a Tema Oscuro';
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (darkIcon) darkIcon.classList.remove('hidden');
        if (lightIcon) lightIcon.classList.add('hidden');
        if (mobileThemeToggleText) mobileThemeToggleText.textContent = 'Cambiar a Tema Claro';
        localStorage.setItem('theme', 'dark');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
}

if (themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);
if (mobileThemeToggleButton) mobileThemeToggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
});

// ============================================
// Barra de Progreso de Lectura
// ============================================
const scrollProgress = document.getElementById('scroll-progress');

function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
}

// ============================================
// Botón Volver Arriba
// ============================================
const backToTop = document.getElementById('back-to-top');

function updateBackToTop() {
    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================
// Scroll Spy - Navegación Activa
// ============================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a');

function updateScrollSpy() {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ============================================
// Intersection Observer - Animaciones de Entrada
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// ============================================
// Event Listeners Combinados de Scroll
// ============================================
window.addEventListener('scroll', () => {
    updateScrollProgress();
    updateBackToTop();
    updateScrollSpy();
});

// ============================================
// Inicialización
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const validThemes = ['light', 'dark'];
    if (validThemes.includes(savedTheme)) {
        applyTheme(savedTheme);
    }

    updateScrollProgress();
    updateBackToTop();
    updateScrollSpy();
});
