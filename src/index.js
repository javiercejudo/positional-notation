/*jshint node:true */

'use strict';

var pipe = require('ramda/src/pipe');
var curryN = require('ramda/src/curryN');

var coreArbitraryPrecision = require('core-arbitrary-precision');
var toDecimalFactory = require('to-decimal-arbitrary-precision');
var times = require('times-arbitrary-precision');
var pow = require('pow-arbitrary-precision');
var floatingAdapter = require('floating-adapter');

var Decimal = pipe(times, pow)(coreArbitraryPrecision(floatingAdapter));
var toDecimal = toDecimalFactory(Decimal);
var curry3 = curryN(3);

var positionalNotationRaw = curry3(function(d, base, pair) {
  return d(base).pow(d(pair[0])).times(d(pair[1]));
});

var positionalNotation = curryN(2, pipe(positionalNotationRaw(toDecimal), Number));

positionalNotation.raw = positionalNotationRaw;

positionalNotation.mapper = curry3(function(f, val, index) {
  return f([index, val]);
});

module.exports = positionalNotation;
