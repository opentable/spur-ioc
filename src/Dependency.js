const FunctionArgumentsParser = require('./FunctionArgumentsParser');

class Dependency {
  constructor(name) {
    this.name = name;
  }

  static resolvableDependency(name, dependency) {
    const dep = new Dependency(name);
    dep.fn = dependency;
    dep.dependencies = FunctionArgumentsParser.parse(dependency);
    return dep;
  }

  static dependency(name, instance) {
    const dep = new Dependency(name);
    dep.instance = instance;
    return dep;
  }
}

module.exports = Dependency;
