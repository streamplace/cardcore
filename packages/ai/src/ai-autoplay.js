import jsf from "json-schema-faker/dist/json-schema-faker.cjs.js";
import debug from "debug";
import { clientHandleNext } from "@cardcore/client";

export const aiAutoplay = () => async (dispatch, getState) => {
  const log = debug(`cardcore:ai-${getState().client.shortName}`);
  await dispatch(clientHandleNext());
  let state = getState();
  while (state.game.queue.length > 0) {
    const nextSchema = state.game.queue[0];
    const fakeAction = jsf.generate(nextSchema);
    log(`ai dispatching ${JSON.stringify(fakeAction)}`);
    await dispatch(fakeAction);
    state = getState();
  }
};
