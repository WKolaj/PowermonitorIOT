const SendDataAgent = require("../../../classes/device/SpecialDevices/SendAgent/SendDataAgent");
const config = require("config");
const path = require("path");
const { exists, isObjectEmpty } = require("../../../utilities/utilities");

let sendDataAgentDirectory = "_projTest";
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

describe("SendDataAgent", () => {
  beforeEach(async () => {
    await clearDirectoryAsync(sendDataAgentDirectory);
  });

  afterEach(async () => {
    await clearDirectoryAsync(sendDataAgentDirectory);
  });

  describe("constructor", () => {
    let exec = () => {
      return new SendDataAgent();
    };

    it("should create new SendDataAgent", () => {
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

    it("should set default sendDataLimit to 50", () => {
      let result = exec();
      expect(result.SendDataLimit).toEqual(50);
    });
  });

  describe("init", () => {
    let initialPayload;
    let sendDataAgent;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: sendDataAgentDirectory,
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
      sendDataAgent = new SendDataAgent();
      await sendDataAgent.init(initialPayload);
    };

    it("should initialize dataAgend according to given payload", async () => {
      await exec();

      expect(sendDataAgent.BufferSize).toEqual(initialPayload.bufferSize);
      expect(sendDataAgent.SendDataLimit).toEqual(initialPayload.sendDataLimit);
      expect(sendDataAgent.DirectoryPath).toEqual(initialPayload.dirPath);
    });

    it("should initialize varaibleStorage inside dataAgend - according to the payload", async () => {
      await exec();

      let expectedDataAgentPayload = {
        dirPath: initialPayload.dirPath,
        sampleTimeGroups: initialPayload.sampleTimeGroups,
        bufferSize: initialPayload.bufferSize
      };

      expect(sendDataAgent.ValueStorage.Payload).toEqual(
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

      expect(sendDataAgent.BufferSize).toEqual(100);
    });

    it("should set readyToSend to true if it is defined as true in payload", async () => {
      initialPayload.readyToSend = true;

      await exec();

      expect(sendDataAgent.ReadyToSend).toEqual(true);
    });

    it("should set readyToSend to false if it is not defined in payload", async () => {
      initialPayload.readyToSend = undefined;

      await exec();

      expect(sendDataAgent.ReadyToSend).toEqual(false);
    });

    it("should set sendDataLimit to 50 if there is no sendDataLimit is defined", async () => {
      initialPayload.sendDataLimit = undefined;

      await exec();

      expect(sendDataAgent.SendDataLimit).toEqual(50);
    });

    it("should not throw and set VaraibleStorage if there are no sampleGroups defined", async () => {
      initialPayload.sampleTimeGroups = undefined;

      await exec();

      let expectedDataAgentPayload = {
        dirPath: initialPayload.dirPath,
        sampleTimeGroups: [],
        bufferSize: initialPayload.bufferSize
      };

      expect(sendDataAgent.ValueStorage.Payload).toEqual(
        expectedDataAgentPayload
      );
    });
  });

  describe("addVariable", () => {
    let initialPayload;
    let sendDataAgent;
    let variableId;
    let sampleTime;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        readyToSend: false,
        dirPath: sendDataAgentDirectory,
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
    });

    let exec = async () => {
      sendDataAgent = new SendDataAgent();
      await sendDataAgent.init(initialPayload);
      await sendDataAgent.addVariable(sampleTime, variableId);
    };

    it("should add new variable to DataAgent", async () => {
      await exec();

      let expectedPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        readyToSend: false,
        dirPath: sendDataAgentDirectory,
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
      expect(sendDataAgent.Payload).toEqual(expectedPayload);
    });

    it("should append variable to SampleTimeGroup if given sampleTimeGroup already exists", async () => {
      sampleTime = 10;

      await exec();

      let expectedPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        readyToSend: false,
        dirPath: sendDataAgentDirectory,
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
      expect(sendDataAgent.Payload).toEqual(expectedPayload);
    });

    it("should not throw but not add new variable to DataAgent if varaible already exists", async () => {
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
      ).resolves.toBeDefined();

      expect(sendDataAgent.Payload).toEqual(initialPayload);
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

      expect(sendDataAgent.Payload).toEqual(initialPayload);
    });
  });

  describe("removeVariable", () => {
    let initialPayload;
    let sendDataAgent;
    let variableId;
    let sampleTime;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        readyToSend: false,
        dirPath: sendDataAgentDirectory,
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
      sendDataAgent = new SendDataAgent();
      await sendDataAgent.init(initialPayload);
      await sendDataAgent.removeVariable(sampleTime, variableId);
    };

    it("should remove variable to DataAgent", async () => {
      await exec();

      let expectedPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        readyToSend: false,
        dirPath: sendDataAgentDirectory,
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
      expect(sendDataAgent.Payload).toEqual(expectedPayload);
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

      expect(sendDataAgent.Payload).toEqual(initialPayload);
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

      expect(sendDataAgent.Payload).toEqual(initialPayload);
    });
  });

  describe("refresh", () => {
    let initialPayload;
    let sendDataAgent;
    let tickId;
    let dataPayload;
    let readyToSendData;
    let sendDataMockFn;

    beforeEach(() => {
      initialPayload = {
        bufferSize: 15,
        sendDataLimit: 20,
        dirPath: sendDataAgentDirectory,
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

      sendDataMockFn = jest.fn();
      readyToSendData = true;
    });

    let exec = async () => {
      sendDataAgent = new SendDataAgent();
      await sendDataAgent.init(initialPayload);
      sendDataAgent._readyToSend = readyToSendData;
      sendDataAgent._sendData = sendDataMockFn;
      await sendDataAgent.refresh(tickId, dataPayload);
    };

    it("should invoke sendData for every sample group with argument that corresponds to given payload - if everything goes well", async () => {
      await exec();

      let numberOfSampleGroups = initialPayload.sampleTimeGroups.length;

      expect(sendDataMockFn).toHaveBeenCalledTimes(numberOfSampleGroups);

      for (let i = 0; i < initialPayload.sampleTimeGroups.length; i++) {
        let sampleTimeGroup = initialPayload.sampleTimeGroups[i];
        let expectedDataPayload = {};

        for (let variable of sampleTimeGroup.variableIds) {
          if (exists(dataPayload[variable]))
            expectedDataPayload[variable] = dataPayload[variable];
        }

        expect(sendDataMockFn.mock.calls[i][0]).toEqual({
          [tickId]: expectedDataPayload
        });
      }
    });

    it("should omit data for varaible that are not added", async () => {
      dataPayload["fakeDp"] = 12355;

      await exec();

      let numberOfSampleGroups = initialPayload.sampleTimeGroups.length;

      expect(sendDataMockFn).toHaveBeenCalledTimes(numberOfSampleGroups);

      for (let i = 0; i < initialPayload.sampleTimeGroups.length; i++) {
        let sampleTimeGroup = initialPayload.sampleTimeGroups[i];
        let expectedDataPayload = {};

        for (let variable of sampleTimeGroup.variableIds) {
          if (exists(dataPayload[variable]))
            expectedDataPayload[variable] = dataPayload[variable];
        }

        expect(sendDataMockFn.mock.calls[i][0]).toEqual({
          [tickId]: expectedDataPayload
        });
      }
    });

    it("should invoke sendData correctly if not all values for every varaibles are given", async () => {
      dataPayload = {
        dp2: 102,
        dp4: 104,
        dp6: 106,
        dp8: 108
      };

      await exec();

      let numberOfSampleGroups = initialPayload.sampleTimeGroups.length;

      expect(sendDataMockFn).toHaveBeenCalledTimes(numberOfSampleGroups);

      for (let i = 0; i < initialPayload.sampleTimeGroups.length; i++) {
        let sampleTimeGroup = initialPayload.sampleTimeGroups[i];
        let expectedDataPayload = {};

        for (let variable of sampleTimeGroup.variableIds) {
          if (exists(dataPayload[variable]))
            expectedDataPayload[variable] = dataPayload[variable];
        }

        expect(sendDataMockFn.mock.calls[i][0]).toEqual({
          [tickId]: expectedDataPayload
        });
      }
    });

    it("should invoke sendData correctly if not every sample group are given", async () => {
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

      expect(sendDataMockFn).toHaveBeenCalledTimes(numberOfSampleGroups - 1);

      let callIndex = 0;

      for (let i = 0; i < initialPayload.sampleTimeGroups.length; i++) {
        let sampleTimeGroup = initialPayload.sampleTimeGroups[i];
        let expectedDataPayload = {};

        for (let variable of sampleTimeGroup.variableIds) {
          if (exists(dataPayload[variable]))
            expectedDataPayload[variable] = dataPayload[variable];
        }

        if (!isObjectEmpty(expectedDataPayload)) {
          expect(sendDataMockFn.mock.calls[callIndex][0]).toEqual({
            [tickId]: expectedDataPayload
          });
          callIndex++;
        }
      }
    });

    it("should set busy to false if everything goes well", async () => {
      await exec();

      expect(sendDataAgent.SendingBusy).toEqual(false);
    });

    it("should not throw if sendData throws", async () => {
      sendDataMockFn = jest.fn(data => {
        throw new Error("test error");
      });

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

    it("should set busy to false if sending data fails", async () => {
      sendDataMockFn = jest.fn(data => {
        throw new Error("test error");
      });
      await exec();
      expect(sendDataAgent.SendingBusy).toEqual(false);
    });

    it("should store data inside database if sending fails", async () => {
      sendDataMockFn = jest.fn(data => {
        throw new Error("test error");
      });

      await exec();

      let restData = await sendDataAgent._getBufferedData();

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
      sendDataMockFn = jest.fn(data => {
        throw new Error("test error");
      });

      await exec();

      let restData1 = await sendDataAgent._getBufferedData();

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

      expect(restData1).toEqual(expectedRestData);

      //Sending data one more time should invoke send data again with the same data

      let newSendDataMock = jest.fn();
      sendDataAgent._sendData = newSendDataMock;

      await sendDataAgent.refresh(tickId + 1, {});

      expect(newSendDataMock).toHaveBeenCalledTimes(3);

      expect(newSendDataMock.mock.calls[0][0]).toEqual({
        [tickId]: {
          dp1: 101,
          dp2: 102,
          dp3: 103
        }
      });

      expect(newSendDataMock.mock.calls[1][0]).toEqual({
        [tickId]: {
          dp4: 104,
          dp5: 105
        }
      });

      expect(newSendDataMock.mock.calls[2][0]).toEqual({
        [tickId]: {
          dp6: 106,
          dp7: 107,
          dp8: 108
        }
      });

      //Rest data should be empty
      let restData2 = await sendDataAgent._getBufferedData();

      expect(restData2).toEqual({
        [1]: {},
        [5]: {},
        [10]: {}
      });
    });

    it("should lock (by setting busy) a possibility to send more than one data at once", async () => {
      sendDataMockFn = jest.fn(async data => {
        await snooze(500);
      });

      //invoking exec = to initialize
      await exec();

      let sending1 = new Promise(async (resolve, reject) => {
        try {
          await sendDataAgent.refresh(tickId + 1, dataPayload);
          return resolve();
        } catch (err) {
          return resolve(err);
        }
      });

      let sending2 = new Promise(async (resolve, reject) => {
        try {
          //Waiting for sending 1 to start
          await snooze(500);
          await sendDataAgent.refresh(tickId + 2, dataPayload);
          return resolve();
        } catch (err) {
          return resolve(err);
        }
      });

      let sending3 = new Promise(async (resolve, reject) => {
        try {
          //Waiting for sending 1 to start
          await snooze(500);
          await sendDataAgent.refresh(tickId + 3, dataPayload);
          return resolve();
        } catch (err) {
          return resolve(err);
        }
      });

      await Promise.all([sending1, sending2, sending3]);

      //Only first one calls sendData - rest not
      //First calling, sends data 3 times + first 3 times while initializing = 6

      expect(sendDataMockFn).toHaveBeenCalledTimes(6);

      expect(sendDataMockFn.mock.calls[3][0]).toEqual({
        [tickId + 1]: {
          dp1: 101,
          dp2: 102,
          dp3: 103
        }
      });

      expect(sendDataMockFn.mock.calls[4][0]).toEqual({
        [tickId + 1]: {
          dp4: 104,
          dp5: 105
        }
      });

      expect(sendDataMockFn.mock.calls[5][0]).toEqual({
        [tickId + 1]: {
          dp6: 106,
          dp7: 107,
          dp8: 108
        }
      });

      //Rest data should be avariable in database
      let restData = await sendDataAgent._getBufferedData();

      let expectedRestData = {
        [1]: {
          [tickId + 2]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          },
          [tickId + 3]: {
            dp1: 101,
            dp2: 102,
            dp3: 103
          }
        },
        [5]: {
          [tickId + 2]: {
            dp4: 104,
            dp5: 105
          },
          [tickId + 3]: {
            dp4: 104,
            dp5: 105
          }
        },
        [10]: {
          [tickId + 2]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          },
          [tickId + 3]: {
            dp6: 106,
            dp7: 107,
            dp8: 108
          }
        }
      };

      expect(restData).toEqual(expectedRestData);

      //After all - busy should be send to false
      expect(sendDataAgent.SendingBusy).toEqual(false);

      //Should send rest of data while next refreshing
      await sendDataAgent.refresh(tickId + 4, {});

      expect(sendDataMockFn).toHaveBeenCalledTimes(9);

      expect(sendDataMockFn.mock.calls[6][0]).toEqual({
        [tickId + 2]: {
          dp1: 101,
          dp2: 102,
          dp3: 103
        },
        [tickId + 3]: {
          dp1: 101,
          dp2: 102,
          dp3: 103
        }
      });

      expect(sendDataMockFn.mock.calls[7][0]).toEqual({
        [tickId + 2]: {
          dp4: 104,
          dp5: 105
        },
        [tickId + 3]: {
          dp4: 104,
          dp5: 105
        }
      });

      expect(sendDataMockFn.mock.calls[8][0]).toEqual({
        [tickId + 2]: {
          dp6: 106,
          dp7: 107,
          dp8: 108
        },
        [tickId + 3]: {
          dp6: 106,
          dp7: 107,
          dp8: 108
        }
      });

      //There should be no data left in database
      let restData2 = await sendDataAgent._getBufferedData();

      expect(restData2).toEqual({
        [1]: {},
        [5]: {},
        [10]: {}
      });

      //After all - busy should be send to false
      expect(sendDataAgent.SendingBusy).toEqual(false);
    });

    it("all storages should act like a buffer - and do not store data if it was not send more time than buffer size", async () => {
      initialPayload.bufferSize = 5;

      sendDataMockFn = jest.fn(async data => {
        throw new Error("test error");
      });

      await exec();

      //Only last 5 should be stored
      for (let i = 2000; i <= 10000; i += 1000) {
        await sendDataAgent.refresh(i, dataPayload);
      }

      let restData1 = await sendDataAgent._getBufferedData();

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

      sendDataMockFn = jest.fn(async data => {
        throw new Error("test error");
      });

      await exec();

      let dataPayloadForGroup10 = {
        dp6: 206,
        dp7: 207,
        dp8: 208
      };

      //Only last 5 should be stored
      for (let i = 2000; i <= 10000; i += 1000) {
        await sendDataAgent.refresh(i, dataPayloadForGroup10);
      }

      let restData1 = await sendDataAgent._getBufferedData();

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

    it("should not invoke sendData but only store data if readyToSend is set to false", async () => {
      readyToSendData = false;

      await exec();

      expect(sendDataMockFn).toHaveBeenCalledTimes(0);

      let restData = await sendDataAgent._getBufferedData();

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

    it("should limit values to send to the number of sendDataLimit", async () => {
      initialPayload.sendDataLimit = 5;
      initialPayload.bufferSize = 10;

      sendDataMockFn = jest.fn(async data => {
        throw new Error("test error");
      });

      await exec();

      //Only last 5 should be stored
      for (let i = 2000; i <= 10000; i += 1000) {
        await sendDataAgent.refresh(i, dataPayload);
      }

      let newSendDataMethod = jest.fn();

      sendDataAgent._sendData = newSendDataMethod;

      await sendDataAgent.refresh(11000, {});

      expect(newSendDataMethod).toHaveBeenCalledTimes(3);

      let expectData1 = {
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
      };

      expect(newSendDataMethod.mock.calls[0][0]).toEqual(expectData1);

      let expectData2 = {
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
      };

      expect(newSendDataMethod.mock.calls[1][0]).toEqual(expectData2);

      let expectData3 = {
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
      };

      expect(newSendDataMethod.mock.calls[2][0]).toEqual(expectData3);

      //It should remove part of data which was sent

      let restData1 = await sendDataAgent._getBufferedData();

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
});
