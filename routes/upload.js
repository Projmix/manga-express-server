const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadFile, uploadUrl } =require('../controllers/upload');
const {auth} = require('../middleware/auth');



router.post('/', auth, upload.array('files', 200), uploadFile);

router.post('/url', auth, uploadUrl);

  
module.exports = router;
