const IncreaseElement = require("../../../classes/calculationElement/IncreaseElement");
const config = require("config");
const MBDevice = require("../../../classes/device/Modbus/MBDevice");

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

describe("IncreaseElement", () => {
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
      return new IncreaseElement(device);
    };

    it("should create new device and initialize properties with default values", () => {
      let result = exec();

      expect(result).toBeDefined();

      expect(result.Variable).toBeNull();
      expect(result.Factor).toBeNull();
      expect(result.MinTickId).toBeNull();
      expect(result.MaxTickId).toBeNull();
      expect(result.Value).toEqual(0);
      expect(result.CalculationInterval).toEqual(1);
      expect(result.MinValue).toBeNull();
      expect(result.MaxValue).toBeNull();
      expect(result.Overflow).toBeNull();
      expect(result.CalculationActive).toBeFalsy();
      expect(result.StartTime).toBeNull();
    });

    it("should assign device to Device property", () => {
      let result = exec();
      expect(result.Device).toBeDefined();
      expect(result.Device).toEqual(device);
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

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementType;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;
    let averageElementArchiveSampleTime;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementType = "increaseElement";
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;
      averageElementArchiveSampleTime = 20;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        type: averageElementType,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow,
        archiveSampleTime: averageElementArchiveSampleTime
      };

      averageElement = new IncreaseElement(device);
      return averageElement.init(averageElementPayload);
    };

    it("should initialize increaseElement based on given payload", async () => {
      await exec();

      expect(averageElement.Payload).toEqual(averageElementPayload);
      expect(averageElement.Variable).toEqual(variable);
      expect(averageElement.CalculationInterval).toEqual(
        averageElementCalculationInterval
      );

      expect(averageElement.Id).toEqual(averageElementId);
      expect(averageElement.Name).toEqual(averageElementName);
      expect(averageElement.SampleTime).toEqual(averageElementSampleTime);
      expect(averageElement.Unit).toEqual(averageElementUnit);
      expect(averageElement.Archived).toEqual(averageElementArchived);
      expect(averageElement.Overflow).toEqual(averageElementOverflow);
    });

    it("should set own id if id is not defined in payload", async () => {
      averageElementId = undefined;
      await exec();

      expect(averageElement.Id).toBeDefined();
    });

    it("should throw if there is no variable of given id in device", async () => {
      averageElementVariableId = "9999";
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
      averageElementVariableId = undefined;
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
      averageElementFactor = undefined;
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

    it("should throw if calculationInterval is not given in payload", async () => {
      averageElementCalculationInterval = undefined;
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

    it("should throw if overflow is not given in payload", async () => {
      averageElementOverflow = undefined;
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

  describe("calculateMaxTickId", () => {
    let tickId;
    let calculationInterval;

    beforeEach(() => {
      tickId = 123;
      calculationInterval = 10;
    });

    let exec = () => {
      return IncreaseElement.calculateMaxTickId(tickId, calculationInterval);
    };

    it("should return 130 if 123 is given", () => {
      let result = exec();

      expect(result).toEqual(130);
    });

    it("should return 140 if 130 is given", () => {
      tickId = 130;
      let result = exec();

      expect(result).toEqual(140);
    });

    it("should return the same number if calc interval is 0", () => {
      calculationInterval = 0;
      let result = exec();

      expect(result).toEqual(123);
    });

    it("should return the same number incremented by one if calc interval is 1", () => {
      calculationInterval = 1;
      let result = exec();

      expect(result).toEqual(124);
    });
  });

  describe("calculateMinTickId", () => {
    let tickId;
    let calculationInterval;

    beforeEach(() => {
      tickId = 123;
      calculationInterval = 10;
    });

    let exec = () => {
      return IncreaseElement.calculateMinTickId(tickId, calculationInterval);
    };

    it("should return maximum tick id for given calculation interval and tick id", () => {
      let result = exec();

      expect(result).toEqual(120);
    });

    it("should return 120 if 120 is given", () => {
      tickId = 120;
      let result = exec();

      expect(result).toEqual(120);
    });

    it("should return the same number if calc interval is 0", () => {
      calculationInterval = 0;
      let result = exec();

      expect(result).toEqual(123);
    });

    it("should return the same number if calc interval is 1", () => {
      calculationInterval = 0;
      let result = exec();

      expect(result).toEqual(123);
    });
  });

  describe("TypeName", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      return averageElement.Type;
    };

    it("should return averageElement name", async () => {
      let result = await exec();
      expect(result).toEqual("increaseElement");
    });
  });

  describe("ValueType", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      return averageElement.ValueType;
    };

    it("should return float type", async () => {
      let result = await exec();
      expect(result).toEqual("float");
    });
  });

  describe("_calculateIncrease", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;
    let averageElementMaxValue;
    let averageElementMinValue;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;
      averageElementMinValue = 10;
      averageElementMaxValue = 20;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      averageElement._minValue = averageElementMinValue;
      averageElement._maxValue = averageElementMaxValue;

      return averageElement._calculateIncrease();
    };

    it("should return differance between maxValue and minValue multipied by factor if maxValue is greater than minValue", async () => {
      let result = await exec();

      let expectedResult =
        averageElementFactor *
        (averageElementMaxValue - averageElementMinValue);

      expect(result).toEqual(expectedResult);
    });

    it("should return 0 if there is no differance between maxValue and minValue", async () => {
      averageElementMaxValue = averageElementMinValue;

      let result = await exec();

      expect(result).toEqual(0);
    });

    it("should include overflow in calculation if maxValue is smaller than minValue", async () => {
      averageElementMaxValue = 10;
      averageElementMinValue = 20;

      let result = await exec();

      let expectedResult =
        averageElementFactor *
        (averageElementOverflow -
          averageElementMinValue +
          averageElementMaxValue);

      expect(result).toEqual(expectedResult);
    });
  });

  describe("_refreshIncrease", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;
    let averageElementMaxValue;
    let averageElementMinValue;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;
      averageElementMinValue = 10;
      averageElementMaxValue = 20;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      averageElement._minValue = averageElementMinValue;
      averageElement._maxValue = averageElementMaxValue;

      return averageElement._refreshIncrease();
    };

    it("should assign to Value differance between maxValue and minValue multipied by factor if maxValue is greater than minValue", async () => {
      let result = await exec();

      let expectedResult =
        averageElementFactor *
        (averageElementMaxValue - averageElementMinValue);

      expect(averageElement.Value).toEqual(expectedResult);
    });

    it("should assign to Value 0 if there is no differance between maxValue and minValue", async () => {
      averageElementMaxValue = averageElementMinValue;

      let result = await exec();

      expect(averageElement.Value).toEqual(0);
    });

    it("should include overflow in calculation if maxValue is smaller than minValue", async () => {
      averageElementMaxValue = 10;
      averageElementMinValue = 20;

      let result = await exec();

      let expectedResult =
        averageElementFactor *
        (averageElementOverflow -
          averageElementMinValue +
          averageElementMaxValue);

      expect(averageElement.Value).toEqual(expectedResult);
    });

    it("should return calculated increase", async () => {
      let result = await exec();

      let expectedResult =
        averageElementFactor *
        (averageElementMaxValue - averageElementMinValue);

      expect(result).toEqual(expectedResult);
    });
  });

  describe("_shouldStartNewCalculationPeriod", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;

    let maxTickId;
    let minTickId;
    let tickId;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;

      maxTickId = 10;
      minTickId = 20;
      tickId = 15;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      averageElement._maxTickId = maxTickId;
      averageElement._minTickId = minTickId;

      return averageElement._shouldStartNewCalculationPeriod(tickId);
    };

    it("should return false if tickId is inside _minTickId : _maxTickId", async () => {
      minTickId = 10;
      maxTickId = 20;
      tickId = 15;

      let result = await exec();

      expect(result).toEqual(false);
    });

    it("should return false if tickId is equal to _minTickId", async () => {
      minTickId = 10;
      maxTickId = 20;
      tickId = 10;

      let result = await exec();

      expect(result).toEqual(false);
    });

    it("should return true if tickId is gerater than to _maxTickId", async () => {
      minTickId = 10;
      maxTickId = 20;
      tickId = 21;

      let result = await exec();

      expect(result).toEqual(true);
    });

    it("should return true if tickId is equal to _maxTickId", async () => {
      minTickId = 10;
      maxTickId = 20;
      tickId = 20;

      let result = await exec();

      expect(result).toEqual(true);
    });
  });

  describe("_endCurrentCalculationPeriod", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;

    let minValue;
    let value;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;

      value = 200;
      minValue = 100;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      averageElement._minValue = minValue;

      return averageElement._endCurrentCalculationPeriod(value);
    };

    it("should calculate increase between minValue and value set as an argument multiplied by factor and assign it to Value", async () => {
      let result = await exec();

      let expectedResult = averageElementFactor * (value - minValue);

      expect(averageElement.Value).toEqual(expectedResult);
    });
  });

  describe("_setNewCalculationPeriod", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;

    let tickId;
    let value;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;

      //random values
      tickId = 15;
      value = 5;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      return averageElement._setNewCalculationPeriod(tickId, value);
    };

    it("should start new period - set new minTickId and maxTickId", async () => {
      let result = await exec();
      expect(averageElement.MinTickId).toEqual(10);
      expect(averageElement.MaxTickId).toEqual(20);
    });

    it("should set given value as MinValue", async () => {
      await exec();

      expect(averageElement.MinValue).toEqual(value);
    });
  });

  describe("_startCalculation", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;
    let averageElementCalculationActive;

    let tickId;
    let value;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;
      averageElementCalculationActive = false;

      //random values
      tickId = 15;
      value = 5;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      averageElement._calculationActive = averageElementCalculationActive;

      return averageElement._startCalculation(tickId, value);
    };

    it("should start new period - set new minTickId and maxTickId", async () => {
      let result = await exec();
      expect(averageElement.MinTickId).toEqual(10);
      expect(averageElement.MaxTickId).toEqual(20);
    });

    it("should set given value as MinValue", async () => {
      await exec();

      expect(averageElement.MinValue).toEqual(value);
    });

    it("should not do anything if element already started calculation", async () => {
      averageElementCalculationActive = true;
      await exec();

      expect(averageElement.MinTickId).toBeNull();
      expect(averageElement.MaxTickId).toBeNull();
      expect(averageElement.MinValue).toBeNull();
      expect(averageElement.MaxValue).toBeNull();
    });
  });

  describe("_startCalculation", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;
    let averageElementCalculationActive;

    let tickId;
    let startTime;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;
      averageElementCalculationActive = false;

      //random values
      tickId = 15;
      startTime = 10;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      averageElement._startTime = startTime;

      return averageElement._shouldStartCalculation(tickId);
    };

    it("should return true if given tickId is greater than startTime", async () => {
      tickId = 15;
      startTime = 10;

      let result = await exec();
      expect(result).toBeTruthy();
    });

    it("should return true if given tickId is equal to startTime", async () => {
      tickId = 15;
      startTime = 15;

      let result = await exec();
      expect(result).toBeTruthy();
    });

    it("should return false if given tickId is smaller to startTime", async () => {
      tickId = 10;
      startTime = 15;

      let result = await exec();
      expect(result).toBeFalsy();
    });
  });

  describe("_setStartTime", () => {
    let device;
    let deviceId;
    let devicePayload;
    let variableId;
    let variableValue;
    let variablePayload;
    let variable;

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;
    let averageElementCalculationActive;

    let tickId;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;
      averageElementCalculationActive = false;

      //random values
      tickId = 15;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      return averageElement._setStartTime(tickId);
    };

    it("should set startTime according to calculateMaxTickId method", async () => {
      await exec();

      let expectedResult = IncreaseElement.calculateMaxTickId(
        tickId,
        averageElementCalculationInterval
      );

      expect(averageElement.StartTime).toEqual(expectedResult);
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

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;
    let averageElementCalculationActive;

    let tickId;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;
      averageElementCalculationActive = false;

      //random values
      tickId = 15;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      return averageElement._onFirstRefresh(tickId);
    };

    it("should set startTime according to calculateMaxTickId method", async () => {
      await exec();

      let expectedResult = IncreaseElement.calculateMaxTickId(
        tickId,
        averageElementCalculationInterval
      );

      expect(averageElement.StartTime).toEqual(expectedResult);
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

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;
    let averageElementCalculationActive;

    let startTime;
    let tickId;
    let currentPeriodValue;
    let currentPeriodTickNumber;
    let setCurrentPeriod;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;
      averageElementCalculationActive = true;

      startTime = 5;
      //Period - 10 : 20
      currentPeriodTickNumber = 15;
      currentPeriodValue = 123;
      setCurrentPeriod = true;

      tickId = 25;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        overflow: averageElementOverflow
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);
      averageElement._calculationActive = averageElementCalculationActive;
      averageElement._startTime = startTime;

      //Setting period
      if (setCurrentPeriod)
        averageElement._setNewCalculationPeriod(
          currentPeriodTickNumber,
          currentPeriodValue
        );

      return averageElement._onRefresh(
        tickId - averageElementSampleTime,
        tickId
      );
    };

    it("should do and return nothing if calculation is not active and startTime is greater than tickId", async () => {
      startTime = 100;
      currentPeriodTickNumber = 15; //-> period 10:20
      currentPeriodValue = 100; //-> this is set to MinValue
      tickId = 25; // -> new period
      variableValue = 125; // -> element should calculate difference between 100 and 125

      averageElementCalculationActive = false;
      let result = await exec();

      expect(result).not.toBeDefined();
      //it should not start calculation mechanism if tickNumber is not greater than startTime
      expect(averageElement.CalculationActive).toBeFalsy();
    });

    it("should return nothing but activate calculation if calculation is not active and startTime is less than tickId", async () => {
      //Stop faking about adding period
      setCurrentPeriod = false;

      averageElementCalculationActive = false;

      startTime = 5;
      tickId = 25; // -> new period 20:30
      variableValue = 125;

      let result = await exec();

      expect(result).not.toBeDefined();

      expect(averageElement.CalculationActive).toEqual(true);
      expect(averageElement.MinTickId).toEqual(20);
      expect(averageElement.MaxTickId).toEqual(30);
      expect(averageElement.MinValue).toEqual(variableValue);
    });

    it("should end current period and start new one if tickNumber is greater than MaxTickId", async () => {
      currentPeriodTickNumber = 15; //-> period 10:20
      currentPeriodValue = 100; //-> this is set to MinValue
      tickId = 25; // -> new period
      variableValue = 125; // -> element should calculate difference between 100 and 125

      let result = await exec();

      //value of lastPeriod should be returned
      expect(result).toEqual(
        averageElementFactor * (variableValue - currentPeriodValue)
      );

      //calculated increase should be set to Value
      expect(averageElement.Value).toEqual(
        averageElementFactor * (variableValue - currentPeriodValue)
      );

      //New period starts from 20
      expect(averageElement.MinTickId).toEqual(20);

      //MinValue should be set from value given as an argument
      expect(averageElement.MinValue).toEqual(variableValue);
    });

    it("should not do anything and not return anything if tickNumber is lestt than MaxTickId", async () => {
      currentPeriodTickNumber = 15; //-> period 10:20
      currentPeriodValue = 100; //-> this is set to MinValue
      tickId = 18; // -> new period
      variableValue = 125; // -> element should calculate difference between 100 and 125

      let result = await exec();

      //value of lastPeriod should be returned
      expect(result).not.toBeDefined();
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

    let averageElement;
    let averageElementPayload;
    let averageElementVariableId;
    let averageElementFactor;
    let averageElementName;
    let averageElementId;
    let averageElementUnit;
    let averageElementArchived;
    let averageElementSampleTime;
    let averageElementCalculationInterval;
    let averageElementOverflow;

    let tickId;
    let value;

    beforeEach(() => {
      deviceId = "0001";
      variableId = "1001";
      variableValue = 10;
      averageElementVariableId = "1001";
      averageElementFactor = 2;
      averageElementName = "testAverageElement";
      averageElementId = "2001";
      averageElementUnit = "TestUnit";
      averageElementArchived = true;
      averageElementSampleTime = 1;
      averageElementCalculationInterval = 10;
      averageElementOverflow = 100;
      averageElementArchieveSampleTime = 20;

      //random values
      tickId = 15;
      value = 5;
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

      averageElementPayload = {
        id: averageElementId,
        name: averageElementName,
        sampleTime: averageElementSampleTime,
        factor: averageElementFactor,
        unit: averageElementUnit,
        archived: averageElementArchived,
        sampleTime: averageElementSampleTime,
        variableId: averageElementVariableId,
        calculationInterval: averageElementCalculationInterval,
        type: "increaseElement",
        overflow: averageElementOverflow,
        archiveSampleTime: averageElementArchieveSampleTime
      };

      averageElement = new IncreaseElement(device);
      await averageElement.init(averageElementPayload);

      return averageElement.Payload;
    };

    it("should return valid payload of averageElement", async () => {
      let result = await exec();
      expect(result).toEqual(averageElementPayload);
    });

    it("should return payload, on which basis new identical averageElement can be created", async () => {
      let result = await exec();

      newAverageElement = new IncreaseElement(device);
      await newAverageElement.init(result);

      expect(newAverageElement.Payload).toEqual(result);
    });
  });
});
