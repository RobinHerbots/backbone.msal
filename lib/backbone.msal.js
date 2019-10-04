var _ = require("underscore"),
	Backbone = require("backbone"),
	Msal = require("msal"),
	$ = require("jquery");

//Extend the basic Backbone.Router with msal.js
//https://github.com/AzureAD/microsoft-authentication-library-for-js
Backbone.MsalRouter = function (options) {
	options || (options = {});
	if (options.routes) this.routes = options.routes;

	this._bindRoutes();
	this._initAuth();
	this.initialize.apply(this, arguments);
};

Backbone.MsalRouter.prototype = Backbone.Router.prototype;
Backbone.MsalRouter.extend = Backbone.Router.extend;

Backbone.MsalRouter = Backbone.MsalRouter.extend({
	msalConfig: undefined,
	_initAuth: function () {
		if (this.msalConfig) {
			this.authContext = new Msal.UserAgentApplication(this.msalConfig);
			Backbone.sync.authContext = this.authContext; //inject the authentication context
		}
	},
	_auth: function (params, next) {
		if (this.authContext) {
			if (!this.authContext.getAccount() && !this.isAnonymous) {
				this.authContext.loginPopup({})
					.then(response => {
						return next();
					});
			} else {
				return next();
			}
		} else return next();
	},
	before: function (params, next) {
		return next();
	},
	after: function () {
	},
	route: function (route, name, callback) {
		if (!_.isRegExp(route)) route = this._routeToRegExp(route);
		if (_.isFunction(name)) {
			callback = name;
			name = "";
		}
		if (!callback) callback = this[name];

		var router = this;

		Backbone.history.route(route, function (fragment) {
			var args = router._extractParameters(route, fragment),
				next = function () {
					callback && callback.apply(router, args);
					router.trigger.apply(router, ['route:' + name].concat(args));
					router.trigger('route', name, args);
					Backbone.history.trigger('route', router, name, args);
					router.after.apply(router, args);
				},
				before = function () {
					router.before.apply(router, [args, next]);
				};
			router._auth.apply(router, [args, before]);
		});
		return router;
	}
});

Object.defineProperty(Backbone.MsalRouter.prototype, 'isAnonymous', {
	get: function () {
		return this.authContext ? this.authContext.getScopesForEndpoint(window.location.href) === null : true;
	},
	set: function () { //ignore
	},
	enumerable: true,
	configurable: false
});

var originSync = Backbone.sync;
Backbone.sync = function (method, model, options) {
	options = options || {};
	var that = this,
		authContext = Backbone.sync.authContext,
		scopes = authContext.getScopesForEndpoint(options.url || ($.isFunction(model.url) ? model.url() : model.url));
	var dfd = $.Deferred();
	if (scopes !== null) {
		authContext.acquireTokenSilent({scopes: scopes}).then(response => {
			options.headers = options.headers || {}
			$.extend(options.headers,
				{
					"Authorization": "Bearer " + response.accessToken
				});

			dfd = originSync.call(that, method, model, options);
		}).catch(err => {
			dfd.resolve();
			return;
		});
	} else dfd.resolve();
	return dfd.promise();
}

module.exports = {Msal, Backbone};