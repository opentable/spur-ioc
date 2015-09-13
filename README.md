<div>
    <img src="https://raw.githubusercontent.com/opentable/spur-ioc/master/media/spur-ioc.png" alt="Spur: IoC" title="Spur: IoC">
    <a href="http://www.opentable.com/careers/technology/">
        <img src="https://raw.githubusercontent.com/opentable/spur-ioc/master/media/opentable-engineering.png" alt="OpenTable | Engineering" title="OpenTable | Engineering" align="right" />
    </a>
</div>

Dependency Injection Framework for [Node.js](http://nodejs.org/).

The project is still a work in progress. We are in the middle of making adjustments and are starting to dogfood the module in our own applications.

[![NPM version](https://badge.fury.io/js/spur-ioc.png)](http://badge.fury.io/js/spur-ioc)
[![Build Status](https://travis-ci.org/opentable/spur-ioc.png?branch=master)](https://travis-ci.org/opentable/spur-ioc)

# Topics

- [Features](#features)
- [Quick start](#quick-start)
- [API Reference](API.md)
- [Examples](#examples)
    - [Coffee-Script: Express.js Web Server](https://github.com/opentable/spur-express-coffee-example)
    - [JavaScript: Express.js Web Server](https://github.com/opentable/spur-express-js-example)
- [What is inversion of control and why you should use it?](#what-is-inversion-of-control-and-why-you-should-use-it)
- [Development](#development)
    - [Testing](#testing)
    - [Styleguide](#styleguide)
- [License](#license)
- [Changelog](#changelog)
- [Contributing](#contributing)

# Features

  * Dependency injection (IoC) inspired by AngularJS
  * Auto injects folders
  * Ability to merge injectors
  * Ability to link injectors
  * Makes testing super easy
    * Ability to substitute dependencies in tests
  * Resolution of dependencies by querying via regular expresion
  * Clear error stack trace reporting

# Example

```bash
$ npm install spur-ioc --save
```

Then: Define lib/injector.js

```javascript
var spur = require("spur-ioc");

module.exports = function(){
  // define a  new injector
  var ioc = spur.create("demo");


  //register external dependencies or globals
  ioc.registerDependencies({
    "_"           : require("underscore"),
    "path"        : require("path"),
    "console"     : console,
    "nodeProcess" : process
  });

  // register folders in your project to be autoinjected
  ioc.registerFolders(__dirname, [
    "demo"
  ]);

  return ioc;
}
```

Example auto injection in lib/demo/Tasks.js

```javascript
// underscore auto injected by name
// Tasks becomes a dependency itself
module.exports = function(_){
    return _.map([1,2,3], function(num) {
        return "Task " + num
    });
}
```
Then in lib/demo/TasksPrinter.js

```javascript
// Tasks and console autoinjected
module.exports = function(Tasks, console){
    return {
        print:function(){
            console.log(Tasks)
        }
    };
}
```

Then to run the app, create lib/start.js

```javascript
var injector = require("./injector");

injector().inject(function(TasksPrinter){
  TasksPrinter.print();
  // prints ["Task 1", "Task 2", "Task 3"]
});
```
# Testing

Dependency injection really improves the ease of testing, removes reliance on global variables and allows you to intercept seams and make dependencies friendly.

In test/unit/TasksPrinterSpec.coffee

```coffeescript
injector = require "../../lib/injector"
describe "TasksPrinter", ->
  beforeEach ->
    @mockConsole =
        logs:[]
        log:()-> @logs.push(arguments)

    #below we replace the console dependency silently
    injector()
        .addDependency("console", @mockConsole, true)
        .inject (@TasksPrinter)=>

  it "should exist", ->
    expect(@TasksPrinter).to.exist

  it "should greet correctly", ->
    @TasksPrinter.print()
    expect(@mockConsole.logs[0][0]).to.deep.equal [
        "Task 1", "Task 2", "Task 3"
    ]
```

# Error reporting

One of the great things about ioc is that you get real application dependency errors upfront at startup

Missing dependency with typo

```javascript
module.exports = function(TaskZ, console){
  //...
}

// Produces:
// ERROR Missing Dependency TaskZ in  $$demo -> TasksPrinter -> TaskZ
```

Adding a cyclic dependency back to TasksPrinter in Tasks.js

```javascript
module.exports = function(_, TasksPrinter){
  //...
}

// Produces:
// ERROR Cyclic Dependency TasksPrinter in  $$demo -> TasksPrinter -> Tasks -> TasksPrinter
```

# More Examples

In order to illustrate how to use Spur IoC, we created sample apps in both Coffee-Script and JavaScript. We will be building out a more elaborate application sample, so please check back soon.

 * [Coffee-Script: Express.js Web Server](https://github.com/opentable/spur-express-coffee-example)
 * [JavaScript: Express.js Web Server](https://github.com/opentable/spur-express-js-example)

# What is inversion of control and why you should use it?

[Inversion of Control (IoC)](http://en.wikipedia.org/wiki/Inversion_of_control) is also known as Dependency Injection (DI). IoC is a pattern in which objects define their external dependencies through constructor arguments or the use of a container factory. In short, the dependency is pushed to the class from the outside. All that means is that you shouldn't instantiate dependencies from inside the class.

Inversion of control is used to increase modularity of the program and make it extensible, and has applications in object-oriented programming and other programming paradigms.

It allows for the creation of cleaner and more modular code that is easier to develop, test and maintain:

* Single responsibility classes
* Easier mocking of objects for test fixtures
* Easier debugging in Node.js' async environment

# Development

...

## Running the tests Testing

To run the test suite, first install the dependancies, then run `npm test`:

```bash
$ npm install
$ npm test
```

# License

[MIT](LICENSE)

# Changelog

  * Initial commit and alpha release
