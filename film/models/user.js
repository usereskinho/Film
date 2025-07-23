const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const USERS_FILE = path.join(__dirname, '../data/users.json');

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function findUserByLogin(login) {
  const users = loadUsers();
  return users.find(u => u.login === login);
}

function createUser({ login, password, email, twofaSecret }) {
  const users = loadUsers();
  if (users.find(u => u.login === login)) throw new Error('User exists');
  const hash = bcrypt.hashSync(password, 12);
  const user = { login, password: hash, email, twofaSecret };
  users.push(user);
  saveUsers(users);
  return user;
}

module.exports = { loadUsers, saveUsers, findUserByLogin, createUser }; 