const SenderAgent = require("../../../classes/device/SpecialDevices/SenderAgents/SenderAgent");
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
  readDirAsync,
  createDirAsync,
  checkIfDirectoryExistsAsync,
  snooze
} = require("../../../utilities/utilities");

describe("SendDataAgent", () => {
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
        sendFileLimit: 10
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
    let setIsWritingToTrue;
    let tickId;
    let enableSendingDataMockFn;

    beforeEach(async () => {
      setIsWritingToTrue = false;
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
      enableSendingDataMockFn = jest.fn();
    });

    let exec = async () => {
      senderDevice = new SenderAgent();
      senderDevice.onSendingDataEnabled = enableSendingDataMockFn;

      senderDevice._sendData = sendDataMock;
      senderDevice._getDataFromVariables = getDataFromVariablesMock;

      await senderDevice.init(initialPayload);
      senderDevice.addToBuffer(bufferContent1);
      senderDevice.addToBuffer(bufferContent2);
      senderDevice.addToBuffer(bufferContent3);
      if (setIsWritingToTrue) senderDevice._isWritingFile = true;
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
    let editPayload;
    let onSendingDisabledMockFn;
    let onSendingEnabledMockFn;

    beforeEach(async () => {
      initialPayload = {
        dirPath: senderAgentDirectory,
        sendingEnabled: false,
        sendingInterval: 100,
        sendFileLimit: 10
      };
      editPayload = {
        sendingEnabled: true,
        sendingInterval: 120,
        sendFileLimit: 20
      };
      onSendingDisabledMockFn = jest.fn();
      onSendingEnabledMockFn = jest.fn();
    });

    let exec = async () => {
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
  });
});
