const FunctionArgumentsParser = require('../../src/FunctionArgumentsParser');

describe('FunctionArgumentsParser', () => {

  const expectFunctionArgs = (fn, expected) => {
    const result = FunctionArgumentsParser.parse(fn);
    expect(result).to.deep.equal(expected);
  };

  describe('Function args', () => {

    it('in a single line', () => {
      const fn = function (dep1, dep2, dep3) { return dep1; };
      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

    it('with no arguments', () => {
      const fn = function () {
      };

      expectFunctionArgs(fn, []);
    });

    it('with only one argument', () => {
      const fn = function (dep1) {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1']);
    });

    it('with space after function', () => {
      const fn = function (dep1, dep2, dep3) {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

    it('with tab/multiple spaces after function', () => {
      const fn = function   (dep1, dep2, dep3) {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

    it('with space after function', () => {
      const fn = function (dep1, dep2, dep3) {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

    it('with new lines between arguements', () => {
      const fn = function (dep1,
        dep2,
        dep3) {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

    it('with no space between arguements', () => {
      const fn = function(dep1,dep2,dep3) {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

  });

  describe('Arrow function args', () => {

    it('in a single line', () => {
      const fn = (dep1, dep2, dep3) => { return dep1; };
      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

    it('with no arguments', () => {
      const fn = () => {};
      expectFunctionArgs(fn, []);
    });

    it('with only one argument', () => {
      const fn = (dep1) => {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1']);
    });

    it('with space after function', () => {
      const fn = (dep1, dep2, dep3) => {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

    it('with tab/multiple spaces after function', () => {
      const fn = (dep1, dep2, dep3)     => {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

    it('with space after function', () => {
      const fn = (dep1, dep2, dep3) => {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

    it('with new lines between arguements', () => {
      const fn = (dep1,
        dep2,
        dep3) => {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

    it('with no space between arguements', () => {
      const fn = (dep1,dep2,dep3)=> {
        return dep1;
      };

      expectFunctionArgs(fn, ['dep1', 'dep2', 'dep3']);
    });

  });

});
