//Method for checking if object is empty
module.exports.isObjectEmpty = function(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};
