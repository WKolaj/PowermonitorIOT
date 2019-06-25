const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const isSuperAdmin = require("../middleware/authSuperAdmin");
const isDataAdmin = require("../middleware/authDataAdmin");
const canVisualizeData = require("../middleware/authCanVisualize");
const canOperateData = require("../middleware/authCanOperate");
const Project = require("../classes/project/Project");
const User = require("../classes/user/User");
const _ = require("lodash");
const validate = require("../middleware/validation/user");

router.get("/", [auth, isSuperAdmin], async (req, res) => {
  let allUsers = Object.values(Project.CurrentProject.Users).map(user =>
    _.pick(user.Payload, ["login", "permissions", "lang"])
  );

  return res.status(200).send(allUsers);
});

router.post("/", [auth, isSuperAdmin, validate.create], async (req, res) => {
  //Editing user and returning it
  let result = await Project.CurrentProject.createUser(req.body);

  return res
    .status(200)
    .send(_.pick(result.Payload, ["login", "permissions", "lang"]));
});

router.get("/me", [auth], async (req, res) => {
  let user = Project.CurrentProject.Users[req.user.login];
  if (!user) return res.status("400").send("There is no user of given login");

  return res
    .status(200)
    .send(_.pick(user.Payload, ["login", "permissions", "lang"]));
});

router.put("/me", [auth, validate.edit], async (req, res) => {
  //Checking if user exists
  let user = Project.CurrentProject.Users[req.user.login];
  if (!user)
    return res.status(400).send("Invalid request - user does not exist");

  //Only super admin can edit permissions - throwing if permissions are set and user is not super admin
  if (req.body.permissions)
    return res
      .status(403)
      .send(
        "Access forbidden - cannot edit permissions and it should not be defined in payload"
      );

  //Editing user and returning it
  let result = await Project.CurrentProject.editUser(user.Login, req.body);

  return res
    .status(200)
    .send(_.pick(result.Payload, ["login", "permissions", "lang"]));
});

router.delete("/:login", [auth, isSuperAdmin], async (req, res) => {
  let userLogin = req.params.login;

  if (!Project.CurrentProject.Users[userLogin])
    return res.status(404).send("User of given login does not exist");

  //Editing user and returning it
  let result = await Project.CurrentProject.deleteUser(userLogin);

  return res
    .status(200)
    .send(_.pick(result.Payload, ["login", "permissions", "lang"]));
});

router.get("/:login", [auth, isSuperAdmin], async (req, res) => {
  let userLogin = req.params.login;

  if (!Project.CurrentProject.Users[userLogin])
    return res.status(404).send("User of given login does not exist");

  //Editing user and returning it
  let result = await Project.CurrentProject.getUser(userLogin);

  return res
    .status(200)
    .send(_.pick(result.Payload, ["login", "permissions", "lang"]));
});

router.put("/:login", [auth, isSuperAdmin, validate.edit], async (req, res) => {
  //Checking if user exists
  let userLogin = req.params.login;

  //Checking if user exists
  if (!Project.CurrentProject.Users[userLogin])
    return res.status(404).send("User of given login does not exist");

  if (req.body.password) {
    return res
      .send(400)
      .send("Access forbidden - password of other users cannot be changed");
  }

  if (!Project.CurrentProject.Users[userLogin])
    return res.status(404).send("User of given login does not exist");

  //Editing user and returning it
  let result = await Project.CurrentProject.editUser(userLogin, req.body);

  return res
    .status(200)
    .send(_.pick(result.Payload, ["login", "permissions", "lang"]));
});

module.exports = router;
