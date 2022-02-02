import { ListRange } from "@angular/cdk/collections";
import { VirtualCanvasLayouterBase } from "../virtual-canvas-layouter-base";
import { VirtualCanvasDataSource } from "../virtual-canvas.data-source";

export class GridLayout extends VirtualCanvasLayouterBase {
    private padding:
        {
            top: number,
            left: number | 'auto',
            right: number | 'auto',
            bottom: number
        } = {
            top: 40,
            left: 'auto',
            right: 'auto',
            bottom: 40
        };

    private tileSpacing = 8;

    private tileWidth = 400;

    private tileHeight = 400;

    constructor(ctx: CanvasRenderingContext2D, dataSource: VirtualCanvasDataSource) {
        super(ctx, dataSource);
    }

    private getTotalTileWidth() {
        return this.tileWidth + this.tileSpacing;
    }

    private getTotalTileHeight() {
        return this.tileHeight + this.tileSpacing;
    }

    private getVisibleColumnCount() {
        const w = this.getTotalTileWidth();

        return w > 0 ? Math.floor(this.ctx.canvas.width / w) : 0;
    }

    private getVisibleRowCount() {
        const h = this.getTotalTileHeight();

        return h > 0 ? Math.ceil(this.ctx.canvas.height / h) : 0;
    }

    private getVisibleRange(): ListRange {
        const totalTileHeight = this.getTotalTileHeight();
        const visibleColumns = this.getVisibleColumnCount();
        const visibleRows = this.getVisibleRowCount();

        const start = Math.floor(this.scrollOffset / totalTileHeight) * visibleColumns;
        const end = start + visibleColumns * (visibleRows + 2);

        return { start, end };
    }

    private getTotalRowCount() {
        const n = this.getVisibleColumnCount();

        return n > 0 ? Math.ceil(this.dataSource.length / n) : 0;
    }

    private getX0() {
        if (this.padding.left === 'auto') {
            const visibleColumns = this.getVisibleColumnCount();
            const totalTileWidth = this.getTotalTileWidth();

            return (this.ctx.canvas.width - visibleColumns * totalTileWidth) / 2;
        } else {
            return this.padding.left;
        }
    }

    private getY0() {
        const totalTileHeight = this.getTotalTileHeight();

        return this.padding.top - (this.scrollOffset % totalTileHeight);
    }

    getScrollHeight(): number {
        return this.getTotalRowCount() * this.getTotalTileHeight();
    }

    draw(): void {
        const canvasWidth = this.ctx.canvas.width;
        const canvasHeight = this.ctx.canvas.height;

        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const totalTileWidth = this.getTotalTileWidth();
        const totalTileHeight = this.getTotalTileHeight();

        const x0 = this.getX0();
        const y0 = this.getY0();

        let x = x0;
        let y = y0;

        const range = this.getVisibleRange();

        this.dataSource.loadRange(range);

        const start = range.start;
        const end = Math.min(range.end, this.dataSource.length);

        for (let n = start; n < end; n++) {
            const item = this.dataSource.data$.value[n];

            if (item?.image) {
                this.ctx.drawImage(item.image, x, y, this.tileWidth, this.tileHeight);
            } else {

                this.ctx.fillStyle = '#eee';
                this.ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
            }

            x += totalTileWidth;

            if (x + totalTileWidth > canvasWidth) {
                x = x0;
                y += totalTileHeight;
            }
        }
    }
}