var _ = require("underscore"),
	Backbone = require("backbone"),
	Msal = require("msal"),
	$ = require("jquery");

//Extend the basic Backbone.Router with msal.js
//https://github.com/AzureAD/microsoft-authentication-library-for-js
Backbone.MsalRouter = function (options) {
	options || (options = {});
	const that = this;
	this.preinitialize.apply(this, arguments);
	if (options.routes) this.routes = options.routes;
	this._bindRoutes();
	this._initAuth().then((response) => {
		that.initialize.apply(that, arguments);
	}), (err) => {
		//err
		this.authContext.getLogger().error(err);
	};
};

Backbone.MsalRouter.prototype = Backbone.Router.prototype;
Backbone.MsalRouter.extend = Backbone.Router.extend;

Object.defineProperty(Msal.UserAgentApplication.prototype, "IsTokenExpired", {
	get: function () {
		const user = this.getAccount();
		if (user)
			return Math.floor(Date.now() / 1000) > user.idToken.exp;
		return undefined;
	},
	set: function () { //ignore
	},
	enumerable: true,
	configurable: false
});

Backbone.MsalRouter = Backbone.MsalRouter.extend({
	_initAuth: function () {
		const that = this;
		return new Promise((resolve, reject) => {
			if (this.msalConfig) {
				if ($.isFunction(this.msalConfig)) {
					this.msalConfig = this.msalConfig();
				}
				this.authContext = new Msal.UserAgentApplication(this.msalConfig);
				Backbone.sync.authContext = this.authContext; //inject the authentication context
				Backbone.sync.Headers = this.Headers;
				this.authContext.handleRedirectCallback((err, response) => {
					if (err) {
						that.authContext.getLogger().error(err);
						reject(err);
					} else resolve(response);
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
					router.trigger.apply(router, ["route:" + name].concat(args));
					router.trigger("route", name, args);
					Backbone.history.trigger("route", router, name, args);
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

Object.defineProperty(Backbone.MsalRouter.prototype, "isAnonymous", {
	get: function () {
		return this.authContext ? this.authContext.getScopesForEndpoint(window.location.href) === null : true;
	},
	set: function () { //ignore
	},
	enumerable: true,
	configurable: false
});

var originXMLHttpRequest_open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function () {
	this._url = arguments[1];
	return originXMLHttpRequest_open.apply(this, arguments);
};

var originXMLHttpRequest_send = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function () {
	var args = arguments, xhr = this, authContext = Backbone.sync.authContext,
		scopes = authContext ? authContext.getScopesForEndpoint(this._url) : null;
	//inject extra headers
	if (xhr.readyState == 1) {
		if (Array.isArray(Backbone.sync.Headers)) {
			Backbone.sync.Headers.forEach(h => xhr.setRequestHeader(h.name, h.value));
		}
	}

	if (scopes === null) return originXMLHttpRequest_send.apply(this, args);
	authContext.acquireTokenSilent({
		scopes: scopes
	}).then(function (response) {
		if (xhr.readyState == 1) {
			xhr.setRequestHeader("Authorization", "Bearer " + response.accessToken);
		} else {
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 1) {
					xhr.setRequestHeader("Authorization", "Bearer " + response.accessToken);
				}
			};
		}
		return originXMLHttpRequest_send.apply(xhr, args);
	}, function (err) {
		authContext.getLogger().error(err);
	});
};


module.exports = {Msal, Backbone};