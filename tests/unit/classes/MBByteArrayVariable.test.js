const MBByteArrayVariable = require("../../../classes/variable/Modbus/MBByteArrayVariable");

describe("MBByteArrayVariable", () => {
  describe("constructor", () => {
    let device;

    beforeEach(() => {
      device = "test device";
    });

    let exec = () => {
      return new MBByteArrayVariable(device);
    };

    it("should throw if device is empty", () => {
      expect(() => new MBByteArrayVariable()).toThrow();
    });

    it("should create new MBByteArrayVariable and assign its device", () => {
      let result = exec();

      expect(result.Device).toEqual(device);
    });
  });

  describe("init", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let payload;
    let variable;

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
      length = 4;
    });

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length
      };
      variable = new MBByteArrayVariable(device);
      return variable.init(payload);
    };

    it("should create new MBByteArray based on given arguments", async () => {
      await exec();

      expect(variable.Name).toEqual(name);
      expect(variable.FCode).toEqual(fcode);
      expect(variable.Offset).toEqual(offset);
      expect(variable.Length).toEqual(length);
    });

    it("should throw if payload is empty", async () => {
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            variable = new MBByteArrayVariable(device);
            await variable.init();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should set default value if value is not given in payload", async () => {
      await exec();

      expect(variable.Value).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it("should throw if fcode is no associated with byte variable - fCode 1", async () => {
      fcode = 1;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            variable = new MBByteArrayVariable(device);
            await variable.init();
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

      expect(variable.Type).toEqual("mbByteArray");
    });
  });

  describe("_getPossibeFCodes", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;
    let length;
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
      length = 4;
    });

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length
      };
      mbVariable = new MBByteArrayVariable(device);
      await mbVariable.init(payload);
      return mbVariable._getPossibleFCodes();
    };

    it("should return all fCodes associated with byte operations", async () => {
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
    let length;
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
      length = 4;
      dataToConvert = [513, 2052, 8208, 32832];
    });

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length
      };
      mbVariable = new MBByteArrayVariable(device);
      await mbVariable.init(payload);
      return mbVariable._convertDataToValue(dataToConvert);
    };

    it("should convert data to value and return it", async () => {
      let result = await exec();

      expect(result).toEqual([1, 2, 4, 8, 16, 32, 64, 128]);
    });
  });

  describe("_convertValueToData", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;
    let valueToConvert;
    let length;
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
      valueToConvert = [1, 2, 4, 8, 16, 32, 64, 128];
      length = 4;
    });

    let exec = async () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length
      };
      mbVariable = new MBByteArrayVariable(device);
      await mbVariable.init(payload);
      return mbVariable._convertValueToData(valueToConvert);
    };

    it("should convert value to data and return it", async () => {
      let result = await exec();

      expect(result).toEqual([513, 2052, 8208, 32832]);
    });
  });

  describe("_getBit", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;
    let length;
    let byteToCheck;
    let payload;

    beforeEach(async () => {
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
      length = 4;
      //0 1 0 1 0 1 0 1
      byteToCheck = 85;
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length
      };
      mbVariable = new MBByteArrayVariable(device);
      await mbVariable.init(payload);
    });

    it("should get bit value of variable based on bit number", async () => {
      expect(mbVariable._getBit(byteToCheck, 0)).toBeTruthy();
      expect(mbVariable._getBit(byteToCheck, 1)).toBeFalsy();
      expect(mbVariable._getBit(byteToCheck, 2)).toBeTruthy();
      expect(mbVariable._getBit(byteToCheck, 3)).toBeFalsy();
      expect(mbVariable._getBit(byteToCheck, 4)).toBeTruthy();
      expect(mbVariable._getBit(byteToCheck, 5)).toBeFalsy();
      expect(mbVariable._getBit(byteToCheck, 6)).toBeTruthy();
      expect(mbVariable._getBit(byteToCheck, 7)).toBeFalsy();
    });
  });

  describe("_setBit", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let byteToSet;
    let payload;

    beforeEach(async () => {
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
      length = 4;
      byteToSet = 0;
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length
      };
      mbVariable = new MBByteArrayVariable(device);
      await mbVariable.init(payload);
    });

    it("should return value with given bit set", async () => {
      expect(mbVariable._setBit(byteToSet, 0)).toEqual(1);
      expect(mbVariable._setBit(byteToSet, 1)).toEqual(2);
      expect(mbVariable._setBit(byteToSet, 2)).toEqual(4);
      expect(mbVariable._setBit(byteToSet, 3)).toEqual(8);
      expect(mbVariable._setBit(byteToSet, 4)).toEqual(16);
      expect(mbVariable._setBit(byteToSet, 5)).toEqual(32);
      expect(mbVariable._setBit(byteToSet, 6)).toEqual(64);
      expect(mbVariable._setBit(byteToSet, 7)).toEqual(128);
    });
  });

  describe("_clearBit", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;
    let byteToClear;
    let payload;

    beforeEach(async () => {
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
      length = 4;
      byteToClear = 255;
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length
      };
      mbVariable = new MBByteArrayVariable(device);
      await mbVariable.init(payload);
    });

    it("should return value with given bit cleared", async () => {
      expect(mbVariable._clearBit(byteToClear, 0)).toEqual(254);
      expect(mbVariable._clearBit(byteToClear, 1)).toEqual(253);
      expect(mbVariable._clearBit(byteToClear, 2)).toEqual(251);
      expect(mbVariable._clearBit(byteToClear, 3)).toEqual(247);
      expect(mbVariable._clearBit(byteToClear, 4)).toEqual(239);
      expect(mbVariable._clearBit(byteToClear, 5)).toEqual(223);
      expect(mbVariable._clearBit(byteToClear, 6)).toEqual(191);
      expect(mbVariable._clearBit(byteToClear, 7)).toEqual(127);
    });
  });

  describe("getBit", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;
    let length;
    let valueToSet;
    let payload;

    beforeEach(async () => {
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
      length = 2;
      // 85 - 0 1 0 1 0 1 0 1
      //170 - 1 0 1 0 1 0 1 0
      // 15 - 0 0 0 0 1 1 1 1
      //240 - 1 1 1 1 0 0 0 0
      valueToSet = [85, 170, 15, 240];
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length
      };
      mbVariable = new MBByteArrayVariable(device);
      await mbVariable.init(payload);
      mbVariable.Value = valueToSet;
    });

    it("should get bit value of variable based on byte number and bit number", async () => {
      expect(mbVariable.getBit(0, 0)).toEqual(true);
      expect(mbVariable.getBit(0, 1)).toEqual(false);
      expect(mbVariable.getBit(0, 2)).toEqual(true);
      expect(mbVariable.getBit(0, 3)).toEqual(false);
      expect(mbVariable.getBit(0, 4)).toEqual(true);
      expect(mbVariable.getBit(0, 5)).toEqual(false);
      expect(mbVariable.getBit(0, 6)).toEqual(true);
      expect(mbVariable.getBit(0, 7)).toEqual(false);

      expect(mbVariable.getBit(1, 0)).toEqual(false);
      expect(mbVariable.getBit(1, 1)).toEqual(true);
      expect(mbVariable.getBit(1, 2)).toEqual(false);
      expect(mbVariable.getBit(1, 3)).toEqual(true);
      expect(mbVariable.getBit(1, 4)).toEqual(false);
      expect(mbVariable.getBit(1, 5)).toEqual(true);
      expect(mbVariable.getBit(1, 6)).toEqual(false);
      expect(mbVariable.getBit(1, 7)).toEqual(true);

      expect(mbVariable.getBit(2, 0)).toEqual(true);
      expect(mbVariable.getBit(2, 1)).toEqual(true);
      expect(mbVariable.getBit(2, 2)).toEqual(true);
      expect(mbVariable.getBit(2, 3)).toEqual(true);
      expect(mbVariable.getBit(2, 4)).toEqual(false);
      expect(mbVariable.getBit(2, 5)).toEqual(false);
      expect(mbVariable.getBit(2, 6)).toEqual(false);
      expect(mbVariable.getBit(2, 7)).toEqual(false);

      expect(mbVariable.getBit(3, 0)).toEqual(false);
      expect(mbVariable.getBit(3, 1)).toEqual(false);
      expect(mbVariable.getBit(3, 2)).toEqual(false);
      expect(mbVariable.getBit(3, 3)).toEqual(false);
      expect(mbVariable.getBit(3, 4)).toEqual(true);
      expect(mbVariable.getBit(3, 5)).toEqual(true);
      expect(mbVariable.getBit(3, 6)).toEqual(true);
      expect(mbVariable.getBit(3, 7)).toEqual(true);
    });
  });

  describe("setBit", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;
    let length;
    let valueToSet;
    let payload;

    beforeEach(async () => {
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
      length = 2;
      valueToSet = [0, 0, 0, 0];
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length
      };
      mbVariable = new MBByteArrayVariable(device);
      await mbVariable.init(payload);
      mbVariable.Value = valueToSet;
    });

    it("should set bit value of variable based on byte number and bit number", async () => {
      mbVariable.setBit(0, 0);
      expect(mbVariable.Value).toEqual([1, 0, 0, 0]);
      mbVariable.setBit(0, 1);
      expect(mbVariable.Value).toEqual([3, 0, 0, 0]);
      mbVariable.setBit(0, 2);
      expect(mbVariable.Value).toEqual([7, 0, 0, 0]);
      mbVariable.setBit(0, 3);
      expect(mbVariable.Value).toEqual([15, 0, 0, 0]);
      mbVariable.setBit(0, 4);
      expect(mbVariable.Value).toEqual([31, 0, 0, 0]);
      mbVariable.setBit(0, 5);
      expect(mbVariable.Value).toEqual([63, 0, 0, 0]);
      mbVariable.setBit(0, 6);
      expect(mbVariable.Value).toEqual([127, 0, 0, 0]);
      mbVariable.setBit(0, 7);
      expect(mbVariable.Value).toEqual([255, 0, 0, 0]);

      mbVariable.setBit(1, 0);
      expect(mbVariable.Value).toEqual([255, 1, 0, 0]);
      mbVariable.setBit(1, 1);
      expect(mbVariable.Value).toEqual([255, 3, 0, 0]);
      mbVariable.setBit(1, 2);
      expect(mbVariable.Value).toEqual([255, 7, 0, 0]);
      mbVariable.setBit(1, 3);
      expect(mbVariable.Value).toEqual([255, 15, 0, 0]);
      mbVariable.setBit(1, 4);
      expect(mbVariable.Value).toEqual([255, 31, 0, 0]);
      mbVariable.setBit(1, 5);
      expect(mbVariable.Value).toEqual([255, 63, 0, 0]);
      mbVariable.setBit(1, 6);
      expect(mbVariable.Value).toEqual([255, 127, 0, 0]);
      mbVariable.setBit(1, 7);
      expect(mbVariable.Value).toEqual([255, 255, 0, 0]);

      mbVariable.setBit(2, 0);
      expect(mbVariable.Value).toEqual([255, 255, 1, 0]);
      mbVariable.setBit(2, 1);
      expect(mbVariable.Value).toEqual([255, 255, 3, 0]);
      mbVariable.setBit(2, 2);
      expect(mbVariable.Value).toEqual([255, 255, 7, 0]);
      mbVariable.setBit(2, 3);
      expect(mbVariable.Value).toEqual([255, 255, 15, 0]);
      mbVariable.setBit(2, 4);
      expect(mbVariable.Value).toEqual([255, 255, 31, 0]);
      mbVariable.setBit(2, 5);
      expect(mbVariable.Value).toEqual([255, 255, 63, 0]);
      mbVariable.setBit(2, 6);
      expect(mbVariable.Value).toEqual([255, 255, 127, 0]);
      mbVariable.setBit(2, 7);
      expect(mbVariable.Value).toEqual([255, 255, 255, 0]);

      mbVariable.setBit(3, 0);
      expect(mbVariable.Value).toEqual([255, 255, 255, 1]);
      mbVariable.setBit(3, 1);
      expect(mbVariable.Value).toEqual([255, 255, 255, 3]);
      mbVariable.setBit(3, 2);
      expect(mbVariable.Value).toEqual([255, 255, 255, 7]);
      mbVariable.setBit(3, 3);
      expect(mbVariable.Value).toEqual([255, 255, 255, 15]);
      mbVariable.setBit(3, 4);
      expect(mbVariable.Value).toEqual([255, 255, 255, 31]);
      mbVariable.setBit(3, 5);
      expect(mbVariable.Value).toEqual([255, 255, 255, 63]);
      mbVariable.setBit(3, 6);
      expect(mbVariable.Value).toEqual([255, 255, 255, 127]);
      mbVariable.setBit(3, 7);
      expect(mbVariable.Value).toEqual([255, 255, 255, 255]);
    });
  });

  describe("clearBit", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;
    let length;
    let valueToSet;
    let payload;

    beforeEach(async () => {
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
      length = 2;
      valueToSet = [255, 255, 255, 255];
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length
      };
      mbVariable = new MBByteArrayVariable(device);
      await mbVariable.init(payload);
      mbVariable.Value = valueToSet;
    });

    it("should clear bit value of variable based on byte number and bit number", async () => {
      mbVariable.clearBit(0, 0);
      expect(mbVariable.Value).toEqual([254, 255, 255, 255]);
      mbVariable.clearBit(0, 1);
      expect(mbVariable.Value).toEqual([252, 255, 255, 255]);
      mbVariable.clearBit(0, 2);
      expect(mbVariable.Value).toEqual([248, 255, 255, 255]);
      mbVariable.clearBit(0, 3);
      expect(mbVariable.Value).toEqual([240, 255, 255, 255]);
      mbVariable.clearBit(0, 4);
      expect(mbVariable.Value).toEqual([224, 255, 255, 255]);
      mbVariable.clearBit(0, 5);
      expect(mbVariable.Value).toEqual([192, 255, 255, 255]);
      mbVariable.clearBit(0, 6);
      expect(mbVariable.Value).toEqual([128, 255, 255, 255]);
      mbVariable.clearBit(0, 7);
      expect(mbVariable.Value).toEqual([0, 255, 255, 255]);

      mbVariable.clearBit(1, 0);
      expect(mbVariable.Value).toEqual([0, 254, 255, 255]);
      mbVariable.clearBit(1, 1);
      expect(mbVariable.Value).toEqual([0, 252, 255, 255]);
      mbVariable.clearBit(1, 2);
      expect(mbVariable.Value).toEqual([0, 248, 255, 255]);
      mbVariable.clearBit(1, 3);
      expect(mbVariable.Value).toEqual([0, 240, 255, 255]);
      mbVariable.clearBit(1, 4);
      expect(mbVariable.Value).toEqual([0, 224, 255, 255]);
      mbVariable.clearBit(1, 5);
      expect(mbVariable.Value).toEqual([0, 192, 255, 255]);
      mbVariable.clearBit(1, 6);
      expect(mbVariable.Value).toEqual([0, 128, 255, 255]);
      mbVariable.clearBit(1, 7);
      expect(mbVariable.Value).toEqual([0, 0, 255, 255]);

      mbVariable.clearBit(2, 0);
      expect(mbVariable.Value).toEqual([0, 0, 254, 255]);
      mbVariable.clearBit(2, 1);
      expect(mbVariable.Value).toEqual([0, 0, 252, 255]);
      mbVariable.clearBit(2, 2);
      expect(mbVariable.Value).toEqual([0, 0, 248, 255]);
      mbVariable.clearBit(2, 3);
      expect(mbVariable.Value).toEqual([0, 0, 240, 255]);
      mbVariable.clearBit(2, 4);
      expect(mbVariable.Value).toEqual([0, 0, 224, 255]);
      mbVariable.clearBit(2, 5);
      expect(mbVariable.Value).toEqual([0, 0, 192, 255]);
      mbVariable.clearBit(2, 6);
      expect(mbVariable.Value).toEqual([0, 0, 128, 255]);
      mbVariable.clearBit(2, 7);
      expect(mbVariable.Value).toEqual([0, 0, 0, 255]);

      mbVariable.clearBit(3, 0);
      expect(mbVariable.Value).toEqual([0, 0, 0, 254]);
      mbVariable.clearBit(3, 1);
      expect(mbVariable.Value).toEqual([0, 0, 0, 252]);
      mbVariable.clearBit(3, 2);
      expect(mbVariable.Value).toEqual([0, 0, 0, 248]);
      mbVariable.clearBit(3, 3);
      expect(mbVariable.Value).toEqual([0, 0, 0, 240]);
      mbVariable.clearBit(3, 4);
      expect(mbVariable.Value).toEqual([0, 0, 0, 224]);
      mbVariable.clearBit(3, 5);
      expect(mbVariable.Value).toEqual([0, 0, 0, 192]);
      mbVariable.clearBit(3, 6);
      expect(mbVariable.Value).toEqual([0, 0, 0, 128]);
      mbVariable.clearBit(3, 7);
      expect(mbVariable.Value).toEqual([0, 0, 0, 0]);
    });
  });

  describe("convertToBits", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;
    let length;
    let valueToSet;
    let payload;

    beforeEach(async () => {
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
      length = 2;
      // 85 - 0 1 0 1 0 1 0 1
      //170 - 1 0 1 0 1 0 1 0
      // 15 - 0 0 0 0 1 1 1 1
      //240 - 1 1 1 1 0 0 0 0
      valueToSet = [85, 170, 15, 240];
      payload = {
        name: name,
        fCode: fcode,
        offset: offset,
        length: length
      };
      mbVariable = new MBByteArrayVariable(device);
      await mbVariable.init(payload);
      mbVariable.Value = valueToSet;
    });

    let exec = () => {
      return mbVariable.convertToBits();
    };

    it("should get bit value of variable based on byte number and bit number", async () => {
      let result = await exec();

      expect(result).toEqual([
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        true,
        true
      ]);
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
      name = "Test variable name";
      unitId = 1;
      device = {
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      };
      id = "1234";
      offset = 2;
      length = 2;
      fcode = 3;
      getSingleFCode = 3;
      setSingleFCode = 16;
      value = [1, 2, 3, 4];
      sampleTime = 3;

      editId = undefined;
      editSampleTime = 5;
      editName = "Edited name";
      editOffset = 6;
      editLength = 3;
      editFCode = 4;
      editValue = [6, 5, 4, 3, 2, 1];
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

      variable = new MBByteArrayVariable(device);
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

    it("should edit variable with appropriate parameters if all parameters are passed", async () => {
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
      expect(result.Value).toEqual(editValue);
    });

    it("should generate identical variable with payload with appropriate parameters if only sampleTime", async () => {
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

    it("should generate variable with sampleTime equal to sampleTime given in payload", async () => {
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

    it("should generate variable with Name equal to Name given in payload", async () => {
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

    it("should generate variable with Offset equal to Offset given in payload", async () => {
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

    it("should generate variable with Length equal to Length given in payload - and set value to [0,0...,0] if it doesn't correspond to given length", async () => {
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
      expect(result.Value).toEqual([0, 0, 0, 0, 0, 0]);
    });

    it("should generate variable with Length equal to Length given in payload - and leave value if it corresponds to given length", async () => {
      editLength = 2;
      editSampleTime = undefined;
      editName = undefined;
      editOffset = undefined;
      editFCode = undefined;
      editGetSingleFCode = undefined;
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
      expect(result.Length).toEqual(editLength);
      expect(result.GetSingleFCode).toEqual(variable.GetSingleFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      expect(result.Value).toEqual(variable.Value);
    });

    it("should generate variable with FCode equal to FCode given in payload", async () => {
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
      //has to change - corresponding to edited fCode
      expect(result.GetSingleFCode).toEqual(editFCode);
      expect(result.SetSingleFCode).toEqual(variable.SetSingleFCode);
      expect(result.Value).toEqual(value);
    });

    it("should alwyas set GetSingleFCode to correspond fcode - despite value in payload", async () => {
      editGetSingleFCode = 1234;

      let result = await exec();

      expect(result.GetSingleFCode).toEqual(editFCode);
    });

    it("should generate variable with Value equal to Value given in payload if length of variable is ok", async () => {
      editValue = [5, 6, 7, 8];
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

    it("should generate variable with SetSingleFCode equal to SetSingleFCode given in payload", async () => {
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
      expect(result.Value).toEqual(value);
    });
  });
});
