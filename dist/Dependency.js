"use strict";

exports.__esModule = true;

var _Util = require("./Util");

var _Util2 = _interopRequireDefault(_Util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dependency = function () {
  function Dependency(name) {
    _classCallCheck(this, Dependency);

    this.name = name;
  }

  Dependency.resolvableDependency = function resolvableDependency(name, dependency) {
    var dep = new Dependency(name);
    dep.fn = dependency;
    dep.dependencies = _Util2.default.parseDependencies(dependency);
    return dep;
  };

  Dependency.dependency = function dependency(name, instance) {
    var dep = new Dependency(name);
    dep.instance = instance;
    return dep;
  };

  return Dependency;
}();

exports.default = Dependency;