const Dependency = require('./Dependency');
const Utils = require('./Utils');

const rall = /.+/;

module.exports = {

  getDependencySourceHint(dependency) {
    if (Utils.isFunction(dependency)) {
      return dependency.name || '<anonymous function>';
    }

    if (Utils.isObject(dependency)) {
      return (dependency.constructor && dependency.constructor.name)
        ? dependency.constructor.name
        : '<object>';
    }

    return `<${typeof dependency}>`;
  },

  warnOverrideIfNeeded(name, dependency) {
    if (this.hasDependency(name)) {
      const hint = this.getDependencySourceHint(dependency);
      this.logger.warn(`warning: ${name} (${hint}) dependency is being overwritten in ${this.name} injector`);
    }
  },

  addResolvableDependency(name, dependency, suppressWarning = false) {
    if (this.shouldIgnoreDependency(dependency)) {
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
    const spurIocIgnore = (dependency && dependency.spurIocIgnore)
      ? dependency.spurIocIgnore
      : false;

    return Boolean(spurIocIgnore);
  },

  merge(otherInjector, suppressWarning = false) {
    const dependencies = otherInjector.dependencies || {};
    const names = Object.keys(dependencies) || [];

    names.forEach((name) => {
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
