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
  isCorrectValue
} = require("../../../../utilities/utilities");

class MindConnectDevice extends SpecialDevice {
  constructor() {
    super();

    this._dataAgent = new MindConnectSenderAgent();
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

  async createDirectoryIfNotExists(directory) {
    let dirExists = await checkIfDirectoryExistsAsync(directory);
    if (!dirExists) await createDirAsync(directory);
  }

  static generateDirectoryPath(id) {
    return path.join(config.get("projPath"), config.get("dataAgentDir"), id);
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

    return payload;
  }

  /**
   * @description Method for editing MindConnectDevice
   */
  async editWithPayload(payload) {
    await super.editWithPayload(payload);
    if (exists(payload.dataAgent)) {
      //Removing dir path from payload - in order to secure dirPatch change by route
      if (exists(payload.dataAgent.dirPath)) delete payload.dataAgent.dirPath;
      await this.DataAgent.editWithPayload(payload.dataAgent);
    }

    return this;
  }

  _generateResponsePayload() {
    let payload = this._generatePayload();

    //Filtering payload
    if (exists(payload.dataAgent) && exists(payload.dataAgent.dirPath)) {
      payload.dataAgent = { ...payload.dataAgent };
      delete payload.dataAgent.dirPath;
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
