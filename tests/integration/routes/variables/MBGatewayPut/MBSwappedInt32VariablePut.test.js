const config = require("config");
const request = require("supertest");
const {
  clearDirectoryAsync,
  snooze
} = require("../../../../../utilities/utilities");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { testMBGatewayVariableEdition } = require("../utilities");

describe("variables route", () => {
  describe("UPDATE /:deviceId/:variableId", () => {
    //#region MBFloatVariable

    testMBGatewayVariableEdition(
      "MBSwappedInt32Variable",
      "mbSwappedInt32",
      123,
      3,
      3,
      16,
      124,
      4,
      4,
      16,
      0,
      3,
      16,
      "fakeType",
      123.321,
      1,
      2,
      15
    );

    //#endregion MBFloatVariable
  });
});
