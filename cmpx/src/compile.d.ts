import { ICreateElementAttr } from './htmlDef';
import { Componet } from './componet';
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
    ready?: (p: ISubscribeEvent) => void;
    remove?: (p: ISubscribeEvent) => void;
    detach?: (p: ISubscribeEvent) => void;
}
export declare class CompileSubject {
    constructor(subject?: CompileSubject, exclude?: {
        [type: string]: boolean;
    });
    private subscribeIn(name, p);
    /**
     * 观察
     * @param p 观察内容
     */
    subscribe(p: ISubscribeParam): ISubscribeParam;
    private unSubscribeIn(name, p);
    /**
     * 解除观察
     * @param p 观察内容
     */
    unSubscribe(p: ISubscribeParam): void;
    private linkParam;
    private subject;
    /**
     * 解除观察Subject
     */
    unLinkSubject(): CompileSubject;
    /**
     * 是否已经初始化
     */
    isInit: boolean;
    private initList;
    /**
     * 发送初始化通知
     * @param p 发送事件参数
     */
    init(p: ISubscribeEvent): void;
    private updateList;
    /**
     * 发送更新通知
     * @param p 发送事件参数
     */
    update(p: ISubscribeEvent): void;
    /**
     * 是否已分离
     */
    isDetach: boolean;
    private detachList;
    /**
     * 发送分离通知，不删除
     * @param p 发送事件参数
     */
    detach(p: ISubscribeEvent): void;
    /**
     * 是否已经准备
     */
    isReady: boolean;
    private readyList;
    /**
     * 发送准备通知
     * @param p 发送事件参数
     */
    ready(p: ISubscribeEvent): void;
    /**
     * 是否已经删除
     */
    isRemove: boolean;
    private removeList;
    /**
     * 发送删除通知
     * @param p 发送事件参数
     */
    remove(p: ISubscribeEvent): void;
    private clear();
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
    static loadTmplCfg(loadTmplFn: (url: string, cb: (tmpl: string | Function) => void) => void): void;
    static createElementEx(name: string, attrs: ICreateElementAttr[], componet: Componet, parentElement: HTMLElement, subject: CompileSubject, contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => void, content?: string): void;
    static createElement(name: string, attrs: ICreateElementAttr[], componet: Componet, parentElement: HTMLElement, subject: CompileSubject, contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean) => void, content?: string): void;
    static createComponet(name: string, attrs: ICreateElementAttr[], componet: Componet, parentElement: HTMLElement, subject: CompileSubject, contextFn: (component: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean) => void): void;
    static setViewvar(addFn: () => void, removeFn: () => void, componet: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean): void;
    static setAttributeEx(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject, isComponet: boolean): void;
    static setAttributeCP(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject): void;
    static createTextNode(content: any, componet: Componet, parentElement: HTMLElement, subject: CompileSubject): Text;
    static setAttribute(element: HTMLElement, name: string, subName: string, content: any, componet: Componet, subject: CompileSubject): void;
    static forRender(dataFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, eachFn: (item: any, count: number, index: number, componet: Componet, element: HTMLElement, subject: CompileSubject) => any, componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject, syncFn: (item: any, count: number, index: number, newList: any[]) => number): void;
    static updateRender(fn: Function, componet: Componet, element: HTMLElement, subject: CompileSubject): void;
    static ifRender(ifFun: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, trueFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, falseFn: (componet: Componet, element: HTMLElement, subject: CompileSubject) => any, componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject, isX: boolean): void;
    static tmplRender(id: any, componet: Componet, parentElement: HTMLElement, subject: CompileSubject, contextFn: (componet: Componet, element: HTMLElement, subject: CompileSubject, param: any) => void): void;
    static includeRender(context: any, contextFn: Function, componet: Componet, parentElement: HTMLElement, insertTemp: boolean, subject: CompileSubject, param: Function): void;
    static renderComponet(componetDef: any, refNode: Node, attrs: ICreateElementAttr[], complieEnd?: (newSubject: CompileSubject, refComponet: Componet) => void, parentComponet?: Componet, subject?: CompileSubject, contextFn?: (component: Componet, element: HTMLElement, subject: CompileSubject, isComponet: boolean) => void): void;
}
