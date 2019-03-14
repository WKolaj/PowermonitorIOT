const MBRequest = require("./MBRequest");

class MBRequestGrouper {
  constructor(mbDevice, maxRequestLength = 100) {
    this._mbDevice = mbDevice;
    this._maxRequestLength = maxRequestLength;
  }

  get MaxRequestLength() {
    return this._maxRequestLength;
  }

  get MBDevice() {
    return this._mbDevice;
  }

  get MBDriver() {
    return this._mbDevice.MBDriver;
  }

  ConvertVariablesToRequests(variables) {
    let splitedAndSorted = this._splitVariablesByUnitIdAndFcodeAndSortByOffset(
      variables
    );

    let allRequests = [];

    let allUnitIds = Object.keys(splitedAndSorted);

    for (let unitId of allUnitIds) {
      let variablesOfUnitId = splitedAndSorted[unitId];

      let allFCcodes = Object.keys(variablesOfUnitId);

      for (let fcCode of allFCcodes) {
        let sortedVariables = variablesOfUnitId[fcCode];

        let request = new MBRequest(
          this.MBDriver,
          parseInt(fcCode),
          parseInt(unitId),
          this.MaxRequestLength
        );

        request.addVariable(sortedVariables[0]);
        allRequests.push(request);

        for (let i = 1; i < sortedVariables.length; i++) {
          let variable = sortedVariables[i];

          if (request.canVariableBeAddedToRequest(variable)) {
            request.addVariable(variable);
          } else {
            request = new MBRequest(
              this.MBDriver,
              parseInt(fcCode, 10),
              parseInt(unitId),
              this.MaxRequestLength
            );
            allRequests.push(request);
            request.addVariable(variable);
          }
        }
      }
    }

    return allRequests;
  }

  _splitVariablesByUnitIdAndFcodeAndSortByOffset(variables) {
    let splitedAndSortedVariables = {};

    let splitedByUnitId = this._splitVariablesByUnitId(variables);

    let allUnitIds = Object.keys(splitedByUnitId);

    for (let unitId of allUnitIds) {
      if (!(unitId in splitedAndSortedVariables))
        splitedAndSortedVariables[unitId] = {};

      let variablesOfUnitId = splitedByUnitId[unitId];

      let splitedByFcCode = this._splitVariablesByFcode(variablesOfUnitId);

      let allFCcodes = Object.keys(splitedByFcCode);

      for (let fcCode of allFCcodes) {
        let variablesOfUnitIdAndFcode = splitedByFcCode[fcCode];

        let sortedVariablesOfUnitIdAndFcode = this._orderVariablesByOffset(
          variablesOfUnitIdAndFcode
        );

        splitedAndSortedVariables[unitId][
          fcCode
        ] = sortedVariablesOfUnitIdAndFcode;
      }
    }
    return splitedAndSortedVariables;
  }

  _splitVariablesByUnitId(variables) {
    let splittedVariables = {};

    for (let variable of variables) {
      let unitId = variable.UnitId;

      if (!(unitId in splittedVariables)) splittedVariables[unitId] = [];

      splittedVariables[unitId].push(variable);
    }

    return splittedVariables;
  }

  _splitVariablesByFcode(variables) {
    let splittedVariables = {};

    for (let variable of variables) {
      let fcode = variable.FCode;

      if (!(fcode in splittedVariables)) splittedVariables[fcode] = [];

      splittedVariables[fcode].push(variable);
    }

    return splittedVariables;
  }

  _orderVariablesByOffset(variables) {
    let sortableVariables = [...variables];

    sortableVariables.sort(function(a, b) {
      return a.Offset - b.Offset;
    });
    return sortableVariables;
  }
}

module.exports = MBRequestGrouper;
