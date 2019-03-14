const MBDevice = require("./classes/device/Modbus/MBDevice");
const MBRTUDevice = require("./classes/device/Modbus/MBRTUDevice");
const MBGateway = require("./classes/driver/Modbus/MBGateway");
const MBRequestGrouper = require("./classes/driver/Modbus/MBRequestGrouper");
const MBRequest = require("./classes/driver/Modbus/MBRequest");
const MBVariable = require("./classes/variable/Modbus/MBVariable");

let pac1 = new MBDevice("PAC1");

pac1.setModbusDriver("192.168.0.17", 602, 2000, 2);

const mbRequest1 = new MBRequest(pac1._driver, 16, 1);

const napiecieL1 = new MBVariable("Napiecie L1", 0, 2);
const napiecieL2 = new MBVariable("Napiecie L2", 2, 1);
const napiecieL3 = new MBVariable("Napiecie L3", 3, 2);

mbRequest1.addVariable(napiecieL1);
mbRequest1.addVariable(napiecieL2);
mbRequest1.addVariable(napiecieL3);

const mbRequest2 = new MBRequest(pac1._driver, 16, 1);

const pradL1 = new MBVariable("Prad L1", 6, 2);
const pradL2 = new MBVariable("Prad L2", 8, 1);
const pradL3 = new MBVariable("Prad L3", 9, 2);

mbRequest2.addVariable(pradL1);
mbRequest2.addVariable(pradL2);
mbRequest2.addVariable(pradL3);

let doRead1 = async device => {
  return pac1._driver.invokeRequests([mbRequest1, mbRequest2]);
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
        let now = Math.round((Date.now() - 1552569213655) / 1000);
        napiecieL1.Data = [now + 10, now + 9];
        napiecieL2.Data = now + 8;
        napiecieL3.Data = [now + 7, now + 6];
        mbRequest1.updateAction();
        pradL1.Data = [now + 5, now + 4];
        pradL2.Data = now + 3;
        pradL3.Data = [now + 2, now + 1];
        mbRequest2.updateAction();

        let result = await doRead1(pac1);
        console.log(mbRequest1.VariableConnections);
        console.log(mbRequest2.VariableConnections);
        console.log(result);
      } catch (err) {
        console.log(err);
      }
    }, 1000);

    // setIntlet actionsPAC1 = new MBDriverActions();
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
