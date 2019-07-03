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
        type: "int16",
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
        type: "int32",
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
        type: "float",
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
        type: "boolean",
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
        type: "swappedInt32",
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
        type: "swappedFloat",
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
        type: "uInt16",
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
        type: "swappedUInt32",
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
        type: "uInt32",
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
    beforeEach;
    await clearDirectoryAsync(db2Path);
    await clearDirectoryAsync(projPath);

    if (commInterface.Initialized) {
      //ending communication with all devices if there are any
      await commInterface.stopCommunicationWithAllDevices();
      commInterface.Sampler.stop();
    }
  });

  describe("createVariable", () => {
    let variablePayload;
    let deviceId;
    let projectDirName;
    let project;

    beforeEach(async () => {
      deviceId = "1234";
      variablePayload = {};
      variablePayload.id = "000x";
      variablePayload.name = "testVariable";
      variablePayload.timeSample = 5;
      variablePayload.unit = "A";
      variablePayload.archived = false;
      variablePayload.length = 4;
      variablePayload.offset = 1;
      variablePayload.fCode = 3;
      variablePayload.getSingleFCode = 3;
      variablePayload.setSingleFCode = 16;
      variablePayload.type = "byteArray";
      variablePayload.value = [0, 0, 0, 0, 0, 0, 0, 0];
      variablePayload.archiveTimeSample = 10;
      await createInitialFiles();
    });

    let exec = async () => {
      projectDirName = projPath;
      project = new Project(projPath);
      await project.initFromFiles();

      return project.createVariable(deviceId, variablePayload);
    };

    //Common method for testing all mechanisms associated with creating MBVariable
    let createVariableTestMBVariableChildClass = function(
      VariableClass,
      expectedDefaultValue,
      expectedFCode,
      notExpectedFCode,
      expectedGetSingleFCodes,
      expectedSetSingleFCode,
      expectedLength,
      expectedTypeName
    ) {
      //Getting name of class
      let className = VariableClass.name;
      let variablePayload;
      let deviceId;
      let projectDirName;
      let project;
      let expectedGetSingleFCode;

      beforeEach(async () => {
        deviceId = "1234";
        expectedGetSingleFCode = expectedGetSingleFCodes[0];
        variablePayload = {};
        variablePayload.id = "000x";
        variablePayload.name = "testVariable";
        variablePayload.timeSample = 5;
        variablePayload.unit = "A";
        variablePayload.archived = true;
        variablePayload.length = expectedLength;
        variablePayload.offset = 1;
        variablePayload.fCode = expectedFCode;
        variablePayload.getSingleFCode = expectedGetSingleFCode;
        variablePayload.setSingleFCode = expectedSetSingleFCode;
        variablePayload.type = expectedTypeName;
        variablePayload.value = expectedDefaultValue;
        variablePayload.archiveTimeSample = 10;
        await createInitialFiles();
      });

      let exec = async () => {
        projectDirName = projPath;
        project = new Project(projPath);
        await project.initFromFiles();

        return project.createVariable(deviceId, variablePayload);
      };

      it(`${className} - should throw if deviceId is undefined`, async () => {
        deviceId = undefined;

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

      it(`${className} - should throw if there is no device of given id`, async () => {
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

      it(`${className} - should throw if there is already a variable with given id`, async () => {
        variablePayload.id = "0001";

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

      it(`${className} - should generate and return new variable`, async () => {
        let result = await exec();
        let variable = await project.getVariable(deviceId, variablePayload.id);
        expect(result).toEqual(variable);
      });

      it(`${className} - should generate variable based on given payload`, async () => {
        let result = await exec();
        expect(result.Payload).toEqual(variablePayload);
      });

      it(`${className} - should generate requests for getSingleFCode and setSingleFCode`, async () => {
        let result = await exec();
        expect(result.GetSingleRequest).toBeDefined();
        expect(result.GetSingleRequest).toBeDefined();
      });

      it(`${className} - should set default value of variable if it is not defined in payload`, async () => {
        delete variablePayload.value;
        let result = await exec();
        expect(result.Value).toEqual(expectedDefaultValue);
      });

      it(`${className} - should set new id based on payload`, async () => {
        let result = await exec();
        expect(result.Id).toEqual(variablePayload.id);
      });

      it(`${className} - should not throw but generate new id if variable id is not defined in payload`, async () => {
        delete variablePayload.id;
        let result = await exec();
        expect(result.Id).toBeDefined();
      });

      it(`${className} - should throw if payload is not defined`, async () => {
        variablePayload = undefined;

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

      it(`${className} - should throw if name is not defined`, async () => {
        delete variablePayload.name;

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

      it(`${className} - should throw if timeSample is not defined`, async () => {
        delete variablePayload.timeSample;

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

      it(`${className} - should throw if fCode is not defined`, async () => {
        delete variablePayload.fCode;

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

      it(`${className} - should throw if fCode is not inside possible dCodes`, async () => {
        variablePayload.fCode = notExpectedFCode;

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

      it(`${className} - should not throw but set unit to "" if unit is not defined`, async () => {
        delete variablePayload.unit;

        let result;

        await expect(
          new Promise(async (resolve, reject) => {
            try {
              result = await exec();
              return resolve(true);
            } catch (err) {
              return reject(err);
            }
          })
        ).resolves.toBeDefined();

        expect(result.Unit).toEqual("");
      });

      it(`${className} - should not throw but set archive to false if it is not defined`, async () => {
        delete variablePayload.archived;

        let result;

        await expect(
          new Promise(async (resolve, reject) => {
            try {
              result = await exec();
              return resolve(true);
            } catch (err) {
              return reject(err);
            }
          })
        ).resolves.toBeDefined();

        expect(result.Archived).toBeFalsy();
      });

      it(`${className} - should add variable to ArchiveManager if archive is set to true`, async () => {
        variablePayload.archived = true;
        let result = await exec();
        let device = result.Device;
        let amVariablesIds = Object.keys(device.ArchiveManager.Variables);
        expect(amVariablesIds).toContain(result.Id);
      });

      it(`${className} - should create new column in database if archive is set to true`, async () => {
        variablePayload.archived = true;
        let result = await exec();
        let device = result.Device;
        let dbFileName = device.ArchiveManager.FilePath;
        let columnName = device.ArchiveManager.getColumnName(result);
        let columnType = device.ArchiveManager.getColumnType(result);

        let columnExists = await checkIfColumnExists(
          dbFileName,
          "data",
          columnName,
          columnType
        );

        expect(columnExists).toBeTruthy();
      });

      it(`${className} - should not add variable to ArchiveManager if archive is set to false`, async () => {
        variablePayload.archived = false;
        let result = await exec();
        let device = result.Device;
        let amVariablesIds = Object.keys(device.ArchiveManager.Variables);
        expect(amVariablesIds).not.toContain(result.Id);
      });

      it(`${className} - should not create new column in database if archive is set to false`, async () => {
        variablePayload.archived = false;
        let result = await exec();
        let device = result.Device;
        let dbFileName = device.ArchiveManager.FilePath;
        let columnName = device.ArchiveManager.getColumnName(result);
        let columnType = device.ArchiveManager.getColumnType(result);

        let columnExists = await checkIfColumnExists(
          dbFileName,
          "data",
          columnName,
          columnType
        );

        expect(columnExists).toBeFalsy();
      });

      it(`${className} - should add variable to device file content`, async () => {
        let result = await exec();
        let filePath = path.resolve(
          path.join(projectDirName, expectedDeviceDirName, `${deviceId}.json`)
        );
        let fileContent = JSON.parse(await readFileAsync(filePath));
        expect(fileContent.variables).toBeDefined();

        let variablePayloadFromContent = fileContent.variables.find(
          x => x.id === variablePayload.id
        );
        expect(variablePayload).toEqual(variablePayloadFromContent);
      });

      it(`${className} - should set type to ${expectedTypeName}`, async () => {
        let result = await exec();
        expect(result.Type).toEqual(expectedTypeName);
      });

      it(`${className} - should set length to ${expectedLength} if it is defined inside payload`, async () => {
        let result = await exec();
        expect(result.Length).toEqual(expectedLength);
      });

      it(`${className} - should set length to ${expectedLength} if it is not defined inside payload`, async () => {
        let result = await exec();
        expect(result.Length).toEqual(expectedLength);
      });

      it(`${className} - should set setSingleFCode to ${expectedSetSingleFCode} if it is defined in payload as other value`, async () => {
        variablePayload.setSingleFCode = 20;
        let result = await exec();
        expect(result.SetSingleFCode).toEqual(expectedSetSingleFCode);
      });

      it(`${className} - should set setSingleFCode to ${expectedSetSingleFCode} if is not defined in payload`, async () => {
        delete variablePayload.setSingleFCode;
        let result = await exec();
        expect(result.SetSingleFCode).toEqual(expectedSetSingleFCode);
      });

      for (let expectedValue of expectedGetSingleFCodes) {
        it(`${className} - should set getSingleFCode to ${expectedValue} if fCode is set to ${expectedValue} and getSingleFCode is not defined in payload`, async () => {
          delete variablePayload.getSingleFCode;
          variablePayload.fCode = expectedValue;
          let result = await exec();
          expect(result.GetSingleFCode).toEqual(expectedValue);
        });

        it(`${className} - should set getSingleFCode to ${expectedValue} if fCode is set to ${expectedValue} and getSingleFCode is defined in payload to a different value`, async () => {
          variablePayload.getSingleFCode = 4321;
          variablePayload.fCode = expectedValue;
          let result = await exec();
          expect(result.GetSingleFCode).toEqual(expectedValue);
        });
      }
    };

    it("should throw if there is no device of given id", async () => {
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
    //#region MBBooleanVariable

    createVariableTestMBVariableChildClass(
      MBBooleanVariable,
      false,
      1,
      3,
      [1, 2],
      15,
      1,
      "boolean"
    );

    //#endregion MBBooleanVariable
  });
});
