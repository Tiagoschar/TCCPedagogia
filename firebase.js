// firebaseConfig (copiado do console do Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyDvMSEl-3Tj5IvC5cs09DY8xZuUve4NyOU",
    authDomain: "tccneuropsicopedagoga.firebaseapp.com",
    projectId: "tccneuropsicopedagoga",
    storageBucket: "tccneuropsicopedagoga.firebasestorage.app",
    messagingSenderId: "189432898003",
    appId: "1:189432898003:web:aab9ddd5eba744a6350f26",
    measurementId: "G-XR0LJT1KB8"
};

// Inicialização do Firebase (o objeto 'firebase' é global agora)
const app = firebase.initializeApp(firebaseConfig);

// pegar serviço de autenticação
const auth = firebase.auth(); // Acessando o serviço de autenticação via o objeto global 'firebase'

// pegar serviço de banco de dados (ex: Cloud Firestore)
const db = firebase.firestore(); // Acessando o serviço de Firestore

// --- Referências aos elementos HTML para controle de UI ---
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const createAccountForm = document.getElementById('create-account-form');
const authControlsLoggedOut = document.getElementById('auth-controls-logged-out');
const authControlsLoggedIn = document.getElementById('auth-controls-logged-in');
const userEmailDisplay = document.getElementById('user-email-display');

// NOVO: Referência para o botão de autenticação no cabeçalho
const authNavButton = document.getElementById('auth-nav-button');

// --- Funções de controle do Overlay de Login/Criação de Conta ---
function openOverlay() {
  loginOverlay.style.display = 'flex'; // Torna o overlay visível
  showLogin(); // Por padrão, mostra o formulário de login primeiro
}

function closeLogin() {
  loginOverlay.style.display = 'none'; // Esconde o overlay
}

function showCreate() {
  loginForm.classList.add('hidden'); // Esconde o formulário de login
  createAccountForm.classList.remove('hidden'); // Mostra o formulário de criação de conta
}

function showLogin() {
  createAccountForm.classList.add('hidden'); // Esconde o formulário de criação de conta
  loginForm.classList.remove('hidden'); // Mostra o formulário de login
}


// --- Funções de Autenticação ---

async function signUpEmailPassword() {
  const email = document.getElementById('user-email-signup').value;
  const password = document.getElementById('user-pass-signup').value;
  const passwordConfirm = document.getElementById('user-pass2-signup').value;
  const userName = document.getElementById('user-name').value;

  if (password !== passwordConfirm) {
    alert('As senhas não coincidem!');
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({
        displayName: userName
    });
    console.log('Usuário registrado com sucesso:', userCredential.user);
    closeLogin();
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    alert('Erro ao registrar: ' + error.message);
  }
}

async function signInEmailPassword() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-pass').value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('Usuário logado com sucesso:', userCredential.user);
    closeLogin();
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    alert('Erro ao fazer login: ' + error.message);
  }
}

async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    console.log('Logado com Google:', result.user);
    closeLogin();
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error.message);
    alert('Erro ao fazer login com Google: ' + error.message);
  }
}

async function logoutUser() {
  try {
    await auth.signOut();
    console.log('Usuário deslogado com sucesso!');
  } catch (error) {
    console.error('Erro ao fazer logout:', error.message);
    alert('Erro ao fazer logout: ' + error.message);
  }
}


// --- Monitoramento do Estado de Autenticação e Atualização da UI ---
auth.onAuthStateChanged((user) => {
  if (user) {
    // Usuário está logado
    authControlsLoggedOut.classList.add('hidden');
    authControlsLoggedIn.classList.remove('hidden');
    userEmailDisplay.textContent = user.displayName || user.email;

    // Atualiza o botão de navegação para "Logout"
    authNavButton.textContent = 'Logout';
    authNavButton.onclick = logoutUser; // Define a ação do botão para logout

    console.log('Usuário logado:', user.uid, user.email, user.displayName);

  } else {
    // Usuário está deslogado
    authControlsLoggedOut.classList.remove('hidden');
    authControlsLoggedIn.classList.add('hidden');

    // Atualiza o botão de navegação para "Login"
    authNavButton.textContent = 'Login';
    authNavButton.onclick = openOverlay; // Define a ação do botão para abrir o overlay de login

    console.log('Usuário deslogado');
  }
  // Garante que o overlay de login esteja escondido quando a página carrega ou o estado muda
  if (loginOverlay.style.display !== 'flex') {
      loginOverlay.style.display = 'none';
  }
});
