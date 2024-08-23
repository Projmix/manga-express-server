const path = require('path');
const fs = require('fs/promises');
const processImage = require('./imageProcessor');
const { uploadFileToGCS } = require('./gcsUploader');
const extractFiles = require('./extractFiles');

const processFileAndUpload = async (file) => {
  try {
    const processedFilePaths = await processImage(file.path, path.join(__dirname, '../uploads'));
    
    // Ensure we're handling an array of file paths
    if (!Array.isArray(processedFilePaths)) {
      processedFilePaths = [processedFilePaths];
    }
    
    // Upload each processed image part
    return Promise.all(processedFilePaths.map(processedFilePath =>
      uploadFileToGCS(processedFilePath, `images/${path.basename(processedFilePath)}`)
    ));
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
      const processedFilePaths = await processImage(path.join(extractDir, extractedFile), extractDir);
      
      if (!Array.isArray(processedFilePaths)) {
        processedFilePaths = [processedFilePaths];
      }
      
      return Promise.all(processedFilePaths.map(processedFilePath => {
        const timestampedFileName = `${path.basename(processedFilePath, path.extname(processedFilePath))}_${Date.now()}${path.extname(processedFilePath)}`;
        return uploadFileToGCS(processedFilePath, `images/${timestampedFileName}`);
      }));
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
