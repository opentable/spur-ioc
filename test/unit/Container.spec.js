const Injector = require('../../src/Injector');

describe('injector - Container Management', function () {
  beforeEach(() => {
    this.injector = Injector.create();
  });

  it('addResolvableDependency', () => {
    this.injector.addResolvableDependency('foo', (bar) => {});
    const dep = this.injector.getDependency('foo');
    expect(dep.dependencies).toEqual(['bar']);
    expect(dep.name).toBe('foo');
    this.injector.addResolvableDependency('foo', (bar) => { console.debug(bar); });
  });

  it('inject', () => {

    this.injector.addResolvableDependency('foo', (bar, punct) => {
      return `${bar} world${punct}`;
    });

    this.injector.addResolvableDependency('bar', (error) => {
      return 'hi';
    });

    this.injector.addResolvableDependency('error', (error1) => {
      return {};
    });

    this.injector.addResolvableDependency('error1', (error2) => {
      return {};
    })
    .addResolvableDependency('error2', (error3) => { return {}; });

    this.injector.addResolvableDependency('error3', (exception, cyclic, missing) => {
      return {};
    });

    this.injector.addResolvableDependency('exception', () => {
      throw new Error('Oh no');
    });

    this.injector.addResolvableDependency('cyclic', (error) => {
      return {};
    });

    this.injector.addResolvableDependency('missing', (nothing, $injector) => {
      return {};
    });

    this.injector.addDependency('punct', '!');

    expect(() => this.injector.inject((foo) => {
      console.debug(foo);
    }))
    .toThrow('Resolver encountered errors');
  });

  describe('ignored dependencies', () => {
    const initialDep = () => {
      return 'initial';
    };

    const ignoredDep = () => {
      throw new Error('this should not be called');
    };
    ignoredDep.spurIocIgnore = true;

    const replacementDep = () => {
      return 'updated';
    };

    it('ignores registered dependencies which have spurIocIgnore=true', () => {
      this.injector.addDependency('a', initialDep);
      this.injector.addDependency('a', ignoredDep);

      const dep = this.injector.getDependency('a');
      expect(dep.name).toEqual('a');
      expect(dep.instance).toEqual(initialDep);
    });

    it('overrides registered dependencies which have spurIocIgnore=false', () => {
      this.injector.addDependency('a', initialDep);
      this.injector.addDependency('a', replacementDep);

      const dep = this.injector.getDependency('a');
      expect(dep.name).toBe('a');
      expect(dep.instance).toEqual(replacementDep);
    });
  });
});
