const CalculationElement = require("./CalculationElement");

class SumElement extends CalculationElement {
  constructor(device) {
    super(device);
    this._plusVariables = {};
    this._minusVariables = {};
    this._sumValue = 0;
  }

  get PlusVariables() {
    return this._plusVariables;
  }

  get MinusVariables() {
    return this._minusVariables;
  }

  addPlusVariable(variable, factor) {
    this.PlusVariables[variable.Id] = { variable: variable, factor: factor };
  }

  removePlusVariable(variableId) {
    delete this.PlusVariables[variableId];
  }

  addMinusVariable(variable, factor) {
    this.MinusVariables[variable.Id] = { variable: variable, factor: factor };
  }

  removeMinusVariable(variableId) {
    delete this.MinusVariables[variableId];
  }

  _calculateSum() {
    let sumValue = 0;
    let plusVariables = Object.values(this.PlusVariables);
    let minusVariables = Object.values(this.MinusVariables);

    for (let plusVariable of plusVariables) {
      let value = plusVariable.variable.Value;
      let factor = plusVariable.factor;

      sumValue += value * factor;
    }

    for (let minusVariable of minusVariables) {
      let value = minusVariable.variable.Value;
      let factor = minusVariable.factor;

      sumValue -= value * factor;
    }

    this.Value = sumValue;
  }

  _getValue() {
    return this._sumValue;
  }

  _setValue(newValue) {
    this._sumValue = newValue;
  }

  _getTypeName() {
    return "sumElement";
  }

  _getValueType() {
    return "float";
  }

  async _onFirstRefresh(tickNumber) {
    this._calculateSum();
  }

  async _onRefresh(lastTickNumber, tickNumber) {
    this._calculateSum();
    return this.Value;
  }

  _generatePayload() {
    let payloadToReturn = super._generatePayload();

    payloadToReturn.plusVariables = [];

    for (let variableObject of Object.values(this.PlusVariables)) {
      let id = variableObject.variable.Id;
      let factor = variableObject.factor;

      payloadToReturn.plusVariables.push({ id: id, factor: factor });
    }

    payloadToReturn.minusVariables = [];

    for (let variableObject of Object.values(this.MinusVariables)) {
      let id = variableObject.variable.Id;
      let factor = variableObject.factor;

      payloadToReturn.minusVariables.push({ id: id, factor: factor });
    }

    return payloadToReturn;
  }

  async init(payload) {
    super.init(payload);

    if (payload.plusVariables) {
      for (let variableObject of payload.plusVariables) {
        let variableId = variableObject.id;
        let factor = variableObject.factor;
        let variable = this.Device.Variables[variableId];

        //Adding variable only if exists
        if (variable) {
          this.addPlusVariable(variable, factor);
        }
      }
    }

    if (payload.minusVariables) {
      for (let variableObject of payload.minusVariables) {
        let variableId = variableObject.id;
        let factor = variableObject.factor;
        let variable = this.Device.Variables[variableId];

        //Adding variable only if exists
        if (variable) {
          this.addMinusVariable(variable, factor);
        }
      }
    }
  }
}

module.exports = SumElement;
