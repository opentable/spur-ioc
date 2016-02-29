import chalk from "chalk"

class CallChain {
  constructor(name1, parent) {
    this.name = name1
    this.parent = parent
  }

  static create(name) {
    return new CallChain(name)
  }

  add(name) {
    return new CallChain(name, this)
  }

  hasParentName(name) {
    return this.name === name || (this.parent && this.parent.hasParentName(name))
  }

  hasCyclic() {
    const parent = this.parent
    if (parent) {
      return parent.hasParentName(this.name)
    }
  }

  getHighlightedName() {
    return chalk.yellow(this.name)
  }

  getPath(highlight) {
    let path = ""
    if (this.parent) {
      path = `${this.parent.getPath()} -> `
    }
    return (path += (highlight ? this.getHighlightedName() : this.name))
  }
}

export default CallChain
