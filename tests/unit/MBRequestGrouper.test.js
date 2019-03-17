const MBRequestGrouper = require("../../classes/driver/Modbus/MBRequestGrouper");

describe("MBRequestGrouper", () => {
  describe("constructor", () => {
    let mbDevice;
    let maxReqLength;

    beforeEach(() => {
      mbDevice = "my test MB Device";
      maxReqLength = 50;
    });

    let exec = () => {
      return new MBRequestGrouper(mbDevice, maxReqLength);
    };

    it("should create new MBRequestGrouper and initialize it using given arguments", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.MBDevice).toEqual(mbDevice);
      expect(result.MaxRequestLength).toEqual(maxReqLength);
    });

    it("should set maxReqLeng to 100 if it is not defined", () => {
      maxReqLength = undefined;
      let result = exec();

      expect(result.MaxRequestLength).toEqual(100);
    });

    it("should throw if MBDevice is empty", () => {
      mbDevice = null;
      expect(() => {
        exec();
      }).toThrow();
    });
  });

  describe("MaxRequestLength", () => {
    let mbDevice;
    let maxReqLength;
    let mbRequestGrouper;

    beforeEach(() => {
      mbDevice = "my test MB Device";
      maxReqLength = 50;
    });

    let exec = () => {
      mbRequestGrouper = new MBRequestGrouper(mbDevice, maxReqLength);
      return mbRequestGrouper.MaxRequestLength;
    };

    it("should return MaxRequestLength", () => {
      let result = exec();
      expect(result).toEqual(maxReqLength);
    });
  });

  describe("MBDevice", () => {
    let mbDevice;
    let maxReqLength;
    let mbRequestGrouper;

    beforeEach(() => {
      mbDevice = "my test MB Device";
      maxReqLength = 50;
    });

    let exec = () => {
      mbRequestGrouper = new MBRequestGrouper(mbDevice, maxReqLength);
      return mbRequestGrouper.MBDevice;
    };

    it("should return MBDevice", () => {
      let result = exec();
      expect(result).toEqual(mbDevice);
    });
  });

  describe("MBDriver", () => {
    let mbDevice;
    let mbDriver;
    let maxReqLength;
    let mbRequestGrouper;

    beforeEach(() => {
      mbDriver = "This is my driver";
      mbDevice = { MBDriver: mbDriver };
      maxReqLength = 50;
    });

    let exec = () => {
      mbRequestGrouper = new MBRequestGrouper(mbDevice, maxReqLength);
      return mbRequestGrouper.MBDriver;
    };

    it("should return MBDriver", () => {
      let result = exec();
      expect(result).toEqual(mbDriver);
    });
  });

  describe("_splitVariablesByFcode", () => {
    let mbDevice;
    let maxReqLength;
    let mbReqGroupper;
    let variablesToSplit;
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let variable4Payload;
    let variable5Payload;
    let variable6Payload;
    let variable7Payload;
    let variable8Payload;
    let variable9Payload;
    let variable10Payload;

    beforeEach(() => {
      mbDevice = "my test MB Device";
      maxReqLength = 50;
      variable1Payload = {
        Name: "Var1",
        FCode: 1
      };
      variable2Payload = {
        Name: "Var2",
        FCode: 2
      };
      variable3Payload = {
        Name: "Var3",
        FCode: 3
      };
      variable4Payload = {
        Name: "Var4",
        FCode: 4
      };
      variable5Payload = {
        Name: "Var5",
        FCode: 5
      };
      variable6Payload = {
        Name: "Var6",
        FCode: 1
      };
      variable7Payload = {
        Name: "Var7",
        FCode: 2
      };
      variable8Payload = {
        Name: "Var8",
        FCode: 3
      };
      variable9Payload = {
        Name: "Var9",
        FCode: 4
      };
      variable10Payload = {
        Name: "Var10",
        FCode: 5
      };
    });

    let exec = () => {
      mbReqGroupper = new MBRequestGrouper(mbDevice, maxReqLength);
      let variables = [
        variable1Payload,
        variable2Payload,
        variable3Payload,
        variable4Payload,
        variable5Payload,
        variable6Payload,
        variable7Payload,
        variable8Payload,
        variable9Payload,
        variable10Payload
      ];

      return mbReqGroupper._splitVariablesByFcode(variables);
    };

    it("should split variables based on its FCode if there are more than one variable with the same fCode", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toEqual(5);

      //Keys are always strings!

      expect(result["1"]).toBeDefined();
      expect(result["1"].length).toEqual(2);
      expect(result["1"]).toContain(variable1Payload);
      expect(result["1"]).toContain(variable6Payload);

      expect(result["2"]).toBeDefined();
      expect(result["2"].length).toEqual(2);
      expect(result["2"]).toContain(variable2Payload);
      expect(result["2"]).toContain(variable7Payload);

      expect(result["3"]).toBeDefined();
      expect(result["3"].length).toEqual(2);
      expect(result["3"]).toContain(variable3Payload);
      expect(result["3"]).toContain(variable8Payload);

      expect(result["4"]).toBeDefined();
      expect(result["4"].length).toEqual(2);
      expect(result["4"]).toContain(variable4Payload);
      expect(result["4"]).toContain(variable9Payload);

      expect(result["5"]).toBeDefined();
      expect(result["5"].length).toEqual(2);
      expect(result["5"]).toContain(variable5Payload);
      expect(result["5"]).toContain(variable10Payload);
    });

    it("should split variables based on its FCode if there are only one variable with the same fCode", () => {
      variable6Payload.FCode = 6;
      variable7Payload.FCode = 7;
      variable8Payload.FCode = 8;
      variable9Payload.FCode = 9;
      variable10Payload.FCode = 10;

      let result = exec();

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toEqual(10);

      //Keys are always strings!

      expect(result["1"]).toBeDefined();
      expect(result["1"].length).toEqual(1);
      expect(result["1"]).toContain(variable1Payload);

      expect(result["2"]).toBeDefined();
      expect(result["2"].length).toEqual(1);
      expect(result["2"]).toContain(variable2Payload);

      expect(result["3"]).toBeDefined();
      expect(result["3"].length).toEqual(1);
      expect(result["3"]).toContain(variable3Payload);

      expect(result["4"]).toBeDefined();
      expect(result["4"].length).toEqual(1);
      expect(result["4"]).toContain(variable4Payload);

      expect(result["5"]).toBeDefined();
      expect(result["5"].length).toEqual(1);
      expect(result["5"]).toContain(variable5Payload);

      expect(result["6"]).toBeDefined();
      expect(result["6"].length).toEqual(1);
      expect(result["6"]).toContain(variable6Payload);

      expect(result["7"]).toBeDefined();
      expect(result["7"].length).toEqual(1);
      expect(result["7"]).toContain(variable7Payload);

      expect(result["8"]).toBeDefined();
      expect(result["8"].length).toEqual(1);
      expect(result["8"]).toContain(variable8Payload);

      expect(result["9"]).toBeDefined();
      expect(result["9"].length).toEqual(1);
      expect(result["9"]).toContain(variable9Payload);

      expect(result["10"]).toBeDefined();
      expect(result["10"].length).toEqual(1);
      expect(result["10"]).toContain(variable10Payload);
    });
  });

  describe("_splitVariablesByUnitId", () => {
    let mbDevice;
    let maxReqLength;
    let mbReqGroupper;
    let variablesToSplit;
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let variable4Payload;
    let variable5Payload;
    let variable6Payload;
    let variable7Payload;
    let variable8Payload;
    let variable9Payload;
    let variable10Payload;

    beforeEach(() => {
      mbDevice = "my test MB Device";
      maxReqLength = 50;
      variable1Payload = {
        Name: "Var1",
        UnitId: 1
      };
      variable2Payload = {
        Name: "Var2",
        UnitId: 2
      };
      variable3Payload = {
        Name: "Var3",
        UnitId: 3
      };
      variable4Payload = {
        Name: "Var4",
        UnitId: 4
      };
      variable5Payload = {
        Name: "Var5",
        UnitId: 5
      };
      variable6Payload = {
        Name: "Var6",
        UnitId: 1
      };
      variable7Payload = {
        Name: "Var7",
        UnitId: 2
      };
      variable8Payload = {
        Name: "Var8",
        UnitId: 3
      };
      variable9Payload = {
        Name: "Var9",
        UnitId: 4
      };
      variable10Payload = {
        Name: "Var10",
        UnitId: 5
      };
    });

    let exec = () => {
      mbReqGroupper = new MBRequestGrouper(mbDevice, maxReqLength);
      let variables = [
        variable1Payload,
        variable2Payload,
        variable3Payload,
        variable4Payload,
        variable5Payload,
        variable6Payload,
        variable7Payload,
        variable8Payload,
        variable9Payload,
        variable10Payload
      ];

      return mbReqGroupper._splitVariablesByUnitId(variables);
    };

    it("should split variables based on its UnitId if there are more than one variable with the same UnitId", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toEqual(5);

      //Keys are always strings!

      expect(result["1"]).toBeDefined();
      expect(result["1"].length).toEqual(2);
      expect(result["1"]).toContain(variable1Payload);
      expect(result["1"]).toContain(variable6Payload);

      expect(result["2"]).toBeDefined();
      expect(result["2"].length).toEqual(2);
      expect(result["2"]).toContain(variable2Payload);
      expect(result["2"]).toContain(variable7Payload);

      expect(result["3"]).toBeDefined();
      expect(result["3"].length).toEqual(2);
      expect(result["3"]).toContain(variable3Payload);
      expect(result["3"]).toContain(variable8Payload);

      expect(result["4"]).toBeDefined();
      expect(result["4"].length).toEqual(2);
      expect(result["4"]).toContain(variable4Payload);
      expect(result["4"]).toContain(variable9Payload);

      expect(result["5"]).toBeDefined();
      expect(result["5"].length).toEqual(2);
      expect(result["5"]).toContain(variable5Payload);
      expect(result["5"]).toContain(variable10Payload);
    });

    it("should split variables based on its UnitId if there are only one variable with the same UnitId", () => {
      variable6Payload.UnitId = 6;
      variable7Payload.UnitId = 7;
      variable8Payload.UnitId = 8;
      variable9Payload.UnitId = 9;
      variable10Payload.UnitId = 10;

      let result = exec();

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toEqual(10);

      //Keys are always strings!

      expect(result["1"]).toBeDefined();
      expect(result["1"].length).toEqual(1);
      expect(result["1"]).toContain(variable1Payload);

      expect(result["2"]).toBeDefined();
      expect(result["2"].length).toEqual(1);
      expect(result["2"]).toContain(variable2Payload);

      expect(result["3"]).toBeDefined();
      expect(result["3"].length).toEqual(1);
      expect(result["3"]).toContain(variable3Payload);

      expect(result["4"]).toBeDefined();
      expect(result["4"].length).toEqual(1);
      expect(result["4"]).toContain(variable4Payload);

      expect(result["5"]).toBeDefined();
      expect(result["5"].length).toEqual(1);
      expect(result["5"]).toContain(variable5Payload);

      expect(result["6"]).toBeDefined();
      expect(result["6"].length).toEqual(1);
      expect(result["6"]).toContain(variable6Payload);

      expect(result["7"]).toBeDefined();
      expect(result["7"].length).toEqual(1);
      expect(result["7"]).toContain(variable7Payload);

      expect(result["8"]).toBeDefined();
      expect(result["8"].length).toEqual(1);
      expect(result["8"]).toContain(variable8Payload);

      expect(result["9"]).toBeDefined();
      expect(result["9"].length).toEqual(1);
      expect(result["9"]).toContain(variable9Payload);

      expect(result["10"]).toBeDefined();
      expect(result["10"].length).toEqual(1);
      expect(result["10"]).toContain(variable10Payload);
    });
  });

  describe("_orderVariablesByOffset", () => {
    let mbDevice;
    let maxReqLength;
    let mbReqGroupper;
    let variablesToSplit;
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let variable4Payload;
    let variable5Payload;
    let variable6Payload;
    let variable7Payload;
    let variable8Payload;
    let variable9Payload;
    let variable10Payload;

    beforeEach(() => {
      mbDevice = "my test MB Device";
      maxReqLength = 50;
      variable1Payload = {
        Name: "Var1",
        Offset: 5
      };
      variable2Payload = {
        Name: "Var2",
        Offset: 4
      };
      variable3Payload = {
        Name: "Var3",
        Offset: 3
      };
      variable4Payload = {
        Name: "Var4",
        Offset: 2
      };
      variable5Payload = {
        Name: "Var5",
        Offset: 1
      };
      variable6Payload = {
        Name: "Var6",
        Offset: 5
      };
      variable7Payload = {
        Name: "Var7",
        Offset: 4
      };
      variable8Payload = {
        Name: "Var8",
        Offset: 3
      };
      variable9Payload = {
        Name: "Var9",
        Offset: 2
      };
      variable10Payload = {
        Name: "Var10",
        Offset: 1
      };
    });

    let exec = () => {
      mbReqGroupper = new MBRequestGrouper(mbDevice, maxReqLength);
      let variables = [
        variable1Payload,
        variable2Payload,
        variable3Payload,
        variable4Payload,
        variable5Payload,
        variable6Payload,
        variable7Payload,
        variable8Payload,
        variable9Payload,
        variable10Payload
      ];

      return mbReqGroupper._orderVariablesByOffset(variables);
    };

    it("should order variables based on its Offset if there are more than one variable with the same Offset", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toEqual(10);

      //Keys are always strings!

      expect(result[0]).toBeDefined();
      expect(result[1]).toBeDefined();
      expect([result[0], result[1]]).toContain(variable5Payload);
      expect([result[0], result[1]]).toContain(variable10Payload);

      expect(result[2]).toBeDefined();
      expect(result[3]).toBeDefined();
      expect([result[2], result[3]]).toContain(variable4Payload);
      expect([result[2], result[3]]).toContain(variable9Payload);

      expect(result[4]).toBeDefined();
      expect(result[5]).toBeDefined();
      expect([result[4], result[5]]).toContain(variable3Payload);
      expect([result[4], result[5]]).toContain(variable8Payload);

      expect(result[6]).toBeDefined();
      expect(result[7]).toBeDefined();
      expect([result[6], result[7]]).toContain(variable2Payload);
      expect([result[6], result[7]]).toContain(variable7Payload);

      expect(result[8]).toBeDefined();
      expect(result[9]).toBeDefined();
      expect([result[8], result[9]]).toContain(variable1Payload);
      expect([result[8], result[9]]).toContain(variable6Payload);
    });

    it("should order variables based on its Offset if there are only one variable with the same Offset", () => {
      variable6Payload.Offset = 10;
      variable7Payload.Offset = 9;
      variable8Payload.Offset = 8;
      variable9Payload.Offset = 7;
      variable10Payload.Offset = 6;

      let result = exec();

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toEqual(10);

      //Keys are always strings!

      expect(result[0]).toEqual(variable5Payload);
      expect(result[1]).toEqual(variable4Payload);
      expect(result[2]).toEqual(variable3Payload);
      expect(result[3]).toEqual(variable2Payload);
      expect(result[4]).toEqual(variable1Payload);
      expect(result[5]).toEqual(variable10Payload);
      expect(result[6]).toEqual(variable9Payload);
      expect(result[7]).toEqual(variable8Payload);
      expect(result[8]).toEqual(variable7Payload);
      expect(result[9]).toEqual(variable6Payload);
    });
  });

  describe("_splitVariablesByUnitIdAndFcodeAndSortByOffset", () => {
    let mbDevice;
    let maxReqLength;
    let mbReqGroupper;
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let variable4Payload;
    let variable5Payload;
    let variable6Payload;
    let variable7Payload;
    let variable8Payload;
    let variable9Payload;
    let variable10Payload;

    beforeEach(() => {
      mbDevice = "my test MB Device";
      maxReqLength = 50;
      variable1Payload = {
        Name: "Var1",
        UnitId: 100,
        FCode: 1,
        Offset: 5
      };
      variable2Payload = {
        Name: "Var2",
        UnitId: 100,
        FCode: 1,
        Offset: 4
      };
      variable3Payload = {
        Name: "Var3",
        UnitId: 100,
        FCode: 2,
        Offset: 3
      };
      variable4Payload = {
        Name: "Var4",
        UnitId: 100,
        FCode: 2,
        Offset: 2
      };
      variable5Payload = {
        Name: "Var5",
        UnitId: 100,
        FCode: 3,
        Offset: 1
      };
      variable6Payload = {
        Name: "Var6",
        UnitId: 200,
        FCode: 3,
        Offset: 5
      };
      variable7Payload = {
        Name: "Var7",
        UnitId: 200,
        FCode: 4,
        Offset: 4
      };
      variable8Payload = {
        Name: "Var8",
        UnitId: 200,
        FCode: 4,
        Offset: 3
      };
      variable9Payload = {
        Name: "Var9",
        UnitId: 200,
        FCode: 5,
        Offset: 2
      };
      variable10Payload = {
        Name: "Var10",
        UnitId: 200,
        FCode: 5,
        Offset: 1
      };
    });

    let exec = () => {
      mbReqGroupper = new MBRequestGrouper(mbDevice, maxReqLength);
      let variables = [
        variable1Payload,
        variable2Payload,
        variable3Payload,
        variable4Payload,
        variable5Payload,
        variable6Payload,
        variable7Payload,
        variable8Payload,
        variable9Payload,
        variable10Payload
      ];

      return mbReqGroupper._splitVariablesByUnitIdAndFcodeAndSortByOffset(
        variables
      );
    };

    it("should split variables first by unitId than order them by offset - if there are several unitIds, fCode and offsets", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toEqual(2);
      expect(result["100"]).toBeDefined();
      expect(result["200"]).toBeDefined();

      expect(Object.keys(result["100"]).length).toEqual(3);
      expect(result["100"]["1"]).toBeDefined();
      expect(result["100"]["2"]).toBeDefined();
      expect(result["100"]["3"]).toBeDefined();

      expect(Object.keys(result["100"]["1"]).length).toEqual(2);
      expect(result["100"]["1"][0]).toEqual(variable2Payload);
      expect(result["100"]["1"][1]).toEqual(variable1Payload);

      expect(Object.keys(result["100"]["2"]).length).toEqual(2);
      expect(result["100"]["2"][0]).toEqual(variable4Payload);
      expect(result["100"]["2"][1]).toEqual(variable3Payload);

      expect(Object.keys(result["100"]["3"]).length).toEqual(1);
      expect(result["100"]["3"][0]).toEqual(variable5Payload);

      expect(Object.keys(result["200"]).length).toEqual(3);
      expect(result["200"]["3"]).toBeDefined();
      expect(result["200"]["4"]).toBeDefined();
      expect(result["200"]["5"]).toBeDefined();

      expect(Object.keys(result["200"]["3"]).length).toEqual(1);
      expect(result["200"]["3"][0]).toEqual(variable6Payload);

      expect(Object.keys(result["200"]["4"]).length).toEqual(2);
      expect(result["200"]["4"][0]).toEqual(variable8Payload);
      expect(result["200"]["4"][1]).toEqual(variable7Payload);

      expect(Object.keys(result["200"]["5"]).length).toEqual(2);
      expect(result["200"]["5"][0]).toEqual(variable10Payload);
      expect(result["200"]["5"][1]).toEqual(variable9Payload);
    });

    it("should split variables first by unitId than order them by offset - if there are only one unitId, and several fCode and offsets", () => {
      variable6Payload.UnitId = 100;
      variable7Payload.UnitId = 100;
      variable8Payload.UnitId = 100;
      variable9Payload.UnitId = 100;
      variable10Payload.UnitId = 100;

      let result = exec();

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toEqual(1);
      expect(result["100"]).toBeDefined();

      expect(Object.keys(result["100"]).length).toEqual(5);
      expect(result["100"]["1"]).toBeDefined();
      expect(result["100"]["2"]).toBeDefined();
      expect(result["100"]["3"]).toBeDefined();
      expect(result["100"]["4"]).toBeDefined();
      expect(result["100"]["5"]).toBeDefined();

      expect(Object.keys(result["100"]["1"]).length).toEqual(2);
      expect(result["100"]["1"][0]).toEqual(variable2Payload);
      expect(result["100"]["1"][1]).toEqual(variable1Payload);

      expect(Object.keys(result["100"]["2"]).length).toEqual(2);
      expect(result["100"]["2"][0]).toEqual(variable4Payload);
      expect(result["100"]["2"][1]).toEqual(variable3Payload);

      expect(Object.keys(result["100"]["3"]).length).toEqual(2);
      expect(result["100"]["3"][0]).toEqual(variable5Payload);
      expect(result["100"]["3"][1]).toEqual(variable6Payload);

      expect(Object.keys(result["100"]["4"]).length).toEqual(2);
      expect(result["100"]["4"][0]).toEqual(variable8Payload);
      expect(result["100"]["4"][1]).toEqual(variable7Payload);

      expect(Object.keys(result["100"]["5"]).length).toEqual(2);
      expect(result["100"]["5"][0]).toEqual(variable10Payload);
      expect(result["100"]["5"][1]).toEqual(variable9Payload);
    });

    it("should split variables first by unitId than order them by offset - if there are only one fCode, and several unitIds and offsets", () => {
      variable1Payload.FCode = 1;
      variable2Payload.FCode = 1;
      variable3Payload.FCode = 1;
      variable4Payload.FCode = 1;
      variable5Payload.FCode = 1;
      variable6Payload.FCode = 1;
      variable7Payload.FCode = 1;
      variable8Payload.FCode = 1;
      variable9Payload.FCode = 1;
      variable10Payload.FCode = 1;

      let result = exec();

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toEqual(2);
      expect(result["100"]).toBeDefined();
      expect(result["200"]).toBeDefined();

      expect(Object.keys(result["100"]).length).toEqual(1);
      expect(result["100"]["1"]).toBeDefined();

      expect(Object.keys(result["100"]["1"]).length).toEqual(5);
      expect(result["100"]["1"][0]).toEqual(variable5Payload);
      expect(result["100"]["1"][1]).toEqual(variable4Payload);
      expect(result["100"]["1"][2]).toEqual(variable3Payload);
      expect(result["100"]["1"][3]).toEqual(variable2Payload);
      expect(result["100"]["1"][4]).toEqual(variable1Payload);

      expect(Object.keys(result["200"]).length).toEqual(1);
      expect(result["200"]["1"]).toBeDefined();

      expect(Object.keys(result["200"]["1"]).length).toEqual(5);
      expect(result["200"]["1"][0]).toEqual(variable10Payload);
      expect(result["200"]["1"][1]).toEqual(variable9Payload);
      expect(result["200"]["1"][2]).toEqual(variable8Payload);
      expect(result["200"]["1"][3]).toEqual(variable7Payload);
      expect(result["200"]["1"][4]).toEqual(variable6Payload);
    });

    it("should split variables first by unitId than order them by offset - if there are several unitIds, fCode but the same offsets", () => {
      variable1Payload.Offset = 10;
      variable2Payload.Offset = 10;
      variable3Payload.Offset = 10;
      variable4Payload.Offset = 10;
      variable5Payload.Offset = 10;
      variable6Payload.Offset = 10;
      variable7Payload.Offset = 10;
      variable8Payload.Offset = 10;
      variable9Payload.Offset = 10;
      variable10Payload.Offset = 10;

      let result = exec();

      expect(result).toBeDefined();
      expect(Object.keys(result).length).toEqual(2);
      expect(result["100"]).toBeDefined();
      expect(result["200"]).toBeDefined();

      expect(Object.keys(result["100"]).length).toEqual(3);
      expect(result["100"]["1"]).toBeDefined();
      expect(result["100"]["2"]).toBeDefined();
      expect(result["100"]["3"]).toBeDefined();

      expect(Object.keys(result["100"]["1"]).length).toEqual(2);
      expect([result["100"]["1"][0], result["100"]["1"][1]]).toContain(
        variable2Payload
      );
      expect([result["100"]["1"][0], result["100"]["1"][1]]).toContain(
        variable1Payload
      );

      expect(Object.keys(result["100"]["2"]).length).toEqual(2);
      expect([result["100"]["2"][0], result["100"]["2"][1]]).toContain(
        variable4Payload
      );
      expect([result["100"]["2"][0], result["100"]["2"][1]]).toContain(
        variable3Payload
      );

      expect(Object.keys(result["100"]["3"]).length).toEqual(1);
      expect(result["100"]["3"][0]).toEqual(variable5Payload);

      expect(Object.keys(result["200"]).length).toEqual(3);
      expect(result["200"]["3"]).toBeDefined();
      expect(result["200"]["4"]).toBeDefined();
      expect(result["200"]["5"]).toBeDefined();

      expect(Object.keys(result["200"]["3"]).length).toEqual(1);
      expect(result["200"]["3"][0]).toEqual(variable6Payload);

      expect(Object.keys(result["200"]["4"]).length).toEqual(2);
      expect([result["200"]["4"][0], result["200"]["4"][1]]).toContain(
        variable8Payload
      );
      expect([result["200"]["4"][0], result["200"]["4"][1]]).toContain(
        variable7Payload
      );

      expect(Object.keys(result["200"]["5"]).length).toEqual(2);
      expect([result["200"]["5"][0], result["200"]["5"][1]]).toContain(
        variable10Payload
      );
      expect([result["200"]["5"][0], result["200"]["5"][1]]).toContain(
        variable9Payload
      );
    });
  });

  describe("ConvertVariablesToRequests", () => {
    let mbDevice;
    let maxReqLength;
    let mbReqGroupper;
    let mbDriver;
    let actionOfSettingData;
    let actionOfGettingData;
    let mbDriverCreateSetActionMock;
    let mbDriverCreateGetActionMock;
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let variable4Payload;
    let variable5Payload;
    let variable6Payload;
    let variable7Payload;
    let variable8Payload;
    let variable9Payload;
    let variable10Payload;
    let variable11Payload;
    let variable12Payload;
    let variable13Payload;
    let variable14Payload;
    let variable15Payload;

    beforeEach(() => {
      mbDriverCreateSetActionMock = jest
        .fn()
        .mockReturnValue(actionOfSettingData);
      mbDriverCreateGetActionMock = jest
        .fn()
        .mockReturnValue(actionOfGettingData);
      mbDriver = {
        createSetDataAction: mbDriverCreateSetActionMock,
        createGetDataAction: mbDriverCreateGetActionMock
      };

      mbDevice = { MBDriver: mbDriver };
      maxReqLength = 50;
      variable1Payload = {
        Name: "Var1",
        UnitId: 100,
        FCode: 1,
        Offset: 5,
        Length: 1
      };
      variable2Payload = {
        Name: "Var2",
        UnitId: 100,
        FCode: 1,
        Offset: 4,
        Length: 1
      };
      variable3Payload = {
        Name: "Var3",
        UnitId: 100,
        FCode: 3,
        Offset: 3,
        Length: 1
      };
      variable4Payload = {
        Name: "Var4",
        UnitId: 100,
        FCode: 3,
        Offset: 2,
        Length: 1
      };
      variable5Payload = {
        Name: "Var5",
        UnitId: 100,
        FCode: 4,
        Offset: 1,
        Length: 1
      };
      variable6Payload = {
        Name: "Var6",
        UnitId: 200,
        FCode: 4,
        Offset: 9,
        Length: 2
      };
      variable7Payload = {
        Name: "Var7",
        UnitId: 200,
        FCode: 15,
        Offset: 7,
        Length: 2
      };
      variable8Payload = {
        Name: "Var8",
        UnitId: 200,
        FCode: 15,
        Offset: 5,
        Length: 2
      };
      variable9Payload = {
        Name: "Var9",
        UnitId: 200,
        FCode: 16,
        Offset: 3,
        Length: 2
      };
      variable10Payload = {
        Name: "Var10",
        UnitId: 200,
        FCode: 16,
        Offset: 1,
        Length: 2
      };
      variable11Payload = {
        Name: "Var11",
        UnitId: 300,
        FCode: 3,
        Offset: 15,
        Length: 2
      };
      variable12Payload = {
        Name: "Var12",
        UnitId: 300,
        FCode: 3,
        Offset: 9,
        Length: 2
      };
      variable13Payload = {
        Name: "Var13",
        UnitId: 300,
        FCode: 3,
        Offset: 7,
        Length: 2
      };
      variable14Payload = {
        Name: "Var14",
        UnitId: 300,
        FCode: 3,
        Offset: 3,
        Length: 2
      };
      variable15Payload = {
        Name: "Var15",
        UnitId: 300,
        FCode: 3,
        Offset: 1,
        Length: 2
      };
    });

    let exec = () => {
      mbReqGroupper = new MBRequestGrouper(mbDevice, maxReqLength);
      let variables = [
        variable1Payload,
        variable2Payload,
        variable3Payload,
        variable4Payload,
        variable5Payload,
        variable6Payload,
        variable7Payload,
        variable8Payload,
        variable9Payload,
        variable10Payload,
        variable11Payload,
        variable12Payload,
        variable13Payload,
        variable14Payload,
        variable15Payload
      ];

      return mbReqGroupper.ConvertVariablesToRequests(variables);
    };

    it("should create requests based on given variables", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.length).toEqual(9);

      expect(result[0].Offset).toEqual(4);
      expect(result[0].Length).toEqual(2);
      expect(result[0].UnitId).toEqual(100);
      expect(result[0].FCode).toEqual(1);
      expect(result[0]._maxRequestLength).toEqual(maxReqLength);

      expect(result[1].Offset).toEqual(2);
      expect(result[1].Length).toEqual(2);
      expect(result[1].UnitId).toEqual(100);
      expect(result[1].FCode).toEqual(3);
      expect(result[1]._maxRequestLength).toEqual(maxReqLength);

      expect(result[2].Offset).toEqual(1);
      expect(result[2].Length).toEqual(1);
      expect(result[2].UnitId).toEqual(100);
      expect(result[2].FCode).toEqual(4);
      expect(result[2]._maxRequestLength).toEqual(maxReqLength);

      expect(result[3].Offset).toEqual(9);
      expect(result[3].Length).toEqual(2);
      expect(result[3].UnitId).toEqual(200);
      expect(result[3].FCode).toEqual(4);
      expect(result[3]._maxRequestLength).toEqual(maxReqLength);

      expect(result[4].Offset).toEqual(5);
      expect(result[4].Length).toEqual(4);
      expect(result[4].UnitId).toEqual(200);
      expect(result[4].FCode).toEqual(15);
      expect(result[4]._maxRequestLength).toEqual(maxReqLength);

      expect(result[5].Offset).toEqual(1);
      expect(result[5].Length).toEqual(4);
      expect(result[5].UnitId).toEqual(200);
      expect(result[5].FCode).toEqual(16);
      expect(result[5]._maxRequestLength).toEqual(maxReqLength);

      expect(result[6].Offset).toEqual(1);
      expect(result[6].Length).toEqual(4);
      expect(result[6].UnitId).toEqual(300);
      expect(result[6].FCode).toEqual(3);
      expect(result[6]._maxRequestLength).toEqual(maxReqLength);

      expect(result[7].Offset).toEqual(7);
      expect(result[7].Length).toEqual(4);
      expect(result[7].UnitId).toEqual(300);
      expect(result[7].FCode).toEqual(3);
      expect(result[7]._maxRequestLength).toEqual(maxReqLength);

      expect(result[8].Offset).toEqual(15);
      expect(result[8].Length).toEqual(2);
      expect(result[8].UnitId).toEqual(300);
      expect(result[8].FCode).toEqual(3);
      expect(result[8]._maxRequestLength).toEqual(maxReqLength);
    });
  });
});
