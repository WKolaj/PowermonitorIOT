const MBInt16Variable = require("../../classes/variable/Modbus/MBInt16Variable");

describe("MBInt16Variable", () => {
  describe("constructor", () => {
    let device;
    let name;
    let fcode;
    let offset;

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
    });

    let exec = () => {
      return new MBInt16Variable(device, name, fcode, offset);
    };

    it("should create new MBInt16Variable based on given arguments", () => {
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

    it("should throw if fcode is no associated with analog variable - fCode 1", () => {
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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
    });

    let exec = () => {
      mbVariable = new MBInt16Variable(device, name, fcode, offset);
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

    beforeEach(() => {
      device = {};
      name = "Test var name";
      fcode = 3;
      offset = 1;
      dataToConvert = [1234];
    });

    let exec = () => {
      mbVariable = new MBInt16Variable(device, name, fcode, offset);
      return mbVariable._convertDataToValue(dataToConvert);
    };

    it("should convert data to value and return it", () => {
      let result = exec();

      expect(result).toEqual(1234);
    });

    it("should be able to covert negative values", () => {
      dataToConvert = [65535];

      let result = exec();

      expect(result).toEqual(-1);
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
      fcode = 3;
      offset = 1;
      valueToConvert = 1234;
    });

    let exec = () => {
      mbVariable = new MBInt16Variable(device, name, fcode, offset);
      return mbVariable._convertValueToData(valueToConvert);
    };

    it("should convert value to data and return it", () => {
      let result = exec();

      expect(result).toEqual([1234]);
    });

    it("should be able to convert negative values", () => {
      valueToConvert = -1;
      let result = exec();

      expect(result).toEqual([65535]);
    });
  });
});
