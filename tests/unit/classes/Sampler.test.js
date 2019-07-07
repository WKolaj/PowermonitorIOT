const Sampler = require("../../../classes/sampler/Sampler");
const { snooze } = require("../../../utilities/utilities");

describe("Sampler", () => {
  describe("constructor", () => {
    let exec = () => {
      return new Sampler();
    };

    it("should create new Sampler and init its properties", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result._devices).toEqual({});
      expect(result._tickHandler).toEqual(null);
      expect(result._lastTickTimeNumber).toEqual(0);
      expect(result._events).toBeDefined();
      expect(result._active).toEqual(false);
      expect(result._tickInterval).toEqual(100);
    });
  });

  describe("doesTickIdMatchesTick", () => {
    let tickId;
    let tickNumber;

    beforeEach(() => {
      tickId = 15;
      tickNumber = 150;
    });

    let exec = () => {
      return Sampler.doesTickIdMatchesTick(tickNumber, tickId);
    };

    it("should return true if tickNumber matches tickId", () => {
      let result = exec();

      expect(result).toBeTruthy();
    });

    it("should return true if tickNumber doest not match tickId", () => {
      tickNumber = 151;

      let result = exec();

      expect(result).toBeFalsy();
    });

    it("should always return false if tickId is zero", () => {
      tickId = 0;

      let result = exec();

      expect(result).toBeFalsy();
    });
  });

  describe("convertDateToTickNumber", () => {
    let date;

    beforeEach(() => {
      date = 1234;
    });

    let exec = () => {
      return Sampler.convertDateToTickNumber(date);
    };

    it("should convert date to tickId - divide it by 1000 and round", () => {
      let result = exec();

      expect(result).toEqual(1);
    });

    it("should round to nearest value if value is lesser", () => {
      date = 2999;
      let result = exec();

      expect(result).toEqual(3);
    });

    it("should round to nearest value if value is greater", () => {
      date = 3001;
      let result = exec();

      expect(result).toEqual(3);
    });

    it("should round to nearest value if value is lesser", () => {
      date = 2999;
      let result = exec();

      expect(result).toEqual(3);
    });

    it("should round to nearest value if value is greater", () => {
      date = 3001;
      let result = exec();

      expect(result).toEqual(3);
    });
  });

  describe("convertSampleTimeToTickId", () => {
    let sampleTime;

    beforeEach(() => {
      sampleTime = 15;
    });

    let exec = () => {
      return Sampler.convertSampleTimeToTickId(sampleTime);
    };

    it("should convert sampleTime to tickId - return sampleTime in seconds", () => {
      let result = exec();

      expect(result).toEqual(15);
    });
  });

  describe("convertTickIdToSampleTime", () => {
    let tickId;

    beforeEach(() => {
      tickId = 15;
    });

    let exec = () => {
      return Sampler.convertTickIdToSampleTime(tickId);
    };

    it("should convert tickId to sampleTime - return sampleTime in seconds", () => {
      let result = exec();

      expect(result).toEqual(15);
    });
  });

  describe("_shouldEmitTick", () => {
    let sampler;
    let lastTickTimeNumber;
    let timeNumber;

    beforeEach(() => {
      sampler = new Sampler();
      lastTickTimeNumber = 100;
      timeNumber = 100;
    });

    let exec = () => {
      sampler._lastTickTimeNumber = lastTickTimeNumber;
      return sampler._shouldEmitTick(timeNumber);
    };

    it("should return false if lastTickTimeNumber is equal actual tickTimeNumber", () => {
      let result = exec();

      expect(result).toBeFalsy();
    });

    it("should return true if lastTickTimeNumber is different than actual tickTimeNumber", () => {
      timeNumber = 150;
      let result = exec();

      expect(result).toBeTruthy();
    });
  });

  describe("addDevice", () => {
    let sampler;
    let mockDevice;
    let deviceName;
    let deviceId;

    beforeEach(() => {
      deviceName = "Test device";
      deviceId = 1234;
      sampler = new Sampler();
      mockDevice = { Name: deviceName, Id: deviceId };
    });

    let exec = () => {
      return sampler.addDevice(mockDevice);
    };

    it("should add new device to sampler", () => {
      exec();
      expect(sampler.AllDevices[deviceId]).toEqual(mockDevice);
    });
  });

  describe("removeDevice", () => {
    let sampler;
    let mockDevice;
    let deviceName;

    beforeEach(() => {
      deviceName = "Test device";
      sampler = new Sampler();
      mockDevice = { Name: deviceName };
      sampler.addDevice(mockDevice);
    });

    let exec = () => {
      return sampler.removeDevice(mockDevice);
    };

    it("should remove device from sampler", () => {
      exec();
      expect(sampler.AllDevices[deviceName]).toBeUndefined();
    });

    it("should throw if there is no such device added to sampler", () => {
      //Removing first time
      exec();

      //removing the same second time

      expect(() => {
        exec();
      }).toThrow();
    });
  });

  describe("_refreshAllDevices", () => {
    let sampler;
    let device1Mock;
    let device1Id;
    let device1Name;
    let device1RefreshMock;
    let device2Mock;
    let device2Id;
    let device2Name;
    let device2RefreshMock;
    let device3Mock;
    let device3Id;
    let device3Name;
    let device3RefreshMock;
    let tickNumber;

    beforeEach(() => {
      tickNumber = 123;

      device1Name = "Dev1";
      device1Id = "0001";
      device1RefreshMock = jest.fn();
      device1Mock = {
        Name: device1Name,
        refresh: device1RefreshMock,
        Id: device1Id,
        getRefreshGroupId: jest.fn().mockReturnValue("group1")
      };

      device2Name = "Dev2";
      device2Id = "0002";
      device2RefreshMock = jest.fn();
      device2Mock = {
        Name: device2Name,
        refresh: device2RefreshMock,
        Id: device2Id,
        getRefreshGroupId: jest.fn().mockReturnValue("group2")
      };

      device3Name = "Dev3";
      device3Id = "0003";
      device3RefreshMock = jest.fn();
      device3Mock = {
        Name: device3Name,
        refresh: device3RefreshMock,
        Id: device3Id,
        getRefreshGroupId: jest.fn().mockReturnValue("group3")
      };

      sampler = new Sampler();
      sampler.addDevice(device1Mock);
      sampler.addDevice(device2Mock);
      sampler.addDevice(device3Mock);
    });

    let exec = () => {
      return sampler._refreshAllDevices(tickNumber);
    };

    it("Should invoke refresh of all devices with the parameter of tickNumber", async () => {
      await exec();

      expect(device1RefreshMock).toHaveBeenCalledTimes(1);
      expect(device1RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
      expect(device2RefreshMock).toHaveBeenCalledTimes(1);
      expect(device2RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
      expect(device3RefreshMock).toHaveBeenCalledTimes(1);
      expect(device3RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("Should invoke refresh of all devices with the parameter of tickNumber", async () => {
      await exec();

      expect(device1RefreshMock).toHaveBeenCalledTimes(1);
      expect(device1RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
      expect(device2RefreshMock).toHaveBeenCalledTimes(1);
      expect(device2RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
      expect(device3RefreshMock).toHaveBeenCalledTimes(1);
      expect(device3RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("Should not throw if one of devices throws an error while refreshing", async () => {
      device1Mock.refresh = jest.fn().mockImplementation(() => {
        throw new Error();
      });

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
  });

  describe("_refreshAllDevices", () => {
    let sampler;
    let device1Mock;
    let device1Id;
    let device1Name;
    let device1RefreshMock;
    let device2Mock;
    let device2Id;
    let device2Name;
    let device2RefreshMock;
    let device3Mock;
    let device3Id;
    let device3Name;
    let device3RefreshMock;
    let tickNumber;

    beforeEach(() => {
      tickNumber = 123;

      device1Name = "Dev1";
      device1Id = "0001";
      device1RefreshMock = jest.fn();
      device1Mock = {
        Name: device1Name,
        refresh: device1RefreshMock,
        Id: device1Id,
        getRefreshGroupId: jest.fn().mockReturnValue("group1")
      };

      device2Name = "Dev2";
      device2Id = "0002";
      device2RefreshMock = jest.fn();
      device2Mock = {
        Name: device2Name,
        refresh: device2RefreshMock,
        Id: device2Id,
        getRefreshGroupId: jest.fn().mockReturnValue("group2")
      };

      device3Name = "Dev3";
      device3Id = "0003";
      device3RefreshMock = jest.fn();
      device3Mock = {
        Name: device3Name,
        refresh: device3RefreshMock,
        Id: device3Id,
        getRefreshGroupId: jest.fn().mockReturnValue("group3")
      };

      sampler = new Sampler();
      sampler.addDevice(device1Mock);
      sampler.addDevice(device2Mock);
      sampler.addDevice(device3Mock);
    });

    let exec = () => {
      return sampler._refreshAllDevices(tickNumber);
    };

    it("Should invoke refresh of all devices with the parameter of tickNumber", async () => {
      await exec();

      expect(device1RefreshMock).toHaveBeenCalledTimes(1);
      expect(device1RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
      expect(device2RefreshMock).toHaveBeenCalledTimes(1);
      expect(device2RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
      expect(device3RefreshMock).toHaveBeenCalledTimes(1);
      expect(device3RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("Should invoke refresh of all devices with the parameter of tickNumber", async () => {
      await exec();

      expect(device1RefreshMock).toHaveBeenCalledTimes(1);
      expect(device1RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
      expect(device2RefreshMock).toHaveBeenCalledTimes(1);
      expect(device2RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
      expect(device3RefreshMock).toHaveBeenCalledTimes(1);
      expect(device3RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("Should not invoke refresh methods parallel of devices from the same group but inoke in parallel device which are not from the same group", async () => {
      let checkValueNotParallel = 0;
      let checkValueParallel = 0;
      device1Mock.getRefreshGroupId = jest.fn().mockReturnValue("group1");
      device2Mock.getRefreshGroupId = jest.fn().mockReturnValue("group1");
      device3Mock.getRefreshGroupId = jest.fn().mockReturnValue("group2");

      let runningInParallelWorks = true;
      let runningNotInParallelWorks = true;
      //Methods for device1 and device2 should not be invoked in parralel - one after antorher
      device1Mock.refresh = async () => {
        checkValueNotParallel = 1;
        await snooze(1000);
        if (checkValueNotParallel !== 1) runningNotInParallelWorks = false;
        if (checkValueParallel !== 3) runningInParallelWorks = false;
      };

      device2Mock.refresh = async () => {
        checkValueNotParallel = 2;
        await snooze(1000);
        if (checkValueNotParallel !== 2) runningNotInParallelWorks = false;
        if (checkValueParallel !== 3) runningInParallelWorks = false;
      };

      //Method refresh for device3Mock should be invoked in parralel and modify variable
      device3Mock.refresh = async () => {
        await snooze(500);
        checkValueParallel = 3;
      };

      await exec();

      expect(runningInParallelWorks).toEqual(true);
      expect(runningNotInParallelWorks).toEqual(true);
    });

    it("Should invoke rest of devices from the same group if one throws during refreshing", async () => {
      device1Mock.getRefreshGroupId = jest.fn().mockReturnValue("group1");
      device2Mock.getRefreshGroupId = jest.fn().mockReturnValue("group1");
      device3Mock.getRefreshGroupId = jest.fn().mockReturnValue("group1");

      //Methods for device1 and device2 should not be invoked in parralel - one after antorher
      device1Mock.refresh = async () => {
        throw new Error("Test error");
      };

      await exec();

      expect(device2RefreshMock).toHaveBeenCalledTimes(1);
      expect(device2RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
      expect(device3RefreshMock).toHaveBeenCalledTimes(1);
      expect(device3RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("Should not throw if one of devices throws an error while refreshing", async () => {
      device1Mock.refresh = jest.fn().mockImplementation(() => {
        throw new Error();
      });

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
  });

  describe("_emitTick", () => {
    let sampler;
    let device1Mock;
    let device1Name;
    let device1RefreshMock;
    let device1Id;
    let device2Mock;
    let device2Name;
    let device2RefreshMock;
    let device2Id;
    let device3Mock;
    let device3Name;
    let device3RefreshMock;
    let tickNumber;
    let tickEventHandler;
    let device3Id;

    beforeEach(() => {
      tickNumber = 123;

      device1Name = "Dev1";
      device1Id = "0001";
      device1RefreshMock = jest.fn();
      device1Mock = {
        Name: device1Name,
        refresh: device1RefreshMock,
        Id: device1Id,
        getRefreshGroupId: jest.fn().mockReturnValue("group1")
      };

      device2Name = "Dev2";
      device2Id = "0002";
      device2RefreshMock = jest.fn();
      device2Mock = {
        Name: device2Name,
        refresh: device2RefreshMock,
        Id: device2Id,
        getRefreshGroupId: jest.fn().mockReturnValue("group2")
      };

      device3Name = "Dev3";
      device3Id = "0003";
      device3RefreshMock = jest.fn();
      device3Mock = {
        Name: device3Name,
        refresh: device3RefreshMock,
        Id: device3Id,
        getRefreshGroupId: jest.fn().mockReturnValue("group3")
      };

      sampler = new Sampler();
      sampler.addDevice(device1Mock);
      sampler.addDevice(device2Mock);
      sampler.addDevice(device3Mock);

      tickEventHandler = jest.fn();

      sampler.Events.on("OnTick", args => tickEventHandler(args));
    });

    let exec = () => {
      return sampler._emitTick(tickNumber);
    };

    it("Should invoke refresh of all devices with the parameter of tickNumber", async () => {
      await exec();

      expect(device1RefreshMock).toHaveBeenCalledTimes(1);
      expect(device1RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
      expect(device2RefreshMock).toHaveBeenCalledTimes(1);
      expect(device2RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
      expect(device3RefreshMock).toHaveBeenCalledTimes(1);
      expect(device3RefreshMock.mock.calls[0][0]).toEqual(tickNumber);
    });

    it("Should not throw if one of devices throws an error while refreshing", async () => {
      device1Mock.refresh = jest.fn().mockImplementation(() => {
        throw new Error();
      });

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

    it("Should invoke event OnTick", async () => {
      await exec();
      expect(tickEventHandler).toHaveBeenCalledTimes(1);
      expect(tickEventHandler.mock.calls[0][0][0]).toEqual(tickNumber);
    });

    it("Should set new value of lastTimeTickNumber", async () => {
      await exec();
      expect(sampler._lastTickTimeNumber).toEqual(tickNumber);
    });

    it("Should not throw if one of events throw an error", async () => {
      sampler.Events.on("OnTick", args => {
        throw new Error("This is na error");
      });
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
  });

  describe("_tick", () => {
    let sampler;
    let emitTickMock;
    let active;
    let shouldEmitMock;

    beforeEach(() => {
      active = true;
      emitTickMock = jest.fn();
      shouldEmitMock = undefined;
      sampler = new Sampler();
    });

    let exec = () => {
      sampler._active = active;
      sampler._emitTick = emitTickMock;
      if (shouldEmitMock) sampler._shouldEmitTick = shouldEmitMock;
      return sampler._tick();
    };

    it("Should invoke _emitTickMock with argument of new timeNumber", () => {
      let firstDate = Sampler.convertDateToTickNumber(Date.now());

      exec();

      let lastDate = Sampler.convertDateToTickNumber(Date.now());

      expect(emitTickMock).toHaveBeenCalledTimes(1);
      expect(emitTickMock.mock.calls[0][0]).toBeGreaterThanOrEqual(firstDate);
      expect(emitTickMock.mock.calls[0][0]).toBeLessThanOrEqual(lastDate);
    });

    it("Should not call anything if sampler is not active", () => {
      active = false;
      exec();

      expect(emitTickMock).not.toHaveBeenCalled();
    });

    it("Should not call _emitTickMock if function shouldEmit return false on the basis of timeNumber", () => {
      shouldEmitMock = () => false;
      exec();

      expect(emitTickMock).not.toHaveBeenCalled();
    });
  });

  describe("start", () => {
    let sampler;
    let tickMock;
    let active;

    beforeEach(() => {
      jest.useFakeTimers();

      active = false;
      tickMock = jest.fn();

      sampler = new Sampler();
    });

    let exec = () => {
      sampler._active = active;
      sampler._tick = tickMock;
      return sampler.start();
    };

    it("Should start handler invoking tick every 100 ms", () => {
      exec();
      jest.advanceTimersByTime(1000);

      expect(tickMock).toHaveBeenCalledTimes(10);
      expect(sampler._tickHandler).toBeDefined();
    });

    it("Should set active to true", () => {
      exec();
      expect(sampler.Active).toEqual(true);
    });

    it("Should not start handler invoking tick every 100 ms if sampler already active", () => {
      active = true;
      exec();
      jest.advanceTimersByTime(1000);

      expect(tickMock).not.toHaveBeenCalled();
    });
  });

  describe("stop", () => {
    let sampler;

    beforeEach(() => {
      sampler = new Sampler();
    });

    let exec = () => {
      sampler.start();
      return sampler.stop();
    };

    it("Should stop sampler intervalHandler", () => {
      exec();
      expect(sampler._tickHandler).toEqual(null);
    });

    it("Should set active to false", () => {
      exec();
      expect(sampler.Active).toEqual(false);
    });
  });

  describe("Active", () => {
    let sampler;

    let exec = () => {
      sampler = new Sampler();
      return sampler.Active;
    };

    it("should return if Sampler is active", () => {
      expect(exec()).toEqual(sampler._active);
    });
  });

  describe("AllDevices", () => {
    let sampler;

    let exec = () => {
      sampler = new Sampler();
      return sampler.AllDevices;
    };

    it("should return samplers all devices", () => {
      expect(exec()).toEqual(sampler._devices);
    });
  });

  describe("LastTickTimeNumber", () => {
    let sampler;

    let exec = () => {
      sampler = new Sampler();
      return sampler.LastTickTimeNumber;
    };

    it("should return samplers LastTickTimeNumber", () => {
      expect(exec()).toEqual(sampler._lastTickTimeNumber);
    });
  });

  describe("Events", () => {
    let sampler;

    let exec = () => {
      sampler = new Sampler();
      return sampler.Events;
    };

    it("should return samplers event emitter", () => {
      expect(exec()).toEqual(sampler._events);
    });
  });
});
