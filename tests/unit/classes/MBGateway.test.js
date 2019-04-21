let MBGateway = require("../../../classes/driver/Modbus/MBGateway");

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

describe("MBGateway", () => {
  describe("constructor", () => {
    let ipAdress;
    let portNumber;
    let timeout;
    let mbGateway;

    beforeEach(() => {
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
    });

    let exec = () => {
      mbGateway = new MBGateway(ipAdress, portNumber, timeout);
    };

    it("should create new mbGateway with appropriate parameters", () => {
      exec();

      expect(mbGateway).toBeDefined();
      expect(mbGateway._ipAdress).toEqual(ipAdress);
      expect(mbGateway._portNumber).toEqual(portNumber);
      expect(mbGateway._timeout).toEqual(timeout);
      expect(mbGateway._mbDevice).not.toBeDefined();
      expect(mbGateway._mbRTUDevices).toEqual([]);
    });
  });

  describe("addModbusDevice", () => {
    let ipAdress;
    let portNumber;
    let timeout;
    let mbGateway;
    let device1;
    let device2;
    let device3;

    beforeEach(() => {
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      device1 = "device1";
      device2 = "device2";
      device3 = "device3";
    });

    let exec = () => {
      mbGateway = new MBGateway(ipAdress, portNumber, timeout);
      mbGateway.addModbusDevice(device1);
      mbGateway.addModbusDevice(device2);
      mbGateway.addModbusDevice(device3);
    };

    it("should add devices to gateway devices", () => {
      exec();
      expect(mbGateway._mbRTUDevices.length).toEqual(3);
      expect(mbGateway._mbRTUDevices[0]).toEqual(device1);
      expect(mbGateway._mbRTUDevices[1]).toEqual(device2);
      expect(mbGateway._mbRTUDevices[2]).toEqual(device3);
    });
  });

  describe("removeModbusDevice", () => {
    let ipAdress;
    let portNumber;
    let timeout;
    let mbGateway;
    let device1;
    let device2;
    let device3;

    beforeEach(() => {
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      device1 = "device1";
      device2 = "device2";
      device3 = "device3";
    });

    let exec = () => {
      mbGateway = new MBGateway(ipAdress, portNumber, timeout);
      mbGateway.addModbusDevice(device1);
      mbGateway.addModbusDevice(device2);
      mbGateway.addModbusDevice(device3);
      mbGateway.removeModbusDevice(device1);
      mbGateway.removeModbusDevice(device3);
    };

    it("should remove devices from MBGateway", () => {
      exec();
      expect(mbGateway._mbRTUDevices.length).toEqual(1);
      mbGateway.removeModbusDevice(device2);
      expect(mbGateway._mbRTUDevices.length).toEqual(0);
    });

    it("should not throw but do nothing if device is not in MBGateway", () => {
      exec();
      expect(mbGateway._mbRTUDevices.length).toEqual(1);
      expect(() => mbGateway.removeModbusDevice(device1)).not.toThrow();
      expect(mbGateway._mbRTUDevices.length).toEqual(1);
    });
  });

  describe("MBDevices", () => {
    let ipAdress;
    let portNumber;
    let timeout;
    let mbGateway;
    let device1;
    let device2;
    let device3;

    beforeEach(() => {
      ipAdress = "192.168.0.1";
      portNumber = 602;
      timeout = 4000;
      device1 = "device1";
      device2 = "device2";
      device3 = "device3";
    });

    let exec = () => {
      mbGateway = new MBGateway(ipAdress, portNumber, timeout);
      mbGateway.addModbusDevice(device1);
      mbGateway.addModbusDevice(device2);
      mbGateway.addModbusDevice(device3);

      return mbGateway.MBDevices;
    };

    it("should return all mbDevices connected to mbGateway", () => {
      let data = exec();
      expect(data).toBeDefined();
      expect(data).toEqual(mbGateway._mbRTUDevices);
    });
  });
});
