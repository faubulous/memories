import * as moment from "moment";
import Konva from "konva";
import { Stage } from "konva/lib/Stage";
import { Router } from "@angular/router";
import { ListRange } from "@angular/cdk/collections";
import { Point, Rectangle } from "@mathigon/euclid";
import { VirtualCanvasLayoutRegion } from "../virtual-canvas-layout-region";
import { VirtualCanvasLayouterBase } from "../virtual-canvas-layouter-base";
import { VirtualCanvasDataSourceService } from "../virtual-canvas-data-source.service";

export class TimelineLayout extends VirtualCanvasLayouterBase {
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
            bottom: 10
        };

    private headerHeight = 50;

    private spacing = 4;

    private tileWidth = 200;

    private tileHeight = 200;

    private regions: Array<VirtualCanvasLayoutRegion> = [];

    private title: Konva.Text = new Konva.Text({
        listening: false,
        fontSize: 26,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        fill: '#000'
    });

    private titleBackground = new Konva.Rect({
        listening: false,
        height: 50,
        fill: 'rgba(255,255,255,.98)'
    })

    private headers: Array<Konva.Text> = [];

    private thumbnails: Array<Konva.Image> = [];

    constructor(router: Router, stage: Stage, dataSource: VirtualCanvasDataSourceService) {
        super(router, stage, dataSource);

        for (let i = 0; i < 80; i++) {
            const t = new Konva.Image({
                listening: false,
                visible: false,
                fill: '#eee',
                width: this.tileWidth,
                height: this.tileHeight,
                image: undefined
            });

            t.on('pointerclick', (e) => {
                const id = Number(t.id());

                this.dataSource.selectItem(id);
            });

            t.on('mouseenter', () => {
                this.stage.container().style.cursor = 'pointer';
            });

            t.on('mouseleave', () => {
                this.stage.container().style.cursor = 'default';
            });

            this.thumbnails.push(t);
            this.layer.add(t);
        }

        for (let i = 0; i < 20; i++) {
            const h = new Konva.Text({
                listening: false,
                visible: false,
                fill: '#000',
                fontSize: 16,
                fontFamily: 'Inter',
                fontWeight: 500
            })

            this.headers.push(h);
            this.layer.add(h);
        }

        this.layer.add(this.titleBackground);
        this.layer.add(this.title);
    }

    getScrollOffsetForId(id: number): number {
        const n = this.dataSource.data.findIndex(t => t && t.id === id);

        if (n > 0) {
            const i = this.regions.findIndex(r => r.containsItem(n));

            // Return scroll offset the associated header..
            return i > -1 ? this.regions[i].p.y - this.padding.top - this.headerHeight : 0;
        } else {
            return 0;
        }
    }

    private getVisibleColumnCount() {
        const w = this.tileWidth + this.spacing;

        return w > 0 ? Math.floor(this.viewport.w / w) : 0;
    }

    private getX0() {
        if (this.padding.left == 'auto') {
            const visibleColumns = this.getVisibleColumnCount();
            const totalTileWidth = this.tileWidth + this.spacing;

            return (this.viewport.w - visibleColumns * totalTileWidth) / 2;
        } else {
            return this.padding.left;
        }
    }

    private getY0(scrollOffset: number) {
        const h = this.tileHeight + this.spacing;

        return h > 0 ? this.padding.top - scrollOffset % h : 0;
    }

    private getRange(regions: VirtualCanvasLayoutRegion[]): ListRange | undefined {
        if (regions) {
            const ranges = regions.filter(r => r.range).map(r => r.range as ListRange);
            const n = this.getVisibleColumnCount();

            const start = Math.max(0, ranges[0]?.start - 6 * n);
            const end = ranges[ranges.length - 1]?.end + 6 * n;

            return { start, end: Math.min(end, this.dataSource.data.length - 1) };
        } else {
            return undefined;
        }
    }

    private formatDate(value: Date): string {
        const year = value.getUTCFullYear();
        const month = value.getUTCMonth();
        const day = value.getUTCDay();

        return `${year}-${month}-${day}`;
    }

    private createHeader(position: Point, date: Date) {
        const w = this.getVisibleColumnCount() * (this.tileWidth + this.spacing);
        const h = this.headerHeight;

        const section = new VirtualCanvasLayoutRegion(date, position, w, h);

        this.regions.push(section);

        return section;
    }

    private createRow(position: Point, date: Date, n: number) {
        const w = this.getVisibleColumnCount() * (this.tileWidth + this.spacing);
        const h = this.tileHeight;

        const section = new VirtualCanvasLayoutRegion(date, position, w, h);
        section.range = { start: n, end: n };

        this.regions.push(section);

        return section;
    }

    layout(): Rectangle {
        const x0 = this.getX0();
        const y0 = this.getY0(0);

        let x = x0;
        let y = y0;

        let date = '';
        let row: VirtualCanvasLayoutRegion;

        this.regions = [];

        this.dataSource.data.forEach((thumbnail, n) => {
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
                y += this.tileHeight;
            }

            if (x + this.tileWidth + this.spacing > this.viewport.w) {
                y += this.spacing;

                row = this.createRow(new Point(x0, y), thumbnail.dateModified, n);

                x = x0;
                y += this.tileHeight;
            } else if (row?.range) {
                row.range.end = n;
            }

            x += this.tileWidth + this.spacing;
        });

        const w = this.viewport.w;
        const h = y + this.padding.bottom - this.viewport.h;

        return new Rectangle(new Point(), w, h);
    }

    draw(): void {
        if (!this.regions || !this.thumbnails) {
            return;
        }

        const regions = this.regions.filter(s => this.viewport.collision(s));
        const range = this.getRange(regions);

        if (range) {
            this.dataSource.loadRange(range);
        }

        this.headers.forEach(h => {
            h.hide();
            h.setPosition({ x: 0, y: 0 });
        });

        this.thumbnails.forEach(t => {
            t.listening(false);
            t.hide();
            t.setPosition({ x: 0, y: 0 });
        });

        let i = 0;
        let j = 0;

        regions.forEach(s => {
            let p = s.p.subtract(this.viewport.p);

            if (s.range) {
                let x = p.x;
                let y = p.y;
                let n = s.range.start;

                do {
                    let item = this.dataSource.data[n];

                    let tile = this.thumbnails[i];
                    tile.id(n.toString());
                    tile.setPosition({ x, y });
                    tile.image(item?.image);
                    tile.listening(true);
                    tile.show();

                    x += this.tileWidth + this.spacing;
                    n += 1;
                    i += 1;
                }
                while (n <= s.range.end);
            }
            else {
                let header = this.headers[j];
                header.show();
                header.setPosition({ x: p.x, y: p.y + 20 });
                header.text(moment(s.date).format("dddd, Do MMMM"));

                j += 1;
            }
        });

        if (regions.length) {
            const x0 = this.getX0();

            this.titleBackground.size({
                width: this.viewport.w,
                height: 50
            })

            this.title.setPosition({ x: x0, y: 12 });
            this.title.text(moment(regions[0].date).format("YYYY"));
        }

        this.layer.batchDraw();
    }
}