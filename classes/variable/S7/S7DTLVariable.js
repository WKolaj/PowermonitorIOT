const S7Variable = require("./S7Variable");

//Converting register array to Int32
const s7DataToDTL = function(data) {
  //Reading year
  var buf = new ArrayBuffer(2);
  var view = new DataView(buf);
  view.setUint8(0, data[0]);
  view.setUint8(1, data[1]);
  let year = view.getUint16(0);

  //Reading month
  buf = new ArrayBuffer(1);
  view = new DataView(buf);
  view.setUint8(0, data[2]);
  let month = view.getUint8(0);

  //Converting month to JS format (0-January, 11-December)
  //Month 0 is should not be set to -1
  month > 0 ? month-- : month;

  //Reading day
  buf = new ArrayBuffer(1);
  view = new DataView(buf);
  view.setUint8(0, data[3]);
  let day = view.getUint8(0);

  //Reading hour
  buf = new ArrayBuffer(1);
  view = new DataView(buf);
  view.setUint8(0, data[5]);
  let hour = view.getUint8(0);

  //Reading minute
  buf = new ArrayBuffer(1);
  view = new DataView(buf);
  view.setUint8(0, data[6]);
  let minute = view.getUint8(0);

  //Reading second
  buf = new ArrayBuffer(1);
  view = new DataView(buf);
  view.setUint8(0, data[7]);
  let second = view.getUint8(0);

  //Reading nano
  buf = new ArrayBuffer(4);
  view = new DataView(buf);
  view.setUint8(0, data[8]);
  view.setUint8(1, data[9]);
  view.setUint8(2, data[10]);
  view.setUint8(3, data[11]);
  let miliseconds = Math.round(view.getUint32(0) / 1000000);

  let date = new Date(year, month, day, hour, minute, second, miliseconds);

  return date.getTime();
};

//Converting Int32 to register array
const dtlToS7Data = function(intValue) {
  let unixTime = new Date(intValue);

  let year = unixTime.getFullYear();
  let month = unixTime.getMonth();
  //Converting month from JS format to DTL format
  month++;
  let day = unixTime.getDate();
  let dayNumber = unixTime.getDay();
  let hour = unixTime.getHours();
  let minute = unixTime.getMinutes();
  let second = unixTime.getSeconds();
  let milisecond = unixTime.getMilliseconds();

  //Setting years
  let yearArray = new Uint16Array(1);
  yearArray[0] = year;
  let yearBytes = new Uint8Array(yearArray.buffer);

  //Setting month
  let monthArray = new Uint8Array(1);
  monthArray[0] = month;
  let monthBytes = new Uint8Array(monthArray.buffer);

  //Setting day
  let dayArray = new Uint8Array(1);
  dayArray[0] = day;
  let dayBytes = new Uint8Array(dayArray.buffer);

  //Setting dayNumber
  let dayNumberArray = new Uint8Array(1);
  dayNumberArray[0] = dayNumber;
  let dayNumberBytes = new Uint8Array(dayNumberArray.buffer);

  //Setting hour
  let hourArray = new Uint8Array(1);
  hourArray[0] = hour;
  let hourBytes = new Uint8Array(hourArray.buffer);

  //Setting minute
  let minuteArray = new Uint8Array(1);
  minuteArray[0] = minute;
  let minuteBytes = new Uint8Array(minuteArray.buffer);

  //Setting second
  let secondArray = new Uint8Array(1);
  secondArray[0] = second;
  let secondBytes = new Uint8Array(secondArray.buffer);

  //Setting nanoseconds
  let nanosecondsArray = new Uint32Array(1);
  nanosecondsArray[0] = milisecond * 1000 * 1000;
  let nanosecondBytes = new Uint8Array(nanosecondsArray.buffer);

  return [
    yearBytes[1],
    yearBytes[0],
    monthBytes[0],
    dayBytes[0],
    dayNumberBytes[0],
    hourBytes[0],
    minuteBytes[0],
    secondBytes[0],
    nanosecondBytes[3],
    nanosecondBytes[2],
    nanosecondBytes[1],
    nanosecondBytes[0]
  ];
};

class S7DTLVariable extends S7Variable {
  /**
   * @description S7 S7DTLVariable variable
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
    payload.length = 12;
    await super.init(payload);
  }

  /**
   * @description Method for generating type name that represents variable
   */
  _getTypeName() {
    return "s7DTL";
  }

  /**
   * @description method for converting data to value
   * @param {Array} data array of UInt16 representing data
   */
  _convertDataToValue(data) {
    return s7DataToDTL(data);
  }

  /**
   * @description method for converting value to data
   * @param {number} value value  to be converted
   */
  _convertValueToData(value) {
    return dtlToS7Data(value);
  }

  /**
   * @description Method for edditing variable
   * @param {Object} payload Payload to edit
   */
  async editWithPayload(payload) {
    payload.length = 12;

    return super.editWithPayload(payload);
  }

  /**
   * @description Method for generating type of value of variable
   */
  _getValueType() {
    return "integer";
  }
}

module.exports = S7DTLVariable;
