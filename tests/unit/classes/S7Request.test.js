const S7Request = require("../../../classes/driver/S7/S7Request");
const S7Int16Variable = require("../../../classes/variable/S7/S7Int16Variable");
const S7Device = require("../../../classes/device/S7/S7Device");
const { snooze } = require("../../../utilities/utilities");

describe("S7RequestGrouper", () => {
  describe("constructor", () => {
    let driver;
    let areaType;
    let write;
    let maxReqLength;
    let dbNumber;

    beforeEach(() => {
      driver = "fakeDriver";
      areaType = "DB";
      write = true;
      maxReqLength = 123;
      dbNumber = 12;
    });

    let exec = () => {
      return new S7Request(driver, areaType, write, maxReqLength, dbNumber);
    };

    it("should return new S7Request", async () => {
      let result = await exec();

      expect(result).toBeDefined();
    });

    it("should set driver in request", async () => {
      let result = await exec();

      expect(result.S7Driver).toEqual(driver);
    });

    it("should set areaType in request", async () => {
      let result = await exec();

      expect(result.AreaType).toEqual(areaType);
    });

    it("should set write in request", async () => {
      let result = await exec();

      expect(result.Write).toEqual(write);
    });

    it("should set length to 0", async () => {
      let result = await exec();

      expect(result.Length).toEqual(0);
    });

    it("should set dataToSend to []", async () => {
      let result = await exec();

      expect(result.DataToSend).toEqual([]);
    });

    it("should set variableConnections to {}", async () => {
      let result = await exec();

      expect(result.VariableConnections).toEqual({});
    });

    it("should set dbNumber in request", async () => {
      let result = await exec();

      expect(result.DBNumber).toEqual(dbNumber);
    });

    it("should generate and set new ReqID - req id should be uniq for every req", async () => {
      let result1 = await exec();
      let result2 = await exec();
      let result3 = await exec();

      expect(result1.RequestId).toBeDefined();
      expect(result2.RequestId).toBeDefined();
      expect(result3.RequestId).toBeDefined();
      expect(result1.RequestId).not.toEqual(result2.RequestId);
      expect(result1.RequestId).not.toEqual(result3.RequestId);
      expect(result2.RequestId).not.toEqual(result3.RequestId);
    });

    it("should throw if area is invalid", async () => {
      areaType = "fakeArea";

      expect(() => {
        exec();
      }).toThrow();
    });

    it("should throw if driver is null", async () => {
      driver = null;

      expect(() => {
        exec();
      }).toThrow();
    });

    it("should set maxReqLength to given value", async () => {
      let result = await exec();

      expect(result._maxRequestLength).toEqual(maxReqLength);
    });

    it("should set maxReqLength to 1000 if it is not defined", async () => {
      maxReqLength = undefined;
      let result = await exec();

      expect(result._maxRequestLength).toEqual(1000);
    });

    it("should set write to false if it is not defined", async () => {
      write = undefined;
      let result = await exec();

      expect(result.Write).toEqual(false);
    });

    it("should set dbNumber to 0 if it is not defined", async () => {
      dbNumber = undefined;
      let result = await exec();

      expect(result.DBNumber).toEqual(0);
    });
  });

  describe("_createVariableObject", () => {
    let device;
    let driver;
    let areaType;
    let write;
    let maxReqLength;
    let dbNumber;
    let request;
    let variable;
    let variablePayload;

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

      driver = "fakeDriver";
      areaType = "DB";
      write = true;
      maxReqLength = 123;
      dbNumber = 12;

      variablePayload = {
        name: "var",
        type: "s7Int16",
        offset: 6,
        areaType: "DB",
        dbNumber: 1,
        write: true
      };
    });

    let exec = async () => {
      request = new S7Request(
        device.S7Driver,
        areaType,
        write,
        maxReqLength,
        dbNumber
      );
      variable = new S7Int16Variable(device);

      await variable.init(variablePayload);

      return request._createVariableObject(variable);
    };

    it("should return new variable object containing given variable", async () => {
      let result = await exec();

      expect(result.variable).toEqual(variable);
    });

    it("should set response data to undefined", async () => {
      let result = await exec();

      expect(result.responseData).toEqual(undefined);
    });

    it("should set variable offset based on variable offset and request offset - counting from begning of request offset", async () => {
      let result = await exec();

      expect(result.requestOffset).toEqual(variable.Offset - request.Offset);
    });

    it("should set variable variable object length - based on variable length", async () => {
      let result = await exec();

      expect(result.length).toEqual(variable.Length);
    });
  });

  describe("canVariableBeAddedToRequest", () => {
    let device;
    let driver;
    let areaType;
    let write;
    let maxReqLength;
    let dbNumber;
    let request;
    let variableInRequest;
    let variableInRequestPayload;
    let variableToAdd;
    let variableToAddPayload;

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

      driver = "fakeDriver";
      areaType = "DB";
      write = true;
      maxReqLength = 123;
      dbNumber = 12;

      variableInRequestPayload = {
        name: "var1",
        type: "s7Int16",
        offset: 6,
        areaType: "DB",
        dbNumber: 12,
        write: true
      };

      variableToAddPayload = {
        name: "var2",
        type: "s7Int16",
        offset: 8,
        areaType: "DB",
        dbNumber: 12,
        write: true
      };
    });

    let exec = async () => {
      request = new S7Request(
        device.S7Driver,
        areaType,
        write,
        maxReqLength,
        dbNumber
      );

      if (variableInRequestPayload) {
        variableInRequest = new S7Int16Variable(device);
        await variableInRequest.init(variableInRequestPayload);
        await request.addVariable(variableInRequest);
      }

      variableToAdd = new S7Int16Variable(device);

      await variableToAdd.init(variableToAddPayload);

      return request.canVariableBeAddedToRequest(variableToAdd);
    };

    it("should return true if variable has the same areaType, DBNumber, writeType and proper offset", async () => {
      let result = await exec();

      expect(result).toEqual(true);
    });

    it("should return false if variable has the same areaType, DBNumber, writeType but not proper offset", async () => {
      //Creating a gap between variable in request and variable to add
      variableToAddPayload.offset = 3;

      let result = await exec();

      expect(result).toEqual(false);
    });

    //Writing is the only Exception here !! - getSingle / setSingle have the always different Write type
    // it("should return false if variable has the same areaType, DBNumber, proper offset but not propert writeType", async () => {
    //   await snooze(100);
    //   //Creating a gap between variable in request and variable to add
    //   variableToAddPayload.write = false;

    //   let result = await exec();

    //   expect(result).toEqual(false);
    // });

    it("should return false if variable has the same areaType,  writeType proper offset but not propert DBNumber", async () => {
      //Creating a gap between variable in request and variable to add
      variableToAddPayload.dbNumber = 11;

      let result = await exec();

      expect(result).toEqual(false);
    });

    it("should return false if variable has the same dbNumber, writeType proper offset but not propert areaType", async () => {
      //Creating a gap between variable in request and variable to add
      variableToAddPayload.areaType = "I";

      let result = await exec();

      expect(result).toEqual(false);
    });

    it("should return false if variable has the same areaType, DBNumber, writeType but not proper offset - exceed maximum request length", async () => {
      maxReqLength = 2;

      let result = await exec();

      expect(result).toEqual(false);
    });

    it("should return true if variable has the same areaType, DBNumber, writeType but not proper offset - but it is first variable in request", async () => {
      variableInRequestPayload = undefined;

      variableToAddPayload.offset = 3;

      let result = await exec();

      expect(result).toEqual(true);
    });
  });

  describe("_formatDataToSend", () => {
    let device;
    let driver;
    let areaType;
    let write;
    let maxReqLength;
    let dbNumber;
    let request;
    let variable1;
    let variablePayload1;
    let variable2;
    let variablePayload2;
    let variable3;
    let variablePayload3;

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

      driver = "fakeDriver";
      areaType = "DB";
      write = true;
      maxReqLength = 123;
      dbNumber = 12;

      variablePayload1 = {
        name: "var1",
        type: "s7Int16",
        offset: 1,
        areaType: "DB",
        dbNumber: 12,
        write: true,
        value: 1
      };

      variablePayload2 = {
        name: "var2",
        type: "s7Int16",
        offset: 3,
        areaType: "DB",
        dbNumber: 12,
        write: true,
        value: 3
      };

      variablePayload3 = {
        name: "var3",
        type: "s7Int16",
        offset: 5,
        areaType: "DB",
        dbNumber: 12,
        write: true,
        value: 5
      };
    });

    let exec = async () => {
      request = new S7Request(
        device.S7Driver,
        areaType,
        write,
        maxReqLength,
        dbNumber
      );

      if (variablePayload1) {
        variable1 = new S7Int16Variable(device);
        await variable1.init(variablePayload1);
        await request.addVariable(variable1);
      }

      if (variablePayload2) {
        variable2 = new S7Int16Variable(device);
        await variable2.init(variablePayload2);
        await request.addVariable(variable2);
      }

      if (variablePayload3) {
        variable3 = new S7Int16Variable(device);
        await variable3.init(variablePayload3);
        await request.addVariable(variable3);
      }

      await request._formatDataToSend();
    };

    it("should create dataToSend according to variables values", async () => {
      await exec();

      let expectedContent = [0, 1, 0, 3, 0, 5];

      expect(request.DataToSend).toEqual(expectedContent);
    });

    it("should not create dataToSend according to variables values if variables are not Write type", async () => {
      write = false;
      variablePayload1.write = false;
      variablePayload2.write = false;
      variablePayload3.write = false;
      await exec();

      expect(request.DataToSend).toEqual([]);
    });
  });

  describe("setResponseData", () => {
    let device;
    let driver;
    let areaType;
    let write;
    let maxReqLength;
    let dbNumber;
    let request;
    let variable1;
    let variablePayload1;
    let variable2;
    let variablePayload2;
    let variable3;
    let variablePayload3;
    let responseData;

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

      driver = "fakeDriver";
      areaType = "DB";
      write = false;
      maxReqLength = 123;
      dbNumber = 12;

      variablePayload1 = {
        name: "var1",
        type: "s7Int16",
        offset: 1,
        areaType: "DB",
        dbNumber: 12,
        write: false,
        value: 0
      };

      variablePayload2 = {
        name: "var2",
        type: "s7Int16",
        offset: 3,
        areaType: "DB",
        dbNumber: 12,
        write: false,
        value: 0
      };

      variablePayload3 = {
        name: "var3",
        type: "s7Int16",
        offset: 5,
        areaType: "DB",
        dbNumber: 12,
        write: false,
        value: 0
      };

      responseData = [1, 2, 3, 4, 5, 6];
    });

    let exec = async () => {
      request = new S7Request(
        device.S7Driver,
        areaType,
        write,
        maxReqLength,
        dbNumber
      );

      if (variablePayload1) {
        variable1 = new S7Int16Variable(device);
        await variable1.init(variablePayload1);
        await request.addVariable(variable1);
      }

      if (variablePayload2) {
        variable2 = new S7Int16Variable(device);
        await variable2.init(variablePayload2);
        await request.addVariable(variable2);
      }

      if (variablePayload3) {
        variable3 = new S7Int16Variable(device);
        await variable3.init(variablePayload3);
        await request.addVariable(variable3);
      }

      await request.setResponseData(responseData);
    };

    it("should set response data to ResponseData", async () => {
      await exec();

      expect(request.ResponseData).toEqual(responseData);
    });

    it("should slice and assing response data to given variables", async () => {
      await exec();

      expect(variable1.Data).toEqual([1, 2]);
      expect(variable2.Data).toEqual([3, 4]);
      expect(variable3.Data).toEqual([5, 6]);
    });

    it("should throw and not assing anything if length of response data is differnet", async () => {
      responseData = [1, 2, 3, 4];

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

      expect(variable1.Data).toEqual([0, 0]);
      expect(variable2.Data).toEqual([0, 0]);
      expect(variable3.Data).toEqual([0, 0]);
    });

    it("should throw and not assing anything if response data is undefined", async () => {
      responseData = undefined;

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

      expect(variable1.Data).toEqual([0, 0]);
      expect(variable2.Data).toEqual([0, 0]);
      expect(variable3.Data).toEqual([0, 0]);
    });
  });

  describe("addVariable", () => {
    let device;
    let driver;
    let areaType;
    let write;
    let maxReqLength;
    let dbNumber;
    let request;
    let variableInRequest;
    let variableInRequestPayload;
    let variableToAdd;
    let variableToAddPayload;
    let mockUpdateAction;

    beforeEach(async () => {
      mockUpdateAction = jest.fn();
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

      driver = "fakeDriver";
      areaType = "DB";
      write = true;
      maxReqLength = 123;
      dbNumber = 12;

      variableInRequestPayload = {
        name: "var1",
        type: "s7Int16",
        offset: 6,
        areaType: "DB",
        dbNumber: 12,
        write: true
      };

      variableToAddPayload = {
        name: "var2",
        type: "s7Int16",
        offset: 8,
        areaType: "DB",
        dbNumber: 12,
        write: true
      };
    });

    let exec = async () => {
      request = new S7Request(
        device.S7Driver,
        areaType,
        write,
        maxReqLength,
        dbNumber
      );

      request.updateAction = mockUpdateAction;

      if (variableInRequestPayload) {
        variableInRequest = new S7Int16Variable(device);
        await variableInRequest.init(variableInRequestPayload);
        await request.addVariable(variableInRequest);
      }

      variableToAdd = new S7Int16Variable(device);

      await variableToAdd.init(variableToAddPayload);

      return request.addVariable(variableToAdd);
    };

    it("should add variable if it suits to request", async () => {
      await exec();

      expect(request.VariableConnections).toEqual({
        [variableInRequest.Id]: {
          variable: variableInRequest,
          responseData: undefined,
          length: 2,
          requestOffset: 0
        },
        [variableToAdd.Id]: {
          variable: variableToAdd,
          responseData: undefined,
          length: 2,
          requestOffset: 2
        }
      });
    });

    it("should increase length of request after adding variable", async () => {
      await exec();

      expect(request.Length).toEqual(4);
    });

    it("should increase length of request after adding variable", async () => {
      await exec();

      //After adding every variable - first and second
      expect(mockUpdateAction).toHaveBeenCalledTimes(2);
    });

    it("should throw and not add variable if offset is not proper - gap", async () => {
      //Creating a gap between variable in request and variable to add
      variableToAddPayload.offset = 3;

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
      expect(request.VariableConnections).toEqual({
        [variableInRequest.Id]: {
          variable: variableInRequest,
          responseData: undefined,
          length: 2,
          requestOffset: 0
        }
      });
    });

    it("should throw and not add variable if offset is not proper - max request length", async () => {
      maxReqLength = 2;

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
      expect(request.VariableConnections).toEqual({
        [variableInRequest.Id]: {
          variable: variableInRequest,
          responseData: undefined,
          length: 2,
          requestOffset: 0
        }
      });
    });

    it("should throw and not add variable if areaType is not proper - max request length", async () => {
      variableToAddPayload.areaType = "I";

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
      expect(request.VariableConnections).toEqual({
        [variableInRequest.Id]: {
          variable: variableInRequest,
          responseData: undefined,
          length: 2,
          requestOffset: 0
        }
      });
    });

    it("should throw and not add variable if dbNumber is not proper - max request length", async () => {
      variableToAddPayload.dbNumber = 11;

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
      expect(request.VariableConnections).toEqual({
        [variableInRequest.Id]: {
          variable: variableInRequest,
          responseData: undefined,
          length: 2,
          requestOffset: 0
        }
      });
    });
  });

  describe("updateAction", () => {
    let device;
    let driver;
    let areaType;
    let write;
    let maxReqLength;
    let dbNumber;
    let request;
    let variable1;
    let variablePayload1;
    let variable2;
    let variablePayload2;
    let variable3;
    let variablePayload3;
    let mockCreateGetAction;
    let mockCreateSetAction;
    let mockCreateGetActionResult;
    let mockCreateSetActionResult;

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
      mockCreateGetActionResult = "mockGet";
      mockCreateSetActionResult = "mockSet";
      mockCreateGetAction = jest.fn(() => mockCreateGetActionResult);
      mockCreateSetAction = jest.fn(() => mockCreateSetActionResult);

      device.S7Driver.createGetDataAction = mockCreateGetAction;
      device.S7Driver.createSetDataAction = mockCreateSetAction;

      areaType = "DB";
      write = true;
      maxReqLength = 123;
      dbNumber = 12;

      variablePayload1 = {
        name: "var1",
        type: "s7Int16",
        offset: 1,
        areaType: "DB",
        dbNumber: 12,
        write: true,
        value: 1
      };

      variablePayload2 = {
        name: "var2",
        type: "s7Int16",
        offset: 3,
        areaType: "DB",
        dbNumber: 12,
        write: true,
        value: 3
      };

      variablePayload3 = {
        name: "var3",
        type: "s7Int16",
        offset: 5,
        areaType: "DB",
        dbNumber: 12,
        write: true,
        value: 5
      };
    });

    let exec = async () => {
      request = new S7Request(
        device.S7Driver,
        areaType,
        write,
        maxReqLength,
        dbNumber
      );

      if (variablePayload1) {
        variable1 = new S7Int16Variable(device);
        await variable1.init(variablePayload1);
        await request.addVariable(variable1);
      }

      if (variablePayload2) {
        variable2 = new S7Int16Variable(device);
        await variable2.init(variablePayload2);
        await request.addVariable(variable2);
      }

      if (variablePayload3) {
        variable3 = new S7Int16Variable(device);
        await variable3.init(variablePayload3);
        await request.addVariable(variable3);
      }

      await request.updateAction();
    };

    it("should create dataToSend according to variables values", async () => {
      await exec();

      let expectedContent = [0, 1, 0, 3, 0, 5];

      expect(request.DataToSend).toEqual(expectedContent);
    });

    it("should not create dataToSend according to variables values if variables are not Write type", async () => {
      write = false;
      variablePayload1.write = false;
      variablePayload2.write = false;
      variablePayload3.write = false;
      await exec();

      expect(request.DataToSend).toEqual([]);
    });

    it("should create get data action for getting content for all variables and assign it to action - if request is get request", async () => {
      write = false;
      variablePayload1.write = false;
      variablePayload2.write = false;
      variablePayload3.write = false;

      await exec();

      //For every added variable for given request - 3, for every creation of variable - getSingleRequest - 3, and one in exec - 1 = 7
      expect(mockCreateGetAction).toHaveBeenCalledTimes(7);

      expect(mockCreateGetAction.mock.calls[6][0]).toEqual(areaType);
      expect(mockCreateGetAction.mock.calls[6][1]).toEqual(1);
      expect(mockCreateGetAction.mock.calls[6][2]).toEqual(6);
      expect(mockCreateGetAction.mock.calls[6][3]).toEqual(12);

      expect(request.Action).toEqual(mockCreateGetActionResult);
    });

    it("should create set data action for setting content for all variables and assign it to action - if request is set request", async () => {
      write = true;
      variablePayload1.write = true;
      variablePayload2.write = true;
      variablePayload3.write = true;

      await exec();

      //For every added variable for given request - 3, for every creation of variable - setSingleRequest - 3, and one in exec - 1 = 7
      expect(mockCreateSetAction).toHaveBeenCalledTimes(7);

      expect(mockCreateSetAction.mock.calls[6][0]).toEqual(areaType);
      expect(mockCreateSetAction.mock.calls[6][1]).toEqual(1);
      expect(mockCreateSetAction.mock.calls[6][2]).toEqual([0, 1, 0, 3, 0, 5]);
      expect(mockCreateSetAction.mock.calls[6][3]).toEqual(6);
      expect(mockCreateSetAction.mock.calls[6][4]).toEqual(12);

      expect(request.Action).toEqual(mockCreateSetActionResult);
    });
  });
});
