const _bindAll = require('lodash.bindall');
const _assign = require('lodash.assign');
const Logger = require('./Logger');
const ContainerManagement = require('./ContainerManagement');
const DependencyManagement = require('./DependencyManagement');
const RegistrationManagement = require('./RegistrationManagement');

class Injector {
  constructor(name = 'anonymous_injector', logger = Logger.create()) {
    _bindAll(this, 'resolveDependency');
    this.name = name;
    this.logger = logger;
    this.dependencies = {};
  }

  static create(name, logger) {
    return new Injector(name, logger);
  }
}

_assign(Injector.prototype, ContainerManagement, DependencyManagement, RegistrationManagement);

module.exports = Injector;
