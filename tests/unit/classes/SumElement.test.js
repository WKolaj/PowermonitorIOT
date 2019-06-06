const SumElement = require("../../../classes/calculationElement/SumElement");
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

describe("SumElement", () => {
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
      return new SumElement(device);
    };

    it("should create and return new SumElement", async () => {
      let result = await exec();

      expect(result).toBeDefined();
    });

    it("should assign device to SumElement", async () => {
      let result = await exec();

      expect(result.Device).toEqual(device);
    });

    it("should create initial objects for Events, Variables, SumValue, Unit", async () => {
      let result = await exec();

      expect(result.Events).toBeDefined();
      expect(result.Variables).toEqual({});
      expect(result._sumValue).toEqual(0);
      expect(result.Value).toEqual(0);
      expect(result.Unit).toEqual("");
    });
  });

  describe("init", () => {
    //#region auxVariables
    let device;
    let sumElement;

    let devicePayload;
    let deviceId;

    let deviceVariable1Payload;
    let deviceVariable1Id;
    let deviceVariable1Type;
    let deviceVariable1Archived;
    let deviceVariable1Value;

    let deviceVariable2Payload;
    let deviceVariable2Id;
    let deviceVariable2Type;
    let deviceVariable2Archived;
    let deviceVariable2Value;

    let deviceVariable3Payload;
    let deviceVariable3Id;
    let deviceVariable3Type;
    let deviceVariable3Archived;
    let deviceVariable3Value;

    let deviceVariable4Payload;
    let deviceVariable4Id;
    let deviceVariable4Type;
    let deviceVariable4Archived;
    let deviceVariable4Value;

    let deviceVariable5Payload;
    let deviceVariable5Id;
    let deviceVariable5Type;
    let deviceVariable5Archived;
    let deviceVariable5Value;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementSampleTime;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementVariable1Payload;
    let sumElementVariable1Id;
    let sumElementVariable1Factor;
    let sumElementVariable2Payload;
    let sumElementVariable2Id;
    let sumElementVariable2Factor;
    let sumElementVariable3Payload;
    let sumElementVariable3Id;
    let sumElementVariable3Factor;

    let addVariables;
    let customVariablesPayload;

    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      deviceVariable1Id = "0001";
      deviceVariable1Type = "int32";
      deviceVariable1Archived = false;
      deviceVariable1Value = 1;

      deviceVariable2Id = "0002";
      deviceVariable2Type = "int32";
      deviceVariable2Archived = false;
      deviceVariable2Value = 2;

      deviceVariable3Id = "0003";
      deviceVariable3Type = "float";
      deviceVariable3Archived = false;
      deviceVariable3Value = 3;

      deviceVariable4Id = "0004";
      deviceVariable4Type = "float";
      deviceVariable4Archived = false;
      deviceVariable4Value = 4.5;

      deviceVariable5Id = "0005";
      deviceVariable5Type = "float";
      deviceVariable5Archived = false;
      deviceVariable5Value = 6.5;

      sumElementVariable1Id = "0002";
      sumElementVariable1Factor = 1;

      sumElementVariable2Id = "0003";
      sumElementVariable2Factor = 2;

      sumElementVariable3Id = "0004";
      sumElementVariable3Factor = -3;

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = true;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      addVariables = true;
      customVariablesPayload = undefined;
    });

    let exec = async () => {
      deviceVariable1Payload = {
        id: deviceVariable1Id,
        type: deviceVariable1Type,
        archived: deviceVariable1Archived,
        value: deviceVariable1Value,
        timeSample: 1,
        name: "variable1",
        offset: 1,
        fCode: deviceVariable1Type === "boolean" ? 15 : 3
      };

      deviceVariable2Payload = {
        id: deviceVariable2Id,
        type: deviceVariable2Type,
        archived: deviceVariable2Archived,
        value: deviceVariable2Value,
        timeSample: 2,
        name: "variable2",
        offset: 3,
        fCode: deviceVariable2Type === "boolean" ? 15 : 3
      };

      deviceVariable3Payload = {
        id: deviceVariable3Id,
        type: deviceVariable3Type,
        archived: deviceVariable3Archived,
        value: deviceVariable3Value,
        timeSample: 3,
        name: "variable3",
        offset: 5,
        fCode: deviceVariable3Type === "boolean" ? 15 : 3
      };

      deviceVariable4Payload = {
        id: deviceVariable4Id,
        type: deviceVariable4Type,
        archived: deviceVariable4Archived,
        value: deviceVariable4Value,
        timeSample: 4,
        name: "variable4",
        offset: 7,
        fCode: deviceVariable4Type === "boolean" ? 15 : 3
      };

      deviceVariable5Payload = {
        id: deviceVariable5Id,
        type: deviceVariable5Type,
        archived: deviceVariable5Archived,
        value: deviceVariable5Value,
        timeSample: 5,
        name: "variable5",
        offset: 9,
        fCode: deviceVariable5Type === "boolean" ? 15 : 3
      };

      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [
          deviceVariable1Payload,
          deviceVariable2Payload,
          deviceVariable3Payload,
          deviceVariable4Payload,
          deviceVariable5Payload
        ],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementVariable1Payload = {
        id: sumElementVariable1Id,
        factor: sumElementVariable1Factor
      };

      sumElementVariable2Payload = {
        id: sumElementVariable2Id,
        factor: sumElementVariable2Factor
      };

      sumElementVariable3Payload = {
        id: sumElementVariable3Id,
        factor: sumElementVariable3Factor
      };

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        unit: sumElementUnit,
        sampleTime: sumElementSampleTime,
        variables: addVariables
          ? [
              sumElementVariable1Payload,
              sumElementVariable2Payload,
              sumElementVariable3Payload
            ]
          : customVariablesPayload
      };

      sumElement = new SumElement(device);
      return sumElement.init(sumElementPayload);
    };

    it("should initialize SumElement based on its payload", async () => {
      await exec();

      expect(sumElement.Name).toEqual(sumElementName);
      expect(sumElement.Id).toEqual(sumElementId);
      expect(sumElement.Archived).toEqual(sumElementArchived);
      expect(sumElement.Unit).toEqual(sumElementUnit);
      expect(sumElement.SampleTime).toEqual(sumElementSampleTime);
    });

    it("should assign variables based on given payload", async () => {
      await exec();

      let variable1 = device.getVariable(sumElementVariable1Id);
      let variable2 = device.getVariable(sumElementVariable2Id);
      let variable3 = device.getVariable(sumElementVariable3Id);

      expect(sumElement.Variables).toBeDefined();
      expect(Object.keys(sumElement.Variables).length).toEqual(3);

      expect(sumElement.Variables[variable1.Id]).toBeDefined();
      expect(sumElement.Variables[variable1.Id].variable).toBeDefined();
      expect(sumElement.Variables[variable1.Id].variable).toEqual(variable1);
      expect(sumElement.Variables[variable1.Id].variable).toBeDefined();
      expect(sumElement.Variables[variable1.Id].factor).toEqual(
        sumElementVariable1Factor
      );

      expect(sumElement.Variables[variable2.Id]).toBeDefined();
      expect(sumElement.Variables[variable2.Id].variable).toBeDefined();
      expect(sumElement.Variables[variable2.Id].variable).toEqual(variable2);
      expect(sumElement.Variables[variable2.Id].factor).toEqual(
        sumElementVariable2Factor
      );

      expect(sumElement.Variables[variable3.Id]).toBeDefined();
      expect(sumElement.Variables[variable3.Id].variable).toBeDefined();
      expect(sumElement.Variables[variable3.Id].variable).toEqual(variable3);
      expect(sumElement.Variables[variable3.Id].factor).toEqual(
        sumElementVariable3Factor
      );
    });

    it("should assign only these variables that are stored inside device", async () => {
      sumElementVariable2Id = "8765";

      await exec();

      //Should add all variables expect 2nd
      let variable1 = device.getVariable(sumElementVariable1Id);
      let variable3 = device.getVariable(sumElementVariable3Id);

      expect(sumElement.Variables).toBeDefined();
      expect(Object.keys(sumElement.Variables).length).toEqual(2);

      expect(sumElement.Variables[variable1.Id]).toBeDefined();
      expect(sumElement.Variables[variable1.Id].variable).toBeDefined();
      expect(sumElement.Variables[variable1.Id].variable).toEqual(variable1);
      expect(sumElement.Variables[variable1.Id].variable).toBeDefined();
      expect(sumElement.Variables[variable1.Id].factor).toEqual(
        sumElementVariable1Factor
      );

      expect(sumElement.Variables[variable3.Id]).toBeDefined();
      expect(sumElement.Variables[variable3.Id].variable).toBeDefined();
      expect(sumElement.Variables[variable3.Id].variable).toEqual(variable3);
      expect(sumElement.Variables[variable3.Id].factor).toEqual(
        sumElementVariable3Factor
      );
    });

    it("should initialize SumElement if variables are undefined", async () => {
      addVariables = false;
      customVariablesPayload = undefined;

      await exec();

      expect(sumElement.Name).toEqual(sumElementName);
      expect(sumElement.Id).toEqual(sumElementId);
      expect(sumElement.Archived).toEqual(sumElementArchived);
      expect(sumElement.Unit).toEqual(sumElementUnit);

      expect(sumElement.Variables).toEqual({});
    });

    it("should initialize SumElement if variables are empty", async () => {
      addVariables = false;
      customVariablesPayload = [];

      await exec();

      expect(sumElement.Name).toEqual(sumElementName);
      expect(sumElement.Id).toEqual(sumElementId);
      expect(sumElement.Archived).toEqual(sumElementArchived);
      expect(sumElement.Unit).toEqual(sumElementUnit);

      expect(sumElement.Variables).toEqual({});
    });

    it("should set own id if SumElement id is not defined", async () => {
      sumElementId = undefined;

      await exec();

      expect(sumElement.Id).not.toEqual(sumElementId);
      expect(sumElement.Id).toBeDefined();
    });

    it("should set unit to empty string if unit is not defined", async () => {
      sumElementUnit = undefined;

      await exec();

      expect(sumElement.Unit).not.toEqual(sumElementUnit);
      expect(sumElement.Unit).toEqual("");
    });

    it("should set archive to false if it is not defined in payload", async () => {
      sumElementArchived = undefined;

      await exec();

      expect(sumElement.Archived).toEqual(false);
    });

    it("should throw if name is not defined in payload", async () => {
      sumElementName = undefined;

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

    it("should throw if sampleTime is not defined in payload", async () => {
      sumElementSampleTime = undefined;

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
  });

  describe("get Value", () => {
    //#region auxVariables
    let device;
    let sumElement;
    let devicePayload;
    let deviceId;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementSampleTime;

    let sumElementValue;

    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = false;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      sumElementValue = 4321;
    });

    let exec = async () => {
      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        unit: sumElementUnit,
        sampleTime: sumElementSampleTime
      };

      sumElement = new SumElement(device);
      await sumElement.init(sumElementPayload);
      sumElement.Value = sumElementValue;
      return sumElement.Value;
    };

    it("should return calculationElement value", async () => {
      let result = await exec();

      expect(result).toEqual(sumElementValue);
    });

    it("should return calculationElement sumValue", async () => {
      await exec();

      sumElement._sumValue = 1234.4321;
      let result = sumElement.Value;
      expect(result).toEqual(1234.4321);
    });
  });

  describe("set Value", () => {
    //#region auxVariables
    let device;
    let sumElement;
    let devicePayload;
    let deviceId;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementSampleTime;

    let sumElementValue;

    let onValueChangedMockFunc;

    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = true;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      sumElementValue = 4321;
      onValueChangedMockFunc = jest.fn();
    });

    let exec = async () => {
      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        unit: sumElementUnit,
        sampleTime: sumElementSampleTime
      };

      sumElement = new SumElement(device);
      await sumElement.init(sumElementPayload);
      sumElement.Events.on("ValueChanged", onValueChangedMockFunc);
      sumElement.Value = sumElementValue;
    };

    it("should set Value", async () => {
      await exec();

      expect(sumElement.Value).toEqual(sumElementValue);
    });

    it("should set _sumValue", async () => {
      await exec();

      expect(sumElement._sumValue).toEqual(sumElementValue);
    });

    it("should invoke OnValueChanged event if value is set", async () => {
      await exec();

      expect(onValueChangedMockFunc).toHaveBeenCalledTimes(1);
      expect(onValueChangedMockFunc.mock.calls[0][0][0]).toEqual(sumElement);
      expect(onValueChangedMockFunc.mock.calls[0][0][1]).toEqual(
        sumElementValue
      );
    });
  });

  describe("Payload", () => {
    //#region auxVariables
    let device;
    let sumElement;

    let devicePayload;
    let deviceId;

    let deviceVariable1Payload;
    let deviceVariable1Id;
    let deviceVariable1Type;
    let deviceVariable1Archived;
    let deviceVariable1Value;

    let deviceVariable2Payload;
    let deviceVariable2Id;
    let deviceVariable2Type;
    let deviceVariable2Archived;
    let deviceVariable2Value;

    let deviceVariable3Payload;
    let deviceVariable3Id;
    let deviceVariable3Type;
    let deviceVariable3Archived;
    let deviceVariable3Value;

    let deviceVariable4Payload;
    let deviceVariable4Id;
    let deviceVariable4Type;
    let deviceVariable4Archived;
    let deviceVariable4Value;

    let deviceVariable5Payload;
    let deviceVariable5Id;
    let deviceVariable5Type;
    let deviceVariable5Archived;
    let deviceVariable5Value;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementSampleTime;
    let sumElementVariable1Payload;
    let sumElementVariable1Id;
    let sumElementVariable1Factor;
    let sumElementVariable2Payload;
    let sumElementVariable2Id;
    let sumElementVariable2Factor;
    let sumElementVariable3Payload;
    let sumElementVariable3Id;
    let sumElementVariable3Factor;

    let addVariables;
    let customVariablesPayload;

    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      deviceVariable1Id = "0001";
      deviceVariable1Type = "int32";
      deviceVariable1Archived = false;
      deviceVariable1Value = 1;

      deviceVariable2Id = "0002";
      deviceVariable2Type = "int32";
      deviceVariable2Archived = false;
      deviceVariable2Value = 2;

      deviceVariable3Id = "0003";
      deviceVariable3Type = "float";
      deviceVariable3Archived = false;
      deviceVariable3Value = 3;

      deviceVariable4Id = "0004";
      deviceVariable4Type = "float";
      deviceVariable4Archived = false;
      deviceVariable4Value = 4.5;

      deviceVariable5Id = "0005";
      deviceVariable5Type = "float";
      deviceVariable5Archived = false;
      deviceVariable5Value = 6.5;

      sumElementVariable1Id = "0002";
      sumElementVariable1Factor = 1;

      sumElementVariable2Id = "0003";
      sumElementVariable2Factor = 2;

      sumElementVariable3Id = "0004";
      sumElementVariable3Factor = -3;

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = true;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      addVariables = true;
      customVariablesPayload = undefined;
    });

    let exec = async () => {
      deviceVariable1Payload = {
        id: deviceVariable1Id,
        type: deviceVariable1Type,
        archived: deviceVariable1Archived,
        value: deviceVariable1Value,
        timeSample: 1,
        name: "variable1",
        offset: 1,
        fCode: deviceVariable1Type === "boolean" ? 15 : 3
      };

      deviceVariable2Payload = {
        id: deviceVariable2Id,
        type: deviceVariable2Type,
        archived: deviceVariable2Archived,
        value: deviceVariable2Value,
        timeSample: 2,
        name: "variable2",
        offset: 3,
        fCode: deviceVariable2Type === "boolean" ? 15 : 3
      };

      deviceVariable3Payload = {
        id: deviceVariable3Id,
        type: deviceVariable3Type,
        archived: deviceVariable3Archived,
        value: deviceVariable3Value,
        timeSample: 3,
        name: "variable3",
        offset: 5,
        fCode: deviceVariable3Type === "boolean" ? 15 : 3
      };

      deviceVariable4Payload = {
        id: deviceVariable4Id,
        type: deviceVariable4Type,
        archived: deviceVariable4Archived,
        value: deviceVariable4Value,
        timeSample: 4,
        name: "variable4",
        offset: 7,
        fCode: deviceVariable4Type === "boolean" ? 15 : 3
      };

      deviceVariable5Payload = {
        id: deviceVariable5Id,
        type: deviceVariable5Type,
        archived: deviceVariable5Archived,
        value: deviceVariable5Value,
        timeSample: 5,
        name: "variable5",
        offset: 9,
        fCode: deviceVariable5Type === "boolean" ? 15 : 3
      };

      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [
          deviceVariable1Payload,
          deviceVariable2Payload,
          deviceVariable3Payload,
          deviceVariable4Payload,
          deviceVariable5Payload
        ],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementVariable1Payload = {
        id: sumElementVariable1Id,
        factor: sumElementVariable1Factor
      };

      sumElementVariable2Payload = {
        id: sumElementVariable2Id,
        factor: sumElementVariable2Factor
      };

      sumElementVariable3Payload = {
        id: sumElementVariable3Id,
        factor: sumElementVariable3Factor
      };

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        unit: sumElementUnit,
        sampleTime: sumElementSampleTime,
        variables: addVariables
          ? [
              sumElementVariable1Payload,
              sumElementVariable2Payload,
              sumElementVariable3Payload
            ]
          : customVariablesPayload
      };

      sumElement = new SumElement(device);
      await sumElement.init(sumElementPayload);
      return sumElement.Payload;
    };

    it("should return valid payload of CalculationElement", async () => {
      let result = await exec();

      let expectedPayload = {
        id: sumElementId,
        name: sumElementName,
        archived: sumElementArchived,
        type: sumElementType,
        sampleTime: sumElementSampleTime,
        variables: [
          { id: sumElementVariable1Id, factor: sumElementVariable1Factor },
          { id: sumElementVariable2Id, factor: sumElementVariable2Factor },
          { id: sumElementVariable3Id, factor: sumElementVariable3Factor }
        ]
      };

      expect(result).toMatchObject(expectedPayload);
    });

    it("should return valid payload and new sumElement created on the basis of this payload, should return the same payload", async () => {
      let result = await exec();

      //Creating new sumElement based on previous payload
      let newCalulcationElement = new SumElement(device);
      await newCalulcationElement.init(result);

      let newPayload = newCalulcationElement.Payload;

      //Checking if payload of both elements are equal
      expect(newPayload).toMatchObject(result);
    });

    it("should return valid payload if variables are empty", async () => {
      addVariables = false;
      customVariablesPayload = undefined;
      let result = await exec();

      let expectedPayload = {
        id: sumElementId,
        name: sumElementName,
        archived: sumElementArchived,
        type: sumElementType,
        variables: []
      };

      expect(result).toMatchObject(expectedPayload);
    });
  });

  describe("TypeName", () => {
    //#region auxVariables
    let device;
    let sumElement;
    let devicePayload;
    let deviceId;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementSampleTime;

    let sumElementValue;

    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = true;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      sumElementValue = 4321;
    });

    let exec = async () => {
      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        unit: sumElementUnit,
        sampleTime: sumElementSampleTime
      };

      sumElement = new SumElement(device);
      await sumElement.init(sumElementPayload);
      return sumElement.TypeName;
    };

    it("should return string that represents SumElement type", async () => {
      let result = await exec();

      expect(result).toEqual("sumElement");
    });
  });

  describe("ValueType", () => {
    //#region auxVariables
    let device;
    let sumElement;
    let devicePayload;
    let deviceId;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementSampleTime;

    let sumElementValue;

    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = true;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      sumElementValue = 4321;
    });

    let exec = async () => {
      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        unit: sumElementUnit,
        sampleTime: sumElementSampleTime
      };

      sumElement = new SumElement(device);
      await sumElement.init(sumElementPayload);
      return sumElement.ValueType;
    };

    it("should return string that represents SumElement's value type", async () => {
      let result = await exec();

      expect(result).toEqual("float");
    });
  });

  describe("addVariable", () => {
    //#region auxVariables
    let device;
    let sumElement;
    let devicePayload;
    let deviceId;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementSampleTime;

    let addVariableId;
    let addVariableFactor;
    let addVariable;

    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = true;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      sumElementValue = 4321;

      addVariableId = "0020";
    });

    let exec = async () => {
      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        unit: sumElementUnit,
        sampleTime: sumElementSampleTime
      };

      sumElement = new SumElement(device);
      await sumElement.init(sumElementPayload);

      addVariable = { Id: addVariableId };
      addVariableFactor = 123;

      return sumElement.addVariable(addVariable, addVariableFactor);
    };

    it("should add new variable to sumElement.Variables", async () => {
      let result = await exec();

      let variablesObjectToExpect = {
        [addVariableId]: {
          variable: addVariable,
          factor: addVariableFactor
        }
      };

      expect(sumElement.Variables).toBeDefined();
      expect(sumElement.Variables).toMatchObject(variablesObjectToExpect);
    });

    it("should return added variable", async () => {
      let result = await exec();

      expect(result).toEqual(addVariable);
    });

    it("should throw and not add new variable if variable is undefined", async () => {
      let result = await exec();

      //Trying to add new undefined variable
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await sumElement.addVariable(undefined, addVariableFactor);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).rejects.toBeDefined();

      //Only one variable should be inside sumElement - the one added in exec method
      expect(Object.keys(sumElement.Variables).length).toEqual(1);
    });

    it("should throw and not add new variable if factor is undefined", async () => {
      let result = await exec();

      let newVariable = {
        Id: "0021"
      };

      //Trying to add new undefined variable
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await sumElement.addVariable(newVariable, undefined);
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).rejects.toBeDefined();

      //Only one variable should be inside sumElement - the one added in exec method
      expect(Object.keys(sumElement.Variables).length).toEqual(1);
    });
  });

  describe("removeVariable", () => {
    //#region auxVariables
    let device;
    let sumElement;
    let devicePayload;
    let deviceId;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementSampleTime;

    let addVariableId;
    let addVariableFactor;
    let addVariable;

    let removeVariableId;
    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = true;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      sumElementValue = 4321;

      addVariableId = "0020";
      removeVariableId = addVariableId;
    });

    let exec = async () => {
      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        unit: sumElementUnit,
        sampleTime: sumElementSampleTime
      };

      sumElement = new SumElement(device);
      await sumElement.init(sumElementPayload);

      addVariable = { Id: addVariableId };
      addVariableFactor = 123;

      sumElement.addVariable(addVariable, addVariableFactor);
      return sumElement.removeVariable(removeVariableId);
    };

    it("should remove variable of given id", async () => {
      let result = await exec();

      expect(sumElement.Variables[addVariableId]).not.toBeDefined();
      expect(Object.keys(sumElement.Variables).length).toEqual(0);
    });

    it("should return removed variable", async () => {
      let result = await exec();

      expect(result).toEqual(addVariable);
    });

    it("should throw and not remove any varaible if variable id does not exists", async () => {
      removeVariableId = "0030";

      //Trying to add new undefined variable
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(Object.keys(sumElement.Variables).length).toEqual(1);
    });

    it("should throw and not remove any varaible if variable id is undefined", async () => {
      removeVariableId = undefined;

      //Trying to add new undefined variable
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            resolve(true);
          } catch (err) {
            reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(Object.keys(sumElement.Variables).length).toEqual(1);
    });
  });

  describe("_calculateSum", () => {
    //#region auxVariables
    let device;
    let sumElement;

    let devicePayload;
    let deviceId;

    let deviceVariable1Payload;
    let deviceVariable1Id;
    let deviceVariable1Type;
    let deviceVariable1Archived;
    let deviceVariable1Value;

    let deviceVariable2Payload;
    let deviceVariable2Id;
    let deviceVariable2Type;
    let deviceVariable2Archived;
    let deviceVariable2Value;

    let deviceVariable3Payload;
    let deviceVariable3Id;
    let deviceVariable3Type;
    let deviceVariable3Archived;
    let deviceVariable3Value;

    let deviceVariable4Payload;
    let deviceVariable4Id;
    let deviceVariable4Type;
    let deviceVariable4Archived;
    let deviceVariable4Value;

    let deviceVariable5Payload;
    let deviceVariable5Id;
    let deviceVariable5Type;
    let deviceVariable5Archived;
    let deviceVariable5Value;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementSampleTime;
    let sumElementVariable1Payload;
    let sumElementVariable1Id;
    let sumElementVariable1Factor;
    let sumElementVariable2Payload;
    let sumElementVariable2Id;
    let sumElementVariable2Factor;
    let sumElementVariable3Payload;
    let sumElementVariable3Id;
    let sumElementVariable3Factor;

    let addVariables;
    let customVariablesPayload;

    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      deviceVariable1Id = "0001";
      deviceVariable1Type = "int32";
      deviceVariable1Archived = false;
      deviceVariable1Value = 1;

      deviceVariable2Id = "0002";
      deviceVariable2Type = "int32";
      deviceVariable2Archived = false;
      deviceVariable2Value = 2;

      deviceVariable3Id = "0003";
      deviceVariable3Type = "float";
      deviceVariable3Archived = false;
      deviceVariable3Value = 3;

      deviceVariable4Id = "0004";
      deviceVariable4Type = "float";
      deviceVariable4Archived = false;
      deviceVariable4Value = 4.5;

      deviceVariable5Id = "0005";
      deviceVariable5Type = "float";
      deviceVariable5Archived = false;
      deviceVariable5Value = 6.5;

      sumElementVariable1Id = "0002";
      sumElementVariable1Factor = 1;

      sumElementVariable2Id = "0003";
      sumElementVariable2Factor = 2;

      sumElementVariable3Id = "0004";
      sumElementVariable3Factor = -3;

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = true;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      addVariables = true;
      customVariablesPayload = undefined;
    });

    let exec = async () => {
      deviceVariable1Payload = {
        id: deviceVariable1Id,
        type: deviceVariable1Type,
        archived: deviceVariable1Archived,
        value: deviceVariable1Value,
        timeSample: 1,
        name: "variable1",
        offset: 1,
        fCode: deviceVariable1Type === "boolean" ? 15 : 3
      };

      deviceVariable2Payload = {
        id: deviceVariable2Id,
        type: deviceVariable2Type,
        archived: deviceVariable2Archived,
        value: deviceVariable2Value,
        timeSample: 2,
        name: "variable2",
        offset: 3,
        fCode: deviceVariable2Type === "boolean" ? 15 : 3
      };

      deviceVariable3Payload = {
        id: deviceVariable3Id,
        type: deviceVariable3Type,
        archived: deviceVariable3Archived,
        value: deviceVariable3Value,
        timeSample: 3,
        name: "variable3",
        offset: 5,
        fCode: deviceVariable3Type === "boolean" ? 15 : 3
      };

      deviceVariable4Payload = {
        id: deviceVariable4Id,
        type: deviceVariable4Type,
        archived: deviceVariable4Archived,
        value: deviceVariable4Value,
        timeSample: 4,
        name: "variable4",
        offset: 7,
        fCode: deviceVariable4Type === "boolean" ? 15 : 3
      };

      deviceVariable5Payload = {
        id: deviceVariable5Id,
        type: deviceVariable5Type,
        archived: deviceVariable5Archived,
        value: deviceVariable5Value,
        timeSample: 5,
        name: "variable5",
        offset: 9,
        fCode: deviceVariable5Type === "boolean" ? 15 : 3
      };

      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [
          deviceVariable1Payload,
          deviceVariable2Payload,
          deviceVariable3Payload,
          deviceVariable4Payload,
          deviceVariable5Payload
        ],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementVariable1Payload = {
        id: sumElementVariable1Id,
        factor: sumElementVariable1Factor
      };

      sumElementVariable2Payload = {
        id: sumElementVariable2Id,
        factor: sumElementVariable2Factor
      };

      sumElementVariable3Payload = {
        id: sumElementVariable3Id,
        factor: sumElementVariable3Factor
      };

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        unit: sumElementUnit,
        sampleTime: sumElementSampleTime,
        variables: addVariables
          ? [
              sumElementVariable1Payload,
              sumElementVariable2Payload,
              sumElementVariable3Payload
            ]
          : customVariablesPayload
      };

      sumElement = new SumElement(device);
      await sumElement.init(sumElementPayload);

      return sumElement._calculateSum();
    };

    it("should sum all values of added variables", async () => {
      let result = await exec();

      let sumOfAllValues = 0;
      for (let variableObject of Object.values(sumElement.Variables)) {
        let variableValue = variableObject.variable.Value;
        let factor = variableObject.factor;
        sumOfAllValues += factor * variableValue;
      }

      expect(result).toEqual(sumOfAllValues);
    });

    it("should set Value of sumElement as a sum of all added variables", async () => {
      let result = await exec();

      let sumOfAllValues = 0;
      for (let variableObject of Object.values(sumElement.Variables)) {
        let variableValue = variableObject.variable.Value;
        let factor = variableObject.factor;
        sumOfAllValues += factor * variableValue;
      }

      expect(sumElement.Value).toEqual(sumOfAllValues);
    });

    it("should not throw but return 0 if there are no variables in sumElement", async () => {
      addVariables = false;
      customVariablesPayload = undefined;
      let result = await exec();

      expect(sumElement.Value).toEqual(0);
    });

    it("should not throw but use 1 if one of variables is boolean and value is true", async () => {
      deviceVariable1Type = "boolean";
      deviceVariable1Value = true;

      let result = await exec();

      let sumOfAllValues = 0;
      for (let variableObject of Object.values(sumElement.Variables)) {
        if (variableObject.variable.Type !== "boolean") {
          let variableValue = variableObject.variable.Value;
          let factor = variableObject.factor;
          sumOfAllValues += factor * variableValue;
        } else {
          let variableValue = variableObject.variable.Value ? 1 : 0;
          let factor = variableObject.factor;
          sumOfAllValues += factor * variableValue;
        }
      }

      expect(result).toEqual(sumOfAllValues);
    });

    it("should not throw but use 0 if one of variables is boolean and value is true", async () => {
      deviceVariable1Type = "boolean";
      deviceVariable1Value = false;

      let result = await exec();

      let sumOfAllValues = 0;
      for (let variableObject of Object.values(sumElement.Variables)) {
        if (variableObject.variable.Type !== "boolean") {
          let variableValue = variableObject.variable.Value;
          let factor = variableObject.factor;
          sumOfAllValues += factor * variableValue;
        } else {
          let variableValue = variableObject.variable.Value ? 1 : 0;
          let factor = variableObject.factor;
          sumOfAllValues += factor * variableValue;
        }
      }

      expect(result).toEqual(sumOfAllValues);
    });
  });

  describe("_onRefresh", () => {
    //#region auxVariables
    let device;
    let sumElement;

    let devicePayload;
    let deviceId;

    let deviceVariable1Payload;
    let deviceVariable1Id;
    let deviceVariable1Type;
    let deviceVariable1Archived;
    let deviceVariable1Value;

    let deviceVariable2Payload;
    let deviceVariable2Id;
    let deviceVariable2Type;
    let deviceVariable2Archived;
    let deviceVariable2Value;

    let deviceVariable3Payload;
    let deviceVariable3Id;
    let deviceVariable3Type;
    let deviceVariable3Archived;
    let deviceVariable3Value;

    let deviceVariable4Payload;
    let deviceVariable4Id;
    let deviceVariable4Type;
    let deviceVariable4Archived;
    let deviceVariable4Value;

    let deviceVariable5Payload;
    let deviceVariable5Id;
    let deviceVariable5Type;
    let deviceVariable5Archived;
    let deviceVariable5Value;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementSampleTime;
    let sumElementVariable1Payload;
    let sumElementVariable1Id;
    let sumElementVariable1Factor;
    let sumElementVariable2Payload;
    let sumElementVariable2Id;
    let sumElementVariable2Factor;
    let sumElementVariable3Payload;
    let sumElementVariable3Id;
    let sumElementVariable3Factor;

    let addVariables;
    let customVariablesPayload;

    let tickNumber;
    let lastTickNumber;

    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      deviceVariable1Id = "0001";
      deviceVariable1Type = "int32";
      deviceVariable1Archived = false;
      deviceVariable1Value = 1;

      deviceVariable2Id = "0002";
      deviceVariable2Type = "int32";
      deviceVariable2Archived = false;
      deviceVariable2Value = 2;

      deviceVariable3Id = "0003";
      deviceVariable3Type = "float";
      deviceVariable3Archived = false;
      deviceVariable3Value = 3;

      deviceVariable4Id = "0004";
      deviceVariable4Type = "float";
      deviceVariable4Archived = false;
      deviceVariable4Value = 4.5;

      deviceVariable5Id = "0005";
      deviceVariable5Type = "float";
      deviceVariable5Archived = false;
      deviceVariable5Value = 6.5;

      sumElementVariable1Id = "0002";
      sumElementVariable1Factor = 1;

      sumElementVariable2Id = "0003";
      sumElementVariable2Factor = 2;

      sumElementVariable3Id = "0004";
      sumElementVariable3Factor = -3;

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = true;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      addVariables = true;
      customVariablesPayload = undefined;
    });

    let exec = async () => {
      deviceVariable1Payload = {
        id: deviceVariable1Id,
        type: deviceVariable1Type,
        archived: deviceVariable1Archived,
        value: deviceVariable1Value,
        timeSample: 1,
        name: "variable1",
        offset: 1,
        fCode: deviceVariable1Type === "boolean" ? 15 : 3
      };

      deviceVariable2Payload = {
        id: deviceVariable2Id,
        type: deviceVariable2Type,
        archived: deviceVariable2Archived,
        value: deviceVariable2Value,
        timeSample: 2,
        name: "variable2",
        offset: 3,
        fCode: deviceVariable2Type === "boolean" ? 15 : 3
      };

      deviceVariable3Payload = {
        id: deviceVariable3Id,
        type: deviceVariable3Type,
        archived: deviceVariable3Archived,
        value: deviceVariable3Value,
        timeSample: 3,
        name: "variable3",
        offset: 5,
        fCode: deviceVariable3Type === "boolean" ? 15 : 3
      };

      deviceVariable4Payload = {
        id: deviceVariable4Id,
        type: deviceVariable4Type,
        archived: deviceVariable4Archived,
        value: deviceVariable4Value,
        timeSample: 4,
        name: "variable4",
        offset: 7,
        fCode: deviceVariable4Type === "boolean" ? 15 : 3
      };

      deviceVariable5Payload = {
        id: deviceVariable5Id,
        type: deviceVariable5Type,
        archived: deviceVariable5Archived,
        value: deviceVariable5Value,
        timeSample: 5,
        name: "variable5",
        offset: 9,
        fCode: deviceVariable5Type === "boolean" ? 15 : 3
      };

      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [
          deviceVariable1Payload,
          deviceVariable2Payload,
          deviceVariable3Payload,
          deviceVariable4Payload,
          deviceVariable5Payload
        ],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementVariable1Payload = {
        id: sumElementVariable1Id,
        factor: sumElementVariable1Factor
      };

      sumElementVariable2Payload = {
        id: sumElementVariable2Id,
        factor: sumElementVariable2Factor
      };

      sumElementVariable3Payload = {
        id: sumElementVariable3Id,
        factor: sumElementVariable3Factor
      };

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        unit: sumElementUnit,
        sampleTime: sumElementSampleTime,
        variables: addVariables
          ? [
              sumElementVariable1Payload,
              sumElementVariable2Payload,
              sumElementVariable3Payload
            ]
          : customVariablesPayload
      };

      sumElement = new SumElement(device);
      await sumElement.init(sumElementPayload);

      return sumElement._onRefresh(lastTickNumber, tickNumber);
    };

    it("should sum all values of added variables", async () => {
      let result = await exec();

      let sumOfAllValues = 0;
      for (let variableObject of Object.values(sumElement.Variables)) {
        let variableValue = variableObject.variable.Value;
        let factor = variableObject.factor;
        sumOfAllValues += factor * variableValue;
      }

      expect(result).toEqual(sumOfAllValues);
    });

    it("should set Value of sumElement as a sum of all added variables", async () => {
      let result = await exec();

      let sumOfAllValues = 0;
      for (let variableObject of Object.values(sumElement.Variables)) {
        let variableValue = variableObject.variable.Value;
        let factor = variableObject.factor;
        sumOfAllValues += factor * variableValue;
      }

      expect(sumElement.Value).toEqual(sumOfAllValues);
    });
  });

  describe("_onFirstRefresh", () => {
    //#region auxVariables
    let device;
    let sumElement;

    let devicePayload;
    let deviceId;

    let deviceVariable1Payload;
    let deviceVariable1Id;
    let deviceVariable1Type;
    let deviceVariable1Archived;
    let deviceVariable1Value;

    let deviceVariable2Payload;
    let deviceVariable2Id;
    let deviceVariable2Type;
    let deviceVariable2Archived;
    let deviceVariable2Value;

    let deviceVariable3Payload;
    let deviceVariable3Id;
    let deviceVariable3Type;
    let deviceVariable3Archived;
    let deviceVariable3Value;

    let deviceVariable4Payload;
    let deviceVariable4Id;
    let deviceVariable4Type;
    let deviceVariable4Archived;
    let deviceVariable4Value;

    let deviceVariable5Payload;
    let deviceVariable5Id;
    let deviceVariable5Type;
    let deviceVariable5Archived;
    let deviceVariable5Value;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementSampleTime;
    let sumElementVariable1Payload;
    let sumElementVariable1Id;
    let sumElementVariable1Factor;
    let sumElementVariable2Payload;
    let sumElementVariable2Id;
    let sumElementVariable2Factor;
    let sumElementVariable3Payload;
    let sumElementVariable3Id;
    let sumElementVariable3Factor;

    let addVariables;
    let customVariablesPayload;

    let tickNumber;
    let lastTickNumber;

    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      deviceVariable1Id = "0001";
      deviceVariable1Type = "int32";
      deviceVariable1Archived = false;
      deviceVariable1Value = 1;

      deviceVariable2Id = "0002";
      deviceVariable2Type = "int32";
      deviceVariable2Archived = false;
      deviceVariable2Value = 2;

      deviceVariable3Id = "0003";
      deviceVariable3Type = "float";
      deviceVariable3Archived = false;
      deviceVariable3Value = 3;

      deviceVariable4Id = "0004";
      deviceVariable4Type = "float";
      deviceVariable4Archived = false;
      deviceVariable4Value = 4.5;

      deviceVariable5Id = "0005";
      deviceVariable5Type = "float";
      deviceVariable5Archived = false;
      deviceVariable5Value = 6.5;

      sumElementVariable1Id = "0002";
      sumElementVariable1Factor = 1;

      sumElementVariable2Id = "0003";
      sumElementVariable2Factor = 2;

      sumElementVariable3Id = "0004";
      sumElementVariable3Factor = -3;

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = true;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      addVariables = true;
      customVariablesPayload = undefined;
    });

    let exec = async () => {
      deviceVariable1Payload = {
        id: deviceVariable1Id,
        type: deviceVariable1Type,
        archived: deviceVariable1Archived,
        value: deviceVariable1Value,
        timeSample: 1,
        name: "variable1",
        offset: 1,
        fCode: deviceVariable1Type === "boolean" ? 15 : 3
      };

      deviceVariable2Payload = {
        id: deviceVariable2Id,
        type: deviceVariable2Type,
        archived: deviceVariable2Archived,
        value: deviceVariable2Value,
        timeSample: 2,
        name: "variable2",
        offset: 3,
        fCode: deviceVariable2Type === "boolean" ? 15 : 3
      };

      deviceVariable3Payload = {
        id: deviceVariable3Id,
        type: deviceVariable3Type,
        archived: deviceVariable3Archived,
        value: deviceVariable3Value,
        timeSample: 3,
        name: "variable3",
        offset: 5,
        fCode: deviceVariable3Type === "boolean" ? 15 : 3
      };

      deviceVariable4Payload = {
        id: deviceVariable4Id,
        type: deviceVariable4Type,
        archived: deviceVariable4Archived,
        value: deviceVariable4Value,
        timeSample: 4,
        name: "variable4",
        offset: 7,
        fCode: deviceVariable4Type === "boolean" ? 15 : 3
      };

      deviceVariable5Payload = {
        id: deviceVariable5Id,
        type: deviceVariable5Type,
        archived: deviceVariable5Archived,
        value: deviceVariable5Value,
        timeSample: 5,
        name: "variable5",
        offset: 9,
        fCode: deviceVariable5Type === "boolean" ? 15 : 3
      };

      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [
          deviceVariable1Payload,
          deviceVariable2Payload,
          deviceVariable3Payload,
          deviceVariable4Payload,
          deviceVariable5Payload
        ],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementVariable1Payload = {
        id: sumElementVariable1Id,
        factor: sumElementVariable1Factor
      };

      sumElementVariable2Payload = {
        id: sumElementVariable2Id,
        factor: sumElementVariable2Factor
      };

      sumElementVariable3Payload = {
        id: sumElementVariable3Id,
        factor: sumElementVariable3Factor
      };

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        unit: sumElementUnit,
        sampleTime: sumElementSampleTime,
        variables: addVariables
          ? [
              sumElementVariable1Payload,
              sumElementVariable2Payload,
              sumElementVariable3Payload
            ]
          : customVariablesPayload
      };

      sumElement = new SumElement(device);
      await sumElement.init(sumElementPayload);

      return sumElement._onFirstRefresh(lastTickNumber, tickNumber);
    };

    it("should sum all values of added variables", async () => {
      let result = await exec();

      let sumOfAllValues = 0;
      for (let variableObject of Object.values(sumElement.Variables)) {
        let variableValue = variableObject.variable.Value;
        let factor = variableObject.factor;
        sumOfAllValues += factor * variableValue;
      }

      expect(result).toEqual(sumOfAllValues);
    });

    it("should set Value of sumElement as a sum of all added variables", async () => {
      let result = await exec();

      let sumOfAllValues = 0;
      for (let variableObject of Object.values(sumElement.Variables)) {
        let variableValue = variableObject.variable.Value;
        let factor = variableObject.factor;
        sumOfAllValues += factor * variableValue;
      }

      expect(sumElement.Value).toEqual(sumOfAllValues);
    });
  });

  describe("refresh", () => {
    //#region auxVariables
    let device;
    let sumElement;
    let devicePayload;
    let deviceId;

    let onRefreshEventMockFunc;

    let sumElementPayload;
    let sumElementId;
    let sumElementName;
    let sumElementType;
    let sumElementArchived;
    let sumElementUnit;
    let sumElementSampleTime;

    let elementLastTickNumber;
    let tickNumber;
    let lastTickNumber;
    let onRefreshMockFunc;
    let onFirstRefreshMockFunc;
    let onRefreshMockFuncResult;
    let onFirstRefreshMockFuncResult;

    //#endregion auxVariables

    beforeEach(() => {
      deviceId = "1234";

      sumElementId = "0010";
      sumElementName = "testSumElement";
      sumElementType = "sumElement";
      sumElementArchived = false;
      sumElementUnit = "TestUnit";
      sumElementSampleTime = 2;

      tickNumber = 101;
      lastTickNumber = 100;

      onRefreshMockFuncResult = "refresh mock func result";
      onFirstRefreshMockFuncResult = "first refresh mock func result";
    });

    let exec = async () => {
      onRefreshEventMockFunc = jest.fn();

      onRefreshMockFunc = jest.fn().mockResolvedValue(onRefreshMockFuncResult);
      onFirstRefreshMockFunc = jest
        .fn()
        .mockResolvedValue(onFirstRefreshMockFuncResult);

      devicePayload = {
        id: deviceId,
        name: "Test meter",
        calculationElements: [],
        isActive: false,
        timeout: 500,
        ipAdress: "192.168.1.11",
        unitId: 1,
        portNumber: 502,
        variables: [],
        type: "mbDevice"
      };

      device = new MBDevice();
      await device.init(devicePayload);

      sumElementPayload = {
        id: sumElementId,
        name: sumElementName,
        type: sumElementType,
        archived: sumElementArchived,
        sampleTime: sumElementSampleTime,
        unit: sumElementUnit
      };

      sumElement = new SumElement(device);
      await sumElement.init(sumElementPayload);
      sumElement._onFirstRefresh = onFirstRefreshMockFunc;
      sumElement._onRefresh = onRefreshMockFunc;
      sumElement._lastTickNumber = lastTickNumber;
      sumElement.Events.on("Refreshed", onRefreshEventMockFunc);
      return sumElement.refresh(tickNumber);
    };

    it("should invoke _onRefresh method instead of _onFirstRefresh if last tick number is already defined", async () => {
      lastTickNumber = 100;

      let result = await exec();

      expect(onRefreshMockFunc).toHaveBeenCalledTimes(1);
      expect(onRefreshMockFunc.mock.calls[0][0]).toEqual(lastTickNumber);
      expect(onRefreshMockFunc.mock.calls[0][1]).toEqual(tickNumber);

      expect(onFirstRefreshMockFunc).not.toHaveBeenCalledTimes(1);
    });

    it("should return _onRefresh result instead of _onFirstRefresh if last tick number is already defined", async () => {
      lastTickNumber = 100;

      let result = await exec();

      expect(result).toEqual(onRefreshMockFuncResult);
    });

    it("should invoke _onFirstRefresh method instead of _onRefresh if last tick number is not defined", async () => {
      lastTickNumber = undefined;

      let result = await exec();

      expect(onRefreshMockFunc).not.toHaveBeenCalledTimes(1);

      expect(onFirstRefreshMockFunc).toHaveBeenCalledTimes(1);

      expect(onFirstRefreshMockFunc.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("should return _onFirstRefresh result instead of _onRefresh if last tick number is not defined", async () => {
      lastTickNumber = undefined;

      let result = await exec();

      expect(result).toEqual(onFirstRefreshMockFuncResult);
    });

    it("should invoke onRefresh event if last tick number is not defined", async () => {
      lastTickNumber = undefined;

      let result = await exec();

      expect(onRefreshEventMockFunc).toHaveBeenCalledTimes(1);
      expect(onRefreshEventMockFunc.mock.calls[0][0][0]).toEqual(sumElement);
      expect(onRefreshEventMockFunc.mock.calls[0][0][1]).toEqual(tickNumber);
      expect(onRefreshEventMockFunc.mock.calls[0][0][2]).toEqual(result);
    });

    it("should invoke onRefresh event if last tick number is defined", async () => {
      lastTickNumber = 100;

      let result = await exec();

      expect(onRefreshEventMockFunc).toHaveBeenCalledTimes(1);
      expect(onRefreshEventMockFunc.mock.calls[0][0][0]).toEqual(sumElement);
      expect(onRefreshEventMockFunc.mock.calls[0][0][1]).toEqual(tickNumber);
      expect(onRefreshEventMockFunc.mock.calls[0][0][2]).toEqual(result);
    });

    it("should set last tick number to actual tick number after refreshing", async () => {
      let result = await exec();

      expect(sumElement.LastTickNumber).toEqual(tickNumber);
    });
  });
});
