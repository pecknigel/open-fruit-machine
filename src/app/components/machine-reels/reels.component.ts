import {Component, ElementRef, AfterViewInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-machine-reels',
  templateUrl: './reels.component.html',
  styleUrl: './reels.component.scss'
})
export class ReelsComponent implements AfterViewInit {
  protected reelOneTopPos = 2.5;
  protected reelTwoTopPos = 2.5;
  protected reelThreeTopPos = 2.5;

  ngAfterViewInit() {
    setInterval(() => {
      const increase = 10;
      this.reelOneTopPos += increase;
      this.reelTwoTopPos += increase;
      this.reelThreeTopPos += increase;
      if (this.reelOneTopPos > 100) {
        this.reelOneTopPos = 2.5;
      }
      if (this.reelTwoTopPos > 100) {
        this.reelTwoTopPos = 2.5;
      }
      if (this.reelThreeTopPos > 100) {
        this.reelThreeTopPos = 2.5;
      }
    }, 50);
  }
}
