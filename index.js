const commInterface = require("./classes/commInterface/CommInterface");

let json = {
  "5c9f8a7fd04bb119b3ad229f": {
    id: "5c9f8a7fd04bb119b3ad229f",
    name: "PAC",
    isActive: false,
    timeout: 2000,
    ipAdress: "192.168.1.10",
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
  }
};

commInterface.init(json);

//console.log(Object.values(commInterface.Devices)[0].MBDriver._client.isOpen());

commInterface.startCommunicationWithAllDevices();

for (let device of Object.values(commInterface.Devices)) {
  device.Events.on("Refreshed", args => {
    console.log(args[2]);
    let allIds = Object.keys(args[1]);
    for (let id of allIds) {
      console.log(`${args[1][id].Name}: ${args[1][id].Value}`);
    }
  });
}

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
    commInterface.setVariableInDevice(
      "5c9f8a7fd04bb119b3ad229f",
      "5c9f8a7fd04bb119b3ad22a0",
      Math.random() * 100
    );
  }

  // without rawmode, it returns EOL with the string
  if (key.indexOf("2") == 0) {
    console.log(
      await commInterface.getVariableFromDevice(
        "5c9f8a7fd04bb119b3ad229f",
        "5c9f8a7fd04bb119b3ad22a0"
      )
    );
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
