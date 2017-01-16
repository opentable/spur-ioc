import requireAll from 'require-all';
import path from 'path';
import _ from 'lodash';

const rfileFilter = /(.+)\.(js|json|coffee)$/;

const hasOwnProp = function (source, propertyName) {
  return Object.prototype.hasOwnProperty.call(source, propertyName);
};

export default {
  registerFolder(rootDir, dir) {
    const dirname = path.resolve(rootDir, dir);
    const libs = requireAll({
      dirname,
      filter: rfileFilter
    });
    this.registerLibMap(libs);
    return this;
  },

  registerLibMap(libs) {
    _.each(libs, (value, name) => {
      if (hasOwnProp(libs, name)) {
        const lib = libs[name];
        if (_.isFunction(lib)) {
          this.addResolvableDependency(name, lib);
        } else if (_.isObject(lib)) {
          this.registerLibMap(lib);
        }
      }
    });
    return this;
  },

  registerFolders(rootDir, dirs) {
    _.each(dirs, dir => this.registerFolder(rootDir, dir));
    return this;
  },

  registerLibraries(libraries) {
    this.logger.warn(
      'registerLibraries is deprecated, use registerDependencies with explicit require instead.'
    );

    _.each(libraries, (value, name) => {
      if (hasOwnProp(libraries, name)) {
        const lib = libraries[name];
        this.addDependency(name, require(lib)); // eslint-disable-line global-require
      }
    });
    return this;
  },

  registerDependencies(dependencies) {
    _.each(dependencies, (value, name) => {
      if (hasOwnProp(dependencies, name)) {
        const lib = dependencies[name];
        this.addDependency(name, lib);
      }
    });
    return this;
  }
};
