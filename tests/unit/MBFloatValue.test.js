const MBFloatVariable = require("../../classes/variable/Modbus/MBFloatVariable");

describe("MBFloatVariable", () => {
  describe("constructor", () => {
    let device;
    let name;
    let fcode;
    let offset;

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
      return new MBFloatVariable(device, name, fcode, offset);
    };

    it("should create new MBFloatVariable based on given arguments", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Device).toEqual(device);
      expect(result.Name).toEqual(name);
      expect(result.FCode).toEqual(fcode);
      expect(result.Offset).toEqual(offset);
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
  });

  describe("_getPossibeFCodes", () => {
    let device;
    let name;
    let fcode;
    let offset;
    let mbVariable;

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
      mbVariable = new MBFloatVariable(device, name, fcode, offset);
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
      dataToConvert = [59769, 17142];
    });

    let exec = () => {
      mbVariable = new MBFloatVariable(device, name, fcode, offset);
      return mbVariable._convertDataToValue(dataToConvert);
    };

    it("should convert data to value and return it", () => {
      let result = exec();

      expect(result).toBeCloseTo(123.456);
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
      valueToConvert = 123.456;
    });

    let exec = () => {
      mbVariable = new MBFloatVariable(device, name, fcode, offset);
      return mbVariable._convertValueToData(valueToConvert);
    };

    it("should convert value to data and return it", () => {
      let result = exec();

      expect(result).toEqual([59769, 17142]);
    });
  });
});
