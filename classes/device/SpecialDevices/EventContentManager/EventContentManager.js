const {
  exists,
  isObjectEmpty,
  existsAndIsNotEmpty,
  writeFileAsync,
  readFileAsync,
  checkIfFileExistsAsync,
  snooze
} = require("../../../../utilities/utilities");

class EventContentManager {
  constructor() {
    this._filePath = null;
    this._bufferContent = {};
    this._busy = false;
    this._initialized = false;
    this._bufferSize = 10;
    this._lastEventId = 0;
  }

  /**
   * @description Method for creating empty storage file
   */
  async _saveContentToFile() {
    this._checkIfInitialized();
    this._checkIfBusy();
    this._busy = true;

    try {
      await writeFileAsync(this.FilePath, JSON.stringify(this.Content));
      this._busy = false;
    } catch (err) {
      this._busy = false;
      throw err;
    }
  }

  /**
   * @description Method for creating empty storage file
   */
  async _loadContentFromFile() {
    this._checkIfBusy();
    this._busy = true;

    try {
      let fileExists = await checkIfFileExistsAsync(this.FilePath);

      if (!fileExists) {
        this._bufferContent = {};
        this._busy = false;
      } else {
        let content = await readFileAsync(this.FilePath, this.Content);
        if (!existsAndIsNotEmpty(content)) {
          this._bufferContent = {};
          this._busy = false;
        } else {
          this._bufferContent = JSON.parse(content);

          let allEventIds = Object.keys(this.Content).map(key => parseInt(key));

          this._lastEventId = Math.max(...allEventIds);
          await this._checkAndRemoveEventsFromBuffer();
          this._busy = false;
        }
      }
    } catch (err) {
      this._busy = false;
      throw err;
    }
  }

  /**
   * @description Method for initializing event buffer
   * @param {string} filePath Database file path for event buffer
   */
  async init(filePath, bufferSize) {
    this._initialized = false;
    this._bufferSize = bufferSize;
    this._filePath = filePath;
    await this._loadContentFromFile();

    this._initialized = true;
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

  _generateNewEventId() {
    return ++this._lastEventId;
  }

  async changeBufferSize(newSize) {
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

      await this._saveContentToFile();
    }
  }

  _checkIfInitialized() {
    if (!this.Initialized) throw new Error("EventBuffer is not initialized!");
  }

  _checkIfBusy() {
    if (this.Busy) throw new Error("EventBuffer is busy!");
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

    this.Content[eventId] = eventPayload;

    await this._checkAndRemoveEventsFromBuffer();

    return eventPayload;
  }

  async refreshEvents(newContent) {
    this._checkIfInitialized();
    this._checkIfBusy();
    if (!existsAndIsNotEmpty(newContent)) return;

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
          parseInt(contentValue.tickId) === parseInt(newContentValue.tickId) &&
          parseInt(contentValue.value) === parseInt(newContentValue.value)
      );

      if (!contentValueAlreadyExists) contentValuesToAdd.push(newContentValue);
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

    //Saving only when buffer changed - there is something to return
    if (contentsToReturn.length > 0) await this._saveContentToFile();

    return contentsToReturn;
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
}

module.exports = EventContentManager;
