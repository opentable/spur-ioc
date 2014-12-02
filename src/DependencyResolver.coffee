CallChain   = require "./CallChain"
_           = require "lodash"
stackFilter = require "stack-filter"

class DependencyError

  constructor:(@callChain, @error, @errorObject)->

  @cyclic:(callChain)->
    new DependencyError(callChain, "Cyclic Dependency")

  @missingDependency:(callChain)->
    new DependencyError(callChain, "Missing Dependency")

  @exception:(callChain, exception)->
    new DependencyError(callChain, "Exception in Dependency", exception)

  print:(logger)->
    logger.error @error + " #{@callChain.getHighlightedName()} in ", @callChain.getPath()
    logger.fatal @errorObject.stack if @errorObject

class DependencyResolver

  constructor:(@container, @name, @logger)->
    @errors = []
    @stackFilter = stackFilter.configure({
      filters:["DependencyResolver.resolveDependencies"]
    })

  @resolve:(container, name, logger)->
    new DependencyResolver(container, name, logger).resolve()


  resolveDependencies:(name, callChain)=>
    callChain =
      if callChain
        callChain.add(name)
      else
        CallChain.create(name)

    dep = @container.getDependency(name)
    if dep
      if dep.instance
        return dep.instance
      else
        if callChain.hasCyclic()
          @errors.push DependencyError.cyclic(callChain)
        else
          instances = []
          for depName in dep.dependencies
            instances.push @resolveDependencies(depName, callChain)
          try
            dep.instance = dep.fn.apply null, instances
          catch e
            @cleanStack(e)
            @errors.push(DependencyError.exception(callChain, e))
          dep.instance
    else
      @errors.push DependencyError.missingDependency(callChain)

  cleanStack:(e)->
    e.stack =
      "\t" + @stackFilter.filter(e.stack).join("\n\t")

  printErrors:()->
    for e in @errors
      e.print(@logger)

  resolve:()->
    @dependency = @resolveDependencies(@name)
    if @errors.length > 0
      @printErrors()
      throw new Error("Resolver encountered errors")

    @dependency

module.exports = DependencyResolver
