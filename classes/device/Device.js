class Device {
  /**
   * @description Base class representing Device
   * @param {string} name device name
   */
  constructor(name) {
    this._name = name;
    this._variables = {};
  }

  /**
   * @description Name describing device
   */
  get Name() {
    return this._name;
  }

  /**
   * @description Variables associated with device
   */
  get Variables() {
    return this._variables;
  }

  /**
   * @description Adding variable to device
   */
  addVariable(variable) {
    this.Variables[variable.Name] = variable;
  }

  /**
   * @description Removing variable from device
   */
  removeVariable(variable) {
    if (!(variable.Name in this.Variables))
      throw Error(
        `There is no such variable in device - variable name:${variable.Name}`
      );

    delete this.Variables[variable.Name];
  }

  static divideVariablesByTickId(variables) {
    let variablesToReturn = {};

    for (let variable of variables) {
      if (!(variable.TickId in variablesToReturn))
        variablesToReturn[variable.TickId] = [];

      variablesToReturn[variable.TickId].push(variable);
    }

    return variablesToReturn;
  }

  /**
   * @description Refreshing variables based on tickNumber - should be override in child classes
   */
  refresh(tickNumber) {}
}

module.exports = Device;
