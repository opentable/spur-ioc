module.exports = {
  hasOwnProp(source, propertyName) {
    return Object.prototype.hasOwnProperty.call(source, propertyName);
  },

  isFunction(value) {
    return typeof value === 'function';
  },

  isObject(value) {
    const type = typeof value;
    return value != null && (type === 'object' || type === 'function');
  }
};
