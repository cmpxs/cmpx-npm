/**
 * HtmlTag配置
 */
export interface IHtmlTagDefConfig {
    [key: string]: HtmlTagDef;
}
/**
 * 创建element的属性
 */
export interface ICreateElementAttr {
    /**
     * 属性名称
     */
    name: string;
    /**
     * 属性值
     */
    value: string;
    /**
     * 子名称，如：style.color="red", 子名称为color
     */
    subName?: string;
}
/**
 * 默认element创建器
 * @param name tagName, eg:div
 * @param attrs 属性数据, 只有静态属性，绑定属性不传入为
 * @param parent 父element
 * @param content 内容, contentType为RAW_TEXT或RAW_TEXT时会传入
 */
export declare function DEFAULT_CREATEELEMENT(name: string, attrs: ICreateElementAttr[], parent?: HTMLElement, content?: string): HTMLElement;
/**
 * HtmlTag定义类
 */
export declare class HtmlTagDef {
    /**
     * 单行标签
     */
    single: boolean;
    raw: boolean;
    /**
     * element创建器
     */
    createElement: (name: string, attrs: ICreateElementAttr[], parent?: HTMLElement, content?: string) => HTMLElement;
    constructor({single, raw, createElement}?: {
        single?: boolean;
        raw?: boolean;
        createElement?: (name: string, attrs: ICreateElementAttr[], parent?: HTMLElement, content?: string) => HTMLElement;
    });
}
export declare const SINGLE_TAG: HtmlTagDef, DEFULE_TAG: HtmlTagDef;
/**
 * HtmlAttr定义
 */
export interface IHtmlAttrDef {
    setAttribute: (element: HTMLElement, name: string, value: string, subName?: string) => void;
    getAttribute: (element: HTMLElement, name: string, subName?: string) => string;
    writeable: boolean;
}
/**
 * 默认HtmlAttr定义
 */
export declare const DEFAULT_ATTR: IHtmlAttrDef;
/**
 * 默认HtmlAttr prop定义
 */
export declare const DEFAULT_ATTR_PROP: IHtmlAttrDef;
/**
 * HtmlAttr配置
 */
export interface IHtmlAttrDefConfig {
    [name: string]: IHtmlAttrDef;
}
export interface IHtmlEventDef {
    addEventListener: (element: HTMLElement, eventName: string, context: (event: any) => any, useCapture: boolean) => void;
    removeEventListener: (element: HTMLElement, eventName: string, context: (event: any) => any, useCapture: boolean) => void;
}
/**
 * 默认事件定义
 */
export declare const DEFAULT_EVENT_DEF: IHtmlEventDef;
/**
 * 事件配置
 */
export interface IHtmlEventDefConfig {
    [name: string]: IHtmlEventDef;
}
export declare class HtmlDef {
    /**
     * 获取标签定义
     * @param tagName 标签名称
     */
    static getHtmlTagDef(tagName: string): HtmlTagDef;
    /**
     * 扩展标签定义
     * @param p 标签配置
     */
    static extendHtmlTagDef(p: IHtmlTagDefConfig): void;
    /**
     * 获取属性定义
     * @param name
     */
    static getHtmlAttrDef(name: string): IHtmlAttrDef;
    /**
     * 扩展属性定义
     * @param p
     */
    static extendHtmlAttrDef(p: IHtmlAttrDefConfig): void;
    static getHtmlEventDef(name: string): IHtmlEventDef;
    /**
     * 扩展事件定义
     * @param p
     */
    static extendHtmlEventDef(p: IHtmlEventDefConfig): void;
    /**
     * 处理tag内容，删除多余空格，删除注释，编码某些类型内容
     * @param html
     */
    static handleTagContent(html: string): string;
}
