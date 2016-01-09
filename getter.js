"use strict";

var binder = require("./binder")
    , walker = require("object-walker")
    , _ = require("underscore")
    , util = require("util")
    ;

module.exports = getter;

/**
 * Function to get a value transformed from a Config object
 *
 * @param key   string  The path to extract
 * @param defaultIfUndef
 * @param config Config object
 * @returns {*}
 */
function getter(key, defaultIfUndef, config) {
    // fetch raw data from config
    var value = config.getRaw(key);

    if (undefined === value) {
        return defaultIfUndef;
    }

    // transform value if applicable
    value = transform(key, value, config);

    return value;
}

/**
 * Transform key-value in extrapolated object according to config object
 * The transformation process occurs according to the input value type,
 * that is to delegate and reduce problem resolution scopes.
 *
 * If the input is a string, we `extrapolate` it
 * If the input is an array or an object, we `high_walk` them.
 * Else we return the value as we cannot do anything on it (bool, number, null, undefined).
 *
 * @param key
 * @param value
 * @param config
 * @returns {*}
 */
function transform(key, value, config) {
    if (_.isString(value)) {
        return extrapolate(key, value, config);
    } else if (_.isArray(value) || _.isObject(value)) {
        return high_walk(value, key, config);
    } else return value;
}

/**
 * Extrapolate `value` against `config`.
 *
 * @param key
 * @param value
 * @param config
 * @returns {*}
 */
function extrapolate(key, value, config) {
    var parameters = config.extractParameterFromString(value);

    if (!parameters || parameters.length == 0) return value;

    // we start presuming extrapolated value will somehow start from the input value
    var extrapolated = value;

    // loop over all parameters to transform extrapolated value
    parameters.forEach(function (parameter, index, array) {
        var cleanParameter = parameter.replace(/%/g, ''); // we are given raw parameters from regex matcher

        // check if parameter is not refereing its parent in the chain
        // that would be endless; we have to stop that when it happen
        if (key.indexOf(cleanParameter) > -1) {
            throw new Error(
                util.format("Cyclic reference: referenced key: '%s', by its child-key: '%s'"
                    , cleanParameter
                    , key));
        }

        // fetch value from config
        var parameterValue = config.get(cleanParameter);

        // if the value is an array or an object and that it is the only parameter, set value as object
        if (array.length == 1
            && index == 0 &&
            (
                _.isArray(parameterValue)
                || _.isObject(parameterValue)
            )
        ) {
            extrapolated = parameterValue;
        } else {
            // replace the extrapolated string by replacing parameter ("%..%") with value.toString()
            extrapolated = extrapolated.replace(parameter, parameterValue.toString());
        }
    });

    return extrapolated;
}

/**
 * Walks the object using low_walk and sets final-ending values to transformed object
 *
 * Uses the low_walk that emit final-ending values to feed a new bound object
 * that realize the transformation process
 *
 * @param object
 * @param key
 * @param config
 * @returns {*}
 */
function high_walk(object, key, config) {
    var isArray = !(_.isArray(object) || _.isObject(object)) ? undefined : _.isArray(object);
    var transformed = isArray ? [] : {};
    var bound = binder.PropertyAccessor.bindTo(transformed);

    low_walker(object, isArray, key, config, function (key_path, value) {
        // low_walker only producces final values that does not need to be processed
        bound.set(key_path, value);
    });

    return transformed;
}

/**
 * Walks the object or array until it reaches leaves values datatypes and calls
 * the `cb` with them and their belonging path calculated according to `key`
 *
 * @param object object|array to walk
 * @param isArray marks the difference between . and [] when generating the path
 * @param key root key of the walking, to allow recursive call
 * @param config Config object
 * @param cb Function(it_key_path, value) called when we get a string or another datatype
 */
function low_walker(object, isArray, key, config, cb) {
    walker.walkObject(object, function (keys, value) {
        var it_key_path = !isArray ? (key + "." + keys[0]) : (key + "[" + keys[0] + "]");
        if (_.isArray(value) || _.isObject(value)) {
            var _isArray = !(_.isArray(value) || _.isObject(value)) ? undefined : _.isArray(value);
            low_walker(value, _isArray, it_key_path, config, cb);
        } else if (_.isString(value)) {
            cb(it_key_path, extrapolate(it_key_path, value, config));
        } else {
            cb(it_key_path, value);
        }
    });
}
