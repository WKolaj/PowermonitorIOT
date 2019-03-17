const Device = require("../Device");
const MBDriver = require("../../driver/Modbus/MBDriver");
const MBRequestGrouper = require("../../driver/Modbus/MBRequestGrouper");

class MBDevice extends Device {
  /**
   * @description Modbus device
   * @param {string} name device name
   * @param {number} unitId Modbus RTU address
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
}

module.exports = MBDevice;
