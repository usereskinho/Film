const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// const speakeasy = require('speakeasy');
// const { findUserByLogin, createUser, loadUsers } = require('../models/user');

const router = express.Router();

// Compte admin codé en dur
const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 12);

// Login direct (pas de 2FA)
router.post('/login', (req, res) => {
  const { login, password } = req.body;
  if (login !== ADMIN_LOGIN) return res.status(401).json({ error: 'Identifiants invalides' });
  if (!bcrypt.compareSync(password, ADMIN_PASSWORD)) return res.status(401).json({ error: 'Identifiants invalides' });
  // Auth OK, on donne le JWT
  const token = jwt.sign({ login: ADMIN_LOGIN }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Déconnexion
router.post('/logout', (req, res) => {
  req.session?.destroy?.(() => {
    res.json({ message: 'Déconnecté' });
  }) || res.json({ message: 'Déconnecté' });
});

module.exports = router; 