DependencyResolver = require "./DependencyResolver"

class DependencyManagement

  resolveDependency:(name)=>
    DependencyResolver.resolve(@, name, @logger)

  privateInjectorName:()->
    "$$"+@name

  inject:(fn)->
    @addResolvableDependency(@privateInjectorName(), fn)
    @resolveDependency(@privateInjectorName())


module.exports = DependencyManagement


