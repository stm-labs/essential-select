import {Pipe, PipeTransform} from '@angular/core';
import {EssentialSelectComponent} from './essential-select.component';

@Pipe({
  name: 'essentialSelectTruncate'
})
export class EssentialSelectTruncatePipe implements PipeTransform {
  transform(value: string, es: EssentialSelectComponent): string | undefined {
    if (!value) {
      return undefined;
    }
    let answer: string = value;
    es._findPlaceholderLength(answer);

    if (es._isOpenEditable() && es.searchable) {
      return value;
    }

    if (value.length > es.limit) {
      answer = value.substr(0, es.limit - 3);
      answer += '...';
    }
    return answer;
  }
}
