import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    Input,
    ViewChild
} from '@angular/core';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';

@Component({
    selector: 'app-image-view',
    templateUrl: './image-view.component.html',
    styleUrls: ['./image-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewComponent {
    @ViewChild('viewport', { static: true })
    viewport: ElementRef<HTMLDivElement> | null = null;

    stage: Konva.Stage | null = null;

    layer: Konva.Layer | null = null;

    image: Konva.Image | null = null;

    transformer: Konva.Transformer | null = null;

    @Input()
    set imageSource(src: string | null) {
        if (src) {
            let image = new Image();
            image.src = src;
            image.onload = () => {
                if (this.image) {
                    this.image.image(image);
                    this.image.width(image.width);
                    this.image.height(image.height);
                    this.image.visible(true);

                    this.zoomFit();
                    this.center();

                    this.stage?.draw();
                }
            }
        }
    }

    /**
     * Indicate if the image should be fitted inside the visible area of the stage.
     */
    private _zoomToFit = true;

    /**
     * Zoom factor for the mouse wheel.
     */
    private _wheelScaleFactor = 1.1;

    constructor() { }

    async ngOnInit() {
        if (this.viewport) {
            this.layer = new Konva.Layer();

            this.image = new Konva.Image({
                listening: true,
                visible: true,
                width: 300,
                height: 300,
                image: undefined
            });

            this.layer.add(this.image);

            this.stage = new Konva.Stage({
                container: this.viewport.nativeElement,
                preventDefault: false
            });

            this.stage.add(this.layer);
            this.stage.on('wheel', e => this.zoomByWheel(e));

            this.updateCanvasSize();
        }
    }

    /**
     * Handle window resize events.
     */
    @HostListener('window:resize')
    onResize() {
        this.updateCanvasSize();
    }

    updateCanvasSize() {
        if (!this.viewport || !this.stage) {
            return;
        }

        const w = this.viewport.nativeElement.clientWidth;
        const h = this.viewport.nativeElement.clientHeight;

        this.stage.setSize({ width: w, height: h });

        if (this._zoomToFit) {
            this.zoomFit();
        }

        this.center();

        this.stage.draw();
    }

    getImageSizeAtScale(scale: number) {
        if (this.image) {
            return {
                width: this.image.width() * scale,
                height: this.image.height() * scale
            }
        } else {
            return {
                width: 0,
                height: 0
            }
        }
    }

    zoomByWheel(e: KonvaEventObject<WheelEvent>) {
        if (this.stage) {
            e.evt.preventDefault();

            this._zoomToFit = false;

            const pointerPosition = this.stage.getPointerPosition();

            if (!pointerPosition) {
                return;
            }

            const oldScale = this.stage.scaleX();

            const mousePointTo = {
                x: (pointerPosition.x - this.stage.x()) / oldScale,
                y: (pointerPosition.y - this.stage.y()) / oldScale,
            };

            let direction = e.evt.deltaY > 0 ? -1 : 1;

            // When we zoom on trackpad, e.evt.ctrlKey is true
            // in that case lets revert direction.
            if (e.evt.ctrlKey) {
                direction = -direction;
            }

            const scaleFactor = this._wheelScaleFactor;

            const newScale = direction > 0 ? oldScale * scaleFactor : oldScale / scaleFactor;

            this.stage.scale({ x: newScale, y: newScale });

            const scaledPosition = {
                x: pointerPosition.x - mousePointTo.x * newScale,
                y: pointerPosition.y - mousePointTo.y * newScale,
            };

            if (this.image) {
                const newSize = this.getImageSizeAtScale(newScale);

                if (newSize.width < this.stage.width()) {
                    scaledPosition.x = (this.stage.width() - newSize.width) / 2;
                }

                if (newSize.height < this.stage.height()) {
                    scaledPosition.y = (this.stage.height() - newSize.height) / 2;
                }
            }

            this.stage.position(scaledPosition);

            this.stage.draw();
        }
    }

    zoomFit() {
        if (!this.image || !this.stage) {
            return;
        }

        const stageRatio = this.stage.width() / this.stage.height();
        const imageRatio = this.image.width() / this.image.height();

        if (stageRatio >= imageRatio) {
            const r = this.stage.height() / this.image.height();

            this.stage.scale({ x: r, y: r });
        } else {
            const r = this.stage.width() / this.image.width();

            this.stage.scale({ x: r, y: r });
        }
    }

    center() {
        if (!this.image || !this.stage) {
            return;
        }

        const p = {
            x: Math.floor(this.stage.width() / 2) - this.image.width() / 2 * this.stage.scaleX(),
            y: Math.floor(this.stage.height() / 2) - this.image.height() / 2 * this.stage.scaleY()
        }

        this.stage.position(p);
    }
}
