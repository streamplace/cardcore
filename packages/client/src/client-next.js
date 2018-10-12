import * as gameActions from "@cardcore/game";

// Build a mapping of action type strings to cooresponding action creators
const actionMap = {};
Object.keys(gameActions).forEach(key => {
  const value = gameActions[key];
  if (typeof value !== "string" || key !== value) {
    return;
  }
  const camelCase = value
    .split("_")
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join("");
  const actionCreator = camelCase[0].toLowerCase() + camelCase.slice(1);
  if (gameActions[actionCreator]) {
    actionMap[value] = gameActions[actionCreator];
  }
});

export const clientNext = () => (dispatch, getState) => {
  const state = getState();
  const me = state.client.keys.id;
  // Action resolved! Good job, everyone! If we can take an action immediately, do so.
  if (state.game.nextActions.length > 0) {
    const {
      playerId,
      notPlayerId,
      action: nextAction
    } = state.game.nextActions[0];
    console.log({ playerId, notPlayerId, nextAction });
    if (!gameActions[nextAction.type]) {
      throw new Error(
        `${nextAction.type} is queued but we don't have a definition`
      );
    }
    if (
      (playerId && playerId === me) ||
      (notPlayerId && notPlayerId !== me) // hack hack hack
    ) {
      console.log("here");
      // Does that action have an action creator? Great, delegate to them.
      if (actionMap[nextAction.type]) {
        console.log(`dispatching ${nextAction.type} with creator`);
        dispatch(actionMap[nextAction.type](nextAction));
      }

      // If it doesn't, just dispatch the dang action.
      else {
        console.log(`dispatching ${nextAction.type} without creator`);
        dispatch(nextAction);
      }
    }
  }
};
