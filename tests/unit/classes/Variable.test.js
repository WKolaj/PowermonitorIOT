const Variable = require("../../../classes/variable/Variable");
const Sampler = require("../../../classes/sampler/Sampler");
const _ = require("lodash");

describe("Variable", () => {
  describe("constructor", () => {
    let device;

    beforeEach(() => {
      device = "My test device";
    });

    let exec = () => {
      return new Variable(device);
    };

    it("should create new variable with given arguments", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.Device).toEqual(device);
    });

    it("should set event emitter", () => {
      let result = exec();

      expect(result.Events).toBeDefined();
    });

    it("should throw if device is empty", () => {
      device = null;

      expect(() => exec()).toThrow();
    });
  });

  describe("init", () => {
    let device;
    let name;
    let archived;
    let payload;
    let variable;
    let timeSample;
    let archiveTimeSample;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      timeSample = 2;
      archiveTimeSample = 3;
      archived = true;
    });

    let exec = async () => {
      payload = {
        name: name,
        archived: archived,
        archiveTimeSample: archiveTimeSample,
        timeSample: timeSample
      };
      variable = new Variable(device);
      return variable.init(payload);
    };

    it("should create new variable with given arguments", async () => {
      await exec();

      expect(variable).toBeDefined();
      expect(variable.Device).toEqual(device);
      expect(variable.Name).toEqual(name);
      expect(variable.Archived).toEqual(archived);
      expect(variable.TimeSample).toEqual(timeSample);
      expect(variable.ArchiveTimeSample).toEqual(archiveTimeSample);
      expect(variable.ArchiveTickId).toEqual(
        Sampler.convertTimeSampleToTickId(archiveTimeSample)
      );
    });

    it("should set Archived to false if it is not defined in payload", async () => {
      archived = undefined;

      await exec();

      expect(variable.Archived).toEqual(false);
    });

    it("should set Archived to false if it is set to false in payload", async () => {
      archived = false;

      await exec();

      expect(variable.Archived).toEqual(false);
    });

    it("should set default time sample to 1s if timeSample is not defined", async () => {
      timeSample = undefined;

      await exec();

      expect(variable.TimeSample).toEqual(1);
    });

    it("should set archiveTimeSample to timeSample if archiveTimeSample is not defined", async () => {
      archiveTimeSample = undefined;

      await exec();

      expect(variable.ArchiveTimeSample).toEqual(timeSample);
    });

    it("should set archiveTimeSample to 1 if archiveTimeSample and timeSample is not defined", async () => {
      archiveTimeSample = undefined;
      timeSample = undefined;

      await exec();

      expect(variable.ArchiveTimeSample).toEqual(1);
    });

    it("should set event emitter", async () => {
      await exec();

      expect(variable.Events).toBeDefined();
    });

    it("should throw if name is empty", async () => {
      name = null;

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
    });

    it("should throw if device is empty", async () => {
      device = null;

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
    });

    it("should throw if payload is empty", async () => {
      await expect(
        new Promise(async (resolve, reject) => {
          try {
            variable = new Variable(device);
            await variable.init();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();
    });
  });

  describe("generateRandId", () => {
    let randIds;
    let arrayLength;

    beforeEach(() => {
      arrayLength = 1000000;
      randIds = [];
    });

    let exec = () => {
      for (let i = 0; i < arrayLength; i++) {
        randIds.push(Variable.generateRandId());
      }
    };

    it("should generate and return uniq id", () => {
      exec();

      expect(randIds).toBeDefined();
      expect(randIds.length).toEqual(arrayLength);
      expect(_.uniq(randIds).length).toEqual(arrayLength);
    });
  });

  describe("Events", () => {
    let device;
    let name;
    let variable;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = () => {
      payload = { name: name };
      variable = new Variable(device);
      variable.init(payload);
      return variable.Events;
    };

    it("should return event object", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(variable._events);
    });
  });

  describe("TickId", () => {
    let device;
    let name;
    let variable;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = async () => {
      payload = { name: name };
      variable = new Variable(device);
      await variable.init(payload);
      return variable.TickId;
    };

    it("should return tickId", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(variable._tickId);
    });
  });

  describe("Id", () => {
    let device;
    let name;
    let variable;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = async () => {
      payload = { name: name };
      variable = new Variable(device);
      await variable.init(payload);
      return variable.Id;
    };

    it("should return Id", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(variable._id);
    });
  });

  describe("get TimeSample", () => {
    let device;
    let name;
    let variable;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = async () => {
      payload = { name: name };
      variable = new Variable(device);
      await variable.init(payload);
      return variable.TimeSample;
    };

    it("should return tickId converted to SampleTime", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(
        Sampler.convertTickIdToTimeSample(variable._tickId)
      );
    });
  });

  describe("set TimeSample", () => {
    let device;
    let name;
    let variable;
    let timeSample;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      timeSample = 15;
    });

    let exec = async () => {
      payload = { name: name };
      variable = new Variable(device);
      await variable.init(payload);
      variable.TimeSample = timeSample;
    };

    it("should set tickId converted from SampleTime", async () => {
      await exec();

      expect(variable._tickId).toBeDefined();
      expect(variable._tickId).toEqual(
        Sampler.convertTimeSampleToTickId(timeSample)
      );
    });
  });

  describe("Device", () => {
    let device;
    let name;
    let variable;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = async () => {
      payload = { name: name };
      variable = new Variable(device);
      await variable.init(payload);
      return variable.Device;
    };

    it("should return event object", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(device);
    });
  });

  describe("Name", () => {
    let device;
    let name;
    let variable;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
    });

    let exec = async () => {
      payload = { name: name };
      variable = new Variable(device);
      await variable.init(payload);
      return variable.Name;
    };

    it("should return event object", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(name);
    });
  });

  describe("Archived", () => {
    let device;
    let name;
    let archived;
    let variable;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      archived = true;
    });

    let exec = async () => {
      payload = { name: name, archived: archived };
      variable = new Variable(device);
      await variable.init(payload);
      return variable.Archived;
    };

    it("should return if variable is archived", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(archived);
    });
  });

  describe("get Value", () => {
    let device;
    let name;
    let variable;
    let _getValueMock;
    let _getValueMockReturn;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      _getValueMockReturn = 1;
      _getValueMock = jest.fn().mockReturnValue(_getValueMockReturn);
    });

    let exec = async () => {
      payload = { name: name };
      variable = new Variable(device);
      await variable.init(payload);
      variable._getValue = _getValueMock;

      return variable.Value;
    };

    it("should call and return _getValue function", async () => {
      let result = await exec();

      expect(result).toEqual(_getValueMockReturn);
      expect(_getValueMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("set Value", () => {
    let device;
    let name;
    let variable;
    let value;
    let _setValueMock;
    let _emitValueChangeMock;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      _setValueMock = jest.fn();
      _emitValueChangeMock = jest.fn();
      value = 1;
    });

    let exec = async () => {
      payload = { name: name };
      variable = new Variable(device);
      await variable.init(payload);
      variable._setValue = _setValueMock;
      variable._emitValueChange = _emitValueChangeMock;

      variable.Value = value;
    };

    it("should call _setValue function with value passed as an argument", async () => {
      await exec();

      expect(_setValueMock).toHaveBeenCalledTimes(1);
      expect(_setValueMock.mock.calls[0][0]).toEqual(value);
    });

    it("should call _emitValueChange function with value passed as an argument", async () => {
      await exec();

      expect(_emitValueChangeMock).toHaveBeenCalledTimes(1);
      expect(_emitValueChangeMock.mock.calls[0][0]).toEqual(value);
    });
  });

  describe("_emitValueChange", () => {
    let device;
    let name;
    let variable;
    let value;
    let eventMock;
    let emitMock;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      emitMock = jest.fn();
      eventMock = {
        emit: emitMock
      };
      value = 1;
    });

    let exec = async () => {
      payload = { name: name };
      variable = new Variable(device);
      await variable.init(payload);
      variable._events = eventMock;
      variable._emitValueChange(value);
    };

    it("should emit ValueChanged event", async () => {
      await exec();

      expect(emitMock).toHaveBeenCalledTimes(1);
    });

    it("should emit ValueChanged event with propriate arugments", async () => {
      await exec();

      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock.mock.calls[0][0]).toEqual("ValueChanged");
      expect(emitMock.mock.calls[0][1]).toBeDefined();
      expect(emitMock.mock.calls[0][1].length).toEqual(2);
      expect(emitMock.mock.calls[0][1][0]).toEqual(variable);
      expect(emitMock.mock.calls[0][1][1]).toEqual(value);
    });
  });

  describe("get Payload", () => {
    let device;
    let name;
    let archived;
    let variable;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      archived = true;
    });

    let exec = async () => {
      payload = { name: name, archived: archived };
      variable = new Variable(device);
      await variable.init(payload);
      return variable.Payload;
    };

    it("should return valid payload", async () => {
      let result = await exec();
      let validPayload = {
        name: variable.Name,
        id: variable.Id,
        timeSample: variable.TimeSample,
        archived: variable.Archived,
        archiveTimeSample: variable.ArchiveTimeSample,
        unit: variable.Unit
      };
      expect(result).toBeDefined();
      expect(result).toEqual(validPayload);
    });
  });

  describe("_generatePayload", () => {
    let device;
    let name;
    let archived;
    let variable;
    let payload;

    beforeEach(() => {
      device = "My test device";
      name = "Name of variable";
      archived = true;
    });

    let exec = async () => {
      payload = { name: name, archived: archived };
      variable = new Variable(device);
      await variable.init(payload);
      return variable._generatePayload();
    };

    it("should return valid payload", async () => {
      let result = await exec();
      let validPayload = {
        name: variable.Name,
        id: variable.Id,
        timeSample: variable.TimeSample,
        archived: variable.Archived,
        archiveTimeSample: variable.ArchiveTimeSample,
        unit: variable.Unit
      };
      expect(result).toBeDefined();
      expect(result).toMatchObject(validPayload);
    });
  });

  describe("_editWithPayload", () => {
    let id;
    let editId;
    let device;
    let name;
    let archived;
    let unit;
    let variable;
    let payload;
    let payloadToEdit;
    let timeSampleToEdit;
    let nameToEdit;
    let unitToEdit;
    let archiveTimeSampleToEdit;

    beforeEach(() => {
      id = "1234";
      device = "My test device";
      name = "Name of variable";
      unit = "A";
      nameToEdit = "Edited name of variable";
      archived = false;
      editId = undefined;
      archivedToEdit = true;
      unitToEdit = "B";
      timeSampleToEdit = 5;
      archiveTimeSampleToEdit = 10;
    });

    let exec = async () => {
      payload = { id: id, name: name, archived: archived, unit: unit };
      variable = new Variable(device);
      await variable.init(payload);

      payloadToEdit = {
        id: editId,
        name: nameToEdit,
        timeSample: timeSampleToEdit,
        archived: archivedToEdit,
        unit: unitToEdit,
        archiveTimeSample: archiveTimeSampleToEdit
      };

      return variable.editWithPayload(payloadToEdit);
    };

    it("should return edited variable", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result).toEqual(variable);
    });

    it("should return variable with edited values based on payload", async () => {
      let result = await exec();

      expect(result).toBeDefined();
      expect(result.TimeSample).toEqual(timeSampleToEdit);
      expect(result.Name).toEqual(nameToEdit);
      expect(result.Archived).toEqual(archivedToEdit);
      expect(result.Unit).toEqual(unitToEdit);
      expect(result.ArchiveTimeSample).toEqual(archiveTimeSampleToEdit);
    });

    it("should return variable with event emitter being the same object as in original ", async () => {
      let result = await exec();

      expect(result.Events).toBeDefined();
      expect(result.Events).toEqual(variable.Events);
    });

    it("should set id of payload based on variable id", async () => {
      let result = await exec();

      expect(result.Id).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
    });

    it("should throw and not edit anything if id in edit payload is different than variable id", async () => {
      editId = "corruptedId";

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
      expect(variable.TimeSample).toEqual(payload.timeSample);
      expect(variable.Name).toEqual(payload.name);
      expect(variable.Archived).toEqual(payload.archived);
      expect(variable.Unit).toEqual(payload.unit);
    });

    it("should not set timeSample if it is not given in edit payload", async () => {
      timeSampleToEdit = undefined;
      let result = await exec();

      expect(result.TimeSample).toBeDefined();
      expect(result.TimeSample).toEqual(variable.TimeSample);
    });

    it("should not set name if it is not given in edit payload", async () => {
      nameToEdit = undefined;
      let result = await exec();

      expect(result.Name).toBeDefined();
      expect(result.Name).toEqual(variable.Name);
    });

    it("should not set archived if archive is true in variable and archive is empty in payload", async () => {
      archivedToEdit = undefined;
      let result = await exec();

      expect(result.Archived).toBeDefined();
      expect(result.Archived).toEqual(variable.Archived);
    });
  });
});
