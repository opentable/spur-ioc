"use strict";

exports.__esModule = true;

var _requireAll = require("require-all");

var _requireAll2 = _interopRequireDefault(_requireAll);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rfileFilter = /(.+)\.(js|json|coffee)$/;

exports.default = {
  registerFolder: function registerFolder(rootDir, dir) {
    var dirname = _path2.default.resolve(rootDir, dir);
    var libs = (0, _requireAll2.default)({
      dirname: dirname,
      filter: rfileFilter
    });
    this.registerLibMap(libs);
    return this;
  },
  registerLibMap: function registerLibMap(libs) {
    var name = undefined,
        lib = undefined;
    for (name in libs) {
      if (libs.hasOwnProperty(name)) {
        lib = libs[name];
        if (_lodash2.default.isFunction(lib)) {
          this.addResolvableDependency(name, lib);
        } else if (_lodash2.default.isObject(lib)) {
          this.registerLibMap(lib);
        }
      }
    }
    return this;
  },
  registerFolders: function registerFolders(rootDir, dirs) {
    var _this = this;

    _lodash2.default.each(dirs, function (dir) {
      return _this.registerFolder(rootDir, dir);
    });
    return this;
  },
  registerLibraries: function registerLibraries(libraries) {
    this.logger.warn("registerLibraries is deprecated, use registerDependencies with explicit require instead.");
    var name = undefined,
        lib = undefined;
    for (name in libraries) {
      if (libraries.hasOwnProperty(name)) {
        lib = libraries[name];
        this.addDependency(name, require(lib));
      }
    }
    return this;
  },
  registerDependencies: function registerDependencies(dependencies) {
    var name = undefined,
        lib = undefined;
    for (name in dependencies) {
      if (dependencies.hasOwnProperty(name)) {
        lib = dependencies[name];
        this.addDependency(name, lib);
      }
    }
    return this;
  }
};