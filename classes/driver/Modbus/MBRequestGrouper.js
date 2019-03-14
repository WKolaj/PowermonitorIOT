class MBRequestGrouper {
  constructor(mbDevice, maxRequestLength = 200) {
    this._mbDevice = mbDevice;
    this._maxRequestLength = maxRequestLength;
  }

  get maxRequestLength() {
    return this._maxRequestLength;
  }

  get mbDevice() {
    return this._mbDevice;
  }

  ConvertVariablesToActions(variables) {
    let allVariableNames = Object.keys(variables);
  }
}

module.exports = MBRequestGrouper;
