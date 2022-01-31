/*
  Warnings:

  - You are about to drop the column `dateModified` on the `File` table. All the data in the column will be lost.
  - Added the required column `day` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "thumbnail" TEXT
);
INSERT INTO "new_File" ("id", "path", "thumbnail", "type") SELECT "id", "path", "thumbnail", "type" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
