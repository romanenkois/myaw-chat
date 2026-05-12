import { Component } from '@angular/core';

@Component({
  selector: 'myaw-button',
  template: `
    <button class="myaw-button">
      <ng-content></ng-content>
    </button>
  // `,
  // styles: [''],
})
export class MyawButtonComponent {}
