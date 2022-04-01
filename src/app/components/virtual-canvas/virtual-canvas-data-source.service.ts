import { ListRange } from "@angular/cdk/collections";
import { Injectable } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { Thumbnail, VirtualCanvasDataSource } from "./virtual-canvas.data-source";

@Injectable({ providedIn: 'root' })
export class VirtualCanvasDataSourceService {
    private readonly _dataSource = new VirtualCanvasDataSource();

    private _initialized = false;

    private _selectedItems: number[] = [];

    get selectedItems(): number[] {
        return this._selectedItems;
    }

    private set selectedItems(ids: number[]) {
        this._selectedItems = ids;
    }

    readonly selectionChanged = new Subject<number[]>();

    get data(): Array<Thumbnail> {
        return this._dataSource.data$.value;
    }

    async init() {
        if (!this._initialized) {
            this._initialized = true;

            await this._dataSource.init();
        }
    }

    async loadRange(range: ListRange) {
        return await this._dataSource.loadRange(range);
    }

    selectItem(id: number) {
        this.selectedItems = [id];
        this.selectionChanged.next(this.selectedItems);
    }

    subscribe(observer?: any): Subscription {
        return this._dataSource.data$.subscribe(observer);
    }
}