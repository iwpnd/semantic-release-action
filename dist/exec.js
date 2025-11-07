// src/exec.ts
import { exec } from "child_process";
import * as util from "util";
var runCommand = util.promisify(exec);
export {
  runCommand
};
