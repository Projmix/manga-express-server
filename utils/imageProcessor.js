const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');

async function processImage(inputPath, outputDir) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    if (metadata.height <= 3000) {
      // If height is within limit, just save the original image
      const outputPath = path.join(outputDir, `processed-${path.basename(inputPath)}`);
      await image.jpeg({ quality: 80 }).toFile(outputPath);
      console.log(`Image processed and saved in ${outputPath}`);
      return [outputPath];
    } else {
      // Calculate the number of parts
      const maxPartHeight = 2000;
      const partCount = Math.ceil(metadata.height / maxPartHeight);

      // Calculate the height for each part
      const partHeight = Math.ceil(metadata.height / partCount);


      const parts = [];
      let top = 0;

      for (let i = 0; i < partCount; i++) {
        const height = Math.min(partHeight, metadata.height - top);

        const outputPath = path.join(outputDir, `processed-${i + 1}-${path.basename(inputPath)}`);

        
        // Extract and save each part
        await sharp(inputPath)
          .extract({ left: 0, top, width: metadata.width, height })
          .jpeg({ quality: 80 })
          .toFile(outputPath);

        parts.push(outputPath);
        console.log(`Image part ${i + 1} processed and saved in ${outputPath}`);
        
        top += height;
      }
      
      return parts;
    }
  } catch (error) {
    console.error(`Error while processing image: ${error.message}`);
    throw error;
  }
}

module.exports = processImage;
