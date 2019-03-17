const EventEmitter = require("events");

class Variable {
  constructor(device, name) {
    if (!device) throw new Error("Variable device cannot be empty");
    if (!name) throw new Error("Variable name cannot be empty");

    this._device = device;
    this._name = name;
    this._events = new EventEmitter();
  }

  get Events() {
    return this._events;
  }

  get Device() {
    return this._device;
  }

  get Name() {
    return this._name;
  }

  get Value() {
    //_getValue - should be override in child classes
    return this._getValue();
  }

  set Value(newValue) {
    //_setValue - should be override in child classes
    this._setValue(newValue);
    this._emitValueChange(newValue);
  }

  _emitValueChange(newValue) {
    this.Events.emit("ValueChanged", [this, newValue]);
  }
}

module.exports = Variable;
