const _bindAll = require('lodash.bindall');
const _forEach = require('lodash.foreach');

class Level {
  constructor(level, name, ascii, exit = false) {
    _bindAll(this, 'log');
    this.level = level;
    this.name = name;
    this.ascii = ascii;
    this.exit = exit;
  }

  static create(...args) {
    return new Level(...args);
  }

  log(...args) {
    return console.log.apply(console, [this.ascii].concat(args));
  }
}

const LEVELS = {
  fatal: Level.create(0, 'FATAL', 'FATAL', true),
  error: Level.create(1, 'Error', 'ERROR'),
  warn: Level.create(2, 'WARNING', 'WARNING'),
  info: Level.create(3, 'INFO', 'INFO'),
  debug: Level.create(4, 'DEBUG', 'DEBUG'),
  trace: Level.create(5, 'TRACE', 'TRACE')
};

class Logger {
  constructor() {
    this.addLoggingMethods();
  }

  static create() {
    return new Logger();
  }

  addLoggingMethods() {
    _forEach(LEVELS, (value, name) => {
      if (Object.prototype.hasOwnProperty.call(LEVELS, name)) {
        this[name] = LEVELS[name].log;
      }
    });
  }
}

module.exports = Logger;
