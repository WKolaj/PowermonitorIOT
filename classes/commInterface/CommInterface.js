const Sampler = require("../sampler/Sampler");

const MBDevice = require("../device/Modbus/MBDevice");

class CommInterface {
  /**
   * @description class representing communication interface of App
   */
  constructor() {
    this._initialized = false;
  }

  /**
   * @description method for initializing communication interface based on payload
   * @param payload payload to initalize
   */
  init(payload) {
    if (!this.Initialized) {
      this._sampler = new Sampler();
      this._devices = {};
      this.Sampler.start();
      this._initialized = true;

      if (payload) {
        let allDevicesPayloads = Object.values(payload);

        for (let devicePayload of allDevicesPayloads) {
          this.createNewDevice(devicePayload);
        }
      }
    }
  }

  /**
   * @description is communication interface initalized
   */
  get Initialized() {
    return this._initialized;
  }

  /**
   * @description Sampler used by communication interface
   */
  get Sampler() {
    return this._sampler;
  }

  /**
   * @description All devices created by communication interface
   */
  get Devices() {
    return this._devices;
  }

  /**
   * @description Payload of all devices
   */
  get Payload() {
    return this._generatePayload();
  }

  /**
   * @description Starting commmunication of device
   * @param {string} deviceId Device Id
   */
  async startCommunication(deviceId) {
    return this.getDevice(deviceId).connect();
  }

  /**
   * @description Stopping commmunication of device
   * @param {string} deviceId Device Id
   */
  async stopCommunication(deviceId) {
    return this.getDevice(deviceId).disconnect();
  }

  /**
   * @description Starting with all devices
   */
  async startCommunicationWithAllDevices() {
    for (let deviceId of Object.keys(this.Devices)) {
      this.startCommunication(deviceId);
    }
  }

  /**
   * @description Stopping with all devices
   */
  async stopCommunicationWithAllDevices() {
    for (let deviceId of Object.keys(this.Devices)) {
      this.stopCommunication(deviceId);
    }
  }

  /**
   * @description Method for getting all deviceIds, variableIds and variable values
   */
  getAllIdsAndValues() {
    let collectionToReturn = {};
    for (let device of this.Devices) {
      collectionToReturn[device.Id] = {};

      for (let variable of this.Variables) {
        collectionToReturn[deviceId][variable.Id] = variable.Value;
      }
    }
    return collectionToReturn;
  }

  /**
   * @description Getting all variables from device
   * @param {string} deviceId Device Id
   */
  getAllVariables(deviceId) {
    let device = this.getDevice(deviceId);
    return device.Variables;
  }

  /**
   * @description Method for creating new device based on payload
   * @param {object} payload
   */
  createNewDevice(payload) {
    if (!payload) throw new Error("Given payload cannot be empty");
    if (!payload.type)
      throw new Error("Given device payload has no type defined");

    switch (payload.type) {
      //value mbDevice type should not be changed - sensitive in mbDevice constructor
      case "mbDevice": {
        return this._createMBDevice(payload);
      }
      default: {
        throw new Error(`Given device type is not recognized: ${payload.type}`);
      }
    }
  }

  /**
   * @description Method for creating MBDevice based on payload
   * @param {object} payload
   */
  _createMBDevice(payload) {
    let newDevice = new MBDevice(payload);
    this.Devices[newDevice.Id] = newDevice;
    this.Sampler.addDevice(newDevice);

    return newDevice;
  }

  /**
   * @description Method for getting device by device id
   * @param {string} deviceId Id of device
   */
  getDevice(deviceId) {
    let device = this.Devices[deviceId];
    if (!device) throw new Error(`There is no device of given id ${deviceId}`);
    return device;
  }

  /**
   * @description Method for editting device based on payload
   * @param {string} deviceId Id of device
   * @param {object} payload Id of device
   */
  editDevice(deviceId, payload) {
    let device = this.getDevice(deviceId);
    return device.editWithPayload(payload);
  }

  /**
   * @description Method for removing device based on id
   * @param {string} deviceId Id of device
   */
  async removeDevice(deviceId) {
    let deviceToRemove = this.Devices[deviceId];
    if (!deviceToRemove)
      throw new Error("There is no device of given id: " + deviceId);

    if (deviceToRemove.IsActive) await deviceToRemove.disconnect();

    //Removing device from sampler and from commInterface
    this.Sampler.removeDevice(deviceToRemove);
    delete this.Devices[deviceToRemove.Id];

    return deviceToRemove;
  }

  /**
   * @description Method for creating variable in device
   * @param {string} deviceId Id of device
   * @param {object} payload payload of variable
   */
  createVariable(deviceId, payload) {
    let device = this.getDevice(deviceId);
    return device.createVariable(payload);
  }

  /**
   * @description Method for getting variable from device
   * @param {string} deviceId Id of device
   * @param {string} variableId Id of variable
   */
  getVariable(deviceId, variableId) {
    let device = this.getDevice(deviceId);
    let variable = device.getVariable(variableId);
    if (!variable)
      throw new Error(`There is no variable of given id ${variableId}`);
    return variable;
  }

  /**
   * @description Method for editting variable in device
   * @param {string} deviceId Id of device
   * @param {string} variableId Id of variable
   * @param {object} payload variable payload
   */
  editVariable(deviceId, variableId, payload) {
    let device = this.getDevice(deviceId);
    return device.editVariable(variableId, payload);
  }

  /**
   * @description Method for removing variable in device
   * @param {string} deviceId Id of device
   * @param {string} variableId Id of variable
   */
  removeVariable(deviceId, variableId) {
    let device = this.getDevice(deviceId);
    return device.removeVariable(variableId);
  }

  /**
   * @description Getting value strightly from device
   * @param {string} deviceId Id of device
   * @param {string} variableId Id of variable
   */
  async getVariableFromDevice(deviceId, variableId) {
    return this.getVariable(deviceId, variableId).getSingle();
  }

  /**
   * @description Setting value strightly in device
   * @param {string} deviceId Id of device
   * @param {string} variableId Id of variable
   * @param {object} value value to be set
   */
  async setVariableInDevice(deviceId, variableId, value) {
    return this.getVariable(deviceId, variableId).setSingle(value);
  }

  _generatePayload() {
    let payloadToReturn = {};

    let allDevices = Object.values(this.Devices);

    for (let device of allDevices) {
      payloadToReturn[device.Id] = device.Payload;
    }

    return payloadToReturn;
  }
}

const commInterfaceObject = new CommInterface();

module.exports = commInterfaceObject;
