import { SEED_RNG } from "./seed-rng";
import { START_TURN } from "./turns";
import { DRAW_CARD } from "./draw-card";
import { SHUFFLE_DECK } from "./shuffle-deck";
import { getStandardDeck, getStandardEmoji } from "./standard";
import { rando, range, uid, makeSchema } from "@cardcore/util";
import ms from "ms";

export const JOIN_GAME = "JOIN_GAME";
export const ORDER_PLAYERS = "ORDER_PLAYERS";
export const START_GAME = "START_GAME";
export const CREATE_GAME = "CREATE_GAME";
export const createGame = () => {
  return {
    type: CREATE_GAME,
    startTime: Date.now(),
  };
};

const INITIAL_PLAYER = {
  mana: 0,
  availableMana: 0,
  hand: [],
  field: [],
  graveyard: [],
  fatigue: 1,
};

export const joinGame = () => ({
  type: JOIN_GAME,
});

export function startGameReducer(state, action) {
  // initialization
  // On this one, clear out both the nextActions queue and the players list... this is the first
  // person joining. Everyone else joins with JOIN_GAME
  if (action.type === CREATE_GAME) {
    // Absurdity check... tracking down an unrelated bug
    if (Math.abs(action.startTime - Date.now()) > ms("1 year")) {
      throw new Error("Invalid start time");
    }
    return {
      ...state,
      game: {
        ...state.game,
        startTime: action.startTime,
        queue: [
          makeSchema({
            type: {
              enum: [JOIN_GAME],
            },
            agent: {
              type: "string",
              not: {
                enum: [action.agent],
              },
            },
          }),
        ],
        nextActions: [
          {
            action: { type: JOIN_GAME },
            // lol lol lol hack hack hack
            notPlayerId: action.agent,
          },
        ],
        allowedActions: {},
        playerOrder: [],
        params: {
          startDraw: 3,
        },
        started: false,
        players: {
          [action.agent]: {},
        },
        units: {},
        randoSeeds: {},
        prev: null,
        boxes: {},
      },
    };
  }

  if (action.type === JOIN_GAME) {
    let lexicalPlayers = [
      ...Object.keys(state.game.players),
      action.agent,
    ].sort();
    return {
      ...state,
      game: {
        ...state.game,
        players: {
          ...state.game.players,
          [action.agent]: {},
        },
        queue: [
          ...state.game.queue,
          makeSchema({
            type: {
              enum: [SEED_RNG],
            },
            agent: {
              enum: [lexicalPlayers[0]],
            },
          }),
          makeSchema({
            type: {
              enum: [ORDER_PLAYERS],
            },
            agent: {
              enum: [lexicalPlayers[0]],
            },
          }),
        ],
        nextActions: [
          {
            playerId: lexicalPlayers[0],
            action: {
              type: SEED_RNG,
            },
          },
          {
            playerId: lexicalPlayers[0],
            action: {
              type: ORDER_PLAYERS,
            },
          },
        ],
      },
    };
  }

  if (action.type === ORDER_PLAYERS) {
    const playerOrder = rando.shuffle(Object.keys(state.game.players).sort());
    return {
      ...state,
      game: {
        ...state.game,
        playerOrder: playerOrder,
        turn: playerOrder[0],
        nextActions: [
          ...playerOrder.map((playerId) => ({
            playerId,
            action: { type: START_GAME },
          })),
          {
            playerId: playerOrder[0],
            action: {
              type: START_TURN,
            },
          },
          ...state.game.nextActions,
        ],
        queue: [
          ...playerOrder.map((playerId) =>
            makeSchema({
              type: {
                enum: [START_GAME],
              },
              agent: {
                enum: [playerId],
              },
            }),
          ),
          makeSchema({
            type: {
              enum: [START_TURN],
            },
            agent: {
              enum: [playerOrder[0]],
            },
          }),
          ...state.game.queue,
        ],
      },
    };
  }

  if (action.type === START_GAME) {
    const playerOrder = state.game.playerOrder;
    const newUnits = {};
    const playerUnitId = uid();
    const deck = [];
    newUnits[playerUnitId] = {
      emoji: getStandardEmoji()[playerOrder.indexOf(action.agent)],
      health: 30,
      attack: 0,
      mana: 0,
    };
    for (const card of getStandardDeck()) {
      const id = uid();
      newUnits[id] = { ...card };
      deck.push(id);
    }
    return {
      ...state,
      game: {
        ...state.game,
        units: {
          ...state.game.units,
          ...newUnits,
        },
        players: {
          ...state.game.players,
          [action.agent]: {
            ...INITIAL_PLAYER,
            unitId: playerUnitId,
            deck,
          },
        },
        nextActions: [
          {
            playerId: action.agent,
            action: {
              type: SHUFFLE_DECK,
              playerId: action.agent,
            },
          },
          ...range(state.game.params.startDraw).map(() => ({
            playerId: action.agent,
            action: {
              type: DRAW_CARD,
              target: {
                player: action.agent,
              },
            },
          })),
          ...state.game.nextActions,
        ],
        queue: [
          makeSchema({
            type: SHUFFLE_DECK,
            agent: action.agent,
            playerId: action.agent,
          }),
          ...range(state.game.params.startDraw).map(() =>
            makeSchema({
              type: DRAW_CARD,
              agent: action.agent,
              target: {
                type: "object",
                additionalProperties: false,
                required: ["player"],
                properties: {
                  player: {
                    enum: [action.agent],
                  },
                },
              },
            }),
          ),
          ...state.game.queue,
        ],
      },
    };
  }

  return state;
}
