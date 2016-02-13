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

var positionalNotationRaw = curryN(3, function (d, base, posValPair) {
  return d(base).pow(d(posValPair[0]))
    .times(d(posValPair[1]));
});

var positionalNotation = curryN(2, pipe(positionalNotationRaw(toDecimal), Number));
positionalNotation.raw = positionalNotationRaw;

module.exports = positionalNotation;
