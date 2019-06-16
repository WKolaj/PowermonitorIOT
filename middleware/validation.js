/**
 * @description Method for generating middleware method for validation object based on validationFunc given as an argument
 */
module.exports = function(validationFunc) {
  return async function(req, res, next) {
    if (!req.body)
      return res.status(400).send("Invalid request - body cannot be empty");

    //validationFunc should not throw, but return undefined if everything is ok, or message of error if validation error occurs
    let errorMessage = await validationFunc(req);

    if (errorMessage) {
      return res.status(400).send(errorMessage);
    }

    next();
  };
};
