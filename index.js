const MBDevice = require("./classes/device/Modbus/MBDevice");
const MBRTUDevice = require("./classes/device/Modbus/MBRTUDevice");
const MBGateway = require("./classes/driver/Modbus/MBGateway");
const MBDriverActions = require("./classes/driver/Modbus/MBDriverActions");
const MBDriverAction = require("./classes/driver/Modbus/MBDriverAction");
const MBRequestGrouper = require("./classes/driver/Modbus/MBRequestGrouper");
const MBRequest = require("./classes/driver/Modbus/MBRequest");
const MBVariable = require("./classes/variable/Modbus/MBVariable");

let pac1 = new MBDevice("PAC1");

pac1.setModbusDriver("192.168.0.20", 602, 2000, 2);

let actionsPAC1 = new MBDriverActions();

const mbRequest1 = new MBRequest(pac1._driver, 15, 0, 2);

const napiecieL1 = new MBVariable("Napiecie L1", 0, 2);
const napiecieL2 = new MBVariable("Napiecie L2", 2, 1);
const napiecieL3 = new MBVariable("Napiecie L3", 3, 2);
mbRequest1.addVariable(napiecieL1);
mbRequest1.addVariable(napiecieL2);
mbRequest1.addVariable(napiecieL3);

actionsPAC1.addAction(mbRequest1.Action);

// let pac1 = new MBRTUDevice("PAC1", 2);

// let gateway = new MBGateway("192.168.0.73");

// pac1.setModbusGateway(gateway);

// let pac1Voltage = pac1._driver.createGetDataAction(3, 1, 3, pac1._unitId);
// let pac1Currents = pac1._driver.createSetDataAction(
//   16,
//   4,
//   [1, 2, 3],
//   pac1._unitId
// );

// let pac2 = new MBDevice("PAC2", "192.168.8.112");

// let pac2Voltage = pac2._driver.createGetDataAction(3, 1, 12);
// let pac2Currents = pac2._driver.createGetDataAction(3, 13, 6);

// let actionsPac2 = [];

// actionsPac2["PAC2 Napiecia"] = pac2Voltage;
// actionsPac2["PAC2 Prady"] = pac2Currents;

let doRead1 = async device => {
  actionsPAC1 = new MBDriverActions();
  actionsPAC1.addAction(mbRequest1.Action);
  return pac1._driver.invokeActions(actionsPAC1);
};

// let doRead2 = async device => {
//   return pac2._driver.invokeActions(actionsPac2);
// };

let exec = async () => {
  try {
    await pac1.connect();
    //await pac2.connect();

    setInterval(async () => {
      try {
        let now = Math.round((Date.now() - 1552569213655) / 1000) % 2 == 0;
        napiecieL1.Data = [now, !now];
        napiecieL2.Data = now;
        napiecieL3.Data = [!now, now];
        console.log(mbRequest1.DataToSend);
        mbRequest1.updateAction();

        await doRead1(pac1);
        console.log("value written..");
      } catch (err) {
        console.log(err);
      }
    }, 1000);

    // setInterval(async () => {
    //   try {
    //     let data = await doRead2(pac2);
    // console.log(`${Date.now()}:`);
    // console.log(data);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }, 1000);
  } catch (err) {
    console.log(err);
  }
};

exec();

console.log("Press any key to exit");

process.stdin.setRawMode(true);
process.stdin.resume();

// on any data into stdin
process.stdin.on("data", async function(key) {
  if (key.indexOf("q") == 0) {
    await process.exit();
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("1") == 0) {
    console.log("disconnecting pac1...");
    await pac1.disconnect();
    console.log("pac1 disconnected");
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("2") == 0) {
    console.log("disconnecting pac2...");
    await pac2.disconnect();
    console.log("pac2 disconnected");
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("3") == 0) {
    console.log("connecting pac1...");
    await pac1.connect();
    console.log("pac1 connected");
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("4") == 0) {
    console.log("connecting pac2...");
    pac2.connect();
    console.log("pac2 connected");
  }
});
