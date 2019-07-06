const Variable = require("../Variable");
const Project = require("../../project/Project");
const { exists } = require("../../../utilities/utilities");

class SDVariable extends Variable {
  /**
   * @description Base class representing Modbus variable
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

    if (!exists(payload.elementDeviceId))
      throw new Error("elementDeviceId cannot be empty");
    if (!exists(payload.elementId))
      throw new Error("elementId cannot be empty");

    //Checking if element exists
    if (
      !Project.CurrentProject.CommInterface.doesElementExist(
        elementDeviceId,
        elementId
      )
    )
      throw new Error(
        `element of id ${elementDeviceId} in device ${elementId} cannot be empty`
      );

    this._elementDeviceId = payload.elementDeviceId;
    this._elementId = payload.elementId;
    this._element = Project.CurrentProject.CommInterface.getEl;
  }

  /**
   * @description Element connected to variable
   */
  get Element() {
    return this._element;
  }

  /**
   * @description Private method called in order to retrieve Value
   */
  _getValue() {
    return this.Element.Value;
  }

  /**
   * @description Private method called to set value on the basis of new value
   */
  _setValue(value) {
    return (this.Element.Value = value);
  }

  /**
   * @description Method for generating payload - overriding in child classes
   */
  _generatePayload() {
    let payload = super._generatePayload();

    payload.deviceId = this.Offset;
    payload.length = this.Length;

    return payload;
  }

  /**
   * @description Method for editting variable based on given payload
   */
  editWithPayload(payload) {
    //Controlling if functions are possible
    let allPossibleFCodes = this._getPossibleFCodes();

    if (payload.fCode && !allPossibleFCodes.includes(payload.fCode))
      throw new Error(
        `Fcode ${payload.fCode} cannot be applied to given variable`
      );

    if (
      payload.setSingleFCode &&
      !allPossibleFCodes.includes(payload.setSingleFCode)
    )
      throw new Error(
        `Fcode ${payload.setSingleFCode} cannot be applied to given variable`
      );

    if (
      payload.getSingleFCode &&
      !allPossibleFCodes.includes(payload.getSingleFCode)
    )
      throw new Error(
        `Fcode ${payload.getSingleFCode} cannot be applied to given variable`
      );

    super.editWithPayload(payload);

    if (payload.offset) {
      this._offset = payload.offset;
    }
    if (payload.length) {
      this._length = payload.length;
    }
    if (payload.fCode) {
      this._fcode = payload.fCode;
    }
    if (payload.value !== undefined) {
      this.Value = payload.value;
    }
    if (payload.getSingleFCode) {
      this._getSingleFCode = payload.getSingleFCode;
      this._getSingleRequest = new MBRequest(
        this.Device.MBDriver,
        payload.getSingleFCode,
        this.Device.UnitId
      );
      this._getSingleRequest.addVariable(this);
    }
    if (payload.setSingleFCode) {
      this._setSingleFCode = payload.setSingleFCode;
      this._setSingleRequest = new MBRequest(
        this.Device.MBDriver,
        payload.setSingleFCode,
        this.Device.UnitId
      );
      this._setSingleRequest.addVariable(this);
    }

    return this;
  }
}

module.exports = SDVariable;
