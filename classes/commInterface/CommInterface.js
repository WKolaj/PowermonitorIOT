const Sampler = require("../sampler/Sampler");

const MBDevice = require("../device/Modbus/MBDevice");

const PAC3200TCP = require("../device/Modbus/Meters/PAC3200TCP");

class CommInterface {
  /**
   * @description class representing communication interface of App
   */
  constructor() {
    this._initialized = false;
  }

  /**
   * @description method for assigning commInterface to project
   * @param {Object} project Project of application
   */
  assignToProject(project) {
    this._project = project;
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
   * @description application project associated with device
   */
  get Project() {
    return this._project;
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
        variables: {},
        calculationElements: {}
      };

      let allVariables = Object.values(device.Variables);
      for (let variable of allVariables) {
        collectionToReturn[device.Id]["variables"][variable.Id] = {
          name: variable.Name,
          value: variable.Value
        };
      }

      let allCalculationElements = Object.values(device.CalculationElements);
      for (let calculationElement of allCalculationElements) {
        collectionToReturn[device.Id]["calculationElements"][
          calculationElement.Id
        ] = {
          name: calculationElement.Name,
          value: calculationElement.Value
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

      //Inserting all variables values
      let allVariables = Object.values(device.Variables);
      for (let variable of allVariables) {
        collectionToReturn[device.Id][variable.Id] = variable.Value;
      }

      //Inserting all calculation elements values
      let allCalculationElements = Object.values(device.CalculationElements);
      for (let calculationElement of allCalculationElements) {
        collectionToReturn[device.Id][calculationElement.Id] =
          calculationElement.Value;
      }
    }

    return collectionToReturn;
  }

  /**
   * @description Method for getting all values from device
   * @param {object} deviceId id of device
   */
  getAllValuesFromDevice(deviceId) {
    let device = this.getDevice(deviceId);

    let collectionToReturn = {};

    //Inserting all variables values
    let allVariables = Object.values(device.Variables);
    for (let variable of allVariables) {
      collectionToReturn[variable.Id] = variable.Value;
    }

    //Inserting all calculation elements values
    let allCalculationElements = Object.values(device.CalculationElements);
    for (let calculationElement of allCalculationElements) {
      collectionToReturn[calculationElement.Id] = calculationElement.Value;
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
   * @description Method for getting all calculation elements ids
   */
  getAllCalculationElementsIds() {
    let allIds = [];

    let allDevices = this.getAllDevices();

    for (let device of allDevices) {
      let deviceElements = Object.values(device.CalculationElements);

      for (let element of deviceElements) {
        allIds.push(element.Id);
      }
    }

    return allIds;
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
   * @description Getting all calculation elements from device
   * @param {string} deviceId Device Id
   */
  getAllCalculationElements(deviceId) {
    let device = this.getDevice(deviceId);
    return Object.values(device.CalculationElements);
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
      case "PAC3200TCP": {
        return this._createPAC3200TCPDevice(payload);
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
   * @description Method for creating PAC3200TCP based on payload
   * @param {object} payload
   */
  async _createPAC3200TCPDevice(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        let newDevice = new PAC3200TCP();
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
   * @description Method for checking if device of given id exists
   * @param {string} deviceId Id of device
   */
  doesDeviceExist(deviceId) {
    //If commInterface was not initialized - Devices will be empty
    if (!this.Devices) return false;

    return this.Devices[deviceId] !== undefined;
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
    if (payload.id && this.doesVariableExist(deviceId, payload.id)) {
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
   * @description Method for checking if variable exists
   * @param {string} deviceId Id of device
   * @param {string} variableId Id of variable
   */
  doesVariableExist(deviceId, variableId) {
    //If commInterface was not initialized - Devices will be empty
    if (!this.Devices) return false;

    let device = this.Devices[deviceId];
    if (!device) return false;
    let variable = device.getVariable(variableId);
    return variable !== undefined;
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
    return device.getVariableValueFromDB(variableId, date);
  }

  /**
   * @description Method for getting calculation element from device
   * @param {string} deviceId Id of device
   * @param {string} calculationElement Id of calculation element
   * @param {number} date date of sample
   */
  async getCalculationElementFromDatabase(deviceId, calculationElement, date) {
    let device = this.getDevice(deviceId);
    let variable = device.getCalculationElement(calculationElement);
    if (!variable)
      throw new Error(
        `There is no calculation element of given id ${calculationElement}`
      );
    return device.getCalculationElementValueFromDB(calculationElement, date);
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
   * @description Method for creating calculation element in device
   * @param {string} deviceId Id of device
   * @param {object} payload payload of calculation element
   */
  async createCalculationElement(deviceId, payload) {
    if (payload.id && this.doesCalculationElementExist(deviceId, payload.id)) {
      throw new Error(
        `Calculation element of id: ${
          payload.id
        } cannot be added becouse it already exists!`
      );
    }

    let device = this.getDevice(deviceId);
    return device.createCalculationElement(payload);
  }

  /**
   * @description Method for checking if calculationElement exists
   * @param {string} deviceId Id of device
   * @param {string} calcElementId Id of calculation element
   */
  doesCalculationElementExist(deviceId, calcElementId) {
    //If commInterface was not initialized - Devices will be empty
    if (!this.Devices) return false;

    let device = this.Devices[deviceId];
    if (!device) return false;
    let calcElement = device.getCalculationElement(calcElementId);
    return calcElement !== undefined;
  }

  /**
   * @description Method for getting calculation element
   * @param {string} deviceId Id of device
   * @param {string} calculationElementId Id of calculation element
   */
  getCalculationElement(deviceId, calculationElementId) {
    let device = this.getDevice(deviceId);
    let calculationElement = device.getCalculationElement(calculationElementId);
    if (!calculationElement)
      throw new Error(
        `There is no calculationElement of given id ${calculationElementId}`
      );
    return calculationElement;
  }

  /**
   * @description Method for removing variable in device
   * @param {string} deviceId Id of device
   * @param {string} calculationElement Id of variable
   */
  async removeCalculationElement(deviceId, calculationElement) {
    let device = this.getDevice(deviceId);
    return device.removeCalculationElement(calculationElement);
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

  /**
   * @description Method for checking if calculationElement or variable exists
   * @param {string} deviceId Id of device
   * @param {string} elementId Id of calculation element or variable
   */
  doesElementExist(deviceId, elementId) {
    //If commInterface was not initialized - Devices will be empty
    if (!this.Devices) return false;

    let device = this.Devices[deviceId];
    if (!device) return false;

    let element = device.getElement(elementId);
    return element !== undefined;
  }

  /**
   * @description Method for getting variable or calculation element - depending on given id
   * @param {object} deviceId Id of device
   * @param {string} elementId Id of variable or calculationElement
   */
  async getElement(deviceId, elementId) {
    let device = await this.getDevice(deviceId);

    let element = device.getElement(elementId);
    if (!element)
      throw new Error(
        `There is no variable and calcElement of given id ${elementId}`
      );

    return element;
  }

  /**
   * @description Method for getting variable from device
   * @param {string} deviceId Id of device
   * @param {string} variableId Id of variable
   */
  async getValueOfElement(deviceId, elementId) {
    if (!this.doesElementExist(deviceId, elementId))
      throw new Error(
        `There is no variable or calcElement of given id ${elementId}`
      );

    let device = await this.getDevice(deviceId);

    return device.getValueOfElement(elementId);
  }

  /**
   * @description Method for getting variable from device
   * @param {string} deviceId Id of device
   * @param {string} variableId Id of variable
   * @param {number} date date of sample
   */
  async getValueOfElementFromDatabase(deviceId, elementId, date) {
    if (!this.doesElementExist(deviceId, elementId))
      throw new Error(
        `There is no variable or calcElement of given id ${elementId}`
      );

    let device = await this.getDevice(deviceId);

    return device.getValueOfElementFromDB(elementId, date);
  }
}

const commInterfaceObject = new CommInterface();

module.exports = commInterfaceObject;
