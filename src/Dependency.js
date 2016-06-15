import Util from './Util';

class Dependency {
  constructor(name) {
    this.name = name;
  }

  static resolvableDependency(name, dependency) {
    const dep = new Dependency(name);
    dep.fn = dependency;
    dep.dependencies = Util.parseDependencies(dependency);
    return dep;
  }

  static dependency(name, instance) {
    const dep = new Dependency(name);
    dep.instance = instance;
    return dep;
  }
}

export default Dependency;
