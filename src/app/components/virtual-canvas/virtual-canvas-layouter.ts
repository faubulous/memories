import { Point, Rectangle } from "@mathigon/euclid";

export interface VirtualCanvasLayouter {
    /**
     * Get the scroll offset in pixels for a given item.
     * @param id Item identifier from the database.
     */
    getScrollOffsetForId(id: number): number;

    /**
     * Set a new scrollbar position.
     * @param scrollOffset New scroll offset in pixels.
     */
    setScrollOffset(scrollOffset: Point): void;

    /*
     * Update the size of the viewport.
     * @param width Device independent width of the viewport in pixels.
     * @param height Device independent height of the viewport in pixels.
     */
    setViewportSize(width: number, height: number): void;

    /**
     * Layout the content and return the required dimensions.
     */
    layout(): Rectangle;

    /**
     * Render the content on the screen.
     */
    render(): void;
}