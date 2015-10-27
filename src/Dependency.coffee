Util = require "./Util"

class Dependency

  constructor:(@name)->
    @fn
    @instance
    @dependencies

  @create:()->

  @resolvableDependency:(name, dependency)->
    dep = new Dependency(name)
    dep.fn = dependency
    dep.dependencies = Util.parseDependencies(dep.fn)
    dep

  @dependency:(name, instance)->
    dep = new Dependency(name)
    dep.instance = instance
    dep

module.exports = Dependency
