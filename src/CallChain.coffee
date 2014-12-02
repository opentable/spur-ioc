class CallChain

  constructor:(@name, @parent)->
    @leaf = true

  @create:(name)->
    new CallChain(name)

  add:(name)->
    @leaf = false
    new CallChain(name, @)

  hasParentName:(name)->
    (@name is name and @parent?) or @parent?.hasParentName(name)

  hasCyclic:()->
    @parent?.hasParentName(@name)

  getHighlightedName:()->
    `'\033[33m'` + @name + `'\033[0m'`

  getPath:()->
    path = ""
    if @parent
      path = @parent.getPath() + " -> "
    if @leaf
      path += @getHighlightedName()
    else
      path += @name




module.exports = CallChain