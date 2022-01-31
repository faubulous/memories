import { BehaviorSubject, debounceTime, distinctUntilChanged } from "rxjs";
import { GetFilesRequest, GetFilesResponse, InitFilesRequest, InitFilesResponse } from "../../electron/IPC/DatabaseChannel";
import { IpcService } from "../../shared/IpcService";

export interface Thumbnail {
  id?: number;

  type?: string;

  image?: HTMLImageElement;

  dateModified: Date;
}

export interface ListRange {
  start: number;

  end: number;
}

export class VirtualTimelineDataSource<T> {
  length = 0;

  private _dataCache = new Array<Thumbnail>(this.length);

  readonly data$ = new BehaviorSubject<(Thumbnail | undefined)[]>(this._dataCache);

  private readonly _pageSize = 10;

  private readonly _loadRange$ = new BehaviorSubject<ListRange>({ start: 0, end: 0 });

  private readonly _loadedPages = new Set<number>();

  private readonly _ipc = new IpcService();

  constructor() {
  }

  async init() {
    const result = await new IpcService().send<InitFilesResponse>(new InitFilesRequest());

    this.length = result.data.length;
    this._dataCache = [...result.data];

    this.data$.next(this._dataCache);

    this._loadRange$.pipe(
      debounceTime(10),
      distinctUntilChanged((a, b) => a.start === b.start && a.end == b.end)
    ).subscribe(async (range) => {
      for (let n = range.start; n <= range.end; n++) {
        await this._loadPage(n);
      }
    });

    if (this.length > 0) {
      await this._loadPage(0);
    }
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
      if(f.thumbnail) {
        let image = new Image();

        image.onload = () => {
          thumbnails.splice(m, 1, {
            id: f.id,
            type: f.type,
            dateModified: f.dateModified,
            image: image,
          });

          if(thumbnails.length == result.files.length) {
            this._dataCache.splice(skip, take, ...thumbnails);

            this.data$.next(this._dataCache);
          }
        }

        image.src = f.thumbnail;
      } else {
        thumbnails.splice(m, 1, {
          id: f.id,
          type: f.type,
          image: null
        });

        if(thumbnails.length == result.files.length) {
          this._dataCache.splice(skip, take, ...thumbnails);

          this.data$.next(this._dataCache);
        }
      }
    })
  }
}