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
});
