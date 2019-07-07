const MBVariable = require("../../../classes/variable/Modbus/MBVariable");

describe("MBVariable", () => {
  describe("constructor", () => {
    let device;

    beforeEach(() => {
      device = "test device";
    });

    let exec = () => {
      return new MBVariable(device);
    };

    it("should create new MBVariable based on given device", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Device).toEqual(device);
    });

    it("should throw if device is empty", () => {
      device = undefined;

      expect(() => exec()).toThrow();
    });
  });

  describe("init", () => {
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
      setValueMockFunction = jest.fn();
      realSetValueMockFunction = MBVariable.prototype._setValue;
    });

    //Should set again real _setValue function
    afterEach(() => {
      MBVariable.prototype._setValue = realSetValueMockFunction;
    });

    let exec = async () => {
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
      variable = new MBVariable(device);
      return variable.init(payload);
    };

    it("should initialize MBVariable based on given parameters", async () => {
      await exec();

      expect(variable.Device).toEqual(device);
      expect(variable.Name).toEqual(name);
      expect(variable.FCode).toEqual(fcode);
      expect(variable.Offset).toEqual(offset);
      expect(variable.Length).toEqual(length);
      expect(variable.GetSingleFCode).toEqual(getSingleFCode);
      expect(variable.SetSingleFCode).toEqual(setSingleFCode);
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
      expect(setValueMockFunction.mock.calls[0][0]).toEqual(value);
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

    it("should throw if fcode is empty", async () => {
      fcode = undefined;

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

    it("should throw if setSingleFcode is empty", async () => {
      setSingleFCode = undefined;

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

    it("should throw if getSingleFcode is empty", async () => {
      getSingleFCode = undefined;

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

    it("should throw if offset is empty", async () => {
      offset = undefined;

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

    it("should throw if length is empty", async () => {
      length = undefined;

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

    it("should if fCode is not containted in possible functions", async () => {
      fcode = 10;

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

    it("should throw if setSingFcode is not containted in possible functions", async () => {
      setSingleFCode = 10;

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

    it("should throw if getSingleFcode is not containted in possible functions", async () => {
      getSingleFCode = 10;

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

    it("should set _getSingleRequest unitId based on given unitId", async () => {
      await exec();

      expect(variable._getSingleRequest.UnitId).toEqual(unitId);
    });

    it("should set _getSingleRequest fCode based on given fCode", async () => {
      await exec();

      expect(variable._getSingleRequest.FCode).toEqual(getSingleFCode);
    });

    it("should set _setSingleRequest unitId based on given unitId", async () => {
      await exec();

      expect(variable._setSingleRequest.UnitId).toEqual(unitId);
    });

    it("should set _setSingleRequest fCode based on given fCode", async () => {
      await exec();

      expect(variable._setSingleRequest.FCode).toEqual(setSingleFCode);
    });

    it("should create and set _getSingleRequest", async () => {
      await exec();

      expect(variable._getSingleRequest).toBeDefined();
    });

    it("should create and set _setSingleRequest", async () => {
      await exec();

      expect(variable._setSingleRequest).toBeDefined();
    });

    it("should not set value if value in payload is not defined", async () => {
      value = undefined;
      await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      return mbVariable.FCode;
    };

    it("should return FCode", async () => {
      let result = await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      return mbVariable.Offset;
    };

    it("should return offset", async () => {
      let result = await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      return mbVariable.Length;
    };

    it("should return length", async () => {
      let result = await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      return mbVariable.UnitId;
    };

    it("should return unitId", async () => {
      let result = await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      return mbVariable.SetSingleFCode;
    };

    it("should return SetSingleFCode", async () => {
      let result = await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      return mbVariable.GetSingleFCode;
    };

    it("should return GetSingleFCode", async () => {
      let result = await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      return mbVariable.SetSingleRequest;
    };

    it("should return SetSingleRequest", async () => {
      let result = await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      return mbVariable.GetSingleRequest;
    };

    it("should return GetSingleRequest", async () => {
      let result = await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      mbVariable._data = data;
      return mbVariable.Data;
    };

    it("should return data", async () => {
      let result = await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      mbVariable._emitValueChange = _emitValueChangeMock;
      mbVariable._convertDataToValue = _convertDataToValueMock;
      mbVariable.Data = dataToSet;
    };

    it("should set data of the variable", async () => {
      await exec();

      expect(mbVariable.Data).toEqual(dataToSet);
    });

    it("should set value as convertedData", async () => {
      await exec();

      expect(mbVariable.Value).toEqual(dataCovertedToValue);
    });

    it("should invoke value change event only once", async () => {
      await exec();

      expect(_emitValueChangeMock).toHaveBeenCalledTimes(1);
      expect(_emitValueChangeMock.mock.calls[0][0]).toEqual(
        dataCovertedToValue
      );
    });

    it("should throw if data length is invalid", async () => {
      dataToSet = [1, 2, 3];
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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      mbVariable._value = value;
      return mbVariable._getValue();
    };

    it("should return value", async () => {
      let result = await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      mbVariable._emitValueChange = _emitValueChangeMock;
      mbVariable._convertValueToData = _convertValueToDataMock;
      mbVariable._setValue(valueToSet);
    };

    it("should set value of the variable", async () => {
      await exec();

      expect(mbVariable.Value).toEqual(valueToSet);
    });

    it("should set data as convertedValue", async () => {
      await exec();

      expect(mbVariable.Data).toEqual(valueConvertedToData);
    });

    it("should not invoke value change event - it is called in base class Variable during setting Value", async () => {
      await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      mbVariable._value = value;
      return mbVariable.Value;
    };

    it("should return value", async () => {
      let result = await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 3,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
      mbVariable._emitValueChange = _emitValueChangeMock;
      mbVariable._convertValueToData = _convertValueToDataMock;
      mbVariable.Value = valueToSet;
    };

    it("should set value of the variable", async () => {
      await exec();

      expect(mbVariable.Value).toEqual(valueToSet);
    });

    it("should set data as convertedValue", async () => {
      await exec();

      expect(mbVariable.Data).toEqual(valueConvertedToData);
    });

    it("should invoke _emitValueChangeMock just once with new value", async () => {
      await exec();

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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };
      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: 4,
        setSingleFCode: 16
      };

      mbVariable = new MBVariable(device);
      await mbVariable.init(payload);
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

    let exec = async () => {
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
      variable = new MBVariable(device);
      await variable.init(payload);
      return variable.Payload;
    };

    it("should generate payload with appropriate parameters", async () => {
      let result = await exec();

      let validPayload = {
        name: variable.Name,
        id: variable.Id,
        sampleTime: variable.SampleTime,
        offset: offset,
        length: length,
        fCode: fcode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if value is undefined", async () => {
      value = undefined;

      let result = await exec();

      let validPayload = {
        name: variable.Name,
        id: variable.Id,
        sampleTime: variable.SampleTime,
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

    let exec = async () => {
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
      variable = new MBVariable(device);
      await variable.init(payload);
      return variable._generatePayload();
    };

    it("should generate payload with appropriate parameters", async () => {
      let result = await exec();

      let validPayload = {
        name: variable.Name,
        id: variable.Id,
        sampleTime: variable.SampleTime,
        offset: offset,
        length: length,
        fCode: fcode,
        value: value,
        archived: archived
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });

    it("should generate payload with appropriate parameters if value is undefined", async () => {
      value = undefined;

      let result = await exec();

      let validPayload = {
        name: variable.Name,
        id: variable.Id,
        sampleTime: variable.SampleTime,
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

  describe("editWithPayload", () => {
    let device;
    let id;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let sampleTime;
    let getSingleFCode;
    let setSingleFCode;
    let setValueMockFunction;
    let getValueMockFunction;
    let value;
    let payload;
    let realSetValueMockFunction;
    let realGetValueMockFunction;
    let variable;
    let editId;
    let editPayload;
    let editSampleTime;
    let editName;
    let editOffset;
    let editLength;
    let editFCode;
    let editValue;
    let editGetSingleFCode;
    let editSetSingleFCode;

    beforeEach(() => {
      id = "1234";
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
      sampleTime = 3;
      realSetValueMockFunction = MBVariable.prototype._setValue;
      realGetValueMockFunction = MBVariable.prototype._getValue;

      editId = undefined;
      editSampleTime = 5;
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

    let exec = async () => {
      payload = {
        id: id,
        name: name,
        sampleTime: sampleTime,
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
      variable = new MBVariable(device);
      await variable.init(payload);

      editPayload = {
        id: editId,
        sampleTime: editSampleTime,
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

    it("should edit variable with payload with appropriate parameters if all parameters are passed", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.SampleTime).toEqual(editSampleTime);
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

    it("should return edited variable", async () => {
      let result = await exec();

      expect(result).toEqual(variable);
    });

    it("should throw and not change anything if given id is different than id of variable", async () => {
      editId = "corruptId";

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

      expect(variable).toBeDefined();
      expect(variable.Id).toEqual(payload.id);
      expect(variable.SampleTime).toEqual(payload.sampleTime);
      expect(variable.Name).toEqual(payload.name);
      expect(variable.FCode).toEqual(payload.fCode);
      expect(variable.Offset).toEqual(payload.offset);
      expect(variable.Length).toEqual(payload.length);
      expect(variable.GetSingleFCode).toEqual(payload.getSingleFCode);
      expect(variable.SetSingleFCode).toEqual(payload.setSingleFCode);
      //First time - creating variable
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
    });

    it("should throw and not change anything if fCode number is invalid", async () => {
      editFCode = 9999;

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

      expect(variable).toBeDefined();
      expect(variable.Id).toEqual(payload.id);
      expect(variable.SampleTime).toEqual(payload.sampleTime);
      expect(variable.Name).toEqual(payload.name);
      expect(variable.FCode).toEqual(payload.fCode);
      expect(variable.Offset).toEqual(payload.offset);
      expect(variable.Length).toEqual(payload.length);
      expect(variable.GetSingleFCode).toEqual(payload.getSingleFCode);
      expect(variable.SetSingleFCode).toEqual(payload.setSingleFCode);
      //First time - creating variable
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
    });

    it("should throw and not change anything if getSingleFCode number is invalid", async () => {
      editGetSingleFCode = 9999;

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

      expect(variable).toBeDefined();
      expect(variable.Id).toEqual(payload.id);
      expect(variable.SampleTime).toEqual(payload.sampleTime);
      expect(variable.Name).toEqual(payload.name);
      expect(variable.FCode).toEqual(payload.fCode);
      expect(variable.Offset).toEqual(payload.offset);
      expect(variable.Length).toEqual(payload.length);
      expect(variable.GetSingleFCode).toEqual(payload.getSingleFCode);
      expect(variable.SetSingleFCode).toEqual(payload.setSingleFCode);
      //First time - creating variable
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
    });

    it("should throw and not change anything if setSingleFCode number is invalid", async () => {
      editSetSingleFCode = 9999;

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

      expect(variable).toBeDefined();
      expect(variable.Id).toEqual(payload.id);
      expect(variable.SampleTime).toEqual(payload.sampleTime);
      expect(variable.Name).toEqual(payload.name);
      expect(variable.FCode).toEqual(payload.fCode);
      expect(variable.Offset).toEqual(payload.offset);
      expect(variable.Length).toEqual(payload.length);
      expect(variable.GetSingleFCode).toEqual(payload.getSingleFCode);
      expect(variable.SetSingleFCode).toEqual(payload.setSingleFCode);
      //First time - creating variable
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
    });

    it("should edit variable with sampleTime equal to sampleTime given in payload", async () => {
      editName = undefined;
      editOffset = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.SampleTime).toEqual(editSampleTime);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
    });

    it("should edit variable with Name equal to Name given in payload", async () => {
      editSampleTime = undefined;
      editOffset = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.SampleTime).toEqual(variable.SampleTime);
      expect(result.Name).toEqual(editName);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
    });

    it("should edit variable with Offset equal to Offset given in payload", async () => {
      editSampleTime = undefined;
      editName = undefined;
      editLength = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.SampleTime).toEqual(variable.SampleTime);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(editOffset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
    });

    it("should edit variable with Length equal to Length given in payload", async () => {
      editSampleTime = undefined;
      editName = undefined;
      editOffset = undefined;
      editFCode = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.SampleTime).toEqual(variable.SampleTime);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(editLength);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
    });

    it("should edit variable with FCode equal to FCode given in payload", async () => {
      editSampleTime = undefined;
      editName = undefined;
      editOffset = undefined;
      editLength = undefined;
      editValue = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.SampleTime).toEqual(variable.SampleTime);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(editFCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
    });

    it("should edit variable with Value equal to Value given in payload", async () => {
      editSampleTime = undefined;
      editName = undefined;
      editFCode = undefined;
      editOffset = undefined;
      editLength = undefined;
      editGetSingleFCode = undefined;
      editSetSingleFCode = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.SampleTime).toEqual(variable.SampleTime);
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

    it("should edit variable with GetSingleFCode equal to GetSingleFCode given in payload", async () => {
      editSampleTime = undefined;
      editName = undefined;
      editFCode = undefined;
      editOffset = undefined;
      editLength = undefined;
      editSetSingleFCode = undefined;
      editValue = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.SampleTime).toEqual(variable.SampleTime);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(editGetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      //First time - creating variable
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
    });

    it("should edit variable with SetSingleFCode equal to SetSingleFCode given in payload", async () => {
      editSampleTime = undefined;
      editName = undefined;
      editFCode = undefined;
      editOffset = undefined;
      editLength = undefined;
      editGetSingleFCode = undefined;
      editValue = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
      expect(result.Events).toEqual(variable.Events);

      expect(result.SampleTime).toEqual(variable.SampleTime);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(editSetSingleFCode);

      //First time - creating variable
      expect(setValueMockFunction).toHaveBeenCalledTimes(1);
    });
  });
});
