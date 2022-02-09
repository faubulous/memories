import { Point, Rectangle } from "@mathigon/euclid";
import { Stage } from "konva/lib/Stage";
import { VirtualCanvasDataSource } from "./virtual-canvas.data-source";
import { VirtualCanvasLayouter } from "./virtual-canvas-layouter";
import { Layer } from "konva/lib/Layer";
import Konva from "konva";
import { NgZone } from "@angular/core";

/**
 * Base class for virtual canvas layouters.
 */
export abstract class VirtualCanvasLayouterBase implements VirtualCanvasLayouter {
    /**
     * The visible geometry of the whole canvas.
     */
    protected viewport = new Rectangle(new Point());

    protected layer = new Konva.Layer({
        clearBeforeDraw: true,
        preventDefault: false
    });

    constructor(protected zone: NgZone, protected stage: Stage, protected dataSource: VirtualCanvasDataSource) {
        // Trigger a repaint when the data has changed.
        dataSource.data$.subscribe(this.render.bind(this));

        Konva.autoDrawEnabled = false;

        this.stage.clear();
        this.stage.add(this.layer);
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
        this.viewport = new Rectangle(new Point(), width, height);
    }

    render(): void {
        this.zone.runOutsideAngular(() => this.draw());
    }

    protected abstract draw(): void;
}