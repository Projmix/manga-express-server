const path = require('path');
const fs = require('fs/promises');
const processImage = require('./imageProcessor');
const { uploadFileToGCS } = require('./gcsUploader');
const extractFiles = require('./extractFiles');

const processFileAndUpload = async (file) => {
  try {
    const processedFilePath = path.join(__dirname, '../uploads', `processed-${file.filename}`);
    await processImage(file.path, processedFilePath);
    return uploadFileToGCS(processedFilePath, `images/${file.filename}`);
  } catch (error) {
    console.error(`Error processing file ${file.filename}:`, error.message);
    throw new Error(`Failed to process and upload file: ${file.filename}`);
  }
};

const extractAndProcessFiles = async (file) => {
  try {
    const extractDir = path.join(__dirname, '../uploads', `extracted-${Date.now()}`);
    await fs.mkdir(extractDir, { recursive: true });
    await extractFiles(file.path, extractDir);

    const extractedFiles = await fs.readdir(extractDir);
    return Promise.all(extractedFiles.map(async (extractedFile) => {
      const processedFilePath = path.join(extractDir, `processed-${extractedFile}`);
      const timestampedFileName = `${path.basename(extractedFile, path.extname(extractedFile))}_${Date.now()}${path.extname(extractedFile)}`;
      await processImage(path.join(extractDir, extractedFile), processedFilePath);
      return uploadFileToGCS(processedFilePath, `images/${timestampedFileName}`);
    }));
  } catch (error) {
    console.error(`Error extracting and processing files from ${file.filename}:`, error.message);
    throw new Error(`Failed to extract and process files from archive: ${file.filename}`);
  }
};

module.exports = {
  processFileAndUpload,
  extractAndProcessFiles
};
