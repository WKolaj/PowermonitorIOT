const S7Device = require("./classes/device/S7/S7Device");
const MBDevice = require("./classes/device/Modbus/MBDevice");
const { snooze } = require("./utilities/utilities");
var stdin = process.stdin;

// without this, we would only get streams once enter is pressed
stdin.setRawMode(true);

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding("utf8");

let exec = async () => {
  try {
    let device = new S7Device();
    let initPayload = {
      ipAdress: "192.168.0.131",
      slot: 1,
      rack: 0,
      name: "test",
      type: "s7Device",
      timeout: 3000,
      isActive: true
    };
    await device.init(initPayload);
    device.Events.on("Refreshed", args => {
      if (Object.values(args[1]).length > 0) {
        console.log(args[2]);

        for (let variable of Object.values(args[1])) {
          console.log(variable.Name + " " + variable.Value);
        }
      }
    });

    let variable1Payload = {
      name: "testVariable1",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7Int8",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      offset: 0
    };

    let var1 = await device.createVariable(variable1Payload);

    let variable2Payload = {
      name: "testVariable2",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7Int16",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      offset: 2
    };

    let var2 = await device.createVariable(variable2Payload);

    let variable3Payload = {
      name: "testVariable3",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7Int32",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      offset: 4
    };

    let var3 = await device.createVariable(variable3Payload);

    let variable4Payload = {
      name: "testVariable4",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7UInt8",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      offset: 8
    };

    let var4 = await device.createVariable(variable4Payload);

    let variable5Payload = {
      name: "testVariable5",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7UInt16",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      offset: 10
    };

    let var5 = await device.createVariable(variable5Payload);

    let variable6Payload = {
      name: "testVariable6",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7UInt32",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      offset: 12
    };

    let var6 = await device.createVariable(variable6Payload);

    let variable7Payload = {
      name: "testVariable7",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7Int16",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      offset: 16
    };

    let var7 = await device.createVariable(variable7Payload);

    let variable8Payload = {
      name: "testVariable8",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7Int16",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      offset: 18
    };

    let var8 = await device.createVariable(variable8Payload);

    let variable9Payload = {
      name: "testVariable9",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7ByteArray",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      length: 8,
      offset: 20
    };

    let var9 = await device.createVariable(variable9Payload);

    let variable10Payload = {
      name: "testVariable10",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7Int8",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      length: 8,
      offset: 28
    };

    let var10 = await device.createVariable(variable10Payload);

    let variable11Payload = {
      name: "testVariable11",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7Int8",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      length: 8,
      offset: 29
    };

    let var11 = await device.createVariable(variable11Payload);

    let variable12Payload = {
      name: "testVariable12",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7Float",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      offset: 30
    };

    let var12 = await device.createVariable(variable12Payload);

    let variable13Payload = {
      name: "testVariable13",
      sampleTime: 1,
      archived: false,
      unit: "",
      type: "s7Float",
      areaType: "DB",
      write: false,
      dbNumber: 7,
      offset: 34
    };

    let var13 = await device.createVariable(variable13Payload);

    setInterval(async () => {
      try {
        let tick = Math.round(Date.now() / 1000);

        await device.refresh(tick);

        await var12.setSingle(1234.4321);
        await var13.setSingle(123456.321);
      } catch (err) {
        console.log(err);
      }
    }, 1000);
  } catch (err) {
    console.log(err);
  }
};

exec();

// let exec2 = async () => {
//   try {
//     let device = new MBDevice();
//     let initPayload = {
//       ipAdress: "192.168.1.131",
//       portNumber: 502,
//       name: "test",
//       type: "s7Device",
//       timeout: 3000,
//       isActive: true,
//       unitId: 1
//     };
//     await device.init(initPayload);
//     device.Events.on("Refreshed", args => {
//       if (Object.values(args[1]).length > 0) {
//         console.log(args[2]);
//         console.log(Object.values(args[1])[0].Value);
//         console.log(Object.values(args[1])[1].Value);
//         console.log(Object.values(args[1])[2].Value);
//         console.log(Object.values(args[1])[3].Value);
//       }
//     });

//     let variable1Payload = {
//       name: "testVariable1",
//       sampleTime: 1,
//       archived: false,
//       unit: "",
//       type: "mbSwappedUInt32",
//       offset: 84 / 2,
//       fCode: 3
//     };

//     await device.createVariable(variable1Payload);

//     let variable2Payload = {
//       name: "testVariable2",
//       sampleTime: 1,
//       archived: false,
//       unit: "",
//       type: "mbSwappedUInt32",
//       offset: 88 / 2,
//       fCode: 3
//     };

//     await device.createVariable(variable2Payload);

//     let variable3Payload = {
//       name: "testVariable3",
//       sampleTime: 1,
//       archived: false,
//       unit: "",
//       type: "mbSwappedUInt32",
//       offset: 92 / 2,
//       fCode: 16
//     };

//     let var3 = await device.createVariable(variable3Payload);

//     let variable4Payload = {
//       name: "testVariable4",
//       sampleTime: 1,
//       archived: false,
//       unit: "",
//       type: "mbSwappedUInt32",
//       offset: 96 / 2,
//       fCode: 3
//     };

//     let var4 = await device.createVariable(variable4Payload);

//     setInterval(() => {
//       try {
//         let tick = Math.round(Date.now() / 1000);
//         device.editVariable(var3.Id, {
//           value: 123
//         });
//         device.refresh(tick);
//       } catch (err) {
//         console.log(err);
//       }
//     }, 1000);
//   } catch (err) {
//     console.log(err);
//   }
// };

// exec2();

stdin.on("data", function(key) {
  // ctrl-c ( end of text )
  if (key === "1") {
    dataAgent._sendDataPossible = true;
    console.log("Sending possible");
  }
  if (key === "2") {
    dataAgent._sendDataPossible = false;
    console.log("Sending impossible");
  }
  if (key === "3") {
    process.exit();
  }
});
