const Project = require("./classes/project/Project");
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

let payload = {
  id: "5d2846fdeff8722f4b96c4f0",
  name: "myAgent",
  calculationElements: [],
  variables: [
    {
      id: "5d2846fdeff8722f4b96c4f1",
      name: "PAC4200 - voltage L1-N",
      sampleTime: 1,
      archived: false,
      unit: "",
      archiveSampleTime: 1,
      type: "sdVariable",
      elementDeviceId: "5d283cb95d1680263b003587",
      elementId: "5d283cb95d1680263b00354c",
      value: 0
    },
    {
      id: "5d2846fdeff8722f4b96c4f2",
      name: "PAC4200 - current L1-N",
      sampleTime: 1,
      archived: false,
      unit: "",
      archiveSampleTime: 1,
      type: "sdVariable",
      elementDeviceId: "5d283cb95d1680263b003587",
      elementId: "5d283cb95d1680263b003552",
      value: 1
    },
    {
      id: "5d2846fdeff8722f4b96c4f3",
      name: "PAC4200 - active power L1-N",
      sampleTime: 1,
      archived: false,
      unit: "",
      archiveSampleTime: 1,
      type: "sdVariable",
      elementDeviceId: "5d283cb95d1680263b003587",
      elementId: "5d283cb95d1680263b003558",
      value: 1
    }
  ],
  type: "msAgent",
  dataAgent: {
    dirPath:
      "/home/wk/Documents/Projects/PowermonitorIOT/project/dataAgents/5d2846fdeff8722f4b96c4f0",
    sampleTimeGroups: [
      {
        sampleTime: 1,
        variableIds: [
          "5d2846fdeff8722f4b96c4f1",
          "5d2846fdeff8722f4b96c4f2",
          "5d2846fdeff8722f4b96c4f3"
        ]
      }
    ],
    bufferSize: 100,
    sendDataLimit: 20,
    readyToSend: true,
    boardingKey: {
      content: {
        baseUrl: "https://southgate.eu1.mindsphere.io",
        iat:
          "eyJraWQiOiJrZXktaWQtMSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJTQ0kiLCJzdWIiOiIzMGIzZGUzYzhmMTY0NzUzYjMwMTVjZjI1ZWQ4ZDJiZiIsImF1ZCI6IkFJQU0iLCJpYXQiOjE1NjI4MjE2MTcsIm5iZiI6MTU2MjgyMTYxNywiZXhwIjoxNTYzNDI2NDE3LCJqdGkiOiJmYWM5NDJjMi1iMWQ2LTQwMDctYmU0Ny1kZjU2MDBlNzY0ZTAiLCJzY29wZSI6IklBVCIsInRlbiI6ImludWNsZXVzIiwidGVuX2N0eCI6Im1haW4tdGVuYW50IiwiY2xpZW50X2NyZWRlbnRpYWxzX3Byb2ZpbGUiOlsiU0hBUkVEX1NFQ1JFVCJdLCJzY2hlbWFzIjpbInVybjpzaWVtZW5zOm1pbmRzcGhlcmU6djEiXX0.prDJMiZKt4CKUCKOaqo4rQ0TsQ7bLgKJcDPnVMsGmQKRuPv2kzmbdS25LkyY0M0giiqxa-WzzBpYt6DEZB_3vF9ui1rSKYxa6obsuvyNLyDyZBpdVAeJ_jkm2ppZi8Ajkf428U5d6wFNbWMcF-cS0YimqcTOmVQMTa3Iln4hsJbzdkhtn7AkSGaP4Zr3uMshjnWaddhixZM2cJe_lP-FvOzrLNUSNM9A9YRmR0kmBUO5DThVZ0elM43XokLPpfvVnki-ZRBneOtraAmvmNSStC3knGEIptDXrveB04l76dOPwPPCgqxQtx07ZqZGu0F9OfNo3gKLZnEZQwbuJubAOQ",
        clientCredentialProfile: ["SHARED_SECRET"],
        clientId: "30b3de3c8f164753b3015cf25ed8d2bf",
        tenant: "inucleus"
      },
      expiration: "2019-07-18T05:06:57.000Z"
    },
    variableNames: {
      "5d2846fdeff8722f4b96c4f1": "1562821701369",
      "5d2846fdeff8722f4b96c4f2": "1562821687615",
      "5d2846fdeff8722f4b96c4f3": "1562821666314"
    }
  }
};

let exec = async () => {
  const server = await require("./server");

  let result = await Project.CurrentProject.createDevice(payload);
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
