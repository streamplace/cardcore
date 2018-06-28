/**
 * So we have lots of actions that come to us from the nextActions queue in the reducer. Some of
 * them can be dispatched as-is, but many of them require us to run an action creator function to
 * e.g. decrypt or encrypt something as is appropriate. This middleware detects such actions and
 * sees if we have a cooresponding action based on a simple naming convention.
 *
 * actions.SEED_RNG_DECRYPT => actions.seedRngDecryptAction
 */

import * as actions from "./actions/index";

const actionMap = {};
for (const [key, value] of Object.entries(actions)) {
  if (typeof value !== "string" || key !== value) {
    continue;
  }
  const camelCase = value
    .split("_")
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join("");
  const actionCreator = camelCase[0].toLowerCase() + camelCase.slice(1);
  if (actions[actionCreator]) {
    actionMap[value] = actions[actionCreator];
  }
}

export const gameActionMiddleware = store => {
  return next => {
    return action => {
      if (actionMap[action.type] && action._fromQueue) {
        action = actionMap[action.type](action);
      }
      return next(action);
    };
  };
};
