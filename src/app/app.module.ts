import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MachineComponent } from './components/machine/machine.component';
import { ReelsComponent } from './components/machine-reels/reels.component';
import { ReelItemComponent } from './components/machine-reel-item/reel-item.component';

import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    AppComponent,
    MachineComponent,
    ReelsComponent,
    ReelItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    OrderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
