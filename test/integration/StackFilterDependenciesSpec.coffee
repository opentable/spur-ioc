StackFilter = require "stack-filter"

###
Spot checking that our stack-filter dependencies are
still present.
###

describe "StackFilter dependency checks", ->

  it "StackFilter.configure exists", ->
    expect(StackFilter.configure).to.exist

  it "StackFilter.filter exists", ->
    expect(StackFilter.filter).to.exist
