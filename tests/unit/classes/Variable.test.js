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

    let exec = () => {
      payload = {
        name: name,
        archived: archived,
        archiveTimeSample: archiveTimeSample,
        timeSample: timeSample
      };
      variable = new Variable(device);
      return variable.init(payload);
    };

    it("should create new variable with given arguments", () => {
      exec();

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

    it("should set Archived to false if it is not defined in payload", () => {
      archived = undefined;

      exec();

      expect(variable.Archived).toEqual(false);
    });

    it("should set Archived to false if it is set to false in payload", () => {
      archived = false;

      exec();

      expect(variable.Archived).toEqual(false);
    });

    it("should set default time sample to 1s if timeSample is not defined", () => {
      timeSample = undefined;

      exec();

      expect(variable.TimeSample).toEqual(1);
    });

    it("should set archiveTimeSample to timeSample if archiveTimeSample is not defined", () => {
      archiveTimeSample = undefined;

      exec();

      expect(variable.ArchiveTimeSample).toEqual(timeSample);
    });

    it("should set archiveTimeSample to 1 if archiveTimeSample and timeSample is not defined", () => {
      archiveTimeSample = undefined;
      timeSample = undefined;

      exec();

      expect(variable.ArchiveTimeSample).toEqual(1);
    });

    it("should set event emitter", () => {
      exec();

      expect(variable.Events).toBeDefined();
    });

    it("should throw if name is empty", () => {
      name = null;

      expect(() => exec()).toThrow();
    });

    it("should throw if device is empty", () => {
      device = null;

      expect(() => exec()).toThrow();
    });

    it("should throw if payload is empty", () => {
      expect(() => {
        variable = new Variable(device);
        variable.init();
      }).toThrow();
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

    let exec = () => {
      payload = { name: name };
      variable = new Variable(device);
      variable.init(payload);
      return variable.TickId;
    };

    it("should return tickId", () => {
      let result = exec();

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

    let exec = () => {
      payload = { name: name };
      variable = new Variable(device);
      variable.init(payload);
      return variable.Id;
    };

    it("should return Id", () => {
      let result = exec();

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

    let exec = () => {
      payload = { name: name };
      variable = new Variable(device);
      variable.init(payload);
      return variable.TimeSample;
    };

    it("should return tickId converted to SampleTime", () => {
      let result = exec();

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

    let exec = () => {
      payload = { name: name };
      variable = new Variable(device);
      variable.init(payload);
      variable.TimeSample = timeSample;
    };

    it("should set tickId converted from SampleTime", () => {
      exec();

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

    let exec = () => {
      payload = { name: name };
      variable = new Variable(device);
      variable.init(payload);
      return variable.Device;
    };

    it("should return event object", () => {
      let result = exec();

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

    let exec = () => {
      payload = { name: name };
      variable = new Variable(device);
      variable.init(payload);
      return variable.Name;
    };

    it("should return event object", () => {
      let result = exec();

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

    let exec = () => {
      payload = { name: name, archived: archived };
      variable = new Variable(device);
      variable.init(payload);
      return variable.Archived;
    };

    it("should return if variable is archived", () => {
      let result = exec();

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

    let exec = () => {
      payload = { name: name };
      variable = new Variable(device);
      variable.init(payload);
      variable._getValue = _getValueMock;

      return variable.Value;
    };

    it("should call and return _getValue function", () => {
      let result = exec();

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

    let exec = () => {
      payload = { name: name };
      variable = new Variable(device);
      variable.init(payload);
      variable._setValue = _setValueMock;
      variable._emitValueChange = _emitValueChangeMock;

      variable.Value = value;
    };

    it("should call _setValue function with value passed as an argument", () => {
      exec();

      expect(_setValueMock).toHaveBeenCalledTimes(1);
      expect(_setValueMock.mock.calls[0][0]).toEqual(value);
    });

    it("should call _emitValueChange function with value passed as an argument", () => {
      exec();

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

    let exec = () => {
      payload = { name: name };
      variable = new Variable(device);
      variable.init(payload);
      variable._events = eventMock;
      variable._emitValueChange(value);
    };

    it("should emit ValueChanged event", () => {
      exec();

      expect(emitMock).toHaveBeenCalledTimes(1);
    });

    it("should emit ValueChanged event with propriate arugments", () => {
      exec();

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

    let exec = () => {
      payload = { name: name, archived: archived };
      variable = new Variable(device);
      variable.init(payload);
      return variable.Payload;
    };

    it("should return valid payload", () => {
      let result = exec();
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

    let exec = () => {
      payload = { name: name, archived: archived };
      variable = new Variable(device);
      variable.init(payload);
      return variable._generatePayload();
    };

    it("should return valid payload", () => {
      let result = exec();
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

    let exec = () => {
      payload = { id: id, name: name, archived: archived, unit: unit };
      variable = new Variable(device);
      variable.init(payload);

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

    it("should return edited variable", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result).toEqual(variable);
    });

    it("should return variable with edited values based on payload", () => {
      let result = exec();

      expect(result).toBeDefined();
      expect(result.TimeSample).toEqual(timeSampleToEdit);
      expect(result.Name).toEqual(nameToEdit);
      expect(result.Archived).toEqual(archivedToEdit);
      expect(result.Unit).toEqual(unitToEdit);
      expect(result.ArchiveTimeSample).toEqual(archiveTimeSampleToEdit);
    });

    it("should return variable with event emitter being the same object as in original ", () => {
      let result = exec();

      expect(result.Events).toBeDefined();
      expect(result.Events).toEqual(variable.Events);
    });

    it("should set id of payload based on variable id", () => {
      let result = exec();

      expect(result.Id).toBeDefined();
      expect(result.Id).toEqual(variable.Id);
    });

    it("should throw and not edit anything if id in edit payload is different than variable id", () => {
      editId = "corruptedId";

      expect(() => exec()).toThrow();

      expect(variable.TimeSample).toEqual(payload.timeSample);
      expect(variable.Name).toEqual(payload.name);
      expect(variable.Archived).toEqual(payload.archived);
      expect(variable.Unit).toEqual(payload.unit);
    });

    it("should not set timeSample if it is not given in edit payload", () => {
      timeSampleToEdit = undefined;
      let result = exec();

      expect(result.TimeSample).toBeDefined();
      expect(result.TimeSample).toEqual(variable.TimeSample);
    });

    it("should not set name if it is not given in edit payload", () => {
      nameToEdit = undefined;
      let result = exec();

      expect(result.Name).toBeDefined();
      expect(result.Name).toEqual(variable.Name);
    });

    it("should not set archived if archive is true in variable and archive is empty in payload", () => {
      archivedToEdit = undefined;
      let result = exec();

      expect(result.Archived).toBeDefined();
      expect(result.Archived).toEqual(variable.Archived);
    });
  });
});
