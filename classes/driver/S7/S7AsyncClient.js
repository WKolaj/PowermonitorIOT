const snap7 = require("node-snap7");
const S7Client = snap7.S7Client;

class S7AsyncClient {
  /**
   * @description Packed S7 client with async methods
   */
  constructor() {
    this._client = new S7Client();
  }

  get Client() {
    return this._client;
  }

  get Connected() {
    return this.Client.Connected();
  }

  async connectTCP(ip, rack, slot) {
    return new Promise(async (resolve, reject) => {
      return this.Client.ConnectTo(ip, rack, slot, err => {
        if (err) return reject(err);
        return resolve(true);
      });
    });
  }

  async DBRead(dbNumber, start, size) {
    return new Promise(async (resolve, reject) => {
      return this.Client.DBRead(dbNumber, start, size, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });
  }

  async DBWrite(dbNumber, start, size, buffer) {
    return new Promise(async (resolve, reject) => {
      return this.Client.DBWrite(dbNumber, start, size, buffer, err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  async ABRead(start, size) {
    return new Promise(async (resolve, reject) => {
      return this.Client.ABRead(start, size, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });
  }

  async ABWrite(start, size, buffer) {
    return new Promise(async (resolve, reject) => {
      return this.Client.ABWrite(start, size, buffer, err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  async EBRead(start, size) {
    return new Promise(async (resolve, reject) => {
      return this.Client.EBRead(start, size, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });
  }

  async EBWrite(start, size, buffer) {
    return new Promise(async (resolve, reject) => {
      return this.Client.EBWrite(start, size, buffer, err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  async MBRead(start, size) {
    return new Promise(async (resolve, reject) => {
      return this.Client.MBRead(start, size, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });
  }

  async MBWrite(start, size, buffer) {
    return new Promise(async (resolve, reject) => {
      return this.Client.MBWrite(start, size, buffer, err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  async close() {
    return this.Client.Disconnect();
  }
}

module.exports = S7AsyncClient;
