/**
 * This file should contain web-specific actions extranious to the game state
 */

const DROP_TARGET_CLASS = "hack-drop-target";

/**
 * Called when a card is dropped on a location. We proceed to do some hacky shit to determine what
 * it was dropped on and fire some actions. The right way to do this would be to keep track of the
 * locations of every droppable thing on componentDidMount and window resize.
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
    cb({ card: e.card, location: e.location });
  });
  ref.addEventListener(DROP_TARGET_CLASS, refs.get(ref));
};
