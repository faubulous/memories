/*
  Warnings:

  - You are about to drop the column `day` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `File` table. All the data in the column will be lost.
  - Added the required column `dateModified` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dateModified" DATETIME NOT NULL,
    "thumbnail" TEXT
);
INSERT INTO "new_File" ("id", "path", "thumbnail", "type") SELECT "id", "path", "thumbnail", "type" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");
CREATE INDEX "dateModified" ON "File"("dateModified");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
