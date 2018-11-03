import queueReducer from "./queue-reducer";

describe("queueReducer", () => {
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
