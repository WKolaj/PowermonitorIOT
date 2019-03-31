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
        type: "int16"
      },
      {
        id: "0002",
        timeSample: 3,
        name: "test variable 2",
        offset: 6,
        length: 2,
        fCode: 4,
        value: 2,
        type: "int32"
      },
      {
        id: "0003",
        timeSample: 4,
        name: "test variable 3",
        offset: 7,
        length: 2,
        fCode: 16,
        value: 3.3,
        type: "float"
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
        type: "boolean"
      },
      {
        id: "0005",
        timeSample: 3,
        name: "test variable 5",
        offset: 6,
        length: 2,
        fCode: 4,
        value: 5,
        type: "swappedInt32"
      },
      {
        id: "0006",
        timeSample: 4,
        name: "test variable 6",
        offset: 7,
        length: 2,
        fCode: 16,
        value: 6.6,
        type: "swappedFloat"
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
        offset: 5,
        length: 1,
        fCode: 3,
        value: 7,
        type: "uInt16"
      },
      {
        id: "0008",
        timeSample: 3,
        name: "test variable 5",
        offset: 6,
        length: 2,
        fCode: 4,
        value: 8,
        type: "swappedUInt32"
      },
      {
        id: "0009",
        timeSample: 4,
        name: "test variable 6",
        offset: 7,
        length: 2,
        fCode: 16,
        value: 9,
        type: "uInt32"
      }
    ],
    type: "mbDevice"
  }
});

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

describe("CommInterface", () => {
  //Creating seperate commInterface to all tests
  beforeEach(() => {
    commInterface = require("../../classes/commInterface/CommInterface.js");
  });

  afterEach(async () => {
    //ending communication with all devices if there are any
    await commInterface.stopCommunicationWithAllDevices();
    commInterface.Sampler.stop();
    jest.resetModules();
    //waiting for all sampling actions to end being invoke;
    await snooze(100);
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

    let exec = () => {
      commInterface.init();

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

    it("should create a new device based on given arguments", () => {
      exec();

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

    it("should return created device", () => {
      let result = exec();

      let device = commInterface.getDevice(id);
      expect(result).toEqual(device);
    });

    it("should create a new device based on given arguments and set its id if id was not given in payload", () => {
      id = undefined;

      exec();

      let allDevices = commInterface.getAllDevices();

      expect(allDevices).toBeDefined();
      expect(allDevices.length).toEqual(1);

      let device = allDevices[0];

      expect(device.Id).toBeDefined();
    });

    it("should create a new device based on given arguments and starts its communication if isActive is true", () => {
      isActive = true;

      let result = exec();

      expect(result.IsActive).toEqual(true);
      expect(result.MBDriver._client.connectTCP).toHaveBeenCalledTimes(1);
      expect(result.MBDriver._client.connectTCP.mock.calls[0][0]).toEqual(
        ipAdress
      );
      expect(result.MBDriver._client.connectTCP.mock.calls[0][1]).toMatchObject(
        { port: portNumber }
      );
    });

    it("should create a new device together with its variables if they are given", () => {
      let varaible1Payload = {
        id: "1234",
        timeSample: 2,
        name: "test variable 1",
        type: "int16",
        offset: 2,
        fCode: 3,
        value: 1234
      };
      let varaible2Payload = {
        id: "1235",
        timeSample: 3,
        name: "test variable 2",
        type: "boolean",
        offset: 1,
        fCode: 1,
        value: true
      };
      let varaible3Payload = {
        id: "1236",
        timeSample: 4,
        name: "test variable 3",
        type: "int32",
        offset: 5,
        fCode: 4,
        value: 4321
      };

      variables = [varaible1Payload, varaible2Payload, varaible3Payload];

      let device = exec();

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

    it("should create a new device together with its variables if they are given - and create their ids if not given", () => {
      let varaible1Payload = {
        timeSample: 2,
        name: "test variable 1",
        type: "int16",
        offset: 2,
        fCode: 3
      };
      let varaible2Payload = {
        timeSample: 3,
        name: "test variable 2",
        type: "boolean",
        offset: 1,
        fCode: 1
      };
      let varaible3Payload = {
        timeSample: 4,
        name: "test variable 3",
        type: "int32",
        offset: 5,
        fCode: 4
      };

      variables = [varaible1Payload, varaible2Payload, varaible3Payload];

      let device = exec();

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

    it("should create a new device together with its variables if they are given - and set default values if they are not given", () => {
      let varaible1Payload = {
        timeSample: 2,
        name: "test variable 1",
        type: "int16",
        offset: 2,
        fCode: 3
      };
      let varaible2Payload = {
        timeSample: 3,
        name: "test variable 2",
        type: "boolean",
        offset: 1,
        fCode: 1
      };
      let varaible3Payload = {
        timeSample: 4,
        name: "test variable 3",
        type: "int32",
        offset: 5,
        fCode: 4
      };

      variables = [varaible1Payload, varaible2Payload, varaible3Payload];

      let device = exec();

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

    it("should add device to sampler", () => {
      let result = exec();

      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(1);
      expect(commInterface.Sampler.AllDevices[result.Id]).toBeDefined();
      expect(commInterface.Sampler.AllDevices[result.Id]).toEqual(result);
    });

    it("should throw and do not add device to Devices or Sampler if device type is not recognized", () => {
      deviceType = "not recongized type";

      expect(() => exec()).toThrow();

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice name is empty", () => {
      name = undefined;

      expect(() => exec()).toThrow();

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice type is empty", () => {
      deviceType = undefined;

      expect(() => exec()).toThrow();

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice ipAdress is empty", () => {
      ipAdress = undefined;

      expect(() => exec()).toThrow();

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice portNumber is empty", () => {
      portNumber = undefined;

      expect(() => exec()).toThrow();

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice timeout is empty", () => {
      timeout = undefined;

      expect(() => exec()).toThrow();

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice unitId is empty", () => {
      unitId = undefined;

      expect(() => exec()).toThrow();

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should not throw, but set isActive to false if MBdevice isActive is empty", () => {
      isActive = undefined;

      expect(() => exec()).not.toThrow();

      expect(Object.values(commInterface.Devices).length).toEqual(1);

      let device = Object.values(commInterface.Devices)[0];

      expect(device.IsActive).toBeFalsy();
    });

    it("should throw and do not add device to Devices or Sampler if MBdevice varaible payload is invalid", () => {
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

      expect(() => exec()).toThrow();

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add device to Devices or Sampler if payload is empty", () => {
      commInterface.init();
      expect(() => commInterface.createNewDevice({})).toThrow();

      expect(Object.values(commInterface.Devices).length).toEqual(0);
      expect(Object.values(commInterface.Sampler.AllDevices).length).toEqual(0);
    });

    it("should throw and do not add new device if device of such id already exists", () => {
      exec();

      expect(() => exec()).toThrow();

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

    beforeEach(() => {
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

    let exec = () => {
      !commInterface.init();

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

      commInterface.createNewDevice(device1Payload);
      commInterface.createNewDevice(device2Payload);

      return commInterface.getMainData();
    };

    it("should return all devicesIds, deviceNames, variableIds and their values and names", () => {
      let result = exec();

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

    it("should return empty object if there are no devices in commInterface", () => {
      commInterface.init();

      let result = commInterface.getMainData();

      expect(result).toEqual({});
    });

    it("should return valid object if one of device does not have any variables", () => {
      commInterface.init();

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

      commInterface.createNewDevice(device1Payload);
      commInterface.createNewDevice(device2Payload);

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

    beforeEach(() => {
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

    let exec = () => {
      !commInterface.init();

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

      commInterface.createNewDevice(device1Payload);
      commInterface.createNewDevice(device2Payload);

      return commInterface.getAllValues();
    };

    it("should return all devicesIds, variableIds and their values", () => {
      let result = exec();

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

    it("should return empty object if there are no devices in commInterface", () => {
      commInterface.init();

      let result = commInterface.getMainData();

      expect(result).toEqual({});
    });

    it("should return valid object if one of device does not have any variables", () => {
      commInterface.init();

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

      commInterface.createNewDevice(device1Payload);
      commInterface.createNewDevice(device2Payload);

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

  describe("startCommunication", () => {
    let initPayload;
    let deviceId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
    });

    let exec = () => {
      commInterface.init(initPayload);
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

    it("should throw if there is no device of given id", () => {
      deviceId = "4321";

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
  });

  describe("stopCommunication", () => {
    let initPayload;
    let deviceId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
    });

    let exec = async () => {
      commInterface.init(initPayload);
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

    it("should throw if there is no device of given id", () => {
      deviceId = "4321";

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
  });
});
