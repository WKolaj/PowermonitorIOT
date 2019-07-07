const config = require("config");

let {
  clearDirectoryAsync,
  checkIfTableExists,
  checkIfColumnExists,
  checkIfFileExistsAsync,
  snooze
} = require("../../../utilities/utilities");

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
        sampleTime: 2,
        name: "test variable 1",
        offset: 5,
        length: 1,
        fCode: 3,
        value: 1,
        type: "mbUInt16",
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

describe("CommInterface", () => {
  let db1Path;
  let db2Path;

  //Creating seperate commInterface to all tests
  beforeEach(() => {
    commInterface = require("../../../classes/commInterface/CommInterface.js");
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
    await clearDirectoryAsync(db1Path);
    await clearDirectoryAsync(db2Path);
  });

  describe("constructor", () => {
    it("should set Initialized to false", () => {
      expect(commInterface.Initialized).toBeFalsy();
    });
  });

  describe("assignToProject", () => {
    let project;

    beforeEach(() => {
      project = "testProject";
    });

    let exec = () => {
      return commInterface.assignToProject(project);
    };

    it("should set project to Project property", () => {
      exec();
      expect(commInterface.Project).toEqual(project);
    });
  });

  describe("init", () => {
    let initPayload;

    //Path to primary database
    let db1Path;
    //Path to secondary database
    let db2Path;

    beforeEach(async () => {
      db1Path = config.get("db1Path");
      db2Path = config.get("db2Path");
      initPayload = JSON.parse(testPayload);
    });

    afterEach(async () => {
      await clearDirectoryAsync(db1Path);
      await clearDirectoryAsync(db2Path);
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

    it("should create devices and variables and calculation elements based on given payload", async () => {
      await exec();

      expect(commInterface.Payload).toBeDefined();
      expect(commInterface.Payload).toMatchObject(initPayload);
    });

    it("should create devices and variables and calculation elements based on given payload if there is only one device", async () => {
      let firstDevice = Object.values(initPayload)[0];

      initPayload = {
        [firstDevice.id]: firstDevice
      };

      await exec();

      expect(commInterface.Payload).toBeDefined();
      expect(commInterface.Payload).toMatchObject(initPayload);
    });

    it("should create devices and variables and calculation elements based on given payload if there is empty variables field in devices", async () => {
      let allDevices = Object.values(initPayload);

      for (let device of allDevices) {
        initPayload[device.id].variables = [];
        //variables should be removed also from allSumElements
        if (initPayload[device.id].calculationElements) {
          let allCalcElements = Object.values(
            initPayload[device.id].calculationElements
          );

          for (let element of allCalcElements) {
            element.variables = [];
          }
        }
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

    it("should add all variables to their ArchiveManager - if variable is archived", async () => {
      await exec();

      let allDevicesIds = Object.keys(initPayload);

      for (let deviceId of allDevicesIds) {
        let device = commInterface.getDevice(deviceId);
        let devicePayload = initPayload[deviceId];

        let allVariablesId = devicePayload.variables.map(
          variable => variable.id
        );

        for (let variableId of allVariablesId) {
          let variable = commInterface.getVariable(deviceId, variableId);

          if (variable.Archived) {
            expect(Object.values(device.ArchiveManager.Variables)).toContain(
              variable
            );
          }
        }
      }
    });

    it("should not add any variables to their ArchiveManager - if variable is not archived", async () => {
      await exec();

      let allDevicesIds = Object.keys(initPayload);

      for (let deviceId of allDevicesIds) {
        let device = commInterface.getDevice(deviceId);
        let devicePayload = initPayload[deviceId];

        let allVariablesId = devicePayload.variables.map(
          variable => variable.id
        );

        for (let variableId of allVariablesId) {
          let variable = commInterface.getVariable(deviceId, variableId);

          if (!variable.Archived) {
            expect(
              Object.values(device.ArchiveManager.Variables)
            ).not.toContain(variable);
          }
        }
      }
    });

    it("should add all calculationElements to their ArchiveManager - if calculationElement is archived", async () => {
      await exec();

      let allDevicesIds = Object.keys(initPayload);

      for (let deviceId of allDevicesIds) {
        let device = commInterface.getDevice(deviceId);
        let devicePayload = initPayload[deviceId];

        if (devicePayload.calculationElements) {
          let allCalcElementsId = devicePayload.calculationElements.map(
            element => element.id
          );

          for (let elementId of allCalcElementsId) {
            let calcElement = commInterface.getCalculationElement(
              deviceId,
              elementId
            );

            if (calcElement.Archived) {
              expect(
                Object.values(device.ArchiveManager.CalculationElements)
              ).toContain(calcElement);
            }
          }
        }
      }
    });

    it("should not add any calculationElements to their ArchiveManager - if calculationElement is not archived", async () => {
      await exec();

      let allDevicesIds = Object.keys(initPayload);

      for (let deviceId of allDevicesIds) {
        let device = commInterface.getDevice(deviceId);
        let devicePayload = initPayload[deviceId];

        if (devicePayload.calculationElements) {
          let allCalcElementsId = devicePayload.calculationElements.map(
            element => element.id
          );

          for (let elementId of allCalcElementsId) {
            let calcElement = commInterface.getCalculationElement(
              deviceId,
              elementId
            );

            if (!calcElement.Archived) {
              expect(
                Object.values(device.ArchiveManager.CalculationElements)
              ).not.toContain(calcElement);
            }
          }
        }
      }
    });

    it("should create all database file for all devices", async () => {
      await exec();

      let allDevicesIds = Object.keys(initPayload);

      for (let deviceId of allDevicesIds) {
        let device = commInterface.getDevice(deviceId);

        let fileForDeviceExists = await checkIfFileExistsAsync(
          device.ArchiveManager.FilePath
        );
        expect(fileForDeviceExists).toEqual(true);

        let dataTableForDeviceExists = await checkIfTableExists(
          device.ArchiveManager.FilePath,
          "data"
        );

        expect(dataTableForDeviceExists).toEqual(true);

        let dateColumnForDeviceExists = await checkIfColumnExists(
          device.ArchiveManager.FilePath,
          "data",
          "date",
          "INTEGER"
        );

        expect(dateColumnForDeviceExists).toEqual(true);
      }
    });

    it("should create columns for all variables that are archived", async () => {
      await exec();

      let allDevicesIds = Object.keys(initPayload);

      for (let deviceId of allDevicesIds) {
        let device = commInterface.getDevice(deviceId);
        let devicePayload = initPayload[deviceId];

        let allVariablesId = devicePayload.variables.map(
          variable => variable.id
        );

        for (let variableId of allVariablesId) {
          let variable = commInterface.getVariable(deviceId, variableId);

          if (variable.Archived) {
            let columnName = device.ArchiveManager.getColumnNameById(
              variableId
            );
            let columnType = device.ArchiveManager.getColumnType(variable);

            let columnExists = await checkIfColumnExists(
              device.ArchiveManager.FilePath,
              "data",
              columnName,
              columnType
            );

            expect(columnExists).toBeTruthy();
          }
        }
      }
    });

    it("should not create columns for any variables that are not archived", async () => {
      await exec();

      let allDevicesIds = Object.keys(initPayload);

      for (let deviceId of allDevicesIds) {
        let device = commInterface.getDevice(deviceId);
        let devicePayload = initPayload[deviceId];

        let allVariablesId = devicePayload.variables.map(
          variable => variable.id
        );

        for (let variableId of allVariablesId) {
          let variable = commInterface.getVariable(deviceId, variableId);

          if (!variable.Archived) {
            let columnName = device.ArchiveManager.getColumnNameById(
              variableId
            );
            let columnType = device.ArchiveManager.getColumnType(variable);

            let columnExists = await checkIfColumnExists(
              device.ArchiveManager.FilePath,
              "data",
              columnName,
              columnType
            );

            expect(columnExists).toBeFalsy();
          }
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
    let calculationElements;
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
      calculationElements = undefined;
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
        variables: variables,
        calculationElements: calculationElements
      };

      return commInterface.createNewDevice(payload);
    };

    it("should create a new MBDevice based on given arguments", async () => {
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
      expect(device.CalculationElements).toMatchObject({});
    });

    it("should create a new PAC3200TCP based on given arguments", async () => {
      deviceType = "PAC3200TCP";
      variables = [];
      calculationElements = [];

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
    });

    it("should throw if payload is undefined", async () => {
      await commInterface.init();

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await commInterface.createNewDevice();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
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

    it("should create a new modbus device together with its variables and calculationElements if they are given", async () => {
      let varaible1Payload = {
        id: "1234",
        sampleTime: 2,
        name: "test variable 1",
        type: "mbInt16",
        offset: 2,
        fCode: 3,
        value: 1234,
        archived: true
      };
      let varaible2Payload = {
        id: "1235",
        sampleTime: 3,
        name: "test variable 2",
        type: "mbBoolean",
        offset: 1,
        fCode: 1,
        value: true,
        archived: false
      };
      let varaible3Payload = {
        id: "1236",
        sampleTime: 4,
        name: "test variable 3",
        type: "mbInt32",
        offset: 5,
        fCode: 4,
        value: 4321,
        archived: true
      };

      let calculationElement1Payload = {
        id: "2001",
        sampleTime: 1,
        type: "sumElement",
        archived: true,
        unit: "A",
        name: "sumElement1",
        variables: [
          {
            id: "1234",
            factor: 2
          },
          {
            id: "1235",
            factor: 3
          }
        ]
      };

      let calculationElement2Payload = {
        id: "2002",
        sampleTime: 2,
        type: "sumElement",
        archived: true,
        unit: "A",
        name: "sumElement2",
        variables: [
          {
            id: "1235",
            factor: 2
          },
          {
            id: "1236",
            factor: 3
          }
        ]
      };

      variables = [varaible1Payload, varaible2Payload, varaible3Payload];
      calculationElements = [
        calculationElement1Payload,
        calculationElement2Payload
      ];

      let device = await exec();

      expect(device.Variables).toBeDefined();
      let allVariables = Object.values(device.Variables);

      expect(allVariables.length).toEqual(3);
      expect(allVariables[0].Id).toEqual(varaible1Payload.id);
      expect(allVariables[0].SampleTime).toEqual(varaible1Payload.sampleTime);
      expect(allVariables[0].Name).toEqual(varaible1Payload.name);
      expect(allVariables[0].Type).toEqual(varaible1Payload.type);
      expect(allVariables[0].Offset).toEqual(varaible1Payload.offset);
      expect(allVariables[0].FCode).toEqual(varaible1Payload.fCode);
      expect(allVariables[0].Value).toEqual(varaible1Payload.value);

      expect(allVariables[1].Id).toEqual(varaible2Payload.id);
      expect(allVariables[1].SampleTime).toEqual(varaible2Payload.sampleTime);
      expect(allVariables[1].Name).toEqual(varaible2Payload.name);
      expect(allVariables[1].Type).toEqual(varaible2Payload.type);
      expect(allVariables[1].Offset).toEqual(varaible2Payload.offset);
      expect(allVariables[1].FCode).toEqual(varaible2Payload.fCode);
      expect(allVariables[1].Value).toEqual(varaible2Payload.value);

      expect(allVariables[2].Id).toEqual(varaible3Payload.id);
      expect(allVariables[2].SampleTime).toEqual(varaible3Payload.sampleTime);
      expect(allVariables[2].Name).toEqual(varaible3Payload.name);
      expect(allVariables[2].Type).toEqual(varaible3Payload.type);
      expect(allVariables[2].Offset).toEqual(varaible3Payload.offset);
      expect(allVariables[2].FCode).toEqual(varaible3Payload.fCode);
      expect(allVariables[2].Value).toEqual(varaible3Payload.value);
      expect(device.Variables).toBeDefined();

      let allCalcElements = Object.values(device.CalculationElements);

      expect(allCalcElements.length).toEqual(2);
      expect(allCalcElements[0].Id).toEqual(calculationElement1Payload.id);
      expect(allCalcElements[0].SampleTime).toEqual(
        calculationElement1Payload.sampleTime
      );
      expect(allCalcElements[0].Name).toEqual(calculationElement1Payload.name);
      expect(allCalcElements[0].Type).toEqual(calculationElement1Payload.type);
      expect(allCalcElements[0].Unit).toEqual(calculationElement1Payload.unit);
      expect(allCalcElements[0].Archived).toEqual(
        calculationElement1Payload.archived
      );

      expect(allCalcElements[1].Id).toEqual(calculationElement2Payload.id);
      expect(allCalcElements[1].SampleTime).toEqual(
        calculationElement2Payload.sampleTime
      );
      expect(allCalcElements[1].Name).toEqual(calculationElement2Payload.name);
      expect(allCalcElements[1].Type).toEqual(calculationElement2Payload.type);
      expect(allCalcElements[1].Unit).toEqual(calculationElement2Payload.unit);
      expect(allCalcElements[1].Archived).toEqual(
        calculationElement2Payload.archived
      );
    });

    it("should create a new device together with its variables and calculationElements if they are given - and create their ids if not given", async () => {
      let varaible1Payload = {
        sampleTime: 2,
        name: "test variable 1",
        type: "mbInt16",
        offset: 2,
        fCode: 3,
        archived: true
      };
      let varaible2Payload = {
        sampleTime: 3,
        name: "test variable 2",
        type: "mbBoolean",
        offset: 1,
        fCode: 1,
        archived: false
      };
      let varaible3Payload = {
        sampleTime: 4,
        name: "test variable 3",
        type: "mbInt32",
        offset: 5,
        fCode: 4,
        archived: true
      };

      let calculationElement1Payload = {
        sampleTime: 1,
        type: "sumElement",
        archived: true,
        unit: "A",
        name: "sumElement1",
        variables: []
      };

      let calculationElement2Payload = {
        sampleTime: 2,
        type: "sumElement",
        archived: true,
        unit: "A",
        name: "sumElement2",
        variables: []
      };

      variables = [varaible1Payload, varaible2Payload, varaible3Payload];
      calculationElements = [
        calculationElement1Payload,
        calculationElement2Payload
      ];

      let device = await exec();

      expect(device.Variables).toBeDefined();
      let allVariables = Object.values(device.Variables);

      expect(allVariables.length).toEqual(3);
      expect(allVariables[0].Id).toBeDefined();
      expect(allVariables[0].SampleTime).toEqual(varaible1Payload.sampleTime);
      expect(allVariables[0].Name).toEqual(varaible1Payload.name);
      expect(allVariables[0].Type).toEqual(varaible1Payload.type);
      expect(allVariables[0].Offset).toEqual(varaible1Payload.offset);
      expect(allVariables[0].FCode).toEqual(varaible1Payload.fCode);

      expect(allVariables[1].Id).toBeDefined();
      expect(allVariables[1].SampleTime).toEqual(varaible2Payload.sampleTime);
      expect(allVariables[1].Name).toEqual(varaible2Payload.name);
      expect(allVariables[1].Type).toEqual(varaible2Payload.type);
      expect(allVariables[1].Offset).toEqual(varaible2Payload.offset);
      expect(allVariables[1].FCode).toEqual(varaible2Payload.fCode);

      expect(allVariables[2].Id).toBeDefined();
      expect(allVariables[2].SampleTime).toEqual(varaible3Payload.sampleTime);
      expect(allVariables[2].Name).toEqual(varaible3Payload.name);
      expect(allVariables[2].Type).toEqual(varaible3Payload.type);
      expect(allVariables[2].Offset).toEqual(varaible3Payload.offset);
      expect(allVariables[2].FCode).toEqual(varaible3Payload.fCode);

      let allCalcElements = Object.values(device.CalculationElements);

      expect(allCalcElements.length).toEqual(2);
      expect(allCalcElements[0].Id).toBeDefined();
      expect(allCalcElements[0].SampleTime).toEqual(
        calculationElement1Payload.sampleTime
      );
      expect(allCalcElements[0].Name).toEqual(calculationElement1Payload.name);
      expect(allCalcElements[0].Type).toEqual(calculationElement1Payload.type);
      expect(allCalcElements[0].Unit).toEqual(calculationElement1Payload.unit);
      expect(allCalcElements[0].Archived).toEqual(
        calculationElement1Payload.archived
      );

      expect(allCalcElements[1].Id).toBeDefined();
      expect(allCalcElements[1].SampleTime).toEqual(
        calculationElement2Payload.sampleTime
      );
      expect(allCalcElements[1].Name).toEqual(calculationElement2Payload.name);
      expect(allCalcElements[1].Type).toEqual(calculationElement2Payload.type);
      expect(allCalcElements[1].Unit).toEqual(calculationElement2Payload.unit);
      expect(allCalcElements[1].Archived).toEqual(
        calculationElement2Payload.archived
      );
    });

    it("should create a new device together with its variables if they are given - and set default values if they are not given", async () => {
      let varaible1Payload = {
        sampleTime: 2,
        name: "test variable 1",
        type: "mbInt16",
        offset: 2,
        fCode: 3,
        archived: true
      };
      let varaible2Payload = {
        sampleTime: 3,
        name: "test variable 2",
        type: "mbBoolean",
        offset: 1,
        fCode: 1,
        archived: false
      };
      let varaible3Payload = {
        sampleTime: 4,
        name: "test variable 3",
        type: "mbInt32",
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
      expect(allVariables[0].SampleTime).toEqual(varaible1Payload.sampleTime);
      expect(allVariables[0].Name).toEqual(varaible1Payload.name);
      expect(allVariables[0].Type).toEqual(varaible1Payload.type);
      expect(allVariables[0].Offset).toEqual(varaible1Payload.offset);
      expect(allVariables[0].FCode).toEqual(varaible1Payload.fCode);
      expect(allVariables[0].Value).toEqual(0);

      expect(allVariables[1].Id).toEqual(varaible2Payload.id);
      expect(allVariables[1].SampleTime).toEqual(varaible2Payload.sampleTime);
      expect(allVariables[1].Name).toEqual(varaible2Payload.name);
      expect(allVariables[1].Type).toEqual(varaible2Payload.type);
      expect(allVariables[1].Offset).toEqual(varaible2Payload.offset);
      expect(allVariables[1].FCode).toEqual(varaible2Payload.fCode);
      expect(allVariables[1].Value).toEqual(false);

      expect(allVariables[2].Id).toEqual(varaible3Payload.id);
      expect(allVariables[2].SampleTime).toEqual(varaible3Payload.sampleTime);
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
        sampleTime: 2,
        name: "mbInt16",
        type: "not recongized type",
        offset: 2,
        fCode: 3
      };
      let varaible2Payload = {
        id: "1235",
        sampleTime: 3,
        name: "test variable 2",
        type: "NOT RECONGIZED TYPE",
        offset: 1,
        fCode: 1
      };
      let varaible3Payload = {
        id: "1236",
        sampleTime: 4,
        name: "test variable 3",
        type: "mbInt32",
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

    let device1CalculationElements;
    let device2CalculationElements;

    let device1;
    let device2;

    let variable1Payload;
    let variable1Id;
    let variable1SampleTime;
    let variable1Name;
    let variable1Type;
    let variable1Offset;
    let variable1FCode;
    let variable1Value;

    let variable2Payload;
    let variable2Id;
    let variable2SampleTime;
    let variable2Name;
    let variable2Type;
    let variable2Offset;
    let variable2FCode;
    let variable2Value;

    let variable3Payload;
    let variable3Id;
    let variable3SampleTime;
    let variable3Name;
    let variable3Type;
    let variable3Offset;
    let variable3FCode;
    let variable3Value;

    let variable4Payload;
    let variable4Id;
    let variable4SampleTime;
    let variable4Name;
    let variable4Type;
    let variable4Offset;
    let variable4FCode;
    let variable4Value;

    let variable5Payload;
    let variable5Id;
    let variable5SampleTime;
    let variable5Name;
    let variable5Type;
    let variable5Offset;
    let variable5FCode;
    let variable5Value;

    let variable6Payload;
    let variable6Id;
    let variable6SampleTime;
    let variable6Name;
    let variable6Type;
    let variable6Offset;
    let variable6FCode;
    let variable6Value;

    let sumElement1Payload;
    let sumElement1Id;
    let sumElement1SampleTime;
    let sumElement1Name;
    let sumElement1Type;
    let sumElement1Archived;
    let sumElement1Value;

    let sumElement2Payload;
    let sumElement2Id;
    let sumElement2SampleTime;
    let sumElement2Name;
    let sumElement2Type;
    let sumElement2Archived;
    let sumElement2Value;

    let sumElement3Payload;
    let sumElement3Id;
    let sumElement3SampleTime;
    let sumElement3Name;
    let sumElement3Type;
    let sumElement3Archived;
    let sumElement3Value;

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
      variable1SampleTime = 2;
      variable1Name = "test variable 1";
      variable1Type = "mbInt16";
      variable1Offset = 5;
      variable1FCode = 3;
      variable1Value = 1;

      variable2Id = "0002";
      variable2SampleTime = 3;
      variable2Name = "test variable 2";
      variable2Type = "mbInt32";
      variable2Offset = 6;
      variable2FCode = 4;
      variable2Value = 2;

      variable3Id = "0003";
      variable3SampleTime = 4;
      variable3Name = "test variable 3";
      variable3Type = "mbFloat";
      variable3Offset = 7;
      variable3FCode = 16;
      variable3Value = 3;

      variable4Id = "0004";
      variable4SampleTime = 2;
      variable4Name = "test variable 4";
      variable4Type = "mbBoolean";
      variable4Offset = 5;
      variable4FCode = 1;
      variable4Value = true;

      variable5Id = "0005";
      variable5SampleTime = 3;
      variable5Name = "test variable 5";
      variable5Type = "mbInt32";
      variable5Offset = 6;
      variable5FCode = 4;
      variable5Value = 5;

      variable6Id = "0006";
      variable6SampleTime = 4;
      variable6Name = "test variable 6";
      variable6Type = "mbFloat";
      variable6Offset = 7;
      variable6FCode = 16;
      variable6Value = 6;

      sumElement1Id = "1001";
      sumElement1SampleTime = 1;
      sumElement1Name = "sumElement1";
      sumElement1Type = "sumElement";
      sumElement1Archived = false;
      sumElement1Value = 123;

      sumElement2Id = "1002";
      sumElement2SampleTime = 2;
      sumElement2Name = "sumElement2";
      sumElement2Type = "sumElement";
      sumElement2Archived = false;
      sumElement2Value = 321;

      sumElement3Id = "1003";
      sumElement3SampleTime = 3;
      sumElement3Name = "sumElement3";
      sumElement3Type = "sumElement";
      sumElement3Archived = false;
      sumElement3Value = 1234;
    });

    let exec = async () => {
      await commInterface.init();

      variable1Payload = {
        id: variable1Id,
        sampleTime: variable1SampleTime,
        name: variable1Name,
        type: variable1Type,
        offset: variable1Offset,
        fCode: variable1FCode,
        value: variable1Value
      };

      variable2Payload = {
        id: variable2Id,
        sampleTime: variable2SampleTime,
        name: variable2Name,
        type: variable2Type,
        offset: variable2Offset,
        fCode: variable2FCode,
        value: variable2Value
      };

      variable3Payload = {
        id: variable3Id,
        sampleTime: variable3SampleTime,
        name: variable3Name,
        type: variable3Type,
        offset: variable3Offset,
        fCode: variable3FCode,
        value: variable3Value
      };

      variable4Payload = {
        id: variable4Id,
        sampleTime: variable4SampleTime,
        name: variable4Name,
        type: variable4Type,
        offset: variable4Offset,
        fCode: variable4FCode,
        value: variable4Value
      };

      variable5Payload = {
        id: variable5Id,
        sampleTime: variable5SampleTime,
        name: variable5Name,
        type: variable5Type,
        offset: variable5Offset,
        fCode: variable5FCode,
        value: variable5Value
      };

      variable6Payload = {
        id: variable6Id,
        sampleTime: variable6SampleTime,
        name: variable6Name,
        type: variable6Type,
        offset: variable6Offset,
        fCode: variable6FCode,
        value: variable6Value
      };

      sumElement1Payload = {
        id: sumElement1Id,
        name: sumElement1Name,
        type: sumElement1Type,
        archived: sumElement1Archived,
        sampleTime: sumElement1SampleTime
      };

      sumElement2Payload = {
        id: sumElement2Id,
        name: sumElement2Name,
        type: sumElement2Type,
        archived: sumElement2Archived,
        sampleTime: sumElement2SampleTime
      };

      sumElement3Payload = {
        id: sumElement3Id,
        name: sumElement3Name,
        type: sumElement3Type,
        archived: sumElement3Archived,
        sampleTime: sumElement3SampleTime
      };

      device1Variables = [variable1Payload, variable2Payload, variable3Payload];

      device2Variables = [variable4Payload, variable5Payload, variable6Payload];

      device1CalculationElements = [sumElement1Payload];
      device2CalculationElements = [sumElement2Payload, sumElement3Payload];

      device1Payload = {
        id: device1Id,
        name: device1Name,
        type: deviceType,
        ipAdress: device1Adress,
        portNumber: device1PortNumber,
        timeout: device1Timeout,
        unitId: device1UnitId,
        isActive: device1IsActive,
        variables: device1Variables,
        calculationElements: device1CalculationElements
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
        variables: device2Variables,
        calculationElements: device2CalculationElements
      };

      device1 = await commInterface.createNewDevice(device1Payload);
      device2 = await commInterface.createNewDevice(device2Payload);

      if (sumElement1Value)
        device1.CalculationElements[sumElement1Id].Value = sumElement1Value;

      if (sumElement2Value)
        device2.CalculationElements[sumElement2Id].Value = sumElement2Value;

      if (sumElement3Value)
        device2.CalculationElements[sumElement3Id].Value = sumElement3Value;

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
          },
          calculationElements: {
            "1001": { name: "sumElement1", value: 123 }
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
          },
          calculationElements: {
            "1002": { name: "sumElement2", value: 321 },
            "1003": { name: "sumElement3", value: 1234 }
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
        sampleTime: variable4SampleTime,
        name: variable4Name,
        type: variable4Type,
        offset: variable4Offset,
        fCode: variable4FCode,
        value: variable4Value
      };

      variable5Payload = {
        id: variable5Id,
        sampleTime: variable5SampleTime,
        name: variable5Name,
        type: variable5Type,
        offset: variable5Offset,
        fCode: variable5FCode,
        value: variable5Value
      };

      variable6Payload = {
        id: variable6Id,
        sampleTime: variable6SampleTime,
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

    it("should return valid object if one of device does not have any calculation elements", async () => {
      await commInterface.init();

      variable1Payload = {
        id: variable1Id,
        sampleTime: variable1SampleTime,
        name: variable1Name,
        type: variable1Type,
        offset: variable1Offset,
        fCode: variable1FCode,
        value: variable1Value
      };

      variable2Payload = {
        id: variable2Id,
        sampleTime: variable2SampleTime,
        name: variable2Name,
        type: variable2Type,
        offset: variable2Offset,
        fCode: variable2FCode,
        value: variable2Value
      };

      variable3Payload = {
        id: variable3Id,
        sampleTime: variable3SampleTime,
        name: variable3Name,
        type: variable3Type,
        offset: variable3Offset,
        fCode: variable3FCode,
        value: variable3Value
      };

      variable4Payload = {
        id: variable4Id,
        sampleTime: variable4SampleTime,
        name: variable4Name,
        type: variable4Type,
        offset: variable4Offset,
        fCode: variable4FCode,
        value: variable4Value
      };

      variable5Payload = {
        id: variable5Id,
        sampleTime: variable5SampleTime,
        name: variable5Name,
        type: variable5Type,
        offset: variable5Offset,
        fCode: variable5FCode,
        value: variable5Value
      };

      variable6Payload = {
        id: variable6Id,
        sampleTime: variable6SampleTime,
        name: variable6Name,
        type: variable6Type,
        offset: variable6Offset,
        fCode: variable6FCode,
        value: variable6Value
      };

      sumElement2Payload = {
        id: sumElement2Id,
        name: sumElement2Name,
        type: sumElement2Type,
        archived: sumElement2Archived,
        sampleTime: sumElement2SampleTime
      };

      sumElement3Payload = {
        id: sumElement3Id,
        name: sumElement3Name,
        type: sumElement3Type,
        archived: sumElement3Archived,
        sampleTime: sumElement3SampleTime
      };

      device1Variables = [variable1Payload, variable2Payload, variable3Payload];

      device2Variables = [variable4Payload, variable5Payload, variable6Payload];

      device2CalculationElements = [sumElement2Payload, sumElement3Payload];

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
        variables: device2Variables,
        calculationElements: device2CalculationElements
      };

      device1 = await commInterface.createNewDevice(device1Payload);
      device2 = await commInterface.createNewDevice(device2Payload);

      if (sumElement2Value)
        device2.CalculationElements[sumElement2Id].Value = sumElement2Value;

      if (sumElement3Value)
        device2.CalculationElements[sumElement3Id].Value = sumElement3Value;

      let result = commInterface.getMainData();

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
          },
          calculationElements: {}
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
          },
          calculationElements: {
            "1002": { name: "sumElement2", value: 321 },
            "1003": { name: "sumElement3", value: 1234 }
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
    let variable1SampleTime;
    let variable1Name;
    let variable1Type;
    let variable1Offset;
    let variable1FCode;
    let variable1Value;

    let variable2Payload;
    let variable2Id;
    let variable2SampleTime;
    let variable2Name;
    let variable2Type;
    let variable2Offset;
    let variable2FCode;
    let variable2Value;

    let variable3Payload;
    let variable3Id;
    let variable3SampleTime;
    let variable3Name;
    let variable3Type;
    let variable3Offset;
    let variable3FCode;
    let variable3Value;

    let variable4Payload;
    let variable4Id;
    let variable4SampleTime;
    let variable4Name;
    let variable4Type;
    let variable4Offset;
    let variable4FCode;
    let variable4Value;

    let variable5Payload;
    let variable5Id;
    let variable5SampleTime;
    let variable5Name;
    let variable5Type;
    let variable5Offset;
    let variable5FCode;
    let variable5Value;

    let variable6Payload;
    let variable6Id;
    let variable6SampleTime;
    let variable6Name;
    let variable6Type;
    let variable6Offset;
    let variable6FCode;
    let variable6Value;

    let sumElement1Payload;
    let sumElement1Id;
    let sumElement1SampleTime;
    let sumElement1Name;
    let sumElement1Type;
    let sumElement1Archived;
    let sumElement1Value;

    let sumElement2Payload;
    let sumElement2Id;
    let sumElement2SampleTime;
    let sumElement2Name;
    let sumElement2Type;
    let sumElement2Archived;
    let sumElement2Value;

    let sumElement3Payload;
    let sumElement3Id;
    let sumElement3SampleTime;
    let sumElement3Name;
    let sumElement3Type;
    let sumElement3Archived;
    let sumElement3Value;

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
      variable1SampleTime = 2;
      variable1Name = "test variable 1";
      variable1Type = "mbInt16";
      variable1Offset = 5;
      variable1FCode = 3;
      variable1Value = 1;

      variable2Id = "0002";
      variable2SampleTime = 3;
      variable2Name = "test variable 2";
      variable2Type = "mbInt32";
      variable2Offset = 6;
      variable2FCode = 4;
      variable2Value = 2;

      variable3Id = "0003";
      variable3SampleTime = 4;
      variable3Name = "test variable 3";
      variable3Type = "mbFloat";
      variable3Offset = 7;
      variable3FCode = 16;
      variable3Value = 3;

      variable4Id = "0004";
      variable4SampleTime = 2;
      variable4Name = "test variable 4";
      variable4Type = "mbBoolean";
      variable4Offset = 5;
      variable4FCode = 1;
      variable4Value = true;

      variable5Id = "0005";
      variable5SampleTime = 3;
      variable5Name = "test variable 5";
      variable5Type = "mbInt32";
      variable5Offset = 6;
      variable5FCode = 4;
      variable5Value = 5;

      variable6Id = "0006";
      variable6SampleTime = 4;
      variable6Name = "test variable 6";
      variable6Type = "mbFloat";
      variable6Offset = 7;
      variable6FCode = 16;
      variable6Value = 6;

      sumElement1Id = "1001";
      sumElement1SampleTime = 1;
      sumElement1Name = "sumElement1";
      sumElement1Type = "sumElement";
      sumElement1Archived = false;
      sumElement1Value = 123;

      sumElement2Id = "1002";
      sumElement2SampleTime = 2;
      sumElement2Name = "sumElement2";
      sumElement2Type = "sumElement";
      sumElement2Archived = false;
      sumElement2Value = 321;

      sumElement3Id = "1003";
      sumElement3SampleTime = 3;
      sumElement3Name = "sumElement3";
      sumElement3Type = "sumElement";
      sumElement3Archived = false;
      sumElement3Value = 1234;
    });

    let exec = async () => {
      await commInterface.init();

      variable1Payload = {
        id: variable1Id,
        sampleTime: variable1SampleTime,
        name: variable1Name,
        type: variable1Type,
        offset: variable1Offset,
        fCode: variable1FCode,
        value: variable1Value
      };

      variable2Payload = {
        id: variable2Id,
        sampleTime: variable2SampleTime,
        name: variable2Name,
        type: variable2Type,
        offset: variable2Offset,
        fCode: variable2FCode,
        value: variable2Value
      };

      variable3Payload = {
        id: variable3Id,
        sampleTime: variable3SampleTime,
        name: variable3Name,
        type: variable3Type,
        offset: variable3Offset,
        fCode: variable3FCode,
        value: variable3Value
      };

      variable4Payload = {
        id: variable4Id,
        sampleTime: variable4SampleTime,
        name: variable4Name,
        type: variable4Type,
        offset: variable4Offset,
        fCode: variable4FCode,
        value: variable4Value
      };

      variable5Payload = {
        id: variable5Id,
        sampleTime: variable5SampleTime,
        name: variable5Name,
        type: variable5Type,
        offset: variable5Offset,
        fCode: variable5FCode,
        value: variable5Value
      };

      variable6Payload = {
        id: variable6Id,
        sampleTime: variable6SampleTime,
        name: variable6Name,
        type: variable6Type,
        offset: variable6Offset,
        fCode: variable6FCode,
        value: variable6Value
      };

      sumElement1Payload = {
        id: sumElement1Id,
        name: sumElement1Name,
        type: sumElement1Type,
        archived: sumElement1Archived,
        sampleTime: sumElement1SampleTime
      };

      sumElement2Payload = {
        id: sumElement2Id,
        name: sumElement2Name,
        type: sumElement2Type,
        archived: sumElement2Archived,
        sampleTime: sumElement2SampleTime
      };

      sumElement3Payload = {
        id: sumElement3Id,
        name: sumElement3Name,
        type: sumElement3Type,
        archived: sumElement3Archived,
        sampleTime: sumElement3SampleTime
      };

      device1Variables = [variable1Payload, variable2Payload, variable3Payload];

      device2Variables = [variable4Payload, variable5Payload, variable6Payload];

      device1CalculationElements = [sumElement1Payload];
      device2CalculationElements = [sumElement2Payload, sumElement3Payload];

      device1Payload = {
        id: device1Id,
        name: device1Name,
        type: deviceType,
        ipAdress: device1Adress,
        portNumber: device1PortNumber,
        timeout: device1Timeout,
        unitId: device1UnitId,
        isActive: device1IsActive,
        variables: device1Variables,
        calculationElements: device1CalculationElements
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
        variables: device2Variables,
        calculationElements: device2CalculationElements
      };

      device1 = await commInterface.createNewDevice(device1Payload);
      device2 = await commInterface.createNewDevice(device2Payload);

      if (sumElement1Value)
        device1.CalculationElements[sumElement1Id].Value = sumElement1Value;

      if (sumElement2Value)
        device2.CalculationElements[sumElement2Id].Value = sumElement2Value;

      if (sumElement3Value)
        device2.CalculationElements[sumElement3Id].Value = sumElement3Value;

      return commInterface.getAllValues();
    };

    it("should return all devicesIds, variableIds and their values", async () => {
      let result = await exec();

      let validResult = {
        "1234": {
          "0001": 1,

          "0002": 2,

          "0003": 3,

          "1001": 123
        },
        "1235": {
          "0004": true,
          "0005": 5,
          "0006": 6,
          "1002": 321,
          "1003": 1234
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
        sampleTime: variable4SampleTime,
        name: variable4Name,
        type: variable4Type,
        offset: variable4Offset,
        fCode: variable4FCode,
        value: variable4Value
      };

      variable5Payload = {
        id: variable5Id,
        sampleTime: variable5SampleTime,
        name: variable5Name,
        type: variable5Type,
        offset: variable5Offset,
        fCode: variable5FCode,
        value: variable5Value
      };

      variable6Payload = {
        id: variable6Id,
        sampleTime: variable6SampleTime,
        name: variable6Name,
        type: variable6Type,
        offset: variable6Offset,
        fCode: variable6FCode,
        value: variable6Value
      };

      sumElement1Payload = {
        id: sumElement1Id,
        name: sumElement1Name,
        type: sumElement1Type,
        archived: sumElement1Archived,
        sampleTime: sumElement1SampleTime
      };

      sumElement2Payload = {
        id: sumElement2Id,
        name: sumElement2Name,
        type: sumElement2Type,
        archived: sumElement2Archived,
        sampleTime: sumElement2SampleTime
      };

      sumElement3Payload = {
        id: sumElement3Id,
        name: sumElement3Name,
        type: sumElement3Type,
        archived: sumElement3Archived,
        sampleTime: sumElement3SampleTime
      };

      device2Variables = [variable4Payload, variable5Payload, variable6Payload];

      device1CalculationElements = [sumElement1Payload];
      device2CalculationElements = [sumElement2Payload, sumElement3Payload];

      device1Payload = {
        id: device1Id,
        name: device1Name,
        type: deviceType,
        ipAdress: device1Adress,
        portNumber: device1PortNumber,
        timeout: device1Timeout,
        unitId: device1UnitId,
        isActive: device1IsActive,
        variables: device1Variables,
        calculationElements: device1CalculationElements
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
        variables: device2Variables,
        calculationElements: device2CalculationElements
      };

      device1 = await commInterface.createNewDevice(device1Payload);
      device2 = await commInterface.createNewDevice(device2Payload);

      if (sumElement1Value)
        device1.CalculationElements[sumElement1Id].Value = sumElement1Value;

      if (sumElement2Value)
        device2.CalculationElements[sumElement2Id].Value = sumElement2Value;

      if (sumElement3Value)
        device2.CalculationElements[sumElement3Id].Value = sumElement3Value;

      let result = commInterface.getAllValues();

      let validResult = {
        "1234": {
          "1001": 123
        },
        "1235": {
          "0004": true,
          "0005": 5,
          "0006": 6,
          "1002": 321,
          "1003": 1234
        }
      };
      expect(result).toBeDefined();
      expect(result).toMatchObject(validResult);
    });

    it("should return valid object if one of device does not have any calculationElement", async () => {
      await commInterface.init();

      variable1Payload = {
        id: variable1Id,
        sampleTime: variable1SampleTime,
        name: variable1Name,
        type: variable1Type,
        offset: variable1Offset,
        fCode: variable1FCode,
        value: variable1Value
      };

      variable2Payload = {
        id: variable2Id,
        sampleTime: variable2SampleTime,
        name: variable2Name,
        type: variable2Type,
        offset: variable2Offset,
        fCode: variable2FCode,
        value: variable2Value
      };

      variable3Payload = {
        id: variable3Id,
        sampleTime: variable3SampleTime,
        name: variable3Name,
        type: variable3Type,
        offset: variable3Offset,
        fCode: variable3FCode,
        value: variable3Value
      };

      variable4Payload = {
        id: variable4Id,
        sampleTime: variable4SampleTime,
        name: variable4Name,
        type: variable4Type,
        offset: variable4Offset,
        fCode: variable4FCode,
        value: variable4Value
      };

      variable5Payload = {
        id: variable5Id,
        sampleTime: variable5SampleTime,
        name: variable5Name,
        type: variable5Type,
        offset: variable5Offset,
        fCode: variable5FCode,
        value: variable5Value
      };

      variable6Payload = {
        id: variable6Id,
        sampleTime: variable6SampleTime,
        name: variable6Name,
        type: variable6Type,
        offset: variable6Offset,
        fCode: variable6FCode,
        value: variable6Value
      };

      sumElement2Payload = {
        id: sumElement2Id,
        name: sumElement2Name,
        type: sumElement2Type,
        archived: sumElement2Archived,
        sampleTime: sumElement2SampleTime
      };

      sumElement3Payload = {
        id: sumElement3Id,
        name: sumElement3Name,
        type: sumElement3Type,
        archived: sumElement3Archived,
        sampleTime: sumElement3SampleTime
      };

      device1Variables = [variable1Payload, variable2Payload, variable3Payload];

      device2Variables = [variable4Payload, variable5Payload, variable6Payload];

      device2CalculationElements = [sumElement2Payload, sumElement3Payload];

      device1Payload = {
        id: device1Id,
        name: device1Name,
        type: deviceType,
        ipAdress: device1Adress,
        portNumber: device1PortNumber,
        timeout: device1Timeout,
        unitId: device1UnitId,
        isActive: device1IsActive,
        variables: device1Variables,
        calculationElements: device1CalculationElements
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
        variables: device2Variables,
        calculationElements: device2CalculationElements
      };

      device1 = await commInterface.createNewDevice(device1Payload);
      device2 = await commInterface.createNewDevice(device2Payload);

      if (sumElement2Value)
        device2.CalculationElements[sumElement2Id].Value = sumElement2Value;

      if (sumElement3Value)
        device2.CalculationElements[sumElement3Id].Value = sumElement3Value;

      let result = commInterface.getAllValues();

      let validResult = {
        "1234": {
          "0001": 1,

          "0002": 2,

          "0003": 3
        },
        "1235": {
          "0004": true,
          "0005": 5,
          "0006": 6,
          "1002": 321,
          "1003": 1234
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

  describe("getAllCalculationElements", () => {
    let deviceId;
    let initPayload;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1234";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.getAllCalculationElements(deviceId);
    };

    it("should return all calculation elements of device of given id", async () => {
      let result = await exec();

      let calcElement1 = commInterface.getCalculationElement("1234", "1001");
      let calcElement2 = commInterface.getCalculationElement("1234", "1002");

      expect(result.length).toEqual(2);
      expect(result).toContain(calcElement1);
      expect(result).toContain(calcElement2);
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

    it("should return empty array if device has no calcElements", async () => {
      initPayload[deviceId].calculationElements = undefined;

      let result = await exec();

      expect(result).toEqual([]);
    });
  });

  describe("getAllCalculationElementsIds", () => {
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

  describe("doesDeviceExists", () => {
    let initPayload;
    let deviceId;
    let initCommInterface;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
      initCommInterface = true;
    });

    let exec = async () => {
      if (initCommInterface) await commInterface.init(initPayload);

      return commInterface.doesDeviceExist(deviceId);
    };

    it("should return true if device of given id exists", async () => {
      let result = await exec();

      expect(result).toBeTruthy();
    });

    it("should return false if device of given id does not exist", async () => {
      deviceId = "4321";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if comm has not been initialized", async () => {
      initCommInterface = false;
      let result = await exec();

      expect(result).toBeFalsy();
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

    it("should not delete database file associated with device", async () => {
      let result = await exec();

      let fileExists = checkIfFileExistsAsync(result.ArchiveManager.FilePath);

      expect(fileExists).toBeTruthy();
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
          sampleTime: 2,
          name: "test variable 10",
          offset: 5,
          length: 1,
          fCode: 3,
          value: 1,
          type: "mbInt32",
          archived: true,
          getSingleFCode: 3,
          setSingleFCode: 16
        },
        {
          id: "0011",
          sampleTime: 3,
          name: "test variable 11",
          offset: 7,
          length: 2,
          fCode: 4,
          value: 2,
          type: "mbFloat",
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

    it("should reassign all variables drivers when recreating it", async () => {
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

        //Variables should be edited but it shouldn't be different
        expect(initVariables).toContain(variable);
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

  describe("createVariable", () => {
    let initPayload;
    let deviceId;
    let variableId;
    let variableName;
    let variableFcode;
    let variableOffset;
    let variableType;
    let variableSampleTime;
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
      variableType = "mbFloat";
      variableSampleTime = 5;
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
        sampleTime: variableSampleTime,
        getSingleFCode: variableGetSingleFCode,
        setSingleFCode: variableSetSingleFCode,
        archived: variableArchived,
        value: variableValue,
        unit: variableUnit
      };

      await commInterface.init(initPayload);
      //waiting for device to be initialized
      await snooze(500);
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
      variableSampleTime = undefined;

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

    it("should throw and not add variable if variable of given id already exists in this device", async () => {
      variableId = "0005";

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

    it("should add variable to ArchiveManager if it is archived", async () => {
      variableArchived = true;
      let result = await exec();

      expect(Object.values(result.Device.ArchiveManager.Variables)).toContain(
        result
      );
    });

    it("should not add variable to ArchiveManager if it is archived", async () => {
      variableArchived = false;
      let result = await exec();

      expect(
        Object.values(result.Device.ArchiveManager.Variables)
      ).not.toContain(result);
    });

    it("should create column in database file if variables are archived", async () => {
      variableArchived = true;

      let result = await exec();

      let dbFilePath = result.Device.ArchiveManager.FilePath;
      let columnName = result.Device.ArchiveManager.getColumnNameById(
        result.Id
      );
      let columnType = result.Device.ArchiveManager.getColumnType(result);

      let columnExists = checkIfColumnExists(
        dbFilePath,
        "data",
        columnName,
        columnType
      );

      expect(columnExists).toBeTruthy();
    });

    it("should not create column in database file if variables are not archived", async () => {
      variableArchived = false;

      let result = await exec();

      let dbFilePath = result.Device.ArchiveManager.FilePath;
      let columnName = result.Device.ArchiveManager.getColumnNameById(
        result.Id
      );
      let columnType = result.Device.ArchiveManager.getColumnType(result);

      let columnExists = await checkIfColumnExists(
        dbFilePath,
        "data",
        columnName,
        columnType
      );

      expect(columnExists).toBeFalsy();
    });

    it("should not throw if column in database already exists", async () => {
      variableArchived = true;

      let result = await exec();

      await commInterface.removeVariable(deviceId, variableId);

      //Checking if adding variable again throws
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await commInterface.createVariable(deviceId, variablePayload);
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      let createdVariable = commInterface.getVariable(deviceId, variableId);

      //Checking if adding variable again was successfull
      expect(createdVariable).toBeDefined();
      expect(createdVariable.Payload).toBeDefined();
      expect(createdVariable.Payload).toMatchObject(variablePayload);
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

    it("should not remove column of variable", async () => {
      let variable = await exec();

      let filePath = variable.Device.ArchiveManager.FilePath;
      let columnName = variable.Device.ArchiveManager.getColumnNameById(
        variableId
      );
      let columnType = variable.Device.ArchiveManager.getColumnType(variable);

      let columnExists = await checkIfColumnExists(
        filePath,
        "data",
        columnName,
        columnType
      );

      expect(columnExists).toBeTruthy();
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
    let editVariableSampleTime;
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
      editVariableSampleTime = 5;
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
        sampleTime: editVariableSampleTime,
        getSingleFCode: editVariableGetSingleFCode,
        setSingleFCode: editVariableSetSingleFCode,
        archived: editVariableArchived,
        value: editVariableValue,
        type: editVariableType,
        unit: editVariableUnit
      };

      await commInterface.init(initPayload);

      originalVariable = commInterface.getVariable(deviceId, variableId);

      //Waiting for commInterface to initialize
      await snooze(500);
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
      expect(editedVariable.SampleTime).toEqual(editVariableSampleTime);
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
      editVariableType = "mbFloat";

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
      expect(editedVariable.SampleTime).toEqual(editVariableSampleTime);
      expect(editedVariable.Archived).toEqual(editVariableArchived);
      expect(editedVariable.GetSingleFCode).toEqual(editVariableGetSingleFCode);
      expect(editedVariable.SetSingleFCode).toEqual(editVariableSetSingleFCode);
      expect(editedVariable.Value).toEqual(editVariableValue);
    });

    it("should throw and not edit variable id if it is defined in payload", async () => {
      editVariableId = "87654321";

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

      let editedVariable = commInterface.getVariable(deviceId, variableId);

      let originalPayload = initPayload[deviceId].variables.find(
        variable => variable.id === variableId
      );

      //Type should have not been edited
      expect(editedVariable.Id).not.toEqual(editVariableId);
      expect(editedVariable.Id).toEqual(variableId);

      //All other parameters should have been edited
      expect(editedVariable.Id).toEqual(originalPayload.id);
      expect(editedVariable.Name).toEqual(originalPayload.name);
      expect(editedVariable.FCode).toEqual(originalPayload.fCode);
      expect(editedVariable.Offset).toEqual(originalPayload.offset);
      expect(editedVariable.SampleTime).toEqual(originalPayload.sampleTime);
      expect(editedVariable.Archived).toEqual(originalPayload.archived);
      expect(editedVariable.GetSingleFCode).toEqual(
        originalPayload.getSingleFCode
      );
      expect(editedVariable.SetSingleFCode).toEqual(
        originalPayload.setSingleFCode
      );
      expect(editedVariable.Value).toEqual(originalPayload.value);
    });

    it("should not create completly new variable but return the same one with different parametrs", async () => {
      let result = await exec();

      let editedVariable = commInterface.getVariable(deviceId, variableId);

      expect(originalVariable).toEqual(editedVariable);
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
      editVariableSampleTime = undefined;
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
      expect(result.SampleTime).toEqual(initVariablePayload.sampleTime);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(initVariablePayload.unit);
    });

    it("should edit only fcode if only fcode is defined in payload ", async () => {
      editVariableFcode = undefined;
      editVariableOffset = undefined;
      editVariableSampleTime = undefined;
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
      expect(result.SampleTime).toEqual(initVariablePayload.sampleTime);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(initVariablePayload.unit);
    });

    it("should edit only offset if only offset is defined in payload ", async () => {
      editVariableName = undefined;
      editVariableFcode = undefined;
      editVariableSampleTime = undefined;
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
      expect(result.SampleTime).toEqual(initVariablePayload.sampleTime);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(initVariablePayload.unit);
    });

    it("should edit only sampleTime if only sampleTime is defined in payload ", async () => {
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
      expect(result.SampleTime).toEqual(editVariableSampleTime);
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
      editVariableSampleTime = undefined;
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
      expect(result.SampleTime).toEqual(initVariablePayload.sampleTime);
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
      editVariableSampleTime = undefined;
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
      expect(result.SampleTime).toEqual(initVariablePayload.sampleTime);
      expect(result.Archived).toEqual(initVariablePayload.archived);
      expect(result.GetSingleFCode).toEqual(initVariablePayload.getSingleFCode);
      expect(result.SetSingleFCode).toEqual(initVariablePayload.setSingleFCode);
      expect(result.Value).toEqual(initVariablePayload.value);
      expect(result.Unit).toEqual(editVariableUnit);
    });

    it("should edit only getSingleFCode if only getSingleFCode is defined in payload ", async () => {
      editVariableName = undefined;
      editVariableOffset = undefined;
      editVariableSampleTime = undefined;
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
      expect(result.SampleTime).toEqual(initVariablePayload.sampleTime);
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
      editVariableSampleTime = undefined;
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
      expect(result.SampleTime).toEqual(initVariablePayload.sampleTime);
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
      editVariableSampleTime = undefined;
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
      expect(result.SampleTime).toEqual(initVariablePayload.sampleTime);
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

    it("should add variable to ArchiveManager if it was previosly false and now set to true", async () => {
      let varIndex = initPayload[deviceId].variables.findIndex(
        variable => variable.id === variableId
      );
      let variablePayload = initPayload[deviceId].variables[varIndex];

      variablePayload.archived = false;
      editVariableArchived = true;

      let result = await exec();

      expect(Object.values(result.Device.ArchiveManager.Variables)).toContain(
        result
      );
    });

    it("should add variable to ArchiveManager and remove previous one if it was previosly true and now set also to true", async () => {
      let varIndex = initPayload[deviceId].variables.findIndex(
        variable => variable.id === variableId
      );
      let variablePayload = initPayload[deviceId].variables[varIndex];

      variablePayload.archived = true;
      editVariableArchived = true;

      let result = await exec();

      expect(Object.values(result.Device.ArchiveManager.Variables)).toContain(
        result
      );

      //Old variable should have been removed and new added - so length of variables should be equal to previous one
      let archivedVariablesCount = initPayload[deviceId].variables.filter(
        variable => variable.archived
      ).length;

      expect(
        Object.values(result.Device.ArchiveManager.Variables).length
      ).toEqual(archivedVariablesCount);
    });

    it("should create column for variable if archived was previously false and it is set to true in editPayload", async () => {
      let varIndex = initPayload[deviceId].variables.findIndex(
        variable => variable.id === variableId
      );
      let variablePayload = initPayload[deviceId].variables[varIndex];

      variablePayload.archived = false;
      editVariableArchived = true;

      let result = await exec();

      let filePath = result.Device.ArchiveManager.FilePath;
      let columnName = result.Device.ArchiveManager.getColumnNameById(
        variableId
      );
      let columnType = result.Device.ArchiveManager.getColumnType(result);

      let columnExists = await checkIfColumnExists(
        filePath,
        "data",
        columnName,
        columnType
      );

      expect(columnExists).toBeTruthy();
    });

    it("should not create column for variable if archived was previously false and it is set to true in editPayload", async () => {
      let varIndex = initPayload[deviceId].variables.findIndex(
        variable => variable.id === variableId
      );
      let variablePayload = initPayload[deviceId].variables[varIndex];

      variablePayload.archived = false;
      editVariableArchived = false;

      let result = await exec();

      let filePath = result.Device.ArchiveManager.FilePath;
      let columnName = result.Device.ArchiveManager.getColumnNameById(
        variableId
      );
      let columnType = result.Device.ArchiveManager.getColumnType(result);

      let columnExists = await checkIfColumnExists(
        filePath,
        "data",
        columnName,
        columnType
      );

      expect(columnExists).toBeFalsy();
    });
  });

  describe("doesVariableExist", () => {
    let initPayload;
    let initCommInterface;
    let deviceId;
    let variableId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";
      variableId = "0005";
      initCommInterface = true;
    });

    let exec = async () => {
      if (initCommInterface) await commInterface.init(initPayload);
      return commInterface.doesVariableExist(deviceId, variableId);
    };

    it("should return true if device and variable exist", async () => {
      let result = await exec();

      expect(result).toBeTruthy();
    });

    it("should return false if device exists and variable does not", async () => {
      variableId = "5432";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if device does not exist and variable exists", async () => {
      deviceId = "5432";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if device and variable do not exist", async () => {
      deviceId = "5432";
      variableId = "4321";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if commInterface has not been initialized", async () => {
      initCommInterface = false;
      let result = await exec();

      expect(result).toBeFalsy();
    });
  });

  describe("createCalculationElement", () => {
    let initPayload;
    let deviceId;
    let calculationElementId;
    let calculationElementName;
    let calculationElementType;
    let calculationElementSampleTime;
    let calculationElementArchived;
    let calculationElementUnit;
    let calculationElementVariables;
    let calculationElementVariable1Payload;
    let calculationElementVariable1Add;
    let calculationElementVariable1Id;
    let calculationElementVariable1Factor;
    let calculationElementVariable2Payload;
    let calculationElementVariable2Add;
    let calculationElementVariable2Id;
    let calculationElementVariable2Factor;
    let calculationElementVariable3Payload;
    let calculationElementVariable3Add;
    let calculationElementVariable3Id;
    let calculationElementVariable3Factor;
    let calculationElementPayload;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1235";

      calculationElementId = "9001";
      calculationElementName = "sumElement1";
      calculationElementType = "sumElement";
      calculationElementSampleTime = 5;
      calculationElementArchived = true;
      calculationElementUnit = "A";

      calculationElementVariable1Id = "0004";
      calculationElementVariable1Factor = 1;

      calculationElementVariable1Id = "0005";
      calculationElementVariable1Factor = 2;

      calculationElementVariable1Id = "0006";
      calculationElementVariable1Factor = 3;
    });

    let exec = async () => {
      calculationElementVariable1Payload = {
        id: calculationElementVariable1Id,
        factor: calculationElementVariable1Factor
      };

      calculationElementVariable2Payload = {
        id: calculationElementVariable2Id,
        factor: calculationElementVariable2Factor
      };

      calculationElementVariable3Payload = {
        id: calculationElementVariable3Id,
        factor: calculationElementVariable3Factor
      };

      calculationElementVariables = [];

      if (calculationElementVariable1Add)
        calculationElementVariables.push(calculationElementVariable1Payload);

      if (calculationElementVariable2Add)
        calculationElementVariables.push(calculationElementVariable2Payload);

      if (calculationElementVariable3Add)
        calculationElementVariables.push(calculationElementVariable3Payload);

      calculationElementPayload = {
        id: calculationElementId,
        name: calculationElementName,
        type: calculationElementType,
        sampleTime: calculationElementSampleTime,
        archived: calculationElementArchived,
        unit: calculationElementUnit,
        variables: calculationElementVariables
      };

      await commInterface.init(initPayload);
      return commInterface.createCalculationElement(
        deviceId,
        calculationElementPayload
      );
    };

    it("should create new calculationElement based on given payload", async () => {
      let result = await exec();

      let createdElement = commInterface.getCalculationElement(
        deviceId,
        calculationElementId
      );

      expect(createdElement).toBeDefined();
      expect(createdElement.Payload).toBeDefined();
      expect(createdElement.Payload).toMatchObject(calculationElementPayload);
    });

    it("should return created variable", async () => {
      let result = await exec();

      let createdElement = commInterface.getCalculationElement(
        deviceId,
        calculationElementId
      );

      expect(result).toBeDefined();
      expect(result).toEqual(createdElement);
    });

    it("should set own variable id if id is not defined inside payload", async () => {
      calculationElementId = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Id).toBeDefined();

      let createdElement = commInterface.getCalculationElement(
        deviceId,
        result.Id
      );

      expect(result).toEqual(createdElement);
    });

    it("should automatically set archived to false if it is not provided in payload", async () => {
      calculationElementArchived = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Archived).toBeDefined();
      expect(result.Archived).toBeFalsy();
    });

    it("should automatically set value to default value eg. 0 ", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Value).toBeDefined();
      expect(result.Value).toEqual(0);
    });

    it("should automatically set unit to empty string if it is not provided in payload", async () => {
      calculationElementUnit = undefined;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result.Unit).toBeDefined();
      expect(result.Unit).toEqual("");
    });

    it("should throw and not add element if name is not given in payload", async () => {
      calculationElementName = undefined;

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
        Object.values(commInterface.getDevice(deviceId).CalculationElements)
          .length
      ).toEqual(0);
    });

    it("should not throw and  add element if sampleTime is not given in payload - set sampleTime to 1 instead", async () => {
      calculationElementSampleTime = undefined;
      let result = null;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            result = await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      expect(
        Object.values(commInterface.getDevice(deviceId).CalculationElements)
          .length
      ).toEqual(1);
      expect(result.SampleTime).toEqual(1);
    });

    it("should throw and not add element if element of given id already exists", async () => {
      await exec();

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await commInterface.createCalculationElement(
              deviceId,
              calculationElementPayload
            );
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(
        Object.values(commInterface.getDevice(deviceId).CalculationElements)
          .length
      ).toEqual(1);
    });

    it("should add calculationElement to ArchiveManager if it is archived", async () => {
      calculationElementArchived = true;
      let result = await exec();

      expect(
        Object.values(result.Device.ArchiveManager.CalculationElements)
      ).toContain(result);
    });

    it("should not add variable to ArchiveManager if it is archived", async () => {
      calculationElementArchived = false;
      let result = await exec();

      expect(
        Object.values(result.Device.ArchiveManager.CalculationElements)
      ).not.toContain(result);
    });

    it("should create column in database file if variables are archived", async () => {
      calculationElementArchived = true;

      let result = await exec();

      let dbFilePath = result.Device.ArchiveManager.FilePath;
      let columnName = result.Device.ArchiveManager.getColumnNameById(
        result.Id
      );
      let columnType = result.Device.ArchiveManager.getColumnType(result);

      let columnExists = await checkIfColumnExists(
        dbFilePath,
        "data",
        columnName,
        columnType
      );

      expect(columnExists).toBeTruthy();
    });

    it("should not create column in database file if variables are not archived", async () => {
      calculationElementArchived = false;

      let result = await exec();

      let dbFilePath = result.Device.ArchiveManager.FilePath;
      let columnName = result.Device.ArchiveManager.getColumnNameById(
        result.Id
      );
      let columnType = result.Device.ArchiveManager.getColumnType(result);

      let columnExists = await checkIfColumnExists(
        dbFilePath,
        "data",
        columnName,
        columnType
      );

      expect(columnExists).toBeFalsy();
    });

    it("should not throw if column in database already exists", async () => {
      calculationElementArchived = true;

      let result = await exec();

      await commInterface.removeCalculationElement(
        deviceId,
        calculationElementId
      );

      //Checking if adding variable again throws
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await commInterface.createCalculationElement(
              deviceId,
              calculationElementPayload
            );
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      let createdCalculationElement = commInterface.getCalculationElement(
        deviceId,
        calculationElementId
      );

      //Checking if adding variable again was successfull
      expect(createdCalculationElement).toBeDefined();
      expect(createdCalculationElement.Payload).toBeDefined();
      expect(createdCalculationElement.Payload).toMatchObject(
        calculationElementPayload
      );
    });
  });

  describe("getCalculationElement", () => {
    let initPayload;
    let deviceId;
    let calcElementId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1236";
      calcElementId = "3001";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.getCalculationElement(deviceId, calcElementId);
    };

    it("should return calculationElement if it exists", async () => {
      let result = await exec();

      expect(result).toEqual(
        commInterface.getDevice(deviceId).CalculationElements[calcElementId]
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

    it("should throw if calculationElement does not exists", async () => {
      calcElementId = "8765";

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

  describe("removeCalculationElement", () => {
    let initPayload;
    let deviceId;
    let calculationElementId;
    let calculationElementToRemove;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1236";
      calculationElementId = "3001";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      calculationElementToRemove = commInterface.getCalculationElement(
        deviceId,
        calculationElementId
      );
      return commInterface.removeCalculationElement(
        deviceId,
        calculationElementId
      );
    };

    it("should remove calculationElement of given id", async () => {
      let result = await exec();

      let allCalculationElementIds = commInterface.getAllCalculationElementsIds();

      expect(allCalculationElementIds).not.toContain(calculationElementId);
    });

    it("should return removed calculation element", async () => {
      let result = await exec();

      expect(result).toEqual(calculationElementToRemove);
    });

    it("should throw and don't delete element if it does not exist", async () => {
      calculationElementId = "8765";

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

      expect(commInterface.getAllCalculationElementsIds().length).toEqual(4);
    });

    it("should throw if element does not exists", async () => {
      calculationElementId = "8765";

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

      expect(commInterface.getAllCalculationElementsIds().length).toEqual(4);
    });

    it("should not remove column of element", async () => {
      let element = await exec();

      let filePath = element.Device.ArchiveManager.FilePath;
      let columnName = element.Device.ArchiveManager.getColumnNameById(
        calculationElementId
      );
      let columnType = element.Device.ArchiveManager.getColumnType(element);

      let columnExists = await checkIfColumnExists(
        filePath,
        "data",
        columnName,
        columnType
      );

      expect(columnExists).toBeTruthy();
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

  describe("getVariableFromDatabase", () => {
    let initPayload;
    let deviceId;
    let tickId1;
    let tickId2;
    let tickId3;
    let value1;
    let value2;
    let value3;
    let variableId;
    let tickId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1236";
      variableId = "0008";

      tickId1 = 101;
      tickId2 = 103;
      tickId3 = 105;

      value1 = 123.321;
      value2 = 234.432;
      value3 = 345.543;

      tickId = tickId2;
    });

    let exec = async () => {
      await commInterface.init(initPayload);

      if (tickId1 && value1)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId1, {
            [variableId]: value1
          });

      if (tickId2 && value2)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId2, {
            [variableId]: value2
          });

      if (tickId3 && value3)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId3, {
            [variableId]: value3
          });

      return commInterface.getVariableFromDatabase(
        deviceId,
        variableId,
        tickId
      );
    };

    it("should get value from database", async () => {
      let result = await exec();

      let expectedResult = {
        [tickId]: value2
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get value of highest date if given date is greater than given in databse from database", async () => {
      tickId = 109;

      let result = await exec();

      let expectedResult = {
        [tickId3]: value3
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get value of highest date, lower than given in method if there is no date in database", async () => {
      tickId = 104;

      let result = await exec();

      let expectedResult = {
        [tickId2]: value2
      };

      expect(result).toEqual(expectedResult);
    });

    it("should return {} if date is smaller than written in database", async () => {
      tickId = 99;

      let result = await exec();

      expect(result).toEqual({});
    });

    it("should throw if there is no variable of given id", async () => {
      variableId = 987654321;

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

  describe("getCalculationElementFromDatabase", () => {
    let initPayload;
    let deviceId;
    let tickId1;
    let tickId2;
    let tickId3;
    let value1;
    let value2;
    let value3;
    let calculationElementId;
    let tickId;

    beforeEach(() => {
      deviceId = "1236";
      calculationElementId = "3001";

      initPayload = JSON.parse(testPayload);

      initPayload[deviceId].calculationElements[0].archived = true;
      initPayload[deviceId].calculationElements[1].archived = true;

      tickId1 = 101;
      tickId2 = 103;
      tickId3 = 105;

      value1 = 123.321;
      value2 = 234.432;
      value3 = 345.543;

      tickId = tickId2;
    });

    let exec = async () => {
      await commInterface.init(initPayload);

      if (tickId1 && value1)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId1, {
            [calculationElementId]: value1
          });

      if (tickId2 && value2)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId2, {
            [calculationElementId]: value2
          });

      if (tickId3 && value3)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId3, {
            [calculationElementId]: value3
          });

      return commInterface.getCalculationElementFromDatabase(
        deviceId,
        calculationElementId,
        tickId
      );
    };

    it("should get value from database", async () => {
      let result = await exec();

      let expectedResult = {
        [tickId]: value2
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get value of highest date if given date is greater than given in databse from database", async () => {
      tickId = 109;

      let result = await exec();

      let expectedResult = {
        [tickId3]: value3
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get value of highest date, lower than given in method if there is no date in database", async () => {
      tickId = 104;

      let result = await exec();

      let expectedResult = {
        [tickId2]: value2
      };

      expect(result).toEqual(expectedResult);
    });

    it("should return {} if date is smaller than written in database", async () => {
      tickId = 99;

      let result = await exec();

      expect(result).toEqual({});
    });

    it("should throw if there is no variable of given id", async () => {
      calculationElementId = 987654321;

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

  describe("doesCalculationElementExist", () => {
    let initPayload;
    let initCommInterface;
    let deviceId;
    let calcElementId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1234";
      calcElementId = "1002";
      initCommInterface = true;
    });

    let exec = async () => {
      if (initCommInterface) await commInterface.init(initPayload);
      return commInterface.doesCalculationElementExist(deviceId, calcElementId);
    };

    it("should return true if device and calcElement exist", async () => {
      let result = await exec();

      expect(result).toBeTruthy();
    });

    it("should return false if device exists and calcElement does not", async () => {
      calcElementId = "5432";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if device does not exist and calcElement exists", async () => {
      deviceId = "5432";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if device and calcElement do not exist", async () => {
      deviceId = "5432";
      calcElementId = "4321";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if commInterface has not been initialized", async () => {
      initCommInterface = false;
      let result = await exec();

      expect(result).toBeFalsy();
    });
  });

  describe("doesElementExist", () => {
    let initPayload;
    let initCommInterface;
    let deviceId;
    let elementId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1234";
      elementId = "0002";
      initCommInterface = true;
    });

    let exec = async () => {
      if (initCommInterface) await commInterface.init(initPayload);
      return commInterface.doesElementExist(deviceId, elementId);
    };

    it("should return true if device and variable exist", async () => {
      let result = await exec();

      expect(result).toBeTruthy();
    });

    it("should return true if device and calcElement exist", async () => {
      elementId = "1002";
      let result = await exec();

      expect(result).toBeTruthy();
    });

    it("should return false if device exists and calcElement and variable do not", async () => {
      elementId = "5432";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if device does not exist and variable exists", async () => {
      deviceId = "5432";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if device does not exist and calcElement exists", async () => {
      deviceId = "5432";
      elementId = "1002";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if device and calcElement and variable do not exist", async () => {
      deviceId = "5432";
      elementId = "4321";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if commInterface has not been initialized", async () => {
      initCommInterface = false;
      let result = await exec();

      expect(result).toBeFalsy();
    });
  });

  describe("getElement", () => {
    let initPayload;
    let deviceId;
    let elementId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1234";
      elementId = "0002";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.getElement(deviceId, elementId);
    };

    it("should return variable if it exists", async () => {
      let result = await exec();

      expect(result).toEqual(
        commInterface.getDevice(deviceId).Variables[elementId]
      );
    });

    it("should return calculationElement if it exists", async () => {
      elementId = "1002";
      let result = await exec();

      expect(result).toEqual(
        commInterface.getDevice(deviceId).CalculationElements[elementId]
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

    it("should throw if calculationElement and variable do not exist", async () => {
      elementId = "8765";

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

  describe("getValueOfElement", () => {
    let initPayload;
    let deviceId;
    let elementId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1234";
      elementId = "0002";
    });

    let exec = async () => {
      await commInterface.init(initPayload);
      return commInterface.getValueOfElement(deviceId, elementId);
    };

    it("should return value with last tick id of variable if it exists", async () => {
      let result = await exec();

      expect(result).toEqual({
        [commInterface.getVariable(deviceId, elementId)
          .ValueTickId]: commInterface.getVariable(deviceId, elementId).Value
      });
    });

    it("should return value of calculationElement if it exists", async () => {
      elementId = "1002";
      let result = await exec();

      expect(result).toEqual({
        [commInterface.getCalculationElement(deviceId, elementId)
          .ValueTickId]: commInterface.getCalculationElement(
          deviceId,
          elementId
        ).Value
      });
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

    it("should throw if calculationElement and variable do not exist", async () => {
      elementId = "8765";

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

  describe("getValueOfElementFromDatabase", () => {
    let initPayload;
    let deviceId;
    let tickId1;
    let tickId2;
    let tickId3;
    let varValue1;
    let varValue2;
    let varValue3;
    let variableId;
    let calculationElementId;
    let elementId;

    beforeEach(() => {
      initPayload = JSON.parse(testPayload);
      deviceId = "1236";
      variableId = "0008";
      calculationElementId = "3001";
      elementId = "0008";

      tickId1 = 101;
      tickId2 = 103;
      tickId3 = 105;

      varValue1 = 123.321;
      varValue2 = 234.432;
      varValue3 = 345.543;
      calcElementValue1 = 321.123;
      calcElementValue2 = 432.234;
      calcElementValue3 = 543.345;

      tickId = tickId2;
    });

    let exec = async () => {
      await commInterface.init(initPayload);

      if (tickId1 && varValue1 && calcElementValue1)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId1, {
            [variableId]: varValue1,
            [calculationElementId]: calcElementValue1
          });

      if (tickId2 && varValue2 && calcElementValue2)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId2, {
            [variableId]: varValue2,
            [calculationElementId]: calcElementValue2
          });

      if (tickId3 && varValue3 && calcElementValue3)
        await commInterface
          .getDevice(deviceId)
          .ArchiveManager.insertValues(tickId3, {
            [variableId]: varValue3,
            [calculationElementId]: calcElementValue3
          });

      return commInterface.getValueOfElementFromDatabase(
        deviceId,
        elementId,
        tickId
      );
    };

    it("should get value of variable from database if it exists", async () => {
      let result = await exec();

      let expectedResult = {
        [tickId]: varValue2
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get value of variable of highest date if given date is greater than given in databse from database if variable exists", async () => {
      tickId = 109;

      let result = await exec();

      let expectedResult = {
        [tickId3]: varValue3
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get value of variable of highest date, lower than given in method if there is no date in database if variable exists", async () => {
      tickId = 104;

      let result = await exec();

      let expectedResult = {
        [tickId2]: varValue2
      };

      expect(result).toEqual(expectedResult);
    });

    it("should return {} if date is smaller than written in database", async () => {
      tickId = 99;

      let result = await exec();

      expect(result).toEqual({});
    });

    it("should throw if there is no variable and calculationElement of given id", async () => {
      elementId = 987654321;

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
});
