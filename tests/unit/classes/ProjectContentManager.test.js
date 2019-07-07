const config = require("config");
const path = require("path");
const ProjectContentManager = require("../../../classes/project/ProjectContentManager");
const { hashString } = require("../../../utilities/utilities");

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
        archived: false,
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
  }
});

//CommInterface is common for all project objects!
let commInterface;

describe("ProjectContentManager", () => {
  //Database directory should be cleared
  let db1Path;
  let db2Path;
  let projPath;
  let expectedConfigFileName;
  let expectedDeviceDirName;
  let Project;

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
    let project;
    let projectDirName;

    beforeEach(() => {
      project = "test project";
      projectDirName = projPath;
    });

    let exec = () => {
      return new ProjectContentManager(project, projectDirName);
    };

    it("should create new Project object", async () => {
      let result = exec();
      expect(result).toBeDefined();
    });

    it("should initialize Project absoulte and realtive path", async () => {
      let result = exec();
      let expectedProjectAbsolutePath = path.resolve(projPath);
      let expectedProjectRelativePath = projPath;
      expect(result.ProjectAbsolutePath).toBeDefined();
      expect(result.ProjectAbsolutePath).toEqual(expectedProjectAbsolutePath);
      expect(result.ProjectRelativePath).toBeDefined();
      expect(result.ProjectRelativePath).toEqual(expectedProjectRelativePath);
    });

    it("should initialize config file path and device dir path", async () => {
      let result = exec();
      let expectedConfigFilePath = path.resolve(
        path.join(projPath, expectedConfigFileName)
      );
      let expectedDeviceDirPath = path.resolve(
        path.join(projPath, expectedDeviceDirName)
      );
      expect(result.ConfigFilePath).toBeDefined();
      expect(result.ConfigFilePath).toEqual(expectedConfigFilePath);
      expect(result.DeviceDirPath).toBeDefined();
      expect(result.DeviceDirPath).toEqual(expectedDeviceDirPath);
    });

    it("should assing project to to project content manager", async () => {
      let result = exec();

      expect(result.Project).toBeDefined();
      expect(result.Project).toEqual(project);
    });
  });

  describe("_getProjectConfigFileName", () => {
    let exec = () => {
      return ProjectContentManager._getProjectConfigFileName();
    };

    it("should return name of config file", async () => {
      let result = exec();
      expect(result).toEqual(expectedConfigFileName);
    });
  });

  describe("_getDeviceDirName", () => {
    let exec = () => {
      return ProjectContentManager._getDeviceDirName();
    };

    it("should return name of device directory", async () => {
      let result = exec();
      expect(result).toEqual(expectedDeviceDirName);
    });
  });

  describe("_getDeviceFileName", () => {
    let deviceId = "testDeviceId";

    let exec = () => {
      return ProjectContentManager._getDeviceFileName(deviceId);
    };

    it("should return name of device config file based on given deviceId", async () => {
      let result = exec();
      let expectedFileName = `${deviceId}.json`;
      expect(result).toEqual(expectedFileName);
    });

    it("should throw if deviceId is empty", async () => {
      deviceId = undefined;
      expect(() => exec()).toThrow();
    });
  });

  describe("_checkIfProjectDirExists", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let createProjectDir;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath;
      createProjectDir = true;
    });

    let exec = async () => {
      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      return projectContentManager._checkIfProjectDirExists();
    };

    it("should return true if projectDirectory exists", async () => {
      let result = await exec();
      expect(result).toBeTruthy();
    });

    it("should return false if projectDirectory does not exist", async () => {
      projectDirName = "project/TestThatNotExists";
      let result = await exec();
      expect(result).toBeFalsy();
    });
  });

  describe("_createProjectDirIfNotExists", () => {
    let project;
    let projectDirName;
    let projectContentManager;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath + "/testProject";
    });

    let exec = async () => {
      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      return projectContentManager._createProjectDirIfNotExists();
    };

    it("should create project directory if it does not exists", async () => {
      await exec();
      let doesDirExist = await checkIfDirectoryExistsAsync(projectDirName);
      expect(doesDirExist).toBeTruthy();
    });

    it("should not throw and leave existing directory if it already exists", async () => {
      projectDirName = projPath;

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

      let doesDirExist = await checkIfDirectoryExistsAsync(projectDirName);
      expect(doesDirExist).toBeTruthy();
    });
  });

  describe("_getDeviceFilePath", () => {
    let project;
    let projectDirName;
    let deviceId;
    let projectContentManager;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath;
      deviceId = "testDeviceId";
    });

    let exec = async () => {
      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      return projectContentManager._getDeviceFilePath(deviceId);
    };

    it("should return absolute path to device file based on its id", async () => {
      let result = await exec();
      let expectedPath = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${deviceId}.json`)
      );
      expect(result).toEqual(expectedPath);
    });

    it("should throw if device id is empty", async () => {
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
  });

  describe("_getDeviceIdFromFileName", () => {
    let project;
    let projectDirName;
    let deviceId;
    let deviceFileName;
    let projectContentManager;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath;
      deviceId = "testDeviceId";
      deviceFileName = `${deviceId}.json`;
    });

    let exec = async () => {
      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      return projectContentManager._getDeviceIdFromFileName(deviceFileName);
    };

    it("should return deviceId based on given device file name", async () => {
      let result = await exec();
      expect(result).toEqual(deviceId);
    });

    it("should throw if device file name is empty", async () => {
      deviceFileName = undefined;

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

  describe("_getAllDeviceIdsFromDir", () => {
    let project;
    let projectDirName;
    let deviceId1;
    let deviceId2;
    let deviceId3;
    let deviceFileName1;
    let deviceFileName2;
    let deviceFileName3;
    let createDevicesDir;
    let projectContentManager;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath;
      deviceId1 = "testDeviceId1";
      deviceId2 = "testDeviceId2";
      deviceId3 = "testDeviceId3";
      deviceFileName1 = `${deviceId1}.json`;
      deviceFileName2 = `${deviceId2}.json`;
      deviceFileName3 = `${deviceId3}.json`;
      createDevicesDir = true;
    });

    let exec = async () => {
      if (createDevicesDir)
        await createDirAsync(
          path.resolve(path.join(projPath, expectedDeviceDirName))
        );

      if (createDevicesDir && deviceFileName1)
        await createFileAsync(
          path.resolve(
            path.join(projPath, expectedDeviceDirName, deviceFileName1)
          ),
          "test file 1"
        );
      if (createDevicesDir && deviceFileName2)
        await createFileAsync(
          path.resolve(
            path.join(projPath, expectedDeviceDirName, deviceFileName2)
          ),
          "test file 2"
        );
      if (createDevicesDir && deviceFileName3)
        await createFileAsync(
          path.resolve(
            path.join(projPath, expectedDeviceDirName, deviceFileName3)
          ),
          "test file 3"
        );

      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      return projectContentManager._getAllDeviceIdsFromDir();
    };

    it("should return collection of all device ids stored inside device directory", async () => {
      let result = await exec();
      expect(result).toBeDefined();
      expect(result.length).toEqual(3);
      expect(result).toContain(deviceId1);
      expect(result).toContain(deviceId2);
      expect(result).toContain(deviceId3);
    });

    it("should not throw but return empty array if device directory does not exists", async () => {
      createDevicesDir = false;

      let result = await exec();
      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });

    it("should not throw but return empty array if there are no devices in directory", async () => {
      deviceFileName1 = undefined;
      deviceFileName2 = undefined;
      deviceFileName3 = undefined;
      let result = await exec();
      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });

  describe("_checkIfDeviceDirExists", () => {
    let project;
    let projectDirName;
    let createDevicesDir;
    let projectContentManager;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath;
      createDevicesDir = true;
    });

    let exec = async () => {
      if (createDevicesDir)
        await createDirAsync(
          path.resolve(path.join(projPath, expectedDeviceDirName))
        );

      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      return projectContentManager._checkIfDeviceDirExists();
    };

    it("should return true if device directory exists", async () => {
      createDevicesDir = true;

      let result = await exec();
      expect(result).toBeTruthy();
    });

    it("should return false if device directory does not exist", async () => {
      createDevicesDir = false;

      let result = await exec();
      expect(result).toBeFalsy();
    });
  });

  describe("_createDeviceDirIfNotExists", () => {
    let project;
    let projectDirName;
    let createDevicesDir;
    let projectContentManager;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath;
      createDevicesDir = false;
    });

    let exec = async () => {
      if (createDevicesDir)
        await createDirAsync(
          path.resolve(path.join(projPath, expectedDeviceDirName))
        );

      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      return projectContentManager._createDeviceDirIfNotExists();
    };

    it("should create device directory if it does not exist", async () => {
      await exec();
      let dirExist = await checkIfDirectoryExistsAsync(
        path.resolve(path.join(projPath, expectedDeviceDirName))
      );
      expect(dirExist).toBeTruthy();
    });

    it("should not throw but leave dir untouched if directory already exists", async () => {
      createDevicesDir = true;

      await exec();
      let dirExist = await checkIfDirectoryExistsAsync(
        path.resolve(path.join(projPath, expectedDeviceDirName))
      );
      expect(dirExist).toBeTruthy();
    });
  });

  describe("_clearDeviceDir", () => {
    let project;
    let projectDirName;
    let createDevicesDir;
    let createFile1;
    let createFile2;
    let createFile3;
    let projectContentManager;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath;
      createDevicesDir = true;
      createFile1 = true;
      createFile2 = true;
      createFile3 = true;
    });

    let exec = async () => {
      if (createDevicesDir)
        await createDirAsync(
          path.resolve(path.join(projPath, expectedDeviceDirName))
        );
      if (createDevicesDir && createFile1)
        await createFileAsync(
          path.resolve(
            path.join(projPath, expectedDeviceDirName, "file1.json")
          ),
          "file1"
        );
      if (createDevicesDir && createFile2)
        await createFileAsync(
          path.resolve(
            path.join(projPath, expectedDeviceDirName, "file2.json")
          ),
          "file2"
        );
      if (createDevicesDir && createFile3)
        await createFileAsync(
          path.resolve(
            path.join(projPath, expectedDeviceDirName, "file3.json")
          ),
          "file3"
        );

      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      return projectContentManager._clearDeviceDir();
    };

    it("should clear whole device directory", async () => {
      await exec();

      let files = await readDirAsync(
        path.resolve(path.join(projPath, expectedDeviceDirName))
      );
      expect(files).toEqual([]);
    });

    it("should clear directory even if directory has already been cleaned", async () => {
      createFile1 = false;
      createFile2 = false;
      createFile3 = false;

      await exec();

      let files = await readDirAsync(
        path.resolve(path.join(projPath, expectedDeviceDirName))
      );
      expect(files).toEqual([]);
    });

    it("should not throw even if device directory does not exists", async () => {
      createDevicesDir = false;

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

      await exec();
    });
  });

  describe("_checkIfConfigFileExists", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let createConfigFile;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath;
      createConfigFile = true;
    });

    let exec = async () => {
      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      if (createConfigFile)
        await createFileAsync(
          path.resolve(path.join(projPath, expectedConfigFileName)),
          "test content"
        );

      return projectContentManager._checkIfConfigFileExists();
    };

    it("should return true if config file exists", async () => {
      createConfigFile = true;
      let result = await exec();
      expect(result).toBeTruthy();
    });

    it("should return false if config file does not exist", async () => {
      createConfigFile = false;
      let result = await exec();
      expect(result).toBeFalsy();
    });
  });

  describe("_checkConfigFileContent", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let configFileContent;
    let swVersion;
    let user1Payload;
    let user2Payload;
    let user3Payload;
    let usersArray;
    let privateKey;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath;
      swVersion = getCurrentAppVersion();

      user1Payload = {
        login: "testUser1",
        password: "123456",
        permissions: 1
      };

      user2Payload = {
        login: "testUser2",
        password: "234567",
        permissions: 2
      };

      user3Payload = {
        login: "testUser3",
        password: "345678",
        permissions: 3
      };

      usersArray = [user1Payload, user2Payload, user3Payload];

      privateKey = "testPrivateKey";
    });

    let exec = async () => {
      configFileContent = {
        swVersion: swVersion,
        users: usersArray,
        privateKey: privateKey
      };

      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      return projectContentManager._checkConfigFileContent(configFileContent);
    };

    it("should not throw if config file content is valid", async () => {
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

    it("should throw if config file has different swVersion than app version", async () => {
      swVersion = "x.x.x";

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

    it("should throw if config file content does not have swVersion", async () => {
      swVersion = undefined;

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

    it("should throw if config file content does not have users", async () => {
      usersArray = undefined;

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

  describe("_getConfigFileContentFromProject", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let commInitPayload;
    let user1Payload;
    let user2Payload;
    let user3Payload;
    let privateKey;
    let user1;
    let user2;
    let user3;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      user1Payload = {
        login: "user1",
        password: "1234",
        permissions: 1
      };
      user2Payload = {
        login: "user2",
        password: "12345",
        permissions: 2
      };
      user3Payload = {
        login: "user3",
        password: "123456",
        permissions: 3
      };
      privateKey = "1234";
    });

    let exec = async () => {
      project = new Project(projectDirName);

      projectContentManager = project.ProjectContentManager;

      await project.CommInterface.init(commInitPayload);

      project.PrivateKey = privateKey;

      if (user1Payload) user1 = await project.createUser(user1Payload);
      if (user2Payload) user2 = await project.createUser(user2Payload);
      if (user3Payload) user3 = await project.createUser(user3Payload);

      return projectContentManager._getConfigFileContentFromProject();
    };

    it("should return valid config content from project", async () => {
      let result = await exec();

      //Password stored inside user is hashed !!
      let validUser1Password = user1.Password;
      let validUser2Password = user2.Password;
      let validUser3Password = user3.Password;

      user1Payload.password = validUser1Password;
      user2Payload.password = validUser2Password;
      user3Payload.password = validUser3Password;

      let validContent = {
        swVersion: await getCurrentAppVersion(),
        users: [user1Payload, user2Payload, user3Payload],
        privateKey: privateKey
      };

      expect(result).toEqual(validContent);
    });
  });

  describe("_getConfigFileContentFromFile", () => {
    let project;
    let projectDirName;
    let createConfigFile;
    let configFileContent;
    let projectContentManager;
    let user1Payload;
    let user2Payload;
    let user3Payload;
    let privateKey;
    let user1;
    let user2;
    let user3;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath;
      createConfigFile = true;
      user1Payload = {
        login: "user1",
        password: "1234",
        permissions: 1
      };
      user2Payload = {
        login: "user2",
        password: "12345",
        permissions: 2
      };
      user3Payload = {
        login: "user3",
        password: "123456",
        permissions: 3
      };
      privateKey = "1234";

      configFileContent = {
        swVersion: await getCurrentAppVersion(),
        users: [user1Payload, user2Payload, user3Payload],
        privateKey: privateKey
      };
    });

    let exec = async () => {
      if (createConfigFile)
        await createFileAsync(
          path.resolve(path.join(projPath, expectedConfigFileName)),
          JSON.stringify(configFileContent)
        );

      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      return projectContentManager._getConfigFileContentFromFile();
    };

    it("should return config file content from file", async () => {
      let result = await exec();

      expect(result).toEqual(configFileContent);
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

  describe("_saveConfigFileContentToFile", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let createConfigFile;
    let configFileContent;
    let commInitPayload;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      createConfigFile = false;
    });

    let exec = async () => {
      if (createConfigFile) {
        await createFileAsync(
          path.resolve(path.join(projPath, expectedConfigFileName)),
          "initial config file contnet"
        );
      }

      project = new Project(projectDirName);

      projectContentManager = project.ProjectContentManager;

      project.ProjectContentManager._generateAndAssignNewPrivateKey();

      await project.CommInterface.init(commInitPayload);

      configFileContent = await projectContentManager._getConfigFileContentFromProject();

      await project.createUser({
        login: "testUser1",
        password: "1234",
        permissions: 1
      });

      await project.createUser({
        login: "testUser2",
        password: "2345",
        permissions: 2
      });

      await project.createUser({
        login: "testUser3",
        password: "3456",
        permissions: 3
      });

      return projectContentManager._saveConfigFileContentToFile(
        JSON.stringify(configFileContent)
      );
    };

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

    it("should not create new config file but over old one - if it exists", async () => {
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

  describe("loadConfigFile", () => {
    let project;
    let projectDirName;
    let projectContentManager;
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
        password: "123",
        permissions: 1
      };

      user2Payload = {
        login: "testUser2",
        password: "234",
        permissions: 2
      };

      user3Payload = {
        login: "testUser3",
        password: "345",
        permissions: 3
      };

      privateKey = "1234567";

      configFileContent = {
        swVersion: await getCurrentAppVersion(),
        users: [user1Payload, user2Payload, user3Payload],
        privateKey: privateKey
      };
    });

    let exec = async () => {
      if (createConfigFile) {
        await createFileAsync(
          path.resolve(path.join(projPath, expectedConfigFileName)),
          JSON.stringify(configFileContent)
        );
      }

      project = new Project(projectDirName);

      projectContentManager = project.ProjectContentManager;

      return projectContentManager.loadConfigFile();
    };

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

  describe("_generateUsersObjectFromProject", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let createConfigFile;
    let configFileContent;
    let user1Payload;
    let user2Payload;
    let user3Payload;
    let privateKey;
    let user1;
    let user2;
    let user3;

    beforeEach(async () => {
      projectDirName = projPath;
      createConfigFile = true;
      user1Payload = {
        login: "testUser1",
        password: await hashString("123"),
        permissions: 1
      };

      user2Payload = {
        login: "testUser2",
        password: await hashString("234"),
        permissions: 2
      };

      user3Payload = {
        login: "testUser3",
        password: await hashString("345"),
        permissions: 3
      };

      privateKey = "1234567";

      configFileContent = {
        swVersion: await getCurrentAppVersion(),
        users: [user1Payload, user2Payload, user3Payload],
        privateKey: privateKey
      };
    });

    let exec = async () => {
      await createFileAsync(
        path.resolve(path.join(projPath, expectedConfigFileName)),
        JSON.stringify(configFileContent)
      );

      project = new Project(projectDirName);

      projectContentManager = project.ProjectContentManager;

      await project.initFromFiles();

      user1 = await project.getUser(user1Payload.login);
      user2 = await project.getUser(user2Payload.login);
      user3 = await project.getUser(user3Payload.login);

      return projectContentManager._generateUsersObjectFromProject();
    };

    it("should return object contatinig all users and their payloads", async () => {
      let result = await exec();

      expect(result).toBeDefined();

      expect(result.length).toEqual(3);
      expect(result[0]).toEqual(user1.Payload);
      expect(result[1]).toEqual(user2.Payload);
      expect(result[2]).toEqual(user3.Payload);
    });
  });

  describe("saveConfigFile", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let createConfigFile;
    let configFileContent;
    let commInitPayload;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      createConfigFile = false;
    });

    let exec = async () => {
      if (createConfigFile) {
        await createFileAsync(
          path.resolve(path.join(projPath, expectedConfigFileName)),
          "initial config file contnet"
        );
      }

      project = new Project(projectDirName);

      projectContentManager = project.ProjectContentManager;

      await project.CommInterface.init(commInitPayload);

      project.PrivateKey = "12345678";

      await project.createUser({
        login: "user1",
        password: await hashString("87654321"),
        permissions: 1
      });

      await project.createUser({
        login: "user2",
        password: await hashString("987654321"),
        permissions: 2
      });

      await project.createUser({
        login: "user3",
        password: await hashString("654321"),
        permissions: 3
      });

      configFileContent = await projectContentManager._getConfigFileContentFromProject();

      return projectContentManager.saveConfigFile();
    };

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

    it("should not create new config file but over old one - if it exists", async () => {
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

  describe("_checkDeviceFileContent", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let deviceFileContent;
    let commPayload;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceFileContent = {
        type: "mbDevice",
        id: "testDeviceId"
      };
      commPayload = JSON.parse(testPayload);
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.CommInterface.init(commPayload);
      projectContentManager = project.ProjectContentManager;

      return projectContentManager._checkDeviceFileContent(deviceFileContent);
    };

    it("should not throw if device file content is valid", async () => {
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

    it("should throw if content is empty", async () => {
      deviceFileContent = undefined;

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

    it("should throw if device file content has no id defined", async () => {
      deviceFileContent.id = undefined;

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

    it("should throw if device file content has no type defined", async () => {
      deviceFileContent.type = undefined;

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
      deviceFileContent.id = "1234";

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

  describe("_getDeviceFileContentFromProject", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let deviceId;
    let commPayload;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1234";
      commPayload = JSON.parse(testPayload);
    });

    let exec = async () => {
      project = new Project(projectDirName);
      await project.CommInterface.init(commPayload);
      projectContentManager = project.ProjectContentManager;

      return projectContentManager._getDeviceFileContentFromProject(deviceId);
    };

    it("should return Payload of device of given id", async () => {
      let result = await exec();
      let device = project.CommInterface.getDevice(deviceId);

      expect(result).toEqual(device.Payload);
    });

    it("should throw if there is no device of given id", async () => {
      deviceId = "4321";

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

  describe("_getDeviceFileContentFromFile", () => {
    let project;
    let projectDirName;
    let deviceId1;
    let deviceId2;
    let deviceId3;
    let deviceFileName1;
    let deviceFileName2;
    let deviceFileName3;
    let deviceFileContent1;
    let deviceFileContent2;
    let deviceFileContent3;
    let createDevicesDir;
    let projectContentManager;
    let deviceId;

    beforeEach(async () => {
      project = "test project";
      projectDirName = projPath;
      deviceId1 = "testDeviceId1";
      deviceId2 = "testDeviceId2";
      deviceId3 = "testDeviceId3";
      deviceFileContent1 = {
        id: deviceId1,
        type: "mbDevice"
      };
      deviceFileContent2 = {
        id: deviceId2,
        type: "mbDevice"
      };
      deviceFileContent3 = {
        id: deviceId3,
        type: "mbDevice"
      };
      deviceFileName1 = `${deviceId1}.json`;
      deviceFileName2 = `${deviceId2}.json`;
      deviceFileName3 = `${deviceId3}.json`;
      createDevicesDir = true;
      deviceId = deviceId2;
    });

    let exec = async () => {
      if (createDevicesDir)
        await createDirAsync(
          path.resolve(path.join(projPath, expectedDeviceDirName))
        );

      if (createDevicesDir && deviceFileName1)
        await createFileAsync(
          path.resolve(
            path.join(projPath, expectedDeviceDirName, deviceFileName1)
          ),
          JSON.stringify(deviceFileContent1)
        );
      if (createDevicesDir && deviceFileName2)
        await createFileAsync(
          path.resolve(
            path.join(projPath, expectedDeviceDirName, deviceFileName2)
          ),
          JSON.stringify(deviceFileContent2)
        );
      if (createDevicesDir && deviceFileName3)
        await createFileAsync(
          path.resolve(
            path.join(projPath, expectedDeviceDirName, deviceFileName3)
          ),
          JSON.stringify(deviceFileContent3)
        );

      projectContentManager = new ProjectContentManager(
        project,
        projectDirName
      );

      return projectContentManager._getDeviceFileContentFromFile(deviceId);
    };

    it("should return collection content of device config file", async () => {
      deviceId = deviceId2;
      let result = await exec();

      expect(result).toEqual(deviceFileContent2);
    });

    it("should throw if there is no device of given id", async () => {
      deviceId = "9876";

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(true);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("_saveDeviceFileContentToFile", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let deviceId;
    let deviceContent;
    let createDevicesDir;
    let createDeviceFileBefore;

    beforeEach(async () => {
      projectDirName = projPath;
      deviceId = "1234";
      deviceContent = {
        id: deviceId,
        type: "mbDevice"
      };
      createDevicesDir = true;
      createDeviceFileBefore = false;
    });

    let exec = async () => {
      if (createDevicesDir)
        await createDirAsync(
          path.resolve(path.join(projPath, expectedDeviceDirName))
        );

      if (createDeviceFileBefore) {
        await createFileAsync(
          path.join(projPath, expectedDeviceDirName, `${deviceId}.json`),
          "test device content"
        );
      }

      project = new Project(projectDirName);
      projectContentManager = project.ProjectContentManager;

      return projectContentManager._saveDeviceFileContentToFile(
        deviceId,
        JSON.stringify(deviceContent)
      );
    };

    it("should save given content to device file if it doesn't exist", async () => {
      await exec();

      let deviceFilePath = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${deviceId}.json`)
      );

      let fileExist = await checkIfFileExistsAsync(deviceFilePath);

      expect(fileExist).toBeTruthy();

      let fileContent = JSON.parse(await readFileAsync(deviceFilePath));

      expect(fileContent).toEqual(deviceContent);
    });

    it("should save given content to device file if it exists", async () => {
      createDeviceFileBefore = true;

      await exec();

      let deviceFilePath = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${deviceId}.json`)
      );

      let fileExist = await checkIfFileExistsAsync(deviceFilePath);

      expect(fileExist).toBeTruthy();

      let fileContent = JSON.parse(await readFileAsync(deviceFilePath));

      expect(fileContent).toEqual(deviceContent);
    });

    it("should throw if device directory does not exists", async () => {
      createDevicesDir = false;

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

  describe("_getInitialPayloadFromFiles", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let commInitPayload;
    let createDeviceDir;
    let device1Payload;
    let device2Payload;
    let device3Payload;
    let createDevice1File;
    let createDevice2File;
    let createDevice3File;
    let corruptDevice2File;

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
      corruptDevice2File = false;
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

      if (createDeviceDir && corruptDevice2File) {
        await createFileAsync(
          path.resolve(
            path.join(
              projPath,
              expectedDeviceDirName,
              `${device2Payload.id}.json`
            )
          ),
          "Corrupted file content"
        );
      }

      project = new Project(projectDirName);

      projectContentManager = project.ProjectContentManager;

      return projectContentManager._getInitialPayloadFromFiles();
    };

    it("should create initial payload for commInterface from all device files", async () => {
      let result = await exec();

      expect(result).toEqual(commInitPayload);
    });

    it("should return {} if there is no device files", async () => {
      createDevice1File = false;
      createDevice2File = false;
      createDevice3File = false;

      let result = await exec();

      expect(result).toEqual({});
    });

    it("should not throw but return {} if there is no device directory", async () => {
      createDeviceDir = false;
      let result = undefined;
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

      expect(result).toEqual({});
    });

    it("should not throw but return valid payload for rest of files if one of files is corrupted", async () => {
      corruptDevice2File = true;

      let result = undefined;
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

      let expectedResult = {
        [device1Payload.id]: device1Payload,
        [device3Payload.id]: device3Payload
      };
      expect(result).toEqual(expectedResult);
    });
  });

  describe("saveDevice", () => {
    let project;
    let projectDirName;
    let projectContentManager;
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

      projectContentManager = project.ProjectContentManager;

      await project.CommInterface.init(commInitPayload);

      return projectContentManager.saveDevice(deviceId);
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

  describe("deleteDevice", () => {
    let project;
    let projectDirName;
    let projectContentManager;
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

      projectContentManager = project.ProjectContentManager;

      if (initCommInterfaceBasedOnPayload)
        await project.CommInterface.init(commInitPayload);
      else await project.CommInterface.init();

      return projectContentManager.deleteDevice(deviceId);
    };

    it("should remove device file of given id", async () => {
      deviceId = "1235";

      await exec();

      let file1Path = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device1Payload.id}.json`)
      );
      let file2Path = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device2Payload.id}.json`)
      );
      let file3Path = path.resolve(
        path.join(projPath, expectedDeviceDirName, `${device3Payload.id}.json`)
      );

      let file1Exists = await checkIfFileExistsAsync(file1Path);
      let file2Exists = await checkIfFileExistsAsync(file2Path);
      let file3Exists = await checkIfFileExistsAsync(file3Path);

      expect(file1Exists).toBeTruthy();
      expect(file2Exists).toBeFalsy();
      expect(file3Exists).toBeTruthy();
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

    it("should throw if there is no device dir", async () => {
      createDeviceDir = false;
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
    let projectContentManager;
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

      projectContentManager = project.ProjectContentManager;

      if (initCommInterfaceBasedOnPayload)
        await project.CommInterface.init(commInitPayload);
      else await project.CommInterface.init();

      return projectContentManager.loadDevice(deviceId);
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

  describe("saveAllDevices", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let commInitPayload;
    let deviceId;

    beforeEach(async () => {
      projectDirName = projPath;
      commInitPayload = JSON.parse(testPayload);
      createDeviceDir = true;
      device1Payload = commInitPayload["1234"];
      device2Payload = commInitPayload["1235"];
      device3Payload = commInitPayload["1236"];

      await createDirAsync(
        path.resolve(path.join(projPath, expectedDeviceDirName))
      );
    });

    let exec = async () => {
      project = new Project(projectDirName);

      projectContentManager = project.ProjectContentManager;

      await project.CommInterface.init(commInitPayload);

      return projectContentManager.saveAllDevices();
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
  });

  describe("loadAllDevices", () => {
    let project;
    let projectDirName;
    let projectContentManager;
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

    beforeEach(async () => {
      projectDirName = projPath;
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

      project = new Project(projectDirName);

      projectContentManager = project.ProjectContentManager;

      if (initCommInterfaceBasedOnPayload)
        await project.CommInterface.init(commInitPayload);
      else await project.CommInterface.init();

      return projectContentManager.loadAllDevices();
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
  });

  describe("loadProject", () => {
    let project;
    let projectDirName;
    let projectContentManager;
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
        permissions: 1,
        lang: "en"
      };

      user2Payload = {
        login: "testUser2",
        password: await hashString("23456"),
        permissions: 2,
        lang: "pl"
      };

      user3Payload = {
        login: "testUser3",
        password: await hashString("34567"),
        permissions: 3,
        lang: "en"
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

      projectContentManager = project.ProjectContentManager;

      if (initCommInterfaceBasedOnPayload)
        await project.CommInterface.init(commInitPayload);
      else await project.CommInterface.init();

      return projectContentManager.loadProject();
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

  describe("saveProject", () => {
    let project;
    let projectDirName;
    let projectContentManager;
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

      projectContentManager = project.ProjectContentManager;

      await project.CommInterface.init(commInitPayload);

      project.PrivateKey = "12345678";

      let user1Payload = {
        login: "testUser1",
        password: await hashString("123456"),
        permissions: 1
      };

      let user2Payload = {
        login: "testUser2",
        password: await hashString("345678"),
        permissions: 2
      };

      let user3Payload = {
        login: "testUser3",
        password: await hashString("456789"),
        permissions: 3
      };

      await project.createUser(user1Payload);
      await project.createUser(user2Payload);
      await project.createUser(user3Payload);

      configFileContent = await projectContentManager._getConfigFileContentFromProject();

      return projectContentManager.saveProject();
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

  describe("createEmptyProject", () => {
    let project;
    let projectDirName;
    let projectContentManager;
    let createProjectDir;
    let createConfigFile;
    let createDeviceDir;

    beforeEach(() => {
      projectDirName = path.join(projPath, "testProjectDir");
      createProjectDir = false;
      createConfigFile = false;
      createDeviceDir = false;
    });

    let exec = async () => {
      project = new Project(projectDirName);
      projectContentManager = project.ProjectContentManager;

      if (createProjectDir) {
        await createDirAsync(projectDirName);
      }

      if (createConfigFile) {
        await createFileAsync(
          path.resolve(path.join(projectDirName, expectedConfigFileName)),
          "Initial file content"
        );
      }

      if (createDeviceDir) {
        await createDirAsync(
          path.resolve(path.join(projectDirName, expectedDeviceDirName))
        );
      }

      return projectContentManager.createEmptyProject();
    };

    it("should create project directory, config file and device directory if they do not exists", async () => {
      await exec();

      let projectDirPath = projPath;
      let configFilePath = path.resolve(
        path.join(projectDirName, expectedConfigFileName)
      );
      let deviceDirPath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName)
      );

      let projectDirExists = await checkIfDirectoryExistsAsync(projectDirPath);
      let configFileExists = await checkIfFileExistsAsync(configFilePath);
      let deviceDirExists = await checkIfDirectoryExistsAsync(deviceDirPath);

      expect(projectDirExists).toBeTruthy();
      expect(configFileExists).toBeTruthy();
      expect(deviceDirExists).toBeTruthy();
    });

    it("should create new admin user with admin admin credentials", async () => {
      await exec();

      let user = project.Users["admin"];

      expect(user).toBeDefined();

      expect(user.Login).toEqual("admin");
      expect(user.Permissions).toEqual(15);
      expect(await user.passwordMatches("admin")).toBeTruthy();
    });

    it("should not throw and create config file and deviceDir even if projectDir already exists", async () => {
      createProjectDir = true;
      await exec();

      let projectDirPath = projPath;
      let configFilePath = path.resolve(
        path.join(projectDirName, expectedConfigFileName)
      );
      let deviceDirPath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName)
      );

      let projectDirExists = await checkIfDirectoryExistsAsync(projectDirPath);
      let configFileExists = await checkIfFileExistsAsync(configFilePath);
      let deviceDirExists = await checkIfDirectoryExistsAsync(deviceDirPath);

      expect(projectDirExists).toBeTruthy();
      expect(configFileExists).toBeTruthy();
      expect(deviceDirExists).toBeTruthy();
    });

    it("should create config file with appropriate payload", async () => {
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

    it("should create config file with appropriate payload even if it already exists", async () => {
      createProjectDir = true;
      createConfigFile = true;

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

    it("should create config file with appropriate payload and deviceDir even if config file already exists and deviceDir already exists", async () => {
      createProjectDir = true;
      createConfigFile = true;
      createDeviceDir = true;

      await exec();

      let projectDirPath = projPath;
      let configFilePath = path.resolve(
        path.join(projectDirName, expectedConfigFileName)
      );
      let deviceDirPath = path.resolve(
        path.join(projectDirName, expectedDeviceDirName)
      );

      let configFileContent = JSON.parse(await readFileAsync(configFilePath));

      let expectedConfigFile = {
        swVersion: getCurrentAppVersion(),
        users: [project.Users["admin"].Payload],
        privateKey: project.PrivateKey
      };

      expect(configFileContent).toEqual(expectedConfigFile);

      let projectDirExists = await checkIfDirectoryExistsAsync(projectDirPath);
      let configFileExists = await checkIfFileExistsAsync(configFilePath);
      let deviceDirExists = await checkIfDirectoryExistsAsync(deviceDirPath);

      expect(projectDirExists).toBeTruthy();
      expect(configFileExists).toBeTruthy();
      expect(deviceDirExists).toBeTruthy();
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
    let projectContentManager;
    let commInterfacePayload;

    let createProjectDir;
    let createConfigFile;
    let createDeviceDir;
    let createDevice1File;
    let createDevice2File;
    let createDevice3File;

    let configFileContent;

    let user1Payload;
    let user2Payload;
    let user3Payload;
    let privateKey;

    let device1FilePayload;
    let device2FilePayload;
    let device3FilePayload;

    let corruptDevice2File;

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
      projectContentManager = project.ProjectContentManager;

      return projectContentManager.initFromFiles();
    };

    it("should initialize project content according to files content", async () => {
      await exec();

      let expectPayload = commInterfacePayload;

      expect(project.CommInterface.Payload).toEqual(expectPayload);
    });

    it("should initialize project content according to files content - even if one file is corrupted", async () => {
      corruptDevice2File = true;

      await exec();

      let expectPayload = {
        "1234": commInterfacePayload["1234"],
        "1236": commInterfacePayload["1236"]
      };

      expect(project.CommInterface.Payload).toEqual(expectPayload);
    });

    it("should initialize project content even if there are no device files", async () => {
      createDevice1File = false;
      createDevice2File = false;
      createDevice3File = false;

      await exec();

      let expectPayload = {};

      expect(project.CommInterface.Payload).toEqual(expectPayload);
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
});
