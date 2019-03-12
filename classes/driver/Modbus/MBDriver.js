const ModbusRTU = require("modbus-serial");

class MBDriver {
  /**
   * @description Modbus driver based on modbus-serial npm package
   * @param {string} ipAdress ipAdress
   * @param {string} portNumber port number
   * @param {number} unitId port number
   * @param {number} timeout timeout in ms
   */
  constructor(ipAdress, portNumber = 502, unitId = 1, timeout = 2000) {
    //Binding methods to driver object
    this._getData = this._getData.bind(this);
    this._disconnectWithoutDeactive = this._disconnectWithoutDeactive.bind(
      this
    );
    this._connectWithoutActivating = this._connectWithoutActivating.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.connect = this.connect.bind(this);
    this.addAction = this.addAction.bind(this);
    this.addGetDataAction = this.addGetDataAction.bind(this);
    this.invokeActions = this.invokeActions.bind(this);

    //Setting default values
    this._ipAdress = ipAdress;
    this._portNumber = portNumber;
    this._unitId = unitId;
    this._timeout = timeout;
    this._client = new ModbusRTU();
    this._actions = {};

    //Determining if driver is busy
    this._busy = false;

    //Determining if driver is active

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

  addAction(id, action) {
    this._actions[id] = action;
  }

  addGetDataAction(id, fcCode, offset, length) {
    this.addAction(id, () => this._getData(fcCode, offset, length));
  }

  invokeActions() {
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
        let allIds = Object.keys(this._actions);

        for (let id of allIds) {
          try {
            console.log(`Invoking ${id}`);
            data[id] = await this._actions[id]();
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
        //Setting id to device
        await this._client.setID(this._unitId);
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
