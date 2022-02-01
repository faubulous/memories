// import { VirtualTimelineLayout } from "../virtual-canvas-layouter";
// import { ListRange, VirtualCanvasDataSource } from "../virtual-canvas.data-source";

// export class TimelineLayout implements VirtualTimelineLayout {
//     private padding:
//         {
//             top: number,
//             left: number | 'auto',
//             right: number | 'auto',
//             bottom: number
//         } = {
//             top: 40,
//             left: 'auto',
//             right: 'auto',
//             bottom: 40
//         };

//     private tileSpacing = 8;

//     private tileWidth = 400;

//     private tileHeight = 400;

//     private scrollOffset: number = 0;

//     constructor(private ctx: CanvasRenderingContext2D, private dataSource: VirtualCanvasDataSource) { }

//     private getTotalTileWidth() {
//         return this.tileWidth + this.tileSpacing;
//     }

//     private getTotalTileHeight() {
//         return this.tileHeight + this.tileSpacing;
//     }

//     private getVisibleColumnCount() {
//         const w = this.getTotalTileWidth();

//         return this.ctx && w > 0 ? Math.floor(this.ctx.canvas.width / w) : 0;
//     }

//     private getVisibleRowCount() {
//         const h = this.getTotalTileHeight();

//         return this.ctx && h > 0 ? Math.ceil(this.ctx.canvas.height / h) : 0;
//     }

//     private getVisibleRange(): ListRange {
//         const totalTileHeight = this.getTotalTileHeight();
//         const visibleColumns = this.getVisibleColumnCount();
//         const visibleRows = this.getVisibleRowCount();

//         const start = Math.floor(this.scrollOffset / totalTileHeight) * visibleColumns;
//         const end = start + visibleColumns * (visibleRows + 2);

//         return { start, end };
//     }

//     private getTotalRowCount() {
//         const n = this.getVisibleColumnCount();

//         return n > 0 ? Math.ceil(this.dataSource.length / n) : 0;
//     }

//     private getX0() {
//         if (this.ctx && this.padding.left == 'auto') {
//             const visibleColumns = this.getVisibleColumnCount();
//             const totalTileWidth = this.getTotalTileWidth();

//             return (this.ctx.canvas.width - visibleColumns * totalTileWidth) / 2;
//         } else if (typeof (this.padding.left) === 'number') {
//             return this.padding.left;
//         } else {
//             return 0;
//         }
//     }

//     private getY0() {
//         const totalTileHeight = this.getTotalTileHeight();

//         return this.padding.top - (this.scrollOffset % totalTileHeight);
//     }

//     setScrollOffset(scrollOffset: number) {
//         this.scrollOffset = scrollOffset;
//     }

//     getScrollHeight(): number {
//         if (this.ctx) {
//             return this.getTotalRowCount() * this.getTotalTileHeight();
//         }
//         else {
//             return 0;
//         }
//     }

//     draw(): void {
//         if (!this.ctx || !this.dataSource) {
//             return;
//         }

//         const dateFormatter = new Intl.DateTimeFormat(Intl.DateTimeFormat().resolvedOptions().locale);
//         let currentDay: string = "";

//         const totalTileWidth = this.getTotalTileWidth();
//         const totalTileHeight = this.getTotalTileHeight();

//         const canvasWidth = this.ctx.canvas.width;
//         const canvasHeight = this.ctx.canvas.height;

//         this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

//         const x0 = this.getX0();
//         const y0 = this.getY0();

//         let x = x0;
//         let y = y0;

//         const range = this.getVisibleRange();

//         this.dataSource.loadRange(range);

//         for (let n = range.start; n < range.end; n++) {
//             if (n > this.dataSource.length) {
//                 break;
//             }

//             const item = this.dataSource.data$.value[n];

//             if (item) {
//                 let day = dateFormatter.format(item.dateModified);

//                 if (currentDay != day) {
//                     currentDay = day;

//                     x = x0;

//                     if (y != y0) {
//                         y += (totalTileHeight + 50);
//                     }

//                     this.ctx.font = 16 * window.devicePixelRatio + "px Roboto";
//                     this.ctx.fillStyle = '#000';
//                     this.ctx.fillText(day, x, y);

//                     y += 20;
//                 }

//                 if (item.image) {
//                     this.ctx.drawImage(item.image, x, y, this.tileWidth, this.tileHeight);
//                 } else {
//                     this.ctx.fillStyle = '#eee';
//                     this.ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
//                 }

//                 x += totalTileWidth;
//             }

//             if (x + totalTileWidth > canvasWidth) {
//                 x = x0;
//                 y += totalTileHeight;
//             }
//         }
//     }

//     drawImage(x: number, y: number, image: HTMLImageElement): void {
//         if (this.ctx) {
//             const w = this.getTotalTileWidth() / image.width;
//             const h = this.getTotalTileHeight() / image.height;
//             const s = Math.min(w, h) * window.devicePixelRatio;

//             this.ctx.drawImage(image, x, y, image.width * s, image.height * s);
//         }
//     }
// }