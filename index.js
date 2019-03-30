const commInterface = require("./classes/commInterface/CommInterface");

let json = {
  "5c9f8a7fd04bb119b3ad229f": {
    id: "5c9f8a7fd04bb119b3ad229f",
    name: "PAC",
    isActive: false,
    timeout: 2000,
    ipAdress: "192.168.1.8",
    unitId: 1,
    portNumber: 502,
    variables: [
      {
        id: "5c9f8a7fd04bb119b3ad22a0",
        timeSample: 1,
        name: "Napiecie L1-N",
        offset: 1,
        length: 2,
        fCode: 3,
        value: 1,
        type: "float"
      },
      {
        id: "5c9f8a7fd04bb119b3ad22a4",
        timeSample: 1,
        name: "Napiecie L2-N",
        offset: 3,
        length: 2,
        fCode: 3,
        value: 2,
        type: "float"
      },
      {
        id: "5c9f8a7fd04bb119b3ad22a8",
        timeSample: 1,
        name: "Napiecie L3-N",
        offset: 5,
        length: 2,
        fCode: 3,
        value: 3,
        type: "float"
      }
    ],
    type: "mbDevice"
  },
  "5c9f8a7fd04bb119b3ad22ac": {
    id: "5c9f8a7fd04bb119b3ad22ac",
    name: "PAC",
    isActive: false,
    timeout: 2000,
    ipAdress: "192.168.1.8",
    unitId: 1,
    portNumber: 503,
    variables: [
      {
        id: "5c9f8a7fd04bb119b3ad22ad",
        timeSample: 1,
        name: "Napiecie L1-N",
        offset: 1,
        length: 2,
        fCode: 3,
        value: 4,
        type: "float"
      },
      {
        id: "5c9f8a7fd04bb119b3ad22b1",
        timeSample: 1,
        name: "Napiecie L2-N",
        offset: 3,
        length: 2,
        fCode: 3,
        value: 5,
        type: "float"
      },
      {
        id: "5c9f8a7fd04bb119b3ad22b5",
        timeSample: 1,
        name: "Napiecie L3-N",
        offset: 5,
        length: 2,
        fCode: 3,
        value: 6,
        type: "float"
      }
    ],
    type: "mbDevice"
  },
  "5c9f8a7fd04bb119b3ad22b9": {
    id: "5c9f8a7fd04bb119b3ad22b9",
    name: "PAC",
    isActive: false,
    timeout: 2000,
    ipAdress: "192.168.1.8",
    unitId: 1,
    portNumber: 504,
    variables: [
      {
        id: "5c9f8a7fd04bb119b3ad22ba",
        timeSample: 1,
        name: "Napiecie L1-N",
        offset: 1,
        length: 2,
        fCode: 3,
        value: 7,
        type: "float"
      },
      {
        id: "5c9f8a7fd04bb119b3ad22be",
        timeSample: 1,
        name: "Napiecie L2-N",
        offset: 3,
        length: 2,
        fCode: 3,
        value: 8,
        type: "float"
      },
      {
        id: "5c9f8a7fd04bb119b3ad22c2",
        timeSample: 1,
        name: "Napiecie L3-N",
        offset: 5,
        length: 2,
        fCode: 3,
        value: 9,
        type: "float"
      }
    ],
    type: "mbDevice"
  }
};

commInterface.init(json);

commInterface.startCommunicationWithAllDevices();

// let device1Payload = {
//   type: "mbDevice",
//   name: "PAC",
//   ipAdress: "192.168.1.8",
//   timeout: 2000,
//   unitId: 1,
//   portNumber: 502,
//   variables: [
//     {
//       timeSample: 1,
//       type: "float",
//       name: "Napiecie L1-N",
//       fCode: 3,
//       offset: 1
//     },
//     {
//       timeSample: 1,
//       type: "float",
//       name: "Napiecie L2-N",
//       fCode: 3,
//       offset: 3
//     },
//     {
//       timeSample: 1,
//       type: "float",
//       name: "Napiecie L3-N",
//       fCode: 3,
//       offset: 5
//     }
//   ]
// };

// let device2Payload = {
//   type: "mbDevice",
//   name: "PAC",
//   ipAdress: "192.168.1.8",
//   timeout: 2000,
//   unitId: 1,
//   portNumber: 503,
//   variables: [
//     {
//       timeSample: 1,
//       type: "float",
//       name: "Napiecie L1-N",
//       fCode: 3,
//       offset: 1
//     },
//     {
//       timeSample: 1,
//       type: "float",
//       name: "Napiecie L2-N",
//       fCode: 3,
//       offset: 3
//     },
//     {
//       timeSample: 1,
//       type: "float",
//       name: "Napiecie L3-N",
//       fCode: 3,
//       offset: 5
//     }
//   ]
// };

// let device3Payload = {
//   type: "mbDevice",
//   name: "PAC",
//   ipAdress: "192.168.1.8",
//   timeout: 2000,
//   unitId: 1,
//   portNumber: 504,
//   variables: [
//     {
//       timeSample: 1,
//       type: "float",
//       name: "Napiecie L1-N",
//       fCode: 3,
//       offset: 1
//     },
//     {
//       timeSample: 1,
//       type: "float",
//       name: "Napiecie L2-N",
//       fCode: 3,
//       offset: 3
//     },
//     {
//       timeSample: 1,
//       type: "float",
//       name: "Napiecie L3-N",
//       fCode: 3,
//       offset: 5
//     }
//   ]
// };

// let device1 = commInterface.createNewDevice(device1Payload);
// let device2 = commInterface.createNewDevice(device2Payload);
// let device3 = commInterface.createNewDevice(device3Payload);

for (let device of Object.values(commInterface.Devices)) {
  device.Events.on("Refreshed", args => {
    console.log(args[2]);
    let allIds = Object.keys(args[1]);
    for (let id of allIds) {
      console.log(`${args[1][id].Name}: ${args[1][id].Value}`);
    }
  });
}

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

// let var1 = device.createVariable(var1Payload);
// let var2 = device.createVariable(var2Payload);
// let var3 = device.createVariable(var3Payload);

// device.createVariable(var4Payload);
// device.createVariable(var5Payload);
// device.createVariable(var6Payload);
// device.createVariable(var7Payload);
// device.createVariable(var8Payload);
// device.createVariable(var9Payload);

// let logVar = args => {
//   console.log(`${Date.now()}: ${args[0].Name}, ${args[1]}`);
// };

// let device2 = new MBDevice(device.Payload);

// device2.Events.on("Refreshed", args => {
//   console.log(args[2]);
//   console.log(args[1]);
// });

// for (let variable of Object.values(device.Variables)) {
//   variable.Events.on("ValueChanged", qlogVar);
// }

// sampler.addDevice(device2);
// device2.connect();

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
      device.PortNumber == 502 ? { portNumber: 503 } : { portNumber: 502 };
    device.editWithPayload(payload);
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("2") == 0) {
    let payload =
      device.Timeout == 2000 ? { timeout: 1000 } : { timeout: 2000 };
    device.editWithPayload(payload);
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("3") == 0) {
    let payload =
      device.IPAdress == "192.168.1.8"
        ? { ipAdress: "192.168.1.9" }
        : { ipAdress: "192.168.1.8" };
    device.editWithPayload(payload);
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("4") == 0) {
    let payload = device.UnitId == 1 ? { unitId: 2 } : { unitId: 1 };
    device.editWithPayload(payload);
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("5") == 0) {
    console.log(JSON.stringify(commInterface.Payload));
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("6") == 0) {
    commInterface.startCommunicationWithAllDevices();
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("7") == 0) {
    commInterface.stopCommunicationWithAllDevices();
  }
});
