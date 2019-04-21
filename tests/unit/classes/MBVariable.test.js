const MBVariable = require("../../../classes/variable/Modbus/MBVariable");

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
    let setValueMockFunction;
    let value;
    let payload;
    let realSetValueMockFunction;

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
      value = 1234;
      setValueMockFunction = jest.fn();
      realSetValueMockFunction = MBVariable.prototype._setValue;
    });

    //Should set again real _setValue function
    afterEach(() => {
      MBVariable.prototype._setValue = realSetValueMockFunction;
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value
      };
      MBVariable.prototype._setValue = setValueMockFunction;

      return new MBVariable(device, payload);
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
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
      expect(setValueMockFunction.mock.calls[0][0]).toEqual(value);
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

    it("should not set value if value in payload is not defined", () => {
      value = undefined;
      let result = exec();

      expect(setValueMockFunction).not.toHaveBeenCalled();
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device, payload);
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
    let payload;

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
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };

      mbVariable = new MBVariable(device, payload);
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

  describe("get Payload", () => {
    let device;
    let name;
    let archived;
    let fcode;
    let offset;
    let length;
    let unitId;
    let getSingleFCode;
    let setSingleFCode;
    let setValueMockFunction;
    let getValueMockFunction;
    let value;
    let payload;
    let realSetValueMockFunction;
    let realGetValueMockFunction;
    let variable;

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
      value = 1234;
      realSetValueMockFunction = MBVariable.prototype._setValue;
      realGetValueMockFunction = MBVariable.prototype._getValue;
      archived = true;
    });

    //Should set again real _setValue function
    afterEach(() => {
      MBVariable.prototype._setValue = realSetValueMockFunction;
      MBVariable.prototype._getValue = realGetValueMockFunction;
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value,
        archived: archived
      };

      setValueMockFunction = jest.fn();
      getValueMockFunction = jest.fn().mockReturnValue(value);

      MBVariable.prototype._setValue = setValueMockFunction;
      MBVariable.prototype._getValue = getValueMockFunction;
      variable = new MBVariable(device, payload);
      return variable.Payload;
    };

    it("should generate payload with appropriate parameters", () => {
      let result = exec();

      let validPayload = {
        name: variable.Name,
        id: variable.Id,
        timeSample: variable.TimeSample,
        offset: offset,
        length: length,
        fCode: fcode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if value is undefined", () => {
      value = undefined;

      let result = exec();

      let validPayload = {
        name: variable.Name,
        id: variable.Id,
        timeSample: variable.TimeSample,
        offset: offset,
        length: length,
        fCode: fcode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });
  });

  describe("_generatePayload", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let getSingleFCode;
    let setSingleFCode;
    let setValueMockFunction;
    let getValueMockFunction;
    let value;
    let payload;
    let realSetValueMockFunction;
    let realGetValueMockFunction;
    let variable;
    let archived;

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
      value = 1234;
      realSetValueMockFunction = MBVariable.prototype._setValue;
      realGetValueMockFunction = MBVariable.prototype._getValue;
      archived = true;
    });

    //Should set again real _setValue function
    afterEach(() => {
      MBVariable.prototype._setValue = realSetValueMockFunction;
      MBVariable.prototype._getValue = realGetValueMockFunction;
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value,
        archived: archived
      };

      setValueMockFunction = jest.fn();
      getValueMockFunction = jest.fn().mockReturnValue(value);

      MBVariable.prototype._setValue = setValueMockFunction;
      MBVariable.prototype._getValue = getValueMockFunction;
      variable = new MBVariable(device, payload);
      return variable._generatePayload();
    };

    it("should generate payload with appropriate parameters", () => {
      let result = exec();

      let validPayload = {
        name: variable.Name,
        id: variable.Id,
        timeSample: variable.TimeSample,
        offset: offset,
        length: length,
        fCode: fcode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if value is undefined", () => {
      value = undefined;

      let result = exec();

      let validPayload = {
        name: variable.Name,
        id: variable.Id,
        timeSample: variable.TimeSample,
        offset: offset,
        length: length,
        fCode: fcode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });
  });

  describe("_generatePayloadToEdit", () => {
    let device;
    let name;
    let archived;
    let fcode;
    let offset;
    let length;
    let unitId;
    let timeSample;
    let getSingleFCode;
    let setSingleFCode;
    let setValueMockFunction;
    let getValueMockFunction;
    let value;
    let payload;
    let realSetValueMockFunction;
    let realGetValueMockFunction;
    let variable;
    let editPayload;
    let editTimeSample;
    let editName;
    let editOffset;
    let editLength;
    let editFCode;
    let editValue;
    let editGetSingleFCode;
    let editSetSingleFCode;
    let editArchived;

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
      value = 1234;
      timeSample = 3;
      realSetValueMockFunction = MBVariable.prototype._setValue;
      realGetValueMockFunction = MBVariable.prototype._getValue;
      archived = false;

      editTimeSample = 5;
      editName = "Edited name";
      editOffset = 6;
      editLength = 7;
      editFCode = 3;
      editValue = 4321;
      editGetSingleFCode = 4;
      editSetSingleFCode = 16;
      editArchived = true;
    });

    //Should set again real _setValue function
    afterEach(() => {
      MBVariable.prototype._setValue = realSetValueMockFunction;
      MBVariable.prototype._getValue = realGetValueMockFunction;
    });

    let exec = () => {
      payload = {
        name: name,
        timeSample: timeSample,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value,
        archived: archived
      };

      setValueMockFunction = jest.fn();
      getValueMockFunction = jest.fn().mockReturnValue(value);

      MBVariable.prototype._setValue = setValueMockFunction;
      MBVariable.prototype._getValue = getValueMockFunction;
      variable = new MBVariable(device, payload);

      editPayload = {
        timeSample: editTimeSample,
        name: editName,
        fCode: editFCode,
        offset: editOffset,
        length: editLength,
        getSingleFCode: editGetSingleFCode,
        setSingleFCode: editSetSingleFCode,
        value: editValue,
        archived: editArchived
      };

      return variable._generatePayloadToEdit(editPayload);
    };

    it("should generate payload with appropriate parameters if all parameters are passed", () => {
      let result = exec();

      let validPayload = {
        timeSample: editTimeSample,
        name: editName,
        fCode: editFCode,
        offset: editOffset,
        length: editLength,
        getSingleFCode: editGetSingleFCode,
        setSingleFCode: editSetSingleFCode,
        value: editValue,
        archived: editArchived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if only timeSample is passed", () => {
      editName = undefined;
      editOffset = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;
      editArchived = undefined;

      let result = exec();

      let validPayload = {
        timeSample: editTimeSample,
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if only name is passed", () => {
      editTimeSample = undefined;
      editOffset = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;
      editArchived = undefined;

      let result = exec();

      let validPayload = {
        timeSample: timeSample,
        name: editName,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if only name is offset", () => {
      editTimeSample = undefined;
      editName = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;
      editArchived = undefined;

      let result = exec();

      let validPayload = {
        timeSample: timeSample,
        name: name,
        fCode: fcode,
        offset: editOffset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if only name is length", () => {
      editTimeSample = undefined;
      editName = undefined;
      editOffset = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;
      editArchived = undefined;

      let result = exec();

      let validPayload = {
        timeSample: timeSample,
        name: name,
        fCode: fcode,
        offset: offset,
        length: editLength,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if only name is fcode", () => {
      editTimeSample = undefined;
      editName = undefined;
      editOffset = undefined;
      editLength = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;
      editArchived = undefined;

      let result = exec();

      let validPayload = {
        timeSample: timeSample,
        name: name,
        fCode: editFCode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if only name is value", () => {
      editTimeSample = undefined;
      editName = undefined;
      editOffset = undefined;
      editLength = undefined;
      editFCode = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;
      editArchived = undefined;

      let result = exec();

      let validPayload = {
        timeSample: timeSample,
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: editValue,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if only name is getSingleFCode", () => {
      editTimeSample = undefined;
      editName = undefined;
      editOffset = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editSetSingleFCode = undefined;
      editArchived = undefined;

      let result = exec();

      let validPayload = {
        timeSample: timeSample,
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: editGetSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if only name is setSingleFCode", () => {
      editTimeSample = undefined;
      editName = undefined;
      editOffset = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editArchived = undefined;

      let result = exec();

      let validPayload = {
        timeSample: timeSample,
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: editSetSingleFCode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if only archived is defined", () => {
      editTimeSample = undefined;
      editName = undefined;
      editOffset = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = exec();

      let validPayload = {
        timeSample: timeSample,
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value,
        archived: editArchived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });
  });

  describe("editWithPayload", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let timeSample;
    let getSingleFCode;
    let setSingleFCode;
    let setValueMockFunction;
    let getValueMockFunction;
    let value;
    let payload;
    let realSetValueMockFunction;
    let realGetValueMockFunction;
    let variable;
    let editPayload;
    let editTimeSample;
    let editName;
    let editOffset;
    let editLength;
    let editFCode;
    let editValue;
    let editGetSingleFCode;
    let editSetSingleFCode;

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
      value = 1234;
      timeSample = 3;
      realSetValueMockFunction = MBVariable.prototype._setValue;
      realGetValueMockFunction = MBVariable.prototype._getValue;

      editTimeSample = 5;
      editName = "Edited name";
      editOffset = 6;
      editLength = 7;
      editFCode = 3;
      editValue = 4321;
      editGetSingleFCode = 4;
      editSetSingleFCode = 16;
    });

    //Should set again real _setValue function
    afterEach(() => {
      MBVariable.prototype._setValue = realSetValueMockFunction;
      MBVariable.prototype._getValue = realGetValueMockFunction;
    });

    let exec = () => {
      payload = {
        name: name,
        timeSample: timeSample,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value
      };

      setValueMockFunction = jest.fn();
      getValueMockFunction = jest.fn().mockReturnValue(value);

      MBVariable.prototype._setValue = setValueMockFunction;
      MBVariable.prototype._getValue = getValueMockFunction;
      variable = new MBVariable(device, payload);

      editPayload = {
        timeSample: editTimeSample,
        name: editName,
        fCode: editFCode,
        offset: editOffset,
        length: editLength,
        getSingleFCode: editGetSingleFCode,
        setSingleFCode: editSetSingleFCode,
        value: editValue
      };

      return variable.editWithPayload(editPayload);
    };

    it("should generate variable with payload with appropriate parameters if all parameters are passed", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.TimeSample).toEqual(editTimeSample);
      expect(result.Name).toEqual(editName);
      expect(result.FCode).toEqual(editFCode);
      expect(result.Offset).toEqual(editOffset);
      expect(result.Length).toEqual(editLength);
      expect(result.GetSingleFCode).toEqual(editGetSingleFCode);
      expect(result.SetSingleFCode).toEqual(editSetSingleFCode);
      //First time - creating variable - second time editing
      expect(setValueMockFunction).toHaveBeenCalledTimes(2);
      expect(setValueMockFunction.mock.calls[1][0]).toEqual(editValue);
    });

    it("should generate identical variable with payload with appropriate parameters if only timeSample", () => {
      editTimeSample = undefined;
      editName = undefined;
      editOffset = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.TimeSample).toEqual(variable.TimeSample);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable - second time editing
      expect(setValueMockFunction).toHaveBeenCalledTimes(2);
      expect(setValueMockFunction.mock.calls[1][0]).toEqual(value);
    });

    it("should generate variable with timeSample equal to timeSample given in payload", () => {
      editName = undefined;
      editOffset = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.TimeSample).toEqual(editTimeSample);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable - second time editing
      expect(setValueMockFunction).toHaveBeenCalledTimes(2);
      expect(setValueMockFunction.mock.calls[1][0]).toEqual(value);
    });

    it("should generate variable with Name equal to Name given in payload", () => {
      editTimeSample = undefined;
      editOffset = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.TimeSample).toEqual(variable.TimeSample);
      expect(result.Name).toEqual(editName);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable - second time editing
      expect(setValueMockFunction).toHaveBeenCalledTimes(2);
      expect(setValueMockFunction.mock.calls[1][0]).toEqual(value);
    });

    it("should generate variable with Offset equal to Offset given in payload", () => {
      editTimeSample = undefined;
      editName = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.TimeSample).toEqual(variable.TimeSample);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(editOffset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable - second time editing
      expect(setValueMockFunction).toHaveBeenCalledTimes(2);
      expect(setValueMockFunction.mock.calls[1][0]).toEqual(value);
    });

    it("should generate variable with Length equal to Length given in payload", () => {
      editTimeSample = undefined;
      editName = undefined;
      editOffset = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.TimeSample).toEqual(variable.TimeSample);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(editLength);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable - second time editing
      expect(setValueMockFunction).toHaveBeenCalledTimes(2);
      expect(setValueMockFunction.mock.calls[1][0]).toEqual(value);
    });

    it("should generate variable with FCode equal to FCode given in payload", () => {
      editTimeSample = undefined;
      editName = undefined;
      editOffset = undefined;
      editLength = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.TimeSample).toEqual(variable.TimeSample);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(editFCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable - second time editing
      expect(setValueMockFunction).toHaveBeenCalledTimes(2);
      expect(setValueMockFunction.mock.calls[1][0]).toEqual(value);
    });

    it("should generate variable with Value equal to Value given in payload", () => {
      editTimeSample = undefined;
      editName = undefined;
      editFCode = undefined;
      editOffset = undefined;
      editLength = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.TimeSample).toEqual(variable.TimeSample);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable - second time editing
      expect(setValueMockFunction).toHaveBeenCalledTimes(2);
      expect(setValueMockFunction.mock.calls[1][0]).toEqual(editValue);
    });

    it("should generate variable with GetSingleFCode equal to GetSingleFCode given in payload", () => {
      editTimeSample = undefined;
      editName = undefined;
      editFCode = undefined;
      editOffset = undefined;
      editLength = undefined;
      editSetSingleFCode = undefined;
      editValue = undefined;

      let result = exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.TimeSample).toEqual(variable.TimeSample);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(editGetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable - second time editing
      expect(setValueMockFunction).toHaveBeenCalledTimes(2);
      expect(setValueMockFunction.mock.calls[1][0]).toEqual(variable.Value);
    });

    it("should generate variable with SetSingleFCode equal to SetSingleFCode given in payload", () => {
      editTimeSample = undefined;
      editName = undefined;
      editFCode = undefined;
      editOffset = undefined;
      editLength = undefined;
      editGetSingleFCode = undefined;
      editValue = undefined;

      let result = exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.TimeSample).toEqual(variable.TimeSample);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(editSetSingleFCode);

      //First time - creating variable - second time editing
      expect(setValueMockFunction).toHaveBeenCalledTimes(2);
      expect(setValueMockFunction.mock.calls[1][0]).toEqual(variable.Value);
    });
  });
});
