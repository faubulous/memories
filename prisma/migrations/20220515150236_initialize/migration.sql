/*
  Warnings:

  - Added the required column `dateIndexed` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Folder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "dateIndexed" DATETIME NOT NULL,
    "dateModified" DATETIME NOT NULL,
    "fileCount" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "dateIndexed" DATETIME NOT NULL,
    "dateModified" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "thumbnail" TEXT
);
INSERT INTO "new_File" ("dateModified", "id", "path", "thumbnail", "type") SELECT "dateModified", "id", "path", "thumbnail", "type" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");
CREATE INDEX "path" ON "File"("path");
CREATE INDEX "dateModified" ON "File"("dateModified");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Folder_path_key" ON "Folder"("path");
