import _ from 'lodash';

const rnewline = /\n/g;
const rat = /_at_/g;
const rfunction = /function\s+\w*\s*\((.*?)\)/;
const rcomma = /\s*,\s*/;

class Util {
  parseDependencies(fn) {
    const params = fn.toString()
      .replace(rnewline, ' ')
      .replace(rat, '')
      .match(rfunction)[1].split(rcomma);
    return _.compact(_.map(params, p => p.trim()));
  }
}

export default new Util();
