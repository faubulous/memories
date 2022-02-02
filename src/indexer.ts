import * as fs from 'fs';
import * as sharp from 'sharp';
import { PrismaClient } from "@prisma/client";
import { Stopwatch } from './shared/stopwatch';

// TODO
// - Track indexing progress (requires file counting)
// - Actually index something

class MemoriesIndexer {
  private readonly _fileTypes = /(jpg|jpeg)$/;

  private readonly _prisma = new PrismaClient();

  private async _index$(directory: string) {
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
        n += 1;

        // For 'Premature end of JPEG' error handling see: https://github.com/lovell/sharp/issues/1859
        await sharp(path, { failOnError: false }).resize(300, 300).jpeg().toBuffer().then(async (buffer, error) => {
          const thumbnail = error ? '' : 'data:image/jpeg;base64,' + buffer.toString('base64');

          await this._prisma.file.create({
            data: {
              path: path,
              type: "Picture",
              dateModified: stats.mtime.toISOString(),
              thumbnail: thumbnail
            }
          });
        })
      }
    }

    return n;
  }

  async index$(path: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let n = this._index$(path);

      resolve(n);
    });
  }
}

const version = "1.0.0";
const stopwatch = new Stopwatch();
stopwatch.start();

console.log(`Memories Indexer v ${version}`)
console.log(`Started at ${stopwatch.startTime.toLocaleString()}`);

new MemoriesIndexer().index$("/home/faubulous/Photos").then((count) => {
  stopwatch.stop();

  console.log(`\nFinished at ${stopwatch.timeElapsed.toLocaleString()}; took ${Math.round(stopwatch.timeElapsed / 1000)}s `);
  console.log(`Indexed ${count} items.`);
}).catch(error => {
  console.error("Error:", error.message);
});