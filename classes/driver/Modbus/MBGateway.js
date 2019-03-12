const MBDriver = require("./MBDriver");

class MBGateway extends MBDriver {
  /**
   * @description Modbus driver based on modbus-serial npm package
   * @param {string} ipAdress ipAdress
   * @param {string} portNumber port number
   * @param {number} timeout timeout in ms
   */
  constructor(ipAdress, portNumber = 502, timeout = 2000) {
    super(undefined, ipAdress, portNumber, timeout);

    //Binding methods to device object
    this.disconnect = this.disconnect.bind(this);
    this.connect = this.connect.bind(this);
    this._mbRTUDevices = [];
  }

  /**
   * @description Adding Modbus device to gateway
   * @param {object} device Modbus device to add
   */
  addModbusDevice(device) {
    this._mbRTUDevices.push(device);
  }

  /**
   * @description Adding Modbus device to gateway
   * @param {object} device Modbus device to remove
   */
  removeModbusDevice(device) {
    if (!device) return;
    let index = this._mbDevice.indexOf(device);
    this._mbRTUDevices.slice(index, 1);
  }

  /**
   * @description MBDevices associated with gateway
   */
  get MBDevices() {
    return this._mbRTUDevices;
  }
}

module.exports = MBGateway;
