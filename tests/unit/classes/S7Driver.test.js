const S7Request = require("../../../classes/driver/S7/S7Request");
const S7Driver = require("../../../classes/driver/S7/S7Driver");
const S7Int16Variable = require("../../../classes/variable/S7/S7Int16Variable");
const S7Device = require("../../../classes/device/S7/S7Device");
const { snooze, exists } = require("../../../utilities/utilities");

describe("S7Driver", () => {
  describe("constructor", () => {
    let device;
    let ipAdress;
    let rack;
    let slot;
    let timeout;

    beforeEach(() => {
      device = "fakeDevice";
      ipAdress = "192.168.0.101";
      rack = 3;
      timeout = 3000;
      slot = 2;
    });

    let exec = () => {
      return new S7Driver(device, ipAdress, rack, timeout, slot);
    };

    it("should return new S7Driver", async () => {
      let result = await exec();

      expect(result).toBeDefined();
    });

    it("should set device in driver", async () => {
      let result = await exec();

      expect(result.S7Device).toEqual(device);
    });

    it("should set rack in driver", async () => {
      let result = await exec();

      expect(result.Rack).toEqual(rack);
    });

    it("should set slot in driver", async () => {
      let result = await exec();

      expect(result.Slot).toEqual(slot);
    });

    it("should set timeout in driver", async () => {
      let result = await exec();

      expect(result.Timeout).toEqual(timeout);
    });

    it("should busy to false", async () => {
      let result = await exec();

      expect(result.IsBusy).toEqual(false);
    });

    it("should active to false", async () => {
      let result = await exec();

      expect(result.IsActive).toEqual(false);
    });

    it("should create new S7Client", async () => {
      let result = await exec();

      expect(result._client).toBeDefined();
    });
  });

  describe("_connectWithoutActivating", () => {
    let device;
    let ipAdress;
    let rack;
    let slot;
    let timeout;
    let active;
    let connectThrows;
    let connectionDelay;
    let driver;

    beforeEach(() => {
      active = true;
      device = "fakeDevice";
      ipAdress = "192.168.0.101";
      rack = 3;
      timeout = 100;
      slot = 2;
      connectThrows = false;
      connectionDelay = 10;
    });

    let exec = () => {
      driver = new S7Driver(device, ipAdress, rack, timeout, slot);
      driver._active = active;

      driver._client.Client.ConnectTo = jest.fn(
        async (ip, rack, slot, callback) => {
          await snooze(connectionDelay);
          if (connectThrows) return await callback("connection failed");
          driver._client.Client._connected = true;
          await callback();
        }
      );

      return driver._connectWithoutActivating();
    };

    it("should call ConnectTo of s7Client if driver is active", async () => {
      await exec();

      expect(driver._client.Client.ConnectTo).toHaveBeenCalledTimes(1);
      expect(driver._client.Client.ConnectTo.mock.calls[0][0]).toEqual(
        ipAdress
      );
      expect(driver._client.Client.ConnectTo.mock.calls[0][1]).toEqual(rack);
      expect(driver._client.Client.ConnectTo.mock.calls[0][2]).toEqual(slot);

      expect(driver.Connected).toEqual(true);
    });

    it("should reject if device is not active", async () => {
      active = false;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver.Connected).toEqual(false);
    });

    it("should reject if connecting throws", async () => {
      connectThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver.Connected).toEqual(false);
    });

    it("should reject and call disconnect if connecting takes more time than timeout", async () => {
      connectionDelay = 1000;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);

      expect(driver.Connected).toEqual(false);
    });
  });

  describe("connect", () => {
    let device;
    let ipAdress;
    let rack;
    let slot;
    let timeout;
    let connectThrows;
    let connectionDelay;
    let driver;

    beforeEach(() => {
      device = "fakeDevice";
      ipAdress = "192.168.0.101";
      rack = 3;
      timeout = 100;
      slot = 2;
      connectThrows = false;
      connectionDelay = 10;
    });

    let exec = () => {
      driver = new S7Driver(device, ipAdress, rack, timeout, slot);

      driver._client.Client.ConnectTo = jest.fn(
        async (ip, rack, slot, callback) => {
          await snooze(connectionDelay);
          if (connectThrows) return await callback("connection failed");
          driver._client.Client._connected = true;
          await callback();
        }
      );

      return driver.connect();
    };

    it("should call ConnectTo of s7Client", async () => {
      await exec();

      expect(driver._client.Client.ConnectTo).toHaveBeenCalledTimes(1);
      expect(driver._client.Client.ConnectTo.mock.calls[0][0]).toEqual(
        ipAdress
      );
      expect(driver._client.Client.ConnectTo.mock.calls[0][1]).toEqual(rack);
      expect(driver._client.Client.ConnectTo.mock.calls[0][2]).toEqual(slot);

      expect(driver.Connected).toEqual(true);
    });

    it("should set active to true ", async () => {
      await exec();

      expect(driver.IsActive).toEqual(true);
    });

    it("should set busy to false ", async () => {
      await exec();

      expect(driver.IsBusy).toEqual(false);
    });

    it("should not reject if but not connect driver  connecting throws", async () => {
      connectThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      expect(driver.Connected).toEqual(false);
    });

    it("should not reject if but not connect  and call disconnect if connecting takes more time than timeout", async () => {
      connectionDelay = 1000;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);

      expect(driver.Connected).toEqual(false);
    });
  });

  describe("_disconnectWithoutDeactive", () => {
    let device;
    let ipAdress;
    let rack;
    let slot;
    let timeout;
    let active;
    let connectThrows;
    let connectionDelay;
    let driver;

    beforeEach(() => {
      active = true;
      device = "fakeDevice";
      ipAdress = "192.168.0.101";
      rack = 3;
      timeout = 100;
      slot = 2;
      connectThrows = false;
      connectionDelay = 10;
    });

    let exec = () => {
      driver = new S7Driver(device, ipAdress, rack, timeout, slot);
      return driver._disconnectWithoutDeactive();
    };

    it("should call Disconnect of s7Client", async () => {
      await exec();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);

      expect(driver.Connected).toEqual(false);
    });
  });

  describe("disconnect", () => {
    let device;
    let ipAdress;
    let rack;
    let slot;
    let timeout;
    let active;
    let connectThrows;
    let connectionDelay;
    let driver;
    let setDisconnectToThrow;

    beforeEach(() => {
      active = true;
      device = "fakeDevice";
      ipAdress = "192.168.0.101";
      rack = 3;
      timeout = 100;
      slot = 2;
      connectThrows = false;
      connectionDelay = 10;
      setDisconnectToThrow = false;
    });

    let exec = () => {
      driver = new S7Driver(device, ipAdress, rack, timeout, slot);
      driver._active = true;
      driver._client.Client.Disconnect = jest.fn(() => {
        if (setDisconnectToThrow) throw new Error("Disconnect throws");
        driver._client.Client = false;
        return true;
      });

      return driver.disconnect();
    };

    it("should set active to false", async () => {
      await exec();

      expect(driver.IsActive).toEqual(false);
    });

    it("should set busy to false", async () => {
      await exec();

      expect(driver.IsBusy).toEqual(false);
    });

    it("should not throw if disconnect throws", async () => {
      setDisconnectToThrow = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).resolves.toBeDefined();
    });

    it("should call Disconnect of s7Client", async () => {
      await exec();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);

      expect(driver.Connected).toEqual(false);
    });
  });

  describe("_getData", () => {
    let device;
    let ipAdress;
    let rack;
    let slot;
    let timeout;
    let ebReadThrows;
    let abReadThrows;
    let mbReadThrows;
    let dbReadThrows;
    let readingDelay;
    let driver;
    let initialConnect;
    let initialActive;
    let connectThrows;
    let connectionDelay;

    let readingAreaType;
    let readingOffset;
    let readingLength;
    let readingDBNumber;

    beforeEach(() => {
      initialConnect = true;
      initialActive = true;
      device = "fakeDevice";
      ipAdress = "192.168.0.101";
      rack = 3;
      timeout = 100;
      slot = 2;

      readingDelay = 10;
      ebReadThrows = false;
      abReadThrows = false;
      mbReadThrows = false;
      dbReadThrows = false;

      readingAreaType = "DB";
      readingOffset = 2;
      readingLength = 4;
      readingDBNumber = 2;

      connectThrows = false;
      connectionDelay = 10;
    });

    let exec = async () => {
      driver = new S7Driver(device, ipAdress, rack, timeout, slot);

      driver._client.Client.DBRead = jest.fn(
        async (dbNumber, start, size, callback) => {
          try {
            if (dbReadThrows) throw new Error("Error while reading db");

            if (!driver._client.Client.Connected())
              throw new Error("Device not connected");

            await snooze(readingDelay);

            if (!exists(driver._client.Client.DBData[dbNumber]))
              throw new Error("No such dbNumber is defined!");

            if (start + size > driver._client.Client.DBData[dbNumber].length)
              throw new Error("Invalid area");

            let data = driver._client.Client.DBData[dbNumber].slice(
              start,
              start + size
            );

            callback(null, Buffer.from(data));
          } catch (err) {
            callback(err.message, null);
          }
        }
      );

      driver._client.Client.ABRead = jest.fn(async (start, size, callback) => {
        try {
          if (abReadThrows) throw new Error("Error while reading ab");

          if (!driver._client.Client.Connected())
            throw new Error("Device not connected");
          if (start + size > driver._client.Client.QData.length)
            throw new Error("Invalid area");

          await snooze(readingDelay);

          let data = driver._client.Client.QData.slice(start, start + size);
          callback(null, Buffer.from(data));
        } catch (err) {
          callback(err.message, null);
        }
      });

      driver._client.Client.EBRead = jest.fn(async (start, size, callback) => {
        try {
          if (ebReadThrows) throw new Error("Error while reading eb");

          if (!driver._client.Client.Connected())
            throw new Error("Device not connected");
          if (start + size > driver._client.Client.IData.length)
            throw new Error("Invalid area");

          await snooze(readingDelay);

          let data = driver._client.Client.IData.slice(start, start + size);
          callback(null, Buffer.from(data));
        } catch (err) {
          callback(err.message, null);
        }
      });

      driver._client.Client.MBRead = jest.fn(async (start, size, callback) => {
        try {
          if (mbReadThrows) throw new Error("Error while reading mb");

          if (!driver._client.Client.Connected())
            throw new Error("Device not connected");
          if (start + size > driver._client.Client.MData.length)
            throw new Error("Invalid area");

          await snooze(readingDelay);

          let data = driver._client.Client.MData.slice(start, start + size);
          callback(null, Buffer.from(data));
        } catch (err) {
          callback(err.message, null);
        }
      });

      if (initialConnect) await driver.connect();
      else driver._active = initialActive;

      driver._client.Client.ConnectTo = jest.fn(
        async (ip, rack, slot, callback) => {
          await snooze(connectionDelay);
          if (connectThrows) return await callback("connection failed");
          driver._client.Client._connected = true;
          await callback();
        }
      );
      return driver._getData(
        readingAreaType,
        readingOffset,
        readingLength,
        readingDBNumber
      );
    };

    it("should connect if driver was not connected before", async () => {
      initialConnect = false;
      initialActive = true;

      let result = await exec();

      expect(driver._client.Client.ConnectTo).toHaveBeenCalledTimes(1);
      expect(driver._client.Client.ConnectTo.mock.calls[0][0]).toEqual(
        ipAdress
      );
      expect(driver._client.Client.ConnectTo.mock.calls[0][1]).toEqual(rack);
      expect(driver._client.Client.ConnectTo.mock.calls[0][2]).toEqual(slot);

      expect(driver.Connected).toEqual(true);

      expect(result).toEqual([10, 11, 12, 13]);
    });

    it("should throw and disconnect if connecting exceeds given time", async () => {
      initialConnect = false;
      initialActive = true;
      connectionDelay = 1000;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver.Connected).toEqual(false);
      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
    });

    it("should throw and disconnect if reading exceeds given time", async () => {
      readingDelay = 1000;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
    });

    it("should throw if driver is not active and not call connect", async () => {
      initialConnect = false;
      initialActive = false;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.ConnectTo).not.toHaveBeenCalled();
    });

    it("should get data from db if areaType is DB", async () => {
      readingAreaType = "DB";
      readingOffset = 2;
      readingLength = 4;
      readingDBNumber = 2;

      let result = await exec();

      expect(result).toEqual([10, 11, 12, 13]);
    });

    it("should throw and disconnect if readDb throws", async () => {
      dbReadThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should get data from db if areaType is I", async () => {
      readingAreaType = "I";
      readingOffset = 2;
      readingLength = 4;
      readingDBNumber = 2;

      let result = await exec();

      expect(result).toEqual([14, 15, 16, 17]);
    });

    it("should throw and disconnect if readEb throws", async () => {
      readingAreaType = "I";
      ebReadThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should get data from db if areaType is Q", async () => {
      readingAreaType = "Q";
      readingOffset = 2;
      readingLength = 4;
      readingDBNumber = 2;

      let result = await exec();

      expect(result).toEqual([21, 22, 23, 24]);
    });

    it("should throw and disconnect if readAb throws", async () => {
      readingAreaType = "Q";
      abReadThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should get data from db if areaType is M", async () => {
      readingAreaType = "M";
      readingOffset = 2;
      readingLength = 4;
      readingDBNumber = 2;

      let result = await exec();

      expect(result).toEqual([28, 29, 30, 31]);
    });

    it("should throw and disconnect if readDb throws", async () => {
      readingAreaType = "M";
      mbReadThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });
  });

  describe("_setData", () => {
    let device;
    let ipAdress;
    let rack;
    let slot;
    let timeout;
    let ebWriteThrows;
    let abWriteThrows;
    let mbWriteThrows;
    let dbWriteThrows;
    let writingDelay;
    let driver;
    let initialConnect;
    let initialActive;
    let connectThrows;
    let connectionDelay;

    let writingAreaType;
    let writingOffset;
    let writingLength;
    let writingDBNumber;

    let dataToSet;

    beforeEach(() => {
      initialConnect = true;
      initialActive = true;
      device = "fakeDevice";
      ipAdress = "192.168.0.101";
      rack = 3;
      timeout = 100;
      slot = 2;

      writingDelay = 10;
      ebWriteThrows = false;
      abWriteThrows = false;
      mbWriteThrows = false;
      dbWriteThrows = false;

      writingAreaType = "DB";
      writingOffset = 2;
      writingLength = 4;
      writingDBNumber = 2;
      dataToSet = [100, 101, 102, 103];

      connectThrows = false;
      connectionDelay = 10;
    });

    let exec = async () => {
      driver = new S7Driver(device, ipAdress, rack, timeout, slot);

      driver._client.Client.DBWrite = jest.fn(
        async (dbNumber, start, size, buffer, callback) => {
          try {
            if (dbWriteThrows) throw new Error("Error while reading db");

            if (!driver._client.Client.Connected())
              throw new Error("Device not connected");
            if (!exists(driver._client.Client.DBData[dbNumber]))
              throw new Error("No such dbNumber is defined!");
            if (start + size > driver._client.Client.DBData[dbNumber].length)
              throw new Error("Invalid area");
            if (!Buffer.isBuffer(buffer))
              throw new Error("Data to set is not a buffer");

            await snooze(writingDelay);

            let data = [...buffer];

            for (let i = 0; i < size; i++) {
              let offset = start + i;

              driver._client.Client.DBData[dbNumber][offset] = data[i];
            }

            callback(null);
          } catch (err) {
            callback(err.message, null);
          }
        }
      );

      driver._client.Client.ABWrite = jest.fn(
        async (start, size, buffer, callback) => {
          try {
            if (abWriteThrows) throw new Error("Error while reading db");
            if (!driver._client.Client.Connected())
              throw new Error("Device not connected");
            if (start + size > driver._client.Client.QData.length)
              throw new Error("Invalid area");
            if (!Buffer.isBuffer(buffer))
              throw new Error("Data to set is not a buffer");
            await snooze(writingDelay);

            let data = [...buffer];

            for (let i = 0; i < size; i++) {
              let offset = start + i;

              driver._client.Client.QData[offset] = data[i];
            }

            callback(null);
          } catch (err) {
            callback(err.message, null);
          }
        }
      );

      driver._client.Client.EBWrite = jest.fn(
        async (start, size, buffer, callback) => {
          try {
            if (ebWriteThrows) throw new Error("Error while reading db");
            if (!driver._client.Client.Connected())
              throw new Error("Device not connected");
            if (start + size > driver._client.Client.IData.length)
              throw new Error("Invalid area");
            if (!Buffer.isBuffer(buffer))
              throw new Error("Data to set is not a buffer");
            await snooze(writingDelay);

            let data = [...buffer];

            for (let i = 0; i < size; i++) {
              let offset = start + i;

              driver._client.Client.IData[offset] = data[i];
            }

            callback(null);
          } catch (err) {
            callback(err.message, null);
          }
        }
      );

      driver._client.Client.MBWrite = jest.fn(
        async (start, size, buffer, callback) => {
          try {
            if (mbWriteThrows) throw new Error("Error while reading db");
            if (!driver._client.Client.Connected())
              throw new Error("Device not connected");
            if (start + size > driver._client.Client.MData.length)
              throw new Error("Invalid area");
            if (!Buffer.isBuffer(buffer))
              throw new Error("Data to set is not a buffer");
            await snooze(writingDelay);

            let data = [...buffer];

            for (let i = 0; i < size; i++) {
              let offset = start + i;

              driver._client.Client.MData[offset] = data[i];
            }

            callback(null);
          } catch (err) {
            callback(err.message, null);
          }
        }
      );

      if (initialConnect) await driver.connect();
      else driver._active = initialActive;

      driver._client.Client.ConnectTo = jest.fn(
        async (ip, rack, slot, callback) => {
          await snooze(connectionDelay);
          if (connectThrows) return await callback("connection failed");
          driver._client.Client._connected = true;
          await callback();
        }
      );

      return driver._setData(
        writingAreaType,
        writingOffset,
        dataToSet,
        writingLength,
        writingDBNumber
      );
    };

    it("should connect if driver was not connected before", async () => {
      initialConnect = false;
      initialActive = true;

      let result = await exec();

      expect(driver._client.Client.ConnectTo).toHaveBeenCalledTimes(1);
      expect(driver._client.Client.ConnectTo.mock.calls[0][0]).toEqual(
        ipAdress
      );
      expect(driver._client.Client.ConnectTo.mock.calls[0][1]).toEqual(rack);
      expect(driver._client.Client.ConnectTo.mock.calls[0][2]).toEqual(slot);

      expect(driver.Connected).toEqual(true);
    });

    it("should return set variables", async () => {
      let result = await exec();

      expect(result).toEqual([100, 101, 102, 103]);
    });

    it("should throw and disconnect if connecting exceeds given time", async () => {
      initialConnect = false;
      initialActive = true;
      connectionDelay = 1000;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver.Connected).toEqual(false);
      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
    });

    it("should throw and disconnect if writing exceeds given time", async () => {
      writingDelay = 1000;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
    });

    it("should throw if driver is not active and not call connect", async () => {
      initialConnect = false;
      initialActive = false;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.ConnectTo).not.toHaveBeenCalled();
    });

    it("should write data to db if areaType is DB", async () => {
      dataToSet = [101, 102, 103, 104];
      await exec();

      let result = await driver._getData(
        writingAreaType,
        writingOffset,
        writingLength,
        writingDBNumber
      );

      expect(result).toEqual([101, 102, 103, 104]);
    });

    it("should throw and disconnect if writeDb throws", async () => {
      dbWriteThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should set data in db if areaType is I", async () => {
      dataToSet = [101, 102, 103, 104];
      writingAreaType = "I";

      await exec();

      let result = await driver._getData(
        writingAreaType,
        writingOffset,
        writingLength,
        writingDBNumber
      );

      expect(result).toEqual([101, 102, 103, 104]);
    });

    it("should throw and disconnect if writeEb throws", async () => {
      writingAreaType = "I";
      ebWriteThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should get data from db if areaType is Q", async () => {
      writingAreaType = "Q";
      dataToSet = [101, 102, 103, 104];

      await exec();

      let result = await driver._getData(
        writingAreaType,
        writingOffset,
        writingLength,
        writingDBNumber
      );

      expect(result).toEqual([101, 102, 103, 104]);
    });

    it("should throw and disconnect if writeAb throws", async () => {
      writingAreaType = "Q";
      abWriteThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should get data from db if areaType is M", async () => {
      writingAreaType = "M";
      dataToSet = [101, 102, 103, 104];

      await exec();

      let result = await driver._getData(
        writingAreaType,
        writingOffset,
        writingLength,
        writingDBNumber
      );

      expect(result).toEqual([101, 102, 103, 104]);
    });

    it("should throw and disconnect if readDb throws", async () => {
      writingAreaType = "M";
      mbWriteThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });
  });

  describe("createGetDataAction", () => {
    let device;
    let ipAdress;
    let rack;
    let slot;
    let timeout;
    let ebReadThrows;
    let abReadThrows;
    let mbReadThrows;
    let dbReadThrows;
    let readingDelay;
    let driver;
    let initialConnect;
    let initialActive;
    let connectThrows;
    let connectionDelay;

    let readingAreaType;
    let readingOffset;
    let readingLength;
    let readingDBNumber;

    beforeEach(() => {
      initialConnect = true;
      initialActive = true;
      device = "fakeDevice";
      ipAdress = "192.168.0.101";
      rack = 3;
      timeout = 100;
      slot = 2;

      readingDelay = 10;
      ebReadThrows = false;
      abReadThrows = false;
      mbReadThrows = false;
      dbReadThrows = false;

      readingAreaType = "DB";
      readingOffset = 2;
      readingLength = 4;
      readingDBNumber = 2;

      connectThrows = false;
      connectionDelay = 10;
    });

    let exec = async () => {
      driver = new S7Driver(device, ipAdress, rack, timeout, slot);

      driver._client.Client.DBRead = jest.fn(
        async (dbNumber, start, size, callback) => {
          try {
            if (dbReadThrows) throw new Error("Error while reading db");

            if (!driver._client.Client.Connected())
              throw new Error("Device not connected");

            await snooze(readingDelay);

            if (!exists(driver._client.Client.DBData[dbNumber]))
              throw new Error("No such dbNumber is defined!");

            if (start + size > driver._client.Client.DBData[dbNumber].length)
              throw new Error("Invalid area");

            let data = driver._client.Client.DBData[dbNumber].slice(
              start,
              start + size
            );

            callback(null, Buffer.from(data));
          } catch (err) {
            callback(err.message, null);
          }
        }
      );

      driver._client.Client.ABRead = jest.fn(async (start, size, callback) => {
        try {
          if (abReadThrows) throw new Error("Error while reading ab");

          if (!driver._client.Client.Connected())
            throw new Error("Device not connected");
          if (start + size > driver._client.Client.QData.length)
            throw new Error("Invalid area");

          await snooze(readingDelay);

          let data = driver._client.Client.QData.slice(start, start + size);
          callback(null, Buffer.from(data));
        } catch (err) {
          callback(err.message, null);
        }
      });

      driver._client.Client.EBRead = jest.fn(async (start, size, callback) => {
        try {
          if (ebReadThrows) throw new Error("Error while reading eb");

          if (!driver._client.Client.Connected())
            throw new Error("Device not connected");
          if (start + size > driver._client.Client.IData.length)
            throw new Error("Invalid area");

          await snooze(readingDelay);

          let data = driver._client.Client.IData.slice(start, start + size);
          callback(null, Buffer.from(data));
        } catch (err) {
          callback(err.message, null);
        }
      });

      driver._client.Client.MBRead = jest.fn(async (start, size, callback) => {
        try {
          if (mbReadThrows) throw new Error("Error while reading mb");

          if (!driver._client.Client.Connected())
            throw new Error("Device not connected");
          if (start + size > driver._client.Client.MData.length)
            throw new Error("Invalid area");

          await snooze(readingDelay);

          let data = driver._client.Client.MData.slice(start, start + size);
          callback(null, Buffer.from(data));
        } catch (err) {
          callback(err.message, null);
        }
      });

      if (initialConnect) await driver.connect();
      else driver._active = initialActive;

      driver._client.Client.ConnectTo = jest.fn(
        async (ip, rack, slot, callback) => {
          await snooze(connectionDelay);
          if (connectThrows) return await callback("connection failed");
          driver._client.Client._connected = true;
          await callback();
        }
      );
      return driver.createGetDataAction(
        readingAreaType,
        readingOffset,
        readingLength,
        readingDBNumber
      );
    };

    it("should return method that connect if driver was not connected before", async () => {
      initialConnect = false;
      initialActive = true;

      let method = await exec();
      let result = await method();

      expect(driver._client.Client.ConnectTo).toHaveBeenCalledTimes(1);
      expect(driver._client.Client.ConnectTo.mock.calls[0][0]).toEqual(
        ipAdress
      );
      expect(driver._client.Client.ConnectTo.mock.calls[0][1]).toEqual(rack);
      expect(driver._client.Client.ConnectTo.mock.calls[0][2]).toEqual(slot);

      expect(driver.Connected).toEqual(true);

      expect(result).toEqual([10, 11, 12, 13]);
    });

    it("should return method that throw and disconnect if connecting exceeds given time", async () => {
      initialConnect = false;
      initialActive = true;
      connectionDelay = 1000;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            let result = await method();

            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver.Connected).toEqual(false);
      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
    });

    it("should return method that throw and disconnect if reading exceeds given time", async () => {
      readingDelay = 1000;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            let result = await method();

            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
    });

    it("should return method that throw if driver is not active and not call connect", async () => {
      initialConnect = false;
      initialActive = false;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            let result = await method();

            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.ConnectTo).not.toHaveBeenCalled();
    });

    it("should return method that get data from db if areaType is DB", async () => {
      readingAreaType = "DB";
      readingOffset = 2;
      readingLength = 4;
      readingDBNumber = 2;

      let method = await exec();
      let result = await method();

      expect(result).toEqual([10, 11, 12, 13]);
    });

    it("should return method that throw and disconnect if readDb throws", async () => {
      dbReadThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            let result = await method();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should return method that get data from db if areaType is I", async () => {
      readingAreaType = "I";
      readingOffset = 2;
      readingLength = 4;
      readingDBNumber = 2;

      let method = await exec();
      let result = await method();
      expect(result).toEqual([14, 15, 16, 17]);
    });

    it("should treturn method that hrow and disconnect if readEb throws", async () => {
      readingAreaType = "I";
      ebReadThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            let result = await method();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should return method that get data from db if areaType is Q", async () => {
      readingAreaType = "Q";
      readingOffset = 2;
      readingLength = 4;
      readingDBNumber = 2;

      let method = await exec();
      let result = await method();

      expect(result).toEqual([21, 22, 23, 24]);
    });

    it("should return method that throw and disconnect if readAb throws", async () => {
      readingAreaType = "Q";
      abReadThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            let result = await method();

            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should return method that get data from db if areaType is M", async () => {
      readingAreaType = "M";
      readingOffset = 2;
      readingLength = 4;
      readingDBNumber = 2;

      let method = await exec();
      let result = await method();

      expect(result).toEqual([28, 29, 30, 31]);
    });

    it("should return method that throw and disconnect if readDb throws", async () => {
      readingAreaType = "M";
      mbReadThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let result = await exec();
            await result();

            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });
  });

  describe("createSetDataAction", () => {
    let device;
    let ipAdress;
    let rack;
    let slot;
    let timeout;
    let ebWriteThrows;
    let abWriteThrows;
    let mbWriteThrows;
    let dbWriteThrows;
    let writingDelay;
    let driver;
    let initialConnect;
    let initialActive;
    let connectThrows;
    let connectionDelay;

    let writingAreaType;
    let writingOffset;
    let writingLength;
    let writingDBNumber;

    let dataToSet;

    beforeEach(() => {
      initialConnect = true;
      initialActive = true;
      device = "fakeDevice";
      ipAdress = "192.168.0.101";
      rack = 3;
      timeout = 100;
      slot = 2;

      writingDelay = 10;
      ebWriteThrows = false;
      abWriteThrows = false;
      mbWriteThrows = false;
      dbWriteThrows = false;

      writingAreaType = "DB";
      writingOffset = 2;
      writingLength = 4;
      writingDBNumber = 2;
      dataToSet = [100, 101, 102, 103];

      connectThrows = false;
      connectionDelay = 10;
    });

    let exec = async () => {
      driver = new S7Driver(device, ipAdress, rack, timeout, slot);

      driver._client.Client.DBWrite = jest.fn(
        async (dbNumber, start, size, buffer, callback) => {
          try {
            if (dbWriteThrows) throw new Error("Error while reading db");

            if (!driver._client.Client.Connected())
              throw new Error("Device not connected");
            if (!exists(driver._client.Client.DBData[dbNumber]))
              throw new Error("No such dbNumber is defined!");
            if (start + size > driver._client.Client.DBData[dbNumber].length)
              throw new Error("Invalid area");
            if (!Buffer.isBuffer(buffer))
              throw new Error("Data to set is not a buffer");

            await snooze(writingDelay);

            let data = [...buffer];

            for (let i = 0; i < size; i++) {
              let offset = start + i;

              driver._client.Client.DBData[dbNumber][offset] = data[i];
            }

            callback(null);
          } catch (err) {
            callback(err.message, null);
          }
        }
      );

      driver._client.Client.ABWrite = jest.fn(
        async (start, size, buffer, callback) => {
          try {
            if (abWriteThrows) throw new Error("Error while reading db");
            if (!driver._client.Client.Connected())
              throw new Error("Device not connected");
            if (start + size > driver._client.Client.QData.length)
              throw new Error("Invalid area");
            if (!Buffer.isBuffer(buffer))
              throw new Error("Data to set is not a buffer");
            await snooze(writingDelay);

            let data = [...buffer];

            for (let i = 0; i < size; i++) {
              let offset = start + i;

              driver._client.Client.QData[offset] = data[i];
            }

            callback(null);
          } catch (err) {
            callback(err.message, null);
          }
        }
      );

      driver._client.Client.EBWrite = jest.fn(
        async (start, size, buffer, callback) => {
          try {
            if (ebWriteThrows) throw new Error("Error while reading db");
            if (!driver._client.Client.Connected())
              throw new Error("Device not connected");
            if (start + size > driver._client.Client.IData.length)
              throw new Error("Invalid area");
            if (!Buffer.isBuffer(buffer))
              throw new Error("Data to set is not a buffer");
            await snooze(writingDelay);

            let data = [...buffer];

            for (let i = 0; i < size; i++) {
              let offset = start + i;

              driver._client.Client.IData[offset] = data[i];
            }

            callback(null);
          } catch (err) {
            callback(err.message, null);
          }
        }
      );

      driver._client.Client.MBWrite = jest.fn(
        async (start, size, buffer, callback) => {
          try {
            if (mbWriteThrows) throw new Error("Error while reading db");
            if (!driver._client.Client.Connected())
              throw new Error("Device not connected");
            if (start + size > driver._client.Client.MData.length)
              throw new Error("Invalid area");
            if (!Buffer.isBuffer(buffer))
              throw new Error("Data to set is not a buffer");
            await snooze(writingDelay);

            let data = [...buffer];

            for (let i = 0; i < size; i++) {
              let offset = start + i;

              driver._client.Client.MData[offset] = data[i];
            }

            callback(null);
          } catch (err) {
            callback(err.message, null);
          }
        }
      );

      if (initialConnect) await driver.connect();
      else driver._active = initialActive;

      driver._client.Client.ConnectTo = jest.fn(
        async (ip, rack, slot, callback) => {
          await snooze(connectionDelay);
          if (connectThrows) return await callback("connection failed");
          driver._client.Client._connected = true;
          await callback();
        }
      );

      return driver.createSetDataAction(
        writingAreaType,
        writingOffset,
        dataToSet,
        writingLength,
        writingDBNumber
      );
    };

    it("should return method that connect if driver was not connected before", async () => {
      initialConnect = false;
      initialActive = true;

      let method = await exec();
      let result = await method();

      expect(driver._client.Client.ConnectTo).toHaveBeenCalledTimes(1);
      expect(driver._client.Client.ConnectTo.mock.calls[0][0]).toEqual(
        ipAdress
      );
      expect(driver._client.Client.ConnectTo.mock.calls[0][1]).toEqual(rack);
      expect(driver._client.Client.ConnectTo.mock.calls[0][2]).toEqual(slot);

      expect(driver.Connected).toEqual(true);
    });

    it("should return method that return set variables", async () => {
      let method = await exec();
      let result = await method();

      expect(result).toEqual([100, 101, 102, 103]);
    });

    it("should return method that throw and disconnect if connecting exceeds given time", async () => {
      initialConnect = false;
      initialActive = true;
      connectionDelay = 1000;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            let result = await method();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver.Connected).toEqual(false);
      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
    });

    it("should return method that throw and disconnect if writing exceeds given time", async () => {
      writingDelay = 1000;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            let result = await method();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
    });

    it("should return method that throw if driver is not active and not call connect", async () => {
      initialConnect = false;
      initialActive = false;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            let result = await method();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.ConnectTo).not.toHaveBeenCalled();
    });

    it("should return method that write data to db if areaType is DB", async () => {
      dataToSet = [101, 102, 103, 104];
      let method = await exec();
      await method();

      let result = await driver._getData(
        writingAreaType,
        writingOffset,
        writingLength,
        writingDBNumber
      );

      expect(result).toEqual([101, 102, 103, 104]);
    });

    it("should return method that throw and disconnect if writeDb throws", async () => {
      dbWriteThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            await method();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should return method that set data in db if areaType is I", async () => {
      dataToSet = [101, 102, 103, 104];
      writingAreaType = "I";

      let method = await exec();
      await method();

      let result = await driver._getData(
        writingAreaType,
        writingOffset,
        writingLength,
        writingDBNumber
      );

      expect(result).toEqual([101, 102, 103, 104]);
    });

    it("should return method that throw and disconnect if writeEb throws", async () => {
      writingAreaType = "I";
      ebWriteThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            await method();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should return method that get data from db if areaType is Q", async () => {
      writingAreaType = "Q";
      dataToSet = [101, 102, 103, 104];

      let method = await exec();
      await method();

      let result = await driver._getData(
        writingAreaType,
        writingOffset,
        writingLength,
        writingDBNumber
      );

      expect(result).toEqual([101, 102, 103, 104]);
    });

    it("should return method that throw and disconnect if writeAb throws", async () => {
      writingAreaType = "Q";
      abWriteThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            await method();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });

    it("should return method that get data from db if areaType is M", async () => {
      writingAreaType = "M";
      dataToSet = [101, 102, 103, 104];

      let method = await exec();
      await method();

      let result = await driver._getData(
        writingAreaType,
        writingOffset,
        writingLength,
        writingDBNumber
      );

      expect(result).toEqual([101, 102, 103, 104]);
    });

    it("should return method that throw and disconnect if readDb throws", async () => {
      writingAreaType = "M";
      mbWriteThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            let method = await exec();
            await method();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.Disconnect).toHaveBeenCalledTimes(1);
      expect(driver.Connected).toEqual(false);
    });
  });

  describe("invokeRequests", () => {
    let device;
    let ipAdress;
    let rack;
    let slot;
    let timeout;
    let ebReadThrows;
    let abReadThrows;
    let mbReadThrows;
    let dbReadThrows;
    let readingDelay;
    let driver;
    let initialConnect;
    let initialActive;
    let connectThrows;
    let connectionDelay;

    let readingAreaType;
    let readingOffset;
    let readingLength;
    let readingDBNumber;

    let request1;
    let request2;
    let request3;
    let request4;
    let request5;
    let request6;
    let request7;

    let variable1;
    let variable2;
    let variable3;
    let variable4;
    let variable5;
    let variable6;
    let variable7;
    let variable8;
    let variable9;

    let variablePayload1;
    let variablePayload2;
    let variablePayload3;
    let variablePayload4;
    let variablePayload5;
    let variablePayload6;
    let variablePayload7;
    let variablePayload8;
    let variablePayload9;

    beforeEach(async () => {
      initialConnect = true;
      initialActive = true;
      device = new S7Device();

      await device.init({
        ipAdress: "192.168.1.131",
        slot: 1,
        rack: 0,
        name: "test",
        type: "s7Device",
        timeout: 500,
        isActive: false
      });

      ipAdress = "192.168.0.101";
      rack = 3;
      timeout = 100;
      slot = 2;

      readingDelay = 10;
      ebReadThrows = false;
      abReadThrows = false;
      mbReadThrows = false;
      dbReadThrows = false;

      readingAreaType = "DB";
      readingOffset = 2;
      readingLength = 4;
      readingDBNumber = 2;

      connectThrows = false;
      connectionDelay = 10;

      variable1 = new S7Int16Variable(device);
      variable2 = new S7Int16Variable(device);
      variable3 = new S7Int16Variable(device);
      variable4 = new S7Int16Variable(device);
      variable5 = new S7Int16Variable(device);
      variable6 = new S7Int16Variable(device);
      variable7 = new S7Int16Variable(device);
      variable8 = new S7Int16Variable(device);
      variable9 = new S7Int16Variable(device);

      variablePayload1 = {
        name: "var1",
        type: "s7Int16",
        offset: 1,
        areaType: "DB",
        dbNumber: 1,
        write: true,
        value: 1
      };

      variablePayload2 = {
        name: "var2",
        type: "s7Int16",
        offset: 3,
        areaType: "DB",
        dbNumber: 1,
        write: false,
        value: 2
      };

      variablePayload3 = {
        name: "var3",
        type: "s7Int16",
        offset: 1,
        areaType: "DB",
        dbNumber: 2,
        write: true,
        value: 3
      };

      variablePayload4 = {
        name: "var4",
        type: "s7Int16",
        offset: 3,
        areaType: "DB",
        dbNumber: 2,
        write: false,
        value: 4
      };

      variablePayload5 = {
        name: "var5",
        type: "s7Int16",
        offset: 1,
        areaType: "I",
        write: false,
        value: 5
      };

      variablePayload6 = {
        name: "var6",
        type: "s7Int16",
        offset: 3,
        areaType: "I",
        write: false,
        value: 6
      };

      variablePayload7 = {
        name: "var7",
        type: "s7Int16",
        offset: 1,
        areaType: "Q",
        write: true,
        value: 7
      };

      variablePayload8 = {
        name: "var8",
        type: "s7Int16",
        offset: 3,
        areaType: "Q",
        write: true,
        value: 8
      };

      variablePayload9 = {
        name: "var9",
        type: "s7Int16",
        offset: 1,
        areaType: "M",
        write: true,
        value: 9
      };
    });

    let exec = async () => {
      driver = device.S7Driver;

      driver._client.Client.DBRead = jest.fn(
        async (dbNumber, start, size, callback) => {
          try {
            if (dbReadThrows) throw new Error("Error while reading db");

            if (!driver._client.Client.Connected())
              throw new Error("Device not connected");

            await snooze(readingDelay);

            if (!exists(driver._client.Client.DBData[dbNumber]))
              throw new Error("No such dbNumber is defined!");

            if (start + size > driver._client.Client.DBData[dbNumber].length)
              throw new Error("Invalid area");

            let data = driver._client.Client.DBData[dbNumber].slice(
              start,
              start + size
            );

            callback(null, Buffer.from(data));
          } catch (err) {
            callback(err.message, null);
          }
        }
      );

      driver._client.Client.ABRead = jest.fn(async (start, size, callback) => {
        try {
          if (abReadThrows) throw new Error("Error while reading ab");

          if (!driver._client.Client.Connected())
            throw new Error("Device not connected");
          if (start + size > driver._client.Client.QData.length)
            throw new Error("Invalid area");

          await snooze(readingDelay);

          let data = driver._client.Client.QData.slice(start, start + size);
          callback(null, Buffer.from(data));
        } catch (err) {
          callback(err.message, null);
        }
      });

      driver._client.Client.EBRead = jest.fn(async (start, size, callback) => {
        try {
          if (ebReadThrows) throw new Error("Error while reading eb");

          if (!driver._client.Client.Connected())
            throw new Error("Device not connected");
          if (start + size > driver._client.Client.IData.length)
            throw new Error("Invalid area");

          await snooze(readingDelay);

          let data = driver._client.Client.IData.slice(start, start + size);
          callback(null, Buffer.from(data));
        } catch (err) {
          callback(err.message, null);
        }
      });

      driver._client.Client.MBRead = jest.fn(async (start, size, callback) => {
        try {
          if (mbReadThrows) throw new Error("Error while reading mb");

          if (!driver._client.Client.Connected())
            throw new Error("Device not connected");
          if (start + size > driver._client.Client.MData.length)
            throw new Error("Invalid area");

          await snooze(readingDelay);

          let data = driver._client.Client.MData.slice(start, start + size);
          callback(null, Buffer.from(data));
        } catch (err) {
          callback(err.message, null);
        }
      });

      if (initialConnect) await driver.connect();
      else driver._active = initialActive;

      driver._client.Client.ConnectTo = jest.fn(
        async (ip, rack, slot, callback) => {
          await snooze(connectionDelay);
          if (connectThrows) return await callback("connection failed");
          driver._client.Client._connected = true;
          await callback();
        }
      );

      await variable1.init(variablePayload1);
      await variable2.init(variablePayload2);
      await variable3.init(variablePayload3);
      await variable4.init(variablePayload4);
      await variable5.init(variablePayload5);
      await variable6.init(variablePayload6);
      await variable7.init(variablePayload7);
      await variable8.init(variablePayload8);
      await variable9.init(variablePayload9);

      request1 = new S7Request(
        driver,
        variablePayload1.areaType,
        variablePayload1.write,
        1000,
        variablePayload1.dbNumber
      );

      request1.addVariable(variable1);

      request2 = new S7Request(
        driver,
        variablePayload2.areaType,
        variablePayload2.write,
        1000,
        variablePayload2.dbNumber
      );
      request2.addVariable(variable2);

      request3 = new S7Request(
        driver,
        variablePayload3.areaType,
        variablePayload3.write,
        1000,
        variablePayload3.dbNumber
      );
      request3.addVariable(variable3);

      request4 = new S7Request(
        driver,
        variablePayload4.areaType,
        variablePayload4.write,
        1000,
        variablePayload4.dbNumber
      );
      request4.addVariable(variable4);

      request5 = new S7Request(
        driver,
        variablePayload5.areaType,
        variablePayload5.write
      );
      request5.addVariable(variable5);
      request5.addVariable(variable6);

      request6 = new S7Request(
        driver,
        variablePayload7.areaType,
        variablePayload7.write
      );
      request6.addVariable(variable7);
      request6.addVariable(variable8);

      request7 = new S7Request(
        driver,
        variablePayload9.areaType,
        variablePayload9.write
      );
      request7.addVariable(variable9);

      let requests = [
        request1,
        request2,
        request3,
        request4,
        request5,
        request6,
        request7
      ];

      return driver.invokeRequests(requests);
    };

    it("should invoke read for every request of reading and write for every request of write", async () => {
      await exec();

      expect(driver._client.Client.DBRead).toHaveBeenCalledTimes(2);

      expect(driver._client.Client.DBRead.mock.calls[0][0]).toEqual(1);
      expect(driver._client.Client.DBRead.mock.calls[0][1]).toEqual(3);
      expect(driver._client.Client.DBRead.mock.calls[0][2]).toEqual(2);

      expect(driver._client.Client.DBRead.mock.calls[1][0]).toEqual(2);
      expect(driver._client.Client.DBRead.mock.calls[1][1]).toEqual(3);
      expect(driver._client.Client.DBRead.mock.calls[1][2]).toEqual(2);

      expect(driver._client.Client.DBWrite).toHaveBeenCalledTimes(2);

      expect(driver._client.Client.DBWrite.mock.calls[0][0]).toEqual(1);
      expect(driver._client.Client.DBWrite.mock.calls[0][1]).toEqual(1);
      expect(driver._client.Client.DBWrite.mock.calls[0][2]).toEqual(2);
      expect([...driver._client.Client.DBWrite.mock.calls[0][3]]).toEqual([
        0,
        1
      ]);

      expect(driver._client.Client.DBWrite.mock.calls[1][0]).toEqual(2);
      expect(driver._client.Client.DBWrite.mock.calls[1][1]).toEqual(1);
      expect(driver._client.Client.DBWrite.mock.calls[1][2]).toEqual(2);
      expect([...driver._client.Client.DBWrite.mock.calls[1][3]]).toEqual([
        0,
        3
      ]);

      expect(driver._client.Client.EBRead).toHaveBeenCalledTimes(1);

      expect(driver._client.Client.EBRead.mock.calls[0][0]).toEqual(1);
      expect(driver._client.Client.EBRead.mock.calls[0][1]).toEqual(4);

      expect(driver._client.Client.ABWrite).toHaveBeenCalledTimes(1);

      expect(driver._client.Client.ABWrite.mock.calls[0][0]).toEqual(1);
      expect(driver._client.Client.ABWrite.mock.calls[0][1]).toEqual(4);
      expect([...driver._client.Client.ABWrite.mock.calls[0][2]]).toEqual([
        0,
        7,
        0,
        8
      ]);

      expect(driver._client.Client.MBWrite).toHaveBeenCalledTimes(1);

      expect(driver._client.Client.MBWrite.mock.calls[0][0]).toEqual(1);
      expect(driver._client.Client.MBWrite.mock.calls[0][1]).toEqual(2);
      expect([...driver._client.Client.MBWrite.mock.calls[0][2]]).toEqual([
        0,
        9
      ]);

      expect(driver._busy).toEqual(false);
    });

    it("should set taken data to variables", async () => {
      await exec();

      expect(variable2.Data).toEqual([4, 5]);

      expect(variable4.Data).toEqual([11, 12]);

      expect(variable5.Data).toEqual([13, 14]);

      expect(variable6.Data).toEqual([15, 16]);
    });

    it("should return object with new data", async () => {
      let result = await exec();

      expect(Object.values(result).length).toEqual(7);

      expect([...result[request1.RequestId]]).toEqual([0, 1]);
      expect([...result[request2.RequestId]]).toEqual([4, 5]);
      expect([...result[request3.RequestId]]).toEqual([0, 3]);
      expect([...result[request4.RequestId]]).toEqual([11, 12]);
      expect([...result[request5.RequestId]]).toEqual([13, 14, 15, 16]);
      expect([...result[request6.RequestId]]).toEqual([0, 7, 0, 8]);
      expect([...result[request7.RequestId]]).toEqual([0, 9]);
    });

    it("should throw, set busy to false and not invoke read for other request of reading and write for every request of write - even if on of request throws", async () => {
      ebReadThrows = true;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._client.Client.DBRead).toHaveBeenCalledTimes(2);

      expect(driver._client.Client.DBRead.mock.calls[0][0]).toEqual(1);
      expect(driver._client.Client.DBRead.mock.calls[0][1]).toEqual(3);
      expect(driver._client.Client.DBRead.mock.calls[0][2]).toEqual(2);

      expect(driver._client.Client.DBRead.mock.calls[1][0]).toEqual(2);
      expect(driver._client.Client.DBRead.mock.calls[1][1]).toEqual(3);
      expect(driver._client.Client.DBRead.mock.calls[1][2]).toEqual(2);

      expect(driver._client.Client.DBWrite).toHaveBeenCalledTimes(2);

      expect(driver._client.Client.DBWrite.mock.calls[0][0]).toEqual(1);
      expect(driver._client.Client.DBWrite.mock.calls[0][1]).toEqual(1);
      expect(driver._client.Client.DBWrite.mock.calls[0][2]).toEqual(2);
      expect([...driver._client.Client.DBWrite.mock.calls[0][3]]).toEqual([
        0,
        1
      ]);

      expect(driver._client.Client.DBWrite.mock.calls[1][0]).toEqual(2);
      expect(driver._client.Client.DBWrite.mock.calls[1][1]).toEqual(1);
      expect(driver._client.Client.DBWrite.mock.calls[1][2]).toEqual(2);
      expect([...driver._client.Client.DBWrite.mock.calls[1][3]]).toEqual([
        0,
        3
      ]);

      expect(driver._client.Client.EBRead).toHaveBeenCalledTimes(1);

      expect(driver._client.Client.EBRead.mock.calls[0][0]).toEqual(1);
      expect(driver._client.Client.EBRead.mock.calls[0][1]).toEqual(4);

      expect(driver._client.Client.ABWrite).not.toHaveBeenCalled();

      expect(driver._client.Client.MBRead).not.toHaveBeenCalled();

      expect(driver._busy).toEqual(false);
    });

    it("should throw if driver is not active", async () => {
      initialConnect = false;
      initialActive = false;

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(driver._busy).toEqual(false);
    });
  });
});
