/* eslint-disable no-unused-vars */
import Injector from "../../src/Injector"

describe("injector - Container Management", () => {
  beforeEach(function() {
    this.injector = Injector.create()
  })

  it("should exist", function() {
    expect(Injector).to.exist
    expect(this.injector).to.exist
  })

  it("addResolvableDependency", function() {
    this.injector.addResolvableDependency("foo", bar => {})
    const dep = this.injector.getDependency("foo")
    expect(dep.dependencies).to.deep.equal(["bar"])
    expect(dep.name).to.equal("foo")
    this.injector.addResolvableDependency("foo", bar => console.log(bar))
  })

  it("inject", function() {
    this.injector.addResolvableDependency("foo", (bar, punct, _) => `${bar} world${punct}${_.VERSION}`)
    this.injector.addResolvableDependency("bar", error => "hi")
    this.injector.addResolvableDependency("error", error1 => {})
    this.injector.addResolvableDependency("error1", error2 => {}).addResolvableDependency("error2", error3 => {})
    this.injector.addResolvableDependency("error3", (exception, cyclic, missing) => {})
    this.injector.addResolvableDependency("exception", () => {
      throw new Error("Oh no")
    })
    this.injector.addResolvableDependency("cyclic", error => {})
    this.injector.addResolvableDependency("missing", (nothing, $injector) => {})
    this.injector.addDependency("punct", "!")
    this.injector.addDependency("_", require("lodash"))
    expect(() => this.injector.inject(foo => console.log(foo))).to.throw("Resolver encountered errors")
  })
})
