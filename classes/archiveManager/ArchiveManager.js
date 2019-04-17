const path = require("path");
const config = require("config");
const sqlite3 = require("sqlite3");
const { isObjectEmpty } = require("../../utility/utility");

class ArchiveManager {
  constructor(fileName) {
    if (!fileName) throw new Error("fileName cannot be empty!");

    this._fileName = fileName;
    this._initialized = false;
    this._busy = false;
    this._variables = {};
    this._dbPath = config.get("db1Path");
    this._filePath = path.join(this._dbPath, this._fileName);
  }

  get Variables() {
    return this._variables;
  }

  get FileName() {
    return this._fileName;
  }

  get FilePath() {
    return this._filePath;
  }

  get DBPath() {
    return this._dbPath;
  }

  get Initialized() {
    return this._initialized;
  }

  get Busy() {
    return this._busy;
  }

  get DB() {
    return this._db;
  }

  getColumnType(variable) {
    switch (variable.Type) {
      case "boolean": {
        return "INTEGER";
      }
      // TO DO
      // case "byteArray": {
      //   return this._createByteArrayVariable(payload);
      // }
      case "float": {
        return "REAL";
      }
      case "swappedFloat": {
        return "REAL";
      }
      case "int16": {
        return "INTEGER";
      }
      case "uInt16": {
        return "INTEGER";
      }
      case "int32": {
        return "INTEGER";
      }
      case "uInt32": {
        return "INTEGER";
      }
      case "swappedInt32": {
        return "INTEGER";
      }
      case "swappedUInt32": {
        return "INTEGER";
      }
      default: {
        throw new Error(
          `Given variable type is not recognized: ${variable.Type}`
        );
      }
    }
  }

  getColumnName(variable) {
    return this.getColumnNameById(variable.Id);
  }

  getColumnNameById(variableId) {
    return `col_${variableId}`;
  }

  checkIfInitialzed() {
    if (!this.Initialized) {
      throw new Error("Archive manager not initialized");
    }

    return true;
  }

  checkIfBusy() {
    if (this.Busy) {
      throw new Error("Device is busy");
    }
    return false;
  }

  doesVariableIdExists(variableId) {
    return variableId in this.Variables;
  }

  checkIfVariableExists(variable) {
    if (this.doesVariableIdExists(variable.Id)) {
      throw new Error(`Variable of id ${variable.Id} already exists!`);
    }

    return false;
  }

  async addVariable(variable) {
    //Returning promise - in order to implement async/await instead of callback functions
    return new Promise(async (resolve, reject) => {
      try {
        this.checkIfInitialzed();
        this.checkIfVariableExists(variable);
        this.checkIfBusy();

        let columnType = this.getColumnType(variable);
        let columnName = this.getColumnName(variable);

        let doesColumnAlreadyExists = await this.doesColumnExist(columnName);

        if (doesColumnAlreadyExists) {
          this.Variables[variable.Id] = variable;
          return resolve(true);
        } else {
          this._busy = true;

          let self = this;

          this.DB.run(
            `ALTER TABLE data ADD COLUMN ${columnName} ${columnType};`,
            function(err) {
              self._busy = false;
              if (err) {
                return reject(err);
              }
              self.Variables[variable.Id] = variable;
              return resolve(true);
            }
          );
        }
      } catch (err) {
        return reject(err);
      }
    });
  }

  async doesColumnExist(columnId) {
    return new Promise((resolve, reject) => {
      try {
        this.checkIfInitialzed();
        this.checkIfBusy();

        this._busy = true;

        let self = this;

        this.DB.all(`PRAGMA table_info(data);`, function(err, rows) {
          self._busy = false;
          if (err) {
            return reject(err);
          }

          //Checking all rows one by one - if one of them has desired name - return true
          for (let row of rows) {
            if (row.name === columnId) {
              return resolve(true);
            }
          }

          return resolve(false);
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  async init() {
    //Returning promise - in order to implement async/await instead of callback functions
    return new Promise((resolve, reject) => {
      try {
        if (!this.Initialized && !this.Busy) {
          this._busy = true;

          this._db = new sqlite3.Database(this.FilePath);

          let self = this;

          this.DB.run(
            `CREATE TABLE IF NOT EXISTS data (date INTEGER, PRIMARY KEY(date) );`,
            function(err) {
              self._busy = false;
              if (err) {
                return reject(err);
              }
              self._initialized = true;
              return resolve(true);
            }
          );
        }
      } catch (err) {
        this._busy = false;
        return reject(err);
      }
    });
  }

  async removeVariable(variableId) {
    //Returning promise - in order to implement async/await instead of callback functions
    return new Promise(async (resolve, reject) => {
      try {
        this.checkIfInitialzed();

        //Rejecting if variable does not exist
        if (!this.doesVariableIdExists(variableId))
          return reject(
            new Error(`variable does not exists - id ${variableId}`)
          );

        this.checkIfBusy();

        this._busy = true;
        delete this.Variables[variableId];
        this._busy = false;

        return resolve(true);
      } catch (err) {
        return reject(err);
      }
    });
  }

  filterPayloadWithAddedVariables(payload) {
    let payloadToReturn = {};

    let allVariableIds = Object.keys(payload);

    for (let variableId of allVariableIds) {
      if (variableId in this.Variables) {
        payloadToReturn[variableId] = payload[variableId];
      }
    }

    return payloadToReturn;
  }

  prepareInsertQueryString(filteredPayload) {
    let firstPart = "INSERT INTO data(date";

    let secondPart = ") VALUES (?";

    let filteredVariableIds = Object.keys(filteredPayload);

    for (let varaibleId of filteredVariableIds) {
      firstPart += `,${this.getColumnNameById(varaibleId)}`;
      secondPart += ",?";
    }

    secondPart += ");";

    return firstPart + secondPart;
  }

  async insertValues(date, payload) {
    return new Promise((resolve, reject) => {
      this.checkIfInitialzed();
      //Insert data is possible while busy
      //this.checkIfBusy();

      if (payload === undefined || payload === null || isObjectEmpty(payload))
        return resolve(false);

      //this._busy = true;

      try {
        let filteredPayload = this.filterPayloadWithAddedVariables(payload);

        let insertQuery = this.prepareInsertQueryString(filteredPayload);

        let valuesToBeInserted = [date, ...Object.values(filteredPayload)];

        this.DB.run(insertQuery, valuesToBeInserted, err => {
          //this._busy = false;

          if (err) {
            return reject(err);
          }

          return resolve(true);
        });
      } catch (err) {
        //this._busy = false;
        return reject(err);
      }
    });
  }

  async getValue(date, variableId) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.doesVariableIdExists(variableId))
          throw new Error(`There is no variable of id ${variableId}`);
        this.checkIfInitialzed();
        //in case of getting value - there is no need to check if device is busy
        //this.checkIfBusy();
        //this._busy = true;

        let columnName = this.getColumnNameById(variableId);

        this.DB.get(
          `SELECT date, ${columnName} FROM data WHERE date <= ${date} ORDER BY date DESC LIMIT 1`,
          (err, row) => {
            //this._busy = false;

            if (err) {
              return reject(err);
            }

            return resolve(row);
          }
        );
      } catch (err) {
        //this._busy = false;

        return reject(err);
      }
    });
  }
}

module.exports = ArchiveManager;
