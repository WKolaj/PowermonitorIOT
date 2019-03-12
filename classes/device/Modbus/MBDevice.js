const Device = require("../Device");
const MBDriver = require("../../driver/Modbus/MBDriver");

class MBDevice extends Device {
  /**
   * @description Modbus device
   * @param {string} name device name
   * @param {string} ipAdress ipAdress
   * @param {string} portNumber port number
   * @param {number} unitId port number
   */
  constructor(name, ipAdress, portNumber = 502) {
    super(name);

    //Binding methods to device object
    this.disconnect = this.disconnect.bind(this);
    this.connect = this.connect.bind(this);

    this._driver = new MBDriver(ipAdress, portNumber);
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
