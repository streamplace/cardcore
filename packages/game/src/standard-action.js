import { END_TURN } from "./turns";
import { PLAY_CARD } from "./play-card";
import { ATTACK } from "./attack";
import { makeSchema, Box } from "@cardcore/util";

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
                agent: state.game.turn,
              }),
              makeSchema({
                type: PLAY_CARD,
                agent: state.game.turn,
                boxId: {
                  enum: [...state.game.players[state.game.turn].hand],
                },
              }),
              makeSchema({
                type: ATTACK,
                agent: state.game.turn,
                attackingUnitId: {
                  enum: state.game.players[state.game.turn].field
                    .map((bid) => Box.traverse(state, bid))
                    .filter((uid) => state.game.units[uid].canAttack),
                },
                defendingUnitId: {
                  enum: Object.keys(state.game.players)
                    .filter((pId) => pId !== state.game.turn)
                    .map((pId) => [
                      ...state.game.players[pId].field.map((bid) =>
                        Box.traverse(state, bid),
                      ),
                      state.game.players[pId].unitId,
                    ])
                    .reduce((all, arr) => [...all, ...arr], []),
                },
              }),
            ].filter((x) => !!x),
          },
          ...state.game.queue,
        ],
      },
    };
  }

  return state;
};
