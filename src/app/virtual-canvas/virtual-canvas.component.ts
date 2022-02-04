import { ChangeDetectionStrategy, Component, ElementRef, HostListener, NgZone, ViewChild } from '@angular/core';
import { VirtualCanvasDataSource } from './virtual-canvas.data-source';
import { VirtualCanvasLayouter } from './virtual-canvas-layouter';
import { TimelineLayout } from './layouts/timeline-layout';

// See: https://medium.com/angular-in-depth/how-to-get-started-with-canvas-animations-in-angular-2f797257e5b4
@Component({
  selector: 'app-virtual-canvas',
  templateUrl: './virtual-canvas.component.html',
  styleUrls: ['./virtual-canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VirtualCanvasComponent {
  @ViewChild('viewport', { static: true })
  viewport: ElementRef<HTMLElement> | null = null;

  @ViewChild('spacer', { static: true })
  spacer: ElementRef<HTMLElement> | null = null;

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement> | null = null;

  private ctx: CanvasRenderingContext2D | null = null;

  private dataSource: VirtualCanvasDataSource = new VirtualCanvasDataSource();

  private layouter: VirtualCanvasLayouter | null = null;

  constructor(private ngZone: NgZone) { }

  /**
   * Initialize the data source and graphics context.
   */
  async ngOnInit() {
    if (this.canvas) {
      this.ctx = this.canvas.nativeElement.getContext('2d');
    }

    if (this.ctx) {
      this.layouter = new TimelineLayout(this.ngZone, this.ctx, this.dataSource);

      // Connect to the database and load inital data.
      await this.dataSource.init();

      this.updateCanvasSize();
    }
  }

  /**
   * Handle window scroll events.
   */
  @HostListener('window:scroll')
  onScroll() {
    if (!this.layouter) {
      return;
    }

    // Todo: Change template to include a container that has the scrollbar.
    const offset = document.documentElement.scrollTop;

    this.layouter.setScrollOffset(offset);
    this.layouter.render();
  }

  /**
   * Handle window resize events.
   */
  @HostListener('window:resize')
  onResize() {
    if (!this.layouter) {
      return;
    }

    this.updateCanvasSize();
  }

  /**
   * Fit the canvas into the viewport container and adapt the
   * size to the display resolution to support high DPI screens.
   */
  updateCanvasSize() {
    if (!this.viewport || !this.ctx) {
      return;
    }

    const r = window.devicePixelRatio;
    const w = this.viewport.nativeElement.clientWidth;
    const h = this.viewport.nativeElement.clientHeight;

    // The device pixel ratio accounts for high-dpi screens..
    this.ctx.canvas.width = w * r;
    this.ctx.canvas.height = h * r;
    this.ctx.canvas.style.width = w + 'px';
    this.ctx.canvas.style.height = h + 'px';

    if (!this.spacer || !this.layouter) {
      return;
    }

    // Inform the layouter about the size change..
    this.layouter.setViewportSize(w, h);

    // Update the scrollbar height..
    this.spacer.nativeElement.style.height = this.layouter.getScrollHeight() + 'px';

    this.layouter.render();
  }
}
