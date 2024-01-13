import { Box } from "@cardcore/util";

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
        gameExpiry: 0,
        cardAnimations: {},
      },
    };
  }
  if (action.type === "ATTACK") {
    console.log(action);
    state = {
      ...state,
      frontend: {
        ...state.frontend,
        gameQueue: [
          ...state.frontend.gameQueue,
          {
            game: state.frontend.gamePrev,
            expiry: 1000,
            cardAnimations: {
              [action.attackingUnitId]: {
                offset: {
                  x: 300,
                  y: -150,
                },
              },
            },
          },
          {
            game: state.frontend.gamePrev,
            expiry: 1000,
            cardAnimations: {
              [action.attackingUnitId]: {
                moveTo: action.defendingUnitId,
              },
            },
          },
          {
            game: state.frontend.gamePrev,
            expiry: 1000,
            cardAnimations: {
              [action.attackingUnitId]: {
                offset: {
                  x: 300,
                  y: -150,
                },
              },
            },
          },
          {
            game: state.frontend.game,
            expiry: 1000,
            cardAnimations: {},
          },
        ],
      },
    };
  }

  if (action.type === "PLAY_CARD_DONE") {
    state = {
      ...state,
      frontend: {
        ...state.frontend,
        gameQueue: [
          ...state.frontend.gameQueue,
          {
            game: state.gamePrev,
            expiry: 1000,
            cardAnimations: {},
          },
        ],
      },
    };
  }

  const now = Date.now();
  if (state.frontend.gameExpiry <= now) {
    // something else in the animation queue, progress it
    if (state.frontend.gameQueue.length > 1) {
      const newQueue = [...state.frontend.gameQueue];
      const { game, expiry, cardAnimations } = newQueue.shift();
      console.log(`gameQueue progressing, ${newQueue.length} states remaining`);
      state = {
        ...state,
        frontend: {
          ...state.frontend,
          gameQueue: newQueue,
          game: game,
          gameExpiry: now + expiry,
          cardAnimations: cardAnimations,
        },
      };
    }
    // queue empty, catch the frontend state up with the game state
    else {
      state = {
        ...state,
        frontend: {
          ...state.frontend,
          game: state.game,
          cardAnimations: {},
        },
      };
    }
  }

  // if (action.type === "LAYOUT_NEXT") {
  //   if (state.frontend.gameQueue.length === 0) {
  //     return state;
  //   }
  //   console.log(
  //     `gameQueue progressing, ${state.frontend.gameQueue.length} states remaining`
  //   );
  //   const newQueue = [...state.frontend.gameQueue];
  //   const newGame = newQueue.shift();
  //   return {
  //     ...state,
  //     frontend: {
  //       ...state.frontend,
  //       game: newGame,
  //       gameQueue: newQueue,
  //     },
  //   };
  // }
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
      const x = i * cardWidth + leftOffset;
      layout.push({
        type: "card",
        key: boxId,
        boxId: boxId,
        height: cardHeight,
        width: cardWidth,
        x: x,
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

  for (const [cardId, anim] of Object.entries(state.frontend.cardAnimations)) {
    try {
      const card = layout.find((x) => Box.traverse(state, x.key) === cardId);
      if (!card) {
        throw new Error(`animation couldn't find card ${cardId}`);
      }
      if (anim.moveTo) {
        const destCard = layout.find(
          (x) => Box.traverse(state, x.key) === anim.moveTo
        );
        if (!card) {
          throw new Error(
            `animation couldn't find destination card ${destCard}`
          );
        }
        card.zIndex = destCard.zIndex + 1;
        if (card.y < destCard.y) {
          card.x = destCard.x;
          card.y = destCard.y - destCard.height;
        }
      }
      if (anim.offset) {
        card.x += anim.offset.x;
        card.y += anim.offset.y;
      }
    } catch (e) {
      console.log(e.message);
      console.log(layout);
    }
  }

  return {
    ...state,
    frontend: { ...state.frontend, layout, gamePrev: state.game },
  };
}
