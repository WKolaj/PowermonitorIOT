const MBDevice = require("./classes/device/Modbus/MBDevice");
const MBRTUDevice = require("./classes/device/Modbus/MBRTUDevice");
const MBGateway = require("./classes/driver/Modbus/MBGateway");
const MBRequestGrouper = require("./classes/driver/Modbus/MBRequestGrouper");
const MBRequest = require("./classes/driver/Modbus/MBRequest");
const MBVariable = require("./classes/variable/Modbus/MBVariable");
const MBFloatVariable = require("./classes/variable/Modbus/MBFloatVariable");
const MBInt16Variable = require("./classes/variable/Modbus/MBInt16Variable");

let pac1 = new MBDevice("PAC1");

pac1.setModbusDriver("192.168.0.17", 502, 2000, 1);

let napiecieL1 = new MBFloatVariable(pac1, "Napiecie L1", 3, 1);
let napiecieL2 = new MBFloatVariable(pac1, "Napiecie L2", 3, 2);
let napiecieL3 = new MBFloatVariable(pac1, "Napiecie L3", 3, 3);

let pradL1 = new MBFloatVariable(pac1, "Prad L1", 3, 13);
let pradL2 = new MBFloatVariable(pac1, "Prad L2", 3, 15);
let pradL3 = new MBFloatVariable(pac1, "Prad L3", 3, 17);

napiecieL1.Events.on("ValueChanged", args => {
  console.log(args[1]);
});

let variables = [];

variables.push(napiecieL1);
variables.push(napiecieL2);
variables.push(napiecieL3);
variables.push(pradL1);
variables.push(pradL2);
variables.push(pradL3);

let requests = pac1.RequestGrouper.ConvertVariablesToRequests(variables);

let doRead1 = async device => {
  return pac1._driver.invokeRequests(requests);
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
        //napiecieL1.Value = true;
        for (let req of requests) {
          req.updateAction();
        }
        let result = await doRead1(pac1);

        //console.log(result);
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
    console.log(err.message);
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
