const config = require("config");
const request = require("supertest");
const {
  clearDirectoryAsync,
  snooze
} = require("../../../../utilities/utilities");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const {
  testS7VariableCreation,
  testS7VariableEdition
} = require("./utilities");

describe("variables route", () => {
  describe("CREATE /:deviceId/", () => {
    testS7VariableEdition("S7Int8Variable", "s7Int8", 123, 125, 123.32);
  });
});
