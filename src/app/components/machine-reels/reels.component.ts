import {Component, OnInit, AfterViewInit} from '@angular/core';

type Reel = {
  status: 'spinning' | 'stopped',
  travelSinceStop?: number,
  items: ReelItemData[]
};
type ReelItem = 'orange' | 'grapes' | 'lemon' | 'cherries';
type ReelItemData = {
  item: ReelItem,
  position: number
};
// [reel][reel items][reel item data]
type Reels = Reel[];

// TODO: Spin the reels based on time rather than when the interval occurs
// TODO: Add more items to the reels
// TODO: Change reel item positions to be based on the center of the box
// TODO: Fix stopping the reels from breaking item position sometimes (due to passing 100 mark most likely)
// TODO: Slow reels down when stopping

@Component({
  selector: 'app-machine-reels',
  templateUrl: './reels.component.html',
  styleUrl: './reels.component.scss'
})
export class ReelsComponent implements OnInit, AfterViewInit {
  protected showDebug: boolean = true;

  protected reelsSpinning?: any;
  protected stopSpinning: boolean = false;
  protected minTravelOnStop: number = 150;

  private oneThird = 33.333;
  private basePos = -this.oneThird;
  private spinInterval = 2;

  private reelCount = 3;
  private reelItemCount = 4;
  private reelItems: ReelItem[] = ['orange', 'grapes', 'lemon', 'cherries'];

  protected reelPositions: Reels = [];

  private initialiseReels() {
    for (let i = 0; i < this.reelCount; i++) {
      this.reelPositions.push({
        status: 'stopped',
        items: []
      });
    }
    for (const reel of this.reelPositions) {
      let pos = Math.floor(Math.random() * 4);
      for (let i = 0; i < this.reelItemCount; i++) {
        reel.items.push({
          item: this.reelItems[i],
          position: this.oneThird * pos
        });
        pos = (pos + 1) % 4;
      }
    }
  }

  public get isReelsSpinning(): boolean { return !!this.reelsSpinning }

  public get isReelsStopping(): boolean { return this.stopSpinning }

  public startSpin() {
    if (this.reelsSpinning) return;
    if (this.stopSpinning) return;
    this.reelsSpinning = setInterval(this.cycleReels.bind(this), 10);
    for(const reel of this.reelPositions) {
      reel.status = 'spinning';
      reel.travelSinceStop = undefined;
    }
  }

  public stopSpin() {
    if (!this.reelsSpinning) return;
    this.stopSpinning = true;
  }

  public clearSpinInterval() {
    this.stopSpinning = false;
    if (this.reelsSpinning) clearInterval(this.reelsSpinning);
    this.reelsSpinning = undefined;
  }

  private cycleReels() {
    let allStopped = true;
    for (const reel of this.reelPositions) {
      // Handle stopping
      if (this.stopSpinning) {
        // Ignore this reel if it's already stopped
        if (reel.status === 'stopped') continue;
        // If the reel hasn't started stopping, save the position it started stopping
        if (typeof reel.travelSinceStop !== 'number') {
          reel.travelSinceStop = 0;
        } else {
          reel.travelSinceStop += this.spinInterval;
        }
      }
      for (const item of reel.items) {
        if (
          reel.travelSinceStop
          && reel.travelSinceStop > this.minTravelOnStop
          && this.stopSpinning
          && item.position % this.oneThird > -1
          && item.position % this.oneThird < 1
        ) {
          reel.status = 'stopped';
          continue;
        }
        item.position += this.spinInterval;
        if (item.position > 100) item.position = (item.position % 100) + this.basePos;
      }
      if (reel.status !== 'stopped') allStopped = false;
    }
    if (allStopped) {
      this.clearSpinInterval();
    }
  }

  ngOnInit() {
    this.initialiseReels();
  }

  ngAfterViewInit() {
  }
}
