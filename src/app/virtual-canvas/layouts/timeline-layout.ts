import { ListRange } from "@angular/cdk/collections";
import { Point, Rectangle } from "@mathigon/euclid";
import { VirtualCanvasLayouterBase } from "../virtual-canvas-layouter-base";
import { VirtualCanvasDataSource } from "../virtual-canvas.data-source";
import * as moment from "moment";
import { NgZone } from "@angular/core";

class LayoutRegion extends Rectangle {
    range?: ListRange;

    date: Date;

    constructor(date: Date, p: Point, width?: number, height?: number) {
        super(p, width, height);

        this.date = date;
    }
}

export class TimelineLayout extends VirtualCanvasLayouterBase {
    private padding:
        {
            top: number,
            left: number | 'auto',
            right: number | 'auto',
            bottom: number
        } = {
            top: 10 * window.devicePixelRatio,
            left: 'auto',
            right: 'auto',
            bottom: 10 * window.devicePixelRatio
        };

    private headerHeight = 50 * window.devicePixelRatio;

    private spacing = 4 * window.devicePixelRatio;

    private tileWidth = 200 * window.devicePixelRatio;

    private tileHeight = 200 * window.devicePixelRatio;

    private regions: Array<LayoutRegion> = [];

    constructor(ngZone: NgZone, ctx: CanvasRenderingContext2D, dataSource: VirtualCanvasDataSource) {
        super(ngZone, ctx, dataSource);
    }

    private getVisibleColumnCount() {
        const w = this.tileWidth + this.spacing;

        return w > 0 ? Math.floor(this.ctx.canvas.width / w) : 0;
    }

    private getX0() {
        if (this.padding.left == 'auto') {
            const visibleColumns = this.getVisibleColumnCount();
            const totalTileWidth = this.tileWidth + this.spacing;

            return (this.ctx.canvas.width - visibleColumns * totalTileWidth) / 2;
        } else {
            return this.padding.left;
        }
    }

    private getY0(scrollOffset: number) {
        const h = this.tileHeight + this.spacing;

        return h > 0 ? this.padding.top - scrollOffset % h : 0;
    }

    private getRange(regions: LayoutRegion[]): ListRange | undefined {
        const ranges = regions.filter(r => r.range).map(r => r.range as ListRange);

        if (ranges.length) {
            const n = this.getVisibleColumnCount();

            const start = Math.max(0, ranges[0].start - 2 * n);
            const end = Math.min(ranges[ranges.length - 1].end + 2 * n, this.dataSource.length - 1);

            return { start, end };
        } else {
            return undefined;
        }
    }

    private formatDate(date: Date): string {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const day = date.getUTCDay();

        return `${year}-${month}-${day}`;
    }

    private createHeader(position: Point, date: Date) {
        const w = this.getVisibleColumnCount() * (this.tileWidth + this.spacing);
        const h = this.headerHeight;

        const section = new LayoutRegion(date, position, w, h);

        this.regions.push(section);

        return section;
    }

    private createRow(position: Point, date: Date, n: number) {
        const w = this.getVisibleColumnCount() * (this.tileWidth + this.spacing);
        const h = this.tileHeight;

        const section = new LayoutRegion(date, position, w, h);
        section.range = { start: n, end: n };

        this.regions.push(section);

        return section;
    }

    getScrollHeight(): number {
        const x0 = this.getX0();
        const y0 = this.getY0(0);

        let x = x0;
        let y = y0;

        let date = '';
        let row: LayoutRegion;

        this.regions = [];

        this.dataSource.data$.value.forEach((thumbnail, n) => {
            if (!thumbnail) {
                return;
            }

            let d = this.formatDate(thumbnail.dateModified);

            if (date == '') {
                date = d;
            }

            if (date != d) {
                date = d;

                y += this.spacing;

                this.createHeader(new Point(x0, y), thumbnail.dateModified);

                y += this.headerHeight + this.spacing;

                row = this.createRow(new Point(x0, y), thumbnail.dateModified, n);

                x = x0;
                y += this.tileHeight + this.spacing;
            }

            if (x + this.tileHeight + this.spacing > this.viewport.w) {
                y += this.spacing;

                row = this.createRow(new Point(x0, y), thumbnail.dateModified, n);

                x = x0;
                y += this.tileHeight + this.spacing;
            } else if (row?.range) {
                row.range.end = n;
            }

            x += this.tileWidth + this.spacing;
        });

        return y + this.padding.bottom - this.viewport.h / window.devicePixelRatio;
    }

    draw(): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        const regions = this.regions.filter(s => this.viewport.collision(s));
        const range = this.getRange(regions);

        if (range) {
            this.dataSource.loadRange(range);
        }

        regions.forEach(s => {
            let p = s.p.subtract(this.viewport.p);

            // Uncomment to debug the layout regions.
            // this.ctx.strokeStyle = '#f00';
            // this.ctx.strokeRect(p.x, p.y, s.w, s.h);

            if (s.range) {
                let x = p.x;
                let y = p.y;
                let n = s.range.start;

                do {
                    let item = this.dataSource.data$.value[n];

                    if (item?.image) {
                        this.ctx.drawImage(item.image, x, y, this.tileWidth, this.tileHeight);
                    } else {
                        this.ctx.fillStyle = '#eee';
                        this.ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
                    }

                    x += this.tileWidth + this.spacing;
                    n += 1;
                }
                while (n <= s.range.end);
            } else {
                this.ctx.font = `500 ${16 * window.devicePixelRatio}px Inter`;
                this.ctx.fillStyle = '#000';
                this.ctx.fillText(moment(s.date).format("dddd, Do MMMM"), p.x, p.y + s.h - 12 * window.devicePixelRatio);
            }
        })
    }
}