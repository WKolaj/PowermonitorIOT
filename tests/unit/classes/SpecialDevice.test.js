const SpecialDevice = require("../../../classes/device/SpecialDevices/SpecialDevice");
const config = require("config");
const path = require("path");
const {
  clearDirectoryAsync,
  readAllDataFromTable
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
        unit: "unit1"
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
        unit: "unit2"
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
        unit: "unit4"
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
        unit: "unit5"
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
        unit: "unit7"
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
        unit: "unit8"
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

describe("SpecialDevice", () => {
  let db1Path;
  let db2Path;
  let initPayload;
  let commInterface;

  //Creating seperate commInterface to all tests
  beforeEach(async () => {
    jest.resetModules();
    commInterface = require("../../../classes/commInterface/CommInterface.js");
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
    initPayload = JSON.parse(testPayload);
    await commInterface.init(initPayload);
  });

  afterEach(async () => {
    if (commInterface.Initialized) {
      //ending communication with all devices if there are any
      await commInterface.stopCommunicationWithAllDevices();
      commInterface.Sampler.stop();
    }

    //waiting for all sampling actions to end being invoke;
    await clearDirectoryAsync(db1Path);
    await clearDirectoryAsync(db2Path);

    jest.resetModules();
  });

  describe("init", () => {
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let calcElement1Payload;
    let calcElement2Payload;

    let devicePayload;
    let device;

    beforeEach(async () => {
      variable1Payload = {
        name: "testVariable1",
        id: "987654321",
        sampleTime: 2,
        archived: true,
        unit: 19,
        archiveSampleTime: 12,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
      variable2Payload = {
        name: "testVariable2",
        id: "987654322",
        sampleTime: 5,
        archived: false,
        unit: 28,
        archiveSampleTime: 13,
        elementDeviceId: "1234",
        elementId: "0003",
        type: "sdVariable"
      };
      variable3Payload = {
        name: "testVariable3",
        id: "987654323",
        sampleTime: 3,
        archived: true,
        unit: 14,
        archiveSampleTime: 14,
        elementDeviceId: "1236",
        elementId: "3002",
        type: "sdVariable"
      };
      calcElement1Payload = {
        id: "6001",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement3",
        unit: "A",
        variables: [
          {
            id: "987654322",
            factor: 1
          },
          {
            id: "987654323",
            factor: 2
          }
        ]
      };
      calcElement2Payload = {
        id: "6002",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement2",
        unit: "A",
        variables: [
          {
            id: "987654321",
            factor: 1
          },
          {
            id: "987654322",
            factor: 2
          }
        ]
      };

      devicePayload = {
        id: "123456",
        name: "testDevice",
        type: "SpecialDevice",
        calculationElements: [],
        variables: [variable1Payload, variable2Payload, variable3Payload],
        calculationElements: [calcElement1Payload, calcElement2Payload]
      };
    });

    let exec = async () => {
      device = new SpecialDevice();
      await device.init(devicePayload);
    };

    it("should initialize device according to given payload", async () => {
      await exec();

      //Creating expected payload - extending it with varaible values
      let expectedPayload = { ...devicePayload };
      expectedPayload.variables = [];

      for (let variable of devicePayload.variables) {
        expectedPayload.variables.push({
          ...variable,
          value: device.Variables[variable.id].Value
        });
      }

      expect(device.Payload).toEqual(expectedPayload);
    });

    it("should generate id if there is no id in given payload", async () => {
      devicePayload.id = undefined;
      await exec();
      expect(device.Id).toBeDefined();
    });

    it("should throw if there is no name in given payload", async () => {
      devicePayload.name = undefined;
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

    it("should throw if variable is different than specialDevice variable", async () => {
      devicePayload.variables[0] = {
        id: "8001",
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
        unit: "unit1"
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
    });

    it("should initialize device according to given payload if variables are empty", async () => {
      devicePayload.variables = [];
      devicePayload.calculationElements[0].variables = [];
      devicePayload.calculationElements[1].variables = [];
      await exec();
      expect(device.Payload).toEqual(devicePayload);
    });

    it("should initialize device according to given payload if calculationElements are empty", async () => {
      devicePayload.calculationElements = [];

      await exec();

      //Creating expected payload - extending it with varaible values
      let expectedPayload = { ...devicePayload };
      expectedPayload.variables = [];

      for (let variable of devicePayload.variables) {
        expectedPayload.variables.push({
          ...variable,
          value: device.Variables[variable.id].Value
        });
      }

      expect(device.Payload).toEqual(expectedPayload);
    });
  });

  describe("createVariable", () => {
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let calcElement1Payload;
    let calcElement2Payload;
    let variablePayload;

    let devicePayload;
    let device;

    beforeEach(async () => {
      variable1Payload = {
        name: "testVariable1",
        id: "987654321",
        sampleTime: 2,
        archived: true,
        unit: 19,
        archiveSampleTime: 12,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
      variable2Payload = {
        name: "testVariable2",
        id: "987654322",
        sampleTime: 5,
        archived: false,
        unit: 28,
        archiveSampleTime: 13,
        elementDeviceId: "1234",
        elementId: "0003",
        type: "sdVariable"
      };
      variable3Payload = {
        name: "testVariable3",
        id: "987654323",
        sampleTime: 3,
        archived: true,
        unit: 14,
        archiveSampleTime: 14,
        elementDeviceId: "1235",
        elementId: "0005",
        type: "sdVariable"
      };
      calcElement1Payload = {
        id: "6001",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement3",
        unit: "A",
        variables: [
          {
            id: "987654322",
            factor: 1
          },
          {
            id: "987654323",
            factor: 2
          }
        ]
      };
      calcElement2Payload = {
        id: "6002",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement2",
        unit: "A",
        variables: [
          {
            id: "987654321",
            factor: 1
          },
          {
            id: "987654322",
            factor: 2
          }
        ]
      };

      variablePayload = {
        name: "testVariable4",
        id: "987654324",
        sampleTime: 3,
        archived: true,
        unit: 14,
        archiveSampleTime: 14,
        elementDeviceId: "1236",
        elementId: "0007",
        type: "sdVariable"
      };

      devicePayload = {
        id: "123456",
        name: "testDevice",
        type: "SpecialDevice",
        calculationElements: [],
        variables: [variable1Payload, variable2Payload, variable3Payload],
        calculationElements: [calcElement1Payload, calcElement2Payload]
      };
    });

    let exec = async () => {
      device = new SpecialDevice();
      await device.init(devicePayload);
      return device.createVariable(variablePayload);
    };

    it("should create and return new variable", async () => {
      let result = await exec();

      let variable = await device.getVariable(variablePayload.id);

      expect(variable).toEqual(result);
    });

    it("should create and add variable based on given payload", async () => {
      let result = await exec();

      let variable = await device.getVariable(variablePayload.id);

      expect(variable).toBeDefined();
      expect(result.Payload).toEqual({
        ...variablePayload,
        value: variable.Value
      });
    });

    it("should not create and add variable if type is different than sdVariable", async () => {
      variablePayload = {
        id: "8001",
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
        unit: "unit1"
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

      expect(Object.keys(device.Variables).length).toEqual(3);
    });

    it("should not create and add variable if variable payload is corrupted", async () => {
      variablePayload.name = undefined;

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

      expect(Object.keys(device.Variables).length).toEqual(3);
    });
  });

  describe("removeVariable", () => {
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let calcElement1Payload;
    let calcElement2Payload;
    let removeVariableId;
    let variableToRemove;

    let devicePayload;
    let device;

    beforeEach(async () => {
      variable1Payload = {
        name: "testVariable1",
        id: "987654321",
        sampleTime: 2,
        archived: true,
        unit: 19,
        archiveSampleTime: 12,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
      variable2Payload = {
        name: "testVariable2",
        id: "987654322",
        sampleTime: 5,
        archived: false,
        unit: 28,
        archiveSampleTime: 13,
        elementDeviceId: "1234",
        elementId: "0003",
        type: "sdVariable"
      };
      variable3Payload = {
        name: "testVariable3",
        id: "987654323",
        sampleTime: 3,
        archived: true,
        unit: 14,
        archiveSampleTime: 14,
        elementDeviceId: "1235",
        elementId: "0005",
        type: "sdVariable"
      };
      calcElement1Payload = {
        id: "6001",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement3",
        unit: "A",
        variables: [
          {
            id: "987654322",
            factor: 1
          },
          {
            id: "987654323",
            factor: 2
          }
        ]
      };
      calcElement2Payload = {
        id: "6002",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement2",
        unit: "A",
        variables: [
          {
            id: "987654321",
            factor: 1
          },
          {
            id: "987654322",
            factor: 2
          }
        ]
      };
      removeVariableId = variable2Payload.id;
      devicePayload = {
        id: "123456",
        name: "testDevice",
        type: "SpecialDevice",
        calculationElements: [],
        variables: [variable1Payload, variable2Payload, variable3Payload],
        calculationElements: [calcElement1Payload, calcElement2Payload]
      };
    });

    let exec = async () => {
      device = new SpecialDevice();
      await device.init(devicePayload);
      variableToRemove = device.getElement(removeVariableId);
      return device.removeVariable(removeVariableId);
    };

    it("should remove and return new variable", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(variableToRemove);

      let variableExists = await device.getVariable(removeVariableId);
      expect(variableExists).toBeFalsy();
    });

    it("should not remove but throw if there is no variable of given id", async () => {
      removeVariableId = "fakeId";

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

      expect(Object.keys(device.Variables).length).toEqual(3);
    });
  });

  describe("Payload", () => {
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let calcElement1Payload;
    let calcElement2Payload;

    let devicePayload;
    let device;

    beforeEach(async () => {
      variable1Payload = {
        name: "testVariable1",
        id: "987654321",
        sampleTime: 2,
        archived: true,
        unit: 19,
        archiveSampleTime: 12,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
      variable2Payload = {
        name: "testVariable2",
        id: "987654322",
        sampleTime: 5,
        archived: false,
        unit: 28,
        archiveSampleTime: 13,
        elementDeviceId: "1234",
        elementId: "0003",
        type: "sdVariable"
      };
      variable3Payload = {
        name: "testVariable3",
        id: "987654323",
        sampleTime: 3,
        archived: true,
        unit: 14,
        archiveSampleTime: 14,
        elementDeviceId: "1235",
        elementId: "0005",
        type: "sdVariable"
      };
      calcElement1Payload = {
        id: "6001",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement3",
        unit: "A",
        variables: [
          {
            id: "987654322",
            factor: 1
          },
          {
            id: "987654323",
            factor: 2
          }
        ]
      };
      calcElement2Payload = {
        id: "6002",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement2",
        unit: "A",
        variables: [
          {
            id: "987654321",
            factor: 1
          },
          {
            id: "987654322",
            factor: 2
          }
        ]
      };

      devicePayload = {
        id: "123456",
        name: "testDevice",
        type: "SpecialDevice",
        calculationElements: [],
        variables: [variable1Payload, variable2Payload, variable3Payload],
        calculationElements: [calcElement1Payload, calcElement2Payload]
      };
    });

    let exec = async () => {
      device = new SpecialDevice();
      await device.init(devicePayload);
      return device.Payload;
    };

    it("should return valid payload of given device", async () => {
      let result = await exec();

      //Creating expected payload - extending it with varaible values
      let expectedPayload = { ...devicePayload };
      expectedPayload.variables = [];

      for (let variable of devicePayload.variables) {
        expectedPayload.variables.push({
          ...variable,
          value: device.Variables[variable.id].Value
        });
      }

      expect(result).toEqual(expectedPayload);
    });

    it("should return valid payload that can be used to recreate device", async () => {
      let result = await exec();

      let newDevice = new SpecialDevice();

      await newDevice.init(result);
      let newPayload = newDevice.Payload;

      //Creating expected payload - extending it with varaible values
      let expectedPayload = { ...devicePayload };
      expectedPayload.variables = [];

      for (let variable of devicePayload.variables) {
        expectedPayload.variables.push({
          ...variable,
          value: device.Variables[variable.id].Value
        });
      }

      expect(newPayload).toEqual(expectedPayload);
    });
  });

  describe("_refresh", () => {
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let calcElement1Payload;
    let calcElement2Payload;

    let devicePayload;
    let device;
    let tickNumber;

    beforeEach(async () => {
      variable1Payload = {
        name: "testVariable1",
        id: "987654321",
        sampleTime: 2,
        archived: true,
        unit: 19,
        archiveSampleTime: 4,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
      variable2Payload = {
        name: "testVariable2",
        id: "987654322",
        sampleTime: 3,
        archived: false,
        unit: 28,
        archiveSampleTime: 6,
        elementDeviceId: "1234",
        elementId: "0003",
        type: "sdVariable"
      };
      variable3Payload = {
        name: "testVariable3",
        id: "987654323",
        sampleTime: 4,
        archived: true,
        unit: 14,
        archiveSampleTime: 8,
        elementDeviceId: "1236",
        elementId: "3002",
        type: "sdVariable"
      };
      calcElement1Payload = {
        id: "6001",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement3",
        unit: "A",
        variables: [
          {
            id: "987654322",
            factor: 1
          },
          {
            id: "987654323",
            factor: 2
          }
        ]
      };
      calcElement2Payload = {
        id: "6002",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement2",
        unit: "A",
        variables: [
          {
            id: "987654321",
            factor: 1
          },
          {
            id: "987654322",
            factor: 2
          }
        ]
      };

      devicePayload = {
        id: "123456",
        name: "testDevice",
        type: "SpecialDevice",
        calculationElements: [],
        variables: [variable1Payload, variable2Payload, variable3Payload],
        calculationElements: [calcElement1Payload, calcElement2Payload]
      };

      tickNumber = 12;
    });

    let exec = async () => {
      device = new SpecialDevice();
      await device.init(devicePayload);
      return device._refresh(tickNumber);
    };

    it("should refresh all values that corresponds to given tickNumber and return object with their values", async () => {
      let result = await exec();
      let variable1 = device.getElement(variable1Payload.id);
      let variable2 = device.getElement(variable2Payload.id);
      let variable3 = device.getElement(variable3Payload.id);

      let expectedResult = {
        [variable1Payload.id]: variable1,
        [variable2Payload.id]: variable2,
        [variable3Payload.id]: variable3
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });

    it("should refresh all values that corresponds to given tickNumber and return object with their values - if some variables does not correspond", async () => {
      tickNumber = 6;
      let result = await exec();
      let variable1 = device.getElement(variable1Payload.id);
      let variable2 = device.getElement(variable2Payload.id);
      let variable3 = device.getElement(variable3Payload.id);

      let expectedResult = {
        [variable1Payload.id]: variable1,
        [variable2Payload.id]: variable2
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });

    it("should refresh all values that corresponds to given tickNumber and return object with their values - if no variables corresponds", async () => {
      tickNumber = 7;
      let result = await exec();
      let variable1 = device.getElement(variable1Payload.id);
      let variable2 = device.getElement(variable2Payload.id);
      let variable3 = device.getElement(variable3Payload.id);

      let expectedResult = {};

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });
  });

  describe("refresh", () => {
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let calcElement1Payload;
    let calcElement2Payload;
    let refreshHandler;
    let refreshSDMockFn;

    let devicePayload;
    let device;
    let tickNumber;

    beforeEach(async () => {
      refreshSDMockFn = jest.fn();
      refreshHandler = jest.fn();
      variable1Payload = {
        name: "testVariable1",
        id: "987654321",
        sampleTime: 2,
        archived: true,
        unit: 19,
        archiveSampleTime: 4,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
      variable2Payload = {
        name: "testVariable2",
        id: "987654322",
        sampleTime: 3,
        archived: false,
        unit: 28,
        archiveSampleTime: 6,
        elementDeviceId: "1234",
        elementId: "0003",
        type: "sdVariable"
      };
      variable3Payload = {
        name: "testVariable3",
        id: "987654323",
        sampleTime: 4,
        archived: true,
        unit: 14,
        archiveSampleTime: 8,
        elementDeviceId: "1236",
        elementId: "3002",
        type: "sdVariable"
      };
      calcElement1Payload = {
        id: "6001",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 10,
        sampleTime: 5,
        name: "sumElement3",
        unit: "A",
        variables: [
          {
            id: "987654322",
            factor: 1
          },
          {
            id: "987654323",
            factor: 2
          }
        ]
      };
      calcElement2Payload = {
        id: "6002",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 12,
        sampleTime: 6,
        name: "sumElement2",
        unit: "A",
        variables: [
          {
            id: "987654321",
            factor: 1
          },
          {
            id: "987654322",
            factor: 2
          }
        ]
      };

      devicePayload = {
        id: "123456",
        name: "testDevice",
        type: "SpecialDevice",
        calculationElements: [],
        variables: [variable1Payload, variable2Payload, variable3Payload],
        calculationElements: [calcElement1Payload, calcElement2Payload]
      };

      tickNumber = 2 * 3 * 4 * 5 * 6;
    });

    let exec = async () => {
      device = new SpecialDevice();
      await device.init(devicePayload);
      device._refreshSpecialDevice = refreshSDMockFn;
      device.Events.on("Refreshed", refreshHandler);
      return device.refresh(tickNumber);
    };

    it("should refresh all values that corresponds to given tickNumber and return object with their values - emit refresh event", async () => {
      await exec();
      let variable1 = device.getElement(variable1Payload.id);
      let variable2 = device.getElement(variable2Payload.id);
      let variable3 = device.getElement(variable3Payload.id);
      let calcElement1 = device.getElement(calcElement1Payload.id);
      let calcElement2 = device.getElement(calcElement2Payload.id);

      expect(refreshHandler).toHaveBeenCalledTimes(1);

      let refreshResult = refreshHandler.mock.calls[0][0][1];

      expect(Object.keys(refreshResult).length).toEqual(5);

      expect(refreshResult[variable1Payload.id]).toBeDefined();
      expect(refreshResult[variable1Payload.id]).toEqual(variable1);

      expect(refreshResult[variable2Payload.id]).toBeDefined();
      expect(refreshResult[variable2Payload.id]).toEqual(variable2);

      expect(refreshResult[variable3Payload.id]).toBeDefined();
      expect(refreshResult[variable3Payload.id]).toEqual(variable3);

      expect(refreshResult[calcElement1Payload.id]).toBeDefined();
      expect(refreshResult[calcElement1Payload.id]).toEqual(calcElement1);

      expect(refreshResult[calcElement2Payload.id]).toBeDefined();
      expect(refreshResult[calcElement2Payload.id]).toEqual(calcElement2);
    });

    it("should refresh only values that corresponds to given tickNumber - emit refresh event", async () => {
      tickNumber = 2 * 5;

      await exec();
      let variable1 = device.getElement(variable1Payload.id);
      let variable2 = device.getElement(variable2Payload.id);
      let variable3 = device.getElement(variable3Payload.id);
      let calcElement1 = device.getElement(calcElement1Payload.id);
      let calcElement2 = device.getElement(calcElement2Payload.id);

      expect(refreshHandler).toHaveBeenCalledTimes(1);

      let refreshResult = refreshHandler.mock.calls[0][0][1];

      expect(Object.keys(refreshResult).length).toEqual(2);

      expect(refreshResult[variable1Payload.id]).toBeDefined();
      expect(refreshResult[variable1Payload.id]).toEqual(variable1);

      expect(refreshResult[calcElement1Payload.id]).toBeDefined();
      expect(refreshResult[calcElement1Payload.id]).toEqual(calcElement1);
    });

    it("should archive all values that corresponds to given tickNumber and are archived", async () => {
      await exec();
      let variable1 = device.getElement(variable1Payload.id);
      let variable2 = device.getElement(variable2Payload.id);
      let variable3 = device.getElement(variable3Payload.id);
      let calcElement1 = device.getElement(calcElement1Payload.id);
      let calcElement2 = device.getElement(calcElement2Payload.id);

      let var1Column = device.ArchiveManager.getColumnName(variable1);
      let var2Column = device.ArchiveManager.getColumnName(variable2);
      let var3Column = device.ArchiveManager.getColumnName(variable3);
      let ce1Column = device.ArchiveManager.getColumnName(calcElement1);
      let ce2Column = device.ArchiveManager.getColumnName(calcElement2);

      let deviceDbPath = path.join(db1Path, `archive_${device.Id}.db`);

      let allArchivedData = await readAllDataFromTable(deviceDbPath, "data");

      //Only one row should have been insterted
      expect(allArchivedData.length).toEqual(1);

      expect(allArchivedData[0]).toBeDefined();
      expect(allArchivedData[0]["date"]).toEqual(tickNumber);
      expect(allArchivedData[0][var1Column]).toEqual(variable1.Value);
      //Variable2 is not archived - should not be archived
      expect(allArchivedData[0][var2Column]).not.toBeDefined();
      expect(allArchivedData[0][var3Column]).toEqual(variable3.Value);
      expect(allArchivedData[0][ce1Column]).toEqual(calcElement1.Value);
      expect(allArchivedData[0][ce2Column]).toEqual(calcElement2.Value);

      //Length - 4 elements + date
      expect(Object.keys(allArchivedData[0]).length).toEqual(5);
    });

    it("should archive all values that archiveSampleTime corresponds to given tickNumber and are archived", async () => {
      tickNumber = 2 * 10; //<--- only 4 (firstVariable) and 10 (firstCalcElement) corresponds

      await exec();
      let variable1 = device.getElement(variable1Payload.id);
      let variable2 = device.getElement(variable2Payload.id);
      let variable3 = device.getElement(variable3Payload.id);
      let calcElement1 = device.getElement(calcElement1Payload.id);
      let calcElement2 = device.getElement(calcElement2Payload.id);

      let var1Column = device.ArchiveManager.getColumnName(variable1);
      let var2Column = device.ArchiveManager.getColumnName(variable2);
      let var3Column = device.ArchiveManager.getColumnName(variable3);
      let ce1Column = device.ArchiveManager.getColumnName(calcElement1);
      let ce2Column = device.ArchiveManager.getColumnName(calcElement2);

      let deviceDbPath = path.join(db1Path, `archive_${device.Id}.db`);

      let allArchivedData = await readAllDataFromTable(deviceDbPath, "data");

      //Only one row should have been insterted
      expect(allArchivedData.length).toEqual(1);

      expect(allArchivedData[0]).toBeDefined();
      expect(allArchivedData[0]["date"]).toEqual(tickNumber);
      expect(allArchivedData[0][var1Column]).toEqual(variable1.Value);
      //Variable2 is not archived - should not be archived
      expect(allArchivedData[0][var2Column]).not.toBeDefined();
      //Variable3 does not fit - return null
      expect(allArchivedData[0][var3Column]).toBeNull();
      expect(allArchivedData[0][ce1Column]).toEqual(calcElement1.Value);
      //CalcElement2 does not fit - return null
      expect(allArchivedData[0][ce2Column]).toBeNull();

      //Length - 4 elements (2 x null) + date
      expect(Object.keys(allArchivedData[0]).length).toEqual(5);
    });

    it("should call _refreshSpecialDevice", async () => {
      await exec();

      expect(refreshSDMockFn).toHaveBeenCalledTimes(1);
      expect(refreshSDMockFn.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("should refresh all values even if calling _refreshSpecialDevice throws an error", async () => {
      refreshSDMockFn = jest.fn().mockRejectedValue(new Error("test error"));

      await exec();
      let variable1 = device.getElement(variable1Payload.id);
      let variable2 = device.getElement(variable2Payload.id);
      let variable3 = device.getElement(variable3Payload.id);
      let calcElement1 = device.getElement(calcElement1Payload.id);
      let calcElement2 = device.getElement(calcElement2Payload.id);

      expect(refreshHandler).toHaveBeenCalledTimes(1);

      let refreshResult = refreshHandler.mock.calls[0][0][1];

      expect(Object.keys(refreshResult).length).toEqual(5);

      expect(refreshResult[variable1Payload.id]).toBeDefined();
      expect(refreshResult[variable1Payload.id]).toEqual(variable1);

      expect(refreshResult[variable2Payload.id]).toBeDefined();
      expect(refreshResult[variable2Payload.id]).toEqual(variable2);

      expect(refreshResult[variable3Payload.id]).toBeDefined();
      expect(refreshResult[variable3Payload.id]).toEqual(variable3);

      expect(refreshResult[calcElement1Payload.id]).toBeDefined();
      expect(refreshResult[calcElement1Payload.id]).toEqual(calcElement1);

      expect(refreshResult[calcElement2Payload.id]).toBeDefined();
      expect(refreshResult[calcElement2Payload.id]).toEqual(calcElement2);
    });
  });

  describe("editVariable", () => {
    let sdVariable;
    let variablePayload;
    let editId;
    let editPayload;

    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let calcElement1Payload;
    let calcElement2Payload;

    let devicePayload;
    let device;

    beforeEach(() => {
      variablePayload = {
        name: "testSpecialDevice",
        id: "987654325",
        sampleTime: 5,
        archived: true,
        unit: 15,
        archiveSampleTime: 10,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };

      editId = variablePayload.id;

      editPayload = {
        name: "testSpecialDevice",
        sampleTime: 15,
        archived: false,
        unit: 20,
        archiveSampleTime: 30,
        elementDeviceId: "1234",
        elementId: "0003"
      };
      variable1Payload = {
        name: "testVariable1",
        id: "987654321",
        sampleTime: 2,
        archived: true,
        unit: 19,
        archiveSampleTime: 12,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
      variable2Payload = {
        name: "testVariable2",
        id: "987654322",
        sampleTime: 5,
        archived: false,
        unit: 28,
        archiveSampleTime: 13,
        elementDeviceId: "1234",
        elementId: "0003",
        type: "sdVariable"
      };
      variable3Payload = {
        name: "testVariable3",
        id: "987654323",
        sampleTime: 3,
        archived: true,
        unit: 14,
        archiveSampleTime: 14,
        elementDeviceId: "1236",
        elementId: "3002",
        type: "sdVariable"
      };
      calcElement1Payload = {
        id: "6001",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement3",
        unit: "A",
        variables: [
          {
            id: "987654322",
            factor: 1
          },
          {
            id: "987654323",
            factor: 2
          }
        ]
      };
      calcElement2Payload = {
        id: "6002",
        type: "sumElement",
        archived: true,
        archiveSampleTime: 15,
        sampleTime: 1,
        name: "sumElement2",
        unit: "A",
        variables: [
          {
            id: "987654321",
            factor: 1
          },
          {
            id: "987654322",
            factor: 2
          }
        ]
      };

      devicePayload = {
        id: "123456",
        name: "testDevice",
        type: "SpecialDevice",
        calculationElements: [],
        variables: [variable1Payload, variable2Payload, variable3Payload],
        calculationElements: [calcElement1Payload, calcElement2Payload]
      };
    });

    let exec = async () => {
      device = new SpecialDevice();
      await device.init(devicePayload);

      sdVariable = await device.createVariable(variablePayload);
      return device.editVariable(editId, editPayload);
    };

    it("should edit variable based on given payload and return it", async () => {
      let result = await exec();
      let expectedPayload = {
        ...editPayload,
        type: variablePayload.type,
        id: variablePayload.id,
        value: sdVariable.Value
      };

      expect(sdVariable.Payload).toEqual(expectedPayload);
      expect(result).toEqual(sdVariable);
    });

    it("should reassign connected variable", async () => {
      let reassignElement = await commInterface.getElement(
        editPayload.elementDeviceId,
        editPayload.elementId
      );

      await exec();
      expect(sdVariable.ElementId).toEqual(editPayload.elementId);
      expect(sdVariable.ElementDeviceId).toEqual(editPayload.elementDeviceId);
      expect(sdVariable.Element).toEqual(reassignElement);
      //Value type should also change
      expect(sdVariable.ValueType).toEqual(reassignElement.ValueType);
    });

    it("should not edit id but throw if id is given in payload", async () => {
      editPayload.id = "10101010";

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

      expect(sdVariable.Id).toEqual(variablePayload.id);
    });

    it("should not edit id but throw if there is no device of given id", async () => {
      editPayload.elementDeviceId = "10101010";

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

      expect(sdVariable.Payload).toEqual({
        ...variablePayload,
        value: sdVariable.Value
      });
    });

    it("should only reassign connected variable if only elementId and deviceId is given in payload", async () => {
      editPayload = {
        elementDeviceId: editPayload.elementDeviceId,
        elementId: editPayload.elementId
      };

      let reassignElement = await commInterface.getElement(
        editPayload.elementDeviceId,
        editPayload.elementId
      );

      await exec();
      expect(sdVariable.ElementId).toEqual(editPayload.elementId);
      expect(sdVariable.ElementDeviceId).toEqual(editPayload.elementDeviceId);
      expect(sdVariable.Element).toEqual(reassignElement);
      //Value type should also change
      expect(sdVariable.ValueType).toEqual(reassignElement.ValueType);

      let expectedPayload = {
        ...variablePayload,
        ...editPayload,
        value: sdVariable.Value
      };

      expect(sdVariable.Payload).toEqual(expectedPayload);
    });

    it("should edit only name if only name is given in payload", async () => {
      editPayload = {
        name: editPayload.name
      };

      let reassignElement = await commInterface.getElement(
        variablePayload.elementDeviceId,
        variablePayload.elementId
      );

      await exec();
      expect(sdVariable.Element).toEqual(reassignElement);
      //Value type should also change
      expect(sdVariable.ValueType).toEqual(reassignElement.ValueType);

      let expectedPayload = {
        ...variablePayload,
        ...editPayload,
        value: sdVariable.Value
      };

      expect(sdVariable.Payload).toEqual(expectedPayload);
    });

    it("should edit only unit if only unit is given in payload", async () => {
      editPayload = {
        unit: editPayload.unit
      };

      let reassignElement = await commInterface.getElement(
        variablePayload.elementDeviceId,
        variablePayload.elementId
      );

      await exec();
      expect(sdVariable.Element).toEqual(reassignElement);
      //Value type should also change
      expect(sdVariable.ValueType).toEqual(reassignElement.ValueType);

      let expectedPayload = {
        ...variablePayload,
        ...editPayload,
        value: sdVariable.Value
      };

      expect(sdVariable.Payload).toEqual(expectedPayload);
    });

    it("should edit only unit if only archive is given in payload", async () => {
      editPayload = {
        archived: editPayload.archived
      };

      let reassignElement = await commInterface.getElement(
        variablePayload.elementDeviceId,
        variablePayload.elementId
      );

      await exec();
      expect(sdVariable.Element).toEqual(reassignElement);
      //Value type should also change
      expect(sdVariable.ValueType).toEqual(reassignElement.ValueType);

      let expectedPayload = {
        ...variablePayload,
        ...editPayload,
        value: sdVariable.Value
      };

      expect(sdVariable.Payload).toEqual(expectedPayload);
    });

    it("should edit only sampleTime if only sampleTime is given in payload", async () => {
      editPayload = {
        sampleTime: editPayload.sampleTime
      };

      let reassignElement = await commInterface.getElement(
        variablePayload.elementDeviceId,
        variablePayload.elementId
      );

      await exec();
      expect(sdVariable.Element).toEqual(reassignElement);
      //Value type should also change
      expect(sdVariable.ValueType).toEqual(reassignElement.ValueType);

      let expectedPayload = {
        ...variablePayload,
        ...editPayload,
        value: sdVariable.Value
      };

      expect(sdVariable.Payload).toEqual(expectedPayload);
    });

    it("should edit only archiveSampleTime if only archiveSampleTime is given in payload", async () => {
      editPayload = {
        archiveSampleTime: editPayload.archiveSampleTime
      };

      let reassignElement = await commInterface.getElement(
        variablePayload.elementDeviceId,
        variablePayload.elementId
      );

      await exec();
      expect(sdVariable.Element).toEqual(reassignElement);
      //Value type should also change
      expect(sdVariable.ValueType).toEqual(reassignElement.ValueType);

      let expectedPayload = {
        ...variablePayload,
        ...editPayload,
        value: sdVariable.Value
      };

      expect(sdVariable.Payload).toEqual(expectedPayload);
    });
  });

  describe("editWithPayload", () => {
    let name;
    let payload;
    let device;
    let nameToEdit;
    let payloadToEdit;

    beforeEach(() => {
      name = "test name";
      nameToEdit = "new test name";
    });

    let exec = async () => {
      payload = { name: name };
      device = new SpecialDevice();
      await device.init(payload);
      payloadToEdit = { name: nameToEdit };
      return device.editWithPayload(payloadToEdit);
    };

    it("should edit device according to payload", async () => {
      await exec();

      expect(device.Name).toBeDefined();
      expect(device.Name).toEqual(nameToEdit);
    });

    it("should not edit name if name is not defined in payload", async () => {
      nameToEdit = undefined;
      await exec();

      expect(device.Name).toBeDefined();
      expect(device.Name).toEqual(name);
    });
  });
});
