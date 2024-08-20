const path = require('path');
const fs = require('fs');
const { submitTranslate, pullTranslationStatus, downloadBlob, mergeImages } = require('../utils/translateService');
const { uploadFileToGCS } = require('../utils/gcsUploader');

const translateImage = async (req, res) => {
  const { url, target_language, detector, direction, translator, size, retry } = req.body;

  try {
    const { filename, extension } = extractFilename(url);
    const task = await submitTranslate(url, {
      target_language,
      detector,
      direction,
      translator,
      size,
      retry,
    });

    const maskUrl = await getTranslationMaskUrl(task);
    const finalImageBuffer = await processTranslation(url, maskUrl);

    const tempFilePath = saveBufferToFile(finalImageBuffer, filename, extension);
    const gcsUrl = await uploadFileToGCS(tempFilePath, `images/${filename}`);

    res.status(200).json({ translatedImageUrl: gcsUrl });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ message: 'Error during translation', error: error.message });
  }
};

const extractFilename = (url) => {
  const parts = url.split('/');
  const filenameWithExtension = parts.pop();
  const [filename, extension] = filenameWithExtension.split('.');
  return { filename: `${filename}_${Date.now()}`, extension };
};

const getTranslationMaskUrl = async (task) => {
  if (task.result?.translation_mask) {
    return task.result.translation_mask;
  }
  const result = await pullTranslationStatus(task.id);
  return result.translation_mask;
};

const processTranslation = async (originalUrl, maskUrl) => {
  const originalBuffer = await downloadBlob(originalUrl);
  const maskBuffer = await downloadBlob(maskUrl);
  return mergeImages(originalBuffer, maskBuffer);
};

const saveBufferToFile = (buffer, filename, extension) => {
  const tempFilePath = path.join(__dirname, '../uploads', `${filename}.${extension}`);
  fs.writeFileSync(tempFilePath, buffer);
  return tempFilePath;
};

module.exports = { translateImage };
