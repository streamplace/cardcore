import { Box } from "@cardcore/util";

export const BOX_OPEN = "BOX_OPEN";
export const boxOpen =
  ({ boxId }) =>
  (dispatch, getState) => {
    return dispatch({
      type: "BOX_OPEN",
      boxId,
      privateKey: Box.getPrivate(getState(), boxId),
    });
  };

export const boxOpenReducer = (state, action) => {
  if (action.type === BOX_OPEN) {
    // do a no-op traverse to make sure it worked
    const newState = {
      ...state,
      game: {
        ...state.game,
        boxes: {
          ...state.game.boxes,
          [action.boxId]: {
            ...state.game.boxes[action.boxId],
            privateKey: action.privateKey,
          },
        },
      },
    };
    const value = Box.open(newState, action.boxId);
    if (!value) {
      throw new Error(`couldn't unbox ${action.boxId}`);
    }
    return newState;
  }
  return state;
};
