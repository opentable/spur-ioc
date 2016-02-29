"use strict";

exports.__esModule = true;

require("coffee-script/register");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _Logger = require("./Logger");

var _Logger2 = _interopRequireDefault(_Logger);

var _ContainerManagement = require("./ContainerManagement");

var _ContainerManagement2 = _interopRequireDefault(_ContainerManagement);

var _DependencyManagement = require("./DependencyManagement");

var _DependencyManagement2 = _interopRequireDefault(_DependencyManagement);

var _RegistrationManagement = require("./RegistrationManagement");

var _RegistrationManagement2 = _interopRequireDefault(_RegistrationManagement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } // Register coffeescript for any CS dependencies


var Injector = function () {
  function Injector() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "anonymous_injector" : arguments[0];
    var logger = arguments.length <= 1 || arguments[1] === undefined ? _Logger2.default.create() : arguments[1];

    _classCallCheck(this, Injector);

    _lodash2.default.bindAll(this, "resolveDependency");
    this.name = name;
    this.logger = logger;
    this.dependencies = {};
  }

  Injector.create = function create(name, logger) {
    return new Injector(name, logger);
  };

  return Injector;
}();

_lodash2.default.assign(Injector.prototype, _ContainerManagement2.default, _DependencyManagement2.default, _RegistrationManagement2.default);

exports.default = Injector;