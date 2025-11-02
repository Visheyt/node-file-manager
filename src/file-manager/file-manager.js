import {
  ERROR_MESSAGE,
  isFileExist,
  normalizeArg,
} from "../helpers/helpers.js";
import { MessagePrinter } from "../message-printer/message-printer.js";
import { Os } from "../os/os.js";
import fs from "node:fs/promises";
import path from "node:path";

export class FileManager {
  constructor(userName) {
    this.messagePrinter = new MessagePrinter(userName);

    this.osModule = new Os();

    this.messagePrinter.sayWelcome();

    this.messagePrinter.printLocation();

    process.stdin.on("data", async (chunk) => {
      const { command, args } = this.parseChunk(chunk);

      if (command === ".exit") {
        this.sayGoodBye();
        process.exit(0);
      }

      await this[command](args);

      this.messagePrinter.printLocation();
    });

    process.on("SIGINT", () => this.messagePrinter.sayGoodBye());
  }

  parseChunk(chunk) {
    const data = chunk.toString().trim().split(" ");

    const [command, ...args] = data;

    return {
      command: command,
      args: args,
    };
  }

  parsePath(str) {
    return path.join(this.messagePrinter.location, str);
  }

  os(args) {
    this.osModule.initCommand(args);
  }

  async add(args) {
    const target = this.parsePath(args[0]);

    console.log(target);

    await fs.writeFile(target, "");
  }

  async mkdir(args) {
    const target = this.parsePath(args[0]);

    await fs.mkdir(target);
  }

  async rm(args) {
    const target = this.parsePath(args[0]);

    if (await isFileExist(target)) {
      await fs.unlink(target);
    } else {
      throw new Error(ERROR_MESSAGE);
    }
  }

  async rn(args) {
    if (args.length < 2) {
      throw new Error(ERROR_MESSAGE);
    }

    const source = this.parsePath(args[0]);

    const target = this.parsePath(args[1]);

    console.log(source, target);

    if (!(await isFileExist(source)) || (await isFileExist(target))) {
      throw new Error(ERROR_MESSAGE);
    }
    await fs.rename(source, target);
  }
}
