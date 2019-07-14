const VariablesStorage = require("../../../classes/dataStorage/VariablesStorage");
const { exists } = require("../../../utilities/utilities");
const config = require("config");
const path = require("path");

let varaibleStorageDir = "_projTest";
let {
  clearDirectoryAsync,
  checkIfTableExists,
  checkIfColumnExists,
  checkIfFileExistsAsync,
  checkIfDirectoryExistsAsync,
  createDatabaseFile,
  createDatabaseTable,
  createDatabaseColumn,
  readAllDataFromTable,
  snooze
} = require("../../../utilities/utilities");

describe("VariablesStorage", () => {
  beforeEach(async () => {
    await clearDirectoryAsync(varaibleStorageDir);
  });

  afterEach(async () => {
    await clearDirectoryAsync(varaibleStorageDir);
  });

  describe("constructor", () => {
    let exec = async () => {
      return new VariablesStorage();
    };

    it("should create new variable storage", async () => {
      let result = await exec();

      expect(result).toBeDefined();
    });

    it("should create new variable storage and set sampleTimeGroups to empty object", async () => {
      let result = await exec();

      expect(result.SampleTimeGroups).toEqual({});
    });

    it("should create new variable storage and set directoryPath to null", async () => {
      let result = await exec();

      expect(result.DirectoryPath).toBeNull();
    });

    it("should create new variable storage and set bufferSize to 100", async () => {
      let result = await exec();

      expect(result.BufferSize).toEqual(100);
    });
  });

  describe("init", () => {
    let variableStorage;
    let payload;

    beforeEach(() => {
      payload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      return variableStorage.init(payload);
    };

    it("should initialize directoryPath property", async () => {
      await exec();

      expect(variableStorage.DirectoryPath).toEqual(payload.dirPath);
    });

    it("should initialize bufferSize property", async () => {
      await exec();

      expect(variableStorage.BufferSize).toEqual(payload.bufferSize);
    });

    it("should create directory", async () => {
      await exec();
      let dirExists = await checkIfDirectoryExistsAsync(payload.dirPath);
      expect(dirExists).toEqual(true);
    });

    it("should initialize sampleGroups property", async () => {
      await exec();

      expect(Object.keys(variableStorage.SampleTimeGroups).length).toEqual(
        payload.sampleTimeGroups.length
      );

      for (let sampleGroup of payload.sampleTimeGroups) {
        expect(
          exists(variableStorage.SampleTimeGroups[sampleGroup.sampleTime])
        ).toBeDefined();

        expect(
          Object.keys(
            variableStorage.SampleTimeGroups[sampleGroup.sampleTime].DataPoints
          )
        ).toEqual(sampleGroup.variableIds);
      }
    });

    it("should initialize Variables property", async () => {
      await exec();

      let allDpObjects = [];

      for (let sampleTimeGroup of payload.sampleTimeGroups) {
        for (let variable of sampleTimeGroup.variableIds) {
          allDpObjects.push({
            variable,
            sampleTime: sampleTimeGroup.sampleTime
          });
        }
      }

      expect(Object.keys(variableStorage.Variables).length).toEqual(
        allDpObjects.length
      );

      for (let dpObject of allDpObjects) {
        expect(variableStorage.Variables[dpObject.variable]).toBeDefined();
        expect(variableStorage.Variables[dpObject.variable]).toEqual(
          dpObject.sampleTime
        );
      }
    });

    it("should initialize sampleGroups property if there are no groups", async () => {
      payload.sampleTimeGroups = [];
      await exec();

      expect(Object.keys(variableStorage.SampleTimeGroups).length).toEqual(0);
    });

    it("should initialize sampleGroups property if groups are undefined", async () => {
      payload.sampleTimeGroups = undefined;
      await exec();

      expect(Object.keys(variableStorage.SampleTimeGroups).length).toEqual(0);
    });

    it("should initialize sampleGroups property if one of groups has no variable ids", async () => {
      (payload.sampleTimeGroups[1] = {
        sampleTime: 5,
        variableIds: []
      }),
        await exec();

      expect(Object.keys(variableStorage.SampleTimeGroups).length).toEqual(
        payload.sampleTimeGroups.length
      );

      for (let sampleGroup of payload.sampleTimeGroups) {
        expect(
          exists(variableStorage.SampleTimeGroups[sampleGroup.sampleTime])
        ).toBeDefined();

        expect(
          Object.keys(
            variableStorage.SampleTimeGroups[sampleGroup.sampleTime].DataPoints
          )
        ).toEqual(sampleGroup.variableIds);
      }
    });

    it("should not throw and initialize sampleGroups property if there is already a directory and db files", async () => {
      await exec();

      variableStorage = new VariablesStorage();
      await variableStorage.init(payload);

      expect(Object.keys(variableStorage.SampleTimeGroups).length).toEqual(
        payload.sampleTimeGroups.length
      );

      for (let sampleGroup of payload.sampleTimeGroups) {
        expect(
          exists(variableStorage.SampleTimeGroups[sampleGroup.sampleTime])
        ).toBeDefined();

        expect(
          Object.keys(
            variableStorage.SampleTimeGroups[sampleGroup.sampleTime].DataPoints
          )
        ).toEqual(sampleGroup.variableIds);
      }
    });
  });

  describe("Payload", () => {
    let variableStorage;
    let initialPayload;

    beforeEach(() => {
      initialPayload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      await variableStorage.init(initialPayload);
      return variableStorage.Payload;
    };

    it("should generate valid property of variable storage", async () => {
      let result = await exec();

      expect(result).toEqual(initialPayload);
    });

    it("should generate valid property of variable storage if sampleGroups are not defined", async () => {
      initialPayload.sampleTimeGroups = undefined;

      let result = await exec();

      expect(result).toEqual({ ...initialPayload, sampleTimeGroups: [] });
    });

    it("should generate valid property of variable storage that can recreate variable storage", async () => {
      let result = await exec();

      let storage = new VariablesStorage();
      await storage.init(result);

      expect(storage.Payload).toEqual(initialPayload);
    });

    it("should generate valid property of data storage that can recreate data storage if sampleGroups are not defined", async () => {
      initialPayload.sampleTimeGroups = undefined;
      let result = await exec();

      let storage = new VariablesStorage();
      await storage.init(result);

      expect(storage.Payload).toEqual({
        ...initialPayload,
        sampleTimeGroups: []
      });
    });
  });

  describe("addVariable", () => {
    let variableStorage;
    let initialPayload;
    let variableId;
    let sampleTime;

    beforeEach(() => {
      variableId = "dp9";
      sampleTime = 10;

      initialPayload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      await variableStorage.init(initialPayload);
      await variableStorage.addVariable(sampleTime, variableId);
    };

    it("should add new datapoint id to data storage", async () => {
      await exec();

      expect(
        variableStorage.SampleTimeGroups[sampleTime].DataPoints[variableId]
      ).toBeDefined();
    });

    it("should add new varaible id to varaibles", async () => {
      await exec();

      expect(variableStorage.Variables[variableId]).toEqual(sampleTime);
    });

    it("should create new sample group if there is no group of given sampleTime", async () => {
      sampleTime = 15;

      await exec();

      expect(
        variableStorage.SampleTimeGroups[sampleTime].DataPoints[variableId]
      ).toBeDefined();
    });
  });

  describe("removeVariable", () => {
    let variableStorage;
    let initialPayload;
    let variableId;
    let sampleTime;

    beforeEach(() => {
      variableId = "dp4";
      sampleTime = 5;

      initialPayload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      await variableStorage.init(initialPayload);
      await variableStorage.removeVariable(sampleTime, variableId);
    };

    it("should remove varaible from variable storage", async () => {
      await exec();

      expect(Object.keys(variableStorage.SampleTimeGroups).length).toEqual(
        initialPayload.sampleTimeGroups.length
      );

      for (let sampleGroup of initialPayload.sampleTimeGroups) {
        expect(
          exists(variableStorage.SampleTimeGroups[sampleGroup.sampleTime])
        ).toBeDefined();

        if (sampleGroup.sampleTime !== sampleTime) {
          expect(
            Object.keys(
              variableStorage.SampleTimeGroups[sampleGroup.sampleTime]
                .DataPoints
            )
          ).toEqual(sampleGroup.variableIds);
        } else {
          let groupWithoutDP = Object.keys(
            variableStorage.SampleTimeGroups[sampleGroup.sampleTime].DataPoints
          ).filter(a => a !== variableId);

          expect(
            Object.keys(
              variableStorage.SampleTimeGroups[sampleGroup.sampleTime]
                .DataPoints
            )
          ).toEqual(groupWithoutDP);
        }
      }
    });

    it("should remove variable from Variables", async () => {
      await exec();

      expect(variableStorage.Variables[variableId]).not.toBeDefined();
    });

    it("should throw and do not change data if there is no varaible of given id", async () => {
      variableId = "fakeId";

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(1);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(Object.keys(variableStorage.SampleTimeGroups).length).toEqual(
        initialPayload.sampleTimeGroups.length
      );

      for (let sampleGroup of initialPayload.sampleTimeGroups) {
        expect(
          exists(variableStorage.SampleTimeGroups[sampleGroup.sampleTime])
        ).toBeDefined();

        expect(
          Object.keys(
            variableStorage.SampleTimeGroups[sampleGroup.sampleTime].DataPoints
          )
        ).toEqual(sampleGroup.variableIds);
      }
    });
  });

  describe("insertValues", () => {
    let variableStorage;
    let initialPayload;
    let sampleTime;
    let tickId;
    let insertPayload;

    beforeEach(() => {
      initialPayload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      sampleTime = 5;
      tickId = 1000;
      insertPayload = {
        dp1: 123,
        dp2: 345,
        dp4: 1234,
        dp5: 123.32
      };
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      await variableStorage.init(initialPayload);
      return variableStorage.insertValues(tickId, insertPayload);
    };

    it("should insert given values inside varaible storage", async () => {
      await exec();

      let data = await variableStorage.getAllData(sampleTime);

      let expectedData = {
        ["1"]: {
          [tickId]: {
            ["dp1"]: insertPayload["dp1"],
            ["dp2"]: insertPayload["dp2"]
          }
        },
        ["5"]: {
          [tickId]: {
            ["dp4"]: insertPayload["dp4"],
            ["dp5"]: insertPayload["dp5"]
          }
        },
        ["10"]: {}
      };
      expect(expectedData).toEqual(data);
    });

    it("should not throw but not insert values of dps that are not added to storage", async () => {
      insertPayload.dp9 = 9876;
      await exec();

      let data = await variableStorage.getAllData(sampleTime);

      let expectedData = {
        ["1"]: {
          [tickId]: {
            ["dp1"]: insertPayload["dp1"],
            ["dp2"]: insertPayload["dp2"]
          }
        },
        ["5"]: {
          [tickId]: {
            ["dp4"]: insertPayload["dp4"],
            ["dp5"]: insertPayload["dp5"]
          }
        },
        ["10"]: {}
      };
      expect(expectedData).toEqual(data);
    });

    it("should not insert anything if payload is empty", async () => {
      insertPayload = {};
      await exec();

      let data = await variableStorage.getAllData(sampleTime);

      expect(data).toEqual({
        "1": {},
        "5": {},
        "10": {}
      });
    });

    it("should act like a buffer and delete old values if number of rows exceeds max buffer size - everty time sample should have seperate buffer", async () => {
      //max buffer size - 20;
      await exec();

      let tickIds = [];
      let payloads = [];

      for (let i = 0; i < 40; i++) {
        tickIds.push(1001 + i);
        //Inserting only 10 variables to group sample 1 and 41 - including initial insert -  to group 2

        if (i < 9) {
          payloads.push({
            dp1: 10 * i + 1,
            dp2: 20 * i + 1,
            dp4: 100 * i + 1,
            dp5: 200 * i + 1
          });
        } else {
          payloads.push({
            dp4: 100 * i + 1,
            dp5: 200 * i + 1
          });
        }
      }

      for (let i = 0; i < 40; i++) {
        await variableStorage.insertValues(tickIds[i], payloads[i]);
      }

      let data = await variableStorage.getAllData(sampleTime);

      expect(Object.keys(data["1"]).length).toEqual(10);
      expect(Object.keys(data["5"]).length).toEqual(20);

      let arrayDataGroup1 = Object.keys(data["1"]).map(key => {
        return {
          [key]: data["1"][key]
        };
      });

      for (let i = 0; i < 10; i++) {
        let expectedData = null;

        if (i === 0) {
          expectedData = {
            [tickId]: {
              ["dp1"]: insertPayload["dp1"],
              ["dp2"]: insertPayload["dp2"]
            }
          };
        } else {
          expectedData = {
            [tickIds[i - 1]]: {
              ["dp1"]: payloads[i - 1]["dp1"],
              ["dp2"]: payloads[i - 1]["dp2"]
            }
          };
        }
        expect(arrayDataGroup1[i]).toEqual(expectedData);
      }

      let arrayDataGroup2 = Object.keys(data["5"]).map(key => {
        return {
          [key]: data["5"][key]
        };
      });

      for (let i = 0; i < 20; i++) {
        let expectedData = {
          [tickIds[20 + i]]: {
            ["dp4"]: payloads[20 + i]["dp4"],
            ["dp5"]: payloads[20 + i]["dp5"]
          }
        };
        expect(arrayDataGroup2[i]).toEqual(expectedData);
      }
    });
  });

  describe("removeValues", () => {
    let variableStorage;
    let initialPayload;
    let insertTickId1;
    let insertPayload1;
    let insertTickId2;
    let insertPayload2;
    let insertTickId3;
    let insertPayload3;
    let insertTickId4;
    let insertPayload4;
    let insertTickId5;
    let insertPayload5;
    let removeTickIds;

    beforeEach(() => {
      initialPayload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      insertTickId1 = 1000;
      insertPayload1 = {
        dp1: 1234,
        dp2: 123.32,
        dp4: 982,
        dp5: 765
      };
      insertTickId2 = 2000;
      insertPayload2 = {
        dp1: 21234,
        dp2: 2123.32,
        dp4: 2982,
        dp5: 2765
      };
      insertTickId3 = 3000;
      insertPayload3 = {
        dp1: 31234,
        dp2: 3123.32,
        dp4: 3982,
        dp5: 3765
      };
      insertTickId4 = 4000;
      insertPayload4 = {
        dp1: 41244,
        dp2: 4124.42,
        dp4: 4982,
        dp5: 4765
      };
      insertTickId5 = 5000;
      insertPayload5 = {
        dp1: 51254,
        dp2: 5125.52,
        dp4: 5982,
        dp5: 5765
      };
      removeTickIds = {
        "1": [2000, 3000],
        "5": [3000, 4000]
      };
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      await variableStorage.init(initialPayload);
      await variableStorage.insertValues(insertTickId1, insertPayload1);
      await variableStorage.insertValues(insertTickId2, insertPayload2);
      await variableStorage.insertValues(insertTickId3, insertPayload3);
      await variableStorage.insertValues(insertTickId4, insertPayload4);
      await variableStorage.insertValues(insertTickId5, insertPayload5);
      await variableStorage.removeValues(removeTickIds);
    };

    it("should remove variables of given id from database", async () => {
      await exec();

      let data = await variableStorage.getAllData();

      let expectedData = {
        ["1"]: {
          ["1000"]: {
            ["dp1"]: insertPayload1["dp1"],
            ["dp2"]: insertPayload1["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["1000"]: {
            ["dp4"]: insertPayload1["dp4"],
            ["dp5"]: insertPayload1["dp5"]
          },
          ["2000"]: {
            ["dp4"]: insertPayload2["dp4"],
            ["dp5"]: insertPayload2["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        },

        ["10"]: {}
      };

      expect(data).toEqual(expectedData);
    });

    it("should remove all variables if all variables are given", async () => {
      removeTickIds = {
        "1": [1000, 2000, 3000, 4000, 5000],
        "5": [1000, 2000, 3000, 4000, 5000],
        "10": [1000, 2000, 3000, 4000, 5000]
      };

      await exec();

      let data = await variableStorage.getAllData();

      expect(data).toEqual({
        "1": {},
        "5": {},
        "10": {}
      });
    });

    it("should not remove any variables if array object is given", async () => {
      removeTickIds = {};
      await exec();

      let data = await variableStorage.getAllData();

      let expectedData = {
        ["1"]: {
          ["1000"]: {
            ["dp1"]: insertPayload1["dp1"],
            ["dp2"]: insertPayload1["dp2"]
          },
          ["2000"]: {
            ["dp1"]: insertPayload2["dp1"],
            ["dp2"]: insertPayload2["dp2"]
          },
          ["3000"]: {
            ["dp1"]: insertPayload3["dp1"],
            ["dp2"]: insertPayload3["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["1000"]: {
            ["dp4"]: insertPayload1["dp4"],
            ["dp5"]: insertPayload1["dp5"]
          },
          ["2000"]: {
            ["dp4"]: insertPayload2["dp4"],
            ["dp5"]: insertPayload2["dp5"]
          },
          ["3000"]: {
            ["dp4"]: insertPayload3["dp4"],
            ["dp5"]: insertPayload3["dp5"]
          },
          ["4000"]: {
            ["dp4"]: insertPayload4["dp4"],
            ["dp5"]: insertPayload4["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        },

        ["10"]: {}
      };

      expect(data).toEqual(expectedData);
    });

    it("should not throw but not remove variables if there is no given tickIds in database", async () => {
      removeTickIds = { "1": [7000, 8000, 9000] };

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(1);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      let data = await variableStorage.getAllData();

      let expectedData = {
        ["1"]: {
          ["1000"]: {
            ["dp1"]: insertPayload1["dp1"],
            ["dp2"]: insertPayload1["dp2"]
          },
          ["2000"]: {
            ["dp1"]: insertPayload2["dp1"],
            ["dp2"]: insertPayload2["dp2"]
          },
          ["3000"]: {
            ["dp1"]: insertPayload3["dp1"],
            ["dp2"]: insertPayload3["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["1000"]: {
            ["dp4"]: insertPayload1["dp4"],
            ["dp5"]: insertPayload1["dp5"]
          },
          ["2000"]: {
            ["dp4"]: insertPayload2["dp4"],
            ["dp5"]: insertPayload2["dp5"]
          },
          ["3000"]: {
            ["dp4"]: insertPayload3["dp4"],
            ["dp5"]: insertPayload3["dp5"]
          },
          ["4000"]: {
            ["dp4"]: insertPayload4["dp4"],
            ["dp5"]: insertPayload4["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        },

        ["10"]: {}
      };

      expect(data).toEqual(expectedData);
    });

    it("should not throw but not remove variables if there is no  sample time group of given id", async () => {
      removeTickIds = { "99": [1000, 2000, 3000] };

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(1);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      let data = await variableStorage.getAllData();

      let expectedData = {
        ["1"]: {
          ["1000"]: {
            ["dp1"]: insertPayload1["dp1"],
            ["dp2"]: insertPayload1["dp2"]
          },
          ["2000"]: {
            ["dp1"]: insertPayload2["dp1"],
            ["dp2"]: insertPayload2["dp2"]
          },
          ["3000"]: {
            ["dp1"]: insertPayload3["dp1"],
            ["dp2"]: insertPayload3["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["1000"]: {
            ["dp4"]: insertPayload1["dp4"],
            ["dp5"]: insertPayload1["dp5"]
          },
          ["2000"]: {
            ["dp4"]: insertPayload2["dp4"],
            ["dp5"]: insertPayload2["dp5"]
          },
          ["3000"]: {
            ["dp4"]: insertPayload3["dp4"],
            ["dp5"]: insertPayload3["dp5"]
          },
          ["4000"]: {
            ["dp4"]: insertPayload4["dp4"],
            ["dp5"]: insertPayload4["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        },

        ["10"]: {}
      };

      expect(data).toEqual(expectedData);
    });
  });

  describe("clear", () => {
    let variableStorage;
    let initialPayload;
    let insertTickId1;
    let insertPayload1;
    let insertTickId2;
    let insertPayload2;
    let insertTickId3;
    let insertPayload3;
    let insertTickId4;
    let insertPayload4;
    let insertTickId5;
    let insertPayload5;
    let sampleTimeGroupsToRemove;

    beforeEach(() => {
      initialPayload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      insertTickId1 = 1000;
      insertPayload1 = {
        dp1: 1234,
        dp2: 123.32,
        dp4: 982,
        dp5: 765,
        dp6: 125,
        dp7: 128
      };
      insertTickId2 = 2000;
      insertPayload2 = {
        dp1: 21234,
        dp2: 2123.32,
        dp4: 2982,
        dp5: 2765,
        dp6: 2125,
        dp7: 2128
      };
      insertTickId3 = 3000;
      insertPayload3 = {
        dp1: 31234,
        dp2: 3123.32,
        dp4: 3982,
        dp5: 3765,
        dp6: 3125,
        dp7: 3128
      };
      insertTickId4 = 4000;
      insertPayload4 = {
        dp1: 41244,
        dp2: 4124.42,
        dp4: 4982,
        dp5: 4765,
        dp6: 4125,
        dp7: 4128
      };
      insertTickId5 = 5000;
      insertPayload5 = {
        dp1: 51254,
        dp2: 5125.52,
        dp4: 5982,
        dp5: 5765,
        dp6: 5125,
        dp7: 5128
      };
      sampleTimeGroupsToRemove = [1, 5];
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      await variableStorage.init(initialPayload);
      await variableStorage.insertValues(insertTickId1, insertPayload1);
      await variableStorage.insertValues(insertTickId2, insertPayload2);
      await variableStorage.insertValues(insertTickId3, insertPayload3);
      await variableStorage.insertValues(insertTickId4, insertPayload4);
      await variableStorage.insertValues(insertTickId5, insertPayload5);
      await variableStorage.clear(sampleTimeGroupsToRemove);
    };

    it("should remove all for given sample time groups", async () => {
      await exec();

      let data = await variableStorage.getAllData();

      let expectedData = {
        ["1"]: {},

        ["5"]: {},

        ["10"]: {
          ["1000"]: {
            ["dp6"]: insertPayload1["dp6"],
            ["dp7"]: insertPayload1["dp7"]
          },
          ["2000"]: {
            ["dp6"]: insertPayload2["dp6"],
            ["dp7"]: insertPayload2["dp7"]
          },
          ["3000"]: {
            ["dp6"]: insertPayload3["dp6"],
            ["dp7"]: insertPayload3["dp7"]
          },
          ["4000"]: {
            ["dp6"]: insertPayload4["dp6"],
            ["dp7"]: insertPayload4["dp7"]
          },
          ["5000"]: {
            ["dp6"]: insertPayload5["dp6"],
            ["dp7"]: insertPayload5["dp7"]
          }
        }
      };

      expect(data).toEqual(expectedData);
    });

    it("should not throw and remove rest if one of group does not exists", async () => {
      sampleTimeGroupsToRemove.push("fakeDp");

      await exec();

      let data = await variableStorage.getAllData();

      let expectedData = {
        ["1"]: {},

        ["5"]: {},

        ["10"]: {
          ["1000"]: {
            ["dp6"]: insertPayload1["dp6"],
            ["dp7"]: insertPayload1["dp7"]
          },
          ["2000"]: {
            ["dp6"]: insertPayload2["dp6"],
            ["dp7"]: insertPayload2["dp7"]
          },
          ["3000"]: {
            ["dp6"]: insertPayload3["dp6"],
            ["dp7"]: insertPayload3["dp7"]
          },
          ["4000"]: {
            ["dp6"]: insertPayload4["dp6"],
            ["dp7"]: insertPayload4["dp7"]
          },
          ["5000"]: {
            ["dp6"]: insertPayload5["dp6"],
            ["dp7"]: insertPayload5["dp7"]
          }
        }
      };

      expect(data).toEqual(expectedData);
    });

    it("should not remove any data if there is no given sampleGroup", async () => {
      sampleTimeGroupsToRemove = [];

      await exec();

      let data = await variableStorage.getAllData();

      let expectedData = {
        ["1"]: {
          ["1000"]: {
            ["dp1"]: insertPayload1["dp1"],
            ["dp2"]: insertPayload1["dp2"]
          },
          ["2000"]: {
            ["dp1"]: insertPayload2["dp1"],
            ["dp2"]: insertPayload2["dp2"]
          },
          ["3000"]: {
            ["dp1"]: insertPayload3["dp1"],
            ["dp2"]: insertPayload3["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["1000"]: {
            ["dp4"]: insertPayload1["dp4"],
            ["dp5"]: insertPayload1["dp5"]
          },
          ["2000"]: {
            ["dp4"]: insertPayload2["dp4"],
            ["dp5"]: insertPayload2["dp5"]
          },
          ["3000"]: {
            ["dp4"]: insertPayload3["dp4"],
            ["dp5"]: insertPayload3["dp5"]
          },
          ["4000"]: {
            ["dp4"]: insertPayload4["dp4"],
            ["dp5"]: insertPayload4["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        },

        ["10"]: {
          ["1000"]: {
            ["dp6"]: insertPayload1["dp6"],
            ["dp7"]: insertPayload1["dp7"]
          },
          ["2000"]: {
            ["dp6"]: insertPayload2["dp6"],
            ["dp7"]: insertPayload2["dp7"]
          },
          ["3000"]: {
            ["dp6"]: insertPayload3["dp6"],
            ["dp7"]: insertPayload3["dp7"]
          },
          ["4000"]: {
            ["dp6"]: insertPayload4["dp6"],
            ["dp7"]: insertPayload4["dp7"]
          },
          ["5000"]: {
            ["dp6"]: insertPayload5["dp6"],
            ["dp7"]: insertPayload5["dp7"]
          }
        }
      };

      expect(data).toEqual(expectedData);
    });
  });

  describe("clearAll", () => {
    let variableStorage;
    let initialPayload;
    let insertTickId1;
    let insertPayload1;
    let insertTickId2;
    let insertPayload2;
    let insertTickId3;
    let insertPayload3;
    let insertTickId4;
    let insertPayload4;
    let insertTickId5;
    let insertPayload5;

    beforeEach(() => {
      initialPayload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      insertTickId1 = 1000;
      insertPayload1 = {
        dp1: 1234,
        dp2: 123.32,
        dp4: 982,
        dp5: 765,
        dp6: 125,
        dp7: 128
      };
      insertTickId2 = 2000;
      insertPayload2 = {
        dp1: 21234,
        dp2: 2123.32,
        dp4: 2982,
        dp5: 2765,
        dp6: 2125,
        dp7: 2128
      };
      insertTickId3 = 3000;
      insertPayload3 = {
        dp1: 31234,
        dp2: 3123.32,
        dp4: 3982,
        dp5: 3765,
        dp6: 3125,
        dp7: 3128
      };
      insertTickId4 = 4000;
      insertPayload4 = {
        dp1: 41244,
        dp2: 4124.42,
        dp4: 4982,
        dp5: 4765,
        dp6: 4125,
        dp7: 4128
      };
      insertTickId5 = 5000;
      insertPayload5 = {
        dp1: 51254,
        dp2: 5125.52,
        dp4: 5982,
        dp5: 5765,
        dp6: 5125,
        dp7: 5128
      };
      sampleTimeGroupsToRemove = [1, 5];
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      await variableStorage.init(initialPayload);
      await variableStorage.insertValues(insertTickId1, insertPayload1);
      await variableStorage.insertValues(insertTickId2, insertPayload2);
      await variableStorage.insertValues(insertTickId3, insertPayload3);
      await variableStorage.insertValues(insertTickId4, insertPayload4);
      await variableStorage.insertValues(insertTickId5, insertPayload5);
      await variableStorage.clearAll();
    };

    it("should remove all for all sample time groups", async () => {
      await exec();

      let data = await variableStorage.getAllData();

      expect(data).toEqual({
        "1": {},
        "5": {},
        "10": {}
      });
    });
  });

  describe("getAllData", () => {
    let variableStorage;
    let initialPayload;
    let insertTickId1;
    let insertPayload1;
    let insertTickId2;
    let insertPayload2;
    let insertTickId3;
    let insertPayload3;
    let insertTickId4;
    let insertPayload4;
    let insertTickId5;
    let insertPayload5;

    beforeEach(() => {
      initialPayload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      insertTickId1 = 1000;
      insertPayload1 = {
        dp1: 1234,
        dp2: 123.32,
        dp4: 982,
        dp5: 765,
        dp6: 125,
        dp7: 128
      };
      insertTickId2 = 2000;
      insertPayload2 = {
        dp1: 21234,
        dp2: 2123.32,
        dp4: 2982,
        dp5: 2765,
        dp6: 2125,
        dp7: 2128
      };
      insertTickId3 = 3000;
      insertPayload3 = {
        dp1: 31234,
        dp2: 3123.32,
        dp4: 3982,
        dp5: 3765,
        dp6: 3125,
        dp7: 3128
      };
      insertTickId4 = 4000;
      insertPayload4 = {
        dp1: 41244,
        dp2: 4124.42,
        dp4: 4982,
        dp5: 4765,
        dp6: 4125,
        dp7: 4128
      };
      insertTickId5 = 5000;
      insertPayload5 = {
        dp1: 51254,
        dp2: 5125.52,
        dp4: 5982,
        dp5: 5765,
        dp6: 5125,
        dp7: 5128
      };
      sampleTimeGroupsToRemove = [1, 5];
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      await variableStorage.init(initialPayload);
      await variableStorage.insertValues(insertTickId1, insertPayload1);
      await variableStorage.insertValues(insertTickId2, insertPayload2);
      await variableStorage.insertValues(insertTickId3, insertPayload3);
      await variableStorage.insertValues(insertTickId4, insertPayload4);
      await variableStorage.insertValues(insertTickId5, insertPayload5);
      return variableStorage.getAllData();
    };

    it("should return all data from storage", async () => {
      let data = await exec();

      let expectedData = {
        ["1"]: {
          ["1000"]: {
            ["dp1"]: insertPayload1["dp1"],
            ["dp2"]: insertPayload1["dp2"]
          },
          ["2000"]: {
            ["dp1"]: insertPayload2["dp1"],
            ["dp2"]: insertPayload2["dp2"]
          },
          ["3000"]: {
            ["dp1"]: insertPayload3["dp1"],
            ["dp2"]: insertPayload3["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["1000"]: {
            ["dp4"]: insertPayload1["dp4"],
            ["dp5"]: insertPayload1["dp5"]
          },
          ["2000"]: {
            ["dp4"]: insertPayload2["dp4"],
            ["dp5"]: insertPayload2["dp5"]
          },
          ["3000"]: {
            ["dp4"]: insertPayload3["dp4"],
            ["dp5"]: insertPayload3["dp5"]
          },
          ["4000"]: {
            ["dp4"]: insertPayload4["dp4"],
            ["dp5"]: insertPayload4["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        },

        ["10"]: {
          ["1000"]: {
            ["dp6"]: insertPayload1["dp6"],
            ["dp7"]: insertPayload1["dp7"]
          },
          ["2000"]: {
            ["dp6"]: insertPayload2["dp6"],
            ["dp7"]: insertPayload2["dp7"]
          },
          ["3000"]: {
            ["dp6"]: insertPayload3["dp6"],
            ["dp7"]: insertPayload3["dp7"]
          },
          ["4000"]: {
            ["dp6"]: insertPayload4["dp6"],
            ["dp7"]: insertPayload4["dp7"]
          },
          ["5000"]: {
            ["dp6"]: insertPayload5["dp6"],
            ["dp7"]: insertPayload5["dp7"]
          }
        }
      };

      expect(data).toEqual(expectedData);
    });
  });

  describe("getData", () => {
    let variableStorage;
    let initialPayload;
    let insertTickId1;
    let insertPayload1;
    let insertTickId2;
    let insertPayload2;
    let insertTickId3;
    let insertPayload3;
    let insertTickId4;
    let insertPayload4;
    let insertTickId5;
    let insertPayload5;
    let sampleTimeGroupsToGet;

    beforeEach(() => {
      initialPayload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      insertTickId1 = 1000;
      insertPayload1 = {
        dp1: 1234,
        dp2: 123.32,
        dp4: 982,
        dp5: 765,
        dp6: 125,
        dp7: 128
      };
      insertTickId2 = 2000;
      insertPayload2 = {
        dp1: 21234,
        dp2: 2123.32,
        dp4: 2982,
        dp5: 2765,
        dp6: 2125,
        dp7: 2128
      };
      insertTickId3 = 3000;
      insertPayload3 = {
        dp1: 31234,
        dp2: 3123.32,
        dp4: 3982,
        dp5: 3765,
        dp6: 3125,
        dp7: 3128
      };
      insertTickId4 = 4000;
      insertPayload4 = {
        dp1: 41244,
        dp2: 4124.42,
        dp4: 4982,
        dp5: 4765,
        dp6: 4125,
        dp7: 4128
      };
      insertTickId5 = 5000;
      insertPayload5 = {
        dp1: 51254,
        dp2: 5125.52,
        dp4: 5982,
        dp5: 5765,
        dp6: 5125,
        dp7: 5128
      };
      sampleTimeGroupsToGet = [1, 5];
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      await variableStorage.init(initialPayload);
      await variableStorage.insertValues(insertTickId1, insertPayload1);
      await variableStorage.insertValues(insertTickId2, insertPayload2);
      await variableStorage.insertValues(insertTickId3, insertPayload3);
      await variableStorage.insertValues(insertTickId4, insertPayload4);
      await variableStorage.insertValues(insertTickId5, insertPayload5);
      return variableStorage.getData(sampleTimeGroupsToGet);
    };

    it("should return all data from storage of given sample groups", async () => {
      let data = await exec();

      let expectedData = {
        ["1"]: {
          ["1000"]: {
            ["dp1"]: insertPayload1["dp1"],
            ["dp2"]: insertPayload1["dp2"]
          },
          ["2000"]: {
            ["dp1"]: insertPayload2["dp1"],
            ["dp2"]: insertPayload2["dp2"]
          },
          ["3000"]: {
            ["dp1"]: insertPayload3["dp1"],
            ["dp2"]: insertPayload3["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["1000"]: {
            ["dp4"]: insertPayload1["dp4"],
            ["dp5"]: insertPayload1["dp5"]
          },
          ["2000"]: {
            ["dp4"]: insertPayload2["dp4"],
            ["dp5"]: insertPayload2["dp5"]
          },
          ["3000"]: {
            ["dp4"]: insertPayload3["dp4"],
            ["dp5"]: insertPayload3["dp5"]
          },
          ["4000"]: {
            ["dp4"]: insertPayload4["dp4"],
            ["dp5"]: insertPayload4["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        }
      };

      expect(data).toEqual(expectedData);
    });
  });

  describe("getXData", () => {
    let variableStorage;
    let initialPayload;
    let insertTickId1;
    let insertPayload1;
    let insertTickId2;
    let insertPayload2;
    let insertTickId3;
    let insertPayload3;
    let insertTickId4;
    let insertPayload4;
    let insertTickId5;
    let insertPayload5;
    let sampleTimeGroupsToGet;
    let x;

    beforeEach(() => {
      initialPayload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      insertTickId1 = 1000;
      insertPayload1 = {
        dp1: 1234,
        dp2: 123.32,
        dp4: 982,
        dp5: 765,
        dp6: 125,
        dp7: 128
      };
      insertTickId2 = 2000;
      insertPayload2 = {
        dp1: 21234,
        dp2: 2123.32,
        dp4: 2982,
        dp5: 2765,
        dp6: 2125,
        dp7: 2128
      };
      insertTickId3 = 3000;
      insertPayload3 = {
        dp1: 31234,
        dp2: 3123.32,
        dp4: 3982,
        dp5: 3765,
        dp6: 3125,
        dp7: 3128
      };
      insertTickId4 = 4000;
      insertPayload4 = {
        dp1: 41244,
        dp2: 4124.42,
        dp4: 4982,
        dp5: 4765,
        dp6: 4125,
        dp7: 4128
      };
      insertTickId5 = 5000;
      insertPayload5 = {
        dp1: 51254,
        dp2: 5125.52,
        dp4: 5982,
        dp5: 5765,
        dp6: 5125,
        dp7: 5128
      };
      sampleTimeGroupsToGet = [1, 5];
      x = 3;
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      await variableStorage.init(initialPayload);
      await variableStorage.insertValues(insertTickId1, insertPayload1);
      await variableStorage.insertValues(insertTickId2, insertPayload2);
      await variableStorage.insertValues(insertTickId3, insertPayload3);
      await variableStorage.insertValues(insertTickId4, insertPayload4);
      await variableStorage.insertValues(insertTickId5, insertPayload5);
      return variableStorage.getXData(sampleTimeGroupsToGet, x);
    };

    it("should return X data from storage of given sample groups", async () => {
      let data = await exec();

      let expectedData = {
        ["1"]: {
          ["3000"]: {
            ["dp1"]: insertPayload3["dp1"],
            ["dp2"]: insertPayload3["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["3000"]: {
            ["dp4"]: insertPayload3["dp4"],
            ["dp5"]: insertPayload3["dp5"]
          },
          ["4000"]: {
            ["dp4"]: insertPayload4["dp4"],
            ["dp5"]: insertPayload4["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        }
      };

      expect(data).toEqual(expectedData);
    });

    it("should return all data from storage of given sample groups if x is larger than count", async () => {
      x = 10;

      let data = await exec();

      let expectedData = {
        ["1"]: {
          ["1000"]: {
            ["dp1"]: insertPayload1["dp1"],
            ["dp2"]: insertPayload1["dp2"]
          },
          ["2000"]: {
            ["dp1"]: insertPayload2["dp1"],
            ["dp2"]: insertPayload2["dp2"]
          },
          ["3000"]: {
            ["dp1"]: insertPayload3["dp1"],
            ["dp2"]: insertPayload3["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["1000"]: {
            ["dp4"]: insertPayload1["dp4"],
            ["dp5"]: insertPayload1["dp5"]
          },
          ["2000"]: {
            ["dp4"]: insertPayload2["dp4"],
            ["dp5"]: insertPayload2["dp5"]
          },
          ["3000"]: {
            ["dp4"]: insertPayload3["dp4"],
            ["dp5"]: insertPayload3["dp5"]
          },
          ["4000"]: {
            ["dp4"]: insertPayload4["dp4"],
            ["dp5"]: insertPayload4["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        }
      };

      expect(data).toEqual(expectedData);
    });

    it("should return empty object if x is 0", async () => {
      x = 0;

      let data = await exec();

      expect(data).toEqual({
        "1": {},
        "5": {}
      });
    });

    it("should return X data from storage of given sample groups even if one of sample groups does not exists", async () => {
      sampleTimeGroupsToGet.push("fakeGroup");
      let data = await exec();

      let expectedData = {
        ["1"]: {
          ["3000"]: {
            ["dp1"]: insertPayload3["dp1"],
            ["dp2"]: insertPayload3["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["3000"]: {
            ["dp4"]: insertPayload3["dp4"],
            ["dp5"]: insertPayload3["dp5"]
          },
          ["4000"]: {
            ["dp4"]: insertPayload4["dp4"],
            ["dp5"]: insertPayload4["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        }
      };

      expect(data).toEqual(expectedData);
    });
  });

  describe("getAllXData", () => {
    let variableStorage;
    let initialPayload;
    let insertTickId1;
    let insertPayload1;
    let insertTickId2;
    let insertPayload2;
    let insertTickId3;
    let insertPayload3;
    let insertTickId4;
    let insertPayload4;
    let insertTickId5;
    let insertPayload5;
    let x;

    beforeEach(() => {
      initialPayload = {
        dirPath: path.join(varaibleStorageDir, "testVariablesStorage"),
        bufferSize: 20,
        sampleTimeGroups: [
          {
            sampleTime: 1,
            variableIds: ["dp1", "dp2", "dp3"]
          },
          {
            sampleTime: 5,
            variableIds: ["dp4", "dp5"]
          },
          {
            sampleTime: 10,
            variableIds: ["dp6", "dp7", "dp8"]
          }
        ]
      };
      insertTickId1 = 1000;
      insertPayload1 = {
        dp1: 1234,
        dp2: 123.32,
        dp4: 982,
        dp5: 765,
        dp6: 125,
        dp7: 128
      };
      insertTickId2 = 2000;
      insertPayload2 = {
        dp1: 21234,
        dp2: 2123.32,
        dp4: 2982,
        dp5: 2765,
        dp6: 2125,
        dp7: 2128
      };
      insertTickId3 = 3000;
      insertPayload3 = {
        dp1: 31234,
        dp2: 3123.32,
        dp4: 3982,
        dp5: 3765,
        dp6: 3125,
        dp7: 3128
      };
      insertTickId4 = 4000;
      insertPayload4 = {
        dp1: 41244,
        dp2: 4124.42,
        dp4: 4982,
        dp5: 4765,
        dp6: 4125,
        dp7: 4128
      };
      insertTickId5 = 5000;
      insertPayload5 = {
        dp1: 51254,
        dp2: 5125.52,
        dp4: 5982,
        dp5: 5765,
        dp6: 5125,
        dp7: 5128
      };
      x = 3;
    });

    let exec = async () => {
      variableStorage = new VariablesStorage();
      await variableStorage.init(initialPayload);
      await variableStorage.insertValues(insertTickId1, insertPayload1);
      await variableStorage.insertValues(insertTickId2, insertPayload2);
      await variableStorage.insertValues(insertTickId3, insertPayload3);
      await variableStorage.insertValues(insertTickId4, insertPayload4);
      await variableStorage.insertValues(insertTickId5, insertPayload5);
      return variableStorage.getAllXData(x);
    };

    it("should return X data from storage of given sample groups", async () => {
      let data = await exec();

      let expectedData = {
        ["1"]: {
          ["3000"]: {
            ["dp1"]: insertPayload3["dp1"],
            ["dp2"]: insertPayload3["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["3000"]: {
            ["dp4"]: insertPayload3["dp4"],
            ["dp5"]: insertPayload3["dp5"]
          },
          ["4000"]: {
            ["dp4"]: insertPayload4["dp4"],
            ["dp5"]: insertPayload4["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        },

        ["10"]: {
          ["3000"]: {
            ["dp6"]: insertPayload3["dp6"],
            ["dp7"]: insertPayload3["dp7"]
          },
          ["4000"]: {
            ["dp6"]: insertPayload4["dp6"],
            ["dp7"]: insertPayload4["dp7"]
          },
          ["5000"]: {
            ["dp6"]: insertPayload5["dp6"],
            ["dp7"]: insertPayload5["dp7"]
          }
        }
      };

      expect(data).toEqual(expectedData);
    });

    it("should return all data from storage of given sample groups if x is larger than count", async () => {
      x = 10;

      let data = await exec();

      let expectedData = {
        ["1"]: {
          ["1000"]: {
            ["dp1"]: insertPayload1["dp1"],
            ["dp2"]: insertPayload1["dp2"]
          },
          ["2000"]: {
            ["dp1"]: insertPayload2["dp1"],
            ["dp2"]: insertPayload2["dp2"]
          },
          ["3000"]: {
            ["dp1"]: insertPayload3["dp1"],
            ["dp2"]: insertPayload3["dp2"]
          },
          ["4000"]: {
            ["dp1"]: insertPayload4["dp1"],
            ["dp2"]: insertPayload4["dp2"]
          },
          ["5000"]: {
            ["dp1"]: insertPayload5["dp1"],
            ["dp2"]: insertPayload5["dp2"]
          }
        },

        ["5"]: {
          ["1000"]: {
            ["dp4"]: insertPayload1["dp4"],
            ["dp5"]: insertPayload1["dp5"]
          },
          ["2000"]: {
            ["dp4"]: insertPayload2["dp4"],
            ["dp5"]: insertPayload2["dp5"]
          },
          ["3000"]: {
            ["dp4"]: insertPayload3["dp4"],
            ["dp5"]: insertPayload3["dp5"]
          },
          ["4000"]: {
            ["dp4"]: insertPayload4["dp4"],
            ["dp5"]: insertPayload4["dp5"]
          },
          ["5000"]: {
            ["dp4"]: insertPayload5["dp4"],
            ["dp5"]: insertPayload5["dp5"]
          }
        },

        ["10"]: {
          ["1000"]: {
            ["dp6"]: insertPayload1["dp6"],
            ["dp7"]: insertPayload1["dp7"]
          },
          ["2000"]: {
            ["dp6"]: insertPayload2["dp6"],
            ["dp7"]: insertPayload2["dp7"]
          },
          ["3000"]: {
            ["dp6"]: insertPayload3["dp6"],
            ["dp7"]: insertPayload3["dp7"]
          },
          ["4000"]: {
            ["dp6"]: insertPayload4["dp6"],
            ["dp7"]: insertPayload4["dp7"]
          },
          ["5000"]: {
            ["dp6"]: insertPayload5["dp6"],
            ["dp7"]: insertPayload5["dp7"]
          }
        }
      };

      expect(data).toEqual(expectedData);
    });

    it("should return empty object if x is 0", async () => {
      x = 0;

      let data = await exec();

      expect(data).toEqual({
        "1": {},
        "5": {},
        "10": {}
      });
    });
  });
});
