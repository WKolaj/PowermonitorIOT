const path = require("path");
const commInterface = require("../commInterface/CommInterface");
const ProjectContentManager = require("./ProjectContentManager");

class Project {
  constructor(projectDirectoryName) {
    this._projectContentManager = new ProjectContentManager(
      this,
      projectDirectoryName
    );
    this.CommInterface.assignToProject(this);
  }

  get CommInterface() {
    return commInterface;
  }

  get SWVersion() {
    return this._swVersion;
  }

  set SWVersion(value) {
    this._swVersion = value;
  }

  get ProjectContentManager() {
    return this._projectContentManager;
  }

  async load() {
    return this.ProjectContentManager.loadProject();
  }

  async save() {
    return this.ProjectContentManager.saveProject();
  }

  async loadDevice(deviceId) {
    return this.ProjectContentManager.loadDevice(deviceId);
  }

  async saveDevice(deviceId) {
    return this.ProjectContentManager.saveDevice(deviceId);
  }

  async initFromFiles() {
    return this.ProjectContentManager.initFromFiles();
  }

  async getDevice(id) {
    return this.CommInterface.getDevice(id);
  }

  async getAllDevices() {
    return this.CommInterface.getAllDevices();
  }

  async deleteDevice(id) {
    return this.CommInterface.removeDevice(id);
  }

  async updateDevice(id, payload) {
    return this.CommInterface.editDevice(id, payload);
  }

  async createDevice(payload) {
    return this.CommInterface.createNewDevice(payload);
  }

  async getVariable(deviceId, variableId) {
    return this.CommInterface.getVariable(deviceId, variableId);
  }

  async deleteVariable(deviceId, variableId) {
    return this.CommInterface.removeVariable(deviceId, variableId);
  }

  async updateVariable(deviceId, variableId, payload) {
    return this.CommInterface.editVariable(deviceId, variableId, payload);
  }

  async createVariable(deviceId, payload) {
    return this.CommInterface.createVariable(deviceId, payload);
  }

  async getAllVariables(deviceId) {
    return this.CommInterface.getAllVariables(deviceId);
  }

  async getCalcElement(deviceId, calcElementId) {
    return this.CommInterface.getCalculationElement(deviceId, calcElementId);
  }

  async deleteCalcElement(deviceId, calcElementId) {
    return this.CommInterface.removeCalculationElement(deviceId, calcElementId);
  }

  async createCalcElement(deviceId, payload) {
    return this.CommInterface.createCalculationElement(deviceId, payload);
  }

  async getAllCalcElements(deviceId) {
    return this.CommInterface.getAllCalculationElements(deviceId);
  }

  async getValue(deviceId, elementId) {
    return this.CommInterface.getValueOfElement(deviceId, elementId);
  }

  async getValueBasedOnDate(deviceId, elementId, date) {
    return this.CommInterface.getValueOfElementFromDB(
      deviceId,
      elementId,
      date
    );
  }
}

module.exports = Project;
