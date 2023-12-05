const Injector = require('../../src/Injector');
const DependencyResolver = require('../../src/DependencyResolver');

describe('Injector', function () {
  beforeEach(() => {
    this.injector = Injector.create('injector1');
  });

  it('inject', () => {
    this.injector.registerFolders(__dirname, ['../fixtures']);
    this.injector.inject((House) => {
      expect(House).toBe('House with Pitched Roof and Barn Doors and Double GlazedWindows and Long Garden');
    });
  });

  it('multi-injector', () => {
    this.injector1 = this.injector;
    this.injector2 = Injector.create('injector2');
    this.injector1.registerDependencies({
      a: 'a',
      b: 'b'
    });
    this.injector2.registerDependencies({
      a: 'a_updated',
      c: 'c'
    });

    this.injector1.merge(this.injector2).inject((a, b, c, $injector) => {
      expect([a, b, c]).toEqual(['a_updated', 'b', 'c']);
      expect($injector.getRegex(/./)).toEqual({
        a: 'a_updated',
        b: 'b',
        c: 'c'
      });
    });

    this.injector1.inject((a, b, c, $injector) => {
      expect([a, b, c]).toEqual(['a_updated', 'b', 'c']);
      expect($injector.getRegex(/./)).toEqual({
        a: 'a_updated',
        b: 'b',
        c: 'c'
      });
    });

    this.injector1.inject(($injector) => {
      expect($injector.getRegex(/ssd/)).toEqual({});
    });

    this.injector1.inject(($injector) => {
      expect($injector.getAll()).toEqual({
        a: 'a_updated',
        b: 'b',
        c: 'c'
      });
    });

    this.injector1.inject(($injector) => {
      expect($injector.getMap(['a', 'b'])).toEqual({
        a: 'a_updated',
        b: 'b'
      });
    });

    this.injector1.inject(($injector) => {
      expect($injector.getMap(['a', 'b'])).toEqual({
        a: 'a_updated',
        b: 'b'
      });
    });

    DependencyResolver.prototype.throwError = () => {};

    this.injector1.inject(($injector) => {
      expect($injector.get('missing')).to.equal(null);
    });

    const error = this.injector1.resolver.errors[0];
    console.log(error);

    expect(error.error).toBe('Missing Dependency');
    expect(error.callChain.getPath()).toBe('$$injector1 -> $injector -> missing');

    this.injector1.addResolvableDependency('a', (b) => {});
    this.injector1.addResolvableDependency('b', (a) => {});
    this.injector1.inject(($injector) => { $injector.get('a'); });

    const cyclicError = this.injector1.resolver.errors[0];
    expect(cyclicError.error).toBe('Cyclic Dependency');
    expect(cyclicError.callChain.getPath()).toBe('$$injector1 -> $injector -> a -> b -> a');
  });

  it('dont allow async use of $injector', (done) => {
    this.injector.registerDependencies({
      _: 'lodash',
      chai: 'chai'
    });

    this.injector.addResolvableDependency('foo', ($injector) => {
      setTimeout(() => {
        expect(() => $injector.get('chai')).toThrow('cannot use $injector.get(\'chai\') asynchronously');
        expect(() => $injector.getRegex(/.+/)).toThrow('cannot use $injector.getRegex(/.+/) asynchronously');
        done();
      }, 0);
    });

    this.injector.inject((_, chai, $injector, foo) => {});
  });

  describe('ignored dependencies', () => {
    const initialDep = () => {
      return 'initial';
    };

    const ignoredDep = () => {
      throw new Error('this should not be called');
      return 'ignored';
    };
    ignoredDep.spurIocIgnore = true;

    const replacementDep = () => {
      return 'updated';
    };

    describe('spurIocIgnore=true', () => {
      it('ignores registered dependencies which have spurIocIgnore=true', () => {
        this.injector.registerDependencies({ a: initialDep, });
        this.injector.registerDependencies({ a: ignoredDep });

        this.injector.inject((a) => {
          expect(a).toEqual(initialDep);
          expect(a()).toBe('initial');
        });
      });

      it('ignores registered folder dependencies which have spurIocIgnore=true', () => {
        this.injector.registerFolders(__dirname, ['../fixtures']);

        this.injector.inject((Wall) => {
          expect(Wall).toBe('Wall override');
        });
      });

      it('ignores resolvable dependencies which have spurIocIgnore=true', () => {
        this.injector.addResolvableDependency('b', initialDep);
        this.injector.addResolvableDependency('b', ignoredDep);

        this.injector.inject(($injector) => {
          expect($injector.get('b')).toBe('initial');
        });
      });
    });

    describe('explicitly marked not to be ignored', () => {
      it('overrides registered dependencies which have spurIocIgnore=false', () => {
        this.injector.registerDependencies({ a: initialDep, });
        this.injector.registerDependencies({ a: replacementDep });

        this.injector.inject((a) => {
          expect(a).to.equal(replacementDep);
          expect(a()).to.be.eq('updated');
        });
      });

      it('overrides registered folder dependencies which have spurIocIgnore=false', () => {
        this.injector.registerFolders(__dirname, ['../fixtures']);

        this.injector.inject((Wall) => {
          expect(Wall).toBe('Wall override');
        });
      });

      it('overrides resolvable dependencies which have spurIocIgnore=false', () => {
        this.injector.addResolvableDependency('b', initialDep);
        this.injector.addResolvableDependency('b', replacementDep);

        this.injector.inject(($injector) => {
          expect($injector.get('b')).toBe('updated');
        });
      });
    });
  });

  describe('expose and link', () => {
    beforeEach(() => {
      this.injector.registerDependencies({
        c: 'c'
      });

      this.injector2 = Injector.create('injector2');
      this.injector2.registerDependencies({
        a: 'a',
        b: 'b'
      });
    });

    it('expose - array', () => {
      this.injector2.expose(['a']);
      this.injector.link(this.injector2);
      this.injector.inject(($injector) => {
        expect($injector.getAll()).toEqual({
          c: 'c',
          a: 'a'
        });
      });
    });

    it('expose - regex', () => {
      this.injector2.expose(/b/);
      this.injector.link(this.injector2);
      this.injector.inject(($injector) => {
        expect($injector.getAll()).toEqual({
          c: 'c',
          b: 'b'
        });
      });
    });

    it('exposeAll', () => {
      this.injector2.exposeAll();
      this.injector.link(this.injector2);
      this.injector.inject(($injector) => {
        expect($injector.getAll()).toEqual({
          a: 'a',
          c: 'c',
          b: 'b'
        });
      });
    });

    it('expose overwrite', () => {
      this.injector.registerDependencies({
        a: 'A'
      });
      this.injector2.exposeAll();
      this.injector.link(this.injector2);
      this.injector.inject(($injector) => {
        expect($injector.getAll()).toEqual({
          c: 'c',
          a: 'a',
          b: 'b'
        });
      });
    });
  });
});
