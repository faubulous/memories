import { Prisma, PrismaClient, File } from '@prisma/client';
import { IpcMainEvent } from 'electron';
import { IpcRequest } from "./IpcRequest";
import { IpcChannelInterface } from "./IpcChannelInterface";
import { Thumbnail } from "../components/virtual-canvas/virtual-canvas.data-source";
import { Stopwatch } from "../../shared/stopwatch";

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
        console.debug("initFiles", stopwatch.timeElapsed);

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
        console.debug("getFiles", request.params.skip, stopwatch.timeElapsed);

        event.sender.send(request.responseChannel, {
          offset: request.params.skip,
          count: files.length,
          files: files
        });
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