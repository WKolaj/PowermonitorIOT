class ArchiveManager {
  constructor(fileName) {
    this._fileName = fileName;
    this._initialized = false;
    this._busy = false;
    this._variables = {};
  }

  get Variables() {
    return this._variables;
  }

  get FileName() {
    return this._fileName;
  }

  get Initialized() {
    return this._initialized;
  }

  get Busy() {
    return this._busy;
  }

  getColumnType(variable) {
    let payload = variable.Payload;

    switch (payload.type) {
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
          `Given variable type is not recognized: ${payload.type}`
        );
      }
    }
  }

  getColumnName(variable) {
    return `col_${variable.Id}`;
  }

  checkIfInitialzed() {
    if (!this.Initialized) {
      throw new Error("Archive manager not init");
    }

    return true;
  }

  checkIfBusy() {
    if (this.Busy) {
      throw new Error("Device is busy");
    }
  }

  checkIfVariableExists(variable) {
    if (variable.Id in this.Variables) {
      throw new Error(`Variable of id ${variable.Id} already exists!`);
    }
  }

  async addVariable(variable) {
    this.checkIfInitialzed();
    this.checkIfVariableExists();
    this.checkIfBusy();
    this._busy = true;

    let columnType = this.getColumnType(variable);
    let columnName = this.getColumnName(variable);

    let self = this;

    this.db.run(
      `ALTER TABLE data ADD COLUMN ${columnName} ${columnType};`,
      function(err) {
        if (err) {
          self._busy = false;
          if (err) {
            return console.log(err.message);
          }
          self.Variables[variable.Id] = variable;
        }
      }
    );
  }

  async init() {
    if (!this.Initialized && !this.Busy) {
      this._busy = true;

      this.db = new sqlite3.Database(`database/${fileName}.db`);

      this.db.run(`CREATE TABLE data (date INTEGER);`, function(err) {
        this._initialized = true;
        this._busy = false;
        if (err) {
          return console.log(err.message);
        }
      });
    }
  }
}

module.exports = ArchiveManager;
