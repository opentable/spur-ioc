// Register coffeescript for any CS dependencies
require('coffee-script/register');

const _ = require('lodash');
const Logger = require('./Logger');
const ContainerManagement = require('./ContainerManagement');
const DependencyManagement = require('./DependencyManagement');
const RegistrationManagement = require('./RegistrationManagement');

class Injector {
  constructor(name = 'anonymous_injector', logger = Logger.create()) {
    _.bindAll(this, 'resolveDependency');
    this.name = name;
    this.logger = logger;
    this.dependencies = {};
  }

  static create(name, logger) {
    return new Injector(name, logger);
  }
}

_.assign(Injector.prototype, ContainerManagement, DependencyManagement, RegistrationManagement);

module.exports = Injector;
