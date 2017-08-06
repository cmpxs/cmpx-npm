import { ICreateElementAttr } from './htmlDef';
import { Componet } from './componet';
import { CompileSubject } from './compileSubject';
import { Bind } from './bind';
export interface IVMBindConfig {
    name: string;
}
/**
 * 注入组件配置信息
 * @param config
 */
export declare function VMBind(config: IVMBindConfig): (constructor: typeof Bind) => void;
export declare class Filter {
    result: any;
    valuePre: any;
    onFilter(value: any, param: any, cb: (result: any) => void, componet?: Componet, element?: HTMLElement): void;
}
export interface IMVFilterConfig {
    name: string;
    /**
     * 无论原值是否有改变就过滤，默认true
     */
    alway?: boolean;
}
/**
 * 注入组件配置信息
 * @param config
 */
export declare function VMFilter(config: IMVFilterConfig): (constructor: typeof Filter) => void;
/**
 * 引用模板事件
 * @param name 变量名称，未指定为属性名称
 */
export declare function VMEvent(name?: string): (bind: Bind, propKey: string) => void;
/**
 * 引用模板变量attr
 * @param name 变量名称，未指定为属性名称
 */
export declare function VMAttr(name?: string): (target: any, propKey: string) => void;
/**
 * 引用模板变量watch
 * @param p
 */
export declare function VMWatch(...args: any[]): (target: any, propKey: string) => void;
export interface IVMContext {
    name: string;
    type: string;
    [prop: string]: any;
}
export declare class VMManager {
    static parent: (target: any, context: IVMContext) => any;
    /**
     * VM 内容
     * @param target
     * @param name
     * @param context
     * @param global 是否全局用，否则用于实体化个体上，默认true
     */
    static setVM(target: any, name: string, context: any, global?: boolean): any;
    /**
     * 获取MV内容
     * @param target
     * @param name
     * @param defaultP 如果不存在时，此为默认内容
     */
    static getVM(target: any, name: string, defaultP?: any, global?: boolean): any;
    static include(target: any, context: IVMContext, include: any[], parent?: any): any;
    private static getContext(target);
    private static getContextEx(target, type, name);
    static getContextByType(target: any, type: string, name?: string): IVMContext;
    static getComponet(target: any, name?: string): IVMContext;
    static getBind(target: any, name?: string): IVMContext;
    static getFilter(target: any, name?: string): IVMContext;
    /**
     * 配置
     * @param target
     * @param config
     */
    static setConfig(target: any, config: any): any;
    static getConfig(target: any): any;
    static getTarget(p: any, t: any): any;
}
export interface IVMConfig {
    name: string;
    include?: any[];
    tmpl?: string | Function;
    tmplUrl?: string | Function;
    style?: string | Function;
    styleUrl?: string | Function;
}
/**
 * 注入组件配置信息
 * @param config
 */
export declare function VMComponet(config: IVMConfig): (constructor: Function) => void;
/**
 * 引用模板变量$var
 * @param name 变量名称，未指定为属性名称
 */
export declare function VMVar(name?: string): (componet: Componet, propKey: string) => void;
export declare class CompileRender {
    /**
     * 编译的结果，Function
     */
    readonly contextFn: Function;
    private componetDef;
    private param;
    /**
     *
     * @param context (string | Function | Componet) html模板文本、编译后的function或Componet
     * @param componetDef 组件定义类，如果没有传为临时模板
     */
    constructor(context: any, componetDef?: Componet | Function, param?: Object);
    /**
     * 编译并插入到document
     * @param refElement 在element之后插入内容
     * @param parentComponet 父组件
     */
    complie(refNode: Node, attrs: ICreateElementAttr[], parentComponet?: Componet, subject?: CompileSubject, contextFn?: (component: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean) => void, subjectExclude?: {
        [type: string]: boolean;
    }, param?: Function): {
        newSubject: CompileSubject;
        refComponet: Componet;
    };
}
export declare class Compile {
    /**
     * 编译器启动，用于htmlDef配置后
     */
    static startUp(): void;
    static filter(componet: Componet, element: HTMLElement, subject: CompileSubject, filters: any[], context: () => any): (cb: (result: any) => void) => void;
    static mergerFilter(componet: Componet, filters: any[], cb: () => void): void;
    static loadTmplCfg(loadTmplFn: (url: string, cb: (tmpl: string | Function) => void) => void): void;
    static createElementEx(name: string, attrs: ICreateElementAttr[], componet: Componet, parentElement: HTMLElement, subject: CompileSubject, contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => void, content?: string, bindAttrs?: string): void;
    static createElement(name: string, attrs: ICreateElementAttr[], componet: Componet, parentElement: HTMLElement, subject: CompileSubject, contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean, binds: any) => void, content?: string, bindAttrs?: string): void;
    static createComponet(name: string, attrs: ICreateElementAttr[], componet: Componet, parentElement: HTMLElement, subject: CompileSubject, contextFn: (component: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean) => void): void;
    static setViewvar(addFn: () => void, removeFn: () => void, componet: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean): void;
    static setAttributeEx(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject, isComponet: boolean, binds: any): void;
    static setAttributeCP(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject, isComponet: boolean): void;
    static createTextNode(content: any, componet: Componet, parentElement: HTMLElement, subject: CompileSubject): Text;
    static setAttribute(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject, isComponet: boolean): void;
    static setBindAttribute(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject, isComponet: boolean, binds: any): void;
    private static setBind(element, componet, subject, bind);
    static forRender(dataFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, eachFn: (item: any, count: number, index: number, componet: Componet, element: HTMLElement, subject: CompileSubject) => any, componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject, syncFn: (item: any, count: number, index: number, newList: any[]) => number): void;
    static updateRender(fn: Function, componet: Componet, element: HTMLElement, subject: CompileSubject): void;
    static ifRender(ifFun: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, trueFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, falseFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject, isX: boolean): void;
    static tmplRender(id: any, componet: Componet, parentElement: HTMLElement, subject: CompileSubject, contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject, param: any) => void): void;
    static includeRender(context: any, contextFn: Function, componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject, param: Function): void;
    static renderComponet(componetDef: Componet | typeof Componet, refNode: Node, attrs: ICreateElementAttr[], complieEnd?: (newSubject: CompileSubject, refComponet: Componet) => void, parentComponet?: Componet, subject?: CompileSubject, contextFn?: (component: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean) => void): void;
}
