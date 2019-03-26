const MBUInt32Variable = require("../../classes/variable/Modbus/MBUInt32Variable");

describe("MBUInt32Variable", () => {
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
      return new MBUInt32Variable(device, payload);
    };

    it("should create new MBUInt32Variable based on given arguments", () => {
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
      mbVariable = new MBUInt32Variable(device, payload);
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
      dataToConvert = [1234, 5678];
    });

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      mbVariable = new MBUInt32Variable(device, payload);
      return mbVariable._convertDataToValue(dataToConvert);
    };

    it("should convert data to value and return it", () => {
      let result = exec();

      expect(result).toEqual(372114642);
    });

    it("should be able to convert large positive values (instead of negative)", () => {
      //65535 => 65536×65535
      //1234 => + 1234
      //4294902994
      dataToConvert = [1234, 65535];

      let result = exec();

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

    let exec = () => {
      payload = {
        name: name,
        fCode: fcode,
        offset: offset
      };
      mbVariable = new MBUInt32Variable(device, payload);
      return mbVariable._convertValueToData(valueToConvert);
    };

    it("should convert value to data and return it", () => {
      let result = exec();
      //console.log(result);
      expect(result).toEqual([1234, 5678]);
    });

    it("should be able to convert negative values", () => {
      valueToConvert = -64302;
      let result = exec();

      expect(result).toEqual([1234, 65535]);
    });
  });
});
