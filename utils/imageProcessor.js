const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');

async function processImage(inputPath, outputDir) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    if (metadata.height <= 5000) {
      // If height is within limit, just save the original image
      console.log(`outputDir <= 5000`);
      console.log(outputDir);
      console.log(`processed-`);
      console.log(path.basename(inputPath));
      const outputPath = path.join(path.dirname(outputDir), `processed-${path.basename(inputPath)}`);
      console.log(`outputPath`);
      console.log(outputPath);
      await image.jpeg({ quality: 80 }).toFile(outputPath);
      console.log(`Image processed and saved in ${outputPath}`);
      return [outputPath];
    } else {
      // If height exceeds 5000 pixels, split the image
      const parts = [];
      const partCount = Math.ceil(metadata.height / 5000);

      for (let i = 0; i < partCount; i++) {
        const top = i * 5000;
        const height = Math.min(5000, metadata.height - top);
        
        const outputPath = path.join(outputDir, `processed-${i + 1}-${path.basename(inputPath)}`);
        await image.extract({ left: 0, top, width: metadata.width, height })
                   .jpeg({ quality: 80 })
                   .toFile(outputPath);

        parts.push(outputPath);
        console.log(`Image part ${i + 1} processed and saved in ${outputPath}`);
      }
      return parts;
    }
  } catch (error) {
    console.error(`Error while processing image: ${error.message}`);
    throw error;
  }
}

module.exports = processImage;
