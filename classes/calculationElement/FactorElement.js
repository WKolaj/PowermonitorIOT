const CalculationElement = require("./CalculationElement");

class FactorElement extends CalculationElement {
  /**
   * Class representing calculation element for calculating sum of variables
   * @param {object} device device associated with element
   */
  constructor(device) {
    super(device);
    this._variable = null;
    this._factor = null;
    this._value = 0;
  }

  /**
   * Method for initializing element according to payload
   * @param {object} payload Initial payload of sum element
   */
  async init(payload) {
    await super.init(payload);

    if (!payload.variableId)
      throw new Error("variable is not defined in payload");

    if (!payload.factor) throw new Error("factor is not defined in payload");

    let variable = this.Device.Variables[payload.variableId];

    if (!variable)
      throw new Error(
        `variable of id ${payload.variableId} does not exists in device ${
          this.Device.Id
        }`
      );

    this._variable = variable;
    this._factor = payload.factor;
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
    this._value = this.Factor * this.Variable.Value;
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
    return "factorElement";
  }

  /**
   * @description Method for generating type name that represents sum element type
   */
  _getValueType() {
    return "float";
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
    payloadToReturn.factor = this.Factor;

    return payloadToReturn;
  }
}

module.exports = FactorElement;
