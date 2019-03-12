const ModbusRTU = require("modbus-serial");

class MBDriver {
  /**
   * @description Modbus driver based on modbus-serial npm package
   * @param {string} ipAdress ipAdress
   * @param {string} portNumber port number
   * @param {number} timeout timeout in ms
   */
  constructor(
    mbDevice,
    ipAdress,
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
    this.invokeActions = this.invokeActions.bind(this);

    //Setting default values
    this._mbDevice = mbDevice;
    this._ipAdress = ipAdress;
    this._portNumber = portNumber;
    this._timeout = timeout;
    this._client = new ModbusRTU();
    this._actions = {};
    this._unitId = unitId;

    //Determining if driver is busy - while invoking action
    this._busy = false;

    //Determining if driver is active - enabled to connect and exchange data
    this._active = false;
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
   * @description Creating action for getting data from MB Device
   * @param {number} fcCode Modbus function code
   * @param {number} offset Data offset
   * @param {number} timeout Data length
   */
  createGetDataAction(fcCode, offset, length) {
    return () => this._getData(fcCode, offset, length);
  }

  /**
   * @description Creating action for writing data from MB Device
   * @param {number} fcCode Modbus function code
   * @param {number} offset Data offset
   * @param {number} value value to set
   */
  createSetDataAction(fcCode, offset, value) {
    return () => this._setData(fcCode, offset, value);
  }

  /**
   * @description Invoking exchange data actions
   * @param {object} actions Actions to invoke
   */
  invokeActions(actions) {
    return new Promise(async (resolve, reject) => {
      //Invoking actions only if active
      if (!this._active) {
        return reject(new Error("Device is not active"));
      }

      console.log(`busy: ${this._busy}`);
      if (!this._busy) {
        this._busy = true;

        console.log("Invoking actions");
        let data = {};
        let allIds = Object.keys(actions);

        for (let id of allIds) {
          try {
            console.log(`Invoking ${id}`);
            data[id] = await actions[id]();
            console.log(`Invoke result: ${data[id]}`);
          } catch (err) {
            console.log(err.message);
            this._busy = false;
            console.log(`rejecting action...  ${id}`);
            return reject(err);
          }
        }

        this._busy = false;
        return resolve(data);
      }
    });
  }

  /**
   * @description Creating action for reading data from device
   * @param {number} fcCode Modbus function code
   * @param {number} offset Data offset
   * @param {number} length Data length
   */
  _getData(fcCode, offset, length) {
    //Reading asynchronously - returing Promise
    return new Promise(async (resolve, reject) => {
      //Invoking actions only if active
      if (!this._active) {
        return reject(new Error("Device is not active"));
      }

      console.log("Attempting to read..");

      //If device is disconnected - attempt to connect before reading
      if (!this.Connected) {
        console.log("Device is disconnected!");

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
        console.log("Reading data timeout!");

        this._disconnectWithoutDeactive();
        return reject(new Error("Reading data timeout error..."));
      }, this._timeout);

      try {
        //Setting unitId
        this._client.setID(this._unitId);

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
            console.log(`Invalid function MB read function number: ${fcCode}`);
            return reject(
              new Error(`Invalid function MB read function number: ${fcCode}`)
            );
          }
        }

        //Data has been read successfuly - resolve promise
        console.log("Data read successfully!");

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
   */
  _setData(fcCode, offset, value) {
    //Reading asynchronously - returing Promise
    return new Promise(async (resolve, reject) => {
      //Invoking actions only if active
      if (!this._active) {
        return reject(new Error("Device is not active"));
      }

      console.log("Attempting to write..");

      //If device is disconnected - attempt to connect before reading
      if (!this.Connected) {
        console.log("Device is disconnected!");

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
        console.log("Writing data timeout!");

        this._disconnectWithoutDeactive();
        return reject(new Error("Writing data timeout error..."));
      }, this._timeout);

      try {
        //Setting unitId
        this._client.setID(this._unitId);

        //Writing data depending on MB function
        switch (fcCode) {
          case 5: {
            await this._client.writeCoils(offset, value);
            break;
          }
          case 15: {
            await this._client.writeCoils(offset, value);
            break;
          }
          case 16: {
            await this._client.writeRegisters(offset, value);
            break;
          }
          case 6: {
            await this._client.writeRegister(offset, value);
            break;
          }
          default: {
            //If wrong function number was given
            console.log(`Invalid function MB write function number: ${fcCode}`);
            return reject(
              new Error(`Invalid function MB write function number: ${fcCode}`)
            );
          }
        }

        //Data has been read successfuly - resolve promise
        console.log("Data written successfully!");

        //Clear timeout and resolve promise
        clearTimeout(handle);
        return resolve();
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
      console.log("attempting to connect....");

      //Setting timeout - if device is unable to connect in time
      let handle = setTimeout(() => {
        console.log("connecting timeout!");

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
        console.log("Connected successfully!");
        clearTimeout(handle);
        return resolve(true);
      } catch (err) {
        //Error while connecting
        console.log(`Error while connecting:${err.message}`);
        clearTimeout(handle);
        return reject(err);
      }
    });
  }

  /**@description Connecting to modbus device */
  connect() {
    //Activating driver
    this._active = true;

    //Reseting busy state
    this._busy = false;

    //Connecting to device
    this._connectWithoutActivating();
  }

  /**@description Disconnecting from modbus device without deactivating driver */
  _disconnectWithoutDeactive() {
    //Disconnect only i_disconnectWithoutResetingBusyStatef connected
    if (this.Connected) {
      console.log("Disconnecting device");
      return this._client.close();
    }
  }

  /**@description Disconnecting from modbus device */
  disconnect() {
    //Deactivating driver
    this._active = false;

    //Reseting busy state
    this._busy = false;

    //Disconnecting from device
    this._disconnectWithoutDeactive();
  }
}

module.exports = MBDriver;
