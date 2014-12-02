var path              = require("path");
global.assert         = require('assert');
global.chai           = require('chai');
global.expect         = chai.expect
global.srcDir       = path.resolve(__dirname, "../src");
process.env.NODE_ENV = "test";
process.setMaxListeners(1000);