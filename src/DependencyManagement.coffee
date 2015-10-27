DependencyResolver = require "./DependencyResolver"
_                  = require "lodash"

class DependencyManagement

  resolveDependency:(name)=>
    @resolver = DependencyResolver.resolve(@, name, @logger)

  privateInjectorName:()->
    "$$"+@name

  resolveExposedDependencies:()->
    @injectAndReturn @exposedDeps

  injectAndReturn:(deps)->
    resolvedDeps = null
    fn = ($injector)->
      if deps instanceof RegExp
        resolvedDeps = $injector.getRegex(deps)
      else if _.isArray(deps)
        resolvedDeps = $injector.getMap(deps)

    @inject(fn)
    resolvedDeps

  inject:(fn)->
    name = @privateInjectorName()
    @addResolvableDependency(name, fn, true)
    @resolveDependency(name)

module.exports = DependencyManagement
