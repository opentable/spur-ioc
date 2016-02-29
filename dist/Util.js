"use strict";

exports.__esModule = true;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var rnewline = /\n/g;
var rat = /_at_/g;
var rfunction = /function\s+\w*\s*\((.*?)\)/;
var rcomma = /\s*,\s*/;

var Util = function () {
  function Util() {
    _classCallCheck(this, Util);
  }

  Util.prototype.parseDependencies = function parseDependencies(fn) {
    var params = fn.toString().replace(rnewline, " ").replace(rat, "").match(rfunction)[1].split(rcomma);
    return _lodash2.default.compact(_lodash2.default.map(params, function (p) {
      return p.trim();
    }));
  };

  return Util;
}();

exports.default = new Util();