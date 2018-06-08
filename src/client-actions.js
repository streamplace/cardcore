import { playCreature } from "./game/actions";
/**
 * This file should contain web-specific actions extranious to the game state
 */

const DROP_TARGET_CLASS = "hack-drop-target";

/**
 * Called when a card is dropped on a location. We proceed to do some hacky shit to determine what
 * it was dropped on and fire some actions. The right way to do this would be to keep track of the
 * locations of every droppable thing on componentDidMount and window resize.
 */
export const cardDrop = (e, unitId, location) => dispatch => {
  document.querySelectorAll(`.${DROP_TARGET_CLASS}`).forEach(elem => {
    const { left, right, top, bottom } = elem.getClientRects()[0];
    if (
      e.clientX >= left &&
      e.clientX <= right &&
      e.clientY >= top &&
      e.clientY <= bottom
    ) {
      const e = new Event(DROP_TARGET_CLASS);
      e.unitId = unitId;
      e.location = location;
      elem.dispatchEvent(e);
    }
  });
};

const refs = new WeakMap();

// not a redux action, hax instead
export const registerDropTarget = cb => ref => {
  if (!ref) {
    return;
  }
  ref.className += ` ${DROP_TARGET_CLASS}`;
  if (refs.has(ref)) {
    ref.removeEventListener(DROP_TARGET_CLASS, refs.get(ref));
  }
  refs.set(ref, e => {
    cb({ unitId: e.unitId, location: e.location });
  });
  ref.addEventListener(DROP_TARGET_CLASS, refs.get(ref));
};

export const clientPlayCreature = (unitId, playerId) => (
  dispatch,
  getState
) => {
  const unit = getState().game.units[unitId];
  let i;
  for (i = 0; i < unit.onSummon.length; i++) {
    let count = unit.onSummon[i].target.count;
    if (count && count >= 1) {
      return dispatch(clientStartTarget(unit, unitId));
    }
  }
  dispatch(playCreature(unitId));
};

export const clientStartTarget = (unit, unitId) => (dispatch, getState) => {
  dispatch({ type: CLIENT_START_TARGET, unit, unitId });
};
export const clientPickTarget = unitId => async (dispatch, getState) => {
  await dispatch({ type: CLIENT_PICK_TARGET, unitId });
  const timeToPlay =
    getState().client.targets.length ===
    getState().client.targetingUnit.onSummon.length;
  if (timeToPlay) {
    await dispatch(
      playCreature(getState().client.targetingUnitId, getState().client.targets)
    );
  }
};

export const CLIENT_START_TARGET = "CLIENT_START_TARGET";
export const CLIENT_PICK_TARGET = "CLIENT_PICK_TARGET";
