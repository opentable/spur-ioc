// Register coffeescript for any CS dependencies
import 'coffee-script/register';

import _ from 'lodash';
import Logger from './Logger';
import ContainerManagement from './ContainerManagement';
import DependencyManagement from './DependencyManagement';
import RegistrationManagement from './RegistrationManagement';

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

export default Injector;
