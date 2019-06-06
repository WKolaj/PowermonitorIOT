const path = require("path");
const config = require("config");
const sqlite3 = require("sqlite3");
const { isObjectEmpty } = require("../../utilities/utilities");

class ArchiveManager {
  /**
   * @description Class for archiving device data
   * @param {string} fileName
   */
  constructor(fileName) {
    if (!fileName) throw new Error("fileName cannot be empty!");

    this._fileName = fileName;
    this._initialized = false;
    this._busy = false;
    this._variables = {};
    this._calculationElements = {};
    this._dbPath = config.get("db1Path");
    this._filePath = path.join(this._dbPath, this._fileName);
  }

  /**
   * @description Variables associated with archive manager
   */
  get Variables() {
    return this._variables;
  }

  /**
   * @description Calculation elements associated with archive manager
   */
  get CalculationElements() {
    return this._calculationElements;
  }

  /**
   * @description File name of database file
   */
  get FileName() {
    return this._fileName;
  }

  /**
   * @description Whole file path of database file
   */
  get FilePath() {
    return this._filePath;
  }

  /**
   * @description Database path
   */
  get DBPath() {
    return this._dbPath;
  }

  /**
   * @description is Archive manager initialized
   */
  get Initialized() {
    return this._initialized;
  }

  /**
   * @description is device busy
   */
  get Busy() {
    return this._busy;
  }

  /**
   * @description sqlite database object
   */
  get DB() {
    return this._db;
  }

  /**
   * @description Method for getting column type of variable
   * @param {object} variable
   */
  getColumnType(variable) {
    switch (variable.Type) {
      case "boolean": {
        return "INTEGER";
      }
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

  /**
   * @description Method for getting column name based on variable
   * @param {object} variable variable object
   */
  getColumnName(variable) {
    return this.getColumnNameById(variable.Id);
  }

  /**
   * @description Method for getting column name based on variable or calculation element id
   * @param {string} variableId id of variable or calculation element
   */
  getColumnNameById(variableId) {
    return `col_${variableId}`;
  }

  /**
   * @description Method for getting column type on the basis of calculation element
   * @param {object} calculationElement Calculation element
   */
  getColumnTypeCalculationElement(calculationElement) {
    switch (calculationElement.ValueType) {
      case "boolean": {
        return "INTEGER";
      }
      case "float": {
        return "REAL";
      }
      case "integer": {
        return "INTEGER";
      }
      default: {
        throw new Error(
          `Given variable type is not recognized: ${
            calculationElement.ValueType
          }`
        );
      }
    }
  }

  /**
   * @description Method for getting column name based on calculation element
   * @param {object} calculationElement Calculation element
   */
  getColumnNameOfCalculationElement(calculationElement) {
    return this.getColumnNameById(calculationElement.Id);
  }

  /**
   * @description Method for checking if manager is initialized - throws if not
   */
  checkIfInitialzed() {
    if (!this.Initialized) {
      throw new Error("Archive manager not initialized");
    }

    return true;
  }

  /**
   * @description Method for checking if manager is busy - throws if yes
   */
  checkIfBusy() {
    if (this.Busy) {
      throw new Error("Device is busy");
    }
    return false;
  }

  /**
   * @description Method or checking if variable of given id is already added to manager
   * @param {string} variableId
   */
  doesVariableIdExists(variableId) {
    return variableId in this.Variables;
  }

  /**
   * @description Method for checking if variable is already added - throws if it is added
   * @param {object} variable variable to check
   */
  checkIfVariableExists(variable) {
    if (this.doesVariableIdExists(variable.Id)) {
      throw new Error(`Variable of id ${variable.Id} already exists!`);
    }

    return false;
  }

  /**
   * @description Method for checking if calculation element is already added to manager
   * @param {string} calculationElementId id of element
   */
  doesCalculationElementIdExists(calculationElementId) {
    return calculationElementId in this.CalculationElements;
  }

  /**
   * @description Method for checking if calculation element is already aded - throw if it is added
   * @param {object} calculationElement
   */
  checkIfCalculationElementExists(calculationElement) {
    if (this.doesCalculationElementIdExists(calculationElement.Id)) {
      throw new Error(
        `CalculationElement of id ${calculationElement.Id} already exists!`
      );
    }

    return false;
  }

  /**
   * @description Method for adding variable to manager
   * @param {object} variable variable to add
   */
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

  /**
   * @description Method for removing variable from manager
   * @param {string} variableId id of variable
   */
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
        let variableToDelete = this.Variables[variableId];
        delete this.Variables[variableId];
        this._busy = false;

        return resolve(variableToDelete);
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Method for adding calculation element to manager
   * @param {object} calculationElement calculation element to add
   */
  async addCalculationElement(calculationElement) {
    //Returning promise - in order to implement async/await instead of callback functions
    return new Promise(async (resolve, reject) => {
      try {
        this.checkIfInitialzed();
        this.checkIfCalculationElementExists(calculationElement);
        this.checkIfBusy();

        let columnType = this.getColumnTypeCalculationElement(
          calculationElement
        );
        let columnName = this.getColumnNameOfCalculationElement(
          calculationElement
        );

        let doesColumnAlreadyExists = await this.doesColumnExist(columnName);

        if (doesColumnAlreadyExists) {
          this.CalculationElements[calculationElement.Id] = calculationElement;
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
              self.CalculationElements[
                calculationElement.Id
              ] = calculationElement;
              return resolve(true);
            }
          );
        }
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Method for removing calulcation element from manager
   * @param {string} calculationElementId calculation element id
   */
  async removeCalculationElement(calculationElementId) {
    //Returning promise - in order to implement async/await instead of callback functions
    return new Promise(async (resolve, reject) => {
      try {
        this.checkIfInitialzed();

        //Rejecting if variable does not exist
        if (!this.doesCalculationElementIdExists(calculationElementId))
          return reject(
            new Error(
              `Calculation element does not exists - id ${calculationElementId}`
            )
          );

        this.checkIfBusy();

        this._busy = true;
        let elementToDelete = this.CalculationElements[calculationElementId];
        delete this.CalculationElements[calculationElementId];
        this._busy = false;

        return resolve(elementToDelete);
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Method for checking if column exists
   * @param {string} columnId name of column
   */
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

  /**
   * @description Method for initializing manager
   */
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

  /**
   * @description Method for filtering all variables and caluculation elements in payload on the basis of added ones
   * @param {object} payload Payload to filter
   */
  filterPayloadWithAddedVariables(payload) {
    let payloadToReturn = {};

    let allVariableIds = Object.keys(payload);

    for (let variableId of allVariableIds) {
      if (variableId in this.Variables) {
        payloadToReturn[variableId] = payload[variableId];
      }
      //if variableId is inside calculationElements - also add it to return payload
      if (variableId in this.CalculationElements) {
        payloadToReturn[variableId] = payload[variableId];
      }
    }
    return payloadToReturn;
  }

  /**
   * @description Method for creating query string to insert all elements to database
   * @param {object} filteredPayload Payload storing variables to insert - should be prevoiously filtered
   */
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

  /**
   * @description Method for inserting values to database
   * @param {number} date Tick id of operation
   * @param {object} payload payload, with ids and values
   */
  async insertValues(date, payload) {
    return new Promise((resolve, reject) => {
      this.checkIfInitialzed();
      this.checkIfBusy();

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

  /**
   * @description Method for getting values from database
   * @param {*} date Date of values to check
   * @param {*} variableId id of variable/calculation element to get
   */
  async getValue(date, variableId) {
    return new Promise((resolve, reject) => {
      try {
        let noVariableOfGivenId = !this.doesVariableIdExists(variableId);
        let noCalculationElementOfGivenId = !this.doesCalculationElementIdExists(
          variableId
        );
        if (noVariableOfGivenId && noCalculationElementOfGivenId)
          throw new Error(
            `There is no variable and calculation element of id ${variableId}`
          );
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

            if (row) {
              return resolve({ [row.date]: row[columnName] });
            } else {
              return resolve({});
            }
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
