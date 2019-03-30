const MBDevice = require("./classes/device/Modbus/MBDevice");
const MBRTUDevice = require("./classes/device/Modbus/MBRTUDevice");
const MBGateway = require("./classes/driver/Modbus/MBGateway");
const MBRequestGrouper = require("./classes/driver/Modbus/MBRequestGrouper");
const MBRequest = require("./classes/driver/Modbus/MBRequest");
const MBVariable = require("./classes/variable/Modbus/MBVariable");
const MBFloatVariable = require("./classes/variable/Modbus/MBFloatVariable");
const MBInt16Variable = require("./classes/variable/Modbus/MBInt16Variable");
const Sampler = require("./classes/sampler/Sampler");
const MBSwappedFloatVariable = require("./classes/variable/Modbus/MBSwappedFloatVariable");

let sampler = new Sampler();

let devicePayload = {
  name: "PAC",
  ipAdress: "192.168.1.8",
  timeout: 2000,
  unitId: 1,
  portNumber: 502
};

let device = new MBDevice(devicePayload);

device.Events.on("Refreshed", args => {
  console.log(args[2]);
  console.log(args[1]);
});

let var1Payload = {
  timeSample: 1,
  type: "float",
  name: "Napiecie L1-N",
  fCode: 3,
  offset: 1
};
let var2Payload = {
  timeSample: 1,
  type: "float",
  name: "Napiecie L2-N",
  fCode: 3,
  offset: 3
};
let var3Payload = {
  timeSample: 2,
  type: "float",
  name: "Napiecie L3-N",
  fCode: 3,
  offset: 5
};
// let var4Payload = {
//   timeSample: 2,
//   type: "swappedFloat",
//   name: "Napiecie L1-L2",
//   fCode: 3,
//   offset: 7
// };
// let var5Payload = {
//   timeSample: 2,
//   type: "swappedFloat",
//   name: "Napiecie L2-L3",
//   fCode: 3,
//   offset: 9
// };
// let var6Payload = {
//   timeSample: 2,
//   type: "swappedFloat",
//   name: "Napiecie L3-L1",
//   fCode: 3,
//   offset: 11
// };
// let var7Payload = {
//   timeSample: 3,
//   type: "swappedFloat",
//   name: "Prąd L1",
//   fCode: 3,
//   offset: 13
// };
// let var8Payload = {
//   timeSample: 3,
//   type: "swappedFloat",
//   name: "Prąd L2",
//   fCode: 3,
//   offset: 15
// };
// let var9Payload = {
//   timeSample: 3,
//   type: "swappedFloat",
//   name: "Prąd L3",
//   fCode: 3,
//   offset: 17
// };

let var1 = device.createVariable(var1Payload);
let var2 = device.createVariable(var2Payload);
let var3 = device.createVariable(var3Payload);

// device.createVariable(var4Payload);
// device.createVariable(var5Payload);
// device.createVariable(var6Payload);
// device.createVariable(var7Payload);
// device.createVariable(var8Payload);
// device.createVariable(var9Payload);

let logVar = args => {
  console.log(`${Date.now()}: ${args[0].Name}, ${args[1]}`);
};

console.log(device.Payload);

let device2 = new MBDevice(device.Payload);

device2.Events.on("Refreshed", args => {
  console.log(args[2]);
  console.log(args[1]);
});

// for (let variable of Object.values(device.Variables)) {
//   variable.Events.on("ValueChanged", qlogVar);
// }

// sampler.addDevice(device);

sampler.start();

// device.connect();

sampler.addDevice(device2);
device2.connect();

// let pac1 = new MBDevice("PAC1");

// pac1.setModbusDriver("192.168.0.20", 502, 2000, 1);

// let napiecieL1 = new MBFloatVariable(pac1, "Napiecie L1", 3, 1, 2);
// let napiecieL2 = new MBFloatVariable(pac1, "Napiecie L2", 3, 2, 2);
// let napiecieL3 = new MBFloatVariable(pac1, "Napiecie L3", 3, 3, 2);

// let pradL1 = new MBFloatVariable(pac1, "Prad L1", 3, 13, 2);
// let pradL2 = new MBFloatVariable(pac1, "Prad L2", 3, 15, 2);
// let pradL3 = new MBFloatVariable(pac1, "Prad L3", 3, 17, 2);

// napiecieL1.Events.on("ValueChanged", args => {
//   console.log(args[1]);
// });

// let variables = [];

// variables.push(napiecieL1);
// variables.push(napiecieL2);
// variables.push(napiecieL3);
// variables.push(pradL1);
// variables.push(pradL2);
// variables.push(pradL3);

// let requests = pac1.RequestGrouper.ConvertVariablesToRequests(variables);

// let doRead1 = async device => {
//   return pac1._driver.invokeRequests(requests);
//   //return napiecieL1.GetSingle();
// };

// // let doRead2 = async device => {
// //   return pac2._driver.invokeActions(actionsPac2);
// // };

// let lastBitSet = 0;

// let switchBits = function(byteArray) {
//   let bitIndex = 0;

//   for (let i = 0; i < byteArray.Value.length; i++) {
//     for (let j = 0; j < 8; j++) {
//       bitIndex === lastBitSet
//         ? byteArray.setBit(i, j)
//         : byteArray.clearBit(i, j);
//       bitIndex++;
//     }
//   }
//   lastBitSet === 31 ? (lastBitSet = 0) : lastBitSet++;
// };

// let exec = async () => {
//   try {
//     await pac1.connect();
//     //await pac2.connect();

//     setInterval(async () => {
//       try {
//         //napiecieL1.Value = [3, 4, 5, 6];
//         //switchBits(napiecieL1);
//         // for (let req of requests) {
//         //   req.updateAction();
//         // }
//         //await napiecieL1.SetSingle(435.23);
//         await napiecieL1.getSingle();
//         //console.log(await napiecieL1.GetSingle(435.23));
//         let result = await doRead1(pac1);
//         //console.log(napiecieL1.Value);16
//         //console.log(result);
//       } catch (err) {
//         console.log(err);
//       }
//     }, 1000);

//     // setIntlet actionsPAC1 = new MBDriverActions();
//     //   try {
//     //     let data = await doRead2(pac2);
//     // console.log(`${Date.now()}:`);
//     // console.log(data);
//     //   } catch (err) {
//     //     console.log(err);
//     //   }
//     // }, 1000);
//   } catch (err) {
//     console.log(err.message);
//   }
// };

// exec();

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
    let payload =
      var1.Name == "Napiecie L1-N"
        ? { name: "Napiecie L1-L2", offset: 7 }
        : { name: "Napiecie L1-N", offset: 1 };
    var1 = device.editVariable(var1.Id, payload);
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("2") == 0) {
    let payload =
      var2.Name == "Napiecie L2-N"
        ? { name: "Napiecie L2-L3", offset: 9 }
        : { name: "Napiecie L2-N", offset: 3 };
    var2 = device.editVariable(var2.Id, payload);
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("3") == 0) {
    let payload =
      var3.Name == "Napiecie L3-N"
        ? { name: "Napiecie L3-L1", offset: 11 }
        : { name: "Napiecie L3-N", offset: 5 };
    var3 = device.editVariable(var3.Id, payload);
  }
});
