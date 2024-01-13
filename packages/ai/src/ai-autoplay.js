import jsf from "json-schema-faker";
import debug from "debug";
import { clientHandleNext } from "@cardcore/client";

export const AI_FAKE_ACTION = "AI_FAKE_ACTION";
export const aiFakeAction = (action) => async (dispatch) => {
  await dispatch({
    type: AI_FAKE_ACTION,
    action: action,
  });
  return await dispatch(action);
};

export const aiAutoplay = () => async (dispatch, getState) => {
  const log = debug(`cardcore:ai-${getState().client.shortName}`);
  await dispatch(clientHandleNext());
  let state = getState();
  while (state.game.queue.length > 0) {
    const nextSchema = state.game.queue[0];
    console.log(nextSchema);
    const fakeAction = jsf.generate(nextSchema);
    delete fakeAction.signature;
    delete fakeAction.agent;
    log(`ai dispatching ${JSON.stringify(fakeAction)}`);
    await dispatch(aiFakeAction(fakeAction));
    state = getState();
  }
};
