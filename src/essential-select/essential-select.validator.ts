
/**
 * Custom function to validate value returning from EssentialSelectComponent
 * @param {object | string | number} value you bind with component
 * @return {boolean} true - value passed the test
 * @return {boolean} false - value didn't pass the test
 */
export type ValidateEssentialSelectFn = (value: object | string | number) => boolean;
