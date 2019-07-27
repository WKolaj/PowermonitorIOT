const SenderAgent = require("../../../classes/device/SpecialDevices/SenderAgents/SenderAgent");
const config = require("config");
const path = require("path");
const {
  exists,
  existsAndIsNotEmpty,
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
  createDatabaseFile,
  createDatabaseTable,
  createDatabaseColumn,
  readAllDataFromTable,
  writeFileAsync,
  readDirAsync,
  createDirAsync,
  checkIfDirectoryExistsAsync,
  snooze
} = require("../../../utilities/utilities");

describe("SenderAgent", () => {
  beforeEach(async () => {
    await clearDirectoryAsync(senderAgentDirectory);
  });

  afterEach(async () => {
    await clearDirectoryAsync(senderAgentDirectory);
  });

  describe("constructor", () => {
    let exec = () => {
      return new SenderAgent();
    };

    it("should create new SenderAgent", () => {
      let result = exec();
      expect(result).toBeDefined();
    });

    it("should set isWriting enabled to false", () => {
      let result = exec();
      expect(result.IsWritingFile).toBeFalsy();
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
  });

  describe("init", () => {
    let senderDevice;
    let initialPayload;
    let enableSendingDataMockFn;

    beforeEach(async () => {
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: true,
        sendingInterval: 100,
        sendFileLimit: 10,
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
      enableSendingDataMockFn = jest.fn();
    });

    let exec = async () => {
      senderDevice = new SenderAgent();
      senderDevice.onSendingDataEnabled = enableSendingDataMockFn;
      return senderDevice.init(initialPayload);
    };

    it("should initialize agent based on given payload", async () => {
      await exec();

      expect(senderDevice.Payload).toEqual(initialPayload);
    });

    it("should invoke sendingDataEnabled if it is defined as true in payload", async () => {
      await exec();

      expect(enableSendingDataMockFn).toHaveBeenCalledTimes(1);
    });

    it("should not invoke sendingDataEnabled if it is defined as false in payload", async () => {
      initialPayload.sendingEnabled = false;
      await exec();

      expect(enableSendingDataMockFn).not.toHaveBeenCalled();
    });

    it("should not invoke sendingDataEnabled if it is not defined in payload", async () => {
      initialPayload.sendingEnabled = undefined;
      await exec();

      expect(enableSendingDataMockFn).not.toHaveBeenCalled();
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
        sendingEnabled: true,
        sendingInterval: 100,
        sendFileLimit: 10
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
      senderDevice = new SenderAgent();
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
        sendingEnabled: true,
        sendingInterval: 100,
        sendFileLimit: 10
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
      senderDevice = new SenderAgent();
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

  describe("refresh", () => {
    let senderDevice;
    let initialPayload;
    let bufferContent1;
    let bufferContent2;
    let bufferContent3;
    let getDataFromVariablesMock;
    let sendDataMock;
    let sendEventMock;
    let setIsWritingToTrue;
    let setIsWritingEventToTrue;
    let tickId;
    let enableSendingDataMockFn;

    beforeEach(async () => {
      setIsWritingToTrue = false;
      setIsWritingEventToTrue = false;
      tickId = 100;
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: true,
        sendingInterval: 100,
        sendFileLimit: 10
      };

      bufferContent1 = {
        tickId: 12345,
        values: [
          { id: 1000, value: 0 },
          { id: 1001, value: 1 },
          { id: 1002, value: 2 },
          { id: 1003, value: 3 }
        ]
      };

      bufferContent2 = {
        tickId: 12346,
        values: [
          { id: 1000, value: 10 },
          { id: 1001, value: 11 },
          { id: 1002, value: 12 },
          { id: 1003, value: 13 }
        ]
      };

      bufferContent3 = {
        tickId: 12347,
        values: [
          { id: 1000, value: 20 },
          { id: 1001, value: 21 },
          { id: 1002, value: 22 },
          { id: 1003, value: 23 }
        ]
      };

      getDataFromVariablesMock = jest.fn(payload =>
        payload.map(valuePayload => {
          return { ...valuePayload, isGeneratedFromMock: true };
        })
      );
      sendDataMock = jest.fn();
      sendEventMock = jest.fn();
      enableSendingDataMockFn = jest.fn();
    });

    let exec = async () => {
      senderDevice = new SenderAgent();
      senderDevice.onSendingDataEnabled = enableSendingDataMockFn;

      senderDevice._sendData = sendDataMock;
      senderDevice._sendEvent = sendEventMock;

      senderDevice._getDataFromVariables = getDataFromVariablesMock;

      await senderDevice.init(initialPayload);
      senderDevice.addToBuffer(bufferContent1);
      senderDevice.addToBuffer(bufferContent2);
      senderDevice.addToBuffer(bufferContent3);
      if (setIsWritingToTrue) senderDevice._isWritingFile = true;
      if (setIsWritingEventToTrue) senderDevice._isWritingEvent = true;
      await senderDevice.refresh(tickId);
    };

    it("should not create any buffer file but call sendData with values - if send data does not throw", async () => {
      await exec();

      expect(senderDevice._sendData).toHaveBeenCalledTimes(1);

      let expectedPayload = [
        bufferContent1,
        bufferContent2,
        bufferContent3
      ].map(valuePayload => {
        return { ...valuePayload, isGeneratedFromMock: true };
      });

      expect(senderDevice._sendData.mock.calls[0][0]).toEqual(expectedPayload);

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should create buffer file and set isWriting to false after all actions - if sendData throws", async () => {
      sendDataMock = jest.fn(dataToSend => {
        throw new Error("Test error");
      });

      await exec();

      expect(senderDevice._sendData).toHaveBeenCalledTimes(1);

      let expectedPayload = [
        bufferContent1,
        bufferContent2,
        bufferContent3
      ].map(valuePayload => {
        return { ...valuePayload, isGeneratedFromMock: true };
      });

      expect(senderDevice._sendData.mock.calls[0][0]).toEqual(expectedPayload);

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
      expect(senderDevice._sendData).toHaveBeenCalledTimes(4);

      let expectedPayload = [
        bufferContent1,
        bufferContent2,
        bufferContent3
      ].map(valuePayload => {
        return { ...valuePayload, isGeneratedFromMock: true };
      });

      //Current data
      expect(senderDevice._sendData.mock.calls[0][0]).toEqual(expectedPayload);

      //Data from files
      expect(senderDevice._sendData.mock.calls[1][0]).toEqual(mockFile1Content);
      expect(senderDevice._sendData.mock.calls[2][0]).toEqual(mockFile2Content);
      expect(senderDevice._sendData.mock.calls[3][0]).toEqual(mockFile3Content);

      //All files should have been deleted
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.ValuesDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not send all data from buffered files and not delte them after sending current data - if sendData throws", async () => {
      sendDataMock = jest.fn(dataToSend => {
        throw new Error("Test error");
      });

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
      expect(senderDevice._sendData).toHaveBeenCalledTimes(1);

      let expectedPayload = [
        bufferContent1,
        bufferContent2,
        bufferContent3
      ].map(valuePayload => {
        return { ...valuePayload, isGeneratedFromMock: true };
      });

      //Current data
      expect(senderDevice._sendData.mock.calls[0][0]).toEqual(expectedPayload);

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
      expect(senderDevice._sendData).toHaveBeenCalledTimes(1);

      let expectedPayload = [
        bufferContent1,
        bufferContent2,
        bufferContent3
      ].map(valuePayload => {
        return { ...valuePayload, isGeneratedFromMock: true };
      });

      //Current data
      expect(senderDevice._sendData.mock.calls[0][0]).toEqual(expectedPayload);

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
      expect(senderDevice._sendData).not.toHaveBeenCalled();

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

      expect(senderDevice._sendEvent).not.toHaveBeenCalled();

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
      tickId = 111;

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
      expect(senderDevice._sendData).not.toHaveBeenCalled();

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
      expect(senderDevice._sendData).toHaveBeenCalledTimes(3);

      let expectedPayload = [
        bufferContent1,
        bufferContent2,
        bufferContent3
      ].map(valuePayload => {
        return { ...valuePayload, isGeneratedFromMock: true };
      });

      //Current data
      expect(senderDevice._sendData.mock.calls[0][0]).toEqual(expectedPayload);

      //Data from files
      expect(senderDevice._sendData.mock.calls[1][0]).toEqual(mockFile1Content);
      expect(senderDevice._sendData.mock.calls[2][0]).toEqual(mockFile2Content);

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

    it("should send all events from buffered files and delte them after sending  - if sendEvent does not throw", async () => {
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

      expect(senderDevice._sendEvent).toHaveBeenCalledTimes(3);

      //Data from files
      expect(senderDevice._sendEvent.mock.calls[0][0]).toEqual("12345");

      expect(senderDevice._sendEvent.mock.calls[0][1]).toEqual(
        mockEvent1Content["12345"]
      );

      expect(senderDevice._sendEvent.mock.calls[1][0]).toEqual("12346");

      expect(senderDevice._sendEvent.mock.calls[1][1]).toEqual(
        mockEvent2Content["12346"]
      );

      expect(senderDevice._sendEvent.mock.calls[2][0]).toEqual("12347");

      expect(senderDevice._sendEvent.mock.calls[2][1]).toEqual(
        mockEvent3Content["12347"]
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

      expect(senderDevice._sendEvent).toHaveBeenCalledTimes(3);

      //Data from files
      expect(senderDevice._sendEvent.mock.calls[0][0]).toEqual("12345");

      expect(senderDevice._sendEvent.mock.calls[0][1]).toEqual(
        mockEvent1Content["12345"]
      );

      expect(senderDevice._sendEvent.mock.calls[1][0]).toEqual("12346");

      expect(senderDevice._sendEvent.mock.calls[1][1]).toEqual(
        mockEvent2Content["12346"]
      );

      expect(senderDevice._sendEvent.mock.calls[2][0]).toEqual("12347");

      expect(senderDevice._sendEvent.mock.calls[2][1]).toEqual(
        mockEvent3Content["12347"]
      );

      //All files should have been deleted
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not send all events from buffered files and not delte them after sending  - if sendEvent throws", async () => {
      sendEventMock = jest.fn(dataToSend => {
        throw new Error("Test error");
      });

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

      //Only first time - than it throws
      expect(senderDevice._sendEvent).toHaveBeenCalledTimes(1);

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

      expect(senderDevice._sendEvent).not.toHaveBeenCalled();

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

      expect(senderDevice._sendEvent).toHaveBeenCalledTimes(2);

      //Data from files
      expect(senderDevice._sendEvent.mock.calls[0][0]).toEqual("12345");

      expect(senderDevice._sendEvent.mock.calls[0][1]).toEqual(
        mockEvent1Content["12345"]
      );

      expect(senderDevice._sendEvent.mock.calls[1][0]).toEqual("12346");

      expect(senderDevice._sendEvent.mock.calls[1][1]).toEqual(
        mockEvent2Content["12346"]
      );

      //All files should have been deleted
      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual(["testFile3.json"]);
    });
  });

  describe("enableSendingData", () => {
    let senderDevice;
    let initialPayload;
    let onSendingEnabledMockFn;

    beforeEach(async () => {
      setIsWritingToTrue = false;
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: false,
        sendingInterval: 100,
        sendFileLimit: 10
      };
      onSendingEnabledMockFn = jest.fn();
    });

    let exec = async () => {
      senderDevice = new SenderAgent();
      senderDevice.onSendingDataEnabled = onSendingEnabledMockFn;
      await senderDevice.init(initialPayload);

      await senderDevice.enableSendingData();
    };

    it("should set sendingEnabled to true", async () => {
      await exec();

      expect(senderDevice.SendingEnabled).toEqual(true);
    });

    it("should invoke onSendingEnabled", async () => {
      await exec();

      expect(senderDevice.onSendingDataEnabled).toHaveBeenCalledTimes(1);
    });
  });

  describe("disableSendingData", () => {
    let senderDevice;
    let initialPayload;
    let onSendingDisabledMockFn;
    let enableSendingDataMockFn;

    beforeEach(async () => {
      setIsWritingToTrue = false;
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: false,
        sendingInterval: 100,
        sendFileLimit: 10
      };
      onSendingDisabledMockFn = jest.fn();
    });

    let exec = async () => {
      senderDevice = new SenderAgent();
      senderDevice.onSendingDataEnabled = enableSendingDataMockFn;
      senderDevice.onSendingDataDisabled = onSendingDisabledMockFn;
      await senderDevice.init(initialPayload);

      await senderDevice.disableSendingData();
      enableSendingDataMockFn = jest.fn();
    };

    it("should set disableSendingData to false", async () => {
      await exec();

      expect(senderDevice.SendingEnabled).toEqual(false);
    });

    it("should invoke onSendingDataDisabled", async () => {
      await exec();

      expect(senderDevice.onSendingDataDisabled).toHaveBeenCalledTimes(1);
    });
  });

  describe("editWithPayload", () => {
    let senderDevice;
    let initialPayload;
    let initialEventContent;
    let editPayload;
    let onSendingDisabledMockFn;
    let onSendingEnabledMockFn;

    beforeEach(async () => {
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: false,
        sendingInterval: 100,
        sendFileLimit: 10,
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
        sendingInterval: 120,
        sendFileLimit: 20,
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
      onSendingDisabledMockFn = jest.fn();
      onSendingEnabledMockFn = jest.fn();
    });

    let exec = async () => {
      await writeFileAsync(
        eventBufferFilePath,
        JSON.stringify(initialEventContent)
      );
      senderDevice = new SenderAgent();
      senderDevice.onSendingDataEnabled = onSendingEnabledMockFn;
      senderDevice.onSendingDataDisabled = onSendingDisabledMockFn;
      await senderDevice.init(initialPayload);
      await senderDevice.editWithPayload(editPayload);
    };

    it("should edit agent based on given payload", async () => {
      await exec();

      expect(senderDevice.Payload).toEqual({
        ...editPayload,
        dirPath: initialPayload.dirPath
      });
    });

    it("should invoke onSendingEnabled when sendingEnabled changes from false to true", async () => {
      initialPayload.sendingEnabled = false;
      editPayload = { sendingEnabled: true };

      await exec();

      expect(senderDevice.Payload).toEqual({
        ...initialPayload,
        ...editPayload
      });
      expect(onSendingEnabledMockFn).toHaveBeenCalledTimes(1);
      expect(onSendingDisabledMockFn).not.toHaveBeenCalled();
    });

    it("should invoke onSendingEnabled when sendingEnabled changes from false to true", async () => {
      initialPayload.sendingEnabled = true;
      editPayload = { sendingEnabled: false };

      await exec();

      expect(senderDevice.Payload).toEqual({
        ...initialPayload,
        ...editPayload
      });
      expect(onSendingDisabledMockFn).toHaveBeenCalledTimes(1);
      //Called once - during init
      expect(onSendingEnabledMockFn).toHaveBeenCalled();
    });

    it("should edit agent based on given payload if only sendingInterval is given", async () => {
      editPayload = { sendingInterval: editPayload.sendingInterval };
      await exec();

      expect(senderDevice.Payload).toEqual({
        ...initialPayload,
        ...editPayload
      });
    });

    it("should edit agent based on given payload if only sendFileLimit is given", async () => {
      editPayload = { sendFileLimit: editPayload.sendFileLimit };
      await exec();

      expect(senderDevice.Payload).toEqual({
        ...initialPayload,
        ...editPayload
      });
    });

    it("should not edit dirPath if it is given", async () => {
      editPayload = { dirPath: "fakeDirPath" };
      await exec();

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
    let sendEventMock;
    let setIsWritingEventToTrue;
    let onSendingDisabledMockFn;
    let onSendingEnabledMockFn;
    let now;

    beforeEach(async () => {
      now = Date.now();
      setIsWritingEventToTrue = false;
      tickId = 100;
      onSendingDisabledMockFn = jest.fn();
      onSendingEnabledMockFn = jest.fn();
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: true,
        sendingInterval: 100,
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

      senderDevice = new SenderAgent();

      senderDevice._sendEvent = sendEventMock;

      senderDevice.onSendingDataEnabled = onSendingEnabledMockFn;
      senderDevice.onSendingDataDisabled = onSendingDisabledMockFn;

      await senderDevice.init(initialPayload);

      if (setIsWritingEventToTrue) senderDevice._isWritingEvent = true;
      return senderDevice.refreshEvents(newEventContent);
    };

    it("should call sendEvent for every new event - if 2 new events are inside newContent", async () => {
      await exec();

      expect(sendEventMock).toHaveBeenCalledTimes(2);

      expect(sendEventMock.mock.calls[0][0]).toEqual(now + 4);

      expect(sendEventMock.mock.calls[0][1]).toEqual(
        initialPayload.eventDescriptions["1004"]
      );

      expect(sendEventMock.mock.calls[1][0]).toEqual(now + 5);

      expect(sendEventMock.mock.calls[1][1]).toEqual(
        initialPayload.eventDescriptions["1005"]
      );
    });

    it("should not create any files if sending event does not throw - if 2 new events are inside newContent", async () => {
      await exec();

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should create files containt events if sending event throw - if 2 new events are inside newContent", async () => {
      sendEventMock = jest.fn(() => {
        throw new Error("test error");
      });

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

    it("should call sendEvent for every new event - if all new events are inside newContent", async () => {
      newEventContent = [
        { tickId: now + 6, value: 1006 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 4, value: 1004 }
      ];

      await exec();

      expect(sendEventMock).toHaveBeenCalledTimes(3);

      expect(sendEventMock.mock.calls[0][0]).toEqual(now + 4);

      expect(sendEventMock.mock.calls[0][1]).toEqual(
        initialPayload.eventDescriptions["1004"]
      );

      expect(sendEventMock.mock.calls[1][0]).toEqual(now + 5);

      expect(sendEventMock.mock.calls[1][1]).toEqual(
        initialPayload.eventDescriptions["1005"]
      );

      expect(sendEventMock.mock.calls[2][0]).toEqual(now + 6);

      expect(sendEventMock.mock.calls[2][1]).toEqual(
        initialPayload.eventDescriptions["1006"]
      );
    });

    it("should not create any files if sending event does not throw - if all new events are inside newContent", async () => {
      newEventContent = [
        { tickId: now + 6, value: 1006 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 4, value: 1004 }
      ];

      await exec();

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should create files containt events if sending event throw - if all new events are inside newContent", async () => {
      sendEventMock = jest.fn(() => {
        throw new Error("test error");
      });

      newEventContent = [
        { tickId: now + 6, value: 1006 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 4, value: 1004 }
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

    it("should not call sendEvent for every new event - if all new events are the same as before", async () => {
      newEventContent = [
        { tickId: now + 3, value: 1003 },
        { tickId: now + 2, value: 1002 },
        { tickId: now + 1, value: 1001 }
      ];

      await exec();

      expect(sendEventMock).not.toHaveBeenCalled();
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

      expect(sendEventMock).not.toHaveBeenCalled();
    });

    it("should not call sendEvent if event payload is corrupted - but send rest if it exists for them", async () => {
      newEventContent[1] = "fakeEvent";

      await exec();

      expect(sendEventMock).toHaveBeenCalledTimes(1);

      expect(sendEventMock.mock.calls[0][0]).toEqual(now + 5);

      expect(sendEventMock.mock.calls[0][1]).toEqual(
        initialPayload.eventDescriptions["1005"]
      );

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not call sendEvent if event value is equal to 0", async () => {
      initialPayload.eventDescriptions["0"] = "fake event description";

      newEventContent[1] = { tickId: now + 4, value: 0 };

      await exec();

      expect(sendEventMock).toHaveBeenCalledTimes(1);

      expect(sendEventMock.mock.calls[0][0]).toEqual(now + 5);

      expect(sendEventMock.mock.calls[0][1]).toEqual(
        initialPayload.eventDescriptions["1005"]
      );

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not call sendEvent if event value is less than 0", async () => {
      initialPayload.eventDescriptions["0"] = "fake event description";

      newEventContent[1] = { tickId: now + 4, value: -1 };

      await exec();

      expect(sendEventMock).toHaveBeenCalledTimes(1);

      expect(sendEventMock.mock.calls[0][0]).toEqual(now + 5);

      expect(sendEventMock.mock.calls[0][1]).toEqual(
        initialPayload.eventDescriptions["1005"]
      );

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });

    it("should not call sendEvent if there is no description for given event value - but send rest if it exists for them", async () => {
      delete initialPayload.eventDescriptions["1004"];
      await exec();

      expect(sendEventMock).toHaveBeenCalledTimes(1);

      expect(sendEventMock.mock.calls[0][0]).toEqual(now + 5);

      expect(sendEventMock.mock.calls[0][1]).toEqual(
        initialPayload.eventDescriptions["1005"]
      );
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

      expect(sendEventMock).toHaveBeenCalledTimes(3);

      expect(sendEventMock.mock.calls[0][0]).toEqual(now + 4);

      expect(sendEventMock.mock.calls[0][1]).toEqual(
        initialPayload.eventDescriptions["1004"]
      );

      expect(sendEventMock.mock.calls[1][0]).toEqual(now + 5);

      expect(sendEventMock.mock.calls[1][1]).toEqual(
        initialPayload.eventDescriptions["1005"]
      );

      expect(sendEventMock.mock.calls[2][0]).toEqual(now + 6);

      expect(sendEventMock.mock.calls[2][1]).toEqual(
        initialPayload.eventDescriptions["1006"]
      );
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
      sendEventMock = jest.fn(() => {
        throw new Error("test error");
      });
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

      expect(sendEventMock).not.toHaveBeenCalled();

      let allFilesFromDeviceDirPath = await readDirAsync(
        senderDevice.EventsDirectoryPath
      );

      expect(allFilesFromDeviceDirPath).toEqual([]);
    });
  });
});
