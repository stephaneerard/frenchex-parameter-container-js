// from https://code.google.com/p/js-binding/source/browse/trunk/src/js/binder.js?r=17
// Removed unused code

// Copyright 2008 Steven Bazyl
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//  limitations under the License.

var Binder = {};
Binder.PropertyAccessor = function() {
    var ARRAY_MATCH = /(.*)\[(\d*)\]/;
    var _setProperty = function( target, path, value ) {
        if( path.length == 0 ) {
            return value;
        }
        var current = path.shift();
        if( current.indexOf( "[" ) >= 0 ) {
            var match = current.match( ARRAY_MATCH );
            current = match[1];
            target[current] = target[current] || [];
            if( match[2] ) {
                var index = Number(match[2]);
                target[current][index] = _setProperty( target[current][index] || {}, path, value )
            } else {
                target[current].push( _setProperty( {}, path, value ))
            }
            return target;
        } else {
            target[current] = _setProperty( target[current] || {}, path, value );
            return target;
        }
    };
    var _getProperty = function( target, path ) {
        if( path.length == 0 || target == undefined ) {
            return target;
        }
        var current = path.shift();
        if( current.indexOf( "[" ) >= 0 ) {
            var match = current.match( ARRAY_MATCH );
            current = match[1];
            if( match[2] ) {
                var index = Number(match[2]);
                return _getProperty( target[current][index], path )
            } else {
                return target[current];
            }
        } else {
            return _getProperty( target[current], path );
        }
    };
    var _isBuiltinType = function( obj ) {
        var t = typeof( target );
        return t == "string" || t == "number" || t == "date"  || t == "boolean"
    };
    var _enumerate = function( collection, target, path ) {
        if( target instanceof Array ) {
            for( var i = 0; i < target.length; i++ ) {
                _enumerate( collection, target[i], path + "["+i+"]" );
            }
        } else if( _isBuiltinType( target ) ) {
            collection.push( path );
        } else {
            for( property in target ) {
                if( typeof( property ) != "function" ) {
                    _enumerate( collection, target[property], path == "" ? property : path + "." + property );
                }
            }
        }
    };
    return {
        bindTo: function( obj ) {
            return {
                target: obj || {},
                set: function(  property, value ) {
                    var path = property.split( "." );
                    return _setProperty( this.target, path, value );
                },
                get: function(  property ) {
                    var path = property.split( "." );
                    return _getProperty( this.target || {}, path );
                },
                properties: function() {
                    var props = [];
                    _enumerate( props, this.target, "" );
                    return props;
                }
            };
        }
    };
}();

module.exports = Binder;