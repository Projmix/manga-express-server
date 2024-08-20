const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs').promises;
const tmp = require('tmp');
const { uploadFilesToGCS } = require('./gcsUploader');


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
      
      const destination = `images/${i}_${Date.now()}${path.extname(imageUrl)}`;
      filesToUpload.push({ filePath: tempFilePath, destination });
    }

    // Batch upload all files to GCS
    const uploadedUrls = await uploadFilesToGCS(filesToUpload);

    // Clean up temporary files
    await Promise.all(filesToUpload.map(file => fs.unlink(file.filePath)));

    return uploadedUrls;
  } catch (error) {
    console.error(`Error during image upload: ${error.message}`);
    return [];
  }
}

module.exports = uploadMangaImagesFromPage;
