class ModbusDriverAction {
  constructor(name, func) {
    this._name = name;
    this._func = func;
  }

  get Function() {
    return this._func;
  }

  get Name() {
    return this._name;
  }
}

module.exports = ModbusDriverAction;
