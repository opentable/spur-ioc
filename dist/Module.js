"use strict";

exports.__esModule = true;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = function () {
  function Module() {
    _classCallCheck(this, Module);

    var module = undefined;
    var modules = this.$modules;
    console.log("modules: ", modules);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    for (var _iterator = modules, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      if (_isArray) {
        if (_i >= _iterator.length) break;
        module = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        module = _i.value;
      }

      console.log("module: ", module);
      module.apply(this, args);
    }
  }

  Module.include = function include(obj) {
    if (!this.prototype.$modules) {
      this.prototype.$modules = [];
    }
    this.prototype.$modules.push(obj);
    _lodash2.default.assign(this.prototype, obj.prototype);
    return this;
  };

  Module.prototype.include = function include(module) {
    _lodash2.default.assign(this, module.prototype);
    return module.apply(this);
  };

  return Module;
}();

exports.default = Module;