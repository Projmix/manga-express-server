const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth');
const mangaController = require('../controllers/manga');
const chapterController = require('../controllers/chapter');
const translationController = require('../controllers/translation');

// Manga routes
router.get('/', auth, mangaController.getAllManga);
router.get('/:name', auth, mangaController.getMangaByName);
router.post('/add', auth, mangaController.addManga);
router.put('/edit/:name', auth, mangaController.editManga);
router.delete('/remove/:name', auth, mangaController.removeManga);

// Chapter routes
router.get('/:name/:chapterName', auth, chapterController.getChapterByName);
router.post('/:name/add', auth, chapterController.addChapter);
router.put('/:name/edit/:chapterName', auth, chapterController.editChapter);
router.delete('/:name/remove/:chapterName', auth, chapterController.removeChapter);

// Translation routes
router.get('/:mangaName/:chapterName/translate', auth, translationController.getTranslatedChapter);
router.post('/:mangaName/:chapterName/translate/add', auth, translationController.addTranslatedChapter);

module.exports = router;
