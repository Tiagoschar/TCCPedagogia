// firebase.js (versão CORRIGIDA)
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
      // O evento de click no botão já chama a função,
      // mas se o usuário pressionar Enter, este listener pega.
      window.signUpEmailPassword();
    });
  }
  // caso o usuário pressione Enter no login-form
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // O evento de click no botão já chama a função,
      // mas se o usuário pressionar Enter, este listener pega.
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

    const signUpButton = document.querySelector('#create-account-form button[type="submit"]');
    const originalButtonText = signUpButton ? signUpButton.textContent : 'Criar conta';

    if (signUpButton) {
      signUpButton.disabled = true; // Desabilita o botão
      signUpButton.textContent = 'Criando...'; // Muda o texto para indicar processamento
    }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      
      // Atualiza displayName
      await userCredential.user.updateProfile({ displayName: userName });
      
      // Opcional: gravar dados no Firestore (mantido comentado como estava)
      // await db.collection('users').doc(userCredential.user.uid).set({ name: userName, email });
      
      console.log('Usuário registrado:', userCredential.user.uid);
      window.closeLogin(); // Fecha o overlay
      alert('Conta criada com sucesso e você já está logado!'); // Feedback positivo
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      let errorMessage = 'Ocorreu um erro desconhecido ao criar a conta.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está cadastrado. Por favor, tente fazer login ou use outro email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'O formato do email é inválido. Por favor, verifique e tente novamente.';
          break;
        case 'auth/weak-password':
          errorMessage = 'A senha é muito fraca. Ela deve ter pelo menos 6 caracteres. Por favor, escolha uma senha mais forte.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'A criação de contas com email e senha não está habilitada. Por favor, entre em contato com o administrador do site.';
          break;
        default:
          errorMessage = `Erro ao registrar: ${error.message}`;
          break;
      }
      alert(errorMessage);
    } finally {
      // Reabilita o botão e restaura o texto, independentemente do sucesso ou falha
      if (signUpButton) {
        signUpButton.disabled = false;
        signUpButton.textContent = originalButtonText;
      }
    }
  };

  window.signInEmailPassword = async function() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-pass').value;

    const signInButton = document.querySelector('#login-form button[onclick="signInEmailPassword()"]');
    const originalSignInText = signInButton ? signInButton.textContent : 'Entrar';

    if (signInButton) {
      signInButton.disabled = true;
      signInButton.textContent = 'Entrando...';
    }

    try {
      await auth.signInWithEmailAndPassword(email, password);
      console.log('Usuário logado com e-mail/senha');
      window.closeLogin();
      alert('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      let errorMessage = 'Ocorreu um erro desconhecido ao fazer login.';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Email ou senha inválidos. Por favor, verifique suas credenciais.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'O formato do email é inválido. Por favor, verifique e tente novamente.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta conta foi desativada. Por favor, entre em contato com o suporte.';
          break;
        default:
          errorMessage = `Erro ao fazer login: ${error.message}`;
          break;
      }
      alert(errorMessage);
    } finally {
      if (signInButton) {
        signInButton.disabled = false;
        signInButton.textContent = originalSignInText;
      }
    }
  };

  window.signInWithGoogle = async function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const googleSignInButton = document.querySelector('#login-form button[onclick="signInWithGoogle()"]');
    const originalGoogleText = googleSignInButton ? googleSignInButton.textContent : 'Entrar com Google';

    if (googleSignInButton) {
      googleSignInButton.disabled = true;
      googleSignInButton.textContent = 'Entrando com Google...';
    }

    try {
      await auth.signInWithPopup(provider);
      console.log('Logado com Google');
      window.closeLogin();
      alert('Login com Google realizado com sucesso!');
    } catch (error) {
      console.error('Erro Google:', error);
      let errorMessage = 'Ocorreu um erro desconhecido ao fazer login com Google.';
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'O popup de login foi fechado antes da conclusão. Tente novamente.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Outra solicitação de autenticação foi iniciada. Por favor, tente novamente.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Já existe uma conta com este email, mas usando outro método de login (ex: e-mail/senha). Por favor, faça login com o método original.';
          break;
        default:
          errorMessage = `Erro ao fazer login com Google: ${error.message}`;
          break;
      }
      alert(errorMessage);
    } finally {
      if (googleSignInButton) {
        googleSignInButton.disabled = false;
        googleSignInButton.textContent = originalGoogleText;
      }
    }
  };

  window.logoutUser = async function() {
    try {
      await auth.signOut();
      console.log('Usuário deslogado');
      alert('Você foi desconectado com sucesso!');
      // a UI será atualizada no onAuthStateChanged
    } catch (error) {
      console.error('Erro ao deslogar:', error);
      alert('Erro ao fazer logout: ' + (error.message || error));
    }
  };

  // ----- Observador de estado de autenticação -----
  auth.onAuthStateChanged((user) => {
  if (user) {
    // aside
    if (authControlsLoggedOut) authControlsLoggedOut.classList.add('hidden');
    if (authControlsLoggedIn) authControlsLoggedIn.classList.remove('hidden');
    if (userEmailDisplay) userEmailDisplay.textContent = user.displayName || user.email;

    // navbar -> muda para "Logout"
    if (loginBtn) {
      loginBtn.textContent = "Logout"; // Texto do botão na navbar
      loginBtn.onclick = async (e) => {
        e.preventDefault();
        await window.logoutUser();
      };
    }

    // Garante que o overlay de login esteja fechado se o usuário já estiver logado
    window.closeLogin();
  } else {
    // aside
    if (authControlsLoggedOut) authControlsLoggedOut.classList.remove('hidden');
    if (authControlsLoggedIn) authControlsLoggedIn.classList.add('hidden');

    // navbar -> volta para "Login"
    if (loginBtn) {
      loginBtn.textContent = "Login"; // Texto do botão na navbar
      loginBtn.onclick = (e) => {
        e.preventDefault();
        window.openOverlay();
        window.showLogin();
      };
    }
  }
});


}); // fim DOMContentLoaded
