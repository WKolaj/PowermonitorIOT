const EventContentManager = require("../../../classes/device/SpecialDevices/EventContentManager/EventContentManager");
const config = require("config");
const path = require("path");

let eventBufferDirectory = "_projTest";
let eventBufferFile = "testFile.json";
let {
  clearDirectoryAsync,
  createFileAsync,
  checkIfFileExistsAsync,
  readAllDataFromTable,
  readFileAsync,
  writeFileAsync,
  exists,
  existsAndIsNotEmpty,
  snooze
} = require("../../../utilities/utilities");

describe("EventContentManager", () => {
  let eventBufferFilePath;
  beforeEach(async () => {
    await clearDirectoryAsync(eventBufferDirectory);
    eventBufferFilePath = path.join(eventBufferDirectory, eventBufferFile);
  });

  afterEach(async () => {
    await clearDirectoryAsync(eventBufferDirectory);
  });

  describe("constructor", () => {
    let exec = async () => {
      return new EventContentManager();
    };

    it("should create new event content manager", async () => {
      let result = await exec();

      expect(result).toBeDefined();
    });

    it("should set FilePath to null", async () => {
      let result = await exec();

      expect(result.FilePath).toBeNull();
    });

    it("should set Content to {}", async () => {
      let result = await exec();

      expect(result.Content).toEqual({});
    });

    it("should set lastEventId to 0", async () => {
      let result = await exec();

      expect(result.LastEventId).toEqual(0);
    });

    it("should set busy to false", async () => {
      let result = await exec();

      expect(result.Busy).toEqual(false);
    });

    it("should set initialized to false", async () => {
      let result = await exec();

      expect(result.Initialized).toEqual(false);
    });

    it("should set bufferSize to 10", async () => {
      let result = await exec();

      expect(result.BufferSize).toEqual(10);
    });
  });

  describe("init", () => {
    let contentManager;
    let bufferSize;

    beforeEach(() => {
      bufferSize = 3;
    });

    let exec = async () => {
      contentManager = new EventContentManager();

      return contentManager.init(eventBufferFilePath, bufferSize);
    };

    it("should set Content to {} if content file does not exist", async () => {
      await exec();

      expect(contentManager.Content).toEqual({});
    });

    it("should set Content according to file if it exists", async () => {
      let fileContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, value: 10003 }
      };

      await writeFileAsync(eventBufferFilePath, JSON.stringify(fileContent));

      await exec();

      expect(contentManager.Content).toEqual(fileContent);
    });

    it("should set Content to {} if is empty", async () => {
      await writeFileAsync(eventBufferFilePath, "");

      await exec();

      expect(contentManager.Content).toEqual({});
    });

    it("should set Content according to file if it exists - even if file content is shorter than buffer size", async () => {
      bufferSize = 5;

      let fileContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, value: 10003 }
      };

      await writeFileAsync(eventBufferFilePath, JSON.stringify(fileContent));

      await exec();

      expect(contentManager.Content).toEqual(fileContent);
    });

    it("should set Content according to file if it exists - even if file content is longer than buffer size - cut appriopriate number of events", async () => {
      bufferSize = 3;

      let fileContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12347, eventId: 3, value: 10004 },
        "4": { tickId: 12347, eventId: 4, value: 10005 }
      };

      await writeFileAsync(eventBufferFilePath, JSON.stringify(fileContent));

      await exec();

      let expectedContent = {
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12347, eventId: 3, value: 10004 },
        "4": { tickId: 12347, eventId: 4, value: 10005 }
      };

      expect(contentManager.Content).toEqual(expectedContent);
    });

    it("should set initialized to true after initialization", async () => {
      await exec();

      expect(contentManager.Initialized).toEqual(true);
    });

    it("should set busy to false after initialization - if there is a file", async () => {
      let fileContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 }
      };

      await writeFileAsync(eventBufferFilePath, JSON.stringify(fileContent));

      await exec();

      expect(contentManager.Busy).toEqual(false);
    });

    it("should set busy to false after initialization - if there is a empty file", async () => {
      await writeFileAsync(eventBufferFilePath, "");

      await exec();

      expect(contentManager.Busy).toEqual(false);
    });

    it("should set busy to false after initialization - if there is no file", async () => {
      await exec();

      expect(contentManager.Busy).toEqual(false);
    });

    it("should set busy to false and initialized to false if reading file throws", async () => {
      await writeFileAsync(
        eventBufferFilePath,
        JSON.stringify("corrupted Payload")
      );

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(contentManager.Initialized).toEqual(false);
      expect(contentManager.Busy).toEqual(false);
    });

    it("should set eventLastTickId to 0 - if there is no file", async () => {
      await exec();

      expect(contentManager.LastEventId).toEqual(0);
    });

    it("should set eventLastTickId to max number - file exists", async () => {
      let fileContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 }
      };

      await writeFileAsync(eventBufferFilePath, JSON.stringify(fileContent));

      await exec();

      expect(contentManager.LastEventId).toEqual(2);
    });
  });

  describe("changeBufferSize", () => {
    let contentManager;
    let bufferSize;
    let initialEventContent;
    let newBufferSize;

    beforeEach(() => {
      bufferSize = 3;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 }
      };
      newBufferSize = 5;
    });

    let exec = async () => {
      await writeFileAsync(
        eventBufferFilePath,
        JSON.stringify(initialEventContent)
      );

      contentManager = new EventContentManager();

      await contentManager.init(eventBufferFilePath, bufferSize);
      await contentManager.changeBufferSize(newBufferSize);
    };

    it("should set new buffer size if buffer size is larger ", async () => {
      await exec();

      expect(contentManager.BufferSize).toEqual(newBufferSize);
    });

    it("should set new buffer size if buffer size is smaller ", async () => {
      bufferSize = 5;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      };

      newBufferSize = 3;

      await exec();

      expect(contentManager.BufferSize).toEqual(newBufferSize);
    });

    it("should not change buffer content ", async () => {
      await exec();

      expect(contentManager.Content).toEqual(initialEventContent);
    });

    it("should cut buffer content if new size is smaller than previous one", async () => {
      bufferSize = 5;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      };

      newBufferSize = 3;

      await exec();

      expect(contentManager.Content).toEqual({
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      });
    });

    it("should cut buffer content and save it to file if new size is smaller than previous one", async () => {
      bufferSize = 5;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      };

      newBufferSize = 3;

      await exec();

      let fileContent = JSON.parse(await readFileAsync(eventBufferFilePath));

      expect(fileContent).toEqual({
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      });
    });

    it("should set busy to false after cutting", async () => {
      bufferSize = 5;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      };

      newBufferSize = 3;

      await exec();

      expect(contentManager.Busy).toEqual(false);
    });
  });

  describe("refreshEvents", () => {
    let contentManager;
    let bufferSize;
    let initialEventContent;
    let newContent;
    let newBufferSize;

    beforeEach(() => {
      bufferSize = 3;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 }
      };
      newBufferSize = 5;
      newContent = [
        { tickId: 12349, value: 10005 },
        { tickId: 12348, value: 10004 },
        { tickId: 12347, value: 10003 }
      ];
    });

    let exec = async () => {
      await writeFileAsync(
        eventBufferFilePath,
        JSON.stringify(initialEventContent)
      );

      contentManager = new EventContentManager();

      await contentManager.init(eventBufferFilePath, bufferSize);
      return contentManager.refreshEvents(newContent);
    };

    it("should set content according to new content - if two values are different", async () => {
      await exec();

      let expectedContent = {
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      };

      expect(contentManager.Content).toEqual(expectedContent);
    });

    it("should set content file according to new content - if two values are different", async () => {
      await exec();

      let fileContent = JSON.parse(await readFileAsync(eventBufferFilePath));

      let expectedContent = {
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "4": { tickId: 12349, eventId: 4, value: 10005 }
      };

      expect(fileContent).toEqual(expectedContent);
    });

    it("should return new added events - if two values are different", async () => {
      let result = await exec();

      let expectedResult = [
        { tickId: 12348, eventId: 3, value: 10004 },
        { tickId: 12349, eventId: 4, value: 10005 }
      ];

      expect(result).toEqual(expectedResult);
    });

    it("should set content according to new content - if all values are different", async () => {
      newContent = [
        { tickId: 12350, value: 10006 },
        { tickId: 12349, value: 10005 },
        { tickId: 12348, value: 10004 }
      ];

      await exec();

      let expectedContent = {
        "5": { tickId: 12350, eventId: 5, value: 10006 },
        "4": { tickId: 12349, eventId: 4, value: 10005 },
        "3": { tickId: 12348, eventId: 3, value: 10004 }
      };

      expect(contentManager.Content).toEqual(expectedContent);
    });

    it("should set content file according to new content - if all values are different", async () => {
      newContent = [
        { tickId: 12350, value: 10006 },
        { tickId: 12349, value: 10005 },
        { tickId: 12348, value: 10004 }
      ];

      await exec();

      let fileContent = JSON.parse(await readFileAsync(eventBufferFilePath));

      let expectedContent = {
        "5": { tickId: 12350, eventId: 5, value: 10006 },
        "4": { tickId: 12349, eventId: 4, value: 10005 },
        "3": { tickId: 12348, eventId: 3, value: 10004 }
      };

      expect(fileContent).toEqual(expectedContent);
    });

    it("should return new added events - if all values are different", async () => {
      newContent = [
        { tickId: 12350, value: 10006 },
        { tickId: 12349, value: 10005 },
        { tickId: 12348, value: 10004 }
      ];

      let result = await exec();

      let expectedResult = [
        { tickId: 12348, eventId: 3, value: 10004 },
        { tickId: 12349, eventId: 4, value: 10005 },
        { tickId: 12350, eventId: 5, value: 10006 }
      ];

      expect(result).toEqual(expectedResult);
    });

    it("should set content according to new content - if one value is different", async () => {
      newContent = [
        { tickId: 12348, value: 10004 },
        { tickId: 12347, value: 10003 },
        { tickId: 12346, value: 10002 }
      ];

      await exec();

      let expectedContent = {
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "1": { tickId: 12346, eventId: 1, value: 10002 }
      };

      expect(contentManager.Content).toEqual(expectedContent);
    });

    it("should set content file according to new content - if one value is different", async () => {
      newContent = [
        { tickId: 12348, value: 10004 },
        { tickId: 12347, value: 10003 },
        { tickId: 12346, value: 10002 }
      ];

      await exec();

      let fileContent = JSON.parse(await readFileAsync(eventBufferFilePath));

      let expectedContent = {
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "1": { tickId: 12346, eventId: 1, value: 10002 }
      };

      expect(fileContent).toEqual(expectedContent);
    });

    it("should return new added events - if one value is are different", async () => {
      newContent = [
        { tickId: 12348, value: 10004 },
        { tickId: 12347, value: 10003 },
        { tickId: 12346, value: 10002 }
      ];
      let result = await exec();

      let expectedResult = [{ tickId: 12348, eventId: 3, value: 10004 }];

      expect(result).toEqual(expectedResult);
    });

    it("should not set anything if newContent is the same as old content", async () => {
      newContent = [
        { tickId: 12347, value: 10003 },
        { tickId: 12346, value: 10002 },
        { tickId: 12345, value: 10001 }
      ];

      await exec();

      let expectedContent = {
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "0": { tickId: 12345, eventId: 0, value: 10001 }
      };

      expect(contentManager.Content).toEqual(expectedContent);
    });

    it("should not set anything if newContent is the same as old content", async () => {
      newContent = [
        { tickId: 12347, value: 10003 },
        { tickId: 12346, value: 10002 },
        { tickId: 12345, value: 10001 }
      ];

      await exec();

      let fileContent = JSON.parse(await readFileAsync(eventBufferFilePath));

      let expectedContent = {
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "0": { tickId: 12345, eventId: 0, value: 10001 }
      };

      expect(fileContent).toEqual(expectedContent);
    });

    it("should return empty array if newContent is the same as old content", async () => {
      newContent = [
        { tickId: 12347, value: 10003 },
        { tickId: 12346, value: 10002 },
        { tickId: 12345, value: 10001 }
      ];
      let result = await exec();

      let expectedResult = [];

      expect(result).toEqual(expectedResult);
    });

    it("should set content according to new content - if values have the same tickId but different values", async () => {
      newContent = [
        { tickId: 12347, value: 10004 },
        { tickId: 12346, value: 10002 },
        { tickId: 12345, value: 10001 }
      ];

      await exec();

      let expectedContent = {
        "3": { tickId: 12347, eventId: 3, value: 10004 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "1": { tickId: 12346, eventId: 1, value: 10002 }
      };

      expect(contentManager.Content).toEqual(expectedContent);
    });

    it("should set content file according to new content - if one value is different", async () => {
      newContent = [
        { tickId: 12347, value: 10004 },
        { tickId: 12346, value: 10002 },
        { tickId: 12345, value: 10001 }
      ];

      await exec();

      let fileContent = JSON.parse(await readFileAsync(eventBufferFilePath));

      let expectedContent = {
        "3": { tickId: 12347, eventId: 3, value: 10004 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "1": { tickId: 12346, eventId: 1, value: 10002 }
      };

      expect(fileContent).toEqual(expectedContent);
    });

    it("should return new added events - if one value is are different", async () => {
      newContent = [
        { tickId: 12347, value: 10004 },
        { tickId: 12346, value: 10002 },
        { tickId: 12345, value: 10001 }
      ];

      let result = await exec();

      let expectedResult = [{ tickId: 12347, eventId: 3, value: 10004 }];

      expect(result).toEqual(expectedResult);
    });

    it("should set busy to false after", async () => {
      await exec();

      expect(contentManager.Busy).toEqual(false);
    });

    it("should throw and does not set new content if new content has smaller length than buffer size", async () => {
      newContent = [
        { tickId: 12347, value: 10004 },
        { tickId: 12346, value: 10002 }
      ];

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(contentManager.Content).toEqual(initialEventContent);
      expect(contentManager.Busy).toEqual(false);
    });

    it("should throw and does not set new content if new content has greater length than buffer size", async () => {
      newContent = [
        { tickId: 12349, value: 10006 },
        { tickId: 12348, value: 10005 },
        { tickId: 12347, value: 10004 },
        { tickId: 12346, value: 10002 }
      ];

      await expect(
        new Promise(async (resolve, reject) => {
          try {
            await exec();
            return resolve(true);
          } catch (err) {
            return reject(err);
          }
        })
      ).rejects.toBeDefined();

      expect(contentManager.Content).toEqual(initialEventContent);
      expect(contentManager.Busy).toEqual(false);
    });

    it("should set content according to new content - if one value is different - if new content has greater length but equal to buffer size", async () => {
      newContent = [
        { tickId: 12349, value: 10005 },
        { tickId: 12348, value: 10004 },
        { tickId: 12347, value: 10003 },
        { tickId: 12346, value: 10002 }
      ];
      bufferSize = 4;
      await exec();

      let expectedContent = {
        "4": { tickId: 12349, eventId: 4, value: 10005 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "1": { tickId: 12346, eventId: 1, value: 10002 }
      };

      expect(contentManager.Content).toEqual(expectedContent);
    });

    it("should set content file according to new content -  if new content has greater length but equal to buffer size", async () => {
      newContent = [
        { tickId: 12349, value: 10005 },
        { tickId: 12348, value: 10004 },
        { tickId: 12347, value: 10003 },
        { tickId: 12346, value: 10002 }
      ];

      bufferSize = 4;
      await exec();

      let fileContent = JSON.parse(await readFileAsync(eventBufferFilePath));

      let expectedContent = {
        "4": { tickId: 12349, eventId: 4, value: 10005 },
        "3": { tickId: 12348, eventId: 3, value: 10004 },
        "2": { tickId: 12347, eventId: 2, value: 10003 },
        "1": { tickId: 12346, eventId: 1, value: 10002 }
      };

      expect(fileContent).toEqual(expectedContent);
    });

    it("should return new added events -  if new content has greater length but equal to buffer size", async () => {
      newContent = [
        { tickId: 12349, value: 10005 },
        { tickId: 12348, value: 10004 },
        { tickId: 12347, value: 10003 },
        { tickId: 12346, value: 10002 }
      ];
      bufferSize = 4;
      let result = await exec();

      let expectedResult = [
        { tickId: 12348, eventId: 3, value: 10004 },
        { tickId: 12349, eventId: 4, value: 10005 }
      ];

      expect(result).toEqual(expectedResult);
    });
  });

  describe("getLastEvent", () => {
    let contentManager;
    let bufferSize;
    let initialEventContent;
    let initNewContent;

    beforeEach(() => {
      bufferSize = 3;
      initNewContent = true;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 }
      };
    });

    let exec = async () => {
      if (initNewContent) {
        await writeFileAsync(
          eventBufferFilePath,
          JSON.stringify(initialEventContent)
        );

        contentManager = new EventContentManager();
      }

      await contentManager.init(eventBufferFilePath, bufferSize);
      return contentManager.getLastEvent();
    };

    it("should return last event tickId", async () => {
      let result = await exec();

      expect(result).toEqual(10003);
    });

    it("should return null if there is no data", async () => {
      initialEventContent = false;

      let result = await exec();

      expect(result).toEqual(null);
    });
  });

  describe("getLastEventTick", () => {
    let contentManager;
    let bufferSize;
    let initialEventContent;
    let initNewContent;

    beforeEach(() => {
      bufferSize = 3;
      initNewContent = true;
      initialEventContent = {
        "0": { tickId: 12345, eventId: 0, value: 10001 },
        "1": { tickId: 12346, eventId: 1, value: 10002 },
        "2": { tickId: 12347, eventId: 2, value: 10003 }
      };
    });

    let exec = async () => {
      if (initNewContent) {
        await writeFileAsync(
          eventBufferFilePath,
          JSON.stringify(initialEventContent)
        );

        contentManager = new EventContentManager();
      }

      await contentManager.init(eventBufferFilePath, bufferSize);
      return contentManager.getLastEventTick();
    };

    it("should return last event tickId", async () => {
      let result = await exec();

      expect(result).toEqual(12347);
    });

    it("should return null if there is no data", async () => {
      initialEventContent = false;

      let result = await exec();

      expect(result).toEqual(null);
    });
  });
});
