const path = require("path");
const commInterface = require("../commInterface/CommInterface");
const ProjectContentManager = require("./ProjectContentManager");

class Project {
  /**
   * @description Class representing project
   * @param {string} projectDirectoryName directory where project files are stored
   */
  constructor(projectDirectoryName) {
    this._projectContentManager = new ProjectContentManager(
      this,
      projectDirectoryName
    );
    this.CommInterface.assignToProject(this);
  }

  /**
   * @description communication interface associated with project
   */
  get CommInterface() {
    return commInterface;
  }

  /**
   * @description Software version of application that created the project
   */
  get SWVersion() {
    return this._swVersion;
  }

  /**
   * @description Software version of application that created the project
   */
  set SWVersion(value) {
    this._swVersion = value;
  }

  /**
   * @description Project content manager object
   */
  get ProjectContentManager() {
    return this._projectContentManager;
  }

  /**
   * @description Method for loading project based on files content
   */
  async load() {
    return this.ProjectContentManager.loadProject();
  }

  /**
   * @description Method for saving project into files content
   */
  async save() {
    return this.ProjectContentManager.saveProject();
  }

  /**
   * @description Method for loading device from file content to project
   * @param {string} deviceId Id of device to be loaded
   */
  async loadDevice(deviceId) {
    return this.ProjectContentManager.loadDevice(deviceId);
  }

  /**
   * @description Method for saving device content to file
   * @param {string} deviceId Id of device to be saved
   */
  async saveDevice(deviceId) {
    return this.ProjectContentManager.saveDevice(deviceId);
  }

  /**
   * @description Method for init project and commInterface from project files
   */
  async initFromFiles() {
    return this.ProjectContentManager.initFromFiles();
  }

  /**
   * @description Method for getting device
   * @param {string} id Id fo device to be return
   */
  async getDevice(id) {
    return this.CommInterface.getDevice(id);
  }

  /**
   * @description Method for getting all devices
   */
  async getAllDevices() {
    return this.CommInterface.getAllDevices();
  }

  /**
   * @description Method for deleting device
   * @param {string} id Id fo device to be deleted
   */
  async deleteDevice(id) {
    let result = await this.CommInterface.removeDevice(id);
    await this.ProjectContentManager.deleteDevice(id);
    return result;
  }

  /**
   * @description Method for update device based on payload
   * @param {string} id Id fo device to be updated
   * @param {object} payload Payload to update object
   */
  async updateDevice(id, payload) {
    let result = await this.CommInterface.editDevice(id, payload);
    await this.ProjectContentManager.saveDevice(id);
    return result;
  }

  /**
   * @description Method for creating device
   * @param {object} payload Payload to create device
   */
  async createDevice(payload) {
    let result = await this.CommInterface.createNewDevice(payload);
    await this.ProjectContentManager.saveDevice(id);
    return result;
  }

  /**
   * @description Method for getting variable
   * @param {string} deviceId device id
   * @param {string} variableId variable id
   */
  async getVariable(deviceId, variableId) {
    return this.CommInterface.getVariable(deviceId, variableId);
  }

  /**
   * @description Method for deleting variable
   * @param {string} deviceId device id
   * @param {string} variableId variable id
   */
  async deleteVariable(deviceId, variableId) {
    let result = await this.CommInterface.removeVariable(deviceId, variableId);
    await this.ProjectContentManager.saveDevice(deviceId);
    return result;
  }

  /**
   * @description Method for updating variable
   * @param {string} deviceId device id
   * @param {string} variableId variable id
   * @param {object} payload payload to edit variable
   */
  async updateVariable(deviceId, variableId, payload) {
    let result = await this.CommInterface.editVariable(
      deviceId,
      variableId,
      payload
    );
    await this.ProjectContentManager.saveDevice(deviceId);
    return result;
  }

  /**
   * @description Method for creating variable
   * @param {string} deviceId device id
   * @param {object} payload payload to create variable
   */
  async createVariable(deviceId, payload) {
    let result = await this.CommInterface.createVariable(deviceId, payload);
    await this.ProjectContentManager.saveDevice(deviceId);
    return result;
  }

  /**
   * @description Method for getting all variables from device
   * @param {string} deviceId device id
   */
  async getAllVariables(deviceId) {
    return this.CommInterface.getAllVariables(deviceId);
  }

  /**
   * @description Method for getting calculation element
   * @param {string} deviceId device id
   * @param {string} calcElementId calculation element id
   */
  async getCalcElement(deviceId, calcElementId) {
    return this.CommInterface.getCalculationElement(deviceId, calcElementId);
  }

  /**
   * @description Method for deleting calculation element
   * @param {string} deviceId device id
   * @param {string} calcElementId calculation element id
   */
  async deleteCalcElement(deviceId, calcElementId) {
    let result = await this.CommInterface.removeCalculationElement(
      deviceId,
      calcElementId
    );
    await this.ProjectContentManager.saveDevice(deviceId);
    return result;
  }

  /**
   * @description Method for creating calculation element
   * @param {string} deviceId device id
   * @param {object} payload payload to create calculation element
   */
  async createCalcElement(deviceId, payload) {
    let result = await this.CommInterface.createCalculationElement(
      deviceId,
      payload
    );
    await this.ProjectContentManager.saveDevice(deviceId);
    return result;
  }

  /**
   * @description Method for getting all calculation element from device
   * @param {string} deviceId device id
   */
  async getAllCalcElements(deviceId) {
    return this.CommInterface.getAllCalculationElements(deviceId);
  }

  /**
   * @description Method for getting value from varaible or calculation element
   * @param {string} deviceId device id
   * @param {string} elementId element id of varaible or calculation element
   */
  async getValue(deviceId, elementId) {
    return this.CommInterface.getValueOfElement(deviceId, elementId);
  }

  /**
   * @description Method for getting value from varaible or calculation element from database
   * @param {string} deviceId device id
   * @param {string} elementId element id of varaible or calculation element
   * @param {number} date tickID of value
   */
  async getValueBasedOnDate(deviceId, elementId, date) {
    return this.CommInterface.getValueOfElementFromDatabase(
      deviceId,
      elementId,
      date
    );
  }
}

module.exports = Project;
