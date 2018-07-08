const INITIAL_STATE = {
  nextActions: [],
  playerOrder: [],
  params: {
    startDraw: 3
  },
  started: false,
  players: {},
  units: {},
  randoSeeds: {}
};

export default function reducer(state = INITIAL_STATE, action) {
  // special logic to clean out the queue if we're executing a queued action
  if (
    state.nextActions[0] &&
    (action._sender === state.nextActions[0].playerId ||
      action._sender !== state.nextActions[0].notPlayerId) && // omfg hack
    action.type === state.nextActions[0].action.type
  ) {
    state = {
      ...state,
      nextActions: state.nextActions.slice(1)
    };
  }

  return state;
}
