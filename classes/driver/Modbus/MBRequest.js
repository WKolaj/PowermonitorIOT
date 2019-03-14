/**
 * @description Generating random id number
 */
function generateRandId() {
  return Math.random().toString(36);
}

/**
 * @description Generating random id number
 * @param {object} mbDriver Modbus driver associated with request
 * @param {number} fcode Modbus function code
 * @param {number} unitId unit id of request
 * @param {number} maxRequestLength maximum length of Modbus RTU request
 */
class MBRequest {
  constructor(mbDriver, fcode, unitId, maxRequestLength = 200) {
    //Generating random id
    this._id = generateRandId();

    //Setting appropriate variables
    this._mbDriver = mbDriver;
    this._unitId = unitId;
    this._fcode = fcode;
    this._write = fcode >= 1 && fcode <= 4 ? false : true;
    this._length = 0;
    this._dataToSend = [];
    this._variableConnections = {};
    this._maxRequestLength = maxRequestLength;
  }
  /**
   * @description Updating Action property
   */
  updateAction() {
    this._formatDataToSend();
    this._action = this._createAction();
  }

  /**
   * @description Private method for creating action on the basis of VariableCollection
   */
  _createAction() {
    if (this.Write) {
      //Write request - Data to send cannot be undefined
      if (this.DataToSend === undefined)
        throw new Error("Value cannot be empty");

      //Creating setDataAction
      return this.MBDriver.createSetDataAction(
        this.FCCode,
        this.Offset,
        this.DataToSend,
        this.UnitId
      );
    } else {
      //Creating getDataAction
      return this.MBDriver.createGetDataAction(
        this.FCCode,
        this.Offset,
        this.Length,
        this.UnitId
      );
    }
  }

  /**
   * @description Setting responsedata in variableCollection, on the basis of Modbus response
   * @param {object} response Response from Modbus function
   */
  setResponseData(responseData) {
    if (responseData === undefined)
      throw new Error(`Response for request ${this.RequestId} not found`);

    //Setting response data
    this._responseData = responseData;

    //Setting asociated responseData to variables
    let allVariableNames = Object.keys(this.VariableConnections);

    for (let variableName of allVariableNames) {
      let variableObject = this.VariableConnections[variableName];

      let startIndex = variableObject.requestOffset;
      let stopIndex = variableObject.requestOffset + variableObject.length;
      variableObject.responseData = responseData.slice(startIndex, stopIndex);
    }
  }

  /**
   * @description Adding Modbus variable to variablesCollection and updating Action
   * @param {object} mbVariable modbus Variable
   */
  addVariable(mbVariable) {
    if (this.Offset === undefined) this._offset = mbVariable.Offset;

    //Throw an error in case length exceeds max modbus length
    if (this.Offset + this.Length > this._maxRequestLength) {
      throw new Error(
        "Request length + variable length exceeds maximum MB request length"
      );
    }
    //Throw an error in case variable doest not correspond to actual request offset
    if (this.Offset + this.Length != mbVariable.Offset) {
      throw new Error(
        `Given variable has invalid offset: ${
          mbVariable.Offset
        }, current request offset: ${this.Offset + this.Length}`
      );
    }

    //Creating variable object and assigining it to VariableCollection
    this.VariableConnections[mbVariable.Name] = this._createVariableObject(
      mbVariable
    );

    //Increasing length od request
    this._length += mbVariable.Length;

    //Updating action
    this.updateAction();
  }

  /**
   * @description Private method for formating values, written to Modbus Devoce
   */
  _formatDataToSend() {
    //Only valid for writing data
    if (!this.Write) return;

    //Asigning data to send in the same order as variables are defined
    this._dataToSend = [];

    let allVariableNames = Object.keys(this.VariableConnections);

    //Appending data from every variable to array of values which are ment to be written to Modbus driver
    for (let variableName of allVariableNames) {
      let variableObject = this.VariableConnections[variableName];
      let variable = variableObject.variable;

      if (Array.isArray(variable.Data)) {
        this._dataToSend = [...this.DataToSend, ...variable.Data];
      } else {
        this._dataToSend = [...this.DataToSend, variable.Data];
      }
    }
  }

  /**
   * @description Private method for creating Variable Object on the basic of Variable
   * @param {object} mbVariable Modbus variable
   */
  _createVariableObject(mbVariable) {
    return {
      variable: mbVariable,
      requestOffset: mbVariable.Offset - this.Offset,
      length: mbVariable.Length,
      responseData: undefined
    };
  }

  /**
   * @description Uniq request id
   */
  get RequestId() {
    return this._id;
  }

  /**
   * @description Modbus driver action associated with MBRequest
   */
  get Action() {
    return this._action;
  }

  /**
   * @description Data to be send (written) to device
   */
  get DataToSend() {
    return this._dataToSend;
  }

  /**
   * @description Modbus RTU device address
   */
  get UnitId() {
    return this._unitId;
  }

  /**
   * @description Modbus driver
   */
  get MBDriver() {
    return this._mbDriver;
  }

  /**
   * @description Modbus function code
   */
  get FCCode() {
    return this._fcode;
  }

  /**
   * @description Is request associated with writting data to device
   */
  get Write() {
    return this._write;
  }

  /**
   * @description Request offset
   */
  get Offset() {
    return this._offset;
  }

  /**
   * @description Request length
   */
  get Length() {
    return this._length;
  }

  /**
   * @description Whole response data - fetched by setResponseData method
   */
  get ResponseData() {
    return this._responseData;
  }

  /**
   * @description All Modbus variables associated with request
   */
  get VariableConnections() {
    return this._variableConnections;
  }
}

module.exports = MBRequest;
