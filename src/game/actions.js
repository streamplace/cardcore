import { shuffled } from "../util";
export const START_GAME = "START_GAME";
/**
 * Start the game!
 */
export const startGame = ({ players, currentPlayer }) => (
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
  dispatch({
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
  dispatch(startTurn());
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
export const playCreature = unitId => {
  return {
    type: PLAY_CREATURE,
    unitId
  };
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
export const changeAllAttacks = value => {
  return {
    type: CHANGE_ALL_ATTACKS,
    value
  };
};

export const CHANGE_ALL_HEALTH = "CHANGE_ALL_HEALTH";
export const changeAllHealth = value => {
  return {
    type: CHANGE_ALL_HEALTH,
    value
  };
};
