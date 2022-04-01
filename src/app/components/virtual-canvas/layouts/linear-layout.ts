import Konva from "konva";
import { Stage } from "konva/lib/Stage";
import { Point, Rectangle } from "@mathigon/euclid";
import { Router } from "@angular/router";
import { ListRange } from "@angular/cdk/collections";
import { VirtualCanvasLayouterBase } from "../virtual-canvas-layouter-base";
import { VirtualCanvasDataSourceService } from "../virtual-canvas-data-source.service";

export class LinearLayout extends VirtualCanvasLayouterBase {
    private padding:
        {
            top: number,
            left: number,
            right: number,
            bottom: number
        } = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };

    private spacing = 4;

    private strokeWidth = 4;

    private tileWidth = 68 - 2 * this.strokeWidth;

    private tileHeight = 68 - 2 * this.strokeWidth;

    private thumbnails: Array<Konva.Image> = [];

    constructor(router: Router, stage: Stage, dataSource: VirtualCanvasDataSourceService) {
        super(router, stage, dataSource);

        for (let i = 0; i < 80; i++) {
            const tile = new Konva.Image({
                listening: false,
                visible: false,
                fill: '#eee',
                width: this.tileWidth,
                height: this.tileHeight,
                image: undefined,
                selected: false
            });

            tile.on('pointerclick', (e) => {
                const id = Number(tile.id());

                this.dataSource.selectItem(id);

                this.draw();
            });

            tile.on('mouseenter', () => {
                this.stage.container().style.cursor = 'pointer';
            });

            tile.on('mouseleave', () => {
                this.stage.container().style.cursor = 'default';
            });

            this.thumbnails.push(tile);
            this.layer.add(tile);
        }
    }

    getScrollOffsetForId(id: number): number {
        const n = this.dataSource.data.findIndex(t => t && t.id === id);

        if (n > 0) {
            return this.padding.left + (this.tileWidth + this.spacing) * n;
        } else {
            return 0;
        }
    }

    private getRange(scrollOffset: number): ListRange | undefined {
        const start = Math.floor(scrollOffset / (this.tileWidth + this.spacing));
        const end = start + Math.ceil(this.viewport.w / (this.tileWidth + this.spacing));

        return { start, end: Math.min(end, this.dataSource.data.length - 1) };
    }

    private getX0(scrollOffset: number) {
        const w = this.tileWidth + this.spacing;

        return w > 0 ? this.padding.left + this.strokeWidth - (scrollOffset % w) : 0;
    }

    private getY0(scrollOffset: number) {
        return this.padding.top + this.strokeWidth;
    }

    layout(): Rectangle {
        const x0 = this.getX0(0);
        const y0 = this.getY0(0);

        let x = x0 + this.dataSource.data.length * (this.tileWidth + this.spacing) + this.padding.right;
        let y = y0 + this.tileHeight + this.padding.bottom;

        return new Rectangle(new Point(), x, y);
    }

    draw(): void {
        if (!this.thumbnails) {
            return;
        }

        const range = this.getRange(this.viewport.p.x);

        if (range) {
            this.dataSource.loadRange(range);
        } else {
            return;
        }

        this.thumbnails.forEach(tile => {
            tile.listening(false);
            tile.hide();
            tile.setPosition({ x: 0, y: 0 });
            tile.strokeEnabled(false);
        });

        let x = this.getX0(this.viewport.p.x);
        let y = this.getY0(this.viewport.p.y);
        let n = range ? range.start : 0;
        let i = 0;

        while (n <= range.end) {
            let item = this.dataSource.data[n];

            const tile = this.thumbnails[i];
            tile.id(n.toString());
            tile.listening(true);
            tile.setPosition({ x, y });
            tile.image(item?.image);

            if(this.dataSource.selectedItems.indexOf(n) > -1) {
                tile.strokeEnabled(true);
                tile.stroke("#ff0000");
                tile.strokeWidth(this.strokeWidth);
            }

            tile.show();

            x += this.tileWidth + this.spacing;
            n += 1;
            i += 1;
        }

        this.layer.batchDraw();
    }
}