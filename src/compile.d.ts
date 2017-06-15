import { ICreateElementAttr } from './htmlDef';
import { Componet } from './componet';
export interface IVMConfig {
    name: string;
    tmpl?: string | Function;
    tmplUrl?: string | Function;
    style?: string;
    styleUrl?: string;
}
/**
 * 注入组件配置信息
 * @param config
 */
export declare function VM(vm: IVMConfig): (constructor: Function) => void;
/**
 * 引用模板变量$var
 * @param name 变量名称，未指定为属性名称
 */
export declare function viewvar(name?: string): (componet: Componet, propKey: string) => void;
export interface ISubscribeEvent {
    componet: Componet;
    param?: any;
}
export interface ISubscribeParam {
    init?: (p: ISubscribeEvent) => void;
    update?: (p: ISubscribeEvent) => void;
    updateAfter?: (p: ISubscribeEvent) => void;
    insertDoc?: (p: ISubscribeEvent) => void;
    ready?: (p: ISubscribeEvent) => void;
    remove?: (p: ISubscribeEvent) => void;
    isRemove?: boolean;
}
export declare class CompileSubject {
    private datas;
    constructor(subject?: CompileSubject, exclude?: {
        [type: string]: boolean;
    });
    subscribe(p: ISubscribeParam): ISubscribeParam;
    unSubscribe(p: ISubscribeParam): void;
    private linkParam;
    private subject;
    unLinkSubject(): CompileSubject;
    isInit: boolean;
    lastInitP: any;
    init(p: ISubscribeEvent): void;
    update(p: ISubscribeEvent): void;
    private updateAfter(p);
    insertDoc(p: ISubscribeEvent): void;
    ready(p: ISubscribeEvent): void;
    isRemove: boolean;
    remove(p: ISubscribeEvent): void;
}
export declare class CompileRender {
    /**
     * 编译的结果，Function
     */
    readonly contextFn: Function;
    private componetDef;
    private param;
    /**
     *
     * @param tmpl html模板文本
     * @param componetDef 组件定义类，如果没有传为临时模板
     */
    constructor(context: any, componetDef?: Componet | Function, param?: Object);
    /**
     * 编译并插入到document
     * @param refElement 在element之后插入内容
     * @param parentComponet 父组件
     */
    complie(refNode: Node, parentComponet?: Componet, subject?: CompileSubject, contextFn?: (component: Componet, element: HTMLElement, subject: CompileSubject) => void, subjectExclude?: {
        [type: string]: boolean;
    }): {
        newSubject: CompileSubject;
        refComponet: Componet;
    };
}
export declare class Compile {
    /**
     * 编译器启动，用于htmlDef配置后
     */
    static startUp(): void;
    static loadTmplCfg(loadTmplFn: (url: string, cb: (tmpl: string | Function) => void) => void): void;
    static createComponet(name: string, componet: Componet, parentElement: HTMLElement, subject: CompileSubject, contextFn: (component: Componet, element: HTMLElement, subject: CompileSubject) => void): void;
    static setAttributeCP(element: HTMLElement, name: string, content: any, componet: Componet, subject: CompileSubject): void;
    static createElement(name: string, attrs: ICreateElementAttr[], componet: Componet, parentElement: HTMLElement, subject: CompileSubject, contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => void, content?: string): void;
    static createTextNode(content: any, componet: Componet, parentElement: HTMLElement, subject: CompileSubject): Text;
    static setAttribute(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject): void;
    static forRender(dataFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, eachFn: (item: any, count: number, index: number, componet: Componet, element: HTMLElement, subject: CompileSubject) => any, componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject): void;
    static ifRender(ifFun: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, trueFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, falseFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject): void;
    static tmplRender(id: any, componet: Componet, parentElement: HTMLElement, subject: CompileSubject, contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject, param: any) => void): void;
    static includeRender(context: any, componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject, param: any): void;
    static renderComponet(componetDef: any, refNode: Node, complieEnd?: (newSubject: CompileSubject, refComponet: Componet) => void, parentComponet?: Componet, subject?: CompileSubject, contextFn?: (component: Componet, element: HTMLElement, subject: CompileSubject) => void): void;
}
