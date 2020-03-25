'use strict';

module.exports = {
  diff: true,
  extension: ['js'],
  package: '../package.json',
  require: ['./test/globals.js'],
  reporter: 'spec',
  recursive: true,
  ui: 'bdd',
  'watch-files': ['src/**/*.js', 'test/**/*.js'],
  'watch-ignore': ['node_modules']
};
