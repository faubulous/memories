import { Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';
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
  viewport: ElementRef<HTMLDivElement> | null = null;

  @ViewChild('container', { static: true })
  container: ElementRef<HTMLDivElement> | null = null;

  @ViewChild('spacer', { static: true })
  spacer: ElementRef<HTMLElement> | null = null;

  private stage: Stage | undefined;

  private dataSource: VirtualCanvasDataSource = new VirtualCanvasDataSource();

  private layouter: VirtualCanvasLayouter | null = null;

  constructor(private router: Router) { }

  /**
   * Initialize the data source and graphics context.
   */
  async ngOnInit() {
    if (this.viewport) {
      this.stage = new Konva.Stage({
        container: this.viewport.nativeElement,
        preventDefault: false
      });
    }

    if (this.stage) {
      this.layouter = new TimelineLayout(this.router, this.stage, this.dataSource);

      // Connect to the database and load inital data.
      await this.dataSource.init();

      this.updateCanvasSize();
    }

    if (this.container) {
      this.container.nativeElement.onscroll = this.onScroll.bind(this);
    }
  }

  /**
   * Handle window scroll events.
   */
  onScroll() {
    if (!this.layouter || !this.container) {
      return;
    }

    this.layouter.setScrollOffset(this.container.nativeElement.scrollTop);
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
    if (!this.viewport || !this.stage) {
      return;
    }

    const w = this.viewport.nativeElement.clientWidth;
    const h = this.viewport.nativeElement.clientHeight;

    this.stage.setSize({ width: w, height: h });

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
