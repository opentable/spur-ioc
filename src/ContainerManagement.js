import _ from 'lodash';
import Dependency from './Dependency';

const rall = /.+/;

export default {

  warnIfNeeded(name) {
    if (this.hasDependency(name)) {
      this.logger.warn(`warning: ${name} dependency is being overwritten in ${this.name} injector`);
    }
  },

  addResolvableDependency(name, dependency, suppressWarning = false) {
    if (!suppressWarning) {
      this.warnIfNeeded(name);
    }
    this.dependencies[name] = Dependency.resolvableDependency(name, dependency);
    return this;
  },

  addDependency(name, dependency, suppressWarning = false) {
    if (!suppressWarning) {
      this.warnIfNeeded(name);
    }
    this.dependencies[name] = Dependency.dependency(name, dependency);
    return this;
  },

  addConstructedDependency(name, dependency, suppressWarning = false) {
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

  merge(otherInjector, suppressWarning = false) {
    const dependencies = otherInjector.dependencies;

    _.each(dependencies, (value, name) => {
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
