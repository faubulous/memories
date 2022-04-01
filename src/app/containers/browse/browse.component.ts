import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowseContainer {
  constructor(private _router: Router) { }

  selectionChanged(ids: number[]) {
    if (ids) {
      this._router.navigateByUrl(`/view/${ids[0]}`);
    }
  }
}
