const CalculationElement = require("./CalculationElement");

class AverageElement extends CalculationElement {
  /**
   * Class representing calculation element for calculating sum of variables
   * @param {object} device device associated with element
   */
  constructor(device) {
    super(device);
    this._variable = null;
    this._factor = null;
    this._minTickId = null;
    this._maxTickId = null;
    this._value = 0;
    this._calculationInterval = 1;
    this._values = [];
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

    if (!payload.calculationInterval)
      throw new Error("calculationInterval is not defined in payload");

    let variable = this.Device.Variables[payload.variableId];

    if (!variable)
      throw new Error(
        `variable of id ${payload.variableId} does not exists in device ${
          this.Device.Id
        }`
      );

    this._variable = variable;
    this._factor = payload.factor;
    this._calculationInterval = payload.calculationInterval;
  }

  /**
   * @description Calculation interval associated with element
   */
  get CalculationInterval() {
    return this._calculationInterval;
  }

  /**
   * @description Variable associated with element
   */
  get Variable() {
    return this._variable;
  }

  /**
   * @description Variable associated with element
   */
  get Values() {
    return this._values;
  }

  /**
   * @description Factor associated with element
   */
  get Factor() {
    return this._factor;
  }

  /**
   * @description Minimal tick id of given period
   */
  get MinTickId() {
    return this._minTickId;
  }

  /**
   * @description Maximal tick id of given period
   */
  get MaxTickId() {
    return this._maxTickId;
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
    return "averageElement";
  }

  /**
   * @description Method for generating type name that represents sum element type
   */
  _getValueType() {
    return "float";
  }

  /**
   * @description Method for calculating minimum tick id of given interval
   * @param {number} tickId current tick id
   * @param {number} calculationInterval calculation interval of average element
   */
  static calculateMinTickId(tickId, calculationInterval) {
    if (calculationInterval <= 0) return tickId;
    return tickId - (tickId % calculationInterval);
  }

  /**
   * @description Method for calculating maximum tick id of given interval
   * @param {number} tickId current tick id
   * @param {number} calculationInterval calculation interval of average element
   */
  static calculateMaxTickId(tickId, calculationInterval) {
    if (calculationInterval <= 0) return tickId;
    return tickId - (tickId % calculationInterval) + calculationInterval;
  }

  /**
   * @description Method for resetting values
   */
  _resetValues() {
    this._values = [];
  }

  /**
   * @description Method for adding new value
   * @param {number} newValue new value to add
   * @param {number} tickId tickId of new value
   */
  _addValue(newValue, tickId) {
    if (newValue === null || newValue === undefined) {
      throw new Error("newValue cannot be empty!");
    }

    if (tickId === null || tickId === undefined) {
      throw new Error("tickId cannot be empty!");
    }

    let valueObject = {
      tickId: tickId,
      value: newValue
    };

    this.Values.push(valueObject);
  }

  /**
   * @description Method for calculation average of values
   * @param {number} tickId tickId of ending Period Time
   */
  _getAverage(tickId) {
    if (this.Values.length === 0) {
      return 0;
    }

    let valueSum = 0;
    let tickSum = 0;

    for (let i = 0; i < this.Values.length; i++) {
      let value = this.Values[i].value;

      let tickDelta = 0;
      //First time - assuming first value was valid for sampleTime
      if (i === this.Values.length - 1) {
        tickDelta = tickId - this.Values[i].tickId;
      } else {
        tickDelta = this.Values[i + 1].tickId - this.Values[i].tickId;
      }

      valueSum += value * this.Factor * tickDelta;
      tickSum += tickDelta;
    }

    return valueSum / tickSum;
  }

  /**
   * @description Method for refreshing value
   */
  _refreshAverage() {
    //MaxTickId - calculation of average should be performed based on MaxTickId of current period
    this.Value = this._getAverage(this.MaxTickId);
    return this.Value;
  }

  /**
   * @description Method for checking if new calculation period should start
   * @param {number} tickId tickId to check
   */
  _shouldStartNewCalculationPeriod(tickId) {
    return tickId >= this.MaxTickId || tickId < this.MinTickId;
  }

  /**
   * @description Method for closing current calculation period
   */
  _endCurrentCalculationPeriod() {
    let valueToReturn = this._refreshAverage();
    this._resetValues();
    return valueToReturn;
  }

  /**
   * @description Method for setting new calculation period in average element
   * @param {number} tickId tickIdOfNewPeriod
   * @param {number} value new value
   */
  _setNewCalculationPeriod(tickId, value) {
    this._minTickId = AverageElement.calculateMinTickId(
      tickId,
      this.CalculationInterval
    );
    this._maxTickId = AverageElement.calculateMaxTickId(
      tickId,
      this.CalculationInterval
    );

    this._resetValues();

    //First value should begin in minTickId
    this._addValue(value, this.MinTickId);
  }

  /**
   * Method invoked on first refreshing
   * @param {number} tickNumber tickNumber of refeshing action
   */
  async _onFirstRefresh(tickNumber) {
    this._setNewCalculationPeriod(tickNumber, this.Variable.Value);
  }

  /**
   * Method invoked on every refreshing action despite first
   * @param {number} lastTickNumber tick number of last refreshing action
   * @param {number} tickNumber tick number of actual refreshing action
   */
  async _onRefresh(lastTickNumber, tickNumber) {
    //Checking if new period should be started
    if (!this._shouldStartNewCalculationPeriod(tickNumber)) {
      this._addValue(this.Variable.Value, tickNumber);
      //returing new value only on complition of current period
      return null;
    }

    //In case new average period should be calculated
    let valueToReturn = this._endCurrentCalculationPeriod();
    this._setNewCalculationPeriod(tickNumber, this.Variable.Value);

    return valueToReturn;
  }

  /**
   * @description Method for generating payload that represents factorElement
   */
  _generatePayload() {
    let payloadToReturn = super._generatePayload();

    payloadToReturn.variableId = this.Variable.Id;
    payloadToReturn.factor = this.Factor;
    payloadToReturn.calculationInterval = this.CalculationInterval;

    return payloadToReturn;
  }
}

module.exports = AverageElement;
