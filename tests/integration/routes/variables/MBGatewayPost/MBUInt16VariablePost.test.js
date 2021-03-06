const config = require("config");
const request = require("supertest");
const {
  clearDirectoryAsync,
  snooze
} = require("../../../../../utilities/utilities");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { testMBGatewayVariableCreation } = require("../utilities");

describe("variables route", () => {
  describe("CREATE /:deviceId/", () => {
    //#region MBUInt16Variable

    testMBGatewayVariableCreation(
      "MBUInt16Variable",
      "mbUInt16",
      123,
      3,
      3,
      16,
      0,
      3,
      16,
      "fakeType",
      -1,
      1,
      2,
      15
    );

    //#endregion MBUInt16Variable
  });
});
