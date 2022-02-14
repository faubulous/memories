import { ChangeDetectionStrategy, Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GalleryRef, ImageItem } from 'ng-gallery';
import { GetFileContextRequest, GetFileContextResponse } from 'src/electron/IPC/DatabaseChannel';
import { IpcService } from 'src/shared/IpcService';
import { File } from "@prisma/client";

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewerComponent {
  @ViewChild('gallery', { static: true })
  gallery: GalleryRef | null = null;

  private file: File | undefined;

  constructor(public router: Router) { }

  async ngAfterViewInit() {
    if (this.gallery) {
      const path = this.router.routerState.snapshot.root.queryParams.file;
      const result = await new IpcService().send<GetFileContextResponse>(new GetFileContextRequest(path));

      this.file = result.files.find(f => f.path == path);

      const items = result.files
        .reverse()
        .map(f => new ImageItem({
          src: 'file://' + f.path,
          thumb: f.thumbnail ? f.thumbnail : undefined
        }));

      const i = items.findIndex(f => f.data.src == 'file://' + path);

      this.gallery.load(items);
      this.gallery.set(i);
    }
  }

  @HostListener('document:keydown.escape')
  @HostListener('document:keydown.backspace')
  goBack() {
    if (this.file) {
      this.router.navigateByUrl('/browse/' + this.file.id);
    } else {
      this.router.navigateByUrl('/browse');
    }
  }

  @HostListener('document:keydown.arrowright')
  next() {
    this.gallery?.next();
  }

  @HostListener('document:keydown.arrowleft')
  prev() {
    this.gallery?.prev();
  }
}
