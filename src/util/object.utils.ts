/**
 * Util методы по работе с JS/TS объектами
 */
export class ObjectUtils {

  /**
   * Deep copy JS/TS объекта
   * @param obj исходный объект
   * @param withFunction
   * @returns {any} полная копия исходного объекта
   */
  public static deepCopy<T>(obj: T, withFunction = false): T {
    if (!obj) {
      return obj;
    }

    try {

      if (withFunction) {
        return JSON.parse(JSON.stringify(obj, function(key, val) {
          if (typeof val === 'function') {
            return val + ''; // implicitly `toString` it
          }
          return val;
        }));
      }

      return JSON.parse(JSON.stringify(obj));
    } catch (err) {
      console.error('Error parsing object', obj, err);
      throw new Error(`Error parsing object ${obj} ${err}`);
    }
  }

  // from https://stackoverflow.com/a/16788517
  public static objectEquals(x: any, y: any): boolean {

    if (x === null || x === undefined || y === null || y === undefined) {
      return x === y;
    }
    // after this just checking type of one would be enough
    // check by constructor can be false positive in some cases.
    // E.g. created by JSON.parse(someString) and by "let a = new SomeClass()"
    // if (x.constructor !== y.constructor) {
    //   return false;
    // }
    // if they are functions, they should exactly refer to same one (because of closures)
    if (x instanceof Function) {
      return x === y;
    }
    // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
    if (x instanceof RegExp) {
      return x === y;
    }
    if (x === y || x.valueOf() === y.valueOf()) {
      return true;
    }
    if (Array.isArray(x) && x.length !== y.length) {
      return false;
    }

    // if they are dates, they must had equal valueOf
    if (x instanceof Date) {
      return false;
    }

    // if they are strictly equal, they both need to be object at least
    if (!(x instanceof Object)) {
      return false;
    }
    if (!(y instanceof Object)) {
      return false;
    }

    // recursive object equality check
    const p = Object.keys(x);
    return Object.keys(y).every(function (i) {
        return p.indexOf(i) !== -1;
      }) &&
      p.every(function (i) {
        return ObjectUtils.objectEquals(x[i], y[i]);
      });
  }

  /**
   * Заменить все поля в одном объекте - полями в другом с deepCopy. Аналогия $.extend
   * Используется там, где невозмоно использовать immutable структуры данных и необходимо сохранить ссылку у объекта
   * @param from откуда копировать
   * @param to куда копировать
   */
  public static replaceObject(from: any, to: any) {

    if (to instanceof Array) {
        (to as Array<any>).length = 0;
    }
    //
    // if (from instanceof Array) {
    //   if (from.length === 0) {
    //     to.length = 0;
    //     return;
    //   }
    // }

    for (const i of Object.keys(to)) {
      delete to[i];
       // = undefined;
    }

    for (const i in from) {
      if (i === 'constructor') {
        continue;
      }

      to[i] = ObjectUtils.deepCopy(from[i]);
    }
  }

  public static isArray(value: any): boolean {
    return value instanceof Array;
  }

}
