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

  describe("POST /", () => {
    let endpoint = "/api/devices";
    let visuUserBody;
    let operateUserBody;
    let dataAdminBody;
    let superAdminBody;
    let visuUser;
    let operateUser;
    let dataAdmin;
    let superAdmin;
    let body;
    let token;

    beforeEach(async () => {
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
      operate = await Project.CurrentProject.getUser(operateUserBody.login);
      dataAdmin = await Project.CurrentProject.getUser(dataAdminBody.login);
      superAdmin = await Project.CurrentProject.getUser(superAdminBody.login);

      token = await dataAdmin.generateToken();

      body = {
        name: "testDevice1",
        timeout: 600,
        ipAdress: "192.168.0.100",
        unitId: 2,
        portNumber: 602,
        type: "mbDevice"
      };
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

    it("should not create device and return 400 if type is mbDevice and name is longer than 20 signs", async () => {
      body.name = new Array(21 + 1).join("a");

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
      body.name = new Array(21 + 1).join("a");

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
  });
});
