export default class CmpxEvent {
    private events;
    /**
     * 绑定事件
     * @param fn 绑定事件方法
     */
    on(fn: () => any): void;
    /**
     * 解绑事件，如果没有指定方法，解绑所有事件
     * @param fn 解绑事件方法
     */
    off(fn?: () => any): void;
    /**
     * 触发事件, 返回最后一个事件值, 如果返回false中断事件
     * @param args 触发传入参数
     * @param thisArg this对象
     */
    trigger(args: any[], thisArg: any): any;
}
