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

  describe("GET /", () => {
    let endpoint = "/api/users";
    let token;
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
        lang: "us"
      };
      user3Body = {
        login: "testUser3",
        password: "newTestPassword",
        permissions: 4,
        lang: "pl"
      };

      await request(server)
        .post(endpoint)
        .set(tokenHeader, token)
        .send(user1Body);
      await request(server)
        .post(endpoint)
        .set(tokenHeader, token)
        .send(user2Body);
      await request(server)
        .post(endpoint)
        .set(tokenHeader, token)
        .send(user3Body);
    });

    let exec = async () => {
      if (token) {
        return request(server)
          .get(endpoint)
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .get(endpoint)
          .send();
      }
    };

    it("should respond with code 200 and all users", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedResult = [];

      for (let user of Object.values(Project.CurrentProject.Users)) {
        expectedResult.push(
          _.pick(user.Payload, ["login", "permissions", "lang"])
        );
      }

      expect(result).toBeDefined();
      expect(result.body).toEqual(expectedResult);
    });

    it("should respond with code 401 if no user is logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(/Access denied/);
    });

    it("should respond with code 403 if user is not superAdmin", async () => {
      //Creating user with no superAdmin rights
      let userBody = {
        login: "testUser2",
        password: "newTestPassword",
        permissions: 7,
        lang: "pl"
      };

      let res = await request(server)
        .post(endpoint)
        .set(tokenHeader, token)
        .send(userBody);

      let userWithNoSuperAdminRights = await Project.CurrentProject.getUser(
        userBody.login
      );

      token = await userWithNoSuperAdminRights.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
      expect(result.text).toMatch(/Access forbidden/);
    });
  });

  describe("GET /me", () => {
    let endpoint = "/api/users/me";
    let token;
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
    });

    let exec = async () => {
      if (token) {
        return request(server)
          .get(endpoint)
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .get(endpoint)
          .send();
      }
    };

    it("should respond with code 200 and user object of logged user - if user has super admin rights", async () => {
      let defaultUser = Project.CurrentProject.Users["admin"];

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedResult = _.pick(defaultUser.Payload, [
        "login",
        "permissions",
        "lang"
      ]);

      expect(result).toBeDefined();
      expect(result.body).toEqual(expectedResult);
    });

    it("should respond with code 200 and user object of logged user - if user has no super admin rights", async () => {
      let user1 = Project.CurrentProject.Users[user1Body.login];

      token = await user1.generateToken();

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedResult = _.pick(user1.Payload, [
        "login",
        "permissions",
        "lang"
      ]);

      expect(result).toBeDefined();
      expect(result.body).toEqual(expectedResult);
    });

    it("should respond with code 401 if no user is logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(/Access denied/);
    });
  });

  describe("GET /:login", () => {
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
          .get(`${endpoint}/${login}`)
          .set(tokenHeader, token)
          .send();
      } else {
        return request(server)
          .get(`${endpoint}/${login}`)
          .send();
      }
    };

    it("should respond with code 200 and user - if user has superAdminRights", async () => {
      let result = await exec();

      let user = await Project.CurrentProject.getUser(login);

      let expectedResult = _.pick(user.Payload, [
        "login",
        "permissions",
        "lang"
      ]);

      expect(result).toBeDefined();
      expect(result.status).toEqual(200);
      expect(result.body).toEqual(expectedResult);
    });

    it("should return code 401 if no user is logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
    });

    it("should return code 404 if there is no user of given login", async () => {
      login = "54321";

      let result = await exec();

      expect(result.status).toEqual(404);
    });

    it("should return 403 if user is not superAdmin", async () => {
      let userWithNoSuperAdminRights = await Project.CurrentProject.getUser(
        user2Body.login
      );

      token = await userWithNoSuperAdminRights.generateToken();

      let result = await exec();

      expect(result.status).toEqual(403);
    });

    it("should respond with code 401 if no user is logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
    });
  });
});
