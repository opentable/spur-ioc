Dependency         = require "./Dependency"
Logger             = require "./Logger"
DependencyResolver = require "./DependencyResolver"

class ContainerManagement

  constructor:()->
    @dependencies = {}

  warnIfNeeded:(name)->
    if @hasDependency(name)
      @logger.warn "warning: #{name} dependency is being overwritten in #{@name} injector"

  addResolvableDependency:(name, dependency, suppressWarning = false)->
    @warnIfNeeded(name) unless suppressWarning
    @dependencies[name] = Dependency.resolvableDependency(name, dependency)
    @

  addDependency:(name, dependency, suppressWarning = false)->
    @warnIfNeeded(name) unless suppressWarning
    @dependencies[name] = Dependency.dependency(name, dependency)
    @

  addConstructedDependency:(name, dependency, suppressWarning = false)->
    @warnIfNeeded(name) unless suppressWarning
    @dependencies[name] = dependency
    @

  removeDependency:(name)->
    delete @dependencies[name]
    @

  getDependency:(name)->
    @dependencies[name]

  hasDependency:(name)->
    !!@dependencies[name]

  use:(otherInjector)->
    for k, v of otherInjector.dependencies
      @addConstructedDependency(k,v)
    @


module.exports = ContainerManagement