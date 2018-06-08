import { shuffled } from "../util";
export const START_GAME = "START_GAME";
/**
 * Start the game!
 */
export const startGame = ({ players, currentPlayer }) => async (
  dispatch,
  getState
) => {
  const { started } = getState().game;
  if (started) {
    // idk why this is happening, hack hack hack
    return;
  }
  const shuffledPlayers = {};
  for (const [playerId, player] of Object.entries(players)) {
    shuffledPlayers[playerId] = {
      ...player,
      deck: shuffled(player.deck)
    };
  }
  await dispatch({
    type: START_GAME,
    players: shuffledPlayers,
    currentPlayer,
    playerOrder: shuffled(Object.keys(players))
  });
  const { params, playerOrder } = getState().game;
  for (const playerId of playerOrder) {
    for (let i = 0; i < params.startDraw; i += 1) {
      dispatch({ type: DRAW_CARD, playerId });
    }
  }
  await dispatch(startTurn());
};

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
export const startTurn = () => (dispatch, getState) => {
  const playerId = getState().game.turn;
  dispatch({ type: START_TURN });
  dispatch({ type: DRAW_CARD, playerId });
};

export const DRAW_CARD = "DRAW_CARD";
export const END_TURN = "END_TURN";
export const endTurn = () => (dispatch, getState) => {
  dispatch({
    type: END_TURN
  });
  dispatch(startTurn());
};

export const PLAY_CREATURE = "PLAY_CREATURE";
export const playCreature = (unitId, targets = []) => (dispatch, getState) => {
  const card = getState().game.units[unitId];
  dispatch({
    type: PLAY_CREATURE,
    unitId
  });

  for (let i = 0; i < card.onSummon.length; i++) {
    dispatch({
      ...card.onSummon[i],
      playerId: getState().game.turn,
      target: { ...card.onSummon[i].target, unitId: targets[i] },
      unitId
    });
    dispatch(checkDeath());
  }
};

export const CHECK_DEATH = "CHECK_DEATH";
export const checkDeath = () => {
  return {
    type: CHECK_DEATH
  };
};

export const ATTACK = "ATTACK";
export const attack = (attackingUnitId, defendingUnitId) => dispatch => {
  dispatch({
    type: ATTACK,
    attackingUnitId,
    defendingUnitId
  });
  dispatch(checkDeath());
};

export const CHANGE_ALL_ATTACKS = "CHANGE_ALL_ATTACKS";
export const CHANGE_ALL_HEALTH = "CHANGE_ALL_HEALTH";
export const DAMAGE = "DAMAGE";
