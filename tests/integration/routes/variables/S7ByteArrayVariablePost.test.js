const config = require("config");
const request = require("supertest");
const {
  clearDirectoryAsync,
  snooze
} = require("../../../../utilities/utilities");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

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
    let variableBody;

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

      token = await dataAdmin.generateToken();
      deviceId = s7Device.Id;
      variableBody = {
        type: "s7ByteArray",
        name: "varialeTestName",
        sampleTime: 1,
        value: [1, 2],
        length: 2,
        write: false,
        unit: "A",
        archived: false,
        offset: 1,
        dbNumber: 2,
        areaType: "DB",
        archiveSampleTime: 3
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
      if (token) {
        return request(server)
          .post(`${endpoint}/${deviceId}`)
          .set(tokenHeader, token)
          .send(variableBody);
      } else {
        return request(server)
          .post(`${endpoint}/${deviceId}`)
          .send(variableBody);
      }
    };

    let prepareVariablePayload = variable => {
      let expectedPayload = variable.Payload;

      expectedPayload.valueTickId = variable.ValueTickId;

      return expectedPayload;
    };

    it("S7ByteArrayVariable - should create variable based on payload and return code 200", async () => {
      let initialCount = (await Project.CurrentProject.getAllVariables(
        deviceId
      )).length;

      let result = await exec();

      expect(result.status).toEqual(200);

      //Checking if there is one more variable
      let laterCount = (await Project.CurrentProject.getAllVariables(deviceId))
        .length;

      expect(initialCount + 1).toEqual(laterCount);

      //Checking if new variable exists
      let variableExistsAfter = await Project.CurrentProject.doesVariableExist(
        deviceId,
        result.body.id
      );

      expect(variableExistsAfter).toBeTruthy();

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        type: variable.Type,
        name: variable.Name,
        sampleTime: variable.SampleTime,
        value: variable.Value,
        unit: variable.Unit,
        archived: variable.Archived,
        offset: variable.Offset,
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber,
        archiveSampleTime: variable.ArchiveSampleTime,
        write: variable.Write,
        length: variable.Length
      };

      expect(variablePayload).toEqual(variableBody);
    });

    it("S7ByteArrayVariable - should return code 200 and created variable payload", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let expectedPayload = prepareVariablePayload(variable);

      expect(result.body).toEqual(expectedPayload);
    });

    it("S7ByteArrayVariable - should return code 404 and do not create variable if there is no device of given id", async () => {
      let oldDeviceId = deviceId;
      deviceId = "4321";

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        oldDeviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        oldDeviceId
      );

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no device`);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 401 and do not create variable if there is no user logged in", async () => {
      token = undefined;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 403 and do not delete variable if user does not have dataAdmin rights", async () => {
      token = await visuUser.generateToken();

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should set sampleTime to default value if it is not defined in payload", async () => {
      variableBody.sampleTime = undefined;

      let result = await exec();

      expect(result.body.sampleTime).toEqual(1);
    });

    it("S7ByteArrayVariable - should set archiveSampleTime to default value if it is not defined in payload", async () => {
      variableBody.archiveSampleTime = undefined;

      let result = await exec();

      expect(result.body.archiveSampleTime).toEqual(1);
    });

    it("S7ByteArrayVariable - should set value to default value if it is not defined in payload", async () => {
      variableBody.value = undefined;

      let result = await exec();

      expect(result.body.value).toEqual([0, 0]);
    });

    it("S7ByteArrayVariable - should set unit to default unit if it is not defined in payload", async () => {
      variableBody.unit = undefined;

      let result = await exec();

      expect(result.body.unit).toEqual("");
    });

    it("S7ByteArrayVariable - should set archived to default archived if it is not defined in payload", async () => {
      variableBody.archived = undefined;

      let result = await exec();

      expect(result.body.archived).toBeFalsy();
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if write is not defined", async () => {
      variableBody.write = undefined;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if write is not valid boolean", async () => {
      variableBody.write = "undefined";

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if type is invalid", async () => {
      variableBody.type = "fakeType";

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if name is shorter than 3", async () => {
      variableBody.name = "ab";

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if name is longer than 100", async () => {
      variableBody.name = new Array(101 + 1).join("a").toString();

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if sampleTime is less than 1", async () => {
      variableBody.sampleTime = "ab";

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if areaType is invalid", async () => {
      variableBody.areaType = "fakeArea";

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if length is undefined", async () => {
      variableBody.length = undefined;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if length is invalid", async () => {
      variableBody.length = "fakeLength";

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if length is smaller than 0", async () => {
      variableBody.length = -1;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if length is greater than 10000", async () => {
      variableBody.length = 10001;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if areaType is DB and there is no DBNumber set", async () => {
      variableBody.areaType = "DB";
      variableBody.dbNumber = undefined;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return 200 and create variable based on payload (set dbNumber to default value 1) - if dbNumber is not given but areaType is I", async () => {
      variableBody.areaType = "I";
      variableBody.dbNumber = undefined;

      let initialCount = (await Project.CurrentProject.getAllVariables(
        deviceId
      )).length;

      let result = await exec();

      expect(result.status).toEqual(200);

      //Checking if there is one more variable
      let laterCount = (await Project.CurrentProject.getAllVariables(deviceId))
        .length;

      expect(initialCount + 1).toEqual(laterCount);

      //Checking if new variable exists
      let variableExistsAfter = await Project.CurrentProject.doesVariableExist(
        deviceId,
        result.body.id
      );

      expect(variableExistsAfter).toBeTruthy();

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        type: variable.Type,
        name: variable.Name,
        sampleTime: variable.SampleTime,
        value: variable.Value,
        unit: variable.Unit,
        archived: variable.Archived,
        offset: variable.Offset,
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber,
        archiveSampleTime: variable.ArchiveSampleTime,
        write: variable.Write,
        length: variable.Length
      };

      expect(variablePayload).toEqual({ ...variableBody, dbNumber: 1 });
    });

    it("S7ByteArrayVariable - should return 200 and create variable based on payload (set dbNumber to default value 1) - if dbNumber is not given but areaType is Q", async () => {
      variableBody.areaType = "Q";
      variableBody.dbNumber = undefined;

      let initialCount = (await Project.CurrentProject.getAllVariables(
        deviceId
      )).length;

      let result = await exec();

      expect(result.status).toEqual(200);

      //Checking if there is one more variable
      let laterCount = (await Project.CurrentProject.getAllVariables(deviceId))
        .length;

      expect(initialCount + 1).toEqual(laterCount);

      //Checking if new variable exists
      let variableExistsAfter = await Project.CurrentProject.doesVariableExist(
        deviceId,
        result.body.id
      );

      expect(variableExistsAfter).toBeTruthy();

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        type: variable.Type,
        name: variable.Name,
        sampleTime: variable.SampleTime,
        value: variable.Value,
        unit: variable.Unit,
        archived: variable.Archived,
        offset: variable.Offset,
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber,
        archiveSampleTime: variable.ArchiveSampleTime,
        write: variable.Write,
        length: variable.Length
      };

      expect(variablePayload).toEqual({ ...variableBody, dbNumber: 1 });
    });

    it("S7ByteArrayVariable - should return 200 and create variable based on payload (set dbNumber to default value 1) - if dbNumber is not given but areaType is M", async () => {
      variableBody.areaType = "M";
      variableBody.dbNumber = undefined;

      let initialCount = (await Project.CurrentProject.getAllVariables(
        deviceId
      )).length;

      let result = await exec();

      expect(result.status).toEqual(200);

      //Checking if there is one more variable
      let laterCount = (await Project.CurrentProject.getAllVariables(deviceId))
        .length;

      expect(initialCount + 1).toEqual(laterCount);

      //Checking if new variable exists
      let variableExistsAfter = await Project.CurrentProject.doesVariableExist(
        deviceId,
        result.body.id
      );

      expect(variableExistsAfter).toBeTruthy();

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        type: variable.Type,
        name: variable.Name,
        sampleTime: variable.SampleTime,
        value: variable.Value,
        unit: variable.Unit,
        archived: variable.Archived,
        offset: variable.Offset,
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber,
        archiveSampleTime: variable.ArchiveSampleTime,
        write: variable.Write,
        length: variable.Length
      };

      expect(variablePayload).toEqual({ ...variableBody, dbNumber: 1 });
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if sampleTime is greater than 10000", async () => {
      variableBody.sampleTime = 10001;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if archiveSampleTime is less than 1", async () => {
      variableBody.archiveSampleTime = 0;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if archiveSampleTime is greater than 10000", async () => {
      variableBody.archiveSampleTime = 10001;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if value is invalid", async () => {
      variableBody.value = 1;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable has invalid length - to big", async () => {
      variableBody.value = [1, 2, 3];

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable has invalid length - to small", async () => {
      variableBody.value = [1];

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if unit is longer than 10", async () => {
      variableBody.unit = new Array(11 + 1).join("a").toString();

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if archived is no boolean", async () => {
      variableBody.archived = "fakeArchived";

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if offset is smaller than 0", async () => {
      variableBody.offset = -1;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if offset is greater than 10000", async () => {
      variableBody.offset = 10001;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if dbNumber is greater than 65535 and areaType is DB", async () => {
      variableBody.areaType = "DB";
      variableBody.dbNumber = 65536;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return code 400 and do not create variable if dbNumber is smaller than 1 and areaType is DB", async () => {
      variableBody.areaType = "DB";
      variableBody.dbNumber = 0;

      let variablesBefore = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      let result = await exec();

      let variablesAfter = await Project.CurrentProject.getAllVariables(
        deviceId
      );

      expect(result.status).toEqual(400);

      expect(variablesBefore).toEqual(variablesAfter);
    });

    it("S7ByteArrayVariable - should return 200 and create variable based on payload (set dbNumber to default value 1) - if dbNumber is greater than 65535 but area is I", async () => {
      variableBody.areaType = "I";
      variableBody.dbNumber = 65536;

      let initialCount = (await Project.CurrentProject.getAllVariables(
        deviceId
      )).length;

      let result = await exec();

      expect(result.status).toEqual(200);

      //Checking if there is one more variable
      let laterCount = (await Project.CurrentProject.getAllVariables(deviceId))
        .length;

      expect(initialCount + 1).toEqual(laterCount);

      //Checking if new variable exists
      let variableExistsAfter = await Project.CurrentProject.doesVariableExist(
        deviceId,
        result.body.id
      );

      expect(variableExistsAfter).toBeTruthy();

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        type: variable.Type,
        name: variable.Name,
        sampleTime: variable.SampleTime,
        value: variable.Value,
        unit: variable.Unit,
        archived: variable.Archived,
        offset: variable.Offset,
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber,
        archiveSampleTime: variable.ArchiveSampleTime,
        write: variable.Write,
        length: variable.Length
      };

      expect(variablePayload).toEqual({ ...variableBody, dbNumber: 1 });
    });

    it("S7ByteArrayVariable - should return 200 and create variable based on payload (set dbNumber to default value 1) - if dbNumber is greater than 65535 but area is Q", async () => {
      variableBody.areaType = "Q";
      variableBody.dbNumber = 65536;

      let initialCount = (await Project.CurrentProject.getAllVariables(
        deviceId
      )).length;

      let result = await exec();

      expect(result.status).toEqual(200);

      //Checking if there is one more variable
      let laterCount = (await Project.CurrentProject.getAllVariables(deviceId))
        .length;

      expect(initialCount + 1).toEqual(laterCount);

      //Checking if new variable exists
      let variableExistsAfter = await Project.CurrentProject.doesVariableExist(
        deviceId,
        result.body.id
      );

      expect(variableExistsAfter).toBeTruthy();

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        type: variable.Type,
        name: variable.Name,
        sampleTime: variable.SampleTime,
        value: variable.Value,
        unit: variable.Unit,
        archived: variable.Archived,
        offset: variable.Offset,
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber,
        archiveSampleTime: variable.ArchiveSampleTime,
        write: variable.Write,
        length: variable.Length
      };

      expect(variablePayload).toEqual({ ...variableBody, dbNumber: 1 });
    });

    it("S7ByteArrayVariable - should return 200 and create variable based on payload (set dbNumber to default value 1) - if dbNumber is greater than 65535 but area is M", async () => {
      variableBody.areaType = "M";
      variableBody.dbNumber = 65536;

      let initialCount = (await Project.CurrentProject.getAllVariables(
        deviceId
      )).length;

      let result = await exec();

      expect(result.status).toEqual(200);

      //Checking if there is one more variable
      let laterCount = (await Project.CurrentProject.getAllVariables(deviceId))
        .length;

      expect(initialCount + 1).toEqual(laterCount);

      //Checking if new variable exists
      let variableExistsAfter = await Project.CurrentProject.doesVariableExist(
        deviceId,
        result.body.id
      );

      expect(variableExistsAfter).toBeTruthy();

      let variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );

      let variablePayload = {
        type: variable.Type,
        name: variable.Name,
        sampleTime: variable.SampleTime,
        value: variable.Value,
        unit: variable.Unit,
        archived: variable.Archived,
        offset: variable.Offset,
        areaType: variable.AreaType,
        dbNumber: variable.DBNumber,
        archiveSampleTime: variable.ArchiveSampleTime,
        write: variable.Write,
        length: variable.Length
      };

      expect(variablePayload).toEqual({ ...variableBody, dbNumber: 1 });
    });
  });
});
