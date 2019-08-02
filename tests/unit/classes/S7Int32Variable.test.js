const S7Request = require("../../../classes/driver/S7/S7Request");
const S7Driver = require("../../../classes/driver/S7/S7Driver");
const config = require("config");
const S7Int32Variable = require("../../../classes/variable/S7/S7Int32Variable");
const snap7 = require("node-snap7");
const S7Device = require("../../../classes/device/S7/S7Device");
const {
  snooze,
  exists,
  readAllDataFromTable,
  clearDirectoryAsync
} = require("../../../utilities/utilities");

describe("S7Int32Variable", () => {
  //Database directory should be cleared
  let db1Path;
  let db2Path;
  beforeEach(async () => {
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
  });

  afterEach(async () => {
    await clearDirectoryAsync(db1Path);
    await clearDirectoryAsync(db2Path);
  });

  describe("init", () => {
    let device;
    let devicePayload;
    let variable;
    let variablePayload;

    beforeEach(async () => {
      devicePayload = {
        id: "1234",
        name: "testDevice",
        type: "s7Device",
        ipAdress: "192.169.9.12",
        isActive: false,
        rack: 9,
        slot: 8,
        timeout: 100,
        variables: [],
        calculationElements: []
      };

      variablePayload = {
        id: "varId1",
        name: "testVar1",
        sampleTime: 1,
        archiveSampleTime: 2,
        archived: false,
        unit: "",
        type: "s7Int32",
        areaType: "DB",
        length: 2,
        write: false,
        dbNumber: 1,
        offset: 1,
        unit: "A"
      };
    });

    let exec = async () => {
      device = new S7Device();
      await device.init(devicePayload);
      variable = new S7Int32Variable(device);

      return variable.init(variablePayload);
    };

    it("should initialize variable based on given payload", async () => {
      await exec();

      expect(variable.Payload).toEqual(variablePayload);
    });

    it("should create getSingleRequest and setSingleRequest according to data in payload", async () => {
      await exec();

      expect(variable.GetSingleRequest).toBeDefined();
      expect(variable.GetSingleRequest.AreaType).toEqual(
        variablePayload.areaType
      );
      expect(variable.GetSingleRequest.DBNumber).toEqual(
        variablePayload.dbNumber
      );
      expect(variable.GetSingleRequest.Offset).toEqual(variablePayload.offset);
      expect(variable.GetSingleRequest.Length).toEqual(variablePayload.length);
      expect(variable.GetSingleRequest.Write).toEqual(false);
      expect(variable.GetSingleRequest.Length).toEqual(variablePayload.length);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);

      expect(variable.SetSingleRequest).toBeDefined();
      expect(variable.SetSingleRequest.AreaType).toEqual(
        variablePayload.areaType
      );
      expect(variable.SetSingleRequest.DBNumber).toEqual(
        variablePayload.dbNumber
      );
      expect(variable.SetSingleRequest.Offset).toEqual(variablePayload.offset);
      expect(variable.SetSingleRequest.Length).toEqual(variablePayload.length);
      expect(variable.SetSingleRequest.Write).toEqual(true);
      expect(variable.SetSingleRequest.Length).toEqual(variablePayload.length);

      expect(
        Object.values(variable.SetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.SetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);
    });

    it("should set value of variable if it is given in payload", async () => {
      variablePayload.value = 5;
      await exec();

      expect(variable.Value).toEqual(5);
    });

    it("should set value of variable to 0 if it is not defined in payload", async () => {
      variablePayload.value = undefined;

      await exec();

      expect(variable.Value).toEqual(0);
    });

    it("should throw if name is not defined", async () => {
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
    });

    it("should set sampleTime to 1 if it is not defined", async () => {
      variablePayload.sampleTime = undefined;

      await exec();

      expect(variable.SampleTime).toEqual(1);
    });

    it("should set Archived to false if it is not defined in payload", async () => {
      variablePayload.archived = undefined;

      await exec();

      expect(variable.Archived).toEqual(false);
    });

    it("should set Archived to false if it is set to false in payload", async () => {
      variablePayload.archived = false;

      await exec();

      expect(variable.Archived).toEqual(false);
    });

    it("should set default time sample to 1s if sampleTime is not defined", async () => {
      variablePayload.sampleTime = undefined;

      await exec();

      expect(variable.SampleTime).toEqual(1);
    });

    it("should set archiveSampleTime to sampleTime if archiveSampleTime is not defined", async () => {
      variablePayload.archiveSampleTime = undefined;

      await exec();

      expect(variable.ArchiveSampleTime).toEqual(variablePayload.sampleTime);
    });

    it("should set archiveSampleTime to 1 if archiveSampleTime and sampleTime is not defined", async () => {
      variablePayload.archiveSampleTime = undefined;
      variablePayload.sampleTime = undefined;

      await exec();

      expect(variable.ArchiveSampleTime).toEqual(1);
    });

    it("should set unit to empty string if it is not defined", async () => {
      variablePayload.unit = undefined;

      await exec();

      expect(variable.Unit).toEqual("");
    });

    it("should generate id if it is not defined in payload", async () => {
      variablePayload.id = undefined;

      await exec();

      expect(variable.Id).toBeDefined();
    });

    it("should throw if areaType is not defined", async () => {
      variablePayload.areaType = undefined;

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

    it("should throw if offset is not defined", async () => {
      variablePayload.offset = undefined;

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

    it("should set length to 4 if it is not defined in payload", async () => {
      variablePayload.length = undefined;

      await exec();

      expect(variable.Length).toEqual(4);
    });

    it("should set length to 4 even if it is defined in payload as a different value", async () => {
      variablePayload.length = 6;

      await exec();

      expect(variable.Length).toEqual(4);
    });

    it("should throw if write is not defined", async () => {
      variablePayload.write = undefined;

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

    it("should set dbNumber to 0 if it is not defined in payload", async () => {
      variablePayload.dbNumber = undefined;

      await exec();

      expect(variable.DBNumber).toEqual(0);
    });

    it("should throw if areaType is not recognized", async () => {
      variablePayload.areaType = "fakeArea";

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

  describe("editWithPayload", () => {
    let device;
    let devicePayload;
    let variable;
    let variablePayload;
    let editPayload;
    let oldGetRequest;
    let oldSetRequest;
    let oldValueTickId;

    beforeEach(async () => {
      devicePayload = {
        id: "1234",
        name: "testDevice",
        type: "s7Device",
        ipAdress: "192.169.9.12",
        isActive: false,
        rack: 9,
        slot: 8,
        timeout: 100,
        variables: [],
        calculationElements: []
      };

      variablePayload = {
        id: "varId1",
        name: "testVar1",
        sampleTime: 1,
        archiveSampleTime: 2,
        archived: false,
        type: "s7Int32",
        areaType: "DB",
        length: 2,
        write: false,
        dbNumber: 1,
        offset: 1,
        unit: "A"
      };

      editPayload = {
        name: "testVar2",
        sampleTime: 3,
        archiveSampleTime: 4,
        archived: true,
        areaType: "M",
        write: true,
        dbNumber: 2,
        offset: 3,
        unit: "C"
      };
    });

    let exec = async () => {
      device = new S7Device();
      await device.init(devicePayload);
      variable = new S7Int32Variable(device);
      await variable.init(variablePayload);
      oldValueTickId = variable.ValueTickId;

      oldGetRequest = variable.GetSingleRequest;
      oldSetRequest = variable.SetSingleRequest;

      return variable.editWithPayload(editPayload);
    };

    it("should edit variable based on given payload", async () => {
      await exec();

      expect(variable.Payload).toEqual({
        ...variablePayload,
        ...editPayload,
        value: undefined
      });
    });

    it("should return edited variable", async () => {
      let result = await exec();

      expect(result).toEqual(variable);
    });

    it("should throw and not edit if areaType is not recognized", async () => {
      editPayload = { areaType: "fakeArea" };

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

      expect(variable.Payload).toEqual(variablePayload);
    });

    it("should change requests if offset is edited", async () => {
      editPayload = { offset: 5 };

      await exec();

      expect(variable.GetSingleRequest).not.toEqual(oldGetRequest);
      expect(variable.SetSingleRequest).not.toEqual(oldSetRequest);

      expect(variable.GetSingleRequest).toBeDefined();
      expect(variable.GetSingleRequest.AreaType).toEqual(variable.AreaType);
      expect(variable.GetSingleRequest.DBNumber).toEqual(variable.DBNumber);
      expect(variable.GetSingleRequest.Offset).toEqual(variable.Offset);
      expect(variable.GetSingleRequest.Length).toEqual(variable.Length);
      expect(variable.GetSingleRequest.Write).toEqual(false);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);

      expect(variable.SetSingleRequest).toBeDefined();
      expect(variable.SetSingleRequest.AreaType).toEqual(variable.AreaType);
      expect(variable.SetSingleRequest.DBNumber).toEqual(variable.DBNumber);
      expect(variable.SetSingleRequest.Offset).toEqual(variable.Offset);
      expect(variable.SetSingleRequest.Length).toEqual(variable.Length);
      expect(variable.SetSingleRequest.Write).toEqual(true);
      expect(
        Object.values(variable.SetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.SetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);
    });

    it("should change requests if length is edited", async () => {
      editPayload = { length: 5 };

      await exec();

      expect(variable.GetSingleRequest).not.toEqual(oldGetRequest);
      expect(variable.SetSingleRequest).not.toEqual(oldSetRequest);

      expect(variable.GetSingleRequest).toBeDefined();
      expect(variable.GetSingleRequest.AreaType).toEqual(variable.AreaType);
      expect(variable.GetSingleRequest.DBNumber).toEqual(variable.DBNumber);
      expect(variable.GetSingleRequest.Offset).toEqual(variable.Offset);
      expect(variable.GetSingleRequest.Length).toEqual(variable.Length);
      expect(variable.GetSingleRequest.Write).toEqual(false);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);

      expect(variable.SetSingleRequest).toBeDefined();
      expect(variable.SetSingleRequest.AreaType).toEqual(variable.AreaType);
      expect(variable.SetSingleRequest.DBNumber).toEqual(variable.DBNumber);
      expect(variable.SetSingleRequest.Offset).toEqual(variable.Offset);
      expect(variable.SetSingleRequest.Length).toEqual(variable.Length);
      expect(variable.SetSingleRequest.Write).toEqual(true);
      expect(
        Object.values(variable.SetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.SetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);
    });

    it("should change requests if areaType is edited", async () => {
      editPayload = { areaType: "I" };

      await exec();

      expect(variable.GetSingleRequest).not.toEqual(oldGetRequest);
      expect(variable.SetSingleRequest).not.toEqual(oldSetRequest);

      expect(variable.GetSingleRequest).toBeDefined();
      expect(variable.GetSingleRequest.AreaType).toEqual(variable.AreaType);
      expect(variable.GetSingleRequest.DBNumber).toEqual(variable.DBNumber);
      expect(variable.GetSingleRequest.Offset).toEqual(variable.Offset);
      expect(variable.GetSingleRequest.Length).toEqual(variable.Length);
      expect(variable.GetSingleRequest.Write).toEqual(false);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);

      expect(variable.SetSingleRequest).toBeDefined();
      expect(variable.SetSingleRequest.AreaType).toEqual(variable.AreaType);
      expect(variable.SetSingleRequest.DBNumber).toEqual(variable.DBNumber);
      expect(variable.SetSingleRequest.Offset).toEqual(variable.Offset);
      expect(variable.SetSingleRequest.Length).toEqual(variable.Length);
      expect(variable.SetSingleRequest.Write).toEqual(true);
      expect(
        Object.values(variable.SetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.SetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);
    });

    it("should change requests if dbNumber is edited", async () => {
      editPayload = { dbNumber: 5 };

      await exec();

      expect(variable.GetSingleRequest).not.toEqual(oldGetRequest);
      expect(variable.SetSingleRequest).not.toEqual(oldSetRequest);

      expect(variable.GetSingleRequest).toBeDefined();
      expect(variable.GetSingleRequest.AreaType).toEqual(variable.AreaType);
      expect(variable.GetSingleRequest.DBNumber).toEqual(variable.DBNumber);
      expect(variable.GetSingleRequest.Offset).toEqual(variable.Offset);
      expect(variable.GetSingleRequest.Length).toEqual(variable.Length);
      expect(variable.GetSingleRequest.Write).toEqual(false);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);

      expect(variable.SetSingleRequest).toBeDefined();
      expect(variable.SetSingleRequest.AreaType).toEqual(variable.AreaType);
      expect(variable.SetSingleRequest.DBNumber).toEqual(variable.DBNumber);
      expect(variable.SetSingleRequest.Offset).toEqual(variable.Offset);
      expect(variable.SetSingleRequest.Length).toEqual(variable.Length);
      expect(variable.SetSingleRequest.Write).toEqual(true);
      expect(
        Object.values(variable.SetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.SetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);
    });

    it("should change requests if write is edited", async () => {
      editPayload = { write: true };

      await exec();

      expect(variable.GetSingleRequest).not.toEqual(oldGetRequest);
      expect(variable.SetSingleRequest).not.toEqual(oldSetRequest);

      expect(variable.GetSingleRequest).toBeDefined();
      expect(variable.GetSingleRequest.AreaType).toEqual(variable.AreaType);
      expect(variable.GetSingleRequest.DBNumber).toEqual(variable.DBNumber);
      expect(variable.GetSingleRequest.Offset).toEqual(variable.Offset);
      expect(variable.GetSingleRequest.Length).toEqual(variable.Length);
      expect(variable.GetSingleRequest.Write).toEqual(false);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.GetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);

      expect(variable.SetSingleRequest).toBeDefined();
      expect(variable.SetSingleRequest.AreaType).toEqual(variable.AreaType);
      expect(variable.SetSingleRequest.DBNumber).toEqual(variable.DBNumber);
      expect(variable.SetSingleRequest.Offset).toEqual(variable.Offset);
      expect(variable.SetSingleRequest.Length).toEqual(variable.Length);
      expect(variable.SetSingleRequest.Write).toEqual(true);
      expect(
        Object.values(variable.SetSingleRequest.VariableConnections).length
      ).toEqual(1);

      expect(
        Object.values(variable.SetSingleRequest.VariableConnections)[0].variable
      ).toEqual(variable);
    });

    it("should set new value if it is defined in payload", async () => {
      editPayload = { value: 5 };

      await exec();

      expect(variable.Value).toEqual(editPayload.value);
    });

    it("should set new valueTickId if value is defined", async () => {
      editPayload = { value: 5 };

      await exec();

      expect(variable.ValueTickId).not.toEqual(oldValueTickId);
    });
  });

  describe("ValueType", () => {
    let device;
    let devicePayload;
    let variable;
    let variablePayload;

    beforeEach(async () => {
      devicePayload = {
        id: "1234",
        name: "testDevice",
        type: "s7Device",
        ipAdress: "192.169.9.12",
        isActive: false,
        rack: 9,
        slot: 8,
        timeout: 100,
        variables: [],
        calculationElements: []
      };

      variablePayload = {
        id: "varId1",
        name: "testVar1",
        sampleTime: 1,
        archiveSampleTime: 2,
        archived: false,
        unit: "",
        type: "s7Int32",
        areaType: "DB",
        length: 2,
        write: false,
        dbNumber: 1,
        offset: 1,
        unit: "A"
      };
    });

    let exec = async () => {
      device = new S7Device();
      await device.init(devicePayload);
      variable = new S7Int32Variable(device);
      await variable.init(variablePayload);
      return variable.ValueType;
    };

    it("should return integer", async () => {
      let result = await exec();

      expect(result).toEqual("integer");
    });
  });

  describe("_convertDataToValue", () => {
    let device;
    let devicePayload;
    let variable;
    let variablePayload;
    let data;

    beforeEach(async () => {
      data = [1, 2, 3, 4];
      devicePayload = {
        id: "1234",
        name: "testDevice",
        type: "s7Device",
        ipAdress: "192.169.9.12",
        isActive: false,
        rack: 9,
        slot: 8,
        timeout: 100,
        variables: [],
        calculationElements: []
      };

      variablePayload = {
        id: "varId1",
        name: "testVar1",
        sampleTime: 1,
        archiveSampleTime: 2,
        archived: false,
        type: "s7Int32",
        areaType: "DB",
        length: 2,
        write: false,
        dbNumber: 1,
        offset: 1,
        unit: "A"
      };
    });

    let exec = async () => {
      device = new S7Device();
      await device.init(devicePayload);
      variable = new S7Int32Variable(device);
      await variable.init(variablePayload);

      return variable._convertDataToValue(data);
    };

    it("should return proper value - if value should be greater than 0", async () => {
      let result = await exec();

      expect(result).toEqual(16909060);
    });

    it("should return the same value - if value should be less than 0", async () => {
      data = [255, 2, 3, 4];

      let result = await exec();

      expect(result).toEqual(-16645372);
    });

    it("should empty array if data is empty", async () => {
      data = [];

      let result = await exec();

      expect(result).toEqual(0);
    });
  });

  describe("_convertValueToData", () => {
    let device;
    let devicePayload;
    let variable;
    let variablePayload;
    let value;

    beforeEach(async () => {
      value = 16909060;
      devicePayload = {
        id: "1234",
        name: "testDevice",
        type: "s7Device",
        ipAdress: "192.169.9.12",
        isActive: false,
        rack: 9,
        slot: 8,
        timeout: 100,
        variables: [],
        calculationElements: []
      };

      variablePayload = {
        id: "varId1",
        name: "testVar1",
        sampleTime: 1,
        archiveSampleTime: 2,
        archived: false,
        type: "s7Int32",
        areaType: "DB",
        length: 2,
        write: false,
        dbNumber: 1,
        offset: 1,
        unit: "A"
      };
    });

    let exec = async () => {
      device = new S7Device();
      await device.init(devicePayload);
      variable = new S7Int32Variable(device);
      await variable.init(variablePayload);

      return variable._convertValueToData(value);
    };

    it("should return proper data - if value is greater than 0", async () => {
      let result = await exec();

      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should return proper data - if value is smaller than 0", async () => {
      value = -16645372;

      let result = await exec();

      //-1 is the same as 255
      expect(result).toEqual([255, 2, 3, 4]);
    });

    it("should empty array if value is 0", async () => {
      value = 0;

      let result = await exec();

      expect(result).toEqual([0, 0, 0, 0]);
    });
  });
});
