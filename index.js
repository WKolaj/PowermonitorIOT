const Project = require("./classes/project/Project");
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

let project = new Project("_projTest");

let exec = async () => {
  await project.initFromFiles();

  let allDevices = await project.getAllDevices();

  for (let device of allDevices) {
    device.Events.on("Refreshed", args => {
      let device = args[0];
      let finalResult = args[1];
      let tickNumber = args[2];
      let elements = Object.values(finalResult);
      let formatedElements = elements.map(
        element => `${element.Id} : ${element.Value} ${element.Unit}`
      );
      console.log(`${device.Id}: ${tickNumber}`);
      console.log(formatedElements);
    });
  }

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

  // let value = await project.getValueBasedOnDate(
  //   "5cf54e5359022b376a172bb9",
  //   "5cf54e5359022b376a172bad",
  //   1559580360
  // );
};

exec();

var stdin = process.stdin;
stdin.resume();
stdin.setEncoding("utf8");
process.stdin.setRawMode(true);

stdin.on("data", async function(key) {
  if (key === "q") {
    process.exit();
  }

  if (key === "1") {
    console.log("editing first variable - unit");
    let variable = await project.getVariable("1234", "0001");
    let newUnit = "c";
    if (variable.Unit === "c") newUnit = "a";

    project.updateVariable("1234", "0001", {
      unit: newUnit
    });
  }

  if (key === "2") {
    console.log("editing second variable - offset");
    let variable = await project.getVariable("1234", "0002");
    let newOffset = 3;
    if (variable.Offset === 3) newOffset = 2;

    project.updateVariable("1234", "0002", {
      offset: newOffset
    });
  }
});
