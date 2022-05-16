-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "dateIndexed" TEXT NOT NULL,
    "dateModified" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "thumbnail" TEXT
);
INSERT INTO "new_File" ("dateIndexed", "dateModified", "id", "path", "thumbnail", "type") SELECT "dateIndexed", "dateModified", "id", "path", "thumbnail", "type" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");
CREATE INDEX "path" ON "File"("path");
CREATE INDEX "dateModified" ON "File"("dateModified");
CREATE TABLE "new_Folder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "dateIndexed" TEXT NOT NULL,
    "dateModified" TEXT NOT NULL,
    "fileCount" INTEGER NOT NULL
);
INSERT INTO "new_Folder" ("dateIndexed", "dateModified", "fileCount", "id", "path") SELECT "dateIndexed", "dateModified", "fileCount", "id", "path" FROM "Folder";
DROP TABLE "Folder";
ALTER TABLE "new_Folder" RENAME TO "Folder";
CREATE UNIQUE INDEX "Folder_path_key" ON "Folder"("path");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
