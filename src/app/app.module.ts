import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { GalleryModule } from 'ng-gallery';
import { AppComponent } from './app.component';
import { components } from './components';
import { pipes } from './pipes';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    ...components,
    ...pipes
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ScrollingModule,
    GalleryModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
