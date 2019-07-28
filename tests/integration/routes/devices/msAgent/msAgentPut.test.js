const config = require("config");
const request = require("supertest");
const {
  clearDirectoryAsync,
  snooze,
  existsAndIsNotEmpty,
  exists
} = require("../../../../../utilities/utilities");
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
  let adminToken;

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

    adminToken = await (await Project.CurrentProject.getUser(
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
  };

  let createInitialMSAgent = async (
    initialPayload,
    variable1Payload,
    variable2Payload,
    variable3Payload,
    initialDataAgentPayload,
    variable1MSName,
    variable2MSName,
    variable3MSName,
    initialEventVariables
  ) => {
    let msAgentResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(initialPayload);

    let msAgent = await Project.CurrentProject.getDevice(msAgentResult.body.id);

    let variable1Result = await request(server)
      .post(`/api/variables/${msAgent.Id}`)
      .set(tokenHeader, adminToken)
      .send(variable1Payload);

    let variable2Result = await request(server)
      .post(`/api/variables/${msAgent.Id}`)
      .set(tokenHeader, adminToken)
      .send(variable2Payload);

    let variable3Result = await request(server)
      .post(`/api/variables/${msAgent.Id}`)
      .set(tokenHeader, adminToken)
      .send(variable3Payload);

    if (existsAndIsNotEmpty(initialDataAgentPayload)) {
      initialDataAgentPayload.variableNames = {
        [variable1Result.body.id]: variable1MSName,
        [variable2Result.body.id]: variable2MSName,
        [variable3Result.body.id]: variable3MSName
      };

      let agentEditPayload = {
        dataAgent: initialDataAgentPayload
      };

      let result = await request(server)
        .put(`/api/devices/${msAgent.Id}`)
        .set(tokenHeader, adminToken)
        .send(agentEditPayload);
    }

    if (exists(initialEventVariables)) {
      let result = await request(server)
        .put(`/api/devices/${msAgent.Id}`)
        .set(tokenHeader, adminToken)
        .send({ eventVariables: initialEventVariables });
    }

    return msAgent;
  };

  beforeEach(async () => {
    jest.resetModules();

    //Project class has to be reloaded
    Project = require("../../../../../classes/project/Project");
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
    projPath = config.get("projPath");
    tokenHeader = config.get("tokenHeader");
    server = await require("../../../../../startup/app")();
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

  describe("PUT /:deviceId", () => {
    let token;
    let msAgent;
    let deviceId;
    let initPayload;
    let initDataAgentPayload;
    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let initialVariable1MSName;
    let initialVariable2MSName;
    let initialVariable3MSName;
    let editPayload;
    let oldMindConnectAgent;
    let initialDevicePayload;
    let initialEventVariables;

    beforeEach(async () => {
      await init();

      initPayload = {
        name: "testMSAgent",
        type: "msAgent"
      };

      initDataAgentPayload = {
        sendingEnabled: false,
        sendingInterval: 100,
        sendFileLimit: 10,
        sendEventLimit: 9,
        boardingKey: {
          content: {
            baseUrl: "https://southgate.eu1.mindsphere.io",
            iat: "testIatvalue",
            clientCredentialProfile: ["SHARED_SECRET"],
            clientId: "testClientId",
            tenant: "testTenant"
          },
          expiration: "2019-07-18T05:06:57.000Z"
        },
        numberOfSendingRetries: 7,
        eventDescriptions: {
          "1001": {
            source: "testSource1",
            severity: 20,
            description: "test event 1"
          },
          "1002": {
            source: "testSource2",
            severity: 20,
            description: "test event 2"
          },
          "1003": {
            source: "testSource3",
            severity: 20,
            description: "test event 3"
          },
          "1004": {
            source: "testSource4",
            severity: 20,
            description: "test event 4"
          },
          "1005": {
            source: "testSource5",
            severity: 20,
            description: "test event 5"
          },
          "1006": {
            source: "testSource6",
            severity: 20,
            description: "test event 6"
          },
          "1007": {
            source: "testSource7",
            severity: 20,
            description: "test event 7"
          },
          "1008": {
            source: "testSource8",
            severity: 20,
            description: "test event 8"
          },
          "1009": {
            source: "testSource9",
            severity: 20,
            description: "test event 9"
          }
        }
      };

      initialEventVariables = [
        {
          tickDevId: mbDevice.Id,
          valueDevId: mbDevice.Id,
          tickVarId: mbInt16Variable.Id,
          valueVarId: mbUInt16Variable.Id
        },
        {
          tickDevId: mbDevice.Id,
          valueDevId: mbDevice.Id,
          tickVarId: mbInt32Variable.Id,
          valueVarId: mbUInt32Variable.Id
        }
      ];

      variable1Payload = {
        name: "variable1",
        type: "sdVariable",
        elementId: mbFloatVariable.Id,
        elementDeviceId: mbDevice.Id
      };

      variable2Payload = {
        name: "variable2",
        type: "sdVariable",
        elementId: mbInt32Variable.Id,
        elementDeviceId: mbDevice.Id
      };

      variable3Payload = {
        name: "variable3",
        type: "sdVariable",
        elementId: mbInt16Variable.Id,
        elementDeviceId: mbDevice.Id
      };

      initialVariable1MSName = "msVar1";
      initialVariable2MSName = "msVar2";
      initialVariable3MSName = "msVar3";

      token = await dataAdmin.generateToken();

      //VARIABLES ARE FAKE! - only for payload testing
      editPayload = {
        name: "msAgentEdited",
        dataAgent: {
          boardingKey: {
            content: {
              baseUrl: "https://southgate.eu1.mindsphere.io2",
              iat: "testIat2",
              clientCredentialProfile: ["SHARED_SECRET"],
              clientId: "testId2",
              tenant: "testTenant2"
            },
            expiration: "2019-07-20T20:21:39.000Z"
          },
          sendingEnabled: true,
          sendingInterval: 101,
          sendFileLimit: 4,
          sendEventLimit: 7,
          numberOfSendingRetries: 6,
          variableNames: {
            testId1: "testAgentVariableEdited1",
            testId2: "testAgentVariableEdited2",
            testId3: "testAgentVariableEdited3"
          },
          eventDescriptions: {
            "1002": {
              source: "testSource2",
              severity: 20,
              description: "test event 2"
            },
            "1003": {
              source: "testSource3",
              severity: 20,
              description: "test event 3"
            },
            "1004": {
              source: "testSource4",
              severity: 20,
              description: "test event 4"
            },
            "1005": {
              source: "testSource5",
              severity: 20,
              description: "test event 5"
            },
            "1006": {
              source: "testSource6",
              severity: 20,
              description: "test event 6"
            },
            "1007": {
              source: "testSource7",
              severity: 20,
              description: "test event 7"
            },
            "1008": {
              source: "testSource8",
              severity: 20,
              description: "test event 8"
            },
            "1010": {
              source: "testSource10",
              severity: 20,
              description: "test event 10"
            }
          }
        },
        eventVariables: [
          {
            tickDevId: mbDevice.Id,
            valueDevId: mbDevice.Id,
            tickVarId: mbInt32Variable.Id,
            valueVarId: mbUInt32Variable.Id
          },
          {
            tickDevId: mbDevice.Id,
            valueDevId: mbDevice.Id,
            tickVarId: mbSwappedInt32Variable.Id,
            valueVarId: mbSwappedUInt32Variable.Id
          },
          {
            tickDevId: mbDevice.Id,
            valueDevId: mbDevice.Id,
            tickVarId: mbFloatVariable.Id,
            valueVarId: mbSwappedFloatVariable.Id
          }
        ]
      };
    });

    let exec = async () => {
      msAgent = await createInitialMSAgent(
        initPayload,
        variable1Payload,
        variable2Payload,
        variable3Payload,
        initDataAgentPayload,
        initialVariable1MSName,
        initialVariable2MSName,
        initialVariable3MSName,
        initialEventVariables
      );

      oldMindConnectAgent = msAgent.DataAgent.MindConnectAgent;

      initialDevicePayload = msAgent.Payload;

      deviceId = msAgent.Id;

      if (token) {
        return request(server)
          .put(`${endpoint}/${deviceId}`)
          .set(tokenHeader, token)
          .send(editPayload);
      } else {
        return request(server)
          .put(`${endpoint}/${deviceId}`)
          .send(editPayload);
      }
    };

    it("should return code 200 and device payload based on given id", async () => {
      let result = await exec();

      let expecetedAgent = {
        ...editPayload.dataAgent
      };

      let expectedPayload = {
        id: msAgent.Id,
        name: msAgent.Name,
        type: msAgent.Type,
        connected: true,
        eventVariables: editPayload.eventVariables,
        dataAgent: expecetedAgent
      };

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
      expect(result.status).toEqual(200);

      expect(result.body).toEqual(expectedPayload);
    });

    it("should edit msAgent based on given payload", async () => {
      let result = await exec();

      let expecetedAgent = {
        ...editPayload.dataAgent,
        eventBufferSize: editPayload.eventVariables.length,
        dirPath: msAgent.DataAgent.DirectoryPath
      };

      let expectedPayload = {
        id: msAgent.Id,
        name: msAgent.Name,
        type: msAgent.Type,
        dataAgent: expecetedAgent,
        eventVariables: editPayload.eventVariables
      };

      expectedPayload.calculationElements = (await Project.CurrentProject.getAllCalcElements(
        deviceId
      )).map(calcElement => {
        return calcElement.Payload;
      });

      expectedPayload.variables = (await Project.CurrentProject.getAllVariables(
        deviceId
      )).map(variable => {
        return variable.Payload;
      });

      expect(msAgent.Payload).toEqual(expectedPayload);
    });

    it("should return 400 and not edit anything if id is given inside payload", async () => {
      editPayload.id = "fakeId";
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if name is shorter than 3", async () => {
      editPayload.name = "2";
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if name is longer than 100", async () => {
      editPayload.name = new Array(101 + 1).join("a").toString();
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 200 but not edit anything if dataAgent is empty", async () => {
      editPayload = {
        dataAgent: {}
      };
      let result = await exec();

      expect(result.status).toEqual(200);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if sendFileLimit is smaller than 1", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          sendFileLimit: 0
        }
      };
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if sendFileLimit is higher than 10", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          sendFileLimit: 11
        }
      };
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if sendingInterval is smaller than 10", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          sendingInterval: 9
        }
      };
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if sendingInterval is higher than 10 000", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          sendingInterval: 10001
        }
      };
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if numberOfSendingRetries is smaller than 1", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          numberOfSendingRetries: 0
        }
      };
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if numberOfSendingRetries is higher than 10", async () => {
      editPayload = {
        dataAgent: {
          numberOfSendingRetries: 11
        }
      };
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if variableNames contain faulty name", async () => {
      //Not edit device for the first time
      editPayload = {};
      await exec();

      let secondEditPayloadWithFaultyName = {
        name: "newEditName",
        dataAgent: {
          boardingKey: {
            content: {
              baseUrl: "https://southgate.eu1.mindsphere.io2",
              iat: "testIat3",
              clientCredentialProfile: ["SHARED_SECRET"],
              clientId: "testId3",
              tenant: "testTenant3"
            },
            expiration: "2019-07-21T20:21:39.000Z"
          },
          sendingEnabled: true,
          sendingInterval: 99,
          sendFileLimit: 3,
          numberOfSendingRetries: 4,
          variableNames: "falutyNames"
        }
      };

      let result = await request(server)
        .put(`${endpoint}/${deviceId}`)
        .set(tokenHeader, token)
        .send(secondEditPayloadWithFaultyName);

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if variableName is shorter than 3", async () => {
      //Not edit device for the first time
      editPayload = {};
      await exec();

      let secondEditPayloadWithFaultyName = {
        name: "newEditName",
        dataAgent: {
          boardingKey: {
            content: {
              baseUrl: "https://southgate.eu1.mindsphere.io2",
              iat: "testIat3",
              clientCredentialProfile: ["SHARED_SECRET"],
              clientId: "testId3",
              tenant: "testTenant3"
            },
            expiration: "2019-07-21T20:21:39.000Z"
          },
          sendingEnabled: true,
          sendingInterval: 99,
          sendFileLimit: 3,
          numberOfSendingRetries: 4,
          variableNames: {
            editId1: "2"
          }
        }
      };

      let result = await request(server)
        .put(`${endpoint}/${deviceId}`)
        .set(tokenHeader, token)
        .send(secondEditPayloadWithFaultyName);

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if variableName is longer than 100", async () => {
      //Not edit device for the first time
      editPayload = {};
      await exec();

      let secondEditPayloadWithFaultyName = {
        name: "newEditName",
        dataAgent: {
          boardingKey: {
            content: {
              baseUrl: "https://southgate.eu1.mindsphere.io2",
              iat: "testIat3",
              clientCredentialProfile: ["SHARED_SECRET"],
              clientId: "testId3",
              tenant: "testTenant3"
            },
            expiration: "2019-07-21T20:21:39.000Z"
          },
          sendingEnabled: true,
          sendingInterval: 99,
          sendFileLimit: 3,
          numberOfSendingRetries: 4,
          variableNames: {
            editId1: new Array(101 + 1).join("a").toString()
          }
        }
      };

      let result = await request(server)
        .put(`${endpoint}/${deviceId}`)
        .set(tokenHeader, token)
        .send(secondEditPayloadWithFaultyName);

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if variableId is shorter than 3", async () => {
      //Not edit device for the first time
      editPayload = {};
      await exec();

      let secondEditPayloadWithFaultyName = {
        name: "newEditName",
        dataAgent: {
          boardingKey: {
            content: {
              baseUrl: "https://southgate.eu1.mindsphere.io2",
              iat: "testIat3",
              clientCredentialProfile: ["SHARED_SECRET"],
              clientId: "testId3",
              tenant: "testTenant3"
            },
            expiration: "2019-07-21T20:21:39.000Z"
          },
          sendingEnabled: true,
          sendingInterval: 99,
          sendFileLimit: 3,
          numberOfSendingRetries: 4,
          variableNames: {
            "2": "testVariable"
          }
        }
      };

      let result = await request(server)
        .put(`${endpoint}/${deviceId}`)
        .set(tokenHeader, token)
        .send(secondEditPayloadWithFaultyName);

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if variableId is longer than 100", async () => {
      //Not edit device for the first time
      editPayload = {};
      await exec();

      let secondEditPayloadWithFaultyName = {
        name: "newEditName",
        dataAgent: {
          boardingKey: {
            content: {
              baseUrl: "https://southgate.eu1.mindsphere.io2",
              iat: "testIat3",
              clientCredentialProfile: ["SHARED_SECRET"],
              clientId: "testId3",
              tenant: "testTenant3"
            },
            expiration: "2019-07-21T20:21:39.000Z"
          },
          sendingEnabled: true,
          sendingInterval: 99,
          sendFileLimit: 3,
          numberOfSendingRetries: 4,
          variableNames: {
            [new Array(101 + 1).join("a").toString()]: "testVariable"
          }
        }
      };

      let result = await request(server)
        .put(`${endpoint}/${deviceId}`)
        .set(tokenHeader, token)
        .send(secondEditPayloadWithFaultyName);

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if boarding key was undefined before but sendingEnabled is true", async () => {
      initDataAgentPayload.boardingKey = undefined;
      initDataAgentPayload.sendingEnabled = false;

      //Not edit device for the first time
      editPayload = {
        sendingEnabled: true
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if boarding key is undefined but sendingEnabled is true in edit payload", async () => {
      initDataAgentPayload.sendingEnabled = false;

      //Not edit device for the first time
      editPayload = {
        boardingKey: undefined,
        sendingEnabled: true
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 200 and and set sendingEnabled to false if boarding key changes but sendingEnabled is true in edit payload but was true before", async () => {
      initDataAgentPayload.sendingEnabled = true;

      //Not edit device for the first time
      editPayload = {
        dataAgent: {
          boardingKey: editPayload.dataAgent.boardingKey
        }
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      expect(msAgent.DataAgent.BoardingKey).toEqual(
        editPayload.dataAgent.boardingKey
      );
      expect(msAgent.DataAgent.SendingEnabled).toEqual(false);
    });

    it("should call onBoard and getConfig if readyToSend was false and now it is true", async () => {
      await exec();

      expect(msAgent.DataAgent.MindConnectAgent.OnBoard).toHaveBeenCalledTimes(
        1
      );
      expect(
        msAgent.DataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).toHaveBeenCalledTimes(1);
    });

    it("should recreate MindConnectAgent with new boarding key if it is defined in payload", async () => {
      await exec();

      expect(msAgent.DataAgent.MindConnectAgent).not.toEqual(
        oldMindConnectAgent
      );
    });

    it("should not recreate MindConnectAgent with new boarding key and readyToSend are not  defined in payload", async () => {
      delete editPayload.dataAgent.sendingEnabled;
      delete editPayload.dataAgent.boardingKey;

      await exec();

      expect(msAgent.DataAgent.MindConnectAgent).toEqual(oldMindConnectAgent);
    });

    it("should create new boarding key, but not start communication if only boarding key was passed", async () => {
      initDataAgentPayload = undefined;

      editPayload = {
        dataAgent: {
          boardingKey: editPayload.dataAgent.boardingKey
        }
      };

      await exec();

      expect(msAgent.DataAgent.BoardingKey).toEqual(
        editPayload.dataAgent.boardingKey
      );

      expect(msAgent.DataAgent.MindConnectAgent.OnBoard).not.toHaveBeenCalled();
      expect(
        msAgent.DataAgent.MindConnectAgent.GetDataSourceConfiguration
      ).not.toHaveBeenCalled();
      expect(msAgent.DataAgent.SendingEnabled).toEqual(false);
    });

    it("should not edit anything and return 200 if editPayload is empty", async () => {
      editPayload = {};

      let result = await exec();

      expect(result.status).toEqual(200);

      let afterPayload = msAgent.Payload;

      expect(initialDevicePayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 200 if editPayload.dataAgent is empty", async () => {
      initDataAgentPayload = undefined;
      editPayload = {
        dataAgent: {}
      };

      let result = await exec();

      expect(result.status).toEqual(200);

      let afterPayload = msAgent.Payload;

      expect(initialDevicePayload).toEqual(afterPayload);
    });

    it("should not edit dirPath and return 400 if dirPath is defined in payload", async () => {
      initDataAgentPayload = undefined;
      editPayload = {
        dataAgent: {
          dirPath: "fakeDirPath"
        }
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialDevicePayload).toEqual(afterPayload);
    });

    it("should not edit dirPath and return 400 if dirPath is defined in payload", async () => {
      initDataAgentPayload = undefined;

      editPayload = {
        dataAgent: {
          dirPath: "fakeDirPath"
        }
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialDevicePayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if on of boardingKey is null", async () => {
      initDataAgentPayload = undefined;
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          boardingKey: null
        }
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialDevicePayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if boardingKey is invalid", async () => {
      initDataAgentPayload = undefined;
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          boardingKey: {
            fakeProp: "fakeValue"
          }
        }
      };

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialDevicePayload).toEqual(afterPayload);
    });

    it("should return code 404 and if there is no device of given id", async () => {
      //Not edit device for the first time
      editPayload = {};
      await exec();

      let secondEditPayloadWithFaultyName = {
        name: "newEditName",
        dataAgent: {
          boardingKey: {
            content: {
              baseUrl: "https://southgate.eu1.mindsphere.io2",
              iat: "testIat3",
              clientCredentialProfile: ["SHARED_SECRET"],
              clientId: "testId3",
              tenant: "testTenant3"
            },
            expiration: "2019-07-21T20:21:39.000Z"
          },
          sendingEnabled: true,
          sendingInterval: 99,
          sendFileLimit: 3,
          numberOfSendingRetries: 4,
          variableNames: {
            editId1: "testDevice"
          }
        }
      };

      let result = await request(server)
        .put(`${endpoint}/fakeDeviceId`)
        .set(tokenHeader, token)
        .send(secondEditPayloadWithFaultyName);

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

    it("should return 400 and not edit anything if event variables is not an array", async () => {
      editPayload.eventVariables = {};

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if one of event variables does not have tickVarId", async () => {
      editPayload.eventVariables[1].tickVarId = undefined;
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if one of event variables does not have valueVarId", async () => {
      editPayload.eventVariables[1].valueVarId = undefined;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if one of event variables does not have tickDevId", async () => {
      editPayload.eventVariables[1].tickDevId = undefined;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if one of event variables does not have valueDevId", async () => {
      editPayload.eventVariables[1].valueDevId = undefined;

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if there is no varaible of tickVarId", async () => {
      editPayload.eventVariables[1].tickVarId = "fakeVarId";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if there is no varaible of valueVarId", async () => {
      editPayload.eventVariables[1].valueVarId = "fakeVarId";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if there is no device of tickDevId", async () => {
      editPayload.eventVariables[1].tickDevId = "fakeVarId";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if there is no device of valueDevId", async () => {
      editPayload.eventVariables[1].valueDevId = "fakeVarId";

      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 200 and clear all event variables if eventVariables is empty array", async () => {
      editPayload = { eventVariables: [] };

      let result = await exec();

      expect(result.status).toEqual(200);
      editPayload;

      let expectedPayload = {
        ...initialDevicePayload,
        dataAgent: {
          ...initialDevicePayload.dataAgent,
          eventBufferSize: 0
        },
        eventVariables: []
      };

      expect(msAgent.Payload).toEqual(expectedPayload);
    });

    it("should return 400 and not edit anything if one of description key is not an integer", async () => {
      editPayload.dataAgent.eventDescriptions["abcd"] = {
        source: "testSourceX",
        severity: 20,
        description: "test event X"
      };

      await snooze(100);
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if there is no source in event description", async () => {
      editPayload.dataAgent.eventDescriptions[9001] = {
        source: "testSourceX",
        severity: 20
      };

      await snooze(100);
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if there is no severity", async () => {
      editPayload.dataAgent.eventDescriptions[9001] = {
        source: "testSourceX",
        description: "test event X"
      };

      await snooze(100);
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if there is no description", async () => {
      editPayload.dataAgent.eventDescriptions[9001] = {
        source: "testSourceX",
        severity: 20
      };

      await snooze(100);
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if severity has invalid value", async () => {
      editPayload.dataAgent.eventDescriptions[9001] = {
        source: "testSourceX",
        severity: 99,
        description: "test event X"
      };

      await snooze(100);
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 400 and not edit anything if eventBufferSize is inside dataAgentPayload", async () => {
      editPayload.dataAgent.eventBufferSize = 10;

      await snooze(100);
      let result = await exec();

      expect(result.status).toEqual(400);

      expect(msAgent.Payload).toEqual(initialDevicePayload);
    });

    it("should return 200 and clear all event descriptions if event descriptions is empty object", async () => {
      editPayload = { dataAgent: { eventDescriptions: {} } };

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {
        ...initialDevicePayload,
        dataAgent: {
          ...initialDevicePayload.dataAgent,
          eventDescriptions: {}
        }
      };

      expect(msAgent.Payload).toEqual(expectedPayload);
    });

    it("should return 200 and do not edit event descriptions if it is not defined in payload", async () => {
      delete editPayload.dataAgent.eventDescriptions;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {
        ...initialDevicePayload,
        ...editPayload,
        dataAgent: {
          ...initialDevicePayload.dataAgent,
          ...editPayload.dataAgent,
          eventBufferSize: editPayload.eventVariables.length,
          eventDescriptions: initDataAgentPayload.eventDescriptions
        }
      };

      await snooze(100);

      expectedPayload.calculationElements = (await Project.CurrentProject.getAllCalcElements(
        deviceId
      )).map(calcElement => calcElement.Payload);

      expectedPayload.variables = (await Project.CurrentProject.getAllVariables(
        deviceId
      )).map(variable => variable.Payload);

      expect(msAgent.Payload).toEqual(expectedPayload);
    });

    it("should return 200 and do not edit event variables if it is not defined in payload", async () => {
      delete editPayload.eventVariables;

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedPayload = {
        ...initialDevicePayload,
        ...editPayload,
        dataAgent: {
          ...initialDevicePayload.dataAgent,
          ...editPayload.dataAgent
        },
        eventVariables: initialEventVariables
      };

      expectedPayload.calculationElements = (await Project.CurrentProject.getAllCalcElements(
        deviceId
      )).map(calcElement => calcElement.Payload);

      expectedPayload.variables = (await Project.CurrentProject.getAllVariables(
        deviceId
      )).map(variable => variable.Payload);

      expect(msAgent.Payload).toEqual(expectedPayload);
    });
  });
});
