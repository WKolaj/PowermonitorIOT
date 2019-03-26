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
    this.Variables[variable.Id] = variable;
  }

  /**
   * @description Removing variable from device
   * @param {string} id device id
   */
  removeVariable(id) {
    if (!(id in this.Variables))
      throw Error(`There is no such variable in device - variable id:${id}`);

    delete this.Variables[id];
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
   * @description Getting variable by device id
   * @param {string} id device id
   */
  getVariable(id) {
    return this.Variables[id];
  }

  /**
   * @description Refreshing variables based on tickNumber - should be override in child classes
   */
  refresh(tickNumber) {}
}

module.exports = Device;
