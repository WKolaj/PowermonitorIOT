const sqlite3 = require("sqlite3");
const { exists, isObjectEmpty, snooze } = require("../../utilities/utilities");

class EventBuffer {
  constructor() {
    this._filePath = null;
    this._db = null;
    this._bufferContent = {};
    this._lastEventId = 0;
    this._busy = false;
    this._initialized = false;
  }

  /**
   * @description Method for creating database for buffering data
   * @param {string} filePath Database file path
   */
  async _createDatabaseIfNotExists(filePath) {
    //Returning promise - in order to implement async/await instead of callback functions
    return new Promise((resolve, reject) => {
      try {
        this._db = new sqlite3.Database(filePath);

        this.DB.run(
          `CREATE TABLE IF NOT EXISTS data (eventId INTEGER, value INTEGER, tickId INTEGER, PRIMARY KEY(eventId) );`,
          function(err) {
            if (err) {
              return reject(err);
            }
            return resolve(true);
          }
        );
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Method for initializing event buffer
   * @param {string} filePath Database file path for event buffer
   */
  async init(filePath) {
    this._initialized = false;
    this._busy = true;

    try {
      await this._createDatabaseIfNotExists(filePath);
      this._filePath = filePath;

      this._bufferContent = await this._getEventFromDB();

      if (!isObjectEmpty(this.Content)) {
        let allEventIds = Object.keys(this.Content).map(key => parseInt(key));

        this._lastEventId = Math.max(...allEventIds);
      }

      this._initialized = true;

      this._busy = false;
    } catch (err) {
      this._busy = false;
      throw err;
    }
  }

  get LastEventId() {
    return this._lastEventId;
  }

  get Initialized() {
    return this._initialized;
  }

  get Busy() {
    return this._busy;
  }

  get FilePath() {
    return this._filePath;
  }

  get Content() {
    return this._bufferContent;
  }

  get DB() {
    return this._db;
  }

  _checkIfInitialized() {
    if (!this.Initialized) throw new Error("EventBuffer is not initialized!");
  }

  _checkIfBusy() {
    if (this.Busy) throw new Error("EventBuffer is busy!");
  }

  _generateNewEventId() {
    return ++this._lastEventId;
  }

  /**
   * @description Method for creating query string to insert all elements to database
   */
  _prepareInsertQueryString() {
    return "INSERT INTO data(eventId,tickId,value) VALUES (?,?,?);";
  }

  /**
   * @description Method for adding event to buffer
   * @param {number} tickId tickId of event
   * @param {number} value value of event
   */
  async addEvent(tickId, value) {
    //value of event must be larger than 0 !!
    if (value <= 0) return;

    this._checkIfInitialized();
    this._checkIfBusy();
    this._busy = true;

    try {
      let eventId = this._generateNewEventId();
      let eventPayload = {
        eventId,
        tickId,
        value
      };

      let valueInserted = await this._insertValueIntoDB(eventId, tickId, value);

      if (valueInserted) this.Content[eventId] = eventPayload;

      this._busy = false;
    } catch (err) {
      this._busy = false;
      throw err;
    }
  }

  /**
   * @description method for converting rows from db to events
   * @param {*} payload
   */
  _convertRowsToEvents(rows) {
    let payloadToReturn = {};

    for (let row of rows) {
      let value = null;
      let tickId = null;
      let eventId = null;

      for (let column of Object.keys(row)) {
        let columnValue = row[column];

        if (column === "eventId") eventId = columnValue;
        else if (column === "tickId") tickId = columnValue;
        else if (column === "value") value = columnValue;
      }

      if (exists(value) && value > 0)
        payloadToReturn[eventId] = {
          eventId,
          value,
          tickId
        };
    }
    return payloadToReturn;
  }

  async _insertValueIntoDB(eventId, tickId, value) {
    return new Promise((resolve, reject) => {
      if (!(exists(eventId) && exists(tickId) && exists(value)))
        return resolve(false);

      try {
        let insertQuery = this._prepareInsertQueryString();

        let valuesToBeInserted = [eventId, tickId, value];

        this.DB.run(insertQuery, valuesToBeInserted, async err => {
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

  async _getEventFromDB() {
    return new Promise((resolve, reject) => {
      try {
        this.DB.all(`SELECT * FROM data ORDER BY eventId DESC`, (err, rows) => {
          if (err) {
            return reject(err);
          }
          if (rows) {
            return resolve(this._convertRowsToEvents(rows));
          } else {
            return resolve({});
          }
        });
      } catch (err) {
        return reject(err);
      }
    });
  }
}

module.exports = EventBuffer;
