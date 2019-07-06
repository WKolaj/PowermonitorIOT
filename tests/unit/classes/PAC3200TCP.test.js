const PAC3200TCP = require("../../../classes/device/Modbus/Meters/PAC3200TCP");
const config = require("config");

let {
  clearDirectoryAsync,
  checkIfTableExists,
  checkIfColumnExists,
  checkIfFileExistsAsync,
  createDatabaseFile,
  createDatabaseTable,
  createDatabaseColumn,
  readAllDataFromTable,
  snooze
} = require("../../../utilities/utilities");

describe("PAC3200TCP", () => {
  //Database directory should be cleared
  let db1Path;
  let db2Path;
  beforeEach(async () => {
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
  });

  afterEach(async () => {
    await clearDirectoryAsync(db1Path);
    await clearDirectoryAsync(db2Path);
  });

  describe("init", () => {
    let device;
    let name;
    let ipAdress;
    let portNumber;
    let timeout;
    let unitId;
    let type;
    let payload;
    let variables;

    beforeEach(() => {
      name = "test name";
      ipAdress = "192.168.0.10";
      portNumber = 502;
      timeout = 2000;
      unitId = 1;
      variables = undefined;
      calculationElements = undefined;
      type = undefined;
      isActive = false;
    });

    let exec = async () => {
      payload = {
        name: name,
        ipAdress: ipAdress,
        portNumber: portNumber,
        timeout: timeout,
        unitId: unitId,
        variables: variables,
        calculationElements: calculationElements,
        type: type,
        isActive: isActive
      };
      device = new PAC3200TCP(payload);
      return device.init(payload);
    };

    it("should create new PAC3200TCP and set its name, ipAdress, portNumber, timeout and unitId", async () => {
      await exec();

      expect(device).toBeDefined();
      expect(device.Name).toEqual(name);
      expect(device.IPAdress).toEqual(ipAdress);
      expect(device.PortNumber).toEqual(portNumber);
      expect(device.Timeout).toEqual(timeout);
      expect(device.UnitId).toEqual(unitId);
    });

    it("should set all variables of PAC3200 according to PAC3200 schema", async () => {
      await exec();

      let PAC3200VariablesSchema = device._getVariablesSchema();

      let allVariableNames = Object.keys(PAC3200VariablesSchema);

      let allVariables = Object.values(device.Variables);

      for (let varName of allVariableNames) {
        let varPayload = PAC3200VariablesSchema[varName];

        let variable = allVariables.find(variable => variable.Name === varName);

        expect(variable).toBeDefined();
        expect(variable.Id).toBeDefined();
        expect(variable.Name).toEqual(varName);

        expect(variable.TimeSample).toEqual(varPayload.timeSample);
        expect(variable.Offset).toEqual(varPayload.offset);
        expect(variable.Length).toEqual(varPayload.length);
        expect(variable.FCode).toEqual(varPayload.fCode);
        expect(variable.Value).toEqual(varPayload.value);
        expect(variable.Type).toEqual(varPayload.type);
        expect(variable.Archived).toEqual(varPayload.archived);
        expect(variable.Unit).toEqual(varPayload.unit);
      }
    });

    it("should set all calculationElements of PAC3200 according to PAC3200 schema", async () => {
      await exec();

      let PAC3200VariablesSchema = device._getVariablesSchema();

      let PAC3200ElementsSchema = device._getCalculationElementsSchema(
        PAC3200VariablesSchema
      );

      let allElementNames = Object.keys(PAC3200ElementsSchema);

      let allElements = Object.values(device.CalculationElements);

      for (let elName of allElementNames) {
        let elPayload = PAC3200ElementsSchema[elName];

        let element = allElements.find(element => element.Name === elName);

        expect(element).toBeDefined();
        expect(element.Id).toBeDefined();
        expect(element.Name).toEqual(elName);

        expect(element.SampleTime).toEqual(elPayload.sampleTime);
        expect(element.CalculationInterval).toEqual(
          elPayload.calculationInterval
        );
        expect(element.Factor).toEqual(elPayload.factor);
        expect(element.Archived).toEqual(elPayload.archived);
        expect(element.Type).toEqual(elPayload.type);
      }
    });

    it("should not set calculationElements of PAC3200 according but regularly if variables and calculationElements are given in payload", async () => {
      await exec();

      let allVariables = Object.values(device.Variables);

      //Editting device
      for (let variable of allVariables) {
        await device.editVariable(variable.Id, { archived: true });
      }

      let devicePayload = device.Payload;

      //Checking if new device - created on the basis of payload of edited device is the same with device Payload

      let newDevice = new PAC3200TCP();

      await newDevice.init(devicePayload);

      expect(device.Payload).toEqual(newDevice.Payload);
    });
  });
});
