const MSDataAgent = require("./classes/device/SpecialDevices/SendAgent/MSDataAgent");
const Sampler = require("./classes/sampler/Sampler");
var stdin = process.stdin;

// without this, we would only get streams once enter is pressed
stdin.setRawMode(true);

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding("utf8");

let msAgent = new MSDataAgent();

let boardingKey = {
  content: {
    baseUrl: "https://southgate.eu1.mindsphere.io",
    iat:
      "eyJraWQiOiJrZXktaWQtMSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJTQ0kiLCJzdWIiOiIzMGIzZGUzYzhmMTY0NzUzYjMwMTVjZjI1ZWQ4ZDJiZiIsImF1ZCI6IkFJQU0iLCJpYXQiOjE1NjI4MjE2MTcsIm5iZiI6MTU2MjgyMTYxNywiZXhwIjoxNTYzNDI2NDE3LCJqdGkiOiJmYWM5NDJjMi1iMWQ2LTQwMDctYmU0Ny1kZjU2MDBlNzY0ZTAiLCJzY29wZSI6IklBVCIsInRlbiI6ImludWNsZXVzIiwidGVuX2N0eCI6Im1haW4tdGVuYW50IiwiY2xpZW50X2NyZWRlbnRpYWxzX3Byb2ZpbGUiOlsiU0hBUkVEX1NFQ1JFVCJdLCJzY2hlbWFzIjpbInVybjpzaWVtZW5zOm1pbmRzcGhlcmU6djEiXX0.prDJMiZKt4CKUCKOaqo4rQ0TsQ7bLgKJcDPnVMsGmQKRuPv2kzmbdS25LkyY0M0giiqxa-WzzBpYt6DEZB_3vF9ui1rSKYxa6obsuvyNLyDyZBpdVAeJ_jkm2ppZi8Ajkf428U5d6wFNbWMcF-cS0YimqcTOmVQMTa3Iln4hsJbzdkhtn7AkSGaP4Zr3uMshjnWaddhixZM2cJe_lP-FvOzrLNUSNM9A9YRmR0kmBUO5DThVZ0elM43XokLPpfvVnki-ZRBneOtraAmvmNSStC3knGEIptDXrveB04l76dOPwPPCgqxQtx07ZqZGu0F9OfNo3gKLZnEZQwbuJubAOQ",
    clientCredentialProfile: ["SHARED_SECRET"],
    clientId: "30b3de3c8f164753b3015cf25ed8d2bf",
    tenant: "inucleus"
  },
  expiration: "2019-07-18T05:06:57.000Z"
};

let payload = {
  dirPath: "_projTest/msAgent",
  boardingKey
};

let exec = async () => {
  await msAgent.init(payload);

  await msAgent.addVariable(1, "dp1", "1562821701369");
  await msAgent.addVariable(1, "dp2", "1562821687615");
  await msAgent.addVariable(1, "dp3", "1562821666314");

  await msAgent.initSendingMechanism();

  setInterval(() => {
    let dataToSend = {
      dp1: Date.now() / 1000,
      dp2: Date.now() / 2000,
      dp3: Date.now() / 3000
    };
    msAgent.refresh(Sampler.convertDateToTickNumber(Date.now()), dataToSend);
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
