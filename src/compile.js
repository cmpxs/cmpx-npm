import CmpxLib from './cmpxLib';
import { HtmlDef } from './htmlDef';
import CmpxEvent from './cmpxEvent';
var _undef;
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
_cmdEncodeAttrRegex = /\{\{((?!\/|\s*(?:if|else|for|tmpl|include|html)[ \}])(?:.|\r|\n)+?)\}\}/gm, _makeTextTag = function (tmpl) {
    //
    return tmpl.replace(_cmdEncodeAttrRegex, function (find, content) {
        return ['$($', _encodeURIComponentEx(content), '$)$'].join('');
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
    tmpl = HtmlDef.handleTagContent(tmpl);
    tmpl.replace(_tagInfoRegex, function (find, end1, tagName, tagContent, end2, txtEnd1, txtName, txtContent, txtEnd2, index) {
        if (index > lastIndex) {
            list.push(_newTextContent(tmpl, lastIndex, index));
        }
        var cmd = !!txtName, htmlTagDef = cmd ? null : HtmlDef.getHtmlTagDef(tagName), single = !!end2 || !!txtEnd2 || (cmd ? _singleCmd[txtName] : htmlTagDef.single), end = !!end1 || !!txtEnd1 || single;
        if (cmd || !(single && !!end1)) {
            var attrs = !cmd && !!tagContent ? _getAttrInfos(tagContent) : null;
            if (cmd) {
                if ((single || !end)) {
                    switch (txtName) {
                        case 'for':
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
                tagName: (tagName || txtName).toLowerCase(),
                target: !cmd,
                cmd: cmd,
                find: find,
                content: tagContent || txtContent,
                attrs: attrs,
                end: end,
                single: single,
                index: index,
                htmlTagDef: htmlTagDef,
                componet: cmd ? false : !!_registerVM[tagName]
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
            name: (name || name1).toLowerCase(),
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
_forAttrRegex = /\s*([^\s]+)\s*\in\s*([^\s]+)\s*/i, _getForAttrInfos = function (content) {
    var extend = _forAttrRegex.exec(content);
    var attrs = [{
            name: '',
            value: '',
            bind: true,
            extend: {
                item: extend[1],
                datas: extend[2],
                tmpl: extend[4]
            }
        }];
    return attrs;
}, _bindTypeRegex = /^\s*([\<\>\:\@\#])\s*(.*)/, _removeEmptySplitRegex = /^['"]{2,2}\+|\+['"]{2,2}/g, _onlyBindRegex = /^\$\(\$[^$]*\$\)\$$/, 
//获取内容绑定信息，如 name="aaa{{this.name}}"
_getBind = function (value, split) {
    var write, event, onceList = [], read = false, isOnce = false, onlyBing = _onlyBindRegex.test(value), readTxt;
    var type = '', txt, reg, readContent = [split, value.replace(_cmdDecodeAttrRegex, function (find, content, index) {
            content = decodeURIComponent(content);
            reg = _bindTypeRegex.exec(content);
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
    readContent = readContent.replace(_removeEmptySplitRegex, '');
    var once;
    if (write || read || isOnce || onceList.length > 0) {
        if (isOnce) {
            var oList_1 = [];
            CmpxLib.each(onceList, function (item, index) {
                oList_1.push(['once', index, ' = ', onlyBing ? item : 'CmpxLib.toStr(', item, ')'].join(''));
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
var _registerVM = {}, _vmName = '__vm__', _getVmConfig = function (componetDef) {
    return componetDef.prototype[_vmName];
}, _getVmByComponetDef = function (componetDef) {
    var config = _getVmConfig(componetDef);
    return config ? _registerVM[config.name] : null;
}, _readyRd = false, _renderPR = [];
/**
 * 注入组件配置信息
 * @param config
 */
export function VM(vm) {
    return function (constructor) {
        _registerVM[vm.name] = {
            render: null,
            vm: vm,
            componetDef: constructor
        };
        var rdF = function () {
            _registerVM[vm.name].render = new CompileRender(vm.tmpl, constructor);
            var head = document.head;
            if (vm.style) {
                head.appendChild(HtmlDef.getHtmlTagDef('style').createElement('style', [{
                        name: 'type', value: 'text/css'
                    }], head, vm.style));
            }
            if (vm.styleUrl) {
                head.appendChild(HtmlDef.getHtmlTagDef('link').createElement('link', [{
                        name: 'rel', value: 'stylesheet'
                    }, {
                        name: 'href', value: vm.styleUrl
                    }], head, vm.style));
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
var _tmplCount = 0, _tmplFnList = [], _tmplLoaded = function (callback) {
    if (_tmplCount == 0)
        callback && callback();
    else
        callback && _tmplFnList.push(callback);
}, _tmplChk = function () {
    (_tmplCount == 0) && CmpxLib.each(_tmplFnList, function (item) {
        console.log('aaa');
        item();
    });
};
var _viewvarName = '__viewvar__', _getViewvarDef = function (componet) {
    return componet[_viewvarName];
};
/**
 * 引用模板变量$var
 * @param name 变量名称，未指定为属性名称
 */
export function viewvar(name) {
    return function (componet, propKey) {
        name || (name = propKey);
        var vv = (componet[_viewvarName] || (componet[_viewvarName] = []));
        vv.push({
            name: name || propKey,
            propKey: propKey
        });
    };
}
var CompileSubject = (function () {
    function CompileSubject(subject, exclude) {
        var _this = this;
        this.datas = [];
        this.isInit = false;
        this.isRemove = false;
        if (subject) {
            if (!(this.isRemove = subject.isRemove)) {
                this.linkParam = subject.subscribe({
                    init: function (p) { return (!exclude || !exclude.init) && _this.init(p); },
                    update: function (p) { return (!exclude || !exclude.update) && _this.update(p); },
                    insertDoc: function (p) { return (!exclude || !exclude.insertDoc) && _this.insertDoc(p); },
                    ready: function (p) { return (!exclude || !exclude.ready) && _this.ready(p); },
                    remove: function (p) { return (!exclude || !exclude.remove) && _this.remove(p); }
                });
                this.subject = subject;
                this.isInit = subject.isInit;
                this.lastInitP = subject.lastInitP;
            }
        }
    }
    CompileSubject.prototype.subscribe = function (p) {
        if (!this.isRemove) {
            this.datas.push(p);
            if (this.isInit)
                p.init && (p.init(this.lastInitP), p.init = null);
        }
        return p;
    };
    CompileSubject.prototype.unSubscribe = function (p) {
        var index = this.datas.indexOf(p);
        if (index >= 0)
            this.datas.splice(index, 1);
    };
    CompileSubject.prototype.unLinkSubject = function () {
        this.subject && this.subject.unSubscribe(this.linkParam);
        return this;
    };
    CompileSubject.prototype.init = function (p) {
        if (this.isRemove)
            return;
        this.isInit = true;
        this.lastInitP = p;
        CmpxLib.each(this.datas, function (item) {
            if (item.init) {
                item.init(p);
                item.init = null;
            }
        });
    };
    CompileSubject.prototype.update = function (p) {
        if (this.isRemove)
            return;
        CmpxLib.each(this.datas, function (item) {
            if (item.update) {
                item.update && item.update(p);
            }
        });
        this.updateAfter(p);
    };
    CompileSubject.prototype.updateAfter = function (p) {
        if (this.isRemove)
            return;
        CmpxLib.each(this.datas, function (item) {
            if (item.updateAfter) {
                item.updateAfter && item.updateAfter(p);
            }
        });
    };
    CompileSubject.prototype.insertDoc = function (p) {
        if (this.isRemove)
            return;
        CmpxLib.each(this.datas, function (item) {
            if (item.insertDoc) {
                item.insertDoc(p);
                item.insertDoc = null;
            }
        });
    };
    CompileSubject.prototype.ready = function (p) {
        if (this.isRemove)
            return;
        CmpxLib.each(this.datas, function (item) {
            if (item.ready) {
                item.ready(p);
                item.ready = null;
            }
        });
    };
    CompileSubject.prototype.remove = function (p) {
        if (this.isRemove)
            return;
        this.isRemove = true;
        this.unLinkSubject();
        var datas = this.datas;
        this.datas = [];
        CmpxLib.each(datas, function (item) {
            if (item.remove) {
                item.remove(p);
                item.remove = null;
            }
        });
    };
    return CompileSubject;
}());
export { CompileSubject };
var _tmplName = '__tmpl__', _getComponetTmpl = function (componet, id) {
    var tmpls = componet[_tmplName];
    if (!tmpls || !tmpls[id])
        return componet.$parent ? _getComponetTmpl(componet.$parent, id) : null;
    else
        return tmpls[id];
}, _insertAfter = function (newElement, refElement, parent) {
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
}, _getRefNode = function (parentNode, insertTemp) {
    var tNode;
    if (insertTemp) {
        tNode = _createTempNode();
        parentNode.appendChild(tNode);
    }
    else {
        tNode = parentNode.lastChild;
        if (!tNode) {
            insertTemp = true;
            tNode = _createTempNode();
            parentNode.appendChild(tNode);
        }
    }
    //注意tmplElement是Comment, 在IE里只能取到parentNode
    return { refNode: tNode, isInsertTemp: insertTemp };
}, _equalArrayIn = function (array1, array2) {
    var ok = true;
    CmpxLib.each(array1, function (item, index) {
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
}, _getParentElement = function (node) {
    return node.parentElement || node.parentNode;
}, _removeChildNodes = function (childNodes) {
    if (childNodes && childNodes.length > 0) {
        var pNode_1;
        CmpxLib.each(childNodes, function (item) {
            (pNode_1 = _getParentElement(item)) && pNode_1.removeChild(item);
        });
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
            fn = _buildCompileFn(tagInfos, param);
            //console.log(tagInfos);
        }
        else
            fn = context;
        // console.log(fn.toString());
        this.contextFn = fn;
    }
    /**
     * 编译并插入到document
     * @param refElement 在element之后插入内容
     * @param parentComponet 父组件
     */
    CompileRender.prototype.complie = function (refNode, parentComponet, subject, contextFn, subjectExclude) {
        var _this = this;
        var componetDef = this.componetDef;
        subject || (subject = (parentComponet ? parentComponet.$subObject : null));
        subjectExclude || (subjectExclude = {});
        //subjectExclude.remove = true;
        subjectExclude.insertDoc = true;
        var componet, isNewComponet = false, parentElement = _getParentElement(refNode), newSubject = new CompileSubject(subject, subjectExclude);
        if (componetDef) {
            isNewComponet = true;
            componet = new componetDef();
            componet.$name = name;
            componet.$subObject = newSubject;
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
        //注意parentElement问题，但现在context只能放{{tmpl}}
        contextFn && contextFn(componet, parentElement, newSubject);
        newSubject.subscribe({
            remove: function (p) {
                try {
                    isNewComponet && (componet.$isDisposed = true, componet.onDispose());
                    if (p.componet == componet)
                        childNodes = _removeChildNodes(childNodes);
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
                        componet.$subObject = componet.$children =
                            componet.$parent = componet.$parentElement = null;
                    }
                }
            },
            updateAfter: function (p) {
                isNewComponet && retFn && retFn.call(componet);
            }
        });
        var childNodes, retFn;
        var fragment, initFn = function () {
            newSubject.init({
                componet: componet
            });
            fragment = document.createDocumentFragment();
            subject && subject.subscribe({
                remove: function (p) {
                    fragment = refNode = componet = parentElement = parentComponet = null;
                }
            });
            retFn = _this.contextFn.call(componet, CmpxLib, Compile, componet, fragment, newSubject, _this.param, function (vvList) {
                if (!vvList || vvList.length == 0)
                    return;
                var vvDef = _getViewvarDef(this);
                if (!vvDef)
                    return;
                CmpxLib.each(vvDef, function (def) {
                    var propKey = def.propKey, name = def.name;
                    CmpxLib.each(vvList, function (item) {
                        if (item.name == name) {
                            if (item.isL) {
                                if (!this[propKey] || item.p.length > 0)
                                    this[propKey] = item.p.splice(0);
                            }
                            else
                                this[propKey] = item.p;
                            return false;
                        }
                    }, this);
                }, this);
            });
            newSubject.update({
                componet: componet
            });
            if (isNewComponet) {
                componet.onInitViewvar(readyFn, null);
            }
            else
                readyFn();
        }, readyFn = function () {
            childNodes = CmpxLib.toArray(fragment.childNodes);
            _insertAfter(fragment, refNode, parentElement);
            newSubject.insertDoc({
                componet: componet
            });
            isNewComponet && componet.onReady(function () { }, null);
            newSubject.ready({
                componet: componet
            });
            //reay后再次补发update
            newSubject.update({
                componet: componet
            });
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
export { CompileRender };
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
    Compile.createComponet = function (name, componet, parentElement, subject, contextFn) {
        if (subject.isRemove)
            return;
        var vm = _registerVM[name], componetDef = vm.componetDef, _a = _getRefNode(parentElement, false), refNode = _a.refNode, isInsertTemp = _a.isInsertTemp;
        Compile.renderComponet(componetDef, refNode, function () { }, componet, subject, contextFn);
    };
    Compile.setAttributeCP = function (element, name, content, componet, subject) {
        var isObj = !CmpxLib.isString(content), parent = componet.$parent;
        if (isObj) {
            var isEvent = !!content.event, update = void 0;
            if (isEvent) {
                var isBind_1 = false, eventDef_1 = componet[name], eventFn_1 = function (args) { return content.event.apply(componet, args); };
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
                };
                var attrDef = HtmlDef.getHtmlAttrDef(name);
                subject.subscribe({
                    update: function (p) {
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
                    }
                });
            }
        }
        else
            componet[name] = content;
    };
    Compile.createElement = function (name, attrs, componet, parentElement, subject, contextFn, content) {
        if (subject.isRemove)
            return;
        var element = HtmlDef.getHtmlTagDef(name).createElement(name, attrs, parentElement, content);
        parentElement.appendChild(element);
        contextFn && contextFn(componet, element, subject);
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
    Compile.forRender = function (dataFn, eachFn, componet, parentElement, insertTemp, subject) {
        if (subject.isRemove || !dataFn || !eachFn)
            return;
        var _a = _getRefNode(parentElement, insertTemp), refNode = _a.refNode, isInsertTemp = _a.isInsertTemp;
        var value, newSubject;
        var fragment, childNodes, removeFn = function () {
            childNodes = _removeChildNodes(childNodes);
        };
        subject.subscribe({
            update: function (p) {
                var datas = dataFn.call(componet, componet, parentElement, subject);
                if (!_equalArray(datas, value)) {
                    value = datas;
                    removeFn();
                    newSubject && newSubject.remove({
                        componet: componet
                    });
                    newSubject = new CompileSubject(subject, { insertDoc: true });
                    fragment = document.createDocumentFragment();
                    var count_1 = datas ? datas.length : 0;
                    CmpxLib.each(datas, function (item, index) {
                        eachFn.call(componet, item, count_1, index, componet, fragment, newSubject);
                    });
                    newSubject.update({
                        componet: componet
                    });
                    childNodes = CmpxLib.toArray(fragment.childNodes);
                    _insertAfter(fragment, refNode, parentElement);
                    newSubject.insertDoc({
                        componet: componet
                    });
                }
            },
            remove: function (p) {
                removeFn();
                newSubject = fragment = childNodes = refNode = null;
            }
        });
    };
    Compile.ifRender = function (ifFun, trueFn, falseFn, componet, parentElement, insertTemp, subject) {
        if (subject.isRemove)
            return;
        var _a = _getRefNode(parentElement, insertTemp), refNode = _a.refNode, isInsertTemp = _a.isInsertTemp;
        var value, newSubject;
        var fragment, childNodes, removeFn = function () {
            childNodes = _removeChildNodes(childNodes);
        };
        subject.subscribe({
            update: function (p) {
                var newValue = !!ifFun.call(componet, componet, parentElement, subject);
                if (newValue != value) {
                    value = newValue;
                    removeFn();
                    newSubject && newSubject.remove({
                        componet: componet
                    });
                    newSubject = new CompileSubject(subject, { insertDoc: true });
                    fragment = document.createDocumentFragment();
                    if (newValue)
                        trueFn.call(componet, componet, fragment, newSubject);
                    else
                        falseFn.call(componet, componet, fragment, newSubject);
                    newSubject.update({
                        componet: componet
                    });
                    childNodes = CmpxLib.toArray(fragment.childNodes);
                    _insertAfter(fragment, refNode, _getParentElement(refNode));
                    newSubject.insertDoc({
                        componet: componet
                    });
                }
            },
            remove: function (p) {
                removeFn();
                newSubject = fragment = childNodes = refNode = null;
            }
        });
    };
    Compile.tmplRender = function (id, componet, parentElement, subject, contextFn) {
        if (subject.isRemove)
            return;
        var tmpls = componet[_tmplName];
        tmpls || (tmpls = componet[_tmplName] = {});
        tmpls[id] = function (componet, element, subject, param) {
            contextFn && contextFn.call(componet, componet, element, subject, param);
        };
    };
    Compile.includeRender = function (context, componet, parentElement, insertTemp, subject, param) {
        if (!context || subject.isRemove)
            return;
        if (CmpxLib.isString(context)) {
            var tmpl = _getComponetTmpl(componet, context);
            tmpl && tmpl.call(componet, componet, parentElement, subject, param || {});
        }
        else {
            var render_1, preSubject_1, preComponet_1, _a = _getRefNode(parentElement, insertTemp), refNode_1 = _a.refNode, isInsertTemp = _a.isInsertTemp;
            subject.subscribe({
                update: function (p) {
                    var newRender = context.call(componet);
                    if (newRender != render_1) {
                        render_1 = newRender;
                        preSubject_1 && preSubject_1.remove({
                            componet: preComponet_1
                        });
                        var _a = newRender.complie(refNode_1, componet, subject), newSubject = _a.newSubject, refComponet = _a.refComponet;
                        preSubject_1 = newSubject;
                        preComponet_1 = refComponet;
                    }
                },
                remove: function (p) {
                    render_1 = null;
                }
            });
        }
    };
    Compile.renderComponet = function (componetDef, refNode, complieEnd, parentComponet, subject, contextFn) {
        _tmplLoaded(function () {
            var vm = _getVmByComponetDef(componetDef), render = vm && vm.render;
            if (!vm)
                throw new Error('not find @VM default!');
            var _a = render.complie(refNode, parentComponet, subject, contextFn, { update: true }), newSubject = _a.newSubject, refComponet = _a.refComponet;
            complieEnd && complieEnd.call(refComponet, newSubject, refComponet);
        });
    };
    return Compile;
}());
export { Compile };
var _buildCompileFn = function (tagInfos, param) {
    var outList = [], varNameList = [];
    _buildCompileFnContent(tagInfos, outList, varNameList, true);
    varNameList.length > 0 && outList.unshift('var ' + varNameList.join(',') + ';');
    param && outList.unshift(_getCompileFnParam(param));
    outList.unshift("var __tmplRender = Compile.tmplRender,\n    __createComponet = Compile.createComponet,\n    __setAttributeCP = Compile.setAttributeCP,\n    __createElement = Compile.createElement,\n    __setAttribute = Compile.setAttribute,\n    __createTextNode = Compile.createTextNode,\n    __forRender = Compile.forRender,\n    __ifRender = Compile.ifRender,\n    __includeRender = Compile.includeRender;");
    outList.push(_buildCompileFnReturn(varNameList));
    return new Function('CmpxLib', 'Compile', 'componet', 'element', 'subject', '__p__', 'initViewvar', outList.join('\n'));
}, _getCompileFnParam = function (param) {
    var pList = [];
    CmpxLib.eachProp(param, function (item, name) {
        pList.push([name, ' = ', '__p__.', name].join(''));
    });
    return 'var ' + pList.join(', ') + ';';
}, _buildCpFnRetRmRegex = /\s*\=\s*\[\s*\]\s*$/, _buildCompileFnReturn = function (varNameList) {
    if (varNameList.length > 0) {
        var vvList_1 = [], isL_1;
        CmpxLib.each(varNameList, function (item) {
            isL_1 = _buildCpFnRetRmRegex.test(item);
            isL_1 && (item = item.replace(_buildCpFnRetRmRegex, ''));
            vvList_1.push(['{name:"', item, '", p:', item, ', isL:', (isL_1 ? 'true' : 'false'), '}'].join(''));
        });
        return 'return function(){initViewvar.call(this, [' + vvList_1.join(',') + ']);};';
    }
    else {
        return 'return function(){initViewvar.call(this);};';
    }
}, _escapeStringRegex = /([\"\\])/gm, _escapeBuildString = function (s) {
    return s ? s.replace(/([\"\\])/gm, '\\$1').replace(/\n/gm, '\\n').replace(/\r/gm, '\\r') : '';
}, _makeSubName = function (name) {
    if (name.indexOf('.') > 0) {
        return name.split('.');
    }
    else
        return [name, ''];
}, _makeElementTag = function (tagName, attrs) {
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
}, _buildAttrContent = function (attrs, outList) {
    if (!attrs)
        return;
    var names;
    CmpxLib.each(attrs, function (attr, index) {
        names = _makeSubName(attr.name);
        outList.push('__setAttribute(element, "' + names[0] + '", "' + names[1] + '", ' + attr.bindInfo.content + ', componet, subject);');
    });
}, _buildAttrContentCP = function (attrs, outList) {
    if (!attrs)
        return;
    CmpxLib.each(attrs, function (attr, index) {
        if (attr.name == '$var')
            return;
        if (attr.bind)
            outList.push('__setAttributeCP(element, "' + attr.name + '", ' + attr.bindInfo.content + ', componet, subject);');
        else
            outList.push('__setAttributeCP(element, "' + attr.name + '", "' + _escapeBuildString(attr.value) + '", componet, subject);');
    });
}, _getViewvarName = function (attrs) {
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
}, _getInsertTemp = function (preInsert) {
    return preInsert ? 'true' : 'false';
}, _getTagContent = function (tagInfo) {
    var content;
    CmpxLib.each(tagInfo.children, function (item) {
        content = CmpxLib.decodeHtml(item.content);
    });
    return content;
}, _buildCompileFnForVar = function (itemName, outList) {
    var str = ['var $last = ($count - $index == 1), ', itemName, '_last = $last, ',
        '$first = ($index ==  0), ', itemName, '_first = $first, ',
        '$odd = ($index % 2 ==  0), ', itemName, '_odd = $odd, ',
        '$even = !$odd, ', itemName, '_even = $even;'].join('');
    outList.push(str);
}, _buildCompileFnContent = function (tagInfos, outList, varNameList, preInsert, inclue) {
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
                if (tag.componet) {
                    if (hasChild || hasAttr || varName) {
                        outList.push('__createComponet("' + tagName + '", componet, element, subject, function (componet, element, subject) {');
                        if (varName) {
                            varName.item && outList.push(varName.item + ' = componet;');
                            varName.list && outList.push(varName.list + '.push(componet);');
                        }
                        _buildAttrContentCP(tag.attrs, outList);
                        //createComponet下只能放tmpl
                        _buildCompileFnContent(tag.children, outList, varNameList, preInsert, ['tmpl']);
                        outList.push('});');
                    }
                    else {
                        outList.push('__createComponet("' + tagName + '", componet, element, subject);');
                    }
                    preInsert = true;
                }
                else {
                    var htmlTagDef = tag.htmlTagDef, rawTag = htmlTagDef.raw, tagContent = rawTag && _getTagContent(tag);
                    //如果rawTag没有子级
                    hasChild && (hasChild = !rawTag);
                    if (hasAttr || hasChild || varName) {
                        var _a = _makeElementTag(tagName, tag.attrs), bindAttrs = _a.bindAttrs, stAtts = _a.stAtts;
                        outList.push('__createElement("' + tagName + '", ' + JSON.stringify(stAtts) + ', componet, element, subject, function (componet, element, subject) {');
                        if (varName) {
                            varName.item && outList.push(varName.item + ' = element;');
                            varName.list && outList.push(varName.list + '.push(element);');
                        }
                        _buildAttrContent(bindAttrs, outList);
                        hasChild && _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                        outList.push('}, "' + _escapeBuildString(tagContent) + '");');
                    }
                    else {
                        outList.push('__createElement("' + tagName + '", [], componet, element, subject, null, "' + _escapeBuildString(tagContent) + '");');
                    }
                    preInsert = false;
                }
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
                    var extend = tag.attrs[0].extend, itemName = extend.item;
                    outList.push('__forRender(function (componet, element, subject) {');
                    outList.push('return ' + extend.datas);
                    outList.push('}, function (' + itemName + ', $count, $index, componet, element, subject) {');
                    _buildCompileFnForVar(itemName, outList);
                    var forTmpl = extend.tmpl;
                    if (forTmpl)
                        outList.push('__includeRender("' + _escapeBuildString(forTmpl) + '", componet, element, ' + _getInsertTemp(preInsert) + ', subject, ' + itemName + ');');
                    else
                        _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                    outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject);');
                    preInsert = true;
                    break;
                case 'if':
                    var ifFn_1 = function (ifTag) {
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
                        outList.push('}, componet, element, ' + _getInsertTemp(preInsert) + ', subject);');
                    };
                    ifFn_1(tag);
                    preInsert = true;
                    break;
                case 'include':
                    var incAttr = CmpxLib.arrayToObject(tag.attrs, 'name'), incTmpl = incAttr['tmpl'], incParam = incAttr['param'] ? incAttr['param'].value : 'null', incRender = incAttr['render'];
                    incRender && (incRender = 'function(){ return ' + incRender.value + '}');
                    var context_1 = incRender ? incRender : ('"' + (incTmpl ? _escapeBuildString(incTmpl.value) : '') + '"');
                    outList.push('__includeRender(' + context_1 + ', componet, element, ' + _getInsertTemp(preInsert) + ', subject, ' + incParam + ');');
                    preInsert = true;
                    break;
                case 'tmpl':
                    var tmplAttr = CmpxLib.arrayToObject(tag.attrs, 'name'), tmplId = tmplAttr['id'], tmplLet = tmplAttr['let'];
                    outList.push('__tmplRender("' + (tmplId ? _escapeBuildString(tmplId.value) : '') + '", componet, element, subject, function (componet, element, subject, param) {');
                    tmplLet && outList.push('var ' + tmplLet.value + ';');
                    _buildCompileFnContent(tag.children, outList, varNameList, preInsert);
                    outList.push('});');
                    break;
            }
        }
    });
};
//# sourceMappingURL=compile.js.map