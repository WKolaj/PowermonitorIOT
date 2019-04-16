const ArchiveManager = require("../../classes/archiveManager/ArchiveManager");
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

describe("ArchiveManager", () => {
  //Path to primary database
  let db1Path;
  //Path to secondary database
  let db2Path;

  beforeEach(() => {
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
  });

  afterEach(async () => {
    await clearDirectory(db1Path);
    await clearDirectory(db2Path);
  });

  describe("constructor", () => {
    let fileName;

    beforeEach(() => {
      fileName = "testDB.db";
    });

    let exec = () => {
      return new ArchiveManager(fileName);
    };

    it("should create new ArchiveManager and set its default fields", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.FileName).toEqual(fileName);
      expect(result.Initialized).toEqual(false);
      expect(result.Busy).toEqual(false);
      expect(result.Variables).toEqual({});
      expect(result.DBPath).toEqual(db1Path);
      expect(result.FilePath).toEqual(path.join(db1Path, fileName));
    });

    it("should throw if file name is empty", () => {
      fileName = undefined;
      expect(() => exec()).toThrow();
    });
  });

  describe("Variables", () => {
    let fileName;
    let archiveManager;

    beforeEach(() => {
      fileName = "testDB.db";
    });

    let exec = () => {
      archiveManager = new ArchiveManager(fileName);
      return archiveManager.Variables;
    };

    it("should return Variables", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(archiveManager._variables);
    });
  });

  describe("FileName", () => {
    let fileName;
    let archiveManager;

    beforeEach(() => {
      fileName = "testDB.db";
    });

    let exec = () => {
      archiveManager = new ArchiveManager(fileName);
      return archiveManager.FileName;
    };

    it("should return FileName", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(fileName);
    });
  });

  describe("FilePath", () => {
    let fileName;
    let archiveManager;

    beforeEach(() => {
      fileName = "testDB.db";
    });

    let exec = () => {
      archiveManager = new ArchiveManager(fileName);
      return archiveManager.FilePath;
    };

    it("should return FilePath", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(path.join(db1Path, fileName));
    });
  });

  describe("DBPath", () => {
    let fileName;
    let archiveManager;

    beforeEach(() => {
      fileName = "testDB.db";
    });

    let exec = () => {
      archiveManager = new ArchiveManager(fileName);
      return archiveManager.DBPath;
    };

    it("should return DBPath", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(db1Path);
    });
  });

  describe("Initialized", () => {
    let fileName;
    let archiveManager;

    beforeEach(() => {
      fileName = "testDB.db";
    });

    let exec = () => {
      archiveManager = new ArchiveManager(fileName);
      return archiveManager.Initialized;
    };

    it("should return Initialized", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(archiveManager._initialized);
    });
  });

  describe("Busy", () => {
    let fileName;
    let archiveManager;

    beforeEach(() => {
      fileName = "testDB.db";
    });

    let exec = () => {
      archiveManager = new ArchiveManager(fileName);
      return archiveManager.Busy;
    };

    it("should return Busy", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(archiveManager._busy);
    });
  });

  describe("DB", () => {
    let fileName;
    let archiveManager;

    beforeEach(() => {
      fileName = "testDB.db";
    });

    let exec = async () => {
      archiveManager = new ArchiveManager(fileName);
      await archiveManager.init();
      return archiveManager.DB;
    };

    it("should return DB", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(archiveManager._db);
    });
  });

  describe("init", () => {
    let fileName;
    let filePath;
    let archiveManager;
    let alreadyInitialized;
    let alreadyBusy;

    beforeEach(() => {
      fileName = "testDB.db";
      alreadyInitialized = undefined;
      alreadyBusy = undefined;

      filePath = path.join(db1Path, fileName);
    });

    let exec = () => {
      archiveManager = new ArchiveManager(fileName);
      if (alreadyBusy) archiveManager._busy = true;
      if (alreadyInitialized) archiveManager._initialized = true;

      return archiveManager.init();
    };

    it("should create database file if not exists", async () => {
      await exec();

      expect(fs.existsSync(archiveManager.FilePath)).toBeTruthy();
    });

    it("should set DB object", async () => {
      await exec();

      expect(archiveManager.DB).toBeDefined();
    });

    it("should reject if is busy", async () => {
      alreadyBusy = true;

      expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(fs.existsSync(archiveManager.FilePath)).toBeFalsy();
    });

    it("should not be invoke if has already been initialized", async () => {
      alreadyInitialized = true;

      expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(fs.existsSync(archiveManager.FilePath)).toBeFalsy();

      //Should not set busy to true
      expect(archiveManager.Busy).toBeFalsy();
    });

    it("should create data table in database", async () => {
      await exec();

      let tableExists = await checkIfTableExists(filePath, "data");

      expect(tableExists).toBeTruthy();
    });

    it("should create date column in data table inside database", async () => {
      await exec();

      let columnExists = await checkIfColumnExists(
        filePath,
        "data",
        "date",
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
    });

    it("should set busy to false after operation", async () => {
      await exec();

      expect(archiveManager.Busy).toBeFalsy();
    });

    it("should set Initialized to true after operation", async () => {
      await exec();

      expect(archiveManager.Initialized).toBeTruthy();
    });

    it("should not throw but create table in file if database file already exists", async () => {
      createDatabaseFile(filePath);
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      let tableExists = await checkIfTableExists(filePath, "data");

      let columnExists = await checkIfColumnExists(
        filePath,
        "data",
        "date",
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
      expect(tableExists).toBeTruthy();
      expect(archiveManager.Busy).toBeFalsy();
      expect(archiveManager.Initialized).toBeTruthy();
    });

    it("should not throw if database file already exists and table already exists", async () => {
      await createDatabaseTable(filePath, "data");
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      let tableExists = await checkIfTableExists(filePath, "data");

      let columnExists = await checkIfColumnExists(
        filePath,
        "data",
        "date",
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
      expect(tableExists).toBeTruthy();
      expect(archiveManager.Busy).toBeFalsy();
      expect(archiveManager.Initialized).toBeTruthy();
    });

    it("should set busy to false if there is an error during quering database", async () => {
      let newExec = () => {
        archiveManager = new ArchiveManager(fileName);
        //Creating file that is empty - in order to throw error
        fs.writeFileSync(filePath, "test content");

        return archiveManager.init();
      };

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await newExec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(archiveManager.Initialized).toBeFalsy();
      expect(archiveManager.Busy).toBeFalsy();
    });
  });

  describe("getColumnType", () => {
    let fileName;
    let archiveManager;
    let variableType;
    let variable;

    beforeEach(() => {
      fileName = "testDB.db";
      variableType = "boolean";
    });

    let exec = async () => {
      variable = { Type: variableType };
      archiveManager = new ArchiveManager(fileName);
      await archiveManager.init();
      return archiveManager.getColumnType(variable);
    };

    it("should return INTEGER if variable type is boolean", async () => {
      variableType = "boolean";
      let result = await exec();

      expect(result).toEqual("INTEGER");
    });

    it("should return REAL if variable type is float", async () => {
      variableType = "float";
      let result = await exec();

      expect(result).toEqual("REAL");
    });

    it("should return REAL if variable type is swappedFloat", async () => {
      variableType = "swappedFloat";
      let result = await exec();

      expect(result).toEqual("REAL");
    });

    it("should return INTEGER if variable type is int16", async () => {
      variableType = "int16";
      let result = await exec();

      expect(result).toEqual("INTEGER");
    });

    it("should return INTEGER if variable type is uInt16", async () => {
      variableType = "uInt16";
      let result = await exec();

      expect(result).toEqual("INTEGER");
    });

    it("should return INTEGER if variable type is int32", async () => {
      variableType = "int32";
      let result = await exec();

      expect(result).toEqual("INTEGER");
    });

    it("should return INTEGER if variable type is uInt32", async () => {
      variableType = "uInt32";
      let result = await exec();

      expect(result).toEqual("INTEGER");
    });

    it("should return INTEGER if variable type is swappedInt32", async () => {
      variableType = "swappedInt32";
      let result = await exec();

      expect(result).toEqual("INTEGER");
    });

    it("should return INTEGER if variable type is swappedUInt32", async () => {
      variableType = "swappedUInt32";
      let result = await exec();

      expect(result).toEqual("INTEGER");
    });

    it("should throw if type is not recognized", async () => {
      variableType = "test type";

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("getColumnNameById", () => {
    let fileName;
    let archiveManager;
    let variableId;
    let variable;

    beforeEach(() => {
      fileName = "testDB.db";
      variableId = "1234";
    });

    let exec = async () => {
      variable = { Id: variableId };
      archiveManager = new ArchiveManager(fileName);
      await archiveManager.init();
      return archiveManager.getColumnNameById(variable.Id);
    };

    it("should return col_id", async () => {
      let result = await exec();

      expect(result).toEqual(`col_${variableId}`);
    });
  });

  describe("getColumnName", () => {
    let fileName;
    let archiveManager;
    let variableId;
    let variable;

    beforeEach(() => {
      fileName = "testDB.db";
      variableId = "1234";
    });

    let exec = async () => {
      variable = { Id: variableId };
      archiveManager = new ArchiveManager(fileName);
      await archiveManager.init();
      return archiveManager.getColumnName(variable);
    };

    it("should return col_id", async () => {
      let result = await exec();

      expect(result).toEqual(`col_${variableId}`);
    });
  });

  describe("checkIfInitialzed", () => {
    let fileName;
    let archiveManager;
    let isInitialized;

    beforeEach(() => {
      fileName = "testDB.db";
      isInitialized = true;
    });

    let exec = async () => {
      archiveManager = new ArchiveManager(fileName);
      archiveManager._initialized = isInitialized;
      return archiveManager.checkIfInitialzed();
    };

    it("should return true if is initialized", async () => {
      let result = await exec();

      expect(result).toEqual(true);
    });

    it("should throw if is not initialized", async () => {
      isInitialized = false;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("checkIfBusy", () => {
    let fileName;
    let archiveManager;
    let isBusy;

    beforeEach(() => {
      fileName = "testDB.db";
      isBusy = true;
    });

    let exec = async () => {
      archiveManager = new ArchiveManager(fileName);
      archiveManager._busy = isBusy;
      return archiveManager.checkIfBusy();
    };

    it("should throw if is busy", async () => {
      isBusy = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should return false if is not busy", async () => {
      isBusy = false;

      let result = await exec();

      expect(result).toEqual(false);
    });
  });

  describe("doesVariableIdExists", () => {
    let fileName;
    let archiveManager;
    let variable1;
    let variable2;
    let variable3;
    let variableId;

    beforeEach(() => {
      fileName = "testDB";
      variable1 = { Id: "1234", Type: "float" };
      variable2 = { Id: "1235", Type: "boolean" };
      variable3 = { Id: "1236", Type: "int32" };
      variableId = "1235";
    });

    let exec = async () => {
      archiveManager = new ArchiveManager(fileName);
      await archiveManager.init(fileName);

      await archiveManager.addVariable(variable1);
      await archiveManager.addVariable(variable2);
      await archiveManager.addVariable(variable3);

      return archiveManager.doesVariableIdExists(variableId);
    };

    it("should return true if variable is already added", async () => {
      let result = await exec();

      expect(result).toBeTruthy();
    });

    it("should return false if variable is already added", async () => {
      variableId = "1237";
      let result = await exec();

      expect(result).toBeFalsy();
    });
  });

  describe("doesColumnExist", () => {
    let fileName;
    let archiveManager;
    let archiveManagerBusy;
    let archiveManagerInit;
    let variableType;
    let variableId;
    let variablePayload;
    let columnNameToCheck;

    beforeEach(() => {
      fileName = "testDB";
      variableId = "testColumn";
      variableType = "int32";
      columnNameToCheck = "col_" + variableId;
      archiveManagerInit = true;
      archiveManagerBusy = false;
    });

    let exec = async () => {
      variablePayload = {
        Id: variableId,
        Type: variableType
      };

      archiveManager = new ArchiveManager(fileName);

      if (archiveManagerInit) await archiveManager.init(fileName);
      await archiveManager.addVariable(variablePayload);

      if (archiveManagerBusy) archiveManager._busy = true;
      return archiveManager.doesColumnExist(columnNameToCheck);
    };

    it("should return true if column exists", async () => {
      let result = await exec();

      expect(result).toBeTruthy();
    });

    it("should return false if column exists", async () => {
      columnNameToCheck = "test column";
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should return false if column is undefined", async () => {
      columnNameToCheck = undefined;
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should set Busy to false after operation", async () => {
      let result = await exec();

      expect(archiveManager.Busy).toBeFalsy();
    });

    it("should throw if archiveManager is busy", async () => {
      archiveManagerBusy = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw if archiveManager is not initlialized", async () => {
      archiveManagerInit = false;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("checkIfVariableExists", () => {
    let fileName;
    let archiveManager;
    let variable1;
    let variable2;
    let variable3;
    let variableId;
    let variable;

    beforeEach(() => {
      fileName = "testDB";
      variable1 = { Id: "1234", Type: "float" };
      variable2 = { Id: "1235", Type: "boolean" };
      variable3 = { Id: "1236", Type: "int32" };
      variableId = "1237";
    });

    let exec = async () => {
      variable = { Id: variableId };
      archiveManager = new ArchiveManager(fileName);
      await archiveManager.init(fileName);

      await archiveManager.addVariable(variable1);
      await archiveManager.addVariable(variable2);
      await archiveManager.addVariable(variable3);

      return archiveManager.checkIfVariableExists(variable);
    };

    it("should return false if variable does not exists", async () => {
      let result = await exec();

      expect(result).toBeFalsy();
    });

    it("should throw if variable already exists", async () => {
      variableId = "1235";
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("addVariable", () => {
    let fileName;
    let filePath;
    let archiveManager;
    let initManager;
    let managerBusy;
    let variableId;
    let variableType;
    let variable;

    beforeEach(() => {
      initManager = true;
      managerBusy = false;
      fileName = "testDB";
      variableId = "1237";
      variableType = "boolean";
      filePath = path.join(db1Path, fileName);
    });

    let exec = async () => {
      variable = { Id: variableId, Type: variableType };
      archiveManager = new ArchiveManager(fileName);

      if (initManager) {
        await archiveManager.init(fileName);
      }

      archiveManager._busy = managerBusy;

      return archiveManager.addVariable(variable);
    };

    it("should add variable to archiveManager", async () => {
      await exec();

      expect(Object.keys(archiveManager.Variables).length).toEqual(1);
      expect(archiveManager.Variables[variableId]).toEqual(variable);
    });

    it("should add column to table in database", async () => {
      await exec();
      let columnName = archiveManager.getColumnName(variable);
      let columnExists = await checkIfColumnExists(
        filePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
    });

    it("should not add column to table in database if it already exists", async () => {
      let columnName = archiveManager.getColumnNameById(variableId);

      await createDatabaseTable(filePath, "data");

      await createDatabaseColumn(filePath, "data", columnName, "INTEGER");

      await exec();

      let columnExists = await checkIfColumnExists(
        filePath,
        "data",
        columnName,
        "INTEGER"
      );

      expect(columnExists).toBeTruthy();
    });

    it("should throw if not initialized", async () => {
      initManager = false;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
      expect(archiveManager.Busy).toBeFalsy();
    });

    it("should throw if busy", async () => {
      managerBusy = true;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should set busy to false after operation", async () => {
      await exec();

      expect(archiveManager.Busy).toBeFalsy();
    });
  });

  describe("filterPayloadWithAddedVariables", () => {
    let fileName;
    let archiveManager;
    let variable1;
    let variable2;
    let variable3;
    let payload;
    let variableInPayload1;
    let variableInPayload2;
    let variableInPayload3;
    let emptyPayload;
    let addVariable;

    beforeEach(() => {
      fileName = "testDB";
      variable1 = { Id: "1234", Type: "float" };
      variable2 = { Id: "1235", Type: "boolean" };
      variable3 = { Id: "1236", Type: "int32" };
      variableInPayload1 = { Id: "1235", Type: "boolean" };
      variableInPayload2 = { Id: "1236", Type: "int32" };
      variableInPayload3 = { Id: "1237", Type: "swappedFloat" };
      emptyPayload = false;
      addVariable = true;
    });

    let exec = async () => {
      archiveManager = new ArchiveManager(fileName);
      await archiveManager.init(fileName);

      if (addVariable) {
        await archiveManager.addVariable(variable1);
        await archiveManager.addVariable(variable2);
        await archiveManager.addVariable(variable3);
      }

      payload = {
        [variableInPayload1.Id]: variableInPayload1,
        [variableInPayload2.Id]: variableInPayload2,
        [variableInPayload3.Id]: variableInPayload3
      };

      if (emptyPayload) payload = {};

      return archiveManager.filterPayloadWithAddedVariables(payload);
    };

    it("should filter payload according to added variable - leave only variables that exist inside archiveManager", async () => {
      let result = await exec();

      let resultKeys = Object.keys(result);

      expect(resultKeys.length).toEqual(2);
      expect(resultKeys).toContain(variable2.Id);
      expect(resultKeys).toContain(variable3.Id);

      expect(result[variable2.Id]).toEqual(variable2);
      expect(result[variable3.Id]).toEqual(variable3);
    });

    it("should return empty object if none of variables are inside archiveManager", async () => {
      variableInPayload1 = { Id: "1238", Type: "boolean" };
      variableInPayload2 = { Id: "1239", Type: "int32" };
      variableInPayload3 = { Id: "1240", Type: "swappedFloat" };

      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual({});
    });

    it("should return empty object if payload is empty", async () => {
      emptyPayload = true;
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual({});
    });

    it("should return empty object if there are no variables added to archive manager", async () => {
      addVariable = false;

      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual({});
    });
  });

  describe("prepareInsertQueryString", () => {
    let fileName;
    let archiveManager;
    let payload;

    beforeEach(() => {
      fileName = "testDB.db";
      payload = {
        "1234": 123,
        "1235": 124,
        "1236": 125
      };
    });

    let exec = async () => {
      archiveManager = new ArchiveManager(fileName);
      await archiveManager.init();
      return archiveManager.prepareInsertQueryString(payload);
    };

    it("should return valid query string according to payload", async () => {
      let result = await exec();

      let validQueryString =
        "INSERT INTO data(date,col_1234,col_1235,col_1236) VALUES (?,?,?,?);";

      expect(result).toEqual(validQueryString);
    });

    it("should return valid query string according to payload if there are no variables", async () => {
      payload = {};

      let result = await exec();

      let validQueryString = "INSERT INTO data(date) VALUES (?);";

      expect(result).toEqual(validQueryString);
    });
  });

  describe("insertValues", () => {
    let fileName;
    let filePath;
    let archiveManager;
    let date;

    let busy;
    let init;

    let valuesPayload;

    let variable1Id;
    let variable2Id;
    let variable3Id;
    let variable4Id;

    let variable1Type;
    let variable2Type;
    let variable3Type;
    let variable4Type;

    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let variable4Payload;

    let variable1Value;
    let variable2Value;
    let variable3Value;
    let variable4Value;

    let addVariable1ToPayload;
    let addVariable2ToPayload;
    let addVariable3ToPayload;
    let addVariable4ToPayload;

    let addVariable1ToManager;
    let addVariable2ToManager;
    let addVariable3ToManager;
    let addVariable4ToManager;

    beforeEach(() => {
      fileName = "testDB.db";
      filePath = path.join(db1Path, fileName);
      busy = false;
      init = true;

      variable1Id = "1234";
      variable2Id = "1235";
      variable3Id = "1236";
      variable4Id = "1237";

      variable1Type = "int32";
      variable2Type = "float";
      variable3Type = "boolean";
      variable4Type = "uInt32";

      variable1Value = 1;
      variable2Value = 2.3;
      //boolean has to have integer value!
      variable3Value = 1;
      variable4Value = 5;

      addVariable1ToPayload = true;
      addVariable2ToPayload = true;
      addVariable3ToPayload = true;
      addVariable4ToPayload = true;

      addVariable1ToManager = true;
      addVariable2ToManager = true;
      addVariable3ToManager = true;
      addVariable4ToManager = true;

      date = 8765;
    });

    let exec = async () => {
      variable1Payload = {
        Id: variable1Id,
        Type: variable1Type
      };
      variable2Payload = {
        Id: variable2Id,
        Type: variable2Type
      };
      variable3Payload = {
        Id: variable3Id,
        Type: variable3Type
      };
      variable4Payload = {
        Id: variable4Id,
        Type: variable4Type
      };

      archiveManager = new ArchiveManager(fileName);
      await archiveManager.init();

      if (addVariable1ToManager)
        await archiveManager.addVariable(variable1Payload);
      if (addVariable2ToManager)
        await archiveManager.addVariable(variable2Payload);
      if (addVariable3ToManager)
        await archiveManager.addVariable(variable3Payload);
      if (addVariable4ToManager)
        await archiveManager.addVariable(variable4Payload);

      valuesPayload = {};

      if (addVariable1ToPayload) valuesPayload[variable1Id] = variable1Value;
      if (addVariable2ToPayload) valuesPayload[variable2Id] = variable2Value;
      if (addVariable3ToPayload) valuesPayload[variable3Id] = variable3Value;
      if (addVariable4ToPayload) valuesPayload[variable4Id] = variable4Value;

      if (!init) archiveManager._initialized = false;
      if (busy) archiveManager._busy = true;

      return archiveManager.insertValues(date, valuesPayload);
    };

    it("should insert values inside database", async () => {
      let result = await exec();
      let rows = await readAllDataFromTable(filePath, "data");

      expect(rows.length).toEqual(1);

      let row = rows[0];

      expect(row[`date`]).toEqual(date);
      expect(row[`col_${variable1Id}`]).toEqual(variable1Value);
      expect(row[`col_${variable2Id}`]).toEqual(variable2Value);
      expect(row[`col_${variable3Id}`]).toEqual(variable3Value);
      expect(row[`col_${variable4Id}`]).toEqual(variable4Value);
    });

    it("should be able to insert values several times inside database", async () => {
      let result = await exec();

      valuesPayload[variable1Id]++;
      valuesPayload[variable2Id]++;
      valuesPayload[variable3Id]++;
      valuesPayload[variable4Id]++;

      await archiveManager.insertValues(date + 1, valuesPayload);

      let rows = await readAllDataFromTable(filePath, "data");

      expect(rows.length).toEqual(2);

      let row1 = rows[0];

      expect(row1[`date`]).toEqual(date);
      expect(row1[`col_${variable1Id}`]).toEqual(variable1Value);
      expect(row1[`col_${variable2Id}`]).toEqual(variable2Value);
      expect(row1[`col_${variable3Id}`]).toEqual(variable3Value);
      expect(row1[`col_${variable4Id}`]).toEqual(variable4Value);

      let row2 = rows[1];

      expect(row2[`date`]).toEqual(date + 1);
      expect(row2[`col_${variable1Id}`]).toEqual(variable1Value + 1);
      expect(row2[`col_${variable2Id}`]).toEqual(variable2Value + 1);
      expect(row2[`col_${variable3Id}`]).toEqual(variable3Value + 1);
      expect(row2[`col_${variable4Id}`]).toEqual(variable4Value + 1);
    });

    it("should insert only values that are inside payload and manager", async () => {
      addVariable4ToManager = false;
      addVariable1ToPayload = false;

      let result = await exec();
      let rows = await readAllDataFromTable(filePath, "data");

      expect(rows.length).toEqual(1);

      let row = rows[0];

      expect(Object.keys(row).length).toEqual(4);

      expect(row[`date`]).toEqual(date);
      expect(row[`col_${variable1Id}`]).toEqual(null);
      expect(row[`col_${variable2Id}`]).toEqual(variable2Value);
      expect(row[`col_${variable3Id}`]).toEqual(variable3Value);
    });

    it("should insert only date if there are no common variables inside payload and manager", async () => {
      addVariable3ToManager = false;
      addVariable4ToManager = false;
      addVariable1ToPayload = false;
      addVariable2ToPayload = false;

      let result = await exec();
      let rows = await readAllDataFromTable(filePath, "data");

      expect(rows.length).toEqual(1);

      let row = rows[0];

      expect(Object.keys(row).length).toEqual(3);

      expect(row[`date`]).toEqual(date);
      expect(row[`col_${variable1Id}`]).toEqual(null);
      expect(row[`col_${variable2Id}`]).toEqual(null);
    });

    it("should throw and not insert any data if manager is busy", async () => {
      busy = true;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      let rows = await readAllDataFromTable(filePath, "data");

      expect(rows.length).toEqual(0);
    });

    it("should throw and not insert any data  if manager is not initialized", async () => {
      init = false;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      let rows = await readAllDataFromTable(filePath, "data");

      expect(rows.length).toEqual(0);
    });
  });

  describe("getValue", () => {
    let fileName;
    let archiveManager;

    let busy;
    let init;

    let variable1Id;
    let variable2Id;
    let variable3Id;
    let variable4Id;

    let variable1Type;
    let variable2Type;
    let variable3Type;
    let variable4Type;

    let variable1Payload;
    let variable2Payload;
    let variable3Payload;
    let variable4Payload;

    let addVariable1ToManager;
    let addVariable2ToManager;
    let addVariable3ToManager;
    let addVariable4ToManager;

    let date1;
    let date2;
    let date3;
    let date4;

    let variable2Value1;
    let variable2Value2;
    let variable2Value3;
    let variable2Value4;

    let variable2InsertPayload1;
    let variable2InsertPayload2;
    let variable2InsertPayload3;
    let variable2InsertPayload4;

    let addVariable2ToInsertPayload1;
    let addVariable2ToInsertPayload2;
    let addVariable2ToInsertPayload3;
    let addVariable2ToInsertPayload4;

    let getVariableId;
    let getVariableDate;

    beforeEach(() => {
      fileName = "testDB.db";
      filePath = path.join(db1Path, fileName);
      busy = false;
      init = true;

      variable1Id = "1234";
      variable2Id = "1235";
      variable3Id = "1236";
      variable4Id = "1237";

      variable1Type = "int32";
      variable2Type = "float";
      variable3Type = "boolean";
      variable4Type = "uInt32";

      variable2Value1 = 1.3;
      variable2Value2 = 1.4;
      variable2Value3 = 1.5;
      variable2Value4 = 1.6;

      date1 = 1001;
      date2 = 1002;
      date3 = 1003;
      date4 = 1004;

      addVariable1ToManager = true;
      addVariable2ToManager = true;
      addVariable3ToManager = true;
      addVariable4ToManager = true;

      addVariable2ToInsertPayload1 = true;
      addVariable2ToInsertPayload2 = true;
      addVariable2ToInsertPayload3 = true;
      addVariable2ToInsertPayload4 = true;

      getVariableId = variable2Id;
      getVariableDate = date2;
    });

    let exec = async () => {
      variable1Payload = {
        Id: variable1Id,
        Type: variable1Type
      };
      variable2Payload = {
        Id: variable2Id,
        Type: variable2Type
      };
      variable3Payload = {
        Id: variable3Id,
        Type: variable3Type
      };
      variable4Payload = {
        Id: variable4Id,
        Type: variable4Type
      };

      archiveManager = new ArchiveManager(fileName);
      await archiveManager.init();

      if (addVariable1ToManager)
        await archiveManager.addVariable(variable1Payload);
      if (addVariable2ToManager)
        await archiveManager.addVariable(variable2Payload);
      if (addVariable3ToManager)
        await archiveManager.addVariable(variable3Payload);
      if (addVariable4ToManager)
        await archiveManager.addVariable(variable4Payload);

      valuesPayload = {};

      variable2InsertPayload1 = { [variable2Id]: variable2Value1 };
      variable2InsertPayload2 = { [variable2Id]: variable2Value2 };
      variable2InsertPayload3 = { [variable2Id]: variable2Value3 };
      variable2InsertPayload4 = { [variable2Id]: variable2Value4 };

      if (addVariable2ToInsertPayload1)
        await archiveManager.insertValues(date1, variable2InsertPayload1);
      if (addVariable2ToInsertPayload2)
        await archiveManager.insertValues(date2, variable2InsertPayload2);
      if (addVariable2ToInsertPayload3)
        await archiveManager.insertValues(date3, variable2InsertPayload3);
      if (addVariable2ToInsertPayload4)
        await archiveManager.insertValues(date4, variable2InsertPayload4);

      if (!init) archiveManager._initialized = false;
      if (busy) archiveManager._busy = true;

      return archiveManager.getValue(getVariableDate, getVariableId);
    };

    it("should retrieve data from database according to date and given variable", async () => {
      //Getting data from date2 and variable2

      let result = await exec();
      let column2Name = archiveManager.getColumnNameById(variable2Id);

      let expectedResult = {
        date: date2,
        [column2Name]: variable2Value2
      };

      expect(result).toEqual(expectedResult);
    });

    it("should retrieve data from database if you try to access first value", async () => {
      //Getting data from date1 and variable2
      getVariableDate = date1;

      let result = await exec();
      let column2Name = archiveManager.getColumnNameById(variable2Id);

      let expectedResult = {
        date: date1,
        [column2Name]: variable2Value1
      };

      expect(result).toEqual(expectedResult);
    });

    it("should retrieve data from database if you try to access last value", async () => {
      //Getting data from date4 and variable2
      getVariableDate = date4;

      let result = await exec();
      let column2Name = archiveManager.getColumnNameById(variable2Id);

      let expectedResult = {
        date: date4,
        [column2Name]: variable2Value4
      };

      expect(result).toEqual(expectedResult);
    });

    it("should retrieve last data from database if you try to access greater date", async () => {
      //Getting data from date4 and variable2
      getVariableDate = date4 + 1;

      let result = await exec();
      let column2Name = archiveManager.getColumnNameById(variable2Id);

      let expectedResult = {
        date: date4,
        [column2Name]: variable2Value4
      };

      expect(result).toEqual(expectedResult);
    });

    it("should get undefined if date is smaller than its first occurance in database", async () => {
      //Getting data from date4 and variable2
      getVariableDate = date1 - 1;

      let result = await exec();

      expect(result).not.toBeDefined();
    });

    it("should get undefined if there is no data in database", async () => {
      addVariable2ToInsertPayload1 = false;
      addVariable2ToInsertPayload2 = false;
      addVariable2ToInsertPayload3 = false;
      addVariable2ToInsertPayload4 = false;

      let result = await exec();

      expect(result).not.toBeDefined();
    });

    it("should throw if there is no variable with given id", async () => {
      getVariableId = "8765";
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should set busy to false after operation", async () => {
      let result = await exec();

      expect(archiveManager.Busy).toBeFalsy();
    });

    it("should throw and not insert any data if manager is busy", async () => {
      busy = true;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });

    it("should throw and not insert any data  if manager is not initialized", async () => {
      init = false;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });
});
