import { ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GalleryRef, ImageItem } from 'ng-gallery';
import { GetFileContextRequest, GetFileContextResponse } from 'src/electron/IPC/DatabaseChannel';
import { IpcService } from 'src/shared/IpcService';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewerComponent {
  @ViewChild('gallery', { static: true })
  gallery: GalleryRef | null = null;

  constructor(public router: Router) { }

  async ngAfterViewInit() {
    console.warn(this.gallery);

    if (this.gallery) {
      const path = this.router.routerState.snapshot.root.queryParams.file;
      const result = await new IpcService().send<GetFileContextResponse>(new GetFileContextRequest(path));

      const items = result.files
        .reverse()
        .map(f => new ImageItem({
          src: 'file://' + f.path,
          thumb: f.thumbnail ? f.thumbnail : undefined
        }));

      const i = items.findIndex(f => f.data.src == 'file://' + path);

      console.warn(items, i);

      this.gallery.load(items);
      this.gallery.set(i);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  @HostListener('document:keydown.backspace', ['$event'])
  goBack(event: KeyboardEvent) {
    this.router.navigateByUrl('/');
  }

  @HostListener('document:keydown.arrowright', ['$event'])
  next(event: KeyboardEvent) {
    this.gallery?.next();
  }

  @HostListener('document:keydown.arrowleft', ['$event'])
  prev(event: KeyboardEvent) {
    this.gallery?.prev();
  }
}
