import path from "path";
import fs from "fs-extra";
import level from "level";

export default class Store {
  constructor({ dataDir } = {}) {
    this.dir = dataDir || path.resolve(__dirname, "..", "..", "..", "data");
    fs.ensureDir(this.dir);
    this.db = level(path.resolve(this.dir, "cardcore-leveldb"));
  }

  async put(id, str) {
    await this.db.put(id, str);
  }

  async get(id) {
    const data = await this.db.get(id);
    return JSON.parse(data);
  }
}
