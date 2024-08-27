const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const tmp = require('tmp');
const { uploadFilesToGCS } = require('./gcsUploader');
const processImage = require('./imageProcessor');

/**
 * Downloads an image from a URL and saves it to a temporary file.
 *
 * @param {string} imageUrl - The URL of the image to download.
 * @returns {Promise<string>} - The path to the temporary file.
 */
async function downloadImageToTempFile(imageUrl) {
  const { data: imageData } = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const tempFilePath = tmp.tmpNameSync({ postfix: path.extname(imageUrl) });
  await fs.writeFile(tempFilePath, imageData);
  return tempFilePath;
}


/**
 * Processes and uploads images to cloud storage.
 *
 * @param {string[]} imagePaths - Paths to the images to be processed.
 * @param {string} baseDestination - Base destination path for cloud storage.
 * @returns {Promise<string[]>} - URLs of the uploaded images.
 */
async function processAndUploadImages(imagePaths, baseDestination) {
  const filesToUpload = [];

  for (let i = 0; i < imagePaths.length; i++) {
    const tempFilePath = imagePaths[i];

    // Process the image, which may result in multiple parts
    const processedFilePaths = await processImage(tempFilePath, path.dirname(tempFilePath));

    // Add each processed file part to the upload list
    for (let j = 0; j < processedFilePaths.length; j++) {
      const processedFilePath = processedFilePaths[j];
      const destination = `${baseDestination}/${i}_${j}_${Date.now()}${path.extname(processedFilePath)}`;
      filesToUpload.push({ filePath: processedFilePath, destination });
    }

    // Clean up the original temporary file
    try {
      await fs.unlink(tempFilePath);
    } catch (err) {
      console.warn(`Failed to delete temp file: ${tempFilePath}. Error: ${err.message}`);
    }
  }
  

  // Batch upload all processed files to GCS
  const uploadedUrls = await uploadFilesToGCS(filesToUpload);

  // Clean up temporary processed files
  await Promise.all(filesToUpload.map(async (file) => {
    try {
      await fs.unlink(file.filePath);
    } catch (err) {
      console.warn(`Failed to delete processed file: ${file.filePath}. Error: ${err.message}`);
    }
  }));

  return uploadedUrls;
}

module.exports = { downloadImageToTempFile, processAndUploadImages };
