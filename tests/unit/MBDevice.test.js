const MBDevice = require("../../classes/device/Modbus/MBDevice");

describe("MBDevice", () => {
  describe("constructor", () => {
    let name;

    beforeEach(() => {
      name = "test name";
    });

    let exec = () => {
      return new MBDevice(name);
    };

    it("should create new Device and set its name", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Name).toEqual(name);
    });

    it("should initiazle variables to empty object", () => {
      let result = exec();

      expect(result.Variables).toEqual({});
    });
  });

  describe("setModbusDriver", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
    });

    let exec = () => {
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
    };

    it("should set MBDriver based on given arguments", () => {
      exec();

      expect(device.MBDriver).toBeDefined();
      expect(device.MBDriver.IPAdress).toEqual(ipAdress);
      expect(device.MBDriver.PortNumber).toEqual(portNumber);
      expect(device.MBDriver.Timeout).toEqual(timeout);
      expect(device.MBDriver.UnitId).toEqual(unitId);
    });

    it("should set mbRequestGrouper", () => {
      exec();

      expect(device.RequestGrouper).toBeDefined();
      expect(device.RequestGrouper.MBDevice).toEqual(device);
    });

    it("should set requests to empty object", () => {
      exec();

      expect(device.Requests).toBeDefined();
      expect(device.Requests).toEqual({});
    });

    it("should set portNumber to 502 if port was not given", () => {
      portNumber = undefined;
      exec();

      expect(device.MBDriver.PortNumber).toEqual(502);
    });

    it("should set timeout to 2000 if timeout was not given", () => {
      timeout = undefined;
      exec();

      expect(device.MBDriver.Timeout).toEqual(2000);
    });

    it("should set unitId to 1 if unitId was not given", () => {
      unitId = undefined;
      exec();

      expect(device.MBDriver.UnitId).toEqual(1);
    });
  });

  describe("Requests", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
    });

    let exec = () => {
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
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

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
    });

    let exec = () => {
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
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

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
    });

    let exec = () => {
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
      return device.MBDriver;
    };

    it("should return MBDriver", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device._driver);
    });
  });

  describe("IPAdress", () => {
    let name;
    let device;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
    });

    let exec = () => {
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
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

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
    });

    let exec = () => {
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
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

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
    });

    let exec = () => {
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
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

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
    });

    let exec = () => {
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
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

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
    });

    let exec = () => {
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
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

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
    });

    let exec = () => {
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
      return device.IsActive;
    };

    it("should return driver isActive ", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device.MBDriver.IsActive);
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

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      driverConnectMock = jest.fn();
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
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

    beforeEach(() => {
      name = "test name";
      device = new MBDevice(name);
      ipAdress = "192.168.0.10";
      portNumber = 1234;
      timeout = 4321;
      unitId = 123;
      driverDisconnectMock = jest.fn();
      device.setModbusDriver(ipAdress, portNumber, timeout, unitId);
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

  describe("addVariable", () => {
    let name;
    let device;
    let variable;
    let variableName;
    let refreshGroupMock;

    beforeEach(() => {
      name = "test name";
      variableName = "test variable";
      variable = { Name: variableName };
      refreshGroupMock = jest.fn();
    });

    let exec = () => {
      device = new MBDevice(name);
      device.refreshRequestGroups = refreshGroupMock;
      device.addVariable(variable);
    };

    it("should add variable to variables", () => {
      exec();

      expect(device.Variables[variableName]).toBeDefined();
      expect(device.Variables[variableName]).toEqual(variable);
    });

    it("should add variable again after it was deleted", () => {
      exec();
      device.removeVariable(variable);
      device.addVariable(variable);
      expect(device.Variables[variableName]).toBeDefined();
      expect(device.Variables[variableName]).toEqual(variable);
    });

    it("should replace given variable if name already existis", () => {
      exec();
      let newVariable = { id: "new", Name: variableName };

      device.addVariable(newVariable);
      expect(device.Variables[variableName]).not.toEqual(variable);
      expect(device.Variables[variableName]).toEqual(newVariable);
    });

    it("should call refreshRequestGroups", () => {
      exec();

      expect(refreshGroupMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("removeVariable", () => {
    let name;
    let device;
    let variable;
    let variableName;
    let refreshGroupMock;

    beforeEach(() => {
      name = "test name";
      variableName = "test variable";
      variable = { Name: variableName };
      refreshGroupMock = jest.fn();
    });

    let exec = () => {
      device = new MBDevice(name);
      device.refreshRequestGroups = refreshGroupMock;
      device.addVariable(variable);
      device.removeVariable(variable);
    };

    it("should remove variable from variables", () => {
      exec();

      expect(device.Variables[variableName]).not.toBeDefined();
    });

    it("should throw if there is no variable of such name", () => {
      device = new MBDevice(name);
      device.refreshRequestGroups = refreshGroupMock;
      device.addVariable(variable);

      let newVariable = { Name: "new test name" };

      expect(() => device.removeVariable(newVariable)).toThrow();
    });

    it("should call refreshRequestGroups", () => {
      exec();
      //First time while adding second while removing
      expect(refreshGroupMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("refreshRequestGroups", () => {
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

    let name;
    let device;

    beforeEach(() => {
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
      device = new MBDevice(name);
      device.setModbusDriver("192.168.0.10");
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
      device.refreshRequestGroups();
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

    let name;
    let device;
    let isDeviceActive;
    let tickNumber;

    beforeEach(() => {
      request1 = "request 1";
      request2 = "request 2";
      request3 = "request 3";
      request4 = "request 4";
      request5 = "request 5";
      request6 = "request 6";
      request7 = "request 7";
      request8 = "request 8";
      request9 = "request 9";
      request10 = "request 10";

      let requests = {
        "1": [request1, request2],
        "2": [request3, request4],
        "3": [request5, request6],
        "4": [request7, request8],
        "5": [request9, request10]
      };

      name = "Device1";
      device = new MBDevice(name);
      device.setModbusDriver("192.168.0.10");
      device._requests = requests;
      mockInvokeRequestsFn = jest.fn();
      tickNumber = 10;

      isDeviceActive = true;
    });

    let exec = () => {
      device.MBDriver._active = isDeviceActive;
      device.MBDriver.invokeRequests = mockInvokeRequestsFn;
      device.refresh(tickNumber);
    };

    it("should not invoke any request if device is not active", () => {
      isDeviceActive = false;
      exec();

      expect(mockInvokeRequestsFn).not.toHaveBeenCalled();
    });

    it("should invoke all requests that matches tickNumber", () => {
      exec();

      expect(mockInvokeRequestsFn).toHaveBeenCalledTimes(1);
      expect(mockInvokeRequestsFn.mock.calls[0][0].length).toEqual(6);
      expect(mockInvokeRequestsFn.mock.calls[0][0][0]).toEqual(request1);
      expect(mockInvokeRequestsFn.mock.calls[0][0][1]).toEqual(request2);
      expect(mockInvokeRequestsFn.mock.calls[0][0][2]).toEqual(request3);
      expect(mockInvokeRequestsFn.mock.calls[0][0][3]).toEqual(request4);
      expect(mockInvokeRequestsFn.mock.calls[0][0][4]).toEqual(request9);
      expect(mockInvokeRequestsFn.mock.calls[0][0][5]).toEqual(request10);
    });

    it("should not throw if requests are empty", () => {
      device._requests = {};

      expect(() => exec()).not.toThrow();
    });

    it("should not throw if invokeRequest throws", () => {
      mockInvokeRequestsFn = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      expect(() => exec()).not.toThrow();
    });

    it("should not throw if invokeRequest rejects", () => {
      mockInvokeRequestsFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Test error"));

      expect(() => exec()).not.toThrow();
    });
  });
});
