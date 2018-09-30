import ssbKeys from "@streamplace/ssb-keys";

const boxCache = {};

const Box = {
  open(state, boxId) {
    const box = state.game.boxes[boxId];
    let privateKey;
    if (box.privateKey) {
      privateKey = box.privateKey;
    } else if (
      state.client &&
      state.client.keys &&
      box.keys[state.client.keys.id]
    ) {
      privateKey = Box.getPrivate(state, boxId);
    }
    if (!privateKey) {
      return null;
    }
    return ssbKeys.unbox(box.contents, {
      id: boxId,
      public: boxId.slice(1),
      private: privateKey
    });
  },

  getPrivate(state, boxId) {
    const box = state.game.boxes[boxId];
    const me = state.client.keys;
    return ssbKeys.unbox(box.keys[me.id], me);
  },

  traverse(state, boxId) {
    if (typeof state === "string") {
      throw new Error("deprecated call to Box.traverse");
    }

    if (boxCache[boxId]) {
      return boxCache[boxId];
    }
    const result = this._traverse(state, boxId);
    if (result) {
      boxCache[boxId] = result;
    }
    return result;
  },

  _traverse(state, boxId) {
    if (!state.game.boxes[boxId]) {
      return boxId; // idk maybe a unitId or something
    }
    const boxContents = Box.open(state, boxId);
    if (!boxContents) {
      // dang, couldn't open it. done!
      return null;
    }
    if (state.game.boxes[boxContents]) {
      // hey, this box had a box in it! keep going!
      return Box._traverse(state, boxContents);
    }
    // got something that wasn't a box — we're done!
    return boxContents;
  },

  // contents can be anything JSON-able. owners is an array of ssb ids
  new(contents, ...ownerIds) {
    const keys = ssbKeys.generate();
    const box = {
      contents: ssbKeys.box(contents, [keys]),
      keys: {}
    };
    for (const ownerId of ownerIds) {
      box.keys[ownerId] = ssbKeys.box(keys.private, [
        {
          id: ownerId,
          public: ownerId.slice(1),
          curve: "ed25519"
        }
      ]);
    }
    return { boxId: keys.id, box };
  },

  addKey(state, boxId, ownerId) {
    const boxMasterPrivateKey = this.getPrivate(state, boxId);
    return ssbKeys.box(boxMasterPrivateKey, [
      {
        id: ownerId,
        public: ownerId.slice(1),
        curve: "ed25519"
      }
    ]);
  }
};

export default Box;
