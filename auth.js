class Auth {
    constructor() {
        this.isLoggedIn = false;
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Botones de apertura de modales
        document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showModal('registerModal'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Formularios
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        // Cerrar modales
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', () => this.hideModals());
        });

        // Agregar listeners para botones móviles
        document.getElementById('loginBtnMobile')?.addEventListener('click', () => {
            this.showModal('loginModal');
            document.getElementById('mobile-menu').classList.add('hidden');
        });

        document.getElementById('registerBtnMobile')?.addEventListener('click', () => {
            this.showModal('registerModal');
            document.getElementById('mobile-menu').classList.add('hidden');
        });

        document.getElementById('logoutBtnMobile')?.addEventListener('click', () => {
            this.logout();
            document.getElementById('mobile-menu').classList.add('hidden');
        });
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorMessage = document.getElementById('loginError');
        const alertBox = document.getElementById('loginAlert');

        try {
            if (!email || !password) {
                throw new Error('Por favor, completa todos los campos.');
            }

            // Simulación de API
            const response = await this.simulateApi({ email, password }, 'login');

            if (response.success) {
                this.login({ email, name: response.name });
            } else {
                throw new Error(response.message || 'Error desconocido.');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');

            // Mostrar alerta
            alertBox.textContent = `Inicio de sesión fallido: ${error.message}`;
            alertBox.classList.remove('hidden');
            setTimeout(() => alertBox.classList.add('hidden'), 5000); // Ocultar después de 5 segundos
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const errorMessage = document.getElementById('registerError');

        try {
            if (!name || !email || !password) {
                throw new Error('Por favor, completa todos los campos.');
            }

            // Simulación de API
            const response = await this.simulateApi({ name, email, password }, 'register');

            if (response.success) {
                this.login({ email, name });
            } else {
                throw new Error(response.message || 'Error desconocido.');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        }
    }

    async simulateApi(data, endpoint) {
        // Simulación de una API con retraso
        return new Promise((resolve) => {
            setTimeout(() => {
                if (endpoint === 'login') {
                    if (data.email === 'test@example.com' && data.password === 'password') {
                        resolve({ success: true, name: 'Usuario de Prueba' });
                    } else {
                        resolve({ success: false, message: 'Credenciales incorrectas.' });
                    }
                } else if (endpoint === 'register') {
                    if (data.email === 'test@example.com') {
                        resolve({ success: false, message: 'El email ya está registrado.' });
                    } else {
                        resolve({ success: true });
                    }
                }
            }, 1000); // Simula un retraso de 1 segundo
        });
    }

    login(userData) {
        this.isLoggedIn = true;
        localStorage.setItem('user', JSON.stringify(userData));
        this.updateUI();
        this.hideModals();
    }

    logout() {
        this.isLoggedIn = false;
        localStorage.removeItem('user');
        this.updateUI();
    }

    checkAuthStatus() {
        const user = localStorage.getItem('user');
        if (user) {
            this.isLoggedIn = true;
            this.updateUI();
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.isLoggedIn) {
            loginBtn.classList.add('hidden');
            registerBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
        } else {
            loginBtn.classList.remove('hidden');
            registerBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
        }

        // Actualizar también los botones móviles
        const loginBtnMobile = document.getElementById('loginBtnMobile');
        const registerBtnMobile = document.getElementById('registerBtnMobile');
        const logoutBtnMobile = document.getElementById('logoutBtnMobile');

        if (this.isLoggedIn) {
            loginBtnMobile?.classList.add('hidden');
            registerBtnMobile?.classList.add('hidden');
            logoutBtnMobile?.classList.remove('hidden');
        } else {
            loginBtnMobile?.classList.remove('hidden');
            registerBtnMobile?.classList.remove('hidden');
            logoutBtnMobile?.classList.add('hidden');
        }
    }
}

// Inicializar la autenticación
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
});