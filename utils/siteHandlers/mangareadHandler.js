const axios = require('axios');
const cheerio = require('cheerio');
const { downloadImageToTempFile, processAndUploadImages } = require('../imageHandler');

async function scrapeAndDownloadMangareadImages(pageUrl) {
  try {
    const { data: html } = await axios.get(pageUrl);
    const $ = cheerio.load(html);

    const pageTitle = $('title').text().trim();
    const mangaTitle = pageTitle.split('Chapter')[0].trim();
    const chapterNumber = pageTitle.split('Chapter')[1].trim().split(':')[0].trim();

    const imageUrls = [];
    $('.reading-content .wp-manga-chapter-img').each((i, el) => {
      const imgUrl = $(el).attr('src');
      if (imgUrl) imageUrls.push(imgUrl);
    });

    const imagePaths = await Promise.all(imageUrls.map(url => downloadImageToTempFile(url)));
    const uploadedUrls = await processAndUploadImages(imagePaths, `uploads/mangaread/${mangaTitle}/Chapter_${chapterNumber}`);

    return uploadedUrls;
  } catch (error) {
    console.error('Error scraping Mangaread images:', error);
    return [];
  }
}

module.exports = scrapeAndDownloadMangareadImages;
