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
