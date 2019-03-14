class Variable {
  constructor(name) {
    this._name = name;
  }

  get Name() {
    return this._name;
  }

  get Value() {
    //this._value - should be override in child classes
    return this._value;
  }
}

module.exports = Variable;
