const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs').promises;
const tmp = require('tmp');
const { uploadFilesToGCS } = require('./gcsUploader');
const processImage = require('./imageProcessor');

/**
 * Retrieves and downloads manga images from a given page URL.
 *
 * @param {string} pageUrl - URL of the page with manga images.
 * @param {string} imageSelector - CSS selector to select manga images.
 * @returns {Promise<string[]>} - Returns an array of URLs of uploaded images.
 */
async function uploadMangaImagesFromPage(pageUrl, imageSelector) {
  try {
    const { data: html } = await axios.get(pageUrl);
    const $ = cheerio.load(html);
    const imageUrls = $(imageSelector)
      .filter((_, img) => $(img).width() > 500)
      .map((_, img) => $(img).attr('src'))
      .get();

    if (!imageUrls || imageUrls.length === 0) {
      console.log('Images not found on page.');
      return [];
    }

    const filesToUpload = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const { data: imageData } = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const tempFilePath = tmp.tmpNameSync({ postfix: path.extname(imageUrl) });
      await fs.writeFile(tempFilePath, imageData);

      // Process the image, which may result in multiple parts
      const processedFilePaths = await processImage(tempFilePath, path.dirname(tempFilePath));
      
      // Add each processed file part to the upload list
      for (let j = 0; j < processedFilePaths.length; j++) {
        const processedFilePath = processedFilePaths[j];
        const destination = `images/${i}_${j}_${Date.now()}${path.extname(processedFilePath)}`;
        filesToUpload.push({ filePath: processedFilePath, destination });
      }

      // Clean up the original temporary file
      await fs.unlink(tempFilePath);
    }

    // Batch upload all processed files to GCS
    const uploadedUrls = await uploadFilesToGCS(filesToUpload);

    // Clean up temporary processed files
    await Promise.all(filesToUpload.map(file => fs.unlink(file.filePath)));

    return uploadedUrls;
  } catch (error) {
    console.error(`Error during image upload: ${error.message}`);
    return [];
  }
}

module.exports = uploadMangaImagesFromPage;
