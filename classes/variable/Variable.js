const EventEmitter = require("events");
const Sampler = require("../sampler/Sampler");

class Variable {
  /**
   * @description Base class representing Variable
   * @param {object} device device associated with variable
   * @param {string} name variable name
   */
  constructor(device, name) {
    if (!device) throw new Error("Variable device cannot be empty");
    if (!name) throw new Error("Variable name cannot be empty");

    this._device = device;
    this._name = name;
    this._events = new EventEmitter();
    this._tickId = Sampler.convertTimeSampleToTickId(1);
  }

  get TickId() {
    return this._tickId;
  }

  set TimeSample(value) {
    this._tickId = Sampler.convertTimeSampleToTickId(value);
  }

  get TimeSample() {
    return Sampler.convertTickIdToTimeSample(this._tickId);
  }

  /**
   * @description Events associated with variable
   */
  get Events() {
    return this._events;
  }

  /**
   * @description Device associated with variable
   */
  get Device() {
    return this._device;
  }

  /**
   * @description Variable name
   */
  get Name() {
    return this._name;
  }

  /**
   * @description Variable value
   */
  get Value() {
    //_getValue - should be override in child classes
    return this._getValue();
  }

  /**
   * @description Variable value
   */
  set Value(newValue) {
    //_setValue - should be override in child classes
    this._setValue(newValue);
    this._emitValueChange(newValue);
  }

  /**
   * @description Private method to emit ValueChange event
   * @param {object} newValue new value
   */
  _emitValueChange(newValue) {
    this.Events.emit("ValueChanged", [this, newValue]);
  }
}

module.exports = Variable;
