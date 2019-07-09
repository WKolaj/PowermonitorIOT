const path = require("path");
const DataStorage = require("./DataStorage");
const {
  exists,
  isObjectEmpty,
  checkIfDirectoryExistsAsync,
  createDirAsync
} = require("../../utilities/utilities");

class VariablesStorage {
  /**
   * @description Class for buffering data of variables
   */
  constructor() {
    this._sampleTimeGroups = {};
    this._variables = {};
    this._directoryPath = null;
    this._bufferSize = 10;
  }

  get DirectoryPath() {
    return this._directoryPath;
  }

  /**
   * @description sample time groups of storage
   */
  get SampleTimeGroups() {
    return this._sampleTimeGroups;
  }

  /**
   * @description Variables of storage
   */
  get Variables() {
    return this._variables;
  }

  /**
   * @description get column name based on dataPointId
   * @param {string} dataPointId id of datapoint
   */
  static getStorageFileName(sampleTime) {
    return `storage_${sampleTime}.db`;
  }

  async createDataStorage(sampleTime) {
    if (!exists(this.SampleTimeGroups[sampleTime])) {
      let newDataStorage = new DataStorage();
      let fileName = VariablesStorage.getStorageFileName(sampleTime);
      let filePath = path.join(this.DirectoryPath, fileName);

      await newDataStorage.init({
        filePath,
        bufferSize: this.BufferSize
      });

      this.SampleTimeGroups[sampleTime] = newDataStorage;
    }
  }

  /**
   * @description Method for adding variable to data storage
   * @param {*} variableId id of variable
   */
  async addVariable(timeSample, variableId) {
    if (!exists(this.SampleTimeGroups[variableId]))
      await this.createDataStorage(timeSample);

    let dataStorage = this.SampleTimeGroups[timeSample];

    if (!(variableId in dataStorage.DataPoints)) {
      await dataStorage.addDataPoint(variableId);
      this.Variables[variableId] = timeSample;
    }
  }

  /**
   * @description Method for removing variable from data storage
   * @param {*} variableId id of variable
   */
  async removeVariable(timeSample, variableId) {
    if (!exists(this.SampleTimeGroups[timeSample]))
      throw new Error(`sample ${timeSample} does not exist`);

    if (!exists(this.SampleTimeGroups[timeSample].DataPoints[variableId]))
      throw new Error(
        `variable of id ${variableId}  for sampleTime ${timeSample} does not exist`
      );

    await this.SampleTimeGroups[timeSample].removeDataPoint(variableId);
    delete this.Variables[variableId];
  }

  /**
   * @description Buffer size of datastorage
   */
  get BufferSize() {
    return this._bufferSize;
  }

  /**
   * @description Method for checking if init payload is ok - throws otherwise
   */
  _checkInitPayload(payload) {
    if (!exists(payload.dirPath))
      throw new Error("There is no dirPath in payload");
  }

  /**
   * @description method for initializing data storage
   * @param {*} payload
   */
  async init(payload) {
    this._checkInitPayload(payload);
    await this._initProperties(payload);
    await this._initDirectory(payload);
    await this._initSampleGroups(payload);
  }

  /**
   * @description method for initializng properties
   * @param {*} payload
   */
  async _initProperties(payload) {
    if (exists(payload.dirPath)) this._directoryPath = payload.dirPath;
    if (exists(payload.bufferSize)) this._bufferSize = payload.bufferSize;
  }

  /**
   * @description method for initializng variables
   * @param {*} payload
   */
  async _initSampleGroups(payload) {
    //If there is no datapointIds given in payload - return imediately
    if (!exists(payload.sampleTimeGroups)) return;

    for (let sampleGroup of payload.sampleTimeGroups) {
      try {
        let sampleTime = sampleGroup.sampleTime;
        let variableIds = sampleGroup.variableIds;

        await this.createDataStorage(sampleTime);

        for (let variableId of variableIds) {
          await this.addVariable(sampleTime, variableId);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  /**
   * @description method for initializng properties
   * @param {*} payload
   */
  async _initDirectory(payload) {
    if (!(await checkIfDirectoryExistsAsync(payload.dirPath)))
      await createDirAsync(payload.dirPath);
  }

  _generateSampleTimeGroups() {
    if (!exists(this.SampleTimeGroups)) return {};

    let payloadToReturn = [];

    for (let sampleTime of Object.keys(this.SampleTimeGroups)) {
      let variableIds = Object.keys(
        this.SampleTimeGroups[sampleTime].DataPoints
      );

      payloadToReturn.push({
        sampleTime: parseInt(sampleTime),
        variableIds: variableIds
      });
    }
    return payloadToReturn;
  }

  /**
   * @description Method for generating payload
   */
  _generatePayload() {
    return {
      dirPath: this.DirectoryPath,
      sampleTimeGroups: this._generateSampleTimeGroups(),
      bufferSize: this.BufferSize
    };
  }

  /**
   * @description Payload of data storage
   */
  get Payload() {
    return this._generatePayload();
  }

  async getData(sampleTimes) {
    let data = {};

    for (let sampleTime of sampleTimes) {
      if (sampleTime in this.SampleTimeGroups)
        data[sampleTime] = await this.SampleTimeGroups[sampleTime].getData();
    }

    return data;
  }

  async getAllData() {
    let data = {};

    for (let sampleTime of Object.keys(this.SampleTimeGroups)) {
      data[sampleTime] = await this.SampleTimeGroups[sampleTime].getData();
    }
    return data;
  }

  async getAllXData(x) {
    let data = {};

    for (let sampleTime of Object.keys(this.SampleTimeGroups)) {
      data[sampleTime] = await this.SampleTimeGroups[sampleTime].getXData(x);
    }
    return data;
  }

  async getXData(sampleTimes, x) {
    let data = {};

    for (let sampleTime of sampleTimes) {
      if (sampleTime in this.SampleTimeGroups)
        data[sampleTime] = await this.SampleTimeGroups[sampleTime].getXData(x);
    }

    return data;
  }

  async insertValues(tickId, data) {
    let sampleTimePayloadPairs = {};

    for (let variableId of Object.keys(data)) {
      if (variableId in this.Variables) {
        let sampleTime = this.Variables[variableId];
        if (!(sampleTime in sampleTimePayloadPairs))
          sampleTimePayloadPairs[sampleTime] = {};
        sampleTimePayloadPairs[sampleTime][variableId] = data[variableId];
      }
    }

    for (let sampleTime of Object.keys(sampleTimePayloadPairs)) {
      let storage = this.SampleTimeGroups[sampleTime];
      await storage.insertValues(tickId, sampleTimePayloadPairs[sampleTime]);
    }
  }

  async removeValues(sampleTimesAndGroups) {
    let allSampleTimes = Object.keys(sampleTimesAndGroups);

    for (let sampleTime of allSampleTimes) {
      if (sampleTime in this.SampleTimeGroups)
        await this.SampleTimeGroups[sampleTime].removeValues(
          sampleTimesAndGroups[sampleTime]
        );
    }
  }

  async clear(sampleTimes) {
    for (let sampleTime of sampleTimes) {
      if (sampleTime in this.SampleTimeGroups)
        await this.SampleTimeGroups[sampleTime].clear();
    }
  }

  async clearAll() {
    for (let storage of Object.values(this.SampleTimeGroups)) {
      await storage.clear();
    }
  }
}

module.exports = VariablesStorage;
