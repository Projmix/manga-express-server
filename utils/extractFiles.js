const path = require('path');
const fs = require('fs/promises');
const AdmZip = require('adm-zip');
const { createExtractorFromFile } = require('node-unrar-js');

const extractFiles = async (filePath, destDir) => {
  const ext = path.extname(filePath).toLowerCase();

  try {
    await fs.mkdir(destDir, { recursive: true }); // Проверка, что каталог существует.

    if (ext === '.zip') {
      const zip = new AdmZip(filePath);
      zip.extractAllTo(destDir, true);
    } else if (ext === '.rar') {
      const extractor = await createExtractorFromFile({
        filepath: filePath,
        targetPath: destDir,
      });

      const extractionResult = extractor.extract(); // Извлечь все файлы

      // Итерация по генератору файлов
      for (const file of extractionResult.files) {
        const { fileHeader, extraction } = file;
        if (extraction) {
          const filePath = path.join(destDir, fileHeader.name);
          await fs.writeFile(filePath, extraction);
          console.log(`Извлечено: ${fileHeader.name}`);
        } else {
          console.warn(`Не удалось извлечь: ${fileHeader.name}`);
        }
      }
    } else {
      throw new Error(`Неподдерживаемый тип файла: ${ext}`);
    }
  } catch (error) {
    console.error('Ошибка извлечения:', error);
    throw new Error(`Ошибка при извлечении: ${error.message}`);
  }
};

module.exports = extractFiles;
