import queueReducer from "./queue-reducer";

describe("queueReducer", () => {
  it("should convert nextActions to queue", () => {
    const state = {
      game: {
        nextActions: [
          {
            action: { type: "TEST_ACTION" }
          }
        ]
      }
    };
    const after = queueReducer(state, { type: "TEST_ACTION_2" });
    expect(after.game.queue[0].type).toEqual("object");
    expect(after.game.queue[0].properties.type.enum[0]).toEqual("TEST_ACTION");
  });

  it("should accept/reject actions", () => {
    const state = {
      game: {
        queue: [
          {
            type: "object",
            properties: {
              type: {
                enum: ["TEST_ACTION"]
              }
            }
          }
        ]
      }
    };
    queueReducer(state, { type: "TEST_ACTION" });
    expect(() => {
      queueReducer(state, { type: "INVALID_ACTION" });
    }).toThrow();
    expect(() => {
      queueReducer(state, null);
    }).toThrow();
  });
});
