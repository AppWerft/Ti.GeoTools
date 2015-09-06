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