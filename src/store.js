import { createStore, compose, applyMiddleware } from "redux";
import { gameActionMiddleware, gameMiddleware } from "./game";
import invariant from "redux-immutable-state-invariant";
import reducer from "./reducer";
import thunk from "redux-thunk";
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function() {
  return createStore(
    reducer,
    composeEnhancers(
      applyMiddleware(invariant(), gameActionMiddleware, thunk, gameMiddleware)
    )
  );
}
