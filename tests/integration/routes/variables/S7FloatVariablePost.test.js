const config = require("config");
const request = require("supertest");
const {
  clearDirectoryAsync,
  snooze
} = require("../../../../utilities/utilities");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { testS7VariableCreation } = require("./utilities");

describe("variables route", () => {
  describe("CREATE /:deviceId/", () => {
    testS7VariableCreation(
      "S7FloatVariable",
      "s7Float",
      123,
      0,
      "invalidValue"
    );
  });
});
