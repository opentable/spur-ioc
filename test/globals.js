/* eslint-disable */

var chai = require('chai');
global.assert = require('assert');

global.expect = chai.expect;
process.env.NODE_ENV = 'test';

process.setMaxListeners(1000);
