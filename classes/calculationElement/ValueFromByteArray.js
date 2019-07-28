const CalculationElement = require("./CalculationElement");
const { exists } = require("../../utilities/utilities");

class ValueFromByteArrayElement extends CalculationElement {
  /**
   * Class representing calculation element for calculating sum of variables
   * @param {object} device device associated with element
   */
  constructor(device) {
    super(device);
    this._variable = null;
    this._byteNumber = 0;
    this._bitNumber = 0;
    this._length = 1;
    this._value = 0;
  }

  static getPossibleVariableTypes() {
    return ["mbByteArray"];
  }
  get ByteNumber() {
    return this._byteNumber;
  }

  get BitNumber() {
    return this._bitNumber;
  }

  get Length() {
    return this._length;
  }

  /**
   * Method for initializing element according to payload
   * @param {object} payload Initial payload of sum element
   */
  async init(payload) {
    await super.init(payload);

    if (!exists(payload.variableId))
      throw new Error("variable is not defined in payload");

    if (!exists(payload.bitNumber))
      throw new Error("bitNumber is not defined in payload");

    if (!exists(payload.byteNumber))
      throw new Error("byteNumber is not defined in payload");

    let variable = this.Device.Variables[payload.variableId];

    if (!exists(variable))
      throw new Error(
        `variable of id ${payload.variableId} does not exists in device ${
          this.Device.Id
        }`
      );

    if (
      !ValueFromByteArrayElement.getPossibleVariableTypes().some(
        a => a === variable.Type
      )
    )
      throw new Error(
        `variable type ${
          variable.Type
        } does not fit for bitFromByteArrayElement`
      );

    this._variable = variable;
    this._bitNumber = payload.bitNumber;
    this._byteNumber = payload.byteNumber;
    if (exists(payload.length)) this._length = payload.length;
  }

  /**
   * @description Variable associated with element
   */
  get Variable() {
    return this._variable;
  }

  /**
   * @description Factor associated with element
   */
  get Factor() {
    return this._factor;
  }

  /**
   * @description Method for calulcating new value
   */
  _calculateValue() {
    if (!exists(this.Variable)) {
      this._value = 0;
      return this._value;
    }

    let newValue = 0;

    for (let i = 0; i < this.Length; i++) {
      let value = this.Variable.getBit(this.ByteNumber, this.BitNumber + i);
      if (value) newValue += Math.pow(2, i);
    }

    this._value = newValue;
    return this._value;
  }

  /**
   * @description Method for getting value of calculation element
   */
  _getValue() {
    return this._value;
  }

  /**
   * @description Method for setting value of calculation element
   * @param {number} newValue new value of calculation element
   */
  _setValue(newValue) {
    this._value = newValue;
  }

  /**
   * @description Method for generating type name that represents factor element name
   */
  _getTypeName() {
    return "valueFromByteArray";
  }

  /**
   * @description Method for generating type name that represents sum element type
   */
  _getValueType() {
    return "integer";
  }

  /**
   * Method invoked on first refreshing
   * @param {number} tickNumber tickNumber of refeshing action
   */
  async _onFirstRefresh(tickNumber) {
    return this._calculateValue();
  }

  /**
   * Method invoked on every refreshing action despite first
   * @param {number} lastTickNumber tick number of last refreshing action
   * @param {number} tickNumber tick number of actual refreshing action
   */
  async _onRefresh(lastTickNumber, tickNumber) {
    return this._calculateValue();
  }

  /**
   * @description Method for generating payload that represents factorElement
   */
  _generatePayload() {
    let payloadToReturn = super._generatePayload();

    payloadToReturn.variableId = this.Variable.Id;
    payloadToReturn.bitNumber = this.BitNumber;
    payloadToReturn.byteNumber = this.ByteNumber;
    payloadToReturn.length = this.Length;

    return payloadToReturn;
  }
}

module.exports = ValueFromByteArrayElement;
