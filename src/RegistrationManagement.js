const path = require('path');
const requireAll = require('require-all');

const Utils = require('./Utils');
const fileFilterExpression = require('./FileFilterExpression');

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

  registerLibMap(libs = {}) {
    const names = Object.keys(libs) || [];
    names.forEach((name) => {
      if (Utils.hasOwnProp(libs, name)) {
        const lib = libs[name];
        if (Utils.isFunction(lib)) {
          this.addResolvableDependency(name, lib);
        } else if (Utils.isObject(lib)) {
          this.registerLibMap(lib);
        }
      }
    });
    return this;
  },

  registerFolders(rootDir, dirs = []) {
    dirs.forEach((dir) => this.registerFolder(rootDir, dir));
    return this;
  },

  registerDependencies(dependencies = {}) {
    const names = Object.keys(dependencies) || [];
    names.forEach((name) => {
      if (Utils.hasOwnProp(dependencies, name)) {
        const lib = dependencies[name];
        this.addDependency(name, lib);
      }
    });
    return this;
  }
};
