export declare class CmpxLib {
    static stringEmpty: string;
    static noop: () => void;
    static hasOwnProp(obj: any, prop: string): any;
    static trace(e: any): void;
    static isType(typename: string, value: any): boolean;
    static toStr(p: any): string;
    static isUndefined(obj: any): boolean;
    static isNull(obj: any): boolean;
    static isBoolean(obj: any): boolean;
    static isNullEmpty(s: any): boolean;
    static isFunction(fun: any): boolean;
    static isNumeric(n: any): boolean;
    static isString(obj: any): boolean;
    static isObject(obj: any): boolean;
    static isPlainObject(obj: any): any;
    static encodeHtml(html: string): string;
    static decodeHtml(html: string): string;
    static isArray(value: any): boolean;
    static isWindow(obj: any): boolean;
    static isElement(obj: any): boolean;
    static trim(str: string, newline?: boolean): string;
    static replaceAll(s: string, str: string, repl: string, flags?: string): string;
    static inArray(list: Array<any>, p: any, thisArg?: any): number;
    static toArray(p: any, start?: number, count?: number): Array<any>;
    static arrayToObject<T>(array: Array<T>, fieldName: string): {
        [name: string]: T;
    };
    static each(list: any, fn: (item: any, idx: number) => any, thisArg?: any): void;
    static eachProp(obj: any, callback: (item: any, name: string) => void, thisArg?: any): void;
    static extend(obj: Object, ...args: Object[]): Object;
    static makeAutoId(): string;
    /**
     * 是否类
     * @param p 参数
     * @param cls 类
     */
    static isClass(p: any, cls: any): boolean;
}
