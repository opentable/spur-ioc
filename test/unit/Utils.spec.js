const Utils = require('../../src/Utils');

describe('Utils', function () {
  describe('hasOwnProp', () => {
    it('should return true if the source object has the specified property', () => {
      const source = { name: 'John', age: 30 };
      const propertyName = 'name';
      const result = Utils.hasOwnProp(source, propertyName);
      expect(result).toBe(true);
    });

    it('should return false if the source object does not have the specified property', () => {
      const source = { name: 'John', age: 30 };
      const propertyName = 'address';
      const result = Utils.hasOwnProp(source, propertyName);
      expect(result).toBe(false);
    });
  });

  describe('isFunction', () => {
    it('should return true if the value is a function', () => {
      const value = () => {};
      const result = Utils.isFunction(value);
      expect(result).toBe(true);
    });

    it('should return false if the value is not a function', () => {
      const value = 'Hello, World!';
      const result = Utils.isFunction(value);
      expect(result).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should return true if the value is an object', () => {
      const value = { name: 'John', age: 30 };
      const result = Utils.isObject(value);
      expect(result).toBe(true);
    });

    it('should return false if the value is not an object', () => {
      const value = 'Hello, World!';
      const result = Utils.isObject(value);
      expect(result).toBe(false);
    });
  });

});
