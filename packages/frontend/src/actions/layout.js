export const TOP_SIDEBOARD = {
  x: 0,
  y: 0,
  width: 1,
  height: 0.25
};

export const TOP_FIELD = {
  x: 0,
  y: 0.25,
  width: 1,
  height: 0.25
};

export const BOTTOM_FIELD = {
  x: 0,
  y: 0.5,
  width: 1,
  height: 0.25
};

export const BOTTOM_SIDEBOARD = {
  x: 0,
  y: 0.75,
  width: 1,
  height: 0.25
};

export const CARD_PADDING = 5;
export const REGION_Z_INDEX = 10;
export const CARD_Z_INDEX = 100;

export function layoutReducer(state) {
  const layout = [];
  if (
    !state.frontend ||
    typeof state.frontend.width !== "number" ||
    !state.game ||
    !state.game.playerOrder ||
    !state.client ||
    !state.client.keys
  ) {
    return state;
  }
  const { width, height } = state.frontend;
  let [topPlayerId, bottomPlayerId] = state.game.playerOrder;
  if (state.game.playerOrder.includes(state.client.keys.id)) {
    topPlayerId = state.game.playerOrder.find(
      id => id !== state.client.keys.id
    );
    bottomPlayerId = state.client.keys.id;
  }

  for (const playerId of [topPlayerId, bottomPlayerId]) {
    if (!state.game.players[playerId] || !state.game.players[playerId].hand) {
      return state;
    }
  }

  // cards
  [
    {
      playerId: topPlayerId,
      location: "hand",
      region: TOP_SIDEBOARD
    },
    {
      playerId: topPlayerId,
      location: "field",
      region: TOP_FIELD
    },
    {
      playerId: bottomPlayerId,
      location: "field",
      region: BOTTOM_FIELD
    },
    {
      playerId: bottomPlayerId,
      location: "hand",
      region: BOTTOM_SIDEBOARD
    }
  ].forEach(({ playerId, location, region }) => {
    layout.push({
      type: "region",
      region,
      x: width * region.x,
      y: height * region.y,
      width: width * region.width,
      height: height * region.height,
      zIndex: REGION_Z_INDEX
    });
    const player = state.game.players[playerId];
    const boxIds = player[location];
    const cardHeight = height * region.height - CARD_PADDING * 2;
    const cardWidth = (cardHeight * 3) / 4;
    const allCardsWidth = cardWidth * boxIds.length;
    const leftOffset = (width - allCardsWidth) / 2;
    const y = height * region.y + CARD_PADDING;
    boxIds.forEach((boxId, i) => {
      layout.push({
        type: "card",
        key: boxId,
        boxId: boxId,
        height: cardHeight,
        width: cardWidth,
        x: i * cardWidth + leftOffset,
        y: y,
        playerId,
        location,
        zIndex: CARD_Z_INDEX
      });
    });
  });

  // faces
  [
    {
      region: TOP_SIDEBOARD,
      playerId: topPlayerId
    },
    {
      region: BOTTOM_SIDEBOARD,
      playerId: bottomPlayerId
    }
  ].forEach(({ region, playerId }) => {
    const cardHeight = height * region.height - CARD_PADDING * 2;
    const cardWidth = (cardHeight * 3) / 4;
    const player = state.game.players[playerId];
    layout.push({
      type: "face",
      boxId: player.unitId,
      key: player.unitId,
      x: region.x * width + CARD_PADDING,
      y: region.y * height + CARD_PADDING,
      width: cardWidth,
      height: cardHeight,
      zIndex: CARD_Z_INDEX,
      availableMana: player.availableMana
    });
  });

  return { ...state, frontend: { ...state.frontend, layout } };
}
