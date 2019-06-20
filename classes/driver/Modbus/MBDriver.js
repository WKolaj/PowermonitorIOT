const ModbusRTU = require("modbus-serial");
const logger = require("../../../logger/logger");

class MBDriver {
  /**
   * @description Modbus driver based on modbus-serial npm package
   * @param {string} ipAdress ipAdress
   * @param {string} portNumber port number
   * @param {number} timeout timeout in ms
   */
  constructor(
    mbDevice,
    ipAdress = "192.168.0.100",
    portNumber = 502,
    timeout = 2000,
    unitId = 1
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
    this._mbDevice = mbDevice;
    this._ipAdress = ipAdress;
    this._portNumber = portNumber;
    this._timeout = timeout;
    this._client = new ModbusRTU();
    this._unitId = unitId;

    //Determining if driver is busy - while invoking action
    this._busy = false;

    //Determining if driver is active - enabled to connect and exchange data
    this._active = false;
  }

  /**
   * @description MBDevice associated with driver
   */
  get MBDevice() {
    return this._mbDevice;
  }

  /**
   * @description IPAdress used by driver
   */
  get IPAdress() {
    return this._ipAdress;
  }

  /**
   * @description PortNumber used by driver
   */
  get PortNumber() {
    return this._portNumber;
  }

  /**
   * @description Timeout of driver
   */
  get Timeout() {
    return this._timeout;
  }

  /**
   * @description Default unit ID used by driver
   */
  get UnitId() {
    return this._unitId;
  }

  /**
   * @description Is device connected?
   */
  get Connected() {
    return this._client.isOpen;
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
   * @description Creating action for getting data from MB Device
   * @param {number} fcCode Modbus function code
   * @param {number} offset Data offset
   * @param {number} length Data length
   * @param {number} unitId unit ID
   */
  createGetDataAction(fcCode, offset, length, unitId) {
    unitId = unitId || this._unitId;
    return () => this._getData(fcCode, offset, length, unitId);
  }

  /**
   * @description Creating action for writing data from MB Device
   * @param {string} name Name of action
   * @param {number} fcCode Modbus function code
   * @param {number} offset Data offset
   * @param {number} value value to set
   * @param {number} unitId unit ID
   */
  createSetDataAction(fcCode, offset, value, unitId) {
    unitId = unitId || this._unitId;
    return () => this._setData(fcCode, offset, value, unitId);
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
   * @param {number} fcCode Modbus function code
   * @param {number} offset Data offset
   * @param {number} length Data length
   * @param {number} unitId Unit ID
   */
  _getData(fcCode, offset, length, unitId) {
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
        //Setting unitId
        this._client.setID(unitId);

        //Reading data depending on MB function
        let data = null;
        switch (fcCode) {
          case 1: {
            data = await this._client.readCoils(offset, length);
            break;
          }
          case 2: {
            data = await this._client.readDiscreteInputs(offset, length);
            break;
          }
          case 3: {
            data = await this._client.readHoldingRegisters(offset, length);
            break;
          }
          case 4: {
            data = await this._client.readInputRegisters(offset, length);
            break;
          }
          default: {
            //If wrong function number was given
            return reject(
              new Error(`Invalid function MB read function number: ${fcCode}`)
            );
          }
        }

        //Data has been read successfuly - resolve promise

        //Clear timeout and resolve promise
        clearTimeout(handle);
        return resolve(data.data);
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
   * @param {number} fcCode Modbus function code
   * @param {number} offset Data offset
   * @param {number} value New value
   * @param {number} unitId Unit ID
   */
  _setData(fcCode, offset, value, unitId) {
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

      try {
        //Setting unitId
        this._client.setID(unitId);

        //Writing data depending on MB function
        switch (fcCode) {
          case 15: {
            await this._client.writeCoils(offset, value);
            break;
          }
          case 16: {
            await this._client.writeRegisters(offset, value);
            break;
          }
          default: {
            //If wrong function number was given
            return reject(
              new Error(`Invalid function MB write function number: ${fcCode}`)
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
        await this._client.connectTCP(this._ipAdress, {
          port: this._portNumber
        });

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

module.exports = MBDriver;
