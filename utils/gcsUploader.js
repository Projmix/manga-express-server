const { Storage } = require('@google-cloud/storage');
const { prisma } = require("../prisma/prisma-client");
const path = require('path');

const storage = new Storage({
  keyFilename: process.env.GCS_KEY_FILE || path.join(__dirname, '../config/image-cloud-431617-6340e52ab0fa.json'),
  projectId: process.env.GCS_PROJECT_ID || 'image-cloud-431617',
});

const bucketName = process.env.GCS_BUCKET_NAME || 'backend-img-cloud';

const uploadFileToGCS = async (filePath, destination) => {
  try {
    await storage.bucket(bucketName).upload(filePath, { destination });
    const url = `https://storage.googleapis.com/${bucketName}/${destination}`;
    console.log(`${filePath} uploaded to ${bucketName} as ${destination}`);
    return url;
  } catch (error) {
    console.error(`Error uploading to GCS: ${error.message}`);
    throw error;
  }
};


const uploadFilesToGCS = async (files) => {
  try {
    const bucket = storage.bucket(bucketName);
    const uploadPromises = files.map(({ filePath, destination }) =>
      bucket.upload(filePath, { destination })
    );
    const results = await Promise.all(uploadPromises);
    const urls = results.map(
      ([uploadedFile], i) =>
        `https://storage.googleapis.com/${bucketName}/${files[i].destination}`
    );
    console.log(`Batch upload to GCS completed: ${urls}`);
    return urls;
  } catch (error) {
    console.error(`Error during batch upload to GCS: ${error.message}`);
    throw error;
  }
};

const deleteFilesFromGCS = async (files) => {
  const bucket = storage.bucket(bucketName);
  const deleteResults = await Promise.all(files.map(async (fileUrl) => {
      const filePath = fileUrl.split(`https://storage.googleapis.com/${bucketName}/`).pop();
      try {
          await bucket.file(filePath).delete();
          console.log(`File deleted from GCS: ${fileUrl}`);
          return { success: true, fileUrl };
      } catch (error) {
          console.error(`Error deleting file from GCS: ${fileUrl}, Error: ${error.message}`);
          return { success: false, fileUrl, error: error.message };
      }
  }));

  const failedDeletes = deleteResults.filter(result => !result.success);
  if (failedDeletes.length > 0) {
      console.warn(`Failed to delete some files from GCS: ${failedDeletes.map(f => f.fileUrl).join(', ')}`);
  }

  return deleteResults;
};

const deleteMangaAndRelatedFiles = async (manga) => {
  // Collect all files to delete (manga image, chapter files, translated chapter files)
  const filesToDelete = [];

  // Collect files from the manga's chapters
  const chapters = await prisma.chapters.findMany({ where: { mangaId: manga.id } });
  chapters.forEach(async chapter => {
      filesToDelete.push(...chapter.files.split(','));

      // Collect files from translated chapters
      const translatedChapters = await prisma.chaptersTranslate.findMany({ where: { chapterId: chapter.id } });
      translatedChapters.forEach(tc => filesToDelete.push(...tc.files.split(',')));
  });

  // Add manga image file
  filesToDelete.push(manga.image);
  console.log(`filesToDelete`, filesToDelete);
  // Delete all collected files from GCS
  await deleteFilesFromGCS(filesToDelete);

};
module.exports = { uploadFileToGCS, uploadFilesToGCS, deleteFilesFromGCS, deleteMangaAndRelatedFiles };
