import os from "node:os";
import { normalizeArg } from "../helpers/helpers.js";

export class Os {
  initCommand(args) {
    const command = normalizeArg(args);

    this[command]();
  }

  cpus() {
    console.table(
      os.cpus().map((cpu) => {
        return {
          model: cpu.model,
          rate: `${cpu.speed} GHz`,
        };
      })
    );
  }

  username() {
    console.log(os.userInfo().username);
  }

  EOL() {
    console.log(JSON.stringify(os.EOL));
  }

  homedir() {
    console.log(os.homedir());
  }

  architecture() {
    console.log(os.arch());
  }
}
