const Project = require("../classes/project/Project");
const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  let token = req.header(config.get("tokenHeader"));
  if (!token) return res.status(401).send("Access denied. No token provided");

  try {
    req.user = jwt.verify(token, Project.CurrentProject.PrivateKey);
    next();
  } catch (err) {
    return res.status(400).send("Invalid token provided");
  }
};
