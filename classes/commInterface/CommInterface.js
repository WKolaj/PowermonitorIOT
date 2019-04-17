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
  async init(payload) {
    if (!this.Initialized) {
      this._sampler = new Sampler();
      this._devices = {};
      this.Sampler.start();
      this._initialized = true;

      if (payload) {
        let allDevicesPayloads = Object.values(payload);

        for (let devicePayload of allDevicesPayloads) {
          await this.createNewDevice(devicePayload);
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
  getMainData() {
    let collectionToReturn = {};
    let allDevices = Object.values(this.Devices);

    for (let device of allDevices) {
      collectionToReturn[device.Id] = {
        name: device.Name,
        variables: {}
      };

      let allVariables = Object.values(device.Variables);
      for (let variable of allVariables) {
        collectionToReturn[device.Id]["variables"][variable.Id] = {
          name: variable.Name,
          value: variable.Value
        };
      }
    }
    return collectionToReturn;
  }

  /**
   * @description Method for getting all values
   */
  getAllValues() {
    let collectionToReturn = {};
    let allDevices = Object.values(this.Devices);

    for (let device of allDevices) {
      collectionToReturn[device.Id] = {};

      let allVariables = Object.values(device.Variables);
      for (let variable of allVariables) {
        collectionToReturn[device.Id][variable.Id] = variable.Value;
      }
    }
    return collectionToReturn;
  }

  /**
   * @description Method for getting all variable ids
   */
  getAllVariableIds() {
    let allIds = [];

    let allDevices = this.getAllDevices();

    for (let device of allDevices) {
      let deviceVariables = Object.values(device.Variables);

      for (let variable of deviceVariables) {
        allIds.push(variable.Id);
      }
    }

    return allIds;
  }

  /**
   * @description Checking if variable of id exists
   * @param {string} variableId Variable id
   */
  _doesVariableExistis(variableId) {
    let allVariables = this.getAllVariableIds();
    return allVariables.includes(variableId);
  }

  /**
   * @description Getting all variables from device
   * @param {string} deviceId Device Id
   */
  getAllVariables(deviceId) {
    let device = this.getDevice(deviceId);
    return Object.values(device.Variables);
  }

  /**
   * @description Getting all devices
   */
  getAllDevices() {
    return Object.values(this.Devices);
  }

  /**
   * @description Method for creating new device based on payload
   * @param {object} payload
   */
  async createNewDevice(payload) {
    if (!payload) throw new Error("Given payload cannot be empty");
    if (!payload.type)
      throw new Error("Given device payload has no type defined");
    if (payload.id && this.Devices[payload.id])
      throw new Error(`Device with id ${payload.id} already exists!`);

    switch (payload.type) {
      //value mbDevice type should not be changed - sensitive in mbDevice constructor
      case "mbDevice": {
        return this._createMBDevice(payload);
      }
      default: {
        return Promise.reject(
          new Error(`Given device type is not recognized: ${payload.type}`)
        );
      }
    }
  }

  /**
   * @description Method for creating MBDevice based on payload
   * @param {object} payload
   */
  async _createMBDevice(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        let newDevice = new MBDevice();
        await newDevice.init(payload);
        this.Devices[newDevice.Id] = newDevice;
        this.Sampler.addDevice(newDevice);
        //Initializing new devices archive manager
        return resolve(newDevice);
      } catch (err) {
        return reject(err);
      }
    });
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
  async createVariable(deviceId, payload) {
    if (payload.id && this._doesVariableExistis(payload.id)) {
      throw new Error(
        `Variable of id: ${
          payload.id
        } cannot be added becouse it already exists!`
      );
    }

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
   * @description Method for getting variable from device
   * @param {string} deviceId Id of device
   * @param {string} variableId Id of variable
   * @param {number} date date of sample
   */
  async getVariableFromDatabase(deviceId, variableId, date) {
    let device = this.getDevice(deviceId);
    let variable = device.getVariable(variableId);
    if (!variable)
      throw new Error(`There is no variable of given id ${variableId}`);
    return device.getValueFromDB(variableId, date);
  }

  /**
   * @description Method for editting variable in device
   * @param {string} deviceId Id of device
   * @param {string} variableId Id of variable
   * @param {object} payload variable payload
   */
  async editVariable(deviceId, variableId, payload) {
    let device = this.getDevice(deviceId);
    return device.editVariable(variableId, payload);
  }

  /**
   * @description Method for removing variable in device
   * @param {string} deviceId Id of device
   * @param {string} variableId Id of variable
   */
  async removeVariable(deviceId, variableId) {
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

  /**
   * @description Method for generating payload for whole commInterface - all devices and its variables
   */
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
