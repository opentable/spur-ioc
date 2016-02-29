"use strict";

exports.__esModule = true;

var _DependencyResolver = require("./DependencyResolver");

var _DependencyResolver2 = _interopRequireDefault(_DependencyResolver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  resolveDependency: function resolveDependency(name) {
    return this.resolver = _DependencyResolver2.default.resolve(this, name, this.logger);
  },
  privateInjectorName: function privateInjectorName() {
    return "$$" + this.name;
  },
  resolveExposedDependencies: function resolveExposedDependencies() {
    return this.injectAndReturn(this.exposedDeps);
  },
  injectAndReturn: function injectAndReturn(deps) {
    var resolvedDeps = null;
    this.inject(function ($injector) {
      return resolvedDeps = deps instanceof RegExp ? $injector.getRegex(deps) : $injector.getMap(deps);
    });
    return resolvedDeps;
  },
  inject: function inject(fn) {
    var name = this.privateInjectorName();
    this.addResolvableDependency(name, fn, true);
    return this.resolveDependency(name);
  }
};