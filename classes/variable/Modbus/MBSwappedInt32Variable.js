const MBVariable = require("./MBVariable");

//Converting register array to float
const mbDataToSwappedInt32 = function(mbData) {
  //Split 2 x 16 bit to bytes
  let int16Array = new Uint16Array(2);
  int16Array[0] = mbData[0];
  int16Array[1] = mbData[1];
  let bytes = new Int8Array(int16Array.buffer);

  //Bytes swap
  let data = [bytes[1], bytes[0], bytes[3], bytes[2]];

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
  var num = view.getInt32(0);

  return num;
};

//Converting Int32 to register array
const swappedInt32ToMBData = function(floatValue) {
  //Split float into bytes
  let int32Array = new Int32Array(1);
  int32Array[0] = floatValue;
  let bytes = new Int8Array(int32Array.buffer);

  //swap bytes
  let int1Buf = [bytes[3], bytes[2]];

  // Create a buffer
  var buf1 = new ArrayBuffer(4);
  // Create a data view of it
  var view1 = new DataView(buf1);

  // set bytes
  int1Buf.forEach(function(b, i) {
    view1.setUint8(i, b);
  });

  let int1 = view1.getUint16(0);

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

  return [int1, int2];
};

class MBSwappedInt32Variable extends MBVariable {
  constructor(device, name, fcode, offset) {
    super(device, name, fcode, offset, 2);
  }

  _convertDataToValue(data) {
    return mbDataToSwappedInt32(data);
  }

  _convertValueToData(value) {
    return swappedInt32ToMBData(value);
  }

  /**
   * @description Private method called for getting all possible FCodes - implemented in child
   */
  _getPossibleFCodes() {
    return [3, 4, 16];
  }
}

module.exports = MBSwappedInt32Variable;
