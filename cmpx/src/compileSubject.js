"use strict";
exports.__esModule = true;
var cmpxLib_1 = require("./cmpxLib");
var CompileSubject = (function () {
    function CompileSubject(subject, exclude) {
        var _this = this;
        /**
         * 是否已经初始化
         */
        this.isInit = false;
        /**
         * 是否已分离
         */
        this.isDetach = false;
        /**
         * 是否已经准备
         */
        this.isReady = false;
        /**
         * 是否已经删除
         */
        this.isRemove = false;
        if (subject) {
            if (!(this.isRemove = subject.isRemove)) {
                this.linkParam = subject.subscribe({
                    init: function (p) { return (!exclude || !exclude.init) && _this.init(p); },
                    update: function (p) { return (!exclude || !exclude.update) && _this.update(p); },
                    ready: function (p) { return (!exclude || !exclude.ready) && _this.ready(p); },
                    detach: function (p) { return (!exclude || !exclude.detach) && _this.detach(p); },
                    remove: function (p) { return (!exclude || !exclude.remove) && _this.remove(p); }
                });
                this.subject = subject;
                this.isInit = subject.isInit;
                this.isReady = subject.isReady;
            }
        }
    }
    CompileSubject.prototype.subscribeIn = function (name, p) {
        var listName = name + 'List', list = this[listName] || (this[listName] = []);
        list.push(p[name]);
    };
    /**
     * 观察
     * @param p 观察内容
     */
    CompileSubject.prototype.subscribe = function (p) {
        if (!this.isRemove) {
            p.update && this.subscribeIn('update', p);
            p.remove && this.subscribeIn('remove', p);
            p.detach && this.subscribeIn('detach', p);
            if (this.ready)
                p.ready && p.ready(null);
            else
                p.ready && this.subscribeIn('ready', p);
            if (this.isInit)
                p.init && p.init(null);
            else
                p.init && this.subscribeIn('init', p);
        }
        return p;
    };
    CompileSubject.prototype.unSubscribeIn = function (name, p) {
        var list = this[name + 'List'];
        if (list) {
            var index = list.indexOf(p[name]);
            (index >= 0) && list.splice(index, 1);
        }
    };
    /**
     * 解除观察
     * @param p 观察内容
     */
    CompileSubject.prototype.unSubscribe = function (p) {
        if (!this.isRemove) {
            p.update && this.unSubscribeIn('update', p);
            p.ready && this.unSubscribeIn('ready', p);
            p.detach && this.unSubscribeIn('detach', p);
            p.remove && this.unSubscribeIn('remove', p);
            p.init && this.unSubscribeIn('init', p);
        }
    };
    /**
     * 解除观察Subject
     */
    CompileSubject.prototype.unLinkSubject = function () {
        this.subject && this.subject.unSubscribe(this.linkParam);
        return this;
    };
    /**
     * 发送初始化通知
     * @param p 发送事件参数
     */
    CompileSubject.prototype.init = function (p) {
        if (this.isRemove)
            return;
        this.isInit = true;
        var list = this.initList;
        this.initList = [];
        cmpxLib_1.CmpxLib.each(list, function (fn) {
            fn && fn(p);
        });
    };
    /**
     * 发送更新通知
     * @param p 发送事件参数
     */
    CompileSubject.prototype.update = function (p) {
        if (this.isRemove || this.isDetach)
            return;
        cmpxLib_1.CmpxLib.each(this.updateList, function (fn) {
            fn && fn(p);
        });
    };
    /**
     * 发送分离通知，不删除
     * @param p 发送事件参数
     */
    CompileSubject.prototype.detach = function (p) {
        if (this.isRemove)
            return;
        this.isDetach = !this.isDetach;
        cmpxLib_1.CmpxLib.each(this.detachList, function (fn) {
            fn && fn(p);
        });
    };
    /**
     * 发送准备通知
     * @param p 发送事件参数
     */
    CompileSubject.prototype.ready = function (p) {
        if (this.isRemove)
            return;
        var list = this.readyList;
        this.readyList = [];
        cmpxLib_1.CmpxLib.each(list, function (fn) {
            fn && fn(p);
        });
    };
    /**
     * 发送删除通知
     * @param p 发送事件参数
     */
    CompileSubject.prototype.remove = function (p) {
        if (this.isRemove)
            return;
        this.isRemove = true;
        this.unLinkSubject();
        var removeList = this.removeList;
        this.clear();
        cmpxLib_1.CmpxLib.each(removeList, function (fn) {
            fn && fn(p);
        });
    };
    CompileSubject.prototype.clear = function () {
        this.initList = this.readyList
            = this.updateList = this.removeList = null;
    };
    return CompileSubject;
}());
exports.CompileSubject = CompileSubject;
//# sourceMappingURL=compileSubject.js.map