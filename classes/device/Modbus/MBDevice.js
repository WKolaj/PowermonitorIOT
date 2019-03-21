const Device = require("../Device");
const Sampler = require("../../sampler/Sampler");
const MBDriver = require("../../driver/Modbus/MBDriver");
const MBRequestGrouper = require("../../driver/Modbus/MBRequestGrouper");

class MBDevice extends Device {
  /**
   * @description Modbus device
   * @param {string} name device name
   */
  constructor(name) {
    super(name);

    //Binding methods to device object
    this.disconnect = this.disconnect.bind(this);
    this.connect = this.connect.bind(this);
  }

  /**
   * @description Assigning Modbus Driver to Modbus Device
   * @param {string} ipAdress ipAdress
   * @param {number} portNumber port number
   * @param {number} timeout timeout
   * @param {number} unitId Modbus RTU Id
   */
  setModbusDriver(ipAdress, portNumber = 502, timeout = 2000, unitId = 1) {
    this._driver = new MBDriver(this, ipAdress, portNumber, timeout, unitId);
    this._mbRequestGrouper = new MBRequestGrouper(this);
    this._requests = {};
  }

  /**
   * @description All requests divided by tickId
   */
  get Requests() {
    return this._requests;
  }

  /**
   * @description MBRequestGrouper associated with driver
   */
  get RequestGrouper() {
    return this._mbRequestGrouper;
  }

  /**
   * @description MBDevice associated with driver
   */
  get MBDriver() {
    return this._driver;
  }

  /**
   * @description IPAdress used by driver
   */
  get IPAdress() {
    return this._driver.IPAdress;
  }

  /**
   * @description PortNumber used by driver
   */
  get PortNumber() {
    return this._driver.PortNumber;
  }

  /**
   * @description Timeout of driver
   */
  get Timeout() {
    return this._driver.Timeout;
  }

  /**
   * @description Default unit ID used by driver
   */
  get UnitId() {
    return this._driver.UnitId;
  }

  /**
   * @description Is device connected?
   */
  get Connected() {
    return this._driver.Connected;
  }

  /**
   * @description Is device active? this means, if driver is enabled to exchange data
   */
  get IsActive() {
    return this._driver.IsActive;
  }

  /**@description Connecting to modbus device */
  connect() {
    return this._driver.connect();
  }

  /**@description Connecting to modbus device */
  disconnect() {
    return this._driver.disconnect();
  }

  /**@description Rebuilding all request groups */
  refreshRequestGroups() {
    this._requests = {};
    let allVariables = Device.divideVariablesByTickId(
      Object.values(this.Variables)
    );
    let allTickIds = Object.keys(allVariables);

    for (let tickId of allTickIds) {
      let variablesOfTickId = allVariables[tickId];
      this._requests[tickId] = this.RequestGrouper.ConvertVariablesToRequests(
        variablesOfTickId
      );
    }
  }

  /**
   * @description Adding variable to device
   */
  addVariable(variable) {
    super.addVariable(variable);
    this.refreshRequestGroups();
  }

  /**
   * @description Removing variable from device
   */
  removeVariable(variable) {
    super.removeVariable(variable);
    this.refreshRequestGroups();
  }

  /**
   * @description Refreshing variables based on tickNumber
   */
  refresh(tickNumber) {
    if (!this.IsActive) return;

    let allTickIds = Object.keys(this.Requests);

    let requestsToInvoke = [];

    for (let tickId of allTickIds) {
      if (Sampler.doesTickIdMatchesTick(tickNumber, tickId)) {
        requestsToInvoke.push(...this.Requests[tickId]);
      }
    }

    try {
      this.MBDriver.invokeRequests(requestsToInvoke);
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = MBDevice;
