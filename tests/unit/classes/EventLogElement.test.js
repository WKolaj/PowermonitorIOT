const config = require("config");
const path = require("path");
const sqlite3 = require("sqlite3");

let {
  clearDirectoryAsync,
  checkIfTableExists,
  checkIfColumnExists,
  checkIfFileExistsAsync,
  checkIfDirectoryExistsAsync,
  createDatabaseFile,
  createDatabaseColumn,
  readAllDataFromTable,
  removeDirectoryAsync,
  createFileAsync,
  createDirAsync,
  readDirAsync,
  getCurrentAppVersion,
  readFileAsync,
  hashString,
  exists,
  hashedStringMatch,
  snooze
} = require("../../../utilities/utilities");

let createDatabaseTable = function(dbFile, tableName) {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database(dbFile);

    db.run(
      `CREATE TABLE IF NOT EXISTS ${tableName} (eventId INTEGER, PRIMARY KEY(eventId) );`,
      err => {
        if (err) {
          return reject(err);
        }

        return resolve(true);
      }
    );
  });
};

let testPayload = JSON.stringify({
  "1234": {
    id: "1234",
    name: "test device 1",
    isActive: false,
    timeout: 2000,
    ipAdress: "192.168.0.1",
    unitId: 1,
    portNumber: 502,
    variables: [
      {
        id: "0001",
        sampleTime: 2,
        name: "test variable 1",
        offset: 5,
        length: 1,
        fCode: 3,
        value: 1,
        type: "mbInt16",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "unit1",
        archiveSampleTime: 2
      },
      {
        id: "0002",
        sampleTime: 3,
        name: "test variable 2",
        offset: 6,
        length: 2,
        fCode: 4,
        value: 2,
        type: "mbInt32",
        archived: true,
        getSingleFCode: 4,
        setSingleFCode: 16,
        unit: "unit2",
        archiveSampleTime: 2
      },
      {
        id: "0003",
        sampleTime: 4,
        name: "test variable 3",
        offset: 7,
        length: 2,
        fCode: 16,
        value: 3.3,
        type: "mbFloat",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "unit3",
        archiveSampleTime: 2
      }
    ],
    calculationElements: [
      {
        id: "1001",
        type: "sumElement",
        archived: true,
        sampleTime: 1,
        name: "sumElement1",
        unit: "A",
        variables: [
          {
            id: "0001",
            factor: 1
          },
          {
            id: "0002",
            factor: 2
          }
        ],
        archiveSampleTime: 2
      },
      {
        id: "1002",
        type: "sumElement",
        archived: true,
        sampleTime: 2,
        unit: "B",
        name: "sumElement2",
        variables: [
          {
            id: "0002",
            factor: 2
          },
          {
            id: "0003",
            factor: 3
          }
        ],
        archiveSampleTime: 2
      }
    ],
    type: "mbDevice"
  },
  "1235": {
    id: "1235",
    name: "test device 2",
    isActive: false,
    timeout: 2000,
    ipAdress: "192.168.0.2",
    unitId: 1,
    portNumber: 502,
    calculationElements: [],
    variables: [
      {
        id: "0004",
        sampleTime: 2,
        name: "test variable 4",
        offset: 5,
        length: 1,
        fCode: 1,
        value: true,
        type: "mbBoolean",
        archived: true,
        getSingleFCode: 1,
        setSingleFCode: 15,
        unit: "unit4",
        archiveSampleTime: 2
      },
      {
        id: "0005",
        sampleTime: 3,
        name: "test variable 5",
        offset: 6,
        length: 2,
        fCode: 4,
        value: 5,
        type: "mbSwappedInt32",
        archived: true,
        getSingleFCode: 4,
        setSingleFCode: 16,
        unit: "unit5",
        archiveSampleTime: 2
      },
      {
        id: "0006",
        sampleTime: 4,
        name: "test variable 6",
        offset: 7,
        length: 2,
        fCode: 16,
        value: 6.6,
        type: "mbSwappedFloat",
        archived: true,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "unit6",
        archiveSampleTime: 2
      }
    ],
    type: "mbDevice"
  },
  "1236": {
    id: "1236",
    name: "test device 3",
    isActive: false,
    timeout: 2000,
    ipAdress: "192.168.0.3",
    unitId: 1,
    portNumber: 502,
    variables: [
      {
        id: "0007",
        sampleTime: 2,
        name: "test variable 4",
        offset: 4,
        length: 1,
        fCode: 3,
        value: 7,
        type: "mbUInt16",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "unit7",
        archiveSampleTime: 2
      },
      {
        id: "0008",
        sampleTime: 3,
        name: "test variable 5",
        offset: 5,
        length: 2,
        fCode: 4,
        value: 8,
        type: "mbSwappedUInt32",
        archived: true,
        getSingleFCode: 4,
        setSingleFCode: 16,
        unit: "unit8",
        archiveSampleTime: 2
      },
      {
        id: "0009",
        sampleTime: 4,
        name: "test variable 6",
        offset: 7,
        length: 2,
        fCode: 3,
        value: 9,
        type: "mbUInt32",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "unit9",
        archiveSampleTime: 2
      }
    ],
    calculationElements: [
      {
        id: "3001",
        type: "sumElement",
        archived: true,
        sampleTime: 1,
        name: "sumElement1",
        unit: "C",
        variables: [
          {
            id: "0007",
            factor: 1
          },
          {
            id: "0008",
            factor: 2
          }
        ],
        archiveSampleTime: 2
      },
      {
        id: "3002",
        type: "sumElement",
        archived: true,
        sampleTime: 2,
        name: "sumElement2",
        unit: "D",
        variables: [
          {
            id: "0008",
            factor: 2
          },
          {
            id: "0009",
            factor: 3
          }
        ],
        archiveSampleTime: 2
      }
    ],
    type: "mbDevice"
  },
  "1237": {
    id: "1237",
    name: "test device 4",
    isActive: false,
    timeout: 2000,
    ipAdress: "192.168.0.4",
    unitId: 1,
    portNumber: 502,
    variables: [
      {
        id: "0101",
        sampleTime: 1,
        name: "test variable tick 1",
        offset: 1,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbInt32",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "",
        archiveSampleTime: 1
      },
      {
        id: "0102",
        sampleTime: 1,
        name: "test variable tick 2",
        offset: 3,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbInt32",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "",
        archiveSampleTime: 1
      },
      {
        id: "0103",
        sampleTime: 1,
        name: "test variable tick 3",
        offset: 5,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbInt32",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "",
        archiveSampleTime: 1
      },
      {
        id: "0104",
        sampleTime: 1,
        name: "test variable tick 4",
        offset: 7,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbInt32",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "",
        archiveSampleTime: 1
      },
      {
        id: "0105",
        sampleTime: 1,
        name: "test variable value 1",
        offset: 9,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbInt32",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "",
        archiveSampleTime: 1
      },
      {
        id: "0106",
        sampleTime: 1,
        name: "test variable value 2",
        offset: 11,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbInt32",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "",
        archiveSampleTime: 1
      },
      {
        id: "0107",
        sampleTime: 1,
        name: "test variable value 3",
        offset: 13,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbInt32",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "",
        archiveSampleTime: 1
      },
      {
        id: "0108",
        sampleTime: 1,
        name: "test variable value 4",
        offset: 15,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbInt32",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "",
        archiveSampleTime: 1
      }
    ],
    calculationElements: [],
    type: "mbDevice"
  }
});

//CommInterface is common for all project objects!
let commInterface;

describe("EventLogElement", () => {
  //Database directory should be cleared
  let db1Path;
  let db2Path;
  let projPath;
  let expectedConfigFileName;
  let expectedDeviceDirName;
  let expectedAgentDirName;
  let expectedEventDirName;
  let Project;
  let EventLogElement;

  let createInitialFiles = async payload => {
    let commInterfacePayload = payload ? payload : JSON.parse(testPayload);
    let device1FilePayload = commInterfacePayload["1234"];
    let device2FilePayload = commInterfacePayload["1235"];
    let device3FilePayload = commInterfacePayload["1236"];
    let device4FilePayload = commInterfacePayload["1237"];
    let projectDirName = path.join(projPath);
    let projectDirPath = path.resolve(projectDirName);
    let configFilePath = path.resolve(
      path.join(projectDirName, expectedConfigFileName)
    );
    let deviceDirPath = path.resolve(
      path.join(projectDirName, expectedDeviceDirName)
    );
    let agentDirPath = path.resolve(
      path.join(projectDirName, expectedAgentDirName)
    );
    let eventDirPath = path.resolve(
      path.join(projectDirName, expectedEventDirName)
    );
    let device1FilePath = path.resolve(
      path.join(deviceDirPath, `${device1FilePayload.id}.json`)
    );
    let device2FilePath = path.resolve(
      path.join(deviceDirPath, `${device2FilePayload.id}.json`)
    );
    let device3FilePath = path.resolve(
      path.join(deviceDirPath, `${device3FilePayload.id}.json`)
    );
    let device4FilePath = path.resolve(
      path.join(deviceDirPath, `${device4FilePayload.id}.json`)
    );

    let configFileContent = {
      swVersion: getCurrentAppVersion(),
      users: [
        {
          login: "user1",
          password: await hashString("12345"),
          permissions: 1
        },
        {
          login: "user2",
          password: await hashString("123456"),
          permissions: 2
        },
        {
          login: "user3",
          password: await hashString("1234567"),
          permissions: 3
        }
      ],
      privateKey: "987654321"
    };

    if (!(await checkIfDirectoryExistsAsync(projectDirPath))) {
      await createDirAsync(projectDirPath);
    }

    if (!(await checkIfFileExistsAsync(configFilePath))) {
      await createFileAsync(configFilePath, JSON.stringify(configFileContent));
    }

    if (!(await checkIfDirectoryExistsAsync(deviceDirPath))) {
      await createDirAsync(deviceDirPath);
    }

    if (!(await checkIfDirectoryExistsAsync(agentDirPath))) {
      await createDirAsync(agentDirPath);
    }

    if (!(await checkIfDirectoryExistsAsync(eventDirPath))) {
      await createDirAsync(eventDirPath);
    }

    if (!(await checkIfFileExistsAsync(device1FilePath))) {
      await createFileAsync(
        device1FilePath,
        JSON.stringify(device1FilePayload)
      );
    }

    if (!(await checkIfFileExistsAsync(device2FilePath))) {
      await createFileAsync(
        device2FilePath,
        JSON.stringify(device2FilePayload)
      );
    }

    if (!(await checkIfFileExistsAsync(device3FilePath))) {
      await createFileAsync(
        device3FilePath,
        JSON.stringify(device3FilePayload)
      );
    }

    if (!(await checkIfFileExistsAsync(device4FilePath))) {
      await createFileAsync(
        device4FilePath,
        JSON.stringify(device4FilePayload)
      );
    }
  };

  beforeEach(async () => {
    jest.resetModules();

    EventLogElement = require("../../../classes/calculationElement/EventLogElement");
    //have to reload also modules, that are depended on commInterface object - in order for both commInterface to be the same objects
    Project = require("../../../classes/project/Project");

    commInterface = require("../../../classes/commInterface/CommInterface.js");

    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
    projPath = config.get("projPath");
    expectedConfigFileName = "project.json";
    expectedDeviceDirName = "devices";
    expectedAgentDirName = "dataAgents";
    expectedEventDirName = "eventLogs";
  });

  afterEach(async () => {
    if (commInterface.Initialized) {
      //ending communication with all devices if there are any
      await commInterface.stopCommunicationWithAllDevices();
      commInterface.Sampler.stop();
    }
    await clearDirectoryAsync(db1Path);
    await clearDirectoryAsync(db2Path);
    await clearDirectoryAsync(projPath);
  });

  describe("constructor", () => {
    let device;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
    });

    let exec = async () => {
      //Creating initial files based on testPayload;
      await createInitialFiles();

      project = new Project(projPath);

      await project.initFromFiles();

      device = await project.getDevice("1237");

      return new EventLogElement(device);
    };

    it("should create and return new EventLogElement", async () => {
      let result = await exec();

      expect(result).toBeDefined();
    });

    it("should assign device to EventLogElement", async () => {
      let result = await exec();

      expect(result.Device).toEqual(device);
    });

    it("should create initial objects for EventStorage, Variables, Descriptions and set FilePath to null", async () => {
      let result = await exec();

      expect(result.EventStorage).toBeDefined();
      expect(result.Variables).toEqual([]);
      expect(result.Descriptions).toEqual({});
      expect(result.FilePath).toEqual(null);
    });
  });

  describe("init", () => {
    let device;
    let eventLog;
    let payload;

    beforeEach(() => {
      payload = {
        id: "0202",
        name: "testEventLogElement",
        sampleTime: 1,
        archived: false,
        unit: "",
        archiveSampleTime: 1,
        type: "eventLogElement",
        logVariables: [
          { tickVarId: "0101", valueVarId: "0105" },
          { tickVarId: "0102", valueVarId: "0106" },
          { tickVarId: "0103", valueVarId: "0107" },
          { tickVarId: "0104", valueVarId: "0108" }
        ],
        eventDescriptions: {
          "1": "event number 1",
          "2": "event number 2",
          "3": "event number 3",
          "4": "event number 4",
          "5": "event number 5",
          "6": "event number 6",
          "7": "event number 7",
          "8": "event number 8",
          "9": "event number 9"
        }
      };
    });

    let exec = async () => {
      //Creating initial files based on testPayload;
      await createInitialFiles();

      project = new Project(projPath);

      await project.initFromFiles();

      device = await project.getDevice("1237");

      eventLog = new EventLogElement(device);

      await eventLog.init(payload);
    };

    it("should initialize event log based on given payload", async () => {
      await exec();

      expect(eventLog.Payload).toEqual(payload);
    });

    it("should create new database file for eventLog", async () => {
      await exec();

      let filePath = path.join(
        projPath,
        config.get("eventElementsDir"),
        `${payload.id}.db`
      );

      let fileExists = await checkIfFileExistsAsync(filePath);

      expect(fileExists).toEqual(true);
    });

    it("should set content of eventStorage to empty object if there was no database file before", async () => {
      await exec();

      expect(eventLog.EventStorage.Content).toEqual({});
    });

    it("should set Content according to databaseContent and set new LastEventId if content exists inside file", async () => {
      await createDirAsync(
        path.resolve(path.join(projPath, expectedEventDirName))
      );

      let filePath = path.join(
        projPath,
        expectedEventDirName,
        `${payload.id}.db`
      );

      await createDatabaseFile(filePath);

      await createDatabaseTable(filePath, "data");

      await createDatabaseColumn(filePath, "data", "value", "INTEGER");
      await createDatabaseColumn(filePath, "data", "tickId", "INTEGER");

      let db = new sqlite3.Database(filePath);

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

      await exec();

      expect(eventLog.EventStorage.Content).toEqual({
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
        },
        [eventId4]: {
          eventId: eventId4,
          tickId: tickId4,
          value: value4
        }
      });

      expect(eventLog.EventStorage.LastEventId).toEqual(eventId4);
    });

    it("should set Content according to databaseContent and set new LastEventId if content exists inside file - there are less events in database", async () => {
      await createDirAsync(
        path.resolve(path.join(projPath, expectedEventDirName))
      );

      let filePath = path.join(
        projPath,
        expectedEventDirName,
        `${payload.id}.db`
      );

      await createDatabaseFile(filePath);

      await createDatabaseTable(filePath, "data");

      await createDatabaseColumn(filePath, "data", "value", "INTEGER");
      await createDatabaseColumn(filePath, "data", "tickId", "INTEGER");

      let db = new sqlite3.Database(filePath);

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

      expect(eventLog.EventStorage.Content).toEqual({
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
      });

      expect(eventLog.EventStorage.LastEventId).toEqual(eventId3);
    });

    it("should set BufferSize according to number of variables", async () => {
      await exec();

      expect(eventLog.BufferSize).toEqual(4);
    });

    it("should set BufferSize according to number of variables if there are no variable", async () => {
      payload.logVariables = [];
      await exec();

      expect(eventLog.BufferSize).toEqual(0);
    });

    it("should not add to EventLog variables that does not exists in device", async () => {
      let initialVariables = payload.logVariables;
      payload.logVariables = [
        ...payload.logVariables,
        { tickVarId: "fakeId", valueVarId: "fakeId" }
      ];

      await exec();

      expect(eventLog.BufferSize).toEqual(4);
      expect(eventLog.Payload.logVariables).toEqual(initialVariables);
    });
  });

  describe("get Value", () => {
    let device;
    let eventLog;
    let payload;
    let eventId1;
    let tickId1;
    let value1;
    let eventId2;
    let tickId2;
    let value2;
    let eventId3;
    let tickId3;
    let value3;
    let eventId4;
    let tickId4;
    let value4;
    let fetchEventLog;

    beforeEach(() => {
      fetchEventLog = true;
      payload = {
        id: "0202",
        name: "testEventLogElement",
        sampleTime: 1,
        archived: false,
        unit: "",
        archiveSampleTime: 1,
        type: "eventLogElement",
        logVariables: [
          { tickVarId: "0101", valueVarId: "0105" },
          { tickVarId: "0102", valueVarId: "0106" },
          { tickVarId: "0103", valueVarId: "0107" },
          { tickVarId: "0104", valueVarId: "0108" }
        ],
        eventDescriptions: {
          "1": "event number 1",
          "2": "event number 2",
          "3": "event number 3",
          "4": "event number 4",
          "5": "event number 5",
          "6": "event number 6",
          "7": "event number 7",
          "8": "event number 8",
          "9": "event number 9"
        }
      };
    });

    let exec = async () => {
      if (fetchEventLog) {
        await createDirAsync(
          path.resolve(path.join(projPath, expectedEventDirName))
        );

        let filePath = path.join(
          projPath,
          expectedEventDirName,
          `${payload.id}.db`
        );

        await createDatabaseFile(filePath);

        await createDatabaseTable(filePath, "data");

        await createDatabaseColumn(filePath, "data", "value", "INTEGER");
        await createDatabaseColumn(filePath, "data", "tickId", "INTEGER");

        let db = new sqlite3.Database(filePath);

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

        eventId1 = 1;
        tickId1 = now + 1;
        value1 = 1001;

        await insertMethod(eventId1, tickId1, value1);

        eventId2 = 2;
        tickId2 = now + 2;
        value2 = 1002;

        await insertMethod(eventId2, tickId2, value2);

        eventId3 = 3;
        tickId3 = now + 3;
        value3 = 1003;

        await insertMethod(eventId3, tickId3, value3);

        eventId4 = 4;
        tickId4 = now + 4;
        value4 = 1004;

        await insertMethod(eventId4, tickId4, value4);
      }

      //Creating initial files based on testPayload;
      await createInitialFiles();

      project = new Project(projPath);

      await project.initFromFiles();

      device = await project.getDevice("1237");

      eventLog = new EventLogElement(device);

      await eventLog.init(payload);

      return eventLog.Value;
    };

    it("should return last event value with description - if description exists", async () => {
      payload.eventDescriptions["1004"] = "event number 1004";
      await exec();

      expect(eventLog.Value).toEqual("event number 1004");
    });

    it("should return last event value without description - if description does not exist", async () => {
      await exec();

      expect(eventLog.Value).toEqual(1004);
    });

    it("should return null if there are no values in content", async () => {
      fetchEventLog = false;

      await exec();

      expect(eventLog.Value).toEqual(null);
    });
  });

  describe("_convertEventFromStorageToEventWithDescription", () => {
    let device;
    let eventLog;
    let payload;
    let eventObject;

    beforeEach(() => {
      payload = {
        id: "0202",
        name: "testEventLogElement",
        sampleTime: 1,
        archived: false,
        unit: "",
        archiveSampleTime: 1,
        type: "eventLogElement",
        logVariables: [
          { tickVarId: "0101", valueVarId: "0105" },
          { tickVarId: "0102", valueVarId: "0106" },
          { tickVarId: "0103", valueVarId: "0107" },
          { tickVarId: "0104", valueVarId: "0108" }
        ],
        eventDescriptions: {
          "1": "event number 1",
          "2": "event number 2",
          "3": "event number 3",
          "4": "event number 4",
          "5": "event number 5",
          "6": "event number 6",
          "7": "event number 7",
          "8": "event number 8",
          "9": "event number 9"
        }
      };
      let now = Date.now();

      eventObject = { tickId: now + 1, value: 1 };
    });

    let exec = async () => {
      //Creating initial files based on testPayload;
      await createInitialFiles();

      project = new Project(projPath);

      await project.initFromFiles();

      device = await project.getDevice("1237");

      eventLog = new EventLogElement(device);

      await eventLog.init(payload);

      return eventLog._convertEventFromStorageToEventWithDescription(
        eventObject
      );
    };

    it("should convert eventObject to event collection - if value exists in description", async () => {
      let result = await exec();

      let expectedPayload = {
        tickId: eventObject.tickId,
        value: "event number 1"
      };

      expect(result).toEqual(expectedPayload);
    });

    it("should convert eventObject to event collection - if value does not exist in description", async () => {
      payload.eventDescriptions = {};
      let result = await exec();

      let expectedPayload = {
        tickId: eventObject.tickId,
        value: eventObject.value
      };

      expect(result).toEqual(expectedPayload);
    });
  });

  describe("_refreshEventStorage", () => {
    let device;
    let eventLog;
    let payload;
    let eventId1;
    let tickId1;
    let value1;
    let eventId2;
    let tickId2;
    let value2;
    let eventId3;
    let tickId3;
    let value3;
    let eventId4;
    let tickId4;
    let value4;
    let fetchEventLog;

    let valueVar1Value;
    let valueVar2Value;
    let valueVar3Value;
    let valueVar4Value;
    let tickVar1Value;
    let tickVar2Value;
    let tickVar3Value;
    let tickVar4Value;
    let now;

    beforeEach(() => {
      now = Date.now();

      fetchEventLog = true;
      payload = {
        id: "0202",
        name: "testEventLogElement",
        sampleTime: 1,
        archived: false,
        unit: "",
        archiveSampleTime: 1,
        type: "eventLogElement",
        logVariables: [
          { tickVarId: "0101", valueVarId: "0105" },
          { tickVarId: "0102", valueVarId: "0106" },
          { tickVarId: "0103", valueVarId: "0107" },
          { tickVarId: "0104", valueVarId: "0108" }
        ],
        eventDescriptions: {
          "1001": "event 1",
          "1002": "event 2",
          "1003": "event 3",
          "1004": "event 4",
          "1005": "event 5",
          "1006": "event 6",
          "1007": "event 7",
          "1008": "event 8",
          "1009": "event 9"
        }
      };

      valueVar1Value = 1006;
      tickVar1Value = now + 6;
      valueVar2Value = 1005;
      tickVar2Value = now + 5;
      valueVar3Value = 1004;
      tickVar3Value = now + 4;
      valueVar4Value = 1003;
      tickVar4Value = now + 3;
    });

    let exec = async () => {
      //Fetching databasse file with data
      if (fetchEventLog) {
        await createDirAsync(
          path.resolve(path.join(projPath, expectedEventDirName))
        );

        let filePath = path.join(
          projPath,
          expectedEventDirName,
          `${payload.id}.db`
        );

        await createDatabaseFile(filePath);

        await createDatabaseTable(filePath, "data");

        await createDatabaseColumn(filePath, "data", "value", "INTEGER");
        await createDatabaseColumn(filePath, "data", "tickId", "INTEGER");

        let db = new sqlite3.Database(filePath);

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

        eventId1 = 1;
        tickId1 = now + 1;
        value1 = 1001;

        await insertMethod(eventId1, tickId1, value1);

        eventId2 = 2;
        tickId2 = now + 2;
        value2 = 1002;

        await insertMethod(eventId2, tickId2, value2);

        eventId3 = 3;
        tickId3 = now + 3;
        value3 = 1003;

        await insertMethod(eventId3, tickId3, value3);

        eventId4 = 4;
        tickId4 = now + 4;
        value4 = 1004;

        await insertMethod(eventId4, tickId4, value4);
      }

      //Creating initial files based on testPayload;
      await createInitialFiles();

      project = new Project(projPath);

      await project.initFromFiles();

      device = await project.getDevice("1237");

      eventLog = new EventLogElement(device);

      await eventLog.init(payload);

      device.getVariable("0101").Value = tickVar1Value;
      device.getVariable("0105").Value = valueVar1Value;

      device.getVariable("0102").Value = tickVar2Value;
      device.getVariable("0106").Value = valueVar2Value;

      device.getVariable("0103").Value = tickVar3Value;
      device.getVariable("0107").Value = valueVar3Value;

      device.getVariable("0104").Value = tickVar4Value;
      device.getVariable("0108").Value = valueVar4Value;

      return eventLog._refreshEventStorage();
    };

    it("should set new events in Content according to new varaible values", async () => {
      let result = await exec();

      let expectedPayload = {
        [3]: {
          eventId: 3,
          tickId: tickVar4Value,
          value: valueVar4Value
        },
        [4]: {
          eventId: 4,
          tickId: tickVar3Value,
          value: valueVar3Value
        },
        [5]: {
          eventId: 5,
          tickId: tickVar2Value,
          value: valueVar2Value
        },
        [6]: {
          eventId: 6,
          tickId: tickVar1Value,
          value: valueVar1Value
        }
      };

      expect(eventLog.EventStorage.Content).toEqual(expectedPayload);
    });

    it("should append database with new values in buffer", async () => {
      await exec();

      let filePath = path.join(
        projPath,
        expectedEventDirName,
        `${payload.id}.db`
      );

      let dbContent = await readAllDataFromTable(filePath, "data");
      let expectedPayload = [
        {
          eventId: 1,
          tickId: now + 1,
          value: 1001
        },
        {
          eventId: 2,
          tickId: now + 2,
          value: 1002
        },
        {
          eventId: 3,
          tickId: now + 3,
          value: 1003
        },
        {
          eventId: 4,
          tickId: now + 4,
          value: 1004
        },
        {
          eventId: 5,
          tickId: now + 5,
          value: 1005
        },
        {
          eventId: 6,
          tickId: now + 6,
          value: 1006
        }
      ];

      expect(dbContent).toEqual(expectedPayload);
    });

    it("should return new values", async () => {
      let result = await exec();

      let expectedPayload = [
        {
          eventId: 5,
          tickId: tickVar2Value,
          value: payload.eventDescriptions[valueVar2Value]
        },
        {
          eventId: 6,
          tickId: tickVar1Value,
          value: payload.eventDescriptions[valueVar1Value]
        }
      ];

      expect(result).toEqual(expectedPayload);
    });

    it("should set new events in Content according to new varaible values - if all values are new", async () => {
      valueVar1Value = 1008;
      tickVar1Value = now + 8;
      valueVar2Value = 1007;
      tickVar2Value = now + 7;
      valueVar3Value = 1006;
      tickVar3Value = now + 6;
      valueVar4Value = 1005;
      tickVar4Value = now + 5;

      let result = await exec();

      let expectedPayload = {
        [5]: {
          eventId: 5,
          tickId: tickVar4Value,
          value: valueVar4Value
        },
        [6]: {
          eventId: 6,
          tickId: tickVar3Value,
          value: valueVar3Value
        },
        [7]: {
          eventId: 7,
          tickId: tickVar2Value,
          value: valueVar2Value
        },
        [8]: {
          eventId: 8,
          tickId: tickVar1Value,
          value: valueVar1Value
        }
      };

      expect(eventLog.EventStorage.Content).toEqual(expectedPayload);
    });

    it("should append database with new values in buffer - if all values are new", async () => {
      valueVar1Value = 1005;
      tickVar1Value = now + 5;
      valueVar2Value = 1006;
      tickVar2Value = now + 6;
      valueVar3Value = 1007;
      tickVar3Value = now + 7;
      valueVar4Value = 1008;
      tickVar4Value = now + 8;

      await exec();

      let filePath = path.join(
        projPath,
        expectedEventDirName,
        `${payload.id}.db`
      );

      let dbContent = await readAllDataFromTable(filePath, "data");
      let expectedPayload = [
        {
          eventId: 1,
          tickId: now + 1,
          value: 1001
        },
        {
          eventId: 2,
          tickId: now + 2,
          value: 1002
        },
        {
          eventId: 3,
          tickId: now + 3,
          value: 1003
        },
        {
          eventId: 4,
          tickId: now + 4,
          value: 1004
        },
        {
          eventId: 5,
          tickId: now + 8,
          value: 1008
        },
        {
          eventId: 6,
          tickId: now + 7,
          value: 1007
        },
        {
          eventId: 7,
          tickId: now + 6,
          value: 1006
        },
        {
          eventId: 8,
          tickId: now + 5,
          value: 1005
        }
      ];

      expect(dbContent).toEqual(expectedPayload);
    });

    it("should return new values - if all values are new", async () => {
      valueVar1Value = 1005;
      tickVar1Value = now + 5;
      valueVar2Value = 1006;
      tickVar2Value = now + 6;
      valueVar3Value = 1007;
      tickVar3Value = now + 7;
      valueVar4Value = 1008;
      tickVar4Value = now + 8;

      let result = await exec();

      let expectedPayload = [
        {
          eventId: 5,
          tickId: tickVar4Value,
          value: payload.eventDescriptions[valueVar4Value]
        },
        {
          eventId: 6,
          tickId: tickVar3Value,
          value: payload.eventDescriptions[valueVar3Value]
        },
        {
          eventId: 7,
          tickId: tickVar2Value,
          value: payload.eventDescriptions[valueVar2Value]
        },
        {
          eventId: 8,
          tickId: tickVar1Value,
          value: payload.eventDescriptions[valueVar1Value]
        }
      ];

      expect(result).toEqual(expectedPayload);
    });

    it("should set new events in Content according to new varaible values and avoid value equal to 0", async () => {
      valueVar2Value = 0;

      let result = await exec();

      let expectedPayload = {
        [2]: {
          eventId: 2,
          tickId: now + 2,
          value: 1002
        },
        [3]: {
          eventId: 3,
          tickId: tickVar4Value,
          value: valueVar4Value
        },
        [4]: {
          eventId: 4,
          tickId: tickVar3Value,
          value: valueVar3Value
        },
        [5]: {
          eventId: 5,
          tickId: tickVar1Value,
          value: valueVar1Value
        }
      };

      expect(eventLog.EventStorage.Content).toEqual(expectedPayload);
    });

    it("should append database with new values in buffer and avoid value equal to 0", async () => {
      valueVar2Value = 0;

      await exec();

      let filePath = path.join(
        projPath,
        expectedEventDirName,
        `${payload.id}.db`
      );

      let dbContent = await readAllDataFromTable(filePath, "data");
      let expectedPayload = [
        {
          eventId: 1,
          tickId: now + 1,
          value: 1001
        },
        {
          eventId: 2,
          tickId: now + 2,
          value: 1002
        },
        {
          eventId: 3,
          tickId: now + 3,
          value: 1003
        },
        {
          eventId: 4,
          tickId: now + 4,
          value: 1004
        },
        {
          eventId: 5,
          tickId: now + 6,
          value: 1006
        }
      ];

      expect(dbContent).toEqual(expectedPayload);
    });

    it("should return new values and avoid value equal to 0", async () => {
      valueVar2Value = 0;

      let result = await exec();

      let expectedPayload = [
        {
          eventId: 5,
          tickId: tickVar1Value,
          value: payload.eventDescriptions[valueVar1Value]
        }
      ];

      expect(result).toEqual(expectedPayload);
    });

    it("should set new events in Content according to new varaible values - if there was no data in database before", async () => {
      fetchEventLog = false;

      let result = await exec();

      let expectedPayload = {
        [4]: {
          eventId: 4,
          tickId: tickVar1Value,
          value: valueVar1Value
        },
        [3]: {
          eventId: 3,
          tickId: tickVar2Value,
          value: valueVar2Value
        },
        [2]: {
          eventId: 2,
          tickId: tickVar3Value,
          value: valueVar3Value
        },
        [1]: {
          eventId: 1,
          tickId: tickVar4Value,
          value: valueVar4Value
        }
      };

      expect(eventLog.EventStorage.Content).toEqual(expectedPayload);
    });

    it("should append database with new values in buffer - if there was no data in database before", async () => {
      fetchEventLog = false;

      await exec();

      let filePath = path.join(
        projPath,
        expectedEventDirName,
        `${payload.id}.db`
      );

      let dbContent = await readAllDataFromTable(filePath, "data");
      let expectedPayload = [
        {
          eventId: 1,
          tickId: now + 3,
          value: 1003
        },
        {
          eventId: 2,
          tickId: now + 4,
          value: 1004
        },
        {
          eventId: 3,
          tickId: now + 5,
          value: 1005
        },
        {
          eventId: 4,
          tickId: now + 6,
          value: 1006
        }
      ];

      expect(dbContent).toEqual(expectedPayload);
    });

    it("should return new values - if there was no data in database before", async () => {
      fetchEventLog = false;

      let result = await exec();

      let expectedPayload = [
        {
          eventId: 1,
          tickId: now + 3,
          value: "event 3"
        },
        {
          eventId: 2,
          tickId: now + 4,
          value: "event 4"
        },
        {
          eventId: 3,
          tickId: now + 5,
          value: "event 5"
        },
        {
          eventId: 4,
          tickId: now + 6,
          value: "event 6"
        }
      ];

      expect(result).toEqual(expectedPayload);
    });

    it("should set new events in Content according to new varaible values - if there was no data in database before and avoid values with 0", async () => {
      fetchEventLog = false;
      valueVar2Value = 0;

      let result = await exec();

      let expectedPayload = {
        [1]: {
          eventId: 1,
          tickId: tickVar4Value,
          value: valueVar4Value
        },
        [2]: {
          eventId: 2,
          tickId: tickVar3Value,
          value: valueVar3Value
        },
        [3]: {
          eventId: 3,
          tickId: tickVar1Value,
          value: valueVar1Value
        }
      };

      expect(eventLog.EventStorage.Content).toEqual(expectedPayload);
    });

    it("should append database with new values in buffer - if there was no data in database before and avoid values with 0", async () => {
      fetchEventLog = false;
      valueVar2Value = 0;

      await exec();

      let filePath = path.join(
        projPath,
        expectedEventDirName,
        `${payload.id}.db`
      );

      let dbContent = await readAllDataFromTable(filePath, "data");
      let expectedPayload = [
        {
          eventId: 1,
          tickId: now + 3,
          value: 1003
        },
        {
          eventId: 2,
          tickId: now + 4,
          value: 1004
        },
        {
          eventId: 3,
          tickId: now + 6,
          value: 1006
        }
      ];

      expect(dbContent).toEqual(expectedPayload);
    });

    it("should return new values - if there was no data in database before and avoid values with 0", async () => {
      fetchEventLog = false;
      valueVar2Value = 0;

      let result = await exec();

      let expectedPayload = [
        {
          eventId: 1,
          tickId: now + 3,
          value: "event 3"
        },
        {
          eventId: 2,
          tickId: now + 4,
          value: "event 4"
        },
        {
          eventId: 3,
          tickId: now + 6,
          value: "event 6"
        }
      ];

      expect(result).toEqual(expectedPayload);
    });

    it("should return new values - and not set description for events where there are no description assigned", async () => {
      valueVar1Value = 987654321;

      let result = await exec();

      let expectedPayload = [
        {
          eventId: 5,
          tickId: tickVar2Value,
          value: payload.eventDescriptions[valueVar2Value]
        },
        {
          eventId: 6,
          tickId: tickVar1Value,
          value: valueVar1Value
        }
      ];

      expect(result).toEqual(expectedPayload);
    });
  });

  describe("_onFirstRefresh", () => {
    let device;
    let eventLog;
    let payload;
    let refreshEventStorageMock = jest.fn();

    beforeEach(() => {
      payload = {
        id: "0202",
        name: "testEventLogElement",
        sampleTime: 1,
        archived: false,
        unit: "",
        archiveSampleTime: 1,
        type: "eventLogElement",
        logVariables: [
          { tickVarId: "0101", valueVarId: "0105" },
          { tickVarId: "0102", valueVarId: "0106" },
          { tickVarId: "0103", valueVarId: "0107" },
          { tickVarId: "0104", valueVarId: "0108" }
        ],
        eventDescriptions: {
          "1001": "event 1",
          "1002": "event 2",
          "1003": "event 3",
          "1004": "event 4",
          "1005": "event 5",
          "1006": "event 6",
          "1007": "event 7",
          "1008": "event 8",
          "1009": "event 9"
        }
      };
    });

    let exec = async () => {
      //Creating initial files based on testPayload;
      await createInitialFiles();

      project = new Project(projPath);

      await project.initFromFiles();

      device = await project.getDevice("1237");

      eventLog = new EventLogElement(device);

      await eventLog.init(payload);

      eventLog._refreshEventStorage = refreshEventStorageMock;

      return eventLog._onFirstRefresh();
    };

    it("should invoke _refreshEventStorage", async () => {
      await exec();

      expect(refreshEventStorageMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("_onRefresh", () => {
    let device;
    let eventLog;
    let payload;
    let refreshEventStorageMock = jest.fn();

    beforeEach(() => {
      payload = {
        id: "0202",
        name: "testEventLogElement",
        sampleTime: 1,
        archived: false,
        unit: "",
        archiveSampleTime: 1,
        type: "eventLogElement",
        logVariables: [
          { tickVarId: "0101", valueVarId: "0105" },
          { tickVarId: "0102", valueVarId: "0106" },
          { tickVarId: "0103", valueVarId: "0107" },
          { tickVarId: "0104", valueVarId: "0108" }
        ],
        eventDescriptions: {
          "1001": "event 1",
          "1002": "event 2",
          "1003": "event 3",
          "1004": "event 4",
          "1005": "event 5",
          "1006": "event 6",
          "1007": "event 7",
          "1008": "event 8",
          "1009": "event 9"
        }
      };
    });

    let exec = async () => {
      //Creating initial files based on testPayload;
      await createInitialFiles();

      project = new Project(projPath);

      await project.initFromFiles();

      device = await project.getDevice("1237");

      eventLog = new EventLogElement(device);

      await eventLog.init(payload);

      eventLog._refreshEventStorage = refreshEventStorageMock;

      return eventLog._onRefresh();
    };

    it("should invoke _refreshEventStorage", async () => {
      await exec();

      expect(refreshEventStorageMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("getValueFromDB", () => {
    let device;
    let eventLog;
    let payload;

    let valueVar1Value1;
    let valueVar2Value1;
    let valueVar3Value1;
    let valueVar4Value1;
    let tickVar1Value1;
    let tickVar2Value1;
    let tickVar3Value1;
    let tickVar4Value1;
    let valueVar1Value2;
    let valueVar2Value2;
    let valueVar3Value2;
    let valueVar4Value2;
    let tickVar1Value2;
    let tickVar2Value2;
    let tickVar3Value2;
    let tickVar4Value2;
    let valueVar1Value3;
    let valueVar2Value3;
    let valueVar3Value3;
    let valueVar4Value3;
    let tickVar1Value3;
    let tickVar2Value3;
    let tickVar3Value3;
    let tickVar4Value3;
    let tickId;
    let now;

    beforeEach(() => {
      now = Date.now();

      payload = {
        id: "0202",
        name: "testEventLogElement",
        sampleTime: 1,
        archived: false,
        unit: "",
        archiveSampleTime: 1,
        type: "eventLogElement",
        logVariables: [
          { tickVarId: "0101", valueVarId: "0105" },
          { tickVarId: "0102", valueVarId: "0106" },
          { tickVarId: "0103", valueVarId: "0107" },
          { tickVarId: "0104", valueVarId: "0108" }
        ],
        eventDescriptions: {
          "1001": "event 1",
          "1002": "event 2",
          "1003": "event 3",
          "1004": "event 4",
          "1005": "event 5",
          "1006": "event 6",
          "1007": "event 7",
          "1008": "event 8",
          "1009": "event 9"
        }
      };

      valueVar1Value1 = 1003;
      tickVar1Value1 = now + 3;
      valueVar2Value1 = 1004;
      tickVar2Value1 = now + 4;
      valueVar3Value1 = 1005;
      tickVar3Value1 = now + 5;
      valueVar4Value1 = 1006;
      tickVar4Value1 = now + 6;

      valueVar1Value2 = 1005;
      tickVar1Value2 = now + 5;
      valueVar2Value2 = 1006;
      tickVar2Value2 = now + 6;
      valueVar3Value2 = 1007;
      tickVar3Value2 = now + 7;
      valueVar4Value2 = 1008;
      tickVar4Value2 = now + 8;

      valueVar1Value3 = 1007;
      tickVar1Value3 = now + 7;
      valueVar2Value3 = 1008;
      tickVar2Value3 = now + 8;
      valueVar3Value3 = 1009;
      tickVar3Value3 = now + 9;
      valueVar4Value3 = 1010;
      tickVar4Value3 = now + 10;

      tickId = now + 5;
    });

    let exec = async () => {
      //Creating initial files based on testPayload;
      await createInitialFiles();

      project = new Project(projPath);

      await project.initFromFiles();

      device = await project.getDevice("1237");

      eventLog = new EventLogElement(device);

      await eventLog.init(payload);

      device.getVariable("0101").Value = tickVar1Value1;
      device.getVariable("0105").Value = valueVar1Value1;

      device.getVariable("0102").Value = tickVar2Value1;
      device.getVariable("0106").Value = valueVar2Value1;

      device.getVariable("0103").Value = tickVar3Value1;
      device.getVariable("0107").Value = valueVar3Value1;

      device.getVariable("0104").Value = tickVar4Value1;
      device.getVariable("0108").Value = valueVar4Value1;

      await eventLog._refreshEventStorage();

      device.getVariable("0101").Value = tickVar1Value2;
      device.getVariable("0105").Value = valueVar1Value2;

      device.getVariable("0102").Value = tickVar2Value2;
      device.getVariable("0106").Value = valueVar2Value2;

      device.getVariable("0103").Value = tickVar3Value2;
      device.getVariable("0107").Value = valueVar3Value2;

      device.getVariable("0104").Value = tickVar4Value2;
      device.getVariable("0108").Value = valueVar4Value2;

      await eventLog._refreshEventStorage();

      device.getVariable("0101").Value = tickVar1Value3;
      device.getVariable("0105").Value = valueVar1Value3;

      device.getVariable("0102").Value = tickVar2Value3;
      device.getVariable("0106").Value = valueVar2Value3;

      device.getVariable("0103").Value = tickVar3Value3;
      device.getVariable("0107").Value = valueVar3Value3;

      device.getVariable("0104").Value = tickVar4Value3;
      device.getVariable("0108").Value = valueVar4Value3;

      await eventLog._refreshEventStorage();

      return eventLog.getValueFromDB(payload.id, tickId);
    };

    it("should return value converted to description together with tickId", async () => {
      let result = await exec();

      expect(result).toEqual({
        [tickVar1Value2]: payload.eventDescriptions[valueVar1Value2]
      });
    });

    it("should return value not converted to description together with tickId if there is no description for given value", async () => {
      delete payload.eventDescriptions["1005"];

      let result = await exec();

      expect(result).toEqual({
        [tickVar1Value2]: valueVar1Value2
      });
    });

    it("should return null if there are no values of given tickId", async () => {
      tickId = 1;

      let result = await exec();

      expect(result).toEqual(null);
    });
  });

  describe("getValuesFromDB", () => {
    let device;
    let eventLog;
    let payload;

    let valueVar1Value1;
    let valueVar2Value1;
    let valueVar3Value1;
    let valueVar4Value1;
    let tickVar1Value1;
    let tickVar2Value1;
    let tickVar3Value1;
    let tickVar4Value1;
    let valueVar1Value2;
    let valueVar2Value2;
    let valueVar3Value2;
    let valueVar4Value2;
    let tickVar1Value2;
    let tickVar2Value2;
    let tickVar3Value2;
    let tickVar4Value2;
    let valueVar1Value3;
    let valueVar2Value3;
    let valueVar3Value3;
    let valueVar4Value3;
    let tickVar1Value3;
    let tickVar2Value3;
    let tickVar3Value3;
    let tickVar4Value3;
    let fromTickId;
    let toTickId;
    let now;

    beforeEach(() => {
      now = Date.now();

      payload = {
        id: "0202",
        name: "testEventLogElement",
        sampleTime: 1,
        archived: false,
        unit: "",
        archiveSampleTime: 1,
        type: "eventLogElement",
        logVariables: [
          { tickVarId: "0101", valueVarId: "0105" },
          { tickVarId: "0102", valueVarId: "0106" },
          { tickVarId: "0103", valueVarId: "0107" },
          { tickVarId: "0104", valueVarId: "0108" }
        ],
        eventDescriptions: {
          "1001": "event 1",
          "1002": "event 2",
          "1003": "event 3",
          "1004": "event 4",
          "1005": "event 5",
          "1006": "event 6",
          "1007": "event 7",
          "1008": "event 8",
          "1009": "event 9"
        }
      };

      valueVar1Value1 = 1003;
      tickVar1Value1 = now + 3;
      valueVar2Value1 = 1004;
      tickVar2Value1 = now + 4;
      valueVar3Value1 = 1005;
      tickVar3Value1 = now + 5;
      valueVar4Value1 = 1006;
      tickVar4Value1 = now + 6;

      valueVar1Value2 = 1005;
      tickVar1Value2 = now + 5;
      valueVar2Value2 = 1006;
      tickVar2Value2 = now + 6;
      valueVar3Value2 = 1007;
      tickVar3Value2 = now + 7;
      valueVar4Value2 = 1008;
      tickVar4Value2 = now + 8;

      valueVar1Value3 = 1007;
      tickVar1Value3 = now + 7;
      valueVar2Value3 = 1008;
      tickVar2Value3 = now + 8;
      valueVar3Value3 = 1009;
      tickVar3Value3 = now + 9;
      valueVar4Value3 = 1010;
      tickVar4Value3 = now + 10;

      fromTickId = now + 5;
      toTickId = now + 8;
    });

    let exec = async () => {
      //Creating initial files based on testPayload;
      await createInitialFiles();

      project = new Project(projPath);

      await project.initFromFiles();

      device = await project.getDevice("1237");

      eventLog = new EventLogElement(device);

      await eventLog.init(payload);

      device.getVariable("0101").Value = tickVar1Value1;
      device.getVariable("0105").Value = valueVar1Value1;

      device.getVariable("0102").Value = tickVar2Value1;
      device.getVariable("0106").Value = valueVar2Value1;

      device.getVariable("0103").Value = tickVar3Value1;
      device.getVariable("0107").Value = valueVar3Value1;

      device.getVariable("0104").Value = tickVar4Value1;
      device.getVariable("0108").Value = valueVar4Value1;

      await eventLog._refreshEventStorage();

      device.getVariable("0101").Value = tickVar1Value2;
      device.getVariable("0105").Value = valueVar1Value2;

      device.getVariable("0102").Value = tickVar2Value2;
      device.getVariable("0106").Value = valueVar2Value2;

      device.getVariable("0103").Value = tickVar3Value2;
      device.getVariable("0107").Value = valueVar3Value2;

      device.getVariable("0104").Value = tickVar4Value2;
      device.getVariable("0108").Value = valueVar4Value2;

      await eventLog._refreshEventStorage();

      device.getVariable("0101").Value = tickVar1Value3;
      device.getVariable("0105").Value = valueVar1Value3;

      device.getVariable("0102").Value = tickVar2Value3;
      device.getVariable("0106").Value = valueVar2Value3;

      device.getVariable("0103").Value = tickVar3Value3;
      device.getVariable("0107").Value = valueVar3Value3;

      device.getVariable("0104").Value = tickVar4Value3;
      device.getVariable("0108").Value = valueVar4Value3;

      await eventLog._refreshEventStorage();

      return eventLog.getValuesFromDB(payload.id, fromTickId, toTickId);
    };

    it("should return values converted to description together with tickId", async () => {
      let result = await exec();

      expect(result).toEqual([
        {
          [now + 8]: payload.eventDescriptions[1008]
        },
        {
          [now + 7]: payload.eventDescriptions[1007]
        },
        {
          [now + 6]: payload.eventDescriptions[1006]
        },
        {
          [now + 5]: payload.eventDescriptions[1005]
        }
      ]);
    });

    it("should return value not converted to description together with tickId if there is no description for given value", async () => {
      delete payload.eventDescriptions["1005"];
      delete payload.eventDescriptions["1006"];
      delete payload.eventDescriptions["1007"];
      delete payload.eventDescriptions["1008"];

      let result = await exec();

      expect(result).toEqual([
        {
          [now + 8]: 1008
        },
        {
          [now + 7]: 1007
        },
        {
          [now + 6]: 1006
        },
        {
          [now + 5]: 1005
        }
      ]);
    });

    it("should return [] if there are no values between given tick ids", async () => {
      fromTickId = 1;
      toTickId = 2;

      let result = await exec();

      expect(result).toEqual([]);
    });

    it("should return [] if startTickId is greater than stopTickId", async () => {
      fromTickId = now + 8;
      toTickId = now + 5;

      let result = await exec();

      expect(result).toEqual([]);
    });
  });
});
