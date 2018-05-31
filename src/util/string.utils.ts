/**
 * Util методы по работе с JS/TS String
 */
export class StringUtils {

    /**
     * Проверить строку на пустоту
     * @param {string} str строка
     * @returns {boolean} true - если строка пустая, false - если нет
     */
    public static isEmpty(str: string): boolean {
        return !str || str === '';
    }

    public static isString(item: any): boolean {
        return typeof item === 'string';
    }

}
