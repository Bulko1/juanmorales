// Script para el menú móvil
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const openIcon = document.getElementById('menu-open-icon');
const closeIcon = document.getElementById('menu-close-icon');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    openIcon.classList.toggle('hidden');
    closeIcon.classList.toggle('hidden');
});

// Cerrar menú móvil al hacer clic en un enlace
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        openIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    });
});

// Cambiar el fondo del header al hacer scroll
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

 // --- Lógica para cambiar de tema ---
        const themeToggleButton = document.getElementById('theme-toggle');
        const darkIcon = document.getElementById('theme-toggle-dark-icon');
        const lightIcon = document.getElementById('theme-toggle-light-icon');
        const mobileThemeToggleButton = document.getElementById('mobile-theme-toggle');
        const mobileThemeToggleText = mobileThemeToggleButton.querySelector('span');

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

        themeToggleButton.addEventListener('click', toggleTheme);
        mobileThemeToggleButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir que el enlace navegue
            toggleTheme();
        });

        // Aplicar tema guardado al cargar la página (por defecto es oscuro)
        document.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                applyTheme('light');
            }
        });