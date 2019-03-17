const MBByteArrayVariable = require("../../classes/variable/Modbus/MBByteArrayVariable");

describe("MBByteArrayVariable", () => {
  describe("constructor", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let length;

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      length = 4;
    });

    let exec = () => {
      return new MBByteArrayVariable(device, name, fcode, offset, length);
    };

    it("should create new MBBoleanVariable based on given arguments", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Device).toEqual(device);
      expect(result.Name).toEqual(name);
      expect(result.FCode).toEqual(fcode);
      expect(result.Offset).toEqual(offset);
      expect(result.Length).toEqual(length);
    });

    it("should throw if fcode is no associated with byte variable - fCode 1", () => {
      fcode = 1;
      expect(() => exec()).toThrow();
    });
  });

  describe("_getPossibeFCodes", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;
    let length;

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      length = 4;
    });

    let exec = () => {
      mbVariable = new MBByteArrayVariable(device, name, fcode, offset, length);
      return mbVariable._getPossibleFCodes();
    };

    it("should return all fCodes associated with byte operations", () => {
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
    let length;

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      length = 4;
      dataToConvert = [513, 2052, 8208, 32832];
    });

    let exec = () => {
      mbVariable = new MBByteArrayVariable(device, name, fcode, offset, length);
      return mbVariable._convertDataToValue(dataToConvert);
    };

    it("should convert data to value and return it", () => {
      let result = exec();

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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      valueToConvert = [1, 2, 4, 8, 16, 32, 64, 128];
      length = 4;
    });

    let exec = () => {
      mbVariable = new MBByteArrayVariable(device, name, fcode, offset, length);
      return mbVariable._convertValueToData(valueToConvert);
    };

    it("should convert value to data and return it", () => {
      let result = exec();

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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      length = 4;
      //0 1 0 1 0 1 0 1
      byteToCheck = 85;
      mbVariable = new MBByteArrayVariable(device, name, fcode, offset, length);
    });

    it("should get bit value of variable based on bit number", () => {
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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      length = 4;
      byteToSet = 0;
      mbVariable = new MBByteArrayVariable(device, name, fcode, offset, length);
    });

    it("should return value with given bit set", () => {
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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      length = 4;
      byteToClear = 255;
      mbVariable = new MBByteArrayVariable(device, name, fcode, offset, length);
    });

    it("should return value with given bit cleared", () => {
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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      length = 2;
      // 85 - 0 1 0 1 0 1 0 1
      //170 - 1 0 1 0 1 0 1 0
      // 15 - 0 0 0 0 1 1 1 1
      //240 - 1 1 1 1 0 0 0 0
      valueToSet = [85, 170, 15, 240];
      mbVariable = new MBByteArrayVariable(device, name, fcode, offset, length);
      mbVariable.Value = valueToSet;
    });

    it("should get bit value of variable based on byte number and bit number", () => {
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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      length = 2;
      valueToSet = [0, 0, 0, 0];
      mbVariable = new MBByteArrayVariable(device, name, fcode, offset, length);
      mbVariable.Value = valueToSet;
    });

    it("should set bit value of variable based on byte number and bit number", () => {
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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      length = 2;
      valueToSet = [255, 255, 255, 255];
      mbVariable = new MBByteArrayVariable(device, name, fcode, offset, length);
      mbVariable.Value = valueToSet;
    });

    it("should clear bit value of variable based on byte number and bit number", () => {
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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      length = 2;
      // 85 - 0 1 0 1 0 1 0 1
      //170 - 1 0 1 0 1 0 1 0
      // 15 - 0 0 0 0 1 1 1 1
      //240 - 1 1 1 1 0 0 0 0
      valueToSet = [85, 170, 15, 240];
      mbVariable = new MBByteArrayVariable(device, name, fcode, offset, length);
      mbVariable.Value = valueToSet;
    });

    let exec = () => {
      return mbVariable.convertToBits();
    };

    it("should get bit value of variable based on byte number and bit number", () => {
      let result = exec();

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
});
