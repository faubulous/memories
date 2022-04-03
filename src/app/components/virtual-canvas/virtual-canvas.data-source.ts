import { ListRange } from "@angular/cdk/collections";
import { BehaviorSubject, debounceTime, distinctUntilChanged } from "rxjs";
import {
  IpcService,
  GetFilesRequest,
  GetFilesResponse,
  InitFilesRequest,
  InitFilesResponse
} from "../../ipc";

export interface Thumbnail {
  id?: number;

  type?: string;

  image?: HTMLImageElement;

  dateModified: Date;

  path: string;
}

export class VirtualCanvasDataSource {
  length = 0;

  private _dataCache = new Array<Thumbnail>(this.length);

  readonly data$ = new BehaviorSubject<(Thumbnail)[]>(this._dataCache);

  private readonly _pageSize = 20;

  private readonly _loadRange$ = new BehaviorSubject<ListRange>({ start: 0, end: 0 });

  private readonly _loadedPages = new Set<number>();

  private readonly _ipc = new IpcService();

  constructor() { }

  async init() {
    const result = await new IpcService().send<InitFilesResponse>(new InitFilesRequest());

    this.length = result.data.length;
    this._dataCache = [...result.data];

    this.data$.next(this._dataCache);

    if (this.length > 0) {
      await this._loadPage(0);
    }

    this._loadRange$.pipe(
      debounceTime(10),
      distinctUntilChanged((a, b) => a.start === b.start && a.end == b.end)
    ).subscribe(async (range) => {
      console.debug(range);
      
      for (let n = range.start; n <= range.end; n++) {
        console.debug(n);

        await this._loadPage(n);
      }
    });
  }

  private _getPageForIndex(index: number): number {
    return Math.floor(index / this._pageSize);
  }

  async loadRange(range: ListRange) {
    const start = this._getPageForIndex(range.start);
    const end = this._getPageForIndex(range.end);

    this._loadRange$.next({ start, end });
  }

  private async _loadPage(n: number) {
    if (this._loadedPages.has(n)) {
      return;
    }

    this._loadedPages.add(n);

    let skip = this._pageSize * n;
    let take = this._pageSize;

    const result = await this._ipc.send<GetFilesResponse>(new GetFilesRequest(skip, take));

    const thumbnails = new Array(result.files.length);

    result.files.forEach((f, m) => {
      if (f.thumbnail) {
        let image = new Image();
        image.src = f.thumbnail;
        image.onload = () => {
          thumbnails.splice(m, 1, {
            id: f.id,
            type: f.type,
            path: f.path,
            dateModified: f.dateModified,
            image: image
          });

          this._dataCache.splice(skip, take, ...thumbnails);

          this.data$.next(this._dataCache);
        }
      } else {
        thumbnails.splice(m, 1, {
          id: f.id,
          type: f.type,
          path: f.path,
          image: null
        });

        this._dataCache.splice(skip, take, ...thumbnails);

        this.data$.next(this._dataCache);
      }
    })
  }
}