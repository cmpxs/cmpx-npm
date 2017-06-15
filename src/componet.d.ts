import { CompileSubject, CompileRender } from './compile';
export declare class Componet {
    readonly $name: string;
    readonly $parent: Componet;
    readonly $children: Array<Componet>;
    readonly $subObject: CompileSubject;
    readonly $parentElement: HTMLElement;
    /**
     * 更新View，View与Componet数据同步
     * @param p 传入参数
     */
    $update(p?: any): void;
    private updateId;
    /**
     * 步异步更新View，View与Componet数据同步
     * @param p 传入参数
     */
    $updateAsync(callback?: () => void, p?: any): void;
    /**
     * 将模板生成CompileRender, 用于include标签动态绑定用
     * 注意动态模板里不要模板变量(viewvar)，请参数p传入，原因编译压缩后模板变量会改变
     * @param tmpl 模板文本
     * @param p 传入模板参数
     */
    $render(tmpl: string, p?: Object): CompileRender;
    /**
     * 在解释View之前触发，一般准备数据用
     * @param cb 处理完成后，通知继续处理
     * @param p 传入的参数
     */
    onInit(cb: (err?: any) => void, p?: any): void;
    /**
     * 准备好Viewvar后, 在onInit之后、onReady之前触发
     * @param cb 处理完成后，通知继续处理
     * @param p 传入的参数
     */
    onInitViewvar(cb: (err?: any) => void, p?: any): void;
    /**
     * View所有东西已经处理完成时触发
     * @param cb 处理完成后，通知继续处理
     * @param p 传入参数
     */
    onReady(cb: (err?: any) => void, p?: any): void;
    /**
     * $update前时触发
     * @param cb 处理完成后，通知继续处理
     */
    onUpdateBefore(cb: (err?: any) => void, p?: any): void;
    /**
     * $update后时触发
     * @param cb 处理完成后，通知继续处理
     */
    onUpdate(cb: (err?: any) => void, p?: any): void;
    /**
     * 是否已经释放
     */
    $isDisposed: Boolean;
    /**
     * 在componet释放前触发
     */
    onDispose(): void;
    constructor();
}
