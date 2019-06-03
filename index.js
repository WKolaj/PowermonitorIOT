const Project = require("./classes/project/Project");
const heapdump = require("heapdump");
const fs = require("fs");
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

let project = new Project("_projTest");

let commInterface = project.CommInterface;

let exec = async () => {
  await project.initFromFiles();
  //await commInterface.init();

  // for (let i = 0; i < 5; i++) {
  //   let deviceName = `PAC3200_${i}`;
  //   let portNumber = 10500 + i;

  //   let payload = {
  //     isActive: false,
  //     timeout: 500,
  //     ipAdress: "192.168.10.2",
  //     unitId: 1,
  //     type: "PAC3200TCP",
  //     name: deviceName,
  //     portNumber: portNumber
  //   };
  //   await commInterface.createNewDevice(payload);
  // }

  // await commInterface.startCommunicationWithAllDevices();

  //await project.save();

  // fs.writeFileSync(
  //   "./_projTest/test.json",
  //   JSON.stringify(project.CommInterface.Payload)
  // );

  let value = await project.getValueBasedOnDate(
    "5cf54e5359022b376a172bb9",
    "5cf54e5359022b376a172bad",
    1559580360
  );

  console.log(value);
};

exec();

setInterval(async () => {
  let value = await project.getValue(
    "5cf54e5359022b376a172bb9",
    "5cf54e5359022b376a172bb6"
  );

  console.log(value);
}, 1000);
