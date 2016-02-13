# positional-notation

[![Build Status](https://travis-ci.org/javiercejudo/positional-notation.svg)](https://travis-ci.org/javiercejudo/positional-notation)
[![Coverage Status](https://coveralls.io/repos/javiercejudo/positional-notation/badge.svg?branch=master)](https://coveralls.io/r/javiercejudo/positional-notation?branch=master)
[![Code Climate](https://codeclimate.com/github/javiercejudo/positional-notation/badges/gpa.svg)](https://codeclimate.com/github/javiercejudo/positional-notation)

Converts a string `hh:mm:ss` to seconds

## Install

    npm i positional-notation

## Basic usage

```js
var fn = require('positional-notation');

fn(60, [1, 32]); //=> 1920
fn(5, [4, 3]); //=> 1875
```

## Arbitrary precision

```js
var Decimal = require('arbitrary-precision')(require('decimaljs-adapter'));
Decimal.setPrecision(50);

var d = require('to-decimal-arbitrary-precision')(Decimal);

fn.raw(d, 10, [2, 3/10]); // d(30)
```

 where `d` is a [`toDecimal`](https://github.com/javiercejudo/to-decimal) with at least `times` and `pow`.

 ## Use case: functional hex to dec

```js
var R = require('ramda');
var fn = require('positional-notation');

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

hexToDec('7E0'); //=> 2016
```

See [spec](test/spec.js).
