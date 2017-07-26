import { Componet, VMComponet, Browser, Bind } from 'cmpx';
export * from 'cmpx';
export declare abstract class ActionResult {
    readonly $location: ActionLocation;
    abstract onLayout(cb: any): void;
}
export declare class AsyncResult extends ActionResult {
    private callback;
    constructor(callback: (cb: (result: ActionResult | View) => void) => void);
    onLayout(cb: any): void;
}
export declare class ViewResult extends ActionResult {
    private componetDef;
    private p;
    constructor(componetDef: typeof View, p?: Object);
    onLayout(cb: any): void;
}
export declare class RedirectResult extends ActionResult {
    private path;
    constructor(path: string);
    onLayout(cb: any): void;
}
export declare class ContorllerResult extends ActionResult {
    private controllerDef;
    constructor(controllerDef: typeof Controller);
    onLayout(cb: any): void;
}
export declare class WebpackLoaderContorllerResult extends ActionResult {
    constructor(path: string, conctrollerName: string);
    onLayout(cb: any): void;
}
export declare class ActionLocation {
    href: string;
    name: string;
    /**
     * 将query部分转成Object
     * @param url
     * @param defaultValue
     */
    static qureyStringToObject(url: string, defaultValue?: Object): Object;
    /**
     * 将Object部分转成query
     * @param url
     * @param obj
     */
    static qureyStringFromObject(url: string, obj: Object): string;
    /**
     * 获取query项
     * @param url
     * @param name 如果空为全部query
     */
    static getQueryString(url: string, name?: string): string;
    /**
     * 取得hash值, 返回#hash
     * @param url
     */
    static getHash(url: string): string;
    static getUrlPart(url: string): string;
    /**
     * query项
     * @param url
     * @param name
     * @param value
     */
    static setQueryString(url: string, name: string, value: string): string;
    static navigate(href: string, target: string, params?: any[]): void;
    static reload(target: string): void;
    readonly $router: RouterComponet;
    hash: string;
    search: string;
    isForward: boolean;
    constructor(href: string, name?: string, router?: RouterComponet);
    navigate(href: string, target?: string, params?: any[]): void;
    reload(): void;
    private _qureyParams;
    qureyParams(): Object;
    onNavigateBefore(cb: (err?: any) => void): void;
    onNavigate(): void;
}
export declare let VMView: typeof VMComponet;
export declare class View extends Componet {
    readonly $location: ActionLocation;
    readonly $parentView: View;
    readonly $controller: Controller;
    readonly $root: View;
}
/**
 * 注入模块配置信息
 * @param config
 */
export declare function VMAction(path?: string): (target: any, propertyKey: string) => void;
export interface ICtrlConfig {
    include?: any[];
    index?: string;
    location?: typeof ActionLocation;
}
/**
 * 注入模块配置信息
 * @param config
 */
export declare function VMController(config?: ICtrlConfig): (constructor: typeof Controller) => void;
export declare class Controller {
    readonly $parent: Controller;
}
export declare class RouterComponet extends Componet {
    render: any;
    path: string;
    params: any[];
    name: string;
    constructor();
    navigate(path: string, params?: any[]): void;
    reload(): void;
    private _path;
    private updateRender(callback);
    onUpdateBefore(cb: any): void;
    onInit(cb: any): void;
    onDispose(): void;
}
export declare class MvcBrowser extends Browser {
    bootFromController(controllerDef: typeof Controller, appView: typeof View): void;
}
export declare class RouterLink extends Bind {
    constructor(element: HTMLElement);
    link: string;
    targetName: string;
    click(): void;
}
