const SenderAgent = require("./SenderAgent");
const {
  exists,
  isObjectEmpty,
  writeFileAsync,
  readDirAsync,
  readFileAsync,
  unlinkAnsync,
  existsAndIsNotEmpty
} = require("../../../../utilities/utilities");
const Sampler = require("../../../sampler/Sampler");
const { MindConnectAgent, retry } = require("@mindconnect/mindconnect-nodejs");
const path = require("path");
const logger = require("../../../../logger/logger");

class MindConnectSenderAgent extends SenderAgent {
  constructor() {
    super();
    this._boardingKey = null;
    this._variableNames = {};
    this._agent = null;
    this._numberOfSendingRetries = 5;
  }

  get VariableNames() {
    return this._variableNames;
  }

  get MindConnectAgent() {
    return this._agent;
  }

  get BoardingKey() {
    return this._boardingKey;
  }

  get NumberOfSendingRetries() {
    return this._numberOfSendingRetries;
  }

  get IsReadyToSend() {
    return (
      exists(this.BoardingKey) &&
      exists(this.MindConnectAgent) &&
      this.MindConnectAgent.IsOnBoarded() &&
      this.MindConnectAgent.HasDataSourceConfiguration()
    );
  }

  async _sendData(data) {
    if (existsAndIsNotEmpty(data))
      await retry(this.NumberOfSendingRetries, () =>
        this.MindConnectAgent.BulkPostData(data)
      );
  }

  async refresh(tickId) {
    //Overriding refresh in order to cancel refreshing if mindconnect agent is not ready to send data
    if (!this.IsReadyToSend) return;

    return super.refresh(tickId);
  }

  async onSendingDataEnabled() {
    if (!exists(this.BoardingKey))
      throw new Error(
        "Cannot enable sending data if boarding key is not defined"
      );

    if (!this.MindConnectAgent.IsOnBoarded())
      await this.MindConnectAgent.OnBoard();
    if (!this.MindConnectAgent.HasDataSourceConfiguration())
      await this.MindConnectAgent.GetDataSourceConfiguration();
  }

  async onSendingDataDisabled() {
    //No special actions are needed
  }

  async _getDataFromVariables(bufferContent) {
    let dataToReturn = [];

    for (let tickContent of bufferContent) {
      if (existsAndIsNotEmpty(tickContent)) {
        let valuesPayload = [];

        for (let valueObject of tickContent.values) {
          let variableName = this.VariableNames[valueObject.id];
          if (exists(variableName))
            valuesPayload.push({
              dataPointId: variableName,
              qualityCode: "0",
              value: valueObject.value.toString()
            });
        }

        let valueObject = {
          timestamp: Sampler.convertTickNumberToDate(
            tickContent.tickId
          ).toISOString(),
          values: valuesPayload
        };
        //Adding values only if they are not empty
        if (!isObjectEmpty(valuesPayload)) dataToReturn.push(valueObject);
      }
    }

    return dataToReturn;
  }

  _checkPayload(payload) {
    super._checkPayload(payload);

    if (exists(payload.boardingKey))
      this._validateBoardingKey(payload.boardingKey);
  }

  async _initProperties(payload) {
    //Has to be invoked before initializing properties - eg. sendingDataEnabled
    if (exists(payload.boardingKey))
      await this._setBoardingKey(payload.boardingKey);
    if (exists(payload.numberOfSendingRetries))
      this._numberOfSendingRetries = payload.numberOfSendingRetries;
    if (exists(payload.variableNames))
      this._variableNames = payload.variableNames;
    await super._initProperties(payload);
  }

  _validateBoardingKey(boardingKey) {
    if (!existsAndIsNotEmpty(boardingKey.content)) {
      throw new Error("content cannot be empty");
    }

    if (!existsAndIsNotEmpty(boardingKey.content.baseUrl))
      throw new Error("content.baseUrl cannot be empty");

    if (!existsAndIsNotEmpty(boardingKey.content.iat))
      throw new Error("content.iat cannot be empty");

    if (!existsAndIsNotEmpty(boardingKey.content.clientCredentialProfile))
      throw new Error("content.clientCredentialProfile cannot be empty");

    if (boardingKey.content.clientCredentialProfile[0] !== "SHARED_SECRET")
      throw new Error("Agent supports only SHARED_SECRET credential!!");

    if (!existsAndIsNotEmpty(boardingKey.content.clientId))
      throw new Error("content.clientId cannot be empty");

    if (!existsAndIsNotEmpty(boardingKey.content.tenant))
      throw new Error("content.tenant cannot be empty");

    if (!existsAndIsNotEmpty(boardingKey.expiration))
      throw new Error("expiration cannot be empty");
  }

  async _setBoardingKey(boardingKey) {
    if (!existsAndIsNotEmpty(boardingKey)) return;
    this._validateBoardingKey(boardingKey);
    this._boardingKey = boardingKey;
    this._agent = new MindConnectAgent(this._boardingKey);
    this._sendingEnabled = false;
  }

  _generatePayload() {
    let payload = super._generatePayload();

    if (exists(this.BoardingKey)) payload.boardingKey = this.BoardingKey;

    payload.numberOfSendingRetries = this.NumberOfSendingRetries;

    payload.variableNames = this.VariableNames;

    return payload;
  }

  /**
   * @description Method for editing Device
   */
  async editWithPayload(payload) {
    if (exists(payload.boardingKey) && payload.boardingKey !== this.BoardingKey)
      await this._setBoardingKey(payload.boardingKey);

    if (exists(payload.numberOfSendingRetries))
      this._numberOfSendingRetries = payload.numberOfSendingRetries;

    if (exists(payload.variableNames))
      this._variableNames = payload.variableNames;

    return super.editWithPayload(payload);
  }
}

module.exports = MindConnectSenderAgent;
