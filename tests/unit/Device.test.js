const Device = require("../../classes/device/Device");
const config = require("config");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");

//Method for deleting file
let clearFile = async file => {
  return new Promise((resolve, reject) => {
    fs.unlink(file, err => {
      if (err) {
        return reject(err);
      }

      return resolve(true);
    });
  });
};

//Method for clearing directory
let clearDirectory = async directory => {
  return new Promise(async (resolve, reject) => {
    fs.readdir(directory, async (err, files) => {
      if (err) {
        return reject(err);
      }

      for (const file of files) {
        try {
          await clearFile(path.join(directory, file));
        } catch (err) {
          return reject(err);
        }
      }

      return resolve(true);
    });
  });
};

//Method for checking if table exists
let checkIfTableExists = (dbFile, tableName) => {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database(dbFile);

    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`,
      function(err, row) {
        if (err) {
          return reject(err);
        }
        return row ? resolve(true) : resolve(false);
      }
    );
  });
};

//Method for checking if table exists
let checkIfColumnExists = (dbFile, tableName, columnName, columnType) => {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database(dbFile);

    db.all(`PRAGMA table_info(${tableName});`, function(err, rows) {
      if (err) {
        return reject(err);
      }

      //Checking all rows one by one - if one of them has desired name - return true
      for (let row of rows) {
        if (row.name === columnName && row.type === columnType) {
          return resolve(true);
        }
      }

      return resolve(false);
    });
  });
};

let createDatabaseFile = dbFile => {
  let db = new sqlite3.Database(dbFile);
};

let createDatabaseTable = (dbFile, tableName) => {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database(dbFile);

    db.run(
      `CREATE TABLE IF NOT EXISTS ${tableName} (date INTEGER, PRIMARY KEY(date) );`,
      err => {
        if (err) {
          return reject(err);
        }

        return resolve(true);
      }
    );
  });
};

let createDatabaseColumn = (dbFile, tableName, columnName, columnType) => {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database(dbFile);

    db.run(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType};`,
      err => {
        if (err) {
          return reject(err);
        }

        return resolve(true);
      }
    );
  });
};

let readAllDataFromTable = (dbFile, tableName) => {
  return new Promise(async (resolve, reject) => {
    let db = new sqlite3.Database(dbFile);

    db.all(`SELECT * FROM ${tableName};`, (err, rows) => {
      if (err) {
        return reject(err);
      }

      return resolve(rows);
    });
  });
};

describe("Device", () => {
  let db1Path;
  let db2Path;
  beforeEach(async () => {
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
  });

  afterEach(async () => {
    await clearDirectory(db1Path);
    await clearDirectory(db2Path);
  });

  describe("constructor", () => {
    let exec = async () => {
      return new Device();
    };

    it("should create new device and set initialized to false", async () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Initialized).toBeFalsy();
    });
  });

  describe("init", () => {
    let name;
    let payload;
    let device;

    beforeEach(() => {
      name = "test name";
    });

    let exec = async () => {
      payload = { name: name };
      device = new Device(payload);
      return device.init(payload);
    };

    it("should create new Device and set its name", async () => {
      await exec();

      expect(device).toBeDefined();
      expect(device.Name).toEqual(name);
    });

    it("should initiazle variables to empty object", async () => {
      await exec();

      expect(device.Variables).toEqual({});
    });

    it("should initiazle event object", async () => {
      await exec();

      expect(device.Events).toBeDefined();
    });

    it("should set type to undefined", async () => {
      await exec();

      expect(device.Type).not.toBeDefined();
    });

    it("should set initialized to true", async () => {
      await exec();

      expect(device.Initialized).toBeTruthy();
    });

    it("should throw if payload is empty", async () => {
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            device = new Device();
            await device.init();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if payload has no name", async () => {
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            device = new Device();
            await device.init({});
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should create device on the basis of payload that can be generated by payload", async () => {
      let device1 = new Device();
      await device1.init({ name: "device1" });

      let device1Payload = device1.Payload;

      let device2 = new Device(device1Payload);
      await device2.init(device1Payload);

      expect(device2.Payload).toBeDefined();
      expect(device2.Payload).toEqual(device1.Payload);

      expect(device2.Id).toEqual(device1.Id);
      expect(device2.Name).toEqual(device1.Name);
    });
  });

  describe("get Events", () => {
    let name;
    let device;
    let payload;

    beforeEach(() => {
      name = "test name";
    });

    let exec = async () => {
      payload = { name: name };
      device = new Device();
      await device.init(payload);
      return device.Events;
    };

    it("should return EventEmitter of device", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device._events);
    });
  });

  describe("get Name", () => {
    let name;
    let device;
    let payload;

    beforeEach(() => {
      name = "test name";
    });

    let exec = async () => {
      payload = { name: name };
      device = new Device();
      await device.init(payload);
      return device.Name;
    };

    it("should return Name of device", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(name);
    });
  });

  describe("get Variables", () => {
    let name;
    let device;
    let payload;

    beforeEach(() => {
      name = "test name";
    });

    let exec = async () => {
      payload = { name: name };
      device = new Device();
      await device.init(payload);
      return device.Variables;
    };

    it("should return Name of device", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device._variables);
    });
  });

  describe("get Variable", () => {
    let name;
    let device;
    let payload;
    let var1;
    let var2;
    let var3;
    let getId;

    beforeEach(() => {
      name = "test name";
      var1 = { Id: 101 };
      var2 = { Id: 102 };
      var3 = { Id: 103 };
      getId = 102;
    });

    let exec = async () => {
      payload = { name: name };
      device = new Device();
      await device.init(payload);
      device.addVariable(var1);
      device.addVariable(var2);
      device.addVariable(var3);
      return device.getVariable(getId);
    };

    it("should return variable of given id", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(var2);
    });

    it("should return undefined if there is no variable of given id", async () => {
      getId = 1234;
      let result = await exec();

      expect(result).not.toBeDefined();
    });
  });

  describe("get Type", () => {
    let name;
    let device;
    let payload;
    let type;

    beforeEach(() => {
      name = "test name";
      type = "test type";
    });

    let exec = async () => {
      payload = { name: name };
      device = new Device();
      await device.init(payload);
      device._type = type;
      return device.Type;
    };

    it("should return Type of device", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(type);
    });
  });

  describe("get Payload", () => {
    let name;
    let payload;
    let device;

    beforeEach(() => {
      name = "test name";
    });

    let exec = async () => {
      payload = { name: name };
      device = new Device();
      await device.init(payload);
      return device.Payload;
    };

    it("should return device payload", async () => {
      let result = await exec();

      let validPayload = {
        name: device.Name,
        id: device.Id
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });
  });

  describe("addVariable", () => {
    let name;
    let device;
    let variable;
    let variableId;
    let variableType;
    let variableArchived;
    let payload;

    beforeEach(() => {
      name = "test name";
      variableType = "int32";
      variableArchived = true;
      variableId = "test_variable";
    });

    let exec = async () => {
      variable = {
        Id: variableId,
        Type: variableType,
        Archived: variableArchived
      };
      payload = { name: name };
      device = new Device();
      await device.init(payload);
      return device.addVariable(variable);
    };

    it("should add variable to variables", async () => {
      await exec();

      expect(device.Variables[variableId]).toBeDefined();
      expect(device.Variables[variableId]).toEqual(variable);
    });

    it("should add variable to archive manager if variable is archived", async () => {
      variableArchived = true;

      await exec();

      //Checking if varaible is added to archive manager
      expect(
        device.ArchiveManager.doesVariableIdExists(variable.Id)
      ).toBeTruthy();
    });

    it("should not add variable to archive manager if variable is not archived", async () => {
      variableArchived = false;

      await exec();

      //Checking if varaible is added to archive manager
      expect(
        device.ArchiveManager.doesVariableIdExists(variable.Id)
      ).toBeFalsy();
    });

    it("should add variable again after it was deleted", async () => {
      await exec();
      await device.removeVariable(variable.Id);
      await device.addVariable(variable);
      expect(device.Variables[variableId]).toBeDefined();
      expect(device.Variables[variableId]).toEqual(variable);
    });

    it("should replace given variable if name already existis", async () => {
      await exec();
      let newVariable = { Id: variableId, Name: "new" };

      await device.addVariable(newVariable);
      expect(device.Variables[variableId]).not.toEqual(variable);
      expect(device.Variables[variableId]).toEqual(newVariable);
    });
  });

  describe("removeVariable", () => {
    let name;
    let device;
    let variable;
    let variableId;
    let variableType;
    let variableArchived;
    let payload;

    beforeEach(() => {
      name = "test name";
      variableId = "test variable";
      variableType = "int32";
      variableArchived = false;
    });

    let exec = async () => {
      variable = {
        Id: variableId,
        Type: variableType,
        Archived: variableArchived
      };

      payload = { name: name };
      device = new Device();
      await device.init(payload);
      await device.addVariable(variable);
      await device.removeVariable(variableId);
    };

    it("should remove variable from variables", async () => {
      await exec();

      expect(device.Variables[variableId]).not.toBeDefined();
    });

    it("should remove variable from archive manager if it is archived", async () => {
      variableArchived = true;

      await exec();

      expect(device.Variables[variableId]).not.toBeDefined();
      expect(
        device.ArchiveManager.doesVariableIdExists(variableId)
      ).toBeFalsy();
    });

    it("should throw if there is no variable of such id", async () => {
      payload = { name: name };
      device = new Device();
      await device.init(payload);
      await device.addVariable(variable);

      let newVariable = { Id: "new test Id" };

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await device.removeVariable(newVariable);
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("divideVariablesByTickId", () => {
    let variable1;
    let variable2;
    let variable3;
    let variable4;
    let variable5;
    let variable6;
    let variable7;
    let variable8;
    let variable9;
    let variable10;
    let variables;

    beforeEach(() => {
      variable1 = { Name: "var1", TickId: 1 };
      variable2 = { Name: "var2", TickId: 1 };
      variable3 = { Name: "var3", TickId: 2 };
      variable4 = { Name: "var4", TickId: 2 };
      variable5 = { Name: "var5", TickId: 3 };
      variable6 = { Name: "var6", TickId: 3 };
      variable7 = { Name: "var7", TickId: 4 };
      variable8 = { Name: "var8", TickId: 4 };
      variable9 = { Name: "var9", TickId: 5 };
      variable10 = { Name: "var10", TickId: 5 };

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9,
        variable10
      ];
    });

    let exec = async () => {
      return Device.divideVariablesByTickId(variables);
    };

    it("should split variables by TickIds", async () => {
      let result = await exec();
      expect(result).toBeDefined();

      let allTickIds = Object.keys(result);
      expect(allTickIds.length).toEqual(5);

      expect(result).toMatchObject({
        "1": [variable1, variable2],
        "2": [variable3, variable4],
        "3": [variable5, variable6],
        "4": [variable7, variable8],
        "5": [variable9, variable10]
      });
    });

    it("should split variables by TickIds if there is only one tickIds", async () => {
      variable1 = { Name: "var1", TickId: 6 };
      variable2 = { Name: "var2", TickId: 6 };
      variable3 = { Name: "var3", TickId: 6 };
      variable4 = { Name: "var4", TickId: 6 };
      variable5 = { Name: "var5", TickId: 6 };
      variable6 = { Name: "var6", TickId: 6 };
      variable7 = { Name: "var7", TickId: 6 };
      variable8 = { Name: "var8", TickId: 6 };
      variable9 = { Name: "var9", TickId: 6 };
      variable10 = { Name: "var10", TickId: 6 };

      variables = [
        variable1,
        variable2,
        variable3,
        variable4,
        variable5,
        variable6,
        variable7,
        variable8,
        variable9,
        variable10
      ];

      let result = await exec();
      expect(result).toBeDefined();

      let allTickIds = Object.keys(result);
      expect(allTickIds.length).toEqual(1);

      expect(result).toMatchObject({
        "6": [
          variable1,
          variable2,
          variable3,
          variable4,
          variable5,
          variable6,
          variable7,
          variable8,
          variable9,
          variable10
        ]
      });
    });
  });

  describe("refresh", () => {
    let name;
    let payload;
    let device;
    let tickNumber;
    let _refreshMock;
    let _refreshMockResolvedValue;
    let eventEmitterMock;
    let eventEmitterMockEmitMethod;

    beforeEach(() => {
      name = "test name";
      tickNumber = 15;
      _refreshMockResolvedValue = 1234;
      eventEmitterMockEmitMethod = jest.fn();
      eventEmitterMock = { emit: eventEmitterMockEmitMethod };
    });

    let exec = async () => {
      payload = { name: name };
      _refreshMock = jest.fn().mockResolvedValue(_refreshMockResolvedValue);
      device = new Device();
      await device.init(payload);
      device._refresh = _refreshMock;
      device._events = eventEmitterMock;

      return device.refresh(tickNumber);
    };

    it("should call _refresh method with tick arguments", async () => {
      let result = await exec();

      expect(_refreshMock).toHaveBeenCalledTimes(1);
      expect(_refreshMock.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("should invoke Refreshed Event with _refresh result if refresh result is not empty", async () => {
      let result = await exec();

      expect(eventEmitterMockEmitMethod).toHaveBeenCalledTimes(1);
      expect(eventEmitterMockEmitMethod.mock.calls[0][0]).toEqual("Refreshed");
      expect(eventEmitterMockEmitMethod.mock.calls[0][1][0]).toEqual(device);
      expect(eventEmitterMockEmitMethod.mock.calls[0][1][1]).toEqual(
        _refreshMockResolvedValue
      );
      expect(eventEmitterMockEmitMethod.mock.calls[0][1][2]).toEqual(
        tickNumber
      );
    });

    it("should not invoke Refreshed Event if refresh result is empty", async () => {
      _refreshMockResolvedValue = null;

      let result = await exec();

      expect(eventEmitterMockEmitMethod).not.toHaveBeenCalled();
    });
  });

  describe("_generatePayload", () => {
    let name;
    let payload;
    let device;

    beforeEach(() => {
      name = "test name";
    });

    let exec = async () => {
      payload = { name: name };
      device = new Device();
      await device.init(payload);
      return device._generatePayload();
    };

    it("should return device payload", async () => {
      let result = await exec();

      let validPayload = {
        name: device.Name,
        id: device.Id
      };

      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });
  });

  describe("editWithPayload", () => {
    let name;
    let payload;
    let device;
    let nameToEdit;
    let payloadToEdit;

    beforeEach(() => {
      name = "test name";
      nameToEdit = "new test name";
    });

    let exec = async () => {
      payload = { name: name };
      device = new Device();
      await device.init(payload);
      payloadToEdit = { name: nameToEdit };
      return device.editWithPayload(payloadToEdit);
    };

    it("should edit device according to payload", async () => {
      await exec();

      expect(device.Name).toBeDefined();
      expect(device.Name).toEqual(nameToEdit);
    });

    it("should not edit name if name is not defined in payload", async () => {
      nameToEdit = undefined;
      await exec();

      expect(device.Name).toBeDefined();
      expect(device.Name).toEqual(name);
    });
  });

  describe("archiveData", () => {
    let name;
    let device;
    let variable;
    let variableId;
    let variableType;
    let variableArchived;
    let payload;
    let tickNumber;
    let archiveValue;
    let archivePayload;

    let insertSecondTime;
    let archiveSecondPayload;
    let tickNumberSecond;
    let archiveSecondValue;
    let variable2;

    beforeEach(() => {
      name = "test name";
      variableId = "testVariable";
      variableType = "int32";
      variableArchived = true;
      tickNumber = 1234;
      archiveValue = 9876;
      insertSecondTime = false;

      tickNumberSecond = 1235;
      archiveSecondValue = 9877;
    });

    let exec = async () => {
      variable = {
        Id: variableId,
        Type: variableType,
        Archived: variableArchived,
        Value: archiveValue
      };

      payload = { name: name };
      device = new Device();
      await device.init(payload);
      await device.addVariable(variable);

      archivePayload = {
        [variableId]: variable
      };

      if (insertSecondTime) {
        //Inserting two times almost at once

        variable2 = {
          Id: variableId,
          Type: variableType,
          Archived: variableArchived,
          Value: archiveSecondValue
        };

        archiveSecondPayload = {
          [variableId]: variable2
        };

        return Promise.all([
          device.archiveData(tickNumber, archivePayload),
          device.archiveData(tickNumberSecond, archiveSecondPayload)
        ]);
      } else {
        //Inserting one time
        return device.archiveData(tickNumber, archivePayload);
      }
    };

    it("should insert value into database", async () => {
      await exec();

      let valueFromDB = await device.getValueFromDB(variableId, tickNumber);
      let columnName = device.ArchiveManager.getColumnNameById(variableId);

      let expectedPayload = { [columnName]: archiveValue };
      expect(valueFromDB).toMatchObject(expectedPayload);
    });

    it("should insert two values if invoked almost at one time", async () => {
      insertSecondTime = true;

      await exec();

      let columnName = device.ArchiveManager.getColumnNameById(variableId);

      let valueFromDB1 = await device.getValueFromDB(variableId, tickNumber);
      let expectedPayload1 = { [columnName]: archiveValue, date: tickNumber };
      expect(valueFromDB1).toMatchObject(expectedPayload1);

      let valueFromDB2 = await device.getValueFromDB(
        variableId,
        tickNumberSecond
      );
      let expectedPayload2 = {
        [columnName]: archiveSecondValue,
        date: tickNumberSecond
      };
      expect(valueFromDB2).toMatchObject(expectedPayload2);
    });
  });
});
