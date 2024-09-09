import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MachineComponent } from './components/machine/machine.component';
import { MachineReelsComponent } from './components/machine-reels/machine-reels.component';
import { MachineReelComponent } from './components/machine-reel/machine-reel.component';

@NgModule({
  declarations: [
    AppComponent,
    MachineComponent,
    MachineReelsComponent,
    MachineReelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
