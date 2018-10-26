import { SEED_RNG } from "./seed-rng";
import { CHECK_DEATH } from "./check-death";
import { target, Box, makeSchema } from "@cardcore/util";
import { START_GAME } from "./start-game";

export const PLAY_CREATURE = "PLAY_CREATURE";
export const playCreature = ({ boxId }) => async (dispatch, getState) => {
  const { targets } = getState().client;
  dispatch({
    type: PLAY_CREATURE,
    boxId,
    targets
  });
};

export const playCreatureReducer = (state, action) => {
  if (action.type === PLAY_CREATURE) {
    const player = state.game.players[action.agent];
    const boxId = action.boxId;
    const unitId = Box.traverse(state, boxId);
    const unit = state.game.units[unitId];
    return {
      ...state,
      game: {
        ...state.game,
        players: {
          ...state.game.players,
          [action.agent]: {
            ...player,
            availableMana: player.availableMana - unit.cost,
            hand: player.hand.filter(c => c !== boxId),
            field: [boxId, ...player.field]
          }
        },
        units: { ...state.game.units, [unitId]: { ...unit, canAttack: false } },
        nextActions: [
          {
            playerId: action.agent,
            action: {
              type: SEED_RNG
            }
          },
          ...unit.onSummon
            .filter((onSummon, i) => {
              if (Object.keys(target(state, onSummon.target)).length === 0) {
                return false;
              }
              return true;
            })
            .map((onSummon, i) => {
              return {
                playerId: action.agent,
                action: {
                  ...onSummon,
                  target: {
                    ...onSummon.target,
                    unitId: onSummon.target.random
                      ? undefined
                      : action.targets[i]
                  },
                  unitId: unitId
                }
              };
            }),
          { playerId: action.agent, action: { type: CHECK_DEATH } },
          ...state.game.nextActions
        ],
        queue: [
          makeSchema({
            type: SEED_RNG,
            agent: action.agent
          }),
          makeSchema({
            type: CHECK_DEATH,
            agent: action.agent
          }),
          ...state.game.queue
        ]
      }
    };
  }

  return state;
};
