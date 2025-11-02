import { Os } from "../os/os.js";

export class FileManager {
  constructor(userName) {
    this.userName = userName;

    this.osModule = new Os();

    this.sayWelcome();

    process.stdin.on("data", (chunk) => {
      const { command, args } = this.parseChunk(chunk);

      if (command === ".exit") {
        this.sayGoodBye();
        process.exit(0);
      }

      this[command](args);
    });

    process.on("SIGINT", () => this.sayGoodBye());
  }

  parseChunk(chunk) {
    const data = chunk.toString().trim().split(" ");

    const [command, ...args] = data;

    return {
      command: command,
      args: args,
    };
  }

  sayWelcome() {
    console.log(`Welcome to the File Manager, ${this.userName}`);
  }

  sayGoodBye() {
    console.log(
      `\nThank you for using File Manager, ${this.userName}, goodbye!`
    );
    process.exit(0);
  }

  os(args) {
    this.osModule.initCommand(args);
  }
}
