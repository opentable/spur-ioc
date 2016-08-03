Injector = require "../../src/Injector"

describe "Original", ->

  describe "injector - Container Management", ->

    beforeEach ->
      @injector = Injector.create("test-injector")

    it "addResolvableDependency", ->
      @injector.addResolvableDependency "foo", (bar)->

      dep = @injector.getDependency("foo")
      expect(dep.dependencies).to.deep.equal ["bar"]
      expect(dep.name).to.equal "foo"

      @injector.addResolvableDependency "foo", (bar)->
        console.log bar

    it "inject", ->
      @injector.addResolvableDependency "foo", (bar, punct, _)->
        bar + " world" + punct + _.VERSION

      @injector.addResolvableDependency "bar", (error)-> "hi"
      @injector.addResolvableDependency "error", (error1)->
      @injector.addResolvableDependency("error1", (error2)->)
        .addResolvableDependency "error2", (error3)->

      @injector.addResolvableDependency "error3", (exception, cyclic, missing)->

      #exception
      @injector.addResolvableDependency "exception", ()-> throw new Error("Oh no")

      #cyclic
      @injector.addResolvableDependency "cyclic", (error)->
      @injector.addResolvableDependency "missing", (nothing, $injector)->
      @injector.addDependency "punct", "!"
      @injector.addDependency "_", require("lodash")

      testExpectation = =>
        @injector.inject (foo)=>
          console.log foo

      expect(testExpectation).to.throw("Resolver encountered errors")
