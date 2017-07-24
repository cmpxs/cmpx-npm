"use strict";
exports.__esModule = true;
var stringEmpty = "", toString = Object.prototype.toString, core_hasOwn = Object.prototype.hasOwnProperty, noop = function () { }, slice = Array.prototype.slice;
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
    CmpxLib.extend = function (obj) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (obj) {
            CmpxLib.each(args, function (p) {
                p && CmpxLib.eachProp(p, function (item, name) { obj[name] = item; });
            });
        }
        return obj;
    };
    CmpxLib.makeAutoId = function () {
        var t = new Date().valueOf();
        if ((++_tick) > 100000)
            _tick = 0;
        return [t, _tick].join('_');
    };
    /**
     * 是否类
     * @param p 参数
     * @param cls 类
     */
    CmpxLib.isClass = function (p, cls) {
        return p ? (p == cls || (p.prototype && p.prototype instanceof cls)) : false;
    };
    CmpxLib.stringEmpty = stringEmpty;
    CmpxLib.noop = noop;
    return CmpxLib;
}());
exports.CmpxLib = CmpxLib;
var _tick = 0;
//# sourceMappingURL=cmpxLib.js.map