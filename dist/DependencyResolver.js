"use strict";

exports.__esModule = true;

var _CallChain = require("./CallChain");

var _CallChain2 = _interopRequireDefault(_CallChain);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _stackFilter = require("stack-filter");

var _stackFilter2 = _interopRequireDefault(_stackFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DependencyError = function () {
  function DependencyError(callChain, error, errorObject) {
    _classCallCheck(this, DependencyError);

    this.callChain = callChain;
    this.error = error;
    this.errorObject = errorObject;
  }

  DependencyError.prototype.print = function print(logger) {
    logger.error(this.error + " " + this.callChain.getHighlightedName() + " in ", this.callChain.getPath(true));
    if (this.errorObject) {
      logger.error(this.errorObject);
      logger.error(this.errorObject.stack);
    }
  };

  DependencyError.cyclic = function cyclic(callChain) {
    return new DependencyError(callChain, "Cyclic Dependency");
  };

  DependencyError.missingDependency = function missingDependency(callChain) {
    return new DependencyError(callChain, "Missing Dependency");
  };

  DependencyError.exception = function exception(callChain, _exception) {
    return new DependencyError(callChain, "Exception in Dependency", _exception);
  };

  return DependencyError;
}();

var DependencyWarning = function () {
  function DependencyWarning(callChain, name, warningObject) {
    _classCallCheck(this, DependencyWarning);

    this.callChain = callChain;
    this.name = name;
    this.warningObject = warningObject;
  }

  DependencyWarning.prototype.print = function print(logger) {
    return logger.warn(this.name + " " + this.callChain.getHighlightedName() + " in ", this.callChain.getPath(true));
  };

  DependencyWarning.unused = function unused(callChain) {
    return new DependencyWarning(callChain, "Unused dependency");
  };

  return DependencyWarning;
}();

var DependencyResolver = function () {
  function DependencyResolver(container, name, logger) {
    _classCallCheck(this, DependencyResolver);

    _lodash2.default.bindAll(this, "resolveDependencies", "resolveRegex");
    this.container = container;
    this.name = name;
    this.logger = logger;
    this.errors = [];
    this.warnings = [];
    this.resolvingFinished = false;
    this.stackFilter = _stackFilter2.default.configure({
      filters: ["DependencyResolver."]
    });
  }

  DependencyResolver.prototype.resolveArray = function resolveArray(deps, callChain) {
    var name = undefined;
    var instances = [];
    for (var _iterator = deps, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      if (_isArray) {
        if (_i >= _iterator.length) break;
        name = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        name = _i.value;
      }

      instances.push(this.resolveDependencies(name, callChain));
    }
    return instances;
  };

  DependencyResolver.prototype.resolveMap = function resolveMap(deps, callChain) {
    var name = undefined;
    var instances = {};
    for (var _iterator2 = deps, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        name = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        name = _i2.value;
      }

      instances[name] = this.resolveDependencies(name, callChain);
    }
    return instances;
  };

  DependencyResolver.prototype.resolveRegex = function resolveRegex(regex) {
    var _this = this;

    var deps = _lodash2.default.keys(this.container.dependencies).filter(function (key) {
      return regex.test(key) && key !== "$injector" && key !== _this.container.privateInjectorName();
    });
    return this.resolveMap(deps);
  };

  DependencyResolver.prototype.addInjectorDependency = function addInjectorDependency() {
    var _this2 = this;

    this.$injector = this.container.addDependency("$injector", {
      get: function get(name) {
        _this2.checkResolvingFinished("cannot use $injector.get('" + name + "') asynchronously");
        return _this2.resolveDependencies(name, _this2.currentCallChain);
      },
      getRegex: function getRegex(regex) {
        _this2.checkResolvingFinished("cannot use $injector.getRegex(" + regex + ") asynchronously");
        return _this2.resolveRegex(regex, _this2.currentCallChain);
      },
      getMap: function getMap(deps) {
        _this2.checkResolvingFinished("cannot use $injector.getArray() asynchronously");
        return _this2.resolveMap(deps, _this2.currentCallChain);
      },
      getAll: function getAll() {
        _this2.checkResolvingFinished("cannot use $injector.getAll() asynchronously");
        return _this2.resolveRegex(/.+/, _this2.currentCallChain);
      }
    }, true).instance;

    return this.$injector;
  };

  DependencyResolver.prototype.checkResolvingFinished = function checkResolvingFinished(message) {
    if (this.resolvingFinished) {
      throw new Error(message);
    }
  };

  DependencyResolver.prototype.resolveDependencies = function resolveDependencies(name, chain) {
    var callChain = this.currentCallChain = chain ? chain.add(name) : _CallChain2.default.create(name);
    var dep = this.container.getDependency(name);
    if (dep) {
      if (dep.instance) {
        return dep.instance;
      }

      if (callChain.hasCyclic()) {
        return this.errors.push(DependencyError.cyclic(callChain));
      }

      var instances = this.resolveArray(dep.dependencies, callChain);

      try {
        var dependency = undefined;
        var dependencies = dep.dependencies;
        for (var _iterator3 = dependencies, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
          if (_isArray3) {
            if (_i3 >= _iterator3.length) break;
            dependency = _iterator3[_i3++];
          } else {
            _i3 = _iterator3.next();
            if (_i3.done) break;
            dependency = _i3.value;
          }

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
  };

  DependencyResolver.prototype.cleanStack = function cleanStack(e) {
    return e.stack = "\t" + this.stackFilter.filter(e.stack).join("\n\t"); // eslint-disable-line no-param-reassign
  };

  DependencyResolver.prototype.printErrors = function printErrors() {
    var error = undefined;
    var results = [];
    for (var _iterator4 = this.errors, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
      if (_isArray4) {
        if (_i4 >= _iterator4.length) break;
        error = _iterator4[_i4++];
      } else {
        _i4 = _iterator4.next();
        if (_i4.done) break;
        error = _i4.value;
      }

      results.push(error.print(this.logger));
    }
    return results;
  };

  DependencyResolver.prototype.printWarnings = function printWarnings() {
    var warning = undefined;
    var results = [];
    for (var _iterator5 = this.warnings, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
      if (_isArray5) {
        if (_i5 >= _iterator5.length) break;
        warning = _iterator5[_i5++];
      } else {
        _i5 = _iterator5.next();
        if (_i5.done) break;
        warning = _i5.value;
      }

      results.push(warning.print(this.logger));
    }
    return results;
  };

  DependencyResolver.prototype.throwError = function throwError() {
    throw new Error("Resolver encountered errors");
  };

  DependencyResolver.prototype.resolve = function resolve() {
    this.addInjectorDependency();
    this.dependency = this.resolveDependencies(this.name);
    this.printWarnings();
    if (this.errors.length > 0) {
      this.printErrors();
      this.throwError();
    }
    this.resolvingFinished = true;
    return this.dependency;
  };

  DependencyResolver.resolve = function resolve(container, name, logger) {
    var resolver = new DependencyResolver(container, name, logger);
    resolver.resolve();
    return resolver;
  };

  return DependencyResolver;
}();

exports.default = DependencyResolver;