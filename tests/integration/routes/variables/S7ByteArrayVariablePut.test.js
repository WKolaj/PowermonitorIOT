const config = require("config");
const request = require("supertest");
const {
  clearDirectoryAsync,
  snooze
} = require("../../../../utilities/utilities");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const {
  testS7VariableCreation,
  testS7VariableEdition
} = require("./utilities");

describe("variables route", () => {
  describe("CREATE /:deviceId/", () => {
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

    let s7DeviceBody;

    let s7Device;

    let token;
    let deviceId;
    let variableId;
    let variablePayloadBefore;
    let fakeVariableId;
    let fakeDeviceId;
    let variableBodyEdit;
    let variableBodyCreate;

    let createdVariable;

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

      s7DeviceBody = {
        type: "s7Device",
        name: "s7DeviceTest",
        ipAdress: "192.168.100.33",
        rack: 0,
        slot: 1
      };

      let s7DeviceResult = await request(server)
        .post("/api/devices")
        .set(tokenHeader, adminToken)
        .send(s7DeviceBody);

      s7Device = await Project.CurrentProject.getDevice(s7DeviceResult.body.id);
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
      await init();

      fakeVariableId = false;
      fakeDeviceId = false;
      token = await dataAdmin.generateToken();
      deviceId = s7Device.Id;
      variableBodyCreate = {
        type: "s7ByteArray",
        name: "varialeTestNameBefore",
        sampleTime: 2,
        value: [1, 2, 3, 4],
        length: 4,
        unit: "B",
        archived: true,
        offset: 8,
        areaType: "DB",
        dbNumber: 1,
        write: false
      };
      variableBodyEdit = {
        name: "varialeTestNameAfter",
        sampleTime: 3,
        value: [1, 2, 3],
        length: 3,
        unit: "A",
        areaType: "DB",
        dbNumber: 2,
        archived: false,
        offset: 2,
        write: true
      };
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

    let exec = async () => {
      let varPayload = await request(server)
        .post(`${endpoint}/${deviceId}`)
        .set(tokenHeader, await dataAdmin.generateToken())
        .send(variableBodyCreate);

      createdVariable = await Project.CurrentProject.getVariable(
        deviceId,
        varPayload.body.id
      );

      variablePayloadBefore = createdVariable.Payload;
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

    it("S7ByteArray should edit variable based on payload and return code 200", async () => {
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
        offset: variable.Offset,
        areaType: variable.AreaType,
        write: variable.Write,
        dbNumber: variable.DBNumber,
        length: variable.Length
      };

      expect(variablePayload).toEqual(variableBodyEdit);
    });

    it("s7ByteArray - should return code 200 and edited variable payload", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let expectedPayload = prepareVariablePayload(variable);

      expect(result.body).toEqual(expectedPayload);
    });

    it("s7ByteArray - should set value to the default [0,0,0,0] if length is different than before and no value is provided", async () => {
      variableBodyEdit = { length: 5 };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      expect(variable.Value).toEqual([0, 0, 0, 0, 0]);
      expect(variable.Length).toEqual(5);

      expect(result.body.value).toEqual([0, 0, 0, 0, 0]);
      expect(result.body.length).toEqual(5);
    });

    it("s7ByteArray - should not set value to the default [0,0,0,0] if length is the same as current length and no value is provided", async () => {
      variableBodyEdit = { length: 4 };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      expect(variable.Value).toEqual([1, 2, 3, 4]);
      expect(variable.Length).toEqual(4);

      expect(result.body.value).toEqual([1, 2, 3, 4]);
      expect(result.body.length).toEqual(4);
    });

    it("s7ByteArray - should not set value to the given value if length is different than before", async () => {
      variableBodyEdit = { length: 5, value: [1, 2, 3, 4, 5] };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      expect(variable.Value).toEqual([1, 2, 3, 4, 5]);
      expect(variable.Length).toEqual(5);

      expect(result.body.value).toEqual([1, 2, 3, 4, 5]);
      expect(result.body.length).toEqual(5);
    });

    it("S7ByteArray should return code 404 and do not edit variable if there is no device of given id", async () => {
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

    it("S7ByteArray should return code 404 and do not edit variable if there is no variable of given id", async () => {
      fakeVariableId = true;

      let result = await exec();

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        createdVariable.Id
      )).Payload;

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no variable`);

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 401 and do not edit variable if there is no user logged in", async () => {
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

    it("S7ByteArray should return code 403 and do not edit variable if user does not have dataAdmin rights", async () => {
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

    it("S7ByteArray should edit only sampleTime if only sampleTime is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "sampleTime");

      let result = await exec();

      expect(result.body.sampleTime).toEqual(3);
    });

    it("S7ByteArray should edit only value if only value is defined in payload", async () => {
      variableBodyEdit = { value: [5, 4, 3, 2] };

      let result = await exec();

      expect(result.body.value).toEqual(variableBodyEdit.value);
    });

    it("S7ByteArray should value if value is different length, but also new length is given in payload", async () => {
      variableBodyEdit = { value: [5, 4, 3, 2, 1], length: 5 };

      let result = await exec();

      expect(result.body.value).toEqual(variableBodyEdit.value);
    });

    it("S7ByteArray should return code 400 and do not edit variable if length of value is invalid and length not defined in new payload", async () => {
      variableBodyEdit = { value: [5, 4, 3, 2, 1] };
      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if length of value is invalid and length in payload is also different not defined in new payload", async () => {
      variableBodyEdit = { value: [5, 4, 3, 2, 1], length: 6 };
      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if length of value is valid but  length in payload is not valid", async () => {
      variableBodyEdit = { value: [4, 3, 2, 1], length: 5 };
      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should edit only unit if only unit is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "unit");

      let result = await exec();

      expect(result.body.unit).toEqual("A");
    });

    it("S7ByteArray should edit only archived if archived is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "archived");

      let result = await exec();

      expect(result.body.archived).toEqual(false);
    });

    it("S7ByteArray should edit only areaType if areaType is defined in payload", async () => {
      variableBodyEdit = { areaType: "M" };

      let result = await exec();

      expect(result.body.areaType).toEqual("M");
    });

    it("S7ByteArray should edit only dbNumber if dbNumber is defined in payload", async () => {
      variableBodyEdit = _.pick(variableBodyEdit, "dbNumber");

      let result = await exec();

      expect(result.body.dbNumber).toEqual(2);
    });

    it("S7ByteArray should return code 400 and do not edit variable if type is invalid", async () => {
      variableBodyEdit.type = "fakeType";

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if current type is DB, next type is DB and dbNumber is less than 1", async () => {
      variableBodyEdit = {
        areaType: "DB",
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if current type is DB, next type is DB and dbNumber is greater than 65535", async () => {
      variableBodyEdit = {
        areaType: "DB",
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if current type is DB, type is not defined and dbNumber is less than 1", async () => {
      variableBodyEdit = {
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if current type is not DB, but type in payload is DB and dbNumber is less than 1", async () => {
      variableBodyCreate.areaType = "I";
      variableBodyEdit = {
        areaType: "DB",
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if current type is not DB, but type in payload is DB and dbNumber is greater than 65535", async () => {
      variableBodyCreate.areaType = "I";
      variableBodyEdit = {
        areaType: "DB",
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if current type is DB, type is not defined and dbNumber is greater than 65535", async () => {
      variableBodyEdit = {
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is DB, but new type is I and dbNumber is smaller than 1", async () => {
      variableBodyCreate.areaType = "DB";
      variableBodyEdit = {
        areaType: "I",
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is DB, but new type is I and dbNumber is greater than 65535", async () => {
      variableBodyCreate.areaType = "DB";
      variableBodyEdit = {
        areaType: "I",
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is DB, but new type is Q and dbNumber is smaller than 1", async () => {
      variableBodyCreate.areaType = "DB";
      variableBodyEdit = {
        areaType: "Q",
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is DB, but new type is Q and dbNumber is greater than 65535", async () => {
      variableBodyCreate.areaType = "DB";
      variableBodyEdit = {
        areaType: "Q",
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is DB, but new type is M and dbNumber is smaller than 1", async () => {
      variableBodyCreate.areaType = "DB";
      variableBodyEdit = {
        areaType: "M",
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is DB, but new type is M and dbNumber is greater than 65535", async () => {
      variableBodyCreate.areaType = "DB";
      variableBodyEdit = {
        areaType: "M",
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is I, but new type is I and dbNumber is smaller than 1", async () => {
      variableBodyCreate.areaType = "I";
      variableBodyEdit = {
        areaType: "I",
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is I, but new type is I and dbNumber is greater than 65535", async () => {
      variableBodyCreate.areaType = "I";
      variableBodyEdit = {
        areaType: "I",
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is Q, but new type is Q and dbNumber is smaller than 1", async () => {
      variableBodyCreate.areaType = "Q";
      variableBodyEdit = {
        areaType: "I",
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is Q, but new type is Q and dbNumber is greater than 65535", async () => {
      variableBodyCreate.areaType = "Q";
      variableBodyEdit = {
        areaType: "I",
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is M, but new type is M and dbNumber is smaller than 1", async () => {
      variableBodyCreate.areaType = "M";
      variableBodyEdit = {
        areaType: "I",
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is M, but new type is M and dbNumber is greater than 65535", async () => {
      variableBodyCreate.areaType = "M";
      variableBodyEdit = {
        areaType: "I",
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is I, new type is not defined and dbNumber is smaller than 1", async () => {
      variableBodyCreate.areaType = "I";
      variableBodyEdit = {
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is I, new type is not defined and dbNumber is greater than 65535", async () => {
      variableBodyCreate.areaType = "I";
      variableBodyEdit = {
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is M, new type is not defined and dbNumber is smaller than 1", async () => {
      variableBodyCreate.areaType = "M";
      variableBodyEdit = {
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is Q, new type is not defined and dbNumber is smaller than 1", async () => {
      variableBodyCreate.areaType = "Q";
      variableBodyEdit = {
        dbNumber: 0
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is Q, new type is not defined and dbNumber is greater than 65535", async () => {
      variableBodyCreate.areaType = "Q";
      variableBodyEdit = {
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should not throw but edit variable and return code 200 if current type is M, new type is not defined and dbNumber is greater than 65535", async () => {
      variableBodyCreate.areaType = "M";
      variableBodyEdit = {
        dbNumber: 65536
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        dbNumber: variable.DBNumber
      };

      //Db number should be set to 1 if area is I
      expect(variablePayload).toEqual({ ...variableBodyEdit, dbNumber: 1 });
    });

    it("S7ByteArray should return code 400 and do not edit variable if name is shorter than 3", async () => {
      variableBodyEdit.name = "ab";

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if name is longer than 100", async () => {
      variableBodyEdit.name = new Array(101 + 1).join("a").toString();

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if length is longer than 10000", async () => {
      variableBodyEdit.length = 10001;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if length is smaller than 1", async () => {
      variableBodyEdit.length = 0;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if sampleTime is less than 1", async () => {
      variableBodyEdit.sampleTime = "ab";

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if sampleTime is greater than 10000", async () => {
      variableBodyEdit.sampleTime = 10001;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if value is invalid", async () => {
      variableBodyEdit.value = 1;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if unit is longer than 10", async () => {
      variableBodyEdit.unit = new Array(11 + 1).join("a").toString();

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if archived is no boolean", async () => {
      variableBodyEdit.archived = "fakeArchived";

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if offset is smaller than 0", async () => {
      variableBodyEdit.offset = -1;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if offset is greater than 10000", async () => {
      variableBodyEdit.offset = 10001;

      let result = await exec();

      expect(result.status).toEqual(400);

      let payloadAfter = (await Project.CurrentProject.getVariable(
        deviceId,
        variableId
      )).Payload;

      expect(variablePayloadBefore).toEqual(payloadAfter);
    });

    it("S7ByteArray should return code 400 and do not edit variable if areaType is invalid", async () => {
      variableBodyEdit.areaType = "fakeAreaType";

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
