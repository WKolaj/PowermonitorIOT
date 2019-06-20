const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const isSuperAdmin = require("../middleware/authSuperAdmin");
const isDataAdmin = require("../middleware/authDataAdmin");
const canVisualizeData = require("../middleware/authCanVisualize");
const canOperateData = require("../middleware/authCanOperate");
const config = require("config");
const Project = require("../classes/project/Project");
const _ = require("lodash");
const { getIpAdress, changeIpAdress } = require("../utilities/utilities");
const validate = require("../middleware/validation/ipConfig");

router.use(express.json());

router.get("/", [auth, isSuperAdmin], async (req, res) => {
  let ipAdressObject = await getIpAdress();
  return res.status(200).send(ipAdressObject);
});

router.put("/", [auth, isSuperAdmin, validate.edit], async (req, res) => {
  await changeIpAdress(
    req.body.static,
    req.body.ipAdress,
    req.body.subnet,
    req.body.gateway,
    req.body.dns
  );
  return res.status(200).send();
});

module.exports = router;
