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
  /**
   * @description Modbus Byte Array variable
   * @param {Object} device Device associated with variable
   * @param {Object} payload Variable payload
   */
  constructor(device, payload) {
    if (!payload) throw new Error("Payload cannot be empty");
    payload.getSingleFCode = payload.fCode;
    payload.setSingleFCode = 16;

    super(device, payload);
    this._type = "byteArray";
  }

  /**
   * @description Should variable be archived
   */
  get Archived() {
    //Byte array cannot be archived
    return false;
  }

  /**
   * @description Getting bit from byte
   * @param {number} byteNumber Byte number
   * @param {number} bitNumber Bit number
   */
  getBit(byteNumber, bitNumber) {
    return this._getBit(this._value[byteNumber], bitNumber);
  }

  /**
   * @description Setting bit in byte
   * @param {number} byteNumber byte number
   * @param {number} bitNumber bit number
   */
  setBit(byteNumber, bitNumber) {
    this.Value[byteNumber] = this._setBit(this.Value[byteNumber], bitNumber);
    //Simply for invoking valueChangeEvent and recreate modbus data
    this.Value = this.Value;
  }

  /**
   * @description Clearing bit in byte
   * @param {number} byteNumber byte number
   * @param {number} bitNumber bit number
   */
  clearBit(byteNumber, bitNumber) {
    this.Value[byteNumber] = this._clearBit(this.Value[byteNumber], bitNumber);
    //Simply for invoking valueChangeEvent and recreate modbus data
    this.Value = this.Value;
  }

  /**
   * @description converting variable to bit array
   */
  convertToBits() {
    let bits = [];

    for (let i in this._value) {
      for (let j = 0; j < 8; j++) {
        bits.push(this._getBit(this._value[i], j));
      }
    }

    return bits;
  }

  /**
   * @description method for converting data to value
   * @param {Array} data array of UInt16 representing data
   */
  _convertDataToValue(data) {
    return mbDataToByteArray(data);
  }

  /**
   * @description method for converting value to data
   * @param {number} value value  to be converted
   */
  _convertValueToData(value) {
    return byteArrayToMBData(value);
  }

  /**
   * @description method for getting bit in given variable
   * @param {number} number variable
   * @param {number} bitPosition bit position
   */
  _getBit(number, bitPosition) {
    return (number & (1 << bitPosition)) === 0 ? false : true;
  }

  /**
   * @description method for setting bit in given variable
   * @param {number} number variable
   * @param {number} bitPosition bit position
   */
  _setBit(number, bitPosition) {
    return number | (1 << bitPosition);
  }

  /**
   * @description method for clearing bit in given variable
   * @param {number} number variable
   * @param {number} bitPosition bit position
   */
  _clearBit(number, bitPosition) {
    const mask = ~(1 << bitPosition);
    return number & mask;
  }

  /**
   * @description Private method called for getting all possible FCodes - implemented in child
   */
  _getPossibleFCodes() {
    return [3, 4, 16];
  }

  /**
   * Generating payload to edit variable
   * @param {Object} payload
   */
  _generatePayloadToEdit(payload) {
    //Resetting value if length changes without value
    let resetValue = false;
    if (
      payload.value === undefined &&
      payload.length !== undefined &&
      payload.length !== this.Length
    ) {
      console.log(
        `value:${payload.value} length:${payload.length} this.length:${
          this.Length
        }`
      );
      resetValue = true;
    }

    let result = super._generatePayloadToEdit(payload);

    if (resetValue) {
      result.value = undefined;
    }

    return result;
  }

  /**
   * @description Method for generating new variable based on given payload
   */
  editWithPayload(payload) {
    //Creating new value from payload
    let editedVariable = new MBByteArrayVariable(
      this.Device,
      this._generatePayloadToEdit(payload)
    );

    //Reassigining events;
    editedVariable._events = this.Events;

    return editedVariable;
  }
}

module.exports = MBByteArrayVariable;
