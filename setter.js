"use strict";

var binder = require("./binder")
    , walker = require("object-walker")
    , _ = require("underscore")
    , merge = require("deepmerge")
    ;

module.exports = setter;

/**
 * Sets `value` at `key` path.
 * If there exist a value at `key` path and it is an object, either
 * merge or re-set it according to `mergeIfMergeable`.
 * All happens on `config` Config object.
 *
 * @param key
 * @param value
 * @param mergeIfMergeable
 * @param config
 */
function setter(key, value, mergeIfMergeable, config) {
    // if mergeable is set to true/false, use this vlaue, else use config option value
    mergeIfMergeable = null != mergeIfMergeable ? !!mergeIfMergeable : config.options.mergeObjects;

    // when value is an object or an array, we do not simply assign it as a value of an hashmap index.
    // we walk the value object and assign the config object each leave value
    if (_.isObject(value) || _.isArray(value)) {
        // we do not want to merge, we must set to undefined before
        // as the high_walk function only knows to walk
        // and that resemble a merge operation
        if (!mergeIfMergeable) {
            config.bound.set(key, undefined);
        }

        // walk object to merge it with the config
        high_walk(value, key, config);

    } else {
        // get raw current value for further testing
        var currentValue = config.getRaw(key);

        if (currentValue && (_.isObject(currentValue) || _.isArray(currentValue))) {
            //if we have a current value and that it is an object
            // check for merge again
            if (!mergeIfMergeable)
                config.bound.set(key, undefined);

            // walk the object to merge it with the config
            high_walk(value, key, config);
        } else {
            // for any other kind of value, set it directly
            config.bound.set(key, value);
        }
    }
}


/**
 * Walks `object`using low_walk function and sets final-ending values to `config` bound object
 *
 * @param object
 * @param key
 * @param config
 */
function high_walk(object, key, config) {
    // take care of how path will be generated in the recursive walks
    var isArray = !(_.isArray(object) || _.isObject(object)) ? undefined : _.isArray(object);

    // calls low_walker giving a callback that will be fired with final-ending values
    // to set to `config` bound object
    low_walker(object, isArray, key, config, function (key_path, value) {
        // low_walker only producces final values that does not need to be processed
        config.bound.set(key_path, value);
    });
}

/**
 * Calls `cb` when reaching leaves of `object`
 *
 * @param object
 * @param isArray
 * @param key
 * @param config
 * @param cb
 */
function low_walker(object, isArray, key, config, cb) {
    walker.walkObject(object, function (keys, value) {
        var it_key_path = !isArray ? (key + "." + keys[0]) : (key + "[" + keys[0] + "]");
        if (_.isArray(value) || _.isObject(value)) {
            var _isArray = !(_.isArray(value) || _.isObject(value)) ? undefined : _.isArray(value);
            low_walker(value, _isArray, it_key_path, config, cb);
        } else {
            cb(it_key_path, value);
        }
    });
}

