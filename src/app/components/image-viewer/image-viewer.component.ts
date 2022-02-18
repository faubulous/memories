import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { File } from "@prisma/client";
import { BehaviorSubject } from 'rxjs';
import { VirtualCanvasDataSourceService } from '../virtual-canvas/virtual-canvas-data-source.service';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewerComponent {
  private id: number = 0;

  readonly image$ = new BehaviorSubject<string>("");

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private dataSource: VirtualCanvasDataSourceService) { }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.loadImage(Number(params.get('id')));

      // Scroll thumbnails to scroll offset.
    });
  }

  private loadImage(n: number) {
    const thumbnail = this.dataSource.data[n];

    console.warn(n, thumbnail);

    if(thumbnail) {
      this.image$.next(`url('file://${thumbnail.path}')`);
    }

    this.id = n;
  }

  @HostListener('document:keydown.escape')
  @HostListener('document:keydown.backspace')
  goBack() {
    if (this.id) {
      this.router.navigateByUrl('/browse/' + this.id);
    } else {
      this.router.navigateByUrl('/browse');
    }
  }

  @HostListener('document:keydown.arrowright')
  next() {
    this.loadImage(this.id + 1);
  }

  @HostListener('document:keydown.arrowleft')
  prev() {
    this.loadImage(this.id - 1);
  }
}
