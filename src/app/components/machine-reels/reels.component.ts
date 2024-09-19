import {Component, OnInit} from '@angular/core';

type Reel = {
  status: 'spinning' | 'stopped',
  startPos?: number;
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
export class ReelsComponent implements OnInit {
  protected showDebug: boolean = true;

  protected reelsSpinning?: any;
  protected stopSpinning: boolean = false;
  protected minTravelOnStop: number = 150;

  private oneThird = 33.333;
  private basePos = -this.oneThird;
  private spinInterval = 2;

  private reelCount = 3;
  private reelItemCount = 4;
  private reelItems: ReelItem[][] = [
    ['orange', 'grapes', 'lemon', 'cherries'],
    ['lemon', 'orange', 'cherries', 'grapes'],
    ['cherries', 'lemon', 'grapes', 'orange']
  ];

  protected reels: Reels = [];

  ngOnInit() {
    this.initialiseReels();
  }

  public get isReelsSpinning(): boolean { return !!this.reelsSpinning }

  public get isReelsStopping(): boolean { return this.stopSpinning }

  public startSpin() {
    if (this.reelsSpinning) return;
    if (this.stopSpinning) return;
    this.startReelCycle();
    for(const reel of this.reels) {
      reel.status = 'spinning';
      reel.travelSinceStop = undefined;
    }
  }

  public stopSpin() {
    if (!this.reelsSpinning) return;
    this.stopSpinning = true;
  }

  private initialiseReels() {
    for (let i = 0; i < this.reelCount; i++) {
      const reel: Reel = {
        status: 'stopped',
        items: []
      }
      // Randomise the starting position of the reel
      reel.startPos = Math.floor(Math.random() * 4);
      // Position the first item at the starting position
      let pos = reel.startPos!;
      // Set the initial reel items
      // TODO Randomise the starting position of the item choice from the reel items,
      //  especially once reels have more items than are displayed, after that perhaps
      //  stop randomising the start position of the reel (since it won't work with both
      //  anyway) - do all that by filling a queue from the reel items, starting from a random position,
      //  could just be a pointer index but having an actual queue seems more fun, if a little redundant
      for (let j = 0; j < this.reelItemCount; j++) {
        // Initialise the item
        reel.items.push({
          item: this.reelItems[i][j],
          position: this.oneThird * pos
        });
        pos = (pos + 1) % 4;
      }
      this.reels.push(reel);
    }
  }

  private startReelCycle() {
    this.reelsSpinning = setInterval(this.cycleReels.bind(this), 10);
  }

  private cycleReels() {
    let allStopped = true;
    for (const reel of this.reels) {
      // Handle stopping
      if (this.stopSpinning) {
        // Ignore this reel if it's already stopped
        if (reel.status === 'stopped') continue;
        // If the reel hasn't started stopping, save the position it started stopping
        reel.travelSinceStop ??= 0;
        reel.travelSinceStop += this.spinInterval;
        if (
          reel.travelSinceStop > this.minTravelOnStop
          // Is at a stopping point
          // TODO Make the stopping point be exact and adjust all items accordingly
          && reel.items[0].position % this.oneThird > -1
          && reel.items[0].position % this.oneThird < 1
        ) {
          reel.status = 'stopped';
          continue;
        }
      }
      // Process each item on the reel
      for (const item of reel.items) {
        // Increment the position of the item
        item.position += this.spinInterval;
        // Cycle the item back to the start if it reached the end
        // TODO Drop the item to a queue and pick up the next item
        if (item.position > 100) item.position = (item.position % 100) + this.basePos;
      }
      // Track when all stopped
      allStopped = false;
    }
    // Clear interval if all reels have stopped
    if (allStopped) {
      this.endReelCycle();
    }
  }

  private endReelCycle() {
    this.stopSpinning = false;
    if (this.reelsSpinning) clearInterval(this.reelsSpinning);
    this.reelsSpinning = undefined;
  }
}
