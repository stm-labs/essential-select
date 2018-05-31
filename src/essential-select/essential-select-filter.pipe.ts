import { Pipe, PipeTransform } from '@angular/core';
import {EssentialSelectFilteredItem, EssentialsSelectFilter} from './filters/filter.models';
import {EssentialSelectComponent} from './essential-select.component';

@Pipe({
  name: 'essentialSelectFilter'
})
export class EssentialSelectFilterPipe implements PipeTransform {

  /**
   *
   * @param {Array<any>} value - all options
   * @param userSearchText user text entered in input
   * @param {EssentialsSelectFilter} args2 user defined (or by default) predicate
   * @param {boolean} useMultiSelect
   * @param essentialSelectComponent
   * @param userHasInputTextToSearchBeforeSelect
   * @returns options to show
   */
  transform(value: Array<any>, userSearchText, args2: EssentialsSelectFilter, useMultiSelect: boolean, essentialSelectComponent: EssentialSelectComponent,
            userHasInputTextToSearchBeforeSelect: boolean): any {

    return value.filter(x => {
      const item = new EssentialSelectFilteredItem();
      item.originalObject = x;

      // dynamically pass text function
      item.textToShow = essentialSelectComponent.printItemValue(item.originalObject);
      // TODO: multiselect breaks
      return args2.shouldByShown(userSearchText, item, essentialSelectComponent._internalValue, userHasInputTextToSearchBeforeSelect);
    });
  }

}
