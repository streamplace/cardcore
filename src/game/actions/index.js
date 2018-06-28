export * from "./bounce";
export * from "./draw-card";
export * from "./seed-rng";
export * from "./shuffle-deck";
export * from "./start-game";
export * from "./turns";

export const DO_NEXT_ACTION = "DO_NEXT_ACTION";

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

export const PLAY_CREATURE = "PLAY_CREATURE";
export const playCreature = ({ id, privateKey, targets = [] }) => async (
  dispatch,
  getState
) => {
  await dispatch({
    type: PLAY_CREATURE,
    id,
    privateKey,
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
