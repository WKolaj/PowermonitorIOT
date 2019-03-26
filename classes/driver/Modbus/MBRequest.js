const mongoose = require("mongoose");

class MBRequest {
  /**
   * @description Modbus request class
   * @param {object} mbDriver Modbus driver associated with request
   * @param {number} fcode Modbus function code
   * @param {number} unitId unit id of request
   * @param {number} maxRequestLength maximum length of Modbus RTU request
   */
  constructor(mbDriver, fcode, unitId, maxRequestLength = 100) {
    //Throwing if fcode is invalid
    if (!((fcode >= 1 && fcode <= 4) || fcode === 15 || fcode === 16))
      throw new Error(`Unknown MBFunction codeL ${fcode}`);

    //Throwing if driver is empty
    if (!mbDriver) throw new Error("MBDriver cannot be empty");

    //UnitID cannot be empty
    if (unitId === undefined || unitId === null)
      throw new Error("UnitID cannot be empty");

    //Binind methods:
    this.updateAction = this.updateAction.bind(this);
    this._createAction = this._createAction.bind(this);
    this.setResponseData = this.setResponseData.bind(this);
    this.canVariableBeAddedToRequest = this.canVariableBeAddedToRequest.bind(
      this
    );
    this.addVariable = this.addVariable.bind(this);
    this._formatDataToSend = this._formatDataToSend.bind(this);
    this._createVariableObject = this._createVariableObject.bind(this);

    //Generating random id
    this._id = MBRequest.generateRandId();

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
   * @description Generating random id
   */
  static generateRandId() {
    return mongoose.Types.ObjectId();
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
      if (this.DataToSend === undefined || this.DataToSend === null)
        throw new Error("Value cannot be empty");
      //Creating setDataAction
      return this.MBDriver.createSetDataAction(
        this.FCode,
        this.Offset,
        this.DataToSend,
        this.UnitId
      );
    } else {
      //Creating getDataAction
      return this.MBDriver.createGetDataAction(
        this.FCode,
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

    if (responseData.length !== this.Length)
      throw new Error(
        `Invalid length of response: ${responseData.length}, request Length:${
          this.Length
        }`
      );

    //Setting response data
    this._responseData = responseData;

    //Setting asociated responseData to variables
    let allVariableNames = Object.keys(this.VariableConnections);

    for (let variableName of allVariableNames) {
      let variableObject = this.VariableConnections[variableName];

      let startIndex = variableObject.requestOffset;
      let stopIndex = variableObject.requestOffset + variableObject.length;
      variableObject.responseData = responseData.slice(startIndex, stopIndex);
      variableObject.variable.Data = variableObject.responseData;
    }
  }

  /**
   * @description Determaining if variable can be added to this request
   * depening on its offset, length and actual length of MBRequest
   * @param {object} mbVariable Variable to be checked
   */
  canVariableBeAddedToRequest(mbVariable) {
    //Cannot add variable if FCode of variable is different
    //if (mbVariable.FCode !== this.FCode) return false; - Added possinility to add variables with different FCode - eg. setting variable

    //Cannot add variable if unitId of variable is different
    if (mbVariable.UnitId !== this.UnitId) return false;

    //Cannot add a variable that already exists in request
    if (mbVariable.Name in this.VariableConnections) return false;

    //Variable can be added despite its offset - undefined offset means that it is first variable of request - request's offset should be set according to there variable offset
    if (this.Offset === undefined) return true;

    //Throw an error in case length exceeds max modbus length
    if (mbVariable.Length + this.Length > this._maxRequestLength) {
      return false;
    }

    //Throw an error in case variable doest not correspond to actual request offset
    if (this.Offset + this.Length != mbVariable.Offset) {
      return false;
    }

    return true;
  }

  /**
   * @description Adding Modbus variable to variablesCollection and updating Action
   * @param {object} mbVariable modbus Variable
   */
  addVariable(mbVariable) {
    if (!this.canVariableBeAddedToRequest(mbVariable))
      throw new Error(
        `Variable doesn't fit given variable: ${mbVariable.Name}`
      );

    if (this.Offset === undefined) this._offset = mbVariable.Offset;

    //Creating variable object and assigining it to VariableCollection
    this.VariableConnections[mbVariable.Name] = this._createVariableObject(
      mbVariable
    );

    //Increasing length od requestaddVariable
    this._length += mbVariable.Length;

    //Updating action
    this.updateAction();
  }

  /**variableObject
   * @description Private method for formating values, which are to be written to Modbus Device
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
  get FCode() {
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
