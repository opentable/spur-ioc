import _ from 'lodash';
import chalk from 'chalk';

class Level {
  constructor(level, name, ascii, exit = false) {
    _.bindAll(this, 'log');
    this.level = level;
    this.name = name;
    this.ascii = ascii;
    this.exit = exit;
  }

  static create(...args) {
    return new Level(...args);
  }

  log(...args) {
    // eslint-disable-next-line no-console, prefer-spread
    return console.log.apply(console, [this.ascii].concat(args));
  }
}

const LEVELS = {
  fatal: Level.create(0, 'FATAL', chalk.black.bgRed('FATAL'), true),
  error: Level.create(1, 'Error', chalk.red('ERROR')),
  warn: Level.create(2, 'WARNING', chalk.yellow('WARNING')),
  info: Level.create(3, 'INFO', chalk.green('INFO')),
  debug: Level.create(4, 'DEBUG', chalk.reset('DEBUG')),
  trace: Level.create(5, 'TRACE', chalk.white('TRACE'))
};

class Logger {
  constructor() {
    this.addLoggingMethods();
  }

  static create() {
    return new Logger();
  }

  addLoggingMethods() {
    _.each(LEVELS, (value, name) => {
      if (Object.prototype.hasOwnProperty.call(LEVELS, name)) {
        this[name] = LEVELS[name].log;
      }
    });
  }
}

export default Logger;
