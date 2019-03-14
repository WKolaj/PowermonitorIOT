const Device = require("../Device");
const MBGateway = require("../../driver/Modbus/MBGateway");

class MBRTUDevice extends Device {
  /**
   * @description Modbus device
   * @param {string} name device name
   * @param {number} unitId Modbus RTU address
   */
  constructor(name, unitId) {
    super(name);

    //Binding methods to device object
    this.disconnect = this.disconnect.bind(this);
    this.connect = this.connect.bind(this);
    this.setModbusGateway = this.setModbusGateway.bind(this);
    this._unitId = unitId;
  }

  /**
   * @description Assigning Modbus Gateway to Modbus RTU
   * @param {object} mbGateway MBGateway object to assign
   */
  setModbusGateway(mbGateway) {
    if (this._driver) this._driver.removeModbusDevice(this);
    this._driver = mbGateway;
    this._driver.addModbusDevice(this);
  }

  /**
   * @description Removing Modbus Gateway from Modbus RTU Device
   */
  removeModbusGateway() {
    if (this._driver) this._driver.removeModbusDevice(this);
    this._driver = undefined;
  }

  /**@description Connecting to modbus device */
  connect() {
    return this._driver.connect();
  }

  /**@description Connecting to modbus device */
  disconnect() {
    return this._driver.disconnect();
  }

  /**
   * @description MBDevices associated with gateway
   */
  get MBDevices() {
    return this._driver.MBDevices;
  }

  /**
   * @description IPAdress used by gateway
   */
  get IPAdress() {
    return this._driver.IPAdress;
  }

  /**
   * @description PortNumber used by gateway
   */
  get PortNumber() {
    return this._driver.PortNumber;
  }

  /**
   * @description Timeout of driver_device
   */
  get Timeout() {
    return this._driver.Timeout;
  }

  /**
   * @description Default unit ID used by driver
   */
  get UnitID() {
    return this._unitId;
  }
}

module.exports = MBRTUDevice;
