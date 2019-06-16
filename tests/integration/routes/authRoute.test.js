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
    let endpoint = "/api/auth";
    let user1Body;
    let user2Body;
    let user3Body;
    let body;

    beforeEach(async () => {
      let token = await (await Project.CurrentProject.getUser(
        "admin"
      )).generateToken();

      //Creating additional users
      user1Body = {
        login: "testUser1",
        password: "newTestPassword1",
        permissions: 1
      };
      user2Body = {
        login: "testUser2",
        password: "newTestPassword2",
        permissions: 2
      };
      user3Body = {
        login: "testUser3",
        password: "newTestPassword3",
        permissions: 4
      };

      await request(server)
        .post("/api/users")
        .set(tokenHeader, token)
        .send(user1Body);
      await request(server)
        .post("/api/users")
        .set(tokenHeader, token)
        .send(user2Body);
      await request(server)
        .post("/api/users")
        .set(tokenHeader, token)
        .send(user3Body);

      body = {
        login: user2Body.login,
        password: user2Body.password
      };
    });

    let exec = async () => {
      return request(server)
        .post(endpoint)
        .send(body);
    };

    it("should return with code 200 and valid JWT in header", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let jsonWebToken = result.header[tokenHeader];

      expect(jsonWebToken).toBeDefined();

      let decodedJWT = jwt.verify(
        jsonWebToken,
        Project.CurrentProject.PrivateKey
      );

      let user = await Project.CurrentProject.getUser(body.login);

      expect(decodedJWT.login).toEqual(user.Login);
      expect(decodedJWT.permissions).toEqual(user.Permissions);

      //Password should not be defined inside JWT
      expect(decodedJWT.password).not.toBeDefined();
    });

    it("should return with code 400 and message - invalid login or password - if password is invalid", async () => {
      body.password = "12345";

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/Invalid login or password/);

      //There should be no jsonWebToken in header
      let jsonWebToken = result.header[tokenHeader];

      expect(jsonWebToken).not.toBeDefined();
    });

    it("should return with code 400 and message - invalid login or password - if login is invalid", async () => {
      body.login = "12345";

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/Invalid login or password/);

      //There should be no jsonWebToken in header
      let jsonWebToken = result.header[tokenHeader];

      expect(jsonWebToken).not.toBeDefined();
    });
  });
});
