const CalculationElement = require("./CalculationElement");

class IncreaseElement extends CalculationElement {
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
    this._minValue = null;
    this._maxValue = null;
    this._overflow = null;
    this._calculationActive = false;
    this._startTime = null;
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

    if (!payload.overflow)
      throw new Error("overflow is not defined in payload");

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
    this._overflow = payload.overflow;
  }

  /**
   * @description Calculation interval associated with element
   */
  get CalculationInterval() {
    return this._calculationInterval;
  }

  /**
   * @description Is calculation procedure active
   */
  get CalculationActive() {
    return this._calculationActive;
  }

  /**
   * @description Overflow of counter
   */
  get Overflow() {
    return this._overflow;
  }

  /**
   * @description Variable associated with element
   */
  get Variable() {
    return this._variable;
  }

  /**
   * @description Value on the end of the period
   */
  get MaxValue() {
    return this._maxValue;
  }

  /**
   * @description Value on the begining of the period
   */
  get MinValue() {
    return this._minValue;
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
   * @description Factor associated with element
   */
  get Factor() {
    return this._factor;
  }

  /**
   * @description Time when calculation mechanism should start
   */
  get StartTime() {
    return this._startTime;
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
    return "increaseElement";
  }

  /**
   * @description Method for generating type name that represents increase element type
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
   * @description Method for calculation increase of variable
   */
  _calculateIncrease() {
    //If counter overflow was reached
    if (this.MaxValue < this.MinValue) {
      return this.Factor * (this.Overflow - this.MinValue + this.MaxValue);
    }
    return this.Factor * (this.MaxValue - this.MinValue);
  }

  /**
   * @description Method for refreshing value
   */
  _refreshIncrease() {
    //MaxTickId - calculation of average should be performed based on MaxTickId of current period
    this.Value = this._calculateIncrease();
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
   * @param {number} value value on the end of period
   */
  _endCurrentCalculationPeriod(value) {
    this._maxValue = value;
    return this._refreshIncrease();
  }

  /**
   * @description Method for setting new calculation period in average element
   * @param {number} tickId tickIdOfNewPeriod
   * @param {number} value new value
   */
  _setNewCalculationPeriod(tickId, value) {
    this._minTickId = IncreaseElement.calculateMinTickId(
      tickId,
      this.CalculationInterval
    );
    this._maxTickId = IncreaseElement.calculateMaxTickId(
      tickId,
      this.CalculationInterval
    );

    this._minValue = value;
  }

  _startCalculation(tickId, value) {
    //Do not start calculation if it is already active
    if (this.CalculationActive) return;

    //Starting new period normally
    this._setNewCalculationPeriod(tickId, value);
  }

  _shouldStartCalculation(tickId) {
    return tickId >= this.StartTime;
  }

  _setStartTime(tickId) {
    this._startTime = IncreaseElement.calculateMaxTickId(
      tickId,
      this.CalculationInterval
    );
  }

  /**
   * Method invoked on first refreshing
   * @param {number} tickNumber tickNumber of refeshing action
   */
  async _onFirstRefresh(tickNumber) {
    this._setStartTime(tickNumber);
  }

  /**
   * Method invoked on every refreshing action despite first
   * @param {number} lastTickNumber tick number of last refreshing action
   * @param {number} tickNumber tick number of actual refreshing action
   */
  async _onRefresh(lastTickNumber, tickNumber) {
    if (this.CalculationActive) {
      //If calculation mechanism is started - perform normal actions

      //Checking if new period should be started
      if (this._shouldStartNewCalculationPeriod(tickNumber)) {
        //end current period and start new one
        this._endCurrentCalculationPeriod(this.Variable.Value);
        this._setNewCalculationPeriod(tickNumber, this.Variable.Value);
        return this.Value;
      }
    } else {
      //If calculation mechanism in not active - check if it should be active and than activate it - start ne calculation period
      if (this._shouldStartCalculation(tickNumber)) {
        this._setNewCalculationPeriod(tickNumber, this.Variable.Value);
        this._calculationActive = true;
      }
    }
  }

  /**
   * @description Method for generating payload that represents factorElement
   */
  _generatePayload() {
    let payloadToReturn = super._generatePayload();

    payloadToReturn.variableId = this.Variable.Id;
    payloadToReturn.factor = this.Factor;
    payloadToReturn.calculationInterval = this.CalculationInterval;
    payloadToReturn.overflow = this.Overflow;

    return payloadToReturn;
  }
}

module.exports = IncreaseElement;
