"use strict";

var binder = require("./binder")            // used to walk objects
    , getter = require("./getter")          // get algorithm appliable to a Config object
    , setter = require("./setter")          // set algorithm appliable to a Config object
    , merge = require("deepmerge")          // merge algorithm to deeply merge two objects
    ;

module.exports = (() => { // auto-executing function returning the Config function-constructor

    /**
     * Config object holds the .get() and .set() methods and the backend object
     *
     * @param options {paramRegex: Regex, mergeOjects: boolean}
     * @constructor
     */
    function Config(options) {
        /**
         * The backend object holding the set'ed values
         * @type {{}}
         */
        this.target = {};

        /**
         * PropertyAccessor object to get and set via strings "some.thing[2]"
         * @type {*|{target, set, get, properties}}
         */
        this.bound = binder.PropertyAccessor.bindTo(this.target);

        /**
         * Options adds capacity to control some behavior
         */
        this.options = merge({
            paramRegex:  /(%[a-zA-Z\.\-\\]*%)/g
            , mergeObjects: true
        }, options || {});
    }

    /**
     * Returns the raw data not transformed
     * at specified `key` path
     *
     * @param key String The key to find
     * @param defaultIfUndefined boolean Value returnedd if path not exist
     * @returns {*}
     */
    Config.prototype.getRaw = function (key, defaultIfUndefined) {
        var value = this.bound.get(key);

        if (defaultIfUndefined && undefined === value)
            return defaultIfUndefined;

        return value;
    };

    /**
     * Returns the fragment transformed, representative of `key` path.
     * If the fragment doesn not exist, returns `defaultIfUndefined`
     *
     * @param key String
     * @param defaultIfUndefined boolean
     * @returns {*}
     */
    Config.prototype.get = function (key, defaultIfUndefined) {
        return getter(key, defaultIfUndefined, this);
    };

    /**
     * Sets `value` at given `key` path.
     * `value` can be an object, an array, or a data-type.
     *
     * @param key String
     * @param value object|array|number|boolean|string|null|undefined
     * @param mergeIfMergeable boolean
     * @returns {exports}
     */
    Config.prototype.set = function (key, value, mergeIfMergeable) {
        setter(key, value, mergeIfMergeable, this);
        return this;
    };

    /**
     * Tells if a string contains parameters, that is, strings between %..% using
     * options.paramRegex regex
     *
     * @param string The string to test
     * @returns {*|boolean}
     */
    Config.prototype.isStringParameterized = function (string) {
        var matches = string.match(this.options.paramRegex);
        return matches && matches.length && matches.length > 0;
    };

    /**
     * Extract parameters from given string using options.paramRegex regex
     *
     * @param string
     * @returns {*}
     */
    Config.prototype.extractParameterFromString = function (string) {
        return string.match(this.options.paramRegex);
    };

    return Config;

})();