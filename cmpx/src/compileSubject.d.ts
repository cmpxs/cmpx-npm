export interface ISubscribeEvent {
    componet: any;
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
