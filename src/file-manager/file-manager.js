import { isDirectoryExist, isFileExist } from "../helpers/helpers.js";
import { MessagePrinter } from "../message-printer/message-printer.js";
import { Os } from "../os/os.js";
import fs from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { pipeline as pipelineCb } from "node:stream";
import { promisify } from "node:util";
import zlib from "node:zlib";
import { ERROR_MESSAGE } from "../constants/constants.js";

const pipeline = promisify(pipelineCb);

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

      try {
        if (typeof this[command] !== "function") {
          console.log("Invalid input");
        } else {
          await this[command](args);
        }
      } catch (e) {
        console.log(e?.message || ERROR_MESSAGE);
      }

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
    if (!str) return this.messagePrinter.location;
    return path.resolve(this.messagePrinter.location, str);
  }

  up() {
    const location = this.messagePrinter.location;
    const home = os.homedir();

    if (location !== home) {
      const newLocation = path.dirname(location);

      this.messagePrinter.setLocation(newLocation);
    }
  }

  async cd(args) {
    if (!args || args.length === 0) throw new Error(ERROR_MESSAGE);

    const newLocation = this.parsePath(args[0]);

    if (!(await isDirectoryExist(newLocation))) {
      throw new Error(ERROR_MESSAGE);
    }

    this.messagePrinter.setLocation(newLocation);
  }

  os(args) {
    this.osModule.initCommand(args);
  }

  async ls() {
    const dir = this.messagePrinter.location;
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const items = entries
      .map((entry) => ({
        Name: entry.name,
        Type: entry.isDirectory() ? "Directory" : "File",
      }))
      .sort((a, b) => {
        if (a.Type === b.Type) return a.Name.localeCompare(b.Name);
        return a.Type === "Directory" ? -1 : 1;
      });

    console.table(items);
  }

  async cat(args) {
    const target = this.parsePath(args[0]);

    if (!(await isFileExist(target))) throw new Error(ERROR_MESSAGE);

    const readStream = createReadStream(target, { encoding: "utf8" });

    await new Promise((res, rej) => {
      readStream.on("data", (chunk) => process.stdout.write(chunk));
      readStream.on("end", res);
      readStream.on("error", rej);
    });
  }

  async add(args) {
    const target = this.parsePath(args[0]);

    await fs.writeFile(target, "");
  }

  async mkdir(args) {
    const target = this.parsePath(args[0]);

    await fs.mkdir(target);
  }

  async cp(args) {
    if (args.length < 2) throw new Error(ERROR_MESSAGE);

    const source = this.parsePath(args[0]);
    const targetDir = this.parsePath(args[1]);

    if (!(await isFileExist(source))) throw new Error(ERROR_MESSAGE);
    if (!(await isDirectoryExist(targetDir))) throw new Error(ERROR_MESSAGE);

    const targetPath = path.join(targetDir, path.basename(source));

    const readStream = createReadStream(source);
    const writeStream = createWriteStream(targetPath);

    await new Promise((res, rej) => {
      readStream.pipe(writeStream);
      writeStream.on("finish", res);
      writeStream.on("error", rej);
      readStream.on("error", rej);
    });
  }

  async mv(args) {
    if (args.length < 2) throw new Error(ERROR_MESSAGE);

    const source = this.parsePath(args[0]);
    const targetDir = this.parsePath(args[1]);

    if (!(await isFileExist(source))) throw new Error(ERROR_MESSAGE);
    if (!(await isDirectoryExist(targetDir))) throw new Error(ERROR_MESSAGE);

    const targetPath = path.join(targetDir, path.basename(source));

    // use pipeline to stream + then unlink
    await pipeline(createReadStream(source), createWriteStream(targetPath));

    await fs.unlink(source);
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
    if (args.length < 2) throw new Error(ERROR_MESSAGE);

    const source = this.parsePath(args[0]);
    const targetName = args[1]; // new filename (not full path)
    const target = path.join(path.dirname(source), targetName);

    if (!(await isFileExist(source)) || (await isFileExist(target))) {
      throw new Error(ERROR_MESSAGE);
    }

    await fs.rename(source, target);
  }

  async hash(args) {
    const target = this.parsePath(args[0]);

    if (!(await isFileExist(target))) throw new Error(ERROR_MESSAGE);

    const hash = crypto.createHash("sha256");

    await pipeline(createReadStream(target), hash);

    const hash2 = crypto.createHash("sha256");
    await new Promise((res, rej) => {
      const rs = createReadStream(target);
      rs.on("data", (chunk) => hash2.update(chunk));
      rs.on("end", () => res());
      rs.on("error", (e) => rej(e));
    });

    console.log(hash2.digest("hex"));
  }

  async compress(args) {
    if (args.length < 2) throw new Error(ERROR_MESSAGE);

    const source = this.parsePath(args[0]);
    const destination = this.parsePath(args[1]);

    if (!(await isFileExist(source))) throw new Error(ERROR_MESSAGE);

    const brotli = zlib.createBrotliCompress();

    await pipeline(
      createReadStream(source),
      brotli,
      createWriteStream(destination)
    );
  }

  async decompress(args) {
    if (args.length < 2) throw new Error(ERROR_MESSAGE);

    const source = this.parsePath(args[0]);
    const destination = this.parsePath(args[1]);

    if (!(await isFileExist(source))) throw new Error(ERROR_MESSAGE);

    const brotli = zlib.createBrotliDecompress();

    await pipeline(
      createReadStream(source),
      brotli,
      createWriteStream(destination)
    );
  }

  sayGoodBye() {
    this.messagePrinter.sayGoodBye();
  }
}
