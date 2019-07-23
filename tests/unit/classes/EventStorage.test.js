const EventStorage = require("../../../classes/EventBuffer/EventStorage");
const sqlite3 = require("sqlite3");
const config = require("config");
const path = require("path");

let eventBufferDirectory = "_projTest";
let eventBufferFile = "testFile.db";
let {
  clearDirectoryAsync,
  checkIfTableExists,
  checkIfColumnExists,
  checkIfFileExistsAsync,
  createDatabaseFile,
  createDatabaseTable,
  createDatabaseColumn,
  readAllDataFromTable,
  exists,
  existsAndIsNotEmpty,
  snooze
} = require("../../../utilities/utilities");

describe("EventBuffer", () => {
  let eventBufferFilePath;
  beforeEach(async () => {
    await clearDirectoryAsync(eventBufferDirectory);
    eventBufferFilePath = path.join(eventBufferDirectory, eventBufferFile);
  });

  afterEach(async () => {
    await clearDirectoryAsync(eventBufferDirectory);
  });

  describe("constructor", () => {
    let exec = async () => {
      return new EventStorage();
    };

    it("should create new event buffer", async () => {
      let result = await exec();

      expect(result).toBeDefined();
    });

    it("should set FilePath to null", async () => {
      let result = await exec();

      expect(result.FilePath).toBeNull();
    });

    it("should set DB to null", async () => {
      let result = await exec();

      expect(result.DB).toBeNull();
    });

    it("should set Content to {}", async () => {
      let result = await exec();

      expect(result.Content).toEqual({});
    });

    it("should set lastEventId to 0", async () => {
      let result = await exec();

      expect(result.LastEventId).toEqual(0);
    });

    it("should set busy to false", async () => {
      let result = await exec();

      expect(result.Busy).toEqual(false);
    });

    it("should set initialized to false", async () => {
      let result = await exec();

      expect(result.Initialized).toEqual(false);
    });

    it("should set bufferSize to 10", async () => {
      let result = await exec();

      expect(result.BufferSize).toEqual(10);
    });
  });

  describe("init", () => {
    let buffer;
    let bufferSize;
    let createDatabaseIfNotExistsThrows;

    beforeEach(() => {
      bufferSize = 15;
      createDatabaseIfNotExistsThrows = false;
    });

    let exec = async () => {
      buffer = new EventStorage();

      if (createDatabaseIfNotExistsThrows)
        buffer._createDatabaseIfNotExists = () => {
          throw new Error("test");
        };

      return buffer.init(eventBufferFilePath, bufferSize);
    };

    it("should create new database file as filePath for buffer - if it doesn't exist", async () => {
      await exec();

      let fileExists = await checkIfFileExistsAsync(eventBufferFilePath);

      expect(fileExists).toEqual(true);
    });

    it("should create new table for data - if it doesn't exists", async () => {
      await exec();

      let tableExists = await checkIfTableExists(eventBufferFilePath, "data");

      expect(tableExists).toEqual(true);
    });

    it("should create new columns in table data - if they not exists", async () => {
      await exec();

      let eventIdColumnExists = await checkIfColumnExists(
        eventBufferFilePath,
        "data",
        "eventId",
        "INTEGER"
      );
      let tickIdColumnExists = await checkIfColumnExists(
        eventBufferFilePath,
        "data",
        "tickId",
        "INTEGER"
      );
      let valueColumnExists = await checkIfColumnExists(
        eventBufferFilePath,
        "data",
        "value",
        "INTEGER"
      );

      expect(eventIdColumnExists).toEqual(true);
      expect(tickIdColumnExists).toEqual(true);
      expect(valueColumnExists).toEqual(true);
    });

    it("should not throw if database file already exists - but initialize its table and columns", async () => {
      //creating initial databaseFile
      await createDatabaseFile(eventBufferFilePath);

      await exec();

      let fileExists = await checkIfFileExistsAsync(eventBufferFilePath);
      expect(fileExists).toEqual(true);

      let tableExists = await checkIfTableExists(eventBufferFilePath, "data");

      expect(tableExists).toEqual(true);

      let eventIdColumnExists = await checkIfColumnExists(
        eventBufferFilePath,
        "data",
        "eventId",
        "INTEGER"
      );
      let tickIdColumnExists = await checkIfColumnExists(
        eventBufferFilePath,
        "data",
        "tickId",
        "INTEGER"
      );
      let valueColumnExists = await checkIfColumnExists(
        eventBufferFilePath,
        "data",
        "value",
        "INTEGER"
      );

      expect(eventIdColumnExists).toEqual(true);
      expect(tickIdColumnExists).toEqual(true);
      expect(valueColumnExists).toEqual(true);
    });

    it("should not throw if database file already exists and its table already exists - but initialize its columns", async () => {
      //creating initial databaseFile
      await createDatabaseFile(eventBufferFilePath);

      await createDatabaseTable(eventBufferFilePath, "data");

      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "eventId",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "value",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "tickId",
        "INTEGER"
      );

      await exec();

      let fileExists = await checkIfFileExistsAsync(eventBufferFilePath);
      expect(fileExists).toEqual(true);

      let tableExists = await checkIfTableExists(eventBufferFilePath, "data");

      expect(tableExists).toEqual(true);

      let eventIdColumnExists = await checkIfColumnExists(
        eventBufferFilePath,
        "data",
        "eventId",
        "INTEGER"
      );
      let tickIdColumnExists = await checkIfColumnExists(
        eventBufferFilePath,
        "data",
        "tickId",
        "INTEGER"
      );
      let valueColumnExists = await checkIfColumnExists(
        eventBufferFilePath,
        "data",
        "value",
        "INTEGER"
      );

      expect(eventIdColumnExists).toEqual(true);
      expect(tickIdColumnExists).toEqual(true);
      expect(valueColumnExists).toEqual(true);
    });

    it("should set initialized to true", async () => {
      await exec();

      expect(buffer.Initialized).toEqual(true);
    });

    it("should set Busy to false", async () => {
      await exec();

      expect(buffer.Busy).toEqual(false);
    });

    it("should set Busy to false and initialized to false if _createDatabaseIfNotExists throws", async () => {
      createDatabaseIfNotExistsThrows = true;

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

      expect(buffer.Busy).toEqual(false);
      expect(buffer.Initialized).toEqual(false);
    });

    it("should set Content to empty value if database is empty", async () => {
      await exec();

      expect(buffer.Content).toEqual({});
    });

    it("should set Content to empty value if database table is empty", async () => {
      //creating initial databaseFile
      let testDb = new sqlite3.Database(eventBufferFilePath);

      let createTableFunc = async () =>
        //Returning promise - in order to implement async/await instead of callback functions
        new Promise((resolve, reject) => {
          try {
            testDb.run(
              `CREATE TABLE IF NOT EXISTS data (eventId INTEGER, value INTEGER, tickId INTEGER, PRIMARY KEY(eventId) );`,
              function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(true);
              }
            );
          } catch (err) {
            return reject(err);
          }
        });

      await createTableFunc();
      await testDb.close();

      await exec();

      expect(buffer.Content).toEqual({});
    });

    it("should set Content according to database data if database data exists", async () => {
      //creating initial databaseFile
      await createDatabaseFile(eventBufferFilePath);

      await createDatabaseTable(eventBufferFilePath, "data");

      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "eventId",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "value",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "tickId",
        "INTEGER"
      );

      let db = new sqlite3.Database(eventBufferFilePath);

      let insertMethod = async (eventId, tickId, value) => {
        return new Promise((resolve, reject) => {
          if (!(exists(eventId) && exists(tickId) && exists(value)))
            return resolve(false);

          try {
            let insertQuery =
              "INSERT INTO data(eventId,tickId,value) VALUES (?,?,?);";

            let valuesToBeInserted = [eventId, tickId, value];

            db.run(insertQuery, valuesToBeInserted, async err => {
              if (err) {
                return reject(err);
              }

              return resolve(true);
            });
          } catch (err) {
            return reject(err);
          }
        });
      };

      let now = Date.now();

      let eventId1 = 1;
      let tickId1 = now + 1;
      let value1 = 1001;

      await insertMethod(eventId1, tickId1, value1);

      let eventId2 = 2;
      let tickId2 = now + 2;
      let value2 = 1002;

      await insertMethod(eventId2, tickId2, value2);

      let eventId3 = 3;
      let tickId3 = now + 3;
      let value3 = 1003;

      await insertMethod(eventId3, tickId3, value3);

      await exec();

      let expectedPayload = {
        [eventId1]: {
          eventId: eventId1,
          tickId: tickId1,
          value: value1
        },
        [eventId2]: {
          eventId: eventId2,
          tickId: tickId2,
          value: value2
        },
        [eventId3]: {
          eventId: eventId3,
          tickId: tickId3,
          value: value3
        }
      };

      expect(buffer.Content).toEqual(expectedPayload);
    });

    it("should not set in Content values lesser or equal to 0", async () => {
      //creating initial databaseFile
      await createDatabaseFile(eventBufferFilePath);

      await createDatabaseTable(eventBufferFilePath, "data");

      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "eventId",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "value",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "tickId",
        "INTEGER"
      );

      let db = new sqlite3.Database(eventBufferFilePath);

      let insertMethod = async (eventId, tickId, value) => {
        return new Promise((resolve, reject) => {
          if (!(exists(eventId) && exists(tickId) && exists(value)))
            return resolve(false);

          try {
            let insertQuery =
              "INSERT INTO data(eventId,tickId,value) VALUES (?,?,?);";

            let valuesToBeInserted = [eventId, tickId, value];

            db.run(insertQuery, valuesToBeInserted, async err => {
              if (err) {
                return reject(err);
              }

              return resolve(true);
            });
          } catch (err) {
            return reject(err);
          }
        });
      };

      let now = Date.now();

      let eventId1 = 1;
      let tickId1 = now + 1;
      let value1 = 0;

      await insertMethod(eventId1, tickId1, value1);

      let eventId2 = 2;
      let tickId2 = now + 2;
      let value2 = -1;

      await insertMethod(eventId2, tickId2, value2);

      let eventId3 = 3;
      let tickId3 = now + 3;
      let value3 = 1003;

      await insertMethod(eventId3, tickId3, value3);

      await exec();

      let expectedPayload = {
        [eventId3]: {
          eventId: eventId3,
          tickId: tickId3,
          value: value3
        }
      };

      expect(buffer.Content).toEqual(expectedPayload);
    });

    it("should last event id to the max value of all eventIds", async () => {
      //creating initial databaseFile
      await createDatabaseFile(eventBufferFilePath);

      await createDatabaseTable(eventBufferFilePath, "data");

      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "eventId",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "value",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "tickId",
        "INTEGER"
      );

      let db = new sqlite3.Database(eventBufferFilePath);

      let insertMethod = async (eventId, tickId, value) => {
        return new Promise((resolve, reject) => {
          if (!(exists(eventId) && exists(tickId) && exists(value)))
            return resolve(false);

          try {
            let insertQuery =
              "INSERT INTO data(eventId,tickId,value) VALUES (?,?,?);";

            let valuesToBeInserted = [eventId, tickId, value];

            db.run(insertQuery, valuesToBeInserted, async err => {
              if (err) {
                return reject(err);
              }

              return resolve(true);
            });
          } catch (err) {
            return reject(err);
          }
        });
      };

      let now = Date.now();

      let eventId1 = 1;
      let tickId1 = now + 1;
      let value1 = 1001;

      await insertMethod(eventId1, tickId1, value1);

      let eventId2 = 5;
      let tickId2 = now + 2;
      let value2 = 1002;

      await insertMethod(eventId2, tickId2, value2);

      let eventId3 = 3;
      let tickId3 = now + 3;
      let value3 = 1003;

      await insertMethod(eventId3, tickId3, value3);

      await exec();

      expect(buffer.LastEventId).toEqual(5);
    });

    it("should get only bufferSize number of events from database - if number of elements in database is greater then buffer size", async () => {
      //creating initial databaseFile
      await createDatabaseFile(eventBufferFilePath);

      await createDatabaseTable(eventBufferFilePath, "data");

      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "eventId",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "value",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "tickId",
        "INTEGER"
      );

      let db = new sqlite3.Database(eventBufferFilePath);

      let insertMethod = async (eventId, tickId, value) => {
        return new Promise((resolve, reject) => {
          if (!(exists(eventId) && exists(tickId) && exists(value)))
            return resolve(false);

          try {
            let insertQuery =
              "INSERT INTO data(eventId,tickId,value) VALUES (?,?,?);";

            let valuesToBeInserted = [eventId, tickId, value];

            db.run(insertQuery, valuesToBeInserted, async err => {
              if (err) {
                return reject(err);
              }

              return resolve(true);
            });
          } catch (err) {
            return reject(err);
          }
        });
      };

      let now = Date.now();

      let eventId1 = 1;
      let tickId1 = now + 1;
      let value1 = 1001;

      await insertMethod(eventId1, tickId1, value1);

      let eventId2 = 2;
      let tickId2 = now + 2;
      let value2 = 1002;

      await insertMethod(eventId2, tickId2, value2);

      let eventId3 = 3;
      let tickId3 = now + 3;
      let value3 = 1003;

      await insertMethod(eventId3, tickId3, value3);

      let eventId4 = 4;
      let tickId4 = now + 4;
      let value4 = 1004;

      await insertMethod(eventId4, tickId4, value4);

      bufferSize = 3;

      await exec();

      let expectedPayload = {
        [eventId2]: {
          eventId: eventId2,
          tickId: tickId2,
          value: value2
        },
        [eventId3]: {
          eventId: eventId3,
          tickId: tickId3,
          value: value3
        },
        [eventId4]: {
          eventId: eventId4,
          tickId: tickId4,
          value: value4
        }
      };

      expect(buffer.Content).toEqual(expectedPayload);

      expect(buffer.LastEventId).toEqual(4);
    });

    it("should get only bufferSize number of events from database sorted by eventId - even if they are stored in database in different order", async () => {
      //creating initial databaseFile
      await createDatabaseFile(eventBufferFilePath);

      await createDatabaseTable(eventBufferFilePath, "data");

      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "eventId",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "value",
        "INTEGER"
      );
      await createDatabaseColumn(
        eventBufferFilePath,
        "data",
        "tickId",
        "INTEGER"
      );

      let db = new sqlite3.Database(eventBufferFilePath);

      let insertMethod = async (eventId, tickId, value) => {
        return new Promise((resolve, reject) => {
          if (!(exists(eventId) && exists(tickId) && exists(value)))
            return resolve(false);

          try {
            let insertQuery =
              "INSERT INTO data(eventId,tickId,value) VALUES (?,?,?);";

            let valuesToBeInserted = [eventId, tickId, value];

            db.run(insertQuery, valuesToBeInserted, async err => {
              if (err) {
                return reject(err);
              }

              return resolve(true);
            });
          } catch (err) {
            return reject(err);
          }
        });
      };

      let now = Date.now();

      let eventId1 = 5;
      let tickId1 = now + 1;
      let value1 = 1001;

      await insertMethod(eventId1, tickId1, value1);

      let eventId2 = 2;
      let tickId2 = now + 2;
      let value2 = 1002;

      await insertMethod(eventId2, tickId2, value2);

      let eventId3 = 3;
      let tickId3 = now + 3;
      let value3 = 1003;

      await insertMethod(eventId3, tickId3, value3);

      let eventId4 = 4;
      let tickId4 = now + 4;
      let value4 = 1004;

      await insertMethod(eventId4, tickId4, value4);

      bufferSize = 3;

      await exec();

      let expectedPayload = {
        [eventId3]: {
          eventId: eventId3,
          tickId: tickId3,
          value: value3
        },
        [eventId4]: {
          eventId: eventId4,
          tickId: tickId4,
          value: value4
        },
        [eventId1]: {
          eventId: eventId1,
          tickId: tickId1,
          value: value1
        }
      };

      expect(buffer.Content).toEqual(expectedPayload);

      expect(buffer.LastEventId).toEqual(5);
    });
  });

  describe("_addEvent", () => {
    let buffer;
    let initialLastEventId;
    let initBuffer;
    let eventValue1;
    let eventTickId1;
    let eventValue2;
    let eventTickId2;
    let eventValue3;
    let eventTickId3;
    let insertDataIntoDBThrows;
    let bufferSize;

    beforeEach(() => {
      initBuffer = true;
      bufferSize = 15;
      initialLastEventId = null;
      insertDataIntoDBThrows = false;
      let now = Date.now();

      eventId1 = 1;
      eventTickId1 = now + 1;
      eventValue1 = 1001;

      eventId2 = 2;
      eventTickId2 = now + 2;
      eventValue2 = 1002;

      eventId3 = 3;
      eventTickId3 = now + 3;
      eventValue3 = 1003;
    });

    let exec = async () => {
      buffer = new EventStorage();
      if (initBuffer) await buffer.init(eventBufferFilePath, bufferSize);
      if (insertDataIntoDBThrows)
        buffer._insertValueIntoDB = jest.fn(() => {
          throw new Error("Test");
        });
      if (exists(initialLastEventId)) buffer._lastEventId = initialLastEventId;
      await buffer._addEvent(eventTickId1, eventValue1);
      await buffer._addEvent(eventTickId2, eventValue2);
      await buffer._addEvent(eventTickId3, eventValue3);
    };

    it("should insert data into buffer Content", async () => {
      await exec();

      let expectedContent = {
        "1": {
          eventId: 1,
          tickId: eventTickId1,
          value: eventValue1
        },
        "2": {
          eventId: 2,
          tickId: eventTickId2,
          value: eventValue2
        },
        "3": {
          eventId: 3,
          tickId: eventTickId3,
          value: eventValue3
        }
      };

      expect(buffer.Content).toEqual(expectedContent);
    });

    it("should insert data into database file", async () => {
      await exec();

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      let expectedContent = [
        {
          eventId: 1,
          tickId: eventTickId1,
          value: eventValue1
        },
        {
          eventId: 2,
          tickId: eventTickId2,
          value: eventValue2
        },
        {
          eventId: 3,
          tickId: eventTickId3,
          value: eventValue3
        }
      ];

      expect(databaseContent).toEqual(expectedContent);
    });

    it("should awoid values that are less or equal 0", async () => {
      eventValue1 = 0;
      eventValue2 = -1;

      await exec();

      //Id is 1 - cause it is first value that is added
      let expectedContent = {
        "1": {
          eventId: 1,
          tickId: eventTickId3,
          value: eventValue3
        }
      };

      expect(buffer.Content).toEqual(expectedContent);

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      //Id is 1 - cause it is first value that is added
      let expectedFileContent = [
        {
          eventId: 1,
          tickId: eventTickId3,
          value: eventValue3
        }
      ];

      expect(databaseContent).toEqual(expectedFileContent);
    });

    it("should insert data with generated eventId greater than lastEventId", async () => {
      initialLastEventId = 10;
      await exec();

      let expectedContent = {
        "11": {
          eventId: 11,
          tickId: eventTickId1,
          value: eventValue1
        },
        "12": {
          eventId: 12,
          tickId: eventTickId2,
          value: eventValue2
        },
        "13": {
          eventId: 13,
          tickId: eventTickId3,
          value: eventValue3
        }
      };

      expect(buffer.Content).toEqual(expectedContent);

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      let expectedFileContent = [
        {
          eventId: 11,
          tickId: eventTickId1,
          value: eventValue1
        },
        {
          eventId: 12,
          tickId: eventTickId2,
          value: eventValue2
        },
        {
          eventId: 13,
          tickId: eventTickId3,
          value: eventValue3
        }
      ];

      expect(databaseContent).toEqual(expectedFileContent);
    });

    it("should not insert data if inserting to database throws", async () => {
      insertDataIntoDBThrows = true;

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

      let expectedContent = {};

      expect(buffer.Content).toEqual(expectedContent);

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      let expectedFileContent = [];

      expect(databaseContent).toEqual(expectedFileContent);
    });

    it("should not insert data if buffer is not initialized", async () => {
      initBuffer = false;

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

      let expectedContent = {};

      expect(buffer.Content).toEqual(expectedContent);

      //Database file will not exist
    });

    it("should insert data into buffer Content and remove old one if number of events is greater than bufferSize", async () => {
      bufferSize = 3;

      await exec();

      let now = Date.now();

      let eventTickId4 = now + 4;
      let eventValue4 = 1004;

      await buffer._addEvent(eventTickId4, eventValue4);

      let expectedContent = {
        "2": {
          eventId: 2,
          tickId: eventTickId2,
          value: eventValue2
        },
        "3": {
          eventId: 3,
          tickId: eventTickId3,
          value: eventValue3
        },
        "4": {
          eventId: 4,
          tickId: eventTickId4,
          value: eventValue4
        }
      };

      expect(buffer.Content).toEqual(expectedContent);
    });

    it("should return new event", async () => {
      await exec();

      let now = Date.now();

      let eventTickId4 = now + 4;
      let eventValue4 = 1004;

      let result = await buffer._addEvent(eventTickId4, eventValue4);

      let expectedContent = {
        eventId: 4,
        tickId: eventTickId4,
        value: eventValue4
      };

      expect(result).toEqual(expectedContent);
    });
  });

  describe("refresh", () => {
    let buffer;
    let initialLastEventId;
    let initBuffer;
    let bufferSize;

    let content1;
    let content2;
    let content3;

    let invokeResult1;
    let invokeResult2;
    let invokeResult3;

    let insertDataIntoDBThrows;

    beforeEach(() => {
      initBuffer = true;
      bufferSize = 3;
      initialLastEventId = null;
      insertDataIntoDBThrows = false;

      let now = Date.now();

      content1 = [
        { tickId: now + 1, value: 1001 },
        { tickId: now + 2, value: 1002 },
        { tickId: now + 3, value: 1003 }
      ];
      content2 = [
        { tickId: now + 2, value: 1002 },
        { tickId: now + 3, value: 1003 },
        { tickId: now + 4, value: 1004 }
      ];
      content3 = [
        { tickId: now + 4, value: 1004 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 6, value: 1006 }
      ];
    });

    let exec = async () => {
      buffer = new EventStorage();
      if (initBuffer) await buffer.init(eventBufferFilePath, bufferSize);
      if (insertDataIntoDBThrows)
        buffer._insertValueIntoDB = jest.fn(() => {
          throw new Error("Test");
        });
      if (exists(initialLastEventId)) buffer._lastEventId = initialLastEventId;

      if (existsAndIsNotEmpty(content1))
        invokeResult1 = await buffer.refreshEvents(content1);
      if (existsAndIsNotEmpty(content2))
        invokeResult2 = await buffer.refreshEvents(content2);
      if (existsAndIsNotEmpty(content3))
        invokeResult3 = await buffer.refreshEvents(content3);
    };

    it("should insert only new values to buffer and remove old values", async () => {
      await exec();

      let expectedContent = {
        [6]: {
          value: content3[2].value,
          tickId: content3[2].tickId,
          eventId: 6
        },
        [5]: {
          value: content3[1].value,
          tickId: content3[1].tickId,
          eventId: 5
        },
        [4]: {
          value: content3[0].value,
          tickId: content3[0].tickId,
          eventId: 4
        }
      };

      expect(buffer.Content).toEqual(expectedContent);
    });

    it("should insert all values to buffer database", async () => {
      await exec();

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      let expectedContent = [
        {
          eventId: 1,
          tickId: content1[0].tickId,
          value: content1[0].value
        },
        {
          eventId: 2,
          tickId: content1[1].tickId,
          value: content1[1].value
        },
        {
          eventId: 3,
          tickId: content1[2].tickId,
          value: content1[2].value
        },
        {
          eventId: 4,
          tickId: content2[2].tickId,
          value: content2[2].value
        },
        {
          eventId: 5,
          tickId: content3[1].tickId,
          value: content3[1].value
        },
        {
          eventId: 6,
          tickId: content3[2].tickId,
          value: content3[2].value
        }
      ];

      expect(databaseContent).toEqual(expectedContent);
    });

    it("should return only new values", async () => {
      await exec();

      expect(invokeResult1).toEqual([
        {
          value: content1[0].value,
          tickId: content1[0].tickId,
          eventId: 1
        },
        {
          value: content1[1].value,
          tickId: content1[1].tickId,
          eventId: 2
        },
        {
          value: content1[2].value,
          tickId: content1[2].tickId,
          eventId: 3
        }
      ]);

      expect(invokeResult2).toEqual([
        {
          value: content2[2].value,
          tickId: content2[2].tickId,
          eventId: 4
        }
      ]);

      expect(invokeResult3).toEqual([
        {
          value: content3[1].value,
          tickId: content3[1].tickId,
          eventId: 5
        },
        {
          value: content3[2].value,
          tickId: content3[2].tickId,
          eventId: 6
        }
      ]);
    });

    it("should insert proper values even if order is incorrect", async () => {
      let now = Date.now();

      content1 = [
        { tickId: now + 1, value: 1001 },
        { tickId: now + 2, value: 1002 },
        { tickId: now + 3, value: 1003 }
      ];
      content2 = [
        { tickId: now + 2, value: 1002 },
        { tickId: now + 3, value: 1003 },
        { tickId: now + 4, value: 1004 }
      ];
      content3 = [
        { tickId: now + 6, value: 1006 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 4, value: 1004 }
      ];

      await exec();

      let expectedContent = {
        [4]: {
          value: content3[2].value,
          tickId: content3[2].tickId,
          eventId: 4
        },
        [6]: {
          value: content3[1].value,
          tickId: content3[1].tickId,
          eventId: 6
        },
        [5]: {
          value: content3[0].value,
          tickId: content3[0].tickId,
          eventId: 5
        }
      };

      expect(buffer.Content).toEqual(expectedContent);

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      let expectedDBContent = [
        {
          eventId: 1,
          tickId: content1[0].tickId,
          value: content1[0].value
        },
        {
          eventId: 2,
          tickId: content1[1].tickId,
          value: content1[1].value
        },
        {
          eventId: 3,
          tickId: content1[2].tickId,
          value: content1[2].value
        },
        {
          eventId: 4,
          tickId: content2[2].tickId,
          value: content2[2].value
        },
        {
          eventId: 5,
          tickId: content3[0].tickId,
          value: content3[0].value
        },
        {
          eventId: 6,
          tickId: content3[1].tickId,
          value: content3[1].value
        }
      ];

      expect(databaseContent).toEqual(expectedDBContent);

      expect(invokeResult1).toEqual([
        {
          value: content1[0].value,
          tickId: content1[0].tickId,
          eventId: 1
        },
        {
          value: content1[1].value,
          tickId: content1[1].tickId,
          eventId: 2
        },
        {
          value: content1[2].value,
          tickId: content1[2].tickId,
          eventId: 3
        }
      ]);

      expect(invokeResult2).toEqual([
        {
          value: content2[2].value,
          tickId: content2[2].tickId,
          eventId: 4
        }
      ]);

      expect(invokeResult3).toEqual([
        {
          value: content3[0].value,
          tickId: content3[0].tickId,
          eventId: 5
        },
        {
          value: content3[1].value,
          tickId: content3[1].tickId,
          eventId: 6
        }
      ]);
    });

    it("should not insert values equal or smaller than 0", async () => {
      let now = Date.now();

      content1 = [
        { tickId: now + 1, value: 1001 },
        { tickId: now + 2, value: 1002 },
        { tickId: now + 3, value: 0 }
      ];
      content2 = [
        { tickId: now + 2, value: 1002 },
        { tickId: now + 3, value: 0 },
        { tickId: now + 4, value: -1 }
      ];
      content3 = [
        { tickId: now + 4, value: -1 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 6, value: 1006 }
      ];

      await exec();

      let expectedContent = {
        [2]: {
          value: content1[1].value,
          tickId: content1[1].tickId,
          eventId: 2
        },
        [3]: {
          value: content3[1].value,
          tickId: content3[1].tickId,
          eventId: 3
        },
        [4]: {
          value: content3[2].value,
          tickId: content3[2].tickId,
          eventId: 4
        }
      };

      expect(buffer.Content).toEqual(expectedContent);

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      let expectedDBContent = [
        {
          eventId: 1,
          tickId: content1[0].tickId,
          value: content1[0].value
        },
        {
          eventId: 2,
          tickId: content1[1].tickId,
          value: content1[1].value
        },
        {
          eventId: 3,
          tickId: content3[1].tickId,
          value: content3[1].value
        },
        {
          eventId: 4,
          tickId: content3[2].tickId,
          value: content3[2].value
        }
      ];

      expect(databaseContent).toEqual(expectedDBContent);

      expect(invokeResult1).toEqual([
        {
          value: content1[0].value,
          tickId: content1[0].tickId,
          eventId: 1
        },
        {
          value: content1[1].value,
          tickId: content1[1].tickId,
          eventId: 2
        }
      ]);

      expect(invokeResult2).toEqual([]);

      expect(invokeResult3).toEqual([
        {
          value: content3[1].value,
          tickId: content3[1].tickId,
          eventId: 3
        },
        {
          value: content3[2].value,
          tickId: content3[2].tickId,
          eventId: 4
        }
      ]);
    });

    it("should not throw and insert data propery if one of contents is empty", async () => {
      let now = Date.now();

      content1 = [
        { tickId: now + 1, value: 1001 },
        { tickId: now + 2, value: 1002 },
        { tickId: now + 3, value: 1003 }
      ];
      content2 = [];
      content3 = [
        { tickId: now + 4, value: 1004 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 6, value: 1006 }
      ];

      await exec();

      let expectedContent = {
        [6]: {
          value: content3[2].value,
          tickId: content3[2].tickId,
          eventId: 6
        },
        [5]: {
          value: content3[1].value,
          tickId: content3[1].tickId,
          eventId: 5
        },
        [4]: {
          value: content3[0].value,
          tickId: content3[0].tickId,
          eventId: 4
        }
      };

      expect(buffer.Content).toEqual(expectedContent);

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      let expectedDBContent = [
        {
          eventId: 1,
          tickId: content1[0].tickId,
          value: content1[0].value
        },
        {
          eventId: 2,
          tickId: content1[1].tickId,
          value: content1[1].value
        },
        {
          eventId: 3,
          tickId: content1[2].tickId,
          value: content1[2].value
        },
        {
          eventId: 4,
          tickId: content3[0].tickId,
          value: content3[0].value
        },
        {
          eventId: 5,
          tickId: content3[1].tickId,
          value: content3[1].value
        },
        {
          eventId: 6,
          tickId: content3[2].tickId,
          value: content3[2].value
        }
      ];

      expect(databaseContent).toEqual(expectedDBContent);

      expect(invokeResult1).toEqual([
        {
          value: content1[0].value,
          tickId: content1[0].tickId,
          eventId: 1
        },
        {
          value: content1[1].value,
          tickId: content1[1].tickId,
          eventId: 2
        },
        {
          value: content1[2].value,
          tickId: content1[2].tickId,
          eventId: 3
        }
      ]);

      expect(invokeResult2).toEqual([]);

      expect(invokeResult3).toEqual([
        {
          value: content3[0].value,
          tickId: content3[0].tickId,
          eventId: 4
        },
        {
          value: content3[1].value,
          tickId: content3[1].tickId,
          eventId: 5
        },
        {
          value: content3[2].value,
          tickId: content3[2].tickId,
          eventId: 6
        }
      ]);
    });

    it("should throw and not insert anything if given payload length is greater than buffer size", async () => {
      let now = Date.now();

      bufferSize = 2;

      content1 = [
        { tickId: now + 1, value: 1001 },
        { tickId: now + 2, value: 1002 }
      ];
      content2 = [
        { tickId: now + 2, value: 1002 },
        { tickId: now + 3, value: 1003 },
        { tickId: now + 4, value: 1004 }
      ];
      content3 = [
        { tickId: now + 4, value: 1004 },
        { tickId: now + 5, value: 1005 }
      ];

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

      let expectedContent = {
        [2]: {
          value: content1[1].value,
          tickId: content1[1].tickId,
          eventId: 2
        },
        [1]: {
          value: content1[0].value,
          tickId: content1[0].tickId,
          eventId: 1
        }
      };

      expect(buffer.Content).toEqual(expectedContent);

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      let expectedDBContent = [
        {
          eventId: 1,
          tickId: content1[0].tickId,
          value: content1[0].value
        },
        {
          eventId: 2,
          tickId: content1[1].tickId,
          value: content1[1].value
        }
      ];

      expect(databaseContent).toEqual(expectedDBContent);

      expect(invokeResult1).toEqual([
        {
          value: content1[0].value,
          tickId: content1[0].tickId,
          eventId: 1
        },
        {
          value: content1[1].value,
          tickId: content1[1].tickId,
          eventId: 2
        }
      ]);
    });

    it("should not insert antyhing if value from invoke is the same as in content", async () => {
      let now = Date.now();

      content1 = [
        { tickId: now + 1, value: 1001 },
        { tickId: now + 2, value: 1002 },
        { tickId: now + 3, value: 1003 }
      ];
      content2 = [
        { tickId: now + 1, value: 1001 },
        { tickId: now + 2, value: 1002 },
        { tickId: now + 3, value: 1003 }
      ];
      content3 = [
        { tickId: now + 4, value: 1004 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 6, value: 1006 }
      ];

      await exec();

      let expectedContent = {
        [6]: {
          value: content3[2].value,
          tickId: content3[2].tickId,
          eventId: 6
        },
        [5]: {
          value: content3[1].value,
          tickId: content3[1].tickId,
          eventId: 5
        },
        [4]: {
          value: content3[0].value,
          tickId: content3[0].tickId,
          eventId: 4
        }
      };

      expect(buffer.Content).toEqual(expectedContent);

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      let expectedDBContent = [
        {
          eventId: 1,
          tickId: content1[0].tickId,
          value: content1[0].value
        },
        {
          eventId: 2,
          tickId: content1[1].tickId,
          value: content1[1].value
        },
        {
          eventId: 3,
          tickId: content1[2].tickId,
          value: content1[2].value
        },
        {
          eventId: 4,
          tickId: content3[0].tickId,
          value: content3[0].value
        },
        {
          eventId: 5,
          tickId: content3[1].tickId,
          value: content3[1].value
        },
        {
          eventId: 6,
          tickId: content3[2].tickId,
          value: content3[2].value
        }
      ];

      expect(databaseContent).toEqual(expectedDBContent);

      expect(invokeResult1).toEqual([
        {
          value: content1[0].value,
          tickId: content1[0].tickId,
          eventId: 1
        },
        {
          value: content1[1].value,
          tickId: content1[1].tickId,
          eventId: 2
        },
        {
          value: content1[2].value,
          tickId: content1[2].tickId,
          eventId: 3
        }
      ]);

      expect(invokeResult2).toEqual([]);

      expect(invokeResult3).toEqual([
        {
          value: content3[0].value,
          tickId: content3[0].tickId,
          eventId: 4
        },
        {
          value: content3[1].value,
          tickId: content3[1].tickId,
          eventId: 5
        },
        {
          value: content3[2].value,
          tickId: content3[2].tickId,
          eventId: 6
        }
      ]);
    });

    it("should not throw and insert two event with the same tickId if tickId is the same", async () => {
      let now = Date.now();

      content1 = [
        { tickId: now + 1, value: 1001 },
        { tickId: now + 2, value: 1002 },
        { tickId: now + 2, value: 1003 }
      ];
      content2 = [
        { tickId: now + 2, value: 1003 },
        { tickId: now + 2, value: 1004 },
        { tickId: now + 5, value: 1005 }
      ];
      content3 = [
        { tickId: now + 2, value: 1004 },
        { tickId: now + 5, value: 1005 },
        { tickId: now + 6, value: 1006 }
      ];

      await exec();

      let expectedContent = {
        [6]: {
          value: content3[2].value,
          tickId: content3[2].tickId,
          eventId: 6
        },
        [5]: {
          value: content3[1].value,
          tickId: content3[1].tickId,
          eventId: 5
        },
        [4]: {
          value: content3[0].value,
          tickId: content3[0].tickId,
          eventId: 4
        }
      };

      expect(buffer.Content).toEqual(expectedContent);

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      let expectedDBContent = [
        {
          eventId: 1,
          tickId: content1[0].tickId,
          value: content1[0].value
        },
        {
          eventId: 2,
          tickId: content1[1].tickId,
          value: content1[1].value
        },
        {
          eventId: 3,
          tickId: content1[2].tickId,
          value: content1[2].value
        },
        {
          eventId: 4,
          tickId: content3[0].tickId,
          value: content3[0].value
        },
        {
          eventId: 5,
          tickId: content3[1].tickId,
          value: content3[1].value
        },
        {
          eventId: 6,
          tickId: content3[2].tickId,
          value: content3[2].value
        }
      ];

      expect(databaseContent).toEqual(expectedDBContent);

      expect(invokeResult1).toEqual([
        {
          value: content1[0].value,
          tickId: content1[0].tickId,
          eventId: 1
        },
        {
          value: content1[1].value,
          tickId: content1[1].tickId,
          eventId: 2
        },
        {
          value: content1[2].value,
          tickId: content1[2].tickId,
          eventId: 3
        }
      ]);

      expect(invokeResult2).toEqual([
        {
          value: content2[1].value,
          tickId: content2[1].tickId,
          eventId: 4
        },
        {
          value: content2[2].value,
          tickId: content2[2].tickId,
          eventId: 5
        }
      ]);

      expect(invokeResult3).toEqual([
        {
          value: content3[2].value,
          tickId: content3[2].tickId,
          eventId: 6
        }
      ]);
    });

    it("should set busy to false after all", async () => {
      await exec();

      expect(buffer.Busy).toEqual(false);
    });

    it("should set busy to false if addingEvent throws", async () => {
      insertDataIntoDBThrows = true;

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

      expect(buffer.Busy).toEqual(false);
    });

    it("should throw and not insert value if two methods attempts to insert data in parallel", async () => {
      await exec();

      let now = content1[0].tickId - 1;

      let content4 = [
        { tickId: now + 5, value: 1005 },
        { tickId: now + 6, value: 1006 },
        { tickId: now + 7, value: 1007 }
      ];
      let content5 = [
        { tickId: now + 6, value: 1006 },
        { tickId: now + 7, value: 1007 },
        { tickId: now + 8, value: 1008 }
      ];

      let result = await Promise.all([
        new Promise(async (resolve, reject) => {
          try {
            invokeResult4 = await buffer.refreshEvents(content4);
            return resolve();
          } catch (err) {
            return resolve(err);
          }
        }),

        new Promise(async (resolve, reject) => {
          try {
            await snooze(1);
            invokeResult5 = await buffer.refreshEvents(content5);
            return resolve();
          } catch (err) {
            return resolve(err);
          }
        })
      ]);

      expect(result[0]).not.toBeDefined();
      expect(result[1]).toBeDefined();

      let expectedContent = {
        [7]: {
          value: content4[2].value,
          tickId: content4[2].tickId,
          eventId: 7
        },
        [6]: {
          value: content4[1].value,
          tickId: content4[1].tickId,
          eventId: 6
        },
        [5]: {
          value: content4[0].value,
          tickId: content4[0].tickId,
          eventId: 5
        }
      };

      expect(buffer.Content).toEqual(expectedContent);

      let databaseContent = await readAllDataFromTable(
        eventBufferFilePath,
        "data"
      );

      let expectedDBContent = [
        {
          eventId: 1,
          tickId: content1[0].tickId,
          value: content1[0].value
        },
        {
          eventId: 2,
          tickId: content1[1].tickId,
          value: content1[1].value
        },
        {
          eventId: 3,
          tickId: content1[2].tickId,
          value: content1[2].value
        },
        {
          eventId: 4,
          tickId: content2[2].tickId,
          value: content2[2].value
        },
        {
          eventId: 5,
          tickId: content3[1].tickId,
          value: content3[1].value
        },
        {
          eventId: 6,
          tickId: content3[2].tickId,
          value: content3[2].value
        },
        {
          eventId: 7,
          tickId: content4[2].tickId,
          value: content4[2].value
        }
      ];

      expect(databaseContent).toEqual(expectedDBContent);

      //Busy should be set to false after everything
      expect(buffer.Busy).toEqual(false);
    });

    it("should throw and not insert value if buffer is not initialized", async () => {
      initBuffer = false;

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

      let expectedContent = {};

      expect(buffer.Content).toEqual(expectedContent);

      //Database file will not exist
    });
  });
});
