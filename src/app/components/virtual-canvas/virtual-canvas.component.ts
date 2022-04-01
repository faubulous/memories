import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';
import { Point } from '@mathigon/euclid';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { VirtualCanvasLayouter } from './virtual-canvas-layouter';
import { VirtualCanvasLayouterFactory } from './virtual-canvas-layouter-factory';
import { VirtualCanvasDataSourceService } from './virtual-canvas-data-source.service';

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

  @Input()
  layout: 'timeline' | 'linear' = 'timeline';

  @Input()
  orientation: 'horizontal' | 'vertical' = 'vertical';

  @Output()
  readonly selectionChanged = new EventEmitter<number[]>();

  private stage: Stage | undefined;

  private layouterFactory: VirtualCanvasLayouterFactory | null = null;

  private layouter: VirtualCanvasLayouter | null = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataSource: VirtualCanvasDataSourceService) {
  }

  /**
   * Initialize the data source and graphics context.
   */
  async ngOnInit() {
    if (this.viewport) {
      this.stage = new Konva.Stage({
        container: this.viewport.nativeElement,
        preventDefault: false
      });

      this.layouterFactory = new VirtualCanvasLayouterFactory(this.router, this.stage, this.dataSource);
    }

    if (this.stage && this.layouterFactory) {
      this.layouter = this.layouterFactory.createLayouter(this.layout);

      // Connect to the database and load inital data.
      await this.dataSource.init();

      // Emit the selection changed event.
      this.dataSource.selectionChanged.subscribe(args => {
        this.selectionChanged.emit(args);
      })

      this.updateCanvasSize();
    }

    if (this.container) {
      this.container.nativeElement.onscroll = this.onScroll.bind(this);
    }

    this.activatedRoute.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (this.container && this.layouter && id > 0) {
        const offset = this.layouter.getScrollOffsetForId(id);

        this.container.nativeElement.scrollTo(0, offset);
      }
    });
  }

  /**
   * Handle window scroll events.
   */
  onScroll() {
    if (!this.layouter || !this.container) {
      return;
    }

    var e = this.container.nativeElement;

    // This is weird. The axis seem to be inverted..
    this.layouter.setScrollOffset(new Point(e.scrollLeft, e.scrollTop));
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
    const r = this.layouter.layout();

    this.spacer.nativeElement.style.width = r.w + 'px';
    this.spacer.nativeElement.style.height = r.h + 'px';

    this.layouter.render();
  }

  getScrollContainerClass() {
    return {
      horizontal: this.orientation == 'horizontal',
      vertical: this.orientation == 'vertical'
    }
  }
}
