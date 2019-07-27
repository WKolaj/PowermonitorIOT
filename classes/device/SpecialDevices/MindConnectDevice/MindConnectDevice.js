const SpecialDevice = require("../SpecialDevice");
const MindConnectSenderAgent = require("../SenderAgents/MindConnectSenderAgent");
const path = require("path");
const config = require("config");
const Sampler = require("../../../sampler/Sampler");
const {
  createDirAsync,
  existsAndIsNotEmpty,
  checkIfDirectoryExistsAsync,
  exists,
  isCorrectValue,
  getCurrentProject
} = require("../../../../utilities/utilities");

class MindConnectDevice extends SpecialDevice {
  constructor() {
    super();

    this._dataAgent = new MindConnectSenderAgent();
    this._eventVariables = [];
  }

  get EventVariables() {
    return this._eventVariables;
  }

  get DirectoryPath() {
    return this._directoryPath;
  }

  get DataAgent() {
    return this._dataAgent;
  }

  async init(payload) {
    await this.createDataAgentDirIfNotExists();

    await super.init(payload);

    this._directoryPath = MindConnectDevice.generateDirectoryPath(this.Id);

    await this.createDirectoryIfNotExists(this.DirectoryPath);

    let dataAgentInitPayload = {};

    if (exists(payload.dataAgent))
      dataAgentInitPayload = { ...payload.dataAgent };

    if (exists(payload.eventVariables)) {
      await this._initEventVariables(payload.eventVariables);
      dataAgentInitPayload.eventBufferSize = this.EventVariables.length;
    } else {
      dataAgentInitPayload.eventBufferSize = 0;
    }

    dataAgentInitPayload.dirPath = this.DirectoryPath;

    await this.initDataAgent(dataAgentInitPayload);
  }

  async createDataAgentDirIfNotExists() {
    let mainDataAgentsDirPath = path.join(
      config.get("projPath"),
      config.get("dataAgentDir")
    );
    let dirExists = await checkIfDirectoryExistsAsync(mainDataAgentsDirPath);
    if (!dirExists) await createDirAsync(mainDataAgentsDirPath);
  }

  async initDataAgent(payload) {
    await this.DataAgent.init(payload);
  }

  async _initEventVariables(variablesPayload) {
    if (existsAndIsNotEmpty(variablesPayload)) {
      for (let variablePayload of variablesPayload) {
        let tickDevId = variablePayload.tickDevId;
        let tickVarId = variablePayload.tickVarId;
        let valueVarId = variablePayload.valueVarId;
        let valueDevId = variablePayload.valueDevId;

        if (
          exists(tickDevId) &&
          exists(tickVarId) &&
          exists(valueDevId) &&
          exists(valueVarId)
        ) {
          let tickVar = await getCurrentProject().getElement(
            tickDevId,
            tickVarId
          );
          let valueVar = await getCurrentProject().getElement(
            valueDevId,
            valueVarId
          );

          this.EventVariables.push({ tick: tickVar, value: valueVar });
        }
      }
    }
  }

  async createDirectoryIfNotExists(directory) {
    let dirExists = await checkIfDirectoryExistsAsync(directory);
    if (!dirExists) await createDirAsync(directory);
  }

  static generateDirectoryPath(id) {
    return path.join(config.get("projPath"), config.get("dataAgentDir"), id);
  }

  _generateEventPayloadFromVariables() {
    let eventPayload = [];

    for (let variableObject of this.EventVariables) {
      eventPayload.push({
        tickId: variableObject.tick.Value,
        value: variableObject.value.Value
      });
    }

    return eventPayload;
  }

  /**
   * @description Refreshing special device
   * @param {number} tickNumber Tick number
   */
  async _refreshSpecialDevice(tickNumber) {
    if (existsAndIsNotEmpty(this.DataAgent) && this.DataAgent.IsReadyToSend) {
      let valuesPayload = await this._generateValuesPayload(tickNumber);

      if (existsAndIsNotEmpty(valuesPayload.values)) {
        await this.DataAgent.addToBuffer(valuesPayload);
      }

      await this.DataAgent.refresh(tickNumber);

      let eventsPayload = await this._generateEventPayloadFromVariables();

      if (existsAndIsNotEmpty(eventsPayload)) {
        await this.DataAgent.refreshEvents(eventsPayload);
      }
    }
  }

  async _generateValuesPayload(tickNumber) {
    let valuesPayload = { tickId: tickNumber, values: [] };

    let allVariables = Object.values(this.Variables);
    let allCalcElements = Object.values(this.CalculationElements);

    for (let variable of allVariables) {
      if (Sampler.doesTickIdMatchesTick(tickNumber, variable.TickId)) {
        //Not adding value if it is not a number or boolean or invalid number - eg. NaN
        if (isCorrectValue(variable.Value)) {
          valuesPayload.values.push({
            id: variable.Id,
            value: variable.Value
          });
        }
      }
    }

    for (let calcElement of allCalcElements) {
      if (Sampler.doesTickIdMatchesTick(tickNumber, calcElement.TickId)) {
        //Not adding value if it is not a number or boolean or invalid number - eg. NaN
        if (isCorrectValue(calcElement.Value)) {
          valuesPayload.values.push({
            id: calcElement.Id,
            value: calcElement.Value
          });
        }
      }
    }

    return valuesPayload;
  }

  _generatePayload() {
    let payload = super._generatePayload();
    if (existsAndIsNotEmpty(this.DataAgent))
      payload.dataAgent = this.DataAgent.Payload;

    payload.eventVariables = this.EventVariables.map(varPair => {
      return {
        tickDevId: varPair.tick.Device.Id,
        tickVarId: varPair.tick.Id,
        valueDevId: varPair.value.Device.Id,
        valueVarId: varPair.value.Id
      };
    });

    return payload;
  }

  /**
   * @description Method for editing MindConnectDevice
   */
  async editWithPayload(payload) {
    await super.editWithPayload(payload);

    if (exists(payload.eventVariables))
      await this._editEventVariables(payload.eventVariables);

    if (exists(payload.dataAgent)) {
      //Removing dir path from payload - in order to secure dirPatch change by route
      if (exists(payload.dataAgent.dirPath)) delete payload.dataAgent.dirPath;

      //Deleting eventBufferSize from payload - it should be always calculated based on current variables count
      if (exists(payload.dataAgent.eventBufferSize))
        delete payload.dataAgent.eventBufferSize;

      await this.DataAgent.editWithPayload(payload.dataAgent);
    }

    return this;
  }

  async _editEventVariables(variablesPayload) {
    this._eventVariables = [];

    if (existsAndIsNotEmpty(variablesPayload)) {
      for (let variablePayload of variablesPayload) {
        let tickDevId = variablePayload.tickDevId;
        let tickVarId = variablePayload.tickVarId;
        let valueVarId = variablePayload.valueVarId;
        let valueDevId = variablePayload.valueDevId;

        if (
          exists(tickDevId) &&
          exists(tickVarId) &&
          exists(valueDevId) &&
          exists(valueVarId)
        ) {
          let tickVar = await getCurrentProject().getElement(
            tickDevId,
            tickVarId
          );
          let valueVar = await getCurrentProject().getElement(
            valueDevId,
            valueVarId
          );

          this.EventVariables.push({ tick: tickVar, value: valueVar });
        }
      }
    }

    //Event variables changed - also event buffer size should be adjusted
    this.DataAgent.changeBufferSize(this.EventVariables.length);
  }

  _generateResponsePayload() {
    let payload = this._generatePayload();

    //Filtering payload
    if (exists(payload.dataAgent) && exists(payload.dataAgent.dirPath)) {
      payload.dataAgent = { ...payload.dataAgent };
      delete payload.dataAgent.dirPath;
    }

    if (
      exists(payload.dataAgent) &&
      exists(payload.dataAgent.eventBufferSize)
    ) {
      payload.dataAgent = { ...payload.dataAgent };
      delete payload.dataAgent.eventBufferSize;
    }
    if (exists(payload.dataAgent) && exists(payload.dataAgent.boardingKey)) {
      payload.dataAgent = {
        ...payload.dataAgent,
        boardingKey: {
          content: payload.dataAgent.boardingKey.content,
          expiration: payload.dataAgent.boardingKey.expiration
        }
      };
    }
    return payload;
  }
}

module.exports = MindConnectDevice;
