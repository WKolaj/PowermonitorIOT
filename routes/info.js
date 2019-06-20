const express = require("express");
const router = express.Router();
const config = require("config");
const auth = require("../middleware/auth");
const isSuperAdmin = require("../middleware/authSuperAdmin");
const isDataAdmin = require("../middleware/authDataAdmin");
const canVisualizeData = require("../middleware/authCanVisualize");
const canOperateData = require("../middleware/authCanOperate");
const Project = require("../classes/project/Project");
const _ = require("lodash");
const {
  getCPUInfo,
  getRAMInfo,
  getMemoryInfo
} = require("../utilities/utilities");

router.use(express.json());

router.get("/", [auth, canVisualizeData], async (req, res) => {
  let payloadToReturn = {};

  let cpuInfo = await getCPUInfo();
  let ramInfo = await getRAMInfo();
  let memoryInfo = await getMemoryInfo();
  if (cpuInfo !== undefined) payloadToReturn.CPU = cpuInfo;
  if (ramInfo !== undefined) payloadToReturn.RAM = ramInfo;
  if (memoryInfo !== undefined) payloadToReturn.MEM = memoryInfo;

  return res.status(200).send(payloadToReturn);
});

module.exports = router;
