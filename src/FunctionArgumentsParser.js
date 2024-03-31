const NEWLINE = /\n/g;
const AT = /_at_/g;
const ARROW_ARG = /^([^(]+?)=>/;
const FN_ARGS = /^[^(]*\(\s*([^)]*)\)/m;
const FN_ARG_SPLIT = /,/;
const FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

class FunctionArgumentsParser {

  parse(fn) {
    if (typeof fn !== 'function') {
      throw new Error('A valid function was no provided as a function wrapper.');
    }

    const args = [];
    const argsDeclaration = this.extractArgs(fn);

    argsDeclaration[1].split(FN_ARG_SPLIT).forEach(function (arg) {
      arg.replace(FN_ARG, function(name) {
        const cleanName = (name || '').trim();
        if (cleanName.length > 0) {
          args.push(cleanName);
        }
      });
    });

    return args;
  }

  extractArgs(fn) {
    const fnText = this.stringifyFn(fn)
      .replace(STRIP_COMMENTS, '')
      .replace(NEWLINE, ' ')
      .replace(AT, '');

    const args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
    return args;
  }

  stringifyFn(fn) {
    return Function.prototype.toString.call(fn);
  }

}

module.exports = new FunctionArgumentsParser();
