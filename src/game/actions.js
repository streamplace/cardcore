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
export const playCreature = (unitId, playerId) => (dispatch, getState) => {
  const card = getState().game.units[unitId];
  dispatch({
    type: PLAY_CREATURE,
    unitId
  });
  if (card.onSummon) {
    let i;
    for (i = 0; i <= card.onSummon.length - 1; i++) {
      dispatch({
        type: card.onSummon[i].type,
        value: card.onSummon[i].value,
        unitId,
        playerId
      });
    }
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
