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
  loadingState: true
};

export default function reducer(state = INITIAL_STATE, action) {
  if (action.type === actions.JOIN_GAME_ACCEPT) {
    return {
      ...state,
      started: true
    };
  }
  if (action.type === clientActions.CLIENT_GENERATE_IDENTITY) {
    return { ...state, keys: action.keys };
  }

  if (action.type === clientActions.CLIENT_PLAY_CREATURE) {
    return {
      ...state,
      targetQueue: action.unit.onSummon.map(onSummon => onSummon.target),
      playingBoxId: action.boxId
    };
  }

  if (action.type === clientActions.CLIENT_TARGET_CANCEL) {
    return {
      ...state,
      targetQueue: [],
      targets: [],
      availableTargets: null,
      playingBoxId: null
    };
  }

  if (action.type === actions.DESYNC) {
    return {
      ...state,
      sync: false,
      desyncStates: {
        ...state.desyncStates,
        [action.user]: action.state
      }
    };
  }
  if (action.type === clientActions.CLIENT_START_TARGET) {
    return {
      ...state,
      availableTargets: action.availableTargets
    };
  }

  if (action.type === clientActions.CLIENT_PICK_TARGET) {
    return {
      ...state,
      targetQueue: state.targetQueue.slice(1),
      targets: [...state.targets, action.unitId]
    };
  }

  if (action.type === clientActions.CLIENT_LOAD_STATE_START) {
    return {
      ...state,
      loadingState: true
    };
  }

  if (
    action.type === clientActions.CLIENT_LOAD_STATE_DONE ||
    action.type === actions.CREATE_GAME
  ) {
    return {
      ...state,
      loadingState: false
    };
  }

  if (action.type === actions.PLAY_CREATURE) {
    return {
      ...state,
      availableTargets: null,
      targets: []
    };
  }

  return state;
}
