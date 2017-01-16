import DependencyResolver from './DependencyResolver';

export default {
  resolveDependency(name) {
    return (this.resolver = DependencyResolver.resolve(this, name, this.logger));
  },

  privateInjectorName() {
    return `$$${this.name}`;
  },

  resolveExposedDependencies() {
    return this.injectAndReturn(this.exposedDeps);
  },

  injectAndReturn(deps) {
    let resolvedDeps = null;
    this.inject(($injector) => {
      resolvedDeps = deps instanceof RegExp
        ? $injector.getRegex(deps)
        : $injector.getMap(deps);
    });
    return resolvedDeps;
  },

  inject(fn) {
    const name = this.privateInjectorName();
    this.addResolvableDependency(name, fn, true);
    return this.resolveDependency(name);
  }
};
