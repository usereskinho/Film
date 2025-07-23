const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const fileType = require('file-type');
const clamav = require('clamav.js');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5368709120;

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: async (req, file, cb) => {
    // Vérification du type MIME (vidéo uniquement)
    const allowed = [
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
      'video/webm', 'video/ogg', 'video/mpeg', 'video/3gpp', 'video/3gpp2'
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Type de fichier non autorisé'));
    }
    cb(null, true);
  }
});

// Scan antivirus (ClamAV doit tourner sur le serveur)
function scanFileClamAV(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    clamav.ping(3310, '127.0.0.1', 1000, (err) => {
      if (err) return reject('ClamAV non disponible');
      clamav.createScanner(3310, '127.0.0.1').scan(stream, (err, object, malicious) => {
        if (err) return reject('Erreur scan antivirus');
        if (malicious) return reject('Fichier infecté');
        resolve();
      });
    });
  });
}

router.post('/', authMiddleware, upload.single('video'), async (req, res) => {
  try {
    const filePath = req.file.path;
    // Double vérification du type MIME (contenu réel)
    const type = await fileType.fromFile(filePath);
    if (!type || !type.mime.startsWith('video/')) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Fichier non vidéo' });
    }
    // Scan antivirus
    await scanFileClamAV(filePath);
    res.json({ message: 'Upload réussi', filename: req.file.filename });
  } catch (err) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: err.message || err });
  }
});

module.exports = router; 