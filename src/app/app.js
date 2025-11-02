import { FileManager } from "../file-manager/file-manager.js";
import { User } from "../user/user.js";

export class App {
  constructor() {
    this.user = new User();

    this.fileManager = new FileManager(this.user);
  }
}
