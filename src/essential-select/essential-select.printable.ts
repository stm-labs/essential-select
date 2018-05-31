/**
 * Custom setting for EssentialSelect component.
 * You can dynamically change some behaviour
 */
export interface EssentialSelectOptions<T> {

  /**
   * Print the row value
   * @param {T} value
   * @returns {string}
   */
  printValue(value: T): string | EssentialSelectRowOptions;

  /**
   * Print the row value when dialog is open
   * @param {T} value
   * @returns {string}
   */
  printValueOnOpen?(value: T): string | EssentialSelectRowOptions;

  /**
   * Print additional lines for every option row with small font
   * @param {T} value
   * @returns {string}
   */
  printAdditionalLinesOnOpen?(value: T): string[] | EssentialSelectRowOptions;

  /**
   * Allow to o select some value
   * @param value value that user try to select
   * @param model current state of select component - current selected elements
   */
  allowToSelectValue?(value: T, model: any): boolean;

  /**
   *
   * @param {T} value that user try to deselect
   * @param model current state of select component - current selected elements
   * @returns {boolean} Should it be allowed to deselect some selected previously value
   */
  allowToDeselectValue?(value: T, model: any): boolean;

}

/**
 * Option for print the row
 */
export class EssentialSelectRowOptions {

  // just for normal angular AOT/ TS instanceof
  // tslint:disable-next-line
  private type = 'EssentialSelectRowOptions';

  /**
   * Classes which will be applied at the left part of the next in the row.
   * You can put any global CSS classes such as icons, margins etc
   * @type {any[]}
   */
  rowClasses: string[] = [];

    /**
     * Css classes for entire row
     * @type {any[]}
     */
  entireRowClasses: string[] = [];

  /**
   * Text to show. The same text as you pass to printValue(value: string)
   */
  text: string;

}
