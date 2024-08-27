const axios = require('axios');
const cheerio = require('cheerio');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');


const { processAndUploadImages } = require('../imageHandler');

// Function to download an image using Axios with streaming and headers
const downloadImageStream = async (url, filePath) => {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      'Referer': url,
    },
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(fs.createWriteStream(filePath))
      .on('finish', () => resolve(filePath))
      .on('error', (e) => reject(e));
  });
};

async function downloadImageToTempFileStream(imageUrl) {
  const tempFilePath = tmp.tmpNameSync({ postfix: path.extname(imageUrl) });
  await downloadImageStream(imageUrl, tempFilePath);
  return tempFilePath;
}

async function scrapeAndDownloadChapMangaNatoImages(pageUrl) {
  try {
    const { data: html } = await axios.get(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Referer': pageUrl,
      },
    });

    const $ = cheerio.load(html);

    const pageTitle = $('title').text().trim();
    const mangaTitle = pageTitle.split('Chapter')[0].trim();
    const chapterNumber = pageTitle.split('Chapter')[1].trim().split(' ')[0].trim();

    const imageUrls = [];
    $('.container-chapter-reader img').each((i, el) => {
      const imgUrl = $(el).attr('src');
      if (imgUrl) imageUrls.push(imgUrl);
    });

    const imagePaths = await Promise.all(imageUrls.map(url => downloadImageToTempFileStream(url)));
    const uploadedUrls = await processAndUploadImages(imagePaths, `uploads/chapmanganato/${mangaTitle}/Chapter_${chapterNumber}`);

    return uploadedUrls;
  } catch (error) {
    console.error('Error scraping ChapMangaNato images:', error);
    return [];
  }
}

module.exports = scrapeAndDownloadChapMangaNatoImages;
