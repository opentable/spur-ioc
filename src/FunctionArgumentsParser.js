const _map = require('lodash.map');
const _compact = require('lodash.compact');

const rnewline = /\n/g;
const rat = /_at_/g;
const rfunction = /function\s+\w*\s*\((.*?)\)/;
const rcomma = /\s*,\s*/;

class Util {

  parse(fn) {
    const params = fn.toString()
      .replace(rnewline, ' ')
      .replace(rat, '')
      .match(rfunction)[1].split(rcomma);

    return _compact(_map(params, (p) => p.trim()));
  }

}

module.exports = new Util();
