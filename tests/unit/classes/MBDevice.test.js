const MBDevice = require("../../../classes/device/Modbus/MBDevice");
const MBBooleanVariable = require("../../../classes/variable/Modbus/MBBooleanVariable");
const MBByteArrayVariable = require("../../../classes/variable/Modbus/MBByteArrayVariable");
const MBFloatVariable = require("../../../classes/variable/Modbus/MBFloatVariable");
const MBInt16Variable = require("../../../classes/variable/Modbus/MBInt16Variable");
const MBInt32Variable = require("../../../classes/variable/Modbus/MBInt32Variable");
const MBSwappedFloatVariable = require("../../../classes/variable/Modbus/MBSwappedFloatVariable");
const MBSwappedInt32Variable = require("../../../classes/variable/Modbus/MBSwappedInt32Variable");
const MBSwappedUInt32Variable = require("../../../classes/variable/Modbus/MBSwappedUInt32Variable");
const MBUInt16Variable = require("../../../classes/variable/Modbus/MBUInt16Variable");
const MBUInt32Variable = require("../../../classes/variable/Modbus/MBUInt32Variable");
const config = require("config");

let {
  clearDirectory,
  checkIfColumnExists,
  snooze
} = require("../../tools/tools.js");

describe("MBDevice", () => {
  //Database directory should be cleared
  let db1Path;
  let db2Path;
  beforeEach(async () => {
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
  });

  afterEach(async () => {
    await clearDirectory(db1Path);
    await clearDirectory(db2Path);
  });

  describe("constructor", () => {
    let exec = async () => {
      return new MBDevice();
    };

    it("should create new device and set initialized to false", async () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Initialized).toBeFalsy();
    });
  });

  describe("init", () => {
    let device;
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let type;
    let payload;
    let variables;
    let realInitVariableFunc;
    let initVariablesMockFunc;
    let isActive;
    let mockConnectFunc;
    let realConnectFunc;
    let mockInitCalculationElementFunc;
    let realInitCalculationElementFunc;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      variables = [
        { Id: "var1", Name: "name1" },
        { Id: "var2", Name: "name2" },
        { Id: "var3", Name: "name3" }
      ];
      calculationElements = [
        { type: "sumElement", id: "0001", name: "testElement1", sampleTime: 1 },
        { type: "sumElement", id: "0002", name: "testElement2", sampleTime: 2 },
        { type: "sumElement", id: "0003", name: "testElement3", sampleTime: 3 }
      ];
      type = undefined;
      isActive = false;
      realInitVariableFunc = MBDevice.prototype._initVariables;
      realConnectFunc = MBDevice.prototype.connect;
      realInitCalculationElementFunc =
        MBDevice.prototype._initCalculationElements;
      initVariablesMockFunc = jest.fn();
      mockConnectFunc = jest.fn();
      mockInitCalculationElementFunc = jest.fn();
      MBDevice.prototype._initVariables = initVariablesMockFunc;
      MBDevice.prototype.connect = mockConnectFunc;
      MBDevice.prototype._initCalculationElements = mockInitCalculationElementFunc;
    });

    afterEach(() => {
      MBDevice.prototype._initVariables = realInitVariableFunc;
      MBDevice.prototype.connect = realConnectFunc;
      MBDevice.prototype._initCalculationElements = realInitCalculationElementFunc;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId,
        variables: variables,
        calculationElements: calculationElements,
        type: type,
        isActive: isActive
      };
      device = new MBDevice(payload);
      return device.init(payload);
    };

    it("should create new Device and set its name, ipAdress, portNumber, timeout and unitId", async () => {
      await exec();

      expect(device).toBeDefined();
      expect(device.Name).toEqual(name);
      expect(device.IPAdress).toEqual(ipAdress);
      expect(device.PortNumber).toEqual(portNumber);
      expect(device.Timeout).toEqual(timeout);
      expect(device.UnitId).toEqual(unitId);

      expect(mockConnectFunc).not.toHaveBeenCalled();
    });

    it("should initiazle variables to empty object if no variables are given", async () => {
      variables = undefined;
      await exec();

      expect(initVariablesMockFunc).not.toHaveBeenCalled();
      expect(device.Variables).toEqual({});
    });

    it("should initialize variables by calling initVariables if variables in payload are passed", async () => {
      await exec();

      expect(initVariablesMockFunc).toHaveBeenCalledTimes(1);
      expect(initVariablesMockFunc.mock.calls[0][0]).toEqual(variables);
    });

    it("should initialize calculateElements by calling initCalculationElements if calculationElements in payload are passed", async () => {
      await exec();

      expect(mockInitCalculationElementFunc).toHaveBeenCalledTimes(1);
      expect(mockInitCalculationElementFunc.mock.calls[0][0]).toEqual(
        calculationElements
      );
    });

    it("should set MBDriver based on given arguments", async () => {
      await exec();

      expect(device.MBDriver).toBeDefined();
      expect(device.MBDriver.IPAdress).toEqual(ipAdress);
      expect(device.MBDriver.PortNumber).toEqual(portNumber);
      expect(device.MBDriver.Timeout).toEqual(timeout);
      expect(device.MBDriver.UnitId).toEqual(unitId);
    });

    it("should set mbRequestGrouper", async () => {
      await exec();

      expect(device.RequestGrouper).toBeDefined();
      expect(device.RequestGrouper.MBDevice).toEqual(device);
    });

    it("should set requests to empty object", async () => {
      await exec();

      expect(device.Requests).toBeDefined();
      expect(device.Requests).toEqual({});
    });

    it("should throw if name is empty", async () => {
      name = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if ipAdress is empty", async () => {
      ipAdress = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if unitId is empty", async () => {
      unitId = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if timeout is empty", async () => {
      timeout = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if portNumber is empty", async () => {
      portNumber = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should set type to mbDevice if no type is provided in payload", async () => {
      await exec();

      expect(device.Type).toBeDefined();
      expect(device.Type).toEqual("mbDevice");
    });

    it("should set type to type given in payload if it exists", async () => {
      type = "test type";
      await exec();

      expect(device.Type).toBeDefined();
      expect(device.Type).toEqual(type);
    });

    it("should call connect if device is active according to payload", async () => {
      isActive = true;
      await exec();

      expect(mockConnectFunc).toHaveBeenCalledTimes(1);
    });
  });

  describe("Requests", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);
    });

    let exec = () => {
      return device.Requests;
    };

    it("should return requests", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device._requests);
    });
  });

  describe("RequestGrouper", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);
    });

    let exec = () => {
      return device.RequestGrouper;
    };

    it("should return requestGrouper", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device._mbRequestGrouper);
    });
  });

  describe("MBDriver", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);
    });

    let exec = () => {
      return device.MBDriver;
    };

    it("should return MBDriver", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device._driver);
    });
  });

  describe("Type", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);
    });

    let exec = () => {
      return device.Type;
    };

    it("should return type of device", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual("mbDevice");
    });
  });

  describe("IPAdress", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);
    });

    let exec = () => {
      return device.IPAdress;
    };

    it("should return IPAdress", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(ipAdress);
    });
  });

  describe("PortNumber", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);
    });

    let exec = () => {
      return device.PortNumber;
    };

    it("should return PortNumber", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(portNumber);
    });
  });

  describe("Timeout", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);
    });

    let exec = () => {
      return device.Timeout;
    };

    it("should return Timeout", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(timeout);
    });
  });

  describe("UnitId", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);
    });

    let exec = () => {
      return device.UnitId;
    };

    it("should return UnitId", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(unitId);
    });
  });

  describe("Connected", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);
    });

    let exec = () => {
      return device.Connected;
    };

    it("should return driver Connected ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device.MBDriver.Connected);
    });
  });

  describe("IsActive", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);
    });

    let exec = () => {
      return device.IsActive;
    };

    it("should return driver isActive ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device.MBDriver.IsActive);
    });
  });

  describe("get Payload", () => {
    let device;
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let type;
    let payload;
    let variables;
    let initVariablesMockFunc;
    let realInitVariableFunc;
    let isActive;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      isActive = false;
      variables = [
        { Id: "var1", Name: "name1", Payload: "variable1" },
        { Id: "var2", Name: "name2", Payload: "variable2" },
        { Id: "var3", Name: "name3", Payload: "variable3" }
      ];
      type = "test type";

      initVariablesMockFunc = function(variablesToAdd) {
        this.Variables = [];

        for (let variable of variablesToAdd) {
          this.Variables[variable.Id] = variable;
        }
      };

      realInitVariableFunc = MBDevice.prototype._initVariables;
      MBDevice.prototype._initVariables = initVariablesMockFunc;
    });

    afterEach(() => {
      MBDevice.prototype._initVariables = realInitVariableFunc;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId,
        variables: variables,
        type: type
      };

      device = new MBDevice(payload);
      await device.init(payload);
      device._driver._active = isActive;

      return device.Payload;
    };

    it("should return payload based on device parameters", async () => {
      let result = await exec();

      let expectedPayload = {
        id: device.Id,
        name: device.Name,
        timeout: device.Timeout,
        unitId: device.UnitId,
        ipAdress: device.IPAdress,
        portNumber: device.PortNumber,
        type: device.Type,
        variables: ["variable1", "variable2", "variable3"]
      };
      expect(result).toBeDefined();
      expect(result).toMatchObject(expectedPayload);
    });

    it("should return payload based on device parameters when device has no variables", async () => {
      variables = [];

      let result = await exec();

      let expectedPayload = {
        id: device.Id,
        name: device.Name,
        timeout: device.Timeout,
        unitId: device.UnitId,
        ipAdress: device.IPAdress,
        portNumber: device.PortNumber,
        type: device.Type,
        variables: []
      };
      expect(result).toBeDefined();
      expect(result).toMatchObject(expectedPayload);
    });
  });

  describe("connect", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let driverConnectMock;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);
      driverConnectMock = jest.fn();
      device._driver.connect = driverConnectMock;
    });

    let exec = () => {
      return device.connect();
    };

    it("should call driver connect() that returns a promise", async () => {
      await exec();

      expect(driverConnectMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("disconnect", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let driverDisconnectMock;
    let payload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice(payload);
      await device.init(payload);
      driverDisconnectMock = jest.fn();
      device._driver.disconnect = driverDisconnectMock;
    });

    let exec = () => {
      return device.disconnect();
    };

    it("should call driver disconenct() that returns a promise", async () => {
      await exec();

      expect(driverDisconnectMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("_refreshRequestGroups", () => {
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;

    let variable1;
    let variable2;
    let variable3;
    let variable4;
    let variable5;
    let variable6;
    let variable7;
    let variable8;
    let variable9;
    let variable10;
    let mockRequestGroupper;
    let mockConvertVariablesToRequests;
    let payload;

    let name;
    let device;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;

      variable1 = { Name: "var1", TickId: 1 };
      variable2 = { Name: "var2", TickId: 1 };
      variable3 = { Name: "var3", TickId: 2 };
      variable4 = { Name: "var4", TickId: 2 };
      variable5 = { Name: "var5", TickId: 3 };
      variable6 = { Name: "var6", TickId: 3 };
      variable7 = { Name: "var7", TickId: 4 };
      variable8 = { Name: "var8", TickId: 4 };
      variable9 = { Name: "var9", TickId: 5 };
      variable10 = { Name: "var10", TickId: 5 };

      mockConvertVariablesToRequests = jest.fn().mockImplementation(variables =>
        variables.map(variable => {
          return { var: variable };
        })
      );
      mockRequestGroupper = {
        ConvertVariablesToRequests: mockConvertVariablesToRequests
      };

      name = "test name";
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice(payload);
      await device.init(payload);
      device._mbRequestGrouper = mockRequestGroupper;

      //Adding directly to collection - in order not to call refreshRequestGroup while adding
      device._variables[variable1.Name] = variable1;
      device._variables[variable2.Name] = variable2;
      device._variables[variable3.Name] = variable3;
      device._variables[variable4.Name] = variable4;
      device._variables[variable5.Name] = variable5;
      device._variables[variable6.Name] = variable6;
      device._variables[variable7.Name] = variable7;
      device._variables[variable8.Name] = variable8;
      device._variables[variable9.Name] = variable9;
      device._variables[variable10.Name] = variable10;
    });

    let exec = () => {
      device._refreshRequestGroups();
    };

    it("should create requests on the basis of variables and their tickIds", () => {
      exec();

      expect(device.Requests).toBeDefined();

      let requestKeys = Object.keys(device.Requests);

      expect(requestKeys.length).toEqual(5);

      expect(device.Requests["1"]).toBeDefined();
      expect(device.Requests["1"].length).toEqual(2);
      expect(device.Requests["1"][0]).toMatchObject({ var: variable1 });
      expect(device.Requests["1"][1]).toMatchObject({ var: variable2 });

      expect(device.Requests["2"]).toBeDefined();
      expect(device.Requests["2"].length).toEqual(2);
      expect(device.Requests["2"][0]).toMatchObject({ var: variable3 });
      expect(device.Requests["2"][1]).toMatchObject({ var: variable4 });

      expect(device.Requests["3"]).toBeDefined();
      expect(device.Requests["3"].length).toEqual(2);
      expect(device.Requests["3"][0]).toMatchObject({ var: variable5 });
      expect(device.Requests["3"][1]).toMatchObject({ var: variable6 });

      expect(device.Requests["4"]).toBeDefined();
      expect(device.Requests["4"].length).toEqual(2);
      expect(device.Requests["4"][0]).toMatchObject({ var: variable7 });
      expect(device.Requests["4"][1]).toMatchObject({ var: variable8 });

      expect(device.Requests["5"]).toBeDefined();
      expect(device.Requests["5"].length).toEqual(2);
      expect(device.Requests["5"][0]).toMatchObject({ var: variable9 });
      expect(device.Requests["5"][1]).toMatchObject({ var: variable10 });
    });

    it("should clear requests before creating new ones", () => {
      device._requests["test1"] = 1;
      device._requests["test2"] = 2;
      device._requests["test3"] = 3;

      exec();

      expect(device.Requests["test1"]).not.toBeDefined();
      expect(device.Requests["test2"]).not.toBeDefined();
      expect(device.Requests["test3"]).not.toBeDefined();

      expect(device.Requests["1"]).toBeDefined();
      expect(device.Requests["1"].length).toEqual(2);
      expect(device.Requests["1"][0]).toMatchObject({ var: variable1 });
      expect(device.Requests["1"][1]).toMatchObject({ var: variable2 });

      expect(device.Requests["2"]).toBeDefined();
      expect(device.Requests["2"].length).toEqual(2);
      expect(device.Requests["2"][0]).toMatchObject({ var: variable3 });
      expect(device.Requests["2"][1]).toMatchObject({ var: variable4 });

      expect(device.Requests["3"]).toBeDefined();
      expect(device.Requests["3"].length).toEqual(2);
      expect(device.Requests["3"][0]).toMatchObject({ var: variable5 });
      expect(device.Requests["3"][1]).toMatchObject({ var: variable6 });

      expect(device.Requests["4"]).toBeDefined();
      expect(device.Requests["4"].length).toEqual(2);
      expect(device.Requests["4"][0]).toMatchObject({ var: variable7 });
      expect(device.Requests["4"][1]).toMatchObject({ var: variable8 });

      expect(device.Requests["5"]).toBeDefined();
      expect(device.Requests["5"].length).toEqual(2);
      expect(device.Requests["5"][0]).toMatchObject({ var: variable9 });
      expect(device.Requests["5"][1]).toMatchObject({ var: variable10 });
    });

    it("should use RequestGrouper.ConvertVariablesToRequests to convert variables to requests", () => {
      exec();

      expect(mockConvertVariablesToRequests).toHaveBeenCalledTimes(5);
      expect(mockConvertVariablesToRequests.mock.calls[0][0][0]).toEqual(
        variable1
      );
      expect(mockConvertVariablesToRequests.mock.calls[0][0][1]).toEqual(
        variable2
      );
      expect(mockConvertVariablesToRequests.mock.calls[1][0][0]).toEqual(
        variable3
      );
      expect(mockConvertVariablesToRequests.mock.calls[1][0][1]).toEqual(
        variable4
      );
      expect(mockConvertVariablesToRequests.mock.calls[2][0][0]).toEqual(
        variable5
      );
      expect(mockConvertVariablesToRequests.mock.calls[2][0][1]).toEqual(
        variable6
      );
      expect(mockConvertVariablesToRequests.mock.calls[3][0][0]).toEqual(
        variable7
      );
      expect(mockConvertVariablesToRequests.mock.calls[3][0][1]).toEqual(
        variable8
      );
      expect(mockConvertVariablesToRequests.mock.calls[4][0][0]).toEqual(
        variable9
      );
      expect(mockConvertVariablesToRequests.mock.calls[4][0][1]).toEqual(
        variable10
      );
    });
  });

  describe("tick", () => {
    let request1;
    let request2;
    let request3;
    let request4;
    let request5;
    let request6;
    let request7;
    let request8;
    let request9;
    let request10;
    let mockInvokeRequestsFn;
    let mockEventEmitter;
    let mockEventEmitterEmitMethod;
    let variable1;
    let variable2;
    let variable3;
    let variable4;
    let variable5;
    let variable6;
    let variable7;
    let variable8;
    let variable9;
    let variable10;
    let variable11;
    let variable12;

    let name;
    let device;
    let isDeviceActive;
    let tickNumber;
    let payload;

    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;

      variable1 = {
        Id: "1001",
        Value: "1234"
      };
      variable2 = {
        Id: "1002",
        Value: "1235"
      };
      variable3 = {
        Id: "1003",
        Value: "1236"
      };
      variable4 = {
        Id: "1004",
        Value: "1237"
      };
      variable5 = {
        Id: "1005",
        Value: "1238"
      };
      variable6 = {
        Id: "1006",
        Value: "1239"
      };
      variable7 = {
        Id: "1007",
        Value: "1240"
      };
      variable8 = {
        Id: "1008",
        Value: "1241"
      };
      variable9 = {
        Id: "1009",
        Value: "1242"
      };
      variable10 = {
        Id: "1010",
        Value: "1243"
      };
      variable11 = {
        Id: "1011",
        Value: "1244"
      };
      variable12 = {
        Id: "1012",
        Value: "1245"
      };

      request1 = {
        Id: "0001",
        VariableConnections: {
          [variable1.Id]: { variable: variable1 }
        }
      };
      request2 = {
        Id: "0002",
        VariableConnections: {
          [variable2.Id]: { variable: variable2 },
          [variable3.Id]: { variable: variable3 }
        }
      };
      request3 = {
        Id: "0003",
        VariableConnections: {
          [variable4.Id]: { variable: variable4 },
          [variable5.Id]: { variable: variable5 }
        }
      };
      request4 = {
        Id: "0004",
        VariableConnections: {
          [variable6.Id]: { variable: variable6 }
        }
      };
      request5 = {
        Id: "0005",
        VariableConnections: {
          [variable7.Id]: { variable: variable7 }
        }
      };
      request6 = {
        Id: "0006",
        VariableConnections: {
          [variable8.Id]: { variable: variable8 }
        }
      };
      request7 = {
        Id: "0007",
        VariableConnections: {
          [variable9.Id]: { variable: variable9 }
        }
      };
      request8 = {
        Id: "0008",
        VariableConnections: {
          [variable10.Id]: { variable: variable10 }
        }
      };
      request9 = {
        Id: "0009",
        VariableConnections: {
          [variable11.Id]: { variable: variable11 }
        }
      };
      request10 = {
        Id: "0010",
        VariableConnections: {
          [variable12.Id]: { variable: variable12 }
        }
      };

      let requests = {
        "1": [request1, request2],
        "2": [request3, request4],
        "3": [request5, request6],
        "4": [request7, request8],
        "5": [request9, request10]
      };

      mockOnRefreshEvent = jest.fn();
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice(payload);
      await device.init(payload);
      device.Events.on("Refreshed", args => {
        mockOnRefreshEvent(args);
      });
      device._requests = requests;

      mockInvokeRequestsFn = jest.fn();
      tickNumber = 10;

      isDeviceActive = true;

      mockEventEmitterEmitMethod = jest.fn();
      mockEventEmitter = {
        emit: mockEventEmitterEmitMethod
      };
      device._events = mockEventEmitter;
    });

    let exec = async () => {
      device.MBDriver._active = isDeviceActive;
      device.MBDriver.invokeRequests = mockInvokeRequestsFn;
      return device.refresh(tickNumber);
    };

    it("should not invoke any request if device is not active", async () => {
      isDeviceActive = false;
      await exec();

      expect(mockInvokeRequestsFn).not.toHaveBeenCalled();
    });

    it("should invoke all requests that matches tickNumber", async () => {
      await exec();

      expect(mockInvokeRequestsFn).toHaveBeenCalledTimes(1);
      expect(mockInvokeRequestsFn.mock.calls[0][0].length).toEqual(6);
      expect(mockInvokeRequestsFn.mock.calls[0][0][0]).toEqual(request1);
      expect(mockInvokeRequestsFn.mock.calls[0][0][1]).toEqual(request2);
      expect(mockInvokeRequestsFn.mock.calls[0][0][2]).toEqual(request3);
      expect(mockInvokeRequestsFn.mock.calls[0][0][3]).toEqual(request4);
      expect(mockInvokeRequestsFn.mock.calls[0][0][4]).toEqual(request9);
      expect(mockInvokeRequestsFn.mock.calls[0][0][5]).toEqual(request10);
    });

    it("should invoke Refreshed event with all changed variables if there was no error", async () => {
      await exec();

      expect(mockEventEmitterEmitMethod).toHaveBeenCalledTimes(1);
      expect(mockEventEmitterEmitMethod.mock.calls[0][0]).toEqual("Refreshed");
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][0]).toEqual(device);
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][2]).toEqual(
        tickNumber
      );
      expect(
        Object.keys(mockEventEmitterEmitMethod.mock.calls[0][1][1]).length
      ).toEqual(8);

      expect(
        mockEventEmitterEmitMethod.mock.calls[0][1][1]["1001"]
      ).toBeDefined();
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][1]["1001"]).toEqual(
        variable1
      );

      expect(
        mockEventEmitterEmitMethod.mock.calls[0][1][1]["1002"]
      ).toBeDefined();
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][1]["1002"]).toEqual(
        variable2
      );

      expect(
        mockEventEmitterEmitMethod.mock.calls[0][1][1]["1003"]
      ).toBeDefined();
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][1]["1003"]).toEqual(
        variable3
      );

      expect(
        mockEventEmitterEmitMethod.mock.calls[0][1][1]["1004"]
      ).toBeDefined();
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][1]["1004"]).toEqual(
        variable4
      );

      expect(
        mockEventEmitterEmitMethod.mock.calls[0][1][1]["1005"]
      ).toBeDefined();
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][1]["1005"]).toEqual(
        variable5
      );

      expect(
        mockEventEmitterEmitMethod.mock.calls[0][1][1]["1006"]
      ).toBeDefined();
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][1]["1006"]).toEqual(
        variable6
      );

      expect(
        mockEventEmitterEmitMethod.mock.calls[0][1][1]["1011"]
      ).toBeDefined();
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][1]["1011"]).toEqual(
        variable11
      );

      expect(
        mockEventEmitterEmitMethod.mock.calls[0][1][1]["1012"]
      ).toBeDefined();
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][1]["1012"]).toEqual(
        variable12
      );
    });

    it("should invoke Refreshed event with all changed variables event if there was an error", async () => {
      mockInvokeRequestsFn = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      await exec();

      expect(mockEventEmitterEmitMethod).toHaveBeenCalledTimes(1);
      expect(mockEventEmitterEmitMethod.mock.calls[0][0]).toEqual("Refreshed");
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][0]).toEqual(device);
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][1]).toEqual({});
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][2]).toEqual(
        tickNumber
      );
    });

    it("should invoke Refreshed event event if if device is not active, with refreshing only calculation elements", async () => {
      isDeviceActive = false;

      await exec();

      expect(mockEventEmitterEmitMethod).toHaveBeenCalledTimes(1);
      expect(mockEventEmitterEmitMethod.mock.calls[0][0]).toEqual("Refreshed");
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][0]).toEqual(device);
      //Empty values - associated with calculation elements
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][1]).toEqual({});
      expect(mockEventEmitterEmitMethod.mock.calls[0][1][2]).toEqual(
        tickNumber
      );
    });

    it("should not throw if requests are empty", async () => {
      device._requests = {};

      expect(() => exec()).not.toThrow();
    });

    it("should not throw if invokeRequest throws", async () => {
      mockInvokeRequestsFn = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      expect(() => exec()).not.toThrow();
    });

    it("should not throw if invokeRequest rejects", async () => {
      mockInvokeRequestsFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Test error"));

      expect(() => exec()).not.toThrow();
    });
  });

  describe("_createBooleanVariable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varFcode;
    let varType;
    let varId;
    let varArchived;
    let varValue;
    let varClass = MBBooleanVariable;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      varId = undefined;
      varType = "bool";
      varTimeSample = 1;
      varName = "test variable";
      varOffset = 2;
      varFcode = 1;
      varValue = undefined;
      varArchived = false;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        value: varValue,
        archived: varArchived
      };

      return device._createBooleanVariable(variablePayload);
    };

    it("should create, add to variables and return new variable ", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", async () => {
      let result = await exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(1);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", async () => {
      varId = 1234;
      let result = await exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", async () => {
      varValue = true;
      let result = await exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", async () => {
      varTimeSample = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Name in payload is empty", async () => {
      varName = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Offset in payload is empty", async () => {
      varOffset = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if FCode in payload is empty", async () => {
      varFcode = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should refresh requests group", async () => {
      await exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });

    it("should not add variable to ArchiveManager if it is not archived", async () => {
      varArchived = false;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should add variable to ArchiveManager if it is archived", async () => {
      varArchived = true;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should create column of type INTEGER based on variable id", async () => {
      varArchived = true;

      let result = await exec();

      let columnName = device.ArchiveManager.getColumnNameById(result.Id);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
    });

    it("should not throw if column already exists", async () => {
      varArchived = true;

      let result = await exec();
      await device.removeVariable(result.Id);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device._createBooleanVariable(variablePayload);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).resolves.toBeDefined();
    });
  });

  describe("_createFloatVariable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varFcode;
    let varType;
    let varId;
    let varValue;
    let varClass = MBFloatVariable;
    let varArchived;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      varId = undefined;
      varType = "float";
      varTimeSample = 1;
      varName = "test variable";
      varOffset = 2;
      varFcode = 3;
      varValue = undefined;
      varArchived = false;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        value: varValue,
        archived: varArchived
      };

      return device._createFloatVariable(variablePayload);
    };

    it("should create, add to variables and return new variable ", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", async () => {
      let result = await exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", async () => {
      varId = 1234;
      let result = await exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", async () => {
      varValue = 1234.4321;
      let result = await exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", async () => {
      varTimeSample = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Name in payload is empty", async () => {
      varName = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Offset in payload is empty", async () => {
      varOffset = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if FCode in payload is empty", async () => {
      varFcode = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should refresh requests group", async () => {
      await exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });

    it("should not add variable to ArchiveManager if it is not archived", async () => {
      varArchived = false;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should add variable to ArchiveManager if it is archived", async () => {
      varArchived = true;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should create column of type REAL based on variable id", async () => {
      varArchived = true;

      let result = await exec();

      let columnName = device.ArchiveManager.getColumnNameById(result.Id);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "REAL"
      );

      expect(columnExists).toBeTruthy();
    });
    it("should not throw if column already exists", async () => {
      varArchived = true;

      let result = await exec();
      await device.removeVariable(result.Id);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device._createFloatVariable(variablePayload);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).resolves.toBeDefined();
    });
  });

  describe("_createSwappedFloatVariable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varFcode;
    let varType;
    let varId;
    let varValue;
    let varClass = MBSwappedFloatVariable;
    let varArchived;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      varId = undefined;
      varType = "swappedFloat";
      varTimeSample = 1;
      varName = "test variable";
      varOffset = 2;
      varFcode = 3;
      varValue = undefined;
      varArchived = false;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        value: varValue,
        archived: varArchived
      };

      return device._createSwappedFloatVariable(variablePayload);
    };

    it("should create, add to variables and return new variable ", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", async () => {
      let result = await exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", async () => {
      varId = 1234;
      let result = await exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", async () => {
      varValue = 1234.4321;
      let result = await exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", async () => {
      varTimeSample = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Name in payload is empty", async () => {
      varName = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Offset in payload is empty", async () => {
      varOffset = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if FCode in payload is empty", async () => {
      varFcode = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should refresh requests group", async () => {
      await exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });

    it("should not add variable to ArchiveManager if it is not archived", async () => {
      varArchived = false;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should add variable to ArchiveManager if it is archived", async () => {
      varArchived = true;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should create column of type REAL based on variable id", async () => {
      varArchived = true;

      let result = await exec();

      let columnName = device.ArchiveManager.getColumnNameById(result.Id);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "REAL"
      );

      expect(columnExists).toBeTruthy();
    });
    it("should not throw if column already exists", async () => {
      varArchived = true;

      let result = await exec();
      await device.removeVariable(result.Id);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device._createSwappedFloatVariable(variablePayload);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).resolves.toBeDefined();
    });
  });

  describe("_createInt32Variable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varFcode;
    let varType;
    let varId;
    let varValue;
    let varClass = MBInt32Variable;
    let varArchived;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      varId = undefined;
      varType = "int32";
      varTimeSample = 1;
      varName = "test variable";
      varOffset = 2;
      varFcode = 3;
      varValue = undefined;
      varArchived = false;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        value: varValue,
        archived: varArchived
      };

      return device._createInt32Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", async () => {
      let result = await exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", async () => {
      varId = 1234;
      let result = await exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", async () => {
      varValue = 1234;
      let result = await exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", async () => {
      varTimeSample = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Name in payload is empty", async () => {
      varName = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Offset in payload is empty", async () => {
      varOffset = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if FCode in payload is empty", async () => {
      varFcode = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should refresh requests group", async () => {
      await exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });

    it("should not add variable to ArchiveManager if it is not archived", async () => {
      varArchived = false;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should add variable to ArchiveManager if it is archived", async () => {
      varArchived = true;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should create column of type INTEGER based on variable id", async () => {
      varArchived = true;

      let result = await exec();

      let columnName = device.ArchiveManager.getColumnNameById(result.Id);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
    });
    it("should not throw if column already exists", async () => {
      varArchived = true;

      let result = await exec();
      await device.removeVariable(result.Id);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device._createInt32Variable(variablePayload);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).resolves.toBeDefined();
    });
  });

  describe("_createSwappedInt32Variable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varFcode;
    let varType;
    let varId;
    let varValue;
    let varClass = MBSwappedInt32Variable;
    let varArchived;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      varId = undefined;
      varType = "swappedInt32";
      varTimeSample = 1;
      varName = "test variable";
      varOffset = 2;
      varFcode = 3;
      varValue = undefined;
      varArchived = false;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        value: varValue,
        archived: varArchived
      };

      return device._createSwappedInt32Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", async () => {
      let result = await exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", async () => {
      varId = 1234;
      let result = await exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", async () => {
      varValue = 1234;
      let result = await exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", async () => {
      varTimeSample = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Name in payload is empty", async () => {
      varName = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Offset in payload is empty", async () => {
      varOffset = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if FCode in payload is empty", async () => {
      varFcode = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should refresh requests group", async () => {
      await exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });

    it("should not add variable to ArchiveManager if it is not archived", async () => {
      varArchived = false;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should add variable to ArchiveManager if it is archived", async () => {
      varArchived = true;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should create column of type INTEGER based on variable id", async () => {
      varArchived = true;

      let result = await exec();

      let columnName = device.ArchiveManager.getColumnNameById(result.Id);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
    });
    it("should not throw if column already exists", async () => {
      varArchived = true;

      let result = await exec();
      await device.removeVariable(result.Id);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device._createSwappedInt32Variable(variablePayload);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).resolves.toBeDefined();
    });
  });

  describe("_createUInt32Variable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varFcode;
    let varType;
    let varId;
    let varValue;
    let varClass = MBUInt32Variable;
    let varArchived;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      varId = undefined;
      varType = "int32";
      varTimeSample = 1;
      varName = "test variable";
      varOffset = 2;
      varFcode = 3;
      varValue = undefined;
      varArchived = false;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        value: varValue,
        archived: varArchived
      };

      return device._createUInt32Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", async () => {
      let result = await exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", async () => {
      varId = 1234;
      let result = await exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", async () => {
      varValue = 1234;
      let result = await exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", async () => {
      varTimeSample = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Name in payload is empty", async () => {
      varName = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Offset in payload is empty", async () => {
      varOffset = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if FCode in payload is empty", async () => {
      varFcode = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should refresh requests group", async () => {
      await exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });

    it("should not add variable to ArchiveManager if it is not archived", async () => {
      varArchived = false;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should add variable to ArchiveManager if it is archived", async () => {
      varArchived = true;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should create column of type INTEGER based on variable id", async () => {
      varArchived = true;

      let result = await exec();

      let columnName = device.ArchiveManager.getColumnNameById(result.Id);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
    });
    it("should not throw if column already exists", async () => {
      varArchived = true;

      let result = await exec();
      await device.removeVariable(result.Id);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device._createUInt16Variable(variablePayload);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).resolves.toBeDefined();
    });
  });

  describe("_createSwappedUInt32Variable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varFcode;
    let varType;
    let varId;
    let varValue;
    let varClass = MBSwappedUInt32Variable;
    let varArchived;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      varId = undefined;
      varType = "swappedUInt32";
      varTimeSample = 1;
      varName = "test variable";
      varOffset = 2;
      varFcode = 3;
      varValue = undefined;
      varArchived = false;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        value: varValue,
        archived: varArchived
      };

      return device._createSwappedUInt32Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", async () => {
      let result = await exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", async () => {
      varId = 1234;
      let result = await exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", async () => {
      varValue = 1234;
      let result = await exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", async () => {
      varTimeSample = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Name in payload is empty", async () => {
      varName = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Offset in payload is empty", async () => {
      varOffset = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if FCode in payload is empty", async () => {
      varFcode = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should refresh requests group", async () => {
      await exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });

    it("should not add variable to ArchiveManager if it is not archived", async () => {
      varArchived = false;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should add variable to ArchiveManager if it is archived", async () => {
      varArchived = true;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should create column of type INTEGER based on variable id", async () => {
      varArchived = true;

      let result = await exec();

      let columnName = device.ArchiveManager.getColumnNameById(result.Id);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
    });
    it("should not throw if column already exists", async () => {
      varArchived = true;

      let result = await exec();
      await device.removeVariable(result.Id);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device._createSwappedUInt32Variable(variablePayload);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).resolves.toBeDefined();
    });
  });

  describe("_createInt16Variable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varFcode;
    let varType;
    let varId;
    let varValue;
    let varClass = MBInt16Variable;
    let varArchived;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      varId = undefined;
      varType = "int16";
      varTimeSample = 1;
      varName = "test variable";
      varOffset = 2;
      varFcode = 3;
      varValue = undefined;
      varArchived = false;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        value: varValue,
        archived: varArchived
      };

      return device._createInt16Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", async () => {
      let result = await exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(1);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", async () => {
      varId = 1234;
      let result = await exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", async () => {
      varValue = 1234;
      let result = await exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", async () => {
      varTimeSample = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Name in payload is empty", async () => {
      varName = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Offset in payload is empty", async () => {
      varOffset = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if FCode in payload is empty", async () => {
      varFcode = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should refresh requests group", async () => {
      await exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });

    it("should not add variable to ArchiveManager if it is not archived", async () => {
      varArchived = false;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should add variable to ArchiveManager if it is archived", async () => {
      varArchived = true;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should create column of type INTEGER based on variable id", async () => {
      varArchived = true;

      let result = await exec();

      let columnName = device.ArchiveManager.getColumnNameById(result.Id);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
    });
    it("should not throw if column already exists", async () => {
      varArchived = true;

      let result = await exec();
      await device.removeVariable(result.Id);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device._createInt16Variable(variablePayload);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).resolves.toBeDefined();
    });
  });

  describe("_createUInt16Variable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varFcode;
    let varType;
    let varId;
    let varValue;
    let varClass = MBUInt16Variable;
    let varArchived;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      varId = undefined;
      varType = "int16";
      varTimeSample = 1;
      varName = "test variable";
      varOffset = 2;
      varFcode = 3;
      varValue = undefined;
      varArchived = false;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        value: varValue,
        archived: varArchived
      };

      return device._createUInt16Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", async () => {
      let result = await exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(1);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", async () => {
      varId = 1234;
      let result = await exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", async () => {
      varValue = 1234;
      let result = await exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", async () => {
      varTimeSample = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Name in payload is empty", async () => {
      varName = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Offset in payload is empty", async () => {
      varOffset = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if FCode in payload is empty", async () => {
      varFcode = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should refresh requests group", async () => {
      await exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });

    it("should not add variable to ArchiveManager if it is not archived", async () => {
      varArchived = false;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should add variable to ArchiveManager if it is archived", async () => {
      varArchived = true;

      let result = await exec();
      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should create column of type INTEGER based on variable id", async () => {
      varArchived = true;

      let result = await exec();

      let columnName = device.ArchiveManager.getColumnNameById(result.Id);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
    });

    it("should not throw if column already exists", async () => {
      varArchived = true;

      let result = await exec();
      await device.removeVariable(result.Id);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device._createUInt16Variable(variablePayload);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).resolves.toBeDefined();
    });
  });

  describe("_createByteArrayVariable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varFcode;
    let varType;
    let varLength;
    let varId;
    let varValue;
    let varClass = MBByteArrayVariable;
    let varArchived;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      varId = undefined;
      varType = "byteArray";
      varTimeSample = 1;
      varName = "test variable";
      varOffset = 2;
      varFcode = 3;
      varLength = 4;
      varValue = undefined;
      varArchived = false;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        length: varLength,
        value: varValue,
        archived: varArchived
      };

      return device._createByteArrayVariable(variablePayload);
    };

    it("should create, add to variables and return new variable ", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", async () => {
      let result = await exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(varLength);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", async () => {
      varId = 1234;
      let result = await exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", async () => {
      varValue = [1, 2, 3, 4, 5, 6, 7, 8];
      let result = await exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", async () => {
      varTimeSample = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Name in payload is empty", async () => {
      varName = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Offset in payload is empty", async () => {
      varOffset = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if FCode in payload is empty", async () => {
      varFcode = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if Length in payload is empty", async () => {
      varLength = undefined;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should refresh requests group", async () => {
      await exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });

    it("should not set archived to true even if it is set in payload", async () => {
      varArchived = true;

      let result = await exec();

      expect(result.Archived).toBeFalsy();
    });

    it("should not create new column even if archived is set in payload", async () => {
      varArchived = true;

      let result = await exec();

      let columnName = device.ArchiveManager.getColumnNameById(result.Id);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeFalsy();
    });
  });

  describe("_createSumElement", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;

    let calculationElement1Id;
    let calculationElement1Type;
    let calculationElement1Payload;
    let calculationElement1Archived;
    let calculationElement1Name;
    let calculationElement1SampleTime;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;

      calculationElement1Id = "0001";
      calculationElement1Type = "sumElement";
      calculationElement1Archived = true;
      calculationElement1Name = "test sum element";
      calculationElement1SampleTime = 5;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);

      calculationElement1Payload = {
        id: calculationElement1Id,
        type: calculationElement1Type,
        archived: calculationElement1Archived,
        name: calculationElement1Name,
        sampleTime: calculationElement1SampleTime
      };

      return device._createSumElement(calculationElement1Payload);
    };

    it("should add sumElement to device", async () => {
      let result = await exec();

      expect(device.CalculationElements[calculationElement1Id]).toEqual(result);
    });

    it("should create and return sumElement according to its payload", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(calculationElement1Id);
      expect(result.Name).toEqual(calculationElement1Name);
      expect(result.TypeName).toEqual(calculationElement1Type);
      expect(result.Archived).toEqual(calculationElement1Archived);
      expect(result.Value).toEqual(0);
    });

    it("should create column in database if archived is true", async () => {
      let result = await exec();

      let databaseFileName = device.ArchiveManager.FilePath;
      let columnName = device.ArchiveManager.getColumnNameById(
        calculationElement1Id
      );
      let columnType = device.ArchiveManager.getColumnTypeCalculationElement(
        result
      );

      let columnExists = await checkIfColumnExists(
        databaseFileName,
        "data",
        columnName,
        columnType
      );

      expect(columnExists).toBeTruthy();
    });

    it("should add sumElement to ArchiveManager if archived is true", async () => {
      let result = await exec();

      expect(
        device.ArchiveManager.CalculationElements[calculationElement1Id]
      ).toEqual(result);
    });

    it("should not create column in database if archived is true", async () => {
      calculationElement1Archived = false;
      let result = await exec();

      let databaseFileName = device.ArchiveManager.FilePath;
      let columnName = device.ArchiveManager.getColumnNameById(
        calculationElement1Id
      );
      let columnType = device.ArchiveManager.getColumnTypeCalculationElement(
        result
      );

      let columnExists = await checkIfColumnExists(
        databaseFileName,
        "data",
        columnName,
        columnType
      );

      expect(columnExists).toBeFalsy();
    });

    it("should not add sumElement to ArchiveManager if archived is true", async () => {
      calculationElement1Archived = false;
      let result = await exec();

      expect(
        device.ArchiveManager.CalculationElements[calculationElement1Id]
      ).not.toBeDefined();
    });
  });

  describe("createVariable", () => {
    let name;
    let device;
    let payload;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varLength;
    let varFcode;
    let varType;
    let _createBooleanVariableMockFunc;
    let _createByteArrayVariableMockFunc;
    let _createFloatVariableMockFunc;
    let _createSwappedFloatVariableMockFunc;
    let _createInt16VariableMockFunc;
    let _createUInt16VariableMockFunc;
    let _createInt32VariableMockFunc;
    let _createUInt32VariableMockFunc;
    let _createSwappedInt32VariableMockFunc;
    let _createSwappedUInt32VariableMockFunc;

    let _createBooleanVariableMockFuncResult;
    let _createByteArrayVariableMockFuncResult;
    let _createFloatVariableMockFuncResult;
    let _createSwappedFloatVariableMockFuncResult;
    let _createInt16VariableMockFuncResult;
    let _createUInt16VariableMockFuncResult;
    let _createInt32VariableMockFuncResult;
    let _createUInt32VariableMockFuncResult;
    let _createSwappedInt32VariableMockFuncResult;
    let _createSwappedUInt32VariableMockFuncResult;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();
      varTimeSample = 2;
      varName = "test variable";
      varOffset = 5;
      varLength = 123;
      varFcode = 3;
      varType = "boolean";
      _createBooleanVariableMockFuncResult = "some value boolean";
      _createByteArrayVariableMockFuncResult = "some value byte array";
      _createFloatVariableMockFuncResult = "some value float";
      _createSwappedFloatVariableMockFuncResult = "some value swapped float";
      _createInt16VariableMockFuncResult = "some value int16";
      _createUInt16VariableMockFuncResult = "some value uin16";
      _createInt32VariableMockFuncResult = "some value int32";
      _createUInt32VariableMockFuncResult = "some value uin32";
      _createSwappedInt32VariableMockFuncResult = "some value swapped int32";
      _createSwappedUInt32VariableMockFuncResult = "some value swapped uin32";

      _createBooleanVariableMockFunc = jest
        .fn()
        .mockReturnValue(_createBooleanVariableMockFuncResult);
      _createByteArrayVariableMockFunc = jest
        .fn()
        .mockReturnValue(_createByteArrayVariableMockFuncResult);
      _createFloatVariableMockFunc = jest
        .fn()
        .mockReturnValue(_createFloatVariableMockFuncResult);
      _createSwappedFloatVariableMockFunc = jest
        .fn()
        .mockReturnValue(_createSwappedFloatVariableMockFuncResult);
      _createInt16VariableMockFunc = jest
        .fn()
        .mockReturnValue(_createInt16VariableMockFuncResult);
      _createUInt16VariableMockFunc = jest
        .fn()
        .mockReturnValue(_createUInt16VariableMockFuncResult);
      _createInt32VariableMockFunc = jest
        .fn()
        .mockReturnValue(_createInt32VariableMockFuncResult);
      _createUInt32VariableMockFunc = jest
        .fn()
        .mockReturnValue(_createUInt32VariableMockFuncResult);
      _createSwappedInt32VariableMockFunc = jest
        .fn()
        .mockReturnValue(_createSwappedInt32VariableMockFuncResult);
      _createSwappedUInt32VariableMockFunc = jest
        .fn()
        .mockReturnValue(_createSwappedUInt32VariableMockFuncResult);
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);

      variablePayload = {
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        length: varLength
      };

      device._createBooleanVariable = _createBooleanVariableMockFunc;
      device._createByteArrayVariable = _createByteArrayVariableMockFunc;
      device._createFloatVariable = _createFloatVariableMockFunc;
      device._createSwappedFloatVariable = _createSwappedFloatVariableMockFunc;
      device._createInt16Variable = _createInt16VariableMockFunc;
      device._createUInt16Variable = _createUInt16VariableMockFunc;
      device._createInt32Variable = _createInt32VariableMockFunc;
      device._createUInt32Variable = _createUInt32VariableMockFunc;
      device._createSwappedInt32Variable = _createSwappedInt32VariableMockFunc;
      device._createSwappedUInt32Variable = _createSwappedUInt32VariableMockFunc;

      return device.createVariable(variablePayload);
    };

    it("should create and return boolean variable if payload type is boolean", async () => {
      varType = "boolean";
      let result = await exec();

      expect(_createBooleanVariableMockFunc).toHaveBeenCalledTimes(1);
      expect(_createByteArrayVariableMockFunc).not.toHaveBeenCalled();
      expect(_createFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedUInt32VariableMockFunc).not.toHaveBeenCalled();

      expect(_createBooleanVariableMockFunc.mock.calls[0][0]).toEqual(
        variablePayload
      );

      expect(result).toEqual(_createBooleanVariableMockFuncResult);
    });

    it("should create and return byteArray variable if payload type is boolean", async () => {
      varType = "byteArray";
      let result = await exec();

      expect(_createBooleanVariableMockFunc).not.toHaveBeenCalled();
      expect(_createByteArrayVariableMockFunc).toHaveBeenCalledTimes(1);
      expect(_createFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedUInt32VariableMockFunc).not.toHaveBeenCalled();

      expect(_createByteArrayVariableMockFunc.mock.calls[0][0]).toEqual(
        variablePayload
      );
      expect(result).toEqual(_createByteArrayVariableMockFuncResult);
    });

    it("should create and return float variable if payload type is boolean", async () => {
      varType = "float";
      let result = await exec();

      expect(_createBooleanVariableMockFunc).not.toHaveBeenCalled();
      expect(_createByteArrayVariableMockFunc).not.toHaveBeenCalled();
      expect(_createFloatVariableMockFunc).toHaveBeenCalledTimes(1);
      expect(_createSwappedFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedUInt32VariableMockFunc).not.toHaveBeenCalled();

      expect(_createFloatVariableMockFunc.mock.calls[0][0]).toEqual(
        variablePayload
      );
      expect(result).toEqual(_createFloatVariableMockFuncResult);
    });

    it("should create and return int16 variable if payload type is boolean", async () => {
      varType = "int16";
      let result = await exec();

      expect(_createBooleanVariableMockFunc).not.toHaveBeenCalled();
      expect(_createByteArrayVariableMockFunc).not.toHaveBeenCalled();
      expect(_createFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt16VariableMockFunc).toHaveBeenCalledTimes(1);
      expect(_createUInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedUInt32VariableMockFunc).not.toHaveBeenCalled();

      expect(_createInt16VariableMockFunc.mock.calls[0][0]).toEqual(
        variablePayload
      );
      expect(result).toEqual(_createInt16VariableMockFuncResult);
    });

    it("should create and return int32 variable if payload type is boolean", async () => {
      varType = "int32";
      let result = await exec();

      expect(_createBooleanVariableMockFunc).not.toHaveBeenCalled();
      expect(_createByteArrayVariableMockFunc).not.toHaveBeenCalled();
      expect(_createFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt32VariableMockFunc).toHaveBeenCalledTimes(1);
      expect(_createUInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedUInt32VariableMockFunc).not.toHaveBeenCalled();

      expect(_createInt32VariableMockFunc.mock.calls[0][0]).toEqual(
        variablePayload
      );
      expect(result).toEqual(_createInt32VariableMockFuncResult);
    });

    it("should create and return swapped float variable if payload type is boolean", async () => {
      varType = "swappedFloat";
      let result = await exec();

      expect(_createBooleanVariableMockFunc).not.toHaveBeenCalled();
      expect(_createByteArrayVariableMockFunc).not.toHaveBeenCalled();
      expect(_createFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedFloatVariableMockFunc).toHaveBeenCalledTimes(1);
      expect(_createInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedUInt32VariableMockFunc).not.toHaveBeenCalled();

      expect(_createSwappedFloatVariableMockFunc.mock.calls[0][0]).toEqual(
        variablePayload
      );
      expect(result).toEqual(_createSwappedFloatVariableMockFuncResult);
    });

    it("should create and return swapped int32 variable if payload type is boolean", async () => {
      varType = "swappedInt32";
      let result = await exec();

      expect(_createBooleanVariableMockFunc).not.toHaveBeenCalled();
      expect(_createByteArrayVariableMockFunc).not.toHaveBeenCalled();
      expect(_createFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedInt32VariableMockFunc).toHaveBeenCalledTimes(1);
      expect(_createSwappedUInt32VariableMockFunc).not.toHaveBeenCalled();

      expect(_createSwappedInt32VariableMockFunc.mock.calls[0][0]).toEqual(
        variablePayload
      );
      expect(result).toEqual(_createSwappedInt32VariableMockFuncResult);
    });

    it("should create and return swapped uint32 variable if payload type is boolean", async () => {
      varType = "swappedUInt32";
      let result = await exec();

      expect(_createBooleanVariableMockFunc).not.toHaveBeenCalled();
      expect(_createByteArrayVariableMockFunc).not.toHaveBeenCalled();
      expect(_createFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedUInt32VariableMockFunc).toHaveBeenCalledTimes(1);

      expect(_createSwappedUInt32VariableMockFunc.mock.calls[0][0]).toEqual(
        variablePayload
      );
      expect(result).toEqual(_createSwappedUInt32VariableMockFuncResult);
    });

    it("should create and return uint16 variable if payload type is boolean", async () => {
      varType = "uInt16";
      let result = await exec();

      expect(_createBooleanVariableMockFunc).not.toHaveBeenCalled();
      expect(_createByteArrayVariableMockFunc).not.toHaveBeenCalled();
      expect(_createFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt16VariableMockFunc).toHaveBeenCalledTimes(1);
      expect(_createInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedUInt32VariableMockFunc).not.toHaveBeenCalled();

      expect(_createUInt16VariableMockFunc.mock.calls[0][0]).toEqual(
        variablePayload
      );
      expect(result).toEqual(_createUInt16VariableMockFuncResult);
    });

    it("should create and return uint32 variable if payload type is boolean", async () => {
      varType = "uInt32";
      let result = await exec();

      expect(_createBooleanVariableMockFunc).not.toHaveBeenCalled();
      expect(_createByteArrayVariableMockFunc).not.toHaveBeenCalled();
      expect(_createFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedFloatVariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt16VariableMockFunc).not.toHaveBeenCalled();
      expect(_createInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createUInt32VariableMockFunc).toHaveBeenCalledTimes(1);
      expect(_createSwappedInt32VariableMockFunc).not.toHaveBeenCalled();
      expect(_createSwappedUInt32VariableMockFunc).not.toHaveBeenCalled();

      expect(_createUInt32VariableMockFunc.mock.calls[0][0]).toEqual(
        variablePayload
      );
      expect(result).toEqual(_createUInt32VariableMockFuncResult);
    });

    it("should throw if payload.type is not recognized", async () => {
      varType = "unrecognizedType";

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if payload is empty", async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device.createVariable();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if payload.type is empty", async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device.createVariable({});
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if varaible with given id already", async () => {
      payload.id = "1234";
      device.Variables["1234"] = "already defined variable";
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device.createVariable(payload);
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("addVariable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variableId;
    let variableName;
    let variableType;
    let variableArchived;
    let variable;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();
      variableId = 1234;
      variableName = "test variable";
      variableType = "int32";
      variableArchived = true;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variable = {
        Id: variableId,
        Name: variableName,
        Archived: variableArchived,
        Type: variableType
      };

      return device.addVariable(variable);
    };

    it("should add variable to variables", async () => {
      await exec();

      expect(device.Variables[variableId]).toBeDefined();
      expect(device.Variables[variableId]).toEqual(variable);
    });

    it("should add variable to archive manager if archived is set to true", async () => {
      await exec();

      expect(
        device.ArchiveManager.doesVariableIdExists(variableId)
      ).toBeTruthy();
    });

    it("should not add variable to archive manager if archived is set to false", async () => {
      variableArchived = false;

      await exec();

      expect(
        device.ArchiveManager.doesVariableIdExists(variableId)
      ).toBeFalsy();
    });

    it("should add variable again after it was deleted", async () => {
      await exec();
      await device.removeVariable(variable.Id);
      await device.addVariable(variable);
      expect(device.Variables[variableId]).toBeDefined();
      expect(device.Variables[variableId]).toEqual(variable);
    });

    it("should replace given variable if name already existis", async () => {
      await exec();
      let newVariable = { Id: variableId, Name: "new" };

      await device.addVariable(newVariable);
      expect(device.Variables[variableId]).not.toEqual(variable);
      expect(device.Variables[variableId]).toEqual(newVariable);
    });

    it("should call refresh groups after adding variable", async () => {
      await exec();

      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("removeVariable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variableId;
    let variableName;
    let variable;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();
      variableId = 1234;
      variableName = "test variable";
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variable = {
        Id: variableId,
        Name: variableName
      };

      await device.addVariable(variable);

      return device.removeVariable(variableId);
    };

    it("should remove variable from variables", async () => {
      await exec();

      expect(device.Variables[variableId]).not.toBeDefined();
    });

    it("should return removed variable", async () => {
      let result = await exec();

      expect(result).toEqual(variable);
    });

    it("should remove variable from archive manager", async () => {
      await exec();

      expect(
        device.ArchiveManager.doesVariableIdExists(variableId)
      ).toBeFalsy();
    });

    it("should throw if there is no variable of such id", async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variable = {
        Id: variableId,
        Name: variableName
      };

      await device.addVariable(variable);

      let newVariable = { Id: "new test name" };

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device.removeVariable(newVariable);
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should call refresh groups after adding variable", async () => {
      await exec();

      //First time while adding second while removing
      expect(refreshGroupMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("editVariable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;

    let variablePayload;
    let varTimeSample;
    let varName;
    let varOffset;
    let varFcode;
    let varType;
    let varId;
    let varValue;
    let varArchived;
    let variable;

    let editVariablePayload;
    let editVarTimeSample;
    let editVarName;
    let editVarOffset;
    let editVarFcode;
    let editVarId;
    let editVarValue;
    let editVarArchived;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      varId = 1234;
      varType = "int16";
      varTimeSample = 1;
      varName = "test variable";
      varOffset = 2;
      varFcode = 3;
      varValue = 123;
      varArchived = false;

      editVarId = undefined;
      editVarTimeSample = 2;
      editVarName = "test variable2";
      editVarOffset = 3;
      editVarFcode = 4;
      editVarValue = 321;
      editVarArchived = true;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId,
        archived: varArchived
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        value: varValue
      };

      variable = await device.createVariable(variablePayload);

      editVariablePayload = {
        id: editVarId,
        timeSample: editVarTimeSample,
        name: editVarName,
        offset: editVarOffset,
        fCode: editVarFcode,
        value: editVarValue,
        archived: editVarArchived
      };

      return device.editVariable(varId, editVariablePayload);
    };

    it("should create and return new variable based on payload and assing it in device - instead of previous one ", async () => {
      let result = await exec();

      let editedVariable = device.Variables[varId];
      expect(editedVariable).toBeDefined();
      expect(editedVariable).not.toEqual(variable);

      expect(editedVariable.TimeSample).toEqual(editVarTimeSample);
      expect(editedVariable.Name).toEqual(editVarName);
      expect(editedVariable.Offset).toEqual(editVarOffset);
      expect(editedVariable.FCode).toEqual(editVarFcode);
      expect(editedVariable.Value).toEqual(editVarValue);

      expect(editedVariable.Events).toEqual(variable.Events);

      expect(editedVariable instanceof MBInt16Variable).toBeTruthy();

      expect(result).toEqual(editedVariable);
    });

    it("should remove old variable from ArchiveManager and add new one - if varaible is archived", async () => {
      varArchived = true;
      let result = await exec();

      let editedVariable = device.Variables[varId];
      expect(device.ArchiveManager.doesVariableIdExists(varId)).toBeTruthy();

      expect(Object.values(device.ArchiveManager.Variables)).toContain(
        editedVariable
      );
      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        variable
      );
    });

    it("should remove old variable from ArchiveManager and add not add new one - if edited varaible is not archived", async () => {
      varArchived = true;
      editVarArchived = false;

      let result = await exec();

      let editedVariable = device.Variables[varId];
      expect(device.ArchiveManager.doesVariableIdExists(varId)).toBeFalsy();

      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        editedVariable
      );
      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        variable
      );
    });

    it("should create new column in database in case new variable archived is true", async () => {
      editVarArchived = true;

      await exec();

      let columnName = device.ArchiveManager.getColumnNameById(varId);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
    });

    it("should not create new column in database in case new variable archived is true", async () => {
      editVarArchived = false;

      await exec();

      let columnName = device.ArchiveManager.getColumnNameById(varId);
      let columnExists = await checkIfColumnExists(
        device.ArchiveManager.FilePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeFalsy();
    });

    it("should throw if there is no variable of given id", async () => {
      await exec();

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device.editVariable(8765, editVariablePayload);
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should not set id to new if it exists in payload", async () => {
      editVarId = 8765;

      await exec();

      let editedVariable = device.Variables[varId];
      expect(editedVariable).toBeDefined();
      expect(editedVariable).not.toEqual(variable);
      expect(editedVariable.Id).toEqual(varId);
    });

    it("should call refresh groups", async () => {
      await exec();

      //Three times - first time addding variable second removing while editing, thrid - adding new generated variable
      expect(refreshGroupMock).toHaveBeenCalledTimes(3);
    });
  });

  describe("getVariable", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let refreshGroupMock;
    let variableId;
    let variableName;
    let variable;

    let getVariableId;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();
      variableId = 1234;
      variableName = "test variable";
      getVariableId = variableId;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variable = {
        Id: variableId,
        Name: variableName
      };

      await device.addVariable(variable);

      return device.getVariable(getVariableId);
    };

    it("should return variable of given id", async () => {
      let result = await exec();

      expect(result).toEqual(variable);
    });

    it("should not throw but return undefined if there is no variable of given id", async () => {
      getVariableId = "8765";

      let result;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            result = await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      expect(result).not.toBeDefined();
    });
  });

  describe("editWithPayload", () => {
    let device;
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let type;
    let payload;
    let variables;
    let initVariablesMockFunc;
    let createVariablesMockFunc;
    let realInitVariableFunc;
    let realCreateVariablesMockFunc;
    let isActive;

    let connectMockFunc;
    let disconnectMockFunc;
    let refreshGroupMockFunc;

    let editedName;
    let editedIpAdress;
    let editedPortNumber;
    let editedTimeout;
    let editedUnitId;
    let editedType;
    let editedVariables;
    let editedPayload;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      isActive = false;
      variables = [
        { Id: "var1", Name: "name1", Payload: { Id: "var1", Name: "name1" } },
        { Id: "var2", Name: "name2", Payload: { Id: "var2", Name: "name2" } },
        { Id: "var3", Name: "name3", Payload: { Id: "var3", Name: "name3" } }
      ];
      type = "test type";

      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId,
        variables: variables,
        type: type
      };

      refreshGroupMockFunc = jest.fn();
      connectMockFunc = jest.fn();
      disconnectMockFunc = jest.fn();

      initVariablesMockFunc = function(variablesToAdd) {
        this.Variables = [];

        for (let variable of variablesToAdd) {
          this.Variables[variable.Id] = variable;
        }
      };

      createVariablesMockFunc = function(payload) {
        this.Variables[payload.Id] = payload;
      };

      realInitVariableFunc = MBDevice.prototype._initVariables;
      realCreateVariablesMockFunc = MBDevice.prototype.createVariable;

      MBDevice.prototype._initVariables = initVariablesMockFunc;
      MBDevice.prototype.createVariable = createVariablesMockFunc;

      device = new MBDevice();
      await device.init(payload);
      device._refreshRequestGroups = refreshGroupMockFunc;
      device.connect = connectMockFunc;
      device.disconnect = disconnectMockFunc;

      editedName = "test name";
      editedIpAdress = "192.168.1.10";
      editedPortNumber = 503;
      editedTimeout = 3000;
      editedUnitId = 4;
      editedVariables = undefined;
      editedType = undefined;
    });

    afterEach(() => {
      MBDevice.prototype._initVariables = realInitVariableFunc;
      MBDevice.prototype.createVariable = realCreateVariablesMockFunc;
    });

    let exec = async () => {
      device._driver._active = isActive;

      editedPayload = {
        name: editedName,
        ipAdress: editedIpAdress,
        portNumber: editedPortNumber,
        timeout: editedTimeout,
        unitId: editedUnitId,
        variables: editedVariables,
        type: editedType
      };
      return device.editWithPayload(editedPayload);
    };

    it("should edit device based on given payload", async () => {
      await exec();
      expect(device.IPAdress).toEqual(editedIpAdress);
      expect(device.Name).toEqual(editedName);
      expect(device.PortNumber).toEqual(editedPortNumber);
      expect(device.Timeout).toEqual(editedTimeout);
      expect(device.UnitId).toEqual(editedUnitId);
    });

    it("should not edit variables if variables in payload are undefined", async () => {
      await exec();
      expect(device.Variables).toBeDefined();
      expect(Object.keys(device.Variables).length).toEqual(3);
      expect(device.Variables["var1"]).toMatchObject({
        Id: "var1",
        Name: "name1"
      });
      expect(device.Variables["var2"]).toMatchObject({
        Id: "var2",
        Name: "name2"
      });
      expect(device.Variables["var3"]).toMatchObject({
        Id: "var3",
        Name: "name3"
      });
    });

    it("should not edit variables if variables in payload are defined", async () => {
      editedVariables = [
        { Id: "var4", Name: "name4" },
        { Id: "var5", Name: "name5" },
        { Id: "var6", Name: "name6" }
      ];

      await exec();
      expect(device.Variables).toBeDefined();
      expect(Object.keys(device.Variables).length).toEqual(3);
      expect(device.Variables["var1"]).toMatchObject({
        Id: "var1",
        Name: "name1"
      });
      expect(device.Variables["var2"]).toMatchObject({
        Id: "var2",
        Name: "name2"
      });
      expect(device.Variables["var3"]).toMatchObject({
        Id: "var3",
        Name: "name3"
      });
    });

    it("should not edit type if type in payload is undefined", async () => {
      editedType = undefined;
      await exec();
      expect(device.Type).toBeDefined();
      expect(device.Type).toEqual(type);
    });

    it("should not edit type if type in payload is defined", async () => {
      editedType = "new test type";
      await exec();
      expect(device.Type).toBeDefined();
      expect(device.Type).toEqual(type);
    });

    it("should not disconnect if device is not active", async () => {
      isActive = false;
      await exec();
      expect(disconnectMockFunc).not.toHaveBeenCalled();
    });

    it("should call disconnect if device is active", async () => {
      isActive = true;
      await exec();
      expect(disconnectMockFunc).toHaveBeenCalledTimes(1);
    });

    it("should not connect if device is not active", async () => {
      isActive = false;
      await exec();
      expect(connectMockFunc).not.toHaveBeenCalled();
    });

    it("should call connect if device is active", async () => {
      isActive = true;
      await exec();
      expect(connectMockFunc).toHaveBeenCalledTimes(1);
    });

    it("should call disconnect before connect if device is active", async () => {
      isActive = true;
      await exec();
      expect(disconnectMockFunc).toHaveBeenCalledBefore(connectMockFunc);

      //For every removed variable and once after that
      expect(refreshGroupMockFunc).toHaveBeenCalledTimes(4);
    });

    it("should not call connect or disconnect if device is active and ipAdress, portNumber, unitId and timeout are undefined - but change other attributes", async () => {
      isActive = true;
      editedIpAdress = undefined;
      editedPortNumber = undefined;
      editedTimeout = undefined;
      editedUnitId = undefined;

      await exec();
      expect(connectMockFunc).not.toHaveBeenCalled();
      expect(disconnectMockFunc).not.toHaveBeenCalled();
      expect(device.Name).toEqual(editedName);

      //For every removed variable and once after that
      expect(refreshGroupMockFunc).not.toHaveBeenCalled();
    });

    it("should call connect and disconnect and refreshGroups and create new MBDriver if device is active and at least ipAdress is defined - and change other attributes", async () => {
      let prevMBDriver = device.MBDriver;
      isActive = true;
      editedIpAdress = "192.168.1.1";
      editedPortNumber = undefined;
      editedTimeout = undefined;
      editedUnitId = undefined;

      await exec();
      expect(connectMockFunc).toHaveBeenCalledTimes(1);
      expect(disconnectMockFunc).toHaveBeenCalledTimes(1);
      expect(device.Name).toEqual(editedName);

      expect(prevMBDriver).toBeDefined();
      expect(device.MBDriver).toBeDefined();
      expect(device.MBDriver).not.toEqual(prevMBDriver);

      //For every removed variable and once after that
      expect(refreshGroupMockFunc).toHaveBeenCalledTimes(4);
    });

    it("should call connect and disconnect and refreshGroups create new MBDriver if device is active and at least ipAdress is defined - and change other attributes", async () => {
      let prevMBDriver = device.MBDriver;
      isActive = true;
      editedIpAdress = "192.168.1.1";
      editedPortNumber = undefined;
      editedTimeout = undefined;
      editedUnitId = undefined;

      await exec();
      expect(connectMockFunc).toHaveBeenCalledTimes(1);
      expect(disconnectMockFunc).toHaveBeenCalledTimes(1);
      expect(device.Name).toEqual(editedName);

      expect(prevMBDriver).toBeDefined();
      expect(device.MBDriver).toBeDefined();
      expect(device.MBDriver).not.toEqual(prevMBDriver);

      //For every removed variable and once after that
      expect(refreshGroupMockFunc).toHaveBeenCalledTimes(4);
    });

    it("should call connect and disconnect and refreshGroups create new MBDriver if device is active and at least PortNumber is defined - and change other attributes", async () => {
      let prevMBDriver = device.MBDriver;
      isActive = true;
      editedIpAdress = undefined;
      editedPortNumber = 1234;
      editedTimeout = undefined;
      editedUnitId = undefined;

      await exec();
      expect(connectMockFunc).toHaveBeenCalledTimes(1);
      expect(disconnectMockFunc).toHaveBeenCalledTimes(1);
      expect(device.Name).toEqual(editedName);

      expect(prevMBDriver).toBeDefined();
      expect(device.MBDriver).toBeDefined();
      expect(device.MBDriver).not.toEqual(prevMBDriver);

      //For every removed variable and once after that
      expect(refreshGroupMockFunc).toHaveBeenCalledTimes(4);
    });

    it("should call connect and disconnect and refreshGroups create new MBDriver if device is active and at least Timeout is defined - and change other attributes", async () => {
      let prevMBDriver = device.MBDriver;
      isActive = true;
      editedIpAdress = undefined;
      editedPortNumber = undefined;
      editedTimeout = 5000;
      editedUnitId = undefined;

      await exec();
      expect(connectMockFunc).toHaveBeenCalledTimes(1);
      expect(disconnectMockFunc).toHaveBeenCalledTimes(1);
      expect(device.Name).toEqual(editedName);

      expect(prevMBDriver).toBeDefined();
      expect(device.MBDriver).toBeDefined();
      expect(device.MBDriver).not.toEqual(prevMBDriver);

      //For every removed variable and once after that
      expect(refreshGroupMockFunc).toHaveBeenCalledTimes(4);
    });

    it("should call connect and disconnect and refreshGroups create new MBDriver if device is active and at least unitId is defined - and change other attributes", async () => {
      let prevMBDriver = device.MBDriver;
      isActive = true;
      editedIpAdress = undefined;
      editedPortNumber = undefined;
      editedTimeout = undefined;
      editedUnitId = 12;

      await exec();
      expect(connectMockFunc).toHaveBeenCalledTimes(1);
      expect(disconnectMockFunc).toHaveBeenCalledTimes(1);
      expect(device.Name).toEqual(editedName);

      expect(prevMBDriver).toBeDefined();
      expect(device.MBDriver).toBeDefined();
      expect(device.MBDriver).not.toEqual(prevMBDriver);

      //For every removed variable and once after that
      expect(refreshGroupMockFunc).toHaveBeenCalledTimes(4);
    });

    it("should return device after edditing", async () => {
      let result = await exec();

      expect(result).toEqual(device);
    });
  });

  describe("createCalculationElement", () => {
    let name;
    let device;
    let payload;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;

    let calculationElement1Payload;
    let calculationElement1Id;
    let calculationElement1Type;
    let calculationElement1Archived;
    let calculationElement1Name;
    let calculationElement1SampleTime;

    let _createSumElementMockFunc;
    let _createSumElementMockFuncResult;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      refreshGroupMock = jest.fn();

      calculationElement1Id = "1001";
      calculationElement1Type = "sumElement";
      calculationElement1Archived = true;
      calculationElement1Name = "testSumElement";
      calculationElement1SampleTime = 5;

      _createSumElementMockFuncResult = "test Result";
      _createSumElementMockFunc = jest
        .fn()
        .mockResolvedValue(_createSumElementMockFuncResult);
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);

      calculationElement1Payload = {
        id: calculationElement1Id,
        type: calculationElement1Type,
        timeSample: calculationElement1SampleTime,
        name: calculationElement1Name,
        archived: calculationElement1Archived
      };

      device._createSumElement = _createSumElementMockFunc;

      return device.createCalculationElement(calculationElement1Payload);
    };

    it("should create and return sumElement if payload type is sumElement", async () => {
      calculationElement1Type = "sumElement";
      let result = await exec();

      expect(_createSumElementMockFunc).toHaveBeenCalledTimes(1);

      expect(_createSumElementMockFunc.mock.calls[0][0]).toEqual(
        calculationElement1Payload
      );

      expect(result).toEqual(_createSumElementMockFuncResult);
    });

    it("should throw if payload.type is not recognized", async () => {
      calculationElement1Type = "unrecognizedType";

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if payload is empty", async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device.createCalculationElement();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if payload.type is empty", async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice();
      await device.init(payload);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device.createCalculationElement({});
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if calculationElement with given id already", async () => {
      calculationElement1Payload.id = "1234";
      device.CalculationElements["1234"] = "already defined variable";
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device.createCalculationElement(calculationElement1Payload);
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("addCalculationElement", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let calculationElementId;
    let calculationElementName;
    let calculationElementType;
    let calculationElementArchived;
    let calculationElementSampleTime;
    let calculationElementValueType;
    let calculationElement;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      calculationElementId = "1001";
      calculationElementName = "calculation element test";
      calculationElementType = "sumElement";
      calculationElementArchived = true;
      calculationElementSampleTime = 5;
      calculationElementValueType = "float";
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);

      calculationElement = {
        Id: calculationElementId,
        Name: calculationElementName,
        Archived: calculationElementArchived,
        TypeName: calculationElementType,
        ValueType: calculationElementValueType,
        SampleTime: calculationElementSampleTime
      };

      return device.addCalculationElement(calculationElement);
    };

    it("should add calculationElement to calculationElements", async () => {
      await exec();

      expect(device.CalculationElements[calculationElementId]).toBeDefined();
      expect(device.CalculationElements[calculationElementId]).toEqual(
        calculationElement
      );
    });

    it("should add variable to archive manager if archived is set to true", async () => {
      await exec();
      expect(
        device.ArchiveManager.doesCalculationElementIdExists(
          calculationElementId
        )
      ).toBeTruthy();
    });

    it("should not add variable to archive manager if archived is set to false", async () => {
      calculationElementArchived = false;

      await exec();

      expect(
        device.ArchiveManager.doesCalculationElementIdExists(
          calculationElementId
        )
      ).toBeFalsy();
    });

    it("should add variable again after it was deleted", async () => {
      await exec();
      await device.removeCalculationElement(calculationElementId);
      await device.addCalculationElement(calculationElement);
      expect(device.CalculationElements[calculationElementId]).toBeDefined();
      expect(device.CalculationElements[calculationElementId]).toEqual(
        calculationElement
      );
    });

    it("should replace given calculationElement if name already existis", async () => {
      await exec();
      let newCalcElement = {
        Id: calculationElementId,
        Name: "newElement",
        Archived: false,
        TypeName: "sumElement",
        SampleTime: 10
      };

      await device.addCalculationElement(newCalcElement);
      expect(device.CalculationElements[calculationElementId]).not.toEqual(
        calculationElement
      );
      expect(device.CalculationElements[calculationElementId]).toEqual(
        newCalcElement
      );
    });
  });

  describe("removeCalculationElement", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let calculationElementId;
    let calculationElementName;
    let calculationElementType;
    let calculationElementArchived;
    let calculationElementSampleTime;
    let calculationElementValueType;
    let calculationElement;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      calculationElementId = "1001";
      calculationElementName = "calculation element test";
      calculationElementType = "sumElement";
      calculationElementArchived = true;
      calculationElementSampleTime = 5;
      calculationElementValueType = "float";
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);

      calculationElement = {
        Id: calculationElementId,
        Name: calculationElementName,
        Archived: calculationElementArchived,
        TypeName: calculationElementType,
        ValueType: calculationElementValueType,
        SampleTime: calculationElementSampleTime
      };

      await device.addCalculationElement(calculationElement);

      return device.removeCalculationElement(calculationElementId);
    };

    it("should remove calculationElement from calculationElements", async () => {
      await exec();

      expect(
        device.CalculationElements[calculationElementId]
      ).not.toBeDefined();
    });

    it("should return removed calculationElement", async () => {
      let result = await exec();

      expect(result).toEqual(calculationElement);
    });

    it("should remove calculationElement from archive manager", async () => {
      await exec();

      expect(
        device.ArchiveManager.doesCalculationElementIdExists(
          calculationElementId
        )
      ).toBeFalsy();
    });

    it("should throw if there is no calculationElement of such id", async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);

      calculationElement = {
        Id: calculationElementId,
        Name: calculationElementName,
        Archived: calculationElementArchived,
        TypeName: calculationElementType,
        ValueType: calculationElementValueType,
        SampleTime: calculationElementSampleTime
      };

      await device.addCalculationElement(calculationElement);

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device.removeVariable("9999");
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("getCalculationElement", () => {
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let device;
    let calculationElementId;
    let calculationElementName;
    let calculationElementType;
    let calculationElementArchived;
    let calculationElementSampleTime;
    let calculationElementValueType;
    let calculationElement;
    let getElementId;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      calculationElementId = "1001";
      calculationElementName = "calculation element test";
      calculationElementType = "sumElement";
      calculationElementArchived = true;
      calculationElementSampleTime = 5;
      calculationElementValueType = "float";
      getElementId = calculationElementId;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice();
      await device.init(payload);

      calculationElement = {
        Id: calculationElementId,
        Name: calculationElementName,
        Archived: calculationElementArchived,
        TypeName: calculationElementType,
        ValueType: calculationElementValueType,
        SampleTime: calculationElementSampleTime
      };

      await device.addCalculationElement(calculationElement);

      return device.getCalculationElement(getElementId);
    };

    it("should return calculationElement of given id", async () => {
      let result = await exec();

      expect(result).toEqual(calculationElement);
    });

    it("should not throw but return undefined if there is no variable of given id", async () => {
      getElementId = "8765";

      let result;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            result = await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      expect(result).not.toBeDefined();
    });
  });

  describe("_initVariables", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let payload;
    let createVariableMockFn;
    let variable1;
    let variable2;
    let variable3;
    let variables;

    beforeEach(async () => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      createVariableMockFn = jest.fn();
      device = new MBDevice();
      await device.init(payload);
      device.createVariable = createVariableMockFn;
      variable1 = { Id: "var1", name: "variable1" };
      variable2 = { Id: "var2", name: "variable2" };
      variable3 = { Id: "var3", name: "variable3" };
      variables = [variable1, variable2, variable3];
    });

    let exec = () => {
      return device._initVariables(variables);
    };

    it("should call create variable for each variable in given collection", async () => {
      await exec();

      expect(createVariableMockFn).toHaveBeenCalledTimes(variables.length);
      expect(createVariableMockFn.mock.calls[0][0]).toEqual(variable1);
      expect(createVariableMockFn.mock.calls[1][0]).toEqual(variable2);
      expect(createVariableMockFn.mock.calls[2][0]).toEqual(variable3);
    });

    it("should not throw if variables are empty", () => {
      variables = [];
      expect(() => exec()).not.toThrow();
    });
  });

  describe("_refreshCalculationElements", () => {
    let device;
    let devicePayload;
    let variable1;
    let variable1Payload;
    let variable2;
    let variable2Payload;
    let variable3;
    let variable3Payload;

    let sumElement1;
    let sumElement1Payload;
    let sumElement1RefreshMockFunc;
    let sumElement1RefreshMockFuncResult;

    let sumElement2;
    let sumElement2Payload;
    let sumElement2RefreshMockFunc;
    let sumElement2RefreshMockFuncResult;

    let sumElement3;
    let sumElement3Payload;
    let sumElement3RefreshMockFunc;
    let sumElement3RefreshMockFuncResult;

    let initialRefreshResultPayload;
    let tickNumber;

    beforeEach(() => {
      devicePayload = {
        type: "mbDevice",
        name: "test name",
        ipAdress: "192.168.0.10",
        portNumber: 502,
        timeout: 2000,
        unitId: 1
      };

      initialRefreshResultPayload = {};

      variable1Payload = {
        id: "0001",
        timeSample: 1,
        name: "testVariable1",
        offset: 2,
        length: 2,
        fCode: 3,
        value: 3,
        type: "float",
        archived: false
      };

      variable2Payload = {
        id: "0002",
        timeSample: 1,
        name: "testVariable2",
        offset: 4,
        length: 2,
        fCode: 3,
        value: 3,
        type: "float",
        archived: false
      };

      variable3Payload = {
        id: "0003",
        timeSample: 1,
        name: "testVariable3",
        offset: 6,
        length: 2,
        fCode: 3,
        value: 3,
        type: "float",
        archived: false
      };

      sumElement1Payload = {
        id: "1001",
        type: "sumElement",
        archive: false,
        name: "sumElement1",
        sampleTime: 1,
        variables: [
          {
            id: "0001",
            factor: 1
          },
          {
            id: "0002",
            factor: 2
          }
        ]
      };

      sumElement2Payload = {
        id: "1002",
        type: "sumElement",
        archive: false,
        name: "sumElement2",
        sampleTime: 2,
        variables: [
          {
            id: "0002",
            factor: 2
          },
          {
            id: "0003",
            factor: 3
          }
        ]
      };

      sumElement3Payload = {
        id: "1003",
        type: "sumElement",
        archive: false,
        name: "sumElement3",
        sampleTime: 3,
        variables: [
          {
            id: "0001",
            factor: 1
          },
          {
            id: "0002",
            factor: 2
          },
          {
            id: "0003",
            factor: 3
          }
        ]
      };

      tickNumber = 15;

      sumElement1RefreshMockFuncResult = "refreshResult1";
      sumElement2RefreshMockFuncResult = "refreshResult2";
      sumElement3RefreshMockFuncResult = "refreshResult3";

      sumElement1RefreshMockFunc = jest
        .fn()
        .mockResolvedValue(sumElement1RefreshMockFuncResult);
      sumElement2RefreshMockFunc = jest
        .fn()
        .mockResolvedValue(sumElement2RefreshMockFuncResult);
      sumElement3RefreshMockFunc = jest
        .fn()
        .mockResolvedValue(sumElement3RefreshMockFuncResult);
    });

    let exec = async () => {
      device = new MBDevice();
      await device.init(devicePayload);

      variable1 = await device.createVariable(variable1Payload);
      variable2 = await device.createVariable(variable2Payload);
      variable3 = await device.createVariable(variable3Payload);

      sumElement1 = await device.createCalculationElement(sumElement1Payload);
      sumElement2 = await device.createCalculationElement(sumElement2Payload);
      sumElement3 = await device.createCalculationElement(sumElement3Payload);

      sumElement1.refresh = sumElement1RefreshMockFunc;
      sumElement2.refresh = sumElement2RefreshMockFunc;
      sumElement3.refresh = sumElement3RefreshMockFunc;

      return device._refreshCalculationElements(
        tickNumber,
        initialRefreshResultPayload
      );
    };

    it("should call refresh method of all calculation elements that corresponds to tickNumber", async () => {
      sumElement1Payload.sampleTime = 1;
      sumElement2Payload.sampleTime = 2;
      sumElement3Payload.sampleTime = 3;
      tickNumber = 15;

      let result = await exec();

      //tickId = 15 -> 15 can be divded by 3 and 1 so only first (sampleTime:1) and third (sampleTime:2) calculationElement should be refreshed
      expect(sumElement1RefreshMockFunc).toHaveBeenCalledTimes(1);
      expect(sumElement1RefreshMockFunc.mock.calls[0][0]).toEqual(tickNumber);

      expect(sumElement2RefreshMockFunc).not.toHaveBeenCalled();

      expect(sumElement3RefreshMockFunc).toHaveBeenCalledTimes(1);
      expect(sumElement3RefreshMockFunc.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("should not call refresh method of any calculation elements if none corresponds to tickNumber", async () => {
      sumElement1Payload.sampleTime = 2;
      sumElement2Payload.sampleTime = 3;
      sumElement3Payload.sampleTime = 4;
      tickNumber = 13;

      let result = await exec();

      expect(sumElement1RefreshMockFunc).not.toHaveBeenCalled();
      expect(sumElement2RefreshMockFunc).not.toHaveBeenCalled();
      expect(sumElement3RefreshMockFunc).not.toHaveBeenCalled();
    });

    it("should call refresh method of all calculation elements if all corresponds to tickNumber", async () => {
      sumElement1Payload.sampleTime = 1;
      sumElement2Payload.sampleTime = 2;
      sumElement3Payload.sampleTime = 3;
      tickNumber = 6;

      let result = await exec();

      expect(sumElement1RefreshMockFunc).toHaveBeenCalledTimes(1);
      expect(sumElement1RefreshMockFunc.mock.calls[0][0]).toEqual(tickNumber);

      expect(sumElement2RefreshMockFunc).toHaveBeenCalledTimes(1);
      expect(sumElement2RefreshMockFunc.mock.calls[0][0]).toEqual(tickNumber);

      expect(sumElement3RefreshMockFunc).toHaveBeenCalledTimes(1);
      expect(sumElement3RefreshMockFunc.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("should append payload given as an argument with resolved values by refresh function", async () => {
      sumElement1Payload.sampleTime = 1;
      sumElement2Payload.sampleTime = 2;
      sumElement3Payload.sampleTime = 3;
      tickNumber = 15;

      let result = await exec();

      expect(initialRefreshResultPayload).toBeDefined();
      expect(Object.keys(initialRefreshResultPayload).length).toEqual(2);

      expect(initialRefreshResultPayload[sumElement1Payload.id]).toBeDefined();
      expect(initialRefreshResultPayload[sumElement1Payload.id]).toEqual(
        sumElement1
      );

      expect(
        initialRefreshResultPayload[sumElement2Payload.id]
      ).not.toBeDefined();

      expect(initialRefreshResultPayload[sumElement3Payload.id]).toBeDefined();
      expect(initialRefreshResultPayload[sumElement3Payload.id]).toEqual(
        sumElement3
      );
    });

    it("should return payload given as an argument", async () => {
      let result = await exec();

      expect(result).toEqual(initialRefreshResultPayload);
    });

    it("should not throw if one of refresh function rejects", async () => {
      sumElement3RefreshMockFunc = jest
        .fn()
        .mockRejectedValue(new Error("test error"));

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      //Checking if all method were called correctly
      expect(sumElement1RefreshMockFunc).toHaveBeenCalledTimes(1);
      expect(sumElement1RefreshMockFunc.mock.calls[0][0]).toEqual(tickNumber);

      expect(sumElement2RefreshMockFunc).not.toHaveBeenCalled();

      expect(sumElement3RefreshMockFunc).toHaveBeenCalledTimes(1);
      expect(sumElement3RefreshMockFunc.mock.calls[0][0]).toEqual(tickNumber);

      //Checking if result is correct
      expect(initialRefreshResultPayload).toBeDefined();
      expect(Object.keys(initialRefreshResultPayload).length).toEqual(1);

      expect(initialRefreshResultPayload[sumElement1Payload.id]).toBeDefined();
      expect(initialRefreshResultPayload[sumElement1Payload.id]).toEqual(
        sumElement1
      );

      expect(
        initialRefreshResultPayload[sumElement2Payload.id]
      ).not.toBeDefined();

      expect(
        initialRefreshResultPayload[sumElement3Payload.id]
      ).not.toBeDefined();
    });
  });
});
