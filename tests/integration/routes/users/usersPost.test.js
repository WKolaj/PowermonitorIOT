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

  describe("POST /", () => {
    let endpoint = "/api/users";
    let token;
    let body;

    beforeEach(async () => {
      token = await Project.CurrentProject.Users["admin"].generateToken();
      body = {
        login: "testUser",
        password: "newTestPassword",
        permissions: 15,
        lang: "pl"
      };
    });

    let exec = async () => {
      if (token) {
        return request(server)
          .post(endpoint)
          .set(tokenHeader, token)
          .send(body);
      } else {
        return request(server)
          .post(endpoint)
          .send(body);
      }
    };

    it("should create new user based on given paramters", async () => {
      await exec();

      let user = await Project.CurrentProject.getUser(body.login);

      expect(user.Login).toEqual(body.login);
      expect(user.Permissions).toEqual(body.permissions);
      expect(await user.passwordMatches(body.password)).toBeTruthy();
    });

    it("should respond with code 200 and created user", async () => {
      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedResult = _.pick(body, ["login", "permissions", "lang"]);

      expect(result).toBeDefined();
      expect(result.body).toEqual(expectedResult);
    });

    it("should not create new User and return 401 if no user is logged in", async () => {
      token = undefined;

      let result = await exec();

      expect(result.status).toEqual(401);
      expect(result.text).toMatch(/Access denied/);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 403 if user is not superAdmin", async () => {
      //Creating user with no superAdmin rights
      let userBody = {
        login: "testUser2",
        password: "newTestPassword",
        permissions: 7,
        lang: "us"
      };

      await request(server)
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

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if there is no password defined", async () => {
      body.password = undefined;

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if password is shorter than 3 letters", async () => {
      body.password = "12";

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if password is longer than 20 letters", async () => {
      //Creating string with 21 'a' characters
      body.password = new Array(21 + 1).join("a");

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if there is no login defined", async () => {
      body.login = undefined;

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if there is no lang defined", async () => {
      body.lang = undefined;

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if there if lang is different than pl or us", async () => {
      body.lang = "fakeLanguage";

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if login is shorter than 3 letters", async () => {
      body.login = "12";

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if login is longer than 20 letters", async () => {
      //Creating string with 21 'a' characters
      body.login = new Array(21 + 1).join("a");

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if login has white spaces", async () => {
      //Creating string with 21 'a' characters
      body.login = "New test login";

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if there is no permissions defined", async () => {
      body.permissions = undefined;

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if permissions is smaller than 1", async () => {
      body.permissions = 0;

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });

    it("should not create new User and return 400 if permissions is bigger than 15", async () => {
      body.permissions = 16;

      let result = await exec();

      expect(result.status).toEqual(400);

      let user = await Project.CurrentProject.Users[body.login];

      expect(user).not.toBeDefined();
    });
  });
});
