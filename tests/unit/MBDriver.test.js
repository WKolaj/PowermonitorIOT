let MBDriver = require("../../classes/driver/Modbus/MBDriver");
let ModbusDriverActions = require("../../classes/driver/Modbus/MBDriverActions");
let ModbusDriverAction = require("../../classes/driver/Modbus/MBDriverAction");

//Function for hanging thread
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

function MockModbusRTU() {
  this._id = 0;
  this.isOpen = false;
  this._connectTCP = (ipAdress, options) =>
    new Promise((resolve, reject) => {
      this.isOpen = true;
      return resolve();
    });
  this.setID = jest.fn().mockImplementation(id => (this._id = id));
  this.getID = jest.fn().mockImplementation(() => this._id);
  this.connectTCP = jest.fn().mockImplementation(this._connectTCP);
  this.close = jest.fn().mockImplementation(
    ipAdress =>
      new Promise((resolve, reject) => {
        this.isOpen = false;
        resolve();
        return resolve();
      })
  );

  this._readCoilsResult = 10;
  this._readDiscreteInputsResult = 11;
  this._readHoldingRegistersResult = 12;
  this._readInputRegistersResult = 13;

  this.readCoils = jest.fn().mockResolvedValue({ data: this._readCoilsResult });
  this.readDiscreteInputs = jest
    .fn()
    .mockResolvedValue({ data: this._readDiscreteInputsResult });
  this.readHoldingRegisters = jest
    .fn()
    .mockResolvedValue({ data: this._readHoldingRegistersResult });
  this.readInputRegisters = jest
    .fn()
    .mockResolvedValue({ data: this._readInputRegistersResult });

  this.writeCoil = jest.fn().mockResolvedValue(undefined);
  this.writeCoils = jest.fn().mockResolvedValue(undefined);
  this.writeRegisters = jest.fn().mockResolvedValue(undefined);
  this.writeRegister = jest.fn().mockResolvedValue(undefined);
}

describe("MBDriver", () => {
  describe("constructor", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      unitId = 5;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
    };

    it("should create mbDevice based on given parameters", () => {
      exec();

      expect(mbDriver._mbDevice).toEqual(mbDevice);
      expect(mbDriver._ipAdress).toEqual(ipAdress);
      expect(mbDriver._portNumber).toEqual(portNumber);
      expect(mbDriver._timeout).toEqual(timeout);
      expect(mbDriver._unitId).toEqual(unitId);
    });

    //for mbGateway child
    it("should not throw if mbDriver is null", () => {
      mbDevice = undefined;

      exec();

      expect(mbDriver).toBeDefined();
    });

    it("should set busy to false", () => {
      exec();

      expect(mbDriver._busy).toEqual(false);
    });

    it("should set active to false", () => {
      exec();

      expect(mbDriver._active).toEqual(false);
    });

    it("should create ModbusRTU client", () => {
      exec();

      expect(mbDriver._client).toBeDefined();
    });

    it("should set 192.168.0.100 if ipAdress is empty", () => {
      ipAdress = undefined;

      exec();

      expect(mbDriver._ipAdress).toEqual("192.168.0.100");
    });

    it("should set port 502 if port is empty", () => {
      portNumber = undefined;

      exec();

      expect(mbDriver._portNumber).toEqual(502);
    });

    it("should set timeout 2000 if timeout is empty", () => {
      timeout = undefined;

      exec();

      expect(mbDriver._timeout).toEqual(2000);
    });

    it("should set unitId 1 if timeout is empty", () => {
      unitId = undefined;

      exec();

      expect(mbDriver._unitId).toEqual(1);
    });
  });

  describe("MBDevice", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      unitId = 5;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      return mbDriver.MBDevice;
    };

    it("should return mbDriver", () => {
      let device = exec();

      expect(device).toBeDefined();
      expect(device).toEqual(mbDevice);
    });
  });

  describe("IPAdress", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      unitId = 5;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      return mbDriver.IPAdress;
    };

    it("should return ipAdress", () => {
      let device = exec();

      expect(device).toBeDefined();
      expect(device).toEqual(ipAdress);
    });
  });

  describe("PortNumber", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      unitId = 5;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      return mbDriver.PortNumber;
    };

    it("should return ipAdress", () => {
      let port = exec();

      expect(port).toBeDefined();
      expect(port).toEqual(portNumber);
    });
  });

  describe("Timeout", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      unitId = 5;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      return mbDriver.Timeout;
    };

    it("should return timeout", () => {
      let returnedTimeout = exec();

      expect(returnedTimeout).toBeDefined();
      expect(returnedTimeout).toEqual(timeout);
    });
  });

  describe("UnitID", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      unitId = 5;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      return mbDriver.UnitID;
    };

    it("should return unitId", () => {
      let returnedUnitId = exec();

      expect(returnedUnitId).toBeDefined();
      expect(returnedUnitId).toEqual(unitId);
    });
  });

  describe("Connected", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      unitId = 5;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      return mbDriver.Connected;
    };

    it("should return _isOpen", () => {
      let connected = exec();

      expect(connected).toBeDefined();
      expect(connected).toEqual(false);
    });
  });

  describe("IsActive", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;
    let isActive;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      unitId = 5;
      isActive = true;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._active = isActive;
      return mbDriver.IsActive;
    };

    it("should return _isOpen", () => {
      let isActiveReturned = exec();

      expect(isActiveReturned).toBeDefined();
      expect(isActiveReturned).toEqual(isActive);
    });
  });

  describe("IsBusy", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;
    let isBusy;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      unitId = 5;
      isBusy = true;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._busy = isBusy;
      return mbDriver.IsBusy;
    };

    it("should return _busy", () => {
      let isBusyReturned = exec();

      expect(isBusyReturned).toBeDefined();
      expect(isBusyReturned).toEqual(isBusy);
    });
  });

  describe("_connectWithoutActivating", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;
    let mockModbus;
    let isActive;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 1000;
      unitId = 5;
      mockModbus = new MockModbusRTU();
      isActive = true;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      return mbDriver._connectWithoutActivating();
    };

    it("should connectTCP using modbus-serial with ipAdress ", async () => {
      await exec();
      expect(mockModbus.connectTCP).toHaveBeenCalledTimes(1);
      expect(mockModbus.connectTCP.mock.calls[0][0]).toEqual(ipAdress);
      expect(mockModbus.connectTCP.mock.calls[0][1]).toMatchObject({
        port: portNumber
      });
    });

    it("should active connection in ModbusRTU client ", async () => {
      await exec();
      expect(mockModbus.connectTCP).toHaveBeenCalledTimes(1);
      expect(mbDriver.Connected).toEqual(true);
    });

    it("should reject if device is not active ", async () => {
      isActive = false;
      await expect(exec()).rejects.toBeDefined();
    });

    it("should reject if TCPConnect rejects ", async () => {
      mockModbus.connectTCP = () => Promise(resolve, reject => reject("test"));
      await expect(exec()).rejects.toBeDefined();
    });

    it("should resolve if connecting hangs for less than timeout", async () => {
      mockModbus.connectTCP = async () => {
        await snooze(500);
      };
      await expect(exec()).resolves.toBeDefined();
      expect(mockModbus.close).not.toHaveBeenCalled();
    });

    it("should reject and disconnect but not deactive if connecting hangs for more than timeout", async () => {
      mockModbus.connectTCP = async () => {
        await snooze(2000);
      };
      await expect(exec()).rejects.toBeDefined();
      expect(mockModbus.close).toHaveBeenCalledTimes(1);
      expect(mbDriver.IsActive).toEqual(true);
    });
  });

  describe("connect", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;
    let mockModbus;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 1000;
      unitId = 5;
      mockModbus = new MockModbusRTU();
      isActive = true;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      return mbDriver.connect();
    };

    it("should activate driver", async () => {
      await exec();
      expect(mbDriver.IsActive).toEqual(true);
    });

    it("should call _connectWithoutActivating once", async () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._connectWithoutActivating = jest.fn();
      await mbDriver.connect();

      expect(mbDriver._connectWithoutActivating).toHaveBeenCalledTimes(1);
    });

    it("should set busy to false", async () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._busy = true;
      await mbDriver.connect();

      expect(mbDriver.IsBusy).toBeFalsy();
    });
  });

  describe("_disconnectWithoutDeactive", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;
    let mockModbus;
    let isActive;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 1000;
      unitId = 5;
      mockModbus = new MockModbusRTU();
      isActive = true;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      return mbDriver._disconnectWithoutDeactive();
    };

    it("should disconnectTCP using modbus-serial  ", async () => {
      await exec();
      expect(mockModbus.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("disconnect", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;
    let mockModbus;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 1000;
      unitId = 5;
      mockModbus = new MockModbusRTU();
      isActive = true;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      return mbDriver.disconnect();
    };

    it("should deactivate driver", async () => {
      await exec();
      expect(mbDriver.IsActive).toEqual(false);
    });

    it("should call _disconnectWithoutDeactive once", async () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._disconnectWithoutDeactive = jest.fn();
      await mbDriver.disconnect();

      expect(mbDriver._disconnectWithoutDeactive).toHaveBeenCalledTimes(1);
    });

    it("should set busy to false", async () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._busy = true;
      await mbDriver.disconnect();

      expect(mbDriver.IsBusy).toBeFalsy();
    });
  });

  describe("createGetDataAction", () => {
    let mbDevice;
    let actionName;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;
    let mockModbus;
    let mockGetData;
    let fcCode, offset, length, passedUnitId;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      actionName = "TestAction";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 1000;
      unitId = 5;
      mockModbus = new MockModbusRTU();
      isActive = true;
      mockGetData = jest.fn();
      fcCode = 1;
      offset = 2;
      length = 3;
      passedUnitId = 4;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._getData = mockGetData;
      return mbDriver.createGetDataAction(
        actionName,
        fcCode,
        offset,
        length,
        passedUnitId
      );
    };

    it("should return action as a promise that invokes _getData", async () => {
      let action = await exec();
      await action.Function();

      expect(mockGetData).toHaveBeenCalledTimes(1);
    });

    it("should return action as a promise that invokes _getData with arguments pass as an argument", async () => {
      let action = await exec();
      await action.Function();

      expect(mockGetData.mock.calls[0][0]).toEqual(fcCode);
      expect(mockGetData.mock.calls[0][1]).toEqual(offset);
      expect(mockGetData.mock.calls[0][2]).toEqual(length);
      expect(mockGetData.mock.calls[0][3]).toEqual(passedUnitId);
    });

    it("should return action as a promise that invokes _getData with arguments pass as an argument and unitId from driver if unitId is not provided", async () => {
      passedUnitId = undefined;
      let action = await exec();
      await action.Function();

      expect(mockGetData.mock.calls[0][0]).toEqual(fcCode);
      expect(mockGetData.mock.calls[0][1]).toEqual(offset);
      expect(mockGetData.mock.calls[0][2]).toEqual(length);
      expect(mockGetData.mock.calls[0][3]).toEqual(unitId);
    });

    it("should set action name", async () => {
      let action = await exec();

      expect(action.Name).toEqual(actionName);
    });
  });

  describe("createSetDataAction", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;
    let mockModbus;
    let mockSetData;
    let actionName;
    let fcCode, offset, value, passedUnitId;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      actionName = "ActionTest";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 1000;
      unitId = 5;
      mockModbus = new MockModbusRTU();
      isActive = true;
      mockSetData = jest.fn();
      fcCode = 1;
      offset = 2;
      value = 3;
      passedUnitId = 4;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._setData = mockSetData;
      return mbDriver.createSetDataAction(
        actionName,
        fcCode,
        offset,
        value,
        passedUnitId
      );
    };

    it("should return action as a promise that invokes _setData", async () => {
      let action = await exec();
      await action.Function();

      expect(mockSetData).toHaveBeenCalledTimes(1);
    });

    it("should return action as a promise that invokes _setData with arguments pass as an argument", async () => {
      let action = await exec();
      await action.Function();

      expect(mockSetData.mock.calls[0][0]).toEqual(fcCode);
      expect(mockSetData.mock.calls[0][1]).toEqual(offset);
      expect(mockSetData.mock.calls[0][2]).toEqual(value);
      expect(mockSetData.mock.calls[0][3]).toEqual(passedUnitId);
    });

    it("should return action as a promise that invokes _setData with arguments pass as an argument and unitId from driver if unitId is not provided", async () => {
      passedUnitId = undefined;
      let action = await exec();
      await action.Function();

      expect(mockSetData.mock.calls[0][0]).toEqual(fcCode);
      expect(mockSetData.mock.calls[0][1]).toEqual(offset);
      expect(mockSetData.mock.calls[0][2]).toEqual(value);
      expect(mockSetData.mock.calls[0][3]).toEqual(unitId);
    });

    it("should set action name", async () => {
      let action = await exec();

      expect(action.Name).toEqual(actionName);
    });
  });

  describe("_getData", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;
    let mockModbus;
    let isActive;
    let isConnected;
    let fcCode, offset, length, passedUnitId;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 1000;
      unitId = 5;
      mockModbus = new MockModbusRTU();
      isActive = true;
      fcCode = 1;
      offset = 2;
      length = 3;
      passedUnitId = 4;
      isActive = true;
      isConnected = true;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      mbDriver._client._isOpen = isConnected;
      return mbDriver._getData(fcCode, offset, length, passedUnitId);
    };

    it("should set appropriate unitId passed as an argument before reading Method", async () => {
      let result = await exec();

      expect(mockModbus.setID).toHaveBeenCalledTimes(1);
      expect(mockModbus.setID).toHaveBeenCalledBefore(mockModbus.readCoils);
      expect(mockModbus.setID.mock.calls[0][0]).toEqual(passedUnitId);
    });

    it("should invoke readCoils if function is 1 and return appropriate data", async () => {
      fcCode = 1;
      let result = await exec();

      expect(mockModbus.readCoils).toHaveBeenCalledTimes(1);
      expect(mockModbus.readCoils.mock.calls[0][0]).toEqual(offset);
      expect(mockModbus.readCoils.mock.calls[0][1]).toEqual(length);
      expect(result).toEqual(mockModbus._readCoilsResult);
    });

    it("should invoke readDiscreteInputs if function is 2 and return appropriate data", async () => {
      fcCode = 2;
      let result = await exec();

      expect(mockModbus.readDiscreteInputs).toHaveBeenCalledTimes(1);
      expect(mockModbus.readDiscreteInputs.mock.calls[0][0]).toEqual(offset);
      expect(mockModbus.readDiscreteInputs.mock.calls[0][1]).toEqual(length);
      expect(result).toEqual(mockModbus._readDiscreteInputsResult);
    });

    it("should invoke readHoldingRegisters if function is 3 and return appropriate data", async () => {
      fcCode = 3;
      let result = await exec();

      expect(mockModbus.readHoldingRegisters).toHaveBeenCalledTimes(1);
      expect(mockModbus.readHoldingRegisters.mock.calls[0][0]).toEqual(offset);
      expect(mockModbus.readHoldingRegisters.mock.calls[0][1]).toEqual(length);
      expect(result).toEqual(mockModbus._readHoldingRegistersResult);
    });

    it("should invoke readInputRegisters if function is 4 and return appropriate data", async () => {
      fcCode = 4;
      let result = await exec();

      expect(mockModbus.readInputRegisters).toHaveBeenCalledTimes(1);
      expect(mockModbus.readInputRegisters.mock.calls[0][0]).toEqual(offset);
      expect(mockModbus.readInputRegisters.mock.calls[0][1]).toEqual(length);
      expect(result).toEqual(mockModbus._readInputRegistersResult);
    });

    it("should throw if function is not recognized", async () => {
      fcCode = -1;
      expect(exec()).rejects.toBeDefined();
    });

    it("should throw if device is not active", async () => {
      isActive = false;
      expect(exec()).rejects.toBeDefined();
    });

    it("should throw if device is not connected and there was an error during reconnecting", async () => {
      isConnected = false;
      mockModbus.connectTCP = () => Promise(resolve, reject => reject("test"));
      expect(exec()).rejects.toBeDefined();
    });

    it("should connect without activation if driver is not connected", async () => {
      isConnected = false;

      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      mbDriver._connectWithoutActivating = jest.fn();
      mbDriver.connect = jest.fn();

      mbDriver._client._isOpen = isConnected;
      await mbDriver._getData(fcCode, offset, length, passedUnitId);

      expect(mbDriver._connectWithoutActivating).toHaveBeenCalled();
      expect(mbDriver.connect).not.toHaveBeenCalled();
    });

    it("should disconnect and reject if exchanging data takes more time then timeout", async () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      mbDriver._client._isOpen = isConnected;
      mbDriver._disconnectWithoutDeactive = jest.fn();
      mockModbus.readCoils = () =>
        new Promise(async (resolve, reject) => {
          await snooze(2000);
          return resolve({ data: "test" });
        });

      await expect(
        mbDriver._getData(fcCode, offset, length, passedUnitId)
      ).rejects.toBeDefined();

      expect(mbDriver._disconnectWithoutDeactive).toHaveBeenCalledTimes(1);
    });

    it("should not disconnect and reject if exchanging data takes less time then timeout", async () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      mbDriver._client._isOpen = isConnected;
      mbDriver._disconnectWithoutDeactive = jest.fn();
      mockModbus.readCoils = () =>
        new Promise(async (resolve, reject) => {
          await snooze(500);
          return resolve({ data: "test" });
        });

      await expect(
        mbDriver._getData(fcCode, offset, length, passedUnitId)
      ).resolves.toBeDefined();

      expect(mbDriver._disconnectWithoutDeactive).not.toHaveBeenCalledTimes(1);
    });

    it("should disconnect and reject if reading data throws error", async () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      mbDriver._client._isOpen = isConnected;
      mbDriver._disconnectWithoutDeactive = jest.fn();
      mockModbus.readCoils = jest.fn().mockRejectedValue("test");

      await expect(
        mbDriver._getData(fcCode, offset, length, passedUnitId)
      ).rejects.toBeDefined();

      expect(mbDriver._disconnectWithoutDeactive).toHaveBeenCalledTimes(1);
    });
  });

  describe("_setData", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;
    let mockModbus;
    let isActive;
    let isConnected;
    let fcCode, offset, value, passedUnitId;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 1000;
      unitId = 5;
      mockModbus = new MockModbusRTU();
      isActive = true;
      fcCode = 5;
      offset = 2;
      value = 3;
      passedUnitId = 4;
      isActive = true;
      isConnected = true;
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      mbDriver._client._isOpen = isConnected;
      return mbDriver._setData(fcCode, offset, value, passedUnitId);
    };

    it("should set appropriate unitId passed as an argument before reading Method", async () => {
      let result = await exec();

      expect(mockModbus.setID).toHaveBeenCalledTimes(1);
      expect(mockModbus.setID).toHaveBeenCalledBefore(mockModbus.readCoils);
      expect(mockModbus.setID.mock.calls[0][0]).toEqual(passedUnitId);
    });

    it("should invoke writeCoil if function is 5 and return value", async () => {
      fcCode = 5;
      let result = await exec();

      expect(mockModbus.writeCoil).toHaveBeenCalledTimes(1);
      expect(mockModbus.writeCoil.mock.calls[0][0]).toEqual(offset);
      expect(mockModbus.writeCoil.mock.calls[0][1]).toEqual(value);
      expect(result).toEqual(value);
    });

    it("should invoke writeCoils if function is 15 and return value", async () => {
      fcCode = 15;
      let result = await exec();

      expect(mockModbus.writeCoils).toHaveBeenCalledTimes(1);
      expect(mockModbus.writeCoils.mock.calls[0][0]).toEqual(offset);
      expect(mockModbus.writeCoils.mock.calls[0][1]).toEqual(value);
      expect(result).toEqual(value);
    });

    it("should invoke writeRegisters if function is 16 and return value", async () => {
      fcCode = 16;
      let result = await exec();

      expect(mockModbus.writeRegisters).toHaveBeenCalledTimes(1);
      expect(mockModbus.writeRegisters.mock.calls[0][0]).toEqual(offset);
      expect(mockModbus.writeRegisters.mock.calls[0][1]).toEqual(value);
      expect(result).toEqual(value);
    });

    it("should invoke writeRegister if function is 6 and return value", async () => {
      fcCode = 6;
      let result = await exec();

      expect(mockModbus.writeRegister).toHaveBeenCalledTimes(1);
      expect(mockModbus.writeRegister.mock.calls[0][0]).toEqual(offset);
      expect(result).toEqual(value);
      expect(mockModbus.writeRegister.mock.calls[0][1]).toEqual(value);
    });

    it("should throw if function is not recognized", async () => {
      fcCode = -1;
      expect(exec()).rejects.toBeDefined();
    });

    it("should throw if device is not active", async () => {
      isActive = false;
      expect(exec()).rejects.toBeDefined();
    });

    it("should throw if device is not connected and there was an error during reconnecting", async () => {
      isConnected = false;
      mockModbus.connectTCP = () => Promise(resolve, reject => reject("test"));
      expect(exec()).rejects.toBeDefined();
    });

    it("should connect without activation if driver is not connected", async () => {
      isConnected = false;

      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      mbDriver._connectWithoutActivating = jest.fn();
      mbDriver.connect = jest.fn();

      mbDriver._client._isOpen = isConnected;
      await mbDriver._setData(fcCode, offset, value, passedUnitId);

      expect(mbDriver._connectWithoutActivating).toHaveBeenCalled();
      expect(mbDriver.connect).not.toHaveBeenCalled();
    });

    it("should disconnect and reject if exchanging data takes more time then timeout", async () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      mbDriver._client._isOpen = isConnected;
      mbDriver._disconnectWithoutDeactive = jest.fn();
      mockModbus.writeCoil = () =>
        new Promise(async (resolve, reject) => {
          await snooze(2000);
          return resolve("test");
        });

      await expect(
        mbDriver._setData(fcCode, offset, value, passedUnitId)
      ).rejects.toBeDefined();

      expect(mbDriver._disconnectWithoutDeactive).toHaveBeenCalledTimes(1);
    });

    it("should not disconnect and reject if exchanging data takes less time then timeout", async () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      mbDriver._client._isOpen = isConnected;
      mbDriver._disconnectWithoutDeactive = jest.fn();
      mockModbus.writeCoil = () =>
        new Promise(async (resolve, reject) => {
          await snooze(500);
          return resolve("test");
        });

      await expect(
        mbDriver._setData(fcCode, offset, value, passedUnitId)
      ).resolves.toBeDefined();

      expect(mbDriver._disconnectWithoutDeactive).not.toHaveBeenCalledTimes(1);
    });

    it("should disconnect and reject if reading data throws error", async () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      mbDriver._client._isOpen = isConnected;
      mbDriver._disconnectWithoutDeactive = jest.fn();
      mockModbus.writeCoil = jest.fn().mockRejectedValue("test");

      await expect(
        mbDriver._setData(fcCode, offset, value, passedUnitId)
      ).rejects.toBeDefined();

      expect(mbDriver._disconnectWithoutDeactive).toHaveBeenCalledTimes(1);
    });
  });

  describe("invokeActions", () => {
    let mbDevice;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let mbDriver;
    let mockModbus;
    let busy;
    let actions;
    let action1;
    let action2;
    let action3;
    let action1Mock;
    let action2Mock;
    let action3Mock;

    beforeEach(() => {
      mbDevice = "mockMBDevice";
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 1000;
      unitId = 5;
      mockModbus = new MockModbusRTU();
      isActive = true;
      busy = false;
      action1Mock = jest
        .fn()
        .mockImplementation(() => new Promise(resolve => resolve(1)));
      action2Mock = jest
        .fn()
        .mockImplementation(() => new Promise(resolve => resolve(2)));
      action3Mock = jest
        .fn()
        .mockImplementation(() => new Promise(resolve => resolve(3)));
      action1 = new ModbusDriverAction("act1", action1Mock);
      action2 = new ModbusDriverAction("act2", action2Mock);
      action3 = new ModbusDriverAction("act3", action3Mock);
      actions = new ModbusDriverActions();
      actions.addAction(action1);
      actions.addAction(action2);
      actions.addAction(action3);
    });

    let exec = () => {
      mbDriver = new MBDriver(mbDevice, ipAdress, portNumber, timeout, unitId);
      mbDriver._client = mockModbus;
      mbDriver._active = isActive;
      mbDriver._busy = busy;
      return mbDriver.invokeActions(actions);
    };

    it("should invoke all actions with their resolved values", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(action1Mock).toHaveBeenCalledTimes(1);
      expect(result.act1).toBeDefined();
      expect(result.act1).toEqual(1);
      expect(action2Mock).toHaveBeenCalledTimes(1);
      expect(result.act2).toBeDefined();
      expect(result.act2).toEqual(2);
      expect(action3Mock).toHaveBeenCalledTimes(1);
      expect(result.act3).toBeDefined();
      expect(result.act3).toEqual(3);
    });

    it("should reject if device is not active", async () => {
      isActive = false;
      await expect(exec()).rejects.toBeDefined();
    });

    it("should not invoke any actions and reject if device is busy", async () => {
      busy = true;

      await expect(exec()).rejects.toBeDefined();

      expect(action1Mock).not.toHaveBeenCalledTimes(1);
      expect(action2Mock).not.toHaveBeenCalledTimes(1);
      expect(action3Mock).not.toHaveBeenCalledTimes(1);
    });

    it("should not invoke actions after rejected action", async () => {
      action2Mock = jest
        .fn()
        .mockImplementation(() => new Promise(resolve, reject => reject(2)));

      action1 = new ModbusDriverAction("act1", action1Mock);
      action2 = new ModbusDriverAction("act2", action2Mock);
      action3 = new ModbusDriverAction("act3", action3Mock);
      actions = new ModbusDriverActions();
      actions.addAction(action1);
      actions.addAction(action2);
      actions.addAction(action3);

      await expect(exec()).rejects.toBeDefined();

      expect(action1Mock).toHaveBeenCalledTimes(1);
      expect(action2Mock).toHaveBeenCalledTimes(1);
      expect(action3Mock).not.toHaveBeenCalled();
    });

    it("should be able to invoke more than one time", async () => {
      for (let i = 1; i <= 3; i++) {
        let result = await exec();

        expect(result).toBeDefined();
        expect(action1Mock).toHaveBeenCalledTimes(i);
        expect(result.act1).toBeDefined();
        expect(result.act1).toEqual(1);
        expect(action2Mock).toHaveBeenCalledTimes(i);
        expect(result.act2).toBeDefined();
        expect(result.act2).toEqual(2);
        expect(action3Mock).toHaveBeenCalledTimes(i);
        expect(result.act3).toBeDefined();
        expect(result.act3).toEqual(3);
      }
    });

    it("should be able to invoke several times even if one of actions reject", async () => {
      action2Mock = jest
        .fn()
        .mockImplementation(() => new Promise(resolve, reject => reject(2)));

      action1 = new ModbusDriverAction("act1", action1Mock);
      action2 = new ModbusDriverAction("act2", action2Mock);
      action3 = new ModbusDriverAction("act3", action3Mock);
      actions = new ModbusDriverActions();
      actions.addAction(action1);
      actions.addAction(action2);
      actions.addAction(action3);

      for (let i = 1; i <= 3; i++) {
        await expect(exec()).rejects.toBeDefined();

        expect(action1Mock).toHaveBeenCalledTimes(i);
        expect(action2Mock).toHaveBeenCalledTimes(i);
        expect(action3Mock).not.toHaveBeenCalled();
      }
    });
  });
});
