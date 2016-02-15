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
    fn.raw(d, 60)([1, 32]).equals(d(1920)).should.be.exactly(true);
    fn.raw(d)(60, [1, 32]).equals(d(1920)).should.be.exactly(true);
    fn.raw(d)(60)([1, 32]).equals(d(1920)).should.be.exactly(true);

    fn.raw(d, 10, [-1, 2]).equals(d(0.2)).should.be.exactly(true);

    fn(10, [-1, 0.2]).should.be.exactly(0.020000000000000004);
    fn.raw(d, 10, [-1, 0.2]).equals(d(0.02)).should.be.exactly(true);

    fn.raw(d, d(5), [d(4), d(3)]).equals(d(1875)).should.be.exactly(true);
    fn.raw(d, d('5'), [d('4'), d('3')]).equals(d(1875)).should.be.exactly(true);
  });
});

describe('use case: base any to any', function() {
  var d = toDecimalFactory(Decimal);

  // To avoid large numbers to go into exponential notation
  Decimal.Impl.E_POS = 45;

  var symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  var fromBase = function(d, base) {
    return R.pipe(
      R.split(''),
      R.reverse,
      R.map(R.indexOf(R.__, symbols)),
      R.addIndex(R.map)(fn.mapper(d, base)),
      R.reduce(R.invoker(1, 'plus'), d(0))
    );
  };

  var toBase = function(d, base) {
    return R.pipe(
      R.unfold(fn.unfolder(d, base)),
      R.map(R.nth(R.__, symbols)),
      R.reverse,
      R.join('')
    );
  };

  var convertBasesRaw = R.curryN(4, function(d, oldBase, newBase, n) {
    return R.pipe(fromBase(d, oldBase), toBase(d, newBase))(n);
  });

  var convertBases = convertBasesRaw(d);

  it('hexadecimal to binary', function() {
    var hexToBin = convertBases(16, 2);

    hexToBin('A').should.be.exactly('1010');
    hexToBin('1E').should.be.exactly('11110');
  });

  it('large decimal to base 9', function() {
    convertBases(10, 9, '5678364565345634563456346757364563534534645745')
      .should.be.exactly('802531310452364303450750087576673257456135727727');
  });

  it.skip('non-integer decimal to base 9', function() {
    convertBases(10, 9, '10.10')
      .should.be.exactly('11.08');
  });

  it('octal to duodecimal', function() {
    convertBases(8, 12, '73').should.be.exactly('4B');
  });

  it('quinary to base 32', function() {
    var quiToB32 = convertBases(5, 32);

    quiToB32('2312124222213').should.be.exactly('JAVIER');
    quiToB32('30333330434').should.be.exactly('TAOCP');
  });
});
