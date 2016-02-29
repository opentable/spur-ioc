"use strict";

exports.__esModule = true;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Level = function () {
  function Level(level, name, ascii) {
    var exit = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

    _classCallCheck(this, Level);

    _lodash2.default.bindAll(this, "log");
    this.level = level;
    this.name = name;
    this.ascii = ascii;
    this.exit = exit;
  }

  Level.create = function create() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new (Function.prototype.bind.apply(Level, [null].concat(args)))();
  };

  Level.prototype.log = function log() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return console.log.apply(console, [this.ascii].concat(args));
  };

  return Level;
}();

var LEVELS = {
  fatal: Level.create(0, "FATAL", _chalk2.default.black.bgRed("FATAL"), true),
  error: Level.create(1, "Error", _chalk2.default.red("ERROR")),
  warn: Level.create(2, "WARNING", _chalk2.default.yellow("WARNING")),
  info: Level.create(3, "INFO", _chalk2.default.green("INFO")),
  debug: Level.create(4, "DEBUG", _chalk2.default.reset("DEBUG")),
  trace: Level.create(5, "TRACE", _chalk2.default.white("TRACE"))
};

var Logger = function () {
  function Logger() {
    _classCallCheck(this, Logger);

    this.addLoggingMethods();
  }

  Logger.create = function create() {
    return new Logger();
  };

  Logger.prototype.addLoggingMethods = function addLoggingMethods() {
    for (var name in LEVELS) {
      if (LEVELS.hasOwnProperty(name)) {
        this[name] = LEVELS[name].log;
      }
    }
  };

  return Logger;
}();

exports.default = Logger;