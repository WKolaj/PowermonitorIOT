const MBVariable = require("../../classes/variable/Modbus/MBVariable");

describe("MBVariable", () => {
  describe("constructor", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      return new MBVariable(device, name, fcode, offset, length);
    };

    it("should create new MBVariable based on given parameters", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Device).toEqual(device);
      expect(result.Name).toEqual(name);
      expect(result.FCode).toEqual(fcode);
      expect(result.Offset).toEqual(offset);
      expect(result.Length).toEqual(length);
    });

    it("should throw if device is empty", () => {
      device = undefined;

      expect(() => exec()).toThrow();
    });

    it("should throw if name is empty", () => {
      name = undefined;

      expect(() => exec()).toThrow();
    });

    it("should throw if fcode is empty", () => {
      fcode = undefined;

      expect(() => exec()).toThrow();
    });

    it("should throw if offset is empty", () => {
      offset = undefined;

      expect(() => exec()).toThrow();
    });

    it("should throw if length is empty", () => {
      length = undefined;

      expect(() => exec()).toThrow();
    });

    it("should if fCode is not containted in possible functions", () => {
      fcode = 10;

      expect(() => exec()).toThrow();
    });
  });

  describe("FCode", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length);
      return mbVariable.FCode;
    };

    it("should return FCode", () => {
      let result = exec();

      expect(result).toEqual(fcode);
    });
  });

  describe("Offset", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length);
      return mbVariable.Offset;
    };

    it("should return offset", () => {
      let result = exec();

      expect(result).toEqual(offset);
    });
  });

  describe("Length", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length);
      return mbVariable.Length;
    };

    it("should return length", () => {
      let result = exec();

      expect(result).toEqual(length);
    });
  });

  describe("UnitId", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length);
      return mbVariable.UnitId;
    };

    it("should return unitId", () => {
      let result = exec();

      expect(result).toEqual(unitId);
    });
  });

  describe("get Data", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;
    let data;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId
      };
      data = [1, 2, 3, 4];
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length);
      mbVariable._data = data;
      return mbVariable.Data;
    };

    it("should return data", () => {
      let result = exec();

      expect(result).toEqual(data);
    });
  });

  describe("set Data", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;
    let dataToSet;
    let _convertDataToValueMock;
    let _emitValueChangeMock;
    let dataCovertedToValue;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId
      };
      dataToSet = [1, 2, 3, 4];
      offset = 2;
      length = 3;
      fcode = 4;
      dataCovertedToValue = 1234;
      _convertDataToValueMock = jest.fn().mockReturnValue(dataCovertedToValue);
      _emitValueChangeMock = jest.fn();
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length);
      mbVariable._emitValueChange = _emitValueChangeMock;
      mbVariable._convertDataToValue = _convertDataToValueMock;
      mbVariable.Data = dataToSet;
    };

    it("should set data of the variable", () => {
      exec();

      expect(mbVariable.Data).toEqual(dataToSet);
    });

    it("should set value as convertedData", () => {
      exec();

      expect(mbVariable.Value).toEqual(dataCovertedToValue);
    });

    it("should invoke value change event only once", () => {
      exec();

      expect(_emitValueChangeMock).toHaveBeenCalledTimes(1);
      expect(_emitValueChangeMock.mock.calls[0][0]).toEqual(
        dataCovertedToValue
      );
    });
  });

  describe("_getValue", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;
    let value;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId
      };
      value = 1234;
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length);
      mbVariable._value = value;
      return mbVariable._getValue();
    };

    it("should return value", () => {
      let result = exec();

      expect(result).toEqual(value);
    });
  });

  describe("_setValue", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;
    let valueToSet;
    let _convertValueToDataMock;
    let _emitValueChangeMock;
    let valueConvertedToData;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId
      };
      valueToSet = 1234;
      offset = 2;
      length = 3;
      fcode = 4;
      valueConvertedToData = [1, 2, 3, 4];
      _convertValueToDataMock = jest.fn().mockReturnValue(valueConvertedToData);
      _emitValueChangeMock = jest.fn();
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length);
      mbVariable._emitValueChange = _emitValueChangeMock;
      mbVariable._convertValueToData = _convertValueToDataMock;
      mbVariable._setValue(valueToSet);
    };

    it("should set value of the variable", () => {
      exec();

      expect(mbVariable.Value).toEqual(valueToSet);
    });

    it("should set data as convertedValue", () => {
      exec();

      expect(mbVariable.Data).toEqual(valueConvertedToData);
    });

    it("should not invoke value change event - it is called in base class Variable during setting Value", () => {
      exec();

      expect(_emitValueChangeMock).not.toHaveBeenCalled();
    });
  });

  describe("get Value", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;
    let value;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId
      };
      value = 1234;
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length);
      mbVariable._value = value;
      return mbVariable.Value;
    };

    it("should return value", () => {
      let result = exec();

      expect(result).toEqual(value);
    });
  });

  describe("set Value", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;
    let valueToSet;
    let _convertValueToDataMock;
    let _emitValueChangeMock;
    let valueConvertedToData;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId
      };
      valueToSet = 1234;
      offset = 2;
      length = 3;
      fcode = 4;
      valueConvertedToData = [1, 2, 3, 4];
      _convertValueToDataMock = jest.fn().mockReturnValue(valueConvertedToData);
      _emitValueChangeMock = jest.fn();
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length);
      mbVariable._emitValueChange = _emitValueChangeMock;
      mbVariable._convertValueToData = _convertValueToDataMock;
      mbVariable.Value = valueToSet;
    };

    it("should set value of the variable", () => {
      exec();

      expect(mbVariable.Value).toEqual(valueToSet);
    });

    it("should set data as convertedValue", () => {
      exec();

      expect(mbVariable.Data).toEqual(valueConvertedToData);
    });

    it("should invoke _emitValueChangeMock just once with new value", () => {
      exec();

      expect(_emitValueChangeMock).toHaveBeenCalledTimes(1);
      expect(_emitValueChangeMock.mock.calls[0][0]).toEqual(valueToSet);
    });
  });
});
