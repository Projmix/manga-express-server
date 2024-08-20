const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs').promises;
const tmp = require('tmp');
const { uploadFilesToGCS } = require('./gcsUploader');

/**
* Downloads images from Webtoon and uploads them to GCS.
*
* @param {string} url - URL of the Webtoon episode.
* @returns {Promise<string[]>} - Returns an array of URLs of the downloaded images.
*/
async function downloadWebtoonChapter(url) {
    const urlMatch = url.match(/title_no=([0-9]+).*episode_no=([0-9]+)/);
    if (!urlMatch) {
      console.error("Can't extract title_no or episode_no from the URL!");
      return [];
    }

    const [_, titleNumber, episodeNumber] = urlMatch;
    console.log(`Fetching Episode ${episodeNumber}: ${url}`);

    let html;
    try {
      const response = await axios.get(url);
      html = response.data;
    } catch (err) {
      console.error(`Failed to fetch HTML content: ${err.message}`);
      return [];
    }

    const $ = cheerio.load(html);
    const imageLinks = $('img[ondragstart]').map((_, img) => $(img).attr('data-url')).get();

    if (!imageLinks.length) {
      console.error(`Image list for episode ${episodeNumber} is empty!`);
      return [];
    }

    const filesToUpload = [];
    console.log(`Found ${imageLinks.length} images, starting download...`);

    for (let i = 0; i < imageLinks.length; i++) {
      const link = imageLinks[i];
      const parsedUrl = new URL(link);
      const cleanUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;

      try {
        const { data: imageData } = await axios.get(cleanUrl, { 
            responseType: 'arraybuffer',
            headers: {
                'Referer': url,
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const tempFilePath = tmp.tmpNameSync({ postfix: path.extname(parsedUrl.pathname) });
        await fs.writeFile(tempFilePath, imageData);

        const destination = `webtoons/${titleNumber}/episode_${episodeNumber}/${i + 1}_${Date.now()}${path.extname(parsedUrl.pathname)}`;
        filesToUpload.push({ filePath: tempFilePath, destination });
      } catch (err) {
        console.error(`Failed to download or prepare image for upload: ${link} - ${err.message}`);
        return [];
      }
    }

    // Batch upload to GCS
    const uploadedUrls = await uploadFilesToGCS(filesToUpload);

    // Clean up temporary files
    await Promise.all(filesToUpload.map(file => fs.unlink(file.filePath)));

    console.log(`Episode ${episodeNumber}: All images uploaded successfully.`);
    return uploadedUrls;
}

module.exports = downloadWebtoonChapter;
