"use strict";

exports.__esModule = true;

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CallChain = function () {
  function CallChain(name1, parent) {
    _classCallCheck(this, CallChain);

    this.name = name1;
    this.parent = parent;
  }

  CallChain.create = function create(name) {
    return new CallChain(name);
  };

  CallChain.prototype.add = function add(name) {
    return new CallChain(name, this);
  };

  CallChain.prototype.hasParentName = function hasParentName(name) {
    return this.name === name || this.parent && this.parent.hasParentName(name);
  };

  CallChain.prototype.hasCyclic = function hasCyclic() {
    var parent = this.parent;
    if (parent) {
      return parent.hasParentName(this.name);
    }
  };

  CallChain.prototype.getHighlightedName = function getHighlightedName() {
    return _chalk2.default.yellow(this.name);
  };

  CallChain.prototype.getPath = function getPath(highlight) {
    var path = "";
    if (this.parent) {
      path = this.parent.getPath() + " -> ";
    }
    return path += highlight ? this.getHighlightedName() : this.name;
  };

  return CallChain;
}();

exports.default = CallChain;