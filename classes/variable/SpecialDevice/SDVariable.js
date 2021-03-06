const Variable = require("../Variable");
const { exists } = require("../../../utilities/utilities");

class SDVariable extends Variable {
  /**
   * @description Base class representing Modbus variable
   * @param {object} device device associated with variable
   */
  constructor(device) {
    super(device);

    //Assigning project to comm interface - as a new object
    this._commInterface = require("../../commInterface/CommInterface");
  }

  get CommInterface() {
    return this._commInterface;
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

    if (
      !this.CommInterface.doesElementExist(
        payload.elementDeviceId,
        payload.elementId
      )
    )
      throw new Error(
        `Element of id ${payload.elementId} does not exist in device of id ${
          payload.elementDeviceId
        }`
      );

    this._elementDeviceId = payload.elementDeviceId;
    this._elementId = payload.elementId;
    this._element = await this.CommInterface.getElement(
      this.ElementDeviceId,
      this.ElementId
    );
  }

  /**
   * @description Method called while refreshing variable
   */
  refresh(tickNumber) {
    return this.Value;
  }

  get ElementDeviceId() {
    return this._elementDeviceId;
  }

  get ElementId() {
    return this._elementId;
  }

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
    this.Element.Value = value;
  }

  /**
   * @description Method for generating payload - overriding in child classes
   */
  _generatePayload() {
    let payload = super._generatePayload();

    payload.elementDeviceId = this.ElementDeviceId;
    payload.elementId = this.ElementId;
    payload.value = this.Value;

    return payload;
  }

  /**
   * @description Method for edition of variable associated with changes with connection to element
   * @param {object} payload Payload of edition
   */
  async _editElementAssignment(payload) {
    //Editing element if edition is associated with changes of deviceId or elementId
    if (exists(payload.elementDeviceId) || exists(payload.elementId)) {
      let {
        newElementDeviceId,
        newElementId
      } = await this._checkElementAssignment(payload);

      this._elementDeviceId = newElementDeviceId;
      this._elementId = newElementId;
      this._element = await this.CommInterface.getElement(
        this.ElementDeviceId,
        this.ElementId
      );
    }
  }

  async _checkElementAssignment(payload) {
    //Calculation new ids based on payload
    let newElementDeviceId = exists(payload.elementDeviceId)
      ? payload.elementDeviceId
      : this.ElementDeviceId;
    let newElementId = exists(payload.elementId)
      ? payload.elementId
      : this.ElementId;

    if (exists(payload.elementDeviceId) || exists(payload.elementId)) {
      //Checking if element of given ids exists
      if (
        !this.CommInterface.doesElementExist(newElementDeviceId, newElementId)
      )
        throw new Error(
          `Element of id ${newElementId} does not exist in device of id ${newElementDeviceId}`
        );
    }

    return {
      newElementDeviceId,
      newElementId
    };
  }

  /**
   * @description Method for editting variable based on given payload
   */
  async editWithPayload(payload) {
    await this._checkElementAssignment(payload);
    await super.editWithPayload(payload);
    await this._editElementAssignment(payload);
    return this;
  }

  /**
   * @description Method for generating type of value of variable
   */
  _getValueType() {
    return this.Element.ValueType;
  }

  /**
   * @description Method for generating type name that represents variable
   */
  _getTypeName() {
    return "sdVariable";
  }
}

module.exports = SDVariable;
