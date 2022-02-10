import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { GalleryItem, ImageItem } from 'ng-gallery';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewerComponent {
  readonly items$ = new BehaviorSubject<GalleryItem[]>([]);

  constructor(public router: Router) { }

  ngOnInit() {
    let items: GalleryItem[] = [];

    let url = 'file://' + this.router.routerState.snapshot.root.queryParams.file;

    items.push(new ImageItem({ src: url, thumb: url }));

    this.items$.next(items);
  }

  @HostListener('document:keydown.backspace', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.router.navigateByUrl('/');
  }
}
