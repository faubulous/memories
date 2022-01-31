import { ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { VirtualTimelineDataSource } from './virtual-timeline.data-source';

// See: https://medium.com/angular-in-depth/how-to-get-started-with-canvas-animations-in-angular-2f797257e5b4
@Component({
  selector: 'app-virtual-timeline-canvas',
  templateUrl: './virtual-timeline-canvas.component.html',
  styleUrls: ['./virtual-timeline-canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualTimelineCanvasComponent {
  @ViewChild('viewport', { static: true })
  viewport: ElementRef<HTMLElement> | null = null;

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement> | null = null;

  private ctx: CanvasRenderingContext2D | null = null;

  private padding:
    {
      top: number,
      left: 'auto' | number,
      right: 'auto' | number,
      bottom: number
    } = {
      top: 40,
      left: 'auto',
      right: 'auto',
      bottom: 40
    };

  private tileSpacing = 8;

  private tileWidth = 400;

  private tileHeight = 400;

  private readonly dataSource = new VirtualTimelineDataSource();

  constructor() {
    // Trigger a repaint when the data has changed.
    this.dataSource.data$.subscribe(this.render.bind(this));
  }

  async ngOnInit() {
    // Initialize the data source.
    await this.dataSource.init();

    if (this.canvas) {
      this.ctx = this.canvas.nativeElement.getContext('2d');

      this.updateCanvasSize();
      this.render();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.render();
  }

  @HostListener('window:resize', ['$event'])
  onResize(e: Event) {
    this.updateCanvasSize();
    this.render();
  }

  updateCanvasSize() {
    if (this.viewport && this.ctx) {
      const r = window.devicePixelRatio;
      const w = this.viewport.nativeElement.clientWidth;
      const h = this.viewport.nativeElement.clientHeight;

      // The device pixel ratio accounts for high-dpi screens..
      this.ctx.canvas.width = w * r;
      this.ctx.canvas.height = h * r;
      this.ctx.canvas.style.width = w + "px";
      this.ctx.canvas.style.height = h + "px";
    }
  }

  private getVisibleRange() {
    const scrollOffset = this.getScrollOffset();
    const totalTileHeight = this.getTotalTileHeight();
    const visibleColumns = this.getVisibleColumnCount();
    const visibleRows = this.getVisibleRowCount();

    const start = Math.floor(scrollOffset / totalTileHeight) * visibleColumns;
    const end = start + visibleColumns * (visibleRows + 2);

    return { start, end };
  }

  private getVisibleColumnCount() {
    const w = this.getTotalTileWidth();

    return this.ctx && w > 0 ? Math.floor(this.ctx.canvas.width / w) : 0;
  }

  private getVisibleRowCount() {
    const h = this.getVisibleColumnCount();

    return this.ctx && h > 0 ? Math.ceil(this.ctx.canvas.height / h) : 0;
  }

  private getTotalRowCount() {
    const n = this.getVisibleColumnCount();

    return n > 0 ? Math.ceil(this.dataSource.length / n) : 0;
  }

  private getTotalTileWidth() {
    return this.tileWidth + this.tileSpacing;
  }

  private getTotalTileHeight() {
    return this.tileHeight + this.tileSpacing;
  }

  private getX() {
    if (this.ctx && this.padding.left == 'auto') {
      const visibleColumns = this.getVisibleColumnCount();
      const totalTileWidth = this.getTotalTileWidth();

      return (this.ctx.canvas.width - visibleColumns * totalTileWidth) / 2;
    } else if (typeof (this.padding.left) === 'number') {
      return this.padding.left;
    } else {
      return 0;
    }
  }

  private getScrollOffset() {
    // Todo: Change template to include a container that has the scrollbar.
    return document.documentElement.scrollTop;
  }

  getScrollHeight() {
    if (this.viewport && this.ctx) {
      return this.getTotalRowCount() * this.getTotalTileHeight() + 'px';
    }
    else {
      return 0;
    }
  }

  render() {
    window.requestAnimationFrame(this.draw.bind(this));
  }

  draw() {
    if (!this.ctx) {
      return;
    }

    const dateFormatter = new Intl.DateTimeFormat(Intl.DateTimeFormat().resolvedOptions().locale);
    let currentDay: string = "";

    const totalTileWidth = this.getTotalTileWidth();
    const totalTileHeight = this.getTotalTileHeight();

    const canvasWidth = this.ctx.canvas.width;
    const canvasHeight = this.ctx.canvas.height;
    const offset = this.getScrollOffset();

    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const x0 = this.getX();
    const y0 = this.padding.top - (offset % totalTileHeight);

    let x = x0;
    let y = y0;

    const range = this.getVisibleRange();

    this.dataSource.loadRange(range);

    console.warn(offset, x0, y0, range.start, range.end);

    for (let n = range.start; n < range.end; n++) {
      if (n > this.dataSource.length) {
        break;
      }

      const item = this.dataSource.data$.value[n];

      if (item) {
        let day = dateFormatter.format(item.dateModified);

        if (currentDay != day) {
          currentDay = day;

          x = x0;

          if(y != y0) {
            y += (totalTileHeight + 50);
          }

          this.ctx.font = 16 * window.devicePixelRatio + "px Roboto";
          this.ctx.fillStyle = '#000';
          this.ctx.fillText(day, x, y);

          y += 20;
        }

        if (item.image) {
          this.ctx.drawImage(item.image, x, y, this.tileWidth, this.tileHeight);
        } else {
          this.ctx.fillStyle = '#eee';
          this.ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
        }

        x += totalTileWidth;
      }

      if (x + totalTileWidth > canvasWidth) {
        x = x0;
        y += totalTileHeight;
      }
    }
  }

  drawImage(x: number, y: number, image: HTMLImageElement) {
    if (this.ctx) {
      const w = this.getTotalTileWidth() / image.width;
      const h = this.getTotalTileHeight() / image.height;
      const s = Math.min(w, h) * window.devicePixelRatio;

      this.ctx.drawImage(image, x, y, image.width * s, image.height * s);
    }
  }
}
