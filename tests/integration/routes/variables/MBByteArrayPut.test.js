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
  let endpoint = "/api/variables/";
  let tokenHeader;

  let visuUserBody;
  let operateUserBody;
  let dataAdminBody;
  let superAdminBody;

  let visuUser;
  let operateUser;
  let dataAdmin;
  let superAdmin;

  let mbDeviceBody;

  let mbDevice;

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

    let mbDeviceResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(mbDeviceBody);

    mbDevice = await Project.CurrentProject.getDevice(mbDeviceResult.body.id);
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
    let variableTypeCreate = "mbByteArray";
    let variableValueCreate = [0, 1, 0, 1];
    let variableFCodeCreate = 3;
    let variableLengthCreate = 2;
    let variableGetSingleFCodeCreate = 3;
    let variableSetSingleFCodeCreate = 16;
    let variableValueEdit = [1, 0, 1, 0, 1, 0, 1, 0];
    let variableFCodeEdit = 4;
    let variableLengthEdit = 4;
    let variableGetSingleFCodeEdit = 4;
    let variableSetSingleFCodeEdit = 16;
    let defaultValue = [0, 0, 0, 0];
    let defaultGetSingleFCode = 3;
    let defaultSetSingleFCode = 16;
    let invalidType = "fakeType";
    let invalidValue = "fakeValue";
    let invalidFCode = 99;
    let invalidGetSingleFCode = 98;
    let invalidSetSingleFCode = 97;

    let token;
    let deviceId;
    let variableId;
    let variablePayloadBefore;
    let fakeVariableId;
    let fakeDeviceId;
    let variableBodyEdit;
    let variableBodyCreate;

    let editedVariable;

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

      let mbDeviceResult = await request(server)
        .post("/api/devices")
        .set(tokenHeader, adminToken)
        .send(mbDeviceBody);

      mbDevice = await Project.CurrentProject.getDevice(mbDeviceResult.body.id);
    };

    beforeEach(async () => {
      await init();

      fakeVariableId = false;
      fakeDeviceId = false;
      token = await dataAdmin.generateToken();
      deviceId = mbDevice.Id;
      variableBodyCreate = {
        type: variableTypeCreate,
        name: "varialeTestNameBefire",
        timeSample: 2,
        value: variableValueCreate,
        unit: "B",
        archived: true,
        length: variableLengthCreate,
        offset: 8,
        fCode: variableFCodeCreate,
        getSingleFCode: variableGetSingleFCodeCreate,
        setSingleFCode: variableSetSingleFCodeCreate,
        archiveTimeSample: 10
      };
      variableBodyEdit = {
        name: "varialeTestName",
        timeSample: 1,
        value: variableValueEdit,
        unit: "A",
        archived: false,
        length: variableLengthEdit,
        offset: 1,
        fCode: variableFCodeEdit,
        getSingleFCode: variableGetSingleFCodeEdit,
        setSingleFCode: variableSetSingleFCodeEdit,
        archiveTimeSample: 20
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
        timeSample: variable.TimeSample,
        value: variable.Value,
        unit: variable.Unit,
        archived: variable.Archived,
        offset: variable.Offset,
        length: variable.Length,
        fCode: variable.FCode,
        getSingleFCode: variable.GetSingleFCode,
        setSingleFCode: variable.SetSingleFCode,
        archiveTimeSample: variable.ArchiveTimeSample
      };

      expect(variablePayload).toEqual(variableBodyEdit);
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

    it("should edit only timeSample if only timeSample is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "timeSample");

      let result = await exec();

      expect(result.body.timeSample).toEqual(1);
    });

    it("should edit only archiveTimeSample if only archiveTimeSample is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "archiveTimeSample");

      let result = await exec();

      expect(result.body.archiveTimeSample).toEqual(20);
    });

    it("should edit only length if only length is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "length");

      let result = await exec();

      expect(result.body.length).toEqual(4);
    });

    it("should set value to default value (array of 0s) if new length is different than previous one", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "length");

      let result = await exec();

      expect(result.body.length).toEqual(4);
      expect(result.body.value).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it("should edit only value if only value is defined in payload and length of value is correct", async () => {
      variableBodyEdit = {
        value: [2, 3, 4, 5]
      };

      let result = await exec();

      expect(result.body.value).toEqual([2, 3, 4, 5]);
    });

    it("should not edit value and return code 400 if value does not suit to length", async () => {
      variableBodyEdit = {
        value: [2, 3, 4, 5, 6, 7, 8, 9]
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(editedVariable.Value).toEqual(variableBodyCreate.value);
    });

    it("should edit only value if only value and length are defined in payload and they are correct", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "value", "length");

      let result = await exec();

      expect(result.body.value).toEqual(variableValueEdit);
    });

    it("should edit only unit if only unit is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "unit");

      let result = await exec();

      expect(result.body.unit).toEqual("A");
    });

    it("should edit only archived if archived is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "archived");

      let result = await exec();

      expect(result.body.archived).toEqual(false);
    });

    it("should edit only fCode if fCode is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "fCode");

      let result = await exec();

      expect(result.body.fCode).toEqual(variableFCodeEdit);
    });

    it("should return code 400 and do not edit variable if type is invalid", async () => {
      variableBodyEdit.type = invalidType;

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

    it("should return code 400 and do not edit variable if timeSample is less than 1", async () => {
      variableBodyEdit.timeSample = "ab";

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if timeSample is greater than 10000", async () => {
      variableBodyEdit.timeSample = 10001;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if archivetimeSample is less than 1", async () => {
      variableBodyEdit.archiveTimeSample = 0;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if archivetimeSample is greater than 10000", async () => {
      variableBodyEdit.archiveTimeSample = 10001;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if value is invalid", async () => {
      variableBodyEdit.value = invalidValue;

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

    it("should return code 400 and do not edit variable if offset is smaller than 0", async () => {
      variableBodyEdit.offset = -1;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if offset is greater than 10000", async () => {
      variableBodyEdit.offset = 10001;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if fCode is invalid", async () => {
      variableBodyEdit.fCode = invalidFCode;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if getSingleFCode is invalid", async () => {
      variableBodyEdit.getSingleFCode = invalidGetSingleFCode;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("should return code 400 and do not edit variable if setSingleFCode is invalid", async () => {
      variableBodyEdit.setSingleFCode = invalidSetSingleFCode;

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
