const SendDataAgent = require("./SendDataAgent");
const { MindConnectAgent } = require("@mindconnect/mindconnect-nodejs");
const {
  exists,
  isObjectEmpty,
  existsAndIsNotEmpty,
  snooze
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
    if (exists(this.ValueStorage.Variables[variableId]))
      throw new Error(`Variable of id ${variableId} already exists!`);
    await this.ValueStorage.addVariable(sampleTimeGroup, variableId);
    this.VariableNames[variableId] = msName;
  }

  async removeVariable(sampleTimeGroup, variableId) {
    await this.ValueStorage.removeVariable(sampleTimeGroup, variableId);
    delete this.VariableNames[variableId];
  }

  async changeVariableName(variableId, msName) {
    this.VariableNames[variableId] = msName;
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

            //Have to checkIt - in order not to send null if there is no value for given variable
            if (exists(variableValue)) {
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
      this._variableNames = { ...payload.variableNames };
  }

  async init(payload) {
    await super.init(payload);

    //Initializing sending mechnism if agent is already ready - means that was ready before
    if (this.ReadyToSend) await this.startCommunication();
  }

  async startCommunication() {
    await this._createMindConnectAgent();
    this._readyToSend = true;
  }

  async stopCommunication() {
    this._readyToSend = false;
  }

  async _createMindConnectAgent() {
    await this._setBoardingKey(this.BoardingKey);

    if (!exists(this.BoardingKey))
      throw new Error("Boarding key is not defined!");

    if (!this.MindConnectAgent.IsOnBoarded()) {
      await this.MindConnectAgent.OnBoard();
    }

    if (!this.MindConnectAgent.HasDataSourceConfiguration()) {
      await this.MindConnectAgent.GetDataSourceConfiguration();
    }
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
  }

  _generatePayload() {
    let payload = super._generatePayload();
    return {
      ...payload,
      boardingKey: exists(this.BoardingKey) ? this.BoardingKey : null,
      variableNames: this.VariableNames
    };
  }

  /**
   * @description Method for editing Device
   */
  async editWithPayload(payload) {
    if (
      exists(payload.sendDataLimit) &&
      payload.sendDataLimit !== this.SendDataLimit
    ) {
      await this.setSendDatalLimit(payload.sendDataLimit);
    }
    if (
      exists(payload.boardingKey) &&
      payload.boardingKey !== this.BoardingKey
    ) {
      await this.stopCommunication();
      await this._setBoardingKey(payload.boardingKey);
    }

    if (exists(payload.bufferSize) && payload.bufferSize !== this.BufferSize)
      await this._valueStorage.setBufferSize(payload.bufferSize);

    if (exists(payload.sampleTimeGroups) || exists(payload.variableNames)) {
      await this.stopCommunication();
      await this._editVariables(payload);
    }

    //has to be invoked at the and - in order to start communication
    if (exists(payload.readyToSend)) {
      if (payload.readyToSend && !this.ReadyToSend) {
        await this.startCommunication();
      } else if (!payload.readyToSend && this.ReadyToSend) {
        await this.stopCommunication();
      }
    }
    return this;
  }

  static _getVariablesFromPayload(payload) {
    if (!(exists(payload.sampleTimeGroups) && exists(payload.variableNames)))
      throw new Error(
        "Both sampleTimeGroups and variableNames should have been defined"
      );

    //Returning empty object if both collections are empty
    if (
      isObjectEmpty(payload.sampleTimeGroups) &&
      isObjectEmpty(payload.variableNames)
    )
      return {};

    let variablesFromSampleTimeGroups = {};
    for (let sampleTimeGroup of payload.sampleTimeGroups) {
      let sampleTime = sampleTimeGroup.sampleTime;

      for (let variableId of sampleTimeGroup.variableIds) {
        variablesFromSampleTimeGroups[variableId] = {
          variableId,
          sampleTime
        };
      }
    }

    let variablesFromVariableNames = {};
    for (let variableId of Object.keys(payload.variableNames)) {
      let variableName = payload.variableNames[variableId];

      variablesFromVariableNames[variableId] = {
        variableId,
        variableName
      };
    }

    let variableIdsFromSampleTimeGroups = Object.keys(
      variablesFromSampleTimeGroups
    );
    let variableIdsFromVariableNames = Object.keys(variablesFromVariableNames);
    if (
      variableIdsFromSampleTimeGroups.length !==
      variableIdsFromVariableNames.length
    )
      throw new Error(
        "VariableNames collection in payload does not suit SampleTimeGroups collection - different lengths of variables collections"
      );

    for (let variableId of variableIdsFromSampleTimeGroups) {
      let variableName = variablesFromVariableNames[variableId].variableName;
      if (!exists(variableName))
        throw new Error(
          `VariableNames collection in payload does not suit SampleTimeGroups collection - no name of ${variableId} is given`
        );
      variablesFromSampleTimeGroups[variableId].variableName = variableName;
    }

    return variablesFromSampleTimeGroups;
  }

  async _editVariables(payload) {
    let existingVariables = MSDataAgent._getVariablesFromPayload(this.Payload);

    let newVariables = MSDataAgent._getVariablesFromPayload(payload);

    //Calculation variables to Add Delete and Edit

    let variablesToAdd = [];
    let variablesToDelete = [];
    let variablesWithNamesToEdit = [];

    let allExistingVariableIds = Object.keys(existingVariables);

    for (let existingVariableId of allExistingVariableIds) {
      let existingVariable = existingVariables[existingVariableId];
      let sameNewVariable = newVariables[existingVariableId];

      if (!exists(sameNewVariable)) {
        variablesToDelete.push(existingVariable);
      } else if (sameNewVariable.sampleTime !== existingVariable.sampleTime) {
        variablesToDelete.push(existingVariable);
        variablesToAdd.push(sameNewVariable);
      } else if (
        sameNewVariable.variableName !== existingVariable.variableName
      ) {
        variablesWithNamesToEdit.push(sameNewVariable);
      }
    }

    let allNewVariableIds = Object.keys(newVariables);

    for (let newVariableId of allNewVariableIds) {
      let newVariable = newVariables[newVariableId];
      let sameExistingVariable = existingVariables[newVariableId];

      if (!exists(sameExistingVariable)) {
        variablesToAdd.push(newVariable);
      }
    }

    //Deleting variables
    for (let variableToDelete of variablesToDelete) {
      await this.removeVariable(
        variableToDelete.sampleTime,
        variableToDelete.variableId
      );
    }

    //Adding variables
    for (let variableToAdd of variablesToAdd) {
      await this.addVariable(
        variableToAdd.sampleTime,
        variableToAdd.variableId,
        variableToAdd.variableName
      );
    }

    //Editing variables names
    for (let variableToEdit of variablesWithNamesToEdit) {
      await this.changeVariableName(
        variableToEdit.variableId,
        variableToEdit.variableName
      );
    }
  }
}

module.exports = MSDataAgent;
