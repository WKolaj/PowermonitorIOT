const config = require("config");
const path = require("path");
const fs = require("fs");
const MBBooleanVariable = require("../../../classes/variable/Modbus/MBBooleanVariable");
const MBByteArrayVariable = require("../../../classes/variable/Modbus/MBByteArrayVariable");
const MBFloatVariable = require("../../../classes/variable/Modbus/MBFloatVariable");
const MBInt16Variable = require("../../../classes/variable/Modbus/MBInt16Variable");
const MBInt32Variable = require("../../../classes/variable/Modbus/MBInt32Variable");
const MBSwappedFloatVariable = require("../../../classes/variable/Modbus/MBSwappedFloatVariable");
const MBSwappedInt32Variable = require("../../../classes/variable/Modbus/MBSwappedInt32Variable");
const MBSwappedUInt32Variable = require("../../../classes/variable/Modbus/MBSwappedUInt32Variable");
const MBUInt16Variable = require("../../../classes/variable/Modbus/MBUInt16Variable");
const MBUInt32Variable = require("../../../classes/variable/Modbus/MBUInt32Variable");
const {
  hashString,
  hashedStringMatch
} = require("../../../utilities/utilities");

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
} = require("../../../utilities/utilities");

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
        unit: "unit1"
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
        unit: "unit2"
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
        unit: "unit3"
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
        ]
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
        ]
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
        unit: "unit4"
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
        unit: "unit5"
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
        unit: "unit6"
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
        unit: "unit7"
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
        unit: "unit8"
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
        unit: "unit9"
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
        ]
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
        ]
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

    commInterface = require("../../../classes/commInterface/CommInterface.js");

    //have to reload also modules, that are depended on commInterface object - in order for both commInterface to be the same objects
    Project = require("../../../classes/project/Project");

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

  describe("constructor", () => {
    let projectDirectoryName;

    beforeEach(() => {
      projectDirectoryName = projPath;
    });

    let exec = () => {
      return new Project(projectDirectoryName);
    };

    it("Should create new project object and set its ProjectContentManager according to given path", async () => {
      let result = exec();
      expect(result).toBeDefined();
      expect(result.ProjectContentManager).toBeDefined();
      let absolutePath = path.resolve(projPath);
      expect(result.ProjectContentManager.ProjectAbsolutePath).toEqual(
        absolutePath
      );
    });

    it("should assing project object to its ProjectContentManager", async () => {
      let result = exec();

      expect(result.ProjectContentManager.Project).toEqual(result);
    });

    it("should assing project to commInterface", async () => {
      let result = exec();

      expect(result.CommInterface.Project).toEqual(result);
    });

    it("should assing project to Project.CurrentProject", async () => {
      let result = exec();

      expect(Project.CurrentProject).toEqual(result);
    });
  });

  describe("load", () => {
    let project;
    let projectDirName;
    let commInitPayload;
    let createDeviceDir;
    let device1Payload;
    let device2Payload;
    let device3Payload;
    let createDevice1File;
    let createDevice2File;
    let createDevice3File;
    let initCommInterfaceBasedOnPayload;
    let corruptFile2;
    let createConfigFile;
    let configFileContent;
    let user1Payload;
    let user2Payload;
    let user3Payload;
    let privateKey;

    beforeEach(async () => {
      projectDirName = projPath;
      createConfigFile = true;

      user1Payload = {
        login: "testUser1",
        password: await hashString("123456"),
        permissions: 1
      };

      user2Payload = {
        login: "testUser2",
        password: await hashString("23456"),
        permissions: 2
      };

      user3Payload = {
        login: "testUser3",
        password: await hashString("34567"),
        permissions: 3
      };

      privateKey = "testPrivateKey";

      configFileContent = {
        swVersion: getCurrentAppVersion(),
        users: [user1Payload, user2Payload, user3Payload],
        privateKey: privateKey
      };

      commInitPayload = JSON.parse(testPayload);
      createDeviceDir = true;
      //Creating copies of each device payloads
      device1Payload = JSON.parse(testPayload)["1234"];
      device2Payload = JSON.parse(testPayload)["1235"];
      device3Payload = JSON.parse(testPayload)["1236"];

      createDevice1File = true;
      createDevice2File = true;
      createDevice3File = true;
      initCommInterfaceBasedOnPayload = false;
    });

    let exec = async () => {
      if (createDeviceDir) {
        await createDirAsync(
          path.resolve(path.join(projPath, expectedDeviceDirName))
        );
      }

      if (createDeviceDir && createDevice1File) {
        await createFileAsync(
          path.resolve(
            path.join(
              projPath,
              expectedDeviceDirName,
              `${device1Payload.id}.json`
            )
          ),
          JSON.stringify(device1Payload)
        );
      }

      if (createDeviceDir && createDevice2File) {
        await createFileAsync(
          path.resolve(
            path.join(
              projPath,
              expectedDeviceDirName,
              `${device2Payload.id}.json`
            )
          ),
          JSON.stringify(device2Payload)
        );
      }

      if (createDeviceDir && createDevice3File) {
        await createFileAsync(
          path.resolve(
            path.join(
              projPath,
              expectedDeviceDirName,
              `${device3Payload.id}.json`
            )
          ),
          JSON.stringify(device3Payload)
        );
      }

      if (createDeviceDir && corruptFile2) {
        await createFileAsync(
          path.resolve(
            path.join(
              projPath,
              expectedDeviceDirName,
              `${device2Payload.id}.json`
            )
          ),
          "Content of corrupted file"
        );
      }

      if (createConfigFile) {
        await createFileAsync(
          path.resolve(path.join(projPath, expectedConfigFileName)),
          JSON.stringify(configFileContent)
        );
      }

      project = new Project(projectDirName);

      if (initCommInterfaceBasedOnPayload)
        await project.CommInterface.init(commInitPayload);
      else await project.CommInterface.init();

      return project.load();
    };

    it("should create new devices based content of all device files", async () => {
      await exec();

      let filePath1 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device1Payload.id}.json`)
      );
      let filePath2 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device2Payload.id}.json`)
      );
      let filePath3 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device3Payload.id}.json`)
      );

      let file1Content = JSON.parse(await readFileAsync(filePath1));
      let file2Content = JSON.parse(await readFileAsync(filePath2));
      let file3Content = JSON.parse(await readFileAsync(filePath3));

      expect(device1Payload).toEqual(file1Content);
      expect(device2Payload).toEqual(file2Content);
      expect(device3Payload).toEqual(file3Content);
    });

    it("should create new users based on file content", async () => {
      await exec();

      let users = Object.values(project.Users);

      let payloads = users.map(u => u.Payload);

      expect(payloads.length).toEqual(3);
      expect(payloads[0]).toEqual(user1Payload);
      expect(payloads[1]).toEqual(user2Payload);
      expect(payloads[2]).toEqual(user3Payload);
    });

    it("should not throw but not add this device if device of such Id already exists in commInterface", async () => {
      //Initializing comm interface only with device of id 1235
      delete commInitPayload["1234"];
      delete commInitPayload["1236"];
      commInitPayload["1235"].name =
        "New test name different than given in file";
      initCommInterfaceBasedOnPayload = true;

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

      let filePath1 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device1Payload.id}.json`)
      );
      let filePath2 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device2Payload.id}.json`)
      );
      let filePath3 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device3Payload.id}.json`)
      );

      let file1Content = JSON.parse(await readFileAsync(filePath1));
      let file2Content = JSON.parse(await readFileAsync(filePath2));
      let file3Content = JSON.parse(await readFileAsync(filePath3));

      //Checking all files despite file2
      expect(device1Payload).toEqual(file1Content);
      expect(device3Payload).toEqual(file3Content);

      //Device2 should still be accessible - as initialized previously
      let device2 = project.CommInterface.getDevice("1235");

      expect(device2).toBeDefined();
      //Device2 content should be different than content of file2 - name changed on the begning
      expect(device2.Payload).not.toEqual(file2Content);
      expect(device2.Payload).toEqual(commInitPayload["1235"]);
    });

    it("should not throw but not add this device if device file is corrupted", async () => {
      corruptFile2 = true;

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

      //Checking all files despite file2
      let filePath1 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device1Payload.id}.json`)
      );
      let filePath3 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device3Payload.id}.json`)
      );

      let file1Content = JSON.parse(await readFileAsync(filePath1));
      let file3Content = JSON.parse(await readFileAsync(filePath3));

      expect(device1Payload).toEqual(file1Content);
      expect(device3Payload).toEqual(file3Content);

      //Device2 should not be accessible
      let device2Exists = await project.CommInterface.doesDeviceExist("1235");

      expect(device2Exists).toBeFalsy();
    });

    it("should load config file content to application if it does not have any mistakes in content", async () => {
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

    it("should throw if sw version of project is different than app version", async () => {
      configFileContent.swVersion = "x.x.x";

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

    it("should throw if there is no config file", async () => {
      createConfigFile = false;

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

  describe("save", () => {
    let project;
    let projectDirName;
    let commInitPayload;
    let createConfigFile;
    let configFileContent;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      createDeviceDir = true;
      createConfigFile = false;
      device1Payload = commInitPayload["1234"];
      device2Payload = commInitPayload["1235"];
      device3Payload = commInitPayload["1236"];

      await createDirAsync(
        path.resolve(path.join(projPath, expectedDeviceDirName))
      );
    });

    let exec = async () => {
      if (createConfigFile) {
        await createFileAsync(
          path.resolve(path.join(projPath, expectedConfigFileName)),
          "initial config file contnet"
        );
      }
      project = new Project(projectDirName);

      await project.CommInterface.init(commInitPayload);

      project.PrivateKey = "1234567";

      await project.createUser({
        login: "user1",
        password: await hashString("123"),
        permissions: 1
      });

      await project.createUser({
        login: "user2",
        password: await hashString("234"),
        permissions: 2
      });

      await project.createUser({
        login: "user3",
        password: await hashString("345"),
        permissions: 3
      });

      configFileContent = await project.ProjectContentManager._getConfigFileContentFromProject();

      return project.save();
    };

    it("should create new device files for all devices", async () => {
      await exec();

      let filePath1 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device1Payload.id}.json`)
      );
      let filePath2 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device2Payload.id}.json`)
      );
      let filePath3 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device3Payload.id}.json`)
      );

      let file1Content = JSON.parse(await readFileAsync(filePath1));
      let file2Content = JSON.parse(await readFileAsync(filePath2));
      let file3Content = JSON.parse(await readFileAsync(filePath3));

      expect(device1Payload).toEqual(file1Content);
      expect(device2Payload).toEqual(file2Content);
      expect(device3Payload).toEqual(file3Content);
    });

    it("should override existing file if it exists", async () => {
      deviceId = "1235";

      let filePath = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${deviceId}.json`)
      );

      //creating file
      await createFileAsync(filePath, "test content");

      await exec();

      let filePath1 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device1Payload.id}.json`)
      );
      let filePath2 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device2Payload.id}.json`)
      );
      let filePath3 = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device3Payload.id}.json`)
      );

      let file1Content = JSON.parse(await readFileAsync(filePath1));
      let file2Content = JSON.parse(await readFileAsync(filePath2));
      let file3Content = JSON.parse(await readFileAsync(filePath3));

      expect(device1Payload).toEqual(file1Content);
      expect(device2Payload).toEqual(file2Content);
      expect(device3Payload).toEqual(file3Content);
    });

    it("should create new config file - if it doesn't exists and write new config file content from project", async () => {
      createConfigFile = false;

      await exec();

      let configFilePath = path.resolve(
        path.join(projPath, expectedConfigFileName)
      );
      let fileExists = await checkIfFileExistsAsync(configFilePath);
      expect(fileExists).toBeTruthy();

      let configFileContentFromFile = JSON.parse(
        await readFileAsync(configFilePath)
      );

      expect(configFileContentFromFile).toMatchObject(configFileContent);
    });

    it("should not create new config file but override old one - if it exists", async () => {
      createConfigFile = true;

      await exec();

      let configFilePath = path.resolve(
        path.join(projPath, expectedConfigFileName)
      );
      let fileExists = await checkIfFileExistsAsync(configFilePath);
      expect(fileExists).toBeTruthy();

      let configFileContentFromFile = JSON.parse(
        await readFileAsync(configFilePath)
      );

      expect(configFileContentFromFile).toMatchObject(configFileContent);
    });
  });

  describe("initFromFiles", () => {
    let project;
    let projectDirName;
    let configFilePath;
    let deviceDirPath;
    let device1FilePath;
    let device2FilePath;
    let device3FilePath;
    let commInterfacePayload;

    let createProjectDir;
    let createConfigFile;
    let createDeviceDir;
    let createDevice1File;
    let createDevice2File;
    let createDevice3File;

    let configFileContent;

    let device1FilePayload;
    let device2FilePayload;
    let device3FilePayload;

    let corruptDevice2File;
    let user1Payload;
    let user2Payload;
    let user3Payload;
    let privateKey;

    beforeEach(async () => {
      commInterfacePayload = JSON.parse(testPayload);
      device1FilePayload = commInterfacePayload["1234"];
      device2FilePayload = commInterfacePayload["1235"];
      device3FilePayload = commInterfacePayload["1236"];
      projectDirName = path.join(projPath, "testProjectDir");
      configFilePath = path.resolve(
        path.join(projectDirName, expectedConfigFileName)
      );
      deviceDirPath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName)
      );
      device1FilePath = path.resolve(
        path.join(deviceDirPath, `${device1FilePayload.id}.json`)
      );
      device2FilePath = path.resolve(
        path.join(deviceDirPath, `${device2FilePayload.id}.json`)
      );
      device3FilePath = path.resolve(
        path.join(deviceDirPath, `${device3FilePayload.id}.json`)
      );
      createProjectDir = true;
      createConfigFile = true;
      createDeviceDir = true;
      createDevice1File = true;
      createDevice2File = true;
      createDevice3File = true;
      corruptDevice2File = false;

      user1Payload = {
        login: "testUser1",
        password: await hashString("123456"),
        permissions: 1
      };

      user2Payload = {
        login: "testUser2",
        password: await hashString("23456"),
        permissions: 2
      };

      user3Payload = {
        login: "testUser3",
        password: await hashString("34567"),
        permissions: 3
      };

      privateKey = "testPrivateKey";

      configFileContent = {
        swVersion: getCurrentAppVersion(),
        users: [user1Payload, user2Payload, user3Payload],
        privateKey: privateKey
      };
    });

    let exec = async () => {
      if (createProjectDir) {
        await createDirAsync(projectDirName);
      }

      if (createConfigFile) {
        await createFileAsync(
          configFilePath,
          JSON.stringify(configFileContent)
        );
      }

      if (createDeviceDir) {
        await createDirAsync(deviceDirPath);
      }

      if (createDevice1File) {
        await createFileAsync(
          device1FilePath,
          JSON.stringify(device1FilePayload)
        );
      }

      if (createDevice2File) {
        await createFileAsync(
          device2FilePath,
          JSON.stringify(device2FilePayload)
        );
      }

      if (createDevice3File) {
        await createFileAsync(
          device3FilePath,
          JSON.stringify(device3FilePayload)
        );
      }

      if (corruptDevice2File) {
        await createFileAsync(device2FilePath, "corrupted file content");
      }

      project = new Project(projectDirName);

      return project.initFromFiles();
    };

    it("should initialize project content according to files content", async () => {
      await exec();

      let expectPayload = commInterfacePayload;

      expect(project.CommInterface.Payload).toEqual(expectPayload);

      //Checking other properties
      expect(project.Users).toBeDefined();

      for (let userFromFile of configFileContent.users) {
        let userFromProject = await project.getUser(userFromFile.login);
        expect(userFromProject.Payload).toEqual(userFromFile);
      }

      expect(project.PrivateKey).toEqual(configFileContent.privateKey);
    });

    it("should initialize project content according to files content - even if one file is corrupted", async () => {
      corruptDevice2File = true;

      await exec();

      let expectPayload = {
        "1234": commInterfacePayload["1234"],
        "1236": commInterfacePayload["1236"]
      };

      expect(project.CommInterface.Payload).toEqual(expectPayload);

      //Checking other properties
      expect(project.Users).toBeDefined();

      for (let userFromFile of configFileContent.users) {
        let userFromProject = await project.getUser(userFromFile.login);
        expect(userFromProject.Payload).toEqual(userFromFile);
      }

      expect(project.PrivateKey).toEqual(configFileContent.privateKey);
    });

    it("should initialize project content even if there are no device files", async () => {
      createDevice1File = false;
      createDevice2File = false;
      createDevice3File = false;

      await exec();

      let expectPayload = {};

      expect(project.CommInterface.Payload).toEqual(expectPayload);

      //Checking other properties
      expect(project.Users).toBeDefined();

      for (let userFromFile of configFileContent.users) {
        let userFromProject = await project.getUser(userFromFile.login);
        expect(userFromProject.Payload).toEqual(userFromFile);
      }

      expect(project.PrivateKey).toEqual(configFileContent.privateKey);
    });

    it("should throw if config file is corrupted", async () => {
      configFileContent.swVersion = "x.x.x";

      expect(
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

    it("should not throw if device folder does not exist - when config file exists", async () => {
      createDeviceDir = false;
      createDevice1File = false;
      createDevice2File = false;
      createDevice3File = false;

      expect(
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

    it("should create project directory, config file and device directory if they do not exists", async () => {
      createDeviceDir = false;
      createProjectDir = false;
      createConfigFile = false;
      createDevice1File = false;
      createDevice2File = false;
      createDevice3File = false;

      await exec();

      let projectDirExists = await checkIfDirectoryExistsAsync(projectDirName);
      let configFileExists = await checkIfFileExistsAsync(configFilePath);
      let deviceDirExists = await checkIfDirectoryExistsAsync(deviceDirPath);

      expect(projectDirExists).toBeTruthy();
      expect(configFileExists).toBeTruthy();
      expect(deviceDirExists).toBeTruthy();
    });

    it("should not throw and create config file and deviceDir even if projectDir already exists", async () => {
      createDeviceDir = false;
      createProjectDir = true;
      createConfigFile = false;
      createDevice1File = false;
      createDevice2File = false;
      createDevice3File = false;

      await exec();

      let projectDirExists = await checkIfDirectoryExistsAsync(projectDirName);
      let configFileExists = await checkIfFileExistsAsync(configFilePath);
      let deviceDirExists = await checkIfDirectoryExistsAsync(deviceDirPath);

      expect(projectDirExists).toBeTruthy();
      expect(configFileExists).toBeTruthy();
      expect(deviceDirExists).toBeTruthy();
    });

    it("should create config file with appropriate payload if config file, project dir and device dir do not exist", async () => {
      createDeviceDir = false;
      createProjectDir = false;
      createConfigFile = false;
      createDevice1File = false;
      createDevice2File = false;
      createDevice3File = false;

      await exec();

      let configFilePath = path.resolve(
        path.join(projectDirName, expectedConfigFileName)
      );

      let configFileContent = JSON.parse(await readFileAsync(configFilePath));

      let expectedConfigFile = {
        swVersion: getCurrentAppVersion(),
        users: [project.Users["admin"].Payload],
        privateKey: project.PrivateKey
      };

      expect(configFileContent).toEqual(expectedConfigFile);
    });

    it("should initialize commInterface if config file, project dir and device dir do not exist", async () => {
      createDeviceDir = false;
      createProjectDir = false;
      createConfigFile = false;
      createDevice1File = false;
      createDevice2File = false;
      createDevice3File = false;

      await exec();

      expect(project.CommInterface.Initialized).toBeTruthy();
    });
  });

  describe("saveDevice", () => {
    let project;
    let projectDirName;
    let commInitPayload;
    let deviceId;
    let createDeviceDir;
    let createDeviceFileBefore;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      createDeviceDir = true;
      device1Payload = commInitPayload["1234"];
      device2Payload = commInitPayload["1235"];
      device3Payload = commInitPayload["1236"];
      deviceId = "1235";
      createDeviceDir = true;
      createDeviceFileBefore = false;
    });

    let exec = async () => {
      if (createDeviceDir) {
        await createDirAsync(
          path.resolve(path.join(projPath, expectedDeviceDirName))
        );
      }

      if (createDeviceFileBefore) {
        let filePath = path.resolve(
          path.join(projPath, expectedDeviceDirName, `${deviceId}.json`)
        );

        //creating file
        await createFileAsync(filePath, "test content");
      }

      project = new Project(projectDirName);

      await project.CommInterface.init(commInitPayload);

      return project.saveDevice(deviceId);
    };

    it("should create new device file based on device payload in project", async () => {
      deviceId = "1235";

      await exec();

      let device = commInterface.getDevice(deviceId);

      let filePath = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${deviceId}.json`)
      );
      let fileContent = JSON.parse(await readFileAsync(filePath));

      expect(device.Payload).toMatchObject(fileContent);
    });

    it("should create new device file based on device payload in project even if device dir does not exist", async () => {
      createDeviceDir = false;
      deviceId = "1235";

      await exec();

      let device = commInterface.getDevice(deviceId);

      let filePath = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${deviceId}.json`)
      );
      let fileContent = JSON.parse(await readFileAsync(filePath));

      expect(device.Payload).toMatchObject(fileContent);
    });

    it("should override existing file if it exists", async () => {
      createDeviceFileBefore = true;
      deviceId = "1235";

      let filePath = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${deviceId}.json`)
      );

      await exec();

      let device = commInterface.getDevice(deviceId);

      let fileContent = JSON.parse(await readFileAsync(filePath));

      expect(device.Payload).toMatchObject(fileContent);
    });

    it("should throw if there is no device of given id", async () => {
      deviceId = "5432";

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

  describe("loadDevice", () => {
    let project;
    let projectDirName;
    let commInitPayload;
    let createDeviceDir;
    let device1Payload;
    let device2Payload;
    let device3Payload;
    let createDevice1File;
    let createDevice2File;
    let createDevice3File;
    let deviceId;
    let initCommInterfaceBasedOnPayload;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      createDeviceDir = true;
      device1Payload = commInitPayload["1234"];
      device2Payload = commInitPayload["1235"];
      device3Payload = commInitPayload["1236"];
      createDevice1File = true;
      createDevice2File = true;
      createDevice3File = true;
      deviceId = "1235";
      initCommInterfaceBasedOnPayload = false;
    });

    let exec = async () => {
      if (createDeviceDir) {
        await createDirAsync(
          path.resolve(path.join(projPath, expectedDeviceDirName))
        );
      }

      if (createDeviceDir && createDevice1File) {
        await createFileAsync(
          path.resolve(
            path.join(
              projPath,
              expectedDeviceDirName,
              `${device1Payload.id}.json`
            )
          ),
          JSON.stringify(device1Payload)
        );
      }

      if (createDeviceDir && createDevice2File) {
        await createFileAsync(
          path.resolve(
            path.join(
              projPath,
              expectedDeviceDirName,
              `${device2Payload.id}.json`
            )
          ),
          JSON.stringify(device2Payload)
        );
      }

      if (createDeviceDir && createDevice3File) {
        await createFileAsync(
          path.resolve(
            path.join(
              projPath,
              expectedDeviceDirName,
              `${device3Payload.id}.json`
            )
          ),
          JSON.stringify(device3Payload)
        );
      }

      project = new Project(projectDirName);

      if (initCommInterfaceBasedOnPayload)
        await project.CommInterface.init(commInitPayload);
      else await project.CommInterface.init();

      return project.loadDevice(deviceId);
    };

    it("should create new device based on file content", async () => {
      deviceId = "1235";

      await exec();

      let device = commInterface.getDevice(deviceId);

      expect(device).toBeDefined();
      expect(device.Payload).toMatchObject(device2Payload);
    });

    it("should throw if device of such Id already exists in commInterface", async () => {
      deviceId = "1235";

      //Initializing based on payload - already loading all devices
      initCommInterfaceBasedOnPayload = true;

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

    it("should throw if there is no file for given device", async () => {
      deviceId = "1235";

      createDevice2File = false;
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

  describe("getDevice", () => {
    let project;
    let projectDirName;
    let commInitPayload;
    let initProject;
    let deviceId;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      initProject = true;
      deviceId = "1235";
    });

    let exec = async () => {
      //Creating initial files based on testPayload;
      await createInitialFiles();

      project = new Project(projectDirName);

      if (initProject) await project.initFromFiles();

      return project.getDevice(deviceId);
    };

    it("should return device of given id", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      let devicePayload = commInitPayload[deviceId];
      expect(result.Payload).toEqual(devicePayload);
    });

    it("should throw if device of given id does not exist", async () => {
      deviceId = "8765";

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

  describe("getAllDevices", () => {
    let project;
    let projectDirName;
    let commInitPayload;
    let initProject;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      initProject = true;
      //Creating initial files based on testPayload;
      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);

      if (initProject) await project.initFromFiles();

      return project.getAllDevices();
    };

    it("should return all devices if there are some", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result.length).toEqual(3);

      let device1 = await project.getDevice("1234");
      let device2 = await project.getDevice("1235");
      let device3 = await project.getDevice("1236");

      expect(result).toContain(device1);
      expect(result).toContain(device2);
      expect(result).toContain(device3);
    });

    it("should return [] if there are no devices", async () => {
      //clearing device directory
      let deviceDirPath = path.resolve(
        path.resolve(projectDirName, expectedDeviceDirName)
      );
      await clearDirectoryAsync(deviceDirPath);

      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });

  describe("deleteDevice", () => {
    let project;
    let projectDirName;
    let commInitPayload;
    let deviceToDelete;
    let deviceId;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      initProject = true;
      deviceId = "1235";
      //Creating initial files based on testPayload;
      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);

      await project.initFromFiles();

      deviceToDelete = await project.getDevice(deviceId);

      return project.deleteDevice(deviceId);
    };

    it("should delete Device if it exists", async () => {
      let result = await exec();

      let allDevices = await project.getAllDevices();

      expect(allDevices).toBeDefined();
      expect(allDevices.length).toEqual(2);

      let device1 = await project.getDevice("1234");
      let device3 = await project.getDevice("1236");

      expect(allDevices).toContain(device1);
      expect(allDevices).toContain(device3);
    });

    it("should return deleted device", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(deviceToDelete);
    });

    it("should remove device file from deviceDir", async () => {
      await exec();

      let deviceDirPath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName)
      );
      let deviceDirExists = await checkIfDirectoryExistsAsync(deviceDirPath);
      expect(deviceDirExists).toBeTruthy();

      let deviceFilePath = path.resolve(
        path.join(deviceDirPath, `${deviceId}.json`)
      );
      let deviceFileExists = await checkIfFileExistsAsync(deviceFilePath);
      expect(deviceFileExists).toBeFalsy();
    });

    it("should throw if device of given id does not exist", async () => {
      deviceId = "8765";

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

    it("should throw if deviceid is empty", async () => {
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

    it("should throw if there are no devices in project", async () => {
      //clearing device directory
      let deviceDirPath = path.resolve(
        path.resolve(projectDirName, expectedDeviceDirName)
      );
      await clearDirectoryAsync(deviceDirPath);

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

  describe("updateDevice", () => {
    let project;
    let projectDirName;
    let initProject;
    let initPayload;
    let deviceId;
    let editPayload;
    let editId;
    let editName;
    let editIsActive;
    let editTimeout;
    let editIpAdress;
    let editUnitId;
    let editPortNumber;
    let editVariables;
    let editCalcElements;
    let initDriver;
    let initVariables;
    let initCalcElements;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      initProject = true;

      editId = undefined;
      editName = "Modified device";
      editIsActive = false;
      editTimeout = 4000;
      editIpAdress = "192.168.0.17";
      editUnitId = 5;
      editPortNumber = 602;
      editVariables = undefined;
      editCalcElements = undefined;

      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
    });

    let exec = async () => {
      //Creating initial files based on testPayload;
      await createInitialFiles(initPayload);

      project = new Project(projectDirName);

      if (initProject) await project.initFromFiles();

      editPayload = {
        id: editId,
        name: editName,
        isActive: editIsActive,
        timeout: editTimeout,
        ipAdress: editIpAdress,
        unitId: editUnitId,
        portNumber: editPortNumber,
        variables: editVariables,
        calculationElements: editCalcElements
      };

      initDriver = (await project.getDevice(deviceId)).MBDriver;
      initVariables = Object.values(
        (await project.getDevice(deviceId)).Variables
      );
      initCalcElements = Object.values(
        (await project.getDevice(deviceId)).CalculationElements
      );

      return project.updateDevice(deviceId, editPayload);
    };

    it("should edit device of given id according to given payload", async () => {
      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);
      expect(editedDevice.Name).toEqual(editName);
      expect(editedDevice.IsActive).toEqual(editIsActive);
      expect(editedDevice.Timeout).toEqual(editTimeout);
      expect(editedDevice.IPAdress).toEqual(editIpAdress);
      expect(editedDevice.UnitId).toEqual(editUnitId);
      expect(editedDevice.PortNumber).toEqual(editPortNumber);
    });

    it("should return edited device", async () => {
      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(result).toEqual(editedDevice);
    });

    it("should not edit variables even if they are given in payload", async () => {
      editVariables = [
        {
          id: "0010",
          timeSample: 2,
          name: "test variable 10",
          offset: 5,
          length: 1,
          fCode: 3,
          value: 1,
          type: "int32",
          archived: true,
          getSingleFCode: 3,
          setSingleFCode: 16
        },
        {
          id: "0011",
          timeSample: 3,
          name: "test variable 11",
          offset: 7,
          length: 2,
          fCode: 4,
          value: 2,
          type: "float",
          archived: true,
          getSingleFCode: 4,
          setSingleFCode: 16
        }
      ];

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.Name).toEqual(editName);
      expect(editedDevice.IsActive).toEqual(editIsActive);
      expect(editedDevice.Timeout).toEqual(editTimeout);
      expect(editedDevice.IPAdress).toEqual(editIpAdress);
      expect(editedDevice.UnitId).toEqual(editUnitId);
      expect(editedDevice.PortNumber).toEqual(editPortNumber);
      expect(editedDevice.Payload.variables).toBeDefined();
      expect(editedDevice.Payload.variables).toMatchObject(
        initPayload[deviceId].variables
      );
    });

    it("should not edit variables even if they are given in payload as empty array", async () => {
      editVariables = [];

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.Name).toEqual(editName);
      expect(editedDevice.IsActive).toEqual(editIsActive);
      expect(editedDevice.Timeout).toEqual(editTimeout);
      expect(editedDevice.IPAdress).toEqual(editIpAdress);
      expect(editedDevice.UnitId).toEqual(editUnitId);
      expect(editedDevice.PortNumber).toEqual(editPortNumber);
      expect(editedDevice.Payload.variables).toBeDefined();
      expect(editedDevice.Payload.variables).toMatchObject(
        initPayload[deviceId].variables
      );
    });

    it("should not edit calcElements even if they are given in payload", async () => {
      editCalcElements = [
        {
          id: "3001",
          type: "sumElement",
          archived: true,
          sampleTime: 1,
          name: "sumElement1",
          unit: "C",
          variables: []
        },
        {
          id: "3002",
          type: "sumElement",
          archived: true,
          sampleTime: 2,
          name: "sumElement2",
          unit: "D",
          variables: []
        }
      ];

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.Name).toEqual(editName);
      expect(editedDevice.IsActive).toEqual(editIsActive);
      expect(editedDevice.Timeout).toEqual(editTimeout);
      expect(editedDevice.IPAdress).toEqual(editIpAdress);
      expect(editedDevice.UnitId).toEqual(editUnitId);
      expect(editedDevice.PortNumber).toEqual(editPortNumber);
      expect(editedDevice.Payload.calculationElements).toBeDefined();
      expect(editedDevice.Payload.calculationElements).toMatchObject(
        initPayload[deviceId].calculationElements
      );
    });

    it("should not edit calcElements even if they are given in payload as empty array", async () => {
      editCalcElements = [];

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.Name).toEqual(editName);
      expect(editedDevice.IsActive).toEqual(editIsActive);
      expect(editedDevice.Timeout).toEqual(editTimeout);
      expect(editedDevice.IPAdress).toEqual(editIpAdress);
      expect(editedDevice.UnitId).toEqual(editUnitId);
      expect(editedDevice.PortNumber).toEqual(editPortNumber);
      expect(editedDevice.Payload.calculationElements).toBeDefined();
      expect(editedDevice.Payload.calculationElements).toMatchObject(
        initPayload[deviceId].calculationElements
      );
    });

    it("should create completly new MBDriver object if edited parameters are associated with driver - Timeout", async () => {
      editId = undefined;
      editName = undefined;
      editIsActive = undefined;
      editTimeout = 4000;
      editIpAdress = undefined;
      editUnitId = undefined;
      editPortNumber = undefined;
      editVariables = undefined;

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.MBDriver).toBeDefined();
      expect(editedDevice.MBDriver).not.toEqual(initDriver);
      //Only timeout should be edited
      expect(editedDevice.Timeout).toEqual(editTimeout);

      //Rest should stay the same
      expect(editedDevice.IPAdress).toEqual(initPayload[deviceId].ipAdress);
      expect(editedDevice.UnitId).toEqual(initPayload[deviceId].unitId);
      expect(editedDevice.PortNumber).toEqual(initPayload[deviceId].portNumber);
    });

    it("should create completly new MBDriver object if edited parameters are associated with driver - IPAdress", async () => {
      editId = undefined;
      editName = undefined;
      editIsActive = undefined;
      editTimeout = undefined;
      editIpAdress = "192.168.0.1";
      editUnitId = undefined;
      editPortNumber = undefined;
      editVariables = undefined;

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.MBDriver).toBeDefined();
      expect(editedDevice.MBDriver).not.toEqual(initDriver);

      expect(editedDevice.Timeout).toEqual(initPayload[deviceId].timeout);
      expect(editedDevice.IPAdress).toEqual(editIpAdress);
      expect(editedDevice.UnitId).toEqual(initPayload[deviceId].unitId);
      expect(editedDevice.PortNumber).toEqual(initPayload[deviceId].portNumber);
    });

    it("should create completly new MBDriver object if edited parameters are associated with driver - UnitId", async () => {
      editId = undefined;
      editName = undefined;
      editIsActive = undefined;
      editTimeout = undefined;
      editIpAdress = undefined;
      editUnitId = 123;
      editPortNumber = undefined;
      editVariables = undefined;

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.MBDriver).toBeDefined();
      expect(editedDevice.MBDriver).not.toEqual(initDriver);

      expect(editedDevice.Timeout).toEqual(initPayload[deviceId].timeout);
      expect(editedDevice.IPAdress).toEqual(initPayload[deviceId].ipAdress);
      expect(editedDevice.UnitId).toEqual(editUnitId);
      expect(editedDevice.PortNumber).toEqual(initPayload[deviceId].portNumber);
    });

    it("should create completly new MBDriver object if edited parameters are associated with driver - PortNumber", async () => {
      editId = undefined;
      editName = undefined;
      editIsActive = undefined;
      editTimeout = undefined;
      editIpAdress = undefined;
      editUnitId = undefined;
      editPortNumber = 123;
      editVariables = undefined;

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.MBDriver).toBeDefined();
      expect(editedDevice.MBDriver).not.toEqual(initDriver);

      expect(editedDevice.Timeout).toEqual(initPayload[deviceId].timeout);
      expect(editedDevice.IPAdress).toEqual(initPayload[deviceId].ipAdress);
      expect(editedDevice.UnitId).toEqual(initPayload[deviceId].unitId);
      expect(editedDevice.PortNumber).toEqual(editPortNumber);
    });

    it("should start communication when isActive is set to true and previosly was false and change was not associated with driver ", async () => {
      editIsActive = true;

      editTimeout = undefined;
      editIpAdress = undefined;
      editUnitId = undefined;
      editPortNumber = undefined;

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.IsActive).toBeTruthy();

      //Can be called several times - if device is active and sampler invoke tick before connection was established
      expect(editedDevice.MBDriver._client.connectTCP).toHaveBeenCalled();

      for (
        let i = 0;
        i < editedDevice.MBDriver._client.connectTCP.mock.calls.length;
        i++
      ) {
        expect(
          editedDevice.MBDriver._client.connectTCP.mock.calls[i][0]
        ).toEqual(initPayload[deviceId].ipAdress);
        expect(
          editedDevice.MBDriver._client.connectTCP.mock.calls[i][1]
        ).toMatchObject({ port: initPayload[deviceId].portNumber });
      }
    });

    it("should start communication when isActive is set to true and previosly was false and change was associated with driver ", async () => {
      editIsActive = true;

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.IsActive).toBeTruthy();

      //Can be called several times - if device is active and sampler invoke tick before connection was established
      expect(editedDevice.MBDriver._client.connectTCP).toHaveBeenCalled();

      for (
        let i = 0;
        i < editedDevice.MBDriver._client.connectTCP.mock.calls.length;
        i++
      ) {
        expect(
          editedDevice.MBDriver._client.connectTCP.mock.calls[i][0]
        ).toEqual(editIpAdress);
        expect(
          editedDevice.MBDriver._client.connectTCP.mock.calls[i][1]
        ).toMatchObject({ port: editPortNumber });
      }
    });

    it("should not start communication when isActive is set to true and previosly was true and change was not associated with driver ", async () => {
      initPayload[deviceId].isActive = true;
      editIsActive = true;

      editTimeout = undefined;
      editIpAdress = undefined;
      editUnitId = undefined;
      editPortNumber = undefined;

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.IsActive).toBeTruthy();

      //Shouldn't be called more than once
      expect(editedDevice.MBDriver._client.connectTCP).toHaveBeenCalledTimes(1);
    });

    it("should restart communication when isActive is set to true and previosly was true but change was associated with driver ", async () => {
      initPayload[deviceId].isActive = true;
      editIsActive = true;

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);

      expect(editedDevice.IsActive).toBeTruthy();

      //Should call disconnect of old driver
      expect(initDriver._client.close).toHaveBeenCalledTimes(1);

      //Should call connect to new driver
      expect(editedDevice.MBDriver._client.connectTCP).toHaveBeenCalled();

      for (
        let i = 0;
        i < editedDevice.MBDriver._client.connectTCP.mock.calls.length;
        i++
      ) {
        expect(
          editedDevice.MBDriver._client.connectTCP.mock.calls[i][0]
        ).toEqual(editIpAdress);
        expect(
          editedDevice.MBDriver._client.connectTCP.mock.calls[i][1]
        ).toMatchObject({ port: editPortNumber });
      }

      //Disconnect should be called before new connect
      expect(initDriver._client.close).toHaveBeenCalledBefore(
        editedDevice.MBDriver._client.connectTCP
      );
    });

    it("should not recreate all variables but reassing their driver when recreating driver", async () => {
      initPayload[deviceId].isActive = true;
      editIsActive = true;

      let result = await exec();

      let editedDevice = await project.getDevice(deviceId);
      let newVariables = Object.values(editedDevice.Variables);

      expect(newVariables).toBeDefined();
      expect(newVariables.length).toBeDefined();
      expect(newVariables.length).toEqual(initVariables.length);

      for (let variable of newVariables) {
        //GetSingleRequest and SetSingleRequest drivers must equal to new driver
        expect(variable.GetSingleRequest.MBDriver).toEqual(
          editedDevice.MBDriver
        );
        expect(variable.SetSingleRequest.MBDriver).toEqual(
          editedDevice.MBDriver
        );

        //Variables should be the same - only their parameters changes
        expect(initVariables).toContain(variable);
      }

      //Variables payload should be equal

      let oldVariablesPayload = initVariables.map(variable => variable.Payload);
      let newVariablesPayload = newVariables.map(variable => variable.Payload);

      expect(newVariablesPayload).toBeDefined();
      expect(newVariablesPayload).toMatchObject(oldVariablesPayload);
    });

    it("should reassign all variables drivers when recreating it", async () => {
      initPayload[deviceId].isActive = true;
      editIsActive = true;

      let result = await exec();

      let editedDevice = commInterface.getDevice(deviceId);
      let newVariables = Object.values(editedDevice.Variables);

      expect(newVariables).toBeDefined();
      expect(newVariables.length).toBeDefined();
      expect(newVariables.length).toEqual(initVariables.length);

      for (let variable of newVariables) {
        //GetSingleRequest and SetSingleRequest drivers must equal to new driver
        expect(variable.GetSingleRequest.MBDriver).toEqual(
          editedDevice.MBDriver
        );
        expect(variable.SetSingleRequest.MBDriver).toEqual(
          editedDevice.MBDriver
        );

        //Variables should be edited but it shouldn't be different
        expect(initVariables).toContain(variable);
      }

      //Variables payload should be equal

      let oldVariablesPayload = initVariables.map(variable => variable.Payload);
      let newVariablesPayload = newVariables.map(variable => variable.Payload);

      expect(newVariablesPayload).toBeDefined();
      expect(newVariablesPayload).toMatchObject(oldVariablesPayload);
    });

    it("should throw if there is no device of given id", async () => {
      deviceId = "8765";

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should not change id if id is different in payload and in argument", async () => {
      editId = "8765";

      let result = await exec();

      expect(result.Id).toBeDefined();
      expect(result.Id).toEqual(deviceId);
    });
  });

  describe("createDevice", () => {
    let project;
    let projectDirName;
    let commInitPayload;
    let mbDevicePayload;
    let pac3200TCPPayload;
    let createPAC3200TCP;
    let createMBDevice;
    let initProject;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      initProject = true;
      mbDevicePayload = {
        id: "1237",
        name: "test device 4",
        isActive: false,
        timeout: 2000,
        ipAdress: "192.168.0.4",
        unitId: 2,
        portNumber: 602,
        variables: [
          {
            id: "0101",
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
            unit: "unit7"
          },
          {
            id: "0102",
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
            unit: "unit8"
          },
          {
            id: "0103",
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
            unit: "unit9"
          }
        ],
        calculationElements: [
          {
            id: "4001",
            type: "sumElement",
            archived: true,
            sampleTime: 1,
            name: "sumElement1",
            unit: "C",
            variables: [
              {
                id: "0102",
                factor: 1
              },
              {
                id: "0103",
                factor: 2
              }
            ]
          },
          {
            id: "4002",
            type: "sumElement",
            archived: true,
            sampleTime: 2,
            name: "sumElement2",
            unit: "D",
            variables: [
              {
                id: "0101",
                factor: 2
              },
              {
                id: "0102",
                factor: 3
              }
            ]
          }
        ],
        type: "mbDevice"
      };
      pac3200TCPPayload = {
        id: "1237",
        name: "testPACdevice",
        ipAdress: "192.168.1.5",
        portNumber: 502,
        timeout: 500,
        unitId: 5,
        type: "PAC3200TCP",
        isActive: false
      };
      //Creating initial files based on testPayload;
      await createInitialFiles();

      createMBDevice = true;
      createPAC3200TCP = false;
    });

    let exec = async () => {
      project = new Project(projectDirName);

      if (initProject) await project.initFromFiles();

      if (createPAC3200TCP) {
        return project.createDevice(pac3200TCPPayload);
      }

      return project.createDevice(mbDevicePayload);
    };

    it("should create mbDevice based on given payload and add it to project", async () => {
      let result = await exec();

      //One additional device should be added
      let allDevices = await project.getAllDevices();

      expect(allDevices.length).toEqual(4);

      let device1 = await project.getDevice("1234");
      let device2 = await project.getDevice("1235");
      let device3 = await project.getDevice("1236");
      let device4 = await project.getDevice("1237");

      expect(allDevices).toContain(device1);
      expect(allDevices).toContain(device2);
      expect(allDevices).toContain(device3);
      expect(allDevices).toContain(device4);

      //Checking if device was creating properly
      expect(device4.Payload).toEqual(mbDevicePayload);
    });

    it("should save created mbDevice to new device file", async () => {
      await exec();

      let deviceFilePath = path.resolve(
        path.join(
          projectDirName,
          expectedDeviceDirName,
          `${mbDevicePayload.id}.json`
        )
      );

      let fileExists = await checkIfFileExistsAsync(deviceFilePath);
      expect(fileExists).toBeTruthy();

      let fileContent = JSON.parse(await readFileAsync(deviceFilePath));
      expect(fileContent).toEqual(mbDevicePayload);
    });

    it("should overwrite device file if it exists", async () => {
      let deviceDirPath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName)
      );
      let deviceFilePath = path.resolve(
        path.join(deviceDirPath, `${mbDevicePayload.id}.json`)
      );

      await createFileAsync(deviceFilePath, "test content");

      await exec();

      let fileExists = await checkIfFileExistsAsync(deviceFilePath);
      expect(fileExists).toBeTruthy();

      let fileContent = JSON.parse(await readFileAsync(deviceFilePath));
      expect(fileContent).toEqual(mbDevicePayload);
    });

    it("should return created mbDevice", async () => {
      let result = await exec();

      let device = await project.getDevice(mbDevicePayload.id);
      expect(result).toEqual(device);
    });

    it("should connect created mbDevice if isActive is true", async () => {
      mbDevicePayload.isActive = true;
      let result = await exec();

      let device = await project.getDevice(mbDevicePayload.id);
      //waiting for device to connect to modbus mock class
      await snooze(1000);
      expect(device.IsActive).toBeTruthy();
      expect(device.Connected).toBeTruthy();
      //Connect can be called several times - depending on the time when device is activated

      expect(device.MBDriver._client.connectTCP).toHaveBeenCalled();
      let allCalls = device.MBDriver._client.connectTCP.mock.calls;

      for (let call of allCalls) {
        expect(call[0]).toEqual(mbDevicePayload.ipAdress);
        expect(call[1]).toEqual({
          port: mbDevicePayload.portNumber
        });
      }
    });

    it("should not connect created mbDevice if isActive is false", async () => {
      mbDevicePayload.isActive = false;
      let result = await exec();

      let device = await project.getDevice(mbDevicePayload.id);
      //waiting for device to connect to modbus mock class
      await snooze(1000);
      expect(device.IsActive).toBeFalsy();
      expect(device.Connected).toBeFalsy();
      expect(device.MBDriver._client.connectTCP).not.toHaveBeenCalled();
    });

    it("should not connect created mbDevice if isActive is undefined", async () => {
      mbDevicePayload.isActive = undefined;
      let result = await exec();

      let device = await project.getDevice(mbDevicePayload.id);
      //waiting for device to connect to modbus mock class
      await snooze(1000);
      expect(device.IsActive).toBeFalsy();
      expect(device.Connected).toBeFalsy();
      expect(device.MBDriver._client.connectTCP).not.toHaveBeenCalled();
    });

    it("should create mbDevice based on given payload if mbDevice has no variables defined", async () => {
      mbDevicePayload.variables = undefined;

      //varaible arrays of calcElement should also be empty - there are do varaibles to connect to calc element
      for (let element of mbDevicePayload.calculationElements) {
        element.variables = [];
      }

      let result = await exec();

      //Expected payload should have empty variables array
      mbDevicePayload.variables = [];

      let device = await project.getDevice(mbDevicePayload.id);
      expect(device.Payload).toEqual(mbDevicePayload);

      //The same payload should be stored inside device file
      let deviceFilePath = path.resolve(
        path.join(
          projectDirName,
          expectedDeviceDirName,
          `${mbDevicePayload.id}.json`
        )
      );

      let fileExists = await checkIfFileExistsAsync(deviceFilePath);
      expect(fileExists).toBeTruthy();

      let fileContent = JSON.parse(await readFileAsync(deviceFilePath));
      expect(fileContent).toEqual(mbDevicePayload);
    });

    it("should create mbDevice based on given payload if mbDevice has empty variables array", async () => {
      mbDevicePayload.variables = [];

      //varaible arrays of calcElement should also be empty - there are do varaibles to connect to calc element
      for (let element of mbDevicePayload.calculationElements) {
        element.variables = [];
      }

      let result = await exec();

      let device = await project.getDevice(mbDevicePayload.id);
      expect(device.Payload).toEqual(mbDevicePayload);

      //The same payload should be stored inside device file
      let deviceFilePath = path.resolve(
        path.join(
          projectDirName,
          expectedDeviceDirName,
          `${mbDevicePayload.id}.json`
        )
      );

      let fileExists = await checkIfFileExistsAsync(deviceFilePath);
      expect(fileExists).toBeTruthy();

      let fileContent = JSON.parse(await readFileAsync(deviceFilePath));
      expect(fileContent).toEqual(mbDevicePayload);
    });

    it("should create mbDevice based on given payload if mbDevice has no calc elements defined", async () => {
      mbDevicePayload.calculationElements = undefined;

      let result = await exec();

      //Expected payload should have empty calculationElements array
      mbDevicePayload.calculationElements = [];

      let device = await project.getDevice(mbDevicePayload.id);
      expect(device.Payload).toEqual(mbDevicePayload);

      //The same payload should be stored inside device file
      let deviceFilePath = path.resolve(
        path.join(
          projectDirName,
          expectedDeviceDirName,
          `${mbDevicePayload.id}.json`
        )
      );

      let fileExists = await checkIfFileExistsAsync(deviceFilePath);
      expect(fileExists).toBeTruthy();

      let fileContent = JSON.parse(await readFileAsync(deviceFilePath));
      expect(fileContent).toEqual(mbDevicePayload);
    });

    it("should create mbDevice based on given payload if mbDevice has empty calculationElements array", async () => {
      mbDevicePayload.calculationElements = [];

      let result = await exec();

      let device = await project.getDevice(mbDevicePayload.id);
      expect(device.Payload).toEqual(mbDevicePayload);

      //The same payload should be stored inside device file
      let deviceFilePath = path.resolve(
        path.join(
          projectDirName,
          expectedDeviceDirName,
          `${mbDevicePayload.id}.json`
        )
      );

      let fileExists = await checkIfFileExistsAsync(deviceFilePath);
      expect(fileExists).toBeTruthy();

      let fileContent = JSON.parse(await readFileAsync(deviceFilePath));
      expect(fileContent).toEqual(mbDevicePayload);
    });

    it("should set mbDevice id if it is given in payload", async () => {
      let result = await exec();
      let idOfDevice = result.Id;

      expect(idOfDevice).toBeDefined();
      expect(idOfDevice).toEqual(mbDevicePayload.id);
    });

    it("should generate and set mbDevice id if it is not given in payload", async () => {
      mbDevicePayload.id = undefined;

      let result = await exec();

      let idOfDevice = result.Id;

      expect(idOfDevice).toBeDefined();

      //Device should be accessible via this id
      let deviceFromProject = await project.getDevice(idOfDevice);

      expect(result).toEqual(deviceFromProject);
    });

    it("should throw if mbDevice payload is not correct - name is not defined", async () => {
      mbDevicePayload.name = undefined;

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        mbDevicePayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if mbDevice payload is not correct - ipAddress is not defined", async () => {
      mbDevicePayload.ipAdress = undefined;

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        mbDevicePayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if mbDevice payload is not correct - timeout is not defined", async () => {
      mbDevicePayload.timeout = undefined;

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        mbDevicePayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if mbDevice payload is not correct - unitId is not defined", async () => {
      mbDevicePayload.unitId = undefined;

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        mbDevicePayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if mbDevice payload is not correct - portNumber is not defined", async () => {
      mbDevicePayload.portNumber = undefined;

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        mbDevicePayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if mbDevice payload is not correct - one of varaibles have invalid payload", async () => {
      let corruptedPayload = {
        type: "float"
      };

      mbDevicePayload.variables.push(corruptedPayload);

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        mbDevicePayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if mbDevice payload is not correct - one of calculationElements has invalid payload", async () => {
      let corruptedPayload = {
        type: "sumElement"
      };

      mbDevicePayload.calculationElements.push(corruptedPayload);

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        mbDevicePayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if mbDevice payload is not correct - one of variable have already defined id", async () => {
      let corruptedPayload = {
        id: "0103",
        timeSample: 4,
        name: "corrupted test variable ",
        offset: 15,
        length: 2,
        fCode: 3,
        value: 9,
        type: "uInt32",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "unit9"
      };

      mbDevicePayload.variables.push(corruptedPayload);

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        mbDevicePayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if mbDevice payload is not correct - one of calculationElements have already defined id", async () => {
      let corruptedPayload = {
        id: "4002",
        type: "sumElement",
        archived: true,
        sampleTime: 2,
        name: "corrupted element",
        unit: "D",
        variables: [
          {
            id: "0101",
            factor: 2
          },
          {
            id: "0102",
            factor: 3
          }
        ]
      };

      mbDevicePayload.variables.push(corruptedPayload);

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        mbDevicePayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if project has not been initialized", async () => {
      initProject = false;

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

    it("should throw if device of given id already exists", async () => {
      mbDevicePayload.id = "1234";

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

    it("should throw if type is not recognized", async () => {
      mbDevicePayload.type = "corruptedType";

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

    it("should create PAC3200TCP based on given payload and add it to project", async () => {
      createPAC3200TCP = true;

      let result = await exec();

      //One additional device should be added
      let allDevices = await project.getAllDevices();

      expect(allDevices.length).toEqual(4);

      let device1 = await project.getDevice("1234");
      let device2 = await project.getDevice("1235");
      let device3 = await project.getDevice("1236");
      let device4 = await project.getDevice("1237");

      expect(allDevices).toContain(device1);
      expect(allDevices).toContain(device2);
      expect(allDevices).toContain(device3);
      expect(allDevices).toContain(device4);

      //Checking if device was creating properly - variables and calculationElement were already added to payload object while generation
      let devicePayload = device4.Payload;
      expect(devicePayload).toEqual(pac3200TCPPayload);
    });

    it("should set appropriate PAC3200TCP variables if variables are not defined inside payload", async () => {
      createPAC3200TCP = true;

      let result = await exec();

      let PAC3200VariablesSchema = result._getVariablesSchema();

      let allVariableNames = Object.keys(PAC3200VariablesSchema);

      let allVariables = Object.values(result.Variables);

      for (let varName of allVariableNames) {
        let varPayload = PAC3200VariablesSchema[varName];

        let variable = allVariables.find(variable => variable.Name === varName);

        expect(variable).toBeDefined();
        expect(variable.Id).toBeDefined();
        expect(variable.Name).toEqual(varName);

        expect(variable.TimeSample).toEqual(varPayload.timeSample);
        expect(variable.Offset).toEqual(varPayload.offset);
        expect(variable.Length).toEqual(varPayload.length);
        expect(variable.FCode).toEqual(varPayload.fCode);
        expect(variable.Value).toEqual(varPayload.value);
        expect(variable.Type).toEqual(varPayload.type);
        expect(variable.Archived).toEqual(varPayload.archived);
        expect(variable.Unit).toEqual(varPayload.unit);
      }
    });

    it("should set appropriate PAC3200TCP calcElements if calcElements are not defined inside payload", async () => {
      createPAC3200TCP = true;

      let result = await exec();

      let PAC3200VariablesSchema = result._getVariablesSchema();

      let PAC3200ElementsSchema = result._getCalculationElementsSchema(
        PAC3200VariablesSchema
      );

      let allElementNames = Object.keys(PAC3200ElementsSchema);

      let allElements = Object.values(result.CalculationElements);

      for (let elName of allElementNames) {
        let elPayload = PAC3200ElementsSchema[elName];

        let element = allElements.find(element => element.Name === elName);

        expect(element).toBeDefined();
        expect(element.Id).toBeDefined();
        expect(element.Name).toEqual(elName);

        expect(element.SampleTime).toEqual(elPayload.sampleTime);
        expect(element.CalculationInterval).toEqual(
          elPayload.calculationInterval
        );
        expect(element.Factor).toEqual(elPayload.factor);
        expect(element.Archived).toEqual(elPayload.archived);
        expect(element.TypeName).toEqual(elPayload.type);
      }
    });

    it("should save created PAC3200TCP to device file", async () => {
      createPAC3200TCP = true;

      await exec();

      let deviceFilePath = path.resolve(
        path.join(
          projectDirName,
          expectedDeviceDirName,
          `${mbDevicePayload.id}.json`
        )
      );

      let fileExists = await checkIfFileExistsAsync(deviceFilePath);
      expect(fileExists).toBeTruthy();

      let fileContent = JSON.parse(await readFileAsync(deviceFilePath));
      expect(fileContent).toEqual(pac3200TCPPayload);
    });

    it("should overwrite PAC3200TCP device file if it exists", async () => {
      createPAC3200TCP = true;

      let deviceDirPath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName)
      );
      let deviceFilePath = path.resolve(
        path.join(deviceDirPath, `${pac3200TCPPayload.id}.json`)
      );

      await createFileAsync(deviceFilePath, "test content");

      await exec();

      let fileExists = await checkIfFileExistsAsync(deviceFilePath);
      expect(fileExists).toBeTruthy();

      let fileContent = JSON.parse(await readFileAsync(deviceFilePath));
      expect(fileContent).toEqual(pac3200TCPPayload);
    });

    it("should return created PAC3200TCP", async () => {
      createPAC3200TCP = true;

      let result = await exec();

      let device = await project.getDevice(pac3200TCPPayload.id);
      expect(result).toEqual(device);
    });

    it("should connect created PAC3200TCP if isActive is true", async () => {
      createPAC3200TCP = true;

      pac3200TCPPayload.isActive = true;
      let result = await exec();

      let device = await project.getDevice(pac3200TCPPayload.id);
      //waiting for device to connect to modbus mock class
      await snooze(1000);
      expect(device.IsActive).toBeTruthy();
      expect(device.Connected).toBeTruthy();
      //can be called several times - depending on the time when connect was called - sampling variables before device is connected

      expect(device.MBDriver._client.connectTCP).toHaveBeenCalled();
      let allCalls = device.MBDriver._client.connectTCP.mock.calls;

      for (let call of allCalls) {
        expect(call[0]).toEqual(pac3200TCPPayload.ipAdress);
        expect(call[1]).toEqual({
          port: pac3200TCPPayload.portNumber
        });
      }
    });

    it("should not connect created PAC3200TCP if isActive is false", async () => {
      createPAC3200TCP = true;

      pac3200TCPPayload.isActive = false;
      let result = await exec();

      let device = await project.getDevice(pac3200TCPPayload.id);
      //waiting for device to connect to modbus mock class
      await snooze(1000);
      expect(device.IsActive).toBeFalsy();
      expect(device.Connected).toBeFalsy();
      expect(device.MBDriver._client.connectTCP).not.toHaveBeenCalled();
    });

    it("should not connect created PAC3200TCP if isActive is undefined", async () => {
      createPAC3200TCP = true;

      pac3200TCPPayload.isActive = undefined;
      let result = await exec();

      let device = await project.getDevice(pac3200TCPPayload.id);
      //waiting for device to connect to modbus mock class
      await snooze(1000);
      expect(device.IsActive).toBeFalsy();
      expect(device.Connected).toBeFalsy();
      expect(device.MBDriver._client.connectTCP).not.toHaveBeenCalled();
    });

    it("should set PAC3200TCP id if it is given in payload", async () => {
      createPAC3200TCP = true;
      let result = await exec();
      let idOfDevice = result.Id;

      expect(idOfDevice).toBeDefined();
      expect(idOfDevice).toEqual(pac3200TCPPayload.id);
    });

    it("should generate and set PAC3200TCP id if it is not given in payload", async () => {
      createPAC3200TCP = true;
      pac3200TCPPayload.id = undefined;

      let result = await exec();

      let idOfDevice = result.Id;

      expect(idOfDevice).toBeDefined();

      //Device should be accessible via this id
      let deviceFromProject = await project.getDevice(idOfDevice);

      expect(result).toEqual(deviceFromProject);
    });

    it("should set appropriate PAC3200TCP variables according to payload if they are given", async () => {
      createPAC3200TCP = true;

      pac3200TCPPayload.variables = [
        {
          id: "5001",
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
          unit: "unit1"
        },
        {
          id: "5002",
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
          unit: "unit2"
        },
        {
          id: "5003",
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
          unit: "unit3"
        }
      ];

      let result = await exec();

      //One additional device should be added
      let allDevices = await project.getAllDevices();

      expect(allDevices.length).toEqual(4);

      let device1 = await project.getDevice("1234");
      let device2 = await project.getDevice("1235");
      let device3 = await project.getDevice("1236");
      let device4 = await project.getDevice("1237");

      expect(allDevices).toContain(device1);
      expect(allDevices).toContain(device2);
      expect(allDevices).toContain(device3);
      expect(allDevices).toContain(device4);

      //Checking if device was creating properly

      //created payload will containt also empty array of calculation elements
      pac3200TCPPayload.calculationElements = [];

      expect(device4.Payload).toEqual(pac3200TCPPayload);
    });

    it("should set appropriate PAC3200TCP calculation elements according to payload if they are given", async () => {
      createPAC3200TCP = true;

      pac3200TCPPayload.calculationElements = [
        {
          id: "3001",
          type: "sumElement",
          archived: true,
          sampleTime: 1,
          name: "sumElement1",
          unit: "C",
          variables: []
        },
        {
          id: "3002",
          type: "sumElement",
          archived: true,
          sampleTime: 2,
          name: "sumElement2",
          unit: "D",
          variables: []
        }
      ];

      let result = await exec();

      //One additional device should be added
      let allDevices = await project.getAllDevices();

      expect(allDevices.length).toEqual(4);

      let device1 = await project.getDevice("1234");
      let device2 = await project.getDevice("1235");
      let device3 = await project.getDevice("1236");
      let device4 = await project.getDevice("1237");

      expect(allDevices).toContain(device1);
      expect(allDevices).toContain(device2);
      expect(allDevices).toContain(device3);
      expect(allDevices).toContain(device4);

      //Checking if device was creating properly

      //created payload will containt also empty array of variables
      pac3200TCPPayload.variables = [];

      expect(device4.Payload).toEqual(pac3200TCPPayload);
    });

    it("should throw if PAC3200TCP payload is not correct - name is not defined", async () => {
      createPAC3200TCP = true;
      pac3200TCPPayload.name = undefined;

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        pac3200TCPPayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if PAC3200TCP payload is not correct - ipAddress is not defined", async () => {
      createPAC3200TCP = true;
      pac3200TCPPayload.ipAdress = undefined;

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        pac3200TCPPayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if PAC3200TCP payload is not correct - timeout is not defined", async () => {
      createPAC3200TCP = true;
      pac3200TCPPayload.timeout = undefined;

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        pac3200TCPPayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if PAC3200TCP payload is not correct - unitId is not defined", async () => {
      createPAC3200TCP = true;
      pac3200TCPPayload.unitId = undefined;

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        pac3200TCPPayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });

    it("should throw if PAC3200TCP payload is not correct - portNumber is not defined", async () => {
      createPAC3200TCP = true;
      pac3200TCPPayload.portNumber = undefined;

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

      //New device should not have been added
      let doesDeviceExist = await project.CommInterface.doesDeviceExist(
        pac3200TCPPayload.id
      );
      expect(doesDeviceExist).toBeFalsy();
    });
  });

  describe("getVariable", () => {
    let project;
    let projectDirName;
    let deviceId;
    let variableId;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1235";
      variableId = "0005";

      //Creating initial files based on testPayload;
      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      return project.getVariable(deviceId, variableId);
    };

    it("should return variable if it exists", async () => {
      let result = await exec();

      let device = await project.getDevice(deviceId);

      expect(result).toEqual(device.Variables[variableId]);
    });

    it("should throw if device does not exists", async () => {
      deviceId = "8765";

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

    it("should throw if variable does not exists", async () => {
      variableId = "8765";

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

  describe("deleteVariable", () => {
    let project;
    let projectDirName;
    let deviceId;
    let variableId;
    let variableToRemove;
    let initialVariablesCount;
    let projectPayload;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1235";
      variableId = "0005";
      projectPayload = JSON.parse(testPayload);
      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      initialVariablesCount = Object.keys(
        project.CommInterface.Devices[deviceId].Variables
      ).length;
      variableToRemove =
        project.CommInterface.Devices[deviceId].Variables[variableId];

      return project.deleteVariable(deviceId, variableId);
    };

    it("should remove variable of given id", async () => {
      let result = await exec();

      let deviceVariableIds = Object.keys(
        project.CommInterface.Devices[deviceId].Variables
      );

      expect(deviceVariableIds).not.toContain(variableId);
    });

    it("should return removed variable", async () => {
      let result = await exec();

      expect(result).toEqual(variableToRemove);
    });

    it("should throw and not delete variable if device does not exist", async () => {
      deviceId = "8765";

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

    it("should throw if variable does not exists", async () => {
      variableId = "8765";

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

      expect((await project.getAllVariables(deviceId)).length).toEqual(
        initialVariablesCount
      );
    });

    it("should remove variable from archive manager", async () => {
      let variable = await exec();

      let device = await project.getDevice(deviceId);

      let doesArchiveManagerContaintsValue = device.ArchiveManager.doesVariableIdExists(
        variable.Id
      );

      expect(doesArchiveManagerContaintsValue).toBeFalsy();
    });

    it("should not remove column of variable", async () => {
      let variable = await exec();

      let filePath = variable.Device.ArchiveManager.FilePath;
      let columnName = variable.Device.ArchiveManager.getColumnName(variable);
      let columnType = variable.Device.ArchiveManager.getColumnType(variable);

      let columnExists = await checkIfColumnExists(
        filePath,
        "data",
        columnName,
        columnType
      );
      expect(columnExists).toBeTruthy();
    });

    it("should remove variable from device file", async () => {
      let variable = await exec();

      let deviceFilePath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName, `${deviceId}.json`)
      );

      let deviceFileContent = JSON.parse(await readFileAsync(deviceFilePath));

      let allVariableIds = deviceFileContent.variables.map(
        variable => variable.id
      );

      let allPayloadVariableIds = projectPayload[deviceId].variables.map(
        variable => variable.id
      );

      //There should be one variable less than before
      expect(allVariableIds.length).toEqual(allPayloadVariableIds.length - 1);

      for (let id of allPayloadVariableIds) {
        if (id === variableId) {
          expect(allVariableIds).not.toContain(id);
        } else {
          expect(allVariableIds).toContain(id);
        }
      }
    });
  });

  describe("getAllVariables", () => {
    let project;
    let projectDirName;
    let deviceId;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1235";

      //Creating initial files based on testPayload;
      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      return project.getAllVariables(deviceId);
    };

    it("should return all variables", async () => {
      let result = await exec();

      let resultIds = result.map(variable => variable.Id);

      let device = await project.getDevice(deviceId);

      let allVariableIds = Object.keys(device.Variables);

      expect(resultIds.length).toEqual(allVariableIds.length);

      for (let variableId of allVariableIds) {
        expect(resultIds).toContain(variableId);
      }
    });

    it("should return empty array if there are no variables in device", async () => {
      //Removing variables from device file
      let deviceFilePath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName, `${deviceId}.json`)
      );

      let deviceFileContent = JSON.parse(await readFileAsync(deviceFilePath));

      delete deviceFileContent.variables;

      await createFileAsync(deviceFilePath, JSON.stringify(deviceFileContent));

      let result = await exec();

      expect(result).toEqual([]);
    });

    it("should throw if device does not exist", async () => {
      deviceId = "8765";

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

  describe("getCalcElement", () => {
    let project;
    let projectDirName;
    let deviceId;
    let calcElementId;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1236";
      calcElementId = "3001";

      //Creating initial files based on testPayload;
      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      return project.getCalcElement(deviceId, calcElementId);
    };

    it("should return calcElement if it exists", async () => {
      let result = await exec();

      let device = await project.getDevice(deviceId);

      expect(result).toEqual(device.CalculationElements[calcElementId]);
    });

    it("should throw if device does not exists", async () => {
      deviceId = "8765";

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

    it("should throw if calcElement does not exists", async () => {
      calcElementId = "8765";

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

  describe("deleteCalcElement", () => {
    let project;
    let projectDirName;
    let deviceId;
    let calcElementId;
    let calcElementToRemove;
    let initialCalcElementCount;
    let projectPayload;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1236";
      calcElementId = "3001";
      projectPayload = JSON.parse(testPayload);
      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      initialCalcElementCount = Object.keys(
        project.CommInterface.Devices[deviceId].CalculationElements
      ).length;
      calcElementToRemove =
        project.CommInterface.Devices[deviceId].CalculationElements[
          calcElementId
        ];

      return project.deleteCalcElement(deviceId, calcElementId);
    };

    it("should remove caclElement of given id", async () => {
      let result = await exec();

      let deviceCalcElementIds = Object.keys(
        project.CommInterface.Devices[deviceId].CalculationElements
      );

      expect(deviceCalcElementIds).not.toContain(calcElementId);
    });

    it("should return removed calculationElement", async () => {
      let result = await exec();

      expect(result).toEqual(calcElementToRemove);
    });

    it("should throw and not delete calcElement if device does not exist", async () => {
      deviceId = "8765";

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

    it("should throw if calcElement does not exists", async () => {
      calcElementId = "8765";

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

      expect((await project.getAllCalcElements(deviceId)).length).toEqual(
        initialCalcElementCount
      );
    });

    it("should remove calcElement from archive manager", async () => {
      let calcElement = await exec();

      let device = await project.getDevice(deviceId);

      let doesArchiveManagerContaintsValue = device.ArchiveManager.doesVariableIdExists(
        calcElement.Id
      );

      expect(doesArchiveManagerContaintsValue).toBeFalsy();
    });

    it("should not remove column of caclElement", async () => {
      let calcElement = await exec();

      let filePath = calcElement.Device.ArchiveManager.FilePath;
      let columnName = calcElement.Device.ArchiveManager.getColumnNameOfCalculationElement(
        calcElement
      );
      let columnType = calcElement.Device.ArchiveManager.getColumnTypeCalculationElement(
        calcElement
      );

      let columnExists = await checkIfColumnExists(
        filePath,
        "data",
        columnName,
        columnType
      );
      expect(columnExists).toBeTruthy();
    });

    it("should remove calcElement from device file", async () => {
      await exec();

      let deviceFilePath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName, `${deviceId}.json`)
      );

      let deviceFileContent = JSON.parse(await readFileAsync(deviceFilePath));

      let allCalcElementsIds = deviceFileContent.calculationElements.map(
        caclElement => caclElement.id
      );

      let allPayloadCalcElementsIds = projectPayload[
        deviceId
      ].calculationElements.map(caclElement => caclElement.id);

      //There should be one variable less than before
      expect(allCalcElementsIds.length).toEqual(
        allPayloadCalcElementsIds.length - 1
      );

      for (let id of allPayloadCalcElementsIds) {
        if (id === calcElementId) {
          expect(allCalcElementsIds).not.toContain(id);
        } else {
          expect(allCalcElementsIds).toContain(id);
        }
      }
    });
  });

  describe("getAllCalcElements", () => {
    let project;
    let projectDirName;
    let deviceId;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1236";

      //Creating initial files based on testPayload;
      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      return project.getAllCalcElements(deviceId);
    };

    it("should return all calculationElements", async () => {
      let result = await exec();

      let resultIds = result.map(calcElement => calcElement.Id);

      let device = await project.getDevice(deviceId);

      let allCalcElementIds = Object.keys(device.CalculationElements);

      expect(resultIds.length).toEqual(allCalcElementIds.length);

      for (let variableId of allCalcElementIds) {
        expect(resultIds).toContain(variableId);
      }
    });

    it("should return empty array if there are no calculationElements in device", async () => {
      //Removing calculationElements from device file
      let deviceFilePath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName, `${deviceId}.json`)
      );

      let deviceFileContent = JSON.parse(await readFileAsync(deviceFilePath));

      delete deviceFileContent.calculationElements;

      await createFileAsync(deviceFilePath, JSON.stringify(deviceFileContent));

      let result = await exec();

      expect(result).toEqual([]);
    });

    it("should throw if device does not exist", async () => {
      deviceId = "8765";

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

  describe("getAllValues", () => {
    let project;
    let projectDirName;

    let deviceId;
    let device1Id;
    let device1Name;
    let deviceType;
    let device1Adress;
    let device1PortNumber;
    let device1Timeout;
    let device1UnitId;
    let device1IsActive;
    let device1Payload;

    let device1Variables;

    let variable1Payload;
    let variable1Id;
    let variable1TimeSample;
    let variable1Name;
    let variable1Type;
    let variable1Offset;
    let variable1FCode;
    let variable1Value;

    let variable2Payload;
    let variable2Id;
    let variable2TimeSample;
    let variable2Name;
    let variable2Type;
    let variable2Offset;
    let variable2FCode;
    let variable2Value;

    let variable3Payload;
    let variable3Id;
    let variable3TimeSample;
    let variable3Name;
    let variable3Type;
    let variable3Offset;
    let variable3FCode;
    let variable3Value;

    let sumElement1Payload;
    let sumElement1Id;
    let sumElement1SampleTime;
    let sumElement1Name;
    let sumElement1Type;
    let sumElement1Archived;
    let sumElement1Value;

    let sumElement2Payload;
    let sumElement2Id;
    let sumElement2SampleTime;
    let sumElement2Name;
    let sumElement2Type;
    let sumElement2Archived;
    let sumElement2Value;

    let addVariable1;
    let addVariable2;
    let addVariable3;
    let addSumElement1;
    let addSumElement2;

    beforeEach(async () => {
      projectDirName = projPath;

      device1Id = "1234";
      device1Name = "test device 1";
      deviceType = "mbDevice";
      device1Adress = "192.168.0.1";
      device1PortNumber = 502;
      device1Timeout = 2000;
      device1UnitId = 1;
      device1IsActive = false;

      deviceId = device1Id;

      variable1Id = "0001";
      variable1TimeSample = 2;
      variable1Name = "test variable 1";
      variable1Type = "int16";
      variable1Offset = 5;
      variable1FCode = 3;
      variable1Value = 1;

      variable2Id = "0002";
      variable2TimeSample = 3;
      variable2Name = "test variable 2";
      variable2Type = "int32";
      variable2Offset = 6;
      variable2FCode = 4;
      variable2Value = 2;

      variable3Id = "0003";
      variable3TimeSample = 4;
      variable3Name = "test variable 3";
      variable3Type = "float";
      variable3Offset = 7;
      variable3FCode = 16;
      variable3Value = 3;

      sumElement1Id = "1001";
      sumElement1SampleTime = 1;
      sumElement1Name = "sumElement1";
      sumElement1Type = "sumElement";
      sumElement1Archived = false;
      sumElement1Value = 123;

      sumElement2Id = "1002";
      sumElement2SampleTime = 2;
      sumElement2Name = "sumElement2";
      sumElement2Type = "sumElement";
      sumElement2Archived = false;
      sumElement2Value = 321;

      addVariable1 = true;
      addVariable2 = true;
      addVariable3 = true;
      addSumElement1 = true;
      addSumElement2 = true;
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();

      variable1Payload = {
        id: variable1Id,
        timeSample: variable1TimeSample,
        name: variable1Name,
        type: variable1Type,
        offset: variable1Offset,
        fCode: variable1FCode,
        value: variable1Value
      };

      variable2Payload = {
        id: variable2Id,
        timeSample: variable2TimeSample,
        name: variable2Name,
        type: variable2Type,
        offset: variable2Offset,
        fCode: variable2FCode,
        value: variable2Value
      };

      variable3Payload = {
        id: variable3Id,
        timeSample: variable3TimeSample,
        name: variable3Name,
        type: variable3Type,
        offset: variable3Offset,
        fCode: variable3FCode,
        value: variable3Value
      };

      sumElement1Payload = {
        id: sumElement1Id,
        name: sumElement1Name,
        type: sumElement1Type,
        archived: sumElement1Archived,
        sampleTime: sumElement1SampleTime
      };

      sumElement2Payload = {
        id: sumElement2Id,
        name: sumElement2Name,
        type: sumElement2Type,
        archived: sumElement2Archived,
        sampleTime: sumElement2SampleTime
      };

      device1Variables = [];

      if (addVariable1) device1Variables.push(variable1Payload);
      if (addVariable2) device1Variables.push(variable2Payload);
      if (addVariable3) device1Variables.push(variable3Payload);

      device1CalculationElements = [];

      if (addSumElement1) device1CalculationElements.push(sumElement1Payload);
      if (addSumElement2) device1CalculationElements.push(sumElement2Payload);

      device1Payload = {
        id: device1Id,
        name: device1Name,
        type: deviceType,
        ipAdress: device1Adress,
        portNumber: device1PortNumber,
        timeout: device1Timeout,
        unitId: device1UnitId,
        isActive: device1IsActive,
        variables: device1Variables,
        calculationElements: device1CalculationElements
      };

      device1 = await project.createDevice(device1Payload);

      if (addSumElement1 && sumElement1Value)
        device1.CalculationElements[sumElement1Id].Value = sumElement1Value;

      if (addSumElement2 && sumElement2Value)
        device1.CalculationElements[sumElement2Id].Value = sumElement2Value;

      return project.getAllValues(deviceId);
    };

    it("should return all variableIds and calculationElement ids and their values", async () => {
      let result = await exec();

      let validResult = {
        "0001": 1,

        "0002": 2,

        "0003": 3,

        "1001": 123,

        "1002": 321
      };

      expect(result).toBeDefined();
      expect(result).toEqual(validResult);
    });

    it("should throw if there is no device of given id", async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();

      expect(
        new Promise(async (resolve, reject) => {
          try {
            await project.getAllValues("8765");
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should return empty object if device does not have any variables and calcElements", async () => {
      addVariable1 = false;
      addVariable2 = false;
      addVariable3 = false;
      addSumElement1 = false;
      addSumElement2 = false;

      let result = await exec();

      let validResult = {};

      expect(result).toBeDefined();
      expect(result).toEqual(validResult);
    });

    it("should return valid object if device has only calcElements", async () => {
      addVariable1 = false;
      addVariable2 = false;
      addVariable3 = false;

      let result = await exec();

      let validResult = {
        "1001": 123,

        "1002": 321
      };

      expect(result).toBeDefined();
      expect(result).toEqual(validResult);
    });

    it("should return valid object if device has only variables", async () => {
      addSumElement1 = false;
      addSumElement2 = false;

      let result = await exec();

      let validResult = {
        "0001": 1,

        "0002": 2,

        "0003": 3
      };
      expect(result).toBeDefined();
      expect(result).toEqual(validResult);
    });
  });

  describe("getValue", () => {
    let project;
    let projectDirName;

    let deviceId;
    let elementId;

    let device1Id;
    let device1Name;
    let deviceType;
    let device1Adress;
    let device1PortNumber;
    let device1Timeout;
    let device1UnitId;
    let device1IsActive;
    let device1Payload;

    let device1Variables;

    let variable1Payload;
    let variable1Id;
    let variable1TimeSample;
    let variable1Name;
    let variable1Type;
    let variable1Offset;
    let variable1FCode;
    let variable1Value;

    let variable2Payload;
    let variable2Id;
    let variable2TimeSample;
    let variable2Name;
    let variable2Type;
    let variable2Offset;
    let variable2FCode;
    let variable2Value;

    let variable3Payload;
    let variable3Id;
    let variable3TimeSample;
    let variable3Name;
    let variable3Type;
    let variable3Offset;
    let variable3FCode;
    let variable3Value;

    let sumElement1Payload;
    let sumElement1Id;
    let sumElement1SampleTime;
    let sumElement1Name;
    let sumElement1Type;
    let sumElement1Archived;
    let sumElement1Value;

    let sumElement2Payload;
    let sumElement2Id;
    let sumElement2SampleTime;
    let sumElement2Name;
    let sumElement2Type;
    let sumElement2Archived;
    let sumElement2Value;

    let addVariable1;
    let addVariable2;
    let addVariable3;
    let addSumElement1;
    let addSumElement2;

    beforeEach(async () => {
      projectDirName = projPath;

      device1Id = "1234";
      device1Name = "test device 1";
      deviceType = "mbDevice";
      device1Adress = "192.168.0.1";
      device1PortNumber = 502;
      device1Timeout = 2000;
      device1UnitId = 1;
      device1IsActive = false;

      deviceId = device1Id;

      variable1Id = "0001";
      variable1TimeSample = 2;
      variable1Name = "test variable 1";
      variable1Type = "int16";
      variable1Offset = 5;
      variable1FCode = 3;
      variable1Value = 1;

      variable2Id = "0002";
      variable2TimeSample = 3;
      variable2Name = "test variable 2";
      variable2Type = "int32";
      variable2Offset = 6;
      variable2FCode = 4;
      variable2Value = 2;

      variable3Id = "0003";
      variable3TimeSample = 4;
      variable3Name = "test variable 3";
      variable3Type = "float";
      variable3Offset = 7;
      variable3FCode = 16;
      variable3Value = 3;

      sumElement1Id = "1001";
      sumElement1SampleTime = 1;
      sumElement1Name = "sumElement1";
      sumElement1Type = "sumElement";
      sumElement1Archived = false;
      sumElement1Value = 123;

      sumElement2Id = "1002";
      sumElement2SampleTime = 2;
      sumElement2Name = "sumElement2";
      sumElement2Type = "sumElement";
      sumElement2Archived = false;
      sumElement2Value = 321;

      addVariable1 = true;
      addVariable2 = true;
      addVariable3 = true;
      addSumElement1 = true;
      addSumElement2 = true;

      elementId = variable2Id;
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();

      variable1Payload = {
        id: variable1Id,
        timeSample: variable1TimeSample,
        name: variable1Name,
        type: variable1Type,
        offset: variable1Offset,
        fCode: variable1FCode,
        value: variable1Value
      };

      variable2Payload = {
        id: variable2Id,
        timeSample: variable2TimeSample,
        name: variable2Name,
        type: variable2Type,
        offset: variable2Offset,
        fCode: variable2FCode,
        value: variable2Value
      };

      variable3Payload = {
        id: variable3Id,
        timeSample: variable3TimeSample,
        name: variable3Name,
        type: variable3Type,
        offset: variable3Offset,
        fCode: variable3FCode,
        value: variable3Value
      };

      sumElement1Payload = {
        id: sumElement1Id,
        name: sumElement1Name,
        type: sumElement1Type,
        archived: sumElement1Archived,
        sampleTime: sumElement1SampleTime
      };

      sumElement2Payload = {
        id: sumElement2Id,
        name: sumElement2Name,
        type: sumElement2Type,
        archived: sumElement2Archived,
        sampleTime: sumElement2SampleTime
      };

      device1Variables = [];

      if (addVariable1) device1Variables.push(variable1Payload);
      if (addVariable2) device1Variables.push(variable2Payload);
      if (addVariable3) device1Variables.push(variable3Payload);

      device1CalculationElements = [];

      if (addSumElement1) device1CalculationElements.push(sumElement1Payload);
      if (addSumElement2) device1CalculationElements.push(sumElement2Payload);

      device1Payload = {
        id: device1Id,
        name: device1Name,
        type: deviceType,
        ipAdress: device1Adress,
        portNumber: device1PortNumber,
        timeout: device1Timeout,
        unitId: device1UnitId,
        isActive: device1IsActive,
        variables: device1Variables,
        calculationElements: device1CalculationElements
      };

      device1 = await project.createDevice(device1Payload);

      if (addSumElement1 && sumElement1Value)
        device1.CalculationElements[sumElement1Id].Value = sumElement1Value;

      if (addSumElement2 && sumElement2Value)
        device1.CalculationElements[sumElement2Id].Value = sumElement2Value;

      return project.getValue(deviceId, elementId);
    };

    it("should return actual value of variable of device - if element id is variable id", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      //Variable "0002" has value 2
      expect(result).toEqual(2);
    });

    it("should return actual value of calcElement of device - if element id is calcElement id", async () => {
      elementId = "1002";
      let result = await exec();

      expect(result).toBeDefined();
      //Variable "1002" has value 321
      expect(result).toEqual(321);
    });

    it("should throw if there is no device of given id", async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();

      expect(
        new Promise(async (resolve, reject) => {
          try {
            await project.getAllValues("8765");
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if there is no variable and calc element of given id", async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();

      expect(
        new Promise(async (resolve, reject) => {
          try {
            await project.getValue(deviceId, "8765");
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("getValueOfElementFromDatabase", () => {
    let projectDirName;
    let project;
    let initPayload;
    let deviceId;
    let tickId1;
    let tickId2;
    let tickId3;
    let varValue1;
    let varValue2;
    let varValue3;
    let variableId;
    let calculationElementId;
    let elementId;

    beforeEach(async () => {
      projectDirName = projPath;
      initPayload = JSON.parse(testPayload);
      deviceId = "1236";
      variableId = "0008";
      calculationElementId = "3001";
      elementId = "0008";

      tickId1 = 101;
      tickId2 = 103;
      tickId3 = 105;

      varValue1 = 123.321;
      varValue2 = 234.432;
      varValue3 = 345.543;
      calcElementValue1 = 321.123;
      calcElementValue2 = 432.234;
      calcElementValue3 = 543.345;

      tickId = tickId2;

      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();

      if (tickId1 && varValue1 && calcElementValue1)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId1, {
            [variableId]: varValue1,
            [calculationElementId]: calcElementValue1
          });

      if (tickId2 && varValue2 && calcElementValue2)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId2, {
            [variableId]: varValue2,
            [calculationElementId]: calcElementValue2
          });

      if (tickId3 && varValue3 && calcElementValue3)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId3, {
            [variableId]: varValue3,
            [calculationElementId]: calcElementValue3
          });

      return commInterface.getValueOfElementFromDatabase(
        deviceId,
        elementId,
        tickId
      );
    };

    it("should get value of variable from database if it exists", async () => {
      let result = await exec();

      let expectedResult = {
        [tickId]: varValue2
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get value of variable of highest date if given date is greater than given in databse from database if variable exists", async () => {
      tickId = 109;

      let result = await exec();

      let expectedResult = {
        [tickId3]: varValue3
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get value of vairable of highest date, lower than given in method if there is no date in database if variable exists", async () => {
      tickId = 104;

      let result = await exec();

      let expectedResult = {
        [tickId2]: varValue2
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get value of calcElement from database if it exists", async () => {
      elementId = calculationElementId;
      let result = await exec();

      let expectedResult = {
        [tickId]: calcElementValue2
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get value of calcElement of highest date if given date is greater than given in databse from database if variable exists", async () => {
      tickId = 109;
      elementId = calculationElementId;

      let result = await exec();

      let expectedResult = {
        [tickId3]: calcElementValue3
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get value of calcElement of highest date, lower than given in method if there is no date in database if variable exists", async () => {
      tickId = 104;
      elementId = calculationElementId;

      let result = await exec();

      let expectedResult = {
        [tickId2]: calcElementValue2
      };

      expect(result).toEqual(expectedResult);
    });

    it("should return {} if date is smaller than written in database", async () => {
      tickId = 99;

      let result = await exec();

      expect(result).toEqual({});
    });

    it("should throw if there is no variable and calculationElement of given id", async () => {
      elementId = 987654321;

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

    //#region MBFloatVariable

    createVariableTestMBVariableChildClass(
      MBFloatVariable,
      0,
      3,
      1,
      [3, 4],
      16,
      2,
      "float"
    );

    //#endregion MBFloatVariable

    //#region MBInt16Variable

    createVariableTestMBVariableChildClass(
      MBInt16Variable,
      0,
      3,
      1,
      [3, 4],
      16,
      1,
      "int16"
    );

    //#endregion MBInt16Variable

    //#region MBInt32Variable

    createVariableTestMBVariableChildClass(
      MBInt32Variable,
      0,
      3,
      1,
      [3, 4],
      16,
      2,
      "int32"
    );

    //#endregion MBInt32Variable

    //#region MBSwappedFloatVariable

    createVariableTestMBVariableChildClass(
      MBSwappedFloatVariable,
      0,
      3,
      1,
      [3, 4],
      16,
      2,
      "swappedFloat"
    );

    //#endregion MBSwappedFloatVariable

    //#region MBSwappedInt32Variable

    createVariableTestMBVariableChildClass(
      MBSwappedInt32Variable,
      0,
      3,
      1,
      [3, 4],
      16,
      2,
      "swappedInt32"
    );

    //#endregion MBSwappedInt32Variable

    //#region MBSwappedUInt32Variable

    createVariableTestMBVariableChildClass(
      MBSwappedUInt32Variable,
      0,
      3,
      1,
      [3, 4],
      16,
      2,
      "swappedUInt32"
    );

    //#endregion MBSwappedUInt32Variable

    //#region MBUInt16Variable

    createVariableTestMBVariableChildClass(
      MBUInt16Variable,
      0,
      3,
      1,
      [3, 4],
      16,
      1,
      "uInt16"
    );

    //#endregion MBUInt16Variable

    //#region MBUInt32Variable

    createVariableTestMBVariableChildClass(
      MBUInt32Variable,
      0,
      3,
      1,
      [3, 4],
      16,
      2,
      "uInt32"
    );

    //#endregion MBUInt32Variable

    //#region MBByteArrayVariable

    it(`MBByteArrayVariable - should throw if deviceId is undefined`, async () => {
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

    it(`MBByteArrayVariable - should throw if there is no device of given id`, async () => {
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

    it(`MBByteArrayVariable - should throw if there is already a variable with given id`, async () => {
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

    it(`MBByteArrayVariable - should generate and return new variable`, async () => {
      let result = await exec();
      let variable = await project.getVariable(deviceId, variablePayload.id);
      expect(result).toEqual(variable);
    });

    it(`MBByteArrayVariable - should generate variable based on given payload`, async () => {
      let result = await exec();
      expect(result.Payload).toEqual(variablePayload);
    });

    it(`MBByteArrayVariable - should generate requests for getSingleFCode and setSingleFCode`, async () => {
      let result = await exec();
      expect(result.GetSingleRequest).toBeDefined();
      expect(result.GetSingleRequest).toBeDefined();
    });

    it(`MBByteArrayVariable - should set default value of variable if it is not defined in payload`, async () => {
      delete variablePayload.value;
      let result = await exec();
      // array byte with all bytes set as 0 - length is equal to payload.length*2
      expect(result.Value).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it(`MBByteArrayVariable - should set new id based on payload`, async () => {
      let result = await exec();
      expect(result.Id).toEqual(variablePayload.id);
    });

    it(`MBByteArrayVariable - should not throw but generate new id if variable id is not defined in payload`, async () => {
      delete variablePayload.id;
      let result = await exec();
      expect(result.Id).toBeDefined();
    });

    it(`MBByteArrayVariable - should throw if payload is not defined`, async () => {
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

    it(`MBByteArrayVariable - should throw if name is not defined`, async () => {
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

    it(`MBByteArrayVariable - should throw if timeSample is not defined`, async () => {
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

    it(`MBByteArrayVariable - should throw if fCode is not defined`, async () => {
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

    it(`MBByteArrayVariable - should throw if fCode is not inside possible dCodes`, async () => {
      variablePayload.fCode = 999;

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

    it(`MBByteArrayVariable - should not throw but set unit to "" if unit is not defined`, async () => {
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

    it(`MBByteArrayVariable - should throw if length is not defined`, async () => {
      delete variablePayload.length;

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

    it(`MBByteArrayVariable - should not throw but set archive to false if it is not defined`, async () => {
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

    it(`MBByteArrayVariable - should not throw but set archive to false even if it is set to true`, async () => {
      variablePayload.archived = true;

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

    it(`MBByteArrayVariable - should not add variable to ArchiveManager even if archive is set to true`, async () => {
      variablePayload.archived = true;
      let result = await exec();
      let device = result.Device;
      let amVariablesIds = Object.keys(device.ArchiveManager.Variables);
      expect(amVariablesIds).not.toContain(result.Id);
    });

    it(`MBByteArrayVariable - should not add variable to ArchiveManager if archive is set to false`, async () => {
      variablePayload.archived = false;
      let result = await exec();
      let device = result.Device;
      let amVariablesIds = Object.keys(device.ArchiveManager.Variables);
      expect(amVariablesIds).not.toContain(result.Id);
    });

    it(`MBByteArrayVariable - should add variable to device file content`, async () => {
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

    it(`MBByteArrayVariable - should set type to byteArray`, async () => {
      let result = await exec();
      expect(result.Type).toEqual("byteArray");
    });

    it(`MBByteArrayVariable - should set setSingleFCode to fCode value if it is defined in payload as other value`, async () => {
      variablePayload.setSingleFCode = 20;
      let result = await exec();
      expect(result.SetSingleFCode).toEqual(16);
    });

    it(`MBByteArrayVariable - should set setSingleFCode to 16 if is not defined in payload`, async () => {
      delete variablePayload.setSingleFCode;
      let result = await exec();
      expect(result.SetSingleFCode).toEqual(16);
    });

    it(`MBByteArrayVariable - should set getSingleFCode to fCode value if getSingleFCode is not defined in payload`, async () => {
      delete variablePayload.getSingleFCode;
      let result = await exec();
      expect(result.GetSingleFCode).toEqual(variablePayload.fCode);
    });

    it(`MBByteArrayVariable - should set getSingleFCode to and even if getSingleFCode is defined in payload to a different value`, async () => {
      variablePayload.getSingleFCode = 4321;
      let result = await exec();
      expect(result.GetSingleFCode).toEqual(variablePayload.fCode);
    });

    //#endregion MBByteArray
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
      createPayload.type = "byteArray";
      createPayload.value = [0, 0, 0, 0];

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
      editPayload.type = "byteArray";
      editPayload.value = [0, 1, 0, 1, 0, 1, 0, 1];

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

    //#region MBBooleanVariable

    editVariableTestMBVariableChildClass(
      MBBooleanVariable,
      [1, 2],
      3,
      [1],
      15,
      1,
      "boolean",
      false,
      true
    );

    //#endregion MBBoleanVariable

    //#region MBFloatVariable

    editVariableTestMBVariableChildClass(
      MBFloatVariable,
      [3, 4],
      1,
      [3, 4],
      16,
      2,
      "float",
      0,
      123
    );

    //#endregion MBFloatVariable

    //#region MBInt16Variable

    editVariableTestMBVariableChildClass(
      MBInt16Variable,
      [3, 4],
      1,
      [3, 4],
      16,
      1,
      "int16",
      0,
      123
    );

    //#endregion MBInt16Variable

    //#region MBUInt16Variable

    editVariableTestMBVariableChildClass(
      MBUInt16Variable,
      [3, 4],
      1,
      [3, 4],
      16,
      1,
      "uInt16",
      0,
      123
    );

    //#endregion MBUInt16Variable

    //#region MBInt32Variable

    editVariableTestMBVariableChildClass(
      MBInt32Variable,
      [3, 4],
      1,
      [3, 4],
      16,
      2,
      "int32",
      0,
      123
    );

    //#endregion MBInt32Variable

    //#region MBUInt32Variable

    editVariableTestMBVariableChildClass(
      MBUInt32Variable,
      [3, 4],
      1,
      [3, 4],
      16,
      2,
      "uInt32",
      0,
      123
    );

    //#endregion MBUInt32Variable

    //#region MBSwappedFloatVariable

    editVariableTestMBVariableChildClass(
      MBSwappedFloatVariable,
      [3, 4],
      1,
      [3, 4],
      16,
      2,
      "swappedFloat",
      0,
      123
    );

    //#endregion MBSwappedFloatVariable

    //#region MBSwappedInt32Variable

    editVariableTestMBVariableChildClass(
      MBSwappedInt32Variable,
      [3, 4],
      1,
      [3, 4],
      16,
      2,
      "swappedInt32",
      0,
      123
    );

    //#endregion MBSwappedInt32Variable

    //#region MBSwappedUInt32Variable

    editVariableTestMBVariableChildClass(
      MBSwappedUInt32Variable,
      [3, 4],
      1,
      [3, 4],
      16,
      2,
      "swappedInt32",
      0,
      123
    );

    //#endregion MBSwappedUInt32Variable

    //#region MBByteArrayVariable

    it(`MBByteArrayVariable - return edited variable`, async () => {
      let result = await exec();

      expect(result).toEqual(variable);
    });

    it(`MBByteArrayVariable - edit variable based on given payload`, async () => {
      let result = await exec();

      expect(result.Payload).toEqual(editPayload);
    });

    it(`MBByteArrayVariable - should throw if id in payload is different than id in method`, async () => {
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

    it(`MBByteArrayVariable - should edit only time sample if only time sample is defined`, async () => {
      let editedTimeSampleValue = 100;

      editPayload = {
        timeSample: editedTimeSampleValue
      };

      let expectedPayload = { ...createPayload, ...editPayload };

      let result = await exec();

      expect(result.Payload).toEqual(expectedPayload);
    });

    it(`MBByteArrayVariable - should edit only name if only name is defined`, async () => {
      let editName = "new test name 2";

      editPayload = {
        name: editName
      };

      let expectedPayload = { ...createPayload, ...editPayload };

      let result = await exec();

      expect(result.Payload).toEqual(expectedPayload);
    });

    it(`MBByteArrayVariable - should set archive to false even if in payload is set as true`, async () => {
      let editArchive = true;

      editPayload = {
        archived: editArchive
      };

      let result = await exec();

      expect(result.Archived).toBeFalsy();
    });

    it(`MBByteArrayVariable - should edit only Unit if only Unit is defined`, async () => {
      let editUnit = "B";

      editPayload = {
        unit: editUnit
      };

      let expectedPayload = { ...createPayload, ...editPayload };

      let result = await exec();

      expect(result.Payload).toEqual(expectedPayload);
    });

    it(`MBByteArrayVariable - should edit only FCode if only FCode is defined`, async () => {
      let editFCode = 16;

      //both should be edited together with getSingleFCode
      editPayload = {
        fCode: editFCode,
        getSingleFCode: editFCode
      };

      let expectedPayload = { ...createPayload, ...editPayload };

      let result = await exec();

      expect(result.Payload).toEqual(expectedPayload);
    });

    it(`MBByteArrayVariable - should edit only Offset if only Offset is defined`, async () => {
      let editOffset = 4;

      editPayload = {
        offset: editOffset
      };

      let expectedPayload = { ...createPayload, ...editPayload };

      let result = await exec();

      expect(result.Payload).toEqual(expectedPayload);
    });

    it(`MBByteArrayVariable - should edit only Value if only Value is defined`, async () => {
      let newValue = [0, 1, 0, 1];

      editPayload = {
        value: newValue
      };

      let expectedPayload = { ...createPayload, ...editPayload };

      let result = await exec();

      expect(result.Payload).toEqual(expectedPayload);
    });

    it(`MBByteArrayVariable - should edit only Length if only Length is defined`, async () => {
      let editLength = 4;

      editPayload = {
        length: editLength
      };

      //also value changes due to change of length to default value
      let expectedPayload = {
        ...createPayload,
        ...editPayload,
        value: [0, 0, 0, 0, 0, 0, 0, 0]
      };

      let result = await exec();

      expect(result.Payload).toEqual(expectedPayload);
    });

    it(`MBByteArrayVariable - should set value to default value if length is edited`, async () => {
      let editLength = 4;

      editPayload = {
        length: editLength
      };

      let result = await exec();

      expect(result.Value).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it(`MBByteArrayVariable - should set value to new value if length is edited but value is given in edit payload`, async () => {
      let editLength = 4;
      let newValue = [1, 0, 1, 0, 1, 0, 1, 0];
      editPayload = {
        length: editLength,
        value: newValue
      };

      let result = await exec();

      expect(result.Value).toEqual(newValue);
    });

    it(`MBByteArrayVariable - should throw and not edit value if new value has different length than length in payload`, async () => {
      let editLength = 4;
      let newValue = [1, 0, 1, 0];
      editPayload = {
        length: editLength,
        value: newValue
      };

      let result = null;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            result = await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      let variable = await project.getVariable(deviceId, variableId);

      expect(variable.Length).toEqual(editLength);
      expect(variable.Value).not.toEqual(newValue);
      expect(variable.Value).toEqual(createPayload.value);
    });

    it(`MBByteArrayVariable - should not add variable to archive manager if archive is set to true and previously was set to false`, async () => {
      createPayload.archived = false;
      editPayload.archived = true;

      let result = await exec();

      let allIds = Object.keys(result.Device.ArchiveManager.Variables);

      expect(allIds).not.toContain(variableId);
    });

    it(`MBByteArrayVariable - should throw if given fCode is not included in possibleFCodes`, async () => {
      editPayload.fCode = 100;

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

    it(`MBByteArrayVariable - recreate getSingleRequest after edition`, async () => {
      let result = await exec();

      let getSingleRequest = result.GetSingleRequest;

      expect(getSingleRequest).toBeDefined();
      expect(getSingleRequest).not.toEqual(previousGetRequest);
    });

    it(`MBByteArrayVariable - recreate setSingleRequest after edition`, async () => {
      let result = await exec();

      let setSingleRequest = result.SetSingleRequest;

      expect(setSingleRequest).toBeDefined();
      expect(setSingleRequest).not.toEqual(previousSetRequest);
    });

    it(`MBByteArrayVariable - should set getSingleFCode to fCode even is defined in payload as other value`, async () => {
      editPayload.getSingleFCode = 3;
      editPayload.fCode = 4;
      let result = await exec();
      expect(result.GetSingleFCode).toEqual(4);
    });

    it(`MBByteArrayVariable - should set getSingleFCode to fCode if is not defined in payload`, async () => {
      delete editPayload.getSingleFCode;
      editPayload.fCode = 4;
      let result = await exec();
      expect(result.GetSingleFCode).toEqual(4);
    });

    it(`MBByteArrayVariable - should set setSingleFCode to 16 if it is defined in payload as other value`, async () => {
      editPayload.setSingleFCode = 20;
      let result = await exec();
      expect(result.SetSingleFCode).toEqual(16);
    });

    it(`MBByteArrayVariable - should set setSingleFCode to 16 if is not defined in payload`, async () => {
      delete editPayload.setSingleFCode;
      let result = await exec();
      expect(result.SetSingleFCode).toEqual(16);
    });

    it(`MBByteArrayVariable - should refresh device request groups after edition`, async () => {
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

    it(`MBByteArrayVariable - should edit variable in device file content`, async () => {
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

    //#endregion MBByteArrayVariable
  });

  describe("createCalcElement", () => {
    let variablePayload;
    let elementPayload;
    let deviceId;
    let projectDirName;
    let project;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1234";

      variablePayload = {
        id: "000y",
        name: "testVariable",
        timeSample: 5,
        unit: "A",
        archived: false,
        offset: 1,
        fCode: 3,
        getSingleFCode: 3,
        setSingleFCode: 16,
        type: "float",
        value: 3
      };

      elementPayload = {
        id: "000x",
        archived: true,
        name: "testCalcElement",
        sampleTime: 5,
        unit: "A",
        variableId: "000y",
        factor: 2,
        calculationInterval: 5,
        type: "averageElement"
      };

      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      await project.createVariable(deviceId, variablePayload);
      return project.createCalcElement(deviceId, elementPayload);
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
  });

  describe("createCalcElement - AverageElement", () => {
    let variablePayload;
    let elementPayload;
    let deviceId;
    let projectDirName;
    let project;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1234";

      variablePayload = {
        id: "000y",
        name: "testVariable",
        timeSample: 5,
        unit: "A",
        archived: false,
        offset: 1,
        fCode: 3,
        getSingleFCode: 3,
        setSingleFCode: 16,
        type: "float",
        value: 3
      };

      elementPayload = {
        id: "000x",
        archived: true,
        name: "testCalcElement",
        sampleTime: 5,
        unit: "A",
        variableId: "000y",
        factor: 2,
        calculationInterval: 5,
        type: "averageElement"
      };

      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      await project.createVariable(deviceId, variablePayload);
      return project.createCalcElement(deviceId, elementPayload);
    };

    it("should generate and return new calculation element", async () => {
      let result = await exec();

      let element = await project.getCalcElement(deviceId, elementPayload.id);

      expect(result).toBeDefined();
      expect(result).toEqual(element);
    });

    it("should generate calcElement based on given parameters", async () => {
      let result = await exec();

      expect(result.Payload).toEqual(elementPayload);
    });

    it("should throw if there is already a calcElement with given id", async () => {
      await exec();

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await project.createCalcElement(deviceId, elementPayload);
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if name is not defined", async () => {
      delete elementPayload.name;
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

    it("should throw if sampleTime is not defined", async () => {
      delete elementPayload.sampleTime;
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

    it("should throw if variableId is not defined", async () => {
      delete elementPayload.variableId;
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

    it("should throw if factor is not defined", async () => {
      delete elementPayload.factor;
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

    it("should throw if calculationInterval is not defined", async () => {
      delete elementPayload.calculationInterval;
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

    it("should throw if there is no variable of given id", async () => {
      delete elementPayload.calculationInterval;
      elementPayload.variableId = "8765";
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

    it("should set unit to empty string if it is not defined in payload", async () => {
      delete elementPayload.unit;

      let result = await exec();

      await expect(result.Unit).toEqual("");
    });

    it("should generate new id if id is not defined inside payload", async () => {
      delete elementPayload.id;

      let result = await exec();

      await expect(result.Id).toBeDefined();
    });

    it("should add element to archive manager if archive is set to true", async () => {
      elementPayload.archived = true;
      let result = await exec();

      await expect(
        result.Device.ArchiveManager.doesCalculationElementIdExists(result.Id)
      ).toBeTruthy();
    });

    it("should not add element to archive manager if archive is set to false", async () => {
      elementPayload.archived = false;
      let result = await exec();

      await expect(
        result.Device.ArchiveManager.doesCalculationElementIdExists(result.Id)
      ).toBeFalsy();
    });

    it("should save new element in device file content", async () => {
      let result = await exec();

      let deviceFilePath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName, `${deviceId}.json`)
      );

      let deviceFileContent = JSON.parse(await readFileAsync(deviceFilePath));

      let calcElementContent = deviceFileContent.calculationElements.find(
        x => x.id === elementPayload.id
      );

      await expect(calcElementContent).toEqual(elementPayload);
    });
  });

  describe("createCalcElement - FactorElement", () => {
    let variablePayload;
    let elementPayload;
    let deviceId;
    let projectDirName;
    let project;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1234";

      variablePayload = {
        id: "000y",
        name: "testVariable",
        timeSample: 5,
        unit: "A",
        archived: false,
        offset: 1,
        fCode: 3,
        getSingleFCode: 3,
        setSingleFCode: 16,
        type: "float",
        value: 3
      };

      elementPayload = {
        id: "000x",
        archived: true,
        name: "testCalcElement",
        sampleTime: 5,
        unit: "A",
        variableId: "000y",
        factor: 2,
        type: "factorElement"
      };

      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      await project.createVariable(deviceId, variablePayload);
      return project.createCalcElement(deviceId, elementPayload);
    };

    it("should generate and return new calculation element", async () => {
      let result = await exec();

      let element = await project.getCalcElement(deviceId, elementPayload.id);

      expect(result).toBeDefined();
      expect(result).toEqual(element);
    });

    it("should generate calcElement based on given parameters", async () => {
      let result = await exec();

      expect(result.Payload).toEqual(elementPayload);
    });

    it("should throw if there is already a calcElement with given id", async () => {
      await exec();

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await project.createCalcElement(deviceId, elementPayload);
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if name is not defined", async () => {
      delete elementPayload.name;
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

    it("should throw if sampleTime is not defined", async () => {
      delete elementPayload.sampleTime;
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

    it("should throw if variableId is not defined", async () => {
      delete elementPayload.variableId;
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

    it("should throw if factor is not defined", async () => {
      delete elementPayload.factor;
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

    it("should throw if there is no variable of given id", async () => {
      delete elementPayload.calculationInterval;
      elementPayload.variableId = "8765";
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

    it("should set unit to empty string if it is not defined in payload", async () => {
      delete elementPayload.unit;

      let result = await exec();

      await expect(result.Unit).toEqual("");
    });

    it("should generate new id if id is not defined inside payload", async () => {
      delete elementPayload.id;

      let result = await exec();

      await expect(result.Id).toBeDefined();
    });

    it("should add element to archive manager if archive is set to true", async () => {
      elementPayload.archived = true;
      let result = await exec();

      await expect(
        result.Device.ArchiveManager.doesCalculationElementIdExists(result.Id)
      ).toBeTruthy();
    });

    it("should not add element to archive manager if archive is set to false", async () => {
      elementPayload.archived = false;
      let result = await exec();

      await expect(
        result.Device.ArchiveManager.doesCalculationElementIdExists(result.Id)
      ).toBeFalsy();
    });

    it("should save new element in device file content", async () => {
      let result = await exec();

      let deviceFilePath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName, `${deviceId}.json`)
      );

      let deviceFileContent = JSON.parse(await readFileAsync(deviceFilePath));

      let calcElementContent = deviceFileContent.calculationElements.find(
        x => x.id === elementPayload.id
      );

      await expect(calcElementContent).toEqual(elementPayload);
    });
  });

  describe("createCalcElement - IncreaseElement", () => {
    let variablePayload;
    let elementPayload;
    let deviceId;
    let projectDirName;
    let project;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1234";

      variablePayload = {
        id: "000y",
        name: "testVariable",
        timeSample: 5,
        unit: "A",
        archived: false,
        offset: 1,
        fCode: 3,
        getSingleFCode: 3,
        setSingleFCode: 16,
        type: "float",
        value: 3
      };

      elementPayload = {
        id: "000x",
        archived: true,
        name: "testCalcElement",
        sampleTime: 5,
        unit: "A",
        variableId: "000y",
        factor: 2,
        calculationInterval: 5,
        type: "increaseElement",
        overflow: 1000
      };

      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      await project.createVariable(deviceId, variablePayload);
      return project.createCalcElement(deviceId, elementPayload);
    };

    it("should generate and return new calculation element", async () => {
      let result = await exec();

      let element = await project.getCalcElement(deviceId, elementPayload.id);

      expect(result).toBeDefined();
      expect(result).toEqual(element);
    });

    it("should generate calcElement based on given parameters", async () => {
      let result = await exec();

      expect(result.Payload).toEqual(elementPayload);
    });

    it("should throw if there is already a calcElement with given id", async () => {
      await exec();

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await project.createCalcElement(deviceId, elementPayload);
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if name is not defined", async () => {
      delete elementPayload.name;
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

    it("should throw if sampleTime is not defined", async () => {
      delete elementPayload.sampleTime;
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

    it("should throw if overflow is not defined", async () => {
      delete elementPayload.overflow;
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

    it("should throw if variableId is not defined", async () => {
      delete elementPayload.variableId;
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

    it("should throw if factor is not defined", async () => {
      delete elementPayload.factor;
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

    it("should throw if calculationInterval is not defined", async () => {
      delete elementPayload.calculationInterval;
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

    it("should throw if there is no variable of given id", async () => {
      delete elementPayload.calculationInterval;
      elementPayload.variableId = "8765";
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

    it("should set unit to empty string if it is not defined in payload", async () => {
      delete elementPayload.unit;

      let result = await exec();

      await expect(result.Unit).toEqual("");
    });

    it("should generate new id if id is not defined inside payload", async () => {
      delete elementPayload.id;

      let result = await exec();

      await expect(result.Id).toBeDefined();
    });

    it("should add element to archive manager if archive is set to true", async () => {
      elementPayload.archived = true;
      let result = await exec();

      await expect(
        result.Device.ArchiveManager.doesCalculationElementIdExists(result.Id)
      ).toBeTruthy();
    });

    it("should not add element to archive manager if archive is set to false", async () => {
      elementPayload.archived = false;
      let result = await exec();

      await expect(
        result.Device.ArchiveManager.doesCalculationElementIdExists(result.Id)
      ).toBeFalsy();
    });

    it("should save new element in device file content", async () => {
      let result = await exec();

      let deviceFilePath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName, `${deviceId}.json`)
      );

      let deviceFileContent = JSON.parse(await readFileAsync(deviceFilePath));

      let calcElementContent = deviceFileContent.calculationElements.find(
        x => x.id === elementPayload.id
      );

      await expect(calcElementContent).toEqual(elementPayload);
    });
  });

  describe("createCalcElement - SumElement", () => {
    let variable1Payload;
    let elementPayload;
    let deviceId;
    let projectDirName;
    let project;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1234";

      variable1Payload = {
        id: "000y",
        name: "testVariable1",
        timeSample: 5,
        unit: "A",
        archived: false,
        offset: 1,
        fCode: 3,
        getSingleFCode: 3,
        setSingleFCode: 16,
        type: "float",
        value: 3
      };

      variable2Payload = {
        id: "000z",
        name: "testVariable2",
        timeSample: 5,
        unit: "A",
        archived: false,
        offset: 1,
        fCode: 3,
        getSingleFCode: 3,
        setSingleFCode: 16,
        type: "float",
        value: 4
      };

      elementPayload = {
        id: "000x",
        archived: true,
        name: "testCalcElement",
        sampleTime: 5,
        unit: "A",
        variables: [{ id: "000y", factor: 2 }, { id: "000z", factor: 3 }],
        type: "sumElement"
      };

      await createInitialFiles();
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      await project.createVariable(deviceId, variable1Payload);
      await project.createVariable(deviceId, variable2Payload);
      return project.createCalcElement(deviceId, elementPayload);
    };

    it("should generate and return new calculation element", async () => {
      let result = await exec();

      let element = await project.getCalcElement(deviceId, elementPayload.id);

      expect(result).toBeDefined();
      expect(result).toEqual(element);
    });

    it("should generate calcElement based on given parameters", async () => {
      let result = await exec();

      expect(result.Payload).toEqual(elementPayload);
    });

    it("should throw if there is already a calcElement with given id", async () => {
      await exec();

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await project.createCalcElement(deviceId, elementPayload);
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if name is not defined", async () => {
      delete elementPayload.name;
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

    it("should throw if sampleTime is not defined", async () => {
      delete elementPayload.sampleTime;
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

    it("should not throw there are no variables", async () => {
      elementPayload.variables = [];
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

    it("should set unit to empty string if it is not defined in payload", async () => {
      delete elementPayload.unit;

      let result = await exec();

      await expect(result.Unit).toEqual("");
    });

    it("should generate new id if id is not defined inside payload", async () => {
      delete elementPayload.id;

      let result = await exec();

      await expect(result.Id).toBeDefined();
    });

    it("should add element to archive manager if archive is set to true", async () => {
      elementPayload.archived = true;
      let result = await exec();

      await expect(
        result.Device.ArchiveManager.doesCalculationElementIdExists(result.Id)
      ).toBeTruthy();
    });

    it("should not add element to archive manager if archive is set to false", async () => {
      elementPayload.archived = false;
      let result = await exec();

      await expect(
        result.Device.ArchiveManager.doesCalculationElementIdExists(result.Id)
      ).toBeFalsy();
    });

    it("should save new element in device file content", async () => {
      let result = await exec();

      let deviceFilePath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName, `${deviceId}.json`)
      );

      let deviceFileContent = JSON.parse(await readFileAsync(deviceFilePath));

      let calcElementContent = deviceFileContent.calculationElements.find(
        x => x.id === elementPayload.id
      );

      await expect(calcElementContent).toEqual(elementPayload);
    });
  });

  describe("getUser", () => {
    let projectDirName;
    let project;
    let userLogin;

    beforeEach(async () => {
      projectDirName = projPath;
      userLogin = "user2";
      await createInitialFiles(testPayload);
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      return project.getUser(userLogin);
    };

    it("should return user if it exists", async () => {
      let result = await exec();

      let user = project.Users[userLogin];

      expect(result).toBeDefined();
      expect(result).toEqual(user);
    });

    it("should throw if login is not given as a parameter", async () => {
      userLogin = undefined;

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

    it("should throw if there is no user of given login", async () => {
      userLogin = "8765";

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

  describe("createUser", () => {
    let projectDirName;
    let project;
    let userPayload;

    beforeEach(async () => {
      projectDirName = projPath;
      await createInitialFiles(testPayload);
      userPayload = {
        login: "user4",
        password: "12345",
        permissions: 1
      };
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      return project.createUser(userPayload);
    };

    it("should create user according to payload", async () => {
      await exec();

      let user = await project.getUser(userPayload.login);

      expect(user).toBeDefined();
      expect(user.Login).toEqual(userPayload.login);
      expect(user.Permissions).toEqual(userPayload.permissions);
      let passwordMatches = await hashedStringMatch(
        userPayload.password,
        user.Password
      );
      expect(passwordMatches).toBeTruthy();
    });

    it("should return created user", async () => {
      let result = await exec();

      let user = await project.getUser(userPayload.login);

      expect(result).toBeDefined();
      expect(result).toEqual(user);
    });

    it("should throw if login is not defined in payload", async () => {
      delete userPayload.login;

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

    it("should throw if permissions is not defined in payload", async () => {
      delete userPayload.permissions;

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

    it("should throw if password is not defined in payload", async () => {
      delete userPayload.password;

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

    it("should throw if payload is undefined", async () => {
      userPayload = undefined;

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

    it("should throw if there is already a user with given id", async () => {
      userPayload.login = "user1";

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

    it("should add user to config file", async () => {
      let result = await exec();

      let configFilePath = path.resolve(projectDirName, expectedConfigFileName);

      let fileContent = JSON.parse(await readFileAsync(configFilePath));

      let usersObject = fileContent.users;

      expect(usersObject.length).toEqual(4);
      expect(usersObject[3]).toEqual(result.Payload);
    });
  });

  describe("deleteUser", () => {
    let projectDirName;
    let project;
    let login;
    let userToDelete;

    beforeEach(async () => {
      projectDirName = projPath;
      login = "user1";
      await createInitialFiles(testPayload);
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      userToDelete = await project.getUser(login);
      return project.deleteUser(login);
    };

    it("should delete user of given id", async () => {
      await exec();

      let user = project.Users[login];

      expect(user).not.toBeDefined();
    });

    it("should return deleted user", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(userToDelete);
    });

    it("should throw if login is not defined", async () => {
      login = undefined;

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

    it("should throw if there is no user of given login", async () => {
      login = "87654";

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

  describe("editUser", () => {
    let projectDirName;
    let project;
    let createPayload;
    let editPayload;
    let user;
    let login;

    beforeEach(async () => {
      projectDirName = projPath;
      await createInitialFiles(testPayload);
      createPayload = {
        login: "user4",
        password: "12345",
        permissions: 1
      };
      editPayload = {
        login: "user4",
        password: "23456",
        permissions: 2
      };
      login = createPayload.login;
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.initFromFiles();
      user = await project.createUser(createPayload);
      return project.editUser(login, editPayload);
    };

    it("should edit user according to payload", async () => {
      await exec();

      expect(user).toBeDefined();
      expect(user.Permissions).toEqual(editPayload.permissions);
      let passwordMatches = await hashedStringMatch(
        editPayload.password,
        user.Password
      );
      expect(passwordMatches).toBeTruthy();
    });

    it("should edit only password if only password is given in payload", async () => {
      editPayload = { password: "123456789" };
      await exec();

      expect(user).toBeDefined();
      expect(user.Login).toEqual(createPayload.login);
      expect(user.Permissions).toEqual(createPayload.permissions);

      let passwordMatches = await hashedStringMatch(
        editPayload.password,
        user.Password
      );
      expect(passwordMatches).toBeTruthy();
    });

    it("should edit only permissions if only permissions is given in payload", async () => {
      editPayload = { permissions: 99 };
      await exec();

      expect(user).toBeDefined();
      expect(user.Login).toEqual(createPayload.login);
      let passwordMatches = await hashedStringMatch(
        createPayload.password,
        user.Password
      );
      expect(passwordMatches).toBeTruthy();

      expect(user.Permissions).toEqual(editPayload.permissions);
    });

    it("should throw and not edit login of login in payload is different than login of user", async () => {
      editPayload.login = "new test login";

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

      expect(user).toBeDefined();
      expect(user.Login).toEqual(createPayload.login);
      let passwordMatches = await hashedStringMatch(
        createPayload.password,
        user.Password
      );
      expect(passwordMatches).toBeTruthy();

      expect(user.Permissions).toEqual(createPayload.permissions);
    });

    it("should return edited user", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(user);
    });

    it("should throw if login is not defined in payload", async () => {
      login = undefined;

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

    it("should throw if payload is undefined", async () => {
      createPayload = undefined;

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

    it("should edit user in config file", async () => {
      let result = await exec();

      let configFilePath = path.resolve(projectDirName, expectedConfigFileName);

      let fileContent = JSON.parse(await readFileAsync(configFilePath));

      let usersObject = fileContent.users;

      expect(usersObject.length).toEqual(4);
      expect(usersObject[3]).toEqual(result.Payload);
    });
  });
});
