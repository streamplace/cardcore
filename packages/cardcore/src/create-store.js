import { createStore, compose, applyMiddleware } from "redux";
import gameActionMiddleware from "./game-action-middleware";
import { gameMiddleware } from "./game-middleware";
import invariant from "redux-immutable-state-invariant";
import { createReducer } from "./reducer";
import thunk from "redux-thunk";

export default function(...modules) {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  return createStore(
    createReducer(...modules),
    composeEnhancers(
      applyMiddleware(gameActionMiddleware, thunk, gameMiddleware)
    )
  );
}
