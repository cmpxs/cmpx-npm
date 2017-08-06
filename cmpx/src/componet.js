"use strict";
exports.__esModule = true;
var Componet = (function () {
    function Componet() {
        this.$children = [];
        /**
         * 是否已经释放
         */
        this.$isDisposed = false;
    }
    /**
     * 更新(同步)视图，视图与数据同步
     * @param p 传入参数
     */
    Componet.prototype.$update = function (p) {
        if (this.$isDisposed)
            return;
        this.clearUpdateTime();
        this.$subject.update({
            componet: this,
            param: p
        });
    };
    Componet.prototype.clearUpdateTime = function () {
        if (this.updateId) {
            clearTimeout(this.updateId);
            this.updateId = null;
        }
    };
    /**
     * 步异步更新(同步)视图，视图与数据同步
     * @param p 传入参数
     */
    Componet.prototype.$updateAsync = function (callback, p) {
        var _this = this;
        this.clearUpdateTime();
        this.updateId = setTimeout(function () {
            _this.updateId = null;
            _this.$update(p);
            callback && callback.apply(_this);
        }, 5);
    };
    /**
     * 将模板生成CompileRender, 用于include标签动态绑定用
     * 注意动态模板里不要模板变量(viewvar)，请参数p传入，原因编译压缩后模板变量会改变
     * @param context 模板文本
     */
    Componet.prototype.$render = function (context) {
        //var rd = new CompileRender(context);
        return context;
    };
    /**
     * 在组件视图初始化后触发，此时视图还没插入到dom， 一次性事件
     */
    Componet.prototype.onInit = function () {
    };
    /**
     * 组件视图已经处理完成时触发， 一次性事件
     */
    Componet.prototype.onReady = function () {
        this.$update();
    };
    /**
     * 每次数据与视图更新（同步）后触发
     */
    Componet.prototype.onUpdate = function () {
    };
    /**
     * 每次数据与视图更新（同步）发生改变后触发
     */
    Componet.prototype.onChanged = function () {
    };
    /**
     * 在componet释放前触发
     */
    Componet.prototype.onDispose = function () {
    };
    return Componet;
}());
exports.Componet = Componet;
//# sourceMappingURL=componet.js.map