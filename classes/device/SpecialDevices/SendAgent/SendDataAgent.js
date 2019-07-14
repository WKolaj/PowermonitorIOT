const ValueStorage = require("../../../dataStorage/VariablesStorage");
const { exists, isObjectEmpty } = require("../../../../utilities/utilities");
const logger = require("../../../../logger/logger");

class SendDataAgent {
  constructor() {
    this._valueStorage = new ValueStorage();
    this._sendingBusy = false;
    this._readyToSend = false;
    this._sendDataLimit = 5;
  }

  async setSendDatalLimit(newLimit) {
    this._sendDataLimit = newLimit;
  }

  async setBuferSize(newLimit) {
    this.ValueStorage.setBuferSize(newLimit);
  }

  async _sendData(data) {
    throw new Error("should be override in child classes");
  }

  async startCommunication() {
    throw new Error("should be override in child classes");
  }

  async stopCommunication() {
    throw new Error("should be override in child classes");
  }

  get SendDataLimit() {
    return this._sendDataLimit;
  }

  get SendingBusy() {
    return this._sendingBusy;
  }

  get ReadyToSend() {
    return this._readyToSend;
  }

  async addVariable(sampleTimeGroup, variableId) {
    await this.ValueStorage.addVariable(sampleTimeGroup, variableId);
  }

  async removeVariable(sampleTimeGroup, variableId) {
    await this.ValueStorage.removeVariable(sampleTimeGroup, variableId);
  }

  _checkPayload(payload) {
    if (!exists(payload.dirPath))
      throw new Error("payload has to have dirPath defined!");
  }

  async refresh(tickId, data) {
    try {
      await this._saveDataToBuffer(tickId, data);
    } catch (err) {
      logger.error(err.message, err);
    }
    try {
      await this._sendBufferedData();
    } catch (err) {
      logger.warn(err.message, err);
    }
  }

  async _saveDataToBuffer(tickId, data) {
    if (!exists(data) || isObjectEmpty(data)) return;

    return this.ValueStorage.insertValues(tickId, data);
  }

  async _sendBufferedData() {
    if (!this.ReadyToSend)
      throw new Error("Agent cannot send data - is not ready");

    if (this.SendingBusy) throw new Error("Agent cannot send data - is busy");
    this._sendingBusy = true;

    try {
      let data = await this._getBufferedData();

      //Sending data only if it is not empty and exists
      if (exists(data) && !isObjectEmpty(data)) {
        let sampleGroupIds = Object.keys(data);

        for (let sampleGroupId of sampleGroupIds) {
          //Sending data of given group and than remove it
          let sampleGroupPayload = data[sampleGroupId];
          //Sending data only if it is not empty
          if (
            exists(sampleGroupPayload) &&
            !isObjectEmpty(sampleGroupPayload)
          ) {
            await this._sendData(sampleGroupPayload);

            let tickIds = Object.keys(sampleGroupPayload);

            let removePayload = {
              [sampleGroupId]: tickIds
            };
            await this._removeBufferedData(removePayload);
          }
        }
      }

      this._sendingBusy = false;
    } catch (err) {
      this._sendingBusy = false;
      throw err;
    }
  }

  async _getBufferedData() {
    return this.ValueStorage.getAllXData(this.SendDataLimit);
  }

  async _removeBufferedData(payload) {
    return this.ValueStorage.removeValues(payload);
  }

  async _initProperties(payload) {
    if (exists(payload.sendDataLimit))
      this._sendDataLimit = payload.sendDataLimit;
    if (exists(payload.readyToSend)) this._readyToSend = payload.readyToSend;
  }

  async _initVariableStorage(payload) {
    if (!exists(payload.bufferSize)) payload.bufferSize = 100;
    await this.ValueStorage.init(payload);
  }

  async init(payload) {
    this._checkPayload(payload);
    await this._initProperties(payload);
    await this._initVariableStorage(payload);
  }

  get BufferSize() {
    return this.ValueStorage.BufferSize;
  }

  get ValueStorage() {
    return this._valueStorage;
  }

  get DirectoryPath() {
    return this.ValueStorage.DirectoryPath;
  }

  _generatePayload() {
    return {
      ...this.ValueStorage.Payload,
      sendDataLimit: this.SendDataLimit,
      readyToSend: this.ReadyToSend
    };
  }

  get Payload() {
    return this._generatePayload();
  }
}

module.exports = SendDataAgent;
