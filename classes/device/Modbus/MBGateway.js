const MBDevice = require("./MBDevice");
const logger = require("../../../logger/logger");
const { exists } = require("../../../utilities/utilities");

class MBGateway extends MBDevice {
  /**
   * @description Modbus device
   */
  constructor() {
    super();
  }

  /**
   * @description Method for initializing device
   * @param {object} payload Device payload
   */
  async init(payload) {
    payload.type = "mbGateway";
    await super.init(payload);
  }

  /**
   * @description creating variable and adding it to the Device
   * @param {object} payload Payload of variable to be created
   */
  async createVariable(payload) {
    if (!payload.unitId)
      throw new Error("Given variable payload has no unitId defined");
    return super.createVariable(payload);
  }
}

module.exports = MBGateway;
