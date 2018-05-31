import {EssentialSelectFilteredItem, EssentialsSelectFilter} from './filter.models';

export class TextToShowEssentialFilter implements EssentialsSelectFilter {

    shouldByShown(requestedText: string, item: EssentialSelectFilteredItem, currentValue: any, userHasInputTextToSearchBeforeSelect: boolean): boolean {
        if (userHasInputTextToSearchBeforeSelect === false || requestedText == null) {
            return true;
        }

        // strip special characters like ( ) in search string
        let needleRegExp = new RegExp(requestedText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
        return needleRegExp.test(item.textToShow);
    }

}
