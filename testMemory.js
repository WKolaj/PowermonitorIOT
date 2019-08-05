const heapdump = require("heapdump");
const {
  clearDirectoryAsync,
  writeFileAsync,
  appendFileAsync
} = require("./utilities/utilities");
const appStart = require("./startup/app");

let callGarbageCollector = () => {
  try {
    if (global.gc) {
      global.gc();
      console.log("Garbage cleared...");
    } else {
      console.log("Cannot clear garbage! - run `node --expose-gc test.js`");
    }
  } catch (e) {
    console.log("`node --expose-gc test.js`");
    process.exit();
  }
};

let writeSnapshot = () => {
  heapdump.writeSnapshot(
    "./_memoryTest/snapshots/" + Date.now() + ".heapsnapshot",
    err => {
      if (err) console.log(err);
    }
  );
  console.log("Snapshot taken...");
};

let writeMemoryUsage = async () => {
  let external = process.memoryUsage().external;
  let heapTotal = process.memoryUsage().heapTotal;
  let heapUsed = process.memoryUsage().heapUsed;
  let rss = process.memoryUsage().rss;

  await appendFileAsync(
    "./_memoryTest/memory.csv",
    `${external};${heapTotal};${heapUsed};${rss}\n`,
    "utf8"
  );

  console.log("Memory file saved...");
};

let clearSnapshotDir = async () => {
  return clearDirectoryAsync("./_memoryTest/snapshots/");
};

let clearMemoryFile = async () => {
  return writeFileAsync(
    "./_memoryTest/memory.csv",
    "External;HeapTotal;HeapUsed;RSS\n",
    "utf8"
  );
};

let memoryIndex = 0;

let startMemoryTest = async () => {
  callGarbageCollector();

  await clearSnapshotDir();
  await clearMemoryFile();

  console.log("memory test started...");

  setInterval(async () => {
    try {
      callGarbageCollector();
      await writeMemoryUsage();
      //writing snapshot every 15 minutes
      if (memoryIndex % 15 === 0) writeSnapshot();
      memoryIndex++;
    } catch (err) {
      console.log(err);
    }
  }, 60000);
};

startMemoryTest();

module.exports = appStart(__dirname);
