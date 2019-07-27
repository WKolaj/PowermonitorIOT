const MindConnectSenderAgent = require("../../../classes/device/SpecialDevices/SenderAgents/MindConnectSenderAgent");
const config = require("config");
const path = require("path");
const {
  exists,
  isObjectEmpty,
  readFileAsync,
  createFileAsync
} = require("../../../utilities/utilities");

let senderAgentDirectory = "_projTest";
let eventBufferFilePath = "_projTest/eventContentManager.json";
let {
  clearDirectoryAsync,
  checkIfTableExists,
  checkIfColumnExists,
  checkIfFileExistsAsync,
  checkIfDirectoryExistsAsync,
  writeFileAsync,
  existsAndIsNotEmpty,
  createDatabaseFile,
  createDatabaseTable,
  createDatabaseColumn,
  readAllDataFromTable,
  createDirAsync,
  readDirAsync,
  snooze
} = require("../../../utilities/utilities");

describe("MindConnectSenderAgent", () => {
  beforeEach(async () => {
    await clearDirectoryAsync(senderAgentDirectory);
  });

  afterEach(async () => {
    await clearDirectoryAsync(senderAgentDirectory);
  });

  describe("constructor", () => {
    let exec = () => {
      return new MindConnectSenderAgent();
    };

    it("should create new SenderAgent", () => {
      let result = exec();
      expect(result).toBeDefined();
    });

    it("should set isWriting enabled to false", () => {
      let result = exec();
      expect(result.IsWritingFile).toBeFalsy();
    });

    it("should set sendingEnabled enabled to false", () => {
      let result = exec();
      expect(result.SendingEnabled).toBeFalsy();
    });

    it("should set sendFileLimit to 5", () => {
      let result = exec();
      expect(result.SendFileLimit).toEqual(5);
    });

    it("should set sendingInterval enabled to 60", () => {
      let result = exec();
      expect(result.SendingInterval).toEqual(60);
    });

    it("should set dirPath to null", () => {
      let result = exec();
      expect(result.DirectoryPath).toBeNull();
    });

    it("should set boardingKey to null", () => {
      let result = exec();
      expect(result.BoardingKey).toBeNull();
    });

    it("should set variableNames to {}", () => {
      let result = exec();
      expect(result.VariableNames).toEqual({});
    });

    it("should set agent to null", () => {
      let result = exec();
      expect(result.MindConnectAgent).toBeNull();
    });

    it("should set NumberOfSendingRetries to 5", () => {
      let result = exec();
      expect(result.NumberOfSendingRetries).toEqual(5);
    });

    it("should set isWritingEvent enabled to false", () => {
      let result = exec();
      expect(result.IsWritingEvent).toBeFalsy();
    });

    it("should set EventBufferSize to 10", () => {
      let result = exec();
      expect(result.EventBufferSize).toEqual(10);
    });

    it("should set SendEventLimit to 5", () => {
      let result = exec();
      expect(result.SendEventLimit).toEqual(5);
    });

    it("should set Events to {}", () => {
      let result = exec();
      expect(result.Events).toEqual({});
    });

    it("should create EventContentManager", () => {
      let result = exec();
      expect(result.EventContentManager).toBeDefined();
    });
  });

  describe("init", () => {
    let senderDevice;
    let initialPayload;

    beforeEach(async () => {
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: false,
        sendingInterval: 100,
        sendFileLimit: 10,
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
        numberOfSendingRetries: 15,
        variableNames: {
          varId1: "msName1",
          varId2: "msName2",
          varId3: "msName3",
          varId4: "msName4"
        },
        sendFileLimit: 10,
        sendEventLimit: 10,
        eventBufferSize: 3,
        eventDescriptions: {
          "1001": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz1",
            severity: 20,
            timestamp: "testTimeStamp1",
            description: "event 1"
          },
          "1002": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz2",
            severity: 30,
            timestamp: "testTimeStamp2",
            description: "event 2"
          },
          "1003": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz3",
            severity: 40,
            timestamp: "testTimeStamp3",
            description: "event 3"
          },
          "1004": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz4",
            severity: 40,
            timestamp: "testTimeStamp4",
            description: "event 4"
          },
          "1005": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz5",
            severity: 40,
            timestamp: "testTimeStamp5",
            description: "event 5"
          },
          "1006": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz6",
            severity: 40,
            timestamp: "testTimeStamp6",
            description: "event 6"
          }
        }
      };
    });

    let exec = async () => {
      senderDevice = new MindConnectSenderAgent();
      return senderDevice.init(initialPayload);
    };

    it("should initialize agent based on given payload", async () => {
      await exec();
      expect(senderDevice.Payload).toEqual(initialPayload);
    });

    it("should not create MindConnectAgent if boardingKey is not defined", async () => {
      //SendingEnabled should also be set to false - in order not to throw error
      initialPayload.sendingEnabled = false;
      initialPayload.boardingKey = undefined;

      await exec();
      expect(senderDevice.MindConnectAgent).toBeNull();
    });

    it("should create MindConnectAgent if boardingKey is set inside payload", async () => {
      await exec();
      expect(senderDevice.MindConnectAgent).toBeDefined();
    });

    it("should invoke Boarding and GetDataConfig by MindConnectAgent - if sendingEnabled is set to true", async () => {
      initialPayload.sendingEnabled = true;
      await exec();
      expect(senderDevice.Payload).toEqual(initialPayload);

      expect(senderDevice.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(1);
      expect(
        senderDevice.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);
    });

    it("should not invoke Boarding and GetDataConfig by MindConnectAgent - if sendingEnabled is set to false", async () => {
      initialPayload.sendingEnabled = false;
      await exec();
      expect(senderDevice.Payload).toEqual(initialPayload);

      expect(senderDevice.MindConnectAgent.OnBoard).not.toHaveBeenCalled();
      expect(
        senderDevice.MindConnectAgent.GetDataSourceConfiguration
      ).not.toHaveBeenCalled();
    });

    it("should set ReadyToSend to true if sending enabled is set to true", async () => {
      initialPayload.sendingEnabled = true;
      await exec();
      expect(senderDevice.IsReadyToSend).toEqual(true);
    });

    it("should set ReadyToSend to false if sending enabled is set to false", async () => {
      initialPayload.sendingEnabled = false;
      await exec();
      expect(senderDevice.IsReadyToSend).toEqual(false);
    });

    it("should throw and do not create MindConnectAgent if sendingEnabled is set to true but there is no boardingKey provided", async () => {
      initialPayload.sendingEnabled = true;
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

      expect(senderDevice.MindConnectAgent).toEqual(null);
    });

    it("should throw if there is not dirName provided", async () => {
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

    it("should not throw and set sendingEnabled to false if it is not provided", async () => {
      initialPayload.sendingEnabled = undefined;

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

      expect(senderDevice.Payload).toEqual({
        ...initialPayload,
        sendingEnabled: false
      });
    });

    it("should not throw and set sendFileLimit to 5 if it is not provided", async () => {
      initialPayload.sendFileLimit = undefined;

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

      expect(senderDevice.Payload).toEqual({
        ...initialPayload,
        sendFileLimit: 5
      });
    });

    it("should not throw and set sendingInterval to 60 if it is not provided", async () => {
      initialPayload.sendingInterval = undefined;

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

      expect(senderDevice.Payload).toEqual({
        ...initialPayload,
        sendingInterval: 60
      });
    });

    it("should not throw and set eventBufferSize to 10 if it is not provided", async () => {
      initialPayload.eventBufferSize = undefined;

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

      expect(senderDevice.Payload).toEqual({
        ...initialPayload,
        eventBufferSize: 10
      });
    });

    it("should not throw and set eventDescriptions to {} if it is not provided", async () => {
      initialPayload.eventDescriptions = undefined;

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

      expect(senderDevice.Payload).toEqual({
        ...initialPayload,
        eventDescriptions: {}
      });
    });

    it("should create values dir and events dir if they not exists", async () => {
      await exec();

      let valueDirPath = path.join(initialPayload.dirPath, "values");
      let eventDirPath = path.join(initialPayload.dirPath, "events");

      let valueDirExists = await checkIfDirectoryExistsAsync(valueDirPath);
      expect(valueDirExists).toBeTruthy();

      let eventDirExists = await checkIfDirectoryExistsAsync(eventDirPath);
      expect(eventDirExists).toBeTruthy();
    });

    it("should not throw if values and events dir already exist", async () => {
      let valueDirPath = path.join(initialPayload.dirPath, "values");
      let eventDirPath = path.join(initialPayload.dirPath, "events");

      await createDirAsync(valueDirPath);
      await createDirAsync(eventDirPath);

      await exec();

      let valueDirExists = await checkIfDirectoryExistsAsync(valueDirPath);
      expect(valueDirExists).toBeTruthy();

      let eventDirExists = await checkIfDirectoryExistsAsync(eventDirPath);
      expect(eventDirExists).toBeTruthy();
    });

    it("should set EventManagerFilePath", async () => {
      await exec();

      expect(senderDevice.EventManagerFilePath).toEqual(eventBufferFilePath);
    });

    it("should not add any file to event dir", async () => {
      await exec();

      let allFiles = await readDirAsync(
        path.join(senderAgentDirectory, "events")
      );

      expect(allFiles).toEqual([]);
    });

    it("EventContentManager - should set Content to {} if content file does not exist", async () => {
      await exec();

      expect(senderDevice.EventContentManager.Content).toEqual({});
    });

    it("EventContentManager - should set Content according to file if it exists", async () => {
      let fileContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, value: 10003 }
      };

      await writeFileAsync(eventBufferFilePath, JSON.stringify(fileContent));

      await exec();

      expect(senderDevice.EventContentManager.Content).toEqual(fileContent);
    });

    it("EventContentManager - should set Content to {} if is empty", async () => {
      await writeFileAsync(eventBufferFilePath, "");

      await exec();

      expect(senderDevice.EventContentManager.Content).toEqual({});
    });

    it("EventContentManager - should set Content according to file if it exists - even if file content is shorter than buffer size", async () => {
      initialPayload.eventBufferSize = 5;

      let fileContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, value: 10003 }
      };

      await writeFileAsync(eventBufferFilePath, JSON.stringify(fileContent));

      await exec();

      expect(senderDevice.EventContentManager.Content).toEqual(fileContent);
    });

    it("EventContentManager - should set Content according to file if it exists - even if file content is longer than buffer size - cut appriopriate number of events", async () => {
      bufferSize = 3;

      let fileContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12347, eventId: 3, value: 10004 },
        "4": { tickId: 12347, eventId: 4, value: 10005 }
      };

      await writeFileAsync(eventBufferFilePath, JSON.stringify(fileContent));

      await exec();

      let expectedContent = {
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12347, eventId: 3, value: 10004 },
        "4": { tickId: 12347, eventId: 4, value: 10005 }
      };

      expect(senderDevice.EventContentManager.Content).toEqual(expectedContent);
    });

    it("EventContentManager - should set initialized to true after initialization", async () => {
      await exec();

      expect(senderDevice.EventContentManager.Initialized).toEqual(true);
    });

    it("EventContentManager - should set busy to false after initialization - if there is a file", async () => {
      let fileContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 }
      };

      await writeFileAsync(eventBufferFilePath, JSON.stringify(fileContent));

      await exec();

      expect(senderDevice.EventContentManager.Busy).toEqual(false);
    });

    it("EventContentManager - should set busy to false after initialization - if there is a empty file", async () => {
      await writeFileAsync(eventBufferFilePath, "");

      await exec();

      expect(senderDevice.EventContentManager.Busy).toEqual(false);
    });

    it("EventContentManager - should set busy to false after initialization - if there is no file", async () => {
      await exec();

      expect(senderDevice.EventContentManager.Busy).toEqual(false);
    });

    it("EventContentManager - should set busy to false and initialized to false if reading file throws", async () => {
      await writeFileAsync(
        eventBufferFilePath,
        JSON.stringify("corrupted Payload")
      );

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

      expect(senderDevice.EventContentManager.Initialized).toEqual(false);
      expect(senderDevice.EventContentManager.Busy).toEqual(false);
    });

    it("EventContentManager - should set eventLastTickId to 0 - if there is no file", async () => {
      await exec();

      expect(senderDevice.EventContentManager.LastEventId).toEqual(0);
    });

    it("EventContentManager - should set eventLastTickId to max number - file exists", async () => {
      let fileContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 }
      };

      await writeFileAsync(eventBufferFilePath, JSON.stringify(fileContent));

      await exec();

      expect(senderDevice.EventContentManager.LastEventId).toEqual(2);
    });
  });

  describe("addToBuffer", () => {
    let senderDevice;
    let initialPayload;
    let bufferContent;
    let enableSendingDataMockFn;

    beforeEach(async () => {
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: false,
        sendingInterval: 100,
        sendFileLimit: 10,
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
        numberOfSendingRetries: 15,
        variableNames: {
          varId1: "msName1",
          varId2: "msName2",
          varId3: "msName3",
          varId4: "msName4"
        }
      };

      bufferContent = {
        tickId: 12345,
        values: [
          { id: 1000, value: 0 },
          { id: 1001, value: 1 },
          { id: 1002, value: 2 },
          { id: 1003, value: 3 }
        ]
      };
      enableSendingDataMockFn = jest.fn();
    });

    let exec = async () => {
      senderDevice = new MindConnectSenderAgent();
      senderDevice.onSendingDataEnabled = enableSendingDataMockFn;
      await senderDevice.init(initialPayload);
      senderDevice.addToBuffer(bufferContent);
    };

    it("should add given content to buffer", async () => {
      await exec();

      expect(senderDevice.Buffer).toEqual([bufferContent]);
    });

    it("should throw and to add content to buffer if tickId is not defined", async () => {
      bufferContent.tickId = undefined;
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

      expect(senderDevice.Buffer).toEqual([]);
    });

    it("should throw and to add content to buffer if values is not defined", async () => {
      bufferContent.values = undefined;
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

      expect(senderDevice.Buffer).toEqual([]);
    });

    it("should throw and to add content to buffer if values are empty", async () => {
      bufferContent.values = [];
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

      expect(senderDevice.Buffer).toEqual([]);
    });

    it("should throw and to add content to buffer if there is not id in one of value", async () => {
      bufferContent.values[1].id = undefined;
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

      expect(senderDevice.Buffer).toEqual([]);
    });

    it("should throw and to add content to buffer if there is no value in one of value", async () => {
      bufferContent.values[1].value = undefined;
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

      expect(senderDevice.Buffer).toEqual([]);
    });
  });

  describe("_clearBuffer", () => {
    let senderDevice;
    let initialPayload;
    let bufferContent;
    let enableSendingDataMockFn;

    beforeEach(async () => {
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: false,
        sendingInterval: 100,
        sendFileLimit: 10,
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
        numberOfSendingRetries: 15,
        variableNames: {
          varId1: "msName1",
          varId2: "msName2",
          varId3: "msName3",
          varId4: "msName4"
        }
      };

      bufferContent = {
        tickId: 12345,
        values: [
          { id: 1000, value: 0 },
          { id: 1001, value: 1 },
          { id: 1002, value: 2 },
          { id: 1003, value: 3 }
        ]
      };
      enableSendingDataMockFn = jest.fn();
    });

    let exec = async () => {
      senderDevice = new MindConnectSenderAgent();
      senderDevice.onSendingDataEnabled = enableSendingDataMockFn;
      await senderDevice.init(initialPayload);
      senderDevice.addToBuffer(bufferContent);
      senderDevice._clearBuffer();
    };

    it("should set buffer to empty array", async () => {
      await exec();

      expect(senderDevice.Buffer).toEqual([]);
    });
  });

  describe("_getDataFromVariables", () => {
    let senderDevice;
    let initialPayload;
    let data;

    beforeEach(async () => {
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: false,
        sendingInterval: 100,
        sendFileLimit: 10,
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
        numberOfSendingRetries: 15,
        variableNames: {
          varId1: "msName1",
          varId2: "msName2",
          varId3: "msName3",
          varId4: "msName4"
        }
      };

      data = [
        {
          tickId: 1563524843,
          values: [
            { id: "varId1", value: 1 },
            { id: "varId2", value: 2 },
            { id: "varId3", value: 3 },
            { id: "varId4", value: 4 }
          ]
        },
        {
          tickId: 1563524844,
          values: [
            { id: "varId1", value: 11 },
            { id: "varId2", value: 12 },
            { id: "varId3", value: 13 },
            { id: "varId4", value: 14 }
          ]
        },
        {
          tickId: 1563524845,
          values: [
            { id: "varId1", value: 21 },
            { id: "varId2", value: 22 },
            { id: "varId3", value: 23 },
            { id: "varId4", value: 24 }
          ]
        }
      ];
    });

    let exec = async () => {
      senderDevice = new MindConnectSenderAgent();
      await senderDevice.init(initialPayload);
      return senderDevice._getDataFromVariables(data);
    };

    it("should convert data - prepare it to send it to Mindsphere", async () => {
      let result = await exec();

      let expectedPayload = [
        {
          timestamp: "2019-07-19T08:27:23.000Z",
          values: [
            {
              dataPointId: "msName1",
              qualityCode: "0",
              value: "1"
            },
            {
              dataPointId: "msName2",
              qualityCode: "0",
              value: "2"
            },
            {
              dataPointId: "msName3",
              qualityCode: "0",
              value: "3"
            },
            {
              dataPointId: "msName4",
              qualityCode: "0",
              value: "4"
            }
          ]
        },
        {
          timestamp: "2019-07-19T08:27:24.000Z",
          values: [
            {
              dataPointId: "msName1",
              qualityCode: "0",
              value: "11"
            },
            {
              dataPointId: "msName2",
              qualityCode: "0",
              value: "12"
            },
            {
              dataPointId: "msName3",
              qualityCode: "0",
              value: "13"
            },
            {
              dataPointId: "msName4",
              qualityCode: "0",
              value: "14"
            }
          ]
        },
        {
          timestamp: "2019-07-19T08:27:25.000Z",
          values: [
            {
              dataPointId: "msName1",
              qualityCode: "0",
              value: "21"
            },
            {
              dataPointId: "msName2",
              qualityCode: "0",
              value: "22"
            },
            {
              dataPointId: "msName3",
              qualityCode: "0",
              value: "23"
            },
            {
              dataPointId: "msName4",
              qualityCode: "0",
              value: "24"
            }
          ]
        }
      ];

      expect(result).toEqual(expectedPayload);
    });

    it("should avoid values that are not presented in variableNames", async () => {
      initialPayload.variableNames = {
        varId2: "msName2",
        varId3: "msName3"
      };

      let result = await exec();

      let expectedPayload = [
        {
          timestamp: "2019-07-19T08:27:23.000Z",
          values: [
            {
              dataPointId: "msName2",
              qualityCode: "0",
              value: "2"
            },
            {
              dataPointId: "msName3",
              qualityCode: "0",
              value: "3"
            }
          ]
        },
        {
          timestamp: "2019-07-19T08:27:24.000Z",
          values: [
            {
              dataPointId: "msName2",
              qualityCode: "0",
              value: "12"
            },
            {
              dataPointId: "msName3",
              qualityCode: "0",
              value: "13"
            }
          ]
        },
        {
          timestamp: "2019-07-19T08:27:25.000Z",
          values: [
            {
              dataPointId: "msName2",
              qualityCode: "0",
              value: "22"
            },
            {
              dataPointId: "msName3",
              qualityCode: "0",
              value: "23"
            }
          ]
        }
      ];

      expect(result).toEqual(expectedPayload);
    });

    it("should avoid values that are empty", async () => {
      data = [
        {
          tickId: 1563524843,
          values: []
        },
        {
          tickId: 1563524844,
          values: [
            { id: "varId1", value: 11 },
            { id: "varId2", value: 12 },
            { id: "varId3", value: 13 },
            { id: "varId4", value: 14 }
          ]
        },
        {
          tickId: 1563524845,
          values: []
        }
      ];

      let result = await exec();

      let expectedPayload = [
        {
          timestamp: "2019-07-19T08:27:24.000Z",
          values: [
            {
              dataPointId: "msName1",
              qualityCode: "0",
              value: "11"
            },
            {
              dataPointId: "msName2",
              qualityCode: "0",
              value: "12"
            },
            {
              dataPointId: "msName3",
              qualityCode: "0",
              value: "13"
            },
            {
              dataPointId: "msName4",
              qualityCode: "0",
              value: "14"
            }
          ]
        }
      ];

      expect(result).toEqual(expectedPayload);
    });

    it("should avoid values that are empty - due to dpNames", async () => {
      initialPayload.variableNames = {
        varId2: "msName2",
        varId3: "msName3"
      };

      data = [
        {
          tickId: 1563524843,
          values: [{ id: "varId1", value: 1 }, { id: "varId4", value: 4 }]
        },
        {
          tickId: 1563524844,
          values: [
            { id: "varId1", value: 11 },
            { id: "varId2", value: 12 },
            { id: "varId3", value: 13 },
            { id: "varId4", value: 14 }
          ]
        },
        {
          tickId: 1563524845,
          values: [{ id: "varId1", value: 21 }, { id: "varId4", value: 24 }]
        }
      ];

      let result = await exec();

      let expectedPayload = [
        {
          timestamp: "2019-07-19T08:27:24.000Z",
          values: [
            {
              dataPointId: "msName2",
              qualityCode: "0",
              value: "12"
            },
            {
              dataPointId: "msName3",
              qualityCode: "0",
              value: "13"
            }
          ]
        }
      ];

      expect(result).toEqual(expectedPayload);
    });

    it("should return empty array if there are no data", async () => {
      data = [
        {
          tickId: 1563524843,
          values: []
        },
        {
          tickId: 1563524844,
          values: []
        },
        {
          tickId: 1563524845,
          values: []
        }
      ];

      let result = await exec();

      let expectedPayload = [];

      expect(result).toEqual(expectedPayload);
    });

    it("should return empty array if there are no data - due to name", async () => {
      initialPayload.variableNames = {
        varId2: "msName2",
        varId3: "msName3"
      };

      data = [
        {
          tickId: 1563524843,
          values: [{ id: "varId1", value: 1 }, { id: "varId4", value: 4 }]
        },
        {
          tickId: 1563524844,
          values: [{ id: "varId1", value: 1 }, { id: "varId4", value: 4 }]
        },
        {
          tickId: 1563524845,
          values: [{ id: "varId1", value: 1 }, { id: "varId4", value: 4 }]
        }
      ];

      let result = await exec();

      let expectedPayload = [];

      expect(result).toEqual(expectedPayload);
    });

    it("should return empty array if there are no names", async () => {
      initialPayload.variableNames = {};

      let result = await exec();

      let expectedPayload = [];

      expect(result).toEqual(expectedPayload);
    });
  });

  describe("refresh", () => {
    let senderDevice;
    let initialPayload;
    let bufferContent1;
    let bufferContent2;
    let bufferContent3;
    let setSendDataToThrow;
    let setSendEventToThrow;
    let setIsWritingToTrue;
    let setIsWritingEventToTrue;
    let tickId;

    beforeEach(async () => {
      setIsWritingEventToTrue = false;
      setIsWritingToTrue = false;
      setSendDataToThrow = false;
      setSendEventToThrow = false;
      tickId = 1563524800;
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: true,
        sendingInterval: 100,
        sendFileLimit: 10,
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
        numberOfSendingRetries: 15,
        variableNames: {
          varId1: "msName1",
          varId2: "msName2",
          varId3: "msName3",
          varId4: "msName4"
        }
      };

      bufferContent1 = {
        tickId: 1563524700,
        values: [
          { id: "varId1", value: 0 },
          { id: "varId2", value: 1 },
          { id: "varId3", value: 2 },
          { id: "varId4", value: 3 }
        ]
      };

      bufferContent2 = {
        tickId: 1563524701,
        values: [
          { id: "varId1", value: 10 },
          { id: "varId2", value: 11 },
          { id: "varId3", value: 12 },
          { id: "varId4", value: 13 }
        ]
      };

      bufferContent3 = {
        tickId: 15635248702,
        values: [
          { id: "varId1", value: 20 },
          { id: "varId2", value: 21 },
          { id: "varId3", value: 22 },
          { id: "varId4", value: 23 }
        ]
      };
    });

    let exec = async () => {
      senderDevice = new MindConnectSenderAgent();
      await senderDevice.init(initialPayload);

      senderDevice.addToBuffer(bufferContent1);
      senderDevice.addToBuffer(bufferContent2);
      senderDevice.addToBuffer(bufferContent3);
      if (setIsWritingToTrue) senderDevice._isWritingFile = true;
      if (setIsWritingEventToTrue) senderDevice._isWritingEvent = true;
      if (setSendDataToThrow)
        senderDevice.MindConnectAgent.BulkPostData = jest.fn(() => {
          throw new Error("test Error");
        });
      if (setSendEventToThrow)
        senderDevice.MindConnectAgent.PostEvent = jest.fn(() => {
          throw new Error("test Error");
        });
      await senderDevice.refresh(tickId);
    };

    it("should not create any buffer file but call sendData with values and clear buffer - if send data does not throw", async () => {
      await exec();
      expect(senderDevice.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        1
      );

      let expectedPayload = await senderDevice._getDataFromVariables([
        bufferContent1,
        bufferContent2,
        bufferContent3
      ]);

      expect(
        senderDevice.MindConnectAgent.BulkPostData.mock.calls[0][0]
      ).toEqual(expectedPayload);

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);

      expect(senderDevice.Buffer).toEqual([]);
    });

    it("should create buffer file and set isWriting to false after all actions - if sendData throws", async () => {
      setSendDataToThrow = true;

      await exec();

      //Should be called (retried) according to given number of retries
      expect(senderDevice.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        initialPayload.numberOfSendingRetries
      );

      let expectedPayload = await senderDevice._getDataFromVariables([
        bufferContent1,
        bufferContent2,
        bufferContent3
      ]);

      for (let i = 0; i < initialPayload.numberOfSendingRetries; i++) {
        //Each time the same payload
        expect(
          senderDevice.MindConnectAgent.BulkPostData.mock.calls[i][0]
        ).toEqual(expectedPayload);
      }

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath.length).toEqual(1);

      let content = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[0]
        )
      );

      let jsonContent = JSON.parse(content);

      expect(jsonContent).toEqual(expectedPayload);

      expect(senderDevice.IsWritingFile).toEqual(false);

      //Buffer should also be cleared
      expect(senderDevice.Buffer).toEqual([]);
    });

    it("should send all data from buffered files and delte them after sending current data - if sendData does not throw", async () => {
      //Creating mock buffered files
      let mockFile1Content = {
        id: "fake file1"
      };
      let mockFile2Content = {
        id: "fake file2"
      };
      let mockFile3Content = {
        id: "fake file3"
      };

      await createDirAsync(path.join(initialPayload.dirPath, "values"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile1.json"),
        JSON.stringify(mockFile1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile2.json"),
        JSON.stringify(mockFile2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile3.json"),
        JSON.stringify(mockFile3Content)
      );

      await exec();

      //First time - current data, rest - for every file
      expect(senderDevice.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        4
      );

      let expectedPayload = await senderDevice._getDataFromVariables([
        bufferContent1,
        bufferContent2,
        bufferContent3
      ]);

      //Current data
      expect(
        senderDevice.MindConnectAgent.BulkPostData.mock.calls[0][0]
      ).toEqual(expectedPayload);

      //Data from files
      expect(
        senderDevice.MindConnectAgent.BulkPostData.mock.calls[1][0]
      ).toEqual(mockFile1Content);
      expect(
        senderDevice.MindConnectAgent.BulkPostData.mock.calls[2][0]
      ).toEqual(mockFile2Content);
      expect(
        senderDevice.MindConnectAgent.BulkPostData.mock.calls[3][0]
      ).toEqual(mockFile3Content);

      //All files should have been deleted
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);

      //Buffer should also be cleared
      expect(senderDevice.Buffer).toEqual([]);
    });

    it("should not send all data from buffered files and not delte them after sending current data - if sendData throws", async () => {
      setSendDataToThrow = true;

      //Creating mock buffered files
      let mockFile1Content = {
        id: "fake file1"
      };
      let mockFile2Content = {
        id: "fake file2"
      };
      let mockFile3Content = {
        id: "fake file3"
      };

      await createDirAsync(path.join(initialPayload.dirPath, "values"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile1.json"),
        JSON.stringify(mockFile1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile2.json"),
        JSON.stringify(mockFile2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile3.json"),
        JSON.stringify(mockFile3Content)
      );

      await exec();

      //Trying to resend data
      expect(senderDevice.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        initialPayload.numberOfSendingRetries
      );

      let expectedPayload = await senderDevice._getDataFromVariables([
        bufferContent1,
        bufferContent2,
        bufferContent3
      ]);

      //Current data
      expect(
        senderDevice.MindConnectAgent.BulkPostData.mock.calls[0][0]
      ).toEqual(expectedPayload);

      //There should be 4 files - for current data and for buffered data
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath.length).toEqual(4);

      //Reading first file
      let content1 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[0]
        )
      );

      let jsonContent1 = JSON.parse(content1);

      expect(jsonContent1).toEqual(expectedPayload);

      //Reading second file
      let content2 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[1]
        )
      );

      let jsonContent2 = JSON.parse(content2);

      expect(jsonContent2).toEqual(mockFile1Content);

      //Reading third file
      let content3 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[2]
        )
      );

      let jsonContent3 = JSON.parse(content3);

      expect(jsonContent3).toEqual(mockFile2Content);

      //Reading forth file
      let content4 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[3]
        )
      );

      let jsonContent4 = JSON.parse(content4);

      expect(jsonContent4).toEqual(mockFile3Content);

      //Buffer should also be cleared
      expect(senderDevice.Buffer).toEqual([]);
    });

    it("should not send all data from buffered files and not delte them after sending current data - if writingFile is set to true", async () => {
      setIsWritingToTrue = true;

      //Creating mock buffered files
      let mockFile1Content = {
        id: "fake file1"
      };
      let mockFile2Content = {
        id: "fake file2"
      };
      let mockFile3Content = {
        id: "fake file3"
      };

      await createDirAsync(path.join(initialPayload.dirPath, "values"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile1.json"),
        JSON.stringify(mockFile1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile2.json"),
        JSON.stringify(mockFile2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile3.json"),
        JSON.stringify(mockFile3Content)
      );

      await exec();

      //Only one time - sending current data
      expect(senderDevice.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        1
      );

      let expectedPayload = await senderDevice._getDataFromVariables([
        bufferContent1,
        bufferContent2,
        bufferContent3
      ]);

      expect(
        senderDevice.MindConnectAgent.BulkPostData.mock.calls[0][0]
      ).toEqual(expectedPayload);

      //There should be 3 files - only buffered data
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath.length).toEqual(3);

      //Reading first file
      let content1 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[0]
        )
      );

      let jsonContent1 = JSON.parse(content1);

      expect(jsonContent1).toEqual(mockFile1Content);

      //Reading second file
      let content2 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[1]
        )
      );

      let jsonContent2 = JSON.parse(content2);

      expect(jsonContent2).toEqual(mockFile2Content);

      //Reading third file
      let content3 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[2]
        )
      );

      let jsonContent3 = JSON.parse(content3);

      expect(jsonContent3).toEqual(mockFile3Content);
    });

    it("should do nothing - if sendingEnabled is set to false", async () => {
      initialPayload.sendingEnabled = false;

      //Creating mock buffered files
      let mockFile1Content = {
        id: "fake file1"
      };
      let mockFile2Content = {
        id: "fake file2"
      };
      let mockFile3Content = {
        id: "fake file3"
      };

      await createDirAsync(path.join(initialPayload.dirPath, "values"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile1.json"),
        JSON.stringify(mockFile1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile2.json"),
        JSON.stringify(mockFile2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile3.json"),
        JSON.stringify(mockFile3Content)
      );

      //Creating mock buffered files
      //Creating mock buffered files
      let mockEvent1Content = {
        "12345": { name: "fake event 1" }
      };
      let mockEvent2Content = {
        "12346": { name: "fake event 2" }
      };
      let mockEvent3Content = {
        "12347": { name: "fake event 3" }
      };

      await createDirAsync(path.join(initialPayload.dirPath, "events"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile1.json"),
        JSON.stringify(mockEvent1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile2.json"),
        JSON.stringify(mockEvent2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile3.json"),
        JSON.stringify(mockEvent3Content)
      );

      await exec();

      //Should not be called
      expect(senderDevice.MindConnectAgent.BulkPostData).not.toHaveBeenCalled();

      //There should be 3 files - only buffered data
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath.length).toEqual(3);

      //Reading first file
      let content1 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[0]
        )
      );

      let jsonContent1 = JSON.parse(content1);

      expect(jsonContent1).toEqual(mockFile1Content);

      //Reading second file
      let content2 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[1]
        )
      );

      let jsonContent2 = JSON.parse(content2);

      expect(jsonContent2).toEqual(mockFile2Content);

      //Reading third file
      let content3 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[2]
        )
      );

      let jsonContent3 = JSON.parse(content3);

      expect(jsonContent3).toEqual(mockFile3Content);

      expect(senderDevice.MindConnectAgent.PostEvent).not.toHaveBeenCalled();

      //All files should have been deleted
      let allFilesFromEventsDir = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromEventsDir).toEqual([
        "testFile1.json",
        "testFile2.json",
        "testFile3.json"
      ]);
    });

    it("should do nothing - if tickId does not match SendingInterval", async () => {
      initialPayload.sendingInterval = 111;

      //Creating mock buffered files
      let mockFile1Content = {
        id: "fake file1"
      };
      let mockFile2Content = {
        id: "fake file2"
      };
      let mockFile3Content = {
        id: "fake file3"
      };

      await createDirAsync(path.join(initialPayload.dirPath, "values"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile1.json"),
        JSON.stringify(mockFile1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile2.json"),
        JSON.stringify(mockFile2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile3.json"),
        JSON.stringify(mockFile3Content)
      );

      await exec();

      //Should not be called
      expect(senderDevice.MindConnectAgent.BulkPostData).not.toHaveBeenCalled();

      //There should be 3 files - only buffered data
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath.length).toEqual(3);

      //Reading first file
      let content1 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[0]
        )
      );

      let jsonContent1 = JSON.parse(content1);

      expect(jsonContent1).toEqual(mockFile1Content);

      //Reading second file
      let content2 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[1]
        )
      );

      let jsonContent2 = JSON.parse(content2);

      expect(jsonContent2).toEqual(mockFile2Content);

      //Reading third file
      let content3 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[2]
        )
      );

      let jsonContent3 = JSON.parse(content3);

      expect(jsonContent3).toEqual(mockFile3Content);
    });

    it("should send only number of files less than limit number", async () => {
      initialPayload.sendFileLimit = 2;
      //Creating mock buffered files
      let mockFile1Content = {
        id: "fake file1"
      };
      let mockFile2Content = {
        id: "fake file2"
      };
      let mockFile3Content = {
        id: "fake file3"
      };
      await createDirAsync(path.join(initialPayload.dirPath, "values"));
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile1.json"),
        JSON.stringify(mockFile1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile2.json"),
        JSON.stringify(mockFile2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile3.json"),
        JSON.stringify(mockFile3Content)
      );

      await exec();

      //First time - current data, rest - for 2 files
      expect(senderDevice.MindConnectAgent.BulkPostData).toHaveBeenCalledTimes(
        3
      );

      let expectedPayload = await senderDevice._getDataFromVariables([
        bufferContent1,
        bufferContent2,
        bufferContent3
      ]);

      //Current data
      expect(
        senderDevice.MindConnectAgent.BulkPostData.mock.calls[0][0]
      ).toEqual(expectedPayload);

      //Data from files
      expect(
        senderDevice.MindConnectAgent.BulkPostData.mock.calls[1][0]
      ).toEqual(mockFile1Content);
      expect(
        senderDevice.MindConnectAgent.BulkPostData.mock.calls[2][0]
      ).toEqual(mockFile2Content);

      //All files be one file left
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath.length).toEqual(1);

      //Reading third file
      let content = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[0]
        )
      );

      let jsonContent = JSON.parse(content);

      expect(jsonContent).toEqual(mockFile3Content);
    });

    it("should do nothing - if there is no boarding key given", async () => {
      initialPayload.boardingKey = undefined;
      initialPayload.sendingEnabled = false;

      //Creating mock buffered files
      let mockFile1Content = {
        id: "fake file1"
      };
      let mockFile2Content = {
        id: "fake file2"
      };
      let mockFile3Content = {
        id: "fake file3"
      };

      await createDirAsync(path.join(initialPayload.dirPath, "values"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile1.json"),
        JSON.stringify(mockFile1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile2.json"),
        JSON.stringify(mockFile2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile3.json"),
        JSON.stringify(mockFile3Content)
      );

      await exec();

      //MindConnectAgent should not be defined
      expect(senderDevice.MindConnectAgent).toBeNull();

      //There should be 3 files - only buffered data
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath.length).toEqual(3);

      //Reading first file
      let content1 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[0]
        )
      );

      let jsonContent1 = JSON.parse(content1);

      expect(jsonContent1).toEqual(mockFile1Content);

      //Reading second file
      let content2 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[1]
        )
      );

      let jsonContent2 = JSON.parse(content2);

      expect(jsonContent2).toEqual(mockFile2Content);

      //Reading third file
      let content3 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[2]
        )
      );

      let jsonContent3 = JSON.parse(content3);

      expect(jsonContent3).toEqual(mockFile3Content);
    });

    it("should do nothing - if sendingEnabled is false", async () => {
      initialPayload.sendingEnabled = false;

      //Creating mock buffered files
      let mockFile1Content = {
        id: "fake file1"
      };
      let mockFile2Content = {
        id: "fake file2"
      };
      let mockFile3Content = {
        id: "fake file3"
      };

      await createDirAsync(path.join(initialPayload.dirPath, "values"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile1.json"),
        JSON.stringify(mockFile1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile2.json"),
        JSON.stringify(mockFile2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "values", "testFile3.json"),
        JSON.stringify(mockFile3Content)
      );

      await exec();

      //Should not be called
      expect(senderDevice.MindConnectAgent.BulkPostData).not.toHaveBeenCalled();

      //There should be 3 files - only buffered data
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath.length).toEqual(3);

      //Reading first file
      let content1 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[0]
        )
      );

      let jsonContent1 = JSON.parse(content1);

      expect(jsonContent1).toEqual(mockFile1Content);

      //Reading second file
      let content2 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[1]
        )
      );

      let jsonContent2 = JSON.parse(content2);

      expect(jsonContent2).toEqual(mockFile2Content);

      //Reading third file
      let content3 = await readFileAsync(
        path.join(
          senderDevice.ValuesDirectoryPath,
          allFilesFromDeviceDirPath[2]
        )
      );

      let jsonContent3 = JSON.parse(content3);

      expect(jsonContent3).toEqual(mockFile3Content);
    });

    it("should send all events from buffered files and delte them after sending  - if sendEvent does not throw", async () => {
      //Creating mock buffered files
      let mockEvent1Content = {
        "12345": {
          source: "app1",
          description: "fake event 1",
          severity: 20 // 0-99 : 20:error, 30:warning, 40: information
        }
      };
      let mockEvent2Content = {
        "12346": {
          source: "app2",
          description: "fake event 2",
          severity: 30 // 0-99 : 20:error, 30:warning, 40: information
        }
      };
      let mockEvent3Content = {
        "12347": {
          source: "app3",
          description: "fake event 3",
          severity: 40 // 0-99 : 20:error, 30:warning, 40: information
        }
      };

      let expectedEvent1 = {
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "app1",
        severity: 20,
        timestamp: new Date(12345000).toISOString(),
        description: "fake event 1"
      };

      let expectedEvent2 = {
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "app2",
        severity: 30,
        timestamp: new Date(12346000).toISOString(),
        description: "fake event 2"
      };

      let expectedEvent3 = {
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "app3",
        severity: 40,
        timestamp: new Date(12347000).toISOString(),
        description: "fake event 3"
      };

      await createDirAsync(path.join(initialPayload.dirPath, "events"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile1.json"),
        JSON.stringify(mockEvent1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile2.json"),
        JSON.stringify(mockEvent2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile3.json"),
        JSON.stringify(mockEvent3Content)
      );

      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).toHaveBeenCalledTimes(3);

      //Data from files
      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[0][0]).toEqual(
        expectedEvent1
      );

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[1][0]).toEqual(
        expectedEvent2
      );

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[2][0]).toEqual(
        expectedEvent3
      );

      //All files should have been deleted
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should send all events from buffered files and delte them after sending  - if sendData throws", async () => {
      sendDataMock = jest.fn(dataToSend => {
        throw new Error("Test error");
      });

      //Creating mock buffered files
      //Creating mock buffered files
      let mockEvent1Content = {
        "12345": {
          source: "app1",
          description: "fake event 1",
          severity: 20 // 0-99 : 20:error, 30:warning, 40: information
        }
      };
      let mockEvent2Content = {
        "12346": {
          source: "app2",
          description: "fake event 2",
          severity: 30 // 0-99 : 20:error, 30:warning, 40: information
        }
      };
      let mockEvent3Content = {
        "12347": {
          source: "app3",
          description: "fake event 3",
          severity: 40 // 0-99 : 20:error, 30:warning, 40: information
        }
      };

      let expectedEvent1 = {
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "app1",
        severity: 20,
        timestamp: new Date(12345000).toISOString(),
        description: "fake event 1"
      };

      let expectedEvent2 = {
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "app2",
        severity: 30,
        timestamp: new Date(12346000).toISOString(),
        description: "fake event 2"
      };

      let expectedEvent3 = {
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "app3",
        severity: 40,
        timestamp: new Date(12347000).toISOString(),
        description: "fake event 3"
      };

      await createDirAsync(path.join(initialPayload.dirPath, "events"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile1.json"),
        JSON.stringify(mockEvent1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile2.json"),
        JSON.stringify(mockEvent2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile3.json"),
        JSON.stringify(mockEvent3Content)
      );

      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).toHaveBeenCalledTimes(3);

      //Data from files
      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[0][0]).toEqual(
        expectedEvent1
      );

      //Data from files
      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[1][0]).toEqual(
        expectedEvent2
      );

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[2][0]).toEqual(
        expectedEvent3
      );

      //All files should have been deleted
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not send all events from buffered files and not delte them after sending  - if sendEvent throws", async () => {
      setSendEventToThrow = true;
      //Creating mock buffered files
      let mockEvent1Content = {
        "12345": {
          source: "app1",
          description: "fake event 1",
          severity: 20 // 0-99 : 20:error, 30:warning, 40: information
        }
      };
      let mockEvent2Content = {
        "12346": {
          source: "app2",
          description: "fake event 2",
          severity: 30 // 0-99 : 20:error, 30:warning, 40: information
        }
      };
      let mockEvent3Content = {
        "12347": {
          source: "app3",
          description: "fake event 3",
          severity: 40 // 0-99 : 20:error, 30:warning, 40: information
        }
      };

      await createDirAsync(path.join(initialPayload.dirPath, "events"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile1.json"),
        JSON.stringify(mockEvent1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile2.json"),
        JSON.stringify(mockEvent2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile3.json"),
        JSON.stringify(mockEvent3Content)
      );

      await exec();

      //Called first time - and retry numberOfSendingRetries time
      expect(senderDevice.MindConnectAgent.PostEvent).toHaveBeenCalledTimes(
        initialPayload.numberOfSendingRetries
      );

      //All files should have been deleted
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([
        "testFile1.json",
        "testFile2.json",
        "testFile3.json"
      ]);
    });

    it("should not send all events from buffered files and not delte them after sending  - if writingEvent is set to true", async () => {
      setIsWritingEventToTrue = true;
      //Creating mock buffered files
      let mockEvent1Content = {
        "12345": {
          source: "app1",
          description: "fake event 1",
          severity: 20 // 0-99 : 20:error, 30:warning, 40: information
        }
      };
      let mockEvent2Content = {
        "12346": {
          source: "app2",
          description: "fake event 2",
          severity: 30 // 0-99 : 20:error, 30:warning, 40: information
        }
      };
      let mockEvent3Content = {
        "12347": {
          source: "app3",
          description: "fake event 3",
          severity: 40 // 0-99 : 20:error, 30:warning, 40: information
        }
      };

      await createDirAsync(path.join(initialPayload.dirPath, "events"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile1.json"),
        JSON.stringify(mockEvent1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile2.json"),
        JSON.stringify(mockEvent2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile3.json"),
        JSON.stringify(mockEvent3Content)
      );

      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).not.toHaveBeenCalled();

      //All files should have been deleted
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([
        "testFile1.json",
        "testFile2.json",
        "testFile3.json"
      ]);
    });

    it("should send only number of events less than limit number", async () => {
      initialPayload.sendEventLimit = 2;

      //Creating mock buffered files
      let mockEvent1Content = {
        "12345": {
          source: "app1",
          description: "fake event 1",
          severity: 20 // 0-99 : 20:error, 30:warning, 40: information
        }
      };
      let mockEvent2Content = {
        "12346": {
          source: "app2",
          description: "fake event 2",
          severity: 30 // 0-99 : 20:error, 30:warning, 40: information
        }
      };
      let mockEvent3Content = {
        "12347": {
          source: "app3",
          description: "fake event 3",
          severity: 40 // 0-99 : 20:error, 30:warning, 40: information
        }
      };

      let expectedEvent1 = {
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "app1",
        severity: 20,
        timestamp: new Date(12345000).toISOString(),
        description: "fake event 1"
      };

      let expectedEvent2 = {
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "app2",
        severity: 30,
        timestamp: new Date(12346000).toISOString(),
        description: "fake event 2"
      };

      let expectedEvent3 = {
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "app3",
        severity: 40,
        timestamp: new Date(12347000).toISOString(),
        description: "fake event 3"
      };

      await createDirAsync(path.join(initialPayload.dirPath, "events"));

      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile1.json"),
        JSON.stringify(mockEvent1Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile2.json"),
        JSON.stringify(mockEvent2Content)
      );
      await createFileAsync(
        path.join(initialPayload.dirPath, "events", "testFile3.json"),
        JSON.stringify(mockEvent3Content)
      );

      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).toHaveBeenCalledTimes(2);

      //Data from files
      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[0][0]).toEqual(
        expectedEvent1
      );

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[1][0]).toEqual(
        expectedEvent2
      );

      //All files should have been deleted
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual(["testFile3.json"]);
    });
  });

  describe("editWithPayload", () => {
    let senderDevice;
    let initialPayload;
    let initialEventContent;
    let editPayload;
    let oldMSAgent;

    beforeEach(async () => {
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: false,
        sendingInterval: 100,
        sendFileLimit: 10,
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
        numberOfSendingRetries: 15,
        variableNames: {
          varId1: "msName1",
          varId2: "msName2",
          varId3: "msName3",
          varId4: "msName4"
        },
        sendEventLimit: 11,
        eventBufferSize: 3,
        eventDescriptions: {
          "1": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz1",
            severity: 20,
            timestamp: "testTimeStamp1",
            description: "event 1"
          },
          "2": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz2",
            severity: 30,
            timestamp: "testTimeStamp2",
            description: "event 2"
          },
          "3": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz3",
            severity: 40,
            timestamp: "testTimeStamp3",
            description: "event 3"
          }
        }
      };

      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 }
      };

      editPayload = {
        sendingEnabled: true,
        sendingInterval: 110,
        sendFileLimit: 11,
        boardingKey: {
          content: {
            baseUrl: "https://southgate.eu1.mindsphere.io",
            iat: "testIatvalue2",
            clientCredentialProfile: ["SHARED_SECRET"],
            clientId: "testClientId2",
            tenant: "testTenant2"
          },
          expiration: "2019-07-18T05:07:57.000Z"
        },
        numberOfSendingRetries: 3,
        variableNames: {
          varId3: "msName3",
          varId3: "msName4",
          varId3: "msName5",
          varId4: "msName6"
        },
        sendEventLimit: 12,
        eventBufferSize: 5,
        eventDescriptions: {
          "2": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz2",
            severity: 30,
            timestamp: "testTimeStamp2",
            description: "event 2"
          },
          "3": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz3",
            severity: 40,
            timestamp: "testTimeStamp3",
            description: "event 3"
          },
          "4": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz4",
            severity: 20,
            timestamp: "testTimeStamp4",
            description: "event 4"
          }
        }
      };
    });

    let exec = async () => {
      await writeFileAsync(
        eventBufferFilePath,
        JSON.stringify(initialEventContent)
      );
      senderDevice = new MindConnectSenderAgent();
      await senderDevice.init(initialPayload);

      oldMSAgent = senderDevice.MindConnectAgent;
      return senderDevice.editWithPayload(editPayload);
    };

    it("should edit agent according to payload", async () => {
      await exec();

      expect(senderDevice.Payload).toEqual({
        ...initialPayload,
        ...editPayload
      });
    });

    it("should return edited agent", async () => {
      let result = await exec();

      expect(result).toEqual(senderDevice);
    });

    it("should invoke boarding and getting configuation if boardingKey is given and sendingEnabled is set to true - and set readyToSend to true", async () => {
      editPayload = {
        boardingKey: editPayload.boardingKey,
        sendingEnabled: editPayload.sendingEnabled
      };

      let result = await exec();

      expect(result.MindConnectAgent).toBeDefined();
      expect(result.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(1);
      expect(
        result.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);

      expect(result.IsReadyToSend).toBeTruthy();
    });

    it("should invoke boarding and getting configuation if sendingEnabled is set to true - and set readyToSend to true", async () => {
      editPayload = {
        sendingEnabled: editPayload.sendingEnabled
      };

      let result = await exec();

      expect(result.MindConnectAgent).toBeDefined();
      expect(result.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(1);
      expect(
        result.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);

      expect(result.IsReadyToSend).toBeTruthy();
    });

    it("should throw and not edit anything if sendingEnabled is true but there is no boarding key", async () => {
      initialPayload.boardingKey = undefined;

      editPayload = {
        sendingEnabled: true
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

      expect(senderDevice.Payload).toEqual(initialPayload);
    });

    it("should not invoke boarding and getting configuation if boardingKey is given and sendingEnabled is already set to true, but set sendingEnabled to false - and set readyToSend to false", async () => {
      initialPayload.sendingEnabled = true;

      editPayload = {
        boardingKey: editPayload.boardingKey
      };

      let result = await exec();
      //MindConnectAgent should be reacreated
      expect(result.MindConnectAgent).toBeDefined();
      expect(result.MindConnectAgent).not.toEqual(oldMSAgent);

      //Only one time - after creating new agent while editing
      expect(result.MindConnectAgent.OnBoard).not.toHaveBeenCalled();
      //Only one time - after creating new agent while editing
      expect(
        result.MindConnectAgent.GetDataSourceConfiguration
      ).not.toHaveBeenCalled();
      expect(result.SendingEnabled).toBeFalsy();

      expect(result.IsReadyToSend).toBeFalsy();
    });

    it("should invoke boarding again and getting configuation if boardingKey is given and sendingEnabled is given in payload as true", async () => {
      initialPayload.sendingEnabled = true;

      editPayload = {
        boardingKey: editPayload.boardingKey,
        sendingEnabled: true
      };

      let result = await exec();

      //MindConnectAgent should be reacreated
      expect(result.MindConnectAgent).toBeDefined();
      expect(result.MindConnectAgent).not.toEqual(oldMSAgent);

      //Only one time - after creating new agent while editing
      expect(result.MindConnectAgent.OnBoard).toHaveBeenCalled();
      //Only one time - after creating new agent while editing
      expect(
        result.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalled();
      expect(result.SendingEnabled).toBeTruthy();

      expect(result.IsReadyToSend).toBeTruthy();
    });

    it("should not invoke boarding but only set new boarding key if it is defined in payload", async () => {
      initialPayload.sendingEnabled = false;

      editPayload = {
        boardingKey: editPayload.boardingKey
      };

      let result = await exec();
      //MindConnectAgent should be reacreated
      expect(result.MindConnectAgent).toBeDefined();
      expect(result.MindConnectAgent).not.toEqual(oldMSAgent);

      //Only one time - after creating new agent while editing
      expect(result.MindConnectAgent.OnBoard).not.toHaveBeenCalled();
      //Only one time - after creating new agent while editing
      expect(
        result.MindConnectAgent.GetDataSourceConfiguration
      ).not.toHaveBeenCalled();

      expect(result.SendingEnabled).toBeFalsy();
      expect(result.IsReadyToSend).toBeFalsy();
      expect(result.BoardingKey).toEqual(editPayload.boardingKey);
    });

    it("should throw and not edit anything if boarding key is invalid", async () => {
      editPayload = {
        boardingKey: "fakeBoardingKey"
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

      expect(senderDevice.Payload).toEqual(initialPayload);
    });

    it("EventContentManager - should set new buffer size if buffer size is larger ", async () => {
      await exec();

      expect(senderDevice.EventContentManager.BufferSize).toEqual(
        editPayload.eventBufferSize
      );
    });

    it("EventContentManager - should set new buffer size if buffer size is smaller ", async () => {
      initialPayload.eventBufferSize = 5;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      };

      editPayload.eventBufferSize = 3;

      await exec();

      expect(senderDevice.EventContentManager.BufferSize).toEqual(3);
    });

    it("EventContentManager - should not change buffer content ", async () => {
      await exec();

      expect(senderDevice.EventContentManager.Content).toEqual(
        initialEventContent
      );
    });

    it("EventContentManager - should cut buffer content if new size is smaller than previous one", async () => {
      initialPayload.eventBufferSize = 5;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      };

      editPayload.eventBufferSize = 3;

      await exec();

      expect(senderDevice.EventContentManager.Content).toEqual({
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      });
    });

    it("EventContentManager - should cut buffer content and save it to file if new size is smaller than previous one", async () => {
      initialPayload.eventBufferSize = 5;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      };

      editPayload.eventBufferSize = 3;

      await exec();

      let fileContent = JSON.parse(await readFileAsync(eventBufferFilePath));

      expect(fileContent).toEqual({
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      });
    });

    it("EventContentManager - should set busy to false after cutting", async () => {
      initialPayload.eventBufferSize = 5;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      };

      editPayload.eventBufferSize = 3;

      await exec();

      expect(senderDevice.EventContentManager.Busy).toEqual(false);
    });
  });

  describe("refreshEvents", () => {
    let senderDevice;
    let initialPayload;
    let initialEventManagerContent;
    let newEventContent;
    let setSendEventMockToThrow;
    let setIsWritingEventToTrue;
    let now;

    beforeEach(async () => {
      setSendEventMockToThrow = false;
      now = Math.round(Date.now() / 1000);
      setIsWritingEventToTrue = false;
      tickId = 100;
      onSendingDisabledMockFn = jest.fn();
      onSendingEnabledMockFn = jest.fn();
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: true,
        sendingInterval: 100,
        sendFileLimit: 10,
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
        numberOfSendingRetries: 15,
        variableNames: {
          varId1: "msName1",
          varId2: "msName2",
          varId3: "msName3",
          varId4: "msName4"
        },
        sendEventLimit: 10,
        eventBufferSize: 3,
        eventDescriptions: {
          "1001": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz1",
            severity: 20,
            timestamp: "testTimeStamp1",
            description: "event 1"
          },
          "1002": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz2",
            severity: 30,
            timestamp: "testTimeStamp2",
            description: "event 2"
          },
          "1003": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz3",
            severity: 40,
            timestamp: "testTimeStamp3",
            description: "event 3"
          },
          "1004": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz4",
            severity: 40,
            timestamp: "testTimeStamp4",
            description: "event 4"
          },
          "1005": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz5",
            severity: 40,
            timestamp: "testTimeStamp5",
            description: "event 5"
          },
          "1006": {
            entityId: "clientId",
            sourceType: "Event",
            sourceId: "application",
            source: "Meowz6",
            severity: 40,
            timestamp: "testTimeStamp6",
            description: "event 6"
          }
        }
      };

      initialEventManagerContent = {
        [now + 3]: { tickId: now + 3, value: 1003 },
        [now + 2]: { tickId: now + 2, value: 1002 },
        [now + 1]: { tickId: now + 1, value: 1001 }
      };

      newEventContent = [
        { tickId: now + 5, value: 1005 },
        { tickId: now + 4, value: 1004 },
        { tickId: now + 3, value: 1003 }
      ];

      sendEventMock = jest.fn();
    });

    let exec = async () => {
      if (existsAndIsNotEmpty(initialEventManagerContent))
        await writeFileAsync(
          eventBufferFilePath,
          JSON.stringify(initialEventManagerContent)
        );

      senderDevice = new MindConnectSenderAgent();

      await senderDevice.init(initialPayload);

      if (setSendEventMockToThrow)
        senderDevice.MindConnectAgent.PostEvent = jest.fn(() => {
          throw new Error("test error");
        });

      if (setIsWritingEventToTrue) senderDevice._isWritingEvent = true;
      return senderDevice.refreshEvents(newEventContent);
    };

    it("should call sendEvent for every new event - if 2 new events are inside newContent", async () => {
      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).toHaveBeenCalledTimes(2);

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[0][0]).toEqual({
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "Meowz4",
        severity: 40,
        timestamp: new Date(1000 * (now + 4)).toISOString(),
        description: "event 4"
      });

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[1][0]).toEqual({
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "Meowz5",
        severity: 40,
        timestamp: new Date(1000 * (now + 5)).toISOString(),
        description: "event 5"
      });
    });

    it("should not create any files if sending event does not throw - if 2 new events are inside newContent", async () => {
      await exec();

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should create files containt events if sending event throw - if 2 new events are inside newContent", async () => {
      setSendEventMockToThrow = true;

      await exec();

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath.length).toEqual(2);

      let fileContent1 = JSON.parse(
        await readFileAsync(
          path.join(
            senderDevice.EventsDirectoryPath,
            allFilesFromDeviceDirPath[0]
          )
        )
      );
      expect(Object.keys(fileContent1).length).toEqual(1);
      let key1 = Object.keys(fileContent1)[0];
      let value1 = fileContent1[key1];
      expect(key1).toEqual((now + 4).toString());
      expect(value1).toEqual(initialPayload.eventDescriptions["1004"]);

      let fileContent2 = JSON.parse(
        await readFileAsync(
          path.join(
            senderDevice.EventsDirectoryPath,
            allFilesFromDeviceDirPath[1]
          )
        )
      );
      expect(Object.keys(fileContent2).length).toEqual(1);
      let key2 = Object.keys(fileContent2)[0];
      let value2 = fileContent2[key2];
      expect(key2).toEqual((now + 5).toString());
      expect(value2).toEqual(initialPayload.eventDescriptions["1005"]);

      //Set writing should be set to false after everything
      expect(senderDevice.IsWritingEvent).toEqual(false);
    });

    it("should not call sendEvent for every new event - if all new events are the same as before", async () => {
      newEventContent = [
        { tickId: now + 3, value: 1003 },
        { tickId: now + 2, value: 1002 },
        { tickId: now + 1, value: 1001 }
      ];

      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).not.toHaveBeenCalled();
    });

    it("should not create any files - if all new events are the same as before", async () => {
      newEventContent = [
        { tickId: now + 3, value: 1003 },
        { tickId: now + 2, value: 1002 },
        { tickId: now + 1, value: 1001 }
      ];

      await exec();

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not call sendEvent if there is no description for given event value", async () => {
      delete initialPayload.eventDescriptions["1004"];
      delete initialPayload.eventDescriptions["1005"];
      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).not.toHaveBeenCalled();
    });

    it("should not call sendEvent if event payload is corrupted - but send rest if it exists for them", async () => {
      newEventContent[1] = "fakeEvent";

      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).toHaveBeenCalledTimes(1);

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[0][0]).toEqual({
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "Meowz5",
        severity: 40,
        timestamp: new Date(1000 * (now + 5)).toISOString(),
        description: "event 5"
      });

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not call sendEvent if event value is equal to 0", async () => {
      initialPayload.eventDescriptions["0"] = "fake event description";

      newEventContent[1] = { tickId: now + 4, value: 0 };

      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).toHaveBeenCalledTimes(1);

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[0][0]).toEqual({
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "Meowz5",
        severity: 40,
        timestamp: new Date(1000 * (now + 5)).toISOString(),
        description: "event 5"
      });

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not call sendEvent if event value is less than 0", async () => {
      initialPayload.eventDescriptions["0"] = "fake event description";

      newEventContent[1] = { tickId: now + 4, value: -1 };

      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).toHaveBeenCalledTimes(1);

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[0][0]).toEqual({
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "Meowz5",
        severity: 40,
        timestamp: new Date(1000 * (now + 5)).toISOString(),
        description: "event 5"
      });

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not call sendEvent if there is no description for given event value - but send rest if it exists for them", async () => {
      delete initialPayload.eventDescriptions["1004"];
      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).toHaveBeenCalledTimes(1);

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[0][0]).toEqual({
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "Meowz5",
        severity: 40,
        timestamp: new Date(1000 * (now + 5)).toISOString(),
        description: "event 5"
      });

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should call sendEvent for every new event - if new event count is greater than content - but still the same as buffer size", async () => {
      initialPayload.eventBufferSize = 4;

      newEventContent = [
        { tickId: now + 6, value: 1006 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 4, value: 1004 },
        { tickId: now + 3, value: 1003 }
      ];

      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).toHaveBeenCalledTimes(3);

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[0][0]).toEqual({
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "Meowz4",
        severity: 40,
        timestamp: new Date(1000 * (now + 4)).toISOString(),
        description: "event 4"
      });

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[1][0]).toEqual({
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "Meowz5",
        severity: 40,
        timestamp: new Date(1000 * (now + 5)).toISOString(),
        description: "event 5"
      });

      expect(senderDevice.MindConnectAgent.PostEvent.mock.calls[2][0]).toEqual({
        entityId: initialPayload.boardingKey.content.clientId,
        sourceType: "Event",
        sourceId: "application",
        source: "Meowz6",
        severity: 40,
        timestamp: new Date(1000 * (now + 6)).toISOString(),
        description: "event 6"
      });

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not create any files if sending event does not throw - if 2 new events are inside newContent", async () => {
      initialPayload.eventBufferSize = 4;

      newEventContent = [
        { tickId: now + 6, value: 1006 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 4, value: 1004 },
        { tickId: now + 3, value: 1003 }
      ];

      await exec();

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should create files containt events if sending event throw - if 2 new events are inside newContent", async () => {
      setSendEventMockToThrow = true;

      initialPayload.eventBufferSize = 4;

      newEventContent = [
        { tickId: now + 6, value: 1006 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 4, value: 1004 },
        { tickId: now + 3, value: 1003 }
      ];

      await exec();

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath.length).toEqual(3);

      let fileContent1 = JSON.parse(
        await readFileAsync(
          path.join(
            senderDevice.EventsDirectoryPath,
            allFilesFromDeviceDirPath[0]
          )
        )
      );
      expect(Object.keys(fileContent1).length).toEqual(1);
      let key1 = Object.keys(fileContent1)[0];
      let value1 = fileContent1[key1];
      expect(key1).toEqual((now + 4).toString());
      expect(value1).toEqual(initialPayload.eventDescriptions["1004"]);

      let fileContent2 = JSON.parse(
        await readFileAsync(
          path.join(
            senderDevice.EventsDirectoryPath,
            allFilesFromDeviceDirPath[1]
          )
        )
      );
      expect(Object.keys(fileContent2).length).toEqual(1);
      let key2 = Object.keys(fileContent2)[0];
      let value2 = fileContent2[key2];
      expect(key2).toEqual((now + 5).toString());
      expect(value2).toEqual(initialPayload.eventDescriptions["1005"]);

      let fileContent3 = JSON.parse(
        await readFileAsync(
          path.join(
            senderDevice.EventsDirectoryPath,
            allFilesFromDeviceDirPath[2]
          )
        )
      );
      expect(Object.keys(fileContent3).length).toEqual(1);
      let key3 = Object.keys(fileContent3)[0];
      let value3 = fileContent3[key3];
      expect(key3).toEqual((now + 6).toString());
      expect(value3).toEqual(initialPayload.eventDescriptions["1006"]);

      //Set writing should be set to false after everything
      expect(senderDevice.IsWritingEvent).toEqual(false);
    });

    it("should not call sendEvent if new event content is shorter than buffer size", async () => {
      newEventContent = [
        { tickId: now + 4, value: 1004 },
        { tickId: now + 3, value: 1003 }
      ];

      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).not.toHaveBeenCalled();

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not call sendEvent and create new file if sending enabled is set to false", async () => {
      initialPayload.sendingEnabled = false;

      await exec();

      expect(senderDevice.MindConnectAgent.PostEvent).not.toHaveBeenCalled();

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });
  });
});
