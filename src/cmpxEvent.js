"use strict";
exports.__esModule = true;
var cmpxLib_1 = require("./cmpxLib");
var CmpxEvent = (function () {
    function CmpxEvent() {
        this.events = [];
    }
    /**
     * 绑定事件
     * @param fn 绑定事件方法
     */
    CmpxEvent.prototype.on = function (fn) {
        this.events.push(fn);
    };
    /**
     * 解绑事件，如果没有指定方法，解绑所有事件
     * @param fn 解绑事件方法
     */
    CmpxEvent.prototype.off = function (fn) {
        if (fn) {
            var index = cmpxLib_1["default"].inArray(this.events, fn);
            index >= 0 && this.events.splice(index, 1);
        }
        else
            this.events = [];
    };
    /**
     * 触发事件, 返回最后一个事件值, 如果返回false中断事件
     * @param args 触发传入参数
     * @param thisArg this对象
     */
    CmpxEvent.prototype.trigger = function (args, thisArg) {
        var ret;
        cmpxLib_1["default"].each(this.events, function (item) {
            ret = item && item.apply(thisArg, args);
            return ret;
        });
        return ret;
    };
    return CmpxEvent;
}());
exports.CmpxEvent = CmpxEvent;
//# sourceMappingURL=cmpxEvent.js.map