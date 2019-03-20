const MBDevice = require("./MBDevice");
const MBGateway = require("../../driver/Modbus/MBGateway");

class MBRTUDevice extends MBDevice {
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

  /**
   * @description Default unit ID used by driver
   */
  get Gateway() {
    return this._driver;
  }

  /**
   * @description Default unit ID used by driver
   */
  get UnitID() {
    return this._unitId;
  }
}

module.exports = MBRTUDevice;
