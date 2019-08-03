const config = require("config");
const request = require("supertest");
const {
  clearDirectoryAsync,
  snooze
} = require("../../../../utilities/utilities");
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

  let s7DeviceBody;
  let s7Device;

  let s7Int8VariableBody;
  let s7Int16VariableBody;
  let s7Int32VariableBody;
  let s7UInt8VariableBody;
  let s7UInt16VariableBody;
  let s7UInt32VariableBody;
  let s7FloatVariableBody;
  let s7ByteArrayVariableBody;

  let s7Int8Variable;
  let s7Int16Variable;
  let s7Int32Variable;
  let s7UInt8Variable;
  let s7UInt16Variable;
  let s7UInt32Variable;
  let s7FloatVariable;
  let s7ByteArrayVariable;

  let init = async () => {
    //Creating additional users
    visuUserBody = {
      login: "visuUser",
      password: "newTestPassword1",
      permissions: 1,
      lang: "pl"
    };
    operateUserBody = {
      login: "opeateUser",
      password: "newTestPassword2",
      permissions: 2,
      lang: "pl"
    };
    dataAdminBody = {
      login: "dataAdminUser",
      password: "newTestPassword3",
      permissions: 4,
      lang: "pl"
    };
    superAdminBody = {
      login: "superAdminUser",
      password: "newTestPassword4",
      permissions: 8,
      lang: "pl"
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

    s7DeviceBody = {
      type: "s7Device",
      name: "s7DeviceTest",
      ipAdress: "192.168.100.35",
      slot: 1,
      rack: 2,
      timeout: 5000
    };

    let mbDeviceResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(mbDeviceBody);
    let pac3200TCPResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(PAC3200TCPBody);
    let s7DeviceResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(s7DeviceBody);

    mbDevice = await Project.CurrentProject.getDevice(mbDeviceResult.body.id);
    pac3200TCP = await Project.CurrentProject.getDevice(
      pac3200TCPResult.body.id
    );
    s7Device = await Project.CurrentProject.getDevice(s7DeviceResult.body.id);

    mbBooleanVariableBody = {
      type: "mbBoolean",
      name: "mbBooleanVariable",
      archived: false,
      offset: 1,
      fCode: 2
    };

    mbByteArrayVariableBody = {
      type: "mbByteArray",
      name: "mbByteArrayVariable",
      archived: false,
      offset: 3,
      length: 4,
      fCode: 3
    };

    mbInt16VariableBody = {
      type: "mbInt16",
      name: "mbInt16Variable",
      archived: false,
      offset: 10,
      fCode: 3
    };

    mbUInt16VariableBody = {
      type: "mbUInt16",
      name: "mbUInt16Variable",
      archived: false,
      offset: 20,
      fCode: 3
    };

    mbInt32VariableBody = {
      type: "mbInt32",
      name: "mbInt32Variable",
      archived: false,
      offset: 30,
      fCode: 3
    };

    mbUInt32VariableBody = {
      type: "mbUInt32",
      name: "mbUInt32Variable",
      archived: false,
      offset: 40,
      fCode: 3
    };

    mbFloatVariableBody = {
      type: "mbUInt32",
      name: "mbFloatVariable",
      archived: false,
      offset: 50,
      fCode: 3
    };

    mbSwappedInt32VariableBody = {
      type: "mbSwappedInt32",
      name: "mbSwappedInt32Variable",
      archived: false,
      offset: 60,
      fCode: 3
    };

    mbSwappedUInt32VariableBody = {
      type: "mbSwappedUInt32",
      name: "mbSwappedUInt32Variable",
      archived: false,
      offset: 70,
      fCode: 3
    };

    mbSwappedFloatVariableBody = {
      type: "mbSwappedFloat",
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

    s7Int8VariableBody = {
      type: "s7Int8",
      name: "s7Int8Variable",
      areaType: "I",
      offset: 0,
      write: false
    };

    s7Int16VariableBody = {
      type: "s7Int16",
      name: "s7Int16Variable",
      areaType: "DB",
      offset: 1,
      dbNumber: 1,
      write: false
    };

    s7Int32VariableBody = {
      type: "s7Int32",
      name: "s7Int32Variable",
      areaType: "Q",
      offset: 0,
      write: false
    };

    s7UInt8VariableBody = {
      type: "s7UInt8",
      name: "s7UInt8Variable",
      areaType: "I",
      offset: 1,
      write: false
    };

    s7UInt16VariableBody = {
      type: "s7UInt16",
      name: "s7UInt16Variable",
      areaType: "M",
      offset: 1,
      write: false
    };

    s7UInt32VariableBody = {
      type: "s7UInt32",
      name: "s7UInt32Variable",
      areaType: "M",
      offset: 3,
      write: false
    };

    s7FloatVariableBody = {
      type: "s7Float",
      name: "s7FloatVariable",
      areaType: "I",
      offset: 3,
      write: false
    };

    s7ByteArrayVariableBody = {
      type: "s7ByteArray",
      name: "s7ByteArrayVariable",
      areaType: "DB",
      offset: 2,
      length: 4,
      dbNumber: 2,
      write: false
    };

    let s7Int8Result = await request(server)
      .post(`/api/variables/${s7Device.Id}`)
      .set(tokenHeader, adminToken)
      .send(s7Int8VariableBody);

    let s7Int16Result = await request(server)
      .post(`/api/variables/${s7Device.Id}`)
      .set(tokenHeader, adminToken)
      .send(s7Int16VariableBody);

    let s7Int32Result = await request(server)
      .post(`/api/variables/${s7Device.Id}`)
      .set(tokenHeader, adminToken)
      .send(s7Int32VariableBody);

    let s7UInt8Result = await request(server)
      .post(`/api/variables/${s7Device.Id}`)
      .set(tokenHeader, adminToken)
      .send(s7UInt8VariableBody);

    let s7UInt16Result = await request(server)
      .post(`/api/variables/${s7Device.Id}`)
      .set(tokenHeader, adminToken)
      .send(s7UInt16VariableBody);

    let s7UInt32Result = await request(server)
      .post(`/api/variables/${s7Device.Id}`)
      .set(tokenHeader, adminToken)
      .send(s7UInt32VariableBody);

    let s7FloatResult = await request(server)
      .post(`/api/variables/${s7Device.Id}`)
      .set(tokenHeader, adminToken)
      .send(s7FloatVariableBody);

    let s7ByteArrayResult = await request(server)
      .post(`/api/variables/${s7Device.Id}`)
      .set(tokenHeader, adminToken)
      .send(s7ByteArrayVariableBody);

    s7Int8Variable = await Project.CurrentProject.getVariable(
      s7Device.Id,
      s7Int8Result.body.id
    );

    s7Int16Variable = await Project.CurrentProject.getVariable(
      s7Device.Id,
      s7Int16Result.body.id
    );

    s7Int32Variable = await Project.CurrentProject.getVariable(
      s7Device.Id,
      s7Int32Result.body.id
    );

    s7UInt8Variable = await Project.CurrentProject.getVariable(
      s7Device.Id,
      s7UInt8Result.body.id
    );

    s7UInt16Variable = await Project.CurrentProject.getVariable(
      s7Device.Id,
      s7UInt16Result.body.id
    );

    s7UInt32Variable = await Project.CurrentProject.getVariable(
      s7Device.Id,
      s7UInt32Result.body.id
    );

    s7FloatVariable = await Project.CurrentProject.getVariable(
      s7Device.Id,
      s7FloatResult.body.id
    );

    s7ByteArrayVariable = await Project.CurrentProject.getVariable(
      s7Device.Id,
      s7ByteArrayResult.body.id
    );
  };

  beforeEach(async () => {
    jest.resetModules();

    //Project class has to be reloaded
    Project = require("../../../../classes/project/Project");
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
    projPath = config.get("projPath");
    tokenHeader = config.get("tokenHeader");
    server = await require("../../../../startup/app")();
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

    it("should return code 200 and device payload based on given id - if device is s7Device", async () => {
      deviceId = s7Device.Id;

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
});
