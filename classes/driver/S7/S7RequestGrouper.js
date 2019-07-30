const S7Request = require("./S7Request");

class S7RequestGrouper {
  /**
   * @description Class that groups several variables into one S7 requests
   * @param {object} s7Device S7 device
   * @param {number} maxRequestLength maximum length of S7 request
   */
  constructor(s7Device, maxRequestLength = 100) {
    if (!s7Device) throw new Error("s7Device cannot be empty");

    this._s7Device = s7Device;
    this._maxRequestLength = maxRequestLength;
  }

  /**
   * @description Max request length
   */
  get MaxRequestLength() {
    return this._maxRequestLength;
  }

  /**
   * @description S7 device associated with request groupper
   */
  get S7Device() {
    return this._s7Device;
  }

  /**
   * @description S7 driver associated with request groupper
   */
  get S7Driver() {
    return this._s7Device.S7Driver;
  }

  /**
   * @description Method for converting requests to VariableId : variable with new value Pair
   * @param {Array} requests Requests to be converted to VariableId : variable with new value Pair
   */
  ConvertRequestsToIDValuePair(requests) {
    let valuesToReturn = {};

    for (let request of requests) {
      let variableConnectionsOfRequest = Object.values(
        request.VariableConnections
      );

      for (let variableConnection of variableConnectionsOfRequest) {
        valuesToReturn[variableConnection.variable.Id] =
          variableConnection.variable;
      }
    }

    return valuesToReturn;
  }

  /**
   * @description Method for generating requests based on variable collection
   * @param {object} variables Variables collection
   */
  ConvertVariablesToRequests(variables) {
    //Splitting and sorting variables into object based on its areaType dbNumber and write type:
    /**
     * {
     *      areaType1:
     *      {
     *          dbNumber1:
     *          {
     *              write:
     *                  [
     *                      //Sorted by offset
     *                      variable1,
     *                      variable2,
     *                      ...
     *                  ]
     *
     *              read:
     *                  [
     *                      //Sorted by offset
     *                      variable3,
     *                      variable4,
     *                      ...
     *                  ]
     *          }
     *
     *          dbNumber2:
     *          {
     *              write:
     *                  [
     *                      //Sorted by offset
     *                      variable1,
     *                      variable2,
     *                      ...
     *                  ]
     *
     *              read:
     *                  [
     *                      //Sorted by offset
     *                      variable3,
     *                      variable4,
     *                      ...
     *                  ]
     *          }
     *          ...
     *      }
     *
     *      areaType2:
     *      {
     *          dbNumber1:
     *          {
     *              write:
     *                  [
     *                      //Sorted by offset
     *                      variable1,
     *                      variable2,
     *                      ...
     *                  ]
     *
     *              read:
     *                  [
     *                      //Sorted by offset
     *                      variable3,
     *                      variable4,
     *                      ...
     *                  ]
     *          }
     *
     *          dbNumber2:
     *          {
     *              write:
     *                  [
     *                      //Sorted by offset
     *                      variable1,
     *                      variable2,
     *                      ...
     *                  ]
     *
     *              read:
     *                  [
     *                      //Sorted by offset
     *                      variable3,
     *                      variable4,
     *                      ...
     *                  ]
     *          }
     *      }
     *      ...
     * }
     */
    let splitedAndSorted = this._splitVariablesByAreaTypeAndDBNumberAndWriteAndSortByOffset(
      variables
    );

    //Creating array to store generated requests
    let allRequests = [];

    let allAreaTypes = Object.keys(splitedAndSorted);

    //Foreach areaTYpe
    for (let areaType of allAreaTypes) {
      let variablesOfAreaType = splitedAndSorted[areaType];

      let allDbNumbers = Object.keys(variablesOfAreaType);

      //Foreach dbNumber for given areaType
      for (let dbNumber of allDbNumbers) {
        let variablesOfAreaTypeAndDbNumber =
          splitedAndSorted[areaType][dbNumber];

        let allWriteTypes = Object.keys(variablesOfAreaTypeAndDbNumber);

        //Foreach writeType for given dbNumber
        for (let writeType of allWriteTypes) {
          //Variables sorted by offset
          let sortedVariables = variablesOfAreaTypeAndDbNumber[writeType];

          //Creating request to which variables will be added
          let request = new S7Request(
            this.S7Driver,
            areaType,
            writeType === "write",
            this.MaxRequestLength,
            parseInt(dbNumber)
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
              request = new S7Request(
                this.S7Driver,
                areaType,
                writeType === "write",
                this.MaxRequestLength,
                parseInt(dbNumber)
              );

              allRequests.push(request);

              //Adding variable to new request
              request.addVariable(variable);
            }
          }
        }
      }
    }

    //Returning all requests
    return allRequests;
  }

  /**
   * @description Method for spiting variables first by its areaType than dbNumber and than write type and than by fcode and than order it by Offset
   * @param {object} mbDevice Variables collection
   */
  _splitVariablesByAreaTypeAndDBNumberAndWriteAndSortByOffset(variables) {
    //Splitting and sorting variables into object based on its areaType and dbNumber:
    /**
     * {
     *      areaType1:
     *      {
     *          dbNumber1:
     *          {
     *              write:
     *                  [
     *                      //Sorted by offset
     *                      variable1,
     *                      variable2,
     *                      ...
     *                  ]
     *
     *              read:
     *                  [
     *                      //Sorted by offset
     *                      variable3,
     *                      variable4,
     *                      ...
     *                  ]
     *          }
     *
     *          dbNumber2:
     *          {
     *              write:
     *                  [
     *                      //Sorted by offset
     *                      variable1,
     *                      variable2,
     *                      ...
     *                  ]
     *
     *              read:
     *                  [
     *                      //Sorted by offset
     *                      variable3,
     *                      variable4,
     *                      ...
     *                  ]
     *          }
     *          ...
     *      }
     *
     *      areaType2:
     *      {
     *          dbNumber1:
     *          {
     *              write:
     *                  [
     *                      //Sorted by offset
     *                      variable1,
     *                      variable2,
     *                      ...
     *                  ]
     *
     *              read:
     *                  [
     *                      //Sorted by offset
     *                      variable3,
     *                      variable4,
     *                      ...
     *                  ]
     *          }
     *
     *          dbNumber2:
     *          {
     *              write:
     *                  [
     *                      //Sorted by offset
     *                      variable1,
     *                      variable2,
     *                      ...
     *                  ]
     *
     *              read:
     *                  [
     *                      //Sorted by offset
     *                      variable3,
     *                      variable4,
     *                      ...
     *                  ]
     *          }
     *      }
     *      ...
     * }
     */

    //Object to return
    let splitedAndSortedVariables = {};

    //First - splitting variables by areaType
    let splitedByAreaType = this._splitVariablesByAreaType(variables);

    let allAreaTypes = Object.keys(splitedByAreaType);

    //Foreach areaType
    for (let areaType of allAreaTypes) {
      //If areaType key does not exist in object to return - create such key
      if (!(areaType in splitedAndSortedVariables))
        splitedAndSortedVariables[areaType] = {};

      //If areaType key does not exist in object to return - create such key
      let variablesOfAreaType = splitedByAreaType[areaType];

      //splitting variables for given areaType by dbNumber
      let splitedByDbNumber = this._splitVariablesByDBNumber(
        variablesOfAreaType
      );

      let allDbNumbers = Object.keys(splitedByDbNumber);

      //Foreach dbNumber in given collection
      for (let dbNumber of allDbNumbers) {
        //If dbNumber key does not exist in object to return - create such key
        if (!(dbNumber in splitedAndSortedVariables[areaType]))
          splitedAndSortedVariables[areaType][dbNumber] = {};

        let variablesOfAreaTypeAndDBNumber = splitedByDbNumber[dbNumber];

        let splitedByWriteType = this._splitVariablesByWriteType(
          variablesOfAreaTypeAndDBNumber
        );

        let allWriteTypes = Object.keys(splitedByWriteType);

        //Foreach writeType in given collection
        for (let writeType of allWriteTypes) {
          let variablesOfAreaTypeAndDBNumberAndWriteType =
            splitedByWriteType[writeType];

          //Ordering variables by offset for given areaType and dbNumber and writeType
          let sortedVariablesOfAreaTypeAndDBNmuberAndWriteType = this._orderVariablesByOffset(
            variablesOfAreaTypeAndDBNumberAndWriteType
          );

          //Assigning ordered variables to object to return to areaType and dbNumber
          splitedAndSortedVariables[areaType][dbNumber][
            writeType
          ] = sortedVariablesOfAreaTypeAndDBNmuberAndWriteType;
        }
      }
    }

    //returning splited object
    return splitedAndSortedVariables;
  }

  /**
   * @description Method for splitting variables based on its dbNumber
   * @param {object} variables Variables collection
   */
  _splitVariablesByDBNumber(variables) {
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
      let dbNumber = variable.DBNumber;

      //If there is a new unitid for objet to return - init array for this code
      if (!(dbNumber in splittedVariables)) splittedVariables[dbNumber] = [];

      //Add varaible to array representing variables of given unitId
      splittedVariables[dbNumber].push(variable);
    }

    return splittedVariables;
  }

  /**
   * @description Method for splitting variables based on areaType
   * @param {object} variables Variables collection
   */
  _splitVariablesByAreaType(variables) {
    //Splitting variables to object:
    /**
     *  areaType1:
     *  [
     *      variable1,
     *      variable2,
     *      ...
     *  ]
     *
     *  areaType2:
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
      let areaType = variable.AreaType;

      //If there is a new code for objet to return - init array for this code
      if (!(areaType in splittedVariables)) splittedVariables[areaType] = [];

      //Add varaible to array representing variables of given code
      splittedVariables[areaType].push(variable);
    }

    return splittedVariables;
  }

  /**
   * @description Method for splitting variables based on write or read
   * @param {object} variables Variables collection
   */
  _splitVariablesByWriteType(variables) {
    //Splitting variables to object:
    /**
     *  write:
     *  [
     *      variable1,
     *      variable2,
     *      ...
     *  ]
     *
     *  read:
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
      let writeType = variable.Write ? "write" : "read";

      //If there is a write type for objet to return - init array for this writeType
      if (!(writeType in splittedVariables)) splittedVariables[writeType] = [];

      //Add varaible to array representing variables of given write type
      splittedVariables[writeType].push(variable);
    }

    return splittedVariables;
  }

  /**
   * @description Method for ordering variables by order ascending
   * @param {object} variables Variables collection
   */
  _orderVariablesByOffset(variables) {
    let sortableVariables = [...variables];

    sortableVariables.sort(function(a, b) {
      return a.Offset - b.Offset;
    });
    return sortableVariables;
  }
}

module.exports = S7RequestGrouper;
