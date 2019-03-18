const MBVariable = require("../../classes/variable/Modbus/MBVariable");

describe("MBVariable", () => {
  describe("constructor", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let getSingleFCode;
    let setSingleFCode;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      offset = 2;
      length = 3;
      fcode = 4;
      getSingleFCode = 3;
      setSingleFCode = 16;
    });

    let exec = () => {
      return new MBVariable(
        device,
        name,
        fcode,
        offset,
        length,
        setSingleFCode,
        getSingleFCode
      );
    };

    it("should create new MBVariable based on given parameters", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Device).toEqual(device);
      expect(result.Name).toEqual(name);
      expect(result.FCode).toEqual(fcode);
      expect(result.Offset).toEqual(offset);
      expect(result.Length).toEqual(length);
      expect(result.GetSingleFCode).toEqual(getSingleFCode);
      expect(result.SetSingleFCode).toEqual(setSingleFCode);
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

    it("should throw if setSingleFcode is empty", () => {
      setSingleFCode = undefined;

      expect(() => exec()).toThrow();
    });

    it("should throw if getSingleFcode is empty", () => {
      getSingleFCode = undefined;

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

    it("should throw if setSingFcode is not containted in possible functions", () => {
      setSingleFCode = 10;

      expect(() => exec()).toThrow();
    });

    it("should throw if getSingleFcode is not containted in possible functions", () => {
      getSingleFCode = 10;

      expect(() => exec()).toThrow();
    });

    it("should set _getSingleRequest unitId based on given unitId", () => {
      let result = exec();

      expect(result._getSingleRequest.UnitId).toEqual(unitId);
    });

    it("should set _getSingleRequest fCode based on given fCode", () => {
      let result = exec();

      expect(result._getSingleRequest.FCode).toEqual(getSingleFCode);
    });

    it("should set _setSingleRequest unitId based on given unitId", () => {
      let result = exec();

      expect(result._setSingleRequest.UnitId).toEqual(unitId);
    });

    it("should set _setSingleRequest fCode based on given fCode", () => {
      let result = exec();

      expect(result._setSingleRequest.FCode).toEqual(setSingleFCode);
    });

    it("should create and set _getSingleRequest", () => {
      let result = exec();

      expect(result);
      expect(result._getSingleRequest).toBeDefined();
    });

    it("should create and set _setSingleRequest", () => {
      let result = exec();

      expect(result);
      expect(result._setSingleRequest).toBeDefined();
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
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 4);
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
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 3);
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
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 3);
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
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      offset = 2;
      length = 4;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 3);
      return mbVariable.UnitId;
    };

    it("should return unitId", () => {
      let result = exec();

      expect(result).toEqual(unitId);
    });
  });

  describe("SetSingleFCode", () => {
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
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 4);
      return mbVariable.SetSingleFCode;
    };

    it("should return SetSingleFCode", () => {
      let result = exec();

      expect(result).toEqual(mbVariable._setSingleFCode);
    });
  });

  describe("GetSingleFCode", () => {
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
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 4);
      return mbVariable.GetSingleFCode;
    };

    it("should return GetSingleFCode", () => {
      let result = exec();

      expect(result).toEqual(mbVariable._getSingleFCode);
    });
  });

  describe("SetSingleRequest", () => {
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
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 4);
      return mbVariable.SetSingleRequest;
    };

    it("should return SetSingleRequest", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(mbVariable._setSingleRequest);
    });
  });

  describe("GetSingleRequest", () => {
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
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      offset = 2;
      length = 3;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 4);
      return mbVariable.GetSingleRequest;
    };

    it("should return GetSingleRequest", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(mbVariable._getSingleRequest);
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
        UnitId: 2,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      data = [1, 2, 3, 4];
      offset = 2;
      length = 4;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 3);
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
        UnitId: 2,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      dataToSet = [1, 2, 3, 4];
      offset = 2;
      length = 4;
      fcode = 4;
      dataCovertedToValue = 1234;
      _convertDataToValueMock = jest
        .fn()
        .mockReturnValue(dataCovertedToValue, 16, 3);
      _emitValueChangeMock = jest.fn();
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 4);
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

    it("should throw if data length is invalid", () => {
      dataToSet = [1, 2, 3];
      expect(() => exec()).toThrow();
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
        UnitId: 2,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      value = 1234;
      offset = 2;
      length = 4;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 3);
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
        UnitId: 2,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      valueToSet = 1234;
      offset = 2;
      length = 4;
      fcode = 4;
      valueConvertedToData = [1, 2, 3, 4];
      _convertValueToDataMock = jest.fn().mockReturnValue(valueConvertedToData);
      _emitValueChangeMock = jest.fn();
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 4);
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
        UnitId: 2,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      value = 1234;
      offset = 2;
      length = 4;
      fcode = 4;
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 3);
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
        UnitId: 2,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      valueToSet = 1234;
      offset = 2;
      length = 4;
      fcode = 4;
      valueConvertedToData = [1, 2, 3, 4];
      _convertValueToDataMock = jest.fn().mockReturnValue(valueConvertedToData);
      _emitValueChangeMock = jest.fn();
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 3);
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

  describe("getSingle", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;
    let mockInvokeRequest;
    let mockGetValue;
    let mockGetAction;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      mockGetValue = 10;
      mockInvokeRequest = jest.fn().mockResolvedValue(mockGetValue);
      device = {
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2),
          invokeRequests: mockInvokeRequest
        }
      };
      offset = 2;
      length = 3;
      fcode = 4;
      mockGetAction = jest.fn().mockResolvedValue(3);
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 4);
      //Setting in order to check Value by GetSingle
      mbVariable._value = 1234;
      return mbVariable.getSingle();
    };

    it("should return promise that invokes drivers invokeRequests function with argument [this.GetSingleRequest]", async () => {
      let result = await exec();

      expect(mockInvokeRequest).toHaveBeenCalledTimes(1);
      expect(mockInvokeRequest.mock.calls[0][0]).toEqual([
        mbVariable.GetSingleRequest
      ]);
    });

    it("should return new value", async () => {
      let result = await exec();

      expect(result).toEqual(1234);
    });
  });

  describe("setSingle", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let mbVariable;
    let mockInvokeRequest;
    let mockSetValue;
    let mockSetUpdateAction;
    let mockSetValueFunc;

    beforeEach(() => {
      name = "Test variable name";
      unitId = 1;
      mockSetValue = 10;
      mockInvokeRequest = jest.fn().mockResolvedValue(mockSetValue);
      mockSetUpdateAction = jest.fn();
      device = {
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2),
          invokeRequests: mockInvokeRequest
        }
      };
      offset = 2;
      length = 3;
      fcode = 4;
      mockSetValueFunc = jest.fn();
      mockSetAction = jest.fn().mockResolvedValue(3);
    });

    let exec = () => {
      mbVariable = new MBVariable(device, name, fcode, offset, length, 16, 4);
      //Setting in order to check Value by GetSingle
      mbVariable._value = 1234;
      mbVariable._setValue = mockSetValueFunc;
      mbVariable.SetSingleRequest.updateAction = mockSetUpdateAction;
      return mbVariable.setSingle(mockSetValue);
    };

    it("should return promise that invokes drivers invokeRequests function with argument [this.GetSingleRequest]", async () => {
      let result = await exec();

      expect(mockInvokeRequest).toHaveBeenCalledTimes(1);
      expect(mockInvokeRequest.mock.calls[0][0]).toEqual([
        mbVariable.SetSingleRequest
      ]);
      expect(mockSetValueFunc).toHaveBeenCalledTimes(1);
    });

    it("should set data", async () => {
      let result = await exec();

      expect(mockSetValueFunc).toHaveBeenCalledTimes(1);
      expect(mockSetValueFunc.mock.calls[0][0]).toEqual(mockSetValue);
    });

    it("should return new value", async () => {
      let result = await exec();

      expect(result).toEqual(mockSetValue);
    });
  });
});
