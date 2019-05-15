const MBDevice = require("../Modbus/MBDevice");
const Variable = require("../../variable/Variable");

class MBDeviceWithTemplate extends MBDevice {
  /**
   * @description Modbus device with template
   */
  constructor() {
    super();
  }

  /**
   * @description Method for getting variables schema - should be override in child classes
   */
  _getVariablesSchema() {
    throw new Error("Not implemented");
  }

  /**
   * @description Method for getting calculation elements - should be override in child classes
   * @param {object} variablesSchema generated schema of all variables
   */
  _getCalculationElementsSchema(variablesSchema) {
    throw new Error("Not implemented");
  }

  /**
   * @description Method for initializing device
   * @param {object} payload Device payload
   */
  async init(payload) {
    //variables and calculation elements have to be empty in order initializing mechanizm on the basis of template to start!!
    if (!payload.variables && !payload.calculationElements) {
      //Generating variables of device
      payload.variables = [];

      let variablesSchema = this._getVariablesSchema();

      let variableNames = Object.keys(variablesSchema);

      for (let varName of variableNames) {
        let variablePayload = variablesSchema[varName];
        variablePayload.name = varName;

        payload.variables.push(variablePayload);
      }

      //Generating calculationElements of device

      payload.calculationElements = [];

      let elementsSchema = this._getCalculationElementsSchema(variablesSchema);

      let elementNames = Object.keys(elementsSchema);

      for (let elementName of elementNames) {
        let elementPayload = elementsSchema[elementName];
        elementPayload.name = elementName;
        payload.calculationElements.push(elementPayload);
      }
    }

    await super.init(payload);
  }
}

module.exports = MBDeviceWithTemplate;
