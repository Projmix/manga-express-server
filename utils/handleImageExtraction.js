const uploadMangaImagesFromPage = require('./mangaImageUploader');
const downloadWebtoonChapter = require('./downloadWebtoonChapter');
const scrapeAndDownloadMangaDexImages = require('./siteHandlers/mangaDexHandler');
const scrapeAndDownloadMangakakalotImages = require('./siteHandlers/mangakakalotHandler');
const scrapeAndDownloadMangareadImages = require('./siteHandlers/mangareadHandler');
const scrapeAndDownloadChapMangaNatoImages = require('./siteHandlers/chapMangaNatoHandler');
const scrapeAndDownloadKunMangaImages = require('./siteHandlers/kunMangaHandler');


/**
 * Processes the extraction and uploading of images based on the site name.
 *
 * @param {string} pageUrl - The URL of the page to extract images from.
 * @param {string} imageSelector - CSS selector for choosing images (optional).
 * @returns {Promise<string[]>} - Array of URLs of uploaded images.
 */
async function handleImageExtraction(pageUrl, imageSelector) {
    let uploadedUrls = [];
  
    if (pageUrl.includes('webtoons.com')) {
      console.log(`Processing webtoons.com URL`);
      uploadedUrls = await downloadWebtoonChapter(pageUrl);
    } else if (pageUrl.includes('mangadex.org')) {
      console.log(`Processing MangaDex URL`);
      uploadedUrls = await scrapeAndDownloadMangaDexImages(pageUrl);
  } else if (pageUrl.includes('mangakakalot.com')) {
      console.log(`Processing Mangakakalot URL`);
      uploadedUrls = await scrapeAndDownloadMangakakalotImages(pageUrl);
  } else if (pageUrl.includes('mangaread.org')) {
      console.log(`Processing Mangaread URL`);
      uploadedUrls = await scrapeAndDownloadMangareadImages(pageUrl);
  } else if (pageUrl.includes('chapmanganato.to')) {
      console.log(`Processing ChapMangaNato URL`);
      uploadedUrls = await scrapeAndDownloadChapMangaNatoImages(pageUrl);
  } else if (pageUrl.includes('kunmanga.com')) {
      console.log(`Processing KunManga URL`);
      uploadedUrls = await scrapeAndDownloadKunMangaImages(pageUrl);
  } else {
      console.log(`Processing manga page URL`);
      uploadedUrls = await uploadMangaImagesFromPage(pageUrl, imageSelector);
    } 
  
    return uploadedUrls;
}
  
module.exports = handleImageExtraction;
