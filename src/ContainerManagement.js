const _forEach = require('lodash.foreach');
const _get = require('lodash.get');
const Dependency = require('./Dependency');

const rall = /.+/;

module.exports = {

  warnIfNeeded(name) {
    if (this.hasDependency(name)) {
      const dependencyName = _get(dependency, 'name');
      this.logger.warn(`warning: ${name} (from: ${dependencyName}) dependency is being overwritten in ${this.name} injector`);
    }
  },

  addResolvableDependency(name, dependency, suppressWarning = false) {
    if (this.shouldIgnoreDependency(name, dependency)) {
      return this;
    }
    if (!suppressWarning) {
      this.warnIfNeeded(name);
    }
    this.dependencies[name] = Dependency.resolvableDependency(name, dependency);
    return this;
  },

  addDependency(name, dependency, suppressWarning = false) {
    if (this.shouldIgnoreDependency(name, dependency)) {
      return this;
    }
    if (!suppressWarning) {
      this.warnIfNeeded(name);
    }
    this.dependencies[name] = Dependency.dependency(name, dependency);
    return this;
  },

  addConstructedDependency(name, dependency, suppressWarning = false) {
    if (this.shouldIgnoreDependency(name, dependency)) {
      return this;
    }
    if (!suppressWarning) {
      this.warnIfNeeded(name);
    }
    this.dependencies[name] = dependency;
    return this;
  },

  removeDependency(name) {
    delete this.dependencies[name];
    return this;
  },

  getDependency(name) {
    return this.dependencies[name];
  },

  hasDependency(name) {
    return !!this.dependencies[name];
  },

  shouldIgnoreDependency(dependency) {
    return Boolean(dependency.spurIocIgnore);
  },

  merge(otherInjector, suppressWarning = false) {
    const dependencies = otherInjector.dependencies;

    _forEach(dependencies, (value, name) => {
      const dependency = dependencies[name];
      this.addConstructedDependency(name, dependency, suppressWarning);
    });
    return this;
  },

  use(otherInjector, suppressWarning = false) {
    return this.merge(otherInjector, suppressWarning);
  },

  exposeAll() {
    return this.expose(rall);
  },

  expose(exposedDeps) {
    this.exposedDeps = exposedDeps;
    return this;
  },

  link(otherInjector) {
    const deps = otherInjector.resolveExposedDependencies();
    return this.registerDependencies(deps);
  }
};
