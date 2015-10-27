class Module

  constructor:()->
    for module in @$modules or []
      module.apply(this, arguments)

  include:(module)->
    for key, value of module::
      @[key] = value
    module.apply(this)

  @include: (obj) ->
    @::$modules ?= []
    @::$modules.push(obj)
    for key, value of obj::
      @::[key] = value
    @

module.exports = Module
