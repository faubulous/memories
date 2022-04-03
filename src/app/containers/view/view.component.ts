import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { VirtualCanvasDataSourceService } from '../../components/virtual-canvas/virtual-canvas-data-source.service';
import { IpcService } from 'src/app/ipc';
import { ToggleFullscreenRequest } from 'src/app/ipc/WindowChannel';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewContainer {
  private id: number = 0;

  readonly image$ = new BehaviorSubject<string>("");

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private dataSource: VirtualCanvasDataSourceService) { }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.loadImage(Number(params.get('id')));

      // Scroll thumbnails to scroll offset.
    });
  }

  private async loadImage(id: number) {
    const thumbnail = await this.dataSource.loadItem(id);

    if (thumbnail) {
      this.image$.next(`file://${thumbnail.path}`);
    }

    this.id = id;
  }

  async selectionChanged(ids: number[]) {
    if (this.dataSource && ids) {
      await this.loadImage(ids[0]);
    }
  }

  @HostListener('document:keydown.escape')
  @HostListener('document:keydown.backspace')
  browse() {
    if (this.id) {
      this.router.navigateByUrl('/browse/' + this.id);
    } else {
      this.router.navigateByUrl('/browse');
    }
  }

  @HostListener('document:keydown.F11')
  async toggleFullscreen() {
    await new IpcService().send<ToggleFullscreenRequest>(new ToggleFullscreenRequest());
  }

  @HostListener('document:keydown.arrowright')
  nextImage() {
    this.dataSource.selectItem(this.id + 1);
  }

  @HostListener('document:keydown.arrowleft')
  previousImage() {
    this.dataSource.selectItem(this.id - 1);
  }
}
