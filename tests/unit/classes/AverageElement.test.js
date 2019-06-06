const AverageElement = require("../../../classes/calculationElement/AverageElement");
const config = require("config");
const MBDevice = require("../../../classes/device/Modbus/MBDevice");

let { clearDirectoryAsync } = require("../../../utilities/utilities");

describe("AverageElement", () => {
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
      return new AverageElement(device);
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
      expect(result.Values).toEqual([]);
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
      averageElementType = "averageElement";
      averageElementCalculationInterval = 10;
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
      return averageElement.init(averageElementPayload);
    };

    it("should initialize factorElement based on given payload - set variable and its factor and calculationInterval", async () => {
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
    });

    it("should set own id if id is not defined in payload", async () => {
      averageElement = undefined;
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
  });

  describe("calculateMaxTickId", () => {
    let tickId;
    let calculationInterval;

    beforeEach(() => {
      tickId = 123;
      calculationInterval = 10;
    });

    let exec = () => {
      return AverageElement.calculateMaxTickId(tickId, calculationInterval);
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
      return AverageElement.calculateMinTickId(tickId, calculationInterval);
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
      await averageElement.init(averageElementPayload);

      return averageElement.TypeName;
    };

    it("should return averageElement name", async () => {
      let result = await exec();
      expect(result).toEqual("averageElement");
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
      await averageElement.init(averageElementPayload);

      return averageElement.ValueType;
    };

    it("should return float type", async () => {
      let result = await exec();
      expect(result).toEqual("float");
    });
  });

  describe("_resetValues", () => {
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

    let value1;
    let tickId1;
    let value2;
    let tickId2;
    let value3;
    let tickId3;

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

      value1 = 1;
      tickId1 = 10;
      value2 = 2;
      tickId2 = 20;
      value3 = 3;
      tickId3 = 30;
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
      await averageElement.init(averageElementPayload);

      averageElement._addValue(value1, tickId1);
      averageElement._addValue(value2, tickId2);
      averageElement._addValue(value3, tickId3);

      return averageElement._resetValues();
    };

    it("should remove all values from Values collection", async () => {
      await exec();
      expect(averageElement.Values).toEqual([]);
    });
  });

  describe("_addValue", () => {
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

    let value1;
    let tickId1;

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

      value1 = 1;
      tickId1 = 10;
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
      await averageElement.init(averageElementPayload);

      return averageElement._addValue(value1, tickId1);
    };

    it("should add value and its tickId to Values collection", async () => {
      await exec();
      expect(averageElement.Values.length).toEqual(1);
      expect(averageElement.Values[0].tickId).toEqual(tickId1);
      expect(averageElement.Values[0].value).toEqual(value1);
    });

    it("should throw if value is not defined", async () => {
      value1 = undefined;
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

    it("should throw if tickId is not defined", async () => {
      tickId1 = undefined;
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

  describe("_getAverage", () => {
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

    let value1;
    let tickId1;
    let value2;
    let tickId2;
    let value3;
    let tickId3;
    let value4;
    let tickId4;
    let value5;
    let tickId5;
    let lastTickId;

    let addValue1;
    let addValue2;
    let addValue3;
    let addValue4;
    let addValue5;

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

      tickId1 = 10;
      value1 = 1;

      tickId2 = 20;
      value2 = 3;

      tickId3 = 40;
      value3 = 4;

      tickId4 = 45;
      value4 = 5;

      tickId5 = 60;
      value5 = 3;

      lastTickId = 70;

      addValue1 = true;
      addValue2 = true;
      addValue3 = true;
      addValue4 = true;
      addValue5 = true;
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
      await averageElement.init(averageElementPayload);

      if (addValue1) averageElement._addValue(value1, tickId1);
      if (addValue2) averageElement._addValue(value2, tickId2);
      if (addValue3) averageElement._addValue(value3, tickId3);
      if (addValue4) averageElement._addValue(value4, tickId4);
      if (addValue5) averageElement._addValue(value5, tickId5);

      return averageElement._getAverage(lastTickId);
    };

    it("should calculate and return average based on values and tickIds", async () => {
      tickId1 = 10;
      value1 = 1;

      tickId2 = 20;
      value2 = 3;

      tickId3 = 40;
      value3 = 4;

      tickId4 = 45;
      value4 = 5;

      tickId5 = 60;
      value5 = 3;

      lastTickId = 70;

      let result = await exec();

      /**
       * tickId	Value
          10	    1   
          20	    3   -> tickIdDelta = 20-10 = 10   -> value = 10 * 1 = 10
          40	    4   -> tickIdDelta = 40-20 = 20   -> value = 20 * 3 = 60
          45	    5   -> tickIdDelta = 45-40 = 5    -> value = 5 * 4 = 20
          60	    3   -> tickIdDelta = 60-45 = 15   -> value = 15 * 5 = 75
          70	        -> tickIdDelta = 70-60 = 10   -> value = 10 * 3 = 30


          averageValue = (10 + 60 + 20 + 75 + 30 ) / (10 + 20 + 5 + 15 + 10) = 3.25
          factor = 2;
          result = 2 * 3.25 = 6.5
       */

      expect(result).toEqual(6.5);
    });

    it("should calculate and return average based on values if only one value is added", async () => {
      addValue1 = true;
      addValue2 = false;
      addValue3 = false;
      addValue4 = false;
      addValue5 = false;

      let result = await exec();

      expect(result).toEqual(value1 * averageElementFactor);
    });

    it("should return 0 if no values are added", async () => {
      addValue1 = false;
      addValue2 = false;
      addValue3 = false;
      addValue4 = false;
      addValue5 = false;

      let result = await exec();

      expect(result).toEqual(0);
    });
  });

  describe("_refreshAverage", () => {
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

    let value1;
    let tickId1;
    let value2;
    let tickId2;
    let value3;
    let tickId3;
    let value4;
    let tickId4;
    let value5;
    let tickId5;
    let maxTickId;

    let addValue1;
    let addValue2;
    let addValue3;
    let addValue4;
    let addValue5;

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

      tickId1 = 10;
      value1 = 1;

      tickId2 = 20;
      value2 = 3;

      tickId3 = 40;
      value3 = 4;

      tickId4 = 45;
      value4 = 5;

      tickId5 = 60;
      value5 = 3;

      maxTickId = 70;

      addValue1 = true;
      addValue2 = true;
      addValue3 = true;
      addValue4 = true;
      addValue5 = true;
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
      await averageElement.init(averageElementPayload);

      if (addValue1) averageElement._addValue(value1, tickId1);
      if (addValue2) averageElement._addValue(value2, tickId2);
      if (addValue3) averageElement._addValue(value3, tickId3);
      if (addValue4) averageElement._addValue(value4, tickId4);
      if (addValue5) averageElement._addValue(value5, tickId5);

      //Average is always calculated based on maxTickId of current period
      averageElement._maxTickId = maxTickId;

      return averageElement._refreshAverage();
    };

    it("should calculate set to Value and retrun  average based on values and tickIds", async () => {
      tickId1 = 10;
      value1 = 1;

      tickId2 = 20;
      value2 = 3;

      tickId3 = 40;
      value3 = 4;

      tickId4 = 45;
      value4 = 5;

      tickId5 = 60;
      value5 = 3;

      lastTickId = 70;

      let result = await exec();

      /**
       * tickId	Value
          10	    1   
          20	    3   -> tickIdDelta = 20-10 = 10   -> value = 10 * 1 = 10
          40	    4   -> tickIdDelta = 40-20 = 20   -> value = 20 * 3 = 60
          45	    5   -> tickIdDelta = 45-40 = 5    -> value = 5 * 4 = 20
          60	    3   -> tickIdDelta = 60-45 = 15   -> value = 15 * 5 = 75
          70	        -> tickIdDelta = 70-60 = 10   -> value = 10 * 3 = 30


          averageValue = (10 + 60 + 20 + 75 + 30 ) / (10 + 20 + 5 + 15 + 10) = 3.25
          factor = 2;
          result = 2 * 3.25 = 6.5
       */

      expect(averageElement.Value).toEqual(6.5);
      expect(result).toEqual(6.5);
    });

    it("should calculate set to Value and return average based on values if only one value is added", async () => {
      addValue1 = true;
      addValue2 = false;
      addValue3 = false;
      addValue4 = false;
      addValue5 = false;

      let result = await exec();

      expect(averageElement.Value).toEqual(value1 * averageElementFactor);
      expect(result).toEqual(value1 * averageElementFactor);
    });

    it("should calculate set to Value and return if no values are added", async () => {
      addValue1 = false;
      addValue2 = false;
      addValue3 = false;
      addValue4 = false;
      addValue5 = false;

      let result = await exec();

      expect(averageElement.Value).toEqual(0);
      expect(result).toEqual(0);
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
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

    let value1;
    let tickId1;
    let value2;
    let tickId2;
    let value3;
    let tickId3;
    let value4;
    let tickId4;
    let value5;
    let tickId5;
    let maxTickId;

    let addValue1;
    let addValue2;
    let addValue3;
    let addValue4;
    let addValue5;

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

      tickId1 = 10;
      value1 = 1;

      tickId2 = 20;
      value2 = 3;

      tickId3 = 40;
      value3 = 4;

      tickId4 = 45;
      value4 = 5;

      tickId5 = 60;
      value5 = 3;

      maxTickId = 70;

      addValue1 = true;
      addValue2 = true;
      addValue3 = true;
      addValue4 = true;
      addValue5 = true;
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
      await averageElement.init(averageElementPayload);

      if (addValue1) averageElement._addValue(value1, tickId1);
      if (addValue2) averageElement._addValue(value2, tickId2);
      if (addValue3) averageElement._addValue(value3, tickId3);
      if (addValue4) averageElement._addValue(value4, tickId4);
      if (addValue5) averageElement._addValue(value5, tickId5);

      //Average is always calculated based on maxTickId of current period
      averageElement._maxTickId = maxTickId;

      return averageElement._endCurrentCalculationPeriod();
    };

    it("should calculate set to Value and retrun average based on values and tickIds", async () => {
      tickId1 = 10;
      value1 = 1;

      tickId2 = 20;
      value2 = 3;

      tickId3 = 40;
      value3 = 4;

      tickId4 = 45;
      value4 = 5;

      tickId5 = 60;
      value5 = 3;

      lastTickId = 70;

      let result = await exec();

      /**
       * tickId	Value
          10	    1   
          20	    3   -> tickIdDelta = 20-10 = 10   -> value = 10 * 1 = 10
          40	    4   -> tickIdDelta = 40-20 = 20   -> value = 20 * 3 = 60
          45	    5   -> tickIdDelta = 45-40 = 5    -> value = 5 * 4 = 20
          60	    3   -> tickIdDelta = 60-45 = 15   -> value = 15 * 5 = 75
          70	        -> tickIdDelta = 70-60 = 10   -> value = 10 * 3 = 30


          averageValue = (10 + 60 + 20 + 75 + 30 ) / (10 + 20 + 5 + 15 + 10) = 3.25
          factor = 2;
          result = 2 * 3.25 = 6.5
       */

      expect(averageElement.Value).toEqual(6.5);
      expect(result).toEqual(6.5);
    });

    it("should calculate set to Value and return average based on values if only one value is added", async () => {
      addValue1 = true;
      addValue2 = false;
      addValue3 = false;
      addValue4 = false;
      addValue5 = false;

      let result = await exec();

      expect(averageElement.Value).toEqual(value1 * averageElementFactor);
      expect(result).toEqual(value1 * averageElementFactor);
    });

    it("should calculate set to Value and return if no values are added", async () => {
      addValue1 = false;
      addValue2 = false;
      addValue3 = false;
      addValue4 = false;
      addValue5 = false;

      let result = await exec();

      expect(averageElement.Value).toEqual(0);
      expect(result).toEqual(0);
    });

    it("should clear Values collection", async () => {
      let result = await exec();

      expect(averageElement.Values).toBeDefined();
      expect(averageElement.Values).toEqual([]);
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
      await averageElement.init(averageElementPayload);

      averageElement._addValue(1, 5);
      averageElement._addValue(2, 6);
      averageElement._addValue(3, 7);
      averageElement._addValue(4, 8);
      averageElement._addValue(5, 9);

      return averageElement._setNewCalculationPeriod(tickId, value);
    };

    it("should start new period - set new minTickId and maxTickId", async () => {
      let result = await exec();
      expect(averageElement.MinTickId).toEqual(10);
      expect(averageElement.MaxTickId).toEqual(20);
    });

    it("should clear all values and current one with tickId of minTickId", async () => {
      await exec();

      let expectedObject = {
        tickId: 10,
        value: value
      };

      expect(averageElement.Values.length).toEqual(1);
      expect(averageElement.Values[0]).toEqual(expectedObject);
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
      await averageElement.init(averageElementPayload);

      averageElement._addValue(1, 5);
      averageElement._addValue(2, 6);
      averageElement._addValue(3, 7);
      averageElement._addValue(4, 8);
      averageElement._addValue(5, 9);

      return averageElement._onFirstRefresh(tickId);
    };

    it("should start new period - set new minTickId and maxTickId", async () => {
      let result = await exec();
      expect(averageElement.MinTickId).toEqual(10);
      expect(averageElement.MaxTickId).toEqual(20);
    });

    it("should clear all values and add current value of variable with tickId of minTickId", async () => {
      await exec();

      let expectedObject = {
        tickId: 10,
        value: variableValue
      };

      expect(averageElement.Values.length).toEqual(1);
      expect(averageElement.Values[0]).toEqual(expectedObject);
    });

    it("should return undefined", async () => {
      let result = await exec();

      expect(result).not.toBeDefined();
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

    let startTickId;
    let startValue;

    let tickId1;
    let value1;

    let tickId2;
    let value2;

    let tickId3;
    let value3;

    let tickId4;
    let value4;

    let tickId5;
    let value5;

    let addTickStart;
    let addTick1;
    let addTick2;
    let addTick3;
    let addTick4;
    let addTick5;

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

      startTickId = 10;
      startValue = 5;

      tickId1 = 12;
      value1 = 6;

      tickId2 = 14;
      value2 = 7;

      tickId3 = 16;
      value3 = 6;

      tickId4 = 18;
      value4 = 5;

      tickId5 = 20;
      value5 = 4;

      addTickStart = true;
      addTick1 = true;
      addTick2 = true;
      addTick3 = true;
      addTick4 = true;
      addTick5 = true;
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        calculationInterval: averageElementCalculationInterval
      };

      averageElement = new AverageElement(device);
      await averageElement.init(averageElementPayload);

      let result1;
      let result2;
      let result3;
      let result4;
      let result5;

      if (addTickStart) {
        variable._value = startValue;
        await averageElement._onFirstRefresh(startTickId);
      }

      if (addTick1) {
        variable._value = value1;
        result1 = await averageElement._onRefresh(startTickId, tickId1);
      }

      if (addTick2) {
        variable._value = value2;
        result2 = await averageElement._onRefresh(tickId1, tickId2);
      }

      if (addTick3) {
        variable._value = value3;
        result3 = await averageElement._onRefresh(tickId2, tickId3);
      }

      if (addTick4) {
        variable._value = value4;
        result4 = await averageElement._onRefresh(tickId3, tickId4);
      }

      if (addTick5) {
        variable._value = value5;
        result5 = await averageElement._onRefresh(tickId4, tickId5);
      }

      return [result1, result2, result3, result4, result5];
    };

    it("should calculate average from all values and tickIds and assign it to value after period completion", async () => {
      let result = await exec();
      expect(averageElement.Value).toEqual(11.6);
    });

    it("should add all values and ids to values colllection - if there is no period change", async () => {
      addTick5 = false;
      let result = await exec();
      expect(averageElement.Values.length).toEqual(5);

      let expectedObject = [
        {
          tickId: startTickId,
          value: startValue
        },
        {
          tickId: tickId1,
          value: value1
        },
        {
          tickId: tickId2,
          value: value2
        },
        {
          tickId: tickId3,
          value: value3
        },
        {
          tickId: tickId4,
          value: value4
        }
      ];

      expect(averageElement.Values).toMatchObject(expectedObject);
    });

    it("should start new period in case period ends", async () => {
      let result = await exec();
      expect(averageElement.Values.length).toEqual(1);

      let expectedObject = [
        {
          tickId: tickId5,
          value: value5
        }
      ];

      expect(averageElement.Values).toMatchObject(expectedObject);
    });

    it("should set new value on average period ends", async () => {
      let result = await exec();
      expect(averageElement.Value).toEqual(11.6);
    });

    it("should return object with average value only on period change", async () => {
      let result = await exec();
      expect(result[0]).toBeNull();
      expect(result[1]).toBeNull();
      expect(result[2]).toBeNull();
      expect(result[3]).toBeNull();
      expect(result[4]).toBeDefined();
      expect(result[4]).toEqual(11.6);
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
        type: "float",
        unit: "A",
        value: variableValue,
        timeSample: 1
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
        type: "averageElement"
      };

      averageElement = new AverageElement(device);
      await averageElement.init(averageElementPayload);

      return averageElement.Payload;
    };

    it("should return valid payload of averageElement", async () => {
      let result = await exec();
      expect(result).toEqual(averageElementPayload);
    });

    it("should return payload, on which basis new identical averageElement can be created", async () => {
      let result = await exec();

      newAverageElement = new AverageElement(device);
      await newAverageElement.init(result);

      expect(newAverageElement.Payload).toEqual(result);
    });
  });
});
