const axios = require('axios');
const path = require('path');
const { downloadImageToTempFile, processAndUploadImages } = require('../imageHandler');

async function scrapeAndDownloadMangaDexImages(pageUrl) {
    try {
        // Extract chapter ID from the URL
        const chapterId = pageUrl.split('/').slice(-1)[0];
        console.info('chapterId: ', chapterId);
        // Fetch chapter data from MangaDex API using the correct URL
        const apiUrl = `https://api.mangadex.org/at-home/server/${chapterId}`;
        const { data: chapterData } = await axios.get(apiUrl);
        
        const baseUrl = chapterData.baseUrl;
        const chapterHash = chapterData.chapter.hash;
        const imageFiles = chapterData.chapter.data;

        const imageUrls = imageFiles.map(fileName => `${baseUrl}/data/${chapterHash}/${fileName}`);

        // Download each image to a temporary file
        const tempFilePaths = await Promise.all(imageUrls.map(url => downloadImageToTempFile(url)));

        // Process and upload the images, then clean up
        const uploadedUrls = await processAndUploadImages(tempFilePaths, `uploads/mangadex/Chapter_${chapterId}`);

        return uploadedUrls;
    } catch (error) {
        console.error('Error scraping MangaDex images:', error.response ? error.response.data : error.message);
        return [];
    }
}

module.exports = scrapeAndDownloadMangaDexImages;
