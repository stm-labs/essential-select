export class EssentialSelectFilteredItem {

  options: any;

  originalObject: any;

  textToShow: string;

}

export interface EssentialsSelectFilter {

  shouldByShown(requestedText: string, item: EssentialSelectFilteredItem, currentValue: any, userHasInputTextToSearchBeforeSelect: boolean): boolean;

}
