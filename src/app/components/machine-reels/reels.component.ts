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
type Reels = Reel[];

// TODO: Add more items to the reels
// TODO: Slow reels down before stopping
// TODO: Randomise the length of each spin
// TODO: Update random min travel generation so that the number will tend to be larger or smaller based on a curve

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
  protected minTravelOnStop: [number, number] = [10000, 40000];

  private readonly spinMovementPerSecond = 100;

  private reelItemPointers: number[] = [0, 0, 0];

  private readonly reelItems: ReelItem[][] = [
    ['orange', 'grapes', 'lemon', 'cherries', 'cherries'],
    ['lemon', 'cherries', 'orange', 'cherries', 'grapes'],
    ['cherries', 'lemon', 'grapes', 'cherries', 'orange']
  ];

  private getNextReelItem(reelIndex: number): ReelItem {
    const item = this.reelItems[reelIndex][this.reelItemPointers[reelIndex]];
    this.reelItemPointers[reelIndex] = (this.reelItemPointers[reelIndex] + 1) % this.reelItemCount;
    return item;
  }

  protected reels: Reels = [];

  private readonly reelCount = 3;
  private readonly reelItemCount = 4;

  ngOnInit() {
    this.initialiseReels();
  }

  public get isReelsSpinning(): boolean { return !!this.spinInterval }

  public get isReelsStopping(): boolean { return this.stopSpinning }

  private initialiseReels() {
    for (let i = 0; i < this.reelCount; i++) {
      this.reelItemPointers[i] = Math.floor(Math.random() * 4);
    }
    for (let i = 0; i < this.reelCount; i++) {
      const items = [];
      for (let j = 0; j < this.reelItemCount; j++) {
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
  }

  private startReelCycle() {
    for(const reel of this.reels) {
      reel.status = 'spinning';
      reel.travelSinceStop = undefined;
      reel.minTravelOnStop = this.generateRandomMinTravelOnStop();
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

  private generateRandomMinTravelOnStop() {
    return Math.floor(Math.random() * (this.minTravelOnStop[1] - this.minTravelOnStop[0] + 1) + this.minTravelOnStop[0]);
  }

  private cycleReels() {
    // Define the base movement of the reel items
    const baseSpinMovement = (Date.now() - this.spinStartTime!) * (this.spinMovementPerSecond / 1000);
    for (const [index, reel] of this.reels.entries()) {
      if (reel.status === 'stopped') continue;
      for (const item of reel.items) {
        item.lastPosition = item.position;
        item.position = (item.startPos! + baseSpinMovement) % 100;
        item.item = this.getNextReelItem(index);
      }
      if (!this.stopSpinning) continue;
      reel.travelSinceStop ??= 0;
      reel.travelSinceStop += this.spinMovementPerSecond;
      if (
        // TODO Get this working with the new setup, perhaps base it on time rather than movement
        // Has travelled far enough
        reel.travelSinceStop > reel.minTravelOnStop!
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
}
