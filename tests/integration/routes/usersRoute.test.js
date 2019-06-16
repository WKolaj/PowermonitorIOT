const config = require("config");
const request = require("supertest");
const { clearDirectoryAsync, snooze } = require("../../../utilities/utilities");
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
        permissions: 1
      };
      user2Body = {
        login: "testUser2",
        password: "newTestPassword",
        permissions: 2
      };
      user3Body = {
        login: "testUser3",
        password: "newTestPassword",
        permissions: 4
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
        expectedResult.push(_.pick(user.Payload, ["login", "permissions"]));
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
        permissions: 7
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
        permissions: 1
      };
      user2Body = {
        login: "testUser2",
        password: "newTestPassword",
        permissions: 2
      };
      user3Body = {
        login: "testUser3",
        password: "newTestPassword",
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
        "permissions"
      ]);

      expect(result).toBeDefined();
      expect(result.body).toEqual(expectedResult);
    });

    it("should respond with code 200 and user object of logged user - if user has no super admin rights", async () => {
      let user1 = Project.CurrentProject.Users[user1Body.login];

      token = await user1.generateToken();

      let result = await exec();

      expect(result.status).toEqual(200);

      let expectedResult = _.pick(user1.Payload, ["login", "permissions"]);

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

  describe("POST /", () => {
    let endpoint = "/api/users";
    let token;
    let body;

    beforeEach(async () => {
      token = await Project.CurrentProject.Users["admin"].generateToken();
      body = {
        login: "testUser",
        password: "newTestPassword",
        permissions: 15
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

      let expectedResult = _.pick(body, ["login", "permissions"]);

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
        permissions: 7
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
        permissions: 1
      };
      user2Body = {
        login: "testUser2",
        password: "newTestPassword",
        permissions: 2
      };
      user3Body = {
        login: "testUser3",
        password: "newTestPassword",
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
        password: "newTestPassword",
        oldPassword: "admin"
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
    });

    it("should edit new user based on given paramters - if user has no superAdminRights", async () => {
      let user1 = Project.CurrentProject.Users[user1Body.login];

      token = await user1.generateToken();

      await exec();

      let user = await Project.CurrentProject.getUser(user1.Login);

      expect(await user.passwordMatches(body.password)).toBeTruthy();
    });

    it("should respond with code 200 and edited user", async () => {
      let result = await exec();

      let user = await Project.CurrentProject.getUser("admin");

      expect(result.status).toEqual(200);

      let expectedResult = _.pick(user.Payload, ["login", "permissions"]);

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
        .Payload;

      let result = await exec();

      let userPayloadAfter = (await Project.CurrentProject.getUser("admin"))
        .Payload;

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
        permissions: 1
      };
      user2Body = {
        login: "testUser2",
        password: "newTestPassword",
        permissions: 2
      };
      user3Body = {
        login: "testUser3",
        password: "newTestPassword",
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

      let expectedResult = _.pick(user.Payload, ["login", "permissions"]);

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
        permissions: 1
      };
      user2Body = {
        login: "testUser2",
        password: "newTestPassword",
        permissions: 2
      };
      user3Body = {
        login: "testUser3",
        password: "newTestPassword",
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

      let expectedResult = _.pick(user.Payload, ["login", "permissions"]);

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

  describe("PUT /:login", () => {
    let endpoint = "/api/users/";
    let token;
    let login;
    let user1Body;
    let user2Body;
    let user3Body;
    let body;

    beforeEach(async () => {
      token = await Project.CurrentProject.Users["admin"].generateToken();

      //Creating additional users
      user1Body = {
        login: "testUser1",
        password: "newTestPassword",
        permissions: 1
      };
      user2Body = {
        login: "testUser2",
        password: "newTestPassword",
        permissions: 2
      };
      user3Body = {
        login: "testUser3",
        password: "newTestPassword",
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
        permissions: 15
      };

      login = user1Body.login;
    });

    let exec = async () => {
      if (token) {
        return request(server)
          .put(`${endpoint}/${login}`)
          .set(tokenHeader, token)
          .send(body);
      } else {
        return request(server)
          .put(`${endpoint}/${login}`)
          .send(body);
      }
    };

    it("should edit user according to req body - if user has superAdminRights", async () => {
      await exec();

      let user = await Project.CurrentProject.getUser(login);

      let userPayload = _.pick(user.Payload, ["permissions"]);

      expect(userPayload).toEqual(body);
    });

    it("should respond with code 200 and edited user", async () => {
      let result = await exec();

      let user = await Project.CurrentProject.getUser(login);

      let expectedResult = _.pick(user.Payload, ["login", "permissions"]);

      expect(result).toBeDefined();
      expect(result.status).toEqual(200);
      expect(result.body).toEqual(expectedResult);
    });

    it("should retun 400 and not edit user if password is defined in body", async () => {
      body.password = "1234";
      let userPayloadBefore = (await Project.CurrentProject.getUser(login))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let userPayloadAfter = (await Project.CurrentProject.getUser(login))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should retun 400 and not edit user if password and oldPassword are defined in body", async () => {
      body.password = "1234";
      body.oldPassword = "admin";
      let userPayloadBefore = (await Project.CurrentProject.getUser(login))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let userPayloadAfter = (await Project.CurrentProject.getUser(login))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should retun 404 if user of given login does not exist", async () => {
      login = "1234";

      let result = await exec();

      expect(result.status).toEqual(404);
    });

    it("should retun 401 and not edit user if user is not logged in", async () => {
      token = undefined;
      let userPayloadBefore = (await Project.CurrentProject.getUser(login))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(401);

      let userPayloadAfter = (await Project.CurrentProject.getUser(login))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should retun 403 and not edit user if user is not superAdmin", async () => {
      let userWithNoSuperAdminRights = await Project.CurrentProject.getUser(
        user2Body.login
      );

      token = await userWithNoSuperAdminRights.generateToken();
      let userPayloadBefore = (await Project.CurrentProject.getUser(login))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(403);

      let userPayloadAfter = (await Project.CurrentProject.getUser(login))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should not edit permissions but return 200 if permission are undefined", async () => {
      body.permissions = undefined;
      let userPayloadBefore = (await Project.CurrentProject.getUser(login))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(200);

      let userPayloadAfter = (await Project.CurrentProject.getUser(login))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should not edit permissions and return 400 if permission are lower than 1", async () => {
      body.permissions = 0;
      let userPayloadBefore = (await Project.CurrentProject.getUser(login))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let userPayloadAfter = (await Project.CurrentProject.getUser(login))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });

    it("should not edit permissions and return 400 if permission are higher than 15", async () => {
      body.permissions = 16;
      let userPayloadBefore = (await Project.CurrentProject.getUser(login))
        .Payload;

      let result = await exec();

      expect(result.status).toEqual(400);

      let userPayloadAfter = (await Project.CurrentProject.getUser(login))
        .Payload;

      expect(userPayloadBefore).toEqual(userPayloadAfter);
    });
  });
});
