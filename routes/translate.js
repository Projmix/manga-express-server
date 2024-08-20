const express = require('express');
const router = express.Router();
const { translateImage } = require('../controllers/translate');
const { auth } = require('../middleware/auth');

router.post('/', auth, translateImage);

module.exports = router;
