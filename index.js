const TestDataAgent = require("./classes/device/SpecialDevices/SendAgent/TestDataAgent");
var stdin = process.stdin;

// without this, we would only get streams once enter is pressed
stdin.setRawMode(true);

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding("utf8");

let dataAgent = new TestDataAgent();

let exec = async () => {
  let payload = {
    dirPath: "_projTest/123456"
  };

  await dataAgent.init(payload);
  await dataAgent.initSendingMechanism();

  let variable1 = "dp1";
  let variable2 = "dp2";
  let variable3 = "dp3";
  let variable4 = "dp4";
  let variable5 = "dp5";
  let variable6 = "dp6";
  let variable7 = "dp7";
  let variable8 = "dp8";
  let variable9 = "dp9";

  await dataAgent.addVariable(1000, variable1);
  await dataAgent.addVariable(1000, variable2);
  await dataAgent.addVariable(1000, variable3);
  await dataAgent.addVariable(2000, variable4);
  await dataAgent.addVariable(2000, variable5);
  await dataAgent.addVariable(2000, variable6);
  await dataAgent.addVariable(3000, variable7);
  await dataAgent.addVariable(3000, variable8);
  await dataAgent.addVariable(3000, variable9);

  setInterval(() => {
    let dataToSend = {
      dp1: Date.now() / 1000,
      dp2: Date.now() / 2000,
      dp3: Date.now() / 3000,
      dp4: Date.now() / 4000,
      dp5: Date.now() / 5000,
      dp6: Date.now() / 6000,
      dp7: Date.now() / 7000,
      dp8: Date.now() / 8000,
      dp9: Date.now() / 9000
    };
    dataAgent.refresh(Date.now(), dataToSend);
  }, 1000);
};

exec();

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
