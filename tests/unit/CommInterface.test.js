const config = require("config");
const fs = require("fs");
const path = require("path");

//Method for deleting file
let clearFile = async file => {
  return new Promise((resolve, reject) => {
    fs.unlink(file, err => {
      if (err) {
        return reject(err);
      }

      return resolve(true);
    });
  });
};

//Method for clearing directory
let clearDirectory = async directory => {
  return new Promise(async (resolve, reject) => {
    fs.readdir(directory, async (err, files) => {
      if (err) {
        return reject(err);
      }

      for (const file of files) {
        try {
          await clearFile(path.join(directory, file));
        } catch (err) {
          return reject(err);
        }
      }

      return resolve(true);
    });
  });
};

let commInterface;

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
        archived: true,
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
        archived: true,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "unit3"
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
        archived: true,
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
        archived: true,
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
        archived: true,
        getSingleFCode: 3,
        setSingleFCode: 16,
        unit: "unit9"
      }
    ],
    type: "mbDevice"
  }
});

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

describe("CommInterface", () => {
  let db1Path;
  let db2Path;

  //Creating seperate commInterface to all tests
  beforeEach(() => {
    commInterface = require("../../classes/commInterface/CommInterface.js");
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
  });

  afterEach(async () => {
    if (commInterface.Initialized) {
      //ending communication with all devices if there are any
      await commInterface.stopCommunicationWithAllDevices();
      commInterface.Sampler.stop();
    }

    jest.resetModules();
    //waiting for all sampling actions to end being invoke;
    await snooze(100);
    await clearDirectory(db1Path);
    await clearDirectory(db2Path);
  });

  describe("constructor", () => {
    it("should set Initialized to false", () => {
      expect(commInterface.Initialized).toBeFalsy();
    });
  });

  describe("init", () => {
    let initPayload;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
    });

    let exec = async () => {
      return commInterface.init(initPayload);
    };

    it("should set Initialized to true", async () => {
      await exec();
      expect(commInterface.Initialized).toBeTruthy();
    });

    it("should create and start sampler", async () => {
      await exec();
      expect(commInterface.Sampler).toBeDefined();
      expect(commInterface.Sampler.Active).toBeTruthy();
    });

    it("should create devices and variables based on given payload", async () => {
      await exec();

      expect(commInterface.Payload).toBeDefined();
      expect(commInterface.Payload).toMatchObject(initPayload);
    });

    it("should create devices and variables based on given payload if there is only one device", async () => {
      let firstDevice = Object.values(initPayload)[0];

      initPayload = {
        [firstDevice.id]: firstDevice
      };

      await exec();

      expect(commInterface.Payload).toBeDefined();
      expect(commInterface.Payload).toMatchObject(initPayload);
    });

    it("should create devices and variables based on given payload if there is empty variables field in devices", async () => {
      let allDevices = Object.values(initPayload);

      for (let device of allDevices) {
        initPayload[device.id].variables = [];
      }

      await exec();

      expect(commInterface.Payload).toBeDefined();
      expect(commInterface.Payload).toMatchObject(initPayload);
    });

    it("should create empty devices object, create and initialize Sampler and set Initialized to true if payload is empty object ", async () => {
      initPayload = {};
      await exec();

      expect(commInterface.Initialized).toBeTruthy();

      expect(commInterface.Sampler).toBeDefined();
      expect(commInterface.Sampler.Active).toBeTruthy();

      expect(commInterface.Devices).toBeDefined();
      expect(commInterface.Devices).toEqual({});
    });

    it("should create empty devices object, create and initialize Sampler and set Initialized to true if payload is undefined ", async () => {
      initPayload = undefined;
      await exec();

      expect(commInterface.Initialized).toBeTruthy();

      expect(commInterface.Sampler).toBeDefined();
      expect(commInterface.Sampler.Active).toBeTruthy();

      expect(commInterface.Devices).toBeDefined();
      expect(commInterface.Devices).toEqual({});
    });

    it("should not invoke again after first invoke", async () => {
      await exec();

      let oldPayload = initPayload;

      //Reinitializing using empty payload - checking whether it would change Devices
      initPayload = {};

      //Trying to initialize second time based on different payload
      exec();

      expect(commInterface.Payload).toMatchObject(oldPayload);
    });

    it("should start all active defices", async () => {
      let allPayloadDevices = Object.values(initPayload);

      for (let device of allPayloadDevices) {
        initPayload[device.id].isActive = true;
      }

      await exec();

      await snooze(1000);

      let allDevices = commInterface.getAllDevices();

      //All devices should be active
      for (let device of allDevices) {
        expect(device.IsActive).toEqual(true);
      }

      //All devices should call connectTCP of their clients
      for (let device of allDevices) {
        //Can be called several times - if device is active and sampler invoke tick before connection was established
        expect(device.MBDriver._client.connectTCP).toHaveBeenCalled();

        //Every call should have been done with propriate parameters
        for (
          let i = 0;
          i < device.MBDriver._client.connectTCP.mock.calls.length;
          i++
        ) {
          expect(device.MBDriver._client.connectTCP.mock.calls[i][0]).toEqual(
            device.IPAdress
          );
          expect(
            device.MBDriver._client.connectTCP.mock.calls[i][1]
          ).toMatchObject({ port: device.PortNumber });
        }
      }
    });
  });

  describe("createNewDevice", () => {
    let id;
    let name;
    let deviceType;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let isActive;
    let variables;
    let payload;

    beforeEach(() => {
      id = "1234";
      name = "test device";
      deviceType = "mbDevice";
      ipAdress = "192.168.0.1";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      isActive = false;
      variables = undefined;
    });

    let exec = async () => {
      await commInterface.init();

      payload = {
        id: id,
        name: name,
        type: deviceType,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId,
        isActive: isActive,
        variables: variables
      };

      return commInterface.createNewDevice(payload);
    };

    it("should create a new device based on given arguments", async () => {
      await exec();

      let allDevices = commInterface.getAllDevices();

      expect(allDevices).toBeDefined();
      expect(allDevices.length).toEqual(1);

      let device = commInterface.getDevice(id);

      expect(device).toBeDefined();
      expect(device.Id).toEqual(id);
      expect(device.Name).toEqual(name);
      expect(device.IPAdress).toEqual(ipAdress);
      expect(device.PortNumber).toEqual(portNumber);
      expect(device.Timeout).toEqual(timeout);
      expect(device.UnitId).toEqual(unitId);
      expect(device.IsActive).toEqual(isActive);
      expect(device.Variables).toMatchObject({});
    });

    it("should return created device", async () => {
      let result = await exec();

      let device = commInterface.getDevice(id);
      expect(result).toEqual(device);
    });

    it("should create a new device based on given arguments and set its id if id was not given in payload", async () => {
      id = undefined;

      await exec();

      let allDevices = commInterface.getAllDevices();

      expect(allDevices).toBeDefined();
      expect(allDevices.length).toEqual(1);

      let device = allDevices[0];

      expect(device.Id).toBeDefined();
    });

    it("should create a new device based on given arguments and starts its communication if isActive is true", async () => {
      isActive = true;

      let result = await exec();

      expect(result.IsActive).toEqual(true);
      expect(result.MBDriver._client.connectTCP).toHaveBeenCalledTimes(1);
      expect(result.MBDriver._client.connectTCP.mock.calls[0][0]).toEqual(
        ipAdress
      );
      expect(result.MBDriver._client.connectTCP.mock.calls[0][1]).toMatchObject(
        { port: portNumber }
      );
    });

    it("should create a new modbus device together with its variables if they are given", async () => {
      let varaible1Payload = {
        id: "1234",
        timeSample: 2,
        name: "test variable 1",
        type: "int16",
        offset: 2,
        fCode: 3,
        value: 1234,
        archived: true
      };
      let varaible2Payload = {
        id: "1235",
        timeSample: 3,
        name: "test variable 2",
        type: "boolean",
        offset: 1,
        fCode: 1,
        value: true,
        archived: false
      };
      let varaible3Payload = {
        id: "1236",
        timeSample: 4,
        name: "test variable 3",
        type: "int32",
        offset: 5,
        fCode: 4,
        value: 4321,
        archived: true
      };

      variables = [varaible1Payload, varaible2Payload, varaible3Payload];

      let device = await exec();

      expect(device.Variables).toBeDefined();
      let allVariables = Object.values(device.Variables);

      expect(allVariables.length).toEqual(3);
      expect(allVariables[0].Id).toEqual(varaible1Payload.id);
      expect(allVariables[0].TimeSample).toEqual(varaible1Payload.timeSample);
      expect(allVariables[0].Name).toEqual(varaible1Payload.name);
      expect(allVariables[0].Type).toEqual(varaible1Payload.type);
      expect(allVariables[0].Offset).toEqual(varaible1Payload.offset);
      expect(allVariables[0].FCode).toEqual(varaible1Payload.fCode);
      expect(allVariables[0].Value).toEqual(varaible1Payload.value);

      expect(allVariables[1].Id).toEqual(varaible2Payload.id);
      expect(allVariables[1].TimeSample).toEqual(varaible2Payload.timeSample);
      expect(allVariables[1].Name).toEqual(varaible2Payload.name);
      expect(allVariables[1].Type).toEqual(varaible2Payload.type);
      expect(allVariables[1].Offset).toEqual(varaible2Payload.offset);
      expect(allVariables[1].FCode).toEqual(varaible2Payload.fCode);
      expect(allVariables[1].Value).toEqual(varaible2Payload.value);

      expect(allVariables[2].Id).toEqual(varaible3Payload.id);
      expect(allVariables[2].TimeSample).toEqual(varaible3Payload.timeSample);
      expect(allVariables[2].Name).toEqual(varaible3Payload.name);
      expect(allVariables[2].Type).toEqual(varaible3Payload.type);
      expect(allVariables[2].Offset).toEqual(varaible3Payload.offset);
      expect(allVariables[2].FCode).toEqual(varaible3Payload.fCode);
      expect(allVariables[2].Value).toEqual(varaible3Payload.value);
    });

    it("should create a new device together with its variables if they are given - and create their ids if not given", async () => {
      let varaible1Payload = {
        timeSample: 2,
        name: "test variable 1",
        type: "int16",
        offset: 2,
        fCode: 3,
        archived: true
      };
      let varaible2Payload = {
        timeSample: 3,
        name: "test variable 2",
        type: "boolean",
        offset: 1,
        fCode: 1,
        archived: false
      };
      let varaible3Payload = {
        timeSample: 4,
        name: "test variable 3",
        type: "int32",
        offset: 5,
        fCode: 4,
        archived: true
      };

      variables = [varaible1Payload, varaible2Payload, varaible3Payload];

      let device = await exec();

      expect(device.Variables).toBeDefined();
      let allVariables = Object.values(device.Variables);

      expect(allVariables.length).toEqual(3);
      expect(allVariables[0].Id).toBeDefined();
      expect(allVariables[0].TimeSample).toEqual(varaible1Payload.timeSample);
      expect(allVariables[0].Name).toEqual(varaible1Payload.name);
      expect(allVariables[0].Type).toEqual(varaible1Payload.type);
      expect(allVariables[0].Offset).toEqual(varaible1Payload.offset);
      expect(allVariables[0].FCode).toEqual(varaible1Payload.fCode);

      expect(allVariables[1].Id).toBeDefined();
      expect(allVariables[1].TimeSample).toEqual(varaible2Payload.timeSample);
      expect(allVariables[1].Name).toEqual(varaible2Payload.name);
      expect(allVariables[1].Type).toEqual(varaible2Payload.type);
      expect(allVariables[1].Offset).toEqual(varaible2Payload.offset);
      expect(allVariables[1].FCode).toEqual(varaible2Payload.fCode);

      expect(allVariables[2].Id).toBeDefined();
      expect(allVariables[2].TimeSample).toEqual(varaible3Payload.timeSample);
      expect(allVariables[2].Name).toEqual(varaible3Payload.name);
      expect(allVariables[2].Type).toEqual(varaible3Payload.type);
      expect(allVariables[2].Offset).toEqual(varaible3Payload.offset);
      expect(allVariables[2].FCode).toEqual(varaible3Payload.fCode);
    });

    it("should create a new device together with its variables if they are given - and set default values if they are not given", async () => {
      let varaible1Payload = {
        timeSample: 2,
        name: "test variable 1",
        type: "int16",
        offset: 2,
        fCode: 3,
        archived: true
      };
      let varaible2Payload = {
        timeSample: 3,
        name: "test variable 2",
        type: "boolean",
        offset: 1,
        fCode: 1,
        archived: false
      };
      let varaible3Payload = {
        timeSample: 4,
        name: "test variable 3",
        type: "int32",
        offset: 5,
        fCode: 4,
        archived: true
      };

      variables = [varaible1Payload, varaible2Payload, varaible3Payload];

      let device = await exec();

      expect(device.Variables).toBeDefined();
      let allVariables = Object.values(device.Variables);

      expect(allVariables.length).toEqual(3);
      expect(allVariables[0].Id).toEqual(varaible1Payload.id);
      expect(allVariables[0].TimeSample).toEqual(varaible1Payload.timeSample);
      expect(allVariables[0].Name).toEqual(varaible1Payload.name);
      expect(allVariables[0].Type).toEqual(varaible1Payload.type);
      expect(allVariables[0].Offset).toEqual(varaible1Payload.offset);
      expect(allVariables[0].FCode).toEqual(varaible1Payload.fCode);
      expect(allVariables[0].Value).toEqual(0);

      expect(allVariables[1].Id).toEqual(varaible2Payload.id);
      expect(allVariables[1].TimeSample).toEqual(varaible2Payload.timeSample);
      expect(allVariables[1].Name).toEqual(varaible2Payload.name);
      expect(allVariables[1].Type).toEqual(varaible2Payload.type);
      expect(allVariables[1].Offset).toEqual(varaible2Payload.offset);
      expect(allVariables[1].FCode).toEqual(varaible2Payload.fCode);
      expect(allVariables[1].Value).toEqual(false);

      expect(allVariables[2].Id).toEqual(varaible3Payload.id);
      expect(allVariables[2].TimeSample).toEqual(varaible3Payload.timeSample);
      expect(allVariables[2].Name).toEqual(varaible3Payload.name);
      expect(allVariables[2].Type).toEqual(varaible3Payload.type);
      expect(allVariables[2].Offset).toEqual(varaible3Payload.offset);
      expect(allVariables[2].FCode).toEqual(varaible3Payload.fCode);
      expect(allVariables[2].Value).toEqual(0);
    });

    it("should add device to sampler", async () => {
      let result = await exec();

      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(1);
      expect(commInterface.Sampler.AllDevices[result.Id]).toBeDefined();
      expect(commInterface.Sampler.AllDevices[result.Id]).toEqual(result);
    });

    it("should throw and do not add device to Devices or Sampler if device type is not recognized", async () => {
      deviceType = "not recongized type";

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

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice name is empty", async () => {
      name = undefined;

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

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice type is empty", async () => {
      deviceType = undefined;

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

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice ipAdress is empty", async () => {
      ipAdress = undefined;

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

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice portNumber is empty", async () => {
      portNumber = undefined;

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

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice timeout is empty", async () => {
      timeout = undefined;

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

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice unitId is empty", async () => {
      unitId = undefined;

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

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should not throw, but set isActive to false if MBdevice isActive is empty", async () => {
      isActive = undefined;

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

      expect(Object.values(commInterface.Devices).length).toEqual(1);

      let device = Object.values(commInterface.Devices)[0];

      expect(device.IsActive).toBeFalsy();
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice varaible payload is invalid", async () => {
      let varaible1Payload = {
        id: "1234",
        timeSample: 2,
        name: "int16",
        type: "not recongized type",
        offset: 2,
        fCode: 3
      };
      let varaible2Payload = {
        id: "1235",
        timeSample: 3,
        name: "test variable 2",
        type: "NOT RECONGIZED TYPE",
        offset: 1,
        fCode: 1
      };
      let varaible3Payload = {
        id: "1236",
        timeSample: 4,
        name: "test variable 3",
        type: "int32",
        offset: 5,
        fCode: 4
      };

      variables = [varaible1Payload, varaible2Payload, varaible3Payload];

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

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if payload is empty", async () => {
      commInterface.init();

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await commInterface.createNewDevice({});
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add new device if device of such id already exists", async () => {
      await exec();

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

      expect(Object.values(commInterface.Devices).length).toEqual(1);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(1);
    });
  });

  describe("getMainData", () => {
    let device1Id;
    let device1Name;
    let deviceType;
    let device1Adress;
    let device1PortNumber;
    let device1Timeout;
    let device1UnitId;
    let device1IsActive;
    let device1Payload;

    let device2Id;
    let device2Name;
    let device2ype;
    let device2Adress;
    let device2PortNumber;
    let device2Timeout;
    let device2UnitId;
    let device2IsActive;
    let device2Payload;

    let device1Variables;
    let device2Variables;

    let variable1Payload;
    let variable1Id;
    let variable1TimeSample;
    let variable1Name;
    let variable1Type;
    let variable1Offset;
    let variable1FCode;
    let variable1Value;

    let variable2Payload;
    let variable2Id;
    let variable2TimeSample;
    let variable2Name;
    let variable2Type;
    let variable2Offset;
    let variable2FCode;
    let variable2Value;

    let variable3Payload;
    let variable3Id;
    let variable3TimeSample;
    let variable3Name;
    let variable3Type;
    let variable3Offset;
    let variable3FCode;
    let variable3Value;

    let variable4Payload;
    let variable4Id;
    let variable4TimeSample;
    let variable4Name;
    let variable4Type;
    let variable4Offset;
    let variable4FCode;
    let variable4Value;

    let variable5Payload;
    let variable5Id;
    let variable5TimeSample;
    let variable5Name;
    let variable5Type;
    let variable5Offset;
    let variable5FCode;
    let variable5Value;

    let variable6Payload;
    let variable6Id;
    let variable6TimeSample;
    let variable6Name;
    let variable6Type;
    let variable6Offset;
    let variable6FCode;
    let variable6Value;

    beforeEach(async () => {
      device1Id = "1234";
      device1Name = "test device 1";
      deviceType = "mbDevice";
      device1Adress = "192.168.0.1";
      device1PortNumber = 502;
      device1Timeout = 2000;
      device1UnitId = 1;
      device1IsActive = false;

      device2Id = "1235";
      device2Name = "test device 2";
      device2ype = "mbDevice";
      device2Adress = "192.168.0.2";
      device2PortNumber = 502;
      device2Timeout = 2000;
      device2UnitId = 1;
      device2sActive = false;

      variable1Id = "0001";
      variable1TimeSample = 2;
      variable1Name = "test variable 1";
      variable1Type = "int16";
      variable1Offset = 5;
      variable1FCode = 3;
      variable1Value = 1;

      variable2Id = "0002";
      variable2TimeSample = 3;
      variable2Name = "test variable 2";
      variable2Type = "int32";
      variable2Offset = 6;
      variable2FCode = 4;
      variable2Value = 2;

      variable3Id = "0003";
      variable3TimeSample = 4;
      variable3Name = "test variable 3";
      variable3Type = "float";
      variable3Offset = 7;
      variable3FCode = 16;
      variable3Value = 3;

      variable4Id = "0004";
      variable4TimeSample = 2;
      variable4Name = "test variable 4";
      variable4Type = "boolean";
      variable4Offset = 5;
      variable4FCode = 1;
      variable4Value = true;

      variable5Id = "0005";
      variable5TimeSample = 3;
      variable5Name = "test variable 5";
      variable5Type = "int32";
      variable5Offset = 6;
      variable5FCode = 4;
      variable5Value = 5;

      variable6Id = "0006";
      variable6TimeSample = 4;
      variable6Name = "test variable 6";
      variable6Type = "float";
      variable6Offset = 7;
      variable6FCode = 16;
      variable6Value = 6;
    });

    let exec = async () => {
      await commInterface.init();

      variable1Payload = {
        id: variable1Id,
        timeSample: variable1TimeSample,
        name: variable1Name,
        type: variable1Type,
        offset: variable1Offset,
        fCode: variable1FCode,
        value: variable1Value
      };

      variable2Payload = {
        id: variable2Id,
        timeSample: variable2TimeSample,
        name: variable2Name,
        type: variable2Type,
        offset: variable2Offset,
        fCode: variable2FCode,
        value: variable2Value
      };

      variable3Payload = {
        id: variable3Id,
        timeSample: variable3TimeSample,
        name: variable3Name,
        type: variable3Type,
        offset: variable3Offset,
        fCode: variable3FCode,
        value: variable3Value
      };

      variable4Payload = {
        id: variable4Id,
        timeSample: variable4TimeSample,
        name: variable4Name,
        type: variable4Type,
        offset: variable4Offset,
        fCode: variable4FCode,
        value: variable4Value
      };

      variable5Payload = {
        id: variable5Id,
        timeSample: variable5TimeSample,
        name: variable5Name,
        type: variable5Type,
        offset: variable5Offset,
        fCode: variable5FCode,
        value: variable5Value
      };

      variable6Payload = {
        id: variable6Id,
        timeSample: variable6TimeSample,
        name: variable6Name,
        type: variable6Type,
        offset: variable6Offset,
        fCode: variable6FCode,
        value: variable6Value
      };

      device1Variables = [variable1Payload, variable2Payload, variable3Payload];

      device2Variables = [variable4Payload, variable5Payload, variable6Payload];

      device1Payload = {
        id: device1Id,
        name: device1Name,
        type: deviceType,
        ipAdress: device1Adress,
        portNumber: device1PortNumber,
        timeout: device1Timeout,
        unitId: device1UnitId,
        isActive: device1IsActive,
        variables: device1Variables
      };

      device2Payload = {
        id: device2Id,
        name: device2Name,
        type: deviceType,
        ipAdress: device2Adress,
        portNumber: device2PortNumber,
        timeout: device2Timeout,
        unitId: device2UnitId,
        isActive: device2IsActive,
        variables: device2Variables
      };

      await commInterface.createNewDevice(device1Payload);
      await commInterface.createNewDevice(device2Payload);

      return commInterface.getMainData();
    };

    it("should return all devicesIds, deviceNames, variableIds and their values and names", async () => {
      let result = await exec();

      let validResult = {
        "1234": {
          name: "test device 1",
          variables: {
            "0001": {
              name: "test variable 1",
              value: 1
            },

            "0002": {
              name: "test variable 2",
              value: 2
            },

            "0003": {
              name: "test variable 3",
              value: 3
            }
          }
        },
        "1235": {
          name: "test device 2",
          variables: {
            "0004": {
              name: "test variable 4",
              value: true
            },

            "0005": {
              name: "test variable 5",
              value: 5
            },

            "0006": {
              name: "test variable 6",
              value: 6
            }
          }
        }
      };
      expect(result).toBeDefined();
      expect(result).toMatchObject(validResult);
    });

    it("should return empty object if there are no devices in commInterface", async () => {
      await commInterface.init();

      let result = commInterface.getMainData();

      expect(result).toEqual({});
    });

    it("should return valid object if one of device does not have any variables", async () => {
      await commInterface.init();

      variable4Payload = {
        id: variable4Id,
        timeSample: variable4TimeSample,
        name: variable4Name,
        type: variable4Type,
        offset: variable4Offset,
        fCode: variable4FCode,
        value: variable4Value
      };

      variable5Payload = {
        id: variable5Id,
        timeSample: variable5TimeSample,
        name: variable5Name,
        type: variable5Type,
        offset: variable5Offset,
        fCode: variable5FCode,
        value: variable5Value
      };

      variable6Payload = {
        id: variable6Id,
        timeSample: variable6TimeSample,
        name: variable6Name,
        type: variable6Type,
        offset: variable6Offset,
        fCode: variable6FCode,
        value: variable6Value
      };

      device1Variables = undefined;

      device2Variables = [variable4Payload, variable5Payload, variable6Payload];

      device1Payload = {
        id: device1Id,
        name: device1Name,
        type: deviceType,
        ipAdress: device1Adress,
        portNumber: device1PortNumber,
        timeout: device1Timeout,
        unitId: device1UnitId,
        isActive: device1IsActive,
        variables: device1Variables
      };

      device2Payload = {
        id: device2Id,
        name: device2Name,
        type: deviceType,
        ipAdress: device2Adress,
        portNumber: device2PortNumber,
        timeout: device2Timeout,
        unitId: device2UnitId,
        isActive: device2IsActive,
        variables: device2Variables
      };

      await commInterface.createNewDevice(device1Payload);
      await commInterface.createNewDevice(device2Payload);

      let result = commInterface.getMainData();

      let validResult = {
        "1234": {
          name: "test device 1",
          variables: {}
        },
        "1235": {
          name: "test device 2",
          variables: {
            "0004": {
              name: "test variable 4",
              value: true
            },

            "0005": {
              name: "test variable 5",
              value: 5
            },

            "0006": {
              name: "test variable 6",
              value: 6
            }
          }
        }
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validResult);
    });
  });

  describe("getAllValues", () => {
    let device1Id;
    let device1Name;
    let deviceType;
    let device1Adress;
    let device1PortNumber;
    let device1Timeout;
    let device1UnitId;
    let device1IsActive;
    let device1Payload;

    let device2Id;
    let device2Name;
    let device2Type;
    let device2Adress;
    let device2PortNumber;
    let device2Timeout;
    let device2UnitId;
    let device2IsActive;
    let device2Payload;

    let device1Variables;
    let device2Variables;

    let variable1Payload;
    let variable1Id;
    let variable1TimeSample;
    let variable1Name;
    let variable1Type;
    let variable1Offset;
    let variable1FCode;
    let variable1Value;

    let variable2Payload;
    let variable2Id;
    let variable2TimeSample;
    let variable2Name;
    let variable2Type;
    let variable2Offset;
    let variable2FCode;
    let variable2Value;

    let variable3Payload;
    let variable3Id;
    let variable3TimeSample;
    let variable3Name;
    let variable3Type;
    let variable3Offset;
    let variable3FCode;
    let variable3Value;

    let variable4Payload;
    let variable4Id;
    let variable4TimeSample;
    let variable4Name;
    let variable4Type;
    let variable4Offset;
    let variable4FCode;
    let variable4Value;

    let variable5Payload;
    let variable5Id;
    let variable5TimeSample;
    let variable5Name;
    let variable5Type;
    let variable5Offset;
    let variable5FCode;
    let variable5Value;

    let variable6Payload;
    let variable6Id;
    let variable6TimeSample;
    let variable6Name;
    let variable6Type;
    let variable6Offset;
    let variable6FCode;
    let variable6Value;

    beforeEach(async () => {
      device1Id = "1234";
      device1Name = "test device 1";
      deviceType = "mbDevice";
      device1Adress = "192.168.0.1";
      device1PortNumber = 502;
      device1Timeout = 2000;
      device1UnitId = 1;
      device1IsActive = false;

      device2Id = "1235";
      device2Name = "test device 2";
      device2Type = "mbDevice";
      device2Adress = "192.168.0.2";
      device2PortNumber = 502;
      device2Timeout = 2000;
      device2UnitId = 1;
      device2sActive = false;

      variable1Id = "0001";
      variable1TimeSample = 2;
      variable1Name = "test variable 1";
      variable1Type = "int16";
      variable1Offset = 5;
      variable1FCode = 3;
      variable1Value = 1;

      variable2Id = "0002";
      variable2TimeSample = 3;
      variable2Name = "test variable 2";
      variable2Type = "int32";
      variable2Offset = 6;
      variable2FCode = 4;
      variable2Value = 2;

      variable3Id = "0003";
      variable3TimeSample = 4;
      variable3Name = "test variable 3";
      variable3Type = "float";
      variable3Offset = 7;
      variable3FCode = 16;
      variable3Value = 3;

      variable4Id = "0004";
      variable4TimeSample = 2;
      variable4Name = "test variable 4";
      variable4Type = "boolean";
      variable4Offset = 5;
      variable4FCode = 1;
      variable4Value = true;

      variable5Id = "0005";
      variable5TimeSample = 3;
      variable5Name = "test variable 5";
      variable5Type = "int32";
      variable5Offset = 6;
      variable5FCode = 4;
      variable5Value = 5;

      variable6Id = "0006";
      variable6TimeSample = 4;
      variable6Name = "test variable 6";
      variable6Type = "float";
      variable6Offset = 7;
      variable6FCode = 16;
      variable6Value = 6;
    });

    let exec = async () => {
      await commInterface.init();

      variable1Payload = {
        id: variable1Id,
        timeSample: variable1TimeSample,
        name: variable1Name,
        type: variable1Type,
        offset: variable1Offset,
        fCode: variable1FCode,
        value: variable1Value
      };

      variable2Payload = {
        id: variable2Id,
        timeSample: variable2TimeSample,
        name: variable2Name,
        type: variable2Type,
        offset: variable2Offset,
        fCode: variable2FCode,
        value: variable2Value
      };

      variable3Payload = {
        id: variable3Id,
        timeSample: variable3TimeSample,
        name: variable3Name,
        type: variable3Type,
        offset: variable3Offset,
        fCode: variable3FCode,
        value: variable3Value
      };

      variable4Payload = {
        id: variable4Id,
        timeSample: variable4TimeSample,
        name: variable4Name,
        type: variable4Type,
        offset: variable4Offset,
        fCode: variable4FCode,
        value: variable4Value
      };

      variable5Payload = {
        id: variable5Id,
        timeSample: variable5TimeSample,
        name: variable5Name,
        type: variable5Type,
        offset: variable5Offset,
        fCode: variable5FCode,
        value: variable5Value
      };

      variable6Payload = {
        id: variable6Id,
        timeSample: variable6TimeSample,
        name: variable6Name,
        type: variable6Type,
        offset: variable6Offset,
        fCode: variable6FCode,
        value: variable6Value
      };

      device1Variables = [variable1Payload, variable2Payload, variable3Payload];

      device2Variables = [variable4Payload, variable5Payload, variable6Payload];

      device1Payload = {
        id: device1Id,
        name: device1Name,
        type: deviceType,
        ipAdress: device1Adress,
        portNumber: device1PortNumber,
        timeout: device1Timeout,
        unitId: device1UnitId,
        isActive: device1IsActive,
        variables: device1Variables
      };

      device2Payload = {
        id: device2Id,
        name: device2Name,
        type: device2Type,
        ipAdress: device2Adress,
        portNumber: device2PortNumber,
        timeout: device2Timeout,
        unitId: device2UnitId,
        isActive: device2IsActive,
        variables: device2Variables
      };

      await commInterface.createNewDevice(device1Payload);
      await commInterface.createNewDevice(device2Payload);

      return commInterface.getAllValues();
    };

    it("should return all devicesIds, variableIds and their values", async () => {
      let result = await exec();

      let validResult = {
        "1234": {
          "0001": 1,

          "0002": 2,

          "0003": 3
        },
        "1235": {
          "0004": true,
          "0005": 5,
          "0006": 6
        }
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validResult);
    });

    it("should return empty object if there are no devices in commInterface", async () => {
      await commInterface.init();

      let result = commInterface.getMainData();

      expect(result).toEqual({});
    });

    it("should return valid object if one of device does not have any variables", async () => {
      await commInterface.init();

      variable4Payload = {
        id: variable4Id,
        timeSample: variable4TimeSample,
        name: variable4Name,
        type: variable4Type,
        offset: variable4Offset,
        fCode: variable4FCode,
        value: variable4Value
      };

      variable5Payload = {
        id: variable5Id,
        timeSample: variable5TimeSample,
        name: variable5Name,
        type: variable5Type,
        offset: variable5Offset,
        fCode: variable5FCode,
        value: variable5Value
      };

      variable6Payload = {
        id: variable6Id,
        timeSample: variable6TimeSample,
        name: variable6Name,
        type: variable6Type,
        offset: variable6Offset,
        fCode: variable6FCode,
        value: variable6Value
      };

      device1Variables = undefined;

      device2Variables = [variable4Payload, variable5Payload, variable6Payload];

      device1Payload = {
        id: device1Id,
        name: device1Name,
        type: deviceType,
        ipAdress: device1Adress,
        portNumber: device1PortNumber,
        timeout: device1Timeout,
        unitId: device1UnitId,
        isActive: device1IsActive,
        variables: device1Variables
      };

      device2Payload = {
        id: device2Id,
        name: device2Name,
        type: deviceType,
        ipAdress: device2Adress,
        portNumber: device2PortNumber,
        timeout: device2Timeout,
        unitId: device2UnitId,
        isActive: device2IsActive,
        variables: device2Variables
      };

      await commInterface.createNewDevice(device1Payload);
      await commInterface.createNewDevice(device2Payload);

      let result = commInterface.getAllValues();

      let validResult = {
        "1234": {},
        "1235": {
          "0004": true,
          "0005": 5,
          "0006": 6
        }
      };
      expect(result).toBeDefined();
      expect(result).toMatchObject(validResult);
    });
  });

  describe("getAllVariables", () => {
    let deviceId;
    let initPayload;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1234";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.getAllVariables(deviceId);
    };

    it("should return all variables of device of given id", async () => {
      let result = await exec();

      let variable1 = commInterface.getVariable("1234", "0001");
      let variable2 = commInterface.getVariable("1234", "0002");
      let variable3 = commInterface.getVariable("1234", "0003");

      expect(result.length).toEqual(3);
      expect(result).toContain(variable1);
      expect(result).toContain(variable2);
      expect(result).toContain(variable3);
    });

    it("should throw if there is no device of given id", async () => {
      deviceId = "4321";

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

    it("should return empty array if device has no variables", async () => {
      initPayload[deviceId].variables = undefined;

      let result = await exec();

      expect(result).toEqual([]);
    });
  });

  describe("getAllDevices", () => {
    let initPayload;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.getAllDevices();
    };

    it("should return all devices", async () => {
      let result = await exec();

      let device1 = commInterface.getDevice("1234");
      let device2 = commInterface.getDevice("1235");
      let device3 = commInterface.getDevice("1236");

      expect(result.length).toEqual(3);
      expect(result).toContain(device1);
      expect(result).toContain(device2);
      expect(result).toContain(device3);
    });

    it("should return empty array if there are no devices", async () => {
      initPayload = {};

      let result = await exec();

      expect(result).toEqual([]);
    });
  });

  describe("getAllVariableIds", () => {
    let initPayload;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.getAllVariableIds();
    };

    it("should return all variables ids", async () => {
      let result = await exec();

      expect(result.length).toEqual(9);
      expect(result).toContain("0001");
      expect(result).toContain("0002");
      expect(result).toContain("0003");
      expect(result).toContain("0004");
      expect(result).toContain("0005");
      expect(result).toContain("0006");
      expect(result).toContain("0007");
      expect(result).toContain("0008");
      expect(result).toContain("0009");
    });

    it("should return empty array if there is no variable", async () => {
      initPayload["1234"].variables = undefined;
      initPayload["1235"].variables = undefined;
      initPayload["1236"].variables = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });

  describe("_doesVariableExistis", () => {
    let initPayload;
    let variableId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      variableId = "0005";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface._doesVariableExistis(variableId);
    };

    it("should return true if variable already exists in commInterface", async () => {
      let result = await exec();

      expect(result).toBeTruthy();
    });

    it("should return false if variable does not exists in commInterface", async () => {
      variableId = "8765";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if variable does not exists in commInterface end there are no variables added", async () => {
      initPayload["1234"].variables = undefined;
      initPayload["1235"].variables = undefined;
      initPayload["1236"].variables = undefined;

      let result = await exec();

      expect(result).toBeFalsy();
    });
  });

  describe("startCommunication", () => {
    let initPayload;
    let deviceId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.startCommunication(deviceId);
    };

    it("should set only device with given id to active", async () => {
      await exec();

      expect(commInterface.getDevice(deviceId).IsActive).toEqual(true);
      expect(commInterface.getDevice("1234").IsActive).toEqual(false);
      expect(commInterface.getDevice("1236").IsActive).toEqual(false);
    });

    it("should start communication only with given device", async () => {
      await exec();

      //Can be called several times - if device is active and sampler invoke tick before connection was established
      expect(
        commInterface.getDevice(deviceId).MBDriver._client.connectTCP
      ).toHaveBeenCalled();

      for (
        let i = 0;
        i <
        commInterface.getDevice(deviceId).MBDriver._client.connectTCP.mock.calls
          .length;
        i++
      ) {
        expect(
          commInterface.getDevice(deviceId).MBDriver._client.connectTCP.mock
            .calls[i][0]
        ).toEqual("192.168.0.2");
        expect(
          commInterface.getDevice(deviceId).MBDriver._client.connectTCP.mock
            .calls[i][1]
        ).toMatchObject({ port: 502 });
      }

      expect(
        commInterface.getDevice("1234").MBDriver._client.connectTCP
      ).not.toHaveBeenCalled();

      expect(
        commInterface.getDevice("1236").MBDriver._client.connectTCP
      ).not.toHaveBeenCalled();
    });

    it("should throw if there is no device of given id", async () => {
      deviceId = "4321";

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
  });

  describe("stopCommunication", () => {
    let initPayload;
    let deviceId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      await commInterface.startCommunicationWithAllDevices();

      return commInterface.stopCommunication(deviceId);
    };

    it("should set only device with given id to inactive", async () => {
      await exec();

      expect(commInterface.getDevice(deviceId).IsActive).toEqual(false);
      expect(commInterface.getDevice("1234").IsActive).toEqual(true);
      expect(commInterface.getDevice("1236").IsActive).toEqual(true);
    });

    it("should stop communication with given device", async () => {
      await exec();

      expect(
        commInterface.getDevice(deviceId).MBDriver._client.close
      ).toHaveBeenCalledTimes(1);
    });

    it("should throw if there is no device of given id", async () => {
      deviceId = "4321";

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
  });

  describe("startCommunicationWithAllDevices", () => {
    let initPayload;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.startCommunicationWithAllDevices();
    };

    it("should set every device to active", async () => {
      await exec();

      let allDevices = commInterface.getAllDevices();

      for (let device of allDevices) {
        expect(device.IsActive).toEqual(true);
      }
    });

    it("should start communication with all devices", async () => {
      await exec();

      let allDevices = commInterface.getAllDevices();

      for (let device of allDevices) {
        //Can be called several times - if device is active and sampler invoke tick before connection was established
        expect(device.MBDriver._client.connectTCP).toHaveBeenCalled();

        //Every call should have been done with propriate parameters
        for (
          let i = 0;
          i < device.MBDriver._client.connectTCP.mock.calls.length;
          i++
        ) {
          expect(device.MBDriver._client.connectTCP.mock.calls[i][0]).toEqual(
            device.IPAdress
          );
          expect(
            device.MBDriver._client.connectTCP.mock.calls[i][1]
          ).toMatchObject({ port: device.PortNumber });
        }
      }
    });

    it("should not throw if there are no devices added", async () => {
      initPayload = {};

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

    it("should not throw if it is called more than once", async () => {
      await exec();

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
  });

  describe("stopCommunicationWithAllDevices", () => {
    let initPayload;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      await commInterface.startCommunicationWithAllDevices();

      return commInterface.stopCommunicationWithAllDevices();
    };

    it("should set all devices to inactive", async () => {
      await exec();

      let allDevices = commInterface.getAllDevices();

      for (let device of allDevices) {
        expect(device.IsActive).toEqual(false);
      }
    });

    it("should stop communication with all devices", async () => {
      await exec();

      let allDevices = commInterface.getAllDevices();

      for (let device of allDevices) {
        expect(device.MBDriver._client.close).toHaveBeenCalledTimes(1);
      }
    });

    it("should not throw if there are no devices added", async () => {
      initPayload = {};

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

    it("should not throw if it is called more than once", async () => {
      await exec();

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
  });

  describe("getDevice", () => {
    let initPayload;
    let deviceId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.getDevice(deviceId);
    };

    it("should return device of given id", async () => {
      let result = await exec();

      let device1 = commInterface.Devices[deviceId];

      expect(result).toBeDefined();
      expect(result).toEqual(device1);
    });

    it("should throw if there is no device of given id", async () => {
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

  describe("removeDevice", () => {
    let initPayload;
    let deviceId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.removeDevice(deviceId);
    };

    it("should remove device from commInterface", async () => {
      let result = await exec();

      let allDeviceIds = Object.keys(commInterface.Devices);

      expect(allDeviceIds.length).toEqual(Object.keys(initPayload).length - 1);
      expect(allDeviceIds).not.toContain(deviceId);
    });

    it("should reject if there is no device of given id", async () => {
      deviceId = "8765";

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
          } catch (err) {
            reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should disconnect and remove device if it is active", async () => {
      initPayload[deviceId].isActive = true;

      await snooze(100);

      let result = await exec();

      let allDeviceIds = Object.keys(commInterface.Devices);

      expect(allDeviceIds.length).toEqual(Object.keys(initPayload).length - 1);
      expect(allDeviceIds).not.toContain(deviceId);

      expect(result.MBDriver._client.close).toHaveBeenCalled();
    });

    it("should not call disconnect if removed device is not active", async () => {
      initPayload[deviceId].isActive = false;

      await snooze(100);

      let result = await exec();

      let allDeviceIds = Object.keys(commInterface.Devices);

      expect(allDeviceIds.length).toEqual(Object.keys(initPayload).length - 1);
      expect(allDeviceIds).not.toContain(deviceId);

      expect(result.MBDriver._client.close).not.toHaveBeenCalled();
    });

    it("should not call disconnect if removed device is not active", async () => {
      initPayload[deviceId].isActive = false;

      await snooze(100);

      let result = await exec();

      let allDeviceIds = Object.keys(commInterface.Devices);

      expect(allDeviceIds.length).toEqual(Object.keys(initPayload).length - 1);
      expect(allDeviceIds).not.toContain(deviceId);

      expect(result.MBDriver._client.close).not.toHaveBeenCalled();
    });

    it("should remove device from samplers collection", async () => {
      let result = await exec();

      expect(commInterface.Sampler.AllDevices[deviceId]).not.toBeDefined();
    });
  });

  describe("editDevice", () => {
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
    let initDriver;
    let initVariables;

    beforeEach(() => {
      editId = undefined;
      editName = "Modified device";
      editIsActive = false;
      editTimeout = 4000;
      editIpAdress = "192.168.0.17";
      editUnitId = 5;
      editPortNumber = 602;
      editVariables = undefined;

      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
    });

    let exec = async () => {
      editPayload = {
        id: editId,
        name: editName,
        isActive: editIsActive,
        timeout: editTimeout,
        ipAdress: editIpAdress,
        unitId: editUnitId,
        portNumber: editPortNumber,
        variables: editVariables
      };
      await commInterface.init(initPayload);
      initDriver = commInterface.getDevice(deviceId).MBDriver;
      initVariables = Object.values(
        commInterface.getDevice(deviceId).Variables
      );
      return commInterface.editDevice(deviceId, editPayload);
    };

    it("should edit device of given id according to given payload", async () => {
      let result = await exec();

      let editedDevice = commInterface.getDevice(deviceId);
      expect(editedDevice.Name).toEqual(editName);
      expect(editedDevice.IsActive).toEqual(editIsActive);
      expect(editedDevice.Timeout).toEqual(editTimeout);
      expect(editedDevice.IPAdress).toEqual(editIpAdress);
      expect(editedDevice.UnitId).toEqual(editUnitId);
      expect(editedDevice.PortNumber).toEqual(editPortNumber);
    });

    it("should return edited device", async () => {
      let result = await exec();

      let editedDevice = commInterface.getDevice(deviceId);

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

      let editedDevice = commInterface.getDevice(deviceId);

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

      let editedDevice = commInterface.getDevice(deviceId);

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

      let editedDevice = commInterface.getDevice(deviceId);

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

      let editedDevice = commInterface.getDevice(deviceId);

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

      let editedDevice = commInterface.getDevice(deviceId);

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

      let editedDevice = commInterface.getDevice(deviceId);

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

      let editedDevice = commInterface.getDevice(deviceId);

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

      let editedDevice = commInterface.getDevice(deviceId);

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

      let editedDevice = commInterface.getDevice(deviceId);

      expect(editedDevice.IsActive).toBeTruthy();

      //Shouldn't be called more than once
      expect(editedDevice.MBDriver._client.connectTCP).toHaveBeenCalledTimes(1);
    });

    it("should restart communication when isActive is set to true and previosly was true but change was associated with driver ", async () => {
      initPayload[deviceId].isActive = true;
      editIsActive = true;

      let result = await exec();

      await snooze(100);

      let editedDevice = commInterface.getDevice(deviceId);

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

    it("should recreate all variables when recreating driver", async () => {
      initPayload[deviceId].isActive = true;
      editIsActive = true;

      let result = await exec();

      let editedDevice = commInterface.getDevice(deviceId);
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

        expect(initVariables).not.toContain(variable);
      }

      //Variables payload should be equal

      let oldVariablesPayload = initVariables.map(variable => variable.Payload);
      let newVariablesPayload = newVariables.map(variable => variable.Payload);

      expect(newVariablesPayload).toBeDefined();
      expect(newVariablesPayload).toMatchObject(oldVariablesPayload);
    });

    it("should throw if there is no device of given id", () => {
      deviceId = "8765";

      expect(
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

  describe("createDevice", () => {
    let initPayload;
    let deviceId;
    let createPayload;
    let createId;
    let createName;
    let createIsActive;
    let createTimeout;
    let createIpAdress;
    let createUnitId;
    let createPortNumber;
    let createVariables;

    beforeEach(() => {
      createId = undefined;
      createName = "Created device";
      createIsActive = false;
      createTimeout = 4000;
      createIpAdress = "192.168.0.17";
      createUnitId = 5;
      createPortNumber = 602;
      createVariables = undefined;
      createType = "mbDevice";

      initPayload = JSON.parse(testPayload);
      deviceId = "1235";

      createVariables = [
        {
          id: "1001",
          timeSample: 2,
          name: "test variable 11",
          offset: 5,
          length: 1,
          fCode: 3,
          value: 1,
          type: "int16",
          archived: true,
          getSingleFCode: 3,
          setSingleFCode: 16
        },
        {
          id: "1002",
          timeSample: 3,
          name: "test variable 12",
          offset: 6,
          length: 2,
          fCode: 4,
          value: 2,
          type: "int32",
          archived: true,
          getSingleFCode: 4,
          setSingleFCode: 16
        },
        {
          id: "1003",
          timeSample: 4,
          name: "test variable 13",
          offset: 7,
          length: 2,
          fCode: 16,
          value: 3.3,
          type: "float",
          archived: true,
          getSingleFCode: 3,
          setSingleFCode: 16
        }
      ];
    });

    let exec = async () => {
      createPayload = {
        id: createId,
        name: createName,
        isActive: createIsActive,
        timeout: createTimeout,
        ipAdress: createIpAdress,
        unitId: createUnitId,
        portNumber: createPortNumber,
        variables: createVariables,
        type: createType
      };

      await commInterface.init(initPayload);

      return commInterface.createNewDevice(createPayload);
    };

    it("should return created device", async () => {
      let result = await exec();

      let allDevices = commInterface.getAllDevices();

      let createDevice = allDevices[allDevices.length - 1];

      expect(result).toBeDefined();
      expect(result).toEqual(createDevice);
    });

    it("should create new device based on given payload", async () => {
      let result = await exec();

      expect(result.Name).toEqual(createName);
      expect(result.IsActive).toEqual(createIsActive);
      expect(result.Timeout).toEqual(createTimeout);
      expect(result.IPAdress).toEqual(createIpAdress);
      expect(result.UnitId).toEqual(createUnitId);
      expect(result.PortNumber).toEqual(createPortNumber);
      expect(result.Type).toEqual(createType);

      let allVariables = Object.values(result.Variables);

      expect(allVariables).toBeDefined();
      expect(allVariables.length).toBeDefined();
      expect(allVariables.length).toEqual(createVariables.length);

      for (let i = 0; i < allVariables.length; i++) {
        expect(allVariables[i].Payload).toMatchObject(createVariables[i]);
      }

      //Should create device with new id
      expect(result.Id).toBeDefined();
    });

    it("should create new device based on given payload when variables are empty", async () => {
      createVariables = undefined;

      let result = await exec();

      expect(result.Name).toEqual(createName);
      expect(result.IsActive).toEqual(createIsActive);
      expect(result.Timeout).toEqual(createTimeout);
      expect(result.IPAdress).toEqual(createIpAdress);
      expect(result.UnitId).toEqual(createUnitId);
      expect(result.PortNumber).toEqual(createPortNumber);
      expect(result.Type).toEqual(createType);

      expect(result.Variables).toBeDefined();
      expect(result.Variables).toEqual({});
    });

    it("should create device with given id if id is defined", async () => {
      createId = "8765";

      let result = await exec();

      expect(result.Name).toEqual(createName);
      expect(result.IsActive).toEqual(createIsActive);
      expect(result.Timeout).toEqual(createTimeout);
      expect(result.IPAdress).toEqual(createIpAdress);
      expect(result.UnitId).toEqual(createUnitId);
      expect(result.PortNumber).toEqual(createPortNumber);
      expect(result.Type).toEqual(createType);

      //Should create device with new id
      expect(result.Id).toBeDefined();
      expect(result.Id).toEqual(createId);
    });

    it("should throw and not add any device if device of given id already exists", async () => {
      createId = "1234";

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

      expect(commInterface.getAllDevices().length).toEqual(
        Object.keys(initPayload).length
      );
    });

    it("should throw and not add any device if name in payload does not exists", async () => {
      createName = undefined;

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

      expect(commInterface.getAllDevices().length).toEqual(
        Object.keys(initPayload).length
      );
    });

    it("should not throw but add new device with isActive set to false if isActive in payload does not exists", async () => {
      createIsActive = undefined;

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

      let allDevices = commInterface.getAllDevices();

      expect(allDevices.length).toEqual(Object.keys(initPayload).length + 1);

      let createdDevice = allDevices[allDevices.length - 1];

      expect(createdDevice).toBeDefined();
      expect(createdDevice.IsActive).toBeFalsy();
    });

    it("should throw and not add any device if timeout in payload does not exists", async () => {
      createTimeout = undefined;

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

      expect(commInterface.getAllDevices().length).toEqual(
        Object.keys(initPayload).length
      );
    });

    it("should throw and not add any device if IPAdress in payload does not exists", async () => {
      createIpAdress = undefined;

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

      expect(commInterface.getAllDevices().length).toEqual(
        Object.keys(initPayload).length
      );
    });

    it("should throw and not add any device if UnitId in payload does not exists", async () => {
      createUnitId = undefined;

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

      expect(commInterface.getAllDevices().length).toEqual(
        Object.keys(initPayload).length
      );
    });

    it("should throw and not add any device if PortNumber in payload does not exists", async () => {
      createPortNumber = undefined;

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

      expect(commInterface.getAllDevices().length).toEqual(
        Object.keys(initPayload).length
      );
    });

    it("should throw and not add any device if Type in payload does not exists", async () => {
      createType = undefined;

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

      expect(commInterface.getAllDevices().length).toEqual(
        Object.keys(initPayload).length
      );
    });

    it("should throw and not add any device if one of variable is invalid", async () => {
      createVariables[1] = {
        id: "1002",
        timeSample: 3,
        name: "test variable 12",
        offset: 6,
        length: 2,
        fCode: 1234,
        value: 2,
        type: "int32",
        archived: true,
        getSingleFCode: 4,
        setSingleFCode: 16
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

      expect(commInterface.getAllDevices().length).toEqual(
        Object.keys(initPayload).length
      );
    });

    it("should throw and not add any device if payload is undefined", async () => {
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await commInterface.init(initPayload);

            await commInterface.createNewDevice();
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(commInterface.getAllDevices().length).toEqual(
        Object.keys(initPayload).length
      );
    });

    it("should throw and not add any device if payload is empty", async () => {
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await commInterface.init(initPayload);

            await commInterface.createNewDevice({});
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(commInterface.getAllDevices().length).toEqual(
        Object.keys(initPayload).length
      );
    });

    it("should connect device if isActive is true", async () => {
      createIsActive = true;

      let result = await exec();

      expect(result.IsActive).toBeTruthy();
      expect(result.MBDriver._client.connectTCP).toHaveBeenCalled();

      for (
        let i = 0;
        i < result.MBDriver._client.connectTCP.mock.calls.length;
        i++
      ) {
        expect(result.MBDriver._client.connectTCP.mock.calls[i][0]).toEqual(
          createIpAdress
        );
        expect(
          result.MBDriver._client.connectTCP.mock.calls[i][1]
        ).toMatchObject({ port: createPortNumber });
      }
    });
  });

  describe("createVariable", () => {
    let initPayload;
    let deviceId;
    let variableId;
    let variableName;
    let variableFcode;
    let variableOffset;
    let variableType;
    let variableTimeSample;
    let variableArchived;
    let variableGetSingleFCode;
    let variableSetSingleFCode;
    let variableValue;
    let variableUnit;
    let variablePayload;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
      variableId = "87654321";
      variableName = "test variable";
      variableFcode = 3;
      variableOffset = 2;
      variableType = "float";
      variableTimeSample = 5;
      variableArchived = true;
      variableGetSingleFCode = 3;
      variableSetSingleFCode = 16;
      variableValue = 123.321;
      variableUnit = "testUnit";
    });

    let exec = async () => {
      variablePayload = {
        id: variableId,
        name: variableName,
        fCode: variableFcode,
        offset: variableOffset,
        type: variableType,
        timeSample: variableTimeSample,
        getSingleFCode: variableGetSingleFCode,
        setSingleFCode: variableSetSingleFCode,
        archived: variableArchived,
        value: variableValue,
        unit: variableUnit
      };

      await commInterface.init(initPayload);
      return commInterface.createVariable(deviceId, variablePayload);
    };

    it("should create new variable based on given payload", async () => {
      let result = await exec();

      let createdVariable = commInterface.getVariable(deviceId, variableId);

      expect(createdVariable).toBeDefined();
      expect(createdVariable.Payload).toBeDefined();
      expect(createdVariable.Payload).toMatchObject(variablePayload);
    });

    it("should return created variable", async () => {
      let result = await exec();

      let createdVariable = commInterface.getVariable(deviceId, variableId);

      expect(result).toBeDefined();
      expect(result).toEqual(createdVariable);
    });

    it("should set own variable id if id is not defined inside payload", async () => {
      variableId = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();

      let createdVariable = commInterface.getVariable(deviceId, result.Id);

      expect(result).toEqual(createdVariable);
    });

    it("should automatically set getSingleFCode if it is not provided in payload", async () => {
      variableGetSingleFCode = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.GetSingleFCode).toBeDefined();
      //Float has default value of 3
      expect(result.GetSingleFCode).toEqual(3);
    });

    it("should automatically set setSingleFCode if it is not provided in payload", async () => {
      variableSetSingleFCode = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.SetSingleFCode).toBeDefined();
      //Float has default value of 3
      expect(result.SetSingleFCode).toEqual(16);
    });

    it("should automatically set archived to false if it is not provided in payload", async () => {
      variableArchived = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Archived).toBeDefined();
      expect(result.Archived).toBeFalsy();
    });

    it("should automatically set value to default value eg. 0 if it is not provided in payload", async () => {
      variableValue = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Value).toBeDefined();
      expect(result.Value).toEqual(0);
    });

    it("should automatically set unit to empty string if it is not provided in payload", async () => {
      variableUnit = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Unit).toBeDefined();
      expect(result.Unit).toEqual("");
    });

    it("should throw and not add variable if name is not given in payload", async () => {
      variableName = undefined;

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

      expect(
        Object.values(commInterface.getDevice(deviceId).Variables).length
      ).toEqual(3);
    });

    it("should throw and not add variable  if fCode is not given in payload", async () => {
      variableFcode = undefined;

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

      expect(
        Object.values(commInterface.getDevice(deviceId).Variables).length
      ).toEqual(3);
    });

    it("should throw and not add variable  if offset is not given in payload", async () => {
      variableOffset = undefined;

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

      expect(
        Object.values(commInterface.getDevice(deviceId).Variables).length
      ).toEqual(3);
    });

    it("should throw and not add variable  if time sample is not given in payload", async () => {
      variableTimeSample = undefined;

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

      expect(
        Object.values(commInterface.getDevice(deviceId).Variables).length
      ).toEqual(3);
    });

    it("should throw and not add variable if variable of given id already exists", async () => {
      variableId = "0002";

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

      expect(
        Object.values(commInterface.getDevice(deviceId).Variables).length
      ).toEqual(3);
    });
  });

  describe("getVariable", () => {
    let initPayload;
    let deviceId;
    let variableId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
      variableId = "0005";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.getVariable(deviceId, variableId);
    };

    it("should return variable if it exists", async () => {
      let result = await exec();

      expect(result).toEqual(
        commInterface.getDevice(deviceId).Variables[variableId]
      );
    });

    it("should throw if device does not exists", async () => {
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

    it("should throw if variable does not exists", async () => {
      variableId = "8765";

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

  describe("removeVariable", () => {
    let initPayload;
    let deviceId;
    let variableId;
    let variableToRemove;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
      variableId = "0005";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      variableToRemove = commInterface.getVariable(deviceId, variableId);
      return commInterface.removeVariable(deviceId, variableId);
    };

    it("should remove variable of given id", async () => {
      let result = await exec();

      let allVariableIds = commInterface.getAllVariableIds();

      expect(allVariableIds).not.toContain(variableId);
    });

    it("should return removed variable", async () => {
      let result = await exec();

      expect(result).toEqual(variableToRemove);
    });

    it("should throw and no delete variable if it does not exist", async () => {
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

      expect(commInterface.getAllVariableIds().length).toEqual(9);
    });

    it("should throw if variable does not exists", async () => {
      variableId = "8765";

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

      expect(commInterface.getAllVariableIds().length).toEqual(9);
    });
  });

  describe("editVariable", () => {
    let initPayload;
    let deviceId;
    let variableId;
    let originalVariable;
    let editVariableId;
    let editVariableName;
    let editVariableType;
    let editVariableFcode;
    let editVariableOffset;
    let editVariableTimeSample;
    let editVariableArchived;
    let editVariableGetSingleFCode;
    let editVariableSetSingleFCode;
    let editVariableValue;
    let editVariableUnit;
    let editVariablePayload;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
      variableId = "0005";

      editVariableId = undefined;
      editVariableName = "test editVariable";
      editVariableType = undefined;
      editVariableFcode = 3;
      editVariableOffset = 2;
      editVariableTimeSample = 5;
      editVariableArchived = true;
      editVariableGetSingleFCode = 3;
      editVariableSetSingleFCode = 16;
      editVariableValue = 123.321;
      editVariableUnit = "test unit";
    });

    let exec = async () => {
      editVariablePayload = {
        id: editVariableId,
        name: editVariableName,
        fCode: editVariableFcode,
        offset: editVariableOffset,
        timeSample: editVariableTimeSample,
        getSingleFCode: editVariableGetSingleFCode,
        setSingleFCode: editVariableSetSingleFCode,
        archived: editVariableArchived,
        value: editVariableValue,
        type: editVariableType,
        unit: editVariableUnit
      };

      await commInterface.init(initPayload);

      originalVariable = commInterface.getVariable(deviceId, variableId);

      return commInterface.editVariable(
        deviceId,
        variableId,
        editVariablePayload
      );
    };

    it("should edit variable based on given payload", async () => {
      let result = await exec();

      let editedVariable = commInterface.getVariable(deviceId, variableId);

      expect(editedVariable.Id).toEqual(variableId);
      expect(editedVariable.Name).toEqual(editVariableName);
      expect(editedVariable.FCode).toEqual(editVariableFcode);
      expect(editedVariable.Offset).toEqual(editVariableOffset);
      expect(editedVariable.TimeSample).toEqual(editVariableTimeSample);
      expect(editedVariable.Archived).toEqual(editVariableArchived);
      expect(editedVariable.GetSingleFCode).toEqual(editVariableGetSingleFCode);
      expect(editedVariable.SetSingleFCode).toEqual(editVariableSetSingleFCode);
      expect(editedVariable.Value).toEqual(editVariableValue);
    });

    it("should return edited variable", async () => {
      let result = await exec();

      let editedVariable = commInterface.getVariable(deviceId, variableId);

      expect(result).toEqual(editedVariable);
    });

    it("should not edit variable type if it is defined in payload", async () => {
      editVariableType = "float";

      let result = await exec();

      let editedVariable = commInterface.getVariable(deviceId, variableId);

      let orginalType = initPayload[deviceId].variables.filter(
        variable => variable.id === variableId
      )[0].type;

      //Type should have not been edited
      expect(editedVariable.Type).not.toEqual(editVariableType);
      expect(editedVariable.Type).toEqual(orginalType);

      //All other parameters should have been edited
      expect(editedVariable.Id).toEqual(variableId);
      expect(editedVariable.Name).toEqual(editVariableName);
      expect(editedVariable.FCode).toEqual(editVariableFcode);
      expect(editedVariable.Offset).toEqual(editVariableOffset);
      expect(editedVariable.TimeSample).toEqual(editVariableTimeSample);
      expect(editedVariable.Archived).toEqual(editVariableArchived);
      expect(editedVariable.GetSingleFCode).toEqual(editVariableGetSingleFCode);
      expect(editedVariable.SetSingleFCode).toEqual(editVariableSetSingleFCode);
      expect(editedVariable.Value).toEqual(editVariableValue);
    });

    it("should not edit variable id if it is defined in payload", async () => {
      editVariableId = "87654321";

      let result = await exec();

      let editedVariable = commInterface.getVariable(deviceId, variableId);

      //Type should have not been edited
      expect(editedVariable.Id).not.toEqual(editVariableId);
      expect(editedVariable.Id).toEqual(variableId);

      //All other parameters should have been edited
      expect(editedVariable.Id).toEqual(variableId);
      expect(editedVariable.Name).toEqual(editVariableName);
      expect(editedVariable.FCode).toEqual(editVariableFcode);
      expect(editedVariable.Offset).toEqual(editVariableOffset);
      expect(editedVariable.TimeSample).toEqual(editVariableTimeSample);
      expect(editedVariable.Archived).toEqual(editVariableArchived);
      expect(editedVariable.GetSingleFCode).toEqual(editVariableGetSingleFCode);
      expect(editedVariable.SetSingleFCode).toEqual(editVariableSetSingleFCode);
      expect(editedVariable.Value).toEqual(editVariableValue);
    });

    it("should create completly new variable but with the same event object", async () => {
      let result = await exec();

      let editedVariable = commInterface.getVariable(deviceId, variableId);

      expect(originalVariable).not.toEqual(editedVariable);

      expect(originalVariable.Events).toBeDefined();
      expect(originalVariable.Events).toEqual(editedVariable.Events);
    });

    it("should not add new variable but replace old one", async () => {
      let result = await exec();

      expect(
        Object.keys(commInterface.getDevice(deviceId).Variables).length
      ).toEqual(initPayload[deviceId].variables.length);
    });

    it("should edit only name if only name is defined in payload ", async () => {
      editVariableFcode = undefined;
      editVariableOffset = undefined;
      editVariableTimeSample = undefined;
      editVariableArchived = undefined;
      editVariableGetSingleFCode = undefined;
      editVariableSetSingleFCode = undefined;
      editVariableValue = undefined;
      editVariableUnit = undefined;

      let initVariablePayload = initPayload[deviceId].variables.filter(
        variable => variable.id === variableId
      )[0];

      let result = await exec();

      expect(result.Name).toEqual(editVariableName);
      expect(result.FCode).toEqual(initVariablePayload.fCode);
      expect(result.Offset).toEqual(initVariablePayload.offset);
      expect(result.TimeSample).toEqual(initVariablePayload.timeSample);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(initVariablePayload.unit);
    });

    it("should edit only fcode if only fcode is defined in payload ", async () => {
      editVariableFcode = undefined;
      editVariableOffset = undefined;
      editVariableTimeSample = undefined;
      editVariableArchived = undefined;
      editVariableGetSingleFCode = undefined;
      editVariableSetSingleFCode = undefined;
      editVariableValue = undefined;
      editVariableUnit = undefined;

      let initVariablePayload = initPayload[deviceId].variables.filter(
        variable => variable.id === variableId
      )[0];

      let result = await exec();

      expect(result.Name).toEqual(editVariableName);
      expect(result.FCode).toEqual(initVariablePayload.fCode);
      expect(result.Offset).toEqual(initVariablePayload.offset);
      expect(result.TimeSample).toEqual(initVariablePayload.timeSample);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(initVariablePayload.unit);
    });

    it("should edit only offset if only offset is defined in payload ", async () => {
      editVariableName = undefined;
      editVariableFcode = undefined;
      editVariableTimeSample = undefined;
      editVariableArchived = undefined;
      editVariableGetSingleFCode = undefined;
      editVariableSetSingleFCode = undefined;
      editVariableValue = undefined;
      editVariableUnit = undefined;

      let initVariablePayload = initPayload[deviceId].variables.filter(
        variable => variable.id === variableId
      )[0];

      let result = await exec();

      expect(result.Name).toEqual(initVariablePayload.name);
      expect(result.FCode).toEqual(initVariablePayload.fCode);
      expect(result.Offset).toEqual(editVariableOffset);
      expect(result.TimeSample).toEqual(initVariablePayload.timeSample);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(initVariablePayload.unit);
    });

    it("should edit only timeSample if only timeSample is defined in payload ", async () => {
      editVariableName = undefined;
      editVariableFcode = undefined;
      editVariableOffset = undefined;
      editVariableArchived = undefined;
      editVariableGetSingleFCode = undefined;
      editVariableSetSingleFCode = undefined;
      editVariableValue = undefined;
      editVariableUnit = undefined;

      let initVariablePayload = initPayload[deviceId].variables.filter(
        variable => variable.id === variableId
      )[0];

      let result = await exec();

      expect(result.Name).toEqual(initVariablePayload.name);
      expect(result.FCode).toEqual(initVariablePayload.fCode);
      expect(result.Offset).toEqual(initVariablePayload.offset);
      expect(result.TimeSample).toEqual(editVariableTimeSample);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(initVariablePayload.unit);
    });

    it("should edit only archived if only archived is defined in payload ", async () => {
      editVariableName = undefined;
      editVariableFcode = undefined;
      editVariableOffset = undefined;
      editVariableTimeSample = undefined;
      editVariableGetSingleFCode = undefined;
      editVariableSetSingleFCode = undefined;
      editVariableValue = undefined;
      editVariableUnit = undefined;

      let initVariablePayload = initPayload[deviceId].variables.filter(
        variable => variable.id === variableId
      )[0];

      let result = await exec();

      expect(result.Name).toEqual(initVariablePayload.name);
      expect(result.FCode).toEqual(initVariablePayload.fCode);
      expect(result.Offset).toEqual(initVariablePayload.offset);
      expect(result.TimeSample).toEqual(initVariablePayload.timeSample);
      expect(result.Archived).toEqual(editVariableArchived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(initVariablePayload.unit);
    });

    it("should edit only unit if only unit is defined in payload ", async () => {
      editVariableName = undefined;
      editVariableFcode = undefined;
      editVariableOffset = undefined;
      editVariableTimeSample = undefined;
      editVariableGetSingleFCode = undefined;
      editVariableSetSingleFCode = undefined;
      editVariableValue = undefined;
      editVariableArchived = undefined;

      let initVariablePayload = initPayload[deviceId].variables.filter(
        variable => variable.id === variableId
      )[0];

      let result = await exec();

      expect(result.Name).toEqual(initVariablePayload.name);
      expect(result.FCode).toEqual(initVariablePayload.fCode);
      expect(result.Offset).toEqual(initVariablePayload.offset);
      expect(result.TimeSample).toEqual(initVariablePayload.timeSample);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(editVariableUnit);
    });

    it("should edit only getSingleFCode if only getSingleFCode is defined in payload ", async () => {
      editVariableName = undefined;
      editVariableOffset = undefined;
      editVariableTimeSample = undefined;
      editVariableArchived = undefined;
      editVariableSetSingleFCode = undefined;
      editVariableValue = undefined;
      editVariableUnit = undefined;

      let initVariablePayload = initPayload[deviceId].variables.filter(
        variable => variable.id === variableId
      )[0];

      let result = await exec();

      expect(result.Name).toEqual(initVariablePayload.name);
      //We have to change also the fcode of whole variable if changing getSingleFCode
      expect(result.FCode).toEqual(editVariableFcode);
      expect(result.Offset).toEqual(initVariablePayload.offset);
      expect(result.TimeSample).toEqual(initVariablePayload.timeSample);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(editVariableGetSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(initVariablePayload.unit);
    });

    it("should edit only setSingleFCode if only setSingleFCode is defined in payload ", async () => {
      editVariableName = undefined;
      editVariableFcode = undefined;
      editVariableOffset = undefined;
      editVariableTimeSample = undefined;
      editVariableArchived = undefined;
      editVariableGetSingleFCode = undefined;
      editVariableValue = undefined;
      editVariableUnit = undefined;

      let initVariablePayload = initPayload[deviceId].variables.filter(
        variable => variable.id === variableId
      )[0];

      let result = await exec();

      expect(result.Name).toEqual(initVariablePayload.name);
      expect(result.FCode).toEqual(initVariablePayload.fCode);
      expect(result.Offset).toEqual(initVariablePayload.offset);
      expect(result.TimeSample).toEqual(initVariablePayload.timeSample);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(editVariableSetSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(initVariablePayload.unit);
    });

    it("should edit only value if only value is defined in payload ", async () => {
      editVariableName = undefined;
      editVariableFcode = undefined;
      editVariableOffset = undefined;
      editVariableTimeSample = undefined;
      editVariableArchived = undefined;
      editVariableGetSingleFCode = undefined;
      editVariableSetSingleFCode = undefined;
      editVariableUnit = undefined;

      let initVariablePayload = initPayload[deviceId].variables.filter(
        variable => variable.id === variableId
      )[0];

      let result = await exec();

      expect(result.Name).toEqual(initVariablePayload.name);
      expect(result.FCode).toEqual(initVariablePayload.fCode);
      expect(result.Offset).toEqual(initVariablePayload.offset);
      expect(result.TimeSample).toEqual(initVariablePayload.timeSample);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(editVariableValue);
    });

    it("should throw if there is no such variable", async () => {
      variableId = "8765";

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

    it("should throw if there is no such device", async () => {
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

  describe("getVariableFromDevice", () => {
    let initPayload;
    let deviceId;
    let variableId;
    let connectDevice;
    let previousValue;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1236";
      variableId = "0009";

      connectDevice = true;
    });

    let exec = async () => {
      await commInterface.init(initPayload);

      if (connectDevice) await commInterface.startCommunication(deviceId);

      //Waiting for normal tick to get data - in order to device not be busy
      await snooze(350);

      previousValue = commInterface.getVariable(deviceId, variableId).Value;

      return commInterface.getVariableFromDevice(deviceId, variableId);
    };

    it("should get value directly from device and set it to Value of variable", async () => {
      //offset = 7 -> two registers = first = 8, second = 9 -> 8 + 9 * 2^16 = 589832
      let result = await exec();

      let variable = commInterface.getVariable(deviceId, variableId);

      expect(variable.Value).toEqual(589832);
    });

    it("should return new value", async () => {
      let result = await exec();

      expect(result).toEqual(589832);
    });

    it("should throw if device is not active", async () => {
      connectDevice = false;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if device does not exists", async () => {
      deviceId = 8765;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if variable does not exists", async () => {
      variableId = 8765;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("setVariableInDevice", () => {
    let initPayload;
    let deviceId;
    let variableId;
    let connectDevice;
    let previousValue;
    let newValue;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1236";
      variableId = "0009";

      connectDevice = true;

      //[8, 4] =>  4 * 2 ^16 + 8 => 262144 + 8 => 262152
      newValue = 262152;
    });

    let exec = async () => {
      await commInterface.init(initPayload);

      if (connectDevice) await commInterface.startCommunication(deviceId);

      //Waiting for normal tick to get data - in order to device not be busy
      await snooze(350);

      previousValue = commInterface.getVariable(deviceId, variableId).Value;

      return commInterface.setVariableInDevice(deviceId, variableId, newValue);
    };

    it("should set new value in modbus device according to value given as argument", async () => {
      await exec();

      let variable = commInterface.getVariable(deviceId, variableId);

      expect(variable.Value).toEqual(newValue);
    });

    it("should call modbus client set function with value given as argument", async () => {
      await exec();

      let device = commInterface.getDevice(deviceId);
      let variable = commInterface.getVariable(deviceId, variableId);

      expect(device.MBDriver._client.writeRegisters).toHaveBeenCalledTimes(1);
      expect(device.MBDriver._client.writeRegisters.mock.calls[0][0]).toEqual(
        variable.Offset
      );
      expect(device.MBDriver._client.writeRegisters.mock.calls[0][1]).toEqual([
        8,
        4
      ]);
    });

    it("should throw if device does not exists", async () => {
      deviceId = "8765";
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if variable does not exists", async () => {
      variableId = "8765";
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });
});
