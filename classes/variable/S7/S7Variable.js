const Variable = require("../Variable");
const S7Request = require("../../driver/S7/S7Request");
const Sampler = require("../../sampler/Sampler");
const { exists } = require("../../../utilities/utilities");

class S7Variable extends Variable {
  /**
   * @description Base class representing S7 variable
   * @param {object} device device associated with variable
   */
  constructor(device) {
    super(device);
  }

  /**
   * @description Method for initializing variable by payload
   * @param {object} payload variable payload
   */
  async init(payload) {
    await super.init(payload);

    if (!exists(payload.areaType)) throw new Error("AreaType cannot be empty");
    if (!exists(payload.offset)) throw new Error("Offset cannot be empty");
    if (!exists(payload.length)) throw new Error("Length cannot be empty");
    if (!exists(payload.write))
      throw new Error(
        "Variable should be defined as to write or read! write missing"
      );

    //Setting default value of dbNumber to 0
    if (!exists(payload.dbNumber)) payload.dbNumber = 0;

    //Controlling if areaTypes are possible
    let allPossibleAreaTypes = this._getPossibleAreaTypes();

    if (!allPossibleAreaTypes.includes(payload.areaType))
      throw new Error(
        `AreaType ${payload.fCode} cannot be applied to given variable`
      );

    this._offset = payload.offset;
    this._length = payload.length;
    this._areaType = payload.areaType;
    this._dbNumber = payload.dbNumber;
    this._write = payload.write;

    this._getSingleRequest = new S7Request(
      this.Device.S7Driver,
      this.AreaType,
      false,
      100,
      this.DBNumber
    );
    this._getSingleRequest.addVariable(this);
    this._setSingleRequest = new S7Request(
      this.Device.S7Driver,
      this.AreaType,
      true,
      100,
      this.DBNumber
    );
    this._setSingleRequest.addVariable(this);

    //Setting value if defined
    if (payload.value !== undefined) {
      this.Value = payload.value;
    } else {
      //Setting defualt value - data with all elements equal 0 if not defined in payload
      let dataToSet = [];
      for (let i = 0; i < this._length; i++) {
        dataToSet.push(0);
      }

      //Setting data without invoking event
      this.Data = dataToSet;
    }
  }

  /**
   * @description Method for generating type name that represents variable
   */
  _getTypeName() {
    return "s7Variable";
  }

  /**
   * @description Method for reassigning driver to variable
   */
  reassignDriver() {
    //After driver change - get and set single requests must also change
    this._getSingleRequest = new S7Request(
      this.Device.S7Driver,
      this.AreaType,
      false,
      100,
      this.DBNumber
    );
    this._getSingleRequest.addVariable(this);

    this._setSingleRequest = new S7Request(
      this.Device.S7Driver,
      this.AreaType,
      true,
      100,
      this.DBNumber
    );
    this._setSingleRequest.addVariable(this);
  }

  /**
   * @description Area type of variable
   */
  get AreaType() {
    return this._areaType;
  }

  /**
   * @description DBNumber of variable
   */
  get DBNumber() {
    return this._dbNumber;
  }

  /**
   * @description Is variable assigned to write
   */
  get Write() {
    return this._write;
  }

  /**
   * @description Variable offset
   */
  get Offset() {
    return this._offset;
  }

  /**
   * @description Variable length
   */
  get Length() {
    return this._length;
  }

  /**
   * @description Request for getting single request
   */
  get GetSingleRequest() {
    return this._getSingleRequest;
  }

  /**
   * @description Request for setting single request
   */
  get SetSingleRequest() {
    return this._setSingleRequest;
  }

  /**
   * @description Setting value in variable and in Modbus device
   * @param {object} newValue value to set
   */
  setSingle(newValue) {
    this.Value = newValue;
    this._setSingleRequest.updateAction();
    return this.Device.S7Driver.invokeRequests([this.SetSingleRequest]);
  }

  /**
   * @description Getting value from device
   */
  getSingle() {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.Device.S7Driver.invokeRequests([
          this.GetSingleRequest
        ]);
        return resolve(this.Value);
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Variable Data
   */
  get Data() {
    return this._data;
  }

  /**
   * @description Variable Data
   */
  set Data(data) {
    if (data.length != this.Length)
      throw new Error(
        `Invalid data length: variable: ${this.Length}, data: ${data.length}`
      );

    this._data = data;
    this._value = this._convertDataToValue(data);
    //Emitting singal of value change
    this._emitValueChange(this._value);
  }

  /**
   * @description Private method for converting data to value - should be overwritten in child classes
   */
  _convertDataToValue() {}

  /**
   * @description Private method for converting value to data - should be overwritten in child classes
   */
  _convertValueToData() {}

  /**
   * @description Private method called in order to retrieve Value
   */
  _getValue() {
    return this._value;
  }

  /**
   * @description Private method called to set value on the basis of new value
   */
  _setValue(value) {
    let convertedData = this._convertValueToData(value);
    if (convertedData.length != this.Length)
      throw new Error(
        `Invalid data length: variable: ${this.Length}, data: ${
          convertedData.length
        }`
      );
    this._value = value;
    this._data = convertedData;
  }

  /**
   * @description Private method called for getting all possible FCodes - implemented in child
   */
  _getPossibleAreaTypes() {
    return ["I", "Q", "M", "DB"];
  }

  /**
   * @description Method for generating payload - overriding in child classes
   */
  _generatePayload() {
    let payload = super._generatePayload();

    payload.offset = this.Offset;
    payload.length = this.Length;
    payload.areaType = this.AreaType;
    payload.write = this.Write;
    payload.dbNumber = this.DBNumber;

    return payload;
  }

  /**
   * @description Method for editting variable based on given payload
   */
  async editWithPayload(payload) {
    //Controlling if functions are possible
    let allPossibleAreaTypes = this._getPossibleAreaTypes();

    if (payload.areaType && !allPossibleAreaTypes.includes(payload.areaType))
      throw new Error(
        `AreaType ${payload.areaType} cannot be applied to given variable`
      );

    await super.editWithPayload(payload);

    let changesAssociatedWithRequest = false;

    if (exists(payload.offset)) {
      this._offset = payload.offset;
      changesAssociatedWithRequest = true;
    }
    if (exists(payload.length)) {
      this._length = payload.length;
      changesAssociatedWithRequest = true;
    }
    if (exists(payload.areaType)) {
      this._areaType = payload.areaType;
      changesAssociatedWithRequest = true;
    }
    if (exists(payload.dbNumber)) {
      this._dbNumber = payload.dbNumber;
      changesAssociatedWithRequest = true;
    }
    if (exists(payload.write)) {
      this._write = payload.write;
      changesAssociatedWithRequest = true;
    }
    if (payload.value !== undefined) {
      this.Value = payload.value;
      //new valueTickId should be set
      this.ValueTickId = Sampler.convertDateToTickNumber(Date.now());
    }
    if (changesAssociatedWithRequest) {
      this._getSingleRequest = new S7Request(
        this.Device.S7Driver,
        this.AreaType,
        false,
        100,
        this.DBNumber
      );
      this._getSingleRequest.addVariable(this);

      this._setSingleRequest = new S7Request(
        this.Device.S7Driver,
        this.AreaType,
        true,
        100,
        this.DBNumber
      );
      this._setSingleRequest.addVariable(this);
    }

    return this;
  }
}

module.exports = S7Variable;
