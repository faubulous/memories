-- CreateTable
CREATE TABLE "File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dateModified" DATETIME NOT NULL,
    "thumbnail" BLOB
);

-- CreateIndex
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");
