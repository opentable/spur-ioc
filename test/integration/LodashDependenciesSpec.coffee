_ = require "lodash"

###
Spot checking that our lodash dependencies are
still present.
###

describe "Lodash dependency checks", ->

  it "_.isArray exists", ->
    expect(_.isArray).to.exist

  it "_.keys exists", ->
    expect(_.keys).to.exist

  it "_.isFunction exists", ->
    expect(_.isFunction).to.exist

  it "_.isObject exists", ->
    expect(_.isObject).to.exist

  it "_.each exists", ->
    expect(_.each).to.exist

  it "_.compact exists", ->
    expect(_.compact).to.exist

  it "_.map exists", ->
    expect(_.map).to.exist
