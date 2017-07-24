"use strict";
exports.__esModule = true;
var Bind = (function () {
    function Bind(element) {
        /**
         * 是否已经释放
         */
        this.$isDisposed = false;
        this.element = element;
    }
    /**
     * 更新View，View与Componet数据同步
     * @param p 传入参数
     */
    Bind.prototype.$update = function (p) {
        if (this.$isDisposed)
            return;
        this.$componet.$updateAsync(p);
    };
    Bind.prototype.onChanged = function () {
    };
    /**
     * View所有东西已经处理完成时触发
     * @param cb 处理完成后，通知继续处理
     * @param p 传入参数
     */
    Bind.prototype.onReady = function () {
    };
    /**
     * $update后时触发
     * @param cb 处理完成后，通知继续处理
     */
    Bind.prototype.onUpdate = function () {
    };
    /**
     * 在componet释放前触发
     */
    Bind.prototype.onDispose = function () {
    };
    return Bind;
}());
exports.Bind = Bind;
//# sourceMappingURL=bind.js.map