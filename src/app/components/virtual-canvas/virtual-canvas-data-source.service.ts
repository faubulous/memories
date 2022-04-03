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

    async loadItem(id: number) {
        if(!this.data[id]?.image) {
            await this._dataSource.loadRange({ start: id, end: id + 1 });
        }

        return this.data[id];
    }

    async selectItem(id: number) {
        const x = await this.loadItem(id);

        console.debug("selectItem", x);

        this.selectedItems = [id];
        this.selectionChanged.next(this.selectedItems);
    }

    subscribe(observer?: any): Subscription {
        return this._dataSource.data$.subscribe(observer);
    }
}