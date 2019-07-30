const S7Variable = require("./S7Variable");

//Converting register array to ByteArray
const s7DataToByteArray = function(mbData) {
  return [...mbData];
};

//Converting ByteArray to register array
const byteArrayToS7Data = function(byteArray) {
  return [...byteArray];
};

class S7ByteArrayVariable extends S7Variable {
  /**
   * @description Modbus Byte Array variable
   * @param {Object} device Device associated with variable
   */
  constructor(device) {
    super(device);
  }

  /**
   * @description Method for initializing variable by payload
   * @param {object} payload variable payload
   */
  async init(payload) {
    if (!payload) throw new Error("Payload cannot be empty");
    await super.init(payload);
  }

  /**
   * @description Method for generating type name that represents variable
   */
  _getTypeName() {
    return "s7ByteArray";
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
    return s7DataToByteArray(data);
  }

  /**
   * @description method for converting value to data
   * @param {number} value value  to be converted
   */
  _convertValueToData(value) {
    return byteArrayToS7Data(value);
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
   * @description Method for edditing variable
   * @param {Object} payload Payload to edit
   */
  async editWithPayload(payload) {
    //Resetting value if length changes without value
    let resetValue = false;
    if (
      payload.value === undefined &&
      payload.length !== undefined &&
      payload.length !== this.Length
    ) {
      resetValue = true;
    }

    //Reseting value if length is different than before
    if (resetValue) {
      let valueOfReset = [];

      //new value should be:
      //[0 0 0 ... 0] < with new length
      for (let i = 0; i < payload.length; i++) {
        valueOfReset.push(0);
      }

      payload.value = valueOfReset;
    }

    let varToReturn = await super.editWithPayload(payload);

    return varToReturn;
  }

  /**
   * @description Method for generating type of value of variable
   */
  _getValueType() {
    return "byteArray";
  }
}

module.exports = S7ByteArrayVariable;
