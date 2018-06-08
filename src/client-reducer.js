import * as actions from "./game/actions";
import * as clientActions from "./client-actions";

const INITIAL_STATE = {
  sync: true,
  desyncStates: {},
  targettingUnit: null,
  targettingUnitId: null,
  targets: []
};

export default function reducer(state = INITIAL_STATE, action) {
  if (action.type === actions.START_GAME) {
    return {
      ...state,
      currentPlayer: action.currentPlayer
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
      targettingUnit: action.unit,
      targettingUnitId: action.unitId
    };
  }
  if (action.type === actions.PLAY_CREATURE) {
    return {
      ...state,
      targettingUnit: null,
      targettingUnitId: null,
      targets: []
    };
  }

  if (action.type === clientActions.CLIENT_PICK_TARGET) {
    return {
      ...state,
      targets: [...state.targets, action.unitId]
    };
  }
  return state;
}
