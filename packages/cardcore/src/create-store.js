import { createStore, compose, applyMiddleware } from "redux";
import createGameActionMiddleware from "./game-action-middleware";
import createGameMiddleware from "./game-middleware";
// import invariant from "redux-immutable-state-invariant";
import { createReducer } from "./reducer";
import thunk from "redux-thunk";

export default function(gameModules, clientModules) {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  return createStore(
    createReducer(gameModules, clientModules),
    composeEnhancers(
      applyMiddleware(
        createGameActionMiddleware(gameModules),
        thunk,
        createGameMiddleware(gameModules, clientModules)
      )
    )
  );
}
