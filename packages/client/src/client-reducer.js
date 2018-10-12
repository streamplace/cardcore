import * as actions from "@cardcore/game";
import * as clientActions from "./client-actions";

const INITIAL_STATE = {
  sync: true,
  desyncStates: {},
  playingBoxId: null,
  targetQueue: [],
  targets: [],
  keys: {},
  started: false,
  loadingState: true,
  closed: false
};

export default function clientReducer(state, action) {
  if (state.client === undefined) {
    state = {
      ...state,
      client: INITIAL_STATE
    };
  }
  if (action.type === actions.JOIN_GAME_ACCEPT) {
    return {
      ...state,
      client: {
        ...state.client,
        started: true
      }
    };
  }
  if (action.type === clientActions.CLIENT_GENERATE_IDENTITY) {
    return { ...state, client: { ...state.client, keys: action.keys } };
  }

  if (action.type === clientActions.CLIENT_PLAY_CREATURE) {
    return {
      ...state,
      client: {
        ...state.client,
        targetQueue: action.unit.onSummon.map(onSummon => onSummon.target),
        playingBoxId: action.boxId
      }
    };
  }

  if (action.type === clientActions.CLIENT_TARGET_CANCEL) {
    return {
      ...state,
      client: {
        ...state.client,
        targetQueue: [],
        targets: [],
        availableTargets: null,
        playingBoxId: null
      }
    };
  }

  if (action.type === actions.DESYNC) {
    return {
      ...state,
      client: {
        ...state.client,
        sync: false,
        desyncStates: {
          ...state.client.desyncStates,
          [action.user]: action.state
        }
      }
    };
  }
  if (action.type === clientActions.CLIENT_START_TARGET) {
    return {
      ...state,
      client: {
        ...state.client,
        availableTargets: action.availableTargets
      }
    };
  }

  if (action.type === clientActions.CLIENT_PICK_TARGET) {
    return {
      ...state,
      client: {
        ...state.client,
        targetQueue: state.client.targetQueue.slice(1),
        targets: [...state.client.targets, action.unitId]
      }
    };
  }

  if (action.type === clientActions.CLIENT_LOAD_STATE_START) {
    return {
      ...state,
      client: {
        ...state.client,
        loadingState: true
      }
    };
  }

  if (
    action.type === clientActions.CLIENT_LOAD_STATE_DONE ||
    action.type === actions.CREATE_GAME
  ) {
    return {
      ...state,
      client: {
        ...state.client,
        loadingState: false
      }
    };
  }

  if (action.type === actions.PLAY_CREATURE) {
    return {
      ...state,
      client: {
        ...state.client,
        availableTargets: null,
        targets: []
      }
    };
  }

  if (action.type === clientActions.CLIENT_STORE_ACTION_MAP) {
    return {
      ...state,
      client: {
        actionMap: action.actionMap
      }
    };
  }

  if (action.type === clientActions.CLIENT_POLL) {
    return {
      ...state,
      client: {
        ...state.client,
        polling: action.polling
      }
    };
  }

  if (action.type === clientActions.CLIENT_CLOSE) {
    return {
      ...state,
      client: {
        ...state.client,
        closed: true
      }
    };
  }

  return state;
}
