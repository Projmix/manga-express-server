const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const multer = require('multer');

require('dotenv').config();


const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use('/api/user', require('./routes/users'));
app.use('/api/manga', require('./routes/manga'));

app.use('/api/upload', require('./routes/upload'));
app.use('/api/translate', require('./routes/translate'));

module.exports = app;
