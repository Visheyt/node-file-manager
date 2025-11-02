import { MessagePrinter } from "../message-printer/message-printer.js";
import { Os } from "../os/os.js";

export class FileManager {
  constructor(userName) {
    this.messagePrinter = new MessagePrinter(userName);

    this.osModule = new Os();

    this.messagePrinter.sayWelcome();

    this.messagePrinter.printLocation();

    process.stdin.on("data", (chunk) => {
      const { command, args } = this.parseChunk(chunk);

      if (command === ".exit") {
        this.sayGoodBye();
        process.exit(0);
      }

      this[command](args);

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

  os(args) {
    this.osModule.initCommand(args);
  }
}
