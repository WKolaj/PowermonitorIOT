const config = require("config");
const request = require("supertest");
const { clearDirectoryAsync, snooze } = require("../../../utilities/utilities");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

describe("auth route", () => {
  //Database directory should be cleared'
  let Project;
  let db1Path;
  let db2Path;
  let projPath;
  let server;
  let endpoint = "/api/devices/";
  let tokenHeader;

  let visuUserBody;
  let operateUserBody;
  let dataAdminBody;
  let superAdminBody;

  let visuUser;
  let operateUser;
  let dataAdmin;
  let superAdmin;

  let PAC3200TCPBody;
  let mbDeviceBody;

  let pac3200TCP;
  let mbDevice;

  let mbBooleanVariableBody;
  let mbFloatVariableBody;
  let mbInt32VariableBody;
  let mbUInt32VariableBody;
  let mbInt16VariableBody;
  let mbUInt16VariableBody;
  let mbSwappedFloatVariableBody;
  let mbSwappedInt32VariableBody;
  let mbSwappedUInt32VariableBody;

  let mbBooleanVariable;
  let mbFloatVariable;
  let mbInt32Variable;
  let mbUInt32Variable;
  let mbInt16Variable;
  let mbUInt16Variable;
  let mbSwappedFloatVariable;
  let mbSwappedInt32Variable;
  let mbSwappedUInt32Variable;

  let init = async () => {
    //Creating additional users
    visuUserBody = {
      login: "visuUser",
      password: "newTestPassword1",
      permissions: 1
    };
    operateUserBody = {
      login: "opeateUser",
      password: "newTestPassword2",
      permissions: 2
    };
    dataAdminBody = {
      login: "dataAdminUser",
      password: "newTestPassword3",
      permissions: 4
    };
    superAdminBody = {
      login: "superAdminUser",
      password: "newTestPassword4",
      permissions: 8
    };

    let adminToken = await (await Project.CurrentProject.getUser(
      "admin"
    )).generateToken();

    await request(server)
      .post("/api/users")
      .set(tokenHeader, adminToken)
      .send(visuUserBody);
    await request(server)
      .post("/api/users")
      .set(tokenHeader, adminToken)
      .send(operateUserBody);
    await request(server)
      .post("/api/users")
      .set(tokenHeader, adminToken)
      .send(dataAdminBody);
    await request(server)
      .post("/api/users")
      .set(tokenHeader, adminToken)
      .send(superAdminBody);

    visuUser = await Project.CurrentProject.getUser(visuUserBody.login);
    operateUser = await Project.CurrentProject.getUser(operateUserBody.login);
    dataAdmin = await Project.CurrentProject.getUser(dataAdminBody.login);
    superAdmin = await Project.CurrentProject.getUser(superAdminBody.login);

    mbDeviceBody = {
      type: "mbDevice",
      name: "mbDeviceTest",
      ipAdress: "192.168.100.33",
      portNumber: 1001
    };

    PAC3200TCPBody = {
      type: "PAC3200TCP",
      name: "pac3200TCPTest",
      ipAdress: "192.168.100.34"
    };

    let mbDeviceResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(mbDeviceBody);
    let pac3200TCPResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(PAC3200TCPBody);

    mbDevice = await Project.CurrentProject.getDevice(mbDeviceResult.body.id);
    pac3200TCP = await Project.CurrentProject.getDevice(
      pac3200TCPResult.body.id
    );

    mbBooleanVariableBody = {
      type: "boolean",
      name: "mbBooleanVariable",
      archived: false,
      offset: 1,
      fCode: 2
    };

    mbByteArrayVariableBody = {
      type: "byteArray",
      name: "mbByteArrayVariable",
      archived: false,
      offset: 3,
      length: 4,
      fCode: 3
    };

    mbInt16VariableBody = {
      type: "int16",
      name: "mbInt16Variable",
      archived: false,
      offset: 10,
      fCode: 3
    };

    mbUInt16VariableBody = {
      type: "uInt16",
      name: "mbUInt16Variable",
      archived: false,
      offset: 20,
      fCode: 3
    };

    mbInt32VariableBody = {
      type: "int32",
      name: "mbInt32Variable",
      archived: false,
      offset: 30,
      fCode: 3
    };

    mbUInt32VariableBody = {
      type: "uInt32",
      name: "mbUInt32Variable",
      archived: false,
      offset: 40,
      fCode: 3
    };

    mbFloatVariableBody = {
      type: "uInt32",
      name: "mbFloatVariable",
      archived: false,
      offset: 50,
      fCode: 3
    };

    mbSwappedInt32VariableBody = {
      type: "swappedInt32",
      name: "mbSwappedInt32Variable",
      archived: false,
      offset: 60,
      fCode: 3
    };

    mbSwappedUInt32VariableBody = {
      type: "swappedUInt32",
      name: "mbSwappedUInt32Variable",
      archived: false,
      offset: 70,
      fCode: 3
    };

    mbSwappedFloatVariableBody = {
      type: "swappedFloat",
      name: "mbSwappedFloatVar",
      archived: false,
      offset: 80,
      fCode: 3
    };

    let booleanResult = await request(server)
      .post(`/api/variables/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(mbBooleanVariableBody);

    let byteArrayResult = await request(server)
      .post(`/api/variables/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(mbByteArrayVariableBody);

    let int16Result = await request(server)
      .post(`/api/variables/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(mbInt16VariableBody);

    let uInt16Result = await request(server)
      .post(`/api/variables/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(mbUInt16VariableBody);

    let int32Result = await request(server)
      .post(`/api/variables/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(mbInt32VariableBody);

    let uInt32Result = await request(server)
      .post(`/api/variables/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(mbUInt32VariableBody);

    let floatResult = await request(server)
      .post(`/api/variables/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(mbFloatVariableBody);

    let swappedInt32Result = await request(server)
      .post(`/api/variables/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(mbSwappedInt32VariableBody);

    let swappedUInt32Result = await request(server)
      .post(`/api/variables/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(mbSwappedUInt32VariableBody);

    let swappedFloatResult = await request(server)
      .post(`/api/variables/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(mbSwappedFloatVariableBody);

    mbBooleanVariable = await Project.CurrentProject.getVariable(
      mbDevice.Id,
      booleanResult.body.id
    );

    byteArrayResult = await Project.CurrentProject.getVariable(
      mbDevice.Id,
      byteArrayResult.body.id
    );
    mbInt16Variable = await Project.CurrentProject.getVariable(
      mbDevice.Id,
      int16Result.body.id
    );
    mbUInt16Variable = await Project.CurrentProject.getVariable(
      mbDevice.Id,
      uInt16Result.body.id
    );
    mbInt32Variable = await Project.CurrentProject.getVariable(
      mbDevice.Id,
      int32Result.body.id
    );
    mbUInt32Variable = await Project.CurrentProject.getVariable(
      mbDevice.Id,
      uInt32Result.body.id
    );
    mbFloatVariable = await Project.CurrentProject.getVariable(
      mbDevice.Id,
      floatResult.body.id
    );
    mbSwappedFloatVariable = await Project.CurrentProject.getVariable(
      mbDevice.Id,
      swappedFloatResult.body.id
    );
    mbSwappedInt32Variable = await Project.CurrentProject.getVariable(
      mbDevice.Id,
      swappedInt32Result.body.id
    );
    mbSwappedUInt32Variable = await Project.CurrentProject.getVariable(
      mbDevice.Id,
      swappedUInt32Result.body.id
    );
  };

  beforeEach(async () => {
    jest.resetModules();

    //Project class has to be reloaded
    Project = require("../../../classes/project/Project");
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
    projPath = config.get("projPath");
    tokenHeader = config.get("tokenHeader");
    server = await require("../../../startup/app")();
  });

  afterEach(async () => {
    await clearDirectoryAsync(db1Path);
    await clearDirectoryAsync(db2Path);
    await clearDirectoryAsync(projPath);

    if (Project.CurrentProject.CommInterface.Initialized) {
      //ending communication with all devices if there are any
      await Project.CurrentProject.CommInterface.stopCommunicationWithAllDevices();
      Project.CurrentProject.CommInterface.Sampler.stop();
    }

    await server.close();
  });

  describe("GET /", () => {
    let token;

    beforeEach(async () => {
      await init();
      token = await visuUser.generateToken();
    });

    let exec = async () => {
      if (token) {
        return request(server)
          .get(`${endpoint}`)
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .get(`${endpoint}`)
          .send();
      }
    };

    let prepareDevicePayload = device => {
      let expectedPayload = device.Payload;
      expectedPayload.calculationElements = Object.values(
        device.CalculationElements
      ).map(calcElement => calcElement.Id);

      expectedPayload.variables = Object.values(device.Variables).map(
        variable => variable.Id
      );
      expectedPayload.connected = device.Connected;

      return expectedPayload;
    };

    it("should return code 200 and device payloads of all device", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let devices = await Project.CurrentProject.getAllDevices();

      let expectedPayload = [];

      for (let device of devices) {
        expectedPayload.push(prepareDevicePayload(device));
      }

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 401 if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
    });

    it("should return code 403 if user does not have visualize rights", async () => {
      token = await operateUser.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
    });
  });

  describe("GET /:deviceId", () => {
    let token;
    let deviceId;

    beforeEach(async () => {
      await init();
      token = await visuUser.generateToken();
      deviceId = mbDevice.Id;
    });

    let exec = async () => {
      if (token) {
        return request(server)
          .get(`${endpoint}/${deviceId}`)
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .get(`${endpoint}/${deviceId}`)
          .send();
      }
    };

    it("should return code 200 and device payload based on given id", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let device = await Project.CurrentProject.getDevice(deviceId);

      let expectedPayload = device.Payload;
      expectedPayload.calculationElements = (await Project.CurrentProject.getAllCalcElements(
        deviceId
      )).map(calcElement => {
        return {
          id: calcElement.Id,
          name: calcElement.Name
        };
      });

      expectedPayload.variables = (await Project.CurrentProject.getAllVariables(
        deviceId
      )).map(variable => {
        return {
          id: variable.Id,
          name: variable.Name
        };
      });
      expectedPayload.connected = device.Connected;

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 404 and if there is no device of given id", async () => {
      deviceId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`Device of given id does not exist`);
    });

    it("should return code 401 if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
    });

    it("should return code 403 if user does not have visualize rights", async () => {
      token = await operateUser.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
    });
  });

  describe("POST /", () => {
    let body;
    let token;

    beforeEach(async () => {
      await init();
      token = await dataAdmin.generateToken();
      body = getMBDeviceBody();
    });

    let exec = async () => {
      if (token) {
        return request(server)
          .post(endpoint)
          .set(tokenHeader, token)
          .send(body);
      } else {
        return request(server)
          .post(endpoint)
          .send(body);
      }
    };

    getMBDeviceBody = function() {
      return {
        name: "testDevice2",
        timeout: 700,
        ipAdress: "192.168.0.101",
        unitId: 3,
        portNumber: 702,
        type: "mbDevice"
      };
    };

    getPAC3200TCPBody = function() {
      return {
        name: "testDevice1",
        timeout: 600,
        ipAdress: "192.168.0.100",
        unitId: 2,
        portNumber: 602,
        type: "PAC3200TCP"
      };
    };

    it("should create mbDevice according to given payload", async () => {
      await exec();

      let createdDevice = (await Project.CurrentProject.getAllDevices()).find(
        device => device.Name === body.name
      );

      let createdDevicePayload = {
        name: createdDevice.Name,
        timeout: createdDevice.Timeout,
        ipAdress: createdDevice.IPAdress,
        unitId: createdDevice.UnitId,
        portNumber: createdDevice.PortNumber,
        type: createdDevice.Type
      };

      expect(createdDevicePayload).toEqual(body);
    });

    it("should return with code 200 and new created device", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let createdDevice = (await Project.CurrentProject.getAllDevices()).find(
        device => device.Name === body.name
      );

      let expectedPayload = {
        ...createdDevice.Payload,
        connected: createdDevice.Connected,
        variables: [],
        calculationElements: []
      };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should not create device and return 401 if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(/No token provided/);

      let createdDevice = (await Project.CurrentProject.getAllDevices()).find(
        device => device.Name === body.name
      );

      expect(createdDevice).not.toBeDefined();
    });

    it("should not create device and return 403 if user does not have dataAdmin rights", async () => {
      token = await visuUser.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(/Access forbidden/);

      let createdDevice = (await Project.CurrentProject.getAllDevices()).find(
        device => device.Name === body.name
      );

      expect(createdDevice).not.toBeDefined();
    });

    it("should not create device and return 400 if type is not defined in body", async () => {
      body.type = undefined;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/type has to be defined/);

      let createdDevice = (await Project.CurrentProject.getAllDevices()).find(
        device => device.Name === body.name
      );

      expect(createdDevice).not.toBeDefined();
    });

    it("should not create device and return 400 if type is not recognized", async () => {
      body.type = "12345";

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/type is not recognized/);

      let createdDevice = (await Project.CurrentProject.getAllDevices()).find(
        device => device.Name === body.name
      );

      expect(createdDevice).not.toBeDefined();
    });

    it("should not create device and return 400 if type is mbDevice and there is no name defined", async () => {
      body.name = undefined;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/\"name\" is required/);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is mbDevice and there is no ipAdress defined", async () => {
      body.ipAdress = undefined;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/\"ipAdress\" is required/);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is mbDevice and there is no portNumber defined", async () => {
      body.portNumber = undefined;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/\"portNumber\" is required/);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should create device with default value of timeout (500) and return 200 if type is mbDevice and there is no timeout defined", async () => {
      body.timeout = undefined;

      let result = await exec();

      expect(result.status).toEqual(200);

      let createdDevice = await Project.CurrentProject.getDevice(
        result.body.id
      );

      expect(createdDevice).toBeDefined();
      expect(createdDevice.Timeout).toEqual(500);
    });

    it("should create device with default value of unitId (1) and return 200 if type is mbDevice and there is no unitId defined", async () => {
      body.unitId = undefined;

      let result = await exec();

      expect(result.status).toEqual(200);

      let createdDevice = await Project.CurrentProject.getDevice(
        result.body.id
      );

      expect(createdDevice).toBeDefined();
      expect(createdDevice.UnitId).toEqual(1);
    });

    it("should not create device and return 400 if type is mbDevice and name is shorter than 3 signs", async () => {
      body.name = "ab";

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is mbDevice and name is longer than 100 signs", async () => {
      body.name = new Array(101 + 1).join("a");

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is mbDevice and timeout is smaller than 1", async () => {
      body.timeout = 0;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is mbDevice and timeout is larger than 10000", async () => {
      body.timeout = 10001;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is mbDevice and ipAdress is not valid ip", async () => {
      body.ipAdress = "someText";

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is mbDevice and calculationElements are defined", async () => {
      body.calculationElements = [];

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is mbDevice and variables are defined", async () => {
      body.variables = [];

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is mbDevice and isActive are defined", async () => {
      body.isActive = false;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is mbDevice and there is no name defined", async () => {
      body = getPAC3200TCPBody();
      body.name = undefined;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/\"name\" is required/);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is mbDevice and there is no ipAdress defined", async () => {
      body = getPAC3200TCPBody();
      body.ipAdress = undefined;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/\"ipAdress\" is required/);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should create device with default value of timeout (500) and return 200 if type is PAC3200TCP and there is no timeout defined", async () => {
      body = getPAC3200TCPBody();
      body.timeout = undefined;

      let result = await exec();

      expect(result.status).toEqual(200);

      let createdDevice = await Project.CurrentProject.getDevice(
        result.body.id
      );

      expect(createdDevice).toBeDefined();
      expect(createdDevice.Timeout).toEqual(500);
    });

    it("should create device with default value of unitId (1) and return 200 if type is PAC3200TCP and there is no unitId defined", async () => {
      body = getPAC3200TCPBody();
      body.unitId = undefined;

      let result = await exec();

      expect(result.status).toEqual(200);

      let createdDevice = await Project.CurrentProject.getDevice(
        result.body.id
      );

      expect(createdDevice).toBeDefined();
      expect(createdDevice.UnitId).toEqual(1);
    });

    it("should create device with default value of portNumber (502) and return 200 if type is PAC3200TCP and there is no portNumber defined", async () => {
      body = getPAC3200TCPBody();
      body.portNumber = undefined;

      let result = await exec();

      expect(result.status).toEqual(200);

      let createdDevice = await Project.CurrentProject.getDevice(
        result.body.id
      );

      expect(createdDevice).toBeDefined();
      expect(createdDevice.PortNumber).toEqual(502);
    });

    it("should not create device and return 400 if type is PAC3200TCP and name is shorter than 3 signs", async () => {
      body = getPAC3200TCPBody();
      body.name = "ab";

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is PAC3200TCP and name is longer than 20 signs", async () => {
      body = getPAC3200TCPBody();
      body.name = new Array(101 + 1).join("a");

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is PAC3200TCP and timeout is smaller than 1", async () => {
      body = getPAC3200TCPBody();
      body.timeout = 0;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is PAC3200TCP and timeout is larger than 10000", async () => {
      body = getPAC3200TCPBody();
      body.timeout = 10001;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is PAC3200TCP and ipAdress is not valid ip", async () => {
      body = getPAC3200TCPBody();
      body.ipAdress = "someText";

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is PAC3200TCP and calculationElements are defined", async () => {
      body = getPAC3200TCPBody();
      body.calculationElements = [];

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is PAC3200TCP and variables are defined", async () => {
      body = getPAC3200TCPBody();
      body.variables = [];

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });

    it("should not create device and return 400 if type is PAC3200TCP and isActive is defined", async () => {
      body = getPAC3200TCPBody();
      body.isActive = false;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      expect(result.status).toEqual(400);

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(devicesAfter).toEqual(devicesBefore);
    });
  });

  describe("DELETE /:deviceId", () => {
    let token;
    let deviceId;

    beforeEach(async () => {
      await init();
      token = await dataAdmin.generateToken();
      deviceId = mbDevice.Id;
    });

    let exec = async () => {
      if (token) {
        return request(server)
          .delete(`${endpoint}/${deviceId}`)
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .delete(`${endpoint}/${deviceId}`)
          .send();
      }
    };

    it("should return code 200 and delete device of given id", async () => {
      let deviceToDelete = await Project.CurrentProject.getDevice(deviceId);

      let result = await exec();

      expect(result.status).toEqual(200);

      let deviceExists = await Project.CurrentProject.doesDeviceExist(
        deviceToDelete.Id
      );

      expect(deviceExists).toBeFalsy();
    });

    it("should return code 200 and return deleted device Payload", async () => {
      let device = await Project.CurrentProject.getDevice(deviceId);

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = device.Payload;

      expectedPayload.calculationElements = Object.values(
        device.CalculationElements
      ).map(calcElement => {
        return {
          id: calcElement.Id,
          name: calcElement.Name
        };
      });

      expectedPayload.variables = Object.values(device.Variables).map(
        variable => {
          return {
            id: variable.Id,
            name: variable.Name
          };
        }
      );
      expectedPayload.connected = device.Connected;

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 404 and don't delete device if there is no device of given id", async () => {
      deviceId = "4321";

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`Device of given id does not exist`);
      expect(devicesBefore).toEqual(devicesAfter);
    });

    it("should return code 401 and don't delete device if there is no user logged in", async () => {
      token = undefined;

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
      expect(devicesBefore).toEqual(devicesAfter);
    });

    it("should return code 403 and don't delete device if user does not have dataAdmin rights", async () => {
      token = await visuUser.generateToken();

      let devicesBefore = await Project.CurrentProject.getAllDevices();

      let result = await exec();

      let devicesAfter = await Project.CurrentProject.getAllDevices();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
      expect(devicesBefore).toEqual(devicesAfter);
    });
  });

  describe("PUT /", () => {
    let body;
    let deviceId;
    let token;
    let mbDeviceBodyCreate;
    let PAC3200TCPBodyCreate;

    let mbDeviceBodyEdit;
    let PAC3200TCPBodyEdit;

    let editPAC3200;
    let editedDevice;
    let editedDeviceBeforePayload;
    let setFakeDeviceId;

    beforeEach(async () => {
      await init();
      token = await dataAdmin.generateToken();

      mbDeviceBodyCreate = {
        type: "mbDevice",
        name: "mbDeviceNameCreate",
        timeout: 700,
        ipAdress: "192.168.0.101",
        unitId: 3,
        portNumber: 702
      };

      mbDeviceBodyEdit = {
        name: "mbDeviceNameEdit",
        timeout: 702,
        ipAdress: "192.168.100.101",
        unitId: 4,
        portNumber: 302,
        isActive: true
      };

      PAC3200TCPBodyCreate = {
        type: "PAC3200TCP",
        name: "pac3200TCPCreate",
        timeout: 205,
        ipAdress: "192.168.0.105",
        unitId: 5,
        portNumber: 702
      };

      PAC3200TCPBodyEdit = {
        name: "pac3200TCPEdit",
        timeout: 702,
        ipAdress: "192.168.100.106",
        unitId: 7,
        portNumber: 302,
        isActive: true
      };

      editPAC3200 = false;
      setFakeDeviceId = false;
    });

    let exec = async () => {
      if (editPAC3200) {
        //Editing PAC3200
        editedDevice = await Project.CurrentProject.createDevice(
          PAC3200TCPBodyCreate
        );
        body = PAC3200TCPBodyEdit;
        deviceId = editedDevice.Id;
      } else {
        //Editing Modbus device
        editedDevice = await Project.CurrentProject.createDevice(
          mbDeviceBodyCreate
        );
        body = mbDeviceBodyEdit;
        deviceId = editedDevice.Id;
      }

      //Setting device id do different value than id of device - to simulate error
      if (setFakeDeviceId) {
        deviceId = "1234";
      }
      editedDeviceBeforePayload = editedDevice.Payload;
      if (token) {
        return request(server)
          .put(`${endpoint}/${deviceId}`)
          .set(tokenHeader, token)
          .send(body);
      } else {
        return request(server)
          .put(`${endpoint}/${deviceId}`)
          .send(body);
      }
    };

    it("should edit mbDevice according to given payload", async () => {
      await exec();

      let editedDevicePayload = {
        name: editedDevice.Name,
        timeout: editedDevice.Timeout,
        ipAdress: editedDevice.IPAdress,
        unitId: editedDevice.UnitId,
        portNumber: editedDevice.PortNumber,
        isActive: editedDevice.IsActive
      };

      expect(editedDevicePayload).toEqual(body);
    });

    it("should return payload of edited mbDevice", async () => {
      let result = await exec();
      let expectedPayload = editedDevice.Payload;
      expectedPayload.connected = editedDevice.Connected;

      expect(result.body).toEqual(expectedPayload);
    });

    it("should edit only name if only name is passed - if device is mbDevice", async () => {
      mbDeviceBodyEdit = _.pick(mbDeviceBodyEdit, "name");

      await exec();

      expect(editedDevice.Name).toEqual(mbDeviceBodyEdit.name);
    });

    it("should edit only timeout if only timeout is passed - if device is mbDevice", async () => {
      mbDeviceBodyEdit = _.pick(mbDeviceBodyEdit, "timeout");

      await exec();

      expect(editedDevice.Timeout).toEqual(mbDeviceBodyEdit.timeout);
    });

    it("should edit only ipAdress if only ipAdress is passed - if device is mbDevice", async () => {
      mbDeviceBodyEdit = _.pick(mbDeviceBodyEdit, "ipAdress");

      await exec();

      expect(editedDevice.IPAdress).toEqual(mbDeviceBodyEdit.ipAdress);
    });

    it("should edit only unitId if only unitId is passed - if device is mbDevice", async () => {
      mbDeviceBodyEdit = _.pick(mbDeviceBodyEdit, "unitId");

      await exec();

      expect(editedDevice.UnitId).toEqual(mbDeviceBodyEdit.unitId);
    });

    it("should edit only portNumber if only portNumber is passed - if device is mbDevice", async () => {
      mbDeviceBodyEdit = _.pick(mbDeviceBodyEdit, "portNumber");

      await exec();

      expect(editedDevice.PortNumber).toEqual(mbDeviceBodyEdit.portNumber);
    });

    it("should edit only isActive if only isActive is passed - if device is mbDevice", async () => {
      mbDeviceBodyEdit = _.pick(mbDeviceBodyEdit, "isActive");

      await exec();

      expect(editedDevice.IsActive).toEqual(mbDeviceBodyEdit.isActive);
    });

    it("should not edit and return 404 if there is no device of given id - if device is mbDevice", async () => {
      setFakeDeviceId = true;
      let result = await exec();

      let payloadAfter = editedDevice.Payload;
      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`Device of given id does not exist`);
      expect(editedDeviceBeforePayload).toEqual(payloadAfter);
    });

    it("should not edit and return 401 if there is no user logged in - if device is mbDevice", async () => {
      token = undefined;

      let result = await exec();

      let payloadAfter = editedDevice.Payload;
      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
      expect(editedDeviceBeforePayload).toEqual(payloadAfter);
    });

    it("should return code 403 if user does not have dataAdmin rights - if device is mbDevice", async () => {
      token = await visuUser.generateToken();

      let result = await exec();

      let payloadAfter = editedDevice.Payload;
      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
      expect(editedDeviceBeforePayload).toEqual(payloadAfter);
    });

    it("should return 400 and not edit device if name is shorter than 3 characters - if device is mbDevice", async () => {
      mbDeviceBodyEdit.name = "ab";

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if name is longer than 100 characters - if device is mbDevice", async () => {
      mbDeviceBodyEdit.name = new Array(101 + 1).join("a").toString();

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if timeout is samller than 1 - if device is mbDevice", async () => {
      mbDeviceBodyEdit.timeout = 0;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if timeout is bigger than 10000 - if device is mbDevice", async () => {
      mbDeviceBodyEdit.timeout = 10001;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if ipAdress is not valid adress - if device is mbDevice", async () => {
      mbDeviceBodyEdit.ipAdress = "test.string";

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if unitId is samller than 1 - if device is mbDevice", async () => {
      mbDeviceBodyEdit.unitId = 0;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if unitId is bigger than 255 - if device is mbDevice", async () => {
      mbDeviceBodyEdit.unitId = 256;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if portNumber is samller than 1 - if device is mbDevice", async () => {
      mbDeviceBodyEdit.portNumber = 0;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if portNumber is bigger than 100000 - if device is mbDevice", async () => {
      mbDeviceBodyEdit.portNumber = 100001;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if isActive is not valid boolean - if device is mbDevice", async () => {
      mbDeviceBodyEdit.isActive = "string";

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should edit PAC3200TCP according to given payload", async () => {
      editPAC3200 = true;

      await exec();

      let editedDevicePayload = {
        name: editedDevice.Name,
        timeout: editedDevice.Timeout,
        ipAdress: editedDevice.IPAdress,
        unitId: editedDevice.UnitId,
        portNumber: editedDevice.PortNumber,
        isActive: editedDevice.IsActive
      };

      expect(editedDevicePayload).toEqual(body);
    });

    it("should return payload of edited PAC3200TCP", async () => {
      editPAC3200 = true;

      let result = await exec();
      let expectedPayload = editedDevice.Payload;
      expectedPayload.connected = editedDevice.Connected;

      expectedPayload.variables = Object.values(editedDevice.Variables).map(
        variable => {
          return { name: variable.Name, id: variable.Id };
        }
      );

      expectedPayload.calculationElements = Object.values(
        editedDevice.CalculationElements
      ).map(element => {
        return { name: element.Name, id: element.Id };
      });

      expect(result.body).toEqual(expectedPayload);
    });

    it("should edit only name if only name is passed - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit = _.pick(PAC3200TCPBodyEdit, "name");

      await exec();

      expect(editedDevice.Name).toEqual(PAC3200TCPBodyEdit.name);
    });

    it("should edit only timeout if only timeout is passed - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit = _.pick(PAC3200TCPBodyEdit, "timeout");

      await exec();

      expect(editedDevice.Timeout).toEqual(PAC3200TCPBodyEdit.timeout);
    });

    it("should edit only ipAdress if only ipAdress is passed - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit = _.pick(PAC3200TCPBodyEdit, "ipAdress");

      await exec();

      expect(editedDevice.IPAdress).toEqual(PAC3200TCPBodyEdit.ipAdress);
    });

    it("should edit only unitId if only unitId is passed - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit = _.pick(PAC3200TCPBodyEdit, "unitId");

      await exec();

      expect(editedDevice.UnitId).toEqual(PAC3200TCPBodyEdit.unitId);
    });

    it("should edit only portNumber if only portNumber is passed - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit = _.pick(PAC3200TCPBodyEdit, "portNumber");

      await exec();

      expect(editedDevice.PortNumber).toEqual(PAC3200TCPBodyEdit.portNumber);
    });

    it("should edit only isActive if only isActive is passed - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit = _.pick(PAC3200TCPBodyEdit, "isActive");

      await exec();

      expect(editedDevice.IsActive).toEqual(PAC3200TCPBodyEdit.isActive);
    });

    it("should not edit and return 404 if there is no device of given id - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      setFakeDeviceId = true;
      let result = await exec();

      let payloadAfter = editedDevice.Payload;
      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`Device of given id does not exist`);
      expect(editedDeviceBeforePayload).toEqual(payloadAfter);
    });

    it("should not edit and return 401 if there is no user logged in - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      token = undefined;

      let result = await exec();

      let payloadAfter = editedDevice.Payload;
      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
      expect(editedDeviceBeforePayload).toEqual(payloadAfter);
    });

    it("should return code 403 if user does not have dataAdmin rights - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      token = await visuUser.generateToken();

      let result = await exec();

      let payloadAfter = editedDevice.Payload;
      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
      expect(editedDeviceBeforePayload).toEqual(payloadAfter);
    });

    it("should return 400 and not edit device if name is shorter than 3 characters - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit.name = "ab";

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if name is longer than 100 characters - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit.name = new Array(101 + 1).join("a").toString();

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if timeout is samller than 1 - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit.timeout = 0;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if timeout is bigger than 10000 - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit.timeout = 10001;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if ipAdress is not valid adress - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit.ipAdress = "test.string";

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if unitId is samller than 1 - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit.unitId = 0;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if unitId is bigger than 255 - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit.unitId = 256;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if portNumber is samller than 1 - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit.portNumber = 0;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if portNumber is bigger than 100000 - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit.portNumber = 100001;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    it("should return 400 and not edit device if isActive is not valid boolean - if device is PAC3200TCP", async () => {
      editPAC3200 = true;

      PAC3200TCPBodyEdit.isActive = "string";

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(editedDeviceBeforePayload).toEqual(editedDevice.Payload);
    });

    //Implement tests for validation of every parameter separately and PAC3200TCP
  });
});
