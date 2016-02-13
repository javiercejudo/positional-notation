/*jshint node:true, mocha:true */

'use strict';

require('should');

var R = require('ramda');
var Decimal = require('arbitrary-precision')(require('bigjs-adapter'));
var toDecimalFactory = require('to-decimal-arbitrary-precision');

var fn = require('../src/');

describe('positional notation', function() {
  it('should calculate the decimal equivalent given a base, a position and a decimal value', function() {
    fn(60, [0, 32]).should.be.exactly(32);
    fn(60)([0, 32]).should.be.exactly(32);

    fn(60, [1, 32]).should.be.exactly(1920);
    fn(60, [5, 32]).should.be.exactly(24883200000);

    fn(5, [4, 3]).should.be.exactly(1875);

    fn(1, [0, 1]).should.be.exactly(1);
    fn(1, [3, 1]).should.be.exactly(1);

    fn(1, [0, 1/3]).should.be.exactly(1/3);

    fn(10, [2, 3/10]).should.be.exactly(30);
  });

  it('should support non-integers', function() {
    fn(10, [-1, 2]).should.be.exactly(0.2);
  });

  it('should support arbitrary precision', function() {
    var d = toDecimalFactory(Decimal);

    fn.raw(d, 60, [1, 32]).equals(d(1920)).should.be.exactly(true);
    fn.raw(d)(60, [1, 32]).equals(d(1920)).should.be.exactly(true);
    fn.raw(d)(60)([1, 32]).equals(d(1920)).should.be.exactly(true);

    fn.raw(d, 10, [-1, 2]).equals(d(0.2)).should.be.exactly(true);

    fn(10, [-1, 0.2]).should.be.exactly(0.020000000000000004);
    fn.raw(d, 10, [-1, 0.2]).equals(d(0.02)).should.be.exactly(true);

    fn.raw(d, d(5), [d(4), d(3)]).equals(d(1875)).should.be.exactly(true);
    fn.raw(d, d('5'), [d('4'), d('3')]).equals(d(1875)).should.be.exactly(true);
  });
});

describe('use case', function() {
  var symbols = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    'A': '10', 'B': '11', 'C': '12', 'D': '13', 'E': '14', 'F': '15',
  };

  var posNotation = fn(Object.keys(symbols).length);

  var hexToDec = R.pipe(
    R.toUpper,
    R.split(''),
    R.reverse,
    R.map(R.prop(R.__, symbols)),
    R.addIndex(R.map)(function(val, index) {
      return posNotation([index, val]);
    }),
    R.sum
  );

  it('hexadecimal to decimal', function() {
    hexToDec('AB').should.be.exactly(171);

    // https://github.com/NerdDiffer/all-your-base/blob/ce258b2ca1430dd506b2a9e326f00219e8f8673c/test/convert_spec.js#L73-L79
    hexToDec('1556').should.be.exactly(5462);
    hexToDec('AE91').should.be.exactly(44689);
    hexToDec('512').should.be.exactly(1298);
    hexToDec('7DE').should.be.exactly(2014);
    hexToDec('20').should.be.exactly(32);
    hexToDec('9C4').should.be.exactly(2500);
    hexToDec('ff001d').should.be.exactly(16711709);
  });
});
