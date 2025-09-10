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

// --- Lógica para Login com E-mail e Senha ---
async function signUpWithEmail(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log('Usuário registrado com sucesso:', userCredential.user);
    // Armazenar informações adicionais no Firestore/Realtime Database pode ser feito aqui
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
  }
}

async function signInWithEmail(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('Usuário logado com sucesso:', userCredential.user);
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
  }
}

// --- Lógica para Login com Google ---
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider(); // Instancia o provedor Google via o objeto global 'firebase'
  try {
    const result = await auth.signInWithPopup(provider);
    console.log('Logado com Google:', result.user);
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error.message);
  }
}

// --- Monitoramento do Estado de Autenticação ---
auth.onAuthStateChanged((user) => {
  if (user) {
    // Usuário está logado
    console.log('Usuário logado:', user.uid, user.email);
    // Você pode atualizar a interface do usuário aqui
  } else {
    // Usuário está deslogado
    console.log('Usuário deslogado');
    // Você pode exibir formulários de login/registro
  }
});

// Exemplo de como você pode vincular essas funções a botões no seu HTML
// Certifique-se de que seus botões e campos de entrada têm IDs ou classes para você selecioná-los

document.getElementById('signUpButton').addEventListener('click', () => {
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    signUpWithEmail(email, password);
});

document.getElementById('signInButton').addEventListener('click', () => {
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    signInWithEmail(email, password);
});

document.getElementById('googleSignInButton').addEventListener('click', signInWithGoogle);
