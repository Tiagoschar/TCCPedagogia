// Seu objeto firebaseConfig (copiado do console do Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyDvMSEl-3Tj5IvC5cs09DY8xZuUve4NyOU",
    authDomain: "tccneuropsicopedagoga.firebaseapp.com",
    projectId: "tccneuropsicopedagoga",
    storageBucket: "tccneuropsicopedagoga.firebasestorage.app",
    messagingSenderId: "189432898003",
    appId: "1:189432898003:web:aab9ddd5eba744a6350f26",
    measurementId: "G-XR0LJT1KB8"
};

// Inicialize o Firebase (o objeto 'firebase' é global agora)
const app = firebase.initializeApp(firebaseConfig);

// Obtenha o serviço de autenticação
const auth = firebase.auth(); // Acessando o serviço de autenticação via o objeto global 'firebase'

// Obtenha o serviço de banco de dados (ex: Cloud Firestore)
const db = firebase.firestore(); // Acessando o serviço de Firestore

// --- Referências aos elementos HTML para controle de UI ---
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const createAccountForm = document.getElementById('create-account-form');
const authControlsLoggedOut = document.getElementById('auth-controls-logged-out');
const authControlsLoggedIn = document.getElementById('auth-controls-logged-in');
const userEmailDisplay = document.getElementById('user-email-display');

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

// Função para registrar com E-mail e Senha (chamada pelo onclick do botão)
async function signUpEmailPassword() {
  const email = document.getElementById('user-email-signup').value;
  const password = document.getElementById('user-pass-signup').value;
  const passwordConfirm = document.getElementById('user-pass2-signup').value;
  const userName = document.getElementById('user-name').value; // Para pegar o nome do usuário

  if (password !== passwordConfirm) {
    alert('As senhas não coincidem!');
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    // Adicionar displayName ao usuário (se necessário)
    await userCredential.user.updateProfile({
        displayName: userName
    });
    console.log('Usuário registrado com sucesso:', userCredential.user);
    closeLogin(); // Fecha o overlay após o registro bem-sucedido
    // Você pode adicionar informações adicionais do usuário no Firestore aqui, se precisar
    // Por exemplo: db.collection('users').doc(userCredential.user.uid).set({ name: userName, email: email });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    alert('Erro ao registrar: ' + error.message); // Exibe o erro para o usuário
  }
}

// Função para fazer login com E-mail e Senha (chamada pelo onclick do botão)
async function signInEmailPassword() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-pass').value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('Usuário logado com sucesso:', userCredential.user);
    closeLogin(); // Fecha o overlay após o login bem-sucedido
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    alert('Erro ao fazer login: ' + error.message); // Exibe o erro para o usuário
  }
}

// Função para fazer login com Google (chamada pelo onclick do botão)
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    console.log('Logado com Google:', result.user);
    closeLogin(); // Fecha o overlay após o login bem-sucedido
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error.message);
    alert('Erro ao fazer login com Google: ' + error.message); // Exibe o erro para o usuário
  }
}

// Função para fazer logout
async function logoutUser() {
  try {
    await auth.signOut();
    console.log('Usuário deslogado com sucesso!');
    // A UI será atualizada automaticamente pelo onAuthStateChanged
  } catch (error) {
    console.error('Erro ao fazer logout:', error.message);
    alert('Erro ao fazer logout: ' + error.message);
  }
}


// --- Monitoramento do Estado de Autenticação e Atualização da UI ---
auth.onAuthStateChanged((user) => {
  if (user) {
    // Usuário está logado
    authControlsLoggedOut.classList.add('hidden'); // Esconde "Criar conta"
    authControlsLoggedIn.classList.remove('hidden'); // Mostra "Olá, [email]! Sair"

    // Exibe o email ou displayName
    userEmailDisplay.textContent = user.displayName || user.email;

    console.log('Usuário logado:', user.uid, user.email, user.displayName);

  } else {
    // Usuário está deslogado
    authControlsLoggedOut.classList.remove('hidden'); // Mostra "Criar conta"
    authControlsLoggedIn.classList.add('hidden'); // Esconde "Olá, [email]! Sair"

    console.log('Usuário deslogado');
  }
  // Garante que o overlay de login esteja escondido quando a página carrega ou o estado muda
  // (a menos que tenha sido explicitamente aberto por openOverlay())
  if (loginOverlay.style.display !== 'flex') { // Não fechar se já estiver aberto
      loginOverlay.style.display = 'none';
  }
});
