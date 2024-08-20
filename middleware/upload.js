const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads/');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const originalName = path.basename(file.originalname, path.extname(file.originalname));
    const newFileName = `${originalName}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, newFileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/png", 
    "image/jpg", 
    "image/jpeg",
    "application/zip",
    "application/x-rar-compressed",
    "application/x-zip-compressed",
    "application/octet-stream"
  ];
  cb(null, allowedMimeTypes.includes(file.mimetype));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
