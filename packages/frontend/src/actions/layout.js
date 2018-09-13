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

export function layoutReducer(state) {
  const layout = [];
  if (
    !state.frontend ||
    typeof state.frontend.width !== "number" ||
    !state.game ||
    !state.game.playerOrder
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
        x: i * cardWidth + leftOffset,
        y: y,
        playerId,
        location
      });
    });
  });

  return { ...state, frontend: { ...state.frontend, layout } };
}
