DependencyResolver = require "./DependencyResolver"

class DependencyManagement

  resolveDependency:(name)=>
    DependencyResolver.resolve(@, name, @logger)

  privateInjectorName:()->
    "$$"+@name

  inject:(fn)->
    name = @privateInjectorName()
    @addResolvableDependency(name, fn)
    @resolveDependency(name)
    @removeDependency(name)


module.exports = DependencyManagement


