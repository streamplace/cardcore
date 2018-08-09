import ssbKeys from "@streamplace/ssb-keys";

const Box = {
  open(boxId, box, me) {
    if (!box.keys[me.id]) {
      return null;
    }
    const masterPrivate = ssbKeys.unbox(box.keys[me.id], me);
    return ssbKeys.unbox(box.contents, {
      id: boxId,
      public: boxId.slice(1),
      private: masterPrivate
    });
  },

  traverse(boxId, boxes, me) {
    const boxContents = Box.open(boxId, boxes[boxId], me);
    if (!boxContents) {
      // dang, couldn't open it. done!
      return null;
    }
    if (boxes[boxContents]) {
      // hey, this box had a box in it! keep going!
      return Box.traverse(boxContents, boxes, me);
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

  addKey(box, me, ownerId) {
    const boxMasterPrivateKey = ssbKeys.unbox(box.keys[me.id], me);
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
