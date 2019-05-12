const EventEmitter = require("events");
const mongoose = require("mongoose");
const ArchiveManager = require("../archiveManager/ArchiveManager");
const SumElement = require("../calculationElement/SumElement");
const FactorElement = require("../calculationElement/FactorElement");
const AverageElement = require("../calculationElement/AverageElement");
const IncreaseElement = require("../calculationElement/IncreaseElement");
const Sampler = require("../../classes/sampler/Sampler");

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
    this._calculationElements = {};

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
   * @description Method for initializing calculation elements
   * @param {*} calculationElements Payload of calculation elements
   */
  async _initCalculationElements(calculationElements) {
    for (let calculationElement of calculationElements) {
      await this.createCalculationElement(calculationElement);
    }
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
    if (this.ArchiveManager) return this.ArchiveManager.Initialized;
    else return false;
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
   * @description Is device connected? - should be override in child classes
   */
  get Connected() {
    return true;
  }

  /**
   * @description Is device active? this means, if driver is enabled to exchange data - should be override in child classes
   */
  get IsActive() {
    return true;
  }

  /**
   * @description Calculation elements associated with device
   */
  get CalculationElements() {
    return this._calculationElements;
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

  /**
   * @description Method for adding calculation element to device
   * @param {object} calculationElement calculation element to add
   */
  async addCalculationElement(calculationElement) {
    this.CalculationElements[calculationElement.Id] = calculationElement;
    if (calculationElement.Archived)
      await this.ArchiveManager.addCalculationElement(calculationElement);
  }

  /**
   * @description Method for removing calculation element from device
   * @param {string} id id of calculation to remove
   */
  async removeCalculationElement(id) {
    if (!(id in this.CalculationElements))
      throw Error(`There is no such calculation element in device - id:${id}`);

    let calculationElementToDelete = this.CalculationElements[id];

    //Removing variable from Archive manager if exist
    if (this.ArchiveManager.doesCalculationElementIdExists(id)) {
      await this.ArchiveManager.removeCalculationElement(id);
    }

    delete this.CalculationElements[id];

    return calculationElementToDelete;
  }

  /**
   * @description Method for creating calculaction element
   * @param {object} payload payload to create calculation element
   */
  async createCalculationElement(payload) {
    if (!payload) throw new Error("Given payload cannot be empty");
    if (!payload.type)
      throw new Error("Given calculation element payload has no type defined");

    if (payload.id && this.CalculationElements[payload.id])
      throw new Error(
        `Calculation element with id ${payload.id} already exists!`
      );
    switch (payload.type) {
      case "sumElement": {
        return this._createSumElement(payload);
      }
      case "factorElement": {
        return this._createFactorElement(payload);
      }
      case "averageElement": {
        return this._createAverageElement(payload);
      }
      case "increaseElement": {
        return this._createIncreaseElement(payload);
      }
      default: {
        throw new Error(
          `Given calculation element is not recognized: ${payload.type}`
        );
      }
    }
  }

  /**
   * @description Method for creating calculaction element
   * @param {object} payload payload to create calculation element
   */
  async _createSumElement(payload) {
    if (!payload.name)
      throw new Error("Calculation element name in payload is not defined");

    let calculationElementToAdd = new SumElement(this);
    await calculationElementToAdd.init(payload);
    await this.addCalculationElement(calculationElementToAdd);
    return calculationElementToAdd;
  }

  /**
   * @description Method for creating factor element
   * @param {object} payload payload to create factor element
   */
  async _createFactorElement(payload) {
    if (!payload.name)
      throw new Error("Calculation element name in payload is not defined");

    let calculationElementToAdd = new FactorElement(this);
    await calculationElementToAdd.init(payload);
    await this.addCalculationElement(calculationElementToAdd);
    return calculationElementToAdd;
  }

  /**
   * @description Method for creating calculaction element
   * @param {object} payload payload to create calculation element
   */
  async _createAverageElement(payload) {
    if (!payload.name)
      throw new Error("Calculation element name in payload is not defined");

    let calculationElementToAdd = new AverageElement(this);
    await calculationElementToAdd.init(payload);
    await this.addCalculationElement(calculationElementToAdd);
    return calculationElementToAdd;
  }

  /**
   * @description Method for creating calculaction element
   * @param {object} payload payload to create calculation element
   */
  async _createIncreaseElement(payload) {
    if (!payload.name)
      throw new Error("Calculation element name in payload is not defined");

    let calculationElementToAdd = new IncreaseElement(this);
    await calculationElementToAdd.init(payload);
    await this.addCalculationElement(calculationElementToAdd);
    return calculationElementToAdd;
  }

  /**
   * @description Method for dividing variables by tickId
   * @param {object} variables variables that should be devided by tickId
   */
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
   * @description Getting calculation element of given id
   * @param {string} id calculation element id
   */
  getCalculationElement(id) {
    return this.CalculationElements[id];
  }

  /**
   * @description Refreshing variables based on tickNumber
   */
  async refresh(tickNumber) {
    let result = await this._refresh(tickNumber);
    let finalResult = await this._refreshCalculationElements(
      tickNumber,
      result
    );

    if (finalResult) {
      this.Events.emit("Refreshed", [this, finalResult, tickNumber]);
      this.archiveData(tickNumber, finalResult);
    }
  }

  /**
   * @description Refreshing variables based on tickNumber - should be override in child classes
   */
  async _refresh(tickNumber) {
    throw new Error("Not implemented");
  }

  /**
   * @description Method for refreshing all calculation elements associated with device - if the correspond to tick number
   * @param {*} tickNumber Tick number
   * @param {*} payloadToAppend Payload to append by results of refresh
   */
  async _refreshCalculationElements(tickNumber, payloadToAppend) {
    if (!payloadToAppend) payloadToAppend = {};

    //if device is not connected or not active - return null
    if (!this.IsActive || !this.Connected) return payloadToAppend;

    let allCalculationElements = Object.values(this.CalculationElements);
    for (let calculationElement of allCalculationElements) {
      try {
        if (
          Sampler.doesTickIdMatchesTick(
            tickNumber,
            calculationElement.SampleTime
          )
        ) {
          let result = await calculationElement.refresh(tickNumber);

          //appending result only if refreshing object is not empty
          if (result !== null && result !== undefined)
            payloadToAppend[calculationElement.Id] = calculationElement;
        }
      } catch (err) {
        console.log(err);
      }
    }

    return payloadToAppend;
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
    let initialPayload = {
      id: this.Id,
      name: this.Name,
      calculationElements: []
    };

    for (let calculationElement of Object.values(this.CalculationElements)) {
      initialPayload.calculationElements.push(calculationElement.Payload);
    }

    return initialPayload;
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

  async getVariableValueFromDB(variableId, date) {
    if (!variableId in this.Variables)
      throw new Error(`There is no variable of given id: ${variableId}`);
    return this.ArchiveManager.doesVariableIdExists(variableId)
      ? this.ArchiveManager.getValue(date, variableId)
      : Promise.resolve(undefined);
  }

  async getCalculationElementValueFromDB(calculationElementId, date) {
    if (!calculationElementId in this.CalculationElements)
      throw new Error(
        `There is no calculation element of given id: ${calculationElementId}`
      );
    return this.ArchiveManager.doesCalculationElementIdExists(
      calculationElementId
    )
      ? this.ArchiveManager.getValue(date, calculationElementId)
      : Promise.resolve(undefined);
  }
}

module.exports = Device;
