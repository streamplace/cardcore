import { playCreature } from "@streamplace/card-game";
import { traverseSecret, targetHelper } from "@streamplace/card-util";
import ssbKeys from "ssb-keys";
/**
 * This file should contain web-specific actions extranious to the game state
 */

const DROP_TARGET_CLASS = "hack-drop-target";

/**
 * Called when a card is dropped on a location. We proceed to do some hacky shit to determine what
 * it was dropped on and fire some actions. The right way to do this would be to keep track of the
 * locations of every droppable thing on componentDidMount and window resize.
 *
 * xxx todo move this to the web-specific frontend
 */
export const cardDrop = (e, card, location) => dispatch => {
  document.querySelectorAll(`.${DROP_TARGET_CLASS}`).forEach(elem => {
    const { left, right, top, bottom } = elem.getClientRects()[0];
    if (
      e.clientX >= left &&
      e.clientX <= right &&
      e.clientY >= top &&
      e.clientY <= bottom
    ) {
      const e = new Event(DROP_TARGET_CLASS);
      e.card = card;
      e.location = location;
      elem.dispatchEvent(e);
    }
  });
};

let refs;

// not a redux action, hax instead
export const registerDropTarget = cb => ref => {
  if (!refs) {
    refs = new WeakMap();
  }
  if (!ref) {
    return;
  }
  if (!ref.className.includes(DROP_TARGET_CLASS)) {
    ref.className += ` ${DROP_TARGET_CLASS}`;
  }
  if (refs.has(ref)) {
    ref.removeEventListener(DROP_TARGET_CLASS, refs.get(ref));
  }
  refs.set(ref, e => {
    cb({ card: e.card, location: e.location });
  });
  ref.addEventListener(DROP_TARGET_CLASS, refs.get(ref));
};

export const CLIENT_PLAY_CREATURE = "CLIENT_PLAY_CREATURE";
export const clientPlayCreature = card => async (dispatch, getState) => {
  const state = getState();
  const unitId = traverseSecret(card, state.secret);
  const unit = getState().game.units[unitId];
  await dispatch({
    type: CLIENT_PLAY_CREATURE,
    card,
    unit
  });

  dispatch(clientPlayCreatureTarget());
};

export const clientPlayCreatureTarget = card => async (dispatch, getState) => {
  await dispatch(clientStartTarget());
};

export const clientPlayCreatureDone = () => (dispatch, getState) => {
  const { playingCard, targets } = getState().client;
  const privateKey = getState().secret[playingCard.id].private;
  dispatch(playCreature({ id: playingCard.id, privateKey, targets }));
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
  const availableTargets = Object.keys(targetHelper(state.game, target));
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
export const clientGenerateIdentity = () => {
  return {
    type: CLIENT_GENERATE_IDENTITY,
    keys: ssbKeys.generate()
  };
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
