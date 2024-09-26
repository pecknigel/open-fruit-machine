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
  position: number,
  lastPosition?: number,
  startPos?: number
};
type Reels = Reel[];

// TODO: Get the reel item stopping point aligned to the exact center
// TODO: Add more items to the reels
// TODO: Change reel item positions to be based on the center of the box
// TODO: Slow reels down when stopping

@Component({
  selector: 'app-machine-reels',
  templateUrl: './reels.component.html',
  styleUrl: './reels.component.scss'
})
export class ReelsComponent implements OnInit {
  protected showDebug: boolean = true;

  protected spinInterval?: any;
  protected readonly spinIntervalTime: number = 10;

  protected spinStartTime?: number;

  protected stopSpinning: boolean = false;
  protected minTravelOnStop: number = 15000;

  private readonly spinMovementPerSecond = 100;

  private readonly reelCount = 3;
  private readonly reelItemCount = 4;
  private readonly reelItems: ReelItem[][] = [
    ['orange', 'grapes', 'lemon', 'cherries'],
    ['lemon', 'orange', 'cherries', 'grapes'],
    ['cherries', 'lemon', 'grapes', 'orange']
  ];

  protected reels: Reels = [];

  ngOnInit() {
    this.initialiseReels();
  }

  public get isReelsSpinning(): boolean { return !!this.spinInterval }

  public get isReelsStopping(): boolean { return this.stopSpinning }

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
      // TODO Randomise the start point by choosing a random start index from the reelItems
      //  then tracking that to manage the reel item queue, throw error if length less than 4
      for (let j = 0; j < this.reelItemCount; j++) {
        // Initialise the item
        reel.items.push({
          item: this.reelItems[i][j],
          position: 25 * pos
        });
        pos = (pos + 1) % 4;
      }
      this.reels.push(reel);
    }
  }

  public startSpin() {
    if (this.spinInterval) return;
    if (this.stopSpinning) return;
    this.startReelCycle();
  }

  public stopSpin() {
    if (!this.spinInterval) return;
    if (this.stopSpinning) return;
    this.stopSpinning = true;
  }

  private startReelCycle() {
    for(const reel of this.reels) {
      reel.status = 'spinning';
      reel.travelSinceStop = undefined;
    }
    this.spinStartTime = Date.now();
    // Record the starting position of each item
    for (const reel of this.reels) {
      for (const item of reel.items) {
        item.startPos = item.position;
      }
    }
    this.spinInterval = setInterval(this.cycleReels.bind(this), this.spinIntervalTime);
  }

  private cycleReels() {
    // Define the base movement of the reel items
    const baseSpinMovement = (Date.now() - this.spinStartTime!) * (this.spinMovementPerSecond / 1000);
    for (const reel of this.reels.filter(r => r.status !== 'stopped')) {
      for (const item of reel.items) {
        item.lastPosition = item.position;
        // Cycle the item back to the start if it reached the end
        // TODO Drop the item type to a queue and pick up the next item
        item.position = (item.startPos! + baseSpinMovement) % 100;
      }
      if (!this.stopSpinning) continue;
      reel.travelSinceStop ??= 0;
      reel.travelSinceStop += this.spinMovementPerSecond;
      if (
        // TODO Get this working with the new setup, perhaps base it on time rather than movement
        // Has travelled far enough
        reel.travelSinceStop > this.minTravelOnStop
        // Just passed a stopping point
        // TODO Make the stopping point be exact and adjust all items accordingly
        && reel.items[0].position % 25 >= 0
        && reel.items[0].position % 25 < 5
        && reel.items[0].lastPosition! % 25 > 20
        && reel.items[0].lastPosition! % 25 < 25
      ) {
        reel.status = 'stopped';
        reel.travelSinceStop = undefined;
        for (const item of reel.items) {
          item.lastPosition = undefined;
          const positionDiff = item.position % 25;
          // Adjust the position to the nearest stop point
          item.position += positionDiff < 12.5 ? -positionDiff : (25 - positionDiff);
        }
      }
    }
    if (this.stopSpinning && this.reels.every(r => r.status === 'stopped')) {
      this.stopSpinning = false;
      if (this.spinInterval) clearInterval(this.spinInterval);
      this.spinInterval = undefined;
      this.spinStartTime = undefined;
    }
  }
}
