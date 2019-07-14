const config = require("config");
const request = require("supertest");
const {
  clearDirectoryAsync,
  snooze
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
  let msAgentBody;

  let pac3200TCP;
  let mbDevice;
  let msAgent;

  let mbBooleanVariableBody;
  let mbFloatVariableBody;
  let mbInt32VariableBody;
  let mbUInt32VariableBody;
  let mbInt16VariableBody;
  let mbUInt16VariableBody;
  let mbSwappedFloatVariableBody;
  let mbSwappedInt32VariableBody;
  let mbSwappedUInt32VariableBody;
  let msAgentVariable1Body;
  let msAgentVariable2Body;
  let msAgentVariable3Body;

  let mbBooleanVariable;
  let mbFloatVariable;
  let mbInt32Variable;
  let mbUInt32Variable;
  let mbInt16Variable;
  let mbUInt16Variable;
  let mbSwappedFloatVariable;
  let mbSwappedInt32Variable;
  let mbSwappedUInt32Variable;
  let msAgentVariable1;
  let msAgentVariable2;
  let msAgentVariable3;

  let msAgentVariable1MSName;
  let msAgentVariable1SampleTimeGroup;
  let msAgentVariable2MSName;
  let msAgentVariable2SampleTimeGroup;
  let msAgentVariable3MSName;
  let msAgentVariable3ampleTimeGroup;

  let boardingKey;
  let variableNames;
  let readyToSend;
  let sampleTimeGroups;
  let sendDataLimit;
  let bufferSize;

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

    msAgentBody = {
      name: "mindConnectAgent",
      type: "msAgent"
    };

    let mbDeviceResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(mbDeviceBody);
    let pac3200TCPResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(PAC3200TCPBody);
    let msAgentResult = await request(server)
      .post("/api/devices")
      .set(tokenHeader, adminToken)
      .send(msAgentBody);

    mbDevice = await Project.CurrentProject.getDevice(mbDeviceResult.body.id);
    pac3200TCP = await Project.CurrentProject.getDevice(
      pac3200TCPResult.body.id
    );
    msAgent = await Project.CurrentProject.getDevice(msAgentResult.body.id);
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

    msAgentVariable1Body = {
      name: "variable1",
      type: "sdVariable",
      elementId: mbFloatVariable.Id,
      elementDeviceId: mbDevice.Id
    };

    msAgentVariable2Body = {
      name: "variable2",
      type: "sdVariable",
      elementId: mbInt32Variable.Id,
      elementDeviceId: mbDevice.Id
    };

    msAgentVariable3Body = {
      name: "variable3",
      type: "sdVariable",
      elementId: mbInt16Variable.Id,
      elementDeviceId: mbDevice.Id
    };

    let msAgentVariable1Result = await request(server)
      .post(`/api/variables/${msAgent.Id}`)
      .set(tokenHeader, adminToken)
      .send(msAgentVariable1Body);

    let msAgentVariable2Result = await request(server)
      .post(`/api/variables/${msAgent.Id}`)
      .set(tokenHeader, adminToken)
      .send(msAgentVariable2Body);

    let msAgentVariable3Result = await request(server)
      .post(`/api/variables/${msAgent.Id}`)
      .set(tokenHeader, adminToken)
      .send(msAgentVariable3Body);

    msAgentVariable1 = await Project.CurrentProject.getVariable(
      msAgent.Id,
      msAgentVariable1Result.body.id
    );

    msAgentVariable2 = await Project.CurrentProject.getVariable(
      msAgent.Id,
      msAgentVariable2Result.body.id
    );

    msAgentVariable3 = await Project.CurrentProject.getVariable(
      msAgent.Id,
      msAgentVariable3Result.body.id
    );

    msAgentVariable1MSName = "msVariable1";
    msAgentVariable1SampleTimeGroup = 1;

    msAgentVariable2MSName = "msVariable2";
    msAgentVariable2SampleTimeGroup = 1;

    msAgentVariable3MSName = "msVariable3";
    msAgentVariable3SampleTimeGroup = 2;

    sampleTimeGroups = [
      {
        sampleTime: msAgentVariable1SampleTimeGroup,
        variableIds: [msAgentVariable1.Id, msAgentVariable2.Id]
      },
      {
        sampleTime: msAgentVariable3SampleTimeGroup,
        variableIds: [msAgentVariable3.Id]
      }
    ];

    variableNames = {
      [msAgentVariable1.Id]: msAgentVariable1MSName,
      [msAgentVariable2.Id]: msAgentVariable2MSName,
      [msAgentVariable3.Id]: msAgentVariable3MSName
    };

    boardingKey = {
      content: {
        baseUrl: "https://southgate.eu1.mindsphere.io",
        iat: "testIat",
        clientCredentialProfile: ["SHARED_SECRET"],
        clientId: "testId",
        tenant: "testTenant"
      },
      expiration: "2019-07-20T20:20:39.000Z"
    };

    readyToSend = false;

    sendDataLimit = 25;
    bufferSize = 35;

    let editPayload = {
      dataAgent: {
        sampleTimeGroups,
        variableNames,
        boardingKey,
        readyToSend,
        sendDataLimit,
        bufferSize
      }
    };

    let result = await request(server)
      .put(`/api/devices/${msAgent.Id}`)
      .set(tokenHeader, adminToken)
      .send(editPayload);
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
    let deviceId;
    let editPayload;
    let oldMindConnectAgent;

    beforeEach(async () => {
      await init();
      oldMindConnectAgent = msAgent.DataAgent.MindConnectAgent;
      token = await dataAdmin.generateToken();
      deviceId = msAgent.Id;
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
          sampleTimeGroups: [
            {
              sampleTime: 10,
              variableIds: [msAgentVariable1.Id]
            },
            {
              sampleTime: 20,
              variableIds: [msAgentVariable2.Id]
            },
            {
              sampleTime: 30,
              variableIds: [msAgentVariable3.Id]
            }
          ],
          sendDataLimit: 33,
          bufferSize: 34,
          readyToSend: true,
          variableNames: {
            [msAgentVariable1.Id]: "testAgentVariableEdited1",
            [msAgentVariable2.Id]: "testAgentVariableEdited2",
            [msAgentVariable3.Id]: "testAgentVariableEdited3"
          }
        }
      };
    });

    let createEmptyMSAgent = async () => {
      msAgentBody = {
        name: "mindConnectAgent2",
        type: "msAgent"
      };
      let msAgentResult = await request(server)
        .post("/api/devices")
        .set(tokenHeader, await dataAdmin.generateToken())
        .send(msAgentBody);

      msAgent = await Project.CurrentProject.getDevice(msAgentResult.body.id);
      oldMindConnectAgent = msAgent.DataAgent.MindConnectAgent;
      deviceId = msAgent.Id;
    };

    let exec = async () => {
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

      //mechanisms does not delete old sampleTimeGroups
      expecetedAgent.sampleTimeGroups = [
        { sampleTime: 1, variableIds: [] },
        { sampleTime: 2, variableIds: [] },
        ...editPayload.dataAgent.sampleTimeGroups
      ];
      let expectedPayload = {
        id: msAgent.Id,
        name: msAgent.Name,
        type: msAgent.Type,
        connected: true,
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
      delete editPayload.dataAgent.readyToSend;
      delete editPayload.dataAgent.boardingKey;

      await exec();

      expect(msAgent.DataAgent.MindConnectAgent).toEqual(oldMindConnectAgent);
    });

    it("should create new boarding key, but not start communication if only boarding key was passed (when msAgent is empty)", async () => {
      await createEmptyMSAgent();
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
      expect(msAgent.DataAgent.ReadyToSend).toEqual(false);
    });

    it("should not edit anything and return 200 if editPayload is empty", async () => {
      await createEmptyMSAgent();
      editPayload = {};

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(200);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 200 if editPayload.dataAgent is empty", async () => {
      await createEmptyMSAgent();
      editPayload = {
        dataAgent: {}
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(200);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit dirPath and return 400 if dirPath is defined in payload", async () => {
      await createEmptyMSAgent();
      editPayload = {
        dataAgent: {
          dirPath: "fakeDirPath"
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit dirPath and return 400 if dirPath is defined in payload", async () => {
      await createEmptyMSAgent();

      editPayload = {
        dataAgent: {
          dirPath: "fakeDirPath"
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if only variableNames are defined in dataAgent payload", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          variableNames: editPayload.dataAgent.variableNames
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if only sampleTimeGroups are defined in dataAgent payload", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          sampleTimeGroups: editPayload.dataAgent.sampleTimeGroups
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if variableNames have more variables than sampleTimeGroups", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          variableNames: {
            ...editPayload.dataAgent.variableNames,
            fakeVariable: "fakeName"
          },
          sampleTimeGroups: editPayload.dataAgent.sampleTimeGroups
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if sampleTimeGroups have more variables than variableNames", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          variableNames: editPayload.dataAgent.variableNames,
          sampleTimeGroups: [...editPayload.dataAgent.sampleTimeGroups]
        }
      };
      editPayload.dataAgent.sampleTimeGroups[0].variableIds.push(
        "fakeVariable"
      );
      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if there is variable in variableNames and sampleTimeGroup that does not exists in device", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          variableNames: {
            ...editPayload.dataAgent.variableNames,
            fakeVariable: "fakeName"
          },
          sampleTimeGroups: [...editPayload.dataAgent.sampleTimeGroups]
        }
      };
      editPayload.dataAgent.sampleTimeGroups[0].variableIds.push(
        "fakeVariable"
      );
      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toEqual("Element of given id does not exist");

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if sampleTimeGroups is defined and variableName not", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          sampleTimeGroups: []
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if variableNames is defined and sampleTimeGroups not", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          variableNames: {}
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if on of payload of sampleTimeGroup is invalid", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          variableNames: {
            ...editPayload.dataAgent.variableNames
          },
          sampleTimeGroups: [...editPayload.dataAgent.sampleTimeGroups]
        }
      };
      editPayload.dataAgent.sampleTimeGroups[0] = "fakeSampleTimeGroup";

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if on of boardingKey is null", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          boardingKey: null
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if boardingKey is invalid", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          boardingKey: {
            fakeProp: "fakeValue"
          }
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if sendDataLimit is less than 0", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          sendDataLimit: -1
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if sendDataLimit is equal than 0", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          sendDataLimit: 0
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if sendDataLimit is greater than 50", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          sendDataLimit: 51
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if bufferSize is smaller than 0", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          bufferSize: -1
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if bufferSize is equal 0", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          bufferSize: 0
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if bufferSize is greater than 10000", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          bufferSize: 10001
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if bufferSize is greater than 10000", async () => {
      editPayload = {
        ...editPayload,
        dataAgent: {
          ...editPayload.dataAgent,
          bufferSize: 10001
        }
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if name is shorter than 3", async () => {
      editPayload = {
        ...editPayload,
        name: "ab"
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
    });

    it("should not edit anything and return 400 if name is longer than 100", async () => {
      editPayload = {
        ...editPayload,
        name: new Array(101 + 1).join("a").toString()
      };

      let initialPayload = msAgent.Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let afterPayload = msAgent.Payload;

      expect(initialPayload).toEqual(afterPayload);
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
