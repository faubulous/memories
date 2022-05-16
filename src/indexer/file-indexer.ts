import * as fs from 'fs';
import * as sharp from 'sharp';
import { PrismaClient } from "@prisma/client";
import { Stopwatch, SettingsFactory } from '../shared';

// TODO
// - Track indexing progress (requires file counting)
// - Actually index something

export class FileIndexer {
  private readonly _fileTypes = /(jpg|jpeg)$/;

  private readonly _prisma = new PrismaClient();

  constructor() { }

  private async _index$(directory: string) {
    try {
      let n = 0;
      let entries = fs.readdirSync(directory).map(e => [directory, e].join('/'));

      for (let i = 0; i < entries.length; i++) {
        let path = entries[i];
        let stats = fs.statSync(path);

        if (stats.isDirectory()) {
          const m = await this._index$(path);

          n += m;

          console.info(path, m);
        } else if (entries[i].toLowerCase().match(this._fileTypes) != null) {
          const indexed = !!(await this._prisma.file.count({
            where: {
              path: path
            }
          }));

          if(!indexed && path.indexOf("Camera") > 0) {
            console.warn(indexed, path);
          }

          if (!indexed) {
            // For 'Premature end of JPEG' error handling see: https://github.com/lovell/sharp/issues/1859
            await sharp(path, { failOnError: false })
              .resize(300, 300)
              .jpeg()
              .toBuffer()
              .then(async (buffer) => {
                const thumbnail = 'data:image/jpeg;base64,' + buffer.toString('base64');

                await this._prisma.file.create({
                  data: {
                    path: path,
                    type: "Picture",
                    dateIndexed: new Date().toISOString(),
                    dateModified: stats.mtime.toISOString(),
                    thumbnail: thumbnail
                  }
                });

                n += 1;
              }, (error) => {
                console.error(error);
              })
          }
        }
      }

      return n;
    } catch (error) {
      console.error(error);

      return 0;
    }
  }

  async start$(): Promise<number> {
    const settings = await new SettingsFactory().getApplicationSettings();

    let n = 0;

    for (let directory of settings.indexer.includedPaths) {
      n += await this._index$(directory);
    }

    return n;
  }
}

const version = "1.0.0";
const indexer = new FileIndexer();

console.log(`Memories Indexer v ${version}`);

const stopwatch = new Stopwatch();
stopwatch.start();

console.log(`Started at ${stopwatch.startTime.toLocaleString()}`);

indexer.start$().then((count) => {
  stopwatch.stop();

  const finishTime = stopwatch.timeElapsed.toLocaleString();
  const elapsedSeconds = Math.round(stopwatch.timeElapsed / 1000);

  console.log(`\nFinished at ${finishTime}; took ${elapsedSeconds}s `);
  console.log(`Indexed ${count} items.`);
}).catch(error => {
  console.error("Error:", error.message);
});