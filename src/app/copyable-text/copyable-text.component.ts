import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-copyable-text',
  templateUrl: './copyable-text.component.html',
  styleUrls: ['./copyable-text.component.scss']
})
export class CopyableTextComponent implements OnInit {

  @Input("text") text: string;

  constructor() { }

  ngOnInit(): void {
  }

  copy(textInput: HTMLInputElement) {
    textInput.select();
    document.execCommand('copy');
  }

}
