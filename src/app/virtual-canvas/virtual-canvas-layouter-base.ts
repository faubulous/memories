import { VirtualCanvasDataSource } from "./virtual-canvas.data-source";
import { VirtualCanvasLayouter } from "./virtual-canvas-layouter";

export abstract class VirtualCanvasLayouterBase implements VirtualCanvasLayouter {
    protected scrollOffset: number = 0;

    constructor(protected ctx: CanvasRenderingContext2D, protected dataSource: VirtualCanvasDataSource) {
        // Trigger a repaint when the data has changed.
        dataSource.data$.subscribe(this.render.bind(this));
    }

    setScrollOffset(scrollOffset: number) {
        this.scrollOffset = scrollOffset;
    }

    abstract getScrollHeight(): number;

    render(): void {
        window.requestAnimationFrame(this.draw.bind(this));
    }

    abstract draw(): void;

    protected drawImage(x: number, y: number, width: number, height: number, image: HTMLImageElement): void {
        if (this.ctx) {
            const w = width / image.width;
            const h = height / image.height;
            const s = Math.min(w, h) * window.devicePixelRatio;

            this.ctx.drawImage(image, x, y, image.width * s, image.height * s);
        }
    }
}