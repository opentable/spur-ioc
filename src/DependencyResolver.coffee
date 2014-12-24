CallChain   = require "./CallChain"
Dependency   = require "./Dependency"
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
    logger.error @error + " #{@callChain.getHighlightedName()} in ", @callChain.getPath(true)
    logger.error @errorObject if @errorObject
    logger.error @errorObject.stack if @errorObject

class DependencyResolver

  constructor:(@container, @name, @logger)->
    @errors = []
    @resolvingFinished = false
    @stackFilter = stackFilter.configure({
      # filters:["DependencyResolver."]
    })

  @resolve:(container, name, logger)->
    resolver = new DependencyResolver(container, name, logger)
    resolver.resolve()
    resolver


  resolveArray:(deps)->
    instances = []
    for depName in deps
      instances.push @resolveDependencies(depName)
    instances

  resolveMap:(deps)->
    instances = {}
    for depName in deps
      instances[depName] = @resolveDependencies(depName)
    instances

  resolveRegex:(regex)=>
    deps = _.keys(@container.dependencies).filter (key)=>
      regex.test(key) and key not in ["$injector", @container.privateInjectorName()]
    @resolveMap(deps)

  addInjectorDependency:()->
    @$injector = @container.addDependency("$injector", {
      get:(name)=>
        @checkResolvingFinished(
          "cannot use $injector.get('#{name}') asynchronously")
        @resolveDependencies(name)
      getRegex:(regex)=>
        @checkResolvingFinished(
          "cannot use $injector.getRegex(#{regex}) asynchronously")
        @resolveRegex(regex)
      getArray:(deps)=>
        @checkResolvingFinished(
          "cannot use $injector.getArray() asynchronously")
        @resolveMap(deps)
      getAll:()=>
        @checkResolvingFinished(
          "cannot use $injector.getAll() asynchronously")
        @resolveRegex(/.+/)
    }, true).instance

  checkResolvingFinished:(message)->
    if @resolvingFinished
      throw new Error(message)

  resolveDependencies:(name)=>
    @callChain =
      if @callChain
        @callChain.add(name)
      else
        CallChain.create(name)

    dep = @container.getDependency(name)
    if dep
      if dep.instance
        return dep.instance
      else
        if @callChain.hasCyclic()
          @errors.push DependencyError.cyclic(@callChain)
        else
          instances = @resolveArray(dep.dependencies)
          try
            dep.instance = dep.fn.apply null, instances
          catch e
            @cleanStack(e)
            @errors.push(DependencyError.exception(@callChain, e))
          dep.instance
    else
      @errors.push DependencyError.missingDependency(@callChain)
      return null

  cleanStack:(e)->
    e.stack =
      "\t" + @stackFilter.filter(e.stack).join("\n\t")

  printErrors:()->
    for e in @errors
      e.print(@logger)

  throwError:()->
    throw new Error("Resolver encountered errors")

  resolve:()->
    @addInjectorDependency()
    @dependency = @resolveDependencies(@name)
    if @errors.length > 0
      @printErrors()
      @throwError()
    @resolvingFinished = true
    @dependency


module.exports = DependencyResolver
