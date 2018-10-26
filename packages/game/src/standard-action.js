import { END_TURN } from "./turns";
import { PLAY_CARD } from "./play-card";
import { ATTACK } from "./attack";
import { makeSchema } from "@cardcore/util";

export const STANDARD_ACTION = "STANDARD_ACTION";

export const standardActionReducer = (state, action) => {
  if (action.type === STANDARD_ACTION) {
    return {
      ...state,
      game: {
        ...state.game,
        queue: [
          {
            anyOf: [
              makeSchema({
                type: END_TURN,
                agent: state.game.turn
              }),
              makeSchema({
                type: PLAY_CARD,
                agent: state.game.turn,
                boxId: {
                  enum: [...state.game.players[state.game.turn].hand]
                }
              }),
              makeSchema({
                type: ATTACK,
                agent: state.game.turn
              })
            ]
          },
          ...state.game.queue
        ]
      }
    };
  }

  return state;
};
