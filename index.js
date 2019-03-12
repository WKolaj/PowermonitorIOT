const MBDevice = require("./classes/device/Modbus/MBDevice");

let mbDevice = new MBDevice("PAC", "192.168.0.20");

mbDevice._driver.addGetDataAction("Napiecia", 3, 0, 3);
mbDevice._driver.addGetDataAction("Prady", 3, 14, 3);
//mbDevice._driver.addGetDataAction(3, 3, 2, 1);

let doRead = async device => {
  return mbDevice._driver.invokeActions();
};

let exec = async () => {
  try {
    await mbDevice.connect();

    setInterval(async () => {
      try {
        let data = await doRead(mbDevice);
        console.log(data);
      } catch (err) {}
    }, 1000);
  } catch (err) {}
};

exec();

console.log("Press any key to exit");

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", process.exit.bind(process, 0));
