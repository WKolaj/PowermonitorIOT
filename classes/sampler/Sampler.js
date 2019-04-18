const EventEmitter = require("events");

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

      //Refreshing all devices
      await this._refreshAllDevices(tickNumber);

      //emiting tick event
      this.Events.emit("OnTick", [tickNumber]);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * @description Refreshing all devices
   * @param {number} tickNumber Actual tick number
   */
  async _refreshAllDevices(tickNumber) {
    let refreshPromises = [];

    let allDeviceNames = Object.keys(this.AllDevices);

    for (let deviceName of allDeviceNames) {
      let newPromise = new Promise(async (resolve, reject) => {
        try {
          await this.AllDevices[deviceName].refresh(tickNumber);
          resolve(true);
        } catch (err) {
          resolve(err);
        }
      });
      refreshPromises.push(newPromise);
    }
    await Promise.all(refreshPromises);
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
   * @description Converting time sample to TickId
   * @param {number} timeSample Sample time
   */
  static convertTimeSampleToTickId(timeSample) {
    return timeSample;
  }

  /**
   * @description Converting tick id to time sample
   * @param {number} tickId Tick id
   */
  static convertTickIdToTimeSample(tickId) {
    return tickId;
  }
}

module.exports = Sampler;
