import {Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {EssentialSelectComponent} from 'angular-essential-select';

@Component({
  selector: 'app-esform',
  templateUrl: './esform.component.html',
  styleUrls: ['./esform.component.scss']
})
export class EsformComponent implements OnInit {

  public selectOptions2: string[] = [
    'option 1', 'option 2', 'another option', 'somethin else', 'and another one', 'finally last option',
    'hurr durr', 'herp derp', 'hurrrr', 'durrrr', 'derp derp'
  ];

  @ViewChildren('selectes') private selected: ElementRef;

  @ViewChildren('esSelects') validator_Selects: QueryList<EssentialSelectComponent>;

  isRequired = false;

  superValueVal: string;

  changeRequired() {
    this.isRequired = !this.isRequired;
  }

  constructor() { }

  ngOnInit() {
  }

  doSubmit() {
    console.log('submit');
    alert('submit');
    this.validator_Selects.forEach(x => x.markTouched());
  }

  esNgForm = `
  <form #form="ngForm">
      <essential-select name="counter"
        ngModel [options]="selectOptions2">
      </essential-select>
  </form>`;

}
