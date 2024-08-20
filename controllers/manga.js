const { prisma } = require("../prisma/prisma-client");
const { deleteMangaAndRelatedFiles } = require('../utils/gcsUploader');

/**
* @route GET /api/manga/
* @desc Get all manga
* @access Private
*
* / */
const getAllManga = async (req, res) => {
    try {
        const manga = await prisma.manga.findMany();
        res.status(200).json(manga);
    } catch (error) {
        res.status(500).json({ message: `Failed to retrieve manga: ${error.message}` });
    }
};

/**
* @route GET /api/manga/:name
* @desc View a specific manga and chapter list
* @access Private
*
* / */
const getMangaByName = async (req, res) => {
    try {
        const { name } = req.params;
        const manga = await prisma.manga.findFirst({ where: { title: name } });
        if (!manga) return res.status(404).json({ message: "Manga not found" });

        const chapters = await prisma.chapters.findMany({ where: { mangaId: manga.id } });
        res.status(200).json({ ...manga, chapters });
    } catch (error) {
        res.status(500).json({ message: `Failed to retrieve manga: ${error.message}` });
    }
};

/**
* @route POST /api/manga/add
* @desc Create a manga
* @access Private
*
* / */
const addManga = async (req, res) => {
    try {
        const { title, image, description, genres } = req.body;
        if (!title || !image || !description || !genres) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const manga = await prisma.manga.create({
            data: {
                title,
                image,
                description,
                genres,
                userId: req.user.id
            }
        });
        res.status(201).json(manga);
    } catch (error) {
        res.status(500).json({ message: `Failed to create manga: ${error.message}` });
    }
};

/**
* @route PUT /api/manga/edit/:name
* @desc Edit a specific manga
* @access Private
*
* / */
const editManga = async (req, res) => {
    try {
        const { name } = req.params;
        const { title, description, genres, image } = req.body;

        const manga = await prisma.manga.findUnique({
            where: { title: name },
        });
        
        if (!manga) {
            return res.status(404).json({ message: `Manga with title '${name}' not found.` });
        }
        const updatedManga = await prisma.manga.update({
            where: { id: manga.id },
            data: { title, description, genres, image }
        });
        res.status(204).json(updatedManga);
    } catch (error) {
        res.status(500).json({ message: `Failed to update manga: ${error.message}` });
    }
};

/**
 * @route DELETE /api/manga/remove/:name
 * @desc Deleting manga and all related files from Google cloud storage.
 * @access Private
 * 
 * / */
const removeManga = async (req, res) => {
    try {
        const { name } = req.params;

        const manga = await prisma.manga.findFirst({
            where: { title: name },
            include: { createdChapters: true },
        });

        if (!manga) return res.status(404).json({ message: "Manga not found" });
        const chapters = await prisma.chapters.findMany({ where: { mangaId: manga.id } });

        await deleteMangaAndRelatedFiles(manga);

        await prisma.chaptersTranslate.deleteMany({ where: { chapterId: { in: chapters.map(chapter => chapter.id) } } });
        await prisma.chapters.deleteMany({ where: { mangaId: manga.id } });
        await prisma.manga.delete({ where: { id: manga.id } });

        res.status(204).json({ id: manga.id, message: "Manga and related files deleted" });
    } catch (error) {
        res.status(500).json({ message: `Failed to delete manga: ${error.message}` });
    }
};

module.exports = {
    getAllManga,
    getMangaByName,
    addManga,
    editManga,
    removeManga
};
