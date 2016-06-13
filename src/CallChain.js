import chalk from 'chalk';

class CallChain {
  constructor(name, parent) {
    this.name = name;
    this.parent = parent;
  }

  static create(name) {
    return new CallChain(name);
  }

  add(name) {
    return new CallChain(name, this);
  }

  hasParentName(name) {
    return this.name === name || (this.parent && this.parent.hasParentName(name));
  }

  hasCyclic() {
    const parent = this.parent;
    if (parent) {
      return parent.hasParentName(this.name);
    }
    return false;
  }

  getHighlightedName() {
    return chalk.yellow(this.name);
  }

  getPath(highlight) {
    let path = '';
    if (this.parent) {
      path = `${this.parent.getPath()} -> `;
    }
    if (highlight) {
      path += this.getHighlightedName();
    } else {
      path += this.name;
    }
    return path;
  }
}

export default CallChain;
