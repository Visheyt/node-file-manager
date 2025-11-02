import { error } from "node:console";
import fs from "node:fs/promises";

export const normalizeArg = (args) => {
  return args[0].slice(2).trim();
};

export const isFileExist = async (path) => {
  try {
    await fs.stat(path);

    return true;
  } catch {
    return false;
  }
};

export const ERROR_MESSAGE = "operation failed";
