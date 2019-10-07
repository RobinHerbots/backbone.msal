var _ = require("underscore"),
	Backbone = require("backbone"),
	Msal = require("msal"),
	$ = require("jquery");

//Extend the basic Backbone.Router with msal.js
//https://github.com/AzureAD/microsoft-authentication-library-for-js
Backbone.MsalRouter = function (options) {
	options || (options = {});
	const that = this;
	if (options.routes) this.routes = options.routes;
	this._bindRoutes();
	this._initAuth().then((response) => {
		that.initialize.apply(that, arguments);
	}), (err) => {
		//err
	};
};

Backbone.MsalRouter.prototype = Backbone.Router.prototype;
Backbone.MsalRouter.extend = Backbone.Router.extend;

Backbone.MsalRouter = Backbone.MsalRouter.extend({
	_initAuth: function () {
		return new Promise((resolve, reject) => {
			if (this.msalConfig) {
				if ($.isFunction(this.msalConfig)) {
					this.msalConfig = this.msalConfig();
				}
				this.authContext = new Msal.UserAgentApplication(this.msalConfig);
				Backbone.sync.authContext = this.authContext; //inject the authentication context
				this.authContext.handleRedirectCallback((err, response) => {
					if (err) reject(err);
					else resolve(response);
				});
				if (!this.authContext.isCallback(window.location.hash))
					resolve();
			} else
				resolve();
		});
	},
	_auth: function (params, next) {
		if (this.authContext) {
			if (!this.authContext.getAccount() && !this.isAnonymous) {
				this.authContext.loginRedirect({});
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
	return new Promise((resolve, reject) => {
		if (scopes !== null) {
			authContext.acquireTokenSilent({scopes: scopes}).then(response => {
				options.headers = options.headers || {}
				$.extend(options.headers,
					{
						"Authorization": "Bearer " + response.accessToken
					});

				originSync.call(that, method, model, options).then(resolve, reject);
			}).catch(err => {
				reject(err);
			});
		} else originSync.call(that, method, model, options).then(resolve, reject);
	});
}

module.exports = {Msal, Backbone};