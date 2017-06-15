import CmpxLib from "./cmpxLib";
/**
 * 默认element创建器
 * @param name tagName, eg:div
 * @param attrs 属性数据, 只有静态属性，绑定属性不传入为
 * @param parent 父element
 * @param content 内容, contentType为RAW_TEXT或RAW_TEXT时会传入
 */
export function DEFAULT_CREATEELEMENT(name, attrs, parent, content) {
    var element = document.createElement(name);
    CmpxLib.each(attrs, function (item) {
        HtmlDef.getHtmlAttrDef(item.name).setAttribute(element, item.name, item.value, item.subName);
    });
    return element;
}
//注释标签
var _noteTagRegex = /\<\!--(?:.|\n|\r)*?--\>/gim;
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
export { HtmlTagDef };
export var SINGLE_TAG = new HtmlTagDef({ single: true }), DEFULE_TAG = new HtmlTagDef();
var _htmlTagDefConfig = {
    'base': SINGLE_TAG,
    'meta': SINGLE_TAG,
    'area': SINGLE_TAG,
    'embed': SINGLE_TAG,
    'link': SINGLE_TAG,
    'img': SINGLE_TAG,
    'input': SINGLE_TAG,
    'param': SINGLE_TAG,
    'hr': SINGLE_TAG,
    'source': SINGLE_TAG,
    'track': SINGLE_TAG,
    'wbr': SINGLE_TAG,
    'p': DEFULE_TAG,
    'thead': DEFULE_TAG,
    'tbody': DEFULE_TAG,
    'tfoot': DEFULE_TAG,
    'tr': DEFULE_TAG,
    'td': DEFULE_TAG,
    'th': DEFULE_TAG,
    'col': SINGLE_TAG,
    'li': DEFULE_TAG,
    'dt': DEFULE_TAG,
    'dd': DEFULE_TAG,
    'rb': DEFULE_TAG,
    'rt': DEFULE_TAG,
    'rtc': DEFULE_TAG,
    'rp': DEFULE_TAG,
    'optgroup': DEFULE_TAG,
    'option': DEFULE_TAG,
    'pre': DEFULE_TAG,
    'listing': DEFULE_TAG
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
export var DEFAULT_ATTR = {
    setAttribute: function (element, name, value, subName) {
        if (subName)
            element[name][subName] = value;
        else
            element.setAttribute(name, value);
    },
    getAttribute: function (element, name, subName) {
        if (subName)
            return element[name][subName];
        else
            return element.getAttribute(name);
    },
    writeable: false
};
/**
 * 默认HtmlAttr prop定义
 */
export var DEFAULT_ATTR_PROP = {
    setAttribute: function (element, name, value, subName) {
        if (subName)
            element[name][subName] = value;
        else
            element[name] = value;
    },
    getAttribute: function (element, name, subName) {
        if (subName)
            return element[name][subName];
        else
            return element[name];
    },
    writeable: true
};
var _htmlAttrDefConfig = {
    'src': DEFAULT_ATTR_PROP,
    'rel': DEFAULT_ATTR_PROP,
    'style': DEFAULT_ATTR_PROP,
    'selected': DEFAULT_ATTR_PROP,
    'disabled': DEFAULT_ATTR_PROP,
    'checked': DEFAULT_ATTR_PROP
};
/**
 * 默认事件定义
 */
export var DEFAULT_EVENT_DEF = {
    addEventListener: function (element, eventName, context, useCapture) {
        element.addEventListener(eventName, context, useCapture);
        //attachEvent
    },
    removeEventListener: function (element, eventName, context, useCapture) {
        element.addEventListener(eventName, context, useCapture);
        //detachEvent
    }
};
var _htmlEventDefConfig = {};
var HtmlDef = (function () {
    function HtmlDef() {
    }
    /**
     * 获取标签定义
     * @param tagName 标签名称
     */
    HtmlDef.getHtmlTagDef = function (tagName) {
        return _htmlTagDefConfig[tagName.toLowerCase()] || DEFULE_TAG;
    };
    /**
     * 扩展标签定义
     * @param p 标签配置
     */
    HtmlDef.extendHtmlTagDef = function (p) {
        CmpxLib.extend(_htmlTagDefConfig, p);
        _makeSpecTags();
    };
    /**
     * 获取属性定义
     * @param name
     */
    HtmlDef.getHtmlAttrDef = function (name) {
        return _htmlAttrDefConfig[name] || DEFAULT_ATTR;
    };
    /**
     * 扩展属性定义
     * @param p
     */
    HtmlDef.extendHtmlAttrDef = function (p) {
        CmpxLib.extend(_htmlAttrDefConfig, p);
    };
    HtmlDef.getHtmlEventDef = function (name) {
        return _htmlEventDefConfig[name] || DEFAULT_EVENT_DEF;
    };
    /**
     * 扩展事件定义
     * @param p
     */
    HtmlDef.extendHtmlEventDef = function (p) {
        CmpxLib.extend(_htmlEventDefConfig, p);
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
            return ['<', name, attrs || '', '>', CmpxLib.encodeHtml(content || ''), '</', name, '>'].join('');
        });
    };
    return HtmlDef;
}());
export { HtmlDef };
function _makeSpecTags() {
    var rawTags = [];
    CmpxLib.eachProp(_htmlTagDefConfig, function (item, name) {
        item.raw && rawTags.push(name);
    });
    // let o = HtmlDef.singleTags = {};
    // CmpxLib.each(singleTags, (name: string) => o[name] = true);
    // o = HtmlDef.rawTags = {};
    // CmpxLib.each(rawTags, (name: string) => o[name] = true);
    // o = HtmlDef.escapeRawTags = {};
    // CmpxLib.each(escapeRawTags, (name: string) => o[name] = true);
    var rawNames = rawTags.join('|');
    _rawContentRegex = new RegExp('<\\s*(' + rawNames + ')(\\s+(?:[^>]*))*>((?:.|\\n|\\r)*?)<\\s*/\\s*\\1\\s*>', 'gmi');
    rawNames = [rawNames, 'pre'].join('|');
    _escContentRegex = new RegExp('<\\s*(' + rawNames + ')(\\s+(?:[^>]*))*>((?:.|\\n|\\r)*?)<\\s*/\\s*\\1\\s*>', 'gmi');
}
_makeSpecTags();
//# sourceMappingURL=htmlDef.js.map