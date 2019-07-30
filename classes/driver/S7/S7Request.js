const mongoose = require("mongoose");

class S7Request {
  /**
   * @description S7 request class
   * @param {object} s7Driver S7 driver associated with request
   * @param {string} areaType S7 area type
   * @param {number} maxRequestLength maximum length of S7 request
   * @param {boolean} write is request write
   * @param {number} dbNumber number of DB
   */
  constructor(
    s7Driver,
    areaType,
    write = false,
    maxRequestLength = 100,
    dbNumber = 0
  ) {
    //Throwing if areaType is invalid
    if (
      areaType !== "I" &&
      areaType !== "Q" &&
      areaType !== "DB" &&
      areaType !== "M"
    )
      throw new Error(`Unknown Area Type - type ${areaType}`);

    //Throwing if driver is empty
    if (!s7Driver) throw new Error("S7Driver cannot be empty");

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
    this._id = S7Request.generateRandId();

    //Setting appropriate variables
    this._s7Driver = s7Driver;
    this._areaType = areaType;
    this._write = write;
    this._length = 0;
    this._dbNumber = dbNumber;
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
      return this.S7Driver.createSetDataAction(
        this.AreaType,
        this.Offset,
        this.DataToSend,
        this.Length,
        this.DBNumber
      );
    } else {
      //Creating getDataAction
      return this.S7Driver.createGetDataAction(
        this.AreaType,
        this.Offset,
        this.Length,
        this.DBNumber
      );
    }
  }

  /**
   * @description Setting response data in variableCollection, on the basis of S7 response
   * @param {object} response Response from S7
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
    let allVariableIds = Object.keys(this.VariableConnections);

    for (let variableId of allVariableIds) {
      let variableObject = this.VariableConnections[variableId];

      let startIndex = variableObject.requestOffset;
      let stopIndex = variableObject.requestOffset + variableObject.length;
      variableObject.responseData = responseData.slice(startIndex, stopIndex);
      variableObject.variable.Data = variableObject.responseData;
    }
  }

  /**
   * @description Determaining if variable can be added to this request
   * depening on its areaType, length, dbNumber and actual length of MBRequest
   * @param {object} s7Variable Variable to be checked
   */
  canVariableBeAddedToRequest(s7Variable) {
    //Cannot add variable if FCode of variable is different
    if (s7Variable.AreaType !== this.AreaType) return false;

    //If area type is DB - db number should also be taken into account
    if (s7Variable.AreaType === "DB" && s7Variable.DBNumber !== this.DBNumber)
      return false;

    //Cannot add a variable that already exists in request
    if (s7Variable.Id in this.VariableConnections) return false;

    //Variable can be added despite its offset - undefined offset means that it is first variable of request - request's offset should be set according to there variable offset
    if (this.Offset === undefined) return true;

    //Throw an error in case length exceeds max modbus length
    if (s7Variable.Length + this.Length > this._maxRequestLength) {
      return false;
    }

    //Throw an error in case variable doest not correspond to actual request offset
    if (this.Offset + this.Length != s7Variable.Offset) {
      return false;
    }

    return true;
  }

  /**
   * @description Adding S7 variable to variablesCollection and updating Action
   * @param {object} s7Variable S7 Variable
   */
  addVariable(s7Variable) {
    if (!this.canVariableBeAddedToRequest(s7Variable))
      throw new Error(
        `Variable doesn't fit given variable: ${s7Variable.Name}`
      );

    if (this.Offset === undefined) this._offset = s7Variable.Offset;

    //Creating variable object and assigining it to VariableCollection
    this.VariableConnections[s7Variable.Id] = this._createVariableObject(
      s7Variable
    );

    //Increasing length od requestaddVariable
    this._length += s7Variable.Length;

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

    let allVariableIds = Object.keys(this.VariableConnections);
    //Appending data from every variable to array of values which are ment to be written to S7 driver
    for (let variableId of allVariableIds) {
      let variableObject = this.VariableConnections[variableId];
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
   * @param {object} s7Variable S7 variable
   */
  _createVariableObject(s7Variable) {
    return {
      variable: s7Variable,
      requestOffset: s7Variable.Offset - this.Offset,
      length: s7Variable.Length,
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
   * @description Modbus driver action associated with S7Request
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
   * @description S7Driver driver
   */
  get S7Driver() {
    return this._s7Driver;
  }

  /**
   * @description S7 Area type
   */
  get AreaType() {
    return this._areaType;
  }

  /**
   * @description Is request associated with writting data to device
   */
  get Write() {
    return this._write;
  }

  /**
   * @description DB number
   */
  get DBNumber() {
    return this._dbNumber;
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

module.exports = S7Request;
