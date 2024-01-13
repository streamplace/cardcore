import { Box, getLeftPlayer, makeSchema, target } from "@cardcore/util";
import { PLAY_CREATURE } from "./play-creature";
import { START_GAME } from "./start-game";
import { STANDARD_ACTION } from "./standard-action";

export const PLAY_CARD = "PLAY_CARD";
export const playCard = ({ boxId }) => ({
  type: "PLAY_CARD",
  boxId,
});

export const PLAY_CARD_DONE = "PLAY_CARD_DONE";

export const REVEAL_CARD = "REVEAL_CARD";
export const revealCard =
  ({ boxId }) =>
  (dispatch, getState) => {
    const privateKey = Box.getPrivate(getState(), boxId);
    return dispatch({
      type: "REVEAL_CARD",
      boxId,
      privateKey,
    });
  };

// TODO: are you adding not-creatures? go here!
export const playCardReducer = (state, action) => {
  if (action.type === START_GAME) {
    return {
      ...state,
      game: {
        ...state.game,
        allowedActions: {
          ...state.game.allowedActions,
          [PLAY_CARD]: true,
        },
      },
    };
  }

  if (action.type === PLAY_CARD) {
    let nextActions = [
      ...state.game.nextActions,
      {
        playerId: action.agent,
        action: {
          type: PLAY_CARD_DONE,
          boxId: action.boxId,
        },
      },
      {
        playerId: action.agent,
        action: {
          type: STANDARD_ACTION,
        },
      },
    ];
    let queue = [
      ...state.game.queue,
      makeSchema({
        type: PLAY_CARD_DONE,
        agent: action.agent,
        boxId: action.boxId,
      }),
      makeSchema({
        type: STANDARD_ACTION,
        agent: action.agent,
      }),
    ];
    if (!state.game.units[action.boxId]) {
      nextActions = [
        {
          playerId: getLeftPlayer(action.agent, state.game.playerOrder),
          action: {
            type: REVEAL_CARD,
            boxId: action.boxId,
          },
        },
        ...nextActions,
      ];
      queue = [
        makeSchema({
          type: REVEAL_CARD,
          agent: getLeftPlayer(action.agent, state.game.playerOrder),
          boxId: action.boxId,
          privateKey: {
            type: "string",
          },
        }),
        ...queue,
      ];
    }
    return {
      ...state,
      game: {
        ...state.game,
        nextActions: nextActions,
        queue: queue,
      },
    };
  }

  if (action.type === PLAY_CARD_DONE) {
    // If we get here, we should know the contents...
    const cardId = Box.traverse(state, action.boxId);
    const card = state.game.units[cardId];
    return {
      ...state,
      game: {
        ...state.game,
        nextActions: [
          {
            playerId: action.agent,
            action: {
              type: PLAY_CREATURE,
              boxId: action.boxId,
            },
          },
          ...state.game.nextActions,
        ],
        queue: [
          makeSchema({
            type: PLAY_CREATURE,
            agent: action.agent,
            boxId: action.boxId,
            targets: {
              type: "array",
              minItems: card.onSummon.length,
              maxItems: card.onSummon.length,
              items: card.onSummon.map((onSummon) => {
                if (onSummon.target.count === undefined) {
                  return { enum: [null] };
                }
                if (onSummon.target.random) {
                  return { enum: [null] };
                }
                const targets = Object.keys(
                  target(state, onSummon.target),
                ).sort();
                if (targets.length > 0) {
                  return { enum: targets };
                }
                return { enum: [null] };
              }),
            },
          }),
          ...state.game.queue,
        ],
      },
    };
  }

  if (action.type === REVEAL_CARD) {
    const box = state.game.boxes[action.boxId];
    const newBox = {
      ...box,
      privateKey: action.privateKey,
    };
    state = {
      ...state,
      game: {
        ...state.game,
        boxes: {
          ...state.game.boxes,
          [action.boxId]: newBox,
        },
      },
    };
    const contents = Box.open(state, action.boxId);
    // if there's another box in here, pass to the player on our left
    let nextActions = state.game.nextActions;
    let queue = state.game.queue;
    if (state.game.boxes[contents]) {
      nextActions = [
        {
          playerId: getLeftPlayer(action.agent, state.game.playerOrder),
          action: {
            type: REVEAL_CARD,
            boxId: contents,
          },
        },
        ...nextActions,
      ];
      queue = [
        makeSchema({
          type: REVEAL_CARD,
          agent: getLeftPlayer(action.agent, state.game.playerOrder),
          boxId: contents,
          privateKey: {
            type: "string",
          },
        }),
        ...queue,
      ];
    } else if (!state.game.units[contents]) {
      throw new Error(`invalid card: ${contents}`);
    }
    return {
      ...state,
      game: {
        ...state.game,
        nextActions: nextActions,
        queue: queue,
      },
    };
  }
  return state;
};
