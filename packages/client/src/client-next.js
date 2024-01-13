import * as gameActions from "@cardcore/game";
import {
  CLIENT_LOAD_STATE_DONE,
  CLIENT_LOAD_STATE_START,
} from "./client-load-state";
import { clientPoll } from "./client-poll";

// Build a mapping of action type strings to cooresponding action creators
const actionMap = {};
Object.keys(gameActions).forEach((key) => {
  const value = gameActions[key];
  if (typeof value !== "string" || key !== value) {
    return;
  }
  const camelCase = value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join("");
  const actionCreator = camelCase[0].toLowerCase() + camelCase.slice(1);
  if (gameActions[actionCreator]) {
    actionMap[value] = gameActions[actionCreator];
  }
});

const clientNextHelper = (state) => {
  const me = state.client.keys.id;
  if (state.game.nextActions.length === 0) {
    return null;
  }
  let { playerId, notPlayerId, action: nextAction } = state.game.nextActions[0];
  if (!gameActions[nextAction.type]) {
    throw new Error(
      `${nextAction.type} is queued but we don't have a definition`,
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
  if (
    !gameActions[action.type] &&
    action.type !== CLIENT_LOAD_STATE_START &&
    action.type !== CLIENT_LOAD_STATE_DONE
  ) {
    return state;
  }

  const nextAction = clientNextHelper(state, action);
  let nextAgent = null;

  if (nextAction) {
    // we have an action ready to go, it's us!
    nextAgent = state.client.keys.id;
  } else if (state.game.nextActions.length > 0) {
    // there's a queued action we're waiting on
    const nextAction = state.game.nextActions[0];
    if (nextAction.playerId) {
      nextAgent = nextAction.playerId;
    } else if (
      nextAction.notPlayerId &&
      state.client.keys.id !== nextAction.notPlayerId
    ) {
      nextAgent = state.client.keys.id;
    }
  } else if (state.game.queue.length > 0 && state.game.queue[0].anyOf) {
    // someone is deciding on their next move
    nextAgent = state.game.turn;
  } else {
    if (
      state.client.actionLog[state.client.actionLog.length - 1].type !==
      gameActions.DEFEAT
    ) {
      throw new Error("unable to determine next agent");
    }
  }

  if (
    !nextAction &&
    nextAgent === state.client.keys.id &&
    !state.game.queue[0].anyOf
  ) {
    throw new Error("err");
  }

  return {
    ...state,
    client: {
      ...state.client,
      nextAction,
      nextAgent,
    },
  };
};

export const clientNext = () => async (dispatch, getState) => {
  const nextAction = getState().client.nextAction;
  if (nextAction) {
    return await dispatch(nextAction);
  }
};

export const clientHandleNext = () => (dispatch, getState) => {
  const state = getState();

  if (state.client.loadingState) {
    // short-circuit, we're still loading
    return;
  }

  if (state.game.queue.length === 0) {
    // Game over!
    return;
  }

  if (state.client.nextAction) {
    // We can do something immediately, so do it.
    return dispatch(clientNext());
  } else if (
    state.client.nextAgent === state.client.keys.id &&
    !state.game.queue[0].anyOf
  ) {
    throw new Error(
      `${
        getState().client.shortName
      } has a queued action but is not autonomous, error ${JSON.stringify(
        state.game.queue,
      )}`,
    );
  }

  if (
    state.client.nextAgent !== undefined &&
    state.client.nextAgent !== state.client.keys.id
  ) {
    // It's someone else's turn, wait for them.
    return dispatch(clientPoll());
  }

  // Otherwise it's our turn — end this stack and return control to the user
};
