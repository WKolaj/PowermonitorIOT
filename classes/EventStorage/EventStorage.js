const sqlite3 = require("sqlite3");
const {
  exists,
  isObjectEmpty,
  existsAndIsNotEmpty,
  snooze
} = require("../../utilities/utilities");

class EventStorage {
  constructor() {
    this._filePath = null;
    this._db = null;
    this._bufferContent = {};
    this._lastEventId = 0;
    this._busy = false;
    this._initialized = false;
    this._bufferSize = 10;
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
  async init(filePath, bufferSize) {
    this._initialized = false;
    this._busy = true;
    this._bufferSize = bufferSize;
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

  get BufferSize() {
    return this._bufferSize;
  }

  get DB() {
    return this._db;
  }

  changeBufferSize(newSize) {
    if (newSize >= this.BufferSize) {
      this._bufferSize = newSize;
    } else {
      //newBufferSize is smaller than before - removing values from content

      let allEventIds = Object.keys(this.Content).sort(
        (a, b) => parseInt(a) - parseInt(b)
      );

      let numberOfEventsToDelete = allEventIds.length - newSize;

      for (let i = 0; i < numberOfEventsToDelete; i++) {
        delete this.Content[allEventIds[i]];
      }

      this._bufferSize = newSize;
    }
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

  async _checkAndRemoveEventsFromBuffer() {
    if (!existsAndIsNotEmpty(this.Content)) return;

    let allEventIds = Object.keys(this.Content).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    let numberOfElementsToRemove = allEventIds.length - this.BufferSize;

    if (numberOfElementsToRemove > 0) {
      for (let i = 0; i < numberOfElementsToRemove; i++) {
        delete this.Content[allEventIds[i]];
      }
    }
  }

  /**
   * @description Method for adding event to buffer
   * @param {number} tickId tickId of event
   * @param {number} value value of event
   */
  async _addEvent(tickId, value) {
    //value of event must be larger than 0 !!
    if (value <= 0) return;

    let eventId = this._generateNewEventId();
    let eventPayload = {
      eventId,
      tickId,
      value
    };

    let valueInserted = await this._insertValueIntoDB(eventId, tickId, value);

    if (valueInserted) this.Content[eventId] = eventPayload;

    await this._checkAndRemoveEventsFromBuffer();

    return eventPayload;
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
        this.DB.all(
          `SELECT * FROM data ORDER BY eventId DESC LIMIT ${this.BufferSize}`,
          (err, rows) => {
            if (err) {
              return reject(err);
            }
            if (rows) {
              return resolve(this._convertRowsToEvents(rows));
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

  async refreshEvents(newContent) {
    this._checkIfInitialized();
    this._checkIfBusy();
    if (!existsAndIsNotEmpty(newContent)) return;

    this._busy = true;

    try {
      let contentValues = Object.values(this.Content);
      let newContentValues = Object.values(newContent);
      if (newContentValues.length !== this.BufferSize)
        throw new Error(
          "Length of new content cannot be different than bufferSize"
        );

      let contentValuesToAdd = [];

      for (let newContentValue of newContentValues) {
        let contentValueAlreadyExists = contentValues.some(
          contentValue =>
            parseInt(contentValue.tickId) ===
              parseInt(newContentValue.tickId) &&
            parseInt(contentValue.value) === parseInt(newContentValue.value)
        );

        if (!contentValueAlreadyExists)
          contentValuesToAdd.push(newContentValue);
      }

      let contentsToReturn = [];

      //New values should be inserted in opposite order - first one is last one

      for (let i = contentValuesToAdd.length - 1; i >= 0; i--) {
        let contentValue = contentValuesToAdd[i];
        let newContentValue = await this._addEvent(
          contentValue.tickId,
          contentValue.value
        );
        if (existsAndIsNotEmpty(newContentValue))
          contentsToReturn.push(newContentValue);
      }

      this._busy = false;

      return contentsToReturn;
    } catch (err) {
      this._busy = false;
      throw err;
    }
  }

  getLastEvent() {
    if (!existsAndIsNotEmpty(this.Content)) return null;

    let allEventIds = Object.keys(this.Content).sort(
      (a, b) => parseInt(b) - parseInt(a)
    );

    return this.Content[allEventIds[0]].value;
  }

  getLastEventTick() {
    if (!existsAndIsNotEmpty(this.Content)) return null;

    let allEventIds = Object.keys(this.Content).sort(
      (a, b) => parseInt(b) - parseInt(a)
    );

    return this.Content[allEventIds[0]].tickId;
  }

  /**
   * @description Method for getting events from database
   * @param {*} tickId tickId of event to check
   */
  async getEvent(tickId) {
    return new Promise((resolve, reject) => {
      try {
        this._checkIfInitialized();

        this.DB.get(
          `SELECT eventId, value, tickId  FROM data WHERE tickId <= ${tickId} ORDER BY tickId DESC LIMIT 1`,
          (err, row) => {
            if (err) {
              return reject(err);
            }

            if (row) {
              return resolve({ [row.tickId]: row.value });
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
   * @description Method for getting several events from database
   * @param {number} fromTickId Begin tickId
   * @param {number} toTickId End tickId
   */
  async getEvents(fromTickId, toTickId) {
    return new Promise((resolve, reject) => {
      try {
        this._checkIfInitialized();
        this.DB.all(
          `SELECT eventId, value, tickId  FROM data WHERE tickId <= ${toTickId} AND tickId >= ${fromTickId} ORDER BY tickId DESC`,
          (err, rows) => {
            if (err) {
              return reject(err);
            }
            if (rows) {
              return resolve(
                rows
                  .filter(row => row.value !== null)
                  .map(row => {
                    return { [row.tickId]: row.value };
                  })
              );
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
}

module.exports = EventStorage;
