const SendDataAgent = require("./SendDataAgent");
const { MindConnectAgent } = require("@mindconnect/mindconnect-nodejs");
const {
  exists,
  isObjectEmpty,
  existsAndIsNotEmpty
} = require("../../../../utilities/utilities");
const Sampler = require("../../../sampler/Sampler");

class MSDataAgent extends SendDataAgent {
  constructor() {
    super();

    this._boardingKey = null;
    this._variableNames = {};
  }

  get VariableNames() {
    return this._variableNames;
  }

  get MindConnectAgent() {
    return this._agent;
  }

  async addVariable(sampleTimeGroup, variableId) {
    throw new Error("mindsphere dp name should be defined!");
  }

  async addVariable(sampleTimeGroup, variableId, msName) {
    await this.ValueStorage.addVariable(sampleTimeGroup, variableId);
    this.VariableNames[variableId] = msName;
  }

  async removeVariable(sampleTimeGroup, variableId) {
    await this.ValueStorage.removeVariable(sampleTimeGroup, variableId);
    delete this.VariableNames[variableId];
  }

  get BoardingKey() {
    return this._boardingKey;
  }

  _convertDataToMSData(data) {
    let dataToReturn = [];

    let allTickNumbers = Object.keys(data);

    for (let tickNumber of allTickNumbers) {
      let date = Sampler.convertTickNumberToDate(tickNumber);
      let MSPayloadObject = {};

      let variablesObject = data[tickNumber];
      if (existsAndIsNotEmpty(variablesObject)) {
        let variableIds = Object.keys(variablesObject);
        for (let variableId of variableIds) {
          let variableName = this.VariableNames[variableId];
          if (existsAndIsNotEmpty(variableName)) {
            let variableValue = variablesObject[variableId];

            //Assigning time stamp if not exist
            if (!exists(MSPayloadObject.timestamp))
              MSPayloadObject.timestamp = date.toISOString();

            //Creating values if not exist
            if (!exists(MSPayloadObject.values)) MSPayloadObject.values = [];

            let valueObject = {
              dataPointId: variableName,
              qualityCode: "0",
              value: variableValue.toString()
            };

            MSPayloadObject.values.push(valueObject);
          }
        }
      }

      if (existsAndIsNotEmpty(MSPayloadObject))
        dataToReturn.push(MSPayloadObject);
    }
    return dataToReturn;
  }

  async _sendData(data) {
    if (isObjectEmpty(data)) return;
    let dataToSend = this._convertDataToMSData(data);
    return this.MindConnectAgent.BulkPostData(dataToSend);
  }

  _checkPayload(payload) {
    super._checkPayload(payload);
  }

  async _initProperties(payload) {
    await super._initProperties(payload);
    if (exists(payload.boardingKey)) this._boardingKey = payload.boardingKey;
    if (exists(payload.variableNames))
      this._variableNames = payload.variableNames;
  }

  async setBoardingKey(boardingKey) {
    this._boardingKey = boardingKey;
  }

  async init(payload) {
    await super.init(payload);

    //Initializing sending mechnism if agent is already ready - means that was ready before
    if (this.ReadyToSend) await this.initSendingMechanism();
  }

  async initSendingMechanism() {
    await this._initMindConnectAgent();
    this._readyToSend = true;
  }

  async _initMindConnectAgent() {
    await this._loadNewBoardingKey(this.BoardingKey);

    if (!exists(this.BoardingKey))
      throw new Error("Boarding key is not defined!");

    if (!this.MindConnectAgent.IsOnBoarded()) {
      await this.MindConnectAgent.OnBoard();
    }

    if (!this.MindConnectAgent.HasDataSourceConfiguration()) {
      await this.MindConnectAgent.GetDataSourceConfiguration();
    }
  }

  _validateBoardingKey(boardinKey) {
    if (!existsAndIsNotEmpty(boardinKey.content))
      throw new Error("content cannot be empty");

    if (!existsAndIsNotEmpty(boardinKey.content.baseUrl))
      throw new Error("content.baseUrl cannot be empty");

    if (!existsAndIsNotEmpty(boardinKey.content.iat))
      throw new Error("content.iat cannot be empty");

    if (!existsAndIsNotEmpty(boardinKey.content.clientCredentialProfile))
      throw new Error("content.clientCredentialProfile cannot be empty");

    if (boardinKey.content.clientCredentialProfile[0] !== "SHARED_SECRET")
      throw new Error("Agent supports only SHARED_SECRET credential!!");

    if (!existsAndIsNotEmpty(boardinKey.content.clientId))
      throw new Error("content.clientId cannot be empty");

    if (!existsAndIsNotEmpty(boardinKey.content.tenant))
      throw new Error("content.tenant cannot be empty");

    if (!existsAndIsNotEmpty(boardinKey.expiration))
      throw new Error("expiration cannot be empty");
  }

  async _loadNewBoardingKey(boardingKey) {
    if (!existsAndIsNotEmpty(boardingKey)) return;
    this._validateBoardingKey(boardingKey);
    this._agent = new MindConnectAgent(boardingKey);
    this._boardingKey = boardingKey;
  }

  _generatePayload() {
    let payload = super._generatePayload();
    return {
      ...payload,
      boardingKey: exists(this.BoardingKey) ? this.BoardingKey : null,
      variableNames: this.VariableNames
    };
  }
}

module.exports = MSDataAgent;
