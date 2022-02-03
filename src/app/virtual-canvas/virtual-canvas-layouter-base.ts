import { Point, Rectangle } from "@mathigon/euclid";
import { VirtualCanvasDataSource } from "./virtual-canvas.data-source";
import { VirtualCanvasLayouter } from "./virtual-canvas-layouter";

/**
 * Base class for virtual canvas layouters.
 */
export abstract class VirtualCanvasLayouterBase implements VirtualCanvasLayouter {
    /**
     * The visible region of the whole canvas.
     */
    protected viewport = new Rectangle(new Point());

    constructor(protected ctx: CanvasRenderingContext2D, protected dataSource: VirtualCanvasDataSource) {
        // Trigger a repaint when the data has changed.
        dataSource.data$.subscribe(this.render.bind(this));
    }

    /**
     * Get the height of the scrollbar in pixels.
     */
    abstract getScrollHeight(): number;

    /**
     * Set a new scrollbar position.
     * @param scrollOffset New scroll offset in pixels.
     */
    setScrollOffset(scrollOffset: number) {
        const w = this.viewport.w;
        const h = this.viewport.h;

        this.viewport = new Rectangle(new Point(0, scrollOffset), w, h);
    }

    /*
     * Update the size of the viewport.
     * @param width Device independent width of the viewport in pixels.
     * @param height Device independent height of the viewport in pixels.
     */
    setViewportSize(width: number, height: number): void {
        const r = window.devicePixelRatio;

        this.viewport = new Rectangle(new Point(), width * r, height * r);
    }

    render(): void {
        window.requestAnimationFrame(this.draw.bind(this));
    }

    protected abstract draw(): void;
}