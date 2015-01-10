<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [API](#api)
  - [Spur](#spur)
      - [`spur.create(<name>)`](#spurcreatename)
  - [Injector](#injector)
      - [`ioc.registerLibraries(<object mapping>)`](#iocregisterlibrariesobject-mapping)
  - [](#)
      - [`ioc.registerDependencies(<object mapping>)`](#iocregisterdependenciesobject-mapping)
  - [](#-1)
      - [`ioc.registerFolders(<dirname>, <array of foldernames>)`](#iocregisterfoldersdirname-array-of-foldernames)
      - [`module.exports = function(dep1, dep2, ...){`](#moduleexports-=-functiondep1-dep2-)
  - [](#-2)
      - [`ioc.addDependency(<depname>, <dependency>, <supress dup warning>)`](#iocadddependencydepname-dependency-supress-dup-warning)
  - [](#-3)
      - [`ioc.addResolvableDependency(<depname>, <function>, <supress dup warning>)`](#iocaddresolvabledependencydepname-function-supress-dup-warning)
  - [```](#)
      - [`ioc.inject(<injection function>)`](#iocinjectinjection-function)
  - [Using Multiple Injectors](#using-multiple-injectors)
    - [Merge Example:](#merge-example)
      - [`ioc.merge(<anotherInjector>)`](#iocmergeanotherinjector)
    - [Expose + Link Example:](#expose--link-example)
      - [`ioc.expose(<array of dep names>)`](#iocexposearray-of-dep-names)
      - [`ioc.expose(<regex>)`](#iocexposeregex)
      - [`ioc.exposeAll()`](#iocexposeall)
      - [`ioc.link(<other-injector>)`](#ioclinkother-injector)
  - [$injector helper](#$injector-helper)
      - [`$injector.getRegex(<regex to match dependencies>)`](#$injectorgetregexregex-to-match-dependencies)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

#API

##Spur

####`spur.create(<name>)`

Creates an instance of the spur injector.

```javascript
var spur = require("spur-ioc");

module.exports = function(){
  var ioc = spur.create("mymodulename");
  // ...
  return ioc;
};
```

##Injector

####`ioc.registerLibraries(<object mapping>)`

Register external node modules.

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

* Note that we use `camelCase` convention for dependency name as hiphens are not valid in javascript variable names.

---

####`ioc.registerDependencies(<object mapping>)`

Register already constructed objects or global dependencies which can be mocked in your tests.

Example:

```javascript
ioc.registerDependencies({
  "JSON"        : JSON,
  "console"     : console,
  "nodeProcess" : process,
  "Schema"      : require("mongoose").Schema
});
```

This is useful to cover hard to test calls to the global process or global console object.

---

####`ioc.registerFolders(<dirname>, <array of foldernames>)`

Registers folders for autoinjection, dirname will be parent folder and foldernames will be the sub folders to auto inject.

```javascript
ioc.registerFolders(__dirname, [
  "runtime", "domain"
]);
```

Given this folder structure:

.
+-- runtime
|   +-- WebServer.js
+-- domain
|   +-- Book.js
|   +-- mappers
|   |   +-- BookMapper.coffee


The files `WebServer.js`, `Book.js`, `BookMapper.coffee` will be autoinjected by their filename without extension.

####`module.exports = function(dep1, dep2, ...){`

All autoinjected files must have the following signature which exports a function with the dependencies it needs, spur will autoinject by name.

Example:

```javascript
// In WebServer.js
module.exports = function(Book, BookMapper, express){
    //...
};
```

---

####`ioc.addDependency(<depname>, <dependency>, <supress dup warning>)`

The singular version of register dependencies.

Example:

```javascript
ioc.addDependency("console", console);
ioc.addDependency("console", console); //warns of overwritten dependency
ioc.addDependency("console", console, true); //surpress warning
```

---

####`ioc.addResolvableDependency(<depname>, <function>, <supress dup warning>)`

Register a resolvable dependency function.

Example:

```javascript
//function params will be autoinjected
ioc.addResolvableDependency("UncaughtHandler", function(nodeProcess, console){
  nodeProcess.on("uncaughtException", function(err){
      console.log(err);
      nodeProcess.exit(0);
  });
};
```
---

####`ioc.inject(<injection function>)`

Use at startup or in your tests to bootstrap application.

Example: Starting application

```javascript
//start.js
var injector = require("./injector");

injector().inject(function(MyWebServer, MongooseManager){
   MongooseManager.connect().then(function(){
      MyWebServer.start();
   });
});
```

Example: Unit Testing in javascript

```javascript
var injector = require("../../lib/injector");
describe("Greeter", function(){
  beforeEach(function(){
    var _this = this;
    injector().inject(function(Greeter){
      _this.Greeter = Greeter;
    })
  });

  it("should exist",function(){
    expect(this.Greeter).to.exist;
  });

  it("should greet correctly", function(){
    expect(this.Greeter.greet()).to.equal("Hello World!");
  });
});
```

Example: Unit Testing in coffeescript

```coffeescript
describe "Greeter", ->
  beforeEach ->
    injector().inject (@Greeter)=>

  it "should exist", ->
    expect(@Greeter).to.exist

  it "should greet correctly", ->
    expect(@Greeter.greet()).to.equal "Hello World!"
```

##Using Multiple Injectors

Spur IoC allows you to split up injectors and create resuable modules, modules then can be either merged or linked.

###Merge Example:

Merging allows you to combine multiple injectors in to 1 bigger injector if you had core utilities you could merge them into your app injectors and use them within your business logic.

* Note that merging will share 1 namespace and could overwrite dependencies with the same name.

####`ioc.merge(<anotherInjector>)`

CoreUtilitiesInjector.js

```javascript
var spur = require("spur-ioc");
module.exports = function(){
  var ioc = spur.create("core-utilities");
  ioc.registerFolders(__dirname, [
      "utils"
  ]);

  return ioc;
};
```

In MyAppInjector.js

```javascript
var spur = require("spur-ioc");
var CoreUtilitiesInjector = require("./CoreUtilitiesInjector");

module.exports = function(){
  var ioc = spur.create("my-app");

  ioc.registerFolders(__dirname, [
      "domain"
  ]);

  ioc.merge(CoreUtilitiesInjector());

  return ioc;
};
```

###Expose + Link Example:

Expose + link allows you to expose public dependencies to other injectors. All other dependencies will be private, and rather than merging spur-ioc will run both injectors side by side and pass exposed references to parent injectors.

In CoreApisInjector.js

```javascript
var spur = require("spur-ioc");
module.exports = function(){
  var ioc = spur.create("core-apis");

  ioc.registerLibraries({
      "request":"request",
      "_":"lodash"
  });

  ioc.registerFolders(__dirname, [
      "api"
  ]);

  // expose using array, the 2 apis which are defined in the api folder
  ioc.expose(["UsersAPI", "ProjectsAPI"]);

  // we can also expose by regex or exposeAll
  // ioc.expose(/.+API$/);
  // ioc.exposeAll();
  return ioc;
}
```

In MyAppInjector.js

```javascript
var spur = require("spur-ioc");
var CoreApisInjector = require("./CoreApisInjector");

module.exports = function(){
  var ioc = spur.create("my-app");

  ioc.registerFolders(__dirname, [
    "webserver"
  ]);

  ioc.link(CoreApisInjector());

  // Now we can use UsersAPI, ProjectsAPI
  ioc.addResolvableDependency("StatsAPI", function(UsersAPI, ProjectsAPI){
    return {
        counts:function(){
            users:UsersAPI.count(),
            projects:ProjectsAPI.count()
        }
    };
  });

  ioc.addResolvableDependency("WillBreak", function(_, request){
    //will throw missing dependency exception because _ + request are private to CoreApisInjector
  });

  return ioc;
}
```

####`ioc.expose(<array of dep names>)`

Example:

```javascript
ioc.expose(["PathUtils", "MyLogger"]);
```

####`ioc.expose(<regex>)`

Example:

```javascript
//depednencies ending with controller
ioc.expose(/.+Controller$/);
```

####`ioc.exposeAll()`

Expose all dependencies in the injector.

####`ioc.link(<other-injector>)`

Will run other injector and inject exposed dependencies into current injector.

## $injector helper

Alongside your register libraries and dependencies, spur-ioc provides a helper $injector which you can inject.

#### `$injector.getRegex(<regex to match dependencies>)`

Sometimes you want to inject multiple dependencies without listing them all out. getRegex will return a key:value object with dependencies matching the regex.

```javascript
module.exports = function($injector){
  // inject controllers by regex, convention is to have this calls at the top
  var controllers = $injector.getRegex(/Controller$/);

  /* returns {
    AppController:<AppControllerInstance>,
    TasksController:<TasksControllerInstance>
    ...
  } */

  // this will fail!, injector is disposed at startup,
  // cannot be used asynchronously
  setTimeout(function(){
    var controllers = $injector.getRegex(/Controller$/);
  }, 100);
};
```

* Note that $injector can only retrieve dependencies synchronously at startup.
* This is because spur-ioc resolves dependencies only at startup and then gets out the way to let the app work normally with those references.
