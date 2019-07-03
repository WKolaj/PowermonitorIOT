const config = require("config");
const request = require("supertest");
const { clearDirectoryAsync, snooze } = require("../../../utilities/utilities");
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
      type: "float",
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

  describe("GET /:deviceId", () => {
    let token;
    let deviceId;
    let variableId;
    let variablePayload;
    let variable;
    let value1;
    let value2;
    let value3;
    let value4;
    let value5;
    let tickId1;
    let tickId2;
    let tickId3;
    let tickId4;
    let tickId5;
    let currentValue;
    let currentTickId;

    beforeEach(async () => {
      await init();
      token = await visuUser.generateToken();
      deviceId = mbDevice.Id;
      currentValue = 123.321;
      currentTickId = 600;
      value1 = 10;
      value2 = 20;
      value3 = 30;
      value4 = 40;
      value5 = 50;
      tickId1 = 100;
      tickId1 = 200;
      tickId1 = 300;
      tickId1 = 400;
      tickId1 = 500;

      variablePayload = {
        type: "float",
        name: "test variable",
        archived: true,
        offset: 100,
        fCode: 3
      };

      let adminToken = await dataAdmin.generateToken();

      let result = await request(server)
        .post(`/api/variables/${deviceId}`)
        .set(tokenHeader, adminToken)
        .send(variablePayload);

      variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );
      variableId = variable.Id;

      //Assignning current value to variable
      variable.Value = currentValue;
      variable.ValueTickId = currentTickId;
    });

    let exec = async () => {
      if (value1 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId1, {
          [variable.Id]: value1
        });
      if (value2 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId2, {
          [variable.Id]: value2
        });
      if (value3 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId3, {
          [variable.Id]: value3
        });
      if (value4 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId4, {
          [variable.Id]: value4
        });
      if (value5 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId5, {
          [variable.Id]: value5
        });

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

    it("should return code 200 and valid payload contaning all variables, calcElement and their current values", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {};

      let allVariables = await Project.CurrentProject.getAllVariables(deviceId);

      for (let variable of allVariables) {
        expectedPayload[variable.Id] = variable.Value;
      }

      let allCalcElements = await Project.CurrentProject.getAllCalcElements(
        deviceId
      );

      for (let element of allCalcElements) {
        expectedPayload[element.Id] = element.Value;
      }

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return empty object if there are no variables and calcElement", async () => {
      //Deleting all variables
      let allVariables = await Project.CurrentProject.getAllVariables(deviceId);

      for (let variable of allVariables) {
        await Project.CurrentProject.deleteVariable(deviceId, variable.Id);
      }

      //Deleting all calcElements
      let allCalcElements = await Project.CurrentProject.getAllCalcElements(
        deviceId
      );

      for (let element of allCalcElements) {
        await Project.CurrentProject.deleteCalcElement(deviceId, element.Id);
      }

      let result = await exec();

      expect(result.status).toEqual(200);
      expect(result.body).toEqual({});
    });

    it("should return code 404 if there is no device of given id", async () => {
      deviceId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no device`);
    });

    it("should return code 401 if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
    });

    it("should return code 403 if user does not have visu rights", async () => {
      token = await operateUser.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
    });
  });

  describe("GET /:deviceId/:variableId", () => {
    let token;
    let deviceId;
    let variableId;
    let variablePayload;
    let variable;
    let value1;
    let value2;
    let value3;
    let value4;
    let value5;
    let tickId1;
    let tickId2;
    let tickId3;
    let tickId4;
    let tickId5;
    let currentValue;
    let currentTickId;

    beforeEach(async () => {
      await init();
      token = await visuUser.generateToken();
      deviceId = mbDevice.Id;
      currentValue = 123.321;
      currentTickId = 600;
      value1 = 10;
      value2 = 20;
      value3 = 30;
      value4 = 40;
      value5 = 50;
      tickId1 = 100;
      tickId1 = 200;
      tickId1 = 300;
      tickId1 = 400;
      tickId1 = 500;

      variablePayload = {
        type: "float",
        name: "test variable",
        archived: true,
        offset: 100,
        fCode: 3
      };

      let adminToken = await dataAdmin.generateToken();

      let result = await request(server)
        .post(`/api/variables/${deviceId}`)
        .set(tokenHeader, adminToken)
        .send(variablePayload);

      variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );
      variableId = variable.Id;

      //Assignning current value to variable
      variable.Value = currentValue;
      variable.ValueTickId = currentTickId;
    });

    let exec = async () => {
      if (value1 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId1, {
          [variable.Id]: value1
        });
      if (value2 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId2, {
          [variable.Id]: value2
        });
      if (value3 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId3, {
          [variable.Id]: value3
        });
      if (value4 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId4, {
          [variable.Id]: value4
        });
      if (value5 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId5, {
          [variable.Id]: value5
        });

      if (token) {
        return request(server)
          .get(`${endpoint}/${deviceId}/${variableId}`)
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .get(`${endpoint}/${deviceId}/${variableId}`)
          .send();
      }
    };

    it("should return code 200 and valid payload contaning variable current value and ValueTickId", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = { [variable.ValueTickId]: variable.Value };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 404 if there is no device of given id", async () => {
      deviceId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no device`);
    });

    it("should return code 404 if there is no variable of given id", async () => {
      variableId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no element`);
    });

    it("should return code 401 if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
    });

    it("should return code 403 if user does not have visu rights", async () => {
      token = await operateUser.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
    });
  });

  describe("GET /:deviceId/:calcElementId", () => {
    let token;
    let deviceId;
    let variableId;
    let variablePayload;
    let variable;
    let value1;
    let value2;
    let value3;
    let value4;
    let value5;
    let tickId1;
    let tickId2;
    let tickId3;
    let tickId4;
    let tickId5;
    let currentValue;
    let currentTickId;

    beforeEach(async () => {
      await init();
      token = await visuUser.generateToken();
      deviceId = mbDevice.Id;
      currentValue = 123.321;
      currentTickId = 600;
      value1 = 10;
      value2 = 20;
      value3 = 30;
      value4 = 40;
      value5 = 50;
      tickId1 = 100;
      tickId1 = 200;
      tickId1 = 300;
      tickId1 = 400;
      tickId1 = 500;

      variablePayload = {
        type: "factorElement",
        name: "test calcElement",
        archived: true,
        factor: 2,
        variableId: mbFloatVariable.Id
      };

      let adminToken = await dataAdmin.generateToken();

      let result = await request(server)
        .post(`/api/calcElements/${deviceId}`)
        .set(tokenHeader, adminToken)
        .send(variablePayload);

      variable = await Project.CurrentProject.getCalcElement(
        deviceId,
        result.body.id
      );
      variableId = variable.Id;

      //Assignning current value to variable
      variable.Value = currentValue;
      variable.ValueTickId = currentTickId;
    });

    let exec = async () => {
      if (value1 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId1, {
          [variable.Id]: value1
        });
      if (value2 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId2, {
          [variable.Id]: value2
        });
      if (value3 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId3, {
          [variable.Id]: value3
        });
      if (value4 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId4, {
          [variable.Id]: value4
        });
      if (value5 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId5, {
          [variable.Id]: value5
        });

      if (token) {
        return request(server)
          .get(`${endpoint}/${deviceId}/${variableId}`)
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .get(`${endpoint}/${deviceId}/${variableId}`)
          .send();
      }
    };

    it("should return code 200 and valid payload contaning calcElement current value and ValueTickId", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = { [variable.ValueTickId]: variable.Value };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 404 if there is no device of given id", async () => {
      deviceId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no device`);
    });

    it("should return code 404 if there is no calcElement of given id", async () => {
      variableId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no element`);
    });

    it("should return code 401 if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
    });

    it("should return code 403 if user does not have visu rights", async () => {
      token = await operateUser.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
    });
  });

  describe("GET /:deviceId/:variableId?timestamp", () => {
    let token;
    let deviceId;
    let variableId;
    let variablePayload;
    let variable;
    let value1;
    let value2;
    let value3;
    let value4;
    let value5;
    let tickId1;
    let tickId2;
    let tickId3;
    let tickId4;
    let tickId5;
    let currentValue;
    let currentTickId;
    let timestamp;

    beforeEach(async () => {
      await init();
      token = await visuUser.generateToken();
      deviceId = mbDevice.Id;
      currentValue = 123.321;
      currentTickId = 600;
      value1 = 10;
      value2 = 20;
      value3 = 30;
      value4 = 40;
      value5 = 50;
      tickId1 = 100;
      tickId2 = 200;
      tickId3 = 300;
      tickId4 = 400;
      tickId5 = 500;

      variablePayload = {
        type: "float",
        name: "test variable",
        archived: true,
        offset: 100,
        fCode: 3
      };

      let adminToken = await dataAdmin.generateToken();

      let result = await request(server)
        .post(`/api/variables/${deviceId}`)
        .set(tokenHeader, adminToken)
        .send(variablePayload);

      variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );
      variableId = variable.Id;

      //Assignning current value to variable
      variable.Value = currentValue;
      variable.ValueTickId = currentTickId;
      timestamp = tickId3;
    });

    let exec = async () => {
      if (value1 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId1, {
          [variable.Id]: value1
        });
      if (value2 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId2, {
          [variable.Id]: value2
        });
      if (value3 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId3, {
          [variable.Id]: value3
        });
      if (value4 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId4, {
          [variable.Id]: value4
        });
      if (value5 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId5, {
          [variable.Id]: value5
        });

      if (token) {
        return request(server)
          .get(`${endpoint}/${deviceId}/${variableId}?timestamp=${timestamp}`)
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .get(`${endpoint}/${deviceId}/${variableId}?timestamp=${timestamp}`)
          .send();
      }
    };

    it("should return code 200 and valid payload contaning variable  value from database associated with given timestamp", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = { [tickId3]: value3 };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning variable  value from database with the last value in db if there is no such tickId in database", async () => {
      //getting still value3 - cause time stamp is between tickId4 and tickId3
      timestamp = tickId3 + (tickId4 - tickId3) / 2;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = { [tickId3]: value3 };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning variable last value from database if tickId is longer than accessible in database", async () => {
      timestamp = 9999999999;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = { [tickId5]: value5 };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning empty object if tickId is smaller than first tick in database", async () => {
      timestamp = 10;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {};

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning empty object if variable is not archived", async () => {
      variableId = mbFloatVariable.Id;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {};

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 404 if there is no device of given id", async () => {
      deviceId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no device`);
    });

    it("should return code 404 if there is no variable of given id", async () => {
      variableId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no element`);
    });

    it("should return code 401 if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
    });

    it("should return code 403 if user does not have visu rights", async () => {
      token = await operateUser.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
    });
  });

  describe("GET /:deviceId/:calcElementId?timestamp", () => {
    let token;
    let deviceId;
    let variableId;
    let variablePayload;
    let variable;
    let value1;
    let value2;
    let value3;
    let value4;
    let value5;
    let tickId1;
    let tickId2;
    let tickId3;
    let tickId4;
    let tickId5;
    let currentValue;
    let currentTickId;
    let timestamp;

    beforeEach(async () => {
      await init();
      token = await visuUser.generateToken();
      deviceId = mbDevice.Id;
      currentValue = 123.321;
      currentTickId = 600;
      value1 = 10;
      value2 = 20;
      value3 = 30;
      value4 = 40;
      value5 = 50;
      tickId1 = 100;
      tickId2 = 200;
      tickId3 = 300;
      tickId4 = 400;
      tickId5 = 500;

      variablePayload = {
        type: "factorElement",
        name: "test calcElement",
        archived: true,
        factor: 2,
        variableId: mbFloatVariable.Id
      };

      let adminToken = await dataAdmin.generateToken();

      let result = await request(server)
        .post(`/api/calcElements/${deviceId}`)
        .set(tokenHeader, adminToken)
        .send(variablePayload);

      variable = await Project.CurrentProject.getCalcElement(
        deviceId,
        result.body.id
      );
      variableId = variable.Id;

      //Assignning current value to variable
      variable.Value = currentValue;
      variable.ValueTickId = currentTickId;
      timestamp = tickId3;
    });

    let exec = async () => {
      if (value1 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId1, {
          [variable.Id]: value1
        });
      if (value2 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId2, {
          [variable.Id]: value2
        });
      if (value3 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId3, {
          [variable.Id]: value3
        });
      if (value4 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId4, {
          [variable.Id]: value4
        });
      if (value5 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId5, {
          [variable.Id]: value5
        });

      if (token) {
        return request(server)
          .get(`${endpoint}/${deviceId}/${variableId}?timestamp=${timestamp}`)
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .get(`${endpoint}/${deviceId}/${variableId}?timestamp=${timestamp}`)
          .send();
      }
    };

    it("should return code 200 and valid payload contaning calcElement  value from database associated with given timestamp", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = { [tickId3]: value3 };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning calcElement  value from database with the last value in db if there is no such tickId in database", async () => {
      //getting still value3 - cause time stamp is between tickId4 and tickId3
      timestamp = tickId3 + (tickId4 - tickId3) / 2;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = { [tickId3]: value3 };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning calcElement last value from database if tickId is longer than accessible in database", async () => {
      timestamp = 9999999999;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = { [tickId5]: value5 };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning empty object if tickId is smaller than first tick in database", async () => {
      timestamp = 10;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {};

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning empty object if calcElement is not archived", async () => {
      variableId = factorElement.Id;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {};

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 404 if there is no device of given id", async () => {
      deviceId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no device`);
    });

    it("should return code 404 if there is no calcElement of given id", async () => {
      variableId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no element`);
    });

    it("should return code 401 if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
    });

    it("should return code 403 if user does not have visu rights", async () => {
      token = await operateUser.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
    });
  });

  describe("GET /:deviceId/:variableId?timeRangeStart&timeRangeStop", () => {
    let token;
    let deviceId;
    let variableId;
    let variablePayload;
    let variable;
    let value1;
    let value2;
    let value3;
    let value4;
    let value5;
    let tickId1;
    let tickId2;
    let tickId3;
    let tickId4;
    let tickId5;
    let currentValue;
    let currentTickId;
    let timeRangeStart;
    let timeRangeStop;

    beforeEach(async () => {
      await init();
      token = await visuUser.generateToken();
      deviceId = mbDevice.Id;
      currentValue = 123.321;
      currentTickId = 600;
      value1 = 10;
      value2 = 20;
      value3 = 30;
      value4 = 40;
      value5 = 50;
      tickId1 = 100;
      tickId2 = 200;
      tickId3 = 300;
      tickId4 = 400;
      tickId5 = 500;

      variablePayload = {
        type: "float",
        name: "test variable",
        archived: true,
        offset: 100,
        fCode: 3
      };

      let adminToken = await dataAdmin.generateToken();

      let result = await request(server)
        .post(`/api/variables/${deviceId}`)
        .set(tokenHeader, adminToken)
        .send(variablePayload);

      variable = await Project.CurrentProject.getVariable(
        deviceId,
        result.body.id
      );
      variableId = variable.Id;

      //Assignning current value to variable
      variable.Value = currentValue;
      variable.ValueTickId = currentTickId;

      timeRangeStart = tickId2;
      timeRangeStop = tickId4;
    });

    let exec = async () => {
      if (value1 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId1, {
          [variable.Id]: value1
        });
      if (value2 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId2, {
          [variable.Id]: value2
        });
      if (value3 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId3, {
          [variable.Id]: value3
        });
      if (value4 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId4, {
          [variable.Id]: value4
        });
      if (value5 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId5, {
          [variable.Id]: value5
        });

      if (token) {
        return request(server)
          .get(
            `${endpoint}/${deviceId}/${variableId}?timeRangeStart=${timeRangeStart}&timeRangeStop=${timeRangeStop}`
          )
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .get(
            `${endpoint}/${deviceId}/${variableId}?timeRangeStart=${timeRangeStart}&timeRangeStop=${timeRangeStop}`
          )
          .send();
      }
    };

    it("should return code 200 and valid payload contaning all values from database between start and stop time range stamps", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {
        [tickId2]: value2,
        [tickId3]: value3,
        [tickId4]: value4
      };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning variable  value from database ending on last value in db if timeRangeStop is longer than last tickId in db", async () => {
      //getting still value3 - cause time stamp is between tickId4 and tickId3
      timeRangeStop = 99999;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {
        [tickId2]: value2,
        [tickId3]: value3,
        [tickId4]: value4,
        [tickId5]: value5
      };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning variable  value from database starting with first value in db if timeRangeStart is smaller than first tickId in db", async () => {
      //getting still value3 - cause time stamp is between tickId4 and tickId3
      timeRangeStart = 1;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {
        [tickId1]: value1,
        [tickId2]: value2,
        [tickId3]: value3,
        [tickId4]: value4
      };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning empty object if timeRange is outside database period", async () => {
      timeRangeStart = 10;
      timeRangeStop = 20;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {};

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning empty object if startRange is bigger than endRange", async () => {
      timeRangeStart = 300;
      timeRangeStop = 200;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {};

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning empty object if variable is not archived", async () => {
      variableId = mbFloatVariable.Id;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {};

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 400 if timeRangeStart is invalid", async () => {
      timeRangeStart = "abcd";

      let result = await exec();

      expect(result.status).toEqual(400);
    });

    it("should return code 400 if timeRangeStop is invalid", async () => {
      timeRangeStop = "abcd";

      let result = await exec();

      expect(result.status).toEqual(400);
    });

    it("should return code 404 if there is no device of given id", async () => {
      deviceId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no device`);
    });

    it("should return code 404 if there is no variable of given id", async () => {
      variableId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no element`);
    });

    it("should return code 401 if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
    });

    it("should return code 403 if user does not have visu rights", async () => {
      token = await operateUser.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
    });
  });

  describe("GET /:deviceId/:calcElementId?timeRangeStart&timeRangeStop", () => {
    let token;
    let deviceId;
    let variableId;
    let variablePayload;
    let variable;
    let value1;
    let value2;
    let value3;
    let value4;
    let value5;
    let tickId1;
    let tickId2;
    let tickId3;
    let tickId4;
    let tickId5;
    let currentValue;
    let currentTickId;
    let timeRangeStart;
    let timeRangeStop;

    beforeEach(async () => {
      await init();
      token = await visuUser.generateToken();
      deviceId = mbDevice.Id;
      currentValue = 123.321;
      currentTickId = 600;
      value1 = 10;
      value2 = 20;
      value3 = 30;
      value4 = 40;
      value5 = 50;
      tickId1 = 100;
      tickId2 = 200;
      tickId3 = 300;
      tickId4 = 400;
      tickId5 = 500;

      variablePayload = {
        type: "factorElement",
        name: "test calcElement",
        archived: true,
        factor: 2,
        variableId: mbFloatVariable.Id
      };

      let adminToken = await dataAdmin.generateToken();

      let result = await request(server)
        .post(`/api/calcElements/${deviceId}`)
        .set(tokenHeader, adminToken)
        .send(variablePayload);

      variable = await Project.CurrentProject.getCalcElement(
        deviceId,
        result.body.id
      );
      variableId = variable.Id;

      //Assignning current value to variable
      variable.Value = currentValue;
      variable.ValueTickId = currentTickId;

      timeRangeStart = tickId2;
      timeRangeStop = tickId4;
    });

    let exec = async () => {
      if (value1 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId1, {
          [variable.Id]: value1
        });
      if (value2 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId2, {
          [variable.Id]: value2
        });
      if (value3 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId3, {
          [variable.Id]: value3
        });
      if (value4 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId4, {
          [variable.Id]: value4
        });
      if (value5 !== undefined)
        await variable.Device.ArchiveManager.insertValues(tickId5, {
          [variable.Id]: value5
        });

      if (token) {
        return request(server)
          .get(
            `${endpoint}/${deviceId}/${variableId}?timeRangeStart=${timeRangeStart}&timeRangeStop=${timeRangeStop}`
          )
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .get(
            `${endpoint}/${deviceId}/${variableId}?timeRangeStart=${timeRangeStart}&timeRangeStop=${timeRangeStop}`
          )
          .send();
      }
    };

    it("should return code 200 and valid payload contaning all values from database between start and stop time range stamps", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {
        [tickId2]: value2,
        [tickId3]: value3,
        [tickId4]: value4
      };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning calcElement  value from database ending on last value in db if timeRangeStop is longer than last tickId in db", async () => {
      //getting still value3 - cause time stamp is between tickId4 and tickId3
      timeRangeStop = 99999;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {
        [tickId2]: value2,
        [tickId3]: value3,
        [tickId4]: value4,
        [tickId5]: value5
      };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning calcElement  value from database starting with first value in db if timeRangeStart is smaller than first tickId in db", async () => {
      //getting still value3 - cause time stamp is between tickId4 and tickId3
      timeRangeStart = 1;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {
        [tickId1]: value1,
        [tickId2]: value2,
        [tickId3]: value3,
        [tickId4]: value4
      };

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning empty object if timeRange is outside database period", async () => {
      timeRangeStart = 10;
      timeRangeStop = 20;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {};

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning empty object if startRange is bigger than endRange", async () => {
      timeRangeStart = 300;
      timeRangeStop = 200;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {};

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 200 and valid payload contaning empty object if calcElement is not archived", async () => {
      variableId = averageElement.Id;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {};

      expect(result.body).toEqual(expectedPayload);
    });

    it("should return code 400 if timeRangeStart is invalid", async () => {
      timeRangeStart = "abcd";

      let result = await exec();

      expect(result.status).toEqual(400);
    });

    it("should return code 400 if timeRangeStop is invalid", async () => {
      timeRangeStop = "abcd";

      let result = await exec();

      expect(result.status).toEqual(400);
    });

    it("should return code 404 if there is no device of given id", async () => {
      deviceId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no device`);
    });

    it("should return code 404 if there is no calcElement of given id", async () => {
      variableId = "4321";

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(`There is no element`);
    });

    it("should return code 401 if there is no user logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(`Access denied. No token provided`);
    });

    it("should return code 403 if user does not have visu rights", async () => {
      token = await operateUser.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(`Access forbidden`);
    });
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

    it("should return code 200, payload containing new value and set value to given variable - averageElement", async () => {
      variableId = averageElement.Id;
      valueToSet = 1234.3214;

      let result = await exec();
      console.log(result.text);
      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(averageElement.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - factorElement", async () => {
      variableId = factorElement.Id;
      valueToSet = 1234.3214;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(factorElement.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - sumElement", async () => {
      variableId = sumElement.Id;
      valueToSet = 1234.3214;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(sumElement.Value).toEqual(valueToSet);
    });

    it("should return code 200, payload containing new value and set value to given variable - increaseElement", async () => {
      variableId = increaseElement.Id;
      valueToSet = 1234.3214;

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(Object.values(result.body)[0]).toEqual(valueToSet);

      expect(increaseElement.Value).toEqual(valueToSet);
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
      expect(result.text).toMatch(`There is no element`);
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
  });
});
