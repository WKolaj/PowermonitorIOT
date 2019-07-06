const config = require("config");
const path = require("path");
const fs = require("fs");
const MBBooleanVariable = require("../../../../classes/variable/Modbus/MBBooleanVariable");
const MBByteArrayVariable = require("../../../../classes/variable/Modbus/MBByteArrayVariable");
const MBFloatVariable = require("../../../../classes/variable/Modbus/MBFloatVariable");
const MBInt16Variable = require("../../../../classes/variable/Modbus/MBInt16Variable");
const MBInt32Variable = require("../../../../classes/variable/Modbus/MBInt32Variable");
const MBSwappedFloatVariable = require("../../../../classes/variable/Modbus/MBSwappedFloatVariable");
const MBSwappedInt32Variable = require("../../../../classes/variable/Modbus/MBSwappedInt32Variable");
const MBSwappedUInt32Variable = require("../../../../classes/variable/Modbus/MBSwappedUInt32Variable");
const MBUInt16Variable = require("../../../../classes/variable/Modbus/MBUInt16Variable");
const MBUInt32Variable = require("../../../../classes/variable/Modbus/MBUInt32Variable");
const {
  hashString,
  hashedStringMatch
} = require("../../../../utilities/utilities");

let {
  clearDirectoryAsync,
  checkIfTableExists,
  checkIfColumnExists,
  checkIfFileExistsAsync,
  checkIfDirectoryExistsAsync,
  createDatabaseFile,
  createDatabaseTable,
  createDatabaseColumn,
  readAllDataFromTable,
  removeDirectoryAsync,
  createFileAsync,
  createDirAsync,
  readDirAsync,
  getCurrentAppVersion,
  readFileAsync,
  snooze
} = require("../../../../utilities/utilities");

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
        timeSample: 2,
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
        archiveTimeSample: 2
      },
      {
        id: "0002",
        timeSample: 3,
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
        archiveTimeSample: 2
      },
      {
        id: "0003",
        timeSample: 4,
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
        archiveTimeSample: 2
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
        archiveTimeSample: 2
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
        archiveTimeSample: 2
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
        timeSample: 2,
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
        archiveTimeSample: 2
      },
      {
        id: "0005",
        timeSample: 3,
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
        archiveTimeSample: 2
      },
      {
        id: "0006",
        timeSample: 4,
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
        archiveTimeSample: 2
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
        timeSample: 2,
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
        archiveTimeSample: 2
      },
      {
        id: "0008",
        timeSample: 3,
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
        archiveTimeSample: 2
      },
      {
        id: "0009",
        timeSample: 4,
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
        archiveTimeSample: 2
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
        archiveTimeSample: 2
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
        archiveTimeSample: 2
      }
    ],
    type: "mbDevice"
  }
});

//CommInterface is common for all project objects!
let commInterface;

describe("Project", () => {
  //Database directory should be cleared
  let db1Path;
  let db2Path;
  let projPath;
  let expectedConfigFileName;
  let expectedDeviceDirName;
  let Project;

  let createInitialFiles = async payload => {
    let commInterfacePayload = payload ? payload : JSON.parse(testPayload);
    let device1FilePayload = commInterfacePayload["1234"];
    let device2FilePayload = commInterfacePayload["1235"];
    let device3FilePayload = commInterfacePayload["1236"];
    let projectDirName = path.join(projPath);
    let projectDirPath = path.resolve(projectDirName);
    let configFilePath = path.resolve(
      path.join(projectDirName, expectedConfigFileName)
    );
    let deviceDirPath = path.resolve(
      path.join(projectDirName, expectedDeviceDirName)
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
  };

  beforeEach(async () => {
    jest.resetModules();

    commInterface = require("../../../../classes/commInterface/CommInterface.js");

    //have to reload also modules, that are depended on commInterface object - in order for both commInterface to be the same objects
    Project = require("../../../../classes/project/Project");

    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
    projPath = config.get("projPath");
    expectedConfigFileName = "project.json";
    expectedDeviceDirName = "devices";
  });

  afterEach(async () => {
    await clearDirectoryAsync(db1Path);
    await clearDirectoryAsync(db2Path);
    await clearDirectoryAsync(projPath);

    if (commInterface.Initialized) {
      //ending communication with all devices if there are any
      await commInterface.stopCommunicationWithAllDevices();
      commInterface.Sampler.stop();
    }
  });

  describe("editVariable", () => {
    let createPayload;
    let editPayload;
    let variable;
    let deviceId;
    let variableId;
    let projectDirName;
    let project;
    let previousGetRequest;
    let previousSetRequest;
    let previousRequestGroups;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1234";
      variableId = "000x";

      createPayload = {};
      createPayload.id = "000x";
      createPayload.name = "testVariable";
      createPayload.timeSample = 5;
      createPayload.unit = "A";
      createPayload.archived = false;
      createPayload.length = 2;
      createPayload.offset = 1;
      createPayload.fCode = 3;
      createPayload.getSingleFCode = 3;
      createPayload.setSingleFCode = 16;
      createPayload.type = "mbByteArray";
      createPayload.value = [0, 0, 0, 0];
      createPayload.archiveTimeSample = 5;

      editPayload = {};
      editPayload.id = "000x";
      editPayload.name = "editedVariable";
      editPayload.timeSample = 10;
      editPayload.unit = "B";
      editPayload.archived = false;
      editPayload.length = 4;
      editPayload.offset = 2;
      editPayload.fCode = 4;
      editPayload.getSingleFCode = 4;
      editPayload.setSingleFCode = 16;
      editPayload.type = "mbByteArray";
      editPayload.value = [0, 1, 0, 1, 0, 1, 0, 1];
      editPayload.archiveTimeSample = 10;

      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      variable = await project.createVariable(deviceId, createPayload);
      previousGetRequest = variable.GetSingleRequest;
      previousSetRequest = variable.SetSingleRequest;
      previousRequestGroups = variable.Device.Requests;
      return project.updateVariable(deviceId, variableId, editPayload);
    };

    it("should throw if device does not exist", async () => {
      deviceId = "9876";

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

    it("should throw if variable does not exist", async () => {
      variableId = "9876";

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

    it("should throw if payload is empty", async () => {
      editPayload = undefined;

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

    let editVariableTestMBVariableChildClass = function(
      VariableClass,
      expectedFCodes,
      notExpectedFCode,
      expectedGetSingleFCodes,
      expectedSetSingleFCode,
      expectedLength,
      expectedTypeName,
      defaultValue,
      editValue
    ) {
      let createPayload;
      let editPayload;
      let variable;
      let deviceId;
      let variableId;
      let projectDirName;
      let project;
      let className = VariableClass.name;
      let expectedGetSingleFCode = expectedGetSingleFCodes[0];
      let expectedFCode1 = expectedFCodes[0];
      let expectedFCode2 = expectedFCodes[1];
      let previousGetRequest;
      let previousSetRequest;
      let previousRequestGroups;

      beforeEach(async () => {
        projectDirName = projPath;
        deviceId = "1234";
        variableId = "000x";

        createPayload = {};
        createPayload.id = "000x";
        createPayload.name = "testVariable";
        createPayload.timeSample = 5;
        createPayload.unit = "A";
        createPayload.archived = false;
        createPayload.length = expectedLength;
        createPayload.offset = 1;
        createPayload.fCode = expectedFCode1;
        createPayload.getSingleFCode = expectedGetSingleFCode;
        createPayload.setSingleFCode = expectedSetSingleFCode;
        createPayload.type = expectedTypeName;
        createPayload.value = defaultValue;
        createPayload.archiveTimeSample = 1;

        editPayload = {};
        editPayload.id = "000x";
        editPayload.name = "editedVariable";
        editPayload.timeSample = 10;
        editPayload.unit = "B";
        editPayload.archived = true;
        editPayload.length = expectedLength;
        editPayload.offset = 2;
        editPayload.fCode = expectedFCode2;
        editPayload.getSingleFCode = expectedGetSingleFCode;
        editPayload.setSingleFCode = expectedSetSingleFCode;
        editPayload.type = expectedTypeName;
        editPayload.value = editValue;
        editPayload.archiveTimeSample = 10;

        await createInitialFiles();
      });

      let exec = async () => {
        project = new Project(projectDirName);
        await project.initFromFiles();
        variable = await project.createVariable(deviceId, createPayload);
        previousGetRequest = variable.GetSingleRequest;
        previousSetRequest = variable.SetSingleRequest;
        previousRequestGroups = variable.Device.Requests;
        return project.updateVariable(deviceId, variableId, editPayload);
      };

      it(`${className} - return edited variable`, async () => {
        let result = await exec();

        expect(result).toEqual(variable);
      });

      it(`${className} - edit variable based on given payload`, async () => {
        let result = await exec();

        expect(result.Payload).toEqual(editPayload);
      });

      it(`${className} - should throw if id in payload is different than id in method`, async () => {
        variableId = "000y";

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

      it(`${className} - should edit only time sample if only time sample is defined`, async () => {
        let editedTimeSampleValue = 100;

        editPayload = {
          timeSample: editedTimeSampleValue
        };

        let expectedPayload = { ...createPayload, ...editPayload };

        let result = await exec();

        expect(result.Payload).toEqual(expectedPayload);
      });

      it(`${className} - should edit only name if only name is defined`, async () => {
        let editName = "new test name 2";

        editPayload = {
          name: editName
        };

        let expectedPayload = { ...createPayload, ...editPayload };

        let result = await exec();

        expect(result.Payload).toEqual(expectedPayload);
      });

      it(`${className} - should edit only archive if only archive is defined`, async () => {
        let editArchive = true;

        editPayload = {
          archived: editArchive
        };

        let expectedPayload = { ...createPayload, ...editPayload };

        let result = await exec();

        expect(result.Payload).toEqual(expectedPayload);
      });

      it(`${className} - should edit only Unit if only Unit is defined`, async () => {
        let editUnit = "B";

        editPayload = {
          unit: editUnit
        };

        let expectedPayload = { ...createPayload, ...editPayload };

        let result = await exec();

        expect(result.Payload).toEqual(expectedPayload);
      });

      it(`${className} - should edit only FCode if only FCode is defined`, async () => {
        let editFCode = expectedFCode2;

        //both should be edited together with getSingleFCode
        editPayload = {
          fCode: editFCode,
          getSingleFCode: editFCode
        };

        let expectedPayload = { ...createPayload, ...editPayload };

        let result = await exec();

        expect(result.Payload).toEqual(expectedPayload);
      });

      it(`${className} - should edit only Offset if only Offset is defined`, async () => {
        let editOffset = 4;

        editPayload = {
          offset: editOffset
        };

        let expectedPayload = { ...createPayload, ...editPayload };

        let result = await exec();

        expect(result.Payload).toEqual(expectedPayload);
      });

      it(`${className} - should edit only archiveTimeSample if only archiveTimeSample is defined`, async () => {
        let editArchiveTimeSample = 15;

        editPayload = {
          archiveTimeSample: editArchiveTimeSample
        };

        let expectedPayload = { ...createPayload, ...editPayload };

        let result = await exec();

        expect(result.Payload).toEqual(expectedPayload);
      });

      it(`${className} - should edit only Value if only Value is defined`, async () => {
        let newValue = editValue;

        editPayload = {
          value: newValue
        };

        let expectedPayload = { ...createPayload, ...editPayload };

        let result = await exec();

        expect(result.Payload).toEqual(expectedPayload);
      });

      it(`${className} - should add variable to archive manager if archive is set to true and previously was set to false`, async () => {
        createPayload.archived = false;
        editPayload.archived = true;

        let result = await exec();

        let allIds = Object.keys(result.Device.ArchiveManager.Variables);

        expect(allIds).toContain(variableId);
      });

      it(`${className} - should create column in database for added variable if archive is set to true and previously was set to false`, async () => {
        createPayload.archived = false;
        editPayload.archived = true;

        let result = await exec();

        let filePath = result.Device.ArchiveManager.FilePath;
        let columnName = result.Device.ArchiveManager.getColumnName(result);
        let columnType = result.Device.ArchiveManager.getColumnType(result);

        let columnExists = await checkIfColumnExists(
          filePath,
          "data",
          columnName,
          columnType
        );

        expect(columnExists).toBeTruthy();
      });

      it(`${className} - should delete variable from archive manager if variable archive was set to true and now is set to false`, async () => {
        createPayload.archived = true;
        editPayload.archived = false;

        let result = await exec();

        let allIds = Object.keys(result.Device.ArchiveManager.Variables);

        expect(allIds).not.toContain(variableId);
      });

      it(`${className} - should not delete column if variable archive was set to true and now is set to false`, async () => {
        createPayload.archived = true;
        editPayload.archived = false;

        let result = await exec();

        let filePath = result.Device.ArchiveManager.FilePath;
        let columnName = result.Device.ArchiveManager.getColumnName(result);
        let columnType = result.Device.ArchiveManager.getColumnType(result);

        let columnExists = await checkIfColumnExists(
          filePath,
          "data",
          columnName,
          columnType
        );

        expect(columnExists).toBeTruthy();
      });

      it(`${className} - should throw if given fCode is not included in possibleFCodes`, async () => {
        editPayload.fCode = notExpectedFCode;

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

      it(`${className} - should set length to ${expectedLength} even if length is defined in payload as a different value`, async () => {
        editPayload.length = 1234;

        let result = await exec();

        expect(result.Length).toEqual(expectedLength);
      });

      it(`${className} - recreate getSingleRequest after edition`, async () => {
        let result = await exec();

        let getSingleRequest = result.GetSingleRequest;

        expect(getSingleRequest).toBeDefined();
        expect(getSingleRequest).not.toEqual(previousGetRequest);
      });

      it(`${className} - recreate setSingleRequest after edition`, async () => {
        let result = await exec();

        let setSingleRequest = result.SetSingleRequest;

        expect(setSingleRequest).toBeDefined();
        expect(setSingleRequest).not.toEqual(previousSetRequest);
      });

      for (let expectedValue of expectedGetSingleFCodes) {
        it(`${className} - should set getSingleFCode to ${expectedValue} if fCode is set to ${expectedValue} and getSingleFCode is not defined in payload`, async () => {
          delete editPayload.getSingleFCode;
          editPayload.fCode = expectedValue;
          let result = await exec();
          expect(result.GetSingleFCode).toEqual(expectedValue);
        });

        it(`${className} - should set getSingleFCode to ${expectedValue} if fCode is set to ${expectedValue} and getSingleFCode is defined in payload to a different value`, async () => {
          editPayload.getSingleFCode = 4321;
          editPayload.fCode = expectedValue;
          let result = await exec();
          expect(result.GetSingleFCode).toEqual(expectedValue);
        });
      }

      it(`${className} - should set setSingleFCode to ${expectedSetSingleFCode} if it is defined in payload as other value`, async () => {
        editPayload.setSingleFCode = 20;
        let result = await exec();
        expect(result.SetSingleFCode).toEqual(expectedSetSingleFCode);
      });

      it(`${className} - should set setSingleFCode to ${expectedSetSingleFCode} if is not defined in payload`, async () => {
        delete editPayload.setSingleFCode;
        let result = await exec();
        expect(result.SetSingleFCode).toEqual(expectedSetSingleFCode);
      });

      it(`${className} - should refresh device request groups after edition`, async () => {
        let result = await exec();
        let requestGroups = result.Device.Requests;

        expect(requestGroups).toBeDefined();
        expect(requestGroups).not.toEqual(previousRequestGroups);

        //Checking if device request contain edited variable
        let device = await project.getDevice(deviceId);
        let unitId = device.UnitId;
        let fCode = editPayload.fCode;
        let tickId = editPayload.timeSample;

        let reqExists = device.Requests[tickId].find(x => {
          let allConnectionIds = Object.keys(x.VariableConnections);
          return allConnectionIds.find(y => y === variableId);
        });

        expect(reqExists).toBeTruthy();
      });

      it(`${className} - should edit variable in device file content`, async () => {
        let result = await exec();
        let filePath = path.resolve(
          path.join(projectDirName, expectedDeviceDirName, `${deviceId}.json`)
        );
        let fileContent = JSON.parse(await readFileAsync(filePath));
        expect(fileContent.variables).toBeDefined();

        let variablePayloadFromContent = fileContent.variables.find(
          x => x.id === editPayload.id
        );
        expect(editPayload).toEqual(variablePayloadFromContent);
      });
    };

    //#region MBInt16Variable

    editVariableTestMBVariableChildClass(
      MBInt16Variable,
      [3, 4],
      1,
      [3, 4],
      16,
      1,
      "mbInt16",
      0,
      123
    );

    //#endregion MBInt16Variable
  });
});
