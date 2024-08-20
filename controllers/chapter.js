const { prisma } = require("../prisma/prisma-client");
const { deleteFilesFromGCS } = require('../utils/gcsUploader');

/**
 * @route GET /api/manga/:name/:chapterName
 * @desc Read chapter
 * @access Private
 * 
 * / */
const getChapterByName = async (req, res) => {
    try {
        const { name, chapterName } = req.params;
        const manga = await prisma.manga.findFirst({ where: { title: name } });
        if (!manga) return res.status(404).json({ message: "Manga not found" });

        const chapter = await prisma.chapters.findFirst({
            where: { name: chapterName, mangaId: manga.id }
        });

        if (!chapter) return res.status(404).json({ message: "Chapter not found" });
        res.status(200).json(chapter);
    } catch (error) {
        res.status(500).json({ message: `Failed to retrieve chapter: ${error.message}` });
    }
};

/**
 * @route POST /api/manga/:name/add
 * @desc Add chapter
 * @access Private
 * 
 * / */
const addChapter = async (req, res) => {
    try {
        const { name, files } = req.body;
        const { name: mangaTitle } = req.params;

        if (!name || !files) return res.status(400).json({ message: "All fields are required" });

        const manga = await prisma.manga.findFirst({ where: { title: mangaTitle } });
        if (!manga) return res.status(404).json({ message: "Manga not found" });

        const chapter = await prisma.chapters.create({
            data: { name, files, mangaId: manga.id }
        });

        res.status(201).json(chapter);
    } catch (error) {
        res.status(500).json({ message: `Failed to create chapter: ${error.message}` });
    }
};

/**
 * @route PUT /manga/:name/edit/:chapterName

 * @desc Edit chapter
 * @access Private
 * 
 * / */
const editChapter = async (req, res) => {
    try {
        const { chapterName } = req.params;
        const { name, files } = req.body;
        const { name: mangaTitle } = req.params;

        const manga = await prisma.manga.findFirst({ where: { title: mangaTitle } });
        if (!manga) return res.status(404).json({ message: "Manga not found" });

        const chapter = await prisma.chapters.findFirst({
            where: { name: chapterName, mangaId: manga.id }
        });

        if (!chapter) return res.status(404).json({ message: "Chapter not found" });

        const removedFiles = chapter.files.split(',').filter(file => !files.includes(file));
        if (removedFiles.length > 0) await deleteFilesFromGCS(removedFiles);

        const updatedChapter = await prisma.chapters.update({
            where: { id: chapter.id },
            data: { name, files }
        });

        res.status(200).json(updatedChapter);
    } catch (error) {
        res.status(500).json({ message: `Failed to update chapter: ${error.message}` });
    }
};

/**
 * @route DELETE /manga/:name/remove/:chapterName

 * @desc Deleting a chapter and all related files from Google Cloud Storage.
 * @access Private
 * 
 * / */
 const removeChapter = async (req, res) => {
    try {
        const { chapterName, name } = req.params;

        const manga = await prisma.manga.findFirst({ where: { title: name } });
        if (!manga) return res.status(404).json({ message: "Manga not found" });

        const chapter = await prisma.chapters.findFirst({
            where: { name: chapterName, mangaId: manga.id }
        });
        if (!chapter) return res.status(404).json({ message: "Chapter not found" });

        const translatedChapters = await prisma.chaptersTranslate.findMany({
            where: { chapterId: chapter.id }
        });

        const filesToDelete = [
            ...chapter.files.split(','),
            ...translatedChapters.flatMap(tc => tc.files.split(','))
        ];

        await deleteFilesFromGCS(filesToDelete);

        await prisma.chaptersTranslate.deleteMany({ where: { chapterId: chapter.id } });
        await prisma.chapters.delete({ where: { id: chapter.id } });

        res.status(204).json({ id: chapter.id, message: "Chapter and all related files deleted" });
    } catch (error) {
        res.status(500).json({ message: `Failed to delete chapter: ${error.message}` });
    }
};

module.exports = {
    getChapterByName,
    addChapter,
    editChapter,
    removeChapter
};