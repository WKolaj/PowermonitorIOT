const {
  exists,
  isObjectEmpty,
  writeFileAsync,
  readDirAsync,
  readFileAsync,
  unlinkAnsync,
  existsAndIsNotEmpty,
  createDirAsync,
  checkIfDirectoryExistsAsync
} = require("../../../../utilities/utilities");
const path = require("path");
const logger = require("../../../../logger/logger");
const Sampler = require("../../../sampler/Sampler");
const mongoose = require("mongoose");
const EventContentManager = require("../EventContentManager/EventContentManager");

class SenderAgent {
  constructor() {
    this._buffer = [];
    this._isWritingFile = false;
    this._sendingEnabled = false;
    this._sendFileLimit = 5;
    this._sendEventLimit = 5;
    this._sendingInterval = 60;
    this._dirPath = null;
    this._events = {};
    this._eventContentManager = new EventContentManager();
    this._isWritingEvent = false;
  }

  static _getValueDirName() {
    return "values";
  }

  static _getEventsDirName() {
    return "events";
  }

  static _getEventsManagerFileName() {
    return "eventContentManager.json";
  }

  /**
   * @description Collection of possible events - descriptions, values, severity etc..
   */
  get Events() {
    return this._events;
  }

  get EventContentManager() {
    return this._eventContentManager;
  }

  get Buffer() {
    return this._buffer;
  }

  get IsWritingFile() {
    return this._isWritingFile;
  }

  get IsWritingEvent() {
    return this._isWritingEvent;
  }

  get SendingEnabled() {
    return this._sendingEnabled;
  }

  get SendFileLimit() {
    return this._sendFileLimit;
  }

  get EventBufferSize() {
    return this.EventContentManager.BufferSize;
  }

  get SendEventLimit() {
    return this._sendEventLimit;
  }

  get SendingInterval() {
    return this._sendingInterval;
  }

  get DirectoryPath() {
    return this._dirPath;
  }

  get ValuesDirectoryPath() {
    return exists(this.DirectoryPath)
      ? path.join(this.DirectoryPath, SenderAgent._getValueDirName())
      : null;
  }

  get EventsDirectoryPath() {
    return exists(this.DirectoryPath)
      ? path.join(this.DirectoryPath, SenderAgent._getEventsDirName())
      : null;
  }

  get EventManagerFilePath() {
    return exists(this.DirectoryPath)
      ? path.join(this.DirectoryPath, SenderAgent._getEventsManagerFileName())
      : null;
  }

  async _sendData(data) {
    throw new Error("should be override in child classes");
  }

  async _sendEvent(eventTickId, eventPayload) {
    throw new Error("should be override in child classes");
  }

  async _getEventDetails(eventValue) {
    return this.Events[eventValue];
  }

  async _sendEventBasedOnValue(eventTickId, eventValue) {
    let eventPayload = await this._getEventDetails(eventValue);

    if (!existsAndIsNotEmpty(eventPayload))
      return logger.warn(
        `Event of value ${eventValue} and tick ${eventTickId} has not been send - unrecognized value`
      );

    try {
      await this._sendEvent(eventTickId, eventPayload);
    } catch (err) {
      await this._saveEventToFile(eventTickId, eventPayload);
      logger.warn(err, err.message);
    }
  }

  async enableSendingData() {
    await this.onSendingDataEnabled();
    this._sendingEnabled = true;
  }

  async onSendingDataEnabled() {
    throw new Error("Method not implemented");
  }

  async disableSendingData() {
    await this.onSendingDataDisabled();
    this._sendingEnabled = false;
  }

  async onSendingDataDisabled() {
    throw new Error("Method not implemented");
  }

  /**
   * @description Method for clearing buffer
   */
  _clearBuffer() {
    this._buffer = [];
  }

  /**
   * @description Method for checking buffer payload - throws if payload is not correct
   * @param {Object} payload Payload to check
   */
  _checkBufferPayload(payload) {
    if (!exists(payload.tickId))
      throw new Error("There is no tickId given in buffer payload");

    if (!exists(payload.values))
      throw new Error("There is no values given in buffer payload");

    if (isObjectEmpty(payload.values))
      throw new Error("Values object is empty in buffer payload");

    for (let valuePayload of payload.values) {
      if (!existsAndIsNotEmpty(valuePayload))
        throw new Error(
          "Value payload in buffer cannot be empty and has to exist"
        );

      if (!exists(valuePayload.id))
        throw new Error("Value payload in buffer has to have id given");

      if (!exists(valuePayload.value))
        throw new Error("Value payload in buffer has to have value given");
    }
  }

  /**
   * @description Method for adding payload with variables and its values to send to buffer
   * @param {Object} payload Payload containg variables and its values
   */
  addToBuffer(payload) {
    this._checkBufferPayload(payload);
    this.Buffer.push(payload);
  }

  _generateBufferFileName() {
    return `${mongoose.Types.ObjectId().toHexString()}.json`;
  }

  _generateEventFileName() {
    return `${mongoose.Types.ObjectId().toHexString()}.json`;
  }

  async _saveDataToFile(data) {
    try {
      this._isWritingFile = true;
      let fileName = this._generateBufferFileName();
      if (!exists(this.ValuesDirectoryPath))
        throw new Error("Dir path is empty");

      let filePath = path.join(this.ValuesDirectoryPath, fileName);
      await writeFileAsync(filePath, JSON.stringify(data));

      this._isWritingFile = false;
    } catch (err) {
      this._isWritingFile = false;
      logger.error(err.message, err);
    }
  }

  async _saveEventToFile(tickId, data) {
    try {
      this._isWritingEvent = true;
      let fileName = this._generateEventFileName();
      if (!exists(this.EventsDirectoryPath))
        throw new Error("Event path is empty");

      let filePath = path.join(this.EventsDirectoryPath, fileName);
      await writeFileAsync(filePath, JSON.stringify({ [tickId]: data }));

      this._isWritingEvent = false;
    } catch (err) {
      this._isWritingEvent = false;
      logger.error(err.message, err);
    }
  }

  async _getDataFromVariables(bufferContent) {
    throw new Error("should be override in child classes");
  }

  async _sendCurrentData(dataToSend) {
    this._clearBuffer();

    if (exists(dataToSend)) {
      await this._sendData(dataToSend);
    }
  }

  async _checkAndSendCurrentEvents(bufferContent) {
    //Getting new events based on buffer content
    let newEvents = await this.EventContentManager.refreshEvents(bufferContent);
    if (existsAndIsNotEmpty(newEvents)) {
      for (let event of newEvents) {
        await this._sendEventBasedOnValue(event.tickId, event.value);
      }
    }
  }

  async _sendBufferedData() {
    //Do no send data if new file is being written
    if (this.IsWritingFile) {
      logger.info("Cannot send file - sender busy wrtting");
      return;
    }

    try {
      let filesPath = await this._getAllBufferFilesPath();

      let sendFileCount = 0;

      for (let filePath of filesPath) {
        //Ending sending if send file count is already achieved
        if (sendFileCount >= this.SendFileLimit) return;

        let fileContent = await readFileAsync(filePath);

        //Sending file if content exists
        if (exists(fileContent)) {
          let jsonContent = JSON.parse(fileContent);
          await this._sendData(jsonContent);
        }

        //Removing file after sent
        await unlinkAnsync(filePath);

        sendFileCount++;
      }
    } catch (err) {
      logger.warn(err, err.message);
    }
  }

  async _sendBufferedEvents() {
    //Do no send data if new file is being written
    if (this.IsWritingEvent) {
      logger.info("Cannot send event - sender busy wrtting");
      return;
    }

    try {
      let filesPath = await this._getAllBufferEventFilesPath();

      let sendEventCount = 0;

      for (let filePath of filesPath) {
        //Ending sending if send file count is already achieved
        if (sendEventCount >= this.SendEventLimit) return;

        let fileContent = await readFileAsync(filePath);

        //Sending file if content exists
        if (exists(fileContent)) {
          let jsonContent = JSON.parse(fileContent);

          if (existsAndIsNotEmpty(jsonContent)) {
            let tickId = Object.keys(jsonContent)[0];
            if (exists(tickId))
              await this._sendEvent(tickId, jsonContent[tickId]);
          }
        }

        //Removing file after sent
        await unlinkAnsync(filePath);

        sendEventCount++;
      }
    } catch (err) {
      logger.warn(err, err.message);
    }
  }

  async refresh(tickId) {
    //Do nothing if tick id does not match sending interval
    if (!Sampler.doesTickIdMatchesTick(tickId, this.SendingInterval)) return;

    let dataToSend = await this._getDataFromVariables(this.Buffer);

    //Sending data only if sending is enabled
    if (!this.SendingEnabled) return;

    try {
      await this._sendCurrentData(dataToSend);
      await this._sendBufferedData();
    } catch (err) {
      //There was an error while sending data - save it to new file
      await this._saveDataToFile(dataToSend);
      logger.warn(err, err.message);
    }

    //Every minute send buffered events that has not been send
    try {
      await this._sendBufferedEvents();
    } catch (err) {
      logger.warn(err, err.message);
    }
  }

  async refreshEvents(bufferContent) {
    if (!existsAndIsNotEmpty(bufferContent)) return;

    //Sending data only if sending is enabled
    if (!this.SendingEnabled) return;

    try {
      //Sending only current events - buffered are being send every refresh
      await this._checkAndSendCurrentEvents(bufferContent);
    } catch (err) {
      logger.warn(err, err.message);
    }
  }

  async _getAllBufferFilesPath() {
    let allFiles = await readDirAsync(this.ValuesDirectoryPath);
    if (isObjectEmpty(allFiles)) return [];

    return allFiles.map(file => path.join(this.ValuesDirectoryPath, file));
  }

  async _getAllBufferEventFilesPath() {
    let allFiles = await readDirAsync(this.EventsDirectoryPath);
    if (isObjectEmpty(allFiles)) return [];

    return allFiles.map(file => path.join(this.EventsDirectoryPath, file));
  }

  _checkPayload(payload) {
    if (!exists(payload.dirPath))
      throw new Error("payload has to have dirPath defined!");
  }

  async createValueDirIfNotExists() {
    let dirExists = await checkIfDirectoryExistsAsync(this.ValuesDirectoryPath);
    if (!dirExists) await createDirAsync(this.ValuesDirectoryPath);
  }

  async createEventDirIfNotExists() {
    let dirExists = await checkIfDirectoryExistsAsync(this.EventsDirectoryPath);
    if (!dirExists) await createDirAsync(this.EventsDirectoryPath);
  }

  async _initProperties(payload) {
    if (exists(payload.dirPath)) this._dirPath = payload.dirPath;
    await this.createValueDirIfNotExists();
    await this.createEventDirIfNotExists();

    if (exists(payload.sendFileLimit))
      this._sendFileLimit = payload.sendFileLimit;
    if (exists(payload.sendEventLimit))
      this._sendEventLimit = payload.sendEventLimit;
    if (exists(payload.sendingInterval))
      this._sendingInterval = payload.sendingInterval;

    if (exists(payload.eventDescriptions))
      this._events = payload.eventDescriptions;
    if (exists(payload.sendingEnabled) && payload.sendingEnabled)
      await this.enableSendingData();
  }

  async _initEventContentManager(payload) {
    if (!exists(this.EventManagerFilePath))
      throw new Error("Event manager file path does not exists!");

    let bufferSize = exists(payload.eventBufferSize)
      ? payload.eventBufferSize
      : 10;

    await this.EventContentManager.init(this.EventManagerFilePath, bufferSize);
  }

  /**
   * @description Method for initializing senderAgent
   * @param {Object} payload Payload for initializng sending agent
   */
  async init(payload) {
    this._checkPayload(payload);
    await this._initProperties(payload);
    await this._initEventContentManager(payload);
  }

  _generatePayload() {
    return {
      dirPath: this._dirPath,
      sendingEnabled: this._sendingEnabled,
      sendFileLimit: this._sendFileLimit,
      sendEventLimit: this._sendEventLimit,
      sendingInterval: this._sendingInterval,
      eventDescriptions: this._events,
      eventBufferSize: this.EventBufferSize
    };
  }

  async changeBufferSize(newBufferSize) {
    await this.EventContentManager.changeBufferSize(newBufferSize);
  }

  /**
   * @description Method for editing Device
   */
  async editWithPayload(payload) {
    if (exists(payload.sendFileLimit))
      this._sendFileLimit = payload.sendFileLimit;
    if (exists(payload.sendingInterval))
      this._sendingInterval = payload.sendingInterval;
    if (exists(payload.eventDescriptions))
      this._events = payload.eventDescriptions;
    if (exists(payload.sendEventLimit))
      this._sendEventLimit = payload.sendEventLimit;
    if (exists(payload.eventBufferSize))
      await this.changeBufferSize(payload.eventBufferSize);
    if (exists(payload.sendingEnabled)) {
      if (payload.sendingEnabled && !this.SendingEnabled)
        await this.enableSendingData();
      else if (!payload.sendingEnabled && this.SendingEnabled)
        await this.disableSendingData();
    }

    return this;
  }

  get Payload() {
    return this._generatePayload();
  }
}

module.exports = SenderAgent;
