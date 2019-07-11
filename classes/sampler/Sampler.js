const EventEmitter = require("events");
const logger = require("../../logger/logger");

class Sampler {
  /**
   * @description Class representing whole app time sampler
   */
  constructor() {
    this._tickHandler = null;
    this._devices = {};
    this._lastTickTimeNumber = 0;
    this._events = new EventEmitter();
    this._active = false;
    this._tickInterval = 100;
  }

  /**
   * @description Is sampler active
   */
  get Active() {
    return this._active;
  }

  /**
   * @description Last operation TickNumber
   */
  get LastTickTimeNumber() {
    return this._lastTickTimeNumber;
  }

  /**
   * @description Events associated with sampler
   */
  get Events() {
    return this._events;
  }

  /**
   * @description All devices connected to sampler
   */
  get AllDevices() {
    return this._devices;
  }

  /**
   * @description Method called every tick of Interval handler
   */
  _tick() {
    //Invoking only if sampler is active
    if (this.Active) {
      let tickNumber = Sampler.convertDateToTickNumber(Date.now());
      if (this._shouldEmitTick(tickNumber)) {
        this._emitTick(tickNumber);
      }
    }
  }

  /**
   * @description Method for starting sampling of sampler
   */
  start() {
    if (!this.Active) {
      this._tickHandler = setInterval(() => this._tick(), this._tickInterval);
      this._active = true;
    }
  }

  /**
   * @description Method for stopaping
   */
  stop() {
    clearInterval(this._tickHandler);
    this._tickHandler = null;
    this._active = false;
  }

  /**
   * @description Solving emiting tick
   * @param {number} tickNumber Actual tick number
   */
  async _emitTick(tickNumber) {
    try {
      //setting last tick number to actual
      this._lastTickTimeNumber = tickNumber;

      //Refreshing all normal devices
      await this._refreshAllNormalDevices(tickNumber);

      //Refreshing all speical devices - after refreshing normal ones
      await this._refreshAllSpecialDevices(tickNumber);

      //emiting tick event
      this.Events.emit("OnTick", [tickNumber]);
    } catch (err) {
      logger.error(err.message, err);
    }
  }

  getNormalDevices() {
    return Object.values(this.AllDevices).filter(device => !device.isSpecial());
  }

  getSpecialDevices() {
    return Object.values(this.AllDevices).filter(device => device.isSpecial());
  }

  getRefreshGroupsFromNormalDevices() {
    let groupsToReturn = {};
    //Refreshing only normal devices - special devices will be refreshed later
    let allNormalDevices = this.getNormalDevices();

    for (let device of allNormalDevices) {
      let refreshGroupId = device.getRefreshGroupId();

      //Creating new empty group if not exist
      if (!(refreshGroupId in groupsToReturn))
        groupsToReturn[refreshGroupId] = [];

      //Assigning device to group
      groupsToReturn[refreshGroupId].push(device);
    }

    return groupsToReturn;
  }

  getRefreshGroupsFromSpecialDevices() {
    let groupsToReturn = {};
    let allSpecialDevices = this.getSpecialDevices();

    for (let device of allSpecialDevices) {
      let refreshGroupId = device.getRefreshGroupId();

      //Creating new empty group if not exist
      if (!(refreshGroupId in groupsToReturn))
        groupsToReturn[refreshGroupId] = [];

      //Assigning device to group
      groupsToReturn[refreshGroupId].push(device);
    }

    return groupsToReturn;
  }

  /**
   * @description Refreshing all normal devices
   * @param {number} tickNumber Actual tick number
   */
  async _refreshAllNormalDevices(tickNumber) {
    let refreshGroups = this.getRefreshGroupsFromNormalDevices();
    let refreshPromises = [];
    let groupIds = Object.keys(refreshGroups);

    for (let groupId of groupIds) {
      let newPromise = new Promise(async (resolve, reject) => {
        let refreshResult = {};

        for (let device of refreshGroups[groupId]) {
          try {
            await device.refresh(tickNumber);
            refreshResult[device.Id] = true;
          } catch (err) {
            refreshResult[device.Id] = err;
          }
        }

        return resolve(refreshResult);
      });

      refreshPromises.push(newPromise);
    }

    return Promise.all(refreshPromises);
  }

  /**
   * @description Refreshing all normal devices
   * @param {number} tickNumber Actual tick number
   */
  async _refreshAllSpecialDevices(tickNumber) {
    let refreshGroups = this.getRefreshGroupsFromSpecialDevices();
    let refreshPromises = [];
    let groupIds = Object.keys(refreshGroups);

    for (let groupId of groupIds) {
      let newPromise = new Promise(async (resolve, reject) => {
        let refreshResult = {};

        for (let device of refreshGroups[groupId]) {
          try {
            await device.refresh(tickNumber);
            refreshResult[device.Id] = true;
          } catch (err) {
            refreshResult[device.Id] = err;
          }
        }

        return resolve(refreshResult);
      });

      refreshPromises.push(newPromise);
    }

    return Promise.all(refreshPromises);
  }
  /**
   * @description Adding new device to the sampler
   * @param {object} device Device to be added
   */
  addDevice(device) {
    this.AllDevices[device.Id] = device;
  }

  /**
   * @description Removing new device to the sampler
   * @param {object} device Device to be removed
   */
  removeDevice(device) {
    if (!this.AllDevices[device.Id])
      throw new Error(`There is no such device as ${device.Id}`);
    delete this.AllDevices[device.Id];
  }

  /**
   * @description Should tick be emitted based on last tick time?
   * @param {number} tickNumber Actual tick time
   */
  _shouldEmitTick(tickNumber) {
    return tickNumber !== this._lastTickTimeNumber;
  }

  /**
   * @description Doest TickId matches actual tick?
   * @param {number} tickNumber Actual tick
   * @param {number} tickId TickId to be checked
   */
  static doesTickIdMatchesTick(tickNumber, tickId) {
    return tickNumber % tickId === 0;
  }

  /**
   * @description Converting date to tick number
   * @param {number} date Date to be converted
   */
  static convertDateToTickNumber(date) {
    return Math.round(date / 1000);
  }

  /**
   * @description Converting tick number to date
   * @param {number} tickNumber tick to be converted
   */
  static convertTickNumberToDate(tickNumber) {
    return new Date(tickNumber * 1000);
  }

  /**
   * @description Converting time sample to TickId
   * @param {number} sampleTime Sample time
   */
  static convertSampleTimeToTickId(sampleTime) {
    return sampleTime;
  }

  /**
   * @description Converting tick id to time sample
   * @param {number} tickId Tick id
   */
  static convertTickIdToSampleTime(tickId) {
    return tickId;
  }
}

module.exports = Sampler;
