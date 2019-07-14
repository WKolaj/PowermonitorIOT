const MSDataAgent = require("../../../classes/device/SpecialDevices/SendAgent/MSDataAgent");
const { MindConnectAgent } = require("@mindconnect/mindconnect-nodejs");
const config = require("config");
const path = require("path");
const Sampler = require("../../../classes/sampler/Sampler");
const { exists, isObjectEmpty } = require("../../../utilities/utilities");
const DataStorage = require("../../../classes/dataStorage/DataStorage");

let msDataAgentDirectory = "_projTest";
let {
  clearDirectoryAsync,
  checkIfTableExists,
  checkIfColumnExists,
  checkIfFileExistsAsync,
  createDatabaseFile,
  createDatabaseTable,
  createDatabaseColumn,
  readAllDataFromTable,
  snooze
} = require("../../../utilities/utilities");

describe("MSDataAgent", () => {
  beforeEach(async () => {
    await clearDirectoryAsync(msDataAgentDirectory);
  });

  afterEach(async () => {
    await clearDirectoryAsync(msDataAgentDirectory);
  });

  describe("constructor", () => {
    let exec = () => {
      return new MSDataAgent();
    };

    it("should create new MSDataAgent", () => {
      let result = exec();
      expect(result).toBeDefined();
    });

    it("should create new value storage", () => {
      let result = exec();
      expect(result.ValueStorage).toBeDefined();
    });

    it("should set busy to false", () => {
      let result = exec();
      expect(result.SendingBusy).toEqual(false);
    });

    it("should set ready to false", () => {
      let result = exec();
      expect(result.ReadyToSend).toEqual(false);
    });

    it("should set default sendDataLimit to 5", () => {
      let result = exec();
      expect(result.SendDataLimit).toEqual(5);
    });

    it("should set default bufferSize to 100", () => {
      let result = exec();
      expect(result.BufferSize).toEqual(100);
    });

    it("should set boarding key to null", () => {
      let result = exec();
      expect(result.BoardingKey).toBeNull();
    });

    it("should set VariableNames to empty object", () => {
      let result = exec();
      expect(result.VariableNames).toEqual({});
    });
  });

  describe("init", () => {
    let initialPayload;
    let msDataAgent;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: msDataAgentDirectory,
        readyToSend: true,
        boardingKey: {
          content: {
            baseUrl: "https://southgate.eu1.mindsphere.io",
            iat: "testIatvalue",
            clientCredentialProfile: ["SHARED_SECRET"],
            clientId: "testClientId",
            tenant: "testTenant"
          },
          expiration: "2019-07-18T05:06:57.000Z"
        },
        variableNames: {
          dp1: "dpId1",
          dp2: "dpId2",
          dp3: "dpId3",
          dp4: "dpId4",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
    });

    let exec = async () => {
      msDataAgent = new MSDataAgent();
      await msDataAgent.init(initialPayload);
    };

    it("should initialize dataAgend according to given payload", async () => {
      await exec();

      expect(msDataAgent.BufferSize).toEqual(initialPayload.bufferSize);
      expect(msDataAgent.SendDataLimit).toEqual(initialPayload.sendDataLimit);
      expect(msDataAgent.DirectoryPath).toEqual(initialPayload.dirPath);
      expect(msDataAgent.VariableNames).toEqual(initialPayload.variableNames);
      expect(msDataAgent.ReadyToSend).toEqual(initialPayload.readyToSend);
      expect(msDataAgent.BoardingKey).toEqual(initialPayload.boardingKey);
    });

    it("should set ready to send to false if it is defined as false in payload", async () => {
      initialPayload.readyToSend = false;
      await exec();

      expect(msDataAgent.ReadyToSend).toEqual(false);
    });

    it("should set ready to send to false if it is not defined in payload", async () => {
      initialPayload.readyToSend = undefined;
      await exec();

      expect(msDataAgent.ReadyToSend).toEqual(false);
    });

    it("should not set boarding key if it is not defined and ready to set is false", async () => {
      initialPayload.readyToSend = false;
      initialPayload.boardingKey = undefined;
      await exec();

      expect(msDataAgent.BoardingKey).toEqual(null);
    });

    it("should call boarding and config get methods if ready to send is set to true and boarding key is given", async () => {
      await exec();

      //Boarding key should have been passed to msDataAgent
      expect(msDataAgent.BoardingKey).toEqual(initialPayload.boardingKey);

      expect(msDataAgent.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(1);

      expect(
        msDataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);
    });

    it("should throw if boarding key is not defined and ready to send is set to true", async () => {
      initialPayload.boardingKey = undefined;
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

    it("should throw if boarding key is not proper and ready to send is set to true", async () => {
      initialPayload.boardingKey = "fakeBoardingKey";
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

    it("should initialize varaibleStorage inside dataAgend - according to the payload", async () => {
      await exec();

      let expectedDataAgentPayload = {
        dirPath: initialPayload.dirPath,
        sampleTimeGroups: initialPayload.sampleTimeGroups,
        bufferSize: initialPayload.bufferSize
      };

      expect(msDataAgent.ValueStorage.Payload).toEqual(
        expectedDataAgentPayload
      );
    });

    it("should throw if there is no dirPath defined", async () => {
      initialPayload.dirPath = undefined;
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

    it("should set bufferSize to 100 if there is no buffer size defined", async () => {
      initialPayload.bufferSize = undefined;
      await exec();

      expect(msDataAgent.BufferSize).toEqual(100);
    });

    it("should set sendDataLimit to 5 if there is no sendDataLimit is defined", async () => {
      initialPayload.sendDataLimit = undefined;

      await exec();

      expect(msDataAgent.SendDataLimit).toEqual(5);
    });

    it("should not throw and set VaraibleStorage if there are no sampleGroups defined", async () => {
      initialPayload.sampleTimeGroups = undefined;

      await exec();

      let expectedDataAgentPayload = {
        dirPath: initialPayload.dirPath,
        sampleTimeGroups: [],
        bufferSize: initialPayload.bufferSize
      };

      expect(msDataAgent.ValueStorage.Payload).toEqual(
        expectedDataAgentPayload
      );
    });
  });

  describe("addVariable", () => {
    let initialPayload;
    let msDataAgent;
    let variableId;
    let sampleTime;
    let varaibleMSname;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: msDataAgentDirectory,
        readyToSend: true,
        boardingKey: {
          content: {
            baseUrl: "https://southgate.eu1.mindsphere.io",
            iat: "testIatvalue",
            clientCredentialProfile: ["SHARED_SECRET"],
            clientId: "testClientId",
            tenant: "testTenant"
          },
          expiration: "2019-07-18T05:06:57.000Z"
        },
        variableNames: {
          dp1: "dpId1",
          dp2: "dpId2",
          dp3: "dpId3",
          dp4: "dpId4",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      sampleTime = 15;
      variableId = "dp9";
      varaibleMSname = "dpId9";
    });

    let exec = async () => {
      msDataAgent = new MSDataAgent();
      await msDataAgent.init(initialPayload);
      await msDataAgent.addVariable(sampleTime, variableId, varaibleMSname);
    };

    it("should add new variable to DataAgent", async () => {
      await exec();

      let expectedPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: msDataAgentDirectory,
        readyToSend: true,
        boardingKey: {
          content: {
            baseUrl: "https://southgate.eu1.mindsphere.io",
            iat: "testIatvalue",
            clientCredentialProfile: ["SHARED_SECRET"],
            clientId: "testClientId",
            tenant: "testTenant"
          },
          expiration: "2019-07-18T05:06:57.000Z"
        },
        variableNames: {
          dp1: "dpId1",
          dp2: "dpId2",
          dp3: "dpId3",
          dp4: "dpId4",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8",
          dp9: "dpId9"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          },
          {
            sampleTime: 15,
            variableIds: ["dp9"]
          }
        ]
      };
      expect(msDataAgent.Payload).toEqual(expectedPayload);
    });

    it("should add new variable to VariableNames", async () => {
      await exec();

      expect(msDataAgent.VariableNames[variableId]).toEqual(varaibleMSname);
    });

    it("should append variable to SampleTimeGroup if given sampleTimeGroup already exists", async () => {
      sampleTime = 10;

      await exec();

      let expectedPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: msDataAgentDirectory,
        readyToSend: true,
        boardingKey: {
          content: {
            baseUrl: "https://southgate.eu1.mindsphere.io",
            iat: "testIatvalue",
            clientCredentialProfile: ["SHARED_SECRET"],
            clientId: "testClientId",
            tenant: "testTenant"
          },
          expiration: "2019-07-18T05:06:57.000Z"
        },
        variableNames: {
          dp1: "dpId1",
          dp2: "dpId2",
          dp3: "dpId3",
          dp4: "dpId4",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8",
          dp9: "dpId9"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8", "dp9"]
          }
        ]
      };
      expect(msDataAgent.Payload).toEqual(expectedPayload);
    });

    it("should throw and not add new variable to DataAgent if varaible already exists", async () => {
      sampleTime = 10;
      variableId = "dp7";

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

      expect(msDataAgent.Payload).toEqual(initialPayload);
    });

    it("should throw and not add variable if variable already exists for different sampleTimeGroup", async () => {
      sampleTime = 15;
      variableId = "dp7";

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

      expect(msDataAgent.Payload).toEqual(initialPayload);
    });
  });

  describe("removeVariable", () => {
    let initialPayload;
    let msDataAgent;
    let variableId;
    let sampleTime;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: msDataAgentDirectory,
        readyToSend: true,
        boardingKey: {
          content: {
            baseUrl: "https://southgate.eu1.mindsphere.io",
            iat: "testIatvalue",
            clientCredentialProfile: ["SHARED_SECRET"],
            clientId: "testClientId",
            tenant: "testTenant"
          },
          expiration: "2019-07-18T05:06:57.000Z"
        },
        variableNames: {
          dp1: "dpId1",
          dp2: "dpId2",
          dp3: "dpId3",
          dp4: "dpId4",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      sampleTime = 5;
      variableId = "dp4";
    });

    let exec = async () => {
      msDataAgent = new MSDataAgent();
      await msDataAgent.init(initialPayload);
      await msDataAgent.removeVariable(sampleTime, variableId);
    };

    it("should remove variable to DataAgent", async () => {
      await exec();

      let expectedPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: msDataAgentDirectory,
        readyToSend: true,
        boardingKey: {
          content: {
            baseUrl: "https://southgate.eu1.mindsphere.io",
            iat: "testIatvalue",
            clientCredentialProfile: ["SHARED_SECRET"],
            clientId: "testClientId",
            tenant: "testTenant"
          },
          expiration: "2019-07-18T05:06:57.000Z"
        },
        variableNames: {
          dp1: "dpId1",
          dp2: "dpId2",
          dp3: "dpId3",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      expect(msDataAgent.Payload).toEqual(expectedPayload);
    });

    it("should throw and not remove any variable from DataAgent if there is no variable of given id", async () => {
      sampleTime = 5;
      variableId = "dp7";

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

      expect(msDataAgent.Payload).toEqual(initialPayload);
    });

    it("should throw and not remove any variable from DataAgent if there is no sample group", async () => {
      sampleTime = 15;
      variableId = "dp7";

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

      expect(msDataAgent.Payload).toEqual(initialPayload);
    });
  });

  describe("refresh", () => {
    let initialPayload;
    let msDataAgent;
    let tickId;
    let dataPayload;
    let readyToSendData;
    let setBulkDataToThrow;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: msDataAgentDirectory,
        readyToSend: true,
        boardingKey: {
          content: {
            baseUrl: "https://southgate.eu1.mindsphere.io",
            iat: "testIatvalue",
            clientCredentialProfile: ["SHARED_SECRET"],
            clientId: "testClientId",
            tenant: "testTenant"
          },
          expiration: "2019-07-18T05:06:57.000Z"
        },
        variableNames: {
          dp1: "dpId1",
          dp2: "dpId2",
          dp3: "dpId3",
          dp4: "dpId4",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };

      tickId = 1000;

      dataPayload = {
        dp1: 101,
        dp2: 102,
        dp3: 103,
        dp4: 104,
        dp5: 105,
        dp6: 106,
        dp7: 107,
        dp8: 108
      };
      setBulkDataToThrow = false;
    });

    let exec = async () => {
      msDataAgent = new MSDataAgent();
      await msDataAgent.init(initialPayload);
      if (setBulkDataToThrow)
        msDataAgent.MindConnectAgent.BulkPostData = jest.fn(
          async (data, validation) => {
            throw new Error("err");
          }
        );
      await msDataAgent.refresh(tickId, dataPayload);
    };

    it("should invoke MS bulk method for every sample group with argument that corresponds to given payload - if everything goes well", async () => {
      await exec();

      let numberOfSampleGroups = initialPayload.sampleTimeGroups.length;

      expect(msDataAgent.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        numberOfSampleGroups
      );

      let date = Sampler.convertTickNumberToDate(tickId);

      for (let i = 0; i < initialPayload.sampleTimeGroups.length; i++) {
        let sampleTimeGroup = initialPayload.sampleTimeGroups[i];

        let expectedDataPayload = {};
        expectedDataPayload.timestamp = date.toISOString();
        expectedDataPayload.values = [];

        for (let variable of sampleTimeGroup.variableIds) {
          if (exists(dataPayload[variable])) {
            let valueObject = {
              dataPointId: msDataAgent.VariableNames[variable],
              qualityCode: "0",
              value: dataPayload[variable].toString()
            };
            expectedDataPayload.values.push(valueObject);
          }
        }

        //Has to be packed into array - mechanism is ready for several sampleTimes
        expect(
          msDataAgent.MindConnectAgent.BulkPostData.mock.calls[i][0]
        ).toEqual([expectedDataPayload]);
      }
    });

    it("should omit data for varaible that are not added", async () => {
      dataPayload["fakeDp"] = 12355;

      await exec();

      let numberOfSampleGroups = initialPayload.sampleTimeGroups.length;

      expect(msDataAgent.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        numberOfSampleGroups
      );

      let date = Sampler.convertTickNumberToDate(tickId);

      for (let i = 0; i < initialPayload.sampleTimeGroups.length; i++) {
        let sampleTimeGroup = initialPayload.sampleTimeGroups[i];

        let expectedDataPayload = {};
        expectedDataPayload.timestamp = date.toISOString();
        expectedDataPayload.values = [];

        for (let variable of sampleTimeGroup.variableIds) {
          if (exists(dataPayload[variable])) {
            let valueObject = {
              dataPointId: msDataAgent.VariableNames[variable],
              qualityCode: "0",
              value: dataPayload[variable].toString()
            };
            expectedDataPayload.values.push(valueObject);
          }
        }

        //Has to be packed into array - mechanism is ready for several sampleTimes
        expect(
          msDataAgent.MindConnectAgent.BulkPostData.mock.calls[i][0]
        ).toEqual([expectedDataPayload]);
      }
    });

    it("should invoke MS bulk method correctly if not all values for every varaibles are given", async () => {
      dataPayload = {
        dp2: 102,
        dp4: 104,
        dp6: 106,
        dp8: 108
      };

      await exec();

      let numberOfSampleGroups = initialPayload.sampleTimeGroups.length;

      expect(msDataAgent.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        numberOfSampleGroups
      );

      let date = Sampler.convertTickNumberToDate(tickId);

      for (let i = 0; i < initialPayload.sampleTimeGroups.length; i++) {
        let sampleTimeGroup = initialPayload.sampleTimeGroups[i];

        let expectedDataPayload = {};
        expectedDataPayload.timestamp = date.toISOString();
        expectedDataPayload.values = [];

        for (let variable of sampleTimeGroup.variableIds) {
          if (exists(dataPayload[variable])) {
            let valueObject = {
              dataPointId: msDataAgent.VariableNames[variable],
              qualityCode: "0",
              value: dataPayload[variable].toString()
            };
            expectedDataPayload.values.push(valueObject);
          }
        }

        //Has to be packed into array - mechanism is ready for several sampleTimes
        expect(
          msDataAgent.MindConnectAgent.BulkPostData.mock.calls[i][0]
        ).toEqual([expectedDataPayload]);
      }
    });

    it("should invoke MS bulk method correctly if not every sample group are given", async () => {
      dataPayload = {
        dp1: 101,
        dp2: 102,
        dp3: 103,
        dp6: 106,
        dp7: 107,
        dp8: 108
      };

      await exec();

      let numberOfSampleGroups = initialPayload.sampleTimeGroups.length;

      expect(msDataAgent.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        numberOfSampleGroups - 1
      );

      let date = Sampler.convertTickNumberToDate(tickId);

      let callIndex = 0;
      for (let i = 0; i < initialPayload.sampleTimeGroups.length; i++) {
        let sampleTimeGroup = initialPayload.sampleTimeGroups[i];

        let expectedDataPayload = {};
        expectedDataPayload.timestamp = date.toISOString();
        expectedDataPayload.values = [];

        for (let variable of sampleTimeGroup.variableIds) {
          if (exists(dataPayload[variable])) {
            let valueObject = {
              dataPointId: msDataAgent.VariableNames[variable],
              qualityCode: "0",
              value: dataPayload[variable].toString()
            };
            expectedDataPayload.values.push(valueObject);
          }
        }

        if (!isObjectEmpty(expectedDataPayload.values)) {
          //Has to be packed into array - mechanism is ready for several sampleTimes
          expect(
            msDataAgent.MindConnectAgent.BulkPostData.mock.calls[callIndex][0]
          ).toEqual([expectedDataPayload]);
          callIndex++;
        }
      }
    });

    it("should set busy to false if everything goes well", async () => {
      await exec();

      expect(msDataAgent.SendingBusy).toEqual(false);
    });

    it("should not throw if bull post data throws", async () => {
      setBulkDataToThrow = true;

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

    it("should set busy to false if bull post data fails", async () => {
      setBulkDataToThrow = true;

      await exec();
      expect(msDataAgent.SendingBusy).toEqual(false);
    });

    it("should store data inside database if bull post data fails", async () => {
      setBulkDataToThrow = true;
      await exec();

      let restData = await msDataAgent._getBufferedData();

      let expectedRestData = {
        [1]: {
          [tickId]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          }
        },
        [5]: {
          [tickId]: {
            dp4: 104,
            dp5: 105
          }
        },
        [10]: {
          [tickId]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          }
        }
      };

      expect(restData).toEqual(expectedRestData);
    });

    it("should send all buffered data next time if sending fails before", async () => {
      setBulkDataToThrow = true;
      await exec();

      let restData = await msDataAgent._getBufferedData();

      let expectedRestData = {
        [1]: {
          [tickId]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          }
        },
        [5]: {
          [tickId]: {
            dp4: 104,
            dp5: 105
          }
        },
        [10]: {
          [tickId]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          }
        }
      };

      expect(restData).toEqual(expectedRestData);

      //Sending data one more time should invoke send data again with the same data
      msDataAgent.MindConnectAgent.BulkPostData = jest.fn(
        async (data, validation) => {}
      );

      await msDataAgent.refresh(tickId + 1, {});

      expect(msDataAgent.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        3
      );

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[0][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(tickId).toISOString(),
          values: [
            {
              dataPointId: "dpId1",
              qualityCode: "0",
              value: "101"
            },
            {
              dataPointId: "dpId2",
              qualityCode: "0",
              value: "102"
            },
            {
              dataPointId: "dpId3",
              qualityCode: "0",
              value: "103"
            }
          ]
        }
      ]);

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[1][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(tickId).toISOString(),
          values: [
            {
              dataPointId: "dpId4",
              qualityCode: "0",
              value: "104"
            },
            {
              dataPointId: "dpId5",
              qualityCode: "0",
              value: "105"
            }
          ]
        }
      ]);

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[2][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(tickId).toISOString(),
          values: [
            {
              dataPointId: "dpId6",
              qualityCode: "0",
              value: "106"
            },
            {
              dataPointId: "dpId7",
              qualityCode: "0",
              value: "107"
            },
            {
              dataPointId: "dpId8",
              qualityCode: "0",
              value: "108"
            }
          ]
        }
      ]);

      //Rest data should be empty
      let restData2 = await msDataAgent._getBufferedData();

      expect(restData2).toEqual({
        [1]: {},
        [5]: {},
        [10]: {}
      });
    });

    it("should send all buffered data next time if sending fails before for several times", async () => {
      setBulkDataToThrow = true;
      await exec();

      dataPayload = {
        dp1: 201,
        dp2: 202,
        dp3: 203,
        dp4: 204,
        dp5: 205,
        dp6: 206,
        dp7: 207,
        dp8: 208
      };

      await msDataAgent.refresh(tickId + 1, dataPayload);

      dataPayload = {
        dp1: 301,
        dp2: 302,
        dp3: 303,
        dp4: 304,
        dp5: 305,
        dp6: 306,
        dp7: 307,
        dp8: 308
      };

      await msDataAgent.refresh(tickId + 2, dataPayload);

      let restData = await msDataAgent._getBufferedData();

      let expectedRestData = {
        [1]: {
          [tickId]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          },

          [tickId + 1]: {
            dp1: 201,
            dp2: 202,
            dp3: 203
          },

          [tickId + 2]: {
            dp1: 301,
            dp2: 302,
            dp3: 303
          }
        },
        [5]: {
          [tickId]: {
            dp4: 104,
            dp5: 105
          },
          [tickId + 1]: {
            dp4: 204,
            dp5: 205
          },
          [tickId + 2]: {
            dp4: 304,
            dp5: 305
          }
        },
        [10]: {
          [tickId]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          },
          [tickId + 1]: {
            dp6: 206,
            dp7: 207,
            dp8: 208
          },
          [tickId + 2]: {
            dp6: 306,
            dp7: 307,
            dp8: 308
          }
        }
      };

      expect(restData).toEqual(expectedRestData);

      //Sending data one more time should invoke send data again with the same data
      msDataAgent.MindConnectAgent.BulkPostData = jest.fn(
        async (data, validation) => {}
      );

      await msDataAgent.refresh(tickId + 1, {});

      expect(msDataAgent.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        3
      );

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[0][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(tickId).toISOString(),
          values: [
            {
              dataPointId: "dpId1",
              qualityCode: "0",
              value: "101"
            },
            {
              dataPointId: "dpId2",
              qualityCode: "0",
              value: "102"
            },
            {
              dataPointId: "dpId3",
              qualityCode: "0",
              value: "103"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(tickId + 1).toISOString(),
          values: [
            {
              dataPointId: "dpId1",
              qualityCode: "0",
              value: "201"
            },
            {
              dataPointId: "dpId2",
              qualityCode: "0",
              value: "202"
            },
            {
              dataPointId: "dpId3",
              qualityCode: "0",
              value: "203"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(tickId + 2).toISOString(),
          values: [
            {
              dataPointId: "dpId1",
              qualityCode: "0",
              value: "301"
            },
            {
              dataPointId: "dpId2",
              qualityCode: "0",
              value: "302"
            },
            {
              dataPointId: "dpId3",
              qualityCode: "0",
              value: "303"
            }
          ]
        }
      ]);

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[1][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(tickId).toISOString(),
          values: [
            {
              dataPointId: "dpId4",
              qualityCode: "0",
              value: "104"
            },
            {
              dataPointId: "dpId5",
              qualityCode: "0",
              value: "105"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(tickId + 1).toISOString(),
          values: [
            {
              dataPointId: "dpId4",
              qualityCode: "0",
              value: "204"
            },
            {
              dataPointId: "dpId5",
              qualityCode: "0",
              value: "205"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(tickId + 2).toISOString(),
          values: [
            {
              dataPointId: "dpId4",
              qualityCode: "0",
              value: "304"
            },
            {
              dataPointId: "dpId5",
              qualityCode: "0",
              value: "305"
            }
          ]
        }
      ]);

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[2][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(tickId).toISOString(),
          values: [
            {
              dataPointId: "dpId6",
              qualityCode: "0",
              value: "106"
            },
            {
              dataPointId: "dpId7",
              qualityCode: "0",
              value: "107"
            },
            {
              dataPointId: "dpId8",
              qualityCode: "0",
              value: "108"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(tickId + 1).toISOString(),
          values: [
            {
              dataPointId: "dpId6",
              qualityCode: "0",
              value: "206"
            },
            {
              dataPointId: "dpId7",
              qualityCode: "0",
              value: "207"
            },
            {
              dataPointId: "dpId8",
              qualityCode: "0",
              value: "208"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(tickId + 2).toISOString(),
          values: [
            {
              dataPointId: "dpId6",
              qualityCode: "0",
              value: "306"
            },
            {
              dataPointId: "dpId7",
              qualityCode: "0",
              value: "307"
            },
            {
              dataPointId: "dpId8",
              qualityCode: "0",
              value: "308"
            }
          ]
        }
      ]);

      //Rest data should be empty
      let restData2 = await msDataAgent._getBufferedData();

      expect(restData2).toEqual({
        [1]: {},
        [5]: {},
        [10]: {}
      });
    });

    it("all storages should act like a buffer - and do not store data if it was not send more time than buffer size", async () => {
      initialPayload.bufferSize = 5;

      setBulkDataToThrow = true;
      await exec();

      //Only last 5 should be stored
      for (let i = 2000; i <= 10000; i += 1000) {
        await msDataAgent.refresh(i, dataPayload);
      }

      let restData1 = await msDataAgent._getBufferedData();

      let expectedRestData = {
        [1]: {
          [6000]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          },
          [7000]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          },
          [8000]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          },
          [9000]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          },
          [10000]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          }
        },
        [5]: {
          [6000]: {
            dp4: 104,
            dp5: 105
          },
          [7000]: {
            dp4: 104,
            dp5: 105
          },
          [8000]: {
            dp4: 104,
            dp5: 105
          },
          [9000]: {
            dp4: 104,
            dp5: 105
          },
          [10000]: {
            dp4: 104,
            dp5: 105
          }
        },
        [10]: {
          [6000]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          },
          [7000]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          },
          [8000]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          },
          [9000]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          },
          [10000]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          }
        }
      };

      expect(restData1).toEqual(expectedRestData);
    });

    it("all storages for given sample time group should be independent as a buffer", async () => {
      initialPayload.bufferSize = 5;

      setBulkDataToThrow = true;
      await exec();

      let dataPayloadForGroup10 = {
        dp6: 206,
        dp7: 207,
        dp8: 208
      };

      //Only last 5 should be stored
      for (let i = 2000; i <= 10000; i += 1000) {
        await msDataAgent.refresh(i, dataPayloadForGroup10);
      }

      let restData1 = await msDataAgent._getBufferedData();

      let expectedRestData = {
        [1]: {
          [tickId]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          }
        },
        [5]: {
          [tickId]: {
            dp4: 104,
            dp5: 105
          }
        },
        [10]: {
          [6000]: {
            dp6: 206,
            dp7: 207,
            dp8: 208
          },
          [7000]: {
            dp6: 206,
            dp7: 207,
            dp8: 208
          },
          [8000]: {
            dp6: 206,
            dp7: 207,
            dp8: 208
          },
          [9000]: {
            dp6: 206,
            dp7: 207,
            dp8: 208
          },
          [10000]: {
            dp6: 206,
            dp7: 207,
            dp8: 208
          }
        }
      };

      expect(restData1).toEqual(expectedRestData);
    });

    it("should not invoke post bull data but only store data if readyToSend is set to false", async () => {
      initialPayload.readyToSend = false;

      await exec();

      expect(msDataAgent.MindConnectAgent).not.toBeDefined();

      let restData = await msDataAgent._getBufferedData();

      let expectedRestData = {
        [1]: {
          [tickId]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          }
        },
        [5]: {
          [tickId]: {
            dp4: 104,
            dp5: 105
          }
        },
        [10]: {
          [tickId]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          }
        }
      };

      expect(restData).toEqual(expectedRestData);
    });

    it("should inoke post bull data after sending mechanism has been initialized", async () => {
      initialPayload.readyToSend = false;

      await exec();

      expect(msDataAgent.MindConnectAgent).not.toBeDefined();

      let restData = await msDataAgent._getBufferedData();

      let expectedRestData = {
        [1]: {
          [tickId]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          }
        },
        [5]: {
          [tickId]: {
            dp4: 104,
            dp5: 105
          }
        },
        [10]: {
          [tickId]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          }
        }
      };

      expect(restData).toEqual(expectedRestData);

      await msDataAgent.startCommunication();

      dataPayload = {
        dp1: 201,
        dp2: 202,
        dp3: 203,
        dp4: 204,
        dp5: 205,
        dp6: 206,
        dp7: 207,
        dp8: 208
      };

      await msDataAgent.refresh(tickId + 1, dataPayload);

      expect(msDataAgent.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        3
      );

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[0][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(tickId).toISOString(),
          values: [
            {
              dataPointId: "dpId1",
              qualityCode: "0",
              value: "101"
            },
            {
              dataPointId: "dpId2",
              qualityCode: "0",
              value: "102"
            },
            {
              dataPointId: "dpId3",
              qualityCode: "0",
              value: "103"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(tickId + 1).toISOString(),
          values: [
            {
              dataPointId: "dpId1",
              qualityCode: "0",
              value: "201"
            },
            {
              dataPointId: "dpId2",
              qualityCode: "0",
              value: "202"
            },
            {
              dataPointId: "dpId3",
              qualityCode: "0",
              value: "203"
            }
          ]
        }
      ]);

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[1][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(tickId).toISOString(),
          values: [
            {
              dataPointId: "dpId4",
              qualityCode: "0",
              value: "104"
            },
            {
              dataPointId: "dpId5",
              qualityCode: "0",
              value: "105"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(tickId + 1).toISOString(),
          values: [
            {
              dataPointId: "dpId4",
              qualityCode: "0",
              value: "204"
            },
            {
              dataPointId: "dpId5",
              qualityCode: "0",
              value: "205"
            }
          ]
        }
      ]);

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[2][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(tickId).toISOString(),
          values: [
            {
              dataPointId: "dpId6",
              qualityCode: "0",
              value: "106"
            },
            {
              dataPointId: "dpId7",
              qualityCode: "0",
              value: "107"
            },
            {
              dataPointId: "dpId8",
              qualityCode: "0",
              value: "108"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(tickId + 1).toISOString(),
          values: [
            {
              dataPointId: "dpId6",
              qualityCode: "0",
              value: "206"
            },
            {
              dataPointId: "dpId7",
              qualityCode: "0",
              value: "207"
            },
            {
              dataPointId: "dpId8",
              qualityCode: "0",
              value: "208"
            }
          ]
        }
      ]);

      //Rest data should be empty
      let restData2 = await msDataAgent._getBufferedData();

      expect(restData2).toEqual({
        [1]: {},
        [5]: {},
        [10]: {}
      });
    });

    it("should limit values to send to the number of sendDataLimit", async () => {
      initialPayload.sendDataLimit = 5;
      initialPayload.bufferSize = 10;

      setBulkDataToThrow = true;

      await exec();

      //Only last 5 should be stored
      for (let i = 2000; i <= 10000; i += 1000) {
        await msDataAgent.refresh(i, dataPayload);
      }

      let newSendDataMethod = jest.fn();

      //Sending data one more time should invoke send data again with the same data
      msDataAgent.MindConnectAgent.BulkPostData = jest.fn(
        async (data, validation) => {}
      );

      await msDataAgent.refresh(11000, {});

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[0][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(6000).toISOString(),
          values: [
            {
              dataPointId: "dpId1",
              qualityCode: "0",
              value: "101"
            },
            {
              dataPointId: "dpId2",
              qualityCode: "0",
              value: "102"
            },
            {
              dataPointId: "dpId3",
              qualityCode: "0",
              value: "103"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(7000).toISOString(),
          values: [
            {
              dataPointId: "dpId1",
              qualityCode: "0",
              value: "101"
            },
            {
              dataPointId: "dpId2",
              qualityCode: "0",
              value: "102"
            },
            {
              dataPointId: "dpId3",
              qualityCode: "0",
              value: "103"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(8000).toISOString(),
          values: [
            {
              dataPointId: "dpId1",
              qualityCode: "0",
              value: "101"
            },
            {
              dataPointId: "dpId2",
              qualityCode: "0",
              value: "102"
            },
            {
              dataPointId: "dpId3",
              qualityCode: "0",
              value: "103"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(9000).toISOString(),
          values: [
            {
              dataPointId: "dpId1",
              qualityCode: "0",
              value: "101"
            },
            {
              dataPointId: "dpId2",
              qualityCode: "0",
              value: "102"
            },
            {
              dataPointId: "dpId3",
              qualityCode: "0",
              value: "103"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(10000).toISOString(),
          values: [
            {
              dataPointId: "dpId1",
              qualityCode: "0",
              value: "101"
            },
            {
              dataPointId: "dpId2",
              qualityCode: "0",
              value: "102"
            },
            {
              dataPointId: "dpId3",
              qualityCode: "0",
              value: "103"
            }
          ]
        }
      ]);

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[1][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(6000).toISOString(),
          values: [
            {
              dataPointId: "dpId4",
              qualityCode: "0",
              value: "104"
            },
            {
              dataPointId: "dpId5",
              qualityCode: "0",
              value: "105"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(7000).toISOString(),
          values: [
            {
              dataPointId: "dpId4",
              qualityCode: "0",
              value: "104"
            },
            {
              dataPointId: "dpId5",
              qualityCode: "0",
              value: "105"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(8000).toISOString(),
          values: [
            {
              dataPointId: "dpId4",
              qualityCode: "0",
              value: "104"
            },
            {
              dataPointId: "dpId5",
              qualityCode: "0",
              value: "105"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(9000).toISOString(),
          values: [
            {
              dataPointId: "dpId4",
              qualityCode: "0",
              value: "104"
            },
            {
              dataPointId: "dpId5",
              qualityCode: "0",
              value: "105"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(10000).toISOString(),
          values: [
            {
              dataPointId: "dpId4",
              qualityCode: "0",
              value: "104"
            },
            {
              dataPointId: "dpId5",
              qualityCode: "0",
              value: "105"
            }
          ]
        }
      ]);

      expect(
        msDataAgent.MindConnectAgent.BulkPostData.mock.calls[2][0]
      ).toEqual([
        {
          timestamp: Sampler.convertTickNumberToDate(6000).toISOString(),

          values: [
            {
              dataPointId: "dpId6",
              qualityCode: "0",
              value: "106"
            },
            {
              dataPointId: "dpId7",
              qualityCode: "0",
              value: "107"
            },
            {
              dataPointId: "dpId8",
              qualityCode: "0",
              value: "108"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(7000).toISOString(),

          values: [
            {
              dataPointId: "dpId6",
              qualityCode: "0",
              value: "106"
            },
            {
              dataPointId: "dpId7",
              qualityCode: "0",
              value: "107"
            },
            {
              dataPointId: "dpId8",
              qualityCode: "0",
              value: "108"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(8000).toISOString(),

          values: [
            {
              dataPointId: "dpId6",
              qualityCode: "0",
              value: "106"
            },
            {
              dataPointId: "dpId7",
              qualityCode: "0",
              value: "107"
            },
            {
              dataPointId: "dpId8",
              qualityCode: "0",
              value: "108"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(9000).toISOString(),

          values: [
            {
              dataPointId: "dpId6",
              qualityCode: "0",
              value: "106"
            },
            {
              dataPointId: "dpId7",
              qualityCode: "0",
              value: "107"
            },
            {
              dataPointId: "dpId8",
              qualityCode: "0",
              value: "108"
            }
          ]
        },
        {
          timestamp: Sampler.convertTickNumberToDate(10000).toISOString(),
          values: [
            {
              dataPointId: "dpId6",
              qualityCode: "0",
              value: "106"
            },
            {
              dataPointId: "dpId7",
              qualityCode: "0",
              value: "107"
            },
            {
              dataPointId: "dpId8",
              qualityCode: "0",
              value: "108"
            }
          ]
        }
      ]);

      //It should remove part of data which was sent

      let restData1 = await msDataAgent._getBufferedData();

      let expectedRestData = {
        [1]: {
          [1000]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          },
          [2000]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          },
          [3000]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          },
          [4000]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          },
          [5000]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          }
        },
        [5]: {
          [1000]: {
            dp4: 104,
            dp5: 105
          },
          [2000]: {
            dp4: 104,
            dp5: 105
          },
          [3000]: {
            dp4: 104,
            dp5: 105
          },
          [4000]: {
            dp4: 104,
            dp5: 105
          },
          [5000]: {
            dp4: 104,
            dp5: 105
          }
        },
        [10]: {
          [1000]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          },
          [2000]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          },
          [3000]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          },
          [4000]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          },
          [5000]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          }
        }
      };

      expect(restData1).toEqual(expectedRestData);
    });
  });

  describe("_setBoardingKey", () => {
    let initialPayload;
    let msDataAgent;
    let boardingKey;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: msDataAgentDirectory,
        variableNames: {
          dp1: "dpId1",
          dp2: "dpId2",
          dp3: "dpId3",
          dp4: "dpId4",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      boardingKey = {
        content: {
          baseUrl: "https://southgate.eu1.mindsphere.io",
          iat: "testIatvalue",
          clientCredentialProfile: ["SHARED_SECRET"],
          clientId: "testClientId",
          tenant: "testTenant"
        },
        expiration: "2019-07-18T05:06:57.000Z"
      };
    });

    let exec = async () => {
      msDataAgent = new MSDataAgent();
      await msDataAgent.init(initialPayload);
      await msDataAgent._setBoardingKey(boardingKey);
    };

    it("should load new boarding key to agent", async () => {
      await exec();

      expect(msDataAgent.BoardingKey).toEqual(boardingKey);
    });

    it("should create new MindConnectAgent with boarding key", async () => {
      await exec();

      expect(msDataAgent.MindConnectAgent).toBeDefined();
      expect(msDataAgent.MindConnectAgent._credentials).toEqual(boardingKey);
    });

    it("should not set readyToSent to true", async () => {
      await exec();

      expect(msDataAgent.ReadyToSend).toEqual(false);
    });

    it("should throw if boardingKey are not valied", async () => {
      boardingKey = "fakeBoardingKey";
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

  describe("startCommunication", () => {
    let initialPayload;
    let msDataAgent;
    let board;
    let boardingKey;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: msDataAgentDirectory,
        variableNames: {
          dp1: "dpId1",
          dp2: "dpId2",
          dp3: "dpId3",
          dp4: "dpId4",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      boardingKey = {
        content: {
          baseUrl: "https://southgate.eu1.mindsphere.io",
          iat: "testIatvalue",
          clientCredentialProfile: ["SHARED_SECRET"],
          clientId: "testClientId",
          tenant: "testTenant"
        },
        expiration: "2019-07-18T05:06:57.000Z"
      };
      board = true;
    });

    let exec = async () => {
      msDataAgent = new MSDataAgent();
      await msDataAgent.init(initialPayload);
      if (board) await msDataAgent._setBoardingKey(boardingKey);
      await msDataAgent.startCommunication();
    };

    it("should create new MindConnectAgent with boarding key", async () => {
      await exec();

      expect(msDataAgent.MindConnectAgent).toBeDefined();
      expect(msDataAgent.MindConnectAgent._credentials).toEqual(boardingKey);
    });

    it("should set readyToSent to true", async () => {
      await exec();

      expect(msDataAgent.ReadyToSend).toEqual(true);
    });

    it("should throw if boardingKey are not valied", async () => {
      boardingKey = "fakeBoardingKey";
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

    it("should throw if boaringKey was not defined", async () => {
      board = false;
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

    it("should call boarding and config get methods if ready to send is set to true and boarding key is given", async () => {
      await exec();

      //Boarding key should have been passed to msDataAgent
      expect(msDataAgent.BoardingKey).toEqual(boardingKey);

      expect(msDataAgent.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(1);

      expect(
        msDataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("Payload", () => {
    let initialPayload;
    let msDataAgent;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: msDataAgentDirectory,
        readyToSend: true,
        boardingKey: {
          content: {
            baseUrl: "https://southgate.eu1.mindsphere.io",
            iat: "testIatvalue",
            clientCredentialProfile: ["SHARED_SECRET"],
            clientId: "testClientId",
            tenant: "testTenant"
          },
          expiration: "2019-07-18T05:06:57.000Z"
        },
        variableNames: {
          dp1: "dpId1",
          dp2: "dpId2",
          dp3: "dpId3",
          dp4: "dpId4",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
    });

    let exec = async () => {
      msDataAgent = new MSDataAgent();
      await msDataAgent.init(initialPayload);
      return msDataAgent.Payload;
    };

    it("should return valid payload of MSDataAgent", async () => {
      let result = await exec();
      expect(result).toEqual(initialPayload);
    });

    it("should make possible to recreate identical agent based on payload", async () => {
      let result = await exec();
      let newAgent = new MSDataAgent();
      await newAgent.init(result);
      expect(newAgent.Payload).toEqual(initialPayload);
    });

    it("should make possible to recreate identical agent based if boardingKey is not defined", async () => {
      delete initialPayload.boardingKey;
      initialPayload.readyToSend = false;
      let result = await exec();
      let newAgent = new MSDataAgent();
      await newAgent.init(result);
      expect(newAgent.Payload).toEqual({
        ...initialPayload,
        boardingKey: null
      });
    });

    it("should make possible to recreate identical agent based if boardingKey and ready to send are not defined", async () => {
      delete initialPayload.boardingKey;
      delete initialPayload.readyToSend;

      let result = await exec();
      let newAgent = new MSDataAgent();
      await newAgent.init(result);
      expect(newAgent.Payload).toEqual({
        ...initialPayload,
        boardingKey: null,
        readyToSend: false
      });
    });
  });

  describe("_getVariablesFromPayload", () => {
    let payload;

    beforeEach(() => {
      payload = {
        sampleTimeGroups: [
          {
            sampleTime: 10,
            variableIds: ["variableId1", "variableId2", "variableId3"]
          },
          {
            sampleTime: 20,
            variableIds: ["variableId4", "variableId5", "variableId6"]
          },
          {
            sampleTime: 30,
            variableIds: ["variableId7", "variableId8", "variableId9"]
          }
        ],
        variableNames: {
          variableId1: "variableName1",
          variableId2: "variableName2",
          variableId3: "variableName3",
          variableId4: "variableName4",
          variableId5: "variableName5",
          variableId6: "variableName6",
          variableId7: "variableName7",
          variableId8: "variableName8",
          variableId9: "variableName9"
        }
      };
    });

    let exec = () => {
      return MSDataAgent._getVariablesFromPayload(payload);
    };

    it("should convert variables from sampleGroups and VariableNames to one collection", () => {
      let result = exec();

      let expectedPayload = {};

      for (let group of payload.sampleTimeGroups) {
        let sampleTime = group.sampleTime;

        for (let variableId of group.variableIds) {
          let variableName = payload.variableNames[variableId];

          let variablePayload = {
            variableId,
            sampleTime,
            variableName
          };

          expectedPayload[variableId] = variablePayload;
        }
      }

      expect(result).toEqual(expectedPayload);
    });

    it("should throw if there is variable in sampleGroups and it does not exist in VariableNames", () => {
      payload.sampleTimeGroups[0].variableIds.push("additionalVariableId");
      expect(() => {
        exec();
      }).toThrow();
    });

    it("should throw if there is variable in VariableNames and it does not exist in sampleGroups", () => {
      payload.variableNames["additionalVariableId"] = "additionalVariableName";
      expect(() => {
        exec();
      }).toThrow();
    });

    it("should return empty object if there are no variables in sampleTimeGroups and in VariableNames", async () => {
      payload.sampleTimeGroups = {};
      payload.variableNames = {};

      let result = await exec();

      expect(result).toEqual({});
    });

    it("should throw if sampleTimeGroups in payload is not defined", async () => {
      delete payload.sampleTimeGroups;

      expect(() => exec()).toThrow();
    });

    it("should throw if variableNames in payload is not defined", async () => {
      delete payload.variableNames;

      expect(() => exec()).toThrow();
    });

    it("should throw if variableNames and sampleTimeGroups are payload is not defined", async () => {
      delete payload.variableNames;
      delete payload.sampleTimeGroups;

      expect(() => exec()).toThrow();
    });
  });

  describe("editWithPayload", () => {
    let initialPayload;
    let editPayload;
    let msDataAgent;
    let initialBoard;
    let boardingKey;
    let initialMindConnectAgent;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: msDataAgentDirectory,
        variableNames: {
          dp1: "dpId1",
          dp2: "dpId2",
          dp3: "dpId3",
          dp4: "dpId4",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      boardingKey = {
        content: {
          baseUrl: "https://southgate.eu1.mindsphere.io",
          iat: "testIatvalue",
          clientCredentialProfile: ["SHARED_SECRET"],
          clientId: "testClientId",
          tenant: "testTenant"
        },
        expiration: "2019-07-18T05:06:57.000Z"
      };
      initialBoard = true;

      editPayload = {
        bufferSize: 20,
        sendDataLimit: 25,
        readyToSend: false,
        boardingKey: {
          content: {
            baseUrl: "https://southgate.eu1.mindsphere.io",
            iat: "testIatvalue2",
            clientCredentialProfile: ["SHARED_SECRET"],
            clientId: "testClientId2",
            tenant: "testTenant2"
          },
          expiration: "2019-07-18T05:06:58.000Z"
        },
        variableNames: {
          dp3: "dpId3",
          dp4: "dpId4",
          dp5: "dpId5",
          dp6: "dpId6",
          dp7: "dpId7",
          dp8: "dpId8",
          dp9: "dpId9",
          dp10: "dpId10"
        },
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp4"]
          },
          {
            sampleTime: 15,
            variableIds: ["dp8", "dp9"]
          },
          {
            sampleTime: 20,
            variableIds: ["dp10"]
          }
        ]
      };
    });

    let exec = async () => {
      msDataAgent = new MSDataAgent();
      await msDataAgent.init(initialPayload);
      if (initialBoard) await msDataAgent._setBoardingKey(boardingKey);
      initialMindConnectAgent = msDataAgent.MindConnectAgent;
      return msDataAgent.editWithPayload(editPayload);
    };

    it("should return edited dataAgent", async () => {
      result = await exec();

      expect(result).toEqual(msDataAgent);
    });

    it("should edit dataAgent according to given payload", async () => {
      result = await exec();

      let expectedPayload = {
        ...editPayload,
        dirPath: initialPayload.dirPath
      };

      expect(result.Payload).toEqual(expectedPayload);
    });

    it("should create new MindConnectAgent, board it and getConfig if readyToSend was false and now is true", async () => {
      initialPayload.readyToSend = false;
      editPayload.readyToSend = true;
      result = await exec();

      expect(msDataAgent.MindConnectAgent).toBeDefined();
      expect(msDataAgent.MindConnectAgent).not.toEqual(initialMindConnectAgent);

      expect(msDataAgent.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(1);
      expect(
        msDataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);
    });

    it("should create new MindConnectAgent, board it and getConfig if readyToSend was true and now is true", async () => {
      initialPayload.readyToSend = false;
      editPayload.readyToSend = true;
      result = await exec();

      expect(msDataAgent.MindConnectAgent).toBeDefined();
      expect(msDataAgent.MindConnectAgent).not.toEqual(initialMindConnectAgent);

      expect(msDataAgent.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(1);
      expect(
        msDataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);
    });

    it("should create new MindConnectAgent, but not board it and not getConfig if readyToSend was false and now is false", async () => {
      initialPayload.readyToSend = false;
      editPayload.readyToSend = false;
      result = await exec();

      expect(msDataAgent.MindConnectAgent).toBeDefined();
      expect(msDataAgent.MindConnectAgent).not.toEqual(initialMindConnectAgent);

      expect(msDataAgent.MindConnectAgent.OnBoard).not.toHaveBeenCalled();
      expect(
        msDataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).not.toHaveBeenCalled();
    });

    it("should create new MindConnectAgent, but not board it and not getConfig if readyToSend was true and now is false", async () => {
      initialPayload.readyToSend = true;

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload.readyToSend = false;
      result = await exec();

      expect(msDataAgent.MindConnectAgent).toBeDefined();
      expect(msDataAgent.MindConnectAgent).not.toEqual(initialMindConnectAgent);

      expect(msDataAgent.MindConnectAgent.OnBoard).not.toHaveBeenCalled();
      expect(
        msDataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).not.toHaveBeenCalled();
    });

    it("should create new MindConnectAgent, but not board it and set readToSend to false - if only boarding key was passed", async () => {
      initialPayload.readyToSend = true;

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload = {
        boardingKey: editPayload.boardingKey
      };

      result = await exec();

      expect(msDataAgent.MindConnectAgent).toBeDefined();
      expect(msDataAgent.MindConnectAgent).not.toEqual(initialMindConnectAgent);

      expect(msDataAgent.MindConnectAgent.OnBoard).not.toHaveBeenCalled();
      expect(
        msDataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).not.toHaveBeenCalled();
      expect(msDataAgent.ReadyToSend).toEqual(false);
    });

    it("should create new MindConnectAgent,  board it and set readToSend to true - if only readyToSend was set with true value", async () => {
      initialPayload.readyToSend = false;

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = true;

      editPayload = {
        readyToSend: true
      };

      result = await exec();

      expect(msDataAgent.MindConnectAgent).toBeDefined();
      expect(msDataAgent.MindConnectAgent).not.toEqual(initialMindConnectAgent);

      expect(msDataAgent.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(1);
      expect(
        msDataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);
      expect(msDataAgent.ReadyToSend).toEqual(true);
    });

    it("should set readToSend to false - if it was set to true before", async () => {
      initialPayload.readyToSend = true;

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload = {
        readyToSend: false
      };

      result = await exec();

      expect(msDataAgent.MindConnectAgent).toBeDefined();
      expect(msDataAgent.MindConnectAgent).toEqual(initialMindConnectAgent);

      //Called once - while init
      expect(msDataAgent.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(1);
      expect(
        msDataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);

      expect(msDataAgent.ReadyToSend).toEqual(false);
    });

    it("should not create new MindConnectAgent, not board and not get config again - if given boarding key is the same", async () => {
      initialPayload.readyToSend = true;

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload = {
        boardingKey: boardingKey
      };

      result = await exec();

      expect(msDataAgent.MindConnectAgent).toBeDefined();
      expect(msDataAgent.MindConnectAgent).toEqual(initialMindConnectAgent);

      //Called once while initializing
      expect(msDataAgent.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(1);
      expect(
        msDataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);

      expect(msDataAgent.ReadyToSend).toEqual(true);
    });

    it("should add new variable to sampleTimeGroup and set readyToSend to false if new variable is given in editPayload", async () => {
      initialPayload.readyToSend = true;

      let variableToAdd = {
        variableId: "newTestDp",
        variableName: "newTestDpName"
      };

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload = { sampleTimeGroups: [...initialPayload.sampleTimeGroups] };
      editPayload.sampleTimeGroups[0] = {
        ...initialPayload.sampleTimeGroups[0]
      };
      editPayload.sampleTimeGroups[0].variableIds = [
        ...initialPayload.sampleTimeGroups[0].variableIds,
        variableToAdd.variableId
      ];

      editPayload.variableNames = {
        ...initialPayload.variableNames,
        [variableToAdd.variableId]: variableToAdd.variableName
      };

      await exec();

      let expectedVariableNames = {
        ...initialPayload.variableNames,
        [variableToAdd.variableId]: variableToAdd.variableName
      };

      expect(msDataAgent.Payload.variableNames).toEqual(expectedVariableNames);

      let expectedSampleTimeGroups = [...initialPayload.sampleTimeGroups];
      expectedSampleTimeGroups[0].variableIds.push(variableToAdd.variableId);

      expect(msDataAgent.Payload.sampleTimeGroups).toEqual(
        expectedSampleTimeGroups
      );

      expect(msDataAgent.ReadyToSend).toEqual(false);
    });

    it("should add new variable to new sampleTimeGroup and set readyToSend to false if new variable is given in editPayload with new sampleTimeGroup", async () => {
      initialPayload.readyToSend = true;

      let variableToAdd = {
        variableId: "newTestDp",
        variableName: "newTestDpName",
        sampleTime: 99
      };

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload = { sampleTimeGroups: [...initialPayload.sampleTimeGroups] };
      editPayload.sampleTimeGroups.push({
        sampleTime: variableToAdd.sampleTime,
        variableIds: [variableToAdd.variableId]
      });

      editPayload.variableNames = {
        ...initialPayload.variableNames,
        [variableToAdd.variableId]: variableToAdd.variableName
      };

      await exec();

      let expectedVariableNames = {
        ...initialPayload.variableNames,
        [variableToAdd.variableId]: variableToAdd.variableName
      };

      expect(msDataAgent.Payload.variableNames).toEqual(expectedVariableNames);

      let expectedSampleTimeGroups = [
        ...initialPayload.sampleTimeGroups,
        {
          sampleTime: variableToAdd.sampleTime,
          variableIds: [variableToAdd.variableId]
        }
      ];

      expect(msDataAgent.Payload.sampleTimeGroups).toEqual(
        expectedSampleTimeGroups
      );

      expect(msDataAgent.ReadyToSend).toEqual(false);
    });

    it("should not edit variables and throw if there is a varaible in newVariables but there is no such variable in sampleTimeGroups", async () => {
      initialPayload.readyToSend = true;

      let variableToAdd = {
        variableId: "newTestDp",
        variableName: "newTestDpName"
      };

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload = { sampleTimeGroups: [...initialPayload.sampleTimeGroups] };
      editPayload.sampleTimeGroups[0] = {
        ...initialPayload.sampleTimeGroups[0]
      };
      editPayload.sampleTimeGroups[0].variableIds = [
        ...initialPayload.sampleTimeGroups[0].variableIds,
        variableToAdd.variableId
      ];

      //Not adding new variables to name
      editPayload.variableNames = {
        ...initialPayload.variableNames
      };

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

      //Ready to send has to be equal to false - first stopping communication than setting new variables what throws
      expect(msDataAgent.Payload).toEqual({
        ...initialPayload,
        readyToSend: false
      });
    });

    it("should not edit variables and throw if there is a varaible in sampleTimeGroups but there is no such variable in newVariables", async () => {
      initialPayload.readyToSend = true;

      let variableToAdd = {
        variableId: "newTestDp",
        variableName: "newTestDpName"
      };

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload = { sampleTimeGroups: [...initialPayload.sampleTimeGroups] };

      editPayload.variableNames = {
        ...initialPayload.variableNames,
        [variableToAdd.variableId]: variableToAdd.variableName
      };

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

      //Ready to send has to be equal to false - first stopping communication than setting new variables what throws
      expect(msDataAgent.Payload).toEqual({
        ...initialPayload,
        readyToSend: false
      });
    });

    it("should edit variable name if it is defined in VariableNames with different name", async () => {
      initialPayload.readyToSend = true;

      let variableToChange = {
        variableId: "dp4",
        variableName: "newTestDpName"
      };

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload = { sampleTimeGroups: [...initialPayload.sampleTimeGroups] };

      editPayload.variableNames = {
        ...initialPayload.variableNames
      };

      editPayload.variableNames[variableToChange.variableId] =
        variableToChange.variableName;

      await exec();

      let expectedVariableNames = {
        ...initialPayload.variableNames,
        [variableToChange.variableId]: variableToChange.variableName
      };

      expect(msDataAgent.Payload.variableNames).toEqual(expectedVariableNames);

      let expectedSampleTimeGroups = [...initialPayload.sampleTimeGroups];

      expect(msDataAgent.Payload.sampleTimeGroups).toEqual(
        expectedSampleTimeGroups
      );

      expect(msDataAgent.ReadyToSend).toEqual(false);
    });

    it("should reaasign variable to different sampleTime group if it is given in payload", async () => {
      initialPayload.readyToSend = true;

      let variableIdToChange = "dp4";

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload = { sampleTimeGroups: [...initialPayload.sampleTimeGroups] };
      editPayload.sampleTimeGroups[0] = {
        ...initialPayload.sampleTimeGroups[0]
      };
      editPayload.sampleTimeGroups[0].variableIds = [
        ...initialPayload.sampleTimeGroups[0].variableIds
      ];
      editPayload.sampleTimeGroups[0].variableIds.push(variableIdToChange);
      editPayload.sampleTimeGroups[1] = {
        ...initialPayload.sampleTimeGroups[1]
      };
      editPayload.sampleTimeGroups[1].variableIds = editPayload.sampleTimeGroups[1].variableIds.filter(
        element => element !== variableIdToChange
      );

      editPayload.variableNames = {
        ...initialPayload.variableNames
      };

      await exec();

      let expectedVariableNames = {
        ...initialPayload.variableNames
      };

      expect(msDataAgent.Payload.variableNames).toEqual(expectedVariableNames);

      let expectedSampleTimeGroups = [...initialPayload.sampleTimeGroups];
      expectedSampleTimeGroups[0].variableIds.push(variableIdToChange);
      expectedSampleTimeGroups[1].variableIds = expectedSampleTimeGroups[1].variableIds.filter(
        element => element !== variableIdToChange
      );

      expect(msDataAgent.Payload.sampleTimeGroups).toEqual(
        expectedSampleTimeGroups
      );

      expect(msDataAgent.ReadyToSend).toEqual(false);
    });

    it("should delete variable from sampleTimeGroup and set readyToSend to false if variable is not given in editPayload", async () => {
      initialPayload.readyToSend = true;

      let variableIdToDelete = "dp4";

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload = { sampleTimeGroups: [...initialPayload.sampleTimeGroups] };
      editPayload.sampleTimeGroups[1] = {
        ...initialPayload.sampleTimeGroups[1]
      };
      editPayload.sampleTimeGroups[1].variableIds = editPayload.sampleTimeGroups[1].variableIds.filter(
        element => element !== variableIdToDelete
      );

      editPayload.variableNames = { ...initialPayload.variableNames };
      delete editPayload.variableNames[variableIdToDelete];

      await exec();

      let expectedVariableNames = { ...initialPayload.variableNames };
      delete expectedVariableNames[variableIdToDelete];

      expect(msDataAgent.Payload.variableNames).toEqual(expectedVariableNames);

      let expectedSampleTimeGroups = [...initialPayload.sampleTimeGroups];
      expectedSampleTimeGroups[1].variableIds = expectedSampleTimeGroups[1].variableIds.filter(
        element => element !== variableIdToDelete
      );

      expect(msDataAgent.Payload.sampleTimeGroups).toEqual(
        expectedSampleTimeGroups
      );

      expect(msDataAgent.ReadyToSend).toEqual(false);
    });

    it("should delete variables from sampleTimeGroup and leave sampleTimeGroup empty", async () => {
      initialPayload.readyToSend = true;

      let variableIdToDelete1 = "dp4";
      let variableIdToDelete2 = "dp5";

      //boarding while init - not after
      initialPayload.boardingKey = boardingKey;
      initialBoard = false;

      editPayload = { sampleTimeGroups: [...initialPayload.sampleTimeGroups] };
      editPayload.sampleTimeGroups[1] = {
        ...initialPayload.sampleTimeGroups[1]
      };
      editPayload.sampleTimeGroups[1].variableIds = editPayload.sampleTimeGroups[1].variableIds.filter(
        element =>
          element !== variableIdToDelete1 && element !== variableIdToDelete2
      );

      editPayload.variableNames = { ...initialPayload.variableNames };
      delete editPayload.variableNames[variableIdToDelete1];
      delete editPayload.variableNames[variableIdToDelete2];

      await exec();

      let expectedVariableNames = { ...initialPayload.variableNames };
      delete expectedVariableNames[variableIdToDelete1];
      delete expectedVariableNames[variableIdToDelete2];

      expect(msDataAgent.Payload.variableNames).toEqual(expectedVariableNames);

      let expectedSampleTimeGroups = [...initialPayload.sampleTimeGroups];
      expectedSampleTimeGroups[1].variableIds = expectedSampleTimeGroups[1].variableIds.filter(
        element =>
          element !== variableIdToDelete1 && element !== variableIdToDelete2
      );

      expect(msDataAgent.Payload.sampleTimeGroups).toEqual(
        expectedSampleTimeGroups
      );

      expect(msDataAgent.ReadyToSend).toEqual(false);
    });

    it("should create database files for every new created sample time groups", async () => {
      await exec();

      for (let sampleTimeGroup of editPayload.sampleTimeGroups) {
        let sampleTime = sampleTimeGroup.sampleTime;

        let dataStorage = msDataAgent.ValueStorage.SampleTimeGroups[sampleTime];

        expect(dataStorage).toBeDefined();

        let filePath = dataStorage.FilePath;

        expect(filePath).toBeDefined();

        let dbFileExists = await checkIfFileExistsAsync(filePath);

        expect(dbFileExists).toEqual(true);
      }
    });

    it("should insert columns to storage database files for every added variable or varaible that changed its sampleTime groups, but not remove old columns", async () => {
      await exec();

      for (let sampleTimeGroup of editPayload.sampleTimeGroups) {
        let sampleTime = sampleTimeGroup.sampleTime;

        let dataStorage = msDataAgent.ValueStorage.SampleTimeGroups[sampleTime];

        let filePath = dataStorage.FilePath;

        for (let variableId of sampleTimeGroup.variableIds) {
          let columnName = DataStorage.getColumnName(variableId);

          let columnExists = await checkIfColumnExists(
            filePath,
            "data",
            columnName,
            "REAL"
          );

          expect(columnExists).toEqual(true);
        }
      }
    });
  });
});
