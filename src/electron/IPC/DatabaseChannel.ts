import { IpcChannelInterface } from "./IpcChannelInterface";
import { IpcMainEvent } from 'electron';
import { IpcRequest } from "../../shared/IpcRequest";
import { Prisma, PrismaClient, File } from '@prisma/client'
import { Stopwatch } from "../../shared/stopwatch";
import { Thumbnail } from "../../app/components/virtual-canvas/virtual-canvas.data-source";

export class DatabaseChannel implements IpcChannelInterface {
  readonly db = new PrismaClient();

  getName(): string {
    return 'db';
  }

  handle(event: IpcMainEvent, request: IpcRequest): void {
    var stopwatch = new Stopwatch();
    stopwatch.start();

    if (request.id == 'initFiles') {
      let query = Prisma.sql`SELECT id, strftime("%Y-%m-%dT00:00:00", dateModified) date FROM File ORDER BY date DESC`;

      this.db.$queryRaw(query).then(result => {
        stopwatch.stop();
        console.warn("initFiles", stopwatch.timeElapsed);

        if (Array.isArray(result)) {
          event.sender.send(request.responseChannel, {
            data: result.map(x => ({ id: x.id, dateModified: new Date(x.date) }))
          });
        }
      })
    } else if (request.id == 'getFiles') {
      this.db.file.findMany({
        orderBy: {
          dateModified: 'desc'
        },
        skip: request.params.skip,
        take: request.params.take
      }).then(files => {
        stopwatch.stop();
        console.warn("getFiles", request.params.skip, stopwatch.timeElapsed);

        event.sender.send(request.responseChannel, {
          offset: request.params.skip,
          count: files.length,
          files: files
        });
      });
    } else if (request.id == 'getFileContext') {
      this.db.file.findFirst({ select: { id: true }, where: { path: request.params.file } }).then(f => {
        if (f) {
          this.db.file.findMany({
            where: {
              id: {
                gte: f.id - 10
              }
            },
            take: 20
          }).then(files => {
            event.sender.send(request.responseChannel, {
              count: files.length,
              files: files
            });
          })
        }
      });
    }
  }
}

export class InitFilesRequest extends IpcRequest {
  constructor() {
    super('db', 'initFiles');
  }
}

export interface InitFilesResponse {
  data: Thumbnail[];
}

export class GetFilesRequest extends IpcRequest {
  constructor(skip: number = 0, take: number = 20) {
    super('db', 'getFiles');

    this.params = {
      skip: skip,
      take: take
    }
  }
}

export interface GetFilesResponse {
  offset: number;
  count: number;
  files: File[];
}

export class GetFileContextRequest extends IpcRequest {
  constructor(file: string, take: number = 60) {
    super('db', 'getFileContext');

    this.params = {
      file: file,
      take: take
    }
  }
}
export interface GetFileContextResponse {
  count: number;
  files: File[];
}