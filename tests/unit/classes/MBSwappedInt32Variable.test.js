const MBSwappedInt32Variable = require("../../../classes/variable/Modbus/MBSwappedInt32Variable");

describe("MBSwappedInt32Variable", () => {
  describe("constructor", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let payload;

    beforeEach(() => {
      device = {
        UnitId: 2,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      name = "Test var name";
      fcode = 3;
      offset = 1;
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      return new MBSwappedInt32Variable(device, payload);
    };

    it("should create new MBSwappedInt32Variable based on given arguments", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Device).toEqual(device);
      expect(result.Name).toEqual(name);
      expect(result.FCode).toEqual(fcode);
      expect(result.Offset).toEqual(offset);
    });

    it("should set default value if value is not given in payload", () => {
      let result = exec();

      expect(result.Value).toEqual(0);
    });

    it("should throw if payload is empty", () => {
      expect(() => new MBSwappedInt32Variable(device)).toThrow();
    });

    it("should set length to 2", () => {
      let result = exec();

      expect(result.Length).toEqual(2);
    });

    it("should throw if fcode is no associated with analog variable - fCode 1", () => {
      fcode = 1;
      expect(() => exec()).toThrow();
    });

    it("should set GetSingleFCode = 3", () => {
      let result = exec();

      expect(result.GetSingleFCode).toEqual(3);
    });

    it("should set SetSingleFCode = 16", () => {
      let result = exec();

      expect(result.SetSingleFCode).toEqual(16);
    });

    it("should set Type to corresponding type", () => {
      let result = exec();

      expect(result.Type).toEqual("swappedInt32");
    });
  });

  describe("_getPossibeFCodes", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;
    let payload;

    beforeEach(() => {
      device = {
        UnitId: 2,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      name = "Test var name";
      fcode = 3;
      offset = 1;
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      mbVariable = new MBSwappedInt32Variable(device, payload);
      return mbVariable._getPossibleFCodes();
    };

    it("should return all fCodes associated with analog operations", () => {
      let result = exec();

      expect(result.length).toEqual(3);
      expect(result).toContain(3);
      expect(result).toContain(4);
      expect(result).toContain(16);
    });
  });

  describe("_convertDataToValue", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;
    let dataToConvert;
    let payload;

    beforeEach(() => {
      device = {
        UnitId: 2,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      name = "Test var name";
      fcode = 3;
      offset = 1;
      //65535 => 5678 * 65535 = 372113408
      //1234 => + 1234
      // 372114642
      dataToConvert = [5678, 1234];
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      mbVariable = new MBSwappedInt32Variable(device, payload);
      return mbVariable._convertDataToValue(dataToConvert);
    };

    it("should convert data to value and return it", () => {
      let result = exec();

      expect(result).toEqual(372114642);
    });

    it("should be able to covert negative values", () => {
      //65535 => -1 * 65535
      //1234 => + 1234
      // -64302
      dataToConvert = [65535, 1234];

      let result = exec();

      expect(result).toEqual(-64302);
    });
  });

  describe("_convertValueToData", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;
    let valueToConvert;
    let payload;

    beforeEach(() => {
      device = {
        UnitId: 2,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      name = "Test var name";
      fcode = 3;
      offset = 1;
      valueToConvert = 372114642;
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      mbVariable = new MBSwappedInt32Variable(device, payload);
      return mbVariable._convertValueToData(valueToConvert);
    };

    it("should convert value to data and return it", () => {
      let result = exec();
      //console.log(result);
      expect(result).toEqual([5678, 1234]);
    });

    it("should be able to convert negative values", () => {
      valueToConvert = -64302;
      let result = exec();

      expect(result).toEqual([65535, 1234]);
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
    let value;
    let payload;
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
      length = 2;
      fcode = 3;
      getSingleFCode = 3;
      setSingleFCode = 16;
      value = 1234;
      timeSample = 3;

      editTimeSample = 5;
      editName = "Edited name";
      editOffset = 6;
      editLength = 2;
      editFCode = 16;
      editValue = 4321;
      editGetSingleFCode = 4;
      editSetSingleFCode = 16;
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

      variable = new MBSwappedInt32Variable(device, payload);

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
      expect(result.GetSingleFCode).toEqual(fcode);
      expect(result.SetSingleFCode).toEqual(16);
      expect(result.Value).toEqual(editValue);
    });

    it("should generate identical variable with payload with appropriate parameters if no parameters are passed in payload", () => {
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
      expect(result.Value).toEqual(value);
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
      expect(result.Value).toEqual(value);
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
      expect(result.Value).toEqual(value);
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
      expect(result.Value).toEqual(value);
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
      expect(result.Value).toEqual(value);
    });

    it("should alwyas set Length to 2 - despite value in payload", () => {
      editLength = 1234;

      let result = exec();

      expect(result.Length).toEqual(2);
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
      expect(result.Value).toEqual(value);
    });

    it("should alwyas set GetSingleFCode to fcode if fcode is read function - despite value in payload", () => {
      editGetSingleFCode = 1234;

      let result = exec();

      expect(result.GetSingleFCode).toEqual(fcode);
    });

    it("should alwyas set GetSingleFCode to 3 if fcode is write function - despite value in payload", () => {
      editGetSingleFCode = 1234;
      editFCode = 16;

      let result = exec();

      expect(result.GetSingleFCode).toEqual(3);
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
      expect(result.Value).toEqual(editValue);
    });

    it("should alwyas set SetSingleFCode to 16 - despite value in payload", () => {
      editSetSingleFCode = 1234;

      let result = exec();

      expect(result.SetSingleFCode).toEqual(16);
    });
  });
});
