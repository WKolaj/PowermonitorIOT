const MBDevice = require("./classes/device/Modbus/MBDevice");
const MBRTUDevice = require("./classes/device/Modbus/MBRTUDevice");
const MBGateway = require("./classes/driver/Modbus/MBGateway");

let pac1 = new MBDevice("PAC1");

pac1.setModbusDriver("192.168.0.73", 502, 2000, 2);

// let pac1 = new MBDevice("PAC1", 2);

// let gateway = new MBGateway("192.168.0.73");

// pac1.setModbusGateway(gateway);

let pac1Voltage = pac1._driver.createGetDataAction(3, 1, 3);
let pac1Currents = pac1._driver.createSetDataAction(16, 4, [1, 2, 3]);

let actionsPac1 = [];

actionsPac1["PAC1 Napiecia"] = pac1Voltage;
actionsPac1["PAC1 Prady"] = pac1Currents;

// let pac2 = new MBDevice("PAC2", "192.168.8.112");

// let pac2Voltage = pac2._driver.createGetDataAction(3, 1, 12);
// let pac2Currents = pac2._driver.createGetDataAction(3, 13, 6);

// let actionsPac2 = [];

// actionsPac2["PAC2 Napiecia"] = pac2Voltage;
// actionsPac2["PAC2 Prady"] = pac2Currents;

let doRead1 = async device => {
  return pac1._driver.invokeActions(actionsPac1);
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
        let data = await doRead1(pac1);
        console.log(data);
      } catch (err) {
        console.log(err);
      }
    }, 1000);

    // setInterval(async () => {
    //   try {
    //     let data = await doRead2(pac2);
    //     console.log(data);
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }, 1000);
  } catch (err) {}
};

exec();

console.log("Press any key to exit");

process.stdin.setRawMode(true);
process.stdin.resume();

// on any data into stdin
process.stdin.on("data", function(key) {
  if (key.indexOf("q") == 0) {
    process.exit();
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("1") == 0) {
    console.log("disconnecting pac1...");
    pac1.disconnect();
    console.log("pac1 disconnected");
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("2") == 0) {
    console.log("disconnecting pac2...");
    pac2.disconnect();
    console.log("pac2 disconnected");
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("3") == 0) {
    console.log("connecting pac1...");
    pac1.connect();
    console.log("pac1 connected");
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("4") == 0) {
    console.log("connecting pac2...");
    pac2.connect();
    console.log("pac2 connected");
  }
});
