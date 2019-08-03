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
    testS7VariableEdition("S7UInt16Variable", "s7UInt16", 123, 125, -1);
  });
});
