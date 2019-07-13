const sqlite3 = require("sqlite3");
const { exists, isObjectEmpty } = require("../../utilities/utilities");

class DataStorage {
  /**
   * @description Class for buffering data in db
   */
  constructor() {
    this._dataPoints = {};
    this._filePath = null;
    this._db = null;
    this._bufferSize = 10;
  }

  async setBufferSize(newBufferSize) {
    this._bufferSize = newBufferSize;
  }

  /**
   * @description get column name based on dataPointId
   * @param {string} dataPointId id of datapoint
   */
  static getColumnName(dataPointId) {
    return `col_${dataPointId}`;
  }

  /**
   * @description get id based on datapoint's column name
   * @param {string} columnName column name of datapoint
   */
  static getId(columnName) {
    return columnName.replace("col_", "");
  }

  /**
   * @description Method for creating database for storing data if database does not exist
   * @param {string} filePath Database file path
   */
  async _createDatabaseIfNotExists(filePath) {
    //Returning promise - in order to implement async/await instead of callback functions
    return new Promise((resolve, reject) => {
      try {
        this._db = new sqlite3.Database(filePath);

        let self = this;

        this.DB.run(
          `CREATE TABLE IF NOT EXISTS data (date INTEGER, PRIMARY KEY(date) );`,
          function(err) {
            self._busy = false;
            if (err) {
              return reject(err);
            }
            return resolve(true);
          }
        );
      } catch (err) {
        this._busy = false;
        return reject(err);
      }
    });
  }

  /**
   * @description Method for checking if column exists
   * @param {string} columnName name of column
   */
  async _doesColumnExist(columnName) {
    return new Promise((resolve, reject) => {
      try {
        this.DB.all(`PRAGMA table_info(data);`, function(err, rows) {
          if (err) {
            return reject(err);
          }

          //Checking all rows one by one - if one of them has desired name - return true
          for (let row of rows) {
            if (row.name === columnName) {
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
   * @description Method for adding column to database if it exists
   * @param {*} columnName
   */
  async _addColumnIfNotExists(columnName) {
    return new Promise(async (resolve, reject) => {
      try {
        let columnType = "REAL";

        let doesColumnAlreadyExists = await this._doesColumnExist(columnName);

        if (doesColumnAlreadyExists) {
          return resolve(true);
        } else {
          this.DB.run(
            `ALTER TABLE data ADD COLUMN ${columnName} ${columnType};`,
            function(err) {
              if (err) {
                return reject(err);
              }
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
   * @description Method for adding datapoint to data storage
   * @param {*} dataPointId id of datapoint
   */
  async addDataPoint(dataPointId) {
    //if datapoint is already added to DataPoints - throw error
    if (dataPointId in this.DataPoints) throw Error("datapoint already exists");

    let columnName = DataStorage.getColumnName(dataPointId);
    await this._addColumnIfNotExists(columnName);

    this.DataPoints[dataPointId] = columnName;
  }

  /**
   * @description Method for removing datapoint from data storage
   * @param {*} dataPointId id of datapoint
   */
  async removeDataPoint(dataPointId) {
    if (!(dataPointId in this.DataPoints))
      throw Error("datapoint does not exist");
    delete this.DataPoints[dataPointId];
  }

  /**
   * @description Buffer size of datastorage
   */
  get BufferSize() {
    return this._bufferSize;
  }

  /**
   * @description Datapoints
   */
  get DataPoints() {
    return this._dataPoints;
  }

  /**
   * @description Filepath of datastorage database
   */
  get FilePath() {
    return this._filePath;
  }

  /**
   * @description Database object
   */
  get DB() {
    return this._db;
  }

  /**
   * @description Method for checking if init payload is ok - throws otherwise
   */
  _checkInitPayload(payload) {
    if (!exists(payload.filePath))
      throw new Error("There is no filePath in payload");
  }

  /**
   * @description method for initializing data storage
   * @param {*} payload
   */
  async init(payload) {
    this._checkInitPayload(payload);
    await this._initProperties(payload);
    await this._initDBFile(payload);
    await this._initDataPoints(payload);
  }

  /**
   * @description method for initializng properties
   * @param {*} payload
   */
  async _initProperties(payload) {
    if (exists(payload.bufferSize)) this._bufferSize = payload.bufferSize;
  }

  /**
   * @description method for initializng data points
   * @param {*} payload
   */
  async _initDataPoints(payload) {
    //If there is no datapointIds given in payload - return imediately
    if (!exists(payload.dataPointsId)) return;

    for (let datapointId of payload.dataPointsId) {
      try {
        await this.addDataPoint(datapointId);
      } catch (err) {
        console.log(err);
      }
    }
  }

  /**
   * @description method for initializng database file
   * @param {*} payload
   */
  async _initDBFile(payload) {
    this._filePath = payload.filePath;
    await this._createDatabaseIfNotExists(payload.filePath);
  }

  /**
   * @description method for converting rows from device to datapointIds and their values
   * @param {*} payload
   */
  _convertRowsToObject(rows) {
    let payloadToReturn = {};

    for (let row of rows) {
      let rowObject = {};
      let tickId = null;

      for (let column of Object.keys(row)) {
        let value = row[column];

        if (column === "date") tickId = value;
        else if (exists(value)) rowObject[DataStorage.getId(column)] = value;
      }
      payloadToReturn[tickId] = rowObject;
    }
    return payloadToReturn;
  }

  /**
   * @description method for converting insert payload to collection of columns and values
   * @param {*} payload
   */
  _convertInsertPayloadToColumnAndValues(payload) {
    let columnsAndValues = [];
    let allDataPointsIds = Object.keys(payload);

    for (let dataPointId of allDataPointsIds) {
      let columnName = this.DataPoints[dataPointId];
      if (!exists(columnName)) continue;

      columnsAndValues.push({
        columnName: columnName,
        value: payload[dataPointId]
      });
    }

    return columnsAndValues;
  }

  /**
   * @description Method for creating query string to insert all elements to database
   * @param {Array} columns Payload storing columns
   */
  _prepareInsertQueryString(columns) {
    let firstPart = "INSERT INTO data(date";

    let secondPart = ") VALUES (?";

    for (let column of columns) {
      firstPart += `,${column}`;
      secondPart += ",?";
    }

    secondPart += ");";

    return firstPart + secondPart;
  }

  /**
   * @description Method for removing values from database
   * @param {Array} tickIds tickIds to remove
   */
  _prepareRemoveQueryString(tickIds) {
    let queryString = `DELETE FROM data WHERE date = ${tickIds[0]}`;

    for (let i = 1; i < tickIds.length; i++) {
      queryString += ` OR date = ${tickIds[i]}`;
    }

    return queryString;
  }

  /**
   * @description method for removing all data which number exceeds buffer size
   */
  async _removeOldData() {
    let allTickIds = Object.keys(await this.getData())
      .map(key => parseInt(key))
      .sort((a, b) => a - b);

    //Removing old values
    for (let i = 0; i < allTickIds.length - this.BufferSize; i++) {
      await this.removeValue(allTickIds[i]);
    }
  }

  /**
   * @description Method for inserting data to storage
   * @param {number} tickId Tick id of operation
   * @param {object} payload payload, with ids and values
   */
  async insertValues(tickId, payload) {
    return new Promise((resolve, reject) => {
      if (payload === undefined || payload === null || isObjectEmpty(payload))
        return resolve(false);

      try {
        let columnsAndValues = this._convertInsertPayloadToColumnAndValues(
          payload
        );

        let columns = [];
        let values = [];

        for (let columnAndValue of columnsAndValues) {
          columns.push(columnAndValue.columnName);
          values.push(columnAndValue.value);
        }

        let insertQuery = this._prepareInsertQueryString(columns);

        let valuesToBeInserted = [tickId, ...values];

        this.DB.run(insertQuery, valuesToBeInserted, async err => {
          if (err) {
            return reject(err);
          }

          //Removing old data - to not exceed bufer size
          await this._removeOldData();
          return resolve(true);
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Method for removing data from db
   * @param {number} tickId Tick id of operation
   */
  async removeValue(tickId) {
    return this.removeValues([tickId]);
  }

  /**
   * @description Method for removing data from db
   * @param {Array} tickIds Tick id of operation
   */
  async removeValues(tickIds) {
    if (isObjectEmpty(tickIds) || !exists(tickIds)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      try {
        let queryString = this._prepareRemoveQueryString(tickIds);
        this.DB.run(queryString, err => {
          if (err) {
            return reject(err);
          }

          return resolve(true);
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Method for removing all data from storage
   */
  async clear() {
    return new Promise((resolve, reject) => {
      try {
        let queryString = "DELETE  FROM data";
        this.DB.run(queryString, err => {
          if (err) {
            return reject(err);
          }

          return resolve(true);
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Method for getting values from data storage
   */
  async getData() {
    return new Promise((resolve, reject) => {
      try {
        this.DB.all(`SELECT * FROM data`, (err, rows) => {
          if (err) {
            return reject(err);
          }
          if (rows) {
            return resolve(this._convertRowsToObject(rows));
          } else {
            return resolve({});
          }
        });
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Method for getting values from data storage
   * @param {number} x max number of rows to gather
   */
  async getXData(x) {
    if (x <= 0) return {};

    return new Promise((resolve, reject) => {
      try {
        this.DB.all(
          `SELECT * FROM data ORDER BY date DESC LIMIT ${x}`,
          (err, rows) => {
            if (err) {
              return reject(err);
            }
            if (rows) {
              return resolve(this._convertRowsToObject(rows));
            } else {
              return resolve({});
            }
          }
        );
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Method for generating payload
   */
  _generatePayload() {
    return {
      filePath: this.FilePath,
      dataPointsId: Object.keys(this.DataPoints),
      bufferSize: this.BufferSize
    };
  }

  /**
   * @description Payload of data storage
   */
  get Payload() {
    return this._generatePayload();
  }
}

module.exports = DataStorage;
