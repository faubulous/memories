import { ListRange } from "@angular/cdk/collections";
import { Injectable } from "@angular/core";
import { Subscription } from "rxjs";
import { Thumbnail, VirtualCanvasDataSource } from "./virtual-canvas.data-source";

@Injectable({ providedIn: 'root' })
export class VirtualCanvasDataSourceService {
    private readonly dataSource = new VirtualCanvasDataSource();

    private initialized = false;

    get data(): Array<Thumbnail | undefined> {
        return this.dataSource.data$.value;
    }

    async init() {
        if(!this.initialized) {
            this.initialized = true;
            
            await this.dataSource.init();
        }
    }

    async loadRange(range: ListRange) {
        return await this.dataSource.loadRange(range);
    }

    subscribe(observer?: any): Subscription {
        return this.dataSource.data$.subscribe(observer);
    }
}