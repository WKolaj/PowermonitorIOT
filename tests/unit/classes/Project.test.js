const config = require("config");
const Project = require("../../../classes/project/Project");

let {
  clearDirectoryAsync,
  checkIfTableExists,
  checkIfColumnExists,
  checkIfFileExistsAsync,
  createDatabaseFile,
  createDatabaseTable,
  createDatabaseColumn,
  readAllDataFromTable,
  snooze
} = require("../../../utilities/utilities");

describe("Project", () => {
  //Database directory should be cleared
  let db1Path;
  let db2Path;
  let projPath;

  beforeEach(async () => {
    db1Path = config.get("db1Path");
    db2Path = config.get("db2Path");
    projPath = config.get("projPath");
  });

  afterEach(async () => {
    await clearDirectoryAsync(db1Path);
    await clearDirectoryAsync(db2Path);
    await clearDirectoryAsync(projPath);
  });

  describe("TO DO ", () => {
    it("Purely for test = TO DO LATER", async () => {
      expect(true).toBeTruthy();
    });
  });
});
