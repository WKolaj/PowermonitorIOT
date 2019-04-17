const EventEmitter = require("events");
const mongoose = require("mongoose");
const ArchiveManager = require("../archiveManager/ArchiveManager");

class Device {
  /**
   * @description Class for representing device
   **/
  constructor() {
    this._initialized = false;
  }

  /**
   * @description Method for initializing device
   * @param {object} payload Device payload
   */
  async init(payload) {
    if (!payload) throw new Error("Payload cannot be empty");
    if (!payload.name) throw new Error("Payload Name cannot be empty");

    this._name = payload.name;
    this._variables = {};

    //Events of device
    this._events = new EventEmitter();

    //Generating random id in case it was not provided
    if (!payload.id) payload.id = Device.generateRandId();
    this._id = payload.id;

    this._type = undefined;

    let fileName = this.generateFileName();

    //Creating archive manager
    this._archiveManager = new ArchiveManager(fileName);

    await this._initArchiveManager();

    this._initialized = true;
  }

  /**
   * @description Is device initialized
   */
  get Initialized() {
    return this._initialized;
  }

  /**
   * @description Initializing archive manager
   */
  async _initArchiveManager() {
    return this.ArchiveManager.init();
  }

  /**
   * @description Is archive manager initialized
   */
  get ArchiveManagerInitialized() {
    return this.ArchiveManager.Initialized;
  }

  /**
   * @description Type of device
   */
  generateFileName() {
    return `archive_${this.Id}.db`;
  }

  /**
   * @description Archive manager
   */
  get ArchiveManager() {
    return this._archiveManager;
  }

  /**
   * @description Type of device
   */
  get Type() {
    return this._type;
  }

  /**
   * @description Device payload
   */
  get Payload() {
    return this._generatePayload();
  }

  /**
   * @description uniq id of device
   */
  get Id() {
    return this._id;
  }

  /**
   * @description Event emitter
   */
  get Events() {
    return this._events;
  }

  /**
   * @description Name describing device
   */
  get Name() {
    return this._name;
  }

  /**
   * @description Variables associated with device
   */
  get Variables() {
    return this._variables;
  }

  /**
   * @description Adding variable to device
   */
  async addVariable(variable) {
    this.Variables[variable.Id] = variable;
    if (variable.Archived) await this.ArchiveManager.addVariable(variable);
  }

  /**
   * @description Removing variable from device
   * @param {string} id device id
   */
  async removeVariable(id) {
    if (!(id in this.Variables))
      throw Error(`There is no such variable in device - variable id:${id}`);

    let variableToDelete = this.Variables[id];

    //Removing variable from Archive manager if exist
    if (this.ArchiveManager.doesVariableIdExists(id)) {
      await this.ArchiveManager.removeVariable(id);
    }

    delete this.Variables[id];

    return variableToDelete;
  }

  /**
   * @description creating variable and adding it to the Device - should be override in child classes
   * @param {object} payload Payload of variable to be created
   */
  async createVariable(payload) {
    throw new Error("Not implemented");
  }

  /**
   * @description Method for editting variable - should be override in child classes
   * @param {string} id Id of variable to be edited
   * @param {object} payload Payload of eddition
   */
  async editVariable(id, payload) {
    throw new Error("Not implemented");
  }

  static divideVariablesByTickId(variables) {
    let variablesToReturn = {};

    for (let variable of variables) {
      if (!(variable.TickId in variablesToReturn))
        variablesToReturn[variable.TickId] = [];

      variablesToReturn[variable.TickId].push(variable);
    }

    return variablesToReturn;
  }

  /**
   * @description Getting variable by device id
   * @param {string} id device id
   */
  getVariable(id) {
    return this.Variables[id];
  }

  /**
   * @description Refreshing variables based on tickNumber
   */
  async refresh(tickNumber) {
    let result = await this._refresh(tickNumber);
    if (result) {
      this.Events.emit("Refreshed", [this, result, tickNumber]);
    }

    await this.archiveData(tickNumber, result);
  }

  /**
   * @description Refreshing variables based on tickNumber - should be override in child classes
   */
  async _refresh(tickNumber) {
    throw new Error("Not implemented");
  }

  /**
   * @description Archiving data
   * @param {number} tickNumber Date of tick
   * @param {object} variables variables got from refresh
   */
  archiveData(tickNumber, variables) {
    return new Promise(async (resolve, reject) => {
      if (!this.ArchiveManager.Initialized) {
        return resolve(false);
      }

      try {
        let archivePayload = this.generateArchivePayloadFromVariables(
          variables
        );

        if (archivePayload != {}) {
          await this.ArchiveManager.insertValues(tickNumber, archivePayload);
        }

        return resolve(true);
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * @description Generating archive payload from variables
   */
  generateArchivePayloadFromVariables(variables) {
    //Returning empty object if varaibles are not defined
    if (!variables) return {};

    let archivedPayload = {};

    let allVariables = Object.values(variables);

    //Creating payload only from archived variables
    for (let variable of allVariables) {
      if (variable.Archived) {
        archivedPayload[variable.Id] = variable.Value;
      }
    }

    return archivedPayload;
  }

  /**
   * @description Generating random id
   */
  static generateRandId() {
    return mongoose.Types.ObjectId();
  }

  /**
   * @description Method for generating payload - overriding in child classes
   */
  _generatePayload() {
    return {
      id: this.Id,
      name: this.Name
    };
  }

  /**
   * @description Method for editing Device
   */
  async editWithPayload(payload) {
    //Setting new values if they are given in payload
    if (payload.name) this._name = payload.name;
  }

  /**
   * @description Method for reacreating all variables
   */
  async _recreateAllVariables() {
    let oldVariables = Object.values(this.Variables);

    //Removing old variables
    for (let variable of oldVariables) {
      await this.removeVariable(variable.Id);
    }

    //Adding new onces based on old payload
    for (let variable of oldVariables) {
      await this.createVariable(variable.Payload);
    }
  }

  async getValueFromDB(variableId, date) {
    if (!variableId in this.Variables)
      throw new Error(`There is no variable of given id: ${variableId}`);
    return this.ArchiveManager.doesVariableIdExists(variableId)
      ? this.ArchiveManager.getValue(date, variableId)
      : Promise.resolve(undefined);
  }
}

module.exports = Device;
