const requireAll = require('require-all');
const path = require('path');
const _forEach = require('lodash.foreach');
const _isFunction = require('lodash.isfunction');
const _isObject = require('lodash.isobject');

const fileFilterExpression = require('./FileFilterExpression');

const hasOwnProp = function (source, propertyName) {
  return Object.prototype.hasOwnProperty.call(source, propertyName);
};

module.exports = {
  registerFolder(rootDir, dir) {
    const dirname = path.resolve(rootDir, dir);
    const libs = requireAll({
      dirname,
      filter: fileFilterExpression
    });
    this.registerLibMap(libs);
    return this;
  },

  registerLibMap(libs) {
    _forEach(libs, (value, name) => {
      if (hasOwnProp(libs, name)) {
        const lib = libs[name];
        if (_isFunction(lib)) {
          this.addResolvableDependency(name, lib);
        } else if (_isObject(lib)) {
          this.registerLibMap(lib);
        }
      }
    });
    return this;
  },

  registerFolders(rootDir, dirs) {
    _forEach(dirs, (dir) => this.registerFolder(rootDir, dir));
    return this;
  },

  registerDependencies(dependencies) {
    _forEach(dependencies, (value, name) => {
      if (hasOwnProp(dependencies, name)) {
        const lib = dependencies[name];
        this.addDependency(name, lib);
      }
    });
    return this;
  }
};
