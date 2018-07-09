import ssbKeys from "ssb-keys";
import { SEED_RNG } from "./seed-rng";
import { CHECK_DEATH } from "./check-death";
import target from "../target-helper";

export const PLAY_CREATURE = "PLAY_CREATURE";
export const playCreature = ({
  id,
  privateKey,
  targets = []
}) => async dispatch => {
  await dispatch({
    type: PLAY_CREATURE,
    id,
    privateKey,
    targets
  });
};

export const playCreatureReducer = (state, action) => {
  if (action.type === PLAY_CREATURE) {
    const player = state.game.players[action._sender];
    const card = player.hand.filter(card => card.id === action.id)[0];
    const unitId = ssbKeys.unbox(card.box, { private: action.privateKey });
    const unit = state.game.units[unitId];
    return {
      ...state,
      game: {
        ...state.game,
        players: {
          ...state.game.players,
          [action._sender]: {
            ...player,
            availableMana: player.availableMana - unit.cost,
            hand: player.hand.filter(c => c !== card),
            field: [unitId, ...player.field]
          }
        },
        units: { ...state.game.units, [unitId]: { ...unit, canAttack: false } },
        nextActions: [
          {
            playerId: action._sender,
            action: {
              type: SEED_RNG
            }
          },
          ...unit.onSummon
            .filter((onSummon, i) => {
              if (
                Object.keys(target(state.game, onSummon.target)).length === 0
              ) {
                return false;
              }
              return true;
            })
            .map((onSummon, i) => {
              return {
                playerId: action._sender,
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
          { playerId: action._sender, action: { type: CHECK_DEATH } },
          ...state.game.nextActions
        ]
      }
    };
  }

  return state;
};
