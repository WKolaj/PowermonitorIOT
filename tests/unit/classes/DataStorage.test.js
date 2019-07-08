const DataStorage = require("../../../classes/dataStorage/DataStorage");
const config = require("config");
const path = require("path");

let dataStorageDirectory = "_projTest";
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

describe("DataStorage", () => {
  beforeEach(async () => {
    await clearDirectoryAsync(dataStorageDirectory);
  });

  afterEach(async () => {
    await clearDirectoryAsync(dataStorageDirectory);
  });

  describe("constructor", () => {
    let exec = async () => {
      return new DataStorage();
    };

    it("should create new data storage", async () => {
      let result = await exec();

      expect(result).toBeDefined();
    });

    it("should create new data storage and set dataPoints to empty object", async () => {
      let result = await exec();

      expect(result.DataPoints).toEqual({});
    });

    it("should create new data storage and set filePath to null", async () => {
      let result = await exec();

      expect(result.FilePath).toBeNull();
    });

    it("should create new data storage and set DB to null", async () => {
      let result = await exec();

      expect(result.DB).toBeNull();
    });

    it("should create new data storage and set buffer size to 10", async () => {
      let result = await exec();

      expect(result.BufferSize).toEqual(10);
    });
  });

  describe("init", () => {
    let dataStorage;
    let payload;

    beforeEach(() => {
      payload = {
        filePath: path.join(dataStorageDirectory, "testFile.db"),
        bufferSize: 20,
        dataPointsId: ["dp1", "dp2", "dp3"]
      };
    });

    let exec = async () => {
      dataStorage = new DataStorage();
      return dataStorage.init(payload);
    };

    it("should initialize filePath property", async () => {
      await exec();

      expect(dataStorage.FilePath).toEqual(payload.filePath);
    });

    it("should initialize bufferSize property", async () => {
      await exec();

      expect(dataStorage.BufferSize).toEqual(payload.bufferSize);
    });

    it("should initialize dataPoints property", async () => {
      await exec();

      let expectedObject = {};

      for (let dpId of payload.dataPointsId) {
        expectedObject[dpId] = DataStorage.getColumnName(dpId);
      }

      expect(dataStorage.DataPoints).toEqual(expectedObject);
    });

    it("should create valid data storage file", async () => {
      await exec();

      let fileExists = await checkIfFileExistsAsync(payload.filePath);
      expect(fileExists).toEqual(true);

      expect(
        await checkIfColumnExists(payload.filePath, "data", "date", "INTEGER")
      ).toEqual(true);

      let columnNames = [];

      for (let dpId of payload.dataPointsId) {
        columnNames.push(DataStorage.getColumnName(dpId));
      }

      for (let column of columnNames) {
        expect(
          await checkIfColumnExists(payload.filePath, "data", column, "REAL")
        ).toEqual(true);
      }
    });

    it("should not throw and initialize datapoints if there is already a file with given columns", async () => {
      await exec();

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

      let expectedObject = {};

      for (let dpId of payload.dataPointsId) {
        expectedObject[dpId] = DataStorage.getColumnName(dpId);
      }

      expect(dataStorage.DataPoints).toEqual(expectedObject);
    });

    it("should create valid data storage file if there are no datapoints defined in payload", async () => {
      payload.dataPointsId = [];

      await exec();

      let fileExists = await checkIfFileExistsAsync(payload.filePath);
      expect(fileExists).toEqual(true);

      expect(
        await checkIfColumnExists(payload.filePath, "data", "date", "INTEGER")
      ).toEqual(true);
    });

    it("should create valid data storage file if datapoints are empty", async () => {
      payload.dataPointsId = undefined;

      await exec();

      let fileExists = await checkIfFileExistsAsync(payload.filePath);
      expect(fileExists).toEqual(true);

      expect(
        await checkIfColumnExists(payload.filePath, "data", "date", "INTEGER")
      ).toEqual(true);
    });

    it("should initialize bufferSize to 10 if it is not defined in payload property", async () => {
      payload.bufferSize = undefined;

      await exec();

      expect(dataStorage.BufferSize).toEqual(10);
    });

    it("should throw if filePath is not defined in payload", async () => {
      payload.filePath = undefined;
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

  describe("Payload", () => {
    let dataStorage;
    let initialPayload;

    beforeEach(() => {
      initialPayload = {
        filePath: path.join(dataStorageDirectory, "testFile.db"),
        bufferSize: 20,
        dataPointsId: ["dp1", "dp2", "dp3"]
      };
    });

    let exec = async () => {
      dataStorage = new DataStorage();
      await dataStorage.init(initialPayload);
      return dataStorage.Payload;
    };

    it("should generate valid property of data storage", async () => {
      let result = await exec();

      expect(result).toEqual(initialPayload);
    });

    it("should generate valid property of data storage if datapoints are not defined", async () => {
      initialPayload.dataPointsId = undefined;

      let result = await exec();

      expect(result).toEqual({ ...initialPayload, dataPointsId: [] });
    });

    it("should generate valid property of data storage that can recreate data storage", async () => {
      let result = await exec();

      let storage = new DataStorage();
      await storage.init(result);

      expect(storage.Payload).toEqual(initialPayload);
    });

    it("should generate valid property of data storage that can recreate data storage if datapoints are not defined", async () => {
      initialPayload.dataPointsId = undefined;
      let result = await exec();

      let storage = new DataStorage();
      await storage.init(result);

      expect(storage.Payload).toEqual({ ...initialPayload, dataPointsId: [] });
    });
  });

  describe("addDataPoint", () => {
    let dataStorage;
    let initialPayload;
    let dataPointId;

    beforeEach(() => {
      initialPayload = {
        filePath: path.join(dataStorageDirectory, "testFile.db"),
        bufferSize: 20,
        dataPointsId: ["dp1", "dp2", "dp3"]
      };
      dataPointId = "dp4";
    });

    let exec = async () => {
      dataStorage = new DataStorage();
      await dataStorage.init(initialPayload);
      return dataStorage.addDataPoint(dataPointId);
    };

    it("should add new datapoint id to data storage", async () => {
      await exec();

      expect(dataStorage.DataPoints[dataPointId]).toBeDefined();
    });

    it("should create new column associated with given datapoint", async () => {
      await exec();

      let columnName = DataStorage.getColumnName(dataPointId);
      let columnExists = await checkIfColumnExists(
        initialPayload.filePath,
        "data",
        columnName,
        "REAL"
      );
      expect(columnExists).toEqual(true);
    });

    it("should throw if datapoint already exists", async () => {
      dataPointId = "dp3";
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

  describe("removeDataPoint", () => {
    let dataStorage;
    let initialPayload;
    let dataPointId;

    beforeEach(() => {
      initialPayload = {
        filePath: path.join(dataStorageDirectory, "testFile.db"),
        bufferSize: 20,
        dataPointsId: ["dp1", "dp2", "dp3"]
      };
      dataPointId = "dp2";
    });

    let exec = async () => {
      dataStorage = new DataStorage();
      await dataStorage.init(initialPayload);
      return dataStorage.removeDataPoint(dataPointId);
    };

    it("should remove datapoint of given id from storage", async () => {
      await exec();

      let expectedDatapoints = {};

      for (let dpId of initialPayload.dataPointsId) {
        if (dpId !== dataPointId)
          expectedDatapoints[dpId] = DataStorage.getColumnName(dpId);
      }
      expect(dataStorage.DataPoints).toEqual(expectedDatapoints);
    });

    it("should not delete column associated with given datapoint", async () => {
      await exec();

      let columnName = DataStorage.getColumnName(dataPointId);
      let columnExists = await checkIfColumnExists(
        initialPayload.filePath,
        "data",
        columnName,
        "REAL"
      );
      expect(columnExists).toEqual(true);
    });

    it("should throw if datapoint doest not exist", async () => {
      dataPointId = "dp4";
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

  describe("insertValues", () => {
    let dataStorage;
    let initialPayload;
    let tickId;
    let insertPayload;

    beforeEach(() => {
      initialPayload = {
        filePath: path.join(dataStorageDirectory, "testFile.db"),
        bufferSize: 20,
        dataPointsId: ["dp1", "dp2", "dp3"]
      };
      tickId = 1000;
      insertPayload = {
        dp1: 1234,
        dp2: 123.32,
        dp3: 982
      };
    });

    let exec = async () => {
      dataStorage = new DataStorage();
      await dataStorage.init(initialPayload);
      return dataStorage.insertValues(tickId, insertPayload);
    };

    it("should insert given values inside database for given id", async () => {
      await exec();

      let data = await readAllDataFromTable(initialPayload.filePath, "data");

      expect(data.length).toEqual(1);

      let expectedData = {
        date: tickId,
        [DataStorage.getColumnName("dp1")]: insertPayload["dp1"],
        [DataStorage.getColumnName("dp2")]: insertPayload["dp2"],
        [DataStorage.getColumnName("dp3")]: insertPayload["dp3"]
      };
      expect(data[0]).toEqual(expectedData);
    });

    it("should insert given values of only these dps that are presented inside payload", async () => {
      delete insertPayload.dp2;
      await exec();

      let data = await readAllDataFromTable(initialPayload.filePath, "data");

      expect(data.length).toEqual(1);

      let expectedData = {
        date: tickId,
        [DataStorage.getColumnName("dp1")]: insertPayload["dp1"],
        [DataStorage.getColumnName("dp2")]: null,
        [DataStorage.getColumnName("dp3")]: insertPayload["dp3"]
      };
      expect(data[0]).toEqual(expectedData);
    });

    it("should not throw but not insert values of dps that are not added to storage", async () => {
      insertPayload.dp4 = 9876;
      await exec();

      let data = await readAllDataFromTable(initialPayload.filePath, "data");

      expect(data.length).toEqual(1);

      let expectedData = {
        date: tickId,
        [DataStorage.getColumnName("dp1")]: insertPayload["dp1"],
        [DataStorage.getColumnName("dp2")]: insertPayload["dp2"],
        [DataStorage.getColumnName("dp3")]: insertPayload["dp3"]
      };
      expect(data[0]).toEqual(expectedData);
    });

    it("should not insert anything if payload is empty", async () => {
      insertPayload = {};
      await exec();

      let data = await readAllDataFromTable(initialPayload.filePath, "data");

      expect(data.length).toEqual(0);
    });

    it("should act like a buffer and delete old values if number of rows exceeds max buffer size", async () => {
      //max buffer size - 20;
      await exec();

      let tickIds = [];
      let payloads = [];

      for (let i = 0; i < 40; i++) {
        tickIds.push(1001 + i);
        payloads.push({
          dp1: 100 * i + 1,
          dp2: 200 * i + 1,
          dp3: 300 * i + 1
        });
      }

      for (let i = 0; i < 40; i++) {
        await dataStorage.insertValues(tickIds[i], payloads[i]);
      }

      let data = await readAllDataFromTable(initialPayload.filePath, "data");

      expect(data.length).toEqual(20);

      for (let i = 0; i < 20; i++) {
        let expectedData = {
          date: tickIds[20 + i],
          [DataStorage.getColumnName("dp1")]: payloads[20 + i]["dp1"],
          [DataStorage.getColumnName("dp2")]: payloads[20 + i]["dp2"],
          [DataStorage.getColumnName("dp3")]: payloads[20 + i]["dp3"]
        };
        expect(data[i]).toEqual(expectedData);
      }
    });
  });

  describe("removeValues", () => {
    let dataStorage;
    let initialPayload;
    let insertTickId1;
    let insertPayload1;
    let insertTickId2;
    let insertPayload2;
    let insertTickId3;
    let insertPayload3;
    let removeTickId;

    beforeEach(() => {
      initialPayload = {
        filePath: path.join(dataStorageDirectory, "testFile.db"),
        bufferSize: 20,
        dataPointsId: ["dp1", "dp2", "dp3"]
      };
      insertTickId1 = 1000;
      insertPayload1 = {
        dp1: 1234,
        dp2: 123.32,
        dp3: 982
      };
      insertTickId2 = 2000;
      insertPayload2 = {
        dp1: 2234,
        dp2: 2123.32,
        dp3: 2982
      };
      insertTickId3 = 3000;
      insertPayload3 = {
        dp1: 31234,
        dp2: 3123.32,
        dp3: 3982
      };
      removeTickId = 2000;
    });

    let exec = async () => {
      dataStorage = new DataStorage();
      await dataStorage.init(initialPayload);
      await dataStorage.insertValues(insertTickId1, insertPayload1);
      await dataStorage.insertValues(insertTickId2, insertPayload2);
      await dataStorage.insertValues(insertTickId3, insertPayload3);
      await dataStorage.removeValues(removeTickId);
    };

    it("should remove variables of given id from database", async () => {
      await exec();

      let data = await readAllDataFromTable(initialPayload.filePath, "data");

      expect(data.length).toEqual(2);

      let expectedData1 = {
        date: insertTickId1,
        [DataStorage.getColumnName("dp1")]: insertPayload1["dp1"],
        [DataStorage.getColumnName("dp2")]: insertPayload1["dp2"],
        [DataStorage.getColumnName("dp3")]: insertPayload1["dp3"]
      };

      let expectedData3 = {
        date: insertTickId3,
        [DataStorage.getColumnName("dp1")]: insertPayload3["dp1"],
        [DataStorage.getColumnName("dp2")]: insertPayload3["dp2"],
        [DataStorage.getColumnName("dp3")]: insertPayload3["dp3"]
      };

      expect(data[0]).toEqual(expectedData1);
      expect(data[1]).toEqual(expectedData3);
    });

    it("should not throw but not remove variables if there is no given tickId in database", async () => {
      removeTickId = 9999;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(1);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      let data = await readAllDataFromTable(initialPayload.filePath, "data");

      expect(data.length).toEqual(3);

      let expectedData1 = {
        date: insertTickId1,
        [DataStorage.getColumnName("dp1")]: insertPayload1["dp1"],
        [DataStorage.getColumnName("dp2")]: insertPayload1["dp2"],
        [DataStorage.getColumnName("dp3")]: insertPayload1["dp3"]
      };

      let expectedData2 = {
        date: insertTickId2,
        [DataStorage.getColumnName("dp1")]: insertPayload2["dp1"],
        [DataStorage.getColumnName("dp2")]: insertPayload2["dp2"],
        [DataStorage.getColumnName("dp3")]: insertPayload2["dp3"]
      };

      let expectedData3 = {
        date: insertTickId3,
        [DataStorage.getColumnName("dp1")]: insertPayload3["dp1"],
        [DataStorage.getColumnName("dp2")]: insertPayload3["dp2"],
        [DataStorage.getColumnName("dp3")]: insertPayload3["dp3"]
      };

      expect(data[0]).toEqual(expectedData1);
      expect(data[1]).toEqual(expectedData2);
      expect(data[2]).toEqual(expectedData3);
    });
  });
});
