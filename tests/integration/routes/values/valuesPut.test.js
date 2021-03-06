const config = require("config");
const request = require("supertest");
const {
  clearDirectoryAsync,
  snooze
} = require("../../../../utilities/utilities");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

describe("variables route", () => {
  //Database directory should be cleared'
  let Project;
  let db1Path;
  let db2Path;
  let projPath;
  let server;
  let endpoint = "/api/values/";
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

  let averageElementBody;
  let factorElementBody;
  let increaseElementBody;
  let sumElementBody;

  let averageElement;
  let factorElement;
  let increaseElement;
  let sumElement;

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
      type: "mbFloat",
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

    mbByteArrayVariable = await Project.CurrentProject.getVariable(
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

    averageElementBody = {
      type: "averageElement",
      name: "averageElementTest",
      sampleTime: 2,
      unit: "A",
      archived: false,
      variableId: mbFloatVariable.Id,
      factor: 3,
      calculationInterval: 15
    };

    factorElementBody = {
      type: "factorElement",
      name: "factorElementTest",
      sampleTime: 3,
      unit: "A",
      archived: false,
      variableId: mbFloatVariable.Id,
      factor: 3
    };

    increaseElementBody = {
      type: "increaseElement",
      name: "increaseElementTest",
      sampleTime: 2,
      unit: "A",
      archived: false,
      variableId: mbFloatVariable.Id,
      factor: 3,
      calculationInterval: 15,
      overflow: 100
    };

    sumElementBody = {
      type: "sumElement",
      name: "sumElementTest",
      sampleTime: 3,
      unit: "A",
      archived: false,
      variables: [
        {
          id: mbFloatVariable.Id,
          factor: 2
        },
        {
          id: mbInt16Variable.Id,
          factor: 3
        },
        {
          id: mbInt32Variable.Id,
          factor: 4
        }
      ]
    };

    let averageElementResult = await request(server)
      .post(`/api/calcElements/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(averageElementBody);

    let factorElementResult = await request(server)
      .post(`/api/calcElements/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(factorElementBody);

    let increaseElementResult = await request(server)
      .post(`/api/calcElements/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(increaseElementBody);

    let sumElementResult = await request(server)
      .post(`/api/calcElements/${mbDevice.Id}`)
      .set(tokenHeader, adminToken)
      .send(sumElementBody);

    averageElement = await Project.CurrentProject.getCalcElement(
      mbDevice.Id,
      averageElementResult.body.id
    );

    factorElement = await Project.CurrentProject.getCalcElement(
      mbDevice.Id,
      factorElementResult.body.id
    );

    increaseElement = await Project.CurrentProject.getCalcElement(
      mbDevice.Id,
      increaseElementResult.body.id
    );

    sumElement = await Project.CurrentProject.getCalcElement(
      mbDevice.Id,
      sumElementResult.body.id
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

  describe("PUT /:deviceId/:elementId", () => {
    let token;
    let deviceId;
    let variableId;
    let variable;
    let previousValue;
    let valueToSet;
    let body;

    beforeEach(async () => {
      await init();
      token = await operateUser.generateToken();
      deviceId = mbDevice.Id;

      variableId = mbFloatVariable.Id;

      variable = await Project.CurrentProject.getElement(deviceId, variableId);

      previousValue = variable.Value;

      valueToSet = 123.321;
    });

    let exec = async () => {
      body = {
        value: valueToSet
      };
      if (token) {
        return request(server)
          .put(`${endpoint}/${deviceId}/${variableId}`)
          .set(tokenHeader, token)
          .send(body);
      } else {
        return request(server)
          .put(`${endpoint}/${deviceId}/${variableId}`)
          .send(body);
      }
    };

    it("should return code 200, payload containing new value and set value to given variable - float", async () => {
      variableId = mbFloatVariable.Id;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(mbFloatVariable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - boolean", async () => {
      variableId = mbBooleanVariable.Id;
      valueToSet = true;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(mbBooleanVariable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - int16", async () => {
      variableId = mbInt16Variable.Id;
      valueToSet = 123;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(mbInt16Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - int32", async () => {
      variableId = mbInt32Variable.Id;
      valueToSet = 123;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(mbInt32Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - uInt16", async () => {
      variableId = mbUInt16Variable.Id;
      valueToSet = 123;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(mbUInt16Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - uInt32", async () => {
      variableId = mbUInt32Variable.Id;
      valueToSet = 123;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(mbUInt32Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - swappedInt32", async () => {
      variableId = mbSwappedInt32Variable.Id;
      valueToSet = 123;

      let result = await exec();
      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(mbSwappedInt32Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - swappedUInt32", async () => {
      variableId = mbSwappedUInt32Variable.Id;
      valueToSet = 123;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(mbSwappedUInt32Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - swappedFloat", async () => {
      variableId = mbSwappedFloatVariable.Id;
      valueToSet = 1234.3214;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(mbSwappedFloatVariable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - byteArray", async () => {
      variableId = mbByteArrayVariable.Id;
      valueToSet = [1, 0, 1, 0, 1, 0, 1, 0];

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(mbByteArrayVariable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - s7Int8", async () => {
      deviceId = s7Device.Id;
      variableId = s7Int8Variable.Id;
      valueToSet = 123;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(s7Int8Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - s7Int16", async () => {
      deviceId = s7Device.Id;
      variableId = s7Int16Variable.Id;
      valueToSet = 123;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(s7Int16Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - s7Int32", async () => {
      deviceId = s7Device.Id;
      variableId = s7Int32Variable.Id;
      valueToSet = 123;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(s7Int32Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - s7UInt8", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt8Variable.Id;
      valueToSet = 123;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(s7UInt8Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - s7UInt16", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt16Variable.Id;
      valueToSet = 123;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(s7UInt16Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - s7UInt32", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt32Variable.Id;
      valueToSet = 123;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(s7UInt32Variable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - s7Float", async () => {
      deviceId = s7Device.Id;
      variableId = s7FloatVariable.Id;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(s7FloatVariable.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - s7ByteArray", async () => {
      deviceId = s7Device.Id;
      variableId = s7ByteArrayVariable.Id;
      valueToSet = [9, 8, 7, 6];

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(s7ByteArrayVariable.Value).toEqual(valueToSet);
    });

    it("should return code 404, - variable not found - for calcElement - calcElement value cannot be modified - averageElement", async () => {
      let previousValue = averageElement.Value;
      variableId = averageElement.Id;
      valueToSet = 1234.3214;
      let result = await exec();
      expect(result.status).toEqual(404);

      expect(result.text).toMatch(/There is no variable od given id/);
      expect(previousValue).toEqual(averageElement.Value);
    });

    it("should return code 404, - variable not found - for calcElement - calcElement value cannot be modified - factorElement", async () => {
      let previousValue = factorElement.Value;
      variableId = factorElement.Id;
      valueToSet = 1234.3214;
      let result = await exec();
      expect(result.status).toEqual(404);

      expect(result.text).toMatch(/There is no variable od given id/);
      expect(previousValue).toEqual(factorElement.Value);
    });

    it("should return code 404, - variable not found - for calcElement - calcElement value cannot be modified - sumElement", async () => {
      let previousValue = sumElement.Value;
      variableId = sumElement.Id;
      valueToSet = 1234.3214;
      let result = await exec();
      expect(result.status).toEqual(404);

      expect(result.text).toMatch(/There is no variable od given id/);
      expect(previousValue).toEqual(sumElement.Value);
    });

    it("should return code 404, - variable not found - for calcElement - calcElement value cannot be modified - increaseElement", async () => {
      let previousValue = increaseElement.Value;
      variableId = increaseElement.Id;
      valueToSet = 1234.3214;
      let result = await exec();
      expect(result.status).toEqual(404);

      expect(result.text).toMatch(/There is no variable od given id/);
      expect(previousValue).toEqual(increaseElement.Value);
    });

    it("should return code 404 and do not set value if there is no device of given id", async () => {
      deviceId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no device`);
      expect(variable.Value).toEqual(previousValue);
    });

    it("should return code 404 and do not set value if there is no variable or calcElement of given id", async () => {
      variableId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no variable od given id`);
      expect(variable.Value).toEqual(previousValue);
    });

    it("should return code 404 and do not set value if there is no variable or calcElement of given id - s7Device", async () => {
      deviceId = s7Device.Id;
      variableId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no variable od given id`);
      expect(variable.Value).toEqual(previousValue);
    });

    it("should return code 401 and do not set value if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
      expect(variable.Value).toEqual(previousValue);
    });

    it("should return code 403 if user does not have operateData rights", async () => {
      token = await dataAdmin.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
      expect(variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - float", async () => {
      variableId = mbFloatVariable.Id;
      previousValue = mbFloatVariable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbFloatVariable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - boolean", async () => {
      variableId = mbBooleanVariable.Id;
      previousValue = mbBooleanVariable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbBooleanVariable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - int32 - string value", async () => {
      variableId = mbInt32Variable.Id;
      previousValue = mbInt32Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - int32 - float value", async () => {
      variableId = mbInt32Variable.Id;
      previousValue = mbInt32Variable.Value;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - swappedInt32 - string value", async () => {
      variableId = mbSwappedInt32Variable.Id;
      previousValue = mbSwappedInt32Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbSwappedInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - swappedInt32 - float value", async () => {
      variableId = mbSwappedInt32Variable.Id;
      previousValue = mbSwappedInt32Variable.Value;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbSwappedInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - int16 - string value", async () => {
      variableId = mbInt16Variable.Id;
      previousValue = mbInt16Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbInt16Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - int16 - float value", async () => {
      variableId = mbInt16Variable.Id;
      previousValue = mbInt16Variable.Value;
      valueToSet = 123.161;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbInt16Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - uInt16 - string value", async () => {
      variableId = mbUInt16Variable.Id;
      previousValue = mbUInt16Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbUInt16Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - uInt16 - float value", async () => {
      variableId = mbUInt16Variable.Id;
      previousValue = mbUInt16Variable.Value;
      valueToSet = 123.161;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbUInt16Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - uInt16 - negative value", async () => {
      variableId = mbUInt16Variable.Id;
      previousValue = mbUInt16Variable.Value;
      valueToSet = -123;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbUInt16Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - uint32 - string value", async () => {
      variableId = mbUInt32Variable.Id;
      previousValue = mbUInt32Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbUInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - uint32 - float value", async () => {
      variableId = mbUInt32Variable.Id;
      previousValue = mbUInt32Variable.Value;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbUInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - uint32 - negative value", async () => {
      variableId = mbUInt32Variable.Id;
      previousValue = mbUInt32Variable.Value;
      valueToSet = -123;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbUInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - swappedUInt32 - string value", async () => {
      variableId = mbSwappedUInt32Variable.Id;
      previousValue = mbSwappedUInt32Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbSwappedUInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - swappedUInt32 - float value", async () => {
      variableId = mbSwappedUInt32Variable.Id;
      previousValue = mbSwappedUInt32Variable.Value;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbSwappedUInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - swappedUInt32 - negative value", async () => {
      variableId = mbSwappedUInt32Variable.Id;
      previousValue = mbSwappedUInt32Variable.Value;
      valueToSet = -123;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbSwappedUInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - byteArray - string value", async () => {
      variableId = mbByteArrayVariable.Id;
      previousValue = mbByteArrayVariable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbByteArrayVariable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - byteArray - invalid length", async () => {
      variableId = mbByteArrayVariable.Id;
      previousValue = mbByteArrayVariable.Value;
      valueToSet = [0, 1, 0, 1];

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(mbByteArrayVariable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7Int8 - float", async () => {
      deviceId = s7Device.Id;
      variableId = s7Int8Variable.Id;
      previousValue = s7Int8Variable.Value;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7Int8Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7Int8 - string", async () => {
      deviceId = s7Device.Id;
      variableId = s7Int8Variable.Id;
      previousValue = s7Int8Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7Int8Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7Int16 - float", async () => {
      deviceId = s7Device.Id;
      variableId = s7Int16Variable.Id;
      previousValue = s7Int16Variable.Value;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7Int16Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7Int16 - string", async () => {
      deviceId = s7Device.Id;
      variableId = s7Int16Variable.Id;
      previousValue = s7Int16Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7Int16Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7Int32 - float", async () => {
      deviceId = s7Device.Id;
      variableId = s7Int32Variable.Id;
      previousValue = s7Int32Variable.Value;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7Int32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7Int32 - string", async () => {
      deviceId = s7Device.Id;
      variableId = s7Int32Variable.Id;
      previousValue = s7Int32Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7Int32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7UInt8 - float", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt8Variable.Id;
      previousValue = s7UInt8Variable.Value;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7UInt8Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7UInt8 - string", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt8Variable.Id;
      previousValue = s7UInt8Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7UInt8Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7UInt8 - minus", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt8Variable.Id;
      previousValue = s7UInt8Variable.Value;
      valueToSet = -1;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7UInt8Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7UInt16 - float", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt16Variable.Id;
      previousValue = s7UInt16Variable.Value;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7UInt16Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7UInt16 - string", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt16Variable.Id;
      previousValue = s7UInt16Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7UInt16Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7UInt16 - minus", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt16Variable.Id;
      previousValue = s7UInt16Variable.Value;
      valueToSet = -1;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7UInt16Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7UInt32 - float", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt32Variable.Id;
      previousValue = s7UInt32Variable.Value;
      valueToSet = 123.321;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7UInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7UInt32 - string", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt32Variable.Id;
      previousValue = s7UInt32Variable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7UInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7UInt32 - minus", async () => {
      deviceId = s7Device.Id;
      variableId = s7UInt32Variable.Id;
      previousValue = s7UInt32Variable.Value;
      valueToSet = -1;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7UInt32Variable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7ByteArray - length to short", async () => {
      deviceId = s7Device.Id;
      variableId = s7ByteArrayVariable.Id;
      previousValue = s7ByteArrayVariable.Value;
      valueToSet = [1, 2, 3];

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7ByteArrayVariable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7ByteArray - length to long", async () => {
      deviceId = s7Device.Id;
      variableId = s7ByteArrayVariable.Id;
      previousValue = s7ByteArrayVariable.Value;
      valueToSet = [1, 2, 3, 4, 5];

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7ByteArrayVariable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7ByteArray - string", async () => {
      deviceId = s7Device.Id;
      variableId = s7ByteArrayVariable.Id;
      previousValue = s7ByteArrayVariable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7ByteArrayVariable.Value).toEqual(previousValue);
    });

    it("should return code 400, and do not edit value if value is invalid - s7ByteArray - number", async () => {
      deviceId = s7Device.Id;
      variableId = s7ByteArrayVariable.Id;
      previousValue = s7ByteArrayVariable.Value;
      valueToSet = "fakeValue";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(s7ByteArrayVariable.Value).toEqual(previousValue);
    });
  });
});
