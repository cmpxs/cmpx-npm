"use strict";
exports.__esModule = true;
var cmpxLib_1 = require("./cmpxLib");
var htmlDef_1 = require("./htmlDef");
var componet_1 = require("./componet");
var cmpxEvent_1 = require("./cmpxEvent");
var compileSubject_1 = require("./compileSubject");
var _undef;
var _getBindDef = function (target, name) {
    var context = VMManager.getBind(target, name);
    return context ? context.def : null;
};
/**
 * 注入组件配置信息
 * @param config
 */
function VMBind(config) {
    return function (constructor) {
        var target = constructor.prototype, context = {
            name: config.name,
            type: 'Bind',
            def: constructor
        };
        VMManager.setConfig(target, config);
        VMManager.include(target, context, null);
    };
}
exports.VMBind = VMBind;
var _attrEventName = 'events', _getBindEvents = function (bind) {
    return VMManager.getVM(bind, _attrEventName);
};
/**
 * 引用模板事件
 * @param name 变量名称，未指定为属性名称
 */
function VMEvent(name) {
    return function (bind, propKey) {
        name || (name = propKey);
        var events = VMManager.getVM(bind, _attrEventName, []);
        events.push({
            name: name,
            fn: bind[propKey]
        });
    };
}
exports.VMEvent = VMEvent;
var _vmAttrName = 'attrs', _getVmAttrs = function (target) {
    return VMManager.getVM(target, _vmAttrName);
};
/**
 * 引用模板变量attr
 * @param name 变量名称，未指定为属性名称
 */
function VMAttr(name) {
    return function (target, propKey) {
        name || (name = propKey);
        var names = VMManager.getVM(target, _vmAttrName, {});
        names[name] = propKey;
    };
}
exports.VMAttr = VMAttr;
var _vmWatchName = 'watchs', _getWatch = function (target) {
    return VMManager.getVM(target, _vmWatchName);
}, _getWatchContext = function (target) {
    var watchs = _getWatch(target);
    if (!watchs)
        return null;
    var values = {}, getVal = function (name) {
        return values[name] || (values[name] = []);
    };
    return function () {
        var val, newVal, fn, isC, res, valList;
        cmpxLib_1.CmpxLib.each(watchs, function (item) {
            valList = getVal(item.name);
            fn = item.fn;
            isC = false;
            res = [];
            cmpxLib_1.CmpxLib.each(item.watchs, function (item, idx) {
                val = valList[idx];
                if (cmpxLib_1.CmpxLib.isArray(item)) {
                    var newValList_1 = [];
                    val || (val = []);
                    isC = true;
                    cmpxLib_1.CmpxLib.each(item, function (item, idx) {
                        newVal = item.call(target);
                        if (_equals(val[idx], newVal)) {
                            isC = false;
                        }
                        newValList_1.push(newVal);
                    });
                    res.push(newValList_1);
                }
                else {
                    newVal = item.call(target);
                    if (!_equals(val, newVal)) {
                        isC = true;
                        //valList[idx] = newVal;
                    }
                    res.push(newVal);
                }
            });
            if (isC) {
                values[item.name] = res;
                fn.apply(target, res);
            }
        });
    };
};
/**
 * 引用模板变量watch
 * @param p
 */
function VMWatch() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (target, propKey) {
        var watchs = VMManager.getVM(target, _vmWatchName, []), fn = target[propKey], res = [];
        cmpxLib_1.CmpxLib.each(args, function (item) {
            if (cmpxLib_1.CmpxLib.isArray(item)) {
                var tL_1 = [];
                cmpxLib_1.CmpxLib.each(item, function (item) {
                    tL_1.push(cmpxLib_1.CmpxLib.isString(item) ? new Function(['return ', item].join('')) : item);
                });
                res.push(tL_1);
            }
            else
                res.push(cmpxLib_1.CmpxLib.isString(item) ? new Function(['return ', item].join('')) : item);
        });
        watchs.push({
            name: propKey,
            watchs: res,
            fn: fn
        });
    };
}
exports.VMWatch = VMWatch;
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
}, _singleCmd = {
    'include': true
}, _encodeURIComponentEx = function (s) {
    return encodeURIComponent(s).replace(/'/g, '%27');
}, 
//将{{this.name}}绑定标签转成$($this.name$)$
_cmdEncodeAttrRegex = /\{\{\{((?:.|\r|\n)*?)\}\}\}|\{\{((?!\/|\s*(?:if|ifx|else|for|forx|tmpl|include|html)[ \}])(?:.|\r|\n)+?)\}\}/gm, _makeTextTag = function (tmpl) {
    //
    return tmpl.replace(_cmdEncodeAttrRegex, function (find, content, content1) {
        return ['$($', _encodeURIComponentEx(content || content1), '$)$'].join('');
    });
}, 
//把$($this.name$)$还原
_cmdDecodeAttrRegex = /\$\(\$(.+?)\$\)\$/gm, _backTextTag = function (tmpl) {
    //
    return tmpl.replace(_cmdDecodeAttrRegex, function (find, content) {
        return ['{{', decodeURIComponent(content), '}}'].join('');
    });
}, 
//查找分析tag和cmd
_tagInfoRegex = /\<\s*(\/*)\s*([^<>\s]+)\s*([^<>]*?)(\/*)\s*\>|\{\{\s*(\/*)\s*([^\s\{\}]+)\s*(.*?)(\/*)\}\}/gim, _makeTagInfos = function (tmpl) {
    var lastIndex = 0, list = [];
    tmpl = _makeTextTag(tmpl);
    tmpl = htmlDef_1.HtmlDef.handleTagContent(tmpl);
    tmpl.replace(_tagInfoRegex, function (find, end1, tagName, tagContent, end2, txtEnd1, txtName, txtContent, txtEnd2, index) {
        if (index > lastIndex) {
            list.push(_newTextContent(tmpl, lastIndex, index));
        }
        var cmd = !!txtName, htmlTagDef = cmd ? null : htmlDef_1.HtmlDef.getHtmlTagDef(tagName), single = !!end2 || !!txtEnd2 || (cmd ? (_singleCmd[txtName] && !!txtEnd2) : htmlTagDef.single), end = !!end1 || !!txtEnd1 || single;
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
                htmlTagDef: htmlTagDef
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
}, 
//获取attrInfo
_attrInfoRegex = /\s*([^= ]+)\s*=\s*(?:(["'])((?:.|\n|\r)*?)\2|([^"' ><]*))|\s*([^= /]+)\s*/gm, _getAttrInfos = function (content) {
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
}, 
//获取cmd form attrInfo
//_forAttrRegex = /\s*([^\s]+)\s*\in\s*([^\s]+)\s*(?:\s*tmpl\s*=\s*([\'\"])(.*?)\3)*/i,
_forAttrRegex = /\s*([^\s]+)\s*\in\s*([^\s]+)\s*(?:\s*(sync)(?:\s*=\s*([\'\"])(.*?)\4)*)*/i, _getForAttrInfos = function (content) {
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
}, _bindTypeRegex = /^\s*([\<\>\:\@\#])\s*(.*)/, _removeEmptySplitRegex = /^['"]{2,2}\+|\+['"]{2,2}/g, _onlyBindRegex = /^\$\(\$[^$]*\$\)\$$/, 
//获取内容绑定信息，如 name="aaa{{this.name}}"
_getBind = function (value, split) {
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
                case ':'://一次只读
                    onceList.push(txt);
                    isOnce = true;
                    readTxt = onlyBing ? 'once0' : [split, 'once' + (onceList.length - 1), split].join('+');
                    break;
                case '@'://事件
                    event = txt;
                    break;
                case '>'://只写
                    write = txt;
                    break;
                case '#'://读写
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
            cmpxLib_1.CmpxLib.each(onceList, function (item, index) {
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
}, _makeTagInfoChildren = function (attrs, outList, len, index, parent) {
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
var _vmName = "__vm__", _vmConfigName = 'config', _vmContextName = 'context', _vmOtherName = 'other';
var VMManager = (function () {
    function VMManager() {
    }
    /**
     * VM 内容
     * @param target
     * @param name
     * @param context
     */
    VMManager.setVM = function (target, name, context) {
        var vm = target[_vmName] || (target[_vmName] = {});
        return vm[name] = context;
    };
    /**
     * 获取MV内容
     * @param target
     * @param name
     * @param defaultP 如果不存在时，此为默认内容
     */
    VMManager.getVM = function (target, name, defaultP) {
        var vm = target[_vmName], re = vm && vm[name];
        if (!re && defaultP) {
            re = this.setVM(target, name, defaultP);
        }
        return re;
    };
    VMManager.include = function (target, context, include, parent) {
        var obj = {
            parent: null,
            context: context,
            componets: {},
            binds: {}
        }, temp;
        var a;
        cmpxLib_1.CmpxLib.each(include, function (item) {
            temp = this.getContext(item.prototype);
            if (temp) {
                switch (temp.type) {
                    case 'Componet':
                        obj.componets[temp.name] = temp;
                        break;
                    case 'Bind':
                        obj.binds[temp.name] = temp;
                        break;
                }
            }
        }, this);
        return this.setVM(target, _vmContextName, obj);
    };
    VMManager.getContext = function (target) {
        var obj = this.getVM(target, _vmContextName);
        return obj && obj.context;
    };
    VMManager.getContextEx = function (target, type, name) {
        var obj = this.getVM(target, _vmContextName);
        var items = obj && obj[type], cp = items && items[name], parent;
        if (!cp && this.parent && obj.context) {
            parent = this.parent(target, obj.context);
        }
        return cp || (parent && this.getContextEx(parent, type, name));
    };
    VMManager.getComponet = function (target, name) {
        return name ? this.getContextEx(target, 'componets', name)
            : this.getContext(target);
    };
    VMManager.getBind = function (target, name) {
        return name ? this.getContextEx(target, 'binds', name)
            : this.getContext(target);
    };
    /**
     * 配置
     * @param target
     * @param config
     */
    VMManager.setConfig = function (target, config) {
        return this.setVM(target, _vmConfigName, config);
    };
    VMManager.getConfig = function (target) {
        return this.getVM(target, _vmConfigName);
    };
    // private static getContext(target:any): any{
    //     return this.getVM(target, _vmContextName);
    // }
    // /**
    //  * 其它
    //  * @param target 
    //  * @param name 
    //  * @param context 
    //  */
    // static setOther(target:any, name:string, context:any){
    //     return this.setVM(target, _vmOtherName, context);
    // }
    // static getOter(target:any, name:string): any{
    //     return this.getVM(target, _vmOtherName);
    // }
    VMManager.getTarget = function (p, t) {
        return (p instanceof t ? p : p.prototype);
    };
    return VMManager;
}());
exports.VMManager = VMManager;
var _readyRd = false, _renderPR = [];
/**
 * 注入组件配置信息
 * @param config
 */
function VMComponet(config) {
    return function (constructor) {
        var name = config.name, target = constructor.prototype, context = {
            name: name,
            type: 'Componet',
            render: null,
            vm: config,
            componetDef: constructor
        };
        target.$name = config.name;
        VMManager.setConfig(target, config);
        //target[_vmName] = config;
        //VMManager.setContext(target, context);
        VMManager.include(target, context, config.include);
        var rdF = function () {
            var head = document.head;
            if (config.styleUrl && !cmpxLib_1.CmpxLib.isString(config.styleUrl)) {
                config.style = config.styleUrl();
                config.styleUrl = null;
            }
            if (config.style) {
                if (!cmpxLib_1.CmpxLib.isString(config.style))
                    config.style = config.style();
                head.appendChild(htmlDef_1.HtmlDef.getHtmlTagDef('style').createElement('style', [{
                        name: 'type', value: 'text/css'
                    }], head, config.style));
            }
            if (config.styleUrl) {
                head.appendChild(htmlDef_1.HtmlDef.getHtmlTagDef('link').createElement('link', [{
                        name: 'rel', value: 'stylesheet'
                    }, {
                        name: 'href', value: config.styleUrl
                    }], head));
            }
            //优先tmplUrl
            var tmplUrl = config.tmplUrl;
            if (cmpxLib_1.CmpxLib.isString(tmplUrl) && _loadTmplFn) {
                _tmplCount++;
                _loadTmplFn(tmplUrl, function (tmpl) {
                    context.render = new CompileRender(tmpl || config.tmpl || '', constructor);
                    _tmplCount--;
                    _tmplChk();
                });
            }
            else
                context.render = new CompileRender(tmplUrl || config.tmpl || '', constructor);
        };
        _readyRd ? rdF() : _renderPR.push(rdF);
    };
}
exports.VMComponet = VMComponet;
var _tmplCount = 0, _tmplFnList = [], _tmplLoaded = function (callback) {
    if (_tmplCount == 0)
        callback && callback();
    else
        callback && _tmplFnList.push(callback);
}, _tmplChk = function () {
    (_tmplCount == 0) && cmpxLib_1.CmpxLib.each(_tmplFnList, function (item) {
        item();
    });
};
var _viewvarName = '__viewvar__', _getViewvarDef = function (componet) {
    return componet && componet[_viewvarName];
};
/**
 * 引用模板变量$var
 * @param name 变量名称，未指定为属性名称
 */
function VMVar(name) {
    return function (componet, propKey) {
        name || (name = propKey);
        var vv = (componet[_viewvarName] || (componet[_viewvarName] = {}));
        vv[name || propKey] = propKey;
    };
}
exports.VMVar = VMVar;
var _tmplName = '__tmpl__', _getComponetTmpl = function (componet, id) {
    var tmpls = componet[_tmplName];
    if (!tmpls || !tmpls[id])
        return componet.$parent ? _getComponetTmpl(componet.$parent, id) : null;
    else
        return tmpls[id];
}, _insertAfter = function (newElement, refElement, parent) {
    if (!parent)
        return;
    var nextSibling = refElement.nextSibling;
    if (nextSibling) {
        parent.insertBefore(newElement, nextSibling);
    }
    else
        parent.appendChild(newElement);
}, _createTempNode = function () {
    return document.createTextNode('');
    // let element:Node = document.createElement('script');
    // element['type'] = 'text/html';
    // return element;
}, _getRefNode = function (parentNode) {
    var tNode = _createTempNode();
    parentNode.appendChild(tNode);
    return tNode;
}, _equalArrayIn = function (array1, array2) {
    var ok = true;
    cmpxLib_1.CmpxLib.each(array1, function (item, index) {
        if (item != array2[index]) {
            ok = false;
            return false;
        }
    });
    return ok;
}, _equalArray = function (array1, array2) {
    if ((!array1 || !array2))
        return array1 == array2;
    return array1.length == array2.length && _equalArrayIn(array1, array2);
}, _equalObject = function (obj1, obj2) {
    if (obj1 == obj2)
        return true;
    if (!cmpxLib_1.CmpxLib.isObject(obj2))
        return false;
    var count = 0, ok = true;
    cmpxLib_1.CmpxLib.eachProp(obj1, function (item, n) {
        count++;
        if (obj2[n] !== item) {
            ok = false;
            return false;
        }
    });
    ok && cmpxLib_1.CmpxLib.eachProp(obj2, function () {
        count--;
    });
    return ok && (count === 0);
}, _equals = function (p, p1) {
    if (cmpxLib_1.CmpxLib.isArray(p))
        return _equalArray(p, p1);
    else if (cmpxLib_1.CmpxLib.isObject(p))
        return _equalObject(p, p1);
    else
        return p == p1;
}, _getParentElement = htmlDef_1.HtmlDef.getParentElement, _removeChildNodes = function (childNodes) {
    if (childNodes && childNodes.length > 0) {
        var pNode_1;
        cmpxLib_1.CmpxLib.each(childNodes, function (item) {
            (pNode_1 = _getParentElement(item)) && pNode_1.removeChild(item);
        });
    }
    return null;
}, _detachElement = function (nodes) {
    if (nodes && nodes.length > 0) {
        var //pNode:Node = _getParentElement(nodes[0]),
        fragment_1 = document.createDocumentFragment();
        cmpxLib_1.CmpxLib.each(nodes, function (item) {
            fragment_1.appendChild(item);
        });
        return fragment_1;
    }
    return null;
};
var CompileRender = (function () {
    /**
     *
     * @param context (string | Function | Componet) html模板文本、编译后的function或Componet
     * @param componetDef 组件定义类，如果没有传为临时模板
     */
    function CompileRender(context, componetDef, param) {
        if (context instanceof componet_1.Componet) {
            this.componetDef = context;
            var vm = VMManager.getComponet(context), render = vm && vm.render;
            this.contextFn = render.contextFn;
        }
        else {
            this.componetDef = componetDef;
            this.param = param;
            var fn = void 0;
            if (cmpxLib_1.CmpxLib.isString(context)) {
                var tagInfos = _makeTagInfos(cmpxLib_1.CmpxLib.trim(context, true));
                fn = _buildCompileFn(tagInfos);
            }
            else
                fn = context;
            this.contextFn = fn;
        }
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
        var componet, isNewComponet = false, parentElement = _getParentElement(refNode), newSubject = new compileSubject_1.CompileSubject(subject, subjectExclude);
        if (componetDef) {
            isNewComponet = true;
            componet = componetDef instanceof componet_1.Componet ? componetDef : new componetDef();
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
        var vmAttrs = _getVmAttrs(componet);
        cmpxLib_1.CmpxLib.each(attrs, function (item) {
            componet[(vmAttrs && vmAttrs[item.name]) || item.name] = item.value;
        });
        //注意parentElement问题，但现在context只能放{{tmpl}}
        contextFn && contextFn(componet, parentElement, newSubject, true);
        var watchFn = isNewComponet ? _getWatchContext(componet) : null;
        newSubject.subscribe({
            update: function () {
                watchFn && watchFn();
            },
            remove: function (p) {
                var rmFn = function () {
                    var vv = _getViewvarDef(componet);
                    cmpxLib_1.CmpxLib.eachProp(vv, function (item) {
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
                    cmpxLib_1.CmpxLib.trace(e);
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
            var pt = cmpxLib_1.CmpxLib.extend({}, _this.param);
            _this.contextFn.call(componet, cmpxLib_1.CmpxLib, Compile, componet, fragment, newSubject, cmpxLib_1.CmpxLib.extend(pt, param && param.call(componet)));
            childNodes = cmpxLib_1.CmpxLib.toArray(fragment.childNodes);
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
exports.CompileRender = CompileRender;
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
        cmpxLib_1.CmpxLib.each(_renderPR, function (item) {
            item();
        });
        _renderPR = null;
    };
    Compile.loadTmplCfg = function (loadTmplFn) {
        _loadTmplFn = loadTmplFn;
    };
    Compile.createElementEx = function (name, attrs, componet, parentElement, subject, contextFn, content, bindAttrs) {
        if (subject.isRemove)
            return;
        if (VMManager.getComponet(componet, name)) {
            Compile.createComponet.apply(this, arguments);
        }
        else {
            Compile.createElement.apply(this, arguments);
        }
    };
    Compile.createElement = function (name, attrs, componet, parentElement, subject, contextFn, content, bindAttrs) {
        if (subject.isRemove)
            return;
        var element = htmlDef_1.HtmlDef.getHtmlTagDef(name).createElement(name, attrs, parentElement, content, { subject: subject, componet: componet });
        var attrList = [], bindList = [], binds = {}, vmAttrs, bindDef, bind, attrName, values = {};
        var makeAttrs = function (binds, bind, attrs) {
            cmpxLib_1.CmpxLib.eachProp(attrs, function (item, n) {
                binds[n] = { bind: bind, attr: item, done: false };
            });
        };
        cmpxLib_1.CmpxLib.each(attrs, function (item) {
            attrName = item.name;
            bindDef = _getBindDef(componet, attrName);
            if (bindDef) {
                bind = new bindDef(element);
                bindList.push(bind);
                vmAttrs = _getVmAttrs(bind);
                bind['$name'] = attrName;
                bind['$subject'] = subject;
                bind['$componet'] = componet;
                makeAttrs(binds, bind, vmAttrs);
            }
            values[attrName] = item.value;
            attrList.push(item);
        });
        bindAttrs && cmpxLib_1.CmpxLib.each(bindAttrs.split(','), function (item) {
            bindDef = _getBindDef(componet, item);
            if (bindDef) {
                bind = new bindDef(element);
                bindList.push(bind);
                vmAttrs = _getVmAttrs(bind);
                bind['$name'] = item;
                bind['$subject'] = subject;
                bind['$componet'] = componet;
                makeAttrs(binds, bind, vmAttrs);
            }
        });
        parentElement.appendChild(element);
        contextFn && contextFn(componet, element, subject, false, bind && binds);
        bind && cmpxLib_1.CmpxLib.eachProp(binds, function (item, n) {
            Compile.setBindAttribute(element, n, '', values[n], componet, subject, false, binds);
        });
        bindList.length > 0 && cmpxLib_1.CmpxLib.each(bindList, function (item) {
            Compile.setBind(element, componet, subject, item);
        });
    };
    Compile.createComponet = function (name, attrs, componet, parentElement, subject, contextFn) {
        if (subject.isRemove)
            return;
        var vm = VMManager.getComponet(componet, name), componetDef = vm.componetDef, refNode = _getRefNode(parentElement);
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
    Compile.setAttributeEx = function (element, name, subName, content, componet, subject, isComponet, binds) {
        if (isComponet) {
            Compile.setAttributeCP.apply(this, arguments);
        }
        else if (binds && binds[name]) {
            Compile.setBindAttribute.apply(this, arguments);
        }
        else {
            Compile.setAttribute.apply(this, arguments);
        }
    };
    Compile.setAttributeCP = function (element, name, subName, content, componet, subject, isComponet) {
        var isObj = !cmpxLib_1.CmpxLib.isString(content), parent = componet.$parent, vmAttrs = _getVmAttrs(componet);
        vmAttrs && (name = vmAttrs[name] || name);
        if (isObj) {
            var isEvent = !!content.event, update = void 0;
            if (isEvent) {
                var isBind_1 = false, eventDef_1 = componet[name], eventFn_1 = function () {
                    return content.event.apply(parent, arguments);
                };
                eventDef_1 || (eventDef_1 = componet[name] = new cmpxEvent_1.CmpxEvent());
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
                        if (!_equals(value_1, newValue_1)) {
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
        var isObj = !cmpxLib_1.CmpxLib.isString(content), value = '', once = isObj ? content.once : false, readFn = isObj ? content.read : null, textNode = document.createTextNode(isObj ? (once ? readFn.call(componet) : value) : content);
        parentElement.appendChild(textNode);
        subject.subscribe({
            update: function (p) {
                if (!once && readFn) {
                    var newValue = readFn.call(componet);
                    if (!_equals(value, newValue)) {
                        value = newValue;
                        textNode[('textContent' in textNode) ? 'textContent' : 'nodeValue'] = newValue;
                    }
                }
            }
        });
        return textNode;
    };
    Compile.setAttribute = function (element, name, subName, content, componet, subject, isComponet) {
        var isObj = !cmpxLib_1.CmpxLib.isString(content), compileInfo = { subject: subject, componet: componet };
        if (isObj) {
            var isEvent = !!content.event, update = void 0, eventDef_2;
            if (isEvent) {
                var isBind_2 = false, eventFn_2 = function (e) { return content.event.call(componet, event); };
                eventDef_2 = htmlDef_1.HtmlDef.getHtmlEventDef(name);
                subject.subscribe({
                    update: function (p) {
                        if (isBind_2)
                            return;
                        isBind_2 = true;
                        eventDef_2.addEventListener(element, name, eventFn_2, false, compileInfo);
                    },
                    remove: function (p) {
                        if (isBind_2) {
                            eventDef_2.removeEventListener(element, name, eventFn_2, false, compileInfo);
                        }
                    }
                });
            }
            else {
                var value_2 = '', newValue_2, isWrite_2 = !!content.write, isRead_2 = !!content.read, writeFn_2 = function () {
                    newValue_2 = attrDef_1.getAttribute(element, name, '', compileInfo);
                    if (!_equals(value_2, newValue_2)) {
                        value_2 = newValue_2;
                        content.write.call(componet, newValue_2);
                        componet.$updateAsync();
                    }
                };
                var attrDef_1 = htmlDef_1.HtmlDef.getHtmlAttrDef(name), writeEvent_1 = attrDef_1.writeEvent || ['change', 'click'];
                if (isWrite_2) {
                    eventDef_2 = htmlDef_1.HtmlDef.getHtmlEventDef(name);
                    cmpxLib_1.CmpxLib.each(writeEvent_1, function (item) {
                        eventDef_2.addEventListener(element, item, writeFn_2, false);
                    });
                }
                attrDef_1.initAttribute && attrDef_1.initAttribute(element, name, isRead_2 ? content.read.call(componet) : '', subName, compileInfo);
                subject.subscribe({
                    update: function (p) {
                        if (isRead_2) {
                            newValue_2 = content.read.call(componet);
                            if (!_equals(value_2, newValue_2)) {
                                value_2 = newValue_2;
                                attrDef_1.setAttribute(element, name, value_2, subName, compileInfo);
                            }
                        }
                    },
                    remove: function (p) {
                        if (isWrite_2) {
                            cmpxLib_1.CmpxLib.each(writeEvent_1, function (item) {
                                eventDef_2.removeEventListener(element, item, writeFn_2, false, compileInfo);
                            });
                        }
                    }
                });
            }
        }
        else {
            var attrDef = htmlDef_1.HtmlDef.getHtmlAttrDef(name);
            attrDef.initAttribute && attrDef.initAttribute(element, name, content, subName, compileInfo);
            attrDef.setAttribute(element, name, content, subName, compileInfo);
        }
    };
    Compile.setBindAttribute = function (element, name, subName, content, componet, subject, isComponet, binds) {
        var bindInfo = binds[name];
        if (bindInfo.done)
            return;
        bindInfo.done = true;
        var bind = bindInfo.bind, bindAttrName = '__bindAttr__', bindAttrs = bind[bindAttrName] || (bind[bindAttrName] = []), isObj = content && !cmpxLib_1.CmpxLib.isString(content), names = _makeSubName(name);
        bindAttrs.push({
            isObj: isObj,
            attrName: bindInfo.attr,
            attrDef: htmlDef_1.HtmlDef.getHtmlAttrDef(name),
            content: content,
            isWrite: isObj ? !!content.write : false,
            isRead: isObj ? !!content.read : true,
            name: names[0],
            subName: names[1]
        });
        if (!isObj)
            bind[bindInfo.attr] = content;
    };
    Compile.setBind = function (element, componet, subject, bind) {
        var bindEvents = _getBindEvents(bind), events = [];
        if (bindEvents) {
            cmpxLib_1.CmpxLib.each(bindEvents, function (item) {
                var name = item.name, fn = function () { return item.fn.apply(bind, arguments); };
                events.push({ name: name, fn: fn });
                htmlDef_1.HtmlDef.getHtmlEventDef(name).addEventListener(element, name, fn, false);
            });
        }
        var bindAttrName = '__bindAttr__', bindAttrs = bind[bindAttrName], compileInfo = { subject: subject, componet: componet }, isChange, writeFn = function (item) {
            item.newValue = bind[item.attrName];
            if (!_equals(item.value, item.newValue)) {
                isChange = true;
                item.value = item.newValue;
                item.content.write.call(componet, item.newValue);
            }
        }, update = function () {
            cmpxLib_1.CmpxLib.each(bindAttrs, function (item) {
                if (item.isRead) {
                    item.newValue = item.isObj ? item.content.read.call(componet)
                        : bind[item.attrName];
                    if (!_equals(item.value, item.newValue)) {
                        isChange = true;
                        item.value = item.newValue;
                        bind[item.attrName] = item.value;
                        item.attrDef.setAttribute(element, item.name, item.value, item.subName, compileInfo);
                    }
                    else
                        writeFn(item);
                }
                else if (item.isWrite)
                    writeFn(item);
            });
        }, doUpdate = function () {
            isChange = false;
            update();
            isChange && bind.onChanged();
            if (isChange) {
                doUpdate();
            }
        };
        bind[bindAttrName] = _undef;
        var watchFn = _getWatchContext(bind);
        subject.subscribe({
            update: function (p) {
                doUpdate();
                watchFn && watchFn();
                bind.onUpdate();
            },
            ready: function () {
                bind.onReady();
            },
            remove: function (p) {
                bind.$isDisposed = true;
                bind.onDispose();
                if (bindEvents) {
                    cmpxLib_1.CmpxLib.each(events, function (item) {
                        htmlDef_1.HtmlDef.getHtmlEventDef(item.name).removeEventListener(element, item.name, item.fn, false);
                    });
                }
            }
        });
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
                        cmpxLib_1.CmpxLib.each(syncDatas, function (item) {
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
                    var isArray = cmpxLib_1.CmpxLib.isArray(datas);
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
                                cmpxLib_1.CmpxLib.each(oldDatas, function (item, index) {
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
                                cmpxLib_1.CmpxLib.each(newDatas, function (item, index) {
                                    //在保留数据里的位置
                                    nIdx = cmpxLib_1.CmpxLib.inArray(hasList, function (item) { return item.newIndex == index; });
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
                            cmpxLib_1.CmpxLib.each(rmList_1, function (item) {
                                item.nodes = _removeChildNodes(item.nodes);
                                item.subject.remove({
                                    componet: componet
                                });
                                item.subject = item.nodes = null;
                            });
                            var lastIndex_1 = -1;
                            cmpxLib_1.CmpxLib.each(syncDatas, function (item, index) {
                                var fragm;
                                if (item.fn) {
                                    //根据fn数据来确认保留数据
                                    if (item.index < lastIndex_1) {
                                        //根据原有index，如果大过上一个从中保留数据的原有index,移动原来的node
                                        lastIndex_1 = item.index;
                                        fragm = document.createDocumentFragment();
                                        cmpxLib_1.CmpxLib.each(item.nodes, function (node) {
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
                                    var st = item.subject = new compileSubject_1.CompileSubject(subject);
                                    fragm = document.createDocumentFragment();
                                    item.fn = eachFn.call(componet, item.data, count_1, index, componet, fragm, st);
                                    item.nodes = cmpxLib_1.CmpxLib.toArray(fragm.childNodes);
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
                            newSubject = new compileSubject_1.CompileSubject(subject);
                            cmpxLib_1.CmpxLib.each(datas, function (item, index) {
                                eachFn.call(componet, item, count_1, index, componet, fragment_2, newSubject);
                            });
                            childNodes = cmpxLib_1.CmpxLib.toArray(fragment_2.childNodes);
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
    ;
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
                                trueSubject = new compileSubject_1.CompileSubject(subject);
                                fragment = document.createDocumentFragment();
                                trueFn.call(componet, componet, fragment, trueSubject);
                                trueNodes = cmpxLib_1.CmpxLib.toArray(fragment.childNodes);
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
                                falseSubject = new compileSubject_1.CompileSubject(subject);
                                fragment = document.createDocumentFragment();
                                falseFn.call(componet, componet, fragment, falseSubject);
                                falseNodes = cmpxLib_1.CmpxLib.toArray(fragment.childNodes);
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
                        newSubject = new compileSubject_1.CompileSubject(subject);
                        fragment = document.createDocumentFragment();
                        if (newValue)
                            trueFn.call(componet, componet, fragment, newSubject);
                        else
                            falseFn.call(componet, componet, fragment, newSubject);
                        childNodes = cmpxLib_1.CmpxLib.toArray(fragment.childNodes);
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
                subject = new compileSubject_1.CompileSubject(subject);
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
        if (cmpxLib_1.CmpxLib.isString(context)) {
            var tmpl = _getComponetTmpl(componet, context);
            if (tmpl) {
                var pTmep_1 = (param && param.call(componet)) || {};
                param && subject.subscribe({
                    update: function () {
                        cmpxLib_1.CmpxLib.extend(pTmep_1, param.call(componet));
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
            var value_3, preSubject_1, preComponet_1, refNode_1 = _getRefNode(parentElement);
            subject.subscribe({
                update: function (p) {
                    var newValue = context.call(componet);
                    if (newValue != value_3) {
                        value_3 = newValue;
                        var render = new CompileRender(newValue);
                        preSubject_1 && preSubject_1.remove({
                            componet: preComponet_1
                        });
                        var _a = render.complie(refNode_1, [], componet, subject, null, null, param), newSubject = _a.newSubject, refComponet = _a.refComponet;
                        preSubject_1 = newSubject;
                        preComponet_1 = refComponet;
                    }
                    else
                        preSubject_1.update({
                            componet: preComponet_1
                        });
                },
                remove: function (p) {
                    value_3 = preSubject_1 = preComponet_1 = refNode_1 = null;
                }
            });
        }
    };
    Compile.renderComponet = function (componetDef, refNode, attrs, complieEnd, parentComponet, subject, contextFn) {
        _tmplLoaded(function () {
            var isComponet = componetDef instanceof componet_1.Componet, vm = isComponet ? null : VMManager.getComponet(VMManager.getTarget(componetDef, componet_1.Componet)), render = isComponet ? new CompileRender(componetDef) : (vm && vm.render);
            if (!render)
                throw new Error('not find VM default!');
            var _a = render.complie(refNode, attrs, parentComponet, subject, contextFn, { update: true }), newSubject = _a.newSubject, refComponet = _a.refComponet;
            complieEnd && complieEnd.call(refComponet, newSubject, refComponet);
        });
    };
    return Compile;
}());
exports.Compile = Compile;
var _buildCompileFn = function (tagInfos) {
    var outList = [], varNameList = [];
    _buildCompileFnContent(tagInfos, outList, varNameList, true);
    varNameList.length > 0 && outList.unshift('var ' + varNameList.join(',') + ';');
    outList.unshift("var __tmplRender = Compile.tmplRender,\n        __setAttributeEx = Compile.setAttributeEx, __createElementEx = Compile.createElementEx,\n        __createTextNode = Compile.createTextNode, __setViewvar = Compile.setViewvar,\n        __forRender = Compile.forRender, __ifRender = Compile.ifRender,\n        __includeRender = Compile.includeRender, __updateRender = Compile.updateRender,\n        __componet = componet;");
    return new Function('CmpxLib', 'Compile', 'componet', 'element', 'subject', 'param', outList.join('\n'));
}, _buildCpFnRetRmRegex = /\s*\=\s*\[\s*\]\s*$/, _escapeStringRegex = /([\"\\])/gm, _escapeBuildString = function (s) {
    return s ? s.replace(/([\"\\])/gm, '\\$1').replace(/\n/gm, '\\n').replace(/\r/gm, '\\r') : '';
}, _makeSubName = function (name) {
    if (name.indexOf('.') > 0) {
        return name.split('.');
    }
    else
        return [name, ''];
}, _makeElementTag = function (tagName, attrs) {
    var bindAttrs = [], stAtts = [], names, bindNames = [], name;
    cmpxLib_1.CmpxLib.each(attrs, function (item) {
        name = item.name;
        if (name == '$var' || name == '$array')
            return;
        if (item.bind)
            bindAttrs.push(item), bindNames.push(name);
        else {
            names = _makeSubName(name);
            stAtts.push({ name: names[0], value: _escapeBuildString(item.value), subName: names[1] });
        }
    });
    return { bindAttrs: bindAttrs, stAtts: stAtts, bindNames: bindNames };
}, _buildAttrContent = function (attrs, outList) {
    if (!attrs)
        return;
    var names;
    cmpxLib_1.CmpxLib.each(attrs, function (attr, index) {
        names = _makeSubName(attr.name);
        outList.push('__setAttributeEx(element, "' + names[0] + '", "' + names[1] + '", ' + attr.bindInfo.content + ', componet, subject, isComponet, binds);');
    });
}, _getViewvarName = function (attrs) {
    var name = { item: null, list: null }, has = false;
    cmpxLib_1.CmpxLib.each(attrs, function (attr, index) {
        if (attr.name == '$var') {
            name.item = cmpxLib_1.CmpxLib.trim(attr.value);
            has = true;
            return false;
        }
        else if (attr.name == '$array') {
            name.list = cmpxLib_1.CmpxLib.trim(attr.value);
            has = true;
            return false;
        }
    });
    return has ? name : null;
}, _getInsertTemp = function (preInsert) {
    return preInsert ? 'true' : 'false';
}, _getTagContent = function (tagInfo) {
    var content;
    cmpxLib_1.CmpxLib.each(tagInfo.children, function (item) {
        content = cmpxLib_1.CmpxLib.decodeHtml(item.content);
    });
    return content;
}, _buildCompileFnForVar = function (itemName, outList) {
    var str = ['var ', itemName, '_index, ', itemName, '_count, $last, ', itemName, '_last, $first, ', itemName, '_first, $odd, ', itemName, '_odd, $even, ', itemName, '_even,\n',
        'setForVar = function (item, count, index) {\n',
        '$index = ', itemName, '_index = index, $count = ', itemName, '_count = count;\n',
        '$last = ', itemName, '_last = (count - index == 1), $first = ', itemName, '_first = (index == 0), $odd = ', itemName, '_odd = (index % 2 == 0), $even = ', itemName, '_even = !$odd;\n',
        '};\n',
        'setForVar.call(componet, item, $count, $index);'
    ].join('');
    outList.push(str);
}, _buildCompileFnContent = function (tagInfos, outList, varNameList, preInsert, inclue) {
    if (!tagInfos)
        return;
    cmpxLib_1.CmpxLib.each(tagInfos, function (tag, index) {
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
                    var _a = _makeElementTag(tagName, tag.attrs), bindAttrs = _a.bindAttrs, stAtts = _a.stAtts, bindNames = _a.bindNames;
                    outList.push('__createElementEx("' + tagName + '", ' + JSON.stringify(stAtts) + ', componet, element, subject, function (componet, element, subject, isComponet, binds) {');
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
                    outList.push('}, "' + _escapeBuildString(tagContent) + '", "' + bindNames.join(',') + '");');
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
                    var incAttr = cmpxLib_1.CmpxLib.arrayToObject(tag.attrs, 'name'), incTmpl = incAttr['tmpl'], incParam = incAttr['param'] ? incAttr['param'].value : 'null', incRender = incAttr['render'], hasIncChild = tag.children && tag.children.length > 0;
                    incParam = incParam == 'null' ? incParam : ('function(){ return ' + incParam + ';}');
                    incRender && (incRender = 'function(){ return ' + incRender.value + '}');
                    var context_1 = incRender ? incRender : ('"' + (incTmpl ? _escapeBuildString(incTmpl.value) : '') + '"');
                    if (hasIncChild) {
                        outList.push('__includeRender(' + context_1 + ', function (componet, element, subject) {');
                        _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                        outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject,  ' + incParam + ');');
                    }
                    else
                        outList.push('__includeRender(' + context_1 + ', null, componet, element, ' + _getInsertTemp(preInsert) + ', subject,  ' + incParam + ');');
                    preInsert = true;
                    break;
                case 'tmpl':
                    var tmplAttr = cmpxLib_1.CmpxLib.arrayToObject(tag.attrs, 'name'), tmplId = tmplAttr['id'], tmplLet = tmplAttr['let'];
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
//# sourceMappingURL=compile.js.map