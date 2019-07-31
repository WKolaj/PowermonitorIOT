const S7RequestGrouper = require("../../../classes/driver/S7/S7RequestGrouper");
const S7Int16Variable = require("../../../classes/variable/S7/S7Int16Variable");
const S7Device = require("../../../classes/device/S7/S7Device");
const S7Request = require("../../../classes/driver/S7/S7Request");
const { snooze } = require("../../../utilities/utilities");

describe("S7RequestGrouper", () => {
  describe("constructor", () => {
    let device;
    let maxRequestLength;

    beforeEach(() => {
      device = "fakeDevice";
      maxRequestLength = 123;
    });

    let exec = async () => {
      return new S7RequestGrouper(device, maxRequestLength);
    };

    it("should return new S7RequestGroupper", async () => {
      let result = await exec();

      expect(result).toBeDefined();
    });

    it("should set device in request groupper", async () => {
      let result = await exec();

      expect(result.S7Device).toEqual(device);
    });

    it("should set maxReqLength to given value", async () => {
      let result = await exec();

      expect(result.MaxRequestLength).toEqual(maxRequestLength);
    });

    it("should set maxReqLength to 1000 if it is not defined", async () => {
      maxRequestLength = undefined;
      let result = await exec();

      expect(result.MaxRequestLength).toEqual(1000);
    });
  });

  describe("ConvertRequestsToIDValuePair", () => {
    let device;

    let variable1;
    let variable2;
    let variable3;
    let variable4;
    let variable5;
    let variable6;
    let variable7;
    let variable8;
    let variable9;

    let reqGrouper;

    let request1;
    let request2;
    let request3;

    let requests;

    beforeEach(async () => {
      device = new S7Device();

      await device.init({
        ipAdress: "192.168.1.131",
        slot: 1,
        rack: 0,
        name: "test",
        type: "s7Device",
        timeout: 500,
        isActive: false
      });

      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      await variable1.init({
        name: "var1",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable2.init({
        name: "var2",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable3.init({
        name: "var3",
        type: "s7Int16",
        offset: 4,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable4.init({
        name: "var4",
        type: "s7Int16",
        offset: 6,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable5.init({
        name: "var5",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 2,
        write: false
      });

      await variable6.init({
        name: "var6",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 2,
        write: false
      });

      await variable7.init({
        name: "var7",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 3,
        write: false
      });

      await variable8.init({
        name: "var8",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 3,
        write: false
      });

      await variable9.init({
        name: "var9",
        type: "s7Int16",
        offset: 4,
        areaType: "DB",
        dbNumber: 3,
        write: false
      });

      request1 = new S7Request(device.S7Driver, "DB", false, 1000, 1);
      request2 = new S7Request(device.S7Driver, "DB", false, 1000, 2);
      request3 = new S7Request(device.S7Driver, "DB", false, 1000, 3);

      request1.addVariable(variable1);
      request1.addVariable(variable2);
      request1.addVariable(variable3);
      request1.addVariable(variable4);
      request2.addVariable(variable5);
      request2.addVariable(variable6);
      request3.addVariable(variable7);
      request3.addVariable(variable8);
      request3.addVariable(variable9);

      requests = [request1, request2, request3];
    });

    let exec = async () => {
      reqGrouper = new S7RequestGrouper(device, 1000);
      return reqGrouper.ConvertRequestsToIDValuePair(requests);
    };

    it("should get all values from all requests and make one whole object containing variables - if all requests contains several variables", async () => {
      let result = await exec();

      let expectedResult = {
        [variable1.Id]: variable1,
        [variable2.Id]: variable2,
        [variable3.Id]: variable3,
        [variable4.Id]: variable4,
        [variable5.Id]: variable5,
        [variable6.Id]: variable6,
        [variable7.Id]: variable7,
        [variable8.Id]: variable8,
        [variable9.Id]: variable9
      };

      await snooze(100);

      expect(result).toEqual(expectedResult);
    });

    // it("should get all values from all requests and make one whole object containing variables - if one request contains only one variable", async () => {
    //   request2 = new S7Request(device.S7Driver, "DB", false, 1000, 2);

    //   request2.addVariable(variable5);

    //   requests = [request1, request2, request3];

    //   let result = await exec();

    //   let expectedResult = {
    //     [variable1.Id]: variable1,
    //     [variable2.Id]: variable2,
    //     [variable3.Id]: variable3,
    //     [variable4.Id]: variable4,
    //     [variable5.Id]: variable5,
    //     [variable7.Id]: variable7,
    //     [variable8.Id]: variable8,
    //     [variable9.Id]: variable9
    //   };

    //   expect(result).toEqual(expectedResult);
    // });

    // it("should get all values from all requests and make one whole object containing variables - if one request contains no variable", async () => {
    //   request2 = new S7Request(device.S7Driver, "DB", false, 1000, 2);

    //   requests = [request1, request2, request3];

    //   let result = await exec();

    //   let expectedResult = {
    //     [variable1.Id]: variable1,
    //     [variable2.Id]: variable2,
    //     [variable3.Id]: variable3,
    //     [variable4.Id]: variable4,
    //     [variable7.Id]: variable7,
    //     [variable8.Id]: variable8,
    //     [variable9.Id]: variable9
    //   };

    //   expect(result).toEqual(expectedResult);
    // });

    // it("should get all values from all requests and make one whole object containing variables - if there is only one request", async () => {
    //   requests = [request1];

    //   let result = await exec();

    //   let expectedResult = {
    //     [variable1.Id]: variable1,
    //     [variable2.Id]: variable2,
    //     [variable3.Id]: variable3,
    //     [variable4.Id]: variable4
    //   };

    //   expect(result).toEqual(expectedResult);
    // });
  });

  describe("_splitVariablesByAreaTypeAndDBNumberAndWriteAndSortByOffset", () => {
    let device;

    let variable1;
    let variable2;
    let variable3;
    let variable4;
    let variable5;
    let variable6;
    let variable7;
    let variable8;
    let variable9;

    let variables = [];

    let reqGrouper;

    beforeEach(async () => {
      device = new S7Device();

      await device.init({
        ipAdress: "192.168.1.131",
        slot: 1,
        rack: 0,
        name: "test",
        type: "s7Device",
        timeout: 500,
        isActive: false
      });

      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      await variable5.init({
        name: "var5",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable4.init({
        name: "var4",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable2.init({
        name: "var2",
        type: "s7Int16",
        offset: 4,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable3.init({
        name: "var3",
        type: "s7Int16",
        offset: 6,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable1.init({
        name: "var1",
        type: "s7Int16",
        offset: 0,
        areaType: "I",
        write: false
      });

      await variable6.init({
        name: "var6",
        type: "s7Int16",
        offset: 2,
        areaType: "I",
        write: false
      });

      await variable8.init({
        name: "var8",
        type: "s7Int16",
        offset: 4,
        areaType: "I",
        write: true
      });

      await variable9.init({
        name: "var9",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 2,
        write: false
      });

      await variable7.init({
        name: "var7",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 2,
        write: false
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];
    });

    let exec = async () => {
      reqGrouper = new S7RequestGrouper(device, 1000);
      return reqGrouper._splitVariablesByAreaTypeAndDBNumberAndWriteAndSortByOffset(
        variables
      );
    };

    it("should split variables by areaType, dbNumber, write/read and sort it by offset", async () => {
      let result = await exec();

      let expectedResult = {
        DB: {
          1: {
            write: [variable5, variable4],
            read: [variable2, variable3]
          },
          2: {
            read: [variable9, variable7]
          }
        },
        I: {
          0: {
            write: [variable8],
            read: [variable1, variable6]
          }
        }
      };

      expect(result).toEqual(expectedResult);
    });

    it("should empty object - if there are no variables", async () => {
      variables = [];

      let result = await exec();

      expect(result).toEqual({});
    });
  });

  describe("_splitVariablesByDBNumber", () => {
    let device;

    let variable1;
    let variable2;
    let variable3;
    let variable4;
    let variable5;
    let variable6;
    let variable7;
    let variable8;
    let variable9;

    let variables = [];

    let reqGrouper;

    beforeEach(async () => {
      device = new S7Device();

      await device.init({
        ipAdress: "192.168.1.131",
        slot: 1,
        rack: 0,
        name: "test",
        type: "s7Device",
        timeout: 500,
        isActive: false
      });

      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      await variable5.init({
        name: "var5",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable4.init({
        name: "var4",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable2.init({
        name: "var2",
        type: "s7Int16",
        offset: 4,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable3.init({
        name: "var3",
        type: "s7Int16",
        offset: 6,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable1.init({
        name: "var1",
        type: "s7Int16",
        offset: 0,
        areaType: "I",
        write: false
      });

      await variable6.init({
        name: "var6",
        type: "s7Int16",
        offset: 2,
        areaType: "I",
        write: false
      });

      await variable8.init({
        name: "var8",
        type: "s7Int16",
        offset: 4,
        areaType: "I",
        write: true
      });

      await variable9.init({
        name: "var9",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 2,
        write: false
      });

      await variable7.init({
        name: "var7",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 2,
        write: false
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];
    });

    let exec = async () => {
      reqGrouper = new S7RequestGrouper(device, 1000);
      return reqGrouper._splitVariablesByDBNumber(variables);
    };

    it("should split variables by DBNumber - if there are several variables with the same dbNumber", async () => {
      let result = await exec();

      let expectedResult = {
        1: [variable2, variable3, variable4, variable5],
        2: [variable7, variable9],
        0: [variable1, variable6, variable8]
      };

      expect(result).toEqual(expectedResult);
    });

    it("should split variables by DBNumber - if there are several dbNumber groups which suits only one variable", async () => {
      variable5 = new S7Int16Variable(device);

      await variable5.init({
        name: "var5",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 99,
        write: true
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];

      let result = await exec();

      let expectedResult = {
        1: [variable2, variable3, variable4],
        2: [variable7, variable9],
        0: [variable1, variable6, variable8],
        99: [variable5]
      };

      expect(result).toEqual(expectedResult);
    });

    it("should empty object - if there are no variables", async () => {
      variables = [];

      let result = await exec();

      expect(result).toEqual({});
    });
  });

  describe("_splitVariablesByAreaType", () => {
    let device;

    let variable1;
    let variable2;
    let variable3;
    let variable4;
    let variable5;
    let variable6;
    let variable7;
    let variable8;
    let variable9;

    let variables = [];

    let reqGrouper;

    beforeEach(async () => {
      device = new S7Device();

      await device.init({
        ipAdress: "192.168.1.131",
        slot: 1,
        rack: 0,
        name: "test",
        type: "s7Device",
        timeout: 500,
        isActive: false
      });

      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      await variable5.init({
        name: "var5",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable4.init({
        name: "var4",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable2.init({
        name: "var2",
        type: "s7Int16",
        offset: 4,
        areaType: "I",
        dbNumber: 1,
        write: false
      });

      await variable3.init({
        name: "var3",
        type: "s7Int16",
        offset: 6,
        areaType: "I",
        dbNumber: 1,
        write: false
      });

      await variable1.init({
        name: "var1",
        type: "s7Int16",
        offset: 0,
        areaType: "Q",
        write: false
      });

      await variable6.init({
        name: "var6",
        type: "s7Int16",
        offset: 2,
        areaType: "Q",
        write: false
      });

      await variable8.init({
        name: "var8",
        type: "s7Int16",
        offset: 4,
        areaType: "M",
        write: true
      });

      await variable9.init({
        name: "var9",
        type: "s7Int16",
        offset: 0,
        areaType: "M",
        dbNumber: 2,
        write: false
      });

      await variable7.init({
        name: "var7",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 2,
        write: false
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];
    });

    let exec = async () => {
      reqGrouper = new S7RequestGrouper(device, 1000);
      return reqGrouper._splitVariablesByAreaType(variables);
    };

    it("should split variables by areaType - if there are several variables with the same areaType", async () => {
      let result = await exec();

      let expectedResult = {
        DB: [variable4, variable5, variable7],
        I: [variable2, variable3],
        Q: [variable1, variable6],
        M: [variable8, variable9]
      };

      expect(result).toEqual(expectedResult);
    });

    it("should split variables by areaType - if there are areType for only one variable", async () => {
      variable9 = new S7Int16Variable(device);

      await variable9.init({
        name: "var9",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 2,
        write: false
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];

      let result = await exec();

      let expectedResult = {
        DB: [variable4, variable5, variable7, variable9],
        I: [variable2, variable3],
        Q: [variable1, variable6],
        M: [variable8]
      };

      expect(result).toEqual(expectedResult);
    });

    it("should empty object - if there are no variables", async () => {
      variables = [];

      let result = await exec();

      expect(result).toEqual({});
    });
  });

  describe("_splitVariablesByWriteType", () => {
    let device;

    let variable1;
    let variable2;
    let variable3;
    let variable4;
    let variable5;
    let variable6;
    let variable7;
    let variable8;
    let variable9;

    let variables = [];

    let reqGrouper;

    beforeEach(async () => {
      device = new S7Device();

      await device.init({
        ipAdress: "192.168.1.131",
        slot: 1,
        rack: 0,
        name: "test",
        type: "s7Device",
        timeout: 500,
        isActive: false
      });

      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      await variable5.init({
        name: "var5",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable4.init({
        name: "var4",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable2.init({
        name: "var2",
        type: "s7Int16",
        offset: 4,
        areaType: "I",
        dbNumber: 1,
        write: true
      });

      await variable3.init({
        name: "var3",
        type: "s7Int16",
        offset: 6,
        areaType: "I",
        dbNumber: 1,
        write: false
      });

      await variable1.init({
        name: "var1",
        type: "s7Int16",
        offset: 0,
        areaType: "Q",
        write: true
      });

      await variable6.init({
        name: "var6",
        type: "s7Int16",
        offset: 2,
        areaType: "Q",
        write: false
      });

      await variable8.init({
        name: "var8",
        type: "s7Int16",
        offset: 4,
        areaType: "M",
        write: true
      });

      await variable9.init({
        name: "var9",
        type: "s7Int16",
        offset: 0,
        areaType: "M",
        dbNumber: 2,
        write: false
      });

      await variable7.init({
        name: "var7",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 2,
        write: true
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];
    });

    let exec = async () => {
      reqGrouper = new S7RequestGrouper(device, 1000);
      return reqGrouper._splitVariablesByWriteType(variables);
    };

    it("should split variables by writeType - if there are several variables with the same writeType", async () => {
      let result = await exec();

      let expectedResult = {
        write: [variable1, variable2, variable5, variable7, variable8],
        read: [variable3, variable4, variable6, variable9]
      };

      expect(result).toEqual(expectedResult);
    });

    it("should split variables by writeType - if there are writeType for only one variable", async () => {
      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      await variable5.init({
        name: "var5",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable4.init({
        name: "var4",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable2.init({
        name: "var2",
        type: "s7Int16",
        offset: 4,
        areaType: "I",
        dbNumber: 1,
        write: false
      });

      await variable3.init({
        name: "var3",
        type: "s7Int16",
        offset: 6,
        areaType: "I",
        dbNumber: 1,
        write: false
      });

      await variable1.init({
        name: "var1",
        type: "s7Int16",
        offset: 0,
        areaType: "Q",
        write: false
      });

      await variable6.init({
        name: "var6",
        type: "s7Int16",
        offset: 2,
        areaType: "Q",
        write: false
      });

      await variable8.init({
        name: "var8",
        type: "s7Int16",
        offset: 4,
        areaType: "M",
        write: false
      });

      await variable9.init({
        name: "var9",
        type: "s7Int16",
        offset: 0,
        areaType: "M",
        dbNumber: 2,
        write: false
      });

      await variable7.init({
        name: "var7",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 2,
        write: true
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];

      let result = await exec();

      let expectedResult = {
        read: [
          variable1,
          variable2,
          variable3,
          variable4,
          variable5,
          variable6,
          variable8,
          variable9
        ],
        write: [variable7]
      };

      expect(result).toEqual(expectedResult);
    });

    it("should split variables by writeType - if there is no variable for read", async () => {
      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      await variable5.init({
        name: "var5",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable4.init({
        name: "var4",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable2.init({
        name: "var2",
        type: "s7Int16",
        offset: 4,
        areaType: "I",
        dbNumber: 1,
        write: true
      });

      await variable3.init({
        name: "var3",
        type: "s7Int16",
        offset: 6,
        areaType: "I",
        dbNumber: 1,
        write: true
      });

      await variable1.init({
        name: "var1",
        type: "s7Int16",
        offset: 0,
        areaType: "Q",
        write: true
      });

      await variable6.init({
        name: "var6",
        type: "s7Int16",
        offset: 2,
        areaType: "Q",
        write: true
      });

      await variable8.init({
        name: "var8",
        type: "s7Int16",
        offset: 4,
        areaType: "M",
        write: true
      });

      await variable9.init({
        name: "var9",
        type: "s7Int16",
        offset: 0,
        areaType: "M",
        dbNumber: 2,
        write: true
      });

      await variable7.init({
        name: "var7",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 2,
        write: true
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];

      let result = await exec();

      let expectedResult = {
        write: [
          variable1,
          variable2,
          variable3,
          variable4,
          variable5,
          variable6,
          variable7,
          variable8,
          variable9
        ]
      };

      expect(result).toEqual(expectedResult);
    });

    it("should split variables by writeType - if there is no variable for write", async () => {
      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      await variable5.init({
        name: "var5",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable4.init({
        name: "var4",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable2.init({
        name: "var2",
        type: "s7Int16",
        offset: 4,
        areaType: "I",
        dbNumber: 1,
        write: false
      });

      await variable3.init({
        name: "var3",
        type: "s7Int16",
        offset: 6,
        areaType: "I",
        dbNumber: 1,
        write: false
      });

      await variable1.init({
        name: "var1",
        type: "s7Int16",
        offset: 0,
        areaType: "Q",
        write: false
      });

      await variable6.init({
        name: "var6",
        type: "s7Int16",
        offset: 2,
        areaType: "Q",
        write: false
      });

      await variable8.init({
        name: "var8",
        type: "s7Int16",
        offset: 4,
        areaType: "M",
        write: false
      });

      await variable9.init({
        name: "var9",
        type: "s7Int16",
        offset: 0,
        areaType: "M",
        dbNumber: 2,
        write: false
      });

      await variable7.init({
        name: "var7",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 2,
        write: false
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];

      let result = await exec();

      let expectedResult = {
        read: [
          variable1,
          variable2,
          variable3,
          variable4,
          variable5,
          variable6,
          variable7,
          variable8,
          variable9
        ]
      };

      expect(result).toEqual(expectedResult);
    });

    it("should empty object - if there are no variables", async () => {
      variables = [];

      let result = await exec();

      expect(result).toEqual({});
    });
  });

  describe("_orderVariablesByOffset", () => {
    let device;

    let variable1;
    let variable2;
    let variable3;
    let variable4;
    let variable5;
    let variable6;
    let variable7;
    let variable8;
    let variable9;

    let variables = [];

    let reqGrouper;

    beforeEach(async () => {
      device = new S7Device();

      await device.init({
        ipAdress: "192.168.1.131",
        slot: 1,
        rack: 0,
        name: "test",
        type: "s7Device",
        timeout: 500,
        isActive: false
      });

      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      await variable5.init({
        name: "var5",
        type: "s7Int16",
        offset: 0,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable4.init({
        name: "var4",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 1,
        write: false
      });

      await variable2.init({
        name: "var2",
        type: "s7Int16",
        offset: 4,
        areaType: "I",
        dbNumber: 1,
        write: true
      });

      await variable3.init({
        name: "var3",
        type: "s7Int16",
        offset: 6,
        areaType: "I",
        dbNumber: 1,
        write: false
      });

      await variable1.init({
        name: "var1",
        type: "s7Int16",
        offset: 0,
        areaType: "Q",
        write: true
      });

      await variable6.init({
        name: "var6",
        type: "s7Int16",
        offset: 2,
        areaType: "Q",
        write: false
      });

      await variable8.init({
        name: "var8",
        type: "s7Int16",
        offset: 4,
        areaType: "M",
        write: true
      });

      await variable9.init({
        name: "var9",
        type: "s7Int16",
        offset: 0,
        areaType: "M",
        dbNumber: 2,
        write: false
      });

      await variable7.init({
        name: "var7",
        type: "s7Int16",
        offset: 2,
        areaType: "DB",
        dbNumber: 2,
        write: true
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];
    });

    let exec = async () => {
      reqGrouper = new S7RequestGrouper(device, 1000);
      return reqGrouper._orderVariablesByOffset(variables);
    };

    it("should order all variables by offset ascending - if some variables have the same offset", async () => {
      let result = await exec();

      let expectedResult = [
        variable1,
        variable5,
        variable9,
        variable4,
        variable6,
        variable7,
        variable2,
        variable8,
        variable3
      ];

      expect(result).toEqual(expectedResult);
    });

    it("should order all variables by offset ascending - if all variables have already been sorted", async () => {
      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      await variable1.init({
        name: "var1",
        type: "s7Int8",
        offset: 1,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable2.init({
        name: "var2",
        type: "s7Int8",
        offset: 2,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable3.init({
        name: "var3",
        type: "s7Int8",
        offset: 3,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable4.init({
        name: "var4",
        type: "s7Int8",
        offset: 4,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable5.init({
        name: "var5",
        type: "s7Int8",
        offset: 5,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable6.init({
        name: "var6",
        type: "s7Int8",
        offset: 6,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable7.init({
        name: "var7",
        type: "s7Int8",
        offset: 7,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable8.init({
        name: "var8",
        type: "s7Int8",
        offset: 8,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable9.init({
        name: "var9",
        type: "s7Int8",
        offset: 9,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];

      let result = await exec();

      let expectedResult = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];

      expect(result).toEqual(expectedResult);
    });

    it("should order all variables by offset ascending - if all variables have already been sorted descending", async () => {
      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      await variable1.init({
        name: "var1",
        type: "s7Int8",
        offset: 9,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable2.init({
        name: "var2",
        type: "s7Int8",
        offset: 8,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable3.init({
        name: "var3",
        type: "s7Int8",
        offset: 7,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable4.init({
        name: "var4",
        type: "s7Int8",
        offset: 6,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable5.init({
        name: "var5",
        type: "s7Int8",
        offset: 5,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable6.init({
        name: "var6",
        type: "s7Int8",
        offset: 4,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable7.init({
        name: "var7",
        type: "s7Int8",
        offset: 3,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable8.init({
        name: "var8",
        type: "s7Int8",
        offset: 2,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      await variable9.init({
        name: "var9",
        type: "s7Int8",
        offset: 1,
        areaType: "DB",
        dbNumber: 1,
        write: true
      });

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];

      let result = await exec();

      let expectedResult = [
        variable9,
        variable8,
        variable7,
        variable6,
        variable5,
        variable4,
        variable3,
        variable2,
        variable1
      ];

      expect(result).toEqual(expectedResult);
    });

    it("should empty array - if there are no variables", async () => {
      variables = [];

      let result = await exec();

      expect(result).toEqual([]);
    });
  });

  describe("ConvertVariablesToRequests", () => {
    let device;

    let maxReqLength;

    let variable1;
    let variable2;
    let variable3;
    let variable4;
    let variable5;
    let variable6;
    let variable7;
    let variable8;
    let variable9;

    let variables = [];

    let variablePayload1;
    let variablePayload2;
    let variablePayload3;
    let variablePayload4;
    let variablePayload5;
    let variablePayload6;
    let variablePayload7;
    let variablePayload8;
    let variablePayload9;

    let reqGrouper;

    beforeEach(async () => {
      device = new S7Device();

      maxReqLength = 1000;

      await device.init({
        ipAdress: "192.168.1.131",
        slot: 1,
        rack: 0,
        name: "test",
        type: "s7Device",
        timeout: 500,
        isActive: false
      });

      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      variablePayload1 = {
        name: "var1",
        type: "s7Int16",
        offset: 1,
        areaType: "DB",
        dbNumber: 1,
        write: true
      };

      variablePayload2 = {
        name: "var2",
        type: "s7Int16",
        offset: 3,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload3 = {
        name: "var3",
        type: "s7Int16",
        offset: 5,
        areaType: "DB",
        dbNumber: 2,
        write: true
      };

      variablePayload4 = {
        name: "var4",
        type: "s7Int16",
        offset: 7,
        areaType: "DB",
        dbNumber: 2,
        write: false
      };

      variablePayload5 = {
        name: "var5",
        type: "s7Int16",
        offset: 9,
        areaType: "I",
        write: false
      };

      variablePayload6 = {
        name: "var6",
        type: "s7Int16",
        offset: 11,
        areaType: "I",
        write: false
      };

      variablePayload7 = {
        name: "var7",
        type: "s7Int16",
        offset: 13,
        areaType: "Q",
        write: true
      };

      variablePayload8 = {
        name: "var8",
        type: "s7Int16",
        offset: 15,
        areaType: "Q",
        write: true
      };

      variablePayload9 = {
        name: "var9",
        type: "s7Int16",
        offset: 17,
        areaType: "M",
        write: true
      };

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9
      ];
    });

    let exec = async () => {
      await variable1.init(variablePayload1);
      await variable2.init(variablePayload2);
      await variable3.init(variablePayload3);
      await variable4.init(variablePayload4);
      await variable5.init(variablePayload5);
      await variable6.init(variablePayload6);
      await variable7.init(variablePayload7);
      await variable8.init(variablePayload8);
      await variable9.init(variablePayload9);

      reqGrouper = new S7RequestGrouper(device, maxReqLength);
      return reqGrouper.ConvertVariablesToRequests(variables);
    };

    it("should split variables by areaType, dbNumber, write/read and group it by offsets - and than on this basis create requests", async () => {
      let result = await exec();

      expect(result.length).toEqual(7);

      //Checking request 1 - containing only variable 1
      expect(result[0].AreaType).toEqual("DB");
      expect(result[0].Write).toEqual(true);
      expect(result[0].Offset).toEqual(1);
      expect(result[0].Length).toEqual(2);
      expect(result[0].DBNumber).toEqual(1);
      expect(Object.values(result[0].VariableConnections).length).toEqual(1);
      expect(Object.values(result[0].VariableConnections)[0].variable).toEqual(
        variable1
      );
      expect(
        Object.values(result[0].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[0].VariableConnections)[0].length).toEqual(2);

      //Checking request 2 - containing only variable 2
      expect(result[1].AreaType).toEqual("DB");
      expect(result[1].Write).toEqual(false);
      expect(result[1].Offset).toEqual(3);
      expect(result[1].Length).toEqual(2);
      expect(result[1].DBNumber).toEqual(1);
      expect(Object.values(result[1].VariableConnections).length).toEqual(1);
      expect(Object.values(result[1].VariableConnections)[0].variable).toEqual(
        variable2
      );
      expect(
        Object.values(result[1].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[1].VariableConnections)[0].length).toEqual(2);

      //Checking request 3 - containing only variable 3
      expect(result[2].AreaType).toEqual("DB");
      expect(result[2].Write).toEqual(true);
      expect(result[2].Offset).toEqual(5);
      expect(result[2].Length).toEqual(2);
      expect(result[2].DBNumber).toEqual(2);
      expect(Object.values(result[2].VariableConnections).length).toEqual(1);
      expect(Object.values(result[2].VariableConnections)[0].variable).toEqual(
        variable3
      );
      expect(
        Object.values(result[2].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[2].VariableConnections)[0].length).toEqual(2);

      //Checking request 4 - containing only variable 4
      expect(result[3].AreaType).toEqual("DB");
      expect(result[3].Write).toEqual(false);
      expect(result[3].Offset).toEqual(7);
      expect(result[3].Length).toEqual(2);
      expect(result[3].DBNumber).toEqual(2);
      expect(Object.values(result[3].VariableConnections).length).toEqual(1);
      expect(Object.values(result[3].VariableConnections)[0].variable).toEqual(
        variable4
      );
      expect(
        Object.values(result[3].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[3].VariableConnections)[0].length).toEqual(2);

      //Checking request 5 - containing variables 5 and 6
      expect(result[4].AreaType).toEqual("I");
      expect(result[4].Write).toEqual(false);
      expect(result[4].Offset).toEqual(9);
      expect(result[4].Length).toEqual(4);
      expect(result[4].DBNumber).toEqual(0);
      expect(Object.values(result[4].VariableConnections).length).toEqual(2);
      expect(Object.values(result[4].VariableConnections)[0].variable).toEqual(
        variable5
      );
      expect(
        Object.values(result[4].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[4].VariableConnections)[0].length).toEqual(2);

      expect(Object.values(result[4].VariableConnections)[1].variable).toEqual(
        variable6
      );
      expect(
        Object.values(result[4].VariableConnections)[1].requestOffset
      ).toEqual(2);
      expect(Object.values(result[4].VariableConnections)[1].length).toEqual(2);

      //Checking request 6 - containing variables 7 and 8
      expect(result[5].AreaType).toEqual("Q");
      expect(result[5].Write).toEqual(true);
      expect(result[5].Offset).toEqual(13);
      expect(result[5].Length).toEqual(4);
      expect(result[5].DBNumber).toEqual(0);
      expect(Object.values(result[5].VariableConnections).length).toEqual(2);
      expect(Object.values(result[5].VariableConnections)[0].variable).toEqual(
        variable7
      );
      expect(
        Object.values(result[5].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[5].VariableConnections)[0].length).toEqual(2);

      expect(Object.values(result[5].VariableConnections)[1].variable).toEqual(
        variable8
      );
      expect(
        Object.values(result[5].VariableConnections)[1].requestOffset
      ).toEqual(2);
      expect(Object.values(result[5].VariableConnections)[1].length).toEqual(2);

      //Checking request 7 - containing only variable 9
      expect(result[6].AreaType).toEqual("M");
      expect(result[6].Write).toEqual(true);
      expect(result[6].Offset).toEqual(17);
      expect(result[6].Length).toEqual(2);
      expect(result[6].DBNumber).toEqual(0);
      expect(Object.values(result[6].VariableConnections).length).toEqual(1);
      expect(Object.values(result[6].VariableConnections)[0].variable).toEqual(
        variable9
      );
      expect(
        Object.values(result[6].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[6].VariableConnections)[0].length).toEqual(2);
    });

    it("should create valid request - if  all variables are sorted and suits to 1 request", async () => {
      variablePayload1 = {
        name: "var1",
        type: "s7Int16",
        offset: 1,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload2 = {
        name: "var2",
        type: "s7Int16",
        offset: 3,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload3 = {
        name: "var3",
        type: "s7Int16",
        offset: 5,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload4 = {
        name: "var4",
        type: "s7Int16",
        offset: 7,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload5 = {
        name: "var5",
        type: "s7Int16",
        offset: 9,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload6 = {
        name: "var6",
        type: "s7Int16",
        offset: 11,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload7 = {
        name: "var7",
        type: "s7Int16",
        offset: 13,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload8 = {
        name: "var8",
        type: "s7Int16",
        offset: 15,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload9 = {
        name: "var9",
        type: "s7Int16",
        offset: 17,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      let result = await exec();

      expect(result.length).toEqual(1);

      //Checking request 1 - containing only variable 1
      expect(result[0].AreaType).toEqual("DB");
      expect(result[0].Write).toEqual(false);
      expect(result[0].Offset).toEqual(1);
      expect(result[0].Length).toEqual(18);
      expect(result[0].DBNumber).toEqual(1);
      expect(Object.values(result[0].VariableConnections).length).toEqual(9);

      //Checking variable connection 1
      expect(Object.values(result[0].VariableConnections)[0].variable).toEqual(
        variable1
      );
      expect(
        Object.values(result[0].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[0].VariableConnections)[0].length).toEqual(2);

      //Checking variable connection 2
      expect(Object.values(result[0].VariableConnections)[1].variable).toEqual(
        variable2
      );
      expect(
        Object.values(result[0].VariableConnections)[1].requestOffset
      ).toEqual(2);
      expect(Object.values(result[0].VariableConnections)[1].length).toEqual(2);

      //Checking variable connection 3
      expect(Object.values(result[0].VariableConnections)[2].variable).toEqual(
        variable3
      );
      expect(
        Object.values(result[0].VariableConnections)[2].requestOffset
      ).toEqual(4);
      expect(Object.values(result[0].VariableConnections)[2].length).toEqual(2);

      //Checking variable connection 4
      expect(Object.values(result[0].VariableConnections)[3].variable).toEqual(
        variable4
      );
      expect(
        Object.values(result[0].VariableConnections)[3].requestOffset
      ).toEqual(6);
      expect(Object.values(result[0].VariableConnections)[3].length).toEqual(2);

      //Checking variable connection 5
      expect(Object.values(result[0].VariableConnections)[4].variable).toEqual(
        variable5
      );
      expect(
        Object.values(result[0].VariableConnections)[4].requestOffset
      ).toEqual(8);
      expect(Object.values(result[0].VariableConnections)[4].length).toEqual(2);

      //Checking variable connection 6
      expect(Object.values(result[0].VariableConnections)[5].variable).toEqual(
        variable6
      );
      expect(
        Object.values(result[0].VariableConnections)[5].requestOffset
      ).toEqual(10);
      expect(Object.values(result[0].VariableConnections)[5].length).toEqual(2);

      //Checking variable connection 7
      expect(Object.values(result[0].VariableConnections)[6].variable).toEqual(
        variable7
      );
      expect(
        Object.values(result[0].VariableConnections)[6].requestOffset
      ).toEqual(12);
      expect(Object.values(result[0].VariableConnections)[6].length).toEqual(2);

      //Checking variable connection 8
      expect(Object.values(result[0].VariableConnections)[7].variable).toEqual(
        variable8
      );
      expect(
        Object.values(result[0].VariableConnections)[7].requestOffset
      ).toEqual(14);
      expect(Object.values(result[0].VariableConnections)[7].length).toEqual(2);

      //Checking variable connection 9
      expect(Object.values(result[0].VariableConnections)[8].variable).toEqual(
        variable9
      );
      expect(
        Object.values(result[0].VariableConnections)[8].requestOffset
      ).toEqual(16);
      expect(Object.values(result[0].VariableConnections)[8].length).toEqual(2);
    });

    it("should create valid request - if  all variables are not sorted but suits to 1 request", async () => {
      variablePayload1 = {
        name: "var1",
        type: "s7Int16",
        offset: 1,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload2 = {
        name: "var2",
        type: "s7Int16",
        offset: 3,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload3 = {
        name: "var3",
        type: "s7Int16",
        offset: 5,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload4 = {
        name: "var4",
        type: "s7Int16",
        offset: 7,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload5 = {
        name: "var5",
        type: "s7Int16",
        offset: 9,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload6 = {
        name: "var6",
        type: "s7Int16",
        offset: 11,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload7 = {
        name: "var7",
        type: "s7Int16",
        offset: 13,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload8 = {
        name: "var8",
        type: "s7Int16",
        offset: 15,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload9 = {
        name: "var9",
        type: "s7Int16",
        offset: 17,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variables = [
        variable9,
        variable8,
        variable7,
        variable6,
        variable5,
        variable4,
        variable3,
        variable2,
        variable1
      ];

      let result = await exec();

      expect(result.length).toEqual(1);

      //Checking request 1
      expect(result[0].AreaType).toEqual("DB");
      expect(result[0].Write).toEqual(false);
      expect(result[0].Offset).toEqual(1);
      expect(result[0].Length).toEqual(18);
      expect(result[0].DBNumber).toEqual(1);
      expect(Object.values(result[0].VariableConnections).length).toEqual(9);

      //Checking variable connection 1
      expect(Object.values(result[0].VariableConnections)[0].variable).toEqual(
        variable1
      );
      expect(
        Object.values(result[0].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[0].VariableConnections)[0].length).toEqual(2);

      //Checking variable connection 2
      expect(Object.values(result[0].VariableConnections)[1].variable).toEqual(
        variable2
      );
      expect(
        Object.values(result[0].VariableConnections)[1].requestOffset
      ).toEqual(2);
      expect(Object.values(result[0].VariableConnections)[1].length).toEqual(2);

      //Checking variable connection 3
      expect(Object.values(result[0].VariableConnections)[2].variable).toEqual(
        variable3
      );
      expect(
        Object.values(result[0].VariableConnections)[2].requestOffset
      ).toEqual(4);
      expect(Object.values(result[0].VariableConnections)[2].length).toEqual(2);

      //Checking variable connection 4
      expect(Object.values(result[0].VariableConnections)[3].variable).toEqual(
        variable4
      );
      expect(
        Object.values(result[0].VariableConnections)[3].requestOffset
      ).toEqual(6);
      expect(Object.values(result[0].VariableConnections)[3].length).toEqual(2);

      //Checking variable connection 5
      expect(Object.values(result[0].VariableConnections)[4].variable).toEqual(
        variable5
      );
      expect(
        Object.values(result[0].VariableConnections)[4].requestOffset
      ).toEqual(8);
      expect(Object.values(result[0].VariableConnections)[4].length).toEqual(2);

      //Checking variable connection 6
      expect(Object.values(result[0].VariableConnections)[5].variable).toEqual(
        variable6
      );
      expect(
        Object.values(result[0].VariableConnections)[5].requestOffset
      ).toEqual(10);
      expect(Object.values(result[0].VariableConnections)[5].length).toEqual(2);

      //Checking variable connection 7
      expect(Object.values(result[0].VariableConnections)[6].variable).toEqual(
        variable7
      );
      expect(
        Object.values(result[0].VariableConnections)[6].requestOffset
      ).toEqual(12);
      expect(Object.values(result[0].VariableConnections)[6].length).toEqual(2);

      //Checking variable connection 8
      expect(Object.values(result[0].VariableConnections)[7].variable).toEqual(
        variable8
      );
      expect(
        Object.values(result[0].VariableConnections)[7].requestOffset
      ).toEqual(14);
      expect(Object.values(result[0].VariableConnections)[7].length).toEqual(2);

      //Checking variable connection 9
      expect(Object.values(result[0].VariableConnections)[8].variable).toEqual(
        variable9
      );
      expect(
        Object.values(result[0].VariableConnections)[8].requestOffset
      ).toEqual(16);
      expect(Object.values(result[0].VariableConnections)[8].length).toEqual(2);
    });

    it("should create valid request - if  all variables are sorted and suits to 2 request due to gap between registers", async () => {
      variablePayload1 = {
        name: "var1",
        type: "s7Int16",
        offset: 1,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload2 = {
        name: "var2",
        type: "s7Int16",
        offset: 3,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload3 = {
        name: "var3",
        type: "s7Int16",
        offset: 5,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload4 = {
        name: "var4",
        type: "s7Int16",
        offset: 7,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload5 = {
        name: "var5",
        type: "s7Int16",
        offset: 10,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload6 = {
        name: "var6",
        type: "s7Int16",
        offset: 12,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload7 = {
        name: "var7",
        type: "s7Int16",
        offset: 14,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload8 = {
        name: "var8",
        type: "s7Int16",
        offset: 16,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload9 = {
        name: "var9",
        type: "s7Int16",
        offset: 18,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      let result = await exec();

      expect(result.length).toEqual(2);

      //Checking request 1
      expect(result[0].AreaType).toEqual("DB");
      expect(result[0].Write).toEqual(false);
      expect(result[0].Offset).toEqual(1);
      expect(result[0].Length).toEqual(8);
      expect(result[0].DBNumber).toEqual(1);
      expect(Object.values(result[0].VariableConnections).length).toEqual(4);

      //Checking variable connection 1
      expect(Object.values(result[0].VariableConnections)[0].variable).toEqual(
        variable1
      );
      expect(
        Object.values(result[0].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[0].VariableConnections)[0].length).toEqual(2);

      //Checking variable connection 2
      expect(Object.values(result[0].VariableConnections)[1].variable).toEqual(
        variable2
      );
      expect(
        Object.values(result[0].VariableConnections)[1].requestOffset
      ).toEqual(2);
      expect(Object.values(result[0].VariableConnections)[1].length).toEqual(2);

      //Checking variable connection 3
      expect(Object.values(result[0].VariableConnections)[2].variable).toEqual(
        variable3
      );
      expect(
        Object.values(result[0].VariableConnections)[2].requestOffset
      ).toEqual(4);
      expect(Object.values(result[0].VariableConnections)[2].length).toEqual(2);

      //Checking variable connection 4
      expect(Object.values(result[0].VariableConnections)[3].variable).toEqual(
        variable4
      );
      expect(
        Object.values(result[0].VariableConnections)[3].requestOffset
      ).toEqual(6);
      expect(Object.values(result[0].VariableConnections)[3].length).toEqual(2);

      //Checking request 2
      expect(result[1].AreaType).toEqual("DB");
      expect(result[1].Write).toEqual(false);
      expect(result[1].Offset).toEqual(10);
      expect(result[1].Length).toEqual(10);
      expect(result[1].DBNumber).toEqual(1);
      expect(Object.values(result[1].VariableConnections).length).toEqual(5);

      //Checking variable connection 5
      expect(Object.values(result[1].VariableConnections)[0].variable).toEqual(
        variable5
      );
      expect(
        Object.values(result[1].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[1].VariableConnections)[0].length).toEqual(2);

      //Checking variable connection 6
      expect(Object.values(result[1].VariableConnections)[1].variable).toEqual(
        variable6
      );
      expect(
        Object.values(result[1].VariableConnections)[1].requestOffset
      ).toEqual(2);
      expect(Object.values(result[1].VariableConnections)[1].length).toEqual(2);

      //Checking variable connection 7
      expect(Object.values(result[1].VariableConnections)[2].variable).toEqual(
        variable7
      );
      expect(
        Object.values(result[1].VariableConnections)[2].requestOffset
      ).toEqual(4);
      expect(Object.values(result[1].VariableConnections)[2].length).toEqual(2);

      //Checking variable connection 8
      expect(Object.values(result[1].VariableConnections)[3].variable).toEqual(
        variable8
      );
      expect(
        Object.values(result[1].VariableConnections)[3].requestOffset
      ).toEqual(6);
      expect(Object.values(result[1].VariableConnections)[3].length).toEqual(2);

      //Checking variable connection 9
      expect(Object.values(result[1].VariableConnections)[4].variable).toEqual(
        variable9
      );
      expect(
        Object.values(result[1].VariableConnections)[4].requestOffset
      ).toEqual(8);
      expect(Object.values(result[1].VariableConnections)[4].length).toEqual(2);
    });

    it("should create valid request - if  all variables are sorted and suits to 2 max request length", async () => {
      maxReqLength = 10;

      variablePayload1 = {
        name: "var1",
        type: "s7Int16",
        offset: 1,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload2 = {
        name: "var2",
        type: "s7Int16",
        offset: 3,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload3 = {
        name: "var3",
        type: "s7Int16",
        offset: 5,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload4 = {
        name: "var4",
        type: "s7Int16",
        offset: 7,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload5 = {
        name: "var5",
        type: "s7Int16",
        offset: 9,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload6 = {
        name: "var6",
        type: "s7Int16",
        offset: 11,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload7 = {
        name: "var7",
        type: "s7Int16",
        offset: 13,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload8 = {
        name: "var8",
        type: "s7Int16",
        offset: 15,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      variablePayload9 = {
        name: "var9",
        type: "s7Int16",
        offset: 17,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };

      let result = await exec();

      expect(result.length).toEqual(2);

      //Checking request 1
      expect(result[0].AreaType).toEqual("DB");
      expect(result[0].Write).toEqual(false);
      expect(result[0].Offset).toEqual(1);
      expect(result[0].Length).toEqual(10);
      expect(result[0].DBNumber).toEqual(1);
      expect(Object.values(result[0].VariableConnections).length).toEqual(5);

      //Checking variable connection 1
      expect(Object.values(result[0].VariableConnections)[0].variable).toEqual(
        variable1
      );
      expect(
        Object.values(result[0].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[0].VariableConnections)[0].length).toEqual(2);

      //Checking variable connection 2
      expect(Object.values(result[0].VariableConnections)[1].variable).toEqual(
        variable2
      );
      expect(
        Object.values(result[0].VariableConnections)[1].requestOffset
      ).toEqual(2);
      expect(Object.values(result[0].VariableConnections)[1].length).toEqual(2);

      //Checking variable connection 3
      expect(Object.values(result[0].VariableConnections)[2].variable).toEqual(
        variable3
      );
      expect(
        Object.values(result[0].VariableConnections)[2].requestOffset
      ).toEqual(4);
      expect(Object.values(result[0].VariableConnections)[2].length).toEqual(2);

      //Checking variable connection 4
      expect(Object.values(result[0].VariableConnections)[3].variable).toEqual(
        variable4
      );
      expect(
        Object.values(result[0].VariableConnections)[3].requestOffset
      ).toEqual(6);
      expect(Object.values(result[0].VariableConnections)[3].length).toEqual(2);

      //Checking variable connection 5
      expect(Object.values(result[0].VariableConnections)[4].variable).toEqual(
        variable5
      );
      expect(
        Object.values(result[0].VariableConnections)[4].requestOffset
      ).toEqual(8);
      expect(Object.values(result[0].VariableConnections)[4].length).toEqual(2);

      //Checking request 2
      expect(result[1].AreaType).toEqual("DB");
      expect(result[1].Write).toEqual(false);
      expect(result[1].Offset).toEqual(11);
      expect(result[1].Length).toEqual(8);
      expect(result[1].DBNumber).toEqual(1);
      expect(Object.values(result[1].VariableConnections).length).toEqual(4);

      //Checking variable connection 5
      expect(Object.values(result[1].VariableConnections)[0].variable).toEqual(
        variable6
      );
      expect(
        Object.values(result[1].VariableConnections)[0].requestOffset
      ).toEqual(0);
      expect(Object.values(result[1].VariableConnections)[0].length).toEqual(2);

      //Checking variable connection 6
      expect(Object.values(result[1].VariableConnections)[1].variable).toEqual(
        variable7
      );
      expect(
        Object.values(result[1].VariableConnections)[1].requestOffset
      ).toEqual(2);
      expect(Object.values(result[1].VariableConnections)[1].length).toEqual(2);

      //Checking variable connection 7
      expect(Object.values(result[1].VariableConnections)[2].variable).toEqual(
        variable8
      );
      expect(
        Object.values(result[1].VariableConnections)[2].requestOffset
      ).toEqual(4);
      expect(Object.values(result[1].VariableConnections)[2].length).toEqual(2);

      //Checking variable connection 8
      expect(Object.values(result[1].VariableConnections)[3].variable).toEqual(
        variable9
      );
      expect(
        Object.values(result[1].VariableConnections)[3].requestOffset
      ).toEqual(6);
      expect(Object.values(result[1].VariableConnections)[3].length).toEqual(2);
    });
  });
});
