const S7Request = require("../../../classes/driver/S7/S7Request");
const S7Driver = require("../../../classes/driver/S7/S7Driver");
const config = require("config");
const S7Int16Variable = require("../../../classes/variable/S7/S7Int16Variable");
const snap7 = require("node-snap7");
const S7Device = require("../../../classes/device/S7/S7Device");
const {
  snooze,
  exists,
  readAllDataFromTable,
  clearDirectoryAsync
} = require("../../../utilities/utilities");

describe("S7Device", () => {
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

    beforeEach(() => {
      setConnectToThrow = false;
      devicePayload = {
        id: "1234",
        name: "testDevice",
        type: "s7Device",
        ipAdress: "192.169.9.12",
        isActive: false,
        rack: 9,
        slot: 8,
        timeout: 100,
        variables: [
          {
            id: "varId1",
            name: "testVar1",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7Int8",
            areaType: "DB",
            write: false,
            dbNumber: 1,
            offset: 1,
            unit: "A",
            value: 0
          },
          {
            id: "varId2",
            name: "testVar2",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7Int16",
            areaType: "DB",
            write: false,
            dbNumber: 1,
            offset: 2,
            unit: "B",
            value: 0
          },
          {
            id: "varId3",
            name: "testVar3",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7Int32",
            areaType: "I",
            write: false,
            dbNumber: 3,
            offset: 3,
            unit: "C",
            value: 0
          },
          {
            id: "varId4",
            name: "testVar4",
            sampleTime: 2,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7UInt8",
            areaType: "I",
            write: true,
            dbNumber: 1,
            offset: 1,
            unit: "D",
            value: 0
          },
          {
            id: "varId5",
            name: "testVar5",
            sampleTime: 2,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7UInt16",
            areaType: "I",
            write: true,
            dbNumber: 1,
            offset: 2,
            unit: "E",
            value: 0
          },
          {
            id: "varId6",
            name: "testVar6",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7UInt32",
            areaType: "Q",
            write: false,
            dbNumber: 3,
            offset: 3,
            unit: "F",
            value: 0
          },
          {
            id: "varId7",
            name: "testVar7",
            sampleTime: 3,
            archiveSampleTime: 2,
            archived: false,
            unit: "G",
            length: 6,
            type: "s7ByteArray",
            areaType: "M",
            write: true,
            dbNumber: 3,
            offset: 3,
            unit: "F",
            value: [0, 0, 0, 0, 0, 0]
          },
          {
            id: "varId8",
            name: "testVar8",
            sampleTime: 3,
            archiveSampleTime: 2,
            archived: false,
            unit: "H",
            type: "s7Float",
            areaType: "M",
            write: false,
            dbNumber: 3,
            offset: 13,
            unit: "F",
            value: 0
          }
        ],
        calculationElements: [
          {
            id: "sumElementId1",
            name: "sum element",
            type: "sumElement",
            archived: true,
            unit: "D",
            sampleTime: 1,
            archiveSampleTime: 2,
            variables: [
              {
                id: "varId1",
                factor: 1
              },
              {
                id: "varId2",
                factor: 2
              },
              {
                id: "varId3",
                factor: 3
              }
            ]
          }
        ]
      };
    });

    let exec = () => {
      device = new S7Device();
      return device.init(devicePayload);
    };

    it("should initialize device based on given payload", async () => {
      await exec();

      expect(device.Payload).toEqual(devicePayload);
    });

    it("should set requests according to given S7 variables", async () => {
      await exec();

      expect(Object.keys(device.Requests).length).toEqual(3);

      let reqForSampleTime1 = device.Requests[1];

      expect(reqForSampleTime1.length).toEqual(3);

      //Checking req 1
      expect(
        Object.values(reqForSampleTime1[0].VariableConnections).length
      ).toEqual(2);

      expect(
        reqForSampleTime1[0].VariableConnections[devicePayload.variables[0].id]
          .variable.Payload
      ).toEqual(devicePayload.variables[0]);

      expect(
        reqForSampleTime1[0].VariableConnections[devicePayload.variables[1].id]
          .variable.Payload
      ).toEqual(devicePayload.variables[1]);

      //Checking req 2
      expect(
        Object.values(reqForSampleTime1[1].VariableConnections).length
      ).toEqual(1);

      expect(
        reqForSampleTime1[1].VariableConnections[devicePayload.variables[2].id]
          .variable.Payload
      ).toEqual(devicePayload.variables[2]);

      //Checking req 3
      expect(
        Object.values(reqForSampleTime1[2].VariableConnections).length
      ).toEqual(1);

      expect(
        reqForSampleTime1[2].VariableConnections[devicePayload.variables[5].id]
          .variable.Payload
      ).toEqual(devicePayload.variables[5]);

      let reqForSampleTime2 = device.Requests[2];

      expect(reqForSampleTime2.length).toEqual(1);

      //Checking req 4
      expect(
        Object.values(reqForSampleTime2[0].VariableConnections).length
      ).toEqual(2);

      expect(
        reqForSampleTime2[0].VariableConnections[devicePayload.variables[3].id]
          .variable.Payload
      ).toEqual(devicePayload.variables[3]);

      expect(
        reqForSampleTime2[0].VariableConnections[devicePayload.variables[4].id]
          .variable.Payload
      ).toEqual(devicePayload.variables[4]);

      let reqForSampleTime3 = device.Requests[3];

      expect(reqForSampleTime3.length).toEqual(2);

      //Checking req 5
      expect(
        Object.values(reqForSampleTime3[0].VariableConnections).length
      ).toEqual(1);

      expect(
        reqForSampleTime3[0].VariableConnections[devicePayload.variables[6].id]
          .variable.Payload
      ).toEqual(devicePayload.variables[6]);

      //Checking req 6
      expect(
        Object.values(reqForSampleTime3[1].VariableConnections).length
      ).toEqual(1);

      expect(
        reqForSampleTime3[1].VariableConnections[devicePayload.variables[7].id]
          .variable.Payload
      ).toEqual(devicePayload.variables[7]);
    });

    it("should not throw if connect throws", async () => {
      devicePayload.isActive = false;

      let connectRealMethod = snap7.S7Client.prototype.ConnectTo;

      snap7.S7Client.prototype.ConnectTo = this.ConnectTo = jest.fn(
        async (ip, rack, slot, callback) => {
          await callback("ConnectionError");
        }
      );

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      snap7.S7Client.prototype.ConnectTo = connectRealMethod;

      expect(device.S7Driver._client.Client.ConnectTo).not.toHaveBeenCalled();
    });

    it("should call connect if devicePayload is active", async () => {
      devicePayload.isActive = true;

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      expect(device.S7Driver._client.Client.ConnectTo).toHaveBeenCalledTimes(1);
      expect(device.S7Driver._client.Client.ConnectTo.mock.calls[0][0]).toEqual(
        devicePayload.ipAdress
      );
      expect(device.S7Driver._client.Client.ConnectTo.mock.calls[0][1]).toEqual(
        devicePayload.rack
      );
      expect(device.S7Driver._client.Client.ConnectTo.mock.calls[0][2]).toEqual(
        devicePayload.slot
      );
    });

    it("should not call connect if devicePayload is not active", async () => {
      devicePayload.isActive = false;

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      expect(device.S7Driver._client.Client.ConnectTo).not.toHaveBeenCalled();
    });

    it("should initialize device based on given if device has no variables", async () => {
      devicePayload.variables = [];
      devicePayload.calculationElements[0].variables = [];

      await exec();

      expect(device.Payload).toEqual(devicePayload);
    });

    it("should initialize device based on given if device has no calculationVariables", async () => {
      devicePayload.calculationElements = [];

      await exec();

      expect(device.Payload).toEqual(devicePayload);
    });

    it("should initialize device based on given if device has no variables - not defined", async () => {
      devicePayload.variables = undefined;
      devicePayload.calculationElements[0].variables = [];
      await exec();

      let expectedPayload = {
        ...devicePayload,
        variables: []
      };

      expect(device.Payload).toEqual(expectedPayload);
    });

    it("should initialize device based on given if device has no calculationVariables - not defined", async () => {
      devicePayload.calculationElements = undefined;

      await exec();

      let expectedPayload = {
        ...devicePayload,
        calculationElements: []
      };

      expect(device.Payload).toEqual(expectedPayload);
    });

    it("should set id if devicePayload has no id defined", async () => {
      devicePayload.id = undefined;

      await exec();

      expect(device.Id).toBeDefined();
    });

    it("should throw if payload has no name defined", async () => {
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

    it("should throw if payload has no ipAdress defined", async () => {
      devicePayload.ipAdress = undefined;

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

    it("should not throw but set default value if payload has no rack defined", async () => {
      devicePayload.rack = undefined;

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

      expect(device.Rack).toEqual(0);
    });

    it("should not throw but set default value if payload has no slot defined", async () => {
      devicePayload.slot = undefined;

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

      expect(device.Slot).toEqual(1);
    });

    it("should throw if payload has no timeout defined", async () => {
      devicePayload.timeout = undefined;

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

    it("should add to ArchveManager all variables and calculationElements which are archived", async () => {
      await exec();

      let allVariables = Object.values(device.ArchiveManager.Variables);

      expect(allVariables.length).toEqual(3);

      let allPayloads = allVariables.map(x => x.Payload);

      expect(allPayloads[0]).toEqual(devicePayload.variables[1]);
      expect(allPayloads[1]).toEqual(devicePayload.variables[3]);
      expect(allPayloads[2]).toEqual(devicePayload.variables[5]);
    });
  });

  describe("editWithPayload", () => {
    let device;
    let initPayload;
    let editPayload;
    let initialDriver;

    beforeEach(async () => {
      setConnectToThrow = false;
      initPayload = {
        id: "1234",
        name: "testDevice",
        type: "s7Device",
        ipAdress: "192.169.9.12",
        isActive: false,
        rack: 9,
        slot: 8,
        timeout: 100,
        variables: [
          {
            id: "varId1",
            name: "testVar1",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7Int8",
            areaType: "DB",
            write: false,
            dbNumber: 1,
            offset: 1,
            unit: "A",
            value: 0
          },
          {
            id: "varId2",
            name: "testVar2",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7Int16",
            areaType: "DB",
            write: false,
            dbNumber: 1,
            offset: 2,
            unit: "B",
            value: 0
          },
          {
            id: "varId3",
            name: "testVar3",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7Int32",
            areaType: "I",
            write: false,
            dbNumber: 3,
            offset: 3,
            unit: "C",
            value: 0
          },
          {
            id: "varId4",
            name: "testVar4",
            sampleTime: 2,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7UInt8",
            areaType: "I",
            write: true,
            dbNumber: 1,
            offset: 1,
            unit: "D",
            value: 0
          },
          {
            id: "varId5",
            name: "testVar5",
            sampleTime: 2,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7UInt16",
            areaType: "I",
            write: true,
            dbNumber: 1,
            offset: 2,
            unit: "E",
            value: 0
          },
          {
            id: "varId6",
            name: "testVar6",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7UInt32",
            areaType: "Q",
            write: false,
            dbNumber: 3,
            offset: 3,
            unit: "F",
            value: 0
          },
          {
            id: "varId7",
            name: "testVar7",
            sampleTime: 3,
            archiveSampleTime: 2,
            archived: false,
            unit: "G",
            length: 6,
            type: "s7ByteArray",
            areaType: "M",
            write: true,
            dbNumber: 3,
            offset: 3,
            unit: "F",
            value: [0, 0, 0, 0, 0, 0]
          },
          {
            id: "varId8",
            name: "testVar8",
            sampleTime: 3,
            archiveSampleTime: 2,
            archived: false,
            unit: "H",
            type: "s7Float",
            areaType: "M",
            write: false,
            dbNumber: 3,
            offset: 13,
            unit: "F",
            value: 0
          }
        ],
        calculationElements: [
          {
            id: "sumElementId1",
            name: "sum element",
            type: "sumElement",
            archived: true,
            unit: "D",
            sampleTime: 1,
            archiveSampleTime: 2,
            variables: [
              {
                id: "varId1",
                factor: 1
              },
              {
                id: "varId2",
                factor: 2
              },
              {
                id: "varId3",
                factor: 3
              }
            ]
          }
        ]
      };
      editPayload = {
        name: "testDevice2",
        ipAdress: "192.169.9.13",
        isActive: true,
        rack: 4,
        slot: 3,
        timeout: 200
      };
    });

    let exec = async () => {
      device = new S7Device();
      await device.init(initPayload);
      initialDriver = device.S7Driver;
      return device.editWithPayload(editPayload);
    };

    it("should initialize device based on given payload", async () => {
      await exec();

      expect(device.Payload).toEqual({
        ...initPayload,
        ...editPayload
      });
    });

    it("should return new edited device", async () => {
      let result = await exec();

      expect(result).toEqual(device);
    });

    it("should not throw if connect throws", async () => {
      initPayload.isActive = false;

      let connectRealMethod = snap7.S7Client.prototype.ConnectTo;

      snap7.S7Client.prototype.ConnectTo = this.ConnectTo = jest.fn(
        async (ip, rack, slot, callback) => {
          await callback("ConnectionError");
        }
      );

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      snap7.S7Client.prototype.ConnectTo = connectRealMethod;
    });

    it("should call connect if editPayload is active and previously was not - changes not assosiated with driver", async () => {
      initPayload.isActive = false;
      editPayload = { isActive: true };

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      expect(device.S7Driver._client.Client.ConnectTo).toHaveBeenCalledTimes(1);
      expect(device.S7Driver._client.Client.ConnectTo.mock.calls[0][0]).toEqual(
        editPayload.ipAdress
      );
      expect(device.S7Driver._client.Client.ConnectTo.mock.calls[0][1]).toEqual(
        editPayload.rack
      );
      expect(device.S7Driver._client.Client.ConnectTo.mock.calls[0][2]).toEqual(
        editPayload.slot
      );
    });

    it("should not call connect if editPayload is active and previously was not - changes not assosiated with driver", async () => {
      initPayload.isActive = false;
      editPayload = { isActive: false };

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      expect(device.S7Driver._client.Client.ConnectTo).not.toHaveBeenCalled();
    });

    it("should call disconnect if editPayload is not active but previosly it was active - changes not assosiated with driver", async () => {
      initPayload.isActive = true;
      editPayload = { isActive: false };

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      expect(device.S7Driver._client.Client.Disconnect).toHaveBeenCalledTimes(
        1
      );
    });

    it("should not call connect again if editPayload is  active but previosly it was active - changes not assosiated with driver", async () => {
      initPayload.isActive = true;
      editPayload = { isActive: true };

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      expect(device.S7Driver._client.Client.ConnectTo).toHaveBeenCalledTimes(1);
    });

    it("should call connect if editPayload is active and previously was not - changes assosiated with driver", async () => {
      initPayload.isActive = false;
      editPayload = { isActive: true, ipAdress: "192.164.12.3" };

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      expect(device.S7Driver._client.Client.ConnectTo).toHaveBeenCalledTimes(1);
      expect(device.S7Driver._client.Client.ConnectTo.mock.calls[0][0]).toEqual(
        editPayload.ipAdress
      );
      expect(device.S7Driver._client.Client.ConnectTo.mock.calls[0][1]).toEqual(
        editPayload.rack
      );
      expect(device.S7Driver._client.Client.ConnectTo.mock.calls[0][2]).toEqual(
        editPayload.slot
      );

      //Driver also should be changed
      expect(device.S7Driver).not.toEqual(initialDriver);

      expect(initialDriver._client.Client.Disconnect).not.toHaveBeenCalled();
    });

    it("should not call connect if editPayload is active and previously was not - changes assosiated with driver", async () => {
      initPayload.isActive = false;
      editPayload = { isActive: false, ipAdress: "192.164.12.3" };

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      expect(initialDriver._client.Client.Disconnect).not.toHaveBeenCalled();
      expect(device.S7Driver._client.Client.ConnectTo).not.toHaveBeenCalled();

      //Driver also should be changed
      expect(device.S7Driver).not.toEqual(initialDriver);
    });

    it("should not call disconnect for new driver but call it for old driver if editPayload is not active but previosly it was active - changes assosiated with driver, so it is no point to disconect it - initialy not connected", async () => {
      initPayload.isActive = true;
      editPayload = { isActive: false, ipAdress: "192.164.12.3" };

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      expect(initialDriver._client.Client.Disconnect).toHaveBeenCalled();
      expect(device.S7Driver._client.Client.Disconnect).not.toHaveBeenCalled();
      //Driver also should be changed
      expect(device.S7Driver).not.toEqual(initialDriver);
    });

    it("should  call connect again even if editPayload is active and previosly it was active - changes assosiated with driver - also driver should be changed", async () => {
      initPayload.isActive = true;
      editPayload = { isActive: true, ipAdress: "192.164.12.3" };

      await exec();

      //Waiting for connect - not await in init method
      await snooze(100);

      expect(initialDriver._client.Client.Disconnect).toHaveBeenCalled();
      expect(device.S7Driver._client.Client.ConnectTo).toHaveBeenCalledTimes(1);

      //Driver also should be changed
      expect(device.S7Driver).not.toEqual(initialDriver);
    });

    it("should create new driver and reassign all variables driver if change is associated with ipAdress", async () => {
      editPayload = { ipAdress: "192.164.12.3" };

      //Driver also should be changed
      expect(device.S7Driver).not.toEqual(initialDriver);

      //All getSingleRequest and setSingleRequest of variables should also be changed to new driver
      for (let variable of Object.values(device.Variables)) {
        expect(variable._getSingleRequest.S7Driver).toEqual(device.S7Driver);
        expect(variable._setSingleRequest.S7Driver).toEqual(device.S7Driver);

        expect(variable._getSingleRequest.AreaType).toEqual(variable.AreaType);
        expect(variable._getSingleRequest.DBNumber).toEqual(variable.DBNumber);
        expect(variable._getSingleRequest.Write).toEqual(false);
        expect(
          Object.values(variable._getSingleRequest.VariableConnections).length
        ).toEqual(1);
        expect(
          Object.values(variable._getSingleRequest.VariableConnections)[0]
            .variable
        ).toEqual(variable);

        expect(variable._setSingleRequest.AreaType).toEqual(variable.AreaType);
        expect(variable._setSingleRequest.DBNumber).toEqual(variable.DBNumber);
        expect(variable._setSingleRequest.Write).toEqual(true);
        expect(
          Object.values(variable._setSingleRequest.VariableConnections).length
        ).toEqual(1);
        expect(
          Object.values(variable._setSingleRequest.VariableConnections)[0]
            .variable
        ).toEqual(variable);
      }

      for (let requestGroup of Object.values(device.Requests)) {
        for (let request of requestGroup) {
          expect(request.S7Driver).toEqual(device.S7Driver);
        }
      }
    });

    it("should create new driver and reassign all variables driver if change is associated with rack", async () => {
      editPayload = { rack: 44 };

      //Driver also should be changed
      expect(device.S7Driver).not.toEqual(initialDriver);

      //All getSingleRequest and setSingleRequest of variables should also be changed to new driver
      for (let variable of Object.values(device.Variables)) {
        expect(variable._getSingleRequest.S7Driver).toEqual(device.S7Driver);
        expect(variable._setSingleRequest.S7Driver).toEqual(device.S7Driver);

        expect(variable._getSingleRequest.AreaType).toEqual(variable.AreaType);
        expect(variable._getSingleRequest.DBNumber).toEqual(variable.DBNumber);
        expect(variable._getSingleRequest.Write).toEqual(false);
        expect(
          Object.values(variable._getSingleRequest.VariableConnections).length
        ).toEqual(1);
        expect(
          Object.values(variable._getSingleRequest.VariableConnections)[0]
            .variable
        ).toEqual(variable);

        expect(variable._setSingleRequest.AreaType).toEqual(variable.AreaType);
        expect(variable._setSingleRequest.DBNumber).toEqual(variable.DBNumber);
        expect(variable._setSingleRequest.Write).toEqual(true);
        expect(
          Object.values(variable._setSingleRequest.VariableConnections).length
        ).toEqual(1);
        expect(
          Object.values(variable._setSingleRequest.VariableConnections)[0]
            .variable
        ).toEqual(variable);
      }

      for (let requestGroup of Object.values(device.Requests)) {
        for (let request of requestGroup) {
          expect(request.S7Driver).toEqual(device.S7Driver);
        }
      }
    });

    it("should create new driver and reassign all variables driver if change is associated with timeout", async () => {
      editPayload = { timeout: 44 };

      //Driver also should be changed
      expect(device.S7Driver).not.toEqual(initialDriver);

      //All getSingleRequest and setSingleRequest of variables should also be changed to new driver
      for (let variable of Object.values(device.Variables)) {
        expect(variable._getSingleRequest.S7Driver).toEqual(device.S7Driver);
        expect(variable._setSingleRequest.S7Driver).toEqual(device.S7Driver);

        expect(variable._getSingleRequest.AreaType).toEqual(variable.AreaType);
        expect(variable._getSingleRequest.DBNumber).toEqual(variable.DBNumber);
        expect(variable._getSingleRequest.Write).toEqual(false);
        expect(
          Object.values(variable._getSingleRequest.VariableConnections).length
        ).toEqual(1);
        expect(
          Object.values(variable._getSingleRequest.VariableConnections)[0]
            .variable
        ).toEqual(variable);

        expect(variable._setSingleRequest.AreaType).toEqual(variable.AreaType);
        expect(variable._setSingleRequest.DBNumber).toEqual(variable.DBNumber);
        expect(variable._setSingleRequest.Write).toEqual(true);
        expect(
          Object.values(variable._setSingleRequest.VariableConnections).length
        ).toEqual(1);
        expect(
          Object.values(variable._setSingleRequest.VariableConnections)[0]
            .variable
        ).toEqual(variable);
      }

      for (let requestGroup of Object.values(device.Requests)) {
        for (let request of requestGroup) {
          expect(request.S7Driver).toEqual(device.S7Driver);
        }
      }
    });

    it("should create new driver and reassign all variables driver if change is associated with slot", async () => {
      editPayload = { slot: 44 };

      //Driver also should be changed
      expect(device.S7Driver).not.toEqual(initialDriver);

      //All getSingleRequest and setSingleRequest of variables should also be changed to new driver
      for (let variable of Object.values(device.Variables)) {
        expect(variable._getSingleRequest.S7Driver).toEqual(device.S7Driver);
        expect(variable._setSingleRequest.S7Driver).toEqual(device.S7Driver);

        expect(variable._getSingleRequest.AreaType).toEqual(variable.AreaType);
        expect(variable._getSingleRequest.DBNumber).toEqual(variable.DBNumber);
        expect(variable._getSingleRequest.Write).toEqual(false);
        expect(
          Object.values(variable._getSingleRequest.VariableConnections).length
        ).toEqual(1);
        expect(
          Object.values(variable._getSingleRequest.VariableConnections)[0]
            .variable
        ).toEqual(variable);

        expect(variable._setSingleRequest.AreaType).toEqual(variable.AreaType);
        expect(variable._setSingleRequest.DBNumber).toEqual(variable.DBNumber);
        expect(variable._setSingleRequest.Write).toEqual(true);
        expect(
          Object.values(variable._setSingleRequest.VariableConnections).length
        ).toEqual(1);
        expect(
          Object.values(variable._setSingleRequest.VariableConnections)[0]
            .variable
        ).toEqual(variable);
      }

      for (let requestGroup of Object.values(device.Requests)) {
        for (let request of requestGroup) {
          expect(request.S7Driver).toEqual(device.S7Driver);
        }
      }
    });
  });

  describe("createVariable", () => {
    let device;
    let devicePayload;
    let newVariablePayload;

    beforeEach(async () => {
      setConnectToThrow = false;

      newVariablePayload = {
        id: "varId9",
        name: "testVar9",
        sampleTime: 33,
        archiveSampleTime: 5,
        archived: false,
        unit: "A",
        type: "s7Float",
        areaType: "I",
        write: false,
        dbNumber: 3,
        offset: 20,
        value: 0
      };

      devicePayload = {
        id: "1234",
        name: "testDevice",
        type: "s7Device",
        ipAdress: "192.169.9.12",
        isActive: false,
        rack: 9,
        slot: 8,
        timeout: 100,
        variables: [
          {
            id: "varId1",
            name: "testVar1",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7Int8",
            areaType: "DB",
            write: false,
            dbNumber: 1,
            offset: 1,
            unit: "A"
          },
          {
            id: "varId2",
            name: "testVar2",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7Int16",
            areaType: "DB",
            write: false,
            dbNumber: 1,
            offset: 2,
            unit: "B"
          },
          {
            id: "varId3",
            name: "testVar3",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7Int32",
            areaType: "I",
            write: false,
            dbNumber: 3,
            offset: 3,
            unit: "C"
          },
          {
            id: "varId4",
            name: "testVar4",
            sampleTime: 2,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7UInt8",
            areaType: "I",
            write: true,
            dbNumber: 1,
            offset: 1,
            unit: "D"
          },
          {
            id: "varId5",
            name: "testVar5",
            sampleTime: 2,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7UInt16",
            areaType: "I",
            write: true,
            dbNumber: 1,
            offset: 2,
            unit: "E"
          },
          {
            id: "varId6",
            name: "testVar6",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7UInt32",
            areaType: "Q",
            write: false,
            dbNumber: 3,
            offset: 3,
            unit: "F"
          },
          {
            id: "varId7",
            name: "testVar7",
            sampleTime: 3,
            archiveSampleTime: 2,
            archived: false,
            unit: "G",
            length: 6,
            type: "s7ByteArray",
            areaType: "M",
            write: true,
            dbNumber: 3,
            offset: 3,
            unit: "F"
          },
          {
            id: "varId8",
            name: "testVar8",
            sampleTime: 3,
            archiveSampleTime: 2,
            archived: false,
            unit: "H",
            type: "s7Float",
            areaType: "M",
            write: false,
            dbNumber: 3,
            offset: 13,
            unit: "F"
          }
        ],
        calculationElements: [
          {
            id: "sumElementId1",
            name: "sum element",
            type: "sumElement",
            archived: true,
            unit: "D",
            sampleTime: 1,
            archiveSampleTime: 2,
            variables: [
              {
                id: "varId1",
                factor: 1
              },
              {
                id: "varId2",
                factor: 2
              },
              {
                id: "varId3",
                factor: 3
              }
            ]
          }
        ]
      };
    });

    let exec = async () => {
      device = new S7Device();
      await device.init(devicePayload);
      return device.createVariable(newVariablePayload);
    };

    it("should create new variable based on given payload", async () => {
      await exec();

      expect(Object.values(device.Variables).length).toEqual(9);

      let newVariable = device.getVariable(newVariablePayload.id);

      expect(newVariable.Payload).toEqual(newVariablePayload);
    });

    it("should not add variable to archive manager if archive is true", async () => {
      newVariablePayload.archived = false;

      let result = await exec();

      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should add variable to archive manager if archive is true", async () => {
      newVariablePayload.archived = true;

      let result = await exec();

      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should return created variable", async () => {
      let result = await exec();

      let newVariable = device.getVariable(newVariablePayload.id);
      expect(result).toEqual(newVariable);
    });

    it("should set id if id is not defined in payload", async () => {
      newVariablePayload.id = undefined;

      let result = await exec();

      expect(result.Id).toBeDefined();
    });

    it("should create new request for variable - if variable does not match to current requests - together with creating new sampleTimeRequest group", async () => {
      let result = await exec();

      expect(Object.values(device.Requests).length).toEqual(4);

      expect(device.Requests[33]).toBeDefined();

      expect(device.Requests[33].length).toEqual(1);
      expect(
        Object.values(device.Requests[33][0].VariableConnections).length
      ).toEqual(1);
      expect(
        Object.values(device.Requests[33][0].VariableConnections)[0].variable
      ).toEqual(result);
    });

    it("should create new request for variable - if variable does not match to current requests - add it to existing sample time request group", async () => {
      newVariablePayload.sampleTime = 1;

      let result = await exec();

      expect(Object.values(device.Requests).length).toEqual(3);

      expect(device.Requests[1].length).toEqual(4);

      //Due to offset new variable is not added to the end
      expect(
        Object.values(device.Requests[1][2].VariableConnections).length
      ).toEqual(1);
      expect(
        Object.values(device.Requests[1][2].VariableConnections)[0].variable
      ).toEqual(result);
    });

    it("should not create new request for variable but add it to existing one - if variable matches to current requests", async () => {
      newVariablePayload.sampleTime = 2;
      newVariablePayload.offset = 4;
      newVariablePayload.write = true;
      newVariablePayload.dbNumber = 1;

      let result = await exec();

      expect(Object.values(device.Requests).length).toEqual(3);

      expect(device.Requests[2].length).toEqual(1);
      //Due to offset new variable is not added to the end
      expect(
        Object.values(device.Requests[2][0].VariableConnections).length
      ).toEqual(3);
      expect(
        Object.values(device.Requests[2][0].VariableConnections)[2].variable
      ).toEqual(result);
    });

    it("should create new variable based on given payload - s7Float", async () => {
      newVariablePayload.type = "s7Float";
      await exec();

      expect(Object.values(device.Variables).length).toEqual(9);

      let newVariable = device.getVariable(newVariablePayload.id);

      expect(newVariable.Payload).toEqual(newVariablePayload);
    });

    it("should create new variable based on given payload - s7Int8", async () => {
      newVariablePayload.type = "s7Int8";
      await exec();

      expect(Object.values(device.Variables).length).toEqual(9);

      let newVariable = device.getVariable(newVariablePayload.id);

      expect(newVariable.Payload).toEqual(newVariablePayload);
    });

    it("should create new variable based on given payload - s7Int16", async () => {
      newVariablePayload.type = "s7Int16";
      await exec();

      expect(Object.values(device.Variables).length).toEqual(9);

      let newVariable = device.getVariable(newVariablePayload.id);

      expect(newVariable.Payload).toEqual(newVariablePayload);
    });

    it("should create new variable based on given payload - s7Int32", async () => {
      newVariablePayload.type = "s7Int32";
      await exec();

      expect(Object.values(device.Variables).length).toEqual(9);

      let newVariable = device.getVariable(newVariablePayload.id);

      expect(newVariable.Payload).toEqual(newVariablePayload);
    });

    it("should create new variable based on given payload - s7UInt8", async () => {
      newVariablePayload.type = "s7UInt8";
      await exec();

      expect(Object.values(device.Variables).length).toEqual(9);

      let newVariable = device.getVariable(newVariablePayload.id);

      expect(newVariable.Payload).toEqual(newVariablePayload);
    });

    it("should create new variable based on given payload - s7UInt16", async () => {
      newVariablePayload.type = "s7UInt16";
      await exec();

      expect(Object.values(device.Variables).length).toEqual(9);

      let newVariable = device.getVariable(newVariablePayload.id);

      expect(newVariable.Payload).toEqual(newVariablePayload);
    });

    it("should create new variable based on given payload - s7UInt32", async () => {
      newVariablePayload.type = "s7UInt32";
      await exec();

      expect(Object.values(device.Variables).length).toEqual(9);

      let newVariable = device.getVariable(newVariablePayload.id);

      expect(newVariable.Payload).toEqual(newVariablePayload);
    });

    it("should create new variable based on given payload - s7ByteArray", async () => {
      newVariablePayload.type = "s7ByteArray";
      newVariablePayload.length = 4;
      newVariablePayload.value = [1, 2, 3, 4];
      await exec();

      expect(Object.values(device.Variables).length).toEqual(9);

      let newVariable = device.getVariable(newVariablePayload.id);

      expect(newVariable.Payload).toEqual(newVariablePayload);
    });

    it("should throw and not add variable - if variable type is not recognized", async () => {
      newVariablePayload.type = "fakeType";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if name is not defined - s7Int8", async () => {
      newVariablePayload.name = undefined;
      newVariablePayload.type = "s7Int8";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if sampleTime is not defined - s7Int8", async () => {
      newVariablePayload.sampleTime = undefined;
      newVariablePayload.type = "s7Int8";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7Int8", async () => {
      newVariablePayload.offset = undefined;
      newVariablePayload.type = "s7Int8";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7Int8", async () => {
      newVariablePayload.areaType = undefined;
      newVariablePayload.type = "s7Int8";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if name is not defined - s7Int16", async () => {
      newVariablePayload.name = undefined;
      newVariablePayload.type = "s7Int16";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if sampleTime is not defined - s7Int16", async () => {
      newVariablePayload.sampleTime = undefined;
      newVariablePayload.type = "s7Int16";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7Int16", async () => {
      newVariablePayload.offset = undefined;
      newVariablePayload.type = "s7Int16";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7Int16", async () => {
      newVariablePayload.areaType = undefined;
      newVariablePayload.type = "s7Int16";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if name is not defined - s7Int32", async () => {
      newVariablePayload.name = undefined;
      newVariablePayload.type = "s7Int32";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if sampleTime is not defined - s7Int32", async () => {
      newVariablePayload.sampleTime = undefined;
      newVariablePayload.type = "s7Int32";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7Int32", async () => {
      newVariablePayload.offset = undefined;
      newVariablePayload.type = "s7Int32";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7Int32", async () => {
      newVariablePayload.areaType = undefined;
      newVariablePayload.type = "s7Int32";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if name is not defined - s7UInt8", async () => {
      newVariablePayload.name = undefined;
      newVariablePayload.type = "s7UInt8";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if sampleTime is not defined - s7UInt8", async () => {
      newVariablePayload.sampleTime = undefined;
      newVariablePayload.type = "s7UInt8";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7UInt8", async () => {
      newVariablePayload.offset = undefined;
      newVariablePayload.type = "s7UInt8";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7UInt8", async () => {
      newVariablePayload.areaType = undefined;
      newVariablePayload.type = "s7UInt8";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if name is not defined - s7UInt16", async () => {
      newVariablePayload.name = undefined;
      newVariablePayload.type = "s7UInt16";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if sampleTime is not defined - s7UInt16", async () => {
      newVariablePayload.sampleTime = undefined;
      newVariablePayload.type = "s7UInt16";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7UInt16", async () => {
      newVariablePayload.offset = undefined;
      newVariablePayload.type = "s7UInt16";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7UInt16", async () => {
      newVariablePayload.areaType = undefined;
      newVariablePayload.type = "s7UInt16";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if name is not defined - s7UInt32", async () => {
      newVariablePayload.name = undefined;
      newVariablePayload.type = "s7UInt32";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if sampleTime is not defined - s7UInt32", async () => {
      newVariablePayload.sampleTime = undefined;
      newVariablePayload.type = "s7UInt32";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7UInt32", async () => {
      newVariablePayload.offset = undefined;
      newVariablePayload.type = "s7UInt32";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7UInt32", async () => {
      newVariablePayload.areaType = undefined;
      newVariablePayload.type = "s7UInt32";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if name is not defined - s7Float", async () => {
      newVariablePayload.name = undefined;
      newVariablePayload.type = "s7Float";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if sampleTime is not defined - s7Float", async () => {
      newVariablePayload.sampleTime = undefined;
      newVariablePayload.type = "s7Float";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7Float", async () => {
      newVariablePayload.offset = undefined;
      newVariablePayload.type = "s7Float";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7Float", async () => {
      newVariablePayload.areaType = undefined;
      newVariablePayload.type = "s7Float";

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if name is not defined - s7ByteArray", async () => {
      newVariablePayload.name = undefined;
      newVariablePayload.type = "s7ByteArray";
      newVariablePayload.length = 4;

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if sampleTime is not defined - s7ByteArray", async () => {
      newVariablePayload.sampleTime = undefined;
      newVariablePayload.type = "s7ByteArray";
      newVariablePayload.length = 4;

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7ByteArray", async () => {
      newVariablePayload.offset = undefined;
      newVariablePayload.type = "s7ByteArray";
      newVariablePayload.length = 4;

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if offset is not defined - s7ByteArray", async () => {
      newVariablePayload.areaType = undefined;
      newVariablePayload.type = "s7ByteArray";
      newVariablePayload.length = 4;

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });

    it("should throw and not add variable - if length is not defined - s7ByteArray", async () => {
      newVariablePayload.type = "s7ByteArray";
      newVariablePayload.length = undefined;

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

      expect(Object.values(device.Variables).length).toEqual(8);
    });
  });

  describe("editVariable", () => {
    let device;
    let devicePayload;
    let newVariablePayload;
    let editVariablePayload;
    let newVariable;
    let variableId;

    beforeEach(async () => {
      setConnectToThrow = false;

      newVariablePayload = {
        id: "varId9",
        name: "testVar9",
        sampleTime: 33,
        archiveSampleTime: 5,
        archived: false,
        unit: "A",
        type: "s7Float",
        areaType: "I",
        write: false,
        dbNumber: 3,
        offset: 20,
        value: 0
      };

      editVariablePayload = {
        name: "testVar9Edited",
        sampleTime: 35,
        archiveSampleTime: 6,
        archived: true,
        unit: "B",
        areaType: "M",
        write: true,
        dbNumber: 9,
        offset: 33
      };

      devicePayload = {
        id: "1234",
        name: "testDevice",
        type: "s7Device",
        ipAdress: "192.169.9.12",
        isActive: false,
        rack: 9,
        slot: 8,
        timeout: 100,
        variables: [
          {
            id: "varId1",
            name: "testVar1",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7Int8",
            areaType: "DB",
            write: false,
            dbNumber: 1,
            offset: 1,
            unit: "A"
          },
          {
            id: "varId2",
            name: "testVar2",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7Int16",
            areaType: "DB",
            write: false,
            dbNumber: 1,
            offset: 2,
            unit: "B"
          },
          {
            id: "varId3",
            name: "testVar3",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7Int32",
            areaType: "I",
            write: false,
            dbNumber: 3,
            offset: 3,
            unit: "C"
          },
          {
            id: "varId4",
            name: "testVar4",
            sampleTime: 2,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7UInt8",
            areaType: "I",
            write: true,
            dbNumber: 1,
            offset: 1,
            unit: "D"
          },
          {
            id: "varId5",
            name: "testVar5",
            sampleTime: 2,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7UInt16",
            areaType: "I",
            write: true,
            dbNumber: 1,
            offset: 2,
            unit: "E"
          },
          {
            id: "varId6",
            name: "testVar6",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7UInt32",
            areaType: "Q",
            write: false,
            dbNumber: 3,
            offset: 3,
            unit: "F"
          },
          {
            id: "varId7",
            name: "testVar7",
            sampleTime: 3,
            archiveSampleTime: 2,
            archived: false,
            unit: "G",
            length: 6,
            type: "s7ByteArray",
            areaType: "M",
            write: true,
            dbNumber: 3,
            offset: 3,
            unit: "F"
          },
          {
            id: "varId8",
            name: "testVar8",
            sampleTime: 3,
            archiveSampleTime: 2,
            archived: false,
            unit: "H",
            type: "s7Float",
            areaType: "M",
            write: false,
            dbNumber: 3,
            offset: 13,
            unit: "F"
          }
        ],
        calculationElements: [
          {
            id: "sumElementId1",
            name: "sum element",
            type: "sumElement",
            archived: true,
            unit: "D",
            sampleTime: 1,
            archiveSampleTime: 2,
            variables: [
              {
                id: "varId1",
                factor: 1
              },
              {
                id: "varId2",
                factor: 2
              },
              {
                id: "varId3",
                factor: 3
              }
            ]
          }
        ]
      };

      variableId = newVariablePayload.id;
    });

    let exec = async () => {
      device = new S7Device();
      await device.init(devicePayload);
      newVariable = await device.createVariable(newVariablePayload);
      return device.editVariable(variableId, editVariablePayload);
    };

    it("should throw if there is no variable of given id", async () => {
      variableId = "fakeId";

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

    it("should edit variable based on given payload", async () => {
      let result = await exec();

      expect(newVariable.Payload).toEqual({
        ...newVariablePayload,
        ...editVariablePayload
      });
    });

    it("should edit variables value if it is given in payload and set it in response data to send", async () => {
      newVariablePayload.type = "s7Int16";
      newVariablePayload.write = true;
      editVariablePayload = { value: 5 };

      await exec();

      expect(device.Requests[33][0].DataToSend).toEqual([0, 5]);
    });

    it("should add variable to archive manager if archive is true and was false", async () => {
      newVariablePayload.archived = false;
      editVariablePayload.archived = true;

      let result = await exec();

      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should leave variable in archive manager if archive is true and was true", async () => {
      newVariablePayload.archived = true;
      editVariablePayload.archived = true;

      let result = await exec();

      expect(Object.values(device.ArchiveManager.Variables)).toContain(result);
    });

    it("should not add variable to archive manager if archive is false", async () => {
      newVariablePayload.archived = true;
      editVariablePayload.archived = false;

      let result = await exec();

      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should remove variable from archive manager if archive is false and was true before", async () => {
      newVariablePayload.archived = true;
      editVariablePayload.archived = false;

      let result = await exec();

      expect(Object.values(device.ArchiveManager.Variables)).not.toContain(
        result
      );
    });

    it("should return edited variable", async () => {
      let result = await exec();

      expect(result).toEqual(newVariable);
    });

    it("should create new request for variable - if variable does not match to current requests - together with creating new sampleTimeRequest group", async () => {
      let result = await exec();

      expect(Object.values(device.Requests).length).toEqual(4);

      expect(device.Requests[35]).toBeDefined();

      expect(device.Requests[35].length).toEqual(1);
      expect(
        Object.values(device.Requests[35][0].VariableConnections).length
      ).toEqual(1);
      expect(
        Object.values(device.Requests[35][0].VariableConnections)[0].variable
      ).toEqual(result);
    });

    it("should create new request for variable - if variable does not match to current requests - add it to existing sample time request group", async () => {
      editVariablePayload.sampleTime = 1;

      let result = await exec();

      expect(Object.values(device.Requests).length).toEqual(3);

      expect(device.Requests[1].length).toEqual(4);

      //Due to offset new variable is not added to the end
      expect(
        Object.values(device.Requests[1][3].VariableConnections).length
      ).toEqual(1);
      expect(
        Object.values(device.Requests[1][3].VariableConnections)[0].variable
      ).toEqual(result);
    });

    it("should not create new request for variable but add it to existing one - if variable matches to current requests", async () => {
      editVariablePayload.sampleTime = 2;
      editVariablePayload.offset = 4;
      editVariablePayload.write = true;
      editVariablePayload.dbNumber = 1;
      editVariablePayload.areaType = "I";

      let result = await exec();

      expect(Object.values(device.Requests).length).toEqual(3);

      expect(device.Requests[2].length).toEqual(1);
      //Due to offset new variable is not added to the end
      expect(
        Object.values(device.Requests[2][0].VariableConnections).length
      ).toEqual(3);
      expect(
        Object.values(device.Requests[2][0].VariableConnections)[2].variable
      ).toEqual(result);
    });
  });

  describe("refresh", () => {
    let device;
    let initPayload;
    let tickId;

    beforeEach(async () => {
      setConnectToThrow = false;
      initPayload = {
        id: "1234",
        name: "testDevice",
        type: "s7Device",
        ipAdress: "192.169.9.12",
        isActive: false,
        rack: 9,
        slot: 8,
        timeout: 100,
        variables: [
          {
            id: "varId1",
            name: "testVar1",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7Int8",
            areaType: "DB",
            write: false,
            dbNumber: 1,
            offset: 1,
            unit: "A"
          },
          {
            id: "varId2",
            name: "testVar2",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7Int16",
            areaType: "DB",
            write: false,
            dbNumber: 1,
            offset: 2,
            unit: "B"
          },
          {
            id: "varId3",
            name: "testVar3",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7Int32",
            areaType: "I",
            write: false,
            dbNumber: 3,
            offset: 3,
            unit: "C"
          },
          {
            id: "varId4",
            name: "testVar4",
            sampleTime: 2,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7UInt8",
            areaType: "I",
            write: true,
            dbNumber: 1,
            offset: 1,
            unit: "D",
            value: 6
          },
          {
            id: "varId5",
            name: "testVar5",
            sampleTime: 2,
            archiveSampleTime: 2,
            archived: false,
            unit: "",
            type: "s7UInt16",
            areaType: "I",
            write: true,
            dbNumber: 1,
            offset: 2,
            unit: "E",
            value: 5
          },
          {
            id: "varId6",
            name: "testVar6",
            sampleTime: 1,
            archiveSampleTime: 2,
            archived: true,
            unit: "",
            type: "s7UInt32",
            areaType: "Q",
            write: false,
            dbNumber: 3,
            offset: 3,
            unit: "F"
          },
          {
            id: "varId7",
            name: "testVar7",
            sampleTime: 3,
            archiveSampleTime: 2,
            archived: false,
            unit: "G",
            length: 2,
            type: "s7ByteArray",
            areaType: "M",
            write: true,
            dbNumber: 3,
            offset: 5,
            unit: "F",
            value: [10, 20]
          },
          {
            id: "varId8",
            name: "testVar8",
            sampleTime: 3,
            archiveSampleTime: 2,
            archived: false,
            unit: "H",
            type: "s7Int32",
            areaType: "M",
            write: false,
            dbNumber: 3,
            offset: 1,
            unit: "F"
          }
        ],
        calculationElements: [
          {
            id: "sumElementId1",
            name: "sum element",
            type: "sumElement",
            archived: true,
            unit: "D",
            sampleTime: 1,
            archiveSampleTime: 2,
            variables: [
              {
                id: "varId1",
                factor: 1
              },
              {
                id: "varId2",
                factor: 2
              },
              {
                id: "varId3",
                factor: 3
              }
            ]
          }
        ]
      };

      tickId = 1;
    });

    let exec = async () => {
      device = new S7Device();
      await device.init(initPayload);
      await device.connect();
      return device.refresh(tickId);
    };

    it("should invoke all requests for variables that matches tickId", async () => {
      tickId = 3;

      // requests 1 and 3 matches, requests 2 does not match

      await exec();

      //Checking requests that should be invoked
      expect(device.S7Driver._client.Client.DBRead).toHaveBeenCalledTimes(1);
      expect(device.S7Driver._client.Client.DBRead.mock.calls[0][0]).toEqual(1);
      expect(device.S7Driver._client.Client.DBRead.mock.calls[0][1]).toEqual(1);
      expect(device.S7Driver._client.Client.DBRead.mock.calls[0][2]).toEqual(3);

      expect(device.S7Driver._client.Client.EBRead).toHaveBeenCalledTimes(1);
      expect(device.S7Driver._client.Client.EBRead.mock.calls[0][0]).toEqual(3);
      expect(device.S7Driver._client.Client.EBRead.mock.calls[0][1]).toEqual(4);

      expect(device.S7Driver._client.Client.ABRead).toHaveBeenCalledTimes(1);
      expect(device.S7Driver._client.Client.ABRead.mock.calls[0][0]).toEqual(3);
      expect(device.S7Driver._client.Client.ABRead.mock.calls[0][1]).toEqual(4);

      expect(device.S7Driver._client.Client.MBWrite).toHaveBeenCalledTimes(1);
      expect(device.S7Driver._client.Client.MBWrite.mock.calls[0][0]).toEqual(
        5
      );
      expect(device.S7Driver._client.Client.MBWrite.mock.calls[0][1]).toEqual(
        2
      );
      expect([
        ...device.S7Driver._client.Client.MBWrite.mock.calls[0][2]
      ]).toEqual([10, 20]);

      expect(device.S7Driver._client.Client.MBRead).toHaveBeenCalledTimes(1);
      expect(device.S7Driver._client.Client.MBRead.mock.calls[0][0]).toEqual(1);
      expect(device.S7Driver._client.Client.MBRead.mock.calls[0][1]).toEqual(4);

      //Checking requests that should not be invoked
      expect(device.S7Driver._client.Client.DBWrite).not.toHaveBeenCalled();
      expect(device.S7Driver._client.Client.EBWrite).not.toHaveBeenCalled();
      expect(device.S7Driver._client.Client.ABWrite).not.toHaveBeenCalled();
    });

    it("should archive all values if variable is archived", async () => {
      tickId = 2;

      await exec();

      let allData = await readAllDataFromTable(
        device.ArchiveManager.FilePath,
        "data"
      );

      expect(allData.length).toEqual(1);
      expect(allData[0].date).toEqual(2);
      expect(Object.values(allData[0]).length).toEqual(5);
      //[3 , 4] => 772
      expect(allData[0]["col_varId2"]).toEqual(772);
      //[15,16,17,18] => 252711186
      expect(allData[0]["col_varId3"]).toEqual(252711186);
      //[22, 23, 24, 25] => 370612249
      expect(allData[0]["col_varId6"]).toEqual(370612249);

      expect(allData[0]["col_sumElementId1"]).toEqual(
        2 * 1 + 2 * 772 + 3 * 252711186
      );
    });

    it("should set values in all variables which suits to given id", async () => {
      tickId = 3;

      initPayload.variables[0].value = 1;
      initPayload.variables[1].value = 2;
      initPayload.variables[2].value = 3;
      initPayload.variables[3].value = 4;
      initPayload.variables[4].value = 5;
      initPayload.variables[5].value = 6;
      initPayload.variables[6].value = [1, 2];
      initPayload.variables[7].value = 8;

      await exec();

      let variable1 = device.getVariable("varId1");
      let variable2 = device.getVariable("varId2");
      let variable3 = device.getVariable("varId3");
      let variable4 = device.getVariable("varId4");
      let variable5 = device.getVariable("varId5");
      let variable6 = device.getVariable("varId6");
      let variable7 = device.getVariable("varId7");
      let variable8 = device.getVariable("varId8");

      expect(variable1.Value).toEqual(2);
      expect(variable2.Value).toEqual(772);
      expect(variable3.Value).toEqual(252711186);

      //Write not read
      expect(variable4.Value).toEqual(4);

      //Write not read
      expect(variable5.Value).toEqual(5);

      expect(variable6.Value).toEqual(370612249);

      //Write not read
      expect(variable7.Value).toEqual([1, 2]);

      expect(variable8.Value).toEqual(454827294);
    });

    it("should set values in devices for all variables which suits to given id", async () => {
      tickId = 3;

      initPayload.variables[0].value = 1;
      initPayload.variables[1].value = 2;
      initPayload.variables[2].value = 3;
      initPayload.variables[3].value = 4;
      initPayload.variables[4].value = 5;
      initPayload.variables[5].value = 6;
      initPayload.variables[6].value = [1, 2];
      initPayload.variables[7].value = 8;

      await exec();

      expect(device.S7Driver._client.Client.DBData).toEqual({
        1: [1, 2, 3, 4, 5, 6, 7],
        2: [8, 9, 10, 11, 12, 13, 14],
        3: [15, 16, 17, 18, 19, 20, 21]
      });

      expect(device.S7Driver._client.Client.IData).toEqual([
        12,
        13,
        14,
        15,
        16,
        17,
        18
      ]);

      expect(device.S7Driver._client.Client.QData).toEqual([
        19,
        20,
        21,
        22,
        23,
        24,
        25
      ]);

      expect(device.S7Driver._client.Client.MData).toEqual([
        26,
        27,
        28,
        29,
        30,
        1,
        2
      ]);
    });
  });
});
