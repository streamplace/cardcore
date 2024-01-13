export const FRONTEND_RESIZE = "FRONTEND_RESIZE";
export const frontendResize = ({ width, height }) => {
  return {
    type: FRONTEND_RESIZE,
    width,
    height,
  };
};

export const frontendResizeReducer = (state, action) => {
  if (action.type === FRONTEND_RESIZE) {
    return {
      ...state,
      frontend: {
        ...state.frontend,
        width: action.width,
        height: action.height,
      },
    };
  }

  return state;
};
