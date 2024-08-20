const path = require('path');
const fs = require('fs/promises');
const { processFileAndUpload, extractAndProcessFiles } = require('../utils/fileProcessor');

/**
* @route POST /api/upload
* @desc Upload files
* @access Private
*
* / */
const uploadFile = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Files were not uploaded' });
    }

    const uploadedUrls = await Promise.all(files.map(async (file) => {
      const ext = path.extname(file.filename).toLowerCase();
      if (ext === '.zip' || ext === '.rar') {
        return extractAndProcessFiles(file);
      } else {
        return processFileAndUpload(file);
      }
    }));

    res.status(200).json(uploadedUrls.flat());
  } catch (error) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};


/**
* @route POST /api/upload/url
* @desc Get images from a website
* @access Private
*
* / */
const uploadUrl = async (req, res) => {
  try {
    const { url, selector } = req.body;
    if (!url || !selector) {
      return res.status(400).json({ message: "Not all fields are entered" });
    }

    const uploadedUrls = await handleImageExtraction(url, selector);
    res.status(201).json(uploadedUrls);
  } catch (error) {
    console.error("Error loading images:", error);
    res.status(500).json({ message: "Failed to get images from the site" });
  }
};

module.exports = {
  uploadFile,
  uploadUrl
};
