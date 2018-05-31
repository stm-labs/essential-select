import {EssentialSelectRowOptions, EssentialSelectOptions} from 'angular-essential-select';
import {Country} from './es.models';

export class CountryPrintable implements EssentialSelectOptions<Country> {

  printValue(value: Country): string | EssentialSelectRowOptions {

    const o = new EssentialSelectRowOptions();
    o.text = value.name;

    if (value.code === 'RU') {
      o.entireRowClasses.push('disabled-css');
    }

    return o;
  }

  allowToSelectValue(value: Country, model: any): boolean {
    if (!value) {
      return true;
    }
    if (value.code === 'RU') {
      alert('Ru can not be selected');
      return false;
    }
    return true;
  }

}
