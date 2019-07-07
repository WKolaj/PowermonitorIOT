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
  let endpoint = "/api/variables";
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
  let specialDeviceBody;

  let pac3200TCP;
  let mbDevice;
  let specialDevice;

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

  let pac3200TCPvariable1;
  let pac3200TCPvariable2;

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

    specialDeviceBody = {
      type: "specialDevice",
      name: "mySpecialDevice"
    };

    let mbDeviceResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(mbDeviceBody);
    let pac3200TCPResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(PAC3200TCPBody);

    let specialDeviceResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(specialDeviceBody);

    mbDevice = await Project.CurrentProject.getDevice(mbDeviceResult.body.id);
    pac3200TCP = await Project.CurrentProject.getDevice(
      pac3200TCPResult.body.id
    );
    specialDevice = await Project.CurrentProject.getDevice(
      specialDeviceResult.body.id
    );

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
    pac3200TCPvariable1 = Object.values(pac3200TCP.Variables)[0];
    pac3200TCPvariable2 = Object.values(pac3200TCP.Variables)[1];
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

  describe("UPDATE /:deviceId/:variableId", () => {
    let token;
    let deviceId;
    let variableBodyEdit;
    let variableBodyCreate;
    let variablePayloadBefore;
    let variableId;
    let fakeVariableId;
    let fakeDeviceId;
    let editedVariable;

    beforeEach(async () => {
      await init();
      fakeVariableId = false;
      fakeDeviceId = false;
      token = await dataAdmin.generateToken();
      deviceId = specialDevice.Id;
      variableBodyCreate = {
        type: "sdVariable",
        name: "special variable",
        sampleTime: 1,
        unit: "A",
        archived: false,
        archiveSampleTime: 5,
        elementDeviceId: mbDevice.Id,
        elementId: mbFloatVariable.Id
      };
      variableBodyEdit = {
        name: "special variable 2",
        sampleTime: 2,
        unit: "B",
        archived: true,
        archiveSampleTime: 10,
        elementDeviceId: pac3200TCP.Id,
        elementId: pac3200TCPvariable1.Id
      };
    });

    let exec = async () => {
      let varPayload = await request(server)
        .post(`${endpoint}/${deviceId}`)
        .set(tokenHeader, await dataAdmin.generateToken())
        .send(variableBodyCreate);

      editedVariable = await Project.CurrentProject.getVariable(
        deviceId,
        varPayload.body.id
      );

      variablePayloadBefore = editedVariable.Payload;
      variableId = variablePayloadBefore.id;

      if (fakeVariableId) {
        variableId = "12345";
      }

      if (fakeDeviceId) {
        deviceId = "12345";
      }

      if (token) {
        return request(server)
          .put(`${endpoint}/${deviceId}/${variableId}`)
          .set(tokenHeader, token)
          .send(variableBodyEdit);
      } else {
        return request(server)
          .put(`${endpoint}/${deviceId}/${variableId}`)
          .send(variableBodyEdit);
      }
    };

    let prepareVariablePayload = variable => {
      let expectedPayload = variable.Payload;

      expectedPayload.valueTickId = variable.ValueTickId;

      return expectedPayload;
    };

    it("should edit variable based on payload and return code 200", async () => {
      let result = await exec();
      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        name: variable.Name,
        sampleTime: variable.SampleTime,
        value: variable.Value,
        unit: variable.Unit,
        archived: variable.Archived,
        archiveSampleTime: variable.ArchiveSampleTime,
        elementDeviceId: variable.ElementDeviceId,
        elementId: variable.ElementId
      };

      expect(variablePayload).toEqual({
        ...variableBodyEdit,
        value: pac3200TCPvariable1.Value
      });
    });

    it("should return code 200 and edited variable payload", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let expectedPayload = prepareVariablePayload(variable);

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 404 and do not edit variable if there is no device of given id", async () => {
      let oldDeviceId = deviceId;
      fakeDeviceId = true;

      let result = await exec();

      let payloadAfter = (await Project.CurrentProject.getVariable(
        oldDeviceId,
        variableId
      )).Payload;

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no device`);

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 404 and do not edit variable if there is no variable of given id", async () => {
      fakeVariableId = true;

      let result = await exec();

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        editedVariable.Id
      )).Payload;

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no variable`);

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 401 and do not edit variable if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 403 and do not edit variable if user does not have dataAdmin rights", async () => {
      token = await visuUser.generateToken();

      let result = await exec();

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should edit only sampleTime if only sampleTime is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "sampleTime");

      let result = await exec();
      expect(result.body.sampleTime).toEqual(2);
    });

    it("should edit only archiveSampleTime if only archiveSampleTime is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "archiveSampleTime");

      let result = await exec();

      expect(result.body.archiveSampleTime).toEqual(10);
    });

    it("should edit only unit if only unit is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "unit");

      let result = await exec();

      expect(result.body.unit).toEqual("B");
    });

    it("should edit only archived if archived is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "archived");

      let result = await exec();

      expect(result.body.archived).toEqual(true);
    });

    it("should edit only elementDeviceId and elementId if they are defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, [
        "elementId",
        "elementDeviceId"
      ]);

      let result = await exec();

      expect(result.body.elementId).toEqual(variableBodyEdit.elementId);
      expect(result.body.elementDeviceId).toEqual(
        variableBodyEdit.elementDeviceId
      );
    });

    it("should return code 400 and do not edit variable if only elementId is defined in payload", async () => {
      variableBodyEdit = {
        elementId: mbInt32Variable.Id
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if only elementDeviceId is defined in payload", async () => {
      variableBodyEdit = {
        elementDeviceId: mbDevice.Id
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if there is no element of elementId", async () => {
      variableBodyEdit = {
        elementId: "fakeId",
        elementDeviceId: mbDevice.Id
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if there is no device of elementDeviceId", async () => {
      variableBodyEdit = {
        elementId: mbFloatVariable.Id,
        elementDeviceId: "fakeId"
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if type is invalid", async () => {
      variableBodyEdit.type = "invalidType";

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if name is shorter than 3", async () => {
      variableBodyEdit.name = "ab";

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if name is longer than 100", async () => {
      variableBodyEdit.name = new Array(101 + 1).join("a").toString();

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if sampleTime is less than 1", async () => {
      variableBodyEdit.sampleTime = "ab";

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if sampleTime is greater than 10000", async () => {
      variableBodyEdit.sampleTime = 10001;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if archivesampleTime is less than 1", async () => {
      variableBodyEdit.archiveSampleTime = 0;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if archivesampleTime is greater than 10000", async () => {
      variableBodyEdit.archiveSampleTime = 10001;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if unit is longer than 10", async () => {
      variableBodyEdit.unit = new Array(11 + 1).join("a").toString();

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if archived is no boolean", async () => {
      variableBodyEdit.archived = "fakeArchived";

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });
  });
});
