Injector = require "../../src/Injector"
InjectorIndex = require "../../lib/Injector"

describe "Original > Injector Index", ->

  it "should exist", ->
    expect(Injector).to.exist
    expect(InjectorIndex).to.exist
