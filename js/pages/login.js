import { auth } from '../firebase-config.js';

export function init() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleBtn = document.getElementById('auth-toggle-btn');
    
    let isLogin = false;

    toggleBtn.addEventListener('click', () => {
        isLogin = !isLogin;
        loginForm.classList.toggle('hidden', !isLogin);
        registerForm.classList.toggle('hidden', isLogin);
        
        document.getElementById('auth-title').textContent = isLogin ? 'Inicia Sesión' : 'Crea tu Cuenta';
        document.getElementById('auth-subtitle').textContent = isLogin ? 'Bienvenido de nuevo.' : 'Empieza a gestionar tu salud hoy.';
        document.getElementById('auth-toggle-text').textContent = isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?';
        toggleBtn.textContent = isLogin ? 'Crea una Cuenta' : 'Inicia Sesión';
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = registerForm.identifier.value;
        const password = registerForm.password.value;
        const errorMsg = document.getElementById('register-error');
        const email = `${identifier}@medicalhome.app`;

        try {
            await auth.createUserWithEmailAndPassword(email, password);
        } catch (error) {
            errorMsg.textContent = 'Error: ' + error.message;
            errorMsg.classList.remove('hidden');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = loginForm.identifier.value;
        const password = loginForm.password.value;
        const errorMsg = document.getElementById('login-error');
        const email = `${identifier}@medicalhome.app`;

        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            errorMsg.textContent = 'Error: ' + error.message;
            errorMsg.classList.remove('hidden');
        }
    });
}