import signalhub from "signalhub";
import ssbKeys from "ssb-keys";

export const REMOTE_ACTION = Symbol("REMOTE_ACTION");

const me = ssbKeys.generate();

const gameMiddleware = store => {
  const server = `${document.location.protocol}//${
    document.location.hostname
  }:3001`;
  const hub = signalhub("game", [server]);
  hub.subscribe("default-game").on("data", action => {
    if (action._sender === me.id) {
      return;
    }
    // temporary hack to put two players on opposite sides
    if (action.type === "START_GAME") {
      action.currentPlayer = action.playerOrder.filter(
        x => x !== action.currentPlayer
      )[0];
    }
    action = {
      ...action,
      [REMOTE_ACTION]: true
    };
    store.dispatch(action);
  });
  return next => action => {
    if (!action[REMOTE_ACTION]) {
      hub.broadcast("default-game", {
        ...action,
        _sender: me.id
      });
    }
    next(action);
  };
};

export default gameMiddleware;
