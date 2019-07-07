const SDVariable = require("../../../classes/variable/SpecialDevice/SDVariable");
const SpecialDevice = require("../../../classes/device/SpecialDevices/SpecialDevice");
const config = require("config");
const { clearDirectoryAsync } = require("../../../utilities/utilities");
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

describe("SDVariable", () => {
  let db1Path;
  let db2Path;
  let initPayload;
  let fakeDevice;
  let commInterface;

  //Creating seperate commInterface to all tests
  beforeEach(async () => {
    jest.resetModules();
    commInterface = require("../../../classes/commInterface/CommInterface.js");
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
    fakeDevice = "fakeDevice";
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

  describe("constructor", () => {
    let exec = () => {
      return new SDVariable(fakeDevice);
    };

    it("should assign device to Device object", () => {
      let result = exec();
      expect(result.Device).toBeDefined();
      expect(result.Device).toEqual(fakeDevice);
    });

    it("should assign commInterface to variable", () => {
      let result = exec();
      expect(result.CommInterface).toBeDefined();
      expect(result.CommInterface).toEqual(commInterface);
    });
  });

  describe("init", () => {
    let sdVariable;
    let variablePayload;

    beforeEach(() => {
      variablePayload = {
        name: "testSpecialDevice",
        id: "987654321",
        sampleTime: 5,
        archived: true,
        unit: 15,
        archiveSampleTime: 10,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
    });

    let exec = async () => {
      sdVariable = new SDVariable(fakeDevice);
      return sdVariable.init(variablePayload);
    };

    it("should initialize variable based on given payload", async () => {
      await exec();

      expect(sdVariable.Payload).toBeDefined();
      expect(sdVariable.Payload).toEqual({
        ...variablePayload,
        value: sdVariable.Value
      });
    });

    it("should assign element to variable if it is variable", async () => {
      let elementToAssign = await commInterface.getElement(
        variablePayload.elementDeviceId,
        variablePayload.elementId
      );
      await exec();

      expect(sdVariable.Element).toBeDefined();
      expect(sdVariable.Element).toEqual(elementToAssign);
    });

    it("should throw if elementId is not defined", async () => {
      variablePayload.elementId = undefined;

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

    it("should throw if elementDeviceId is not defined", async () => {
      variablePayload.elementDeviceId = undefined;

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

    it("should throw if there is no device of given id", async () => {
      variablePayload.elementDeviceId = "fakeDevice";

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

    it("should throw if there is no element of given id", async () => {
      variablePayload.elementId = "fakeElement";

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

  describe("get Value", () => {
    let sdVariable;
    let variablePayload;

    beforeEach(() => {
      variablePayload = {
        name: "testSpecialDevice",
        id: "987654321",
        sampleTime: 5,
        archived: true,
        unit: 15,
        archiveSampleTime: 10,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
    });

    let exec = async () => {
      sdVariable = new SDVariable(fakeDevice);
      await sdVariable.init(variablePayload);
      return sdVariable.Value;
    };

    it("should return value of connected variable", async () => {
      let result = await exec();
      let elementToAssign = await commInterface.getElement(
        variablePayload.elementDeviceId,
        variablePayload.elementId
      );

      expect(result).toBeDefined();
      expect(result).toEqual(elementToAssign.Value);
    });
  });

  describe("set Value", () => {
    let sdVariable;
    let variablePayload;
    let newValue;

    beforeEach(() => {
      variablePayload = {
        name: "testSpecialDevice",
        id: "987654321",
        sampleTime: 5,
        archived: true,
        unit: 15,
        archiveSampleTime: 10,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };

      newValue = "123456.654321";
    });

    let exec = async () => {
      sdVariable = new SDVariable(fakeDevice);
      await sdVariable.init(variablePayload);
      sdVariable.Value = newValue;
    };

    it("should assign value to connected variable", async () => {
      await exec();
      let elementToAssign = await commInterface.getElement(
        variablePayload.elementDeviceId,
        variablePayload.elementId
      );

      expect(elementToAssign.Value).toEqual(newValue);
    });
  });

  describe("Payload", () => {
    let sdVariable;
    let variablePayload;

    beforeEach(() => {
      variablePayload = {
        name: "testSpecialDevice",
        id: "987654321",
        sampleTime: 5,
        archived: true,
        unit: 15,
        archiveSampleTime: 10,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
    });

    let exec = async () => {
      sdVariable = new SDVariable(fakeDevice);
      await sdVariable.init(variablePayload);
      return sdVariable.Payload;
    };

    it("should return valid payload of variable", async () => {
      let result = await exec();
      expect(result).toEqual({
        ...variablePayload,
        value: sdVariable.Value
      });
    });

    it("should be possible to recreate variable based on this Payload", async () => {
      let result = await exec();
      let newVariable = new SDVariable(fakeDevice);
      await newVariable.init(result);

      expect(newVariable.Payload).toEqual({
        ...variablePayload,
        value: sdVariable.Value
      });
    });
  });

  describe("_editElementAssignment", () => {
    let sdVariable;
    let variablePayload;
    let editElementPayload;

    beforeEach(() => {
      variablePayload = {
        name: "testSpecialDevice",
        id: "987654321",
        sampleTime: 5,
        archived: true,
        unit: 15,
        archiveSampleTime: 10,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
      editElementPayload = {
        elementDeviceId: "1234",
        elementId: "0003"
      };
    });

    let exec = async () => {
      sdVariable = new SDVariable(fakeDevice);
      await sdVariable.init(variablePayload);
      return sdVariable._editElementAssignment(editElementPayload);
    };

    it("should reassign connected variable", async () => {
      let reassignElement = await commInterface.getElement(
        editElementPayload.elementDeviceId,
        editElementPayload.elementId
      );

      await exec();
      expect(sdVariable.ElementId).toEqual(editElementPayload.elementId);
      expect(sdVariable.ElementDeviceId).toEqual(
        editElementPayload.elementDeviceId
      );
      expect(sdVariable.Element).toEqual(reassignElement);
      //Value type should also change
      expect(sdVariable.ValueType).toEqual(reassignElement.ValueType);
    });

    it("should not reassign variableif elementDeviceId and elementId are not presented in payload", async () => {
      let initialElementToAssign = await commInterface.getElement(
        variablePayload.elementDeviceId,
        variablePayload.elementId
      );

      editElementPayload.elementDeviceId = undefined;
      editElementPayload.elementId = undefined;

      await exec();

      expect(sdVariable.ElementId).toEqual(variablePayload.elementId);
      expect(sdVariable.ElementDeviceId).toEqual(
        variablePayload.elementDeviceId
      );
      expect(sdVariable.Element).toEqual(initialElementToAssign);
      expect(sdVariable.ValueType).toEqual(initialElementToAssign.ValueType);
    });

    it("should not reassign variable but throw if there is no device of given id", async () => {
      let initialElementToAssign = await commInterface.getElement(
        variablePayload.elementDeviceId,
        variablePayload.elementId
      );

      editElementPayload.elementDeviceId = "fakeDevice";

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

      expect(sdVariable.ElementId).toEqual(variablePayload.elementId);
      expect(sdVariable.ElementDeviceId).toEqual(
        variablePayload.elementDeviceId
      );
      expect(sdVariable.Element).toEqual(initialElementToAssign);
      expect(sdVariable.ValueType).toEqual(initialElementToAssign.ValueType);
    });

    it("should not reassign variable but throw if there is no element of given id", async () => {
      let initialElementToAssign = await commInterface.getElement(
        variablePayload.elementDeviceId,
        variablePayload.elementId
      );

      editElementPayload.elementId = "fakeElement";

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

      expect(sdVariable.ElementId).toEqual(variablePayload.elementId);
      expect(sdVariable.ElementDeviceId).toEqual(
        variablePayload.elementDeviceId
      );
      expect(sdVariable.Element).toEqual(initialElementToAssign);
      expect(sdVariable.ValueType).toEqual(initialElementToAssign.ValueType);
    });

    it("should reassign connected variable if changes are associated only with elementId", async () => {
      editElementPayload.elementId = "0005";
      editElementPayload.elementDeviceId = undefined;

      let reassignElement = await commInterface.getElement(
        variablePayload.elementDeviceId,
        editElementPayload.elementId
      );

      await exec();
      expect(sdVariable.ElementId).toEqual(editElementPayload.elementId);
      expect(sdVariable.ElementDeviceId).toEqual(
        variablePayload.elementDeviceId
      );
      expect(sdVariable.Element).toEqual(reassignElement);
      //Value type should also change
      expect(sdVariable.ValueType).toEqual(reassignElement.ValueType);
    });
  });

  describe("editWithPayload", () => {
    let sdVariable;
    let variablePayload;
    let editPayload;

    beforeEach(() => {
      variablePayload = {
        name: "testSpecialDevice",
        id: "987654321",
        sampleTime: 5,
        archived: true,
        unit: 15,
        archiveSampleTime: 10,
        elementDeviceId: "1235",
        elementId: "0006",
        type: "sdVariable"
      };
      editPayload = {
        name: "testSpecialDevice",
        sampleTime: 15,
        archived: false,
        unit: 20,
        archiveSampleTime: 30,
        elementDeviceId: "1234",
        elementId: "0003"
      };
    });

    let exec = async () => {
      sdVariable = new SDVariable(fakeDevice);
      await sdVariable.init(variablePayload);
      return sdVariable.editWithPayload(editPayload);
    };

    it("should edit variable based on given payload", async () => {
      await exec();
      let expectedPayload = {
        ...editPayload,
        type: variablePayload.type,
        id: variablePayload.id,
        value: sdVariable.Value
      };

      expect(sdVariable.Payload).toEqual(expectedPayload);
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
});
