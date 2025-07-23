const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const { findUserByLogin, createUser, loadUsers } = require('../models/user');

const router = express.Router();

// Inscription du premier admin (si aucun utilisateur)
router.post('/register', (req, res) => {
  const users = loadUsers();
  if (users.length > 0) return res.status(403).json({ error: 'Déjà initialisé' });
  const { login, password, email } = req.body;
  if (!login || !password || !email) return res.status(400).json({ error: 'Champs requis' });
  const twofaSecret = speakeasy.generateSecret().base32;
  const user = createUser({ login, password, email, twofaSecret });
  res.json({ message: 'Admin créé', twofaSecret });
});

// Login étape 1 : login/password
router.post('/login', (req, res) => {
  const { login, password } = req.body;
  const user = findUserByLogin(login);
  if (!user) return res.status(401).json({ error: 'Identifiants invalides' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Identifiants invalides' });
  // On ne donne pas encore de JWT, il faut le code 2FA
  req.session.tempUser = { login };
  res.json({ message: 'Code 2FA requis' });
});

// Login étape 2 : code 2FA
router.post('/2fa', (req, res) => {
  const { code } = req.body;
  if (!req.session.tempUser) return res.status(401).json({ error: 'Session expirée' });
  const user = findUserByLogin(req.session.tempUser.login);
  const verified = speakeasy.totp.verify({
    secret: user.twofaSecret,
    encoding: 'base32',
    token: code
  });
  if (!verified) return res.status(401).json({ error: 'Code 2FA invalide' });
  // Auth OK, on donne le JWT
  const token = jwt.sign({ login: user.login }, process.env.JWT_SECRET, { expiresIn: '1h' });
  req.session.tempUser = null;
  res.json({ token });
});

// Déconnexion
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Déconnecté' });
  });
});

module.exports = router; 