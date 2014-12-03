DependencyResolver = require "./DependencyResolver"

class DependencyManagement

  resolveDependency:(name)=>
    @resolver = DependencyResolver.resolve(@, name, @logger)

  privateInjectorName:()->
    "$$"+@name

  inject:(fn)->
    name = @privateInjectorName()
    @addResolvableDependency(name, fn, true)
    @resolveDependency(name)


module.exports = DependencyManagement


