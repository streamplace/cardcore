import * as actions from "./game/actions";

const INITIAL_STATE = {
  sync: true,
  desyncStates: {}
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

  return state;
}
