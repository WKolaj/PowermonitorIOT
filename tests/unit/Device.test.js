const Device = require("../../classes/device/Device");

describe("Device", () => {
  describe("constructor", () => {
    let name;
    let payload;

    beforeEach(() => {
      name = "test name";
    });

    let exec = () => {
      payload = { name: name };
      return new Device(payload);
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

    it("should initiazle event object", () => {
      let result = exec();

      expect(result.Events).toBeDefined();
    });
  });

  describe("get Events", () => {
    let name;
    let device;
    let payload;

    beforeEach(() => {
      name = "test name";
    });

    let exec = () => {
      payload = { name: name };
      device = new Device(payload);
      return device.Events;
    };

    it("should return EventEmitter of device", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device._events);
    });
  });

  describe("get Name", () => {
    let name;
    let device;
    let payload;

    beforeEach(() => {
      name = "test name";
    });

    let exec = () => {
      payload = { name: name };
      device = new Device(payload);
      return device.Name;
    };

    it("should return Name of device", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(name);
    });
  });

  describe("get Variables", () => {
    let name;
    let device;
    let payload;

    beforeEach(() => {
      name = "test name";
    });

    let exec = () => {
      payload = { name: name };
      device = new Device(payload);
      return device.Variables;
    };

    it("should return Name of device", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device._variables);
    });
  });

  describe("addVariable", () => {
    let name;
    let device;
    let variable;
    let variableId;
    let payload;

    beforeEach(() => {
      name = "test name";
      variableId = "test variable";
      variable = { Id: variableId };
    });

    let exec = () => {
      payload = { name: name };
      device = new Device(payload);
      device.addVariable(variable);
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
  });

  describe("removeVariable", () => {
    let name;
    let device;
    let variable;
    let variableId;
    let payload;

    beforeEach(() => {
      name = "test name";
      variableId = "test variable";
      variable = { Id: variableId };
    });

    let exec = () => {
      payload = { name: name };
      device = new Device(payload);
      device.addVariable(variable);
      device.removeVariable(variableId);
    };

    it("should remove variable from variables", () => {
      exec();

      expect(device.Variables[variableId]).not.toBeDefined();
    });

    it("should throw if there is no variable of such name", () => {
      payload = { name: name };
      device = new Device(payload);
      device.addVariable(variable);

      let newVariable = { Name: "new test name" };

      expect(() => device.removeVariable(newVariable)).toThrow();
    });
  });

  describe("divideVariablesByTickId", () => {
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
    let variables;

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

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9,
        variable10
      ];
    });

    let exec = () => {
      return Device.divideVariablesByTickId(variables);
    };

    it("should split variables by TickIds", () => {
      let result = exec();
      expect(result).toBeDefined();

      let allTickIds = Object.keys(result);
      expect(allTickIds.length).toEqual(5);

      expect(result).toMatchObject({
        "1": [variable1, variable2],
        "2": [variable3, variable4],
        "3": [variable5, variable6],
        "4": [variable7, variable8],
        "5": [variable9, variable10]
      });
    });

    it("should split variables by TickIds if there is only one tickIds", () => {
      variable1 = { Name: "var1", TickId: 6 };
      variable2 = { Name: "var2", TickId: 6 };
      variable3 = { Name: "var3", TickId: 6 };
      variable4 = { Name: "var4", TickId: 6 };
      variable5 = { Name: "var5", TickId: 6 };
      variable6 = { Name: "var6", TickId: 6 };
      variable7 = { Name: "var7", TickId: 6 };
      variable8 = { Name: "var8", TickId: 6 };
      variable9 = { Name: "var9", TickId: 6 };
      variable10 = { Name: "var10", TickId: 6 };

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9,
        variable10
      ];

      let result = exec();
      expect(result).toBeDefined();

      let allTickIds = Object.keys(result);
      expect(allTickIds.length).toEqual(1);

      expect(result).toMatchObject({
        "6": [
          variable1,
          variable2,
          variable3,
          variable4,
          variable5,
          variable6,
          variable7,
          variable8,
          variable9,
          variable10
        ]
      });
    });
  });

  describe("constructor", () => {
    let name;
    let payload;
    let device;
    let tickNumber;
    let _refreshMock;
    let _refreshMockResolvedValue;
    let eventEmitterMock;
    let eventEmitterMockEmitMethod;

    beforeEach(() => {
      name = "test name";
      tickNumber = 15;
      _refreshMockResolvedValue = 1234;
      eventEmitterMockEmitMethod = jest.fn();
      eventEmitterMock = { emit: eventEmitterMockEmitMethod };
    });

    let exec = () => {
      payload = { name: name };
      _refreshMock = jest.fn().mockResolvedValue(_refreshMockResolvedValue);
      device = new Device(payload);
      device._refresh = _refreshMock;
      device._events = eventEmitterMock;

      return device.refresh(tickNumber);
    };

    it("should call _refresh method with tick arguments", async () => {
      let result = await exec();

      expect(_refreshMock).toHaveBeenCalledTimes(1);
      expect(_refreshMock.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("should invoke Refreshed Event with _refresh result if refresh result is not empty", async () => {
      let result = await exec();

      expect(eventEmitterMockEmitMethod).toHaveBeenCalledTimes(1);
      expect(eventEmitterMockEmitMethod.mock.calls[0][0]).toEqual("Refreshed");
      expect(eventEmitterMockEmitMethod.mock.calls[0][1][0]).toEqual(device);
      expect(eventEmitterMockEmitMethod.mock.calls[0][1][1]).toEqual(
        _refreshMockResolvedValue
      );
      expect(eventEmitterMockEmitMethod.mock.calls[0][1][2]).toEqual(
        tickNumber
      );
    });

    it("should not invoke Refreshed Event if refresh result is empty", async () => {
      _refreshMockResolvedValue = null;

      let result = await exec();

      expect(eventEmitterMockEmitMethod).not.toHaveBeenCalled();
    });
  });
});
