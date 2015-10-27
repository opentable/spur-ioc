Injector      = require "#{srcDir}/Injector"
InjectorIndex = require "../../index.js"

describe "Injector Index", ->

  it "should exist", ->
    expect(Injector).to.exist
    expect(InjectorIndex).to.exist
    expect(Injector).to.equal(InjectorIndex)
