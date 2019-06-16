const User = require("../classes/user/User");

module.exports = function(req, res, next) {
  if (!User.canVisualizeData(req.user.permissions)) {
    return res.status(403).send("Access forbidden.");
  }

  next();
};
