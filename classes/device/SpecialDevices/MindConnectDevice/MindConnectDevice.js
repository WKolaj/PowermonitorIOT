const SpecialDevice = require("../SpecialDevice");
const MSDataAgent = require("../SendAgent/MSDataAgent");
const path = require("path");
const config = require("config");
const Sampler = require("../../../sampler/Sampler");
const {
  createDirAsync,
  existsAndIsNotEmpty,
  checkIfDirectoryExistsAsync,
  exists
} = require("../../../../utilities/utilities");

class MindConnectDevice extends SpecialDevice {
  constructor() {
    super();

    this._dataAgent = new MSDataAgent();
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
    return path.resolve(
      path.join(config.get("projPath"), config.get("dataAgentDir"), id)
    );
  }

  /**
   * @description Refreshing special device
   * @param {number} tickNumber Tick number
   */
  async _refreshSpecialDevice(tickNumber) {
    let valuesPayload = await this._generateValuesPayload(tickNumber);
    if (
      existsAndIsNotEmpty(valuesPayload) &&
      existsAndIsNotEmpty(this.DataAgent) &&
      this.DataAgent.ReadyToSend
    )
      await this.DataAgent.refresh(tickNumber, valuesPayload);
  }

  async _generateValuesPayload(tickNumber) {
    let valuesPayload = {};

    let allVariables = Object.values(this.Variables);
    let allCalcElements = Object.values(this.CalculationElements);

    for (let variable of allVariables) {
      if (Sampler.doesTickIdMatchesTick(tickNumber, variable.TickId))
        valuesPayload[variable.Id] = variable.Value;
    }

    for (let calcElement of allCalcElements) {
      if (Sampler.doesTickIdMatchesTick(tickNumber, calcElement.TickId))
        valuesPayload[calcElement.Id] = calcElement.Value;
    }

    return valuesPayload;
  }

  _generatePayload() {
    let payload = super._generatePayload();
    if (existsAndIsNotEmpty(this.DataAgent))
      payload.dataAgent = this.DataAgent.Payload;

    return payload;
  }

  get BoardingKey() {
    return this.DataAgent.BoardingKey;
  }

  get ReadyToSend() {
    return this.DataAgent.ReadyToSend;
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
