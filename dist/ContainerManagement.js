"use strict";

exports.__esModule = true;

var _Dependency = require("./Dependency");

var _Dependency2 = _interopRequireDefault(_Dependency);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rall = /.+/;

exports.default = {
  warnIfNeeded: function warnIfNeeded(name) {
    if (this.hasDependency(name)) {
      return this.logger.warn("warning: " + name + " dependency is being overwritten in " + this.name + " injector");
    }
  },
  addResolvableDependency: function addResolvableDependency(name, dependency) {
    var suppressWarning = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    if (!suppressWarning) {
      this.warnIfNeeded(name);
    }
    this.dependencies[name] = _Dependency2.default.resolvableDependency(name, dependency);
    return this;
  },
  addDependency: function addDependency(name, dependency) {
    var suppressWarning = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    if (!suppressWarning) {
      this.warnIfNeeded(name);
    }
    this.dependencies[name] = _Dependency2.default.dependency(name, dependency);
    return this;
  },
  addConstructedDependency: function addConstructedDependency(name, dependency) {
    var suppressWarning = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    if (!suppressWarning) {
      this.warnIfNeeded(name);
    }
    this.dependencies[name] = dependency;
    return this;
  },
  removeDependency: function removeDependency(name) {
    delete this.dependencies[name];
    return this;
  },
  getDependency: function getDependency(name) {
    return this.dependencies[name];
  },
  hasDependency: function hasDependency(name) {
    return !!this.dependencies[name];
  },
  merge: function merge(otherInjector) {
    var suppressWarning = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var name = undefined,
        dependency = undefined;
    var dependencies = otherInjector.dependencies;
    for (name in dependencies) {
      if (dependencies.hasOwnProperty(name)) {
        dependency = dependencies[name];
        this.addConstructedDependency(name, dependency, suppressWarning);
      }
    }
    return this;
  },
  use: function use(otherInjector) {
    var suppressWarning = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    return this.merge(otherInjector, suppressWarning);
  },
  exposeAll: function exposeAll() {
    return this.expose(rall);
  },
  expose: function expose(exposedDeps) {
    this.exposedDeps = exposedDeps;
    return this;
  },
  link: function link(otherInjector) {
    var deps = otherInjector.resolveExposedDependencies();
    return this.registerDependencies(deps);
  }
};