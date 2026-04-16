import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const vendorRoot = path.join(cwd, "vendor");
const generatedRoot = path.join(cwd, "public", "generated");

const status = {
  vendor: {
    ArknightsData: fs.existsSync(path.join(vendorRoot, "ArknightsData")),
    PortraitSource: fs.existsSync(path.join(vendorRoot, "PortraitSource")),
  },
  generated: {
    rootExists: fs.existsSync(generatedRoot),
  },
};

console.log(JSON.stringify(status, null, 2));
