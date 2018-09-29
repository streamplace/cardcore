import ssbKeys from "@streamplace/ssb-keys";
import { rando, Box } from "@cardcore/util";
import { BOX_OPEN } from "./box";

export const SEED_RNG = "SEED_RNG";
export const seedRng = action => {
  return action;
};

export const SEED_RNG_ENCRYPT = "SEED_RNG_ENCRYPT";
export const seedRngEncrypt = () => async (dispatch, getState) => {
  const me = getState().client.keys;
  // idk just hash a key, good enough
  const randoSecret = ssbKeys.hash(ssbKeys.generate().id);
  const { boxId, box } = Box.new(randoSecret, me.id);
  return dispatch({
    type: SEED_RNG_ENCRYPT,
    boxId,
    box
  });
};

export const SEED_RNG_COMBINE = "SEED_RNG_COMBINE";

// these actions should all happen in lexical order rather than playerOrder because they're used to // seed the RNG prior to playerOrder existing
export const seedRngReducer = (state, action) => {
  if (action.type === SEED_RNG) {
    const orderedPlayers = Object.keys(state.game.players).sort();
    return {
      ...state,
      game: {
        ...state.game,
        nextActions: [
          {
            playerId: orderedPlayers[0],
            action: {
              type: SEED_RNG_ENCRYPT
            }
          },
          {
            playerId: action._sender,
            action: {
              type: SEED_RNG_COMBINE
            }
          },
          ...state.game.nextActions
        ]
      }
    };
  }

  if (action.type === SEED_RNG_ENCRYPT) {
    const orderedPlayers = Object.keys(state.game.players).sort();
    state = {
      ...state,
      game: {
        ...state.game,
        boxes: {
          ...state.game.boxes,
          [action.boxId]: action.box
        },
        randoSeeds: {
          ...state.game.randoSeeds,
          [action._sender]: action.boxId
        }
      }
    };
    // if we're done, do all the decrypts
    const seedCount = Object.keys(state.game.randoSeeds).length;
    if (seedCount === orderedPlayers.length) {
      return {
        ...state,
        game: {
          ...state.game,
          nextActions: [
            ...orderedPlayers.map(playerId => ({
              playerId: playerId,
              action: {
                type: BOX_OPEN,
                boxId: state.game.randoSeeds[playerId]
              }
            })),
            ...state.game.nextActions
          ]
        }
      };
    }
    // otherwise do the next encrypt
    else {
      return {
        ...state,
        game: {
          ...state.game,
          nextActions: [
            {
              playerId: orderedPlayers[seedCount],
              action: {
                type: SEED_RNG_ENCRYPT
              }
            },
            ...state.game.nextActions
          ]
        }
      };
    }
  }

  if (action.type === SEED_RNG_COMBINE) {
    let finalSeed = Object.keys(state.game.players)
      .sort()
      .map(playerId => {
        return Box.traverse(state, state.game.randoSeeds[playerId]);
      })
      .join("");
    finalSeed = ssbKeys.hash(finalSeed);
    return {
      ...state,
      game: {
        ...state.game,
        randoSeeds: {},
        randoSeed: finalSeed
      }
    };
  }

  return state;
};
