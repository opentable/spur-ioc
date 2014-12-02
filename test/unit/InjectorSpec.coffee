Injector = require "#{srcDir}/Injector"

describe "Injector", ->

  beforeEach ->
    @injector = Injector.create("injector1")

  it "should exist", ->
    expect(Injector).to.exist
    expect(@injector).to.exist

  it "inject", ->
    @injector.registerFolders __dirname,[
      "../fixtures"
    ]

    @injector.inject (House)->
      expect(House).to.equal """
        House with Pitched Roof and Barn Doors and Double GlazedWindows and Long Garden
      """.trim()

  it "multi injector", ->
    @injector1 = @injector
    @injector2 = Injector.create("injector2")
    @injector1.registerDependencies({
      a:"a"
      b:"b"
    })

    @injector2.registerDependencies({
      a:"a_updated"
      c:"c"
    })
    @injector1.use(@injector2)
    @injector1.inject (a,b,c)->
      console.log a,b,c



      # console.log @container
    # expect(@container.inject (a,b,c)->)
    #   .to.deep.equal ['a','b','c']


