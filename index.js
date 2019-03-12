const MBDevice = require("./classes/device/Modbus/MBDevice");

let pac1 = new MBDevice("PAC1", "192.168.8.111");

pac1._driver.addGetDataAction("PAC1 Napiecia", 3, 1, 12);
pac1._driver.addGetDataAction("PAC1 Prady", 3, 13, 6);

let pac2 = new MBDevice("PAC2", "192.168.8.112");

pac2._driver.addGetDataAction("PAC2 Napiecia", 3, 1, 12);
pac2._driver.addGetDataAction("PAC2 Prady", 3, 13, 6);

let doRead1 = async device => {
  return pac1._driver.invokeActions();
};

let doRead2 = async device => {
  return pac2._driver.invokeActions();
};

let exec = async () => {
  try {
    await pac1.connect();
    await pac2.connect();

    setInterval(async () => {
      try {
        let data = await doRead1(pac1);
        console.log(data);
      } catch (err) {}
    }, 1000);

    setInterval(async () => {
      try {
        let data = await doRead2(pac2);
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
