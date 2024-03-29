const subject = require('../../src/FileFilterExpression');

describe('FileFilterExpression tests', function () {

  it('should match a js file path', () => {
    const path1 = 'src/some/path/FileFilterExpression.js';
    const path2 = 'src\\somepath\\FileFilterExpression.js';

    expect(subject.test(path1)).toBeTruthy();
    expect(subject.test(path2)).toBeTruthy();
  });

  it('should match a json file path', () => {
    const path1 = 'src/some/path/FileFilterExpression.json';
    const path2 = 'src\\somepath\\FileFilterExpression.json';

    expect(subject.test(path1)).toBeTruthy();
    expect(subject.test(path2)).toBeTruthy();
  });

  it('should match a ts file path', () => {
    const path1 = 'src/some/path/FileFilterExpression.ts';
    const path2 = 'src\\somepath\\FileFilterExpression.ts';

    expect(subject.test(path1)).toBeTruthy();
    expect(subject.test(path2)).toBeTruthy();
  });

  it('should match a d.ts file path', () => {
    const path1 = 'src/some/path/FileFilterExpression.d.ts';
    const path2 = 'src\\somepath\\FileFilterExpression.d.ts';

    expect(subject.test(path1)).toBeFalsy();
    expect(subject.test(path2)).toBeFalsy();
  });

  it('should not match partial matches', () => {
    const path1 = 'src/some/path/FileFilterExpression.js2';
    const path2 = 'src/some/path/FileFilterExpression.json2';
    const path3 = 'src/some/path/FileFilterExpression.ts2';

    expect(subject.test(path1)).toBeFalsy();
    expect(subject.test(path2)).toBeFalsy();
    expect(subject.test(path3)).toBeFalsy();
  });

});
