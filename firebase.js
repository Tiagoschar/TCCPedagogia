// firebase.js (versão ESPERO QUE FUNCIONE)
const firebaseConfig = {
  apiKey: "AIzaSyDvMSEl-3Tj5IvC5cs09DY8xZuUve4NyOU",
  authDomain: "tccneuropsicopedagoga.firebaseapp.com",
  projectId: "tccneuropsicopedagoga",
  storageBucket: "tccneuropsicopedagoga.firebasestorage.app",
  messagingSenderId: "189432898003",
  appId: "1:189432898003:web:aab9ddd5eba744a6350f26",
  measurementId: "G-XR0LJT1KB8"
};

// Inicializa Firebase (compat)
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Espera o DOM pra manipular elementos com segurança
document.addEventListener('DOMContentLoaded', () => {
  // referências de elementos (agora certamente existentes)
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const createAccountForm = document.getElementById('create-account-form');
  const authControlsLoggedOut = document.getElementById('auth-controls-logged-out');
  const authControlsLoggedIn = document.getElementById('auth-controls-logged-in');
  const userEmailDisplay = document.getElementById('user-email-display');

  // ----- FUNÇÕES GLOBAIS (expostas no window) -----
  window.openOverlay = function() {
    if (!loginOverlay) return;
    loginOverlay.classList.remove('hidden'); // remove a classe que estava com !important
    // garante que o formulário de login seja mostrado por padrão
    window.showLogin();
  };

  window.closeLogin = function() {
    if (!loginOverlay) return;
    loginOverlay.classList.add('hidden');
  };

  window.showCreate = function() {
    if (loginForm) loginForm.classList.add('hidden');
    if (createAccountForm) createAccountForm.classList.remove('hidden');
  };

  window.showLogin = function() {
    if (createAccountForm) createAccountForm.classList.add('hidden');
    if (loginForm) loginForm.classList.remove('hidden');
  };

  // Botões que ligam o overlay (só se existirem)
  const loginBtn = document.getElementById('login-btn');                 // nav
  const createAccountBtn = document.getElementById('create-account-btn'); // aside

  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => { e.preventDefault(); openOverlay(); showLogin(); });
  }
  if (createAccountBtn) {
    createAccountBtn.addEventListener('click', (e) => { e.preventDefault(); openOverlay(); showCreate(); });
  }

  // botão fechar do overlay (ícone dentro do login-box)
  const closeBtn = document.querySelector('#login-box .close-overlay-btn');
  if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); closeLogin(); });

  // impede submit padrão do form de criação (assim podemos usar nossa função)
  if (createAccountForm) {
    createAccountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.signUpEmailPassword();
    });
  }
  // caso o usuário pressione Enter no login-form
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.signInEmailPassword();
    });
  }

  // ----- Funções de Autenticação (expostas em window para compatibilidade com onclick inline) -----
  window.signUpEmailPassword = async function() {
    const email = document.getElementById('user-email-signup').value;
    const password = document.getElementById('user-pass-signup').value;
    const passwordConfirm = document.getElementById('user-pass2-signup').value;
    const userName = document.getElementById('user-name').value || '';

    if (password !== passwordConfirm) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      // atualiza displayName
      await userCredential.user.updateProfile({ displayName: userName });
      // opcional: gravar dados no Firestore
      // await db.collection('users').doc(userCredential.user.uid).set({ name: userName, email });
      console.log('Usuário registrado:', userCredential.user.uid);
      window.closeLogin();
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      alert('Erro ao registrar: ' + (error.message || error));
    }
  };

  window.signInEmailPassword = async function() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-pass').value;
    try {
      await auth.signInWithEmailAndPassword(email, password);
      console.log('Usuário logado com e-mail/senha');
      window.closeLogin();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Erro ao fazer login: ' + (error.message || error));
    }
  };

  window.signInWithGoogle = async function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
      console.log('Logado com Google');
      window.closeLogin();
    } catch (error) {
      console.error('Erro Google:', error);
      alert('Erro ao fazer login com Google: ' + (error.message || error));
    }
  };

  window.logoutUser = async function() {
    try {
      await auth.signOut();
      console.log('Usuário deslogado');
      // a UI será atualizada no onAuthStateChanged
    } catch (error) {
      console.error('Erro ao deslogar:', error);
      alert('Erro ao fazer logout: ' + (error.message || error));
    }
  };

  // ----- Observador de estado de autenticação -----
  auth.onAuthStateChanged((user) => {
    if (user) {
      if (authControlsLoggedOut) authControlsLoggedOut.classList.add('hidden');
      if (authControlsLoggedIn) authControlsLoggedIn.classList.remove('hidden');
      if (userEmailDisplay) userEmailDisplay.textContent = user.displayName || user.email;
      window.closeLogin();
    } else {
      if (authControlsLoggedOut) authControlsLoggedOut.classList.remove('hidden');
      if (authControlsLoggedIn) authControlsLoggedIn.classList.add('hidden');
      // Se quiser que o overlay abra automaticamente quando logout:
      // window.openOverlay();
    }
  });

}); // fim DOMContentLoaded
