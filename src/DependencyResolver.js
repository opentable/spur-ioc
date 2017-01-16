import _ from 'lodash';
import stackFilter from 'stack-filter';
import CallChain from './CallChain';

class DependencyError {
  constructor(callChain, error, errorObject) {
    this.callChain = callChain;
    this.error = error;
    this.errorObject = errorObject;
  }

  print(logger) {
    logger.error(
      `${this.error} ${this.callChain.getHighlightedName()} in `,
      this.callChain.getPath(true)
    );
    if (this.errorObject) {
      logger.error(this.errorObject);
      logger.error(this.errorObject.stack);
    }
  }

  static cyclic(callChain) {
    return new DependencyError(callChain, 'Cyclic Dependency');
  }

  static missingDependency(callChain) {
    return new DependencyError(callChain, 'Missing Dependency');
  }

  static exception(callChain, exception) {
    return new DependencyError(callChain, 'Exception in Dependency', exception);
  }
}

class DependencyWarning {
  constructor(callChain, name, warningObject) {
    this.callChain = callChain;
    this.name = name;
    this.warningObject = warningObject;
  }

  print(logger) {
    return logger.warn(
      `${this.name} ${this.callChain.getHighlightedName()} in `,
      this.callChain.getPath(true)
    );
  }

  static unused(callChain) {
    return new DependencyWarning(callChain, 'Unused dependency');
  }
}

class DependencyResolver {
  constructor(container, name, logger) {
    _.bindAll(this, 'resolveDependencies', 'resolveRegex');
    this.container = container;
    this.name = name;
    this.logger = logger;
    this.errors = [];
    this.warnings = [];
    this.resolvingFinished = false;
    this.stackFilter = stackFilter.configure({
      filters: ['DependencyResolver.']
    });
  }

  resolveArray(deps, callChain) {
    let name;
    const instances = [];
    for (name of deps) {
      instances.push(this.resolveDependencies(name, callChain));
    }
    return instances;
  }

  resolveMap(deps, callChain) {
    let name;
    const instances = {};
    for (name of deps) {
      instances[name] = this.resolveDependencies(name, callChain);
    }
    return instances;
  }

  resolveRegex(regex) {
    const deps = _.keys(this.container.dependencies)
      .filter((key) => { // eslint-disable-line
        return regex.test(key) && key !== '$injector' && key !== this.container.privateInjectorName();
      });
    return this.resolveMap(deps);
  }

  addInjectorDependency() {
    this.$injector = this.container.addDependency('$injector', {
      get: (name) => {
        this.checkResolvingFinished(`cannot use $injector.get('${name}') asynchronously`);
        return this.resolveDependencies(name, this.currentCallChain);
      },
      getRegex: (regex) => {
        this.checkResolvingFinished(`cannot use $injector.getRegex(${regex}) asynchronously`);
        return this.resolveRegex(regex, this.currentCallChain);
      },
      getMap: (deps) => {
        this.checkResolvingFinished('cannot use $injector.getArray() asynchronously');
        return this.resolveMap(deps, this.currentCallChain);
      },
      getAll: () => {
        this.checkResolvingFinished('cannot use $injector.getAll() asynchronously');
        return this.resolveRegex(/.+/, this.currentCallChain);
      }
    }, true).instance;

    return this.$injector;
  }

  checkResolvingFinished(message) {
    if (this.resolvingFinished) {
      throw new Error(message);
    }
  }

  resolveDependencies(name, chain) {
    const callChain = this.currentCallChain = chain ? chain.add(name) : CallChain.create(name);
    const dep = this.container.getDependency(name);
    if (dep) {
      if (dep.instance) {
        return dep.instance;
      }

      if (callChain.hasCyclic()) {
        return this.errors.push(DependencyError.cyclic(callChain));
      }

      const instances = this.resolveArray(dep.dependencies, callChain);

      try {
        let dependency;
        const dependencies = dep.dependencies;
        for (dependency of dependencies) {
          if (dep.fn.toString().split(dependency).length <= 2) {
            this.warnings.push(DependencyWarning.unused(callChain.add(dependency)));
          }
        }
        dep.instance = dep.fn.apply(null, instances);
      } catch (error) {
        this.cleanStack(error);
        this.errors.push(DependencyError.exception(callChain, error));
      }

      return dep.instance;
    }

    this.errors.push(DependencyError.missingDependency(callChain));
    return null;
  }

  cleanStack(e) {
    return (e.stack = `\t${this.stackFilter.filter(e.stack).join('\n\t')}`); // eslint-disable-line no-param-reassign
  }

  printErrors() {
    let error;
    const results = [];
    for (error of this.errors) {
      results.push(error.print(this.logger));
    }
    return results;
  }

  printWarnings() {
    let warning;
    const results = [];
    for (warning of this.warnings) {
      results.push(warning.print(this.logger));
    }
    return results;
  }

  throwError() {
    throw new Error('Resolver encountered errors');
  }

  resolve() {
    this.addInjectorDependency();
    this.dependency = this.resolveDependencies(this.name);
    this.printWarnings();
    if (this.errors.length > 0) {
      this.printErrors();
      this.throwError();
    }
    this.resolvingFinished = true;
    return this.dependency;
  }

  static resolve(container, name, logger) {
    const resolver = new DependencyResolver(container, name, logger);
    resolver.resolve();
    return resolver;
  }
}

export default DependencyResolver;
