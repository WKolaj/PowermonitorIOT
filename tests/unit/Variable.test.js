const Variable = require("../../classes/variable/Variable");
const Sampler = require("../../classes/sampler/Sampler");

describe("Variable", () => {
  describe("constructor", () => {
    let device;
    let name;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = () => {
      return new Variable(device, name);
    };

    it("should create new variable with given arguments", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Device).toEqual(device);
      expect(result.Name).toEqual(name);
    });

    it("should set default time sample to 1s", () => {
      let result = exec();

      expect(result.TimeSample).toEqual(1);
    });

    it("should set event emitter", () => {
      let result = exec();

      expect(result.Events).toBeDefined();
    });

    it("should throw if name is empty", () => {
      name = null;

      expect(() => exec()).toThrow();
    });

    it("should throw if device is empty", () => {
      device = null;

      expect(() => exec()).toThrow();
    });
  });

  describe("Events", () => {
    let device;
    let name;
    let variable;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = () => {
      variable = new Variable(device, name);
      return variable.Events;
    };

    it("should return event object", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(variable._events);
    });
  });

  describe("TickId", () => {
    let device;
    let name;
    let variable;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = () => {
      variable = new Variable(device, name);
      return variable.TickId;
    };

    it("should return tickId", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(variable._tickId);
    });
  });

  describe("get TimeSample", () => {
    let device;
    let name;
    let variable;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = () => {
      variable = new Variable(device, name);
      return variable.TimeSample;
    };

    it("should return tickId converted to SampleTime", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(
        Sampler.convertTickIdToTimeSample(variable._tickId)
      );
    });
  });

  describe("set TimeSample", () => {
    let device;
    let name;
    let variable;
    let timeSample;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      timeSample = 15;
    });

    let exec = () => {
      variable = new Variable(device, name);
      variable.TimeSample = timeSample;
    };

    it("should set tickId converted from SampleTime", () => {
      exec();

      expect(variable._tickId).toBeDefined();
      expect(variable._tickId).toEqual(
        Sampler.convertTimeSampleToTickId(timeSample)
      );
    });
  });

  describe("Device", () => {
    let device;
    let name;
    let variable;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = () => {
      variable = new Variable(device, name);
      return variable.Device;
    };

    it("should return event object", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device);
    });
  });

  describe("Name", () => {
    let device;
    let name;
    let variable;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = () => {
      variable = new Variable(device, name);
      return variable.Name;
    };

    it("should return event object", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(name);
    });
  });

  describe("get Value", () => {
    let device;
    let name;
    let variable;
    let _getValueMock;
    let _getValueMockReturn;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      _getValueMockReturn = 1;
      _getValueMock = jest.fn().mockReturnValue(_getValueMockReturn);
    });

    let exec = () => {
      variable = new Variable(device, name);
      variable._getValue = _getValueMock;

      return variable.Value;
    };

    it("should call and return _getValue function", () => {
      let result = exec();

      expect(result).toEqual(_getValueMockReturn);
      expect(_getValueMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("set Value", () => {
    let device;
    let name;
    let variable;
    let value;
    let _setValueMock;
    let _emitValueChangeMock;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      _setValueMock = jest.fn();
      _emitValueChangeMock = jest.fn();
      value = 1;
    });

    let exec = () => {
      variable = new Variable(device, name);
      variable._setValue = _setValueMock;
      variable._emitValueChange = _emitValueChangeMock;

      variable.Value = value;
    };

    it("should call _setValue function with value passed as an argument", () => {
      exec();

      expect(_setValueMock).toHaveBeenCalledTimes(1);
      expect(_setValueMock.mock.calls[0][0]).toEqual(value);
    });

    it("should call _emitValueChange function with value passed as an argument", () => {
      exec();

      expect(_emitValueChangeMock).toHaveBeenCalledTimes(1);
      expect(_emitValueChangeMock.mock.calls[0][0]).toEqual(value);
    });
  });

  describe("_emitValueChange", () => {
    let device;
    let name;
    let variable;
    let value;
    let eventMock;
    let emitMock;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      emitMock = jest.fn();
      eventMock = {
        emit: emitMock
      };
      value = 1;
    });

    let exec = () => {
      variable = new Variable(device, name);
      variable._events = eventMock;
      variable._emitValueChange(value);
    };

    it("should emit ValueChanged event", () => {
      exec();

      expect(emitMock).toHaveBeenCalledTimes(1);
    });

    it("should emit ValueChanged event with propriate arugments", () => {
      exec();

      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock.mock.calls[0][0]).toEqual("ValueChanged");
      expect(emitMock.mock.calls[0][1]).toBeDefined();
      expect(emitMock.mock.calls[0][1].length).toEqual(2);
      expect(emitMock.mock.calls[0][1][0]).toEqual(variable);
      expect(emitMock.mock.calls[0][1][1]).toEqual(value);
    });
  });
});
