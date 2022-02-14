import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VirtualCanvasComponent } from './components';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';

const routes: Routes = [
    { path: '', redirectTo: '/browse', pathMatch: 'full' },
    { path: 'browse', component: VirtualCanvasComponent },
    { path: 'browse/:id', component: VirtualCanvasComponent },
    { path: 'view', component: ImageViewerComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }