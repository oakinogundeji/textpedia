(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
    try {
        cachedSetTimeout = setTimeout;
    } catch (e) {
        cachedSetTimeout = function () {
            throw new Error('setTimeout is not defined');
        }
    }
    try {
        cachedClearTimeout = clearTimeout;
    } catch (e) {
        cachedClearTimeout = function () {
            throw new Error('clearTimeout is not defined');
        }
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
/*!
 * vue-resource v0.9.3
 * https://github.com/vuejs/vue-resource
 * Released under the MIT License.
 */

'use strict';

/**
 * Promises/A+ polyfill v1.1.4 (https://github.com/bramstein/promis)
 */

var RESOLVED = 0;
var REJECTED = 1;
var PENDING = 2;

function Promise$2(executor) {

    this.state = PENDING;
    this.value = undefined;
    this.deferred = [];

    var promise = this;

    try {
        executor(function (x) {
            promise.resolve(x);
        }, function (r) {
            promise.reject(r);
        });
    } catch (e) {
        promise.reject(e);
    }
}

Promise$2.reject = function (r) {
    return new Promise$2(function (resolve, reject) {
        reject(r);
    });
};

Promise$2.resolve = function (x) {
    return new Promise$2(function (resolve, reject) {
        resolve(x);
    });
};

Promise$2.all = function all(iterable) {
    return new Promise$2(function (resolve, reject) {
        var count = 0,
            result = [];

        if (iterable.length === 0) {
            resolve(result);
        }

        function resolver(i) {
            return function (x) {
                result[i] = x;
                count += 1;

                if (count === iterable.length) {
                    resolve(result);
                }
            };
        }

        for (var i = 0; i < iterable.length; i += 1) {
            Promise$2.resolve(iterable[i]).then(resolver(i), reject);
        }
    });
};

Promise$2.race = function race(iterable) {
    return new Promise$2(function (resolve, reject) {
        for (var i = 0; i < iterable.length; i += 1) {
            Promise$2.resolve(iterable[i]).then(resolve, reject);
        }
    });
};

var p$1 = Promise$2.prototype;

p$1.resolve = function resolve(x) {
    var promise = this;

    if (promise.state === PENDING) {
        if (x === promise) {
            throw new TypeError('Promise settled with itself.');
        }

        var called = false;

        try {
            var then = x && x['then'];

            if (x !== null && typeof x === 'object' && typeof then === 'function') {
                then.call(x, function (x) {
                    if (!called) {
                        promise.resolve(x);
                    }
                    called = true;
                }, function (r) {
                    if (!called) {
                        promise.reject(r);
                    }
                    called = true;
                });
                return;
            }
        } catch (e) {
            if (!called) {
                promise.reject(e);
            }
            return;
        }

        promise.state = RESOLVED;
        promise.value = x;
        promise.notify();
    }
};

p$1.reject = function reject(reason) {
    var promise = this;

    if (promise.state === PENDING) {
        if (reason === promise) {
            throw new TypeError('Promise settled with itself.');
        }

        promise.state = REJECTED;
        promise.value = reason;
        promise.notify();
    }
};

p$1.notify = function notify() {
    var promise = this;

    nextTick(function () {
        if (promise.state !== PENDING) {
            while (promise.deferred.length) {
                var deferred = promise.deferred.shift(),
                    onResolved = deferred[0],
                    onRejected = deferred[1],
                    resolve = deferred[2],
                    reject = deferred[3];

                try {
                    if (promise.state === RESOLVED) {
                        if (typeof onResolved === 'function') {
                            resolve(onResolved.call(undefined, promise.value));
                        } else {
                            resolve(promise.value);
                        }
                    } else if (promise.state === REJECTED) {
                        if (typeof onRejected === 'function') {
                            resolve(onRejected.call(undefined, promise.value));
                        } else {
                            reject(promise.value);
                        }
                    }
                } catch (e) {
                    reject(e);
                }
            }
        }
    });
};

p$1.then = function then(onResolved, onRejected) {
    var promise = this;

    return new Promise$2(function (resolve, reject) {
        promise.deferred.push([onResolved, onRejected, resolve, reject]);
        promise.notify();
    });
};

p$1.catch = function (onRejected) {
    return this.then(undefined, onRejected);
};

var PromiseObj = window.Promise || Promise$2;

function Promise$1(executor, context) {

    if (executor instanceof PromiseObj) {
        this.promise = executor;
    } else {
        this.promise = new PromiseObj(executor.bind(context));
    }

    this.context = context;
}

Promise$1.all = function (iterable, context) {
    return new Promise$1(PromiseObj.all(iterable), context);
};

Promise$1.resolve = function (value, context) {
    return new Promise$1(PromiseObj.resolve(value), context);
};

Promise$1.reject = function (reason, context) {
    return new Promise$1(PromiseObj.reject(reason), context);
};

Promise$1.race = function (iterable, context) {
    return new Promise$1(PromiseObj.race(iterable), context);
};

var p = Promise$1.prototype;

p.bind = function (context) {
    this.context = context;
    return this;
};

p.then = function (fulfilled, rejected) {

    if (fulfilled && fulfilled.bind && this.context) {
        fulfilled = fulfilled.bind(this.context);
    }

    if (rejected && rejected.bind && this.context) {
        rejected = rejected.bind(this.context);
    }

    return new Promise$1(this.promise.then(fulfilled, rejected), this.context);
};

p.catch = function (rejected) {

    if (rejected && rejected.bind && this.context) {
        rejected = rejected.bind(this.context);
    }

    return new Promise$1(this.promise.catch(rejected), this.context);
};

p.finally = function (callback) {

    return this.then(function (value) {
        callback.call(this);
        return value;
    }, function (reason) {
        callback.call(this);
        return PromiseObj.reject(reason);
    });
};

var debug = false;
var util = {};
var array = [];
function Util (Vue) {
    util = Vue.util;
    debug = Vue.config.debug || !Vue.config.silent;
}

function warn(msg) {
    if (typeof console !== 'undefined' && debug) {
        console.warn('[VueResource warn]: ' + msg);
    }
}

function error(msg) {
    if (typeof console !== 'undefined') {
        console.error(msg);
    }
}

function nextTick(cb, ctx) {
    return util.nextTick(cb, ctx);
}

function trim(str) {
    return str.replace(/^\s*|\s*$/g, '');
}

var isArray = Array.isArray;

function isString(val) {
    return typeof val === 'string';
}

function isBoolean(val) {
    return val === true || val === false;
}

function isFunction(val) {
    return typeof val === 'function';
}

function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

function isPlainObject(obj) {
    return isObject(obj) && Object.getPrototypeOf(obj) == Object.prototype;
}

function isFormData(obj) {
    return typeof FormData !== 'undefined' && obj instanceof FormData;
}

function when(value, fulfilled, rejected) {

    var promise = Promise$1.resolve(value);

    if (arguments.length < 2) {
        return promise;
    }

    return promise.then(fulfilled, rejected);
}

function options(fn, obj, opts) {

    opts = opts || {};

    if (isFunction(opts)) {
        opts = opts.call(obj);
    }

    return merge(fn.bind({ $vm: obj, $options: opts }), fn, { $options: opts });
}

function each(obj, iterator) {

    var i, key;

    if (typeof obj.length == 'number') {
        for (i = 0; i < obj.length; i++) {
            iterator.call(obj[i], obj[i], i);
        }
    } else if (isObject(obj)) {
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                iterator.call(obj[key], obj[key], key);
            }
        }
    }

    return obj;
}

var assign = Object.assign || _assign;

function merge(target) {

    var args = array.slice.call(arguments, 1);

    args.forEach(function (source) {
        _merge(target, source, true);
    });

    return target;
}

function defaults(target) {

    var args = array.slice.call(arguments, 1);

    args.forEach(function (source) {

        for (var key in source) {
            if (target[key] === undefined) {
                target[key] = source[key];
            }
        }
    });

    return target;
}

function _assign(target) {

    var args = array.slice.call(arguments, 1);

    args.forEach(function (source) {
        _merge(target, source);
    });

    return target;
}

function _merge(target, source, deep) {
    for (var key in source) {
        if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
            if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                target[key] = {};
            }
            if (isArray(source[key]) && !isArray(target[key])) {
                target[key] = [];
            }
            _merge(target[key], source[key], deep);
        } else if (source[key] !== undefined) {
            target[key] = source[key];
        }
    }
}

function root (options, next) {

    var url = next(options);

    if (isString(options.root) && !url.match(/^(https?:)?\//)) {
        url = options.root + '/' + url;
    }

    return url;
}

function query (options, next) {

    var urlParams = Object.keys(Url.options.params),
        query = {},
        url = next(options);

    each(options.params, function (value, key) {
        if (urlParams.indexOf(key) === -1) {
            query[key] = value;
        }
    });

    query = Url.params(query);

    if (query) {
        url += (url.indexOf('?') == -1 ? '?' : '&') + query;
    }

    return url;
}

/**
 * URL Template v2.0.6 (https://github.com/bramstein/url-template)
 */

function expand(url, params, variables) {

    var tmpl = parse(url),
        expanded = tmpl.expand(params);

    if (variables) {
        variables.push.apply(variables, tmpl.vars);
    }

    return expanded;
}

function parse(template) {

    var operators = ['+', '#', '.', '/', ';', '?', '&'],
        variables = [];

    return {
        vars: variables,
        expand: function (context) {
            return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
                if (expression) {

                    var operator = null,
                        values = [];

                    if (operators.indexOf(expression.charAt(0)) !== -1) {
                        operator = expression.charAt(0);
                        expression = expression.substr(1);
                    }

                    expression.split(/,/g).forEach(function (variable) {
                        var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
                        values.push.apply(values, getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
                        variables.push(tmp[1]);
                    });

                    if (operator && operator !== '+') {

                        var separator = ',';

                        if (operator === '?') {
                            separator = '&';
                        } else if (operator !== '#') {
                            separator = operator;
                        }

                        return (values.length !== 0 ? operator : '') + values.join(separator);
                    } else {
                        return values.join(',');
                    }
                } else {
                    return encodeReserved(literal);
                }
            });
        }
    };
}

function getValues(context, operator, key, modifier) {

    var value = context[key],
        result = [];

    if (isDefined(value) && value !== '') {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            value = value.toString();

            if (modifier && modifier !== '*') {
                value = value.substring(0, parseInt(modifier, 10));
            }

            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : null));
        } else {
            if (modifier === '*') {
                if (Array.isArray(value)) {
                    value.filter(isDefined).forEach(function (value) {
                        result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : null));
                    });
                } else {
                    Object.keys(value).forEach(function (k) {
                        if (isDefined(value[k])) {
                            result.push(encodeValue(operator, value[k], k));
                        }
                    });
                }
            } else {
                var tmp = [];

                if (Array.isArray(value)) {
                    value.filter(isDefined).forEach(function (value) {
                        tmp.push(encodeValue(operator, value));
                    });
                } else {
                    Object.keys(value).forEach(function (k) {
                        if (isDefined(value[k])) {
                            tmp.push(encodeURIComponent(k));
                            tmp.push(encodeValue(operator, value[k].toString()));
                        }
                    });
                }

                if (isKeyOperator(operator)) {
                    result.push(encodeURIComponent(key) + '=' + tmp.join(','));
                } else if (tmp.length !== 0) {
                    result.push(tmp.join(','));
                }
            }
        }
    } else {
        if (operator === ';') {
            result.push(encodeURIComponent(key));
        } else if (value === '' && (operator === '&' || operator === '?')) {
            result.push(encodeURIComponent(key) + '=');
        } else if (value === '') {
            result.push('');
        }
    }

    return result;
}

function isDefined(value) {
    return value !== undefined && value !== null;
}

function isKeyOperator(operator) {
    return operator === ';' || operator === '&' || operator === '?';
}

function encodeValue(operator, value, key) {

    value = operator === '+' || operator === '#' ? encodeReserved(value) : encodeURIComponent(value);

    if (key) {
        return encodeURIComponent(key) + '=' + value;
    } else {
        return value;
    }
}

function encodeReserved(str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
        if (!/%[0-9A-Fa-f]/.test(part)) {
            part = encodeURI(part);
        }
        return part;
    }).join('');
}

function template (options) {

    var variables = [],
        url = expand(options.url, options.params, variables);

    variables.forEach(function (key) {
        delete options.params[key];
    });

    return url;
}

/**
 * Service for URL templating.
 */

var ie = document.documentMode;
var el = document.createElement('a');

function Url(url, params) {

    var self = this || {},
        options = url,
        transform;

    if (isString(url)) {
        options = { url: url, params: params };
    }

    options = merge({}, Url.options, self.$options, options);

    Url.transforms.forEach(function (handler) {
        transform = factory(handler, transform, self.$vm);
    });

    return transform(options);
}

/**
 * Url options.
 */

Url.options = {
    url: '',
    root: null,
    params: {}
};

/**
 * Url transforms.
 */

Url.transforms = [template, query, root];

/**
 * Encodes a Url parameter string.
 *
 * @param {Object} obj
 */

Url.params = function (obj) {

    var params = [],
        escape = encodeURIComponent;

    params.add = function (key, value) {

        if (isFunction(value)) {
            value = value();
        }

        if (value === null) {
            value = '';
        }

        this.push(escape(key) + '=' + escape(value));
    };

    serialize(params, obj);

    return params.join('&').replace(/%20/g, '+');
};

/**
 * Parse a URL and return its components.
 *
 * @param {String} url
 */

Url.parse = function (url) {

    if (ie) {
        el.href = url;
        url = el.href;
    }

    el.href = url;

    return {
        href: el.href,
        protocol: el.protocol ? el.protocol.replace(/:$/, '') : '',
        port: el.port,
        host: el.host,
        hostname: el.hostname,
        pathname: el.pathname.charAt(0) === '/' ? el.pathname : '/' + el.pathname,
        search: el.search ? el.search.replace(/^\?/, '') : '',
        hash: el.hash ? el.hash.replace(/^#/, '') : ''
    };
};

function factory(handler, next, vm) {
    return function (options) {
        return handler.call(vm, options, next);
    };
}

function serialize(params, obj, scope) {

    var array = isArray(obj),
        plain = isPlainObject(obj),
        hash;

    each(obj, function (value, key) {

        hash = isObject(value) || isArray(value);

        if (scope) {
            key = scope + '[' + (plain || hash ? key : '') + ']';
        }

        if (!scope && array) {
            params.add(value.name, value.value);
        } else if (hash) {
            serialize(params, value, key);
        } else {
            params.add(key, value);
        }
    });
}

function xdrClient (request) {
    return new Promise$1(function (resolve) {

        var xdr = new XDomainRequest(),
            handler = function (event) {

            var response = request.respondWith(xdr.responseText, {
                status: xdr.status,
                statusText: xdr.statusText
            });

            resolve(response);
        };

        request.abort = function () {
            return xdr.abort();
        };

        xdr.open(request.method, request.getUrl(), true);
        xdr.timeout = 0;
        xdr.onload = handler;
        xdr.onerror = handler;
        xdr.ontimeout = function () {};
        xdr.onprogress = function () {};
        xdr.send(request.getBody());
    });
}

var ORIGIN_URL = Url.parse(location.href);
var SUPPORTS_CORS = 'withCredentials' in new XMLHttpRequest();

function cors (request, next) {

    if (!isBoolean(request.crossOrigin) && crossOrigin(request)) {
        request.crossOrigin = true;
    }

    if (request.crossOrigin) {

        if (!SUPPORTS_CORS) {
            request.client = xdrClient;
        }

        delete request.emulateHTTP;
    }

    next();
}

function crossOrigin(request) {

    var requestUrl = Url.parse(Url(request));

    return requestUrl.protocol !== ORIGIN_URL.protocol || requestUrl.host !== ORIGIN_URL.host;
}

function body (request, next) {

    if (request.emulateJSON && isPlainObject(request.body)) {
        request.body = Url.params(request.body);
        request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (isFormData(request.body)) {
        delete request.headers['Content-Type'];
    }

    if (isPlainObject(request.body)) {
        request.body = JSON.stringify(request.body);
    }

    next(function (response) {

        var contentType = response.headers['Content-Type'];

        if (isString(contentType) && contentType.indexOf('application/json') === 0) {

            try {
                response.data = response.json();
            } catch (e) {
                response.data = null;
            }
        } else {
            response.data = response.text();
        }
    });
}

function jsonpClient (request) {
    return new Promise$1(function (resolve) {

        var name = request.jsonp || 'callback',
            callback = '_jsonp' + Math.random().toString(36).substr(2),
            body = null,
            handler,
            script;

        handler = function (event) {

            var status = 0;

            if (event.type === 'load' && body !== null) {
                status = 200;
            } else if (event.type === 'error') {
                status = 404;
            }

            resolve(request.respondWith(body, { status: status }));

            delete window[callback];
            document.body.removeChild(script);
        };

        request.params[name] = callback;

        window[callback] = function (result) {
            body = JSON.stringify(result);
        };

        script = document.createElement('script');
        script.src = request.getUrl();
        script.type = 'text/javascript';
        script.async = true;
        script.onload = handler;
        script.onerror = handler;

        document.body.appendChild(script);
    });
}

function jsonp (request, next) {

    if (request.method == 'JSONP') {
        request.client = jsonpClient;
    }

    next(function (response) {

        if (request.method == 'JSONP') {
            response.data = response.json();
        }
    });
}

function before (request, next) {

    if (isFunction(request.before)) {
        request.before.call(this, request);
    }

    next();
}

/**
 * HTTP method override Interceptor.
 */

function method (request, next) {

    if (request.emulateHTTP && /^(PUT|PATCH|DELETE)$/i.test(request.method)) {
        request.headers['X-HTTP-Method-Override'] = request.method;
        request.method = 'POST';
    }

    next();
}

function header (request, next) {

    request.method = request.method.toUpperCase();
    request.headers = assign({}, Http.headers.common, !request.crossOrigin ? Http.headers.custom : {}, Http.headers[request.method.toLowerCase()], request.headers);

    next();
}

/**
 * Timeout Interceptor.
 */

function timeout (request, next) {

    var timeout;

    if (request.timeout) {
        timeout = setTimeout(function () {
            request.abort();
        }, request.timeout);
    }

    next(function (response) {

        clearTimeout(timeout);
    });
}

function xhrClient (request) {
    return new Promise$1(function (resolve) {

        var xhr = new XMLHttpRequest(),
            handler = function (event) {

            var response = request.respondWith('response' in xhr ? xhr.response : xhr.responseText, {
                status: xhr.status === 1223 ? 204 : xhr.status, // IE9 status bug
                statusText: xhr.status === 1223 ? 'No Content' : trim(xhr.statusText),
                headers: parseHeaders(xhr.getAllResponseHeaders())
            });

            resolve(response);
        };

        request.abort = function () {
            return xhr.abort();
        };

        xhr.open(request.method, request.getUrl(), true);
        xhr.timeout = 0;
        xhr.onload = handler;
        xhr.onerror = handler;

        if (request.progress) {
            if (request.method === 'GET') {
                xhr.addEventListener('progress', request.progress);
            } else if (/^(POST|PUT)$/i.test(request.method)) {
                xhr.upload.addEventListener('progress', request.progress);
            }
        }

        if (request.credentials === true) {
            xhr.withCredentials = true;
        }

        each(request.headers || {}, function (value, header) {
            xhr.setRequestHeader(header, value);
        });

        xhr.send(request.getBody());
    });
}

function parseHeaders(str) {

    var headers = {},
        value,
        name,
        i;

    each(trim(str).split('\n'), function (row) {

        i = row.indexOf(':');
        name = trim(row.slice(0, i));
        value = trim(row.slice(i + 1));

        if (headers[name]) {

            if (isArray(headers[name])) {
                headers[name].push(value);
            } else {
                headers[name] = [headers[name], value];
            }
        } else {

            headers[name] = value;
        }
    });

    return headers;
}

function Client (context) {

    var reqHandlers = [sendRequest],
        resHandlers = [],
        handler;

    if (!isObject(context)) {
        context = null;
    }

    function Client(request) {
        return new Promise$1(function (resolve) {

            function exec() {

                handler = reqHandlers.pop();

                if (isFunction(handler)) {
                    handler.call(context, request, next);
                } else {
                    warn('Invalid interceptor of type ' + typeof handler + ', must be a function');
                    next();
                }
            }

            function next(response) {

                if (isFunction(response)) {

                    resHandlers.unshift(response);
                } else if (isObject(response)) {

                    resHandlers.forEach(function (handler) {
                        response = when(response, function (response) {
                            return handler.call(context, response) || response;
                        });
                    });

                    when(response, resolve);

                    return;
                }

                exec();
            }

            exec();
        }, context);
    }

    Client.use = function (handler) {
        reqHandlers.push(handler);
    };

    return Client;
}

function sendRequest(request, resolve) {

    var client = request.client || xhrClient;

    resolve(client(request));
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/**
 * HTTP Response.
 */

var Response = function () {
    function Response(body, _ref) {
        var url = _ref.url;
        var headers = _ref.headers;
        var status = _ref.status;
        var statusText = _ref.statusText;
        classCallCheck(this, Response);


        this.url = url;
        this.body = body;
        this.headers = headers || {};
        this.status = status || 0;
        this.statusText = statusText || '';
        this.ok = status >= 200 && status < 300;
    }

    Response.prototype.text = function text() {
        return this.body;
    };

    Response.prototype.blob = function blob() {
        return new Blob([this.body]);
    };

    Response.prototype.json = function json() {
        return JSON.parse(this.body);
    };

    return Response;
}();

var Request = function () {
    function Request(options) {
        classCallCheck(this, Request);


        this.method = 'GET';
        this.body = null;
        this.params = {};
        this.headers = {};

        assign(this, options);
    }

    Request.prototype.getUrl = function getUrl() {
        return Url(this);
    };

    Request.prototype.getBody = function getBody() {
        return this.body;
    };

    Request.prototype.respondWith = function respondWith(body, options) {
        return new Response(body, assign(options || {}, { url: this.getUrl() }));
    };

    return Request;
}();

/**
 * Service for sending network requests.
 */

var CUSTOM_HEADERS = { 'X-Requested-With': 'XMLHttpRequest' };
var COMMON_HEADERS = { 'Accept': 'application/json, text/plain, */*' };
var JSON_CONTENT_TYPE = { 'Content-Type': 'application/json;charset=utf-8' };

function Http(options) {

    var self = this || {},
        client = Client(self.$vm);

    defaults(options || {}, self.$options, Http.options);

    Http.interceptors.forEach(function (handler) {
        client.use(handler);
    });

    return client(new Request(options)).then(function (response) {

        return response.ok ? response : Promise$1.reject(response);
    }, function (response) {

        if (response instanceof Error) {
            error(response);
        }

        return Promise$1.reject(response);
    });
}

Http.options = {};

Http.headers = {
    put: JSON_CONTENT_TYPE,
    post: JSON_CONTENT_TYPE,
    patch: JSON_CONTENT_TYPE,
    delete: JSON_CONTENT_TYPE,
    custom: CUSTOM_HEADERS,
    common: COMMON_HEADERS
};

Http.interceptors = [before, timeout, method, body, jsonp, header, cors];

['get', 'delete', 'head', 'jsonp'].forEach(function (method) {

    Http[method] = function (url, options) {
        return this(assign(options || {}, { url: url, method: method }));
    };
});

['post', 'put', 'patch'].forEach(function (method) {

    Http[method] = function (url, body, options) {
        return this(assign(options || {}, { url: url, method: method, body: body }));
    };
});

function Resource(url, params, actions, options) {

    var self = this || {},
        resource = {};

    actions = assign({}, Resource.actions, actions);

    each(actions, function (action, name) {

        action = merge({ url: url, params: params || {} }, options, action);

        resource[name] = function () {
            return (self.$http || Http)(opts(action, arguments));
        };
    });

    return resource;
}

function opts(action, args) {

    var options = assign({}, action),
        params = {},
        body;

    switch (args.length) {

        case 2:

            params = args[0];
            body = args[1];

            break;

        case 1:

            if (/^(POST|PUT|PATCH)$/i.test(options.method)) {
                body = args[0];
            } else {
                params = args[0];
            }

            break;

        case 0:

            break;

        default:

            throw 'Expected up to 4 arguments [params, body], got ' + args.length + ' arguments';
    }

    options.body = body;
    options.params = assign({}, options.params, params);

    return options;
}

Resource.actions = {

    get: { method: 'GET' },
    save: { method: 'POST' },
    query: { method: 'GET' },
    update: { method: 'PUT' },
    remove: { method: 'DELETE' },
    delete: { method: 'DELETE' }

};

function plugin(Vue) {

    if (plugin.installed) {
        return;
    }

    Util(Vue);

    Vue.url = Url;
    Vue.http = Http;
    Vue.resource = Resource;
    Vue.Promise = Promise$1;

    Object.defineProperties(Vue.prototype, {

        $url: {
            get: function () {
                return options(Vue.url, this, this.$options.url);
            }
        },

        $http: {
            get: function () {
                return options(Vue.http, this, this.$options.http);
            }
        },

        $resource: {
            get: function () {
                return Vue.resource.bind(this);
            }
        },

        $promise: {
            get: function () {
                var _this = this;

                return function (executor) {
                    return new Vue.Promise(executor, _this);
                };
            }
        }

    });
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
}

module.exports = plugin;
},{}],3:[function(require,module,exports){
/*!
 * vue-router v0.7.13
 * (c) 2016 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.VueRouter = factory();
}(this, function () { 'use strict';

  var babelHelpers = {};

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  function Target(path, matcher, delegate) {
    this.path = path;
    this.matcher = matcher;
    this.delegate = delegate;
  }

  Target.prototype = {
    to: function to(target, callback) {
      var delegate = this.delegate;

      if (delegate && delegate.willAddRoute) {
        target = delegate.willAddRoute(this.matcher.target, target);
      }

      this.matcher.add(this.path, target);

      if (callback) {
        if (callback.length === 0) {
          throw new Error("You must have an argument in the function passed to `to`");
        }
        this.matcher.addChild(this.path, target, callback, this.delegate);
      }
      return this;
    }
  };

  function Matcher(target) {
    this.routes = {};
    this.children = {};
    this.target = target;
  }

  Matcher.prototype = {
    add: function add(path, handler) {
      this.routes[path] = handler;
    },

    addChild: function addChild(path, target, callback, delegate) {
      var matcher = new Matcher(target);
      this.children[path] = matcher;

      var match = generateMatch(path, matcher, delegate);

      if (delegate && delegate.contextEntered) {
        delegate.contextEntered(target, match);
      }

      callback(match);
    }
  };

  function generateMatch(startingPath, matcher, delegate) {
    return function (path, nestedCallback) {
      var fullPath = startingPath + path;

      if (nestedCallback) {
        nestedCallback(generateMatch(fullPath, matcher, delegate));
      } else {
        return new Target(startingPath + path, matcher, delegate);
      }
    };
  }

  function addRoute(routeArray, path, handler) {
    var len = 0;
    for (var i = 0, l = routeArray.length; i < l; i++) {
      len += routeArray[i].path.length;
    }

    path = path.substr(len);
    var route = { path: path, handler: handler };
    routeArray.push(route);
  }

  function eachRoute(baseRoute, matcher, callback, binding) {
    var routes = matcher.routes;

    for (var path in routes) {
      if (routes.hasOwnProperty(path)) {
        var routeArray = baseRoute.slice();
        addRoute(routeArray, path, routes[path]);

        if (matcher.children[path]) {
          eachRoute(routeArray, matcher.children[path], callback, binding);
        } else {
          callback.call(binding, routeArray);
        }
      }
    }
  }

  function map (callback, addRouteCallback) {
    var matcher = new Matcher();

    callback(generateMatch("", matcher, this.delegate));

    eachRoute([], matcher, function (route) {
      if (addRouteCallback) {
        addRouteCallback(this, route);
      } else {
        this.add(route);
      }
    }, this);
  }

  var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];

  var escapeRegex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');

  var noWarning = false;
  function warn(msg) {
    if (!noWarning && typeof console !== 'undefined') {
      console.error('[vue-router] ' + msg);
    }
  }

  function tryDecode(uri, asComponent) {
    try {
      return asComponent ? decodeURIComponent(uri) : decodeURI(uri);
    } catch (e) {
      warn('malformed URI' + (asComponent ? ' component: ' : ': ') + uri);
    }
  }

  function isArray(test) {
    return Object.prototype.toString.call(test) === "[object Array]";
  }

  // A Segment represents a segment in the original route description.
  // Each Segment type provides an `eachChar` and `regex` method.
  //
  // The `eachChar` method invokes the callback with one or more character
  // specifications. A character specification consumes one or more input
  // characters.
  //
  // The `regex` method returns a regex fragment for the segment. If the
  // segment is a dynamic of star segment, the regex fragment also includes
  // a capture.
  //
  // A character specification contains:
  //
  // * `validChars`: a String with a list of all valid characters, or
  // * `invalidChars`: a String with a list of all invalid characters
  // * `repeat`: true if the character specification can repeat

  function StaticSegment(string) {
    this.string = string;
  }
  StaticSegment.prototype = {
    eachChar: function eachChar(callback) {
      var string = this.string,
          ch;

      for (var i = 0, l = string.length; i < l; i++) {
        ch = string.charAt(i);
        callback({ validChars: ch });
      }
    },

    regex: function regex() {
      return this.string.replace(escapeRegex, '\\$1');
    },

    generate: function generate() {
      return this.string;
    }
  };

  function DynamicSegment(name) {
    this.name = name;
  }
  DynamicSegment.prototype = {
    eachChar: function eachChar(callback) {
      callback({ invalidChars: "/", repeat: true });
    },

    regex: function regex() {
      return "([^/]+)";
    },

    generate: function generate(params) {
      var val = params[this.name];
      return val == null ? ":" + this.name : val;
    }
  };

  function StarSegment(name) {
    this.name = name;
  }
  StarSegment.prototype = {
    eachChar: function eachChar(callback) {
      callback({ invalidChars: "", repeat: true });
    },

    regex: function regex() {
      return "(.+)";
    },

    generate: function generate(params) {
      var val = params[this.name];
      return val == null ? ":" + this.name : val;
    }
  };

  function EpsilonSegment() {}
  EpsilonSegment.prototype = {
    eachChar: function eachChar() {},
    regex: function regex() {
      return "";
    },
    generate: function generate() {
      return "";
    }
  };

  function parse(route, names, specificity) {
    // normalize route as not starting with a "/". Recognition will
    // also normalize.
    if (route.charAt(0) === "/") {
      route = route.substr(1);
    }

    var segments = route.split("/"),
        results = [];

    // A routes has specificity determined by the order that its different segments
    // appear in. This system mirrors how the magnitude of numbers written as strings
    // works.
    // Consider a number written as: "abc". An example would be "200". Any other number written
    // "xyz" will be smaller than "abc" so long as `a > z`. For instance, "199" is smaller
    // then "200", even though "y" and "z" (which are both 9) are larger than "0" (the value
    // of (`b` and `c`). This is because the leading symbol, "2", is larger than the other
    // leading symbol, "1".
    // The rule is that symbols to the left carry more weight than symbols to the right
    // when a number is written out as a string. In the above strings, the leading digit
    // represents how many 100's are in the number, and it carries more weight than the middle
    // number which represents how many 10's are in the number.
    // This system of number magnitude works well for route specificity, too. A route written as
    // `a/b/c` will be more specific than `x/y/z` as long as `a` is more specific than
    // `x`, irrespective of the other parts.
    // Because of this similarity, we assign each type of segment a number value written as a
    // string. We can find the specificity of compound routes by concatenating these strings
    // together, from left to right. After we have looped through all of the segments,
    // we convert the string to a number.
    specificity.val = '';

    for (var i = 0, l = segments.length; i < l; i++) {
      var segment = segments[i],
          match;

      if (match = segment.match(/^:([^\/]+)$/)) {
        results.push(new DynamicSegment(match[1]));
        names.push(match[1]);
        specificity.val += '3';
      } else if (match = segment.match(/^\*([^\/]+)$/)) {
        results.push(new StarSegment(match[1]));
        specificity.val += '2';
        names.push(match[1]);
      } else if (segment === "") {
        results.push(new EpsilonSegment());
        specificity.val += '1';
      } else {
        results.push(new StaticSegment(segment));
        specificity.val += '4';
      }
    }

    specificity.val = +specificity.val;

    return results;
  }

  // A State has a character specification and (`charSpec`) and a list of possible
  // subsequent states (`nextStates`).
  //
  // If a State is an accepting state, it will also have several additional
  // properties:
  //
  // * `regex`: A regular expression that is used to extract parameters from paths
  //   that reached this accepting state.
  // * `handlers`: Information on how to convert the list of captures into calls
  //   to registered handlers with the specified parameters
  // * `types`: How many static, dynamic or star segments in this route. Used to
  //   decide which route to use if multiple registered routes match a path.
  //
  // Currently, State is implemented naively by looping over `nextStates` and
  // comparing a character specification against a character. A more efficient
  // implementation would use a hash of keys pointing at one or more next states.

  function State(charSpec) {
    this.charSpec = charSpec;
    this.nextStates = [];
  }

  State.prototype = {
    get: function get(charSpec) {
      var nextStates = this.nextStates;

      for (var i = 0, l = nextStates.length; i < l; i++) {
        var child = nextStates[i];

        var isEqual = child.charSpec.validChars === charSpec.validChars;
        isEqual = isEqual && child.charSpec.invalidChars === charSpec.invalidChars;

        if (isEqual) {
          return child;
        }
      }
    },

    put: function put(charSpec) {
      var state;

      // If the character specification already exists in a child of the current
      // state, just return that state.
      if (state = this.get(charSpec)) {
        return state;
      }

      // Make a new state for the character spec
      state = new State(charSpec);

      // Insert the new state as a child of the current state
      this.nextStates.push(state);

      // If this character specification repeats, insert the new state as a child
      // of itself. Note that this will not trigger an infinite loop because each
      // transition during recognition consumes a character.
      if (charSpec.repeat) {
        state.nextStates.push(state);
      }

      // Return the new state
      return state;
    },

    // Find a list of child states matching the next character
    match: function match(ch) {
      // DEBUG "Processing `" + ch + "`:"
      var nextStates = this.nextStates,
          child,
          charSpec,
          chars;

      // DEBUG "  " + debugState(this)
      var returned = [];

      for (var i = 0, l = nextStates.length; i < l; i++) {
        child = nextStates[i];

        charSpec = child.charSpec;

        if (typeof (chars = charSpec.validChars) !== 'undefined') {
          if (chars.indexOf(ch) !== -1) {
            returned.push(child);
          }
        } else if (typeof (chars = charSpec.invalidChars) !== 'undefined') {
          if (chars.indexOf(ch) === -1) {
            returned.push(child);
          }
        }
      }

      return returned;
    }

    /** IF DEBUG
    , debug: function() {
      var charSpec = this.charSpec,
          debug = "[",
          chars = charSpec.validChars || charSpec.invalidChars;
       if (charSpec.invalidChars) { debug += "^"; }
      debug += chars;
      debug += "]";
       if (charSpec.repeat) { debug += "+"; }
       return debug;
    }
    END IF **/
  };

  /** IF DEBUG
  function debug(log) {
    console.log(log);
  }

  function debugState(state) {
    return state.nextStates.map(function(n) {
      if (n.nextStates.length === 0) { return "( " + n.debug() + " [accepting] )"; }
      return "( " + n.debug() + " <then> " + n.nextStates.map(function(s) { return s.debug() }).join(" or ") + " )";
    }).join(", ")
  }
  END IF **/

  // Sort the routes by specificity
  function sortSolutions(states) {
    return states.sort(function (a, b) {
      return b.specificity.val - a.specificity.val;
    });
  }

  function recognizeChar(states, ch) {
    var nextStates = [];

    for (var i = 0, l = states.length; i < l; i++) {
      var state = states[i];

      nextStates = nextStates.concat(state.match(ch));
    }

    return nextStates;
  }

  var oCreate = Object.create || function (proto) {
    function F() {}
    F.prototype = proto;
    return new F();
  };

  function RecognizeResults(queryParams) {
    this.queryParams = queryParams || {};
  }
  RecognizeResults.prototype = oCreate({
    splice: Array.prototype.splice,
    slice: Array.prototype.slice,
    push: Array.prototype.push,
    length: 0,
    queryParams: null
  });

  function findHandler(state, path, queryParams) {
    var handlers = state.handlers,
        regex = state.regex;
    var captures = path.match(regex),
        currentCapture = 1;
    var result = new RecognizeResults(queryParams);

    for (var i = 0, l = handlers.length; i < l; i++) {
      var handler = handlers[i],
          names = handler.names,
          params = {};

      for (var j = 0, m = names.length; j < m; j++) {
        params[names[j]] = captures[currentCapture++];
      }

      result.push({ handler: handler.handler, params: params, isDynamic: !!names.length });
    }

    return result;
  }

  function addSegment(currentState, segment) {
    segment.eachChar(function (ch) {
      var state;

      currentState = currentState.put(ch);
    });

    return currentState;
  }

  function decodeQueryParamPart(part) {
    // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
    part = part.replace(/\+/gm, '%20');
    return tryDecode(part, true);
  }

  // The main interface

  var RouteRecognizer = function RouteRecognizer() {
    this.rootState = new State();
    this.names = {};
  };

  RouteRecognizer.prototype = {
    add: function add(routes, options) {
      var currentState = this.rootState,
          regex = "^",
          specificity = {},
          handlers = [],
          allSegments = [],
          name;

      var isEmpty = true;

      for (var i = 0, l = routes.length; i < l; i++) {
        var route = routes[i],
            names = [];

        var segments = parse(route.path, names, specificity);

        allSegments = allSegments.concat(segments);

        for (var j = 0, m = segments.length; j < m; j++) {
          var segment = segments[j];

          if (segment instanceof EpsilonSegment) {
            continue;
          }

          isEmpty = false;

          // Add a "/" for the new segment
          currentState = currentState.put({ validChars: "/" });
          regex += "/";

          // Add a representation of the segment to the NFA and regex
          currentState = addSegment(currentState, segment);
          regex += segment.regex();
        }

        var handler = { handler: route.handler, names: names };
        handlers.push(handler);
      }

      if (isEmpty) {
        currentState = currentState.put({ validChars: "/" });
        regex += "/";
      }

      currentState.handlers = handlers;
      currentState.regex = new RegExp(regex + "$");
      currentState.specificity = specificity;

      if (name = options && options.as) {
        this.names[name] = {
          segments: allSegments,
          handlers: handlers
        };
      }
    },

    handlersFor: function handlersFor(name) {
      var route = this.names[name],
          result = [];
      if (!route) {
        throw new Error("There is no route named " + name);
      }

      for (var i = 0, l = route.handlers.length; i < l; i++) {
        result.push(route.handlers[i]);
      }

      return result;
    },

    hasRoute: function hasRoute(name) {
      return !!this.names[name];
    },

    generate: function generate(name, params) {
      var route = this.names[name],
          output = "";
      if (!route) {
        throw new Error("There is no route named " + name);
      }

      var segments = route.segments;

      for (var i = 0, l = segments.length; i < l; i++) {
        var segment = segments[i];

        if (segment instanceof EpsilonSegment) {
          continue;
        }

        output += "/";
        output += segment.generate(params);
      }

      if (output.charAt(0) !== '/') {
        output = '/' + output;
      }

      if (params && params.queryParams) {
        output += this.generateQueryString(params.queryParams);
      }

      return output;
    },

    generateQueryString: function generateQueryString(params) {
      var pairs = [];
      var keys = [];
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      keys.sort();
      for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        var value = params[key];
        if (value == null) {
          continue;
        }
        var pair = encodeURIComponent(key);
        if (isArray(value)) {
          for (var j = 0, l = value.length; j < l; j++) {
            var arrayPair = key + '[]' + '=' + encodeURIComponent(value[j]);
            pairs.push(arrayPair);
          }
        } else {
          pair += "=" + encodeURIComponent(value);
          pairs.push(pair);
        }
      }

      if (pairs.length === 0) {
        return '';
      }

      return "?" + pairs.join("&");
    },

    parseQueryString: function parseQueryString(queryString) {
      var pairs = queryString.split("&"),
          queryParams = {};
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('='),
            key = decodeQueryParamPart(pair[0]),
            keyLength = key.length,
            isArray = false,
            value;
        if (pair.length === 1) {
          value = 'true';
        } else {
          //Handle arrays
          if (keyLength > 2 && key.slice(keyLength - 2) === '[]') {
            isArray = true;
            key = key.slice(0, keyLength - 2);
            if (!queryParams[key]) {
              queryParams[key] = [];
            }
          }
          value = pair[1] ? decodeQueryParamPart(pair[1]) : '';
        }
        if (isArray) {
          queryParams[key].push(value);
        } else {
          queryParams[key] = value;
        }
      }
      return queryParams;
    },

    recognize: function recognize(path, silent) {
      noWarning = silent;
      var states = [this.rootState],
          pathLen,
          i,
          l,
          queryStart,
          queryParams = {},
          isSlashDropped = false;

      queryStart = path.indexOf('?');
      if (queryStart !== -1) {
        var queryString = path.substr(queryStart + 1, path.length);
        path = path.substr(0, queryStart);
        if (queryString) {
          queryParams = this.parseQueryString(queryString);
        }
      }

      path = tryDecode(path);
      if (!path) return;

      // DEBUG GROUP path

      if (path.charAt(0) !== "/") {
        path = "/" + path;
      }

      pathLen = path.length;
      if (pathLen > 1 && path.charAt(pathLen - 1) === "/") {
        path = path.substr(0, pathLen - 1);
        isSlashDropped = true;
      }

      for (i = 0, l = path.length; i < l; i++) {
        states = recognizeChar(states, path.charAt(i));
        if (!states.length) {
          break;
        }
      }

      // END DEBUG GROUP

      var solutions = [];
      for (i = 0, l = states.length; i < l; i++) {
        if (states[i].handlers) {
          solutions.push(states[i]);
        }
      }

      states = sortSolutions(solutions);

      var state = solutions[0];

      if (state && state.handlers) {
        // if a trailing slash was dropped and a star segment is the last segment
        // specified, put the trailing slash back
        if (isSlashDropped && state.regex.source.slice(-5) === "(.+)$") {
          path = path + "/";
        }
        return findHandler(state, path, queryParams);
      }
    }
  };

  RouteRecognizer.prototype.map = map;

  var genQuery = RouteRecognizer.prototype.generateQueryString;

  // export default for holding the Vue reference
  var exports$1 = {};
  /**
   * Warn stuff.
   *
   * @param {String} msg
   */

  function warn$1(msg) {
    /* istanbul ignore next */
    if (typeof console !== 'undefined') {
      console.error('[vue-router] ' + msg);
    }
  }

  /**
   * Resolve a relative path.
   *
   * @param {String} base
   * @param {String} relative
   * @param {Boolean} append
   * @return {String}
   */

  function resolvePath(base, relative, append) {
    var query = base.match(/(\?.*)$/);
    if (query) {
      query = query[1];
      base = base.slice(0, -query.length);
    }
    // a query!
    if (relative.charAt(0) === '?') {
      return base + relative;
    }
    var stack = base.split('/');
    // remove trailing segment if:
    // - not appending
    // - appending to trailing slash (last segment is empty)
    if (!append || !stack[stack.length - 1]) {
      stack.pop();
    }
    // resolve relative path
    var segments = relative.replace(/^\//, '').split('/');
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
      if (segment === '.') {
        continue;
      } else if (segment === '..') {
        stack.pop();
      } else {
        stack.push(segment);
      }
    }
    // ensure leading slash
    if (stack[0] !== '') {
      stack.unshift('');
    }
    return stack.join('/');
  }

  /**
   * Forgiving check for a promise
   *
   * @param {Object} p
   * @return {Boolean}
   */

  function isPromise(p) {
    return p && typeof p.then === 'function';
  }

  /**
   * Retrive a route config field from a component instance
   * OR a component contructor.
   *
   * @param {Function|Vue} component
   * @param {String} name
   * @return {*}
   */

  function getRouteConfig(component, name) {
    var options = component && (component.$options || component.options);
    return options && options.route && options.route[name];
  }

  /**
   * Resolve an async component factory. Have to do a dirty
   * mock here because of Vue core's internal API depends on
   * an ID check.
   *
   * @param {Object} handler
   * @param {Function} cb
   */

  var resolver = undefined;

  function resolveAsyncComponent(handler, cb) {
    if (!resolver) {
      resolver = {
        resolve: exports$1.Vue.prototype._resolveComponent,
        $options: {
          components: {
            _: handler.component
          }
        }
      };
    } else {
      resolver.$options.components._ = handler.component;
    }
    resolver.resolve('_', function (Component) {
      handler.component = Component;
      cb(Component);
    });
  }

  /**
   * Map the dynamic segments in a path to params.
   *
   * @param {String} path
   * @param {Object} params
   * @param {Object} query
   */

  function mapParams(path, params, query) {
    if (params === undefined) params = {};

    path = path.replace(/:([^\/]+)/g, function (_, key) {
      var val = params[key];
      /* istanbul ignore if */
      if (!val) {
        warn$1('param "' + key + '" not found when generating ' + 'path for "' + path + '" with params ' + JSON.stringify(params));
      }
      return val || '';
    });
    if (query) {
      path += genQuery(query);
    }
    return path;
  }

  var hashRE = /#.*$/;

  var HTML5History = (function () {
    function HTML5History(_ref) {
      var root = _ref.root;
      var onChange = _ref.onChange;
      babelHelpers.classCallCheck(this, HTML5History);

      if (root && root !== '/') {
        // make sure there's the starting slash
        if (root.charAt(0) !== '/') {
          root = '/' + root;
        }
        // remove trailing slash
        this.root = root.replace(/\/$/, '');
        this.rootRE = new RegExp('^\\' + this.root);
      } else {
        this.root = null;
      }
      this.onChange = onChange;
      // check base tag
      var baseEl = document.querySelector('base');
      this.base = baseEl && baseEl.getAttribute('href');
    }

    HTML5History.prototype.start = function start() {
      var _this = this;

      this.listener = function (e) {
        var url = location.pathname + location.search;
        if (_this.root) {
          url = url.replace(_this.rootRE, '');
        }
        _this.onChange(url, e && e.state, location.hash);
      };
      window.addEventListener('popstate', this.listener);
      this.listener();
    };

    HTML5History.prototype.stop = function stop() {
      window.removeEventListener('popstate', this.listener);
    };

    HTML5History.prototype.go = function go(path, replace, append) {
      var url = this.formatPath(path, append);
      if (replace) {
        history.replaceState({}, '', url);
      } else {
        // record scroll position by replacing current state
        history.replaceState({
          pos: {
            x: window.pageXOffset,
            y: window.pageYOffset
          }
        }, '', location.href);
        // then push new state
        history.pushState({}, '', url);
      }
      var hashMatch = path.match(hashRE);
      var hash = hashMatch && hashMatch[0];
      path = url
      // strip hash so it doesn't mess up params
      .replace(hashRE, '')
      // remove root before matching
      .replace(this.rootRE, '');
      this.onChange(path, null, hash);
    };

    HTML5History.prototype.formatPath = function formatPath(path, append) {
      return path.charAt(0) === '/'
      // absolute path
      ? this.root ? this.root + '/' + path.replace(/^\//, '') : path : resolvePath(this.base || location.pathname, path, append);
    };

    return HTML5History;
  })();

  var HashHistory = (function () {
    function HashHistory(_ref) {
      var hashbang = _ref.hashbang;
      var onChange = _ref.onChange;
      babelHelpers.classCallCheck(this, HashHistory);

      this.hashbang = hashbang;
      this.onChange = onChange;
    }

    HashHistory.prototype.start = function start() {
      var self = this;
      this.listener = function () {
        var path = location.hash;
        var raw = path.replace(/^#!?/, '');
        // always
        if (raw.charAt(0) !== '/') {
          raw = '/' + raw;
        }
        var formattedPath = self.formatPath(raw);
        if (formattedPath !== path) {
          location.replace(formattedPath);
          return;
        }
        // determine query
        // note it's possible to have queries in both the actual URL
        // and the hash fragment itself.
        var query = location.search && path.indexOf('?') > -1 ? '&' + location.search.slice(1) : location.search;
        self.onChange(path.replace(/^#!?/, '') + query);
      };
      window.addEventListener('hashchange', this.listener);
      this.listener();
    };

    HashHistory.prototype.stop = function stop() {
      window.removeEventListener('hashchange', this.listener);
    };

    HashHistory.prototype.go = function go(path, replace, append) {
      path = this.formatPath(path, append);
      if (replace) {
        location.replace(path);
      } else {
        location.hash = path;
      }
    };

    HashHistory.prototype.formatPath = function formatPath(path, append) {
      var isAbsoloute = path.charAt(0) === '/';
      var prefix = '#' + (this.hashbang ? '!' : '');
      return isAbsoloute ? prefix + path : prefix + resolvePath(location.hash.replace(/^#!?/, ''), path, append);
    };

    return HashHistory;
  })();

  var AbstractHistory = (function () {
    function AbstractHistory(_ref) {
      var onChange = _ref.onChange;
      babelHelpers.classCallCheck(this, AbstractHistory);

      this.onChange = onChange;
      this.currentPath = '/';
    }

    AbstractHistory.prototype.start = function start() {
      this.onChange('/');
    };

    AbstractHistory.prototype.stop = function stop() {
      // noop
    };

    AbstractHistory.prototype.go = function go(path, replace, append) {
      path = this.currentPath = this.formatPath(path, append);
      this.onChange(path);
    };

    AbstractHistory.prototype.formatPath = function formatPath(path, append) {
      return path.charAt(0) === '/' ? path : resolvePath(this.currentPath, path, append);
    };

    return AbstractHistory;
  })();

  /**
   * Determine the reusability of an existing router view.
   *
   * @param {Directive} view
   * @param {Object} handler
   * @param {Transition} transition
   */

  function canReuse(view, handler, transition) {
    var component = view.childVM;
    if (!component || !handler) {
      return false;
    }
    // important: check view.Component here because it may
    // have been changed in activate hook
    if (view.Component !== handler.component) {
      return false;
    }
    var canReuseFn = getRouteConfig(component, 'canReuse');
    return typeof canReuseFn === 'boolean' ? canReuseFn : canReuseFn ? canReuseFn.call(component, {
      to: transition.to,
      from: transition.from
    }) : true; // defaults to true
  }

  /**
   * Check if a component can deactivate.
   *
   * @param {Directive} view
   * @param {Transition} transition
   * @param {Function} next
   */

  function canDeactivate(view, transition, next) {
    var fromComponent = view.childVM;
    var hook = getRouteConfig(fromComponent, 'canDeactivate');
    if (!hook) {
      next();
    } else {
      transition.callHook(hook, fromComponent, next, {
        expectBoolean: true
      });
    }
  }

  /**
   * Check if a component can activate.
   *
   * @param {Object} handler
   * @param {Transition} transition
   * @param {Function} next
   */

  function canActivate(handler, transition, next) {
    resolveAsyncComponent(handler, function (Component) {
      // have to check due to async-ness
      if (transition.aborted) {
        return;
      }
      // determine if this component can be activated
      var hook = getRouteConfig(Component, 'canActivate');
      if (!hook) {
        next();
      } else {
        transition.callHook(hook, null, next, {
          expectBoolean: true
        });
      }
    });
  }

  /**
   * Call deactivate hooks for existing router-views.
   *
   * @param {Directive} view
   * @param {Transition} transition
   * @param {Function} next
   */

  function deactivate(view, transition, next) {
    var component = view.childVM;
    var hook = getRouteConfig(component, 'deactivate');
    if (!hook) {
      next();
    } else {
      transition.callHooks(hook, component, next);
    }
  }

  /**
   * Activate / switch component for a router-view.
   *
   * @param {Directive} view
   * @param {Transition} transition
   * @param {Number} depth
   * @param {Function} [cb]
   */

  function activate(view, transition, depth, cb, reuse) {
    var handler = transition.activateQueue[depth];
    if (!handler) {
      saveChildView(view);
      if (view._bound) {
        view.setComponent(null);
      }
      cb && cb();
      return;
    }

    var Component = view.Component = handler.component;
    var activateHook = getRouteConfig(Component, 'activate');
    var dataHook = getRouteConfig(Component, 'data');
    var waitForData = getRouteConfig(Component, 'waitForData');

    view.depth = depth;
    view.activated = false;

    var component = undefined;
    var loading = !!(dataHook && !waitForData);

    // "reuse" is a flag passed down when the parent view is
    // either reused via keep-alive or as a child of a kept-alive view.
    // of course we can only reuse if the current kept-alive instance
    // is of the correct type.
    reuse = reuse && view.childVM && view.childVM.constructor === Component;

    if (reuse) {
      // just reuse
      component = view.childVM;
      component.$loadingRouteData = loading;
    } else {
      saveChildView(view);

      // unbuild current component. this step also destroys
      // and removes all nested child views.
      view.unbuild(true);

      // build the new component. this will also create the
      // direct child view of the current one. it will register
      // itself as view.childView.
      component = view.build({
        _meta: {
          $loadingRouteData: loading
        },
        created: function created() {
          this._routerView = view;
        }
      });

      // handle keep-alive.
      // when a kept-alive child vm is restored, we need to
      // add its cached child views into the router's view list,
      // and also properly update current view's child view.
      if (view.keepAlive) {
        component.$loadingRouteData = loading;
        var cachedChildView = component._keepAliveRouterView;
        if (cachedChildView) {
          view.childView = cachedChildView;
          component._keepAliveRouterView = null;
        }
      }
    }

    // cleanup the component in case the transition is aborted
    // before the component is ever inserted.
    var cleanup = function cleanup() {
      component.$destroy();
    };

    // actually insert the component and trigger transition
    var insert = function insert() {
      if (reuse) {
        cb && cb();
        return;
      }
      var router = transition.router;
      if (router._rendered || router._transitionOnLoad) {
        view.transition(component);
      } else {
        // no transition on first render, manual transition
        /* istanbul ignore if */
        if (view.setCurrent) {
          // 0.12 compat
          view.setCurrent(component);
        } else {
          // 1.0
          view.childVM = component;
        }
        component.$before(view.anchor, null, false);
      }
      cb && cb();
    };

    var afterData = function afterData() {
      // activate the child view
      if (view.childView) {
        activate(view.childView, transition, depth + 1, null, reuse || view.keepAlive);
      }
      insert();
    };

    // called after activation hook is resolved
    var afterActivate = function afterActivate() {
      view.activated = true;
      if (dataHook && waitForData) {
        // wait until data loaded to insert
        loadData(component, transition, dataHook, afterData, cleanup);
      } else {
        // load data and insert at the same time
        if (dataHook) {
          loadData(component, transition, dataHook);
        }
        afterData();
      }
    };

    if (activateHook) {
      transition.callHooks(activateHook, component, afterActivate, {
        cleanup: cleanup,
        postActivate: true
      });
    } else {
      afterActivate();
    }
  }

  /**
   * Reuse a view, just reload data if necessary.
   *
   * @param {Directive} view
   * @param {Transition} transition
   */

  function reuse(view, transition) {
    var component = view.childVM;
    var dataHook = getRouteConfig(component, 'data');
    if (dataHook) {
      loadData(component, transition, dataHook);
    }
  }

  /**
   * Asynchronously load and apply data to component.
   *
   * @param {Vue} component
   * @param {Transition} transition
   * @param {Function} hook
   * @param {Function} cb
   * @param {Function} cleanup
   */

  function loadData(component, transition, hook, cb, cleanup) {
    component.$loadingRouteData = true;
    transition.callHooks(hook, component, function () {
      component.$loadingRouteData = false;
      component.$emit('route-data-loaded', component);
      cb && cb();
    }, {
      cleanup: cleanup,
      postActivate: true,
      processData: function processData(data) {
        // handle promise sugar syntax
        var promises = [];
        if (isPlainObject(data)) {
          Object.keys(data).forEach(function (key) {
            var val = data[key];
            if (isPromise(val)) {
              promises.push(val.then(function (resolvedVal) {
                component.$set(key, resolvedVal);
              }));
            } else {
              component.$set(key, val);
            }
          });
        }
        if (promises.length) {
          return promises[0].constructor.all(promises);
        }
      }
    });
  }

  /**
   * Save the child view for a kept-alive view so that
   * we can restore it when it is switched back to.
   *
   * @param {Directive} view
   */

  function saveChildView(view) {
    if (view.keepAlive && view.childVM && view.childView) {
      view.childVM._keepAliveRouterView = view.childView;
    }
    view.childView = null;
  }

  /**
   * Check plain object.
   *
   * @param {*} val
   */

  function isPlainObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
  }

  /**
   * A RouteTransition object manages the pipeline of a
   * router-view switching process. This is also the object
   * passed into user route hooks.
   *
   * @param {Router} router
   * @param {Route} to
   * @param {Route} from
   */

  var RouteTransition = (function () {
    function RouteTransition(router, to, from) {
      babelHelpers.classCallCheck(this, RouteTransition);

      this.router = router;
      this.to = to;
      this.from = from;
      this.next = null;
      this.aborted = false;
      this.done = false;
    }

    /**
     * Abort current transition and return to previous location.
     */

    RouteTransition.prototype.abort = function abort() {
      if (!this.aborted) {
        this.aborted = true;
        // if the root path throws an error during validation
        // on initial load, it gets caught in an infinite loop.
        var abortingOnLoad = !this.from.path && this.to.path === '/';
        if (!abortingOnLoad) {
          this.router.replace(this.from.path || '/');
        }
      }
    };

    /**
     * Abort current transition and redirect to a new location.
     *
     * @param {String} path
     */

    RouteTransition.prototype.redirect = function redirect(path) {
      if (!this.aborted) {
        this.aborted = true;
        if (typeof path === 'string') {
          path = mapParams(path, this.to.params, this.to.query);
        } else {
          path.params = path.params || this.to.params;
          path.query = path.query || this.to.query;
        }
        this.router.replace(path);
      }
    };

    /**
     * A router view transition's pipeline can be described as
     * follows, assuming we are transitioning from an existing
     * <router-view> chain [Component A, Component B] to a new
     * chain [Component A, Component C]:
     *
     *  A    A
     *  | => |
     *  B    C
     *
     * 1. Reusablity phase:
     *   -> canReuse(A, A)
     *   -> canReuse(B, C)
     *   -> determine new queues:
     *      - deactivation: [B]
     *      - activation: [C]
     *
     * 2. Validation phase:
     *   -> canDeactivate(B)
     *   -> canActivate(C)
     *
     * 3. Activation phase:
     *   -> deactivate(B)
     *   -> activate(C)
     *
     * Each of these steps can be asynchronous, and any
     * step can potentially abort the transition.
     *
     * @param {Function} cb
     */

    RouteTransition.prototype.start = function start(cb) {
      var transition = this;

      // determine the queue of views to deactivate
      var deactivateQueue = [];
      var view = this.router._rootView;
      while (view) {
        deactivateQueue.unshift(view);
        view = view.childView;
      }
      var reverseDeactivateQueue = deactivateQueue.slice().reverse();

      // determine the queue of route handlers to activate
      var activateQueue = this.activateQueue = toArray(this.to.matched).map(function (match) {
        return match.handler;
      });

      // 1. Reusability phase
      var i = undefined,
          reuseQueue = undefined;
      for (i = 0; i < reverseDeactivateQueue.length; i++) {
        if (!canReuse(reverseDeactivateQueue[i], activateQueue[i], transition)) {
          break;
        }
      }
      if (i > 0) {
        reuseQueue = reverseDeactivateQueue.slice(0, i);
        deactivateQueue = reverseDeactivateQueue.slice(i).reverse();
        activateQueue = activateQueue.slice(i);
      }

      // 2. Validation phase
      transition.runQueue(deactivateQueue, canDeactivate, function () {
        transition.runQueue(activateQueue, canActivate, function () {
          transition.runQueue(deactivateQueue, deactivate, function () {
            // 3. Activation phase

            // Update router current route
            transition.router._onTransitionValidated(transition);

            // trigger reuse for all reused views
            reuseQueue && reuseQueue.forEach(function (view) {
              return reuse(view, transition);
            });

            // the root of the chain that needs to be replaced
            // is the top-most non-reusable view.
            if (deactivateQueue.length) {
              var _view = deactivateQueue[deactivateQueue.length - 1];
              var depth = reuseQueue ? reuseQueue.length : 0;
              activate(_view, transition, depth, cb);
            } else {
              cb();
            }
          });
        });
      });
    };

    /**
     * Asynchronously and sequentially apply a function to a
     * queue.
     *
     * @param {Array} queue
     * @param {Function} fn
     * @param {Function} cb
     */

    RouteTransition.prototype.runQueue = function runQueue(queue, fn, cb) {
      var transition = this;
      step(0);
      function step(index) {
        if (index >= queue.length) {
          cb();
        } else {
          fn(queue[index], transition, function () {
            step(index + 1);
          });
        }
      }
    };

    /**
     * Call a user provided route transition hook and handle
     * the response (e.g. if the user returns a promise).
     *
     * If the user neither expects an argument nor returns a
     * promise, the hook is assumed to be synchronous.
     *
     * @param {Function} hook
     * @param {*} [context]
     * @param {Function} [cb]
     * @param {Object} [options]
     *                 - {Boolean} expectBoolean
     *                 - {Boolean} postActive
     *                 - {Function} processData
     *                 - {Function} cleanup
     */

    RouteTransition.prototype.callHook = function callHook(hook, context, cb) {
      var _ref = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var _ref$expectBoolean = _ref.expectBoolean;
      var expectBoolean = _ref$expectBoolean === undefined ? false : _ref$expectBoolean;
      var _ref$postActivate = _ref.postActivate;
      var postActivate = _ref$postActivate === undefined ? false : _ref$postActivate;
      var processData = _ref.processData;
      var cleanup = _ref.cleanup;

      var transition = this;
      var nextCalled = false;

      // abort the transition
      var abort = function abort() {
        cleanup && cleanup();
        transition.abort();
      };

      // handle errors
      var onError = function onError(err) {
        postActivate ? next() : abort();
        if (err && !transition.router._suppress) {
          warn$1('Uncaught error during transition: ');
          throw err instanceof Error ? err : new Error(err);
        }
      };

      // since promise swallows errors, we have to
      // throw it in the next tick...
      var onPromiseError = function onPromiseError(err) {
        try {
          onError(err);
        } catch (e) {
          setTimeout(function () {
            throw e;
          }, 0);
        }
      };

      // advance the transition to the next step
      var next = function next() {
        if (nextCalled) {
          warn$1('transition.next() should be called only once.');
          return;
        }
        nextCalled = true;
        if (transition.aborted) {
          cleanup && cleanup();
          return;
        }
        cb && cb();
      };

      var nextWithBoolean = function nextWithBoolean(res) {
        if (typeof res === 'boolean') {
          res ? next() : abort();
        } else if (isPromise(res)) {
          res.then(function (ok) {
            ok ? next() : abort();
          }, onPromiseError);
        } else if (!hook.length) {
          next();
        }
      };

      var nextWithData = function nextWithData(data) {
        var res = undefined;
        try {
          res = processData(data);
        } catch (err) {
          return onError(err);
        }
        if (isPromise(res)) {
          res.then(next, onPromiseError);
        } else {
          next();
        }
      };

      // expose a clone of the transition object, so that each
      // hook gets a clean copy and prevent the user from
      // messing with the internals.
      var exposed = {
        to: transition.to,
        from: transition.from,
        abort: abort,
        next: processData ? nextWithData : next,
        redirect: function redirect() {
          transition.redirect.apply(transition, arguments);
        }
      };

      // actually call the hook
      var res = undefined;
      try {
        res = hook.call(context, exposed);
      } catch (err) {
        return onError(err);
      }

      if (expectBoolean) {
        // boolean hooks
        nextWithBoolean(res);
      } else if (isPromise(res)) {
        // promise
        if (processData) {
          res.then(nextWithData, onPromiseError);
        } else {
          res.then(next, onPromiseError);
        }
      } else if (processData && isPlainOjbect(res)) {
        // data promise sugar
        nextWithData(res);
      } else if (!hook.length) {
        next();
      }
    };

    /**
     * Call a single hook or an array of async hooks in series.
     *
     * @param {Array} hooks
     * @param {*} context
     * @param {Function} cb
     * @param {Object} [options]
     */

    RouteTransition.prototype.callHooks = function callHooks(hooks, context, cb, options) {
      var _this = this;

      if (Array.isArray(hooks)) {
        this.runQueue(hooks, function (hook, _, next) {
          if (!_this.aborted) {
            _this.callHook(hook, context, next, options);
          }
        }, cb);
      } else {
        this.callHook(hooks, context, cb, options);
      }
    };

    return RouteTransition;
  })();

  function isPlainOjbect(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
  }

  function toArray(val) {
    return val ? Array.prototype.slice.call(val) : [];
  }

  var internalKeysRE = /^(component|subRoutes|fullPath)$/;

  /**
   * Route Context Object
   *
   * @param {String} path
   * @param {Router} router
   */

  var Route = function Route(path, router) {
    var _this = this;

    babelHelpers.classCallCheck(this, Route);

    var matched = router._recognizer.recognize(path);
    if (matched) {
      // copy all custom fields from route configs
      [].forEach.call(matched, function (match) {
        for (var key in match.handler) {
          if (!internalKeysRE.test(key)) {
            _this[key] = match.handler[key];
          }
        }
      });
      // set query and params
      this.query = matched.queryParams;
      this.params = [].reduce.call(matched, function (prev, cur) {
        if (cur.params) {
          for (var key in cur.params) {
            prev[key] = cur.params[key];
          }
        }
        return prev;
      }, {});
    }
    // expose path and router
    this.path = path;
    // for internal use
    this.matched = matched || router._notFoundHandler;
    // internal reference to router
    Object.defineProperty(this, 'router', {
      enumerable: false,
      value: router
    });
    // Important: freeze self to prevent observation
    Object.freeze(this);
  };

  function applyOverride (Vue) {
    var _Vue$util = Vue.util;
    var extend = _Vue$util.extend;
    var isArray = _Vue$util.isArray;
    var defineReactive = _Vue$util.defineReactive;

    // override Vue's init and destroy process to keep track of router instances
    var init = Vue.prototype._init;
    Vue.prototype._init = function (options) {
      options = options || {};
      var root = options._parent || options.parent || this;
      var router = root.$router;
      var route = root.$route;
      if (router) {
        // expose router
        this.$router = router;
        router._children.push(this);
        /* istanbul ignore if */
        if (this._defineMeta) {
          // 0.12
          this._defineMeta('$route', route);
        } else {
          // 1.0
          defineReactive(this, '$route', route);
        }
      }
      init.call(this, options);
    };

    var destroy = Vue.prototype._destroy;
    Vue.prototype._destroy = function () {
      if (!this._isBeingDestroyed && this.$router) {
        this.$router._children.$remove(this);
      }
      destroy.apply(this, arguments);
    };

    // 1.0 only: enable route mixins
    var strats = Vue.config.optionMergeStrategies;
    var hooksToMergeRE = /^(data|activate|deactivate)$/;

    if (strats) {
      strats.route = function (parentVal, childVal) {
        if (!childVal) return parentVal;
        if (!parentVal) return childVal;
        var ret = {};
        extend(ret, parentVal);
        for (var key in childVal) {
          var a = ret[key];
          var b = childVal[key];
          // for data, activate and deactivate, we need to merge them into
          // arrays similar to lifecycle hooks.
          if (a && hooksToMergeRE.test(key)) {
            ret[key] = (isArray(a) ? a : [a]).concat(b);
          } else {
            ret[key] = b;
          }
        }
        return ret;
      };
    }
  }

  function View (Vue) {

    var _ = Vue.util;
    var componentDef =
    // 0.12
    Vue.directive('_component') ||
    // 1.0
    Vue.internalDirectives.component;
    // <router-view> extends the internal component directive
    var viewDef = _.extend({}, componentDef);

    // with some overrides
    _.extend(viewDef, {

      _isRouterView: true,

      bind: function bind() {
        var route = this.vm.$route;
        /* istanbul ignore if */
        if (!route) {
          warn$1('<router-view> can only be used inside a ' + 'router-enabled app.');
          return;
        }
        // force dynamic directive so v-component doesn't
        // attempt to build right now
        this._isDynamicLiteral = true;
        // finally, init by delegating to v-component
        componentDef.bind.call(this);

        // locate the parent view
        var parentView = undefined;
        var parent = this.vm;
        while (parent) {
          if (parent._routerView) {
            parentView = parent._routerView;
            break;
          }
          parent = parent.$parent;
        }
        if (parentView) {
          // register self as a child of the parent view,
          // instead of activating now. This is so that the
          // child's activate hook is called after the
          // parent's has resolved.
          this.parentView = parentView;
          parentView.childView = this;
        } else {
          // this is the root view!
          var router = route.router;
          router._rootView = this;
        }

        // handle late-rendered view
        // two possibilities:
        // 1. root view rendered after transition has been
        //    validated;
        // 2. child view rendered after parent view has been
        //    activated.
        var transition = route.router._currentTransition;
        if (!parentView && transition.done || parentView && parentView.activated) {
          var depth = parentView ? parentView.depth + 1 : 0;
          activate(this, transition, depth);
        }
      },

      unbind: function unbind() {
        if (this.parentView) {
          this.parentView.childView = null;
        }
        componentDef.unbind.call(this);
      }
    });

    Vue.elementDirective('router-view', viewDef);
  }

  var trailingSlashRE = /\/$/;
  var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
  var queryStringRE = /\?.*$/;

  // install v-link, which provides navigation support for
  // HTML5 history mode
  function Link (Vue) {
    var _Vue$util = Vue.util;
    var _bind = _Vue$util.bind;
    var isObject = _Vue$util.isObject;
    var addClass = _Vue$util.addClass;
    var removeClass = _Vue$util.removeClass;

    var onPriority = Vue.directive('on').priority;
    var LINK_UPDATE = '__vue-router-link-update__';

    var activeId = 0;

    Vue.directive('link-active', {
      priority: 9999,
      bind: function bind() {
        var _this = this;

        var id = String(activeId++);
        // collect v-links contained within this element.
        // we need do this here before the parent-child relationship
        // gets messed up by terminal directives (if, for, components)
        var childLinks = this.el.querySelectorAll('[v-link]');
        for (var i = 0, l = childLinks.length; i < l; i++) {
          var link = childLinks[i];
          var existingId = link.getAttribute(LINK_UPDATE);
          var value = existingId ? existingId + ',' + id : id;
          // leave a mark on the link element which can be persisted
          // through fragment clones.
          link.setAttribute(LINK_UPDATE, value);
        }
        this.vm.$on(LINK_UPDATE, this.cb = function (link, path) {
          if (link.activeIds.indexOf(id) > -1) {
            link.updateClasses(path, _this.el);
          }
        });
      },
      unbind: function unbind() {
        this.vm.$off(LINK_UPDATE, this.cb);
      }
    });

    Vue.directive('link', {
      priority: onPriority - 2,

      bind: function bind() {
        var vm = this.vm;
        /* istanbul ignore if */
        if (!vm.$route) {
          warn$1('v-link can only be used inside a router-enabled app.');
          return;
        }
        this.router = vm.$route.router;
        // update things when the route changes
        this.unwatch = vm.$watch('$route', _bind(this.onRouteUpdate, this));
        // check v-link-active ids
        var activeIds = this.el.getAttribute(LINK_UPDATE);
        if (activeIds) {
          this.el.removeAttribute(LINK_UPDATE);
          this.activeIds = activeIds.split(',');
        }
        // no need to handle click if link expects to be opened
        // in a new window/tab.
        /* istanbul ignore if */
        if (this.el.tagName === 'A' && this.el.getAttribute('target') === '_blank') {
          return;
        }
        // handle click
        this.handler = _bind(this.onClick, this);
        this.el.addEventListener('click', this.handler);
      },

      update: function update(target) {
        this.target = target;
        if (isObject(target)) {
          this.append = target.append;
          this.exact = target.exact;
          this.prevActiveClass = this.activeClass;
          this.activeClass = target.activeClass;
        }
        this.onRouteUpdate(this.vm.$route);
      },

      onClick: function onClick(e) {
        // don't redirect with control keys
        /* istanbul ignore if */
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        // don't redirect when preventDefault called
        /* istanbul ignore if */
        if (e.defaultPrevented) return;
        // don't redirect on right click
        /* istanbul ignore if */
        if (e.button !== 0) return;

        var target = this.target;
        if (target) {
          // v-link with expression, just go
          e.preventDefault();
          this.router.go(target);
        } else {
          // no expression, delegate for an <a> inside
          var el = e.target;
          while (el.tagName !== 'A' && el !== this.el) {
            el = el.parentNode;
          }
          if (el.tagName === 'A' && sameOrigin(el)) {
            e.preventDefault();
            var path = el.pathname;
            if (this.router.history.root) {
              path = path.replace(this.router.history.rootRE, '');
            }
            this.router.go({
              path: path,
              replace: target && target.replace,
              append: target && target.append
            });
          }
        }
      },

      onRouteUpdate: function onRouteUpdate(route) {
        // router.stringifyPath is dependent on current route
        // and needs to be called again whenver route changes.
        var newPath = this.router.stringifyPath(this.target);
        if (this.path !== newPath) {
          this.path = newPath;
          this.updateActiveMatch();
          this.updateHref();
        }
        if (this.activeIds) {
          this.vm.$emit(LINK_UPDATE, this, route.path);
        } else {
          this.updateClasses(route.path, this.el);
        }
      },

      updateActiveMatch: function updateActiveMatch() {
        this.activeRE = this.path && !this.exact ? new RegExp('^' + this.path.replace(/\/$/, '').replace(queryStringRE, '').replace(regexEscapeRE, '\\$&') + '(\\/|$)') : null;
      },

      updateHref: function updateHref() {
        if (this.el.tagName !== 'A') {
          return;
        }
        var path = this.path;
        var router = this.router;
        var isAbsolute = path.charAt(0) === '/';
        // do not format non-hash relative paths
        var href = path && (router.mode === 'hash' || isAbsolute) ? router.history.formatPath(path, this.append) : path;
        if (href) {
          this.el.href = href;
        } else {
          this.el.removeAttribute('href');
        }
      },

      updateClasses: function updateClasses(path, el) {
        var activeClass = this.activeClass || this.router._linkActiveClass;
        // clear old class
        if (this.prevActiveClass && this.prevActiveClass !== activeClass) {
          toggleClasses(el, this.prevActiveClass, removeClass);
        }
        // remove query string before matching
        var dest = this.path.replace(queryStringRE, '');
        path = path.replace(queryStringRE, '');
        // add new class
        if (this.exact) {
          if (dest === path ||
          // also allow additional trailing slash
          dest.charAt(dest.length - 1) !== '/' && dest === path.replace(trailingSlashRE, '')) {
            toggleClasses(el, activeClass, addClass);
          } else {
            toggleClasses(el, activeClass, removeClass);
          }
        } else {
          if (this.activeRE && this.activeRE.test(path)) {
            toggleClasses(el, activeClass, addClass);
          } else {
            toggleClasses(el, activeClass, removeClass);
          }
        }
      },

      unbind: function unbind() {
        this.el.removeEventListener('click', this.handler);
        this.unwatch && this.unwatch();
      }
    });

    function sameOrigin(link) {
      return link.protocol === location.protocol && link.hostname === location.hostname && link.port === location.port;
    }

    // this function is copied from v-bind:class implementation until
    // we properly expose it...
    function toggleClasses(el, key, fn) {
      key = key.trim();
      if (key.indexOf(' ') === -1) {
        fn(el, key);
        return;
      }
      var keys = key.split(/\s+/);
      for (var i = 0, l = keys.length; i < l; i++) {
        fn(el, keys[i]);
      }
    }
  }

  var historyBackends = {
    abstract: AbstractHistory,
    hash: HashHistory,
    html5: HTML5History
  };

  // late bind during install
  var Vue = undefined;

  /**
   * Router constructor
   *
   * @param {Object} [options]
   */

  var Router = (function () {
    function Router() {
      var _this = this;

      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$hashbang = _ref.hashbang;
      var hashbang = _ref$hashbang === undefined ? true : _ref$hashbang;
      var _ref$abstract = _ref.abstract;
      var abstract = _ref$abstract === undefined ? false : _ref$abstract;
      var _ref$history = _ref.history;
      var history = _ref$history === undefined ? false : _ref$history;
      var _ref$saveScrollPosition = _ref.saveScrollPosition;
      var saveScrollPosition = _ref$saveScrollPosition === undefined ? false : _ref$saveScrollPosition;
      var _ref$transitionOnLoad = _ref.transitionOnLoad;
      var transitionOnLoad = _ref$transitionOnLoad === undefined ? false : _ref$transitionOnLoad;
      var _ref$suppressTransitionError = _ref.suppressTransitionError;
      var suppressTransitionError = _ref$suppressTransitionError === undefined ? false : _ref$suppressTransitionError;
      var _ref$root = _ref.root;
      var root = _ref$root === undefined ? null : _ref$root;
      var _ref$linkActiveClass = _ref.linkActiveClass;
      var linkActiveClass = _ref$linkActiveClass === undefined ? 'v-link-active' : _ref$linkActiveClass;
      babelHelpers.classCallCheck(this, Router);

      /* istanbul ignore if */
      if (!Router.installed) {
        throw new Error('Please install the Router with Vue.use() before ' + 'creating an instance.');
      }

      // Vue instances
      this.app = null;
      this._children = [];

      // route recognizer
      this._recognizer = new RouteRecognizer();
      this._guardRecognizer = new RouteRecognizer();

      // state
      this._started = false;
      this._startCb = null;
      this._currentRoute = {};
      this._currentTransition = null;
      this._previousTransition = null;
      this._notFoundHandler = null;
      this._notFoundRedirect = null;
      this._beforeEachHooks = [];
      this._afterEachHooks = [];

      // trigger transition on initial render?
      this._rendered = false;
      this._transitionOnLoad = transitionOnLoad;

      // history mode
      this._root = root;
      this._abstract = abstract;
      this._hashbang = hashbang;

      // check if HTML5 history is available
      var hasPushState = typeof window !== 'undefined' && window.history && window.history.pushState;
      this._history = history && hasPushState;
      this._historyFallback = history && !hasPushState;

      // create history object
      var inBrowser = Vue.util.inBrowser;
      this.mode = !inBrowser || this._abstract ? 'abstract' : this._history ? 'html5' : 'hash';

      var History = historyBackends[this.mode];
      this.history = new History({
        root: root,
        hashbang: this._hashbang,
        onChange: function onChange(path, state, anchor) {
          _this._match(path, state, anchor);
        }
      });

      // other options
      this._saveScrollPosition = saveScrollPosition;
      this._linkActiveClass = linkActiveClass;
      this._suppress = suppressTransitionError;
    }

    /**
     * Allow directly passing components to a route
     * definition.
     *
     * @param {String} path
     * @param {Object} handler
     */

    // API ===================================================

    /**
    * Register a map of top-level paths.
    *
    * @param {Object} map
    */

    Router.prototype.map = function map(_map) {
      for (var route in _map) {
        this.on(route, _map[route]);
      }
      return this;
    };

    /**
     * Register a single root-level path
     *
     * @param {String} rootPath
     * @param {Object} handler
     *                 - {String} component
     *                 - {Object} [subRoutes]
     *                 - {Boolean} [forceRefresh]
     *                 - {Function} [before]
     *                 - {Function} [after]
     */

    Router.prototype.on = function on(rootPath, handler) {
      if (rootPath === '*') {
        this._notFound(handler);
      } else {
        this._addRoute(rootPath, handler, []);
      }
      return this;
    };

    /**
     * Set redirects.
     *
     * @param {Object} map
     */

    Router.prototype.redirect = function redirect(map) {
      for (var path in map) {
        this._addRedirect(path, map[path]);
      }
      return this;
    };

    /**
     * Set aliases.
     *
     * @param {Object} map
     */

    Router.prototype.alias = function alias(map) {
      for (var path in map) {
        this._addAlias(path, map[path]);
      }
      return this;
    };

    /**
     * Set global before hook.
     *
     * @param {Function} fn
     */

    Router.prototype.beforeEach = function beforeEach(fn) {
      this._beforeEachHooks.push(fn);
      return this;
    };

    /**
     * Set global after hook.
     *
     * @param {Function} fn
     */

    Router.prototype.afterEach = function afterEach(fn) {
      this._afterEachHooks.push(fn);
      return this;
    };

    /**
     * Navigate to a given path.
     * The path can be an object describing a named path in
     * the format of { name: '...', params: {}, query: {}}
     * The path is assumed to be already decoded, and will
     * be resolved against root (if provided)
     *
     * @param {String|Object} path
     * @param {Boolean} [replace]
     */

    Router.prototype.go = function go(path) {
      var replace = false;
      var append = false;
      if (Vue.util.isObject(path)) {
        replace = path.replace;
        append = path.append;
      }
      path = this.stringifyPath(path);
      if (path) {
        this.history.go(path, replace, append);
      }
    };

    /**
     * Short hand for replacing current path
     *
     * @param {String} path
     */

    Router.prototype.replace = function replace(path) {
      if (typeof path === 'string') {
        path = { path: path };
      }
      path.replace = true;
      this.go(path);
    };

    /**
     * Start the router.
     *
     * @param {VueConstructor} App
     * @param {String|Element} container
     * @param {Function} [cb]
     */

    Router.prototype.start = function start(App, container, cb) {
      /* istanbul ignore if */
      if (this._started) {
        warn$1('already started.');
        return;
      }
      this._started = true;
      this._startCb = cb;
      if (!this.app) {
        /* istanbul ignore if */
        if (!App || !container) {
          throw new Error('Must start vue-router with a component and a ' + 'root container.');
        }
        /* istanbul ignore if */
        if (App instanceof Vue) {
          throw new Error('Must start vue-router with a component, not a ' + 'Vue instance.');
        }
        this._appContainer = container;
        var Ctor = this._appConstructor = typeof App === 'function' ? App : Vue.extend(App);
        // give it a name for better debugging
        Ctor.options.name = Ctor.options.name || 'RouterApp';
      }

      // handle history fallback in browsers that do not
      // support HTML5 history API
      if (this._historyFallback) {
        var _location = window.location;
        var _history = new HTML5History({ root: this._root });
        var path = _history.root ? _location.pathname.replace(_history.rootRE, '') : _location.pathname;
        if (path && path !== '/') {
          _location.assign((_history.root || '') + '/' + this.history.formatPath(path) + _location.search);
          return;
        }
      }

      this.history.start();
    };

    /**
     * Stop listening to route changes.
     */

    Router.prototype.stop = function stop() {
      this.history.stop();
      this._started = false;
    };

    /**
     * Normalize named route object / string paths into
     * a string.
     *
     * @param {Object|String|Number} path
     * @return {String}
     */

    Router.prototype.stringifyPath = function stringifyPath(path) {
      var generatedPath = '';
      if (path && typeof path === 'object') {
        if (path.name) {
          var extend = Vue.util.extend;
          var currentParams = this._currentTransition && this._currentTransition.to.params;
          var targetParams = path.params || {};
          var params = currentParams ? extend(extend({}, currentParams), targetParams) : targetParams;
          generatedPath = encodeURI(this._recognizer.generate(path.name, params));
        } else if (path.path) {
          generatedPath = encodeURI(path.path);
        }
        if (path.query) {
          // note: the generated query string is pre-URL-encoded by the recognizer
          var query = this._recognizer.generateQueryString(path.query);
          if (generatedPath.indexOf('?') > -1) {
            generatedPath += '&' + query.slice(1);
          } else {
            generatedPath += query;
          }
        }
      } else {
        generatedPath = encodeURI(path ? path + '' : '');
      }
      return generatedPath;
    };

    // Internal methods ======================================

    /**
    * Add a route containing a list of segments to the internal
    * route recognizer. Will be called recursively to add all
    * possible sub-routes.
    *
    * @param {String} path
    * @param {Object} handler
    * @param {Array} segments
    */

    Router.prototype._addRoute = function _addRoute(path, handler, segments) {
      guardComponent(path, handler);
      handler.path = path;
      handler.fullPath = (segments.reduce(function (path, segment) {
        return path + segment.path;
      }, '') + path).replace('//', '/');
      segments.push({
        path: path,
        handler: handler
      });
      this._recognizer.add(segments, {
        as: handler.name
      });
      // add sub routes
      if (handler.subRoutes) {
        for (var subPath in handler.subRoutes) {
          // recursively walk all sub routes
          this._addRoute(subPath, handler.subRoutes[subPath],
          // pass a copy in recursion to avoid mutating
          // across branches
          segments.slice());
        }
      }
    };

    /**
     * Set the notFound route handler.
     *
     * @param {Object} handler
     */

    Router.prototype._notFound = function _notFound(handler) {
      guardComponent('*', handler);
      this._notFoundHandler = [{ handler: handler }];
    };

    /**
     * Add a redirect record.
     *
     * @param {String} path
     * @param {String} redirectPath
     */

    Router.prototype._addRedirect = function _addRedirect(path, redirectPath) {
      if (path === '*') {
        this._notFoundRedirect = redirectPath;
      } else {
        this._addGuard(path, redirectPath, this.replace);
      }
    };

    /**
     * Add an alias record.
     *
     * @param {String} path
     * @param {String} aliasPath
     */

    Router.prototype._addAlias = function _addAlias(path, aliasPath) {
      this._addGuard(path, aliasPath, this._match);
    };

    /**
     * Add a path guard.
     *
     * @param {String} path
     * @param {String} mappedPath
     * @param {Function} handler
     */

    Router.prototype._addGuard = function _addGuard(path, mappedPath, _handler) {
      var _this2 = this;

      this._guardRecognizer.add([{
        path: path,
        handler: function handler(match, query) {
          var realPath = mapParams(mappedPath, match.params, query);
          _handler.call(_this2, realPath);
        }
      }]);
    };

    /**
     * Check if a path matches any redirect records.
     *
     * @param {String} path
     * @return {Boolean} - if true, will skip normal match.
     */

    Router.prototype._checkGuard = function _checkGuard(path) {
      var matched = this._guardRecognizer.recognize(path, true);
      if (matched) {
        matched[0].handler(matched[0], matched.queryParams);
        return true;
      } else if (this._notFoundRedirect) {
        matched = this._recognizer.recognize(path);
        if (!matched) {
          this.replace(this._notFoundRedirect);
          return true;
        }
      }
    };

    /**
     * Match a URL path and set the route context on vm,
     * triggering view updates.
     *
     * @param {String} path
     * @param {Object} [state]
     * @param {String} [anchor]
     */

    Router.prototype._match = function _match(path, state, anchor) {
      var _this3 = this;

      if (this._checkGuard(path)) {
        return;
      }

      var currentRoute = this._currentRoute;
      var currentTransition = this._currentTransition;

      if (currentTransition) {
        if (currentTransition.to.path === path) {
          // do nothing if we have an active transition going to the same path
          return;
        } else if (currentRoute.path === path) {
          // We are going to the same path, but we also have an ongoing but
          // not-yet-validated transition. Abort that transition and reset to
          // prev transition.
          currentTransition.aborted = true;
          this._currentTransition = this._prevTransition;
          return;
        } else {
          // going to a totally different path. abort ongoing transition.
          currentTransition.aborted = true;
        }
      }

      // construct new route and transition context
      var route = new Route(path, this);
      var transition = new RouteTransition(this, route, currentRoute);

      // current transition is updated right now.
      // however, current route will only be updated after the transition has
      // been validated.
      this._prevTransition = currentTransition;
      this._currentTransition = transition;

      if (!this.app) {
        (function () {
          // initial render
          var router = _this3;
          _this3.app = new _this3._appConstructor({
            el: _this3._appContainer,
            created: function created() {
              this.$router = router;
            },
            _meta: {
              $route: route
            }
          });
        })();
      }

      // check global before hook
      var beforeHooks = this._beforeEachHooks;
      var startTransition = function startTransition() {
        transition.start(function () {
          _this3._postTransition(route, state, anchor);
        });
      };

      if (beforeHooks.length) {
        transition.runQueue(beforeHooks, function (hook, _, next) {
          if (transition === _this3._currentTransition) {
            transition.callHook(hook, null, next, {
              expectBoolean: true
            });
          }
        }, startTransition);
      } else {
        startTransition();
      }

      if (!this._rendered && this._startCb) {
        this._startCb.call(null);
      }

      // HACK:
      // set rendered to true after the transition start, so
      // that components that are acitvated synchronously know
      // whether it is the initial render.
      this._rendered = true;
    };

    /**
     * Set current to the new transition.
     * This is called by the transition object when the
     * validation of a route has succeeded.
     *
     * @param {Transition} transition
     */

    Router.prototype._onTransitionValidated = function _onTransitionValidated(transition) {
      // set current route
      var route = this._currentRoute = transition.to;
      // update route context for all children
      if (this.app.$route !== route) {
        this.app.$route = route;
        this._children.forEach(function (child) {
          child.$route = route;
        });
      }
      // call global after hook
      if (this._afterEachHooks.length) {
        this._afterEachHooks.forEach(function (hook) {
          return hook.call(null, {
            to: transition.to,
            from: transition.from
          });
        });
      }
      this._currentTransition.done = true;
    };

    /**
     * Handle stuff after the transition.
     *
     * @param {Route} route
     * @param {Object} [state]
     * @param {String} [anchor]
     */

    Router.prototype._postTransition = function _postTransition(route, state, anchor) {
      // handle scroll positions
      // saved scroll positions take priority
      // then we check if the path has an anchor
      var pos = state && state.pos;
      if (pos && this._saveScrollPosition) {
        Vue.nextTick(function () {
          window.scrollTo(pos.x, pos.y);
        });
      } else if (anchor) {
        Vue.nextTick(function () {
          var el = document.getElementById(anchor.slice(1));
          if (el) {
            window.scrollTo(window.scrollX, el.offsetTop);
          }
        });
      }
    };

    return Router;
  })();

  function guardComponent(path, handler) {
    var comp = handler.component;
    if (Vue.util.isPlainObject(comp)) {
      comp = handler.component = Vue.extend(comp);
    }
    /* istanbul ignore if */
    if (typeof comp !== 'function') {
      handler.component = null;
      warn$1('invalid component for route "' + path + '".');
    }
  }

  /* Installation */

  Router.installed = false;

  /**
   * Installation interface.
   * Install the necessary directives.
   */

  Router.install = function (externalVue) {
    /* istanbul ignore if */
    if (Router.installed) {
      warn$1('already installed.');
      return;
    }
    Vue = externalVue;
    applyOverride(Vue);
    View(Vue);
    Link(Vue);
    exports$1.Vue = Vue;
    Router.installed = true;
  };

  // auto install
  /* istanbul ignore if */
  if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(Router);
  }

  return Router;

}));
},{}],4:[function(require,module,exports){
(function (process,global){
/*!
 * Vue.js v1.0.26
 * (c) 2016 Evan You
 * Released under the MIT License.
 */
'use strict';

function set(obj, key, val) {
  if (hasOwn(obj, key)) {
    obj[key] = val;
    return;
  }
  if (obj._isVue) {
    set(obj._data, key, val);
    return;
  }
  var ob = obj.__ob__;
  if (!ob) {
    obj[key] = val;
    return;
  }
  ob.convert(key, val);
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._proxy(key);
      vm._digest();
    }
  }
  return val;
}

/**
 * Delete a property and trigger change if necessary.
 *
 * @param {Object} obj
 * @param {String} key
 */

function del(obj, key) {
  if (!hasOwn(obj, key)) {
    return;
  }
  delete obj[key];
  var ob = obj.__ob__;
  if (!ob) {
    if (obj._isVue) {
      delete obj._data[key];
      obj._digest();
    }
    return;
  }
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._unproxy(key);
      vm._digest();
    }
  }
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Check whether the object has the property.
 *
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */

function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * Check if an expression is a literal value.
 *
 * @param {String} exp
 * @return {Boolean}
 */

var literalValueRE = /^\s?(true|false|-?[\d\.]+|'[^']*'|"[^"]*")\s?$/;

function isLiteral(exp) {
  return literalValueRE.test(exp);
}

/**
 * Check if a string starts with $ or _
 *
 * @param {String} str
 * @return {Boolean}
 */

function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

/**
 * Guard text output, make sure undefined outputs
 * empty string
 *
 * @param {*} value
 * @return {String}
 */

function _toString(value) {
  return value == null ? '' : value.toString();
}

/**
 * Check and convert possible numeric strings to numbers
 * before setting back to data
 *
 * @param {*} value
 * @return {*|Number}
 */

function toNumber(value) {
  if (typeof value !== 'string') {
    return value;
  } else {
    var parsed = Number(value);
    return isNaN(parsed) ? value : parsed;
  }
}

/**
 * Convert string boolean literals into real booleans.
 *
 * @param {*} value
 * @return {*|Boolean}
 */

function toBoolean(value) {
  return value === 'true' ? true : value === 'false' ? false : value;
}

/**
 * Strip quotes from a string
 *
 * @param {String} str
 * @return {String | false}
 */

function stripQuotes(str) {
  var a = str.charCodeAt(0);
  var b = str.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27) ? str.slice(1, -1) : str;
}

/**
 * Camelize a hyphen-delmited string.
 *
 * @param {String} str
 * @return {String}
 */

var camelizeRE = /-(\w)/g;

function camelize(str) {
  return str.replace(camelizeRE, toUpper);
}

function toUpper(_, c) {
  return c ? c.toUpperCase() : '';
}

/**
 * Hyphenate a camelCase string.
 *
 * @param {String} str
 * @return {String}
 */

var hyphenateRE = /([a-z\d])([A-Z])/g;

function hyphenate(str) {
  return str.replace(hyphenateRE, '$1-$2').toLowerCase();
}

/**
 * Converts hyphen/underscore/slash delimitered names into
 * camelized classNames.
 *
 * e.g. my-component => MyComponent
 *      some_else    => SomeElse
 *      some/comp    => SomeComp
 *
 * @param {String} str
 * @return {String}
 */

var classifyRE = /(?:^|[-_\/])(\w)/g;

function classify(str) {
  return str.replace(classifyRE, toUpper);
}

/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

function bind(fn, ctx) {
  return function (a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  };
}

/**
 * Convert an Array-like object to a real Array.
 *
 * @param {Array-like} list
 * @param {Number} [start] - start index
 * @return {Array}
 */

function toArray(list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}

/**
 * Mix properties into target object.
 *
 * @param {Object} to
 * @param {Object} from
 */

function extend(to, from) {
  var keys = Object.keys(from);
  var i = keys.length;
  while (i--) {
    to[keys[i]] = from[keys[i]];
  }
  return to;
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param {*} obj
 * @return {Boolean}
 */

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';

function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}

/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var isArray = Array.isArray;

/**
 * Define a property.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Debounce a function so it only gets called after the
 * input stops arriving after the given wait period.
 *
 * @param {Function} func
 * @param {Number} wait
 * @return {Function} - the debounced function
 */

function _debounce(func, wait) {
  var timeout, args, context, timestamp, result;
  var later = function later() {
    var last = Date.now() - timestamp;
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    }
  };
  return function () {
    context = this;
    args = arguments;
    timestamp = Date.now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    return result;
  };
}

/**
 * Manual indexOf because it's slightly faster than
 * native.
 *
 * @param {Array} arr
 * @param {*} obj
 */

function indexOf(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) return i;
  }
  return -1;
}

/**
 * Make a cancellable version of an async callback.
 *
 * @param {Function} fn
 * @return {Function}
 */

function cancellable(fn) {
  var cb = function cb() {
    if (!cb.cancelled) {
      return fn.apply(this, arguments);
    }
  };
  cb.cancel = function () {
    cb.cancelled = true;
  };
  return cb;
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 *
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 */

function looseEqual(a, b) {
  /* eslint-disable eqeqeq */
  return a == b || (isObject(a) && isObject(b) ? JSON.stringify(a) === JSON.stringify(b) : false);
  /* eslint-enable eqeqeq */
}

var hasProto = ('__proto__' in {});

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

// UA sniffing for working around browser-specific quirks
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && UA.indexOf('trident') > 0;
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isAndroid = UA && UA.indexOf('android') > 0;
var isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA);
var iosVersionMatch = isIos && UA.match(/os ([\d_]+)/);
var iosVersion = iosVersionMatch && iosVersionMatch[1].split('_');

// detecting iOS UIWebView by indexedDB
var hasMutationObserverBug = iosVersion && Number(iosVersion[0]) >= 9 && Number(iosVersion[1]) >= 3 && !window.indexedDB;

var transitionProp = undefined;
var transitionEndEvent = undefined;
var animationProp = undefined;
var animationEndEvent = undefined;

// Transition property/event sniffing
if (inBrowser && !isIE9) {
  var isWebkitTrans = window.ontransitionend === undefined && window.onwebkittransitionend !== undefined;
  var isWebkitAnim = window.onanimationend === undefined && window.onwebkitanimationend !== undefined;
  transitionProp = isWebkitTrans ? 'WebkitTransition' : 'transition';
  transitionEndEvent = isWebkitTrans ? 'webkitTransitionEnd' : 'transitionend';
  animationProp = isWebkitAnim ? 'WebkitAnimation' : 'animation';
  animationEndEvent = isWebkitAnim ? 'webkitAnimationEnd' : 'animationend';
}

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

var nextTick = (function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;
  function nextTickHandler() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks = [];
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined' && !hasMutationObserverBug) {
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(counter);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = counter;
    };
  } else {
    // webpack attempts to inject a shim for setImmediate
    // if it is used as a global, so we have to work around that to
    // avoid bundling unnecessary code.
    var context = inBrowser ? window : typeof global !== 'undefined' ? global : {};
    timerFunc = context.setImmediate || setTimeout;
  }
  return function (cb, ctx) {
    var func = ctx ? function () {
      cb.call(ctx);
    } : cb;
    callbacks.push(func);
    if (pending) return;
    pending = true;
    timerFunc(nextTickHandler, 0);
  };
})();

var _Set = undefined;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && Set.toString().match(/native code/)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = function () {
    this.set = Object.create(null);
  };
  _Set.prototype.has = function (key) {
    return this.set[key] !== undefined;
  };
  _Set.prototype.add = function (key) {
    this.set[key] = 1;
  };
  _Set.prototype.clear = function () {
    this.set = Object.create(null);
  };
}

function Cache(limit) {
  this.size = 0;
  this.limit = limit;
  this.head = this.tail = undefined;
  this._keymap = Object.create(null);
}

var p = Cache.prototype;

/**
 * Put <value> into the cache associated with <key>.
 * Returns the entry which was removed to make room for
 * the new entry. Otherwise undefined is returned.
 * (i.e. if there was enough room already).
 *
 * @param {String} key
 * @param {*} value
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var removed;

  var entry = this.get(key, true);
  if (!entry) {
    if (this.size === this.limit) {
      removed = this.shift();
    }
    entry = {
      key: key
    };
    this._keymap[key] = entry;
    if (this.tail) {
      this.tail.newer = entry;
      entry.older = this.tail;
    } else {
      this.head = entry;
    }
    this.tail = entry;
    this.size++;
  }
  entry.value = value;

  return removed;
};

/**
 * Purge the least recently used (oldest) entry from the
 * cache. Returns the removed entry or undefined if the
 * cache was empty.
 */

p.shift = function () {
  var entry = this.head;
  if (entry) {
    this.head = this.head.newer;
    this.head.older = undefined;
    entry.newer = entry.older = undefined;
    this._keymap[entry.key] = undefined;
    this.size--;
  }
  return entry;
};

/**
 * Get and register recent use of <key>. Returns the value
 * associated with <key> or undefined if not in cache.
 *
 * @param {String} key
 * @param {Boolean} returnEntry
 * @return {Entry|*}
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key];
  if (entry === undefined) return;
  if (entry === this.tail) {
    return returnEntry ? entry : entry.value;
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) {
    if (entry === this.head) {
      this.head = entry.newer;
    }
    entry.newer.older = entry.older; // C <-- E.
  }
  if (entry.older) {
    entry.older.newer = entry.newer; // C. --> E
  }
  entry.newer = undefined; // D --x
  entry.older = this.tail; // D. --> E
  if (this.tail) {
    this.tail.newer = entry; // E. <-- D
  }
  this.tail = entry;
  return returnEntry ? entry : entry.value;
};

var cache$1 = new Cache(1000);
var filterTokenRE = /[^\s'"]+|'[^']*'|"[^"]*"/g;
var reservedArgRE = /^in$|^-?\d+/;

/**
 * Parser state
 */

var str;
var dir;
var c;
var prev;
var i;
var l;
var lastFilterIndex;
var inSingle;
var inDouble;
var curly;
var square;
var paren;
/**
 * Push a filter to the current directive object
 */

function pushFilter() {
  var exp = str.slice(lastFilterIndex, i).trim();
  var filter;
  if (exp) {
    filter = {};
    var tokens = exp.match(filterTokenRE);
    filter.name = tokens[0];
    if (tokens.length > 1) {
      filter.args = tokens.slice(1).map(processFilterArg);
    }
  }
  if (filter) {
    (dir.filters = dir.filters || []).push(filter);
  }
  lastFilterIndex = i + 1;
}

/**
 * Check if an argument is dynamic and strip quotes.
 *
 * @param {String} arg
 * @return {Object}
 */

function processFilterArg(arg) {
  if (reservedArgRE.test(arg)) {
    return {
      value: toNumber(arg),
      dynamic: false
    };
  } else {
    var stripped = stripQuotes(arg);
    var dynamic = stripped === arg;
    return {
      value: dynamic ? arg : stripped,
      dynamic: dynamic
    };
  }
}

/**
 * Parse a directive value and extract the expression
 * and its filters into a descriptor.
 *
 * Example:
 *
 * "a + 1 | uppercase" will yield:
 * {
 *   expression: 'a + 1',
 *   filters: [
 *     { name: 'uppercase', args: null }
 *   ]
 * }
 *
 * @param {String} s
 * @return {Object}
 */

function parseDirective(s) {
  var hit = cache$1.get(s);
  if (hit) {
    return hit;
  }

  // reset parser state
  str = s;
  inSingle = inDouble = false;
  curly = square = paren = 0;
  lastFilterIndex = 0;
  dir = {};

  for (i = 0, l = str.length; i < l; i++) {
    prev = c;
    c = str.charCodeAt(i);
    if (inSingle) {
      // check single quote
      if (c === 0x27 && prev !== 0x5C) inSingle = !inSingle;
    } else if (inDouble) {
      // check double quote
      if (c === 0x22 && prev !== 0x5C) inDouble = !inDouble;
    } else if (c === 0x7C && // pipe
    str.charCodeAt(i + 1) !== 0x7C && str.charCodeAt(i - 1) !== 0x7C) {
      if (dir.expression == null) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        dir.expression = str.slice(0, i).trim();
      } else {
        // already has filter
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22:
          inDouble = true;break; // "
        case 0x27:
          inSingle = true;break; // '
        case 0x28:
          paren++;break; // (
        case 0x29:
          paren--;break; // )
        case 0x5B:
          square++;break; // [
        case 0x5D:
          square--;break; // ]
        case 0x7B:
          curly++;break; // {
        case 0x7D:
          curly--;break; // }
      }
    }
  }

  if (dir.expression == null) {
    dir.expression = str.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  cache$1.put(s, dir);
  return dir;
}

var directive = Object.freeze({
  parseDirective: parseDirective
});

var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
var cache = undefined;
var tagRE = undefined;
var htmlRE = undefined;
/**
 * Escape a string so it can be used in a RegExp
 * constructor.
 *
 * @param {String} str
 */

function escapeRegex(str) {
  return str.replace(regexEscapeRE, '\\$&');
}

function compileRegex() {
  var open = escapeRegex(config.delimiters[0]);
  var close = escapeRegex(config.delimiters[1]);
  var unsafeOpen = escapeRegex(config.unsafeDelimiters[0]);
  var unsafeClose = escapeRegex(config.unsafeDelimiters[1]);
  tagRE = new RegExp(unsafeOpen + '((?:.|\\n)+?)' + unsafeClose + '|' + open + '((?:.|\\n)+?)' + close, 'g');
  htmlRE = new RegExp('^' + unsafeOpen + '((?:.|\\n)+?)' + unsafeClose + '$');
  // reset cache
  cache = new Cache(1000);
}

/**
 * Parse a template text string into an array of tokens.
 *
 * @param {String} text
 * @return {Array<Object> | null}
 *               - {String} type
 *               - {String} value
 *               - {Boolean} [html]
 *               - {Boolean} [oneTime]
 */

function parseText(text) {
  if (!cache) {
    compileRegex();
  }
  var hit = cache.get(text);
  if (hit) {
    return hit;
  }
  if (!tagRE.test(text)) {
    return null;
  }
  var tokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index, html, value, first, oneTime;
  /* eslint-disable no-cond-assign */
  while (match = tagRE.exec(text)) {
    /* eslint-enable no-cond-assign */
    index = match.index;
    // push text token
    if (index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, index)
      });
    }
    // tag token
    html = htmlRE.test(match[0]);
    value = html ? match[1] : match[2];
    first = value.charCodeAt(0);
    oneTime = first === 42; // *
    value = oneTime ? value.slice(1) : value;
    tokens.push({
      tag: true,
      value: value.trim(),
      html: html,
      oneTime: oneTime
    });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex)
    });
  }
  cache.put(text, tokens);
  return tokens;
}

/**
 * Format a list of tokens into an expression.
 * e.g. tokens parsed from 'a {{b}} c' can be serialized
 * into one single expression as '"a " + b + " c"'.
 *
 * @param {Array} tokens
 * @param {Vue} [vm]
 * @return {String}
 */

function tokensToExp(tokens, vm) {
  if (tokens.length > 1) {
    return tokens.map(function (token) {
      return formatToken(token, vm);
    }).join('+');
  } else {
    return formatToken(tokens[0], vm, true);
  }
}

/**
 * Format a single token.
 *
 * @param {Object} token
 * @param {Vue} [vm]
 * @param {Boolean} [single]
 * @return {String}
 */

function formatToken(token, vm, single) {
  return token.tag ? token.oneTime && vm ? '"' + vm.$eval(token.value) + '"' : inlineFilters(token.value, single) : '"' + token.value + '"';
}

/**
 * For an attribute with multiple interpolation tags,
 * e.g. attr="some-{{thing | filter}}", in order to combine
 * the whole thing into a single watchable expression, we
 * have to inline those filters. This function does exactly
 * that. This is a bit hacky but it avoids heavy changes
 * to directive parser and watcher mechanism.
 *
 * @param {String} exp
 * @param {Boolean} single
 * @return {String}
 */

var filterRE = /[^|]\|[^|]/;
function inlineFilters(exp, single) {
  if (!filterRE.test(exp)) {
    return single ? exp : '(' + exp + ')';
  } else {
    var dir = parseDirective(exp);
    if (!dir.filters) {
      return '(' + exp + ')';
    } else {
      return 'this._applyFilters(' + dir.expression + // value
      ',null,' + // oldValue (null for read)
      JSON.stringify(dir.filters) + // filter descriptors
      ',false)'; // write?
    }
  }
}

var text = Object.freeze({
  compileRegex: compileRegex,
  parseText: parseText,
  tokensToExp: tokensToExp
});

var delimiters = ['{{', '}}'];
var unsafeDelimiters = ['{{{', '}}}'];

var config = Object.defineProperties({

  /**
   * Whether to print debug messages.
   * Also enables stack trace for warnings.
   *
   * @type {Boolean}
   */

  debug: false,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

  /**
   * Whether to use async rendering.
   */

  async: true,

  /**
   * Whether to warn against errors caught when evaluating
   * expressions.
   */

  warnExpressionErrors: true,

  /**
   * Whether to allow devtools inspection.
   * Disabled by default in production builds.
   */

  devtools: process.env.NODE_ENV !== 'production',

  /**
   * Internal flag to indicate the delimiters have been
   * changed.
   *
   * @type {Boolean}
   */

  _delimitersChanged: true,

  /**
   * List of asset types that a component can own.
   *
   * @type {Array}
   */

  _assetTypes: ['component', 'directive', 'elementDirective', 'filter', 'transition', 'partial'],

  /**
   * prop binding modes
   */

  _propBindingModes: {
    ONE_WAY: 0,
    TWO_WAY: 1,
    ONE_TIME: 2
  },

  /**
   * Max circular updates allowed in a batcher flush cycle.
   */

  _maxUpdateCount: 100

}, {
  delimiters: { /**
                 * Interpolation delimiters. Changing these would trigger
                 * the text parser to re-compile the regular expressions.
                 *
                 * @type {Array<String>}
                 */

    get: function get() {
      return delimiters;
    },
    set: function set(val) {
      delimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  },
  unsafeDelimiters: {
    get: function get() {
      return unsafeDelimiters;
    },
    set: function set(val) {
      unsafeDelimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  }
});

var warn = undefined;
var formatComponentName = undefined;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var hasConsole = typeof console !== 'undefined';

    warn = function (msg, vm) {
      if (hasConsole && !config.silent) {
        console.error('[Vue warn]: ' + msg + (vm ? formatComponentName(vm) : ''));
      }
    };

    formatComponentName = function (vm) {
      var name = vm._isVue ? vm.$options.name : vm.name;
      return name ? ' (found in component: <' + hyphenate(name) + '>)' : '';
    };
  })();
}

/**
 * Append with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function appendWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    target.appendChild(el);
  }, vm, cb);
}

/**
 * InsertBefore with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function beforeWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    before(el, target);
  }, vm, cb);
}

/**
 * Remove with transition.
 *
 * @param {Element} el
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function removeWithTransition(el, vm, cb) {
  applyTransition(el, -1, function () {
    remove(el);
  }, vm, cb);
}

/**
 * Apply transitions with an operation callback.
 *
 * @param {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function applyTransition(el, direction, op, vm, cb) {
  var transition = el.__v_trans;
  if (!transition ||
  // skip if there are no js hooks and CSS transition is
  // not supported
  !transition.hooks && !transitionEndEvent ||
  // skip transitions for initial compile
  !vm._isCompiled ||
  // if the vm is being manipulated by a parent directive
  // during the parent's compilation phase, skip the
  // animation.
  vm.$parent && !vm.$parent._isCompiled) {
    op();
    if (cb) cb();
    return;
  }
  var action = direction > 0 ? 'enter' : 'leave';
  transition[action](op, cb);
}

var transition = Object.freeze({
  appendWithTransition: appendWithTransition,
  beforeWithTransition: beforeWithTransition,
  removeWithTransition: removeWithTransition,
  applyTransition: applyTransition
});

/**
 * Query an element selector if it's not an element already.
 *
 * @param {String|Element} el
 * @return {Element}
 */

function query(el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn('Cannot find element: ' + selector);
    }
  }
  return el;
}

/**
 * Check if a node is in the document.
 * Note: document.documentElement.contains should work here
 * but always returns false for comment nodes in phantomjs,
 * making unit tests difficult. This is fixed by doing the
 * contains() check on the node's parentNode instead of
 * the node itself.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function inDoc(node) {
  if (!node) return false;
  var doc = node.ownerDocument.documentElement;
  var parent = node.parentNode;
  return doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent));
}

/**
 * Get and remove an attribute from a node.
 *
 * @param {Node} node
 * @param {String} _attr
 */

function getAttr(node, _attr) {
  var val = node.getAttribute(_attr);
  if (val !== null) {
    node.removeAttribute(_attr);
  }
  return val;
}

/**
 * Get an attribute with colon or v-bind: prefix.
 *
 * @param {Node} node
 * @param {String} name
 * @return {String|null}
 */

function getBindAttr(node, name) {
  var val = getAttr(node, ':' + name);
  if (val === null) {
    val = getAttr(node, 'v-bind:' + name);
  }
  return val;
}

/**
 * Check the presence of a bind attribute.
 *
 * @param {Node} node
 * @param {String} name
 * @return {Boolean}
 */

function hasBindAttr(node, name) {
  return node.hasAttribute(name) || node.hasAttribute(':' + name) || node.hasAttribute('v-bind:' + name);
}

/**
 * Insert el before target
 *
 * @param {Element} el
 * @param {Element} target
 */

function before(el, target) {
  target.parentNode.insertBefore(el, target);
}

/**
 * Insert el after target
 *
 * @param {Element} el
 * @param {Element} target
 */

function after(el, target) {
  if (target.nextSibling) {
    before(el, target.nextSibling);
  } else {
    target.parentNode.appendChild(el);
  }
}

/**
 * Remove el from DOM
 *
 * @param {Element} el
 */

function remove(el) {
  el.parentNode.removeChild(el);
}

/**
 * Prepend el to target
 *
 * @param {Element} el
 * @param {Element} target
 */

function prepend(el, target) {
  if (target.firstChild) {
    before(el, target.firstChild);
  } else {
    target.appendChild(el);
  }
}

/**
 * Replace target with el
 *
 * @param {Element} target
 * @param {Element} el
 */

function replace(target, el) {
  var parent = target.parentNode;
  if (parent) {
    parent.replaceChild(el, target);
  }
}

/**
 * Add event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 * @param {Boolean} [useCapture]
 */

function on(el, event, cb, useCapture) {
  el.addEventListener(event, cb, useCapture);
}

/**
 * Remove event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

function off(el, event, cb) {
  el.removeEventListener(event, cb);
}

/**
 * For IE9 compat: when both class and :class are present
 * getAttribute('class') returns wrong value...
 *
 * @param {Element} el
 * @return {String}
 */

function getClass(el) {
  var classname = el.className;
  if (typeof classname === 'object') {
    classname = classname.baseVal || '';
  }
  return classname;
}

/**
 * In IE9, setAttribute('class') will result in empty class
 * if the element also has the :class attribute; However in
 * PhantomJS, setting `className` does not work on SVG elements...
 * So we have to do a conditional check here.
 *
 * @param {Element} el
 * @param {String} cls
 */

function setClass(el, cls) {
  /* istanbul ignore if */
  if (isIE9 && !/svg$/.test(el.namespaceURI)) {
    el.className = cls;
  } else {
    el.setAttribute('class', cls);
  }
}

/**
 * Add class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function addClass(el, cls) {
  if (el.classList) {
    el.classList.add(cls);
  } else {
    var cur = ' ' + getClass(el) + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      setClass(el, (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function removeClass(el, cls) {
  if (el.classList) {
    el.classList.remove(cls);
  } else {
    var cur = ' ' + getClass(el) + ' ';
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    setClass(el, cur.trim());
  }
  if (!el.className) {
    el.removeAttribute('class');
  }
}

/**
 * Extract raw content inside an element into a temporary
 * container div
 *
 * @param {Element} el
 * @param {Boolean} asFragment
 * @return {Element|DocumentFragment}
 */

function extractContent(el, asFragment) {
  var child;
  var rawContent;
  /* istanbul ignore if */
  if (isTemplate(el) && isFragment(el.content)) {
    el = el.content;
  }
  if (el.hasChildNodes()) {
    trimNode(el);
    rawContent = asFragment ? document.createDocumentFragment() : document.createElement('div');
    /* eslint-disable no-cond-assign */
    while (child = el.firstChild) {
      /* eslint-enable no-cond-assign */
      rawContent.appendChild(child);
    }
  }
  return rawContent;
}

/**
 * Trim possible empty head/tail text and comment
 * nodes inside a parent.
 *
 * @param {Node} node
 */

function trimNode(node) {
  var child;
  /* eslint-disable no-sequences */
  while ((child = node.firstChild, isTrimmable(child))) {
    node.removeChild(child);
  }
  while ((child = node.lastChild, isTrimmable(child))) {
    node.removeChild(child);
  }
  /* eslint-enable no-sequences */
}

function isTrimmable(node) {
  return node && (node.nodeType === 3 && !node.data.trim() || node.nodeType === 8);
}

/**
 * Check if an element is a template tag.
 * Note if the template appears inside an SVG its tagName
 * will be in lowercase.
 *
 * @param {Element} el
 */

function isTemplate(el) {
  return el.tagName && el.tagName.toLowerCase() === 'template';
}

/**
 * Create an "anchor" for performing dom insertion/removals.
 * This is used in a number of scenarios:
 * - fragment instance
 * - v-html
 * - v-if
 * - v-for
 * - component
 *
 * @param {String} content
 * @param {Boolean} persist - IE trashes empty textNodes on
 *                            cloneNode(true), so in certain
 *                            cases the anchor needs to be
 *                            non-empty to be persisted in
 *                            templates.
 * @return {Comment|Text}
 */

function createAnchor(content, persist) {
  var anchor = config.debug ? document.createComment(content) : document.createTextNode(persist ? ' ' : '');
  anchor.__v_anchor = true;
  return anchor;
}

/**
 * Find a component ref attribute that starts with $.
 *
 * @param {Element} node
 * @return {String|undefined}
 */

var refRE = /^v-ref:/;

function findRef(node) {
  if (node.hasAttributes()) {
    var attrs = node.attributes;
    for (var i = 0, l = attrs.length; i < l; i++) {
      var name = attrs[i].name;
      if (refRE.test(name)) {
        return camelize(name.replace(refRE, ''));
      }
    }
  }
}

/**
 * Map a function to a range of nodes .
 *
 * @param {Node} node
 * @param {Node} end
 * @param {Function} op
 */

function mapNodeRange(node, end, op) {
  var next;
  while (node !== end) {
    next = node.nextSibling;
    op(node);
    node = next;
  }
  op(end);
}

/**
 * Remove a range of nodes with transition, store
 * the nodes in a fragment with correct ordering,
 * and call callback when done.
 *
 * @param {Node} start
 * @param {Node} end
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Function} cb
 */

function removeNodeRange(start, end, vm, frag, cb) {
  var done = false;
  var removed = 0;
  var nodes = [];
  mapNodeRange(start, end, function (node) {
    if (node === end) done = true;
    nodes.push(node);
    removeWithTransition(node, vm, onRemoved);
  });
  function onRemoved() {
    removed++;
    if (done && removed >= nodes.length) {
      for (var i = 0; i < nodes.length; i++) {
        frag.appendChild(nodes[i]);
      }
      cb && cb();
    }
  }
}

/**
 * Check if a node is a DocumentFragment.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function isFragment(node) {
  return node && node.nodeType === 11;
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 *
 * @param {Element} el
 * @return {String}
 */

function getOuterHTML(el) {
  if (el.outerHTML) {
    return el.outerHTML;
  } else {
    var container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML;
  }
}

var commonTagRE = /^(div|p|span|img|a|b|i|br|ul|ol|li|h1|h2|h3|h4|h5|h6|code|pre|table|th|td|tr|form|label|input|select|option|nav|article|section|header|footer)$/i;
var reservedTagRE = /^(slot|partial|component)$/i;

var isUnknownElement = undefined;
if (process.env.NODE_ENV !== 'production') {
  isUnknownElement = function (el, tag) {
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement;
    } else {
      return (/HTMLUnknownElement/.test(el.toString()) &&
        // Chrome returns unknown for several HTML5 elements.
        // https://code.google.com/p/chromium/issues/detail?id=540526
        // Firefox returns unknown for some "Interactive elements."
        !/^(data|time|rtc|rb|details|dialog|summary)$/.test(tag)
      );
    }
  };
}

/**
 * Check if an element is a component, if yes return its
 * component id.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Object|undefined}
 */

function checkComponentAttr(el, options) {
  var tag = el.tagName.toLowerCase();
  var hasAttrs = el.hasAttributes();
  if (!commonTagRE.test(tag) && !reservedTagRE.test(tag)) {
    if (resolveAsset(options, 'components', tag)) {
      return { id: tag };
    } else {
      var is = hasAttrs && getIsBinding(el, options);
      if (is) {
        return is;
      } else if (process.env.NODE_ENV !== 'production') {
        var expectedTag = options._componentNameMap && options._componentNameMap[tag];
        if (expectedTag) {
          warn('Unknown custom element: <' + tag + '> - ' + 'did you mean <' + expectedTag + '>? ' + 'HTML is case-insensitive, remember to use kebab-case in templates.');
        } else if (isUnknownElement(el, tag)) {
          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.');
        }
      }
    }
  } else if (hasAttrs) {
    return getIsBinding(el, options);
  }
}

/**
 * Get "is" binding from an element.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Object|undefined}
 */

function getIsBinding(el, options) {
  // dynamic syntax
  var exp = el.getAttribute('is');
  if (exp != null) {
    if (resolveAsset(options, 'components', exp)) {
      el.removeAttribute('is');
      return { id: exp };
    }
  } else {
    exp = getBindAttr(el, 'is');
    if (exp != null) {
      return { id: exp, dynamic: true };
    }
  }
}

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 *
 * All strategy functions follow the same signature:
 *
 * @param {*} parentVal
 * @param {*} childVal
 * @param {Vue} [vm]
 */

var strats = config.optionMergeStrategies = Object.create(null);

/**
 * Helper that recursively merges two data objects together.
 */

function mergeData(to, from) {
  var key, toVal, fromVal;
  for (key in from) {
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (isObject(toVal) && isObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to;
}

/**
 * Data
 */

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }
    if (typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
      return parentVal;
    }
    if (!parentVal) {
      return childVal;
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn() {
      return mergeData(childVal.call(this), parentVal.call(this));
    };
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn() {
      // instance merge
      var instanceData = typeof childVal === 'function' ? childVal.call(vm) : childVal;
      var defaultData = typeof parentVal === 'function' ? parentVal.call(vm) : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData);
      } else {
        return defaultData;
      }
    };
  }
};

/**
 * El
 */

strats.el = function (parentVal, childVal, vm) {
  if (!vm && childVal && typeof childVal !== 'function') {
    process.env.NODE_ENV !== 'production' && warn('The "el" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
    return;
  }
  var ret = childVal || parentVal;
  // invoke the element factory if this is instance merge
  return vm && typeof ret === 'function' ? ret.call(vm) : ret;
};

/**
 * Hooks and param attributes are merged as arrays.
 */

strats.init = strats.created = strats.ready = strats.attached = strats.detached = strats.beforeCompile = strats.compiled = strats.beforeDestroy = strats.destroyed = strats.activate = function (parentVal, childVal) {
  return childVal ? parentVal ? parentVal.concat(childVal) : isArray(childVal) ? childVal : [childVal] : parentVal;
};

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

function mergeAssets(parentVal, childVal) {
  var res = Object.create(parentVal || null);
  return childVal ? extend(res, guardArrayAssets(childVal)) : res;
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Events & Watchers.
 *
 * Events & watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */

strats.watch = strats.events = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent ? parent.concat(child) : [child];
  }
  return ret;
};

/**
 * Other object hashes.
 */

strats.props = strats.methods = strats.computed = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = Object.create(null);
  extend(ret, parentVal);
  extend(ret, childVal);
  return ret;
};

/**
 * Default strategy.
 */

var defaultStrat = function defaultStrat(parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
};

/**
 * Make sure component options get converted to actual
 * constructors.
 *
 * @param {Object} options
 */

function guardComponents(options) {
  if (options.components) {
    var components = options.components = guardArrayAssets(options.components);
    var ids = Object.keys(components);
    var def;
    if (process.env.NODE_ENV !== 'production') {
      var map = options._componentNameMap = {};
    }
    for (var i = 0, l = ids.length; i < l; i++) {
      var key = ids[i];
      if (commonTagRE.test(key) || reservedTagRE.test(key)) {
        process.env.NODE_ENV !== 'production' && warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + key);
        continue;
      }
      // record a all lowercase <-> kebab-case mapping for
      // possible custom element case error warning
      if (process.env.NODE_ENV !== 'production') {
        map[key.replace(/-/g, '').toLowerCase()] = hyphenate(key);
      }
      def = components[key];
      if (isPlainObject(def)) {
        components[key] = Vue.extend(def);
      }
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 *
 * @param {Object} options
 */

function guardProps(options) {
  var props = options.props;
  var i, val;
  if (isArray(props)) {
    options.props = {};
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        options.props[val] = null;
      } else if (val.name) {
        options.props[val.name] = val;
      }
    }
  } else if (isPlainObject(props)) {
    var keys = Object.keys(props);
    i = keys.length;
    while (i--) {
      val = props[keys[i]];
      if (typeof val === 'function') {
        props[keys[i]] = { type: val };
      }
    }
  }
}

/**
 * Guard an Array-format assets option and converted it
 * into the key-value Object format.
 *
 * @param {Object|Array} assets
 * @return {Object}
 */

function guardArrayAssets(assets) {
  if (isArray(assets)) {
    var res = {};
    var i = assets.length;
    var asset;
    while (i--) {
      asset = assets[i];
      var id = typeof asset === 'function' ? asset.options && asset.options.name || asset.id : asset.name || asset.id;
      if (!id) {
        process.env.NODE_ENV !== 'production' && warn('Array-syntax assets must provide a "name" or "id" field.');
      } else {
        res[id] = asset;
      }
    }
    return res;
  }
  return assets;
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 *
 * @param {Object} parent
 * @param {Object} child
 * @param {Vue} [vm] - if vm is present, indicates this is
 *                     an instantiation merge.
 */

function mergeOptions(parent, child, vm) {
  guardComponents(child);
  guardProps(child);
  if (process.env.NODE_ENV !== 'production') {
    if (child.propsData && !vm) {
      warn('propsData can only be used as an instantiation option.');
    }
  }
  var options = {};
  var key;
  if (child['extends']) {
    parent = typeof child['extends'] === 'function' ? mergeOptions(parent, child['extends'].options, vm) : mergeOptions(parent, child['extends'], vm);
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      var mixin = child.mixins[i];
      var mixinOptions = mixin.prototype instanceof Vue ? mixin.options : mixin;
      parent = mergeOptions(parent, mixinOptions, vm);
    }
  }
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options;
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 *
 * @param {Object} options
 * @param {String} type
 * @param {String} id
 * @param {Boolean} warnMissing
 * @return {Object|Function}
 */

function resolveAsset(options, type, id, warnMissing) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return;
  }
  var assets = options[type];
  var camelizedId;
  var res = assets[id] ||
  // camelCase ID
  assets[camelizedId = camelize(id)] ||
  // Pascal Case ID
  assets[camelizedId.charAt(0).toUpperCase() + camelizedId.slice(1)];
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
  }
  return res;
}

var uid$1 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 *
 * @constructor
 */
function Dep() {
  this.id = uid$1++;
  this.subs = [];
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
};

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.removeSub = function (sub) {
  this.subs.$remove(sub);
};

/**
 * Add self as a dependency to the target watcher.
 */

Dep.prototype.depend = function () {
  Dep.target.addDep(this);
};

/**
 * Notify all subscribers of a new value.
 */

Dep.prototype.notify = function () {
  // stablize the subscriber list first
  var subs = toArray(this.subs);
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
        inserted = args;
        break;
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 *
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */

def(arrayProto, '$set', function $set(index, val) {
  if (index >= this.length) {
    this.length = Number(index) + 1;
  }
  return this.splice(index, 1, val)[0];
});

/**
 * Convenience method to remove the element at given index or target element reference.
 *
 * @param {*} item
 */

def(arrayProto, '$remove', function $remove(item) {
  /* istanbul ignore if */
  if (!this.length) return;
  var index = indexOf(this, item);
  if (index > -1) {
    return this.splice(index, 1);
  }
});

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However in certain cases, e.g.
 * v-for scope alias and props, we don't want to force conversion
 * because the value may be a nested value under a frozen data structure.
 *
 * So whenever we want to set a reactive property without forcing
 * conversion on the new value, we wrap that call inside this function.
 */

var shouldConvert = true;

function withoutConversion(fn) {
  shouldConvert = false;
  fn();
  shouldConvert = true;
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 *
 * @param {Array|Object} value
 * @constructor
 */

function Observer(value) {
  this.value = value;
  this.dep = new Dep();
  def(value, '__ob__', this);
  if (isArray(value)) {
    var augment = hasProto ? protoAugment : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
}

// Instance methods

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 *
 * @param {Object} obj
 */

Observer.prototype.walk = function (obj) {
  var keys = Object.keys(obj);
  for (var i = 0, l = keys.length; i < l; i++) {
    this.convert(keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 *
 * @param {Array} items
 */

Observer.prototype.observeArray = function (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

/**
 * Convert a property into getter/setter so we can emit
 * the events when the property is accessed/changed.
 *
 * @param {String} key
 * @param {*} val
 */

Observer.prototype.convert = function (key, val) {
  defineReactive(this.value, key, val);
};

/**
 * Add an owner vm, so that when $set/$delete mutations
 * happen we can notify owner vms to proxy the keys and
 * digest the watchers. This is only called when the object
 * is observed as an instance's root $data.
 *
 * @param {Vue} vm
 */

Observer.prototype.addVm = function (vm) {
  (this.vms || (this.vms = [])).push(vm);
};

/**
 * Remove an owner vm. This is called when the object is
 * swapped out as an instance's $data object.
 *
 * @param {Vue} vm
 */

Observer.prototype.removeVm = function (vm) {
  this.vms.$remove(vm);
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 *
 * @param {Object|Array} target
 * @param {Object} src
 */

function protoAugment(target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function copyAugment(target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * @param {*} value
 * @param {Vue} [vm]
 * @return {Observer|undefined}
 * @static
 */

function observe(value, vm) {
  if (!value || typeof value !== 'object') {
    return;
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (shouldConvert && (isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }
  if (ob && vm) {
    ob.addVm(vm);
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 */

function defineReactive(obj, key, val) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;

  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (isArray(value)) {
          for (var e, i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (newVal === value) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  });
}



var util = Object.freeze({
	defineReactive: defineReactive,
	set: set,
	del: del,
	hasOwn: hasOwn,
	isLiteral: isLiteral,
	isReserved: isReserved,
	_toString: _toString,
	toNumber: toNumber,
	toBoolean: toBoolean,
	stripQuotes: stripQuotes,
	camelize: camelize,
	hyphenate: hyphenate,
	classify: classify,
	bind: bind,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	def: def,
	debounce: _debounce,
	indexOf: indexOf,
	cancellable: cancellable,
	looseEqual: looseEqual,
	isArray: isArray,
	hasProto: hasProto,
	inBrowser: inBrowser,
	devtools: devtools,
	isIE: isIE,
	isIE9: isIE9,
	isAndroid: isAndroid,
	isIos: isIos,
	iosVersionMatch: iosVersionMatch,
	iosVersion: iosVersion,
	hasMutationObserverBug: hasMutationObserverBug,
	get transitionProp () { return transitionProp; },
	get transitionEndEvent () { return transitionEndEvent; },
	get animationProp () { return animationProp; },
	get animationEndEvent () { return animationEndEvent; },
	nextTick: nextTick,
	get _Set () { return _Set; },
	query: query,
	inDoc: inDoc,
	getAttr: getAttr,
	getBindAttr: getBindAttr,
	hasBindAttr: hasBindAttr,
	before: before,
	after: after,
	remove: remove,
	prepend: prepend,
	replace: replace,
	on: on,
	off: off,
	setClass: setClass,
	addClass: addClass,
	removeClass: removeClass,
	extractContent: extractContent,
	trimNode: trimNode,
	isTemplate: isTemplate,
	createAnchor: createAnchor,
	findRef: findRef,
	mapNodeRange: mapNodeRange,
	removeNodeRange: removeNodeRange,
	isFragment: isFragment,
	getOuterHTML: getOuterHTML,
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	checkComponentAttr: checkComponentAttr,
	commonTagRE: commonTagRE,
	reservedTagRE: reservedTagRE,
	get warn () { return warn; }
});

var uid = 0;

function initMixin (Vue) {
  /**
   * The main init sequence. This is called for every
   * instance, including ones that are created from extended
   * constructors.
   *
   * @param {Object} options - this options object should be
   *                           the result of merging class
   *                           options and the options passed
   *                           in to the constructor.
   */

  Vue.prototype._init = function (options) {
    options = options || {};

    this.$el = null;
    this.$parent = options.parent;
    this.$root = this.$parent ? this.$parent.$root : this;
    this.$children = [];
    this.$refs = {}; // child vm references
    this.$els = {}; // element references
    this._watchers = []; // all watchers as an array
    this._directives = []; // all directives

    // a uid
    this._uid = uid++;

    // a flag to avoid this being observed
    this._isVue = true;

    // events bookkeeping
    this._events = {}; // registered callbacks
    this._eventsCount = {}; // for $broadcast optimization

    // fragment instance properties
    this._isFragment = false;
    this._fragment = // @type {DocumentFragment}
    this._fragmentStart = // @type {Text|Comment}
    this._fragmentEnd = null; // @type {Text|Comment}

    // lifecycle state
    this._isCompiled = this._isDestroyed = this._isReady = this._isAttached = this._isBeingDestroyed = this._vForRemoving = false;
    this._unlinkFn = null;

    // context:
    // if this is a transcluded component, context
    // will be the common parent vm of this instance
    // and its host.
    this._context = options._context || this.$parent;

    // scope:
    // if this is inside an inline v-for, the scope
    // will be the intermediate scope created for this
    // repeat fragment. this is used for linking props
    // and container directives.
    this._scope = options._scope;

    // fragment:
    // if this instance is compiled inside a Fragment, it
    // needs to reigster itself as a child of that fragment
    // for attach/detach to work properly.
    this._frag = options._frag;
    if (this._frag) {
      this._frag.children.push(this);
    }

    // push self into parent / transclusion host
    if (this.$parent) {
      this.$parent.$children.push(this);
    }

    // merge options.
    options = this.$options = mergeOptions(this.constructor.options, options, this);

    // set ref
    this._updateRef();

    // initialize data as empty object.
    // it will be filled up in _initData().
    this._data = {};

    // call init hook
    this._callHook('init');

    // initialize data observation and scope inheritance.
    this._initState();

    // setup event system and option events.
    this._initEvents();

    // call created hook
    this._callHook('created');

    // if `el` option is passed, start compilation.
    if (options.el) {
      this.$mount(options.el);
    }
  };
}

var pathCache = new Cache(1000);

// actions
var APPEND = 0;
var PUSH = 1;
var INC_SUB_PATH_DEPTH = 2;
var PUSH_SUB_PATH = 3;

// states
var BEFORE_PATH = 0;
var IN_PATH = 1;
var BEFORE_IDENT = 2;
var IN_IDENT = 3;
var IN_SUB_PATH = 4;
var IN_SINGLE_QUOTE = 5;
var IN_DOUBLE_QUOTE = 6;
var AFTER_PATH = 7;
var ERROR = 8;

var pathStateMachine = [];

pathStateMachine[BEFORE_PATH] = {
  'ws': [BEFORE_PATH],
  'ident': [IN_IDENT, APPEND],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[IN_PATH] = {
  'ws': [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[BEFORE_IDENT] = {
  'ws': [BEFORE_IDENT],
  'ident': [IN_IDENT, APPEND]
};

pathStateMachine[IN_IDENT] = {
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND],
  'ws': [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [IN_SUB_PATH, PUSH],
  'eof': [AFTER_PATH, PUSH]
};

pathStateMachine[IN_SUB_PATH] = {
  "'": [IN_SINGLE_QUOTE, APPEND],
  '"': [IN_DOUBLE_QUOTE, APPEND],
  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
  ']': [IN_PATH, PUSH_SUB_PATH],
  'eof': ERROR,
  'else': [IN_SUB_PATH, APPEND]
};

pathStateMachine[IN_SINGLE_QUOTE] = {
  "'": [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_SINGLE_QUOTE, APPEND]
};

pathStateMachine[IN_DOUBLE_QUOTE] = {
  '"': [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_DOUBLE_QUOTE, APPEND]
};

/**
 * Determine the type of a character in a keypath.
 *
 * @param {Char} ch
 * @return {String} type
 */

function getPathCharType(ch) {
  if (ch === undefined) {
    return 'eof';
  }

  var code = ch.charCodeAt(0);

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30:
      // 0
      return ch;

    case 0x5F: // _
    case 0x24:
      // $
      return 'ident';

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0: // No-break space
    case 0xFEFF: // Byte Order Mark
    case 0x2028: // Line Separator
    case 0x2029:
      // Paragraph Separator
      return 'ws';
  }

  // a-z, A-Z
  if (code >= 0x61 && code <= 0x7A || code >= 0x41 && code <= 0x5A) {
    return 'ident';
  }

  // 1-9
  if (code >= 0x31 && code <= 0x39) {
    return 'number';
  }

  return 'else';
}

/**
 * Format a subPath, return its plain form if it is
 * a literal string or number. Otherwise prepend the
 * dynamic indicator (*).
 *
 * @param {String} path
 * @return {String}
 */

function formatSubPath(path) {
  var trimmed = path.trim();
  // invalid leading 0
  if (path.charAt(0) === '0' && isNaN(path)) {
    return false;
  }
  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed;
}

/**
 * Parse a string path into an array of segments
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parse(path) {
  var keys = [];
  var index = -1;
  var mode = BEFORE_PATH;
  var subPathDepth = 0;
  var c, newChar, key, type, transition, action, typeMap;

  var actions = [];

  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key);
      key = undefined;
    }
  };

  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar;
    } else {
      key += newChar;
    }
  };

  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]();
    subPathDepth++;
  };

  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = IN_SUB_PATH;
      actions[APPEND]();
    } else {
      subPathDepth = 0;
      key = formatSubPath(key);
      if (key === false) {
        return false;
      } else {
        actions[PUSH]();
      }
    }
  };

  function maybeUnescapeQuote() {
    var nextChar = path[index + 1];
    if (mode === IN_SINGLE_QUOTE && nextChar === "'" || mode === IN_DOUBLE_QUOTE && nextChar === '"') {
      index++;
      newChar = '\\' + nextChar;
      actions[APPEND]();
      return true;
    }
  }

  while (mode != null) {
    index++;
    c = path[index];

    if (c === '\\' && maybeUnescapeQuote()) {
      continue;
    }

    type = getPathCharType(c);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap['else'] || ERROR;

    if (transition === ERROR) {
      return; // parse error
    }

    mode = transition[0];
    action = actions[transition[1]];
    if (action) {
      newChar = transition[2];
      newChar = newChar === undefined ? c : newChar;
      if (action() === false) {
        return;
      }
    }

    if (mode === AFTER_PATH) {
      keys.raw = path;
      return keys;
    }
  }
}

/**
 * External parse that check for a cache hit first
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parsePath(path) {
  var hit = pathCache.get(path);
  if (!hit) {
    hit = parse(path);
    if (hit) {
      pathCache.put(path, hit);
    }
  }
  return hit;
}

/**
 * Get from an object from a path string
 *
 * @param {Object} obj
 * @param {String} path
 */

function getPath(obj, path) {
  return parseExpression(path).get(obj);
}

/**
 * Warn against setting non-existent root path on a vm.
 */

var warnNonExistent;
if (process.env.NODE_ENV !== 'production') {
  warnNonExistent = function (path, vm) {
    warn('You are setting a non-existent path "' + path.raw + '" ' + 'on a vm instance. Consider pre-initializing the property ' + 'with the "data" option for more reliable reactivity ' + 'and better performance.', vm);
  };
}

/**
 * Set on an object from a path
 *
 * @param {Object} obj
 * @param {String | Array} path
 * @param {*} val
 */

function setPath(obj, path, val) {
  var original = obj;
  if (typeof path === 'string') {
    path = parse(path);
  }
  if (!path || !isObject(obj)) {
    return false;
  }
  var last, key;
  for (var i = 0, l = path.length; i < l; i++) {
    last = obj;
    key = path[i];
    if (key.charAt(0) === '*') {
      key = parseExpression(key.slice(1)).get.call(original, original);
    }
    if (i < l - 1) {
      obj = obj[key];
      if (!isObject(obj)) {
        obj = {};
        if (process.env.NODE_ENV !== 'production' && last._isVue) {
          warnNonExistent(path, last);
        }
        set(last, key, obj);
      }
    } else {
      if (isArray(obj)) {
        obj.$set(key, val);
      } else if (key in obj) {
        obj[key] = val;
      } else {
        if (process.env.NODE_ENV !== 'production' && obj._isVue) {
          warnNonExistent(path, obj);
        }
        set(obj, key, val);
      }
    }
  }
  return true;
}

var path = Object.freeze({
  parsePath: parsePath,
  getPath: getPath,
  setPath: setPath
});

var expressionCache = new Cache(1000);

var allowedKeywords = 'Math,Date,this,true,false,null,undefined,Infinity,NaN,' + 'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' + 'encodeURIComponent,parseInt,parseFloat';
var allowedKeywordsRE = new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)');

// keywords that don't make sense inside expressions
var improperKeywords = 'break,case,class,catch,const,continue,debugger,default,' + 'delete,do,else,export,extends,finally,for,function,if,' + 'import,in,instanceof,let,return,super,switch,throw,try,' + 'var,while,with,yield,enum,await,implements,package,' + 'protected,static,interface,private,public';
var improperKeywordsRE = new RegExp('^(' + improperKeywords.replace(/,/g, '\\b|') + '\\b)');

var wsRE = /\s/g;
var newlineRE = /\n/g;
var saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g;
var restoreRE = /"(\d+)"/g;
var pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;
var identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g;
var literalValueRE$1 = /^(?:true|false|null|undefined|Infinity|NaN)$/;

function noop() {}

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

var saved = [];

/**
 * Save replacer
 *
 * The save regex can match two possible cases:
 * 1. An opening object literal
 * 2. A string
 * If matched as a plain string, we need to escape its
 * newlines, since the string needs to be preserved when
 * generating the function body.
 *
 * @param {String} str
 * @param {String} isString - str if matched as a string
 * @return {String} - placeholder with index
 */

function save(str, isString) {
  var i = saved.length;
  saved[i] = isString ? str.replace(newlineRE, '\\n') : str;
  return '"' + i + '"';
}

/**
 * Path rewrite replacer
 *
 * @param {String} raw
 * @return {String}
 */

function rewrite(raw) {
  var c = raw.charAt(0);
  var path = raw.slice(1);
  if (allowedKeywordsRE.test(path)) {
    return raw;
  } else {
    path = path.indexOf('"') > -1 ? path.replace(restoreRE, restore) : path;
    return c + 'scope.' + path;
  }
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore(str, i) {
  return saved[i];
}

/**
 * Rewrite an expression, prefixing all path accessors with
 * `scope.` and generate getter/setter functions.
 *
 * @param {String} exp
 * @return {Function}
 */

function compileGetter(exp) {
  if (improperKeywordsRE.test(exp)) {
    process.env.NODE_ENV !== 'production' && warn('Avoid using reserved keywords in expression: ' + exp);
  }
  // reset state
  saved.length = 0;
  // save strings and object literal keys
  var body = exp.replace(saveRE, save).replace(wsRE, '');
  // rewrite all paths
  // pad 1 space here because the regex matches 1 extra char
  body = (' ' + body).replace(identRE, rewrite).replace(restoreRE, restore);
  return makeGetterFn(body);
}

/**
 * Build a getter function. Requires eval.
 *
 * We isolate the try/catch so it doesn't affect the
 * optimization of the parse function when it is not called.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeGetterFn(body) {
  try {
    /* eslint-disable no-new-func */
    return new Function('scope', 'return ' + body + ';');
    /* eslint-enable no-new-func */
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if (e.toString().match(/unsafe-eval|CSP/)) {
        warn('It seems you are using the default build of Vue.js in an environment ' + 'with Content Security Policy that prohibits unsafe-eval. ' + 'Use the CSP-compliant build instead: ' + 'http://vuejs.org/guide/installation.html#CSP-compliant-build');
      } else {
        warn('Invalid expression. ' + 'Generated function body: ' + body);
      }
    }
    return noop;
  }
}

/**
 * Compile a setter function for the expression.
 *
 * @param {String} exp
 * @return {Function|undefined}
 */

function compileSetter(exp) {
  var path = parsePath(exp);
  if (path) {
    return function (scope, val) {
      setPath(scope, path, val);
    };
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid setter expression: ' + exp);
  }
}

/**
 * Parse an expression into re-written getter/setters.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

function parseExpression(exp, needSet) {
  exp = exp.trim();
  // try cache
  var hit = expressionCache.get(exp);
  if (hit) {
    if (needSet && !hit.set) {
      hit.set = compileSetter(hit.exp);
    }
    return hit;
  }
  var res = { exp: exp };
  res.get = isSimplePath(exp) && exp.indexOf('[') < 0
  // optimized super simple getter
  ? makeGetterFn('scope.' + exp)
  // dynamic getter
  : compileGetter(exp);
  if (needSet) {
    res.set = compileSetter(exp);
  }
  expressionCache.put(exp, res);
  return res;
}

/**
 * Check if an expression is a simple path.
 *
 * @param {String} exp
 * @return {Boolean}
 */

function isSimplePath(exp) {
  return pathTestRE.test(exp) &&
  // don't treat literal values as paths
  !literalValueRE$1.test(exp) &&
  // Math constants e.g. Math.PI, Math.E etc.
  exp.slice(0, 5) !== 'Math.';
}

var expression = Object.freeze({
  parseExpression: parseExpression,
  isSimplePath: isSimplePath
});

// we have two separate queues: one for directive updates
// and one for user watcher registered via $watch().
// we want to guarantee directive updates to be called
// before user watchers so that when user watchers are
// triggered, the DOM would have already been in updated
// state.

var queue = [];
var userQueue = [];
var has = {};
var circular = {};
var waiting = false;

/**
 * Reset the batcher's state.
 */

function resetBatcherState() {
  queue.length = 0;
  userQueue.length = 0;
  has = {};
  circular = {};
  waiting = false;
}

/**
 * Flush both queues and run the watchers.
 */

function flushBatcherQueue() {
  var _again = true;

  _function: while (_again) {
    _again = false;

    runBatcherQueue(queue);
    runBatcherQueue(userQueue);
    // user watchers triggered more watchers,
    // keep flushing until it depletes
    if (queue.length) {
      _again = true;
      continue _function;
    }
    // dev tool hook
    /* istanbul ignore if */
    if (devtools && config.devtools) {
      devtools.emit('flush');
    }
    resetBatcherState();
  }
}

/**
 * Run the watchers in a single queue.
 *
 * @param {Array} queue
 */

function runBatcherQueue(queue) {
  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (var i = 0; i < queue.length; i++) {
    var watcher = queue[i];
    var id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > config._maxUpdateCount) {
        warn('You may have an infinite update loop for watcher ' + 'with expression "' + watcher.expression + '"', watcher.vm);
        break;
      }
    }
  }
  queue.length = 0;
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Watcher} watcher
 *   properties:
 *   - {Number} id
 *   - {Function} run
 */

function pushWatcher(watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    // push watcher into appropriate queue
    var q = watcher.user ? userQueue : queue;
    has[id] = q.length;
    q.push(watcher);
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushBatcherQueue);
    }
  }
}

var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String|Function} expOrFn
 * @param {Function} cb
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoWay
 *                 - {Boolean} deep
 *                 - {Boolean} user
 *                 - {Boolean} sync
 *                 - {Boolean} lazy
 *                 - {Function} [preProcess]
 *                 - {Function} [postProcess]
 * @constructor
 */
function Watcher(vm, expOrFn, cb, options) {
  // mix in options
  if (options) {
    extend(this, options);
  }
  var isFn = typeof expOrFn === 'function';
  this.vm = vm;
  vm._watchers.push(this);
  this.expression = expOrFn;
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.prevError = null; // for async error stacks
  // parse expression for getter/setter
  if (isFn) {
    this.getter = expOrFn;
    this.setter = undefined;
  } else {
    var res = parseExpression(expOrFn, this.twoWay);
    this.getter = res.get;
    this.setter = res.set;
  }
  this.value = this.lazy ? undefined : this.get();
  // state for avoiding false triggers for deep and Array
  // watchers during vm._digest()
  this.queued = this.shallow = false;
}

/**
 * Evaluate the getter, and re-collect dependencies.
 */

Watcher.prototype.get = function () {
  this.beforeGet();
  var scope = this.scope || this.vm;
  var value;
  try {
    value = this.getter.call(scope, scope);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating expression ' + '"' + this.expression + '": ' + e.toString(), this.vm);
    }
  }
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value);
  }
  if (this.preProcess) {
    value = this.preProcess(value);
  }
  if (this.filters) {
    value = scope._applyFilters(value, null, this.filters, false);
  }
  if (this.postProcess) {
    value = this.postProcess(value);
  }
  this.afterGet();
  return value;
};

/**
 * Set the corresponding value with the setter.
 *
 * @param {*} value
 */

Watcher.prototype.set = function (value) {
  var scope = this.scope || this.vm;
  if (this.filters) {
    value = scope._applyFilters(value, this.value, this.filters, true);
  }
  try {
    this.setter.call(scope, scope, value);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating setter ' + '"' + this.expression + '": ' + e.toString(), this.vm);
    }
  }
  // two-way sync for v-for alias
  var forContext = scope.$forContext;
  if (forContext && forContext.alias === this.expression) {
    if (forContext.filters) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using two-way binding on ' + 'a v-for alias (' + this.expression + '), and the ' + 'v-for has filters. This will not work properly. ' + 'Either remove the filters or use an array of ' + 'objects and bind to object properties instead.', this.vm);
      return;
    }
    forContext._withLock(function () {
      if (scope.$key) {
        // original is an object
        forContext.rawValue[scope.$key] = value;
      } else {
        forContext.rawValue.$set(scope.$index, value);
      }
    });
  }
};

/**
 * Prepare for dependency collection.
 */

Watcher.prototype.beforeGet = function () {
  Dep.target = this;
};

/**
 * Add a dependency to this directive.
 *
 * @param {Dep} dep
 */

Watcher.prototype.addDep = function (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */

Watcher.prototype.afterGet = function () {
  Dep.target = null;
  var i = this.deps.length;
  while (i--) {
    var dep = this.deps[i];
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 *
 * @param {Boolean} shallow
 */

Watcher.prototype.update = function (shallow) {
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync || !config.async) {
    this.run();
  } else {
    // if queued, only overwrite shallow with non-shallow,
    // but not the other way around.
    this.shallow = this.queued ? shallow ? this.shallow : false : !!shallow;
    this.queued = true;
    // record before-push error stack in debug mode
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.debug) {
      this.prevError = new Error('[vue] async stack trace');
    }
    pushWatcher(this);
  }
};

/**
 * Batcher job interface.
 * Will be called by the batcher.
 */

Watcher.prototype.run = function () {
  if (this.active) {
    var value = this.get();
    if (value !== this.value ||
    // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated; but only do so if this is a
    // non-shallow update (caused by a vm digest).
    (isObject(value) || this.deep) && !this.shallow) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      // in debug + async mode, when a watcher callbacks
      // throws, we also throw the saved before-push error
      // so the full cross-tick stack trace is available.
      var prevError = this.prevError;
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.debug && prevError) {
        this.prevError = null;
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          nextTick(function () {
            throw prevError;
          }, 0);
          throw e;
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
    this.queued = this.shallow = false;
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */

Watcher.prototype.evaluate = function () {
  // avoid overwriting another watcher that is being
  // collected.
  var current = Dep.target;
  this.value = this.get();
  this.dirty = false;
  Dep.target = current;
};

/**
 * Depend on all deps collected by this watcher.
 */

Watcher.prototype.depend = function () {
  var i = this.deps.length;
  while (i--) {
    this.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subcriber list.
 */

Watcher.prototype.teardown = function () {
  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed or is performing a v-for
    // re-render (the watcher list is then filtered by v-for).
    if (!this.vm._isBeingDestroyed && !this.vm._vForRemoving) {
      this.vm._watchers.$remove(this);
    }
    var i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
    this.active = false;
    this.vm = this.cb = this.value = null;
  }
};

/**
 * Recrusively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 *
 * @param {*} val
 */

var seenObjects = new _Set();
function traverse(val, seen) {
  var i = undefined,
      keys = undefined;
  if (!seen) {
    seen = seenObjects;
    seen.clear();
  }
  var isA = isArray(val);
  var isO = isObject(val);
  if ((isA || isO) && Object.isExtensible(val)) {
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return;
      } else {
        seen.add(depId);
      }
    }
    if (isA) {
      i = val.length;
      while (i--) traverse(val[i], seen);
    } else if (isO) {
      keys = Object.keys(val);
      i = keys.length;
      while (i--) traverse(val[keys[i]], seen);
    }
  }
}

var text$1 = {

  bind: function bind() {
    this.attr = this.el.nodeType === 3 ? 'data' : 'textContent';
  },

  update: function update(value) {
    this.el[this.attr] = _toString(value);
  }
};

var templateCache = new Cache(1000);
var idSelectorCache = new Cache(1000);

var map = {
  efault: [0, '', ''],
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>']
};

map.td = map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option = map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead = map.tbody = map.colgroup = map.caption = map.tfoot = [1, '<table>', '</table>'];

map.g = map.defs = map.symbol = map.use = map.image = map.text = map.circle = map.ellipse = map.line = map.path = map.polygon = map.polyline = map.rect = [1, '<svg ' + 'xmlns="http://www.w3.org/2000/svg" ' + 'xmlns:xlink="http://www.w3.org/1999/xlink" ' + 'xmlns:ev="http://www.w3.org/2001/xml-events"' + 'version="1.1">', '</svg>'];

/**
 * Check if a node is a supported template node with a
 * DocumentFragment content.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function isRealTemplate(node) {
  return isTemplate(node) && isFragment(node.content);
}

var tagRE$1 = /<([\w:-]+)/;
var entityRE = /&#?\w+?;/;
var commentRE = /<!--/;

/**
 * Convert a string template to a DocumentFragment.
 * Determines correct wrapping by tag types. Wrapping
 * strategy found in jQuery & component/domify.
 *
 * @param {String} templateString
 * @param {Boolean} raw
 * @return {DocumentFragment}
 */

function stringToFragment(templateString, raw) {
  // try a cache hit first
  var cacheKey = raw ? templateString : templateString.trim();
  var hit = templateCache.get(cacheKey);
  if (hit) {
    return hit;
  }

  var frag = document.createDocumentFragment();
  var tagMatch = templateString.match(tagRE$1);
  var entityMatch = entityRE.test(templateString);
  var commentMatch = commentRE.test(templateString);

  if (!tagMatch && !entityMatch && !commentMatch) {
    // text only, return a single text node.
    frag.appendChild(document.createTextNode(templateString));
  } else {
    var tag = tagMatch && tagMatch[1];
    var wrap = map[tag] || map.efault;
    var depth = wrap[0];
    var prefix = wrap[1];
    var suffix = wrap[2];
    var node = document.createElement('div');

    node.innerHTML = prefix + templateString + suffix;
    while (depth--) {
      node = node.lastChild;
    }

    var child;
    /* eslint-disable no-cond-assign */
    while (child = node.firstChild) {
      /* eslint-enable no-cond-assign */
      frag.appendChild(child);
    }
  }
  if (!raw) {
    trimNode(frag);
  }
  templateCache.put(cacheKey, frag);
  return frag;
}

/**
 * Convert a template node to a DocumentFragment.
 *
 * @param {Node} node
 * @return {DocumentFragment}
 */

function nodeToFragment(node) {
  // if its a template tag and the browser supports it,
  // its content is already a document fragment. However, iOS Safari has
  // bug when using directly cloned template content with touch
  // events and can cause crashes when the nodes are removed from DOM, so we
  // have to treat template elements as string templates. (#2805)
  /* istanbul ignore if */
  if (isRealTemplate(node)) {
    return stringToFragment(node.innerHTML);
  }
  // script template
  if (node.tagName === 'SCRIPT') {
    return stringToFragment(node.textContent);
  }
  // normal node, clone it to avoid mutating the original
  var clonedNode = cloneNode(node);
  var frag = document.createDocumentFragment();
  var child;
  /* eslint-disable no-cond-assign */
  while (child = clonedNode.firstChild) {
    /* eslint-enable no-cond-assign */
    frag.appendChild(child);
  }
  trimNode(frag);
  return frag;
}

// Test for the presence of the Safari template cloning bug
// https://bugs.webkit.org/showug.cgi?id=137755
var hasBrokenTemplate = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var a = document.createElement('div');
    a.innerHTML = '<template>1</template>';
    return !a.cloneNode(true).firstChild.innerHTML;
  } else {
    return false;
  }
})();

// Test for IE10/11 textarea placeholder clone bug
var hasTextareaCloneBug = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var t = document.createElement('textarea');
    t.placeholder = 't';
    return t.cloneNode(true).value === 't';
  } else {
    return false;
  }
})();

/**
 * 1. Deal with Safari cloning nested <template> bug by
 *    manually cloning all template instances.
 * 2. Deal with IE10/11 textarea placeholder bug by setting
 *    the correct value after cloning.
 *
 * @param {Element|DocumentFragment} node
 * @return {Element|DocumentFragment}
 */

function cloneNode(node) {
  /* istanbul ignore if */
  if (!node.querySelectorAll) {
    return node.cloneNode();
  }
  var res = node.cloneNode(true);
  var i, original, cloned;
  /* istanbul ignore if */
  if (hasBrokenTemplate) {
    var tempClone = res;
    if (isRealTemplate(node)) {
      node = node.content;
      tempClone = res.content;
    }
    original = node.querySelectorAll('template');
    if (original.length) {
      cloned = tempClone.querySelectorAll('template');
      i = cloned.length;
      while (i--) {
        cloned[i].parentNode.replaceChild(cloneNode(original[i]), cloned[i]);
      }
    }
  }
  /* istanbul ignore if */
  if (hasTextareaCloneBug) {
    if (node.tagName === 'TEXTAREA') {
      res.value = node.value;
    } else {
      original = node.querySelectorAll('textarea');
      if (original.length) {
        cloned = res.querySelectorAll('textarea');
        i = cloned.length;
        while (i--) {
          cloned[i].value = original[i].value;
        }
      }
    }
  }
  return res;
}

/**
 * Process the template option and normalizes it into a
 * a DocumentFragment that can be used as a partial or a
 * instance template.
 *
 * @param {*} template
 *        Possible values include:
 *        - DocumentFragment object
 *        - Node object of type Template
 *        - id selector: '#some-template-id'
 *        - template string: '<div><span>{{msg}}</span></div>'
 * @param {Boolean} shouldClone
 * @param {Boolean} raw
 *        inline HTML interpolation. Do not check for id
 *        selector and keep whitespace in the string.
 * @return {DocumentFragment|undefined}
 */

function parseTemplate(template, shouldClone, raw) {
  var node, frag;

  // if the template is already a document fragment,
  // do nothing
  if (isFragment(template)) {
    trimNode(template);
    return shouldClone ? cloneNode(template) : template;
  }

  if (typeof template === 'string') {
    // id selector
    if (!raw && template.charAt(0) === '#') {
      // id selector can be cached too
      frag = idSelectorCache.get(template);
      if (!frag) {
        node = document.getElementById(template.slice(1));
        if (node) {
          frag = nodeToFragment(node);
          // save selector to cache
          idSelectorCache.put(template, frag);
        }
      }
    } else {
      // normal string template
      frag = stringToFragment(template, raw);
    }
  } else if (template.nodeType) {
    // a direct node
    frag = nodeToFragment(template);
  }

  return frag && shouldClone ? cloneNode(frag) : frag;
}

var template = Object.freeze({
  cloneNode: cloneNode,
  parseTemplate: parseTemplate
});

var html = {

  bind: function bind() {
    // a comment node means this is a binding for
    // {{{ inline unescaped html }}}
    if (this.el.nodeType === 8) {
      // hold nodes
      this.nodes = [];
      // replace the placeholder with proper anchor
      this.anchor = createAnchor('v-html');
      replace(this.el, this.anchor);
    }
  },

  update: function update(value) {
    value = _toString(value);
    if (this.nodes) {
      this.swap(value);
    } else {
      this.el.innerHTML = value;
    }
  },

  swap: function swap(value) {
    // remove old nodes
    var i = this.nodes.length;
    while (i--) {
      remove(this.nodes[i]);
    }
    // convert new value to a fragment
    // do not attempt to retrieve from id selector
    var frag = parseTemplate(value, true, true);
    // save a reference to these nodes so we can remove later
    this.nodes = toArray(frag.childNodes);
    before(frag, this.anchor);
  }
};

/**
 * Abstraction for a partially-compiled fragment.
 * Can optionally compile content with a child scope.
 *
 * @param {Function} linker
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Vue} [host]
 * @param {Object} [scope]
 * @param {Fragment} [parentFrag]
 */
function Fragment(linker, vm, frag, host, scope, parentFrag) {
  this.children = [];
  this.childFrags = [];
  this.vm = vm;
  this.scope = scope;
  this.inserted = false;
  this.parentFrag = parentFrag;
  if (parentFrag) {
    parentFrag.childFrags.push(this);
  }
  this.unlink = linker(vm, frag, host, scope, this);
  var single = this.single = frag.childNodes.length === 1 &&
  // do not go single mode if the only node is an anchor
  !frag.childNodes[0].__v_anchor;
  if (single) {
    this.node = frag.childNodes[0];
    this.before = singleBefore;
    this.remove = singleRemove;
  } else {
    this.node = createAnchor('fragment-start');
    this.end = createAnchor('fragment-end');
    this.frag = frag;
    prepend(this.node, frag);
    frag.appendChild(this.end);
    this.before = multiBefore;
    this.remove = multiRemove;
  }
  this.node.__v_frag = this;
}

/**
 * Call attach/detach for all components contained within
 * this fragment. Also do so recursively for all child
 * fragments.
 *
 * @param {Function} hook
 */

Fragment.prototype.callHook = function (hook) {
  var i, l;
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    this.childFrags[i].callHook(hook);
  }
  for (i = 0, l = this.children.length; i < l; i++) {
    hook(this.children[i]);
  }
};

/**
 * Insert fragment before target, single node version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function singleBefore(target, withTransition) {
  this.inserted = true;
  var method = withTransition !== false ? beforeWithTransition : before;
  method(this.node, target, this.vm);
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, single node version
 */

function singleRemove() {
  this.inserted = false;
  var shouldCallRemove = inDoc(this.node);
  var self = this;
  this.beforeRemove();
  removeWithTransition(this.node, this.vm, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Insert fragment before target, multi-nodes version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function multiBefore(target, withTransition) {
  this.inserted = true;
  var vm = this.vm;
  var method = withTransition !== false ? beforeWithTransition : before;
  mapNodeRange(this.node, this.end, function (node) {
    method(node, target, vm);
  });
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, multi-nodes version
 */

function multiRemove() {
  this.inserted = false;
  var self = this;
  var shouldCallRemove = inDoc(this.node);
  this.beforeRemove();
  removeNodeRange(this.node, this.end, this.vm, this.frag, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Prepare the fragment for removal.
 */

Fragment.prototype.beforeRemove = function () {
  var i, l;
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    // call the same method recursively on child
    // fragments, depth-first
    this.childFrags[i].beforeRemove(false);
  }
  for (i = 0, l = this.children.length; i < l; i++) {
    // Call destroy for all contained instances,
    // with remove:false and defer:true.
    // Defer is necessary because we need to
    // keep the children to call detach hooks
    // on them.
    this.children[i].$destroy(false, true);
  }
  var dirs = this.unlink.dirs;
  for (i = 0, l = dirs.length; i < l; i++) {
    // disable the watchers on all the directives
    // so that the rendered content stays the same
    // during removal.
    dirs[i]._watcher && dirs[i]._watcher.teardown();
  }
};

/**
 * Destroy the fragment.
 */

Fragment.prototype.destroy = function () {
  if (this.parentFrag) {
    this.parentFrag.childFrags.$remove(this);
  }
  this.node.__v_frag = null;
  this.unlink();
};

/**
 * Call attach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function attach(child) {
  if (!child._isAttached && inDoc(child.$el)) {
    child._callHook('attached');
  }
}

/**
 * Call detach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function detach(child) {
  if (child._isAttached && !inDoc(child.$el)) {
    child._callHook('detached');
  }
}

var linkerCache = new Cache(5000);

/**
 * A factory that can be used to create instances of a
 * fragment. Caches the compiled linker if possible.
 *
 * @param {Vue} vm
 * @param {Element|String} el
 */
function FragmentFactory(vm, el) {
  this.vm = vm;
  var template;
  var isString = typeof el === 'string';
  if (isString || isTemplate(el) && !el.hasAttribute('v-if')) {
    template = parseTemplate(el, true);
  } else {
    template = document.createDocumentFragment();
    template.appendChild(el);
  }
  this.template = template;
  // linker can be cached, but only for components
  var linker;
  var cid = vm.constructor.cid;
  if (cid > 0) {
    var cacheId = cid + (isString ? el : getOuterHTML(el));
    linker = linkerCache.get(cacheId);
    if (!linker) {
      linker = compile(template, vm.$options, true);
      linkerCache.put(cacheId, linker);
    }
  } else {
    linker = compile(template, vm.$options, true);
  }
  this.linker = linker;
}

/**
 * Create a fragment instance with given host and scope.
 *
 * @param {Vue} host
 * @param {Object} scope
 * @param {Fragment} parentFrag
 */

FragmentFactory.prototype.create = function (host, scope, parentFrag) {
  var frag = cloneNode(this.template);
  return new Fragment(this.linker, this.vm, frag, host, scope, parentFrag);
};

var ON = 700;
var MODEL = 800;
var BIND = 850;
var TRANSITION = 1100;
var EL = 1500;
var COMPONENT = 1500;
var PARTIAL = 1750;
var IF = 2100;
var FOR = 2200;
var SLOT = 2300;

var uid$3 = 0;

var vFor = {

  priority: FOR,
  terminal: true,

  params: ['track-by', 'stagger', 'enter-stagger', 'leave-stagger'],

  bind: function bind() {
    // support "item in/of items" syntax
    var inMatch = this.expression.match(/(.*) (?:in|of) (.*)/);
    if (inMatch) {
      var itMatch = inMatch[1].match(/\((.*),(.*)\)/);
      if (itMatch) {
        this.iterator = itMatch[1].trim();
        this.alias = itMatch[2].trim();
      } else {
        this.alias = inMatch[1].trim();
      }
      this.expression = inMatch[2];
    }

    if (!this.alias) {
      process.env.NODE_ENV !== 'production' && warn('Invalid v-for expression "' + this.descriptor.raw + '": ' + 'alias is required.', this.vm);
      return;
    }

    // uid as a cache identifier
    this.id = '__v-for__' + ++uid$3;

    // check if this is an option list,
    // so that we know if we need to update the <select>'s
    // v-model when the option list has changed.
    // because v-model has a lower priority than v-for,
    // the v-model is not bound here yet, so we have to
    // retrive it in the actual updateModel() function.
    var tag = this.el.tagName;
    this.isOption = (tag === 'OPTION' || tag === 'OPTGROUP') && this.el.parentNode.tagName === 'SELECT';

    // setup anchor nodes
    this.start = createAnchor('v-for-start');
    this.end = createAnchor('v-for-end');
    replace(this.el, this.end);
    before(this.start, this.end);

    // cache
    this.cache = Object.create(null);

    // fragment factory
    this.factory = new FragmentFactory(this.vm, this.el);
  },

  update: function update(data) {
    this.diff(data);
    this.updateRef();
    this.updateModel();
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   *
   * The algorithm diffs the new data Array by storing a
   * hidden reference to an owner vm instance on previously
   * seen data. This allows us to achieve O(n) which is
   * better than a levenshtein distance based algorithm,
   * which is O(m * n).
   *
   * @param {Array} data
   */

  diff: function diff(data) {
    // check if the Array was converted from an Object
    var item = data[0];
    var convertedFromObject = this.fromObject = isObject(item) && hasOwn(item, '$key') && hasOwn(item, '$value');

    var trackByKey = this.params.trackBy;
    var oldFrags = this.frags;
    var frags = this.frags = new Array(data.length);
    var alias = this.alias;
    var iterator = this.iterator;
    var start = this.start;
    var end = this.end;
    var inDocument = inDoc(start);
    var init = !oldFrags;
    var i, l, frag, key, value, primitive;

    // First pass, go through the new Array and fill up
    // the new frags array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      item = data[i];
      key = convertedFromObject ? item.$key : null;
      value = convertedFromObject ? item.$value : item;
      primitive = !isObject(value);
      frag = !init && this.getCachedFrag(value, i, key);
      if (frag) {
        // reusable fragment
        frag.reused = true;
        // update $index
        frag.scope.$index = i;
        // update $key
        if (key) {
          frag.scope.$key = key;
        }
        // update iterator
        if (iterator) {
          frag.scope[iterator] = key !== null ? key : i;
        }
        // update data for track-by, object repeat &
        // primitive values.
        if (trackByKey || convertedFromObject || primitive) {
          withoutConversion(function () {
            frag.scope[alias] = value;
          });
        }
      } else {
        // new isntance
        frag = this.create(value, alias, i, key);
        frag.fresh = !init;
      }
      frags[i] = frag;
      if (init) {
        frag.before(end);
      }
    }

    // we're done for the initial render.
    if (init) {
      return;
    }

    // Second pass, go through the old fragments and
    // destroy those who are not reused (and remove them
    // from cache)
    var removalIndex = 0;
    var totalRemoved = oldFrags.length - frags.length;
    // when removing a large number of fragments, watcher removal
    // turns out to be a perf bottleneck, so we batch the watcher
    // removals into a single filter call!
    this.vm._vForRemoving = true;
    for (i = 0, l = oldFrags.length; i < l; i++) {
      frag = oldFrags[i];
      if (!frag.reused) {
        this.deleteCachedFrag(frag);
        this.remove(frag, removalIndex++, totalRemoved, inDocument);
      }
    }
    this.vm._vForRemoving = false;
    if (removalIndex) {
      this.vm._watchers = this.vm._watchers.filter(function (w) {
        return w.active;
      });
    }

    // Final pass, move/insert new fragments into the
    // right place.
    var targetPrev, prevEl, currentPrev;
    var insertionIndex = 0;
    for (i = 0, l = frags.length; i < l; i++) {
      frag = frags[i];
      // this is the frag that we should be after
      targetPrev = frags[i - 1];
      prevEl = targetPrev ? targetPrev.staggerCb ? targetPrev.staggerAnchor : targetPrev.end || targetPrev.node : start;
      if (frag.reused && !frag.staggerCb) {
        currentPrev = findPrevFrag(frag, start, this.id);
        if (currentPrev !== targetPrev && (!currentPrev ||
        // optimization for moving a single item.
        // thanks to suggestions by @livoras in #1807
        findPrevFrag(currentPrev, start, this.id) !== targetPrev)) {
          this.move(frag, prevEl);
        }
      } else {
        // new instance, or still in stagger.
        // insert with updated stagger index.
        this.insert(frag, insertionIndex++, prevEl, inDocument);
      }
      frag.reused = frag.fresh = false;
    }
  },

  /**
   * Create a new fragment instance.
   *
   * @param {*} value
   * @param {String} alias
   * @param {Number} index
   * @param {String} [key]
   * @return {Fragment}
   */

  create: function create(value, alias, index, key) {
    var host = this._host;
    // create iteration scope
    var parentScope = this._scope || this.vm;
    var scope = Object.create(parentScope);
    // ref holder for the scope
    scope.$refs = Object.create(parentScope.$refs);
    scope.$els = Object.create(parentScope.$els);
    // make sure point $parent to parent scope
    scope.$parent = parentScope;
    // for two-way binding on alias
    scope.$forContext = this;
    // define scope properties
    // important: define the scope alias without forced conversion
    // so that frozen data structures remain non-reactive.
    withoutConversion(function () {
      defineReactive(scope, alias, value);
    });
    defineReactive(scope, '$index', index);
    if (key) {
      defineReactive(scope, '$key', key);
    } else if (scope.$key) {
      // avoid accidental fallback
      def(scope, '$key', null);
    }
    if (this.iterator) {
      defineReactive(scope, this.iterator, key !== null ? key : index);
    }
    var frag = this.factory.create(host, scope, this._frag);
    frag.forId = this.id;
    this.cacheFrag(value, frag, index, key);
    return frag;
  },

  /**
   * Update the v-ref on owner vm.
   */

  updateRef: function updateRef() {
    var ref = this.descriptor.ref;
    if (!ref) return;
    var hash = (this._scope || this.vm).$refs;
    var refs;
    if (!this.fromObject) {
      refs = this.frags.map(findVmFromFrag);
    } else {
      refs = {};
      this.frags.forEach(function (frag) {
        refs[frag.scope.$key] = findVmFromFrag(frag);
      });
    }
    hash[ref] = refs;
  },

  /**
   * For option lists, update the containing v-model on
   * parent <select>.
   */

  updateModel: function updateModel() {
    if (this.isOption) {
      var parent = this.start.parentNode;
      var model = parent && parent.__v_model;
      if (model) {
        model.forceUpdate();
      }
    }
  },

  /**
   * Insert a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Node} prevEl
   * @param {Boolean} inDocument
   */

  insert: function insert(frag, index, prevEl, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
    }
    var staggerAmount = this.getStagger(frag, index, null, 'enter');
    if (inDocument && staggerAmount) {
      // create an anchor and insert it synchronously,
      // so that we can resolve the correct order without
      // worrying about some elements not inserted yet
      var anchor = frag.staggerAnchor;
      if (!anchor) {
        anchor = frag.staggerAnchor = createAnchor('stagger-anchor');
        anchor.__v_frag = frag;
      }
      after(anchor, prevEl);
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.before(anchor);
        remove(anchor);
      });
      setTimeout(op, staggerAmount);
    } else {
      var target = prevEl.nextSibling;
      /* istanbul ignore if */
      if (!target) {
        // reset end anchor position in case the position was messed up
        // by an external drag-n-drop library.
        after(this.end, prevEl);
        target = this.end;
      }
      frag.before(target);
    }
  },

  /**
   * Remove a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {Boolean} inDocument
   */

  remove: function remove(frag, index, total, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
      // it's not possible for the same frag to be removed
      // twice, so if we have a pending stagger callback,
      // it means this frag is queued for enter but removed
      // before its transition started. Since it is already
      // destroyed, we can just leave it in detached state.
      return;
    }
    var staggerAmount = this.getStagger(frag, index, total, 'leave');
    if (inDocument && staggerAmount) {
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.remove();
      });
      setTimeout(op, staggerAmount);
    } else {
      frag.remove();
    }
  },

  /**
   * Move a fragment to a new position.
   * Force no transition.
   *
   * @param {Fragment} frag
   * @param {Node} prevEl
   */

  move: function move(frag, prevEl) {
    // fix a common issue with Sortable:
    // if prevEl doesn't have nextSibling, this means it's
    // been dragged after the end anchor. Just re-position
    // the end anchor to the end of the container.
    /* istanbul ignore if */
    if (!prevEl.nextSibling) {
      this.end.parentNode.appendChild(this.end);
    }
    frag.before(prevEl.nextSibling, false);
  },

  /**
   * Cache a fragment using track-by or the object key.
   *
   * @param {*} value
   * @param {Fragment} frag
   * @param {Number} index
   * @param {String} [key]
   */

  cacheFrag: function cacheFrag(value, frag, index, key) {
    var trackByKey = this.params.trackBy;
    var cache = this.cache;
    var primitive = !isObject(value);
    var id;
    if (key || trackByKey || primitive) {
      id = getTrackByKey(index, key, value, trackByKey);
      if (!cache[id]) {
        cache[id] = frag;
      } else if (trackByKey !== '$index') {
        process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
      }
    } else {
      id = this.id;
      if (hasOwn(value, id)) {
        if (value[id] === null) {
          value[id] = frag;
        } else {
          process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
        }
      } else if (Object.isExtensible(value)) {
        def(value, id, frag);
      } else if (process.env.NODE_ENV !== 'production') {
        warn('Frozen v-for objects cannot be automatically tracked, make sure to ' + 'provide a track-by key.');
      }
    }
    frag.raw = value;
  },

  /**
   * Get a cached fragment from the value/index/key
   *
   * @param {*} value
   * @param {Number} index
   * @param {String} key
   * @return {Fragment}
   */

  getCachedFrag: function getCachedFrag(value, index, key) {
    var trackByKey = this.params.trackBy;
    var primitive = !isObject(value);
    var frag;
    if (key || trackByKey || primitive) {
      var id = getTrackByKey(index, key, value, trackByKey);
      frag = this.cache[id];
    } else {
      frag = value[this.id];
    }
    if (frag && (frag.reused || frag.fresh)) {
      process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
    }
    return frag;
  },

  /**
   * Delete a fragment from cache.
   *
   * @param {Fragment} frag
   */

  deleteCachedFrag: function deleteCachedFrag(frag) {
    var value = frag.raw;
    var trackByKey = this.params.trackBy;
    var scope = frag.scope;
    var index = scope.$index;
    // fix #948: avoid accidentally fall through to
    // a parent repeater which happens to have $key.
    var key = hasOwn(scope, '$key') && scope.$key;
    var primitive = !isObject(value);
    if (trackByKey || key || primitive) {
      var id = getTrackByKey(index, key, value, trackByKey);
      this.cache[id] = null;
    } else {
      value[this.id] = null;
      frag.raw = null;
    }
  },

  /**
   * Get the stagger amount for an insertion/removal.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {String} type
   */

  getStagger: function getStagger(frag, index, total, type) {
    type = type + 'Stagger';
    var trans = frag.node.__v_trans;
    var hooks = trans && trans.hooks;
    var hook = hooks && (hooks[type] || hooks.stagger);
    return hook ? hook.call(frag, index, total) : index * parseInt(this.params[type] || this.params.stagger, 10);
  },

  /**
   * Pre-process the value before piping it through the
   * filters. This is passed to and called by the watcher.
   */

  _preProcess: function _preProcess(value) {
    // regardless of type, store the un-filtered raw value.
    this.rawValue = value;
    return value;
  },

  /**
   * Post-process the value after it has been piped through
   * the filters. This is passed to and called by the watcher.
   *
   * It is necessary for this to be called during the
   * watcher's dependency collection phase because we want
   * the v-for to update when the source Object is mutated.
   */

  _postProcess: function _postProcess(value) {
    if (isArray(value)) {
      return value;
    } else if (isPlainObject(value)) {
      // convert plain object to array.
      var keys = Object.keys(value);
      var i = keys.length;
      var res = new Array(i);
      var key;
      while (i--) {
        key = keys[i];
        res[i] = {
          $key: key,
          $value: value[key]
        };
      }
      return res;
    } else {
      if (typeof value === 'number' && !isNaN(value)) {
        value = range(value);
      }
      return value || [];
    }
  },

  unbind: function unbind() {
    if (this.descriptor.ref) {
      (this._scope || this.vm).$refs[this.descriptor.ref] = null;
    }
    if (this.frags) {
      var i = this.frags.length;
      var frag;
      while (i--) {
        frag = this.frags[i];
        this.deleteCachedFrag(frag);
        frag.destroy();
      }
    }
  }
};

/**
 * Helper to find the previous element that is a fragment
 * anchor. This is necessary because a destroyed frag's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its inserted flag
 * should have been set to false so we can skip them.
 *
 * If this is a block repeat, we want to make sure we only
 * return frag that is bound to this v-for. (see #929)
 *
 * @param {Fragment} frag
 * @param {Comment|Text} anchor
 * @param {String} id
 * @return {Fragment}
 */

function findPrevFrag(frag, anchor, id) {
  var el = frag.node.previousSibling;
  /* istanbul ignore if */
  if (!el) return;
  frag = el.__v_frag;
  while ((!frag || frag.forId !== id || !frag.inserted) && el !== anchor) {
    el = el.previousSibling;
    /* istanbul ignore if */
    if (!el) return;
    frag = el.__v_frag;
  }
  return frag;
}

/**
 * Find a vm from a fragment.
 *
 * @param {Fragment} frag
 * @return {Vue|undefined}
 */

function findVmFromFrag(frag) {
  var node = frag.node;
  // handle multi-node frag
  if (frag.end) {
    while (!node.__vue__ && node !== frag.end && node.nextSibling) {
      node = node.nextSibling;
    }
  }
  return node.__vue__;
}

/**
 * Create a range array from given number.
 *
 * @param {Number} n
 * @return {Array}
 */

function range(n) {
  var i = -1;
  var ret = new Array(Math.floor(n));
  while (++i < n) {
    ret[i] = i;
  }
  return ret;
}

/**
 * Get the track by key for an item.
 *
 * @param {Number} index
 * @param {String} key
 * @param {*} value
 * @param {String} [trackByKey]
 */

function getTrackByKey(index, key, value, trackByKey) {
  return trackByKey ? trackByKey === '$index' ? index : trackByKey.charAt(0).match(/\w/) ? getPath(value, trackByKey) : value[trackByKey] : key || value;
}

if (process.env.NODE_ENV !== 'production') {
  vFor.warnDuplicate = function (value) {
    warn('Duplicate value found in v-for="' + this.descriptor.raw + '": ' + JSON.stringify(value) + '. Use track-by="$index" if ' + 'you are expecting duplicate values.', this.vm);
  };
}

var vIf = {

  priority: IF,
  terminal: true,

  bind: function bind() {
    var el = this.el;
    if (!el.__vue__) {
      // check else block
      var next = el.nextElementSibling;
      if (next && getAttr(next, 'v-else') !== null) {
        remove(next);
        this.elseEl = next;
      }
      // check main block
      this.anchor = createAnchor('v-if');
      replace(el, this.anchor);
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-if="' + this.expression + '" cannot be ' + 'used on an instance root element.', this.vm);
      this.invalid = true;
    }
  },

  update: function update(value) {
    if (this.invalid) return;
    if (value) {
      if (!this.frag) {
        this.insert();
      }
    } else {
      this.remove();
    }
  },

  insert: function insert() {
    if (this.elseFrag) {
      this.elseFrag.remove();
      this.elseFrag = null;
    }
    // lazy init factory
    if (!this.factory) {
      this.factory = new FragmentFactory(this.vm, this.el);
    }
    this.frag = this.factory.create(this._host, this._scope, this._frag);
    this.frag.before(this.anchor);
  },

  remove: function remove() {
    if (this.frag) {
      this.frag.remove();
      this.frag = null;
    }
    if (this.elseEl && !this.elseFrag) {
      if (!this.elseFactory) {
        this.elseFactory = new FragmentFactory(this.elseEl._context || this.vm, this.elseEl);
      }
      this.elseFrag = this.elseFactory.create(this._host, this._scope, this._frag);
      this.elseFrag.before(this.anchor);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
    if (this.elseFrag) {
      this.elseFrag.destroy();
    }
  }
};

var show = {

  bind: function bind() {
    // check else block
    var next = this.el.nextElementSibling;
    if (next && getAttr(next, 'v-else') !== null) {
      this.elseEl = next;
    }
  },

  update: function update(value) {
    this.apply(this.el, value);
    if (this.elseEl) {
      this.apply(this.elseEl, !value);
    }
  },

  apply: function apply(el, value) {
    if (inDoc(el)) {
      applyTransition(el, value ? 1 : -1, toggle, this.vm);
    } else {
      toggle();
    }
    function toggle() {
      el.style.display = value ? '' : 'none';
    }
  }
};

var text$2 = {

  bind: function bind() {
    var self = this;
    var el = this.el;
    var isRange = el.type === 'range';
    var lazy = this.params.lazy;
    var number = this.params.number;
    var debounce = this.params.debounce;

    // handle composition events.
    //   http://blog.evanyou.me/2014/01/03/composition-event/
    // skip this for Android because it handles composition
    // events quite differently. Android doesn't trigger
    // composition events for language input methods e.g.
    // Chinese, but instead triggers them for spelling
    // suggestions... (see Discussion/#162)
    var composing = false;
    if (!isAndroid && !isRange) {
      this.on('compositionstart', function () {
        composing = true;
      });
      this.on('compositionend', function () {
        composing = false;
        // in IE11 the "compositionend" event fires AFTER
        // the "input" event, so the input handler is blocked
        // at the end... have to call it here.
        //
        // #1327: in lazy mode this is unecessary.
        if (!lazy) {
          self.listener();
        }
      });
    }

    // prevent messing with the input when user is typing,
    // and force update on blur.
    this.focused = false;
    if (!isRange && !lazy) {
      this.on('focus', function () {
        self.focused = true;
      });
      this.on('blur', function () {
        self.focused = false;
        // do not sync value after fragment removal (#2017)
        if (!self._frag || self._frag.inserted) {
          self.rawListener();
        }
      });
    }

    // Now attach the main listener
    this.listener = this.rawListener = function () {
      if (composing || !self._bound) {
        return;
      }
      var val = number || isRange ? toNumber(el.value) : el.value;
      self.set(val);
      // force update on next tick to avoid lock & same value
      // also only update when user is not typing
      nextTick(function () {
        if (self._bound && !self.focused) {
          self.update(self._watcher.value);
        }
      });
    };

    // apply debounce
    if (debounce) {
      this.listener = _debounce(this.listener, debounce);
    }

    // Support jQuery events, since jQuery.trigger() doesn't
    // trigger native events in some cases and some plugins
    // rely on $.trigger()
    //
    // We want to make sure if a listener is attached using
    // jQuery, it is also removed with jQuery, that's why
    // we do the check for each directive instance and
    // store that check result on itself. This also allows
    // easier test coverage control by unsetting the global
    // jQuery variable in tests.
    this.hasjQuery = typeof jQuery === 'function';
    if (this.hasjQuery) {
      var method = jQuery.fn.on ? 'on' : 'bind';
      jQuery(el)[method]('change', this.rawListener);
      if (!lazy) {
        jQuery(el)[method]('input', this.listener);
      }
    } else {
      this.on('change', this.rawListener);
      if (!lazy) {
        this.on('input', this.listener);
      }
    }

    // IE9 doesn't fire input event on backspace/del/cut
    if (!lazy && isIE9) {
      this.on('cut', function () {
        nextTick(self.listener);
      });
      this.on('keyup', function (e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          self.listener();
        }
      });
    }

    // set initial value if present
    if (el.hasAttribute('value') || el.tagName === 'TEXTAREA' && el.value.trim()) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    // #3029 only update when the value changes. This prevent
    // browsers from overwriting values like selectionStart
    value = _toString(value);
    if (value !== this.el.value) this.el.value = value;
  },

  unbind: function unbind() {
    var el = this.el;
    if (this.hasjQuery) {
      var method = jQuery.fn.off ? 'off' : 'unbind';
      jQuery(el)[method]('change', this.listener);
      jQuery(el)[method]('input', this.listener);
    }
  }
};

var radio = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      // value overwrite via v-bind:value
      if (el.hasOwnProperty('_value')) {
        return el._value;
      }
      var val = el.value;
      if (self.params.number) {
        val = toNumber(val);
      }
      return val;
    };

    this.listener = function () {
      self.set(self.getValue());
    };
    this.on('change', this.listener);

    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    this.el.checked = looseEqual(value, this.getValue());
  }
};

var select = {

  bind: function bind() {
    var _this = this;

    var self = this;
    var el = this.el;

    // method to force update DOM using latest value.
    this.forceUpdate = function () {
      if (self._watcher) {
        self.update(self._watcher.get());
      }
    };

    // check if this is a multiple select
    var multiple = this.multiple = el.hasAttribute('multiple');

    // attach listener
    this.listener = function () {
      var value = getValue(el, multiple);
      value = self.params.number ? isArray(value) ? value.map(toNumber) : toNumber(value) : value;
      self.set(value);
    };
    this.on('change', this.listener);

    // if has initial value, set afterBind
    var initValue = getValue(el, multiple, true);
    if (multiple && initValue.length || !multiple && initValue !== null) {
      this.afterBind = this.listener;
    }

    // All major browsers except Firefox resets
    // selectedIndex with value -1 to 0 when the element
    // is appended to a new parent, therefore we have to
    // force a DOM update whenever that happens...
    this.vm.$on('hook:attached', function () {
      nextTick(_this.forceUpdate);
    });
    if (!inDoc(el)) {
      nextTick(this.forceUpdate);
    }
  },

  update: function update(value) {
    var el = this.el;
    el.selectedIndex = -1;
    var multi = this.multiple && isArray(value);
    var options = el.options;
    var i = options.length;
    var op, val;
    while (i--) {
      op = options[i];
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      /* eslint-disable eqeqeq */
      op.selected = multi ? indexOf$1(value, val) > -1 : looseEqual(value, val);
      /* eslint-enable eqeqeq */
    }
  },

  unbind: function unbind() {
    /* istanbul ignore next */
    this.vm.$off('hook:attached', this.forceUpdate);
  }
};

/**
 * Get select value
 *
 * @param {SelectElement} el
 * @param {Boolean} multi
 * @param {Boolean} init
 * @return {Array|*}
 */

function getValue(el, multi, init) {
  var res = multi ? [] : null;
  var op, val, selected;
  for (var i = 0, l = el.options.length; i < l; i++) {
    op = el.options[i];
    selected = init ? op.hasAttribute('selected') : op.selected;
    if (selected) {
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      if (multi) {
        res.push(val);
      } else {
        return val;
      }
    }
  }
  return res;
}

/**
 * Native Array.indexOf uses strict equal, but in this
 * case we need to match string/numbers with custom equal.
 *
 * @param {Array} arr
 * @param {*} val
 */

function indexOf$1(arr, val) {
  var i = arr.length;
  while (i--) {
    if (looseEqual(arr[i], val)) {
      return i;
    }
  }
  return -1;
}

var checkbox = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      return el.hasOwnProperty('_value') ? el._value : self.params.number ? toNumber(el.value) : el.value;
    };

    function getBooleanValue() {
      var val = el.checked;
      if (val && el.hasOwnProperty('_trueValue')) {
        return el._trueValue;
      }
      if (!val && el.hasOwnProperty('_falseValue')) {
        return el._falseValue;
      }
      return val;
    }

    this.listener = function () {
      var model = self._watcher.value;
      if (isArray(model)) {
        var val = self.getValue();
        if (el.checked) {
          if (indexOf(model, val) < 0) {
            model.push(val);
          }
        } else {
          model.$remove(val);
        }
      } else {
        self.set(getBooleanValue());
      }
    };

    this.on('change', this.listener);
    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    var el = this.el;
    if (isArray(value)) {
      el.checked = indexOf(value, this.getValue()) > -1;
    } else {
      if (el.hasOwnProperty('_trueValue')) {
        el.checked = looseEqual(value, el._trueValue);
      } else {
        el.checked = !!value;
      }
    }
  }
};

var handlers = {
  text: text$2,
  radio: radio,
  select: select,
  checkbox: checkbox
};

var model = {

  priority: MODEL,
  twoWay: true,
  handlers: handlers,
  params: ['lazy', 'number', 'debounce'],

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   */

  bind: function bind() {
    // friendly warning...
    this.checkFilters();
    if (this.hasRead && !this.hasWrite) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using a read-only filter with ' + 'v-model="' + this.descriptor.raw + '". ' + 'You might want to use a two-way filter to ensure correct behavior.', this.vm);
    }
    var el = this.el;
    var tag = el.tagName;
    var handler;
    if (tag === 'INPUT') {
      handler = handlers[el.type] || handlers.text;
    } else if (tag === 'SELECT') {
      handler = handlers.select;
    } else if (tag === 'TEXTAREA') {
      handler = handlers.text;
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-model does not support element type: ' + tag, this.vm);
      return;
    }
    el.__v_model = this;
    handler.bind.call(this);
    this.update = handler.update;
    this._unbind = handler.unbind;
  },

  /**
   * Check read/write filter stats.
   */

  checkFilters: function checkFilters() {
    var filters = this.filters;
    if (!filters) return;
    var i = filters.length;
    while (i--) {
      var filter = resolveAsset(this.vm.$options, 'filters', filters[i].name);
      if (typeof filter === 'function' || filter.read) {
        this.hasRead = true;
      }
      if (filter.write) {
        this.hasWrite = true;
      }
    }
  },

  unbind: function unbind() {
    this.el.__v_model = null;
    this._unbind && this._unbind();
  }
};

// keyCode aliases
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  'delete': [8, 46],
  up: 38,
  left: 37,
  right: 39,
  down: 40
};

function keyFilter(handler, keys) {
  var codes = keys.map(function (key) {
    var charCode = key.charCodeAt(0);
    if (charCode > 47 && charCode < 58) {
      return parseInt(key, 10);
    }
    if (key.length === 1) {
      charCode = key.toUpperCase().charCodeAt(0);
      if (charCode > 64 && charCode < 91) {
        return charCode;
      }
    }
    return keyCodes[key];
  });
  codes = [].concat.apply([], codes);
  return function keyHandler(e) {
    if (codes.indexOf(e.keyCode) > -1) {
      return handler.call(this, e);
    }
  };
}

function stopFilter(handler) {
  return function stopHandler(e) {
    e.stopPropagation();
    return handler.call(this, e);
  };
}

function preventFilter(handler) {
  return function preventHandler(e) {
    e.preventDefault();
    return handler.call(this, e);
  };
}

function selfFilter(handler) {
  return function selfHandler(e) {
    if (e.target === e.currentTarget) {
      return handler.call(this, e);
    }
  };
}

var on$1 = {

  priority: ON,
  acceptStatement: true,
  keyCodes: keyCodes,

  bind: function bind() {
    // deal with iframes
    if (this.el.tagName === 'IFRAME' && this.arg !== 'load') {
      var self = this;
      this.iframeBind = function () {
        on(self.el.contentWindow, self.arg, self.handler, self.modifiers.capture);
      };
      this.on('load', this.iframeBind);
    }
  },

  update: function update(handler) {
    // stub a noop for v-on with no value,
    // e.g. @mousedown.prevent
    if (!this.descriptor.raw) {
      handler = function () {};
    }

    if (typeof handler !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('v-on:' + this.arg + '="' + this.expression + '" expects a function value, ' + 'got ' + handler, this.vm);
      return;
    }

    // apply modifiers
    if (this.modifiers.stop) {
      handler = stopFilter(handler);
    }
    if (this.modifiers.prevent) {
      handler = preventFilter(handler);
    }
    if (this.modifiers.self) {
      handler = selfFilter(handler);
    }
    // key filter
    var keys = Object.keys(this.modifiers).filter(function (key) {
      return key !== 'stop' && key !== 'prevent' && key !== 'self' && key !== 'capture';
    });
    if (keys.length) {
      handler = keyFilter(handler, keys);
    }

    this.reset();
    this.handler = handler;

    if (this.iframeBind) {
      this.iframeBind();
    } else {
      on(this.el, this.arg, this.handler, this.modifiers.capture);
    }
  },

  reset: function reset() {
    var el = this.iframeBind ? this.el.contentWindow : this.el;
    if (this.handler) {
      off(el, this.arg, this.handler);
    }
  },

  unbind: function unbind() {
    this.reset();
  }
};

var prefixes = ['-webkit-', '-moz-', '-ms-'];
var camelPrefixes = ['Webkit', 'Moz', 'ms'];
var importantRE = /!important;?$/;
var propCache = Object.create(null);

var testEl = null;

var style = {

  deep: true,

  update: function update(value) {
    if (typeof value === 'string') {
      this.el.style.cssText = value;
    } else if (isArray(value)) {
      this.handleObject(value.reduce(extend, {}));
    } else {
      this.handleObject(value || {});
    }
  },

  handleObject: function handleObject(value) {
    // cache object styles so that only changed props
    // are actually updated.
    var cache = this.cache || (this.cache = {});
    var name, val;
    for (name in cache) {
      if (!(name in value)) {
        this.handleSingle(name, null);
        delete cache[name];
      }
    }
    for (name in value) {
      val = value[name];
      if (val !== cache[name]) {
        cache[name] = val;
        this.handleSingle(name, val);
      }
    }
  },

  handleSingle: function handleSingle(prop, value) {
    prop = normalize(prop);
    if (!prop) return; // unsupported prop
    // cast possible numbers/booleans into strings
    if (value != null) value += '';
    if (value) {
      var isImportant = importantRE.test(value) ? 'important' : '';
      if (isImportant) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          warn('It\'s probably a bad idea to use !important with inline rules. ' + 'This feature will be deprecated in a future version of Vue.');
        }
        value = value.replace(importantRE, '').trim();
        this.el.style.setProperty(prop.kebab, value, isImportant);
      } else {
        this.el.style[prop.camel] = value;
      }
    } else {
      this.el.style[prop.camel] = '';
    }
  }

};

/**
 * Normalize a CSS property name.
 * - cache result
 * - auto prefix
 * - camelCase -> dash-case
 *
 * @param {String} prop
 * @return {String}
 */

function normalize(prop) {
  if (propCache[prop]) {
    return propCache[prop];
  }
  var res = prefix(prop);
  propCache[prop] = propCache[res] = res;
  return res;
}

/**
 * Auto detect the appropriate prefix for a CSS property.
 * https://gist.github.com/paulirish/523692
 *
 * @param {String} prop
 * @return {String}
 */

function prefix(prop) {
  prop = hyphenate(prop);
  var camel = camelize(prop);
  var upper = camel.charAt(0).toUpperCase() + camel.slice(1);
  if (!testEl) {
    testEl = document.createElement('div');
  }
  var i = prefixes.length;
  var prefixed;
  if (camel !== 'filter' && camel in testEl.style) {
    return {
      kebab: prop,
      camel: camel
    };
  }
  while (i--) {
    prefixed = camelPrefixes[i] + upper;
    if (prefixed in testEl.style) {
      return {
        kebab: prefixes[i] + prop,
        camel: prefixed
      };
    }
  }
}

// xlink
var xlinkNS = 'http://www.w3.org/1999/xlink';
var xlinkRE = /^xlink:/;

// check for attributes that prohibit interpolations
var disallowedInterpAttrRE = /^v-|^:|^@|^(?:is|transition|transition-mode|debounce|track-by|stagger|enter-stagger|leave-stagger)$/;
// these attributes should also set their corresponding properties
// because they only affect the initial state of the element
var attrWithPropsRE = /^(?:value|checked|selected|muted)$/;
// these attributes expect enumrated values of "true" or "false"
// but are not boolean attributes
var enumeratedAttrRE = /^(?:draggable|contenteditable|spellcheck)$/;

// these attributes should set a hidden property for
// binding v-model to object values
var modelProps = {
  value: '_value',
  'true-value': '_trueValue',
  'false-value': '_falseValue'
};

var bind$1 = {

  priority: BIND,

  bind: function bind() {
    var attr = this.arg;
    var tag = this.el.tagName;
    // should be deep watch on object mode
    if (!attr) {
      this.deep = true;
    }
    // handle interpolation bindings
    var descriptor = this.descriptor;
    var tokens = descriptor.interp;
    if (tokens) {
      // handle interpolations with one-time tokens
      if (descriptor.hasOneTime) {
        this.expression = tokensToExp(tokens, this._scope || this.vm);
      }

      // only allow binding on native attributes
      if (disallowedInterpAttrRE.test(attr) || attr === 'name' && (tag === 'PARTIAL' || tag === 'SLOT')) {
        process.env.NODE_ENV !== 'production' && warn(attr + '="' + descriptor.raw + '": ' + 'attribute interpolation is not allowed in Vue.js ' + 'directives and special attributes.', this.vm);
        this.el.removeAttribute(attr);
        this.invalid = true;
      }

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production') {
        var raw = attr + '="' + descriptor.raw + '": ';
        // warn src
        if (attr === 'src') {
          warn(raw + 'interpolation in "src" attribute will cause ' + 'a 404 request. Use v-bind:src instead.', this.vm);
        }

        // warn style
        if (attr === 'style') {
          warn(raw + 'interpolation in "style" attribute will cause ' + 'the attribute to be discarded in Internet Explorer. ' + 'Use v-bind:style instead.', this.vm);
        }
      }
    }
  },

  update: function update(value) {
    if (this.invalid) {
      return;
    }
    var attr = this.arg;
    if (this.arg) {
      this.handleSingle(attr, value);
    } else {
      this.handleObject(value || {});
    }
  },

  // share object handler with v-bind:class
  handleObject: style.handleObject,

  handleSingle: function handleSingle(attr, value) {
    var el = this.el;
    var interp = this.descriptor.interp;
    if (this.modifiers.camel) {
      attr = camelize(attr);
    }
    if (!interp && attrWithPropsRE.test(attr) && attr in el) {
      var attrValue = attr === 'value' ? value == null // IE9 will set input.value to "null" for null...
      ? '' : value : value;

      if (el[attr] !== attrValue) {
        el[attr] = attrValue;
      }
    }
    // set model props
    var modelProp = modelProps[attr];
    if (!interp && modelProp) {
      el[modelProp] = value;
      // update v-model if present
      var model = el.__v_model;
      if (model) {
        model.listener();
      }
    }
    // do not set value attribute for textarea
    if (attr === 'value' && el.tagName === 'TEXTAREA') {
      el.removeAttribute(attr);
      return;
    }
    // update attribute
    if (enumeratedAttrRE.test(attr)) {
      el.setAttribute(attr, value ? 'true' : 'false');
    } else if (value != null && value !== false) {
      if (attr === 'class') {
        // handle edge case #1960:
        // class interpolation should not overwrite Vue transition class
        if (el.__v_trans) {
          value += ' ' + el.__v_trans.id + '-transition';
        }
        setClass(el, value);
      } else if (xlinkRE.test(attr)) {
        el.setAttributeNS(xlinkNS, attr, value === true ? '' : value);
      } else {
        el.setAttribute(attr, value === true ? '' : value);
      }
    } else {
      el.removeAttribute(attr);
    }
  }
};

var el = {

  priority: EL,

  bind: function bind() {
    /* istanbul ignore if */
    if (!this.arg) {
      return;
    }
    var id = this.id = camelize(this.arg);
    var refs = (this._scope || this.vm).$els;
    if (hasOwn(refs, id)) {
      refs[id] = this.el;
    } else {
      defineReactive(refs, id, this.el);
    }
  },

  unbind: function unbind() {
    var refs = (this._scope || this.vm).$els;
    if (refs[this.id] === this.el) {
      refs[this.id] = null;
    }
  }
};

var ref = {
  bind: function bind() {
    process.env.NODE_ENV !== 'production' && warn('v-ref:' + this.arg + ' must be used on a child ' + 'component. Found on <' + this.el.tagName.toLowerCase() + '>.', this.vm);
  }
};

var cloak = {
  bind: function bind() {
    var el = this.el;
    this.vm.$once('pre-hook:compiled', function () {
      el.removeAttribute('v-cloak');
    });
  }
};

// must export plain object
var directives = {
  text: text$1,
  html: html,
  'for': vFor,
  'if': vIf,
  show: show,
  model: model,
  on: on$1,
  bind: bind$1,
  el: el,
  ref: ref,
  cloak: cloak
};

var vClass = {

  deep: true,

  update: function update(value) {
    if (!value) {
      this.cleanup();
    } else if (typeof value === 'string') {
      this.setClass(value.trim().split(/\s+/));
    } else {
      this.setClass(normalize$1(value));
    }
  },

  setClass: function setClass(value) {
    this.cleanup(value);
    for (var i = 0, l = value.length; i < l; i++) {
      var val = value[i];
      if (val) {
        apply(this.el, val, addClass);
      }
    }
    this.prevKeys = value;
  },

  cleanup: function cleanup(value) {
    var prevKeys = this.prevKeys;
    if (!prevKeys) return;
    var i = prevKeys.length;
    while (i--) {
      var key = prevKeys[i];
      if (!value || value.indexOf(key) < 0) {
        apply(this.el, key, removeClass);
      }
    }
  }
};

/**
 * Normalize objects and arrays (potentially containing objects)
 * into array of strings.
 *
 * @param {Object|Array<String|Object>} value
 * @return {Array<String>}
 */

function normalize$1(value) {
  var res = [];
  if (isArray(value)) {
    for (var i = 0, l = value.length; i < l; i++) {
      var _key = value[i];
      if (_key) {
        if (typeof _key === 'string') {
          res.push(_key);
        } else {
          for (var k in _key) {
            if (_key[k]) res.push(k);
          }
        }
      }
    }
  } else if (isObject(value)) {
    for (var key in value) {
      if (value[key]) res.push(key);
    }
  }
  return res;
}

/**
 * Add or remove a class/classes on an element
 *
 * @param {Element} el
 * @param {String} key The class name. This may or may not
 *                     contain a space character, in such a
 *                     case we'll deal with multiple class
 *                     names at once.
 * @param {Function} fn
 */

function apply(el, key, fn) {
  key = key.trim();
  if (key.indexOf(' ') === -1) {
    fn(el, key);
    return;
  }
  // The key contains one or more space characters.
  // Since a class name doesn't accept such characters, we
  // treat it as multiple classes.
  var keys = key.split(/\s+/);
  for (var i = 0, l = keys.length; i < l; i++) {
    fn(el, keys[i]);
  }
}

var component = {

  priority: COMPONENT,

  params: ['keep-alive', 'transition-mode', 'inline-template'],

  /**
   * Setup. Two possible usages:
   *
   * - static:
   *   <comp> or <div v-component="comp">
   *
   * - dynamic:
   *   <component :is="view">
   */

  bind: function bind() {
    if (!this.el.__vue__) {
      // keep-alive cache
      this.keepAlive = this.params.keepAlive;
      if (this.keepAlive) {
        this.cache = {};
      }
      // check inline-template
      if (this.params.inlineTemplate) {
        // extract inline template as a DocumentFragment
        this.inlineTemplate = extractContent(this.el, true);
      }
      // component resolution related state
      this.pendingComponentCb = this.Component = null;
      // transition related state
      this.pendingRemovals = 0;
      this.pendingRemovalCb = null;
      // create a ref anchor
      this.anchor = createAnchor('v-component');
      replace(this.el, this.anchor);
      // remove is attribute.
      // this is removed during compilation, but because compilation is
      // cached, when the component is used elsewhere this attribute
      // will remain at link time.
      this.el.removeAttribute('is');
      this.el.removeAttribute(':is');
      // remove ref, same as above
      if (this.descriptor.ref) {
        this.el.removeAttribute('v-ref:' + hyphenate(this.descriptor.ref));
      }
      // if static, build right now.
      if (this.literal) {
        this.setComponent(this.expression);
      }
    } else {
      process.env.NODE_ENV !== 'production' && warn('cannot mount component "' + this.expression + '" ' + 'on already mounted element: ' + this.el);
    }
  },

  /**
   * Public update, called by the watcher in the dynamic
   * literal scenario, e.g. <component :is="view">
   */

  update: function update(value) {
    if (!this.literal) {
      this.setComponent(value);
    }
  },

  /**
   * Switch dynamic components. May resolve the component
   * asynchronously, and perform transition based on
   * specified transition mode. Accepts a few additional
   * arguments specifically for vue-router.
   *
   * The callback is called when the full transition is
   * finished.
   *
   * @param {String} value
   * @param {Function} [cb]
   */

  setComponent: function setComponent(value, cb) {
    this.invalidatePending();
    if (!value) {
      // just remove current
      this.unbuild(true);
      this.remove(this.childVM, cb);
      this.childVM = null;
    } else {
      var self = this;
      this.resolveComponent(value, function () {
        self.mountComponent(cb);
      });
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm.
   *
   * @param {String|Function} value
   * @param {Function} cb
   */

  resolveComponent: function resolveComponent(value, cb) {
    var self = this;
    this.pendingComponentCb = cancellable(function (Component) {
      self.ComponentName = Component.options.name || (typeof value === 'string' ? value : null);
      self.Component = Component;
      cb();
    });
    this.vm._resolveComponent(value, this.pendingComponentCb);
  },

  /**
   * Create a new instance using the current constructor and
   * replace the existing instance. This method doesn't care
   * whether the new component and the old one are actually
   * the same.
   *
   * @param {Function} [cb]
   */

  mountComponent: function mountComponent(cb) {
    // actual mount
    this.unbuild(true);
    var self = this;
    var activateHooks = this.Component.options.activate;
    var cached = this.getCached();
    var newComponent = this.build();
    if (activateHooks && !cached) {
      this.waitingFor = newComponent;
      callActivateHooks(activateHooks, newComponent, function () {
        if (self.waitingFor !== newComponent) {
          return;
        }
        self.waitingFor = null;
        self.transition(newComponent, cb);
      });
    } else {
      // update ref for kept-alive component
      if (cached) {
        newComponent._updateRef();
      }
      this.transition(newComponent, cb);
    }
  },

  /**
   * When the component changes or unbinds before an async
   * constructor is resolved, we need to invalidate its
   * pending callback.
   */

  invalidatePending: function invalidatePending() {
    if (this.pendingComponentCb) {
      this.pendingComponentCb.cancel();
      this.pendingComponentCb = null;
    }
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   *
   * @param {Object} [extraOptions]
   * @return {Vue} - the created instance
   */

  build: function build(extraOptions) {
    var cached = this.getCached();
    if (cached) {
      return cached;
    }
    if (this.Component) {
      // default options
      var options = {
        name: this.ComponentName,
        el: cloneNode(this.el),
        template: this.inlineTemplate,
        // make sure to add the child with correct parent
        // if this is a transcluded component, its parent
        // should be the transclusion host.
        parent: this._host || this.vm,
        // if no inline-template, then the compiled
        // linker can be cached for better performance.
        _linkerCachable: !this.inlineTemplate,
        _ref: this.descriptor.ref,
        _asComponent: true,
        _isRouterView: this._isRouterView,
        // if this is a transcluded component, context
        // will be the common parent vm of this instance
        // and its host.
        _context: this.vm,
        // if this is inside an inline v-for, the scope
        // will be the intermediate scope created for this
        // repeat fragment. this is used for linking props
        // and container directives.
        _scope: this._scope,
        // pass in the owner fragment of this component.
        // this is necessary so that the fragment can keep
        // track of its contained components in order to
        // call attach/detach hooks for them.
        _frag: this._frag
      };
      // extra options
      // in 1.0.0 this is used by vue-router only
      /* istanbul ignore if */
      if (extraOptions) {
        extend(options, extraOptions);
      }
      var child = new this.Component(options);
      if (this.keepAlive) {
        this.cache[this.Component.cid] = child;
      }
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && this.el.hasAttribute('transition') && child._isFragment) {
        warn('Transitions will not work on a fragment instance. ' + 'Template: ' + child.$options.template, child);
      }
      return child;
    }
  },

  /**
   * Try to get a cached instance of the current component.
   *
   * @return {Vue|undefined}
   */

  getCached: function getCached() {
    return this.keepAlive && this.cache[this.Component.cid];
  },

  /**
   * Teardown the current child, but defers cleanup so
   * that we can separate the destroy and removal steps.
   *
   * @param {Boolean} defer
   */

  unbuild: function unbuild(defer) {
    if (this.waitingFor) {
      if (!this.keepAlive) {
        this.waitingFor.$destroy();
      }
      this.waitingFor = null;
    }
    var child = this.childVM;
    if (!child || this.keepAlive) {
      if (child) {
        // remove ref
        child._inactive = true;
        child._updateRef(true);
      }
      return;
    }
    // the sole purpose of `deferCleanup` is so that we can
    // "deactivate" the vm right now and perform DOM removal
    // later.
    child.$destroy(false, defer);
  },

  /**
   * Remove current destroyed child and manually do
   * the cleanup after removal.
   *
   * @param {Function} cb
   */

  remove: function remove(child, cb) {
    var keepAlive = this.keepAlive;
    if (child) {
      // we may have a component switch when a previous
      // component is still being transitioned out.
      // we want to trigger only one lastest insertion cb
      // when the existing transition finishes. (#1119)
      this.pendingRemovals++;
      this.pendingRemovalCb = cb;
      var self = this;
      child.$remove(function () {
        self.pendingRemovals--;
        if (!keepAlive) child._cleanup();
        if (!self.pendingRemovals && self.pendingRemovalCb) {
          self.pendingRemovalCb();
          self.pendingRemovalCb = null;
        }
      });
    } else if (cb) {
      cb();
    }
  },

  /**
   * Actually swap the components, depending on the
   * transition mode. Defaults to simultaneous.
   *
   * @param {Vue} target
   * @param {Function} [cb]
   */

  transition: function transition(target, cb) {
    var self = this;
    var current = this.childVM;
    // for devtool inspection
    if (current) current._inactive = true;
    target._inactive = false;
    this.childVM = target;
    switch (self.params.transitionMode) {
      case 'in-out':
        target.$before(self.anchor, function () {
          self.remove(current, cb);
        });
        break;
      case 'out-in':
        self.remove(current, function () {
          target.$before(self.anchor, cb);
        });
        break;
      default:
        self.remove(current);
        target.$before(self.anchor, cb);
    }
  },

  /**
   * Unbind.
   */

  unbind: function unbind() {
    this.invalidatePending();
    // Do not defer cleanup when unbinding
    this.unbuild();
    // destroy all keep-alive cached instances
    if (this.cache) {
      for (var key in this.cache) {
        this.cache[key].$destroy();
      }
      this.cache = null;
    }
  }
};

/**
 * Call activate hooks in order (asynchronous)
 *
 * @param {Array} hooks
 * @param {Vue} vm
 * @param {Function} cb
 */

function callActivateHooks(hooks, vm, cb) {
  var total = hooks.length;
  var called = 0;
  hooks[0].call(vm, next);
  function next() {
    if (++called >= total) {
      cb();
    } else {
      hooks[called].call(vm, next);
    }
  }
}

var propBindingModes = config._propBindingModes;
var empty = {};

// regexes
var identRE$1 = /^[$_a-zA-Z]+[\w$]*$/;
var settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/;

/**
 * Compile props on a root element and return
 * a props link function.
 *
 * @param {Element|DocumentFragment} el
 * @param {Array} propOptions
 * @param {Vue} vm
 * @return {Function} propsLinkFn
 */

function compileProps(el, propOptions, vm) {
  var props = [];
  var names = Object.keys(propOptions);
  var i = names.length;
  var options, name, attr, value, path, parsed, prop;
  while (i--) {
    name = names[i];
    options = propOptions[name] || empty;

    if (process.env.NODE_ENV !== 'production' && name === '$data') {
      warn('Do not use $data as prop.', vm);
      continue;
    }

    // props could contain dashes, which will be
    // interpreted as minus calculations by the parser
    // so we need to camelize the path here
    path = camelize(name);
    if (!identRE$1.test(path)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop key: "' + name + '". Prop keys ' + 'must be valid identifiers.', vm);
      continue;
    }

    prop = {
      name: name,
      path: path,
      options: options,
      mode: propBindingModes.ONE_WAY,
      raw: null
    };

    attr = hyphenate(name);
    // first check dynamic version
    if ((value = getBindAttr(el, attr)) === null) {
      if ((value = getBindAttr(el, attr + '.sync')) !== null) {
        prop.mode = propBindingModes.TWO_WAY;
      } else if ((value = getBindAttr(el, attr + '.once')) !== null) {
        prop.mode = propBindingModes.ONE_TIME;
      }
    }
    if (value !== null) {
      // has dynamic binding!
      prop.raw = value;
      parsed = parseDirective(value);
      value = parsed.expression;
      prop.filters = parsed.filters;
      // check binding type
      if (isLiteral(value) && !parsed.filters) {
        // for expressions containing literal numbers and
        // booleans, there's no need to setup a prop binding,
        // so we can optimize them as a one-time set.
        prop.optimizedLiteral = true;
      } else {
        prop.dynamic = true;
        // check non-settable path for two-way bindings
        if (process.env.NODE_ENV !== 'production' && prop.mode === propBindingModes.TWO_WAY && !settablePathRE.test(value)) {
          prop.mode = propBindingModes.ONE_WAY;
          warn('Cannot bind two-way prop with non-settable ' + 'parent path: ' + value, vm);
        }
      }
      prop.parentPath = value;

      // warn required two-way
      if (process.env.NODE_ENV !== 'production' && options.twoWay && prop.mode !== propBindingModes.TWO_WAY) {
        warn('Prop "' + name + '" expects a two-way binding type.', vm);
      }
    } else if ((value = getAttr(el, attr)) !== null) {
      // has literal binding!
      prop.raw = value;
    } else if (process.env.NODE_ENV !== 'production') {
      // check possible camelCase prop usage
      var lowerCaseName = path.toLowerCase();
      value = /[A-Z\-]/.test(name) && (el.getAttribute(lowerCaseName) || el.getAttribute(':' + lowerCaseName) || el.getAttribute('v-bind:' + lowerCaseName) || el.getAttribute(':' + lowerCaseName + '.once') || el.getAttribute('v-bind:' + lowerCaseName + '.once') || el.getAttribute(':' + lowerCaseName + '.sync') || el.getAttribute('v-bind:' + lowerCaseName + '.sync'));
      if (value) {
        warn('Possible usage error for prop `' + lowerCaseName + '` - ' + 'did you mean `' + attr + '`? HTML is case-insensitive, remember to use ' + 'kebab-case for props in templates.', vm);
      } else if (options.required) {
        // warn missing required
        warn('Missing required prop: ' + name, vm);
      }
    }
    // push prop
    props.push(prop);
  }
  return makePropsLinkFn(props);
}

/**
 * Build a function that applies props to a vm.
 *
 * @param {Array} props
 * @return {Function} propsLinkFn
 */

function makePropsLinkFn(props) {
  return function propsLinkFn(vm, scope) {
    // store resolved props info
    vm._props = {};
    var inlineProps = vm.$options.propsData;
    var i = props.length;
    var prop, path, options, value, raw;
    while (i--) {
      prop = props[i];
      raw = prop.raw;
      path = prop.path;
      options = prop.options;
      vm._props[path] = prop;
      if (inlineProps && hasOwn(inlineProps, path)) {
        initProp(vm, prop, inlineProps[path]);
      }if (raw === null) {
        // initialize absent prop
        initProp(vm, prop, undefined);
      } else if (prop.dynamic) {
        // dynamic prop
        if (prop.mode === propBindingModes.ONE_TIME) {
          // one time binding
          value = (scope || vm._context || vm).$get(prop.parentPath);
          initProp(vm, prop, value);
        } else {
          if (vm._context) {
            // dynamic binding
            vm._bindDir({
              name: 'prop',
              def: propDef,
              prop: prop
            }, null, null, scope); // el, host, scope
          } else {
              // root instance
              initProp(vm, prop, vm.$get(prop.parentPath));
            }
        }
      } else if (prop.optimizedLiteral) {
        // optimized literal, cast it and just set once
        var stripped = stripQuotes(raw);
        value = stripped === raw ? toBoolean(toNumber(raw)) : stripped;
        initProp(vm, prop, value);
      } else {
        // string literal, but we need to cater for
        // Boolean props with no value, or with same
        // literal value (e.g. disabled="disabled")
        // see https://github.com/vuejs/vue-loader/issues/182
        value = options.type === Boolean && (raw === '' || raw === hyphenate(prop.name)) ? true : raw;
        initProp(vm, prop, value);
      }
    }
  };
}

/**
 * Process a prop with a rawValue, applying necessary coersions,
 * default values & assertions and call the given callback with
 * processed value.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} rawValue
 * @param {Function} fn
 */

function processPropValue(vm, prop, rawValue, fn) {
  var isSimple = prop.dynamic && isSimplePath(prop.parentPath);
  var value = rawValue;
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop);
  }
  value = coerceProp(prop, value, vm);
  var coerced = value !== rawValue;
  if (!assertProp(prop, value, vm)) {
    value = undefined;
  }
  if (isSimple && !coerced) {
    withoutConversion(function () {
      fn(value);
    });
  } else {
    fn(value);
  }
}

/**
 * Set a prop's initial value on a vm and its data object.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

function initProp(vm, prop, value) {
  processPropValue(vm, prop, value, function (value) {
    defineReactive(vm, prop.path, value);
  });
}

/**
 * Update a prop's value on a vm.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

function updateProp(vm, prop, value) {
  processPropValue(vm, prop, value, function (value) {
    vm[prop.path] = value;
  });
}

/**
 * Get the default value of a prop.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @return {*}
 */

function getPropDefaultValue(vm, prop) {
  // no default, return undefined
  var options = prop.options;
  if (!hasOwn(options, 'default')) {
    // absent boolean value defaults to false
    return options.type === Boolean ? false : undefined;
  }
  var def = options['default'];
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn('Invalid default value for prop "' + prop.name + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
  }
  // call factory function for non-Function types
  return typeof def === 'function' && options.type !== Function ? def.call(vm) : def;
}

/**
 * Assert whether a prop is valid.
 *
 * @param {Object} prop
 * @param {*} value
 * @param {Vue} vm
 */

function assertProp(prop, value, vm) {
  if (!prop.options.required && ( // non-required
  prop.raw === null || // abscent
  value == null) // null or undefined
  ) {
      return true;
    }
  var options = prop.options;
  var type = options.type;
  var valid = !type;
  var expectedTypes = [];
  if (type) {
    if (!isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType);
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    if (process.env.NODE_ENV !== 'production') {
      warn('Invalid prop: type check failed for prop "' + prop.name + '".' + ' Expected ' + expectedTypes.map(formatType).join(', ') + ', got ' + formatValue(value) + '.', vm);
    }
    return false;
  }
  var validator = options.validator;
  if (validator) {
    if (!validator(value)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop: custom validator check failed for prop "' + prop.name + '".', vm);
      return false;
    }
  }
  return true;
}

/**
 * Force parsing value with coerce option.
 *
 * @param {*} value
 * @param {Object} options
 * @return {*}
 */

function coerceProp(prop, value, vm) {
  var coerce = prop.options.coerce;
  if (!coerce) {
    return value;
  }
  if (typeof coerce === 'function') {
    return coerce(value);
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid coerce for prop "' + prop.name + '": expected function, got ' + typeof coerce + '.', vm);
    return value;
  }
}

/**
 * Assert the type of a value
 *
 * @param {*} value
 * @param {Function} type
 * @return {Object}
 */

function assertType(value, type) {
  var valid;
  var expectedType;
  if (type === String) {
    expectedType = 'string';
    valid = typeof value === expectedType;
  } else if (type === Number) {
    expectedType = 'number';
    valid = typeof value === expectedType;
  } else if (type === Boolean) {
    expectedType = 'boolean';
    valid = typeof value === expectedType;
  } else if (type === Function) {
    expectedType = 'function';
    valid = typeof value === expectedType;
  } else if (type === Object) {
    expectedType = 'object';
    valid = isPlainObject(value);
  } else if (type === Array) {
    expectedType = 'array';
    valid = isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  };
}

/**
 * Format type for output
 *
 * @param {String} type
 * @return {String}
 */

function formatType(type) {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'custom type';
}

/**
 * Format value
 *
 * @param {*} value
 * @return {String}
 */

function formatValue(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

var bindingModes = config._propBindingModes;

var propDef = {

  bind: function bind() {
    var child = this.vm;
    var parent = child._context;
    // passed in from compiler directly
    var prop = this.descriptor.prop;
    var childKey = prop.path;
    var parentKey = prop.parentPath;
    var twoWay = prop.mode === bindingModes.TWO_WAY;

    var parentWatcher = this.parentWatcher = new Watcher(parent, parentKey, function (val) {
      updateProp(child, prop, val);
    }, {
      twoWay: twoWay,
      filters: prop.filters,
      // important: props need to be observed on the
      // v-for scope if present
      scope: this._scope
    });

    // set the child initial value.
    initProp(child, prop, parentWatcher.value);

    // setup two-way binding
    if (twoWay) {
      // important: defer the child watcher creation until
      // the created hook (after data observation)
      var self = this;
      child.$once('pre-hook:created', function () {
        self.childWatcher = new Watcher(child, childKey, function (val) {
          parentWatcher.set(val);
        }, {
          // ensure sync upward before parent sync down.
          // this is necessary in cases e.g. the child
          // mutates a prop array, then replaces it. (#1683)
          sync: true
        });
      });
    }
  },

  unbind: function unbind() {
    this.parentWatcher.teardown();
    if (this.childWatcher) {
      this.childWatcher.teardown();
    }
  }
};

var queue$1 = [];
var queued = false;

/**
 * Push a job into the queue.
 *
 * @param {Function} job
 */

function pushJob(job) {
  queue$1.push(job);
  if (!queued) {
    queued = true;
    nextTick(flush);
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush() {
  // Force layout
  var f = document.documentElement.offsetHeight;
  for (var i = 0; i < queue$1.length; i++) {
    queue$1[i]();
  }
  queue$1 = [];
  queued = false;
  // dummy return, so js linters don't complain about
  // unused variable f
  return f;
}

var TYPE_TRANSITION = 'transition';
var TYPE_ANIMATION = 'animation';
var transDurationProp = transitionProp + 'Duration';
var animDurationProp = animationProp + 'Duration';

/**
 * If a just-entered element is applied the
 * leave class while its enter transition hasn't started yet,
 * and the transitioned property has the same value for both
 * enter/leave, then the leave transition will be skipped and
 * the transitionend event never fires. This function ensures
 * its callback to be called after a transition has started
 * by waiting for double raf.
 *
 * It falls back to setTimeout on devices that support CSS
 * transitions but not raf (e.g. Android 4.2 browser) - since
 * these environments are usually slow, we are giving it a
 * relatively large timeout.
 */

var raf = inBrowser && window.requestAnimationFrame;
var waitForTransitionStart = raf
/* istanbul ignore next */
? function (fn) {
  raf(function () {
    raf(fn);
  });
} : function (fn) {
  setTimeout(fn, 50);
};

/**
 * A Transition object that encapsulates the state and logic
 * of the transition.
 *
 * @param {Element} el
 * @param {String} id
 * @param {Object} hooks
 * @param {Vue} vm
 */
function Transition(el, id, hooks, vm) {
  this.id = id;
  this.el = el;
  this.enterClass = hooks && hooks.enterClass || id + '-enter';
  this.leaveClass = hooks && hooks.leaveClass || id + '-leave';
  this.hooks = hooks;
  this.vm = vm;
  // async state
  this.pendingCssEvent = this.pendingCssCb = this.cancel = this.pendingJsCb = this.op = this.cb = null;
  this.justEntered = false;
  this.entered = this.left = false;
  this.typeCache = {};
  // check css transition type
  this.type = hooks && hooks.type;
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production') {
    if (this.type && this.type !== TYPE_TRANSITION && this.type !== TYPE_ANIMATION) {
      warn('invalid CSS transition type for transition="' + this.id + '": ' + this.type, vm);
    }
  }
  // bind
  var self = this;['enterNextTick', 'enterDone', 'leaveNextTick', 'leaveDone'].forEach(function (m) {
    self[m] = bind(self[m], self);
  });
}

var p$1 = Transition.prototype;

/**
 * Start an entering transition.
 *
 * 1. enter transition triggered
 * 2. call beforeEnter hook
 * 3. add enter class
 * 4. insert/show element
 * 5. call enter hook (with possible explicit js callback)
 * 6. reflow
 * 7. based on transition type:
 *    - transition:
 *        remove class now, wait for transitionend,
 *        then done if there's no explicit js callback.
 *    - animation:
 *        wait for animationend, remove class,
 *        then done if there's no explicit js callback.
 *    - no css transition:
 *        done now if there's no explicit js callback.
 * 8. wait for either done or js callback, then call
 *    afterEnter hook.
 *
 * @param {Function} op - insert/show the element
 * @param {Function} [cb]
 */

p$1.enter = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeEnter');
  this.cb = cb;
  addClass(this.el, this.enterClass);
  op();
  this.entered = false;
  this.callHookWithCb('enter');
  if (this.entered) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.enterCancelled;
  pushJob(this.enterNextTick);
};

/**
 * The "nextTick" phase of an entering transition, which is
 * to be pushed into a queue and executed after a reflow so
 * that removing the class can trigger a CSS transition.
 */

p$1.enterNextTick = function () {
  var _this = this;

  // prevent transition skipping
  this.justEntered = true;
  waitForTransitionStart(function () {
    _this.justEntered = false;
  });
  var enterDone = this.enterDone;
  var type = this.getCssTransitionType(this.enterClass);
  if (!this.pendingJsCb) {
    if (type === TYPE_TRANSITION) {
      // trigger transition by removing enter class now
      removeClass(this.el, this.enterClass);
      this.setupCssCb(transitionEndEvent, enterDone);
    } else if (type === TYPE_ANIMATION) {
      this.setupCssCb(animationEndEvent, enterDone);
    } else {
      enterDone();
    }
  } else if (type === TYPE_TRANSITION) {
    removeClass(this.el, this.enterClass);
  }
};

/**
 * The "cleanup" phase of an entering transition.
 */

p$1.enterDone = function () {
  this.entered = true;
  this.cancel = this.pendingJsCb = null;
  removeClass(this.el, this.enterClass);
  this.callHook('afterEnter');
  if (this.cb) this.cb();
};

/**
 * Start a leaving transition.
 *
 * 1. leave transition triggered.
 * 2. call beforeLeave hook
 * 3. add leave class (trigger css transition)
 * 4. call leave hook (with possible explicit js callback)
 * 5. reflow if no explicit js callback is provided
 * 6. based on transition type:
 *    - transition or animation:
 *        wait for end event, remove class, then done if
 *        there's no explicit js callback.
 *    - no css transition:
 *        done if there's no explicit js callback.
 * 7. wait for either done or js callback, then call
 *    afterLeave hook.
 *
 * @param {Function} op - remove/hide the element
 * @param {Function} [cb]
 */

p$1.leave = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeLeave');
  this.op = op;
  this.cb = cb;
  addClass(this.el, this.leaveClass);
  this.left = false;
  this.callHookWithCb('leave');
  if (this.left) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.leaveCancelled;
  // only need to handle leaveDone if
  // 1. the transition is already done (synchronously called
  //    by the user, which causes this.op set to null)
  // 2. there's no explicit js callback
  if (this.op && !this.pendingJsCb) {
    // if a CSS transition leaves immediately after enter,
    // the transitionend event never fires. therefore we
    // detect such cases and end the leave immediately.
    if (this.justEntered) {
      this.leaveDone();
    } else {
      pushJob(this.leaveNextTick);
    }
  }
};

/**
 * The "nextTick" phase of a leaving transition.
 */

p$1.leaveNextTick = function () {
  var type = this.getCssTransitionType(this.leaveClass);
  if (type) {
    var event = type === TYPE_TRANSITION ? transitionEndEvent : animationEndEvent;
    this.setupCssCb(event, this.leaveDone);
  } else {
    this.leaveDone();
  }
};

/**
 * The "cleanup" phase of a leaving transition.
 */

p$1.leaveDone = function () {
  this.left = true;
  this.cancel = this.pendingJsCb = null;
  this.op();
  removeClass(this.el, this.leaveClass);
  this.callHook('afterLeave');
  if (this.cb) this.cb();
  this.op = null;
};

/**
 * Cancel any pending callbacks from a previously running
 * but not finished transition.
 */

p$1.cancelPending = function () {
  this.op = this.cb = null;
  var hasPending = false;
  if (this.pendingCssCb) {
    hasPending = true;
    off(this.el, this.pendingCssEvent, this.pendingCssCb);
    this.pendingCssEvent = this.pendingCssCb = null;
  }
  if (this.pendingJsCb) {
    hasPending = true;
    this.pendingJsCb.cancel();
    this.pendingJsCb = null;
  }
  if (hasPending) {
    removeClass(this.el, this.enterClass);
    removeClass(this.el, this.leaveClass);
  }
  if (this.cancel) {
    this.cancel.call(this.vm, this.el);
    this.cancel = null;
  }
};

/**
 * Call a user-provided synchronous hook function.
 *
 * @param {String} type
 */

p$1.callHook = function (type) {
  if (this.hooks && this.hooks[type]) {
    this.hooks[type].call(this.vm, this.el);
  }
};

/**
 * Call a user-provided, potentially-async hook function.
 * We check for the length of arguments to see if the hook
 * expects a `done` callback. If true, the transition's end
 * will be determined by when the user calls that callback;
 * otherwise, the end is determined by the CSS transition or
 * animation.
 *
 * @param {String} type
 */

p$1.callHookWithCb = function (type) {
  var hook = this.hooks && this.hooks[type];
  if (hook) {
    if (hook.length > 1) {
      this.pendingJsCb = cancellable(this[type + 'Done']);
    }
    hook.call(this.vm, this.el, this.pendingJsCb);
  }
};

/**
 * Get an element's transition type based on the
 * calculated styles.
 *
 * @param {String} className
 * @return {Number}
 */

p$1.getCssTransitionType = function (className) {
  /* istanbul ignore if */
  if (!transitionEndEvent ||
  // skip CSS transitions if page is not visible -
  // this solves the issue of transitionend events not
  // firing until the page is visible again.
  // pageVisibility API is supported in IE10+, same as
  // CSS transitions.
  document.hidden ||
  // explicit js-only transition
  this.hooks && this.hooks.css === false ||
  // element is hidden
  isHidden(this.el)) {
    return;
  }
  var type = this.type || this.typeCache[className];
  if (type) return type;
  var inlineStyles = this.el.style;
  var computedStyles = window.getComputedStyle(this.el);
  var transDuration = inlineStyles[transDurationProp] || computedStyles[transDurationProp];
  if (transDuration && transDuration !== '0s') {
    type = TYPE_TRANSITION;
  } else {
    var animDuration = inlineStyles[animDurationProp] || computedStyles[animDurationProp];
    if (animDuration && animDuration !== '0s') {
      type = TYPE_ANIMATION;
    }
  }
  if (type) {
    this.typeCache[className] = type;
  }
  return type;
};

/**
 * Setup a CSS transitionend/animationend callback.
 *
 * @param {String} event
 * @param {Function} cb
 */

p$1.setupCssCb = function (event, cb) {
  this.pendingCssEvent = event;
  var self = this;
  var el = this.el;
  var onEnd = this.pendingCssCb = function (e) {
    if (e.target === el) {
      off(el, event, onEnd);
      self.pendingCssEvent = self.pendingCssCb = null;
      if (!self.pendingJsCb && cb) {
        cb();
      }
    }
  };
  on(el, event, onEnd);
};

/**
 * Check if an element is hidden - in that case we can just
 * skip the transition alltogether.
 *
 * @param {Element} el
 * @return {Boolean}
 */

function isHidden(el) {
  if (/svg$/.test(el.namespaceURI)) {
    // SVG elements do not have offset(Width|Height)
    // so we need to check the client rect
    var rect = el.getBoundingClientRect();
    return !(rect.width || rect.height);
  } else {
    return !(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
}

var transition$1 = {

  priority: TRANSITION,

  update: function update(id, oldId) {
    var el = this.el;
    // resolve on owner vm
    var hooks = resolveAsset(this.vm.$options, 'transitions', id);
    id = id || 'v';
    oldId = oldId || 'v';
    el.__v_trans = new Transition(el, id, hooks, this.vm);
    removeClass(el, oldId + '-transition');
    addClass(el, id + '-transition');
  }
};

var internalDirectives = {
  style: style,
  'class': vClass,
  component: component,
  prop: propDef,
  transition: transition$1
};

// special binding prefixes
var bindRE = /^v-bind:|^:/;
var onRE = /^v-on:|^@/;
var dirAttrRE = /^v-([^:]+)(?:$|:(.*)$)/;
var modifierRE = /\.[^\.]+/g;
var transitionRE = /^(v-bind:|:)?transition$/;

// default directive priority
var DEFAULT_PRIORITY = 1000;
var DEFAULT_TERMINAL_PRIORITY = 2000;

/**
 * Compile a template and return a reusable composite link
 * function, which recursively contains more link functions
 * inside. This top level compile function would normally
 * be called on instance root nodes, but can also be used
 * for partial compilation if the partial argument is true.
 *
 * The returned composite link function, when called, will
 * return an unlink function that tearsdown all directives
 * created during the linking phase.
 *
 * @param {Element|DocumentFragment} el
 * @param {Object} options
 * @param {Boolean} partial
 * @return {Function}
 */

function compile(el, options, partial) {
  // link function for the node itself.
  var nodeLinkFn = partial || !options._asComponent ? compileNode(el, options) : null;
  // link function for the childNodes
  var childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && !isScript(el) && el.hasChildNodes() ? compileNodeList(el.childNodes, options) : null;

  /**
   * A composite linker function to be called on a already
   * compiled piece of DOM, which instantiates all directive
   * instances.
   *
   * @param {Vue} vm
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host] - host vm of transcluded content
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - link context fragment
   * @return {Function|undefined}
   */

  return function compositeLinkFn(vm, el, host, scope, frag) {
    // cache childNodes before linking parent, fix #657
    var childNodes = toArray(el.childNodes);
    // link
    var dirs = linkAndCapture(function compositeLinkCapturer() {
      if (nodeLinkFn) nodeLinkFn(vm, el, host, scope, frag);
      if (childLinkFn) childLinkFn(vm, childNodes, host, scope, frag);
    }, vm);
    return makeUnlinkFn(vm, dirs);
  };
}

/**
 * Apply a linker to a vm/element pair and capture the
 * directives created during the process.
 *
 * @param {Function} linker
 * @param {Vue} vm
 */

function linkAndCapture(linker, vm) {
  /* istanbul ignore if */
  if (process.env.NODE_ENV === 'production') {
    // reset directives before every capture in production
    // mode, so that when unlinking we don't need to splice
    // them out (which turns out to be a perf hit).
    // they are kept in development mode because they are
    // useful for Vue's own tests.
    vm._directives = [];
  }
  var originalDirCount = vm._directives.length;
  linker();
  var dirs = vm._directives.slice(originalDirCount);
  dirs.sort(directiveComparator);
  for (var i = 0, l = dirs.length; i < l; i++) {
    dirs[i]._bind();
  }
  return dirs;
}

/**
 * Directive priority sort comparator
 *
 * @param {Object} a
 * @param {Object} b
 */

function directiveComparator(a, b) {
  a = a.descriptor.def.priority || DEFAULT_PRIORITY;
  b = b.descriptor.def.priority || DEFAULT_PRIORITY;
  return a > b ? -1 : a === b ? 0 : 1;
}

/**
 * Linker functions return an unlink function that
 * tearsdown all directives instances generated during
 * the process.
 *
 * We create unlink functions with only the necessary
 * information to avoid retaining additional closures.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Vue} [context]
 * @param {Array} [contextDirs]
 * @return {Function}
 */

function makeUnlinkFn(vm, dirs, context, contextDirs) {
  function unlink(destroying) {
    teardownDirs(vm, dirs, destroying);
    if (context && contextDirs) {
      teardownDirs(context, contextDirs);
    }
  }
  // expose linked directives
  unlink.dirs = dirs;
  return unlink;
}

/**
 * Teardown partial linked directives.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Boolean} destroying
 */

function teardownDirs(vm, dirs, destroying) {
  var i = dirs.length;
  while (i--) {
    dirs[i]._teardown();
    if (process.env.NODE_ENV !== 'production' && !destroying) {
      vm._directives.$remove(dirs[i]);
    }
  }
}

/**
 * Compile link props on an instance.
 *
 * @param {Vue} vm
 * @param {Element} el
 * @param {Object} props
 * @param {Object} [scope]
 * @return {Function}
 */

function compileAndLinkProps(vm, el, props, scope) {
  var propsLinkFn = compileProps(el, props, vm);
  var propDirs = linkAndCapture(function () {
    propsLinkFn(vm, scope);
  }, vm);
  return makeUnlinkFn(vm, propDirs);
}

/**
 * Compile the root element of an instance.
 *
 * 1. attrs on context container (context scope)
 * 2. attrs on the component template root node, if
 *    replace:true (child scope)
 *
 * If this is a fragment instance, we only need to compile 1.
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Object} contextOptions
 * @return {Function}
 */

function compileRoot(el, options, contextOptions) {
  var containerAttrs = options._containerAttrs;
  var replacerAttrs = options._replacerAttrs;
  var contextLinkFn, replacerLinkFn;

  // only need to compile other attributes for
  // non-fragment instances
  if (el.nodeType !== 11) {
    // for components, container and replacer need to be
    // compiled separately and linked in different scopes.
    if (options._asComponent) {
      // 2. container attributes
      if (containerAttrs && contextOptions) {
        contextLinkFn = compileDirectives(containerAttrs, contextOptions);
      }
      if (replacerAttrs) {
        // 3. replacer attributes
        replacerLinkFn = compileDirectives(replacerAttrs, options);
      }
    } else {
      // non-component, just compile as a normal element.
      replacerLinkFn = compileDirectives(el.attributes, options);
    }
  } else if (process.env.NODE_ENV !== 'production' && containerAttrs) {
    // warn container directives for fragment instances
    var names = containerAttrs.filter(function (attr) {
      // allow vue-loader/vueify scoped css attributes
      return attr.name.indexOf('_v-') < 0 &&
      // allow event listeners
      !onRE.test(attr.name) &&
      // allow slots
      attr.name !== 'slot';
    }).map(function (attr) {
      return '"' + attr.name + '"';
    });
    if (names.length) {
      var plural = names.length > 1;
      warn('Attribute' + (plural ? 's ' : ' ') + names.join(', ') + (plural ? ' are' : ' is') + ' ignored on component ' + '<' + options.el.tagName.toLowerCase() + '> because ' + 'the component is a fragment instance: ' + 'http://vuejs.org/guide/components.html#Fragment-Instance');
    }
  }

  options._containerAttrs = options._replacerAttrs = null;
  return function rootLinkFn(vm, el, scope) {
    // link context scope dirs
    var context = vm._context;
    var contextDirs;
    if (context && contextLinkFn) {
      contextDirs = linkAndCapture(function () {
        contextLinkFn(context, el, null, scope);
      }, context);
    }

    // link self
    var selfDirs = linkAndCapture(function () {
      if (replacerLinkFn) replacerLinkFn(vm, el);
    }, vm);

    // return the unlink function that tearsdown context
    // container directives.
    return makeUnlinkFn(vm, selfDirs, context, contextDirs);
  };
}

/**
 * Compile a node and return a nodeLinkFn based on the
 * node type.
 *
 * @param {Node} node
 * @param {Object} options
 * @return {Function|null}
 */

function compileNode(node, options) {
  var type = node.nodeType;
  if (type === 1 && !isScript(node)) {
    return compileElement(node, options);
  } else if (type === 3 && node.data.trim()) {
    return compileTextNode(node, options);
  } else {
    return null;
  }
}

/**
 * Compile an element and return a nodeLinkFn.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|null}
 */

function compileElement(el, options) {
  // preprocess textareas.
  // textarea treats its text content as the initial value.
  // just bind it as an attr directive for value.
  if (el.tagName === 'TEXTAREA') {
    var tokens = parseText(el.value);
    if (tokens) {
      el.setAttribute(':value', tokensToExp(tokens));
      el.value = '';
    }
  }
  var linkFn;
  var hasAttrs = el.hasAttributes();
  var attrs = hasAttrs && toArray(el.attributes);
  // check terminal directives (for & if)
  if (hasAttrs) {
    linkFn = checkTerminalDirectives(el, attrs, options);
  }
  // check element directives
  if (!linkFn) {
    linkFn = checkElementDirectives(el, options);
  }
  // check component
  if (!linkFn) {
    linkFn = checkComponent(el, options);
  }
  // normal directives
  if (!linkFn && hasAttrs) {
    linkFn = compileDirectives(attrs, options);
  }
  return linkFn;
}

/**
 * Compile a textNode and return a nodeLinkFn.
 *
 * @param {TextNode} node
 * @param {Object} options
 * @return {Function|null} textNodeLinkFn
 */

function compileTextNode(node, options) {
  // skip marked text nodes
  if (node._skip) {
    return removeText;
  }

  var tokens = parseText(node.wholeText);
  if (!tokens) {
    return null;
  }

  // mark adjacent text nodes as skipped,
  // because we are using node.wholeText to compile
  // all adjacent text nodes together. This fixes
  // issues in IE where sometimes it splits up a single
  // text node into multiple ones.
  var next = node.nextSibling;
  while (next && next.nodeType === 3) {
    next._skip = true;
    next = next.nextSibling;
  }

  var frag = document.createDocumentFragment();
  var el, token;
  for (var i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];
    el = token.tag ? processTextToken(token, options) : document.createTextNode(token.value);
    frag.appendChild(el);
  }
  return makeTextNodeLinkFn(tokens, frag, options);
}

/**
 * Linker for an skipped text node.
 *
 * @param {Vue} vm
 * @param {Text} node
 */

function removeText(vm, node) {
  remove(node);
}

/**
 * Process a single text token.
 *
 * @param {Object} token
 * @param {Object} options
 * @return {Node}
 */

function processTextToken(token, options) {
  var el;
  if (token.oneTime) {
    el = document.createTextNode(token.value);
  } else {
    if (token.html) {
      el = document.createComment('v-html');
      setTokenType('html');
    } else {
      // IE will clean up empty textNodes during
      // frag.cloneNode(true), so we have to give it
      // something here...
      el = document.createTextNode(' ');
      setTokenType('text');
    }
  }
  function setTokenType(type) {
    if (token.descriptor) return;
    var parsed = parseDirective(token.value);
    token.descriptor = {
      name: type,
      def: directives[type],
      expression: parsed.expression,
      filters: parsed.filters
    };
  }
  return el;
}

/**
 * Build a function that processes a textNode.
 *
 * @param {Array<Object>} tokens
 * @param {DocumentFragment} frag
 */

function makeTextNodeLinkFn(tokens, frag) {
  return function textNodeLinkFn(vm, el, host, scope) {
    var fragClone = frag.cloneNode(true);
    var childNodes = toArray(fragClone.childNodes);
    var token, value, node;
    for (var i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i];
      value = token.value;
      if (token.tag) {
        node = childNodes[i];
        if (token.oneTime) {
          value = (scope || vm).$eval(value);
          if (token.html) {
            replace(node, parseTemplate(value, true));
          } else {
            node.data = _toString(value);
          }
        } else {
          vm._bindDir(token.descriptor, node, host, scope);
        }
      }
    }
    replace(el, fragClone);
  };
}

/**
 * Compile a node list and return a childLinkFn.
 *
 * @param {NodeList} nodeList
 * @param {Object} options
 * @return {Function|undefined}
 */

function compileNodeList(nodeList, options) {
  var linkFns = [];
  var nodeLinkFn, childLinkFn, node;
  for (var i = 0, l = nodeList.length; i < l; i++) {
    node = nodeList[i];
    nodeLinkFn = compileNode(node, options);
    childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && node.tagName !== 'SCRIPT' && node.hasChildNodes() ? compileNodeList(node.childNodes, options) : null;
    linkFns.push(nodeLinkFn, childLinkFn);
  }
  return linkFns.length ? makeChildLinkFn(linkFns) : null;
}

/**
 * Make a child link function for a node's childNodes.
 *
 * @param {Array<Function>} linkFns
 * @return {Function} childLinkFn
 */

function makeChildLinkFn(linkFns) {
  return function childLinkFn(vm, nodes, host, scope, frag) {
    var node, nodeLinkFn, childrenLinkFn;
    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
      node = nodes[n];
      nodeLinkFn = linkFns[i++];
      childrenLinkFn = linkFns[i++];
      // cache childNodes before linking parent, fix #657
      var childNodes = toArray(node.childNodes);
      if (nodeLinkFn) {
        nodeLinkFn(vm, node, host, scope, frag);
      }
      if (childrenLinkFn) {
        childrenLinkFn(vm, childNodes, host, scope, frag);
      }
    }
  };
}

/**
 * Check for element directives (custom elements that should
 * be resovled as terminal directives).
 *
 * @param {Element} el
 * @param {Object} options
 */

function checkElementDirectives(el, options) {
  var tag = el.tagName.toLowerCase();
  if (commonTagRE.test(tag)) {
    return;
  }
  var def = resolveAsset(options, 'elementDirectives', tag);
  if (def) {
    return makeTerminalNodeLinkFn(el, tag, '', options, def);
  }
}

/**
 * Check if an element is a component. If yes, return
 * a component link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|undefined}
 */

function checkComponent(el, options) {
  var component = checkComponentAttr(el, options);
  if (component) {
    var ref = findRef(el);
    var descriptor = {
      name: 'component',
      ref: ref,
      expression: component.id,
      def: internalDirectives.component,
      modifiers: {
        literal: !component.dynamic
      }
    };
    var componentLinkFn = function componentLinkFn(vm, el, host, scope, frag) {
      if (ref) {
        defineReactive((scope || vm).$refs, ref, null);
      }
      vm._bindDir(descriptor, el, host, scope, frag);
    };
    componentLinkFn.terminal = true;
    return componentLinkFn;
  }
}

/**
 * Check an element for terminal directives in fixed order.
 * If it finds one, return a terminal link function.
 *
 * @param {Element} el
 * @param {Array} attrs
 * @param {Object} options
 * @return {Function} terminalLinkFn
 */

function checkTerminalDirectives(el, attrs, options) {
  // skip v-pre
  if (getAttr(el, 'v-pre') !== null) {
    return skip;
  }
  // skip v-else block, but only if following v-if
  if (el.hasAttribute('v-else')) {
    var prev = el.previousElementSibling;
    if (prev && prev.hasAttribute('v-if')) {
      return skip;
    }
  }

  var attr, name, value, modifiers, matched, dirName, rawName, arg, def, termDef;
  for (var i = 0, j = attrs.length; i < j; i++) {
    attr = attrs[i];
    name = attr.name.replace(modifierRE, '');
    if (matched = name.match(dirAttrRE)) {
      def = resolveAsset(options, 'directives', matched[1]);
      if (def && def.terminal) {
        if (!termDef || (def.priority || DEFAULT_TERMINAL_PRIORITY) > termDef.priority) {
          termDef = def;
          rawName = attr.name;
          modifiers = parseModifiers(attr.name);
          value = attr.value;
          dirName = matched[1];
          arg = matched[2];
        }
      }
    }
  }

  if (termDef) {
    return makeTerminalNodeLinkFn(el, dirName, value, options, termDef, rawName, arg, modifiers);
  }
}

function skip() {}
skip.terminal = true;

/**
 * Build a node link function for a terminal directive.
 * A terminal link function terminates the current
 * compilation recursion and handles compilation of the
 * subtree in the directive.
 *
 * @param {Element} el
 * @param {String} dirName
 * @param {String} value
 * @param {Object} options
 * @param {Object} def
 * @param {String} [rawName]
 * @param {String} [arg]
 * @param {Object} [modifiers]
 * @return {Function} terminalLinkFn
 */

function makeTerminalNodeLinkFn(el, dirName, value, options, def, rawName, arg, modifiers) {
  var parsed = parseDirective(value);
  var descriptor = {
    name: dirName,
    arg: arg,
    expression: parsed.expression,
    filters: parsed.filters,
    raw: value,
    attr: rawName,
    modifiers: modifiers,
    def: def
  };
  // check ref for v-for and router-view
  if (dirName === 'for' || dirName === 'router-view') {
    descriptor.ref = findRef(el);
  }
  var fn = function terminalNodeLinkFn(vm, el, host, scope, frag) {
    if (descriptor.ref) {
      defineReactive((scope || vm).$refs, descriptor.ref, null);
    }
    vm._bindDir(descriptor, el, host, scope, frag);
  };
  fn.terminal = true;
  return fn;
}

/**
 * Compile the directives on an element and return a linker.
 *
 * @param {Array|NamedNodeMap} attrs
 * @param {Object} options
 * @return {Function}
 */

function compileDirectives(attrs, options) {
  var i = attrs.length;
  var dirs = [];
  var attr, name, value, rawName, rawValue, dirName, arg, modifiers, dirDef, tokens, matched;
  while (i--) {
    attr = attrs[i];
    name = rawName = attr.name;
    value = rawValue = attr.value;
    tokens = parseText(value);
    // reset arg
    arg = null;
    // check modifiers
    modifiers = parseModifiers(name);
    name = name.replace(modifierRE, '');

    // attribute interpolations
    if (tokens) {
      value = tokensToExp(tokens);
      arg = name;
      pushDir('bind', directives.bind, tokens);
      // warn against mixing mustaches with v-bind
      if (process.env.NODE_ENV !== 'production') {
        if (name === 'class' && Array.prototype.some.call(attrs, function (attr) {
          return attr.name === ':class' || attr.name === 'v-bind:class';
        })) {
          warn('class="' + rawValue + '": Do not mix mustache interpolation ' + 'and v-bind for "class" on the same element. Use one or the other.', options);
        }
      }
    } else

      // special attribute: transition
      if (transitionRE.test(name)) {
        modifiers.literal = !bindRE.test(name);
        pushDir('transition', internalDirectives.transition);
      } else

        // event handlers
        if (onRE.test(name)) {
          arg = name.replace(onRE, '');
          pushDir('on', directives.on);
        } else

          // attribute bindings
          if (bindRE.test(name)) {
            dirName = name.replace(bindRE, '');
            if (dirName === 'style' || dirName === 'class') {
              pushDir(dirName, internalDirectives[dirName]);
            } else {
              arg = dirName;
              pushDir('bind', directives.bind);
            }
          } else

            // normal directives
            if (matched = name.match(dirAttrRE)) {
              dirName = matched[1];
              arg = matched[2];

              // skip v-else (when used with v-show)
              if (dirName === 'else') {
                continue;
              }

              dirDef = resolveAsset(options, 'directives', dirName, true);
              if (dirDef) {
                pushDir(dirName, dirDef);
              }
            }
  }

  /**
   * Push a directive.
   *
   * @param {String} dirName
   * @param {Object|Function} def
   * @param {Array} [interpTokens]
   */

  function pushDir(dirName, def, interpTokens) {
    var hasOneTimeToken = interpTokens && hasOneTime(interpTokens);
    var parsed = !hasOneTimeToken && parseDirective(value);
    dirs.push({
      name: dirName,
      attr: rawName,
      raw: rawValue,
      def: def,
      arg: arg,
      modifiers: modifiers,
      // conversion from interpolation strings with one-time token
      // to expression is differed until directive bind time so that we
      // have access to the actual vm context for one-time bindings.
      expression: parsed && parsed.expression,
      filters: parsed && parsed.filters,
      interp: interpTokens,
      hasOneTime: hasOneTimeToken
    });
  }

  if (dirs.length) {
    return makeNodeLinkFn(dirs);
  }
}

/**
 * Parse modifiers from directive attribute name.
 *
 * @param {String} name
 * @return {Object}
 */

function parseModifiers(name) {
  var res = Object.create(null);
  var match = name.match(modifierRE);
  if (match) {
    var i = match.length;
    while (i--) {
      res[match[i].slice(1)] = true;
    }
  }
  return res;
}

/**
 * Build a link function for all directives on a single node.
 *
 * @param {Array} directives
 * @return {Function} directivesLinkFn
 */

function makeNodeLinkFn(directives) {
  return function nodeLinkFn(vm, el, host, scope, frag) {
    // reverse apply because it's sorted low to high
    var i = directives.length;
    while (i--) {
      vm._bindDir(directives[i], el, host, scope, frag);
    }
  };
}

/**
 * Check if an interpolation string contains one-time tokens.
 *
 * @param {Array} tokens
 * @return {Boolean}
 */

function hasOneTime(tokens) {
  var i = tokens.length;
  while (i--) {
    if (tokens[i].oneTime) return true;
  }
}

function isScript(el) {
  return el.tagName === 'SCRIPT' && (!el.hasAttribute('type') || el.getAttribute('type') === 'text/javascript');
}

var specialCharRE = /[^\w\-:\.]/;

/**
 * Process an element or a DocumentFragment based on a
 * instance option object. This allows us to transclude
 * a template node/fragment before the instance is created,
 * so the processed fragment can then be cloned and reused
 * in v-for.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transclude(el, options) {
  // extract container attributes to pass them down
  // to compiler, because they need to be compiled in
  // parent scope. we are mutating the options object here
  // assuming the same object will be used for compile
  // right after this.
  if (options) {
    options._containerAttrs = extractAttrs(el);
  }
  // for template tags, what we want is its content as
  // a documentFragment (for fragment instances)
  if (isTemplate(el)) {
    el = parseTemplate(el);
  }
  if (options) {
    if (options._asComponent && !options.template) {
      options.template = '<slot></slot>';
    }
    if (options.template) {
      options._content = extractContent(el);
      el = transcludeTemplate(el, options);
    }
  }
  if (isFragment(el)) {
    // anchors for fragment instance
    // passing in `persist: true` to avoid them being
    // discarded by IE during template cloning
    prepend(createAnchor('v-start', true), el);
    el.appendChild(createAnchor('v-end', true));
  }
  return el;
}

/**
 * Process the template option.
 * If the replace option is true this will swap the $el.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transcludeTemplate(el, options) {
  var template = options.template;
  var frag = parseTemplate(template, true);
  if (frag) {
    var replacer = frag.firstChild;
    var tag = replacer.tagName && replacer.tagName.toLowerCase();
    if (options.replace) {
      /* istanbul ignore if */
      if (el === document.body) {
        process.env.NODE_ENV !== 'production' && warn('You are mounting an instance with a template to ' + '<body>. This will replace <body> entirely. You ' + 'should probably use `replace: false` here.');
      }
      // there are many cases where the instance must
      // become a fragment instance: basically anything that
      // can create more than 1 root nodes.
      if (
      // multi-children template
      frag.childNodes.length > 1 ||
      // non-element template
      replacer.nodeType !== 1 ||
      // single nested component
      tag === 'component' || resolveAsset(options, 'components', tag) || hasBindAttr(replacer, 'is') ||
      // element directive
      resolveAsset(options, 'elementDirectives', tag) ||
      // for block
      replacer.hasAttribute('v-for') ||
      // if block
      replacer.hasAttribute('v-if')) {
        return frag;
      } else {
        options._replacerAttrs = extractAttrs(replacer);
        mergeAttrs(el, replacer);
        return replacer;
      }
    } else {
      el.appendChild(frag);
      return el;
    }
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid template option: ' + template);
  }
}

/**
 * Helper to extract a component container's attributes
 * into a plain object array.
 *
 * @param {Element} el
 * @return {Array}
 */

function extractAttrs(el) {
  if (el.nodeType === 1 && el.hasAttributes()) {
    return toArray(el.attributes);
  }
}

/**
 * Merge the attributes of two elements, and make sure
 * the class names are merged properly.
 *
 * @param {Element} from
 * @param {Element} to
 */

function mergeAttrs(from, to) {
  var attrs = from.attributes;
  var i = attrs.length;
  var name, value;
  while (i--) {
    name = attrs[i].name;
    value = attrs[i].value;
    if (!to.hasAttribute(name) && !specialCharRE.test(name)) {
      to.setAttribute(name, value);
    } else if (name === 'class' && !parseText(value) && (value = value.trim())) {
      value.split(/\s+/).forEach(function (cls) {
        addClass(to, cls);
      });
    }
  }
}

/**
 * Scan and determine slot content distribution.
 * We do this during transclusion instead at compile time so that
 * the distribution is decoupled from the compilation order of
 * the slots.
 *
 * @param {Element|DocumentFragment} template
 * @param {Element} content
 * @param {Vue} vm
 */

function resolveSlots(vm, content) {
  if (!content) {
    return;
  }
  var contents = vm._slotContents = Object.create(null);
  var el, name;
  for (var i = 0, l = content.children.length; i < l; i++) {
    el = content.children[i];
    /* eslint-disable no-cond-assign */
    if (name = el.getAttribute('slot')) {
      (contents[name] || (contents[name] = [])).push(el);
    }
    /* eslint-enable no-cond-assign */
    if (process.env.NODE_ENV !== 'production' && getBindAttr(el, 'slot')) {
      warn('The "slot" attribute must be static.', vm.$parent);
    }
  }
  for (name in contents) {
    contents[name] = extractFragment(contents[name], content);
  }
  if (content.hasChildNodes()) {
    var nodes = content.childNodes;
    if (nodes.length === 1 && nodes[0].nodeType === 3 && !nodes[0].data.trim()) {
      return;
    }
    contents['default'] = extractFragment(content.childNodes, content);
  }
}

/**
 * Extract qualified content nodes from a node list.
 *
 * @param {NodeList} nodes
 * @return {DocumentFragment}
 */

function extractFragment(nodes, parent) {
  var frag = document.createDocumentFragment();
  nodes = toArray(nodes);
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i];
    if (isTemplate(node) && !node.hasAttribute('v-if') && !node.hasAttribute('v-for')) {
      parent.removeChild(node);
      node = parseTemplate(node, true);
    }
    frag.appendChild(node);
  }
  return frag;
}



var compiler = Object.freeze({
	compile: compile,
	compileAndLinkProps: compileAndLinkProps,
	compileRoot: compileRoot,
	transclude: transclude,
	resolveSlots: resolveSlots
});

function stateMixin (Vue) {
  /**
   * Accessor for `$data` property, since setting $data
   * requires observing the new object and updating
   * proxied properties.
   */

  Object.defineProperty(Vue.prototype, '$data', {
    get: function get() {
      return this._data;
    },
    set: function set(newData) {
      if (newData !== this._data) {
        this._setData(newData);
      }
    }
  });

  /**
   * Setup the scope of an instance, which contains:
   * - observed data
   * - computed properties
   * - user methods
   * - meta properties
   */

  Vue.prototype._initState = function () {
    this._initProps();
    this._initMeta();
    this._initMethods();
    this._initData();
    this._initComputed();
  };

  /**
   * Initialize props.
   */

  Vue.prototype._initProps = function () {
    var options = this.$options;
    var el = options.el;
    var props = options.props;
    if (props && !el) {
      process.env.NODE_ENV !== 'production' && warn('Props will not be compiled if no `el` option is ' + 'provided at instantiation.', this);
    }
    // make sure to convert string selectors into element now
    el = options.el = query(el);
    this._propsUnlinkFn = el && el.nodeType === 1 && props
    // props must be linked in proper scope if inside v-for
    ? compileAndLinkProps(this, el, props, this._scope) : null;
  };

  /**
   * Initialize the data.
   */

  Vue.prototype._initData = function () {
    var dataFn = this.$options.data;
    var data = this._data = dataFn ? dataFn() : {};
    if (!isPlainObject(data)) {
      data = {};
      process.env.NODE_ENV !== 'production' && warn('data functions should return an object.', this);
    }
    var props = this._props;
    // proxy data on instance
    var keys = Object.keys(data);
    var i, key;
    i = keys.length;
    while (i--) {
      key = keys[i];
      // there are two scenarios where we can proxy a data key:
      // 1. it's not already defined as a prop
      // 2. it's provided via a instantiation option AND there are no
      //    template prop present
      if (!props || !hasOwn(props, key)) {
        this._proxy(key);
      } else if (process.env.NODE_ENV !== 'production') {
        warn('Data field "' + key + '" is already defined ' + 'as a prop. To provide default value for a prop, use the "default" ' + 'prop option; if you want to pass prop values to an instantiation ' + 'call, use the "propsData" option.', this);
      }
    }
    // observe data
    observe(data, this);
  };

  /**
   * Swap the instance's $data. Called in $data's setter.
   *
   * @param {Object} newData
   */

  Vue.prototype._setData = function (newData) {
    newData = newData || {};
    var oldData = this._data;
    this._data = newData;
    var keys, key, i;
    // unproxy keys not present in new data
    keys = Object.keys(oldData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!(key in newData)) {
        this._unproxy(key);
      }
    }
    // proxy keys not already proxied,
    // and trigger change for changed values
    keys = Object.keys(newData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!hasOwn(this, key)) {
        // new property
        this._proxy(key);
      }
    }
    oldData.__ob__.removeVm(this);
    observe(newData, this);
    this._digest();
  };

  /**
   * Proxy a property, so that
   * vm.prop === vm._data.prop
   *
   * @param {String} key
   */

  Vue.prototype._proxy = function (key) {
    if (!isReserved(key)) {
      // need to store ref to self here
      // because these getter/setters might
      // be called by child scopes via
      // prototype inheritance.
      var self = this;
      Object.defineProperty(self, key, {
        configurable: true,
        enumerable: true,
        get: function proxyGetter() {
          return self._data[key];
        },
        set: function proxySetter(val) {
          self._data[key] = val;
        }
      });
    }
  };

  /**
   * Unproxy a property.
   *
   * @param {String} key
   */

  Vue.prototype._unproxy = function (key) {
    if (!isReserved(key)) {
      delete this[key];
    }
  };

  /**
   * Force update on every watcher in scope.
   */

  Vue.prototype._digest = function () {
    for (var i = 0, l = this._watchers.length; i < l; i++) {
      this._watchers[i].update(true); // shallow updates
    }
  };

  /**
   * Setup computed properties. They are essentially
   * special getter/setters
   */

  function noop() {}
  Vue.prototype._initComputed = function () {
    var computed = this.$options.computed;
    if (computed) {
      for (var key in computed) {
        var userDef = computed[key];
        var def = {
          enumerable: true,
          configurable: true
        };
        if (typeof userDef === 'function') {
          def.get = makeComputedGetter(userDef, this);
          def.set = noop;
        } else {
          def.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, this) : bind(userDef.get, this) : noop;
          def.set = userDef.set ? bind(userDef.set, this) : noop;
        }
        Object.defineProperty(this, key, def);
      }
    }
  };

  function makeComputedGetter(getter, owner) {
    var watcher = new Watcher(owner, getter, null, {
      lazy: true
    });
    return function computedGetter() {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    };
  }

  /**
   * Setup instance methods. Methods must be bound to the
   * instance since they might be passed down as a prop to
   * child components.
   */

  Vue.prototype._initMethods = function () {
    var methods = this.$options.methods;
    if (methods) {
      for (var key in methods) {
        this[key] = bind(methods[key], this);
      }
    }
  };

  /**
   * Initialize meta information like $index, $key & $value.
   */

  Vue.prototype._initMeta = function () {
    var metas = this.$options._meta;
    if (metas) {
      for (var key in metas) {
        defineReactive(this, key, metas[key]);
      }
    }
  };
}

var eventRE = /^v-on:|^@/;

function eventsMixin (Vue) {
  /**
   * Setup the instance's option events & watchers.
   * If the value is a string, we pull it from the
   * instance's methods by name.
   */

  Vue.prototype._initEvents = function () {
    var options = this.$options;
    if (options._asComponent) {
      registerComponentEvents(this, options.el);
    }
    registerCallbacks(this, '$on', options.events);
    registerCallbacks(this, '$watch', options.watch);
  };

  /**
   * Register v-on events on a child component
   *
   * @param {Vue} vm
   * @param {Element} el
   */

  function registerComponentEvents(vm, el) {
    var attrs = el.attributes;
    var name, value, handler;
    for (var i = 0, l = attrs.length; i < l; i++) {
      name = attrs[i].name;
      if (eventRE.test(name)) {
        name = name.replace(eventRE, '');
        // force the expression into a statement so that
        // it always dynamically resolves the method to call (#2670)
        // kinda ugly hack, but does the job.
        value = attrs[i].value;
        if (isSimplePath(value)) {
          value += '.apply(this, $arguments)';
        }
        handler = (vm._scope || vm._context).$eval(value, true);
        handler._fromParent = true;
        vm.$on(name.replace(eventRE), handler);
      }
    }
  }

  /**
   * Register callbacks for option events and watchers.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {Object} hash
   */

  function registerCallbacks(vm, action, hash) {
    if (!hash) return;
    var handlers, key, i, j;
    for (key in hash) {
      handlers = hash[key];
      if (isArray(handlers)) {
        for (i = 0, j = handlers.length; i < j; i++) {
          register(vm, action, key, handlers[i]);
        }
      } else {
        register(vm, action, key, handlers);
      }
    }
  }

  /**
   * Helper to register an event/watch callback.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {String} key
   * @param {Function|String|Object} handler
   * @param {Object} [options]
   */

  function register(vm, action, key, handler, options) {
    var type = typeof handler;
    if (type === 'function') {
      vm[action](key, handler, options);
    } else if (type === 'string') {
      var methods = vm.$options.methods;
      var method = methods && methods[handler];
      if (method) {
        vm[action](key, method, options);
      } else {
        process.env.NODE_ENV !== 'production' && warn('Unknown method: "' + handler + '" when ' + 'registering callback for ' + action + ': "' + key + '".', vm);
      }
    } else if (handler && type === 'object') {
      register(vm, action, key, handler.handler, handler);
    }
  }

  /**
   * Setup recursive attached/detached calls
   */

  Vue.prototype._initDOMHooks = function () {
    this.$on('hook:attached', onAttached);
    this.$on('hook:detached', onDetached);
  };

  /**
   * Callback to recursively call attached hook on children
   */

  function onAttached() {
    if (!this._isAttached) {
      this._isAttached = true;
      this.$children.forEach(callAttach);
    }
  }

  /**
   * Iterator to call attached hook
   *
   * @param {Vue} child
   */

  function callAttach(child) {
    if (!child._isAttached && inDoc(child.$el)) {
      child._callHook('attached');
    }
  }

  /**
   * Callback to recursively call detached hook on children
   */

  function onDetached() {
    if (this._isAttached) {
      this._isAttached = false;
      this.$children.forEach(callDetach);
    }
  }

  /**
   * Iterator to call detached hook
   *
   * @param {Vue} child
   */

  function callDetach(child) {
    if (child._isAttached && !inDoc(child.$el)) {
      child._callHook('detached');
    }
  }

  /**
   * Trigger all handlers for a hook
   *
   * @param {String} hook
   */

  Vue.prototype._callHook = function (hook) {
    this.$emit('pre-hook:' + hook);
    var handlers = this.$options[hook];
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        handlers[i].call(this);
      }
    }
    this.$emit('hook:' + hook);
  };
}

function noop$1() {}

/**
 * A directive links a DOM element with a piece of data,
 * which is the result of evaluating an expression.
 * It registers a watcher with the expression and calls
 * the DOM update function when a change is triggered.
 *
 * @param {Object} descriptor
 *                 - {String} name
 *                 - {Object} def
 *                 - {String} expression
 *                 - {Array<Object>} [filters]
 *                 - {Object} [modifiers]
 *                 - {Boolean} literal
 *                 - {String} attr
 *                 - {String} arg
 *                 - {String} raw
 *                 - {String} [ref]
 *                 - {Array<Object>} [interp]
 *                 - {Boolean} [hasOneTime]
 * @param {Vue} vm
 * @param {Node} el
 * @param {Vue} [host] - transclusion host component
 * @param {Object} [scope] - v-for scope
 * @param {Fragment} [frag] - owner fragment
 * @constructor
 */
function Directive(descriptor, vm, el, host, scope, frag) {
  this.vm = vm;
  this.el = el;
  // copy descriptor properties
  this.descriptor = descriptor;
  this.name = descriptor.name;
  this.expression = descriptor.expression;
  this.arg = descriptor.arg;
  this.modifiers = descriptor.modifiers;
  this.filters = descriptor.filters;
  this.literal = this.modifiers && this.modifiers.literal;
  // private
  this._locked = false;
  this._bound = false;
  this._listeners = null;
  // link context
  this._host = host;
  this._scope = scope;
  this._frag = frag;
  // store directives on node in dev mode
  if (process.env.NODE_ENV !== 'production' && this.el) {
    this.el._vue_directives = this.el._vue_directives || [];
    this.el._vue_directives.push(this);
  }
}

/**
 * Initialize the directive, mixin definition properties,
 * setup the watcher, call definition bind() and update()
 * if present.
 */

Directive.prototype._bind = function () {
  var name = this.name;
  var descriptor = this.descriptor;

  // remove attribute
  if ((name !== 'cloak' || this.vm._isCompiled) && this.el && this.el.removeAttribute) {
    var attr = descriptor.attr || 'v-' + name;
    this.el.removeAttribute(attr);
  }

  // copy def properties
  var def = descriptor.def;
  if (typeof def === 'function') {
    this.update = def;
  } else {
    extend(this, def);
  }

  // setup directive params
  this._setupParams();

  // initial bind
  if (this.bind) {
    this.bind();
  }
  this._bound = true;

  if (this.literal) {
    this.update && this.update(descriptor.raw);
  } else if ((this.expression || this.modifiers) && (this.update || this.twoWay) && !this._checkStatement()) {
    // wrapped updater for context
    var dir = this;
    if (this.update) {
      this._update = function (val, oldVal) {
        if (!dir._locked) {
          dir.update(val, oldVal);
        }
      };
    } else {
      this._update = noop$1;
    }
    var preProcess = this._preProcess ? bind(this._preProcess, this) : null;
    var postProcess = this._postProcess ? bind(this._postProcess, this) : null;
    var watcher = this._watcher = new Watcher(this.vm, this.expression, this._update, // callback
    {
      filters: this.filters,
      twoWay: this.twoWay,
      deep: this.deep,
      preProcess: preProcess,
      postProcess: postProcess,
      scope: this._scope
    });
    // v-model with inital inline value need to sync back to
    // model instead of update to DOM on init. They would
    // set the afterBind hook to indicate that.
    if (this.afterBind) {
      this.afterBind();
    } else if (this.update) {
      this.update(watcher.value);
    }
  }
};

/**
 * Setup all param attributes, e.g. track-by,
 * transition-mode, etc...
 */

Directive.prototype._setupParams = function () {
  if (!this.params) {
    return;
  }
  var params = this.params;
  // swap the params array with a fresh object.
  this.params = Object.create(null);
  var i = params.length;
  var key, val, mappedKey;
  while (i--) {
    key = hyphenate(params[i]);
    mappedKey = camelize(key);
    val = getBindAttr(this.el, key);
    if (val != null) {
      // dynamic
      this._setupParamWatcher(mappedKey, val);
    } else {
      // static
      val = getAttr(this.el, key);
      if (val != null) {
        this.params[mappedKey] = val === '' ? true : val;
      }
    }
  }
};

/**
 * Setup a watcher for a dynamic param.
 *
 * @param {String} key
 * @param {String} expression
 */

Directive.prototype._setupParamWatcher = function (key, expression) {
  var self = this;
  var called = false;
  var unwatch = (this._scope || this.vm).$watch(expression, function (val, oldVal) {
    self.params[key] = val;
    // since we are in immediate mode,
    // only call the param change callbacks if this is not the first update.
    if (called) {
      var cb = self.paramWatchers && self.paramWatchers[key];
      if (cb) {
        cb.call(self, val, oldVal);
      }
    } else {
      called = true;
    }
  }, {
    immediate: true,
    user: false
  });(this._paramUnwatchFns || (this._paramUnwatchFns = [])).push(unwatch);
};

/**
 * Check if the directive is a function caller
 * and if the expression is a callable one. If both true,
 * we wrap up the expression and use it as the event
 * handler.
 *
 * e.g. on-click="a++"
 *
 * @return {Boolean}
 */

Directive.prototype._checkStatement = function () {
  var expression = this.expression;
  if (expression && this.acceptStatement && !isSimplePath(expression)) {
    var fn = parseExpression(expression).get;
    var scope = this._scope || this.vm;
    var handler = function handler(e) {
      scope.$event = e;
      fn.call(scope, scope);
      scope.$event = null;
    };
    if (this.filters) {
      handler = scope._applyFilters(handler, null, this.filters);
    }
    this.update(handler);
    return true;
  }
};

/**
 * Set the corresponding value with the setter.
 * This should only be used in two-way directives
 * e.g. v-model.
 *
 * @param {*} value
 * @public
 */

Directive.prototype.set = function (value) {
  /* istanbul ignore else */
  if (this.twoWay) {
    this._withLock(function () {
      this._watcher.set(value);
    });
  } else if (process.env.NODE_ENV !== 'production') {
    warn('Directive.set() can only be used inside twoWay' + 'directives.');
  }
};

/**
 * Execute a function while preventing that function from
 * triggering updates on this directive instance.
 *
 * @param {Function} fn
 */

Directive.prototype._withLock = function (fn) {
  var self = this;
  self._locked = true;
  fn.call(self);
  nextTick(function () {
    self._locked = false;
  });
};

/**
 * Convenience method that attaches a DOM event listener
 * to the directive element and autometically tears it down
 * during unbind.
 *
 * @param {String} event
 * @param {Function} handler
 * @param {Boolean} [useCapture]
 */

Directive.prototype.on = function (event, handler, useCapture) {
  on(this.el, event, handler, useCapture);(this._listeners || (this._listeners = [])).push([event, handler]);
};

/**
 * Teardown the watcher and call unbind.
 */

Directive.prototype._teardown = function () {
  if (this._bound) {
    this._bound = false;
    if (this.unbind) {
      this.unbind();
    }
    if (this._watcher) {
      this._watcher.teardown();
    }
    var listeners = this._listeners;
    var i;
    if (listeners) {
      i = listeners.length;
      while (i--) {
        off(this.el, listeners[i][0], listeners[i][1]);
      }
    }
    var unwatchFns = this._paramUnwatchFns;
    if (unwatchFns) {
      i = unwatchFns.length;
      while (i--) {
        unwatchFns[i]();
      }
    }
    if (process.env.NODE_ENV !== 'production' && this.el) {
      this.el._vue_directives.$remove(this);
    }
    this.vm = this.el = this._watcher = this._listeners = null;
  }
};

function lifecycleMixin (Vue) {
  /**
   * Update v-ref for component.
   *
   * @param {Boolean} remove
   */

  Vue.prototype._updateRef = function (remove) {
    var ref = this.$options._ref;
    if (ref) {
      var refs = (this._scope || this._context).$refs;
      if (remove) {
        if (refs[ref] === this) {
          refs[ref] = null;
        }
      } else {
        refs[ref] = this;
      }
    }
  };

  /**
   * Transclude, compile and link element.
   *
   * If a pre-compiled linker is available, that means the
   * passed in element will be pre-transcluded and compiled
   * as well - all we need to do is to call the linker.
   *
   * Otherwise we need to call transclude/compile/link here.
   *
   * @param {Element} el
   */

  Vue.prototype._compile = function (el) {
    var options = this.$options;

    // transclude and init element
    // transclude can potentially replace original
    // so we need to keep reference; this step also injects
    // the template and caches the original attributes
    // on the container node and replacer node.
    var original = el;
    el = transclude(el, options);
    this._initElement(el);

    // handle v-pre on root node (#2026)
    if (el.nodeType === 1 && getAttr(el, 'v-pre') !== null) {
      return;
    }

    // root is always compiled per-instance, because
    // container attrs and props can be different every time.
    var contextOptions = this._context && this._context.$options;
    var rootLinker = compileRoot(el, options, contextOptions);

    // resolve slot distribution
    resolveSlots(this, options._content);

    // compile and link the rest
    var contentLinkFn;
    var ctor = this.constructor;
    // component compilation can be cached
    // as long as it's not using inline-template
    if (options._linkerCachable) {
      contentLinkFn = ctor.linker;
      if (!contentLinkFn) {
        contentLinkFn = ctor.linker = compile(el, options);
      }
    }

    // link phase
    // make sure to link root with prop scope!
    var rootUnlinkFn = rootLinker(this, el, this._scope);
    var contentUnlinkFn = contentLinkFn ? contentLinkFn(this, el) : compile(el, options)(this, el);

    // register composite unlink function
    // to be called during instance destruction
    this._unlinkFn = function () {
      rootUnlinkFn();
      // passing destroying: true to avoid searching and
      // splicing the directives
      contentUnlinkFn(true);
    };

    // finally replace original
    if (options.replace) {
      replace(original, el);
    }

    this._isCompiled = true;
    this._callHook('compiled');
  };

  /**
   * Initialize instance element. Called in the public
   * $mount() method.
   *
   * @param {Element} el
   */

  Vue.prototype._initElement = function (el) {
    if (isFragment(el)) {
      this._isFragment = true;
      this.$el = this._fragmentStart = el.firstChild;
      this._fragmentEnd = el.lastChild;
      // set persisted text anchors to empty
      if (this._fragmentStart.nodeType === 3) {
        this._fragmentStart.data = this._fragmentEnd.data = '';
      }
      this._fragment = el;
    } else {
      this.$el = el;
    }
    this.$el.__vue__ = this;
    this._callHook('beforeCompile');
  };

  /**
   * Create and bind a directive to an element.
   *
   * @param {Object} descriptor - parsed directive descriptor
   * @param {Node} node   - target node
   * @param {Vue} [host] - transclusion host component
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - owner fragment
   */

  Vue.prototype._bindDir = function (descriptor, node, host, scope, frag) {
    this._directives.push(new Directive(descriptor, this, node, host, scope, frag));
  };

  /**
   * Teardown an instance, unobserves the data, unbind all the
   * directives, turn off all the event listeners, etc.
   *
   * @param {Boolean} remove - whether to remove the DOM node.
   * @param {Boolean} deferCleanup - if true, defer cleanup to
   *                                 be called later
   */

  Vue.prototype._destroy = function (remove, deferCleanup) {
    if (this._isBeingDestroyed) {
      if (!deferCleanup) {
        this._cleanup();
      }
      return;
    }

    var destroyReady;
    var pendingRemoval;

    var self = this;
    // Cleanup should be called either synchronously or asynchronoysly as
    // callback of this.$remove(), or if remove and deferCleanup are false.
    // In any case it should be called after all other removing, unbinding and
    // turning of is done
    var cleanupIfPossible = function cleanupIfPossible() {
      if (destroyReady && !pendingRemoval && !deferCleanup) {
        self._cleanup();
      }
    };

    // remove DOM element
    if (remove && this.$el) {
      pendingRemoval = true;
      this.$remove(function () {
        pendingRemoval = false;
        cleanupIfPossible();
      });
    }

    this._callHook('beforeDestroy');
    this._isBeingDestroyed = true;
    var i;
    // remove self from parent. only necessary
    // if parent is not being destroyed as well.
    var parent = this.$parent;
    if (parent && !parent._isBeingDestroyed) {
      parent.$children.$remove(this);
      // unregister ref (remove: true)
      this._updateRef(true);
    }
    // destroy all children.
    i = this.$children.length;
    while (i--) {
      this.$children[i].$destroy();
    }
    // teardown props
    if (this._propsUnlinkFn) {
      this._propsUnlinkFn();
    }
    // teardown all directives. this also tearsdown all
    // directive-owned watchers.
    if (this._unlinkFn) {
      this._unlinkFn();
    }
    i = this._watchers.length;
    while (i--) {
      this._watchers[i].teardown();
    }
    // remove reference to self on $el
    if (this.$el) {
      this.$el.__vue__ = null;
    }

    destroyReady = true;
    cleanupIfPossible();
  };

  /**
   * Clean up to ensure garbage collection.
   * This is called after the leave transition if there
   * is any.
   */

  Vue.prototype._cleanup = function () {
    if (this._isDestroyed) {
      return;
    }
    // remove self from owner fragment
    // do it in cleanup so that we can call $destroy with
    // defer right when a fragment is about to be removed.
    if (this._frag) {
      this._frag.children.$remove(this);
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (this._data && this._data.__ob__) {
      this._data.__ob__.removeVm(this);
    }
    // Clean up references to private properties and other
    // instances. preserve reference to _data so that proxy
    // accessors still work. The only potential side effect
    // here is that mutating the instance after it's destroyed
    // may affect the state of other components that are still
    // observing the same object, but that seems to be a
    // reasonable responsibility for the user rather than
    // always throwing an error on them.
    this.$el = this.$parent = this.$root = this.$children = this._watchers = this._context = this._scope = this._directives = null;
    // call the last hook...
    this._isDestroyed = true;
    this._callHook('destroyed');
    // turn off all instance listeners.
    this.$off();
  };
}

function miscMixin (Vue) {
  /**
   * Apply a list of filter (descriptors) to a value.
   * Using plain for loops here because this will be called in
   * the getter of any watcher with filters so it is very
   * performance sensitive.
   *
   * @param {*} value
   * @param {*} [oldValue]
   * @param {Array} filters
   * @param {Boolean} write
   * @return {*}
   */

  Vue.prototype._applyFilters = function (value, oldValue, filters, write) {
    var filter, fn, args, arg, offset, i, l, j, k;
    for (i = 0, l = filters.length; i < l; i++) {
      filter = filters[write ? l - i - 1 : i];
      fn = resolveAsset(this.$options, 'filters', filter.name, true);
      if (!fn) continue;
      fn = write ? fn.write : fn.read || fn;
      if (typeof fn !== 'function') continue;
      args = write ? [value, oldValue] : [value];
      offset = write ? 2 : 1;
      if (filter.args) {
        for (j = 0, k = filter.args.length; j < k; j++) {
          arg = filter.args[j];
          args[j + offset] = arg.dynamic ? this.$get(arg.value) : arg.value;
        }
      }
      value = fn.apply(this, args);
    }
    return value;
  };

  /**
   * Resolve a component, depending on whether the component
   * is defined normally or using an async factory function.
   * Resolves synchronously if already resolved, otherwise
   * resolves asynchronously and caches the resolved
   * constructor on the factory.
   *
   * @param {String|Function} value
   * @param {Function} cb
   */

  Vue.prototype._resolveComponent = function (value, cb) {
    var factory;
    if (typeof value === 'function') {
      factory = value;
    } else {
      factory = resolveAsset(this.$options, 'components', value, true);
    }
    /* istanbul ignore if */
    if (!factory) {
      return;
    }
    // async component factory
    if (!factory.options) {
      if (factory.resolved) {
        // cached
        cb(factory.resolved);
      } else if (factory.requested) {
        // pool callbacks
        factory.pendingCallbacks.push(cb);
      } else {
        factory.requested = true;
        var cbs = factory.pendingCallbacks = [cb];
        factory.call(this, function resolve(res) {
          if (isPlainObject(res)) {
            res = Vue.extend(res);
          }
          // cache resolved
          factory.resolved = res;
          // invoke callbacks
          for (var i = 0, l = cbs.length; i < l; i++) {
            cbs[i](res);
          }
        }, function reject(reason) {
          process.env.NODE_ENV !== 'production' && warn('Failed to resolve async component' + (typeof value === 'string' ? ': ' + value : '') + '. ' + (reason ? '\nReason: ' + reason : ''));
        });
      }
    } else {
      // normal component
      cb(factory);
    }
  };
}

var filterRE$1 = /[^|]\|[^|]/;

function dataAPI (Vue) {
  /**
   * Get the value from an expression on this vm.
   *
   * @param {String} exp
   * @param {Boolean} [asStatement]
   * @return {*}
   */

  Vue.prototype.$get = function (exp, asStatement) {
    var res = parseExpression(exp);
    if (res) {
      if (asStatement) {
        var self = this;
        return function statementHandler() {
          self.$arguments = toArray(arguments);
          var result = res.get.call(self, self);
          self.$arguments = null;
          return result;
        };
      } else {
        try {
          return res.get.call(this, this);
        } catch (e) {}
      }
    }
  };

  /**
   * Set the value from an expression on this vm.
   * The expression must be a valid left-hand
   * expression in an assignment.
   *
   * @param {String} exp
   * @param {*} val
   */

  Vue.prototype.$set = function (exp, val) {
    var res = parseExpression(exp, true);
    if (res && res.set) {
      res.set.call(this, this, val);
    }
  };

  /**
   * Delete a property on the VM
   *
   * @param {String} key
   */

  Vue.prototype.$delete = function (key) {
    del(this._data, key);
  };

  /**
   * Watch an expression, trigger callback when its
   * value changes.
   *
   * @param {String|Function} expOrFn
   * @param {Function} cb
   * @param {Object} [options]
   *                 - {Boolean} deep
   *                 - {Boolean} immediate
   * @return {Function} - unwatchFn
   */

  Vue.prototype.$watch = function (expOrFn, cb, options) {
    var vm = this;
    var parsed;
    if (typeof expOrFn === 'string') {
      parsed = parseDirective(expOrFn);
      expOrFn = parsed.expression;
    }
    var watcher = new Watcher(vm, expOrFn, cb, {
      deep: options && options.deep,
      sync: options && options.sync,
      filters: parsed && parsed.filters,
      user: !options || options.user !== false
    });
    if (options && options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn() {
      watcher.teardown();
    };
  };

  /**
   * Evaluate a text directive, including filters.
   *
   * @param {String} text
   * @param {Boolean} [asStatement]
   * @return {String}
   */

  Vue.prototype.$eval = function (text, asStatement) {
    // check for filters.
    if (filterRE$1.test(text)) {
      var dir = parseDirective(text);
      // the filter regex check might give false positive
      // for pipes inside strings, so it's possible that
      // we don't get any filters here
      var val = this.$get(dir.expression, asStatement);
      return dir.filters ? this._applyFilters(val, null, dir.filters) : val;
    } else {
      // no filter
      return this.$get(text, asStatement);
    }
  };

  /**
   * Interpolate a piece of template text.
   *
   * @param {String} text
   * @return {String}
   */

  Vue.prototype.$interpolate = function (text) {
    var tokens = parseText(text);
    var vm = this;
    if (tokens) {
      if (tokens.length === 1) {
        return vm.$eval(tokens[0].value) + '';
      } else {
        return tokens.map(function (token) {
          return token.tag ? vm.$eval(token.value) : token.value;
        }).join('');
      }
    } else {
      return text;
    }
  };

  /**
   * Log instance data as a plain JS object
   * so that it is easier to inspect in console.
   * This method assumes console is available.
   *
   * @param {String} [path]
   */

  Vue.prototype.$log = function (path) {
    var data = path ? getPath(this._data, path) : this._data;
    if (data) {
      data = clean(data);
    }
    // include computed fields
    if (!path) {
      var key;
      for (key in this.$options.computed) {
        data[key] = clean(this[key]);
      }
      if (this._props) {
        for (key in this._props) {
          data[key] = clean(this[key]);
        }
      }
    }
    console.log(data);
  };

  /**
   * "clean" a getter/setter converted object into a plain
   * object copy.
   *
   * @param {Object} - obj
   * @return {Object}
   */

  function clean(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

function domAPI (Vue) {
  /**
   * Convenience on-instance nextTick. The callback is
   * auto-bound to the instance, and this avoids component
   * modules having to rely on the global Vue.
   *
   * @param {Function} fn
   */

  Vue.prototype.$nextTick = function (fn) {
    nextTick(fn, this);
  };

  /**
   * Append instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$appendTo = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, append, appendWithTransition);
  };

  /**
   * Prepend instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$prependTo = function (target, cb, withTransition) {
    target = query(target);
    if (target.hasChildNodes()) {
      this.$before(target.firstChild, cb, withTransition);
    } else {
      this.$appendTo(target, cb, withTransition);
    }
    return this;
  };

  /**
   * Insert instance before target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$before = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, beforeWithCb, beforeWithTransition);
  };

  /**
   * Insert instance after target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$after = function (target, cb, withTransition) {
    target = query(target);
    if (target.nextSibling) {
      this.$before(target.nextSibling, cb, withTransition);
    } else {
      this.$appendTo(target.parentNode, cb, withTransition);
    }
    return this;
  };

  /**
   * Remove instance from DOM
   *
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$remove = function (cb, withTransition) {
    if (!this.$el.parentNode) {
      return cb && cb();
    }
    var inDocument = this._isAttached && inDoc(this.$el);
    // if we are not in document, no need to check
    // for transitions
    if (!inDocument) withTransition = false;
    var self = this;
    var realCb = function realCb() {
      if (inDocument) self._callHook('detached');
      if (cb) cb();
    };
    if (this._isFragment) {
      removeNodeRange(this._fragmentStart, this._fragmentEnd, this, this._fragment, realCb);
    } else {
      var op = withTransition === false ? removeWithCb : removeWithTransition;
      op(this.$el, this, realCb);
    }
    return this;
  };

  /**
   * Shared DOM insertion function.
   *
   * @param {Vue} vm
   * @param {Element} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition]
   * @param {Function} op1 - op for non-transition insert
   * @param {Function} op2 - op for transition insert
   * @return vm
   */

  function insert(vm, target, cb, withTransition, op1, op2) {
    target = query(target);
    var targetIsDetached = !inDoc(target);
    var op = withTransition === false || targetIsDetached ? op1 : op2;
    var shouldCallHook = !targetIsDetached && !vm._isAttached && !inDoc(vm.$el);
    if (vm._isFragment) {
      mapNodeRange(vm._fragmentStart, vm._fragmentEnd, function (node) {
        op(node, target, vm);
      });
      cb && cb();
    } else {
      op(vm.$el, target, vm, cb);
    }
    if (shouldCallHook) {
      vm._callHook('attached');
    }
    return vm;
  }

  /**
   * Check for selectors
   *
   * @param {String|Element} el
   */

  function query(el) {
    return typeof el === 'string' ? document.querySelector(el) : el;
  }

  /**
   * Append operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function append(el, target, vm, cb) {
    target.appendChild(el);
    if (cb) cb();
  }

  /**
   * InsertBefore operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function beforeWithCb(el, target, vm, cb) {
    before(el, target);
    if (cb) cb();
  }

  /**
   * Remove operation that takes a callback.
   *
   * @param {Node} el
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function removeWithCb(el, vm, cb) {
    remove(el);
    if (cb) cb();
  }
}

function eventsAPI (Vue) {
  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$on = function (event, fn) {
    (this._events[event] || (this._events[event] = [])).push(fn);
    modifyListenerCount(this, event, 1);
    return this;
  };

  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$once = function (event, fn) {
    var self = this;
    function on() {
      self.$off(event, on);
      fn.apply(this, arguments);
    }
    on.fn = fn;
    this.$on(event, on);
    return this;
  };

  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$off = function (event, fn) {
    var cbs;
    // all
    if (!arguments.length) {
      if (this.$parent) {
        for (event in this._events) {
          cbs = this._events[event];
          if (cbs) {
            modifyListenerCount(this, event, -cbs.length);
          }
        }
      }
      this._events = {};
      return this;
    }
    // specific event
    cbs = this._events[event];
    if (!cbs) {
      return this;
    }
    if (arguments.length === 1) {
      modifyListenerCount(this, event, -cbs.length);
      this._events[event] = null;
      return this;
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        modifyListenerCount(this, event, -1);
        cbs.splice(i, 1);
        break;
      }
    }
    return this;
  };

  /**
   * Trigger an event on self.
   *
   * @param {String|Object} event
   * @return {Boolean} shouldPropagate
   */

  Vue.prototype.$emit = function (event) {
    var isSource = typeof event === 'string';
    event = isSource ? event : event.name;
    var cbs = this._events[event];
    var shouldPropagate = isSource || !cbs;
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      // this is a somewhat hacky solution to the question raised
      // in #2102: for an inline component listener like <comp @test="doThis">,
      // the propagation handling is somewhat broken. Therefore we
      // need to treat these inline callbacks differently.
      var hasParentCbs = isSource && cbs.some(function (cb) {
        return cb._fromParent;
      });
      if (hasParentCbs) {
        shouldPropagate = false;
      }
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        var cb = cbs[i];
        var res = cb.apply(this, args);
        if (res === true && (!hasParentCbs || cb._fromParent)) {
          shouldPropagate = true;
        }
      }
    }
    return shouldPropagate;
  };

  /**
   * Recursively broadcast an event to all children instances.
   *
   * @param {String|Object} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$broadcast = function (event) {
    var isSource = typeof event === 'string';
    event = isSource ? event : event.name;
    // if no child has registered for this event,
    // then there's no need to broadcast.
    if (!this._eventsCount[event]) return;
    var children = this.$children;
    var args = toArray(arguments);
    if (isSource) {
      // use object event to indicate non-source emit
      // on children
      args[0] = { name: event, source: this };
    }
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var shouldPropagate = child.$emit.apply(child, args);
      if (shouldPropagate) {
        child.$broadcast.apply(child, args);
      }
    }
    return this;
  };

  /**
   * Recursively propagate an event up the parent chain.
   *
   * @param {String} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$dispatch = function (event) {
    var shouldPropagate = this.$emit.apply(this, arguments);
    if (!shouldPropagate) return;
    var parent = this.$parent;
    var args = toArray(arguments);
    // use object event to indicate non-source emit
    // on parents
    args[0] = { name: event, source: this };
    while (parent) {
      shouldPropagate = parent.$emit.apply(parent, args);
      parent = shouldPropagate ? parent.$parent : null;
    }
    return this;
  };

  /**
   * Modify the listener counts on all parents.
   * This bookkeeping allows $broadcast to return early when
   * no child has listened to a certain event.
   *
   * @param {Vue} vm
   * @param {String} event
   * @param {Number} count
   */

  var hookRE = /^hook:/;
  function modifyListenerCount(vm, event, count) {
    var parent = vm.$parent;
    // hooks do not get broadcasted so no need
    // to do bookkeeping for them
    if (!parent || !count || hookRE.test(event)) return;
    while (parent) {
      parent._eventsCount[event] = (parent._eventsCount[event] || 0) + count;
      parent = parent.$parent;
    }
  }
}

function lifecycleAPI (Vue) {
  /**
   * Set instance target element and kick off the compilation
   * process. The passed in `el` can be a selector string, an
   * existing Element, or a DocumentFragment (for block
   * instances).
   *
   * @param {Element|DocumentFragment|string} el
   * @public
   */

  Vue.prototype.$mount = function (el) {
    if (this._isCompiled) {
      process.env.NODE_ENV !== 'production' && warn('$mount() should be called only once.', this);
      return;
    }
    el = query(el);
    if (!el) {
      el = document.createElement('div');
    }
    this._compile(el);
    this._initDOMHooks();
    if (inDoc(this.$el)) {
      this._callHook('attached');
      ready.call(this);
    } else {
      this.$once('hook:attached', ready);
    }
    return this;
  };

  /**
   * Mark an instance as ready.
   */

  function ready() {
    this._isAttached = true;
    this._isReady = true;
    this._callHook('ready');
  }

  /**
   * Teardown the instance, simply delegate to the internal
   * _destroy.
   *
   * @param {Boolean} remove
   * @param {Boolean} deferCleanup
   */

  Vue.prototype.$destroy = function (remove, deferCleanup) {
    this._destroy(remove, deferCleanup);
  };

  /**
   * Partially compile a piece of DOM and return a
   * decompile function.
   *
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host]
   * @param {Object} [scope]
   * @param {Fragment} [frag]
   * @return {Function}
   */

  Vue.prototype.$compile = function (el, host, scope, frag) {
    return compile(el, this.$options, true)(this, el, host, scope, frag);
  };
}

/**
 * The exposed Vue constructor.
 *
 * API conventions:
 * - public API methods/properties are prefixed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user
 *   data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue(options) {
  this._init(options);
}

// install internals
initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
miscMixin(Vue);

// install instance APIs
dataAPI(Vue);
domAPI(Vue);
eventsAPI(Vue);
lifecycleAPI(Vue);

var slot = {

  priority: SLOT,
  params: ['name'],

  bind: function bind() {
    // this was resolved during component transclusion
    var name = this.params.name || 'default';
    var content = this.vm._slotContents && this.vm._slotContents[name];
    if (!content || !content.hasChildNodes()) {
      this.fallback();
    } else {
      this.compile(content.cloneNode(true), this.vm._context, this.vm);
    }
  },

  compile: function compile(content, context, host) {
    if (content && context) {
      if (this.el.hasChildNodes() && content.childNodes.length === 1 && content.childNodes[0].nodeType === 1 && content.childNodes[0].hasAttribute('v-if')) {
        // if the inserted slot has v-if
        // inject fallback content as the v-else
        var elseBlock = document.createElement('template');
        elseBlock.setAttribute('v-else', '');
        elseBlock.innerHTML = this.el.innerHTML;
        // the else block should be compiled in child scope
        elseBlock._context = this.vm;
        content.appendChild(elseBlock);
      }
      var scope = host ? host._scope : this._scope;
      this.unlink = context.$compile(content, host, scope, this._frag);
    }
    if (content) {
      replace(this.el, content);
    } else {
      remove(this.el);
    }
  },

  fallback: function fallback() {
    this.compile(extractContent(this.el, true), this.vm);
  },

  unbind: function unbind() {
    if (this.unlink) {
      this.unlink();
    }
  }
};

var partial = {

  priority: PARTIAL,

  params: ['name'],

  // watch changes to name for dynamic partials
  paramWatchers: {
    name: function name(value) {
      vIf.remove.call(this);
      if (value) {
        this.insert(value);
      }
    }
  },

  bind: function bind() {
    this.anchor = createAnchor('v-partial');
    replace(this.el, this.anchor);
    this.insert(this.params.name);
  },

  insert: function insert(id) {
    var partial = resolveAsset(this.vm.$options, 'partials', id, true);
    if (partial) {
      this.factory = new FragmentFactory(this.vm, partial);
      vIf.insert.call(this);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
  }
};

var elementDirectives = {
  slot: slot,
  partial: partial
};

var convertArray = vFor._postProcess;

/**
 * Limit filter for arrays
 *
 * @param {Number} n
 * @param {Number} offset (Decimal expected)
 */

function limitBy(arr, n, offset) {
  offset = offset ? parseInt(offset, 10) : 0;
  n = toNumber(n);
  return typeof n === 'number' ? arr.slice(offset, offset + n) : arr;
}

/**
 * Filter filter for arrays
 *
 * @param {String} search
 * @param {String} [delimiter]
 * @param {String} ...dataKeys
 */

function filterBy(arr, search, delimiter) {
  arr = convertArray(arr);
  if (search == null) {
    return arr;
  }
  if (typeof search === 'function') {
    return arr.filter(search);
  }
  // cast to lowercase string
  search = ('' + search).toLowerCase();
  // allow optional `in` delimiter
  // because why not
  var n = delimiter === 'in' ? 3 : 2;
  // extract and flatten keys
  var keys = Array.prototype.concat.apply([], toArray(arguments, n));
  var res = [];
  var item, key, val, j;
  for (var i = 0, l = arr.length; i < l; i++) {
    item = arr[i];
    val = item && item.$value || item;
    j = keys.length;
    if (j) {
      while (j--) {
        key = keys[j];
        if (key === '$key' && contains(item.$key, search) || contains(getPath(val, key), search)) {
          res.push(item);
          break;
        }
      }
    } else if (contains(item, search)) {
      res.push(item);
    }
  }
  return res;
}

/**
 * Filter filter for arrays
 *
 * @param {String|Array<String>|Function} ...sortKeys
 * @param {Number} [order]
 */

function orderBy(arr) {
  var comparator = null;
  var sortKeys = undefined;
  arr = convertArray(arr);

  // determine order (last argument)
  var args = toArray(arguments, 1);
  var order = args[args.length - 1];
  if (typeof order === 'number') {
    order = order < 0 ? -1 : 1;
    args = args.length > 1 ? args.slice(0, -1) : args;
  } else {
    order = 1;
  }

  // determine sortKeys & comparator
  var firstArg = args[0];
  if (!firstArg) {
    return arr;
  } else if (typeof firstArg === 'function') {
    // custom comparator
    comparator = function (a, b) {
      return firstArg(a, b) * order;
    };
  } else {
    // string keys. flatten first
    sortKeys = Array.prototype.concat.apply([], args);
    comparator = function (a, b, i) {
      i = i || 0;
      return i >= sortKeys.length - 1 ? baseCompare(a, b, i) : baseCompare(a, b, i) || comparator(a, b, i + 1);
    };
  }

  function baseCompare(a, b, sortKeyIndex) {
    var sortKey = sortKeys[sortKeyIndex];
    if (sortKey) {
      if (sortKey !== '$key') {
        if (isObject(a) && '$value' in a) a = a.$value;
        if (isObject(b) && '$value' in b) b = b.$value;
      }
      a = isObject(a) ? getPath(a, sortKey) : a;
      b = isObject(b) ? getPath(b, sortKey) : b;
    }
    return a === b ? 0 : a > b ? order : -order;
  }

  // sort on a copy to avoid mutating original array
  return arr.slice().sort(comparator);
}

/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains(val, search) {
  var i;
  if (isPlainObject(val)) {
    var keys = Object.keys(val);
    i = keys.length;
    while (i--) {
      if (contains(val[keys[i]], search)) {
        return true;
      }
    }
  } else if (isArray(val)) {
    i = val.length;
    while (i--) {
      if (contains(val[i], search)) {
        return true;
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1;
  }
}

var digitsRE = /(\d{3})(?=\d)/g;

// asset collections must be a plain object.
var filters = {

  orderBy: orderBy,
  filterBy: filterBy,
  limitBy: limitBy,

  /**
   * Stringify value.
   *
   * @param {Number} indent
   */

  json: {
    read: function read(value, indent) {
      return typeof value === 'string' ? value : JSON.stringify(value, null, arguments.length > 1 ? indent : 2);
    },
    write: function write(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  },

  /**
   * 'abc' => 'Abc'
   */

  capitalize: function capitalize(value) {
    if (!value && value !== 0) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  },

  /**
   * 'abc' => 'ABC'
   */

  uppercase: function uppercase(value) {
    return value || value === 0 ? value.toString().toUpperCase() : '';
  },

  /**
   * 'AbC' => 'abc'
   */

  lowercase: function lowercase(value) {
    return value || value === 0 ? value.toString().toLowerCase() : '';
  },

  /**
   * 12345 => $12,345.00
   *
   * @param {String} sign
   * @param {Number} decimals Decimal places
   */

  currency: function currency(value, _currency, decimals) {
    value = parseFloat(value);
    if (!isFinite(value) || !value && value !== 0) return '';
    _currency = _currency != null ? _currency : '$';
    decimals = decimals != null ? decimals : 2;
    var stringified = Math.abs(value).toFixed(decimals);
    var _int = decimals ? stringified.slice(0, -1 - decimals) : stringified;
    var i = _int.length % 3;
    var head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : '';
    var _float = decimals ? stringified.slice(-1 - decimals) : '';
    var sign = value < 0 ? '-' : '';
    return sign + _currency + head + _int.slice(i).replace(digitsRE, '$1,') + _float;
  },

  /**
   * 'item' => 'items'
   *
   * @params
   *  an array of strings corresponding to
   *  the single, double, triple ... forms of the word to
   *  be pluralized. When the number to be pluralized
   *  exceeds the length of the args, it will use the last
   *  entry in the array.
   *
   *  e.g. ['single', 'double', 'triple', 'multiple']
   */

  pluralize: function pluralize(value) {
    var args = toArray(arguments, 1);
    var length = args.length;
    if (length > 1) {
      var index = value % 10 - 1;
      return index in args ? args[index] : args[length - 1];
    } else {
      return args[0] + (value === 1 ? '' : 's');
    }
  },

  /**
   * Debounce a handler function.
   *
   * @param {Function} handler
   * @param {Number} delay = 300
   * @return {Function}
   */

  debounce: function debounce(handler, delay) {
    if (!handler) return;
    if (!delay) {
      delay = 300;
    }
    return _debounce(handler, delay);
  }
};

function installGlobalAPI (Vue) {
  /**
   * Vue and every constructor that extends Vue has an
   * associated options object, which can be accessed during
   * compilation steps as `this.constructor.options`.
   *
   * These can be seen as the default options of every
   * Vue instance.
   */

  Vue.options = {
    directives: directives,
    elementDirectives: elementDirectives,
    filters: filters,
    transitions: {},
    components: {},
    partials: {},
    replace: true
  };

  /**
   * Expose useful internals
   */

  Vue.util = util;
  Vue.config = config;
  Vue.set = set;
  Vue['delete'] = del;
  Vue.nextTick = nextTick;

  /**
   * The following are exposed for advanced usage / plugins
   */

  Vue.compiler = compiler;
  Vue.FragmentFactory = FragmentFactory;
  Vue.internalDirectives = internalDirectives;
  Vue.parsers = {
    path: path,
    text: text,
    template: template,
    directive: directive,
    expression: expression
  };

  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */

  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   *
   * @param {Object} extendOptions
   */

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var isFirstExtend = Super.cid === 0;
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor;
    }
    var name = extendOptions.name || Super.options.name;
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn('Invalid component name: "' + name + '". Component names ' + 'can only contain alphanumeric characaters and the hyphen.');
        name = null;
      }
    }
    var Sub = createClass(name || 'VueComponent');
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super;
    // allow further extension
    Sub.extend = Super.extend;
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }
    // cache constructor
    if (isFirstExtend) {
      extendOptions._Ctor = Sub;
    }
    return Sub;
  };

  /**
   * A function that returns a sub-class constructor with the
   * given name. This gives us much nicer output when
   * logging instances in the console.
   *
   * @param {String} name
   * @return {Function}
   */

  function createClass(name) {
    /* eslint-disable no-new-func */
    return new Function('return function ' + classify(name) + ' (options) { this._init(options) }')();
    /* eslint-enable no-new-func */
  }

  /**
   * Plugin system
   *
   * @param {Object} plugin
   */

  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return;
    }
    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }
    plugin.installed = true;
    return this;
  };

  /**
   * Apply a global mixin by merging it into the default
   * options.
   */

  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin);
  };

  /**
   * Create asset registration methods with the following
   * signature:
   *
   * @param {String} id
   * @param {*} definition
   */

  config._assetTypes.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && (commonTagRE.test(id) || reservedTagRE.test(id))) {
            warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + id);
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          if (!definition.name) {
            definition.name = id;
          }
          definition = Vue.extend(definition);
        }
        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });

  // expose internal transition API
  extend(Vue.transition, transition);
}

installGlobalAPI(Vue);

Vue.version = '1.0.26';

// devtools global hook
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue);
    } else if (process.env.NODE_ENV !== 'production' && inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)) {
      console.log('Download the Vue Devtools for a better development experience:\n' + 'https://github.com/vuejs/vue-devtools');
    }
  }
}, 0);

module.exports = Vue;
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":1}],5:[function(require,module,exports){
'use strict';
/**
 * Module Dependencies
 */
//=============================================================================
const
  Vue = require('vue'),
  VueRouter = require('vue-router')
//=============================================================================
/**
 * Module Config
 */
//=============================================================================
Vue.use(require('vue-resource'));
Vue.http.options.root = '/root';
Vue.use(VueRouter);
//=============================================================================
/**
 * VM Components
 */
//=============================================================================
const
  Home = require('./components/app_home'),
  Sign_Up = require('./components/app_signup'),
  How = require('./components/app_how-it-works'),
  Confirm = require('./components/app_confirm');
//=============================================================================
/**
 * Create baseVM
 */
//=============================================================================
const app = Vue.extend({
  template: require('./template.html'),
  data: () => {
    return {};
  },
  computed: {},
  components: {
    'app-nav': require('./components/app_nav'),
    'app-home': Home,
    'app-how': How,
    'app-sign': Sign_Up,
    'app_confirm': Confirm
  },
  methods: {},
  events: {
    'show-confirm': function () {
      return this.$route.router.go({name: 'confirm'});
    },
    'show-signup': function () {
      return this.$route.router.go({name: 'sign-up'});
    },
    'confirmed': function () {
      return this.$route.router.go({name: 'home'});
    }
  },
  ready: function () {
    this.$route.router.go({name: 'home'});
  }
});
//=============================================================================
/**
 * Create router instance
 */
//=============================================================================
let router = new VueRouter();
//=============================================================================
/**
 * Define Routes
 */
//=============================================================================
router.map({
  '/home': {
    name: 'home',
    component: Home
  },
  '/sign-up': {
    name: 'sign-up',
    component: Sign_Up
  },
  '/how': {
    name: 'how',
    component: How
  },
  '/confirm': {
    name: 'confirm',
    component: Confirm
  }
});
//=============================================================================
/**
 * Start router
 */
//=============================================================================
router.start(app, '#app-main');
//=============================================================================

},{"./components/app_confirm":6,"./components/app_home":8,"./components/app_how-it-works":10,"./components/app_nav":12,"./components/app_signup":14,"./template.html":16,"vue":4,"vue-resource":2,"vue-router":3}],6:[function(require,module,exports){
'use strict';
module.exports = {
  template: require('./template.html'),
  data: function () {
    return {
      token: '',
      confirmTokenURL: '/confirm'
    };
  },
  methods: {
    confirmToken: function () {
      if(this.token.trim()) {
        console.log('token:', this.token);
        var data = {
          token: this.token.trim()
        }
        this.$http.post(this.confirmTokenURL, {
          data: data
        }).
          then(function (res) {
            console.log('server res', res.data);
            return this.$dispatch('confirmed');
          }.bind(this)).
          catch(function (info) {
            return console.log('yawa gas', info);
          });
        return this.token = ''
      }
      else {
        return console.log('oops!');
      }
    }
  }
};

},{"./template.html":7}],7:[function(require,module,exports){
module.exports = '<section>\n  <h1><i class="fa fa-sign-in"></i> Confirm your identity</h1>\n  <p>\n    Please confirm your identity by entering the token sent to the email address\n    you provided. Thank you.\n  </p>\n  <form>\n    <div class="form-group">\n    <div class="form-group">\n      <label for="token">Token:</label>\n      <input type="text" class="form-control" id="token" v-model="token">\n    </div>\n    <div class="form-group">\n      <button class="btn btn-primary btn-large pull-right"\n        @click.stop.prevent="confirmToken">Confirm!</button>\n    </div>\n  </form>\n</section>\n';
},{}],8:[function(require,module,exports){
'use strict';
module.exports = {
  template: require('./template.html')
};

},{"./template.html":9}],9:[function(require,module,exports){
module.exports = '<h1>Welcome to Textpedia...</h1>\n<p>Your virtual research assistant in the cloud!</p>\n';
},{}],10:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"./template.html":11,"dup":8}],11:[function(require,module,exports){
module.exports = '<section>\n  <h1>How it works!</h1>\n</section>\n';
},{}],12:[function(require,module,exports){
module.exports = {
  template: require('./template.html')
};

},{"./template.html":13}],13:[function(require,module,exports){
module.exports = '<!--from /components/app_nav/template.html -->\n<nav class="navbar navbar-inverse">\n  <!-- Brand and toggle get grouped for better mobile display -->\n  <div class="navbar-header">\n      <button type="button" data-target="#navbarCollapse" data-toggle="collapse" class="navbar-toggle">\n          <span class="sr-only">Toggle navigation</span>\n          <span class="icon-bar"></span>\n          <span class="icon-bar"></span>\n          <span class="icon-bar"></span>\n      </button>\n      <a v-link="{name: \'home\'}" class="navbar-brand" id="app-label">Textpedia</a>\n  </div>\n  <!-- Collection of nav links and other content for toggling -->\n  <div id="navbarCollapse" class="collapse navbar-collapse">\n    <ul class="nav navbar-nav">\n      <li><a v-link="{name: \'home\'}">Home</a></li>\n      <li><a v-link="{name: \'sign-up\'}">Sign Up</a></li>\n      <li><a v-link="{name: \'how\'}">How It Works</a></li>\n    </ul>\n  </div>\n</nav>\n';
},{}],14:[function(require,module,exports){
module.exports = {
  template: require('./template.html'),
  data: function () {
    return {
      email: '',
      phoneNumber: '',
      submitURL: '/submit'
    };
  },
  methods: {
    submitCreds: function () {
      if(this.email.trim() && this.phoneNumber.trim()) {
        console.log('valid creds');
        var data = {
          email: this.email.trim(),
          phoneNumber: this.phoneNumber.trim()
        };
        this.$http.post(this.submitURL, {
          data: data
        }).
          then(function (res) {
            console.log('server resp', res.data);
            return this.$dispatch('show-confirm');
          }.bind(this)).
          catch(function (info) {
            return console.log('yawa gas', info);
          });
        return this.email = this.phoneNumber = '';
      }
      else {
        return console.log('oops');
      }
    }
  }
};

},{"./template.html":15}],15:[function(require,module,exports){
module.exports = '<section>\n  <h1><i class="fa fa-sign-in"></i> Sign Up!</h1>\n  <form>\n    <div class="form-group">\n      <label for="email">Email Address:</label>\n      <input type="email" class="form-control" id="email" placeholder="Email" v-model="email">\n    </div>\n    <div class="form-group">\n      <label for="phone-number">Phone Number:</label>\n      <input type="text" class="form-control" id="phone-number" v-model="phoneNumber">\n    </div>\n    <div class="form-group">\n      <button class="btn btn-primary btn-large pull-right"\n        @click.stop.prevent="submitCreds">GO!</button>\n    </div>\n  </form>\n</section>\n';
},{}],16:[function(require,module,exports){
module.exports = '<app-nav id="app-nav"></app-nav>\n<router-view></router-view>\n';
},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS1yZXNvdXJjZS9kaXN0L3Z1ZS1yZXNvdXJjZS5jb21tb24uanMiLCJub2RlX21vZHVsZXMvdnVlLXJvdXRlci9kaXN0L3Z1ZS1yb3V0ZXIuanMiLCJub2RlX21vZHVsZXMvdnVlL2Rpc3QvdnVlLmNvbW1vbi5qcyIsInB1YmxpYy9qcy9hcHAuanMiLCJwdWJsaWMvanMvY29tcG9uZW50cy9hcHBfY29uZmlybS9pbmRleC5qcyIsInB1YmxpYy9qcy9jb21wb25lbnRzL2FwcF9jb25maXJtL3RlbXBsYXRlLmh0bWwiLCJwdWJsaWMvanMvY29tcG9uZW50cy9hcHBfaG9tZS9pbmRleC5qcyIsInB1YmxpYy9qcy9jb21wb25lbnRzL2FwcF9ob21lL3RlbXBsYXRlLmh0bWwiLCJwdWJsaWMvanMvY29tcG9uZW50cy9hcHBfaG93LWl0LXdvcmtzL3RlbXBsYXRlLmh0bWwiLCJwdWJsaWMvanMvY29tcG9uZW50cy9hcHBfbmF2L2luZGV4LmpzIiwicHVibGljL2pzL2NvbXBvbmVudHMvYXBwX25hdi90ZW1wbGF0ZS5odG1sIiwicHVibGljL2pzL2NvbXBvbmVudHMvYXBwX3NpZ251cC9pbmRleC5qcyIsInB1YmxpYy9qcy9jb21wb25lbnRzL2FwcF9zaWdudXAvdGVtcGxhdGUuaHRtbCIsInB1YmxpYy9qcy90ZW1wbGF0ZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDejFUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTs7OztBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7O0FDQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaXMgbm90IGRlZmluZWQnKTtcbiAgICAgICAgfVxuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiFcbiAqIHZ1ZS1yZXNvdXJjZSB2MC45LjNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWUtcmVzb3VyY2VcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUHJvbWlzZXMvQSsgcG9seWZpbGwgdjEuMS40IChodHRwczovL2dpdGh1Yi5jb20vYnJhbXN0ZWluL3Byb21pcylcbiAqL1xuXG52YXIgUkVTT0xWRUQgPSAwO1xudmFyIFJFSkVDVEVEID0gMTtcbnZhciBQRU5ESU5HID0gMjtcblxuZnVuY3Rpb24gUHJvbWlzZSQyKGV4ZWN1dG9yKSB7XG5cbiAgICB0aGlzLnN0YXRlID0gUEVORElORztcbiAgICB0aGlzLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZGVmZXJyZWQgPSBbXTtcblxuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIHRyeSB7XG4gICAgICAgIGV4ZWN1dG9yKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoeCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChyKTtcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBwcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG59XG5cblByb21pc2UkMi5yZWplY3QgPSBmdW5jdGlvbiAocikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSQyKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcmVqZWN0KHIpO1xuICAgIH0pO1xufTtcblxuUHJvbWlzZSQyLnJlc29sdmUgPSBmdW5jdGlvbiAoeCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSQyKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcmVzb2x2ZSh4KTtcbiAgICB9KTtcbn07XG5cblByb21pc2UkMi5hbGwgPSBmdW5jdGlvbiBhbGwoaXRlcmFibGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UkMihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHZhciBjb3VudCA9IDAsXG4gICAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgICBpZiAoaXRlcmFibGUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByZXNvbHZlcihpKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbaV0gPSB4O1xuICAgICAgICAgICAgICAgIGNvdW50ICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAoY291bnQgPT09IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlcmFibGUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIFByb21pc2UkMi5yZXNvbHZlKGl0ZXJhYmxlW2ldKS50aGVuKHJlc29sdmVyKGkpLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5Qcm9taXNlJDIucmFjZSA9IGZ1bmN0aW9uIHJhY2UoaXRlcmFibGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UkMihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlcmFibGUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIFByb21pc2UkMi5yZXNvbHZlKGl0ZXJhYmxlW2ldKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbnZhciBwJDEgPSBQcm9taXNlJDIucHJvdG90eXBlO1xuXG5wJDEucmVzb2x2ZSA9IGZ1bmN0aW9uIHJlc29sdmUoeCkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIGlmIChwcm9taXNlLnN0YXRlID09PSBQRU5ESU5HKSB7XG4gICAgICAgIGlmICh4ID09PSBwcm9taXNlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm9taXNlIHNldHRsZWQgd2l0aCBpdHNlbGYuJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2FsbGVkID0gZmFsc2U7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciB0aGVuID0geCAmJiB4Wyd0aGVuJ107XG5cbiAgICAgICAgICAgIGlmICh4ICE9PSBudWxsICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoZW4uY2FsbCh4LCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKHgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2UucmVqZWN0KHIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICAgICAgICAgIHByb21pc2UucmVqZWN0KGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvbWlzZS5zdGF0ZSA9IFJFU09MVkVEO1xuICAgICAgICBwcm9taXNlLnZhbHVlID0geDtcbiAgICAgICAgcHJvbWlzZS5ub3RpZnkoKTtcbiAgICB9XG59O1xuXG5wJDEucmVqZWN0ID0gZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIGlmIChwcm9taXNlLnN0YXRlID09PSBQRU5ESU5HKSB7XG4gICAgICAgIGlmIChyZWFzb24gPT09IHByb21pc2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb21pc2Ugc2V0dGxlZCB3aXRoIGl0c2VsZi4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2Uuc3RhdGUgPSBSRUpFQ1RFRDtcbiAgICAgICAgcHJvbWlzZS52YWx1ZSA9IHJlYXNvbjtcbiAgICAgICAgcHJvbWlzZS5ub3RpZnkoKTtcbiAgICB9XG59O1xuXG5wJDEubm90aWZ5ID0gZnVuY3Rpb24gbm90aWZ5KCkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHByb21pc2Uuc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICAgICAgICAgIHdoaWxlIChwcm9taXNlLmRlZmVycmVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9IHByb21pc2UuZGVmZXJyZWQuc2hpZnQoKSxcbiAgICAgICAgICAgICAgICAgICAgb25SZXNvbHZlZCA9IGRlZmVycmVkWzBdLFxuICAgICAgICAgICAgICAgICAgICBvblJlamVjdGVkID0gZGVmZXJyZWRbMV0sXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUgPSBkZWZlcnJlZFsyXSxcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0ID0gZGVmZXJyZWRbM107XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvbWlzZS5zdGF0ZSA9PT0gUkVTT0xWRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb25SZXNvbHZlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUob25SZXNvbHZlZC5jYWxsKHVuZGVmaW5lZCwgcHJvbWlzZS52YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHByb21pc2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb21pc2Uuc3RhdGUgPT09IFJFSkVDVEVEKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG9uUmVqZWN0ZWQuY2FsbCh1bmRlZmluZWQsIHByb21pc2UudmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHByb21pc2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5wJDEudGhlbiA9IGZ1bmN0aW9uIHRoZW4ob25SZXNvbHZlZCwgb25SZWplY3RlZCkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSQyKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcHJvbWlzZS5kZWZlcnJlZC5wdXNoKFtvblJlc29sdmVkLCBvblJlamVjdGVkLCByZXNvbHZlLCByZWplY3RdKTtcbiAgICAgICAgcHJvbWlzZS5ub3RpZnkoKTtcbiAgICB9KTtcbn07XG5cbnAkMS5jYXRjaCA9IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xufTtcblxudmFyIFByb21pc2VPYmogPSB3aW5kb3cuUHJvbWlzZSB8fCBQcm9taXNlJDI7XG5cbmZ1bmN0aW9uIFByb21pc2UkMShleGVjdXRvciwgY29udGV4dCkge1xuXG4gICAgaWYgKGV4ZWN1dG9yIGluc3RhbmNlb2YgUHJvbWlzZU9iaikge1xuICAgICAgICB0aGlzLnByb21pc2UgPSBleGVjdXRvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZU9iaihleGVjdXRvci5iaW5kKGNvbnRleHQpKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xufVxuXG5Qcm9taXNlJDEuYWxsID0gZnVuY3Rpb24gKGl0ZXJhYmxlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoUHJvbWlzZU9iai5hbGwoaXRlcmFibGUpLCBjb250ZXh0KTtcbn07XG5cblByb21pc2UkMS5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoUHJvbWlzZU9iai5yZXNvbHZlKHZhbHVlKSwgY29udGV4dCk7XG59O1xuXG5Qcm9taXNlJDEucmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbiwgY29udGV4dCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKFByb21pc2VPYmoucmVqZWN0KHJlYXNvbiksIGNvbnRleHQpO1xufTtcblxuUHJvbWlzZSQxLnJhY2UgPSBmdW5jdGlvbiAoaXRlcmFibGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UkMShQcm9taXNlT2JqLnJhY2UoaXRlcmFibGUpLCBjb250ZXh0KTtcbn07XG5cbnZhciBwID0gUHJvbWlzZSQxLnByb3RvdHlwZTtcblxucC5iaW5kID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIHJldHVybiB0aGlzO1xufTtcblxucC50aGVuID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcblxuICAgIGlmIChmdWxmaWxsZWQgJiYgZnVsZmlsbGVkLmJpbmQgJiYgdGhpcy5jb250ZXh0KSB7XG4gICAgICAgIGZ1bGZpbGxlZCA9IGZ1bGZpbGxlZC5iaW5kKHRoaXMuY29udGV4dCk7XG4gICAgfVxuXG4gICAgaWYgKHJlamVjdGVkICYmIHJlamVjdGVkLmJpbmQgJiYgdGhpcy5jb250ZXh0KSB7XG4gICAgICAgIHJlamVjdGVkID0gcmVqZWN0ZWQuYmluZCh0aGlzLmNvbnRleHQpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKHRoaXMucHJvbWlzZS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpLCB0aGlzLmNvbnRleHQpO1xufTtcblxucC5jYXRjaCA9IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuXG4gICAgaWYgKHJlamVjdGVkICYmIHJlamVjdGVkLmJpbmQgJiYgdGhpcy5jb250ZXh0KSB7XG4gICAgICAgIHJlamVjdGVkID0gcmVqZWN0ZWQuYmluZCh0aGlzLmNvbnRleHQpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKHRoaXMucHJvbWlzZS5jYXRjaChyZWplY3RlZCksIHRoaXMuY29udGV4dCk7XG59O1xuXG5wLmZpbmFsbHkgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblxuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcyk7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcyk7XG4gICAgICAgIHJldHVybiBQcm9taXNlT2JqLnJlamVjdChyZWFzb24pO1xuICAgIH0pO1xufTtcblxudmFyIGRlYnVnID0gZmFsc2U7XG52YXIgdXRpbCA9IHt9O1xudmFyIGFycmF5ID0gW107XG5mdW5jdGlvbiBVdGlsIChWdWUpIHtcbiAgICB1dGlsID0gVnVlLnV0aWw7XG4gICAgZGVidWcgPSBWdWUuY29uZmlnLmRlYnVnIHx8ICFWdWUuY29uZmlnLnNpbGVudDtcbn1cblxuZnVuY3Rpb24gd2Fybihtc2cpIHtcbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGRlYnVnKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW1Z1ZVJlc291cmNlIHdhcm5dOiAnICsgbXNnKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGVycm9yKG1zZykge1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbmV4dFRpY2soY2IsIGN0eCkge1xuICAgIHJldHVybiB1dGlsLm5leHRUaWNrKGNiLCBjdHgpO1xufVxuXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyp8XFxzKiQvZywgJycpO1xufVxuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuZnVuY3Rpb24gaXNCb29sZWFuKHZhbCkge1xuICAgIHJldHVybiB2YWwgPT09IHRydWUgfHwgdmFsID09PSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jztcbn1cblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcbiAgICByZXR1cm4gaXNPYmplY3Qob2JqKSAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSA9PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKG9iaikge1xuICAgIHJldHVybiB0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnICYmIG9iaiBpbnN0YW5jZW9mIEZvcm1EYXRhO1xufVxuXG5mdW5jdGlvbiB3aGVuKHZhbHVlLCBmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG5cbiAgICB2YXIgcHJvbWlzZSA9IFByb21pc2UkMS5yZXNvbHZlKHZhbHVlKTtcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpO1xufVxuXG5mdW5jdGlvbiBvcHRpb25zKGZuLCBvYmosIG9wdHMpIHtcblxuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gICAgaWYgKGlzRnVuY3Rpb24ob3B0cykpIHtcbiAgICAgICAgb3B0cyA9IG9wdHMuY2FsbChvYmopO1xuICAgIH1cblxuICAgIHJldHVybiBtZXJnZShmbi5iaW5kKHsgJHZtOiBvYmosICRvcHRpb25zOiBvcHRzIH0pLCBmbiwgeyAkb3B0aW9uczogb3B0cyB9KTtcbn1cblxuZnVuY3Rpb24gZWFjaChvYmosIGl0ZXJhdG9yKSB7XG5cbiAgICB2YXIgaSwga2V5O1xuXG4gICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoID09ICdudW1iZXInKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwob2JqW2ldLCBvYmpbaV0sIGkpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChpc09iamVjdChvYmopKSB7XG4gICAgICAgIGZvciAoa2V5IGluIG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChvYmpba2V5XSwgb2JqW2tleV0sIGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufVxuXG52YXIgYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBfYXNzaWduO1xuXG5mdW5jdGlvbiBtZXJnZSh0YXJnZXQpIHtcblxuICAgIHZhciBhcmdzID0gYXJyYXkuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgICAgX21lcmdlKHRhcmdldCwgc291cmNlLCB0cnVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRzKHRhcmdldCkge1xuXG4gICAgdmFyIGFyZ3MgPSBhcnJheS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICBhcmdzLmZvckVhY2goZnVuY3Rpb24gKHNvdXJjZSkge1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmICh0YXJnZXRba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gX2Fzc2lnbih0YXJnZXQpIHtcblxuICAgIHZhciBhcmdzID0gYXJyYXkuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgICAgX21lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIF9tZXJnZSh0YXJnZXQsIHNvdXJjZSwgZGVlcCkge1xuICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgaWYgKGRlZXAgJiYgKGlzUGxhaW5PYmplY3Qoc291cmNlW2tleV0pIHx8IGlzQXJyYXkoc291cmNlW2tleV0pKSkge1xuICAgICAgICAgICAgaWYgKGlzUGxhaW5PYmplY3Qoc291cmNlW2tleV0pICYmICFpc1BsYWluT2JqZWN0KHRhcmdldFtrZXldKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNBcnJheShzb3VyY2Vba2V5XSkgJiYgIWlzQXJyYXkodGFyZ2V0W2tleV0pKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9tZXJnZSh0YXJnZXRba2V5XSwgc291cmNlW2tleV0sIGRlZXApO1xuICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZVtrZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJvb3QgKG9wdGlvbnMsIG5leHQpIHtcblxuICAgIHZhciB1cmwgPSBuZXh0KG9wdGlvbnMpO1xuXG4gICAgaWYgKGlzU3RyaW5nKG9wdGlvbnMucm9vdCkgJiYgIXVybC5tYXRjaCgvXihodHRwcz86KT9cXC8vKSkge1xuICAgICAgICB1cmwgPSBvcHRpb25zLnJvb3QgKyAnLycgKyB1cmw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVybDtcbn1cblxuZnVuY3Rpb24gcXVlcnkgKG9wdGlvbnMsIG5leHQpIHtcblxuICAgIHZhciB1cmxQYXJhbXMgPSBPYmplY3Qua2V5cyhVcmwub3B0aW9ucy5wYXJhbXMpLFxuICAgICAgICBxdWVyeSA9IHt9LFxuICAgICAgICB1cmwgPSBuZXh0KG9wdGlvbnMpO1xuXG4gICAgZWFjaChvcHRpb25zLnBhcmFtcywgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgaWYgKHVybFBhcmFtcy5pbmRleE9mKGtleSkgPT09IC0xKSB7XG4gICAgICAgICAgICBxdWVyeVtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHF1ZXJ5ID0gVXJsLnBhcmFtcyhxdWVyeSk7XG5cbiAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09IC0xID8gJz8nIDogJyYnKSArIHF1ZXJ5O1xuICAgIH1cblxuICAgIHJldHVybiB1cmw7XG59XG5cbi8qKlxuICogVVJMIFRlbXBsYXRlIHYyLjAuNiAoaHR0cHM6Ly9naXRodWIuY29tL2JyYW1zdGVpbi91cmwtdGVtcGxhdGUpXG4gKi9cblxuZnVuY3Rpb24gZXhwYW5kKHVybCwgcGFyYW1zLCB2YXJpYWJsZXMpIHtcblxuICAgIHZhciB0bXBsID0gcGFyc2UodXJsKSxcbiAgICAgICAgZXhwYW5kZWQgPSB0bXBsLmV4cGFuZChwYXJhbXMpO1xuXG4gICAgaWYgKHZhcmlhYmxlcykge1xuICAgICAgICB2YXJpYWJsZXMucHVzaC5hcHBseSh2YXJpYWJsZXMsIHRtcGwudmFycyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cGFuZGVkO1xufVxuXG5mdW5jdGlvbiBwYXJzZSh0ZW1wbGF0ZSkge1xuXG4gICAgdmFyIG9wZXJhdG9ycyA9IFsnKycsICcjJywgJy4nLCAnLycsICc7JywgJz8nLCAnJiddLFxuICAgICAgICB2YXJpYWJsZXMgPSBbXTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHZhcnM6IHZhcmlhYmxlcyxcbiAgICAgICAgZXhwYW5kOiBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlLnJlcGxhY2UoL1xceyhbXlxce1xcfV0rKVxcfXwoW15cXHtcXH1dKykvZywgZnVuY3Rpb24gKF8sIGV4cHJlc3Npb24sIGxpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXhwcmVzc2lvbikge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcGVyYXRvciA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAob3BlcmF0b3JzLmluZGV4T2YoZXhwcmVzc2lvbi5jaGFyQXQoMCkpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0b3IgPSBleHByZXNzaW9uLmNoYXJBdCgwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24gPSBleHByZXNzaW9uLnN1YnN0cigxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb24uc3BsaXQoLywvZykuZm9yRWFjaChmdW5jdGlvbiAodmFyaWFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0bXAgPSAvKFteOlxcKl0qKSg/OjooXFxkKyl8KFxcKikpPy8uZXhlYyh2YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaC5hcHBseSh2YWx1ZXMsIGdldFZhbHVlcyhjb250ZXh0LCBvcGVyYXRvciwgdG1wWzFdLCB0bXBbMl0gfHwgdG1wWzNdKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXMucHVzaCh0bXBbMV0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAob3BlcmF0b3IgJiYgb3BlcmF0b3IgIT09ICcrJykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VwYXJhdG9yID0gJywnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3BlcmF0b3IgPT09ICc/Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcGFyYXRvciA9ICcmJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob3BlcmF0b3IgIT09ICcjJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcGFyYXRvciA9IG9wZXJhdG9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHZhbHVlcy5sZW5ndGggIT09IDAgPyBvcGVyYXRvciA6ICcnKSArIHZhbHVlcy5qb2luKHNlcGFyYXRvcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzLmpvaW4oJywnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbmNvZGVSZXNlcnZlZChsaXRlcmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlcyhjb250ZXh0LCBvcGVyYXRvciwga2V5LCBtb2RpZmllcikge1xuXG4gICAgdmFyIHZhbHVlID0gY29udGV4dFtrZXldLFxuICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgIGlmIChpc0RlZmluZWQodmFsdWUpICYmIHZhbHVlICE9PSAnJykge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIGlmIChtb2RpZmllciAmJiBtb2RpZmllciAhPT0gJyonKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgcGFyc2VJbnQobW9kaWZpZXIsIDEwKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVZhbHVlKG9wZXJhdG9yLCB2YWx1ZSwgaXNLZXlPcGVyYXRvcihvcGVyYXRvcikgPyBrZXkgOiBudWxsKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobW9kaWZpZXIgPT09ICcqJykge1xuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5maWx0ZXIoaXNEZWZpbmVkKS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlLCBpc0tleU9wZXJhdG9yKG9wZXJhdG9yKSA/IGtleSA6IG51bGwpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXModmFsdWUpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmluZWQodmFsdWVba10pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlW2tdLCBrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHRtcCA9IFtdO1xuXG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLmZpbHRlcihpc0RlZmluZWQpLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0bXAucHVzaChlbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXModmFsdWUpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmluZWQodmFsdWVba10pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGspKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXAucHVzaChlbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWVba10udG9TdHJpbmcoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNLZXlPcGVyYXRvcihvcGVyYXRvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyB0bXAuam9pbignLCcpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRtcC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godG1wLmpvaW4oJywnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9wZXJhdG9yID09PSAnOycpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gJycgJiYgKG9wZXJhdG9yID09PSAnJicgfHwgb3BlcmF0b3IgPT09ICc/JykpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKCcnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzRGVmaW5lZCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc0tleU9wZXJhdG9yKG9wZXJhdG9yKSB7XG4gICAgcmV0dXJuIG9wZXJhdG9yID09PSAnOycgfHwgb3BlcmF0b3IgPT09ICcmJyB8fCBvcGVyYXRvciA9PT0gJz8nO1xufVxuXG5mdW5jdGlvbiBlbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWUsIGtleSkge1xuXG4gICAgdmFsdWUgPSBvcGVyYXRvciA9PT0gJysnIHx8IG9wZXJhdG9yID09PSAnIycgPyBlbmNvZGVSZXNlcnZlZCh2YWx1ZSkgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBlbmNvZGVSZXNlcnZlZChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnNwbGl0KC8oJVswLTlBLUZhLWZdezJ9KS9nKS5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgaWYgKCEvJVswLTlBLUZhLWZdLy50ZXN0KHBhcnQpKSB7XG4gICAgICAgICAgICBwYXJ0ID0gZW5jb2RlVVJJKHBhcnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJ0O1xuICAgIH0pLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiB0ZW1wbGF0ZSAob3B0aW9ucykge1xuXG4gICAgdmFyIHZhcmlhYmxlcyA9IFtdLFxuICAgICAgICB1cmwgPSBleHBhbmQob3B0aW9ucy51cmwsIG9wdGlvbnMucGFyYW1zLCB2YXJpYWJsZXMpO1xuXG4gICAgdmFyaWFibGVzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBkZWxldGUgb3B0aW9ucy5wYXJhbXNba2V5XTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1cmw7XG59XG5cbi8qKlxuICogU2VydmljZSBmb3IgVVJMIHRlbXBsYXRpbmcuXG4gKi9cblxudmFyIGllID0gZG9jdW1lbnQuZG9jdW1lbnRNb2RlO1xudmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuXG5mdW5jdGlvbiBVcmwodXJsLCBwYXJhbXMpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcyB8fCB7fSxcbiAgICAgICAgb3B0aW9ucyA9IHVybCxcbiAgICAgICAgdHJhbnNmb3JtO1xuXG4gICAgaWYgKGlzU3RyaW5nKHVybCkpIHtcbiAgICAgICAgb3B0aW9ucyA9IHsgdXJsOiB1cmwsIHBhcmFtczogcGFyYW1zIH07XG4gICAgfVxuXG4gICAgb3B0aW9ucyA9IG1lcmdlKHt9LCBVcmwub3B0aW9ucywgc2VsZi4kb3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICBVcmwudHJhbnNmb3Jtcy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgIHRyYW5zZm9ybSA9IGZhY3RvcnkoaGFuZGxlciwgdHJhbnNmb3JtLCBzZWxmLiR2bSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdHJhbnNmb3JtKG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIFVybCBvcHRpb25zLlxuICovXG5cblVybC5vcHRpb25zID0ge1xuICAgIHVybDogJycsXG4gICAgcm9vdDogbnVsbCxcbiAgICBwYXJhbXM6IHt9XG59O1xuXG4vKipcbiAqIFVybCB0cmFuc2Zvcm1zLlxuICovXG5cblVybC50cmFuc2Zvcm1zID0gW3RlbXBsYXRlLCBxdWVyeSwgcm9vdF07XG5cbi8qKlxuICogRW5jb2RlcyBhIFVybCBwYXJhbWV0ZXIgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqL1xuXG5VcmwucGFyYW1zID0gZnVuY3Rpb24gKG9iaikge1xuXG4gICAgdmFyIHBhcmFtcyA9IFtdLFxuICAgICAgICBlc2NhcGUgPSBlbmNvZGVVUklDb21wb25lbnQ7XG5cbiAgICBwYXJhbXMuYWRkID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdmFsdWUgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHVzaChlc2NhcGUoa2V5KSArICc9JyArIGVzY2FwZSh2YWx1ZSkpO1xuICAgIH07XG5cbiAgICBzZXJpYWxpemUocGFyYW1zLCBvYmopO1xuXG4gICAgcmV0dXJuIHBhcmFtcy5qb2luKCcmJykucmVwbGFjZSgvJTIwL2csICcrJyk7XG59O1xuXG4vKipcbiAqIFBhcnNlIGEgVVJMIGFuZCByZXR1cm4gaXRzIGNvbXBvbmVudHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICovXG5cblVybC5wYXJzZSA9IGZ1bmN0aW9uICh1cmwpIHtcblxuICAgIGlmIChpZSkge1xuICAgICAgICBlbC5ocmVmID0gdXJsO1xuICAgICAgICB1cmwgPSBlbC5ocmVmO1xuICAgIH1cblxuICAgIGVsLmhyZWYgPSB1cmw7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBocmVmOiBlbC5ocmVmLFxuICAgICAgICBwcm90b2NvbDogZWwucHJvdG9jb2wgPyBlbC5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICBwb3J0OiBlbC5wb3J0LFxuICAgICAgICBob3N0OiBlbC5ob3N0LFxuICAgICAgICBob3N0bmFtZTogZWwuaG9zdG5hbWUsXG4gICAgICAgIHBhdGhuYW1lOiBlbC5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJyA/IGVsLnBhdGhuYW1lIDogJy8nICsgZWwucGF0aG5hbWUsXG4gICAgICAgIHNlYXJjaDogZWwuc2VhcmNoID8gZWwuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgaGFzaDogZWwuaGFzaCA/IGVsLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJ1xuICAgIH07XG59O1xuXG5mdW5jdGlvbiBmYWN0b3J5KGhhbmRsZXIsIG5leHQsIHZtKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGVyLmNhbGwodm0sIG9wdGlvbnMsIG5leHQpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShwYXJhbXMsIG9iaiwgc2NvcGUpIHtcblxuICAgIHZhciBhcnJheSA9IGlzQXJyYXkob2JqKSxcbiAgICAgICAgcGxhaW4gPSBpc1BsYWluT2JqZWN0KG9iaiksXG4gICAgICAgIGhhc2g7XG5cbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcblxuICAgICAgICBoYXNoID0gaXNPYmplY3QodmFsdWUpIHx8IGlzQXJyYXkodmFsdWUpO1xuXG4gICAgICAgIGlmIChzY29wZSkge1xuICAgICAgICAgICAga2V5ID0gc2NvcGUgKyAnWycgKyAocGxhaW4gfHwgaGFzaCA/IGtleSA6ICcnKSArICddJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2NvcGUgJiYgYXJyYXkpIHtcbiAgICAgICAgICAgIHBhcmFtcy5hZGQodmFsdWUubmFtZSwgdmFsdWUudmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhc2gpIHtcbiAgICAgICAgICAgIHNlcmlhbGl6ZShwYXJhbXMsIHZhbHVlLCBrZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyYW1zLmFkZChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiB4ZHJDbGllbnQgKHJlcXVlc3QpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXG4gICAgICAgIHZhciB4ZHIgPSBuZXcgWERvbWFpblJlcXVlc3QoKSxcbiAgICAgICAgICAgIGhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gcmVxdWVzdC5yZXNwb25kV2l0aCh4ZHIucmVzcG9uc2VUZXh0LCB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiB4ZHIuc3RhdHVzLFxuICAgICAgICAgICAgICAgIHN0YXR1c1RleHQ6IHhkci5zdGF0dXNUZXh0XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB4ZHIuYWJvcnQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB4ZHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC5nZXRVcmwoKSwgdHJ1ZSk7XG4gICAgICAgIHhkci50aW1lb3V0ID0gMDtcbiAgICAgICAgeGRyLm9ubG9hZCA9IGhhbmRsZXI7XG4gICAgICAgIHhkci5vbmVycm9yID0gaGFuZGxlcjtcbiAgICAgICAgeGRyLm9udGltZW91dCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICB4ZHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICB4ZHIuc2VuZChyZXF1ZXN0LmdldEJvZHkoKSk7XG4gICAgfSk7XG59XG5cbnZhciBPUklHSU5fVVJMID0gVXJsLnBhcnNlKGxvY2F0aW9uLmhyZWYpO1xudmFyIFNVUFBPUlRTX0NPUlMgPSAnd2l0aENyZWRlbnRpYWxzJyBpbiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuZnVuY3Rpb24gY29ycyAocmVxdWVzdCwgbmV4dCkge1xuXG4gICAgaWYgKCFpc0Jvb2xlYW4ocmVxdWVzdC5jcm9zc09yaWdpbikgJiYgY3Jvc3NPcmlnaW4ocmVxdWVzdCkpIHtcbiAgICAgICAgcmVxdWVzdC5jcm9zc09yaWdpbiA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHJlcXVlc3QuY3Jvc3NPcmlnaW4pIHtcblxuICAgICAgICBpZiAoIVNVUFBPUlRTX0NPUlMpIHtcbiAgICAgICAgICAgIHJlcXVlc3QuY2xpZW50ID0geGRyQ2xpZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgZGVsZXRlIHJlcXVlc3QuZW11bGF0ZUhUVFA7XG4gICAgfVxuXG4gICAgbmV4dCgpO1xufVxuXG5mdW5jdGlvbiBjcm9zc09yaWdpbihyZXF1ZXN0KSB7XG5cbiAgICB2YXIgcmVxdWVzdFVybCA9IFVybC5wYXJzZShVcmwocmVxdWVzdCkpO1xuXG4gICAgcmV0dXJuIHJlcXVlc3RVcmwucHJvdG9jb2wgIT09IE9SSUdJTl9VUkwucHJvdG9jb2wgfHwgcmVxdWVzdFVybC5ob3N0ICE9PSBPUklHSU5fVVJMLmhvc3Q7XG59XG5cbmZ1bmN0aW9uIGJvZHkgKHJlcXVlc3QsIG5leHQpIHtcblxuICAgIGlmIChyZXF1ZXN0LmVtdWxhdGVKU09OICYmIGlzUGxhaW5PYmplY3QocmVxdWVzdC5ib2R5KSkge1xuICAgICAgICByZXF1ZXN0LmJvZHkgPSBVcmwucGFyYW1zKHJlcXVlc3QuYm9keSk7XG4gICAgICAgIHJlcXVlc3QuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJztcbiAgICB9XG5cbiAgICBpZiAoaXNGb3JtRGF0YShyZXF1ZXN0LmJvZHkpKSB7XG4gICAgICAgIGRlbGV0ZSByZXF1ZXN0LmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddO1xuICAgIH1cblxuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlcXVlc3QuYm9keSkpIHtcbiAgICAgICAgcmVxdWVzdC5ib2R5ID0gSlNPTi5zdHJpbmdpZnkocmVxdWVzdC5ib2R5KTtcbiAgICB9XG5cbiAgICBuZXh0KGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgIHZhciBjb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddO1xuXG4gICAgICAgIGlmIChpc1N0cmluZyhjb250ZW50VHlwZSkgJiYgY29udGVudFR5cGUuaW5kZXhPZignYXBwbGljYXRpb24vanNvbicpID09PSAwKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS5kYXRhID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEgPSByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24ganNvbnBDbGllbnQgKHJlcXVlc3QpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UkMShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXG4gICAgICAgIHZhciBuYW1lID0gcmVxdWVzdC5qc29ucCB8fCAnY2FsbGJhY2snLFxuICAgICAgICAgICAgY2FsbGJhY2sgPSAnX2pzb25wJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKSxcbiAgICAgICAgICAgIGJvZHkgPSBudWxsLFxuICAgICAgICAgICAgaGFuZGxlcixcbiAgICAgICAgICAgIHNjcmlwdDtcblxuICAgICAgICBoYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBzdGF0dXMgPSAwO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2xvYWQnICYmIGJvZHkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSAyMDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSA0MDQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25kV2l0aChib2R5LCB7IHN0YXR1czogc3RhdHVzIH0pKTtcblxuICAgICAgICAgICAgZGVsZXRlIHdpbmRvd1tjYWxsYmFja107XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVxdWVzdC5wYXJhbXNbbmFtZV0gPSBjYWxsYmFjaztcblxuICAgICAgICB3aW5kb3dbY2FsbGJhY2tdID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgYm9keSA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgIHNjcmlwdC5zcmMgPSByZXF1ZXN0LmdldFVybCgpO1xuICAgICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuICAgICAgICBzY3JpcHQub25sb2FkID0gaGFuZGxlcjtcbiAgICAgICAgc2NyaXB0Lm9uZXJyb3IgPSBoYW5kbGVyO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24ganNvbnAgKHJlcXVlc3QsIG5leHQpIHtcblxuICAgIGlmIChyZXF1ZXN0Lm1ldGhvZCA9PSAnSlNPTlAnKSB7XG4gICAgICAgIHJlcXVlc3QuY2xpZW50ID0ganNvbnBDbGllbnQ7XG4gICAgfVxuXG4gICAgbmV4dChmdW5jdGlvbiAocmVzcG9uc2UpIHtcblxuICAgICAgICBpZiAocmVxdWVzdC5tZXRob2QgPT0gJ0pTT05QJykge1xuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBiZWZvcmUgKHJlcXVlc3QsIG5leHQpIHtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHJlcXVlc3QuYmVmb3JlKSkge1xuICAgICAgICByZXF1ZXN0LmJlZm9yZS5jYWxsKHRoaXMsIHJlcXVlc3QpO1xuICAgIH1cblxuICAgIG5leHQoKTtcbn1cblxuLyoqXG4gKiBIVFRQIG1ldGhvZCBvdmVycmlkZSBJbnRlcmNlcHRvci5cbiAqL1xuXG5mdW5jdGlvbiBtZXRob2QgKHJlcXVlc3QsIG5leHQpIHtcblxuICAgIGlmIChyZXF1ZXN0LmVtdWxhdGVIVFRQICYmIC9eKFBVVHxQQVRDSHxERUxFVEUpJC9pLnRlc3QocmVxdWVzdC5tZXRob2QpKSB7XG4gICAgICAgIHJlcXVlc3QuaGVhZGVyc1snWC1IVFRQLU1ldGhvZC1PdmVycmlkZSddID0gcmVxdWVzdC5tZXRob2Q7XG4gICAgICAgIHJlcXVlc3QubWV0aG9kID0gJ1BPU1QnO1xuICAgIH1cblxuICAgIG5leHQoKTtcbn1cblxuZnVuY3Rpb24gaGVhZGVyIChyZXF1ZXN0LCBuZXh0KSB7XG5cbiAgICByZXF1ZXN0Lm1ldGhvZCA9IHJlcXVlc3QubWV0aG9kLnRvVXBwZXJDYXNlKCk7XG4gICAgcmVxdWVzdC5oZWFkZXJzID0gYXNzaWduKHt9LCBIdHRwLmhlYWRlcnMuY29tbW9uLCAhcmVxdWVzdC5jcm9zc09yaWdpbiA/IEh0dHAuaGVhZGVycy5jdXN0b20gOiB7fSwgSHR0cC5oZWFkZXJzW3JlcXVlc3QubWV0aG9kLnRvTG93ZXJDYXNlKCldLCByZXF1ZXN0LmhlYWRlcnMpO1xuXG4gICAgbmV4dCgpO1xufVxuXG4vKipcbiAqIFRpbWVvdXQgSW50ZXJjZXB0b3IuXG4gKi9cblxuZnVuY3Rpb24gdGltZW91dCAocmVxdWVzdCwgbmV4dCkge1xuXG4gICAgdmFyIHRpbWVvdXQ7XG5cbiAgICBpZiAocmVxdWVzdC50aW1lb3V0KSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgfSwgcmVxdWVzdC50aW1lb3V0KTtcbiAgICB9XG5cbiAgICBuZXh0KGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24geGhyQ2xpZW50IChyZXF1ZXN0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUpIHtcblxuICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgICAgICAgICBoYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IHJlcXVlc3QucmVzcG9uZFdpdGgoJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0LCB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzID09PSAxMjIzID8gMjA0IDogeGhyLnN0YXR1cywgLy8gSUU5IHN0YXR1cyBidWdcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzID09PSAxMjIzID8gJ05vIENvbnRlbnQnIDogdHJpbSh4aHIuc3RhdHVzVGV4dCksXG4gICAgICAgICAgICAgICAgaGVhZGVyczogcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSlcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXF1ZXN0LmFib3J0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHhoci5hYm9ydCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LmdldFVybCgpLCB0cnVlKTtcbiAgICAgICAgeGhyLnRpbWVvdXQgPSAwO1xuICAgICAgICB4aHIub25sb2FkID0gaGFuZGxlcjtcbiAgICAgICAgeGhyLm9uZXJyb3IgPSBoYW5kbGVyO1xuXG4gICAgICAgIGlmIChyZXF1ZXN0LnByb2dyZXNzKSB7XG4gICAgICAgICAgICBpZiAocmVxdWVzdC5tZXRob2QgPT09ICdHRVQnKSB7XG4gICAgICAgICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgcmVxdWVzdC5wcm9ncmVzcyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKC9eKFBPU1R8UFVUKSQvaS50ZXN0KHJlcXVlc3QubWV0aG9kKSkge1xuICAgICAgICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCByZXF1ZXN0LnByb2dyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSB0cnVlKSB7XG4gICAgICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVhY2gocmVxdWVzdC5oZWFkZXJzIHx8IHt9LCBmdW5jdGlvbiAodmFsdWUsIGhlYWRlcikge1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHhoci5zZW5kKHJlcXVlc3QuZ2V0Qm9keSgpKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXJzKHN0cikge1xuXG4gICAgdmFyIGhlYWRlcnMgPSB7fSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGk7XG5cbiAgICBlYWNoKHRyaW0oc3RyKS5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIChyb3cpIHtcblxuICAgICAgICBpID0gcm93LmluZGV4T2YoJzonKTtcbiAgICAgICAgbmFtZSA9IHRyaW0ocm93LnNsaWNlKDAsIGkpKTtcbiAgICAgICAgdmFsdWUgPSB0cmltKHJvdy5zbGljZShpICsgMSkpO1xuXG4gICAgICAgIGlmIChoZWFkZXJzW25hbWVdKSB7XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KGhlYWRlcnNbbmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVyc1tuYW1lXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVhZGVyc1tuYW1lXSA9IFtoZWFkZXJzW25hbWVdLCB2YWx1ZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGhlYWRlcnNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGhlYWRlcnM7XG59XG5cbmZ1bmN0aW9uIENsaWVudCAoY29udGV4dCkge1xuXG4gICAgdmFyIHJlcUhhbmRsZXJzID0gW3NlbmRSZXF1ZXN0XSxcbiAgICAgICAgcmVzSGFuZGxlcnMgPSBbXSxcbiAgICAgICAgaGFuZGxlcjtcblxuICAgIGlmICghaXNPYmplY3QoY29udGV4dCkpIHtcbiAgICAgICAgY29udGV4dCA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gQ2xpZW50KHJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUpIHtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZXhlYygpIHtcblxuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSByZXFIYW5kbGVycy5wb3AoKTtcblxuICAgICAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuY2FsbChjb250ZXh0LCByZXF1ZXN0LCBuZXh0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3YXJuKCdJbnZhbGlkIGludGVyY2VwdG9yIG9mIHR5cGUgJyArIHR5cGVvZiBoYW5kbGVyICsgJywgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG5leHQocmVzcG9uc2UpIHtcblxuICAgICAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKHJlc3BvbnNlKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc0hhbmRsZXJzLnVuc2hpZnQocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QocmVzcG9uc2UpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzSGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB3aGVuKHJlc3BvbnNlLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlci5jYWxsKGNvbnRleHQsIHJlc3BvbnNlKSB8fCByZXNwb25zZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB3aGVuKHJlc3BvbnNlLCByZXNvbHZlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZXhlYygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBleGVjKCk7XG4gICAgICAgIH0sIGNvbnRleHQpO1xuICAgIH1cblxuICAgIENsaWVudC51c2UgPSBmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICByZXFIYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgIH07XG5cbiAgICByZXR1cm4gQ2xpZW50O1xufVxuXG5mdW5jdGlvbiBzZW5kUmVxdWVzdChyZXF1ZXN0LCByZXNvbHZlKSB7XG5cbiAgICB2YXIgY2xpZW50ID0gcmVxdWVzdC5jbGllbnQgfHwgeGhyQ2xpZW50O1xuXG4gICAgcmVzb2x2ZShjbGllbnQocmVxdWVzdCkpO1xufVxuXG52YXIgY2xhc3NDYWxsQ2hlY2sgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufTtcblxuLyoqXG4gKiBIVFRQIFJlc3BvbnNlLlxuICovXG5cbnZhciBSZXNwb25zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBSZXNwb25zZShib2R5LCBfcmVmKSB7XG4gICAgICAgIHZhciB1cmwgPSBfcmVmLnVybDtcbiAgICAgICAgdmFyIGhlYWRlcnMgPSBfcmVmLmhlYWRlcnM7XG4gICAgICAgIHZhciBzdGF0dXMgPSBfcmVmLnN0YXR1cztcbiAgICAgICAgdmFyIHN0YXR1c1RleHQgPSBfcmVmLnN0YXR1c1RleHQ7XG4gICAgICAgIGNsYXNzQ2FsbENoZWNrKHRoaXMsIFJlc3BvbnNlKTtcblxuXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xuICAgICAgICB0aGlzLmJvZHkgPSBib2R5O1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBoZWFkZXJzIHx8IHt9O1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cyB8fCAwO1xuICAgICAgICB0aGlzLnN0YXR1c1RleHQgPSBzdGF0dXNUZXh0IHx8ICcnO1xuICAgICAgICB0aGlzLm9rID0gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gICAgfVxuXG4gICAgUmVzcG9uc2UucHJvdG90eXBlLnRleHQgPSBmdW5jdGlvbiB0ZXh0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ib2R5O1xuICAgIH07XG5cbiAgICBSZXNwb25zZS5wcm90b3R5cGUuYmxvYiA9IGZ1bmN0aW9uIGJsb2IoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQmxvYihbdGhpcy5ib2R5XSk7XG4gICAgfTtcblxuICAgIFJlc3BvbnNlLnByb3RvdHlwZS5qc29uID0gZnVuY3Rpb24ganNvbigpIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodGhpcy5ib2R5KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFJlc3BvbnNlO1xufSgpO1xuXG52YXIgUmVxdWVzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBSZXF1ZXN0KG9wdGlvbnMpIHtcbiAgICAgICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVxdWVzdCk7XG5cblxuICAgICAgICB0aGlzLm1ldGhvZCA9ICdHRVQnO1xuICAgICAgICB0aGlzLmJvZHkgPSBudWxsO1xuICAgICAgICB0aGlzLnBhcmFtcyA9IHt9O1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSB7fTtcblxuICAgICAgICBhc3NpZ24odGhpcywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgUmVxdWVzdC5wcm90b3R5cGUuZ2V0VXJsID0gZnVuY3Rpb24gZ2V0VXJsKCkge1xuICAgICAgICByZXR1cm4gVXJsKHRoaXMpO1xuICAgIH07XG5cbiAgICBSZXF1ZXN0LnByb3RvdHlwZS5nZXRCb2R5ID0gZnVuY3Rpb24gZ2V0Qm9keSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9keTtcbiAgICB9O1xuXG4gICAgUmVxdWVzdC5wcm90b3R5cGUucmVzcG9uZFdpdGggPSBmdW5jdGlvbiByZXNwb25kV2l0aChib2R5LCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoYm9keSwgYXNzaWduKG9wdGlvbnMgfHwge30sIHsgdXJsOiB0aGlzLmdldFVybCgpIH0pKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFJlcXVlc3Q7XG59KCk7XG5cbi8qKlxuICogU2VydmljZSBmb3Igc2VuZGluZyBuZXR3b3JrIHJlcXVlc3RzLlxuICovXG5cbnZhciBDVVNUT01fSEVBREVSUyA9IHsgJ1gtUmVxdWVzdGVkLVdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnIH07XG52YXIgQ09NTU9OX0hFQURFUlMgPSB7ICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJyB9O1xudmFyIEpTT05fQ09OVEVOVF9UWVBFID0geyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOCcgfTtcblxuZnVuY3Rpb24gSHR0cChvcHRpb25zKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXMgfHwge30sXG4gICAgICAgIGNsaWVudCA9IENsaWVudChzZWxmLiR2bSk7XG5cbiAgICBkZWZhdWx0cyhvcHRpb25zIHx8IHt9LCBzZWxmLiRvcHRpb25zLCBIdHRwLm9wdGlvbnMpO1xuXG4gICAgSHR0cC5pbnRlcmNlcHRvcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICBjbGllbnQudXNlKGhhbmRsZXIpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNsaWVudChuZXcgUmVxdWVzdChvcHRpb25zKSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblxuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2sgPyByZXNwb25zZSA6IFByb21pc2UkMS5yZWplY3QocmVzcG9uc2UpO1xuICAgIH0sIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgIGlmIChyZXNwb25zZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICBlcnJvcihyZXNwb25zZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZSQxLnJlamVjdChyZXNwb25zZSk7XG4gICAgfSk7XG59XG5cbkh0dHAub3B0aW9ucyA9IHt9O1xuXG5IdHRwLmhlYWRlcnMgPSB7XG4gICAgcHV0OiBKU09OX0NPTlRFTlRfVFlQRSxcbiAgICBwb3N0OiBKU09OX0NPTlRFTlRfVFlQRSxcbiAgICBwYXRjaDogSlNPTl9DT05URU5UX1RZUEUsXG4gICAgZGVsZXRlOiBKU09OX0NPTlRFTlRfVFlQRSxcbiAgICBjdXN0b206IENVU1RPTV9IRUFERVJTLFxuICAgIGNvbW1vbjogQ09NTU9OX0hFQURFUlNcbn07XG5cbkh0dHAuaW50ZXJjZXB0b3JzID0gW2JlZm9yZSwgdGltZW91dCwgbWV0aG9kLCBib2R5LCBqc29ucCwgaGVhZGVyLCBjb3JzXTtcblxuWydnZXQnLCAnZGVsZXRlJywgJ2hlYWQnLCAnanNvbnAnXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHtcblxuICAgIEh0dHBbbWV0aG9kXSA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMoYXNzaWduKG9wdGlvbnMgfHwge30sIHsgdXJsOiB1cmwsIG1ldGhvZDogbWV0aG9kIH0pKTtcbiAgICB9O1xufSk7XG5cblsncG9zdCcsICdwdXQnLCAncGF0Y2gnXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHtcblxuICAgIEh0dHBbbWV0aG9kXSA9IGZ1bmN0aW9uICh1cmwsIGJvZHksIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMoYXNzaWduKG9wdGlvbnMgfHwge30sIHsgdXJsOiB1cmwsIG1ldGhvZDogbWV0aG9kLCBib2R5OiBib2R5IH0pKTtcbiAgICB9O1xufSk7XG5cbmZ1bmN0aW9uIFJlc291cmNlKHVybCwgcGFyYW1zLCBhY3Rpb25zLCBvcHRpb25zKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXMgfHwge30sXG4gICAgICAgIHJlc291cmNlID0ge307XG5cbiAgICBhY3Rpb25zID0gYXNzaWduKHt9LCBSZXNvdXJjZS5hY3Rpb25zLCBhY3Rpb25zKTtcblxuICAgIGVhY2goYWN0aW9ucywgZnVuY3Rpb24gKGFjdGlvbiwgbmFtZSkge1xuXG4gICAgICAgIGFjdGlvbiA9IG1lcmdlKHsgdXJsOiB1cmwsIHBhcmFtczogcGFyYW1zIHx8IHt9IH0sIG9wdGlvbnMsIGFjdGlvbik7XG5cbiAgICAgICAgcmVzb3VyY2VbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKHNlbGYuJGh0dHAgfHwgSHR0cCkob3B0cyhhY3Rpb24sIGFyZ3VtZW50cykpO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc291cmNlO1xufVxuXG5mdW5jdGlvbiBvcHRzKGFjdGlvbiwgYXJncykge1xuXG4gICAgdmFyIG9wdGlvbnMgPSBhc3NpZ24oe30sIGFjdGlvbiksXG4gICAgICAgIHBhcmFtcyA9IHt9LFxuICAgICAgICBib2R5O1xuXG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuXG4gICAgICAgIGNhc2UgMjpcblxuICAgICAgICAgICAgcGFyYW1zID0gYXJnc1swXTtcbiAgICAgICAgICAgIGJvZHkgPSBhcmdzWzFdO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIDE6XG5cbiAgICAgICAgICAgIGlmICgvXihQT1NUfFBVVHxQQVRDSCkkL2kudGVzdChvcHRpb25zLm1ldGhvZCkpIHtcbiAgICAgICAgICAgICAgICBib2R5ID0gYXJnc1swXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zID0gYXJnc1swXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAwOlxuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuXG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgdXAgdG8gNCBhcmd1bWVudHMgW3BhcmFtcywgYm9keV0sIGdvdCAnICsgYXJncy5sZW5ndGggKyAnIGFyZ3VtZW50cyc7XG4gICAgfVxuXG4gICAgb3B0aW9ucy5ib2R5ID0gYm9keTtcbiAgICBvcHRpb25zLnBhcmFtcyA9IGFzc2lnbih7fSwgb3B0aW9ucy5wYXJhbXMsIHBhcmFtcyk7XG5cbiAgICByZXR1cm4gb3B0aW9ucztcbn1cblxuUmVzb3VyY2UuYWN0aW9ucyA9IHtcblxuICAgIGdldDogeyBtZXRob2Q6ICdHRVQnIH0sXG4gICAgc2F2ZTogeyBtZXRob2Q6ICdQT1NUJyB9LFxuICAgIHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSxcbiAgICB1cGRhdGU6IHsgbWV0aG9kOiAnUFVUJyB9LFxuICAgIHJlbW92ZTogeyBtZXRob2Q6ICdERUxFVEUnIH0sXG4gICAgZGVsZXRlOiB7IG1ldGhvZDogJ0RFTEVURScgfVxuXG59O1xuXG5mdW5jdGlvbiBwbHVnaW4oVnVlKSB7XG5cbiAgICBpZiAocGx1Z2luLmluc3RhbGxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgVXRpbChWdWUpO1xuXG4gICAgVnVlLnVybCA9IFVybDtcbiAgICBWdWUuaHR0cCA9IEh0dHA7XG4gICAgVnVlLnJlc291cmNlID0gUmVzb3VyY2U7XG4gICAgVnVlLlByb21pc2UgPSBQcm9taXNlJDE7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhWdWUucHJvdG90eXBlLCB7XG5cbiAgICAgICAgJHVybDoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMoVnVlLnVybCwgdGhpcywgdGhpcy4kb3B0aW9ucy51cmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgICRodHRwOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucyhWdWUuaHR0cCwgdGhpcywgdGhpcy4kb3B0aW9ucy5odHRwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAkcmVzb3VyY2U6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBWdWUucmVzb3VyY2UuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAkcHJvbWlzZToge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZXhlY3V0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBWdWUuUHJvbWlzZShleGVjdXRvciwgX3RoaXMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xufVxuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZ1ZSkge1xuICAgIHdpbmRvdy5WdWUudXNlKHBsdWdpbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGx1Z2luOyIsIi8qIVxuICogdnVlLXJvdXRlciB2MC43LjEzXG4gKiAoYykgMjAxNiBFdmFuIFlvdVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuICovXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIGdsb2JhbC5WdWVSb3V0ZXIgPSBmYWN0b3J5KCk7XG59KHRoaXMsIGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBiYWJlbEhlbHBlcnMgPSB7fTtcblxuICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBUYXJnZXQocGF0aCwgbWF0Y2hlciwgZGVsZWdhdGUpIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHRoaXMubWF0Y2hlciA9IG1hdGNoZXI7XG4gICAgdGhpcy5kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xuICB9XG5cbiAgVGFyZ2V0LnByb3RvdHlwZSA9IHtcbiAgICB0bzogZnVuY3Rpb24gdG8odGFyZ2V0LCBjYWxsYmFjaykge1xuICAgICAgdmFyIGRlbGVnYXRlID0gdGhpcy5kZWxlZ2F0ZTtcblxuICAgICAgaWYgKGRlbGVnYXRlICYmIGRlbGVnYXRlLndpbGxBZGRSb3V0ZSkge1xuICAgICAgICB0YXJnZXQgPSBkZWxlZ2F0ZS53aWxsQWRkUm91dGUodGhpcy5tYXRjaGVyLnRhcmdldCwgdGFyZ2V0KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5tYXRjaGVyLmFkZCh0aGlzLnBhdGgsIHRhcmdldCk7XG5cbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBpZiAoY2FsbGJhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgaGF2ZSBhbiBhcmd1bWVudCBpbiB0aGUgZnVuY3Rpb24gcGFzc2VkIHRvIGB0b2BcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYXRjaGVyLmFkZENoaWxkKHRoaXMucGF0aCwgdGFyZ2V0LCBjYWxsYmFjaywgdGhpcy5kZWxlZ2F0ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gTWF0Y2hlcih0YXJnZXQpIHtcbiAgICB0aGlzLnJvdXRlcyA9IHt9O1xuICAgIHRoaXMuY2hpbGRyZW4gPSB7fTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgfVxuXG4gIE1hdGNoZXIucHJvdG90eXBlID0ge1xuICAgIGFkZDogZnVuY3Rpb24gYWRkKHBhdGgsIGhhbmRsZXIpIHtcbiAgICAgIHRoaXMucm91dGVzW3BhdGhdID0gaGFuZGxlcjtcbiAgICB9LFxuXG4gICAgYWRkQ2hpbGQ6IGZ1bmN0aW9uIGFkZENoaWxkKHBhdGgsIHRhcmdldCwgY2FsbGJhY2ssIGRlbGVnYXRlKSB7XG4gICAgICB2YXIgbWF0Y2hlciA9IG5ldyBNYXRjaGVyKHRhcmdldCk7XG4gICAgICB0aGlzLmNoaWxkcmVuW3BhdGhdID0gbWF0Y2hlcjtcblxuICAgICAgdmFyIG1hdGNoID0gZ2VuZXJhdGVNYXRjaChwYXRoLCBtYXRjaGVyLCBkZWxlZ2F0ZSk7XG5cbiAgICAgIGlmIChkZWxlZ2F0ZSAmJiBkZWxlZ2F0ZS5jb250ZXh0RW50ZXJlZCkge1xuICAgICAgICBkZWxlZ2F0ZS5jb250ZXh0RW50ZXJlZCh0YXJnZXQsIG1hdGNoKTtcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2sobWF0Y2gpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBnZW5lcmF0ZU1hdGNoKHN0YXJ0aW5nUGF0aCwgbWF0Y2hlciwgZGVsZWdhdGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHBhdGgsIG5lc3RlZENhbGxiYWNrKSB7XG4gICAgICB2YXIgZnVsbFBhdGggPSBzdGFydGluZ1BhdGggKyBwYXRoO1xuXG4gICAgICBpZiAobmVzdGVkQ2FsbGJhY2spIHtcbiAgICAgICAgbmVzdGVkQ2FsbGJhY2soZ2VuZXJhdGVNYXRjaChmdWxsUGF0aCwgbWF0Y2hlciwgZGVsZWdhdGUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgVGFyZ2V0KHN0YXJ0aW5nUGF0aCArIHBhdGgsIG1hdGNoZXIsIGRlbGVnYXRlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkUm91dGUocm91dGVBcnJheSwgcGF0aCwgaGFuZGxlcikge1xuICAgIHZhciBsZW4gPSAwO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcm91dGVBcnJheS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGxlbiArPSByb3V0ZUFycmF5W2ldLnBhdGgubGVuZ3RoO1xuICAgIH1cblxuICAgIHBhdGggPSBwYXRoLnN1YnN0cihsZW4pO1xuICAgIHZhciByb3V0ZSA9IHsgcGF0aDogcGF0aCwgaGFuZGxlcjogaGFuZGxlciB9O1xuICAgIHJvdXRlQXJyYXkucHVzaChyb3V0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBlYWNoUm91dGUoYmFzZVJvdXRlLCBtYXRjaGVyLCBjYWxsYmFjaywgYmluZGluZykge1xuICAgIHZhciByb3V0ZXMgPSBtYXRjaGVyLnJvdXRlcztcblxuICAgIGZvciAodmFyIHBhdGggaW4gcm91dGVzKSB7XG4gICAgICBpZiAocm91dGVzLmhhc093blByb3BlcnR5KHBhdGgpKSB7XG4gICAgICAgIHZhciByb3V0ZUFycmF5ID0gYmFzZVJvdXRlLnNsaWNlKCk7XG4gICAgICAgIGFkZFJvdXRlKHJvdXRlQXJyYXksIHBhdGgsIHJvdXRlc1twYXRoXSk7XG5cbiAgICAgICAgaWYgKG1hdGNoZXIuY2hpbGRyZW5bcGF0aF0pIHtcbiAgICAgICAgICBlYWNoUm91dGUocm91dGVBcnJheSwgbWF0Y2hlci5jaGlsZHJlbltwYXRoXSwgY2FsbGJhY2ssIGJpbmRpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwoYmluZGluZywgcm91dGVBcnJheSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYXAgKGNhbGxiYWNrLCBhZGRSb3V0ZUNhbGxiYWNrKSB7XG4gICAgdmFyIG1hdGNoZXIgPSBuZXcgTWF0Y2hlcigpO1xuXG4gICAgY2FsbGJhY2soZ2VuZXJhdGVNYXRjaChcIlwiLCBtYXRjaGVyLCB0aGlzLmRlbGVnYXRlKSk7XG5cbiAgICBlYWNoUm91dGUoW10sIG1hdGNoZXIsIGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgICAgaWYgKGFkZFJvdXRlQ2FsbGJhY2spIHtcbiAgICAgICAgYWRkUm91dGVDYWxsYmFjayh0aGlzLCByb3V0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFkZChyb3V0ZSk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gIH1cblxuICB2YXIgc3BlY2lhbHMgPSBbJy8nLCAnLicsICcqJywgJysnLCAnPycsICd8JywgJygnLCAnKScsICdbJywgJ10nLCAneycsICd9JywgJ1xcXFwnXTtcblxuICB2YXIgZXNjYXBlUmVnZXggPSBuZXcgUmVnRXhwKCcoXFxcXCcgKyBzcGVjaWFscy5qb2luKCd8XFxcXCcpICsgJyknLCAnZycpO1xuXG4gIHZhciBub1dhcm5pbmcgPSBmYWxzZTtcbiAgZnVuY3Rpb24gd2Fybihtc2cpIHtcbiAgICBpZiAoIW5vV2FybmluZyAmJiB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1t2dWUtcm91dGVyXSAnICsgbXNnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0cnlEZWNvZGUodXJpLCBhc0NvbXBvbmVudCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXNDb21wb25lbnQgPyBkZWNvZGVVUklDb21wb25lbnQodXJpKSA6IGRlY29kZVVSSSh1cmkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHdhcm4oJ21hbGZvcm1lZCBVUkknICsgKGFzQ29tcG9uZW50ID8gJyBjb21wb25lbnQ6ICcgOiAnOiAnKSArIHVyaSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNBcnJheSh0ZXN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0ZXN0KSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xuICB9XG5cbiAgLy8gQSBTZWdtZW50IHJlcHJlc2VudHMgYSBzZWdtZW50IGluIHRoZSBvcmlnaW5hbCByb3V0ZSBkZXNjcmlwdGlvbi5cbiAgLy8gRWFjaCBTZWdtZW50IHR5cGUgcHJvdmlkZXMgYW4gYGVhY2hDaGFyYCBhbmQgYHJlZ2V4YCBtZXRob2QuXG4gIC8vXG4gIC8vIFRoZSBgZWFjaENoYXJgIG1ldGhvZCBpbnZva2VzIHRoZSBjYWxsYmFjayB3aXRoIG9uZSBvciBtb3JlIGNoYXJhY3RlclxuICAvLyBzcGVjaWZpY2F0aW9ucy4gQSBjaGFyYWN0ZXIgc3BlY2lmaWNhdGlvbiBjb25zdW1lcyBvbmUgb3IgbW9yZSBpbnB1dFxuICAvLyBjaGFyYWN0ZXJzLlxuICAvL1xuICAvLyBUaGUgYHJlZ2V4YCBtZXRob2QgcmV0dXJucyBhIHJlZ2V4IGZyYWdtZW50IGZvciB0aGUgc2VnbWVudC4gSWYgdGhlXG4gIC8vIHNlZ21lbnQgaXMgYSBkeW5hbWljIG9mIHN0YXIgc2VnbWVudCwgdGhlIHJlZ2V4IGZyYWdtZW50IGFsc28gaW5jbHVkZXNcbiAgLy8gYSBjYXB0dXJlLlxuICAvL1xuICAvLyBBIGNoYXJhY3RlciBzcGVjaWZpY2F0aW9uIGNvbnRhaW5zOlxuICAvL1xuICAvLyAqIGB2YWxpZENoYXJzYDogYSBTdHJpbmcgd2l0aCBhIGxpc3Qgb2YgYWxsIHZhbGlkIGNoYXJhY3RlcnMsIG9yXG4gIC8vICogYGludmFsaWRDaGFyc2A6IGEgU3RyaW5nIHdpdGggYSBsaXN0IG9mIGFsbCBpbnZhbGlkIGNoYXJhY3RlcnNcbiAgLy8gKiBgcmVwZWF0YDogdHJ1ZSBpZiB0aGUgY2hhcmFjdGVyIHNwZWNpZmljYXRpb24gY2FuIHJlcGVhdFxuXG4gIGZ1bmN0aW9uIFN0YXRpY1NlZ21lbnQoc3RyaW5nKSB7XG4gICAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG4gIH1cbiAgU3RhdGljU2VnbWVudC5wcm90b3R5cGUgPSB7XG4gICAgZWFjaENoYXI6IGZ1bmN0aW9uIGVhY2hDaGFyKGNhbGxiYWNrKSB7XG4gICAgICB2YXIgc3RyaW5nID0gdGhpcy5zdHJpbmcsXG4gICAgICAgICAgY2g7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc3RyaW5nLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBjaCA9IHN0cmluZy5jaGFyQXQoaSk7XG4gICAgICAgIGNhbGxiYWNrKHsgdmFsaWRDaGFyczogY2ggfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlZ2V4OiBmdW5jdGlvbiByZWdleCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0cmluZy5yZXBsYWNlKGVzY2FwZVJlZ2V4LCAnXFxcXCQxJyk7XG4gICAgfSxcblxuICAgIGdlbmVyYXRlOiBmdW5jdGlvbiBnZW5lcmF0ZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0cmluZztcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gRHluYW1pY1NlZ21lbnQobmFtZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cbiAgRHluYW1pY1NlZ21lbnQucHJvdG90eXBlID0ge1xuICAgIGVhY2hDaGFyOiBmdW5jdGlvbiBlYWNoQ2hhcihjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soeyBpbnZhbGlkQ2hhcnM6IFwiL1wiLCByZXBlYXQ6IHRydWUgfSk7XG4gICAgfSxcblxuICAgIHJlZ2V4OiBmdW5jdGlvbiByZWdleCgpIHtcbiAgICAgIHJldHVybiBcIihbXi9dKylcIjtcbiAgICB9LFxuXG4gICAgZ2VuZXJhdGU6IGZ1bmN0aW9uIGdlbmVyYXRlKHBhcmFtcykge1xuICAgICAgdmFyIHZhbCA9IHBhcmFtc1t0aGlzLm5hbWVdO1xuICAgICAgcmV0dXJuIHZhbCA9PSBudWxsID8gXCI6XCIgKyB0aGlzLm5hbWUgOiB2YWw7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIFN0YXJTZWdtZW50KG5hbWUpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG4gIFN0YXJTZWdtZW50LnByb3RvdHlwZSA9IHtcbiAgICBlYWNoQ2hhcjogZnVuY3Rpb24gZWFjaENoYXIoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKHsgaW52YWxpZENoYXJzOiBcIlwiLCByZXBlYXQ6IHRydWUgfSk7XG4gICAgfSxcblxuICAgIHJlZ2V4OiBmdW5jdGlvbiByZWdleCgpIHtcbiAgICAgIHJldHVybiBcIiguKylcIjtcbiAgICB9LFxuXG4gICAgZ2VuZXJhdGU6IGZ1bmN0aW9uIGdlbmVyYXRlKHBhcmFtcykge1xuICAgICAgdmFyIHZhbCA9IHBhcmFtc1t0aGlzLm5hbWVdO1xuICAgICAgcmV0dXJuIHZhbCA9PSBudWxsID8gXCI6XCIgKyB0aGlzLm5hbWUgOiB2YWw7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIEVwc2lsb25TZWdtZW50KCkge31cbiAgRXBzaWxvblNlZ21lbnQucHJvdG90eXBlID0ge1xuICAgIGVhY2hDaGFyOiBmdW5jdGlvbiBlYWNoQ2hhcigpIHt9LFxuICAgIHJlZ2V4OiBmdW5jdGlvbiByZWdleCgpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH0sXG4gICAgZ2VuZXJhdGU6IGZ1bmN0aW9uIGdlbmVyYXRlKCkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIHBhcnNlKHJvdXRlLCBuYW1lcywgc3BlY2lmaWNpdHkpIHtcbiAgICAvLyBub3JtYWxpemUgcm91dGUgYXMgbm90IHN0YXJ0aW5nIHdpdGggYSBcIi9cIi4gUmVjb2duaXRpb24gd2lsbFxuICAgIC8vIGFsc28gbm9ybWFsaXplLlxuICAgIGlmIChyb3V0ZS5jaGFyQXQoMCkgPT09IFwiL1wiKSB7XG4gICAgICByb3V0ZSA9IHJvdXRlLnN1YnN0cigxKTtcbiAgICB9XG5cbiAgICB2YXIgc2VnbWVudHMgPSByb3V0ZS5zcGxpdChcIi9cIiksXG4gICAgICAgIHJlc3VsdHMgPSBbXTtcblxuICAgIC8vIEEgcm91dGVzIGhhcyBzcGVjaWZpY2l0eSBkZXRlcm1pbmVkIGJ5IHRoZSBvcmRlciB0aGF0IGl0cyBkaWZmZXJlbnQgc2VnbWVudHNcbiAgICAvLyBhcHBlYXIgaW4uIFRoaXMgc3lzdGVtIG1pcnJvcnMgaG93IHRoZSBtYWduaXR1ZGUgb2YgbnVtYmVycyB3cml0dGVuIGFzIHN0cmluZ3NcbiAgICAvLyB3b3Jrcy5cbiAgICAvLyBDb25zaWRlciBhIG51bWJlciB3cml0dGVuIGFzOiBcImFiY1wiLiBBbiBleGFtcGxlIHdvdWxkIGJlIFwiMjAwXCIuIEFueSBvdGhlciBudW1iZXIgd3JpdHRlblxuICAgIC8vIFwieHl6XCIgd2lsbCBiZSBzbWFsbGVyIHRoYW4gXCJhYmNcIiBzbyBsb25nIGFzIGBhID4gemAuIEZvciBpbnN0YW5jZSwgXCIxOTlcIiBpcyBzbWFsbGVyXG4gICAgLy8gdGhlbiBcIjIwMFwiLCBldmVuIHRob3VnaCBcInlcIiBhbmQgXCJ6XCIgKHdoaWNoIGFyZSBib3RoIDkpIGFyZSBsYXJnZXIgdGhhbiBcIjBcIiAodGhlIHZhbHVlXG4gICAgLy8gb2YgKGBiYCBhbmQgYGNgKS4gVGhpcyBpcyBiZWNhdXNlIHRoZSBsZWFkaW5nIHN5bWJvbCwgXCIyXCIsIGlzIGxhcmdlciB0aGFuIHRoZSBvdGhlclxuICAgIC8vIGxlYWRpbmcgc3ltYm9sLCBcIjFcIi5cbiAgICAvLyBUaGUgcnVsZSBpcyB0aGF0IHN5bWJvbHMgdG8gdGhlIGxlZnQgY2FycnkgbW9yZSB3ZWlnaHQgdGhhbiBzeW1ib2xzIHRvIHRoZSByaWdodFxuICAgIC8vIHdoZW4gYSBudW1iZXIgaXMgd3JpdHRlbiBvdXQgYXMgYSBzdHJpbmcuIEluIHRoZSBhYm92ZSBzdHJpbmdzLCB0aGUgbGVhZGluZyBkaWdpdFxuICAgIC8vIHJlcHJlc2VudHMgaG93IG1hbnkgMTAwJ3MgYXJlIGluIHRoZSBudW1iZXIsIGFuZCBpdCBjYXJyaWVzIG1vcmUgd2VpZ2h0IHRoYW4gdGhlIG1pZGRsZVxuICAgIC8vIG51bWJlciB3aGljaCByZXByZXNlbnRzIGhvdyBtYW55IDEwJ3MgYXJlIGluIHRoZSBudW1iZXIuXG4gICAgLy8gVGhpcyBzeXN0ZW0gb2YgbnVtYmVyIG1hZ25pdHVkZSB3b3JrcyB3ZWxsIGZvciByb3V0ZSBzcGVjaWZpY2l0eSwgdG9vLiBBIHJvdXRlIHdyaXR0ZW4gYXNcbiAgICAvLyBgYS9iL2NgIHdpbGwgYmUgbW9yZSBzcGVjaWZpYyB0aGFuIGB4L3kvemAgYXMgbG9uZyBhcyBgYWAgaXMgbW9yZSBzcGVjaWZpYyB0aGFuXG4gICAgLy8gYHhgLCBpcnJlc3BlY3RpdmUgb2YgdGhlIG90aGVyIHBhcnRzLlxuICAgIC8vIEJlY2F1c2Ugb2YgdGhpcyBzaW1pbGFyaXR5LCB3ZSBhc3NpZ24gZWFjaCB0eXBlIG9mIHNlZ21lbnQgYSBudW1iZXIgdmFsdWUgd3JpdHRlbiBhcyBhXG4gICAgLy8gc3RyaW5nLiBXZSBjYW4gZmluZCB0aGUgc3BlY2lmaWNpdHkgb2YgY29tcG91bmQgcm91dGVzIGJ5IGNvbmNhdGVuYXRpbmcgdGhlc2Ugc3RyaW5nc1xuICAgIC8vIHRvZ2V0aGVyLCBmcm9tIGxlZnQgdG8gcmlnaHQuIEFmdGVyIHdlIGhhdmUgbG9vcGVkIHRocm91Z2ggYWxsIG9mIHRoZSBzZWdtZW50cyxcbiAgICAvLyB3ZSBjb252ZXJ0IHRoZSBzdHJpbmcgdG8gYSBudW1iZXIuXG4gICAgc3BlY2lmaWNpdHkudmFsID0gJyc7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHNlZ21lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIHNlZ21lbnQgPSBzZWdtZW50c1tpXSxcbiAgICAgICAgICBtYXRjaDtcblxuICAgICAgaWYgKG1hdGNoID0gc2VnbWVudC5tYXRjaCgvXjooW15cXC9dKykkLykpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBEeW5hbWljU2VnbWVudChtYXRjaFsxXSkpO1xuICAgICAgICBuYW1lcy5wdXNoKG1hdGNoWzFdKTtcbiAgICAgICAgc3BlY2lmaWNpdHkudmFsICs9ICczJztcbiAgICAgIH0gZWxzZSBpZiAobWF0Y2ggPSBzZWdtZW50Lm1hdGNoKC9eXFwqKFteXFwvXSspJC8pKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaChuZXcgU3RhclNlZ21lbnQobWF0Y2hbMV0pKTtcbiAgICAgICAgc3BlY2lmaWNpdHkudmFsICs9ICcyJztcbiAgICAgICAgbmFtZXMucHVzaChtYXRjaFsxXSk7XG4gICAgICB9IGVsc2UgaWYgKHNlZ21lbnQgPT09IFwiXCIpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBFcHNpbG9uU2VnbWVudCgpKTtcbiAgICAgICAgc3BlY2lmaWNpdHkudmFsICs9ICcxJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdHMucHVzaChuZXcgU3RhdGljU2VnbWVudChzZWdtZW50KSk7XG4gICAgICAgIHNwZWNpZmljaXR5LnZhbCArPSAnNCc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3BlY2lmaWNpdHkudmFsID0gK3NwZWNpZmljaXR5LnZhbDtcblxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLy8gQSBTdGF0ZSBoYXMgYSBjaGFyYWN0ZXIgc3BlY2lmaWNhdGlvbiBhbmQgKGBjaGFyU3BlY2ApIGFuZCBhIGxpc3Qgb2YgcG9zc2libGVcbiAgLy8gc3Vic2VxdWVudCBzdGF0ZXMgKGBuZXh0U3RhdGVzYCkuXG4gIC8vXG4gIC8vIElmIGEgU3RhdGUgaXMgYW4gYWNjZXB0aW5nIHN0YXRlLCBpdCB3aWxsIGFsc28gaGF2ZSBzZXZlcmFsIGFkZGl0aW9uYWxcbiAgLy8gcHJvcGVydGllczpcbiAgLy9cbiAgLy8gKiBgcmVnZXhgOiBBIHJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IGlzIHVzZWQgdG8gZXh0cmFjdCBwYXJhbWV0ZXJzIGZyb20gcGF0aHNcbiAgLy8gICB0aGF0IHJlYWNoZWQgdGhpcyBhY2NlcHRpbmcgc3RhdGUuXG4gIC8vICogYGhhbmRsZXJzYDogSW5mb3JtYXRpb24gb24gaG93IHRvIGNvbnZlcnQgdGhlIGxpc3Qgb2YgY2FwdHVyZXMgaW50byBjYWxsc1xuICAvLyAgIHRvIHJlZ2lzdGVyZWQgaGFuZGxlcnMgd2l0aCB0aGUgc3BlY2lmaWVkIHBhcmFtZXRlcnNcbiAgLy8gKiBgdHlwZXNgOiBIb3cgbWFueSBzdGF0aWMsIGR5bmFtaWMgb3Igc3RhciBzZWdtZW50cyBpbiB0aGlzIHJvdXRlLiBVc2VkIHRvXG4gIC8vICAgZGVjaWRlIHdoaWNoIHJvdXRlIHRvIHVzZSBpZiBtdWx0aXBsZSByZWdpc3RlcmVkIHJvdXRlcyBtYXRjaCBhIHBhdGguXG4gIC8vXG4gIC8vIEN1cnJlbnRseSwgU3RhdGUgaXMgaW1wbGVtZW50ZWQgbmFpdmVseSBieSBsb29waW5nIG92ZXIgYG5leHRTdGF0ZXNgIGFuZFxuICAvLyBjb21wYXJpbmcgYSBjaGFyYWN0ZXIgc3BlY2lmaWNhdGlvbiBhZ2FpbnN0IGEgY2hhcmFjdGVyLiBBIG1vcmUgZWZmaWNpZW50XG4gIC8vIGltcGxlbWVudGF0aW9uIHdvdWxkIHVzZSBhIGhhc2ggb2Yga2V5cyBwb2ludGluZyBhdCBvbmUgb3IgbW9yZSBuZXh0IHN0YXRlcy5cblxuICBmdW5jdGlvbiBTdGF0ZShjaGFyU3BlYykge1xuICAgIHRoaXMuY2hhclNwZWMgPSBjaGFyU3BlYztcbiAgICB0aGlzLm5leHRTdGF0ZXMgPSBbXTtcbiAgfVxuXG4gIFN0YXRlLnByb3RvdHlwZSA9IHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldChjaGFyU3BlYykge1xuICAgICAgdmFyIG5leHRTdGF0ZXMgPSB0aGlzLm5leHRTdGF0ZXM7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbmV4dFN0YXRlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV4dFN0YXRlc1tpXTtcblxuICAgICAgICB2YXIgaXNFcXVhbCA9IGNoaWxkLmNoYXJTcGVjLnZhbGlkQ2hhcnMgPT09IGNoYXJTcGVjLnZhbGlkQ2hhcnM7XG4gICAgICAgIGlzRXF1YWwgPSBpc0VxdWFsICYmIGNoaWxkLmNoYXJTcGVjLmludmFsaWRDaGFycyA9PT0gY2hhclNwZWMuaW52YWxpZENoYXJzO1xuXG4gICAgICAgIGlmIChpc0VxdWFsKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHB1dDogZnVuY3Rpb24gcHV0KGNoYXJTcGVjKSB7XG4gICAgICB2YXIgc3RhdGU7XG5cbiAgICAgIC8vIElmIHRoZSBjaGFyYWN0ZXIgc3BlY2lmaWNhdGlvbiBhbHJlYWR5IGV4aXN0cyBpbiBhIGNoaWxkIG9mIHRoZSBjdXJyZW50XG4gICAgICAvLyBzdGF0ZSwganVzdCByZXR1cm4gdGhhdCBzdGF0ZS5cbiAgICAgIGlmIChzdGF0ZSA9IHRoaXMuZ2V0KGNoYXJTcGVjKSkge1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICB9XG5cbiAgICAgIC8vIE1ha2UgYSBuZXcgc3RhdGUgZm9yIHRoZSBjaGFyYWN0ZXIgc3BlY1xuICAgICAgc3RhdGUgPSBuZXcgU3RhdGUoY2hhclNwZWMpO1xuXG4gICAgICAvLyBJbnNlcnQgdGhlIG5ldyBzdGF0ZSBhcyBhIGNoaWxkIG9mIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICB0aGlzLm5leHRTdGF0ZXMucHVzaChzdGF0ZSk7XG5cbiAgICAgIC8vIElmIHRoaXMgY2hhcmFjdGVyIHNwZWNpZmljYXRpb24gcmVwZWF0cywgaW5zZXJ0IHRoZSBuZXcgc3RhdGUgYXMgYSBjaGlsZFxuICAgICAgLy8gb2YgaXRzZWxmLiBOb3RlIHRoYXQgdGhpcyB3aWxsIG5vdCB0cmlnZ2VyIGFuIGluZmluaXRlIGxvb3AgYmVjYXVzZSBlYWNoXG4gICAgICAvLyB0cmFuc2l0aW9uIGR1cmluZyByZWNvZ25pdGlvbiBjb25zdW1lcyBhIGNoYXJhY3Rlci5cbiAgICAgIGlmIChjaGFyU3BlYy5yZXBlYXQpIHtcbiAgICAgICAgc3RhdGUubmV4dFN0YXRlcy5wdXNoKHN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIHRoZSBuZXcgc3RhdGVcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9LFxuXG4gICAgLy8gRmluZCBhIGxpc3Qgb2YgY2hpbGQgc3RhdGVzIG1hdGNoaW5nIHRoZSBuZXh0IGNoYXJhY3RlclxuICAgIG1hdGNoOiBmdW5jdGlvbiBtYXRjaChjaCkge1xuICAgICAgLy8gREVCVUcgXCJQcm9jZXNzaW5nIGBcIiArIGNoICsgXCJgOlwiXG4gICAgICB2YXIgbmV4dFN0YXRlcyA9IHRoaXMubmV4dFN0YXRlcyxcbiAgICAgICAgICBjaGlsZCxcbiAgICAgICAgICBjaGFyU3BlYyxcbiAgICAgICAgICBjaGFycztcblxuICAgICAgLy8gREVCVUcgXCIgIFwiICsgZGVidWdTdGF0ZSh0aGlzKVxuICAgICAgdmFyIHJldHVybmVkID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbmV4dFN0YXRlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgY2hpbGQgPSBuZXh0U3RhdGVzW2ldO1xuXG4gICAgICAgIGNoYXJTcGVjID0gY2hpbGQuY2hhclNwZWM7XG5cbiAgICAgICAgaWYgKHR5cGVvZiAoY2hhcnMgPSBjaGFyU3BlYy52YWxpZENoYXJzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBpZiAoY2hhcnMuaW5kZXhPZihjaCkgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm5lZC5wdXNoKGNoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIChjaGFycyA9IGNoYXJTcGVjLmludmFsaWRDaGFycykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgaWYgKGNoYXJzLmluZGV4T2YoY2gpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuZWQucHVzaChjaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXR1cm5lZDtcbiAgICB9XG5cbiAgICAvKiogSUYgREVCVUdcbiAgICAsIGRlYnVnOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjaGFyU3BlYyA9IHRoaXMuY2hhclNwZWMsXG4gICAgICAgICAgZGVidWcgPSBcIltcIixcbiAgICAgICAgICBjaGFycyA9IGNoYXJTcGVjLnZhbGlkQ2hhcnMgfHwgY2hhclNwZWMuaW52YWxpZENoYXJzO1xuICAgICAgIGlmIChjaGFyU3BlYy5pbnZhbGlkQ2hhcnMpIHsgZGVidWcgKz0gXCJeXCI7IH1cbiAgICAgIGRlYnVnICs9IGNoYXJzO1xuICAgICAgZGVidWcgKz0gXCJdXCI7XG4gICAgICAgaWYgKGNoYXJTcGVjLnJlcGVhdCkgeyBkZWJ1ZyArPSBcIitcIjsgfVxuICAgICAgIHJldHVybiBkZWJ1ZztcbiAgICB9XG4gICAgRU5EIElGICoqL1xuICB9O1xuXG4gIC8qKiBJRiBERUJVR1xuICBmdW5jdGlvbiBkZWJ1Zyhsb2cpIHtcbiAgICBjb25zb2xlLmxvZyhsb2cpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVidWdTdGF0ZShzdGF0ZSkge1xuICAgIHJldHVybiBzdGF0ZS5uZXh0U3RhdGVzLm1hcChmdW5jdGlvbihuKSB7XG4gICAgICBpZiAobi5uZXh0U3RhdGVzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gXCIoIFwiICsgbi5kZWJ1ZygpICsgXCIgW2FjY2VwdGluZ10gKVwiOyB9XG4gICAgICByZXR1cm4gXCIoIFwiICsgbi5kZWJ1ZygpICsgXCIgPHRoZW4+IFwiICsgbi5uZXh0U3RhdGVzLm1hcChmdW5jdGlvbihzKSB7IHJldHVybiBzLmRlYnVnKCkgfSkuam9pbihcIiBvciBcIikgKyBcIiApXCI7XG4gICAgfSkuam9pbihcIiwgXCIpXG4gIH1cbiAgRU5EIElGICoqL1xuXG4gIC8vIFNvcnQgdGhlIHJvdXRlcyBieSBzcGVjaWZpY2l0eVxuICBmdW5jdGlvbiBzb3J0U29sdXRpb25zKHN0YXRlcykge1xuICAgIHJldHVybiBzdGF0ZXMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGIuc3BlY2lmaWNpdHkudmFsIC0gYS5zcGVjaWZpY2l0eS52YWw7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWNvZ25pemVDaGFyKHN0YXRlcywgY2gpIHtcbiAgICB2YXIgbmV4dFN0YXRlcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdGF0ZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgc3RhdGUgPSBzdGF0ZXNbaV07XG5cbiAgICAgIG5leHRTdGF0ZXMgPSBuZXh0U3RhdGVzLmNvbmNhdChzdGF0ZS5tYXRjaChjaCkpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0U3RhdGVzO1xuICB9XG5cbiAgdmFyIG9DcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIChwcm90bykge1xuICAgIGZ1bmN0aW9uIEYoKSB7fVxuICAgIEYucHJvdG90eXBlID0gcHJvdG87XG4gICAgcmV0dXJuIG5ldyBGKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gUmVjb2duaXplUmVzdWx0cyhxdWVyeVBhcmFtcykge1xuICAgIHRoaXMucXVlcnlQYXJhbXMgPSBxdWVyeVBhcmFtcyB8fCB7fTtcbiAgfVxuICBSZWNvZ25pemVSZXN1bHRzLnByb3RvdHlwZSA9IG9DcmVhdGUoe1xuICAgIHNwbGljZTogQXJyYXkucHJvdG90eXBlLnNwbGljZSxcbiAgICBzbGljZTogQXJyYXkucHJvdG90eXBlLnNsaWNlLFxuICAgIHB1c2g6IEFycmF5LnByb3RvdHlwZS5wdXNoLFxuICAgIGxlbmd0aDogMCxcbiAgICBxdWVyeVBhcmFtczogbnVsbFxuICB9KTtcblxuICBmdW5jdGlvbiBmaW5kSGFuZGxlcihzdGF0ZSwgcGF0aCwgcXVlcnlQYXJhbXMpIHtcbiAgICB2YXIgaGFuZGxlcnMgPSBzdGF0ZS5oYW5kbGVycyxcbiAgICAgICAgcmVnZXggPSBzdGF0ZS5yZWdleDtcbiAgICB2YXIgY2FwdHVyZXMgPSBwYXRoLm1hdGNoKHJlZ2V4KSxcbiAgICAgICAgY3VycmVudENhcHR1cmUgPSAxO1xuICAgIHZhciByZXN1bHQgPSBuZXcgUmVjb2duaXplUmVzdWx0cyhxdWVyeVBhcmFtcyk7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGhhbmRsZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGhhbmRsZXIgPSBoYW5kbGVyc1tpXSxcbiAgICAgICAgICBuYW1lcyA9IGhhbmRsZXIubmFtZXMsXG4gICAgICAgICAgcGFyYW1zID0ge307XG5cbiAgICAgIGZvciAodmFyIGogPSAwLCBtID0gbmFtZXMubGVuZ3RoOyBqIDwgbTsgaisrKSB7XG4gICAgICAgIHBhcmFtc1tuYW1lc1tqXV0gPSBjYXB0dXJlc1tjdXJyZW50Q2FwdHVyZSsrXTtcbiAgICAgIH1cblxuICAgICAgcmVzdWx0LnB1c2goeyBoYW5kbGVyOiBoYW5kbGVyLmhhbmRsZXIsIHBhcmFtczogcGFyYW1zLCBpc0R5bmFtaWM6ICEhbmFtZXMubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTZWdtZW50KGN1cnJlbnRTdGF0ZSwgc2VnbWVudCkge1xuICAgIHNlZ21lbnQuZWFjaENoYXIoZnVuY3Rpb24gKGNoKSB7XG4gICAgICB2YXIgc3RhdGU7XG5cbiAgICAgIGN1cnJlbnRTdGF0ZSA9IGN1cnJlbnRTdGF0ZS5wdXQoY2gpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGN1cnJlbnRTdGF0ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZVF1ZXJ5UGFyYW1QYXJ0KHBhcnQpIHtcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNDAxL2ludGVyYWN0L2Zvcm1zLmh0bWwjaC0xNy4xMy40LjFcbiAgICBwYXJ0ID0gcGFydC5yZXBsYWNlKC9cXCsvZ20sICclMjAnKTtcbiAgICByZXR1cm4gdHJ5RGVjb2RlKHBhcnQsIHRydWUpO1xuICB9XG5cbiAgLy8gVGhlIG1haW4gaW50ZXJmYWNlXG5cbiAgdmFyIFJvdXRlUmVjb2duaXplciA9IGZ1bmN0aW9uIFJvdXRlUmVjb2duaXplcigpIHtcbiAgICB0aGlzLnJvb3RTdGF0ZSA9IG5ldyBTdGF0ZSgpO1xuICAgIHRoaXMubmFtZXMgPSB7fTtcbiAgfTtcblxuICBSb3V0ZVJlY29nbml6ZXIucHJvdG90eXBlID0ge1xuICAgIGFkZDogZnVuY3Rpb24gYWRkKHJvdXRlcywgb3B0aW9ucykge1xuICAgICAgdmFyIGN1cnJlbnRTdGF0ZSA9IHRoaXMucm9vdFN0YXRlLFxuICAgICAgICAgIHJlZ2V4ID0gXCJeXCIsXG4gICAgICAgICAgc3BlY2lmaWNpdHkgPSB7fSxcbiAgICAgICAgICBoYW5kbGVycyA9IFtdLFxuICAgICAgICAgIGFsbFNlZ21lbnRzID0gW10sXG4gICAgICAgICAgbmFtZTtcblxuICAgICAgdmFyIGlzRW1wdHkgPSB0cnVlO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHJvdXRlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHJvdXRlID0gcm91dGVzW2ldLFxuICAgICAgICAgICAgbmFtZXMgPSBbXTtcblxuICAgICAgICB2YXIgc2VnbWVudHMgPSBwYXJzZShyb3V0ZS5wYXRoLCBuYW1lcywgc3BlY2lmaWNpdHkpO1xuXG4gICAgICAgIGFsbFNlZ21lbnRzID0gYWxsU2VnbWVudHMuY29uY2F0KHNlZ21lbnRzKTtcblxuICAgICAgICBmb3IgKHZhciBqID0gMCwgbSA9IHNlZ21lbnRzLmxlbmd0aDsgaiA8IG07IGorKykge1xuICAgICAgICAgIHZhciBzZWdtZW50ID0gc2VnbWVudHNbal07XG5cbiAgICAgICAgICBpZiAoc2VnbWVudCBpbnN0YW5jZW9mIEVwc2lsb25TZWdtZW50KSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpc0VtcHR5ID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBBZGQgYSBcIi9cIiBmb3IgdGhlIG5ldyBzZWdtZW50XG4gICAgICAgICAgY3VycmVudFN0YXRlID0gY3VycmVudFN0YXRlLnB1dCh7IHZhbGlkQ2hhcnM6IFwiL1wiIH0pO1xuICAgICAgICAgIHJlZ2V4ICs9IFwiL1wiO1xuXG4gICAgICAgICAgLy8gQWRkIGEgcmVwcmVzZW50YXRpb24gb2YgdGhlIHNlZ21lbnQgdG8gdGhlIE5GQSBhbmQgcmVnZXhcbiAgICAgICAgICBjdXJyZW50U3RhdGUgPSBhZGRTZWdtZW50KGN1cnJlbnRTdGF0ZSwgc2VnbWVudCk7XG4gICAgICAgICAgcmVnZXggKz0gc2VnbWVudC5yZWdleCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGhhbmRsZXIgPSB7IGhhbmRsZXI6IHJvdXRlLmhhbmRsZXIsIG5hbWVzOiBuYW1lcyB9O1xuICAgICAgICBoYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICBjdXJyZW50U3RhdGUgPSBjdXJyZW50U3RhdGUucHV0KHsgdmFsaWRDaGFyczogXCIvXCIgfSk7XG4gICAgICAgIHJlZ2V4ICs9IFwiL1wiO1xuICAgICAgfVxuXG4gICAgICBjdXJyZW50U3RhdGUuaGFuZGxlcnMgPSBoYW5kbGVycztcbiAgICAgIGN1cnJlbnRTdGF0ZS5yZWdleCA9IG5ldyBSZWdFeHAocmVnZXggKyBcIiRcIik7XG4gICAgICBjdXJyZW50U3RhdGUuc3BlY2lmaWNpdHkgPSBzcGVjaWZpY2l0eTtcblxuICAgICAgaWYgKG5hbWUgPSBvcHRpb25zICYmIG9wdGlvbnMuYXMpIHtcbiAgICAgICAgdGhpcy5uYW1lc1tuYW1lXSA9IHtcbiAgICAgICAgICBzZWdtZW50czogYWxsU2VnbWVudHMsXG4gICAgICAgICAgaGFuZGxlcnM6IGhhbmRsZXJzXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSxcblxuICAgIGhhbmRsZXJzRm9yOiBmdW5jdGlvbiBoYW5kbGVyc0ZvcihuYW1lKSB7XG4gICAgICB2YXIgcm91dGUgPSB0aGlzLm5hbWVzW25hbWVdLFxuICAgICAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgaWYgKCFyb3V0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBpcyBubyByb3V0ZSBuYW1lZCBcIiArIG5hbWUpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHJvdXRlLmhhbmRsZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICByZXN1bHQucHVzaChyb3V0ZS5oYW5kbGVyc1tpXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGhhc1JvdXRlOiBmdW5jdGlvbiBoYXNSb3V0ZShuYW1lKSB7XG4gICAgICByZXR1cm4gISF0aGlzLm5hbWVzW25hbWVdO1xuICAgIH0sXG5cbiAgICBnZW5lcmF0ZTogZnVuY3Rpb24gZ2VuZXJhdGUobmFtZSwgcGFyYW1zKSB7XG4gICAgICB2YXIgcm91dGUgPSB0aGlzLm5hbWVzW25hbWVdLFxuICAgICAgICAgIG91dHB1dCA9IFwiXCI7XG4gICAgICBpZiAoIXJvdXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZXJlIGlzIG5vIHJvdXRlIG5hbWVkIFwiICsgbmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWdtZW50cyA9IHJvdXRlLnNlZ21lbnRzO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHNlZ21lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgc2VnbWVudCA9IHNlZ21lbnRzW2ldO1xuXG4gICAgICAgIGlmIChzZWdtZW50IGluc3RhbmNlb2YgRXBzaWxvblNlZ21lbnQpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIG91dHB1dCArPSBcIi9cIjtcbiAgICAgICAgb3V0cHV0ICs9IHNlZ21lbnQuZ2VuZXJhdGUocGFyYW1zKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG91dHB1dC5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgICBvdXRwdXQgPSAnLycgKyBvdXRwdXQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMgJiYgcGFyYW1zLnF1ZXJ5UGFyYW1zKSB7XG4gICAgICAgIG91dHB1dCArPSB0aGlzLmdlbmVyYXRlUXVlcnlTdHJpbmcocGFyYW1zLnF1ZXJ5UGFyYW1zKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9LFxuXG4gICAgZ2VuZXJhdGVRdWVyeVN0cmluZzogZnVuY3Rpb24gZ2VuZXJhdGVRdWVyeVN0cmluZyhwYXJhbXMpIHtcbiAgICAgIHZhciBwYWlycyA9IFtdO1xuICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgIGZvciAodmFyIGtleSBpbiBwYXJhbXMpIHtcbiAgICAgICAgaWYgKHBhcmFtcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGtleXMuc29ydCgpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGtleXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgdmFyIHZhbHVlID0gcGFyYW1zW2tleV07XG4gICAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhaXIgPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KTtcbiAgICAgICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGogPCBsOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBhcnJheVBhaXIgPSBrZXkgKyAnW10nICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlW2pdKTtcbiAgICAgICAgICAgIHBhaXJzLnB1c2goYXJyYXlQYWlyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFpciArPSBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG4gICAgICAgICAgcGFpcnMucHVzaChwYWlyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocGFpcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFwiP1wiICsgcGFpcnMuam9pbihcIiZcIik7XG4gICAgfSxcblxuICAgIHBhcnNlUXVlcnlTdHJpbmc6IGZ1bmN0aW9uIHBhcnNlUXVlcnlTdHJpbmcocXVlcnlTdHJpbmcpIHtcbiAgICAgIHZhciBwYWlycyA9IHF1ZXJ5U3RyaW5nLnNwbGl0KFwiJlwiKSxcbiAgICAgICAgICBxdWVyeVBhcmFtcyA9IHt9O1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcGFpciA9IHBhaXJzW2ldLnNwbGl0KCc9JyksXG4gICAgICAgICAgICBrZXkgPSBkZWNvZGVRdWVyeVBhcmFtUGFydChwYWlyWzBdKSxcbiAgICAgICAgICAgIGtleUxlbmd0aCA9IGtleS5sZW5ndGgsXG4gICAgICAgICAgICBpc0FycmF5ID0gZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZTtcbiAgICAgICAgaWYgKHBhaXIubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgdmFsdWUgPSAndHJ1ZSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy9IYW5kbGUgYXJyYXlzXG4gICAgICAgICAgaWYgKGtleUxlbmd0aCA+IDIgJiYga2V5LnNsaWNlKGtleUxlbmd0aCAtIDIpID09PSAnW10nKSB7XG4gICAgICAgICAgICBpc0FycmF5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGtleSA9IGtleS5zbGljZSgwLCBrZXlMZW5ndGggLSAyKTtcbiAgICAgICAgICAgIGlmICghcXVlcnlQYXJhbXNba2V5XSkge1xuICAgICAgICAgICAgICBxdWVyeVBhcmFtc1trZXldID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gcGFpclsxXSA/IGRlY29kZVF1ZXJ5UGFyYW1QYXJ0KHBhaXJbMV0pIDogJyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXJyYXkpIHtcbiAgICAgICAgICBxdWVyeVBhcmFtc1trZXldLnB1c2godmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHF1ZXJ5UGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHF1ZXJ5UGFyYW1zO1xuICAgIH0sXG5cbiAgICByZWNvZ25pemU6IGZ1bmN0aW9uIHJlY29nbml6ZShwYXRoLCBzaWxlbnQpIHtcbiAgICAgIG5vV2FybmluZyA9IHNpbGVudDtcbiAgICAgIHZhciBzdGF0ZXMgPSBbdGhpcy5yb290U3RhdGVdLFxuICAgICAgICAgIHBhdGhMZW4sXG4gICAgICAgICAgaSxcbiAgICAgICAgICBsLFxuICAgICAgICAgIHF1ZXJ5U3RhcnQsXG4gICAgICAgICAgcXVlcnlQYXJhbXMgPSB7fSxcbiAgICAgICAgICBpc1NsYXNoRHJvcHBlZCA9IGZhbHNlO1xuXG4gICAgICBxdWVyeVN0YXJ0ID0gcGF0aC5pbmRleE9mKCc/Jyk7XG4gICAgICBpZiAocXVlcnlTdGFydCAhPT0gLTEpIHtcbiAgICAgICAgdmFyIHF1ZXJ5U3RyaW5nID0gcGF0aC5zdWJzdHIocXVlcnlTdGFydCArIDEsIHBhdGgubGVuZ3RoKTtcbiAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyKDAsIHF1ZXJ5U3RhcnQpO1xuICAgICAgICBpZiAocXVlcnlTdHJpbmcpIHtcbiAgICAgICAgICBxdWVyeVBhcmFtcyA9IHRoaXMucGFyc2VRdWVyeVN0cmluZyhxdWVyeVN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcGF0aCA9IHRyeURlY29kZShwYXRoKTtcbiAgICAgIGlmICghcGF0aCkgcmV0dXJuO1xuXG4gICAgICAvLyBERUJVRyBHUk9VUCBwYXRoXG5cbiAgICAgIGlmIChwYXRoLmNoYXJBdCgwKSAhPT0gXCIvXCIpIHtcbiAgICAgICAgcGF0aCA9IFwiL1wiICsgcGF0aDtcbiAgICAgIH1cblxuICAgICAgcGF0aExlbiA9IHBhdGgubGVuZ3RoO1xuICAgICAgaWYgKHBhdGhMZW4gPiAxICYmIHBhdGguY2hhckF0KHBhdGhMZW4gLSAxKSA9PT0gXCIvXCIpIHtcbiAgICAgICAgcGF0aCA9IHBhdGguc3Vic3RyKDAsIHBhdGhMZW4gLSAxKTtcbiAgICAgICAgaXNTbGFzaERyb3BwZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwLCBsID0gcGF0aC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgc3RhdGVzID0gcmVjb2duaXplQ2hhcihzdGF0ZXMsIHBhdGguY2hhckF0KGkpKTtcbiAgICAgICAgaWYgKCFzdGF0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRU5EIERFQlVHIEdST1VQXG5cbiAgICAgIHZhciBzb2x1dGlvbnMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBzdGF0ZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChzdGF0ZXNbaV0uaGFuZGxlcnMpIHtcbiAgICAgICAgICBzb2x1dGlvbnMucHVzaChzdGF0ZXNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN0YXRlcyA9IHNvcnRTb2x1dGlvbnMoc29sdXRpb25zKTtcblxuICAgICAgdmFyIHN0YXRlID0gc29sdXRpb25zWzBdO1xuXG4gICAgICBpZiAoc3RhdGUgJiYgc3RhdGUuaGFuZGxlcnMpIHtcbiAgICAgICAgLy8gaWYgYSB0cmFpbGluZyBzbGFzaCB3YXMgZHJvcHBlZCBhbmQgYSBzdGFyIHNlZ21lbnQgaXMgdGhlIGxhc3Qgc2VnbWVudFxuICAgICAgICAvLyBzcGVjaWZpZWQsIHB1dCB0aGUgdHJhaWxpbmcgc2xhc2ggYmFja1xuICAgICAgICBpZiAoaXNTbGFzaERyb3BwZWQgJiYgc3RhdGUucmVnZXguc291cmNlLnNsaWNlKC01KSA9PT0gXCIoLispJFwiKSB7XG4gICAgICAgICAgcGF0aCA9IHBhdGggKyBcIi9cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmluZEhhbmRsZXIoc3RhdGUsIHBhdGgsIHF1ZXJ5UGFyYW1zKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgUm91dGVSZWNvZ25pemVyLnByb3RvdHlwZS5tYXAgPSBtYXA7XG5cbiAgdmFyIGdlblF1ZXJ5ID0gUm91dGVSZWNvZ25pemVyLnByb3RvdHlwZS5nZW5lcmF0ZVF1ZXJ5U3RyaW5nO1xuXG4gIC8vIGV4cG9ydCBkZWZhdWx0IGZvciBob2xkaW5nIHRoZSBWdWUgcmVmZXJlbmNlXG4gIHZhciBleHBvcnRzJDEgPSB7fTtcbiAgLyoqXG4gICAqIFdhcm4gc3R1ZmYuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtc2dcbiAgICovXG5cbiAgZnVuY3Rpb24gd2FybiQxKG1zZykge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc29sZS5lcnJvcignW3Z1ZS1yb3V0ZXJdICcgKyBtc2cpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIGEgcmVsYXRpdmUgcGF0aC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGJhc2VcbiAgICogQHBhcmFtIHtTdHJpbmd9IHJlbGF0aXZlXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXBwZW5kXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZnVuY3Rpb24gcmVzb2x2ZVBhdGgoYmFzZSwgcmVsYXRpdmUsIGFwcGVuZCkge1xuICAgIHZhciBxdWVyeSA9IGJhc2UubWF0Y2goLyhcXD8uKikkLyk7XG4gICAgaWYgKHF1ZXJ5KSB7XG4gICAgICBxdWVyeSA9IHF1ZXJ5WzFdO1xuICAgICAgYmFzZSA9IGJhc2Uuc2xpY2UoMCwgLXF1ZXJ5Lmxlbmd0aCk7XG4gICAgfVxuICAgIC8vIGEgcXVlcnkhXG4gICAgaWYgKHJlbGF0aXZlLmNoYXJBdCgwKSA9PT0gJz8nKSB7XG4gICAgICByZXR1cm4gYmFzZSArIHJlbGF0aXZlO1xuICAgIH1cbiAgICB2YXIgc3RhY2sgPSBiYXNlLnNwbGl0KCcvJyk7XG4gICAgLy8gcmVtb3ZlIHRyYWlsaW5nIHNlZ21lbnQgaWY6XG4gICAgLy8gLSBub3QgYXBwZW5kaW5nXG4gICAgLy8gLSBhcHBlbmRpbmcgdG8gdHJhaWxpbmcgc2xhc2ggKGxhc3Qgc2VnbWVudCBpcyBlbXB0eSlcbiAgICBpZiAoIWFwcGVuZCB8fCAhc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgIHN0YWNrLnBvcCgpO1xuICAgIH1cbiAgICAvLyByZXNvbHZlIHJlbGF0aXZlIHBhdGhcbiAgICB2YXIgc2VnbWVudHMgPSByZWxhdGl2ZS5yZXBsYWNlKC9eXFwvLywgJycpLnNwbGl0KCcvJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWdtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNlZ21lbnQgPSBzZWdtZW50c1tpXTtcbiAgICAgIGlmIChzZWdtZW50ID09PSAnLicpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKHNlZ21lbnQgPT09ICcuLicpIHtcbiAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGFjay5wdXNoKHNlZ21lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBlbnN1cmUgbGVhZGluZyBzbGFzaFxuICAgIGlmIChzdGFja1swXSAhPT0gJycpIHtcbiAgICAgIHN0YWNrLnVuc2hpZnQoJycpO1xuICAgIH1cbiAgICByZXR1cm4gc3RhY2suam9pbignLycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmdpdmluZyBjaGVjayBmb3IgYSBwcm9taXNlXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGlzUHJvbWlzZShwKSB7XG4gICAgcmV0dXJuIHAgJiYgdHlwZW9mIHAudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaXZlIGEgcm91dGUgY29uZmlnIGZpZWxkIGZyb20gYSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICogT1IgYSBjb21wb25lbnQgY29udHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbnxWdWV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHsqfVxuICAgKi9cblxuICBmdW5jdGlvbiBnZXRSb3V0ZUNvbmZpZyhjb21wb25lbnQsIG5hbWUpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGNvbXBvbmVudCAmJiAoY29tcG9uZW50LiRvcHRpb25zIHx8IGNvbXBvbmVudC5vcHRpb25zKTtcbiAgICByZXR1cm4gb3B0aW9ucyAmJiBvcHRpb25zLnJvdXRlICYmIG9wdGlvbnMucm91dGVbbmFtZV07XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZSBhbiBhc3luYyBjb21wb25lbnQgZmFjdG9yeS4gSGF2ZSB0byBkbyBhIGRpcnR5XG4gICAqIG1vY2sgaGVyZSBiZWNhdXNlIG9mIFZ1ZSBjb3JlJ3MgaW50ZXJuYWwgQVBJIGRlcGVuZHMgb25cbiAgICogYW4gSUQgY2hlY2suXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBoYW5kbGVyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gICAqL1xuXG4gIHZhciByZXNvbHZlciA9IHVuZGVmaW5lZDtcblxuICBmdW5jdGlvbiByZXNvbHZlQXN5bmNDb21wb25lbnQoaGFuZGxlciwgY2IpIHtcbiAgICBpZiAoIXJlc29sdmVyKSB7XG4gICAgICByZXNvbHZlciA9IHtcbiAgICAgICAgcmVzb2x2ZTogZXhwb3J0cyQxLlZ1ZS5wcm90b3R5cGUuX3Jlc29sdmVDb21wb25lbnQsXG4gICAgICAgICRvcHRpb25zOiB7XG4gICAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgICAgXzogaGFuZGxlci5jb21wb25lbnRcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmVyLiRvcHRpb25zLmNvbXBvbmVudHMuXyA9IGhhbmRsZXIuY29tcG9uZW50O1xuICAgIH1cbiAgICByZXNvbHZlci5yZXNvbHZlKCdfJywgZnVuY3Rpb24gKENvbXBvbmVudCkge1xuICAgICAgaGFuZGxlci5jb21wb25lbnQgPSBDb21wb25lbnQ7XG4gICAgICBjYihDb21wb25lbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcCB0aGUgZHluYW1pYyBzZWdtZW50cyBpbiBhIHBhdGggdG8gcGFyYW1zLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBxdWVyeVxuICAgKi9cblxuICBmdW5jdGlvbiBtYXBQYXJhbXMocGF0aCwgcGFyYW1zLCBxdWVyeSkge1xuICAgIGlmIChwYXJhbXMgPT09IHVuZGVmaW5lZCkgcGFyYW1zID0ge307XG5cbiAgICBwYXRoID0gcGF0aC5yZXBsYWNlKC86KFteXFwvXSspL2csIGZ1bmN0aW9uIChfLCBrZXkpIHtcbiAgICAgIHZhciB2YWwgPSBwYXJhbXNba2V5XTtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKCF2YWwpIHtcbiAgICAgICAgd2FybiQxKCdwYXJhbSBcIicgKyBrZXkgKyAnXCIgbm90IGZvdW5kIHdoZW4gZ2VuZXJhdGluZyAnICsgJ3BhdGggZm9yIFwiJyArIHBhdGggKyAnXCIgd2l0aCBwYXJhbXMgJyArIEpTT04uc3RyaW5naWZ5KHBhcmFtcykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbCB8fCAnJztcbiAgICB9KTtcbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIHBhdGggKz0gZ2VuUXVlcnkocXVlcnkpO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aDtcbiAgfVxuXG4gIHZhciBoYXNoUkUgPSAvIy4qJC87XG5cbiAgdmFyIEhUTUw1SGlzdG9yeSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSFRNTDVIaXN0b3J5KF9yZWYpIHtcbiAgICAgIHZhciByb290ID0gX3JlZi5yb290O1xuICAgICAgdmFyIG9uQ2hhbmdlID0gX3JlZi5vbkNoYW5nZTtcbiAgICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBIVE1MNUhpc3RvcnkpO1xuXG4gICAgICBpZiAocm9vdCAmJiByb290ICE9PSAnLycpIHtcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoZXJlJ3MgdGhlIHN0YXJ0aW5nIHNsYXNoXG4gICAgICAgIGlmIChyb290LmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICAgICAgcm9vdCA9ICcvJyArIHJvb3Q7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVtb3ZlIHRyYWlsaW5nIHNsYXNoXG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3QucmVwbGFjZSgvXFwvJC8sICcnKTtcbiAgICAgICAgdGhpcy5yb290UkUgPSBuZXcgUmVnRXhwKCdeXFxcXCcgKyB0aGlzLnJvb3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMub25DaGFuZ2UgPSBvbkNoYW5nZTtcbiAgICAgIC8vIGNoZWNrIGJhc2UgdGFnXG4gICAgICB2YXIgYmFzZUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYmFzZScpO1xuICAgICAgdGhpcy5iYXNlID0gYmFzZUVsICYmIGJhc2VFbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICB9XG5cbiAgICBIVE1MNUhpc3RvcnkucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB0aGlzLmxpc3RlbmVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIHVybCA9IGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uc2VhcmNoO1xuICAgICAgICBpZiAoX3RoaXMucm9vdCkge1xuICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKF90aGlzLnJvb3RSRSwgJycpO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLm9uQ2hhbmdlKHVybCwgZSAmJiBlLnN0YXRlLCBsb2NhdGlvbi5oYXNoKTtcbiAgICAgIH07XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCB0aGlzLmxpc3RlbmVyKTtcbiAgICAgIHRoaXMubGlzdGVuZXIoKTtcbiAgICB9O1xuXG4gICAgSFRNTDVIaXN0b3J5LnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHRoaXMubGlzdGVuZXIpO1xuICAgIH07XG5cbiAgICBIVE1MNUhpc3RvcnkucHJvdG90eXBlLmdvID0gZnVuY3Rpb24gZ28ocGF0aCwgcmVwbGFjZSwgYXBwZW5kKSB7XG4gICAgICB2YXIgdXJsID0gdGhpcy5mb3JtYXRQYXRoKHBhdGgsIGFwcGVuZCk7XG4gICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgJycsIHVybCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZWNvcmQgc2Nyb2xsIHBvc2l0aW9uIGJ5IHJlcGxhY2luZyBjdXJyZW50IHN0YXRlXG4gICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHtcbiAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgIHg6IHdpbmRvdy5wYWdlWE9mZnNldCxcbiAgICAgICAgICAgIHk6IHdpbmRvdy5wYWdlWU9mZnNldFxuICAgICAgICAgIH1cbiAgICAgICAgfSwgJycsIGxvY2F0aW9uLmhyZWYpO1xuICAgICAgICAvLyB0aGVuIHB1c2ggbmV3IHN0YXRlXG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCAnJywgdXJsKTtcbiAgICAgIH1cbiAgICAgIHZhciBoYXNoTWF0Y2ggPSBwYXRoLm1hdGNoKGhhc2hSRSk7XG4gICAgICB2YXIgaGFzaCA9IGhhc2hNYXRjaCAmJiBoYXNoTWF0Y2hbMF07XG4gICAgICBwYXRoID0gdXJsXG4gICAgICAvLyBzdHJpcCBoYXNoIHNvIGl0IGRvZXNuJ3QgbWVzcyB1cCBwYXJhbXNcbiAgICAgIC5yZXBsYWNlKGhhc2hSRSwgJycpXG4gICAgICAvLyByZW1vdmUgcm9vdCBiZWZvcmUgbWF0Y2hpbmdcbiAgICAgIC5yZXBsYWNlKHRoaXMucm9vdFJFLCAnJyk7XG4gICAgICB0aGlzLm9uQ2hhbmdlKHBhdGgsIG51bGwsIGhhc2gpO1xuICAgIH07XG5cbiAgICBIVE1MNUhpc3RvcnkucHJvdG90eXBlLmZvcm1hdFBhdGggPSBmdW5jdGlvbiBmb3JtYXRQYXRoKHBhdGgsIGFwcGVuZCkge1xuICAgICAgcmV0dXJuIHBhdGguY2hhckF0KDApID09PSAnLydcbiAgICAgIC8vIGFic29sdXRlIHBhdGhcbiAgICAgID8gdGhpcy5yb290ID8gdGhpcy5yb290ICsgJy8nICsgcGF0aC5yZXBsYWNlKC9eXFwvLywgJycpIDogcGF0aCA6IHJlc29sdmVQYXRoKHRoaXMuYmFzZSB8fCBsb2NhdGlvbi5wYXRobmFtZSwgcGF0aCwgYXBwZW5kKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEhUTUw1SGlzdG9yeTtcbiAgfSkoKTtcblxuICB2YXIgSGFzaEhpc3RvcnkgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEhhc2hIaXN0b3J5KF9yZWYpIHtcbiAgICAgIHZhciBoYXNoYmFuZyA9IF9yZWYuaGFzaGJhbmc7XG4gICAgICB2YXIgb25DaGFuZ2UgPSBfcmVmLm9uQ2hhbmdlO1xuICAgICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIEhhc2hIaXN0b3J5KTtcblxuICAgICAgdGhpcy5oYXNoYmFuZyA9IGhhc2hiYW5nO1xuICAgICAgdGhpcy5vbkNoYW5nZSA9IG9uQ2hhbmdlO1xuICAgIH1cblxuICAgIEhhc2hIaXN0b3J5LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5saXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHBhdGggPSBsb2NhdGlvbi5oYXNoO1xuICAgICAgICB2YXIgcmF3ID0gcGF0aC5yZXBsYWNlKC9eIyE/LywgJycpO1xuICAgICAgICAvLyBhbHdheXNcbiAgICAgICAgaWYgKHJhdy5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgICAgIHJhdyA9ICcvJyArIHJhdztcbiAgICAgICAgfVxuICAgICAgICB2YXIgZm9ybWF0dGVkUGF0aCA9IHNlbGYuZm9ybWF0UGF0aChyYXcpO1xuICAgICAgICBpZiAoZm9ybWF0dGVkUGF0aCAhPT0gcGF0aCkge1xuICAgICAgICAgIGxvY2F0aW9uLnJlcGxhY2UoZm9ybWF0dGVkUGF0aCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRldGVybWluZSBxdWVyeVxuICAgICAgICAvLyBub3RlIGl0J3MgcG9zc2libGUgdG8gaGF2ZSBxdWVyaWVzIGluIGJvdGggdGhlIGFjdHVhbCBVUkxcbiAgICAgICAgLy8gYW5kIHRoZSBoYXNoIGZyYWdtZW50IGl0c2VsZi5cbiAgICAgICAgdmFyIHF1ZXJ5ID0gbG9jYXRpb24uc2VhcmNoICYmIHBhdGguaW5kZXhPZignPycpID4gLTEgPyAnJicgKyBsb2NhdGlvbi5zZWFyY2guc2xpY2UoMSkgOiBsb2NhdGlvbi5zZWFyY2g7XG4gICAgICAgIHNlbGYub25DaGFuZ2UocGF0aC5yZXBsYWNlKC9eIyE/LywgJycpICsgcXVlcnkpO1xuICAgICAgfTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgdGhpcy5saXN0ZW5lcik7XG4gICAgICB0aGlzLmxpc3RlbmVyKCk7XG4gICAgfTtcblxuICAgIEhhc2hIaXN0b3J5LnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgdGhpcy5saXN0ZW5lcik7XG4gICAgfTtcblxuICAgIEhhc2hIaXN0b3J5LnByb3RvdHlwZS5nbyA9IGZ1bmN0aW9uIGdvKHBhdGgsIHJlcGxhY2UsIGFwcGVuZCkge1xuICAgICAgcGF0aCA9IHRoaXMuZm9ybWF0UGF0aChwYXRoLCBhcHBlbmQpO1xuICAgICAgaWYgKHJlcGxhY2UpIHtcbiAgICAgICAgbG9jYXRpb24ucmVwbGFjZShwYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY2F0aW9uLmhhc2ggPSBwYXRoO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBIYXNoSGlzdG9yeS5wcm90b3R5cGUuZm9ybWF0UGF0aCA9IGZ1bmN0aW9uIGZvcm1hdFBhdGgocGF0aCwgYXBwZW5kKSB7XG4gICAgICB2YXIgaXNBYnNvbG91dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xuICAgICAgdmFyIHByZWZpeCA9ICcjJyArICh0aGlzLmhhc2hiYW5nID8gJyEnIDogJycpO1xuICAgICAgcmV0dXJuIGlzQWJzb2xvdXRlID8gcHJlZml4ICsgcGF0aCA6IHByZWZpeCArIHJlc29sdmVQYXRoKGxvY2F0aW9uLmhhc2gucmVwbGFjZSgvXiMhPy8sICcnKSwgcGF0aCwgYXBwZW5kKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEhhc2hIaXN0b3J5O1xuICB9KSgpO1xuXG4gIHZhciBBYnN0cmFjdEhpc3RvcnkgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFic3RyYWN0SGlzdG9yeShfcmVmKSB7XG4gICAgICB2YXIgb25DaGFuZ2UgPSBfcmVmLm9uQ2hhbmdlO1xuICAgICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIEFic3RyYWN0SGlzdG9yeSk7XG5cbiAgICAgIHRoaXMub25DaGFuZ2UgPSBvbkNoYW5nZTtcbiAgICAgIHRoaXMuY3VycmVudFBhdGggPSAnLyc7XG4gICAgfVxuXG4gICAgQWJzdHJhY3RIaXN0b3J5LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgdGhpcy5vbkNoYW5nZSgnLycpO1xuICAgIH07XG5cbiAgICBBYnN0cmFjdEhpc3RvcnkucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgLy8gbm9vcFxuICAgIH07XG5cbiAgICBBYnN0cmFjdEhpc3RvcnkucHJvdG90eXBlLmdvID0gZnVuY3Rpb24gZ28ocGF0aCwgcmVwbGFjZSwgYXBwZW5kKSB7XG4gICAgICBwYXRoID0gdGhpcy5jdXJyZW50UGF0aCA9IHRoaXMuZm9ybWF0UGF0aChwYXRoLCBhcHBlbmQpO1xuICAgICAgdGhpcy5vbkNoYW5nZShwYXRoKTtcbiAgICB9O1xuXG4gICAgQWJzdHJhY3RIaXN0b3J5LnByb3RvdHlwZS5mb3JtYXRQYXRoID0gZnVuY3Rpb24gZm9ybWF0UGF0aChwYXRoLCBhcHBlbmQpIHtcbiAgICAgIHJldHVybiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nID8gcGF0aCA6IHJlc29sdmVQYXRoKHRoaXMuY3VycmVudFBhdGgsIHBhdGgsIGFwcGVuZCk7XG4gICAgfTtcblxuICAgIHJldHVybiBBYnN0cmFjdEhpc3Rvcnk7XG4gIH0pKCk7XG5cbiAgLyoqXG4gICAqIERldGVybWluZSB0aGUgcmV1c2FiaWxpdHkgb2YgYW4gZXhpc3Rpbmcgcm91dGVyIHZpZXcuXG4gICAqXG4gICAqIEBwYXJhbSB7RGlyZWN0aXZlfSB2aWV3XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBoYW5kbGVyXG4gICAqIEBwYXJhbSB7VHJhbnNpdGlvbn0gdHJhbnNpdGlvblxuICAgKi9cblxuICBmdW5jdGlvbiBjYW5SZXVzZSh2aWV3LCBoYW5kbGVyLCB0cmFuc2l0aW9uKSB7XG4gICAgdmFyIGNvbXBvbmVudCA9IHZpZXcuY2hpbGRWTTtcbiAgICBpZiAoIWNvbXBvbmVudCB8fCAhaGFuZGxlcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBpbXBvcnRhbnQ6IGNoZWNrIHZpZXcuQ29tcG9uZW50IGhlcmUgYmVjYXVzZSBpdCBtYXlcbiAgICAvLyBoYXZlIGJlZW4gY2hhbmdlZCBpbiBhY3RpdmF0ZSBob29rXG4gICAgaWYgKHZpZXcuQ29tcG9uZW50ICE9PSBoYW5kbGVyLmNvbXBvbmVudCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgY2FuUmV1c2VGbiA9IGdldFJvdXRlQ29uZmlnKGNvbXBvbmVudCwgJ2NhblJldXNlJyk7XG4gICAgcmV0dXJuIHR5cGVvZiBjYW5SZXVzZUZuID09PSAnYm9vbGVhbicgPyBjYW5SZXVzZUZuIDogY2FuUmV1c2VGbiA/IGNhblJldXNlRm4uY2FsbChjb21wb25lbnQsIHtcbiAgICAgIHRvOiB0cmFuc2l0aW9uLnRvLFxuICAgICAgZnJvbTogdHJhbnNpdGlvbi5mcm9tXG4gICAgfSkgOiB0cnVlOyAvLyBkZWZhdWx0cyB0byB0cnVlXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSBjb21wb25lbnQgY2FuIGRlYWN0aXZhdGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RGlyZWN0aXZlfSB2aWV3XG4gICAqIEBwYXJhbSB7VHJhbnNpdGlvbn0gdHJhbnNpdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNhbkRlYWN0aXZhdGUodmlldywgdHJhbnNpdGlvbiwgbmV4dCkge1xuICAgIHZhciBmcm9tQ29tcG9uZW50ID0gdmlldy5jaGlsZFZNO1xuICAgIHZhciBob29rID0gZ2V0Um91dGVDb25maWcoZnJvbUNvbXBvbmVudCwgJ2NhbkRlYWN0aXZhdGUnKTtcbiAgICBpZiAoIWhvb2spIHtcbiAgICAgIG5leHQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJhbnNpdGlvbi5jYWxsSG9vayhob29rLCBmcm9tQ29tcG9uZW50LCBuZXh0LCB7XG4gICAgICAgIGV4cGVjdEJvb2xlYW46IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIGNvbXBvbmVudCBjYW4gYWN0aXZhdGUuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBoYW5kbGVyXG4gICAqIEBwYXJhbSB7VHJhbnNpdGlvbn0gdHJhbnNpdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNhbkFjdGl2YXRlKGhhbmRsZXIsIHRyYW5zaXRpb24sIG5leHQpIHtcbiAgICByZXNvbHZlQXN5bmNDb21wb25lbnQoaGFuZGxlciwgZnVuY3Rpb24gKENvbXBvbmVudCkge1xuICAgICAgLy8gaGF2ZSB0byBjaGVjayBkdWUgdG8gYXN5bmMtbmVzc1xuICAgICAgaWYgKHRyYW5zaXRpb24uYWJvcnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBkZXRlcm1pbmUgaWYgdGhpcyBjb21wb25lbnQgY2FuIGJlIGFjdGl2YXRlZFxuICAgICAgdmFyIGhvb2sgPSBnZXRSb3V0ZUNvbmZpZyhDb21wb25lbnQsICdjYW5BY3RpdmF0ZScpO1xuICAgICAgaWYgKCFob29rKSB7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyYW5zaXRpb24uY2FsbEhvb2soaG9vaywgbnVsbCwgbmV4dCwge1xuICAgICAgICAgIGV4cGVjdEJvb2xlYW46IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBkZWFjdGl2YXRlIGhvb2tzIGZvciBleGlzdGluZyByb3V0ZXItdmlld3MuXG4gICAqXG4gICAqIEBwYXJhbSB7RGlyZWN0aXZlfSB2aWV3XG4gICAqIEBwYXJhbSB7VHJhbnNpdGlvbn0gdHJhbnNpdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGRlYWN0aXZhdGUodmlldywgdHJhbnNpdGlvbiwgbmV4dCkge1xuICAgIHZhciBjb21wb25lbnQgPSB2aWV3LmNoaWxkVk07XG4gICAgdmFyIGhvb2sgPSBnZXRSb3V0ZUNvbmZpZyhjb21wb25lbnQsICdkZWFjdGl2YXRlJyk7XG4gICAgaWYgKCFob29rKSB7XG4gICAgICBuZXh0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyYW5zaXRpb24uY2FsbEhvb2tzKGhvb2ssIGNvbXBvbmVudCwgbmV4dCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlIC8gc3dpdGNoIGNvbXBvbmVudCBmb3IgYSByb3V0ZXItdmlldy5cbiAgICpcbiAgICogQHBhcmFtIHtEaXJlY3RpdmV9IHZpZXdcbiAgICogQHBhcmFtIHtUcmFuc2l0aW9ufSB0cmFuc2l0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZXB0aFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGFjdGl2YXRlKHZpZXcsIHRyYW5zaXRpb24sIGRlcHRoLCBjYiwgcmV1c2UpIHtcbiAgICB2YXIgaGFuZGxlciA9IHRyYW5zaXRpb24uYWN0aXZhdGVRdWV1ZVtkZXB0aF07XG4gICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICBzYXZlQ2hpbGRWaWV3KHZpZXcpO1xuICAgICAgaWYgKHZpZXcuX2JvdW5kKSB7XG4gICAgICAgIHZpZXcuc2V0Q29tcG9uZW50KG51bGwpO1xuICAgICAgfVxuICAgICAgY2IgJiYgY2IoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgQ29tcG9uZW50ID0gdmlldy5Db21wb25lbnQgPSBoYW5kbGVyLmNvbXBvbmVudDtcbiAgICB2YXIgYWN0aXZhdGVIb29rID0gZ2V0Um91dGVDb25maWcoQ29tcG9uZW50LCAnYWN0aXZhdGUnKTtcbiAgICB2YXIgZGF0YUhvb2sgPSBnZXRSb3V0ZUNvbmZpZyhDb21wb25lbnQsICdkYXRhJyk7XG4gICAgdmFyIHdhaXRGb3JEYXRhID0gZ2V0Um91dGVDb25maWcoQ29tcG9uZW50LCAnd2FpdEZvckRhdGEnKTtcblxuICAgIHZpZXcuZGVwdGggPSBkZXB0aDtcbiAgICB2aWV3LmFjdGl2YXRlZCA9IGZhbHNlO1xuXG4gICAgdmFyIGNvbXBvbmVudCA9IHVuZGVmaW5lZDtcbiAgICB2YXIgbG9hZGluZyA9ICEhKGRhdGFIb29rICYmICF3YWl0Rm9yRGF0YSk7XG5cbiAgICAvLyBcInJldXNlXCIgaXMgYSBmbGFnIHBhc3NlZCBkb3duIHdoZW4gdGhlIHBhcmVudCB2aWV3IGlzXG4gICAgLy8gZWl0aGVyIHJldXNlZCB2aWEga2VlcC1hbGl2ZSBvciBhcyBhIGNoaWxkIG9mIGEga2VwdC1hbGl2ZSB2aWV3LlxuICAgIC8vIG9mIGNvdXJzZSB3ZSBjYW4gb25seSByZXVzZSBpZiB0aGUgY3VycmVudCBrZXB0LWFsaXZlIGluc3RhbmNlXG4gICAgLy8gaXMgb2YgdGhlIGNvcnJlY3QgdHlwZS5cbiAgICByZXVzZSA9IHJldXNlICYmIHZpZXcuY2hpbGRWTSAmJiB2aWV3LmNoaWxkVk0uY29uc3RydWN0b3IgPT09IENvbXBvbmVudDtcblxuICAgIGlmIChyZXVzZSkge1xuICAgICAgLy8ganVzdCByZXVzZVxuICAgICAgY29tcG9uZW50ID0gdmlldy5jaGlsZFZNO1xuICAgICAgY29tcG9uZW50LiRsb2FkaW5nUm91dGVEYXRhID0gbG9hZGluZztcbiAgICB9IGVsc2Uge1xuICAgICAgc2F2ZUNoaWxkVmlldyh2aWV3KTtcblxuICAgICAgLy8gdW5idWlsZCBjdXJyZW50IGNvbXBvbmVudC4gdGhpcyBzdGVwIGFsc28gZGVzdHJveXNcbiAgICAgIC8vIGFuZCByZW1vdmVzIGFsbCBuZXN0ZWQgY2hpbGQgdmlld3MuXG4gICAgICB2aWV3LnVuYnVpbGQodHJ1ZSk7XG5cbiAgICAgIC8vIGJ1aWxkIHRoZSBuZXcgY29tcG9uZW50LiB0aGlzIHdpbGwgYWxzbyBjcmVhdGUgdGhlXG4gICAgICAvLyBkaXJlY3QgY2hpbGQgdmlldyBvZiB0aGUgY3VycmVudCBvbmUuIGl0IHdpbGwgcmVnaXN0ZXJcbiAgICAgIC8vIGl0c2VsZiBhcyB2aWV3LmNoaWxkVmlldy5cbiAgICAgIGNvbXBvbmVudCA9IHZpZXcuYnVpbGQoe1xuICAgICAgICBfbWV0YToge1xuICAgICAgICAgICRsb2FkaW5nUm91dGVEYXRhOiBsb2FkaW5nXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uIGNyZWF0ZWQoKSB7XG4gICAgICAgICAgdGhpcy5fcm91dGVyVmlldyA9IHZpZXc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBoYW5kbGUga2VlcC1hbGl2ZS5cbiAgICAgIC8vIHdoZW4gYSBrZXB0LWFsaXZlIGNoaWxkIHZtIGlzIHJlc3RvcmVkLCB3ZSBuZWVkIHRvXG4gICAgICAvLyBhZGQgaXRzIGNhY2hlZCBjaGlsZCB2aWV3cyBpbnRvIHRoZSByb3V0ZXIncyB2aWV3IGxpc3QsXG4gICAgICAvLyBhbmQgYWxzbyBwcm9wZXJseSB1cGRhdGUgY3VycmVudCB2aWV3J3MgY2hpbGQgdmlldy5cbiAgICAgIGlmICh2aWV3LmtlZXBBbGl2ZSkge1xuICAgICAgICBjb21wb25lbnQuJGxvYWRpbmdSb3V0ZURhdGEgPSBsb2FkaW5nO1xuICAgICAgICB2YXIgY2FjaGVkQ2hpbGRWaWV3ID0gY29tcG9uZW50Ll9rZWVwQWxpdmVSb3V0ZXJWaWV3O1xuICAgICAgICBpZiAoY2FjaGVkQ2hpbGRWaWV3KSB7XG4gICAgICAgICAgdmlldy5jaGlsZFZpZXcgPSBjYWNoZWRDaGlsZFZpZXc7XG4gICAgICAgICAgY29tcG9uZW50Ll9rZWVwQWxpdmVSb3V0ZXJWaWV3ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNsZWFudXAgdGhlIGNvbXBvbmVudCBpbiBjYXNlIHRoZSB0cmFuc2l0aW9uIGlzIGFib3J0ZWRcbiAgICAvLyBiZWZvcmUgdGhlIGNvbXBvbmVudCBpcyBldmVyIGluc2VydGVkLlxuICAgIHZhciBjbGVhbnVwID0gZnVuY3Rpb24gY2xlYW51cCgpIHtcbiAgICAgIGNvbXBvbmVudC4kZGVzdHJveSgpO1xuICAgIH07XG5cbiAgICAvLyBhY3R1YWxseSBpbnNlcnQgdGhlIGNvbXBvbmVudCBhbmQgdHJpZ2dlciB0cmFuc2l0aW9uXG4gICAgdmFyIGluc2VydCA9IGZ1bmN0aW9uIGluc2VydCgpIHtcbiAgICAgIGlmIChyZXVzZSkge1xuICAgICAgICBjYiAmJiBjYigpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgcm91dGVyID0gdHJhbnNpdGlvbi5yb3V0ZXI7XG4gICAgICBpZiAocm91dGVyLl9yZW5kZXJlZCB8fCByb3V0ZXIuX3RyYW5zaXRpb25PbkxvYWQpIHtcbiAgICAgICAgdmlldy50cmFuc2l0aW9uKGNvbXBvbmVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBubyB0cmFuc2l0aW9uIG9uIGZpcnN0IHJlbmRlciwgbWFudWFsIHRyYW5zaXRpb25cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmICh2aWV3LnNldEN1cnJlbnQpIHtcbiAgICAgICAgICAvLyAwLjEyIGNvbXBhdFxuICAgICAgICAgIHZpZXcuc2V0Q3VycmVudChjb21wb25lbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIDEuMFxuICAgICAgICAgIHZpZXcuY2hpbGRWTSA9IGNvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICBjb21wb25lbnQuJGJlZm9yZSh2aWV3LmFuY2hvciwgbnVsbCwgZmFsc2UpO1xuICAgICAgfVxuICAgICAgY2IgJiYgY2IoKTtcbiAgICB9O1xuXG4gICAgdmFyIGFmdGVyRGF0YSA9IGZ1bmN0aW9uIGFmdGVyRGF0YSgpIHtcbiAgICAgIC8vIGFjdGl2YXRlIHRoZSBjaGlsZCB2aWV3XG4gICAgICBpZiAodmlldy5jaGlsZFZpZXcpIHtcbiAgICAgICAgYWN0aXZhdGUodmlldy5jaGlsZFZpZXcsIHRyYW5zaXRpb24sIGRlcHRoICsgMSwgbnVsbCwgcmV1c2UgfHwgdmlldy5rZWVwQWxpdmUpO1xuICAgICAgfVxuICAgICAgaW5zZXJ0KCk7XG4gICAgfTtcblxuICAgIC8vIGNhbGxlZCBhZnRlciBhY3RpdmF0aW9uIGhvb2sgaXMgcmVzb2x2ZWRcbiAgICB2YXIgYWZ0ZXJBY3RpdmF0ZSA9IGZ1bmN0aW9uIGFmdGVyQWN0aXZhdGUoKSB7XG4gICAgICB2aWV3LmFjdGl2YXRlZCA9IHRydWU7XG4gICAgICBpZiAoZGF0YUhvb2sgJiYgd2FpdEZvckRhdGEpIHtcbiAgICAgICAgLy8gd2FpdCB1bnRpbCBkYXRhIGxvYWRlZCB0byBpbnNlcnRcbiAgICAgICAgbG9hZERhdGEoY29tcG9uZW50LCB0cmFuc2l0aW9uLCBkYXRhSG9vaywgYWZ0ZXJEYXRhLCBjbGVhbnVwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGxvYWQgZGF0YSBhbmQgaW5zZXJ0IGF0IHRoZSBzYW1lIHRpbWVcbiAgICAgICAgaWYgKGRhdGFIb29rKSB7XG4gICAgICAgICAgbG9hZERhdGEoY29tcG9uZW50LCB0cmFuc2l0aW9uLCBkYXRhSG9vayk7XG4gICAgICAgIH1cbiAgICAgICAgYWZ0ZXJEYXRhKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChhY3RpdmF0ZUhvb2spIHtcbiAgICAgIHRyYW5zaXRpb24uY2FsbEhvb2tzKGFjdGl2YXRlSG9vaywgY29tcG9uZW50LCBhZnRlckFjdGl2YXRlLCB7XG4gICAgICAgIGNsZWFudXA6IGNsZWFudXAsXG4gICAgICAgIHBvc3RBY3RpdmF0ZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFmdGVyQWN0aXZhdGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV1c2UgYSB2aWV3LCBqdXN0IHJlbG9hZCBkYXRhIGlmIG5lY2Vzc2FyeS5cbiAgICpcbiAgICogQHBhcmFtIHtEaXJlY3RpdmV9IHZpZXdcbiAgICogQHBhcmFtIHtUcmFuc2l0aW9ufSB0cmFuc2l0aW9uXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJldXNlKHZpZXcsIHRyYW5zaXRpb24pIHtcbiAgICB2YXIgY29tcG9uZW50ID0gdmlldy5jaGlsZFZNO1xuICAgIHZhciBkYXRhSG9vayA9IGdldFJvdXRlQ29uZmlnKGNvbXBvbmVudCwgJ2RhdGEnKTtcbiAgICBpZiAoZGF0YUhvb2spIHtcbiAgICAgIGxvYWREYXRhKGNvbXBvbmVudCwgdHJhbnNpdGlvbiwgZGF0YUhvb2spO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBc3luY2hyb25vdXNseSBsb2FkIGFuZCBhcHBseSBkYXRhIHRvIGNvbXBvbmVudC5cbiAgICpcbiAgICogQHBhcmFtIHtWdWV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge1RyYW5zaXRpb259IHRyYW5zaXRpb25cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaG9va1xuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbGVhbnVwXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGxvYWREYXRhKGNvbXBvbmVudCwgdHJhbnNpdGlvbiwgaG9vaywgY2IsIGNsZWFudXApIHtcbiAgICBjb21wb25lbnQuJGxvYWRpbmdSb3V0ZURhdGEgPSB0cnVlO1xuICAgIHRyYW5zaXRpb24uY2FsbEhvb2tzKGhvb2ssIGNvbXBvbmVudCwgZnVuY3Rpb24gKCkge1xuICAgICAgY29tcG9uZW50LiRsb2FkaW5nUm91dGVEYXRhID0gZmFsc2U7XG4gICAgICBjb21wb25lbnQuJGVtaXQoJ3JvdXRlLWRhdGEtbG9hZGVkJywgY29tcG9uZW50KTtcbiAgICAgIGNiICYmIGNiKCk7XG4gICAgfSwge1xuICAgICAgY2xlYW51cDogY2xlYW51cCxcbiAgICAgIHBvc3RBY3RpdmF0ZTogdHJ1ZSxcbiAgICAgIHByb2Nlc3NEYXRhOiBmdW5jdGlvbiBwcm9jZXNzRGF0YShkYXRhKSB7XG4gICAgICAgIC8vIGhhbmRsZSBwcm9taXNlIHN1Z2FyIHN5bnRheFxuICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgaWYgKGlzUGxhaW5PYmplY3QoZGF0YSkpIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSBkYXRhW2tleV07XG4gICAgICAgICAgICBpZiAoaXNQcm9taXNlKHZhbCkpIHtcbiAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh2YWwudGhlbihmdW5jdGlvbiAocmVzb2x2ZWRWYWwpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuJHNldChrZXksIHJlc29sdmVkVmFsKTtcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50LiRzZXQoa2V5LCB2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9taXNlcy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gcHJvbWlzZXNbMF0uY29uc3RydWN0b3IuYWxsKHByb21pc2VzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgdGhlIGNoaWxkIHZpZXcgZm9yIGEga2VwdC1hbGl2ZSB2aWV3IHNvIHRoYXRcbiAgICogd2UgY2FuIHJlc3RvcmUgaXQgd2hlbiBpdCBpcyBzd2l0Y2hlZCBiYWNrIHRvLlxuICAgKlxuICAgKiBAcGFyYW0ge0RpcmVjdGl2ZX0gdmlld1xuICAgKi9cblxuICBmdW5jdGlvbiBzYXZlQ2hpbGRWaWV3KHZpZXcpIHtcbiAgICBpZiAodmlldy5rZWVwQWxpdmUgJiYgdmlldy5jaGlsZFZNICYmIHZpZXcuY2hpbGRWaWV3KSB7XG4gICAgICB2aWV3LmNoaWxkVk0uX2tlZXBBbGl2ZVJvdXRlclZpZXcgPSB2aWV3LmNoaWxkVmlldztcbiAgICB9XG4gICAgdmlldy5jaGlsZFZpZXcgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHBsYWluIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHsqfSB2YWxcbiAgICovXG5cbiAgZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgUm91dGVUcmFuc2l0aW9uIG9iamVjdCBtYW5hZ2VzIHRoZSBwaXBlbGluZSBvZiBhXG4gICAqIHJvdXRlci12aWV3IHN3aXRjaGluZyBwcm9jZXNzLiBUaGlzIGlzIGFsc28gdGhlIG9iamVjdFxuICAgKiBwYXNzZWQgaW50byB1c2VyIHJvdXRlIGhvb2tzLlxuICAgKlxuICAgKiBAcGFyYW0ge1JvdXRlcn0gcm91dGVyXG4gICAqIEBwYXJhbSB7Um91dGV9IHRvXG4gICAqIEBwYXJhbSB7Um91dGV9IGZyb21cbiAgICovXG5cbiAgdmFyIFJvdXRlVHJhbnNpdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUm91dGVUcmFuc2l0aW9uKHJvdXRlciwgdG8sIGZyb20pIHtcbiAgICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBSb3V0ZVRyYW5zaXRpb24pO1xuXG4gICAgICB0aGlzLnJvdXRlciA9IHJvdXRlcjtcbiAgICAgIHRoaXMudG8gPSB0bztcbiAgICAgIHRoaXMuZnJvbSA9IGZyb207XG4gICAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgICAgdGhpcy5hYm9ydGVkID0gZmFsc2U7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBYm9ydCBjdXJyZW50IHRyYW5zaXRpb24gYW5kIHJldHVybiB0byBwcmV2aW91cyBsb2NhdGlvbi5cbiAgICAgKi9cblxuICAgIFJvdXRlVHJhbnNpdGlvbi5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbiBhYm9ydCgpIHtcbiAgICAgIGlmICghdGhpcy5hYm9ydGVkKSB7XG4gICAgICAgIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gICAgICAgIC8vIGlmIHRoZSByb290IHBhdGggdGhyb3dzIGFuIGVycm9yIGR1cmluZyB2YWxpZGF0aW9uXG4gICAgICAgIC8vIG9uIGluaXRpYWwgbG9hZCwgaXQgZ2V0cyBjYXVnaHQgaW4gYW4gaW5maW5pdGUgbG9vcC5cbiAgICAgICAgdmFyIGFib3J0aW5nT25Mb2FkID0gIXRoaXMuZnJvbS5wYXRoICYmIHRoaXMudG8ucGF0aCA9PT0gJy8nO1xuICAgICAgICBpZiAoIWFib3J0aW5nT25Mb2FkKSB7XG4gICAgICAgICAgdGhpcy5yb3V0ZXIucmVwbGFjZSh0aGlzLmZyb20ucGF0aCB8fCAnLycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFib3J0IGN1cnJlbnQgdHJhbnNpdGlvbiBhbmQgcmVkaXJlY3QgdG8gYSBuZXcgbG9jYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgICAqL1xuXG4gICAgUm91dGVUcmFuc2l0aW9uLnByb3RvdHlwZS5yZWRpcmVjdCA9IGZ1bmN0aW9uIHJlZGlyZWN0KHBhdGgpIHtcbiAgICAgIGlmICghdGhpcy5hYm9ydGVkKSB7XG4gICAgICAgIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gICAgICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBwYXRoID0gbWFwUGFyYW1zKHBhdGgsIHRoaXMudG8ucGFyYW1zLCB0aGlzLnRvLnF1ZXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXRoLnBhcmFtcyA9IHBhdGgucGFyYW1zIHx8IHRoaXMudG8ucGFyYW1zO1xuICAgICAgICAgIHBhdGgucXVlcnkgPSBwYXRoLnF1ZXJ5IHx8IHRoaXMudG8ucXVlcnk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yb3V0ZXIucmVwbGFjZShwYXRoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQSByb3V0ZXIgdmlldyB0cmFuc2l0aW9uJ3MgcGlwZWxpbmUgY2FuIGJlIGRlc2NyaWJlZCBhc1xuICAgICAqIGZvbGxvd3MsIGFzc3VtaW5nIHdlIGFyZSB0cmFuc2l0aW9uaW5nIGZyb20gYW4gZXhpc3RpbmdcbiAgICAgKiA8cm91dGVyLXZpZXc+IGNoYWluIFtDb21wb25lbnQgQSwgQ29tcG9uZW50IEJdIHRvIGEgbmV3XG4gICAgICogY2hhaW4gW0NvbXBvbmVudCBBLCBDb21wb25lbnQgQ106XG4gICAgICpcbiAgICAgKiAgQSAgICBBXG4gICAgICogIHwgPT4gfFxuICAgICAqICBCICAgIENcbiAgICAgKlxuICAgICAqIDEuIFJldXNhYmxpdHkgcGhhc2U6XG4gICAgICogICAtPiBjYW5SZXVzZShBLCBBKVxuICAgICAqICAgLT4gY2FuUmV1c2UoQiwgQylcbiAgICAgKiAgIC0+IGRldGVybWluZSBuZXcgcXVldWVzOlxuICAgICAqICAgICAgLSBkZWFjdGl2YXRpb246IFtCXVxuICAgICAqICAgICAgLSBhY3RpdmF0aW9uOiBbQ11cbiAgICAgKlxuICAgICAqIDIuIFZhbGlkYXRpb24gcGhhc2U6XG4gICAgICogICAtPiBjYW5EZWFjdGl2YXRlKEIpXG4gICAgICogICAtPiBjYW5BY3RpdmF0ZShDKVxuICAgICAqXG4gICAgICogMy4gQWN0aXZhdGlvbiBwaGFzZTpcbiAgICAgKiAgIC0+IGRlYWN0aXZhdGUoQilcbiAgICAgKiAgIC0+IGFjdGl2YXRlKEMpXG4gICAgICpcbiAgICAgKiBFYWNoIG9mIHRoZXNlIHN0ZXBzIGNhbiBiZSBhc3luY2hyb25vdXMsIGFuZCBhbnlcbiAgICAgKiBzdGVwIGNhbiBwb3RlbnRpYWxseSBhYm9ydCB0aGUgdHJhbnNpdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gICAgICovXG5cbiAgICBSb3V0ZVRyYW5zaXRpb24ucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gc3RhcnQoY2IpIHtcbiAgICAgIHZhciB0cmFuc2l0aW9uID0gdGhpcztcblxuICAgICAgLy8gZGV0ZXJtaW5lIHRoZSBxdWV1ZSBvZiB2aWV3cyB0byBkZWFjdGl2YXRlXG4gICAgICB2YXIgZGVhY3RpdmF0ZVF1ZXVlID0gW107XG4gICAgICB2YXIgdmlldyA9IHRoaXMucm91dGVyLl9yb290VmlldztcbiAgICAgIHdoaWxlICh2aWV3KSB7XG4gICAgICAgIGRlYWN0aXZhdGVRdWV1ZS51bnNoaWZ0KHZpZXcpO1xuICAgICAgICB2aWV3ID0gdmlldy5jaGlsZFZpZXc7XG4gICAgICB9XG4gICAgICB2YXIgcmV2ZXJzZURlYWN0aXZhdGVRdWV1ZSA9IGRlYWN0aXZhdGVRdWV1ZS5zbGljZSgpLnJldmVyc2UoKTtcblxuICAgICAgLy8gZGV0ZXJtaW5lIHRoZSBxdWV1ZSBvZiByb3V0ZSBoYW5kbGVycyB0byBhY3RpdmF0ZVxuICAgICAgdmFyIGFjdGl2YXRlUXVldWUgPSB0aGlzLmFjdGl2YXRlUXVldWUgPSB0b0FycmF5KHRoaXMudG8ubWF0Y2hlZCkubWFwKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICByZXR1cm4gbWF0Y2guaGFuZGxlcjtcbiAgICAgIH0pO1xuXG4gICAgICAvLyAxLiBSZXVzYWJpbGl0eSBwaGFzZVxuICAgICAgdmFyIGkgPSB1bmRlZmluZWQsXG4gICAgICAgICAgcmV1c2VRdWV1ZSA9IHVuZGVmaW5lZDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCByZXZlcnNlRGVhY3RpdmF0ZVF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghY2FuUmV1c2UocmV2ZXJzZURlYWN0aXZhdGVRdWV1ZVtpXSwgYWN0aXZhdGVRdWV1ZVtpXSwgdHJhbnNpdGlvbikpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgIHJldXNlUXVldWUgPSByZXZlcnNlRGVhY3RpdmF0ZVF1ZXVlLnNsaWNlKDAsIGkpO1xuICAgICAgICBkZWFjdGl2YXRlUXVldWUgPSByZXZlcnNlRGVhY3RpdmF0ZVF1ZXVlLnNsaWNlKGkpLnJldmVyc2UoKTtcbiAgICAgICAgYWN0aXZhdGVRdWV1ZSA9IGFjdGl2YXRlUXVldWUuc2xpY2UoaSk7XG4gICAgICB9XG5cbiAgICAgIC8vIDIuIFZhbGlkYXRpb24gcGhhc2VcbiAgICAgIHRyYW5zaXRpb24ucnVuUXVldWUoZGVhY3RpdmF0ZVF1ZXVlLCBjYW5EZWFjdGl2YXRlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyYW5zaXRpb24ucnVuUXVldWUoYWN0aXZhdGVRdWV1ZSwgY2FuQWN0aXZhdGUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0cmFuc2l0aW9uLnJ1blF1ZXVlKGRlYWN0aXZhdGVRdWV1ZSwgZGVhY3RpdmF0ZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gMy4gQWN0aXZhdGlvbiBwaGFzZVxuXG4gICAgICAgICAgICAvLyBVcGRhdGUgcm91dGVyIGN1cnJlbnQgcm91dGVcbiAgICAgICAgICAgIHRyYW5zaXRpb24ucm91dGVyLl9vblRyYW5zaXRpb25WYWxpZGF0ZWQodHJhbnNpdGlvbik7XG5cbiAgICAgICAgICAgIC8vIHRyaWdnZXIgcmV1c2UgZm9yIGFsbCByZXVzZWQgdmlld3NcbiAgICAgICAgICAgIHJldXNlUXVldWUgJiYgcmV1c2VRdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uICh2aWV3KSB7XG4gICAgICAgICAgICAgIHJldHVybiByZXVzZSh2aWV3LCB0cmFuc2l0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyB0aGUgcm9vdCBvZiB0aGUgY2hhaW4gdGhhdCBuZWVkcyB0byBiZSByZXBsYWNlZFxuICAgICAgICAgICAgLy8gaXMgdGhlIHRvcC1tb3N0IG5vbi1yZXVzYWJsZSB2aWV3LlxuICAgICAgICAgICAgaWYgKGRlYWN0aXZhdGVRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgdmFyIF92aWV3ID0gZGVhY3RpdmF0ZVF1ZXVlW2RlYWN0aXZhdGVRdWV1ZS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgdmFyIGRlcHRoID0gcmV1c2VRdWV1ZSA/IHJldXNlUXVldWUubGVuZ3RoIDogMDtcbiAgICAgICAgICAgICAgYWN0aXZhdGUoX3ZpZXcsIHRyYW5zaXRpb24sIGRlcHRoLCBjYik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBc3luY2hyb25vdXNseSBhbmQgc2VxdWVudGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gdG8gYVxuICAgICAqIHF1ZXVlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtBcnJheX0gcXVldWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gICAgICovXG5cbiAgICBSb3V0ZVRyYW5zaXRpb24ucHJvdG90eXBlLnJ1blF1ZXVlID0gZnVuY3Rpb24gcnVuUXVldWUocXVldWUsIGZuLCBjYikge1xuICAgICAgdmFyIHRyYW5zaXRpb24gPSB0aGlzO1xuICAgICAgc3RlcCgwKTtcbiAgICAgIGZ1bmN0aW9uIHN0ZXAoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4ID49IHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgIGNiKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm4ocXVldWVbaW5kZXhdLCB0cmFuc2l0aW9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzdGVwKGluZGV4ICsgMSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2FsbCBhIHVzZXIgcHJvdmlkZWQgcm91dGUgdHJhbnNpdGlvbiBob29rIGFuZCBoYW5kbGVcbiAgICAgKiB0aGUgcmVzcG9uc2UgKGUuZy4gaWYgdGhlIHVzZXIgcmV0dXJucyBhIHByb21pc2UpLlxuICAgICAqXG4gICAgICogSWYgdGhlIHVzZXIgbmVpdGhlciBleHBlY3RzIGFuIGFyZ3VtZW50IG5vciByZXR1cm5zIGFcbiAgICAgKiBwcm9taXNlLCB0aGUgaG9vayBpcyBhc3N1bWVkIHRvIGJlIHN5bmNocm9ub3VzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaG9va1xuICAgICAqIEBwYXJhbSB7Kn0gW2NvbnRleHRdXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICAgKiAgICAgICAgICAgICAgICAgLSB7Qm9vbGVhbn0gZXhwZWN0Qm9vbGVhblxuICAgICAqICAgICAgICAgICAgICAgICAtIHtCb29sZWFufSBwb3N0QWN0aXZlXG4gICAgICogICAgICAgICAgICAgICAgIC0ge0Z1bmN0aW9ufSBwcm9jZXNzRGF0YVxuICAgICAqICAgICAgICAgICAgICAgICAtIHtGdW5jdGlvbn0gY2xlYW51cFxuICAgICAqL1xuXG4gICAgUm91dGVUcmFuc2l0aW9uLnByb3RvdHlwZS5jYWxsSG9vayA9IGZ1bmN0aW9uIGNhbGxIb29rKGhvb2ssIGNvbnRleHQsIGNiKSB7XG4gICAgICB2YXIgX3JlZiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzNdO1xuXG4gICAgICB2YXIgX3JlZiRleHBlY3RCb29sZWFuID0gX3JlZi5leHBlY3RCb29sZWFuO1xuICAgICAgdmFyIGV4cGVjdEJvb2xlYW4gPSBfcmVmJGV4cGVjdEJvb2xlYW4gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX3JlZiRleHBlY3RCb29sZWFuO1xuICAgICAgdmFyIF9yZWYkcG9zdEFjdGl2YXRlID0gX3JlZi5wb3N0QWN0aXZhdGU7XG4gICAgICB2YXIgcG9zdEFjdGl2YXRlID0gX3JlZiRwb3N0QWN0aXZhdGUgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX3JlZiRwb3N0QWN0aXZhdGU7XG4gICAgICB2YXIgcHJvY2Vzc0RhdGEgPSBfcmVmLnByb2Nlc3NEYXRhO1xuICAgICAgdmFyIGNsZWFudXAgPSBfcmVmLmNsZWFudXA7XG5cbiAgICAgIHZhciB0cmFuc2l0aW9uID0gdGhpcztcbiAgICAgIHZhciBuZXh0Q2FsbGVkID0gZmFsc2U7XG5cbiAgICAgIC8vIGFib3J0IHRoZSB0cmFuc2l0aW9uXG4gICAgICB2YXIgYWJvcnQgPSBmdW5jdGlvbiBhYm9ydCgpIHtcbiAgICAgICAgY2xlYW51cCAmJiBjbGVhbnVwKCk7XG4gICAgICAgIHRyYW5zaXRpb24uYWJvcnQoKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIGhhbmRsZSBlcnJvcnNcbiAgICAgIHZhciBvbkVycm9yID0gZnVuY3Rpb24gb25FcnJvcihlcnIpIHtcbiAgICAgICAgcG9zdEFjdGl2YXRlID8gbmV4dCgpIDogYWJvcnQoKTtcbiAgICAgICAgaWYgKGVyciAmJiAhdHJhbnNpdGlvbi5yb3V0ZXIuX3N1cHByZXNzKSB7XG4gICAgICAgICAgd2FybiQxKCdVbmNhdWdodCBlcnJvciBkdXJpbmcgdHJhbnNpdGlvbjogJyk7XG4gICAgICAgICAgdGhyb3cgZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gc2luY2UgcHJvbWlzZSBzd2FsbG93cyBlcnJvcnMsIHdlIGhhdmUgdG9cbiAgICAgIC8vIHRocm93IGl0IGluIHRoZSBuZXh0IHRpY2suLi5cbiAgICAgIHZhciBvblByb21pc2VFcnJvciA9IGZ1bmN0aW9uIG9uUHJvbWlzZUVycm9yKGVycikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIG9uRXJyb3IoZXJyKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gYWR2YW5jZSB0aGUgdHJhbnNpdGlvbiB0byB0aGUgbmV4dCBzdGVwXG4gICAgICB2YXIgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgIGlmIChuZXh0Q2FsbGVkKSB7XG4gICAgICAgICAgd2FybiQxKCd0cmFuc2l0aW9uLm5leHQoKSBzaG91bGQgYmUgY2FsbGVkIG9ubHkgb25jZS4nKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbmV4dENhbGxlZCA9IHRydWU7XG4gICAgICAgIGlmICh0cmFuc2l0aW9uLmFib3J0ZWQpIHtcbiAgICAgICAgICBjbGVhbnVwICYmIGNsZWFudXAoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2IgJiYgY2IoKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBuZXh0V2l0aEJvb2xlYW4gPSBmdW5jdGlvbiBuZXh0V2l0aEJvb2xlYW4ocmVzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICByZXMgPyBuZXh0KCkgOiBhYm9ydCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUHJvbWlzZShyZXMpKSB7XG4gICAgICAgICAgcmVzLnRoZW4oZnVuY3Rpb24gKG9rKSB7XG4gICAgICAgICAgICBvayA/IG5leHQoKSA6IGFib3J0KCk7XG4gICAgICAgICAgfSwgb25Qcm9taXNlRXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKCFob29rLmxlbmd0aCkge1xuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdmFyIG5leHRXaXRoRGF0YSA9IGZ1bmN0aW9uIG5leHRXaXRoRGF0YShkYXRhKSB7XG4gICAgICAgIHZhciByZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzID0gcHJvY2Vzc0RhdGEoZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHJldHVybiBvbkVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUHJvbWlzZShyZXMpKSB7XG4gICAgICAgICAgcmVzLnRoZW4obmV4dCwgb25Qcm9taXNlRXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gZXhwb3NlIGEgY2xvbmUgb2YgdGhlIHRyYW5zaXRpb24gb2JqZWN0LCBzbyB0aGF0IGVhY2hcbiAgICAgIC8vIGhvb2sgZ2V0cyBhIGNsZWFuIGNvcHkgYW5kIHByZXZlbnQgdGhlIHVzZXIgZnJvbVxuICAgICAgLy8gbWVzc2luZyB3aXRoIHRoZSBpbnRlcm5hbHMuXG4gICAgICB2YXIgZXhwb3NlZCA9IHtcbiAgICAgICAgdG86IHRyYW5zaXRpb24udG8sXG4gICAgICAgIGZyb206IHRyYW5zaXRpb24uZnJvbSxcbiAgICAgICAgYWJvcnQ6IGFib3J0LFxuICAgICAgICBuZXh0OiBwcm9jZXNzRGF0YSA/IG5leHRXaXRoRGF0YSA6IG5leHQsXG4gICAgICAgIHJlZGlyZWN0OiBmdW5jdGlvbiByZWRpcmVjdCgpIHtcbiAgICAgICAgICB0cmFuc2l0aW9uLnJlZGlyZWN0LmFwcGx5KHRyYW5zaXRpb24sIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIGFjdHVhbGx5IGNhbGwgdGhlIGhvb2tcbiAgICAgIHZhciByZXMgPSB1bmRlZmluZWQ7XG4gICAgICB0cnkge1xuICAgICAgICByZXMgPSBob29rLmNhbGwoY29udGV4dCwgZXhwb3NlZCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIG9uRXJyb3IoZXJyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4cGVjdEJvb2xlYW4pIHtcbiAgICAgICAgLy8gYm9vbGVhbiBob29rc1xuICAgICAgICBuZXh0V2l0aEJvb2xlYW4ocmVzKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNQcm9taXNlKHJlcykpIHtcbiAgICAgICAgLy8gcHJvbWlzZVxuICAgICAgICBpZiAocHJvY2Vzc0RhdGEpIHtcbiAgICAgICAgICByZXMudGhlbihuZXh0V2l0aERhdGEsIG9uUHJvbWlzZUVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXMudGhlbihuZXh0LCBvblByb21pc2VFcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzc0RhdGEgJiYgaXNQbGFpbk9qYmVjdChyZXMpKSB7XG4gICAgICAgIC8vIGRhdGEgcHJvbWlzZSBzdWdhclxuICAgICAgICBuZXh0V2l0aERhdGEocmVzKTtcbiAgICAgIH0gZWxzZSBpZiAoIWhvb2subGVuZ3RoKSB7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2FsbCBhIHNpbmdsZSBob29rIG9yIGFuIGFycmF5IG9mIGFzeW5jIGhvb2tzIGluIHNlcmllcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGhvb2tzXG4gICAgICogQHBhcmFtIHsqfSBjb250ZXh0XG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAgICovXG5cbiAgICBSb3V0ZVRyYW5zaXRpb24ucHJvdG90eXBlLmNhbGxIb29rcyA9IGZ1bmN0aW9uIGNhbGxIb29rcyhob29rcywgY29udGV4dCwgY2IsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGhvb2tzKSkge1xuICAgICAgICB0aGlzLnJ1blF1ZXVlKGhvb2tzLCBmdW5jdGlvbiAoaG9vaywgXywgbmV4dCkge1xuICAgICAgICAgIGlmICghX3RoaXMuYWJvcnRlZCkge1xuICAgICAgICAgICAgX3RoaXMuY2FsbEhvb2soaG9vaywgY29udGV4dCwgbmV4dCwgb3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBjYik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNhbGxIb29rKGhvb2tzLCBjb250ZXh0LCBjYiwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBSb3V0ZVRyYW5zaXRpb247XG4gIH0pKCk7XG5cbiAgZnVuY3Rpb24gaXNQbGFpbk9qYmVjdCh2YWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xuICB9XG5cbiAgZnVuY3Rpb24gdG9BcnJheSh2YWwpIHtcbiAgICByZXR1cm4gdmFsID8gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodmFsKSA6IFtdO1xuICB9XG5cbiAgdmFyIGludGVybmFsS2V5c1JFID0gL14oY29tcG9uZW50fHN1YlJvdXRlc3xmdWxsUGF0aCkkLztcblxuICAvKipcbiAgICogUm91dGUgQ29udGV4dCBPYmplY3RcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtSb3V0ZXJ9IHJvdXRlclxuICAgKi9cblxuICB2YXIgUm91dGUgPSBmdW5jdGlvbiBSb3V0ZShwYXRoLCByb3V0ZXIpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIFJvdXRlKTtcblxuICAgIHZhciBtYXRjaGVkID0gcm91dGVyLl9yZWNvZ25pemVyLnJlY29nbml6ZShwYXRoKTtcbiAgICBpZiAobWF0Y2hlZCkge1xuICAgICAgLy8gY29weSBhbGwgY3VzdG9tIGZpZWxkcyBmcm9tIHJvdXRlIGNvbmZpZ3NcbiAgICAgIFtdLmZvckVhY2guY2FsbChtYXRjaGVkLCBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG1hdGNoLmhhbmRsZXIpIHtcbiAgICAgICAgICBpZiAoIWludGVybmFsS2V5c1JFLnRlc3Qoa2V5KSkge1xuICAgICAgICAgICAgX3RoaXNba2V5XSA9IG1hdGNoLmhhbmRsZXJba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gc2V0IHF1ZXJ5IGFuZCBwYXJhbXNcbiAgICAgIHRoaXMucXVlcnkgPSBtYXRjaGVkLnF1ZXJ5UGFyYW1zO1xuICAgICAgdGhpcy5wYXJhbXMgPSBbXS5yZWR1Y2UuY2FsbChtYXRjaGVkLCBmdW5jdGlvbiAocHJldiwgY3VyKSB7XG4gICAgICAgIGlmIChjdXIucGFyYW1zKSB7XG4gICAgICAgICAgZm9yICh2YXIga2V5IGluIGN1ci5wYXJhbXMpIHtcbiAgICAgICAgICAgIHByZXZba2V5XSA9IGN1ci5wYXJhbXNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgICB9LCB7fSk7XG4gICAgfVxuICAgIC8vIGV4cG9zZSBwYXRoIGFuZCByb3V0ZXJcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIC8vIGZvciBpbnRlcm5hbCB1c2VcbiAgICB0aGlzLm1hdGNoZWQgPSBtYXRjaGVkIHx8IHJvdXRlci5fbm90Rm91bmRIYW5kbGVyO1xuICAgIC8vIGludGVybmFsIHJlZmVyZW5jZSB0byByb3V0ZXJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3JvdXRlcicsIHtcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgdmFsdWU6IHJvdXRlclxuICAgIH0pO1xuICAgIC8vIEltcG9ydGFudDogZnJlZXplIHNlbGYgdG8gcHJldmVudCBvYnNlcnZhdGlvblxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH07XG5cbiAgZnVuY3Rpb24gYXBwbHlPdmVycmlkZSAoVnVlKSB7XG4gICAgdmFyIF9WdWUkdXRpbCA9IFZ1ZS51dGlsO1xuICAgIHZhciBleHRlbmQgPSBfVnVlJHV0aWwuZXh0ZW5kO1xuICAgIHZhciBpc0FycmF5ID0gX1Z1ZSR1dGlsLmlzQXJyYXk7XG4gICAgdmFyIGRlZmluZVJlYWN0aXZlID0gX1Z1ZSR1dGlsLmRlZmluZVJlYWN0aXZlO1xuXG4gICAgLy8gb3ZlcnJpZGUgVnVlJ3MgaW5pdCBhbmQgZGVzdHJveSBwcm9jZXNzIHRvIGtlZXAgdHJhY2sgb2Ygcm91dGVyIGluc3RhbmNlc1xuICAgIHZhciBpbml0ID0gVnVlLnByb3RvdHlwZS5faW5pdDtcbiAgICBWdWUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIHJvb3QgPSBvcHRpb25zLl9wYXJlbnQgfHwgb3B0aW9ucy5wYXJlbnQgfHwgdGhpcztcbiAgICAgIHZhciByb3V0ZXIgPSByb290LiRyb3V0ZXI7XG4gICAgICB2YXIgcm91dGUgPSByb290LiRyb3V0ZTtcbiAgICAgIGlmIChyb3V0ZXIpIHtcbiAgICAgICAgLy8gZXhwb3NlIHJvdXRlclxuICAgICAgICB0aGlzLiRyb3V0ZXIgPSByb3V0ZXI7XG4gICAgICAgIHJvdXRlci5fY2hpbGRyZW4ucHVzaCh0aGlzKTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmICh0aGlzLl9kZWZpbmVNZXRhKSB7XG4gICAgICAgICAgLy8gMC4xMlxuICAgICAgICAgIHRoaXMuX2RlZmluZU1ldGEoJyRyb3V0ZScsIHJvdXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyAxLjBcbiAgICAgICAgICBkZWZpbmVSZWFjdGl2ZSh0aGlzLCAnJHJvdXRlJywgcm91dGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpbml0LmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgfTtcblxuICAgIHZhciBkZXN0cm95ID0gVnVlLnByb3RvdHlwZS5fZGVzdHJveTtcbiAgICBWdWUucHJvdG90eXBlLl9kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0aGlzLl9pc0JlaW5nRGVzdHJveWVkICYmIHRoaXMuJHJvdXRlcikge1xuICAgICAgICB0aGlzLiRyb3V0ZXIuX2NoaWxkcmVuLiRyZW1vdmUodGhpcyk7XG4gICAgICB9XG4gICAgICBkZXN0cm95LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIC8vIDEuMCBvbmx5OiBlbmFibGUgcm91dGUgbWl4aW5zXG4gICAgdmFyIHN0cmF0cyA9IFZ1ZS5jb25maWcub3B0aW9uTWVyZ2VTdHJhdGVnaWVzO1xuICAgIHZhciBob29rc1RvTWVyZ2VSRSA9IC9eKGRhdGF8YWN0aXZhdGV8ZGVhY3RpdmF0ZSkkLztcblxuICAgIGlmIChzdHJhdHMpIHtcbiAgICAgIHN0cmF0cy5yb3V0ZSA9IGZ1bmN0aW9uIChwYXJlbnRWYWwsIGNoaWxkVmFsKSB7XG4gICAgICAgIGlmICghY2hpbGRWYWwpIHJldHVybiBwYXJlbnRWYWw7XG4gICAgICAgIGlmICghcGFyZW50VmFsKSByZXR1cm4gY2hpbGRWYWw7XG4gICAgICAgIHZhciByZXQgPSB7fTtcbiAgICAgICAgZXh0ZW5kKHJldCwgcGFyZW50VmFsKTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGNoaWxkVmFsKSB7XG4gICAgICAgICAgdmFyIGEgPSByZXRba2V5XTtcbiAgICAgICAgICB2YXIgYiA9IGNoaWxkVmFsW2tleV07XG4gICAgICAgICAgLy8gZm9yIGRhdGEsIGFjdGl2YXRlIGFuZCBkZWFjdGl2YXRlLCB3ZSBuZWVkIHRvIG1lcmdlIHRoZW0gaW50b1xuICAgICAgICAgIC8vIGFycmF5cyBzaW1pbGFyIHRvIGxpZmVjeWNsZSBob29rcy5cbiAgICAgICAgICBpZiAoYSAmJiBob29rc1RvTWVyZ2VSRS50ZXN0KGtleSkpIHtcbiAgICAgICAgICAgIHJldFtrZXldID0gKGlzQXJyYXkoYSkgPyBhIDogW2FdKS5jb25jYXQoYik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldFtrZXldID0gYjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gVmlldyAoVnVlKSB7XG5cbiAgICB2YXIgXyA9IFZ1ZS51dGlsO1xuICAgIHZhciBjb21wb25lbnREZWYgPVxuICAgIC8vIDAuMTJcbiAgICBWdWUuZGlyZWN0aXZlKCdfY29tcG9uZW50JykgfHxcbiAgICAvLyAxLjBcbiAgICBWdWUuaW50ZXJuYWxEaXJlY3RpdmVzLmNvbXBvbmVudDtcbiAgICAvLyA8cm91dGVyLXZpZXc+IGV4dGVuZHMgdGhlIGludGVybmFsIGNvbXBvbmVudCBkaXJlY3RpdmVcbiAgICB2YXIgdmlld0RlZiA9IF8uZXh0ZW5kKHt9LCBjb21wb25lbnREZWYpO1xuXG4gICAgLy8gd2l0aCBzb21lIG92ZXJyaWRlc1xuICAgIF8uZXh0ZW5kKHZpZXdEZWYsIHtcblxuICAgICAgX2lzUm91dGVyVmlldzogdHJ1ZSxcblxuICAgICAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAgICAgdmFyIHJvdXRlID0gdGhpcy52bS4kcm91dGU7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoIXJvdXRlKSB7XG4gICAgICAgICAgd2FybiQxKCc8cm91dGVyLXZpZXc+IGNhbiBvbmx5IGJlIHVzZWQgaW5zaWRlIGEgJyArICdyb3V0ZXItZW5hYmxlZCBhcHAuJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGZvcmNlIGR5bmFtaWMgZGlyZWN0aXZlIHNvIHYtY29tcG9uZW50IGRvZXNuJ3RcbiAgICAgICAgLy8gYXR0ZW1wdCB0byBidWlsZCByaWdodCBub3dcbiAgICAgICAgdGhpcy5faXNEeW5hbWljTGl0ZXJhbCA9IHRydWU7XG4gICAgICAgIC8vIGZpbmFsbHksIGluaXQgYnkgZGVsZWdhdGluZyB0byB2LWNvbXBvbmVudFxuICAgICAgICBjb21wb25lbnREZWYuYmluZC5jYWxsKHRoaXMpO1xuXG4gICAgICAgIC8vIGxvY2F0ZSB0aGUgcGFyZW50IHZpZXdcbiAgICAgICAgdmFyIHBhcmVudFZpZXcgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnZtO1xuICAgICAgICB3aGlsZSAocGFyZW50KSB7XG4gICAgICAgICAgaWYgKHBhcmVudC5fcm91dGVyVmlldykge1xuICAgICAgICAgICAgcGFyZW50VmlldyA9IHBhcmVudC5fcm91dGVyVmlldztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQuJHBhcmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyZW50Vmlldykge1xuICAgICAgICAgIC8vIHJlZ2lzdGVyIHNlbGYgYXMgYSBjaGlsZCBvZiB0aGUgcGFyZW50IHZpZXcsXG4gICAgICAgICAgLy8gaW5zdGVhZCBvZiBhY3RpdmF0aW5nIG5vdy4gVGhpcyBpcyBzbyB0aGF0IHRoZVxuICAgICAgICAgIC8vIGNoaWxkJ3MgYWN0aXZhdGUgaG9vayBpcyBjYWxsZWQgYWZ0ZXIgdGhlXG4gICAgICAgICAgLy8gcGFyZW50J3MgaGFzIHJlc29sdmVkLlxuICAgICAgICAgIHRoaXMucGFyZW50VmlldyA9IHBhcmVudFZpZXc7XG4gICAgICAgICAgcGFyZW50Vmlldy5jaGlsZFZpZXcgPSB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHRoaXMgaXMgdGhlIHJvb3QgdmlldyFcbiAgICAgICAgICB2YXIgcm91dGVyID0gcm91dGUucm91dGVyO1xuICAgICAgICAgIHJvdXRlci5fcm9vdFZpZXcgPSB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaGFuZGxlIGxhdGUtcmVuZGVyZWQgdmlld1xuICAgICAgICAvLyB0d28gcG9zc2liaWxpdGllczpcbiAgICAgICAgLy8gMS4gcm9vdCB2aWV3IHJlbmRlcmVkIGFmdGVyIHRyYW5zaXRpb24gaGFzIGJlZW5cbiAgICAgICAgLy8gICAgdmFsaWRhdGVkO1xuICAgICAgICAvLyAyLiBjaGlsZCB2aWV3IHJlbmRlcmVkIGFmdGVyIHBhcmVudCB2aWV3IGhhcyBiZWVuXG4gICAgICAgIC8vICAgIGFjdGl2YXRlZC5cbiAgICAgICAgdmFyIHRyYW5zaXRpb24gPSByb3V0ZS5yb3V0ZXIuX2N1cnJlbnRUcmFuc2l0aW9uO1xuICAgICAgICBpZiAoIXBhcmVudFZpZXcgJiYgdHJhbnNpdGlvbi5kb25lIHx8IHBhcmVudFZpZXcgJiYgcGFyZW50Vmlldy5hY3RpdmF0ZWQpIHtcbiAgICAgICAgICB2YXIgZGVwdGggPSBwYXJlbnRWaWV3ID8gcGFyZW50Vmlldy5kZXB0aCArIDEgOiAwO1xuICAgICAgICAgIGFjdGl2YXRlKHRoaXMsIHRyYW5zaXRpb24sIGRlcHRoKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudFZpZXcpIHtcbiAgICAgICAgICB0aGlzLnBhcmVudFZpZXcuY2hpbGRWaWV3ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb21wb25lbnREZWYudW5iaW5kLmNhbGwodGhpcyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBWdWUuZWxlbWVudERpcmVjdGl2ZSgncm91dGVyLXZpZXcnLCB2aWV3RGVmKTtcbiAgfVxuXG4gIHZhciB0cmFpbGluZ1NsYXNoUkUgPSAvXFwvJC87XG4gIHZhciByZWdleEVzY2FwZVJFID0gL1stLiorP14ke30oKXxbXFxdXFwvXFxcXF0vZztcbiAgdmFyIHF1ZXJ5U3RyaW5nUkUgPSAvXFw/LiokLztcblxuICAvLyBpbnN0YWxsIHYtbGluaywgd2hpY2ggcHJvdmlkZXMgbmF2aWdhdGlvbiBzdXBwb3J0IGZvclxuICAvLyBIVE1MNSBoaXN0b3J5IG1vZGVcbiAgZnVuY3Rpb24gTGluayAoVnVlKSB7XG4gICAgdmFyIF9WdWUkdXRpbCA9IFZ1ZS51dGlsO1xuICAgIHZhciBfYmluZCA9IF9WdWUkdXRpbC5iaW5kO1xuICAgIHZhciBpc09iamVjdCA9IF9WdWUkdXRpbC5pc09iamVjdDtcbiAgICB2YXIgYWRkQ2xhc3MgPSBfVnVlJHV0aWwuYWRkQ2xhc3M7XG4gICAgdmFyIHJlbW92ZUNsYXNzID0gX1Z1ZSR1dGlsLnJlbW92ZUNsYXNzO1xuXG4gICAgdmFyIG9uUHJpb3JpdHkgPSBWdWUuZGlyZWN0aXZlKCdvbicpLnByaW9yaXR5O1xuICAgIHZhciBMSU5LX1VQREFURSA9ICdfX3Z1ZS1yb3V0ZXItbGluay11cGRhdGVfXyc7XG5cbiAgICB2YXIgYWN0aXZlSWQgPSAwO1xuXG4gICAgVnVlLmRpcmVjdGl2ZSgnbGluay1hY3RpdmUnLCB7XG4gICAgICBwcmlvcml0eTogOTk5OSxcbiAgICAgIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGlkID0gU3RyaW5nKGFjdGl2ZUlkKyspO1xuICAgICAgICAvLyBjb2xsZWN0IHYtbGlua3MgY29udGFpbmVkIHdpdGhpbiB0aGlzIGVsZW1lbnQuXG4gICAgICAgIC8vIHdlIG5lZWQgZG8gdGhpcyBoZXJlIGJlZm9yZSB0aGUgcGFyZW50LWNoaWxkIHJlbGF0aW9uc2hpcFxuICAgICAgICAvLyBnZXRzIG1lc3NlZCB1cCBieSB0ZXJtaW5hbCBkaXJlY3RpdmVzIChpZiwgZm9yLCBjb21wb25lbnRzKVxuICAgICAgICB2YXIgY2hpbGRMaW5rcyA9IHRoaXMuZWwucXVlcnlTZWxlY3RvckFsbCgnW3YtbGlua10nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZExpbmtzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIHZhciBsaW5rID0gY2hpbGRMaW5rc1tpXTtcbiAgICAgICAgICB2YXIgZXhpc3RpbmdJZCA9IGxpbmsuZ2V0QXR0cmlidXRlKExJTktfVVBEQVRFKTtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBleGlzdGluZ0lkID8gZXhpc3RpbmdJZCArICcsJyArIGlkIDogaWQ7XG4gICAgICAgICAgLy8gbGVhdmUgYSBtYXJrIG9uIHRoZSBsaW5rIGVsZW1lbnQgd2hpY2ggY2FuIGJlIHBlcnNpc3RlZFxuICAgICAgICAgIC8vIHRocm91Z2ggZnJhZ21lbnQgY2xvbmVzLlxuICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKExJTktfVVBEQVRFLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52bS4kb24oTElOS19VUERBVEUsIHRoaXMuY2IgPSBmdW5jdGlvbiAobGluaywgcGF0aCkge1xuICAgICAgICAgIGlmIChsaW5rLmFjdGl2ZUlkcy5pbmRleE9mKGlkKSA+IC0xKSB7XG4gICAgICAgICAgICBsaW5rLnVwZGF0ZUNsYXNzZXMocGF0aCwgX3RoaXMuZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgICAgIHRoaXMudm0uJG9mZihMSU5LX1VQREFURSwgdGhpcy5jYik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBWdWUuZGlyZWN0aXZlKCdsaW5rJywge1xuICAgICAgcHJpb3JpdHk6IG9uUHJpb3JpdHkgLSAyLFxuXG4gICAgICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgICAgICB2YXIgdm0gPSB0aGlzLnZtO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKCF2bS4kcm91dGUpIHtcbiAgICAgICAgICB3YXJuJDEoJ3YtbGluayBjYW4gb25seSBiZSB1c2VkIGluc2lkZSBhIHJvdXRlci1lbmFibGVkIGFwcC4nKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yb3V0ZXIgPSB2bS4kcm91dGUucm91dGVyO1xuICAgICAgICAvLyB1cGRhdGUgdGhpbmdzIHdoZW4gdGhlIHJvdXRlIGNoYW5nZXNcbiAgICAgICAgdGhpcy51bndhdGNoID0gdm0uJHdhdGNoKCckcm91dGUnLCBfYmluZCh0aGlzLm9uUm91dGVVcGRhdGUsIHRoaXMpKTtcbiAgICAgICAgLy8gY2hlY2sgdi1saW5rLWFjdGl2ZSBpZHNcbiAgICAgICAgdmFyIGFjdGl2ZUlkcyA9IHRoaXMuZWwuZ2V0QXR0cmlidXRlKExJTktfVVBEQVRFKTtcbiAgICAgICAgaWYgKGFjdGl2ZUlkcykge1xuICAgICAgICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKExJTktfVVBEQVRFKTtcbiAgICAgICAgICB0aGlzLmFjdGl2ZUlkcyA9IGFjdGl2ZUlkcy5zcGxpdCgnLCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5vIG5lZWQgdG8gaGFuZGxlIGNsaWNrIGlmIGxpbmsgZXhwZWN0cyB0byBiZSBvcGVuZWRcbiAgICAgICAgLy8gaW4gYSBuZXcgd2luZG93L3RhYi5cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmICh0aGlzLmVsLnRhZ05hbWUgPT09ICdBJyAmJiB0aGlzLmVsLmdldEF0dHJpYnV0ZSgndGFyZ2V0JykgPT09ICdfYmxhbmsnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGhhbmRsZSBjbGlja1xuICAgICAgICB0aGlzLmhhbmRsZXIgPSBfYmluZCh0aGlzLm9uQ2xpY2ssIHRoaXMpO1xuICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5oYW5kbGVyKTtcbiAgICAgIH0sXG5cbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHRhcmdldCkge1xuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgICAgaWYgKGlzT2JqZWN0KHRhcmdldCkpIHtcbiAgICAgICAgICB0aGlzLmFwcGVuZCA9IHRhcmdldC5hcHBlbmQ7XG4gICAgICAgICAgdGhpcy5leGFjdCA9IHRhcmdldC5leGFjdDtcbiAgICAgICAgICB0aGlzLnByZXZBY3RpdmVDbGFzcyA9IHRoaXMuYWN0aXZlQ2xhc3M7XG4gICAgICAgICAgdGhpcy5hY3RpdmVDbGFzcyA9IHRhcmdldC5hY3RpdmVDbGFzcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uUm91dGVVcGRhdGUodGhpcy52bS4kcm91dGUpO1xuICAgICAgfSxcblxuICAgICAgb25DbGljazogZnVuY3Rpb24gb25DbGljayhlKSB7XG4gICAgICAgIC8vIGRvbid0IHJlZGlyZWN0IHdpdGggY29udHJvbCBrZXlzXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG4gICAgICAgIC8vIGRvbid0IHJlZGlyZWN0IHdoZW4gcHJldmVudERlZmF1bHQgY2FsbGVkXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoZS5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG4gICAgICAgIC8vIGRvbid0IHJlZGlyZWN0IG9uIHJpZ2h0IGNsaWNrXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoZS5idXR0b24gIT09IDApIHJldHVybjtcblxuICAgICAgICB2YXIgdGFyZ2V0ID0gdGhpcy50YXJnZXQ7XG4gICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAvLyB2LWxpbmsgd2l0aCBleHByZXNzaW9uLCBqdXN0IGdvXG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMucm91dGVyLmdvKHRhcmdldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbm8gZXhwcmVzc2lvbiwgZGVsZWdhdGUgZm9yIGFuIDxhPiBpbnNpZGVcbiAgICAgICAgICB2YXIgZWwgPSBlLnRhcmdldDtcbiAgICAgICAgICB3aGlsZSAoZWwudGFnTmFtZSAhPT0gJ0EnICYmIGVsICE9PSB0aGlzLmVsKSB7XG4gICAgICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlbC50YWdOYW1lID09PSAnQScgJiYgc2FtZU9yaWdpbihlbCkpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHZhciBwYXRoID0gZWwucGF0aG5hbWU7XG4gICAgICAgICAgICBpZiAodGhpcy5yb3V0ZXIuaGlzdG9yeS5yb290KSB7XG4gICAgICAgICAgICAgIHBhdGggPSBwYXRoLnJlcGxhY2UodGhpcy5yb3V0ZXIuaGlzdG9yeS5yb290UkUsICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucm91dGVyLmdvKHtcbiAgICAgICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICAgICAgcmVwbGFjZTogdGFyZ2V0ICYmIHRhcmdldC5yZXBsYWNlLFxuICAgICAgICAgICAgICBhcHBlbmQ6IHRhcmdldCAmJiB0YXJnZXQuYXBwZW5kXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIG9uUm91dGVVcGRhdGU6IGZ1bmN0aW9uIG9uUm91dGVVcGRhdGUocm91dGUpIHtcbiAgICAgICAgLy8gcm91dGVyLnN0cmluZ2lmeVBhdGggaXMgZGVwZW5kZW50IG9uIGN1cnJlbnQgcm91dGVcbiAgICAgICAgLy8gYW5kIG5lZWRzIHRvIGJlIGNhbGxlZCBhZ2FpbiB3aGVudmVyIHJvdXRlIGNoYW5nZXMuXG4gICAgICAgIHZhciBuZXdQYXRoID0gdGhpcy5yb3V0ZXIuc3RyaW5naWZ5UGF0aCh0aGlzLnRhcmdldCk7XG4gICAgICAgIGlmICh0aGlzLnBhdGggIT09IG5ld1BhdGgpIHtcbiAgICAgICAgICB0aGlzLnBhdGggPSBuZXdQYXRoO1xuICAgICAgICAgIHRoaXMudXBkYXRlQWN0aXZlTWF0Y2goKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUhyZWYoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hY3RpdmVJZHMpIHtcbiAgICAgICAgICB0aGlzLnZtLiRlbWl0KExJTktfVVBEQVRFLCB0aGlzLCByb3V0ZS5wYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUNsYXNzZXMocm91dGUucGF0aCwgdGhpcy5lbCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIHVwZGF0ZUFjdGl2ZU1hdGNoOiBmdW5jdGlvbiB1cGRhdGVBY3RpdmVNYXRjaCgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVSRSA9IHRoaXMucGF0aCAmJiAhdGhpcy5leGFjdCA/IG5ldyBSZWdFeHAoJ14nICsgdGhpcy5wYXRoLnJlcGxhY2UoL1xcLyQvLCAnJykucmVwbGFjZShxdWVyeVN0cmluZ1JFLCAnJykucmVwbGFjZShyZWdleEVzY2FwZVJFLCAnXFxcXCQmJykgKyAnKFxcXFwvfCQpJykgOiBudWxsO1xuICAgICAgfSxcblxuICAgICAgdXBkYXRlSHJlZjogZnVuY3Rpb24gdXBkYXRlSHJlZigpIHtcbiAgICAgICAgaWYgKHRoaXMuZWwudGFnTmFtZSAhPT0gJ0EnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXRoID0gdGhpcy5wYXRoO1xuICAgICAgICB2YXIgcm91dGVyID0gdGhpcy5yb3V0ZXI7XG4gICAgICAgIHZhciBpc0Fic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbiAgICAgICAgLy8gZG8gbm90IGZvcm1hdCBub24taGFzaCByZWxhdGl2ZSBwYXRoc1xuICAgICAgICB2YXIgaHJlZiA9IHBhdGggJiYgKHJvdXRlci5tb2RlID09PSAnaGFzaCcgfHwgaXNBYnNvbHV0ZSkgPyByb3V0ZXIuaGlzdG9yeS5mb3JtYXRQYXRoKHBhdGgsIHRoaXMuYXBwZW5kKSA6IHBhdGg7XG4gICAgICAgIGlmIChocmVmKSB7XG4gICAgICAgICAgdGhpcy5lbC5ocmVmID0gaHJlZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICB1cGRhdGVDbGFzc2VzOiBmdW5jdGlvbiB1cGRhdGVDbGFzc2VzKHBhdGgsIGVsKSB7XG4gICAgICAgIHZhciBhY3RpdmVDbGFzcyA9IHRoaXMuYWN0aXZlQ2xhc3MgfHwgdGhpcy5yb3V0ZXIuX2xpbmtBY3RpdmVDbGFzcztcbiAgICAgICAgLy8gY2xlYXIgb2xkIGNsYXNzXG4gICAgICAgIGlmICh0aGlzLnByZXZBY3RpdmVDbGFzcyAmJiB0aGlzLnByZXZBY3RpdmVDbGFzcyAhPT0gYWN0aXZlQ2xhc3MpIHtcbiAgICAgICAgICB0b2dnbGVDbGFzc2VzKGVsLCB0aGlzLnByZXZBY3RpdmVDbGFzcywgcmVtb3ZlQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlbW92ZSBxdWVyeSBzdHJpbmcgYmVmb3JlIG1hdGNoaW5nXG4gICAgICAgIHZhciBkZXN0ID0gdGhpcy5wYXRoLnJlcGxhY2UocXVlcnlTdHJpbmdSRSwgJycpO1xuICAgICAgICBwYXRoID0gcGF0aC5yZXBsYWNlKHF1ZXJ5U3RyaW5nUkUsICcnKTtcbiAgICAgICAgLy8gYWRkIG5ldyBjbGFzc1xuICAgICAgICBpZiAodGhpcy5leGFjdCkge1xuICAgICAgICAgIGlmIChkZXN0ID09PSBwYXRoIHx8XG4gICAgICAgICAgLy8gYWxzbyBhbGxvdyBhZGRpdGlvbmFsIHRyYWlsaW5nIHNsYXNoXG4gICAgICAgICAgZGVzdC5jaGFyQXQoZGVzdC5sZW5ndGggLSAxKSAhPT0gJy8nICYmIGRlc3QgPT09IHBhdGgucmVwbGFjZSh0cmFpbGluZ1NsYXNoUkUsICcnKSkge1xuICAgICAgICAgICAgdG9nZ2xlQ2xhc3NlcyhlbCwgYWN0aXZlQ2xhc3MsIGFkZENsYXNzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9nZ2xlQ2xhc3NlcyhlbCwgYWN0aXZlQ2xhc3MsIHJlbW92ZUNsYXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuYWN0aXZlUkUgJiYgdGhpcy5hY3RpdmVSRS50ZXN0KHBhdGgpKSB7XG4gICAgICAgICAgICB0b2dnbGVDbGFzc2VzKGVsLCBhY3RpdmVDbGFzcywgYWRkQ2xhc3MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b2dnbGVDbGFzc2VzKGVsLCBhY3RpdmVDbGFzcywgcmVtb3ZlQ2xhc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgICAgIHRoaXMuZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmhhbmRsZXIpO1xuICAgICAgICB0aGlzLnVud2F0Y2ggJiYgdGhpcy51bndhdGNoKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBzYW1lT3JpZ2luKGxpbmspIHtcbiAgICAgIHJldHVybiBsaW5rLnByb3RvY29sID09PSBsb2NhdGlvbi5wcm90b2NvbCAmJiBsaW5rLmhvc3RuYW1lID09PSBsb2NhdGlvbi5ob3N0bmFtZSAmJiBsaW5rLnBvcnQgPT09IGxvY2F0aW9uLnBvcnQ7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBmdW5jdGlvbiBpcyBjb3BpZWQgZnJvbSB2LWJpbmQ6Y2xhc3MgaW1wbGVtZW50YXRpb24gdW50aWxcbiAgICAvLyB3ZSBwcm9wZXJseSBleHBvc2UgaXQuLi5cbiAgICBmdW5jdGlvbiB0b2dnbGVDbGFzc2VzKGVsLCBrZXksIGZuKSB7XG4gICAgICBrZXkgPSBrZXkudHJpbSgpO1xuICAgICAgaWYgKGtleS5pbmRleE9mKCcgJykgPT09IC0xKSB7XG4gICAgICAgIGZuKGVsLCBrZXkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIga2V5cyA9IGtleS5zcGxpdCgvXFxzKy8pO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBmbihlbCwga2V5c1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIGhpc3RvcnlCYWNrZW5kcyA9IHtcbiAgICBhYnN0cmFjdDogQWJzdHJhY3RIaXN0b3J5LFxuICAgIGhhc2g6IEhhc2hIaXN0b3J5LFxuICAgIGh0bWw1OiBIVE1MNUhpc3RvcnlcbiAgfTtcblxuICAvLyBsYXRlIGJpbmQgZHVyaW5nIGluc3RhbGxcbiAgdmFyIFZ1ZSA9IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogUm91dGVyIGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG5cbiAgdmFyIFJvdXRlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUm91dGVyKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIF9yZWYgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgdmFyIF9yZWYkaGFzaGJhbmcgPSBfcmVmLmhhc2hiYW5nO1xuICAgICAgdmFyIGhhc2hiYW5nID0gX3JlZiRoYXNoYmFuZyA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IF9yZWYkaGFzaGJhbmc7XG4gICAgICB2YXIgX3JlZiRhYnN0cmFjdCA9IF9yZWYuYWJzdHJhY3Q7XG4gICAgICB2YXIgYWJzdHJhY3QgPSBfcmVmJGFic3RyYWN0ID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IF9yZWYkYWJzdHJhY3Q7XG4gICAgICB2YXIgX3JlZiRoaXN0b3J5ID0gX3JlZi5oaXN0b3J5O1xuICAgICAgdmFyIGhpc3RvcnkgPSBfcmVmJGhpc3RvcnkgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX3JlZiRoaXN0b3J5O1xuICAgICAgdmFyIF9yZWYkc2F2ZVNjcm9sbFBvc2l0aW9uID0gX3JlZi5zYXZlU2Nyb2xsUG9zaXRpb247XG4gICAgICB2YXIgc2F2ZVNjcm9sbFBvc2l0aW9uID0gX3JlZiRzYXZlU2Nyb2xsUG9zaXRpb24gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX3JlZiRzYXZlU2Nyb2xsUG9zaXRpb247XG4gICAgICB2YXIgX3JlZiR0cmFuc2l0aW9uT25Mb2FkID0gX3JlZi50cmFuc2l0aW9uT25Mb2FkO1xuICAgICAgdmFyIHRyYW5zaXRpb25PbkxvYWQgPSBfcmVmJHRyYW5zaXRpb25PbkxvYWQgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX3JlZiR0cmFuc2l0aW9uT25Mb2FkO1xuICAgICAgdmFyIF9yZWYkc3VwcHJlc3NUcmFuc2l0aW9uRXJyb3IgPSBfcmVmLnN1cHByZXNzVHJhbnNpdGlvbkVycm9yO1xuICAgICAgdmFyIHN1cHByZXNzVHJhbnNpdGlvbkVycm9yID0gX3JlZiRzdXBwcmVzc1RyYW5zaXRpb25FcnJvciA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBfcmVmJHN1cHByZXNzVHJhbnNpdGlvbkVycm9yO1xuICAgICAgdmFyIF9yZWYkcm9vdCA9IF9yZWYucm9vdDtcbiAgICAgIHZhciByb290ID0gX3JlZiRyb290ID09PSB1bmRlZmluZWQgPyBudWxsIDogX3JlZiRyb290O1xuICAgICAgdmFyIF9yZWYkbGlua0FjdGl2ZUNsYXNzID0gX3JlZi5saW5rQWN0aXZlQ2xhc3M7XG4gICAgICB2YXIgbGlua0FjdGl2ZUNsYXNzID0gX3JlZiRsaW5rQWN0aXZlQ2xhc3MgPT09IHVuZGVmaW5lZCA/ICd2LWxpbmstYWN0aXZlJyA6IF9yZWYkbGlua0FjdGl2ZUNsYXNzO1xuICAgICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIFJvdXRlcik7XG5cbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKCFSb3V0ZXIuaW5zdGFsbGVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGluc3RhbGwgdGhlIFJvdXRlciB3aXRoIFZ1ZS51c2UoKSBiZWZvcmUgJyArICdjcmVhdGluZyBhbiBpbnN0YW5jZS4nKTtcbiAgICAgIH1cblxuICAgICAgLy8gVnVlIGluc3RhbmNlc1xuICAgICAgdGhpcy5hcHAgPSBudWxsO1xuICAgICAgdGhpcy5fY2hpbGRyZW4gPSBbXTtcblxuICAgICAgLy8gcm91dGUgcmVjb2duaXplclxuICAgICAgdGhpcy5fcmVjb2duaXplciA9IG5ldyBSb3V0ZVJlY29nbml6ZXIoKTtcbiAgICAgIHRoaXMuX2d1YXJkUmVjb2duaXplciA9IG5ldyBSb3V0ZVJlY29nbml6ZXIoKTtcblxuICAgICAgLy8gc3RhdGVcbiAgICAgIHRoaXMuX3N0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX3N0YXJ0Q2IgPSBudWxsO1xuICAgICAgdGhpcy5fY3VycmVudFJvdXRlID0ge307XG4gICAgICB0aGlzLl9jdXJyZW50VHJhbnNpdGlvbiA9IG51bGw7XG4gICAgICB0aGlzLl9wcmV2aW91c1RyYW5zaXRpb24gPSBudWxsO1xuICAgICAgdGhpcy5fbm90Rm91bmRIYW5kbGVyID0gbnVsbDtcbiAgICAgIHRoaXMuX25vdEZvdW5kUmVkaXJlY3QgPSBudWxsO1xuICAgICAgdGhpcy5fYmVmb3JlRWFjaEhvb2tzID0gW107XG4gICAgICB0aGlzLl9hZnRlckVhY2hIb29rcyA9IFtdO1xuXG4gICAgICAvLyB0cmlnZ2VyIHRyYW5zaXRpb24gb24gaW5pdGlhbCByZW5kZXI/XG4gICAgICB0aGlzLl9yZW5kZXJlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5fdHJhbnNpdGlvbk9uTG9hZCA9IHRyYW5zaXRpb25PbkxvYWQ7XG5cbiAgICAgIC8vIGhpc3RvcnkgbW9kZVxuICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgICB0aGlzLl9hYnN0cmFjdCA9IGFic3RyYWN0O1xuICAgICAgdGhpcy5faGFzaGJhbmcgPSBoYXNoYmFuZztcblxuICAgICAgLy8gY2hlY2sgaWYgSFRNTDUgaGlzdG9yeSBpcyBhdmFpbGFibGVcbiAgICAgIHZhciBoYXNQdXNoU3RhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuaGlzdG9yeSAmJiB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGU7XG4gICAgICB0aGlzLl9oaXN0b3J5ID0gaGlzdG9yeSAmJiBoYXNQdXNoU3RhdGU7XG4gICAgICB0aGlzLl9oaXN0b3J5RmFsbGJhY2sgPSBoaXN0b3J5ICYmICFoYXNQdXNoU3RhdGU7XG5cbiAgICAgIC8vIGNyZWF0ZSBoaXN0b3J5IG9iamVjdFxuICAgICAgdmFyIGluQnJvd3NlciA9IFZ1ZS51dGlsLmluQnJvd3NlcjtcbiAgICAgIHRoaXMubW9kZSA9ICFpbkJyb3dzZXIgfHwgdGhpcy5fYWJzdHJhY3QgPyAnYWJzdHJhY3QnIDogdGhpcy5faGlzdG9yeSA/ICdodG1sNScgOiAnaGFzaCc7XG5cbiAgICAgIHZhciBIaXN0b3J5ID0gaGlzdG9yeUJhY2tlbmRzW3RoaXMubW9kZV07XG4gICAgICB0aGlzLmhpc3RvcnkgPSBuZXcgSGlzdG9yeSh7XG4gICAgICAgIHJvb3Q6IHJvb3QsXG4gICAgICAgIGhhc2hiYW5nOiB0aGlzLl9oYXNoYmFuZyxcbiAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIG9uQ2hhbmdlKHBhdGgsIHN0YXRlLCBhbmNob3IpIHtcbiAgICAgICAgICBfdGhpcy5fbWF0Y2gocGF0aCwgc3RhdGUsIGFuY2hvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBvdGhlciBvcHRpb25zXG4gICAgICB0aGlzLl9zYXZlU2Nyb2xsUG9zaXRpb24gPSBzYXZlU2Nyb2xsUG9zaXRpb247XG4gICAgICB0aGlzLl9saW5rQWN0aXZlQ2xhc3MgPSBsaW5rQWN0aXZlQ2xhc3M7XG4gICAgICB0aGlzLl9zdXBwcmVzcyA9IHN1cHByZXNzVHJhbnNpdGlvbkVycm9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFsbG93IGRpcmVjdGx5IHBhc3NpbmcgY29tcG9uZW50cyB0byBhIHJvdXRlXG4gICAgICogZGVmaW5pdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGhhbmRsZXJcbiAgICAgKi9cblxuICAgIC8vIEFQSSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICogUmVnaXN0ZXIgYSBtYXAgb2YgdG9wLWxldmVsIHBhdGhzLlxuICAgICpcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBtYXBcbiAgICAqL1xuXG4gICAgUm91dGVyLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiBtYXAoX21hcCkge1xuICAgICAgZm9yICh2YXIgcm91dGUgaW4gX21hcCkge1xuICAgICAgICB0aGlzLm9uKHJvdXRlLCBfbWFwW3JvdXRlXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSBzaW5nbGUgcm9vdC1sZXZlbCBwYXRoXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcm9vdFBhdGhcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaGFuZGxlclxuICAgICAqICAgICAgICAgICAgICAgICAtIHtTdHJpbmd9IGNvbXBvbmVudFxuICAgICAqICAgICAgICAgICAgICAgICAtIHtPYmplY3R9IFtzdWJSb3V0ZXNdXG4gICAgICogICAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IFtmb3JjZVJlZnJlc2hdXG4gICAgICogICAgICAgICAgICAgICAgIC0ge0Z1bmN0aW9ufSBbYmVmb3JlXVxuICAgICAqICAgICAgICAgICAgICAgICAtIHtGdW5jdGlvbn0gW2FmdGVyXVxuICAgICAqL1xuXG4gICAgUm91dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKHJvb3RQYXRoLCBoYW5kbGVyKSB7XG4gICAgICBpZiAocm9vdFBhdGggPT09ICcqJykge1xuICAgICAgICB0aGlzLl9ub3RGb3VuZChoYW5kbGVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FkZFJvdXRlKHJvb3RQYXRoLCBoYW5kbGVyLCBbXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0IHJlZGlyZWN0cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtYXBcbiAgICAgKi9cblxuICAgIFJvdXRlci5wcm90b3R5cGUucmVkaXJlY3QgPSBmdW5jdGlvbiByZWRpcmVjdChtYXApIHtcbiAgICAgIGZvciAodmFyIHBhdGggaW4gbWFwKSB7XG4gICAgICAgIHRoaXMuX2FkZFJlZGlyZWN0KHBhdGgsIG1hcFtwYXRoXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0IGFsaWFzZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbWFwXG4gICAgICovXG5cbiAgICBSb3V0ZXIucHJvdG90eXBlLmFsaWFzID0gZnVuY3Rpb24gYWxpYXMobWFwKSB7XG4gICAgICBmb3IgKHZhciBwYXRoIGluIG1hcCkge1xuICAgICAgICB0aGlzLl9hZGRBbGlhcyhwYXRoLCBtYXBbcGF0aF0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldCBnbG9iYWwgYmVmb3JlIGhvb2suXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAqL1xuXG4gICAgUm91dGVyLnByb3RvdHlwZS5iZWZvcmVFYWNoID0gZnVuY3Rpb24gYmVmb3JlRWFjaChmbikge1xuICAgICAgdGhpcy5fYmVmb3JlRWFjaEhvb2tzLnB1c2goZm4pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldCBnbG9iYWwgYWZ0ZXIgaG9vay5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAgICovXG5cbiAgICBSb3V0ZXIucHJvdG90eXBlLmFmdGVyRWFjaCA9IGZ1bmN0aW9uIGFmdGVyRWFjaChmbikge1xuICAgICAgdGhpcy5fYWZ0ZXJFYWNoSG9va3MucHVzaChmbik7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTmF2aWdhdGUgdG8gYSBnaXZlbiBwYXRoLlxuICAgICAqIFRoZSBwYXRoIGNhbiBiZSBhbiBvYmplY3QgZGVzY3JpYmluZyBhIG5hbWVkIHBhdGggaW5cbiAgICAgKiB0aGUgZm9ybWF0IG9mIHsgbmFtZTogJy4uLicsIHBhcmFtczoge30sIHF1ZXJ5OiB7fX1cbiAgICAgKiBUaGUgcGF0aCBpcyBhc3N1bWVkIHRvIGJlIGFscmVhZHkgZGVjb2RlZCwgYW5kIHdpbGxcbiAgICAgKiBiZSByZXNvbHZlZCBhZ2FpbnN0IHJvb3QgKGlmIHByb3ZpZGVkKVxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBwYXRoXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbcmVwbGFjZV1cbiAgICAgKi9cblxuICAgIFJvdXRlci5wcm90b3R5cGUuZ28gPSBmdW5jdGlvbiBnbyhwYXRoKSB7XG4gICAgICB2YXIgcmVwbGFjZSA9IGZhbHNlO1xuICAgICAgdmFyIGFwcGVuZCA9IGZhbHNlO1xuICAgICAgaWYgKFZ1ZS51dGlsLmlzT2JqZWN0KHBhdGgpKSB7XG4gICAgICAgIHJlcGxhY2UgPSBwYXRoLnJlcGxhY2U7XG4gICAgICAgIGFwcGVuZCA9IHBhdGguYXBwZW5kO1xuICAgICAgfVxuICAgICAgcGF0aCA9IHRoaXMuc3RyaW5naWZ5UGF0aChwYXRoKTtcbiAgICAgIGlmIChwYXRoKSB7XG4gICAgICAgIHRoaXMuaGlzdG9yeS5nbyhwYXRoLCByZXBsYWNlLCBhcHBlbmQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTaG9ydCBoYW5kIGZvciByZXBsYWNpbmcgY3VycmVudCBwYXRoXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgICAqL1xuXG4gICAgUm91dGVyLnByb3RvdHlwZS5yZXBsYWNlID0gZnVuY3Rpb24gcmVwbGFjZShwYXRoKSB7XG4gICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBhdGggPSB7IHBhdGg6IHBhdGggfTtcbiAgICAgIH1cbiAgICAgIHBhdGgucmVwbGFjZSA9IHRydWU7XG4gICAgICB0aGlzLmdvKHBhdGgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTdGFydCB0aGUgcm91dGVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtWdWVDb25zdHJ1Y3Rvcn0gQXBwXG4gICAgICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudH0gY29udGFpbmVyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICAgICAqL1xuXG4gICAgUm91dGVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIHN0YXJ0KEFwcCwgY29udGFpbmVyLCBjYikge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAodGhpcy5fc3RhcnRlZCkge1xuICAgICAgICB3YXJuJDEoJ2FscmVhZHkgc3RhcnRlZC4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgICB0aGlzLl9zdGFydENiID0gY2I7XG4gICAgICBpZiAoIXRoaXMuYXBwKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoIUFwcCB8fCAhY29udGFpbmVyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IHN0YXJ0IHZ1ZS1yb3V0ZXIgd2l0aCBhIGNvbXBvbmVudCBhbmQgYSAnICsgJ3Jvb3QgY29udGFpbmVyLicpO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoQXBwIGluc3RhbmNlb2YgVnVlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IHN0YXJ0IHZ1ZS1yb3V0ZXIgd2l0aCBhIGNvbXBvbmVudCwgbm90IGEgJyArICdWdWUgaW5zdGFuY2UuJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXBwQ29udGFpbmVyID0gY29udGFpbmVyO1xuICAgICAgICB2YXIgQ3RvciA9IHRoaXMuX2FwcENvbnN0cnVjdG9yID0gdHlwZW9mIEFwcCA9PT0gJ2Z1bmN0aW9uJyA/IEFwcCA6IFZ1ZS5leHRlbmQoQXBwKTtcbiAgICAgICAgLy8gZ2l2ZSBpdCBhIG5hbWUgZm9yIGJldHRlciBkZWJ1Z2dpbmdcbiAgICAgICAgQ3Rvci5vcHRpb25zLm5hbWUgPSBDdG9yLm9wdGlvbnMubmFtZSB8fCAnUm91dGVyQXBwJztcbiAgICAgIH1cblxuICAgICAgLy8gaGFuZGxlIGhpc3RvcnkgZmFsbGJhY2sgaW4gYnJvd3NlcnMgdGhhdCBkbyBub3RcbiAgICAgIC8vIHN1cHBvcnQgSFRNTDUgaGlzdG9yeSBBUElcbiAgICAgIGlmICh0aGlzLl9oaXN0b3J5RmFsbGJhY2spIHtcbiAgICAgICAgdmFyIF9sb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbjtcbiAgICAgICAgdmFyIF9oaXN0b3J5ID0gbmV3IEhUTUw1SGlzdG9yeSh7IHJvb3Q6IHRoaXMuX3Jvb3QgfSk7XG4gICAgICAgIHZhciBwYXRoID0gX2hpc3Rvcnkucm9vdCA/IF9sb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKF9oaXN0b3J5LnJvb3RSRSwgJycpIDogX2xvY2F0aW9uLnBhdGhuYW1lO1xuICAgICAgICBpZiAocGF0aCAmJiBwYXRoICE9PSAnLycpIHtcbiAgICAgICAgICBfbG9jYXRpb24uYXNzaWduKChfaGlzdG9yeS5yb290IHx8ICcnKSArICcvJyArIHRoaXMuaGlzdG9yeS5mb3JtYXRQYXRoKHBhdGgpICsgX2xvY2F0aW9uLnNlYXJjaCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaGlzdG9yeS5zdGFydCgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTdG9wIGxpc3RlbmluZyB0byByb3V0ZSBjaGFuZ2VzLlxuICAgICAqL1xuXG4gICAgUm91dGVyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgIHRoaXMuaGlzdG9yeS5zdG9wKCk7XG4gICAgICB0aGlzLl9zdGFydGVkID0gZmFsc2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE5vcm1hbGl6ZSBuYW1lZCByb3V0ZSBvYmplY3QgLyBzdHJpbmcgcGF0aHMgaW50b1xuICAgICAqIGEgc3RyaW5nLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfE51bWJlcn0gcGF0aFxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cblxuICAgIFJvdXRlci5wcm90b3R5cGUuc3RyaW5naWZ5UGF0aCA9IGZ1bmN0aW9uIHN0cmluZ2lmeVBhdGgocGF0aCkge1xuICAgICAgdmFyIGdlbmVyYXRlZFBhdGggPSAnJztcbiAgICAgIGlmIChwYXRoICYmIHR5cGVvZiBwYXRoID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAocGF0aC5uYW1lKSB7XG4gICAgICAgICAgdmFyIGV4dGVuZCA9IFZ1ZS51dGlsLmV4dGVuZDtcbiAgICAgICAgICB2YXIgY3VycmVudFBhcmFtcyA9IHRoaXMuX2N1cnJlbnRUcmFuc2l0aW9uICYmIHRoaXMuX2N1cnJlbnRUcmFuc2l0aW9uLnRvLnBhcmFtcztcbiAgICAgICAgICB2YXIgdGFyZ2V0UGFyYW1zID0gcGF0aC5wYXJhbXMgfHwge307XG4gICAgICAgICAgdmFyIHBhcmFtcyA9IGN1cnJlbnRQYXJhbXMgPyBleHRlbmQoZXh0ZW5kKHt9LCBjdXJyZW50UGFyYW1zKSwgdGFyZ2V0UGFyYW1zKSA6IHRhcmdldFBhcmFtcztcbiAgICAgICAgICBnZW5lcmF0ZWRQYXRoID0gZW5jb2RlVVJJKHRoaXMuX3JlY29nbml6ZXIuZ2VuZXJhdGUocGF0aC5uYW1lLCBwYXJhbXMpKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXRoLnBhdGgpIHtcbiAgICAgICAgICBnZW5lcmF0ZWRQYXRoID0gZW5jb2RlVVJJKHBhdGgucGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhdGgucXVlcnkpIHtcbiAgICAgICAgICAvLyBub3RlOiB0aGUgZ2VuZXJhdGVkIHF1ZXJ5IHN0cmluZyBpcyBwcmUtVVJMLWVuY29kZWQgYnkgdGhlIHJlY29nbml6ZXJcbiAgICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLl9yZWNvZ25pemVyLmdlbmVyYXRlUXVlcnlTdHJpbmcocGF0aC5xdWVyeSk7XG4gICAgICAgICAgaWYgKGdlbmVyYXRlZFBhdGguaW5kZXhPZignPycpID4gLTEpIHtcbiAgICAgICAgICAgIGdlbmVyYXRlZFBhdGggKz0gJyYnICsgcXVlcnkuc2xpY2UoMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdlbmVyYXRlZFBhdGggKz0gcXVlcnk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnZW5lcmF0ZWRQYXRoID0gZW5jb2RlVVJJKHBhdGggPyBwYXRoICsgJycgOiAnJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZ2VuZXJhdGVkUGF0aDtcbiAgICB9O1xuXG4gICAgLy8gSW50ZXJuYWwgbWV0aG9kcyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgKiBBZGQgYSByb3V0ZSBjb250YWluaW5nIGEgbGlzdCBvZiBzZWdtZW50cyB0byB0aGUgaW50ZXJuYWxcbiAgICAqIHJvdXRlIHJlY29nbml6ZXIuIFdpbGwgYmUgY2FsbGVkIHJlY3Vyc2l2ZWx5IHRvIGFkZCBhbGxcbiAgICAqIHBvc3NpYmxlIHN1Yi1yb3V0ZXMuXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBoYW5kbGVyXG4gICAgKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50c1xuICAgICovXG5cbiAgICBSb3V0ZXIucHJvdG90eXBlLl9hZGRSb3V0ZSA9IGZ1bmN0aW9uIF9hZGRSb3V0ZShwYXRoLCBoYW5kbGVyLCBzZWdtZW50cykge1xuICAgICAgZ3VhcmRDb21wb25lbnQocGF0aCwgaGFuZGxlcik7XG4gICAgICBoYW5kbGVyLnBhdGggPSBwYXRoO1xuICAgICAgaGFuZGxlci5mdWxsUGF0aCA9IChzZWdtZW50cy5yZWR1Y2UoZnVuY3Rpb24gKHBhdGgsIHNlZ21lbnQpIHtcbiAgICAgICAgcmV0dXJuIHBhdGggKyBzZWdtZW50LnBhdGg7XG4gICAgICB9LCAnJykgKyBwYXRoKS5yZXBsYWNlKCcvLycsICcvJyk7XG4gICAgICBzZWdtZW50cy5wdXNoKHtcbiAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgaGFuZGxlcjogaGFuZGxlclxuICAgICAgfSk7XG4gICAgICB0aGlzLl9yZWNvZ25pemVyLmFkZChzZWdtZW50cywge1xuICAgICAgICBhczogaGFuZGxlci5uYW1lXG4gICAgICB9KTtcbiAgICAgIC8vIGFkZCBzdWIgcm91dGVzXG4gICAgICBpZiAoaGFuZGxlci5zdWJSb3V0ZXMpIHtcbiAgICAgICAgZm9yICh2YXIgc3ViUGF0aCBpbiBoYW5kbGVyLnN1YlJvdXRlcykge1xuICAgICAgICAgIC8vIHJlY3Vyc2l2ZWx5IHdhbGsgYWxsIHN1YiByb3V0ZXNcbiAgICAgICAgICB0aGlzLl9hZGRSb3V0ZShzdWJQYXRoLCBoYW5kbGVyLnN1YlJvdXRlc1tzdWJQYXRoXSxcbiAgICAgICAgICAvLyBwYXNzIGEgY29weSBpbiByZWN1cnNpb24gdG8gYXZvaWQgbXV0YXRpbmdcbiAgICAgICAgICAvLyBhY3Jvc3MgYnJhbmNoZXNcbiAgICAgICAgICBzZWdtZW50cy5zbGljZSgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIG5vdEZvdW5kIHJvdXRlIGhhbmRsZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaGFuZGxlclxuICAgICAqL1xuXG4gICAgUm91dGVyLnByb3RvdHlwZS5fbm90Rm91bmQgPSBmdW5jdGlvbiBfbm90Rm91bmQoaGFuZGxlcikge1xuICAgICAgZ3VhcmRDb21wb25lbnQoJyonLCBoYW5kbGVyKTtcbiAgICAgIHRoaXMuX25vdEZvdW5kSGFuZGxlciA9IFt7IGhhbmRsZXI6IGhhbmRsZXIgfV07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZCBhIHJlZGlyZWN0IHJlY29yZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJlZGlyZWN0UGF0aFxuICAgICAqL1xuXG4gICAgUm91dGVyLnByb3RvdHlwZS5fYWRkUmVkaXJlY3QgPSBmdW5jdGlvbiBfYWRkUmVkaXJlY3QocGF0aCwgcmVkaXJlY3RQYXRoKSB7XG4gICAgICBpZiAocGF0aCA9PT0gJyonKSB7XG4gICAgICAgIHRoaXMuX25vdEZvdW5kUmVkaXJlY3QgPSByZWRpcmVjdFBhdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hZGRHdWFyZChwYXRoLCByZWRpcmVjdFBhdGgsIHRoaXMucmVwbGFjZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZCBhbiBhbGlhcyByZWNvcmQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhbGlhc1BhdGhcbiAgICAgKi9cblxuICAgIFJvdXRlci5wcm90b3R5cGUuX2FkZEFsaWFzID0gZnVuY3Rpb24gX2FkZEFsaWFzKHBhdGgsIGFsaWFzUGF0aCkge1xuICAgICAgdGhpcy5fYWRkR3VhcmQocGF0aCwgYWxpYXNQYXRoLCB0aGlzLl9tYXRjaCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZCBhIHBhdGggZ3VhcmQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtYXBwZWRQYXRoXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgICAqL1xuXG4gICAgUm91dGVyLnByb3RvdHlwZS5fYWRkR3VhcmQgPSBmdW5jdGlvbiBfYWRkR3VhcmQocGF0aCwgbWFwcGVkUGF0aCwgX2hhbmRsZXIpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICB0aGlzLl9ndWFyZFJlY29nbml6ZXIuYWRkKFt7XG4gICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uIGhhbmRsZXIobWF0Y2gsIHF1ZXJ5KSB7XG4gICAgICAgICAgdmFyIHJlYWxQYXRoID0gbWFwUGFyYW1zKG1hcHBlZFBhdGgsIG1hdGNoLnBhcmFtcywgcXVlcnkpO1xuICAgICAgICAgIF9oYW5kbGVyLmNhbGwoX3RoaXMyLCByZWFsUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1dKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYSBwYXRoIG1hdGNoZXMgYW55IHJlZGlyZWN0IHJlY29yZHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IC0gaWYgdHJ1ZSwgd2lsbCBza2lwIG5vcm1hbCBtYXRjaC5cbiAgICAgKi9cblxuICAgIFJvdXRlci5wcm90b3R5cGUuX2NoZWNrR3VhcmQgPSBmdW5jdGlvbiBfY2hlY2tHdWFyZChwYXRoKSB7XG4gICAgICB2YXIgbWF0Y2hlZCA9IHRoaXMuX2d1YXJkUmVjb2duaXplci5yZWNvZ25pemUocGF0aCwgdHJ1ZSk7XG4gICAgICBpZiAobWF0Y2hlZCkge1xuICAgICAgICBtYXRjaGVkWzBdLmhhbmRsZXIobWF0Y2hlZFswXSwgbWF0Y2hlZC5xdWVyeVBhcmFtcyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ub3RGb3VuZFJlZGlyZWN0KSB7XG4gICAgICAgIG1hdGNoZWQgPSB0aGlzLl9yZWNvZ25pemVyLnJlY29nbml6ZShwYXRoKTtcbiAgICAgICAgaWYgKCFtYXRjaGVkKSB7XG4gICAgICAgICAgdGhpcy5yZXBsYWNlKHRoaXMuX25vdEZvdW5kUmVkaXJlY3QpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1hdGNoIGEgVVJMIHBhdGggYW5kIHNldCB0aGUgcm91dGUgY29udGV4dCBvbiB2bSxcbiAgICAgKiB0cmlnZ2VyaW5nIHZpZXcgdXBkYXRlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtzdGF0ZV1cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2FuY2hvcl1cbiAgICAgKi9cblxuICAgIFJvdXRlci5wcm90b3R5cGUuX21hdGNoID0gZnVuY3Rpb24gX21hdGNoKHBhdGgsIHN0YXRlLCBhbmNob3IpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy5fY2hlY2tHdWFyZChwYXRoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBjdXJyZW50Um91dGUgPSB0aGlzLl9jdXJyZW50Um91dGU7XG4gICAgICB2YXIgY3VycmVudFRyYW5zaXRpb24gPSB0aGlzLl9jdXJyZW50VHJhbnNpdGlvbjtcblxuICAgICAgaWYgKGN1cnJlbnRUcmFuc2l0aW9uKSB7XG4gICAgICAgIGlmIChjdXJyZW50VHJhbnNpdGlvbi50by5wYXRoID09PSBwYXRoKSB7XG4gICAgICAgICAgLy8gZG8gbm90aGluZyBpZiB3ZSBoYXZlIGFuIGFjdGl2ZSB0cmFuc2l0aW9uIGdvaW5nIHRvIHRoZSBzYW1lIHBhdGhcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFJvdXRlLnBhdGggPT09IHBhdGgpIHtcbiAgICAgICAgICAvLyBXZSBhcmUgZ29pbmcgdG8gdGhlIHNhbWUgcGF0aCwgYnV0IHdlIGFsc28gaGF2ZSBhbiBvbmdvaW5nIGJ1dFxuICAgICAgICAgIC8vIG5vdC15ZXQtdmFsaWRhdGVkIHRyYW5zaXRpb24uIEFib3J0IHRoYXQgdHJhbnNpdGlvbiBhbmQgcmVzZXQgdG9cbiAgICAgICAgICAvLyBwcmV2IHRyYW5zaXRpb24uXG4gICAgICAgICAgY3VycmVudFRyYW5zaXRpb24uYWJvcnRlZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5fY3VycmVudFRyYW5zaXRpb24gPSB0aGlzLl9wcmV2VHJhbnNpdGlvbjtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gZ29pbmcgdG8gYSB0b3RhbGx5IGRpZmZlcmVudCBwYXRoLiBhYm9ydCBvbmdvaW5nIHRyYW5zaXRpb24uXG4gICAgICAgICAgY3VycmVudFRyYW5zaXRpb24uYWJvcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY29uc3RydWN0IG5ldyByb3V0ZSBhbmQgdHJhbnNpdGlvbiBjb250ZXh0XG4gICAgICB2YXIgcm91dGUgPSBuZXcgUm91dGUocGF0aCwgdGhpcyk7XG4gICAgICB2YXIgdHJhbnNpdGlvbiA9IG5ldyBSb3V0ZVRyYW5zaXRpb24odGhpcywgcm91dGUsIGN1cnJlbnRSb3V0ZSk7XG5cbiAgICAgIC8vIGN1cnJlbnQgdHJhbnNpdGlvbiBpcyB1cGRhdGVkIHJpZ2h0IG5vdy5cbiAgICAgIC8vIGhvd2V2ZXIsIGN1cnJlbnQgcm91dGUgd2lsbCBvbmx5IGJlIHVwZGF0ZWQgYWZ0ZXIgdGhlIHRyYW5zaXRpb24gaGFzXG4gICAgICAvLyBiZWVuIHZhbGlkYXRlZC5cbiAgICAgIHRoaXMuX3ByZXZUcmFuc2l0aW9uID0gY3VycmVudFRyYW5zaXRpb247XG4gICAgICB0aGlzLl9jdXJyZW50VHJhbnNpdGlvbiA9IHRyYW5zaXRpb247XG5cbiAgICAgIGlmICghdGhpcy5hcHApIHtcbiAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBpbml0aWFsIHJlbmRlclxuICAgICAgICAgIHZhciByb3V0ZXIgPSBfdGhpczM7XG4gICAgICAgICAgX3RoaXMzLmFwcCA9IG5ldyBfdGhpczMuX2FwcENvbnN0cnVjdG9yKHtcbiAgICAgICAgICAgIGVsOiBfdGhpczMuX2FwcENvbnRhaW5lcixcbiAgICAgICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uIGNyZWF0ZWQoKSB7XG4gICAgICAgICAgICAgIHRoaXMuJHJvdXRlciA9IHJvdXRlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfbWV0YToge1xuICAgICAgICAgICAgICAkcm91dGU6IHJvdXRlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNoZWNrIGdsb2JhbCBiZWZvcmUgaG9va1xuICAgICAgdmFyIGJlZm9yZUhvb2tzID0gdGhpcy5fYmVmb3JlRWFjaEhvb2tzO1xuICAgICAgdmFyIHN0YXJ0VHJhbnNpdGlvbiA9IGZ1bmN0aW9uIHN0YXJ0VHJhbnNpdGlvbigpIHtcbiAgICAgICAgdHJhbnNpdGlvbi5zdGFydChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgX3RoaXMzLl9wb3N0VHJhbnNpdGlvbihyb3V0ZSwgc3RhdGUsIGFuY2hvcik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgaWYgKGJlZm9yZUhvb2tzLmxlbmd0aCkge1xuICAgICAgICB0cmFuc2l0aW9uLnJ1blF1ZXVlKGJlZm9yZUhvb2tzLCBmdW5jdGlvbiAoaG9vaywgXywgbmV4dCkge1xuICAgICAgICAgIGlmICh0cmFuc2l0aW9uID09PSBfdGhpczMuX2N1cnJlbnRUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uLmNhbGxIb29rKGhvb2ssIG51bGwsIG5leHQsIHtcbiAgICAgICAgICAgICAgZXhwZWN0Qm9vbGVhbjogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBzdGFydFRyYW5zaXRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhcnRUcmFuc2l0aW9uKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5fcmVuZGVyZWQgJiYgdGhpcy5fc3RhcnRDYikge1xuICAgICAgICB0aGlzLl9zdGFydENiLmNhbGwobnVsbCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEhBQ0s6XG4gICAgICAvLyBzZXQgcmVuZGVyZWQgdG8gdHJ1ZSBhZnRlciB0aGUgdHJhbnNpdGlvbiBzdGFydCwgc29cbiAgICAgIC8vIHRoYXQgY29tcG9uZW50cyB0aGF0IGFyZSBhY2l0dmF0ZWQgc3luY2hyb25vdXNseSBrbm93XG4gICAgICAvLyB3aGV0aGVyIGl0IGlzIHRoZSBpbml0aWFsIHJlbmRlci5cbiAgICAgIHRoaXMuX3JlbmRlcmVkID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0IGN1cnJlbnQgdG8gdGhlIG5ldyB0cmFuc2l0aW9uLlxuICAgICAqIFRoaXMgaXMgY2FsbGVkIGJ5IHRoZSB0cmFuc2l0aW9uIG9iamVjdCB3aGVuIHRoZVxuICAgICAqIHZhbGlkYXRpb24gb2YgYSByb3V0ZSBoYXMgc3VjY2VlZGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUcmFuc2l0aW9ufSB0cmFuc2l0aW9uXG4gICAgICovXG5cbiAgICBSb3V0ZXIucHJvdG90eXBlLl9vblRyYW5zaXRpb25WYWxpZGF0ZWQgPSBmdW5jdGlvbiBfb25UcmFuc2l0aW9uVmFsaWRhdGVkKHRyYW5zaXRpb24pIHtcbiAgICAgIC8vIHNldCBjdXJyZW50IHJvdXRlXG4gICAgICB2YXIgcm91dGUgPSB0aGlzLl9jdXJyZW50Um91dGUgPSB0cmFuc2l0aW9uLnRvO1xuICAgICAgLy8gdXBkYXRlIHJvdXRlIGNvbnRleHQgZm9yIGFsbCBjaGlsZHJlblxuICAgICAgaWYgKHRoaXMuYXBwLiRyb3V0ZSAhPT0gcm91dGUpIHtcbiAgICAgICAgdGhpcy5hcHAuJHJvdXRlID0gcm91dGU7XG4gICAgICAgIHRoaXMuX2NoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgY2hpbGQuJHJvdXRlID0gcm91dGU7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgLy8gY2FsbCBnbG9iYWwgYWZ0ZXIgaG9va1xuICAgICAgaWYgKHRoaXMuX2FmdGVyRWFjaEhvb2tzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9hZnRlckVhY2hIb29rcy5mb3JFYWNoKGZ1bmN0aW9uIChob29rKSB7XG4gICAgICAgICAgcmV0dXJuIGhvb2suY2FsbChudWxsLCB7XG4gICAgICAgICAgICB0bzogdHJhbnNpdGlvbi50byxcbiAgICAgICAgICAgIGZyb206IHRyYW5zaXRpb24uZnJvbVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2N1cnJlbnRUcmFuc2l0aW9uLmRvbmUgPSB0cnVlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgc3R1ZmYgYWZ0ZXIgdGhlIHRyYW5zaXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1JvdXRlfSByb3V0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbc3RhdGVdXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFthbmNob3JdXG4gICAgICovXG5cbiAgICBSb3V0ZXIucHJvdG90eXBlLl9wb3N0VHJhbnNpdGlvbiA9IGZ1bmN0aW9uIF9wb3N0VHJhbnNpdGlvbihyb3V0ZSwgc3RhdGUsIGFuY2hvcikge1xuICAgICAgLy8gaGFuZGxlIHNjcm9sbCBwb3NpdGlvbnNcbiAgICAgIC8vIHNhdmVkIHNjcm9sbCBwb3NpdGlvbnMgdGFrZSBwcmlvcml0eVxuICAgICAgLy8gdGhlbiB3ZSBjaGVjayBpZiB0aGUgcGF0aCBoYXMgYW4gYW5jaG9yXG4gICAgICB2YXIgcG9zID0gc3RhdGUgJiYgc3RhdGUucG9zO1xuICAgICAgaWYgKHBvcyAmJiB0aGlzLl9zYXZlU2Nyb2xsUG9zaXRpb24pIHtcbiAgICAgICAgVnVlLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB3aW5kb3cuc2Nyb2xsVG8ocG9zLngsIHBvcy55KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGFuY2hvcikge1xuICAgICAgICBWdWUubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFuY2hvci5zbGljZSgxKSk7XG4gICAgICAgICAgaWYgKGVsKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2Nyb2xsVG8od2luZG93LnNjcm9sbFgsIGVsLm9mZnNldFRvcCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFJvdXRlcjtcbiAgfSkoKTtcblxuICBmdW5jdGlvbiBndWFyZENvbXBvbmVudChwYXRoLCBoYW5kbGVyKSB7XG4gICAgdmFyIGNvbXAgPSBoYW5kbGVyLmNvbXBvbmVudDtcbiAgICBpZiAoVnVlLnV0aWwuaXNQbGFpbk9iamVjdChjb21wKSkge1xuICAgICAgY29tcCA9IGhhbmRsZXIuY29tcG9uZW50ID0gVnVlLmV4dGVuZChjb21wKTtcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKHR5cGVvZiBjb21wICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBoYW5kbGVyLmNvbXBvbmVudCA9IG51bGw7XG4gICAgICB3YXJuJDEoJ2ludmFsaWQgY29tcG9uZW50IGZvciByb3V0ZSBcIicgKyBwYXRoICsgJ1wiLicpO1xuICAgIH1cbiAgfVxuXG4gIC8qIEluc3RhbGxhdGlvbiAqL1xuXG4gIFJvdXRlci5pbnN0YWxsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogSW5zdGFsbGF0aW9uIGludGVyZmFjZS5cbiAgICogSW5zdGFsbCB0aGUgbmVjZXNzYXJ5IGRpcmVjdGl2ZXMuXG4gICAqL1xuXG4gIFJvdXRlci5pbnN0YWxsID0gZnVuY3Rpb24gKGV4dGVybmFsVnVlKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKFJvdXRlci5pbnN0YWxsZWQpIHtcbiAgICAgIHdhcm4kMSgnYWxyZWFkeSBpbnN0YWxsZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFZ1ZSA9IGV4dGVybmFsVnVlO1xuICAgIGFwcGx5T3ZlcnJpZGUoVnVlKTtcbiAgICBWaWV3KFZ1ZSk7XG4gICAgTGluayhWdWUpO1xuICAgIGV4cG9ydHMkMS5WdWUgPSBWdWU7XG4gICAgUm91dGVyLmluc3RhbGxlZCA9IHRydWU7XG4gIH07XG5cbiAgLy8gYXV0byBpbnN0YWxsXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZ1ZSkge1xuICAgIHdpbmRvdy5WdWUudXNlKFJvdXRlcik7XG4gIH1cblxuICByZXR1cm4gUm91dGVyO1xuXG59KSk7IiwiLyohXG4gKiBWdWUuanMgdjEuMC4yNlxuICogKGMpIDIwMTYgRXZhbiBZb3VcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBzZXQob2JqLCBrZXksIHZhbCkge1xuICBpZiAoaGFzT3duKG9iaiwga2V5KSkge1xuICAgIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAob2JqLl9pc1Z1ZSkge1xuICAgIHNldChvYmouX2RhdGEsIGtleSwgdmFsKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG9iID0gb2JqLl9fb2JfXztcbiAgaWYgKCFvYikge1xuICAgIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybjtcbiAgfVxuICBvYi5jb252ZXJ0KGtleSwgdmFsKTtcbiAgb2IuZGVwLm5vdGlmeSgpO1xuICBpZiAob2Iudm1zKSB7XG4gICAgdmFyIGkgPSBvYi52bXMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHZhciB2bSA9IG9iLnZtc1tpXTtcbiAgICAgIHZtLl9wcm94eShrZXkpO1xuICAgICAgdm0uX2RpZ2VzdCgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsO1xufVxuXG4vKipcbiAqIERlbGV0ZSBhIHByb3BlcnR5IGFuZCB0cmlnZ2VyIGNoYW5nZSBpZiBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICovXG5cbmZ1bmN0aW9uIGRlbChvYmosIGtleSkge1xuICBpZiAoIWhhc093bihvYmosIGtleSkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZGVsZXRlIG9ialtrZXldO1xuICB2YXIgb2IgPSBvYmouX19vYl9fO1xuICBpZiAoIW9iKSB7XG4gICAgaWYgKG9iai5faXNWdWUpIHtcbiAgICAgIGRlbGV0ZSBvYmouX2RhdGFba2V5XTtcbiAgICAgIG9iai5fZGlnZXN0KCk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICBvYi5kZXAubm90aWZ5KCk7XG4gIGlmIChvYi52bXMpIHtcbiAgICB2YXIgaSA9IG9iLnZtcy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdmFyIHZtID0gb2Iudm1zW2ldO1xuICAgICAgdm0uX3VucHJveHkoa2V5KTtcbiAgICAgIHZtLl9kaWdlc3QoKTtcbiAgICB9XG4gIH1cbn1cblxudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgb2JqZWN0IGhhcyB0aGUgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBoYXNPd24ob2JqLCBrZXkpIHtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGFuIGV4cHJlc3Npb24gaXMgYSBsaXRlcmFsIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBleHBcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxudmFyIGxpdGVyYWxWYWx1ZVJFID0gL15cXHM/KHRydWV8ZmFsc2V8LT9bXFxkXFwuXSt8J1teJ10qJ3xcIlteXCJdKlwiKVxccz8kLztcblxuZnVuY3Rpb24gaXNMaXRlcmFsKGV4cCkge1xuICByZXR1cm4gbGl0ZXJhbFZhbHVlUkUudGVzdChleHApO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgc3RyaW5nIHN0YXJ0cyB3aXRoICQgb3IgX1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaXNSZXNlcnZlZChzdHIpIHtcbiAgdmFyIGMgPSAoc3RyICsgJycpLmNoYXJDb2RlQXQoMCk7XG4gIHJldHVybiBjID09PSAweDI0IHx8IGMgPT09IDB4NUY7XG59XG5cbi8qKlxuICogR3VhcmQgdGV4dCBvdXRwdXQsIG1ha2Ugc3VyZSB1bmRlZmluZWQgb3V0cHV0c1xuICogZW1wdHkgc3RyaW5nXG4gKlxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIF90b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogdmFsdWUudG9TdHJpbmcoKTtcbn1cblxuLyoqXG4gKiBDaGVjayBhbmQgY29udmVydCBwb3NzaWJsZSBudW1lcmljIHN0cmluZ3MgdG8gbnVtYmVyc1xuICogYmVmb3JlIHNldHRpbmcgYmFjayB0byBkYXRhXG4gKlxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybiB7KnxOdW1iZXJ9XG4gKi9cblxuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnNlZCA9IE51bWJlcih2YWx1ZSk7XG4gICAgcmV0dXJuIGlzTmFOKHBhcnNlZCkgPyB2YWx1ZSA6IHBhcnNlZDtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgc3RyaW5nIGJvb2xlYW4gbGl0ZXJhbHMgaW50byByZWFsIGJvb2xlYW5zLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4geyp8Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiB0b0Jvb2xlYW4odmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSAndHJ1ZScgPyB0cnVlIDogdmFsdWUgPT09ICdmYWxzZScgPyBmYWxzZSA6IHZhbHVlO1xufVxuXG4vKipcbiAqIFN0cmlwIHF1b3RlcyBmcm9tIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nIHwgZmFsc2V9XG4gKi9cblxuZnVuY3Rpb24gc3RyaXBRdW90ZXMoc3RyKSB7XG4gIHZhciBhID0gc3RyLmNoYXJDb2RlQXQoMCk7XG4gIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoc3RyLmxlbmd0aCAtIDEpO1xuICByZXR1cm4gYSA9PT0gYiAmJiAoYSA9PT0gMHgyMiB8fCBhID09PSAweDI3KSA/IHN0ci5zbGljZSgxLCAtMSkgOiBzdHI7XG59XG5cbi8qKlxuICogQ2FtZWxpemUgYSBoeXBoZW4tZGVsbWl0ZWQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG52YXIgY2FtZWxpemVSRSA9IC8tKFxcdykvZztcblxuZnVuY3Rpb24gY2FtZWxpemUoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShjYW1lbGl6ZVJFLCB0b1VwcGVyKTtcbn1cblxuZnVuY3Rpb24gdG9VcHBlcihfLCBjKSB7XG4gIHJldHVybiBjID8gYy50b1VwcGVyQ2FzZSgpIDogJyc7XG59XG5cbi8qKlxuICogSHlwaGVuYXRlIGEgY2FtZWxDYXNlIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxudmFyIGh5cGhlbmF0ZVJFID0gLyhbYS16XFxkXSkoW0EtWl0pL2c7XG5cbmZ1bmN0aW9uIGh5cGhlbmF0ZShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKGh5cGhlbmF0ZVJFLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGh5cGhlbi91bmRlcnNjb3JlL3NsYXNoIGRlbGltaXRlcmVkIG5hbWVzIGludG9cbiAqIGNhbWVsaXplZCBjbGFzc05hbWVzLlxuICpcbiAqIGUuZy4gbXktY29tcG9uZW50ID0+IE15Q29tcG9uZW50XG4gKiAgICAgIHNvbWVfZWxzZSAgICA9PiBTb21lRWxzZVxuICogICAgICBzb21lL2NvbXAgICAgPT4gU29tZUNvbXBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxudmFyIGNsYXNzaWZ5UkUgPSAvKD86XnxbLV9cXC9dKShcXHcpL2c7XG5cbmZ1bmN0aW9uIGNsYXNzaWZ5KHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoY2xhc3NpZnlSRSwgdG9VcHBlcik7XG59XG5cbi8qKlxuICogU2ltcGxlIGJpbmQsIGZhc3RlciB0aGFuIG5hdGl2ZVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBiaW5kKGZuLCBjdHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHJldHVybiBsID8gbCA+IDEgPyBmbi5hcHBseShjdHgsIGFyZ3VtZW50cykgOiBmbi5jYWxsKGN0eCwgYSkgOiBmbi5jYWxsKGN0eCk7XG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydCBhbiBBcnJheS1saWtlIG9iamVjdCB0byBhIHJlYWwgQXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheS1saWtlfSBsaXN0XG4gKiBAcGFyYW0ge051bWJlcn0gW3N0YXJ0XSAtIHN0YXJ0IGluZGV4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiB0b0FycmF5KGxpc3QsIHN0YXJ0KSB7XG4gIHN0YXJ0ID0gc3RhcnQgfHwgMDtcbiAgdmFyIGkgPSBsaXN0Lmxlbmd0aCAtIHN0YXJ0O1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGkpO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgcmV0W2ldID0gbGlzdFtpICsgc3RhcnRdO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogTWl4IHByb3BlcnRpZXMgaW50byB0YXJnZXQgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB0b1xuICogQHBhcmFtIHtPYmplY3R9IGZyb21cbiAqL1xuXG5mdW5jdGlvbiBleHRlbmQodG8sIGZyb20pIHtcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhmcm9tKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIHRvW2tleXNbaV1dID0gZnJvbVtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gdG87XG59XG5cbi8qKlxuICogUXVpY2sgb2JqZWN0IGNoZWNrIC0gdGhpcyBpcyBwcmltYXJpbHkgdXNlZCB0byB0ZWxsXG4gKiBPYmplY3RzIGZyb20gcHJpbWl0aXZlIHZhbHVlcyB3aGVuIHdlIGtub3cgdGhlIHZhbHVlXG4gKiBpcyBhIEpTT04tY29tcGxpYW50IHR5cGUuXG4gKlxuICogQHBhcmFtIHsqfSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gIHJldHVybiBvYmogIT09IG51bGwgJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogU3RyaWN0IG9iamVjdCB0eXBlIGNoZWNrLiBPbmx5IHJldHVybnMgdHJ1ZVxuICogZm9yIHBsYWluIEphdmFTY3JpcHQgb2JqZWN0cy5cbiAqXG4gKiBAcGFyYW0geyp9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIE9CSkVDVF9TVFJJTkcgPSAnW29iamVjdCBPYmplY3RdJztcblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gT0JKRUNUX1NUUklORztcbn1cblxuLyoqXG4gKiBBcnJheSB0eXBlIGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7Kn0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuLyoqXG4gKiBEZWZpbmUgYSBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHBhcmFtIHtCb29sZWFufSBbZW51bWVyYWJsZV1cbiAqL1xuXG5mdW5jdGlvbiBkZWYob2JqLCBrZXksIHZhbCwgZW51bWVyYWJsZSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICB2YWx1ZTogdmFsLFxuICAgIGVudW1lcmFibGU6ICEhZW51bWVyYWJsZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgfSk7XG59XG5cbi8qKlxuICogRGVib3VuY2UgYSBmdW5jdGlvbiBzbyBpdCBvbmx5IGdldHMgY2FsbGVkIGFmdGVyIHRoZVxuICogaW5wdXQgc3RvcHMgYXJyaXZpbmcgYWZ0ZXIgdGhlIGdpdmVuIHdhaXQgcGVyaW9kLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmNcbiAqIEBwYXJhbSB7TnVtYmVyfSB3YWl0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gLSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uXG4gKi9cblxuZnVuY3Rpb24gX2RlYm91bmNlKGZ1bmMsIHdhaXQpIHtcbiAgdmFyIHRpbWVvdXQsIGFyZ3MsIGNvbnRleHQsIHRpbWVzdGFtcCwgcmVzdWx0O1xuICB2YXIgbGF0ZXIgPSBmdW5jdGlvbiBsYXRlcigpIHtcbiAgICB2YXIgbGFzdCA9IERhdGUubm93KCkgLSB0aW1lc3RhbXA7XG4gICAgaWYgKGxhc3QgPCB3YWl0ICYmIGxhc3QgPj0gMCkge1xuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgfVxuICB9O1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGNvbnRleHQgPSB0aGlzO1xuICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cblxuLyoqXG4gKiBNYW51YWwgaW5kZXhPZiBiZWNhdXNlIGl0J3Mgc2xpZ2h0bHkgZmFzdGVyIHRoYW5cbiAqIG5hdGl2ZS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7Kn0gb2JqXG4gKi9cblxuZnVuY3Rpb24gaW5kZXhPZihhcnIsIG9iaikge1xuICB2YXIgaSA9IGFyci5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBpZiAoYXJyW2ldID09PSBvYmopIHJldHVybiBpO1xuICB9XG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBNYWtlIGEgY2FuY2VsbGFibGUgdmVyc2lvbiBvZiBhbiBhc3luYyBjYWxsYmFjay5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gY2FuY2VsbGFibGUoZm4pIHtcbiAgdmFyIGNiID0gZnVuY3Rpb24gY2IoKSB7XG4gICAgaWYgKCFjYi5jYW5jZWxsZWQpIHtcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcbiAgY2IuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgIGNiLmNhbmNlbGxlZCA9IHRydWU7XG4gIH07XG4gIHJldHVybiBjYjtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0d28gdmFsdWVzIGFyZSBsb29zZWx5IGVxdWFsIC0gdGhhdCBpcyxcbiAqIGlmIHRoZXkgYXJlIHBsYWluIG9iamVjdHMsIGRvIHRoZXkgaGF2ZSB0aGUgc2FtZSBzaGFwZT9cbiAqXG4gKiBAcGFyYW0geyp9IGFcbiAqIEBwYXJhbSB7Kn0gYlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBsb29zZUVxdWFsKGEsIGIpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgZXFlcWVxICovXG4gIHJldHVybiBhID09IGIgfHwgKGlzT2JqZWN0KGEpICYmIGlzT2JqZWN0KGIpID8gSlNPTi5zdHJpbmdpZnkoYSkgPT09IEpTT04uc3RyaW5naWZ5KGIpIDogZmFsc2UpO1xuICAvKiBlc2xpbnQtZW5hYmxlIGVxZXFlcSAqL1xufVxuXG52YXIgaGFzUHJvdG8gPSAoJ19fcHJvdG9fXycgaW4ge30pO1xuXG4vLyBCcm93c2VyIGVudmlyb25tZW50IHNuaWZmaW5nXG52YXIgaW5Ccm93c2VyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHdpbmRvdykgIT09ICdbb2JqZWN0IE9iamVjdF0nO1xuXG4vLyBkZXRlY3QgZGV2dG9vbHNcbnZhciBkZXZ0b29scyA9IGluQnJvd3NlciAmJiB3aW5kb3cuX19WVUVfREVWVE9PTFNfR0xPQkFMX0hPT0tfXztcblxuLy8gVUEgc25pZmZpbmcgZm9yIHdvcmtpbmcgYXJvdW5kIGJyb3dzZXItc3BlY2lmaWMgcXVpcmtzXG52YXIgVUEgPSBpbkJyb3dzZXIgJiYgd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcbnZhciBpc0lFID0gVUEgJiYgVUEuaW5kZXhPZigndHJpZGVudCcpID4gMDtcbnZhciBpc0lFOSA9IFVBICYmIFVBLmluZGV4T2YoJ21zaWUgOS4wJykgPiAwO1xudmFyIGlzQW5kcm9pZCA9IFVBICYmIFVBLmluZGV4T2YoJ2FuZHJvaWQnKSA+IDA7XG52YXIgaXNJb3MgPSBVQSAmJiAvKGlwaG9uZXxpcGFkfGlwb2R8aW9zKS9pLnRlc3QoVUEpO1xudmFyIGlvc1ZlcnNpb25NYXRjaCA9IGlzSW9zICYmIFVBLm1hdGNoKC9vcyAoW1xcZF9dKykvKTtcbnZhciBpb3NWZXJzaW9uID0gaW9zVmVyc2lvbk1hdGNoICYmIGlvc1ZlcnNpb25NYXRjaFsxXS5zcGxpdCgnXycpO1xuXG4vLyBkZXRlY3RpbmcgaU9TIFVJV2ViVmlldyBieSBpbmRleGVkREJcbnZhciBoYXNNdXRhdGlvbk9ic2VydmVyQnVnID0gaW9zVmVyc2lvbiAmJiBOdW1iZXIoaW9zVmVyc2lvblswXSkgPj0gOSAmJiBOdW1iZXIoaW9zVmVyc2lvblsxXSkgPj0gMyAmJiAhd2luZG93LmluZGV4ZWREQjtcblxudmFyIHRyYW5zaXRpb25Qcm9wID0gdW5kZWZpbmVkO1xudmFyIHRyYW5zaXRpb25FbmRFdmVudCA9IHVuZGVmaW5lZDtcbnZhciBhbmltYXRpb25Qcm9wID0gdW5kZWZpbmVkO1xudmFyIGFuaW1hdGlvbkVuZEV2ZW50ID0gdW5kZWZpbmVkO1xuXG4vLyBUcmFuc2l0aW9uIHByb3BlcnR5L2V2ZW50IHNuaWZmaW5nXG5pZiAoaW5Ccm93c2VyICYmICFpc0lFOSkge1xuICB2YXIgaXNXZWJraXRUcmFucyA9IHdpbmRvdy5vbnRyYW5zaXRpb25lbmQgPT09IHVuZGVmaW5lZCAmJiB3aW5kb3cub253ZWJraXR0cmFuc2l0aW9uZW5kICE9PSB1bmRlZmluZWQ7XG4gIHZhciBpc1dlYmtpdEFuaW0gPSB3aW5kb3cub25hbmltYXRpb25lbmQgPT09IHVuZGVmaW5lZCAmJiB3aW5kb3cub253ZWJraXRhbmltYXRpb25lbmQgIT09IHVuZGVmaW5lZDtcbiAgdHJhbnNpdGlvblByb3AgPSBpc1dlYmtpdFRyYW5zID8gJ1dlYmtpdFRyYW5zaXRpb24nIDogJ3RyYW5zaXRpb24nO1xuICB0cmFuc2l0aW9uRW5kRXZlbnQgPSBpc1dlYmtpdFRyYW5zID8gJ3dlYmtpdFRyYW5zaXRpb25FbmQnIDogJ3RyYW5zaXRpb25lbmQnO1xuICBhbmltYXRpb25Qcm9wID0gaXNXZWJraXRBbmltID8gJ1dlYmtpdEFuaW1hdGlvbicgOiAnYW5pbWF0aW9uJztcbiAgYW5pbWF0aW9uRW5kRXZlbnQgPSBpc1dlYmtpdEFuaW0gPyAnd2Via2l0QW5pbWF0aW9uRW5kJyA6ICdhbmltYXRpb25lbmQnO1xufVxuXG4vKipcbiAqIERlZmVyIGEgdGFzayB0byBleGVjdXRlIGl0IGFzeW5jaHJvbm91c2x5LiBJZGVhbGx5IHRoaXNcbiAqIHNob3VsZCBiZSBleGVjdXRlZCBhcyBhIG1pY3JvdGFzaywgc28gd2UgbGV2ZXJhZ2VcbiAqIE11dGF0aW9uT2JzZXJ2ZXIgaWYgaXQncyBhdmFpbGFibGUsIGFuZCBmYWxsYmFjayB0b1xuICogc2V0VGltZW91dCgwKS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICogQHBhcmFtIHtPYmplY3R9IGN0eFxuICovXG5cbnZhciBuZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBjYWxsYmFja3MgPSBbXTtcbiAgdmFyIHBlbmRpbmcgPSBmYWxzZTtcbiAgdmFyIHRpbWVyRnVuYztcbiAgZnVuY3Rpb24gbmV4dFRpY2tIYW5kbGVyKCkge1xuICAgIHBlbmRpbmcgPSBmYWxzZTtcbiAgICB2YXIgY29waWVzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGNhbGxiYWNrcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29waWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb3BpZXNbaV0oKTtcbiAgICB9XG4gIH1cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKHR5cGVvZiBNdXRhdGlvbk9ic2VydmVyICE9PSAndW5kZWZpbmVkJyAmJiAhaGFzTXV0YXRpb25PYnNlcnZlckJ1Zykge1xuICAgIHZhciBjb3VudGVyID0gMTtcbiAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihuZXh0VGlja0hhbmRsZXIpO1xuICAgIHZhciB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNvdW50ZXIpO1xuICAgIG9ic2VydmVyLm9ic2VydmUodGV4dE5vZGUsIHtcbiAgICAgIGNoYXJhY3RlckRhdGE6IHRydWVcbiAgICB9KTtcbiAgICB0aW1lckZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb3VudGVyID0gKGNvdW50ZXIgKyAxKSAlIDI7XG4gICAgICB0ZXh0Tm9kZS5kYXRhID0gY291bnRlcjtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIC8vIHdlYnBhY2sgYXR0ZW1wdHMgdG8gaW5qZWN0IGEgc2hpbSBmb3Igc2V0SW1tZWRpYXRlXG4gICAgLy8gaWYgaXQgaXMgdXNlZCBhcyBhIGdsb2JhbCwgc28gd2UgaGF2ZSB0byB3b3JrIGFyb3VuZCB0aGF0IHRvXG4gICAgLy8gYXZvaWQgYnVuZGxpbmcgdW5uZWNlc3NhcnkgY29kZS5cbiAgICB2YXIgY29udGV4dCA9IGluQnJvd3NlciA/IHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDoge307XG4gICAgdGltZXJGdW5jID0gY29udGV4dC5zZXRJbW1lZGlhdGUgfHwgc2V0VGltZW91dDtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKGNiLCBjdHgpIHtcbiAgICB2YXIgZnVuYyA9IGN0eCA/IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNiLmNhbGwoY3R4KTtcbiAgICB9IDogY2I7XG4gICAgY2FsbGJhY2tzLnB1c2goZnVuYyk7XG4gICAgaWYgKHBlbmRpbmcpIHJldHVybjtcbiAgICBwZW5kaW5nID0gdHJ1ZTtcbiAgICB0aW1lckZ1bmMobmV4dFRpY2tIYW5kbGVyLCAwKTtcbiAgfTtcbn0pKCk7XG5cbnZhciBfU2V0ID0gdW5kZWZpbmVkO1xuLyogaXN0YW5idWwgaWdub3JlIGlmICovXG5pZiAodHlwZW9mIFNldCAhPT0gJ3VuZGVmaW5lZCcgJiYgU2V0LnRvU3RyaW5nKCkubWF0Y2goL25hdGl2ZSBjb2RlLykpIHtcbiAgLy8gdXNlIG5hdGl2ZSBTZXQgd2hlbiBhdmFpbGFibGUuXG4gIF9TZXQgPSBTZXQ7XG59IGVsc2Uge1xuICAvLyBhIG5vbi1zdGFuZGFyZCBTZXQgcG9seWZpbGwgdGhhdCBvbmx5IHdvcmtzIHdpdGggcHJpbWl0aXZlIGtleXMuXG4gIF9TZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB9O1xuICBfU2V0LnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0W2tleV0gIT09IHVuZGVmaW5lZDtcbiAgfTtcbiAgX1NldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHRoaXMuc2V0W2tleV0gPSAxO1xuICB9O1xuICBfU2V0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIENhY2hlKGxpbWl0KSB7XG4gIHRoaXMuc2l6ZSA9IDA7XG4gIHRoaXMubGltaXQgPSBsaW1pdDtcbiAgdGhpcy5oZWFkID0gdGhpcy50YWlsID0gdW5kZWZpbmVkO1xuICB0aGlzLl9rZXltYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuXG52YXIgcCA9IENhY2hlLnByb3RvdHlwZTtcblxuLyoqXG4gKiBQdXQgPHZhbHVlPiBpbnRvIHRoZSBjYWNoZSBhc3NvY2lhdGVkIHdpdGggPGtleT4uXG4gKiBSZXR1cm5zIHRoZSBlbnRyeSB3aGljaCB3YXMgcmVtb3ZlZCB0byBtYWtlIHJvb20gZm9yXG4gKiB0aGUgbmV3IGVudHJ5LiBPdGhlcndpc2UgdW5kZWZpbmVkIGlzIHJldHVybmVkLlxuICogKGkuZS4gaWYgdGhlcmUgd2FzIGVub3VnaCByb29tIGFscmVhZHkpLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge0VudHJ5fHVuZGVmaW5lZH1cbiAqL1xuXG5wLnB1dCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHZhciByZW1vdmVkO1xuXG4gIHZhciBlbnRyeSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gIGlmICghZW50cnkpIHtcbiAgICBpZiAodGhpcy5zaXplID09PSB0aGlzLmxpbWl0KSB7XG4gICAgICByZW1vdmVkID0gdGhpcy5zaGlmdCgpO1xuICAgIH1cbiAgICBlbnRyeSA9IHtcbiAgICAgIGtleToga2V5XG4gICAgfTtcbiAgICB0aGlzLl9rZXltYXBba2V5XSA9IGVudHJ5O1xuICAgIGlmICh0aGlzLnRhaWwpIHtcbiAgICAgIHRoaXMudGFpbC5uZXdlciA9IGVudHJ5O1xuICAgICAgZW50cnkub2xkZXIgPSB0aGlzLnRhaWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGVhZCA9IGVudHJ5O1xuICAgIH1cbiAgICB0aGlzLnRhaWwgPSBlbnRyeTtcbiAgICB0aGlzLnNpemUrKztcbiAgfVxuICBlbnRyeS52YWx1ZSA9IHZhbHVlO1xuXG4gIHJldHVybiByZW1vdmVkO1xufTtcblxuLyoqXG4gKiBQdXJnZSB0aGUgbGVhc3QgcmVjZW50bHkgdXNlZCAob2xkZXN0KSBlbnRyeSBmcm9tIHRoZVxuICogY2FjaGUuIFJldHVybnMgdGhlIHJlbW92ZWQgZW50cnkgb3IgdW5kZWZpbmVkIGlmIHRoZVxuICogY2FjaGUgd2FzIGVtcHR5LlxuICovXG5cbnAuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBlbnRyeSA9IHRoaXMuaGVhZDtcbiAgaWYgKGVudHJ5KSB7XG4gICAgdGhpcy5oZWFkID0gdGhpcy5oZWFkLm5ld2VyO1xuICAgIHRoaXMuaGVhZC5vbGRlciA9IHVuZGVmaW5lZDtcbiAgICBlbnRyeS5uZXdlciA9IGVudHJ5Lm9sZGVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2tleW1hcFtlbnRyeS5rZXldID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc2l6ZS0tO1xuICB9XG4gIHJldHVybiBlbnRyeTtcbn07XG5cbi8qKlxuICogR2V0IGFuZCByZWdpc3RlciByZWNlbnQgdXNlIG9mIDxrZXk+LiBSZXR1cm5zIHRoZSB2YWx1ZVxuICogYXNzb2NpYXRlZCB3aXRoIDxrZXk+IG9yIHVuZGVmaW5lZCBpZiBub3QgaW4gY2FjaGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtCb29sZWFufSByZXR1cm5FbnRyeVxuICogQHJldHVybiB7RW50cnl8Kn1cbiAqL1xuXG5wLmdldCA9IGZ1bmN0aW9uIChrZXksIHJldHVybkVudHJ5KSB7XG4gIHZhciBlbnRyeSA9IHRoaXMuX2tleW1hcFtrZXldO1xuICBpZiAoZW50cnkgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICBpZiAoZW50cnkgPT09IHRoaXMudGFpbCkge1xuICAgIHJldHVybiByZXR1cm5FbnRyeSA/IGVudHJ5IDogZW50cnkudmFsdWU7XG4gIH1cbiAgLy8gSEVBRC0tLS0tLS0tLS0tLS0tVEFJTFxuICAvLyAgIDwub2xkZXIgICAubmV3ZXI+XG4gIC8vICA8LS0tIGFkZCBkaXJlY3Rpb24gLS1cbiAgLy8gICBBICBCICBDICA8RD4gIEVcbiAgaWYgKGVudHJ5Lm5ld2VyKSB7XG4gICAgaWYgKGVudHJ5ID09PSB0aGlzLmhlYWQpIHtcbiAgICAgIHRoaXMuaGVhZCA9IGVudHJ5Lm5ld2VyO1xuICAgIH1cbiAgICBlbnRyeS5uZXdlci5vbGRlciA9IGVudHJ5Lm9sZGVyOyAvLyBDIDwtLSBFLlxuICB9XG4gIGlmIChlbnRyeS5vbGRlcikge1xuICAgIGVudHJ5Lm9sZGVyLm5ld2VyID0gZW50cnkubmV3ZXI7IC8vIEMuIC0tPiBFXG4gIH1cbiAgZW50cnkubmV3ZXIgPSB1bmRlZmluZWQ7IC8vIEQgLS14XG4gIGVudHJ5Lm9sZGVyID0gdGhpcy50YWlsOyAvLyBELiAtLT4gRVxuICBpZiAodGhpcy50YWlsKSB7XG4gICAgdGhpcy50YWlsLm5ld2VyID0gZW50cnk7IC8vIEUuIDwtLSBEXG4gIH1cbiAgdGhpcy50YWlsID0gZW50cnk7XG4gIHJldHVybiByZXR1cm5FbnRyeSA/IGVudHJ5IDogZW50cnkudmFsdWU7XG59O1xuXG52YXIgY2FjaGUkMSA9IG5ldyBDYWNoZSgxMDAwKTtcbnZhciBmaWx0ZXJUb2tlblJFID0gL1teXFxzJ1wiXSt8J1teJ10qJ3xcIlteXCJdKlwiL2c7XG52YXIgcmVzZXJ2ZWRBcmdSRSA9IC9eaW4kfF4tP1xcZCsvO1xuXG4vKipcbiAqIFBhcnNlciBzdGF0ZVxuICovXG5cbnZhciBzdHI7XG52YXIgZGlyO1xudmFyIGM7XG52YXIgcHJldjtcbnZhciBpO1xudmFyIGw7XG52YXIgbGFzdEZpbHRlckluZGV4O1xudmFyIGluU2luZ2xlO1xudmFyIGluRG91YmxlO1xudmFyIGN1cmx5O1xudmFyIHNxdWFyZTtcbnZhciBwYXJlbjtcbi8qKlxuICogUHVzaCBhIGZpbHRlciB0byB0aGUgY3VycmVudCBkaXJlY3RpdmUgb2JqZWN0XG4gKi9cblxuZnVuY3Rpb24gcHVzaEZpbHRlcigpIHtcbiAgdmFyIGV4cCA9IHN0ci5zbGljZShsYXN0RmlsdGVySW5kZXgsIGkpLnRyaW0oKTtcbiAgdmFyIGZpbHRlcjtcbiAgaWYgKGV4cCkge1xuICAgIGZpbHRlciA9IHt9O1xuICAgIHZhciB0b2tlbnMgPSBleHAubWF0Y2goZmlsdGVyVG9rZW5SRSk7XG4gICAgZmlsdGVyLm5hbWUgPSB0b2tlbnNbMF07XG4gICAgaWYgKHRva2Vucy5sZW5ndGggPiAxKSB7XG4gICAgICBmaWx0ZXIuYXJncyA9IHRva2Vucy5zbGljZSgxKS5tYXAocHJvY2Vzc0ZpbHRlckFyZyk7XG4gICAgfVxuICB9XG4gIGlmIChmaWx0ZXIpIHtcbiAgICAoZGlyLmZpbHRlcnMgPSBkaXIuZmlsdGVycyB8fCBbXSkucHVzaChmaWx0ZXIpO1xuICB9XG4gIGxhc3RGaWx0ZXJJbmRleCA9IGkgKyAxO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGFuIGFyZ3VtZW50IGlzIGR5bmFtaWMgYW5kIHN0cmlwIHF1b3Rlcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYXJnXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gcHJvY2Vzc0ZpbHRlckFyZyhhcmcpIHtcbiAgaWYgKHJlc2VydmVkQXJnUkUudGVzdChhcmcpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB0b051bWJlcihhcmcpLFxuICAgICAgZHluYW1pYzogZmFsc2VcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHZhciBzdHJpcHBlZCA9IHN0cmlwUXVvdGVzKGFyZyk7XG4gICAgdmFyIGR5bmFtaWMgPSBzdHJpcHBlZCA9PT0gYXJnO1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogZHluYW1pYyA/IGFyZyA6IHN0cmlwcGVkLFxuICAgICAgZHluYW1pYzogZHluYW1pY1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSBhIGRpcmVjdGl2ZSB2YWx1ZSBhbmQgZXh0cmFjdCB0aGUgZXhwcmVzc2lvblxuICogYW5kIGl0cyBmaWx0ZXJzIGludG8gYSBkZXNjcmlwdG9yLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogXCJhICsgMSB8IHVwcGVyY2FzZVwiIHdpbGwgeWllbGQ6XG4gKiB7XG4gKiAgIGV4cHJlc3Npb246ICdhICsgMScsXG4gKiAgIGZpbHRlcnM6IFtcbiAqICAgICB7IG5hbWU6ICd1cHBlcmNhc2UnLCBhcmdzOiBudWxsIH1cbiAqICAgXVxuICogfVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gcGFyc2VEaXJlY3RpdmUocykge1xuICB2YXIgaGl0ID0gY2FjaGUkMS5nZXQocyk7XG4gIGlmIChoaXQpIHtcbiAgICByZXR1cm4gaGl0O1xuICB9XG5cbiAgLy8gcmVzZXQgcGFyc2VyIHN0YXRlXG4gIHN0ciA9IHM7XG4gIGluU2luZ2xlID0gaW5Eb3VibGUgPSBmYWxzZTtcbiAgY3VybHkgPSBzcXVhcmUgPSBwYXJlbiA9IDA7XG4gIGxhc3RGaWx0ZXJJbmRleCA9IDA7XG4gIGRpciA9IHt9O1xuXG4gIGZvciAoaSA9IDAsIGwgPSBzdHIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgcHJldiA9IGM7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChpblNpbmdsZSkge1xuICAgICAgLy8gY2hlY2sgc2luZ2xlIHF1b3RlXG4gICAgICBpZiAoYyA9PT0gMHgyNyAmJiBwcmV2ICE9PSAweDVDKSBpblNpbmdsZSA9ICFpblNpbmdsZTtcbiAgICB9IGVsc2UgaWYgKGluRG91YmxlKSB7XG4gICAgICAvLyBjaGVjayBkb3VibGUgcXVvdGVcbiAgICAgIGlmIChjID09PSAweDIyICYmIHByZXYgIT09IDB4NUMpIGluRG91YmxlID0gIWluRG91YmxlO1xuICAgIH0gZWxzZSBpZiAoYyA9PT0gMHg3QyAmJiAvLyBwaXBlXG4gICAgc3RyLmNoYXJDb2RlQXQoaSArIDEpICE9PSAweDdDICYmIHN0ci5jaGFyQ29kZUF0KGkgLSAxKSAhPT0gMHg3Qykge1xuICAgICAgaWYgKGRpci5leHByZXNzaW9uID09IG51bGwpIHtcbiAgICAgICAgLy8gZmlyc3QgZmlsdGVyLCBlbmQgb2YgZXhwcmVzc2lvblxuICAgICAgICBsYXN0RmlsdGVySW5kZXggPSBpICsgMTtcbiAgICAgICAgZGlyLmV4cHJlc3Npb24gPSBzdHIuc2xpY2UoMCwgaSkudHJpbSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWxyZWFkeSBoYXMgZmlsdGVyXG4gICAgICAgIHB1c2hGaWx0ZXIoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoIChjKSB7XG4gICAgICAgIGNhc2UgMHgyMjpcbiAgICAgICAgICBpbkRvdWJsZSA9IHRydWU7YnJlYWs7IC8vIFwiXG4gICAgICAgIGNhc2UgMHgyNzpcbiAgICAgICAgICBpblNpbmdsZSA9IHRydWU7YnJlYWs7IC8vICdcbiAgICAgICAgY2FzZSAweDI4OlxuICAgICAgICAgIHBhcmVuKys7YnJlYWs7IC8vIChcbiAgICAgICAgY2FzZSAweDI5OlxuICAgICAgICAgIHBhcmVuLS07YnJlYWs7IC8vIClcbiAgICAgICAgY2FzZSAweDVCOlxuICAgICAgICAgIHNxdWFyZSsrO2JyZWFrOyAvLyBbXG4gICAgICAgIGNhc2UgMHg1RDpcbiAgICAgICAgICBzcXVhcmUtLTticmVhazsgLy8gXVxuICAgICAgICBjYXNlIDB4N0I6XG4gICAgICAgICAgY3VybHkrKzticmVhazsgLy8ge1xuICAgICAgICBjYXNlIDB4N0Q6XG4gICAgICAgICAgY3VybHktLTticmVhazsgLy8gfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChkaXIuZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgZGlyLmV4cHJlc3Npb24gPSBzdHIuc2xpY2UoMCwgaSkudHJpbSgpO1xuICB9IGVsc2UgaWYgKGxhc3RGaWx0ZXJJbmRleCAhPT0gMCkge1xuICAgIHB1c2hGaWx0ZXIoKTtcbiAgfVxuXG4gIGNhY2hlJDEucHV0KHMsIGRpcik7XG4gIHJldHVybiBkaXI7XG59XG5cbnZhciBkaXJlY3RpdmUgPSBPYmplY3QuZnJlZXplKHtcbiAgcGFyc2VEaXJlY3RpdmU6IHBhcnNlRGlyZWN0aXZlXG59KTtcblxudmFyIHJlZ2V4RXNjYXBlUkUgPSAvWy0uKis/XiR7fSgpfFtcXF1cXC9cXFxcXS9nO1xudmFyIGNhY2hlID0gdW5kZWZpbmVkO1xudmFyIHRhZ1JFID0gdW5kZWZpbmVkO1xudmFyIGh0bWxSRSA9IHVuZGVmaW5lZDtcbi8qKlxuICogRXNjYXBlIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSB1c2VkIGluIGEgUmVnRXhwXG4gKiBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKi9cblxuZnVuY3Rpb24gZXNjYXBlUmVnZXgoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZWdleEVzY2FwZVJFLCAnXFxcXCQmJyk7XG59XG5cbmZ1bmN0aW9uIGNvbXBpbGVSZWdleCgpIHtcbiAgdmFyIG9wZW4gPSBlc2NhcGVSZWdleChjb25maWcuZGVsaW1pdGVyc1swXSk7XG4gIHZhciBjbG9zZSA9IGVzY2FwZVJlZ2V4KGNvbmZpZy5kZWxpbWl0ZXJzWzFdKTtcbiAgdmFyIHVuc2FmZU9wZW4gPSBlc2NhcGVSZWdleChjb25maWcudW5zYWZlRGVsaW1pdGVyc1swXSk7XG4gIHZhciB1bnNhZmVDbG9zZSA9IGVzY2FwZVJlZ2V4KGNvbmZpZy51bnNhZmVEZWxpbWl0ZXJzWzFdKTtcbiAgdGFnUkUgPSBuZXcgUmVnRXhwKHVuc2FmZU9wZW4gKyAnKCg/Oi58XFxcXG4pKz8pJyArIHVuc2FmZUNsb3NlICsgJ3wnICsgb3BlbiArICcoKD86LnxcXFxcbikrPyknICsgY2xvc2UsICdnJyk7XG4gIGh0bWxSRSA9IG5ldyBSZWdFeHAoJ14nICsgdW5zYWZlT3BlbiArICcoKD86LnxcXFxcbikrPyknICsgdW5zYWZlQ2xvc2UgKyAnJCcpO1xuICAvLyByZXNldCBjYWNoZVxuICBjYWNoZSA9IG5ldyBDYWNoZSgxMDAwKTtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIHRlbXBsYXRlIHRleHQgc3RyaW5nIGludG8gYW4gYXJyYXkgb2YgdG9rZW5zLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0XG4gKiBAcmV0dXJuIHtBcnJheTxPYmplY3Q+IHwgbnVsbH1cbiAqICAgICAgICAgICAgICAgLSB7U3RyaW5nfSB0eXBlXG4gKiAgICAgICAgICAgICAgIC0ge1N0cmluZ30gdmFsdWVcbiAqICAgICAgICAgICAgICAgLSB7Qm9vbGVhbn0gW2h0bWxdXG4gKiAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IFtvbmVUaW1lXVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlVGV4dCh0ZXh0KSB7XG4gIGlmICghY2FjaGUpIHtcbiAgICBjb21waWxlUmVnZXgoKTtcbiAgfVxuICB2YXIgaGl0ID0gY2FjaGUuZ2V0KHRleHQpO1xuICBpZiAoaGl0KSB7XG4gICAgcmV0dXJuIGhpdDtcbiAgfVxuICBpZiAoIXRhZ1JFLnRlc3QodGV4dCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgdG9rZW5zID0gW107XG4gIHZhciBsYXN0SW5kZXggPSB0YWdSRS5sYXN0SW5kZXggPSAwO1xuICB2YXIgbWF0Y2gsIGluZGV4LCBodG1sLCB2YWx1ZSwgZmlyc3QsIG9uZVRpbWU7XG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbmQtYXNzaWduICovXG4gIHdoaWxlIChtYXRjaCA9IHRhZ1JFLmV4ZWModGV4dCkpIHtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbmQtYXNzaWduICovXG4gICAgaW5kZXggPSBtYXRjaC5pbmRleDtcbiAgICAvLyBwdXNoIHRleHQgdG9rZW5cbiAgICBpZiAoaW5kZXggPiBsYXN0SW5kZXgpIHtcbiAgICAgIHRva2Vucy5wdXNoKHtcbiAgICAgICAgdmFsdWU6IHRleHQuc2xpY2UobGFzdEluZGV4LCBpbmRleClcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyB0YWcgdG9rZW5cbiAgICBodG1sID0gaHRtbFJFLnRlc3QobWF0Y2hbMF0pO1xuICAgIHZhbHVlID0gaHRtbCA/IG1hdGNoWzFdIDogbWF0Y2hbMl07XG4gICAgZmlyc3QgPSB2YWx1ZS5jaGFyQ29kZUF0KDApO1xuICAgIG9uZVRpbWUgPSBmaXJzdCA9PT0gNDI7IC8vICpcbiAgICB2YWx1ZSA9IG9uZVRpbWUgPyB2YWx1ZS5zbGljZSgxKSA6IHZhbHVlO1xuICAgIHRva2Vucy5wdXNoKHtcbiAgICAgIHRhZzogdHJ1ZSxcbiAgICAgIHZhbHVlOiB2YWx1ZS50cmltKCksXG4gICAgICBodG1sOiBodG1sLFxuICAgICAgb25lVGltZTogb25lVGltZVxuICAgIH0pO1xuICAgIGxhc3RJbmRleCA9IGluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICB9XG4gIGlmIChsYXN0SW5kZXggPCB0ZXh0Lmxlbmd0aCkge1xuICAgIHRva2Vucy5wdXNoKHtcbiAgICAgIHZhbHVlOiB0ZXh0LnNsaWNlKGxhc3RJbmRleClcbiAgICB9KTtcbiAgfVxuICBjYWNoZS5wdXQodGV4dCwgdG9rZW5zKTtcbiAgcmV0dXJuIHRva2Vucztcbn1cblxuLyoqXG4gKiBGb3JtYXQgYSBsaXN0IG9mIHRva2VucyBpbnRvIGFuIGV4cHJlc3Npb24uXG4gKiBlLmcuIHRva2VucyBwYXJzZWQgZnJvbSAnYSB7e2J9fSBjJyBjYW4gYmUgc2VyaWFsaXplZFxuICogaW50byBvbmUgc2luZ2xlIGV4cHJlc3Npb24gYXMgJ1wiYSBcIiArIGIgKyBcIiBjXCInLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHRva2Vuc1xuICogQHBhcmFtIHtWdWV9IFt2bV1cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiB0b2tlbnNUb0V4cCh0b2tlbnMsIHZtKSB7XG4gIGlmICh0b2tlbnMubGVuZ3RoID4gMSkge1xuICAgIHJldHVybiB0b2tlbnMubWFwKGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgcmV0dXJuIGZvcm1hdFRva2VuKHRva2VuLCB2bSk7XG4gICAgfSkuam9pbignKycpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmb3JtYXRUb2tlbih0b2tlbnNbMF0sIHZtLCB0cnVlKTtcbiAgfVxufVxuXG4vKipcbiAqIEZvcm1hdCBhIHNpbmdsZSB0b2tlbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdG9rZW5cbiAqIEBwYXJhbSB7VnVlfSBbdm1dXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtzaW5nbGVdXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0VG9rZW4odG9rZW4sIHZtLCBzaW5nbGUpIHtcbiAgcmV0dXJuIHRva2VuLnRhZyA/IHRva2VuLm9uZVRpbWUgJiYgdm0gPyAnXCInICsgdm0uJGV2YWwodG9rZW4udmFsdWUpICsgJ1wiJyA6IGlubGluZUZpbHRlcnModG9rZW4udmFsdWUsIHNpbmdsZSkgOiAnXCInICsgdG9rZW4udmFsdWUgKyAnXCInO1xufVxuXG4vKipcbiAqIEZvciBhbiBhdHRyaWJ1dGUgd2l0aCBtdWx0aXBsZSBpbnRlcnBvbGF0aW9uIHRhZ3MsXG4gKiBlLmcuIGF0dHI9XCJzb21lLXt7dGhpbmcgfCBmaWx0ZXJ9fVwiLCBpbiBvcmRlciB0byBjb21iaW5lXG4gKiB0aGUgd2hvbGUgdGhpbmcgaW50byBhIHNpbmdsZSB3YXRjaGFibGUgZXhwcmVzc2lvbiwgd2VcbiAqIGhhdmUgdG8gaW5saW5lIHRob3NlIGZpbHRlcnMuIFRoaXMgZnVuY3Rpb24gZG9lcyBleGFjdGx5XG4gKiB0aGF0LiBUaGlzIGlzIGEgYml0IGhhY2t5IGJ1dCBpdCBhdm9pZHMgaGVhdnkgY2hhbmdlc1xuICogdG8gZGlyZWN0aXZlIHBhcnNlciBhbmQgd2F0Y2hlciBtZWNoYW5pc20uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV4cFxuICogQHBhcmFtIHtCb29sZWFufSBzaW5nbGVcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG52YXIgZmlsdGVyUkUgPSAvW158XVxcfFtefF0vO1xuZnVuY3Rpb24gaW5saW5lRmlsdGVycyhleHAsIHNpbmdsZSkge1xuICBpZiAoIWZpbHRlclJFLnRlc3QoZXhwKSkge1xuICAgIHJldHVybiBzaW5nbGUgPyBleHAgOiAnKCcgKyBleHAgKyAnKSc7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGRpciA9IHBhcnNlRGlyZWN0aXZlKGV4cCk7XG4gICAgaWYgKCFkaXIuZmlsdGVycykge1xuICAgICAgcmV0dXJuICcoJyArIGV4cCArICcpJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICd0aGlzLl9hcHBseUZpbHRlcnMoJyArIGRpci5leHByZXNzaW9uICsgLy8gdmFsdWVcbiAgICAgICcsbnVsbCwnICsgLy8gb2xkVmFsdWUgKG51bGwgZm9yIHJlYWQpXG4gICAgICBKU09OLnN0cmluZ2lmeShkaXIuZmlsdGVycykgKyAvLyBmaWx0ZXIgZGVzY3JpcHRvcnNcbiAgICAgICcsZmFsc2UpJzsgLy8gd3JpdGU/XG4gICAgfVxuICB9XG59XG5cbnZhciB0ZXh0ID0gT2JqZWN0LmZyZWV6ZSh7XG4gIGNvbXBpbGVSZWdleDogY29tcGlsZVJlZ2V4LFxuICBwYXJzZVRleHQ6IHBhcnNlVGV4dCxcbiAgdG9rZW5zVG9FeHA6IHRva2Vuc1RvRXhwXG59KTtcblxudmFyIGRlbGltaXRlcnMgPSBbJ3t7JywgJ319J107XG52YXIgdW5zYWZlRGVsaW1pdGVycyA9IFsne3t7JywgJ319fSddO1xuXG52YXIgY29uZmlnID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoe1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHByaW50IGRlYnVnIG1lc3NhZ2VzLlxuICAgKiBBbHNvIGVuYWJsZXMgc3RhY2sgdHJhY2UgZm9yIHdhcm5pbmdzLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZGVidWc6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHN1cHByZXNzIHdhcm5pbmdzLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc2lsZW50OiBmYWxzZSxcblxuICAvKipcbiAgICogV2hldGhlciB0byB1c2UgYXN5bmMgcmVuZGVyaW5nLlxuICAgKi9cblxuICBhc3luYzogdHJ1ZSxcblxuICAvKipcbiAgICogV2hldGhlciB0byB3YXJuIGFnYWluc3QgZXJyb3JzIGNhdWdodCB3aGVuIGV2YWx1YXRpbmdcbiAgICogZXhwcmVzc2lvbnMuXG4gICAqL1xuXG4gIHdhcm5FeHByZXNzaW9uRXJyb3JzOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGFsbG93IGRldnRvb2xzIGluc3BlY3Rpb24uXG4gICAqIERpc2FibGVkIGJ5IGRlZmF1bHQgaW4gcHJvZHVjdGlvbiBidWlsZHMuXG4gICAqL1xuXG4gIGRldnRvb2xzOiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nLFxuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCBmbGFnIHRvIGluZGljYXRlIHRoZSBkZWxpbWl0ZXJzIGhhdmUgYmVlblxuICAgKiBjaGFuZ2VkLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG5cbiAgX2RlbGltaXRlcnNDaGFuZ2VkOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBMaXN0IG9mIGFzc2V0IHR5cGVzIHRoYXQgYSBjb21wb25lbnQgY2FuIG93bi5cbiAgICpcbiAgICogQHR5cGUge0FycmF5fVxuICAgKi9cblxuICBfYXNzZXRUeXBlczogWydjb21wb25lbnQnLCAnZGlyZWN0aXZlJywgJ2VsZW1lbnREaXJlY3RpdmUnLCAnZmlsdGVyJywgJ3RyYW5zaXRpb24nLCAncGFydGlhbCddLFxuXG4gIC8qKlxuICAgKiBwcm9wIGJpbmRpbmcgbW9kZXNcbiAgICovXG5cbiAgX3Byb3BCaW5kaW5nTW9kZXM6IHtcbiAgICBPTkVfV0FZOiAwLFxuICAgIFRXT19XQVk6IDEsXG4gICAgT05FX1RJTUU6IDJcbiAgfSxcblxuICAvKipcbiAgICogTWF4IGNpcmN1bGFyIHVwZGF0ZXMgYWxsb3dlZCBpbiBhIGJhdGNoZXIgZmx1c2ggY3ljbGUuXG4gICAqL1xuXG4gIF9tYXhVcGRhdGVDb3VudDogMTAwXG5cbn0sIHtcbiAgZGVsaW1pdGVyczogeyAvKipcbiAgICAgICAgICAgICAgICAgKiBJbnRlcnBvbGF0aW9uIGRlbGltaXRlcnMuIENoYW5naW5nIHRoZXNlIHdvdWxkIHRyaWdnZXJcbiAgICAgICAgICAgICAgICAgKiB0aGUgdGV4dCBwYXJzZXIgdG8gcmUtY29tcGlsZSB0aGUgcmVndWxhciBleHByZXNzaW9ucy5cbiAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAqIEB0eXBlIHtBcnJheTxTdHJpbmc+fVxuICAgICAgICAgICAgICAgICAqL1xuXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gZGVsaW1pdGVycztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHZhbCkge1xuICAgICAgZGVsaW1pdGVycyA9IHZhbDtcbiAgICAgIGNvbXBpbGVSZWdleCgpO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSxcbiAgdW5zYWZlRGVsaW1pdGVyczoge1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHVuc2FmZURlbGltaXRlcnM7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWwpIHtcbiAgICAgIHVuc2FmZURlbGltaXRlcnMgPSB2YWw7XG4gICAgICBjb21waWxlUmVnZXgoKTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH1cbn0pO1xuXG52YXIgd2FybiA9IHVuZGVmaW5lZDtcbnZhciBmb3JtYXRDb21wb25lbnROYW1lID0gdW5kZWZpbmVkO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBoYXNDb25zb2xlID0gdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnO1xuXG4gICAgd2FybiA9IGZ1bmN0aW9uIChtc2csIHZtKSB7XG4gICAgICBpZiAoaGFzQ29uc29sZSAmJiAhY29uZmlnLnNpbGVudCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIHdhcm5dOiAnICsgbXNnICsgKHZtID8gZm9ybWF0Q29tcG9uZW50TmFtZSh2bSkgOiAnJykpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmb3JtYXRDb21wb25lbnROYW1lID0gZnVuY3Rpb24gKHZtKSB7XG4gICAgICB2YXIgbmFtZSA9IHZtLl9pc1Z1ZSA/IHZtLiRvcHRpb25zLm5hbWUgOiB2bS5uYW1lO1xuICAgICAgcmV0dXJuIG5hbWUgPyAnIChmb3VuZCBpbiBjb21wb25lbnQ6IDwnICsgaHlwaGVuYXRlKG5hbWUpICsgJz4pJyA6ICcnO1xuICAgIH07XG4gIH0pKCk7XG59XG5cbi8qKlxuICogQXBwZW5kIHdpdGggdHJhbnNpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKi9cblxuZnVuY3Rpb24gYXBwZW5kV2l0aFRyYW5zaXRpb24oZWwsIHRhcmdldCwgdm0sIGNiKSB7XG4gIGFwcGx5VHJhbnNpdGlvbihlbCwgMSwgZnVuY3Rpb24gKCkge1xuICAgIHRhcmdldC5hcHBlbmRDaGlsZChlbCk7XG4gIH0sIHZtLCBjYik7XG59XG5cbi8qKlxuICogSW5zZXJ0QmVmb3JlIHdpdGggdHJhbnNpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKi9cblxuZnVuY3Rpb24gYmVmb3JlV2l0aFRyYW5zaXRpb24oZWwsIHRhcmdldCwgdm0sIGNiKSB7XG4gIGFwcGx5VHJhbnNpdGlvbihlbCwgMSwgZnVuY3Rpb24gKCkge1xuICAgIGJlZm9yZShlbCwgdGFyZ2V0KTtcbiAgfSwgdm0sIGNiKTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgd2l0aCB0cmFuc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICovXG5cbmZ1bmN0aW9uIHJlbW92ZVdpdGhUcmFuc2l0aW9uKGVsLCB2bSwgY2IpIHtcbiAgYXBwbHlUcmFuc2l0aW9uKGVsLCAtMSwgZnVuY3Rpb24gKCkge1xuICAgIHJlbW92ZShlbCk7XG4gIH0sIHZtLCBjYik7XG59XG5cbi8qKlxuICogQXBwbHkgdHJhbnNpdGlvbnMgd2l0aCBhbiBvcGVyYXRpb24gY2FsbGJhY2suXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtOdW1iZXJ9IGRpcmVjdGlvblxuICogICAgICAgICAgICAgICAgICAxOiBlbnRlclxuICogICAgICAgICAgICAgICAgIC0xOiBsZWF2ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3AgLSB0aGUgYWN0dWFsIERPTSBvcGVyYXRpb25cbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICovXG5cbmZ1bmN0aW9uIGFwcGx5VHJhbnNpdGlvbihlbCwgZGlyZWN0aW9uLCBvcCwgdm0sIGNiKSB7XG4gIHZhciB0cmFuc2l0aW9uID0gZWwuX192X3RyYW5zO1xuICBpZiAoIXRyYW5zaXRpb24gfHxcbiAgLy8gc2tpcCBpZiB0aGVyZSBhcmUgbm8ganMgaG9va3MgYW5kIENTUyB0cmFuc2l0aW9uIGlzXG4gIC8vIG5vdCBzdXBwb3J0ZWRcbiAgIXRyYW5zaXRpb24uaG9va3MgJiYgIXRyYW5zaXRpb25FbmRFdmVudCB8fFxuICAvLyBza2lwIHRyYW5zaXRpb25zIGZvciBpbml0aWFsIGNvbXBpbGVcbiAgIXZtLl9pc0NvbXBpbGVkIHx8XG4gIC8vIGlmIHRoZSB2bSBpcyBiZWluZyBtYW5pcHVsYXRlZCBieSBhIHBhcmVudCBkaXJlY3RpdmVcbiAgLy8gZHVyaW5nIHRoZSBwYXJlbnQncyBjb21waWxhdGlvbiBwaGFzZSwgc2tpcCB0aGVcbiAgLy8gYW5pbWF0aW9uLlxuICB2bS4kcGFyZW50ICYmICF2bS4kcGFyZW50Ll9pc0NvbXBpbGVkKSB7XG4gICAgb3AoKTtcbiAgICBpZiAoY2IpIGNiKCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBhY3Rpb24gPSBkaXJlY3Rpb24gPiAwID8gJ2VudGVyJyA6ICdsZWF2ZSc7XG4gIHRyYW5zaXRpb25bYWN0aW9uXShvcCwgY2IpO1xufVxuXG52YXIgdHJhbnNpdGlvbiA9IE9iamVjdC5mcmVlemUoe1xuICBhcHBlbmRXaXRoVHJhbnNpdGlvbjogYXBwZW5kV2l0aFRyYW5zaXRpb24sXG4gIGJlZm9yZVdpdGhUcmFuc2l0aW9uOiBiZWZvcmVXaXRoVHJhbnNpdGlvbixcbiAgcmVtb3ZlV2l0aFRyYW5zaXRpb246IHJlbW92ZVdpdGhUcmFuc2l0aW9uLFxuICBhcHBseVRyYW5zaXRpb246IGFwcGx5VHJhbnNpdGlvblxufSk7XG5cbi8qKlxuICogUXVlcnkgYW4gZWxlbWVudCBzZWxlY3RvciBpZiBpdCdzIG5vdCBhbiBlbGVtZW50IGFscmVhZHkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge0VsZW1lbnR9XG4gKi9cblxuZnVuY3Rpb24gcXVlcnkoZWwpIHtcbiAgaWYgKHR5cGVvZiBlbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIgc2VsZWN0b3IgPSBlbDtcbiAgICBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpO1xuICAgIGlmICghZWwpIHtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignQ2Fubm90IGZpbmQgZWxlbWVudDogJyArIHNlbGVjdG9yKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgbm9kZSBpcyBpbiB0aGUgZG9jdW1lbnQuXG4gKiBOb3RlOiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY29udGFpbnMgc2hvdWxkIHdvcmsgaGVyZVxuICogYnV0IGFsd2F5cyByZXR1cm5zIGZhbHNlIGZvciBjb21tZW50IG5vZGVzIGluIHBoYW50b21qcyxcbiAqIG1ha2luZyB1bml0IHRlc3RzIGRpZmZpY3VsdC4gVGhpcyBpcyBmaXhlZCBieSBkb2luZyB0aGVcbiAqIGNvbnRhaW5zKCkgY2hlY2sgb24gdGhlIG5vZGUncyBwYXJlbnROb2RlIGluc3RlYWQgb2ZcbiAqIHRoZSBub2RlIGl0c2VsZi5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaW5Eb2Mobm9kZSkge1xuICBpZiAoIW5vZGUpIHJldHVybiBmYWxzZTtcbiAgdmFyIGRvYyA9IG5vZGUub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gIHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG4gIHJldHVybiBkb2MgPT09IG5vZGUgfHwgZG9jID09PSBwYXJlbnQgfHwgISEocGFyZW50ICYmIHBhcmVudC5ub2RlVHlwZSA9PT0gMSAmJiBkb2MuY29udGFpbnMocGFyZW50KSk7XG59XG5cbi8qKlxuICogR2V0IGFuZCByZW1vdmUgYW4gYXR0cmlidXRlIGZyb20gYSBub2RlLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHBhcmFtIHtTdHJpbmd9IF9hdHRyXG4gKi9cblxuZnVuY3Rpb24gZ2V0QXR0cihub2RlLCBfYXR0cikge1xuICB2YXIgdmFsID0gbm9kZS5nZXRBdHRyaWJ1dGUoX2F0dHIpO1xuICBpZiAodmFsICE9PSBudWxsKSB7XG4gICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoX2F0dHIpO1xuICB9XG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogR2V0IGFuIGF0dHJpYnV0ZSB3aXRoIGNvbG9uIG9yIHYtYmluZDogcHJlZml4LlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1N0cmluZ3xudWxsfVxuICovXG5cbmZ1bmN0aW9uIGdldEJpbmRBdHRyKG5vZGUsIG5hbWUpIHtcbiAgdmFyIHZhbCA9IGdldEF0dHIobm9kZSwgJzonICsgbmFtZSk7XG4gIGlmICh2YWwgPT09IG51bGwpIHtcbiAgICB2YWwgPSBnZXRBdHRyKG5vZGUsICd2LWJpbmQ6JyArIG5hbWUpO1xuICB9XG4gIHJldHVybiB2YWw7XG59XG5cbi8qKlxuICogQ2hlY2sgdGhlIHByZXNlbmNlIG9mIGEgYmluZCBhdHRyaWJ1dGUuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBoYXNCaW5kQXR0cihub2RlLCBuYW1lKSB7XG4gIHJldHVybiBub2RlLmhhc0F0dHJpYnV0ZShuYW1lKSB8fCBub2RlLmhhc0F0dHJpYnV0ZSgnOicgKyBuYW1lKSB8fCBub2RlLmhhc0F0dHJpYnV0ZSgndi1iaW5kOicgKyBuYW1lKTtcbn1cblxuLyoqXG4gKiBJbnNlcnQgZWwgYmVmb3JlIHRhcmdldFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gKi9cblxuZnVuY3Rpb24gYmVmb3JlKGVsLCB0YXJnZXQpIHtcbiAgdGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQpO1xufVxuXG4vKipcbiAqIEluc2VydCBlbCBhZnRlciB0YXJnZXRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICovXG5cbmZ1bmN0aW9uIGFmdGVyKGVsLCB0YXJnZXQpIHtcbiAgaWYgKHRhcmdldC5uZXh0U2libGluZykge1xuICAgIGJlZm9yZShlbCwgdGFyZ2V0Lm5leHRTaWJsaW5nKTtcbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChlbCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmUgZWwgZnJvbSBET01cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKi9cblxuZnVuY3Rpb24gcmVtb3ZlKGVsKSB7XG4gIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpO1xufVxuXG4vKipcbiAqIFByZXBlbmQgZWwgdG8gdGFyZ2V0XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAqL1xuXG5mdW5jdGlvbiBwcmVwZW5kKGVsLCB0YXJnZXQpIHtcbiAgaWYgKHRhcmdldC5maXJzdENoaWxkKSB7XG4gICAgYmVmb3JlKGVsLCB0YXJnZXQuZmlyc3RDaGlsZCk7XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKGVsKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlcGxhY2UgdGFyZ2V0IHdpdGggZWxcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICovXG5cbmZ1bmN0aW9uIHJlcGxhY2UodGFyZ2V0LCBlbCkge1xuICB2YXIgcGFyZW50ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG4gIGlmIChwYXJlbnQpIHtcbiAgICBwYXJlbnQucmVwbGFjZUNoaWxkKGVsLCB0YXJnZXQpO1xuICB9XG59XG5cbi8qKlxuICogQWRkIGV2ZW50IGxpc3RlbmVyIHNob3J0aGFuZC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt1c2VDYXB0dXJlXVxuICovXG5cbmZ1bmN0aW9uIG9uKGVsLCBldmVudCwgY2IsIHVzZUNhcHR1cmUpIHtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgY2IsIHVzZUNhcHR1cmUpO1xufVxuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lciBzaG9ydGhhbmQuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICovXG5cbmZ1bmN0aW9uIG9mZihlbCwgZXZlbnQsIGNiKSB7XG4gIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGNiKTtcbn1cblxuLyoqXG4gKiBGb3IgSUU5IGNvbXBhdDogd2hlbiBib3RoIGNsYXNzIGFuZCA6Y2xhc3MgYXJlIHByZXNlbnRcbiAqIGdldEF0dHJpYnV0ZSgnY2xhc3MnKSByZXR1cm5zIHdyb25nIHZhbHVlLi4uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIGdldENsYXNzKGVsKSB7XG4gIHZhciBjbGFzc25hbWUgPSBlbC5jbGFzc05hbWU7XG4gIGlmICh0eXBlb2YgY2xhc3NuYW1lID09PSAnb2JqZWN0Jykge1xuICAgIGNsYXNzbmFtZSA9IGNsYXNzbmFtZS5iYXNlVmFsIHx8ICcnO1xuICB9XG4gIHJldHVybiBjbGFzc25hbWU7XG59XG5cbi8qKlxuICogSW4gSUU5LCBzZXRBdHRyaWJ1dGUoJ2NsYXNzJykgd2lsbCByZXN1bHQgaW4gZW1wdHkgY2xhc3NcbiAqIGlmIHRoZSBlbGVtZW50IGFsc28gaGFzIHRoZSA6Y2xhc3MgYXR0cmlidXRlOyBIb3dldmVyIGluXG4gKiBQaGFudG9tSlMsIHNldHRpbmcgYGNsYXNzTmFtZWAgZG9lcyBub3Qgd29yayBvbiBTVkcgZWxlbWVudHMuLi5cbiAqIFNvIHdlIGhhdmUgdG8gZG8gYSBjb25kaXRpb25hbCBjaGVjayBoZXJlLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBjbHNcbiAqL1xuXG5mdW5jdGlvbiBzZXRDbGFzcyhlbCwgY2xzKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoaXNJRTkgJiYgIS9zdmckLy50ZXN0KGVsLm5hbWVzcGFjZVVSSSkpIHtcbiAgICBlbC5jbGFzc05hbWUgPSBjbHM7XG4gIH0gZWxzZSB7XG4gICAgZWwuc2V0QXR0cmlidXRlKCdjbGFzcycsIGNscyk7XG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgY2xhc3Mgd2l0aCBjb21wYXRpYmlsaXR5IGZvciBJRSAmIFNWR1xuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBjbHNcbiAqL1xuXG5mdW5jdGlvbiBhZGRDbGFzcyhlbCwgY2xzKSB7XG4gIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKGNscyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGN1ciA9ICcgJyArIGdldENsYXNzKGVsKSArICcgJztcbiAgICBpZiAoY3VyLmluZGV4T2YoJyAnICsgY2xzICsgJyAnKSA8IDApIHtcbiAgICAgIHNldENsYXNzKGVsLCAoY3VyICsgY2xzKS50cmltKCkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSBjbGFzcyB3aXRoIGNvbXBhdGliaWxpdHkgZm9yIElFICYgU1ZHXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IGNsc1xuICovXG5cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsLCBjbHMpIHtcbiAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoY2xzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgY3VyID0gJyAnICsgZ2V0Q2xhc3MoZWwpICsgJyAnO1xuICAgIHZhciB0YXIgPSAnICcgKyBjbHMgKyAnICc7XG4gICAgd2hpbGUgKGN1ci5pbmRleE9mKHRhcikgPj0gMCkge1xuICAgICAgY3VyID0gY3VyLnJlcGxhY2UodGFyLCAnICcpO1xuICAgIH1cbiAgICBzZXRDbGFzcyhlbCwgY3VyLnRyaW0oKSk7XG4gIH1cbiAgaWYgKCFlbC5jbGFzc05hbWUpIHtcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ2NsYXNzJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHRyYWN0IHJhdyBjb250ZW50IGluc2lkZSBhbiBlbGVtZW50IGludG8gYSB0ZW1wb3JhcnlcbiAqIGNvbnRhaW5lciBkaXZcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGFzRnJhZ21lbnRcbiAqIEByZXR1cm4ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH1cbiAqL1xuXG5mdW5jdGlvbiBleHRyYWN0Q29udGVudChlbCwgYXNGcmFnbWVudCkge1xuICB2YXIgY2hpbGQ7XG4gIHZhciByYXdDb250ZW50O1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKGlzVGVtcGxhdGUoZWwpICYmIGlzRnJhZ21lbnQoZWwuY29udGVudCkpIHtcbiAgICBlbCA9IGVsLmNvbnRlbnQ7XG4gIH1cbiAgaWYgKGVsLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgIHRyaW1Ob2RlKGVsKTtcbiAgICByYXdDb250ZW50ID0gYXNGcmFnbWVudCA/IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbmQtYXNzaWduICovXG4gICAgd2hpbGUgKGNoaWxkID0gZWwuZmlyc3RDaGlsZCkge1xuICAgICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25kLWFzc2lnbiAqL1xuICAgICAgcmF3Q29udGVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgfVxuICB9XG4gIHJldHVybiByYXdDb250ZW50O1xufVxuXG4vKipcbiAqIFRyaW0gcG9zc2libGUgZW1wdHkgaGVhZC90YWlsIHRleHQgYW5kIGNvbW1lbnRcbiAqIG5vZGVzIGluc2lkZSBhIHBhcmVudC5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAqL1xuXG5mdW5jdGlvbiB0cmltTm9kZShub2RlKSB7XG4gIHZhciBjaGlsZDtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tc2VxdWVuY2VzICovXG4gIHdoaWxlICgoY2hpbGQgPSBub2RlLmZpcnN0Q2hpbGQsIGlzVHJpbW1hYmxlKGNoaWxkKSkpIHtcbiAgICBub2RlLnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgfVxuICB3aGlsZSAoKGNoaWxkID0gbm9kZS5sYXN0Q2hpbGQsIGlzVHJpbW1hYmxlKGNoaWxkKSkpIHtcbiAgICBub2RlLnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXNlcXVlbmNlcyAqL1xufVxuXG5mdW5jdGlvbiBpc1RyaW1tYWJsZShub2RlKSB7XG4gIHJldHVybiBub2RlICYmIChub2RlLm5vZGVUeXBlID09PSAzICYmICFub2RlLmRhdGEudHJpbSgpIHx8IG5vZGUubm9kZVR5cGUgPT09IDgpO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGFuIGVsZW1lbnQgaXMgYSB0ZW1wbGF0ZSB0YWcuXG4gKiBOb3RlIGlmIHRoZSB0ZW1wbGF0ZSBhcHBlYXJzIGluc2lkZSBhbiBTVkcgaXRzIHRhZ05hbWVcbiAqIHdpbGwgYmUgaW4gbG93ZXJjYXNlLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqL1xuXG5mdW5jdGlvbiBpc1RlbXBsYXRlKGVsKSB7XG4gIHJldHVybiBlbC50YWdOYW1lICYmIGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3RlbXBsYXRlJztcbn1cblxuLyoqXG4gKiBDcmVhdGUgYW4gXCJhbmNob3JcIiBmb3IgcGVyZm9ybWluZyBkb20gaW5zZXJ0aW9uL3JlbW92YWxzLlxuICogVGhpcyBpcyB1c2VkIGluIGEgbnVtYmVyIG9mIHNjZW5hcmlvczpcbiAqIC0gZnJhZ21lbnQgaW5zdGFuY2VcbiAqIC0gdi1odG1sXG4gKiAtIHYtaWZcbiAqIC0gdi1mb3JcbiAqIC0gY29tcG9uZW50XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGNvbnRlbnRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcGVyc2lzdCAtIElFIHRyYXNoZXMgZW1wdHkgdGV4dE5vZGVzIG9uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9uZU5vZGUodHJ1ZSksIHNvIGluIGNlcnRhaW5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2VzIHRoZSBhbmNob3IgbmVlZHMgdG8gYmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vbi1lbXB0eSB0byBiZSBwZXJzaXN0ZWQgaW5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlcy5cbiAqIEByZXR1cm4ge0NvbW1lbnR8VGV4dH1cbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVBbmNob3IoY29udGVudCwgcGVyc2lzdCkge1xuICB2YXIgYW5jaG9yID0gY29uZmlnLmRlYnVnID8gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChjb250ZW50KSA6IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHBlcnNpc3QgPyAnICcgOiAnJyk7XG4gIGFuY2hvci5fX3ZfYW5jaG9yID0gdHJ1ZTtcbiAgcmV0dXJuIGFuY2hvcjtcbn1cblxuLyoqXG4gKiBGaW5kIGEgY29tcG9uZW50IHJlZiBhdHRyaWJ1dGUgdGhhdCBzdGFydHMgd2l0aCAkLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gbm9kZVxuICogQHJldHVybiB7U3RyaW5nfHVuZGVmaW5lZH1cbiAqL1xuXG52YXIgcmVmUkUgPSAvXnYtcmVmOi87XG5cbmZ1bmN0aW9uIGZpbmRSZWYobm9kZSkge1xuICBpZiAobm9kZS5oYXNBdHRyaWJ1dGVzKCkpIHtcbiAgICB2YXIgYXR0cnMgPSBub2RlLmF0dHJpYnV0ZXM7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdHRycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBuYW1lID0gYXR0cnNbaV0ubmFtZTtcbiAgICAgIGlmIChyZWZSRS50ZXN0KG5hbWUpKSB7XG4gICAgICAgIHJldHVybiBjYW1lbGl6ZShuYW1lLnJlcGxhY2UocmVmUkUsICcnKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogTWFwIGEgZnVuY3Rpb24gdG8gYSByYW5nZSBvZiBub2RlcyAuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcGFyYW0ge05vZGV9IGVuZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3BcbiAqL1xuXG5mdW5jdGlvbiBtYXBOb2RlUmFuZ2Uobm9kZSwgZW5kLCBvcCkge1xuICB2YXIgbmV4dDtcbiAgd2hpbGUgKG5vZGUgIT09IGVuZCkge1xuICAgIG5leHQgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgIG9wKG5vZGUpO1xuICAgIG5vZGUgPSBuZXh0O1xuICB9XG4gIG9wKGVuZCk7XG59XG5cbi8qKlxuICogUmVtb3ZlIGEgcmFuZ2Ugb2Ygbm9kZXMgd2l0aCB0cmFuc2l0aW9uLCBzdG9yZVxuICogdGhlIG5vZGVzIGluIGEgZnJhZ21lbnQgd2l0aCBjb3JyZWN0IG9yZGVyaW5nLFxuICogYW5kIGNhbGwgY2FsbGJhY2sgd2hlbiBkb25lLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gc3RhcnRcbiAqIEBwYXJhbSB7Tm9kZX0gZW5kXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7RG9jdW1lbnRGcmFnbWVudH0gZnJhZ1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2JcbiAqL1xuXG5mdW5jdGlvbiByZW1vdmVOb2RlUmFuZ2Uoc3RhcnQsIGVuZCwgdm0sIGZyYWcsIGNiKSB7XG4gIHZhciBkb25lID0gZmFsc2U7XG4gIHZhciByZW1vdmVkID0gMDtcbiAgdmFyIG5vZGVzID0gW107XG4gIG1hcE5vZGVSYW5nZShzdGFydCwgZW5kLCBmdW5jdGlvbiAobm9kZSkge1xuICAgIGlmIChub2RlID09PSBlbmQpIGRvbmUgPSB0cnVlO1xuICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgcmVtb3ZlV2l0aFRyYW5zaXRpb24obm9kZSwgdm0sIG9uUmVtb3ZlZCk7XG4gIH0pO1xuICBmdW5jdGlvbiBvblJlbW92ZWQoKSB7XG4gICAgcmVtb3ZlZCsrO1xuICAgIGlmIChkb25lICYmIHJlbW92ZWQgPj0gbm9kZXMubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQobm9kZXNbaV0pO1xuICAgICAgfVxuICAgICAgY2IgJiYgY2IoKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIG5vZGUgaXMgYSBEb2N1bWVudEZyYWdtZW50LlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc0ZyYWdtZW50KG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUgJiYgbm9kZS5ub2RlVHlwZSA9PT0gMTE7XG59XG5cbi8qKlxuICogR2V0IG91dGVySFRNTCBvZiBlbGVtZW50cywgdGFraW5nIGNhcmVcbiAqIG9mIFNWRyBlbGVtZW50cyBpbiBJRSBhcyB3ZWxsLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBnZXRPdXRlckhUTUwoZWwpIHtcbiAgaWYgKGVsLm91dGVySFRNTCkge1xuICAgIHJldHVybiBlbC5vdXRlckhUTUw7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgIHJldHVybiBjb250YWluZXIuaW5uZXJIVE1MO1xuICB9XG59XG5cbnZhciBjb21tb25UYWdSRSA9IC9eKGRpdnxwfHNwYW58aW1nfGF8YnxpfGJyfHVsfG9sfGxpfGgxfGgyfGgzfGg0fGg1fGg2fGNvZGV8cHJlfHRhYmxlfHRofHRkfHRyfGZvcm18bGFiZWx8aW5wdXR8c2VsZWN0fG9wdGlvbnxuYXZ8YXJ0aWNsZXxzZWN0aW9ufGhlYWRlcnxmb290ZXIpJC9pO1xudmFyIHJlc2VydmVkVGFnUkUgPSAvXihzbG90fHBhcnRpYWx8Y29tcG9uZW50KSQvaTtcblxudmFyIGlzVW5rbm93bkVsZW1lbnQgPSB1bmRlZmluZWQ7XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBpc1Vua25vd25FbGVtZW50ID0gZnVuY3Rpb24gKGVsLCB0YWcpIHtcbiAgICBpZiAodGFnLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yODIxMDM2NC8xMDcwMjQ0XG4gICAgICByZXR1cm4gZWwuY29uc3RydWN0b3IgPT09IHdpbmRvdy5IVE1MVW5rbm93bkVsZW1lbnQgfHwgZWwuY29uc3RydWN0b3IgPT09IHdpbmRvdy5IVE1MRWxlbWVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICgvSFRNTFVua25vd25FbGVtZW50Ly50ZXN0KGVsLnRvU3RyaW5nKCkpICYmXG4gICAgICAgIC8vIENocm9tZSByZXR1cm5zIHVua25vd24gZm9yIHNldmVyYWwgSFRNTDUgZWxlbWVudHMuXG4gICAgICAgIC8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD01NDA1MjZcbiAgICAgICAgLy8gRmlyZWZveCByZXR1cm5zIHVua25vd24gZm9yIHNvbWUgXCJJbnRlcmFjdGl2ZSBlbGVtZW50cy5cIlxuICAgICAgICAhL14oZGF0YXx0aW1lfHJ0Y3xyYnxkZXRhaWxzfGRpYWxvZ3xzdW1tYXJ5KSQvLnRlc3QodGFnKVxuICAgICAgKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYW4gZWxlbWVudCBpcyBhIGNvbXBvbmVudCwgaWYgeWVzIHJldHVybiBpdHNcbiAqIGNvbXBvbmVudCBpZC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7T2JqZWN0fHVuZGVmaW5lZH1cbiAqL1xuXG5mdW5jdGlvbiBjaGVja0NvbXBvbmVudEF0dHIoZWwsIG9wdGlvbnMpIHtcbiAgdmFyIHRhZyA9IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgdmFyIGhhc0F0dHJzID0gZWwuaGFzQXR0cmlidXRlcygpO1xuICBpZiAoIWNvbW1vblRhZ1JFLnRlc3QodGFnKSAmJiAhcmVzZXJ2ZWRUYWdSRS50ZXN0KHRhZykpIHtcbiAgICBpZiAocmVzb2x2ZUFzc2V0KG9wdGlvbnMsICdjb21wb25lbnRzJywgdGFnKSkge1xuICAgICAgcmV0dXJuIHsgaWQ6IHRhZyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaXMgPSBoYXNBdHRycyAmJiBnZXRJc0JpbmRpbmcoZWwsIG9wdGlvbnMpO1xuICAgICAgaWYgKGlzKSB7XG4gICAgICAgIHJldHVybiBpcztcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICB2YXIgZXhwZWN0ZWRUYWcgPSBvcHRpb25zLl9jb21wb25lbnROYW1lTWFwICYmIG9wdGlvbnMuX2NvbXBvbmVudE5hbWVNYXBbdGFnXTtcbiAgICAgICAgaWYgKGV4cGVjdGVkVGFnKSB7XG4gICAgICAgICAgd2FybignVW5rbm93biBjdXN0b20gZWxlbWVudDogPCcgKyB0YWcgKyAnPiAtICcgKyAnZGlkIHlvdSBtZWFuIDwnICsgZXhwZWN0ZWRUYWcgKyAnPj8gJyArICdIVE1MIGlzIGNhc2UtaW5zZW5zaXRpdmUsIHJlbWVtYmVyIHRvIHVzZSBrZWJhYi1jYXNlIGluIHRlbXBsYXRlcy4nKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1Vua25vd25FbGVtZW50KGVsLCB0YWcpKSB7XG4gICAgICAgICAgd2FybignVW5rbm93biBjdXN0b20gZWxlbWVudDogPCcgKyB0YWcgKyAnPiAtIGRpZCB5b3UgJyArICdyZWdpc3RlciB0aGUgY29tcG9uZW50IGNvcnJlY3RseT8gRm9yIHJlY3Vyc2l2ZSBjb21wb25lbnRzLCAnICsgJ21ha2Ugc3VyZSB0byBwcm92aWRlIHRoZSBcIm5hbWVcIiBvcHRpb24uJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoaGFzQXR0cnMpIHtcbiAgICByZXR1cm4gZ2V0SXNCaW5kaW5nKGVsLCBvcHRpb25zKTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCBcImlzXCIgYmluZGluZyBmcm9tIGFuIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge09iamVjdHx1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gZ2V0SXNCaW5kaW5nKGVsLCBvcHRpb25zKSB7XG4gIC8vIGR5bmFtaWMgc3ludGF4XG4gIHZhciBleHAgPSBlbC5nZXRBdHRyaWJ1dGUoJ2lzJyk7XG4gIGlmIChleHAgIT0gbnVsbCkge1xuICAgIGlmIChyZXNvbHZlQXNzZXQob3B0aW9ucywgJ2NvbXBvbmVudHMnLCBleHApKSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ2lzJyk7XG4gICAgICByZXR1cm4geyBpZDogZXhwIH07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGV4cCA9IGdldEJpbmRBdHRyKGVsLCAnaXMnKTtcbiAgICBpZiAoZXhwICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB7IGlkOiBleHAsIGR5bmFtaWM6IHRydWUgfTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb24gb3ZlcndyaXRpbmcgc3RyYXRlZ2llcyBhcmUgZnVuY3Rpb25zIHRoYXQgaGFuZGxlXG4gKiBob3cgdG8gbWVyZ2UgYSBwYXJlbnQgb3B0aW9uIHZhbHVlIGFuZCBhIGNoaWxkIG9wdGlvblxuICogdmFsdWUgaW50byB0aGUgZmluYWwgdmFsdWUuXG4gKlxuICogQWxsIHN0cmF0ZWd5IGZ1bmN0aW9ucyBmb2xsb3cgdGhlIHNhbWUgc2lnbmF0dXJlOlxuICpcbiAqIEBwYXJhbSB7Kn0gcGFyZW50VmFsXG4gKiBAcGFyYW0geyp9IGNoaWxkVmFsXG4gKiBAcGFyYW0ge1Z1ZX0gW3ZtXVxuICovXG5cbnZhciBzdHJhdHMgPSBjb25maWcub3B0aW9uTWVyZ2VTdHJhdGVnaWVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuLyoqXG4gKiBIZWxwZXIgdGhhdCByZWN1cnNpdmVseSBtZXJnZXMgdHdvIGRhdGEgb2JqZWN0cyB0b2dldGhlci5cbiAqL1xuXG5mdW5jdGlvbiBtZXJnZURhdGEodG8sIGZyb20pIHtcbiAgdmFyIGtleSwgdG9WYWwsIGZyb21WYWw7XG4gIGZvciAoa2V5IGluIGZyb20pIHtcbiAgICB0b1ZhbCA9IHRvW2tleV07XG4gICAgZnJvbVZhbCA9IGZyb21ba2V5XTtcbiAgICBpZiAoIWhhc093bih0bywga2V5KSkge1xuICAgICAgc2V0KHRvLCBrZXksIGZyb21WYWwpO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodG9WYWwpICYmIGlzT2JqZWN0KGZyb21WYWwpKSB7XG4gICAgICBtZXJnZURhdGEodG9WYWwsIGZyb21WYWwpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdG87XG59XG5cbi8qKlxuICogRGF0YVxuICovXG5cbnN0cmF0cy5kYXRhID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwsIHZtKSB7XG4gIGlmICghdm0pIHtcbiAgICAvLyBpbiBhIFZ1ZS5leHRlbmQgbWVyZ2UsIGJvdGggc2hvdWxkIGJlIGZ1bmN0aW9uc1xuICAgIGlmICghY2hpbGRWYWwpIHtcbiAgICAgIHJldHVybiBwYXJlbnRWYWw7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY2hpbGRWYWwgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignVGhlIFwiZGF0YVwiIG9wdGlvbiBzaG91bGQgYmUgYSBmdW5jdGlvbiAnICsgJ3RoYXQgcmV0dXJucyBhIHBlci1pbnN0YW5jZSB2YWx1ZSBpbiBjb21wb25lbnQgJyArICdkZWZpbml0aW9ucy4nLCB2bSk7XG4gICAgICByZXR1cm4gcGFyZW50VmFsO1xuICAgIH1cbiAgICBpZiAoIXBhcmVudFZhbCkge1xuICAgICAgcmV0dXJuIGNoaWxkVmFsO1xuICAgIH1cbiAgICAvLyB3aGVuIHBhcmVudFZhbCAmIGNoaWxkVmFsIGFyZSBib3RoIHByZXNlbnQsXG4gICAgLy8gd2UgbmVlZCB0byByZXR1cm4gYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlXG4gICAgLy8gbWVyZ2VkIHJlc3VsdCBvZiBib3RoIGZ1bmN0aW9ucy4uLiBubyBuZWVkIHRvXG4gICAgLy8gY2hlY2sgaWYgcGFyZW50VmFsIGlzIGEgZnVuY3Rpb24gaGVyZSBiZWNhdXNlXG4gICAgLy8gaXQgaGFzIHRvIGJlIGEgZnVuY3Rpb24gdG8gcGFzcyBwcmV2aW91cyBtZXJnZXMuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG1lcmdlZERhdGFGbigpIHtcbiAgICAgIHJldHVybiBtZXJnZURhdGEoY2hpbGRWYWwuY2FsbCh0aGlzKSwgcGFyZW50VmFsLmNhbGwodGhpcykpO1xuICAgIH07XG4gIH0gZWxzZSBpZiAocGFyZW50VmFsIHx8IGNoaWxkVmFsKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIG1lcmdlZEluc3RhbmNlRGF0YUZuKCkge1xuICAgICAgLy8gaW5zdGFuY2UgbWVyZ2VcbiAgICAgIHZhciBpbnN0YW5jZURhdGEgPSB0eXBlb2YgY2hpbGRWYWwgPT09ICdmdW5jdGlvbicgPyBjaGlsZFZhbC5jYWxsKHZtKSA6IGNoaWxkVmFsO1xuICAgICAgdmFyIGRlZmF1bHREYXRhID0gdHlwZW9mIHBhcmVudFZhbCA9PT0gJ2Z1bmN0aW9uJyA/IHBhcmVudFZhbC5jYWxsKHZtKSA6IHVuZGVmaW5lZDtcbiAgICAgIGlmIChpbnN0YW5jZURhdGEpIHtcbiAgICAgICAgcmV0dXJuIG1lcmdlRGF0YShpbnN0YW5jZURhdGEsIGRlZmF1bHREYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0RGF0YTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG4vKipcbiAqIEVsXG4gKi9cblxuc3RyYXRzLmVsID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwsIHZtKSB7XG4gIGlmICghdm0gJiYgY2hpbGRWYWwgJiYgdHlwZW9mIGNoaWxkVmFsICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdUaGUgXCJlbFwiIG9wdGlvbiBzaG91bGQgYmUgYSBmdW5jdGlvbiAnICsgJ3RoYXQgcmV0dXJucyBhIHBlci1pbnN0YW5jZSB2YWx1ZSBpbiBjb21wb25lbnQgJyArICdkZWZpbml0aW9ucy4nLCB2bSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciByZXQgPSBjaGlsZFZhbCB8fCBwYXJlbnRWYWw7XG4gIC8vIGludm9rZSB0aGUgZWxlbWVudCBmYWN0b3J5IGlmIHRoaXMgaXMgaW5zdGFuY2UgbWVyZ2VcbiAgcmV0dXJuIHZtICYmIHR5cGVvZiByZXQgPT09ICdmdW5jdGlvbicgPyByZXQuY2FsbCh2bSkgOiByZXQ7XG59O1xuXG4vKipcbiAqIEhvb2tzIGFuZCBwYXJhbSBhdHRyaWJ1dGVzIGFyZSBtZXJnZWQgYXMgYXJyYXlzLlxuICovXG5cbnN0cmF0cy5pbml0ID0gc3RyYXRzLmNyZWF0ZWQgPSBzdHJhdHMucmVhZHkgPSBzdHJhdHMuYXR0YWNoZWQgPSBzdHJhdHMuZGV0YWNoZWQgPSBzdHJhdHMuYmVmb3JlQ29tcGlsZSA9IHN0cmF0cy5jb21waWxlZCA9IHN0cmF0cy5iZWZvcmVEZXN0cm95ID0gc3RyYXRzLmRlc3Ryb3llZCA9IHN0cmF0cy5hY3RpdmF0ZSA9IGZ1bmN0aW9uIChwYXJlbnRWYWwsIGNoaWxkVmFsKSB7XG4gIHJldHVybiBjaGlsZFZhbCA/IHBhcmVudFZhbCA/IHBhcmVudFZhbC5jb25jYXQoY2hpbGRWYWwpIDogaXNBcnJheShjaGlsZFZhbCkgPyBjaGlsZFZhbCA6IFtjaGlsZFZhbF0gOiBwYXJlbnRWYWw7XG59O1xuXG4vKipcbiAqIEFzc2V0c1xuICpcbiAqIFdoZW4gYSB2bSBpcyBwcmVzZW50IChpbnN0YW5jZSBjcmVhdGlvbiksIHdlIG5lZWQgdG8gZG9cbiAqIGEgdGhyZWUtd2F5IG1lcmdlIGJldHdlZW4gY29uc3RydWN0b3Igb3B0aW9ucywgaW5zdGFuY2VcbiAqIG9wdGlvbnMgYW5kIHBhcmVudCBvcHRpb25zLlxuICovXG5cbmZ1bmN0aW9uIG1lcmdlQXNzZXRzKHBhcmVudFZhbCwgY2hpbGRWYWwpIHtcbiAgdmFyIHJlcyA9IE9iamVjdC5jcmVhdGUocGFyZW50VmFsIHx8IG51bGwpO1xuICByZXR1cm4gY2hpbGRWYWwgPyBleHRlbmQocmVzLCBndWFyZEFycmF5QXNzZXRzKGNoaWxkVmFsKSkgOiByZXM7XG59XG5cbmNvbmZpZy5fYXNzZXRUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlKSB7XG4gIHN0cmF0c1t0eXBlICsgJ3MnXSA9IG1lcmdlQXNzZXRzO1xufSk7XG5cbi8qKlxuICogRXZlbnRzICYgV2F0Y2hlcnMuXG4gKlxuICogRXZlbnRzICYgd2F0Y2hlcnMgaGFzaGVzIHNob3VsZCBub3Qgb3ZlcndyaXRlIG9uZVxuICogYW5vdGhlciwgc28gd2UgbWVyZ2UgdGhlbSBhcyBhcnJheXMuXG4gKi9cblxuc3RyYXRzLndhdGNoID0gc3RyYXRzLmV2ZW50cyA9IGZ1bmN0aW9uIChwYXJlbnRWYWwsIGNoaWxkVmFsKSB7XG4gIGlmICghY2hpbGRWYWwpIHJldHVybiBwYXJlbnRWYWw7XG4gIGlmICghcGFyZW50VmFsKSByZXR1cm4gY2hpbGRWYWw7XG4gIHZhciByZXQgPSB7fTtcbiAgZXh0ZW5kKHJldCwgcGFyZW50VmFsKTtcbiAgZm9yICh2YXIga2V5IGluIGNoaWxkVmFsKSB7XG4gICAgdmFyIHBhcmVudCA9IHJldFtrZXldO1xuICAgIHZhciBjaGlsZCA9IGNoaWxkVmFsW2tleV07XG4gICAgaWYgKHBhcmVudCAmJiAhaXNBcnJheShwYXJlbnQpKSB7XG4gICAgICBwYXJlbnQgPSBbcGFyZW50XTtcbiAgICB9XG4gICAgcmV0W2tleV0gPSBwYXJlbnQgPyBwYXJlbnQuY29uY2F0KGNoaWxkKSA6IFtjaGlsZF07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICogT3RoZXIgb2JqZWN0IGhhc2hlcy5cbiAqL1xuXG5zdHJhdHMucHJvcHMgPSBzdHJhdHMubWV0aG9kcyA9IHN0cmF0cy5jb21wdXRlZCA9IGZ1bmN0aW9uIChwYXJlbnRWYWwsIGNoaWxkVmFsKSB7XG4gIGlmICghY2hpbGRWYWwpIHJldHVybiBwYXJlbnRWYWw7XG4gIGlmICghcGFyZW50VmFsKSByZXR1cm4gY2hpbGRWYWw7XG4gIHZhciByZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBleHRlbmQocmV0LCBwYXJlbnRWYWwpO1xuICBleHRlbmQocmV0LCBjaGlsZFZhbCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAqIERlZmF1bHQgc3RyYXRlZ3kuXG4gKi9cblxudmFyIGRlZmF1bHRTdHJhdCA9IGZ1bmN0aW9uIGRlZmF1bHRTdHJhdChwYXJlbnRWYWwsIGNoaWxkVmFsKSB7XG4gIHJldHVybiBjaGlsZFZhbCA9PT0gdW5kZWZpbmVkID8gcGFyZW50VmFsIDogY2hpbGRWYWw7XG59O1xuXG4vKipcbiAqIE1ha2Ugc3VyZSBjb21wb25lbnQgb3B0aW9ucyBnZXQgY29udmVydGVkIHRvIGFjdHVhbFxuICogY29uc3RydWN0b3JzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZnVuY3Rpb24gZ3VhcmRDb21wb25lbnRzKG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMuY29tcG9uZW50cykge1xuICAgIHZhciBjb21wb25lbnRzID0gb3B0aW9ucy5jb21wb25lbnRzID0gZ3VhcmRBcnJheUFzc2V0cyhvcHRpb25zLmNvbXBvbmVudHMpO1xuICAgIHZhciBpZHMgPSBPYmplY3Qua2V5cyhjb21wb25lbnRzKTtcbiAgICB2YXIgZGVmO1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB2YXIgbWFwID0gb3B0aW9ucy5fY29tcG9uZW50TmFtZU1hcCA9IHt9O1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGlkcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBpZHNbaV07XG4gICAgICBpZiAoY29tbW9uVGFnUkUudGVzdChrZXkpIHx8IHJlc2VydmVkVGFnUkUudGVzdChrZXkpKSB7XG4gICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignRG8gbm90IHVzZSBidWlsdC1pbiBvciByZXNlcnZlZCBIVE1MIGVsZW1lbnRzIGFzIGNvbXBvbmVudCAnICsgJ2lkOiAnICsga2V5KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICAvLyByZWNvcmQgYSBhbGwgbG93ZXJjYXNlIDwtPiBrZWJhYi1jYXNlIG1hcHBpbmcgZm9yXG4gICAgICAvLyBwb3NzaWJsZSBjdXN0b20gZWxlbWVudCBjYXNlIGVycm9yIHdhcm5pbmdcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIG1hcFtrZXkucmVwbGFjZSgvLS9nLCAnJykudG9Mb3dlckNhc2UoKV0gPSBoeXBoZW5hdGUoa2V5KTtcbiAgICAgIH1cbiAgICAgIGRlZiA9IGNvbXBvbmVudHNba2V5XTtcbiAgICAgIGlmIChpc1BsYWluT2JqZWN0KGRlZikpIHtcbiAgICAgICAgY29tcG9uZW50c1trZXldID0gVnVlLmV4dGVuZChkZWYpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEVuc3VyZSBhbGwgcHJvcHMgb3B0aW9uIHN5bnRheCBhcmUgbm9ybWFsaXplZCBpbnRvIHRoZVxuICogT2JqZWN0LWJhc2VkIGZvcm1hdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIGd1YXJkUHJvcHMob3B0aW9ucykge1xuICB2YXIgcHJvcHMgPSBvcHRpb25zLnByb3BzO1xuICB2YXIgaSwgdmFsO1xuICBpZiAoaXNBcnJheShwcm9wcykpIHtcbiAgICBvcHRpb25zLnByb3BzID0ge307XG4gICAgaSA9IHByb3BzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB2YWwgPSBwcm9wc1tpXTtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgICAgICBvcHRpb25zLnByb3BzW3ZhbF0gPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICh2YWwubmFtZSkge1xuICAgICAgICBvcHRpb25zLnByb3BzW3ZhbC5uYW1lXSA9IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdChwcm9wcykpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHByb3BzKTtcbiAgICBpID0ga2V5cy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdmFsID0gcHJvcHNba2V5c1tpXV07XG4gICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwcm9wc1trZXlzW2ldXSA9IHsgdHlwZTogdmFsIH07XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogR3VhcmQgYW4gQXJyYXktZm9ybWF0IGFzc2V0cyBvcHRpb24gYW5kIGNvbnZlcnRlZCBpdFxuICogaW50byB0aGUga2V5LXZhbHVlIE9iamVjdCBmb3JtYXQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IGFzc2V0c1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIGd1YXJkQXJyYXlBc3NldHMoYXNzZXRzKSB7XG4gIGlmIChpc0FycmF5KGFzc2V0cykpIHtcbiAgICB2YXIgcmVzID0ge307XG4gICAgdmFyIGkgPSBhc3NldHMubGVuZ3RoO1xuICAgIHZhciBhc3NldDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBhc3NldCA9IGFzc2V0c1tpXTtcbiAgICAgIHZhciBpZCA9IHR5cGVvZiBhc3NldCA9PT0gJ2Z1bmN0aW9uJyA/IGFzc2V0Lm9wdGlvbnMgJiYgYXNzZXQub3B0aW9ucy5uYW1lIHx8IGFzc2V0LmlkIDogYXNzZXQubmFtZSB8fCBhc3NldC5pZDtcbiAgICAgIGlmICghaWQpIHtcbiAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdBcnJheS1zeW50YXggYXNzZXRzIG11c3QgcHJvdmlkZSBhIFwibmFtZVwiIG9yIFwiaWRcIiBmaWVsZC4nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc1tpZF0gPSBhc3NldDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICByZXR1cm4gYXNzZXRzO1xufVxuXG4vKipcbiAqIE1lcmdlIHR3byBvcHRpb24gb2JqZWN0cyBpbnRvIGEgbmV3IG9uZS5cbiAqIENvcmUgdXRpbGl0eSB1c2VkIGluIGJvdGggaW5zdGFudGlhdGlvbiBhbmQgaW5oZXJpdGFuY2UuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhcmVudFxuICogQHBhcmFtIHtPYmplY3R9IGNoaWxkXG4gKiBAcGFyYW0ge1Z1ZX0gW3ZtXSAtIGlmIHZtIGlzIHByZXNlbnQsIGluZGljYXRlcyB0aGlzIGlzXG4gKiAgICAgICAgICAgICAgICAgICAgIGFuIGluc3RhbnRpYXRpb24gbWVyZ2UuXG4gKi9cblxuZnVuY3Rpb24gbWVyZ2VPcHRpb25zKHBhcmVudCwgY2hpbGQsIHZtKSB7XG4gIGd1YXJkQ29tcG9uZW50cyhjaGlsZCk7XG4gIGd1YXJkUHJvcHMoY2hpbGQpO1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIGlmIChjaGlsZC5wcm9wc0RhdGEgJiYgIXZtKSB7XG4gICAgICB3YXJuKCdwcm9wc0RhdGEgY2FuIG9ubHkgYmUgdXNlZCBhcyBhbiBpbnN0YW50aWF0aW9uIG9wdGlvbi4nKTtcbiAgICB9XG4gIH1cbiAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgdmFyIGtleTtcbiAgaWYgKGNoaWxkWydleHRlbmRzJ10pIHtcbiAgICBwYXJlbnQgPSB0eXBlb2YgY2hpbGRbJ2V4dGVuZHMnXSA9PT0gJ2Z1bmN0aW9uJyA/IG1lcmdlT3B0aW9ucyhwYXJlbnQsIGNoaWxkWydleHRlbmRzJ10ub3B0aW9ucywgdm0pIDogbWVyZ2VPcHRpb25zKHBhcmVudCwgY2hpbGRbJ2V4dGVuZHMnXSwgdm0pO1xuICB9XG4gIGlmIChjaGlsZC5taXhpbnMpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkLm1peGlucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBtaXhpbiA9IGNoaWxkLm1peGluc1tpXTtcbiAgICAgIHZhciBtaXhpbk9wdGlvbnMgPSBtaXhpbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBWdWUgPyBtaXhpbi5vcHRpb25zIDogbWl4aW47XG4gICAgICBwYXJlbnQgPSBtZXJnZU9wdGlvbnMocGFyZW50LCBtaXhpbk9wdGlvbnMsIHZtKTtcbiAgICB9XG4gIH1cbiAgZm9yIChrZXkgaW4gcGFyZW50KSB7XG4gICAgbWVyZ2VGaWVsZChrZXkpO1xuICB9XG4gIGZvciAoa2V5IGluIGNoaWxkKSB7XG4gICAgaWYgKCFoYXNPd24ocGFyZW50LCBrZXkpKSB7XG4gICAgICBtZXJnZUZpZWxkKGtleSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG1lcmdlRmllbGQoa2V5KSB7XG4gICAgdmFyIHN0cmF0ID0gc3RyYXRzW2tleV0gfHwgZGVmYXVsdFN0cmF0O1xuICAgIG9wdGlvbnNba2V5XSA9IHN0cmF0KHBhcmVudFtrZXldLCBjaGlsZFtrZXldLCB2bSwga2V5KTtcbiAgfVxuICByZXR1cm4gb3B0aW9ucztcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGFuIGFzc2V0LlxuICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGJlY2F1c2UgY2hpbGQgaW5zdGFuY2VzIG5lZWQgYWNjZXNzXG4gKiB0byBhc3NldHMgZGVmaW5lZCBpbiBpdHMgYW5jZXN0b3IgY2hhaW4uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge1N0cmluZ30gaWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gd2Fybk1pc3NpbmdcbiAqIEByZXR1cm4ge09iamVjdHxGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiByZXNvbHZlQXNzZXQob3B0aW9ucywgdHlwZSwgaWQsIHdhcm5NaXNzaW5nKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAodHlwZW9mIGlkICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgYXNzZXRzID0gb3B0aW9uc1t0eXBlXTtcbiAgdmFyIGNhbWVsaXplZElkO1xuICB2YXIgcmVzID0gYXNzZXRzW2lkXSB8fFxuICAvLyBjYW1lbENhc2UgSURcbiAgYXNzZXRzW2NhbWVsaXplZElkID0gY2FtZWxpemUoaWQpXSB8fFxuICAvLyBQYXNjYWwgQ2FzZSBJRFxuICBhc3NldHNbY2FtZWxpemVkSWQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBjYW1lbGl6ZWRJZC5zbGljZSgxKV07XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm5NaXNzaW5nICYmICFyZXMpIHtcbiAgICB3YXJuKCdGYWlsZWQgdG8gcmVzb2x2ZSAnICsgdHlwZS5zbGljZSgwLCAtMSkgKyAnOiAnICsgaWQsIG9wdGlvbnMpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnZhciB1aWQkMSA9IDA7XG5cbi8qKlxuICogQSBkZXAgaXMgYW4gb2JzZXJ2YWJsZSB0aGF0IGNhbiBoYXZlIG11bHRpcGxlXG4gKiBkaXJlY3RpdmVzIHN1YnNjcmliaW5nIHRvIGl0LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBEZXAoKSB7XG4gIHRoaXMuaWQgPSB1aWQkMSsrO1xuICB0aGlzLnN1YnMgPSBbXTtcbn1cblxuLy8gdGhlIGN1cnJlbnQgdGFyZ2V0IHdhdGNoZXIgYmVpbmcgZXZhbHVhdGVkLlxuLy8gdGhpcyBpcyBnbG9iYWxseSB1bmlxdWUgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBvbmx5IG9uZVxuLy8gd2F0Y2hlciBiZWluZyBldmFsdWF0ZWQgYXQgYW55IHRpbWUuXG5EZXAudGFyZ2V0ID0gbnVsbDtcblxuLyoqXG4gKiBBZGQgYSBkaXJlY3RpdmUgc3Vic2NyaWJlci5cbiAqXG4gKiBAcGFyYW0ge0RpcmVjdGl2ZX0gc3ViXG4gKi9cblxuRGVwLnByb3RvdHlwZS5hZGRTdWIgPSBmdW5jdGlvbiAoc3ViKSB7XG4gIHRoaXMuc3Vicy5wdXNoKHN1Yik7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhIGRpcmVjdGl2ZSBzdWJzY3JpYmVyLlxuICpcbiAqIEBwYXJhbSB7RGlyZWN0aXZlfSBzdWJcbiAqL1xuXG5EZXAucHJvdG90eXBlLnJlbW92ZVN1YiA9IGZ1bmN0aW9uIChzdWIpIHtcbiAgdGhpcy5zdWJzLiRyZW1vdmUoc3ViKTtcbn07XG5cbi8qKlxuICogQWRkIHNlbGYgYXMgYSBkZXBlbmRlbmN5IHRvIHRoZSB0YXJnZXQgd2F0Y2hlci5cbiAqL1xuXG5EZXAucHJvdG90eXBlLmRlcGVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgRGVwLnRhcmdldC5hZGREZXAodGhpcyk7XG59O1xuXG4vKipcbiAqIE5vdGlmeSBhbGwgc3Vic2NyaWJlcnMgb2YgYSBuZXcgdmFsdWUuXG4gKi9cblxuRGVwLnByb3RvdHlwZS5ub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHN0YWJsaXplIHRoZSBzdWJzY3JpYmVyIGxpc3QgZmlyc3RcbiAgdmFyIHN1YnMgPSB0b0FycmF5KHRoaXMuc3Vicyk7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gc3Vicy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBzdWJzW2ldLnVwZGF0ZSgpO1xuICB9XG59O1xuXG52YXIgYXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcbnZhciBhcnJheU1ldGhvZHMgPSBPYmplY3QuY3JlYXRlKGFycmF5UHJvdG8pXG5cbi8qKlxuICogSW50ZXJjZXB0IG11dGF0aW5nIG1ldGhvZHMgYW5kIGVtaXQgZXZlbnRzXG4gKi9cblxuO1sncHVzaCcsICdwb3AnLCAnc2hpZnQnLCAndW5zaGlmdCcsICdzcGxpY2UnLCAnc29ydCcsICdyZXZlcnNlJ10uZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kKSB7XG4gIC8vIGNhY2hlIG9yaWdpbmFsIG1ldGhvZFxuICB2YXIgb3JpZ2luYWwgPSBhcnJheVByb3RvW21ldGhvZF07XG4gIGRlZihhcnJheU1ldGhvZHMsIG1ldGhvZCwgZnVuY3Rpb24gbXV0YXRvcigpIHtcbiAgICAvLyBhdm9pZCBsZWFraW5nIGFyZ3VtZW50czpcbiAgICAvLyBodHRwOi8vanNwZXJmLmNvbS9jbG9zdXJlLXdpdGgtYXJndW1lbnRzXG4gICAgdmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGkpO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB2YXIgb2IgPSB0aGlzLl9fb2JfXztcbiAgICB2YXIgaW5zZXJ0ZWQ7XG4gICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgIGNhc2UgJ3B1c2gnOlxuICAgICAgICBpbnNlcnRlZCA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndW5zaGlmdCc6XG4gICAgICAgIGluc2VydGVkID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzcGxpY2UnOlxuICAgICAgICBpbnNlcnRlZCA9IGFyZ3Muc2xpY2UoMik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoaW5zZXJ0ZWQpIG9iLm9ic2VydmVBcnJheShpbnNlcnRlZCk7XG4gICAgLy8gbm90aWZ5IGNoYW5nZVxuICAgIG9iLmRlcC5ub3RpZnkoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9KTtcbn0pO1xuXG4vKipcbiAqIFN3YXAgdGhlIGVsZW1lbnQgYXQgdGhlIGdpdmVuIGluZGV4IHdpdGggYSBuZXcgdmFsdWVcbiAqIGFuZCBlbWl0cyBjb3JyZXNwb25kaW5nIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4geyp9IC0gcmVwbGFjZWQgZWxlbWVudFxuICovXG5cbmRlZihhcnJheVByb3RvLCAnJHNldCcsIGZ1bmN0aW9uICRzZXQoaW5kZXgsIHZhbCkge1xuICBpZiAoaW5kZXggPj0gdGhpcy5sZW5ndGgpIHtcbiAgICB0aGlzLmxlbmd0aCA9IE51bWJlcihpbmRleCkgKyAxO1xuICB9XG4gIHJldHVybiB0aGlzLnNwbGljZShpbmRleCwgMSwgdmFsKVswXTtcbn0pO1xuXG4vKipcbiAqIENvbnZlbmllbmNlIG1ldGhvZCB0byByZW1vdmUgdGhlIGVsZW1lbnQgYXQgZ2l2ZW4gaW5kZXggb3IgdGFyZ2V0IGVsZW1lbnQgcmVmZXJlbmNlLlxuICpcbiAqIEBwYXJhbSB7Kn0gaXRlbVxuICovXG5cbmRlZihhcnJheVByb3RvLCAnJHJlbW92ZScsIGZ1bmN0aW9uICRyZW1vdmUoaXRlbSkge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKCF0aGlzLmxlbmd0aCkgcmV0dXJuO1xuICB2YXIgaW5kZXggPSBpbmRleE9mKHRoaXMsIGl0ZW0pO1xuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIHJldHVybiB0aGlzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn0pO1xuXG52YXIgYXJyYXlLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYXJyYXlNZXRob2RzKTtcblxuLyoqXG4gKiBCeSBkZWZhdWx0LCB3aGVuIGEgcmVhY3RpdmUgcHJvcGVydHkgaXMgc2V0LCB0aGUgbmV3IHZhbHVlIGlzXG4gKiBhbHNvIGNvbnZlcnRlZCB0byBiZWNvbWUgcmVhY3RpdmUuIEhvd2V2ZXIgaW4gY2VydGFpbiBjYXNlcywgZS5nLlxuICogdi1mb3Igc2NvcGUgYWxpYXMgYW5kIHByb3BzLCB3ZSBkb24ndCB3YW50IHRvIGZvcmNlIGNvbnZlcnNpb25cbiAqIGJlY2F1c2UgdGhlIHZhbHVlIG1heSBiZSBhIG5lc3RlZCB2YWx1ZSB1bmRlciBhIGZyb3plbiBkYXRhIHN0cnVjdHVyZS5cbiAqXG4gKiBTbyB3aGVuZXZlciB3ZSB3YW50IHRvIHNldCBhIHJlYWN0aXZlIHByb3BlcnR5IHdpdGhvdXQgZm9yY2luZ1xuICogY29udmVyc2lvbiBvbiB0aGUgbmV3IHZhbHVlLCB3ZSB3cmFwIHRoYXQgY2FsbCBpbnNpZGUgdGhpcyBmdW5jdGlvbi5cbiAqL1xuXG52YXIgc2hvdWxkQ29udmVydCA9IHRydWU7XG5cbmZ1bmN0aW9uIHdpdGhvdXRDb252ZXJzaW9uKGZuKSB7XG4gIHNob3VsZENvbnZlcnQgPSBmYWxzZTtcbiAgZm4oKTtcbiAgc2hvdWxkQ29udmVydCA9IHRydWU7XG59XG5cbi8qKlxuICogT2JzZXJ2ZXIgY2xhc3MgdGhhdCBhcmUgYXR0YWNoZWQgdG8gZWFjaCBvYnNlcnZlZFxuICogb2JqZWN0LiBPbmNlIGF0dGFjaGVkLCB0aGUgb2JzZXJ2ZXIgY29udmVydHMgdGFyZ2V0XG4gKiBvYmplY3QncyBwcm9wZXJ0eSBrZXlzIGludG8gZ2V0dGVyL3NldHRlcnMgdGhhdFxuICogY29sbGVjdCBkZXBlbmRlbmNpZXMgYW5kIGRpc3BhdGNoZXMgdXBkYXRlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gdmFsdWVcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5cbmZ1bmN0aW9uIE9ic2VydmVyKHZhbHVlKSB7XG4gIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgdGhpcy5kZXAgPSBuZXcgRGVwKCk7XG4gIGRlZih2YWx1ZSwgJ19fb2JfXycsIHRoaXMpO1xuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICB2YXIgYXVnbWVudCA9IGhhc1Byb3RvID8gcHJvdG9BdWdtZW50IDogY29weUF1Z21lbnQ7XG4gICAgYXVnbWVudCh2YWx1ZSwgYXJyYXlNZXRob2RzLCBhcnJheUtleXMpO1xuICAgIHRoaXMub2JzZXJ2ZUFycmF5KHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLndhbGsodmFsdWUpO1xuICB9XG59XG5cbi8vIEluc3RhbmNlIG1ldGhvZHNcblxuLyoqXG4gKiBXYWxrIHRocm91Z2ggZWFjaCBwcm9wZXJ0eSBhbmQgY29udmVydCB0aGVtIGludG9cbiAqIGdldHRlci9zZXR0ZXJzLiBUaGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSBjYWxsZWQgd2hlblxuICogdmFsdWUgdHlwZSBpcyBPYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICovXG5cbk9ic2VydmVyLnByb3RvdHlwZS53YWxrID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG4gIGZvciAodmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB0aGlzLmNvbnZlcnQoa2V5c1tpXSwgb2JqW2tleXNbaV1dKTtcbiAgfVxufTtcblxuLyoqXG4gKiBPYnNlcnZlIGEgbGlzdCBvZiBBcnJheSBpdGVtcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBpdGVtc1xuICovXG5cbk9ic2VydmVyLnByb3RvdHlwZS5vYnNlcnZlQXJyYXkgPSBmdW5jdGlvbiAoaXRlbXMpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBpdGVtcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBvYnNlcnZlKGl0ZW1zW2ldKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDb252ZXJ0IGEgcHJvcGVydHkgaW50byBnZXR0ZXIvc2V0dGVyIHNvIHdlIGNhbiBlbWl0XG4gKiB0aGUgZXZlbnRzIHdoZW4gdGhlIHByb3BlcnR5IGlzIGFjY2Vzc2VkL2NoYW5nZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHsqfSB2YWxcbiAqL1xuXG5PYnNlcnZlci5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uIChrZXksIHZhbCkge1xuICBkZWZpbmVSZWFjdGl2ZSh0aGlzLnZhbHVlLCBrZXksIHZhbCk7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBvd25lciB2bSwgc28gdGhhdCB3aGVuICRzZXQvJGRlbGV0ZSBtdXRhdGlvbnNcbiAqIGhhcHBlbiB3ZSBjYW4gbm90aWZ5IG93bmVyIHZtcyB0byBwcm94eSB0aGUga2V5cyBhbmRcbiAqIGRpZ2VzdCB0aGUgd2F0Y2hlcnMuIFRoaXMgaXMgb25seSBjYWxsZWQgd2hlbiB0aGUgb2JqZWN0XG4gKiBpcyBvYnNlcnZlZCBhcyBhbiBpbnN0YW5jZSdzIHJvb3QgJGRhdGEuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKi9cblxuT2JzZXJ2ZXIucHJvdG90eXBlLmFkZFZtID0gZnVuY3Rpb24gKHZtKSB7XG4gICh0aGlzLnZtcyB8fCAodGhpcy52bXMgPSBbXSkpLnB1c2godm0pO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gb3duZXIgdm0uIFRoaXMgaXMgY2FsbGVkIHdoZW4gdGhlIG9iamVjdCBpc1xuICogc3dhcHBlZCBvdXQgYXMgYW4gaW5zdGFuY2UncyAkZGF0YSBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKi9cblxuT2JzZXJ2ZXIucHJvdG90eXBlLnJlbW92ZVZtID0gZnVuY3Rpb24gKHZtKSB7XG4gIHRoaXMudm1zLiRyZW1vdmUodm0pO1xufTtcblxuLy8gaGVscGVyc1xuXG4vKipcbiAqIEF1Z21lbnQgYW4gdGFyZ2V0IE9iamVjdCBvciBBcnJheSBieSBpbnRlcmNlcHRpbmdcbiAqIHRoZSBwcm90b3R5cGUgY2hhaW4gdXNpbmcgX19wcm90b19fXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IHRhcmdldFxuICogQHBhcmFtIHtPYmplY3R9IHNyY1xuICovXG5cbmZ1bmN0aW9uIHByb3RvQXVnbWVudCh0YXJnZXQsIHNyYykge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuICB0YXJnZXQuX19wcm90b19fID0gc3JjO1xuICAvKiBlc2xpbnQtZW5hYmxlIG5vLXByb3RvICovXG59XG5cbi8qKlxuICogQXVnbWVudCBhbiB0YXJnZXQgT2JqZWN0IG9yIEFycmF5IGJ5IGRlZmluaW5nXG4gKiBoaWRkZW4gcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gdGFyZ2V0XG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG9cbiAqL1xuXG5mdW5jdGlvbiBjb3B5QXVnbWVudCh0YXJnZXQsIHNyYywga2V5cykge1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgZGVmKHRhcmdldCwga2V5LCBzcmNba2V5XSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBdHRlbXB0IHRvIGNyZWF0ZSBhbiBvYnNlcnZlciBpbnN0YW5jZSBmb3IgYSB2YWx1ZSxcbiAqIHJldHVybnMgdGhlIG5ldyBvYnNlcnZlciBpZiBzdWNjZXNzZnVsbHkgb2JzZXJ2ZWQsXG4gKiBvciB0aGUgZXhpc3Rpbmcgb2JzZXJ2ZXIgaWYgdGhlIHZhbHVlIGFscmVhZHkgaGFzIG9uZS5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcGFyYW0ge1Z1ZX0gW3ZtXVxuICogQHJldHVybiB7T2JzZXJ2ZXJ8dW5kZWZpbmVkfVxuICogQHN0YXRpY1xuICovXG5cbmZ1bmN0aW9uIG9ic2VydmUodmFsdWUsIHZtKSB7XG4gIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgb2I7XG4gIGlmIChoYXNPd24odmFsdWUsICdfX29iX18nKSAmJiB2YWx1ZS5fX29iX18gaW5zdGFuY2VvZiBPYnNlcnZlcikge1xuICAgIG9iID0gdmFsdWUuX19vYl9fO1xuICB9IGVsc2UgaWYgKHNob3VsZENvbnZlcnQgJiYgKGlzQXJyYXkodmFsdWUpIHx8IGlzUGxhaW5PYmplY3QodmFsdWUpKSAmJiBPYmplY3QuaXNFeHRlbnNpYmxlKHZhbHVlKSAmJiAhdmFsdWUuX2lzVnVlKSB7XG4gICAgb2IgPSBuZXcgT2JzZXJ2ZXIodmFsdWUpO1xuICB9XG4gIGlmIChvYiAmJiB2bSkge1xuICAgIG9iLmFkZFZtKHZtKTtcbiAgfVxuICByZXR1cm4gb2I7XG59XG5cbi8qKlxuICogRGVmaW5lIGEgcmVhY3RpdmUgcHJvcGVydHkgb24gYW4gT2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKi9cblxuZnVuY3Rpb24gZGVmaW5lUmVhY3RpdmUob2JqLCBrZXksIHZhbCkge1xuICB2YXIgZGVwID0gbmV3IERlcCgpO1xuXG4gIHZhciBwcm9wZXJ0eSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpO1xuICBpZiAocHJvcGVydHkgJiYgcHJvcGVydHkuY29uZmlndXJhYmxlID09PSBmYWxzZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGNhdGVyIGZvciBwcmUtZGVmaW5lZCBnZXR0ZXIvc2V0dGVyc1xuICB2YXIgZ2V0dGVyID0gcHJvcGVydHkgJiYgcHJvcGVydHkuZ2V0O1xuICB2YXIgc2V0dGVyID0gcHJvcGVydHkgJiYgcHJvcGVydHkuc2V0O1xuXG4gIHZhciBjaGlsZE9iID0gb2JzZXJ2ZSh2YWwpO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uIHJlYWN0aXZlR2V0dGVyKCkge1xuICAgICAgdmFyIHZhbHVlID0gZ2V0dGVyID8gZ2V0dGVyLmNhbGwob2JqKSA6IHZhbDtcbiAgICAgIGlmIChEZXAudGFyZ2V0KSB7XG4gICAgICAgIGRlcC5kZXBlbmQoKTtcbiAgICAgICAgaWYgKGNoaWxkT2IpIHtcbiAgICAgICAgICBjaGlsZE9iLmRlcC5kZXBlbmQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICBmb3IgKHZhciBlLCBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgZSA9IHZhbHVlW2ldO1xuICAgICAgICAgICAgZSAmJiBlLl9fb2JfXyAmJiBlLl9fb2JfXy5kZXAuZGVwZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIHJlYWN0aXZlU2V0dGVyKG5ld1ZhbCkge1xuICAgICAgdmFyIHZhbHVlID0gZ2V0dGVyID8gZ2V0dGVyLmNhbGwob2JqKSA6IHZhbDtcbiAgICAgIGlmIChuZXdWYWwgPT09IHZhbHVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChzZXR0ZXIpIHtcbiAgICAgICAgc2V0dGVyLmNhbGwob2JqLCBuZXdWYWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gbmV3VmFsO1xuICAgICAgfVxuICAgICAgY2hpbGRPYiA9IG9ic2VydmUobmV3VmFsKTtcbiAgICAgIGRlcC5ub3RpZnkoKTtcbiAgICB9XG4gIH0pO1xufVxuXG5cblxudmFyIHV0aWwgPSBPYmplY3QuZnJlZXplKHtcblx0ZGVmaW5lUmVhY3RpdmU6IGRlZmluZVJlYWN0aXZlLFxuXHRzZXQ6IHNldCxcblx0ZGVsOiBkZWwsXG5cdGhhc093bjogaGFzT3duLFxuXHRpc0xpdGVyYWw6IGlzTGl0ZXJhbCxcblx0aXNSZXNlcnZlZDogaXNSZXNlcnZlZCxcblx0X3RvU3RyaW5nOiBfdG9TdHJpbmcsXG5cdHRvTnVtYmVyOiB0b051bWJlcixcblx0dG9Cb29sZWFuOiB0b0Jvb2xlYW4sXG5cdHN0cmlwUXVvdGVzOiBzdHJpcFF1b3Rlcyxcblx0Y2FtZWxpemU6IGNhbWVsaXplLFxuXHRoeXBoZW5hdGU6IGh5cGhlbmF0ZSxcblx0Y2xhc3NpZnk6IGNsYXNzaWZ5LFxuXHRiaW5kOiBiaW5kLFxuXHR0b0FycmF5OiB0b0FycmF5LFxuXHRleHRlbmQ6IGV4dGVuZCxcblx0aXNPYmplY3Q6IGlzT2JqZWN0LFxuXHRpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuXHRkZWY6IGRlZixcblx0ZGVib3VuY2U6IF9kZWJvdW5jZSxcblx0aW5kZXhPZjogaW5kZXhPZixcblx0Y2FuY2VsbGFibGU6IGNhbmNlbGxhYmxlLFxuXHRsb29zZUVxdWFsOiBsb29zZUVxdWFsLFxuXHRpc0FycmF5OiBpc0FycmF5LFxuXHRoYXNQcm90bzogaGFzUHJvdG8sXG5cdGluQnJvd3NlcjogaW5Ccm93c2VyLFxuXHRkZXZ0b29sczogZGV2dG9vbHMsXG5cdGlzSUU6IGlzSUUsXG5cdGlzSUU5OiBpc0lFOSxcblx0aXNBbmRyb2lkOiBpc0FuZHJvaWQsXG5cdGlzSW9zOiBpc0lvcyxcblx0aW9zVmVyc2lvbk1hdGNoOiBpb3NWZXJzaW9uTWF0Y2gsXG5cdGlvc1ZlcnNpb246IGlvc1ZlcnNpb24sXG5cdGhhc011dGF0aW9uT2JzZXJ2ZXJCdWc6IGhhc011dGF0aW9uT2JzZXJ2ZXJCdWcsXG5cdGdldCB0cmFuc2l0aW9uUHJvcCAoKSB7IHJldHVybiB0cmFuc2l0aW9uUHJvcDsgfSxcblx0Z2V0IHRyYW5zaXRpb25FbmRFdmVudCAoKSB7IHJldHVybiB0cmFuc2l0aW9uRW5kRXZlbnQ7IH0sXG5cdGdldCBhbmltYXRpb25Qcm9wICgpIHsgcmV0dXJuIGFuaW1hdGlvblByb3A7IH0sXG5cdGdldCBhbmltYXRpb25FbmRFdmVudCAoKSB7IHJldHVybiBhbmltYXRpb25FbmRFdmVudDsgfSxcblx0bmV4dFRpY2s6IG5leHRUaWNrLFxuXHRnZXQgX1NldCAoKSB7IHJldHVybiBfU2V0OyB9LFxuXHRxdWVyeTogcXVlcnksXG5cdGluRG9jOiBpbkRvYyxcblx0Z2V0QXR0cjogZ2V0QXR0cixcblx0Z2V0QmluZEF0dHI6IGdldEJpbmRBdHRyLFxuXHRoYXNCaW5kQXR0cjogaGFzQmluZEF0dHIsXG5cdGJlZm9yZTogYmVmb3JlLFxuXHRhZnRlcjogYWZ0ZXIsXG5cdHJlbW92ZTogcmVtb3ZlLFxuXHRwcmVwZW5kOiBwcmVwZW5kLFxuXHRyZXBsYWNlOiByZXBsYWNlLFxuXHRvbjogb24sXG5cdG9mZjogb2ZmLFxuXHRzZXRDbGFzczogc2V0Q2xhc3MsXG5cdGFkZENsYXNzOiBhZGRDbGFzcyxcblx0cmVtb3ZlQ2xhc3M6IHJlbW92ZUNsYXNzLFxuXHRleHRyYWN0Q29udGVudDogZXh0cmFjdENvbnRlbnQsXG5cdHRyaW1Ob2RlOiB0cmltTm9kZSxcblx0aXNUZW1wbGF0ZTogaXNUZW1wbGF0ZSxcblx0Y3JlYXRlQW5jaG9yOiBjcmVhdGVBbmNob3IsXG5cdGZpbmRSZWY6IGZpbmRSZWYsXG5cdG1hcE5vZGVSYW5nZTogbWFwTm9kZVJhbmdlLFxuXHRyZW1vdmVOb2RlUmFuZ2U6IHJlbW92ZU5vZGVSYW5nZSxcblx0aXNGcmFnbWVudDogaXNGcmFnbWVudCxcblx0Z2V0T3V0ZXJIVE1MOiBnZXRPdXRlckhUTUwsXG5cdG1lcmdlT3B0aW9uczogbWVyZ2VPcHRpb25zLFxuXHRyZXNvbHZlQXNzZXQ6IHJlc29sdmVBc3NldCxcblx0Y2hlY2tDb21wb25lbnRBdHRyOiBjaGVja0NvbXBvbmVudEF0dHIsXG5cdGNvbW1vblRhZ1JFOiBjb21tb25UYWdSRSxcblx0cmVzZXJ2ZWRUYWdSRTogcmVzZXJ2ZWRUYWdSRSxcblx0Z2V0IHdhcm4gKCkgeyByZXR1cm4gd2FybjsgfVxufSk7XG5cbnZhciB1aWQgPSAwO1xuXG5mdW5jdGlvbiBpbml0TWl4aW4gKFZ1ZSkge1xuICAvKipcbiAgICogVGhlIG1haW4gaW5pdCBzZXF1ZW5jZS4gVGhpcyBpcyBjYWxsZWQgZm9yIGV2ZXJ5XG4gICAqIGluc3RhbmNlLCBpbmNsdWRpbmcgb25lcyB0aGF0IGFyZSBjcmVhdGVkIGZyb20gZXh0ZW5kZWRcbiAgICogY29uc3RydWN0b3JzLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIHRoaXMgb3B0aW9ucyBvYmplY3Qgc2hvdWxkIGJlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHJlc3VsdCBvZiBtZXJnaW5nIGNsYXNzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyBhbmQgdGhlIG9wdGlvbnMgcGFzc2VkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgaW4gdG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuJGVsID0gbnVsbDtcbiAgICB0aGlzLiRwYXJlbnQgPSBvcHRpb25zLnBhcmVudDtcbiAgICB0aGlzLiRyb290ID0gdGhpcy4kcGFyZW50ID8gdGhpcy4kcGFyZW50LiRyb290IDogdGhpcztcbiAgICB0aGlzLiRjaGlsZHJlbiA9IFtdO1xuICAgIHRoaXMuJHJlZnMgPSB7fTsgLy8gY2hpbGQgdm0gcmVmZXJlbmNlc1xuICAgIHRoaXMuJGVscyA9IHt9OyAvLyBlbGVtZW50IHJlZmVyZW5jZXNcbiAgICB0aGlzLl93YXRjaGVycyA9IFtdOyAvLyBhbGwgd2F0Y2hlcnMgYXMgYW4gYXJyYXlcbiAgICB0aGlzLl9kaXJlY3RpdmVzID0gW107IC8vIGFsbCBkaXJlY3RpdmVzXG5cbiAgICAvLyBhIHVpZFxuICAgIHRoaXMuX3VpZCA9IHVpZCsrO1xuXG4gICAgLy8gYSBmbGFnIHRvIGF2b2lkIHRoaXMgYmVpbmcgb2JzZXJ2ZWRcbiAgICB0aGlzLl9pc1Z1ZSA9IHRydWU7XG5cbiAgICAvLyBldmVudHMgYm9va2tlZXBpbmdcbiAgICB0aGlzLl9ldmVudHMgPSB7fTsgLy8gcmVnaXN0ZXJlZCBjYWxsYmFja3NcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IHt9OyAvLyBmb3IgJGJyb2FkY2FzdCBvcHRpbWl6YXRpb25cblxuICAgIC8vIGZyYWdtZW50IGluc3RhbmNlIHByb3BlcnRpZXNcbiAgICB0aGlzLl9pc0ZyYWdtZW50ID0gZmFsc2U7XG4gICAgdGhpcy5fZnJhZ21lbnQgPSAvLyBAdHlwZSB7RG9jdW1lbnRGcmFnbWVudH1cbiAgICB0aGlzLl9mcmFnbWVudFN0YXJ0ID0gLy8gQHR5cGUge1RleHR8Q29tbWVudH1cbiAgICB0aGlzLl9mcmFnbWVudEVuZCA9IG51bGw7IC8vIEB0eXBlIHtUZXh0fENvbW1lbnR9XG5cbiAgICAvLyBsaWZlY3ljbGUgc3RhdGVcbiAgICB0aGlzLl9pc0NvbXBpbGVkID0gdGhpcy5faXNEZXN0cm95ZWQgPSB0aGlzLl9pc1JlYWR5ID0gdGhpcy5faXNBdHRhY2hlZCA9IHRoaXMuX2lzQmVpbmdEZXN0cm95ZWQgPSB0aGlzLl92Rm9yUmVtb3ZpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl91bmxpbmtGbiA9IG51bGw7XG5cbiAgICAvLyBjb250ZXh0OlxuICAgIC8vIGlmIHRoaXMgaXMgYSB0cmFuc2NsdWRlZCBjb21wb25lbnQsIGNvbnRleHRcbiAgICAvLyB3aWxsIGJlIHRoZSBjb21tb24gcGFyZW50IHZtIG9mIHRoaXMgaW5zdGFuY2VcbiAgICAvLyBhbmQgaXRzIGhvc3QuXG4gICAgdGhpcy5fY29udGV4dCA9IG9wdGlvbnMuX2NvbnRleHQgfHwgdGhpcy4kcGFyZW50O1xuXG4gICAgLy8gc2NvcGU6XG4gICAgLy8gaWYgdGhpcyBpcyBpbnNpZGUgYW4gaW5saW5lIHYtZm9yLCB0aGUgc2NvcGVcbiAgICAvLyB3aWxsIGJlIHRoZSBpbnRlcm1lZGlhdGUgc2NvcGUgY3JlYXRlZCBmb3IgdGhpc1xuICAgIC8vIHJlcGVhdCBmcmFnbWVudC4gdGhpcyBpcyB1c2VkIGZvciBsaW5raW5nIHByb3BzXG4gICAgLy8gYW5kIGNvbnRhaW5lciBkaXJlY3RpdmVzLlxuICAgIHRoaXMuX3Njb3BlID0gb3B0aW9ucy5fc2NvcGU7XG5cbiAgICAvLyBmcmFnbWVudDpcbiAgICAvLyBpZiB0aGlzIGluc3RhbmNlIGlzIGNvbXBpbGVkIGluc2lkZSBhIEZyYWdtZW50LCBpdFxuICAgIC8vIG5lZWRzIHRvIHJlaWdzdGVyIGl0c2VsZiBhcyBhIGNoaWxkIG9mIHRoYXQgZnJhZ21lbnRcbiAgICAvLyBmb3IgYXR0YWNoL2RldGFjaCB0byB3b3JrIHByb3Blcmx5LlxuICAgIHRoaXMuX2ZyYWcgPSBvcHRpb25zLl9mcmFnO1xuICAgIGlmICh0aGlzLl9mcmFnKSB7XG4gICAgICB0aGlzLl9mcmFnLmNoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgfVxuXG4gICAgLy8gcHVzaCBzZWxmIGludG8gcGFyZW50IC8gdHJhbnNjbHVzaW9uIGhvc3RcbiAgICBpZiAodGhpcy4kcGFyZW50KSB7XG4gICAgICB0aGlzLiRwYXJlbnQuJGNoaWxkcmVuLnB1c2godGhpcyk7XG4gICAgfVxuXG4gICAgLy8gbWVyZ2Ugb3B0aW9ucy5cbiAgICBvcHRpb25zID0gdGhpcy4kb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh0aGlzLmNvbnN0cnVjdG9yLm9wdGlvbnMsIG9wdGlvbnMsIHRoaXMpO1xuXG4gICAgLy8gc2V0IHJlZlxuICAgIHRoaXMuX3VwZGF0ZVJlZigpO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSBkYXRhIGFzIGVtcHR5IG9iamVjdC5cbiAgICAvLyBpdCB3aWxsIGJlIGZpbGxlZCB1cCBpbiBfaW5pdERhdGEoKS5cbiAgICB0aGlzLl9kYXRhID0ge307XG5cbiAgICAvLyBjYWxsIGluaXQgaG9va1xuICAgIHRoaXMuX2NhbGxIb29rKCdpbml0Jyk7XG5cbiAgICAvLyBpbml0aWFsaXplIGRhdGEgb2JzZXJ2YXRpb24gYW5kIHNjb3BlIGluaGVyaXRhbmNlLlxuICAgIHRoaXMuX2luaXRTdGF0ZSgpO1xuXG4gICAgLy8gc2V0dXAgZXZlbnQgc3lzdGVtIGFuZCBvcHRpb24gZXZlbnRzLlxuICAgIHRoaXMuX2luaXRFdmVudHMoKTtcblxuICAgIC8vIGNhbGwgY3JlYXRlZCBob29rXG4gICAgdGhpcy5fY2FsbEhvb2soJ2NyZWF0ZWQnKTtcblxuICAgIC8vIGlmIGBlbGAgb3B0aW9uIGlzIHBhc3NlZCwgc3RhcnQgY29tcGlsYXRpb24uXG4gICAgaWYgKG9wdGlvbnMuZWwpIHtcbiAgICAgIHRoaXMuJG1vdW50KG9wdGlvbnMuZWwpO1xuICAgIH1cbiAgfTtcbn1cblxudmFyIHBhdGhDYWNoZSA9IG5ldyBDYWNoZSgxMDAwKTtcblxuLy8gYWN0aW9uc1xudmFyIEFQUEVORCA9IDA7XG52YXIgUFVTSCA9IDE7XG52YXIgSU5DX1NVQl9QQVRIX0RFUFRIID0gMjtcbnZhciBQVVNIX1NVQl9QQVRIID0gMztcblxuLy8gc3RhdGVzXG52YXIgQkVGT1JFX1BBVEggPSAwO1xudmFyIElOX1BBVEggPSAxO1xudmFyIEJFRk9SRV9JREVOVCA9IDI7XG52YXIgSU5fSURFTlQgPSAzO1xudmFyIElOX1NVQl9QQVRIID0gNDtcbnZhciBJTl9TSU5HTEVfUVVPVEUgPSA1O1xudmFyIElOX0RPVUJMRV9RVU9URSA9IDY7XG52YXIgQUZURVJfUEFUSCA9IDc7XG52YXIgRVJST1IgPSA4O1xuXG52YXIgcGF0aFN0YXRlTWFjaGluZSA9IFtdO1xuXG5wYXRoU3RhdGVNYWNoaW5lW0JFRk9SRV9QQVRIXSA9IHtcbiAgJ3dzJzogW0JFRk9SRV9QQVRIXSxcbiAgJ2lkZW50JzogW0lOX0lERU5ULCBBUFBFTkRdLFxuICAnWyc6IFtJTl9TVUJfUEFUSF0sXG4gICdlb2YnOiBbQUZURVJfUEFUSF1cbn07XG5cbnBhdGhTdGF0ZU1hY2hpbmVbSU5fUEFUSF0gPSB7XG4gICd3cyc6IFtJTl9QQVRIXSxcbiAgJy4nOiBbQkVGT1JFX0lERU5UXSxcbiAgJ1snOiBbSU5fU1VCX1BBVEhdLFxuICAnZW9mJzogW0FGVEVSX1BBVEhdXG59O1xuXG5wYXRoU3RhdGVNYWNoaW5lW0JFRk9SRV9JREVOVF0gPSB7XG4gICd3cyc6IFtCRUZPUkVfSURFTlRdLFxuICAnaWRlbnQnOiBbSU5fSURFTlQsIEFQUEVORF1cbn07XG5cbnBhdGhTdGF0ZU1hY2hpbmVbSU5fSURFTlRdID0ge1xuICAnaWRlbnQnOiBbSU5fSURFTlQsIEFQUEVORF0sXG4gICcwJzogW0lOX0lERU5ULCBBUFBFTkRdLFxuICAnbnVtYmVyJzogW0lOX0lERU5ULCBBUFBFTkRdLFxuICAnd3MnOiBbSU5fUEFUSCwgUFVTSF0sXG4gICcuJzogW0JFRk9SRV9JREVOVCwgUFVTSF0sXG4gICdbJzogW0lOX1NVQl9QQVRILCBQVVNIXSxcbiAgJ2VvZic6IFtBRlRFUl9QQVRILCBQVVNIXVxufTtcblxucGF0aFN0YXRlTWFjaGluZVtJTl9TVUJfUEFUSF0gPSB7XG4gIFwiJ1wiOiBbSU5fU0lOR0xFX1FVT1RFLCBBUFBFTkRdLFxuICAnXCInOiBbSU5fRE9VQkxFX1FVT1RFLCBBUFBFTkRdLFxuICAnWyc6IFtJTl9TVUJfUEFUSCwgSU5DX1NVQl9QQVRIX0RFUFRIXSxcbiAgJ10nOiBbSU5fUEFUSCwgUFVTSF9TVUJfUEFUSF0sXG4gICdlb2YnOiBFUlJPUixcbiAgJ2Vsc2UnOiBbSU5fU1VCX1BBVEgsIEFQUEVORF1cbn07XG5cbnBhdGhTdGF0ZU1hY2hpbmVbSU5fU0lOR0xFX1FVT1RFXSA9IHtcbiAgXCInXCI6IFtJTl9TVUJfUEFUSCwgQVBQRU5EXSxcbiAgJ2VvZic6IEVSUk9SLFxuICAnZWxzZSc6IFtJTl9TSU5HTEVfUVVPVEUsIEFQUEVORF1cbn07XG5cbnBhdGhTdGF0ZU1hY2hpbmVbSU5fRE9VQkxFX1FVT1RFXSA9IHtcbiAgJ1wiJzogW0lOX1NVQl9QQVRILCBBUFBFTkRdLFxuICAnZW9mJzogRVJST1IsXG4gICdlbHNlJzogW0lOX0RPVUJMRV9RVU9URSwgQVBQRU5EXVxufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgdGhlIHR5cGUgb2YgYSBjaGFyYWN0ZXIgaW4gYSBrZXlwYXRoLlxuICpcbiAqIEBwYXJhbSB7Q2hhcn0gY2hcbiAqIEByZXR1cm4ge1N0cmluZ30gdHlwZVxuICovXG5cbmZ1bmN0aW9uIGdldFBhdGhDaGFyVHlwZShjaCkge1xuICBpZiAoY2ggPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiAnZW9mJztcbiAgfVxuXG4gIHZhciBjb2RlID0gY2guY2hhckNvZGVBdCgwKTtcblxuICBzd2l0Y2ggKGNvZGUpIHtcbiAgICBjYXNlIDB4NUI6IC8vIFtcbiAgICBjYXNlIDB4NUQ6IC8vIF1cbiAgICBjYXNlIDB4MkU6IC8vIC5cbiAgICBjYXNlIDB4MjI6IC8vIFwiXG4gICAgY2FzZSAweDI3OiAvLyAnXG4gICAgY2FzZSAweDMwOlxuICAgICAgLy8gMFxuICAgICAgcmV0dXJuIGNoO1xuXG4gICAgY2FzZSAweDVGOiAvLyBfXG4gICAgY2FzZSAweDI0OlxuICAgICAgLy8gJFxuICAgICAgcmV0dXJuICdpZGVudCc7XG5cbiAgICBjYXNlIDB4MjA6IC8vIFNwYWNlXG4gICAgY2FzZSAweDA5OiAvLyBUYWJcbiAgICBjYXNlIDB4MEE6IC8vIE5ld2xpbmVcbiAgICBjYXNlIDB4MEQ6IC8vIFJldHVyblxuICAgIGNhc2UgMHhBMDogLy8gTm8tYnJlYWsgc3BhY2VcbiAgICBjYXNlIDB4RkVGRjogLy8gQnl0ZSBPcmRlciBNYXJrXG4gICAgY2FzZSAweDIwMjg6IC8vIExpbmUgU2VwYXJhdG9yXG4gICAgY2FzZSAweDIwMjk6XG4gICAgICAvLyBQYXJhZ3JhcGggU2VwYXJhdG9yXG4gICAgICByZXR1cm4gJ3dzJztcbiAgfVxuXG4gIC8vIGEteiwgQS1aXG4gIGlmIChjb2RlID49IDB4NjEgJiYgY29kZSA8PSAweDdBIHx8IGNvZGUgPj0gMHg0MSAmJiBjb2RlIDw9IDB4NUEpIHtcbiAgICByZXR1cm4gJ2lkZW50JztcbiAgfVxuXG4gIC8vIDEtOVxuICBpZiAoY29kZSA+PSAweDMxICYmIGNvZGUgPD0gMHgzOSkge1xuICAgIHJldHVybiAnbnVtYmVyJztcbiAgfVxuXG4gIHJldHVybiAnZWxzZSc7XG59XG5cbi8qKlxuICogRm9ybWF0IGEgc3ViUGF0aCwgcmV0dXJuIGl0cyBwbGFpbiBmb3JtIGlmIGl0IGlzXG4gKiBhIGxpdGVyYWwgc3RyaW5nIG9yIG51bWJlci4gT3RoZXJ3aXNlIHByZXBlbmQgdGhlXG4gKiBkeW5hbWljIGluZGljYXRvciAoKikuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBmb3JtYXRTdWJQYXRoKHBhdGgpIHtcbiAgdmFyIHRyaW1tZWQgPSBwYXRoLnRyaW0oKTtcbiAgLy8gaW52YWxpZCBsZWFkaW5nIDBcbiAgaWYgKHBhdGguY2hhckF0KDApID09PSAnMCcgJiYgaXNOYU4ocGF0aCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGlzTGl0ZXJhbCh0cmltbWVkKSA/IHN0cmlwUXVvdGVzKHRyaW1tZWQpIDogJyonICsgdHJpbW1lZDtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIHN0cmluZyBwYXRoIGludG8gYW4gYXJyYXkgb2Ygc2VnbWVudHNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICogQHJldHVybiB7QXJyYXl8dW5kZWZpbmVkfVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHBhdGgpIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgdmFyIGluZGV4ID0gLTE7XG4gIHZhciBtb2RlID0gQkVGT1JFX1BBVEg7XG4gIHZhciBzdWJQYXRoRGVwdGggPSAwO1xuICB2YXIgYywgbmV3Q2hhciwga2V5LCB0eXBlLCB0cmFuc2l0aW9uLCBhY3Rpb24sIHR5cGVNYXA7XG5cbiAgdmFyIGFjdGlvbnMgPSBbXTtcblxuICBhY3Rpb25zW1BVU0hdID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICBrZXkgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9O1xuXG4gIGFjdGlvbnNbQVBQRU5EXSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGtleSA9IG5ld0NoYXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleSArPSBuZXdDaGFyO1xuICAgIH1cbiAgfTtcblxuICBhY3Rpb25zW0lOQ19TVUJfUEFUSF9ERVBUSF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgYWN0aW9uc1tBUFBFTkRdKCk7XG4gICAgc3ViUGF0aERlcHRoKys7XG4gIH07XG5cbiAgYWN0aW9uc1tQVVNIX1NVQl9QQVRIXSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoc3ViUGF0aERlcHRoID4gMCkge1xuICAgICAgc3ViUGF0aERlcHRoLS07XG4gICAgICBtb2RlID0gSU5fU1VCX1BBVEg7XG4gICAgICBhY3Rpb25zW0FQUEVORF0oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3ViUGF0aERlcHRoID0gMDtcbiAgICAgIGtleSA9IGZvcm1hdFN1YlBhdGgoa2V5KTtcbiAgICAgIGlmIChrZXkgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFjdGlvbnNbUFVTSF0oKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gbWF5YmVVbmVzY2FwZVF1b3RlKCkge1xuICAgIHZhciBuZXh0Q2hhciA9IHBhdGhbaW5kZXggKyAxXTtcbiAgICBpZiAobW9kZSA9PT0gSU5fU0lOR0xFX1FVT1RFICYmIG5leHRDaGFyID09PSBcIidcIiB8fCBtb2RlID09PSBJTl9ET1VCTEVfUVVPVEUgJiYgbmV4dENoYXIgPT09ICdcIicpIHtcbiAgICAgIGluZGV4Kys7XG4gICAgICBuZXdDaGFyID0gJ1xcXFwnICsgbmV4dENoYXI7XG4gICAgICBhY3Rpb25zW0FQUEVORF0oKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHdoaWxlIChtb2RlICE9IG51bGwpIHtcbiAgICBpbmRleCsrO1xuICAgIGMgPSBwYXRoW2luZGV4XTtcblxuICAgIGlmIChjID09PSAnXFxcXCcgJiYgbWF5YmVVbmVzY2FwZVF1b3RlKCkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHR5cGUgPSBnZXRQYXRoQ2hhclR5cGUoYyk7XG4gICAgdHlwZU1hcCA9IHBhdGhTdGF0ZU1hY2hpbmVbbW9kZV07XG4gICAgdHJhbnNpdGlvbiA9IHR5cGVNYXBbdHlwZV0gfHwgdHlwZU1hcFsnZWxzZSddIHx8IEVSUk9SO1xuXG4gICAgaWYgKHRyYW5zaXRpb24gPT09IEVSUk9SKSB7XG4gICAgICByZXR1cm47IC8vIHBhcnNlIGVycm9yXG4gICAgfVxuXG4gICAgbW9kZSA9IHRyYW5zaXRpb25bMF07XG4gICAgYWN0aW9uID0gYWN0aW9uc1t0cmFuc2l0aW9uWzFdXTtcbiAgICBpZiAoYWN0aW9uKSB7XG4gICAgICBuZXdDaGFyID0gdHJhbnNpdGlvblsyXTtcbiAgICAgIG5ld0NoYXIgPSBuZXdDaGFyID09PSB1bmRlZmluZWQgPyBjIDogbmV3Q2hhcjtcbiAgICAgIGlmIChhY3Rpb24oKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtb2RlID09PSBBRlRFUl9QQVRIKSB7XG4gICAgICBrZXlzLnJhdyA9IHBhdGg7XG4gICAgICByZXR1cm4ga2V5cztcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeHRlcm5hbCBwYXJzZSB0aGF0IGNoZWNrIGZvciBhIGNhY2hlIGhpdCBmaXJzdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gKiBAcmV0dXJuIHtBcnJheXx1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gcGFyc2VQYXRoKHBhdGgpIHtcbiAgdmFyIGhpdCA9IHBhdGhDYWNoZS5nZXQocGF0aCk7XG4gIGlmICghaGl0KSB7XG4gICAgaGl0ID0gcGFyc2UocGF0aCk7XG4gICAgaWYgKGhpdCkge1xuICAgICAgcGF0aENhY2hlLnB1dChwYXRoLCBoaXQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaGl0O1xufVxuXG4vKipcbiAqIEdldCBmcm9tIGFuIG9iamVjdCBmcm9tIGEgcGF0aCBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICovXG5cbmZ1bmN0aW9uIGdldFBhdGgob2JqLCBwYXRoKSB7XG4gIHJldHVybiBwYXJzZUV4cHJlc3Npb24ocGF0aCkuZ2V0KG9iaik7XG59XG5cbi8qKlxuICogV2FybiBhZ2FpbnN0IHNldHRpbmcgbm9uLWV4aXN0ZW50IHJvb3QgcGF0aCBvbiBhIHZtLlxuICovXG5cbnZhciB3YXJuTm9uRXhpc3RlbnQ7XG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICB3YXJuTm9uRXhpc3RlbnQgPSBmdW5jdGlvbiAocGF0aCwgdm0pIHtcbiAgICB3YXJuKCdZb3UgYXJlIHNldHRpbmcgYSBub24tZXhpc3RlbnQgcGF0aCBcIicgKyBwYXRoLnJhdyArICdcIiAnICsgJ29uIGEgdm0gaW5zdGFuY2UuIENvbnNpZGVyIHByZS1pbml0aWFsaXppbmcgdGhlIHByb3BlcnR5ICcgKyAnd2l0aCB0aGUgXCJkYXRhXCIgb3B0aW9uIGZvciBtb3JlIHJlbGlhYmxlIHJlYWN0aXZpdHkgJyArICdhbmQgYmV0dGVyIHBlcmZvcm1hbmNlLicsIHZtKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBTZXQgb24gYW4gb2JqZWN0IGZyb20gYSBwYXRoXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtTdHJpbmcgfCBBcnJheX0gcGF0aFxuICogQHBhcmFtIHsqfSB2YWxcbiAqL1xuXG5mdW5jdGlvbiBzZXRQYXRoKG9iaiwgcGF0aCwgdmFsKSB7XG4gIHZhciBvcmlnaW5hbCA9IG9iajtcbiAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgIHBhdGggPSBwYXJzZShwYXRoKTtcbiAgfVxuICBpZiAoIXBhdGggfHwgIWlzT2JqZWN0KG9iaikpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGxhc3QsIGtleTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBwYXRoLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGxhc3QgPSBvYmo7XG4gICAga2V5ID0gcGF0aFtpXTtcbiAgICBpZiAoa2V5LmNoYXJBdCgwKSA9PT0gJyonKSB7XG4gICAgICBrZXkgPSBwYXJzZUV4cHJlc3Npb24oa2V5LnNsaWNlKDEpKS5nZXQuY2FsbChvcmlnaW5hbCwgb3JpZ2luYWwpO1xuICAgIH1cbiAgICBpZiAoaSA8IGwgLSAxKSB7XG4gICAgICBvYmogPSBvYmpba2V5XTtcbiAgICAgIGlmICghaXNPYmplY3Qob2JqKSkge1xuICAgICAgICBvYmogPSB7fTtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgbGFzdC5faXNWdWUpIHtcbiAgICAgICAgICB3YXJuTm9uRXhpc3RlbnQocGF0aCwgbGFzdCk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0KGxhc3QsIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICBvYmouJHNldChrZXksIHZhbCk7XG4gICAgICB9IGVsc2UgaWYgKGtleSBpbiBvYmopIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBvYmouX2lzVnVlKSB7XG4gICAgICAgICAgd2Fybk5vbkV4aXN0ZW50KHBhdGgsIG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgc2V0KG9iaiwga2V5LCB2YWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxudmFyIHBhdGggPSBPYmplY3QuZnJlZXplKHtcbiAgcGFyc2VQYXRoOiBwYXJzZVBhdGgsXG4gIGdldFBhdGg6IGdldFBhdGgsXG4gIHNldFBhdGg6IHNldFBhdGhcbn0pO1xuXG52YXIgZXhwcmVzc2lvbkNhY2hlID0gbmV3IENhY2hlKDEwMDApO1xuXG52YXIgYWxsb3dlZEtleXdvcmRzID0gJ01hdGgsRGF0ZSx0aGlzLHRydWUsZmFsc2UsbnVsbCx1bmRlZmluZWQsSW5maW5pdHksTmFOLCcgKyAnaXNOYU4saXNGaW5pdGUsZGVjb2RlVVJJLGRlY29kZVVSSUNvbXBvbmVudCxlbmNvZGVVUkksJyArICdlbmNvZGVVUklDb21wb25lbnQscGFyc2VJbnQscGFyc2VGbG9hdCc7XG52YXIgYWxsb3dlZEtleXdvcmRzUkUgPSBuZXcgUmVnRXhwKCdeKCcgKyBhbGxvd2VkS2V5d29yZHMucmVwbGFjZSgvLC9nLCAnXFxcXGJ8JykgKyAnXFxcXGIpJyk7XG5cbi8vIGtleXdvcmRzIHRoYXQgZG9uJ3QgbWFrZSBzZW5zZSBpbnNpZGUgZXhwcmVzc2lvbnNcbnZhciBpbXByb3BlcktleXdvcmRzID0gJ2JyZWFrLGNhc2UsY2xhc3MsY2F0Y2gsY29uc3QsY29udGludWUsZGVidWdnZXIsZGVmYXVsdCwnICsgJ2RlbGV0ZSxkbyxlbHNlLGV4cG9ydCxleHRlbmRzLGZpbmFsbHksZm9yLGZ1bmN0aW9uLGlmLCcgKyAnaW1wb3J0LGluLGluc3RhbmNlb2YsbGV0LHJldHVybixzdXBlcixzd2l0Y2gsdGhyb3csdHJ5LCcgKyAndmFyLHdoaWxlLHdpdGgseWllbGQsZW51bSxhd2FpdCxpbXBsZW1lbnRzLHBhY2thZ2UsJyArICdwcm90ZWN0ZWQsc3RhdGljLGludGVyZmFjZSxwcml2YXRlLHB1YmxpYyc7XG52YXIgaW1wcm9wZXJLZXl3b3Jkc1JFID0gbmV3IFJlZ0V4cCgnXignICsgaW1wcm9wZXJLZXl3b3Jkcy5yZXBsYWNlKC8sL2csICdcXFxcYnwnKSArICdcXFxcYiknKTtcblxudmFyIHdzUkUgPSAvXFxzL2c7XG52YXIgbmV3bGluZVJFID0gL1xcbi9nO1xudmFyIHNhdmVSRSA9IC9bXFx7LF1cXHMqW1xcd1xcJF9dK1xccyo6fCgnKD86W14nXFxcXF18XFxcXC4pKid8XCIoPzpbXlwiXFxcXF18XFxcXC4pKlwifGAoPzpbXmBcXFxcXXxcXFxcLikqXFwkXFx7fFxcfSg/OlteYFxcXFxdfFxcXFwuKSpgfGAoPzpbXmBcXFxcXXxcXFxcLikqYCl8bmV3IHx0eXBlb2YgfHZvaWQgL2c7XG52YXIgcmVzdG9yZVJFID0gL1wiKFxcZCspXCIvZztcbnZhciBwYXRoVGVzdFJFID0gL15bQS1aYS16XyRdW1xcdyRdKig/OlxcLltBLVphLXpfJF1bXFx3JF0qfFxcWycuKj8nXFxdfFxcW1wiLio/XCJcXF18XFxbXFxkK1xcXXxcXFtbQS1aYS16XyRdW1xcdyRdKlxcXSkqJC87XG52YXIgaWRlbnRSRSA9IC9bXlxcdyRcXC5dKD86W0EtWmEtel8kXVtcXHckXSopL2c7XG52YXIgbGl0ZXJhbFZhbHVlUkUkMSA9IC9eKD86dHJ1ZXxmYWxzZXxudWxsfHVuZGVmaW5lZHxJbmZpbml0eXxOYU4pJC87XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vKipcbiAqIFNhdmUgLyBSZXdyaXRlIC8gUmVzdG9yZVxuICpcbiAqIFdoZW4gcmV3cml0aW5nIHBhdGhzIGZvdW5kIGluIGFuIGV4cHJlc3Npb24sIGl0IGlzXG4gKiBwb3NzaWJsZSBmb3IgdGhlIHNhbWUgbGV0dGVyIHNlcXVlbmNlcyB0byBiZSBmb3VuZCBpblxuICogc3RyaW5ncyBhbmQgT2JqZWN0IGxpdGVyYWwgcHJvcGVydHkga2V5cy4gVGhlcmVmb3JlIHdlXG4gKiByZW1vdmUgYW5kIHN0b3JlIHRoZXNlIHBhcnRzIGluIGEgdGVtcG9yYXJ5IGFycmF5LCBhbmRcbiAqIHJlc3RvcmUgdGhlbSBhZnRlciB0aGUgcGF0aCByZXdyaXRlLlxuICovXG5cbnZhciBzYXZlZCA9IFtdO1xuXG4vKipcbiAqIFNhdmUgcmVwbGFjZXJcbiAqXG4gKiBUaGUgc2F2ZSByZWdleCBjYW4gbWF0Y2ggdHdvIHBvc3NpYmxlIGNhc2VzOlxuICogMS4gQW4gb3BlbmluZyBvYmplY3QgbGl0ZXJhbFxuICogMi4gQSBzdHJpbmdcbiAqIElmIG1hdGNoZWQgYXMgYSBwbGFpbiBzdHJpbmcsIHdlIG5lZWQgdG8gZXNjYXBlIGl0c1xuICogbmV3bGluZXMsIHNpbmNlIHRoZSBzdHJpbmcgbmVlZHMgdG8gYmUgcHJlc2VydmVkIHdoZW5cbiAqIGdlbmVyYXRpbmcgdGhlIGZ1bmN0aW9uIGJvZHkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IGlzU3RyaW5nIC0gc3RyIGlmIG1hdGNoZWQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ30gLSBwbGFjZWhvbGRlciB3aXRoIGluZGV4XG4gKi9cblxuZnVuY3Rpb24gc2F2ZShzdHIsIGlzU3RyaW5nKSB7XG4gIHZhciBpID0gc2F2ZWQubGVuZ3RoO1xuICBzYXZlZFtpXSA9IGlzU3RyaW5nID8gc3RyLnJlcGxhY2UobmV3bGluZVJFLCAnXFxcXG4nKSA6IHN0cjtcbiAgcmV0dXJuICdcIicgKyBpICsgJ1wiJztcbn1cblxuLyoqXG4gKiBQYXRoIHJld3JpdGUgcmVwbGFjZXJcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcmF3XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gcmV3cml0ZShyYXcpIHtcbiAgdmFyIGMgPSByYXcuY2hhckF0KDApO1xuICB2YXIgcGF0aCA9IHJhdy5zbGljZSgxKTtcbiAgaWYgKGFsbG93ZWRLZXl3b3Jkc1JFLnRlc3QocGF0aCkpIHtcbiAgICByZXR1cm4gcmF3O1xuICB9IGVsc2Uge1xuICAgIHBhdGggPSBwYXRoLmluZGV4T2YoJ1wiJykgPiAtMSA/IHBhdGgucmVwbGFjZShyZXN0b3JlUkUsIHJlc3RvcmUpIDogcGF0aDtcbiAgICByZXR1cm4gYyArICdzY29wZS4nICsgcGF0aDtcbiAgfVxufVxuXG4vKipcbiAqIFJlc3RvcmUgcmVwbGFjZXJcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ30gaSAtIG1hdGNoZWQgc2F2ZSBpbmRleFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHJlc3RvcmUoc3RyLCBpKSB7XG4gIHJldHVybiBzYXZlZFtpXTtcbn1cblxuLyoqXG4gKiBSZXdyaXRlIGFuIGV4cHJlc3Npb24sIHByZWZpeGluZyBhbGwgcGF0aCBhY2Nlc3NvcnMgd2l0aFxuICogYHNjb3BlLmAgYW5kIGdlbmVyYXRlIGdldHRlci9zZXR0ZXIgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBleHBcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGVHZXR0ZXIoZXhwKSB7XG4gIGlmIChpbXByb3BlcktleXdvcmRzUkUudGVzdChleHApKSB7XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdBdm9pZCB1c2luZyByZXNlcnZlZCBrZXl3b3JkcyBpbiBleHByZXNzaW9uOiAnICsgZXhwKTtcbiAgfVxuICAvLyByZXNldCBzdGF0ZVxuICBzYXZlZC5sZW5ndGggPSAwO1xuICAvLyBzYXZlIHN0cmluZ3MgYW5kIG9iamVjdCBsaXRlcmFsIGtleXNcbiAgdmFyIGJvZHkgPSBleHAucmVwbGFjZShzYXZlUkUsIHNhdmUpLnJlcGxhY2Uod3NSRSwgJycpO1xuICAvLyByZXdyaXRlIGFsbCBwYXRoc1xuICAvLyBwYWQgMSBzcGFjZSBoZXJlIGJlY2F1c2UgdGhlIHJlZ2V4IG1hdGNoZXMgMSBleHRyYSBjaGFyXG4gIGJvZHkgPSAoJyAnICsgYm9keSkucmVwbGFjZShpZGVudFJFLCByZXdyaXRlKS5yZXBsYWNlKHJlc3RvcmVSRSwgcmVzdG9yZSk7XG4gIHJldHVybiBtYWtlR2V0dGVyRm4oYm9keSk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBnZXR0ZXIgZnVuY3Rpb24uIFJlcXVpcmVzIGV2YWwuXG4gKlxuICogV2UgaXNvbGF0ZSB0aGUgdHJ5L2NhdGNoIHNvIGl0IGRvZXNuJ3QgYWZmZWN0IHRoZVxuICogb3B0aW1pemF0aW9uIG9mIHRoZSBwYXJzZSBmdW5jdGlvbiB3aGVuIGl0IGlzIG5vdCBjYWxsZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGJvZHlcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufHVuZGVmaW5lZH1cbiAqL1xuXG5mdW5jdGlvbiBtYWtlR2V0dGVyRm4oYm9keSkge1xuICB0cnkge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLW5ldy1mdW5jICovXG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbignc2NvcGUnLCAncmV0dXJuICcgKyBib2R5ICsgJzsnKTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLW5ldy1mdW5jICovXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoZS50b1N0cmluZygpLm1hdGNoKC91bnNhZmUtZXZhbHxDU1AvKSkge1xuICAgICAgICB3YXJuKCdJdCBzZWVtcyB5b3UgYXJlIHVzaW5nIHRoZSBkZWZhdWx0IGJ1aWxkIG9mIFZ1ZS5qcyBpbiBhbiBlbnZpcm9ubWVudCAnICsgJ3dpdGggQ29udGVudCBTZWN1cml0eSBQb2xpY3kgdGhhdCBwcm9oaWJpdHMgdW5zYWZlLWV2YWwuICcgKyAnVXNlIHRoZSBDU1AtY29tcGxpYW50IGJ1aWxkIGluc3RlYWQ6ICcgKyAnaHR0cDovL3Z1ZWpzLm9yZy9ndWlkZS9pbnN0YWxsYXRpb24uaHRtbCNDU1AtY29tcGxpYW50LWJ1aWxkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuKCdJbnZhbGlkIGV4cHJlc3Npb24uICcgKyAnR2VuZXJhdGVkIGZ1bmN0aW9uIGJvZHk6ICcgKyBib2R5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vb3A7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21waWxlIGEgc2V0dGVyIGZ1bmN0aW9uIGZvciB0aGUgZXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXhwXG4gKiBAcmV0dXJuIHtGdW5jdGlvbnx1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZVNldHRlcihleHApIHtcbiAgdmFyIHBhdGggPSBwYXJzZVBhdGgoZXhwKTtcbiAgaWYgKHBhdGgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNjb3BlLCB2YWwpIHtcbiAgICAgIHNldFBhdGgoc2NvcGUsIHBhdGgsIHZhbCk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ0ludmFsaWQgc2V0dGVyIGV4cHJlc3Npb246ICcgKyBleHApO1xuICB9XG59XG5cbi8qKlxuICogUGFyc2UgYW4gZXhwcmVzc2lvbiBpbnRvIHJlLXdyaXR0ZW4gZ2V0dGVyL3NldHRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV4cFxuICogQHBhcmFtIHtCb29sZWFufSBuZWVkU2V0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUV4cHJlc3Npb24oZXhwLCBuZWVkU2V0KSB7XG4gIGV4cCA9IGV4cC50cmltKCk7XG4gIC8vIHRyeSBjYWNoZVxuICB2YXIgaGl0ID0gZXhwcmVzc2lvbkNhY2hlLmdldChleHApO1xuICBpZiAoaGl0KSB7XG4gICAgaWYgKG5lZWRTZXQgJiYgIWhpdC5zZXQpIHtcbiAgICAgIGhpdC5zZXQgPSBjb21waWxlU2V0dGVyKGhpdC5leHApO1xuICAgIH1cbiAgICByZXR1cm4gaGl0O1xuICB9XG4gIHZhciByZXMgPSB7IGV4cDogZXhwIH07XG4gIHJlcy5nZXQgPSBpc1NpbXBsZVBhdGgoZXhwKSAmJiBleHAuaW5kZXhPZignWycpIDwgMFxuICAvLyBvcHRpbWl6ZWQgc3VwZXIgc2ltcGxlIGdldHRlclxuICA/IG1ha2VHZXR0ZXJGbignc2NvcGUuJyArIGV4cClcbiAgLy8gZHluYW1pYyBnZXR0ZXJcbiAgOiBjb21waWxlR2V0dGVyKGV4cCk7XG4gIGlmIChuZWVkU2V0KSB7XG4gICAgcmVzLnNldCA9IGNvbXBpbGVTZXR0ZXIoZXhwKTtcbiAgfVxuICBleHByZXNzaW9uQ2FjaGUucHV0KGV4cCwgcmVzKTtcbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhbiBleHByZXNzaW9uIGlzIGEgc2ltcGxlIHBhdGguXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV4cFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc1NpbXBsZVBhdGgoZXhwKSB7XG4gIHJldHVybiBwYXRoVGVzdFJFLnRlc3QoZXhwKSAmJlxuICAvLyBkb24ndCB0cmVhdCBsaXRlcmFsIHZhbHVlcyBhcyBwYXRoc1xuICAhbGl0ZXJhbFZhbHVlUkUkMS50ZXN0KGV4cCkgJiZcbiAgLy8gTWF0aCBjb25zdGFudHMgZS5nLiBNYXRoLlBJLCBNYXRoLkUgZXRjLlxuICBleHAuc2xpY2UoMCwgNSkgIT09ICdNYXRoLic7XG59XG5cbnZhciBleHByZXNzaW9uID0gT2JqZWN0LmZyZWV6ZSh7XG4gIHBhcnNlRXhwcmVzc2lvbjogcGFyc2VFeHByZXNzaW9uLFxuICBpc1NpbXBsZVBhdGg6IGlzU2ltcGxlUGF0aFxufSk7XG5cbi8vIHdlIGhhdmUgdHdvIHNlcGFyYXRlIHF1ZXVlczogb25lIGZvciBkaXJlY3RpdmUgdXBkYXRlc1xuLy8gYW5kIG9uZSBmb3IgdXNlciB3YXRjaGVyIHJlZ2lzdGVyZWQgdmlhICR3YXRjaCgpLlxuLy8gd2Ugd2FudCB0byBndWFyYW50ZWUgZGlyZWN0aXZlIHVwZGF0ZXMgdG8gYmUgY2FsbGVkXG4vLyBiZWZvcmUgdXNlciB3YXRjaGVycyBzbyB0aGF0IHdoZW4gdXNlciB3YXRjaGVycyBhcmVcbi8vIHRyaWdnZXJlZCwgdGhlIERPTSB3b3VsZCBoYXZlIGFscmVhZHkgYmVlbiBpbiB1cGRhdGVkXG4vLyBzdGF0ZS5cblxudmFyIHF1ZXVlID0gW107XG52YXIgdXNlclF1ZXVlID0gW107XG52YXIgaGFzID0ge307XG52YXIgY2lyY3VsYXIgPSB7fTtcbnZhciB3YWl0aW5nID0gZmFsc2U7XG5cbi8qKlxuICogUmVzZXQgdGhlIGJhdGNoZXIncyBzdGF0ZS5cbiAqL1xuXG5mdW5jdGlvbiByZXNldEJhdGNoZXJTdGF0ZSgpIHtcbiAgcXVldWUubGVuZ3RoID0gMDtcbiAgdXNlclF1ZXVlLmxlbmd0aCA9IDA7XG4gIGhhcyA9IHt9O1xuICBjaXJjdWxhciA9IHt9O1xuICB3YWl0aW5nID0gZmFsc2U7XG59XG5cbi8qKlxuICogRmx1c2ggYm90aCBxdWV1ZXMgYW5kIHJ1biB0aGUgd2F0Y2hlcnMuXG4gKi9cblxuZnVuY3Rpb24gZmx1c2hCYXRjaGVyUXVldWUoKSB7XG4gIHZhciBfYWdhaW4gPSB0cnVlO1xuXG4gIF9mdW5jdGlvbjogd2hpbGUgKF9hZ2Fpbikge1xuICAgIF9hZ2FpbiA9IGZhbHNlO1xuXG4gICAgcnVuQmF0Y2hlclF1ZXVlKHF1ZXVlKTtcbiAgICBydW5CYXRjaGVyUXVldWUodXNlclF1ZXVlKTtcbiAgICAvLyB1c2VyIHdhdGNoZXJzIHRyaWdnZXJlZCBtb3JlIHdhdGNoZXJzLFxuICAgIC8vIGtlZXAgZmx1c2hpbmcgdW50aWwgaXQgZGVwbGV0ZXNcbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICBfYWdhaW4gPSB0cnVlO1xuICAgICAgY29udGludWUgX2Z1bmN0aW9uO1xuICAgIH1cbiAgICAvLyBkZXYgdG9vbCBob29rXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKGRldnRvb2xzICYmIGNvbmZpZy5kZXZ0b29scykge1xuICAgICAgZGV2dG9vbHMuZW1pdCgnZmx1c2gnKTtcbiAgICB9XG4gICAgcmVzZXRCYXRjaGVyU3RhdGUoKTtcbiAgfVxufVxuXG4vKipcbiAqIFJ1biB0aGUgd2F0Y2hlcnMgaW4gYSBzaW5nbGUgcXVldWUuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcXVldWVcbiAqL1xuXG5mdW5jdGlvbiBydW5CYXRjaGVyUXVldWUocXVldWUpIHtcbiAgLy8gZG8gbm90IGNhY2hlIGxlbmd0aCBiZWNhdXNlIG1vcmUgd2F0Y2hlcnMgbWlnaHQgYmUgcHVzaGVkXG4gIC8vIGFzIHdlIHJ1biBleGlzdGluZyB3YXRjaGVyc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHdhdGNoZXIgPSBxdWV1ZVtpXTtcbiAgICB2YXIgaWQgPSB3YXRjaGVyLmlkO1xuICAgIGhhc1tpZF0gPSBudWxsO1xuICAgIHdhdGNoZXIucnVuKCk7XG4gICAgLy8gaW4gZGV2IGJ1aWxkLCBjaGVjayBhbmQgc3RvcCBjaXJjdWxhciB1cGRhdGVzLlxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIGhhc1tpZF0gIT0gbnVsbCkge1xuICAgICAgY2lyY3VsYXJbaWRdID0gKGNpcmN1bGFyW2lkXSB8fCAwKSArIDE7XG4gICAgICBpZiAoY2lyY3VsYXJbaWRdID4gY29uZmlnLl9tYXhVcGRhdGVDb3VudCkge1xuICAgICAgICB3YXJuKCdZb3UgbWF5IGhhdmUgYW4gaW5maW5pdGUgdXBkYXRlIGxvb3AgZm9yIHdhdGNoZXIgJyArICd3aXRoIGV4cHJlc3Npb24gXCInICsgd2F0Y2hlci5leHByZXNzaW9uICsgJ1wiJywgd2F0Y2hlci52bSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBxdWV1ZS5sZW5ndGggPSAwO1xufVxuXG4vKipcbiAqIFB1c2ggYSB3YXRjaGVyIGludG8gdGhlIHdhdGNoZXIgcXVldWUuXG4gKiBKb2JzIHdpdGggZHVwbGljYXRlIElEcyB3aWxsIGJlIHNraXBwZWQgdW5sZXNzIGl0J3NcbiAqIHB1c2hlZCB3aGVuIHRoZSBxdWV1ZSBpcyBiZWluZyBmbHVzaGVkLlxuICpcbiAqIEBwYXJhbSB7V2F0Y2hlcn0gd2F0Y2hlclxuICogICBwcm9wZXJ0aWVzOlxuICogICAtIHtOdW1iZXJ9IGlkXG4gKiAgIC0ge0Z1bmN0aW9ufSBydW5cbiAqL1xuXG5mdW5jdGlvbiBwdXNoV2F0Y2hlcih3YXRjaGVyKSB7XG4gIHZhciBpZCA9IHdhdGNoZXIuaWQ7XG4gIGlmIChoYXNbaWRdID09IG51bGwpIHtcbiAgICAvLyBwdXNoIHdhdGNoZXIgaW50byBhcHByb3ByaWF0ZSBxdWV1ZVxuICAgIHZhciBxID0gd2F0Y2hlci51c2VyID8gdXNlclF1ZXVlIDogcXVldWU7XG4gICAgaGFzW2lkXSA9IHEubGVuZ3RoO1xuICAgIHEucHVzaCh3YXRjaGVyKTtcbiAgICAvLyBxdWV1ZSB0aGUgZmx1c2hcbiAgICBpZiAoIXdhaXRpbmcpIHtcbiAgICAgIHdhaXRpbmcgPSB0cnVlO1xuICAgICAgbmV4dFRpY2soZmx1c2hCYXRjaGVyUXVldWUpO1xuICAgIH1cbiAgfVxufVxuXG52YXIgdWlkJDIgPSAwO1xuXG4vKipcbiAqIEEgd2F0Y2hlciBwYXJzZXMgYW4gZXhwcmVzc2lvbiwgY29sbGVjdHMgZGVwZW5kZW5jaWVzLFxuICogYW5kIGZpcmVzIGNhbGxiYWNrIHdoZW4gdGhlIGV4cHJlc3Npb24gdmFsdWUgY2hhbmdlcy5cbiAqIFRoaXMgaXMgdXNlZCBmb3IgYm90aCB0aGUgJHdhdGNoKCkgYXBpIGFuZCBkaXJlY3RpdmVzLlxuICpcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IGV4cE9yRm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICAgICAgICAgICAgICAgIC0ge0FycmF5fSBmaWx0ZXJzXG4gKiAgICAgICAgICAgICAgICAgLSB7Qm9vbGVhbn0gdHdvV2F5XG4gKiAgICAgICAgICAgICAgICAgLSB7Qm9vbGVhbn0gZGVlcFxuICogICAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IHVzZXJcbiAqICAgICAgICAgICAgICAgICAtIHtCb29sZWFufSBzeW5jXG4gKiAgICAgICAgICAgICAgICAgLSB7Qm9vbGVhbn0gbGF6eVxuICogICAgICAgICAgICAgICAgIC0ge0Z1bmN0aW9ufSBbcHJlUHJvY2Vzc11cbiAqICAgICAgICAgICAgICAgICAtIHtGdW5jdGlvbn0gW3Bvc3RQcm9jZXNzXVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFdhdGNoZXIodm0sIGV4cE9yRm4sIGNiLCBvcHRpb25zKSB7XG4gIC8vIG1peCBpbiBvcHRpb25zXG4gIGlmIChvcHRpb25zKSB7XG4gICAgZXh0ZW5kKHRoaXMsIG9wdGlvbnMpO1xuICB9XG4gIHZhciBpc0ZuID0gdHlwZW9mIGV4cE9yRm4gPT09ICdmdW5jdGlvbic7XG4gIHRoaXMudm0gPSB2bTtcbiAgdm0uX3dhdGNoZXJzLnB1c2godGhpcyk7XG4gIHRoaXMuZXhwcmVzc2lvbiA9IGV4cE9yRm47XG4gIHRoaXMuY2IgPSBjYjtcbiAgdGhpcy5pZCA9ICsrdWlkJDI7IC8vIHVpZCBmb3IgYmF0Y2hpbmdcbiAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICB0aGlzLmRpcnR5ID0gdGhpcy5sYXp5OyAvLyBmb3IgbGF6eSB3YXRjaGVyc1xuICB0aGlzLmRlcHMgPSBbXTtcbiAgdGhpcy5uZXdEZXBzID0gW107XG4gIHRoaXMuZGVwSWRzID0gbmV3IF9TZXQoKTtcbiAgdGhpcy5uZXdEZXBJZHMgPSBuZXcgX1NldCgpO1xuICB0aGlzLnByZXZFcnJvciA9IG51bGw7IC8vIGZvciBhc3luYyBlcnJvciBzdGFja3NcbiAgLy8gcGFyc2UgZXhwcmVzc2lvbiBmb3IgZ2V0dGVyL3NldHRlclxuICBpZiAoaXNGbikge1xuICAgIHRoaXMuZ2V0dGVyID0gZXhwT3JGbjtcbiAgICB0aGlzLnNldHRlciA9IHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcmVzID0gcGFyc2VFeHByZXNzaW9uKGV4cE9yRm4sIHRoaXMudHdvV2F5KTtcbiAgICB0aGlzLmdldHRlciA9IHJlcy5nZXQ7XG4gICAgdGhpcy5zZXR0ZXIgPSByZXMuc2V0O1xuICB9XG4gIHRoaXMudmFsdWUgPSB0aGlzLmxhenkgPyB1bmRlZmluZWQgOiB0aGlzLmdldCgpO1xuICAvLyBzdGF0ZSBmb3IgYXZvaWRpbmcgZmFsc2UgdHJpZ2dlcnMgZm9yIGRlZXAgYW5kIEFycmF5XG4gIC8vIHdhdGNoZXJzIGR1cmluZyB2bS5fZGlnZXN0KClcbiAgdGhpcy5xdWV1ZWQgPSB0aGlzLnNoYWxsb3cgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBFdmFsdWF0ZSB0aGUgZ2V0dGVyLCBhbmQgcmUtY29sbGVjdCBkZXBlbmRlbmNpZXMuXG4gKi9cblxuV2F0Y2hlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmJlZm9yZUdldCgpO1xuICB2YXIgc2NvcGUgPSB0aGlzLnNjb3BlIHx8IHRoaXMudm07XG4gIHZhciB2YWx1ZTtcbiAgdHJ5IHtcbiAgICB2YWx1ZSA9IHRoaXMuZ2V0dGVyLmNhbGwoc2NvcGUsIHNjb3BlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIGNvbmZpZy53YXJuRXhwcmVzc2lvbkVycm9ycykge1xuICAgICAgd2FybignRXJyb3Igd2hlbiBldmFsdWF0aW5nIGV4cHJlc3Npb24gJyArICdcIicgKyB0aGlzLmV4cHJlc3Npb24gKyAnXCI6ICcgKyBlLnRvU3RyaW5nKCksIHRoaXMudm0pO1xuICAgIH1cbiAgfVxuICAvLyBcInRvdWNoXCIgZXZlcnkgcHJvcGVydHkgc28gdGhleSBhcmUgYWxsIHRyYWNrZWQgYXNcbiAgLy8gZGVwZW5kZW5jaWVzIGZvciBkZWVwIHdhdGNoaW5nXG4gIGlmICh0aGlzLmRlZXApIHtcbiAgICB0cmF2ZXJzZSh2YWx1ZSk7XG4gIH1cbiAgaWYgKHRoaXMucHJlUHJvY2Vzcykge1xuICAgIHZhbHVlID0gdGhpcy5wcmVQcm9jZXNzKHZhbHVlKTtcbiAgfVxuICBpZiAodGhpcy5maWx0ZXJzKSB7XG4gICAgdmFsdWUgPSBzY29wZS5fYXBwbHlGaWx0ZXJzKHZhbHVlLCBudWxsLCB0aGlzLmZpbHRlcnMsIGZhbHNlKTtcbiAgfVxuICBpZiAodGhpcy5wb3N0UHJvY2Vzcykge1xuICAgIHZhbHVlID0gdGhpcy5wb3N0UHJvY2Vzcyh2YWx1ZSk7XG4gIH1cbiAgdGhpcy5hZnRlckdldCgpO1xuICByZXR1cm4gdmFsdWU7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZSB3aXRoIHRoZSBzZXR0ZXIuXG4gKlxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICovXG5cbldhdGNoZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgc2NvcGUgPSB0aGlzLnNjb3BlIHx8IHRoaXMudm07XG4gIGlmICh0aGlzLmZpbHRlcnMpIHtcbiAgICB2YWx1ZSA9IHNjb3BlLl9hcHBseUZpbHRlcnModmFsdWUsIHRoaXMudmFsdWUsIHRoaXMuZmlsdGVycywgdHJ1ZSk7XG4gIH1cbiAgdHJ5IHtcbiAgICB0aGlzLnNldHRlci5jYWxsKHNjb3BlLCBzY29wZSwgdmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgY29uZmlnLndhcm5FeHByZXNzaW9uRXJyb3JzKSB7XG4gICAgICB3YXJuKCdFcnJvciB3aGVuIGV2YWx1YXRpbmcgc2V0dGVyICcgKyAnXCInICsgdGhpcy5leHByZXNzaW9uICsgJ1wiOiAnICsgZS50b1N0cmluZygpLCB0aGlzLnZtKTtcbiAgICB9XG4gIH1cbiAgLy8gdHdvLXdheSBzeW5jIGZvciB2LWZvciBhbGlhc1xuICB2YXIgZm9yQ29udGV4dCA9IHNjb3BlLiRmb3JDb250ZXh0O1xuICBpZiAoZm9yQ29udGV4dCAmJiBmb3JDb250ZXh0LmFsaWFzID09PSB0aGlzLmV4cHJlc3Npb24pIHtcbiAgICBpZiAoZm9yQ29udGV4dC5maWx0ZXJzKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ0l0IHNlZW1zIHlvdSBhcmUgdXNpbmcgdHdvLXdheSBiaW5kaW5nIG9uICcgKyAnYSB2LWZvciBhbGlhcyAoJyArIHRoaXMuZXhwcmVzc2lvbiArICcpLCBhbmQgdGhlICcgKyAndi1mb3IgaGFzIGZpbHRlcnMuIFRoaXMgd2lsbCBub3Qgd29yayBwcm9wZXJseS4gJyArICdFaXRoZXIgcmVtb3ZlIHRoZSBmaWx0ZXJzIG9yIHVzZSBhbiBhcnJheSBvZiAnICsgJ29iamVjdHMgYW5kIGJpbmQgdG8gb2JqZWN0IHByb3BlcnRpZXMgaW5zdGVhZC4nLCB0aGlzLnZtKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yQ29udGV4dC5fd2l0aExvY2soZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNjb3BlLiRrZXkpIHtcbiAgICAgICAgLy8gb3JpZ2luYWwgaXMgYW4gb2JqZWN0XG4gICAgICAgIGZvckNvbnRleHQucmF3VmFsdWVbc2NvcGUuJGtleV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvckNvbnRleHQucmF3VmFsdWUuJHNldChzY29wZS4kaW5kZXgsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBQcmVwYXJlIGZvciBkZXBlbmRlbmN5IGNvbGxlY3Rpb24uXG4gKi9cblxuV2F0Y2hlci5wcm90b3R5cGUuYmVmb3JlR2V0ID0gZnVuY3Rpb24gKCkge1xuICBEZXAudGFyZ2V0ID0gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGEgZGVwZW5kZW5jeSB0byB0aGlzIGRpcmVjdGl2ZS5cbiAqXG4gKiBAcGFyYW0ge0RlcH0gZGVwXG4gKi9cblxuV2F0Y2hlci5wcm90b3R5cGUuYWRkRGVwID0gZnVuY3Rpb24gKGRlcCkge1xuICB2YXIgaWQgPSBkZXAuaWQ7XG4gIGlmICghdGhpcy5uZXdEZXBJZHMuaGFzKGlkKSkge1xuICAgIHRoaXMubmV3RGVwSWRzLmFkZChpZCk7XG4gICAgdGhpcy5uZXdEZXBzLnB1c2goZGVwKTtcbiAgICBpZiAoIXRoaXMuZGVwSWRzLmhhcyhpZCkpIHtcbiAgICAgIGRlcC5hZGRTdWIodGhpcyk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIENsZWFuIHVwIGZvciBkZXBlbmRlbmN5IGNvbGxlY3Rpb24uXG4gKi9cblxuV2F0Y2hlci5wcm90b3R5cGUuYWZ0ZXJHZXQgPSBmdW5jdGlvbiAoKSB7XG4gIERlcC50YXJnZXQgPSBudWxsO1xuICB2YXIgaSA9IHRoaXMuZGVwcy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICB2YXIgZGVwID0gdGhpcy5kZXBzW2ldO1xuICAgIGlmICghdGhpcy5uZXdEZXBJZHMuaGFzKGRlcC5pZCkpIHtcbiAgICAgIGRlcC5yZW1vdmVTdWIodGhpcyk7XG4gICAgfVxuICB9XG4gIHZhciB0bXAgPSB0aGlzLmRlcElkcztcbiAgdGhpcy5kZXBJZHMgPSB0aGlzLm5ld0RlcElkcztcbiAgdGhpcy5uZXdEZXBJZHMgPSB0bXA7XG4gIHRoaXMubmV3RGVwSWRzLmNsZWFyKCk7XG4gIHRtcCA9IHRoaXMuZGVwcztcbiAgdGhpcy5kZXBzID0gdGhpcy5uZXdEZXBzO1xuICB0aGlzLm5ld0RlcHMgPSB0bXA7XG4gIHRoaXMubmV3RGVwcy5sZW5ndGggPSAwO1xufTtcblxuLyoqXG4gKiBTdWJzY3JpYmVyIGludGVyZmFjZS5cbiAqIFdpbGwgYmUgY2FsbGVkIHdoZW4gYSBkZXBlbmRlbmN5IGNoYW5nZXMuXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBzaGFsbG93XG4gKi9cblxuV2F0Y2hlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKHNoYWxsb3cpIHtcbiAgaWYgKHRoaXMubGF6eSkge1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHRoaXMuc3luYyB8fCAhY29uZmlnLmFzeW5jKSB7XG4gICAgdGhpcy5ydW4oKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBpZiBxdWV1ZWQsIG9ubHkgb3ZlcndyaXRlIHNoYWxsb3cgd2l0aCBub24tc2hhbGxvdyxcbiAgICAvLyBidXQgbm90IHRoZSBvdGhlciB3YXkgYXJvdW5kLlxuICAgIHRoaXMuc2hhbGxvdyA9IHRoaXMucXVldWVkID8gc2hhbGxvdyA/IHRoaXMuc2hhbGxvdyA6IGZhbHNlIDogISFzaGFsbG93O1xuICAgIHRoaXMucXVldWVkID0gdHJ1ZTtcbiAgICAvLyByZWNvcmQgYmVmb3JlLXB1c2ggZXJyb3Igc3RhY2sgaW4gZGVidWcgbW9kZVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIGNvbmZpZy5kZWJ1Zykge1xuICAgICAgdGhpcy5wcmV2RXJyb3IgPSBuZXcgRXJyb3IoJ1t2dWVdIGFzeW5jIHN0YWNrIHRyYWNlJyk7XG4gICAgfVxuICAgIHB1c2hXYXRjaGVyKHRoaXMpO1xuICB9XG59O1xuXG4vKipcbiAqIEJhdGNoZXIgam9iIGludGVyZmFjZS5cbiAqIFdpbGwgYmUgY2FsbGVkIGJ5IHRoZSBiYXRjaGVyLlxuICovXG5cbldhdGNoZXIucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5nZXQoKTtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMudmFsdWUgfHxcbiAgICAvLyBEZWVwIHdhdGNoZXJzIGFuZCB3YXRjaGVycyBvbiBPYmplY3QvQXJyYXlzIHNob3VsZCBmaXJlIGV2ZW5cbiAgICAvLyB3aGVuIHRoZSB2YWx1ZSBpcyB0aGUgc2FtZSwgYmVjYXVzZSB0aGUgdmFsdWUgbWF5XG4gICAgLy8gaGF2ZSBtdXRhdGVkOyBidXQgb25seSBkbyBzbyBpZiB0aGlzIGlzIGFcbiAgICAvLyBub24tc2hhbGxvdyB1cGRhdGUgKGNhdXNlZCBieSBhIHZtIGRpZ2VzdCkuXG4gICAgKGlzT2JqZWN0KHZhbHVlKSB8fCB0aGlzLmRlZXApICYmICF0aGlzLnNoYWxsb3cpIHtcbiAgICAgIC8vIHNldCBuZXcgdmFsdWVcbiAgICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAvLyBpbiBkZWJ1ZyArIGFzeW5jIG1vZGUsIHdoZW4gYSB3YXRjaGVyIGNhbGxiYWNrc1xuICAgICAgLy8gdGhyb3dzLCB3ZSBhbHNvIHRocm93IHRoZSBzYXZlZCBiZWZvcmUtcHVzaCBlcnJvclxuICAgICAgLy8gc28gdGhlIGZ1bGwgY3Jvc3MtdGljayBzdGFjayB0cmFjZSBpcyBhdmFpbGFibGUuXG4gICAgICB2YXIgcHJldkVycm9yID0gdGhpcy5wcmV2RXJyb3I7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIGNvbmZpZy5kZWJ1ZyAmJiBwcmV2RXJyb3IpIHtcbiAgICAgICAgdGhpcy5wcmV2RXJyb3IgPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuY2IuY2FsbCh0aGlzLnZtLCB2YWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgbmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhyb3cgcHJldkVycm9yO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2IuY2FsbCh0aGlzLnZtLCB2YWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnF1ZXVlZCA9IHRoaXMuc2hhbGxvdyA9IGZhbHNlO1xuICB9XG59O1xuXG4vKipcbiAqIEV2YWx1YXRlIHRoZSB2YWx1ZSBvZiB0aGUgd2F0Y2hlci5cbiAqIFRoaXMgb25seSBnZXRzIGNhbGxlZCBmb3IgbGF6eSB3YXRjaGVycy5cbiAqL1xuXG5XYXRjaGVyLnByb3RvdHlwZS5ldmFsdWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gYXZvaWQgb3ZlcndyaXRpbmcgYW5vdGhlciB3YXRjaGVyIHRoYXQgaXMgYmVpbmdcbiAgLy8gY29sbGVjdGVkLlxuICB2YXIgY3VycmVudCA9IERlcC50YXJnZXQ7XG4gIHRoaXMudmFsdWUgPSB0aGlzLmdldCgpO1xuICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gIERlcC50YXJnZXQgPSBjdXJyZW50O1xufTtcblxuLyoqXG4gKiBEZXBlbmQgb24gYWxsIGRlcHMgY29sbGVjdGVkIGJ5IHRoaXMgd2F0Y2hlci5cbiAqL1xuXG5XYXRjaGVyLnByb3RvdHlwZS5kZXBlbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBpID0gdGhpcy5kZXBzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIHRoaXMuZGVwc1tpXS5kZXBlbmQoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZW1vdmUgc2VsZiBmcm9tIGFsbCBkZXBlbmRlbmNpZXMnIHN1YmNyaWJlciBsaXN0LlxuICovXG5cbldhdGNoZXIucHJvdG90eXBlLnRlYXJkb3duID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAvLyByZW1vdmUgc2VsZiBmcm9tIHZtJ3Mgd2F0Y2hlciBsaXN0XG4gICAgLy8gdGhpcyBpcyBhIHNvbWV3aGF0IGV4cGVuc2l2ZSBvcGVyYXRpb24gc28gd2Ugc2tpcCBpdFxuICAgIC8vIGlmIHRoZSB2bSBpcyBiZWluZyBkZXN0cm95ZWQgb3IgaXMgcGVyZm9ybWluZyBhIHYtZm9yXG4gICAgLy8gcmUtcmVuZGVyICh0aGUgd2F0Y2hlciBsaXN0IGlzIHRoZW4gZmlsdGVyZWQgYnkgdi1mb3IpLlxuICAgIGlmICghdGhpcy52bS5faXNCZWluZ0Rlc3Ryb3llZCAmJiAhdGhpcy52bS5fdkZvclJlbW92aW5nKSB7XG4gICAgICB0aGlzLnZtLl93YXRjaGVycy4kcmVtb3ZlKHRoaXMpO1xuICAgIH1cbiAgICB2YXIgaSA9IHRoaXMuZGVwcy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdGhpcy5kZXBzW2ldLnJlbW92ZVN1Yih0aGlzKTtcbiAgICB9XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLnZtID0gdGhpcy5jYiA9IHRoaXMudmFsdWUgPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIFJlY3J1c2l2ZWx5IHRyYXZlcnNlIGFuIG9iamVjdCB0byBldm9rZSBhbGwgY29udmVydGVkXG4gKiBnZXR0ZXJzLCBzbyB0aGF0IGV2ZXJ5IG5lc3RlZCBwcm9wZXJ0eSBpbnNpZGUgdGhlIG9iamVjdFxuICogaXMgY29sbGVjdGVkIGFzIGEgXCJkZWVwXCIgZGVwZW5kZW5jeS5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICovXG5cbnZhciBzZWVuT2JqZWN0cyA9IG5ldyBfU2V0KCk7XG5mdW5jdGlvbiB0cmF2ZXJzZSh2YWwsIHNlZW4pIHtcbiAgdmFyIGkgPSB1bmRlZmluZWQsXG4gICAgICBrZXlzID0gdW5kZWZpbmVkO1xuICBpZiAoIXNlZW4pIHtcbiAgICBzZWVuID0gc2Vlbk9iamVjdHM7XG4gICAgc2Vlbi5jbGVhcigpO1xuICB9XG4gIHZhciBpc0EgPSBpc0FycmF5KHZhbCk7XG4gIHZhciBpc08gPSBpc09iamVjdCh2YWwpO1xuICBpZiAoKGlzQSB8fCBpc08pICYmIE9iamVjdC5pc0V4dGVuc2libGUodmFsKSkge1xuICAgIGlmICh2YWwuX19vYl9fKSB7XG4gICAgICB2YXIgZGVwSWQgPSB2YWwuX19vYl9fLmRlcC5pZDtcbiAgICAgIGlmIChzZWVuLmhhcyhkZXBJZCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2Vlbi5hZGQoZGVwSWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNBKSB7XG4gICAgICBpID0gdmFsLmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHRyYXZlcnNlKHZhbFtpXSwgc2Vlbik7XG4gICAgfSBlbHNlIGlmIChpc08pIHtcbiAgICAgIGtleXMgPSBPYmplY3Qua2V5cyh2YWwpO1xuICAgICAgaSA9IGtleXMubGVuZ3RoO1xuICAgICAgd2hpbGUgKGktLSkgdHJhdmVyc2UodmFsW2tleXNbaV1dLCBzZWVuKTtcbiAgICB9XG4gIH1cbn1cblxudmFyIHRleHQkMSA9IHtcblxuICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgIHRoaXMuYXR0ciA9IHRoaXMuZWwubm9kZVR5cGUgPT09IDMgPyAnZGF0YScgOiAndGV4dENvbnRlbnQnO1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZhbHVlKSB7XG4gICAgdGhpcy5lbFt0aGlzLmF0dHJdID0gX3RvU3RyaW5nKHZhbHVlKTtcbiAgfVxufTtcblxudmFyIHRlbXBsYXRlQ2FjaGUgPSBuZXcgQ2FjaGUoMTAwMCk7XG52YXIgaWRTZWxlY3RvckNhY2hlID0gbmV3IENhY2hlKDEwMDApO1xuXG52YXIgbWFwID0ge1xuICBlZmF1bHQ6IFswLCAnJywgJyddLFxuICBsZWdlbmQ6IFsxLCAnPGZpZWxkc2V0PicsICc8L2ZpZWxkc2V0PiddLFxuICB0cjogWzIsICc8dGFibGU+PHRib2R5PicsICc8L3Rib2R5PjwvdGFibGU+J10sXG4gIGNvbDogWzIsICc8dGFibGU+PHRib2R5PjwvdGJvZHk+PGNvbGdyb3VwPicsICc8L2NvbGdyb3VwPjwvdGFibGU+J11cbn07XG5cbm1hcC50ZCA9IG1hcC50aCA9IFszLCAnPHRhYmxlPjx0Ym9keT48dHI+JywgJzwvdHI+PC90Ym9keT48L3RhYmxlPiddO1xuXG5tYXAub3B0aW9uID0gbWFwLm9wdGdyb3VwID0gWzEsICc8c2VsZWN0IG11bHRpcGxlPVwibXVsdGlwbGVcIj4nLCAnPC9zZWxlY3Q+J107XG5cbm1hcC50aGVhZCA9IG1hcC50Ym9keSA9IG1hcC5jb2xncm91cCA9IG1hcC5jYXB0aW9uID0gbWFwLnRmb290ID0gWzEsICc8dGFibGU+JywgJzwvdGFibGU+J107XG5cbm1hcC5nID0gbWFwLmRlZnMgPSBtYXAuc3ltYm9sID0gbWFwLnVzZSA9IG1hcC5pbWFnZSA9IG1hcC50ZXh0ID0gbWFwLmNpcmNsZSA9IG1hcC5lbGxpcHNlID0gbWFwLmxpbmUgPSBtYXAucGF0aCA9IG1hcC5wb2x5Z29uID0gbWFwLnBvbHlsaW5lID0gbWFwLnJlY3QgPSBbMSwgJzxzdmcgJyArICd4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgJyArICd4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiAnICsgJ3htbG5zOmV2PVwiaHR0cDovL3d3dy53My5vcmcvMjAwMS94bWwtZXZlbnRzXCInICsgJ3ZlcnNpb249XCIxLjFcIj4nLCAnPC9zdmc+J107XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBub2RlIGlzIGEgc3VwcG9ydGVkIHRlbXBsYXRlIG5vZGUgd2l0aCBhXG4gKiBEb2N1bWVudEZyYWdtZW50IGNvbnRlbnQuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzUmVhbFRlbXBsYXRlKG5vZGUpIHtcbiAgcmV0dXJuIGlzVGVtcGxhdGUobm9kZSkgJiYgaXNGcmFnbWVudChub2RlLmNvbnRlbnQpO1xufVxuXG52YXIgdGFnUkUkMSA9IC88KFtcXHc6LV0rKS87XG52YXIgZW50aXR5UkUgPSAvJiM/XFx3Kz87LztcbnZhciBjb21tZW50UkUgPSAvPCEtLS87XG5cbi8qKlxuICogQ29udmVydCBhIHN0cmluZyB0ZW1wbGF0ZSB0byBhIERvY3VtZW50RnJhZ21lbnQuXG4gKiBEZXRlcm1pbmVzIGNvcnJlY3Qgd3JhcHBpbmcgYnkgdGFnIHR5cGVzLiBXcmFwcGluZ1xuICogc3RyYXRlZ3kgZm91bmQgaW4galF1ZXJ5ICYgY29tcG9uZW50L2RvbWlmeS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdGVtcGxhdGVTdHJpbmdcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmF3XG4gKiBAcmV0dXJuIHtEb2N1bWVudEZyYWdtZW50fVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnJhZ21lbnQodGVtcGxhdGVTdHJpbmcsIHJhdykge1xuICAvLyB0cnkgYSBjYWNoZSBoaXQgZmlyc3RcbiAgdmFyIGNhY2hlS2V5ID0gcmF3ID8gdGVtcGxhdGVTdHJpbmcgOiB0ZW1wbGF0ZVN0cmluZy50cmltKCk7XG4gIHZhciBoaXQgPSB0ZW1wbGF0ZUNhY2hlLmdldChjYWNoZUtleSk7XG4gIGlmIChoaXQpIHtcbiAgICByZXR1cm4gaGl0O1xuICB9XG5cbiAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHZhciB0YWdNYXRjaCA9IHRlbXBsYXRlU3RyaW5nLm1hdGNoKHRhZ1JFJDEpO1xuICB2YXIgZW50aXR5TWF0Y2ggPSBlbnRpdHlSRS50ZXN0KHRlbXBsYXRlU3RyaW5nKTtcbiAgdmFyIGNvbW1lbnRNYXRjaCA9IGNvbW1lbnRSRS50ZXN0KHRlbXBsYXRlU3RyaW5nKTtcblxuICBpZiAoIXRhZ01hdGNoICYmICFlbnRpdHlNYXRjaCAmJiAhY29tbWVudE1hdGNoKSB7XG4gICAgLy8gdGV4dCBvbmx5LCByZXR1cm4gYSBzaW5nbGUgdGV4dCBub2RlLlxuICAgIGZyYWcuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGVtcGxhdGVTdHJpbmcpKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgdGFnID0gdGFnTWF0Y2ggJiYgdGFnTWF0Y2hbMV07XG4gICAgdmFyIHdyYXAgPSBtYXBbdGFnXSB8fCBtYXAuZWZhdWx0O1xuICAgIHZhciBkZXB0aCA9IHdyYXBbMF07XG4gICAgdmFyIHByZWZpeCA9IHdyYXBbMV07XG4gICAgdmFyIHN1ZmZpeCA9IHdyYXBbMl07XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIG5vZGUuaW5uZXJIVE1MID0gcHJlZml4ICsgdGVtcGxhdGVTdHJpbmcgKyBzdWZmaXg7XG4gICAgd2hpbGUgKGRlcHRoLS0pIHtcbiAgICAgIG5vZGUgPSBub2RlLmxhc3RDaGlsZDtcbiAgICB9XG5cbiAgICB2YXIgY2hpbGQ7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uZC1hc3NpZ24gKi9cbiAgICB3aGlsZSAoY2hpbGQgPSBub2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uZC1hc3NpZ24gKi9cbiAgICAgIGZyYWcuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgIH1cbiAgfVxuICBpZiAoIXJhdykge1xuICAgIHRyaW1Ob2RlKGZyYWcpO1xuICB9XG4gIHRlbXBsYXRlQ2FjaGUucHV0KGNhY2hlS2V5LCBmcmFnKTtcbiAgcmV0dXJuIGZyYWc7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHRlbXBsYXRlIG5vZGUgdG8gYSBEb2N1bWVudEZyYWdtZW50LlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHJldHVybiB7RG9jdW1lbnRGcmFnbWVudH1cbiAqL1xuXG5mdW5jdGlvbiBub2RlVG9GcmFnbWVudChub2RlKSB7XG4gIC8vIGlmIGl0cyBhIHRlbXBsYXRlIHRhZyBhbmQgdGhlIGJyb3dzZXIgc3VwcG9ydHMgaXQsXG4gIC8vIGl0cyBjb250ZW50IGlzIGFscmVhZHkgYSBkb2N1bWVudCBmcmFnbWVudC4gSG93ZXZlciwgaU9TIFNhZmFyaSBoYXNcbiAgLy8gYnVnIHdoZW4gdXNpbmcgZGlyZWN0bHkgY2xvbmVkIHRlbXBsYXRlIGNvbnRlbnQgd2l0aCB0b3VjaFxuICAvLyBldmVudHMgYW5kIGNhbiBjYXVzZSBjcmFzaGVzIHdoZW4gdGhlIG5vZGVzIGFyZSByZW1vdmVkIGZyb20gRE9NLCBzbyB3ZVxuICAvLyBoYXZlIHRvIHRyZWF0IHRlbXBsYXRlIGVsZW1lbnRzIGFzIHN0cmluZyB0ZW1wbGF0ZXMuICgjMjgwNSlcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmIChpc1JlYWxUZW1wbGF0ZShub2RlKSkge1xuICAgIHJldHVybiBzdHJpbmdUb0ZyYWdtZW50KG5vZGUuaW5uZXJIVE1MKTtcbiAgfVxuICAvLyBzY3JpcHQgdGVtcGxhdGVcbiAgaWYgKG5vZGUudGFnTmFtZSA9PT0gJ1NDUklQVCcpIHtcbiAgICByZXR1cm4gc3RyaW5nVG9GcmFnbWVudChub2RlLnRleHRDb250ZW50KTtcbiAgfVxuICAvLyBub3JtYWwgbm9kZSwgY2xvbmUgaXQgdG8gYXZvaWQgbXV0YXRpbmcgdGhlIG9yaWdpbmFsXG4gIHZhciBjbG9uZWROb2RlID0gY2xvbmVOb2RlKG5vZGUpO1xuICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgdmFyIGNoaWxkO1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25kLWFzc2lnbiAqL1xuICB3aGlsZSAoY2hpbGQgPSBjbG9uZWROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbmQtYXNzaWduICovXG4gICAgZnJhZy5hcHBlbmRDaGlsZChjaGlsZCk7XG4gIH1cbiAgdHJpbU5vZGUoZnJhZyk7XG4gIHJldHVybiBmcmFnO1xufVxuXG4vLyBUZXN0IGZvciB0aGUgcHJlc2VuY2Ugb2YgdGhlIFNhZmFyaSB0ZW1wbGF0ZSBjbG9uaW5nIGJ1Z1xuLy8gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd3VnLmNnaT9pZD0xMzc3NTVcbnZhciBoYXNCcm9rZW5UZW1wbGF0ZSA9IChmdW5jdGlvbiAoKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gIGlmIChpbkJyb3dzZXIpIHtcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGEuaW5uZXJIVE1MID0gJzx0ZW1wbGF0ZT4xPC90ZW1wbGF0ZT4nO1xuICAgIHJldHVybiAhYS5jbG9uZU5vZGUodHJ1ZSkuZmlyc3RDaGlsZC5pbm5lckhUTUw7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59KSgpO1xuXG4vLyBUZXN0IGZvciBJRTEwLzExIHRleHRhcmVhIHBsYWNlaG9sZGVyIGNsb25lIGJ1Z1xudmFyIGhhc1RleHRhcmVhQ2xvbmVCdWcgPSAoZnVuY3Rpb24gKCkge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoaW5Ccm93c2VyKSB7XG4gICAgdmFyIHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgIHQucGxhY2Vob2xkZXIgPSAndCc7XG4gICAgcmV0dXJuIHQuY2xvbmVOb2RlKHRydWUpLnZhbHVlID09PSAndCc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59KSgpO1xuXG4vKipcbiAqIDEuIERlYWwgd2l0aCBTYWZhcmkgY2xvbmluZyBuZXN0ZWQgPHRlbXBsYXRlPiBidWcgYnlcbiAqICAgIG1hbnVhbGx5IGNsb25pbmcgYWxsIHRlbXBsYXRlIGluc3RhbmNlcy5cbiAqIDIuIERlYWwgd2l0aCBJRTEwLzExIHRleHRhcmVhIHBsYWNlaG9sZGVyIGJ1ZyBieSBzZXR0aW5nXG4gKiAgICB0aGUgY29ycmVjdCB2YWx1ZSBhZnRlciBjbG9uaW5nLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fSBub2RlXG4gKiBAcmV0dXJuIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9XG4gKi9cblxuZnVuY3Rpb24gY2xvbmVOb2RlKG5vZGUpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICghbm9kZS5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgcmV0dXJuIG5vZGUuY2xvbmVOb2RlKCk7XG4gIH1cbiAgdmFyIHJlcyA9IG5vZGUuY2xvbmVOb2RlKHRydWUpO1xuICB2YXIgaSwgb3JpZ2luYWwsIGNsb25lZDtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmIChoYXNCcm9rZW5UZW1wbGF0ZSkge1xuICAgIHZhciB0ZW1wQ2xvbmUgPSByZXM7XG4gICAgaWYgKGlzUmVhbFRlbXBsYXRlKG5vZGUpKSB7XG4gICAgICBub2RlID0gbm9kZS5jb250ZW50O1xuICAgICAgdGVtcENsb25lID0gcmVzLmNvbnRlbnQ7XG4gICAgfVxuICAgIG9yaWdpbmFsID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCd0ZW1wbGF0ZScpO1xuICAgIGlmIChvcmlnaW5hbC5sZW5ndGgpIHtcbiAgICAgIGNsb25lZCA9IHRlbXBDbG9uZS5xdWVyeVNlbGVjdG9yQWxsKCd0ZW1wbGF0ZScpO1xuICAgICAgaSA9IGNsb25lZC5sZW5ndGg7XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGNsb25lZFtpXS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChjbG9uZU5vZGUob3JpZ2luYWxbaV0pLCBjbG9uZWRbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKGhhc1RleHRhcmVhQ2xvbmVCdWcpIHtcbiAgICBpZiAobm9kZS50YWdOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICByZXMudmFsdWUgPSBub2RlLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcmlnaW5hbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgndGV4dGFyZWEnKTtcbiAgICAgIGlmIChvcmlnaW5hbC5sZW5ndGgpIHtcbiAgICAgICAgY2xvbmVkID0gcmVzLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RleHRhcmVhJyk7XG4gICAgICAgIGkgPSBjbG9uZWQubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgY2xvbmVkW2ldLnZhbHVlID0gb3JpZ2luYWxbaV0udmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBQcm9jZXNzIHRoZSB0ZW1wbGF0ZSBvcHRpb24gYW5kIG5vcm1hbGl6ZXMgaXQgaW50byBhXG4gKiBhIERvY3VtZW50RnJhZ21lbnQgdGhhdCBjYW4gYmUgdXNlZCBhcyBhIHBhcnRpYWwgb3IgYVxuICogaW5zdGFuY2UgdGVtcGxhdGUuXG4gKlxuICogQHBhcmFtIHsqfSB0ZW1wbGF0ZVxuICogICAgICAgIFBvc3NpYmxlIHZhbHVlcyBpbmNsdWRlOlxuICogICAgICAgIC0gRG9jdW1lbnRGcmFnbWVudCBvYmplY3RcbiAqICAgICAgICAtIE5vZGUgb2JqZWN0IG9mIHR5cGUgVGVtcGxhdGVcbiAqICAgICAgICAtIGlkIHNlbGVjdG9yOiAnI3NvbWUtdGVtcGxhdGUtaWQnXG4gKiAgICAgICAgLSB0ZW1wbGF0ZSBzdHJpbmc6ICc8ZGl2PjxzcGFuPnt7bXNnfX08L3NwYW4+PC9kaXY+J1xuICogQHBhcmFtIHtCb29sZWFufSBzaG91bGRDbG9uZVxuICogQHBhcmFtIHtCb29sZWFufSByYXdcbiAqICAgICAgICBpbmxpbmUgSFRNTCBpbnRlcnBvbGF0aW9uLiBEbyBub3QgY2hlY2sgZm9yIGlkXG4gKiAgICAgICAgc2VsZWN0b3IgYW5kIGtlZXAgd2hpdGVzcGFjZSBpbiB0aGUgc3RyaW5nLlxuICogQHJldHVybiB7RG9jdW1lbnRGcmFnbWVudHx1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSwgc2hvdWxkQ2xvbmUsIHJhdykge1xuICB2YXIgbm9kZSwgZnJhZztcblxuICAvLyBpZiB0aGUgdGVtcGxhdGUgaXMgYWxyZWFkeSBhIGRvY3VtZW50IGZyYWdtZW50LFxuICAvLyBkbyBub3RoaW5nXG4gIGlmIChpc0ZyYWdtZW50KHRlbXBsYXRlKSkge1xuICAgIHRyaW1Ob2RlKHRlbXBsYXRlKTtcbiAgICByZXR1cm4gc2hvdWxkQ2xvbmUgPyBjbG9uZU5vZGUodGVtcGxhdGUpIDogdGVtcGxhdGU7XG4gIH1cblxuICBpZiAodHlwZW9mIHRlbXBsYXRlID09PSAnc3RyaW5nJykge1xuICAgIC8vIGlkIHNlbGVjdG9yXG4gICAgaWYgKCFyYXcgJiYgdGVtcGxhdGUuY2hhckF0KDApID09PSAnIycpIHtcbiAgICAgIC8vIGlkIHNlbGVjdG9yIGNhbiBiZSBjYWNoZWQgdG9vXG4gICAgICBmcmFnID0gaWRTZWxlY3RvckNhY2hlLmdldCh0ZW1wbGF0ZSk7XG4gICAgICBpZiAoIWZyYWcpIHtcbiAgICAgICAgbm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRlbXBsYXRlLnNsaWNlKDEpKTtcbiAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICBmcmFnID0gbm9kZVRvRnJhZ21lbnQobm9kZSk7XG4gICAgICAgICAgLy8gc2F2ZSBzZWxlY3RvciB0byBjYWNoZVxuICAgICAgICAgIGlkU2VsZWN0b3JDYWNoZS5wdXQodGVtcGxhdGUsIGZyYWcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG5vcm1hbCBzdHJpbmcgdGVtcGxhdGVcbiAgICAgIGZyYWcgPSBzdHJpbmdUb0ZyYWdtZW50KHRlbXBsYXRlLCByYXcpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0ZW1wbGF0ZS5ub2RlVHlwZSkge1xuICAgIC8vIGEgZGlyZWN0IG5vZGVcbiAgICBmcmFnID0gbm9kZVRvRnJhZ21lbnQodGVtcGxhdGUpO1xuICB9XG5cbiAgcmV0dXJuIGZyYWcgJiYgc2hvdWxkQ2xvbmUgPyBjbG9uZU5vZGUoZnJhZykgOiBmcmFnO1xufVxuXG52YXIgdGVtcGxhdGUgPSBPYmplY3QuZnJlZXplKHtcbiAgY2xvbmVOb2RlOiBjbG9uZU5vZGUsXG4gIHBhcnNlVGVtcGxhdGU6IHBhcnNlVGVtcGxhdGVcbn0pO1xuXG52YXIgaHRtbCA9IHtcblxuICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgIC8vIGEgY29tbWVudCBub2RlIG1lYW5zIHRoaXMgaXMgYSBiaW5kaW5nIGZvclxuICAgIC8vIHt7eyBpbmxpbmUgdW5lc2NhcGVkIGh0bWwgfX19XG4gICAgaWYgKHRoaXMuZWwubm9kZVR5cGUgPT09IDgpIHtcbiAgICAgIC8vIGhvbGQgbm9kZXNcbiAgICAgIHRoaXMubm9kZXMgPSBbXTtcbiAgICAgIC8vIHJlcGxhY2UgdGhlIHBsYWNlaG9sZGVyIHdpdGggcHJvcGVyIGFuY2hvclxuICAgICAgdGhpcy5hbmNob3IgPSBjcmVhdGVBbmNob3IoJ3YtaHRtbCcpO1xuICAgICAgcmVwbGFjZSh0aGlzLmVsLCB0aGlzLmFuY2hvcik7XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZhbHVlKSB7XG4gICAgdmFsdWUgPSBfdG9TdHJpbmcodmFsdWUpO1xuICAgIGlmICh0aGlzLm5vZGVzKSB7XG4gICAgICB0aGlzLnN3YXAodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVsLmlubmVySFRNTCA9IHZhbHVlO1xuICAgIH1cbiAgfSxcblxuICBzd2FwOiBmdW5jdGlvbiBzd2FwKHZhbHVlKSB7XG4gICAgLy8gcmVtb3ZlIG9sZCBub2Rlc1xuICAgIHZhciBpID0gdGhpcy5ub2Rlcy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgcmVtb3ZlKHRoaXMubm9kZXNbaV0pO1xuICAgIH1cbiAgICAvLyBjb252ZXJ0IG5ldyB2YWx1ZSB0byBhIGZyYWdtZW50XG4gICAgLy8gZG8gbm90IGF0dGVtcHQgdG8gcmV0cmlldmUgZnJvbSBpZCBzZWxlY3RvclxuICAgIHZhciBmcmFnID0gcGFyc2VUZW1wbGF0ZSh2YWx1ZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgLy8gc2F2ZSBhIHJlZmVyZW5jZSB0byB0aGVzZSBub2RlcyBzbyB3ZSBjYW4gcmVtb3ZlIGxhdGVyXG4gICAgdGhpcy5ub2RlcyA9IHRvQXJyYXkoZnJhZy5jaGlsZE5vZGVzKTtcbiAgICBiZWZvcmUoZnJhZywgdGhpcy5hbmNob3IpO1xuICB9XG59O1xuXG4vKipcbiAqIEFic3RyYWN0aW9uIGZvciBhIHBhcnRpYWxseS1jb21waWxlZCBmcmFnbWVudC5cbiAqIENhbiBvcHRpb25hbGx5IGNvbXBpbGUgY29udGVudCB3aXRoIGEgY2hpbGQgc2NvcGUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlua2VyXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7RG9jdW1lbnRGcmFnbWVudH0gZnJhZ1xuICogQHBhcmFtIHtWdWV9IFtob3N0XVxuICogQHBhcmFtIHtPYmplY3R9IFtzY29wZV1cbiAqIEBwYXJhbSB7RnJhZ21lbnR9IFtwYXJlbnRGcmFnXVxuICovXG5mdW5jdGlvbiBGcmFnbWVudChsaW5rZXIsIHZtLCBmcmFnLCBob3N0LCBzY29wZSwgcGFyZW50RnJhZykge1xuICB0aGlzLmNoaWxkcmVuID0gW107XG4gIHRoaXMuY2hpbGRGcmFncyA9IFtdO1xuICB0aGlzLnZtID0gdm07XG4gIHRoaXMuc2NvcGUgPSBzY29wZTtcbiAgdGhpcy5pbnNlcnRlZCA9IGZhbHNlO1xuICB0aGlzLnBhcmVudEZyYWcgPSBwYXJlbnRGcmFnO1xuICBpZiAocGFyZW50RnJhZykge1xuICAgIHBhcmVudEZyYWcuY2hpbGRGcmFncy5wdXNoKHRoaXMpO1xuICB9XG4gIHRoaXMudW5saW5rID0gbGlua2VyKHZtLCBmcmFnLCBob3N0LCBzY29wZSwgdGhpcyk7XG4gIHZhciBzaW5nbGUgPSB0aGlzLnNpbmdsZSA9IGZyYWcuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEgJiZcbiAgLy8gZG8gbm90IGdvIHNpbmdsZSBtb2RlIGlmIHRoZSBvbmx5IG5vZGUgaXMgYW4gYW5jaG9yXG4gICFmcmFnLmNoaWxkTm9kZXNbMF0uX192X2FuY2hvcjtcbiAgaWYgKHNpbmdsZSkge1xuICAgIHRoaXMubm9kZSA9IGZyYWcuY2hpbGROb2Rlc1swXTtcbiAgICB0aGlzLmJlZm9yZSA9IHNpbmdsZUJlZm9yZTtcbiAgICB0aGlzLnJlbW92ZSA9IHNpbmdsZVJlbW92ZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm5vZGUgPSBjcmVhdGVBbmNob3IoJ2ZyYWdtZW50LXN0YXJ0Jyk7XG4gICAgdGhpcy5lbmQgPSBjcmVhdGVBbmNob3IoJ2ZyYWdtZW50LWVuZCcpO1xuICAgIHRoaXMuZnJhZyA9IGZyYWc7XG4gICAgcHJlcGVuZCh0aGlzLm5vZGUsIGZyYWcpO1xuICAgIGZyYWcuYXBwZW5kQ2hpbGQodGhpcy5lbmQpO1xuICAgIHRoaXMuYmVmb3JlID0gbXVsdGlCZWZvcmU7XG4gICAgdGhpcy5yZW1vdmUgPSBtdWx0aVJlbW92ZTtcbiAgfVxuICB0aGlzLm5vZGUuX192X2ZyYWcgPSB0aGlzO1xufVxuXG4vKipcbiAqIENhbGwgYXR0YWNoL2RldGFjaCBmb3IgYWxsIGNvbXBvbmVudHMgY29udGFpbmVkIHdpdGhpblxuICogdGhpcyBmcmFnbWVudC4gQWxzbyBkbyBzbyByZWN1cnNpdmVseSBmb3IgYWxsIGNoaWxkXG4gKiBmcmFnbWVudHMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaG9va1xuICovXG5cbkZyYWdtZW50LnByb3RvdHlwZS5jYWxsSG9vayA9IGZ1bmN0aW9uIChob29rKSB7XG4gIHZhciBpLCBsO1xuICBmb3IgKGkgPSAwLCBsID0gdGhpcy5jaGlsZEZyYWdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHRoaXMuY2hpbGRGcmFnc1tpXS5jYWxsSG9vayhob29rKTtcbiAgfVxuICBmb3IgKGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBob29rKHRoaXMuY2hpbGRyZW5baV0pO1xuICB9XG59O1xuXG4vKipcbiAqIEluc2VydCBmcmFnbWVudCBiZWZvcmUgdGFyZ2V0LCBzaW5nbGUgbm9kZSB2ZXJzaW9uXG4gKlxuICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gd2l0aFRyYW5zaXRpb25cbiAqL1xuXG5mdW5jdGlvbiBzaW5nbGVCZWZvcmUodGFyZ2V0LCB3aXRoVHJhbnNpdGlvbikge1xuICB0aGlzLmluc2VydGVkID0gdHJ1ZTtcbiAgdmFyIG1ldGhvZCA9IHdpdGhUcmFuc2l0aW9uICE9PSBmYWxzZSA/IGJlZm9yZVdpdGhUcmFuc2l0aW9uIDogYmVmb3JlO1xuICBtZXRob2QodGhpcy5ub2RlLCB0YXJnZXQsIHRoaXMudm0pO1xuICBpZiAoaW5Eb2ModGhpcy5ub2RlKSkge1xuICAgIHRoaXMuY2FsbEhvb2soYXR0YWNoKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSBmcmFnbWVudCwgc2luZ2xlIG5vZGUgdmVyc2lvblxuICovXG5cbmZ1bmN0aW9uIHNpbmdsZVJlbW92ZSgpIHtcbiAgdGhpcy5pbnNlcnRlZCA9IGZhbHNlO1xuICB2YXIgc2hvdWxkQ2FsbFJlbW92ZSA9IGluRG9jKHRoaXMubm9kZSk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5iZWZvcmVSZW1vdmUoKTtcbiAgcmVtb3ZlV2l0aFRyYW5zaXRpb24odGhpcy5ub2RlLCB0aGlzLnZtLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHNob3VsZENhbGxSZW1vdmUpIHtcbiAgICAgIHNlbGYuY2FsbEhvb2soZGV0YWNoKTtcbiAgICB9XG4gICAgc2VsZi5kZXN0cm95KCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEluc2VydCBmcmFnbWVudCBiZWZvcmUgdGFyZ2V0LCBtdWx0aS1ub2RlcyB2ZXJzaW9uXG4gKlxuICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gd2l0aFRyYW5zaXRpb25cbiAqL1xuXG5mdW5jdGlvbiBtdWx0aUJlZm9yZSh0YXJnZXQsIHdpdGhUcmFuc2l0aW9uKSB7XG4gIHRoaXMuaW5zZXJ0ZWQgPSB0cnVlO1xuICB2YXIgdm0gPSB0aGlzLnZtO1xuICB2YXIgbWV0aG9kID0gd2l0aFRyYW5zaXRpb24gIT09IGZhbHNlID8gYmVmb3JlV2l0aFRyYW5zaXRpb24gOiBiZWZvcmU7XG4gIG1hcE5vZGVSYW5nZSh0aGlzLm5vZGUsIHRoaXMuZW5kLCBmdW5jdGlvbiAobm9kZSkge1xuICAgIG1ldGhvZChub2RlLCB0YXJnZXQsIHZtKTtcbiAgfSk7XG4gIGlmIChpbkRvYyh0aGlzLm5vZGUpKSB7XG4gICAgdGhpcy5jYWxsSG9vayhhdHRhY2gpO1xuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlIGZyYWdtZW50LCBtdWx0aS1ub2RlcyB2ZXJzaW9uXG4gKi9cblxuZnVuY3Rpb24gbXVsdGlSZW1vdmUoKSB7XG4gIHRoaXMuaW5zZXJ0ZWQgPSBmYWxzZTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgc2hvdWxkQ2FsbFJlbW92ZSA9IGluRG9jKHRoaXMubm9kZSk7XG4gIHRoaXMuYmVmb3JlUmVtb3ZlKCk7XG4gIHJlbW92ZU5vZGVSYW5nZSh0aGlzLm5vZGUsIHRoaXMuZW5kLCB0aGlzLnZtLCB0aGlzLmZyYWcsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoc2hvdWxkQ2FsbFJlbW92ZSkge1xuICAgICAgc2VsZi5jYWxsSG9vayhkZXRhY2gpO1xuICAgIH1cbiAgICBzZWxmLmRlc3Ryb3koKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUHJlcGFyZSB0aGUgZnJhZ21lbnQgZm9yIHJlbW92YWwuXG4gKi9cblxuRnJhZ21lbnQucHJvdG90eXBlLmJlZm9yZVJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGksIGw7XG4gIGZvciAoaSA9IDAsIGwgPSB0aGlzLmNoaWxkRnJhZ3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgLy8gY2FsbCB0aGUgc2FtZSBtZXRob2QgcmVjdXJzaXZlbHkgb24gY2hpbGRcbiAgICAvLyBmcmFnbWVudHMsIGRlcHRoLWZpcnN0XG4gICAgdGhpcy5jaGlsZEZyYWdzW2ldLmJlZm9yZVJlbW92ZShmYWxzZSk7XG4gIH1cbiAgZm9yIChpID0gMCwgbCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgLy8gQ2FsbCBkZXN0cm95IGZvciBhbGwgY29udGFpbmVkIGluc3RhbmNlcyxcbiAgICAvLyB3aXRoIHJlbW92ZTpmYWxzZSBhbmQgZGVmZXI6dHJ1ZS5cbiAgICAvLyBEZWZlciBpcyBuZWNlc3NhcnkgYmVjYXVzZSB3ZSBuZWVkIHRvXG4gICAgLy8ga2VlcCB0aGUgY2hpbGRyZW4gdG8gY2FsbCBkZXRhY2ggaG9va3NcbiAgICAvLyBvbiB0aGVtLlxuICAgIHRoaXMuY2hpbGRyZW5baV0uJGRlc3Ryb3koZmFsc2UsIHRydWUpO1xuICB9XG4gIHZhciBkaXJzID0gdGhpcy51bmxpbmsuZGlycztcbiAgZm9yIChpID0gMCwgbCA9IGRpcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgLy8gZGlzYWJsZSB0aGUgd2F0Y2hlcnMgb24gYWxsIHRoZSBkaXJlY3RpdmVzXG4gICAgLy8gc28gdGhhdCB0aGUgcmVuZGVyZWQgY29udGVudCBzdGF5cyB0aGUgc2FtZVxuICAgIC8vIGR1cmluZyByZW1vdmFsLlxuICAgIGRpcnNbaV0uX3dhdGNoZXIgJiYgZGlyc1tpXS5fd2F0Y2hlci50ZWFyZG93bigpO1xuICB9XG59O1xuXG4vKipcbiAqIERlc3Ryb3kgdGhlIGZyYWdtZW50LlxuICovXG5cbkZyYWdtZW50LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5wYXJlbnRGcmFnKSB7XG4gICAgdGhpcy5wYXJlbnRGcmFnLmNoaWxkRnJhZ3MuJHJlbW92ZSh0aGlzKTtcbiAgfVxuICB0aGlzLm5vZGUuX192X2ZyYWcgPSBudWxsO1xuICB0aGlzLnVubGluaygpO1xufTtcblxuLyoqXG4gKiBDYWxsIGF0dGFjaCBob29rIGZvciBhIFZ1ZSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0ge1Z1ZX0gY2hpbGRcbiAqL1xuXG5mdW5jdGlvbiBhdHRhY2goY2hpbGQpIHtcbiAgaWYgKCFjaGlsZC5faXNBdHRhY2hlZCAmJiBpbkRvYyhjaGlsZC4kZWwpKSB7XG4gICAgY2hpbGQuX2NhbGxIb29rKCdhdHRhY2hlZCcpO1xuICB9XG59XG5cbi8qKlxuICogQ2FsbCBkZXRhY2ggaG9vayBmb3IgYSBWdWUgaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIHtWdWV9IGNoaWxkXG4gKi9cblxuZnVuY3Rpb24gZGV0YWNoKGNoaWxkKSB7XG4gIGlmIChjaGlsZC5faXNBdHRhY2hlZCAmJiAhaW5Eb2MoY2hpbGQuJGVsKSkge1xuICAgIGNoaWxkLl9jYWxsSG9vaygnZGV0YWNoZWQnKTtcbiAgfVxufVxuXG52YXIgbGlua2VyQ2FjaGUgPSBuZXcgQ2FjaGUoNTAwMCk7XG5cbi8qKlxuICogQSBmYWN0b3J5IHRoYXQgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIGluc3RhbmNlcyBvZiBhXG4gKiBmcmFnbWVudC4gQ2FjaGVzIHRoZSBjb21waWxlZCBsaW5rZXIgaWYgcG9zc2libGUuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0VsZW1lbnR8U3RyaW5nfSBlbFxuICovXG5mdW5jdGlvbiBGcmFnbWVudEZhY3Rvcnkodm0sIGVsKSB7XG4gIHRoaXMudm0gPSB2bTtcbiAgdmFyIHRlbXBsYXRlO1xuICB2YXIgaXNTdHJpbmcgPSB0eXBlb2YgZWwgPT09ICdzdHJpbmcnO1xuICBpZiAoaXNTdHJpbmcgfHwgaXNUZW1wbGF0ZShlbCkgJiYgIWVsLmhhc0F0dHJpYnV0ZSgndi1pZicpKSB7XG4gICAgdGVtcGxhdGUgPSBwYXJzZVRlbXBsYXRlKGVsLCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB0ZW1wbGF0ZS5hcHBlbmRDaGlsZChlbCk7XG4gIH1cbiAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAvLyBsaW5rZXIgY2FuIGJlIGNhY2hlZCwgYnV0IG9ubHkgZm9yIGNvbXBvbmVudHNcbiAgdmFyIGxpbmtlcjtcbiAgdmFyIGNpZCA9IHZtLmNvbnN0cnVjdG9yLmNpZDtcbiAgaWYgKGNpZCA+IDApIHtcbiAgICB2YXIgY2FjaGVJZCA9IGNpZCArIChpc1N0cmluZyA/IGVsIDogZ2V0T3V0ZXJIVE1MKGVsKSk7XG4gICAgbGlua2VyID0gbGlua2VyQ2FjaGUuZ2V0KGNhY2hlSWQpO1xuICAgIGlmICghbGlua2VyKSB7XG4gICAgICBsaW5rZXIgPSBjb21waWxlKHRlbXBsYXRlLCB2bS4kb3B0aW9ucywgdHJ1ZSk7XG4gICAgICBsaW5rZXJDYWNoZS5wdXQoY2FjaGVJZCwgbGlua2VyKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGlua2VyID0gY29tcGlsZSh0ZW1wbGF0ZSwgdm0uJG9wdGlvbnMsIHRydWUpO1xuICB9XG4gIHRoaXMubGlua2VyID0gbGlua2VyO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGZyYWdtZW50IGluc3RhbmNlIHdpdGggZ2l2ZW4gaG9zdCBhbmQgc2NvcGUuXG4gKlxuICogQHBhcmFtIHtWdWV9IGhvc3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBzY29wZVxuICogQHBhcmFtIHtGcmFnbWVudH0gcGFyZW50RnJhZ1xuICovXG5cbkZyYWdtZW50RmFjdG9yeS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKGhvc3QsIHNjb3BlLCBwYXJlbnRGcmFnKSB7XG4gIHZhciBmcmFnID0gY2xvbmVOb2RlKHRoaXMudGVtcGxhdGUpO1xuICByZXR1cm4gbmV3IEZyYWdtZW50KHRoaXMubGlua2VyLCB0aGlzLnZtLCBmcmFnLCBob3N0LCBzY29wZSwgcGFyZW50RnJhZyk7XG59O1xuXG52YXIgT04gPSA3MDA7XG52YXIgTU9ERUwgPSA4MDA7XG52YXIgQklORCA9IDg1MDtcbnZhciBUUkFOU0lUSU9OID0gMTEwMDtcbnZhciBFTCA9IDE1MDA7XG52YXIgQ09NUE9ORU5UID0gMTUwMDtcbnZhciBQQVJUSUFMID0gMTc1MDtcbnZhciBJRiA9IDIxMDA7XG52YXIgRk9SID0gMjIwMDtcbnZhciBTTE9UID0gMjMwMDtcblxudmFyIHVpZCQzID0gMDtcblxudmFyIHZGb3IgPSB7XG5cbiAgcHJpb3JpdHk6IEZPUixcbiAgdGVybWluYWw6IHRydWUsXG5cbiAgcGFyYW1zOiBbJ3RyYWNrLWJ5JywgJ3N0YWdnZXInLCAnZW50ZXItc3RhZ2dlcicsICdsZWF2ZS1zdGFnZ2VyJ10sXG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAvLyBzdXBwb3J0IFwiaXRlbSBpbi9vZiBpdGVtc1wiIHN5bnRheFxuICAgIHZhciBpbk1hdGNoID0gdGhpcy5leHByZXNzaW9uLm1hdGNoKC8oLiopICg/OmlufG9mKSAoLiopLyk7XG4gICAgaWYgKGluTWF0Y2gpIHtcbiAgICAgIHZhciBpdE1hdGNoID0gaW5NYXRjaFsxXS5tYXRjaCgvXFwoKC4qKSwoLiopXFwpLyk7XG4gICAgICBpZiAoaXRNYXRjaCkge1xuICAgICAgICB0aGlzLml0ZXJhdG9yID0gaXRNYXRjaFsxXS50cmltKCk7XG4gICAgICAgIHRoaXMuYWxpYXMgPSBpdE1hdGNoWzJdLnRyaW0oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYWxpYXMgPSBpbk1hdGNoWzFdLnRyaW0oKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZXhwcmVzc2lvbiA9IGluTWF0Y2hbMl07XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmFsaWFzKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ0ludmFsaWQgdi1mb3IgZXhwcmVzc2lvbiBcIicgKyB0aGlzLmRlc2NyaXB0b3IucmF3ICsgJ1wiOiAnICsgJ2FsaWFzIGlzIHJlcXVpcmVkLicsIHRoaXMudm0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHVpZCBhcyBhIGNhY2hlIGlkZW50aWZpZXJcbiAgICB0aGlzLmlkID0gJ19fdi1mb3JfXycgKyArK3VpZCQzO1xuXG4gICAgLy8gY2hlY2sgaWYgdGhpcyBpcyBhbiBvcHRpb24gbGlzdCxcbiAgICAvLyBzbyB0aGF0IHdlIGtub3cgaWYgd2UgbmVlZCB0byB1cGRhdGUgdGhlIDxzZWxlY3Q+J3NcbiAgICAvLyB2LW1vZGVsIHdoZW4gdGhlIG9wdGlvbiBsaXN0IGhhcyBjaGFuZ2VkLlxuICAgIC8vIGJlY2F1c2Ugdi1tb2RlbCBoYXMgYSBsb3dlciBwcmlvcml0eSB0aGFuIHYtZm9yLFxuICAgIC8vIHRoZSB2LW1vZGVsIGlzIG5vdCBib3VuZCBoZXJlIHlldCwgc28gd2UgaGF2ZSB0b1xuICAgIC8vIHJldHJpdmUgaXQgaW4gdGhlIGFjdHVhbCB1cGRhdGVNb2RlbCgpIGZ1bmN0aW9uLlxuICAgIHZhciB0YWcgPSB0aGlzLmVsLnRhZ05hbWU7XG4gICAgdGhpcy5pc09wdGlvbiA9ICh0YWcgPT09ICdPUFRJT04nIHx8IHRhZyA9PT0gJ09QVEdST1VQJykgJiYgdGhpcy5lbC5wYXJlbnROb2RlLnRhZ05hbWUgPT09ICdTRUxFQ1QnO1xuXG4gICAgLy8gc2V0dXAgYW5jaG9yIG5vZGVzXG4gICAgdGhpcy5zdGFydCA9IGNyZWF0ZUFuY2hvcigndi1mb3Itc3RhcnQnKTtcbiAgICB0aGlzLmVuZCA9IGNyZWF0ZUFuY2hvcigndi1mb3ItZW5kJyk7XG4gICAgcmVwbGFjZSh0aGlzLmVsLCB0aGlzLmVuZCk7XG4gICAgYmVmb3JlKHRoaXMuc3RhcnQsIHRoaXMuZW5kKTtcblxuICAgIC8vIGNhY2hlXG4gICAgdGhpcy5jYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAvLyBmcmFnbWVudCBmYWN0b3J5XG4gICAgdGhpcy5mYWN0b3J5ID0gbmV3IEZyYWdtZW50RmFjdG9yeSh0aGlzLnZtLCB0aGlzLmVsKTtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkYXRhKSB7XG4gICAgdGhpcy5kaWZmKGRhdGEpO1xuICAgIHRoaXMudXBkYXRlUmVmKCk7XG4gICAgdGhpcy51cGRhdGVNb2RlbCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBEaWZmLCBiYXNlZCBvbiBuZXcgZGF0YSBhbmQgb2xkIGRhdGEsIGRldGVybWluZSB0aGVcbiAgICogbWluaW11bSBhbW91bnQgb2YgRE9NIG1hbmlwdWxhdGlvbnMgbmVlZGVkIHRvIG1ha2UgdGhlXG4gICAqIERPTSByZWZsZWN0IHRoZSBuZXcgZGF0YSBBcnJheS5cbiAgICpcbiAgICogVGhlIGFsZ29yaXRobSBkaWZmcyB0aGUgbmV3IGRhdGEgQXJyYXkgYnkgc3RvcmluZyBhXG4gICAqIGhpZGRlbiByZWZlcmVuY2UgdG8gYW4gb3duZXIgdm0gaW5zdGFuY2Ugb24gcHJldmlvdXNseVxuICAgKiBzZWVuIGRhdGEuIFRoaXMgYWxsb3dzIHVzIHRvIGFjaGlldmUgTyhuKSB3aGljaCBpc1xuICAgKiBiZXR0ZXIgdGhhbiBhIGxldmVuc2h0ZWluIGRpc3RhbmNlIGJhc2VkIGFsZ29yaXRobSxcbiAgICogd2hpY2ggaXMgTyhtICogbikuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IGRhdGFcbiAgICovXG5cbiAgZGlmZjogZnVuY3Rpb24gZGlmZihkYXRhKSB7XG4gICAgLy8gY2hlY2sgaWYgdGhlIEFycmF5IHdhcyBjb252ZXJ0ZWQgZnJvbSBhbiBPYmplY3RcbiAgICB2YXIgaXRlbSA9IGRhdGFbMF07XG4gICAgdmFyIGNvbnZlcnRlZEZyb21PYmplY3QgPSB0aGlzLmZyb21PYmplY3QgPSBpc09iamVjdChpdGVtKSAmJiBoYXNPd24oaXRlbSwgJyRrZXknKSAmJiBoYXNPd24oaXRlbSwgJyR2YWx1ZScpO1xuXG4gICAgdmFyIHRyYWNrQnlLZXkgPSB0aGlzLnBhcmFtcy50cmFja0J5O1xuICAgIHZhciBvbGRGcmFncyA9IHRoaXMuZnJhZ3M7XG4gICAgdmFyIGZyYWdzID0gdGhpcy5mcmFncyA9IG5ldyBBcnJheShkYXRhLmxlbmd0aCk7XG4gICAgdmFyIGFsaWFzID0gdGhpcy5hbGlhcztcbiAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLml0ZXJhdG9yO1xuICAgIHZhciBzdGFydCA9IHRoaXMuc3RhcnQ7XG4gICAgdmFyIGVuZCA9IHRoaXMuZW5kO1xuICAgIHZhciBpbkRvY3VtZW50ID0gaW5Eb2Moc3RhcnQpO1xuICAgIHZhciBpbml0ID0gIW9sZEZyYWdzO1xuICAgIHZhciBpLCBsLCBmcmFnLCBrZXksIHZhbHVlLCBwcmltaXRpdmU7XG5cbiAgICAvLyBGaXJzdCBwYXNzLCBnbyB0aHJvdWdoIHRoZSBuZXcgQXJyYXkgYW5kIGZpbGwgdXBcbiAgICAvLyB0aGUgbmV3IGZyYWdzIGFycmF5LiBJZiBhIHBpZWNlIG9mIGRhdGEgaGFzIGEgY2FjaGVkXG4gICAgLy8gaW5zdGFuY2UgZm9yIGl0LCB3ZSByZXVzZSBpdC4gT3RoZXJ3aXNlIGJ1aWxkIGEgbmV3XG4gICAgLy8gaW5zdGFuY2UuXG4gICAgZm9yIChpID0gMCwgbCA9IGRhdGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpdGVtID0gZGF0YVtpXTtcbiAgICAgIGtleSA9IGNvbnZlcnRlZEZyb21PYmplY3QgPyBpdGVtLiRrZXkgOiBudWxsO1xuICAgICAgdmFsdWUgPSBjb252ZXJ0ZWRGcm9tT2JqZWN0ID8gaXRlbS4kdmFsdWUgOiBpdGVtO1xuICAgICAgcHJpbWl0aXZlID0gIWlzT2JqZWN0KHZhbHVlKTtcbiAgICAgIGZyYWcgPSAhaW5pdCAmJiB0aGlzLmdldENhY2hlZEZyYWcodmFsdWUsIGksIGtleSk7XG4gICAgICBpZiAoZnJhZykge1xuICAgICAgICAvLyByZXVzYWJsZSBmcmFnbWVudFxuICAgICAgICBmcmFnLnJldXNlZCA9IHRydWU7XG4gICAgICAgIC8vIHVwZGF0ZSAkaW5kZXhcbiAgICAgICAgZnJhZy5zY29wZS4kaW5kZXggPSBpO1xuICAgICAgICAvLyB1cGRhdGUgJGtleVxuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgZnJhZy5zY29wZS4ka2V5ID0ga2V5O1xuICAgICAgICB9XG4gICAgICAgIC8vIHVwZGF0ZSBpdGVyYXRvclxuICAgICAgICBpZiAoaXRlcmF0b3IpIHtcbiAgICAgICAgICBmcmFnLnNjb3BlW2l0ZXJhdG9yXSA9IGtleSAhPT0gbnVsbCA/IGtleSA6IGk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdXBkYXRlIGRhdGEgZm9yIHRyYWNrLWJ5LCBvYmplY3QgcmVwZWF0ICZcbiAgICAgICAgLy8gcHJpbWl0aXZlIHZhbHVlcy5cbiAgICAgICAgaWYgKHRyYWNrQnlLZXkgfHwgY29udmVydGVkRnJvbU9iamVjdCB8fCBwcmltaXRpdmUpIHtcbiAgICAgICAgICB3aXRob3V0Q29udmVyc2lvbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmcmFnLnNjb3BlW2FsaWFzXSA9IHZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBuZXcgaXNudGFuY2VcbiAgICAgICAgZnJhZyA9IHRoaXMuY3JlYXRlKHZhbHVlLCBhbGlhcywgaSwga2V5KTtcbiAgICAgICAgZnJhZy5mcmVzaCA9ICFpbml0O1xuICAgICAgfVxuICAgICAgZnJhZ3NbaV0gPSBmcmFnO1xuICAgICAgaWYgKGluaXQpIHtcbiAgICAgICAgZnJhZy5iZWZvcmUoZW5kKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSdyZSBkb25lIGZvciB0aGUgaW5pdGlhbCByZW5kZXIuXG4gICAgaWYgKGluaXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTZWNvbmQgcGFzcywgZ28gdGhyb3VnaCB0aGUgb2xkIGZyYWdtZW50cyBhbmRcbiAgICAvLyBkZXN0cm95IHRob3NlIHdobyBhcmUgbm90IHJldXNlZCAoYW5kIHJlbW92ZSB0aGVtXG4gICAgLy8gZnJvbSBjYWNoZSlcbiAgICB2YXIgcmVtb3ZhbEluZGV4ID0gMDtcbiAgICB2YXIgdG90YWxSZW1vdmVkID0gb2xkRnJhZ3MubGVuZ3RoIC0gZnJhZ3MubGVuZ3RoO1xuICAgIC8vIHdoZW4gcmVtb3ZpbmcgYSBsYXJnZSBudW1iZXIgb2YgZnJhZ21lbnRzLCB3YXRjaGVyIHJlbW92YWxcbiAgICAvLyB0dXJucyBvdXQgdG8gYmUgYSBwZXJmIGJvdHRsZW5lY2ssIHNvIHdlIGJhdGNoIHRoZSB3YXRjaGVyXG4gICAgLy8gcmVtb3ZhbHMgaW50byBhIHNpbmdsZSBmaWx0ZXIgY2FsbCFcbiAgICB0aGlzLnZtLl92Rm9yUmVtb3ZpbmcgPSB0cnVlO1xuICAgIGZvciAoaSA9IDAsIGwgPSBvbGRGcmFncy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZyYWcgPSBvbGRGcmFnc1tpXTtcbiAgICAgIGlmICghZnJhZy5yZXVzZWQpIHtcbiAgICAgICAgdGhpcy5kZWxldGVDYWNoZWRGcmFnKGZyYWcpO1xuICAgICAgICB0aGlzLnJlbW92ZShmcmFnLCByZW1vdmFsSW5kZXgrKywgdG90YWxSZW1vdmVkLCBpbkRvY3VtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy52bS5fdkZvclJlbW92aW5nID0gZmFsc2U7XG4gICAgaWYgKHJlbW92YWxJbmRleCkge1xuICAgICAgdGhpcy52bS5fd2F0Y2hlcnMgPSB0aGlzLnZtLl93YXRjaGVycy5maWx0ZXIoZnVuY3Rpb24gKHcpIHtcbiAgICAgICAgcmV0dXJuIHcuYWN0aXZlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRmluYWwgcGFzcywgbW92ZS9pbnNlcnQgbmV3IGZyYWdtZW50cyBpbnRvIHRoZVxuICAgIC8vIHJpZ2h0IHBsYWNlLlxuICAgIHZhciB0YXJnZXRQcmV2LCBwcmV2RWwsIGN1cnJlbnRQcmV2O1xuICAgIHZhciBpbnNlcnRpb25JbmRleCA9IDA7XG4gICAgZm9yIChpID0gMCwgbCA9IGZyYWdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZnJhZyA9IGZyYWdzW2ldO1xuICAgICAgLy8gdGhpcyBpcyB0aGUgZnJhZyB0aGF0IHdlIHNob3VsZCBiZSBhZnRlclxuICAgICAgdGFyZ2V0UHJldiA9IGZyYWdzW2kgLSAxXTtcbiAgICAgIHByZXZFbCA9IHRhcmdldFByZXYgPyB0YXJnZXRQcmV2LnN0YWdnZXJDYiA/IHRhcmdldFByZXYuc3RhZ2dlckFuY2hvciA6IHRhcmdldFByZXYuZW5kIHx8IHRhcmdldFByZXYubm9kZSA6IHN0YXJ0O1xuICAgICAgaWYgKGZyYWcucmV1c2VkICYmICFmcmFnLnN0YWdnZXJDYikge1xuICAgICAgICBjdXJyZW50UHJldiA9IGZpbmRQcmV2RnJhZyhmcmFnLCBzdGFydCwgdGhpcy5pZCk7XG4gICAgICAgIGlmIChjdXJyZW50UHJldiAhPT0gdGFyZ2V0UHJldiAmJiAoIWN1cnJlbnRQcmV2IHx8XG4gICAgICAgIC8vIG9wdGltaXphdGlvbiBmb3IgbW92aW5nIGEgc2luZ2xlIGl0ZW0uXG4gICAgICAgIC8vIHRoYW5rcyB0byBzdWdnZXN0aW9ucyBieSBAbGl2b3JhcyBpbiAjMTgwN1xuICAgICAgICBmaW5kUHJldkZyYWcoY3VycmVudFByZXYsIHN0YXJ0LCB0aGlzLmlkKSAhPT0gdGFyZ2V0UHJldikpIHtcbiAgICAgICAgICB0aGlzLm1vdmUoZnJhZywgcHJldkVsKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbmV3IGluc3RhbmNlLCBvciBzdGlsbCBpbiBzdGFnZ2VyLlxuICAgICAgICAvLyBpbnNlcnQgd2l0aCB1cGRhdGVkIHN0YWdnZXIgaW5kZXguXG4gICAgICAgIHRoaXMuaW5zZXJ0KGZyYWcsIGluc2VydGlvbkluZGV4KyssIHByZXZFbCwgaW5Eb2N1bWVudCk7XG4gICAgICB9XG4gICAgICBmcmFnLnJldXNlZCA9IGZyYWcuZnJlc2ggPSBmYWxzZTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBmcmFnbWVudCBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gYWxpYXNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBba2V5XVxuICAgKiBAcmV0dXJuIHtGcmFnbWVudH1cbiAgICovXG5cbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUodmFsdWUsIGFsaWFzLCBpbmRleCwga2V5KSB7XG4gICAgdmFyIGhvc3QgPSB0aGlzLl9ob3N0O1xuICAgIC8vIGNyZWF0ZSBpdGVyYXRpb24gc2NvcGVcbiAgICB2YXIgcGFyZW50U2NvcGUgPSB0aGlzLl9zY29wZSB8fCB0aGlzLnZtO1xuICAgIHZhciBzY29wZSA9IE9iamVjdC5jcmVhdGUocGFyZW50U2NvcGUpO1xuICAgIC8vIHJlZiBob2xkZXIgZm9yIHRoZSBzY29wZVxuICAgIHNjb3BlLiRyZWZzID0gT2JqZWN0LmNyZWF0ZShwYXJlbnRTY29wZS4kcmVmcyk7XG4gICAgc2NvcGUuJGVscyA9IE9iamVjdC5jcmVhdGUocGFyZW50U2NvcGUuJGVscyk7XG4gICAgLy8gbWFrZSBzdXJlIHBvaW50ICRwYXJlbnQgdG8gcGFyZW50IHNjb3BlXG4gICAgc2NvcGUuJHBhcmVudCA9IHBhcmVudFNjb3BlO1xuICAgIC8vIGZvciB0d28td2F5IGJpbmRpbmcgb24gYWxpYXNcbiAgICBzY29wZS4kZm9yQ29udGV4dCA9IHRoaXM7XG4gICAgLy8gZGVmaW5lIHNjb3BlIHByb3BlcnRpZXNcbiAgICAvLyBpbXBvcnRhbnQ6IGRlZmluZSB0aGUgc2NvcGUgYWxpYXMgd2l0aG91dCBmb3JjZWQgY29udmVyc2lvblxuICAgIC8vIHNvIHRoYXQgZnJvemVuIGRhdGEgc3RydWN0dXJlcyByZW1haW4gbm9uLXJlYWN0aXZlLlxuICAgIHdpdGhvdXRDb252ZXJzaW9uKGZ1bmN0aW9uICgpIHtcbiAgICAgIGRlZmluZVJlYWN0aXZlKHNjb3BlLCBhbGlhcywgdmFsdWUpO1xuICAgIH0pO1xuICAgIGRlZmluZVJlYWN0aXZlKHNjb3BlLCAnJGluZGV4JywgaW5kZXgpO1xuICAgIGlmIChrZXkpIHtcbiAgICAgIGRlZmluZVJlYWN0aXZlKHNjb3BlLCAnJGtleScsIGtleSk7XG4gICAgfSBlbHNlIGlmIChzY29wZS4ka2V5KSB7XG4gICAgICAvLyBhdm9pZCBhY2NpZGVudGFsIGZhbGxiYWNrXG4gICAgICBkZWYoc2NvcGUsICcka2V5JywgbnVsbCk7XG4gICAgfVxuICAgIGlmICh0aGlzLml0ZXJhdG9yKSB7XG4gICAgICBkZWZpbmVSZWFjdGl2ZShzY29wZSwgdGhpcy5pdGVyYXRvciwga2V5ICE9PSBudWxsID8ga2V5IDogaW5kZXgpO1xuICAgIH1cbiAgICB2YXIgZnJhZyA9IHRoaXMuZmFjdG9yeS5jcmVhdGUoaG9zdCwgc2NvcGUsIHRoaXMuX2ZyYWcpO1xuICAgIGZyYWcuZm9ySWQgPSB0aGlzLmlkO1xuICAgIHRoaXMuY2FjaGVGcmFnKHZhbHVlLCBmcmFnLCBpbmRleCwga2V5KTtcbiAgICByZXR1cm4gZnJhZztcbiAgfSxcblxuICAvKipcbiAgICogVXBkYXRlIHRoZSB2LXJlZiBvbiBvd25lciB2bS5cbiAgICovXG5cbiAgdXBkYXRlUmVmOiBmdW5jdGlvbiB1cGRhdGVSZWYoKSB7XG4gICAgdmFyIHJlZiA9IHRoaXMuZGVzY3JpcHRvci5yZWY7XG4gICAgaWYgKCFyZWYpIHJldHVybjtcbiAgICB2YXIgaGFzaCA9ICh0aGlzLl9zY29wZSB8fCB0aGlzLnZtKS4kcmVmcztcbiAgICB2YXIgcmVmcztcbiAgICBpZiAoIXRoaXMuZnJvbU9iamVjdCkge1xuICAgICAgcmVmcyA9IHRoaXMuZnJhZ3MubWFwKGZpbmRWbUZyb21GcmFnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVmcyA9IHt9O1xuICAgICAgdGhpcy5mcmFncy5mb3JFYWNoKGZ1bmN0aW9uIChmcmFnKSB7XG4gICAgICAgIHJlZnNbZnJhZy5zY29wZS4ka2V5XSA9IGZpbmRWbUZyb21GcmFnKGZyYWcpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGhhc2hbcmVmXSA9IHJlZnM7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZvciBvcHRpb24gbGlzdHMsIHVwZGF0ZSB0aGUgY29udGFpbmluZyB2LW1vZGVsIG9uXG4gICAqIHBhcmVudCA8c2VsZWN0Pi5cbiAgICovXG5cbiAgdXBkYXRlTW9kZWw6IGZ1bmN0aW9uIHVwZGF0ZU1vZGVsKCkge1xuICAgIGlmICh0aGlzLmlzT3B0aW9uKSB7XG4gICAgICB2YXIgcGFyZW50ID0gdGhpcy5zdGFydC5wYXJlbnROb2RlO1xuICAgICAgdmFyIG1vZGVsID0gcGFyZW50ICYmIHBhcmVudC5fX3ZfbW9kZWw7XG4gICAgICBpZiAobW9kZWwpIHtcbiAgICAgICAgbW9kZWwuZm9yY2VVcGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEluc2VydCBhIGZyYWdtZW50LiBIYW5kbGVzIHN0YWdnZXJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7RnJhZ21lbnR9IGZyYWdcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7Tm9kZX0gcHJldkVsXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5Eb2N1bWVudFxuICAgKi9cblxuICBpbnNlcnQ6IGZ1bmN0aW9uIGluc2VydChmcmFnLCBpbmRleCwgcHJldkVsLCBpbkRvY3VtZW50KSB7XG4gICAgaWYgKGZyYWcuc3RhZ2dlckNiKSB7XG4gICAgICBmcmFnLnN0YWdnZXJDYi5jYW5jZWwoKTtcbiAgICAgIGZyYWcuc3RhZ2dlckNiID0gbnVsbDtcbiAgICB9XG4gICAgdmFyIHN0YWdnZXJBbW91bnQgPSB0aGlzLmdldFN0YWdnZXIoZnJhZywgaW5kZXgsIG51bGwsICdlbnRlcicpO1xuICAgIGlmIChpbkRvY3VtZW50ICYmIHN0YWdnZXJBbW91bnQpIHtcbiAgICAgIC8vIGNyZWF0ZSBhbiBhbmNob3IgYW5kIGluc2VydCBpdCBzeW5jaHJvbm91c2x5LFxuICAgICAgLy8gc28gdGhhdCB3ZSBjYW4gcmVzb2x2ZSB0aGUgY29ycmVjdCBvcmRlciB3aXRob3V0XG4gICAgICAvLyB3b3JyeWluZyBhYm91dCBzb21lIGVsZW1lbnRzIG5vdCBpbnNlcnRlZCB5ZXRcbiAgICAgIHZhciBhbmNob3IgPSBmcmFnLnN0YWdnZXJBbmNob3I7XG4gICAgICBpZiAoIWFuY2hvcikge1xuICAgICAgICBhbmNob3IgPSBmcmFnLnN0YWdnZXJBbmNob3IgPSBjcmVhdGVBbmNob3IoJ3N0YWdnZXItYW5jaG9yJyk7XG4gICAgICAgIGFuY2hvci5fX3ZfZnJhZyA9IGZyYWc7XG4gICAgICB9XG4gICAgICBhZnRlcihhbmNob3IsIHByZXZFbCk7XG4gICAgICB2YXIgb3AgPSBmcmFnLnN0YWdnZXJDYiA9IGNhbmNlbGxhYmxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnJhZy5zdGFnZ2VyQ2IgPSBudWxsO1xuICAgICAgICBmcmFnLmJlZm9yZShhbmNob3IpO1xuICAgICAgICByZW1vdmUoYW5jaG9yKTtcbiAgICAgIH0pO1xuICAgICAgc2V0VGltZW91dChvcCwgc3RhZ2dlckFtb3VudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0YXJnZXQgPSBwcmV2RWwubmV4dFNpYmxpbmc7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIC8vIHJlc2V0IGVuZCBhbmNob3IgcG9zaXRpb24gaW4gY2FzZSB0aGUgcG9zaXRpb24gd2FzIG1lc3NlZCB1cFxuICAgICAgICAvLyBieSBhbiBleHRlcm5hbCBkcmFnLW4tZHJvcCBsaWJyYXJ5LlxuICAgICAgICBhZnRlcih0aGlzLmVuZCwgcHJldkVsKTtcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy5lbmQ7XG4gICAgICB9XG4gICAgICBmcmFnLmJlZm9yZSh0YXJnZXQpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlIGEgZnJhZ21lbnQuIEhhbmRsZXMgc3RhZ2dlcmluZy5cbiAgICpcbiAgICogQHBhcmFtIHtGcmFnbWVudH0gZnJhZ1xuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRvdGFsXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5Eb2N1bWVudFxuICAgKi9cblxuICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShmcmFnLCBpbmRleCwgdG90YWwsIGluRG9jdW1lbnQpIHtcbiAgICBpZiAoZnJhZy5zdGFnZ2VyQ2IpIHtcbiAgICAgIGZyYWcuc3RhZ2dlckNiLmNhbmNlbCgpO1xuICAgICAgZnJhZy5zdGFnZ2VyQ2IgPSBudWxsO1xuICAgICAgLy8gaXQncyBub3QgcG9zc2libGUgZm9yIHRoZSBzYW1lIGZyYWcgdG8gYmUgcmVtb3ZlZFxuICAgICAgLy8gdHdpY2UsIHNvIGlmIHdlIGhhdmUgYSBwZW5kaW5nIHN0YWdnZXIgY2FsbGJhY2ssXG4gICAgICAvLyBpdCBtZWFucyB0aGlzIGZyYWcgaXMgcXVldWVkIGZvciBlbnRlciBidXQgcmVtb3ZlZFxuICAgICAgLy8gYmVmb3JlIGl0cyB0cmFuc2l0aW9uIHN0YXJ0ZWQuIFNpbmNlIGl0IGlzIGFscmVhZHlcbiAgICAgIC8vIGRlc3Ryb3llZCwgd2UgY2FuIGp1c3QgbGVhdmUgaXQgaW4gZGV0YWNoZWQgc3RhdGUuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBzdGFnZ2VyQW1vdW50ID0gdGhpcy5nZXRTdGFnZ2VyKGZyYWcsIGluZGV4LCB0b3RhbCwgJ2xlYXZlJyk7XG4gICAgaWYgKGluRG9jdW1lbnQgJiYgc3RhZ2dlckFtb3VudCkge1xuICAgICAgdmFyIG9wID0gZnJhZy5zdGFnZ2VyQ2IgPSBjYW5jZWxsYWJsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZyYWcuc3RhZ2dlckNiID0gbnVsbDtcbiAgICAgICAgZnJhZy5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgICAgc2V0VGltZW91dChvcCwgc3RhZ2dlckFtb3VudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZyYWcucmVtb3ZlKCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBNb3ZlIGEgZnJhZ21lbnQgdG8gYSBuZXcgcG9zaXRpb24uXG4gICAqIEZvcmNlIG5vIHRyYW5zaXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7RnJhZ21lbnR9IGZyYWdcbiAgICogQHBhcmFtIHtOb2RlfSBwcmV2RWxcbiAgICovXG5cbiAgbW92ZTogZnVuY3Rpb24gbW92ZShmcmFnLCBwcmV2RWwpIHtcbiAgICAvLyBmaXggYSBjb21tb24gaXNzdWUgd2l0aCBTb3J0YWJsZTpcbiAgICAvLyBpZiBwcmV2RWwgZG9lc24ndCBoYXZlIG5leHRTaWJsaW5nLCB0aGlzIG1lYW5zIGl0J3NcbiAgICAvLyBiZWVuIGRyYWdnZWQgYWZ0ZXIgdGhlIGVuZCBhbmNob3IuIEp1c3QgcmUtcG9zaXRpb25cbiAgICAvLyB0aGUgZW5kIGFuY2hvciB0byB0aGUgZW5kIG9mIHRoZSBjb250YWluZXIuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFwcmV2RWwubmV4dFNpYmxpbmcpIHtcbiAgICAgIHRoaXMuZW5kLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5lbmQpO1xuICAgIH1cbiAgICBmcmFnLmJlZm9yZShwcmV2RWwubmV4dFNpYmxpbmcsIGZhbHNlKTtcbiAgfSxcblxuICAvKipcbiAgICogQ2FjaGUgYSBmcmFnbWVudCB1c2luZyB0cmFjay1ieSBvciB0aGUgb2JqZWN0IGtleS5cbiAgICpcbiAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgKiBAcGFyYW0ge0ZyYWdtZW50fSBmcmFnXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0ge1N0cmluZ30gW2tleV1cbiAgICovXG5cbiAgY2FjaGVGcmFnOiBmdW5jdGlvbiBjYWNoZUZyYWcodmFsdWUsIGZyYWcsIGluZGV4LCBrZXkpIHtcbiAgICB2YXIgdHJhY2tCeUtleSA9IHRoaXMucGFyYW1zLnRyYWNrQnk7XG4gICAgdmFyIGNhY2hlID0gdGhpcy5jYWNoZTtcbiAgICB2YXIgcHJpbWl0aXZlID0gIWlzT2JqZWN0KHZhbHVlKTtcbiAgICB2YXIgaWQ7XG4gICAgaWYgKGtleSB8fCB0cmFja0J5S2V5IHx8IHByaW1pdGl2ZSkge1xuICAgICAgaWQgPSBnZXRUcmFja0J5S2V5KGluZGV4LCBrZXksIHZhbHVlLCB0cmFja0J5S2V5KTtcbiAgICAgIGlmICghY2FjaGVbaWRdKSB7XG4gICAgICAgIGNhY2hlW2lkXSA9IGZyYWc7XG4gICAgICB9IGVsc2UgaWYgKHRyYWNrQnlLZXkgIT09ICckaW5kZXgnKSB7XG4gICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdGhpcy53YXJuRHVwbGljYXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWQgPSB0aGlzLmlkO1xuICAgICAgaWYgKGhhc093bih2YWx1ZSwgaWQpKSB7XG4gICAgICAgIGlmICh2YWx1ZVtpZF0gPT09IG51bGwpIHtcbiAgICAgICAgICB2YWx1ZVtpZF0gPSBmcmFnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdGhpcy53YXJuRHVwbGljYXRlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChPYmplY3QuaXNFeHRlbnNpYmxlKHZhbHVlKSkge1xuICAgICAgICBkZWYodmFsdWUsIGlkLCBmcmFnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICB3YXJuKCdGcm96ZW4gdi1mb3Igb2JqZWN0cyBjYW5ub3QgYmUgYXV0b21hdGljYWxseSB0cmFja2VkLCBtYWtlIHN1cmUgdG8gJyArICdwcm92aWRlIGEgdHJhY2stYnkga2V5LicpO1xuICAgICAgfVxuICAgIH1cbiAgICBmcmFnLnJhdyA9IHZhbHVlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgYSBjYWNoZWQgZnJhZ21lbnQgZnJvbSB0aGUgdmFsdWUvaW5kZXgva2V5XG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7RnJhZ21lbnR9XG4gICAqL1xuXG4gIGdldENhY2hlZEZyYWc6IGZ1bmN0aW9uIGdldENhY2hlZEZyYWcodmFsdWUsIGluZGV4LCBrZXkpIHtcbiAgICB2YXIgdHJhY2tCeUtleSA9IHRoaXMucGFyYW1zLnRyYWNrQnk7XG4gICAgdmFyIHByaW1pdGl2ZSA9ICFpc09iamVjdCh2YWx1ZSk7XG4gICAgdmFyIGZyYWc7XG4gICAgaWYgKGtleSB8fCB0cmFja0J5S2V5IHx8IHByaW1pdGl2ZSkge1xuICAgICAgdmFyIGlkID0gZ2V0VHJhY2tCeUtleShpbmRleCwga2V5LCB2YWx1ZSwgdHJhY2tCeUtleSk7XG4gICAgICBmcmFnID0gdGhpcy5jYWNoZVtpZF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGZyYWcgPSB2YWx1ZVt0aGlzLmlkXTtcbiAgICB9XG4gICAgaWYgKGZyYWcgJiYgKGZyYWcucmV1c2VkIHx8IGZyYWcuZnJlc2gpKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHRoaXMud2FybkR1cGxpY2F0ZSh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBmcmFnO1xuICB9LFxuXG4gIC8qKlxuICAgKiBEZWxldGUgYSBmcmFnbWVudCBmcm9tIGNhY2hlLlxuICAgKlxuICAgKiBAcGFyYW0ge0ZyYWdtZW50fSBmcmFnXG4gICAqL1xuXG4gIGRlbGV0ZUNhY2hlZEZyYWc6IGZ1bmN0aW9uIGRlbGV0ZUNhY2hlZEZyYWcoZnJhZykge1xuICAgIHZhciB2YWx1ZSA9IGZyYWcucmF3O1xuICAgIHZhciB0cmFja0J5S2V5ID0gdGhpcy5wYXJhbXMudHJhY2tCeTtcbiAgICB2YXIgc2NvcGUgPSBmcmFnLnNjb3BlO1xuICAgIHZhciBpbmRleCA9IHNjb3BlLiRpbmRleDtcbiAgICAvLyBmaXggIzk0ODogYXZvaWQgYWNjaWRlbnRhbGx5IGZhbGwgdGhyb3VnaCB0b1xuICAgIC8vIGEgcGFyZW50IHJlcGVhdGVyIHdoaWNoIGhhcHBlbnMgdG8gaGF2ZSAka2V5LlxuICAgIHZhciBrZXkgPSBoYXNPd24oc2NvcGUsICcka2V5JykgJiYgc2NvcGUuJGtleTtcbiAgICB2YXIgcHJpbWl0aXZlID0gIWlzT2JqZWN0KHZhbHVlKTtcbiAgICBpZiAodHJhY2tCeUtleSB8fCBrZXkgfHwgcHJpbWl0aXZlKSB7XG4gICAgICB2YXIgaWQgPSBnZXRUcmFja0J5S2V5KGluZGV4LCBrZXksIHZhbHVlLCB0cmFja0J5S2V5KTtcbiAgICAgIHRoaXMuY2FjaGVbaWRdID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVbdGhpcy5pZF0gPSBudWxsO1xuICAgICAgZnJhZy5yYXcgPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogR2V0IHRoZSBzdGFnZ2VyIGFtb3VudCBmb3IgYW4gaW5zZXJ0aW9uL3JlbW92YWwuXG4gICAqXG4gICAqIEBwYXJhbSB7RnJhZ21lbnR9IGZyYWdcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0b3RhbFxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgKi9cblxuICBnZXRTdGFnZ2VyOiBmdW5jdGlvbiBnZXRTdGFnZ2VyKGZyYWcsIGluZGV4LCB0b3RhbCwgdHlwZSkge1xuICAgIHR5cGUgPSB0eXBlICsgJ1N0YWdnZXInO1xuICAgIHZhciB0cmFucyA9IGZyYWcubm9kZS5fX3ZfdHJhbnM7XG4gICAgdmFyIGhvb2tzID0gdHJhbnMgJiYgdHJhbnMuaG9va3M7XG4gICAgdmFyIGhvb2sgPSBob29rcyAmJiAoaG9va3NbdHlwZV0gfHwgaG9va3Muc3RhZ2dlcik7XG4gICAgcmV0dXJuIGhvb2sgPyBob29rLmNhbGwoZnJhZywgaW5kZXgsIHRvdGFsKSA6IGluZGV4ICogcGFyc2VJbnQodGhpcy5wYXJhbXNbdHlwZV0gfHwgdGhpcy5wYXJhbXMuc3RhZ2dlciwgMTApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQcmUtcHJvY2VzcyB0aGUgdmFsdWUgYmVmb3JlIHBpcGluZyBpdCB0aHJvdWdoIHRoZVxuICAgKiBmaWx0ZXJzLiBUaGlzIGlzIHBhc3NlZCB0byBhbmQgY2FsbGVkIGJ5IHRoZSB3YXRjaGVyLlxuICAgKi9cblxuICBfcHJlUHJvY2VzczogZnVuY3Rpb24gX3ByZVByb2Nlc3ModmFsdWUpIHtcbiAgICAvLyByZWdhcmRsZXNzIG9mIHR5cGUsIHN0b3JlIHRoZSB1bi1maWx0ZXJlZCByYXcgdmFsdWUuXG4gICAgdGhpcy5yYXdWYWx1ZSA9IHZhbHVlO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfSxcblxuICAvKipcbiAgICogUG9zdC1wcm9jZXNzIHRoZSB2YWx1ZSBhZnRlciBpdCBoYXMgYmVlbiBwaXBlZCB0aHJvdWdoXG4gICAqIHRoZSBmaWx0ZXJzLiBUaGlzIGlzIHBhc3NlZCB0byBhbmQgY2FsbGVkIGJ5IHRoZSB3YXRjaGVyLlxuICAgKlxuICAgKiBJdCBpcyBuZWNlc3NhcnkgZm9yIHRoaXMgdG8gYmUgY2FsbGVkIGR1cmluZyB0aGVcbiAgICogd2F0Y2hlcidzIGRlcGVuZGVuY3kgY29sbGVjdGlvbiBwaGFzZSBiZWNhdXNlIHdlIHdhbnRcbiAgICogdGhlIHYtZm9yIHRvIHVwZGF0ZSB3aGVuIHRoZSBzb3VyY2UgT2JqZWN0IGlzIG11dGF0ZWQuXG4gICAqL1xuXG4gIF9wb3N0UHJvY2VzczogZnVuY3Rpb24gX3Bvc3RQcm9jZXNzKHZhbHVlKSB7XG4gICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbHVlKSkge1xuICAgICAgLy8gY29udmVydCBwbGFpbiBvYmplY3QgdG8gYXJyYXkuXG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgICAgIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gICAgICB2YXIgcmVzID0gbmV3IEFycmF5KGkpO1xuICAgICAgdmFyIGtleTtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgcmVzW2ldID0ge1xuICAgICAgICAgICRrZXk6IGtleSxcbiAgICAgICAgICAkdmFsdWU6IHZhbHVlW2tleV1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSByYW5nZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWUgfHwgW107XG4gICAgfVxuICB9LFxuXG4gIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLmRlc2NyaXB0b3IucmVmKSB7XG4gICAgICAodGhpcy5fc2NvcGUgfHwgdGhpcy52bSkuJHJlZnNbdGhpcy5kZXNjcmlwdG9yLnJlZl0gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5mcmFncykge1xuICAgICAgdmFyIGkgPSB0aGlzLmZyYWdzLmxlbmd0aDtcbiAgICAgIHZhciBmcmFnO1xuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICBmcmFnID0gdGhpcy5mcmFnc1tpXTtcbiAgICAgICAgdGhpcy5kZWxldGVDYWNoZWRGcmFnKGZyYWcpO1xuICAgICAgICBmcmFnLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSGVscGVyIHRvIGZpbmQgdGhlIHByZXZpb3VzIGVsZW1lbnQgdGhhdCBpcyBhIGZyYWdtZW50XG4gKiBhbmNob3IuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYSBkZXN0cm95ZWQgZnJhZydzXG4gKiBlbGVtZW50IGNvdWxkIHN0aWxsIGJlIGxpbmdlcmluZyBpbiB0aGUgRE9NIGJlZm9yZSBpdHNcbiAqIGxlYXZpbmcgdHJhbnNpdGlvbiBmaW5pc2hlcywgYnV0IGl0cyBpbnNlcnRlZCBmbGFnXG4gKiBzaG91bGQgaGF2ZSBiZWVuIHNldCB0byBmYWxzZSBzbyB3ZSBjYW4gc2tpcCB0aGVtLlxuICpcbiAqIElmIHRoaXMgaXMgYSBibG9jayByZXBlYXQsIHdlIHdhbnQgdG8gbWFrZSBzdXJlIHdlIG9ubHlcbiAqIHJldHVybiBmcmFnIHRoYXQgaXMgYm91bmQgdG8gdGhpcyB2LWZvci4gKHNlZSAjOTI5KVxuICpcbiAqIEBwYXJhbSB7RnJhZ21lbnR9IGZyYWdcbiAqIEBwYXJhbSB7Q29tbWVudHxUZXh0fSBhbmNob3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZFxuICogQHJldHVybiB7RnJhZ21lbnR9XG4gKi9cblxuZnVuY3Rpb24gZmluZFByZXZGcmFnKGZyYWcsIGFuY2hvciwgaWQpIHtcbiAgdmFyIGVsID0gZnJhZy5ub2RlLnByZXZpb3VzU2libGluZztcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICghZWwpIHJldHVybjtcbiAgZnJhZyA9IGVsLl9fdl9mcmFnO1xuICB3aGlsZSAoKCFmcmFnIHx8IGZyYWcuZm9ySWQgIT09IGlkIHx8ICFmcmFnLmluc2VydGVkKSAmJiBlbCAhPT0gYW5jaG9yKSB7XG4gICAgZWwgPSBlbC5wcmV2aW91c1NpYmxpbmc7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFlbCkgcmV0dXJuO1xuICAgIGZyYWcgPSBlbC5fX3ZfZnJhZztcbiAgfVxuICByZXR1cm4gZnJhZztcbn1cblxuLyoqXG4gKiBGaW5kIGEgdm0gZnJvbSBhIGZyYWdtZW50LlxuICpcbiAqIEBwYXJhbSB7RnJhZ21lbnR9IGZyYWdcbiAqIEByZXR1cm4ge1Z1ZXx1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gZmluZFZtRnJvbUZyYWcoZnJhZykge1xuICB2YXIgbm9kZSA9IGZyYWcubm9kZTtcbiAgLy8gaGFuZGxlIG11bHRpLW5vZGUgZnJhZ1xuICBpZiAoZnJhZy5lbmQpIHtcbiAgICB3aGlsZSAoIW5vZGUuX192dWVfXyAmJiBub2RlICE9PSBmcmFnLmVuZCAmJiBub2RlLm5leHRTaWJsaW5nKSB7XG4gICAgICBub2RlID0gbm9kZS5uZXh0U2libGluZztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5vZGUuX192dWVfXztcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSByYW5nZSBhcnJheSBmcm9tIGdpdmVuIG51bWJlci5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gcmFuZ2Uobikge1xuICB2YXIgaSA9IC0xO1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KE1hdGguZmxvb3IobikpO1xuICB3aGlsZSAoKytpIDwgbikge1xuICAgIHJldFtpXSA9IGk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHRyYWNrIGJ5IGtleSBmb3IgYW4gaXRlbS5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBbdHJhY2tCeUtleV1cbiAqL1xuXG5mdW5jdGlvbiBnZXRUcmFja0J5S2V5KGluZGV4LCBrZXksIHZhbHVlLCB0cmFja0J5S2V5KSB7XG4gIHJldHVybiB0cmFja0J5S2V5ID8gdHJhY2tCeUtleSA9PT0gJyRpbmRleCcgPyBpbmRleCA6IHRyYWNrQnlLZXkuY2hhckF0KDApLm1hdGNoKC9cXHcvKSA/IGdldFBhdGgodmFsdWUsIHRyYWNrQnlLZXkpIDogdmFsdWVbdHJhY2tCeUtleV0gOiBrZXkgfHwgdmFsdWU7XG59XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHZGb3Iud2FybkR1cGxpY2F0ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHdhcm4oJ0R1cGxpY2F0ZSB2YWx1ZSBmb3VuZCBpbiB2LWZvcj1cIicgKyB0aGlzLmRlc2NyaXB0b3IucmF3ICsgJ1wiOiAnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpICsgJy4gVXNlIHRyYWNrLWJ5PVwiJGluZGV4XCIgaWYgJyArICd5b3UgYXJlIGV4cGVjdGluZyBkdXBsaWNhdGUgdmFsdWVzLicsIHRoaXMudm0pO1xuICB9O1xufVxuXG52YXIgdklmID0ge1xuXG4gIHByaW9yaXR5OiBJRixcbiAgdGVybWluYWw6IHRydWUsXG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIGlmICghZWwuX192dWVfXykge1xuICAgICAgLy8gY2hlY2sgZWxzZSBibG9ja1xuICAgICAgdmFyIG5leHQgPSBlbC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICBpZiAobmV4dCAmJiBnZXRBdHRyKG5leHQsICd2LWVsc2UnKSAhPT0gbnVsbCkge1xuICAgICAgICByZW1vdmUobmV4dCk7XG4gICAgICAgIHRoaXMuZWxzZUVsID0gbmV4dDtcbiAgICAgIH1cbiAgICAgIC8vIGNoZWNrIG1haW4gYmxvY2tcbiAgICAgIHRoaXMuYW5jaG9yID0gY3JlYXRlQW5jaG9yKCd2LWlmJyk7XG4gICAgICByZXBsYWNlKGVsLCB0aGlzLmFuY2hvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2Fybigndi1pZj1cIicgKyB0aGlzLmV4cHJlc3Npb24gKyAnXCIgY2Fubm90IGJlICcgKyAndXNlZCBvbiBhbiBpbnN0YW5jZSByb290IGVsZW1lbnQuJywgdGhpcy52bSk7XG4gICAgICB0aGlzLmludmFsaWQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLmludmFsaWQpIHJldHVybjtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIGlmICghdGhpcy5mcmFnKSB7XG4gICAgICAgIHRoaXMuaW5zZXJ0KCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgfVxuICB9LFxuXG4gIGluc2VydDogZnVuY3Rpb24gaW5zZXJ0KCkge1xuICAgIGlmICh0aGlzLmVsc2VGcmFnKSB7XG4gICAgICB0aGlzLmVsc2VGcmFnLnJlbW92ZSgpO1xuICAgICAgdGhpcy5lbHNlRnJhZyA9IG51bGw7XG4gICAgfVxuICAgIC8vIGxhenkgaW5pdCBmYWN0b3J5XG4gICAgaWYgKCF0aGlzLmZhY3RvcnkpIHtcbiAgICAgIHRoaXMuZmFjdG9yeSA9IG5ldyBGcmFnbWVudEZhY3RvcnkodGhpcy52bSwgdGhpcy5lbCk7XG4gICAgfVxuICAgIHRoaXMuZnJhZyA9IHRoaXMuZmFjdG9yeS5jcmVhdGUodGhpcy5faG9zdCwgdGhpcy5fc2NvcGUsIHRoaXMuX2ZyYWcpO1xuICAgIHRoaXMuZnJhZy5iZWZvcmUodGhpcy5hbmNob3IpO1xuICB9LFxuXG4gIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgIGlmICh0aGlzLmZyYWcpIHtcbiAgICAgIHRoaXMuZnJhZy5yZW1vdmUoKTtcbiAgICAgIHRoaXMuZnJhZyA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLmVsc2VFbCAmJiAhdGhpcy5lbHNlRnJhZykge1xuICAgICAgaWYgKCF0aGlzLmVsc2VGYWN0b3J5KSB7XG4gICAgICAgIHRoaXMuZWxzZUZhY3RvcnkgPSBuZXcgRnJhZ21lbnRGYWN0b3J5KHRoaXMuZWxzZUVsLl9jb250ZXh0IHx8IHRoaXMudm0sIHRoaXMuZWxzZUVsKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZWxzZUZyYWcgPSB0aGlzLmVsc2VGYWN0b3J5LmNyZWF0ZSh0aGlzLl9ob3N0LCB0aGlzLl9zY29wZSwgdGhpcy5fZnJhZyk7XG4gICAgICB0aGlzLmVsc2VGcmFnLmJlZm9yZSh0aGlzLmFuY2hvcik7XG4gICAgfVxuICB9LFxuXG4gIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgIGlmICh0aGlzLmZyYWcpIHtcbiAgICAgIHRoaXMuZnJhZy5kZXN0cm95KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmVsc2VGcmFnKSB7XG4gICAgICB0aGlzLmVsc2VGcmFnLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBzaG93ID0ge1xuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgLy8gY2hlY2sgZWxzZSBibG9ja1xuICAgIHZhciBuZXh0ID0gdGhpcy5lbC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgaWYgKG5leHQgJiYgZ2V0QXR0cihuZXh0LCAndi1lbHNlJykgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuZWxzZUVsID0gbmV4dDtcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmFsdWUpIHtcbiAgICB0aGlzLmFwcGx5KHRoaXMuZWwsIHZhbHVlKTtcbiAgICBpZiAodGhpcy5lbHNlRWwpIHtcbiAgICAgIHRoaXMuYXBwbHkodGhpcy5lbHNlRWwsICF2YWx1ZSk7XG4gICAgfVxuICB9LFxuXG4gIGFwcGx5OiBmdW5jdGlvbiBhcHBseShlbCwgdmFsdWUpIHtcbiAgICBpZiAoaW5Eb2MoZWwpKSB7XG4gICAgICBhcHBseVRyYW5zaXRpb24oZWwsIHZhbHVlID8gMSA6IC0xLCB0b2dnbGUsIHRoaXMudm0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b2dnbGUoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdG9nZ2xlKCkge1xuICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IHZhbHVlID8gJycgOiAnbm9uZSc7XG4gICAgfVxuICB9XG59O1xuXG52YXIgdGV4dCQyID0ge1xuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgdmFyIGlzUmFuZ2UgPSBlbC50eXBlID09PSAncmFuZ2UnO1xuICAgIHZhciBsYXp5ID0gdGhpcy5wYXJhbXMubGF6eTtcbiAgICB2YXIgbnVtYmVyID0gdGhpcy5wYXJhbXMubnVtYmVyO1xuICAgIHZhciBkZWJvdW5jZSA9IHRoaXMucGFyYW1zLmRlYm91bmNlO1xuXG4gICAgLy8gaGFuZGxlIGNvbXBvc2l0aW9uIGV2ZW50cy5cbiAgICAvLyAgIGh0dHA6Ly9ibG9nLmV2YW55b3UubWUvMjAxNC8wMS8wMy9jb21wb3NpdGlvbi1ldmVudC9cbiAgICAvLyBza2lwIHRoaXMgZm9yIEFuZHJvaWQgYmVjYXVzZSBpdCBoYW5kbGVzIGNvbXBvc2l0aW9uXG4gICAgLy8gZXZlbnRzIHF1aXRlIGRpZmZlcmVudGx5LiBBbmRyb2lkIGRvZXNuJ3QgdHJpZ2dlclxuICAgIC8vIGNvbXBvc2l0aW9uIGV2ZW50cyBmb3IgbGFuZ3VhZ2UgaW5wdXQgbWV0aG9kcyBlLmcuXG4gICAgLy8gQ2hpbmVzZSwgYnV0IGluc3RlYWQgdHJpZ2dlcnMgdGhlbSBmb3Igc3BlbGxpbmdcbiAgICAvLyBzdWdnZXN0aW9ucy4uLiAoc2VlIERpc2N1c3Npb24vIzE2MilcbiAgICB2YXIgY29tcG9zaW5nID0gZmFsc2U7XG4gICAgaWYgKCFpc0FuZHJvaWQgJiYgIWlzUmFuZ2UpIHtcbiAgICAgIHRoaXMub24oJ2NvbXBvc2l0aW9uc3RhcnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbXBvc2luZyA9IHRydWU7XG4gICAgICB9KTtcbiAgICAgIHRoaXMub24oJ2NvbXBvc2l0aW9uZW5kJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb21wb3NpbmcgPSBmYWxzZTtcbiAgICAgICAgLy8gaW4gSUUxMSB0aGUgXCJjb21wb3NpdGlvbmVuZFwiIGV2ZW50IGZpcmVzIEFGVEVSXG4gICAgICAgIC8vIHRoZSBcImlucHV0XCIgZXZlbnQsIHNvIHRoZSBpbnB1dCBoYW5kbGVyIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gYXQgdGhlIGVuZC4uLiBoYXZlIHRvIGNhbGwgaXQgaGVyZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gIzEzMjc6IGluIGxhenkgbW9kZSB0aGlzIGlzIHVuZWNlc3NhcnkuXG4gICAgICAgIGlmICghbGF6eSkge1xuICAgICAgICAgIHNlbGYubGlzdGVuZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gcHJldmVudCBtZXNzaW5nIHdpdGggdGhlIGlucHV0IHdoZW4gdXNlciBpcyB0eXBpbmcsXG4gICAgLy8gYW5kIGZvcmNlIHVwZGF0ZSBvbiBibHVyLlxuICAgIHRoaXMuZm9jdXNlZCA9IGZhbHNlO1xuICAgIGlmICghaXNSYW5nZSAmJiAhbGF6eSkge1xuICAgICAgdGhpcy5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuZm9jdXNlZCA9IHRydWU7XG4gICAgICB9KTtcbiAgICAgIHRoaXMub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuZm9jdXNlZCA9IGZhbHNlO1xuICAgICAgICAvLyBkbyBub3Qgc3luYyB2YWx1ZSBhZnRlciBmcmFnbWVudCByZW1vdmFsICgjMjAxNylcbiAgICAgICAgaWYgKCFzZWxmLl9mcmFnIHx8IHNlbGYuX2ZyYWcuaW5zZXJ0ZWQpIHtcbiAgICAgICAgICBzZWxmLnJhd0xpc3RlbmVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIE5vdyBhdHRhY2ggdGhlIG1haW4gbGlzdGVuZXJcbiAgICB0aGlzLmxpc3RlbmVyID0gdGhpcy5yYXdMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChjb21wb3NpbmcgfHwgIXNlbGYuX2JvdW5kKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciB2YWwgPSBudW1iZXIgfHwgaXNSYW5nZSA/IHRvTnVtYmVyKGVsLnZhbHVlKSA6IGVsLnZhbHVlO1xuICAgICAgc2VsZi5zZXQodmFsKTtcbiAgICAgIC8vIGZvcmNlIHVwZGF0ZSBvbiBuZXh0IHRpY2sgdG8gYXZvaWQgbG9jayAmIHNhbWUgdmFsdWVcbiAgICAgIC8vIGFsc28gb25seSB1cGRhdGUgd2hlbiB1c2VyIGlzIG5vdCB0eXBpbmdcbiAgICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHNlbGYuX2JvdW5kICYmICFzZWxmLmZvY3VzZWQpIHtcbiAgICAgICAgICBzZWxmLnVwZGF0ZShzZWxmLl93YXRjaGVyLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIGFwcGx5IGRlYm91bmNlXG4gICAgaWYgKGRlYm91bmNlKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyID0gX2RlYm91bmNlKHRoaXMubGlzdGVuZXIsIGRlYm91bmNlKTtcbiAgICB9XG5cbiAgICAvLyBTdXBwb3J0IGpRdWVyeSBldmVudHMsIHNpbmNlIGpRdWVyeS50cmlnZ2VyKCkgZG9lc24ndFxuICAgIC8vIHRyaWdnZXIgbmF0aXZlIGV2ZW50cyBpbiBzb21lIGNhc2VzIGFuZCBzb21lIHBsdWdpbnNcbiAgICAvLyByZWx5IG9uICQudHJpZ2dlcigpXG4gICAgLy9cbiAgICAvLyBXZSB3YW50IHRvIG1ha2Ugc3VyZSBpZiBhIGxpc3RlbmVyIGlzIGF0dGFjaGVkIHVzaW5nXG4gICAgLy8galF1ZXJ5LCBpdCBpcyBhbHNvIHJlbW92ZWQgd2l0aCBqUXVlcnksIHRoYXQncyB3aHlcbiAgICAvLyB3ZSBkbyB0aGUgY2hlY2sgZm9yIGVhY2ggZGlyZWN0aXZlIGluc3RhbmNlIGFuZFxuICAgIC8vIHN0b3JlIHRoYXQgY2hlY2sgcmVzdWx0IG9uIGl0c2VsZi4gVGhpcyBhbHNvIGFsbG93c1xuICAgIC8vIGVhc2llciB0ZXN0IGNvdmVyYWdlIGNvbnRyb2wgYnkgdW5zZXR0aW5nIHRoZSBnbG9iYWxcbiAgICAvLyBqUXVlcnkgdmFyaWFibGUgaW4gdGVzdHMuXG4gICAgdGhpcy5oYXNqUXVlcnkgPSB0eXBlb2YgalF1ZXJ5ID09PSAnZnVuY3Rpb24nO1xuICAgIGlmICh0aGlzLmhhc2pRdWVyeSkge1xuICAgICAgdmFyIG1ldGhvZCA9IGpRdWVyeS5mbi5vbiA/ICdvbicgOiAnYmluZCc7XG4gICAgICBqUXVlcnkoZWwpW21ldGhvZF0oJ2NoYW5nZScsIHRoaXMucmF3TGlzdGVuZXIpO1xuICAgICAgaWYgKCFsYXp5KSB7XG4gICAgICAgIGpRdWVyeShlbClbbWV0aG9kXSgnaW5wdXQnLCB0aGlzLmxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbignY2hhbmdlJywgdGhpcy5yYXdMaXN0ZW5lcik7XG4gICAgICBpZiAoIWxhenkpIHtcbiAgICAgICAgdGhpcy5vbignaW5wdXQnLCB0aGlzLmxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJRTkgZG9lc24ndCBmaXJlIGlucHV0IGV2ZW50IG9uIGJhY2tzcGFjZS9kZWwvY3V0XG4gICAgaWYgKCFsYXp5ICYmIGlzSUU5KSB7XG4gICAgICB0aGlzLm9uKCdjdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG5leHRUaWNrKHNlbGYubGlzdGVuZXIpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDQ2IHx8IGUua2V5Q29kZSA9PT0gOCkge1xuICAgICAgICAgIHNlbGYubGlzdGVuZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gc2V0IGluaXRpYWwgdmFsdWUgaWYgcHJlc2VudFxuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ3ZhbHVlJykgfHwgZWwudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJyAmJiBlbC52YWx1ZS50cmltKCkpIHtcbiAgICAgIHRoaXMuYWZ0ZXJCaW5kID0gdGhpcy5saXN0ZW5lcjtcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmFsdWUpIHtcbiAgICAvLyAjMzAyOSBvbmx5IHVwZGF0ZSB3aGVuIHRoZSB2YWx1ZSBjaGFuZ2VzLiBUaGlzIHByZXZlbnRcbiAgICAvLyBicm93c2VycyBmcm9tIG92ZXJ3cml0aW5nIHZhbHVlcyBsaWtlIHNlbGVjdGlvblN0YXJ0XG4gICAgdmFsdWUgPSBfdG9TdHJpbmcodmFsdWUpO1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5lbC52YWx1ZSkgdGhpcy5lbC52YWx1ZSA9IHZhbHVlO1xuICB9LFxuXG4gIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgaWYgKHRoaXMuaGFzalF1ZXJ5KSB7XG4gICAgICB2YXIgbWV0aG9kID0galF1ZXJ5LmZuLm9mZiA/ICdvZmYnIDogJ3VuYmluZCc7XG4gICAgICBqUXVlcnkoZWwpW21ldGhvZF0oJ2NoYW5nZScsIHRoaXMubGlzdGVuZXIpO1xuICAgICAgalF1ZXJ5KGVsKVttZXRob2RdKCdpbnB1dCcsIHRoaXMubGlzdGVuZXIpO1xuICAgIH1cbiAgfVxufTtcblxudmFyIHJhZGlvID0ge1xuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG5cbiAgICB0aGlzLmdldFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gdmFsdWUgb3ZlcndyaXRlIHZpYSB2LWJpbmQ6dmFsdWVcbiAgICAgIGlmIChlbC5oYXNPd25Qcm9wZXJ0eSgnX3ZhbHVlJykpIHtcbiAgICAgICAgcmV0dXJuIGVsLl92YWx1ZTtcbiAgICAgIH1cbiAgICAgIHZhciB2YWwgPSBlbC52YWx1ZTtcbiAgICAgIGlmIChzZWxmLnBhcmFtcy5udW1iZXIpIHtcbiAgICAgICAgdmFsID0gdG9OdW1iZXIodmFsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWw7XG4gICAgfTtcblxuICAgIHRoaXMubGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnNldChzZWxmLmdldFZhbHVlKCkpO1xuICAgIH07XG4gICAgdGhpcy5vbignY2hhbmdlJywgdGhpcy5saXN0ZW5lcik7XG5cbiAgICBpZiAoZWwuaGFzQXR0cmlidXRlKCdjaGVja2VkJykpIHtcbiAgICAgIHRoaXMuYWZ0ZXJCaW5kID0gdGhpcy5saXN0ZW5lcjtcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmFsdWUpIHtcbiAgICB0aGlzLmVsLmNoZWNrZWQgPSBsb29zZUVxdWFsKHZhbHVlLCB0aGlzLmdldFZhbHVlKCkpO1xuICB9XG59O1xuXG52YXIgc2VsZWN0ID0ge1xuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuXG4gICAgLy8gbWV0aG9kIHRvIGZvcmNlIHVwZGF0ZSBET00gdXNpbmcgbGF0ZXN0IHZhbHVlLlxuICAgIHRoaXMuZm9yY2VVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VsZi5fd2F0Y2hlcikge1xuICAgICAgICBzZWxmLnVwZGF0ZShzZWxmLl93YXRjaGVyLmdldCgpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gY2hlY2sgaWYgdGhpcyBpcyBhIG11bHRpcGxlIHNlbGVjdFxuICAgIHZhciBtdWx0aXBsZSA9IHRoaXMubXVsdGlwbGUgPSBlbC5oYXNBdHRyaWJ1dGUoJ211bHRpcGxlJyk7XG5cbiAgICAvLyBhdHRhY2ggbGlzdGVuZXJcbiAgICB0aGlzLmxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHZhbHVlID0gZ2V0VmFsdWUoZWwsIG11bHRpcGxlKTtcbiAgICAgIHZhbHVlID0gc2VsZi5wYXJhbXMubnVtYmVyID8gaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5tYXAodG9OdW1iZXIpIDogdG9OdW1iZXIodmFsdWUpIDogdmFsdWU7XG4gICAgICBzZWxmLnNldCh2YWx1ZSk7XG4gICAgfTtcbiAgICB0aGlzLm9uKCdjaGFuZ2UnLCB0aGlzLmxpc3RlbmVyKTtcblxuICAgIC8vIGlmIGhhcyBpbml0aWFsIHZhbHVlLCBzZXQgYWZ0ZXJCaW5kXG4gICAgdmFyIGluaXRWYWx1ZSA9IGdldFZhbHVlKGVsLCBtdWx0aXBsZSwgdHJ1ZSk7XG4gICAgaWYgKG11bHRpcGxlICYmIGluaXRWYWx1ZS5sZW5ndGggfHwgIW11bHRpcGxlICYmIGluaXRWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5hZnRlckJpbmQgPSB0aGlzLmxpc3RlbmVyO1xuICAgIH1cblxuICAgIC8vIEFsbCBtYWpvciBicm93c2VycyBleGNlcHQgRmlyZWZveCByZXNldHNcbiAgICAvLyBzZWxlY3RlZEluZGV4IHdpdGggdmFsdWUgLTEgdG8gMCB3aGVuIHRoZSBlbGVtZW50XG4gICAgLy8gaXMgYXBwZW5kZWQgdG8gYSBuZXcgcGFyZW50LCB0aGVyZWZvcmUgd2UgaGF2ZSB0b1xuICAgIC8vIGZvcmNlIGEgRE9NIHVwZGF0ZSB3aGVuZXZlciB0aGF0IGhhcHBlbnMuLi5cbiAgICB0aGlzLnZtLiRvbignaG9vazphdHRhY2hlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIG5leHRUaWNrKF90aGlzLmZvcmNlVXBkYXRlKTtcbiAgICB9KTtcbiAgICBpZiAoIWluRG9jKGVsKSkge1xuICAgICAgbmV4dFRpY2sodGhpcy5mb3JjZVVwZGF0ZSk7XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZhbHVlKSB7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICBlbC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgdmFyIG11bHRpID0gdGhpcy5tdWx0aXBsZSAmJiBpc0FycmF5KHZhbHVlKTtcbiAgICB2YXIgb3B0aW9ucyA9IGVsLm9wdGlvbnM7XG4gICAgdmFyIGkgPSBvcHRpb25zLmxlbmd0aDtcbiAgICB2YXIgb3AsIHZhbDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBvcCA9IG9wdGlvbnNbaV07XG4gICAgICB2YWwgPSBvcC5oYXNPd25Qcm9wZXJ0eSgnX3ZhbHVlJykgPyBvcC5fdmFsdWUgOiBvcC52YWx1ZTtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIGVxZXFlcSAqL1xuICAgICAgb3Auc2VsZWN0ZWQgPSBtdWx0aSA/IGluZGV4T2YkMSh2YWx1ZSwgdmFsKSA+IC0xIDogbG9vc2VFcXVhbCh2YWx1ZSwgdmFsKTtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgZXFlcWVxICovXG4gICAgfVxuICB9LFxuXG4gIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgdGhpcy52bS4kb2ZmKCdob29rOmF0dGFjaGVkJywgdGhpcy5mb3JjZVVwZGF0ZSk7XG4gIH1cbn07XG5cbi8qKlxuICogR2V0IHNlbGVjdCB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7U2VsZWN0RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbXVsdGlcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5pdFxuICogQHJldHVybiB7QXJyYXl8Kn1cbiAqL1xuXG5mdW5jdGlvbiBnZXRWYWx1ZShlbCwgbXVsdGksIGluaXQpIHtcbiAgdmFyIHJlcyA9IG11bHRpID8gW10gOiBudWxsO1xuICB2YXIgb3AsIHZhbCwgc2VsZWN0ZWQ7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gZWwub3B0aW9ucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBvcCA9IGVsLm9wdGlvbnNbaV07XG4gICAgc2VsZWN0ZWQgPSBpbml0ID8gb3AuaGFzQXR0cmlidXRlKCdzZWxlY3RlZCcpIDogb3Auc2VsZWN0ZWQ7XG4gICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICB2YWwgPSBvcC5oYXNPd25Qcm9wZXJ0eSgnX3ZhbHVlJykgPyBvcC5fdmFsdWUgOiBvcC52YWx1ZTtcbiAgICAgIGlmIChtdWx0aSkge1xuICAgICAgICByZXMucHVzaCh2YWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBOYXRpdmUgQXJyYXkuaW5kZXhPZiB1c2VzIHN0cmljdCBlcXVhbCwgYnV0IGluIHRoaXNcbiAqIGNhc2Ugd2UgbmVlZCB0byBtYXRjaCBzdHJpbmcvbnVtYmVycyB3aXRoIGN1c3RvbSBlcXVhbC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKi9cblxuZnVuY3Rpb24gaW5kZXhPZiQxKGFyciwgdmFsKSB7XG4gIHZhciBpID0gYXJyLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIGlmIChsb29zZUVxdWFsKGFycltpXSwgdmFsKSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxudmFyIGNoZWNrYm94ID0ge1xuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG5cbiAgICB0aGlzLmdldFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGVsLmhhc093blByb3BlcnR5KCdfdmFsdWUnKSA/IGVsLl92YWx1ZSA6IHNlbGYucGFyYW1zLm51bWJlciA/IHRvTnVtYmVyKGVsLnZhbHVlKSA6IGVsLnZhbHVlO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRCb29sZWFuVmFsdWUoKSB7XG4gICAgICB2YXIgdmFsID0gZWwuY2hlY2tlZDtcbiAgICAgIGlmICh2YWwgJiYgZWwuaGFzT3duUHJvcGVydHkoJ190cnVlVmFsdWUnKSkge1xuICAgICAgICByZXR1cm4gZWwuX3RydWVWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmICghdmFsICYmIGVsLmhhc093blByb3BlcnR5KCdfZmFsc2VWYWx1ZScpKSB7XG4gICAgICAgIHJldHVybiBlbC5fZmFsc2VWYWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgdGhpcy5saXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBtb2RlbCA9IHNlbGYuX3dhdGNoZXIudmFsdWU7XG4gICAgICBpZiAoaXNBcnJheShtb2RlbCkpIHtcbiAgICAgICAgdmFyIHZhbCA9IHNlbGYuZ2V0VmFsdWUoKTtcbiAgICAgICAgaWYgKGVsLmNoZWNrZWQpIHtcbiAgICAgICAgICBpZiAoaW5kZXhPZihtb2RlbCwgdmFsKSA8IDApIHtcbiAgICAgICAgICAgIG1vZGVsLnB1c2godmFsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kZWwuJHJlbW92ZSh2YWwpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLnNldChnZXRCb29sZWFuVmFsdWUoKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMub24oJ2NoYW5nZScsIHRoaXMubGlzdGVuZXIpO1xuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2NoZWNrZWQnKSkge1xuICAgICAgdGhpcy5hZnRlckJpbmQgPSB0aGlzLmxpc3RlbmVyO1xuICAgIH1cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2YWx1ZSkge1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICBlbC5jaGVja2VkID0gaW5kZXhPZih2YWx1ZSwgdGhpcy5nZXRWYWx1ZSgpKSA+IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZWwuaGFzT3duUHJvcGVydHkoJ190cnVlVmFsdWUnKSkge1xuICAgICAgICBlbC5jaGVja2VkID0gbG9vc2VFcXVhbCh2YWx1ZSwgZWwuX3RydWVWYWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jaGVja2VkID0gISF2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciBoYW5kbGVycyA9IHtcbiAgdGV4dDogdGV4dCQyLFxuICByYWRpbzogcmFkaW8sXG4gIHNlbGVjdDogc2VsZWN0LFxuICBjaGVja2JveDogY2hlY2tib3hcbn07XG5cbnZhciBtb2RlbCA9IHtcblxuICBwcmlvcml0eTogTU9ERUwsXG4gIHR3b1dheTogdHJ1ZSxcbiAgaGFuZGxlcnM6IGhhbmRsZXJzLFxuICBwYXJhbXM6IFsnbGF6eScsICdudW1iZXInLCAnZGVib3VuY2UnXSxcblxuICAvKipcbiAgICogUG9zc2libGUgZWxlbWVudHM6XG4gICAqICAgPHNlbGVjdD5cbiAgICogICA8dGV4dGFyZWE+XG4gICAqICAgPGlucHV0IHR5cGU9XCIqXCI+XG4gICAqICAgICAtIHRleHRcbiAgICogICAgIC0gY2hlY2tib3hcbiAgICogICAgIC0gcmFkaW9cbiAgICogICAgIC0gbnVtYmVyXG4gICAqL1xuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgLy8gZnJpZW5kbHkgd2FybmluZy4uLlxuICAgIHRoaXMuY2hlY2tGaWx0ZXJzKCk7XG4gICAgaWYgKHRoaXMuaGFzUmVhZCAmJiAhdGhpcy5oYXNXcml0ZSkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdJdCBzZWVtcyB5b3UgYXJlIHVzaW5nIGEgcmVhZC1vbmx5IGZpbHRlciB3aXRoICcgKyAndi1tb2RlbD1cIicgKyB0aGlzLmRlc2NyaXB0b3IucmF3ICsgJ1wiLiAnICsgJ1lvdSBtaWdodCB3YW50IHRvIHVzZSBhIHR3by13YXkgZmlsdGVyIHRvIGVuc3VyZSBjb3JyZWN0IGJlaGF2aW9yLicsIHRoaXMudm0pO1xuICAgIH1cbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIHZhciB0YWcgPSBlbC50YWdOYW1lO1xuICAgIHZhciBoYW5kbGVyO1xuICAgIGlmICh0YWcgPT09ICdJTlBVVCcpIHtcbiAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1tlbC50eXBlXSB8fCBoYW5kbGVycy50ZXh0O1xuICAgIH0gZWxzZSBpZiAodGFnID09PSAnU0VMRUNUJykge1xuICAgICAgaGFuZGxlciA9IGhhbmRsZXJzLnNlbGVjdDtcbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgaGFuZGxlciA9IGhhbmRsZXJzLnRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2Fybigndi1tb2RlbCBkb2VzIG5vdCBzdXBwb3J0IGVsZW1lbnQgdHlwZTogJyArIHRhZywgdGhpcy52bSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsLl9fdl9tb2RlbCA9IHRoaXM7XG4gICAgaGFuZGxlci5iaW5kLmNhbGwodGhpcyk7XG4gICAgdGhpcy51cGRhdGUgPSBoYW5kbGVyLnVwZGF0ZTtcbiAgICB0aGlzLl91bmJpbmQgPSBoYW5kbGVyLnVuYmluZDtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2sgcmVhZC93cml0ZSBmaWx0ZXIgc3RhdHMuXG4gICAqL1xuXG4gIGNoZWNrRmlsdGVyczogZnVuY3Rpb24gY2hlY2tGaWx0ZXJzKCkge1xuICAgIHZhciBmaWx0ZXJzID0gdGhpcy5maWx0ZXJzO1xuICAgIGlmICghZmlsdGVycykgcmV0dXJuO1xuICAgIHZhciBpID0gZmlsdGVycy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdmFyIGZpbHRlciA9IHJlc29sdmVBc3NldCh0aGlzLnZtLiRvcHRpb25zLCAnZmlsdGVycycsIGZpbHRlcnNbaV0ubmFtZSk7XG4gICAgICBpZiAodHlwZW9mIGZpbHRlciA9PT0gJ2Z1bmN0aW9uJyB8fCBmaWx0ZXIucmVhZCkge1xuICAgICAgICB0aGlzLmhhc1JlYWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGZpbHRlci53cml0ZSkge1xuICAgICAgICB0aGlzLmhhc1dyaXRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgdGhpcy5lbC5fX3ZfbW9kZWwgPSBudWxsO1xuICAgIHRoaXMuX3VuYmluZCAmJiB0aGlzLl91bmJpbmQoKTtcbiAgfVxufTtcblxuLy8ga2V5Q29kZSBhbGlhc2VzXG52YXIga2V5Q29kZXMgPSB7XG4gIGVzYzogMjcsXG4gIHRhYjogOSxcbiAgZW50ZXI6IDEzLFxuICBzcGFjZTogMzIsXG4gICdkZWxldGUnOiBbOCwgNDZdLFxuICB1cDogMzgsXG4gIGxlZnQ6IDM3LFxuICByaWdodDogMzksXG4gIGRvd246IDQwXG59O1xuXG5mdW5jdGlvbiBrZXlGaWx0ZXIoaGFuZGxlciwga2V5cykge1xuICB2YXIgY29kZXMgPSBrZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGNoYXJDb2RlID0ga2V5LmNoYXJDb2RlQXQoMCk7XG4gICAgaWYgKGNoYXJDb2RlID4gNDcgJiYgY2hhckNvZGUgPCA1OCkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KGtleSwgMTApO1xuICAgIH1cbiAgICBpZiAoa2V5Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgY2hhckNvZGUgPSBrZXkudG9VcHBlckNhc2UoKS5jaGFyQ29kZUF0KDApO1xuICAgICAgaWYgKGNoYXJDb2RlID4gNjQgJiYgY2hhckNvZGUgPCA5MSkge1xuICAgICAgICByZXR1cm4gY2hhckNvZGU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBrZXlDb2Rlc1trZXldO1xuICB9KTtcbiAgY29kZXMgPSBbXS5jb25jYXQuYXBwbHkoW10sIGNvZGVzKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIGtleUhhbmRsZXIoZSkge1xuICAgIGlmIChjb2Rlcy5pbmRleE9mKGUua2V5Q29kZSkgPiAtMSkge1xuICAgICAgcmV0dXJuIGhhbmRsZXIuY2FsbCh0aGlzLCBlKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0b3BGaWx0ZXIoaGFuZGxlcikge1xuICByZXR1cm4gZnVuY3Rpb24gc3RvcEhhbmRsZXIoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgcmV0dXJuIGhhbmRsZXIuY2FsbCh0aGlzLCBlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcHJldmVudEZpbHRlcihoYW5kbGVyKSB7XG4gIHJldHVybiBmdW5jdGlvbiBwcmV2ZW50SGFuZGxlcihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJldHVybiBoYW5kbGVyLmNhbGwodGhpcywgZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHNlbGZGaWx0ZXIoaGFuZGxlcikge1xuICByZXR1cm4gZnVuY3Rpb24gc2VsZkhhbmRsZXIoZSkge1xuICAgIGlmIChlLnRhcmdldCA9PT0gZS5jdXJyZW50VGFyZ2V0KSB7XG4gICAgICByZXR1cm4gaGFuZGxlci5jYWxsKHRoaXMsIGUpO1xuICAgIH1cbiAgfTtcbn1cblxudmFyIG9uJDEgPSB7XG5cbiAgcHJpb3JpdHk6IE9OLFxuICBhY2NlcHRTdGF0ZW1lbnQ6IHRydWUsXG4gIGtleUNvZGVzOiBrZXlDb2RlcyxcblxuICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgIC8vIGRlYWwgd2l0aCBpZnJhbWVzXG4gICAgaWYgKHRoaXMuZWwudGFnTmFtZSA9PT0gJ0lGUkFNRScgJiYgdGhpcy5hcmcgIT09ICdsb2FkJykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5pZnJhbWVCaW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBvbihzZWxmLmVsLmNvbnRlbnRXaW5kb3csIHNlbGYuYXJnLCBzZWxmLmhhbmRsZXIsIHNlbGYubW9kaWZpZXJzLmNhcHR1cmUpO1xuICAgICAgfTtcbiAgICAgIHRoaXMub24oJ2xvYWQnLCB0aGlzLmlmcmFtZUJpbmQpO1xuICAgIH1cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShoYW5kbGVyKSB7XG4gICAgLy8gc3R1YiBhIG5vb3AgZm9yIHYtb24gd2l0aCBubyB2YWx1ZSxcbiAgICAvLyBlLmcuIEBtb3VzZWRvd24ucHJldmVudFxuICAgIGlmICghdGhpcy5kZXNjcmlwdG9yLnJhdykge1xuICAgICAgaGFuZGxlciA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCd2LW9uOicgKyB0aGlzLmFyZyArICc9XCInICsgdGhpcy5leHByZXNzaW9uICsgJ1wiIGV4cGVjdHMgYSBmdW5jdGlvbiB2YWx1ZSwgJyArICdnb3QgJyArIGhhbmRsZXIsIHRoaXMudm0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGFwcGx5IG1vZGlmaWVyc1xuICAgIGlmICh0aGlzLm1vZGlmaWVycy5zdG9wKSB7XG4gICAgICBoYW5kbGVyID0gc3RvcEZpbHRlcihoYW5kbGVyKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubW9kaWZpZXJzLnByZXZlbnQpIHtcbiAgICAgIGhhbmRsZXIgPSBwcmV2ZW50RmlsdGVyKGhhbmRsZXIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5tb2RpZmllcnMuc2VsZikge1xuICAgICAgaGFuZGxlciA9IHNlbGZGaWx0ZXIoaGFuZGxlcik7XG4gICAgfVxuICAgIC8vIGtleSBmaWx0ZXJcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMubW9kaWZpZXJzKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIGtleSAhPT0gJ3N0b3AnICYmIGtleSAhPT0gJ3ByZXZlbnQnICYmIGtleSAhPT0gJ3NlbGYnICYmIGtleSAhPT0gJ2NhcHR1cmUnO1xuICAgIH0pO1xuICAgIGlmIChrZXlzLmxlbmd0aCkge1xuICAgICAgaGFuZGxlciA9IGtleUZpbHRlcihoYW5kbGVyLCBrZXlzKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5oYW5kbGVyID0gaGFuZGxlcjtcblxuICAgIGlmICh0aGlzLmlmcmFtZUJpbmQpIHtcbiAgICAgIHRoaXMuaWZyYW1lQmluZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbih0aGlzLmVsLCB0aGlzLmFyZywgdGhpcy5oYW5kbGVyLCB0aGlzLm1vZGlmaWVycy5jYXB0dXJlKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVzZXQ6IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIHZhciBlbCA9IHRoaXMuaWZyYW1lQmluZCA/IHRoaXMuZWwuY29udGVudFdpbmRvdyA6IHRoaXMuZWw7XG4gICAgaWYgKHRoaXMuaGFuZGxlcikge1xuICAgICAgb2ZmKGVsLCB0aGlzLmFyZywgdGhpcy5oYW5kbGVyKTtcbiAgICB9XG4gIH0sXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG59O1xuXG52YXIgcHJlZml4ZXMgPSBbJy13ZWJraXQtJywgJy1tb3otJywgJy1tcy0nXTtcbnZhciBjYW1lbFByZWZpeGVzID0gWydXZWJraXQnLCAnTW96JywgJ21zJ107XG52YXIgaW1wb3J0YW50UkUgPSAvIWltcG9ydGFudDs/JC87XG52YXIgcHJvcENhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxudmFyIHRlc3RFbCA9IG51bGw7XG5cbnZhciBzdHlsZSA9IHtcblxuICBkZWVwOiB0cnVlLFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuZWwuc3R5bGUuY3NzVGV4dCA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuaGFuZGxlT2JqZWN0KHZhbHVlLnJlZHVjZShleHRlbmQsIHt9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGFuZGxlT2JqZWN0KHZhbHVlIHx8IHt9KTtcbiAgICB9XG4gIH0sXG5cbiAgaGFuZGxlT2JqZWN0OiBmdW5jdGlvbiBoYW5kbGVPYmplY3QodmFsdWUpIHtcbiAgICAvLyBjYWNoZSBvYmplY3Qgc3R5bGVzIHNvIHRoYXQgb25seSBjaGFuZ2VkIHByb3BzXG4gICAgLy8gYXJlIGFjdHVhbGx5IHVwZGF0ZWQuXG4gICAgdmFyIGNhY2hlID0gdGhpcy5jYWNoZSB8fCAodGhpcy5jYWNoZSA9IHt9KTtcbiAgICB2YXIgbmFtZSwgdmFsO1xuICAgIGZvciAobmFtZSBpbiBjYWNoZSkge1xuICAgICAgaWYgKCEobmFtZSBpbiB2YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVTaW5nbGUobmFtZSwgbnVsbCk7XG4gICAgICAgIGRlbGV0ZSBjYWNoZVtuYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChuYW1lIGluIHZhbHVlKSB7XG4gICAgICB2YWwgPSB2YWx1ZVtuYW1lXTtcbiAgICAgIGlmICh2YWwgIT09IGNhY2hlW25hbWVdKSB7XG4gICAgICAgIGNhY2hlW25hbWVdID0gdmFsO1xuICAgICAgICB0aGlzLmhhbmRsZVNpbmdsZShuYW1lLCB2YWwpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBoYW5kbGVTaW5nbGU6IGZ1bmN0aW9uIGhhbmRsZVNpbmdsZShwcm9wLCB2YWx1ZSkge1xuICAgIHByb3AgPSBub3JtYWxpemUocHJvcCk7XG4gICAgaWYgKCFwcm9wKSByZXR1cm47IC8vIHVuc3VwcG9ydGVkIHByb3BcbiAgICAvLyBjYXN0IHBvc3NpYmxlIG51bWJlcnMvYm9vbGVhbnMgaW50byBzdHJpbmdzXG4gICAgaWYgKHZhbHVlICE9IG51bGwpIHZhbHVlICs9ICcnO1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdmFyIGlzSW1wb3J0YW50ID0gaW1wb3J0YW50UkUudGVzdCh2YWx1ZSkgPyAnaW1wb3J0YW50JyA6ICcnO1xuICAgICAgaWYgKGlzSW1wb3J0YW50KSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgIHdhcm4oJ0l0XFwncyBwcm9iYWJseSBhIGJhZCBpZGVhIHRvIHVzZSAhaW1wb3J0YW50IHdpdGggaW5saW5lIHJ1bGVzLiAnICsgJ1RoaXMgZmVhdHVyZSB3aWxsIGJlIGRlcHJlY2F0ZWQgaW4gYSBmdXR1cmUgdmVyc2lvbiBvZiBWdWUuJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKGltcG9ydGFudFJFLCAnJykudHJpbSgpO1xuICAgICAgICB0aGlzLmVsLnN0eWxlLnNldFByb3BlcnR5KHByb3Aua2ViYWIsIHZhbHVlLCBpc0ltcG9ydGFudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVsLnN0eWxlW3Byb3AuY2FtZWxdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWwuc3R5bGVbcHJvcC5jYW1lbF0gPSAnJztcbiAgICB9XG4gIH1cblxufTtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSBDU1MgcHJvcGVydHkgbmFtZS5cbiAqIC0gY2FjaGUgcmVzdWx0XG4gKiAtIGF1dG8gcHJlZml4XG4gKiAtIGNhbWVsQ2FzZSAtPiBkYXNoLWNhc2VcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZShwcm9wKSB7XG4gIGlmIChwcm9wQ2FjaGVbcHJvcF0pIHtcbiAgICByZXR1cm4gcHJvcENhY2hlW3Byb3BdO1xuICB9XG4gIHZhciByZXMgPSBwcmVmaXgocHJvcCk7XG4gIHByb3BDYWNoZVtwcm9wXSA9IHByb3BDYWNoZVtyZXNdID0gcmVzO1xuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEF1dG8gZGV0ZWN0IHRoZSBhcHByb3ByaWF0ZSBwcmVmaXggZm9yIGEgQ1NTIHByb3BlcnR5LlxuICogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzUyMzY5MlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gcHJlZml4KHByb3ApIHtcbiAgcHJvcCA9IGh5cGhlbmF0ZShwcm9wKTtcbiAgdmFyIGNhbWVsID0gY2FtZWxpemUocHJvcCk7XG4gIHZhciB1cHBlciA9IGNhbWVsLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgY2FtZWwuc2xpY2UoMSk7XG4gIGlmICghdGVzdEVsKSB7XG4gICAgdGVzdEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIH1cbiAgdmFyIGkgPSBwcmVmaXhlcy5sZW5ndGg7XG4gIHZhciBwcmVmaXhlZDtcbiAgaWYgKGNhbWVsICE9PSAnZmlsdGVyJyAmJiBjYW1lbCBpbiB0ZXN0RWwuc3R5bGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAga2ViYWI6IHByb3AsXG4gICAgICBjYW1lbDogY2FtZWxcbiAgICB9O1xuICB9XG4gIHdoaWxlIChpLS0pIHtcbiAgICBwcmVmaXhlZCA9IGNhbWVsUHJlZml4ZXNbaV0gKyB1cHBlcjtcbiAgICBpZiAocHJlZml4ZWQgaW4gdGVzdEVsLnN0eWxlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBrZWJhYjogcHJlZml4ZXNbaV0gKyBwcm9wLFxuICAgICAgICBjYW1lbDogcHJlZml4ZWRcbiAgICAgIH07XG4gICAgfVxuICB9XG59XG5cbi8vIHhsaW5rXG52YXIgeGxpbmtOUyA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJztcbnZhciB4bGlua1JFID0gL154bGluazovO1xuXG4vLyBjaGVjayBmb3IgYXR0cmlidXRlcyB0aGF0IHByb2hpYml0IGludGVycG9sYXRpb25zXG52YXIgZGlzYWxsb3dlZEludGVycEF0dHJSRSA9IC9edi18Xjp8XkB8Xig/OmlzfHRyYW5zaXRpb258dHJhbnNpdGlvbi1tb2RlfGRlYm91bmNlfHRyYWNrLWJ5fHN0YWdnZXJ8ZW50ZXItc3RhZ2dlcnxsZWF2ZS1zdGFnZ2VyKSQvO1xuLy8gdGhlc2UgYXR0cmlidXRlcyBzaG91bGQgYWxzbyBzZXQgdGhlaXIgY29ycmVzcG9uZGluZyBwcm9wZXJ0aWVzXG4vLyBiZWNhdXNlIHRoZXkgb25seSBhZmZlY3QgdGhlIGluaXRpYWwgc3RhdGUgb2YgdGhlIGVsZW1lbnRcbnZhciBhdHRyV2l0aFByb3BzUkUgPSAvXig/OnZhbHVlfGNoZWNrZWR8c2VsZWN0ZWR8bXV0ZWQpJC87XG4vLyB0aGVzZSBhdHRyaWJ1dGVzIGV4cGVjdCBlbnVtcmF0ZWQgdmFsdWVzIG9mIFwidHJ1ZVwiIG9yIFwiZmFsc2VcIlxuLy8gYnV0IGFyZSBub3QgYm9vbGVhbiBhdHRyaWJ1dGVzXG52YXIgZW51bWVyYXRlZEF0dHJSRSA9IC9eKD86ZHJhZ2dhYmxlfGNvbnRlbnRlZGl0YWJsZXxzcGVsbGNoZWNrKSQvO1xuXG4vLyB0aGVzZSBhdHRyaWJ1dGVzIHNob3VsZCBzZXQgYSBoaWRkZW4gcHJvcGVydHkgZm9yXG4vLyBiaW5kaW5nIHYtbW9kZWwgdG8gb2JqZWN0IHZhbHVlc1xudmFyIG1vZGVsUHJvcHMgPSB7XG4gIHZhbHVlOiAnX3ZhbHVlJyxcbiAgJ3RydWUtdmFsdWUnOiAnX3RydWVWYWx1ZScsXG4gICdmYWxzZS12YWx1ZSc6ICdfZmFsc2VWYWx1ZSdcbn07XG5cbnZhciBiaW5kJDEgPSB7XG5cbiAgcHJpb3JpdHk6IEJJTkQsXG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICB2YXIgYXR0ciA9IHRoaXMuYXJnO1xuICAgIHZhciB0YWcgPSB0aGlzLmVsLnRhZ05hbWU7XG4gICAgLy8gc2hvdWxkIGJlIGRlZXAgd2F0Y2ggb24gb2JqZWN0IG1vZGVcbiAgICBpZiAoIWF0dHIpIHtcbiAgICAgIHRoaXMuZGVlcCA9IHRydWU7XG4gICAgfVxuICAgIC8vIGhhbmRsZSBpbnRlcnBvbGF0aW9uIGJpbmRpbmdzXG4gICAgdmFyIGRlc2NyaXB0b3IgPSB0aGlzLmRlc2NyaXB0b3I7XG4gICAgdmFyIHRva2VucyA9IGRlc2NyaXB0b3IuaW50ZXJwO1xuICAgIGlmICh0b2tlbnMpIHtcbiAgICAgIC8vIGhhbmRsZSBpbnRlcnBvbGF0aW9ucyB3aXRoIG9uZS10aW1lIHRva2Vuc1xuICAgICAgaWYgKGRlc2NyaXB0b3IuaGFzT25lVGltZSkge1xuICAgICAgICB0aGlzLmV4cHJlc3Npb24gPSB0b2tlbnNUb0V4cCh0b2tlbnMsIHRoaXMuX3Njb3BlIHx8IHRoaXMudm0pO1xuICAgICAgfVxuXG4gICAgICAvLyBvbmx5IGFsbG93IGJpbmRpbmcgb24gbmF0aXZlIGF0dHJpYnV0ZXNcbiAgICAgIGlmIChkaXNhbGxvd2VkSW50ZXJwQXR0clJFLnRlc3QoYXR0cikgfHwgYXR0ciA9PT0gJ25hbWUnICYmICh0YWcgPT09ICdQQVJUSUFMJyB8fCB0YWcgPT09ICdTTE9UJykpIHtcbiAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKGF0dHIgKyAnPVwiJyArIGRlc2NyaXB0b3IucmF3ICsgJ1wiOiAnICsgJ2F0dHJpYnV0ZSBpbnRlcnBvbGF0aW9uIGlzIG5vdCBhbGxvd2VkIGluIFZ1ZS5qcyAnICsgJ2RpcmVjdGl2ZXMgYW5kIHNwZWNpYWwgYXR0cmlidXRlcy4nLCB0aGlzLnZtKTtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cik7XG4gICAgICAgIHRoaXMuaW52YWxpZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgdmFyIHJhdyA9IGF0dHIgKyAnPVwiJyArIGRlc2NyaXB0b3IucmF3ICsgJ1wiOiAnO1xuICAgICAgICAvLyB3YXJuIHNyY1xuICAgICAgICBpZiAoYXR0ciA9PT0gJ3NyYycpIHtcbiAgICAgICAgICB3YXJuKHJhdyArICdpbnRlcnBvbGF0aW9uIGluIFwic3JjXCIgYXR0cmlidXRlIHdpbGwgY2F1c2UgJyArICdhIDQwNCByZXF1ZXN0LiBVc2Ugdi1iaW5kOnNyYyBpbnN0ZWFkLicsIHRoaXMudm0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2FybiBzdHlsZVxuICAgICAgICBpZiAoYXR0ciA9PT0gJ3N0eWxlJykge1xuICAgICAgICAgIHdhcm4ocmF3ICsgJ2ludGVycG9sYXRpb24gaW4gXCJzdHlsZVwiIGF0dHJpYnV0ZSB3aWxsIGNhdXNlICcgKyAndGhlIGF0dHJpYnV0ZSB0byBiZSBkaXNjYXJkZWQgaW4gSW50ZXJuZXQgRXhwbG9yZXIuICcgKyAnVXNlIHYtYmluZDpzdHlsZSBpbnN0ZWFkLicsIHRoaXMudm0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuaW52YWxpZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYXR0ciA9IHRoaXMuYXJnO1xuICAgIGlmICh0aGlzLmFyZykge1xuICAgICAgdGhpcy5oYW5kbGVTaW5nbGUoYXR0ciwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhhbmRsZU9iamVjdCh2YWx1ZSB8fCB7fSk7XG4gICAgfVxuICB9LFxuXG4gIC8vIHNoYXJlIG9iamVjdCBoYW5kbGVyIHdpdGggdi1iaW5kOmNsYXNzXG4gIGhhbmRsZU9iamVjdDogc3R5bGUuaGFuZGxlT2JqZWN0LFxuXG4gIGhhbmRsZVNpbmdsZTogZnVuY3Rpb24gaGFuZGxlU2luZ2xlKGF0dHIsIHZhbHVlKSB7XG4gICAgdmFyIGVsID0gdGhpcy5lbDtcbiAgICB2YXIgaW50ZXJwID0gdGhpcy5kZXNjcmlwdG9yLmludGVycDtcbiAgICBpZiAodGhpcy5tb2RpZmllcnMuY2FtZWwpIHtcbiAgICAgIGF0dHIgPSBjYW1lbGl6ZShhdHRyKTtcbiAgICB9XG4gICAgaWYgKCFpbnRlcnAgJiYgYXR0cldpdGhQcm9wc1JFLnRlc3QoYXR0cikgJiYgYXR0ciBpbiBlbCkge1xuICAgICAgdmFyIGF0dHJWYWx1ZSA9IGF0dHIgPT09ICd2YWx1ZScgPyB2YWx1ZSA9PSBudWxsIC8vIElFOSB3aWxsIHNldCBpbnB1dC52YWx1ZSB0byBcIm51bGxcIiBmb3IgbnVsbC4uLlxuICAgICAgPyAnJyA6IHZhbHVlIDogdmFsdWU7XG5cbiAgICAgIGlmIChlbFthdHRyXSAhPT0gYXR0clZhbHVlKSB7XG4gICAgICAgIGVsW2F0dHJdID0gYXR0clZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBzZXQgbW9kZWwgcHJvcHNcbiAgICB2YXIgbW9kZWxQcm9wID0gbW9kZWxQcm9wc1thdHRyXTtcbiAgICBpZiAoIWludGVycCAmJiBtb2RlbFByb3ApIHtcbiAgICAgIGVsW21vZGVsUHJvcF0gPSB2YWx1ZTtcbiAgICAgIC8vIHVwZGF0ZSB2LW1vZGVsIGlmIHByZXNlbnRcbiAgICAgIHZhciBtb2RlbCA9IGVsLl9fdl9tb2RlbDtcbiAgICAgIGlmIChtb2RlbCkge1xuICAgICAgICBtb2RlbC5saXN0ZW5lcigpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBkbyBub3Qgc2V0IHZhbHVlIGF0dHJpYnV0ZSBmb3IgdGV4dGFyZWFcbiAgICBpZiAoYXR0ciA9PT0gJ3ZhbHVlJyAmJiBlbC50YWdOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIHVwZGF0ZSBhdHRyaWJ1dGVcbiAgICBpZiAoZW51bWVyYXRlZEF0dHJSRS50ZXN0KGF0dHIpKSB7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsdWUgPyAndHJ1ZScgOiAnZmFsc2UnKTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlICE9IG51bGwgJiYgdmFsdWUgIT09IGZhbHNlKSB7XG4gICAgICBpZiAoYXR0ciA9PT0gJ2NsYXNzJykge1xuICAgICAgICAvLyBoYW5kbGUgZWRnZSBjYXNlICMxOTYwOlxuICAgICAgICAvLyBjbGFzcyBpbnRlcnBvbGF0aW9uIHNob3VsZCBub3Qgb3ZlcndyaXRlIFZ1ZSB0cmFuc2l0aW9uIGNsYXNzXG4gICAgICAgIGlmIChlbC5fX3ZfdHJhbnMpIHtcbiAgICAgICAgICB2YWx1ZSArPSAnICcgKyBlbC5fX3ZfdHJhbnMuaWQgKyAnLXRyYW5zaXRpb24nO1xuICAgICAgICB9XG4gICAgICAgIHNldENsYXNzKGVsLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHhsaW5rUkUudGVzdChhdHRyKSkge1xuICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyh4bGlua05TLCBhdHRyLCB2YWx1ZSA9PT0gdHJ1ZSA/ICcnIDogdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHIsIHZhbHVlID09PSB0cnVlID8gJycgOiB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShhdHRyKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBlbCA9IHtcblxuICBwcmlvcml0eTogRUwsXG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIXRoaXMuYXJnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpZCA9IHRoaXMuaWQgPSBjYW1lbGl6ZSh0aGlzLmFyZyk7XG4gICAgdmFyIHJlZnMgPSAodGhpcy5fc2NvcGUgfHwgdGhpcy52bSkuJGVscztcbiAgICBpZiAoaGFzT3duKHJlZnMsIGlkKSkge1xuICAgICAgcmVmc1tpZF0gPSB0aGlzLmVsO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZpbmVSZWFjdGl2ZShyZWZzLCBpZCwgdGhpcy5lbCk7XG4gICAgfVxuICB9LFxuXG4gIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgIHZhciByZWZzID0gKHRoaXMuX3Njb3BlIHx8IHRoaXMudm0pLiRlbHM7XG4gICAgaWYgKHJlZnNbdGhpcy5pZF0gPT09IHRoaXMuZWwpIHtcbiAgICAgIHJlZnNbdGhpcy5pZF0gPSBudWxsO1xuICAgIH1cbiAgfVxufTtcblxudmFyIHJlZiA9IHtcbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ3YtcmVmOicgKyB0aGlzLmFyZyArICcgbXVzdCBiZSB1c2VkIG9uIGEgY2hpbGQgJyArICdjb21wb25lbnQuIEZvdW5kIG9uIDwnICsgdGhpcy5lbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgKyAnPi4nLCB0aGlzLnZtKTtcbiAgfVxufTtcblxudmFyIGNsb2FrID0ge1xuICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgIHZhciBlbCA9IHRoaXMuZWw7XG4gICAgdGhpcy52bS4kb25jZSgncHJlLWhvb2s6Y29tcGlsZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3YtY2xvYWsnKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy8gbXVzdCBleHBvcnQgcGxhaW4gb2JqZWN0XG52YXIgZGlyZWN0aXZlcyA9IHtcbiAgdGV4dDogdGV4dCQxLFxuICBodG1sOiBodG1sLFxuICAnZm9yJzogdkZvcixcbiAgJ2lmJzogdklmLFxuICBzaG93OiBzaG93LFxuICBtb2RlbDogbW9kZWwsXG4gIG9uOiBvbiQxLFxuICBiaW5kOiBiaW5kJDEsXG4gIGVsOiBlbCxcbiAgcmVmOiByZWYsXG4gIGNsb2FrOiBjbG9ha1xufTtcblxudmFyIHZDbGFzcyA9IHtcblxuICBkZWVwOiB0cnVlLFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLnNldENsYXNzKHZhbHVlLnRyaW0oKS5zcGxpdCgvXFxzKy8pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRDbGFzcyhub3JtYWxpemUkMSh2YWx1ZSkpO1xuICAgIH1cbiAgfSxcblxuICBzZXRDbGFzczogZnVuY3Rpb24gc2V0Q2xhc3ModmFsdWUpIHtcbiAgICB0aGlzLmNsZWFudXAodmFsdWUpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgdmFsID0gdmFsdWVbaV07XG4gICAgICBpZiAodmFsKSB7XG4gICAgICAgIGFwcGx5KHRoaXMuZWwsIHZhbCwgYWRkQ2xhc3MpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnByZXZLZXlzID0gdmFsdWU7XG4gIH0sXG5cbiAgY2xlYW51cDogZnVuY3Rpb24gY2xlYW51cCh2YWx1ZSkge1xuICAgIHZhciBwcmV2S2V5cyA9IHRoaXMucHJldktleXM7XG4gICAgaWYgKCFwcmV2S2V5cykgcmV0dXJuO1xuICAgIHZhciBpID0gcHJldktleXMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHZhciBrZXkgPSBwcmV2S2V5c1tpXTtcbiAgICAgIGlmICghdmFsdWUgfHwgdmFsdWUuaW5kZXhPZihrZXkpIDwgMCkge1xuICAgICAgICBhcHBseSh0aGlzLmVsLCBrZXksIHJlbW92ZUNsYXNzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogTm9ybWFsaXplIG9iamVjdHMgYW5kIGFycmF5cyAocG90ZW50aWFsbHkgY29udGFpbmluZyBvYmplY3RzKVxuICogaW50byBhcnJheSBvZiBzdHJpbmdzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5PFN0cmluZ3xPYmplY3Q+fSB2YWx1ZVxuICogQHJldHVybiB7QXJyYXk8U3RyaW5nPn1cbiAqL1xuXG5mdW5jdGlvbiBub3JtYWxpemUkMSh2YWx1ZSkge1xuICB2YXIgcmVzID0gW107XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgX2tleSA9IHZhbHVlW2ldO1xuICAgICAgaWYgKF9rZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBfa2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJlcy5wdXNoKF9rZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAodmFyIGsgaW4gX2tleSkge1xuICAgICAgICAgICAgaWYgKF9rZXlba10pIHJlcy5wdXNoKGspO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZVtrZXldKSByZXMucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEFkZCBvciByZW1vdmUgYSBjbGFzcy9jbGFzc2VzIG9uIGFuIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5IFRoZSBjbGFzcyBuYW1lLiBUaGlzIG1heSBvciBtYXkgbm90XG4gKiAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW4gYSBzcGFjZSBjaGFyYWN0ZXIsIGluIHN1Y2ggYVxuICogICAgICAgICAgICAgICAgICAgICBjYXNlIHdlJ2xsIGRlYWwgd2l0aCBtdWx0aXBsZSBjbGFzc1xuICogICAgICAgICAgICAgICAgICAgICBuYW1lcyBhdCBvbmNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqL1xuXG5mdW5jdGlvbiBhcHBseShlbCwga2V5LCBmbikge1xuICBrZXkgPSBrZXkudHJpbSgpO1xuICBpZiAoa2V5LmluZGV4T2YoJyAnKSA9PT0gLTEpIHtcbiAgICBmbihlbCwga2V5KTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gVGhlIGtleSBjb250YWlucyBvbmUgb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzLlxuICAvLyBTaW5jZSBhIGNsYXNzIG5hbWUgZG9lc24ndCBhY2NlcHQgc3VjaCBjaGFyYWN0ZXJzLCB3ZVxuICAvLyB0cmVhdCBpdCBhcyBtdWx0aXBsZSBjbGFzc2VzLlxuICB2YXIga2V5cyA9IGtleS5zcGxpdCgvXFxzKy8pO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm4oZWwsIGtleXNbaV0pO1xuICB9XG59XG5cbnZhciBjb21wb25lbnQgPSB7XG5cbiAgcHJpb3JpdHk6IENPTVBPTkVOVCxcblxuICBwYXJhbXM6IFsna2VlcC1hbGl2ZScsICd0cmFuc2l0aW9uLW1vZGUnLCAnaW5saW5lLXRlbXBsYXRlJ10sXG5cbiAgLyoqXG4gICAqIFNldHVwLiBUd28gcG9zc2libGUgdXNhZ2VzOlxuICAgKlxuICAgKiAtIHN0YXRpYzpcbiAgICogICA8Y29tcD4gb3IgPGRpdiB2LWNvbXBvbmVudD1cImNvbXBcIj5cbiAgICpcbiAgICogLSBkeW5hbWljOlxuICAgKiAgIDxjb21wb25lbnQgOmlzPVwidmlld1wiPlxuICAgKi9cblxuICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgIGlmICghdGhpcy5lbC5fX3Z1ZV9fKSB7XG4gICAgICAvLyBrZWVwLWFsaXZlIGNhY2hlXG4gICAgICB0aGlzLmtlZXBBbGl2ZSA9IHRoaXMucGFyYW1zLmtlZXBBbGl2ZTtcbiAgICAgIGlmICh0aGlzLmtlZXBBbGl2ZSkge1xuICAgICAgICB0aGlzLmNhY2hlID0ge307XG4gICAgICB9XG4gICAgICAvLyBjaGVjayBpbmxpbmUtdGVtcGxhdGVcbiAgICAgIGlmICh0aGlzLnBhcmFtcy5pbmxpbmVUZW1wbGF0ZSkge1xuICAgICAgICAvLyBleHRyYWN0IGlubGluZSB0ZW1wbGF0ZSBhcyBhIERvY3VtZW50RnJhZ21lbnRcbiAgICAgICAgdGhpcy5pbmxpbmVUZW1wbGF0ZSA9IGV4dHJhY3RDb250ZW50KHRoaXMuZWwsIHRydWUpO1xuICAgICAgfVxuICAgICAgLy8gY29tcG9uZW50IHJlc29sdXRpb24gcmVsYXRlZCBzdGF0ZVxuICAgICAgdGhpcy5wZW5kaW5nQ29tcG9uZW50Q2IgPSB0aGlzLkNvbXBvbmVudCA9IG51bGw7XG4gICAgICAvLyB0cmFuc2l0aW9uIHJlbGF0ZWQgc3RhdGVcbiAgICAgIHRoaXMucGVuZGluZ1JlbW92YWxzID0gMDtcbiAgICAgIHRoaXMucGVuZGluZ1JlbW92YWxDYiA9IG51bGw7XG4gICAgICAvLyBjcmVhdGUgYSByZWYgYW5jaG9yXG4gICAgICB0aGlzLmFuY2hvciA9IGNyZWF0ZUFuY2hvcigndi1jb21wb25lbnQnKTtcbiAgICAgIHJlcGxhY2UodGhpcy5lbCwgdGhpcy5hbmNob3IpO1xuICAgICAgLy8gcmVtb3ZlIGlzIGF0dHJpYnV0ZS5cbiAgICAgIC8vIHRoaXMgaXMgcmVtb3ZlZCBkdXJpbmcgY29tcGlsYXRpb24sIGJ1dCBiZWNhdXNlIGNvbXBpbGF0aW9uIGlzXG4gICAgICAvLyBjYWNoZWQsIHdoZW4gdGhlIGNvbXBvbmVudCBpcyB1c2VkIGVsc2V3aGVyZSB0aGlzIGF0dHJpYnV0ZVxuICAgICAgLy8gd2lsbCByZW1haW4gYXQgbGluayB0aW1lLlxuICAgICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoJ2lzJyk7XG4gICAgICB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSgnOmlzJyk7XG4gICAgICAvLyByZW1vdmUgcmVmLCBzYW1lIGFzIGFib3ZlXG4gICAgICBpZiAodGhpcy5kZXNjcmlwdG9yLnJlZikge1xuICAgICAgICB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSgndi1yZWY6JyArIGh5cGhlbmF0ZSh0aGlzLmRlc2NyaXB0b3IucmVmKSk7XG4gICAgICB9XG4gICAgICAvLyBpZiBzdGF0aWMsIGJ1aWxkIHJpZ2h0IG5vdy5cbiAgICAgIGlmICh0aGlzLmxpdGVyYWwpIHtcbiAgICAgICAgdGhpcy5zZXRDb21wb25lbnQodGhpcy5leHByZXNzaW9uKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdjYW5ub3QgbW91bnQgY29tcG9uZW50IFwiJyArIHRoaXMuZXhwcmVzc2lvbiArICdcIiAnICsgJ29uIGFscmVhZHkgbW91bnRlZCBlbGVtZW50OiAnICsgdGhpcy5lbCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBQdWJsaWMgdXBkYXRlLCBjYWxsZWQgYnkgdGhlIHdhdGNoZXIgaW4gdGhlIGR5bmFtaWNcbiAgICogbGl0ZXJhbCBzY2VuYXJpbywgZS5nLiA8Y29tcG9uZW50IDppcz1cInZpZXdcIj5cbiAgICovXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmFsdWUpIHtcbiAgICBpZiAoIXRoaXMubGl0ZXJhbCkge1xuICAgICAgdGhpcy5zZXRDb21wb25lbnQodmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogU3dpdGNoIGR5bmFtaWMgY29tcG9uZW50cy4gTWF5IHJlc29sdmUgdGhlIGNvbXBvbmVudFxuICAgKiBhc3luY2hyb25vdXNseSwgYW5kIHBlcmZvcm0gdHJhbnNpdGlvbiBiYXNlZCBvblxuICAgKiBzcGVjaWZpZWQgdHJhbnNpdGlvbiBtb2RlLiBBY2NlcHRzIGEgZmV3IGFkZGl0aW9uYWxcbiAgICogYXJndW1lbnRzIHNwZWNpZmljYWxseSBmb3IgdnVlLXJvdXRlci5cbiAgICpcbiAgICogVGhlIGNhbGxiYWNrIGlzIGNhbGxlZCB3aGVuIHRoZSBmdWxsIHRyYW5zaXRpb24gaXNcbiAgICogZmluaXNoZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gICAqL1xuXG4gIHNldENvbXBvbmVudDogZnVuY3Rpb24gc2V0Q29tcG9uZW50KHZhbHVlLCBjYikge1xuICAgIHRoaXMuaW52YWxpZGF0ZVBlbmRpbmcoKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAvLyBqdXN0IHJlbW92ZSBjdXJyZW50XG4gICAgICB0aGlzLnVuYnVpbGQodHJ1ZSk7XG4gICAgICB0aGlzLnJlbW92ZSh0aGlzLmNoaWxkVk0sIGNiKTtcbiAgICAgIHRoaXMuY2hpbGRWTSA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMucmVzb2x2ZUNvbXBvbmVudCh2YWx1ZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLm1vdW50Q29tcG9uZW50KGNiKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogUmVzb2x2ZSB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHRvIHVzZSB3aGVuIGNyZWF0aW5nXG4gICAqIHRoZSBjaGlsZCB2bS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHZhbHVlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gICAqL1xuXG4gIHJlc29sdmVDb21wb25lbnQ6IGZ1bmN0aW9uIHJlc29sdmVDb21wb25lbnQodmFsdWUsIGNiKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMucGVuZGluZ0NvbXBvbmVudENiID0gY2FuY2VsbGFibGUoZnVuY3Rpb24gKENvbXBvbmVudCkge1xuICAgICAgc2VsZi5Db21wb25lbnROYW1lID0gQ29tcG9uZW50Lm9wdGlvbnMubmFtZSB8fCAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogbnVsbCk7XG4gICAgICBzZWxmLkNvbXBvbmVudCA9IENvbXBvbmVudDtcbiAgICAgIGNiKCk7XG4gICAgfSk7XG4gICAgdGhpcy52bS5fcmVzb2x2ZUNvbXBvbmVudCh2YWx1ZSwgdGhpcy5wZW5kaW5nQ29tcG9uZW50Q2IpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2UgdXNpbmcgdGhlIGN1cnJlbnQgY29uc3RydWN0b3IgYW5kXG4gICAqIHJlcGxhY2UgdGhlIGV4aXN0aW5nIGluc3RhbmNlLiBUaGlzIG1ldGhvZCBkb2Vzbid0IGNhcmVcbiAgICogd2hldGhlciB0aGUgbmV3IGNvbXBvbmVudCBhbmQgdGhlIG9sZCBvbmUgYXJlIGFjdHVhbGx5XG4gICAqIHRoZSBzYW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gICAqL1xuXG4gIG1vdW50Q29tcG9uZW50OiBmdW5jdGlvbiBtb3VudENvbXBvbmVudChjYikge1xuICAgIC8vIGFjdHVhbCBtb3VudFxuICAgIHRoaXMudW5idWlsZCh0cnVlKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGFjdGl2YXRlSG9va3MgPSB0aGlzLkNvbXBvbmVudC5vcHRpb25zLmFjdGl2YXRlO1xuICAgIHZhciBjYWNoZWQgPSB0aGlzLmdldENhY2hlZCgpO1xuICAgIHZhciBuZXdDb21wb25lbnQgPSB0aGlzLmJ1aWxkKCk7XG4gICAgaWYgKGFjdGl2YXRlSG9va3MgJiYgIWNhY2hlZCkge1xuICAgICAgdGhpcy53YWl0aW5nRm9yID0gbmV3Q29tcG9uZW50O1xuICAgICAgY2FsbEFjdGl2YXRlSG9va3MoYWN0aXZhdGVIb29rcywgbmV3Q29tcG9uZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzZWxmLndhaXRpbmdGb3IgIT09IG5ld0NvbXBvbmVudCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLndhaXRpbmdGb3IgPSBudWxsO1xuICAgICAgICBzZWxmLnRyYW5zaXRpb24obmV3Q29tcG9uZW50LCBjYik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gdXBkYXRlIHJlZiBmb3Iga2VwdC1hbGl2ZSBjb21wb25lbnRcbiAgICAgIGlmIChjYWNoZWQpIHtcbiAgICAgICAgbmV3Q29tcG9uZW50Ll91cGRhdGVSZWYoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudHJhbnNpdGlvbihuZXdDb21wb25lbnQsIGNiKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIGNvbXBvbmVudCBjaGFuZ2VzIG9yIHVuYmluZHMgYmVmb3JlIGFuIGFzeW5jXG4gICAqIGNvbnN0cnVjdG9yIGlzIHJlc29sdmVkLCB3ZSBuZWVkIHRvIGludmFsaWRhdGUgaXRzXG4gICAqIHBlbmRpbmcgY2FsbGJhY2suXG4gICAqL1xuXG4gIGludmFsaWRhdGVQZW5kaW5nOiBmdW5jdGlvbiBpbnZhbGlkYXRlUGVuZGluZygpIHtcbiAgICBpZiAodGhpcy5wZW5kaW5nQ29tcG9uZW50Q2IpIHtcbiAgICAgIHRoaXMucGVuZGluZ0NvbXBvbmVudENiLmNhbmNlbCgpO1xuICAgICAgdGhpcy5wZW5kaW5nQ29tcG9uZW50Q2IgPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogSW5zdGFudGlhdGUvaW5zZXJ0IGEgbmV3IGNoaWxkIHZtLlxuICAgKiBJZiBrZWVwIGFsaXZlIGFuZCBoYXMgY2FjaGVkIGluc3RhbmNlLCBpbnNlcnQgdGhhdFxuICAgKiBpbnN0YW5jZTsgb3RoZXJ3aXNlIGJ1aWxkIGEgbmV3IG9uZSBhbmQgY2FjaGUgaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbZXh0cmFPcHRpb25zXVxuICAgKiBAcmV0dXJuIHtWdWV9IC0gdGhlIGNyZWF0ZWQgaW5zdGFuY2VcbiAgICovXG5cbiAgYnVpbGQ6IGZ1bmN0aW9uIGJ1aWxkKGV4dHJhT3B0aW9ucykge1xuICAgIHZhciBjYWNoZWQgPSB0aGlzLmdldENhY2hlZCgpO1xuICAgIGlmIChjYWNoZWQpIHtcbiAgICAgIHJldHVybiBjYWNoZWQ7XG4gICAgfVxuICAgIGlmICh0aGlzLkNvbXBvbmVudCkge1xuICAgICAgLy8gZGVmYXVsdCBvcHRpb25zXG4gICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgbmFtZTogdGhpcy5Db21wb25lbnROYW1lLFxuICAgICAgICBlbDogY2xvbmVOb2RlKHRoaXMuZWwpLFxuICAgICAgICB0ZW1wbGF0ZTogdGhpcy5pbmxpbmVUZW1wbGF0ZSxcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRvIGFkZCB0aGUgY2hpbGQgd2l0aCBjb3JyZWN0IHBhcmVudFxuICAgICAgICAvLyBpZiB0aGlzIGlzIGEgdHJhbnNjbHVkZWQgY29tcG9uZW50LCBpdHMgcGFyZW50XG4gICAgICAgIC8vIHNob3VsZCBiZSB0aGUgdHJhbnNjbHVzaW9uIGhvc3QuXG4gICAgICAgIHBhcmVudDogdGhpcy5faG9zdCB8fCB0aGlzLnZtLFxuICAgICAgICAvLyBpZiBubyBpbmxpbmUtdGVtcGxhdGUsIHRoZW4gdGhlIGNvbXBpbGVkXG4gICAgICAgIC8vIGxpbmtlciBjYW4gYmUgY2FjaGVkIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gICAgICAgIF9saW5rZXJDYWNoYWJsZTogIXRoaXMuaW5saW5lVGVtcGxhdGUsXG4gICAgICAgIF9yZWY6IHRoaXMuZGVzY3JpcHRvci5yZWYsXG4gICAgICAgIF9hc0NvbXBvbmVudDogdHJ1ZSxcbiAgICAgICAgX2lzUm91dGVyVmlldzogdGhpcy5faXNSb3V0ZXJWaWV3LFxuICAgICAgICAvLyBpZiB0aGlzIGlzIGEgdHJhbnNjbHVkZWQgY29tcG9uZW50LCBjb250ZXh0XG4gICAgICAgIC8vIHdpbGwgYmUgdGhlIGNvbW1vbiBwYXJlbnQgdm0gb2YgdGhpcyBpbnN0YW5jZVxuICAgICAgICAvLyBhbmQgaXRzIGhvc3QuXG4gICAgICAgIF9jb250ZXh0OiB0aGlzLnZtLFxuICAgICAgICAvLyBpZiB0aGlzIGlzIGluc2lkZSBhbiBpbmxpbmUgdi1mb3IsIHRoZSBzY29wZVxuICAgICAgICAvLyB3aWxsIGJlIHRoZSBpbnRlcm1lZGlhdGUgc2NvcGUgY3JlYXRlZCBmb3IgdGhpc1xuICAgICAgICAvLyByZXBlYXQgZnJhZ21lbnQuIHRoaXMgaXMgdXNlZCBmb3IgbGlua2luZyBwcm9wc1xuICAgICAgICAvLyBhbmQgY29udGFpbmVyIGRpcmVjdGl2ZXMuXG4gICAgICAgIF9zY29wZTogdGhpcy5fc2NvcGUsXG4gICAgICAgIC8vIHBhc3MgaW4gdGhlIG93bmVyIGZyYWdtZW50IG9mIHRoaXMgY29tcG9uZW50LlxuICAgICAgICAvLyB0aGlzIGlzIG5lY2Vzc2FyeSBzbyB0aGF0IHRoZSBmcmFnbWVudCBjYW4ga2VlcFxuICAgICAgICAvLyB0cmFjayBvZiBpdHMgY29udGFpbmVkIGNvbXBvbmVudHMgaW4gb3JkZXIgdG9cbiAgICAgICAgLy8gY2FsbCBhdHRhY2gvZGV0YWNoIGhvb2tzIGZvciB0aGVtLlxuICAgICAgICBfZnJhZzogdGhpcy5fZnJhZ1xuICAgICAgfTtcbiAgICAgIC8vIGV4dHJhIG9wdGlvbnNcbiAgICAgIC8vIGluIDEuMC4wIHRoaXMgaXMgdXNlZCBieSB2dWUtcm91dGVyIG9ubHlcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKGV4dHJhT3B0aW9ucykge1xuICAgICAgICBleHRlbmQob3B0aW9ucywgZXh0cmFPcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIHZhciBjaGlsZCA9IG5ldyB0aGlzLkNvbXBvbmVudChvcHRpb25zKTtcbiAgICAgIGlmICh0aGlzLmtlZXBBbGl2ZSkge1xuICAgICAgICB0aGlzLmNhY2hlW3RoaXMuQ29tcG9uZW50LmNpZF0gPSBjaGlsZDtcbiAgICAgIH1cbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdGhpcy5lbC5oYXNBdHRyaWJ1dGUoJ3RyYW5zaXRpb24nKSAmJiBjaGlsZC5faXNGcmFnbWVudCkge1xuICAgICAgICB3YXJuKCdUcmFuc2l0aW9ucyB3aWxsIG5vdCB3b3JrIG9uIGEgZnJhZ21lbnQgaW5zdGFuY2UuICcgKyAnVGVtcGxhdGU6ICcgKyBjaGlsZC4kb3B0aW9ucy50ZW1wbGF0ZSwgY2hpbGQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVHJ5IHRvIGdldCBhIGNhY2hlZCBpbnN0YW5jZSBvZiB0aGUgY3VycmVudCBjb21wb25lbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge1Z1ZXx1bmRlZmluZWR9XG4gICAqL1xuXG4gIGdldENhY2hlZDogZnVuY3Rpb24gZ2V0Q2FjaGVkKCkge1xuICAgIHJldHVybiB0aGlzLmtlZXBBbGl2ZSAmJiB0aGlzLmNhY2hlW3RoaXMuQ29tcG9uZW50LmNpZF07XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRlYXJkb3duIHRoZSBjdXJyZW50IGNoaWxkLCBidXQgZGVmZXJzIGNsZWFudXAgc29cbiAgICogdGhhdCB3ZSBjYW4gc2VwYXJhdGUgdGhlIGRlc3Ryb3kgYW5kIHJlbW92YWwgc3RlcHMuXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZGVmZXJcbiAgICovXG5cbiAgdW5idWlsZDogZnVuY3Rpb24gdW5idWlsZChkZWZlcikge1xuICAgIGlmICh0aGlzLndhaXRpbmdGb3IpIHtcbiAgICAgIGlmICghdGhpcy5rZWVwQWxpdmUpIHtcbiAgICAgICAgdGhpcy53YWl0aW5nRm9yLiRkZXN0cm95KCk7XG4gICAgICB9XG4gICAgICB0aGlzLndhaXRpbmdGb3IgPSBudWxsO1xuICAgIH1cbiAgICB2YXIgY2hpbGQgPSB0aGlzLmNoaWxkVk07XG4gICAgaWYgKCFjaGlsZCB8fCB0aGlzLmtlZXBBbGl2ZSkge1xuICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgIC8vIHJlbW92ZSByZWZcbiAgICAgICAgY2hpbGQuX2luYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgY2hpbGQuX3VwZGF0ZVJlZih0cnVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gdGhlIHNvbGUgcHVycG9zZSBvZiBgZGVmZXJDbGVhbnVwYCBpcyBzbyB0aGF0IHdlIGNhblxuICAgIC8vIFwiZGVhY3RpdmF0ZVwiIHRoZSB2bSByaWdodCBub3cgYW5kIHBlcmZvcm0gRE9NIHJlbW92YWxcbiAgICAvLyBsYXRlci5cbiAgICBjaGlsZC4kZGVzdHJveShmYWxzZSwgZGVmZXIpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmUgY3VycmVudCBkZXN0cm95ZWQgY2hpbGQgYW5kIG1hbnVhbGx5IGRvXG4gICAqIHRoZSBjbGVhbnVwIGFmdGVyIHJlbW92YWwuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gICAqL1xuXG4gIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKGNoaWxkLCBjYikge1xuICAgIHZhciBrZWVwQWxpdmUgPSB0aGlzLmtlZXBBbGl2ZTtcbiAgICBpZiAoY2hpbGQpIHtcbiAgICAgIC8vIHdlIG1heSBoYXZlIGEgY29tcG9uZW50IHN3aXRjaCB3aGVuIGEgcHJldmlvdXNcbiAgICAgIC8vIGNvbXBvbmVudCBpcyBzdGlsbCBiZWluZyB0cmFuc2l0aW9uZWQgb3V0LlxuICAgICAgLy8gd2Ugd2FudCB0byB0cmlnZ2VyIG9ubHkgb25lIGxhc3Rlc3QgaW5zZXJ0aW9uIGNiXG4gICAgICAvLyB3aGVuIHRoZSBleGlzdGluZyB0cmFuc2l0aW9uIGZpbmlzaGVzLiAoIzExMTkpXG4gICAgICB0aGlzLnBlbmRpbmdSZW1vdmFscysrO1xuICAgICAgdGhpcy5wZW5kaW5nUmVtb3ZhbENiID0gY2I7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBjaGlsZC4kcmVtb3ZlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5wZW5kaW5nUmVtb3ZhbHMtLTtcbiAgICAgICAgaWYgKCFrZWVwQWxpdmUpIGNoaWxkLl9jbGVhbnVwKCk7XG4gICAgICAgIGlmICghc2VsZi5wZW5kaW5nUmVtb3ZhbHMgJiYgc2VsZi5wZW5kaW5nUmVtb3ZhbENiKSB7XG4gICAgICAgICAgc2VsZi5wZW5kaW5nUmVtb3ZhbENiKCk7XG4gICAgICAgICAgc2VsZi5wZW5kaW5nUmVtb3ZhbENiID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChjYikge1xuICAgICAgY2IoKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFjdHVhbGx5IHN3YXAgdGhlIGNvbXBvbmVudHMsIGRlcGVuZGluZyBvbiB0aGVcbiAgICogdHJhbnNpdGlvbiBtb2RlLiBEZWZhdWx0cyB0byBzaW11bHRhbmVvdXMuXG4gICAqXG4gICAqIEBwYXJhbSB7VnVlfSB0YXJnZXRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICAgKi9cblxuICB0cmFuc2l0aW9uOiBmdW5jdGlvbiB0cmFuc2l0aW9uKHRhcmdldCwgY2IpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGN1cnJlbnQgPSB0aGlzLmNoaWxkVk07XG4gICAgLy8gZm9yIGRldnRvb2wgaW5zcGVjdGlvblxuICAgIGlmIChjdXJyZW50KSBjdXJyZW50Ll9pbmFjdGl2ZSA9IHRydWU7XG4gICAgdGFyZ2V0Ll9pbmFjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuY2hpbGRWTSA9IHRhcmdldDtcbiAgICBzd2l0Y2ggKHNlbGYucGFyYW1zLnRyYW5zaXRpb25Nb2RlKSB7XG4gICAgICBjYXNlICdpbi1vdXQnOlxuICAgICAgICB0YXJnZXQuJGJlZm9yZShzZWxmLmFuY2hvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNlbGYucmVtb3ZlKGN1cnJlbnQsIGNiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb3V0LWluJzpcbiAgICAgICAgc2VsZi5yZW1vdmUoY3VycmVudCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRhcmdldC4kYmVmb3JlKHNlbGYuYW5jaG9yLCBjYik7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHNlbGYucmVtb3ZlKGN1cnJlbnQpO1xuICAgICAgICB0YXJnZXQuJGJlZm9yZShzZWxmLmFuY2hvciwgY2IpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVW5iaW5kLlxuICAgKi9cblxuICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICB0aGlzLmludmFsaWRhdGVQZW5kaW5nKCk7XG4gICAgLy8gRG8gbm90IGRlZmVyIGNsZWFudXAgd2hlbiB1bmJpbmRpbmdcbiAgICB0aGlzLnVuYnVpbGQoKTtcbiAgICAvLyBkZXN0cm95IGFsbCBrZWVwLWFsaXZlIGNhY2hlZCBpbnN0YW5jZXNcbiAgICBpZiAodGhpcy5jYWNoZSkge1xuICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuY2FjaGUpIHtcbiAgICAgICAgdGhpcy5jYWNoZVtrZXldLiRkZXN0cm95KCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNhY2hlID0gbnVsbDtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQ2FsbCBhY3RpdmF0ZSBob29rcyBpbiBvcmRlciAoYXN5bmNocm9ub3VzKVxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGhvb2tzXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gKi9cblxuZnVuY3Rpb24gY2FsbEFjdGl2YXRlSG9va3MoaG9va3MsIHZtLCBjYikge1xuICB2YXIgdG90YWwgPSBob29rcy5sZW5ndGg7XG4gIHZhciBjYWxsZWQgPSAwO1xuICBob29rc1swXS5jYWxsKHZtLCBuZXh0KTtcbiAgZnVuY3Rpb24gbmV4dCgpIHtcbiAgICBpZiAoKytjYWxsZWQgPj0gdG90YWwpIHtcbiAgICAgIGNiKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhvb2tzW2NhbGxlZF0uY2FsbCh2bSwgbmV4dCk7XG4gICAgfVxuICB9XG59XG5cbnZhciBwcm9wQmluZGluZ01vZGVzID0gY29uZmlnLl9wcm9wQmluZGluZ01vZGVzO1xudmFyIGVtcHR5ID0ge307XG5cbi8vIHJlZ2V4ZXNcbnZhciBpZGVudFJFJDEgPSAvXlskX2EtekEtWl0rW1xcdyRdKiQvO1xudmFyIHNldHRhYmxlUGF0aFJFID0gL15bQS1aYS16XyRdW1xcdyRdKihcXC5bQS1aYS16XyRdW1xcdyRdKnxcXFtbXlxcW1xcXV0rXFxdKSokLztcblxuLyoqXG4gKiBDb21waWxlIHByb3BzIG9uIGEgcm9vdCBlbGVtZW50IGFuZCByZXR1cm5cbiAqIGEgcHJvcHMgbGluayBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH0gZWxcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BPcHRpb25zXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBwcm9wc0xpbmtGblxuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGVQcm9wcyhlbCwgcHJvcE9wdGlvbnMsIHZtKSB7XG4gIHZhciBwcm9wcyA9IFtdO1xuICB2YXIgbmFtZXMgPSBPYmplY3Qua2V5cyhwcm9wT3B0aW9ucyk7XG4gIHZhciBpID0gbmFtZXMubGVuZ3RoO1xuICB2YXIgb3B0aW9ucywgbmFtZSwgYXR0ciwgdmFsdWUsIHBhdGgsIHBhcnNlZCwgcHJvcDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICBvcHRpb25zID0gcHJvcE9wdGlvbnNbbmFtZV0gfHwgZW1wdHk7XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBuYW1lID09PSAnJGRhdGEnKSB7XG4gICAgICB3YXJuKCdEbyBub3QgdXNlICRkYXRhIGFzIHByb3AuJywgdm0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gcHJvcHMgY291bGQgY29udGFpbiBkYXNoZXMsIHdoaWNoIHdpbGwgYmVcbiAgICAvLyBpbnRlcnByZXRlZCBhcyBtaW51cyBjYWxjdWxhdGlvbnMgYnkgdGhlIHBhcnNlclxuICAgIC8vIHNvIHdlIG5lZWQgdG8gY2FtZWxpemUgdGhlIHBhdGggaGVyZVxuICAgIHBhdGggPSBjYW1lbGl6ZShuYW1lKTtcbiAgICBpZiAoIWlkZW50UkUkMS50ZXN0KHBhdGgpKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ0ludmFsaWQgcHJvcCBrZXk6IFwiJyArIG5hbWUgKyAnXCIuIFByb3Aga2V5cyAnICsgJ211c3QgYmUgdmFsaWQgaWRlbnRpZmllcnMuJywgdm0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgcHJvcCA9IHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICBwYXRoOiBwYXRoLFxuICAgICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICAgIG1vZGU6IHByb3BCaW5kaW5nTW9kZXMuT05FX1dBWSxcbiAgICAgIHJhdzogbnVsbFxuICAgIH07XG5cbiAgICBhdHRyID0gaHlwaGVuYXRlKG5hbWUpO1xuICAgIC8vIGZpcnN0IGNoZWNrIGR5bmFtaWMgdmVyc2lvblxuICAgIGlmICgodmFsdWUgPSBnZXRCaW5kQXR0cihlbCwgYXR0cikpID09PSBudWxsKSB7XG4gICAgICBpZiAoKHZhbHVlID0gZ2V0QmluZEF0dHIoZWwsIGF0dHIgKyAnLnN5bmMnKSkgIT09IG51bGwpIHtcbiAgICAgICAgcHJvcC5tb2RlID0gcHJvcEJpbmRpbmdNb2Rlcy5UV09fV0FZO1xuICAgICAgfSBlbHNlIGlmICgodmFsdWUgPSBnZXRCaW5kQXR0cihlbCwgYXR0ciArICcub25jZScpKSAhPT0gbnVsbCkge1xuICAgICAgICBwcm9wLm1vZGUgPSBwcm9wQmluZGluZ01vZGVzLk9ORV9USU1FO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgIC8vIGhhcyBkeW5hbWljIGJpbmRpbmchXG4gICAgICBwcm9wLnJhdyA9IHZhbHVlO1xuICAgICAgcGFyc2VkID0gcGFyc2VEaXJlY3RpdmUodmFsdWUpO1xuICAgICAgdmFsdWUgPSBwYXJzZWQuZXhwcmVzc2lvbjtcbiAgICAgIHByb3AuZmlsdGVycyA9IHBhcnNlZC5maWx0ZXJzO1xuICAgICAgLy8gY2hlY2sgYmluZGluZyB0eXBlXG4gICAgICBpZiAoaXNMaXRlcmFsKHZhbHVlKSAmJiAhcGFyc2VkLmZpbHRlcnMpIHtcbiAgICAgICAgLy8gZm9yIGV4cHJlc3Npb25zIGNvbnRhaW5pbmcgbGl0ZXJhbCBudW1iZXJzIGFuZFxuICAgICAgICAvLyBib29sZWFucywgdGhlcmUncyBubyBuZWVkIHRvIHNldHVwIGEgcHJvcCBiaW5kaW5nLFxuICAgICAgICAvLyBzbyB3ZSBjYW4gb3B0aW1pemUgdGhlbSBhcyBhIG9uZS10aW1lIHNldC5cbiAgICAgICAgcHJvcC5vcHRpbWl6ZWRMaXRlcmFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb3AuZHluYW1pYyA9IHRydWU7XG4gICAgICAgIC8vIGNoZWNrIG5vbi1zZXR0YWJsZSBwYXRoIGZvciB0d28td2F5IGJpbmRpbmdzXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHByb3AubW9kZSA9PT0gcHJvcEJpbmRpbmdNb2Rlcy5UV09fV0FZICYmICFzZXR0YWJsZVBhdGhSRS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgIHByb3AubW9kZSA9IHByb3BCaW5kaW5nTW9kZXMuT05FX1dBWTtcbiAgICAgICAgICB3YXJuKCdDYW5ub3QgYmluZCB0d28td2F5IHByb3Agd2l0aCBub24tc2V0dGFibGUgJyArICdwYXJlbnQgcGF0aDogJyArIHZhbHVlLCB2bSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHByb3AucGFyZW50UGF0aCA9IHZhbHVlO1xuXG4gICAgICAvLyB3YXJuIHJlcXVpcmVkIHR3by13YXlcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIG9wdGlvbnMudHdvV2F5ICYmIHByb3AubW9kZSAhPT0gcHJvcEJpbmRpbmdNb2Rlcy5UV09fV0FZKSB7XG4gICAgICAgIHdhcm4oJ1Byb3AgXCInICsgbmFtZSArICdcIiBleHBlY3RzIGEgdHdvLXdheSBiaW5kaW5nIHR5cGUuJywgdm0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoKHZhbHVlID0gZ2V0QXR0cihlbCwgYXR0cikpICE9PSBudWxsKSB7XG4gICAgICAvLyBoYXMgbGl0ZXJhbCBiaW5kaW5nIVxuICAgICAgcHJvcC5yYXcgPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIC8vIGNoZWNrIHBvc3NpYmxlIGNhbWVsQ2FzZSBwcm9wIHVzYWdlXG4gICAgICB2YXIgbG93ZXJDYXNlTmFtZSA9IHBhdGgudG9Mb3dlckNhc2UoKTtcbiAgICAgIHZhbHVlID0gL1tBLVpcXC1dLy50ZXN0KG5hbWUpICYmIChlbC5nZXRBdHRyaWJ1dGUobG93ZXJDYXNlTmFtZSkgfHwgZWwuZ2V0QXR0cmlidXRlKCc6JyArIGxvd2VyQ2FzZU5hbWUpIHx8IGVsLmdldEF0dHJpYnV0ZSgndi1iaW5kOicgKyBsb3dlckNhc2VOYW1lKSB8fCBlbC5nZXRBdHRyaWJ1dGUoJzonICsgbG93ZXJDYXNlTmFtZSArICcub25jZScpIHx8IGVsLmdldEF0dHJpYnV0ZSgndi1iaW5kOicgKyBsb3dlckNhc2VOYW1lICsgJy5vbmNlJykgfHwgZWwuZ2V0QXR0cmlidXRlKCc6JyArIGxvd2VyQ2FzZU5hbWUgKyAnLnN5bmMnKSB8fCBlbC5nZXRBdHRyaWJ1dGUoJ3YtYmluZDonICsgbG93ZXJDYXNlTmFtZSArICcuc3luYycpKTtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICB3YXJuKCdQb3NzaWJsZSB1c2FnZSBlcnJvciBmb3IgcHJvcCBgJyArIGxvd2VyQ2FzZU5hbWUgKyAnYCAtICcgKyAnZGlkIHlvdSBtZWFuIGAnICsgYXR0ciArICdgPyBIVE1MIGlzIGNhc2UtaW5zZW5zaXRpdmUsIHJlbWVtYmVyIHRvIHVzZSAnICsgJ2tlYmFiLWNhc2UgZm9yIHByb3BzIGluIHRlbXBsYXRlcy4nLCB2bSk7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMucmVxdWlyZWQpIHtcbiAgICAgICAgLy8gd2FybiBtaXNzaW5nIHJlcXVpcmVkXG4gICAgICAgIHdhcm4oJ01pc3NpbmcgcmVxdWlyZWQgcHJvcDogJyArIG5hbWUsIHZtKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gcHVzaCBwcm9wXG4gICAgcHJvcHMucHVzaChwcm9wKTtcbiAgfVxuICByZXR1cm4gbWFrZVByb3BzTGlua0ZuKHByb3BzKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIGZ1bmN0aW9uIHRoYXQgYXBwbGllcyBwcm9wcyB0byBhIHZtLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gcHJvcHNMaW5rRm5cbiAqL1xuXG5mdW5jdGlvbiBtYWtlUHJvcHNMaW5rRm4ocHJvcHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHByb3BzTGlua0ZuKHZtLCBzY29wZSkge1xuICAgIC8vIHN0b3JlIHJlc29sdmVkIHByb3BzIGluZm9cbiAgICB2bS5fcHJvcHMgPSB7fTtcbiAgICB2YXIgaW5saW5lUHJvcHMgPSB2bS4kb3B0aW9ucy5wcm9wc0RhdGE7XG4gICAgdmFyIGkgPSBwcm9wcy5sZW5ndGg7XG4gICAgdmFyIHByb3AsIHBhdGgsIG9wdGlvbnMsIHZhbHVlLCByYXc7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgcHJvcCA9IHByb3BzW2ldO1xuICAgICAgcmF3ID0gcHJvcC5yYXc7XG4gICAgICBwYXRoID0gcHJvcC5wYXRoO1xuICAgICAgb3B0aW9ucyA9IHByb3Aub3B0aW9ucztcbiAgICAgIHZtLl9wcm9wc1twYXRoXSA9IHByb3A7XG4gICAgICBpZiAoaW5saW5lUHJvcHMgJiYgaGFzT3duKGlubGluZVByb3BzLCBwYXRoKSkge1xuICAgICAgICBpbml0UHJvcCh2bSwgcHJvcCwgaW5saW5lUHJvcHNbcGF0aF0pO1xuICAgICAgfWlmIChyYXcgPT09IG51bGwpIHtcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBhYnNlbnQgcHJvcFxuICAgICAgICBpbml0UHJvcCh2bSwgcHJvcCwgdW5kZWZpbmVkKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvcC5keW5hbWljKSB7XG4gICAgICAgIC8vIGR5bmFtaWMgcHJvcFxuICAgICAgICBpZiAocHJvcC5tb2RlID09PSBwcm9wQmluZGluZ01vZGVzLk9ORV9USU1FKSB7XG4gICAgICAgICAgLy8gb25lIHRpbWUgYmluZGluZ1xuICAgICAgICAgIHZhbHVlID0gKHNjb3BlIHx8IHZtLl9jb250ZXh0IHx8IHZtKS4kZ2V0KHByb3AucGFyZW50UGF0aCk7XG4gICAgICAgICAgaW5pdFByb3Aodm0sIHByb3AsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodm0uX2NvbnRleHQpIHtcbiAgICAgICAgICAgIC8vIGR5bmFtaWMgYmluZGluZ1xuICAgICAgICAgICAgdm0uX2JpbmREaXIoe1xuICAgICAgICAgICAgICBuYW1lOiAncHJvcCcsXG4gICAgICAgICAgICAgIGRlZjogcHJvcERlZixcbiAgICAgICAgICAgICAgcHJvcDogcHJvcFxuICAgICAgICAgICAgfSwgbnVsbCwgbnVsbCwgc2NvcGUpOyAvLyBlbCwgaG9zdCwgc2NvcGVcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyByb290IGluc3RhbmNlXG4gICAgICAgICAgICAgIGluaXRQcm9wKHZtLCBwcm9wLCB2bS4kZ2V0KHByb3AucGFyZW50UGF0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHByb3Aub3B0aW1pemVkTGl0ZXJhbCkge1xuICAgICAgICAvLyBvcHRpbWl6ZWQgbGl0ZXJhbCwgY2FzdCBpdCBhbmQganVzdCBzZXQgb25jZVxuICAgICAgICB2YXIgc3RyaXBwZWQgPSBzdHJpcFF1b3RlcyhyYXcpO1xuICAgICAgICB2YWx1ZSA9IHN0cmlwcGVkID09PSByYXcgPyB0b0Jvb2xlYW4odG9OdW1iZXIocmF3KSkgOiBzdHJpcHBlZDtcbiAgICAgICAgaW5pdFByb3Aodm0sIHByb3AsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHN0cmluZyBsaXRlcmFsLCBidXQgd2UgbmVlZCB0byBjYXRlciBmb3JcbiAgICAgICAgLy8gQm9vbGVhbiBwcm9wcyB3aXRoIG5vIHZhbHVlLCBvciB3aXRoIHNhbWVcbiAgICAgICAgLy8gbGl0ZXJhbCB2YWx1ZSAoZS5nLiBkaXNhYmxlZD1cImRpc2FibGVkXCIpXG4gICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlLWxvYWRlci9pc3N1ZXMvMTgyXG4gICAgICAgIHZhbHVlID0gb3B0aW9ucy50eXBlID09PSBCb29sZWFuICYmIChyYXcgPT09ICcnIHx8IHJhdyA9PT0gaHlwaGVuYXRlKHByb3AubmFtZSkpID8gdHJ1ZSA6IHJhdztcbiAgICAgICAgaW5pdFByb3Aodm0sIHByb3AsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogUHJvY2VzcyBhIHByb3Agd2l0aCBhIHJhd1ZhbHVlLCBhcHBseWluZyBuZWNlc3NhcnkgY29lcnNpb25zLFxuICogZGVmYXVsdCB2YWx1ZXMgJiBhc3NlcnRpb25zIGFuZCBjYWxsIHRoZSBnaXZlbiBjYWxsYmFjayB3aXRoXG4gKiBwcm9jZXNzZWQgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcFxuICogQHBhcmFtIHsqfSByYXdWYWx1ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqL1xuXG5mdW5jdGlvbiBwcm9jZXNzUHJvcFZhbHVlKHZtLCBwcm9wLCByYXdWYWx1ZSwgZm4pIHtcbiAgdmFyIGlzU2ltcGxlID0gcHJvcC5keW5hbWljICYmIGlzU2ltcGxlUGF0aChwcm9wLnBhcmVudFBhdGgpO1xuICB2YXIgdmFsdWUgPSByYXdWYWx1ZTtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICB2YWx1ZSA9IGdldFByb3BEZWZhdWx0VmFsdWUodm0sIHByb3ApO1xuICB9XG4gIHZhbHVlID0gY29lcmNlUHJvcChwcm9wLCB2YWx1ZSwgdm0pO1xuICB2YXIgY29lcmNlZCA9IHZhbHVlICE9PSByYXdWYWx1ZTtcbiAgaWYgKCFhc3NlcnRQcm9wKHByb3AsIHZhbHVlLCB2bSkpIHtcbiAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgfVxuICBpZiAoaXNTaW1wbGUgJiYgIWNvZXJjZWQpIHtcbiAgICB3aXRob3V0Q29udmVyc2lvbihmdW5jdGlvbiAoKSB7XG4gICAgICBmbih2YWx1ZSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgZm4odmFsdWUpO1xuICB9XG59XG5cbi8qKlxuICogU2V0IGEgcHJvcCdzIGluaXRpYWwgdmFsdWUgb24gYSB2bSBhbmQgaXRzIGRhdGEgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHtPYmplY3R9IHByb3BcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqL1xuXG5mdW5jdGlvbiBpbml0UHJvcCh2bSwgcHJvcCwgdmFsdWUpIHtcbiAgcHJvY2Vzc1Byb3BWYWx1ZSh2bSwgcHJvcCwgdmFsdWUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGRlZmluZVJlYWN0aXZlKHZtLCBwcm9wLnBhdGgsIHZhbHVlKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVXBkYXRlIGEgcHJvcCdzIHZhbHVlIG9uIGEgdm0uXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcFxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICovXG5cbmZ1bmN0aW9uIHVwZGF0ZVByb3Aodm0sIHByb3AsIHZhbHVlKSB7XG4gIHByb2Nlc3NQcm9wVmFsdWUodm0sIHByb3AsIHZhbHVlLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2bVtwcm9wLnBhdGhdID0gdmFsdWU7XG4gIH0pO1xufVxuXG4vKipcbiAqIEdldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBhIHByb3AuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcFxuICogQHJldHVybiB7Kn1cbiAqL1xuXG5mdW5jdGlvbiBnZXRQcm9wRGVmYXVsdFZhbHVlKHZtLCBwcm9wKSB7XG4gIC8vIG5vIGRlZmF1bHQsIHJldHVybiB1bmRlZmluZWRcbiAgdmFyIG9wdGlvbnMgPSBwcm9wLm9wdGlvbnM7XG4gIGlmICghaGFzT3duKG9wdGlvbnMsICdkZWZhdWx0JykpIHtcbiAgICAvLyBhYnNlbnQgYm9vbGVhbiB2YWx1ZSBkZWZhdWx0cyB0byBmYWxzZVxuICAgIHJldHVybiBvcHRpb25zLnR5cGUgPT09IEJvb2xlYW4gPyBmYWxzZSA6IHVuZGVmaW5lZDtcbiAgfVxuICB2YXIgZGVmID0gb3B0aW9uc1snZGVmYXVsdCddO1xuICAvLyB3YXJuIGFnYWluc3Qgbm9uLWZhY3RvcnkgZGVmYXVsdHMgZm9yIE9iamVjdCAmIEFycmF5XG4gIGlmIChpc09iamVjdChkZWYpKSB7XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdJbnZhbGlkIGRlZmF1bHQgdmFsdWUgZm9yIHByb3AgXCInICsgcHJvcC5uYW1lICsgJ1wiOiAnICsgJ1Byb3BzIHdpdGggdHlwZSBPYmplY3QvQXJyYXkgbXVzdCB1c2UgYSBmYWN0b3J5IGZ1bmN0aW9uICcgKyAndG8gcmV0dXJuIHRoZSBkZWZhdWx0IHZhbHVlLicsIHZtKTtcbiAgfVxuICAvLyBjYWxsIGZhY3RvcnkgZnVuY3Rpb24gZm9yIG5vbi1GdW5jdGlvbiB0eXBlc1xuICByZXR1cm4gdHlwZW9mIGRlZiA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLnR5cGUgIT09IEZ1bmN0aW9uID8gZGVmLmNhbGwodm0pIDogZGVmO1xufVxuXG4vKipcbiAqIEFzc2VydCB3aGV0aGVyIGEgcHJvcCBpcyB2YWxpZC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcFxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHBhcmFtIHtWdWV9IHZtXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0UHJvcChwcm9wLCB2YWx1ZSwgdm0pIHtcbiAgaWYgKCFwcm9wLm9wdGlvbnMucmVxdWlyZWQgJiYgKCAvLyBub24tcmVxdWlyZWRcbiAgcHJvcC5yYXcgPT09IG51bGwgfHwgLy8gYWJzY2VudFxuICB2YWx1ZSA9PSBudWxsKSAvLyBudWxsIG9yIHVuZGVmaW5lZFxuICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgdmFyIG9wdGlvbnMgPSBwcm9wLm9wdGlvbnM7XG4gIHZhciB0eXBlID0gb3B0aW9ucy50eXBlO1xuICB2YXIgdmFsaWQgPSAhdHlwZTtcbiAgdmFyIGV4cGVjdGVkVHlwZXMgPSBbXTtcbiAgaWYgKHR5cGUpIHtcbiAgICBpZiAoIWlzQXJyYXkodHlwZSkpIHtcbiAgICAgIHR5cGUgPSBbdHlwZV07XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGggJiYgIXZhbGlkOyBpKyspIHtcbiAgICAgIHZhciBhc3NlcnRlZFR5cGUgPSBhc3NlcnRUeXBlKHZhbHVlLCB0eXBlW2ldKTtcbiAgICAgIGV4cGVjdGVkVHlwZXMucHVzaChhc3NlcnRlZFR5cGUuZXhwZWN0ZWRUeXBlKTtcbiAgICAgIHZhbGlkID0gYXNzZXJ0ZWRUeXBlLnZhbGlkO1xuICAgIH1cbiAgfVxuICBpZiAoIXZhbGlkKSB7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIHdhcm4oJ0ludmFsaWQgcHJvcDogdHlwZSBjaGVjayBmYWlsZWQgZm9yIHByb3AgXCInICsgcHJvcC5uYW1lICsgJ1wiLicgKyAnIEV4cGVjdGVkICcgKyBleHBlY3RlZFR5cGVzLm1hcChmb3JtYXRUeXBlKS5qb2luKCcsICcpICsgJywgZ290ICcgKyBmb3JtYXRWYWx1ZSh2YWx1ZSkgKyAnLicsIHZtKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB2YWxpZGF0b3IgPSBvcHRpb25zLnZhbGlkYXRvcjtcbiAgaWYgKHZhbGlkYXRvcikge1xuICAgIGlmICghdmFsaWRhdG9yKHZhbHVlKSkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdJbnZhbGlkIHByb3A6IGN1c3RvbSB2YWxpZGF0b3IgY2hlY2sgZmFpbGVkIGZvciBwcm9wIFwiJyArIHByb3AubmFtZSArICdcIi4nLCB2bSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEZvcmNlIHBhcnNpbmcgdmFsdWUgd2l0aCBjb2VyY2Ugb3B0aW9uLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHsqfVxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZVByb3AocHJvcCwgdmFsdWUsIHZtKSB7XG4gIHZhciBjb2VyY2UgPSBwcm9wLm9wdGlvbnMuY29lcmNlO1xuICBpZiAoIWNvZXJjZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAodHlwZW9mIGNvZXJjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBjb2VyY2UodmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignSW52YWxpZCBjb2VyY2UgZm9yIHByb3AgXCInICsgcHJvcC5uYW1lICsgJ1wiOiBleHBlY3RlZCBmdW5jdGlvbiwgZ290ICcgKyB0eXBlb2YgY29lcmNlICsgJy4nLCB2bSk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSB0eXBlIG9mIGEgdmFsdWVcbiAqXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0eXBlXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0VHlwZSh2YWx1ZSwgdHlwZSkge1xuICB2YXIgdmFsaWQ7XG4gIHZhciBleHBlY3RlZFR5cGU7XG4gIGlmICh0eXBlID09PSBTdHJpbmcpIHtcbiAgICBleHBlY3RlZFR5cGUgPSAnc3RyaW5nJztcbiAgICB2YWxpZCA9IHR5cGVvZiB2YWx1ZSA9PT0gZXhwZWN0ZWRUeXBlO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IE51bWJlcikge1xuICAgIGV4cGVjdGVkVHlwZSA9ICdudW1iZXInO1xuICAgIHZhbGlkID0gdHlwZW9mIHZhbHVlID09PSBleHBlY3RlZFR5cGU7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gQm9vbGVhbikge1xuICAgIGV4cGVjdGVkVHlwZSA9ICdib29sZWFuJztcbiAgICB2YWxpZCA9IHR5cGVvZiB2YWx1ZSA9PT0gZXhwZWN0ZWRUeXBlO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IEZ1bmN0aW9uKSB7XG4gICAgZXhwZWN0ZWRUeXBlID0gJ2Z1bmN0aW9uJztcbiAgICB2YWxpZCA9IHR5cGVvZiB2YWx1ZSA9PT0gZXhwZWN0ZWRUeXBlO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IE9iamVjdCkge1xuICAgIGV4cGVjdGVkVHlwZSA9ICdvYmplY3QnO1xuICAgIHZhbGlkID0gaXNQbGFpbk9iamVjdCh2YWx1ZSk7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gQXJyYXkpIHtcbiAgICBleHBlY3RlZFR5cGUgPSAnYXJyYXknO1xuICAgIHZhbGlkID0gaXNBcnJheSh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFsaWQgPSB2YWx1ZSBpbnN0YW5jZW9mIHR5cGU7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdmFsaWQsXG4gICAgZXhwZWN0ZWRUeXBlOiBleHBlY3RlZFR5cGVcbiAgfTtcbn1cblxuLyoqXG4gKiBGb3JtYXQgdHlwZSBmb3Igb3V0cHV0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBmb3JtYXRUeXBlKHR5cGUpIHtcbiAgcmV0dXJuIHR5cGUgPyB0eXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHlwZS5zbGljZSgxKSA6ICdjdXN0b20gdHlwZSc7XG59XG5cbi8qKlxuICogRm9ybWF0IHZhbHVlXG4gKlxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKHZhbCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkuc2xpY2UoOCwgLTEpO1xufVxuXG52YXIgYmluZGluZ01vZGVzID0gY29uZmlnLl9wcm9wQmluZGluZ01vZGVzO1xuXG52YXIgcHJvcERlZiA9IHtcblxuICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgIHZhciBjaGlsZCA9IHRoaXMudm07XG4gICAgdmFyIHBhcmVudCA9IGNoaWxkLl9jb250ZXh0O1xuICAgIC8vIHBhc3NlZCBpbiBmcm9tIGNvbXBpbGVyIGRpcmVjdGx5XG4gICAgdmFyIHByb3AgPSB0aGlzLmRlc2NyaXB0b3IucHJvcDtcbiAgICB2YXIgY2hpbGRLZXkgPSBwcm9wLnBhdGg7XG4gICAgdmFyIHBhcmVudEtleSA9IHByb3AucGFyZW50UGF0aDtcbiAgICB2YXIgdHdvV2F5ID0gcHJvcC5tb2RlID09PSBiaW5kaW5nTW9kZXMuVFdPX1dBWTtcblxuICAgIHZhciBwYXJlbnRXYXRjaGVyID0gdGhpcy5wYXJlbnRXYXRjaGVyID0gbmV3IFdhdGNoZXIocGFyZW50LCBwYXJlbnRLZXksIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHVwZGF0ZVByb3AoY2hpbGQsIHByb3AsIHZhbCk7XG4gICAgfSwge1xuICAgICAgdHdvV2F5OiB0d29XYXksXG4gICAgICBmaWx0ZXJzOiBwcm9wLmZpbHRlcnMsXG4gICAgICAvLyBpbXBvcnRhbnQ6IHByb3BzIG5lZWQgdG8gYmUgb2JzZXJ2ZWQgb24gdGhlXG4gICAgICAvLyB2LWZvciBzY29wZSBpZiBwcmVzZW50XG4gICAgICBzY29wZTogdGhpcy5fc2NvcGVcbiAgICB9KTtcblxuICAgIC8vIHNldCB0aGUgY2hpbGQgaW5pdGlhbCB2YWx1ZS5cbiAgICBpbml0UHJvcChjaGlsZCwgcHJvcCwgcGFyZW50V2F0Y2hlci52YWx1ZSk7XG5cbiAgICAvLyBzZXR1cCB0d28td2F5IGJpbmRpbmdcbiAgICBpZiAodHdvV2F5KSB7XG4gICAgICAvLyBpbXBvcnRhbnQ6IGRlZmVyIHRoZSBjaGlsZCB3YXRjaGVyIGNyZWF0aW9uIHVudGlsXG4gICAgICAvLyB0aGUgY3JlYXRlZCBob29rIChhZnRlciBkYXRhIG9ic2VydmF0aW9uKVxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgY2hpbGQuJG9uY2UoJ3ByZS1ob29rOmNyZWF0ZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuY2hpbGRXYXRjaGVyID0gbmV3IFdhdGNoZXIoY2hpbGQsIGNoaWxkS2V5LCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgcGFyZW50V2F0Y2hlci5zZXQodmFsKTtcbiAgICAgICAgfSwge1xuICAgICAgICAgIC8vIGVuc3VyZSBzeW5jIHVwd2FyZCBiZWZvcmUgcGFyZW50IHN5bmMgZG93bi5cbiAgICAgICAgICAvLyB0aGlzIGlzIG5lY2Vzc2FyeSBpbiBjYXNlcyBlLmcuIHRoZSBjaGlsZFxuICAgICAgICAgIC8vIG11dGF0ZXMgYSBwcm9wIGFycmF5LCB0aGVuIHJlcGxhY2VzIGl0LiAoIzE2ODMpXG4gICAgICAgICAgc3luYzogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICB0aGlzLnBhcmVudFdhdGNoZXIudGVhcmRvd24oKTtcbiAgICBpZiAodGhpcy5jaGlsZFdhdGNoZXIpIHtcbiAgICAgIHRoaXMuY2hpbGRXYXRjaGVyLnRlYXJkb3duKCk7XG4gICAgfVxuICB9XG59O1xuXG52YXIgcXVldWUkMSA9IFtdO1xudmFyIHF1ZXVlZCA9IGZhbHNlO1xuXG4vKipcbiAqIFB1c2ggYSBqb2IgaW50byB0aGUgcXVldWUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gam9iXG4gKi9cblxuZnVuY3Rpb24gcHVzaEpvYihqb2IpIHtcbiAgcXVldWUkMS5wdXNoKGpvYik7XG4gIGlmICghcXVldWVkKSB7XG4gICAgcXVldWVkID0gdHJ1ZTtcbiAgICBuZXh0VGljayhmbHVzaCk7XG4gIH1cbn1cblxuLyoqXG4gKiBGbHVzaCB0aGUgcXVldWUsIGFuZCBkbyBvbmUgZm9yY2VkIHJlZmxvdyBiZWZvcmVcbiAqIHRyaWdnZXJpbmcgdHJhbnNpdGlvbnMuXG4gKi9cblxuZnVuY3Rpb24gZmx1c2goKSB7XG4gIC8vIEZvcmNlIGxheW91dFxuICB2YXIgZiA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcXVldWUkMS5sZW5ndGg7IGkrKykge1xuICAgIHF1ZXVlJDFbaV0oKTtcbiAgfVxuICBxdWV1ZSQxID0gW107XG4gIHF1ZXVlZCA9IGZhbHNlO1xuICAvLyBkdW1teSByZXR1cm4sIHNvIGpzIGxpbnRlcnMgZG9uJ3QgY29tcGxhaW4gYWJvdXRcbiAgLy8gdW51c2VkIHZhcmlhYmxlIGZcbiAgcmV0dXJuIGY7XG59XG5cbnZhciBUWVBFX1RSQU5TSVRJT04gPSAndHJhbnNpdGlvbic7XG52YXIgVFlQRV9BTklNQVRJT04gPSAnYW5pbWF0aW9uJztcbnZhciB0cmFuc0R1cmF0aW9uUHJvcCA9IHRyYW5zaXRpb25Qcm9wICsgJ0R1cmF0aW9uJztcbnZhciBhbmltRHVyYXRpb25Qcm9wID0gYW5pbWF0aW9uUHJvcCArICdEdXJhdGlvbic7XG5cbi8qKlxuICogSWYgYSBqdXN0LWVudGVyZWQgZWxlbWVudCBpcyBhcHBsaWVkIHRoZVxuICogbGVhdmUgY2xhc3Mgd2hpbGUgaXRzIGVudGVyIHRyYW5zaXRpb24gaGFzbid0IHN0YXJ0ZWQgeWV0LFxuICogYW5kIHRoZSB0cmFuc2l0aW9uZWQgcHJvcGVydHkgaGFzIHRoZSBzYW1lIHZhbHVlIGZvciBib3RoXG4gKiBlbnRlci9sZWF2ZSwgdGhlbiB0aGUgbGVhdmUgdHJhbnNpdGlvbiB3aWxsIGJlIHNraXBwZWQgYW5kXG4gKiB0aGUgdHJhbnNpdGlvbmVuZCBldmVudCBuZXZlciBmaXJlcy4gVGhpcyBmdW5jdGlvbiBlbnN1cmVzXG4gKiBpdHMgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIGFmdGVyIGEgdHJhbnNpdGlvbiBoYXMgc3RhcnRlZFxuICogYnkgd2FpdGluZyBmb3IgZG91YmxlIHJhZi5cbiAqXG4gKiBJdCBmYWxscyBiYWNrIHRvIHNldFRpbWVvdXQgb24gZGV2aWNlcyB0aGF0IHN1cHBvcnQgQ1NTXG4gKiB0cmFuc2l0aW9ucyBidXQgbm90IHJhZiAoZS5nLiBBbmRyb2lkIDQuMiBicm93c2VyKSAtIHNpbmNlXG4gKiB0aGVzZSBlbnZpcm9ubWVudHMgYXJlIHVzdWFsbHkgc2xvdywgd2UgYXJlIGdpdmluZyBpdCBhXG4gKiByZWxhdGl2ZWx5IGxhcmdlIHRpbWVvdXQuXG4gKi9cblxudmFyIHJhZiA9IGluQnJvd3NlciAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xudmFyIHdhaXRGb3JUcmFuc2l0aW9uU3RhcnQgPSByYWZcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4/IGZ1bmN0aW9uIChmbikge1xuICByYWYoZnVuY3Rpb24gKCkge1xuICAgIHJhZihmbik7XG4gIH0pO1xufSA6IGZ1bmN0aW9uIChmbikge1xuICBzZXRUaW1lb3V0KGZuLCA1MCk7XG59O1xuXG4vKipcbiAqIEEgVHJhbnNpdGlvbiBvYmplY3QgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIHN0YXRlIGFuZCBsb2dpY1xuICogb2YgdGhlIHRyYW5zaXRpb24uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IGlkXG4gKiBAcGFyYW0ge09iamVjdH0gaG9va3NcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICovXG5mdW5jdGlvbiBUcmFuc2l0aW9uKGVsLCBpZCwgaG9va3MsIHZtKSB7XG4gIHRoaXMuaWQgPSBpZDtcbiAgdGhpcy5lbCA9IGVsO1xuICB0aGlzLmVudGVyQ2xhc3MgPSBob29rcyAmJiBob29rcy5lbnRlckNsYXNzIHx8IGlkICsgJy1lbnRlcic7XG4gIHRoaXMubGVhdmVDbGFzcyA9IGhvb2tzICYmIGhvb2tzLmxlYXZlQ2xhc3MgfHwgaWQgKyAnLWxlYXZlJztcbiAgdGhpcy5ob29rcyA9IGhvb2tzO1xuICB0aGlzLnZtID0gdm07XG4gIC8vIGFzeW5jIHN0YXRlXG4gIHRoaXMucGVuZGluZ0Nzc0V2ZW50ID0gdGhpcy5wZW5kaW5nQ3NzQ2IgPSB0aGlzLmNhbmNlbCA9IHRoaXMucGVuZGluZ0pzQ2IgPSB0aGlzLm9wID0gdGhpcy5jYiA9IG51bGw7XG4gIHRoaXMuanVzdEVudGVyZWQgPSBmYWxzZTtcbiAgdGhpcy5lbnRlcmVkID0gdGhpcy5sZWZ0ID0gZmFsc2U7XG4gIHRoaXMudHlwZUNhY2hlID0ge307XG4gIC8vIGNoZWNrIGNzcyB0cmFuc2l0aW9uIHR5cGVcbiAgdGhpcy50eXBlID0gaG9va3MgJiYgaG9va3MudHlwZTtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgaWYgKHRoaXMudHlwZSAmJiB0aGlzLnR5cGUgIT09IFRZUEVfVFJBTlNJVElPTiAmJiB0aGlzLnR5cGUgIT09IFRZUEVfQU5JTUFUSU9OKSB7XG4gICAgICB3YXJuKCdpbnZhbGlkIENTUyB0cmFuc2l0aW9uIHR5cGUgZm9yIHRyYW5zaXRpb249XCInICsgdGhpcy5pZCArICdcIjogJyArIHRoaXMudHlwZSwgdm0pO1xuICAgIH1cbiAgfVxuICAvLyBiaW5kXG4gIHZhciBzZWxmID0gdGhpcztbJ2VudGVyTmV4dFRpY2snLCAnZW50ZXJEb25lJywgJ2xlYXZlTmV4dFRpY2snLCAnbGVhdmVEb25lJ10uZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgIHNlbGZbbV0gPSBiaW5kKHNlbGZbbV0sIHNlbGYpO1xuICB9KTtcbn1cblxudmFyIHAkMSA9IFRyYW5zaXRpb24ucHJvdG90eXBlO1xuXG4vKipcbiAqIFN0YXJ0IGFuIGVudGVyaW5nIHRyYW5zaXRpb24uXG4gKlxuICogMS4gZW50ZXIgdHJhbnNpdGlvbiB0cmlnZ2VyZWRcbiAqIDIuIGNhbGwgYmVmb3JlRW50ZXIgaG9va1xuICogMy4gYWRkIGVudGVyIGNsYXNzXG4gKiA0LiBpbnNlcnQvc2hvdyBlbGVtZW50XG4gKiA1LiBjYWxsIGVudGVyIGhvb2sgKHdpdGggcG9zc2libGUgZXhwbGljaXQganMgY2FsbGJhY2spXG4gKiA2LiByZWZsb3dcbiAqIDcuIGJhc2VkIG9uIHRyYW5zaXRpb24gdHlwZTpcbiAqICAgIC0gdHJhbnNpdGlvbjpcbiAqICAgICAgICByZW1vdmUgY2xhc3Mgbm93LCB3YWl0IGZvciB0cmFuc2l0aW9uZW5kLFxuICogICAgICAgIHRoZW4gZG9uZSBpZiB0aGVyZSdzIG5vIGV4cGxpY2l0IGpzIGNhbGxiYWNrLlxuICogICAgLSBhbmltYXRpb246XG4gKiAgICAgICAgd2FpdCBmb3IgYW5pbWF0aW9uZW5kLCByZW1vdmUgY2xhc3MsXG4gKiAgICAgICAgdGhlbiBkb25lIGlmIHRoZXJlJ3Mgbm8gZXhwbGljaXQganMgY2FsbGJhY2suXG4gKiAgICAtIG5vIGNzcyB0cmFuc2l0aW9uOlxuICogICAgICAgIGRvbmUgbm93IGlmIHRoZXJlJ3Mgbm8gZXhwbGljaXQganMgY2FsbGJhY2suXG4gKiA4LiB3YWl0IGZvciBlaXRoZXIgZG9uZSBvciBqcyBjYWxsYmFjaywgdGhlbiBjYWxsXG4gKiAgICBhZnRlckVudGVyIGhvb2suXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3AgLSBpbnNlcnQvc2hvdyB0aGUgZWxlbWVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICovXG5cbnAkMS5lbnRlciA9IGZ1bmN0aW9uIChvcCwgY2IpIHtcbiAgdGhpcy5jYW5jZWxQZW5kaW5nKCk7XG4gIHRoaXMuY2FsbEhvb2soJ2JlZm9yZUVudGVyJyk7XG4gIHRoaXMuY2IgPSBjYjtcbiAgYWRkQ2xhc3ModGhpcy5lbCwgdGhpcy5lbnRlckNsYXNzKTtcbiAgb3AoKTtcbiAgdGhpcy5lbnRlcmVkID0gZmFsc2U7XG4gIHRoaXMuY2FsbEhvb2tXaXRoQ2IoJ2VudGVyJyk7XG4gIGlmICh0aGlzLmVudGVyZWQpIHtcbiAgICByZXR1cm47IC8vIHVzZXIgY2FsbGVkIGRvbmUgc3luY2hyb25vdXNseS5cbiAgfVxuICB0aGlzLmNhbmNlbCA9IHRoaXMuaG9va3MgJiYgdGhpcy5ob29rcy5lbnRlckNhbmNlbGxlZDtcbiAgcHVzaEpvYih0aGlzLmVudGVyTmV4dFRpY2spO1xufTtcblxuLyoqXG4gKiBUaGUgXCJuZXh0VGlja1wiIHBoYXNlIG9mIGFuIGVudGVyaW5nIHRyYW5zaXRpb24sIHdoaWNoIGlzXG4gKiB0byBiZSBwdXNoZWQgaW50byBhIHF1ZXVlIGFuZCBleGVjdXRlZCBhZnRlciBhIHJlZmxvdyBzb1xuICogdGhhdCByZW1vdmluZyB0aGUgY2xhc3MgY2FuIHRyaWdnZXIgYSBDU1MgdHJhbnNpdGlvbi5cbiAqL1xuXG5wJDEuZW50ZXJOZXh0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICAvLyBwcmV2ZW50IHRyYW5zaXRpb24gc2tpcHBpbmdcbiAgdGhpcy5qdXN0RW50ZXJlZCA9IHRydWU7XG4gIHdhaXRGb3JUcmFuc2l0aW9uU3RhcnQoZnVuY3Rpb24gKCkge1xuICAgIF90aGlzLmp1c3RFbnRlcmVkID0gZmFsc2U7XG4gIH0pO1xuICB2YXIgZW50ZXJEb25lID0gdGhpcy5lbnRlckRvbmU7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRDc3NUcmFuc2l0aW9uVHlwZSh0aGlzLmVudGVyQ2xhc3MpO1xuICBpZiAoIXRoaXMucGVuZGluZ0pzQ2IpIHtcbiAgICBpZiAodHlwZSA9PT0gVFlQRV9UUkFOU0lUSU9OKSB7XG4gICAgICAvLyB0cmlnZ2VyIHRyYW5zaXRpb24gYnkgcmVtb3ZpbmcgZW50ZXIgY2xhc3Mgbm93XG4gICAgICByZW1vdmVDbGFzcyh0aGlzLmVsLCB0aGlzLmVudGVyQ2xhc3MpO1xuICAgICAgdGhpcy5zZXR1cENzc0NiKHRyYW5zaXRpb25FbmRFdmVudCwgZW50ZXJEb25lKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFRZUEVfQU5JTUFUSU9OKSB7XG4gICAgICB0aGlzLnNldHVwQ3NzQ2IoYW5pbWF0aW9uRW5kRXZlbnQsIGVudGVyRG9uZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudGVyRG9uZSgpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSBUWVBFX1RSQU5TSVRJT04pIHtcbiAgICByZW1vdmVDbGFzcyh0aGlzLmVsLCB0aGlzLmVudGVyQ2xhc3MpO1xuICB9XG59O1xuXG4vKipcbiAqIFRoZSBcImNsZWFudXBcIiBwaGFzZSBvZiBhbiBlbnRlcmluZyB0cmFuc2l0aW9uLlxuICovXG5cbnAkMS5lbnRlckRvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZW50ZXJlZCA9IHRydWU7XG4gIHRoaXMuY2FuY2VsID0gdGhpcy5wZW5kaW5nSnNDYiA9IG51bGw7XG4gIHJlbW92ZUNsYXNzKHRoaXMuZWwsIHRoaXMuZW50ZXJDbGFzcyk7XG4gIHRoaXMuY2FsbEhvb2soJ2FmdGVyRW50ZXInKTtcbiAgaWYgKHRoaXMuY2IpIHRoaXMuY2IoKTtcbn07XG5cbi8qKlxuICogU3RhcnQgYSBsZWF2aW5nIHRyYW5zaXRpb24uXG4gKlxuICogMS4gbGVhdmUgdHJhbnNpdGlvbiB0cmlnZ2VyZWQuXG4gKiAyLiBjYWxsIGJlZm9yZUxlYXZlIGhvb2tcbiAqIDMuIGFkZCBsZWF2ZSBjbGFzcyAodHJpZ2dlciBjc3MgdHJhbnNpdGlvbilcbiAqIDQuIGNhbGwgbGVhdmUgaG9vayAod2l0aCBwb3NzaWJsZSBleHBsaWNpdCBqcyBjYWxsYmFjaylcbiAqIDUuIHJlZmxvdyBpZiBubyBleHBsaWNpdCBqcyBjYWxsYmFjayBpcyBwcm92aWRlZFxuICogNi4gYmFzZWQgb24gdHJhbnNpdGlvbiB0eXBlOlxuICogICAgLSB0cmFuc2l0aW9uIG9yIGFuaW1hdGlvbjpcbiAqICAgICAgICB3YWl0IGZvciBlbmQgZXZlbnQsIHJlbW92ZSBjbGFzcywgdGhlbiBkb25lIGlmXG4gKiAgICAgICAgdGhlcmUncyBubyBleHBsaWNpdCBqcyBjYWxsYmFjay5cbiAqICAgIC0gbm8gY3NzIHRyYW5zaXRpb246XG4gKiAgICAgICAgZG9uZSBpZiB0aGVyZSdzIG5vIGV4cGxpY2l0IGpzIGNhbGxiYWNrLlxuICogNy4gd2FpdCBmb3IgZWl0aGVyIGRvbmUgb3IganMgY2FsbGJhY2ssIHRoZW4gY2FsbFxuICogICAgYWZ0ZXJMZWF2ZSBob29rLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9wIC0gcmVtb3ZlL2hpZGUgdGhlIGVsZW1lbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAqL1xuXG5wJDEubGVhdmUgPSBmdW5jdGlvbiAob3AsIGNiKSB7XG4gIHRoaXMuY2FuY2VsUGVuZGluZygpO1xuICB0aGlzLmNhbGxIb29rKCdiZWZvcmVMZWF2ZScpO1xuICB0aGlzLm9wID0gb3A7XG4gIHRoaXMuY2IgPSBjYjtcbiAgYWRkQ2xhc3ModGhpcy5lbCwgdGhpcy5sZWF2ZUNsYXNzKTtcbiAgdGhpcy5sZWZ0ID0gZmFsc2U7XG4gIHRoaXMuY2FsbEhvb2tXaXRoQ2IoJ2xlYXZlJyk7XG4gIGlmICh0aGlzLmxlZnQpIHtcbiAgICByZXR1cm47IC8vIHVzZXIgY2FsbGVkIGRvbmUgc3luY2hyb25vdXNseS5cbiAgfVxuICB0aGlzLmNhbmNlbCA9IHRoaXMuaG9va3MgJiYgdGhpcy5ob29rcy5sZWF2ZUNhbmNlbGxlZDtcbiAgLy8gb25seSBuZWVkIHRvIGhhbmRsZSBsZWF2ZURvbmUgaWZcbiAgLy8gMS4gdGhlIHRyYW5zaXRpb24gaXMgYWxyZWFkeSBkb25lIChzeW5jaHJvbm91c2x5IGNhbGxlZFxuICAvLyAgICBieSB0aGUgdXNlciwgd2hpY2ggY2F1c2VzIHRoaXMub3Agc2V0IHRvIG51bGwpXG4gIC8vIDIuIHRoZXJlJ3Mgbm8gZXhwbGljaXQganMgY2FsbGJhY2tcbiAgaWYgKHRoaXMub3AgJiYgIXRoaXMucGVuZGluZ0pzQ2IpIHtcbiAgICAvLyBpZiBhIENTUyB0cmFuc2l0aW9uIGxlYXZlcyBpbW1lZGlhdGVseSBhZnRlciBlbnRlcixcbiAgICAvLyB0aGUgdHJhbnNpdGlvbmVuZCBldmVudCBuZXZlciBmaXJlcy4gdGhlcmVmb3JlIHdlXG4gICAgLy8gZGV0ZWN0IHN1Y2ggY2FzZXMgYW5kIGVuZCB0aGUgbGVhdmUgaW1tZWRpYXRlbHkuXG4gICAgaWYgKHRoaXMuanVzdEVudGVyZWQpIHtcbiAgICAgIHRoaXMubGVhdmVEb25lKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHB1c2hKb2IodGhpcy5sZWF2ZU5leHRUaWNrKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogVGhlIFwibmV4dFRpY2tcIiBwaGFzZSBvZiBhIGxlYXZpbmcgdHJhbnNpdGlvbi5cbiAqL1xuXG5wJDEubGVhdmVOZXh0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHR5cGUgPSB0aGlzLmdldENzc1RyYW5zaXRpb25UeXBlKHRoaXMubGVhdmVDbGFzcyk7XG4gIGlmICh0eXBlKSB7XG4gICAgdmFyIGV2ZW50ID0gdHlwZSA9PT0gVFlQRV9UUkFOU0lUSU9OID8gdHJhbnNpdGlvbkVuZEV2ZW50IDogYW5pbWF0aW9uRW5kRXZlbnQ7XG4gICAgdGhpcy5zZXR1cENzc0NiKGV2ZW50LCB0aGlzLmxlYXZlRG9uZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5sZWF2ZURvbmUoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBUaGUgXCJjbGVhbnVwXCIgcGhhc2Ugb2YgYSBsZWF2aW5nIHRyYW5zaXRpb24uXG4gKi9cblxucCQxLmxlYXZlRG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5sZWZ0ID0gdHJ1ZTtcbiAgdGhpcy5jYW5jZWwgPSB0aGlzLnBlbmRpbmdKc0NiID0gbnVsbDtcbiAgdGhpcy5vcCgpO1xuICByZW1vdmVDbGFzcyh0aGlzLmVsLCB0aGlzLmxlYXZlQ2xhc3MpO1xuICB0aGlzLmNhbGxIb29rKCdhZnRlckxlYXZlJyk7XG4gIGlmICh0aGlzLmNiKSB0aGlzLmNiKCk7XG4gIHRoaXMub3AgPSBudWxsO1xufTtcblxuLyoqXG4gKiBDYW5jZWwgYW55IHBlbmRpbmcgY2FsbGJhY2tzIGZyb20gYSBwcmV2aW91c2x5IHJ1bm5pbmdcbiAqIGJ1dCBub3QgZmluaXNoZWQgdHJhbnNpdGlvbi5cbiAqL1xuXG5wJDEuY2FuY2VsUGVuZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5vcCA9IHRoaXMuY2IgPSBudWxsO1xuICB2YXIgaGFzUGVuZGluZyA9IGZhbHNlO1xuICBpZiAodGhpcy5wZW5kaW5nQ3NzQ2IpIHtcbiAgICBoYXNQZW5kaW5nID0gdHJ1ZTtcbiAgICBvZmYodGhpcy5lbCwgdGhpcy5wZW5kaW5nQ3NzRXZlbnQsIHRoaXMucGVuZGluZ0Nzc0NiKTtcbiAgICB0aGlzLnBlbmRpbmdDc3NFdmVudCA9IHRoaXMucGVuZGluZ0Nzc0NiID0gbnVsbDtcbiAgfVxuICBpZiAodGhpcy5wZW5kaW5nSnNDYikge1xuICAgIGhhc1BlbmRpbmcgPSB0cnVlO1xuICAgIHRoaXMucGVuZGluZ0pzQ2IuY2FuY2VsKCk7XG4gICAgdGhpcy5wZW5kaW5nSnNDYiA9IG51bGw7XG4gIH1cbiAgaWYgKGhhc1BlbmRpbmcpIHtcbiAgICByZW1vdmVDbGFzcyh0aGlzLmVsLCB0aGlzLmVudGVyQ2xhc3MpO1xuICAgIHJlbW92ZUNsYXNzKHRoaXMuZWwsIHRoaXMubGVhdmVDbGFzcyk7XG4gIH1cbiAgaWYgKHRoaXMuY2FuY2VsKSB7XG4gICAgdGhpcy5jYW5jZWwuY2FsbCh0aGlzLnZtLCB0aGlzLmVsKTtcbiAgICB0aGlzLmNhbmNlbCA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogQ2FsbCBhIHVzZXItcHJvdmlkZWQgc3luY2hyb25vdXMgaG9vayBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICovXG5cbnAkMS5jYWxsSG9vayA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIGlmICh0aGlzLmhvb2tzICYmIHRoaXMuaG9va3NbdHlwZV0pIHtcbiAgICB0aGlzLmhvb2tzW3R5cGVdLmNhbGwodGhpcy52bSwgdGhpcy5lbCk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2FsbCBhIHVzZXItcHJvdmlkZWQsIHBvdGVudGlhbGx5LWFzeW5jIGhvb2sgZnVuY3Rpb24uXG4gKiBXZSBjaGVjayBmb3IgdGhlIGxlbmd0aCBvZiBhcmd1bWVudHMgdG8gc2VlIGlmIHRoZSBob29rXG4gKiBleHBlY3RzIGEgYGRvbmVgIGNhbGxiYWNrLiBJZiB0cnVlLCB0aGUgdHJhbnNpdGlvbidzIGVuZFxuICogd2lsbCBiZSBkZXRlcm1pbmVkIGJ5IHdoZW4gdGhlIHVzZXIgY2FsbHMgdGhhdCBjYWxsYmFjaztcbiAqIG90aGVyd2lzZSwgdGhlIGVuZCBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBDU1MgdHJhbnNpdGlvbiBvclxuICogYW5pbWF0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKi9cblxucCQxLmNhbGxIb29rV2l0aENiID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgdmFyIGhvb2sgPSB0aGlzLmhvb2tzICYmIHRoaXMuaG9va3NbdHlwZV07XG4gIGlmIChob29rKSB7XG4gICAgaWYgKGhvb2subGVuZ3RoID4gMSkge1xuICAgICAgdGhpcy5wZW5kaW5nSnNDYiA9IGNhbmNlbGxhYmxlKHRoaXNbdHlwZSArICdEb25lJ10pO1xuICAgIH1cbiAgICBob29rLmNhbGwodGhpcy52bSwgdGhpcy5lbCwgdGhpcy5wZW5kaW5nSnNDYik7XG4gIH1cbn07XG5cbi8qKlxuICogR2V0IGFuIGVsZW1lbnQncyB0cmFuc2l0aW9uIHR5cGUgYmFzZWQgb24gdGhlXG4gKiBjYWxjdWxhdGVkIHN0eWxlcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cblxucCQxLmdldENzc1RyYW5zaXRpb25UeXBlID0gZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKCF0cmFuc2l0aW9uRW5kRXZlbnQgfHxcbiAgLy8gc2tpcCBDU1MgdHJhbnNpdGlvbnMgaWYgcGFnZSBpcyBub3QgdmlzaWJsZSAtXG4gIC8vIHRoaXMgc29sdmVzIHRoZSBpc3N1ZSBvZiB0cmFuc2l0aW9uZW5kIGV2ZW50cyBub3RcbiAgLy8gZmlyaW5nIHVudGlsIHRoZSBwYWdlIGlzIHZpc2libGUgYWdhaW4uXG4gIC8vIHBhZ2VWaXNpYmlsaXR5IEFQSSBpcyBzdXBwb3J0ZWQgaW4gSUUxMCssIHNhbWUgYXNcbiAgLy8gQ1NTIHRyYW5zaXRpb25zLlxuICBkb2N1bWVudC5oaWRkZW4gfHxcbiAgLy8gZXhwbGljaXQganMtb25seSB0cmFuc2l0aW9uXG4gIHRoaXMuaG9va3MgJiYgdGhpcy5ob29rcy5jc3MgPT09IGZhbHNlIHx8XG4gIC8vIGVsZW1lbnQgaXMgaGlkZGVuXG4gIGlzSGlkZGVuKHRoaXMuZWwpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciB0eXBlID0gdGhpcy50eXBlIHx8IHRoaXMudHlwZUNhY2hlW2NsYXNzTmFtZV07XG4gIGlmICh0eXBlKSByZXR1cm4gdHlwZTtcbiAgdmFyIGlubGluZVN0eWxlcyA9IHRoaXMuZWwuc3R5bGU7XG4gIHZhciBjb21wdXRlZFN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZWwpO1xuICB2YXIgdHJhbnNEdXJhdGlvbiA9IGlubGluZVN0eWxlc1t0cmFuc0R1cmF0aW9uUHJvcF0gfHwgY29tcHV0ZWRTdHlsZXNbdHJhbnNEdXJhdGlvblByb3BdO1xuICBpZiAodHJhbnNEdXJhdGlvbiAmJiB0cmFuc0R1cmF0aW9uICE9PSAnMHMnKSB7XG4gICAgdHlwZSA9IFRZUEVfVFJBTlNJVElPTjtcbiAgfSBlbHNlIHtcbiAgICB2YXIgYW5pbUR1cmF0aW9uID0gaW5saW5lU3R5bGVzW2FuaW1EdXJhdGlvblByb3BdIHx8IGNvbXB1dGVkU3R5bGVzW2FuaW1EdXJhdGlvblByb3BdO1xuICAgIGlmIChhbmltRHVyYXRpb24gJiYgYW5pbUR1cmF0aW9uICE9PSAnMHMnKSB7XG4gICAgICB0eXBlID0gVFlQRV9BTklNQVRJT047XG4gICAgfVxuICB9XG4gIGlmICh0eXBlKSB7XG4gICAgdGhpcy50eXBlQ2FjaGVbY2xhc3NOYW1lXSA9IHR5cGU7XG4gIH1cbiAgcmV0dXJuIHR5cGU7XG59O1xuXG4vKipcbiAqIFNldHVwIGEgQ1NTIHRyYW5zaXRpb25lbmQvYW5pbWF0aW9uZW5kIGNhbGxiYWNrLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2JcbiAqL1xuXG5wJDEuc2V0dXBDc3NDYiA9IGZ1bmN0aW9uIChldmVudCwgY2IpIHtcbiAgdGhpcy5wZW5kaW5nQ3NzRXZlbnQgPSBldmVudDtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgZWwgPSB0aGlzLmVsO1xuICB2YXIgb25FbmQgPSB0aGlzLnBlbmRpbmdDc3NDYiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUudGFyZ2V0ID09PSBlbCkge1xuICAgICAgb2ZmKGVsLCBldmVudCwgb25FbmQpO1xuICAgICAgc2VsZi5wZW5kaW5nQ3NzRXZlbnQgPSBzZWxmLnBlbmRpbmdDc3NDYiA9IG51bGw7XG4gICAgICBpZiAoIXNlbGYucGVuZGluZ0pzQ2IgJiYgY2IpIHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIG9uKGVsLCBldmVudCwgb25FbmQpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBhbiBlbGVtZW50IGlzIGhpZGRlbiAtIGluIHRoYXQgY2FzZSB3ZSBjYW4ganVzdFxuICogc2tpcCB0aGUgdHJhbnNpdGlvbiBhbGx0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzSGlkZGVuKGVsKSB7XG4gIGlmICgvc3ZnJC8udGVzdChlbC5uYW1lc3BhY2VVUkkpKSB7XG4gICAgLy8gU1ZHIGVsZW1lbnRzIGRvIG5vdCBoYXZlIG9mZnNldChXaWR0aHxIZWlnaHQpXG4gICAgLy8gc28gd2UgbmVlZCB0byBjaGVjayB0aGUgY2xpZW50IHJlY3RcbiAgICB2YXIgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiAhKHJlY3Qud2lkdGggfHwgcmVjdC5oZWlnaHQpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAhKGVsLm9mZnNldFdpZHRoIHx8IGVsLm9mZnNldEhlaWdodCB8fCBlbC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCk7XG4gIH1cbn1cblxudmFyIHRyYW5zaXRpb24kMSA9IHtcblxuICBwcmlvcml0eTogVFJBTlNJVElPTixcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShpZCwgb2xkSWQpIHtcbiAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgIC8vIHJlc29sdmUgb24gb3duZXIgdm1cbiAgICB2YXIgaG9va3MgPSByZXNvbHZlQXNzZXQodGhpcy52bS4kb3B0aW9ucywgJ3RyYW5zaXRpb25zJywgaWQpO1xuICAgIGlkID0gaWQgfHwgJ3YnO1xuICAgIG9sZElkID0gb2xkSWQgfHwgJ3YnO1xuICAgIGVsLl9fdl90cmFucyA9IG5ldyBUcmFuc2l0aW9uKGVsLCBpZCwgaG9va3MsIHRoaXMudm0pO1xuICAgIHJlbW92ZUNsYXNzKGVsLCBvbGRJZCArICctdHJhbnNpdGlvbicpO1xuICAgIGFkZENsYXNzKGVsLCBpZCArICctdHJhbnNpdGlvbicpO1xuICB9XG59O1xuXG52YXIgaW50ZXJuYWxEaXJlY3RpdmVzID0ge1xuICBzdHlsZTogc3R5bGUsXG4gICdjbGFzcyc6IHZDbGFzcyxcbiAgY29tcG9uZW50OiBjb21wb25lbnQsXG4gIHByb3A6IHByb3BEZWYsXG4gIHRyYW5zaXRpb246IHRyYW5zaXRpb24kMVxufTtcblxuLy8gc3BlY2lhbCBiaW5kaW5nIHByZWZpeGVzXG52YXIgYmluZFJFID0gL152LWJpbmQ6fF46LztcbnZhciBvblJFID0gL152LW9uOnxeQC87XG52YXIgZGlyQXR0clJFID0gL152LShbXjpdKykoPzokfDooLiopJCkvO1xudmFyIG1vZGlmaWVyUkUgPSAvXFwuW15cXC5dKy9nO1xudmFyIHRyYW5zaXRpb25SRSA9IC9eKHYtYmluZDp8Oik/dHJhbnNpdGlvbiQvO1xuXG4vLyBkZWZhdWx0IGRpcmVjdGl2ZSBwcmlvcml0eVxudmFyIERFRkFVTFRfUFJJT1JJVFkgPSAxMDAwO1xudmFyIERFRkFVTFRfVEVSTUlOQUxfUFJJT1JJVFkgPSAyMDAwO1xuXG4vKipcbiAqIENvbXBpbGUgYSB0ZW1wbGF0ZSBhbmQgcmV0dXJuIGEgcmV1c2FibGUgY29tcG9zaXRlIGxpbmtcbiAqIGZ1bmN0aW9uLCB3aGljaCByZWN1cnNpdmVseSBjb250YWlucyBtb3JlIGxpbmsgZnVuY3Rpb25zXG4gKiBpbnNpZGUuIFRoaXMgdG9wIGxldmVsIGNvbXBpbGUgZnVuY3Rpb24gd291bGQgbm9ybWFsbHlcbiAqIGJlIGNhbGxlZCBvbiBpbnN0YW5jZSByb290IG5vZGVzLCBidXQgY2FuIGFsc28gYmUgdXNlZFxuICogZm9yIHBhcnRpYWwgY29tcGlsYXRpb24gaWYgdGhlIHBhcnRpYWwgYXJndW1lbnQgaXMgdHJ1ZS5cbiAqXG4gKiBUaGUgcmV0dXJuZWQgY29tcG9zaXRlIGxpbmsgZnVuY3Rpb24sIHdoZW4gY2FsbGVkLCB3aWxsXG4gKiByZXR1cm4gYW4gdW5saW5rIGZ1bmN0aW9uIHRoYXQgdGVhcnNkb3duIGFsbCBkaXJlY3RpdmVzXG4gKiBjcmVhdGVkIGR1cmluZyB0aGUgbGlua2luZyBwaGFzZS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHBhcnRpYWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGUoZWwsIG9wdGlvbnMsIHBhcnRpYWwpIHtcbiAgLy8gbGluayBmdW5jdGlvbiBmb3IgdGhlIG5vZGUgaXRzZWxmLlxuICB2YXIgbm9kZUxpbmtGbiA9IHBhcnRpYWwgfHwgIW9wdGlvbnMuX2FzQ29tcG9uZW50ID8gY29tcGlsZU5vZGUoZWwsIG9wdGlvbnMpIDogbnVsbDtcbiAgLy8gbGluayBmdW5jdGlvbiBmb3IgdGhlIGNoaWxkTm9kZXNcbiAgdmFyIGNoaWxkTGlua0ZuID0gIShub2RlTGlua0ZuICYmIG5vZGVMaW5rRm4udGVybWluYWwpICYmICFpc1NjcmlwdChlbCkgJiYgZWwuaGFzQ2hpbGROb2RlcygpID8gY29tcGlsZU5vZGVMaXN0KGVsLmNoaWxkTm9kZXMsIG9wdGlvbnMpIDogbnVsbDtcblxuICAvKipcbiAgICogQSBjb21wb3NpdGUgbGlua2VyIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBhIGFscmVhZHlcbiAgICogY29tcGlsZWQgcGllY2Ugb2YgRE9NLCB3aGljaCBpbnN0YW50aWF0ZXMgYWxsIGRpcmVjdGl2ZVxuICAgKiBpbnN0YW5jZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7VnVlfSB2bVxuICAgKiBAcGFyYW0ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH0gZWxcbiAgICogQHBhcmFtIHtWdWV9IFtob3N0XSAtIGhvc3Qgdm0gb2YgdHJhbnNjbHVkZWQgY29udGVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gW3Njb3BlXSAtIHYtZm9yIHNjb3BlXG4gICAqIEBwYXJhbSB7RnJhZ21lbnR9IFtmcmFnXSAtIGxpbmsgY29udGV4dCBmcmFnbWVudFxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbnx1bmRlZmluZWR9XG4gICAqL1xuXG4gIHJldHVybiBmdW5jdGlvbiBjb21wb3NpdGVMaW5rRm4odm0sIGVsLCBob3N0LCBzY29wZSwgZnJhZykge1xuICAgIC8vIGNhY2hlIGNoaWxkTm9kZXMgYmVmb3JlIGxpbmtpbmcgcGFyZW50LCBmaXggIzY1N1xuICAgIHZhciBjaGlsZE5vZGVzID0gdG9BcnJheShlbC5jaGlsZE5vZGVzKTtcbiAgICAvLyBsaW5rXG4gICAgdmFyIGRpcnMgPSBsaW5rQW5kQ2FwdHVyZShmdW5jdGlvbiBjb21wb3NpdGVMaW5rQ2FwdHVyZXIoKSB7XG4gICAgICBpZiAobm9kZUxpbmtGbikgbm9kZUxpbmtGbih2bSwgZWwsIGhvc3QsIHNjb3BlLCBmcmFnKTtcbiAgICAgIGlmIChjaGlsZExpbmtGbikgY2hpbGRMaW5rRm4odm0sIGNoaWxkTm9kZXMsIGhvc3QsIHNjb3BlLCBmcmFnKTtcbiAgICB9LCB2bSk7XG4gICAgcmV0dXJuIG1ha2VVbmxpbmtGbih2bSwgZGlycyk7XG4gIH07XG59XG5cbi8qKlxuICogQXBwbHkgYSBsaW5rZXIgdG8gYSB2bS9lbGVtZW50IHBhaXIgYW5kIGNhcHR1cmUgdGhlXG4gKiBkaXJlY3RpdmVzIGNyZWF0ZWQgZHVyaW5nIHRoZSBwcm9jZXNzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGxpbmtlclxuICogQHBhcmFtIHtWdWV9IHZtXG4gKi9cblxuZnVuY3Rpb24gbGlua0FuZENhcHR1cmUobGlua2VyLCB2bSkge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgICAvLyByZXNldCBkaXJlY3RpdmVzIGJlZm9yZSBldmVyeSBjYXB0dXJlIGluIHByb2R1Y3Rpb25cbiAgICAvLyBtb2RlLCBzbyB0aGF0IHdoZW4gdW5saW5raW5nIHdlIGRvbid0IG5lZWQgdG8gc3BsaWNlXG4gICAgLy8gdGhlbSBvdXQgKHdoaWNoIHR1cm5zIG91dCB0byBiZSBhIHBlcmYgaGl0KS5cbiAgICAvLyB0aGV5IGFyZSBrZXB0IGluIGRldmVsb3BtZW50IG1vZGUgYmVjYXVzZSB0aGV5IGFyZVxuICAgIC8vIHVzZWZ1bCBmb3IgVnVlJ3Mgb3duIHRlc3RzLlxuICAgIHZtLl9kaXJlY3RpdmVzID0gW107XG4gIH1cbiAgdmFyIG9yaWdpbmFsRGlyQ291bnQgPSB2bS5fZGlyZWN0aXZlcy5sZW5ndGg7XG4gIGxpbmtlcigpO1xuICB2YXIgZGlycyA9IHZtLl9kaXJlY3RpdmVzLnNsaWNlKG9yaWdpbmFsRGlyQ291bnQpO1xuICBkaXJzLnNvcnQoZGlyZWN0aXZlQ29tcGFyYXRvcik7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gZGlycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBkaXJzW2ldLl9iaW5kKCk7XG4gIH1cbiAgcmV0dXJuIGRpcnM7XG59XG5cbi8qKlxuICogRGlyZWN0aXZlIHByaW9yaXR5IHNvcnQgY29tcGFyYXRvclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICovXG5cbmZ1bmN0aW9uIGRpcmVjdGl2ZUNvbXBhcmF0b3IoYSwgYikge1xuICBhID0gYS5kZXNjcmlwdG9yLmRlZi5wcmlvcml0eSB8fCBERUZBVUxUX1BSSU9SSVRZO1xuICBiID0gYi5kZXNjcmlwdG9yLmRlZi5wcmlvcml0eSB8fCBERUZBVUxUX1BSSU9SSVRZO1xuICByZXR1cm4gYSA+IGIgPyAtMSA6IGEgPT09IGIgPyAwIDogMTtcbn1cblxuLyoqXG4gKiBMaW5rZXIgZnVuY3Rpb25zIHJldHVybiBhbiB1bmxpbmsgZnVuY3Rpb24gdGhhdFxuICogdGVhcnNkb3duIGFsbCBkaXJlY3RpdmVzIGluc3RhbmNlcyBnZW5lcmF0ZWQgZHVyaW5nXG4gKiB0aGUgcHJvY2Vzcy5cbiAqXG4gKiBXZSBjcmVhdGUgdW5saW5rIGZ1bmN0aW9ucyB3aXRoIG9ubHkgdGhlIG5lY2Vzc2FyeVxuICogaW5mb3JtYXRpb24gdG8gYXZvaWQgcmV0YWluaW5nIGFkZGl0aW9uYWwgY2xvc3VyZXMuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0FycmF5fSBkaXJzXG4gKiBAcGFyYW0ge1Z1ZX0gW2NvbnRleHRdXG4gKiBAcGFyYW0ge0FycmF5fSBbY29udGV4dERpcnNdXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBtYWtlVW5saW5rRm4odm0sIGRpcnMsIGNvbnRleHQsIGNvbnRleHREaXJzKSB7XG4gIGZ1bmN0aW9uIHVubGluayhkZXN0cm95aW5nKSB7XG4gICAgdGVhcmRvd25EaXJzKHZtLCBkaXJzLCBkZXN0cm95aW5nKTtcbiAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0RGlycykge1xuICAgICAgdGVhcmRvd25EaXJzKGNvbnRleHQsIGNvbnRleHREaXJzKTtcbiAgICB9XG4gIH1cbiAgLy8gZXhwb3NlIGxpbmtlZCBkaXJlY3RpdmVzXG4gIHVubGluay5kaXJzID0gZGlycztcbiAgcmV0dXJuIHVubGluaztcbn1cblxuLyoqXG4gKiBUZWFyZG93biBwYXJ0aWFsIGxpbmtlZCBkaXJlY3RpdmVzLlxuICpcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHtBcnJheX0gZGlyc1xuICogQHBhcmFtIHtCb29sZWFufSBkZXN0cm95aW5nXG4gKi9cblxuZnVuY3Rpb24gdGVhcmRvd25EaXJzKHZtLCBkaXJzLCBkZXN0cm95aW5nKSB7XG4gIHZhciBpID0gZGlycy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBkaXJzW2ldLl90ZWFyZG93bigpO1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmICFkZXN0cm95aW5nKSB7XG4gICAgICB2bS5fZGlyZWN0aXZlcy4kcmVtb3ZlKGRpcnNbaV0pO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENvbXBpbGUgbGluayBwcm9wcyBvbiBhbiBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wc1xuICogQHBhcmFtIHtPYmplY3R9IFtzY29wZV1cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGVBbmRMaW5rUHJvcHModm0sIGVsLCBwcm9wcywgc2NvcGUpIHtcbiAgdmFyIHByb3BzTGlua0ZuID0gY29tcGlsZVByb3BzKGVsLCBwcm9wcywgdm0pO1xuICB2YXIgcHJvcERpcnMgPSBsaW5rQW5kQ2FwdHVyZShmdW5jdGlvbiAoKSB7XG4gICAgcHJvcHNMaW5rRm4odm0sIHNjb3BlKTtcbiAgfSwgdm0pO1xuICByZXR1cm4gbWFrZVVubGlua0ZuKHZtLCBwcm9wRGlycyk7XG59XG5cbi8qKlxuICogQ29tcGlsZSB0aGUgcm9vdCBlbGVtZW50IG9mIGFuIGluc3RhbmNlLlxuICpcbiAqIDEuIGF0dHJzIG9uIGNvbnRleHQgY29udGFpbmVyIChjb250ZXh0IHNjb3BlKVxuICogMi4gYXR0cnMgb24gdGhlIGNvbXBvbmVudCB0ZW1wbGF0ZSByb290IG5vZGUsIGlmXG4gKiAgICByZXBsYWNlOnRydWUgKGNoaWxkIHNjb3BlKVxuICpcbiAqIElmIHRoaXMgaXMgYSBmcmFnbWVudCBpbnN0YW5jZSwgd2Ugb25seSBuZWVkIHRvIGNvbXBpbGUgMS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRPcHRpb25zXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlUm9vdChlbCwgb3B0aW9ucywgY29udGV4dE9wdGlvbnMpIHtcbiAgdmFyIGNvbnRhaW5lckF0dHJzID0gb3B0aW9ucy5fY29udGFpbmVyQXR0cnM7XG4gIHZhciByZXBsYWNlckF0dHJzID0gb3B0aW9ucy5fcmVwbGFjZXJBdHRycztcbiAgdmFyIGNvbnRleHRMaW5rRm4sIHJlcGxhY2VyTGlua0ZuO1xuXG4gIC8vIG9ubHkgbmVlZCB0byBjb21waWxlIG90aGVyIGF0dHJpYnV0ZXMgZm9yXG4gIC8vIG5vbi1mcmFnbWVudCBpbnN0YW5jZXNcbiAgaWYgKGVsLm5vZGVUeXBlICE9PSAxMSkge1xuICAgIC8vIGZvciBjb21wb25lbnRzLCBjb250YWluZXIgYW5kIHJlcGxhY2VyIG5lZWQgdG8gYmVcbiAgICAvLyBjb21waWxlZCBzZXBhcmF0ZWx5IGFuZCBsaW5rZWQgaW4gZGlmZmVyZW50IHNjb3Blcy5cbiAgICBpZiAob3B0aW9ucy5fYXNDb21wb25lbnQpIHtcbiAgICAgIC8vIDIuIGNvbnRhaW5lciBhdHRyaWJ1dGVzXG4gICAgICBpZiAoY29udGFpbmVyQXR0cnMgJiYgY29udGV4dE9wdGlvbnMpIHtcbiAgICAgICAgY29udGV4dExpbmtGbiA9IGNvbXBpbGVEaXJlY3RpdmVzKGNvbnRhaW5lckF0dHJzLCBjb250ZXh0T3B0aW9ucyk7XG4gICAgICB9XG4gICAgICBpZiAocmVwbGFjZXJBdHRycykge1xuICAgICAgICAvLyAzLiByZXBsYWNlciBhdHRyaWJ1dGVzXG4gICAgICAgIHJlcGxhY2VyTGlua0ZuID0gY29tcGlsZURpcmVjdGl2ZXMocmVwbGFjZXJBdHRycywgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG5vbi1jb21wb25lbnQsIGp1c3QgY29tcGlsZSBhcyBhIG5vcm1hbCBlbGVtZW50LlxuICAgICAgcmVwbGFjZXJMaW5rRm4gPSBjb21waWxlRGlyZWN0aXZlcyhlbC5hdHRyaWJ1dGVzLCBvcHRpb25zKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBjb250YWluZXJBdHRycykge1xuICAgIC8vIHdhcm4gY29udGFpbmVyIGRpcmVjdGl2ZXMgZm9yIGZyYWdtZW50IGluc3RhbmNlc1xuICAgIHZhciBuYW1lcyA9IGNvbnRhaW5lckF0dHJzLmZpbHRlcihmdW5jdGlvbiAoYXR0cikge1xuICAgICAgLy8gYWxsb3cgdnVlLWxvYWRlci92dWVpZnkgc2NvcGVkIGNzcyBhdHRyaWJ1dGVzXG4gICAgICByZXR1cm4gYXR0ci5uYW1lLmluZGV4T2YoJ192LScpIDwgMCAmJlxuICAgICAgLy8gYWxsb3cgZXZlbnQgbGlzdGVuZXJzXG4gICAgICAhb25SRS50ZXN0KGF0dHIubmFtZSkgJiZcbiAgICAgIC8vIGFsbG93IHNsb3RzXG4gICAgICBhdHRyLm5hbWUgIT09ICdzbG90JztcbiAgICB9KS5tYXAoZnVuY3Rpb24gKGF0dHIpIHtcbiAgICAgIHJldHVybiAnXCInICsgYXR0ci5uYW1lICsgJ1wiJztcbiAgICB9KTtcbiAgICBpZiAobmFtZXMubGVuZ3RoKSB7XG4gICAgICB2YXIgcGx1cmFsID0gbmFtZXMubGVuZ3RoID4gMTtcbiAgICAgIHdhcm4oJ0F0dHJpYnV0ZScgKyAocGx1cmFsID8gJ3MgJyA6ICcgJykgKyBuYW1lcy5qb2luKCcsICcpICsgKHBsdXJhbCA/ICcgYXJlJyA6ICcgaXMnKSArICcgaWdub3JlZCBvbiBjb21wb25lbnQgJyArICc8JyArIG9wdGlvbnMuZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpICsgJz4gYmVjYXVzZSAnICsgJ3RoZSBjb21wb25lbnQgaXMgYSBmcmFnbWVudCBpbnN0YW5jZTogJyArICdodHRwOi8vdnVlanMub3JnL2d1aWRlL2NvbXBvbmVudHMuaHRtbCNGcmFnbWVudC1JbnN0YW5jZScpO1xuICAgIH1cbiAgfVxuXG4gIG9wdGlvbnMuX2NvbnRhaW5lckF0dHJzID0gb3B0aW9ucy5fcmVwbGFjZXJBdHRycyA9IG51bGw7XG4gIHJldHVybiBmdW5jdGlvbiByb290TGlua0ZuKHZtLCBlbCwgc2NvcGUpIHtcbiAgICAvLyBsaW5rIGNvbnRleHQgc2NvcGUgZGlyc1xuICAgIHZhciBjb250ZXh0ID0gdm0uX2NvbnRleHQ7XG4gICAgdmFyIGNvbnRleHREaXJzO1xuICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHRMaW5rRm4pIHtcbiAgICAgIGNvbnRleHREaXJzID0gbGlua0FuZENhcHR1cmUoZnVuY3Rpb24gKCkge1xuICAgICAgICBjb250ZXh0TGlua0ZuKGNvbnRleHQsIGVsLCBudWxsLCBzY29wZSk7XG4gICAgICB9LCBjb250ZXh0KTtcbiAgICB9XG5cbiAgICAvLyBsaW5rIHNlbGZcbiAgICB2YXIgc2VsZkRpcnMgPSBsaW5rQW5kQ2FwdHVyZShmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocmVwbGFjZXJMaW5rRm4pIHJlcGxhY2VyTGlua0ZuKHZtLCBlbCk7XG4gICAgfSwgdm0pO1xuXG4gICAgLy8gcmV0dXJuIHRoZSB1bmxpbmsgZnVuY3Rpb24gdGhhdCB0ZWFyc2Rvd24gY29udGV4dFxuICAgIC8vIGNvbnRhaW5lciBkaXJlY3RpdmVzLlxuICAgIHJldHVybiBtYWtlVW5saW5rRm4odm0sIHNlbGZEaXJzLCBjb250ZXh0LCBjb250ZXh0RGlycyk7XG4gIH07XG59XG5cbi8qKlxuICogQ29tcGlsZSBhIG5vZGUgYW5kIHJldHVybiBhIG5vZGVMaW5rRm4gYmFzZWQgb24gdGhlXG4gKiBub2RlIHR5cGUuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RnVuY3Rpb258bnVsbH1cbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlTm9kZShub2RlLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gbm9kZS5ub2RlVHlwZTtcbiAgaWYgKHR5cGUgPT09IDEgJiYgIWlzU2NyaXB0KG5vZGUpKSB7XG4gICAgcmV0dXJuIGNvbXBpbGVFbGVtZW50KG5vZGUsIG9wdGlvbnMpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09IDMgJiYgbm9kZS5kYXRhLnRyaW0oKSkge1xuICAgIHJldHVybiBjb21waWxlVGV4dE5vZGUobm9kZSwgb3B0aW9ucyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21waWxlIGFuIGVsZW1lbnQgYW5kIHJldHVybiBhIG5vZGVMaW5rRm4uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufG51bGx9XG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZUVsZW1lbnQoZWwsIG9wdGlvbnMpIHtcbiAgLy8gcHJlcHJvY2VzcyB0ZXh0YXJlYXMuXG4gIC8vIHRleHRhcmVhIHRyZWF0cyBpdHMgdGV4dCBjb250ZW50IGFzIHRoZSBpbml0aWFsIHZhbHVlLlxuICAvLyBqdXN0IGJpbmQgaXQgYXMgYW4gYXR0ciBkaXJlY3RpdmUgZm9yIHZhbHVlLlxuICBpZiAoZWwudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgIHZhciB0b2tlbnMgPSBwYXJzZVRleHQoZWwudmFsdWUpO1xuICAgIGlmICh0b2tlbnMpIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZSgnOnZhbHVlJywgdG9rZW5zVG9FeHAodG9rZW5zKSk7XG4gICAgICBlbC52YWx1ZSA9ICcnO1xuICAgIH1cbiAgfVxuICB2YXIgbGlua0ZuO1xuICB2YXIgaGFzQXR0cnMgPSBlbC5oYXNBdHRyaWJ1dGVzKCk7XG4gIHZhciBhdHRycyA9IGhhc0F0dHJzICYmIHRvQXJyYXkoZWwuYXR0cmlidXRlcyk7XG4gIC8vIGNoZWNrIHRlcm1pbmFsIGRpcmVjdGl2ZXMgKGZvciAmIGlmKVxuICBpZiAoaGFzQXR0cnMpIHtcbiAgICBsaW5rRm4gPSBjaGVja1Rlcm1pbmFsRGlyZWN0aXZlcyhlbCwgYXR0cnMsIG9wdGlvbnMpO1xuICB9XG4gIC8vIGNoZWNrIGVsZW1lbnQgZGlyZWN0aXZlc1xuICBpZiAoIWxpbmtGbikge1xuICAgIGxpbmtGbiA9IGNoZWNrRWxlbWVudERpcmVjdGl2ZXMoZWwsIG9wdGlvbnMpO1xuICB9XG4gIC8vIGNoZWNrIGNvbXBvbmVudFxuICBpZiAoIWxpbmtGbikge1xuICAgIGxpbmtGbiA9IGNoZWNrQ29tcG9uZW50KGVsLCBvcHRpb25zKTtcbiAgfVxuICAvLyBub3JtYWwgZGlyZWN0aXZlc1xuICBpZiAoIWxpbmtGbiAmJiBoYXNBdHRycykge1xuICAgIGxpbmtGbiA9IGNvbXBpbGVEaXJlY3RpdmVzKGF0dHJzLCBvcHRpb25zKTtcbiAgfVxuICByZXR1cm4gbGlua0ZuO1xufVxuXG4vKipcbiAqIENvbXBpbGUgYSB0ZXh0Tm9kZSBhbmQgcmV0dXJuIGEgbm9kZUxpbmtGbi5cbiAqXG4gKiBAcGFyYW0ge1RleHROb2RlfSBub2RlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RnVuY3Rpb258bnVsbH0gdGV4dE5vZGVMaW5rRm5cbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlVGV4dE5vZGUobm9kZSwgb3B0aW9ucykge1xuICAvLyBza2lwIG1hcmtlZCB0ZXh0IG5vZGVzXG4gIGlmIChub2RlLl9za2lwKSB7XG4gICAgcmV0dXJuIHJlbW92ZVRleHQ7XG4gIH1cblxuICB2YXIgdG9rZW5zID0gcGFyc2VUZXh0KG5vZGUud2hvbGVUZXh0KTtcbiAgaWYgKCF0b2tlbnMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIG1hcmsgYWRqYWNlbnQgdGV4dCBub2RlcyBhcyBza2lwcGVkLFxuICAvLyBiZWNhdXNlIHdlIGFyZSB1c2luZyBub2RlLndob2xlVGV4dCB0byBjb21waWxlXG4gIC8vIGFsbCBhZGphY2VudCB0ZXh0IG5vZGVzIHRvZ2V0aGVyLiBUaGlzIGZpeGVzXG4gIC8vIGlzc3VlcyBpbiBJRSB3aGVyZSBzb21ldGltZXMgaXQgc3BsaXRzIHVwIGEgc2luZ2xlXG4gIC8vIHRleHQgbm9kZSBpbnRvIG11bHRpcGxlIG9uZXMuXG4gIHZhciBuZXh0ID0gbm9kZS5uZXh0U2libGluZztcbiAgd2hpbGUgKG5leHQgJiYgbmV4dC5ub2RlVHlwZSA9PT0gMykge1xuICAgIG5leHQuX3NraXAgPSB0cnVlO1xuICAgIG5leHQgPSBuZXh0Lm5leHRTaWJsaW5nO1xuICB9XG5cbiAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHZhciBlbCwgdG9rZW47XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdG9rZW5zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHRva2VuID0gdG9rZW5zW2ldO1xuICAgIGVsID0gdG9rZW4udGFnID8gcHJvY2Vzc1RleHRUb2tlbih0b2tlbiwgb3B0aW9ucykgOiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0b2tlbi52YWx1ZSk7XG4gICAgZnJhZy5hcHBlbmRDaGlsZChlbCk7XG4gIH1cbiAgcmV0dXJuIG1ha2VUZXh0Tm9kZUxpbmtGbih0b2tlbnMsIGZyYWcsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIExpbmtlciBmb3IgYW4gc2tpcHBlZCB0ZXh0IG5vZGUuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge1RleHR9IG5vZGVcbiAqL1xuXG5mdW5jdGlvbiByZW1vdmVUZXh0KHZtLCBub2RlKSB7XG4gIHJlbW92ZShub2RlKTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGEgc2luZ2xlIHRleHQgdG9rZW4uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHRva2VuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7Tm9kZX1cbiAqL1xuXG5mdW5jdGlvbiBwcm9jZXNzVGV4dFRva2VuKHRva2VuLCBvcHRpb25zKSB7XG4gIHZhciBlbDtcbiAgaWYgKHRva2VuLm9uZVRpbWUpIHtcbiAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRva2VuLnZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodG9rZW4uaHRtbCkge1xuICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LWh0bWwnKTtcbiAgICAgIHNldFRva2VuVHlwZSgnaHRtbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJRSB3aWxsIGNsZWFuIHVwIGVtcHR5IHRleHROb2RlcyBkdXJpbmdcbiAgICAgIC8vIGZyYWcuY2xvbmVOb2RlKHRydWUpLCBzbyB3ZSBoYXZlIHRvIGdpdmUgaXRcbiAgICAgIC8vIHNvbWV0aGluZyBoZXJlLi4uXG4gICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcgJyk7XG4gICAgICBzZXRUb2tlblR5cGUoJ3RleHQnKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gc2V0VG9rZW5UeXBlKHR5cGUpIHtcbiAgICBpZiAodG9rZW4uZGVzY3JpcHRvcikgcmV0dXJuO1xuICAgIHZhciBwYXJzZWQgPSBwYXJzZURpcmVjdGl2ZSh0b2tlbi52YWx1ZSk7XG4gICAgdG9rZW4uZGVzY3JpcHRvciA9IHtcbiAgICAgIG5hbWU6IHR5cGUsXG4gICAgICBkZWY6IGRpcmVjdGl2ZXNbdHlwZV0sXG4gICAgICBleHByZXNzaW9uOiBwYXJzZWQuZXhwcmVzc2lvbixcbiAgICAgIGZpbHRlcnM6IHBhcnNlZC5maWx0ZXJzXG4gICAgfTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG5cbi8qKlxuICogQnVpbGQgYSBmdW5jdGlvbiB0aGF0IHByb2Nlc3NlcyBhIHRleHROb2RlLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gdG9rZW5zXG4gKiBAcGFyYW0ge0RvY3VtZW50RnJhZ21lbnR9IGZyYWdcbiAqL1xuXG5mdW5jdGlvbiBtYWtlVGV4dE5vZGVMaW5rRm4odG9rZW5zLCBmcmFnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0ZXh0Tm9kZUxpbmtGbih2bSwgZWwsIGhvc3QsIHNjb3BlKSB7XG4gICAgdmFyIGZyYWdDbG9uZSA9IGZyYWcuY2xvbmVOb2RlKHRydWUpO1xuICAgIHZhciBjaGlsZE5vZGVzID0gdG9BcnJheShmcmFnQ2xvbmUuY2hpbGROb2Rlcyk7XG4gICAgdmFyIHRva2VuLCB2YWx1ZSwgbm9kZTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRva2Vucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgdmFsdWUgPSB0b2tlbi52YWx1ZTtcbiAgICAgIGlmICh0b2tlbi50YWcpIHtcbiAgICAgICAgbm9kZSA9IGNoaWxkTm9kZXNbaV07XG4gICAgICAgIGlmICh0b2tlbi5vbmVUaW1lKSB7XG4gICAgICAgICAgdmFsdWUgPSAoc2NvcGUgfHwgdm0pLiRldmFsKHZhbHVlKTtcbiAgICAgICAgICBpZiAodG9rZW4uaHRtbCkge1xuICAgICAgICAgICAgcmVwbGFjZShub2RlLCBwYXJzZVRlbXBsYXRlKHZhbHVlLCB0cnVlKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUuZGF0YSA9IF90b1N0cmluZyh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZtLl9iaW5kRGlyKHRva2VuLmRlc2NyaXB0b3IsIG5vZGUsIGhvc3QsIHNjb3BlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXBsYWNlKGVsLCBmcmFnQ2xvbmUpO1xuICB9O1xufVxuXG4vKipcbiAqIENvbXBpbGUgYSBub2RlIGxpc3QgYW5kIHJldHVybiBhIGNoaWxkTGlua0ZuLlxuICpcbiAqIEBwYXJhbSB7Tm9kZUxpc3R9IG5vZGVMaXN0XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RnVuY3Rpb258dW5kZWZpbmVkfVxuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGVOb2RlTGlzdChub2RlTGlzdCwgb3B0aW9ucykge1xuICB2YXIgbGlua0ZucyA9IFtdO1xuICB2YXIgbm9kZUxpbmtGbiwgY2hpbGRMaW5rRm4sIG5vZGU7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gbm9kZUxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgbm9kZSA9IG5vZGVMaXN0W2ldO1xuICAgIG5vZGVMaW5rRm4gPSBjb21waWxlTm9kZShub2RlLCBvcHRpb25zKTtcbiAgICBjaGlsZExpbmtGbiA9ICEobm9kZUxpbmtGbiAmJiBub2RlTGlua0ZuLnRlcm1pbmFsKSAmJiBub2RlLnRhZ05hbWUgIT09ICdTQ1JJUFQnICYmIG5vZGUuaGFzQ2hpbGROb2RlcygpID8gY29tcGlsZU5vZGVMaXN0KG5vZGUuY2hpbGROb2Rlcywgb3B0aW9ucykgOiBudWxsO1xuICAgIGxpbmtGbnMucHVzaChub2RlTGlua0ZuLCBjaGlsZExpbmtGbik7XG4gIH1cbiAgcmV0dXJuIGxpbmtGbnMubGVuZ3RoID8gbWFrZUNoaWxkTGlua0ZuKGxpbmtGbnMpIDogbnVsbDtcbn1cblxuLyoqXG4gKiBNYWtlIGEgY2hpbGQgbGluayBmdW5jdGlvbiBmb3IgYSBub2RlJ3MgY2hpbGROb2Rlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PEZ1bmN0aW9uPn0gbGlua0Zuc1xuICogQHJldHVybiB7RnVuY3Rpb259IGNoaWxkTGlua0ZuXG4gKi9cblxuZnVuY3Rpb24gbWFrZUNoaWxkTGlua0ZuKGxpbmtGbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGNoaWxkTGlua0ZuKHZtLCBub2RlcywgaG9zdCwgc2NvcGUsIGZyYWcpIHtcbiAgICB2YXIgbm9kZSwgbm9kZUxpbmtGbiwgY2hpbGRyZW5MaW5rRm47XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSAwLCBsID0gbGlua0Zucy5sZW5ndGg7IGkgPCBsOyBuKyspIHtcbiAgICAgIG5vZGUgPSBub2Rlc1tuXTtcbiAgICAgIG5vZGVMaW5rRm4gPSBsaW5rRm5zW2krK107XG4gICAgICBjaGlsZHJlbkxpbmtGbiA9IGxpbmtGbnNbaSsrXTtcbiAgICAgIC8vIGNhY2hlIGNoaWxkTm9kZXMgYmVmb3JlIGxpbmtpbmcgcGFyZW50LCBmaXggIzY1N1xuICAgICAgdmFyIGNoaWxkTm9kZXMgPSB0b0FycmF5KG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgICBpZiAobm9kZUxpbmtGbikge1xuICAgICAgICBub2RlTGlua0ZuKHZtLCBub2RlLCBob3N0LCBzY29wZSwgZnJhZyk7XG4gICAgICB9XG4gICAgICBpZiAoY2hpbGRyZW5MaW5rRm4pIHtcbiAgICAgICAgY2hpbGRyZW5MaW5rRm4odm0sIGNoaWxkTm9kZXMsIGhvc3QsIHNjb3BlLCBmcmFnKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogQ2hlY2sgZm9yIGVsZW1lbnQgZGlyZWN0aXZlcyAoY3VzdG9tIGVsZW1lbnRzIHRoYXQgc2hvdWxkXG4gKiBiZSByZXNvdmxlZCBhcyB0ZXJtaW5hbCBkaXJlY3RpdmVzKS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIGNoZWNrRWxlbWVudERpcmVjdGl2ZXMoZWwsIG9wdGlvbnMpIHtcbiAgdmFyIHRhZyA9IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgaWYgKGNvbW1vblRhZ1JFLnRlc3QodGFnKSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgZGVmID0gcmVzb2x2ZUFzc2V0KG9wdGlvbnMsICdlbGVtZW50RGlyZWN0aXZlcycsIHRhZyk7XG4gIGlmIChkZWYpIHtcbiAgICByZXR1cm4gbWFrZVRlcm1pbmFsTm9kZUxpbmtGbihlbCwgdGFnLCAnJywgb3B0aW9ucywgZGVmKTtcbiAgfVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGFuIGVsZW1lbnQgaXMgYSBjb21wb25lbnQuIElmIHllcywgcmV0dXJuXG4gKiBhIGNvbXBvbmVudCBsaW5rIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtGdW5jdGlvbnx1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gY2hlY2tDb21wb25lbnQoZWwsIG9wdGlvbnMpIHtcbiAgdmFyIGNvbXBvbmVudCA9IGNoZWNrQ29tcG9uZW50QXR0cihlbCwgb3B0aW9ucyk7XG4gIGlmIChjb21wb25lbnQpIHtcbiAgICB2YXIgcmVmID0gZmluZFJlZihlbCk7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSB7XG4gICAgICBuYW1lOiAnY29tcG9uZW50JyxcbiAgICAgIHJlZjogcmVmLFxuICAgICAgZXhwcmVzc2lvbjogY29tcG9uZW50LmlkLFxuICAgICAgZGVmOiBpbnRlcm5hbERpcmVjdGl2ZXMuY29tcG9uZW50LFxuICAgICAgbW9kaWZpZXJzOiB7XG4gICAgICAgIGxpdGVyYWw6ICFjb21wb25lbnQuZHluYW1pY1xuICAgICAgfVxuICAgIH07XG4gICAgdmFyIGNvbXBvbmVudExpbmtGbiA9IGZ1bmN0aW9uIGNvbXBvbmVudExpbmtGbih2bSwgZWwsIGhvc3QsIHNjb3BlLCBmcmFnKSB7XG4gICAgICBpZiAocmVmKSB7XG4gICAgICAgIGRlZmluZVJlYWN0aXZlKChzY29wZSB8fCB2bSkuJHJlZnMsIHJlZiwgbnVsbCk7XG4gICAgICB9XG4gICAgICB2bS5fYmluZERpcihkZXNjcmlwdG9yLCBlbCwgaG9zdCwgc2NvcGUsIGZyYWcpO1xuICAgIH07XG4gICAgY29tcG9uZW50TGlua0ZuLnRlcm1pbmFsID0gdHJ1ZTtcbiAgICByZXR1cm4gY29tcG9uZW50TGlua0ZuO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2sgYW4gZWxlbWVudCBmb3IgdGVybWluYWwgZGlyZWN0aXZlcyBpbiBmaXhlZCBvcmRlci5cbiAqIElmIGl0IGZpbmRzIG9uZSwgcmV0dXJuIGEgdGVybWluYWwgbGluayBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0FycmF5fSBhdHRyc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSB0ZXJtaW5hbExpbmtGblxuICovXG5cbmZ1bmN0aW9uIGNoZWNrVGVybWluYWxEaXJlY3RpdmVzKGVsLCBhdHRycywgb3B0aW9ucykge1xuICAvLyBza2lwIHYtcHJlXG4gIGlmIChnZXRBdHRyKGVsLCAndi1wcmUnKSAhPT0gbnVsbCkge1xuICAgIHJldHVybiBza2lwO1xuICB9XG4gIC8vIHNraXAgdi1lbHNlIGJsb2NrLCBidXQgb25seSBpZiBmb2xsb3dpbmcgdi1pZlxuICBpZiAoZWwuaGFzQXR0cmlidXRlKCd2LWVsc2UnKSkge1xuICAgIHZhciBwcmV2ID0gZWwucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICBpZiAocHJldiAmJiBwcmV2Lmhhc0F0dHJpYnV0ZSgndi1pZicpKSB7XG4gICAgICByZXR1cm4gc2tpcDtcbiAgICB9XG4gIH1cblxuICB2YXIgYXR0ciwgbmFtZSwgdmFsdWUsIG1vZGlmaWVycywgbWF0Y2hlZCwgZGlyTmFtZSwgcmF3TmFtZSwgYXJnLCBkZWYsIHRlcm1EZWY7XG4gIGZvciAodmFyIGkgPSAwLCBqID0gYXR0cnMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgYXR0ciA9IGF0dHJzW2ldO1xuICAgIG5hbWUgPSBhdHRyLm5hbWUucmVwbGFjZShtb2RpZmllclJFLCAnJyk7XG4gICAgaWYgKG1hdGNoZWQgPSBuYW1lLm1hdGNoKGRpckF0dHJSRSkpIHtcbiAgICAgIGRlZiA9IHJlc29sdmVBc3NldChvcHRpb25zLCAnZGlyZWN0aXZlcycsIG1hdGNoZWRbMV0pO1xuICAgICAgaWYgKGRlZiAmJiBkZWYudGVybWluYWwpIHtcbiAgICAgICAgaWYgKCF0ZXJtRGVmIHx8IChkZWYucHJpb3JpdHkgfHwgREVGQVVMVF9URVJNSU5BTF9QUklPUklUWSkgPiB0ZXJtRGVmLnByaW9yaXR5KSB7XG4gICAgICAgICAgdGVybURlZiA9IGRlZjtcbiAgICAgICAgICByYXdOYW1lID0gYXR0ci5uYW1lO1xuICAgICAgICAgIG1vZGlmaWVycyA9IHBhcnNlTW9kaWZpZXJzKGF0dHIubmFtZSk7XG4gICAgICAgICAgdmFsdWUgPSBhdHRyLnZhbHVlO1xuICAgICAgICAgIGRpck5hbWUgPSBtYXRjaGVkWzFdO1xuICAgICAgICAgIGFyZyA9IG1hdGNoZWRbMl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAodGVybURlZikge1xuICAgIHJldHVybiBtYWtlVGVybWluYWxOb2RlTGlua0ZuKGVsLCBkaXJOYW1lLCB2YWx1ZSwgb3B0aW9ucywgdGVybURlZiwgcmF3TmFtZSwgYXJnLCBtb2RpZmllcnMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNraXAoKSB7fVxuc2tpcC50ZXJtaW5hbCA9IHRydWU7XG5cbi8qKlxuICogQnVpbGQgYSBub2RlIGxpbmsgZnVuY3Rpb24gZm9yIGEgdGVybWluYWwgZGlyZWN0aXZlLlxuICogQSB0ZXJtaW5hbCBsaW5rIGZ1bmN0aW9uIHRlcm1pbmF0ZXMgdGhlIGN1cnJlbnRcbiAqIGNvbXBpbGF0aW9uIHJlY3Vyc2lvbiBhbmQgaGFuZGxlcyBjb21waWxhdGlvbiBvZiB0aGVcbiAqIHN1YnRyZWUgaW4gdGhlIGRpcmVjdGl2ZS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gZGlyTmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IGRlZlxuICogQHBhcmFtIHtTdHJpbmd9IFtyYXdOYW1lXVxuICogQHBhcmFtIHtTdHJpbmd9IFthcmddXG4gKiBAcGFyYW0ge09iamVjdH0gW21vZGlmaWVyc11cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSB0ZXJtaW5hbExpbmtGblxuICovXG5cbmZ1bmN0aW9uIG1ha2VUZXJtaW5hbE5vZGVMaW5rRm4oZWwsIGRpck5hbWUsIHZhbHVlLCBvcHRpb25zLCBkZWYsIHJhd05hbWUsIGFyZywgbW9kaWZpZXJzKSB7XG4gIHZhciBwYXJzZWQgPSBwYXJzZURpcmVjdGl2ZSh2YWx1ZSk7XG4gIHZhciBkZXNjcmlwdG9yID0ge1xuICAgIG5hbWU6IGRpck5hbWUsXG4gICAgYXJnOiBhcmcsXG4gICAgZXhwcmVzc2lvbjogcGFyc2VkLmV4cHJlc3Npb24sXG4gICAgZmlsdGVyczogcGFyc2VkLmZpbHRlcnMsXG4gICAgcmF3OiB2YWx1ZSxcbiAgICBhdHRyOiByYXdOYW1lLFxuICAgIG1vZGlmaWVyczogbW9kaWZpZXJzLFxuICAgIGRlZjogZGVmXG4gIH07XG4gIC8vIGNoZWNrIHJlZiBmb3Igdi1mb3IgYW5kIHJvdXRlci12aWV3XG4gIGlmIChkaXJOYW1lID09PSAnZm9yJyB8fCBkaXJOYW1lID09PSAncm91dGVyLXZpZXcnKSB7XG4gICAgZGVzY3JpcHRvci5yZWYgPSBmaW5kUmVmKGVsKTtcbiAgfVxuICB2YXIgZm4gPSBmdW5jdGlvbiB0ZXJtaW5hbE5vZGVMaW5rRm4odm0sIGVsLCBob3N0LCBzY29wZSwgZnJhZykge1xuICAgIGlmIChkZXNjcmlwdG9yLnJlZikge1xuICAgICAgZGVmaW5lUmVhY3RpdmUoKHNjb3BlIHx8IHZtKS4kcmVmcywgZGVzY3JpcHRvci5yZWYsIG51bGwpO1xuICAgIH1cbiAgICB2bS5fYmluZERpcihkZXNjcmlwdG9yLCBlbCwgaG9zdCwgc2NvcGUsIGZyYWcpO1xuICB9O1xuICBmbi50ZXJtaW5hbCA9IHRydWU7XG4gIHJldHVybiBmbjtcbn1cblxuLyoqXG4gKiBDb21waWxlIHRoZSBkaXJlY3RpdmVzIG9uIGFuIGVsZW1lbnQgYW5kIHJldHVybiBhIGxpbmtlci5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fE5hbWVkTm9kZU1hcH0gYXR0cnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlRGlyZWN0aXZlcyhhdHRycywgb3B0aW9ucykge1xuICB2YXIgaSA9IGF0dHJzLmxlbmd0aDtcbiAgdmFyIGRpcnMgPSBbXTtcbiAgdmFyIGF0dHIsIG5hbWUsIHZhbHVlLCByYXdOYW1lLCByYXdWYWx1ZSwgZGlyTmFtZSwgYXJnLCBtb2RpZmllcnMsIGRpckRlZiwgdG9rZW5zLCBtYXRjaGVkO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgYXR0ciA9IGF0dHJzW2ldO1xuICAgIG5hbWUgPSByYXdOYW1lID0gYXR0ci5uYW1lO1xuICAgIHZhbHVlID0gcmF3VmFsdWUgPSBhdHRyLnZhbHVlO1xuICAgIHRva2VucyA9IHBhcnNlVGV4dCh2YWx1ZSk7XG4gICAgLy8gcmVzZXQgYXJnXG4gICAgYXJnID0gbnVsbDtcbiAgICAvLyBjaGVjayBtb2RpZmllcnNcbiAgICBtb2RpZmllcnMgPSBwYXJzZU1vZGlmaWVycyhuYW1lKTtcbiAgICBuYW1lID0gbmFtZS5yZXBsYWNlKG1vZGlmaWVyUkUsICcnKTtcblxuICAgIC8vIGF0dHJpYnV0ZSBpbnRlcnBvbGF0aW9uc1xuICAgIGlmICh0b2tlbnMpIHtcbiAgICAgIHZhbHVlID0gdG9rZW5zVG9FeHAodG9rZW5zKTtcbiAgICAgIGFyZyA9IG5hbWU7XG4gICAgICBwdXNoRGlyKCdiaW5kJywgZGlyZWN0aXZlcy5iaW5kLCB0b2tlbnMpO1xuICAgICAgLy8gd2FybiBhZ2FpbnN0IG1peGluZyBtdXN0YWNoZXMgd2l0aCB2LWJpbmRcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIGlmIChuYW1lID09PSAnY2xhc3MnICYmIEFycmF5LnByb3RvdHlwZS5zb21lLmNhbGwoYXR0cnMsIGZ1bmN0aW9uIChhdHRyKSB7XG4gICAgICAgICAgcmV0dXJuIGF0dHIubmFtZSA9PT0gJzpjbGFzcycgfHwgYXR0ci5uYW1lID09PSAndi1iaW5kOmNsYXNzJztcbiAgICAgICAgfSkpIHtcbiAgICAgICAgICB3YXJuKCdjbGFzcz1cIicgKyByYXdWYWx1ZSArICdcIjogRG8gbm90IG1peCBtdXN0YWNoZSBpbnRlcnBvbGF0aW9uICcgKyAnYW5kIHYtYmluZCBmb3IgXCJjbGFzc1wiIG9uIHRoZSBzYW1lIGVsZW1lbnQuIFVzZSBvbmUgb3IgdGhlIG90aGVyLicsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlXG5cbiAgICAgIC8vIHNwZWNpYWwgYXR0cmlidXRlOiB0cmFuc2l0aW9uXG4gICAgICBpZiAodHJhbnNpdGlvblJFLnRlc3QobmFtZSkpIHtcbiAgICAgICAgbW9kaWZpZXJzLmxpdGVyYWwgPSAhYmluZFJFLnRlc3QobmFtZSk7XG4gICAgICAgIHB1c2hEaXIoJ3RyYW5zaXRpb24nLCBpbnRlcm5hbERpcmVjdGl2ZXMudHJhbnNpdGlvbik7XG4gICAgICB9IGVsc2VcblxuICAgICAgICAvLyBldmVudCBoYW5kbGVyc1xuICAgICAgICBpZiAob25SRS50ZXN0KG5hbWUpKSB7XG4gICAgICAgICAgYXJnID0gbmFtZS5yZXBsYWNlKG9uUkUsICcnKTtcbiAgICAgICAgICBwdXNoRGlyKCdvbicsIGRpcmVjdGl2ZXMub24pO1xuICAgICAgICB9IGVsc2VcblxuICAgICAgICAgIC8vIGF0dHJpYnV0ZSBiaW5kaW5nc1xuICAgICAgICAgIGlmIChiaW5kUkUudGVzdChuYW1lKSkge1xuICAgICAgICAgICAgZGlyTmFtZSA9IG5hbWUucmVwbGFjZShiaW5kUkUsICcnKTtcbiAgICAgICAgICAgIGlmIChkaXJOYW1lID09PSAnc3R5bGUnIHx8IGRpck5hbWUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgICAgICAgcHVzaERpcihkaXJOYW1lLCBpbnRlcm5hbERpcmVjdGl2ZXNbZGlyTmFtZV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYXJnID0gZGlyTmFtZTtcbiAgICAgICAgICAgICAgcHVzaERpcignYmluZCcsIGRpcmVjdGl2ZXMuYmluZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlXG5cbiAgICAgICAgICAgIC8vIG5vcm1hbCBkaXJlY3RpdmVzXG4gICAgICAgICAgICBpZiAobWF0Y2hlZCA9IG5hbWUubWF0Y2goZGlyQXR0clJFKSkge1xuICAgICAgICAgICAgICBkaXJOYW1lID0gbWF0Y2hlZFsxXTtcbiAgICAgICAgICAgICAgYXJnID0gbWF0Y2hlZFsyXTtcblxuICAgICAgICAgICAgICAvLyBza2lwIHYtZWxzZSAod2hlbiB1c2VkIHdpdGggdi1zaG93KVxuICAgICAgICAgICAgICBpZiAoZGlyTmFtZSA9PT0gJ2Vsc2UnKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBkaXJEZWYgPSByZXNvbHZlQXNzZXQob3B0aW9ucywgJ2RpcmVjdGl2ZXMnLCBkaXJOYW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgaWYgKGRpckRlZikge1xuICAgICAgICAgICAgICAgIHB1c2hEaXIoZGlyTmFtZSwgZGlyRGVmKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFB1c2ggYSBkaXJlY3RpdmUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkaXJOYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBkZWZcbiAgICogQHBhcmFtIHtBcnJheX0gW2ludGVycFRva2Vuc11cbiAgICovXG5cbiAgZnVuY3Rpb24gcHVzaERpcihkaXJOYW1lLCBkZWYsIGludGVycFRva2Vucykge1xuICAgIHZhciBoYXNPbmVUaW1lVG9rZW4gPSBpbnRlcnBUb2tlbnMgJiYgaGFzT25lVGltZShpbnRlcnBUb2tlbnMpO1xuICAgIHZhciBwYXJzZWQgPSAhaGFzT25lVGltZVRva2VuICYmIHBhcnNlRGlyZWN0aXZlKHZhbHVlKTtcbiAgICBkaXJzLnB1c2goe1xuICAgICAgbmFtZTogZGlyTmFtZSxcbiAgICAgIGF0dHI6IHJhd05hbWUsXG4gICAgICByYXc6IHJhd1ZhbHVlLFxuICAgICAgZGVmOiBkZWYsXG4gICAgICBhcmc6IGFyZyxcbiAgICAgIG1vZGlmaWVyczogbW9kaWZpZXJzLFxuICAgICAgLy8gY29udmVyc2lvbiBmcm9tIGludGVycG9sYXRpb24gc3RyaW5ncyB3aXRoIG9uZS10aW1lIHRva2VuXG4gICAgICAvLyB0byBleHByZXNzaW9uIGlzIGRpZmZlcmVkIHVudGlsIGRpcmVjdGl2ZSBiaW5kIHRpbWUgc28gdGhhdCB3ZVxuICAgICAgLy8gaGF2ZSBhY2Nlc3MgdG8gdGhlIGFjdHVhbCB2bSBjb250ZXh0IGZvciBvbmUtdGltZSBiaW5kaW5ncy5cbiAgICAgIGV4cHJlc3Npb246IHBhcnNlZCAmJiBwYXJzZWQuZXhwcmVzc2lvbixcbiAgICAgIGZpbHRlcnM6IHBhcnNlZCAmJiBwYXJzZWQuZmlsdGVycyxcbiAgICAgIGludGVycDogaW50ZXJwVG9rZW5zLFxuICAgICAgaGFzT25lVGltZTogaGFzT25lVGltZVRva2VuXG4gICAgfSk7XG4gIH1cblxuICBpZiAoZGlycy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbWFrZU5vZGVMaW5rRm4oZGlycyk7XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSBtb2RpZmllcnMgZnJvbSBkaXJlY3RpdmUgYXR0cmlidXRlIG5hbWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBwYXJzZU1vZGlmaWVycyhuYW1lKSB7XG4gIHZhciByZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgbWF0Y2ggPSBuYW1lLm1hdGNoKG1vZGlmaWVyUkUpO1xuICBpZiAobWF0Y2gpIHtcbiAgICB2YXIgaSA9IG1hdGNoLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICByZXNbbWF0Y2hbaV0uc2xpY2UoMSldID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBCdWlsZCBhIGxpbmsgZnVuY3Rpb24gZm9yIGFsbCBkaXJlY3RpdmVzIG9uIGEgc2luZ2xlIG5vZGUuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gZGlyZWN0aXZlc1xuICogQHJldHVybiB7RnVuY3Rpb259IGRpcmVjdGl2ZXNMaW5rRm5cbiAqL1xuXG5mdW5jdGlvbiBtYWtlTm9kZUxpbmtGbihkaXJlY3RpdmVzKSB7XG4gIHJldHVybiBmdW5jdGlvbiBub2RlTGlua0ZuKHZtLCBlbCwgaG9zdCwgc2NvcGUsIGZyYWcpIHtcbiAgICAvLyByZXZlcnNlIGFwcGx5IGJlY2F1c2UgaXQncyBzb3J0ZWQgbG93IHRvIGhpZ2hcbiAgICB2YXIgaSA9IGRpcmVjdGl2ZXMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHZtLl9iaW5kRGlyKGRpcmVjdGl2ZXNbaV0sIGVsLCBob3N0LCBzY29wZSwgZnJhZyk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGFuIGludGVycG9sYXRpb24gc3RyaW5nIGNvbnRhaW5zIG9uZS10aW1lIHRva2Vucy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSB0b2tlbnNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaGFzT25lVGltZSh0b2tlbnMpIHtcbiAgdmFyIGkgPSB0b2tlbnMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgaWYgKHRva2Vuc1tpXS5vbmVUaW1lKSByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1NjcmlwdChlbCkge1xuICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1NDUklQVCcgJiYgKCFlbC5oYXNBdHRyaWJ1dGUoJ3R5cGUnKSB8fCBlbC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSA9PT0gJ3RleHQvamF2YXNjcmlwdCcpO1xufVxuXG52YXIgc3BlY2lhbENoYXJSRSA9IC9bXlxcd1xcLTpcXC5dLztcblxuLyoqXG4gKiBQcm9jZXNzIGFuIGVsZW1lbnQgb3IgYSBEb2N1bWVudEZyYWdtZW50IGJhc2VkIG9uIGFcbiAqIGluc3RhbmNlIG9wdGlvbiBvYmplY3QuIFRoaXMgYWxsb3dzIHVzIHRvIHRyYW5zY2x1ZGVcbiAqIGEgdGVtcGxhdGUgbm9kZS9mcmFnbWVudCBiZWZvcmUgdGhlIGluc3RhbmNlIGlzIGNyZWF0ZWQsXG4gKiBzbyB0aGUgcHJvY2Vzc2VkIGZyYWdtZW50IGNhbiB0aGVuIGJlIGNsb25lZCBhbmQgcmV1c2VkXG4gKiBpbiB2LWZvci5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fVxuICovXG5cbmZ1bmN0aW9uIHRyYW5zY2x1ZGUoZWwsIG9wdGlvbnMpIHtcbiAgLy8gZXh0cmFjdCBjb250YWluZXIgYXR0cmlidXRlcyB0byBwYXNzIHRoZW0gZG93blxuICAvLyB0byBjb21waWxlciwgYmVjYXVzZSB0aGV5IG5lZWQgdG8gYmUgY29tcGlsZWQgaW5cbiAgLy8gcGFyZW50IHNjb3BlLiB3ZSBhcmUgbXV0YXRpbmcgdGhlIG9wdGlvbnMgb2JqZWN0IGhlcmVcbiAgLy8gYXNzdW1pbmcgdGhlIHNhbWUgb2JqZWN0IHdpbGwgYmUgdXNlZCBmb3IgY29tcGlsZVxuICAvLyByaWdodCBhZnRlciB0aGlzLlxuICBpZiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMuX2NvbnRhaW5lckF0dHJzID0gZXh0cmFjdEF0dHJzKGVsKTtcbiAgfVxuICAvLyBmb3IgdGVtcGxhdGUgdGFncywgd2hhdCB3ZSB3YW50IGlzIGl0cyBjb250ZW50IGFzXG4gIC8vIGEgZG9jdW1lbnRGcmFnbWVudCAoZm9yIGZyYWdtZW50IGluc3RhbmNlcylcbiAgaWYgKGlzVGVtcGxhdGUoZWwpKSB7XG4gICAgZWwgPSBwYXJzZVRlbXBsYXRlKGVsKTtcbiAgfVxuICBpZiAob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLl9hc0NvbXBvbmVudCAmJiAhb3B0aW9ucy50ZW1wbGF0ZSkge1xuICAgICAgb3B0aW9ucy50ZW1wbGF0ZSA9ICc8c2xvdD48L3Nsb3Q+JztcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMudGVtcGxhdGUpIHtcbiAgICAgIG9wdGlvbnMuX2NvbnRlbnQgPSBleHRyYWN0Q29udGVudChlbCk7XG4gICAgICBlbCA9IHRyYW5zY2x1ZGVUZW1wbGF0ZShlbCwgb3B0aW9ucyk7XG4gICAgfVxuICB9XG4gIGlmIChpc0ZyYWdtZW50KGVsKSkge1xuICAgIC8vIGFuY2hvcnMgZm9yIGZyYWdtZW50IGluc3RhbmNlXG4gICAgLy8gcGFzc2luZyBpbiBgcGVyc2lzdDogdHJ1ZWAgdG8gYXZvaWQgdGhlbSBiZWluZ1xuICAgIC8vIGRpc2NhcmRlZCBieSBJRSBkdXJpbmcgdGVtcGxhdGUgY2xvbmluZ1xuICAgIHByZXBlbmQoY3JlYXRlQW5jaG9yKCd2LXN0YXJ0JywgdHJ1ZSksIGVsKTtcbiAgICBlbC5hcHBlbmRDaGlsZChjcmVhdGVBbmNob3IoJ3YtZW5kJywgdHJ1ZSkpO1xuICB9XG4gIHJldHVybiBlbDtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIHRoZSB0ZW1wbGF0ZSBvcHRpb24uXG4gKiBJZiB0aGUgcmVwbGFjZSBvcHRpb24gaXMgdHJ1ZSB0aGlzIHdpbGwgc3dhcCB0aGUgJGVsLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9XG4gKi9cblxuZnVuY3Rpb24gdHJhbnNjbHVkZVRlbXBsYXRlKGVsLCBvcHRpb25zKSB7XG4gIHZhciB0ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGU7XG4gIHZhciBmcmFnID0gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSwgdHJ1ZSk7XG4gIGlmIChmcmFnKSB7XG4gICAgdmFyIHJlcGxhY2VyID0gZnJhZy5maXJzdENoaWxkO1xuICAgIHZhciB0YWcgPSByZXBsYWNlci50YWdOYW1lICYmIHJlcGxhY2VyLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAob3B0aW9ucy5yZXBsYWNlKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChlbCA9PT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ1lvdSBhcmUgbW91bnRpbmcgYW4gaW5zdGFuY2Ugd2l0aCBhIHRlbXBsYXRlIHRvICcgKyAnPGJvZHk+LiBUaGlzIHdpbGwgcmVwbGFjZSA8Ym9keT4gZW50aXJlbHkuIFlvdSAnICsgJ3Nob3VsZCBwcm9iYWJseSB1c2UgYHJlcGxhY2U6IGZhbHNlYCBoZXJlLicpO1xuICAgICAgfVxuICAgICAgLy8gdGhlcmUgYXJlIG1hbnkgY2FzZXMgd2hlcmUgdGhlIGluc3RhbmNlIG11c3RcbiAgICAgIC8vIGJlY29tZSBhIGZyYWdtZW50IGluc3RhbmNlOiBiYXNpY2FsbHkgYW55dGhpbmcgdGhhdFxuICAgICAgLy8gY2FuIGNyZWF0ZSBtb3JlIHRoYW4gMSByb290IG5vZGVzLlxuICAgICAgaWYgKFxuICAgICAgLy8gbXVsdGktY2hpbGRyZW4gdGVtcGxhdGVcbiAgICAgIGZyYWcuY2hpbGROb2Rlcy5sZW5ndGggPiAxIHx8XG4gICAgICAvLyBub24tZWxlbWVudCB0ZW1wbGF0ZVxuICAgICAgcmVwbGFjZXIubm9kZVR5cGUgIT09IDEgfHxcbiAgICAgIC8vIHNpbmdsZSBuZXN0ZWQgY29tcG9uZW50XG4gICAgICB0YWcgPT09ICdjb21wb25lbnQnIHx8IHJlc29sdmVBc3NldChvcHRpb25zLCAnY29tcG9uZW50cycsIHRhZykgfHwgaGFzQmluZEF0dHIocmVwbGFjZXIsICdpcycpIHx8XG4gICAgICAvLyBlbGVtZW50IGRpcmVjdGl2ZVxuICAgICAgcmVzb2x2ZUFzc2V0KG9wdGlvbnMsICdlbGVtZW50RGlyZWN0aXZlcycsIHRhZykgfHxcbiAgICAgIC8vIGZvciBibG9ja1xuICAgICAgcmVwbGFjZXIuaGFzQXR0cmlidXRlKCd2LWZvcicpIHx8XG4gICAgICAvLyBpZiBibG9ja1xuICAgICAgcmVwbGFjZXIuaGFzQXR0cmlidXRlKCd2LWlmJykpIHtcbiAgICAgICAgcmV0dXJuIGZyYWc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcHRpb25zLl9yZXBsYWNlckF0dHJzID0gZXh0cmFjdEF0dHJzKHJlcGxhY2VyKTtcbiAgICAgICAgbWVyZ2VBdHRycyhlbCwgcmVwbGFjZXIpO1xuICAgICAgICByZXR1cm4gcmVwbGFjZXI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmFwcGVuZENoaWxkKGZyYWcpO1xuICAgICAgcmV0dXJuIGVsO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oJ0ludmFsaWQgdGVtcGxhdGUgb3B0aW9uOiAnICsgdGVtcGxhdGUpO1xuICB9XG59XG5cbi8qKlxuICogSGVscGVyIHRvIGV4dHJhY3QgYSBjb21wb25lbnQgY29udGFpbmVyJ3MgYXR0cmlidXRlc1xuICogaW50byBhIHBsYWluIG9iamVjdCBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiBleHRyYWN0QXR0cnMoZWwpIHtcbiAgaWYgKGVsLm5vZGVUeXBlID09PSAxICYmIGVsLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgIHJldHVybiB0b0FycmF5KGVsLmF0dHJpYnV0ZXMpO1xuICB9XG59XG5cbi8qKlxuICogTWVyZ2UgdGhlIGF0dHJpYnV0ZXMgb2YgdHdvIGVsZW1lbnRzLCBhbmQgbWFrZSBzdXJlXG4gKiB0aGUgY2xhc3MgbmFtZXMgYXJlIG1lcmdlZCBwcm9wZXJseS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGZyb21cbiAqIEBwYXJhbSB7RWxlbWVudH0gdG9cbiAqL1xuXG5mdW5jdGlvbiBtZXJnZUF0dHJzKGZyb20sIHRvKSB7XG4gIHZhciBhdHRycyA9IGZyb20uYXR0cmlidXRlcztcbiAgdmFyIGkgPSBhdHRycy5sZW5ndGg7XG4gIHZhciBuYW1lLCB2YWx1ZTtcbiAgd2hpbGUgKGktLSkge1xuICAgIG5hbWUgPSBhdHRyc1tpXS5uYW1lO1xuICAgIHZhbHVlID0gYXR0cnNbaV0udmFsdWU7XG4gICAgaWYgKCF0by5oYXNBdHRyaWJ1dGUobmFtZSkgJiYgIXNwZWNpYWxDaGFyUkUudGVzdChuYW1lKSkge1xuICAgICAgdG8uc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdjbGFzcycgJiYgIXBhcnNlVGV4dCh2YWx1ZSkgJiYgKHZhbHVlID0gdmFsdWUudHJpbSgpKSkge1xuICAgICAgdmFsdWUuc3BsaXQoL1xccysvKS5mb3JFYWNoKGZ1bmN0aW9uIChjbHMpIHtcbiAgICAgICAgYWRkQ2xhc3ModG8sIGNscyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBTY2FuIGFuZCBkZXRlcm1pbmUgc2xvdCBjb250ZW50IGRpc3RyaWJ1dGlvbi5cbiAqIFdlIGRvIHRoaXMgZHVyaW5nIHRyYW5zY2x1c2lvbiBpbnN0ZWFkIGF0IGNvbXBpbGUgdGltZSBzbyB0aGF0XG4gKiB0aGUgZGlzdHJpYnV0aW9uIGlzIGRlY291cGxlZCBmcm9tIHRoZSBjb21waWxhdGlvbiBvcmRlciBvZlxuICogdGhlIHNsb3RzLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fSB0ZW1wbGF0ZVxuICogQHBhcmFtIHtFbGVtZW50fSBjb250ZW50XG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqL1xuXG5mdW5jdGlvbiByZXNvbHZlU2xvdHModm0sIGNvbnRlbnQpIHtcbiAgaWYgKCFjb250ZW50KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBjb250ZW50cyA9IHZtLl9zbG90Q29udGVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgZWwsIG5hbWU7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gY29udGVudC5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBlbCA9IGNvbnRlbnQuY2hpbGRyZW5baV07XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uZC1hc3NpZ24gKi9cbiAgICBpZiAobmFtZSA9IGVsLmdldEF0dHJpYnV0ZSgnc2xvdCcpKSB7XG4gICAgICAoY29udGVudHNbbmFtZV0gfHwgKGNvbnRlbnRzW25hbWVdID0gW10pKS5wdXNoKGVsKTtcbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1jb25kLWFzc2lnbiAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIGdldEJpbmRBdHRyKGVsLCAnc2xvdCcpKSB7XG4gICAgICB3YXJuKCdUaGUgXCJzbG90XCIgYXR0cmlidXRlIG11c3QgYmUgc3RhdGljLicsIHZtLiRwYXJlbnQpO1xuICAgIH1cbiAgfVxuICBmb3IgKG5hbWUgaW4gY29udGVudHMpIHtcbiAgICBjb250ZW50c1tuYW1lXSA9IGV4dHJhY3RGcmFnbWVudChjb250ZW50c1tuYW1lXSwgY29udGVudCk7XG4gIH1cbiAgaWYgKGNvbnRlbnQuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgdmFyIG5vZGVzID0gY29udGVudC5jaGlsZE5vZGVzO1xuICAgIGlmIChub2Rlcy5sZW5ndGggPT09IDEgJiYgbm9kZXNbMF0ubm9kZVR5cGUgPT09IDMgJiYgIW5vZGVzWzBdLmRhdGEudHJpbSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnRlbnRzWydkZWZhdWx0J10gPSBleHRyYWN0RnJhZ21lbnQoY29udGVudC5jaGlsZE5vZGVzLCBjb250ZW50KTtcbiAgfVxufVxuXG4vKipcbiAqIEV4dHJhY3QgcXVhbGlmaWVkIGNvbnRlbnQgbm9kZXMgZnJvbSBhIG5vZGUgbGlzdC5cbiAqXG4gKiBAcGFyYW0ge05vZGVMaXN0fSBub2Rlc1xuICogQHJldHVybiB7RG9jdW1lbnRGcmFnbWVudH1cbiAqL1xuXG5mdW5jdGlvbiBleHRyYWN0RnJhZ21lbnQobm9kZXMsIHBhcmVudCkge1xuICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgbm9kZXMgPSB0b0FycmF5KG5vZGVzKTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2Rlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xuICAgIGlmIChpc1RlbXBsYXRlKG5vZGUpICYmICFub2RlLmhhc0F0dHJpYnV0ZSgndi1pZicpICYmICFub2RlLmhhc0F0dHJpYnV0ZSgndi1mb3InKSkge1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgbm9kZSA9IHBhcnNlVGVtcGxhdGUobm9kZSwgdHJ1ZSk7XG4gICAgfVxuICAgIGZyYWcuYXBwZW5kQ2hpbGQobm9kZSk7XG4gIH1cbiAgcmV0dXJuIGZyYWc7XG59XG5cblxuXG52YXIgY29tcGlsZXIgPSBPYmplY3QuZnJlZXplKHtcblx0Y29tcGlsZTogY29tcGlsZSxcblx0Y29tcGlsZUFuZExpbmtQcm9wczogY29tcGlsZUFuZExpbmtQcm9wcyxcblx0Y29tcGlsZVJvb3Q6IGNvbXBpbGVSb290LFxuXHR0cmFuc2NsdWRlOiB0cmFuc2NsdWRlLFxuXHRyZXNvbHZlU2xvdHM6IHJlc29sdmVTbG90c1xufSk7XG5cbmZ1bmN0aW9uIHN0YXRlTWl4aW4gKFZ1ZSkge1xuICAvKipcbiAgICogQWNjZXNzb3IgZm9yIGAkZGF0YWAgcHJvcGVydHksIHNpbmNlIHNldHRpbmcgJGRhdGFcbiAgICogcmVxdWlyZXMgb2JzZXJ2aW5nIHRoZSBuZXcgb2JqZWN0IGFuZCB1cGRhdGluZ1xuICAgKiBwcm94aWVkIHByb3BlcnRpZXMuXG4gICAqL1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShWdWUucHJvdG90eXBlLCAnJGRhdGEnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gc2V0KG5ld0RhdGEpIHtcbiAgICAgIGlmIChuZXdEYXRhICE9PSB0aGlzLl9kYXRhKSB7XG4gICAgICAgIHRoaXMuX3NldERhdGEobmV3RGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvKipcbiAgICogU2V0dXAgdGhlIHNjb3BlIG9mIGFuIGluc3RhbmNlLCB3aGljaCBjb250YWluczpcbiAgICogLSBvYnNlcnZlZCBkYXRhXG4gICAqIC0gY29tcHV0ZWQgcHJvcGVydGllc1xuICAgKiAtIHVzZXIgbWV0aG9kc1xuICAgKiAtIG1ldGEgcHJvcGVydGllc1xuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9pbml0U3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5faW5pdFByb3BzKCk7XG4gICAgdGhpcy5faW5pdE1ldGEoKTtcbiAgICB0aGlzLl9pbml0TWV0aG9kcygpO1xuICAgIHRoaXMuX2luaXREYXRhKCk7XG4gICAgdGhpcy5faW5pdENvbXB1dGVkKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgcHJvcHMuXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX2luaXRQcm9wcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuJG9wdGlvbnM7XG4gICAgdmFyIGVsID0gb3B0aW9ucy5lbDtcbiAgICB2YXIgcHJvcHMgPSBvcHRpb25zLnByb3BzO1xuICAgIGlmIChwcm9wcyAmJiAhZWwpIHtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignUHJvcHMgd2lsbCBub3QgYmUgY29tcGlsZWQgaWYgbm8gYGVsYCBvcHRpb24gaXMgJyArICdwcm92aWRlZCBhdCBpbnN0YW50aWF0aW9uLicsIHRoaXMpO1xuICAgIH1cbiAgICAvLyBtYWtlIHN1cmUgdG8gY29udmVydCBzdHJpbmcgc2VsZWN0b3JzIGludG8gZWxlbWVudCBub3dcbiAgICBlbCA9IG9wdGlvbnMuZWwgPSBxdWVyeShlbCk7XG4gICAgdGhpcy5fcHJvcHNVbmxpbmtGbiA9IGVsICYmIGVsLm5vZGVUeXBlID09PSAxICYmIHByb3BzXG4gICAgLy8gcHJvcHMgbXVzdCBiZSBsaW5rZWQgaW4gcHJvcGVyIHNjb3BlIGlmIGluc2lkZSB2LWZvclxuICAgID8gY29tcGlsZUFuZExpbmtQcm9wcyh0aGlzLCBlbCwgcHJvcHMsIHRoaXMuX3Njb3BlKSA6IG51bGw7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgdGhlIGRhdGEuXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX2luaXREYXRhID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkYXRhRm4gPSB0aGlzLiRvcHRpb25zLmRhdGE7XG4gICAgdmFyIGRhdGEgPSB0aGlzLl9kYXRhID0gZGF0YUZuID8gZGF0YUZuKCkgOiB7fTtcbiAgICBpZiAoIWlzUGxhaW5PYmplY3QoZGF0YSkpIHtcbiAgICAgIGRhdGEgPSB7fTtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignZGF0YSBmdW5jdGlvbnMgc2hvdWxkIHJldHVybiBhbiBvYmplY3QuJywgdGhpcyk7XG4gICAgfVxuICAgIHZhciBwcm9wcyA9IHRoaXMuX3Byb3BzO1xuICAgIC8vIHByb3h5IGRhdGEgb24gaW5zdGFuY2VcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xuICAgIHZhciBpLCBrZXk7XG4gICAgaSA9IGtleXMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAvLyB0aGVyZSBhcmUgdHdvIHNjZW5hcmlvcyB3aGVyZSB3ZSBjYW4gcHJveHkgYSBkYXRhIGtleTpcbiAgICAgIC8vIDEuIGl0J3Mgbm90IGFscmVhZHkgZGVmaW5lZCBhcyBhIHByb3BcbiAgICAgIC8vIDIuIGl0J3MgcHJvdmlkZWQgdmlhIGEgaW5zdGFudGlhdGlvbiBvcHRpb24gQU5EIHRoZXJlIGFyZSBub1xuICAgICAgLy8gICAgdGVtcGxhdGUgcHJvcCBwcmVzZW50XG4gICAgICBpZiAoIXByb3BzIHx8ICFoYXNPd24ocHJvcHMsIGtleSkpIHtcbiAgICAgICAgdGhpcy5fcHJveHkoa2V5KTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICB3YXJuKCdEYXRhIGZpZWxkIFwiJyArIGtleSArICdcIiBpcyBhbHJlYWR5IGRlZmluZWQgJyArICdhcyBhIHByb3AuIFRvIHByb3ZpZGUgZGVmYXVsdCB2YWx1ZSBmb3IgYSBwcm9wLCB1c2UgdGhlIFwiZGVmYXVsdFwiICcgKyAncHJvcCBvcHRpb247IGlmIHlvdSB3YW50IHRvIHBhc3MgcHJvcCB2YWx1ZXMgdG8gYW4gaW5zdGFudGlhdGlvbiAnICsgJ2NhbGwsIHVzZSB0aGUgXCJwcm9wc0RhdGFcIiBvcHRpb24uJywgdGhpcyk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIG9ic2VydmUgZGF0YVxuICAgIG9ic2VydmUoZGF0YSwgdGhpcyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFN3YXAgdGhlIGluc3RhbmNlJ3MgJGRhdGEuIENhbGxlZCBpbiAkZGF0YSdzIHNldHRlci5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG5ld0RhdGFcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5fc2V0RGF0YSA9IGZ1bmN0aW9uIChuZXdEYXRhKSB7XG4gICAgbmV3RGF0YSA9IG5ld0RhdGEgfHwge307XG4gICAgdmFyIG9sZERhdGEgPSB0aGlzLl9kYXRhO1xuICAgIHRoaXMuX2RhdGEgPSBuZXdEYXRhO1xuICAgIHZhciBrZXlzLCBrZXksIGk7XG4gICAgLy8gdW5wcm94eSBrZXlzIG5vdCBwcmVzZW50IGluIG5ldyBkYXRhXG4gICAga2V5cyA9IE9iamVjdC5rZXlzKG9sZERhdGEpO1xuICAgIGkgPSBrZXlzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKCEoa2V5IGluIG5ld0RhdGEpKSB7XG4gICAgICAgIHRoaXMuX3VucHJveHkoa2V5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gcHJveHkga2V5cyBub3QgYWxyZWFkeSBwcm94aWVkLFxuICAgIC8vIGFuZCB0cmlnZ2VyIGNoYW5nZSBmb3IgY2hhbmdlZCB2YWx1ZXNcbiAgICBrZXlzID0gT2JqZWN0LmtleXMobmV3RGF0YSk7XG4gICAgaSA9IGtleXMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICBpZiAoIWhhc093bih0aGlzLCBrZXkpKSB7XG4gICAgICAgIC8vIG5ldyBwcm9wZXJ0eVxuICAgICAgICB0aGlzLl9wcm94eShrZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBvbGREYXRhLl9fb2JfXy5yZW1vdmVWbSh0aGlzKTtcbiAgICBvYnNlcnZlKG5ld0RhdGEsIHRoaXMpO1xuICAgIHRoaXMuX2RpZ2VzdCgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQcm94eSBhIHByb3BlcnR5LCBzbyB0aGF0XG4gICAqIHZtLnByb3AgPT09IHZtLl9kYXRhLnByb3BcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9wcm94eSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoIWlzUmVzZXJ2ZWQoa2V5KSkge1xuICAgICAgLy8gbmVlZCB0byBzdG9yZSByZWYgdG8gc2VsZiBoZXJlXG4gICAgICAvLyBiZWNhdXNlIHRoZXNlIGdldHRlci9zZXR0ZXJzIG1pZ2h0XG4gICAgICAvLyBiZSBjYWxsZWQgYnkgY2hpbGQgc2NvcGVzIHZpYVxuICAgICAgLy8gcHJvdG90eXBlIGluaGVyaXRhbmNlLlxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlbGYsIGtleSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gcHJveHlHZXR0ZXIoKSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuX2RhdGFba2V5XTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiBwcm94eVNldHRlcih2YWwpIHtcbiAgICAgICAgICBzZWxmLl9kYXRhW2tleV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVW5wcm94eSBhIHByb3BlcnR5LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX3VucHJveHkgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKCFpc1Jlc2VydmVkKGtleSkpIHtcbiAgICAgIGRlbGV0ZSB0aGlzW2tleV07XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBGb3JjZSB1cGRhdGUgb24gZXZlcnkgd2F0Y2hlciBpbiBzY29wZS5cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5fZGlnZXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5fd2F0Y2hlcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0aGlzLl93YXRjaGVyc1tpXS51cGRhdGUodHJ1ZSk7IC8vIHNoYWxsb3cgdXBkYXRlc1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogU2V0dXAgY29tcHV0ZWQgcHJvcGVydGllcy4gVGhleSBhcmUgZXNzZW50aWFsbHlcbiAgICogc3BlY2lhbCBnZXR0ZXIvc2V0dGVyc1xuICAgKi9cblxuICBmdW5jdGlvbiBub29wKCkge31cbiAgVnVlLnByb3RvdHlwZS5faW5pdENvbXB1dGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb21wdXRlZCA9IHRoaXMuJG9wdGlvbnMuY29tcHV0ZWQ7XG4gICAgaWYgKGNvbXB1dGVkKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gY29tcHV0ZWQpIHtcbiAgICAgICAgdmFyIHVzZXJEZWYgPSBjb21wdXRlZFtrZXldO1xuICAgICAgICB2YXIgZGVmID0ge1xuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlb2YgdXNlckRlZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGRlZi5nZXQgPSBtYWtlQ29tcHV0ZWRHZXR0ZXIodXNlckRlZiwgdGhpcyk7XG4gICAgICAgICAgZGVmLnNldCA9IG5vb3A7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmLmdldCA9IHVzZXJEZWYuZ2V0ID8gdXNlckRlZi5jYWNoZSAhPT0gZmFsc2UgPyBtYWtlQ29tcHV0ZWRHZXR0ZXIodXNlckRlZi5nZXQsIHRoaXMpIDogYmluZCh1c2VyRGVmLmdldCwgdGhpcykgOiBub29wO1xuICAgICAgICAgIGRlZi5zZXQgPSB1c2VyRGVmLnNldCA/IGJpbmQodXNlckRlZi5zZXQsIHRoaXMpIDogbm9vcDtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCBkZWYpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlQ29tcHV0ZWRHZXR0ZXIoZ2V0dGVyLCBvd25lcikge1xuICAgIHZhciB3YXRjaGVyID0gbmV3IFdhdGNoZXIob3duZXIsIGdldHRlciwgbnVsbCwge1xuICAgICAgbGF6eTogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBmdW5jdGlvbiBjb21wdXRlZEdldHRlcigpIHtcbiAgICAgIGlmICh3YXRjaGVyLmRpcnR5KSB7XG4gICAgICAgIHdhdGNoZXIuZXZhbHVhdGUoKTtcbiAgICAgIH1cbiAgICAgIGlmIChEZXAudGFyZ2V0KSB7XG4gICAgICAgIHdhdGNoZXIuZGVwZW5kKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gd2F0Y2hlci52YWx1ZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHVwIGluc3RhbmNlIG1ldGhvZHMuIE1ldGhvZHMgbXVzdCBiZSBib3VuZCB0byB0aGVcbiAgICogaW5zdGFuY2Ugc2luY2UgdGhleSBtaWdodCBiZSBwYXNzZWQgZG93biBhcyBhIHByb3AgdG9cbiAgICogY2hpbGQgY29tcG9uZW50cy5cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5faW5pdE1ldGhvZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1ldGhvZHMgPSB0aGlzLiRvcHRpb25zLm1ldGhvZHM7XG4gICAgaWYgKG1ldGhvZHMpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBtZXRob2RzKSB7XG4gICAgICAgIHRoaXNba2V5XSA9IGJpbmQobWV0aG9kc1trZXldLCB0aGlzKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgbWV0YSBpbmZvcm1hdGlvbiBsaWtlICRpbmRleCwgJGtleSAmICR2YWx1ZS5cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5faW5pdE1ldGEgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1ldGFzID0gdGhpcy4kb3B0aW9ucy5fbWV0YTtcbiAgICBpZiAobWV0YXMpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBtZXRhcykge1xuICAgICAgICBkZWZpbmVSZWFjdGl2ZSh0aGlzLCBrZXksIG1ldGFzW2tleV0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxudmFyIGV2ZW50UkUgPSAvXnYtb246fF5ALztcblxuZnVuY3Rpb24gZXZlbnRzTWl4aW4gKFZ1ZSkge1xuICAvKipcbiAgICogU2V0dXAgdGhlIGluc3RhbmNlJ3Mgb3B0aW9uIGV2ZW50cyAmIHdhdGNoZXJzLlxuICAgKiBJZiB0aGUgdmFsdWUgaXMgYSBzdHJpbmcsIHdlIHB1bGwgaXQgZnJvbSB0aGVcbiAgICogaW5zdGFuY2UncyBtZXRob2RzIGJ5IG5hbWUuXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX2luaXRFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLiRvcHRpb25zO1xuICAgIGlmIChvcHRpb25zLl9hc0NvbXBvbmVudCkge1xuICAgICAgcmVnaXN0ZXJDb21wb25lbnRFdmVudHModGhpcywgb3B0aW9ucy5lbCk7XG4gICAgfVxuICAgIHJlZ2lzdGVyQ2FsbGJhY2tzKHRoaXMsICckb24nLCBvcHRpb25zLmV2ZW50cyk7XG4gICAgcmVnaXN0ZXJDYWxsYmFja3ModGhpcywgJyR3YXRjaCcsIG9wdGlvbnMud2F0Y2gpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciB2LW9uIGV2ZW50cyBvbiBhIGNoaWxkIGNvbXBvbmVudFxuICAgKlxuICAgKiBAcGFyYW0ge1Z1ZX0gdm1cbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICAgKi9cblxuICBmdW5jdGlvbiByZWdpc3RlckNvbXBvbmVudEV2ZW50cyh2bSwgZWwpIHtcbiAgICB2YXIgYXR0cnMgPSBlbC5hdHRyaWJ1dGVzO1xuICAgIHZhciBuYW1lLCB2YWx1ZSwgaGFuZGxlcjtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGF0dHJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgbmFtZSA9IGF0dHJzW2ldLm5hbWU7XG4gICAgICBpZiAoZXZlbnRSRS50ZXN0KG5hbWUpKSB7XG4gICAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoZXZlbnRSRSwgJycpO1xuICAgICAgICAvLyBmb3JjZSB0aGUgZXhwcmVzc2lvbiBpbnRvIGEgc3RhdGVtZW50IHNvIHRoYXRcbiAgICAgICAgLy8gaXQgYWx3YXlzIGR5bmFtaWNhbGx5IHJlc29sdmVzIHRoZSBtZXRob2QgdG8gY2FsbCAoIzI2NzApXG4gICAgICAgIC8vIGtpbmRhIHVnbHkgaGFjaywgYnV0IGRvZXMgdGhlIGpvYi5cbiAgICAgICAgdmFsdWUgPSBhdHRyc1tpXS52YWx1ZTtcbiAgICAgICAgaWYgKGlzU2ltcGxlUGF0aCh2YWx1ZSkpIHtcbiAgICAgICAgICB2YWx1ZSArPSAnLmFwcGx5KHRoaXMsICRhcmd1bWVudHMpJztcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVyID0gKHZtLl9zY29wZSB8fCB2bS5fY29udGV4dCkuJGV2YWwodmFsdWUsIHRydWUpO1xuICAgICAgICBoYW5kbGVyLl9mcm9tUGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgdm0uJG9uKG5hbWUucmVwbGFjZShldmVudFJFKSwgaGFuZGxlcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGNhbGxiYWNrcyBmb3Igb3B0aW9uIGV2ZW50cyBhbmQgd2F0Y2hlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7VnVlfSB2bVxuICAgKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBoYXNoXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyQ2FsbGJhY2tzKHZtLCBhY3Rpb24sIGhhc2gpIHtcbiAgICBpZiAoIWhhc2gpIHJldHVybjtcbiAgICB2YXIgaGFuZGxlcnMsIGtleSwgaSwgajtcbiAgICBmb3IgKGtleSBpbiBoYXNoKSB7XG4gICAgICBoYW5kbGVycyA9IGhhc2hba2V5XTtcbiAgICAgIGlmIChpc0FycmF5KGhhbmRsZXJzKSkge1xuICAgICAgICBmb3IgKGkgPSAwLCBqID0gaGFuZGxlcnMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgcmVnaXN0ZXIodm0sIGFjdGlvbiwga2V5LCBoYW5kbGVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZ2lzdGVyKHZtLCBhY3Rpb24sIGtleSwgaGFuZGxlcnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgdG8gcmVnaXN0ZXIgYW4gZXZlbnQvd2F0Y2ggY2FsbGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7VnVlfSB2bVxuICAgKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd8T2JqZWN0fSBoYW5kbGVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXIodm0sIGFjdGlvbiwga2V5LCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgaGFuZGxlcjtcbiAgICBpZiAodHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdm1bYWN0aW9uXShrZXksIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBtZXRob2RzID0gdm0uJG9wdGlvbnMubWV0aG9kcztcbiAgICAgIHZhciBtZXRob2QgPSBtZXRob2RzICYmIG1ldGhvZHNbaGFuZGxlcl07XG4gICAgICBpZiAobWV0aG9kKSB7XG4gICAgICAgIHZtW2FjdGlvbl0oa2V5LCBtZXRob2QsIG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCdVbmtub3duIG1ldGhvZDogXCInICsgaGFuZGxlciArICdcIiB3aGVuICcgKyAncmVnaXN0ZXJpbmcgY2FsbGJhY2sgZm9yICcgKyBhY3Rpb24gKyAnOiBcIicgKyBrZXkgKyAnXCIuJywgdm0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaGFuZGxlciAmJiB0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgcmVnaXN0ZXIodm0sIGFjdGlvbiwga2V5LCBoYW5kbGVyLmhhbmRsZXIsIGhhbmRsZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXR1cCByZWN1cnNpdmUgYXR0YWNoZWQvZGV0YWNoZWQgY2FsbHNcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5faW5pdERPTUhvb2tzID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuJG9uKCdob29rOmF0dGFjaGVkJywgb25BdHRhY2hlZCk7XG4gICAgdGhpcy4kb24oJ2hvb2s6ZGV0YWNoZWQnLCBvbkRldGFjaGVkKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGJhY2sgdG8gcmVjdXJzaXZlbHkgY2FsbCBhdHRhY2hlZCBob29rIG9uIGNoaWxkcmVuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIG9uQXR0YWNoZWQoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0F0dGFjaGVkKSB7XG4gICAgICB0aGlzLl9pc0F0dGFjaGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuJGNoaWxkcmVuLmZvckVhY2goY2FsbEF0dGFjaCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdG9yIHRvIGNhbGwgYXR0YWNoZWQgaG9va1xuICAgKlxuICAgKiBAcGFyYW0ge1Z1ZX0gY2hpbGRcbiAgICovXG5cbiAgZnVuY3Rpb24gY2FsbEF0dGFjaChjaGlsZCkge1xuICAgIGlmICghY2hpbGQuX2lzQXR0YWNoZWQgJiYgaW5Eb2MoY2hpbGQuJGVsKSkge1xuICAgICAgY2hpbGQuX2NhbGxIb29rKCdhdHRhY2hlZCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayB0byByZWN1cnNpdmVseSBjYWxsIGRldGFjaGVkIGhvb2sgb24gY2hpbGRyZW5cbiAgICovXG5cbiAgZnVuY3Rpb24gb25EZXRhY2hlZCgpIHtcbiAgICBpZiAodGhpcy5faXNBdHRhY2hlZCkge1xuICAgICAgdGhpcy5faXNBdHRhY2hlZCA9IGZhbHNlO1xuICAgICAgdGhpcy4kY2hpbGRyZW4uZm9yRWFjaChjYWxsRGV0YWNoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0b3IgdG8gY2FsbCBkZXRhY2hlZCBob29rXG4gICAqXG4gICAqIEBwYXJhbSB7VnVlfSBjaGlsZFxuICAgKi9cblxuICBmdW5jdGlvbiBjYWxsRGV0YWNoKGNoaWxkKSB7XG4gICAgaWYgKGNoaWxkLl9pc0F0dGFjaGVkICYmICFpbkRvYyhjaGlsZC4kZWwpKSB7XG4gICAgICBjaGlsZC5fY2FsbEhvb2soJ2RldGFjaGVkJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYWxsIGhhbmRsZXJzIGZvciBhIGhvb2tcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGhvb2tcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5fY2FsbEhvb2sgPSBmdW5jdGlvbiAoaG9vaykge1xuICAgIHRoaXMuJGVtaXQoJ3ByZS1ob29rOicgKyBob29rKTtcbiAgICB2YXIgaGFuZGxlcnMgPSB0aGlzLiRvcHRpb25zW2hvb2tdO1xuICAgIGlmIChoYW5kbGVycykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBoYW5kbGVycy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgaGFuZGxlcnNbaV0uY2FsbCh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy4kZW1pdCgnaG9vazonICsgaG9vayk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG5vb3AkMSgpIHt9XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgbGlua3MgYSBET00gZWxlbWVudCB3aXRoIGEgcGllY2Ugb2YgZGF0YSxcbiAqIHdoaWNoIGlzIHRoZSByZXN1bHQgb2YgZXZhbHVhdGluZyBhbiBleHByZXNzaW9uLlxuICogSXQgcmVnaXN0ZXJzIGEgd2F0Y2hlciB3aXRoIHRoZSBleHByZXNzaW9uIGFuZCBjYWxsc1xuICogdGhlIERPTSB1cGRhdGUgZnVuY3Rpb24gd2hlbiBhIGNoYW5nZSBpcyB0cmlnZ2VyZWQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlc2NyaXB0b3JcbiAqICAgICAgICAgICAgICAgICAtIHtTdHJpbmd9IG5hbWVcbiAqICAgICAgICAgICAgICAgICAtIHtPYmplY3R9IGRlZlxuICogICAgICAgICAgICAgICAgIC0ge1N0cmluZ30gZXhwcmVzc2lvblxuICogICAgICAgICAgICAgICAgIC0ge0FycmF5PE9iamVjdD59IFtmaWx0ZXJzXVxuICogICAgICAgICAgICAgICAgIC0ge09iamVjdH0gW21vZGlmaWVyc11cbiAqICAgICAgICAgICAgICAgICAtIHtCb29sZWFufSBsaXRlcmFsXG4gKiAgICAgICAgICAgICAgICAgLSB7U3RyaW5nfSBhdHRyXG4gKiAgICAgICAgICAgICAgICAgLSB7U3RyaW5nfSBhcmdcbiAqICAgICAgICAgICAgICAgICAtIHtTdHJpbmd9IHJhd1xuICogICAgICAgICAgICAgICAgIC0ge1N0cmluZ30gW3JlZl1cbiAqICAgICAgICAgICAgICAgICAtIHtBcnJheTxPYmplY3Q+fSBbaW50ZXJwXVxuICogICAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IFtoYXNPbmVUaW1lXVxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge05vZGV9IGVsXG4gKiBAcGFyYW0ge1Z1ZX0gW2hvc3RdIC0gdHJhbnNjbHVzaW9uIGhvc3QgY29tcG9uZW50XG4gKiBAcGFyYW0ge09iamVjdH0gW3Njb3BlXSAtIHYtZm9yIHNjb3BlXG4gKiBAcGFyYW0ge0ZyYWdtZW50fSBbZnJhZ10gLSBvd25lciBmcmFnbWVudFxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIERpcmVjdGl2ZShkZXNjcmlwdG9yLCB2bSwgZWwsIGhvc3QsIHNjb3BlLCBmcmFnKSB7XG4gIHRoaXMudm0gPSB2bTtcbiAgdGhpcy5lbCA9IGVsO1xuICAvLyBjb3B5IGRlc2NyaXB0b3IgcHJvcGVydGllc1xuICB0aGlzLmRlc2NyaXB0b3IgPSBkZXNjcmlwdG9yO1xuICB0aGlzLm5hbWUgPSBkZXNjcmlwdG9yLm5hbWU7XG4gIHRoaXMuZXhwcmVzc2lvbiA9IGRlc2NyaXB0b3IuZXhwcmVzc2lvbjtcbiAgdGhpcy5hcmcgPSBkZXNjcmlwdG9yLmFyZztcbiAgdGhpcy5tb2RpZmllcnMgPSBkZXNjcmlwdG9yLm1vZGlmaWVycztcbiAgdGhpcy5maWx0ZXJzID0gZGVzY3JpcHRvci5maWx0ZXJzO1xuICB0aGlzLmxpdGVyYWwgPSB0aGlzLm1vZGlmaWVycyAmJiB0aGlzLm1vZGlmaWVycy5saXRlcmFsO1xuICAvLyBwcml2YXRlXG4gIHRoaXMuX2xvY2tlZCA9IGZhbHNlO1xuICB0aGlzLl9ib3VuZCA9IGZhbHNlO1xuICB0aGlzLl9saXN0ZW5lcnMgPSBudWxsO1xuICAvLyBsaW5rIGNvbnRleHRcbiAgdGhpcy5faG9zdCA9IGhvc3Q7XG4gIHRoaXMuX3Njb3BlID0gc2NvcGU7XG4gIHRoaXMuX2ZyYWcgPSBmcmFnO1xuICAvLyBzdG9yZSBkaXJlY3RpdmVzIG9uIG5vZGUgaW4gZGV2IG1vZGVcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdGhpcy5lbCkge1xuICAgIHRoaXMuZWwuX3Z1ZV9kaXJlY3RpdmVzID0gdGhpcy5lbC5fdnVlX2RpcmVjdGl2ZXMgfHwgW107XG4gICAgdGhpcy5lbC5fdnVlX2RpcmVjdGl2ZXMucHVzaCh0aGlzKTtcbiAgfVxufVxuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIGRpcmVjdGl2ZSwgbWl4aW4gZGVmaW5pdGlvbiBwcm9wZXJ0aWVzLFxuICogc2V0dXAgdGhlIHdhdGNoZXIsIGNhbGwgZGVmaW5pdGlvbiBiaW5kKCkgYW5kIHVwZGF0ZSgpXG4gKiBpZiBwcmVzZW50LlxuICovXG5cbkRpcmVjdGl2ZS5wcm90b3R5cGUuX2JpbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBuYW1lID0gdGhpcy5uYW1lO1xuICB2YXIgZGVzY3JpcHRvciA9IHRoaXMuZGVzY3JpcHRvcjtcblxuICAvLyByZW1vdmUgYXR0cmlidXRlXG4gIGlmICgobmFtZSAhPT0gJ2Nsb2FrJyB8fCB0aGlzLnZtLl9pc0NvbXBpbGVkKSAmJiB0aGlzLmVsICYmIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKSB7XG4gICAgdmFyIGF0dHIgPSBkZXNjcmlwdG9yLmF0dHIgfHwgJ3YtJyArIG5hbWU7XG4gICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cik7XG4gIH1cblxuICAvLyBjb3B5IGRlZiBwcm9wZXJ0aWVzXG4gIHZhciBkZWYgPSBkZXNjcmlwdG9yLmRlZjtcbiAgaWYgKHR5cGVvZiBkZWYgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0aGlzLnVwZGF0ZSA9IGRlZjtcbiAgfSBlbHNlIHtcbiAgICBleHRlbmQodGhpcywgZGVmKTtcbiAgfVxuXG4gIC8vIHNldHVwIGRpcmVjdGl2ZSBwYXJhbXNcbiAgdGhpcy5fc2V0dXBQYXJhbXMoKTtcblxuICAvLyBpbml0aWFsIGJpbmRcbiAgaWYgKHRoaXMuYmluZCkge1xuICAgIHRoaXMuYmluZCgpO1xuICB9XG4gIHRoaXMuX2JvdW5kID0gdHJ1ZTtcblxuICBpZiAodGhpcy5saXRlcmFsKSB7XG4gICAgdGhpcy51cGRhdGUgJiYgdGhpcy51cGRhdGUoZGVzY3JpcHRvci5yYXcpO1xuICB9IGVsc2UgaWYgKCh0aGlzLmV4cHJlc3Npb24gfHwgdGhpcy5tb2RpZmllcnMpICYmICh0aGlzLnVwZGF0ZSB8fCB0aGlzLnR3b1dheSkgJiYgIXRoaXMuX2NoZWNrU3RhdGVtZW50KCkpIHtcbiAgICAvLyB3cmFwcGVkIHVwZGF0ZXIgZm9yIGNvbnRleHRcbiAgICB2YXIgZGlyID0gdGhpcztcbiAgICBpZiAodGhpcy51cGRhdGUpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZSA9IGZ1bmN0aW9uICh2YWwsIG9sZFZhbCkge1xuICAgICAgICBpZiAoIWRpci5fbG9ja2VkKSB7XG4gICAgICAgICAgZGlyLnVwZGF0ZSh2YWwsIG9sZFZhbCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VwZGF0ZSA9IG5vb3AkMTtcbiAgICB9XG4gICAgdmFyIHByZVByb2Nlc3MgPSB0aGlzLl9wcmVQcm9jZXNzID8gYmluZCh0aGlzLl9wcmVQcm9jZXNzLCB0aGlzKSA6IG51bGw7XG4gICAgdmFyIHBvc3RQcm9jZXNzID0gdGhpcy5fcG9zdFByb2Nlc3MgPyBiaW5kKHRoaXMuX3Bvc3RQcm9jZXNzLCB0aGlzKSA6IG51bGw7XG4gICAgdmFyIHdhdGNoZXIgPSB0aGlzLl93YXRjaGVyID0gbmV3IFdhdGNoZXIodGhpcy52bSwgdGhpcy5leHByZXNzaW9uLCB0aGlzLl91cGRhdGUsIC8vIGNhbGxiYWNrXG4gICAge1xuICAgICAgZmlsdGVyczogdGhpcy5maWx0ZXJzLFxuICAgICAgdHdvV2F5OiB0aGlzLnR3b1dheSxcbiAgICAgIGRlZXA6IHRoaXMuZGVlcCxcbiAgICAgIHByZVByb2Nlc3M6IHByZVByb2Nlc3MsXG4gICAgICBwb3N0UHJvY2VzczogcG9zdFByb2Nlc3MsXG4gICAgICBzY29wZTogdGhpcy5fc2NvcGVcbiAgICB9KTtcbiAgICAvLyB2LW1vZGVsIHdpdGggaW5pdGFsIGlubGluZSB2YWx1ZSBuZWVkIHRvIHN5bmMgYmFjayB0b1xuICAgIC8vIG1vZGVsIGluc3RlYWQgb2YgdXBkYXRlIHRvIERPTSBvbiBpbml0LiBUaGV5IHdvdWxkXG4gICAgLy8gc2V0IHRoZSBhZnRlckJpbmQgaG9vayB0byBpbmRpY2F0ZSB0aGF0LlxuICAgIGlmICh0aGlzLmFmdGVyQmluZCkge1xuICAgICAgdGhpcy5hZnRlckJpbmQoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMudXBkYXRlKSB7XG4gICAgICB0aGlzLnVwZGF0ZSh3YXRjaGVyLnZhbHVlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogU2V0dXAgYWxsIHBhcmFtIGF0dHJpYnV0ZXMsIGUuZy4gdHJhY2stYnksXG4gKiB0cmFuc2l0aW9uLW1vZGUsIGV0Yy4uLlxuICovXG5cbkRpcmVjdGl2ZS5wcm90b3R5cGUuX3NldHVwUGFyYW1zID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMucGFyYW1zKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBwYXJhbXMgPSB0aGlzLnBhcmFtcztcbiAgLy8gc3dhcCB0aGUgcGFyYW1zIGFycmF5IHdpdGggYSBmcmVzaCBvYmplY3QuXG4gIHRoaXMucGFyYW1zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdmFyIGkgPSBwYXJhbXMubGVuZ3RoO1xuICB2YXIga2V5LCB2YWwsIG1hcHBlZEtleTtcbiAgd2hpbGUgKGktLSkge1xuICAgIGtleSA9IGh5cGhlbmF0ZShwYXJhbXNbaV0pO1xuICAgIG1hcHBlZEtleSA9IGNhbWVsaXplKGtleSk7XG4gICAgdmFsID0gZ2V0QmluZEF0dHIodGhpcy5lbCwga2V5KTtcbiAgICBpZiAodmFsICE9IG51bGwpIHtcbiAgICAgIC8vIGR5bmFtaWNcbiAgICAgIHRoaXMuX3NldHVwUGFyYW1XYXRjaGVyKG1hcHBlZEtleSwgdmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc3RhdGljXG4gICAgICB2YWwgPSBnZXRBdHRyKHRoaXMuZWwsIGtleSk7XG4gICAgICBpZiAodmFsICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5wYXJhbXNbbWFwcGVkS2V5XSA9IHZhbCA9PT0gJycgPyB0cnVlIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBTZXR1cCBhIHdhdGNoZXIgZm9yIGEgZHluYW1pYyBwYXJhbS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gZXhwcmVzc2lvblxuICovXG5cbkRpcmVjdGl2ZS5wcm90b3R5cGUuX3NldHVwUGFyYW1XYXRjaGVyID0gZnVuY3Rpb24gKGtleSwgZXhwcmVzc2lvbikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgdmFyIHVud2F0Y2ggPSAodGhpcy5fc2NvcGUgfHwgdGhpcy52bSkuJHdhdGNoKGV4cHJlc3Npb24sIGZ1bmN0aW9uICh2YWwsIG9sZFZhbCkge1xuICAgIHNlbGYucGFyYW1zW2tleV0gPSB2YWw7XG4gICAgLy8gc2luY2Ugd2UgYXJlIGluIGltbWVkaWF0ZSBtb2RlLFxuICAgIC8vIG9ubHkgY2FsbCB0aGUgcGFyYW0gY2hhbmdlIGNhbGxiYWNrcyBpZiB0aGlzIGlzIG5vdCB0aGUgZmlyc3QgdXBkYXRlLlxuICAgIGlmIChjYWxsZWQpIHtcbiAgICAgIHZhciBjYiA9IHNlbGYucGFyYW1XYXRjaGVycyAmJiBzZWxmLnBhcmFtV2F0Y2hlcnNba2V5XTtcbiAgICAgIGlmIChjYikge1xuICAgICAgICBjYi5jYWxsKHNlbGYsIHZhbCwgb2xkVmFsKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgdXNlcjogZmFsc2VcbiAgfSk7KHRoaXMuX3BhcmFtVW53YXRjaEZucyB8fCAodGhpcy5fcGFyYW1VbndhdGNoRm5zID0gW10pKS5wdXNoKHVud2F0Y2gpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZGlyZWN0aXZlIGlzIGEgZnVuY3Rpb24gY2FsbGVyXG4gKiBhbmQgaWYgdGhlIGV4cHJlc3Npb24gaXMgYSBjYWxsYWJsZSBvbmUuIElmIGJvdGggdHJ1ZSxcbiAqIHdlIHdyYXAgdXAgdGhlIGV4cHJlc3Npb24gYW5kIHVzZSBpdCBhcyB0aGUgZXZlbnRcbiAqIGhhbmRsZXIuXG4gKlxuICogZS5nLiBvbi1jbGljaz1cImErK1wiXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5EaXJlY3RpdmUucHJvdG90eXBlLl9jaGVja1N0YXRlbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb247XG4gIGlmIChleHByZXNzaW9uICYmIHRoaXMuYWNjZXB0U3RhdGVtZW50ICYmICFpc1NpbXBsZVBhdGgoZXhwcmVzc2lvbikpIHtcbiAgICB2YXIgZm4gPSBwYXJzZUV4cHJlc3Npb24oZXhwcmVzc2lvbikuZ2V0O1xuICAgIHZhciBzY29wZSA9IHRoaXMuX3Njb3BlIHx8IHRoaXMudm07XG4gICAgdmFyIGhhbmRsZXIgPSBmdW5jdGlvbiBoYW5kbGVyKGUpIHtcbiAgICAgIHNjb3BlLiRldmVudCA9IGU7XG4gICAgICBmbi5jYWxsKHNjb3BlLCBzY29wZSk7XG4gICAgICBzY29wZS4kZXZlbnQgPSBudWxsO1xuICAgIH07XG4gICAgaWYgKHRoaXMuZmlsdGVycykge1xuICAgICAgaGFuZGxlciA9IHNjb3BlLl9hcHBseUZpbHRlcnMoaGFuZGxlciwgbnVsbCwgdGhpcy5maWx0ZXJzKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGUoaGFuZGxlcik7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cbi8qKlxuICogU2V0IHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlIHdpdGggdGhlIHNldHRlci5cbiAqIFRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCBpbiB0d28td2F5IGRpcmVjdGl2ZXNcbiAqIGUuZy4gdi1tb2RlbC5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcHVibGljXG4gKi9cblxuRGlyZWN0aXZlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKHRoaXMudHdvV2F5KSB7XG4gICAgdGhpcy5fd2l0aExvY2soZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5fd2F0Y2hlci5zZXQodmFsdWUpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICB3YXJuKCdEaXJlY3RpdmUuc2V0KCkgY2FuIG9ubHkgYmUgdXNlZCBpbnNpZGUgdHdvV2F5JyArICdkaXJlY3RpdmVzLicpO1xuICB9XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgYSBmdW5jdGlvbiB3aGlsZSBwcmV2ZW50aW5nIHRoYXQgZnVuY3Rpb24gZnJvbVxuICogdHJpZ2dlcmluZyB1cGRhdGVzIG9uIHRoaXMgZGlyZWN0aXZlIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKi9cblxuRGlyZWN0aXZlLnByb3RvdHlwZS5fd2l0aExvY2sgPSBmdW5jdGlvbiAoZm4pIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLl9sb2NrZWQgPSB0cnVlO1xuICBmbi5jYWxsKHNlbGYpO1xuICBuZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgc2VsZi5fbG9ja2VkID0gZmFsc2U7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBDb252ZW5pZW5jZSBtZXRob2QgdGhhdCBhdHRhY2hlcyBhIERPTSBldmVudCBsaXN0ZW5lclxuICogdG8gdGhlIGRpcmVjdGl2ZSBlbGVtZW50IGFuZCBhdXRvbWV0aWNhbGx5IHRlYXJzIGl0IGRvd25cbiAqIGR1cmluZyB1bmJpbmQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt1c2VDYXB0dXJlXVxuICovXG5cbkRpcmVjdGl2ZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGhhbmRsZXIsIHVzZUNhcHR1cmUpIHtcbiAgb24odGhpcy5lbCwgZXZlbnQsIGhhbmRsZXIsIHVzZUNhcHR1cmUpOyh0aGlzLl9saXN0ZW5lcnMgfHwgKHRoaXMuX2xpc3RlbmVycyA9IFtdKSkucHVzaChbZXZlbnQsIGhhbmRsZXJdKTtcbn07XG5cbi8qKlxuICogVGVhcmRvd24gdGhlIHdhdGNoZXIgYW5kIGNhbGwgdW5iaW5kLlxuICovXG5cbkRpcmVjdGl2ZS5wcm90b3R5cGUuX3RlYXJkb3duID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5fYm91bmQpIHtcbiAgICB0aGlzLl9ib3VuZCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLnVuYmluZCkge1xuICAgICAgdGhpcy51bmJpbmQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3dhdGNoZXIpIHtcbiAgICAgIHRoaXMuX3dhdGNoZXIudGVhcmRvd24oKTtcbiAgICB9XG4gICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcbiAgICB2YXIgaTtcbiAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICBpID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgb2ZmKHRoaXMuZWwsIGxpc3RlbmVyc1tpXVswXSwgbGlzdGVuZXJzW2ldWzFdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIHVud2F0Y2hGbnMgPSB0aGlzLl9wYXJhbVVud2F0Y2hGbnM7XG4gICAgaWYgKHVud2F0Y2hGbnMpIHtcbiAgICAgIGkgPSB1bndhdGNoRm5zLmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgdW53YXRjaEZuc1tpXSgpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB0aGlzLmVsKSB7XG4gICAgICB0aGlzLmVsLl92dWVfZGlyZWN0aXZlcy4kcmVtb3ZlKHRoaXMpO1xuICAgIH1cbiAgICB0aGlzLnZtID0gdGhpcy5lbCA9IHRoaXMuX3dhdGNoZXIgPSB0aGlzLl9saXN0ZW5lcnMgPSBudWxsO1xuICB9XG59O1xuXG5mdW5jdGlvbiBsaWZlY3ljbGVNaXhpbiAoVnVlKSB7XG4gIC8qKlxuICAgKiBVcGRhdGUgdi1yZWYgZm9yIGNvbXBvbmVudC5cbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSByZW1vdmVcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5fdXBkYXRlUmVmID0gZnVuY3Rpb24gKHJlbW92ZSkge1xuICAgIHZhciByZWYgPSB0aGlzLiRvcHRpb25zLl9yZWY7XG4gICAgaWYgKHJlZikge1xuICAgICAgdmFyIHJlZnMgPSAodGhpcy5fc2NvcGUgfHwgdGhpcy5fY29udGV4dCkuJHJlZnM7XG4gICAgICBpZiAocmVtb3ZlKSB7XG4gICAgICAgIGlmIChyZWZzW3JlZl0gPT09IHRoaXMpIHtcbiAgICAgICAgICByZWZzW3JlZl0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWZzW3JlZl0gPSB0aGlzO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVHJhbnNjbHVkZSwgY29tcGlsZSBhbmQgbGluayBlbGVtZW50LlxuICAgKlxuICAgKiBJZiBhIHByZS1jb21waWxlZCBsaW5rZXIgaXMgYXZhaWxhYmxlLCB0aGF0IG1lYW5zIHRoZVxuICAgKiBwYXNzZWQgaW4gZWxlbWVudCB3aWxsIGJlIHByZS10cmFuc2NsdWRlZCBhbmQgY29tcGlsZWRcbiAgICogYXMgd2VsbCAtIGFsbCB3ZSBuZWVkIHRvIGRvIGlzIHRvIGNhbGwgdGhlIGxpbmtlci5cbiAgICpcbiAgICogT3RoZXJ3aXNlIHdlIG5lZWQgdG8gY2FsbCB0cmFuc2NsdWRlL2NvbXBpbGUvbGluayBoZXJlLlxuICAgKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuX2NvbXBpbGUgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuJG9wdGlvbnM7XG5cbiAgICAvLyB0cmFuc2NsdWRlIGFuZCBpbml0IGVsZW1lbnRcbiAgICAvLyB0cmFuc2NsdWRlIGNhbiBwb3RlbnRpYWxseSByZXBsYWNlIG9yaWdpbmFsXG4gICAgLy8gc28gd2UgbmVlZCB0byBrZWVwIHJlZmVyZW5jZTsgdGhpcyBzdGVwIGFsc28gaW5qZWN0c1xuICAgIC8vIHRoZSB0ZW1wbGF0ZSBhbmQgY2FjaGVzIHRoZSBvcmlnaW5hbCBhdHRyaWJ1dGVzXG4gICAgLy8gb24gdGhlIGNvbnRhaW5lciBub2RlIGFuZCByZXBsYWNlciBub2RlLlxuICAgIHZhciBvcmlnaW5hbCA9IGVsO1xuICAgIGVsID0gdHJhbnNjbHVkZShlbCwgb3B0aW9ucyk7XG4gICAgdGhpcy5faW5pdEVsZW1lbnQoZWwpO1xuXG4gICAgLy8gaGFuZGxlIHYtcHJlIG9uIHJvb3Qgbm9kZSAoIzIwMjYpXG4gICAgaWYgKGVsLm5vZGVUeXBlID09PSAxICYmIGdldEF0dHIoZWwsICd2LXByZScpICE9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gcm9vdCBpcyBhbHdheXMgY29tcGlsZWQgcGVyLWluc3RhbmNlLCBiZWNhdXNlXG4gICAgLy8gY29udGFpbmVyIGF0dHJzIGFuZCBwcm9wcyBjYW4gYmUgZGlmZmVyZW50IGV2ZXJ5IHRpbWUuXG4gICAgdmFyIGNvbnRleHRPcHRpb25zID0gdGhpcy5fY29udGV4dCAmJiB0aGlzLl9jb250ZXh0LiRvcHRpb25zO1xuICAgIHZhciByb290TGlua2VyID0gY29tcGlsZVJvb3QoZWwsIG9wdGlvbnMsIGNvbnRleHRPcHRpb25zKTtcblxuICAgIC8vIHJlc29sdmUgc2xvdCBkaXN0cmlidXRpb25cbiAgICByZXNvbHZlU2xvdHModGhpcywgb3B0aW9ucy5fY29udGVudCk7XG5cbiAgICAvLyBjb21waWxlIGFuZCBsaW5rIHRoZSByZXN0XG4gICAgdmFyIGNvbnRlbnRMaW5rRm47XG4gICAgdmFyIGN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yO1xuICAgIC8vIGNvbXBvbmVudCBjb21waWxhdGlvbiBjYW4gYmUgY2FjaGVkXG4gICAgLy8gYXMgbG9uZyBhcyBpdCdzIG5vdCB1c2luZyBpbmxpbmUtdGVtcGxhdGVcbiAgICBpZiAob3B0aW9ucy5fbGlua2VyQ2FjaGFibGUpIHtcbiAgICAgIGNvbnRlbnRMaW5rRm4gPSBjdG9yLmxpbmtlcjtcbiAgICAgIGlmICghY29udGVudExpbmtGbikge1xuICAgICAgICBjb250ZW50TGlua0ZuID0gY3Rvci5saW5rZXIgPSBjb21waWxlKGVsLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBsaW5rIHBoYXNlXG4gICAgLy8gbWFrZSBzdXJlIHRvIGxpbmsgcm9vdCB3aXRoIHByb3Agc2NvcGUhXG4gICAgdmFyIHJvb3RVbmxpbmtGbiA9IHJvb3RMaW5rZXIodGhpcywgZWwsIHRoaXMuX3Njb3BlKTtcbiAgICB2YXIgY29udGVudFVubGlua0ZuID0gY29udGVudExpbmtGbiA/IGNvbnRlbnRMaW5rRm4odGhpcywgZWwpIDogY29tcGlsZShlbCwgb3B0aW9ucykodGhpcywgZWwpO1xuXG4gICAgLy8gcmVnaXN0ZXIgY29tcG9zaXRlIHVubGluayBmdW5jdGlvblxuICAgIC8vIHRvIGJlIGNhbGxlZCBkdXJpbmcgaW5zdGFuY2UgZGVzdHJ1Y3Rpb25cbiAgICB0aGlzLl91bmxpbmtGbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJvb3RVbmxpbmtGbigpO1xuICAgICAgLy8gcGFzc2luZyBkZXN0cm95aW5nOiB0cnVlIHRvIGF2b2lkIHNlYXJjaGluZyBhbmRcbiAgICAgIC8vIHNwbGljaW5nIHRoZSBkaXJlY3RpdmVzXG4gICAgICBjb250ZW50VW5saW5rRm4odHJ1ZSk7XG4gICAgfTtcblxuICAgIC8vIGZpbmFsbHkgcmVwbGFjZSBvcmlnaW5hbFxuICAgIGlmIChvcHRpb25zLnJlcGxhY2UpIHtcbiAgICAgIHJlcGxhY2Uob3JpZ2luYWwsIGVsKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pc0NvbXBpbGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9jYWxsSG9vaygnY29tcGlsZWQnKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBpbnN0YW5jZSBlbGVtZW50LiBDYWxsZWQgaW4gdGhlIHB1YmxpY1xuICAgKiAkbW91bnQoKSBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5faW5pdEVsZW1lbnQgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICBpZiAoaXNGcmFnbWVudChlbCkpIHtcbiAgICAgIHRoaXMuX2lzRnJhZ21lbnQgPSB0cnVlO1xuICAgICAgdGhpcy4kZWwgPSB0aGlzLl9mcmFnbWVudFN0YXJ0ID0gZWwuZmlyc3RDaGlsZDtcbiAgICAgIHRoaXMuX2ZyYWdtZW50RW5kID0gZWwubGFzdENoaWxkO1xuICAgICAgLy8gc2V0IHBlcnNpc3RlZCB0ZXh0IGFuY2hvcnMgdG8gZW1wdHlcbiAgICAgIGlmICh0aGlzLl9mcmFnbWVudFN0YXJ0Lm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgIHRoaXMuX2ZyYWdtZW50U3RhcnQuZGF0YSA9IHRoaXMuX2ZyYWdtZW50RW5kLmRhdGEgPSAnJztcbiAgICAgIH1cbiAgICAgIHRoaXMuX2ZyYWdtZW50ID0gZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuJGVsID0gZWw7XG4gICAgfVxuICAgIHRoaXMuJGVsLl9fdnVlX18gPSB0aGlzO1xuICAgIHRoaXMuX2NhbGxIb29rKCdiZWZvcmVDb21waWxlJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbmQgYmluZCBhIGRpcmVjdGl2ZSB0byBhbiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvciAtIHBhcnNlZCBkaXJlY3RpdmUgZGVzY3JpcHRvclxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGUgICAtIHRhcmdldCBub2RlXG4gICAqIEBwYXJhbSB7VnVlfSBbaG9zdF0gLSB0cmFuc2NsdXNpb24gaG9zdCBjb21wb25lbnRcbiAgICogQHBhcmFtIHtPYmplY3R9IFtzY29wZV0gLSB2LWZvciBzY29wZVxuICAgKiBAcGFyYW0ge0ZyYWdtZW50fSBbZnJhZ10gLSBvd25lciBmcmFnbWVudFxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9iaW5kRGlyID0gZnVuY3Rpb24gKGRlc2NyaXB0b3IsIG5vZGUsIGhvc3QsIHNjb3BlLCBmcmFnKSB7XG4gICAgdGhpcy5fZGlyZWN0aXZlcy5wdXNoKG5ldyBEaXJlY3RpdmUoZGVzY3JpcHRvciwgdGhpcywgbm9kZSwgaG9zdCwgc2NvcGUsIGZyYWcpKTtcbiAgfTtcblxuICAvKipcbiAgICogVGVhcmRvd24gYW4gaW5zdGFuY2UsIHVub2JzZXJ2ZXMgdGhlIGRhdGEsIHVuYmluZCBhbGwgdGhlXG4gICAqIGRpcmVjdGl2ZXMsIHR1cm4gb2ZmIGFsbCB0aGUgZXZlbnQgbGlzdGVuZXJzLCBldGMuXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVtb3ZlIC0gd2hldGhlciB0byByZW1vdmUgdGhlIERPTSBub2RlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGRlZmVyQ2xlYW51cCAtIGlmIHRydWUsIGRlZmVyIGNsZWFudXAgdG9cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZSBjYWxsZWQgbGF0ZXJcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5fZGVzdHJveSA9IGZ1bmN0aW9uIChyZW1vdmUsIGRlZmVyQ2xlYW51cCkge1xuICAgIGlmICh0aGlzLl9pc0JlaW5nRGVzdHJveWVkKSB7XG4gICAgICBpZiAoIWRlZmVyQ2xlYW51cCkge1xuICAgICAgICB0aGlzLl9jbGVhbnVwKCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGRlc3Ryb3lSZWFkeTtcbiAgICB2YXIgcGVuZGluZ1JlbW92YWw7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy8gQ2xlYW51cCBzaG91bGQgYmUgY2FsbGVkIGVpdGhlciBzeW5jaHJvbm91c2x5IG9yIGFzeW5jaHJvbm95c2x5IGFzXG4gICAgLy8gY2FsbGJhY2sgb2YgdGhpcy4kcmVtb3ZlKCksIG9yIGlmIHJlbW92ZSBhbmQgZGVmZXJDbGVhbnVwIGFyZSBmYWxzZS5cbiAgICAvLyBJbiBhbnkgY2FzZSBpdCBzaG91bGQgYmUgY2FsbGVkIGFmdGVyIGFsbCBvdGhlciByZW1vdmluZywgdW5iaW5kaW5nIGFuZFxuICAgIC8vIHR1cm5pbmcgb2YgaXMgZG9uZVxuICAgIHZhciBjbGVhbnVwSWZQb3NzaWJsZSA9IGZ1bmN0aW9uIGNsZWFudXBJZlBvc3NpYmxlKCkge1xuICAgICAgaWYgKGRlc3Ryb3lSZWFkeSAmJiAhcGVuZGluZ1JlbW92YWwgJiYgIWRlZmVyQ2xlYW51cCkge1xuICAgICAgICBzZWxmLl9jbGVhbnVwKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIHJlbW92ZSBET00gZWxlbWVudFxuICAgIGlmIChyZW1vdmUgJiYgdGhpcy4kZWwpIHtcbiAgICAgIHBlbmRpbmdSZW1vdmFsID0gdHJ1ZTtcbiAgICAgIHRoaXMuJHJlbW92ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHBlbmRpbmdSZW1vdmFsID0gZmFsc2U7XG4gICAgICAgIGNsZWFudXBJZlBvc3NpYmxlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9jYWxsSG9vaygnYmVmb3JlRGVzdHJveScpO1xuICAgIHRoaXMuX2lzQmVpbmdEZXN0cm95ZWQgPSB0cnVlO1xuICAgIHZhciBpO1xuICAgIC8vIHJlbW92ZSBzZWxmIGZyb20gcGFyZW50LiBvbmx5IG5lY2Vzc2FyeVxuICAgIC8vIGlmIHBhcmVudCBpcyBub3QgYmVpbmcgZGVzdHJveWVkIGFzIHdlbGwuXG4gICAgdmFyIHBhcmVudCA9IHRoaXMuJHBhcmVudDtcbiAgICBpZiAocGFyZW50ICYmICFwYXJlbnQuX2lzQmVpbmdEZXN0cm95ZWQpIHtcbiAgICAgIHBhcmVudC4kY2hpbGRyZW4uJHJlbW92ZSh0aGlzKTtcbiAgICAgIC8vIHVucmVnaXN0ZXIgcmVmIChyZW1vdmU6IHRydWUpXG4gICAgICB0aGlzLl91cGRhdGVSZWYodHJ1ZSk7XG4gICAgfVxuICAgIC8vIGRlc3Ryb3kgYWxsIGNoaWxkcmVuLlxuICAgIGkgPSB0aGlzLiRjaGlsZHJlbi5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgdGhpcy4kY2hpbGRyZW5baV0uJGRlc3Ryb3koKTtcbiAgICB9XG4gICAgLy8gdGVhcmRvd24gcHJvcHNcbiAgICBpZiAodGhpcy5fcHJvcHNVbmxpbmtGbikge1xuICAgICAgdGhpcy5fcHJvcHNVbmxpbmtGbigpO1xuICAgIH1cbiAgICAvLyB0ZWFyZG93biBhbGwgZGlyZWN0aXZlcy4gdGhpcyBhbHNvIHRlYXJzZG93biBhbGxcbiAgICAvLyBkaXJlY3RpdmUtb3duZWQgd2F0Y2hlcnMuXG4gICAgaWYgKHRoaXMuX3VubGlua0ZuKSB7XG4gICAgICB0aGlzLl91bmxpbmtGbigpO1xuICAgIH1cbiAgICBpID0gdGhpcy5fd2F0Y2hlcnMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHRoaXMuX3dhdGNoZXJzW2ldLnRlYXJkb3duKCk7XG4gICAgfVxuICAgIC8vIHJlbW92ZSByZWZlcmVuY2UgdG8gc2VsZiBvbiAkZWxcbiAgICBpZiAodGhpcy4kZWwpIHtcbiAgICAgIHRoaXMuJGVsLl9fdnVlX18gPSBudWxsO1xuICAgIH1cblxuICAgIGRlc3Ryb3lSZWFkeSA9IHRydWU7XG4gICAgY2xlYW51cElmUG9zc2libGUoKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2xlYW4gdXAgdG8gZW5zdXJlIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICogVGhpcyBpcyBjYWxsZWQgYWZ0ZXIgdGhlIGxlYXZlIHRyYW5zaXRpb24gaWYgdGhlcmVcbiAgICogaXMgYW55LlxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLl9jbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyByZW1vdmUgc2VsZiBmcm9tIG93bmVyIGZyYWdtZW50XG4gICAgLy8gZG8gaXQgaW4gY2xlYW51cCBzbyB0aGF0IHdlIGNhbiBjYWxsICRkZXN0cm95IHdpdGhcbiAgICAvLyBkZWZlciByaWdodCB3aGVuIGEgZnJhZ21lbnQgaXMgYWJvdXQgdG8gYmUgcmVtb3ZlZC5cbiAgICBpZiAodGhpcy5fZnJhZykge1xuICAgICAgdGhpcy5fZnJhZy5jaGlsZHJlbi4kcmVtb3ZlKHRoaXMpO1xuICAgIH1cbiAgICAvLyByZW1vdmUgcmVmZXJlbmNlIGZyb20gZGF0YSBvYlxuICAgIC8vIGZyb3plbiBvYmplY3QgbWF5IG5vdCBoYXZlIG9ic2VydmVyLlxuICAgIGlmICh0aGlzLl9kYXRhICYmIHRoaXMuX2RhdGEuX19vYl9fKSB7XG4gICAgICB0aGlzLl9kYXRhLl9fb2JfXy5yZW1vdmVWbSh0aGlzKTtcbiAgICB9XG4gICAgLy8gQ2xlYW4gdXAgcmVmZXJlbmNlcyB0byBwcml2YXRlIHByb3BlcnRpZXMgYW5kIG90aGVyXG4gICAgLy8gaW5zdGFuY2VzLiBwcmVzZXJ2ZSByZWZlcmVuY2UgdG8gX2RhdGEgc28gdGhhdCBwcm94eVxuICAgIC8vIGFjY2Vzc29ycyBzdGlsbCB3b3JrLiBUaGUgb25seSBwb3RlbnRpYWwgc2lkZSBlZmZlY3RcbiAgICAvLyBoZXJlIGlzIHRoYXQgbXV0YXRpbmcgdGhlIGluc3RhbmNlIGFmdGVyIGl0J3MgZGVzdHJveWVkXG4gICAgLy8gbWF5IGFmZmVjdCB0aGUgc3RhdGUgb2Ygb3RoZXIgY29tcG9uZW50cyB0aGF0IGFyZSBzdGlsbFxuICAgIC8vIG9ic2VydmluZyB0aGUgc2FtZSBvYmplY3QsIGJ1dCB0aGF0IHNlZW1zIHRvIGJlIGFcbiAgICAvLyByZWFzb25hYmxlIHJlc3BvbnNpYmlsaXR5IGZvciB0aGUgdXNlciByYXRoZXIgdGhhblxuICAgIC8vIGFsd2F5cyB0aHJvd2luZyBhbiBlcnJvciBvbiB0aGVtLlxuICAgIHRoaXMuJGVsID0gdGhpcy4kcGFyZW50ID0gdGhpcy4kcm9vdCA9IHRoaXMuJGNoaWxkcmVuID0gdGhpcy5fd2F0Y2hlcnMgPSB0aGlzLl9jb250ZXh0ID0gdGhpcy5fc2NvcGUgPSB0aGlzLl9kaXJlY3RpdmVzID0gbnVsbDtcbiAgICAvLyBjYWxsIHRoZSBsYXN0IGhvb2suLi5cbiAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgdGhpcy5fY2FsbEhvb2soJ2Rlc3Ryb3llZCcpO1xuICAgIC8vIHR1cm4gb2ZmIGFsbCBpbnN0YW5jZSBsaXN0ZW5lcnMuXG4gICAgdGhpcy4kb2ZmKCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG1pc2NNaXhpbiAoVnVlKSB7XG4gIC8qKlxuICAgKiBBcHBseSBhIGxpc3Qgb2YgZmlsdGVyIChkZXNjcmlwdG9ycykgdG8gYSB2YWx1ZS5cbiAgICogVXNpbmcgcGxhaW4gZm9yIGxvb3BzIGhlcmUgYmVjYXVzZSB0aGlzIHdpbGwgYmUgY2FsbGVkIGluXG4gICAqIHRoZSBnZXR0ZXIgb2YgYW55IHdhdGNoZXIgd2l0aCBmaWx0ZXJzIHNvIGl0IGlzIHZlcnlcbiAgICogcGVyZm9ybWFuY2Ugc2Vuc2l0aXZlLlxuICAgKlxuICAgKiBAcGFyYW0geyp9IHZhbHVlXG4gICAqIEBwYXJhbSB7Kn0gW29sZFZhbHVlXVxuICAgKiBAcGFyYW0ge0FycmF5fSBmaWx0ZXJzXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gd3JpdGVcbiAgICogQHJldHVybiB7Kn1cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5fYXBwbHlGaWx0ZXJzID0gZnVuY3Rpb24gKHZhbHVlLCBvbGRWYWx1ZSwgZmlsdGVycywgd3JpdGUpIHtcbiAgICB2YXIgZmlsdGVyLCBmbiwgYXJncywgYXJnLCBvZmZzZXQsIGksIGwsIGosIGs7XG4gICAgZm9yIChpID0gMCwgbCA9IGZpbHRlcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmaWx0ZXIgPSBmaWx0ZXJzW3dyaXRlID8gbCAtIGkgLSAxIDogaV07XG4gICAgICBmbiA9IHJlc29sdmVBc3NldCh0aGlzLiRvcHRpb25zLCAnZmlsdGVycycsIGZpbHRlci5uYW1lLCB0cnVlKTtcbiAgICAgIGlmICghZm4pIGNvbnRpbnVlO1xuICAgICAgZm4gPSB3cml0ZSA/IGZuLndyaXRlIDogZm4ucmVhZCB8fCBmbjtcbiAgICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIGNvbnRpbnVlO1xuICAgICAgYXJncyA9IHdyaXRlID8gW3ZhbHVlLCBvbGRWYWx1ZV0gOiBbdmFsdWVdO1xuICAgICAgb2Zmc2V0ID0gd3JpdGUgPyAyIDogMTtcbiAgICAgIGlmIChmaWx0ZXIuYXJncykge1xuICAgICAgICBmb3IgKGogPSAwLCBrID0gZmlsdGVyLmFyZ3MubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgYXJnID0gZmlsdGVyLmFyZ3Nbal07XG4gICAgICAgICAgYXJnc1tqICsgb2Zmc2V0XSA9IGFyZy5keW5hbWljID8gdGhpcy4kZ2V0KGFyZy52YWx1ZSkgOiBhcmcudmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhbHVlID0gZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvKipcbiAgICogUmVzb2x2ZSBhIGNvbXBvbmVudCwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIGNvbXBvbmVudFxuICAgKiBpcyBkZWZpbmVkIG5vcm1hbGx5IG9yIHVzaW5nIGFuIGFzeW5jIGZhY3RvcnkgZnVuY3Rpb24uXG4gICAqIFJlc29sdmVzIHN5bmNocm9ub3VzbHkgaWYgYWxyZWFkeSByZXNvbHZlZCwgb3RoZXJ3aXNlXG4gICAqIHJlc29sdmVzIGFzeW5jaHJvbm91c2x5IGFuZCBjYWNoZXMgdGhlIHJlc29sdmVkXG4gICAqIGNvbnN0cnVjdG9yIG9uIHRoZSBmYWN0b3J5LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gdmFsdWVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2JcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS5fcmVzb2x2ZUNvbXBvbmVudCA9IGZ1bmN0aW9uICh2YWx1ZSwgY2IpIHtcbiAgICB2YXIgZmFjdG9yeTtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmYWN0b3J5ID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZhY3RvcnkgPSByZXNvbHZlQXNzZXQodGhpcy4kb3B0aW9ucywgJ2NvbXBvbmVudHMnLCB2YWx1ZSwgdHJ1ZSk7XG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghZmFjdG9yeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBhc3luYyBjb21wb25lbnQgZmFjdG9yeVxuICAgIGlmICghZmFjdG9yeS5vcHRpb25zKSB7XG4gICAgICBpZiAoZmFjdG9yeS5yZXNvbHZlZCkge1xuICAgICAgICAvLyBjYWNoZWRcbiAgICAgICAgY2IoZmFjdG9yeS5yZXNvbHZlZCk7XG4gICAgICB9IGVsc2UgaWYgKGZhY3RvcnkucmVxdWVzdGVkKSB7XG4gICAgICAgIC8vIHBvb2wgY2FsbGJhY2tzXG4gICAgICAgIGZhY3RvcnkucGVuZGluZ0NhbGxiYWNrcy5wdXNoKGNiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkucmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIGNicyA9IGZhY3RvcnkucGVuZGluZ0NhbGxiYWNrcyA9IFtjYl07XG4gICAgICAgIGZhY3RvcnkuY2FsbCh0aGlzLCBmdW5jdGlvbiByZXNvbHZlKHJlcykge1xuICAgICAgICAgIGlmIChpc1BsYWluT2JqZWN0KHJlcykpIHtcbiAgICAgICAgICAgIHJlcyA9IFZ1ZS5leHRlbmQocmVzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gY2FjaGUgcmVzb2x2ZWRcbiAgICAgICAgICBmYWN0b3J5LnJlc29sdmVkID0gcmVzO1xuICAgICAgICAgIC8vIGludm9rZSBjYWxsYmFja3NcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNicy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGNic1tpXShyZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybignRmFpbGVkIHRvIHJlc29sdmUgYXN5bmMgY29tcG9uZW50JyArICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gJzogJyArIHZhbHVlIDogJycpICsgJy4gJyArIChyZWFzb24gPyAnXFxuUmVhc29uOiAnICsgcmVhc29uIDogJycpKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG5vcm1hbCBjb21wb25lbnRcbiAgICAgIGNiKGZhY3RvcnkpO1xuICAgIH1cbiAgfTtcbn1cblxudmFyIGZpbHRlclJFJDEgPSAvW158XVxcfFtefF0vO1xuXG5mdW5jdGlvbiBkYXRhQVBJIChWdWUpIHtcbiAgLyoqXG4gICAqIEdldCB0aGUgdmFsdWUgZnJvbSBhbiBleHByZXNzaW9uIG9uIHRoaXMgdm0uXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBleHBcbiAgICogQHBhcmFtIHtCb29sZWFufSBbYXNTdGF0ZW1lbnRdXG4gICAqIEByZXR1cm4geyp9XG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGdldCA9IGZ1bmN0aW9uIChleHAsIGFzU3RhdGVtZW50KSB7XG4gICAgdmFyIHJlcyA9IHBhcnNlRXhwcmVzc2lvbihleHApO1xuICAgIGlmIChyZXMpIHtcbiAgICAgIGlmIChhc1N0YXRlbWVudCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBzdGF0ZW1lbnRIYW5kbGVyKCkge1xuICAgICAgICAgIHNlbGYuJGFyZ3VtZW50cyA9IHRvQXJyYXkoYXJndW1lbnRzKTtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gcmVzLmdldC5jYWxsKHNlbGYsIHNlbGYpO1xuICAgICAgICAgIHNlbGYuJGFyZ3VtZW50cyA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5nZXQuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdmFsdWUgZnJvbSBhbiBleHByZXNzaW9uIG9uIHRoaXMgdm0uXG4gICAqIFRoZSBleHByZXNzaW9uIG11c3QgYmUgYSB2YWxpZCBsZWZ0LWhhbmRcbiAgICogZXhwcmVzc2lvbiBpbiBhbiBhc3NpZ25tZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXhwXG4gICAqIEBwYXJhbSB7Kn0gdmFsXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJHNldCA9IGZ1bmN0aW9uIChleHAsIHZhbCkge1xuICAgIHZhciByZXMgPSBwYXJzZUV4cHJlc3Npb24oZXhwLCB0cnVlKTtcbiAgICBpZiAocmVzICYmIHJlcy5zZXQpIHtcbiAgICAgIHJlcy5zZXQuY2FsbCh0aGlzLCB0aGlzLCB2YWwpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRGVsZXRlIGEgcHJvcGVydHkgb24gdGhlIFZNXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kZGVsZXRlID0gZnVuY3Rpb24gKGtleSkge1xuICAgIGRlbCh0aGlzLl9kYXRhLCBrZXkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBXYXRjaCBhbiBleHByZXNzaW9uLCB0cmlnZ2VyIGNhbGxiYWNrIHdoZW4gaXRzXG4gICAqIHZhbHVlIGNoYW5nZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBleHBPckZuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogICAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IGRlZXBcbiAgICogICAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IGltbWVkaWF0ZVxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gLSB1bndhdGNoRm5cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kd2F0Y2ggPSBmdW5jdGlvbiAoZXhwT3JGbiwgY2IsIG9wdGlvbnMpIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuICAgIHZhciBwYXJzZWQ7XG4gICAgaWYgKHR5cGVvZiBleHBPckZuID09PSAnc3RyaW5nJykge1xuICAgICAgcGFyc2VkID0gcGFyc2VEaXJlY3RpdmUoZXhwT3JGbik7XG4gICAgICBleHBPckZuID0gcGFyc2VkLmV4cHJlc3Npb247XG4gICAgfVxuICAgIHZhciB3YXRjaGVyID0gbmV3IFdhdGNoZXIodm0sIGV4cE9yRm4sIGNiLCB7XG4gICAgICBkZWVwOiBvcHRpb25zICYmIG9wdGlvbnMuZGVlcCxcbiAgICAgIHN5bmM6IG9wdGlvbnMgJiYgb3B0aW9ucy5zeW5jLFxuICAgICAgZmlsdGVyczogcGFyc2VkICYmIHBhcnNlZC5maWx0ZXJzLFxuICAgICAgdXNlcjogIW9wdGlvbnMgfHwgb3B0aW9ucy51c2VyICE9PSBmYWxzZVxuICAgIH0pO1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuaW1tZWRpYXRlKSB7XG4gICAgICBjYi5jYWxsKHZtLCB3YXRjaGVyLnZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHVud2F0Y2hGbigpIHtcbiAgICAgIHdhdGNoZXIudGVhcmRvd24oKTtcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBFdmFsdWF0ZSBhIHRleHQgZGlyZWN0aXZlLCBpbmNsdWRpbmcgZmlsdGVycy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHRleHRcbiAgICogQHBhcmFtIHtCb29sZWFufSBbYXNTdGF0ZW1lbnRdXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kZXZhbCA9IGZ1bmN0aW9uICh0ZXh0LCBhc1N0YXRlbWVudCkge1xuICAgIC8vIGNoZWNrIGZvciBmaWx0ZXJzLlxuICAgIGlmIChmaWx0ZXJSRSQxLnRlc3QodGV4dCkpIHtcbiAgICAgIHZhciBkaXIgPSBwYXJzZURpcmVjdGl2ZSh0ZXh0KTtcbiAgICAgIC8vIHRoZSBmaWx0ZXIgcmVnZXggY2hlY2sgbWlnaHQgZ2l2ZSBmYWxzZSBwb3NpdGl2ZVxuICAgICAgLy8gZm9yIHBpcGVzIGluc2lkZSBzdHJpbmdzLCBzbyBpdCdzIHBvc3NpYmxlIHRoYXRcbiAgICAgIC8vIHdlIGRvbid0IGdldCBhbnkgZmlsdGVycyBoZXJlXG4gICAgICB2YXIgdmFsID0gdGhpcy4kZ2V0KGRpci5leHByZXNzaW9uLCBhc1N0YXRlbWVudCk7XG4gICAgICByZXR1cm4gZGlyLmZpbHRlcnMgPyB0aGlzLl9hcHBseUZpbHRlcnModmFsLCBudWxsLCBkaXIuZmlsdGVycykgOiB2YWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG5vIGZpbHRlclxuICAgICAgcmV0dXJuIHRoaXMuJGdldCh0ZXh0LCBhc1N0YXRlbWVudCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBJbnRlcnBvbGF0ZSBhIHBpZWNlIG9mIHRlbXBsYXRlIHRleHQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kaW50ZXJwb2xhdGUgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgIHZhciB0b2tlbnMgPSBwYXJzZVRleHQodGV4dCk7XG4gICAgdmFyIHZtID0gdGhpcztcbiAgICBpZiAodG9rZW5zKSB7XG4gICAgICBpZiAodG9rZW5zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gdm0uJGV2YWwodG9rZW5zWzBdLnZhbHVlKSArICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRva2Vucy5tYXAoZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHRva2VuLnRhZyA/IHZtLiRldmFsKHRva2VuLnZhbHVlKSA6IHRva2VuLnZhbHVlO1xuICAgICAgICB9KS5qb2luKCcnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBMb2cgaW5zdGFuY2UgZGF0YSBhcyBhIHBsYWluIEpTIG9iamVjdFxuICAgKiBzbyB0aGF0IGl0IGlzIGVhc2llciB0byBpbnNwZWN0IGluIGNvbnNvbGUuXG4gICAqIFRoaXMgbWV0aG9kIGFzc3VtZXMgY29uc29sZSBpcyBhdmFpbGFibGUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbcGF0aF1cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kbG9nID0gZnVuY3Rpb24gKHBhdGgpIHtcbiAgICB2YXIgZGF0YSA9IHBhdGggPyBnZXRQYXRoKHRoaXMuX2RhdGEsIHBhdGgpIDogdGhpcy5fZGF0YTtcbiAgICBpZiAoZGF0YSkge1xuICAgICAgZGF0YSA9IGNsZWFuKGRhdGEpO1xuICAgIH1cbiAgICAvLyBpbmNsdWRlIGNvbXB1dGVkIGZpZWxkc1xuICAgIGlmICghcGF0aCkge1xuICAgICAgdmFyIGtleTtcbiAgICAgIGZvciAoa2V5IGluIHRoaXMuJG9wdGlvbnMuY29tcHV0ZWQpIHtcbiAgICAgICAgZGF0YVtrZXldID0gY2xlYW4odGhpc1trZXldKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9wcm9wcykge1xuICAgICAgICBmb3IgKGtleSBpbiB0aGlzLl9wcm9wcykge1xuICAgICAgICAgIGRhdGFba2V5XSA9IGNsZWFuKHRoaXNba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coZGF0YSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFwiY2xlYW5cIiBhIGdldHRlci9zZXR0ZXIgY29udmVydGVkIG9iamVjdCBpbnRvIGEgcGxhaW5cbiAgICogb2JqZWN0IGNvcHkuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSAtIG9ialxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNsZWFuKG9iaikge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRvbUFQSSAoVnVlKSB7XG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBvbi1pbnN0YW5jZSBuZXh0VGljay4gVGhlIGNhbGxiYWNrIGlzXG4gICAqIGF1dG8tYm91bmQgdG8gdGhlIGluc3RhbmNlLCBhbmQgdGhpcyBhdm9pZHMgY29tcG9uZW50XG4gICAqIG1vZHVsZXMgaGF2aW5nIHRvIHJlbHkgb24gdGhlIGdsb2JhbCBWdWUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJG5leHRUaWNrID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgbmV4dFRpY2soZm4sIHRoaXMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBlbmQgaW5zdGFuY2UgdG8gdGFyZ2V0XG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAgICogQHBhcmFtIHtCb29sZWFufSBbd2l0aFRyYW5zaXRpb25dIC0gZGVmYXVsdHMgdG8gdHJ1ZVxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLiRhcHBlbmRUbyA9IGZ1bmN0aW9uICh0YXJnZXQsIGNiLCB3aXRoVHJhbnNpdGlvbikge1xuICAgIHJldHVybiBpbnNlcnQodGhpcywgdGFyZ2V0LCBjYiwgd2l0aFRyYW5zaXRpb24sIGFwcGVuZCwgYXBwZW5kV2l0aFRyYW5zaXRpb24pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQcmVwZW5kIGluc3RhbmNlIHRvIHRhcmdldFxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3dpdGhUcmFuc2l0aW9uXSAtIGRlZmF1bHRzIHRvIHRydWVcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kcHJlcGVuZFRvID0gZnVuY3Rpb24gKHRhcmdldCwgY2IsIHdpdGhUcmFuc2l0aW9uKSB7XG4gICAgdGFyZ2V0ID0gcXVlcnkodGFyZ2V0KTtcbiAgICBpZiAodGFyZ2V0Lmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgdGhpcy4kYmVmb3JlKHRhcmdldC5maXJzdENoaWxkLCBjYiwgd2l0aFRyYW5zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRhcHBlbmRUbyh0YXJnZXQsIGNiLCB3aXRoVHJhbnNpdGlvbik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbnNlcnQgaW5zdGFuY2UgYmVmb3JlIHRhcmdldFxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3dpdGhUcmFuc2l0aW9uXSAtIGRlZmF1bHRzIHRvIHRydWVcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kYmVmb3JlID0gZnVuY3Rpb24gKHRhcmdldCwgY2IsIHdpdGhUcmFuc2l0aW9uKSB7XG4gICAgcmV0dXJuIGluc2VydCh0aGlzLCB0YXJnZXQsIGNiLCB3aXRoVHJhbnNpdGlvbiwgYmVmb3JlV2l0aENiLCBiZWZvcmVXaXRoVHJhbnNpdGlvbik7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluc2VydCBpbnN0YW5jZSBhZnRlciB0YXJnZXRcbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl0gLSBkZWZhdWx0cyB0byB0cnVlXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGFmdGVyID0gZnVuY3Rpb24gKHRhcmdldCwgY2IsIHdpdGhUcmFuc2l0aW9uKSB7XG4gICAgdGFyZ2V0ID0gcXVlcnkodGFyZ2V0KTtcbiAgICBpZiAodGFyZ2V0Lm5leHRTaWJsaW5nKSB7XG4gICAgICB0aGlzLiRiZWZvcmUodGFyZ2V0Lm5leHRTaWJsaW5nLCBjYiwgd2l0aFRyYW5zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRhcHBlbmRUbyh0YXJnZXQucGFyZW50Tm9kZSwgY2IsIHdpdGhUcmFuc2l0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBpbnN0YW5jZSBmcm9tIERPTVxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3dpdGhUcmFuc2l0aW9uXSAtIGRlZmF1bHRzIHRvIHRydWVcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kcmVtb3ZlID0gZnVuY3Rpb24gKGNiLCB3aXRoVHJhbnNpdGlvbikge1xuICAgIGlmICghdGhpcy4kZWwucGFyZW50Tm9kZSkge1xuICAgICAgcmV0dXJuIGNiICYmIGNiKCk7XG4gICAgfVxuICAgIHZhciBpbkRvY3VtZW50ID0gdGhpcy5faXNBdHRhY2hlZCAmJiBpbkRvYyh0aGlzLiRlbCk7XG4gICAgLy8gaWYgd2UgYXJlIG5vdCBpbiBkb2N1bWVudCwgbm8gbmVlZCB0byBjaGVja1xuICAgIC8vIGZvciB0cmFuc2l0aW9uc1xuICAgIGlmICghaW5Eb2N1bWVudCkgd2l0aFRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHJlYWxDYiA9IGZ1bmN0aW9uIHJlYWxDYigpIHtcbiAgICAgIGlmIChpbkRvY3VtZW50KSBzZWxmLl9jYWxsSG9vaygnZGV0YWNoZWQnKTtcbiAgICAgIGlmIChjYikgY2IoKTtcbiAgICB9O1xuICAgIGlmICh0aGlzLl9pc0ZyYWdtZW50KSB7XG4gICAgICByZW1vdmVOb2RlUmFuZ2UodGhpcy5fZnJhZ21lbnRTdGFydCwgdGhpcy5fZnJhZ21lbnRFbmQsIHRoaXMsIHRoaXMuX2ZyYWdtZW50LCByZWFsQ2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgb3AgPSB3aXRoVHJhbnNpdGlvbiA9PT0gZmFsc2UgPyByZW1vdmVXaXRoQ2IgOiByZW1vdmVXaXRoVHJhbnNpdGlvbjtcbiAgICAgIG9wKHRoaXMuJGVsLCB0aGlzLCByZWFsQ2IpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogU2hhcmVkIERPTSBpbnNlcnRpb24gZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7VnVlfSB2bVxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3dpdGhUcmFuc2l0aW9uXVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcDEgLSBvcCBmb3Igbm9uLXRyYW5zaXRpb24gaW5zZXJ0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG9wMiAtIG9wIGZvciB0cmFuc2l0aW9uIGluc2VydFxuICAgKiBAcmV0dXJuIHZtXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGluc2VydCh2bSwgdGFyZ2V0LCBjYiwgd2l0aFRyYW5zaXRpb24sIG9wMSwgb3AyKSB7XG4gICAgdGFyZ2V0ID0gcXVlcnkodGFyZ2V0KTtcbiAgICB2YXIgdGFyZ2V0SXNEZXRhY2hlZCA9ICFpbkRvYyh0YXJnZXQpO1xuICAgIHZhciBvcCA9IHdpdGhUcmFuc2l0aW9uID09PSBmYWxzZSB8fCB0YXJnZXRJc0RldGFjaGVkID8gb3AxIDogb3AyO1xuICAgIHZhciBzaG91bGRDYWxsSG9vayA9ICF0YXJnZXRJc0RldGFjaGVkICYmICF2bS5faXNBdHRhY2hlZCAmJiAhaW5Eb2Modm0uJGVsKTtcbiAgICBpZiAodm0uX2lzRnJhZ21lbnQpIHtcbiAgICAgIG1hcE5vZGVSYW5nZSh2bS5fZnJhZ21lbnRTdGFydCwgdm0uX2ZyYWdtZW50RW5kLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICBvcChub2RlLCB0YXJnZXQsIHZtKTtcbiAgICAgIH0pO1xuICAgICAgY2IgJiYgY2IoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3Aodm0uJGVsLCB0YXJnZXQsIHZtLCBjYik7XG4gICAgfVxuICAgIGlmIChzaG91bGRDYWxsSG9vaykge1xuICAgICAgdm0uX2NhbGxIb29rKCdhdHRhY2hlZCcpO1xuICAgIH1cbiAgICByZXR1cm4gdm07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIHNlbGVjdG9yc1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fSBlbFxuICAgKi9cblxuICBmdW5jdGlvbiBxdWVyeShlbCkge1xuICAgIHJldHVybiB0eXBlb2YgZWwgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbCkgOiBlbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmQgb3BlcmF0aW9uIHRoYXQgdGFrZXMgYSBjYWxsYmFjay5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBlbFxuICAgKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuICAgKiBAcGFyYW0ge1Z1ZX0gdm0gLSB1bnVzZWRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICAgKi9cblxuICBmdW5jdGlvbiBhcHBlbmQoZWwsIHRhcmdldCwgdm0sIGNiKSB7XG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKGVsKTtcbiAgICBpZiAoY2IpIGNiKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0QmVmb3JlIG9wZXJhdGlvbiB0aGF0IHRha2VzIGEgY2FsbGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gZWxcbiAgICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcbiAgICogQHBhcmFtIHtWdWV9IHZtIC0gdW51c2VkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAgICovXG5cbiAgZnVuY3Rpb24gYmVmb3JlV2l0aENiKGVsLCB0YXJnZXQsIHZtLCBjYikge1xuICAgIGJlZm9yZShlbCwgdGFyZ2V0KTtcbiAgICBpZiAoY2IpIGNiKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIG9wZXJhdGlvbiB0aGF0IHRha2VzIGEgY2FsbGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gZWxcbiAgICogQHBhcmFtIHtWdWV9IHZtIC0gdW51c2VkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAgICovXG5cbiAgZnVuY3Rpb24gcmVtb3ZlV2l0aENiKGVsLCB2bSwgY2IpIHtcbiAgICByZW1vdmUoZWwpO1xuICAgIGlmIChjYikgY2IoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudHNBUEkgKFZ1ZSkge1xuICAvKipcbiAgICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJG9uID0gZnVuY3Rpb24gKGV2ZW50LCBmbikge1xuICAgICh0aGlzLl9ldmVudHNbZXZlbnRdIHx8ICh0aGlzLl9ldmVudHNbZXZlbnRdID0gW10pKS5wdXNoKGZuKTtcbiAgICBtb2RpZnlMaXN0ZW5lckNvdW50KHRoaXMsIGV2ZW50LCAxKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gICAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLiRvbmNlID0gZnVuY3Rpb24gKGV2ZW50LCBmbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBmdW5jdGlvbiBvbigpIHtcbiAgICAgIHNlbGYuJG9mZihldmVudCwgb24pO1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgb24uZm4gPSBmbjtcbiAgICB0aGlzLiRvbihldmVudCwgb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICAgKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJG9mZiA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcbiAgICB2YXIgY2JzO1xuICAgIC8vIGFsbFxuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuJHBhcmVudCkge1xuICAgICAgICBmb3IgKGV2ZW50IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgICAgIGNicyA9IHRoaXMuX2V2ZW50c1tldmVudF07XG4gICAgICAgICAgaWYgKGNicykge1xuICAgICAgICAgICAgbW9kaWZ5TGlzdGVuZXJDb3VudCh0aGlzLCBldmVudCwgLWNicy5sZW5ndGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgICBjYnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdO1xuICAgIGlmICghY2JzKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIG1vZGlmeUxpc3RlbmVyQ291bnQodGhpcywgZXZlbnQsIC1jYnMubGVuZ3RoKTtcbiAgICAgIHRoaXMuX2V2ZW50c1tldmVudF0gPSBudWxsO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8vIHNwZWNpZmljIGhhbmRsZXJcbiAgICB2YXIgY2I7XG4gICAgdmFyIGkgPSBjYnMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGNiID0gY2JzW2ldO1xuICAgICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgICAgbW9kaWZ5TGlzdGVuZXJDb3VudCh0aGlzLCBldmVudCwgLTEpO1xuICAgICAgICBjYnMuc3BsaWNlKGksIDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYW4gZXZlbnQgb24gc2VsZi5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBldmVudFxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBzaG91bGRQcm9wYWdhdGVcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kZW1pdCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBpc1NvdXJjZSA9IHR5cGVvZiBldmVudCA9PT0gJ3N0cmluZyc7XG4gICAgZXZlbnQgPSBpc1NvdXJjZSA/IGV2ZW50IDogZXZlbnQubmFtZTtcbiAgICB2YXIgY2JzID0gdGhpcy5fZXZlbnRzW2V2ZW50XTtcbiAgICB2YXIgc2hvdWxkUHJvcGFnYXRlID0gaXNTb3VyY2UgfHwgIWNicztcbiAgICBpZiAoY2JzKSB7XG4gICAgICBjYnMgPSBjYnMubGVuZ3RoID4gMSA/IHRvQXJyYXkoY2JzKSA6IGNicztcbiAgICAgIC8vIHRoaXMgaXMgYSBzb21ld2hhdCBoYWNreSBzb2x1dGlvbiB0byB0aGUgcXVlc3Rpb24gcmFpc2VkXG4gICAgICAvLyBpbiAjMjEwMjogZm9yIGFuIGlubGluZSBjb21wb25lbnQgbGlzdGVuZXIgbGlrZSA8Y29tcCBAdGVzdD1cImRvVGhpc1wiPixcbiAgICAgIC8vIHRoZSBwcm9wYWdhdGlvbiBoYW5kbGluZyBpcyBzb21ld2hhdCBicm9rZW4uIFRoZXJlZm9yZSB3ZVxuICAgICAgLy8gbmVlZCB0byB0cmVhdCB0aGVzZSBpbmxpbmUgY2FsbGJhY2tzIGRpZmZlcmVudGx5LlxuICAgICAgdmFyIGhhc1BhcmVudENicyA9IGlzU291cmNlICYmIGNicy5zb21lKGZ1bmN0aW9uIChjYikge1xuICAgICAgICByZXR1cm4gY2IuX2Zyb21QYXJlbnQ7XG4gICAgICB9KTtcbiAgICAgIGlmIChoYXNQYXJlbnRDYnMpIHtcbiAgICAgICAgc2hvdWxkUHJvcGFnYXRlID0gZmFsc2U7XG4gICAgICB9XG4gICAgICB2YXIgYXJncyA9IHRvQXJyYXkoYXJndW1lbnRzLCAxKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2JzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgY2IgPSBjYnNbaV07XG4gICAgICAgIHZhciByZXMgPSBjYi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgaWYgKHJlcyA9PT0gdHJ1ZSAmJiAoIWhhc1BhcmVudENicyB8fCBjYi5fZnJvbVBhcmVudCkpIHtcbiAgICAgICAgICBzaG91bGRQcm9wYWdhdGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzaG91bGRQcm9wYWdhdGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IGJyb2FkY2FzdCBhbiBldmVudCB0byBhbGwgY2hpbGRyZW4gaW5zdGFuY2VzLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGV2ZW50XG4gICAqIEBwYXJhbSB7Li4uKn0gYWRkaXRpb25hbCBhcmd1bWVudHNcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kYnJvYWRjYXN0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIGlzU291cmNlID0gdHlwZW9mIGV2ZW50ID09PSAnc3RyaW5nJztcbiAgICBldmVudCA9IGlzU291cmNlID8gZXZlbnQgOiBldmVudC5uYW1lO1xuICAgIC8vIGlmIG5vIGNoaWxkIGhhcyByZWdpc3RlcmVkIGZvciB0aGlzIGV2ZW50LFxuICAgIC8vIHRoZW4gdGhlcmUncyBubyBuZWVkIHRvIGJyb2FkY2FzdC5cbiAgICBpZiAoIXRoaXMuX2V2ZW50c0NvdW50W2V2ZW50XSkgcmV0dXJuO1xuICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuJGNoaWxkcmVuO1xuICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMpO1xuICAgIGlmIChpc1NvdXJjZSkge1xuICAgICAgLy8gdXNlIG9iamVjdCBldmVudCB0byBpbmRpY2F0ZSBub24tc291cmNlIGVtaXRcbiAgICAgIC8vIG9uIGNoaWxkcmVuXG4gICAgICBhcmdzWzBdID0geyBuYW1lOiBldmVudCwgc291cmNlOiB0aGlzIH07XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgIHZhciBzaG91bGRQcm9wYWdhdGUgPSBjaGlsZC4kZW1pdC5hcHBseShjaGlsZCwgYXJncyk7XG4gICAgICBpZiAoc2hvdWxkUHJvcGFnYXRlKSB7XG4gICAgICAgIGNoaWxkLiRicm9hZGNhc3QuYXBwbHkoY2hpbGQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogUmVjdXJzaXZlbHkgcHJvcGFnYXRlIGFuIGV2ZW50IHVwIHRoZSBwYXJlbnQgY2hhaW4uXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAgKiBAcGFyYW0gey4uLip9IGFkZGl0aW9uYWwgYXJndW1lbnRzXG4gICAqL1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGRpc3BhdGNoID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIHNob3VsZFByb3BhZ2F0ZSA9IHRoaXMuJGVtaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoIXNob3VsZFByb3BhZ2F0ZSkgcmV0dXJuO1xuICAgIHZhciBwYXJlbnQgPSB0aGlzLiRwYXJlbnQ7XG4gICAgdmFyIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cyk7XG4gICAgLy8gdXNlIG9iamVjdCBldmVudCB0byBpbmRpY2F0ZSBub24tc291cmNlIGVtaXRcbiAgICAvLyBvbiBwYXJlbnRzXG4gICAgYXJnc1swXSA9IHsgbmFtZTogZXZlbnQsIHNvdXJjZTogdGhpcyB9O1xuICAgIHdoaWxlIChwYXJlbnQpIHtcbiAgICAgIHNob3VsZFByb3BhZ2F0ZSA9IHBhcmVudC4kZW1pdC5hcHBseShwYXJlbnQsIGFyZ3MpO1xuICAgICAgcGFyZW50ID0gc2hvdWxkUHJvcGFnYXRlID8gcGFyZW50LiRwYXJlbnQgOiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogTW9kaWZ5IHRoZSBsaXN0ZW5lciBjb3VudHMgb24gYWxsIHBhcmVudHMuXG4gICAqIFRoaXMgYm9va2tlZXBpbmcgYWxsb3dzICRicm9hZGNhc3QgdG8gcmV0dXJuIGVhcmx5IHdoZW5cbiAgICogbm8gY2hpbGQgaGFzIGxpc3RlbmVkIHRvIGEgY2VydGFpbiBldmVudC5cbiAgICpcbiAgICogQHBhcmFtIHtWdWV9IHZtXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAgKiBAcGFyYW0ge051bWJlcn0gY291bnRcbiAgICovXG5cbiAgdmFyIGhvb2tSRSA9IC9eaG9vazovO1xuICBmdW5jdGlvbiBtb2RpZnlMaXN0ZW5lckNvdW50KHZtLCBldmVudCwgY291bnQpIHtcbiAgICB2YXIgcGFyZW50ID0gdm0uJHBhcmVudDtcbiAgICAvLyBob29rcyBkbyBub3QgZ2V0IGJyb2FkY2FzdGVkIHNvIG5vIG5lZWRcbiAgICAvLyB0byBkbyBib29ra2VlcGluZyBmb3IgdGhlbVxuICAgIGlmICghcGFyZW50IHx8ICFjb3VudCB8fCBob29rUkUudGVzdChldmVudCkpIHJldHVybjtcbiAgICB3aGlsZSAocGFyZW50KSB7XG4gICAgICBwYXJlbnQuX2V2ZW50c0NvdW50W2V2ZW50XSA9IChwYXJlbnQuX2V2ZW50c0NvdW50W2V2ZW50XSB8fCAwKSArIGNvdW50O1xuICAgICAgcGFyZW50ID0gcGFyZW50LiRwYXJlbnQ7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGxpZmVjeWNsZUFQSSAoVnVlKSB7XG4gIC8qKlxuICAgKiBTZXQgaW5zdGFuY2UgdGFyZ2V0IGVsZW1lbnQgYW5kIGtpY2sgb2ZmIHRoZSBjb21waWxhdGlvblxuICAgKiBwcm9jZXNzLiBUaGUgcGFzc2VkIGluIGBlbGAgY2FuIGJlIGEgc2VsZWN0b3Igc3RyaW5nLCBhblxuICAgKiBleGlzdGluZyBFbGVtZW50LCBvciBhIERvY3VtZW50RnJhZ21lbnQgKGZvciBibG9ja1xuICAgKiBpbnN0YW5jZXMpLlxuICAgKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudHxzdHJpbmd9IGVsXG4gICAqIEBwdWJsaWNcbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kbW91bnQgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICBpZiAodGhpcy5faXNDb21waWxlZCkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKCckbW91bnQoKSBzaG91bGQgYmUgY2FsbGVkIG9ubHkgb25jZS4nLCB0aGlzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWwgPSBxdWVyeShlbCk7XG4gICAgaWYgKCFlbCkge1xuICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB9XG4gICAgdGhpcy5fY29tcGlsZShlbCk7XG4gICAgdGhpcy5faW5pdERPTUhvb2tzKCk7XG4gICAgaWYgKGluRG9jKHRoaXMuJGVsKSkge1xuICAgICAgdGhpcy5fY2FsbEhvb2soJ2F0dGFjaGVkJyk7XG4gICAgICByZWFkeS5jYWxsKHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRvbmNlKCdob29rOmF0dGFjaGVkJywgcmVhZHkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogTWFyayBhbiBpbnN0YW5jZSBhcyByZWFkeS5cbiAgICovXG5cbiAgZnVuY3Rpb24gcmVhZHkoKSB7XG4gICAgdGhpcy5faXNBdHRhY2hlZCA9IHRydWU7XG4gICAgdGhpcy5faXNSZWFkeSA9IHRydWU7XG4gICAgdGhpcy5fY2FsbEhvb2soJ3JlYWR5Jyk7XG4gIH1cblxuICAvKipcbiAgICogVGVhcmRvd24gdGhlIGluc3RhbmNlLCBzaW1wbHkgZGVsZWdhdGUgdG8gdGhlIGludGVybmFsXG4gICAqIF9kZXN0cm95LlxuICAgKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHJlbW92ZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGRlZmVyQ2xlYW51cFxuICAgKi9cblxuICBWdWUucHJvdG90eXBlLiRkZXN0cm95ID0gZnVuY3Rpb24gKHJlbW92ZSwgZGVmZXJDbGVhbnVwKSB7XG4gICAgdGhpcy5fZGVzdHJveShyZW1vdmUsIGRlZmVyQ2xlYW51cCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnRpYWxseSBjb21waWxlIGEgcGllY2Ugb2YgRE9NIGFuZCByZXR1cm4gYVxuICAgKiBkZWNvbXBpbGUgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fSBlbFxuICAgKiBAcGFyYW0ge1Z1ZX0gW2hvc3RdXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbc2NvcGVdXG4gICAqIEBwYXJhbSB7RnJhZ21lbnR9IFtmcmFnXVxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICovXG5cbiAgVnVlLnByb3RvdHlwZS4kY29tcGlsZSA9IGZ1bmN0aW9uIChlbCwgaG9zdCwgc2NvcGUsIGZyYWcpIHtcbiAgICByZXR1cm4gY29tcGlsZShlbCwgdGhpcy4kb3B0aW9ucywgdHJ1ZSkodGhpcywgZWwsIGhvc3QsIHNjb3BlLCBmcmFnKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBUaGUgZXhwb3NlZCBWdWUgY29uc3RydWN0b3IuXG4gKlxuICogQVBJIGNvbnZlbnRpb25zOlxuICogLSBwdWJsaWMgQVBJIG1ldGhvZHMvcHJvcGVydGllcyBhcmUgcHJlZml4ZWQgd2l0aCBgJGBcbiAqIC0gaW50ZXJuYWwgbWV0aG9kcy9wcm9wZXJ0aWVzIGFyZSBwcmVmaXhlZCB3aXRoIGBfYFxuICogLSBub24tcHJlZml4ZWQgcHJvcGVydGllcyBhcmUgYXNzdW1lZCB0byBiZSBwcm94aWVkIHVzZXJcbiAqICAgZGF0YS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBWdWUob3B0aW9ucykge1xuICB0aGlzLl9pbml0KG9wdGlvbnMpO1xufVxuXG4vLyBpbnN0YWxsIGludGVybmFsc1xuaW5pdE1peGluKFZ1ZSk7XG5zdGF0ZU1peGluKFZ1ZSk7XG5ldmVudHNNaXhpbihWdWUpO1xubGlmZWN5Y2xlTWl4aW4oVnVlKTtcbm1pc2NNaXhpbihWdWUpO1xuXG4vLyBpbnN0YWxsIGluc3RhbmNlIEFQSXNcbmRhdGFBUEkoVnVlKTtcbmRvbUFQSShWdWUpO1xuZXZlbnRzQVBJKFZ1ZSk7XG5saWZlY3ljbGVBUEkoVnVlKTtcblxudmFyIHNsb3QgPSB7XG5cbiAgcHJpb3JpdHk6IFNMT1QsXG4gIHBhcmFtczogWyduYW1lJ10sXG5cbiAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAvLyB0aGlzIHdhcyByZXNvbHZlZCBkdXJpbmcgY29tcG9uZW50IHRyYW5zY2x1c2lvblxuICAgIHZhciBuYW1lID0gdGhpcy5wYXJhbXMubmFtZSB8fCAnZGVmYXVsdCc7XG4gICAgdmFyIGNvbnRlbnQgPSB0aGlzLnZtLl9zbG90Q29udGVudHMgJiYgdGhpcy52bS5fc2xvdENvbnRlbnRzW25hbWVdO1xuICAgIGlmICghY29udGVudCB8fCAhY29udGVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgIHRoaXMuZmFsbGJhY2soKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb21waWxlKGNvbnRlbnQuY2xvbmVOb2RlKHRydWUpLCB0aGlzLnZtLl9jb250ZXh0LCB0aGlzLnZtKTtcbiAgICB9XG4gIH0sXG5cbiAgY29tcGlsZTogZnVuY3Rpb24gY29tcGlsZShjb250ZW50LCBjb250ZXh0LCBob3N0KSB7XG4gICAgaWYgKGNvbnRlbnQgJiYgY29udGV4dCkge1xuICAgICAgaWYgKHRoaXMuZWwuaGFzQ2hpbGROb2RlcygpICYmIGNvbnRlbnQuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEgJiYgY29udGVudC5jaGlsZE5vZGVzWzBdLm5vZGVUeXBlID09PSAxICYmIGNvbnRlbnQuY2hpbGROb2Rlc1swXS5oYXNBdHRyaWJ1dGUoJ3YtaWYnKSkge1xuICAgICAgICAvLyBpZiB0aGUgaW5zZXJ0ZWQgc2xvdCBoYXMgdi1pZlxuICAgICAgICAvLyBpbmplY3QgZmFsbGJhY2sgY29udGVudCBhcyB0aGUgdi1lbHNlXG4gICAgICAgIHZhciBlbHNlQmxvY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgICAgICBlbHNlQmxvY2suc2V0QXR0cmlidXRlKCd2LWVsc2UnLCAnJyk7XG4gICAgICAgIGVsc2VCbG9jay5pbm5lckhUTUwgPSB0aGlzLmVsLmlubmVySFRNTDtcbiAgICAgICAgLy8gdGhlIGVsc2UgYmxvY2sgc2hvdWxkIGJlIGNvbXBpbGVkIGluIGNoaWxkIHNjb3BlXG4gICAgICAgIGVsc2VCbG9jay5fY29udGV4dCA9IHRoaXMudm07XG4gICAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoZWxzZUJsb2NrKTtcbiAgICAgIH1cbiAgICAgIHZhciBzY29wZSA9IGhvc3QgPyBob3N0Ll9zY29wZSA6IHRoaXMuX3Njb3BlO1xuICAgICAgdGhpcy51bmxpbmsgPSBjb250ZXh0LiRjb21waWxlKGNvbnRlbnQsIGhvc3QsIHNjb3BlLCB0aGlzLl9mcmFnKTtcbiAgICB9XG4gICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgIHJlcGxhY2UodGhpcy5lbCwgY29udGVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZSh0aGlzLmVsKTtcbiAgICB9XG4gIH0sXG5cbiAgZmFsbGJhY2s6IGZ1bmN0aW9uIGZhbGxiYWNrKCkge1xuICAgIHRoaXMuY29tcGlsZShleHRyYWN0Q29udGVudCh0aGlzLmVsLCB0cnVlKSwgdGhpcy52bSk7XG4gIH0sXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgaWYgKHRoaXMudW5saW5rKSB7XG4gICAgICB0aGlzLnVubGluaygpO1xuICAgIH1cbiAgfVxufTtcblxudmFyIHBhcnRpYWwgPSB7XG5cbiAgcHJpb3JpdHk6IFBBUlRJQUwsXG5cbiAgcGFyYW1zOiBbJ25hbWUnXSxcblxuICAvLyB3YXRjaCBjaGFuZ2VzIHRvIG5hbWUgZm9yIGR5bmFtaWMgcGFydGlhbHNcbiAgcGFyYW1XYXRjaGVyczoge1xuICAgIG5hbWU6IGZ1bmN0aW9uIG5hbWUodmFsdWUpIHtcbiAgICAgIHZJZi5yZW1vdmUuY2FsbCh0aGlzKTtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICB0aGlzLmluc2VydCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgdGhpcy5hbmNob3IgPSBjcmVhdGVBbmNob3IoJ3YtcGFydGlhbCcpO1xuICAgIHJlcGxhY2UodGhpcy5lbCwgdGhpcy5hbmNob3IpO1xuICAgIHRoaXMuaW5zZXJ0KHRoaXMucGFyYW1zLm5hbWUpO1xuICB9LFxuXG4gIGluc2VydDogZnVuY3Rpb24gaW5zZXJ0KGlkKSB7XG4gICAgdmFyIHBhcnRpYWwgPSByZXNvbHZlQXNzZXQodGhpcy52bS4kb3B0aW9ucywgJ3BhcnRpYWxzJywgaWQsIHRydWUpO1xuICAgIGlmIChwYXJ0aWFsKSB7XG4gICAgICB0aGlzLmZhY3RvcnkgPSBuZXcgRnJhZ21lbnRGYWN0b3J5KHRoaXMudm0sIHBhcnRpYWwpO1xuICAgICAgdklmLmluc2VydC5jYWxsKHRoaXMpO1xuICAgIH1cbiAgfSxcblxuICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICBpZiAodGhpcy5mcmFnKSB7XG4gICAgICB0aGlzLmZyYWcuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufTtcblxudmFyIGVsZW1lbnREaXJlY3RpdmVzID0ge1xuICBzbG90OiBzbG90LFxuICBwYXJ0aWFsOiBwYXJ0aWFsXG59O1xuXG52YXIgY29udmVydEFycmF5ID0gdkZvci5fcG9zdFByb2Nlc3M7XG5cbi8qKlxuICogTGltaXQgZmlsdGVyIGZvciBhcnJheXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCAoRGVjaW1hbCBleHBlY3RlZClcbiAqL1xuXG5mdW5jdGlvbiBsaW1pdEJ5KGFyciwgbiwgb2Zmc2V0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA/IHBhcnNlSW50KG9mZnNldCwgMTApIDogMDtcbiAgbiA9IHRvTnVtYmVyKG4pO1xuICByZXR1cm4gdHlwZW9mIG4gPT09ICdudW1iZXInID8gYXJyLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgbikgOiBhcnI7XG59XG5cbi8qKlxuICogRmlsdGVyIGZpbHRlciBmb3IgYXJyYXlzXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlYXJjaFxuICogQHBhcmFtIHtTdHJpbmd9IFtkZWxpbWl0ZXJdXG4gKiBAcGFyYW0ge1N0cmluZ30gLi4uZGF0YUtleXNcbiAqL1xuXG5mdW5jdGlvbiBmaWx0ZXJCeShhcnIsIHNlYXJjaCwgZGVsaW1pdGVyKSB7XG4gIGFyciA9IGNvbnZlcnRBcnJheShhcnIpO1xuICBpZiAoc2VhcmNoID09IG51bGwpIHtcbiAgICByZXR1cm4gYXJyO1xuICB9XG4gIGlmICh0eXBlb2Ygc2VhcmNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGFyci5maWx0ZXIoc2VhcmNoKTtcbiAgfVxuICAvLyBjYXN0IHRvIGxvd2VyY2FzZSBzdHJpbmdcbiAgc2VhcmNoID0gKCcnICsgc2VhcmNoKS50b0xvd2VyQ2FzZSgpO1xuICAvLyBhbGxvdyBvcHRpb25hbCBgaW5gIGRlbGltaXRlclxuICAvLyBiZWNhdXNlIHdoeSBub3RcbiAgdmFyIG4gPSBkZWxpbWl0ZXIgPT09ICdpbicgPyAzIDogMjtcbiAgLy8gZXh0cmFjdCBhbmQgZmxhdHRlbiBrZXlzXG4gIHZhciBrZXlzID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdG9BcnJheShhcmd1bWVudHMsIG4pKTtcbiAgdmFyIHJlcyA9IFtdO1xuICB2YXIgaXRlbSwga2V5LCB2YWwsIGo7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGl0ZW0gPSBhcnJbaV07XG4gICAgdmFsID0gaXRlbSAmJiBpdGVtLiR2YWx1ZSB8fCBpdGVtO1xuICAgIGogPSBrZXlzLmxlbmd0aDtcbiAgICBpZiAoaikge1xuICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICBrZXkgPSBrZXlzW2pdO1xuICAgICAgICBpZiAoa2V5ID09PSAnJGtleScgJiYgY29udGFpbnMoaXRlbS4ka2V5LCBzZWFyY2gpIHx8IGNvbnRhaW5zKGdldFBhdGgodmFsLCBrZXkpLCBzZWFyY2gpKSB7XG4gICAgICAgICAgcmVzLnB1c2goaXRlbSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKGl0ZW0sIHNlYXJjaCkpIHtcbiAgICAgIHJlcy5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEZpbHRlciBmaWx0ZXIgZm9yIGFycmF5c1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5PFN0cmluZz58RnVuY3Rpb259IC4uLnNvcnRLZXlzXG4gKiBAcGFyYW0ge051bWJlcn0gW29yZGVyXVxuICovXG5cbmZ1bmN0aW9uIG9yZGVyQnkoYXJyKSB7XG4gIHZhciBjb21wYXJhdG9yID0gbnVsbDtcbiAgdmFyIHNvcnRLZXlzID0gdW5kZWZpbmVkO1xuICBhcnIgPSBjb252ZXJ0QXJyYXkoYXJyKTtcblxuICAvLyBkZXRlcm1pbmUgb3JkZXIgKGxhc3QgYXJndW1lbnQpXG4gIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMsIDEpO1xuICB2YXIgb3JkZXIgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gIGlmICh0eXBlb2Ygb3JkZXIgPT09ICdudW1iZXInKSB7XG4gICAgb3JkZXIgPSBvcmRlciA8IDAgPyAtMSA6IDE7XG4gICAgYXJncyA9IGFyZ3MubGVuZ3RoID4gMSA/IGFyZ3Muc2xpY2UoMCwgLTEpIDogYXJncztcbiAgfSBlbHNlIHtcbiAgICBvcmRlciA9IDE7XG4gIH1cblxuICAvLyBkZXRlcm1pbmUgc29ydEtleXMgJiBjb21wYXJhdG9yXG4gIHZhciBmaXJzdEFyZyA9IGFyZ3NbMF07XG4gIGlmICghZmlyc3RBcmcpIHtcbiAgICByZXR1cm4gYXJyO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBmaXJzdEFyZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIGN1c3RvbSBjb21wYXJhdG9yXG4gICAgY29tcGFyYXRvciA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gZmlyc3RBcmcoYSwgYikgKiBvcmRlcjtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIC8vIHN0cmluZyBrZXlzLiBmbGF0dGVuIGZpcnN0XG4gICAgc29ydEtleXMgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBhcmdzKTtcbiAgICBjb21wYXJhdG9yID0gZnVuY3Rpb24gKGEsIGIsIGkpIHtcbiAgICAgIGkgPSBpIHx8IDA7XG4gICAgICByZXR1cm4gaSA+PSBzb3J0S2V5cy5sZW5ndGggLSAxID8gYmFzZUNvbXBhcmUoYSwgYiwgaSkgOiBiYXNlQ29tcGFyZShhLCBiLCBpKSB8fCBjb21wYXJhdG9yKGEsIGIsIGkgKyAxKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gYmFzZUNvbXBhcmUoYSwgYiwgc29ydEtleUluZGV4KSB7XG4gICAgdmFyIHNvcnRLZXkgPSBzb3J0S2V5c1tzb3J0S2V5SW5kZXhdO1xuICAgIGlmIChzb3J0S2V5KSB7XG4gICAgICBpZiAoc29ydEtleSAhPT0gJyRrZXknKSB7XG4gICAgICAgIGlmIChpc09iamVjdChhKSAmJiAnJHZhbHVlJyBpbiBhKSBhID0gYS4kdmFsdWU7XG4gICAgICAgIGlmIChpc09iamVjdChiKSAmJiAnJHZhbHVlJyBpbiBiKSBiID0gYi4kdmFsdWU7XG4gICAgICB9XG4gICAgICBhID0gaXNPYmplY3QoYSkgPyBnZXRQYXRoKGEsIHNvcnRLZXkpIDogYTtcbiAgICAgIGIgPSBpc09iamVjdChiKSA/IGdldFBhdGgoYiwgc29ydEtleSkgOiBiO1xuICAgIH1cbiAgICByZXR1cm4gYSA9PT0gYiA/IDAgOiBhID4gYiA/IG9yZGVyIDogLW9yZGVyO1xuICB9XG5cbiAgLy8gc29ydCBvbiBhIGNvcHkgdG8gYXZvaWQgbXV0YXRpbmcgb3JpZ2luYWwgYXJyYXlcbiAgcmV0dXJuIGFyci5zbGljZSgpLnNvcnQoY29tcGFyYXRvcik7XG59XG5cbi8qKlxuICogU3RyaW5nIGNvbnRhaW4gaGVscGVyXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWFyY2hcbiAqL1xuXG5mdW5jdGlvbiBjb250YWlucyh2YWwsIHNlYXJjaCkge1xuICB2YXIgaTtcbiAgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsKTtcbiAgICBpID0ga2V5cy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKGNvbnRhaW5zKHZhbFtrZXlzW2ldXSwgc2VhcmNoKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgaSA9IHZhbC5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKGNvbnRhaW5zKHZhbFtpXSwgc2VhcmNoKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAodmFsICE9IG51bGwpIHtcbiAgICByZXR1cm4gdmFsLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaCkgPiAtMTtcbiAgfVxufVxuXG52YXIgZGlnaXRzUkUgPSAvKFxcZHszfSkoPz1cXGQpL2c7XG5cbi8vIGFzc2V0IGNvbGxlY3Rpb25zIG11c3QgYmUgYSBwbGFpbiBvYmplY3QuXG52YXIgZmlsdGVycyA9IHtcblxuICBvcmRlckJ5OiBvcmRlckJ5LFxuICBmaWx0ZXJCeTogZmlsdGVyQnksXG4gIGxpbWl0Qnk6IGxpbWl0QnksXG5cbiAgLyoqXG4gICAqIFN0cmluZ2lmeSB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGVudFxuICAgKi9cblxuICBqc29uOiB7XG4gICAgcmVhZDogZnVuY3Rpb24gcmVhZCh2YWx1ZSwgaW5kZW50KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gaW5kZW50IDogMik7XG4gICAgfSxcbiAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUodmFsdWUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogJ2FiYycgPT4gJ0FiYydcbiAgICovXG5cbiAgY2FwaXRhbGl6ZTogZnVuY3Rpb24gY2FwaXRhbGl6ZSh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHJldHVybiAnJztcbiAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgcmV0dXJuIHZhbHVlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdmFsdWUuc2xpY2UoMSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqICdhYmMnID0+ICdBQkMnXG4gICAqL1xuXG4gIHVwcGVyY2FzZTogZnVuY3Rpb24gdXBwZXJjYXNlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlIHx8IHZhbHVlID09PSAwID8gdmFsdWUudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpIDogJyc7XG4gIH0sXG5cbiAgLyoqXG4gICAqICdBYkMnID0+ICdhYmMnXG4gICAqL1xuXG4gIGxvd2VyY2FzZTogZnVuY3Rpb24gbG93ZXJjYXNlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlIHx8IHZhbHVlID09PSAwID8gdmFsdWUudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpIDogJyc7XG4gIH0sXG5cbiAgLyoqXG4gICAqIDEyMzQ1ID0+ICQxMiwzNDUuMDBcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpZ25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlY2ltYWxzIERlY2ltYWwgcGxhY2VzXG4gICAqL1xuXG4gIGN1cnJlbmN5OiBmdW5jdGlvbiBjdXJyZW5jeSh2YWx1ZSwgX2N1cnJlbmN5LCBkZWNpbWFscykge1xuICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgaWYgKCFpc0Zpbml0ZSh2YWx1ZSkgfHwgIXZhbHVlICYmIHZhbHVlICE9PSAwKSByZXR1cm4gJyc7XG4gICAgX2N1cnJlbmN5ID0gX2N1cnJlbmN5ICE9IG51bGwgPyBfY3VycmVuY3kgOiAnJCc7XG4gICAgZGVjaW1hbHMgPSBkZWNpbWFscyAhPSBudWxsID8gZGVjaW1hbHMgOiAyO1xuICAgIHZhciBzdHJpbmdpZmllZCA9IE1hdGguYWJzKHZhbHVlKS50b0ZpeGVkKGRlY2ltYWxzKTtcbiAgICB2YXIgX2ludCA9IGRlY2ltYWxzID8gc3RyaW5naWZpZWQuc2xpY2UoMCwgLTEgLSBkZWNpbWFscykgOiBzdHJpbmdpZmllZDtcbiAgICB2YXIgaSA9IF9pbnQubGVuZ3RoICUgMztcbiAgICB2YXIgaGVhZCA9IGkgPiAwID8gX2ludC5zbGljZSgwLCBpKSArIChfaW50Lmxlbmd0aCA+IDMgPyAnLCcgOiAnJykgOiAnJztcbiAgICB2YXIgX2Zsb2F0ID0gZGVjaW1hbHMgPyBzdHJpbmdpZmllZC5zbGljZSgtMSAtIGRlY2ltYWxzKSA6ICcnO1xuICAgIHZhciBzaWduID0gdmFsdWUgPCAwID8gJy0nIDogJyc7XG4gICAgcmV0dXJuIHNpZ24gKyBfY3VycmVuY3kgKyBoZWFkICsgX2ludC5zbGljZShpKS5yZXBsYWNlKGRpZ2l0c1JFLCAnJDEsJykgKyBfZmxvYXQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqICdpdGVtJyA9PiAnaXRlbXMnXG4gICAqXG4gICAqIEBwYXJhbXNcbiAgICogIGFuIGFycmF5IG9mIHN0cmluZ3MgY29ycmVzcG9uZGluZyB0b1xuICAgKiAgdGhlIHNpbmdsZSwgZG91YmxlLCB0cmlwbGUgLi4uIGZvcm1zIG9mIHRoZSB3b3JkIHRvXG4gICAqICBiZSBwbHVyYWxpemVkLiBXaGVuIHRoZSBudW1iZXIgdG8gYmUgcGx1cmFsaXplZFxuICAgKiAgZXhjZWVkcyB0aGUgbGVuZ3RoIG9mIHRoZSBhcmdzLCBpdCB3aWxsIHVzZSB0aGUgbGFzdFxuICAgKiAgZW50cnkgaW4gdGhlIGFycmF5LlxuICAgKlxuICAgKiAgZS5nLiBbJ3NpbmdsZScsICdkb3VibGUnLCAndHJpcGxlJywgJ211bHRpcGxlJ11cbiAgICovXG5cbiAgcGx1cmFsaXplOiBmdW5jdGlvbiBwbHVyYWxpemUodmFsdWUpIHtcbiAgICB2YXIgYXJncyA9IHRvQXJyYXkoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgbGVuZ3RoID0gYXJncy5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCA+IDEpIHtcbiAgICAgIHZhciBpbmRleCA9IHZhbHVlICUgMTAgLSAxO1xuICAgICAgcmV0dXJuIGluZGV4IGluIGFyZ3MgPyBhcmdzW2luZGV4XSA6IGFyZ3NbbGVuZ3RoIC0gMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhcmdzWzBdICsgKHZhbHVlID09PSAxID8gJycgOiAncycpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRGVib3VuY2UgYSBoYW5kbGVyIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZWxheSA9IDMwMFxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICovXG5cbiAgZGVib3VuY2U6IGZ1bmN0aW9uIGRlYm91bmNlKGhhbmRsZXIsIGRlbGF5KSB7XG4gICAgaWYgKCFoYW5kbGVyKSByZXR1cm47XG4gICAgaWYgKCFkZWxheSkge1xuICAgICAgZGVsYXkgPSAzMDA7XG4gICAgfVxuICAgIHJldHVybiBfZGVib3VuY2UoaGFuZGxlciwgZGVsYXkpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBpbnN0YWxsR2xvYmFsQVBJIChWdWUpIHtcbiAgLyoqXG4gICAqIFZ1ZSBhbmQgZXZlcnkgY29uc3RydWN0b3IgdGhhdCBleHRlbmRzIFZ1ZSBoYXMgYW5cbiAgICogYXNzb2NpYXRlZCBvcHRpb25zIG9iamVjdCwgd2hpY2ggY2FuIGJlIGFjY2Vzc2VkIGR1cmluZ1xuICAgKiBjb21waWxhdGlvbiBzdGVwcyBhcyBgdGhpcy5jb25zdHJ1Y3Rvci5vcHRpb25zYC5cbiAgICpcbiAgICogVGhlc2UgY2FuIGJlIHNlZW4gYXMgdGhlIGRlZmF1bHQgb3B0aW9ucyBvZiBldmVyeVxuICAgKiBWdWUgaW5zdGFuY2UuXG4gICAqL1xuXG4gIFZ1ZS5vcHRpb25zID0ge1xuICAgIGRpcmVjdGl2ZXM6IGRpcmVjdGl2ZXMsXG4gICAgZWxlbWVudERpcmVjdGl2ZXM6IGVsZW1lbnREaXJlY3RpdmVzLFxuICAgIGZpbHRlcnM6IGZpbHRlcnMsXG4gICAgdHJhbnNpdGlvbnM6IHt9LFxuICAgIGNvbXBvbmVudHM6IHt9LFxuICAgIHBhcnRpYWxzOiB7fSxcbiAgICByZXBsYWNlOiB0cnVlXG4gIH07XG5cbiAgLyoqXG4gICAqIEV4cG9zZSB1c2VmdWwgaW50ZXJuYWxzXG4gICAqL1xuXG4gIFZ1ZS51dGlsID0gdXRpbDtcbiAgVnVlLmNvbmZpZyA9IGNvbmZpZztcbiAgVnVlLnNldCA9IHNldDtcbiAgVnVlWydkZWxldGUnXSA9IGRlbDtcbiAgVnVlLm5leHRUaWNrID0gbmV4dFRpY2s7XG5cbiAgLyoqXG4gICAqIFRoZSBmb2xsb3dpbmcgYXJlIGV4cG9zZWQgZm9yIGFkdmFuY2VkIHVzYWdlIC8gcGx1Z2luc1xuICAgKi9cblxuICBWdWUuY29tcGlsZXIgPSBjb21waWxlcjtcbiAgVnVlLkZyYWdtZW50RmFjdG9yeSA9IEZyYWdtZW50RmFjdG9yeTtcbiAgVnVlLmludGVybmFsRGlyZWN0aXZlcyA9IGludGVybmFsRGlyZWN0aXZlcztcbiAgVnVlLnBhcnNlcnMgPSB7XG4gICAgcGF0aDogcGF0aCxcbiAgICB0ZXh0OiB0ZXh0LFxuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgICBkaXJlY3RpdmU6IGRpcmVjdGl2ZSxcbiAgICBleHByZXNzaW9uOiBleHByZXNzaW9uXG4gIH07XG5cbiAgLyoqXG4gICAqIEVhY2ggaW5zdGFuY2UgY29uc3RydWN0b3IsIGluY2x1ZGluZyBWdWUsIGhhcyBhIHVuaXF1ZVxuICAgKiBjaWQuIFRoaXMgZW5hYmxlcyB1cyB0byBjcmVhdGUgd3JhcHBlZCBcImNoaWxkXG4gICAqIGNvbnN0cnVjdG9yc1wiIGZvciBwcm90b3R5cGFsIGluaGVyaXRhbmNlIGFuZCBjYWNoZSB0aGVtLlxuICAgKi9cblxuICBWdWUuY2lkID0gMDtcbiAgdmFyIGNpZCA9IDE7XG5cbiAgLyoqXG4gICAqIENsYXNzIGluaGVyaXRhbmNlXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBleHRlbmRPcHRpb25zXG4gICAqL1xuXG4gIFZ1ZS5leHRlbmQgPSBmdW5jdGlvbiAoZXh0ZW5kT3B0aW9ucykge1xuICAgIGV4dGVuZE9wdGlvbnMgPSBleHRlbmRPcHRpb25zIHx8IHt9O1xuICAgIHZhciBTdXBlciA9IHRoaXM7XG4gICAgdmFyIGlzRmlyc3RFeHRlbmQgPSBTdXBlci5jaWQgPT09IDA7XG4gICAgaWYgKGlzRmlyc3RFeHRlbmQgJiYgZXh0ZW5kT3B0aW9ucy5fQ3Rvcikge1xuICAgICAgcmV0dXJuIGV4dGVuZE9wdGlvbnMuX0N0b3I7XG4gICAgfVxuICAgIHZhciBuYW1lID0gZXh0ZW5kT3B0aW9ucy5uYW1lIHx8IFN1cGVyLm9wdGlvbnMubmFtZTtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgaWYgKCEvXlthLXpBLVpdW1xcdy1dKiQvLnRlc3QobmFtZSkpIHtcbiAgICAgICAgd2FybignSW52YWxpZCBjb21wb25lbnQgbmFtZTogXCInICsgbmFtZSArICdcIi4gQ29tcG9uZW50IG5hbWVzICcgKyAnY2FuIG9ubHkgY29udGFpbiBhbHBoYW51bWVyaWMgY2hhcmFjYXRlcnMgYW5kIHRoZSBoeXBoZW4uJyk7XG4gICAgICAgIG5hbWUgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgU3ViID0gY3JlYXRlQ2xhc3MobmFtZSB8fCAnVnVlQ29tcG9uZW50Jyk7XG4gICAgU3ViLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU3VwZXIucHJvdG90eXBlKTtcbiAgICBTdWIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3ViO1xuICAgIFN1Yi5jaWQgPSBjaWQrKztcbiAgICBTdWIub3B0aW9ucyA9IG1lcmdlT3B0aW9ucyhTdXBlci5vcHRpb25zLCBleHRlbmRPcHRpb25zKTtcbiAgICBTdWJbJ3N1cGVyJ10gPSBTdXBlcjtcbiAgICAvLyBhbGxvdyBmdXJ0aGVyIGV4dGVuc2lvblxuICAgIFN1Yi5leHRlbmQgPSBTdXBlci5leHRlbmQ7XG4gICAgLy8gY3JlYXRlIGFzc2V0IHJlZ2lzdGVycywgc28gZXh0ZW5kZWQgY2xhc3Nlc1xuICAgIC8vIGNhbiBoYXZlIHRoZWlyIHByaXZhdGUgYXNzZXRzIHRvby5cbiAgICBjb25maWcuX2Fzc2V0VHlwZXMuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICAgICAgU3ViW3R5cGVdID0gU3VwZXJbdHlwZV07XG4gICAgfSk7XG4gICAgLy8gZW5hYmxlIHJlY3Vyc2l2ZSBzZWxmLWxvb2t1cFxuICAgIGlmIChuYW1lKSB7XG4gICAgICBTdWIub3B0aW9ucy5jb21wb25lbnRzW25hbWVdID0gU3ViO1xuICAgIH1cbiAgICAvLyBjYWNoZSBjb25zdHJ1Y3RvclxuICAgIGlmIChpc0ZpcnN0RXh0ZW5kKSB7XG4gICAgICBleHRlbmRPcHRpb25zLl9DdG9yID0gU3ViO1xuICAgIH1cbiAgICByZXR1cm4gU3ViO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHN1Yi1jbGFzcyBjb25zdHJ1Y3RvciB3aXRoIHRoZVxuICAgKiBnaXZlbiBuYW1lLiBUaGlzIGdpdmVzIHVzIG11Y2ggbmljZXIgb3V0cHV0IHdoZW5cbiAgICogbG9nZ2luZyBpbnN0YW5jZXMgaW4gdGhlIGNvbnNvbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKi9cblxuICBmdW5jdGlvbiBjcmVhdGVDbGFzcyhuYW1lKSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tbmV3LWZ1bmMgKi9cbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdyZXR1cm4gZnVuY3Rpb24gJyArIGNsYXNzaWZ5KG5hbWUpICsgJyAob3B0aW9ucykgeyB0aGlzLl9pbml0KG9wdGlvbnMpIH0nKSgpO1xuICAgIC8qIGVzbGludC1lbmFibGUgbm8tbmV3LWZ1bmMgKi9cbiAgfVxuXG4gIC8qKlxuICAgKiBQbHVnaW4gc3lzdGVtXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW5cbiAgICovXG5cbiAgVnVlLnVzZSA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAocGx1Z2luLmluc3RhbGxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBhZGRpdGlvbmFsIHBhcmFtZXRlcnNcbiAgICB2YXIgYXJncyA9IHRvQXJyYXkoYXJndW1lbnRzLCAxKTtcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgaWYgKHR5cGVvZiBwbHVnaW4uaW5zdGFsbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcGx1Z2luLmluc3RhbGwuYXBwbHkocGx1Z2luLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGx1Z2luLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH1cbiAgICBwbHVnaW4uaW5zdGFsbGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogQXBwbHkgYSBnbG9iYWwgbWl4aW4gYnkgbWVyZ2luZyBpdCBpbnRvIHRoZSBkZWZhdWx0XG4gICAqIG9wdGlvbnMuXG4gICAqL1xuXG4gIFZ1ZS5taXhpbiA9IGZ1bmN0aW9uIChtaXhpbikge1xuICAgIFZ1ZS5vcHRpb25zID0gbWVyZ2VPcHRpb25zKFZ1ZS5vcHRpb25zLCBtaXhpbik7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhc3NldCByZWdpc3RyYXRpb24gbWV0aG9kcyB3aXRoIHRoZSBmb2xsb3dpbmdcbiAgICogc2lnbmF0dXJlOlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gaWRcbiAgICogQHBhcmFtIHsqfSBkZWZpbml0aW9uXG4gICAqL1xuXG4gIGNvbmZpZy5fYXNzZXRUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgVnVlW3R5cGVdID0gZnVuY3Rpb24gKGlkLCBkZWZpbml0aW9uKSB7XG4gICAgICBpZiAoIWRlZmluaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1t0eXBlICsgJ3MnXVtpZF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICBpZiAodHlwZSA9PT0gJ2NvbXBvbmVudCcgJiYgKGNvbW1vblRhZ1JFLnRlc3QoaWQpIHx8IHJlc2VydmVkVGFnUkUudGVzdChpZCkpKSB7XG4gICAgICAgICAgICB3YXJuKCdEbyBub3QgdXNlIGJ1aWx0LWluIG9yIHJlc2VydmVkIEhUTUwgZWxlbWVudHMgYXMgY29tcG9uZW50ICcgKyAnaWQ6ICcgKyBpZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09PSAnY29tcG9uZW50JyAmJiBpc1BsYWluT2JqZWN0KGRlZmluaXRpb24pKSB7XG4gICAgICAgICAgaWYgKCFkZWZpbml0aW9uLm5hbWUpIHtcbiAgICAgICAgICAgIGRlZmluaXRpb24ubmFtZSA9IGlkO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWZpbml0aW9uID0gVnVlLmV4dGVuZChkZWZpbml0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9wdGlvbnNbdHlwZSArICdzJ11baWRdID0gZGVmaW5pdGlvbjtcbiAgICAgICAgcmV0dXJuIGRlZmluaXRpb247XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gZXhwb3NlIGludGVybmFsIHRyYW5zaXRpb24gQVBJXG4gIGV4dGVuZChWdWUudHJhbnNpdGlvbiwgdHJhbnNpdGlvbik7XG59XG5cbmluc3RhbGxHbG9iYWxBUEkoVnVlKTtcblxuVnVlLnZlcnNpb24gPSAnMS4wLjI2JztcblxuLy8gZGV2dG9vbHMgZ2xvYmFsIGhvb2tcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgaWYgKGNvbmZpZy5kZXZ0b29scykge1xuICAgIGlmIChkZXZ0b29scykge1xuICAgICAgZGV2dG9vbHMuZW1pdCgnaW5pdCcsIFZ1ZSk7XG4gICAgfSBlbHNlIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIGluQnJvd3NlciAmJiAvQ2hyb21lXFwvXFxkKy8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdEb3dubG9hZCB0aGUgVnVlIERldnRvb2xzIGZvciBhIGJldHRlciBkZXZlbG9wbWVudCBleHBlcmllbmNlOlxcbicgKyAnaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS1kZXZ0b29scycpO1xuICAgIH1cbiAgfVxufSwgMCk7XG5cbm1vZHVsZS5leHBvcnRzID0gVnVlOyIsIid1c2Ugc3RyaWN0Jztcbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jb25zdFxuICBWdWUgPSByZXF1aXJlKCd2dWUnKSxcbiAgVnVlUm91dGVyID0gcmVxdWlyZSgndnVlLXJvdXRlcicpXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vKipcbiAqIE1vZHVsZSBDb25maWdcbiAqL1xuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuVnVlLnVzZShyZXF1aXJlKCd2dWUtcmVzb3VyY2UnKSk7XG5WdWUuaHR0cC5vcHRpb25zLnJvb3QgPSAnL3Jvb3QnO1xuVnVlLnVzZShWdWVSb3V0ZXIpO1xuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLyoqXG4gKiBWTSBDb21wb25lbnRzXG4gKi9cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNvbnN0XG4gIEhvbWUgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvYXBwX2hvbWUnKSxcbiAgU2lnbl9VcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9hcHBfc2lnbnVwJyksXG4gIEhvdyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9hcHBfaG93LWl0LXdvcmtzJyksXG4gIENvbmZpcm0gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvYXBwX2NvbmZpcm0nKTtcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8qKlxuICogQ3JlYXRlIGJhc2VWTVxuICovXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jb25zdCBhcHAgPSBWdWUuZXh0ZW5kKHtcbiAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGUuaHRtbCcpLFxuICBkYXRhOiAoKSA9PiB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuICBjb21wdXRlZDoge30sXG4gIGNvbXBvbmVudHM6IHtcbiAgICAnYXBwLW5hdic6IHJlcXVpcmUoJy4vY29tcG9uZW50cy9hcHBfbmF2JyksXG4gICAgJ2FwcC1ob21lJzogSG9tZSxcbiAgICAnYXBwLWhvdyc6IEhvdyxcbiAgICAnYXBwLXNpZ24nOiBTaWduX1VwLFxuICAgICdhcHBfY29uZmlybSc6IENvbmZpcm1cbiAgfSxcbiAgbWV0aG9kczoge30sXG4gIGV2ZW50czoge1xuICAgICdzaG93LWNvbmZpcm0nOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kcm91dGUucm91dGVyLmdvKHtuYW1lOiAnY29uZmlybSd9KTtcbiAgICB9LFxuICAgICdzaG93LXNpZ251cCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRyb3V0ZS5yb3V0ZXIuZ28oe25hbWU6ICdzaWduLXVwJ30pO1xuICAgIH0sXG4gICAgJ2NvbmZpcm1lZCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRyb3V0ZS5yb3V0ZXIuZ28oe25hbWU6ICdob21lJ30pO1xuICAgIH1cbiAgfSxcbiAgcmVhZHk6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLiRyb3V0ZS5yb3V0ZXIuZ28oe25hbWU6ICdob21lJ30pO1xuICB9XG59KTtcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8qKlxuICogQ3JlYXRlIHJvdXRlciBpbnN0YW5jZVxuICovXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5sZXQgcm91dGVyID0gbmV3IFZ1ZVJvdXRlcigpO1xuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLyoqXG4gKiBEZWZpbmUgUm91dGVzXG4gKi9cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbnJvdXRlci5tYXAoe1xuICAnL2hvbWUnOiB7XG4gICAgbmFtZTogJ2hvbWUnLFxuICAgIGNvbXBvbmVudDogSG9tZVxuICB9LFxuICAnL3NpZ24tdXAnOiB7XG4gICAgbmFtZTogJ3NpZ24tdXAnLFxuICAgIGNvbXBvbmVudDogU2lnbl9VcFxuICB9LFxuICAnL2hvdyc6IHtcbiAgICBuYW1lOiAnaG93JyxcbiAgICBjb21wb25lbnQ6IEhvd1xuICB9LFxuICAnL2NvbmZpcm0nOiB7XG4gICAgbmFtZTogJ2NvbmZpcm0nLFxuICAgIGNvbXBvbmVudDogQ29uZmlybVxuICB9XG59KTtcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8qKlxuICogU3RhcnQgcm91dGVyXG4gKi9cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbnJvdXRlci5zdGFydChhcHAsICcjYXBwLW1haW4nKTtcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0ge1xuICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZS5odG1sJyksXG4gIGRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdG9rZW46ICcnLFxuICAgICAgY29uZmlybVRva2VuVVJMOiAnL2NvbmZpcm0nXG4gICAgfTtcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIGNvbmZpcm1Ub2tlbjogZnVuY3Rpb24gKCkge1xuICAgICAgaWYodGhpcy50b2tlbi50cmltKCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3Rva2VuOicsIHRoaXMudG9rZW4pO1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICB0b2tlbjogdGhpcy50b2tlbi50cmltKClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRodHRwLnBvc3QodGhpcy5jb25maXJtVG9rZW5VUkwsIHtcbiAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH0pLlxuICAgICAgICAgIHRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3NlcnZlciByZXMnLCByZXMuZGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZGlzcGF0Y2goJ2NvbmZpcm1lZCcpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSkuXG4gICAgICAgICAgY2F0Y2goZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZygneWF3YSBnYXMnLCBpbmZvKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9rZW4gPSAnJ1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmxvZygnb29wcyEnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9ICc8c2VjdGlvbj5cXG4gIDxoMT48aSBjbGFzcz1cImZhIGZhLXNpZ24taW5cIj48L2k+IENvbmZpcm0geW91ciBpZGVudGl0eTwvaDE+XFxuICA8cD5cXG4gICAgUGxlYXNlIGNvbmZpcm0geW91ciBpZGVudGl0eSBieSBlbnRlcmluZyB0aGUgdG9rZW4gc2VudCB0byB0aGUgZW1haWwgYWRkcmVzc1xcbiAgICB5b3UgcHJvdmlkZWQuIFRoYW5rIHlvdS5cXG4gIDwvcD5cXG4gIDxmb3JtPlxcbiAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcbiAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcbiAgICAgIDxsYWJlbCBmb3I9XCJ0b2tlblwiPlRva2VuOjwvbGFiZWw+XFxuICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInRva2VuXCIgdi1tb2RlbD1cInRva2VuXCI+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcbiAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgYnRuLWxhcmdlIHB1bGwtcmlnaHRcIlxcbiAgICAgICAgQGNsaWNrLnN0b3AucHJldmVudD1cImNvbmZpcm1Ub2tlblwiPkNvbmZpcm0hPC9idXR0b24+XFxuICAgIDwvZGl2PlxcbiAgPC9mb3JtPlxcbjwvc2VjdGlvbj5cXG4nOyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0ge1xuICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZS5odG1sJylcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9ICc8aDE+V2VsY29tZSB0byBUZXh0cGVkaWEuLi48L2gxPlxcbjxwPllvdXIgdmlydHVhbCByZXNlYXJjaCBhc3Npc3RhbnQgaW4gdGhlIGNsb3VkITwvcD5cXG4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxzZWN0aW9uPlxcbiAgPGgxPkhvdyBpdCB3b3JrcyE8L2gxPlxcbjwvc2VjdGlvbj5cXG4nOyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZS5odG1sJylcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9ICc8IS0tZnJvbSAvY29tcG9uZW50cy9hcHBfbmF2L3RlbXBsYXRlLmh0bWwgLS0+XFxuPG5hdiBjbGFzcz1cIm5hdmJhciBuYXZiYXItaW52ZXJzZVwiPlxcbiAgPCEtLSBCcmFuZCBhbmQgdG9nZ2xlIGdldCBncm91cGVkIGZvciBiZXR0ZXIgbW9iaWxlIGRpc3BsYXkgLS0+XFxuICA8ZGl2IGNsYXNzPVwibmF2YmFyLWhlYWRlclwiPlxcbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtdGFyZ2V0PVwiI25hdmJhckNvbGxhcHNlXCIgZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiIGNsYXNzPVwibmF2YmFyLXRvZ2dsZVwiPlxcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5Ub2dnbGUgbmF2aWdhdGlvbjwvc3Bhbj5cXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uLWJhclwiPjwvc3Bhbj5cXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uLWJhclwiPjwvc3Bhbj5cXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJpY29uLWJhclwiPjwvc3Bhbj5cXG4gICAgICA8L2J1dHRvbj5cXG4gICAgICA8YSB2LWxpbms9XCJ7bmFtZTogXFwnaG9tZVxcJ31cIiBjbGFzcz1cIm5hdmJhci1icmFuZFwiIGlkPVwiYXBwLWxhYmVsXCI+VGV4dHBlZGlhPC9hPlxcbiAgPC9kaXY+XFxuICA8IS0tIENvbGxlY3Rpb24gb2YgbmF2IGxpbmtzIGFuZCBvdGhlciBjb250ZW50IGZvciB0b2dnbGluZyAtLT5cXG4gIDxkaXYgaWQ9XCJuYXZiYXJDb2xsYXBzZVwiIGNsYXNzPVwiY29sbGFwc2UgbmF2YmFyLWNvbGxhcHNlXCI+XFxuICAgIDx1bCBjbGFzcz1cIm5hdiBuYXZiYXItbmF2XCI+XFxuICAgICAgPGxpPjxhIHYtbGluaz1cIntuYW1lOiBcXCdob21lXFwnfVwiPkhvbWU8L2E+PC9saT5cXG4gICAgICA8bGk+PGEgdi1saW5rPVwie25hbWU6IFxcJ3NpZ24tdXBcXCd9XCI+U2lnbiBVcDwvYT48L2xpPlxcbiAgICAgIDxsaT48YSB2LWxpbms9XCJ7bmFtZTogXFwnaG93XFwnfVwiPkhvdyBJdCBXb3JrczwvYT48L2xpPlxcbiAgICA8L3VsPlxcbiAgPC9kaXY+XFxuPC9uYXY+XFxuJzsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGUuaHRtbCcpLFxuICBkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVtYWlsOiAnJyxcbiAgICAgIHBob25lTnVtYmVyOiAnJyxcbiAgICAgIHN1Ym1pdFVSTDogJy9zdWJtaXQnXG4gICAgfTtcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIHN1Ym1pdENyZWRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZih0aGlzLmVtYWlsLnRyaW0oKSAmJiB0aGlzLnBob25lTnVtYmVyLnRyaW0oKSkge1xuICAgICAgICBjb25zb2xlLmxvZygndmFsaWQgY3JlZHMnKTtcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgZW1haWw6IHRoaXMuZW1haWwudHJpbSgpLFxuICAgICAgICAgIHBob25lTnVtYmVyOiB0aGlzLnBob25lTnVtYmVyLnRyaW0oKVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLiRodHRwLnBvc3QodGhpcy5zdWJtaXRVUkwsIHtcbiAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH0pLlxuICAgICAgICAgIHRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3NlcnZlciByZXNwJywgcmVzLmRhdGEpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGRpc3BhdGNoKCdzaG93LWNvbmZpcm0nKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpLlxuICAgICAgICAgIGNhdGNoKGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2coJ3lhd2EgZ2FzJywgaW5mbyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLmVtYWlsID0gdGhpcy5waG9uZU51bWJlciA9ICcnO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmxvZygnb29wcycpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gJzxzZWN0aW9uPlxcbiAgPGgxPjxpIGNsYXNzPVwiZmEgZmEtc2lnbi1pblwiPjwvaT4gU2lnbiBVcCE8L2gxPlxcbiAgPGZvcm0+XFxuICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuICAgICAgPGxhYmVsIGZvcj1cImVtYWlsXCI+RW1haWwgQWRkcmVzczo8L2xhYmVsPlxcbiAgICAgIDxpbnB1dCB0eXBlPVwiZW1haWxcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwiZW1haWxcIiBwbGFjZWhvbGRlcj1cIkVtYWlsXCIgdi1tb2RlbD1cImVtYWlsXCI+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcbiAgICAgIDxsYWJlbCBmb3I9XCJwaG9uZS1udW1iZXJcIj5QaG9uZSBOdW1iZXI6PC9sYWJlbD5cXG4gICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImZvcm0tY29udHJvbFwiIGlkPVwicGhvbmUtbnVtYmVyXCIgdi1tb2RlbD1cInBob25lTnVtYmVyXCI+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cFwiPlxcbiAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgYnRuLWxhcmdlIHB1bGwtcmlnaHRcIlxcbiAgICAgICAgQGNsaWNrLnN0b3AucHJldmVudD1cInN1Ym1pdENyZWRzXCI+R08hPC9idXR0b24+XFxuICAgIDwvZGl2PlxcbiAgPC9mb3JtPlxcbjwvc2VjdGlvbj5cXG4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxhcHAtbmF2IGlkPVwiYXBwLW5hdlwiPjwvYXBwLW5hdj5cXG48cm91dGVyLXZpZXc+PC9yb3V0ZXItdmlldz5cXG4nOyJdfQ==
