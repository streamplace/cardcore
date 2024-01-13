export const TOP_SIDEBOARD = {
  x: 0,
  y: 0,
  width: 1,
  height: 0.25,
};

export const TOP_FIELD = {
  x: 0,
  y: 0.25,
  width: 1,
  height: 0.25,
};

export const BOTTOM_FIELD = {
  x: 0,
  y: 0.5,
  width: 1,
  height: 0.25,
};

export const BOTTOM_SIDEBOARD = {
  x: 0,
  y: 0.75,
  width: 1,
  height: 0.25,
};

export const CARD_PADDING = 5;
export const REGION_Z_INDEX = 10;
export const CARD_Z_INDEX = 100;

export const LAYOUT_NEXT = "LAYOUT_NEXT";
export const layoutNextAction = () => async (dispatch) => {
  console.log("layout next");
  await dispatch({
    type: LAYOUT_NEXT,
  });
};

export function layoutActionReducer(state, action) {
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
  if (!state.frontend.game && state.game) {
    state = {
      ...state,
      frontend: {
        ...state.frontend,
        game: state.game,
        gameQueue: [],
      },
    };
  } else if (
    state.game !== state.frontend.game &&
    !state.frontend.gameQueue.includes(state.game)
  ) {
    state = {
      ...state,
      frontend: {
        ...state.frontend,
        gameQueue: [...state.frontend.gameQueue, state.game],
      },
    };
  }
  if (action.type === "LAYOUT_NEXT") {
    if (state.frontend.gameQueue.length === 0) {
      return state;
    }
    console.log(
      `gameQueue progressing, ${state.frontend.gameQueue.length} states remaining`
    );
    const newQueue = [...state.frontend.gameQueue];
    const newGame = newQueue.shift();
    return {
      ...state,
      frontend: {
        ...state.frontend,
        game: newGame,
        gameQueue: newQueue,
      },
    };
  }
  return state;
}

export function layoutReducer(state, action) {
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
  if (!state.frontend.layout) {
    state = { ...state, frontend: { ...state.frontend, layout: [] } };
  }
  if (!state.frontend.game) {
    return state;
  }
  if (!state.frontend.game.playerOrder) {
    return state;
  }
  let [topPlayerId, bottomPlayerId] = state.frontend.game.playerOrder;
  if (state.frontend.game.playerOrder.includes(state.client.keys.id)) {
    topPlayerId = state.frontend.game.playerOrder.find(
      (id) => id !== state.client.keys.id
    );
    bottomPlayerId = state.client.keys.id;
  }

  for (const playerId of [topPlayerId, bottomPlayerId]) {
    if (
      !state.frontend.game.players[playerId] ||
      !state.frontend.game.players[playerId].hand
    ) {
      return state;
    }
  }
  const { width, height } = state.frontend;

  // cards
  [
    {
      playerId: topPlayerId,
      location: "hand",
      region: TOP_SIDEBOARD,
    },
    {
      playerId: topPlayerId,
      location: "field",
      region: TOP_FIELD,
    },
    {
      playerId: bottomPlayerId,
      location: "field",
      region: BOTTOM_FIELD,
    },
    {
      playerId: bottomPlayerId,
      location: "hand",
      region: BOTTOM_SIDEBOARD,
    },
  ].forEach(({ playerId, location, region }) => {
    layout.push({
      type: "region",
      region,
      x: width * region.x,
      y: height * region.y,
      width: width * region.width,
      height: height * region.height,
      zIndex: REGION_Z_INDEX,
    });
    const player = state.frontend.game.players[playerId];
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
        zIndex: CARD_Z_INDEX,
      });
    });
  });

  // faces
  [
    {
      region: TOP_SIDEBOARD,
      playerId: topPlayerId,
    },
    {
      region: BOTTOM_SIDEBOARD,
      playerId: bottomPlayerId,
    },
  ].forEach(({ region, playerId }) => {
    const cardHeight = height * region.height - CARD_PADDING * 2;
    const cardWidth = (cardHeight * 3) / 4;
    const player = state.frontend.game.players[playerId];
    layout.push({
      type: "face",
      boxId: player.unitId,
      key: player.unitId,
      x: region.x * width + CARD_PADDING,
      y: region.y * height + CARD_PADDING,
      width: cardWidth,
      height: cardHeight,
      zIndex: CARD_Z_INDEX,
      availableMana: player.availableMana,
    });
  });
  return { ...state, frontend: { ...state.frontend, layout } };
}
