const Injector = require('../../src/Injector');

describe('injector - Container Management', () => {
  beforeEach(function () {
    this.injector = Injector.create();
  });

  it('should exist', function () {
    expect(Injector).to.exist;
    expect(this.injector).to.exist;
  });

  it('addResolvableDependency', function () {
    this.injector.addResolvableDependency('foo', function (bar) {});
    const dep = this.injector.getDependency('foo');
    expect(dep.dependencies).to.deep.equal(['bar']);
    expect(dep.name).to.equal('foo');
    this.injector.addResolvableDependency('foo', function (bar) { console.log(bar); });
  });

  it('inject', function () {

    this.injector.addResolvableDependency('foo', function (bar, punct, _) {
      return `${bar} world${punct}`;
    });

    this.injector.addResolvableDependency('bar', function (error) {
      return 'hi';
    });

    this.injector.addResolvableDependency('error', function (error1) {
      return {};
    });

    this.injector.addResolvableDependency('error1', function (error2) {
      return {};
    })
    .addResolvableDependency('error2', function (error3) { return {}; });

    this.injector.addResolvableDependency('error3', function (exception, cyclic, missing) {
      return {};
    });

    this.injector.addResolvableDependency('exception', function () {
      throw new Error('Oh no');
    });

    this.injector.addResolvableDependency('cyclic', function (error) {
      return {};
    });

    this.injector.addResolvableDependency('missing', function (nothing, $injector) {
      return {};
    });

    this.injector.addDependency('punct', '!');

    expect(() => this.injector.inject(function (foo) {
      console.log(foo);
    }))
    .to.throw('Resolver encountered errors');
  });

  describe('ignored dependencies', () => {
    const initialDep = function () {
      return 'initial';
    };

    const ignoredDep = function() {
      throw new Error('this should not be called');
      return 'ignored';
    };
    ignoredDep.spurIocIgnore = true;

    const replacementDep = function () {
      return 'updated';
    };

    it('ignores registered dependencies which have spurIocIgnore=true', function () {
      this.injector.addDependency('a', initialDep);
      this.injector.addDependency('a', ignoredDep);

      const dep = this.injector.getDependency('a');
      expect(dep.name).to.deep.equal('a');
      expect(dep.instance).to.be.eq(initialDep);
    });

    it('overrides registered dependencies which have spurIocIgnore=false', function() {
      this.injector.addDependency('a', initialDep);
      this.injector.addDependency('a', replacementDep);

      const dep = this.injector.getDependency('a');
      expect(dep.name).to.equal('a');
      expect(dep.instance).to.be.eq(replacementDep);
    });
  });
});
