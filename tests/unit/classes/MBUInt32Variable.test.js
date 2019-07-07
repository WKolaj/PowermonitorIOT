const MBUInt32Variable = require("../../../classes/variable/Modbus/MBUInt32Variable");

describe("MBUInt32Variable", () => {
  describe("constructor", () => {
    let device;

    beforeEach(() => {
      device = "test device";
    });

    let exec = () => {
      return new MBUInt32Variable(device);
    };

    it("should throw if device is empty", () => {
      expect(() => new MBUInt32Variable()).toThrow();
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
      fcode = 3;
      offset = 1;
    });

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      variable = new MBUInt32Variable(device, payload);
      return variable.init(payload);
    };

    it("should throw if payload is empty", async () => {
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            variable = new MBUInt32Variable(device, payload);
            await variable.init();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should init new MBBoleanVariable based on given arguments", async () => {
      await exec();

      expect(variable.Name).toEqual(name);
      expect(variable.FCode).toEqual(fcode);
      expect(variable.Offset).toEqual(offset);
    });

    it("should set length to 2", async () => {
      await exec();

      expect(variable.Length).toEqual(2);
    });

    it("should set default value if value is not given in payload", async () => {
      let result = await exec();

      expect(variable.Value).toEqual(0);
    });

    it("should throw if fcode is no associated with boolean variable - fCode 3", async () => {
      fcode = 1;

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

    it("should set GetSingleFCode = 3", async () => {
      await exec();

      expect(variable.GetSingleFCode).toEqual(3);
    });

    it("should set SetSingleFCode = 16", async () => {
      await exec();

      expect(variable.SetSingleFCode).toEqual(16);
    });

    it("should set Type to corresponding type", async () => {
      await exec();

      expect(variable.Type).toEqual("mbUInt32");
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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      mbVariable = new MBUInt32Variable(device);
      await mbVariable.init(payload);
      return mbVariable._getPossibleFCodes();
    };

    it("should return all fCodes associated with analog operations", async () => {
      let result = await exec();

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
      dataToConvert = [1234, 5678];
    });

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      mbVariable = new MBUInt32Variable(device);
      await mbVariable.init(payload);
      return mbVariable._convertDataToValue(dataToConvert);
    };

    it("should convert data to value and return it", async () => {
      let result = await exec();

      expect(result).toEqual(372114642);
    });

    it("should be able to convert large positive values (instead of negative)", async () => {
      //65535 => 65536×65535
      //1234 => + 1234
      //4294902994
      dataToConvert = [1234, 65535];

      let result = await exec();

      expect(result).toEqual(4294902994);
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

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      mbVariable = new MBUInt32Variable(device);
      await mbVariable.init(payload);
      return mbVariable._convertValueToData(valueToConvert);
    };

    it("should convert value to data and return it", async () => {
      let result = await exec();
      //console.log(result);
      expect(result).toEqual([1234, 5678]);
    });

    it("should be able to convert negative values", async () => {
      valueToConvert = -64302;
      let result = await exec();

      expect(result).toEqual([1234, 65535]);
    });
  });

  describe("editWithPayload", () => {
    let id;
    let editId;
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let unitId;
    let sampleTime;
    let getSingleFCode;
    let setSingleFCode;
    let value;
    let payload;
    let variable;
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
      length = 2;
      fcode = 3;
      getSingleFCode = 3;
      setSingleFCode = 16;
      value = 1234;
      sampleTime = 3;

      editId = undefined;
      editSampleTime = 5;
      editName = "Edited name";
      editOffset = 6;
      editLength = 2;
      editFCode = 16;
      editValue = 4321;
      editGetSingleFCode = 4;
      editSetSingleFCode = 16;
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

      variable = new MBUInt32Variable(device, payload);
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

    it("should return edited variable", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(variable);
    });

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
      expect(result.GetSingleFCode).toEqual(fcode);
      expect(result.SetSingleFCode).toEqual(16);
      expect(result.Value).toEqual(editValue);
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
      expect(variable.Value).toEqual(payload.value);
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
      expect(variable.Value).toEqual(payload.value);
    });

    it("should edit variable with payload with appropriate parameters if no parameters are passed in payload", async () => {
      editSampleTime = undefined;
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

      expect(result.SampleTime).toEqual(variable.SampleTime);
      expect(result.Name).toEqual(variable.Name);
      expect(result.FCode).toEqual(variable.FCode);
      expect(result.Offset).toEqual(variable.Offset);
      expect(result.Length).toEqual(variable.Length);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      expect(result.Value).toEqual(value);
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
      expect(result.Value).toEqual(value);
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
      expect(result.Value).toEqual(value);
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
      expect(result.Value).toEqual(value);
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
      expect(result.Value).toEqual(value);
    });

    it("should alwyas set Length to 2 - despite value in payload", async () => {
      editLength = 1234;

      let result = await exec();

      expect(result.Length).toEqual(2);
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
      expect(result.Value).toEqual(value);
    });

    it("should alwyas set GetSingleFCode to fcode if fcode is read function - despite value in payload", async () => {
      editGetSingleFCode = 1234;

      let result = await exec();

      expect(result.GetSingleFCode).toEqual(fcode);
    });

    it("should alwyas set GetSingleFCode to 3 if fcode is write function - despite value in payload", async () => {
      editGetSingleFCode = 1234;
      editFCode = 16;

      let result = await exec();

      expect(result.GetSingleFCode).toEqual(3);
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
      expect(result.Value).toEqual(editValue);
    });

    it("should alwyas set SetSingleFCode to 16 - despite value in payload", async () => {
      editSetSingleFCode = 1234;

      let result = await exec();

      expect(result.SetSingleFCode).toEqual(16);
    });
  });
});
