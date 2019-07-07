const MBDeviceWithTemplate = require("../MBDeviceWithTemplate");
const Variable = require("../../../variable/Variable");

class PAC4200TCP extends MBDeviceWithTemplate {
  /**
   * @description PAC4200 meter with TCP connection
   */
  constructor() {
    super();
  }

  /**
   * @description Method for getting variables schema
   */
  _getVariablesSchema() {
    return {
      "Voltage L1-N": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 1,
        length: 2,
        fCode: 3,
        value: 0,
        type: "mbSwappedFloat",
        archived: false,
        unit: "V",
        archiveSampleTime: 10
      },
      "Voltage L2-N": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 3,
        length: 2,
        fCode: 3,
        value: 0,
        type: "mbSwappedFloat",
        archived: false,
        unit: "V",
        archiveSampleTime: 10
      },
      "Voltage L3-N": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 5,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "V",
        archiveSampleTime: 10
      },
      "Voltage L1-L2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 7,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbSwappedFloat",
        archived: false,
        unit: "V",
        archiveSampleTime: 10
      },
      "Voltage L2-L3": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 9,
        length: 2,
        fCode: 3,
        value: 2,
        type: "mbSwappedFloat",
        archived: false,
        unit: "V",
        archiveSampleTime: 10
      },
      "Voltage L3-L1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 11,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "V",
        archiveSampleTime: 10
      },
      "Current L1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 13,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbSwappedFloat",
        archived: false,
        unit: "A",
        archiveSampleTime: 10
      },
      "Current L2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 15,
        length: 2,
        fCode: 3,
        value: 2,
        type: "mbSwappedFloat",
        archived: false,
        unit: "A",
        archiveSampleTime: 10
      },
      "Current L3": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 17,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "A",
        archiveSampleTime: 10
      },
      "Apparent power L1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 19,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbSwappedFloat",
        archived: false,
        unit: "VA",
        archiveSampleTime: 10
      },
      "Apparent power L2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 21,
        length: 2,
        fCode: 3,
        value: 2,
        type: "mbSwappedFloat",
        archived: false,
        unit: "VA",
        archiveSampleTime: 10
      },
      "Apparent power L3": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 23,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "VA",
        archiveSampleTime: 10
      },
      "Active power L1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 25,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbSwappedFloat",
        archived: false,
        unit: "W",
        archiveSampleTime: 10
      },
      "Active power L2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 27,
        length: 2,
        fCode: 3,
        value: 2,
        type: "mbSwappedFloat",
        archived: false,
        unit: "W",
        archiveSampleTime: 10
      },
      "Active power L3": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 29,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "W",
        archiveSampleTime: 10
      },
      "Reactive power L1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 31,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbSwappedFloat",
        archived: false,
        unit: "var",
        archiveSampleTime: 10
      },
      "Reactive power L2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 33,
        length: 2,
        fCode: 3,
        value: 2,
        type: "mbSwappedFloat",
        archived: false,
        unit: "var",
        archiveSampleTime: 10
      },
      "Reactive power L3": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 35,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "var",
        archiveSampleTime: 10
      },
      "Power factor L1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 37,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbSwappedFloat",
        archived: false,
        unit: "",
        archiveSampleTime: 10
      },
      "Power factor L2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 39,
        length: 2,
        fCode: 3,
        value: 2,
        type: "mbSwappedFloat",
        archived: false,
        unit: "",
        archiveSampleTime: 10
      },
      "Power factor L3": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 41,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "",
        archiveSampleTime: 10
      },
      "THD Voltage L1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 43,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbSwappedFloat",
        archived: false,
        unit: "%",
        archiveSampleTime: 10
      },
      "THD Voltage L2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 45,
        length: 2,
        fCode: 3,
        value: 2,
        type: "mbSwappedFloat",
        archived: false,
        unit: "%",
        archiveSampleTime: 10
      },
      "THD Voltage L3": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 47,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "%",
        archiveSampleTime: 10
      },
      "THD Current L1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 49,
        length: 2,
        fCode: 3,
        value: 1,
        type: "mbSwappedFloat",
        archived: false,
        unit: "%",
        archiveSampleTime: 10
      },
      "THD Current L2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 51,
        length: 2,
        fCode: 3,
        value: 2,
        type: "mbSwappedFloat",
        archived: false,
        unit: "%",
        archiveSampleTime: 10
      },
      "THD Current L3": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 53,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "%",
        archiveSampleTime: 10
      },
      Frequency: {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 55,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "Hz",
        archiveSampleTime: 10
      },
      "Average voltage L-N": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 57,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "V",
        archiveSampleTime: 10
      },
      "Average voltage L-L": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 59,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "V",
        archiveSampleTime: 10
      },
      "Average current": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 61,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "A",
        archiveSampleTime: 10
      },
      "Total apparent power": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 63,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "VA",
        archiveSampleTime: 10
      },
      "Total active power": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 65,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "W",
        archiveSampleTime: 10
      },
      "Total reactive power": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 67,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "var",
        archiveSampleTime: 10
      },
      "Total power factor": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 69,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "",
        archiveSampleTime: 10
      },
      "Voltage unbalance": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 71,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "%",
        archiveSampleTime: 10
      },
      "Current unbalance": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 73,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "%",
        archiveSampleTime: 10
      },
      "Active energy import - tarif 1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 2801,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: true,
        unit: "Wh",
        archiveSampleTime: 60
      },
      "Active energy import - tarif 2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 2803,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "Wh",
        archiveSampleTime: 60
      },
      "Active energy export - tarif 1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 2805,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: true,
        unit: "Wh",
        archiveSampleTime: 60
      },
      "Active energy export - tarif 2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 2807,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "Wh",
        archiveSampleTime: 60
      },
      "Reactive energy import - tarif 1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 2809,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: true,
        unit: "varh",
        archiveSampleTime: 60
      },
      "Reactive energy import - tarif 2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 2811,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "varh",
        archiveSampleTime: 60
      },
      "Reactive energy export - tarif 1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 2813,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: true,
        unit: "varh",
        archiveSampleTime: 60
      },
      "Reactive energy export - tarif 2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 2815,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "varh",
        archiveSampleTime: 60
      },
      "Apparent energy - tarif 1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 2817,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: true,
        unit: "VAh",
        archiveSampleTime: 60
      },
      "Apparent energy - tarif 2": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        offset: 2819,
        length: 2,
        fCode: 3,
        value: 3,
        type: "mbSwappedFloat",
        archived: false,
        unit: "VAh",
        archiveSampleTime: 60
      }
    };
  }

  /**
   * @description Method for getting calculation elements
   */
  _getCalculationElementsSchema(variablesSchema) {
    //reading generated variables id
    let currentL1Id = variablesSchema["Current L1"].id;
    let currentL2Id = variablesSchema["Current L2"].id;
    let currentL3Id = variablesSchema["Current L3"].id;
    let totalApparentPowerId = variablesSchema["Total apparent power"].id;
    let totalActivePowerId = variablesSchema["Total active power"].id;
    let totalReactivePowerId = variablesSchema["Total reactive power"].id;
    let totalPowerFactorId = variablesSchema["Total power factor"].id;
    let activeEnergyImportT1Id =
      variablesSchema["Active energy import - tarif 1"].id;
    let activeEnergyExportT1Id =
      variablesSchema["Active energy export - tarif 1"].id;
    let reactiveEnergyImportT1Id =
      variablesSchema["Reactive energy import - tarif 1"].id;
    let reactiveEnergyExportT1Id =
      variablesSchema["Reactive energy export - tarif 1"].id;
    let apparentEnergyId = variablesSchema["Apparent energy - tarif 1"].id;

    return {
      "Active power import 15-min - tarif 1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 900,
        factor: 4,
        unit: "W",
        archived: true,
        variableId: activeEnergyImportT1Id,
        type: "increaseElement",
        overflow: 1000000000000,
        archiveSampleTime: 1
      },
      "Active power export 15-min - tarif 1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 900,
        factor: 4,
        unit: "W",
        archived: true,
        variableId: activeEnergyExportT1Id,
        type: "increaseElement",
        overflow: 1000000000000,
        archiveSampleTime: 1
      },
      "Reactive power import 15-min - tarif 1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 900,
        factor: 4,
        unit: "var",
        archived: true,
        variableId: reactiveEnergyImportT1Id,
        type: "increaseElement",
        overflow: 1000000000000,
        archiveSampleTime: 1
      },
      "Reactive power export 15-min - tarif 1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 900,
        factor: 4,
        unit: "var",
        archived: true,
        variableId: reactiveEnergyExportT1Id,
        type: "increaseElement",
        overflow: 1000000000000,
        archiveSampleTime: 1
      },
      "Apparent power 15-min - tarif 1": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 900,
        factor: 4,
        unit: "VA",
        archived: true,
        variableId: apparentEnergyId,
        type: "increaseElement",
        overflow: 1000000000000,
        archiveSampleTime: 1
      },
      "Total active power average": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 60,
        factor: 1,
        unit: "W",
        archived: true,
        variableId: totalActivePowerId,
        type: "averageElement",
        archiveSampleTime: 1
      },
      "Total reactive power average": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 60,
        factor: 1,
        unit: "var",
        archived: true,
        variableId: totalReactivePowerId,
        type: "averageElement",
        archiveSampleTime: 1
      },
      "Total apparent power average": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 60,
        factor: 1,
        unit: "VA",
        archived: true,
        variableId: totalApparentPowerId,
        type: "averageElement",
        archiveSampleTime: 1
      },
      "Total power factor average": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 60,
        factor: 1,
        unit: "",
        archived: true,
        variableId: totalPowerFactorId,
        type: "averageElement",
        archiveSampleTime: 1
      },
      "Current L1 average": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 60,
        factor: 1,
        unit: "A",
        archived: true,
        variableId: currentL1Id,
        type: "averageElement",
        archiveSampleTime: 1
      },
      "Current L2 average": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 60,
        factor: 1,
        unit: "A",
        archived: true,
        variableId: currentL2Id,
        type: "averageElement",
        archiveSampleTime: 1
      },
      "Current L3 average": {
        id: Variable.generateRandId(),
        sampleTime: 1,
        calculationInterval: 60,
        factor: 1,
        unit: "A",
        archived: true,
        variableId: currentL3Id,
        type: "averageElement",
        archiveSampleTime: 1
      }
    };
  }
}

module.exports = PAC4200TCP;
