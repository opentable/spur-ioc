#API

##Spur

####`spur.create(<name>)`
creates an instance of the spur injector
```javascript
var spur = require("spur-ioc");

module.exports = function(){
    var ioc = spur.create("mymodulename");

    ...

    return ioc;
}
```

##Injector

####`ioc.registerLibraries(<object mapping>)`
Register external node modules


Example:

```javascript
ioc.registerLibraries({
    "express"         : "express",
    "methodOverride"  : "method-override",
    "cookieParser"    : "cookie-parser",
    "bodyParser"      : "body-parser",
    "path"            : "path",
    "fs"              : "fs"
});
```
Note that we use `camelCase` convention for dependency name as hiphens are not valid in javascript variable names

---
####`ioc.registerDependencies(<object mapping>)`
Register already constructed objects or global dependencies which can be mocked in your tests

Example:
```javascript
  ioc.registerDependencies({
    "JSON":JSON,
    "console":console,
    "nodeProcess:process,
    "Schema":require("mongoose").Schema
  });
```

This is useful to cover hard to test calls to the global process or global console object

---
####`ioc.registerFolders(<dirname>, <array of foldernames>)`
registers folders for autoinjection, dirname will be parent folder and foldernames will be the sub folders to auto inject.

Given this folder structure
```
 /runtime
   WebServer.js
 /domain
    Book.js
    /mappers
        BookMapper.coffee
```
```javascript
 ioc.registerFolders(__dirname, [
    "runtime", "domain"
 ]);
```
The files `WebServer.js`, `Book.js`, `BookMapper.coffee` will be autoinjected by their filename without extension

####`module.exports = function(dep1, dep2, ...){`
All autoinjected files must have the following signature whihc exports a function with the dependencies it needs, spur will autoinject by name

Example:
```javascript
In WebServer.js
module.exports = function(Book, BookMapper, express){
    /...
}
```

---
####`ioc.addDependency(<depname>, <dependency>, <supress dup warning>)`
the singular version of register dependencies

Example:

```javascript
ioc.addDependency("console", console)
ioc.addDependency("console", console) //warns of overwritten dependency
ioc.addDependency("console", console, true) //surpress warning
```

---
####`ioc.addResolvableDependency(<depname>, <function>, <supress dup warning>)`
register a resolvable dependency function

Example:

```javascript
//function params will be autoinjected
ioc.addResolvableDependency("UncaughtHandler", function(nodeProcess, console){
    nodeProcess.on("uncaughtException", function(err){
        console.log(err);
        nodeProcess.exit(0)
    });
}
```
---
####`ioc.inject(<injection function>)`
Use at startup or in your tests to bootstrap application

Example: Starting application
```javascript
//start.js
var injector = require("./injector")
injector().inject(function(MyWebServer, MongooseManager){
   MongooseManager.connect().then(function(){
      MyWebServer.start()
   });
})l
```

Example: Unit Testing
```javascript
var injector = require("../../lib/injector");
describe("Greeter", function(){
  beforeEach(function(){
    var _this = this;
    injector().inject(function(Greeter){
      _this.Greeter = Greeter
    })
  })
  it("should exist",function(){
    expect(this.Greeter).to.exist;
  });
  it("should greet correctly", function(){
    expect(this.Greeter.greet()).to.equal("Hello World!");
  })
});
```