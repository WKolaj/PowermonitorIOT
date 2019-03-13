const MBDevice = require("../../classes/device/Modbus/MBDevice");
const ModbusRTU = require("modbus-serial");

describe("MBDevice", () => {
  describe("Constructor", () => {
    ModbusRTU = class {
      connectTCP(ipAdress, configs, callback) {}

      setID(unitId) {}
    };
  });
});
