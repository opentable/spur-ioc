import requireAll from "require-all"
import path from "path"
import _ from "lodash"

const rfileFilter = /(.+)\.(js|json|coffee)$/

export default {
  registerFolder(rootDir, dir) {
    const dirname = path.resolve(rootDir, dir)
    const libs = requireAll({
      dirname,
      filter: rfileFilter
    })
    this.registerLibMap(libs)
    return this
  },

  registerLibMap(libs) {
    let name, lib
    for (name in libs) {
      if (libs.hasOwnProperty(name)) {
        lib = libs[name]
        if (_.isFunction(lib)) {
          this.addResolvableDependency(name, lib)
        } else if (_.isObject(lib)) {
          this.registerLibMap(lib)
        }
      }
    }
    return this
  },

  registerFolders(rootDir, dirs) {
    _.each(dirs, (dir) => this.registerFolder(rootDir, dir))
    return this
  },

  registerLibraries(libraries) {
    this.logger.warn(
      "registerLibraries is deprecated, use registerDependencies with explicit require instead."
    )
    let name, lib
    for (name in libraries) {
      if (libraries.hasOwnProperty(name)) {
        lib = libraries[name]
        this.addDependency(name, require(lib))
      }
    }
    return this
  },

  registerDependencies(dependencies) {
    let name, lib
    for (name in dependencies) {
      if (dependencies.hasOwnProperty(name)) {
        lib = dependencies[name]
        this.addDependency(name, lib)
      }
    }
    return this
  }
}