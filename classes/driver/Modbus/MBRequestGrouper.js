const MBRequest = require("./MBRequest");

class MBRequestGrouper {
  /**
   * @description Class that groups several variables into one Modbus requests
   * @param {object} mbDevice Modbus device
   * @param {number} maxRequestLength maximum length of Modbus RTU request
   */
  constructor(mbDevice, maxRequestLength = 100) {
    if (!mbDevice) throw new Error("mbDevice cannot be empty");

    this._mbDevice = mbDevice;
    this._maxRequestLength = maxRequestLength;
  }

  /**
   * @description Max request length
   */
  get MaxRequestLength() {
    return this._maxRequestLength;
  }

  /**
   * @description Modbus device associated with request groupper
   */
  get MBDevice() {
    return this._mbDevice;
  }

  /**
   * @description Modbus driver associated with request groupper
   */
  get MBDriver() {
    return this._mbDevice.MBDriver;
  }

  /**
   * @description Method for generating requests based on variable collection
   * @param {object} mbDevice Variables collection
   */
  ConvertVariablesToRequests(variables) {
    //Splitting and sorting variables into object based on its unitIds and fcode:
    /**
     * {
     *      unitId1:
     *      {
     *          fcode1:
     *          [
     *              //Sorted by offset
     *              variable1,
     *              variable2,
     *              ...
     *          ]
     *
     *          fcode2:
     *          [
     *              //Sorted by offset
     *              variable10,
     *              variable11,
     *              ...
     *          ]
     *          ...
     *      }
     *
     *      unitId2:
     *      {
     *          fcode1:
     *          [
     *              //Sorted by offset
     *              variable1,
     *              variable2,
     *              ...
     *          ]
     *
     *          fcode2:
     *          [
     *              //Sorted by offset
     *              variable10,
     *              variable11,
     *              ...
     *          ]
     *      }
     *      ...
     * }
     */
    let splitedAndSorted = this._splitVariablesByUnitIdAndFcodeAndSortByOffset(
      variables
    );

    //Creating array to store generated requests
    let allRequests = [];

    let allUnitIds = Object.keys(splitedAndSorted);

    //Foreach unitId
    for (let unitId of allUnitIds) {
      let variablesOfUnitId = splitedAndSorted[unitId];

      let allFCcodes = Object.keys(variablesOfUnitId);

      //Foreach fcode for given unitId
      for (let fcCode of allFCcodes) {
        //Variables sorted by offset
        let sortedVariables = variablesOfUnitId[fcCode];

        //Creating request to which variables will be added
        let request = new MBRequest(
          this.MBDriver,
          parseInt(fcCode),
          parseInt(unitId),
          this.MaxRequestLength
        );

        //Adding new request to array to returnl;
        allRequests.push(request);

        //Adding first variable to request
        request.addVariable(sortedVariables[0]);

        for (let i = 1; i < sortedVariables.length; i++) {
          let variable = sortedVariables[i];

          //As long as variable can be added to request depending on its length etc. adding variables
          if (request.canVariableBeAddedToRequest(variable)) {
            request.addVariable(variable);
          } else {
            //If variable cannot be added to request - creating new request and pushing it to array to return
            request = new MBRequest(
              this.MBDriver,
              parseInt(fcCode, 10),
              parseInt(unitId),
              this.MaxRequestLength
            );
            allRequests.push(request);

            //Adding variable to new request
            request.addVariable(variable);
          }
        }
      }
    }

    //Returning all requests
    return allRequests;
  }

  /**
   * @description Method for spiting variables first by its unitId and than by fcode and than order it by Offset
   * @param {object} mbDevice Variables collection
   */
  _splitVariablesByUnitIdAndFcodeAndSortByOffset(variables) {
    //Splitting and sorting variables into object based on its unitIds and fcode:
    /**
     * {
     *      unitId1:
     *      {
     *          fcode1:
     *          [
     *              //Sorted by offset
     *              variable1,
     *              variable2,
     *              ...
     *          ]
     *
     *          fcode2:
     *          [
     *              //Sorted by offset
     *              variable10,
     *              variable11,
     *              ...
     *          ]
     *          ...
     *      }
     *
     *      unitId2:
     *      {
     *          fcode1:
     *          [
     *              //Sorted by offset
     *              variable1,
     *              variable2,
     *              ...
     *          ]
     *
     *          fcode2:
     *          [
     *              //Sorted by offset
     *              variable10,
     *              variable11,
     *              ...
     *          ]
     *      }
     *      ...
     * }
     */

    //Object to return
    let splitedAndSortedVariables = {};

    //First - splitting variables by unitId
    let splitedByUnitId = this._splitVariablesByUnitId(variables);

    let allUnitIds = Object.keys(splitedByUnitId);

    //Foreach unitId
    for (let unitId of allUnitIds) {
      //If unitId key does not exist in object to return - create such key
      if (!(unitId in splitedAndSortedVariables))
        splitedAndSortedVariables[unitId] = {};

      //If unitId key does not exist in object to return - create such key
      let variablesOfUnitId = splitedByUnitId[unitId];

      //splitting variables for given unitId by fCode
      let splitedByFcCode = this._splitVariablesByFcode(variablesOfUnitId);

      let allFCcodes = Object.keys(splitedByFcCode);

      //Foreach code in given collection
      for (let fcCode of allFCcodes) {
        let variablesOfUnitIdAndFcode = splitedByFcCode[fcCode];

        //Ordering variables by offset for given unitId and fcode
        let sortedVariablesOfUnitIdAndFcode = this._orderVariablesByOffset(
          variablesOfUnitIdAndFcode
        );

        //Assigning ordered variables to object to return to unitId and fcCode
        splitedAndSortedVariables[unitId][
          fcCode
        ] = sortedVariablesOfUnitIdAndFcode;
      }
    }

    //returning splited object
    return splitedAndSortedVariables;
  }

  /**
   * @description Method for splitting variables based on its userId
   * @param {object} mbDevice Variables collection
   */
  _splitVariablesByUnitId(variables) {
    //Splitting variables to object:
    /**
     *  unitId1:
     *  [
     *      variable1,
     *      variable2,
     *      ...
     *  ]
     *
     *  unitId2:
     *  [
     *      variable10,
     *      variable11,
     *      ...
     *  ]
     *  ...
     */

    //Object to return
    let splittedVariables = {};

    for (let variable of variables) {
      let unitId = variable.UnitId;

      //If there is a new unitid for objet to return - init array for this code
      if (!(unitId in splittedVariables)) splittedVariables[unitId] = [];

      //Add varaible to array representing variables of given unitId
      splittedVariables[unitId].push(variable);
    }

    return splittedVariables;
  }

  /**
   * @description Method for splitting variables based on modbus fcode
   * @param {object} mbDevice Variables collection
   */
  _splitVariablesByFcode(variables) {
    //Splitting variables to object:
    /**
     *  fcode1:
     *  [
     *      variable1,
     *      variable2,
     *      ...
     *  ]
     *
     *  fcode2:
     *  [
     *      variable10,
     *      variable11,
     *      ...
     *  ]
     *  ...
     */

    //Object to return
    let splittedVariables = {};

    //Foreach variable
    for (let variable of variables) {
      let fcode = variable.FCode;

      //If there is a new code for objet to return - init array for this code
      if (!(fcode in splittedVariables)) splittedVariables[fcode] = [];

      //Add varaible to array representing variables of given code
      splittedVariables[fcode].push(variable);
    }

    return splittedVariables;
  }

  /**
   * @description Method for ordering variables by order ascending
   * @param {object} mbDevice Variables collection
   */
  _orderVariablesByOffset(variables) {
    let sortableVariables = [...variables];

    sortableVariables.sort(function(a, b) {
      return a.Offset - b.Offset;
    });
    return sortableVariables;
  }
}

module.exports = MBRequestGrouper;
