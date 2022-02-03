import { ListRange } from "@angular/cdk/collections";
import { Point, Rectangle } from "@mathigon/euclid";
import { Stopwatch } from "src/shared/stopwatch";
import { VirtualCanvasLayouterBase } from "../virtual-canvas-layouter-base";
import { VirtualCanvasDataSource } from "../virtual-canvas.data-source";

class LayoutRegion extends Rectangle {
    range: ListRange = { start: 0, end: 0 };

    constructor(p: Point, width?: number, height?: number) {
        super(p, width, height);
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
            top: 40 * window.devicePixelRatio,
            left: 'auto',
            right: 'auto',
            bottom: 40 * window.devicePixelRatio
        };

    private headerHeight = 40 * window.devicePixelRatio;

    private spacing = 4 * window.devicePixelRatio;

    private tileWidth = 200 * window.devicePixelRatio;

    private tileHeight = 200 * window.devicePixelRatio;

    private regions: Array<LayoutRegion> = [];

    private dateFormatter = new Intl.DateTimeFormat(Intl.DateTimeFormat().resolvedOptions().locale);

    constructor(ctx: CanvasRenderingContext2D, dataSource: VirtualCanvasDataSource) {
        super(ctx, dataSource);
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

    private formatDate(date: Date): string {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const day = date.getUTCDay();

        return `${year}-${month}-${day}`;
    }

    private createHeader(position: Point) {
        const w = this.getVisibleColumnCount() * (this.tileWidth + this.spacing);
        const h = this.headerHeight;

        const section = new LayoutRegion(position, w, h);

        this.regions.push(section);

        return section;
    }

    private createRow(position: Point, n: number) {
        const w = this.getVisibleColumnCount() * (this.tileWidth + this.spacing);
        const h = this.tileHeight + this.spacing;

        const section = new LayoutRegion(position, w, h);
        section.range.start = n;

        this.regions.push(section);

        return section;
    }

    getScrollHeight(): number {
        const stopwatch = new Stopwatch();
        stopwatch.start();

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

                this.createHeader(new Point(x0, y));

                y += this.headerHeight + this.spacing;

                row = this.createRow(new Point(x0, y), n);

                x = x0;
                y += this.tileHeight + this.spacing;
            }

            if (row) {
                row.range.end = n;
            }

            if (x + this.tileHeight + this.spacing > this.viewport.w) {
                y += this.spacing;

                row = this.createRow(new Point(x0, y), n);

                x = x0;
                y += this.tileHeight + this.spacing;
            }

            x += this.tileWidth + this.spacing;
        });

        stopwatch.stop();

        return y + this.padding.bottom - this.viewport.h / window.devicePixelRatio;
    }

    draw(): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        const regions = this.regions.filter(s => this.viewport.collision(s));

        regions.forEach(s => {
            let p = s.p.subtract(this.viewport.p);

            this.ctx.strokeStyle = '#f00';
            this.ctx.strokeRect(p.x, p.y, s.w, s.h);
        })
    }
}