import {Component, OnInit} from '@angular/core';

type Reel = {
  status: 'spinning' | 'stopped',
  travelSinceStop?: number,
  minTravelOnStop?: number,
  items: ReelItemData[]
};
type ReelItem = 'orange' | 'grapes' | 'lemon' | 'cherries';
type ReelItemData = {
  item: ReelItem,
  position: number,
  lastPosition?: number,
  startPos?: number
};

// TODO: Add an input for controlling the spin speed
// TODO: Set up a spin button that starts and stops the reels
// TODO: Create a debug representation of the reel item queues
// TODO: Add more items to the reels
// TODO: Slow reels down before stopping
// TODO: Randomise the length of each spin
// TODO: Update random min travel generation so that the number will tend to be larger or smaller based on a curve
// TODO: Support slim screens

@Component({
  selector: 'app-machine-reels',
  templateUrl: './reels.component.html',
  styleUrl: './reels.component.scss'
})
export class ReelsComponent implements OnInit {
  protected showDebug: boolean = true;

  protected spinInterval?: any;
  public get isReelsSpinning(): boolean { return !!this.spinInterval }

  protected readonly spinIntervalMillis: number = 10;
  private readonly spinMovementPerCycle = 0.15;

  protected spinStartTime?: number;

  protected stopSpinning: boolean = false;
  public get isReelsStopping(): boolean { return this.stopSpinning }

  protected minTravelOnStop: [number, number] = [10, 40];

  public reelItemQueuePointers: number[] = [0, 0, 0];

  private readonly reelItemQueues: ReelItem[][] = [
    ['orange', 'grapes', 'lemon', 'cherries', 'cherries'],
    ['lemon', 'cherries', 'orange', 'cherries', 'grapes'],
    ['cherries', 'lemon', 'grapes', 'cherries', 'orange']
  ];

  // TODO Stop this from running other than when the queue pointers change
  // Render the queues with the next item at the start
  protected renderReelItemQueue(): ReelItem[][] {
    const reelItemQueues: ReelItem[][] = [];
    for (const [i, queue] of this.reelItemQueues.entries()) {
      reelItemQueues[i] = [];
      let j = this.reelItemQueuePointers[i] + 1;
      if (j > queue.length - 1) j = 0;
      while (reelItemQueues[i].length <= queue.length) {
        reelItemQueues[i].push(queue[j]);
        j--;
        if (j < 0) j = queue.length - 1;
      }
    }
    return reelItemQueues;
  }

  private getNextReelItem(reelIndex: number): ReelItem {
    this.reelItemQueuePointers[reelIndex] = (this.reelItemQueuePointers[reelIndex] + 1) % this.reelItemQueues[reelIndex].length;
    if (reelIndex === 1) console.log('Changed Item', reelIndex, this.reelItemQueuePointers[reelIndex]);
    return this.reelItemQueues[reelIndex][this.reelItemQueuePointers[reelIndex]];
  }

  protected reels: Reel[] = [];

  ngOnInit() {
    this.initialiseReels();
  }

  private initialiseReels() {
    for (let i = 0; i < 3; i++) {
      this.reelItemQueuePointers[i] = Math.floor(Math.random() * this.reelItemQueues[i].length);
    }
    for (let i = 0; i < 3; i++) {
      const items = [];
      for (let j = 0; j < 4; j++) {
        items.push({
          item: this.getNextReelItem(i),
          position: j * 25
        });
      }
      this.reels.push({ status: 'stopped', items });
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
    for(const reel of this.reels) {
      reel.travelSinceStop = 0;
      reel.minTravelOnStop = this.generateRandomMinTravelOnStop();
    }
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
    this.spinInterval = setInterval(this.cycleReels.bind(this), this.spinIntervalMillis);
  }

  private cycleReels() {
    // Define the base movement of the reel items
    const baseSpinMovement = (Date.now() - this.spinStartTime!) * this.spinMovementPerCycle;
    for (const [index, reel] of this.reels.entries()) {
      if (reel.status === 'stopped') continue;
      for (const item of reel.items) {
        item.lastPosition = item.position;
        item.position = (item.startPos! + baseSpinMovement) % 100;
        if (item.lastPosition > item.position) item.item = this.getNextReelItem(index);
      }
      if (!this.stopSpinning) continue;
      reel.travelSinceStop! += this.spinMovementPerCycle;
      if (
        // TODO Get this working with the new setup, perhaps base it on time rather than movement
        // Has travelled far enough
        reel.travelSinceStop! > reel.minTravelOnStop!
        // Just passed a stopping point
        && reel.items[0].position % 25 >= 0
        && reel.items[0].position % 25 < 5
        && reel.items[0].lastPosition! % 25 > 20
        && reel.items[0].lastPosition! % 25 < 25
      ) {
        reel.status = 'stopped';
        reel.travelSinceStop = undefined;
        reel.minTravelOnStop = undefined;
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

  private generateRandomMinTravelOnStop() {
    return Math.floor(Math.random() * (this.minTravelOnStop[1] - this.minTravelOnStop[0] + 1) + this.minTravelOnStop[0]);
  }
}
