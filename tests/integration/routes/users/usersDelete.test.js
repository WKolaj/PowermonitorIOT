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

  describe("DELETE /:login", () => {
    let endpoint = "/api/users/";
    let token;
    let login;
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

      login = user1Body.login;
    });

    let exec = async () => {
      if (token) {
        return request(server)
          .delete(`${endpoint}/${login}`)
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .delete(`${endpoint}/${login}`)
          .send();
      }
    };

    it("should remove user - if user has superAdminRights", async () => {
      await exec();

      expect(Object.keys(Project.CurrentProject.Users).length).toEqual(3);

      let user = Project.CurrentProject.Users[login];

      expect(user).not.toBeDefined();
    });

    it("should respond with code 200 and removed user", async () => {
      let user = await Project.CurrentProject.getUser(login);

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedResult = _.pick(user.Payload, [
        "login",
        "permissions",
        "lang"
      ]);

      expect(result).toBeDefined();
      expect(result.body).toEqual(expectedResult);
    });

    it("should not delete user and return 401 if no user is logged in", async () => {
      token = undefined;

      let usersBefore = Project.CurrentProject.Users;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(/Access denied/);

      let usersAfter = Project.CurrentProject.Users;

      expect(usersBefore).toEqual(usersAfter);
    });

    it("should not delete user password and return 404 if there is no user of given login", async () => {
      login = "54321";

      let usersBefore = Project.CurrentProject.Users;

      let result = await exec();

      expect(result.status).toEqual(404);
      expect(result.text).toMatch(/User of given login does not exist/);

      let usersAfter = Project.CurrentProject.Users;

      expect(usersBefore).toEqual(usersAfter);
    });

    it("should not delete user and return 403 if user is not superAdmin", async () => {
      let userWithNoSuperAdminRights = await Project.CurrentProject.getUser(
        user2Body.login
      );

      token = await userWithNoSuperAdminRights.generateToken();

      let usersBefore = Project.CurrentProject.Users;

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(/Access forbidden/);

      let usersAfter = Project.CurrentProject.Users;

      expect(usersBefore).toEqual(usersAfter);
    });

    it("should respond with code 401 if no user is logged in", async () => {
      token = undefined;

      let usersBefore = Project.CurrentProject.Users;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(/Access denied/);

      let usersAfter = Project.CurrentProject.Users;

      expect(usersBefore).toEqual(usersAfter);
    });
  });
});
