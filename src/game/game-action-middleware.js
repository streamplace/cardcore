import * as actions from "./actions/index";

// this could be more elegant
export const actionMap = {
  [actions.SEED_RNG]: actions.seedRngAction,
  [actions.SEED_RNG_ENCRYPT]: actions.seedRngEncryptAction,
  [actions.SEED_RNG_DECRYPT]: actions.seedRngDecryptAction
};

export const gameActionMiddleware = store => {
  return next => {
    return action => {
      if (actionMap[action.type] && action._needsCreator) {
        action = { ...action, _needsCreator: false };
        action = actionMap[action.type](action);
      }
      return next(action);
    };
  };
};
