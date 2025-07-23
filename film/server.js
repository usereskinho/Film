require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const csrf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();

// Sécurité HTTP headers
app.use(helmet());

// Logger
app.use(morgan('combined'));

// Limite de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Protection contre injection NoSQL
app.use(mongoSanitize());

// Protection XSS
app.use(xss());

// Parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions (pour CSRF et 2FA)
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000 // 1h
  }
}));

// Protection CSRF
// app.use(csrf());

// Dossier d'upload sécurisé (création si inexistant)
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes d'authentification
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Routes d'upload
const uploadRoutes = require('./routes/upload');
app.use('/upload', uploadRoutes);

// Exemple de route protégée
const authMiddleware = require('./middleware/auth');
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Accès autorisé', user: req.user });
});

// Test route
app.get('/', (req, res) => {
  res.send('Film Uploader Sécurisé - Backend OK');
});

// Gestion des erreurs CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next(err);
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 