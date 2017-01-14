<img src="https://opentable.github.io/spur/logos/Spur-IoC.png?rand=1" width="100%" alt="Spur: IoC" />

Dependency Injection library for [Node.js](http://nodejs.org/).

[![npm version](https://badge.fury.io/js/spur-ioc.svg)](http://badge.fury.io/js/spur-ioc)
[![Build Status](https://travis-ci.org/opentable/spur-ioc.svg?branch=master)](https://travis-ci.org/opentable/spur-ioc)
[![Dependencies](https://david-dm.org/opentable/spur-ioc.svg)](https://david-dm.org/opentable/spur-ioc)
[![devDependency Status](https://david-dm.org/opentable/spur-ioc/dev-status.svg)](https://david-dm.org/opentable/spur-ioc?type=dev)

# About the Spur Framework

The Spur Framework is a collection of commonly used Node.JS libraries used to create common application types with shared libraries.

[Visit NPMJS.org for a full list of Spur Framework libraries](https://www.npmjs.com/browse/keyword/spur-framework) >>

# Topics

- [Features](#features)
- [What is inversion of control and why you should use it?](#what-is-inversion-of-control-and-why-you-should-use-it)
- [Quick start](#quick-start)
    - [Usage](#usage)
    - [Writing tests](#writing-tests)
- [API Reference](API.md)
- [Contributing](#contributing)
- [License](#license)

# Features

  * Dependency injection (IoC) inspired by AngularJS
  * Auto injects folders
  * Ability to merge injectors
  * Ability to link injectors
  * Makes testing super easy
    * Ability to substitute dependencies in tests
  * Resolution of dependencies by querying via regular expression
  * Clear error stack trace reporting
  * Supports active Node versions in the [LTS Schedule](https://github.com/nodejs/LTS#lts-schedule). ([view current versions](.travis.yml))

# What is inversion of control and why you should use it?

[Inversion of Control (IoC)](http://en.wikipedia.org/wiki/Inversion_of_control) is also known as Dependency Injection (DI). IoC is a pattern in which objects define their external dependencies through constructor arguments or the use of a container factory. In short, the dependency is pushed to the class from the outside. All that means is that you shouldn't instantiate dependencies from inside the class.

Inversion of control is used to increase modularity of the program and make it extensible, and has applications in object-oriented programming and other programming paradigms.

It allows for the creation of cleaner and more modular code that is easier to develop, test and maintain:

* Single responsibility classes
* Easier mocking of objects for test fixtures
* Easier debugging in Node.js' async environment

# Quick start

## Installation

```bash
$ npm install spur-ioc --save
```

## Usage

Here is a quick example that sets up the definition of an injector, some dependencies and a startup script.

#### `src/injector.js`

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

  // register folders in your project to be auto-injected
  ioc.registerFolders(__dirname, [
    "demo"
  ]);

  return ioc;
}
```

#### `src/demo/Tasks.js`

Example of file that depends on an injectable dependency. This example shows the usage of underscore (_).

```javascript
module.exports = function(_){
    return _.map([1,2,3], function(num) {
        return "Task " + num;
    });
}
```

#### `src/demo/TasksPrinter.js`

This example injects Tasks and console dependencies, both previously defined in the injector.

```javascript
module.exports = function(Tasks, console){
    return {
        print: function(){
          console.log(Tasks);
        }
    };
}
```

#### `src/start.js` (top declaration file)

Example of how to create an instance of the injector and start the app by using one of its dependencies.

```javascript
var injector = require("./injector");

injector().inject(function(TasksPrinter){
  TasksPrinter.print();
});
```

##### Usage note for ES6 syntax

While it is tempting to utilize the fat arrow syntax in this top declaration file like the example below, it will not be supported by spur-ioc. For more information, read issue [#26](https://github.com/opentable/spur-ioc/issues/26). Instead use the recommended approach above. There isn't a compelling reason to add that additional support. If you use this style, it will break as the report in issue #26.

```javascript
var injector = require("./injector");

injector().inject((TasksPrinter) => {
  TasksPrinter.print();
});
```

## Writing tests

Dependency injection really improves the ease of testing, removes reliance on global variables and allows you to intercept seams and make dependencies friendly.

#### `test/unit/src/TasksPrinterSpec.coffee`

The tests examples are in coffee-script because the syntax of coffee script makes this code much lighter and easier to read and maintain.

```coffeescript
injector = require "../../lib/injector"

describe "TasksPrinter", ->
  beforeEach ->
    @mockConsole = {
      logs:[],
      log:()-> @logs.push(arguments)
    }

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

## More Examples

In order to illustrate how to use Spur IoC, we created sample apps in both Coffee-Script and JavaScript. We will be building out a more elaborate application sample, so please check back soon.

 * [Coffee-Script: Express.js Web Server](https://github.com/opentable/spur-express-coffee-example)
 * [JavaScript: Express.js Web Server](https://github.com/opentable/spur-express-js-example)

## Error reporting

One of the great things about ioc is that you get real application dependency errors upfront at startup

#### Missing dependency with typo

```javascript
module.exports = function(TaskZ, console){
  //...
}

// Produces:
// ERROR Missing Dependency TaskZ in  $$demo -> TasksPrinter -> TaskZ
```

#### Adding a cyclic dependency back to TasksPrinter in Tasks.js

```javascript
module.exports = function(_, TasksPrinter){
  //...
}

// Produces:
// ERROR Cyclic Dependency TasksPrinter in  $$demo -> TasksPrinter -> Tasks -> TasksPrinter
```

# Contributing

## We accept pull requests

Please send in pull requests and they will be reviewed in a timely manner. Please review this [generic guide to submitting a good pull requests](https://github.com/blog/1943-how-to-write-the-perfect-pull-request). The only things we ask in addition are the following:

 * Please submit small pull requests
 * Provide a good description of the changes
 * Code changes must include tests
 * Be nice to each other in comments. :innocent:

## Style guide

The majority of the settings are controlled using an [EditorConfig](.editorconfig) configuration file. To use it [please download a plugin](http://editorconfig.org/#download) for your editor of choice.

Lint source code by running `npm run lint`.

## All tests should pass

To run the test suite, first install the dependancies, then run `npm test`

```bash
$ npm install
$ npm test
```

## Watch files and rebuild on change

```bash
$ npm run dev
```

# License

[MIT](LICENSE)
