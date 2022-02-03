export interface VirtualCanvasLayouter {
    setScrollOffset(scrollOffset: number): void;

    getScrollHeight(): number;

    setViewportSize(width: number, height: number): void;

    render(): void;
}