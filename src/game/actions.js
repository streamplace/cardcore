export const DO_NEXT_ACTION = "DO_NEXT_ACTION";

export const START_GAME = "START_GAME";
export const DESYNC = "DESYNC";
/**
 * In the event of a desync, we give up on doing anything else and just have clients report their
 * full state tree for debugging and analysis
 */
export const desync = (user, state) => {
  return {
    type: DESYNC,
    user: user,
    state: state
  };
};

export const START_TURN = "START_TURN";
export const startTurn = () => async (dispatch, getState) => {
  const playerId = getState().game.turn;
  await dispatch({ type: START_TURN });
  await dispatch({ type: DRAW_CARD, target: { playerId } });
};

export const DRAW_CARD = "DRAW_CARD";
export const END_TURN = "END_TURN";
export const endTurn = () => async (dispatch, getState) => {
  await dispatch({
    type: END_TURN
  });
  dispatch(startTurn());
};

export const PLAY_CREATURE = "PLAY_CREATURE";
export const playCreature = (unitId, targets = []) => async (
  dispatch,
  getState
) => {
  const card = getState().game.units[unitId];
  await dispatch({
    type: PLAY_CREATURE,
    unitId,
    targets
  });
};

export const CHECK_DEATH = "CHECK_DEATH";
export const checkDeath = () => async (dispatch, getState) => {
  await dispatch({
    type: CHECK_DEATH
  });
};

export const ATTACK = "ATTACK";
export const attack = (attackingUnitId, defendingUnitId) => async dispatch => {
  await dispatch({
    type: ATTACK,
    attackingUnitId,
    defendingUnitId
  });
  dispatch(checkDeath());
};

export const CHANGE_ATTACK = "CHANGE_ATTACK";
export const CHANGE_HEALTH = "CHANGE_HEALTH";
export const DAMAGE = "DAMAGE";
export const SUMMON_CREATURE = "SUMMON_CREATURE";
export const BUFF = "BUFF";
export const BOUNCE = "BOUNCE";

export const JOIN_GAME_START = "JOIN_GAME_START";
export const joinGameStart = () => (dispatch, getState) => {
  dispatch({
    type: JOIN_GAME_START,
    playerId: getState().client.keys.id
  });
};

export const JOIN_GAME_ACCEPT = "JOIN_GAME_ACCEPT";
