/*!
 * dist/backbone.msal
 * https://github.com/RobinHerbots/backbone.msal#readme
 * Copyright (c) 2010 - 2019 
 * Licensed under the MIT license
 * Version: 0.0.14-beta.1
 */
!function webpackUniversalModuleDefinition(root, factory) {
    if ("object" == typeof exports && "object" == typeof module) module.exports = factory(require("underscore"), require("backbone"), require("msal"), require("jquery")); else if ("function" == typeof define && define.amd) define([ "underscore", "backbone", "msal", "jquery" ], factory); else {
        var a = "object" == typeof exports ? factory(require("underscore"), require("backbone"), require("msal"), require("jquery")) : factory(root.underscore, root.backbone, root.msal, root.jquery);
        for (var i in a) ("object" == typeof exports ? exports : root)[i] = a[i];
    }
}(window, function(__WEBPACK_EXTERNAL_MODULE__1__, __WEBPACK_EXTERNAL_MODULE__2__, __WEBPACK_EXTERNAL_MODULE__3__, __WEBPACK_EXTERNAL_MODULE__4__) {
    return modules = [ function(module, exports, __webpack_require__) {
        "use strict";
        var _ = __webpack_require__(1), Backbone = __webpack_require__(2), Msal = __webpack_require__(3), $ = __webpack_require__(4);
        Backbone.MsalRouter = function(options) {
            var _arguments = arguments, _this = this;
            options = options || {};
            var that = this;
            this.preinitialize.apply(this, arguments), options.routes && (this.routes = options.routes), 
            this._bindRoutes(), this._initAuth().then(function(response) {
                that.initialize.apply(that, _arguments);
            });
        }, Backbone.MsalRouter.prototype = Backbone.Router.prototype, Backbone.MsalRouter.extend = Backbone.Router.extend, 
        Object.defineProperty(Msal.UserAgentApplication.prototype, "IsTokenExpired", {
            get: function get() {
                var user = this.getAccount();
                if (user) return Math.floor(Date.now() / 1e3) > user.idToken.exp;
            },
            set: function set() {},
            enumerable: !0,
            configurable: !1
        }), Backbone.MsalRouter = Backbone.MsalRouter.extend({
            _initAuth: function _initAuth() {
                var _this2 = this;
                return new Promise(function(resolve, reject) {
                    _this2.msalConfig ? ($.isFunction(_this2.msalConfig) && (_this2.msalConfig = _this2.msalConfig()), 
                    _this2.authContext = new Msal.UserAgentApplication(_this2.msalConfig), Backbone.sync.authContext = _this2.authContext, 
                    _this2.authContext.handleRedirectCallback(function(err, response) {
                        err ? reject(err) : resolve(response);
                    }), _this2.authContext.isCallback(window.location.hash) || resolve()) : resolve();
                });
            },
            _auth: function _auth(params, next) {
                return this.authContext ? this.authContext.getAccount() || this.isAnonymous ? next() : void this.authContext.loginRedirect({}) : next();
            },
            before: function before(params, next) {
                return next();
            },
            after: function after() {},
            route: function route(_route, name, callback) {
                _.isRegExp(_route) || (_route = this._routeToRegExp(_route)), _.isFunction(name) && (callback = name, 
                name = ""), callback = callback || this[name];
                var router = this;
                return Backbone.history.route(_route, function(fragment) {
                    var args = router._extractParameters(_route, fragment), next = function next() {
                        callback && callback.apply(router, args), router.trigger.apply(router, [ "route:" + name ].concat(args)), 
                        router.trigger("route", name, args), Backbone.history.trigger("route", router, name, args), 
                        router.after.apply(router, args);
                    }, before = function before() {
                        router.before.apply(router, [ args, next ]);
                    };
                    router._auth.apply(router, [ args, before ]);
                }), router;
            }
        }), Object.defineProperty(Backbone.MsalRouter.prototype, "isAnonymous", {
            get: function get() {
                return !this.authContext || null === this.authContext.getScopesForEndpoint(window.location.href);
            },
            set: function set() {},
            enumerable: !0,
            configurable: !1
        });
        var originAjax = $.ajax;
        $.ajax = function(url, options) {
            options = options || {};
            var that = this, authContext = Backbone.sync.authContext, scopes = authContext ? authContext.getScopesForEndpoint(url) : null, dfd = $.Deferred();
            return null !== scopes ? authContext.acquireTokenSilent({
                scopes: scopes
            }).then(function(response) {
                options.headers = options.headers || {}, $.extend(options.headers, {
                    Authorization: "Bearer " + response.accessToken
                }), originAjax.call(that, url, options).then(dfd.resolve, dfd.reject);
            }, function(err) {
                authContext.getLogger().error(err), dfd.reject(err);
            }) : originAjax.call(that, url, options).then(dfd.resolve, dfd.reject), dfd.promise();
        }, module.exports = {
            Msal: Msal,
            Backbone: Backbone
        };
    }, function(module, exports) {
        module.exports = __WEBPACK_EXTERNAL_MODULE__1__;
    }, function(module, exports) {
        module.exports = __WEBPACK_EXTERNAL_MODULE__2__;
    }, function(module, exports) {
        module.exports = __WEBPACK_EXTERNAL_MODULE__3__;
    }, function(module, exports) {
        module.exports = __WEBPACK_EXTERNAL_MODULE__4__;
    } ], installedModules = {}, __webpack_require__.m = modules, __webpack_require__.c = installedModules, 
    __webpack_require__.d = function(exports, name, getter) {
        __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
            enumerable: !0,
            get: getter
        });
    }, __webpack_require__.r = function(exports) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(exports, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(exports, "__esModule", {
            value: !0
        });
    }, __webpack_require__.t = function(value, mode) {
        if (1 & mode && (value = __webpack_require__(value)), 8 & mode) return value;
        if (4 & mode && "object" == typeof value && value && value.__esModule) return value;
        var ns = Object.create(null);
        if (__webpack_require__.r(ns), Object.defineProperty(ns, "default", {
            enumerable: !0,
            value: value
        }), 2 & mode && "string" != typeof value) for (var key in value) __webpack_require__.d(ns, key, function(key) {
            return value[key];
        }.bind(null, key));
        return ns;
    }, __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function getDefault() {
            return module.default;
        } : function getModuleExports() {
            return module;
        };
        return __webpack_require__.d(getter, "a", getter), getter;
    }, __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    }, __webpack_require__.p = "", __webpack_require__(__webpack_require__.s = 0);
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {}
        };
        return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
        module.l = !0, module.exports;
    }
    var modules, installedModules;
});