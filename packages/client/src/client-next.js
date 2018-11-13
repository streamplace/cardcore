import * as gameActions from "@cardcore/game";
import { CLIENT_LOAD_STATE_START } from "./client-poll";

// Build a mapping of action type strings to cooresponding action creators
const actionMap = {};
Object.keys(gameActions).forEach(key => {
  const value = gameActions[key];
  if (typeof value !== "string" || key !== value) {
    return;
  }
  const camelCase = value
    .split("_")
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join("");
  const actionCreator = camelCase[0].toLowerCase() + camelCase.slice(1);
  if (gameActions[actionCreator]) {
    actionMap[value] = gameActions[actionCreator];
  }
});

const clientNextHelper = state => {
  const me = state.client.keys.id;
  if (state.game.nextActions.length === 0) {
    return null;
  }
  let { playerId, notPlayerId, action: nextAction } = state.game.nextActions[0];
  if (!gameActions[nextAction.type]) {
    throw new Error(
      `${nextAction.type} is queued but we don't have a definition`
    );
  }
  if (playerId && playerId !== me) {
    return null;
  }
  if (notPlayerId && notPlayerId === me) {
    return null;
  }
  if (actionMap[nextAction.type]) {
    nextAction = actionMap[nextAction.type](nextAction);
  }
  return nextAction;
};

/**
 * Reducer that generates next actions for us if appropriate
 */
export const clientNextReducer = (state, action) => {
  if (!gameActions[action.type] && action.type !== CLIENT_LOAD_STATE_START) {
    return state;
  }

  const nextAction = clientNextHelper(state, action);
  if (state.client.nextAction !== nextAction) {
    return {
      ...state,
      client: {
        ...state.client,
        nextAction
      }
    };
  }

  return state;
};

export const clientNext = () => async (dispatch, getState) => {
  const nextAction = getState().client.nextAction;
  if (nextAction) {
    return await dispatch(nextAction);
  }
};
