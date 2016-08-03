/*
Spot checking that our dependencies are
still present.
*/

import _ from 'lodash';
import StackFilter from 'stack-filter';

describe('Integration', () => {
  describe('Lodash Dependencies', () => {
    it('_.isArray exists', () => {
      expect(_.isArray).to.exist;
    });

    it('_.keys exists', () => {
      expect(_.keys).to.exist;
    });

    it('_.isFunction exists', () => {
      expect(_.isFunction).to.exist;
    });

    it('_.isObject exists', () => {
      expect(_.isObject).to.exist;
    });

    it('_.each exists', () => {
      expect(_.each).to.exist;
    });

    it('_.compact exists', () => {
      expect(_.compact).to.exist;
    });

    it('_.map exists', () => {
      expect(_.map).to.exist;
    });
  });

  describe('StackFilter Dependencies', () => {
    it('StackFilter.configure exists', () => {
      expect(StackFilter.configure).to.exist;
    });

    it('StackFilter.filter exists', () => {
      expect(StackFilter.filter).to.exist;
    });
  });
});
