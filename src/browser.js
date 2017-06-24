"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var platform_1 = require("./platform");
var compile_1 = require("./compile");
var htmlDef_1 = require("./htmlDef");
var cmpxLib_1 = require("./cmpxLib");
var _getParentElement = htmlDef_1.HtmlDef.getParentElement, _setAttribute = function (element, attrs) {
    cmpxLib_1["default"].each(attrs, function (item) {
        htmlDef_1.HtmlDef.getHtmlAttrDef(item.name).setAttribute(element, item.name, item.value, item.subName);
    });
}, _htmlTtype = /script|style/i, _createElementRaw = function (name, attrs, parent, content) {
    var element = document.createElement(name);
    element[_htmlTtype.test(name) ? 'innerHTML' : 'innerText'] = content || "";
    _setAttribute(element, attrs);
    return element;
}, _rawTag = new htmlDef_1.HtmlTagDef({
    //不解释内容，在createElement创建器传入content内容
    raw: true,
    //单行tag
    single: false,
    //创建器
    createElement: _createElementRaw
});
/**
 * htmlDef配置
 */
var _htmlConfig = function () {
    //扩展tag, 如果不支持请在这里扩展
    htmlDef_1.HtmlDef.extendHtmlTagDef({
        //默认不支持svg, 请处理HtmlTagDef的createElement参数
        'svg': htmlDef_1.DEFULE_TAG,
        //默认不支持math, 请处理HtmlTagDef的createElement参数
        'math': htmlDef_1.DEFULE_TAG,
        'br': htmlDef_1.SINGLE_TAG,
        'style': _rawTag,
        'script': _rawTag,
        'title': _rawTag,
        'textarea': _rawTag
    });
    var modelChecked = /radio|checkbox/i;
    //扩展attr, 如果不支持请在这里扩展
    htmlDef_1.HtmlDef.extendHtmlAttrDef({
        'name': htmlDef_1.DEFAULT_ATTR,
        'value': htmlDef_1.DEFAULT_ATTR_PROP,
        'type': htmlDef_1.DEFAULT_ATTR_PROP,
        'model': {
            setAttribute: function (element, name, value, subName) {
                if (modelChecked.test(element['type']))
                    element['checked'] = element['value'] == value;
                else
                    element['value'] = cmpxLib_1["default"].toStr(value);
            },
            getAttribute: function (element, name, subName) {
                return !modelChecked.test(element['type']) || element['checked'] ? element['value'] : '';
            },
            writeEvent: ['change', 'click']
        }
    });
    //扩展事件处理, 如果不支持请在这里扩展
    htmlDef_1.HtmlDef.extendHtmlEventDef({
        "click": htmlDef_1.DEFAULT_EVENT_DEF
    });
    // //更改默认值，参考如下：
    // DEFAULT_EVENT_DEF.addEventListener = (element: HTMLElement, eventName: string, context: (event: any) => any, useCapture: boolean) {
    //     element.addEventListener(eventName, context, useCapture);
    //     //attachEvent
    // }
    compile_1.Compile.loadTmplCfg(function (url, cb) {
        var xhr = new XMLHttpRequest(), headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'text/plain, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }, protocol = /^([\w-]+:)\/\//.test(url) ? RegExp.$1 : window.location.protocol;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    cb(xhr.responseText);
                }
                else {
                    cb('');
                }
            }
        };
        xhr.open('GET', url, true);
        xhr.send(null);
    });
};
var Browser = (function (_super) {
    __extends(Browser, _super);
    function Browser() {
        var _this = _super.call(this) || this;
        //htmlDef配置
        _htmlConfig();
        //编译器启动，用于htmlDef配置后
        compile_1.Compile.startUp();
        return _this;
    }
    Browser.prototype.boot = function (componetDef) {
        var name = componetDef.prototype.$name, bootElement = document.getElementsByTagName(name)[0];
        if (!bootElement)
            throw new Error("\u6CA1\u6709" + name + "\u6807\u7B7E");
        var _doc = document, parentElement = _getParentElement(bootElement);
        var preElement = bootElement.previousSibling;
        if (!preElement) {
            preElement = _doc.createComment(name);
            parentElement.insertBefore(preElement, bootElement);
        }
        parentElement.removeChild(bootElement);
        bootElement = preElement;
        ////DOMContentLoaded 时起动
        var _readyName = 'DOMContentLoaded', _ready = function () {
            _doc.removeEventListener(_readyName, _ready, false);
            window.removeEventListener('load', _ready, false);
            //注意tmplElement是Comment, 在IE里只能取到parentNode
            var parentElement = _getParentElement(bootElement);
            compile_1.Compile.renderComponet(componetDef, bootElement, [], function (newSubject, refComponet) {
                parentElement.removeChild(bootElement);
                //console.log(refComponet);
                var _unload = function () {
                    window.removeEventListener('unload', _unload);
                    newSubject.remove({
                        componet: refComponet
                    });
                };
                window.addEventListener('unload', _unload, false);
            });
        };
        if (/loaded|complete|undefined/i.test(_doc.readyState))
            _ready();
        else {
            _doc.addEventListener(_readyName, _ready, false);
            window.addEventListener("load", _ready, false);
        }
        return this;
    };
    return Browser;
}(platform_1["default"]));
exports.Browser = Browser;
//# sourceMappingURL=browser.js.map