import {Component, ElementRef, ViewChild} from '@angular/core';

// TODO Make the button press down when used

@Component({
  selector: 'app-machine',
  templateUrl: './machine.component.html',
  styleUrl: './machine.component.scss'
})
export class MachineComponent {
  @ViewChild('reelsComponent') reelsComponent?: ElementRef;
}
