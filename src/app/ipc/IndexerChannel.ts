import { IpcMainEvent } from 'electron';
import { IpcRequest } from "./IpcRequest";
import { IpcChannelInterface } from "./IpcChannelInterface";
import { Stopwatch } from "../../shared/stopwatch";
import { FileIndexer } from '../../indexer/file-indexer';

export class IndexerChannel implements IpcChannelInterface {
  readonly indexer = new FileIndexer();

  getName(): string {
    return 'index';
  }

  handle(event: IpcMainEvent, request: IpcRequest): void {
    var stopwatch = new Stopwatch();
    stopwatch.start();

    if (request.id == 'indexFiles') {
      this.indexer.start$().then(n => {
        stopwatch.stop();
        console.debug("indexFiles", stopwatch.timeElapsed);

        event.sender.send(request.responseChannel, {
          fileCount: n
        });
      })
    }
  }
}

export class IndexFilesRequest extends IpcRequest {
  constructor() {
    super('index', 'indexFiles');
  }
}

export interface IndexFilesResponse {
  fileCount: number;
}