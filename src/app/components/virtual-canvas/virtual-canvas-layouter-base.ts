import { Router } from "@angular/router";
import { Point, Rectangle } from "@mathigon/euclid";
import Konva from "konva";
import { Stage } from "konva/lib/Stage";
import { VirtualCanvasLayouter } from "./virtual-canvas-layouter";
import { VirtualCanvasDataSourceService } from "./virtual-canvas-data-source.service";

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

    constructor(protected router: Router, protected stage: Stage, protected dataSource: VirtualCanvasDataSourceService) {
        // Trigger a repaint when the data has changed.
        dataSource.subscribe(this.render.bind(this));

        // We draw every time the render() method is invoked.
        Konva.autoDrawEnabled = false;

        // Initialize the stage.
        this.stage.clear();
        this.stage.add(this.layer);
    }

    abstract getScrollOffsetForId(id: number): number;

    abstract layout(): Rectangle;

    setScrollOffset(scrollOffset: Point) {
        const w = this.viewport.w;
        const h = this.viewport.h;

        this.viewport = new Rectangle(scrollOffset, w, h);
    }

    setViewportSize(width: number, height: number): void {
        this.viewport = new Rectangle(new Point(), width, height);
    }

    render(): void {
        // this.zone.runOutsideAngular(() => this.draw());
        this.draw();
    }

    protected abstract draw(): void;
}