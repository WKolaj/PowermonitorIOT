const path = require("path");
const fs = require("fs");
const User = require("../user/User");
const mongoose = require("mongoose");
const logger = require("../../logger/logger");
const config = require("config");
const {
  getCurrentAppVersion,
  clearDirectoryAsync,
  readFileAsync,
  writeFileAsync,
  readDirAsync,
  createDirAsync,
  checkIfDirectoryExistsAsync,
  checkIfFileExistsAsync,
  unlinkAnsync
} = require("../../utilities/utilities");

class ProjectContentManager {
  /**
   * @description Class for managing content of project - including storing it inside project directory
   * @param {object} project
   * @param {string} projectDirectoryName
   */
  constructor(project, projectDirectoryName) {
    this._projectRelativePath = projectDirectoryName;
    this._projectAbsolutePath = path.resolve(projectDirectoryName);

    this._configFilePath = path.join(
      this.ProjectAbsolutePath,
      ProjectContentManager._getProjectConfigFileName()
    );

    this._deviceDirPath = path.join(
      this.ProjectAbsolutePath,
      ProjectContentManager._getDeviceDirName()
    );

    this._agentDirPath = path.join(
      this.ProjectAbsolutePath,
      config.get("dataAgentDir")
    );

    this._eventLogDir = path.join(
      this.ProjectAbsolutePath,
      config.get("eventElementsDir")
    );

    this._project = project;
  }

  /**
   * @description Method for getting project file name
   */
  static _getProjectConfigFileName() {
    return "project.json";
  }

  /**
   * @description Method for getting directory name of devices
   */
  static _getDeviceDirName() {
    return "devices";
  }

  /**
   * @description Method for getting name of device file based on its id
   * @param {string} deviceId id of device
   */
  static _getDeviceFileName(deviceId) {
    if (!deviceId) throw new Error("deviceId cannot be empty");
    return `${deviceId}.json`;
  }

  /**
   * @description Project associated with manager
   */
  get Project() {
    return this._project;
  }

  /**
   * @description Relative path of project
   */
  get ProjectRelativePath() {
    return this._projectRelativePath;
  }

  /**
   * @description Absolute path of project
   */
  get ProjectAbsolutePath() {
    return this._projectAbsolutePath;
  }

  /**
   * @description Absolute path to project config file
   */
  get ConfigFilePath() {
    return this._configFilePath;
  }

  /**
   * @description Absolute path to device directory
   */
  get DeviceDirPath() {
    return this._deviceDirPath;
  }

  /**
   * @description Absolute path to agent directory
   */
  get AgentDirPath() {
    return this._agentDirPath;
  }

  /**
   * @description Absolute path to event logs directory
   */
  get EventLogDirPath() {
    return this._eventLogDir;
  }

  /**
   * @description Method for checking if project directory exists
   */
  async _checkIfProjectDirExists() {
    return checkIfDirectoryExistsAsync(this.ProjectAbsolutePath);
  }

  /**
   * @description Method for creating empty project directory - if it does not exists
   */
  async _createProjectDirIfNotExists() {
    let dirExists = await this._checkIfProjectDirExists();
    if (!dirExists) {
      return createDirAsync(this.ProjectAbsolutePath);
    }
  }

  /**
   * @description Method for checking if agent directory exists
   */
  async _checkIfAgentDirExists() {
    return checkIfDirectoryExistsAsync(this.AgentDirPath);
  }

  async _createAgentDirIfNotExists() {
    let dirExists = await this._checkIfAgentDirExists();
    if (!dirExists) {
      return createDirAsync(this.AgentDirPath);
    }
  }

  /**
   * @description Method for checking if agent directory exists
   */
  async _checkIfEventLogDirExists() {
    return checkIfDirectoryExistsAsync(this.EventLogDirPath);
  }

  async _createEventLogDirIfNotExists() {
    let dirExists = await this._checkIfEventLogDirExists();
    if (!dirExists) {
      return createDirAsync(this.EventLogDirPath);
    }
  }

  /**
   * @description Method for getting absolute path to device file based on its id
   * @param {string} deviceId id of device
   */
  _getDeviceFilePath(deviceId) {
    return path.join(
      this.DeviceDirPath,
      ProjectContentManager._getDeviceFileName(deviceId)
    );
  }

  /**
   * @description Method for getting device id based on its file name
   * @param {string} fileName device file name
   */
  _getDeviceIdFromFileName(fileName) {
    return fileName.replace(".json", "");
  }

  /**
   * @description Method for getting all devices ids, whose files are stored inside device directory
   */
  async _getAllDeviceIdsFromDir() {
    let ids = [];

    let dirExists = await checkIfDirectoryExistsAsync(this.DeviceDirPath);
    if (!dirExists) return ids;

    let files = await readDirAsync(this.DeviceDirPath);
    if (!files) return ids;

    for (let fileName of files) {
      let deviceId = this._getDeviceIdFromFileName(fileName);
      ids.push(deviceId);
    }

    return ids;
  }

  /**
   * @description Method for checking if device directory already exists
   */
  async _checkIfDeviceDirExists() {
    return checkIfDirectoryExistsAsync(this.DeviceDirPath);
  }

  /**
   * @description Method for clearing content of device directory
   */
  async _clearDeviceDir() {
    let dirExists = await this._checkIfDeviceDirExists();
    //Clearing only if device dir exists
    if (dirExists) {
      return clearDirectoryAsync(this.DeviceDirPath);
    }
  }

  /**
   * @description Method for creating device directory if it doesn't exist
   */
  async _createDeviceDirIfNotExists() {
    let dirExists = await this._checkIfDeviceDirExists();
    if (!dirExists) {
      return createDirAsync(this.DeviceDirPath);
    }
  }

  /**
   * @description Method for checking if config file already exists
   */
  async _checkIfConfigFileExists() {
    return checkIfFileExistsAsync(this.ConfigFilePath);
  }

  /**
   * @description Method for checking content of config file
   * @param {Object} content Content of config file
   */
  _checkConfigFileContent(content) {
    if (!content) throw new Error("Content of config file cannot be empty!");
    if (!content.swVersion)
      throw new Error("Software version in config file cannot be empty!");
    if (!content.users) throw new Error("Users cannot be empty!");
    if (!content.privateKey) throw new Error("Private key cannot be empty!");

    //Checking if app version is equal to project version
    if (content.swVersion !== getCurrentAppVersion())
      throw new Error(
        `Software version in config file: ${
          content.swVersion
        } is not equal to application version ${getCurrentAppVersion()}!`
      );
  }

  _generateAndAssignNewPrivateKey() {
    this.Project.PrivateKey = mongoose.Types.ObjectId().toHexString();
  }

  /**
   * @description Method for getting content of config file based on current project
   */
  _getConfigFileContentFromProject() {
    return {
      swVersion: getCurrentAppVersion(),
      users: this._generateUsersObjectFromProject(),
      privateKey: this.Project.PrivateKey
    };
  }

  /**
   * @description Method for generating array containg payloads of all users
   */
  _generateUsersObjectFromProject() {
    let objectToReturn = [];
    let allUsers = Object.values(this.Project.Users);

    for (let user of allUsers) {
      objectToReturn.push(user.Payload);
    }

    return objectToReturn;
  }

  /**
   * @description Method for generating users from config file users object
   */
  async _generateUsersFromFileContent(usersObject) {
    if (!usersObject) throw new Error("Users in device cannot be undefined!");

    let objectToReturn = [];

    for (let userObject of usersObject) {
      try {
        let user = new User(this.Project);
        await user.init(userObject, true);
        objectToReturn.push(user);
      } catch (err) {
        logger.error(err.message, err);
      }
    }

    return objectToReturn;
  }

  /**
   * @description Method for getting content of config file based on config file content
   */
  async _getConfigFileContentFromFile() {
    let fileContent = await readFileAsync(this.ConfigFilePath);
    return JSON.parse(fileContent);
  }

  /**
   * @description Method for writing content of config file based on
   * @param {object} configFileContent Content to be written
   */
  async _saveConfigFileContentToFile(configFileContent) {
    return writeFileAsync(this.ConfigFilePath, configFileContent);
  }

  /**
   * @description Method for loading config file content to project
   */
  async loadConfigFile() {
    let jsonFileContent = await this._getConfigFileContentFromFile();

    this._checkConfigFileContent(jsonFileContent);

    this.Project.SWVersion = jsonFileContent.swVersion;

    let users = await this._generateUsersFromFileContent(jsonFileContent.users);

    for (let user of users) {
      this.Project.Users[user.Login] = user;
    }

    this.Project.PrivateKey = jsonFileContent.privateKey;
  }

  /**
   * @description Method for saving config file content to config file
   */
  async saveConfigFile() {
    let jsonFileContent = this._getConfigFileContentFromProject();
    let stringFileContent = JSON.stringify(jsonFileContent);

    return this._saveConfigFileContentToFile(stringFileContent);
  }

  /**
   * @description Method for checking content of device
   * @param {object} content Content of device to be set
   */
  _checkDeviceFileContent(content) {
    if (!content) throw new Error("Content of device file cannot be empty!");
    if (!content.id) throw new Error("id in device file cannot be empty!");
    if (!content.type) throw new Error("type in device file cannot be empty!");

    if (this.Project.CommInterface.doesDeviceExist(content.id)) {
      throw new Error(`Device of given id ${content.id} already exists!`);
    }
  }

  /**
   * @description Method for getting content of device file from project
   * @param {string} deviceId device id
   */
  _getDeviceFileContentFromProject(deviceId) {
    let device = this.Project.CommInterface.getDevice(deviceId);
    return device.Payload;
  }

  /**
   * @description Method for getting device file content from its file
   * @param {string} deviceId device id
   */
  async _getDeviceFileContentFromFile(deviceId) {
    let deviceFilePath = this._getDeviceFilePath(deviceId);
    let fileContent = await readFileAsync(deviceFilePath);
    return JSON.parse(fileContent);
  }

  /**
   * @description Method for saving device file content from project to path
   * @param {string} deviceId Device id
   * @param {object} deviceFileContent Content of device
   */
  async _saveDeviceFileContentToFile(deviceId, deviceFileContent) {
    let deviceFilePath = this._getDeviceFilePath(deviceId);
    return writeFileAsync(deviceFilePath, deviceFileContent);
  }

  /**
   * @description Method for loading device file content to project
   * @param {string} deviceId device id
   */
  async _loadDeviceFile(deviceId) {
    let jsonFileContent = await this._getDeviceFileContentFromFile(deviceId);

    this._checkDeviceFileContent(jsonFileContent);

    return this.Project.CommInterface.createNewDevice(jsonFileContent);
  }

  /**
   * @description Method for saving device content from project to file
   * @param {string} deviceId
   */
  async _saveDeviceFile(deviceId) {
    await this._createDeviceDirIfNotExists();

    let jsonFileContent = this._getDeviceFileContentFromProject(deviceId);
    let stringFileContent = JSON.stringify(jsonFileContent);

    return this._saveDeviceFileContentToFile(deviceId, stringFileContent);
  }

  /**
   * @description Method for deleting device file
   * @param {string} deviceId
   */
  async _deleteDeviceFile(deviceId) {
    await this._createDeviceDirIfNotExists();

    let deviceFilePath = this._getDeviceFilePath(deviceId);
    return unlinkAnsync(deviceFilePath);
  }

  /**
   * @description Method for getting (creating) payload of whole commInterface based on device files content
   */
  async _getInitialPayloadFromFiles() {
    let initialPayload = {};

    let allIds = await this._getAllDeviceIdsFromDir();

    for (let id of allIds) {
      try {
        let jsonFileContent = await this._getDeviceFileContentFromFile(id);
        this._checkDeviceFileContent(jsonFileContent);
        initialPayload[id] = jsonFileContent;
      } catch (err) {
        logger.error(err.message, err);
      }
    }

    return initialPayload;
  }

  /**
   * @description Method for saving device content to file
   * @param {string} deviceId
   */
  async saveDevice(deviceId) {
    return this._saveDeviceFile(deviceId);
  }

  /**
   * @description Method for saving device content to file
   * @param {string} deviceId
   */
  async deleteDevice(deviceId) {
    return this._deleteDeviceFile(deviceId);
  }

  /**
   * @description Method for loading device content from file
   * @param {string} deviceId device id
   */
  async loadDevice(deviceId) {
    return this._loadDeviceFile(deviceId);
  }

  /**
   * @description Method for saving all devices content to their files
   */
  async saveAllDevices() {
    await this._clearDeviceDir();

    let allIds = Object.keys(this.Project.CommInterface.Devices);
    for (let id of allIds) {
      try {
        await this.saveDevice(id);
      } catch (err) {
        logger.error(err.message, err);
      }
    }
  }

  /**
   * @description Method for loading all devices from project files
   */
  async loadAllDevices() {
    let allIds = await this._getAllDeviceIdsFromDir();
    for (let id of allIds) {
      try {
        await this.loadDevice(id);
      } catch (err) {
        logger.error(err.message, err);
      }
    }
  }

  /**
   * @description Method for loading project content from files
   */
  async loadProject() {
    await this.loadConfigFile();
    await this.loadAllDevices();
  }

  /**
   * @description Method for saving project content to files
   */
  async saveProject() {
    await this.saveConfigFile();
    await this.saveAllDevices();
  }

  /**
   * @description Method for creating empty project
   */
  async createEmptyProject() {
    this._generateAndAssignNewPrivateKey();
    await this._createProjectDirIfNotExists();
    await this._createAgentDirIfNotExists();
    await this._createEventLogDirIfNotExists();
    await this.saveConfigFile();
    await this._createDeviceDirIfNotExists();
    await this._createDefaultUser();
  }

  /**
   * @description Method for initializing project content from files or
   */
  async initFromFiles() {
    let configFileExists = await this._checkIfConfigFileExists();

    if (configFileExists) {
      //Project exists
      await this.loadConfigFile();
      let initialPayload = await this._getInitialPayloadFromFiles();
      return this.Project.CommInterface.init(initialPayload);
    } else {
      //Project does not exist
      await this.createEmptyProject();
      return this.Project.CommInterface.init();
    }
  }

  /**
   * @description Method for creating default user
   */
  async _createDefaultUser() {
    return this.Project.createUser(this._getDefaultUserPayload());
  }

  /**
   * @description Method for generating payload of default user
   */
  _getDefaultUserPayload() {
    return {
      login: "admin",
      password: "admin",
      permissions: 15,
      lang: "pl"
    };
  }
}

module.exports = ProjectContentManager;
