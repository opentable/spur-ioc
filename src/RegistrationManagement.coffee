requireAll = require "require-all"
path       = require "path"
_          = require "lodash"

class RegistrationManagement

  constructor:()->

  registerFolder:(rootDir, dir)->
    dirname = path.resolve(rootDir,dir)
    libs = requireAll({
      dirname     :  dirname
      filter      :  /(.+)\.(js|json|coffee)$/
    })
    @registerLibMap(libs)
    @

  registerLibMap:(libs)->
    for k, v of libs
      if _.isFunction(v)
        @addResolvableDependency(k,v)
      else if _.isObject(v)
        @registerLibMap(v)
    @

  registerFolders:(rootDir, dirs)->
    _.each dirs, (dir)=>
      @registerFolder(rootDir, dir)
    @

  registerLibraries:(libraries)->
    @logger.warn "registerLibraries is deprecated, use registerDependencies with explicit require instead."
    for depName,libName of libraries
      @addDependency(depName,require(libName))
    @

  registerDependencies:(dependencies)->
    for k,v of dependencies
      @addDependency(k,v)
    @

module.exports = RegistrationManagement
