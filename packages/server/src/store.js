import path from "path";
import fs from "fs-extra";
export default class Store {
  constructor({ dataDir } = {}) {
    this.dir = dataDir || path.resolve(__dirname, "..", "..", "..", "data");
    fs.ensureDir(this.dir);
  }

  async put(id, str) {
    id = encodeURIComponent(id);
    await fs.writeFile(path.resolve(this.dir, id), str, "utf8");
  }

  async get(id) {
    id = encodeURIComponent(id);
    const data = await fs.readFile(path.resolve(this.dir, id), "utf8");
    return JSON.parse(data);
  }
}
