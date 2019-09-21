let { exists } = require("../../utilities/utilities");

class NumberToStringConverter {
  constructor() {
    this._elements = {};
  }

  get Elements() {
    return this._elements;
  }

  setElements(elements) {
    let allElements = Object.values(elements);

    for (let element of allElements) {
      this._checkElementConfig(element);
    }

    this._elements = elements;
  }

  setElementConfig(id, elementConfig) {
    if (!exists(id)) throw new Error("Id cannot be empty");

    this._checkElementConfig(elementConfig);

    this.Elements[id] = elementConfig;
  }

  removeElementConfig(id) {
    if (this.Elements[id]) delete this.Elements[id];
  }

  _checkElementConfig(elementConfig) {
    if (!exists(elementConfig))
      throw new Error("Element config cannot be empty");
    if (!exists(elementConfig.format))
      throw new Error("Element config format cannot be empty");
    if (!exists(elementConfig.length))
      throw new Error("Element config length cannot be empty");
    if (
      elementConfig.format !== "fixed" &&
      elementConfig.format !== "precision"
    )
      throw new Error(
        `Element config format cannot have value ${elementConfig.format}`
      );

    if (isNaN(elementConfig.length))
      throw new Error("Element config length has to be a valid number");

    if (elementConfig.format === "fixed") {
      if (elementConfig.length < 0) {
        throw new Error(
          "Element config length has to be greater or equal to 0"
        );
      }
    }

    if (elementConfig.format === "precision") {
      if (elementConfig.length <= 0) {
        throw new Error("Element config length has to be greater than 0");
      }
    }
  }

  _toStringWithPrecision(number, precisionLength) {
    if (precisionLength <= 0)
      throw new Error("precisionLength has to be greater than 0!");

    if (isNaN(number)) return number.toString();

    //Number to precision
    let precisionedStringNumber = number.toPrecision(precisionLength);

    //Converting string to number
    let roundedNumber = Number(precisionedStringNumber);

    //Converting number to String
    return roundedNumber.toString();
  }

  _toStringWithFixed(number, fixedLength) {
    if (fixedLength < 0)
      throw new Error("fixedLength cannot be smaller than 0!");

    if (isNaN(number)) return number.toString();

    //Number to fixed
    let fixedNumberString = number.toFixed(fixedLength);

    //Converting string to number
    let roundedNumber = Number(fixedNumberString);

    //Converting number to String
    return roundedNumber.toString();
  }

  convertNumber(id, number) {
    //Converting boolean to number if number is boolean
    if (typeof number === "boolean") {
      number = number ? 1 : 0;
    }

    let config = this.Elements[id];
    if (!exists(config)) return number.toString();

    if (config.format === "fixed")
      return this._toStringWithFixed(number, config.length);
    if (config.format === "precision")
      return this._toStringWithPrecision(number, config.length);

    return number.toString();
  }
}

module.exports = NumberToStringConverter;
