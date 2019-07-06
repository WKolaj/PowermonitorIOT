const config = require("config");
const request = require("supertest");
const {
  clearDirectoryAsync,
  snooze
} = require("../../../../utilities/utilities");
const _ = require("lodash");

describe("users route", () => {
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

  describe("PUT /me", () => {
    let endpoint = "/api/users/me";
    let token;
    let body;
    let user1Body;
    let user2Body;
    let user3Body;

    beforeEach(async () => {
      token = await Project.CurrentProject.Users["admin"].generateToken();

      //Creating additional users
      user1Body = {
        login: "testUser1",
        password: "newTestPassword",
        permissions: 1,
        lang: "pl"
      };
      user2Body = {
        login: "testUser2",
        password: "newTestPassword",
        permissions: 2,
        lang: "pl"
      };
      user3Body = {
        login: "testUser3",
        password: "newTestPassword",
        permissions: 4,
        lang: "pl"
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
        password: "newTestPassword12",
        oldPassword: "admin",
        lang: "us"
      };
    });

    let exec = async () => {
      if (token) {
        return request(server)
          .put(endpoint)
          .set(tokenHeader, token)
          .send(body);
      } else {
        return request(server)
          .put(endpoint)
          .send(body);
      }
    };

    it("should edit new user based on given paramters - if user has superAdminRights", async () => {
      await exec();

      let user = await Project.CurrentProject.getUser("admin");

      expect(await user.passwordMatches(body.password)).toBeTruthy();
      expect(user.Lang).toEqual(body.lang);
    });

    it("should edit new user based on given paramters - if user has no superAdminRights", async () => {
      let user1 = Project.CurrentProject.Users[user1Body.login];

      token = await user1.generateToken();
      body.oldPassword = user1Body.password;

      let passwordMatches1 = await user1.passwordMatches(body.password);
      let result = await exec();

      let user = await Project.CurrentProject.getUser(user1.Login);

      let passwordMatches = await user.passwordMatches(body.password);

      expect(passwordMatches).toEqual(true);
      expect(user.Lang).toEqual(body.lang);
    });

    it("should edit new user based on given paramters - even if there is no old and new password given", async () => {
      body.oldPassword = undefined;
      body.password = undefined;

      await exec();

      let user = await Project.CurrentProject.getUser("admin");

      expect(user.Lang).toEqual(body.lang);
    });

    it("should edit user password and return 400 if old password is undefined", async () => {
      body.oldPassword = undefined;

      let userPayloadBefore = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/Old password/);

      let userPayloadAfter = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should respond with code 200 and edited user", async () => {
      let result = await exec();

      let user = await Project.CurrentProject.getUser("admin");

      expect(result.status).toEqual(200);

      let expectedResult = _.pick(user.Payload, [
        "login",
        "permissions",
        "lang"
      ]);

      expect(result).toBeDefined();
      expect(result.body).toEqual(expectedResult);
    });

    it("should not edit user and return 401 if no user is logged in", async () => {
      token = undefined;

      let userPayloadBefore = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(/Access denied/);

      let userPayloadAfter = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should not edit user password and return 400 if old password is undefined", async () => {
      body.oldPassword = undefined;

      let userPayloadBefore = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/Old password/);

      let userPayloadAfter = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should not edit user password and return 400 if old password does not match to users password", async () => {
      body.oldPassword = "1234";

      let userPayloadBefore = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/Old password does not match current one/);

      let userPayloadAfter = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should not edit user and return 400 if login is defined", async () => {
      body.login = "admin";

      let userPayloadBefore = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(400);
      expect(result.text).toMatch(/login/);

      let userPayloadAfter = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should not edit user and return 403 if permissions is defined", async () => {
      body.permissions = 5;

      let userPayloadBefore = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(/Access forbidden/);

      let userPayloadAfter = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should not edit password if password is not defined", async () => {
      body.password = undefined;

      let userPayloadBefore = (await Project.CurrentProject.getUser("admin"))
        .Payload.password;

      let result = await exec();

      let userPayloadAfter = (await Project.CurrentProject.getUser("admin"))
        .Payload.password;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should not edit password and return 400 if password is shorter than 3 letters", async () => {
      body.password = "12";

      let userPayloadBefore = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let userPayloadAfter = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should not create new User and return 400 if password is longer than 20 letters", async () => {
      //Creating string with 21 'a' characters
      body.password = new Array(21 + 1).join("a");

      let userPayloadBefore = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let userPayloadAfter = (await Project.CurrentProject.getUser("admin"))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });
  });
});
