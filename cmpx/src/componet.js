"use strict";
exports.__esModule = true;
var compile_1 = require("./compile");
var Componet = (function () {
    function Componet() {
        this.$children = [];
        /**
         * 是否已经释放
         */
        this.$isDisposed = false;
    }
    /**
     * 更新View，View与Componet数据同步
     * @param p 传入参数
     */
    Componet.prototype.$update = function (p) {
        var _this = this;
        if (this.$isDisposed)
            return;
        this.onUpdateBefore(function () {
            if (_this.$isDisposed)
                return;
            _this.$subObject.update({
                componet: _this,
                param: p
            });
        }, p);
        this.onUpdate(function () { }, p);
    };
    /**
     * 步异步更新View，View与Componet数据同步
     * @param p 传入参数
     */
    Componet.prototype.$updateAsync = function (callback, p) {
        var _this = this;
        this.updateId && clearTimeout(this.updateId);
        this.updateId = setTimeout(function () {
            _this.updateId = null;
            _this.$update(p);
            callback && callback.apply(_this);
        }, 5);
    };
    /**
     * 将模板生成CompileRender, 用于include标签动态绑定用
     * 注意动态模板里不要模板变量(viewvar)，请参数p传入，原因编译压缩后模板变量会改变
     * @param tmpl 模板文本
     * @param p 传入模板参数
     */
    Componet.prototype.$render = function (tmpl) {
        var rd = new compile_1.CompileRender(tmpl);
        return rd;
    };
    /**
     * 在解释View之前触发，一般准备数据用
     * @param cb 处理完成后，通知继续处理
     * @param p 传入的参数
     */
    Componet.prototype.onInit = function (cb, p) {
        cb && cb();
    };
    /**
     * View所有东西已经处理完成时触发
     * @param cb 处理完成后，通知继续处理
     * @param p 传入参数
     */
    Componet.prototype.onReady = function (cb, p) {
        cb && cb();
    };
    /**
     * $update前时触发
     * @param cb 处理完成后，通知继续处理
     */
    Componet.prototype.onUpdateBefore = function (cb, p) {
        cb && cb();
    };
    /**
     * $update后时触发
     * @param cb 处理完成后，通知继续处理
     */
    Componet.prototype.onUpdate = function (cb, p) {
        cb && cb();
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