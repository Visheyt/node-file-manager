export class FileManager {
  constructor(userName) {
    this.userName = userName;

    this.sayWelcome();

    process.stdin.on("data", (chunk) => {
      const data = chunk.toString().trim();

      if (data === "exit") {
        this.sayGoodBye();
        process.exit(0);
      }
    });

    process.on("SIGINT", () => this.sayGoodBye());
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
}
