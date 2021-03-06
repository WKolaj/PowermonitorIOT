const MBRequest = require("../../../classes/driver/Modbus/MBRequest");
const MBInt16Variable = require("../../../classes/variable/Modbus/MBInt16Variable");
const MBInt32Variable = require("../../../classes/variable/Modbus/MBInt32Variable");
const _ = require("lodash");

describe("MBRequest", () => {
  describe("constructor", () => {
    let mbDriver;
    let fcode;
    let unitId;
    let maxRequestLength;

    beforeEach(() => {
      mbDriver = "Modbus driver object";
      fcode = 1;
      unitId = 2;
      maxRequestLength = 3;
    });

    let exec = () => {
      return new MBRequest(mbDriver, fcode, unitId, maxRequestLength);
    };

    it("should create request object and set appropriate variables based on given arguments", () => {
      let request = exec();

      expect(request).toBeDefined();
      expect(request._id).toBeDefined();
      expect(request._mbDriver).toEqual(mbDriver);
      expect(request._fcode).toEqual(fcode);
      expect(request._unitId).toEqual(unitId);
      expect(request._maxRequestLength).toEqual(maxRequestLength);
    });

    it("should create requests with uniq ids", () => {
      let requests = [];

      //Creating 1 000 000 requests
      let numberOfRequestsToCheck = 1000000;

      for (let i = 0; i < numberOfRequestsToCheck; i++) {
        let newRequest = exec();
        requests.push(newRequest);
      }

      //Checking uniq ids
      let allUniqIds = _.uniq(requests.map(req => req.RequestId));

      expect(allUniqIds.length).toEqual(numberOfRequestsToCheck);
    });

    it("should set Write = true when MBfunction is write, and false otherwise ", () => {
      //Reading coils fcode = 1
      let request1 = new MBRequest(mbDriver, 1, unitId, maxRequestLength);
      expect(request1._write).toEqual(false);

      //Reading inputs fcode = 2
      let request2 = new MBRequest(mbDriver, 2, unitId, maxRequestLength);
      expect(request2._write).toEqual(false);

      //Reading registers fcode = 3
      let request3 = new MBRequest(mbDriver, 3, unitId, maxRequestLength);
      expect(request3._write).toEqual(false);

      //Reading input status fcode = 4
      let request4 = new MBRequest(mbDriver, 4, unitId, maxRequestLength);
      expect(request4._write).toEqual(false);

      //Writing coils fcode = 15
      let request5 = new MBRequest(mbDriver, 15, unitId, maxRequestLength);
      expect(request5._write).toEqual(true);

      //Writing registers = 16
      let request6 = new MBRequest(mbDriver, 16, unitId, maxRequestLength);
      expect(request6._write).toEqual(true);
    });

    it("should throw if fcode is invalid", () => {
      fcode = 20;
      expect(() => {
        exec();
      }).toThrow();
    });

    it("should initialize Length, DataToSend and variableConnection to appropriate values ", () => {
      let request = exec();

      expect(request.Length).toEqual(0);
      expect(request.DataToSend).toEqual([]);
      expect(request.VariableConnections).toEqual({});
    });

    it("should set maxRequestLength to 100 if it is not provided ", () => {
      maxRequestLength = undefined;
      let request = exec();

      expect(request._maxRequestLength).toEqual(100);
    });

    it("should throw if mbDriver is empty ", () => {
      mbDriver = undefined;
      expect(() => exec()).toThrow();
    });

    it("should throw if unitId is empty ", () => {
      unitId = undefined;
      expect(() => exec()).toThrow();
    });
  });

  describe("_createAction", () => {
    let mbDriver;
    let actionOfSettingData;
    let actionOfGettingData;
    let mbDriverCreateSetActionMock;
    let mbDriverCreateGetActionMock;
    let mbRequest;
    let fcode;
    let unitId;
    let maxRequestLength;
    let initialOffset;
    let intVariable1;
    let intVariable1Value;
    let intVariable2;
    let intVariable2Value;
    let overrideDataToSend;

    beforeEach(() => {
      initialOffset = 3;
      fcode = 3;
      actionOfSettingData = "Setting data";
      actionOfGettingData = "Getting data";
      mbDriverCreateSetActionMock = jest
        .fn()
        .mockReturnValue(actionOfSettingData);
      mbDriverCreateGetActionMock = jest
        .fn()
        .mockReturnValue(actionOfGettingData);
      unitId = 2;
      maxRequestLength = 100;
      intVariable1Value = 123;
      intVariable2Value = 345;
      overrideDataToSend = false;
    });

    let exec = async () => {
      mbDriver = {
        createSetDataAction: mbDriverCreateSetActionMock,
        createGetDataAction: mbDriverCreateGetActionMock
      };

      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      //Creating variables to Add
      intVariable1 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable1.init({
        name: "Var1",
        fCode: fcode,
        offset: initialOffset
      });

      intVariable2 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable2.init({
        name: "Var2",
        fCode: fcode,
        offset: initialOffset + 1
      });

      //Setting intVariableValues in order to check DataToSend
      intVariable1.Value = intVariable1Value;
      intVariable2.Value = intVariable2Value;

      //Setting data to send

      //Adding varaibles in order to get offset and length
      mbRequest.addVariable(intVariable1);
      mbRequest.addVariable(intVariable2);

      if (overrideDataToSend) mbRequest._dataToSend = null;
      return mbRequest._createAction();
    };

    it("should create call createGetDataAction of driver based of current offset and data length if fCode is read and should be called every added variable", async () => {
      fcode = 3;
      let action = await exec();

      //Calls three time - every added varaible + calling createAction
      expect(mbDriverCreateGetActionMock).toHaveBeenCalledTimes(3);

      //Call for first variable
      expect(mbDriverCreateGetActionMock.mock.calls[0][0]).toEqual(fcode);
      expect(mbDriverCreateGetActionMock.mock.calls[0][1]).toEqual(
        initialOffset
      );
      expect(mbDriverCreateGetActionMock.mock.calls[0][2]).toEqual(1);
      expect(mbDriverCreateGetActionMock.mock.calls[0][3]).toEqual(unitId);

      //Call for second variable
      expect(mbDriverCreateGetActionMock.mock.calls[1][0]).toEqual(fcode);
      expect(mbDriverCreateGetActionMock.mock.calls[1][1]).toEqual(
        initialOffset
      );
      expect(mbDriverCreateGetActionMock.mock.calls[1][2]).toEqual(2);
      expect(mbDriverCreateGetActionMock.mock.calls[1][3]).toEqual(unitId);

      //Call for createAction
      expect(mbDriverCreateGetActionMock.mock.calls[2][0]).toEqual(fcode);
      expect(mbDriverCreateGetActionMock.mock.calls[2][1]).toEqual(
        initialOffset
      );
      expect(mbDriverCreateGetActionMock.mock.calls[2][2]).toEqual(2);
      expect(mbDriverCreateGetActionMock.mock.calls[2][3]).toEqual(unitId);
    });

    it("should create call createSetDataAction of driver based of current offset and data length if fCode is write and should be called every added variable", async () => {
      fcode = 16;
      let action = await exec();

      //Calls three time - every added varaible + calling createAction
      expect(mbDriverCreateSetActionMock).toHaveBeenCalledTimes(3);

      //Call for first variable
      expect(mbDriverCreateSetActionMock.mock.calls[0][0]).toEqual(fcode);
      expect(mbDriverCreateSetActionMock.mock.calls[0][1]).toEqual(
        initialOffset
      );
      expect(mbDriverCreateSetActionMock.mock.calls[0][2]).toEqual([
        intVariable1Value
      ]);
      expect(mbDriverCreateSetActionMock.mock.calls[0][3]).toEqual(unitId);

      //Call for second variable
      expect(mbDriverCreateSetActionMock.mock.calls[1][0]).toEqual(fcode);
      expect(mbDriverCreateSetActionMock.mock.calls[1][1]).toEqual(
        initialOffset
      );
      expect(mbDriverCreateSetActionMock.mock.calls[1][2]).toEqual([
        intVariable1Value,
        intVariable2Value
      ]);
      expect(mbDriverCreateSetActionMock.mock.calls[1][3]).toEqual(unitId);

      //Call for createAction
      expect(mbDriverCreateSetActionMock.mock.calls[2][0]).toEqual(fcode);
      expect(mbDriverCreateSetActionMock.mock.calls[2][1]).toEqual(
        initialOffset
      );
      expect(mbDriverCreateSetActionMock.mock.calls[2][2]).toEqual([
        intVariable1Value,
        intVariable2Value
      ]);
      expect(mbDriverCreateSetActionMock.mock.calls[2][3]).toEqual(unitId);
    });

    it("should throw if fCode is write but data to send is empty", async () => {
      fcode = 16;
      overrideDataToSend = true;

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
    });
  });

  describe("setResponseData", () => {
    let mbDriver;
    let actionOfSettingData;
    let actionOfGettingData;
    let mbDriverCreateSetActionMock;
    let mbDriverCreateGetActionMock;
    let mbRequest;
    let fcode;
    let unitId;
    let maxRequestLength;
    let initialOffset;
    let intVariable1;
    let intVariable1Value;
    let intVariable2;
    let intVariable2Value;
    let intVariable1ResponseData;
    let intVariable2ResponseData;
    let intVariable3ResponseData;

    let responseData;

    beforeEach(() => {
      initialOffset = 3;
      fcode = 3;
      actionOfSettingData = "Setting data";
      actionOfGettingData = "Getting data";
      mbDriverCreateSetActionMock = jest
        .fn()
        .mockReturnValue(actionOfSettingData);
      mbDriverCreateGetActionMock = jest
        .fn()
        .mockReturnValue(actionOfGettingData);
      unitId = 2;
      maxRequestLength = 100;
      intVariable1Value = 123;
      intVariable2Value = 345;
      intVariable3Value = 987654;
      intVariable4Value = 567;
      intVariable1ResponseData = 765;
      intVariable2ResponseData = 987;
      intVariable3ResponseData = [543, 876];
      intVariable4ResponseData = 321;
    });

    let exec = async () => {
      mbDriver = {
        createSetDataAction: mbDriverCreateSetActionMock,
        createGetDataAction: mbDriverCreateGetActionMock
      };

      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      //Creating variables to Add
      intVariable1 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable1.init({
        name: "Var1",
        fCode: fcode,
        offset: initialOffset
      });

      intVariable2 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable2.init({
        name: "Var2",
        fCode: fcode,
        offset: initialOffset + 1
      });

      intVariable3 = new MBInt32Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable3.init({
        name: "Var3",
        fCode: fcode,
        offset: initialOffset + 2
      });

      intVariable4 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable4.init({
        name: "Var4",
        fCode: fcode,
        offset: initialOffset + 4
      });

      //Setting intVariableValues in order to check DataToSend
      intVariable1.Value = intVariable1Value;
      intVariable2.Value = intVariable2Value;
      intVariable3.Value = intVariable3Value;
      intVariable4.Value = intVariable4Value;

      //Adding varaibles in order to get offset and length
      mbRequest.addVariable(intVariable1);
      mbRequest.addVariable(intVariable2);
      mbRequest.addVariable(intVariable3);
      mbRequest.addVariable(intVariable4);

      responseData = [];
      if (intVariable1ResponseData) responseData.push(intVariable1ResponseData);
      if (intVariable2ResponseData) responseData.push(intVariable2ResponseData);
      if (intVariable3ResponseData)
        responseData = [...responseData, ...intVariable3ResponseData];
      if (intVariable4ResponseData) responseData.push(intVariable4ResponseData);

      mbRequest.setResponseData(responseData);
    };

    it("should set data of every variable data based on response data", async () => {
      await exec();

      expect(intVariable1.Data).toEqual([intVariable1ResponseData]);
      expect(intVariable2.Data).toEqual([intVariable2ResponseData]);
      expect(intVariable3.Data).toEqual(intVariable3ResponseData);
      expect(intVariable4.Data).toEqual([intVariable4ResponseData]);
    });

    it("should set response data in every object of VariableConnections", async () => {
      await exec();

      expect(
        mbRequest.VariableConnections[intVariable1.Id].responseData
      ).toEqual([intVariable1ResponseData]);
      expect(
        mbRequest.VariableConnections[intVariable2.Id].responseData
      ).toEqual([intVariable2ResponseData]);
      expect(
        mbRequest.VariableConnections[intVariable3.Id].responseData
      ).toEqual(intVariable3ResponseData);
      expect(
        mbRequest.VariableConnections[intVariable4.Id].responseData
      ).toEqual([intVariable4ResponseData]);
    });

    it("should throw if data response is undefined", async () => {
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await mbRequest.setResponseData();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should thow if response data length is invalid", async () => {
      intVariable3ResponseData = undefined;

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
    });
  });

  describe("canVariableBeAddedToRequest", () => {
    let mbDriver;
    let actionOfSettingData;
    let actionOfGettingData;
    let mbDriverCreateSetActionMock;
    let mbDriverCreateGetActionMock;
    let mbRequest;
    let fcode;
    let unitId;
    let maxRequestLength;
    let initialOffset;
    let intVariable1;
    let intVariable2;

    let variableUnitId;
    let variableToAddName;
    let variableToAddFcode;
    let variableToAddInitialOffset;

    beforeEach(() => {
      initialOffset = 3;
      fcode = 3;
      actionOfSettingData = "Setting data";
      actionOfGettingData = "Getting data";
      mbDriverCreateSetActionMock = jest
        .fn()
        .mockReturnValue(actionOfSettingData);
      mbDriverCreateGetActionMock = jest
        .fn()
        .mockReturnValue(actionOfGettingData);
      unitId = 2;
      variableUnitId = unitId;
      maxRequestLength = 100;
      variableToAddName = "Var3";
      variableToAddFcode = fcode;
      variableToAddInitialOffset = initialOffset + 2;
    });

    let exec = async () => {
      mbDriver = {
        createSetDataAction: mbDriverCreateSetActionMock,
        createGetDataAction: mbDriverCreateGetActionMock
      };

      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      //Creating variables to Add
      intVariable1 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable1.init({
        name: "Var1",
        fCode: fcode,
        offset: initialOffset
      });

      intVariable2 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable2.init({
        name: "Var2",
        fCode: fcode,
        offset: initialOffset + 1
      });

      //Adding varaibles in order to get offset and length
      mbRequest.addVariable(intVariable1);
      mbRequest.addVariable(intVariable2);

      let variableToAdd = new MBInt16Variable({
        UnitId: variableUnitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await variableToAdd.init({
        name: variableToAddName,
        fCode: variableToAddFcode,
        offset: variableToAddInitialOffset
      });

      return mbRequest.canVariableBeAddedToRequest(variableToAdd);
    };

    it("should return true if request offset is not defined - first variable", async () => {
      //Whatever number
      variableToAddInitialOffset = 1532;

      let variableToAdd = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await variableToAdd.init({
        name: variableToAddName,
        fCode: variableToAddFcode,
        offset: variableToAddInitialOffset
      });
      mbDriver = {
        createSetDataAction: mbDriverCreateSetActionMock,
        createGetDataAction: mbDriverCreateGetActionMock
      };

      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      let result = mbRequest.canVariableBeAddedToRequest(variableToAdd);

      expect(result).toBeTruthy();
    });

    it("should return true if variable is possible to add to request", async () => {
      let result = await exec();

      expect(result).toBeTruthy();
    });

    it("should return false if variable offset is greater than request offset + request length", async () => {
      variableToAddInitialOffset = initialOffset + 3;

      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if variable unitId is different than request unitId", async () => {
      unitId = 4;

      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return true if variable with such name is was already added to request", async () => {
      variableToAddName = "Var1";

      let result = await exec();

      expect(result).toBeTruthy();
    });

    it("should return false if variable with such id is already added to request", async () => {
      mbDriver = {
        createSetDataAction: mbDriverCreateSetActionMock,
        createGetDataAction: mbDriverCreateGetActionMock
      };

      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      //Creating variables to Add
      intVariable1 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable1.init({
        name: "Var1",
        fCode: fcode,
        offset: initialOffset
      });

      intVariable2 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable2.init({
        name: "Var2",
        fCode: fcode,
        offset: initialOffset + 1
      });
      //Adding varaibles in order to get offset and length
      mbRequest.addVariable(intVariable1);
      mbRequest.addVariable(intVariable2);

      let variableToAdd = new MBInt16Variable({
        UnitId: variableUnitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await variableToAdd.init({
        name: variableToAddName,
        fCode: variableToAddFcode,
        offset: variableToAddInitialOffset
      });

      //Setting id as id of variable that already exists in request
      variableToAdd._id = intVariable2.Id;

      let result = mbRequest.canVariableBeAddedToRequest(variableToAdd);

      expect(result).toBeFalsy();
    });

    it("should return false if variable offset is smaller than request offset + request length", async () => {
      variableToAddInitialOffset = initialOffset + 1;

      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if variable offset + request offset + request length is greater than MB request limit", async () => {
      maxRequestLength = 2;

      let result = await exec();

      expect(result).toBeFalsy();
    });
  });

  describe("addVariable", () => {
    let mbDriver;
    let actionOfSettingData;
    let actionOfGettingData;
    let mbDriverCreateSetActionMock;
    let mbDriverCreateGetActionMock;
    let mbRequest;
    let mbRequestUpdateActionMock;
    let fcode;
    let unitId;
    let maxRequestLength;
    let initialOffset;
    let intVariable1;
    let intVariable2;

    let variableToAdd;
    let variableUnitId;
    let variableToAddName;
    let variableToAddFcode;
    let variableToAddInitialOffset;

    beforeEach(() => {
      initialOffset = 3;
      fcode = 3;
      actionOfSettingData = "Setting data";
      actionOfGettingData = "Getting data";
      mbDriverCreateSetActionMock = jest
        .fn()
        .mockReturnValue(actionOfSettingData);
      mbDriverCreateGetActionMock = jest
        .fn()
        .mockReturnValue(actionOfGettingData);
      unitId = 2;
      variableUnitId = unitId;
      maxRequestLength = 100;
      variableToAddName = "Var3";
      variableToAddFcode = fcode;
      variableToAddInitialOffset = initialOffset + 2;
      mbRequestUpdateActionMock = jest.fn();
    });

    let exec = async () => {
      mbDriver = {
        createSetDataAction: mbDriverCreateSetActionMock,
        createGetDataAction: mbDriverCreateGetActionMock
      };

      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      //Creating variables to Add
      intVariable1 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });

      await intVariable1.init({
        name: "Var1",
        fCode: fcode,
        offset: initialOffset
      });

      intVariable2 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });

      await intVariable2.init({
        name: "Var2",
        fCode: fcode,
        offset: initialOffset + 1
      });

      //Adding varaibles in order to get offset and length
      mbRequest.addVariable(intVariable1);
      mbRequest.addVariable(intVariable2);
      mbRequest.updateAction = mbRequestUpdateActionMock;

      variableToAdd = new MBInt32Variable({
        UnitId: variableUnitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });

      await variableToAdd.init({
        name: variableToAddName,
        fCode: variableToAddFcode,
        offset: variableToAddInitialOffset
      });

      mbRequest.addVariable(variableToAdd);
    };

    it("should throw if variable offset is greater than request offset + request length", async () => {
      variableToAddInitialOffset = initialOffset + 3;

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
    });

    it("should throw if variable with such Id was already added to request", async () => {
      mbDriver = {
        createSetDataAction: mbDriverCreateSetActionMock,
        createGetDataAction: mbDriverCreateGetActionMock
      };

      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      //Creating variables to Add
      intVariable1 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });

      await intVariable1.init({
        name: "Var1",
        fCode: fcode,
        offset: initialOffset
      });

      intVariable2 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });

      await intVariable2.init({
        name: "Var2",
        fCode: fcode,
        offset: initialOffset + 1
      });

      //Adding varaibles in order to get offset and length
      mbRequest.addVariable(intVariable1);
      mbRequest.addVariable(intVariable2);
      mbRequest.updateAction = mbRequestUpdateActionMock;

      variableToAdd = new MBInt32Variable({
        UnitId: variableUnitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await variableToAdd.init({
        name: variableToAddName,
        fCode: variableToAddFcode,
        offset: variableToAddInitialOffset
      });

      //Setting the same Id to variable to Add
      variableToAdd.Id = intVariable2.Id;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await mbRequest.addVariable(variableToAdd);
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();
    });

    it("should not throw if variable with such name is was already added to request", async () => {
      variableToAddName = "Var1";

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();
    });

    it("should throw if variable unitId is different than request unitId", async () => {
      unitId = 4;

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
      ``;
    });

    it("should throw if variable offset is smaller than request offset + request length", async () => {
      variableToAddInitialOffset = initialOffset + 1;

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
    });

    it("should throw if variable offset + request offset + request length is greater than MB request limit", async () => {
      maxRequestLength = 2;

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
    });

    it("should add variable to VariableConnections as a new variableObject", async () => {
      await exec();

      let variableObject = {
        requestOffset: 2,
        length: 2,
        responseData: undefined
      };

      expect(mbRequest.VariableConnections[variableToAdd.Id]).toBeDefined();
      expect(mbRequest.VariableConnections[variableToAdd.Id]).toMatchObject(
        variableObject
      );
      expect(mbRequest.VariableConnections[variableToAdd.Id].variable).toEqual(
        variableToAdd
      );
    });

    it("should increment length of request", async () => {
      let lengthBefore = 2;
      await exec();

      expect(mbRequest.Length).toEqual(lengthBefore + 2);
    });

    it("should call updateAction", async () => {
      await exec();

      expect(mbRequestUpdateActionMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("_formatDataToSend", () => {
    let mbDriver;
    let actionOfSettingData;
    let actionOfGettingData;
    let mbDriverCreateSetActionMock;
    let mbDriverCreateGetActionMock;
    let mbRequest;
    let fcode;
    let unitId;
    let maxRequestLength;
    let initialOffset;

    let intVariable1;
    let intVariable2;
    let intVariable3;
    let intVariable4;
    let intVariable5;

    beforeEach(() => {
      initialOffset = 3;
      fcode = 16;
      actionOfSettingData = "Setting data";
      actionOfGettingData = "Getting data";
      mbDriverCreateSetActionMock = jest
        .fn()
        .mockReturnValue(actionOfSettingData);
      mbDriverCreateGetActionMock = jest
        .fn()
        .mockReturnValue(actionOfGettingData);
      unitId = 2;
      maxRequestLength = 100;
    });

    let exec = async () => {
      mbDriver = {
        createSetDataAction: mbDriverCreateSetActionMock,
        createGetDataAction: mbDriverCreateGetActionMock
      };
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      //Creating variables to Add
      intVariable1 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable1.init({
        name: "Var1",
        fCode: fcode,
        offset: initialOffset
      });

      intVariable2 = new MBInt32Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable2.init({
        name: "Var2",
        fCode: fcode,
        offset: initialOffset + 1
      });

      intVariable3 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable3.init({
        name: "Var3",
        fCode: fcode,
        offset: initialOffset + 3
      });

      intVariable4 = new MBInt32Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable4.init({
        name: "Var4",
        fCode: fcode,
        offset: initialOffset + 4
      });

      intVariable5 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable5.init({
        name: "Var5",
        fCode: fcode,
        offset: initialOffset + 6
      });

      intVariable1.Data = [1];
      intVariable2.Data = [2, 3];
      intVariable3.Data = [4];
      intVariable4.Data = [5, 6];
      intVariable5.Data = [7];

      //Adding varaibles in order to get offset and length
      mbRequest.addVariable(intVariable1);
      mbRequest.addVariable(intVariable2);
      mbRequest.addVariable(intVariable3);
      mbRequest.addVariable(intVariable4);
      mbRequest.addVariable(intVariable5);

      return mbRequest._formatDataToSend();
    };

    it("should set DataToSend buffer on the basis of variables values - if there are several variables", async () => {
      await exec();

      expect(mbRequest.DataToSend).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("should not set DataToSend buffer on the basis of variables values - if MB function is not write", async () => {
      fcode = 3;

      await exec();

      expect(mbRequest.DataToSend).toEqual([]);
    });

    it("should set DataToSend buffer on the basis of variables values - if there is one variable with value 1", async () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      intVariable1 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });

      await intVariable1.init({
        name: "Var1",
        fCode: fcode,
        offset: initialOffset
      });

      intVariable1.Data = [1];

      mbRequest.addVariable(intVariable1);

      mbRequest._formatDataToSend();

      expect(mbRequest.DataToSend).toEqual([1]);
    });

    it("should set DataToSend buffer on the basis of variables values - if there is one variable with value 0", async () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      intVariable1 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable1.init({
        name: "Var1",
        fCode: fcode,
        offset: initialOffset
      });

      intVariable1.Data = [0];

      mbRequest.addVariable(intVariable1);

      mbRequest._formatDataToSend();

      expect(mbRequest.DataToSend).toEqual([0]);
    });
  });

  describe("_createVariableObject", () => {
    let mbDriver;
    let mbRequest;
    let fcode;
    let unitId;
    let maxRequestLength;
    let initialOffset;

    let variable;

    beforeEach(() => {
      mbDriver = {};
      initialOffset = 3;
      fcode = 3;
      unitId = 2;
      maxRequestLength = 100;
    });

    let exec = async () => {
      mbDriver = {
        createSetDataAction: jest.fn().mockReturnValue({}),
        createGetDataAction: jest.fn().mockReturnValue({})
      };

      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      //Creating variables to Add
      let variable1 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });

      await variable1.init({
        name: "Var1",
        fCode: fcode,
        offset: initialOffset
      });

      let variable2 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });

      await variable2.init({
        name: "Var2",
        fCode: fcode,
        offset: initialOffset + 1
      });

      mbRequest.addVariable(variable1);
      mbRequest.addVariable(variable2);

      //Creating variables to Add
      variable = new MBInt32Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });

      await variable.init({
        name: "Var3",
        fCode: fcode,
        offset: initialOffset + 2
      });

      return mbRequest._createVariableObject(variable);
    };

    it("should create variable object on the basis of variable", async () => {
      let variableObject = await exec();

      let mockVariable = {
        requestOffset: 2,
        length: variable.Length,
        responseData: undefined
      };

      expect(variableObject).toMatchObject(mockVariable);
      expect(variableObject.variable).toEqual(variable);
    });
  });

  describe("updateAction", () => {
    let mbDriver;
    let actionOfSettingData;
    let actionOfGettingData;
    let mbDriverCreateSetActionMock;
    let mbDriverCreateGetActionMock;
    let mbRequest;
    let fcode;
    let unitId;
    let maxRequestLength;
    let initialOffset;

    let intVariable1;
    let intVariable2;
    let intVariable3;
    let intVariable4;
    let intVariable5;

    beforeEach(() => {
      initialOffset = 3;
      fcode = 3;
      actionOfSettingData = "Setting data";
      actionOfGettingData = "Getting data";
      mbDriverCreateSetActionMock = jest
        .fn()
        .mockReturnValue(actionOfSettingData);
      mbDriverCreateGetActionMock = jest
        .fn()
        .mockReturnValue(actionOfGettingData);
      unitId = 2;
      maxRequestLength = 100;
    });

    let exec = async () => {
      mbDriver = {
        createSetDataAction: mbDriverCreateSetActionMock,
        createGetDataAction: mbDriverCreateGetActionMock
      };
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);

      //Creating variables to Add
      intVariable1 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable1.init({
        name: "Var1",
        fCode: fcode,
        offset: initialOffset
      });

      intVariable2 = new MBInt32Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable2.init({
        name: "Var2",
        fCode: fcode,
        offset: initialOffset + 1
      });

      intVariable3 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable3.init({
        name: "Var3",
        fCode: fcode,
        offset: initialOffset + 3
      });

      intVariable4 = new MBInt32Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable4.init({
        name: "Var4",
        fCode: fcode,
        offset: initialOffset + 4
      });

      intVariable5 = new MBInt16Variable({
        UnitId: unitId,
        MBDriver: {
          createGetDataAction: jest.fn().mockReturnValue(1),
          createSetDataAction: jest.fn().mockReturnValue(2)
        }
      });
      await intVariable5.init({
        name: "Var5",
        fCode: fcode,
        offset: initialOffset + 6
      });

      intVariable1.Data = [1];
      intVariable2.Data = [2, 3];
      intVariable3.Data = [4];
      intVariable4.Data = [5, 6];
      intVariable5.Data = [7];

      //Adding varaibles in order to get offset and length
      mbRequest.addVariable(intVariable1);
      mbRequest.addVariable(intVariable2);
      mbRequest.addVariable(intVariable3);
      mbRequest.addVariable(intVariable4);
      mbRequest.addVariable(intVariable5);

      mbRequest.updateAction();
    };

    it("should set data to be send if mbfunction is write", async () => {
      fcode = 16;

      await exec();

      expect(mbRequest.DataToSend).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("should not set data to be send if mbfunction is read", async () => {
      fcode = 4;

      await exec();

      expect(mbRequest.DataToSend).toEqual([]);
    });

    it("should set Action object of request on the basis of variables if function is reading data", async () => {
      fcode = 4;
      await exec();

      expect(mbRequest.Action).toBeDefined();
      expect(mbRequest.Action).toEqual(actionOfGettingData);
    });

    it("should set Action object of request on the basis of variables if function is writing data", async () => {
      fcode = 16;

      await exec();

      expect(mbRequest.Action).toBeDefined();
      expect(mbRequest.Action).toEqual(actionOfSettingData);
    });
  });

  describe("RequestId", () => {
    let mbDriver;
    let fcode;
    let unitId;
    let maxRequestLength;
    let mbRequest;

    beforeEach(() => {
      mbDriver = "Modbus driver object";
      fcode = 1;
      unitId = 2;
      maxRequestLength = 3;
    });

    let exec = () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);
      return mbRequest.RequestId;
    };

    it("should return _requestId", () => {
      let result = exec();
      expect(result).toBeDefined();
      expect(result).toEqual(mbRequest._id);
    });
  });

  describe("Action", () => {
    let mbDriver;
    let fcode;
    let unitId;
    let maxRequestLength;
    let action;
    let mbRequest;

    beforeEach(() => {
      mbDriver = "Modbus driver object";
      fcode = 1;
      unitId = 2;
      maxRequestLength = 3;
      action = "Action";
    });

    let exec = () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);
      mbRequest._action = action;
      return mbRequest.Action;
    };

    it("should return _requestId", () => {
      let result = exec();
      expect(result).toBeDefined();
      expect(result).toEqual(action);
    });
  });

  describe("DataToSend", () => {
    let mbDriver;
    let fcode;
    let unitId;
    let maxRequestLength;
    let data;
    let mbRequest;

    beforeEach(() => {
      mbDriver = "Modbus driver object";
      fcode = 1;
      unitId = 2;
      maxRequestLength = 3;
      data = "Action";
    });

    let exec = () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);
      mbRequest._dataToSend = data;
      return mbRequest.DataToSend;
    };

    it("should return dataToSend", () => {
      let result = exec();
      expect(result).toBeDefined();
      expect(result).toEqual(data);
    });
  });

  describe("UnitId", () => {
    let mbDriver;
    let fcode;
    let unitId;
    let maxRequestLength;
    let mbRequest;

    beforeEach(() => {
      mbDriver = "Modbus driver object";
      fcode = 1;
      unitId = 2;
      maxRequestLength = 3;
    });

    let exec = () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);
      return mbRequest.UnitId;
    };

    it("should return unitId", () => {
      let result = exec();
      expect(result).toBeDefined();
      expect(result).toEqual(unitId);
    });
  });

  describe("MBDriver", () => {
    let mbDriver;
    let fcode;
    let unitId;
    let maxRequestLength;
    let mbRequest;

    beforeEach(() => {
      mbDriver = "Modbus driver object";
      fcode = 1;
      unitId = 2;
      maxRequestLength = 3;
    });

    let exec = () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);
      return mbRequest.MBDriver;
    };

    it("should return mbDriver", () => {
      let result = exec();
      expect(result).toBeDefined();
      expect(result).toEqual(mbDriver);
    });
  });

  describe("FCode", () => {
    let mbDriver;
    let fcode;
    let unitId;
    let maxRequestLength;
    let mbRequest;

    beforeEach(() => {
      mbDriver = "Modbus driver object";
      fcode = 1;
      unitId = 2;
      maxRequestLength = 3;
    });

    let exec = () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);
      return mbRequest.FCode;
    };

    it("should return _fCode", () => {
      let result = exec();
      expect(result).toBeDefined();
      expect(result).toEqual(fcode);
    });
  });

  describe("Offset", () => {
    let mbDriver;
    let fcode;
    let unitId;
    let maxRequestLength;
    let mbRequest;
    let offsetValue;

    beforeEach(() => {
      mbDriver = "Modbus driver object";
      fcode = 1;
      unitId = 2;
      maxRequestLength = 3;
      offsetValue = 5;
    });

    let exec = () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);
      mbRequest._offset = offsetValue;

      return mbRequest.Offset;
    };

    it("should return _offset", () => {
      let result = exec();
      expect(result).toBeDefined();
      expect(result).toEqual(offsetValue);
    });
  });

  describe("Length", () => {
    let mbDriver;
    let fcode;
    let unitId;
    let maxRequestLength;
    let mbRequest;
    let lengthValue;

    beforeEach(() => {
      mbDriver = "Modbus driver object";
      fcode = 1;
      unitId = 2;
      maxRequestLength = 3;
      lengthValue = 5;
    });

    let exec = () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);
      mbRequest._length = lengthValue;

      return mbRequest.Length;
    };

    it("should return _length", () => {
      let result = exec();
      expect(result).toBeDefined();
      expect(result).toEqual(lengthValue);
    });
  });

  describe("ResponseData", () => {
    let mbDriver;
    let fcode;
    let unitId;
    let maxRequestLength;
    let mbRequest;
    let responseData;

    beforeEach(() => {
      mbDriver = "Modbus driver object";
      fcode = 1;
      unitId = 2;
      maxRequestLength = 3;
      responseData = [1, 2, 3, 4, 5];
    });

    let exec = () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);
      mbRequest._responseData = responseData;

      return mbRequest.ResponseData;
    };

    it("should return _responseData", () => {
      let result = exec();
      expect(result).toBeDefined();
      expect(result).toEqual(responseData);
    });
  });

  describe("VariableConnections", () => {
    let mbDriver;
    let fcode;
    let unitId;
    let maxRequestLength;
    let mbRequest;
    let varCollection;

    beforeEach(() => {
      mbDriver = "Modbus driver object";
      fcode = 1;
      unitId = 2;
      maxRequestLength = 3;
      varCollection = [1, 2, 3, 4, 5];
    });

    let exec = () => {
      mbRequest = new MBRequest(mbDriver, fcode, unitId, maxRequestLength);
      mbRequest._variableConnections = varCollection;

      return mbRequest.VariableConnections;
    };

    it("should return _variableConnections", () => {
      let result = exec();
      expect(result).toBeDefined();
      expect(result).toEqual(varCollection);
    });
  });
});
