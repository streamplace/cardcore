export * from "./resize";
export * from "./card-drop";
export * from "./layout";

export function frontendReducer(state, action) {
  if (!state.frontend) {
    return {
      ...state,
      frontend: {}
    };
  }
  return state;
}
