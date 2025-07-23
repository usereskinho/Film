let token = null;
const loginForm = document.getElementById('loginForm');
const twofaForm = document.getElementById('twofaForm');
const uploadForm = document.getElementById('uploadForm');
const logoutBtn = document.getElementById('logoutBtn');
const messages = document.getElementById('messages');

function showMessage(msg, type = 'error') {
  messages.innerHTML = `<div class="message ${type}">${msg}</div>`;
}
function clearMessage() { messages.innerHTML = ''; }

loginForm.onsubmit = async e => {
  e.preventDefault(); clearMessage();
  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password })
  });
  const data = await res.json();
  if (res.ok) {
    loginForm.classList.add('hidden');
    twofaForm.classList.remove('hidden');
    showMessage('Entrez le code 2FA', 'success');
  } else {
    showMessage(data.error || 'Erreur');
  }
};

twofaForm.onsubmit = async e => {
  e.preventDefault(); clearMessage();
  const code = document.getElementById('code').value;
  const res = await fetch('/auth/2fa', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  const data = await res.json();
  if (res.ok && data.token) {
    token = data.token;
    twofaForm.classList.add('hidden');
    uploadForm.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    showMessage('Connecté !', 'success');
  } else {
    showMessage(data.error || 'Erreur 2FA');
  }
};

uploadForm.onsubmit = async e => {
  e.preventDefault(); clearMessage();
  const file = document.getElementById('video').files[0];
  if (!file) return showMessage('Aucun fichier sélectionné');
  if (file.size > 5368709120) return showMessage('Fichier trop volumineux (max 5 Go)');
  const formData = new FormData();
  formData.append('video', file);
  const res = await fetch('/upload', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token },
    body: formData
  });
  const data = await res.json();
  if (res.ok) {
    showMessage('Upload réussi : ' + data.filename, 'success');
  } else {
    showMessage(data.error || 'Erreur upload');
  }
};

logoutBtn.onclick = async () => {
  await fetch('/auth/logout', { method: 'POST' });
  token = null;
  uploadForm.classList.add('hidden');
  logoutBtn.classList.add('hidden');
  loginForm.classList.remove('hidden');
  twofaForm.classList.add('hidden');
  clearMessage();
}; 