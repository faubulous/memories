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
    setScrollOffset(scrollOffset: number): void;

    /**
     * Get the height of the scrollbar in pixels.
     */
    getScrollHeight(): number;

    /*
     * Update the size of the viewport.
     * @param width Device independent width of the viewport in pixels.
     * @param height Device independent height of the viewport in pixels.
     */
    setViewportSize(width: number, height: number): void;

    render(): void;
}