import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-machine-reel-item',
  templateUrl: './reel-item.component.html',
  styleUrl: './reel-item.component.scss'
})
export class ReelItemComponent implements OnInit {
  @Input('type') type: string = '';
  item: [string, string] = ['', ''];

  private itemTypes: any = {
    'orange': ['reel-item-orange.svg', 'Orange'],
    'grapes': ['reel-item-grapes.svg', 'Grapes'],
    'lemon': ['reel-item-lemon.svg', 'Lemon'],
  };

  ngOnInit() {
    if (this.itemTypes[this.type]) {
      this.item = this.itemTypes[this.type];
    }
  }
}
