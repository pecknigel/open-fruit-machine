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
  startPos?: number
};
// [reel][reel items][reel item data]
type Reels = Reel[];

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

  public startSpin() {
    if (this.spinInterval) return;
    if (this.stopSpinning) return;
    this.startReelCycle();
    for(const reel of this.reels) {
      reel.status = 'spinning';
      reel.travelSinceStop = undefined;
    }
  }

  public stopSpin() {
    if (!this.spinInterval) return;
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
      // TODO Randomise the start point by choosing a random start index from the reelItems
      //  then tracking that to manage the reel item queue, throw error if length less than 4
      for (let j = 0; j < this.reelItemCount; j++) {
        // Initialise the item
        reel.items.push({
          item: this.reelItems[i][j],
          // TODO Review discrepancy between start position and stop position
          position: 25 * pos
        });
        pos = (pos + 1) % 4;
      }
      this.reels.push(reel);
    }
  }

  private startReelCycle() {
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
    let allStopped = true;
    const baseSpinMovement = (Date.now() - this.spinStartTime!) * (this.spinMovementPerSecond / 1000);
    for (const reel of this.reels) {
      // Handle stopping
      if (this.stopSpinning) {
        // Ignore this reel if it's already stopped
        if (reel.status === 'stopped') continue;
        // If the reel hasn't started stopping, save the position it started stopping
        reel.travelSinceStop ??= 0;
        reel.travelSinceStop += this.spinMovementPerSecond;
        if (
          // TODO Get this working with the new setup, perhaps base it on time rather than movement
          reel.travelSinceStop > this.minTravelOnStop
          // Is at a stopping point
          // TODO Make the stopping point be exact and adjust all items accordingly
          && reel.items[0].position % 25 > -1
          && reel.items[0].position % 25 < 1
        ) {
          reel.status = 'stopped';
          continue;
        }
      }
      // Track when all stopped
      allStopped = false;
      // Process each item on the reel
      for (const item of reel.items) {
        // Set the position of the item
        // Cycle the item back to the start if it reached the end
        // TODO Drop the item type to a queue and pick up the next item
        item.position = (item.startPos! + baseSpinMovement) % 100;
      }
    }
    // Clear interval if all reels have stopped
    if (allStopped) {
      this.endReelCycle();
    }
  }

  private endReelCycle() {
    this.stopSpinning = false;
    if (this.spinInterval) clearInterval(this.spinInterval);
    this.spinInterval = undefined;
    this.spinStartTime = undefined;
  }
}
