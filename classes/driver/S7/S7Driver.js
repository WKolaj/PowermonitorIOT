const S7AsyncClient = require("./S7AsyncClient");
const { exists, snooze } = require("../../../utilities/utilities");
const logger = require("../../../logger/logger");

class S7Driver {
  /**
   * @description S7 driver based on modbus-serial npm package
   * @param {object} s7Device s7 device
   * @param {string} ipAdress ipAdress
   * @param {number} rack rack number
   * @param {number} slot slot number
   */
  constructor(
    s7Device,
    ipAdress = "192.168.0.100",
    rack = 0,
    timeout = 2000,
    slot = 1
  ) {
    //Binding methods to driver object
    this._getData = this._getData.bind(this);
    this._disconnectWithoutDeactive = this._disconnectWithoutDeactive.bind(
      this
    );
    this._connectWithoutActivating = this._connectWithoutActivating.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.connect = this.connect.bind(this);
    this.createGetDataAction = this.createGetDataAction.bind(this);
    this.invokeRequests = this.invokeRequests.bind(this);

    //Setting default values
    this._s7Device = s7Device;
    this._ipAdress = ipAdress;
    this._rack = rack;
    this._timeout = timeout;
    this._client = new S7AsyncClient();
    this._slot = slot;

    //Determining if driver is busy - while invoking action
    this._busy = false;

    //Determining if driver is active - enabled to connect and exchange data
    this._active = false;
  }

  /**
   * @description S7Device associated with driver
   */
  get S7Device() {
    return this._s7Device;
  }

  /**
   * @description IPAdress used by driver
   */
  get IPAdress() {
    return this._ipAdress;
  }

  /**
   * @description Slot number used by driver
   */
  get Slot() {
    return this._slot;
  }

  /**
   * @description Timeout of driver
   */
  get Timeout() {
    return this._timeout;
  }

  /**
   * @description Default Rack used by driver
   */
  get Rack() {
    return this._rack;
  }

  /**
   * @description Is device connected?
   */
  get Connected() {
    return this._client.Connected;
  }

  /**
   * @description Is device active? this means, if driver is enabled to exchange data
   */
  get IsActive() {
    return this._active;
  }

  /**
   * @description Is device busy? this means, if driver is while invoking actions
   */
  get IsBusy() {
    return this._busy;
  }

  /**
   * @description Creating action for getting data from S7 Device
   * @param {string} areaType S7 area type
   * @param {number} offset Data offset
   * @param {number} length Data length
   * @param {number} dbNumber db number
   */
  createGetDataAction(areaType, offset, length, dbNumber = 0) {
    return () => this._getData(areaType, offset, length, dbNumber);
  }

  /**
   * @description Creating action for writing data from S7 Device
   * @param {string} areaType S7 area type
   * @param {number} offset Data offset
   * @param {number} value new value
   * @param {number} length length of variable
   * @param {number} dbNumber db number
   */
  createSetDataAction(areaType, offset, value, length, dbNumber = 0) {
    return () => this._setData(areaType, offset, value, length, dbNumber);
  }

  /**
   * @description Invoking modbus requests
   * @param {object} requests Requests to invoke
   */
  invokeRequests(requests) {
    return new Promise(async (resolve, reject) => {
      //Invoking actions only if active
      if (!this._active) {
        return reject(new Error("Device is not active"));
      }

      if (!this._busy) {
        this._busy = true;

        let data = {};

        for (let request of requests) {
          try {
            //Automatically fetching request data
            let responseData = await request.Action();
            request.setResponseData(responseData);

            data[request.RequestId] = responseData;
          } catch (err) {
            this._busy = false;
            return reject(err);
          }
        }
        this._busy = false;
        return resolve(data);
      } else {
        //If device is busy - resolve with
        return reject(new Error("Device is busy..."));
      }
    });
  }

  /**
   * @description Creating action for reading data from device
   * @param {number} areaType S7 area type
   * @param {number} offset Data offset
   * @param {number} length Data length
   * @param {number} dbNumber dbNumber
   */
  _getData(areaType, offset, length, dbNumber = 0) {
    //Reading asynchronously - returing Promise
    return new Promise(async (resolve, reject) => {
      //Invoking actions only if active
      if (!this._active) {
        return reject(new Error("Device is not active"));
      }

      //If device is disconnected - attempt to connect before reading
      if (!this.Connected) {
        try {
          //Attempting to connect...
          await this._connectWithoutActivating();
        } catch (err) {
          //Reject promise if connecting fails...
          return reject(err);
        }
      }

      //Setting timeout - disconnect device and reject promise if driver was unable to get data in time
      let handle = setTimeout(() => {
        this._disconnectWithoutDeactive();
        return reject(new Error("Reading data timeout error..."));
      }, this._timeout);

      try {
        //Reading data depending on MB function
        let data = null;
        switch (areaType) {
          case "I": {
            data = await this._client.EBRead(offset, length);
            break;
          }
          case "Q": {
            data = await this._client.ABRead(offset, length);
            break;
          }
          case "M": {
            data = await this._client.MBRead(offset, length);
            break;
          }
          case "DB": {
            data = await this._client.DBRead(dbNumber, offset, length);
            break;
          }
          default: {
            //If wrong function number was given
            return reject(
              new Error(`Invalid area S7 read function number: ${areaType}`)
            );
          }
        }

        //Data has been read successfuly - resolve promise

        let arrayData = exists(data) ? [...data] : data;

        //Clear timeout and resolve promise
        clearTimeout(handle);

        return resolve(arrayData);
      } catch (err) {
        //An error occured durring reading
        //Clear timeout and reject promise
        clearTimeout(handle);
        this._disconnectWithoutDeactive();
        return reject(err);
      }
    });
  }

  /**
   * @description Creating action for writing data from device
   * @param {number} areaType S7 area type
   * @param {number} offset Data offset
   * @param {number} value new value
   * @param {number} length length of variable
   * @param {number} dbNumber db number
   */
  _setData(areaType, offset, value, length, dbNumber = 0) {
    //Reading asynchronously - returing Promise
    return new Promise(async (resolve, reject) => {
      //Invoking actions only if active
      if (!this._active) {
        return reject(new Error("Device is not active"));
      }

      //If device is disconnected - attempt to connect before reading
      if (!this.Connected) {
        try {
          //Attempting to connect...
          await this._connectWithoutActivating();
        } catch (err) {
          //Reject promise if connecting fails...
          return reject(err);
        }
      }

      //Setting timeout - disconnect device and reject promise if driver was unable to set data in time
      let handle = setTimeout(() => {
        this._disconnectWithoutDeactive();
        return reject(new Error("Writing data timeout error..."));
      }, this._timeout);

      let bufferedValue = Buffer.from(value);

      try {
        switch (areaType) {
          case "I": {
            await this._client.EBWrite(offset, length, bufferedValue);
            break;
          }
          case "Q": {
            await this._client.ABWrite(offset, length, bufferedValue);
            break;
          }
          case "M": {
            await this._client.MBWrite(offset, length, bufferedValue);
            break;
          }
          case "DB": {
            await this._client.DBWrite(dbNumber, offset, length, bufferedValue);
            break;
          }
          default: {
            //If wrong function number was given
            return reject(
              new Error(`Invalid area S7 read function number: ${areaType}`)
            );
          }
        }

        //Data has been read successfuly - resolve promise

        //Clear timeout and resolve promise
        clearTimeout(handle);
        return resolve(value);
      } catch (err) {
        //An error occured durring reading
        //Clear timeout and reject promise
        clearTimeout(handle);
        this._disconnectWithoutDeactive();
        return reject(err);
      }
    });
  }

  /**@description Connecting to modbus device without activating */
  _connectWithoutActivating() {
    //Connecting asynchronously - using Promise
    return new Promise(async (resolve, reject) => {
      //Connecting only if active
      if (!this._active) {
        return reject(new Error("Device is not active"));
      }

      //Attempting to connect
      //Setting timeout - if device is unable to connect in time
      let handle = setTimeout(() => {
        //If device is unable to connect in time - disconnect device an reject promise
        this._disconnectWithoutDeactive();
        return reject(new Error("Connection timeout error..."));
      }, this._timeout);

      try {
        //Connecting to device
        await this._client.connectTCP(this._ipAdress, this._rack, this._slot);

        //Connected successfully - clear timeout and resolve the promise
        clearTimeout(handle);

        return resolve(true);
      } catch (err) {
        //Error while connecting
        clearTimeout(handle);
        return reject(err);
      }
    });
  }

  /**@description Connecting to modbus device */
  connect() {
    return new Promise(async (resolve, reject) => {
      try {
        //Activating driver
        this._active = true;

        //Reseting busy state
        this._busy = false;

        //Connecting to device
        await this._connectWithoutActivating();

        return resolve(true);
      } catch (err) {
        logger.error(err.message, err);
        return resolve(false);
      }
    });
  }

  /**@description Disconnecting from modbus device without deactivating driver */
  _disconnectWithoutDeactive() {
    return this._client.close();
  }

  /**@description Disconnecting from modbus device */
  disconnect() {
    return new Promise(async (resolve, reject) => {
      try {
        //Deactivating driver
        this._active = false;

        //Reseting busy state
        this._busy = false;

        //Disconnecting from device
        await this._disconnectWithoutDeactive();

        return resolve(true);
      } catch (err) {
        logger.error(err.message, err);
        return resolve(false);
      }
    });
  }
}

module.exports = S7Driver;
