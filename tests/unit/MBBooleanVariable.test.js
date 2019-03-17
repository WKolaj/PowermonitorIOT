const MBBooleanVariable = require("../../classes/variable/Modbus/MBBooleanVariable");

describe("MBBooleanVariable", () => {
  describe("constructor", () => {
    let device;
    let name;
    let fcode;
    let offset;

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 1;
      offset = 1;
    });

    let exec = () => {
      return new MBBooleanVariable(device, name, fcode, offset);
    };

    it("should create new MBBoleanVariable based on given arguments", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Device).toEqual(device);
      expect(result.Name).toEqual(name);
      expect(result.FCode).toEqual(fcode);
      expect(result.Offset).toEqual(offset);
    });

    it("should set length to 1", () => {
      let result = exec();

      expect(result.Length).toEqual(1);
    });

    it("should throw if fcode is no associated with boolean variable - fCode 3", () => {
      fcode = 3;
      expect(() => exec()).toThrow();
    });
  });

  describe("_getPossibeFCodes", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 1;
      offset = 1;
    });

    let exec = () => {
      mbVariable = new MBBooleanVariable(device, name, fcode, offset);
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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 1;
      offset = 1;
      dataToConvert = [true];
    });

    let exec = () => {
      mbVariable = new MBBooleanVariable(device, name, fcode, offset);
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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 1;
      offset = 1;
      valueToConvert = true;
    });

    let exec = () => {
      mbVariable = new MBBooleanVariable(device, name, fcode, offset);
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
});
