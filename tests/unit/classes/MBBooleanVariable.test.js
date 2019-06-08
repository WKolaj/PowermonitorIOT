const MBBooleanVariable = require("../../../classes/variable/Modbus/MBBooleanVariable");

describe("MBBooleanVariable", () => {
  describe("constructor", () => {
    let device;

    beforeEach(() => {
      device = "test device";
    });

    let exec = () => {
      return new MBBooleanVariable(device);
    };

    it("should throw if device is empty", () => {
      expect(() => new MBBooleanVariable()).toThrow();
    });

    it("should create new MBBoleanVariable and assign its device", () => {
      let result = exec();

      expect(result.Device).toEqual(device);
    });
  });

  describe("init", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let variable;
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
      fcode = 1;
      offset = 1;
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      variable = new MBBooleanVariable(device, payload);
      return variable.init(payload);
    };

    it("should throw if payload is empty", () => {
      variable = new MBBooleanVariable(device, payload);
      expect(() => variable.init()).toThrow();
    });

    it("should init new MBBoleanVariable based on given arguments", () => {
      exec();

      expect(variable.Name).toEqual(name);
      expect(variable.FCode).toEqual(fcode);
      expect(variable.Offset).toEqual(offset);
    });

    it("should set length to 1", () => {
      exec();

      expect(variable.Length).toEqual(1);
    });

    it("should set default value if value is not given in payload", () => {
      let result = exec();

      expect(variable.Value).toEqual(false);
    });

    it("should throw if fcode is no associated with boolean variable - fCode 3", () => {
      fcode = 3;
      expect(() => exec()).toThrow();
    });

    it("should set GetSingleFCode = 1", () => {
      exec();

      expect(variable.GetSingleFCode).toEqual(1);
    });

    it("should set SetSingleFCode = 15", () => {
      exec();

      expect(variable.SetSingleFCode).toEqual(15);
    });

    it("should set Type to corresponding type", () => {
      exec();

      expect(variable.Type).toEqual("boolean");
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
      fcode = 1;
      offset = 1;
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      mbVariable = new MBBooleanVariable(device);
      mbVariable.init(payload);
      return mbVariable._getPossibleFCodes();
    };

    it("should return all fCodes associated with boolean operations", () => {
      let result = exec();

      expect(result.length).toEqual(3);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(15);
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
      fcode = 1;
      offset = 1;
      dataToConvert = [true];
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      mbVariable = new MBBooleanVariable(device);
      mbVariable.init(payload);
      return mbVariable._convertDataToValue(dataToConvert);
    };

    it("should convert data to value and return it if data is [true]", () => {
      let result = exec();

      expect(result).toEqual(true);
    });

    it("should convert data to value and return it if data is [false]", () => {
      dataToConvert = [false];
      let result = exec();

      expect(result).toEqual(false);
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
      fcode = 1;
      offset = 1;
      valueToConvert = true;
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      mbVariable = new MBBooleanVariable(device);
      mbVariable.init(payload);
      return mbVariable._convertValueToData(valueToConvert);
    };

    it("should convert value to data and return it if value is true", () => {
      let result = exec();

      expect(result).toEqual([true]);
    });

    it("should convert value to data and return it if value is false", () => {
      valueToConvert = false;
      let result = exec();

      expect(result).toEqual([false]);
    });
  });

  describe("editWithPayload", () => {
    let id;
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
    let editId;
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
      fcode = 1;
      getSingleFCode = 1;
      setSingleFCode = 15;
      value = true;
      timeSample = 3;

      editTimeSample = 5;
      editName = "Edited name";
      editOffset = 6;
      editLength = 1;
      editFCode = 15;
      editValue = false;
      editGetSingleFCode = 1;
      editSetSingleFCode = 15;
      editId = undefined;
    });

    let exec = () => {
      payload = {
        id: id,
        name: name,
        timeSample: timeSample,
        fCode: fcode,
        offset: offset,
        length: length,
        getSingleFCode: getSingleFCode,
        setSingleFCode: setSingleFCode,
        value: value
      };

      variable = new MBBooleanVariable(device);
      variable.init(payload);

      editPayload = {
        id: editId,
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

    it("should return edited variable", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(variable);
    });

    it("should edit variable with payload with appropriate parameters if all parameters are passed", () => {
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
      expect(result.Value).toEqual(editValue);
    });

    it("should throw and not change anything if given id is different than id of variable", () => {
      editId = "corruptId";

      expect(() => exec()).toThrow();

      expect(variable).toBeDefined();
      expect(variable.Id).toEqual(payload.id);
      expect(variable.TimeSample).toEqual(payload.timeSample);
      expect(variable.Name).toEqual(payload.name);
      expect(variable.FCode).toEqual(payload.fCode);
      expect(variable.Offset).toEqual(payload.offset);
      expect(variable.Length).toEqual(payload.length);
      expect(variable.GetSingleFCode).toEqual(payload.getSingleFCode);
      expect(variable.SetSingleFCode).toEqual(payload.setSingleFCode);
      expect(variable.Value).toEqual(payload.value);
    });

    it("should throw and not change anything if fCode number is invalid", () => {
      editFCode = 9999;

      expect(() => exec()).toThrow();

      expect(variable).toBeDefined();
      expect(variable.Id).toEqual(payload.id);
      expect(variable.TimeSample).toEqual(payload.timeSample);
      expect(variable.Name).toEqual(payload.name);
      expect(variable.FCode).toEqual(payload.fCode);
      expect(variable.Offset).toEqual(payload.offset);
      expect(variable.Length).toEqual(payload.length);
      expect(variable.GetSingleFCode).toEqual(payload.getSingleFCode);
      expect(variable.SetSingleFCode).toEqual(payload.setSingleFCode);
      expect(variable.Value).toEqual(payload.value);
    });

    it("should edit variable with payload with appropriate parameters if only timeSample", () => {
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

    it("should edit variable with timeSample equal to timeSample given in payload", () => {
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

    it("should edit variable with Name equal to Name given in payload", () => {
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

    it("should edit variable with Offset equal to Offset given in payload", () => {
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

    it("should edit variable with Length equal to Length given in payload", () => {
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

    it("should alwyas set Length to 1 - despite value in payload", () => {
      editLength = 1234;

      let result = exec();

      expect(result.Length).toEqual(1);
    });

    it("should edit variable with FCode equal to FCode given in payload", () => {
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

    it("should edit set GetSingleFCode to 1 - despite value in payload", () => {
      editGetSingleFCode = 1234;

      let result = exec();

      expect(result.GetSingleFCode).toEqual(1);
    });

    it("should edit variable with Value equal to Value given in payload", () => {
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

    it("should edit variable with GetSingleFCode equal to GetSingleFCode given in payload", () => {
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
      expect(result.Value).toEqual(value);
    });

    it("should alwyas set SetSingleFCode to 15 - despite value in payload", () => {
      editSetSingleFCode = 1234;

      let result = exec();

      expect(result.SetSingleFCode).toEqual(15);
    });

    it("should edit variable with SetSingleFCode equal to SetSingleFCode given in payload", () => {
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
      expect(result.Value).toEqual(value);
    });
  });
});
