const MBVariable = require("./MBVariable");

//Converting register array to Int16
const mbDataToInt16 = function(mbData) {
  let int16Array = new Uint16Array(1);
  int16Array[0] = mbData[0];
  let bytes = new Int8Array(int16Array.buffer);

  //Bytes swap
  let data = [bytes[1], bytes[0]];

  // Create a buffer
  var buf = new ArrayBuffer(4);
  // Create a data view of it
  var view = new DataView(buf);

  // set bytes
  data.forEach(function(b, i) {
    view.setUint8(i, b);
  });

  // Read the bits as a float; note that by doing this, we're implicitly
  // converting it from a 32-bit int into JavaScript's native 64-bit double
  var num = view.getInt16(0);

  return num;
};

//Converting Int16 to register array
const int16ToMBData = function(intValue) {
  //Split float into bytes
  let int16Array = new Int16Array(1);
  int16Array[0] = intValue;
  let bytes = new Int8Array(int16Array.buffer);

  //swap bytes
  //swap bytes
  let int2Buf = [bytes[1], bytes[0]];

  // Create a buffer
  var buf2 = new ArrayBuffer(4);
  // Create a data view of it
  var view2 = new DataView(buf2);

  // set bytes
  int2Buf.forEach(function(b, i) {
    view2.setUint8(i, b);
  });

  let int2 = view2.getUint16(0);

  return [int2];
};

class MBInt16Variable extends MBVariable {
  constructor(device, payload) {
    if (!payload) throw new Error("Payload cannot be empty");
    payload.length = 1;
    payload.setSingleFCode = 16;
    payload.getSingleFCode = payload.fCode;

    super(device, payload);
  }

  _convertDataToValue(data) {
    return mbDataToInt16(data);
  }

  _convertValueToData(value) {
    return int16ToMBData(value);
  }

  /**
   * @description Private method called for getting all possible FCodes - implemented in child
   */
  _getPossibleFCodes() {
    return [3, 4, 16];
  }

  /**
   * @description Method for generating new variable based on given payload
   */
  editWithPayload(payload) {
    //Creating new value from payload
    let editedVariable = new MBInt16Variable(
      this.Device,
      this._generatePayloadToEdit(payload)
    );
    //Reassigining events;
    editedVariable._events = this.Events;

    return editedVariable;
  }
}

module.exports = MBInt16Variable;
