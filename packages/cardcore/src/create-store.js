import { createStore, compose, applyMiddleware } from "redux";
import createGameActionMiddleware from "./game-action-middleware";
import createGameMiddleware from "./game-middleware";
// import invariant from "redux-immutable-state-invariant";
import { createReducer } from "./reducer";

export default function(gameModules, clientModules) {
  const middlewares = Object.entries({
    ...gameModules,
    ...clientModules
  })
    .filter(([name]) => {
      return name.endsWith("Middleware");
    })
    .map(([_, value]) => value);
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  return createStore(
    createReducer(gameModules, clientModules),
    composeEnhancers(
      applyMiddleware(
        createGameMiddleware(gameModules, clientModules),
        ...middlewares.map(creator => creator(gameModules, clientModules))
      )
    )
  );
}
