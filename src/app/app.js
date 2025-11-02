import { User } from "../user/user.js";

export class App {
  constructor() {
    this.user = new User();
  }

  sayHi() {
    console.log(`Welcome to the File Manager, ${this.user.userName}`);
  }
}
