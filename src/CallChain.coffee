class CallChain

  constructor:(@name, @parent)->

  @create:(name)->
    new CallChain(name)

  add:(name)->
    new CallChain(name, @)

  hasParentName:(name)->
    (@name is name) or @parent?.hasParentName(name)

  hasCyclic:()->
    @parent?.hasParentName(@name)

  getHighlightedName:()->
    `'\033[33m'` + @name + `'\033[0m'`

  getPath:(highlight)->
    path = ""
    if @parent
      path = @parent.getPath() + " -> "
    if highlight
      path += @getHighlightedName()
    else
      path += @name

module.exports = CallChain
