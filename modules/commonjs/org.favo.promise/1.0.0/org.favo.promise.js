(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g=(g.org||(g.org = {}));g=(g.favo||(g.favo = {}));g.promise = f()}})(function(){var define,module,exports;return (function e(t,n,r){function o(i,u){if(!n[i]){if(!t[i]){var a=typeof require=="function"&&require;if(!u&&a)return a.length===2?a(i,!0):a(i);if(s&&s.length===2)return s(i,!0);if(s)return s(i);var f=new Error("Cannot find module '"+i+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[i]={exports:{}};t[i][0].call(l.exports,function(e){var n=t[i][1][e];return o(n?n:e)},l,l.exports,e,t,n,r)}return n[i].exports}var i=Array.prototype.slice;Function.prototype.bind||Object.defineProperty(Function.prototype,"bind",{enumerable:!1,configurable:!0,writable:!0,value:function(e){function r(){return t.apply(this instanceof r&&e?this:e,n.concat(i.call(arguments)))}if(typeof this!="function")throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var t=this,n=i.call(arguments,1);return r.prototype=Object.create(t.prototype),r.prototype.contructor=r,r}});var s=typeof require=="function"&&require;for(var u=0;u<r.length;u++)o(r[u]);return o})({1:[function(require,module,exports){
(function (setTimeout){
/**
 * @fileoverview Simple implementation of CommonJS Promise/A.
 * @author yo_waka
 */


// source: https://raw.github.com/iskugor/js-promise-simple/master/promise-simple.js
(function(define) {
define([], function() {

    'use strict';

    // Use freeze if exists.
    var freeze = Object.freeze || function() {};

    
    /**
     * Promise/A interface.
     * @interface
     */
    var IPromise = function() {};

    /**
     * @param {*} value
     */
    IPromise.prototype.resolve;

    /**
     * @param {*} error
     */
    IPromise.prototype.reject;

    /**
     * @param {Function} callback
     * @param {Function} errback
     */
    IPromise.prototype.then;


    /**
     * Implemented Promise/A interface.
     *
     * @param {Object=} opt_scope
     * @constructor
     * @implements {IPromise}
     */
    var Deferred = function(opt_scope) {
        this.state_ = Deferred.State.UNRESOLVED;
        this.chain_ = [];
        this.scope_ = opt_scope || null;
    };

    /**
     * @type {Deferred.State}
     * @private
     */
    Deferred.prototype.state_;

    /**
     * @type {!Array.<!Array>}
     * @private
     */
    Deferred.prototype.chain_;

    /**
     * @type {Object}
     * @private
     */
    Deferred.prototype.scope_;

    /**
     * The current Deferred result.
     * @type {*}
     * @private
     */
    Deferred.prototype.result_;

    /**
     * @return {Deferred}
     * @override
     */
    Deferred.prototype.then = function(callback, errback, progback) {
        this.chain_.push([callback || null, errback || null, progback || null]);
        if (this.state_ !== Deferred.State.UNRESOLVED) {
            this.fire_();
        }
        return this;
    };

    /**
     * @override
     */
    Deferred.prototype.resolve = function(value) {
        this.state_ = Deferred.State.RESOLVED;
        this.fire_(value);
    };

    /**
     * @override
     */
    Deferred.prototype.reject = function(error) {
        this.state_ = Deferred.State.REJECTED;
        this.fire_(error);
    };

    /**
     * @return {boolean}
     */
    Deferred.prototype.isResolved = function() {
        return this.state_ === Deferred.State.RESOLVED;
    };

    /**
     * @return {boolean}
     */
    Deferred.prototype.isRejected = function() {
        return this.state_ === Deferred.State.REJECTED;
    };

    /**
     * Create async deferred chain.
     *
     * @param {Function} callback
     * @param {Function} errback
     * @param {number=} opt_interval
     * @return {Deferred}
     */
    Deferred.prototype.next = function(callback, errback, opt_interval) {
        var interval = opt_interval || 10;

        // create async deferred.
        var deferred = new Deferred(this);
        deferred.then(callback, errback);

        // Add in original callback chain
        this.then(
            function(value) {
                setTimeout(function() {
                    deferred.resolve(value);
                }, interval);
            },
            function(error) {
                setTimeout(function() {
                    deferred.reject(error);
                }, interval);
            }
        );

        return deferred;
    };


    /**
     * @param {*} value
     * @private
     */
    Deferred.prototype.fire_ = function(value) {
        var res = this.result_ = (typeof value !== 'undefined') ? value : this.result_;

        while(this.chain_.length) {
            var entry = this.chain_.shift();
            var fn = (this.state_ === Deferred.State.REJECTED) ? entry[1] : entry[0];
            if (fn) {
                try {
                    res = this.result_ = fn.call(this.scope_, res);
                } catch (e) {
                    this.state_ = Deferred.State.REJECTED;
                    res = this.result_ = e;
                }
            }
        }
    };


    /**
     * @enum {string}
     */
    Deferred.State = {
        UNRESOLVED: 'unresolved',
        RESOLVED: 'resolved',
        REJECTED: 'rejected'
    };
    freeze(Deferred.State);


    /**
     * @return {boolean}
     * @static
     */
    var isPromise = function(arg) {
        return (arg && typeof arg.then === 'function');
    };


    /**
     * @param {..*} var_args
     * @return {Deferred}
     * @static
     */
    var when = function(var_args) {
        var deferred = new Deferred();
        var args = [].slice.call(arguments, 0);
        var results = [];

        var callback = function(value) {
            results.push(value);
            if (args.length === results.length) {
                deferred.resolve(results);
            }
        };

        var errback = function(error) {
            deferred.reject(error);
        };

        for (var i = 0, len = args.length; i < len; i++) {
            var arg = args[i];

            if (isPromise(arg)) {
                arg
                .then(callback, errback)
                .resolve();
            } else if (typeof arg === 'function') {
                (new Deferred())
                .then(arg)
                .then(callback, errback)
                .resolve();
            } else {
                (new Deferred())
                .then(function() {
                    return arg;
                })
                .then(callback, errback)
                .resolve();
            }
        };

        return deferred;
    };

    
    return {
        /**
         * Factory method.
         * @param {*=} opt_scope
         */
        defer: function(opt_scope) {
            return new Deferred(opt_scope);
        },
        isPromise: isPromise,
        when: when
    };

}); // define
})(typeof define !== 'undefined' ?
    // use define for AMD if available
    define :
    // If no define, look for module to export as a CommonJS module.
    // If no define or module, attach to current context.
    typeof module !== 'undefined' ?
    function(deps, factory) { module.exports = factory(); } :
    function(deps, factory) { this['Promise'] = factory(); }
);
}).call(this,require("--timers--").setTimeout)
},{"--timers--":3}],2:[function(require,module,exports){

module.exports = (function () { return this; })();

module.exports.location = {};

},{}],3:[function(require,module,exports){
(function (global){

module.exports.clearInterval = clearInterval;
module.exports.clearTimeout = clearTimeout;
module.exports.setInterval = setInterval;
module.exports.setTimeout = setTimeout;

// See https://html.spec.whatwg.org/multipage/webappapis.html#dom-windowtimers-cleartimeout

function clearInterval(intervalId) {
  try {
    return global.clearInterval(intervalId);
  }
  catch (e) {
    // Do nothing
    return undefined;
  }
}

function clearTimeout(timeoutId) {
  try {
    return global.clearTimeout(timeoutId);
  }
  catch (e) {
    // Do nothing
    return undefined;
  }
}

function setInterval(func, delay) {
  var args = [];
  for (var i = 2, l = arguments.length; i < l; ++i) {
    args[ i - 2 ] = arguments[ i ];
  }

  return global.setInterval(function () {
    func.apply(this, args);
  }, +delay);
}

function setTimeout(func, delay) {
  var args = [];
  for (var i = 2, l = arguments.length; i < l; ++i) {
    args[ i - 2 ] = arguments[ i ];
  }

  return global.setTimeout(function () {
    func.apply(this, args);
  }, +delay);
}

}).call(this,require("--global--"))
},{"--global--":2}]},{},[1])(1)
});