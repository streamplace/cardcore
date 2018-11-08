import os from "os";
import path from "path";
import level from "level";
import debug from "debug";
import fs from "fs-extra";

const log = debug("cardcore:node-entry");

export const CARDCORE_DIR = path.resolve(os.homedir(), ".cardcore");
export const CARDCORE_DB = path.resolve(CARDCORE_DIR, "leveldb");

class LevelStorage {
  constructor() {
    this._initProm = false;
  }

  _init() {
    if (this._initProm) {
      return this._initProm;
    }
    this._initProm = (async () => {
      log(`initalizing leveldb at ${CARDCORE_DB}`);
      await fs.ensureDir(CARDCORE_DIR);
      this.db = level(CARDCORE_DB);
    })();
    return this._initProm;
  }

  async getItem(key) {
    if (typeof key !== "string") {
      throw new Error("keys must be strings");
    }
    await this._init();
    try {
      return await this.db.get(key);
    } catch (err) {
      if (err.type === "NotFoundError") {
        return null;
      }
      throw err;
    }
  }

  async setItem(key, value) {
    if (typeof key !== "string" || typeof value !== "string") {
      throw new Error("keys and values must be strings");
    }
    await this._init();
    return await this.db.put(key, value);
  }

  async removeItem(key) {
    if (typeof key !== "string") {
      throw new Error("keys must be strings");
    }
    await this._init();
    return await this.db.del(key);
  }
}

export const Storage = new LevelStorage();
