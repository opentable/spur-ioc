const _forEach = require('lodash.foreach');
const _get = require('lodash.get');
const _isFunction = require('lodash.isfunction');
const _isObject = require('lodash.isobject');
const Dependency = require('./Dependency');

const rall = /.+/;

module.exports = {

  getDependencySourceHint(dependency) {
    if (_isFunction(dependency)) {
      return _get(dependency, 'name') || '<anonymous function>';
    }

    if (_isObject(dependency)) {
      return _get(dependency, 'constructor.name') || '<object>';
    }

    return `<${typeof dependency}>`;
  },

  warnOverrideIfNeeded(name, dependency) {
    if (this.hasDependency(name)) {
      const hint = this.getDependencySourceHint(dependency);
      this.logger.warn(`warning: ${name} (${hint}) dependency is being overwritten in ${this.name} injector`);
    }
  },

  warnIgnoredDependency(name, dependency) {
    const hint = this.getDependencySourceHint(dependency);
    this.logger.warn(`warning: ignoring ${name} (${hint}) dependency in ${this.name} injector`);
  },

  addResolvableDependency(name, dependency, suppressWarning = false) {
    if (this.shouldIgnoreDependency(dependency)) {
      if (!suppressWarning) {
        this.warnIgnoredDependency(name, dependency);
      }
      return this;
    }
    if (!suppressWarning) {
      this.warnOverrideIfNeeded(name, dependency);
    }
    this.dependencies[name] = Dependency.resolvableDependency(name, dependency);
    return this;
  },

  addDependency(name, dependency, suppressWarning = false) {
    if (this.shouldIgnoreDependency(dependency)) {
      if (!suppressWarning) {
        this.warnIgnoredDependency(name, dependency);
      }
      return this;
    }
    if (!suppressWarning) {
      this.warnOverrideIfNeeded(name, dependency);
    }
    this.dependencies[name] = Dependency.dependency(name, dependency);
    return this;
  },

  addConstructedDependency(name, dependency, suppressWarning = false) {
    if (this.shouldIgnoreDependency(dependency)) {
      if (!suppressWarning) {
        this.warnIgnoredDependency(name, dependency);
      }
      return this;
    }
    if (!suppressWarning) {
      this.warnOverrideIfNeeded(name, dependency);
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
    return Boolean(_get(dependency, 'spurIocIgnore', false));
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
