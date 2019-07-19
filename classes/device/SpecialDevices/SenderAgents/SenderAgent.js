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

class SenderAgent {
  constructor() {
    this._buffer = [];
    this._isWritingFile = false;
    this._sendingEnabled = false;
    this._sendFileLimit = 5;
    this._sendingInterval = 60;
    this._dirPath = null;
  }

  static _getValueDirName() {
    return "values";
  }

  static _getEventsDirName() {
    return "events";
  }

  get Buffer() {
    return this._buffer;
  }

  get IsWritingFile() {
    return this._isWritingFile;
  }

  get SendingEnabled() {
    return this._sendingEnabled;
  }

  get SendFileLimit() {
    return this._sendFileLimit;
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

  async _sendData(data) {
    throw new Error("should be override in child classes");
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
    return `${Date.now()}.json`;
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

  async _getDataFromVariables(bufferContent) {
    throw new Error("should be override in child classes");
  }

  async _sendCurrentData(dataToSend) {
    this._clearBuffer();

    if (exists(dataToSend)) {
      await this._sendData(dataToSend);
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
      logger.warn(err);
    }
  }

  async refresh(tickId) {
    //Do nothing if tick id does not match sending interval
    if (!Sampler.doesTickIdMatchesTick(tickId, this.SendingInterval)) return;

    let dataToSend = await this._getDataFromVariables(this.Buffer);

    try {
      //Sending data only if sending is enabled
      if (!this.SendingEnabled) return;

      await this._sendCurrentData(dataToSend);
      await this._sendBufferedData();
    } catch (err) {
      //There was an error while sending data - save it to new file
      await this._saveDataToFile(dataToSend);
      logger.warn(err, err.message);
    }
  }

  async _getAllBufferFilesPath() {
    let allFiles = await readDirAsync(this.ValuesDirectoryPath);
    if (isObjectEmpty(allFiles)) return [];

    return allFiles.map(file => path.join(this.ValuesDirectoryPath, file));
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
    if (exists(payload.sendingInterval))
      this._sendingInterval = payload.sendingInterval;
    if (exists(payload.sendingEnabled) && payload.sendingEnabled)
      await this.enableSendingData();
  }

  /**
   * @description Method for initializing senderAgent
   * @param {Object} payload Payload for initializng sending agent
   */
  async init(payload) {
    this._checkPayload(payload);
    await this._initProperties(payload);
  }

  _generatePayload() {
    return {
      dirPath: this._dirPath,
      sendingEnabled: this._sendingEnabled,
      sendFileLimit: this._sendFileLimit,
      sendingInterval: this._sendingInterval
    };
  }

  /**
   * @description Method for editing Device
   */
  async editWithPayload(payload) {
    if (exists(payload.sendFileLimit))
      this._sendFileLimit = payload.sendFileLimit;
    if (exists(payload.sendingInterval))
      this._sendingInterval = payload.sendingInterval;
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
