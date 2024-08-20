const { prisma } = require("../prisma/prisma-client");


 /**
 * @route GET /manga/:mangaName/:chapterName/translate

 * @desc Retrieve the translated chapter
 * @access Private
 * 
 * / */
const getTranslatedChapter = async (req, res) => {
    try {
        const { mangaName, chapterName } = req.params;

        const manga = await prisma.manga.findFirst({ where: { title: mangaName } });
        if (!manga) return res.status(404).json({ message: "Manga not found" });

        const chapter = await prisma.chapters.findFirst({
            where: { name: chapterName, mangaId: manga.id }
        });

        if (!chapter) return res.status(404).json({ message: "Chapter not found" });

        const translatedChapters = await prisma.chaptersTranslate.findMany({
            where: { chapterId: chapter.id }
        });

        res.status(200).json(translatedChapters);
    } catch (error) {
        res.status(500).json({ message: `Failed to retrieve translation: ${error.message}` });
    }
};


  
/**
 * @route POST /manga/:mangaName/:chapterName/translate/add

 * @desc Saving the translated chapter
 * @access Private
 * 
 * / */
const addTranslatedChapter = async (req, res) => {
    try {
        const { name, files, chapterId } = req.body;

        if (!name || !files || !chapterId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const translatedChapter = await prisma.chaptersTranslate.create({
            data: { name, files, chapterId }
        });

        res.status(201).json(translatedChapter);
    } catch (error) {
        res.status(500).json({ message: `Failed to add translated chapter: ${error.message}` });
    }
};

module.exports = {
    getTranslatedChapter,
    addTranslatedChapter
};