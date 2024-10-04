import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-machine-reel-item',
  templateUrl: './reel-item.component.html',
  styleUrl: './reel-item.component.scss'
})
export class ReelItemComponent {
  @Input('type') set type(type: string) {
    if (this.itemTypes[type]) {
      this.item = this.itemTypes[type];
    }
  }
  item: [string, string] = ['', ''];

  private itemTypes: any = {
    'orange': ['reel-item-orange.svg', 'Orange'],
    'grapes': ['reel-item-grapes.svg', 'Grapes'],
    'lemon': ['reel-item-lemon.svg', 'Lemon'],
    'cherries': ['reel-item-cherries.svg', 'Cherries'],
  };
}
