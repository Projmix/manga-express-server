-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Manga" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "genres" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Manga_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "files" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chapters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "files" TEXT NOT NULL,
    "mangaId" TEXT NOT NULL,
    CONSTRAINT "Chapters_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChaptersTranslate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "files" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    CONSTRAINT "ChaptersTranslate_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapters" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
