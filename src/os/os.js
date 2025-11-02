import os from "node:os";

export class Os {
  initCommand(args) {
    const command = args[0].slice(2).trim();

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
