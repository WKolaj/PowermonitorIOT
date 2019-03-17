const MBVariable = require("./MBVariable");

//Converting register array to ByteArray
const mbDataToByteArray = function(mbData) {
  let int16Array = new Uint16Array(mbData.length);

  for (let i in mbData) {
    int16Array[i] = mbData[i];
  }

  let dataBuffer = new Uint8Array(int16Array.buffer);

  let bytes = [];

  for (let i in dataBuffer) {
    bytes[i] = dataBuffer[i];
  }

  return bytes;
};

//Converting ByteArray to register array
const byteArrayToMBData = function(byteArray) {
  let int8Array = new Uint8Array(byteArray.length);

  for (let i in byteArray) {
    int8Array[i] = byteArray[i];
  }

  let dataBuffer = new Uint16Array(int8Array.buffer);

  let data = [];

  for (let i in dataBuffer) {
    data[i] = dataBuffer[i];
  }

  return data;
};

class MBByteArrayVariable extends MBVariable {
  constructor(device, name, fcode, offset, length) {
    super(device, name, fcode, offset, length);
  }

  getBit(byteNumber, bitNumber) {
    return this._getBit(this._value[byteNumber], bitNumber);
  }

  setBit(byteNumber, bitNumber) {
    this.Value[byteNumber] = this._setBit(this.Value[byteNumber], bitNumber);
    //Simply for invoking valueChangeEvent and recreate modbus data
    this.Value = this.Value;
  }

  clearBit(byteNumber, bitNumber) {
    this.Value[byteNumber] = this._clearBit(this.Value[byteNumber], bitNumber);
    //Simply for invoking valueChangeEvent and recreate modbus data
    this.Value = this.Value;
  }

  convertToBits() {
    let bits = [];

    for (let i in this._value) {
      for (let j = 0; j < 8; j++) {
        bits.push(this._getBit(this._value[i], j));
      }
    }

    return bits;
  }

  _convertDataToValue(data) {
    return mbDataToByteArray(data);
  }

  _convertValueToData(value) {
    return byteArrayToMBData(value);
  }

  _getBit(number, bitPosition) {
    return (number & (1 << bitPosition)) === 0 ? 0 : 1;
  }

  _setBit(number, bitPosition) {
    return number | (1 << bitPosition);
  }

  _clearBit(number, bitPosition) {
    const mask = ~(1 << bitPosition);
    return number & mask;
  }

  /**
   * @description Private method called for getting all possible FCodes - implemented in child
   */
  _getPossibeFCodes() {
    return [3, 4, 16];
  }
}

module.exports = MBByteArrayVariable;
