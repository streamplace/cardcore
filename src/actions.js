export const DRAW_CARD = "DRAW_CARD";
export const END_TURN = "END_TURN";
export const endTurn = () => (dispatch, getState) => {
  dispatch({
    type: END_TURN
  });
  const playerId = getState().turn;
  dispatch({
    type: DRAW_CARD,
    playerId
  });
};

export const PLAY_CREATURE = "PLAY_CREATURE";
export const playCreature = card => {
  return {
    type: PLAY_CREATURE,
    card
  };
};
