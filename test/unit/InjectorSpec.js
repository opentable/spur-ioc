import Injector from "../../dist/Injector"
import DependencyResolver from "../../dist/DependencyResolver"

describe("Injector", () => {
  beforeEach(function() {
    this.injector = Injector.create("injector1")
  })

  it("should exist", function() {
    expect(Injector).to.exist
    expect(this.injector).to.exist
  })

  it("inject", function() {
    this.injector.registerFolders(__dirname, ["../fixtures"])
    this.injector.inject((House) =>
      expect(House).to.equal("House with Pitched Roof and Barn Doors and Double GlazedWindows and Long Garden")
    )
  })

  it("multi injector", function() {
    let cyclicError, error

    this.injector1 = this.injector
    this.injector2 = Injector.create("injector2")
    this.injector1.registerDependencies({
      a: "a",
      b: "b"
    })
    this.injector2.registerDependencies({
      a: "a_updated",
      c: "c"
    })

    this.injector1.merge(this.injector2).inject((a, b, c, $injector) => {
      expect([a, b, c]).to.deep.equal(["a_updated", "b", "c"])
      expect($injector.getRegex(/./)).to.deep.equal({
        a: "a_updated",
        b: "b",
        c: "c"
      })
    })

    this.injector1.inject((a, b, c, $injector) => {
      expect([a, b, c]).to.deep.equal(["a_updated", "b", "c"])
      expect($injector.getRegex(/./)).to.deep.equal({
        a: "a_updated",
        b: "b",
        c: "c"
      })
    })

    this.injector1.inject($injector => expect($injector.getRegex(/ssd/)).to.deep.equal({}))

    this.injector1.inject($injector => expect($injector.getAll()).to.deep.equal({
      a: "a_updated",
      b: "b",
      c: "c"
    }))

    this.injector1.inject($injector => expect($injector.getMap(["a", "b"])).to.deep.equal({
      a: "a_updated",
      b: "b"
    }))

    this.injector1.inject($injector => expect($injector.getMap(["a", "b"])).to.deep.equal({
      a: "a_updated",
      b: "b"
    }))

    DependencyResolver.prototype.throwError = () => {}

    this.injector1.inject($injector => expect($injector.get("missing")).to.equal(null))
    error = this.injector1.resolver.errors[0]
    console.log(error)

    expect(error.error).to.equal("Missing Dependency")
    expect(error.callChain.getPath()).to.equal("$$injector1 -> $injector -> missing")

    this.injector1.addResolvableDependency("a", (b) => {}) // eslint-disable-line no-unused-vars
    this.injector1.addResolvableDependency("b", (a) => {}) // eslint-disable-line no-unused-vars
    this.injector1.inject($injector => $injector.get("a"))

    cyclicError = this.injector1.resolver.errors[0]
    expect(cyclicError.error).to.equal("Cyclic Dependency")
    expect(cyclicError.callChain.getPath()).to.equal("$$injector1 -> $injector -> a -> b -> a")
  })

  it("registeration methods", function() {
    this.injector.logger.warn = (warningMessage) => {
      this.warningMessage = warningMessage
    }
    this.injector.registerLibraries({
      _: "lodash",
      chai: "chai"
    }).inject((_, chai) => {
      expect(_.groupBy).to.exist
      expect(chai.Assertion).to.exist
      expect(this.warningMessage).to.equal("registerLibraries is deprecated, use registerDependencies with explicit require instead.")
    })
  })

  it("dont allow async use of $injector", function(done) {
    this.injector.registerLibraries({
      _: "lodash",
      chai: "chai"
    })
    this.injector.addResolvableDependency("foo", $injector => setTimeout(() => {
      expect(() => $injector.get("chai")).to.throw("cannot use $injector.get('chai') asynchronously")
      expect(() => $injector.getRegex(/.+/)).to.throw("cannot use $injector.getRegex(/.+/) asynchronously")
      done()
    }, 0))
    this.injector.inject((_, chai, $injector, foo) => {}) // eslint-disable-line no-unused-vars
  })

  describe("expose and link", () => {
    beforeEach(function() {
      this.injector.registerDependencies({
        c: "c"
      })
      this.injector2 = Injector.create("injector2")
      this.injector2.registerDependencies({
        a: "a",
        b: "b"
      })
    })

    it("expose - array", function() {
      this.injector2.expose(["a"])
      this.injector.link(this.injector2)
      this.injector.inject($injector => expect($injector.getAll()).to.deep.equal({
        c: "c",
        a: "a"
      }))
    })

    it("expose - regex", function() {
      this.injector2.expose(/b/)
      this.injector.link(this.injector2)
      this.injector.inject($injector => expect($injector.getAll()).to.deep.equal({
        c: "c",
        b: "b"
      }))
    })

    it("exposeAll", function() {
      this.injector2.exposeAll()
      this.injector.link(this.injector2)
      this.injector.inject($injector => expect($injector.getAll()).to.deep.equal({
        a: "a",
        c: "c",
        b: "b"
      }))
    })

    it("expose overwrite", function() {
      this.injector.registerDependencies({
        a: "A"
      })
      this.injector2.exposeAll()
      this.injector.link(this.injector2)
      this.injector.inject($injector => expect($injector.getAll()).to.deep.equal({
        c: "c",
        a: "a",
        b: "b"
      }))
    })
  })
})
