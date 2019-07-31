const { exists, snooze } = require("../utilities/utilities");

class FakeS7Client {
  constructor() {
    let self = this;
    //delay of answering in ms
    this.timeDelay = 5;

    this._connected = false;

    this.ConnectTo = jest.fn(async (ip, rack, slot, callback) => {
      await snooze(this.timeDelay);
      this._connected = true;
      await callback();
    });

    this.Disconnect = jest.fn(() => {
      this._connected = false;
      return true;
    });

    this.DBData = {
      1: [1, 2, 3, 4, 5, 6, 7],
      2: [8, 9, 10, 11, 12, 13, 14],
      3: [15, 16, 17, 18, 19, 20, 21]
    };

    this.IData = [12, 13, 14, 15, 16, 17, 18];

    this.QData = [19, 20, 21, 22, 23, 24, 25];

    this.MData = [26, 27, 28, 29, 30, 31, 32];

    this.DBRead = jest.fn(async (dbNumber, start, size, callback) => {
      try {
        if (!self.Connected()) throw new Error("Device not connected");
        if (!exists(this.DBData[dbNumber]))
          throw new Error("No such dbNumber is defined!");
        if (start + size > this.DBData[dbNumber].length)
          throw new Error("Invalid area");

        let data = this.DBData[dbNumber].slice(start, start + size);
        callback(null, Buffer.from(data));
      } catch (err) {
        callback(err.message, null);
      }
    });

    this.DBWrite = jest.fn(async (dbNumber, start, size, buffer, callback) => {
      try {
        if (!self.Connected()) throw new Error("Device not connected");
        if (!exists(this.DBData[dbNumber]))
          throw new Error("No such dbNumber is defined!");
        if (start + size > this.DBData[dbNumber].length)
          throw new Error("Invalid area");
        if (!Buffer.isBuffer(buffer))
          throw new Error("Data to set is not a buffer");

        await snooze(this.timeDelay);

        let data = [...buffer];

        for (let i = 0; i < size; i++) {
          let offset = start + i;

          this.DBData[dbNumber][offset] = data[i];
        }

        callback(null);
      } catch (err) {
        callback(err.message, null);
      }
    });

    this.ABRead = jest.fn(async (start, size, callback) => {
      try {
        if (!self.Connected()) throw new Error("Device not connected");
        if (start + size > this.QData.length) throw new Error("Invalid area");

        await snooze(this.timeDelay);
        let data = this.QData.slice(start, start + size);
        callback(null, Buffer.from(data));
      } catch (err) {
        callback(err.message, null);
      }
    });

    this.ABWrite = jest.fn(async (start, size, buffer, callback) => {
      try {
        if (!self.Connected()) throw new Error("Device not connected");
        if (start + size > this.QData.length) throw new Error("Invalid area");
        if (!Buffer.isBuffer(buffer))
          throw new Error("Data to set is not a buffer");
        await snooze(this.timeDelay);

        let data = [...buffer];

        for (let i = 0; i < size; i++) {
          let offset = start + i;

          this.QData[offset] = data[i];
        }

        callback(null);
      } catch (err) {
        callback(err.message, null);
      }
    });

    this.EBRead = jest.fn(async (start, size, callback) => {
      try {
        if (!self.Connected()) throw new Error("Device not connected");
        if (start + size > this.IData.length) throw new Error("Invalid area");
        await snooze(this.timeDelay);
        let data = this.IData.slice(start, start + size);
        callback(null, Buffer.from(data));
      } catch (err) {
        callback(err.message, null);
      }
    });

    this.EBWrite = jest.fn(async (start, size, buffer, callback) => {
      try {
        if (!self.Connected()) throw new Error("Device not connected");
        if (start + size > this.IData.length) throw new Error("Invalid area");
        if (!Buffer.isBuffer(buffer))
          throw new Error("Data to set is not a buffer");
        await snooze(this.timeDelay);

        let data = [...buffer];

        for (let i = 0; i < size; i++) {
          let offset = start + i;

          this.IData[offset] = data[i];
        }

        callback(null);
      } catch (err) {
        callback(err.message, null);
      }
    });

    this.MBRead = jest.fn(async (start, size, callback) => {
      try {
        if (!self.Connected()) throw new Error("Device not connected");
        if (start + size > this.MData.length) throw new Error("Invalid area");
        await snooze(this.timeDelay);
        let data = this.MData.slice(start, start + size);
        callback(null, Buffer.from(data));
      } catch (err) {
        callback(err.message, null);
      }
    });

    this.MBWrite = jest.fn(async (start, size, buffer, callback) => {
      try {
        if (!self.Connected()) throw new Error("Device not connected");
        if (start + size > this.MData.length) throw new Error("Invalid area");
        if (!Buffer.isBuffer(buffer))
          throw new Error("Data to set is not a buffer");
        await snooze(this.timeDelay);

        let data = [...buffer];

        for (let i = 0; i < size; i++) {
          let offset = start + i;

          this.MData[offset] = data[i];
        }

        callback(null);
      } catch (err) {
        callback(err.message, null);
      }
    });
  }

  Connected() {
    return this._connected;
  }
}

module.exports.S7Client = FakeS7Client;
