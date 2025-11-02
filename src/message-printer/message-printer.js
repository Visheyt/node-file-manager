import os from "node:os";

export class MessagePrinter {
  constructor(userName) {
    this.userName = userName;
    this.location = os.homedir();
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
