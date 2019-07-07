const FactorElement = require("../../../classes/calculationElement/FactorElement");
const config = require("config");
const MBDevice = require("../../../classes/device/Modbus/MBDevice");
const Sampler = require("../../../classes/sampler/Sampler");

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

describe("FactorElement", () => {
  //Path to primary database
  let db1Path;
  //Path to secondary database
  let db2Path;

  beforeEach(async () => {
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
  });

  afterEach(async () => {
    await clearDirectoryAsync(db1Path);
    await clearDirectoryAsync(db2Path);
  });

  describe("constructor", () => {
    let device;

    beforeEach(() => {
      device = "test device";
    });

    let exec = () => {
      return new FactorElement(device);
    };

    it("should create and return new FactorElement", async () => {
      let result = await exec();

      expect(result).toBeDefined();
    });

    it("should assign device to FactorElement", async () => {
      let result = await exec();

      expect(result.Device).toEqual(device);
    });

    it("should create initial objects for Factor, Variable, Value", async () => {
      let result = await exec();

      expect(result.Events).toBeDefined();
      expect(result.Variable).toEqual(null);
      expect(result.Factor).toEqual(null);
      expect(result.Value).toEqual(0);
    });
  });

  describe("init", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let factorElement;
    let factorElementPayload;
    let factorElementVariableId;
    let factorElementFactor;
    let factorElementName;
    let factorElementId;
    let factorElementUnit;
    let factorElementArchived;
    let factorElementType;
    let factorElementSampleTime;
    let factorElementArchiveSampleTime;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      factorElementVariableId = "1001";
      factorElementFactor = 5;
      factorElementName = "testFactorElement";
      factorElementId = "2001";
      factorElementUnit = "TestUnit";
      factorElementArchived = true;
      factorElementSampleTime = 5;
      factorElementType = "factorElement";
      factorElementArchiveSampleTime = 10;
    });

    let exec = async () => {
      variablePayload = {
        id: variableId,
        name: "test variable",
        offset: 2,
        fCode: 3,
        getSingleFCode: 3,
        setSingleFCode: 16,
        archived: false,
        type: "mbFloat",
        unit: "A",
        value: variableValue,
        sampleTime: 1
      };

      devicePayload = {
        id: devicePayload,
        calculationElements: [],
        ipAdress: "192.168.0.2",
        isActive: false,
        name: "test device",
        portNumber: 502,
        timeout: 2000,
        type: "mbDevice",
        unitId: 1
      };

      device = new MBDevice();
      await device.init(devicePayload);

      variable = await device.createVariable(variablePayload);

      factorElementPayload = {
        id: factorElementId,
        name: factorElementName,
        sampleTime: factorElementSampleTime,
        factor: factorElementFactor,
        unit: factorElementUnit,
        archived: factorElementArchived,
        sampleTime: factorElementSampleTime,
        variableId: factorElementVariableId,
        type: factorElementType,
        archiveSampleTime: factorElementArchiveSampleTime
      };

      factorElement = new FactorElement(device);
      return factorElement.init(factorElementPayload);
    };

    it("should initialize factorElement based on given payload - set variable and its factor", async () => {
      await exec();

      expect(factorElement.Payload).toEqual(factorElementPayload);
      expect(factorElement.Variable).toEqual(variable);
      expect(factorElement.ArchiveTickId).toEqual(
        Sampler.convertSampleTimeToTickId(factorElementArchiveSampleTime)
      );
      expect(factorElement.TickId).toEqual(
        Sampler.convertSampleTimeToTickId(factorElementSampleTime)
      );
    });

    it("should set own id if id is not defined in payload", async () => {
      factorElementId = undefined;
      await exec();

      expect(factorElement.Id).toBeDefined();
    });

    it("should set archive sample time to sample if it is not defined", async () => {
      factorElementArchiveSampleTime = undefined;
      await exec();

      expect(factorElement.ArchiveSampleTime).toEqual(factorElementSampleTime);
    });

    it("should throw if there is no variable of given id in device", async () => {
      factorElementVariableId = "9999";
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
      factorElementVariableId = undefined;
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

    it("should throw if factor is not given in payload", async () => {
      factorElementFactor = undefined;
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
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let factorElement;
    let factorElementPayload;
    let factorElementVariableId;
    let factorElementFactor;
    let factorElementName;
    let factorElementId;
    let factorElementUnit;
    let factorElementArchived;
    let factorElementType;
    let factorElementSampleTime;
    let tickNumber;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      factorElementVariableId = "1001";
      factorElementFactor = 5;
      factorElementName = "testFactorElement";
      factorElementId = "2001";
      factorElementUnit = "TestUnit";
      factorElementArchived = true;
      factorElementSampleTime = 5;
      factorElementType = "factorElement";
      tickNumber = 100;
    });

    let exec = async () => {
      variablePayload = {
        id: variableId,
        name: "test variable",
        offset: 2,
        fCode: 3,
        getSingleFCode: 3,
        setSingleFCode: 16,
        archived: false,
        type: "mbFloat",
        unit: "A",
        value: variableValue,
        sampleTime: 1
      };

      devicePayload = {
        id: devicePayload,
        calculationElements: [],
        ipAdress: "192.168.0.2",
        isActive: false,
        name: "test device",
        portNumber: 502,
        timeout: 2000,
        type: "mbDevice",
        unitId: 1
      };

      device = new MBDevice();
      await device.init(devicePayload);

      variable = await device.createVariable(variablePayload);

      factorElementPayload = {
        id: factorElementId,
        name: factorElementName,
        sampleTime: factorElementSampleTime,
        factor: factorElementFactor,
        unit: factorElementUnit,
        archived: factorElementArchived,
        sampleTime: factorElementSampleTime,
        variableId: factorElementVariableId,
        type: factorElementType
      };

      factorElement = new FactorElement(device);
      await factorElement.init(factorElementPayload);
      return factorElement._onFirstRefresh(tickNumber);
    };

    it("should set variable value multiplied by factor as value", async () => {
      await exec();

      expect(factorElement.Value).toEqual(variableValue * factorElementFactor);
    });

    it("should return riable value multiplied by factor ", async () => {
      let result = await exec();

      expect(result).toEqual(variableValue * factorElementFactor);
    });
  });

  describe("_onRefresh", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let factorElement;
    let factorElementPayload;
    let factorElementVariableId;
    let factorElementFactor;
    let factorElementName;
    let factorElementId;
    let factorElementUnit;
    let factorElementArchived;
    let factorElementType;
    let factorElementSampleTime;
    let tickNumber;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      factorElementVariableId = "1001";
      factorElementFactor = 5;
      factorElementName = "testFactorElement";
      factorElementId = "2001";
      factorElementUnit = "TestUnit";
      factorElementArchived = true;
      factorElementSampleTime = 5;
      factorElementType = "factorElement";
      tickNumber = 100;
    });

    let exec = async () => {
      variablePayload = {
        id: variableId,
        name: "test variable",
        offset: 2,
        fCode: 3,
        getSingleFCode: 3,
        setSingleFCode: 16,
        archived: false,
        type: "mbFloat",
        unit: "A",
        value: variableValue,
        sampleTime: 1
      };

      devicePayload = {
        id: devicePayload,
        calculationElements: [],
        ipAdress: "192.168.0.2",
        isActive: false,
        name: "test device",
        portNumber: 502,
        timeout: 2000,
        type: "mbDevice",
        unitId: 1
      };

      device = new MBDevice();
      await device.init(devicePayload);

      variable = await device.createVariable(variablePayload);

      factorElementPayload = {
        id: factorElementId,
        name: factorElementName,
        sampleTime: factorElementSampleTime,
        factor: factorElementFactor,
        unit: factorElementUnit,
        archived: factorElementArchived,
        sampleTime: factorElementSampleTime,
        variableId: factorElementVariableId,
        type: factorElementType
      };

      factorElement = new FactorElement(device);
      await factorElement.init(factorElementPayload);
      return factorElement._onRefresh(tickNumber);
    };

    it("should set variable value multiplied by factor as value", async () => {
      await exec();

      expect(factorElement.Value).toEqual(variableValue * factorElementFactor);
    });

    it("should return riable value multiplied by factor ", async () => {
      let result = await exec();

      expect(result).toEqual(variableValue * factorElementFactor);
    });
  });

  describe("Payload", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let factorElement;
    let factorElementPayload;
    let factorElementVariableId;
    let factorElementFactor;
    let factorElementName;
    let factorElementId;
    let factorElementUnit;
    let factorElementArchived;
    let factorElementType;
    let factorElementSampleTime;
    let tickNumber;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      factorElementVariableId = "1001";
      factorElementFactor = 5;
      factorElementName = "testFactorElement";
      factorElementId = "2001";
      factorElementUnit = "TestUnit";
      factorElementArchived = true;
      factorElementSampleTime = 5;
      factorElementType = "factorElement";
      tickNumber = 100;
    });

    let exec = async () => {
      variablePayload = {
        id: variableId,
        name: "test variable",
        offset: 2,
        fCode: 3,
        getSingleFCode: 3,
        setSingleFCode: 16,
        archived: false,
        type: "mbFloat",
        unit: "A",
        value: variableValue,
        sampleTime: 1
      };

      devicePayload = {
        id: devicePayload,
        calculationElements: [],
        ipAdress: "192.168.0.2",
        isActive: false,
        name: "test device",
        portNumber: 502,
        timeout: 2000,
        type: "mbDevice",
        unitId: 1
      };

      device = new MBDevice();
      await device.init(devicePayload);

      variable = await device.createVariable(variablePayload);

      factorElementPayload = {
        id: factorElementId,
        name: factorElementName,
        sampleTime: factorElementSampleTime,
        factor: factorElementFactor,
        unit: factorElementUnit,
        archived: factorElementArchived,
        sampleTime: factorElementSampleTime,
        variableId: factorElementVariableId,
        type: factorElementType
      };

      factorElement = new FactorElement(device);
      await factorElement.init(factorElementPayload);
      return factorElement.Payload;
    };

    it("should return valid payload", async () => {
      let result = await exec();

      expect(result.id).toEqual(factorElementId);
      expect(result.name).toEqual(factorElementName);
      expect(result.sampleTime).toEqual(factorElementSampleTime);
      expect(result.factor).toEqual(factorElementFactor);
      expect(result.unit).toEqual(factorElementUnit);
      expect(result.archived).toEqual(factorElementArchived);
      expect(result.variableId).toEqual(factorElementVariableId);
      expect(result.type).toEqual(factorElementType);
    });
  });
});
