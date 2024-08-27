const axios = require('axios');
const cheerio = require('cheerio');
const { downloadImageToTempFile, processAndUploadImages } = require('./imageHandler');

/**
 * Retrieves and downloads manga images from a given page URL.
 *
 * @param {string} pageUrl - URL of the page with manga images.
 * @param {string} imageSelector - CSS selector to select manga images.
 * @returns {Promise<string[]>} - Returns an array of URLs of uploaded images.
 */
async function uploadMangaImagesFromPage(pageUrl, imageSelector) {
  try {
    // Fetch the HTML content of the page
    const { data: html } = await axios.get(pageUrl);
    const $ = cheerio.load(html);

    // Extract image URLs based on the provided CSS selector
    const imageUrls = $(imageSelector)
      .map((_, img) => $(img).attr('src'))
      .get();

    if (!imageUrls || imageUrls.length === 0) {
      console.log('Images not found on page.');
      return [];
    }

    // Download images to temporary files
    const tempFilePaths = await Promise.all(imageUrls.map(url => downloadImageToTempFile(url)));

    // Process and upload images, then clean up
    const uploadedUrls = await processAndUploadImages(tempFilePaths, 'images');

    return uploadedUrls;
  } catch (error) {
    console.error(`Error during image upload: ${error.message}`);
    return [];
  }
}

module.exports = uploadMangaImagesFromPage;
