export interface VirtualCanvasLayouter {
    setScrollOffset(scrollOffset: number): void;

    getScrollHeight(): number;

    render(): void;
}