import { playCard } from "@cardcore/game";
import { Box, target as targetHelper } from "@cardcore/util";
import ssbKeys from "@streamplace/ssb-keys";
import { Storage } from "@cardcore/elements";

export * from "./client-poll";
export * from "./client-fetch";
export * from "./client-next";

/**
 * This file should contain web-specific actions extranious to the game state
 */

export const CLIENT_PLAY_CREATURE = "CLIENT_PLAY_CREATURE";
export const clientPlayCreature = boxId => async (dispatch, getState) => {
  const state = getState();
  const unitId = Box.traverse(state, boxId);
  const unit = state.game.units[unitId];
  await dispatch({
    type: CLIENT_PLAY_CREATURE,
    boxId,
    unit
  });

  dispatch(clientPlayCreatureTarget());
};

export const clientPlayCreatureTarget = card => async (dispatch, getState) => {
  await dispatch(clientStartTarget());
};

export const clientPlayCreatureDone = () => (dispatch, getState) => {
  const boxId = getState().client.playingBoxId;
  dispatch(playCard({ boxId }));
};

export const clientStartTarget = () => (dispatch, getState) => {
  const state = getState();
  if (state.client.targetQueue.length === 0) {
    return dispatch(clientPlayCreatureDone());
  }
  const target = state.client.targetQueue[0];
  if (target.random || target.count === undefined) {
    return dispatch(clientPickTarget(null));
  }
  const availableTargets = Object.keys(targetHelper(state, target));
  if (availableTargets.length === 0) {
    return dispatch(clientPickTarget(null));
  }
  dispatch({ type: CLIENT_START_TARGET, availableTargets });
};

export const CLIENT_TARGET_CANCEL = "CLIENT_TARGET_CANCEL";
export const clientTargetCancel = () => {
  return { type: CLIENT_TARGET_CANCEL };
};

export const clientPickTarget = unitId => async (dispatch, getState) => {
  await dispatch({ type: CLIENT_PICK_TARGET, unitId });
  await dispatch(clientStartTarget());
};

export const CLIENT_START_TARGET = "CLIENT_START_TARGET";
export const CLIENT_PICK_TARGET = "CLIENT_PICK_TARGET";
export const CLIENT_GENERATE_IDENTITY = "CLIENT_GENERATE_IDENTITY";
const CARDCORE_IDENTITY = "CARDCORE_IDENTITY";
export const clientGenerateIdentity = ({
  store = true
} = {}) => async dispatch => {
  let storedItem;
  if (store) {
    storedItem = await Storage.getItem(CARDCORE_IDENTITY);
  }
  let keys;
  if (storedItem) {
    try {
      keys = JSON.parse(storedItem);
    } catch (e) {
      console.error("error parsing cardcore identity, clearing", e);
      store && (await Storage.removeItem(CARDCORE_IDENTITY));
    }
  }
  if (!keys) {
    keys = ssbKeys.generate();
    store && (await Storage.setItem(CARDCORE_IDENTITY, JSON.stringify(keys)));
  }
  dispatch({
    type: CLIENT_GENERATE_IDENTITY,
    keys
  });
};

export const CLIENT_GENERATE_KEY = "CLIENT_GENERATE_KEY";
export const clientGenerateKey = () => {
  return {
    type: CLIENT_GENERATE_KEY,
    keys: ssbKeys.generate()
  };
};

export const CLIENT_BOX = "CLIENT_BOX";
export const clientBox = (data, keys) => (dispatch, getState) => {
  dispatch({
    type: CLIENT_BOX,
    id: keys.id,
    contents: data
  });
  return {
    secret: true,
    id: keys.id,
    playerId: getState().client.keys.id,
    box: ssbKeys.box(data, [keys])
  };
};

export const CLIENT_CLOSE = "CLIENT_CLOSE";
export const clientClose = () => ({
  type: CLIENT_CLOSE
});
