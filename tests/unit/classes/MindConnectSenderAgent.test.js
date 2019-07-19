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
let {
  clearDirectoryAsync,
  checkIfTableExists,
  checkIfColumnExists,
  checkIfFileExistsAsync,
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
    let setIsWritingToTrue;
    let tickId;

    beforeEach(async () => {
      setIsWritingToTrue = false;
      setSendDataToThrow = false;
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
      if (setSendDataToThrow)
        senderDevice.MindConnectAgent.BulkPostData = jest.fn(() => {
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
  });

  describe("editWithPayload", () => {
    let senderDevice;
    let initialPayload;
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
        }
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
        }
      };
    });

    let exec = async () => {
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
  });
});
