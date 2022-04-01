import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowseContainer, ViewContainer } from './containers';

const routes: Routes = [
    { path: '', redirectTo: '/browse', pathMatch: 'full' },
    { path: 'browse', component: BrowseContainer },
    { path: 'browse/:id', component: BrowseContainer },
    { path: 'view/:id', component: ViewContainer },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }