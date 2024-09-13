import {Component, OnInit, AfterViewInit} from '@angular/core';

type ReelItem = 'orange' | 'grapes' | 'lemon' | 'cherries';
type ReelItemData = {
  item: ReelItem,
  position: number,
  status: 'spinning' | 'stopped'
};
// [reel][reel items][reel item data]
type Reels = ReelItemData[][];

// TODO: Make the reels stop on a proper position
// TODO: Spin the reels based on time rather than when the interval occurs
// TODO: Add more items to the reels
// TODO: Change reel item positions to be based on the center of the box

@Component({
  selector: 'app-machine-reels',
  templateUrl: './reels.component.html',
  styleUrl: './reels.component.scss'
})
export class ReelsComponent implements OnInit, AfterViewInit {
  protected showDebug: boolean = false;

  private reelsSpinning?: any;
  private stopSpinning: boolean = false;
  private oneThird = 33.333;
  private basePos = -this.oneThird;
  private spinInterval = 2;

  private reelCount = 3;
  private reelItemCount = 4;
  private reelItems: ReelItem[] = ['orange', 'grapes', 'lemon', 'cherries'];

  protected reelPositions: Reels = [];

  private initialiseReels() {
    for (let i = 0; i < this.reelCount; i++) {
      this.reelPositions.push([]);
    }
    for (const reel of this.reelPositions) {
      let pos = Math.floor(Math.random() * 4);
      for (let i = 0; i < this.reelItemCount; i++) {
        reel.push({
          item: this.reelItems[i],
          position: this.oneThird * pos,
          status: 'spinning'
        });
        pos = (pos + 1) % 4;
      }
    }
  }

  public get isReelsSpinning(): boolean { return !!this.reelsSpinning }

  public toggleSpin() {
    if (this.reelsSpinning) {
      this.stopSpin();
    } else {
      this.startSpin();
    }
  }

  public startSpin() {
    if (!this.reelsSpinning) this.reelsSpinning = setInterval(this.cycleReels.bind(this), 10);
  }

  public stopSpin() {
    this.clearSpinInterval();
    // this.stopSpinning = true;
  }

  public clearSpinInterval() {
    this.stopSpinning = false;
    if (this.reelsSpinning) clearInterval(this.reelsSpinning);
    this.reelsSpinning = undefined;
  }

  private cycleReels() {
    for (const reel of this.reelPositions) {
      for (const item of reel) {
        if (this.stopSpinning) {

          this.clearSpinInterval();
          return;
        }
        item.position += this.spinInterval % 100;
        if (item.position > 100) item.position = this.basePos;
      }
    }
  }

  ngOnInit() {
    this.initialiseReels();
  }

  ngAfterViewInit() {
  }
}
