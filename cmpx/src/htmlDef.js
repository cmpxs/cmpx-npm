"use strict";
exports.__esModule = true;
var cmpxLib_1 = require("./cmpxLib");
/**
 * 默认element创建器
 * @param name tagName, eg:div
 * @param attrs 属性数据, 只有静态属性，绑定属性不传入为
 * @param parent 父element
 * @param content 内容, contentType为RAW_TEXT或RAW_TEXT时会传入
 */
function DEFAULT_CREATEELEMENT(name, attrs, parent, content, complieInfo) {
    var element = document.createElement(name);
    cmpxLib_1.CmpxLib.each(attrs, function (item) {
        HtmlDef.getHtmlAttrDef(item.name).setAttribute(element, item.name, item.value, item.subName);
    });
    return element;
}
exports.DEFAULT_CREATEELEMENT = DEFAULT_CREATEELEMENT;
//注释标签
var _noteTagRegex = /\<\!--(?:.|\n|\r)*?--\>/gim, _extend = function (obj, p) {
    p && cmpxLib_1.CmpxLib.eachProp(p, function (item, name) { obj[name.toLowerCase()] = item; });
};
/**
 * HtmlTag定义类
 */
var HtmlTagDef = (function () {
    function HtmlTagDef(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.single, single = _c === void 0 ? false : _c, _d = _b.raw, raw = _d === void 0 ? false : _d, _e = _b.createElement, createElement = _e === void 0 ? null : _e;
        this.single = single;
        this.raw = raw;
        this.createElement = createElement || DEFAULT_CREATEELEMENT;
    }
    return HtmlTagDef;
}());
exports.HtmlTagDef = HtmlTagDef;
exports.SINGLE_TAG = new HtmlTagDef({ single: true }), exports.DEFULE_TAG = new HtmlTagDef();
var _htmlTagDefConfig = {
    'base': exports.SINGLE_TAG,
    'meta': exports.SINGLE_TAG,
    'area': exports.SINGLE_TAG,
    'embed': exports.SINGLE_TAG,
    'link': exports.SINGLE_TAG,
    'img': exports.SINGLE_TAG,
    'input': exports.SINGLE_TAG,
    'param': exports.SINGLE_TAG,
    'hr': exports.SINGLE_TAG,
    'source': exports.SINGLE_TAG,
    'track': exports.SINGLE_TAG,
    'wbr': exports.SINGLE_TAG,
    'p': exports.DEFULE_TAG,
    'thead': exports.DEFULE_TAG,
    'tbody': exports.DEFULE_TAG,
    'tfoot': exports.DEFULE_TAG,
    'tr': exports.DEFULE_TAG,
    'td': exports.DEFULE_TAG,
    'th': exports.DEFULE_TAG,
    'col': exports.SINGLE_TAG,
    'li': exports.DEFULE_TAG,
    'dt': exports.DEFULE_TAG,
    'dd': exports.DEFULE_TAG,
    'rb': exports.DEFULE_TAG,
    'rt': exports.DEFULE_TAG,
    'rtc': exports.DEFULE_TAG,
    'rp': exports.DEFULE_TAG,
    'optgroup': exports.DEFULE_TAG,
    'option': exports.DEFULE_TAG,
    'pre': exports.DEFULE_TAG,
    'listing': exports.DEFULE_TAG
};
var _rawContentRegex, _escContentRegex, _removeCmdRegex = /\{\{((?:.|\n|\r)*?)\}\}/gmi;
//删除多余空格
function _removeSpace(html) {
    html = html.replace(_removeCmdRegex, function (find, content) {
        return ['{{', encodeURIComponent(content), '}}'].join('');
    }).replace(_escContentRegex, function (find, name, attrs, content, cmdContent) {
        return ['<', name, attrs || '', '>', encodeURIComponent(content || ''), '</', name, '>'].join('');
    })
        .replace(/(?:\n|\r)+/gmi, ' ').replace(/\s{2,}/gmi, ' ')
        .replace(_escContentRegex, function (find, name, attrs, content, cmdContent) {
        return ['<', name, attrs || '', '>', decodeURIComponent(content || ''), '</', name, '>'].join('');
    }).replace(_removeCmdRegex, function (find, content) {
        return ['{{', decodeURIComponent(content), '}}'].join('');
    });
    return html;
}
/**
 * 默认HtmlAttr定义
 */
exports.DEFAULT_ATTR = {
    setAttribute: function (element, name, value, subName, complieInfo) {
        if (subName)
            element[name][subName] = value;
        else
            element.setAttribute(name, cmpxLib_1.CmpxLib.toStr(value));
    },
    getAttribute: function (element, name, subName, complieInfo) {
        if (subName)
            return element[name][subName];
        else
            return element.getAttribute(name);
    }
};
/**
 * 默认HtmlAttr prop定义
 */
exports.DEFAULT_ATTR_PROP = {
    setAttribute: function (element, name, value, subName, complieInfo) {
        if (subName)
            element[name][subName] = name == 'value' ? cmpxLib_1.CmpxLib.toStr(value) : value;
        else {
            if (name == 'style')
                element.setAttribute(name, cmpxLib_1.CmpxLib.toStr(value));
            else
                element[name] = name == 'value' ? cmpxLib_1.CmpxLib.toStr(value) : value;
        }
    },
    getAttribute: function (element, name, subName, complieInfo) {
        if (subName)
            return element[name][subName];
        else {
            if (name == 'style')
                return element.getAttribute(name);
            else
                return element[name];
        }
    }
};
var _htmlAttrDefConfig = {
    'src': exports.DEFAULT_ATTR_PROP,
    'rel': exports.DEFAULT_ATTR_PROP,
    'style': exports.DEFAULT_ATTR_PROP,
    'selected': exports.DEFAULT_ATTR_PROP,
    'disabled': exports.DEFAULT_ATTR_PROP,
    'checked': exports.DEFAULT_ATTR_PROP
};
/**
 * 默认事件定义
 */
exports.DEFAULT_EVENT_DEF = {
    addEventListener: function (element, eventName, context, useCapture, complieInfo) {
        element.addEventListener(eventName, context, useCapture);
        //attachEvent
    },
    removeEventListener: function (element, eventName, context, useCapture, complieInfo) {
        element.removeEventListener(eventName, context, useCapture);
        //detachEvent
    }
};
var _htmlEventDefConfig = {};
var HtmlDef = (function () {
    function HtmlDef() {
    }
    //获取父元素
    HtmlDef.getParentElement = function (node) {
        return node.parentElement || node.parentNode;
    };
    /**
     * 获取标签定义
     * @param tagName 标签名称
     */
    HtmlDef.getHtmlTagDef = function (tagName) {
        return _htmlTagDefConfig[tagName.toLowerCase()] || exports.DEFULE_TAG;
    };
    /**
     * 扩展标签定义
     * @param p 标签配置
     */
    HtmlDef.extendHtmlTagDef = function (p) {
        _extend(_htmlTagDefConfig, p);
        _makeSpecTags();
    };
    /**
     * 是否有属性定义
     * @param name
     */
    HtmlDef.hasHtmlAttrDef = function (name) {
        return !!_htmlAttrDefConfig[name.toLowerCase()];
    };
    /**
     * 获取属性定义
     * @param name
     */
    HtmlDef.getHtmlAttrDef = function (name) {
        return _htmlAttrDefConfig[name.toLowerCase()] || exports.DEFAULT_ATTR;
    };
    /**
     * 扩展属性定义
     * @param p
     */
    HtmlDef.extendHtmlAttrDef = function (p) {
        _extend(_htmlAttrDefConfig, p);
    };
    HtmlDef.getHtmlEventDef = function (name) {
        return _htmlEventDefConfig[name.toLowerCase()] || exports.DEFAULT_EVENT_DEF;
    };
    /**
     * 扩展事件定义
     * @param p
     */
    HtmlDef.extendHtmlEventDef = function (p) {
        _extend(_htmlEventDefConfig, p);
    };
    // /**
    //  * 单行标签
    //  */
    // static singleTags: { [name: string]: boolean };
    // /**
    //  * 内容标签，不解释内容
    //  */
    // static rawTags: { [name: string]: boolean };
    /**
     * 处理tag内容，删除多余空格，删除注释，编码某些类型内容
     * @param html
     */
    HtmlDef.handleTagContent = function (html) {
        return _removeSpace(html.replace(_noteTagRegex, ''))
            .replace(_rawContentRegex, function (find, name, attrs, content) {
            return ['<', name, attrs || '', '>', cmpxLib_1.CmpxLib.encodeHtml(content || ''), '</', name, '>'].join('');
        });
    };
    return HtmlDef;
}());
exports.HtmlDef = HtmlDef;
function _makeSpecTags() {
    var rawTags = [];
    cmpxLib_1.CmpxLib.eachProp(_htmlTagDefConfig, function (item, name) {
        item.raw && rawTags.push(name);
    });
    var rawNames = rawTags.join('|');
    _rawContentRegex = new RegExp('<\\s*(' + rawNames + ')(\\s+(?:[^>]*))*>((?:.|\\n|\\r)*?)<\\s*/\\s*\\1\\s*>', 'gmi');
    rawNames = [rawNames, 'pre'].join('|');
    _escContentRegex = new RegExp('<\\s*(' + rawNames + ')(\\s+(?:[^>]*))*>((?:.|\\n|\\r)*?)<\\s*/\\s*\\1\\s*>', 'gmi');
}
_makeSpecTags();
//# sourceMappingURL=htmlDef.js.map