const S7AsyncClient = require("../../../classes/driver/S7/S7AsyncClient");
const { snooze } = require("../../../utilities/utilities");

describe("S7AsyncClient", () => {
  describe("Connected", () => {
    let client;
    let ip;
    let rack;
    let slot;
    let shouldConnect;

    beforeEach(() => {
      shouldConnect = true;
      ip = "192.168.0.1";
      rack = 0;
      slot = 1;
    });

    let exec = async () => {
      client = new S7AsyncClient();
      if (shouldConnect) await client.connectTCP(ip, rack, slot);
    };

    it("should return true if client is connected", async () => {
      await exec();

      expect(client.Connected).toEqual(true);
    });

    it("should return false if client is not connected", async () => {
      shouldConnect = false;
      await exec();

      expect(client.Connected).toEqual(false);
    });
  });

  describe("connectTCP", () => {
    let client;
    let ip;
    let rack;
    let slot;
    let connectingThrows;

    beforeEach(() => {
      ip = "192.168.0.1";
      rack = 0;
      slot = 1;
      connectingThrows = false;
    });

    let exec = async () => {
      client = new S7AsyncClient();
      if (connectingThrows)
        client.Client.ConnectTo = jest.fn(async (ip, rack, slot, callback) => {
          await snooze(500);
          await callback("Error while connecting");
        });
      return client.connectTCP(ip, rack, slot);
    };

    it("should call S7Client ConnectTo and connect to device", async () => {
      await exec();

      expect(client.Client.Connected()).toEqual(true);
      expect(client.Client.ConnectTo).toHaveBeenCalledTimes(1);
      expect(client.Client.ConnectTo.mock.calls[0][0]).toEqual(ip);
      expect(client.Client.ConnectTo.mock.calls[0][1]).toEqual(rack);
      expect(client.Client.ConnectTo.mock.calls[0][2]).toEqual(slot);
    });

    it("should return true if client connection has been established", async () => {
      let result = await exec();

      expect(result).toEqual(true);
    });

    it("should reject error if client connection has not been established", async () => {
      connectingThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Error while connecting");

      expect(client.Connected).toEqual(false);
    });
  });

  describe("close", () => {
    let client;
    let ip;
    let rack;
    let slot;
    let disconnectingThrows;

    beforeEach(() => {
      ip = "192.168.0.1";
      rack = 0;
      slot = 1;
      disconnectingThrows = false;
    });

    let exec = async () => {
      client = new S7AsyncClient();
      if (disconnectingThrows)
        client.Client.Disconnect = jest.fn(() => {
          throw new Error("disconnecting error");
        });
      await client.connectTCP(ip, rack, slot);
      return client.close();
    };

    it("should call S7Client Disconnect and disconnect to device", async () => {
      await exec();

      expect(client.Client.Connected()).toEqual(false);
      expect(client.Client.Disconnect).toHaveBeenCalledTimes(1);
    });

    it("should return true if client connection has been disconnected", async () => {
      let result = await exec();

      expect(result).toEqual(true);
    });

    it("should reject error if client disconnecting fail", async () => {
      disconnectingThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(client.Connected).toEqual(true);
    });
  });

  describe("DBRead", () => {
    let client;
    let ip;
    let rack;
    let slot;
    let dbNumber;
    let start;
    let size;

    beforeEach(() => {
      ip = "192.168.0.1";
      rack = 0;
      slot = 1;
      dbNumber = 1;
      start = 0;
      size = 4;
    });

    let exec = async () => {
      client = new S7AsyncClient();
      await client.connectTCP(ip, rack, slot);
      return client.DBRead(dbNumber, start, size);
    };

    it("should return content of DB as a buffer for given area - if area is on the begining of DB", async () => {
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([1, 2, 3, 4]);
    });

    it("should return content of whole DB as a buffer for given area - if area is whole DB", async () => {
      size = 7;
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("should return content of part DB as a buffer for given area- if area is int the center of DB", async () => {
      start = 3;
      size = 2;
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([4, 5]);
    });

    it("should reject if area is larger than data", async () => {
      start = 3;
      size = 5;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Invalid area");
    });

    it("should reject if there is no such db", async () => {
      dbNumber = 4;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("No such dbNumber is defined!");
    });
  });

  describe("DBWrite", () => {
    let client;
    let ip;
    let rack;
    let slot;
    let dbNumber;
    let start;
    let size;
    let dataToSet;
    let dbWriteThrows;

    beforeEach(() => {
      ip = "192.168.0.1";
      rack = 0;
      slot = 1;
      dbNumber = 1;
      start = 0;
      size = 4;
      dataToSet = Buffer.from([40, 30, 20, 10]);
    });

    let exec = async () => {
      client = new S7AsyncClient();
      await client.connectTCP(ip, rack, slot);

      return client.DBWrite(dbNumber, start, size, dataToSet);
    };

    it("should set data inside DB area - if area is on the begining of DB", async () => {
      await exec();

      let dbContent = await client.DBRead(dbNumber, 0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([40, 30, 20, 10, 5, 6, 7]);
    });

    it("should set data inside DB area - if area is whole DB", async () => {
      dataToSet = Buffer.from([10, 20, 30, 40, 50, 60, 70]);
      size = 7;
      await exec();

      let dbContent = await client.DBRead(dbNumber, 0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([10, 20, 30, 40, 50, 60, 70]);
    });

    it("should set data inside DB area - if area is int the center of DB", async () => {
      dataToSet = Buffer.from([40, 50]);
      start = 3;
      size = 2;
      await exec();

      let dbContent = await client.DBRead(dbNumber, 0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([1, 2, 3, 40, 50, 6, 7]);
    });

    it("should reject - if area is larger than data", async () => {
      dataToSet = Buffer.from([10, 20, 30, 40, 50]);
      start = 3;
      size = 5;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Invalid area");

      let dbContent = await client.DBRead(dbNumber, 0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("should reject - if there is no such db", async () => {
      dbNumber = 4;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("No such dbNumber is defined!");
    });

    it("should reject - if data is not a buffer", async () => {
      dataToSet = [10, 20, 30, 40];
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Data to set is not a buffer");
    });
  });

  describe("EBRead", () => {
    let client;
    let ip;
    let rack;
    let slot;
    let start;
    let size;

    beforeEach(() => {
      ip = "192.168.0.1";
      rack = 0;
      slot = 1;
      start = 0;
      size = 4;
    });

    let exec = async () => {
      client = new S7AsyncClient();
      await client.connectTCP(ip, rack, slot);
      return client.EBRead(start, size);
    };

    it("should return content of DB as a buffer for given area - if area is on the begining of DB", async () => {
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([12, 13, 14, 15]);
    });

    it("should return content of whole DB as a buffer for given area - if area is whole DB", async () => {
      size = 7;
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([12, 13, 14, 15, 16, 17, 18]);
    });

    it("should return content of part DB as a buffer for given area- if area is int the center of DB", async () => {
      start = 3;
      size = 2;
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([15, 16]);
    });

    it("should reject if area is larger than data", async () => {
      start = 3;
      size = 5;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Invalid area");
    });
  });

  describe("EBWrite", () => {
    let client;
    let ip;
    let rack;
    let slot;
    let start;
    let size;
    let dataToSet;

    beforeEach(() => {
      ip = "192.168.0.1";
      rack = 0;
      slot = 1;
      start = 0;
      size = 4;
      dataToSet = Buffer.from([40, 30, 20, 10]);
    });

    let exec = async () => {
      client = new S7AsyncClient();
      await client.connectTCP(ip, rack, slot);

      return client.EBWrite(start, size, dataToSet);
    };

    it("should set data inside DB area - if area is on the begining of DB", async () => {
      await exec();

      let dbContent = await client.EBRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([40, 30, 20, 10, 16, 17, 18]);
    });

    it("should set data inside DB area - if area is whole DB", async () => {
      dataToSet = Buffer.from([10, 20, 30, 40, 50, 60, 70]);
      size = 7;
      await exec();

      let dbContent = await client.EBRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([10, 20, 30, 40, 50, 60, 70]);
    });

    it("should set data inside DB area - if area is int the center of DB", async () => {
      dataToSet = Buffer.from([40, 50]);
      start = 3;
      size = 2;
      await exec();

      let dbContent = await client.EBRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([12, 13, 14, 40, 50, 17, 18]);
    });

    it("should reject - if area is larger than data", async () => {
      dataToSet = Buffer.from([10, 20, 30, 40, 50]);
      start = 3;
      size = 5;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Invalid area");

      let dbContent = await client.EBRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([12, 13, 14, 15, 16, 17, 18]);
    });

    it("should reject - if data is not a buffer", async () => {
      dataToSet = [10, 20, 30, 40];
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Data to set is not a buffer");
    });
  });

  describe("ABRead", () => {
    let client;
    let ip;
    let rack;
    let slot;
    let start;
    let size;

    beforeEach(() => {
      ip = "192.168.0.1";
      rack = 0;
      slot = 1;
      start = 0;
      size = 4;
    });

    let exec = async () => {
      client = new S7AsyncClient();
      await client.connectTCP(ip, rack, slot);
      return client.ABRead(start, size);
    };

    it("should return content of DB as a buffer for given area - if area is on the begining of DB", async () => {
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([19, 20, 21, 22]);
    });

    it("should return content of whole DB as a buffer for given area - if area is whole DB", async () => {
      size = 7;
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([19, 20, 21, 22, 23, 24, 25]);
    });

    it("should return content of part DB as a buffer for given area- if area is int the center of DB", async () => {
      start = 3;
      size = 2;
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([22, 23]);
    });

    it("should reject if area is larger than data", async () => {
      start = 3;
      size = 5;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Invalid area");
    });
  });

  describe("ABWrite", () => {
    let client;
    let ip;
    let rack;
    let slot;
    let start;
    let size;
    let dataToSet;

    beforeEach(() => {
      ip = "192.168.0.1";
      rack = 0;
      slot = 1;
      start = 0;
      size = 4;
      dataToSet = Buffer.from([40, 30, 20, 10]);
    });

    let exec = async () => {
      client = new S7AsyncClient();
      await client.connectTCP(ip, rack, slot);

      return client.ABWrite(start, size, dataToSet);
    };

    it("should set data inside DB area - if area is on the begining of DB", async () => {
      await exec();

      let dbContent = await client.ABRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([40, 30, 20, 10, 23, 24, 25]);
    });

    it("should set data inside DB area - if area is whole DB", async () => {
      dataToSet = Buffer.from([10, 20, 30, 40, 50, 60, 70]);
      size = 7;
      await exec();

      let dbContent = await client.ABRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([10, 20, 30, 40, 50, 60, 70]);
    });

    it("should set data inside DB area - if area is int the center of DB", async () => {
      dataToSet = Buffer.from([40, 50]);
      start = 3;
      size = 2;
      await exec();

      let dbContent = await client.ABRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([19, 20, 21, 40, 50, 24, 25]);
    });

    it("should reject - if area is larger than data", async () => {
      dataToSet = Buffer.from([10, 20, 30, 40, 50]);
      start = 3;
      size = 5;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Invalid area");

      let dbContent = await client.ABRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([19, 20, 21, 22, 23, 24, 25]);
    });

    it("should reject - if data is not a buffer", async () => {
      dataToSet = [10, 20, 30, 40];
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Data to set is not a buffer");
    });
  });

  describe("MBRead", () => {
    let client;
    let ip;
    let rack;
    let slot;
    let start;
    let size;

    beforeEach(() => {
      ip = "192.168.0.1";
      rack = 0;
      slot = 1;
      start = 0;
      size = 4;
    });

    let exec = async () => {
      client = new S7AsyncClient();
      await client.connectTCP(ip, rack, slot);
      return client.MBRead(start, size);
    };

    it("should return content of DB as a buffer for given area - if area is on the begining of DB", async () => {
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([26, 27, 28, 29]);
    });

    it("should return content of whole DB as a buffer for given area - if area is whole DB", async () => {
      size = 7;
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([26, 27, 28, 29, 30, 31, 32]);
    });

    it("should return content of part DB as a buffer for given area- if area is int the center of DB", async () => {
      start = 3;
      size = 2;
      let result = await exec();

      expect(result).toBeDefined();

      let arrayResult = [...result];
      expect(arrayResult).toEqual([29, 30]);
    });

    it("should reject if area is larger than data", async () => {
      start = 3;
      size = 5;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Invalid area");
    });
  });

  describe("MBWrite", () => {
    let client;
    let ip;
    let rack;
    let slot;
    let start;
    let size;
    let dataToSet;

    beforeEach(() => {
      ip = "192.168.0.1";
      rack = 0;
      slot = 1;
      start = 0;
      size = 4;
      dataToSet = Buffer.from([40, 30, 20, 10]);
    });

    let exec = async () => {
      client = new S7AsyncClient();
      await client.connectTCP(ip, rack, slot);

      return client.MBWrite(start, size, dataToSet);
    };

    it("should set data inside DB area - if area is on the begining of DB", async () => {
      await exec();

      let dbContent = await client.MBRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([40, 30, 20, 10, 30, 31, 32]);
    });

    it("should set data inside DB area - if area is whole DB", async () => {
      dataToSet = Buffer.from([10, 20, 30, 40, 50, 60, 70]);
      size = 7;
      await exec();

      let dbContent = await client.MBRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([10, 20, 30, 40, 50, 60, 70]);
    });

    it("should set data inside DB area - if area is int the center of DB", async () => {
      dataToSet = Buffer.from([40, 50]);
      start = 3;
      size = 2;
      await exec();

      let dbContent = await client.MBRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([26, 27, 28, 40, 50, 31, 32]);
    });

    it("should reject - if area is larger than data", async () => {
      dataToSet = Buffer.from([10, 20, 30, 40, 50]);
      start = 3;
      size = 5;
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Invalid area");

      let dbContent = await client.MBRead(0, 7);

      let arrayResult = [...dbContent];
      expect(arrayResult).toEqual([26, 27, 28, 29, 30, 31, 32]);
    });

    it("should reject - if data is not a buffer", async () => {
      dataToSet = [10, 20, 30, 40];
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            resultError = err;
            return reject(err);
          }
        })
      ).rejects.toEqual("Data to set is not a buffer");
    });
  });
});
