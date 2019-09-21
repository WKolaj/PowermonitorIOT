const NumberToStringConverter = require("../../../classes/numberToStringConverter/NumberToStringConverter");

describe("NumberToStringConverter", () => {
  describe("constructor", () => {
    let exec = () => {
      return new NumberToStringConverter();
    };

    it("should return new numberToStringConverter", () => {
      let result = exec();

      expect(result).toBeDefined();
    });

    it("should set elements to empty object", () => {
      let result = exec();

      expect(result.Elements).toEqual({});
    });
  });

  describe("setElements", () => {
    let numberToStringConverter;
    let elements;

    beforeEach(() => {
      elements = {
        "12345": {
          format: "fixed",
          length: 1
        },
        "12346": {
          format: "precision",
          length: 2
        },
        "12347": {
          format: "fixed",
          length: 3
        },
        "12348": {
          format: "precision",
          length: 4
        }
      };
    });

    let exec = () => {
      numberToStringConverter = new NumberToStringConverter();
      numberToStringConverter.setElements(elements);
    };

    it("should set new elements to conveter", () => {
      exec();

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(elements);
    });

    it("should set new elements to conveter if elements are empty", () => {
      elements = {};

      exec();

      expect(numberToStringConverter.Elements).toEqual({});
    });

    it("should not set new elements to conveter and throw if one of elements config is empty", () => {
      elements["12346"] = {};

      expect(() => {
        exec();
      }).toThrow();

      expect(numberToStringConverter.Elements).toEqual({});
    });

    it("should not set new elements to conveter and throw if one of elements does not have length defined", () => {
      elements["12346"].length = undefined;

      expect(() => {
        exec();
      }).toThrow();

      expect(numberToStringConverter.Elements).toEqual({});
    });

    it("should not set new elements to conveter and throw if one of elements does not have format defined", () => {
      elements["12346"].format = undefined;

      expect(() => {
        exec();
      }).toThrow();

      expect(numberToStringConverter.Elements).toEqual({});
    });

    it("should not set new elements to conveter and throw if one of elements have invalid format", () => {
      elements["12346"].format = "fakeFormat";

      expect(() => {
        exec();
      }).toThrow();

      expect(numberToStringConverter.Elements).toEqual({});
    });

    it("should not set new elements to conveter and throw if one of elements have length less than 0 and format is fixed", () => {
      elements["12346"].format = "fixed";
      elements["12346"].length = -1;

      expect(() => {
        exec();
      }).toThrow();

      expect(numberToStringConverter.Elements).toEqual({});
    });

    it("should not set new elements to conveter and throw if one of elements have length less than 0 and format is precision", () => {
      elements["12346"].format = "precision";
      elements["12346"].length = -1;

      expect(() => {
        exec();
      }).toThrow();

      expect(numberToStringConverter.Elements).toEqual({});
    });

    it("should not set new elements to conveter and throw if one of elements have length 0 and format is precision", () => {
      elements["12346"].format = "precision";
      elements["12346"].length = 0;

      expect(() => {
        exec();
      }).toThrow();

      expect(numberToStringConverter.Elements).toEqual({});
    });

    it("should set new elements to conveter and not throw if one of elements have length 0 and format is fixed", () => {
      elements["12346"].format = "fixed";
      elements["12346"].length = 0;

      expect(() => {
        exec();
      }).not.toThrow();

      expect(numberToStringConverter.Elements).toEqual(elements);
    });
  });

  describe("addElement", () => {
    let numberToStringConverter;
    let elements;
    let elementId;
    let elementConfig;

    beforeEach(() => {
      elements = {
        "12345": {
          format: "fixed",
          length: 1
        },
        "12346": {
          format: "precision",
          length: 2
        },
        "12347": {
          format: "fixed",
          length: 3
        },
        "12348": {
          format: "precision",
          length: 4
        }
      };

      elementId = "12349";
      elementConfig = {
        format: "fixed",
        length: 5
      };
    });

    let exec = () => {
      numberToStringConverter = new NumberToStringConverter();
      numberToStringConverter.setElements(elements);
      numberToStringConverter.setElementConfig(elementId, elementConfig);
    };

    it("should set new config in elements", () => {
      exec();

      let expectedElements = {
        ...elements,
        [elementId]: elementConfig
      };

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });

    it("should override existing config in elements if id exists in elements", () => {
      elementId = "12348";
      exec();

      let expectedElements = {
        ...elements,
        [elementId]: elementConfig
      };

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });

    it("should not set new config in elements and throw if id is not defined", () => {
      elementId = undefined;

      expect(() => {
        exec();
      }).toThrow();

      let expectedElements = {
        ...elements
      };

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });

    it("should not set new config in elements and throw if element format is not defined", () => {
      elementConfig.format = undefined;

      expect(() => {
        exec();
      }).toThrow();

      let expectedElements = {
        ...elements
      };

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });

    it("should not set new config in elements and throw if element length is not defined", () => {
      elementConfig.length = undefined;

      expect(() => {
        exec();
      }).toThrow();

      let expectedElements = {
        ...elements
      };

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });

    it("should not set new config in elements and throw if element format is not valid", () => {
      elementConfig.format = "fakeFormat";

      expect(() => {
        exec();
      }).toThrow();

      let expectedElements = {
        ...elements
      };

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });

    it("should not set new config in elements and throw if element length is less than 0 and format is fixed", () => {
      elementConfig.format = "fixed";
      elementConfig.length = -1;

      expect(() => {
        exec();
      }).toThrow();

      let expectedElements = {
        ...elements
      };

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });

    it("should not set new config in elements and throw if element length is less than 0 and format is precision", () => {
      elementConfig.format = "precision";
      elementConfig.length = -1;

      expect(() => {
        exec();
      }).toThrow();

      let expectedElements = {
        ...elements
      };

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });

    it("should not set new config in elements and throw if element length is  0 and format is precision", () => {
      elementConfig.format = "precision";
      elementConfig.length = 0;

      expect(() => {
        exec();
      }).toThrow();

      let expectedElements = {
        ...elements
      };

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });

    it("should set new config in elements and not throw if element length is 0 and format is fixed", () => {
      elementConfig.format = "fixed";
      elementConfig.length = 0;

      expect(() => {
        exec();
      }).not.toThrow();

      let expectedElements = {
        ...elements,
        [elementId]: elementConfig
      };

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });
  });

  describe("removeElement", () => {
    let numberToStringConverter;
    let elements;
    let elementId;

    beforeEach(() => {
      elements = {
        "12345": {
          format: "fixed",
          length: 1
        },
        "12346": {
          format: "precision",
          length: 2
        },
        "12347": {
          format: "fixed",
          length: 3
        },
        "12348": {
          format: "precision",
          length: 4
        }
      };

      elementId = "12347";
    });

    let exec = () => {
      numberToStringConverter = new NumberToStringConverter();
      numberToStringConverter.setElements(elements);
      numberToStringConverter.removeElementConfig(elementId);
    };

    it("should remove config from elements of given id - if element exists", () => {
      exec();

      let expectedElements = {
        ...elements
      };

      delete expectedElements[elementId];

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });

    it("should not throw and not remove config from elements of given id - if element doest not exists", () => {
      elementId = "fakeId";
      exec();

      let expectedElements = {
        ...elements
      };

      expect(numberToStringConverter.Elements).toBeDefined();
      expect(numberToStringConverter.Elements).toEqual(expectedElements);
    });
  });

  describe("convertNumber", () => {
    let numberToStringConverter;
    let elements;
    let elementId;
    let number;

    beforeEach(() => {
      elements = {
        "12345": {
          format: "fixed",
          length: 1
        },
        "12346": {
          format: "precision",
          length: 2
        },
        "12347": {
          format: "fixed",
          length: 3
        },
        "12348": {
          format: "precision",
          length: 4
        }
      };

      elementId = "12345";
      number = 1234.4321;
    });

    let exec = () => {
      numberToStringConverter = new NumberToStringConverter();
      numberToStringConverter.setElements(elements);
      return numberToStringConverter.convertNumber(elementId, number);
    };

    it("should convert value to fixed length=1 string if id exists in config and it is fixed, length = 1", () => {
      let result = exec();

      expect(result).toEqual("1234.4");
    });

    it("should convert value to fixed length=0 string if id exists in config and it is fixed, length = 1", () => {
      elements[elementId].length = 0;

      let result = exec();

      expect(result).toEqual("1234");
    });

    it("should convert value to precision length=2 string if id exists in config and it is fixed, length = 2", () => {
      elements[elementId].format = "precision";
      elements[elementId].length = 2;

      let result = exec();

      expect(result).toEqual("1200");
    });

    it("should remove uneccessary 0s after . if format is fixed", () => {
      elements[elementId].format = "fixed";
      elements[elementId].length = 6;

      let result = exec();

      expect(result).toEqual("1234.4321");
    });

    it("should remove uneccessary 0s after . if format is precision", () => {
      elements[elementId].format = "fixed";
      elements[elementId].length = 12;

      let result = exec();

      expect(result).toEqual("1234.4321");
    });

    it("should just convert value to string if id does not exist", () => {
      elementId = "fakeId";

      let result = exec();

      expect(result).toEqual("1234.4321");
    });

    it("should leave value as integer if value is integer", () => {
      number = 12345678;

      let result = exec();

      expect(result).toEqual("12345678");
    });

    it("should convert value to 0 if it is false", () => {
      number = false;

      let result = exec();

      expect(result).toEqual("0");
    });

    it("should convert value to 1 if it is true", () => {
      number = true;

      let result = exec();

      expect(result).toEqual("1");
    });

    it("should return NaN string if value is NaN and format is precision", () => {
      elements[elementId].format = "precision";
      number = NaN;

      let result = exec();

      expect(result).toEqual(NaN.toString());
    });

    it("should return NaN string if value is NaN and format is fixed", () => {
      elements[elementId].format = "fixed";
      number = NaN;

      let result = exec();

      expect(result).toEqual(NaN.toString());
    });

    it("should return Infinitiy string if value is Infinity and format is precision", () => {
      elements[elementId].format = "precision";
      number = Infinity;

      let result = exec();

      expect(result).toEqual(Infinity.toString());
    });

    it("should return Infinitiy string if value is Infinity and format is fixed", () => {
      elements[elementId].format = "fixed";
      number = Infinity;

      let result = exec();

      expect(result).toEqual(Infinity.toString());
    });
  });
});
