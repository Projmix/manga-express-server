const uploadMangaImagesFromPage = require('./mangaImageUploader');
const downloadWebtoonChapter = require('./downloadWebtoonChapter');

/**
 * Processes the extraction and uploading of images based on the site name.
 *
 * @param {string} pageUrl - The URL of the page to extract images from.
 * @param {string} imageSelector - CSS selector for choosing images (optional).
 * @returns {Promise<string[]>} - Array of URLs of uploaded images.
 */
async function handleImageExtraction(pageUrl, imageSelector = null) {
    let uploadedUrls = [];
  
    if (pageUrl.includes('webtoons.com')) {
      console.log(`Processing webtoons.com URL`);
      uploadedUrls = await downloadWebtoonChapter(pageUrl);
    } else { 
      console.log(`Processing manga page URL`);
      uploadedUrls = await uploadMangaImagesFromPage(pageUrl, imageSelector);
    } 
  
    return uploadedUrls;
}
  
module.exports = handleImageExtraction;
