const MBVariable = require("./MBVariable");

//Converting register array to Int16
const mbDataToBoolean = function(mbData) {
  return mbData[0];
};

//Converting Int16 to register array
const booleanToMBData = function(booleanValue) {
  return [booleanValue];
};

class MBBooleanVariable extends MBVariable {
  constructor(device, payload) {
    if (!payload) throw new Error("Payload cannot be empty");
    payload.length = 1;
    payload.getSingleFCode = 1;
    payload.setSingleFCode = 15;

    super(device, payload);
  }

  _convertDataToValue(data) {
    return mbDataToBoolean(data);
  }

  _convertValueToData(value) {
    return booleanToMBData(value);
  }

  /**
   * @description Private method called for getting all possible FCodes - implemented in child
   */
  _getPossibleFCodes() {
    return [1, 2, 15];
  }

  /**
   * @description Method for generating new variable based on given payload
   */
  editWithPayload(payload) {
    //Creating new value from payload
    let editedVariable = new MBBooleanVariable(
      this.Device,
      this._generatePayloadToEdit(payload)
    );

    //Reassigining events;
    editedVariable._events = this.Events;

    return editedVariable;
  }
}

module.exports = MBBooleanVariable;
