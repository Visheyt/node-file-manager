export class User {
  constructor() {
    this.userName = this.parseName(process.argv);
  }

  parseName = (argvs) => {
    const name = argvs.slice(2);

    return name[0].slice(name[0].indexOf("=") + 1);
  };
}
