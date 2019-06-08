const config = require("config");
const path = require("path");

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
        archived: false,
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

describe("ProjectContentManager", () => {
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
      swVersion: getCurrentAppVersion()
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

    beforeEach(async () => {
      projectDirName = projPath;
      createConfigFile = true;
      configFileContent = {
        swVersion: await getCurrentAppVersion()
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

    beforeEach(() => {
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

      configFileContent = {
        swVersion: getCurrentAppVersion()
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
        swVersion: getCurrentAppVersion()
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
      expect(device.MBDriver._client.connectTCP).toHaveBeenCalledTimes(1);
      expect(device.MBDriver._client.connectTCP.mock.calls[0][0]).toEqual(
        mbDevicePayload.ipAdress
      );
      expect(device.MBDriver._client.connectTCP.mock.calls[0][1]).toEqual({
        port: mbDevicePayload.portNumber
      });
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
      expect(device.MBDriver._client.connectTCP).toHaveBeenCalledTimes(1);
      expect(device.MBDriver._client.connectTCP.mock.calls[0][0]).toEqual(
        pac3200TCPPayload.ipAdress
      );
      expect(device.MBDriver._client.connectTCP.mock.calls[0][1]).toEqual({
        port: pac3200TCPPayload.portNumber
      });
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

    it("should not edit variables even if they are given in payload", async () => {
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
});
