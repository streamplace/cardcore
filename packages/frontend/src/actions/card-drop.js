import { BOTTOM_FIELD } from "./layout";
import { clientPlayCreature } from "@cardcore/client";
import { Box } from "@cardcore/util";
import { attack } from "@cardcore/game";

export const FRONTEND_CARD_DROP = "FRONTEND_CARD_DROP";
export const frontendCardDrop = ({ boxId, x, y }) => (dispatch, getState) => {
  const state = getState();

  // find everything that's below where we dropped the card
  const matches = state.frontend.layout
    .filter(elem => {
      const endX = elem.x + elem.width;
      const endY = elem.y + elem.height;
      return x >= elem.x && x <= endX && y >= elem.y && y <= endY;
    })
    .sort((a, b) => b.zIndex - a.zIndex);

  // see if we have a pertinent action for any of thems, return if so
  for (const elem of matches) {
    if (elem.type === "region") {
      if (elem.region !== BOTTOM_FIELD) {
        continue;
      }
      if (state.game.players[state.client.keys.id].hand.includes(boxId)) {
        return dispatch(clientPlayCreature(boxId));
      }
    }
    if (elem.type === "card") {
      const otherPlayerId = state.game.playerOrder.find(
        pid => pid !== state.client.keys.id
      );
      // if we drag our canAttack field card onto theirs, it's an attack!
      if (!state.game.players[state.client.keys.id].field.includes(boxId)) {
        // dragged card isn't ours
        continue;
      }
      if (!state.game.players[otherPlayerId].field.includes(elem.boxId)) {
        // target card isn't theirs
        continue;
      }
      const myCardId = Box.traverse(state, boxId);
      if (!state.game.units[myCardId].canAttack) {
        // this can't can't attack
        continue;
      }
      const theirCardId = Box.traverse(state, elem.boxId);
      // that's everything. let's go!
      return dispatch(attack(myCardId, theirCardId));
    }
  }
  // dispatch({
  //   type: FRONTEND_CARD_DROP,
  //   x,
  //   y,
  //   boxId,
  //   region: regionName
  // });
  // if (boardRegions[regionName] === boardRegions.BOTTOM_FIELD) {
  //   const state = getState();
  //   if (state.game.players[state.client.keys.id].hand.includes(boxId)) {
  //     dispatch(clientPlayCreature(boxId));
  //   }
  // }
};
