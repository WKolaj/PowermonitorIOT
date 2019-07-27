const config = require("config");
const path = require("path");
const MindConnectDevice = require("../../../classes/device/SpecialDevices/MindConnectDevice/MindConnectDevice");
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
        value: 1564251575,
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
        value: 1564251576,
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
        value: 1564251577,
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
        value: 1564251578,
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
        value: 1001,
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
        value: 1002,
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
        value: 1003,
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
        value: 1004,
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

describe("MindConnectDevice", () => {
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
    let device4FilePayload = commInterfacePayload["1237"];
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
    let exec = () => {
      return new MindConnectDevice();
    };

    it("Should create new mindConnectDevice", async () => {
      let result = exec();
      expect(result).toBeDefined();
    });

    it("should create new MindConnectAgent inside MindConnectAgent", async () => {
      let result = exec();

      expect(result.DataAgent).toBeDefined();
    });

    it("should set event variables to empty array", async () => {
      let result = exec();

      expect(result.EventVariables).toEqual([]);
    });
  });

  describe("init", () => {
    let project;
    let mindConnectDevice;
    let initialPayload;

    beforeEach(async () => {
      await createInitialFiles();
      project = new Project(projPath);
      await project.initFromFiles();

      initialPayload = {
        id: "abcd1234",
        name: "testMindConnectDevice",
        type: "msAgent",
        variables: [
          {
            name: "testVariable1",
            id: "9001",
            sampleTime: 5,
            archived: false,
            unit: "U1",
            archiveSampleTime: 5,
            elementDeviceId: "1235",
            elementId: "0006",
            type: "sdVariable"
          },
          {
            name: "testVariable2",
            id: "9002",
            sampleTime: 3,
            archived: false,
            unit: "U2",
            archiveSampleTime: 3,
            elementDeviceId: "1234",
            elementId: "0002",
            type: "sdVariable"
          },
          {
            name: "testVariable3",
            id: "9003",
            sampleTime: 1,
            archived: false,
            unit: "U3",
            archiveSampleTime: 1,
            elementDeviceId: "1234",
            elementId: "0003",
            type: "sdVariable"
          }
        ],
        calculationElements: [
          {
            id: "9101",
            name: "testSumElement",
            type: "sumElement",
            archived: false,
            unit: "U4",
            sampleTime: 7,
            archiveSampleTime: 7,
            variables: [
              {
                id: "9001",
                factor: 1
              },
              {
                id: "9002",
                factor: 2
              },
              {
                id: "9003",
                factor: 3
              }
            ]
          }
        ],
        dataAgent: {
          sendingEnabled: false,
          sendingInterval: 100,
          sendFileLimit: 10,
          boardingKey: {
            content: {
              baseUrl: "https://southgate.eu1.mindsphere.io",
              iat: "testIatvalue",
              clientCredentialProfile: ["SHARED_SECRET"],
              clientId: "testClientId",
              tenant: "testTenant"
            },
            expiration: "2019-07-18T05:06:57.000Z"
          },
          numberOfSendingRetries: 15,
          variableNames: {
            9001: "msName1",
            9002: "msName2",
            9003: "msName3",
            9101: "msName4"
          },
          sendEventLimit: 10,
          eventDescriptions: {
            "1001": {
              source: "testSource1",
              severity: 20,
              description: "test event 1"
            },
            "1002": {
              source: "testSource2",
              severity: 20,
              description: "test event 2"
            },
            "1003": {
              source: "testSource3",
              severity: 20,
              description: "test event 3"
            },
            "1004": {
              source: "testSource4",
              severity: 20,
              description: "test event 4"
            },
            "1005": {
              source: "testSource5",
              severity: 20,
              description: "test event 5"
            },
            "1006": {
              source: "testSource6",
              severity: 20,
              description: "test event 6"
            },
            "1007": {
              source: "testSource7",
              severity: 20,
              description: "test event 7"
            },
            "1008": {
              source: "testSource8",
              severity: 20,
              description: "test event 8"
            },
            "1009": {
              source: "testSource9",
              severity: 20,
              description: "test event 9"
            }
          }
        },
        eventVariables: [
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0101",
            valueVarId: "0105"
          },
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0102",
            valueVarId: "0106"
          },
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0103",
            valueVarId: "0107"
          },
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0104",
            valueVarId: "0108"
          }
        ]
      };
    });

    let exec = async () => {
      mindConnectDevice = new MindConnectDevice();
      return mindConnectDevice.init(initialPayload);
    };

    it("Should initialize device based on given payload", async () => {
      await exec();

      //Building expected variables payload - values of varaibles have to be added
      let varaiblesExepcetedPayload = [];

      for (let variable of initialPayload.variables) {
        let realVariable = commInterface.getVariable(
          variable.elementDeviceId,
          variable.elementId
        );

        let variablePayload = {
          ...variable,
          value: realVariable.Value
        };

        varaiblesExepcetedPayload.push(variablePayload);
      }

      let expectedPayload = {
        ...initialPayload,
        variables: varaiblesExepcetedPayload,
        dataAgent: {
          ...initialPayload.dataAgent,
          eventBufferSize: initialPayload.eventVariables.length,
          dirPath: path.join(projPath, "dataAgents", initialPayload.id)
        }
      };
      expect(mindConnectDevice.Payload).toEqual(expectedPayload);
    });

    it("Should set size of event buffer to number of event variables - even if it is defined in dataAgent payload", async () => {
      initialPayload.dataAgent.eventBufferSize = 10;

      await exec();

      expect(mindConnectDevice.Payload.dataAgent.eventBufferSize).toEqual(
        initialPayload.eventVariables.length
      );
    });

    it("Should not set dirPath to given value if it is defined inside payload", async () => {
      initialPayload.dataAgent.dirPath = "testDirPath";

      await exec();

      let expectedDirPath = path.join(
        projPath,
        "dataAgents",
        initialPayload.id
      );

      expect(mindConnectDevice.Payload.dataAgent.dirPath).toEqual(
        expectedDirPath
      );
    });

    it("Should create directory for dataAgents if it does not exist", async () => {
      await exec();

      let expectedDirPath = path.join(projPath, "dataAgents");

      let dirExists = await checkIfDirectoryExistsAsync(expectedDirPath);

      expect(dirExists).toEqual(true);
    });

    it("Should not throw and initialize device properly if dataAgent dir already exist", async () => {
      let agentDirPath = path.join(projPath, "dataAgents");
      await createDirAsync(agentDirPath);

      await exec();

      //Building expected variables payload - values of varaibles have to be added
      let varaiblesExepcetedPayload = [];

      for (let variable of initialPayload.variables) {
        let realVariable = commInterface.getVariable(
          variable.elementDeviceId,
          variable.elementId
        );

        let variablePayload = {
          ...variable,
          value: realVariable.Value
        };

        varaiblesExepcetedPayload.push(variablePayload);
      }

      let expectedPayload = {
        ...initialPayload,
        variables: varaiblesExepcetedPayload,
        dataAgent: {
          ...initialPayload.dataAgent,
          eventBufferSize: initialPayload.eventVariables.length,
          dirPath: path.join(projPath, "dataAgents", initialPayload.id)
        }
      };
      expect(mindConnectDevice.Payload).toEqual(expectedPayload);
    });

    it("Should not throw and initialize device properly if directory for device already exist", async () => {
      let agentDirPath = path.join(projPath, "dataAgents");
      await createDirAsync(agentDirPath);

      let deviceDirPath = path.join(projPath, "dataAgents", initialPayload.id);
      await createDirAsync(deviceDirPath);

      await exec();

      //Building expected variables payload - values of varaibles have to be added
      let varaiblesExepcetedPayload = [];

      for (let variable of initialPayload.variables) {
        let realVariable = commInterface.getVariable(
          variable.elementDeviceId,
          variable.elementId
        );

        let variablePayload = {
          ...variable,
          value: realVariable.Value
        };

        varaiblesExepcetedPayload.push(variablePayload);
      }

      let expectedPayload = {
        ...initialPayload,
        variables: varaiblesExepcetedPayload,
        dataAgent: {
          ...initialPayload.dataAgent,
          eventBufferSize: initialPayload.eventVariables.length,
          dirPath: path.join(projPath, "dataAgents", initialPayload.id)
        }
      };
      expect(mindConnectDevice.Payload).toEqual(expectedPayload);
    });

    it("Should create directory for device and values and events under dataAgent dir", async () => {
      await exec();

      let expectedDirPath = path.join(
        projPath,
        "dataAgents",
        initialPayload.id
      );

      let dirExists = await checkIfDirectoryExistsAsync(expectedDirPath);

      expect(dirExists).toEqual(true);

      let expectedValuesDirPath = path.join(
        projPath,
        "dataAgents",
        initialPayload.id,
        "values"
      );

      let valuesDirExists = await checkIfDirectoryExistsAsync(
        expectedValuesDirPath
      );

      expect(valuesDirExists).toEqual(true);

      let expectedEventsDirPath = path.join(
        projPath,
        "dataAgents",
        initialPayload.id,
        "events"
      );

      let eventsDirExists = await checkIfDirectoryExistsAsync(
        expectedEventsDirPath
      );

      expect(eventsDirExists).toEqual(true);
    });

    it("Should generate new id and create directory for device and values and events under dataAgent dir - if id is not given in init payload", async () => {
      initialPayload.id = undefined;

      await exec();

      let newId = mindConnectDevice.Id;

      expect(newId).toBeDefined();

      let expectedDirPath = path.join(projPath, "dataAgents", newId);

      let dirExists = await checkIfDirectoryExistsAsync(expectedDirPath);

      expect(dirExists).toEqual(true);

      let expectedValuesDirPath = path.join(
        projPath,
        "dataAgents",
        newId,
        "values"
      );

      let valuesDirExists = await checkIfDirectoryExistsAsync(
        expectedValuesDirPath
      );

      expect(valuesDirExists).toEqual(true);

      let expectedEventsDirPath = path.join(
        projPath,
        "dataAgents",
        newId,
        "events"
      );

      let eventsDirExists = await checkIfDirectoryExistsAsync(
        expectedEventsDirPath
      );

      expect(eventsDirExists).toEqual(true);
    });

    it("should not create MindConnectAgent if boardingKey is not defined", async () => {
      //SendingEnabled should also be set to false - in order not to throw error
      initialPayload.dataAgent.sendingEnabled = false;
      initialPayload.dataAgent.boardingKey = undefined;

      await exec();
      expect(mindConnectDevice.DataAgent.MindConnectAgent).toBeNull();
    });

    it("should create MindConnectAgent if boardingKey is set inside payload", async () => {
      await exec();
      expect(mindConnectDevice.DataAgent.MindConnectAgent).toBeDefined();
    });

    it("should invoke Boarding and GetDataConfig by MindConnectAgent - if sendingEnabled is set to true", async () => {
      initialPayload.dataAgent.sendingEnabled = true;
      await exec();

      let expectedDirPath = path.join(
        projPath,
        "dataAgents",
        initialPayload.id
      );

      expect(mindConnectDevice.DataAgent.Payload).toEqual({
        ...initialPayload.dataAgent,
        eventBufferSize: initialPayload.eventVariables.length,
        dirPath: expectedDirPath
      });

      expect(
        mindConnectDevice.DataAgent.MindConnectAgent.OnBoard
      ).toHaveBeenCalledTimes(1);
      expect(
        mindConnectDevice.DataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);
    });

    it("should not invoke Boarding and GetDataConfig by MindConnectAgent - if sendingEnabled is set to false", async () => {
      initialPayload.dataAgent.sendingEnabled = false;
      await exec();

      let expectedDirPath = path.join(
        projPath,
        "dataAgents",
        initialPayload.id
      );

      expect(mindConnectDevice.DataAgent.Payload).toEqual({
        ...initialPayload.dataAgent,
        dirPath: expectedDirPath,
        eventBufferSize: initialPayload.eventVariables.length
      });

      expect(
        mindConnectDevice.DataAgent.MindConnectAgent.OnBoard
      ).not.toHaveBeenCalled();
      expect(
        mindConnectDevice.DataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).not.toHaveBeenCalled();
    });

    it("should set ReadyToSend to true if sending enabled is set to true", async () => {
      initialPayload.dataAgent.sendingEnabled = true;
      await exec();
      expect(mindConnectDevice.DataAgent.IsReadyToSend).toEqual(true);
    });

    it("should set ReadyToSend to false if sending enabled is set to false", async () => {
      initialPayload.dataAgent.sendingEnabled = false;
      await exec();
      expect(mindConnectDevice.DataAgent.IsReadyToSend).toEqual(false);
    });

    it("should throw and do not create MindConnectAgent if sendingEnabled is set to true but there is no boardingKey provided", async () => {
      initialPayload.dataAgent.sendingEnabled = true;
      initialPayload.dataAgent.boardingKey = undefined;

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

      expect(mindConnectDevice.DataAgent.MindConnectAgent).toEqual(null);
    });

    it("should not throw and set sendingEnabled to false if it is not provided", async () => {
      initialPayload.dataAgent.sendingEnabled = undefined;

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

      let expectedDirPath = path.join(
        projPath,
        "dataAgents",
        initialPayload.id
      );

      expect(mindConnectDevice.DataAgent.Payload).toEqual({
        ...initialPayload.dataAgent,
        dirPath: expectedDirPath,
        eventBufferSize: initialPayload.eventVariables.length,
        sendingEnabled: false
      });
    });

    it("should not throw and set sendFileLimit to 5 if it is not provided", async () => {
      initialPayload.dataAgent.sendFileLimit = undefined;

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

      let expectedDirPath = path.join(
        projPath,
        "dataAgents",
        initialPayload.id
      );

      expect(mindConnectDevice.DataAgent.Payload).toEqual({
        ...initialPayload.dataAgent,
        dirPath: expectedDirPath,
        eventBufferSize: initialPayload.eventVariables.length,
        sendFileLimit: 5
      });
    });

    it("should not throw and set sendingInterval to 60 if it is not provided", async () => {
      initialPayload.dataAgent.sendingInterval = undefined;

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

      let expectedDirPath = path.join(
        projPath,
        "dataAgents",
        initialPayload.id
      );

      expect(mindConnectDevice.DataAgent.Payload).toEqual({
        ...initialPayload.dataAgent,
        eventBufferSize: initialPayload.eventVariables.length,
        dirPath: expectedDirPath,
        sendingInterval: 60
      });
    });

    it("should set event buffer to 0 if there are no event variables defined", async () => {
      initialPayload.eventVariables = undefined;

      await exec();

      expect(mindConnectDevice.DataAgent.EventBufferSize).toEqual(0);
    });

    it("should set event buffer to 0 if there are no event variables defined - empty array", async () => {
      initialPayload.eventVariables = [];

      await exec();

      expect(mindConnectDevice.DataAgent.EventBufferSize).toEqual(0);
    });

    it("should set event variables to empty array if it is not defined in payload", async () => {
      initialPayload.eventVariables = undefined;

      await exec();

      expect(mindConnectDevice.EventVariables).toEqual([]);
    });

    it("should throw if its value device does not exist", async () => {
      initialPayload.eventVariables[1].valueDevId = "fakeId";
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

    it("should throw if its tick device does not exist", async () => {
      initialPayload.eventVariables[1].tickDevId = "fakeId";
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

    it("should throw if its tick variable does not exist", async () => {
      initialPayload.eventVariables[1].tickVarId = "fakeId";
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

    it("should throw if its value variable does not exist", async () => {
      initialPayload.eventVariables[1].valueVarId = "fakeId";
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

  describe("_editWithPayload", () => {
    let project;
    let mindConnectDevice;
    let initialPayload;
    let editPayload;
    let oldMSAgent;

    beforeEach(async () => {
      await createInitialFiles();
      project = new Project(projPath);
      await project.initFromFiles();

      initialPayload = {
        id: "abcd1234",
        name: "testMindConnectDevice",
        type: "msAgent",
        variables: [
          {
            name: "testVariable1",
            id: "9001",
            sampleTime: 5,
            archived: false,
            unit: "U1",
            archiveSampleTime: 5,
            elementDeviceId: "1235",
            elementId: "0006",
            type: "sdVariable"
          },
          {
            name: "testVariable2",
            id: "9002",
            sampleTime: 3,
            archived: false,
            unit: "U2",
            archiveSampleTime: 3,
            elementDeviceId: "1234",
            elementId: "0002",
            type: "sdVariable"
          },
          {
            name: "testVariable3",
            id: "9003",
            sampleTime: 1,
            archived: false,
            unit: "U3",
            archiveSampleTime: 1,
            elementDeviceId: "1234",
            elementId: "0003",
            type: "sdVariable"
          }
        ],
        calculationElements: [
          {
            id: "9101",
            name: "testSumElement",
            type: "sumElement",
            archived: false,
            unit: "U4",
            sampleTime: 7,
            archiveSampleTime: 7,
            variables: [
              {
                id: "9001",
                factor: 1
              },
              {
                id: "9002",
                factor: 2
              },
              {
                id: "9003",
                factor: 3
              }
            ]
          }
        ],
        dataAgent: {
          sendingEnabled: false,
          sendingInterval: 100,
          sendFileLimit: 10,
          boardingKey: {
            content: {
              baseUrl: "https://southgate.eu1.mindsphere.io",
              iat: "testIatvalue",
              clientCredentialProfile: ["SHARED_SECRET"],
              clientId: "testClientId",
              tenant: "testTenant"
            },
            expiration: "2019-07-18T05:06:57.000Z"
          },
          numberOfSendingRetries: 15,
          variableNames: {
            9001: "msName1",
            9002: "msName2",
            9003: "msName3",
            9101: "msName4"
          },
          sendEventLimit: 10,
          eventDescriptions: {
            "1001": {
              source: "testSource1",
              severity: 20,
              description: "test event 1"
            },
            "1002": {
              source: "testSource2",
              severity: 20,
              description: "test event 2"
            },
            "1003": {
              source: "testSource3",
              severity: 20,
              description: "test event 3"
            },
            "1004": {
              source: "testSource4",
              severity: 20,
              description: "test event 4"
            },
            "1005": {
              source: "testSource5",
              severity: 20,
              description: "test event 5"
            },
            "1006": {
              source: "testSource6",
              severity: 20,
              description: "test event 6"
            },
            "1007": {
              source: "testSource7",
              severity: 20,
              description: "test event 7"
            },
            "1008": {
              source: "testSource8",
              severity: 20,
              description: "test event 8"
            },
            "1009": {
              source: "testSource9",
              severity: 20,
              description: "test event 9"
            }
          }
        },
        eventVariables: [
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0101",
            valueVarId: "0105"
          },
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0102",
            valueVarId: "0106"
          }
        ]
      };

      editPayload = {
        name: "editedTestMindConnectDevice",
        dataAgent: {
          sendingEnabled: true,
          sendingInterval: 110,
          sendFileLimit: 11,
          boardingKey: {
            content: {
              baseUrl: "https://southgate.eu1.mindsphere.io",
              iat: "testIatvalue2",
              clientCredentialProfile: ["SHARED_SECRET"],
              clientId: "testClientId2",
              tenant: "testTenant2"
            },
            expiration: "2019-07-18T05:07:57.000Z"
          },
          numberOfSendingRetries: 3,
          variableNames: {
            9001: "msName3",
            9002: "msName4",
            9003: "msName5",
            9101: "msName6"
          },
          sendEventLimit: 11,
          eventDescriptions: {
            "1002": {
              source: "testSource2",
              severity: 20,
              description: "test event 2"
            },
            "1003": {
              source: "testSource3",
              severity: 20,
              description: "test event 3"
            },
            "1004": {
              source: "testSource4",
              severity: 20,
              description: "test event 4"
            },
            "1005": {
              source: "testSource5",
              severity: 20,
              description: "test event 5"
            },
            "1006": {
              source: "testSource6",
              severity: 20,
              description: "test event 6"
            },
            "1007": {
              source: "testSource7",
              severity: 20,
              description: "test event 7"
            },
            "1008": {
              source: "testSource8",
              severity: 20,
              description: "test event 8"
            },
            "1009": {
              source: "testSource9",
              severity: 20,
              description: "test event 9"
            },
            "1011": {
              source: "testSource11",
              severity: 20,
              description: "test event 11"
            }
          }
        },
        eventVariables: [
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0102",
            valueVarId: "0106"
          },
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0103",
            valueVarId: "0107"
          },
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0104",
            valueVarId: "0108"
          }
        ]
      };
    });

    let exec = async () => {
      mindConnectDevice = new MindConnectDevice();
      await mindConnectDevice.init(initialPayload);
      oldMSAgent = mindConnectDevice.DataAgent.MindConnectAgent;
      return mindConnectDevice.editWithPayload(editPayload);
    };

    it("Should edit device according to given payload", async () => {
      await exec();

      //Building expected variables payload - values of varaibles have to be added
      let varaiblesExepcetedPayload = [];

      for (let variable of initialPayload.variables) {
        let realVariable = commInterface.getVariable(
          variable.elementDeviceId,
          variable.elementId
        );

        let variablePayload = {
          ...variable,
          value: realVariable.Value
        };

        varaiblesExepcetedPayload.push(variablePayload);
      }

      let expectedPayload = {
        ...initialPayload,
        ...editPayload,
        variables: varaiblesExepcetedPayload,
        dataAgent: {
          ...initialPayload.dataAgent,
          ...editPayload.dataAgent,
          eventBufferSize: editPayload.eventVariables.length,
          dirPath: path.join(projPath, "dataAgents", initialPayload.id)
        }
      };
      expect(mindConnectDevice.Payload).toEqual(expectedPayload);
    });

    it("Should return edited device", async () => {
      let result = await exec();

      expect(result).toEqual(mindConnectDevice);
    });

    it("Should edit only name if only name is given in payload", async () => {
      editPayload = {
        name: editPayload.name
      };

      await exec();

      //Building expected variables payload - values of varaibles have to be added
      let varaiblesExepcetedPayload = [];

      for (let variable of initialPayload.variables) {
        let realVariable = commInterface.getVariable(
          variable.elementDeviceId,
          variable.elementId
        );

        let variablePayload = {
          ...variable,
          value: realVariable.Value
        };

        varaiblesExepcetedPayload.push(variablePayload);
      }

      let expectedPayload = {
        ...initialPayload,
        ...editPayload,
        variables: varaiblesExepcetedPayload,
        dataAgent: {
          ...initialPayload.dataAgent,
          ...editPayload.dataAgent,
          eventBufferSize: initialPayload.eventVariables.length,
          dirPath: path.join(projPath, "dataAgents", initialPayload.id)
        }
      };
      expect(mindConnectDevice.Payload).toEqual(expectedPayload);
    });

    it("Should not edit id according even if it is defined in payload", async () => {
      editPayload.id = "fakeId";
      await exec();

      expect(mindConnectDevice.Id).toEqual(initialPayload.id);
    });

    it("Should not edit agentDirPath even if it is defined in payload", async () => {
      editPayload.dataAgent.dirPath = "fakeDirPath";
      await exec();

      let expectedDirPath = path.join(
        projPath,
        "dataAgents",
        initialPayload.id
      );
      expect(mindConnectDevice.DataAgent.DirectoryPath).toEqual(
        expectedDirPath
      );
    });

    it("should invoke boarding and getting configuation if boardingKey is given and sendingEnabled is set to true - and set readyToSend to true", async () => {
      editPayload = {
        dataAgent: {
          boardingKey: editPayload.dataAgent.boardingKey,
          sendingEnabled: editPayload.dataAgent.sendingEnabled
        }
      };

      let result = await exec();

      expect(result.DataAgent.MindConnectAgent).toBeDefined();
      expect(result.DataAgent.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(
        1
      );
      expect(
        result.DataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);

      expect(result.DataAgent.IsReadyToSend).toBeTruthy();
    });

    it("should invoke boarding and getting configuation if sendingEnabled is set to true - and set readyToSend to true", async () => {
      editPayload = {
        dataAgent: {
          sendingEnabled: editPayload.dataAgent.sendingEnabled
        }
      };

      let result = await exec();

      expect(result.DataAgent.MindConnectAgent).toBeDefined();
      expect(result.DataAgent.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(
        1
      );
      expect(
        result.DataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);

      expect(result.DataAgent.IsReadyToSend).toBeTruthy();
    });

    it("should throw and not edit anything if sendingEnabled is true but there is no boarding key", async () => {
      initialPayload.dataAgent.boardingKey = undefined;

      editPayload = {
        dataAgent: {
          sendingEnabled: true
        }
      };

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

      //Building expected variables payload - values of varaibles have to be added
      let varaiblesExepcetedPayload = [];

      for (let variable of initialPayload.variables) {
        let realVariable = commInterface.getVariable(
          variable.elementDeviceId,
          variable.elementId
        );

        let variablePayload = {
          ...variable,
          value: realVariable.Value
        };

        varaiblesExepcetedPayload.push(variablePayload);
      }

      let expectedPayload = {
        ...initialPayload,
        variables: varaiblesExepcetedPayload,
        dataAgent: {
          ...initialPayload.dataAgent,
          eventBufferSize: initialPayload.eventVariables.length,
          dirPath: path.join(projPath, "dataAgents", initialPayload.id)
        }
      };
      expect(mindConnectDevice.Payload).toEqual(expectedPayload);
    });

    it("should not invoke boarding and getting configuation if boardingKey is given and sendingEnabled is already set to true, but set sendingEnabled to false - and set readyToSend to false", async () => {
      initialPayload.dataAgent.sendingEnabled = true;

      editPayload = {
        dataAgent: {
          boardingKey: editPayload.dataAgent.boardingKey
        }
      };

      let result = await exec();
      //MindConnectAgent should be reacreated
      expect(result.DataAgent.MindConnectAgent).toBeDefined();
      expect(result.DataAgent.MindConnectAgent).not.toEqual(oldMSAgent);

      //Only one time - after creating new agent while editing
      expect(result.DataAgent.MindConnectAgent.OnBoard).not.toHaveBeenCalled();
      //Only one time - after creating new agent while editing
      expect(
        result.DataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).not.toHaveBeenCalled();
      expect(result.DataAgent.SendingEnabled).toBeFalsy();

      expect(result.DataAgent.IsReadyToSend).toBeFalsy();
    });

    it("should invoke boarding again and getting configuation if boardingKey is given and sendingEnabled is given in payload as true", async () => {
      initialPayload.dataAgent.sendingEnabled = true;

      editPayload = {
        dataAgent: {
          boardingKey: editPayload.dataAgent.boardingKey,
          sendingEnabled: true
        }
      };

      let result = await exec();

      //MindConnectAgent should be reacreated
      expect(result.DataAgent.MindConnectAgent).toBeDefined();
      expect(result.DataAgent.MindConnectAgent).not.toEqual(oldMSAgent);

      //Only one time - after creating new agent while editing
      expect(result.DataAgent.MindConnectAgent.OnBoard).toHaveBeenCalled();
      //Only one time - after creating new agent while editing
      expect(
        result.DataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalled();
      expect(result.DataAgent.SendingEnabled).toBeTruthy();

      expect(result.DataAgent.IsReadyToSend).toBeTruthy();
    });

    it("should not invoke boarding but only set new boarding key if it is defined in payload", async () => {
      initialPayload.dataAgent.sendingEnabled = false;

      editPayload = {
        dataAgent: {
          boardingKey: editPayload.dataAgent.boardingKey
        }
      };

      let result = await exec();
      //MindConnectAgent should be reacreated
      expect(result.DataAgent.MindConnectAgent).toBeDefined();
      expect(result.DataAgent.MindConnectAgent).not.toEqual(oldMSAgent);

      //Only one time - after creating new agent while editing
      expect(result.DataAgent.MindConnectAgent.OnBoard).not.toHaveBeenCalled();
      //Only one time - after creating new agent while editing
      expect(
        result.DataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).not.toHaveBeenCalled();

      expect(result.DataAgent.SendingEnabled).toBeFalsy();
      expect(result.DataAgent.IsReadyToSend).toBeFalsy();
      expect(result.DataAgent.BoardingKey).toEqual(
        editPayload.dataAgent.boardingKey
      );
    });

    it("should throw and not edit anything if boarding key is invalid", async () => {
      editPayload = {
        dataAgent: {
          boardingKey: "fakeBoardingKey"
        }
      };

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
      //Building expected variables payload - values of varaibles have to be added
      let varaiblesExepcetedPayload = [];

      for (let variable of initialPayload.variables) {
        let realVariable = commInterface.getVariable(
          variable.elementDeviceId,
          variable.elementId
        );

        let variablePayload = {
          ...variable,
          value: realVariable.Value
        };

        varaiblesExepcetedPayload.push(variablePayload);
      }

      let expectedPayload = {
        ...initialPayload,
        variables: varaiblesExepcetedPayload,
        dataAgent: {
          ...initialPayload.dataAgent,
          eventBufferSize: initialPayload.eventVariables.length,
          dirPath: path.join(projPath, "dataAgents", initialPayload.id)
        }
      };
      expect(mindConnectDevice.Payload).toEqual(expectedPayload);
    });

    it("should always stick event buffer size to length of event variables - even if it is defined in payload", async () => {
      editPayload = {
        dataAgent: {
          eventBufferSize: 10
        }
      };

      await exec();

      expect(mindConnectDevice.DataAgent.EventBufferSize).toEqual(
        initialPayload.eventVariables.length
      );
    });
  });

  describe("_generateResponsePayload", () => {
    let project;
    let mindConnectDevice;
    let initialPayload;

    beforeEach(async () => {
      await createInitialFiles();
      project = new Project(projPath);
      await project.initFromFiles();

      initialPayload = {
        id: "abcd1234",
        name: "testMindConnectDevice",
        type: "msAgent",
        variables: [
          {
            name: "testVariable1",
            id: "9001",
            sampleTime: 5,
            archived: false,
            unit: "U1",
            archiveSampleTime: 5,
            elementDeviceId: "1235",
            elementId: "0006",
            type: "sdVariable"
          },
          {
            name: "testVariable2",
            id: "9002",
            sampleTime: 3,
            archived: false,
            unit: "U2",
            archiveSampleTime: 3,
            elementDeviceId: "1234",
            elementId: "0002",
            type: "sdVariable"
          },
          {
            name: "testVariable3",
            id: "9003",
            sampleTime: 1,
            archived: false,
            unit: "U3",
            archiveSampleTime: 1,
            elementDeviceId: "1234",
            elementId: "0003",
            type: "sdVariable"
          }
        ],
        calculationElements: [
          {
            id: "9101",
            name: "testSumElement",
            type: "sumElement",
            archived: false,
            unit: "U4",
            sampleTime: 7,
            archiveSampleTime: 7,
            variables: [
              {
                id: "9001",
                factor: 1
              },
              {
                id: "9002",
                factor: 2
              },
              {
                id: "9003",
                factor: 3
              }
            ]
          }
        ],
        dataAgent: {
          sendingEnabled: false,
          sendingInterval: 100,
          sendFileLimit: 10,
          boardingKey: {
            content: {
              baseUrl: "https://southgate.eu1.mindsphere.io",
              iat: "testIatvalue",
              clientCredentialProfile: ["SHARED_SECRET"],
              clientId: "testClientId",
              tenant: "testTenant"
            },
            expiration: "2019-07-18T05:06:57.000Z"
          },
          numberOfSendingRetries: 15,
          variableNames: {
            9001: "msName1",
            9002: "msName2",
            9003: "msName3",
            9101: "msName4"
          },
          sendEventLimit: 10,
          eventDescriptions: {
            "1001": {
              source: "testSource1",
              severity: 20,
              description: "test event 1"
            },
            "1002": {
              source: "testSource2",
              severity: 20,
              description: "test event 2"
            },
            "1003": {
              source: "testSource3",
              severity: 20,
              description: "test event 3"
            },
            "1004": {
              source: "testSource4",
              severity: 20,
              description: "test event 4"
            },
            "1005": {
              source: "testSource5",
              severity: 20,
              description: "test event 5"
            },
            "1006": {
              source: "testSource6",
              severity: 20,
              description: "test event 6"
            },
            "1007": {
              source: "testSource7",
              severity: 20,
              description: "test event 7"
            },
            "1008": {
              source: "testSource8",
              severity: 20,
              description: "test event 8"
            },
            "1009": {
              source: "testSource9",
              severity: 20,
              description: "test event 9"
            }
          }
        },
        eventVariables: [
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0101",
            valueVarId: "0105"
          },
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0102",
            valueVarId: "0106"
          },
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0103",
            valueVarId: "0107"
          },
          {
            tickDevId: "1237",
            valueDevId: "1237",
            tickVarId: "0104",
            valueVarId: "0108"
          }
        ]
      };
    });

    let exec = async () => {
      mindConnectDevice = new MindConnectDevice();
      await mindConnectDevice.init(initialPayload);
      return mindConnectDevice.ResponsePayload;
    };

    it("Should return valid response payload", async () => {
      let result = await exec();

      //Building expected variables payload - values of varaibles have to be added
      let varaiblesExepcetedPayload = [];

      for (let variable of initialPayload.variables) {
        let realVariable = commInterface.getVariable(
          variable.elementDeviceId,
          variable.elementId
        );

        let variablePayload = {
          ...variable,
          value: realVariable.Value
        };

        varaiblesExepcetedPayload.push(variablePayload);
      }

      let expectedPayload = {
        name: mindConnectDevice.Name,
        id: mindConnectDevice.Id,
        type: mindConnectDevice.Type,
        calculationElements: initialPayload.calculationElements,
        variables: varaiblesExepcetedPayload,
        dataAgent: {
          boardingKey: {
            content: initialPayload.dataAgent.boardingKey.content,
            expiration: initialPayload.dataAgent.boardingKey.expiration
          },
          numberOfSendingRetries:
            initialPayload.dataAgent.numberOfSendingRetries,
          sendFileLimit: initialPayload.dataAgent.sendFileLimit,
          sendingEnabled: initialPayload.dataAgent.sendingEnabled,
          sendingInterval: initialPayload.dataAgent.sendingInterval,
          variableNames: initialPayload.dataAgent.variableNames,
          sendEventLimit: initialPayload.dataAgent.sendEventLimit,
          eventDescriptions: initialPayload.dataAgent.eventDescriptions
        },
        eventVariables: initialPayload.eventVariables
      };

      expect(result).toEqual(expectedPayload);
    });

    it("Should return valid response payload if boarding key is not defined", async () => {
      //We have to check it - _getResponsePayload edits boarding key content
      initialPayload.dataAgent.boardingKey = undefined;
      let result = await exec();

      //Building expected variables payload - values of varaibles have to be added
      let varaiblesExepcetedPayload = [];

      for (let variable of initialPayload.variables) {
        let realVariable = commInterface.getVariable(
          variable.elementDeviceId,
          variable.elementId
        );

        let variablePayload = {
          ...variable,
          value: realVariable.Value
        };

        varaiblesExepcetedPayload.push(variablePayload);
      }

      let expectedPayload = {
        name: mindConnectDevice.Name,
        id: mindConnectDevice.Id,
        type: mindConnectDevice.Type,
        calculationElements: initialPayload.calculationElements,
        variables: varaiblesExepcetedPayload,
        dataAgent: {
          numberOfSendingRetries:
            initialPayload.dataAgent.numberOfSendingRetries,
          sendFileLimit: initialPayload.dataAgent.sendFileLimit,
          sendingEnabled: initialPayload.dataAgent.sendingEnabled,
          sendingInterval: initialPayload.dataAgent.sendingInterval,
          variableNames: initialPayload.dataAgent.variableNames,
          sendEventLimit: initialPayload.dataAgent.sendEventLimit,
          eventDescriptions: initialPayload.dataAgent.eventDescriptions
        },
        eventVariables: initialPayload.eventVariables
      };

      expect(result).toEqual(expectedPayload);
    });

    it("Should return valid response payload if event description is not defined", async () => {
      //We have to check it - _getResponsePayload edits boarding key content
      initialPayload.dataAgent.eventDescriptions = undefined;

      let result = await exec();

      //Building expected variables payload - values of varaibles have to be added
      let varaiblesExepcetedPayload = [];

      for (let variable of initialPayload.variables) {
        let realVariable = commInterface.getVariable(
          variable.elementDeviceId,
          variable.elementId
        );

        let variablePayload = {
          ...variable,
          value: realVariable.Value
        };

        varaiblesExepcetedPayload.push(variablePayload);
      }

      let expectedPayload = {
        name: mindConnectDevice.Name,
        id: mindConnectDevice.Id,
        type: mindConnectDevice.Type,
        calculationElements: initialPayload.calculationElements,
        variables: varaiblesExepcetedPayload,
        dataAgent: {
          boardingKey: {
            content: initialPayload.dataAgent.boardingKey.content,
            expiration: initialPayload.dataAgent.boardingKey.expiration
          },
          numberOfSendingRetries:
            initialPayload.dataAgent.numberOfSendingRetries,
          sendFileLimit: initialPayload.dataAgent.sendFileLimit,
          sendingEnabled: initialPayload.dataAgent.sendingEnabled,
          sendingInterval: initialPayload.dataAgent.sendingInterval,
          variableNames: initialPayload.dataAgent.variableNames,
          sendEventLimit: initialPayload.dataAgent.sendEventLimit,
          eventDescriptions: {}
        },
        eventVariables: initialPayload.eventVariables
      };

      expect(result).toEqual(expectedPayload);
    });

    it("Should return valid response payload if event eventVariables are not defined", async () => {
      //We have to check it - _getResponsePayload edits boarding key content
      initialPayload.eventVariables = undefined;

      let result = await exec();

      //Building expected variables payload - values of varaibles have to be added
      let varaiblesExepcetedPayload = [];

      for (let variable of initialPayload.variables) {
        let realVariable = commInterface.getVariable(
          variable.elementDeviceId,
          variable.elementId
        );

        let variablePayload = {
          ...variable,
          value: realVariable.Value
        };

        varaiblesExepcetedPayload.push(variablePayload);
      }

      let expectedPayload = {
        name: mindConnectDevice.Name,
        id: mindConnectDevice.Id,
        type: mindConnectDevice.Type,
        calculationElements: initialPayload.calculationElements,
        variables: varaiblesExepcetedPayload,
        dataAgent: {
          boardingKey: {
            content: initialPayload.dataAgent.boardingKey.content,
            expiration: initialPayload.dataAgent.boardingKey.expiration
          },
          numberOfSendingRetries:
            initialPayload.dataAgent.numberOfSendingRetries,
          sendFileLimit: initialPayload.dataAgent.sendFileLimit,
          sendingEnabled: initialPayload.dataAgent.sendingEnabled,
          sendingInterval: initialPayload.dataAgent.sendingInterval,
          variableNames: initialPayload.dataAgent.variableNames,
          sendEventLimit: initialPayload.dataAgent.sendEventLimit,
          eventDescriptions: initialPayload.dataAgent.eventDescriptions
        },
        eventVariables: []
      };

      expect(result).toEqual(expectedPayload);
    });
  });

  //TODO - TEST BELOW + TEST ROUTES!!!

  // describe("refresh", () => {
  //   let project;
  //   let mindConnectDevice;
  //   let initialPayload;
  //   let msSendMethodThrows;

  //   let invokeTick1;
  //   let tickId1;
  //   let var1Value1;
  //   let var2Value1;
  //   let var3Value1;

  //   let invokeTick2;
  //   let tickId2;
  //   let var1Value2;
  //   let var2Value2;
  //   let var3Value2;

  //   let invokeTick3;
  //   let tickId3;
  //   let var1Value3;
  //   let var2Value3;
  //   let var3Value3;

  //   let variable1;
  //   let variable2;
  //   let variable3;

  //   beforeEach(async () => {
  //     msSendMethodThrows = false;

  //     invokeTick1 = true;
  //     tickId1 = 1563701011;
  //     var1Value1 = 101.101;
  //     var2Value1 = 201;
  //     var3Value1 = 301.301;

  //     invokeTick2 = true;
  //     tickId2 = 1563701012;
  //     var1Value2 = 102.102;
  //     var2Value2 = 202;
  //     var3Value2 = 302.302;

  //     invokeTick3 = true;
  //     tickId3 = 1563701013;
  //     var1Value3 = 103.103;
  //     var2Value3 = 203;
  //     var3Value3 = 303.303;

  //     await createInitialFiles();
  //     project = new Project(projPath);
  //     await project.initFromFiles();

  //     initialPayload = {
  //       id: "abcd1234",
  //       name: "testMindConnectDevice",
  //       type: "msAgent",
  //       variables: [
  //         {
  //           name: "testVariable1",
  //           id: "9001",
  //           sampleTime: 1,
  //           archived: false,
  //           unit: "U1",
  //           archiveSampleTime: 5,
  //           elementDeviceId: "1235",
  //           elementId: "0006",
  //           type: "sdVariable"
  //         },
  //         {
  //           name: "testVariable2",
  //           id: "9002",
  //           sampleTime: 2,
  //           archived: false,
  //           unit: "U2",
  //           archiveSampleTime: 3,
  //           elementDeviceId: "1234",
  //           elementId: "0002",
  //           type: "sdVariable"
  //         },
  //         {
  //           name: "testVariable3",
  //           id: "9003",
  //           sampleTime: 3,
  //           archived: false,
  //           unit: "U3",
  //           archiveSampleTime: 1,
  //           elementDeviceId: "1234",
  //           elementId: "0003",
  //           type: "sdVariable"
  //         }
  //       ],
  //       calculationElements: [
  //         {
  //           id: "9101",
  //           name: "testSumElement",
  //           type: "sumElement",
  //           archived: false,
  //           unit: "U4",
  //           sampleTime: 2,
  //           archiveSampleTime: 2,
  //           variables: [
  //             {
  //               id: "9001",
  //               factor: 1
  //             },
  //             {
  //               id: "9002",
  //               factor: 2
  //             },
  //             {
  //               id: "9003",
  //               factor: 3
  //             }
  //           ]
  //         }
  //       ],
  //       dataAgent: {
  //         sendingEnabled: true,
  //         sendingInterval: 60,
  //         sendFileLimit: 10,
  //         boardingKey: {
  //           content: {
  //             baseUrl: "https://southgate.eu1.mindsphere.io",
  //             iat: "testIatvalue",
  //             clientCredentialProfile: ["SHARED_SECRET"],
  //             clientId: "testClientId",
  //             tenant: "testTenant"
  //           },
  //           expiration: "2019-07-18T05:06:57.000Z"
  //         },
  //         numberOfSendingRetries: 5,
  //         variableNames: {
  //           9001: "msName1",
  //           9002: "msName2",
  //           9003: "msName3",
  //           9101: "msName4"
  //         }
  //       }
  //     };
  //   });

  //   let exec = async () => {
  //     mindConnectDevice = new MindConnectDevice();
  //     await mindConnectDevice.init(initialPayload);
  //     if (msSendMethodThrows)
  //       mindConnectDevice.DataAgent.MindConnectAgent.BulkPostData = jest.fn(
  //         async () => {
  //           await snooze(100);
  //           throw new Error("testError");
  //         }
  //       );

  //     variable1 = await project.getVariable(
  //       initialPayload.variables[0].elementDeviceId,
  //       initialPayload.variables[0].elementId
  //     );
  //     variable2 = await project.getVariable(
  //       initialPayload.variables[1].elementDeviceId,
  //       initialPayload.variables[1].elementId
  //     );
  //     variable3 = await project.getVariable(
  //       initialPayload.variables[2].elementDeviceId,
  //       initialPayload.variables[2].elementId
  //     );

  //     if (invokeTick1) {
  //       variable1.Value = var1Value1;
  //       variable2.Value = var2Value1;
  //       variable3.Value = var3Value1;
  //       await mindConnectDevice.refresh(tickId1);
  //     }

  //     if (invokeTick2) {
  //       variable1.Value = var1Value2;
  //       variable2.Value = var2Value2;
  //       variable3.Value = var3Value2;
  //       await mindConnectDevice.refresh(tickId2);
  //     }

  //     if (invokeTick3) {
  //       variable1.Value = var1Value3;
  //       variable2.Value = var2Value3;
  //       variable3.Value = var3Value3;
  //       await mindConnectDevice.refresh(tickId3);
  //     }
  //   };

  //   it("Should add every varaible to Buffer if they corresponds to given tick", async () => {
  //     await exec();

  //     let expectedBufferContent = [];
  //     //For first tick 1563701011 suits only variable 1 - sampleTime 1
  //     expectedBufferContent.push({
  //       tickId: tickId1,
  //       values: [
  //         {
  //           id: initialPayload.variables[0].id,
  //           value: var1Value1
  //         }
  //       ]
  //     });

  //     //For first tick 1563701011 suits only variable 1 and 2 and calcElement 2 - sampleTime 1, 2, 2
  //     expectedBufferContent.push({
  //       tickId: tickId2,
  //       values: [
  //         {
  //           id: initialPayload.variables[0].id,
  //           value: var1Value2
  //         },
  //         {
  //           id: initialPayload.variables[1].id,
  //           value: var2Value2
  //         },
  //         {
  //           id: initialPayload.calculationElements[0].id,
  //           value: var1Value2 * 1 + var2Value2 * 2 + var3Value2 * 3
  //         }
  //       ]
  //     });

  //     //For first tick 1563701011 suits only variable 1 and 3 - sampleTime 1, 3
  //     expectedBufferContent.push({
  //       tickId: tickId3,
  //       values: [
  //         {
  //           id: initialPayload.variables[0].id,
  //           value: var1Value3
  //         },
  //         {
  //           id: initialPayload.variables[2].id,
  //           value: var3Value3
  //         }
  //       ]
  //     });

  //     expect(mindConnectDevice.DataAgent.Buffer).toEqual(expectedBufferContent);
  //   });

  //   it("Should not add anything to buffer if sendingEnabled is set to false", async () => {
  //     initialPayload.dataAgent.sendingEnabled = false;

  //     await exec();

  //     let expectedBufferContent = [];

  //     expect(mindConnectDevice.DataAgent.Buffer).toEqual(expectedBufferContent);
  //   });

  //   it("Should not add anything to buffer if no values corresponds to tickIds", async () => {
  //     //No tick ids corresponds to values 123, 124, 125 or 126
  //     initialPayload.variables[0].sampleTime = 123;
  //     initialPayload.variables[1].sampleTime = 124;
  //     initialPayload.variables[2].sampleTime = 125;
  //     initialPayload.calculationElements[0].sampleTime = 126;

  //     await exec();

  //     let expectedBufferContent = [];

  //     expect(mindConnectDevice.DataAgent.Buffer).toEqual(expectedBufferContent);
  //   });

  //   it("Should send buffer content and clear it when tickId correpsonds to sendingInterval", async () => {
  //     initialPayload.dataAgent.sendingInterval = 2;

  //     await exec();

  //     //On tickId data is being send and buffer cleared - only values of tick3 should be stored inside it;

  //     let expectedBufferContent = [];

  //     //For first tick 1563701011 suits only variable 1 and 3 - sampleTime 1, 3
  //     expectedBufferContent.push({
  //       tickId: tickId3,
  //       values: [
  //         {
  //           id: initialPayload.variables[0].id,
  //           value: var1Value3
  //         },
  //         {
  //           id: initialPayload.variables[2].id,
  //           value: var3Value3
  //         }
  //       ]
  //     });

  //     expect(mindConnectDevice.DataAgent.Buffer).toEqual(expectedBufferContent);

  //     //Rest of data should be converted to Mindsphere format and send via MindConnectAgent
  //     let tickId1Payload = {
  //       timestamp: new Date(tickId1 * 1000).toISOString(),
  //       values: [
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[0].id
  //             ],
  //           qualityCode: "0",
  //           value: var1Value1.toString()
  //         }
  //       ]
  //     };

  //     let tickId2Payload = {
  //       timestamp: new Date(tickId2 * 1000).toISOString(),
  //       values: [
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[0].id
  //             ],
  //           qualityCode: "0",
  //           value: var1Value2.toString()
  //         },
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[1].id
  //             ],
  //           qualityCode: "0",
  //           value: var2Value2.toString()
  //         },
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.calculationElements[0].id
  //             ],
  //           qualityCode: "0",
  //           value: (var1Value2 * 1 + var2Value2 * 2 + var3Value2 * 3).toString()
  //         }
  //       ]
  //     };

  //     let expectedSendPayload = [tickId1Payload, tickId2Payload];

  //     expect(
  //       mindConnectDevice.DataAgent.MindConnectAgent.BulkPostData
  //     ).toHaveBeenCalledTimes(1);
  //     expect(
  //       mindConnectDevice.DataAgent.MindConnectAgent.BulkPostData.mock
  //         .calls[0][0]
  //     ).toEqual(expectedSendPayload);
  //   });

  //   it("Should not send buffer content but clear it and save it to file when tickId correpsonds to sendingInterval and sending method throws", async () => {
  //     initialPayload.dataAgent.sendingInterval = 2;
  //     msSendMethodThrows = true;

  //     await exec();

  //     //On tickId data is being send and buffer cleared - only values of tick3 should be stored inside it;

  //     let expectedBufferContent = [];

  //     //For first tick 1563701011 suits only variable 1 and 3 - sampleTime 1, 3
  //     expectedBufferContent.push({
  //       tickId: tickId3,
  //       values: [
  //         {
  //           id: initialPayload.variables[0].id,
  //           value: var1Value3
  //         },
  //         {
  //           id: initialPayload.variables[2].id,
  //           value: var3Value3
  //         }
  //       ]
  //     });

  //     expect(mindConnectDevice.DataAgent.Buffer).toEqual(expectedBufferContent);

  //     //Rest of data should be converted to Mindsphere format and send via MindConnectAgent
  //     let tickId1Payload = {
  //       timestamp: new Date(tickId1 * 1000).toISOString(),
  //       values: [
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[0].id
  //             ],
  //           qualityCode: "0",
  //           value: var1Value1.toString()
  //         }
  //       ]
  //     };

  //     let tickId2Payload = {
  //       timestamp: new Date(tickId2 * 1000).toISOString(),
  //       values: [
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[0].id
  //             ],
  //           qualityCode: "0",
  //           value: var1Value2.toString()
  //         },
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[1].id
  //             ],
  //           qualityCode: "0",
  //           value: var2Value2.toString()
  //         },
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.calculationElements[0].id
  //             ],
  //           qualityCode: "0",
  //           value: (var1Value2 * 1 + var2Value2 * 2 + var3Value2 * 3).toString()
  //         }
  //       ]
  //     };

  //     let expectedSendPayload = [tickId1Payload, tickId2Payload];

  //     //Sending data with given payload but it throws - called five times (retrying mechanism)
  //     expect(
  //       mindConnectDevice.DataAgent.MindConnectAgent.BulkPostData
  //     ).toHaveBeenCalledTimes(5);
  //     expect(
  //       mindConnectDevice.DataAgent.MindConnectAgent.BulkPostData.mock
  //         .calls[0][0]
  //     ).toEqual(expectedSendPayload);

  //     //Checking fileBuffer

  //     let allFilesInValuesDir = await readDirAsync(
  //       path.join(projPath, "dataAgents", initialPayload.id, "values")
  //     );

  //     expect(allFilesInValuesDir.length).toEqual(1);

  //     let fileContent = JSON.parse(
  //       await readFileAsync(
  //         path.join(
  //           projPath,
  //           "dataAgents",
  //           initialPayload.id,
  //           "values",
  //           allFilesInValuesDir[0]
  //         )
  //       )
  //     );

  //     expect(fileContent).toEqual(expectedSendPayload);
  //   });

  //   it("Should send all buffered files if they exists - and tickId corresponds to sendingInterval", async () => {
  //     initialPayload.dataAgent.sendingInterval = 2;
  //     msSendMethodThrows = true;

  //     await exec();

  //     let oldBulkPostDataMock =
  //       mindConnectDevice.DataAgent.MindConnectAgent.BulkPostData;
  //     //Generating new refresh without throwing error
  //     mindConnectDevice.DataAgent.MindConnectAgent.BulkPostData = jest.fn();

  //     let var1Value4 = 104.104;
  //     let var2Value4 = 204;
  //     let var3Value4 = 304.304;
  //     let tickId4 = tickId3 + 1;

  //     variable1.Value = var1Value4;
  //     variable2.Value = var2Value4;
  //     variable3.Value = var3Value4;
  //     await mindConnectDevice.refresh(tickId4);

  //     //No data should be stored in buffer - everything send
  //     let expectedBufferContent = [];

  //     expect(mindConnectDevice.DataAgent.Buffer).toEqual(expectedBufferContent);

  //     //Rest of data should be converted to Mindsphere format and send via MindConnectAgent
  //     let tickId1Payload = {
  //       timestamp: new Date(tickId1 * 1000).toISOString(),
  //       values: [
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[0].id
  //             ],
  //           qualityCode: "0",
  //           value: var1Value1.toString()
  //         }
  //       ]
  //     };

  //     let tickId2Payload = {
  //       timestamp: new Date(tickId2 * 1000).toISOString(),
  //       values: [
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[0].id
  //             ],
  //           qualityCode: "0",
  //           value: var1Value2.toString()
  //         },
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[1].id
  //             ],
  //           qualityCode: "0",
  //           value: var2Value2.toString()
  //         },
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.calculationElements[0].id
  //             ],
  //           qualityCode: "0",
  //           value: (var1Value2 * 1 + var2Value2 * 2 + var3Value2 * 3).toString()
  //         }
  //       ]
  //     };

  //     let tickId3Payload = {
  //       timestamp: new Date(tickId3 * 1000).toISOString(),
  //       values: [
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[0].id
  //             ],
  //           qualityCode: "0",
  //           value: var1Value3.toString()
  //         },
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[2].id
  //             ],
  //           qualityCode: "0",
  //           value: var3Value3.toString()
  //         }
  //       ]
  //     };

  //     let tickId4Payload = {
  //       timestamp: new Date(tickId4 * 1000).toISOString(),
  //       values: [
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[0].id
  //             ],
  //           qualityCode: "0",
  //           value: var1Value4.toString()
  //         },
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.variables[1].id
  //             ],
  //           qualityCode: "0",
  //           value: var2Value4.toString()
  //         },
  //         {
  //           dataPointId:
  //             initialPayload.dataAgent.variableNames[
  //               initialPayload.calculationElements[0].id
  //             ],
  //           qualityCode: "0",
  //           value: (var1Value4 * 1 + var2Value4 * 2 + var3Value4 * 3).toString()
  //         }
  //       ]
  //     };

  //     //All data should have been send to Mindsphere

  //     //array containg expected bulkPostData call arguments
  //     //First - Fifth time - 5 x try to send tickId1 and tick2 - but they throws
  //     //Sixth time - try to send rest of buffer - tickId3 and tick4,
  //     //Seventh - send buffered data inside file

  //     let expectedCalls = [
  //       [tickId1Payload, tickId2Payload],
  //       [tickId1Payload, tickId2Payload],
  //       [tickId1Payload, tickId2Payload],
  //       [tickId1Payload, tickId2Payload],
  //       [tickId1Payload, tickId2Payload],
  //       [tickId3Payload, tickId4Payload],
  //       [tickId1Payload, tickId2Payload]
  //     ];

  //     expect(oldBulkPostDataMock).toHaveBeenCalledTimes(5);
  //     expect(
  //       mindConnectDevice.DataAgent.MindConnectAgent.BulkPostData
  //     ).toHaveBeenCalledTimes(2);

  //     for (let i = 0; i < 5; i++) {
  //       expect(oldBulkPostDataMock.mock.calls[i][0]).toEqual(expectedCalls[i]);
  //     }

  //     for (let i = 0; i < 2; i++) {
  //       expect(
  //         mindConnectDevice.DataAgent.MindConnectAgent.BulkPostData.mock.calls[
  //           i
  //         ][0]
  //       ).toEqual(expectedCalls[5 + i]);
  //     }

  //     //There should be no file left inside values dir
  //     let allFilesInValuesDir = await readDirAsync(
  //       path.join(projPath, "dataAgents", initialPayload.id, "values")
  //     );

  //     expect(allFilesInValuesDir).toEqual([]);
  //   });

  //   it("Should not add value to Buffer if it is NaN", async () => {
  //     var1Value1 = NaN;
  //     var1Value2 = NaN;
  //     var1Value3 = NaN;
  //     await exec();

  //     let expectedBufferContent = [];

  //     //First tick is empty - only first variable matches and it is NaN

  //     //For first tick 1563701011 suits only variable 1 and 2 and calcElement 2 - sampleTime 1, 2, 2
  //     //Calc element is also NaN - calculated based on varValue1
  //     expectedBufferContent.push({
  //       tickId: tickId2,
  //       values: [
  //         {
  //           id: initialPayload.variables[1].id,
  //           value: var2Value2
  //         }
  //       ]
  //     });

  //     //For first tick 1563701011 suits only variable 1 and 3 - sampleTime 1, 3
  //     expectedBufferContent.push({
  //       tickId: tickId3,
  //       values: [
  //         {
  //           id: initialPayload.variables[2].id,
  //           value: var3Value3
  //         }
  //       ]
  //     });

  //     expect(mindConnectDevice.DataAgent.Buffer).toEqual(expectedBufferContent);
  //   });

  //   it("Should not add value to Buffer if it is null", async () => {
  //     var1Value1 = null;
  //     var1Value2 = null;
  //     var1Value3 = null;
  //     await exec();

  //     let expectedBufferContent = [];

  //     //First tick is empty - only first variable matches and it is NaN

  //     //For first tick 1563701011 suits only variable 1 and 2 and calcElement 2 - sampleTime 1, 2, 2
  //     //Calc element is also NaN - calculated based on varValue1
  //     expectedBufferContent.push({
  //       tickId: tickId2,
  //       values: [
  //         {
  //           id: initialPayload.variables[1].id,
  //           value: var2Value2
  //         },
  //         {
  //           id: initialPayload.calculationElements[0].id,
  //           value: var1Value2 * 1 + var2Value2 * 2 + var3Value2 * 3
  //         }
  //       ]
  //     });

  //     //For first tick 1563701011 suits only variable 1 and 3 - sampleTime 1, 3
  //     expectedBufferContent.push({
  //       tickId: tickId3,
  //       values: [
  //         {
  //           id: initialPayload.variables[2].id,
  //           value: var3Value3
  //         }
  //       ]
  //     });

  //     expect(mindConnectDevice.DataAgent.Buffer).toEqual(expectedBufferContent);
  //   });

  //   it("Should not add value to Buffer if it is string", async () => {
  //     var1Value1 = "testString1";
  //     var1Value2 = "testString2";
  //     var1Value3 = "testString3";
  //     await exec();

  //     let expectedBufferContent = [];

  //     //First tick is empty - only first variable matches and it is NaN

  //     //For first tick 1563701011 suits only variable 1 and 2 and calcElement 2 - sampleTime 1, 2, 2
  //     //Calc element is also NaN - calculated based on varValue1
  //     expectedBufferContent.push({
  //       tickId: tickId2,
  //       values: [
  //         {
  //           id: initialPayload.variables[1].id,
  //           value: var2Value2
  //         }
  //       ]
  //     });

  //     //For first tick 1563701011 suits only variable 1 and 3 - sampleTime 1, 3
  //     expectedBufferContent.push({
  //       tickId: tickId3,
  //       values: [
  //         {
  //           id: initialPayload.variables[2].id,
  //           value: var3Value3
  //         }
  //       ]
  //     });

  //     expect(mindConnectDevice.DataAgent.Buffer).toEqual(expectedBufferContent);
  //   });
  // });
});
