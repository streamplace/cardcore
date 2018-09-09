import { Box } from "@cardcore/util";
import * as boardRegions from "./board-regions";
import { getDimensions } from "@cardcore/elements";
import { clientPlayCreature } from "@cardcore/client";

export const FRONTEND_CARD_DROP = "FRONTEND_CARD_DROP";
export const frontendCardDrop = ({ boxId, x, y }) => (dispatch, getState) => {
  const { width, height } = getDimensions();
  const regionName = Object.keys(boardRegions).find(regionName => {
    const region = boardRegions[regionName];
    const startX = region.x * width;
    const startY = region.y * height;
    const endX = region.width * width + startX;
    const endY = region.height * height + startY;
    return x >= startX && x <= endX && y >= startY && y <= endY;
  });
  if (!regionName) {
    return;
  }
  dispatch({
    type: FRONTEND_CARD_DROP,
    x,
    y,
    boxId,
    region: regionName
  });
  if (boardRegions[regionName] === boardRegions.BOTTOM_FIELD) {
    const state = getState();
    if (state.game.players[state.client.keys.id].hand.includes(boxId)) {
      dispatch(clientPlayCreature(boxId));
    }
  }
};
