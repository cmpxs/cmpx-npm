(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.cmpxs = global.cmpxs || {}, global.cmpxs.cmpx = global.cmpxs.cmpx || {})));
}(this, (function (exports) { 'use strict';

var stringEmpty = "";
var toString = Object.prototype.toString;
var core_hasOwn = Object.prototype.hasOwnProperty;
var noop = function () { };
var slice = Array.prototype.slice;
function testObject(obj) {
    if (obj.constructor &&
        !core_hasOwn.call(obj, "constructor") &&
        !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
        return false;
    }
}
var CmpxLib = (function () {
    function CmpxLib() {
    }
    CmpxLib.hasOwnProp = function (obj, prop) {
        return core_hasOwn.call(obj, prop);
    };
    CmpxLib.trace = function (e) {
        console.error && console.error(e.stack || e.message || e + '');
    };
    CmpxLib.isType = function (typename, value) {
        //typename:String, Array, Boolean, Object, RegExp, Date, Function,Number //兼容
        //typename:Null, Undefined,Arguments    //IE不兼容
        return toString.apply(value) === '[object ' + typename + ']';
    };
    CmpxLib.toStr = function (p) {
        return CmpxLib.isNull(p) ? '' : p.toString();
    };
    CmpxLib.isUndefined = function (obj) {
        ///<summary>是否定义</summary>
        return (typeof (obj) === "undefined" || obj === undefined);
    };
    CmpxLib.isNull = function (obj) {
        ///<summary>是否Null</summary>
        return (obj === null || CmpxLib.isUndefined(obj));
    };
    CmpxLib.isBoolean = function (obj) {
        return CmpxLib.isType("Boolean", obj);
    };
    CmpxLib.isNullEmpty = function (s) {
        return (CmpxLib.isNull(s) || s === stringEmpty);
    };
    CmpxLib.isFunction = function (fun) {
        return CmpxLib.isType("Function", fun);
    };
    CmpxLib.isNumeric = function (n) {
        //return cmpx.isType("Number", n) && !isNaN(n) && isFinite(n);;
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    CmpxLib.isString = function (obj) {
        return CmpxLib.isType("String", obj);
    };
    CmpxLib.isObject = function (obj) {
        return obj && CmpxLib.isType("Object", obj)
            && !CmpxLib.isElement(obj) && !CmpxLib.isWindow(obj); //IE8以下isElement, isWindow认为Object
    };
    // static tryCatch(tryFn: Function, catchFn: (e: any) => any, args: Array<any> = [], thisArg: any = null): any {
    //     try {
    //         return tryFn.apply(thisArg, args);
    //     } catch (e) {
    //         return catchFn.call(thisArg, e);
    //     }
    // }
    CmpxLib.isPlainObject = function (obj) {
        if (!CmpxLib.isObject(obj))
            return false;
        try {
            if (testObject(obj) === false)
                return false;
        }
        catch (e) {
            return false;
        }
        var key;
        for (key in obj) { }
        return key === undefined || core_hasOwn.call(obj, key);
    };
    CmpxLib.encodeHtml = function (html) {
        return !html ? '' : html.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;')
            .replace(/\"/g, '&quot;').replace(/ /g, "&nbsp;").replace(/\'/g, "&#39;");
    };
    CmpxLib.decodeHtml = function (html) {
        return !html ? '' : html.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    };
    CmpxLib.isArray = function (value) {
        return Array.isArray ? Array.isArray(value) : CmpxLib.isType("Array", value);
    };
    CmpxLib.isWindow = function (obj) { return !!(obj && obj == obj.window); };
    CmpxLib.isElement = function (obj) { var t = obj && (obj.ownerDocument || obj).documentElement; return t ? true : false; };
    CmpxLib.trim = function (str, newline) {
        return str ? (newline ? str.replace(/^(?:\s|\u3000|\ue4c6|\n|\r)*|(?:\s|\u3000|\ue4c6|\n|\r)*$/g, '') :
            str.replace(/^(?:\s|\u3000|\ue4c6)*|(?:\s|\u3000|\ue4c6)*$/g, '')) : '';
    };
    CmpxLib.replaceAll = function (s, str, repl, flags) {
        if (flags === void 0) { flags = "g"; }
        if (CmpxLib.isNullEmpty(s) || CmpxLib.isNullEmpty(str))
            return s;
        str = str.replace(/([^A-Za-z0-9 ])/g, "\\$1");
        s = s.replace(new RegExp(str, flags), repl);
        return s;
    };
    CmpxLib.inArray = function (list, p, thisArg) {
        if (thisArg === void 0) { thisArg = null; }
        var isF = CmpxLib.isFunction(p), index = -1;
        CmpxLib.each(list, function (item, idx) {
            var ok = isF ? p.call(thisArg, item, idx) : (item == p);
            if (ok) {
                index = idx;
                return false;
            }
        }, thisArg);
        return index;
    };
    CmpxLib.toArray = function (p, start, count) {
        if (start === void 0) { start = 0; }
        if (count === void 0) { count = Number.MAX_VALUE; }
        return p ? slice.apply(p, [start, count]) : p;
    };
    CmpxLib.arrayToObject = function (array, fieldName) {
        var obj = {};
        CmpxLib.each(array, function (item, index) {
            obj[item[fieldName]] = item;
        });
        return obj;
    };
    CmpxLib.each = function (list, fn, thisArg) {
        if (thisArg === void 0) { thisArg = null; }
        if (!list)
            return;
        var len = list.length;
        for (var i = 0, len_1 = list.length; i < len_1; i++) {
            if (fn.call(thisArg, list[i], i) === false)
                break;
        }
    };
    CmpxLib.eachProp = function (obj, callback, thisArg) {
        if (thisArg === void 0) { thisArg = null; }
        if (!obj)
            return;
        var item;
        for (var n in obj) {
            if (CmpxLib.hasOwnProp(obj, n)) {
                item = obj[n];
                if (callback.call(thisArg, item, n) === false)
                    break;
            }
        }
    };
    CmpxLib.extend = function (obj, p) {
        if (obj && p) {
            CmpxLib.eachProp(p, function (item, name) { obj[name] = item; });
        }
        return obj;
    };
    return CmpxLib;
}());
CmpxLib.stringEmpty = stringEmpty;
CmpxLib.noop = noop;

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
            var index = CmpxLib.inArray(this.events, fn);
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
        CmpxLib.each(this.events, function (item) {
            ret = item && item.apply(thisArg, args);
            return ret;
        });
        return ret;
    };
    return CmpxEvent;
}());

/**
 * 默认element创建器
 * @param name tagName, eg:div
 * @param attrs 属性数据, 只有静态属性，绑定属性不传入为
 * @param parent 父element
 * @param content 内容, contentType为RAW_TEXT或RAW_TEXT时会传入
 */
function DEFAULT_CREATEELEMENT(name, attrs, parent, content) {
    var element = document.createElement(name);
    CmpxLib.each(attrs, function (item) {
        HtmlDef.getHtmlAttrDef(item.name).setAttribute(element, item.name, item.value, item.subName);
    });
    return element;
}
//注释标签
var _noteTagRegex = /\<\!--(?:.|\n|\r)*?--\>/gim;
var _extend = function (obj, p) {
    p && CmpxLib.eachProp(p, function (item, name) { obj[name.toLowerCase()] = item; });
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
var SINGLE_TAG = new HtmlTagDef({ single: true });
var DEFULE_TAG = new HtmlTagDef();
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
var _rawContentRegex;
var _escContentRegex;
var _removeCmdRegex = /\{\{((?:.|\n|\r)*?)\}\}/gmi;
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
var DEFAULT_ATTR = {
    setAttribute: function (element, name, value, subName) {
        if (subName)
            element[name][subName] = value;
        else
            element.setAttribute(name, CmpxLib.toStr(value));
    },
    getAttribute: function (element, name, subName) {
        if (subName)
            return element[name][subName];
        else
            return element.getAttribute(name);
    }
};
/**
 * 默认HtmlAttr prop定义
 */
var DEFAULT_ATTR_PROP = {
    setAttribute: function (element, name, value, subName) {
        if (subName)
            element[name][subName] = name == 'value' ? CmpxLib.toStr(value) : value;
        else
            element[name] = name == 'value' ? CmpxLib.toStr(value) : value;
    },
    getAttribute: function (element, name, subName) {
        if (subName)
            return element[name][subName];
        else
            return element[name];
    }
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
var DEFAULT_EVENT_DEF = {
    addEventListener: function (element, eventName, context, useCapture) {
        element.addEventListener(eventName, context, useCapture);
        //attachEvent
    },
    removeEventListener: function (element, eventName, context, useCapture) {
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
        return _htmlTagDefConfig[tagName.toLowerCase()] || DEFULE_TAG;
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
     * 获取属性定义
     * @param name
     */
    HtmlDef.getHtmlAttrDef = function (name) {
        return _htmlAttrDefConfig[name.toLowerCase()] || DEFAULT_ATTR;
    };
    /**
     * 扩展属性定义
     * @param p
     */
    HtmlDef.extendHtmlAttrDef = function (p) {
        _extend(_htmlAttrDefConfig, p);
    };
    HtmlDef.getHtmlEventDef = function (name) {
        return _htmlEventDefConfig[name.toLowerCase()] || DEFAULT_EVENT_DEF;
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
            return ['<', name, attrs || '', '>', CmpxLib.encodeHtml(content || ''), '</', name, '>'].join('');
        });
    };
    return HtmlDef;
}());
function _makeSpecTags() {
    var rawTags = [];
    CmpxLib.eachProp(_htmlTagDefConfig, function (item, name) {
        item.raw && rawTags.push(name);
    });
    var rawNames = rawTags.join('|');
    _rawContentRegex = new RegExp('<\\s*(' + rawNames + ')(\\s+(?:[^>]*))*>((?:.|\\n|\\r)*?)<\\s*/\\s*\\1\\s*>', 'gmi');
    rawNames = [rawNames, 'pre'].join('|');
    _escContentRegex = new RegExp('<\\s*(' + rawNames + ')(\\s+(?:[^>]*))*>((?:.|\\n|\\r)*?)<\\s*/\\s*\\1\\s*>', 'gmi');
}
_makeSpecTags();

//新建一个text节点
var _newTextContent = function (tmpl, start, end) {
    var text = tmpl.substring(start, end), bind = _cmdDecodeAttrRegex.test(text), bindInfo = bind ? _getBind(text, '"') : null;
    return {
        tagName: '',
        target: false,
        cmd: false,
        find: text,
        content: bind ? "" : text,
        attrs: null,
        end: true,
        single: true,
        index: start,
        bind: bind,
        bindInfo: bindInfo
    };
};
var _singleCmd = {
    'include': true
};
var _encodeURIComponentEx = function (s) {
    return encodeURIComponent(s).replace(/'/g, '%27');
};
var _cmdEncodeAttrRegex = /\{\{\{((?:.|\r|\n)*?)\}\}\}|\{\{((?!\/|\s*(?:if|ifx|else|for|forx|tmpl|include|html)[ \}])(?:.|\r|\n)+?)\}\}/gm;
var _makeTextTag = function (tmpl) {
    //
    return tmpl.replace(_cmdEncodeAttrRegex, function (find, content, content1) {
        return ['$($', _encodeURIComponentEx(content || content1), '$)$'].join('');
    });
};
var _cmdDecodeAttrRegex = /\$\(\$(.+?)\$\)\$/gm;
var _tagInfoRegex = /\<\s*(\/*)\s*([^<>\s]+)\s*([^<>]*?)(\/*)\s*\>|\{\{\s*(\/*)\s*([^\s\{\}]+)\s*(.*?)(\/*)\}\}/gim;
var _makeTagInfos = function (tmpl) {
    var lastIndex = 0, list = [];
    tmpl = _makeTextTag(tmpl);
    tmpl = HtmlDef.handleTagContent(tmpl);
    tmpl.replace(_tagInfoRegex, function (find, end1, tagName, tagContent, end2, txtEnd1, txtName, txtContent, txtEnd2, index) {
        if (index > lastIndex) {
            list.push(_newTextContent(tmpl, lastIndex, index));
        }
        var cmd = !!txtName, htmlTagDef = cmd ? null : HtmlDef.getHtmlTagDef(tagName), single = !!end2 || !!txtEnd2 || (cmd ? (_singleCmd[txtName] && !!txtEnd2) : htmlTagDef.single), end = !!end1 || !!txtEnd1 || single;
        if (!(single && (!!end1 || !!txtEnd1))) {
            var attrs = !cmd && !!tagContent ? _getAttrInfos(tagContent) : null;
            if (cmd) {
                if ((single || !end)) {
                    switch (txtName) {
                        case 'for':
                        case 'forx':
                            attrs = _getForAttrInfos(txtContent);
                            break;
                        case 'tmpl':
                        case 'include':
                            attrs = _getAttrInfos(txtContent);
                            break;
                    }
                }
            }
            else {
                attrs = !!tagContent ? _getAttrInfos(tagContent) : null;
            }
            var item = {
                tagName: (tagName || txtName),
                target: !cmd,
                cmd: cmd,
                find: find,
                content: tagContent || txtContent,
                attrs: attrs,
                end: end,
                single: single,
                index: index,
                htmlTagDef: htmlTagDef //,
                //componet: cmd ? false : !!_registerVM[tagName]
            };
            list.push(item);
        }
        lastIndex = index + find.length;
        return find;
    });
    var index = tmpl.length;
    if (index > lastIndex) {
        list.push(_newTextContent(tmpl, lastIndex, index));
    }
    var outList = [];
    _makeTagInfoChildren(list, outList, list.length);
    return outList;
};
var _attrInfoRegex = /\s*([^= ]+)\s*=\s*(?:(["'])((?:.|\n|\r)*?)\2|([^"' ><]*))|\s*([^= /]+)\s*/gm;
var _getAttrInfos = function (content) {
    var attrs = [];
    content.replace(_attrInfoRegex, function (find, name, split, value, value1, name1, index) {
        value1 && (split = "\"", value = value1);
        var bind = _cmdDecodeAttrRegex.test(value), bindInfo = bind ? _getBind(value, split) : null;
        attrs.push({
            name: (name || name1),
            value: value,
            bind: bind,
            bindInfo: bindInfo
        });
        return find;
    });
    return attrs;
};
var _forAttrRegex = /\s*([^\s]+)\s*\in\s*([^\s]+)\s*(?:\s*(sync)(?:\s*=\s*([\'\"])(.*?)\4)*)*/i;
var _getForAttrInfos = function (content) {
    var extend = _forAttrRegex.exec(content);
    var attrs = [{
            name: '',
            value: '',
            bind: true,
            extend: {
                item: extend[1],
                datas: extend[2],
                sync: !!extend[3],
                syncCT: extend[5]
            }
        }];
    return attrs;
};
var _bindTypeRegex = /^\s*([\<\>\:\@\#])\s*(.*)/;
var _onlyBindRegex = /^\$\(\$[^$]*\$\)\$$/;
var _getBind = function (value, split) {
    value = _escapeBuildString(value);
    var write, event, onceList = [], read = false, isOnce = false, onlyBing = _onlyBindRegex.test(value), readTxt;
    var type = '', reg, readContent = [split, value.replace(_cmdDecodeAttrRegex, function (find, content, index) {
            content = decodeURIComponent(content);
            reg = _bindTypeRegex.exec(content);
            var txt;
            if (reg) {
                type = reg[1];
                txt = reg[2];
            }
            else {
                type = '';
                txt = content;
            }
            readTxt = '';
            switch (type) {
                case ':':
                    onceList.push(txt);
                    isOnce = true;
                    readTxt = onlyBing ? 'once0' : [split, 'once' + (onceList.length - 1), split].join('+');
                    break;
                case '@':
                    event = txt;
                    break;
                case '>':
                    write = txt;
                    break;
                case '#':
                    write = txt;
                case '<': //只读
                default:
                    read = true;
                    readTxt = onlyBing ? txt : [split, 'CmpxLib.toStr(' + txt + ')', split].join('+');
                    break;
            }
            return readTxt;
        }), split].join('');
    if (onlyBing) {
        readContent = isOnce ? 'once0' : readTxt;
    }
    //readContent = readContent.replace(_removeEmptySplitRegex, '');
    var once;
    if (write || read || isOnce || onceList.length > 0) {
        if (isOnce) {
            var oList_1 = [];
            CmpxLib.each(onceList, function (item, index) {
                oList_1.push(['once', index, ' = ', onlyBing ? item : ('CmpxLib.toStr(' + item + ')')].join(''));
            });
            once = 'var ' + oList_1.join(',') + ';';
        }
        write && (write = 'function(val){ ' + write + ' = val; }');
        event = null;
    }
    else if (event) {
        event = 'function(event){ ' + event + '; }';
    }
    readContent = "(function(){\n  " + (once ? once : '') + "\n  return {\n    once:" + (once ? (read ? 'false' : 'true') : 'false') + ",\n    read:" + (read || isOnce ? 'function(){ return ' + readContent + '; }' : 'null') + ",\n    write:" + (write ? write : 'null') + ",\n    event:" + (event ? event : 'null') + "\n  };\n}).call(componet)";
    return { type: type, content: readContent };
};
var _makeTagInfoChildren = function (attrs, outList, len, index, parent) {
    if (index === void 0) { index = 0; }
    if (parent === void 0) { parent = null; }
    var item;
    while (index < len) {
        item = attrs[index++];
        if (item.cmd || item.target) {
            if (item.single)
                outList.push(item);
            else if (item.end) {
                break;
            }
            else {
                outList.push(item);
                item.children = [];
                index = _makeTagInfoChildren(attrs, item.children, len, index, item);
                if (item && item.cmd && item.tagName == 'else')
                    break;
            }
        }
        else {
            outList.push(item);
        }
    }
    return index;
};
var _registerVM = {};
var _vmName = '__vm__';
var _getVmConfig = function (componetDef) {
    return componetDef.prototype[_vmName];
};
var _getVmByComponetDef = function (componetDef) {
    var config = _getVmConfig(componetDef);
    return config ? _registerVM[config.name] : null;
};
var _readyRd = false;
var _renderPR = [];
/**
 * 注入组件配置信息
 * @param config
 */
function VM(vm) {
    return function (constructor) {
        _registerVM[vm.name] = {
            render: null,
            vm: vm,
            componetDef: constructor
        };
        var rdF = function () {
            //_registerVM[vm.name].render = new CompileRender(vm.tmpl, constructor);
            var head = document.head;
            if (vm.styleUrl && !CmpxLib.isString(vm.styleUrl)) {
                vm.style = vm.styleUrl();
                vm.styleUrl = null;
            }
            if (vm.style) {
                if (!CmpxLib.isString(vm.style))
                    vm.style = vm.style();
                head.appendChild(HtmlDef.getHtmlTagDef('style').createElement('style', [{
                        name: 'type', value: 'text/css'
                    }], head, vm.style));
            }
            if (vm.styleUrl) {
                head.appendChild(HtmlDef.getHtmlTagDef('link').createElement('link', [{
                        name: 'rel', value: 'stylesheet'
                    }, {
                        name: 'href', value: vm.styleUrl
                    }], head));
            }
            //优先tmplUrl
            var tmplUrl = vm.tmplUrl;
            if (CmpxLib.isString(tmplUrl) && _loadTmplFn) {
                _tmplCount++;
                _loadTmplFn(tmplUrl, function (tmpl) {
                    _registerVM[vm.name].render = new CompileRender(tmpl || vm.tmpl || '', constructor);
                    _tmplCount--;
                    _tmplChk();
                });
            }
            else
                _registerVM[vm.name].render = new CompileRender(tmplUrl || vm.tmpl || '', constructor);
        };
        _readyRd ? rdF() : _renderPR.push(rdF);
        constructor.prototype.$name = vm.name;
        constructor.prototype[_vmName] = vm;
    };
}
var _tmplCount = 0;
var _tmplFnList = [];
var _tmplLoaded = function (callback) {
    if (_tmplCount == 0)
        callback && callback();
    else
        callback && _tmplFnList.push(callback);
};
var _tmplChk = function () {
    (_tmplCount == 0) && CmpxLib.each(_tmplFnList, function (item) {
        item();
    });
};
var _viewvarName = '__viewvar__';
var _getViewvarDef = function (componet) {
    return componet && componet[_viewvarName];
};
/**
 * 引用模板变量$var
 * @param name 变量名称，未指定为属性名称
 */
function viewvar(name) {
    return function (componet, propKey) {
        name || (name = propKey);
        var vv = (componet[_viewvarName] || (componet[_viewvarName] = {}));
        vv[name || propKey] = propKey;
    };
}
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
            p.ready && this.subscribeIn('ready', p);
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
        CmpxLib.each(list, function (fn) {
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
        CmpxLib.each(this.updateList, function (fn) {
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
        CmpxLib.each(this.detachList, function (fn) {
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
        CmpxLib.each(list, function (fn) {
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
        CmpxLib.each(removeList, function (fn) {
            fn && fn(p);
        });
    };
    CompileSubject.prototype.clear = function () {
        this.initList = this.readyList
            = this.updateList = this.removeList = null;
    };
    return CompileSubject;
}());
var _tmplName = '__tmpl__';
var _getComponetTmpl = function (componet, id) {
    var tmpls = componet[_tmplName];
    if (!tmpls || !tmpls[id])
        return componet.$parent ? _getComponetTmpl(componet.$parent, id) : null;
    else
        return tmpls[id];
};
var _insertAfter = function (newElement, refElement, parent) {
    if (!parent)
        return;
    var nextSibling = refElement.nextSibling;
    if (nextSibling) {
        parent.insertBefore(newElement, nextSibling);
    }
    else
        parent.appendChild(newElement);
};
var _createTempNode = function () {
    return document.createTextNode('');
    // let element:Node = document.createElement('script');
    // element['type'] = 'text/html';
    // return element;
};
var _getRefNode = function (parentNode) {
    var tNode = _createTempNode();
    parentNode.appendChild(tNode);
    return tNode;
};
var _equalArrayIn = function (array1, array2) {
    var ok = true;
    CmpxLib.each(array1, function (item, index) {
        if (item != array2[index]) {
            ok = false;
            return false;
        }
    });
    return ok;
};
var _equalArray = function (array1, array2) {
    if ((!array1 || !array2))
        return array1 == array2;
    return array1.length == array2.length && _equalArrayIn(array1, array2);
};
var _getParentElement = HtmlDef.getParentElement;
var _removeChildNodes = function (childNodes) {
    if (childNodes && childNodes.length > 0) {
        var pNode_1;
        CmpxLib.each(childNodes, function (item) {
            (pNode_1 = _getParentElement(item)) && pNode_1.removeChild(item);
        });
    }
    return null;
};
var _detachElement = function (nodes) {
    if (nodes && nodes.length > 0) {
        var //pNode:Node = _getParentElement(nodes[0]),
        fragment_1 = document.createDocumentFragment();
        CmpxLib.each(nodes, function (item) {
            fragment_1.appendChild(item);
        });
        return fragment_1;
    }
    return null;
};
var CompileRender = (function () {
    /**
     *
     * @param tmpl html模板文本
     * @param componetDef 组件定义类，如果没有传为临时模板
     */
    function CompileRender(context, componetDef, param) {
        this.componetDef = componetDef;
        this.param = param;
        var fn;
        if (CmpxLib.isString(context)) {
            var tagInfos = _makeTagInfos(CmpxLib.trim(context, true));
            fn = _buildCompileFn(tagInfos);
        }
        else
            fn = context;
        this.contextFn = fn;
    }
    /**
     * 编译并插入到document
     * @param refElement 在element之后插入内容
     * @param parentComponet 父组件
     */
    CompileRender.prototype.complie = function (refNode, attrs, parentComponet, subject, contextFn, subjectExclude, param) {
        var _this = this;
        var componetDef = this.componetDef;
        subject || (subject = (parentComponet ? parentComponet.$subject : null));
        subjectExclude || (subjectExclude = {});
        subjectExclude.ready = true;
        var componet, isNewComponet = false, parentElement = _getParentElement(refNode), newSubject = new CompileSubject(subject, subjectExclude);
        if (componetDef) {
            isNewComponet = true;
            componet = new componetDef();
            componet.$name = name;
            componet.$subject = newSubject;
            componet.$parentElement = parentElement;
            componet.$parent = parentComponet;
            parentComponet && parentComponet.$children.push(componet);
        }
        else {
            //如果没有componetDef，为临时tmpl
            //传入的parentComponet为当前的componet
            componet = parentComponet;
        }
        //如果临时tmpl没有parentComponet报错
        if (!componet) {
            throw new Error('render缺少Componet参数');
        }
        CmpxLib.each(attrs, function (item) {
            componet[item.name] = item.value;
        });
        //注意parentElement问题，但现在context只能放{{tmpl}}
        contextFn && contextFn(componet, parentElement, newSubject, true);
        newSubject.subscribe({
            remove: function (p) {
                var rmFn = function () {
                    var vv = _getViewvarDef(componet);
                    CmpxLib.eachProp(vv, function (item) {
                        this[item] = null;
                    }, componet);
                    isNewComponet && (componet.$isDisposed = true, componet.onDispose());
                    if (p.componet == componet)
                        childNodes = _removeChildNodes(childNodes);
                }; //end rmFn
                try {
                    rmFn();
                }
                catch (e) {
                    CmpxLib.trace(e);
                }
                finally {
                    if (isNewComponet) {
                        if (parentComponet && !parentComponet.$isDisposed) {
                            var childs = parentComponet.$children, idx = childs.indexOf(componet);
                            (idx >= 0) && childs.splice(idx, 1);
                        }
                        componet.$subject = componet.$children =
                            componet.$parent = componet.$parentElement = null;
                    }
                }
            }
        });
        var childNodes;
        var fragment, initFn = function () {
            newSubject.init({
                componet: componet
            });
            fragment = document.createDocumentFragment();
            var detachFr;
            subject && subject.subscribe({
                detach: function () {
                    if (componet.$isDisposed)
                        return;
                    if (subject.isDetach)
                        detachFr = _detachElement(childNodes);
                    else {
                        if (isNewComponet)
                            newSubject.update({ componet: componet });
                        _insertAfter(detachFr, refNode, _getParentElement(refNode));
                        detachFr = null;
                    }
                },
                remove: function (p) {
                    fragment = refNode = componet = parentElement = parentComponet = null;
                }
            });
            var pt = CmpxLib.extend({}, _this.param);
            _this.contextFn.call(componet, CmpxLib, Compile, componet, fragment, newSubject, CmpxLib.extend(pt, param && param.call(componet)));
            childNodes = CmpxLib.toArray(fragment.childNodes);
            newSubject.update({
                componet: componet
            });
            readyFn();
        }, readyFn = function () {
            _insertAfter(fragment, refNode, _getParentElement(refNode));
            var readyEnd = function () {
                newSubject.ready({
                    componet: componet
                });
                //reay后再次补发update
                newSubject.update({
                    componet: componet
                });
            };
            if (isNewComponet)
                componet.onReady(function () {
                    readyEnd();
                }, null);
            else
                readyEnd();
        };
        if (isNewComponet) {
            componet.onInit(function (err) {
                initFn();
            }, null);
        }
        else
            initFn();
        return { newSubject: newSubject, refComponet: componet };
    };
    return CompileRender;
}());
var _loadTmplFn;
var Compile = (function () {
    function Compile() {
    }
    /**
     * 编译器启动，用于htmlDef配置后
     */
    Compile.startUp = function () {
        if (_readyRd)
            return;
        _readyRd = true;
        CmpxLib.each(_renderPR, function (item) {
            item();
        });
        _renderPR = null;
    };
    Compile.loadTmplCfg = function (loadTmplFn) {
        _loadTmplFn = loadTmplFn;
    };
    Compile.createElementEx = function (name, attrs, componet, parentElement, subject, contextFn, content) {
        if (subject.isRemove)
            return;
        if (_registerVM[name]) {
            Compile.createComponet.apply(this, arguments);
        }
        else {
            Compile.createElement.apply(this, arguments);
        }
    };
    Compile.createElement = function (name, attrs, componet, parentElement, subject, contextFn, content) {
        if (subject.isRemove)
            return;
        var element = HtmlDef.getHtmlTagDef(name).createElement(name, attrs, parentElement, content);
        parentElement.appendChild(element);
        contextFn && contextFn(componet, element, subject, false);
    };
    Compile.createComponet = function (name, attrs, componet, parentElement, subject, contextFn) {
        if (subject.isRemove)
            return;
        var vm = _registerVM[name], componetDef = vm.componetDef, refNode = _getRefNode(parentElement);
        Compile.renderComponet(componetDef, refNode, attrs, function (subject, componet) {
        }, componet, subject, contextFn);
    };
    Compile.setViewvar = function (addFn, removeFn, componet, element, subject, isComponet) {
        var vInfo = addFn && addFn.call(isComponet ? componet : element), owner = isComponet ? componet.$parent : componet, vv = _getViewvarDef(owner), propKey = vv && vv[vInfo.name], hasDef = !!(vv && propKey);
        hasDef && (owner[propKey] = vInfo.value);
        subject.subscribe({
            remove: function () {
                hasDef && (owner[propKey] = null);
                removeFn && removeFn.call(isComponet ? componet : element);
            }
        });
    };
    Compile.setAttributeEx = function (element, name, subName, content, componet, subject, isComponet) {
        if (isComponet) {
            Compile.setAttributeCP.apply(this, arguments);
        }
        else {
            Compile.setAttribute.apply(this, arguments);
        }
    };
    Compile.setAttributeCP = function (element, name, subName, content, componet, subject) {
        var isObj = !CmpxLib.isString(content), parent = componet.$parent;
        if (isObj) {
            var isEvent = !!content.event, update = void 0;
            if (isEvent) {
                var isBind_1 = false, eventDef_1 = componet[name], eventFn_1 = function () {
                    return content.event.apply(parent, arguments);
                };
                eventDef_1 || (eventDef_1 = componet[name] = new CmpxEvent());
                subject.subscribe({
                    update: function (p) {
                        if (isBind_1)
                            return;
                        isBind_1 = true;
                        eventDef_1.on(eventFn_1);
                    },
                    remove: function (p) {
                        isBind_1 && eventDef_1.off();
                        componet[name] = null;
                    }
                });
            }
            else {
                var value_1, newValue_1, isWrite_1 = !!content.write, isRead_1 = !!content.read, writeFn_1 = function (p) {
                    newValue_1 = componet[name];
                    if (value_1 != newValue_1) {
                        value_1 = newValue_1;
                        content.write.call(parent, newValue_1);
                        parent.$updateAsync();
                    }
                }, updateFn = function (p) {
                    if (isRead_1) {
                        newValue_1 = content.read.call(parent);
                        if (value_1 != newValue_1) {
                            value_1 = newValue_1;
                            componet[name] = value_1;
                            componet.$updateAsync();
                        }
                        else if (isWrite_1) {
                            writeFn_1(p);
                        }
                    }
                    else if (isWrite_1) {
                        writeFn_1(p);
                    }
                }, pSubP_1 = isWrite_1 || isRead_1 ? parent.$subject.subscribe({
                    update: updateFn
                }) : null;
                var attrDef = HtmlDef.getHtmlAttrDef(name);
                subject.subscribe({
                    update: updateFn,
                    remove: function () {
                        pSubP_1 && parent.$subject && parent.$subject.unSubscribe(pSubP_1);
                    }
                });
            }
        }
        else
            componet[name] = content;
    };
    Compile.createTextNode = function (content, componet, parentElement, subject) {
        if (subject.isRemove)
            return;
        var isObj = !CmpxLib.isString(content), value = '', once = isObj ? content.once : false, readFn = isObj ? content.read : null, textNode = document.createTextNode(isObj ? (once ? readFn.call(componet) : value) : content);
        parentElement.appendChild(textNode);
        subject.subscribe({
            update: function (p) {
                if (!once && readFn) {
                    var newValue = readFn.call(componet);
                    if (value != newValue) {
                        value = newValue;
                        textNode[('textContent' in textNode) ? 'textContent' : 'nodeValue'] = newValue;
                    }
                }
            }
        });
        return textNode;
    };
    Compile.setAttribute = function (element, name, subName, content, componet, subject) {
        var isObj = !CmpxLib.isString(content);
        if (isObj) {
            var isEvent = !!content.event, update = void 0, eventDef_2;
            if (isEvent) {
                var isBind_2 = false, eventFn_2 = function (e) { return content.event.call(componet, event); };
                eventDef_2 = HtmlDef.getHtmlEventDef(name);
                subject.subscribe({
                    update: function (p) {
                        if (isBind_2)
                            return;
                        isBind_2 = true;
                        eventDef_2.addEventListener(element, name, eventFn_2, false);
                    },
                    remove: function (p) {
                        if (isBind_2) {
                            eventDef_2.removeEventListener(element, name, eventFn_2, false);
                        }
                    }
                });
            }
            else {
                var value_2 = '', newValue_2, isWrite_2 = !!content.write, isRead_2 = !!content.read, writeFn_2 = function () {
                    newValue_2 = attrDef_1.getAttribute(element, name);
                    if (value_2 != newValue_2) {
                        value_2 = newValue_2;
                        content.write.call(componet, newValue_2);
                        componet.$updateAsync();
                    }
                };
                var attrDef_1 = HtmlDef.getHtmlAttrDef(name), writeEvent_1 = attrDef_1.writeEvent || ['change', 'click'];
                if (isWrite_2) {
                    eventDef_2 = HtmlDef.getHtmlEventDef(name);
                    CmpxLib.each(writeEvent_1, function (item) {
                        eventDef_2.addEventListener(element, item, writeFn_2, false);
                    });
                }
                subject.subscribe({
                    update: function (p) {
                        if (isRead_2) {
                            newValue_2 = content.read.call(componet);
                            if (value_2 != newValue_2) {
                                value_2 = newValue_2;
                                attrDef_1.setAttribute(element, name, value_2, subName);
                            }
                        }
                    },
                    remove: function (p) {
                        if (isWrite_2) {
                            CmpxLib.each(writeEvent_1, function (item) {
                                eventDef_2.removeEventListener(element, item, writeFn_2, false);
                            });
                        }
                    }
                });
            }
        }
        else
            HtmlDef.getHtmlAttrDef(name).setAttribute(element, name, content);
    };
    Compile.forRender = function (dataFn, eachFn, componet, parentElement, insertTemp, subject, syncFn) {
        if (subject.isRemove || !dataFn || !eachFn)
            return;
        var refNode = _getRefNode(parentElement);
        var value, newSubject;
        var childNodes, syncDatas, removeFn = function () {
            childNodes = _removeChildNodes(childNodes);
        }, detachFr;
        subject.subscribe({
            detach: function () {
                if (syncFn) {
                    if (subject.isDetach) {
                        var nodes_1 = [];
                        CmpxLib.each(syncDatas, function (item) {
                            nodes_1 = nodes_1.concat(item.nodes);
                        });
                        detachFr = _detachElement(nodes_1);
                        nodes_1 = null;
                    }
                    else {
                        detachFr && _insertAfter(detachFr, refNode, _getParentElement(refNode));
                    }
                }
                else {
                    if (subject.isDetach) {
                        detachFr = _detachElement(childNodes);
                    }
                    else {
                        detachFr && _insertAfter(detachFr, refNode, _getParentElement(refNode));
                        detachFr = null;
                    }
                }
            },
            update: function (p) {
                var datas = dataFn.call(componet, componet, parentElement, subject);
                if (!_equalArray(datas, value)) {
                    var isArray = CmpxLib.isArray(datas);
                    //如果有数据
                    if (datas) {
                        //如果不是数组，转为一个数组
                        isArray || (datas = [datas]);
                        var count_1 = datas.length;
                        if (syncFn) {
                            //同步模式，同步性生成view
                            var lastNode_1 = refNode;
                            var rmList_1 = [], //要删除的数据
                            dataList_1 = []; //合并后的数据
                            (function (oldDatas, newDatas) {
                                var hasList = [], nIdx;
                                //计算要删除的数据和保留的数据
                                CmpxLib.each(oldDatas, function (item, index) {
                                    //在新数据的位置
                                    nIdx = syncFn.call(componet, item.data, count_1, index, datas);
                                    if (nIdx >= 0) {
                                        item.data = newDatas[nIdx];
                                        item.newIndex = nIdx;
                                        hasList.push(item);
                                    }
                                    else
                                        rmList_1.push(item);
                                });
                                //新数据与保留数据合并
                                CmpxLib.each(newDatas, function (item, index) {
                                    //在保留数据里的位置
                                    nIdx = CmpxLib.inArray(hasList, function (item) { return item.newIndex == index; });
                                    if (nIdx >= 0) {
                                        //保留数据，已有数据
                                        dataList_1.push(hasList[nIdx]);
                                    }
                                    else {
                                        //新数据, 没有fn属性
                                        dataList_1.push({
                                            index: index,
                                            data: item
                                        });
                                    }
                                });
                            })(syncDatas, datas);
                            syncDatas = dataList_1;
                            //删除多余节点(Node)
                            CmpxLib.each(rmList_1, function (item) {
                                item.nodes = _removeChildNodes(item.nodes);
                                item.subject.remove({
                                    componet: componet
                                });
                                item.subject = item.nodes = null;
                            });
                            var lastIndex_1 = -1;
                            CmpxLib.each(syncDatas, function (item, index) {
                                var fragm;
                                if (item.fn) {
                                    //根据fn数据来确认保留数据
                                    if (item.index < lastIndex_1) {
                                        //根据原有index，如果大过上一个从中保留数据的原有index,移动原来的node
                                        lastIndex_1 = item.index;
                                        fragm = document.createDocumentFragment();
                                        CmpxLib.each(item.nodes, function (node) {
                                            fragm.appendChild(node);
                                        });
                                        item.fn.call(componet, item.data, count_1, index);
                                        item.subject.update({
                                            componet: componet
                                        });
                                        _insertAfter(fragm, lastNode_1, _getParentElement(lastNode_1));
                                    }
                                    else {
                                        //不用移动位置，只刷新数据
                                        lastIndex_1 = item.index;
                                        //重新处理for 变量
                                        item.fn.call(componet, item.data, count_1, index);
                                        item.subject.update({
                                            componet: componet
                                        });
                                    }
                                    //设置现在的index
                                    item.index = index;
                                }
                                else {
                                    //如果不存在，新建
                                    var st = item.subject = new CompileSubject(subject);
                                    fragm = document.createDocumentFragment();
                                    item.fn = eachFn.call(componet, item.data, count_1, index, componet, fragm, st);
                                    item.nodes = CmpxLib.toArray(fragm.childNodes);
                                    st.update({
                                        componet: componet
                                    });
                                    _insertAfter(fragm, lastNode_1, _getParentElement(lastNode_1));
                                }
                                //设置新的loasNode，用于插入位置
                                lastNode_1 = item.nodes[item.nodes.length - 1] || lastNode_1;
                            });
                        }
                        else {
                            //普通模式, 一次性全部重新生成view
                            var fragment_2 = document.createDocumentFragment();
                            removeFn();
                            newSubject && newSubject.remove({
                                componet: componet
                            });
                            newSubject = new CompileSubject(subject);
                            CmpxLib.each(datas, function (item, index) {
                                eachFn.call(componet, item, count_1, index, componet, fragment_2, newSubject);
                            });
                            childNodes = CmpxLib.toArray(fragment_2.childNodes);
                            newSubject.update({
                                componet: componet
                            });
                            _insertAfter(fragment_2, refNode, _getParentElement(refNode));
                            fragment_2 = null;
                        }
                    }
                    else
                        newSubject = null;
                    //如果是数组，复制一份，如果不是直接备份，有用比较
                    value = isArray ? datas.slice() : datas;
                }
            },
            remove: function (p) {
                removeFn();
                newSubject = childNodes = refNode = detachFr = null;
            }
        });
    };
    Compile.updateRender = function (fn, componet, element, subject) {
        subject.subscribe({
            update: function () {
                fn.call(componet);
            }
        });
    };
    
    Compile.ifRender = function (ifFun, trueFn, falseFn, componet, parentElement, insertTemp, subject, isX) {
        if (subject.isRemove)
            return;
        var refNode = _getRefNode(parentElement), value, newSubject, childNodes, removeFn = function () {
            isX || (childNodes = _removeChildNodes(childNodes));
        };
        var fragment;
        var trueFragment, trueSubject, trueNodes, falseFragment, falseSubject, falseNodes;
        subject.subscribe({
            detach: function () {
                if (isX) {
                    if (subject.isDetach) {
                        fragment = _detachElement(value ? trueNodes : falseNodes);
                    }
                    else {
                        _insertAfter(fragment, refNode, _getParentElement(refNode));
                        fragment = null;
                    }
                }
                else {
                    if (subject.isDetach) {
                        fragment = _detachElement(childNodes);
                    }
                    else {
                        _insertAfter(fragment, refNode, _getParentElement(refNode));
                        fragment = null;
                    }
                }
            },
            update: function (p) {
                var newValue = !!ifFun.call(componet, componet, parentElement, subject);
                if (newValue != value) {
                    value = newValue;
                    if (isX) {
                        if (newValue) {
                            falseNodes && (falseFragment = _detachElement(falseNodes));
                            falseSubject && falseSubject.detach({
                                componet: componet
                            });
                            if (trueFragment) {
                                fragment = trueFragment;
                                trueSubject.detach({
                                    componet: componet
                                });
                            }
                            else {
                                trueSubject = new CompileSubject(subject);
                                fragment = document.createDocumentFragment();
                                trueFn.call(componet, componet, fragment, trueSubject);
                                trueNodes = CmpxLib.toArray(fragment.childNodes);
                            }
                            newSubject = trueSubject;
                        }
                        else {
                            trueNodes && (trueFragment = _detachElement(trueNodes));
                            trueSubject && trueSubject.detach({
                                componet: componet
                            });
                            if (falseFragment) {
                                fragment = falseFragment;
                                falseSubject.detach({
                                    componet: componet
                                });
                            }
                            else {
                                falseSubject = new CompileSubject(subject);
                                fragment = document.createDocumentFragment();
                                falseFn.call(componet, componet, fragment, falseSubject);
                                falseNodes = CmpxLib.toArray(fragment.childNodes);
                            }
                            newSubject = falseSubject;
                        }
                        newSubject.update({
                            componet: componet
                        });
                        _insertAfter(fragment, refNode, _getParentElement(refNode));
                        fragment = null;
                    }
                    else {
                        removeFn();
                        newSubject && newSubject.remove({
                            componet: componet
                        });
                        newSubject = new CompileSubject(subject);
                        fragment = document.createDocumentFragment();
                        if (newValue)
                            trueFn.call(componet, componet, fragment, newSubject);
                        else
                            falseFn.call(componet, componet, fragment, newSubject);
                        childNodes = CmpxLib.toArray(fragment.childNodes);
                        newSubject.update({
                            componet: componet
                        });
                        _insertAfter(fragment, refNode, _getParentElement(refNode));
                        fragment = null;
                    }
                }
            },
            remove: function (p) {
                removeFn();
                newSubject = childNodes = refNode
                    = falseNodes = trueNodes = falseSubject = trueSubject = null;
            }
        });
    };
    Compile.tmplRender = function (id, componet, parentElement, subject, contextFn) {
        if (subject.isRemove)
            return;
        var tmpls = componet[_tmplName], $componet = componet;
        tmpls || (tmpls = componet[_tmplName] = {});
        tmpls[id] = function (componet, element, subject, param) {
            if ($componet != componet) {
                //如果tmpl在不同的component, 将this为当前域，夸域处理
                subject = new CompileSubject(subject);
                var pSubject_1 = $componet.$subject, subsP_1 = pSubject_1.subscribe({
                    update: function (p) {
                        subject.update(p);
                    }
                });
                subject.subscribe({
                    remove: function () {
                        subsP_1 && pSubject_1.unSubscribe(subsP_1);
                    }
                });
            }
            contextFn && contextFn.call($componet, $componet, element, subject, param);
        };
    };
    Compile.includeRender = function (context, contextFn, componet, parentElement, insertTemp, subject, param) {
        if (!context || subject.isRemove)
            return;
        if (CmpxLib.isString(context)) {
            var tmpl = _getComponetTmpl(componet, context);
            if (tmpl) {
                var pTmep_1 = (param && param.call(componet)) || {};
                param && subject.subscribe({
                    update: function () {
                        CmpxLib.extend(pTmep_1, param.call(componet));
                    }
                });
                if (tmpl)
                    tmpl(componet, parentElement, subject, pTmep_1);
                else if (contextFn) {
                    contextFn.call(componet, componet, parentElement, subject, pTmep_1);
                }
            }
        }
        else {
            var render_1, preSubject_1, preComponet_1, refNode_1 = _getRefNode(parentElement);
            subject.subscribe({
                update: function (p) {
                    var newRender = context.call(componet);
                    if (newRender != render_1) {
                        render_1 = newRender;
                        preSubject_1 && preSubject_1.remove({
                            componet: preComponet_1
                        });
                        var _a = newRender.complie(refNode_1, [], componet, subject, null, null, param), newSubject = _a.newSubject, refComponet = _a.refComponet;
                        preSubject_1 = newSubject;
                        preComponet_1 = refComponet;
                    }
                    else
                        preSubject_1.update({
                            componet: preComponet_1
                        });
                },
                remove: function (p) {
                    render_1 = preSubject_1 = preComponet_1 = refNode_1 = null;
                }
            });
        }
    };
    Compile.renderComponet = function (componetDef, refNode, attrs, complieEnd, parentComponet, subject, contextFn) {
        _tmplLoaded(function () {
            var vm = _getVmByComponetDef(componetDef), render = vm && vm.render;
            if (!vm)
                throw new Error('not find @VM default!');
            var _a = render.complie(refNode, attrs, parentComponet, subject, contextFn, { update: true }), newSubject = _a.newSubject, refComponet = _a.refComponet;
            complieEnd && complieEnd.call(refComponet, newSubject, refComponet);
        });
    };
    return Compile;
}());
var _buildCompileFn = function (tagInfos) {
    var outList = [], varNameList = [];
    _buildCompileFnContent(tagInfos, outList, varNameList, true);
    varNameList.length > 0 && outList.unshift('var ' + varNameList.join(',') + ';');
    outList.unshift("var __tmplRender = Compile.tmplRender,\n        __setAttributeEx = Compile.setAttributeEx, __createElementEx = Compile.createElementEx,\n        __createTextNode = Compile.createTextNode, __setViewvar = Compile.setViewvar,\n        __forRender = Compile.forRender, __ifRender = Compile.ifRender,\n        __includeRender = Compile.includeRender, __updateRender = Compile.updateRender,\n        __componet = componet;");
    return new Function('CmpxLib', 'Compile', 'componet', 'element', 'subject', 'param', outList.join('\n'));
};
var _escapeBuildString = function (s) {
    return s ? s.replace(/([\"\\])/gm, '\\$1').replace(/\n/gm, '\\n').replace(/\r/gm, '\\r') : '';
};
var _makeSubName = function (name) {
    if (name.indexOf('.') > 0) {
        return name.split('.');
    }
    else
        return [name, ''];
};
var _makeElementTag = function (tagName, attrs) {
    var bindAttrs = [], stAtts = [], names;
    CmpxLib.each(attrs, function (item) {
        if (item.name == '$var' || item.name == '$array')
            return;
        if (item.bind)
            bindAttrs.push(item);
        else {
            names = _makeSubName(item.name);
            stAtts.push({ name: names[0], value: _escapeBuildString(item.value), subName: names[1] });
        }
    });
    return { bindAttrs: bindAttrs, stAtts: stAtts };
};
var _buildAttrContent = function (attrs, outList) {
    if (!attrs)
        return;
    var names;
    CmpxLib.each(attrs, function (attr, index) {
        names = _makeSubName(attr.name);
        outList.push('__setAttributeEx(element, "' + names[0] + '", "' + names[1] + '", ' + attr.bindInfo.content + ', componet, subject, isComponet);');
    });
};
var _getViewvarName = function (attrs) {
    var name = { item: null, list: null }, has = false;
    CmpxLib.each(attrs, function (attr, index) {
        if (attr.name == '$var') {
            name.item = CmpxLib.trim(attr.value);
            has = true;
            return false;
        }
        else if (attr.name == '$array') {
            name.list = CmpxLib.trim(attr.value);
            has = true;
            return false;
        }
    });
    return has ? name : null;
};
var _getInsertTemp = function (preInsert) {
    return preInsert ? 'true' : 'false';
};
var _getTagContent = function (tagInfo) {
    var content;
    CmpxLib.each(tagInfo.children, function (item) {
        content = CmpxLib.decodeHtml(item.content);
    });
    return content;
};
var _buildCompileFnForVar = function (itemName, outList) {
    var str = ['var ', itemName, '_index, ', itemName, '_count, $last, ', itemName, '_last, $first, ', itemName, '_first, $odd, ', itemName, '_odd, $even, ', itemName, '_even,\n',
        'setForVar = function (item, count, index) {\n',
        '$index = ', itemName, '_index = index, $count = ', itemName, '_count = count;\n',
        '$last = ', itemName, '_last = (count - index == 1), $first = ', itemName, '_first = (index == 0), $odd = ', itemName, '_odd = (index % 2 == 0), $even = ', itemName, '_even = !$odd;\n',
        '};\n',
        'setForVar.call(componet, item, $count, $index);'
    ].join('');
    outList.push(str);
};
var _buildCompileFnContent = function (tagInfos, outList, varNameList, preInsert, inclue) {
    if (!tagInfos)
        return;
    CmpxLib.each(tagInfos, function (tag, index) {
        var tagName = tag.tagName;
        //如果指定include, 非tagName或不包涵，不引入
        if (inclue && (!tagName || inclue.indexOf(tagName) < 0))
            return;
        if (!tag.cmd) {
            if (tag.target) {
                var hasChild = tag.children && tag.children.length > 0, hasAttr = tag.attrs && tag.attrs.length > 0, varName = hasAttr ? _getViewvarName(tag.attrs) : null;
                if (varName) {
                    varName.item && varNameList.push(varName.item);
                    varName.list && varNameList.push(varName.list + ' = []');
                }
                var htmlTagDef = tag.htmlTagDef, rawTag = htmlTagDef.raw, tagContent = rawTag && _getTagContent(tag);
                //如果rawTag没有子级
                hasChild && (hasChild = !rawTag);
                if (hasAttr || hasChild || varName) {
                    var _a = _makeElementTag(tagName, tag.attrs), bindAttrs = _a.bindAttrs, stAtts = _a.stAtts;
                    outList.push('__createElementEx("' + tagName + '", ' + JSON.stringify(stAtts) + ', componet, element, subject, function (componet, element, subject, isComponet) {');
                    if (varName) {
                        outList.push('__setViewvar(function(){');
                        varName.item && outList.push(varName.item + ' = this;');
                        varName.list && outList.push(varName.list + '.push(this);');
                        varName.item && outList.push('return {name:"' + varName.item + '", value:' + varName.item + '}');
                        varName.list && outList.push('return {name:"' + varName.list + '", value:' + varName.list + '}');
                        outList.push('}, function(){');
                        varName.item && outList.push(varName.item + ' = null;');
                        varName.list && outList.push('var idx = ' + varName.list + '.indexOf(this); idx >= 0 && ' + varName.list + '.splice(idx, 1);');
                        outList.push('}, componet, element, subject, isComponet);');
                    }
                    _buildAttrContent(bindAttrs, outList);
                    hasChild && _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                    outList.push('}, "' + _escapeBuildString(tagContent) + '");');
                }
                else {
                    outList.push('__createElementEx("' + tagName + '", [], componet, element, subject, null, "' + _escapeBuildString(tagContent) + '");');
                }
                preInsert = false;
            }
            else {
                if (tag.bind) {
                    outList.push('__createTextNode(' + tag.bindInfo.content + ', componet, element, subject);');
                }
                else
                    outList.push('__createTextNode("' + _escapeBuildString(tag.content) + '", componet, element, subject);');
                preInsert = false;
            }
        }
        else {
            switch (tagName) {
                case 'for':
                case 'forx':
                    var isForX = (tagName == 'forx'), extend = tag.attrs[0].extend, itemName = extend.item, fSync = extend.sync;
                    outList.push('__forRender(function (componet, element, subject) {');
                    outList.push('return ' + extend.datas + ';');
                    outList.push('}, function (' + itemName + ', $count, $index, componet, element, subject) {');
                    _buildCompileFnForVar(itemName, outList);
                    var forTmpl = extend.tmpl;
                    if (forTmpl)
                        outList.push('__includeRender("' + _escapeBuildString(forTmpl) + '", componet, element, ' + _getInsertTemp(preInsert) + ', subject, ' + itemName + ');');
                    else
                        _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                    outList.push('return setForVar;');
                    var fSyFn = 'null';
                    if (isForX || extend.sync) {
                        var syncCT = extend.syncCT;
                        //function(item, count, index, newList)=>返回index表示已存在的位置，-1表示不存在;
                        fSyFn = syncCT ? 'function(){ var fn = ' + syncCT + '; return fn ? fn.apply(this, arguments) : -1; }'
                            : 'function(item, count, index, newList){ return newList ? newList.indexOf(item) : -1; }';
                    }
                    outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject, ' + fSyFn + ');');
                    preInsert = true;
                    break;
                case 'if':
                case 'ifx':
                    var isX_1 = (tagName == 'ifx'), ifFn_1 = function (ifTag) {
                        var ifChild = ifTag.children, hasElse = ifChild ? ifChild[ifChild.length - 1].tagName == 'else' : false, elseTag = hasElse ? ifChild.pop() : null;
                        outList.push('__ifRender(function (componet, element, subject) {');
                        outList.push('return ' + (ifTag.content || 'true'));
                        outList.push('}, function (componet, element, subject) {');
                        _buildCompileFnContent(ifChild, outList, varNameList, preInsert);
                        outList.push('}, function (componet, element, subject) {');
                        if (hasElse) {
                            ifFn_1(elseTag);
                            //_buildCompileFnContent(elseTag.children, outList, varNameList, preInsert);
                        }
                        outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject, ' + (isX_1 ? 'true' : 'false') + ');');
                    };
                    ifFn_1(tag);
                    preInsert = true;
                    break;
                case 'include':
                    var incAttr = CmpxLib.arrayToObject(tag.attrs, 'name'), incTmpl = incAttr['tmpl'], incParam = incAttr['param'] ? incAttr['param'].value : 'null', incRender = incAttr['render'], hasIncChild = tag.children && tag.children.length > 0;
                    incParam = incParam == 'null' ? incParam : ('function(){ return ' + incParam + ';}');
                    incRender && (incRender = 'function(){ return ' + incRender.value + '}');
                    var context = incRender ? incRender : ('"' + (incTmpl ? _escapeBuildString(incTmpl.value) : '') + '"');
                    if (hasIncChild) {
                        outList.push('__includeRender(' + context + ', function (componet, element, subject) {');
                        _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                        outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject,  ' + incParam + ');');
                    }
                    else
                        outList.push('__includeRender(' + context + ', null, componet, element, ' + _getInsertTemp(preInsert) + ', subject,  ' + incParam + ');');
                    preInsert = true;
                    break;
                case 'tmpl':
                    var tmplAttr = CmpxLib.arrayToObject(tag.attrs, 'name'), tmplId = tmplAttr['id'], tmplLet = tmplAttr['let'];
                    outList.push('__tmplRender("' + (tmplId ? _escapeBuildString(tmplId.value) : '') + '", __componet, element, subject, function (componet, element, subject, param) {');
                    tmplLet && outList.push('var ' + tmplLet.value + ';');
                    tmplLet && outList.push('__updateRender(function(){' + tmplLet.value + '}, componet, element, subject);');
                    _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                    outList.push('});');
                    break;
            }
        }
    });
};

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
            _this.$subject.update({
                componet: _this,
                param: p
            });
            _this.onUpdate(function () { }, p);
        }, p);
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
        var rd = new CompileRender(tmpl);
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

var Platform = (function () {
    function Platform() {
    }
    return Platform;
}());

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var _getParentElement$1 = HtmlDef.getParentElement;
var _setAttribute = function (element, attrs) {
    CmpxLib.each(attrs, function (item) {
        HtmlDef.getHtmlAttrDef(item.name).setAttribute(element, item.name, item.value, item.subName);
    });
};
var _htmlTtype = /script|style/i;
var _createElementRaw = function (name, attrs, parent, content) {
    var element = document.createElement(name);
    element[_htmlTtype.test(name) ? 'innerHTML' : 'innerText'] = content || "";
    _setAttribute(element, attrs);
    return element;
};
var _rawTag = new HtmlTagDef({
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
    HtmlDef.extendHtmlTagDef({
        //默认不支持svg, 请处理HtmlTagDef的createElement参数
        'svg': DEFULE_TAG,
        //默认不支持math, 请处理HtmlTagDef的createElement参数
        'math': DEFULE_TAG,
        'br': SINGLE_TAG,
        'style': _rawTag,
        'script': _rawTag,
        'title': _rawTag,
        'textarea': _rawTag
    });
    var modelChecked = /radio|checkbox/i;
    //扩展attr, 如果不支持请在这里扩展
    HtmlDef.extendHtmlAttrDef({
        'name': DEFAULT_ATTR,
        'value': DEFAULT_ATTR_PROP,
        'type': DEFAULT_ATTR_PROP,
        'model': {
            setAttribute: function (element, name, value, subName) {
                if (modelChecked.test(element['type']))
                    element['checked'] = element['value'] == value;
                else
                    element['value'] = CmpxLib.toStr(value);
            },
            getAttribute: function (element, name, subName) {
                return !modelChecked.test(element['type']) || element['checked'] ? element['value'] : '';
            },
            writeEvent: ['change', 'click']
        }
    });
    //扩展事件处理, 如果不支持请在这里扩展
    HtmlDef.extendHtmlEventDef({
        "click": DEFAULT_EVENT_DEF
    });
    // //更改默认值，参考如下：
    // DEFAULT_EVENT_DEF.addEventListener = (element: HTMLElement, eventName: string, context: (event: any) => any, useCapture: boolean) {
    //     element.addEventListener(eventName, context, useCapture);
    //     //attachEvent
    // }
    Compile.loadTmplCfg(function (url, cb) {
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
        Compile.startUp();
        return _this;
    }
    Browser.prototype.boot = function (componetDef) {
        var name = componetDef.prototype.$name, bootElement = document.getElementsByTagName(name)[0];
        if (!bootElement)
            throw new Error("\u6CA1\u6709" + name + "\u6807\u7B7E");
        var _doc = document, parentElement = _getParentElement$1(bootElement);
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
            var parentElement = _getParentElement$1(bootElement);
            Compile.renderComponet(componetDef, bootElement, [], function (newSubject, refComponet) {
                parentElement.removeChild(bootElement);
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
}(Platform));

exports.CmpxLib = CmpxLib;
exports.CmpxEvent = CmpxEvent;
exports.DEFAULT_CREATEELEMENT = DEFAULT_CREATEELEMENT;
exports.HtmlTagDef = HtmlTagDef;
exports.SINGLE_TAG = SINGLE_TAG;
exports.DEFULE_TAG = DEFULE_TAG;
exports.DEFAULT_ATTR = DEFAULT_ATTR;
exports.DEFAULT_ATTR_PROP = DEFAULT_ATTR_PROP;
exports.DEFAULT_EVENT_DEF = DEFAULT_EVENT_DEF;
exports.HtmlDef = HtmlDef;
exports.VM = VM;
exports.viewvar = viewvar;
exports.CompileSubject = CompileSubject;
exports.CompileRender = CompileRender;
exports.Compile = Compile;
exports.Componet = Componet;
exports.Platform = Platform;
exports.Browser = Browser;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cmpx.umd.js.map
