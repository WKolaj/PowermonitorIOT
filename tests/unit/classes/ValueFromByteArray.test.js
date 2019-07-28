const config = require("config");
const path = require("path");
const ValueFromByteArray = require("../../../classes/calculationElement/ValueFromByteArray");
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
        value: 1564251578,
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
        value: 1564251577,
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
        value: 1564251576,
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
        value: 1564251575,
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
        value: 1004,
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
        value: 1003,
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
        value: 1002,
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
        value: 1001,
        type: "mbInt32",
        archived: false,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "",
        archiveSampleTime: 1
      },
      {
        id: "0109",
        sampleTime: 1,
        name: "test byte array",
        offset: 20,
        length: 1,
        fCode: 3,
        type: "mbByteArray",
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

describe("ValueFromByteArray", () => {
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
    let mbDevice;

    beforeEach(async () => {
      await createInitialFiles();
      project = new Project(projPath);
      await project.initFromFiles();
      mbDevice = await project.getDevice("1237");
    });

    let exec = async () => {
      return new ValueFromByteArray(mbDevice);
    };

    it("should create and return new ValueFromByteArray element", async () => {
      let result = await exec();

      expect(result).toBeDefined();
    });

    it("should assign device to ValueFromByteArray", async () => {
      let result = await exec();

      expect(result.Device).toEqual(mbDevice);
    });

    it("should create initial objects for ByteNumber, BitNumber, Length, Variable, Value", async () => {
      let result = await exec();

      expect(result.Events).toBeDefined();
      expect(result.ByteNumber).toEqual(0);
      expect(result.BitNumber).toEqual(0);
      expect(result.Length).toEqual(1);
      expect(result.Variable).toEqual(null);
      expect(result.Value).toEqual(0);
    });
  });

  describe("init", () => {
    let mbDevice;
    let element;
    let initialPayload;

    beforeEach(async () => {
      await createInitialFiles();
      project = new Project(projPath);
      await project.initFromFiles();
      mbDevice = await project.getDevice("1237");
      initialPayload = {
        id: "1111",
        bitNumber: 1,
        byteNumber: 2,
        length: 3,
        variableId: "0109",
        name: "testElement",
        unit: "A",
        archived: true,
        sampleTime: 5,
        archiveSampleTime: 10,
        type: "valueFromByteArray"
      };
    });

    let exec = async () => {
      element = new ValueFromByteArray(mbDevice);
      return element.init(initialPayload);
    };

    it("should initialize valueFromByteArray based on given payload ", async () => {
      await exec();

      expect(element.Payload).toEqual(initialPayload);
    });

    it("should set own id if id is not defined in payload", async () => {
      initialPayload.id = undefined;
      await exec();

      expect(element.Id).toBeDefined();
    });

    it("should set archive sample time to sample if it is not defined", async () => {
      initialPayload.archiveSampleTime = undefined;
      await exec();

      expect(element.ArchiveSampleTime).toEqual(initialPayload.sampleTime);
    });

    it("should set length to 1 if it is not defined in payload", async () => {
      initialPayload.length = undefined;
      await exec();

      expect(element.Length).toEqual(1);
    });

    it("should set Value to 0", async () => {
      await exec();

      expect(element.Value).toEqual(0);
    });

    it("should throw if there is no variable of given id in device", async () => {
      initialPayload.variableId = "9999";
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

    it("should throw if variableId is not given in payload", async () => {
      initialPayload.variableId = undefined;
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

    it("should throw if variableId is not not id of byteArray", async () => {
      initialPayload.variableId = "0102";
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

    it("should throw if bitNumber is not given in payload", async () => {
      initialPayload.bitNumber = undefined;
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

    it("should throw if byteNumber is not given in payload", async () => {
      initialPayload.byteNumber = undefined;
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

  describe("_onFirstRefresh", () => {
    let mbDevice;
    let element;
    let initialPayload;
    let initialByteArrayValue;
    let byteArrayVariable;
    let tickNumber;

    beforeEach(async () => {
      //85 -  0 1 0 1 0 1 0 1
      //170 - 1 0 1 0 1 0 1 0
      initialByteArrayValue = [85, 170];
      tickNumber = 5;
      await createInitialFiles();
      project = new Project(projPath);
      await project.initFromFiles();
      mbDevice = await project.getDevice("1237");
      initialPayload = {
        id: "1111",
        bitNumber: 2,
        byteNumber: 1,
        length: 3,
        variableId: "0109",
        name: "testElement",
        unit: "A",
        archived: true,
        sampleTime: 5,
        archiveSampleTime: 10,
        type: "valueFromByteArray"
      };
      byteArrayVariable = await project.getVariable("1237", "0109");
    });

    let exec = async () => {
      byteArrayVariable.Value = initialByteArrayValue;
      element = new ValueFromByteArray(mbDevice);
      await element.init(initialPayload);
      return element._onFirstRefresh(tickNumber);
    };

    it("should set value according to byteArray content", async () => {
      //byte 1, bit 2, length 3
      //array [0 1 0 1 0 1 0 1, 1 0 1 0 1 0 1 0] -> byte 1, bit 2, length 3 = [0 1 0] -> 1 * 2^1 = 2
      await exec();

      expect(element.Value).toEqual(2);
    });

    it("should return value according to byteArray content", async () => {
      //byte 1, bit 2, length 3
      //array [0 1 0 1 0 1 0 1, 1 0 1 0 1 0 1 0] -> byte 1, bit 2, length 3 = [0 1 0] -> 1 * 2^1 = 2
      let result = await exec();

      expect(result).toEqual(2);
    });

    it("should set value according to byteArray content - if all bits are set", async () => {
      initialByteArrayValue = [85, 28];
      //byte 1, bit 2, length 3
      //array [0 1 0 1 0 1 0 1, 0 0 0 1 1 1 0 0] -> byte 1, bit 2, length 3 = [1 1 1] -> 7
      await exec();

      expect(element.Value).toEqual(7);
    });

    it("should set value according to byteArray content - if all bits are reset", async () => {
      initialByteArrayValue = [85, 227];
      //byte 1, bit 2, length 3
      //array [0 1 0 1 0 1 0 1, 1 1 1 0 0 0 1 1] -> byte 1, bit 2, length 3 = [0 0 0] -> 0
      await exec();

      expect(element.Value).toEqual(0);
    });

    it("should set value to 0 if byte number exceeds length of array", async () => {
      initialPayload.byteNumber = 10;

      await exec();

      expect(element.Value).toEqual(0);
    });

    it("should set value to 0 if bit number exceeds length of array", async () => {
      initialPayload.bitNumber = 10;

      await exec();

      expect(element.Value).toEqual(0);
    });

    it("should set value according to one bit - if length is 1 and bit is set", async () => {
      initialPayload.length = 1;
      initialByteArrayValue = [85, 4];
      //byte 1, bit 2, length 1
      //array [0 1 0 1 0 1 0 1, 0 0 0 0 0 1 0 0] -> byte 1, bit 2, length 1 = [1] -> 1
      await exec();

      expect(element.Value).toEqual(1);
    });

    it("should set value according to one bit - if length is 1 and bit is reset", async () => {
      initialPayload.length = 1;
      initialByteArrayValue = [85, 251];
      //byte 1, bit 2, length 1
      //array [0 1 0 1 0 1 0 1, 1 1 1 1 1 0 1 1] -> byte 1, bit 2, length 1 = [0] -> 0
      await exec();

      expect(element.Value).toEqual(0);
    });
  });

  describe("_onRefresh", () => {
    let mbDevice;
    let element;
    let initialPayload;
    let initialByteArrayValue;
    let byteArrayVariable;
    let tickNumber;

    beforeEach(async () => {
      //85 -  0 1 0 1 0 1 0 1
      //170 - 1 0 1 0 1 0 1 0
      initialByteArrayValue = [85, 170];
      tickNumber = 5;
      await createInitialFiles();
      project = new Project(projPath);
      await project.initFromFiles();
      mbDevice = await project.getDevice("1237");
      initialPayload = {
        id: "1111",
        bitNumber: 2,
        byteNumber: 1,
        length: 3,
        variableId: "0109",
        name: "testElement",
        unit: "A",
        archived: true,
        sampleTime: 5,
        archiveSampleTime: 10,
        type: "valueFromByteArray"
      };
      byteArrayVariable = await project.getVariable("1237", "0109");
    });

    let exec = async () => {
      byteArrayVariable.Value = initialByteArrayValue;
      element = new ValueFromByteArray(mbDevice);
      await element.init(initialPayload);
      return element._onRefresh(tickNumber);
    };

    it("should set value according to byteArray content", async () => {
      //byte 1, bit 2, length 3
      //array [0 1 0 1 0 1 0 1, 1 0 1 0 1 0 1 0] -> byte 1, bit 2, length 3 = [0 1 0] -> 1 * 2^1 = 2
      await exec();

      expect(element.Value).toEqual(2);
    });

    it("should return value according to byteArray content", async () => {
      //byte 1, bit 2, length 3
      //array [0 1 0 1 0 1 0 1, 1 0 1 0 1 0 1 0] -> byte 1, bit 2, length 3 = [0 1 0] -> 1 * 2^1 = 2
      let result = await exec();

      expect(result).toEqual(2);
    });

    it("should set value according to byteArray content - if all bits are set", async () => {
      initialByteArrayValue = [85, 28];
      //byte 1, bit 2, length 3
      //array [0 1 0 1 0 1 0 1, 0 0 0 1 1 1 0 0] -> byte 1, bit 2, length 3 = [1 1 1] -> 7
      await exec();

      expect(element.Value).toEqual(7);
    });

    it("should set value according to byteArray content - if all bits are reset", async () => {
      initialByteArrayValue = [85, 227];
      //byte 1, bit 2, length 3
      //array [0 1 0 1 0 1 0 1, 1 1 1 0 0 0 1 1] -> byte 1, bit 2, length 3 = [0 0 0] -> 0
      await exec();

      expect(element.Value).toEqual(0);
    });

    it("should set value to 0 if byte number exceeds length of array", async () => {
      initialPayload.byteNumber = 10;

      await exec();

      expect(element.Value).toEqual(0);
    });

    it("should set value to 0 if bit number exceeds length of array", async () => {
      initialPayload.bitNumber = 10;

      await exec();

      expect(element.Value).toEqual(0);
    });

    it("should set value according to one bit - if length is 1 and bit is set", async () => {
      initialPayload.length = 1;
      initialByteArrayValue = [85, 4];
      //byte 1, bit 2, length 1
      //array [0 1 0 1 0 1 0 1, 0 0 0 0 0 1 0 0] -> byte 1, bit 2, length 1 = [1] -> 1
      await exec();

      expect(element.Value).toEqual(1);
    });

    it("should set value according to one bit - if length is 1 and bit is reset", async () => {
      initialPayload.length = 1;
      initialByteArrayValue = [85, 251];
      //byte 1, bit 2, length 1
      //array [0 1 0 1 0 1 0 1, 1 1 1 1 1 0 1 1] -> byte 1, bit 2, length 1 = [0] -> 0
      await exec();

      expect(element.Value).toEqual(0);
    });
  });

  describe("Payload", () => {
    let mbDevice;
    let element;
    let initialPayload;

    beforeEach(async () => {
      await createInitialFiles();
      project = new Project(projPath);
      await project.initFromFiles();
      mbDevice = await project.getDevice("1237");
      initialPayload = {
        id: "1111",
        bitNumber: 1,
        byteNumber: 2,
        length: 3,
        variableId: "0109",
        name: "testElement",
        unit: "A",
        archived: true,
        sampleTime: 5,
        archiveSampleTime: 10,
        type: "valueFromByteArray"
      };
    });

    let exec = async () => {
      element = new ValueFromByteArray(mbDevice);
      return element.init(initialPayload);
    };

    it("should be possible to recreate element based on its payload ", async () => {
      await exec();

      let newElement = new ValueFromByteArray(mbDevice);

      await newElement.init(element.Payload);

      expect(newElement.Payload).toEqual(initialPayload);
    });
  });
});
