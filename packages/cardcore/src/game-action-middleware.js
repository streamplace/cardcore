/**
 * So we have lots of actions that come to us from the nextActions queue in the reducer. Some of
 * them can be dispatched as-is, but many of them require us to run an action creator function to
 * e.g. decrypt or encrypt something as is appropriate. This middleware detects such actions and
 * sees if we have a cooresponding action based on a simple naming convention.
 *
 * actions.SEED_RNG_DECRYPT => actions.seedRngDecryptAction
 */

import * as actions from "@cardcore/game";

const actionMap = {};
Object.keys(actions).forEach(key => {
  const value = actions[key];
  if (typeof value !== "string" || key !== value) {
    return;
  }
  const camelCase = value
    .split("_")
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join("");
  const actionCreator = camelCase[0].toLowerCase() + camelCase.slice(1);
  if (actions[actionCreator]) {
    actionMap[value] = actions[actionCreator];
  }
});

/**
 * two kinds of actions are allowed - you can either be a human that did an action on your turn or you can be a computer handling the most recent action in nextactions
 */
export function checkActionAllowed(state, action) {
  // non-game actions are always allowed
  if (!actions[action.type]) {
    return;
  }
  // also if we don't have a turn order yet, nbd
  if (!state.game || !state.game.turn) {
    return;
  }
  const sender = action._sender || state.client.keys.id;
  if (state.game.nextActions.length > 0) {
    const queueUser = state.game.nextActions[0].playerId;
    if (sender !== queueUser) {
      throw new Error(`queue wants user ${queueUser} but user ${sender} acted`);
    }
  }
  // no queue, check if it's an allowed action
  else if (state.game.allowedActions[action.type] !== true) {
    throw new Error(
      `${sender} attempted to do non-allowed action ${action.type}`
    );
  } else if (state.game.turn !== sender) {
    throw new Error(
      `${sender} acted out of turn; it's ${state.game.turn}'s turn`
    );
  }
}

export default function gameActionMiddleware(store) {
  return next => {
    return action => {
      const state = store.getState();
      checkActionAllowed(state, action);
      if (
        !state.client.loadingState &&
        actionMap[action.type] &&
        action._fromQueue
      ) {
        action = actionMap[action.type](action);
      }
      return next(action);
    };
  };
}
