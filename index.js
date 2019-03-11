const MBDevice = require("./classes/device/Modbus/MBDevice");

let mbDevice = new MBDevice("PAC", "192.168.0.211");

let doRead = async device => {
  return Promise.all([device._driver.getData(4, 1, 2)]);
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
