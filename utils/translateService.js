const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const FormData = require('form-data');
const fetch = require('node-fetch');


const downloadBlob = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.buffer();
};

const submitTranslate = async (url, options) => {
  const formData = new FormData();
  Object.keys(options).forEach(key => formData.append(key, options[key]));
  formData.append('url', url);
  const response = await axios.post('https://api.cotrans.touhou.ai/task/upload/v1', formData, {
    headers: formData.getHeaders(),
  });
  
  if (response.data.error) {
    throw new Error(response.data.error);
  }
  console.error('response.data.type: ', response.data.type);
  return response.data;
};

const pullTranslationStatus = async (taskId, maxRetries = 10, delay = 1000) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const response = await axios.get(`$https://api.cotrans.touhou.ai/task/${taskId}/status/v1`);
      if (response.data.type === 'result') {
        return response.data.result;
      } else if (response.data.type === 'error') {
        throw new Error(response.data.error_id);
      }
      throw new Error('Unexpected status response');
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed: ${error.message}`);
      if (attempts >= maxRetries) {
        throw new Error('Max retries reached, request failed');
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const mergeImages = async (originalBuffer, maskBuffer) => {
  const originalImage = await loadImage(originalBuffer);
  const maskImage = await loadImage(maskBuffer);

  const canvas = createCanvas(originalImage.width, originalImage.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(originalImage, 0, 0);
  ctx.drawImage(maskImage, 0, 0);

  return canvas.toBuffer('image/png');
};

module.exports = { submitTranslate, pullTranslationStatus, downloadBlob, mergeImages };
