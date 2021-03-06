const express = require("express");
const router = express.Router();
const config = require("config");
const Project = require("../classes/project/Project");
const _ = require("lodash");

router.post("/", async (req, res) => {
  if (!req.body) return res.status(400).send("Invalid request");
  if (!req.body.login)
    return res.status(400).send("Invalid request - login cannot be empty");
  if (!req.body.password)
    return res.status(400).send("Invalid request - password cannot be empty");

  let user = Project.CurrentProject.Users[req.body.login];
  if (!user) return res.status(400).send("Invalid login or password");

  if (!(await user.passwordMatches(req.body.password)))
    return res.status(400).send("Invalid login or password");

  let jwt = await user.generateToken();
  return res
    .status(200)
    .set(config.get("tokenHeader"), jwt)
    .send(_.pick(user.Payload, ["login", "permissions", "lang"]));
});

module.exports = router;
