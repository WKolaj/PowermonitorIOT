const CalculationElement = require("./CalculationElement");

class SumElement extends CalculationElement {
  /**
   * Class representing calculation element for calculating sum of variables
   * @param {object} device device associated with element
   */
  constructor(device) {
    super(device);
    this._variables = {};
    this._sumValue = 0;
  }

  /**
   * Method for initializing element according to payload
   * @param {object} payload Initial payload of sum element
   */
  async init(payload) {
    await super.init(payload);

    if (payload.variables) {
      for (let variableObject of payload.variables) {
        let variableId = variableObject.id;
        let factor = variableObject.factor;
        let variable = this.Device.Variables[variableId];

        //Adding variable only if exists
        if (variable) {
          this.addVariable(variable, factor);
        }
      }
    }
  }

  /**
   * @description All variables associated with sum element
   */
  get Variables() {
    return this._variables;
  }

  /**
   * @description Method fo adding new variable to sum element
   * @param {object} variable variable to add
   * @param {number} factor factor of variable
   */
  addVariable(variable, factor) {
    if (!variable) throw new Error("variable should not be empty!");
    if (!factor) throw new Error("factor should not be empty!");
    this.Variables[variable.Id] = { variable: variable, factor: factor };
    return variable;
  }

  /**
   * @description Method for removing variable from
   * @param {number} variableId variable id to remove
   */
  removeVariable(variableId) {
    if (!variableId in this.Variables)
      throw new Error(
        `There is no variable of id: ${variableId} in element: ${this.Id}`
      );
    let variableToDelete = this.Variables[variableId];
    delete this.Variables[variableId];

    return variableToDelete.variable;
  }

  /**
   * @description Method for calculating sum of all variables and setting it to Value
   */
  _calculateSum() {
    let sumValue = 0;
    let variables = Object.values(this.Variables);

    for (let variable of variables) {
      let value = variable.variable.Value;
      let factor = variable.factor;

      sumValue += value * factor;
    }

    this.Value = sumValue;
    return sumValue;
  }

  /**
   * @description Method for getting value of calculation element
   */
  _getValue() {
    return this._sumValue;
  }

  /**
   * @description Method for setting value of calculation element
   * @param {number} newValue new value of calculation element
   */
  _setValue(newValue) {
    this._sumValue = newValue;
  }

  /**
   * @description Method for generating type name that represents sum element name
   */
  _getTypeName() {
    return "sumElement";
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
    return this._calculateSum();
  }

  /**
   * Method invoked on every refreshing action despite first
   * @param {number} lastTickNumber tick number of last refreshing action
   * @param {number} tickNumber tick number of actual refreshing action
   */
  async _onRefresh(lastTickNumber, tickNumber) {
    return this._calculateSum();
  }

  /**
   * @description Method for generation payload that represents sumElement
   */
  _generatePayload() {
    let payloadToReturn = super._generatePayload();

    payloadToReturn.variables = [];

    for (let variableObject of Object.values(this.Variables)) {
      let id = variableObject.variable.Id;
      let factor = variableObject.factor;

      payloadToReturn.variables.push({ id: id, factor: factor });
    }

    return payloadToReturn;
  }
}

module.exports = SumElement;
