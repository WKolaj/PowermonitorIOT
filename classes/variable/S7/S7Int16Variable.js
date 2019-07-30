const S7Variable = require("./S7Variable");

//Converting register array to Int16
const s7DataToInt16 = function(data) {
  var buf = new ArrayBuffer(2);

  var view = new DataView(buf);

  view.setUint8(0, data[0]);
  view.setUint8(1, data[1]);

  return view.getInt16(0);
};

//Converting Int16 to register array
const int16ToS7Data = function(intValue) {
  //Split int16 into bytes
  let int16Array = new Int16Array(1);
  int16Array[0] = intValue;
  let bytes = new Int8Array(int16Array.buffer);

  return [bytes[1], bytes[0]];
};

class MBInt16Variable extends S7Variable {
  /**
   * @description Modbus Int16 variable
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
    payload.length = 2;
    await super.init(payload);
  }

  /**
   * @description Method for generating type name that represents variable
   */
  _getTypeName() {
    return "s7Int16";
  }

  /**
   * @description method for converting data to value
   * @param {Array} data array of UInt16 representing data
   */
  _convertDataToValue(data) {
    return s7DataToInt16(data);
  }

  /**
   * @description method for converting value to data
   * @param {number} value value  to be converted
   */
  _convertValueToData(value) {
    return int16ToS7Data(value);
  }

  /**
   * @description Method for edditing variable
   * @param {Object} payload Payload to edit
   */
  async editWithPayload(payload) {
    payload.length = 2;

    return super.editWithPayload(payload);
  }

  /**
   * @description Method for generating type of value of variable
   */
  _getValueType() {
    return "integer";
  }
}

module.exports = MBInt16Variable;
