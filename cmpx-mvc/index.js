(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('cmpx')) :
	typeof define === 'function' && define.amd ? define(['exports', 'cmpx'], factory) :
	(factory((global.cmpxs = global.cmpxs || {}, global.cmpxs['cmpx-mvc'] = global.cmpxs['cmpx-mvc'] || {}),global.cmpx));
}(this, (function (exports,cmpx) { 'use strict';

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





function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

var ActionResult = (function () {
    function ActionResult() {
    }
    return ActionResult;
}());
var AsyncResult = (function (_super) {
    __extends(AsyncResult, _super);
    function AsyncResult(callback) {
        var _this = _super.call(this) || this;
        _this.callback = callback;
        return _this;
    }
    AsyncResult.prototype.onLayout = function (cb) {
        this.callback(function (result) {
            result.onLayout(cb);
        });
    };
    return AsyncResult;
}(ActionResult));
var ViewResult = (function (_super) {
    __extends(ViewResult, _super);
    function ViewResult(componetDef, p) {
        var _this = _super.call(this) || this;
        _this.componetDef = componetDef;
        _this.p = p;
        return _this;
    }
    ViewResult.prototype.onLayout = function (cb) {
        var cp = new this.componetDef();
        this.p && cmpx.CmpxLib.extend(cp, this.p);
        cb(cp);
    };
    return ViewResult;
}(ActionResult));
var RedirectResult = (function (_super) {
    __extends(RedirectResult, _super);
    function RedirectResult(path) {
        var _this = _super.call(this) || this;
        _this.path = path;
        return _this;
    }
    RedirectResult.prototype.onLayout = function (cb) {
        this.$location.isForward = true;
        _getActionResult(this.$location.name, this.path, this.$location.$router, cb);
    };
    return RedirectResult;
}(ActionResult));
var ContorllerResult = (function (_super) {
    __extends(ContorllerResult, _super);
    function ContorllerResult(controllerDef) {
        var _this = _super.call(this) || this;
        _this.controllerDef = controllerDef;
        return _this;
    }
    ContorllerResult.prototype.onLayout = function (cb) {
        cb(this.controllerDef);
    };
    return ContorllerResult;
}(ActionResult));
var WebpackLoaderContorllerResult = (function (_super) {
    __extends(WebpackLoaderContorllerResult, _super);
    function WebpackLoaderContorllerResult(path, conctrollerName) {
        return _super.call(this) || this;
    }
    WebpackLoaderContorllerResult.prototype.onLayout = function (cb) {
        cb(null);
    };
    return WebpackLoaderContorllerResult;
}(ActionResult));
var _hashReg = /(#[^#]*)$/;
var _qsRegx = /[\?]([^#]*)(?:#[^#]*)*$/;
var _urlPartRegx = /^([^?&#]*)/;
var ActionLocation = (function () {
    function ActionLocation(href, name, router) {
        this.href = href;
        this.name = name;
        //是否跳转
        this.isForward = false;
        this.hash = ActionLocation.getHash(href);
        this.search = ActionLocation.getQueryString(href);
        this.$router = router;
    }
    /**
     * 将query部分转成Object
     * @param url
     * @param defaultValue
     */
    ActionLocation.qureyStringToObject = function (url, defaultValue) {
        var qs = ActionLocation.getQueryString(url);
        if (qs) {
            var objs_1 = {}, qList = qs.split('&'), itemList_1;
            cmpx.CmpxLib.each(qList, function (item, index) {
                if (item) {
                    itemList_1 = item.split('=');
                    objs_1[itemList_1[0]] = decodeURIComponent(itemList_1[1]);
                }
            });
            return defaultValue ? cmpx.CmpxLib.extend({}, defaultValue, objs_1) : objs_1;
        }
        else
            return defaultValue || {};
    };
    /**
     * 将Object部分转成query
     * @param url
     * @param obj
     */
    ActionLocation.qureyStringFromObject = function (url, obj) {
        var qsObj = cmpx.CmpxLib.extend(ActionLocation.qureyStringToObject(url), obj), hash = ActionLocation.getHash(url);
        url = ActionLocation.getUrlPart(url);
        var t, qsList = [];
        cmpx.CmpxLib.eachProp(qsObj, function (item, name) {
            t = (cmpx.CmpxLib.isObject(item) || cmpx.CmpxLib.isArray(item)) ? JSON.stringify(item) : item;
            qsList.push([name, '=', t ? encodeURIComponent(t) : '']);
        });
        t = qsList.length > 0 ? ('?' + qsList.join('&')) : '';
        return [url, t, hash].join('');
    };
    /**
     * 获取query项
     * @param url
     * @param name 如果空为全部query
     */
    ActionLocation.getQueryString = function (url, name) {
        return name ? ActionLocation.qureyStringToObject(url)[name] :
            (_qsRegx.test(url) ? RegExp.$1 : '');
    };
    /**
     * 取得hash值, 返回#hash
     * @param url
     */
    ActionLocation.getHash = function (url) {
        return _hashReg.test(url) ? RegExp.$1 : '';
    };
    //只取url部
    ActionLocation.getUrlPart = function (url) {
        return _urlPartRegx.test(url) ? RegExp.$1 : '';
    };
    /**
     * query项
     * @param url
     * @param name
     * @param value
     */
    ActionLocation.setQueryString = function (url, name, value) {
        if (!name)
            return url;
        var qsObj = ActionLocation.qureyStringToObject(url);
        qsObj[name] = value ? encodeURIComponent(value) : '';
        return ActionLocation.qureyStringFromObject(url, qsObj);
    };
    ActionLocation.navigate = function (href, target, params) {
        var router = _getRouter(target);
        router && router.navigate(href, params);
    };
    ActionLocation.reload = function (target) {
        var router = _getRouter(target);
        router && router.reload();
    };
    ActionLocation.prototype.navigate = function (href, target, params) {
        this.href = href;
        if (this.$router) {
            this.$router.navigate(href, params);
        }
        else
            window.location.replace(href);
    };
    ActionLocation.prototype.reload = function () {
        if (this.$router)
            this.$router.reload();
        else
            window.location.reload(true);
    };
    ActionLocation.prototype.qureyParams = function () {
        return this._qureyParams || (this._qureyParams = ActionLocation.qureyStringToObject(this.href));
    };
    ActionLocation.prototype.onNavigateBefore = function (cb) {
        cb();
    };
    ActionLocation.prototype.onNavigate = function () {
    };
    return ActionLocation;
}());
cmpx.VMManager.parent = function (target, context) {
    switch (context.type) {
        case "Componet":
            return target.$controller;
        case "Controller":
            return target.$parent;
    }
};
var VMView = cmpx.VMComponet;
var View = (function (_super) {
    __extends(View, _super);
    function View() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return View;
}(cmpx.Componet));
var _rmPathSplit2 = /[\\\/]{2,}/g;
var _pathSplit = /\//g;
var _buildAction = function (controllerDef, parent, appView) {
    var routers = {}, actionDec = _getAtionDec(controllerDef.prototype);
    cmpx.CmpxLib.eachProp(actionDec, function (item, n) {
        if (!item.controller.$parent)
            item.controller.$parent = parent;
        else if (item.controller.$parent != parent)
            throw new Error('此controller已经存在');
        if (appView && !appView.prototype.$controller) {
            var target = appView.prototype;
            _rootController = target.$controller = item.controller;
            target.$location = new ActionLocation(window.location + '', '');
        }
        routers[n] = {
            controller: item.controller,
            propertyKey: item.propertyKey,
            path: item.path,
            action: item.action,
            init: false,
            childs: null
        };
        item.index && (routers['&index'] = routers[n]);
    });
    return routers;
};
var _getActionResult = function (name, path, routerCP, cb) {
    var pathList = ActionLocation.getUrlPart(path).replace(_rmPathSplit2, '/').replace(/^\s*\//, '').split(_pathSplit), pathCount = pathList.length, maxPos = pathCount - 1, location = new _rootLoactionDef(path, name, routerCP);
    var fn = function (routers, pathIndex, cb) {
        if (!routers)
            cb(null);
        var isEnd = (pathIndex == pathCount), //最后并找index
        path = isEnd ? '&index' : pathList[pathIndex], rItem = routers[path], controller = rItem.controller, result = rItem ? rItem.action.call(rItem.controller, location) : null;
        if (result) {
            result.$location = location;
            result.onLayout(function (result) {
                if (result) {
                    if (isEnd) {
                        initResult(result, controller);
                        cb(result);
                    }
                    else if (cmpx.CmpxLib.isClass(result, Controller)) {
                        if (rItem.init) {
                            fn(rItem.childs, pathIndex + 1, cb);
                        }
                        else {
                            rItem.init = true;
                            rItem.childs = _buildAction(result, rItem.controller);
                            fn(rItem.childs, pathIndex + 1, cb);
                        }
                    }
                    else {
                        //如果不是最后的path返回无效资源
                        if (maxPos == pathIndex) {
                            initResult(result, controller);
                            cb(result);
                        }
                        else
                            cb(null);
                    }
                }
                else
                    cb(null);
            });
        }
        else
            cb(null);
    }, initResult = function (result, controller) {
        if (result instanceof View) {
            var resultV = result;
            resultV['$location'] = location;
            resultV['$parentView'] = routerCP && routerCP.$parent;
            resultV['$controller'] = controller;
            resultV['$root'] = _root;
        }
    };
    location.onNavigateBefore(function (err) {
        var endFn = function (res) {
            cb.apply(this, arguments);
            location.onNavigate();
        };
        if (err)
            endFn(null);
        else
            fn(_routerAction, 0, endFn);
    });
};
var _actionDecName = '__CtrlActionDecName';
var _setActionDec = function (target, p) {
    var actionDec = target[_actionDecName] || (target[_actionDecName] = {});
    actionDec[p.path] = p;
};
var _getAtionDec = function (controller, path) {
    var actionDec = controller[_actionDecName];
    return arguments.length <= 1 ? actionDec : (actionDec[path] || actionDec[actionDec.index]);
};
/**
 * 注入模块配置信息
 * @param config
 */
function VMAction(path) {
    var hasPath = arguments.length > 0;
    return function (target, propertyKey) {
        hasPath || (path = propertyKey);
        _setActionDec(target, {
            path: path,
            propertyKey: propertyKey,
            action: target[propertyKey],
            index: false,
            controller: null
        });
    };
}
/**
 * 注入模块配置信息
 * @param config
 */
function VMController(config) {
    config || (config = {});
    return function (constructor) {
        var target = constructor.prototype, include = config.include || [];
        include = include.concat([RouterComponet, RouterLink]);
        cmpx.VMManager.setConfig(target, config);
        cmpx.VMManager.include(target, {
            name: '', type: 'Controller',
            def: constructor
        }, include);
        config.location && cmpx.VMManager.setVM(target, 'location', config.location);
        var actionDec = _getAtionDec(target), index = config.index || '', controller = new constructor();
        cmpx.CmpxLib.eachProp(actionDec, function (item) {
            item.index = item.path == index;
            item.controller = controller;
        });
    };
}
var Controller = (function () {
    function Controller() {
    }
    return Controller;
}());
var _routers = {};
var _getRouter = function (name) {
    return _routers[name];
};
var _removeRouter = function (name) {
    _routers[name] = null;
};
var _getRouterByCP = function (component, routerName) {
    var childs = component.$children, router;
    cmpx.CmpxLib.each(childs, function (item) {
        if (item instanceof RouterComponet) {
            if (!routerName || item.name == routerName) {
                router = item;
                return false;
            }
        }
    });
    return router;
};
var _setRouter = function (name, router) {
    _routers[name] = router;
};
var RouterComponet = (function (_super) {
    __extends(RouterComponet, _super);
    function RouterComponet() {
        return _super.call(this) || this;
    }
    RouterComponet.prototype.navigate = function (path, params) {
        this.params = params;
        this.path = path;
        this.$update();
    };
    RouterComponet.prototype.reload = function () {
        this._path += '_';
        this.navigate(this.path);
    };
    RouterComponet.prototype.updateRender = function (callback) {
        var _this = this;
        _getActionResult(this.name, this.path, this, function (view) {
            if (view) {
                _this.render = _this.$render(view);
                _this.$update();
            }
            callback();
        });
    };
    RouterComponet.prototype.onUpdateBefore = function (cb) {
        var _this = this;
        if (this.path == this._path)
            _super.prototype.onUpdateBefore.call(this, cb);
        else {
            this._path = this.path;
            this.updateRender(function () {
                _super.prototype.onUpdateBefore.call(_this, cb);
            });
        }
    };
    RouterComponet.prototype.onInit = function (cb) {
        var _this = this;
        this.name && _setRouter(this.name, this);
        this._path = this.path;
        this.updateRender(function () {
            _super.prototype.onInit.call(_this, cb);
        });
    };
    RouterComponet.prototype.onDispose = function () {
        this.name && _removeRouter(this.name);
        _super.prototype.onDispose.call(this);
    };
    __decorate([
        cmpx.VMAttr('name')
    ], RouterComponet.prototype, "name");
    RouterComponet = __decorate([
        cmpx.VMComponet({
            name: 'router',
            tmpl: function (CmpxLib$$1, Compile, componet, element, subject) {
                Compile.includeRender(function () { return this.render; }, null, componet, element, true, subject, null);
            }
        })
    ], RouterComponet);
    return RouterComponet;
}(cmpx.Componet));
var _routerAction;
var _rootController;
var _rootLoactionDef;
var _root;
var MvcBrowser = (function (_super) {
    __extends(MvcBrowser, _super);
    function MvcBrowser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MvcBrowser.prototype.bootFromController = function (controllerDef, appView) {
        //let ctrl = new controllerDef();
        //console.log(ctrl);
        _rootLoactionDef = cmpx.VMManager.getVM(controllerDef.prototype, 'location');
        _routerAction = _buildAction(controllerDef, null, appView);
        //appView.prototype.$controller
        var app = _root = new appView();
        _super.prototype.boot.call(this, app);
    };
    return MvcBrowser;
}(cmpx.Browser));
var RouterLink = (function (_super) {
    __extends(RouterLink, _super);
    function RouterLink(element) {
        return _super.call(this, element) || this;
    }
    RouterLink.prototype.click = function () {
        var routerName = this.targetName, router;
        if (routerName) {
            router = _getRouter(routerName);
        }
        else {
            router = _getRouterByCP(this.$componet);
        }
        if (router) {
            router.path = this.link;
            router.$update();
        }
    };
    __decorate([
        cmpx.VMAttr('router-link')
    ], RouterLink.prototype, "link");
    __decorate([
        cmpx.VMAttr('router-target')
    ], RouterLink.prototype, "targetName");
    __decorate([
        cmpx.VMEvent()
    ], RouterLink.prototype, "click");
    RouterLink = __decorate([
        cmpx.VMBind({ name: 'router-link' })
    ], RouterLink);
    return RouterLink;
}(cmpx.Bind));

exports.ActionResult = ActionResult;
exports.AsyncResult = AsyncResult;
exports.ViewResult = ViewResult;
exports.RedirectResult = RedirectResult;
exports.ContorllerResult = ContorllerResult;
exports.WebpackLoaderContorllerResult = WebpackLoaderContorllerResult;
exports.ActionLocation = ActionLocation;
exports.VMView = VMView;
exports.View = View;
exports.VMAction = VMAction;
exports.VMController = VMController;
exports.Controller = Controller;
exports.RouterComponet = RouterComponet;
exports.MvcBrowser = MvcBrowser;
exports.RouterLink = RouterLink;
Object.keys(cmpx).forEach(function (key) { exports[key] = cmpx[key]; });

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
