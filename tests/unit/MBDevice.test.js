const MBDevice = require("../../classes/device/Modbus/MBDevice");
const MBBooleanVariable = require("../../classes/variable/Modbus/MBBooleanVariable");
const MBByteArrayVariable = require("../../classes/variable/Modbus/MBByteArrayVariable");
const MBFloatVariable = require("../../classes/variable/Modbus/MBFloatVariable");
const MBInt16Variable = require("../../classes/variable/Modbus/MBInt16Variable");
const MBInt32Variable = require("../../classes/variable/Modbus/MBInt32Variable");
const MBSwappedFloatVariable = require("../../classes/variable/Modbus/MBSwappedFloatVariable");
const MBSwappedInt32Variable = require("../../classes/variable/Modbus/MBSwappedInt32Variable");
const MBSwappedUInt32Variable = require("../../classes/variable/Modbus/MBSwappedUInt32Variable");
const MBUInt16Variable = require("../../classes/variable/Modbus/MBUInt16Variable");
const MBUInt32Variable = require("../../classes/variable/Modbus/MBUInt32Variable");

describe("MBDevice", () => {
  describe("constructor", () => {
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
      type = undefined;
      isActive = false;
      realInitVariableFunc = MBDevice.prototype._initVariables;
      realConnectFunc = MBDevice.prototype.connect;
      initVariablesMockFunc = jest.fn();
      mockConnectFunc = jest.fn();
      MBDevice.prototype._initVariables = initVariablesMockFunc;
      MBDevice.prototype.connect = mockConnectFunc;
    });

    afterEach(() => {
      MBDevice.prototype._initVariables = realInitVariableFunc;
      MBDevice.prototype.connect = realConnectFunc;
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId,
        variables: variables,
        type: type,
        isActive: isActive
      };

      return new MBDevice(payload);
    };

    it("should create new Device and set its name, ipAdress, portNumber, timeout and unitId", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Name).toEqual(name);
      expect(result.IPAdress).toEqual(ipAdress);
      expect(result.PortNumber).toEqual(portNumber);
      expect(result.Timeout).toEqual(timeout);
      expect(result.UnitId).toEqual(unitId);

      expect(mockConnectFunc).not.toHaveBeenCalled();
    });

    it("should initiazle variables to empty object if no variables are given", () => {
      variables = undefined;
      let result = exec();

      expect(initVariablesMockFunc).not.toHaveBeenCalled();
      expect(result.Variables).toEqual({});
    });

    it("should initialize variables by calling initVariables if variables in payload are passed", () => {
      exec();

      expect(initVariablesMockFunc).toHaveBeenCalledTimes(1);
      expect(initVariablesMockFunc.mock.calls[0][0]).toEqual(variables);
    });

    it("should set MBDriver based on given arguments", () => {
      let device = exec();

      expect(device.MBDriver).toBeDefined();
      expect(device.MBDriver.IPAdress).toEqual(ipAdress);
      expect(device.MBDriver.PortNumber).toEqual(portNumber);
      expect(device.MBDriver.Timeout).toEqual(timeout);
      expect(device.MBDriver.UnitId).toEqual(unitId);
    });

    it("should set mbRequestGrouper", () => {
      let device = exec();

      expect(device.RequestGrouper).toBeDefined();
      expect(device.RequestGrouper.MBDevice).toEqual(device);
    });

    it("should set requests to empty object", () => {
      let device = exec();

      expect(device.Requests).toBeDefined();
      expect(device.Requests).toEqual({});
    });

    it("should throw if name is empty", () => {
      name = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if ipAdress is empty", () => {
      ipAdress = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if unitId is empty", () => {
      unitId = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if timeout is empty", () => {
      timeout = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if portNumber is empty", () => {
      portNumber = undefined;
      expect(() => exec()).toThrow();
    });

    it("should set type to mbDevice if no type is provided in payload", () => {
      let result = exec();

      expect(result.Type).toBeDefined();
      expect(result.Type).toEqual("mbDevice");
    });

    it("should set type to type given in payload if it exists", () => {
      type = "test type";
      let result = exec();

      expect(result.Type).toBeDefined();
      expect(result.Type).toEqual(type);
    });

    it("should call connect if device is active according to payload", () => {
      isActive = true;
      exec();

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

    beforeEach(() => {
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

    beforeEach(() => {
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

    beforeEach(() => {
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

    beforeEach(() => {
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

    beforeEach(() => {
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

    beforeEach(() => {
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

    beforeEach(() => {
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

    beforeEach(() => {
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

    beforeEach(() => {
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

    beforeEach(() => {
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

    let exec = () => {
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

    beforeEach(() => {
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

    beforeEach(() => {
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

    beforeEach(() => {
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

    beforeEach(() => {
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

    let exec = () => {
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

    it("should not invoke Refreshed event with all changed variables if there was an error", async () => {
      mockInvokeRequestsFn = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      await exec();

      expect(mockEventEmitterEmitMethod).not.toHaveBeenCalled();
    });

    it("should not invoke Refreshed event with all changed variables if device is not active", async () => {
      isDeviceActive = false;

      await exec();

      expect(mockEventEmitterEmitMethod).not.toHaveBeenCalled();
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
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
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

      return device._createBooleanVariable(variablePayload);
    };

    it("should create, add to variables and return new variable ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", () => {
      let result = exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(1);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", () => {
      varId = 1234;
      let result = exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", () => {
      varValue = true;
      let result = exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", () => {
      varTimeSample = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Name in payload is empty", () => {
      varName = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Offset in payload is empty", () => {
      varOffset = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if FCode in payload is empty", () => {
      varFcode = undefined;
      expect(() => exec()).toThrow();
    });

    it("should refresh requests group", () => {
      exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
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
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variablePayload = {
        id: varId,
        type: varType,
        timeSample: varTimeSample,
        name: varName,
        offset: varOffset,
        fCode: varFcode,
        length: varLength,
        value: varValue
      };

      return device._createByteArrayVariable(variablePayload);
    };

    it("should create, add to variables and return new variable ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", () => {
      let result = exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(varLength);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", () => {
      varId = 1234;
      let result = exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", () => {
      varValue = [1, 2, 3, 4, 5, 6, 7, 8];
      let result = exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", () => {
      varTimeSample = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Name in payload is empty", () => {
      varName = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Offset in payload is empty", () => {
      varOffset = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if FCode in payload is empty", () => {
      varFcode = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Length in payload is empty", () => {
      varLength = undefined;
      expect(() => exec()).toThrow();
    });

    it("should refresh requests group", () => {
      exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
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
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
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

      return device._createFloatVariable(variablePayload);
    };

    it("should create, add to variables and return new variable ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", () => {
      let result = exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", () => {
      varId = 1234;
      let result = exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", () => {
      varValue = 1234.4321;
      let result = exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", () => {
      varTimeSample = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Name in payload is empty", () => {
      varName = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Offset in payload is empty", () => {
      varOffset = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if FCode in payload is empty", () => {
      varFcode = undefined;
      expect(() => exec()).toThrow();
    });

    it("should refresh requests group", () => {
      exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
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
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
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

      return device._createSwappedFloatVariable(variablePayload);
    };

    it("should create, add to variables and return new variable ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", () => {
      let result = exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", () => {
      varId = 1234;
      let result = exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", () => {
      varValue = 1234.4321;
      let result = exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", () => {
      varTimeSample = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Name in payload is empty", () => {
      varName = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Offset in payload is empty", () => {
      varOffset = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if FCode in payload is empty", () => {
      varFcode = undefined;
      expect(() => exec()).toThrow();
    });

    it("should refresh requests group", () => {
      exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
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
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
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

      return device._createInt32Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", () => {
      let result = exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", () => {
      varId = 1234;
      let result = exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", () => {
      varValue = 1234;
      let result = exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", () => {
      varTimeSample = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Name in payload is empty", () => {
      varName = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Offset in payload is empty", () => {
      varOffset = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if FCode in payload is empty", () => {
      varFcode = undefined;
      expect(() => exec()).toThrow();
    });

    it("should refresh requests group", () => {
      exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
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
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
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

      return device._createSwappedInt32Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", () => {
      let result = exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", () => {
      varId = 1234;
      let result = exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", () => {
      varValue = 1234;
      let result = exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", () => {
      varTimeSample = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Name in payload is empty", () => {
      varName = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Offset in payload is empty", () => {
      varOffset = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if FCode in payload is empty", () => {
      varFcode = undefined;
      expect(() => exec()).toThrow();
    });

    it("should refresh requests group", () => {
      exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
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
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
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

      return device._createUInt32Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", () => {
      let result = exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", () => {
      varId = 1234;
      let result = exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", () => {
      varValue = 1234;
      let result = exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", () => {
      varTimeSample = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Name in payload is empty", () => {
      varName = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Offset in payload is empty", () => {
      varOffset = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if FCode in payload is empty", () => {
      varFcode = undefined;
      expect(() => exec()).toThrow();
    });

    it("should refresh requests group", () => {
      exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
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
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
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

      return device._createSwappedUInt32Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", () => {
      let result = exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(2);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", () => {
      varId = 1234;
      let result = exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", () => {
      varValue = 1234;
      let result = exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", () => {
      varTimeSample = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Name in payload is empty", () => {
      varName = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Offset in payload is empty", () => {
      varOffset = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if FCode in payload is empty", () => {
      varFcode = undefined;
      expect(() => exec()).toThrow();
    });

    it("should refresh requests group", () => {
      exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
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
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
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

      return device._createInt16Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", () => {
      let result = exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(1);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", () => {
      varId = 1234;
      let result = exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", () => {
      varValue = 1234;
      let result = exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", () => {
      varTimeSample = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Name in payload is empty", () => {
      varName = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Offset in payload is empty", () => {
      varOffset = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if FCode in payload is empty", () => {
      varFcode = undefined;
      expect(() => exec()).toThrow();
    });

    it("should refresh requests group", () => {
      exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
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
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
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

      return device._createUInt16Variable(variablePayload);
    };

    it("should create, add to variables and return new variable ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(device.Variables[result.Id]).toBeDefined();
      expect(device.Variables[result.Id]).toEqual(result);
    });

    it("variable should be created based on given payload ", () => {
      let result = exec();

      expect(result instanceof varClass).toBeTruthy();
      expect(result.Id).toBeDefined();
      expect(result.TimeSample).toEqual(varTimeSample);
      expect(result.Name).toEqual(varName);
      expect(result.Offset).toEqual(varOffset);
      expect(result.Length).toEqual(1);
      expect(result.FCode).toEqual(varFcode);
    });

    it("variable set id of variable if it is given in payload", () => {
      varId = 1234;
      let result = exec();

      expect(result.Id).toEqual(varId);
    });

    it("variable set value of variable if it is given in payload", () => {
      varValue = 1234;
      let result = exec();

      expect(result.Value).toEqual(varValue);
    });

    it("should throw if TimeSample in payload is empty", () => {
      varTimeSample = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Name in payload is empty", () => {
      varName = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if Offset in payload is empty", () => {
      varOffset = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if FCode in payload is empty", () => {
      varFcode = undefined;
      expect(() => exec()).toThrow();
    });

    it("should refresh requests group", () => {
      exec();
      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
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

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice(payload);

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

    it("should create and return boolean variable if payload type is boolean", () => {
      varType = "boolean";
      let result = exec();

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

    it("should create and return byteArray variable if payload type is boolean", () => {
      varType = "byteArray";
      let result = exec();

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

    it("should create and return float variable if payload type is boolean", () => {
      varType = "float";
      let result = exec();

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

    it("should create and return int16 variable if payload type is boolean", () => {
      varType = "int16";
      let result = exec();

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

    it("should create and return int32 variable if payload type is boolean", () => {
      varType = "int32";
      let result = exec();

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

    it("should create and return swapped float variable if payload type is boolean", () => {
      varType = "swappedFloat";
      let result = exec();

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

    it("should create and return swapped int32 variable if payload type is boolean", () => {
      varType = "swappedInt32";
      let result = exec();

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

    it("should create and return swapped uint32 variable if payload type is boolean", () => {
      varType = "swappedUInt32";
      let result = exec();

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

    it("should create and return uint16 variable if payload type is boolean", () => {
      varType = "uInt16";
      let result = exec();

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

    it("should create and return uint32 variable if payload type is boolean", () => {
      varType = "uInt32";
      let result = exec();

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

    it("should throw if payload.type is not recognized", () => {
      varType = "unrecognizedType";

      expect(() => exec()).toThrow();
    });

    it("should throw if payload is empty", () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice(payload);

      expect(() => device.createVariable()).toThrow();
    });

    it("should throw if payload.type is empty", () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };
      device = new MBDevice(payload);

      expect(() => device.createVariable({})).toThrow();
    });

    it("should throw if varaible with given id already", () => {
      payload.id = "1234";
      device.Variables["1234"] = "already defined variable";
      expect(() => device.createVariable(payload)).toThrow();
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

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variable = {
        Id: variableId,
        Name: variableName
      };

      return device.addVariable(variable);
    };

    it("should add variable to variables", () => {
      exec();

      expect(device.Variables[variableId]).toBeDefined();
      expect(device.Variables[variableId]).toEqual(variable);
    });

    it("should add variable again after it was deleted", () => {
      exec();
      device.removeVariable(variable.Id);
      device.addVariable(variable);
      expect(device.Variables[variableId]).toBeDefined();
      expect(device.Variables[variableId]).toEqual(variable);
    });

    it("should replace given variable if name already existis", () => {
      exec();
      let newVariable = { Id: variableId, Name: "new" };

      device.addVariable(newVariable);
      expect(device.Variables[variableId]).not.toEqual(variable);
      expect(device.Variables[variableId]).toEqual(newVariable);
    });

    it("should call refresh groups after adding variable", () => {
      exec();

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

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variable = {
        Id: variableId,
        Name: variableName
      };

      device.addVariable(variable);

      return device.removeVariable(variableId);
    };

    it("should remove variable from variables", () => {
      exec();

      expect(device.Variables[variableId]).not.toBeDefined();
    });

    it("should return removed variable", () => {
      let result = exec();

      expect(result).toEqual(variable);
    });

    it("should throw if there is no variable of such id", () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
      device._refreshRequestGroups = refreshGroupMock;

      variable = {
        Id: variableId,
        Name: variableName
      };

      device.addVariable(variable);

      let newVariable = { Id: "new test name" };

      expect(() => device.removeVariable(newVariable)).toThrow();
    });

    it("should call refresh groups after adding variable", () => {
      exec();

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
    let variable;

    let editVariablePayload;
    let editVarTimeSample;
    let editVarName;
    let editVarOffset;
    let editVarFcode;
    let editVarId;
    let editVarValue;

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

      editVarId = undefined;
      editVarTimeSample = 2;
      editVarName = "test variable2";
      editVarOffset = 3;
      editVarFcode = 4;
      editVarValue = 321;
    });

    let exec = () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId
      };

      device = new MBDevice(payload);
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

      variable = device.createVariable(variablePayload);

      editVariablePayload = {
        id: editVarId,
        timeSample: editVarTimeSample,
        name: editVarName,
        offset: editVarOffset,
        fCode: editVarFcode,
        value: editVarValue
      };

      return device.editVariable(varId, editVariablePayload);
    };

    it("should create and return new variable based on payload and assing it in device - instead of previous one ", () => {
      let result = exec();

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

    it("should throw if there is no variable of given id", () => {
      exec();
      expect(() => device.editVariable(8765, editVariablePayload)).toThrow();
    });

    it("should not set id to new if it exists in payload", () => {
      editVarId = 8765;

      let editedVariable = device.Variables[varId];
      expect(editedVariable).toBeDefined();
      expect(editedVariable).not.toEqual(variable);
      expect(editedVariable.Id).toEqual(varId);
    });

    it("should call refresh groups", () => {
      exec();

      //Three times - first time addding variable second removing while editing, thrid - adding new generated variable
      expect(refreshGroupMock).toHaveBeenCalledTimes(3);
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

    beforeEach(() => {
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

      device = new MBDevice(payload);
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

    let exec = () => {
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

  describe("Connected", () => {
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

    beforeEach(() => {
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
      device = new MBDevice(payload);
      device.createVariable = createVariableMockFn;
      variable1 = { Id: "var1", name: "variable1" };
      variable2 = { Id: "var2", name: "variable2" };
      variable3 = { Id: "var3", name: "variable3" };
      variables = [variable1, variable2, variable3];
    });

    let exec = () => {
      device._initVariables(variables);
    };

    it("should call create variable for each variable in given collection", () => {
      exec();

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
});
