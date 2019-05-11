const AverageElement = require("../../../classes/calculationElement/AverageElement");

describe("AverageElement", () => {
  describe("calculateMaxTickId", () => {
    let tickId;
    let calculationInterval;

    beforeEach(() => {
      tickId = 123;
      calculationInterval = 10;
    });

    let exec = () => {
      return AverageElement.calculateMaxTickId(tickId, calculationInterval);
    };

    it("should return 130 if 123 is given", () => {
      let result = exec();

      expect(result).toEqual(130);
    });

    it("should return 140 if 130 is given", () => {
      tickId = 130;
      let result = exec();

      expect(result).toEqual(140);
    });

    it("should return the same number if calc interval is 0", () => {
      calculationInterval = 0;
      let result = exec();

      expect(result).toEqual(123);
    });

    it("should return the same number incremented by one if calc interval is 1", () => {
      calculationInterval = 1;
      let result = exec();

      expect(result).toEqual(124);
    });
  });
  describe("calculateMinTickId", () => {
    let tickId;
    let calculationInterval;

    beforeEach(() => {
      tickId = 123;
      calculationInterval = 10;
    });

    let exec = () => {
      return AverageElement.calculateMinTickId(tickId, calculationInterval);
    };

    it("should return maximum tick id for given calculation interval and tick id", () => {
      let result = exec();

      expect(result).toEqual(120);
    });

    it("should return 120 if 120 is given", () => {
      tickId = 120;
      let result = exec();

      expect(result).toEqual(120);
    });

    it("should return the same number if calc interval is 0", () => {
      calculationInterval = 0;
      let result = exec();

      expect(result).toEqual(123);
    });

    it("should return the same number if calc interval is 1", () => {
      calculationInterval = 0;
      let result = exec();

      expect(result).toEqual(123);
    });
  });
});
